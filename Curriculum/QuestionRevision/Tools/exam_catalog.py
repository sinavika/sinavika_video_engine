"""Deneme hazırlığı için canlı kataloğu SALT OKUNUR çeker: şablonlar, bölümler, bölüm dersleri, konu ağacı, mevcut kodlar.
Kullanım: python exam_catalog.py
Çıktı:    Outputs/QuestionRevision/Exams/katalog.json"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import connect, query
from exam_common import CATALOG, SUBS

SINAVIKA_PUBLISHER = "F50B6055-65C6-4A46-A406-68BBF2222F29"  # API: ExamGenerationPublisherDefaults.SinavikaPublisherId


def s(v):
    return str(v).upper() if v is not None else None


con = connect()
out = {"publisherId": SINAVIKA_PUBLISHER, "subs": {}, "templates": []}
for t in query(con, "SELECT Id, Code, Name, GeneralExamsPerMonth g, SectionExamsPerMonth sx, IsActive a, OrderIndex o FROM dbo.ExamTemplates ORDER BY OrderIndex"):
    ses = query(con, """SELECT ts.Id, cs.Code sub, ts.OrderIndex o, ts.HasSectionExams hs FROM dbo.ExamTemplateSessions ts
                        JOIN dbo.CategorySubs cs ON cs.Id = ts.CategorySubId WHERE ts.ExamTemplateId = ? ORDER BY ts.OrderIndex""", t["Id"])
    out["templates"].append({"id": s(t["Id"]), "code": t["Code"], "name": t["Name"], "generalPerMonth": t["g"], "sectionPerMonth": t["sx"],
                             "active": bool(t["a"]), "sessions": [{"id": s(x["Id"]), "sub": x["sub"], "order": x["o"], "hasSectionExams": bool(x["hs"])} for x in ses]})

for kod in SUBS:
    sub = query(con, "SELECT Id, Name FROM dbo.CategorySubs WHERE Code = ?", kod)[0]
    feats = query(con, "SELECT Id, DefaultQuestionCount q, DefaultDurationMinutes d, DefaultQuestionOptionCount oc, Version v FROM dbo.CategoryFeatures WHERE CategorySubId = ? ORDER BY Version DESC", sub["Id"])
    feat = feats[0]
    secs = query(con, """SELECT Id, Code, Name, OrderIndex o, QuestionCount q, IsAlternative alt, AlternativeGroupCode ag, LessonId FROM dbo.CategorySections
                         WHERE CategoryFeatureId = ? ORDER BY OrderIndex""", feat["Id"])
    bolumler = []
    for x in secs:
        dersler = query(con, """SELECT csl.Id, csl.LessonMainId lm, lm.Code, lm.Name, csl.OrderIndex o, csl.QuestionCount q, csl.IsRequired req
                                FROM dbo.CategorySectionLessons csl JOIN dbo.LessonMains lm ON lm.Id = csl.LessonMainId
                                WHERE csl.CategorySectionId = ? ORDER BY csl.OrderIndex""", x["Id"])
        bolumler.append({"id": s(x["Id"]), "code": x["Code"], "name": x["Name"], "order": x["o"], "questionCount": x["q"], "isAlternative": bool(x["alt"]),
                         "lessons": [{"sectionLessonId": s(d["Id"]), "lessonMainId": s(d["lm"]), "code": d["Code"], "name": d["Name"], "order": d["o"],
                                      "questionCount": d["q"], "required": bool(d["req"])} for d in dersler]})
    mains = query(con, """SELECT lm.Id, lm.Code, lm.Name, lm.OrderIndex o, lm.IsActive a FROM dbo.LessonMains lm JOIN dbo.Lessons l ON l.Id = lm.LessonId
                          WHERE l.CategorySubId = ? ORDER BY lm.OrderIndex""", sub["Id"])
    agac = []
    for m in mains:
        subs = query(con, "SELECT Id, Code, Name, OrderIndex o, IsActive a FROM dbo.LessonSubs WHERE LessonMainId = ? ORDER BY OrderIndex", m["Id"])
        mik = query(con, """SELECT mk.Id, mk.LessonSubId ls, mk.Code, mk.Name, mk.OrderIndex o, mk.IsActive a FROM dbo.LessonMikros mk
                            JOIN dbo.LessonSubs ls ON ls.Id = mk.LessonSubId WHERE ls.LessonMainId = ? ORDER BY mk.OrderIndex""", m["Id"])
        agac.append({"id": s(m["Id"]), "code": m["Code"], "name": m["Name"], "order": m["o"], "active": bool(m["a"]),
                     "subs": [{"id": s(x["Id"]), "code": x["Code"], "name": x["Name"], "order": x["o"], "active": bool(x["a"]),
                               "mikros": [{"id": s(k["Id"]), "code": k["Code"], "name": k["Name"], "order": k["o"], "active": bool(k["a"])}
                                          for k in mik if s(k["ls"]) == s(x["Id"])]} for x in subs]})
    out["subs"][kod] = {"id": s(sub["Id"]), "name": sub["Name"], "featureId": s(feat["Id"]), "durationMinutes": feat["d"],
                        "optionCount": feat["oc"], "questionCount": feat["q"], "sections": bolumler, "lessons": agac}
    print(kod, "bölüm", len(bolumler), "ders", len(agac), "konu", sum(len(m["subs"]) for m in agac))

# Kod çakışmasını önlemek için mevcut kodlar (deneme sorusu kodları ders öneki + 6 rakam; çözüm ve kitapçık kodları 8 karakter).
out["questionCodes"] = sorted(r["Code"] for r in query(con, "SELECT Code FROM dbo.Questions WHERE UsageKind = 1"))
out["solutionCodeCount"] = query(con, "SELECT COUNT(*) n FROM dbo.QuestionSolutions")[0]["n"]
out["bookletCodes"] = sorted(r["Code"] for r in query(con, "SELECT Code FROM dbo.QuestionBooklets"))
os.makedirs(os.path.dirname(CATALOG), exist_ok=True)
json.dump(out, open(CATALOG, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("yazıldı:", CATALOG, "· deneme soru kodu", len(out["questionCodes"]), "· kitapçık kodu", len(out["bookletCodes"]))
