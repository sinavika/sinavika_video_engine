"""Motor düzeltmesinden sonra canlıdaki quiz figürlerinin hazır resimlerini yeniler (Claude içerik API'si, docs/claude/Claude-Icerik-API.md §2–§3).
Figürün türü ve verisi değişmez; yalnız motorun yeniden çizdiği resim (açık/koyu adres, en, boy) yazılır.
Kullanım: python refresh_stills_api.py <ders_kodu> --tur solid [--sekil cone,cylinder] [--ciz] [--yukle] [--kuru] [--canli]
          örn. python refresh_stills_api.py YKS/YKS_TYT/GEO --tur solid --ciz --yukle --kuru
  --ciz    seçilen görselleri motorla yeniden çizer (Figures/<ders>/, --force) ve değişenleri listeler
  --yukle  değişen resimleri API'nin kabına yükler (upload_stills.py; aynı içerik aynı adrese gider)
  --kuru   canlı hâli dışa aktarır (questions/export), resmi değişen figürle revizyonu dryRun gönderir
  --canli  revizyonu yazar (sahibinin onayıyla), canlıdan geri okuyup doğrular ve Results/<ders>/stills.json'u günceller
Çıktı:    Results/<ders>/_resim-yenileme/ (yenilenecekler.json, yuklenecek-resimler.json, revizyon-*.json, yanıtlar)"""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import glob, hashlib, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import REVIZYON, SONUC, gorsel_ozeti, oku
from content_api import cagir
from paths import ENGINE, FIGURES, RENDER_FIGURES_TS, STILL_BASE_URL, TSX
from engine_paths import TOOLS

ders = sys.argv[1]
tur = sys.argv[sys.argv.index("--tur") + 1]
sekiller = set(sys.argv[sys.argv.index("--sekil") + 1].split(",")) if "--sekil" in sys.argv else None
KLASOR = os.path.join(SONUC, *ders.split("/"), "_resim-yenileme")
os.makedirs(KLASOR, exist_ok=True)
STILLS = os.path.join(SONUC, *ders.split("/"), "stills.json")
CIKTI = os.path.join(FIGURES, *ders.split("/"))
stills = json.load(open(STILLS, encoding="utf-8"))

# 1) Seçilen görseller (temsilci soru kimliği + figür kodu)
secilen = {}
for p in sorted(glob.glob(os.path.join(REVIZYON, *ders.split("/"), "*.jsonl"))):
    for r in oku(p):
        for f in r.get("figures") or []:
            v = f.get("visual") or {}
            if v.get("kind") == tur and (not sekiller or v.get("shape") in sekiller):
                secilen[f"{r['id']}_{f['code']}"] = {"soru": r["id"], "kod": f["code"], "visual": v}
print(f"{ders}: {len(secilen)} figür seçildi ({tur}{' ' + ','.join(sorted(sekiller)) if sekiller else ''})")

if "--ciz" in sys.argv:
    liste = os.path.join(KLASOR, "liste.jsonl")
    with open(liste, "w", encoding="utf-8", newline="\n") as f:
        for k, x in secilen.items():
            f.write(json.dumps({"id": k, "visual": x["visual"]}, ensure_ascii=False) + "\n")
    p = subprocess.run(["node", TSX, RENDER_FIGURES_TS,
                        liste, CIKTI, "--concurrency", "2", "--force"], cwd=ENGINE, capture_output=True, text=True, encoding="utf-8")
    print("\n".join(l for l in (p.stdout + p.stderr).splitlines() if "çizildi" in l or "✗" in l))
    man = json.load(open(os.path.join(CIKTI, "manifest.json"), encoding="utf-8"))
    yeni, degisen = {}, []
    for k, x in secilen.items():
        m = man[k]
        kayit = {"hash": gorsel_ozeti(x["visual"]), "width": m["width"], "height": m["height"], "files": {}}
        for tema in ("light", "dark"):
            ozet = hashlib.sha256(open(m[tema], "rb").read()).hexdigest()
            kayit[tema] = f"{STILL_BASE_URL}{ozet}.{m['format']}"
            kayit["files"][tema] = m[tema]
        yeni[k] = kayit
        eski = stills.get(k) or {}
        if (eski.get("light"), eski.get("dark"), eski.get("width"), eski.get("height")) != (kayit["light"], kayit["dark"], kayit["width"], kayit["height"]):
            degisen.append(k)
    json.dump({"yeni": yeni, "degisen": degisen}, open(os.path.join(KLASOR, "yenilenecekler.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    resimler = {}
    for k in degisen:
        for tema in ("light", "dark"):
            url = yeni[k][tema]
            resimler[url] = {"url": url, "dosya": yeni[k]["files"][tema], "ad": url.rsplit("/", 1)[1]}
    json.dump(sorted(resimler.values(), key=lambda r: r["ad"]), open(os.path.join(KLASOR, "yuklenecek-resimler.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"resmi değişen figür: {len(degisen)}/{len(secilen)} · yüklenecek dosya {len(resimler)}")

durum = json.load(open(os.path.join(KLASOR, "yenilenecekler.json"), encoding="utf-8"))
yeni, degisen = durum["yeni"], durum["degisen"]

if "--yukle" in sys.argv:
    hedef = ders + "/_resim-yenileme"
    for arg in ("--yukle", "--var-mi"):
        p = subprocess.run([sys.executable, os.path.join(TOOLS, "upload_stills.py"), hedef, arg], capture_output=True, text=True, encoding="utf-8")
        print("\n".join((p.stdout + p.stderr).strip().splitlines()[-2:]))
        if p.returncode:
            sys.exit("Yükleme ya da varlık denetimi başarısız.")


def revizyonlar():
    ids = sorted({secilen[k]["soru"] for k in degisen})
    kod, disari = cagir("POST", "/api/claude/questions/export", {"ids": ids})
    if kod != 200:
        sys.exit(f"Dışa aktarma başarısız ({kod}): {disari}")
    json.dump(disari, open(os.path.join(KLASOR, "disa-aktarim.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    sorular = disari if isinstance(disari, list) else disari.get("items") or disari.get("questions")
    out = []
    for q in sorular:
        figs = []
        for f in q["figures"]:
            k = f"{q['id'].upper()}_{f['code']}"
            f2 = {a: f.get(a) for a in ("code", "kind", "title", "alt", "imageUrl", "dataJson", "still", "orderIndex")}
            if k in degisen:
                f2["still"] = {"lightUrl": yeni[k]["light"], "darkUrl": yeni[k]["dark"], "width": yeni[k]["width"], "height": yeni[k]["height"]}
            figs.append(f2)
        out.append({"questionId": q["id"], "expectedStemHash": q["stemHash"], "stem": q["stem"], "figures": figs, "allowStillRemoval": False})
    return out


if "--kuru" in sys.argv or "--canli" in sys.argv:
    canli = "--canli" in sys.argv
    istek = {"questions": revizyonlar(), "usageKind": 2, "dryRun": not canli}
    json.dump(istek, open(os.path.join(KLASOR, f"revizyon-{'canli' if canli else 'kuru'}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    kod, yanit = cagir("POST", "/api/claude/questions/revisions", istek)
    json.dump(yanit, open(os.path.join(KLASOR, f"yanit-{'canli' if canli else 'kuru'}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if kod != 200:
        sys.exit(f"Revizyon {'yazılmadı' if canli else 'kuru çalıştırması geçmedi'} ({kod}): {str(yanit)[:2000]}")
    raporlar = yanit if isinstance(yanit, list) else yanit.get("questions") or yanit.get("items") or []
    kotu = [r for r in raporlar if r.get("stemChanged") or r.get("optionsChanged") or r.get("solutionChanged") or r.get("mikroChanged") or r.get("stillsDropped") or r.get("awaitsStill")]
    print(f"revizyon {'yazıldı' if canli else 'kuru çalıştırma geçti'}: {len(raporlar)} soru; beklenmeyen değişiklik {len(kotu)}")
    if kotu:
        print(json.dumps(kotu[:3], ensure_ascii=False)[:1500])
        sys.exit(1)
    if canli:
        # Canlıdan geri oku: her figürün resmi yeni adres mi
        kod, disari = cagir("POST", "/api/claude/questions/export", {"ids": sorted({secilen[k]["soru"] for k in degisen})})
        sorular = disari if isinstance(disari, list) else disari.get("items") or disari.get("questions")
        hata = []
        for q in sorular:
            for f in q["figures"]:
                k = f"{q['id'].upper()}_{f['code']}"
                if k in degisen and ((f.get("still") or {}).get("lightUrl"), (f.get("still") or {}).get("darkUrl")) != (yeni[k]["light"], yeni[k]["dark"]):
                    hata.append(k)
        if hata:
            sys.exit(f"Geri okumada {len(hata)} figürün resmi beklenen değil: {hata[:5]}")
        for k in degisen:
            stills[k] = yeni[k]
        json.dump(stills, open(STILLS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"Doğrulandı: {len(degisen)} figürün yeni resmi canlıda; stills.json güncellendi.")
