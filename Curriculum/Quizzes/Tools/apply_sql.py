"""Bir dersin SQL'ini CANLI veritabanında çalıştırır ve sonucu geri okuyup doğrular. Yalnız sahibinin açık onayıyla.
Kullanım: python apply_sql.py <ders_kodu> --canli              → guncelle.sql
          python apply_sql.py <ders_kodu> --canli --geri-al    → geri_al.sql (dışa aktarılan eski hâle döner)
Betik tek transaction'dır (XACT_ABORT): ön koşul ya da satır sayısı tutmazsa THROW eder ve hiçbir değişiklik kalmaz.
Çalıştıktan sonra kökler, şıklar, çözümler ve figürler canlıdan okunup sonuc.jsonl ile karşılaştırılır.
Bağlantı sinavika'nın appsettings.Secrets.local.json dosyasından okunur; parola ekrana yazılmaz."""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import json, os, sys, time, pyodbc

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SONUC, VERI, oku
from database import SECRETS

ders = sys.argv[1]
if "--canli" not in sys.argv:
    sys.exit("Canlıya yazar; --canli verilmeden çalışmaz.")
geri = "--geri-al" in sys.argv
klasor = os.path.join(SONUC, *ders.split("/"))
dosya = os.path.join(klasor, "geri_al.sql" if geri else "guncelle.sql")
betik = open(dosya, encoding="utf-8-sig").read()

cs = json.load(open(SECRETS, encoding="utf-8-sig"))["ConnectionStrings"]["DatabaseConnection"]
p = dict(x.split("=", 1) for x in cs.split(";") if "=" in x)
con = pyodbc.connect(f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={p['Server']};DATABASE={p['Initial Catalog']};UID={p['User ID']};PWD={p['Password']};"
                     "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30", autocommit=True)
con.timeout = 600
t0 = time.time()
cur = con.cursor()
try:
    cur.execute(betik)
    while cur.nextset():
        pass
except pyodbc.Error as e:
    sys.exit(f"{ders}: SQL durdu, hiçbir değişiklik kalmadı → {str(e)[:400]}")
print(f"{ders}: {os.path.basename(dosya)} uygulandı ({time.time() - t0:.0f} sn); doğrulanıyor…")

# Doğrulama: canlıdaki hâl beklenen hâl mi
R = oku(os.path.join(klasor, "sonuc.jsonl"))
ORIG = {q["id"]: q for q in oku(os.path.join(VERI, *ders.split("/")) + ".jsonl")}
ids = [r["id"] for r in R]
U = lambda v: v.upper() if isinstance(v, str) else v


def rows(sql, key):
    out = {}
    for i in range(0, len(ids), 500):
        liste = ",".join(f"'{x}'" for x in ids[i:i + 500])
        for row in cur.execute(sql.format(liste)).fetchall():
            out.setdefault(U(row[0]), []).append(tuple(row[1:]))
    return out


kok = rows("SELECT CAST(Id AS nvarchar(36)), Stem FROM dbo.Questions WHERE Id IN ({})", "id")
sik = rows("SELECT CAST(QuestionId AS nvarchar(36)), CAST(Id AS nvarchar(36)), Stem FROM dbo.QuestionOptions WHERE QuestionId IN ({})", "q")
coz = rows("SELECT CAST(QuestionId AS nvarchar(36)), ContentText FROM dbo.QuestionSolutions WHERE QuestionId IN ({})", "q")
fig = rows("SELECT CAST(QuestionId AS nvarchar(36)), CAST(Id AS nvarchar(36)), Kind, StillLightUrl FROM dbo.QuestionFigures WHERE QuestionId IN ({})", "q")
isa = rows("SELECT CAST(QuestionId AS nvarchar(36)), SegmentId, SpanId, Start, Length, ExpectedText FROM dbo.QuestionMarkupSpans WHERE QuestionId IN ({})", "q")
hata = []
for r in R:
    q = U(r["id"])
    beklenen_isa = ORIG[r["id"]]["markupSpans"] if geri else r["spans"]
    if sorted(tuple(x) for x in isa.get(q, [])) != sorted((s["SegmentId"], s["SpanId"], s["Start"], s["Length"], s["ExpectedText"]) for s in beklenen_isa):
        hata.append(f"{r['code']}: işaretleme")
    beklenen_kok = ORIG[r["id"]]["stem"] if geri else r["stem"]
    if kok.get(q, [(None,)])[0][0] != beklenen_kok:
        hata.append(f"{r['code']}: kök")
    beklenen_sik = {U(o["id"]): o["text"] for o in (ORIG[r["id"]]["options"] if geri else r["options"])}
    if {U(i): t for i, t in sik.get(q, [])} != beklenen_sik:
        hata.append(f"{r['code']}: şıklar")
    beklenen_coz = ORIG[r["id"]]["solutions"][0]["ContentText"] if geri else r["solution"]["ContentText"]
    if [c[0] for c in coz.get(q, [])] != [beklenen_coz]:
        hata.append(f"{r['code']}: çözüm")
    if not geri:
        silinen = {U(x) for x in r["silinecekFigurIds"]}
        eklenen = {U(f["Id"]): f for f in r["eklenecekFigurler"]}
        canli = {U(i): (k, s) for i, k, s in fig.get(q, [])}
        if silinen & set(canli):
            hata.append(f"{r['code']}: silinecek figür duruyor")
        for fid, f in eklenen.items():
            if fid not in canli or canli[fid][0] != f["Kind"] or canli[fid][1] != (f.get("Still") or {}).get("light"):
                hata.append(f"{r['code']}: figür {f['Code']}")
print(f"{ders}: {len(R)} soru doğrulandı, {len(hata)} fark" + (": " + " | ".join(hata[:10]) if hata else ""))
sys.exit(1 if hata else 0)
