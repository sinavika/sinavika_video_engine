"""Bir ayın deneme ekle.sql ve geri_al.sql betiklerini LocalDB'de canlı şemanın kopyası üstünde uçtan uca dener. Canlıya bağlanmaz.
Kullanım: python dry_run_exam_sql.py <ay> [--secim]      (--secim: build_exam_sql.py --kitapcik çıktısı, Results/Exams/<ay>/_secim)
Şema: canlıdaki sütunlar, boş geçilemezlik, varsayılanlar, benzersiz dizinler ve yabancı anahtarlar (2 Kasım 2026'da okundu);
katalog tabloları yalnız kimlik ve denetlenen sütunlarla, katalog.json'dan tohumlanır.
Adımlar: ekle → beklenenle birebir → API atama kuralları → ikinci ekle durmalı → pasif mikroyla ekle durmalı →
denemeye atanmışken geri al durmalı → geri al → boş hâlle aynı → sil."""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import json, os, subprocess, sys, pyodbc
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import oku
from exam_common import EXAM_RESULTS, katalog, plan

ay = sys.argv[1]
KLASOR = os.path.join(EXAM_RESULTS, ay, *(["_secim"] if "--secim" in sys.argv else []))
DB, SERVER = "DenemeKitapcikDeneme", r"(localdb)\MSSQLLocalDB"
pl, kat = plan(ay), katalog()

SEMA = """
CREATE TABLE CategorySubs (Id uniqueidentifier PRIMARY KEY);
CREATE TABLE CategoryFeatures (Id uniqueidentifier PRIMARY KEY, CategorySubId uniqueidentifier NOT NULL REFERENCES CategorySubs(Id));
CREATE TABLE CategorySections (Id uniqueidentifier PRIMARY KEY, CategoryFeatureId uniqueidentifier NOT NULL REFERENCES CategoryFeatures(Id), QuestionCount int NOT NULL);
CREATE TABLE LessonMains (Id uniqueidentifier PRIMARY KEY);
CREATE TABLE LessonSubs (Id uniqueidentifier PRIMARY KEY, LessonMainId uniqueidentifier NOT NULL REFERENCES LessonMains(Id), IsActive bit NOT NULL);
CREATE TABLE LessonMikros (Id uniqueidentifier PRIMARY KEY, LessonSubId uniqueidentifier NOT NULL REFERENCES LessonSubs(Id), IsActive bit NOT NULL);
CREATE TABLE CategorySectionLessons (Id uniqueidentifier PRIMARY KEY, CategorySectionId uniqueidentifier NOT NULL REFERENCES CategorySections(Id), LessonMainId uniqueidentifier NOT NULL REFERENCES LessonMains(Id));
CREATE TABLE Publishers (Id uniqueidentifier PRIMARY KEY);
CREATE TABLE AdminUsers (Id uniqueidentifier PRIMARY KEY);
CREATE TABLE PublisherUsers (Id uniqueidentifier PRIMARY KEY);
CREATE TABLE QuestionBooklets (Id uniqueidentifier NOT NULL CONSTRAINT PK_QuestionBooklets PRIMARY KEY, Code nvarchar(450) NOT NULL, CategorySubId uniqueidentifier NOT NULL REFERENCES CategorySubs(Id),
  Name nvarchar(max) NOT NULL, PublisherId uniqueidentifier NULL REFERENCES Publishers(Id), Status int NOT NULL, CreatedByAdminId uniqueidentifier NULL REFERENCES AdminUsers(Id) ON DELETE SET NULL,
  CreatedByPublisherAuthId uniqueidentifier NULL REFERENCES PublisherUsers(Id) ON DELETE SET NULL, CreatedAt datetime2 NOT NULL, DistributionFallbackReason nvarchar(128) NULL,
  DistributionPlanFingerprint nvarchar(128) NULL, DistributionProfileVersion nvarchar(64) NULL, DistributionYearUsed int NULL, SourceKind int NOT NULL DEFAULT 0);
CREATE UNIQUE INDEX IX_QuestionBooklets_Code ON QuestionBooklets(Code);
CREATE TABLE QuestionBookletSlots (Id uniqueidentifier NOT NULL PRIMARY KEY, QuestionBookletId uniqueidentifier NOT NULL REFERENCES QuestionBooklets(Id) ON DELETE CASCADE,
  CategorySectionId uniqueidentifier NOT NULL REFERENCES CategorySections(Id), CategorySectionLessonId uniqueidentifier NULL REFERENCES CategorySectionLessons(Id), OrderIndex int NOT NULL,
  PreferredCorrectOptionKey nvarchar(1) NULL, TargetCognitiveDemand nvarchar(64) NULL, TargetDifficulty int NULL, TargetLessonMainId uniqueidentifier NULL REFERENCES LessonMains(Id),
  TargetLessonMikroId uniqueidentifier NULL REFERENCES LessonMikros(Id), TargetLessonSubId uniqueidentifier NULL REFERENCES LessonSubs(Id), TargetQuestionFamily nvarchar(128) NULL,
  TargetStemLengthBand int NULL, TargetParagraphStyle int NULL, TargetPrecursorStyle int NULL, TargetGraphicExpectation int NULL, TargetReasoningDepth int NULL);
CREATE TABLE QuestionBookletLessonMains (Id uniqueidentifier NOT NULL PRIMARY KEY, QuestionBookletId uniqueidentifier NOT NULL REFERENCES QuestionBooklets(Id) ON DELETE CASCADE,
  LessonMainId uniqueidentifier NOT NULL REFERENCES LessonMains(Id), CreatedAt datetime2 NOT NULL);
CREATE UNIQUE INDEX IX_QBLM ON QuestionBookletLessonMains(QuestionBookletId, LessonMainId);
CREATE TABLE Questions (Id uniqueidentifier NOT NULL PRIMARY KEY, Code nvarchar(max) NOT NULL, Stem nvarchar(max) NOT NULL, StemImageUrl nvarchar(max) NULL, CreatedAt datetime2 NOT NULL,
  UpdatedAt datetime2 NULL, QuestionBookletSlotId uniqueidentifier NULL REFERENCES QuestionBookletSlots(Id) ON DELETE SET NULL, LessonSubId uniqueidentifier NULL REFERENCES LessonSubs(Id),
  LessonMikroId uniqueidentifier NULL REFERENCES LessonMikros(Id), TargetDifficultyLevel int NULL, StemLengthBand int NULL, ParagraphStyle int NULL, PrecursorStyle int NULL,
  GraphicExpectation int NULL, ReasoningDepth int NULL, AdminUserId uniqueidentifier NULL REFERENCES AdminUsers(Id), AcceptanceContentHash nvarchar(128) NULL,
  AcceptancePolicyVersion nvarchar(64) NULL, AcceptanceTargetFingerprint nvarchar(128) NULL, AcceptanceValidatedAtUtc datetime2 NULL, SourceQuestionHash nvarchar(128) NULL,
  SourceReferenceMatchLevel nvarchar(32) NULL, ExamProductionJobId uniqueidentifier NULL, SourceKind int NOT NULL DEFAULT 0, QuestionFamily nvarchar(64) NULL, UsageKind int NOT NULL DEFAULT 1);
CREATE UNIQUE INDEX IX_Questions_QuestionBookletSlotId ON Questions(QuestionBookletSlotId) WHERE QuestionBookletSlotId IS NOT NULL;
CREATE TABLE QuestionOptions (Id uniqueidentifier NOT NULL PRIMARY KEY, OptionKey nvarchar(max) NOT NULL, Stem nvarchar(max) NOT NULL, ImageUrl nvarchar(max) NULL, OrderIndex int NOT NULL,
  QuestionId uniqueidentifier NOT NULL REFERENCES Questions(Id));
CREATE TABLE QuestionOptionCorrectAnswers (Id uniqueidentifier NOT NULL PRIMARY KEY, QuestionId uniqueidentifier NOT NULL REFERENCES Questions(Id), CorrectOptionId uniqueidentifier NOT NULL REFERENCES QuestionOptions(Id));
CREATE UNIQUE INDEX IX_QOCA_QuestionId ON QuestionOptionCorrectAnswers(QuestionId);
CREATE TABLE QuestionSolutions (Id uniqueidentifier NOT NULL PRIMARY KEY, Code nvarchar(450) NOT NULL, QuestionId uniqueidentifier NOT NULL REFERENCES Questions(Id) ON DELETE CASCADE,
  QuestionBookletId uniqueidentifier NULL REFERENCES QuestionBooklets(Id), Type int NOT NULL, Title nvarchar(max) NULL, ContentText nvarchar(max) NULL, StructuredContentJson nvarchar(max) NULL,
  Url nvarchar(max) NULL, OrderIndex int NOT NULL, IsActive bit NOT NULL, CreatedByAdminId uniqueidentifier NULL REFERENCES AdminUsers(Id), CreatedAt datetime2 NOT NULL, UpdatedAt datetime2 NULL);
CREATE UNIQUE INDEX IX_QuestionSolutions_Code ON QuestionSolutions(Code);
CREATE TABLE QuestionFigures (Id uniqueidentifier NOT NULL PRIMARY KEY, QuestionId uniqueidentifier NOT NULL REFERENCES Questions(Id) ON DELETE CASCADE, Code nvarchar(64) NOT NULL, Kind int NOT NULL,
  Title nvarchar(512) NULL, Alt nvarchar(1024) NULL, ImageUrl nvarchar(2048) NULL, DataJson nvarchar(max) NULL, OrderIndex int NOT NULL, CreatedAt datetime2 NOT NULL, UpdatedAt datetime2 NULL,
  StillDarkUrl nvarchar(2048) NULL, StillHeight int NULL, StillLightUrl nvarchar(2048) NULL, StillWidth int NULL);
CREATE UNIQUE INDEX IX_QuestionFigures_QuestionId_Code ON QuestionFigures(QuestionId, Code);
CREATE TABLE QuestionMarkupSpans (Id uniqueidentifier NOT NULL PRIMARY KEY, QuestionId uniqueidentifier NOT NULL REFERENCES Questions(Id) ON DELETE CASCADE, SegmentId nvarchar(32) NOT NULL,
  SpanId nvarchar(64) NOT NULL, Start int NOT NULL, Length int NOT NULL, ExpectedText nvarchar(512) NOT NULL, Role nvarchar(32) NOT NULL, Occurrence int NOT NULL, CreatedAt datetime2 NOT NULL);
CREATE UNIQUE INDEX IX_QuestionMarkupSpans_QuestionId_SpanId ON QuestionMarkupSpans(QuestionId, SpanId);
CREATE TABLE Exams (Id uniqueidentifier PRIMARY KEY, QuestionBookletId uniqueidentifier NULL REFERENCES QuestionBooklets(Id));
CREATE TABLE ExamStudentAttemptAnswers (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NULL);
"""
TABLOLAR = ["QuestionBooklets", "QuestionBookletLessonMains", "QuestionBookletSlots", "Questions", "QuestionOptions", "QuestionOptionCorrectAnswers",
            "QuestionSolutions", "QuestionFigures", "QuestionMarkupSpans"]


def con(db="master"):
    return pyodbc.connect(f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={SERVER};DATABASE={db};Trusted_Connection=yes;TrustServerCertificate=yes", autocommit=True)


def sqlcmd(name):
    p = subprocess.run(["sqlcmd", "-S", SERVER, "-d", DB, "-b", "-f", "65001", "-i", os.path.join(KLASOR, name)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    return p.returncode, (p.stdout + p.stderr).strip()


def sayim(c):
    return {t: c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in TABLOLAR}


m = con()
m.execute(f"IF DB_ID('{DB}') IS NOT NULL BEGIN ALTER DATABASE [{DB}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{DB}]; END")
m.execute(f"CREATE DATABASE [{DB}]")
c = con(DB)
for parca in SEMA.strip().split(";\n"):
    if parca.strip():
        c.execute(parca)
cur = c.cursor()
cur.execute("INSERT INTO Publishers VALUES (?)", kat["publisherId"])
for sub in kat["subs"].values():
    cur.execute("INSERT INTO CategorySubs VALUES (?)", sub["id"])
    cur.execute("INSERT INTO CategoryFeatures VALUES (?, ?)", sub["featureId"], sub["id"])
    for m_ in sub["lessons"]:
        cur.execute("INSERT INTO LessonMains VALUES (?)", m_["id"])
        for x in m_["subs"]:
            cur.execute("INSERT INTO LessonSubs VALUES (?, ?, ?)", x["id"], m_["id"], x["active"])
            for k in x["mikros"]:
                cur.execute("INSERT INTO LessonMikros VALUES (?, ?, ?)", k["id"], x["id"], k["active"])
    for b in sub["sections"]:
        cur.execute("INSERT INTO CategorySections VALUES (?, ?, ?)", b["id"], sub["featureId"], b["questionCount"])
        for d in b["lessons"]:
            cur.execute("INSERT INTO CategorySectionLessons VALUES (?, ?, ?)", d["sectionLessonId"], b["id"], d["lessonMainId"])
bos = sayim(c)
print("tohum: katalog yüklendi, deneme tabloları boş")

# 1) Ekle
rc, out = sqlcmd("ekle.sql")
assert rc == 0, out[-800:]
print("1)", out.splitlines()[-1] if out else "eklendi")
sonra = sayim(c)

# 2) Beklenenle birebir
eklenen = {r[0].upper() for r in c.execute("SELECT CAST(Id AS nvarchar(36)) FROM QuestionBooklets").fetchall()}
kitaplar = [b for b in pl["kitapciklar"] if b["id"] in eklenen]
R = [r for b in kitaplar for r in oku(os.path.join(EXAM_RESULTS, ay, b["anahtar"], "sonuc.jsonl"))]
up = lambda x: x.upper() if isinstance(x, str) else x
U = lambda rows: sorted(tuple(up(v) if isinstance(v, str) and len(v) == 36 and v.count("-") == 4 else v for v in r) for r in rows)
q = U(c.execute("SELECT CAST(Id AS nvarchar(36)), Code, Stem, CAST(QuestionBookletSlotId AS nvarchar(36)), CAST(LessonSubId AS nvarchar(36)), CAST(LessonMikroId AS nvarchar(36)), TargetDifficultyLevel, UsageKind, SourceKind FROM Questions").fetchall())
assert q == sorted((up(r["soruId"]), r["soruKodu"], r["stem"], up(r["slotId"]), up(r["lessonSubId"]), up(r["lessonMikroId"]), r["zorluk"], 1, 0) for r in R), "sorular beklenenle aynı değil"
o = U(c.execute("SELECT CAST(Id AS nvarchar(36)), CAST(QuestionId AS nvarchar(36)), OptionKey, Stem, OrderIndex FROM QuestionOptions").fetchall())
assert o == sorted((up(x["id"]), up(r["soruId"]), x["key"], x["text"], i + 1) for r in R for i, x in enumerate(r["options"])), "şıklar aynı değil"
a = U(c.execute("SELECT CAST(QuestionId AS nvarchar(36)), CAST(CorrectOptionId AS nvarchar(36)) FROM QuestionOptionCorrectAnswers").fetchall())
assert a == sorted((up(r["soruId"]), up(r["correctOptionId"])) for r in R), "doğru cevaplar aynı değil"
cz = U(c.execute("SELECT CAST(Id AS nvarchar(36)), Code, CAST(QuestionId AS nvarchar(36)), ContentText, StructuredContentJson, Type, Title, IsActive FROM QuestionSolutions").fetchall())
assert cz == sorted((up(r["solution"]["id"]), r["solution"]["code"], up(r["soruId"]), r["solution"]["ContentText"], r["solution"]["StructuredContentJson"], 0, "Çözüm özeti", True) for r in R), "çözümler aynı değil"
sp = U(c.execute("SELECT CAST(QuestionId AS nvarchar(36)), SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence FROM QuestionMarkupSpans").fetchall())
assert sp == sorted((up(r["soruId"]), x["SegmentId"], x["SpanId"], x["Start"], x["Length"], x["ExpectedText"], x["Role"], x["Occurrence"]) for r in R for x in r["spans"]), "işaretleme aynı değil"
fg = U(c.execute("SELECT CAST(Id AS nvarchar(36)), CAST(QuestionId AS nvarchar(36)), Code, Kind, Title, Alt, DataJson, OrderIndex, StillLightUrl, StillDarkUrl, StillWidth, StillHeight FROM QuestionFigures").fetchall())
assert fg == sorted((up(f["Id"]), up(r["soruId"]), f["Code"], f["Kind"], f["Title"], f["Alt"], f["DataJson"], f["OrderIndex"], f["Still"]["light"], f["Still"]["dark"], f["Still"]["width"], f["Still"]["height"])
                    for r in R for f in r["figures"]), "figürler aynı değil"
uyusmayan = c.execute("""SELECT COUNT(*) FROM QuestionMarkupSpans s JOIN Questions q ON q.Id = s.QuestionId
 WHERE s.SegmentId = 'stem' AND SUBSTRING(REPLACE(REPLACE(q.Stem, N'<u>', N''), N'</u>', N''), s.Start + 1, s.Length) <> s.ExpectedText""").fetchone()[0]
assert uyusmayan == 0, "kökte işaretleme uyuşmazlığı"
print(f"2) eklenenler beklenenle birebir aynı: {sonra}")

# 3) API atama kuralları (ExamBookletAssignmentValidator): sistem kaynağı, Tamamlandı, bölüm slot sayıları, boş slot ve cevapsız soru yok
for b in kitaplar:
    st, sk, sub = c.execute("SELECT Status, SourceKind, CAST(CategorySubId AS nvarchar(36)) FROM QuestionBooklets WHERE Id = ?", b["id"]).fetchone()
    tam = all(any(r["slotId"] == s_["slotId"] for r in R) for s_ in b["slotlar"])
    assert sk == 0 and up(sub) == b["categorySubId"] and st == (3 if tam else 2), (b["anahtar"], st, sk)
    for bk in b["bolumler"]:
        bolum = next(x for x in kat["subs"][b["sub"]]["sections"] if x["code"] == bk)
        n, dolu, cevapli = c.execute("""SELECT COUNT(*), COUNT(q.Id), COUNT(a.Id) FROM QuestionBookletSlots s LEFT JOIN Questions q ON q.QuestionBookletSlotId = s.Id
            LEFT JOIN QuestionOptionCorrectAnswers a ON a.QuestionId = q.Id WHERE s.QuestionBookletId = ? AND s.CategorySectionId = ?""", b["id"], bolum["id"]).fetchone()
        assert n == bolum["questionCount"], (b["anahtar"], bk, n)
        if tam:
            assert dolu == cevapli == n, (b["anahtar"], bk, dolu, cevapli)
    yanlis = c.execute("""SELECT COUNT(*) FROM QuestionBookletSlots s JOIN Questions q ON q.QuestionBookletSlotId = s.Id JOIN QuestionOptionCorrectAnswers a ON a.QuestionId = q.Id
        JOIN QuestionOptions o ON o.Id = a.CorrectOptionId WHERE s.QuestionBookletId = ? AND o.OptionKey <> s.PreferredCorrectOptionKey""", b["id"]).fetchone()[0]
    assert yanlis == 0, (b["anahtar"], "cevap anahtarı plandan farklı")
print(f"3) {len(kitaplar)} kitapçık API'nin atama kurallarını sağlıyor (tamamlanmış olanlar atanabilir)")

# 4) İkinci kez ekleme durmalı, hiçbir şey değişmemeli
rc, out = sqlcmd("ekle.sql")
assert rc != 0 and "50101" in out and sayim(c) == sonra, out[-400:]
print("4) ikinci ekleme ön koşulda durdu, veri aynen duruyor")

# 5) Geri al: denemeye atanmışken durmalı
c.execute("INSERT INTO Exams VALUES (NEWID(), ?)", kitaplar[0]["id"])
rc, out = sqlcmd("geri_al.sql")
assert rc != 0 and "50201" in out and sayim(c) == sonra, out[-400:]
c.execute("DELETE FROM Exams")
print("5) denemeye atanmış kitapçık varken geri alma durdu")

rc, out = sqlcmd("geri_al.sql")
assert rc == 0, out[-800:]
assert sayim(c) == bos, sayim(c)
print("6) geri alma bütün eklenenleri sildi, tablolar ilk hâlinde")

# 7) Pasif mikroyla ekleme durmalı
mk = c.execute("SELECT TOP 1 CAST(TargetLessonMikroId AS nvarchar(36)) FROM QuestionBookletSlots").fetchone()
ilk_mikro = R[0]["lessonMikroId"] if R else kitaplar[0]["slotlar"][0]["lessonMikroId"]
c.execute("UPDATE LessonMikros SET IsActive = 0 WHERE Id = ?", ilk_mikro)
rc, out = sqlcmd("ekle.sql")
c.execute("UPDATE LessonMikros SET IsActive = 1 WHERE Id = ?", ilk_mikro)
assert rc != 0 and "50106" in out and sayim(c) == bos, out[-400:]
print("7) pasif mikro konuyla ekleme ön koşulda durdu, hiçbir şey yazılmadı")
c.close()
m.execute(f"ALTER DATABASE [{DB}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{DB}];")
print("geçici veritabanı silindi")
