"""Bir dersin guncelle.sql ve geri_al.sql betiklerini LocalDB'de geçici bir veritabanında uçtan uca dener. Canlıya bağlanmaz.
Kullanım: python dry_run_sql.py <ders_kodu>
Adımlar: dışa aktarılan hâlle tohumla -> değişmiş kökle güncelle (durmalı) -> güncelle -> beklenenle karşılaştır -> geri al -> ilk hâlle karşılaştır -> sil."""
import json, os, sys, subprocess, pyodbc
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VERI, SONUC, oku

DERS = sys.argv[1]
KLASOR = os.path.join(SONUC, *DERS.split("/"))
DB, SERVER = "SoruRevizyonDeneme", r"(localdb)\MSSQLLocalDB"
R = oku(os.path.join(KLASOR, "sonuc.jsonl"))
ORIG = {q["id"]: q for q in oku(os.path.join(VERI, *DERS.split("/")) + ".jsonl")}


def con(db="master"):
    return pyodbc.connect(f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={SERVER};DATABASE={db};Trusted_Connection=yes;TrustServerCertificate=yes", autocommit=True)


def sqlcmd(name):
    p = subprocess.run(["sqlcmd", "-S", SERVER, "-d", DB, "-b", "-f", "65001", "-i", os.path.join(KLASOR, name)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    return p.returncode, (p.stdout + p.stderr).strip()


def snapshot(c):
    cur = c.cursor()
    U = lambda rows: sorted(tuple(x.upper() if isinstance(x, str) and len(x) == 36 and x.count("-") == 4 else x for x in r) for r in rows)
    return {
        "q": U(cur.execute("SELECT CAST(Id AS nvarchar(36)), Stem, CAST(LessonSubId AS nvarchar(36)), CAST(LessonMikroId AS nvarchar(36)) FROM Questions").fetchall()),
        "o": U(cur.execute("SELECT CAST(Id AS nvarchar(36)), Stem FROM QuestionOptions").fetchall()),
        "c": U(cur.execute("SELECT CAST(Id AS nvarchar(36)), ContentText, StructuredContentJson FROM QuestionSolutions").fetchall()),
        "a": U(cur.execute("SELECT CAST(QuestionId AS nvarchar(36)), CAST(CorrectOptionId AS nvarchar(36)) FROM QuestionOptionCorrectAnswers").fetchall()),
        "s": U(cur.execute("SELECT CAST(QuestionId AS nvarchar(36)), SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence FROM QuestionMarkupSpans").fetchall()),
        "f": U(cur.execute("SELECT CAST(Id AS nvarchar(36)), CAST(QuestionId AS nvarchar(36)), Code, Kind, Title, Alt, ImageUrl, DataJson, OrderIndex, StillLightUrl, StillDarkUrl, StillWidth, StillHeight FROM QuestionFigures").fetchall()),
    }


m = con()
m.execute(f"IF DB_ID('{DB}') IS NOT NULL BEGIN ALTER DATABASE [{DB}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{DB}]; END")
m.execute(f"CREATE DATABASE [{DB}]")
c = con(DB)
c.execute("""CREATE TABLE Questions (Id uniqueidentifier PRIMARY KEY, Stem nvarchar(max) NOT NULL, LessonSubId uniqueidentifier NULL, LessonMikroId uniqueidentifier NULL, UpdatedAt datetime2 NULL);
CREATE TABLE QuestionOptions (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, Stem nvarchar(max) NOT NULL);
CREATE TABLE QuestionSolutions (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, ContentText nvarchar(max) NULL, StructuredContentJson nvarchar(max) NULL, UpdatedAt datetime2 NULL);
CREATE TABLE QuestionOptionCorrectAnswers (Id uniqueidentifier PRIMARY KEY DEFAULT NEWID(), QuestionId uniqueidentifier NOT NULL, CorrectOptionId uniqueidentifier NOT NULL);
CREATE TABLE QuestionMarkupSpans (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, SegmentId nvarchar(32) NOT NULL, SpanId nvarchar(64) NOT NULL, Start int NOT NULL, Length int NOT NULL, ExpectedText nvarchar(512) NOT NULL, Role nvarchar(32) NOT NULL, Occurrence int NOT NULL, CreatedAt datetime2 NOT NULL);
CREATE TABLE QuestionFigures (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, Code nvarchar(64) NOT NULL, Kind int NOT NULL, Title nvarchar(512) NULL, Alt nvarchar(1024) NULL, ImageUrl nvarchar(2048) NULL, DataJson nvarchar(max) NULL, OrderIndex int NOT NULL, CreatedAt datetime2 NOT NULL, UpdatedAt datetime2 NULL, StillLightUrl nvarchar(2048) NULL, StillDarkUrl nvarchar(2048) NULL, StillWidth int NULL, StillHeight int NULL);
-- Canlıdaki tekil dizinler (ModelCreatingConfigurations): deneme bunları da sınasın (1 Kasım 2026'da canlıda yakalanan hata).
CREATE UNIQUE INDEX UX_QuestionMarkupSpans_QuestionId_SpanId ON QuestionMarkupSpans (QuestionId, SpanId);
CREATE UNIQUE INDEX UX_QuestionFigures_QuestionId_Code ON QuestionFigures (QuestionId, Code);""")
cur = c.cursor()
for r in R:
    o = ORIG[r["id"]]
    cur.execute("INSERT INTO Questions (Id, Stem, LessonSubId, LessonMikroId) VALUES (?,?,?,?)", o["id"], o["stem"], o["hierarchy"]["lessonSubId"], o["hierarchy"]["lessonMikroId"])
    for x in o["options"]:
        cur.execute("INSERT INTO QuestionOptions VALUES (?,?,?)", x["id"], o["id"], x["text"])
    sol = o["solutions"][0]
    cur.execute("INSERT INTO QuestionSolutions (Id, QuestionId, ContentText, StructuredContentJson) VALUES (?,?,?,?)", sol["Id"], o["id"], sol["ContentText"], sol["StructuredContentJson"])
    cur.execute("INSERT INTO QuestionOptionCorrectAnswers (QuestionId, CorrectOptionId) VALUES (?,?)", o["id"], o["correctOptionId"])
    for x in o["markupSpans"]:
        cur.execute("INSERT INTO QuestionMarkupSpans VALUES (NEWID(),?,?,?,?,?,?,?,?,SYSUTCDATETIME())", o["id"], x["SegmentId"], x["SpanId"], x["Start"], x["Length"], x["ExpectedText"], x["Role"], x["Occurrence"])
    for f in o["figures"]:
        cur.execute("INSERT INTO QuestionFigures (Id, QuestionId, Code, Kind, Title, Alt, ImageUrl, DataJson, OrderIndex, CreatedAt, StillLightUrl, StillDarkUrl, StillWidth, StillHeight) "
                    "VALUES (?,?,?,?,?,?,?,?,?,SYSUTCDATETIME(),?,?,?,?)",
                    f["Id"], o["id"], f["Code"], f["Kind"], f["Title"], f["Alt"], f["ImageUrl"], f["DataJson"], f["OrderIndex"],
                    f.get("StillLightUrl"), f.get("StillDarkUrl"), f.get("StillWidth"), f.get("StillHeight"))
once = snapshot(c)
print("tohum:", {k: len(v) for k, v in once.items()})

bozuk = R[0]["id"]
c.execute("UPDATE Questions SET Stem = Stem + N'#' WHERE Id = ?", bozuk)
rc, out = sqlcmd("guncelle.sql")
c.execute("UPDATE Questions SET Stem = LEFT(Stem, LEN(Stem + 'x') - 2) WHERE Id = ?", bozuk)
assert rc != 0 and snapshot(c) == once, "Ön koşul çalışmadı ya da kısmi yazma kaldı!"
print("1) değişmiş kökle güncelleme durdu, veri aynen duruyor")

silinecek = next(((fid, r["id"]) for r in R for fid in r["silinecekFigurIds"]), None)
if silinecek:
    # Silinecek eski figürün hazır resmi olsaydı geri alma onu geri getiremezdi: güncelleme durmalı.
    sahte = "https://example.blob.core.windows.net/work-figure-stills/" + "0" * 64 + ".svg"
    c.execute("UPDATE QuestionFigures SET StillLightUrl = ?, StillDarkUrl = ?, StillWidth = 1280, StillHeight = 720 WHERE Id = ?", sahte, sahte, silinecek[0])
    rc, out = sqlcmd("guncelle.sql")
    c.execute("UPDATE QuestionFigures SET StillLightUrl = NULL, StillDarkUrl = NULL, StillWidth = NULL, StillHeight = NULL WHERE Id = ?", silinecek[0])
    assert rc != 0 and "50005" in out and snapshot(c) == once, "Hazır resimli eski figür koruması çalışmadı!"
    print("1b) silinecek eski figürün hazır resmi varken güncelleme durdu, veri aynen duruyor")

rc, out = sqlcmd("guncelle.sql")
assert rc == 0, out[-500:]
sonra = snapshot(c)
up = lambda x: x.upper() if x else x
assert sonra["q"] == sorted((up(r["id"]), r["stem"], up(r["lessonSubId"]), up(r["lessonMikroId"])) for r in R), "kökler beklenenle aynı değil"
assert sonra["o"] == sorted((up(x["id"]), x["text"]) for r in R for x in r["options"]), "şıklar beklenenle aynı değil"
assert sonra["c"] == sorted((up(r["solution"]["id"]), r["solution"]["ContentText"], r["solution"]["StructuredContentJson"]) for r in R), "çözümler aynı değil"
assert sonra["a"] == sorted((up(r["id"]), up(r["correctOptionId"])) for r in R), "doğru cevaplar aynı değil"
assert sonra["s"] == sorted((up(r["id"]), x["SegmentId"], x["SpanId"], x["Start"], x["Length"], x["ExpectedText"], x["Role"], x["Occurrence"]) for r in R for x in r["spans"]), "işaretleme aynı değil"
korunan = [(up(f["Id"]), up(r["id"]), f["Code"], f["Kind"], f["Title"], f["Alt"], f["ImageUrl"], f["DataJson"], f["OrderIndex"],
            f.get("StillLightUrl"), f.get("StillDarkUrl"), f.get("StillWidth"), f.get("StillHeight"))
           for r in R for f in ORIG[r["id"]]["figures"] if f["Id"] not in r["silinecekFigurIds"]]
resim = lambda f, k: (f.get("Still") or {}).get(k)
eklenen = [(up(f["Id"]), up(r["id"]), f["Code"], f["Kind"], f["Title"], f["Alt"], None, f["DataJson"], f["OrderIndex"],
            resim(f, "light"), resim(f, "dark"), resim(f, "width"), resim(f, "height")) for r in R for f in r["eklenecekFigurler"]]
assert all(resim(f, "light") for r in R for f in r["eklenecekFigurler"] if f.get("Engine")), "hazır resmi olmayan motor figürü SQL'e girmiş"
assert sonra["f"] == sorted(korunan + eklenen), "figürler aynı değil"
uyusmayan = c.execute("""SELECT COUNT(*) FROM QuestionMarkupSpans s JOIN Questions q ON q.Id = s.QuestionId
 WHERE s.SegmentId = 'stem' AND SUBSTRING(REPLACE(REPLACE(q.Stem, N'<u>', N''), N'</u>', N''), s.Start + 1, s.Length) <> s.ExpectedText""").fetchone()[0]
assert uyusmayan == 0, "kökte işaretleme uyuşmazlığı"
print(f"2) güncelleme beklenenle birebir aynı (soru {len(R)}, işaretleme {len(sonra['s'])}, figür {len(sonra['f'])})")

rc, out = sqlcmd("geri_al.sql")
assert rc == 0, out[-500:]
geri = snapshot(c)
for k in once:
    assert geri[k] == once[k], f"geri almada fark: {k}"
print("3) geri alma ilk hâlle birebir aynı")
c.close()
m.execute(f"ALTER DATABASE [{DB}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{DB}];")
print("geçici veritabanı silindi")
