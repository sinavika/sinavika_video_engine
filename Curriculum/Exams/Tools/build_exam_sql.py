"""Bir ayın deneme kitapçıklarını canlıya EKLEYECEK SQL'i üretir. Veritabanına bağlanmaz.
Kullanım: python build_exam_sql.py <ay>                                  (bütün kitapçıklar; hepsi eksiksiz ve geçerli olmalı)
          python build_exam_sql.py <ay> --kitapcik TYT-FEN,AYT-MAT [--kismi]   (seçilen kitapçıklar; --kismi: eksik soruya izin, yalnız yerel deneme için)
Girdi:  plan.json, Results/Exams/<ay>/<kitapçık>/sonuc.jsonl (check_exams.py)
Çıktı:  Results/Exams/<ay>/[ _secim/ ] ekle.sql      (tek transaction: ön koşullar, ekleme, satır sayısı ve son doğrulama)
                                     geri_al.sql   (eklenen kitapçıkları ve sorularını siler; denemeye atanmışsa durur)
                                     yuklenecek-resimler.json (motor figürlerinin hazır resimleri: ekle.sql'den ÖNCE depoya yüklenir)
Kitapçık durumu Tamamlandı (3) yazılır: şablon slotuna atanabilmesi için API bu durumu ister (ExamBookletAssignmentValidator).
--kismi ile eksik kalan kitapçık Hazırlandı (2) yazılır ve atanamaz."""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import hashlib, json, os, sys, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import re
from common import oku
from exam_common import EXAM_RESULTS, katalog, plan


KONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def s(v):
    """Unicode metin değişmezi (build_sql.py ile aynı): satır sonları ve denetim karakterleri NCHAR(n) ile yazılır."""
    if v is None:
        return "NULL"
    t = "N'" + str(v).replace("'", "''") + "'"
    t = t.replace("\r", "' + NCHAR(13) + N'").replace("\n", "' + NCHAR(10) + N'")
    return KONTROL.sub(lambda m: f"' + NCHAR({ord(m.group())}) + N'", t)


def g(v):
    return "NULL" if v is None else f"'{str(v).upper()}'"


def h(text):
    return "0x" + hashlib.sha256((text or "").encode("utf-16-le")).hexdigest().upper()


def insert(table, cols, rows, n=500):
    return "\n".join(f"INSERT INTO {table} ({', '.join(cols)}) VALUES\n" + ",\n".join("(" + ", ".join(r) + ")" for r in rows[i:i + n]) + ";"
                     for i in range(0, len(rows), n))


def resim(f, alan):
    deger = (f.get("Still") or {}).get(alan)
    if deger is None:
        return "NULL"
    return str(int(deger)) if alan in ("width", "height") else s(deger)

ay = sys.argv[1]
secim = sys.argv[sys.argv.index("--kitapcik") + 1].split(",") if "--kitapcik" in sys.argv else None
kismi = "--kismi" in sys.argv
pl, kat = plan(ay), katalog()
kitaplar = [b for b in pl["kitapciklar"] if not secim or b["anahtar"] in secim]
OUT = os.path.join(EXAM_RESULTS, ay, *(["_secim"] if secim else []))
os.makedirs(OUT, exist_ok=True)
PROFIL = "osym-cikmis-v1"
NS = uuid.UUID("6f1d9a52-3c47-4e0b-9a3e-5b1f0c7d2e81")

B, LM, SL, Q, O, A, C, F, M = [], [], [], [], [], [], [], [], []
beklenen_bolum = []   # (kitapçık id, bölüm id, sub id, soru sayısı)
hata = []
for kb in kitaplar:
    sonuc_yolu = os.path.join(EXAM_RESULTS, ay, kb["anahtar"], "sonuc.jsonl")
    R = {r["slotId"]: r for r in oku(sonuc_yolu)} if os.path.exists(sonuc_yolu) else {}
    eksik = [s_ for s_ in kb["slotlar"] if s_["slotId"] not in R]
    if eksik and not kismi:
        hata.append(f"{kb['anahtar']}: {len(eksik)} slotun geçerli sorusu yok")
        continue
    tamam = not eksik
    parmak = hashlib.sha256(json.dumps([(x["bolum"], x["sira"], x["konu"], x["zorluk"], x["dogru"]) for x in kb["slotlar"]]).encode()).hexdigest()
    B.append([g(kb["id"]), s(kb["kod"]), g(kb["categorySubId"]), s(kb["ad"]), g(pl["publisherId"]), "3" if tamam else "2", s(PROFIL), s(parmak)])
    sub = kat["subs"][kb["sub"]]
    for lm in sorted({x["lessonMainId"] for x in kb["slotlar"]}):
        LM.append([g(uuid.uuid5(NS, f"ders-bagi/{kb['id']}/{lm}")), g(kb["id"]), g(lm)])
    for bk in kb["bolumler"]:
        bolum = next(b for b in sub["sections"] if b["code"] == bk)
        beklenen_bolum.append((kb["id"], bolum["id"], sub["id"], bolum["questionCount"]))
    for x in kb["slotlar"]:
        r = R.get(x["slotId"])
        SL.append([g(x["slotId"]), g(kb["id"]), g(x["sectionId"]), g(x["sectionLessonId"]), str(x["sira"]), s(x["dogru"]),
                   str({"Easy": 0, "Medium": 1, "Hard": 2}[x["zorluk"]]), g(x["lessonMainId"]), g(x["lessonSubId"]),
                   g(r["lessonMikroId"] if r else x["lessonMikroId"])])
        if not r:
            continue
        Q.append([g(r["soruId"]), s(r["soruKodu"]), s(r["stem"]), g(r["slotId"]), g(r["lessonSubId"]), g(r["lessonMikroId"]), str(r["zorluk"]),
                  g(r["lessonMainId"]), h(r["stem"])])
        for i, o in enumerate(r["options"]):
            O.append([g(o["id"]), s(o["key"]), s(o["text"]), str(i + 1), g(r["soruId"])])
        A.append([g(uuid.uuid5(NS, "dogru/" + r["soruId"])), g(r["soruId"]), g(r["correctOptionId"])])
        c = r["solution"]
        C.append([g(c["id"]), s(c["code"]), g(r["soruId"]), g(kb["id"]), s(c["ContentText"]), s(c["StructuredContentJson"])])
        for f in r["figures"]:
            if not f.get("Still"):
                hata.append(f"{kb['anahtar']} {r['ders']} {r['dersSira']}: {f['Code']} figürünün hazır resmi yok")
            F.append(f | {"QuestionId": r["soruId"]})
        for x2 in r["spans"]:
            M.append([g(r["soruId"]), s(x2["SegmentId"]), s(x2["SpanId"]), str(x2["Start"]), str(x2["Length"]), s(x2["ExpectedText"]), s(x2["Role"]), str(x2["Occurrence"])])
if hata:
    print("\n".join(hata))
    sys.exit("SQL üretilmedi.")
kodlar = [r[1] for r in Q]
assert len(set(kodlar)) == len(kodlar), "soru kodu tekrar ediyor"
assert len({r[1] for r in C}) == len(C), "çözüm kodu tekrar ediyor"

nb, nl, ns, nq, no, nf, nm = len(B), len(LM), len(SL), len(Q), len(O), len(F), len(M)
L = [f"-- {ay} deneme kitapçıkları — EKLEME (önce yuklenecek-resimler.json'daki resimler depoya yüklenir)",
     f"-- Kitapçık: {nb} ({', '.join(b['anahtar'] for b in kitaplar)})",
     f"-- Slot: {ns}, soru: {nq}, şık: {no}, çözüm: {len(C)}, figür: {nf}, işaretleme: {nm}",
     "-- Tek transaction. Ön koşul ya da satır sayısı tutmazsa hiçbir değişiklik kalmaz. Kitapçıklar denemeye admin panelinden atanır.",
     "SET XACT_ABORT ON;", "SET NOCOUNT ON;", "SET QUOTED_IDENTIFIER ON;", "SET ANSI_NULLS ON;  -- Questions.QuestionBookletSlotId filtreli benzersiz dizini bunları ister", "BEGIN TRANSACTION;", "",
     "CREATE TABLE #B (Id uniqueidentifier PRIMARY KEY, Code nvarchar(450) NOT NULL, CategorySubId uniqueidentifier NOT NULL, Name nvarchar(400) NOT NULL, PublisherId uniqueidentifier NOT NULL, Status int NOT NULL, ProfileVersion nvarchar(64) NOT NULL, Fingerprint nvarchar(128) NOT NULL);",
     "CREATE TABLE #LM (Id uniqueidentifier PRIMARY KEY, QuestionBookletId uniqueidentifier NOT NULL, LessonMainId uniqueidentifier NOT NULL);",
     "CREATE TABLE #SL (Id uniqueidentifier PRIMARY KEY, QuestionBookletId uniqueidentifier NOT NULL, CategorySectionId uniqueidentifier NOT NULL, CategorySectionLessonId uniqueidentifier NOT NULL, OrderIndex int NOT NULL, PreferredCorrectOptionKey nvarchar(1) NOT NULL, TargetDifficulty int NOT NULL, TargetLessonMainId uniqueidentifier NOT NULL, TargetLessonSubId uniqueidentifier NOT NULL, TargetLessonMikroId uniqueidentifier NOT NULL);",
     "CREATE TABLE #Q (Id uniqueidentifier PRIMARY KEY, Code nvarchar(450) NOT NULL, Stem nvarchar(max) NOT NULL, QuestionBookletSlotId uniqueidentifier NOT NULL, LessonSubId uniqueidentifier NOT NULL, LessonMikroId uniqueidentifier NOT NULL, TargetDifficultyLevel int NOT NULL, LessonMainId uniqueidentifier NOT NULL, StemHash varbinary(32) NOT NULL);",
     "CREATE TABLE #O (Id uniqueidentifier PRIMARY KEY, OptionKey nvarchar(8) NOT NULL, Stem nvarchar(max) NOT NULL, OrderIndex int NOT NULL, QuestionId uniqueidentifier NOT NULL);",
     "CREATE TABLE #A (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, CorrectOptionId uniqueidentifier NOT NULL);",
     "CREATE TABLE #C (Id uniqueidentifier PRIMARY KEY, Code nvarchar(450) NOT NULL, QuestionId uniqueidentifier NOT NULL, QuestionBookletId uniqueidentifier NOT NULL, ContentText nvarchar(max) NULL, StructuredContentJson nvarchar(max) NULL);",
     "CREATE TABLE #F (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, Code nvarchar(64) NOT NULL, Kind int NOT NULL, Title nvarchar(512) NULL, Alt nvarchar(1024) NULL, DataJson nvarchar(max) NULL, OrderIndex int NOT NULL, StillLightUrl nvarchar(2048) NULL, StillDarkUrl nvarchar(2048) NULL, StillWidth int NULL, StillHeight int NULL);",
     "CREATE TABLE #M (QuestionId uniqueidentifier NOT NULL, SegmentId nvarchar(32) NOT NULL, SpanId nvarchar(64) NOT NULL, Start int NOT NULL, Length int NOT NULL, ExpectedText nvarchar(512) NOT NULL, Role nvarchar(32) NOT NULL, Occurrence int NOT NULL);",
     "CREATE TABLE #BB (QuestionBookletId uniqueidentifier NOT NULL, CategorySectionId uniqueidentifier NOT NULL, CategorySubId uniqueidentifier NOT NULL, QuestionCount int NOT NULL);",
     ""]
L.append(insert("#B", ["Id", "Code", "CategorySubId", "Name", "PublisherId", "Status", "ProfileVersion", "Fingerprint"], B))
L.append(insert("#LM", ["Id", "QuestionBookletId", "LessonMainId"], LM))
L.append(insert("#SL", ["Id", "QuestionBookletId", "CategorySectionId", "CategorySectionLessonId", "OrderIndex", "PreferredCorrectOptionKey", "TargetDifficulty",
                        "TargetLessonMainId", "TargetLessonSubId", "TargetLessonMikroId"], SL))
if nq:
    L.append(insert("#Q", ["Id", "Code", "Stem", "QuestionBookletSlotId", "LessonSubId", "LessonMikroId", "TargetDifficultyLevel", "LessonMainId", "StemHash"], Q))
    L.append(insert("#O", ["Id", "OptionKey", "Stem", "OrderIndex", "QuestionId"], O))
    L.append(insert("#A", ["Id", "QuestionId", "CorrectOptionId"], A))
    L.append(insert("#C", ["Id", "Code", "QuestionId", "QuestionBookletId", "ContentText", "StructuredContentJson"], C))
if nf:
    L.append(insert("#F", ["Id", "QuestionId", "Code", "Kind", "Title", "Alt", "DataJson", "OrderIndex", "StillLightUrl", "StillDarkUrl", "StillWidth", "StillHeight"],
                    [[g(f["Id"]), g(f["QuestionId"]), s(f["Code"]), str(f["Kind"]), s(f.get("Title")), s(f.get("Alt")), s(f.get("DataJson")), str(f["OrderIndex"]),
                      resim(f, "light"), resim(f, "dark"), resim(f, "width"), resim(f, "height")] for f in F]))
if nm:
    L.append(insert("#M", ["QuestionId", "SegmentId", "SpanId", "Start", "Length", "ExpectedText", "Role", "Occurrence"], M))
L.append(insert("#BB", ["QuestionBookletId", "CategorySectionId", "CategorySubId", "QuestionCount"], [[g(a), g(b), g(c), str(d)] for a, b, c, d in beklenen_bolum]))
L += ["",
      "DECLARE @n int;",
      "-- 1) Ön koşullar: hiçbir kimlik ve kod canlıda yok; katalog plandakiyle aynı",
      "IF EXISTS (SELECT 1 FROM dbo.QuestionBooklets b JOIN #B t ON t.Id = b.Id OR t.Code = b.Code) THROW 50101, N'Ön koşul: kitapçık kimliği ya da kodu zaten var. Hiçbir şey yazılmadı.', 1;",
      "IF EXISTS (SELECT 1 FROM dbo.QuestionBookletSlots x JOIN #SL t ON t.Id = x.Id) THROW 50102, N'Ön koşul: slot kimliği zaten var.', 1;",
      "IF EXISTS (SELECT 1 FROM dbo.Questions x JOIN #Q t ON t.Id = x.Id OR t.Code = x.Code) THROW 50103, N'Ön koşul: soru kimliği ya da kodu zaten var.', 1;",
      "IF EXISTS (SELECT 1 FROM dbo.QuestionOptions x JOIN #O t ON t.Id = x.Id) THROW 50103, N'Ön koşul: şık kimliği zaten var.', 1;",
      "IF EXISTS (SELECT 1 FROM dbo.QuestionSolutions x JOIN #C t ON t.Id = x.Id OR t.Code = x.Code) THROW 50104, N'Ön koşul: çözüm kimliği ya da kodu zaten var.', 1;",
      "IF EXISTS (SELECT 1 FROM dbo.QuestionFigures x JOIN #F t ON t.Id = x.Id) THROW 50104, N'Ön koşul: figür kimliği zaten var.', 1;",
      "SELECT @n = COUNT(*) FROM #BB t JOIN dbo.CategorySections cs ON cs.Id = t.CategorySectionId AND cs.QuestionCount = t.QuestionCount",
      "  JOIN dbo.CategoryFeatures cf ON cf.Id = cs.CategoryFeatureId AND cf.CategorySubId = t.CategorySubId;",
      f"IF @n <> {len(beklenen_bolum)} THROW 50105, N'Ön koşul: bölümler ya da soru sayıları plandakinden farklı (exam_catalog.py ve exam_plan.py yeniden çalışmalı).', 1;",
      "SELECT @n = COUNT(*) FROM #SL t JOIN dbo.CategorySectionLessons csl ON csl.Id = t.CategorySectionLessonId AND csl.CategorySectionId = t.CategorySectionId AND csl.LessonMainId = t.TargetLessonMainId;",
      f"IF @n <> {ns} THROW 50105, N'Ön koşul: bölüm dersleri plandakinden farklı.', 1;",
      "SELECT @n = COUNT(*) FROM #SL t JOIN dbo.LessonMikros mk ON mk.Id = t.TargetLessonMikroId AND mk.LessonSubId = t.TargetLessonSubId AND mk.IsActive = 1",
      "  JOIN dbo.LessonSubs ls ON ls.Id = mk.LessonSubId AND ls.LessonMainId = t.TargetLessonMainId AND ls.IsActive = 1;",
      f"IF @n <> {ns} THROW 50106, N'Ön koşul: konu ya da mikro konu etkin değil veya derse ait değil.', 1;",
      "SELECT @n = COUNT(*) FROM #B t JOIN dbo.Publishers p ON p.Id = t.PublisherId;",
      f"IF @n <> {nb} THROW 50107, N'Ön koşul: Sınavika yayınevi kaydı yok.', 1;",
      "",
      "-- 2) Kitapçıklar ve ders bağları",
      "INSERT INTO dbo.QuestionBooklets (Id, Code, CategorySubId, Name, PublisherId, Status, CreatedByAdminId, CreatedByPublisherAuthId, CreatedAt, SourceKind, DistributionProfileVersion, DistributionPlanFingerprint)",
      "SELECT Id, Code, CategorySubId, Name, PublisherId, Status, NULL, NULL, SYSUTCDATETIME(), 0, ProfileVersion, Fingerprint FROM #B;",
      f"IF @@ROWCOUNT <> {nb} THROW 50111, N'Kitapçık eklemesi eksik kaldı.', 1;",
      "INSERT INTO dbo.QuestionBookletLessonMains (Id, QuestionBookletId, LessonMainId, CreatedAt) SELECT Id, QuestionBookletId, LessonMainId, SYSUTCDATETIME() FROM #LM;",
      f"IF @@ROWCOUNT <> {nl} THROW 50112, N'Kitapçık ders bağı eklemesi eksik kaldı.', 1;",
      "",
      "-- 3) Slotlar (bölüm içi sıra, hedef konu, zorluk, cevap anahtarı harfi)",
      "INSERT INTO dbo.QuestionBookletSlots (Id, QuestionBookletId, CategorySectionId, CategorySectionLessonId, OrderIndex, PreferredCorrectOptionKey, TargetDifficulty, TargetLessonMainId, TargetLessonSubId, TargetLessonMikroId)",
      "SELECT Id, QuestionBookletId, CategorySectionId, CategorySectionLessonId, OrderIndex, PreferredCorrectOptionKey, TargetDifficulty, TargetLessonMainId, TargetLessonSubId, TargetLessonMikroId FROM #SL;",
      f"IF @@ROWCOUNT <> {ns} THROW 50113, N'Slot eklemesi eksik kaldı.', 1;",
      "",
      "-- 4) Sorular (deneme havuzu: UsageKind 1, kaynak System 0)",
      "INSERT INTO dbo.Questions (Id, Code, Stem, StemImageUrl, CreatedAt, QuestionBookletSlotId, LessonSubId, LessonMikroId, TargetDifficultyLevel, SourceKind, UsageKind)",
      "SELECT Id, Code, Stem, NULL, SYSUTCDATETIME(), QuestionBookletSlotId, LessonSubId, LessonMikroId, TargetDifficultyLevel, 0, 1 FROM #Q;",
      f"IF @@ROWCOUNT <> {nq} THROW 50114, N'Soru eklemesi eksik kaldı.', 1;",
      "INSERT INTO dbo.QuestionOptions (Id, OptionKey, Stem, ImageUrl, OrderIndex, QuestionId) SELECT Id, OptionKey, Stem, NULL, OrderIndex, QuestionId FROM #O;",
      f"IF @@ROWCOUNT <> {no} THROW 50115, N'Şık eklemesi eksik kaldı.', 1;",
      "INSERT INTO dbo.QuestionOptionCorrectAnswers (Id, QuestionId, CorrectOptionId) SELECT Id, QuestionId, CorrectOptionId FROM #A;",
      f"IF @@ROWCOUNT <> {nq} THROW 50116, N'Doğru cevap eklemesi eksik kaldı.', 1;",
      "INSERT INTO dbo.QuestionSolutions (Id, Code, QuestionId, QuestionBookletId, Type, Title, ContentText, StructuredContentJson, Url, OrderIndex, IsActive, CreatedByAdminId, CreatedAt)",
      "SELECT Id, Code, QuestionId, QuestionBookletId, 0, N'Çözüm özeti', ContentText, StructuredContentJson, NULL, 0, 1, NULL, SYSUTCDATETIME() FROM #C;",
      f"IF @@ROWCOUNT <> {nq} THROW 50117, N'Çözüm eklemesi eksik kaldı.', 1;",
      "INSERT INTO dbo.QuestionFigures (Id, QuestionId, Code, Kind, Title, Alt, ImageUrl, DataJson, OrderIndex, CreatedAt, UpdatedAt, StillLightUrl, StillDarkUrl, StillWidth, StillHeight)",
      "SELECT Id, QuestionId, Code, Kind, Title, Alt, NULL, DataJson, OrderIndex, SYSUTCDATETIME(), NULL, StillLightUrl, StillDarkUrl, StillWidth, StillHeight FROM #F;",
      f"IF @@ROWCOUNT <> {nf} THROW 50118, N'Figür eklemesi eksik kaldı.', 1;",
      "INSERT INTO dbo.QuestionMarkupSpans (Id, QuestionId, SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence, CreatedAt)",
      "SELECT NEWID(), QuestionId, SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence, SYSUTCDATETIME() FROM #M;",
      f"IF @@ROWCOUNT <> {nm} THROW 50119, N'İşaretleme eklemesi eksik kaldı.', 1;",
      "",
      "-- 5) Son doğrulama: her bölümde soru sayısı kadar slot; kitapçık Tamamlandı ise her slotun sorusu ve doğru cevabı var; kökler birebir",
      "SELECT @n = COUNT(*) FROM #BB t WHERE (SELECT COUNT(*) FROM dbo.QuestionBookletSlots x WHERE x.QuestionBookletId = t.QuestionBookletId AND x.CategorySectionId = t.CategorySectionId) = t.QuestionCount;",
      f"IF @n <> {len(beklenen_bolum)} THROW 50121, N'Son doğrulama: bölüm slot sayısı tutmuyor.', 1;",
      "SELECT @n = COUNT(*) FROM dbo.QuestionBookletSlots x JOIN #B b ON b.Id = x.QuestionBookletId AND b.Status = 3",
      "  WHERE NOT EXISTS (SELECT 1 FROM dbo.Questions q JOIN dbo.QuestionOptionCorrectAnswers a ON a.QuestionId = q.Id JOIN dbo.QuestionOptions o ON o.Id = a.CorrectOptionId AND o.QuestionId = q.Id",
      "                    WHERE q.QuestionBookletSlotId = x.Id AND o.OptionKey = x.PreferredCorrectOptionKey);",
      "IF @n <> 0 THROW 50122, N'Son doğrulama: Tamamlandı kitapçıkta sorusuz ya da cevap anahtarı plandan farklı slot var.', 1;",
      "SELECT @n = COUNT(*) FROM dbo.Questions q JOIN #Q t ON t.Id = q.Id AND HASHBYTES('SHA2_256', q.Stem) = t.StemHash;",
      f"IF @n <> {nq} THROW 50123, N'Son doğrulama: soru kökleri beklenenle aynı değil.', 1;",
      "",
      "COMMIT TRANSACTION;",
      f"PRINT N'Tamamlandı: {nb} kitapçık, {ns} slot, {nq} soru, {no} şık, {nf} figür, {nm} işaretleme eklendi.';"]
open(os.path.join(OUT, "ekle.sql"), "w", encoding="utf-8-sig").write("\n".join(L) + "\n")

# Geri alma: yalnız bu betiğin eklediği kitapçıklar (kimlikle); denemeye atanmış ya da çözülmüşse durur.
ids = ", ".join(g(b["id"]) for b in kitaplar if any(r[0] == g(b["id"]) for r in B))
G = [f"-- {ay} deneme kitapçıkları — GERİ ALMA (ekle.sql'in eklediklerini siler)", "SET XACT_ABORT ON;", "SET NOCOUNT ON;", "SET QUOTED_IDENTIFIER ON;", "SET ANSI_NULLS ON;", "BEGIN TRANSACTION;",
     f"CREATE TABLE #B (Id uniqueidentifier PRIMARY KEY); INSERT INTO #B (Id) VALUES {', '.join('(' + g(b['id']) + ')' for b in kitaplar if any(r[0] == g(b['id']) for r in B))};",
     "CREATE TABLE #Q (Id uniqueidentifier PRIMARY KEY);",
     "INSERT INTO #Q (Id) SELECT q.Id FROM dbo.Questions q JOIN dbo.QuestionBookletSlots x ON x.Id = q.QuestionBookletSlotId JOIN #B b ON b.Id = x.QuestionBookletId;",
     "DECLARE @n int;",
     "IF EXISTS (SELECT 1 FROM dbo.Exams e JOIN #B b ON b.Id = e.QuestionBookletId) THROW 50201, N'Kitapçıklardan biri bir denemeye atanmış; önce atama kaldırılmalı. Hiçbir şey silinmedi.', 1;",
     "IF EXISTS (SELECT 1 FROM dbo.ExamStudentAttemptAnswers a JOIN #Q q ON q.Id = a.QuestionId) THROW 50202, N'Sorulardan biri cevaplanmış. Hiçbir şey silinmedi.', 1;",
     "SELECT @n = COUNT(*) FROM #B b JOIN dbo.QuestionBooklets x ON x.Id = b.Id;",
     f"IF @n <> {nb} THROW 50203, N'Silinecek kitapçık sayısı beklenenden farklı.', 1;",
     f"IF (SELECT COUNT(*) FROM #Q) <> {nq} THROW 50204, N'Silinecek soru sayısı beklenenden farklı.', 1;",
     "DELETE x FROM dbo.QuestionMarkupSpans x JOIN #Q q ON q.Id = x.QuestionId;",
     f"IF @@ROWCOUNT <> {nm} THROW 50211, N'İşaretleme silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionFigures x JOIN #Q q ON q.Id = x.QuestionId;",
     f"IF @@ROWCOUNT <> {nf} THROW 50212, N'Figür silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionSolutions x WHERE EXISTS (SELECT 1 FROM #Q q WHERE q.Id = x.QuestionId) OR EXISTS (SELECT 1 FROM #B b WHERE b.Id = x.QuestionBookletId);",
     f"IF @@ROWCOUNT <> {nq} THROW 50213, N'Çözüm silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionOptionCorrectAnswers x JOIN #Q q ON q.Id = x.QuestionId;",
     f"IF @@ROWCOUNT <> {nq} THROW 50214, N'Doğru cevap silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionOptions x JOIN #Q q ON q.Id = x.QuestionId;",
     f"IF @@ROWCOUNT <> {no} THROW 50215, N'Şık silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.Questions x JOIN #Q q ON q.Id = x.Id;",
     f"IF @@ROWCOUNT <> {nq} THROW 50216, N'Soru silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionBookletSlots x JOIN #B b ON b.Id = x.QuestionBookletId;",
     f"IF @@ROWCOUNT <> {ns} THROW 50217, N'Slot silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionBookletLessonMains x JOIN #B b ON b.Id = x.QuestionBookletId;",
     f"IF @@ROWCOUNT <> {nl} THROW 50218, N'Ders bağı silme sayısı tutmuyor.', 1;",
     "DELETE x FROM dbo.QuestionBooklets x JOIN #B b ON b.Id = x.Id;",
     f"IF @@ROWCOUNT <> {nb} THROW 50219, N'Kitapçık silme sayısı tutmuyor.', 1;",
     "COMMIT TRANSACTION;",
     f"PRINT N'Geri alındı: {nb} kitapçık, {nq} soru silindi.';"]
open(os.path.join(OUT, "geri_al.sql"), "w", encoding="utf-8-sig").write("\n".join(G) + "\n")

resimler = {}
for f in F:
    if f.get("Still"):
        for tema in ("light", "dark"):
            url, dosya = f["Still"][tema], f["StillFiles"][tema]
            resimler[url] = {"url": url, "dosya": dosya, "ad": url.rsplit("/", 1)[1]}
json.dump(sorted(resimler.values(), key=lambda x: x["ad"]), open(os.path.join(OUT, "yuklenecek-resimler.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"ekle.sql: kitapçık {nb}, slot {ns}, soru {nq}, şık {no}, figür {nf}, işaretleme {nm} · {os.path.getsize(os.path.join(OUT, 'ekle.sql')) // 1024} KB")
print(f"geri_al.sql · yuklenecek-resimler.json: {len(resimler)} dosya → {OUT}")
