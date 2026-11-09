"""Bir kitapçığın bir dersinin deneme figürlerini çizer ve gözle kontrol için tek bir PNG üretir. Kayıtlara ve hazır resimlere dokunmaz.
Kullanım: python exam_preview.py <ay> <kitapçık> <ders> [--koyu]
Önce:     python check_exams.py <ay> <kitapçık> --ders <ders>   (görsel listesini Results/Exams/<ay>/<kitapçık>/_ders/<ders>/ altına yazar)
Çıktı:    Outputs/Exams/Work/render/<ay>/<kitapçık>/<ders>/ (çizimler) ve
          Outputs/Exams/Work/<ay>/<kitapçık>_<ders>-onizleme.png
Geçici çizim hatasında (ERR_CONNECTION_RESET, NetworkError) komutu yeniden çalıştırın; çizilenler atlanır."""
import glob, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exam_common import EXAM_RESULTS, EXAM_WORK, soru_dosyasi
from paths import ENGINE, RENDER_FIGURES_TS, TSX  # noqa: F401

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
ay, anahtar, ders = sys.argv[1], sys.argv[2], sys.argv[3]
koyu = "--koyu" in sys.argv
liste = glob.glob(os.path.join(EXAM_RESULTS, ay, anahtar, "_ders", ders, "soru-figurleri-*.jsonl"))
if not liste:
    sys.exit(f"Liste yok: önce check_exams.py {ay} {anahtar} --ders {ders}")
satirlar = [json.loads(l) for l in open(liste[0], encoding="utf-8") if l.strip()]
if not satirlar:
    sys.exit(f"{anahtar}/{ders}: figür yok.")
cikti = os.path.join(EXAM_WORK, "render", ay, anahtar, ders)
p = subprocess.run(["node", TSX, RENDER_FIGURES_TS, liste[0], cikti, "--concurrency", "1"],
                   cwd=ENGINE, capture_output=True, text=True, encoding="utf-8")
print("\n".join(l for l in (p.stdout + p.stderr).splitlines() if "✗" in l or "çizildi" in l))
man = json.load(open(os.path.join(cikti, "manifest.json"), encoding="utf-8"))
tema, zemin = ("dark", "#0F1115") if koyu else ("light", "#FAFAFA")
sira = {r["soruId"]: r["dersSira"] for r in map(json.loads, open(soru_dosyasi(ay, anahtar, ders), encoding="utf-8"))}
h = ["<!doctype html><meta charset=utf-8><body style='margin:4px;font:12px sans-serif;background:#fff'><div style='display:grid;grid-template-columns:repeat(4,360px);gap:6px'>"]
for s in satirlar:
    m = man.get(s["id"])
    if m:
        h.append(f"<div><div><b>sıra {sira.get(s['id'].rsplit('_', 1)[0], '?')}</b> {s['id'].split('_')[-1]} · {s['visual']['kind']}</div><img src='file:///{m[tema]}' style='width:360px;background:{zemin}'></div>")
os.makedirs(os.path.join(EXAM_WORK, ay), exist_ok=True)
html = os.path.join(EXAM_WORK, ay, f"{anahtar}_{ders}-onizleme.html")
open(html, "w", encoding="utf-8").write("\n".join(h))
png = html.replace(".html", ".png")
satir = (len(h) - 1 + 3) // 4
subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size=1470,{min(16000, 80 + satir * 480)}", f"--screenshot={png}", "file:///" + html.replace("\\", "/")], capture_output=True)
print("ön izleme:", png, "(Read ile açın; uzunsa PIL ile parçalara bölün).")
