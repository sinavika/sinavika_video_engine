"""Bir ayın deneme kitapçıklarını Claude içerik API'siyle canlıya ekler (sinavika docs/claude/Claude-Icerik-API.md §4). SQL yolunun yerine geçer.
Kullanım: python exam_api.py <ay> --istek                 → istekleri yazar (Results/Exams/<ay>/api/istek-N.json), API'ye gitmez
          python exam_api.py <ay> --kuru                  → istekleri dryRun ile gönderir: bütün denetimler çalışır, hiçbir şey yazılmaz
          python exam_api.py <ay> --canli                 → yazar (sahibinin onayıyla), yanıtı kaydeder ve canlıdan geri okuyup doğrular
          python exam_api.py <ay> --dogrula               → yazılmış kitapçıkları yeniden doğrular
          python exam_api.py <ay> --geri-al               → yazılan kitapçıkları siler (denemeye atanmışsa API reddeder)
          [--kitapcik A,B]                                → yalnız seçilen kitapçıklar
Kurallar: istekte en çok 10 kitapçık (API sınırı); her istek kendi içinde tek işlemdir (biri kurala uymazsa hiçbiri yazılmaz).
Önce:     upload_stills.py Exams/<ay> --yukle (API, kapta olmayan hazır resmi reddeder).
Adres ve anahtar motorun .env dosyasından okunur (SINAVIKA_API_URL, SINAVIKA_SOCIALHUB_KEY); ekrana yazılmaz."""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import hashlib, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import oku
from exam_common import EXAM_RESULTS, katalog, plan
from content_api import cagir

ay = sys.argv[1]
secim = sys.argv[sys.argv.index("--kitapcik") + 1].split(",") if "--kitapcik" in sys.argv else None
KLASOR = os.path.join(EXAM_RESULTS, ay, "api")
YANIT = os.path.join(KLASOR, "yazilanlar.json")   # canlıya yazılan kitapçıklar: anahtar → {id, code}
ZORLUK = {0: 0, 1: 1, 2: 2}
SINAVIKA_PUBLISHER = "F50B6055-65C6-4A46-A406-68BBF2222F29"


def stem_hash(stem):
    return hashlib.sha256(stem.encode("utf-16-le")).hexdigest()


def istekler():
    pl, kat = plan(ay), katalog()
    kitaplar = [b for b in pl["kitapciklar"] if not secim or b["anahtar"] in secim]
    hazir = []
    for kb in kitaplar:
        R = {r["slotId"]: r for r in oku(os.path.join(EXAM_RESULTS, ay, kb["anahtar"], "sonuc.jsonl"))}
        eksik = [s for s in kb["slotlar"] if s["slotId"] not in R]
        if eksik:
            sys.exit(f"{kb['anahtar']}: {len(eksik)} slotun geçerli sorusu yok; önce check_exams.py.")
        slots = []
        for s in kb["slotlar"]:
            r = R[s["slotId"]]
            figs = []
            for f in r["figures"]:
                if not f.get("Still"):
                    sys.exit(f"{kb['anahtar']} {r['ders']} {r['dersSira']}: {f['Code']} figürünün hazır resmi yok.")
                figs.append({"code": f["Code"], "kind": f["Kind"], "title": f.get("Title"), "alt": f.get("Alt"), "dataJson": f["DataJson"],
                             "orderIndex": f["OrderIndex"],
                             "still": {"lightUrl": f["Still"]["light"], "darkUrl": f["Still"]["dark"], "width": f["Still"]["width"], "height": f["Still"]["height"]}})
            slots.append({"categorySectionId": s["sectionId"], "categorySectionLessonId": s["sectionLessonId"], "orderIndex": s["sira"],
                          "question": {"code": r["soruKodu"], "stem": r["stem"], "lessonMikroId": r["lessonMikroId"], "difficulty": ZORLUK[r["zorluk"]],
                                       "options": [{"key": o["key"], "text": o["text"]} for o in r["options"]], "correctOptionKey": r["correctKey"],
                                       "solutionText": r["solution"]["ContentText"], "solutionStructuredJson": r["solution"]["StructuredContentJson"],
                                       "figures": figs,
                                       "markupSpans": [{"segmentId": x["SegmentId"], "spanId": x["SpanId"], "start": x["Start"], "length": x["Length"],
                                                        "expectedText": x["ExpectedText"], "role": x["Role"], "occurrence": x["Occurrence"]} for x in r["spans"]]}})
        # Dağılım bilgisi build_exam_sql.py ile aynı: profil sürümü ve planın parmak izi (bölüm, sıra, konu, zorluk, doğru harf).
        parmak = hashlib.sha256(json.dumps([(x["bolum"], x["sira"], x["konu"], x["zorluk"], x["dogru"]) for x in kb["slotlar"]]).encode()).hexdigest()
        hazir.append((kb, {"code": kb["kod"], "name": kb["ad"], "categorySubId": kb["categorySubId"], "status": 3, "publisherId": pl.get("publisherId") or SINAVIKA_PUBLISHER,
                           "distributionProfileVersion": "osym-cikmis-v1", "distributionPlanFingerprint": parmak,
                           "lessonMainIds": sorted({s["lessonMainId"] for s in kb["slotlar"]}), "slots": slots}))
    # İstek başına en çok 10 kitapçık (API sınırı); büyük istekler ağ geçidinin ~240 sn sınırını aşar (2 Kas 2026: 560 soru 504 verdi),
    # bu yüzden varsayılan istek başına 1 kitapçıktır (--paket N ile değişir). Her istek kendi içinde tek işlemdir.
    n = int(sys.argv[sys.argv.index("--paket") + 1]) if "--paket" in sys.argv else 1
    return [hazir[i:i + n] for i in range(0, len(hazir), n)]


def dogrula(yazilanlar):
    """Canlıdan geri okur: yuva sayısı, her yuvada soru, kök özeti ve kod beklenenle aynı mı; resim bekleyen soru yok mu."""
    pl = plan(ay)
    hata = []
    for kb in [b for b in pl["kitapciklar"] if b["anahtar"] in yazilanlar]:
        R = {(r["bolum"], r["sira"]): r for r in oku(os.path.join(EXAM_RESULTS, ay, kb["anahtar"], "sonuc.jsonl"))}
        kod, d = cagir("GET", f"/api/claude/booklets/{yazilanlar[kb['anahtar']]['id']}")
        if kod != 200:
            hata.append(f"{kb['anahtar']}: okunamadı ({kod}) {d}")
            continue
        b = d.get("booklet") or {}
        # 3 Tamamlandı; 4 Sınav aşamasında (panelde denemeye atanınca).
        if b.get("status") not in (3, 4) or b.get("slotCount") != kb["soru"] or b.get("filledCount") != kb["soru"] or b.get("answeredCount") != kb["soru"] or b.get("awaitingStillCount"):
            hata.append(f"{kb['anahtar']}: özet {json.dumps({k: b.get(k) for k in ('status', 'slotCount', 'filledCount', 'answeredCount', 'awaitingStillCount')})}")
        bolum_kod = {x["sectionId"].upper(): x["bolum"] for x in kb["slotlar"]}
        for s in d.get("slots") or []:
            r = R.get((bolum_kod.get(str(s["categorySectionId"]).upper()), s["orderIndex"]))
            if not r or s.get("questionCode") != r["soruKodu"] or s.get("stemHash") != stem_hash(r["stem"]) or s.get("awaitsStill"):
                hata.append(f"{kb['anahtar']} {s.get('sectionCode')} {s['orderIndex']}: canlıdaki soru beklenenden farklı")
    return hata


os.makedirs(KLASOR, exist_ok=True)
paketler = istekler()
if "--istek" in sys.argv or "--kuru" in sys.argv or "--canli" in sys.argv:
    for i, paket in enumerate(paketler, 1):
        yol = os.path.join(KLASOR, f"istek-{i}.json")
        json.dump({"booklets": [g for _, g in paket], "dryRun": "--canli" not in sys.argv}, open(yol, "w", encoding="utf-8"), ensure_ascii=False)
        print(f"istek-{i}: {len(paket)} kitapçık ({', '.join(k['anahtar'] for k, _ in paket)}), "
              f"{sum(len(g['slots']) for _, g in paket)} soru, {os.path.getsize(yol) // 1024} KB")

if "--kuru" in sys.argv or "--canli" in sys.argv:
    canli = "--canli" in sys.argv
    yazilanlar = json.load(open(YANIT, encoding="utf-8")) if os.path.exists(YANIT) else {}
    for i, paket in enumerate(paketler, 1):
        if canli and all(k["anahtar"] in yazilanlar for k, _ in paket):
            print(f"istek-{i}: zaten yazılmış, atlandı")
            continue
        if canli and any(k["anahtar"] in yazilanlar for k, _ in paket):
            sys.exit(f"istek-{i}: bir kısmı yazılmış; elle bakılmalı.")
        if canli:
            # Önceki bir zaman aşımında sunucu yazmış olabilir: kod canlıda varsa göndermeden dur.
            for k, g in paket:
                kd, ara = cagir("POST", "/api/claude/booklets/search", {"codePrefix": g["code"], "take": 5})
                if kd != 200:
                    sys.exit(f"{k['anahtar']}: arama başarısız ({kd}); gönderilmedi.")
                if any(x.get("code") == g["code"] for x in (ara or {}).get("items", [])):
                    sys.exit(f"{k['anahtar']}: {g['code']} kodu canlıda zaten var (önceki zaman aşımında yazılmış olabilir); yazilanlar.json elle güncellenmeli.")
        t0 = time.time()
        kod, yanit = cagir("POST", "/api/claude/booklets", {"booklets": [g for _, g in paket], "dryRun": not canli})
        json.dump(yanit, open(os.path.join(KLASOR, f"yanit-{i}{'' if canli else '-kuru'}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        if kod != 200:
            # 504 ağ geçidi zaman aşımıdır: sunucu işlemi arkada sürdürüp yazmış olabilir. Canlıda kitapçık kodu aranmadan yeniden gönderilmez.
            print(f"istek-{i}: {kod} ({time.time() - t0:.0f} sn) — " + ("ZAMAN AŞIMI: yazılıp yazılmadığı canlıda kodla denetlenmeli" if kod in (502, 503, 504) else "hiçbir şey yazılmadı"))
            print(str((yanit or {}).get("Error") or (yanit or {}).get("error") or yanit)[:3000])
            sys.exit(1)
        print(f"istek-{i}: {'yazıldı' if canli else 'kuru çalıştırma geçti'} ({time.time() - t0:.0f} sn): "
              + ", ".join(f"{b['code']} {b['slotCount']} yuva" for b in yanit["booklets"]))
        # Yayınevi Sınavika olmalı (sahip kararı; yayıncıyla sınırlı paketteki öğrenci boş yayıncılı denemeye giremez).
        yayinevi = {str(b.get("publisherId") or "").upper() for b in yanit["booklets"]}
        if yayinevi != {SINAVIKA_PUBLISHER}:
            print(f"istek-{i}: yanıttaki yayınevi Sınavika değil ({yayinevi}); API düzeltmesi canlıda değil." + (" YAZILDI, kontrol edilmeli!" if canli else " Yazmaya geçilmez."))
            sys.exit(1)
        if canli:
            for (kb, g), b in zip(paket, yanit["booklets"]):
                assert b["code"] == g["code"], (b["code"], g["code"])
                yazilanlar[kb["anahtar"]] = {"id": b["id"], "code": b["code"]}
            json.dump(yazilanlar, open(YANIT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if canli:
        h = dogrula(yazilanlar)
        print("\n".join(h[:40]) if h else f"Doğrulandı: {len(yazilanlar)} kitapçık canlıda beklenenle birebir.")
        sys.exit(1 if h else 0)

if "--dogrula" in sys.argv:
    h = dogrula(json.load(open(YANIT, encoding="utf-8")))
    print("\n".join(h[:40]) if h else "Doğrulandı.")

if "--geri-al" in sys.argv:
    yazilanlar = json.load(open(YANIT, encoding="utf-8"))
    for anahtar in [a for a in list(yazilanlar) if not secim or a in secim]:
        kod, y = cagir("DELETE", f"/api/claude/booklets/{yazilanlar[anahtar]['id']}")
        print(anahtar, kod, y)
        if kod == 200:
            del yazilanlar[anahtar]
    json.dump(yazilanlar, open(YANIT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
