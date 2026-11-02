"""Bir ayın deneme ekle.sql'ini CANLI veritabanında çalıştırır ve sonucu geri okuyup doğrular. Yalnız sahibinin açık onayıyla.
Kullanım: python apply_exam_sql.py <ay> --canli [--secim]             → ekle.sql
          python apply_exam_sql.py <ay> --canli --geri-al [--secim]   → geri_al.sql (eklenen kitapçıkları siler; atanmışsa durur)
Önce:     python upload_stills.py Exams/<ay>[/_secim] --yukle  ve  --var-mi (SQL hazır resimler depoda değilken çalışmaz)
Betik tek transaction'dır (XACT_ABORT): ön koşul ya da satır sayısı tutmazsa THROW eder ve hiçbir değişiklik kalmaz.
Bağlantı sinavika'nın appsettings.Secrets.local.json dosyasından okunur; parola ekrana yazılmaz."""
import json, os, sys, time, pyodbc
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import oku
from database import SECRETS
from exam_common import EXAM_RESULTS, plan

ay = sys.argv[1]
if "--canli" not in sys.argv:
    sys.exit("Canlıya yazar; --canli verilmeden çalışmaz.")
geri = "--geri-al" in sys.argv
klasor = os.path.join(EXAM_RESULTS, ay, *(["_secim"] if "--secim" in sys.argv else []))
dosya = os.path.join(klasor, "geri_al.sql" if geri else "ekle.sql")
betik = open(dosya, encoding="utf-8-sig").read()
cs = json.load(open(SECRETS, encoding="utf-8-sig"))["ConnectionStrings"]["DatabaseConnection"]
p = dict(x.split("=", 1) for x in cs.split(";") if "=" in x)
con = pyodbc.connect(f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={p['Server']};DATABASE={p['Initial Catalog']};UID={p['User ID']};PWD={p['Password']};"
                     "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30", autocommit=True)
con.timeout = 900
cur = con.cursor()
t0 = time.time()
try:
    cur.execute(betik)
    while cur.nextset():
        pass
except pyodbc.Error as e:
    sys.exit(f"{ay}: SQL durdu, hiçbir değişiklik kalmadı → {str(e)[:400]}")
print(f"{ay}: {os.path.basename(dosya)} uygulandı ({time.time() - t0:.0f} sn); doğrulanıyor…")

# Doğrulama: canlıdaki hâl beklenen hâl mi
pl = plan(ay)
kitaplar = [b for b in pl["kitapciklar"] if f"'{b['id']}'" in betik]
U = lambda v: v.upper() if isinstance(v, str) else v
hata = []
for b in kitaplar:
    var = cur.execute("SELECT Status, Code FROM dbo.QuestionBooklets WHERE Id = ?", b["id"]).fetchone()
    if geri:
        if var:
            hata.append(f"{b['anahtar']}: kitapçık hâlâ duruyor")
        continue
    R = oku(os.path.join(EXAM_RESULTS, ay, b["anahtar"], "sonuc.jsonl"))
    if not var or var[1] != b["kod"]:
        hata.append(f"{b['anahtar']}: kitapçık yok ya da kodu farklı")
        continue
    if var[0] != (3 if len(R) == b["soru"] else 2):
        hata.append(f"{b['anahtar']}: durum {var[0]}")
    slot = cur.execute("SELECT COUNT(*) FROM dbo.QuestionBookletSlots WHERE QuestionBookletId = ?", b["id"]).fetchone()[0]
    if slot != b["soru"]:
        hata.append(f"{b['anahtar']}: slot {slot} ≠ {b['soru']}")
    canli = {U(r[0]): r[1:] for r in cur.execute("""SELECT CAST(q.Id AS nvarchar(36)), q.Stem, q.Code, o.OptionKey,
        (SELECT COUNT(*) FROM dbo.QuestionOptions x WHERE x.QuestionId = q.Id), (SELECT COUNT(*) FROM dbo.QuestionFigures f WHERE f.QuestionId = q.Id AND f.StillLightUrl IS NOT NULL),
        (SELECT COUNT(*) FROM dbo.QuestionMarkupSpans m WHERE m.QuestionId = q.Id), (SELECT COUNT(*) FROM dbo.QuestionSolutions c WHERE c.QuestionId = q.Id AND c.QuestionBookletId = s.QuestionBookletId)
        FROM dbo.Questions q JOIN dbo.QuestionBookletSlots s ON s.Id = q.QuestionBookletSlotId
        JOIN dbo.QuestionOptionCorrectAnswers a ON a.QuestionId = q.Id JOIN dbo.QuestionOptions o ON o.Id = a.CorrectOptionId
        WHERE s.QuestionBookletId = ?""", b["id"]).fetchall()}
    for r in R:
        c = canli.get(U(r["soruId"]))
        bek = (r["stem"], r["soruKodu"], r["correctKey"], 5, len(r["figures"]), len(r["spans"]), 1)
        if not c or tuple(c) != bek:
            hata.append(f"{b['anahtar']} {r['ders']} {r['dersSira']}: canlıdaki hâl farklı")
    if len(canli) != len(R):
        hata.append(f"{b['anahtar']}: canlıda {len(canli)} soru, beklenen {len(R)}")
print("\n".join(hata[:30]) if hata else f"Doğrulandı: {len(kitaplar)} kitapçık {'silindi' if geri else 'beklenenle birebir'}.")
sys.exit(1 if hata else 0)
