"""Canlıdaki QUIZ sorularını (UsageKind = 2) ve ders hiyerarşisini SALT OKUNUR çeker. Deneme soruları çekilmez.
Çıktı: ../veri/hiyerarsi.json, ../veri/quiz/<Kategori>/<AltKategori>/<LessonMainKod>.jsonl, ../veri/disa_aktarim.json"""
import json, os, re, datetime
from collections import defaultdict
from database import connect, query

from paths import DATA as KOK
QUIZ = "QuestionId IN (SELECT Id FROM Questions WHERE UsageKind = 2)"


def s(v):
    if v is None:
        return None
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.isoformat()
    return v if isinstance(v, (int, float, str, bool)) else str(v)


def dosya_adi(t):
    return re.sub(r'[\\/:*?"<>|]+', "_", t or "_").strip() or "_"


con = connect()


def q(sql):
    t = datetime.datetime.now()
    r = [{k: s(v) for k, v in x.items()} for x in query(con, sql)]
    print(f"  {len(r):>7} satır  {(datetime.datetime.now() - t).seconds}s  {sql[:90]}", flush=True)
    return r


cats = {r["Id"]: r for r in q("SELECT Id, Code, Name FROM Categories")}
csubs = {r["Id"]: r for r in q("SELECT Id, CategoryId, Code, Name FROM CategorySubs")}
lessons = {r["Id"]: r for r in q("SELECT Id, CategorySubId FROM Lessons")}
mains = {r["Id"]: r for r in q("SELECT Id, LessonId, Code, Name, OrderIndex, IsActive FROM LessonMains")}
subs = {r["Id"]: r for r in q("SELECT Id, LessonMainId, Code, Name, OrderIndex, IsActive FROM LessonSubs")}
mikros = {r["Id"]: r for r in q("SELECT Id, LessonSubId, Code, Name, OrderIndex, IsActive FROM LessonMikros")}


def main_yolu(main_id):
    m = mains.get(main_id)
    if not m:
        return None
    cs = csubs.get(lessons.get(m["LessonId"], {}).get("CategorySubId"))
    c = cats.get(cs["CategoryId"]) if cs else None
    return {"category": c and c["Code"], "categorySub": cs and cs["Code"], "categorySubName": cs and cs["Name"],
            "lessonMainId": m["Id"], "lessonMainCode": m["Code"], "lessonMainName": m["Name"]}


mikro_by_sub, sub_by_main = defaultdict(list), defaultdict(list)
for mk in mikros.values():
    mikro_by_sub[mk["LessonSubId"]].append(mk)
for sb in subs.values():
    sub_by_main[sb["LessonMainId"]].append(sb)
hiy = []
for m in sorted(mains.values(), key=lambda x: x["OrderIndex"]):
    y = main_yolu(m["Id"])
    y["isActive"] = m["IsActive"]
    y["subs"] = [{"id": sb["Id"], "code": sb["Code"], "name": sb["Name"], "isActive": sb["IsActive"],
                  "mikros": [{"id": mk["Id"], "code": mk["Code"], "name": mk["Name"], "isActive": mk["IsActive"]}
                             for mk in sorted(mikro_by_sub[sb["Id"]], key=lambda x: x["OrderIndex"])]}
                 for sb in sorted(sub_by_main[m["Id"]], key=lambda x: x["OrderIndex"])]
    hiy.append(y)
os.makedirs(KOK, exist_ok=True)
json.dump(hiy, open(os.path.join(KOK, "hiyerarsi.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

quizzes = {r["Id"]: r for r in q("SELECT Id, LessonMainId, LessonSubId, Title, IsPublished, StepIndex, Difficulty, SourceKind, "
                                 "CASE WHEN OwnerStudentUserId IS NULL THEN 0 ELSE 1 END AS OgrenciyeOzel, CompletedAttemptCount FROM Quizzes")}
quiz_by_q = defaultdict(list)
for r in q("SELECT QuizId, QuestionId, OrderIndex, TimesAnswered, TimesCorrect FROM QuizItems"):
    quiz_by_q[r["QuestionId"]].append(r)
opts = defaultdict(list)
for r in q(f"SELECT Id, QuestionId, OptionKey, Stem, ImageUrl, OrderIndex FROM QuestionOptions WHERE {QUIZ}"):
    opts[r["QuestionId"]].append(r)
correct = {r["QuestionId"]: r["CorrectOptionId"] for r in q(f"SELECT QuestionId, CorrectOptionId FROM QuestionOptionCorrectAnswers WHERE {QUIZ}")}
figs = defaultdict(list)
for r in q(f"SELECT Id, QuestionId, Code, Kind, Title, Alt, ImageUrl, DataJson, OrderIndex, CreatedAt, UpdatedAt FROM QuestionFigures WHERE {QUIZ}"):
    figs[r.pop("QuestionId")].append(r)
spans = defaultdict(list)
for r in q(f"SELECT QuestionId, SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence FROM QuestionMarkupSpans WHERE {QUIZ}"):
    spans[r.pop("QuestionId")].append(r)
sols = defaultdict(list)
for r in q(f"SELECT Id, QuestionId, Type, Title, ContentText, StructuredContentJson, Url, OrderIndex, IsActive, UpdatedAt FROM QuestionSolutions WHERE {QUIZ}"):
    sols[r.pop("QuestionId")].append(r)
sorular = q("SELECT Id, Code, Stem, StemImageUrl, CreatedAt, UpdatedAt, LessonSubId, LessonMikroId, TargetDifficultyLevel, "
            "GraphicExpectation, QuestionFamily, SourceKind, UsageKind FROM Questions WHERE UsageKind = 2")

cikti = defaultdict(list)
for r in sorular:
    qid = r["Id"]
    o = sorted(opts.get(qid, []), key=lambda x: x["OrderIndex"])
    cid = correct.get(qid)
    quizler = []
    for x in quiz_by_q.get(qid, []):
        qz = quizzes.get(x["QuizId"], {})
        quizler.append({"quizId": x["QuizId"], "title": qz.get("Title"), "lessonMainId": qz.get("LessonMainId"), "lessonSubId": qz.get("LessonSubId"),
                        "isPublished": qz.get("IsPublished"), "stepIndex": qz.get("StepIndex"), "difficulty": qz.get("Difficulty"),
                        "sourceKind": qz.get("SourceKind"), "ogrenciyeOzel": bool(qz.get("OgrenciyeOzel")),
                        "orderIndex": x["OrderIndex"], "timesAnswered": x["TimesAnswered"], "timesCorrect": x["TimesCorrect"]})
    main_id = subs[r["LessonSubId"]]["LessonMainId"] if r["LessonSubId"] in subs else next((z["lessonMainId"] for z in quizler if z.get("lessonMainId")), None)
    yol = main_yolu(main_id) if main_id else None
    sb, mk = subs.get(r["LessonSubId"]), mikros.get(r["LessonMikroId"])
    kayit = {
        "id": qid, "code": r["Code"], "usageKind": "Quiz",
        "sourceKind": {0: "System", 1: "SinoAI", 2: "Manual", 3: "AdminTest"}.get(r["SourceKind"], r["SourceKind"]),
        "hierarchy": {**(yol or {}), "lessonSubId": r["LessonSubId"], "lessonSubCode": sb and sb["Code"], "lessonSubName": sb and sb["Name"],
                      "lessonMikroId": r["LessonMikroId"], "lessonMikroCode": mk and mk["Code"], "lessonMikroName": mk and mk["Name"],
                      "mikroBelongsToSub": (mk["LessonSubId"] == r["LessonSubId"]) if mk else None},
        "stem": r["Stem"], "stemImageUrl": r["StemImageUrl"],
        "options": [{"id": x["Id"], "key": x["OptionKey"], "text": x["Stem"], "imageUrl": x["ImageUrl"], "order": x["OrderIndex"]} for x in o],
        "correctKey": next((x["OptionKey"] for x in o if x["Id"] == cid), None), "correctOptionId": cid,
        "figures": sorted(figs.get(qid, []), key=lambda x: x["OrderIndex"]),
        "markupSpans": spans.get(qid, []),
        "solutions": sorted(sols.get(qid, []), key=lambda x: x["OrderIndex"]),
        "meta": {k: r[k] for k in ("TargetDifficultyLevel", "GraphicExpectation", "QuestionFamily", "CreatedAt", "UpdatedAt")},
        "quizzes": quizler,
    }
    yer = os.path.join(dosya_adi(yol["category"]), dosya_adi(yol["categorySub"]), dosya_adi(yol["lessonMainCode"]) + ".jsonl") if yol else "_KonusuBelirsiz.jsonl"
    cikti[yer].append(kayit)

for yer, kayitlar in cikti.items():
    p = os.path.join(KOK, "quiz", yer)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        for k in sorted(kayitlar, key=lambda x: (x["hierarchy"].get("lessonSubCode") or "", x["code"] or "")):
            f.write(json.dumps(k, ensure_ascii=False) + "\n")
json.dump({"exportedAtUtc": datetime.datetime.utcnow().isoformat(), "questionCount": len(sorular),
           "files": {k: len(v) for k, v in sorted(cikti.items())}},
          open(os.path.join(KOK, "disa_aktarim.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("toplam quiz sorusu:", len(sorular), "dosya:", len(cikti))
