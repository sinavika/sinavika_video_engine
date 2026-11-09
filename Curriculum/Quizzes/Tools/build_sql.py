"""Bir dersin sonuc.jsonl'ından canlıya uygulanacak SQL'i üretir. Veritabanına bağlanmaz.
Kullanım: python build_sql.py <ders_kodu>
Çıktı: Results/<ders_kodu>/guncelle.sql (tek transaction, ön koşul + satır sayısı denetimi)
       Results/<ders_kodu>/geri_al.sql  (dışa aktarılan eski hâle döndürür)
       Results/<ders_kodu>/yuklenecek-resimler.json (motor figürlerinin hazır resimleri: guncelle.sql'den ÖNCE depoya yüklenir)"""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import json, os, re, sys, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VERI, SONUC, oku

DERS = sys.argv[1]
OUT = os.path.join(SONUC, *DERS.split("/"))
R = oku(os.path.join(OUT, "sonuc.jsonl"))
ORIG = {q["id"]: q for q in oku(os.path.join(VERI, *DERS.split("/")) + ".jsonl")}


KONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def s(v):
    """Unicode metin değişmezi. Satır sonları dosyanın satır sonu biçiminden etkilenmesin diye NCHAR(10)/NCHAR(13) ile yazılır.
    Canlı veride bulunabilen NUL gibi diğer denetim karakterleri de sqlcmd dizgiyi bozmasın diye NCHAR(n) ile yazılır."""
    if v is None:
        return "NULL"
    t = "N'" + str(v).replace("'", "''") + "'"
    t = t.replace("\r", "' + NCHAR(13) + N'").replace("\n", "' + NCHAR(10) + N'")
    t = KONTROL.sub(lambda m: f"' + NCHAR({ord(m.group())}) + N'", t)
    return t


def g(v):
    return "NULL" if v is None else f"'{v}'"


def h(text):
    return "0x" + hashlib.sha256((text or "").encode("utf-16-le")).hexdigest().upper()


def chunks(rows, n=500):
    for i in range(0, len(rows), n):
        yield rows[i:i + n]


def insert(table, cols, rows):
    out = []
    for part in chunks(rows):
        out.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES\n" + ",\n".join("(" + ", ".join(r) + ")" for r in part) + ";")
    return "\n".join(out)


def resim(f, alan):
    """Figürün hazır resim alanı (motor çizimi); yoksa NULL."""
    deger = (f.get("Still") or {}).get(alan)
    if deger is None:
        return "NULL"
    return str(int(deger)) if alan in ("width", "height") else s(deger)


def betik(baslik, kayitlar, hedef_hash_alani, yazilacak, eski_resmi_koru):
    """kayitlar: soru başına dict (id, stem, subId, mikroId, options[(id,text)], correctOptionId, spans[], solution(id,content,structured), figSil[], figEkle[])
    eski_resmi_koru: silinecek figürlerden birinin hazır resmi varsa durur (geri alma dışa aktarımda olmayan resmi geri getiremez)."""
    nq = len(kayitlar)
    no = sum(len(k["options"]) for k in kayitlar)
    ns = sum(len(k["spans"]) for k in kayitlar)
    nfs = sum(len(k["figSil"]) for k in kayitlar)
    nfe = sum(len(k["figEkle"]) for k in kayitlar)
    nfr = sum(1 for k in kayitlar for f in k["figEkle"] if f.get("Still"))
    L = [f"-- {baslik}",
         f"-- Soru: {nq}, şık: {no}, işaretleme: {ns}, silinecek figür: {nfs}, eklenecek figür: {nfe} (hazır resimli: {nfr})",
         "-- Tek transaction. Ön koşul ya da satır sayısı tutmazsa hiçbir değişiklik kalmaz.",
         "SET XACT_ABORT ON;", "SET NOCOUNT ON;", "BEGIN TRANSACTION;", "",
         "CREATE TABLE #Q (Id uniqueidentifier PRIMARY KEY, BeklenenStemHash varbinary(32) NOT NULL, Stem nvarchar(max) NOT NULL, LessonSubId uniqueidentifier NULL, LessonMikroId uniqueidentifier NULL, CorrectOptionId uniqueidentifier NOT NULL);",
         "CREATE TABLE #O (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, Stem nvarchar(max) NOT NULL);",
         "CREATE TABLE #S (QuestionId uniqueidentifier NOT NULL, SegmentId nvarchar(32) NOT NULL, SpanId nvarchar(64) NOT NULL, Start int NOT NULL, Length int NOT NULL, ExpectedText nvarchar(512) NOT NULL, Role nvarchar(32) NOT NULL, Occurrence int NOT NULL);",
         "CREATE TABLE #C (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, ContentText nvarchar(max) NULL, StructuredContentJson nvarchar(max) NULL);",
         "CREATE TABLE #FS (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL);",
         "CREATE TABLE #FE (Id uniqueidentifier PRIMARY KEY, QuestionId uniqueidentifier NOT NULL, Code nvarchar(64) NOT NULL, Kind int NOT NULL, Title nvarchar(512) NULL, Alt nvarchar(1024) NULL, ImageUrl nvarchar(2048) NULL, DataJson nvarchar(max) NULL, OrderIndex int NOT NULL, CreatedAt datetime2 NULL, UpdatedAt datetime2 NULL, StillLightUrl nvarchar(2048) NULL, StillDarkUrl nvarchar(2048) NULL, StillWidth int NULL, StillHeight int NULL);",
         ""]
    L.append(insert("#Q", ["Id", "BeklenenStemHash", "Stem", "LessonSubId", "LessonMikroId", "CorrectOptionId"],
                    [[g(k["id"]), h(k[hedef_hash_alani]), s(k["stem"]), g(k["subId"]), g(k["mikroId"]), g(k["correctOptionId"])] for k in kayitlar]))
    L.append(insert("#O", ["Id", "QuestionId", "Stem"], [[g(oid), g(k["id"]), s(t)] for k in kayitlar for oid, t in k["options"]]))
    if ns:
        L.append(insert("#S", ["QuestionId", "SegmentId", "SpanId", "Start", "Length", "ExpectedText", "Role", "Occurrence"],
                        [[g(k["id"]), s(x["SegmentId"]), s(x["SpanId"]), str(x["Start"]), str(x["Length"]), s(x["ExpectedText"]), s(x["Role"]), str(x["Occurrence"])]
                         for k in kayitlar for x in k["spans"]]))
    L.append(insert("#C", ["Id", "QuestionId", "ContentText", "StructuredContentJson"],
                    [[g(k["solution"][0]), g(k["id"]), s(k["solution"][1]), s(k["solution"][2])] for k in kayitlar]))
    if nfs:
        L.append(insert("#FS", ["Id", "QuestionId"], [[g(fid), g(k["id"])] for k in kayitlar for fid in k["figSil"]]))
    if nfe:
        L.append(insert("#FE", ["Id", "QuestionId", "Code", "Kind", "Title", "Alt", "ImageUrl", "DataJson", "OrderIndex", "CreatedAt", "UpdatedAt",
                                "StillLightUrl", "StillDarkUrl", "StillWidth", "StillHeight"],
                        [[g(f["Id"]), g(k["id"]), s(f["Code"]), str(f["Kind"]), s(f.get("Title")), s(f.get("Alt")), s(f.get("ImageUrl")), s(f.get("DataJson")),
                          str(f["OrderIndex"]), s(f.get("CreatedAt")), s(f.get("UpdatedAt")),
                          resim(f, "light"), resim(f, "dark"), resim(f, "width"), resim(f, "height")]
                         for k in kayitlar for f in k["figEkle"]]))
    L += ["",
          "DECLARE @n int;",
          "-- 1) Ön koşul: sorular dışa aktarıldığı hâlde mi (kök özeti), şıklar ve çözümler bu sorulara mı ait",
          f"SELECT @n = COUNT(*) FROM dbo.Questions q JOIN #Q t ON t.Id = q.Id AND HASHBYTES('SHA2_256', q.Stem) = t.BeklenenStemHash;",
          f"IF @n <> {nq} THROW 50001, N'Ön koşul: soruların bir kısmı dışa aktarımdan sonra değişmiş ya da bulunamadı. Hiçbir şey yazılmadı.', 1;",
          f"SELECT @n = COUNT(*) FROM dbo.QuestionOptions o JOIN #O t ON t.Id = o.Id AND t.QuestionId = o.QuestionId;",
          f"IF @n <> {no} THROW 50002, N'Ön koşul: şık kimlikleri tutmuyor.', 1;",
          f"SELECT @n = COUNT(*) FROM dbo.QuestionSolutions c JOIN #C t ON t.Id = c.Id AND t.QuestionId = c.QuestionId;",
          f"IF @n <> {nq} THROW 50003, N'Ön koşul: çözüm kimlikleri tutmuyor.', 1;",
          f"SELECT @n = COUNT(*) FROM dbo.QuestionOptionCorrectAnswers a JOIN #Q t ON t.Id = a.QuestionId;",
          f"IF @n <> {nq} THROW 50004, N'Ön koşul: doğru cevap kaydı eksik.', 1;",
          *(["SELECT @n = COUNT(*) FROM dbo.QuestionFigures f JOIN #FS t ON t.Id = f.Id AND t.QuestionId = f.QuestionId WHERE f.StillLightUrl IS NOT NULL;",
              "IF @n <> 0 THROW 50005, N'Ön koşul: silinecek figürlerden birinin hazır resmi var; geri alma onu geri getiremez. Hiçbir şey yazılmadı.', 1;"]
            if eski_resmi_koru else []),
          "",
          "-- 2) Soru kökü ve hiyerarşi",
          "UPDATE q SET q.Stem = t.Stem, q.LessonSubId = t.LessonSubId, q.LessonMikroId = t.LessonMikroId, q.UpdatedAt = SYSUTCDATETIME()",
          "FROM dbo.Questions q JOIN #Q t ON t.Id = q.Id;",
          f"IF @@ROWCOUNT <> {nq} THROW 50011, N'Soru güncellemesi eksik kaldı.', 1;",
          "",
          "-- 3) Şıklar",
          "UPDATE o SET o.Stem = t.Stem FROM dbo.QuestionOptions o JOIN #O t ON t.Id = o.Id;",
          f"IF @@ROWCOUNT <> {no} THROW 50012, N'Şık güncellemesi eksik kaldı.', 1;",
          "",
          "-- 4) Doğru cevap (harf korunduğu için kimlik değişmez; yine de yazılır)",
          "UPDATE a SET a.CorrectOptionId = t.CorrectOptionId FROM dbo.QuestionOptionCorrectAnswers a JOIN #Q t ON t.Id = a.QuestionId;",
          f"IF @@ROWCOUNT <> {nq} THROW 50013, N'Doğru cevap güncellemesi eksik kaldı.', 1;",
          "",
          "-- 5) Altı çizili işaretleme kayıtları: soruların eski kayıtları silinip yenileri yazılır",
          "DELETE s FROM dbo.QuestionMarkupSpans s JOIN #Q t ON t.Id = s.QuestionId;",
          "INSERT INTO dbo.QuestionMarkupSpans (Id, QuestionId, SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence, CreatedAt)",
          "SELECT NEWID(), QuestionId, SegmentId, SpanId, Start, Length, ExpectedText, Role, Occurrence, SYSUTCDATETIME() FROM #S;",
          f"IF @@ROWCOUNT <> {ns} THROW 50014, N'İşaretleme kayıtları eksik yazıldı.', 1;",
          "",
          "-- 6) Figürler",
          "DELETE f FROM dbo.QuestionFigures f JOIN #FS t ON t.Id = f.Id AND t.QuestionId = f.QuestionId;",
          f"IF @@ROWCOUNT <> {nfs} THROW 50015, N'Silinecek figür sayısı tutmuyor.', 1;",
          "INSERT INTO dbo.QuestionFigures (Id, QuestionId, Code, Kind, Title, Alt, ImageUrl, DataJson, OrderIndex, CreatedAt, UpdatedAt, StillLightUrl, StillDarkUrl, StillWidth, StillHeight)",
          "SELECT Id, QuestionId, Code, Kind, Title, Alt, ImageUrl, DataJson, OrderIndex, ISNULL(CreatedAt, SYSUTCDATETIME()), UpdatedAt, StillLightUrl, StillDarkUrl, StillWidth, StillHeight FROM #FE;",
          f"IF @@ROWCOUNT <> {nfe} THROW 50016, N'Eklenecek figür sayısı tutmuyor.', 1;",
          "",
          "-- 7) Çözümler",
          "UPDATE c SET c.ContentText = t.ContentText, c.StructuredContentJson = t.StructuredContentJson, c.UpdatedAt = SYSUTCDATETIME()",
          "FROM dbo.QuestionSolutions c JOIN #C t ON t.Id = c.Id;",
          f"IF @@ROWCOUNT <> {nq} THROW 50017, N'Çözüm güncellemesi eksik kaldı.', 1;",
          "",
          "-- 8) Son doğrulama: yazılan kökler beklenen metinle aynı mı",
          "SELECT @n = COUNT(*) FROM dbo.Questions q JOIN #Q t ON t.Id = q.Id AND q.Stem = t.Stem;",
          f"IF @n <> {nq} THROW 50021, N'Son doğrulama tutmadı.', 1;",
          "",
          "COMMIT TRANSACTION;",
          f"PRINT N'Tamamlandı: {nq} soru, {no} şık, {ns} işaretleme, {nfs} figür silindi, {nfe} figür eklendi.';"]
    with open(os.path.join(OUT, yazilacak), "w", encoding="utf-8-sig") as f:
        f.write("\n".join(L) + "\n")
    return nq, no, ns, nfs, nfe


guncel, eski = [], []
for r in R:
    o = ORIG[r["id"]]
    guncel.append({"id": r["id"], "eskiStem": o["stem"], "stem": r["stem"], "subId": r["lessonSubId"], "mikroId": r["lessonMikroId"],
                   "options": [(x["id"], x["text"]) for x in r["options"]], "correctOptionId": r["correctOptionId"], "spans": r["spans"],
                   "solution": (r["solution"]["id"], r["solution"]["ContentText"], r["solution"]["StructuredContentJson"]),
                   "figSil": r["silinecekFigurIds"], "figEkle": r["eklenecekFigurler"]})
    sol = o["solutions"][0]
    eski.append({"id": r["id"], "yeniStem": r["stem"], "stem": o["stem"], "subId": o["hierarchy"]["lessonSubId"], "mikroId": o["hierarchy"]["lessonMikroId"],
                 "options": [(x["id"], x["text"]) for x in o["options"]], "correctOptionId": o["correctOptionId"],
                 "spans": [{**x} for x in o["markupSpans"]],
                 "solution": (sol["Id"], sol["ContentText"], sol["StructuredContentJson"]),
                 "figSil": [f["Id"] for f in r["eklenecekFigurler"]], "figEkle": [f for f in o["figures"] if f["Id"] in r["silinecekFigurIds"]]})

a = betik(f"{DERS} quiz revizyonu — GÜNCELLEME (önce yuklenecek-resimler.json'daki resimler depoya yüklenir)", guncel, "eskiStem", "guncelle.sql", True)
b = betik(f"{DERS} quiz revizyonu — GERİ ALMA (dışa aktarılan eski hâle döner)", eski, "yeniStem", "geri_al.sql", False)

# Hazır resimler: SQL'deki adresler dosya içeriğinin SHA-256 özetidir; dosyalar guncelle.sql'den önce yüklenmelidir.
resimler = {}
for k in guncel:
    for f in k["figEkle"]:
        for tema in ("light", "dark"):
            if f.get("Still"):
                url, dosya = f["Still"][tema], f["StillFiles"][tema]
                resimler[url] = {"url": url, "dosya": dosya, "ad": url.rsplit("/", 1)[1]}
with open(os.path.join(OUT, "yuklenecek-resimler.json"), "w", encoding="utf-8") as f:
    json.dump(sorted(resimler.values(), key=lambda x: x["ad"]), f, ensure_ascii=False, indent=1)
print("yuklenecek-resimler.json:", len(resimler), "dosya")
print("guncelle.sql:", a, os.path.getsize(os.path.join(OUT, "guncelle.sql")) // 1024, "KB")
print("geri_al.sql:", b, os.path.getsize(os.path.join(OUT, "geri_al.sql")) // 1024, "KB")
