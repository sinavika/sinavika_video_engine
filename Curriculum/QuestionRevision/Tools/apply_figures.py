"""Bir ek dosyasındaki figürleri (ve gerekiyorsa yeniden yazılan soruları) revizyon kayıtlarına işler.
Kullanım: python apply_figures.py <ek.json> [<ek.json> ...]          → yalnız dener, hiçbir dosyaya yazmaz
          python apply_figures.py <ek.json> ... --yaz                 → değişen dosyaları önce yedekler, sonra yazar

Ek dosyası bir liste; her öge bir soru:
  {"id": "<kimlik ya da ilk 8 karakteri>",
   "figures": [{"code": "fig1", "title": "...", "alt": "...", "visual": {motorun görseli}}],   kaydın figürlerinin yerine geçer
   "stem": "yeni kök"                       (isteğe bağlı; {{fig:kod}} her figür için tam bir kez geçmeli)
   "options": [...], "cozum": {...}, "sorun": "...", "mikro": "..."   (isteğe bağlı: soru yeniden yazılıyorsa)
   "motorIstegi": "..."                     (isteğe bağlı: motorun çizemediği figür; soru bekletilir)}
Korunan: kimlik, doğru harf ve şık sayısı. "correct" verilirse eskisiyle aynı olmalı."""
import glob, json, os, re, shutil, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paths import REVISIONS, OUTPUT

ALANLAR = {"id", "figures", "stem", "options", "cozum", "sorun", "mikro", "correct", "motorIstegi", "karar"}

ekler = [a for a in sys.argv[1:] if not a.startswith("--")]
yaz = "--yaz" in sys.argv
if not ekler:
    sys.exit(__doc__)

dosyalar, yer = {}, {}
for p in glob.glob(os.path.join(REVISIONS, "**", "*.jsonl"), recursive=True):
    kayitlar = [json.loads(l) for l in open(p, encoding="utf-8") if l.strip()]
    dosyalar[p] = kayitlar
    for i, r in enumerate(kayitlar):
        yer.setdefault(r["id"], []).append((p, i))

degisen, sorunlar, n = set(), [], 0
for ek in ekler:
    for e in json.load(open(ek, encoding="utf-8")):
        n += 1
        bulunan = [k for k in yer if k.upper().startswith(e["id"].upper())]
        if len(bulunan) != 1:
            sorunlar.append(f"{e['id']}: {len(bulunan)} kayıt bulundu")
            continue
        konumlar = yer[bulunan[0]]
        if len(konumlar) != 1:
            sorunlar.append(f"{e['id']}: kayıt birden çok dosyada")
            continue
        p, i = konumlar[0]
        r = json.loads(json.dumps(dosyalar[p][i]))
        bilinmeyen = set(e) - ALANLAR
        if bilinmeyen:
            sorunlar.append(f"{e['id']}: bilinmeyen alan {sorted(bilinmeyen)}")
            continue
        if "correct" in e and e["correct"] != r["correct"]:
            sorunlar.append(f"{e['id']}: doğru harf değişemez ({r['correct']} → {e['correct']})")
            continue
        if "options" in e and len(e["options"]) != len(r["options"]):
            sorunlar.append(f"{e['id']}: şık sayısı değişemez")
            continue
        for k in ("stem", "options", "cozum", "sorun", "mikro", "karar", "motorIstegi"):
            if k in e:
                r[k] = e[k]
        if "figures" in e:
            r["figures"] = e["figures"]
            r.pop("eskiFigurleriKoru", None)
        kodlar = [f["code"] for f in r.get("figures") or []]
        for f in r.get("figures") or []:
            if not isinstance(f.get("visual"), dict) or not f["visual"].get("kind"):
                sorunlar.append(f"{e['id']}: {f.get('code')} motorun görseli değil")
            if r["stem"].count("{{fig:%s}}" % f["code"]) != 1:
                sorunlar.append(f"{e['id']}: kökte {{{{fig:{f['code']}}}}} tam bir kez geçmiyor")
        fazla = set(re.findall(r"\{\{fig:([^}]+)\}\}", r["stem"])) - set(kodlar)
        if fazla:
            sorunlar.append(f"{e['id']}: kökte figürü olmayan atıf {sorted(fazla)}")
        dosyalar[p][i] = r
        degisen.add(p)

print(f"{n} soru, {len(degisen)} dosya değişecek, {len(sorunlar)} sorun")
for s in sorunlar:
    print("  ✗", s)
if sorunlar:
    sys.exit(1)
if not yaz:
    print("Yazılmadı (yazmak için --yaz).")
    sys.exit(0)
yedek = os.path.join(OUTPUT, "Work", "Backups", time.strftime("%Y-%m-%d-%H%M%S") + "-apply-figures")
for p in sorted(degisen):
    hedef = os.path.join(yedek, os.path.relpath(p, REVISIONS))
    os.makedirs(os.path.dirname(hedef), exist_ok=True)
    shutil.copy2(p, hedef)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        for r in dosyalar[p]:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"Yazıldı; yedek: {yedek}")
