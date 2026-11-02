"""Bir dersin motor figürlerini motora çizdirir ve hazır resimleri Results/<ders>/stills.json'a yazar.
Kullanım: python render_figures.py <ders_kodu> [--force]      örn. YKS/YKS_TYT/COG
Önce check_revisions.py çizilecek görsellerin listesini (Results/<ders>/soru-figurleri-….jsonl) yazar; sonra bu araç
motorun çizicisiyle (RenderFigures.ts) Outputs/QuestionRevision/Figures/<ders>/ altına açık ve koyu tema SVG'leri
üretir; en son check_revisions.py yeniden çalışır ve hazır resimleri figürlere bağlar.

stills.json: {"<temsilci>_<kod>": {"hash", "light", "dark", "width", "height", "files": {"light", "dark"}}}
  hash: görselin içerik özeti (görsel sonradan değişirse resim eski sayılır)
  light/dark: API'nin kabındaki adres (içeriğin SHA-256 özeti); dosyalar guncelle.sql'den önce yüklenir."""
import hashlib, json, os, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SONUC, oku, gorsel_ozeti, liste_adi
from paths import ENGINE, FIGURES, STILL_BASE_URL

ders = sys.argv[1]
klasor = os.path.join(SONUC, *ders.split("/"))
liste = os.path.join(klasor, liste_adi(ders))
cikti = os.path.join(FIGURES, *ders.split("/"))
if not os.path.exists(liste):
    sys.exit(f"Liste yok: {liste}. Önce check_revisions.py {ders} çalıştırılmalı.")

komut = ["node", os.path.join(ENGINE, "node_modules", "tsx", "dist", "cli.mjs"), os.path.join("Curriculum", "QuestionRevision", "Tools", "RenderFigures.ts"),
         liste, cikti, "--concurrency", os.environ.get("FIGURE_CONCURRENCY", "2")] + (["--force"] if "--force" in sys.argv else [])
p = subprocess.run(komut, cwd=ENGINE)

manifest = json.load(open(os.path.join(cikti, "manifest.json"), encoding="utf-8")) if os.path.exists(os.path.join(cikti, "manifest.json")) else {}
stills, eksik = {}, []
for row in oku(liste):
    m = manifest.get(row["id"])
    if not m:
        eksik.append(row["id"])
        continue
    kayit = {"hash": gorsel_ozeti(row["visual"]), "width": m["width"], "height": m["height"], "files": {}}
    for tema in ("light", "dark"):
        dosya = m[tema]
        ozet = hashlib.sha256(open(dosya, "rb").read()).hexdigest()
        assert ozet == m["sha256"][tema], f"{row['id']} {tema}: dosya manifestteki özetle aynı değil"
        kayit[tema] = f"{STILL_BASE_URL}{ozet}.{m['format']}"
        kayit["files"][tema] = dosya
    stills[row["id"]] = kayit
with open(os.path.join(klasor, "stills.json"), "w", encoding="utf-8") as f:
    json.dump(stills, f, ensure_ascii=False, indent=1)
print(f"{ders}: {len(stills)} figürün hazır resmi var, {len(eksik)} çizilemedi" + (": " + ", ".join(eksik[:10]) if eksik else ""))
sys.exit(1 if eksik or p.returncode else 0)
