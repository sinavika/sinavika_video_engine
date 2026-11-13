"""Eksik görselli test sorularının onarımı (13 Kasım 2026 listesi: kök tabloya, grafiğe, şekle atıf yapıyor ama figür yok).
Claude Message Batches ile her soruya eksik görsel veri olarak yazılır (Curriculum/Quizzes/GorselOnarimYonergesi.md), ikinci bir
modele cevap görmeden çözdürülüp anahtarla karşılaştırılır, check_revisions ile denetlenir, Claude içerik API'siyle yazılır.

Kullanım (Curriculum/Quizzes/Tools içinden):
  python visual_repair.py sec <liste.csv> --sinav AYT [--pilot 20]   hedefleri seçer (Work/GorselOnarim/<ad>/hedefler.json)
  python visual_repair.py paket <ad>        onarım isteklerini yazar (istekler.jsonl), maliyet tahmini
  python visual_repair.py paket|gonder|topla <ad> --duzelt   şema ya da çözüm hatası çıkanları hatalarıyla birlikte yeniden yazdırır
  python visual_repair.py gonder <ad>       paketi Batch olarak gönderir (ücretli; SINAVIKA_ALLOW_SONNET=1)
  python visual_repair.py topla <ad>        sonuçları bekler, Revisions/<ders>/<KONU>_00_gorsel.jsonl dosyalarına yazar
  python visual_repair.py coz <ad>          onarılan soruları cevapsız çözdürür (ücretli), topla-coz ile karşılaştırır
  python visual_repair.py topla-coz <ad>
  python visual_repair.py denetle <ad>      konu konu check_revisions (metin, çözüm, API'nin figür denetimi)
  python visual_repair.py ciz <ad> [--tur map,gears]  tablo dışı figürleri motora çizdirir, dersin stills.json'una ekler
  python visual_repair.py yukle <ad>        hazır resimleri API'nin kabına yükler (canlı yazımdan önce; onayla)
  python visual_repair.py kuru <ad>         canlıdan dışa aktarır, revizyonu dryRun gönderir
  python visual_repair.py canli <ad>        revizyonu yazar ve geri okuyup doğrular (sahibin o parti için onayıyla)
  python visual_repair.py rapor <ad>        sayılar ve soru soru önce/sonra (rapor.md)
`_00_gorsel` dosyası konunun tam revizyonundan (`_01`…) önce sıralanır; konu sonradan revize edilirse tam revizyon geçerli olur."""
import paths  # noqa: F401  ortak araçlar (Curriculum/Tools) içe aktarılabilir olur
import csv, glob, hashlib, json, os, re, subprocess, sys, time
from collections import Counter, defaultdict

import anthropic_api as api
from common import REVIZYON, SONUC, ders_dosyalari, gorsel_ozeti, hiyerarsi, kopya_indeksi, oku, temizle
from content_api import cagir
from paths import EDUCATION_DATA, ENGINE, OUTPUT, ROOT, TSX

MODEL = "claude-sonnet-5-5"
IS = os.path.join(OUTPUT, "Work", "GorselOnarim")
YONERGE = os.path.join(ROOT, "GorselOnarimYonergesi.md")
SEMA_TS = os.path.join(ENGINE, "Curriculum", "Tools", "VisualSchemas.ts")
TURLER = ["table", "plot", "pie", "climate", "regime", "pyramid", "windRose", "map", "timeline", "lever", "pulley", "gears", "circuit"]
DUSUNEN = {"MAT", "GEO", "FIZ", "KIM", "BIO"}  # hesap ağırlıklı dersler yüksek eforla
SINAV_KODU = {"AYT": "YKS/YKS_AYT", "TYT": "YKS/YKS_TYT", "KPSS Lisans": "KPSS/KPSS_LISANS",
              "KPSS Önlisans": "KPSS/KPSS_ONLISANS", "KPSS Ortaöğretim": "KPSS/KPSS_ORTAOGRETIM"}
KAYNAK_KLASORU = {"YKS_TYT": "YKS/TYT", "YKS_AYT": "YKS/AYT", "KPSS_LISANS": "KPSS/Lisans",
                  "KPSS_ONLISANS": "KPSS/OnlisansOrtaogretim", "KPSS_ORTAOGRETIM": "KPSS/OnlisansOrtaogretim"}
ATIF = re.compile(r"tablo|grafik|şekil|harita|düzenek|dişli|ölçüm|diyagram|görsel", re.I)


def klasor(ad):
    k = os.path.join(IS, ad)
    os.makedirs(k, exist_ok=True)
    return k


def yaz_json(yol, veri):
    with open(yol, "w", encoding="utf-8", newline="\n") as f:
        json.dump(veri, f, ensure_ascii=False, indent=1)


def yaz_jsonl(yol, satirlar):
    with open(yol, "w", encoding="utf-8", newline="\n") as f:
        for s in satirlar:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")


def sorular():
    """Dışa aktarılmış quiz verisi: kimlik → (ders kodu, soru)."""
    out = {}
    for kod, p in ders_dosyalari():
        for q in oku(p):
            out[q["id"].upper()] = (kod, q)
    return out


def tur_ipucu(kok):
    s = kok.lower()
    for ad, desen in [("harita", "harita"), ("grafik", "grafik"), ("düzenek", "düzenek|dişli|devre|ölçüm"), ("şekil", "şekil|görsel|diyagram"), ("tablo", "tablo")]:
        if re.search(desen, s):
            return ad
    return "diğer"


# ---------------------------------------------------------------- sec
def sec(argv):
    liste = argv[0]
    sinav = argv[argv.index("--sinav") + 1]
    pilot = int(argv[argv.index("--pilot") + 1]) if "--pilot" in argv else 0
    ad = argv[argv.index("--ad") + 1] if "--ad" in argv else (f"{SINAV_KODU[sinav].split('/')[1].lower()}-pilot" if pilot else SINAV_KODU[sinav].split("/")[1].lower())
    satirlar = [r for r in csv.DictReader(open(liste, encoding="utf-8-sig")) if r["Kaynak"] == "Test" and r["Sinav"] == sinav]
    veri, temsil = sorular(), kopya_indeksi()
    revize, onarilan = set(), set()
    for p in glob.glob(os.path.join(REVIZYON, "**", "*.jsonl"), recursive=True):
        (onarilan if p.endswith("_00_gorsel.jsonl") else revize).update(r["id"].upper() for r in oku(p))
    hedef, atlanan = [], Counter()
    for r in satirlar:
        qid = r["SoruId"].upper()
        if qid not in veri:
            atlanan["dışa aktarımda yok"] += 1
            continue
        rep = temsil.get(veri[qid][1]["id"], veri[qid][1]["id"]).upper()
        if qid in revize or rep in revize:
            atlanan["konusu tam revize edildi (o revizyonla düzelir)"] += 1
            continue
        if (qid in onarilan or rep in onarilan) and "--yeniden" not in argv:
            atlanan["daha önce onarıldı"] += 1
            continue
        ders, q = veri[rep]
        hedef.append({"id": qid, "temsilci": rep, "ders": ders, "konu": q["hierarchy"]["lessonSubCode"],
                      "konuAdi": q["hierarchy"]["lessonSubName"], "testler": r["Testler"], "tur": tur_ipucu(r["Kok"])})
    # Aynı temsilciye düşen kopyalar tek istekle onarılır.
    tekil = {}
    for h in hedef:
        tekil.setdefault(h["temsilci"], h)
    hedef = list(tekil.values())
    if pilot:
        # Pilot: öğrencinin bildirdiği "Basit Makineler — Kolay" testi önce, sonra ders ve görsel türü çeşitli olsun.
        sec_ = [h for h in hedef if "060565C7" in h["testler"].upper()]
        kalan = sorted((h for h in hedef if h not in sec_), key=lambda h: h["temsilci"])
        # İşin %93'ü tablo: pilotun yarısı tablo (her dersten bir), kalanı harita, grafik ve şekil.
        dersler = Counter(h["ders"] for h in sec_)
        for tur, adet in (("harita", 2), ("grafik", 2), ("şekil", 1), ("tablo", pilot)):
            alinan = 0
            for h in kalan:
                if h["tur"] == tur and h not in sec_ and not dersler[h["ders"]] and alinan < adet and len(sec_) < pilot:
                    sec_.append(h)
                    dersler[h["ders"]] += 1
                    alinan += 1
        hedef = sec_[:pilot]
    k = klasor(ad)
    yaz_json(os.path.join(k, "hedefler.json"), hedef)
    print(f"{ad}: {len(hedef)} hedef ({Counter(h['tur'] for h in hedef)}); atlanan {dict(atlanan)}")
    print(Counter(h["ders"] for h in hedef).most_common())


# ---------------------------------------------------------------- paket
def kaynak_ornekleri(ders, konu, adet=6):
    _, kat, main = ders.split("/")
    yol = os.path.join(EDUCATION_DATA, *KAYNAK_KLASORU[kat].split("/"), "Sorular", main, konu + ".jsonl")
    if not os.path.exists(yol):
        return []
    L = []
    for d in oku(yol):
        baslik = ((d.get("source") or {}).get("title") or "").lower()
        if "deneme" in baslik or "kitapçık" in baslik or d.get("answerSource") == "sinavika-bank" or not d.get("answer"):
            continue
        L.append(d)
    # Görsele dayanan örnekler önce (tablo, grafik … kalıbını göstersin), sonra ÖSYM çıkmışları.
    L.sort(key=lambda d: (not ATIF.search(d.get("question") or ""), "ösym" not in ((d.get("source") or {}).get("title") or "").lower()))
    return [{"id": d.get("id"), "soru": temizle(d.get("question"))[-1200:], "siklar": [f"{o['key']}) {temizle(o['text'])[:160]}" for o in d.get("options", [])],
             "cevap": d.get("answer")} for d in L[:adet]]


def tasan_hucreler(figurler):
    """Model karakter saymakta zorlanıyor: sınırı aşan tablo hücrelerini metni ve uzunluğuyla açıkça söyle."""
    out = []
    for f in figurler:
        v = f.get("visual") or {}
        if v.get("kind") != "table":
            continue
        for i, x in enumerate(v.get("header") or []):
            if len(x) > 30:
                out.append(f"{f['code']} başlık {i + 1}: '{x}' {len(x)} karakter, en çok 30. Kısalt ya da açıklamayı köke taşı.")
        for r, satir in enumerate(v.get("rows") or []):
            for c, x in enumerate(satir):
                if len(x) > 40:
                    out.append(f"{f['code']} satır {r + 1} sütun {c + 1}: '{x}' {len(x)} karakter, en çok 40. "
                               "Hücreye kısa bir etiket yaz (ör. 'Dar geçitler'), uzun açıklamayı kökte öncül (I., II.) olarak ver.")
    return out


def sema_metni():
    p = subprocess.run(["node", TSX, SEMA_TS, *TURLER], cwd=ENGINE, capture_output=True, text=True, encoding="utf-8")
    if p.returncode:
        sys.exit("Görsel şemaları alınamadı: " + p.stderr[-800:])
    return p.stdout.strip()


def sistem_metni():
    return open(YONERGE, encoding="utf-8").read() + "\n\n## Görsel şemaları (JSON Schema, motorun kendi şeması)\n\n" + sema_metni()


def paket(argv):
    ad = argv[0]
    k = klasor(ad)
    hedef = json.load(open(os.path.join(k, "hedefler.json"), encoding="utf-8"))
    duzelt = {}
    if "--duzelt" in argv:
        # Düzeltme turu: motorun çizicisinin ya da çözüm denetiminin bulduğu hatalar, önceki cevapla birlikte geri gönderilir.
        for dosya in ("sema-hatalari.json", "cozum-hatalari.json", "denetim-hatalari.json", "inceleme-hatalari.json"):
            yol = os.path.join(k, dosya)
            if os.path.exists(yol):
                for x, h in json.load(open(yol, encoding="utf-8")).items():
                    duzelt.setdefault(x, []).extend(h)
        # topla'da alınmayan yanıtlar (doğru harfi değiştiren, JSON'u bozuk olan)
        yol = os.path.join(k, "sorunlu.json")
        if os.path.exists(yol):
            for x, neden in json.load(open(yol, encoding="utf-8")):
                if neden.startswith("doğru harf değişmiş"):
                    eski, yeni = neden.split()[-1].split("→")
                    neden = (f"Önceki denemende doğru cevabı {yeni} harfine taşıdın; bu yasak. Doğru harf {eski} kalmalı: doğru içeriği "
                             f"{eski} şıkkına yaz, şıkları buna göre yeniden düzenle ya da soruyu yeniden yaz; 'correct' alanı {eski} olmalı.")
                else:
                    neden = f"Önceki yanıtın geçerli JSON değildi ({neden}). Yalnız tek bir geçerli JSON nesnesi yaz; metin içindeki tırnakları kaçır."
                duzelt.setdefault(x, []).append(neden)
        onceki = {rep: r for rep, (_, r) in onarim_kayitlari(k).items()}
        hedef = [h for h in hedef if h["temsilci"] in duzelt]
    veri, hiy = sorular(), hiyerarsi()
    mikrolar = {sb["code"]: [{"kod": mk["code"], "ad": mk["name"]} for mk in sb["mikros"]] for m in hiy for sb in m["subs"]}
    sistem = sistem_metni()
    istekler = []
    for h in hedef:
        ders, q = veri[h["temsilci"]]
        zorluk = sorted({z.get("difficulty") for z in q.get("quizzes") or []} - {None})
        girdi = {
            "konu": f"{h['konuAdi']} ({h['konu']})", "sinav": ders.split("/")[1], "ders": ders.split("/")[2],
            "altKonular": mikrolar.get(h["konu"], []), "testZorlugu": ["Kolay", "Orta", "Zor"][zorluk[0]] if zorluk else None,
            "soru": {"stem": q["stem"], "options": [{"key": o["key"], "text": o["text"]} for o in q["options"]],
                     "correctKey": q["correctKey"], "eskiCozum": temizle((q.get("solutions") or [{}])[0].get("ContentText") or "")[:2500]},
            "kaynakOrnekleri": kaynak_ornekleri(ders, h["konu"]),
        }
        if duzelt:
            if h["temsilci"] in onceki:
                girdi["oncekiOnarim"] = {x: onceki[h["temsilci"]].get(x) for x in ("karar", "mikro", "stem", "options", "correct", "figures", "cozum")}
            girdi["bulunanHatalar"] = duzelt[h["temsilci"]] + tasan_hucreler((girdi.get("oncekiOnarim") or {}).get("figures") or [])
        main = ders.split("/")[2]
        istem = ("Önceki onarımda şu hatalar bulundu (bulunanHatalar). Hataları gider; doğru olan kısımları koru. Yalnız JSON yaz."
                 if duzelt else "Bu soruyu onar. Yalnız JSON yaz.")
        p = api.params(MODEL, 24000, system=api.cached_system(sistem),
                       messages=[{"role": "user", "content": istem + "\n\n" + json.dumps(girdi, ensure_ascii=False, indent=1)}])
        p["output_config"]["effort"] = "high" if main in DUSUNEN else "medium"
        istekler.append({"custom_id": h["temsilci"], "params": p})
    yaz_jsonl(os.path.join(k, "duzelt-istekler.jsonl" if duzelt else "istekler.jsonl"), istekler)
    sistem_jeton = len(sistem) / 3.2
    girdi_jeton = sum(len(json.dumps(i["params"]["messages"], ensure_ascii=False)) for i in istekler) / 3.2
    tahmin = 0.5 * ((sistem_jeton * 1.25 + girdi_jeton) * 2 + len(istekler) * 6000 * 10) / 1e6
    print(f"{ad}: {len(istekler)} istek · sistem ≈{sistem_jeton / 1000:.0f}k jeton (önbellekli) · girdi ≈{girdi_jeton / 1000:.0f}k jeton · tahmin ≈{tahmin:.2f} $")


# ---------------------------------------------------------------- gonder / topla
def gonder(argv, dosya="istekler.jsonl", durum="batch.json"):
    ad = argv[0]
    k = klasor(ad)
    istekler = oku(os.path.join(k, dosya))
    bid = api.submit_batch(istekler)
    yaz_json(os.path.join(k, durum), {"id": bid, "gonderildi": time.strftime("%Y-%m-%d %H:%M"), "adet": len(istekler)})
    print(f"{ad}: {len(istekler)} istek gönderildi → {bid}")


def fiyat(usage):
    g, c = api.PRICES[MODEL]
    taze = usage.get("input_tokens", 0)
    return 0.5 * (taze * g + usage.get("cache_read_input_tokens", 0) * g * 0.1 + usage.get("cache_creation_input_tokens", 0) * g * 2
                  + usage.get("output_tokens", 0) * c) / 1e6


def tablo_dolar_kacir(v):
    """Motor tabloda tek "$"ı formül başlangıcı sayar ("Fiyat ($)"): kapanmamış dolar ters bölüyle kaçırılır."""
    if v.get("kind") != "table":
        return

    def kacir(x):
        kacmamis = len(re.findall(r"(?<!\\)\$", x))
        return re.sub(r"(?<!\\)\$", lambda _: "\\$", x) if kacmamis % 2 == 1 else x
    v["header"] = [kacir(x) for x in v.get("header") or []]
    v["rows"] = [[kacir(x) for x in r] for r in v.get("rows") or []]


def figur_paragrafi(kok):
    """{{fig:kod}} kendi paragrafında durur: önünde ve arkasında boş satır."""
    kok = re.sub(r"[ \t]*\n?[ \t]*(\{\{fig:[A-Za-z0-9_\-]+\}\})[ \t]*\n?[ \t]*", r"\n\n\1\n\n", kok)
    return re.sub(r"\n{3,}", "\n\n", kok).strip()


def json_al(metin):
    # Model JSON'u açıklamanın sonunda ```json bloğunda da verebilir: önce son blok denenir.
    for blok in reversed(re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", metin, re.S)):
        try:
            return json.loads(blok)
        except ValueError:
            pass
    a, b = metin.find("{"), metin.rfind("}")
    if a < 0 or b < a:
        raise ValueError("JSON yok")
    return json.loads(metin[a:b + 1])


def sonuclari_al(k, durum, tur):
    b = json.load(open(os.path.join(k, durum), encoding="utf-8"))
    api.wait_batch(b["id"], poll=30)
    sonuc, toplam = {}, 0.0
    for r in api.batch_results(b["id"]):
        cid = r["custom_id"]
        if r["result"]["type"] != "succeeded":
            sonuc[cid] = {"hata": r["result"]["type"]}
            continue
        m = r["result"]["message"]
        api.record_usage(tur, MODEL, m.get("usage"), True)
        toplam += fiyat(m.get("usage") or {})
        metin = "".join(x.get("text", "") for x in m["content"] if x.get("type") == "text")
        try:
            sonuc[cid] = {"json": json_al(metin), "stop": m.get("stop_reason")}
        except ValueError as e:
            sonuc[cid] = {"hata": f"JSON okunamadı ({e}; stop {m.get('stop_reason')})", "metin": metin[-2000:]}
    return sonuc, toplam


def maliyet_ekle(k, tur, tutar):
    yol = os.path.join(k, "maliyet.json")
    m = json.load(open(yol, encoding="utf-8")) if os.path.exists(yol) else {}
    m[tur] = round(m.get(tur, 0) + tutar, 4)
    m["toplam"] = round(sum(v for x, v in m.items() if x != "toplam"), 4)
    yaz_json(yol, m)
    return m


def topla(argv):
    ad = argv[0]
    k = klasor(ad)
    tur = "duzelt" if "--duzelt" in argv else "onarim"
    hedef = {h["temsilci"]: h for h in json.load(open(os.path.join(k, "hedefler.json"), encoding="utf-8"))}
    veri = sorular()
    sonuc, toplam = sonuclari_al(k, "duzelt-batch.json" if tur == "duzelt" else "batch.json", "gorsel-onarim")
    yaz_json(os.path.join(k, f"yanitlar-{tur}.json"), sonuc)
    dosyalar, sorunlu = defaultdict(list), []
    for rep, s in sonuc.items():
        if "json" not in s:
            sorunlu.append((rep, s["hata"]))
            continue
        j, h, q = s["json"], hedef[rep], veri[rep][1]
        if j.get("correct") != q["correctKey"]:
            sorunlu.append((rep, f"doğru harf değişmiş {q['correctKey']}→{j.get('correct')}"))
            continue
        figurler = j.get("figures") or []
        for f in figurler:
            # Vurgulu sütun cevabı ele verir (yönerge); model koysa da kaldırılır.
            (f.get("visual") or {}).pop("highlightColumn", None)
            tablo_dolar_kacir(f.get("visual") or {})
            # Hareket işaretleri (yol okları, "x = h") durağan resimde cevabı ele verebilir.
            if (f.get("visual") or {}).get("kind") in ("pulley", "gears", "lever") and "motion" in f["visual"]:
                f["visual"]["motion"] = False
        kayit = {"id": q["id"], "karar": j.get("karar"), "sorun": j.get("sorun", ""), "kaynak": j.get("kaynak") or [],
                 "mikro": j.get("mikro"), "stem": figur_paragrafi(j.get("stem") or ""), "options": j.get("options"), "correct": j.get("correct"),
                 "cozum": j.get("cozum"), "figures": figurler, "onarim": "eksik-gorsel-2026-11-13"}
        if j.get("motorIstegi"):
            kayit["motorIstegi"] = j["motorIstegi"]
        dosyalar[(h["ders"], h["konu"])].append(kayit)
    for (ders, konu), kayitlar in dosyalar.items():
        yol = os.path.join(REVIZYON, *ders.split("/"), f"{konu}_00_gorsel.jsonl")
        os.makedirs(os.path.dirname(yol), exist_ok=True)
        eski = {r["id"]: r for r in oku(yol)} if os.path.exists(yol) else {}
        eski.update({r["id"]: r for r in kayitlar})
        yaz_jsonl(yol, sorted(eski.values(), key=lambda r: r["id"]))
    m = maliyet_ekle(k, tur, toplam)
    yaz_json(os.path.join(k, "sorunlu.json"), sorunlu)
    print(f"{ad}: {sum(len(v) for v in dosyalar.values())} kayıt yazıldı, {len(sorunlu)} sorunlu · bu paket {toplam:.2f} $ · toplam {m['toplam']:.2f} $")
    for rep, neden in sorunlu:
        print(f"  {rep[:8]}: {neden}")


# ---------------------------------------------------------------- coz (cevapsız çözdürme)
def gorsel_metni(f):
    return f"[{f.get('title') or f.get('code')}] " + json.dumps(f.get("visual"), ensure_ascii=False, separators=(",", ":"))


def onarim_kayitlari(k):
    hedef = json.load(open(os.path.join(k, "hedefler.json"), encoding="utf-8"))
    out = {}
    for h in hedef:
        yol = os.path.join(REVIZYON, *h["ders"].split("/"), f"{h['konu']}_00_gorsel.jsonl")
        if os.path.exists(yol):
            for r in oku(yol):
                if r["id"].upper() == h["temsilci"]:
                    out[h["temsilci"]] = (h, r)
    return out


COZ_SISTEM = ("Sen ÖSYM sınavlarına hazırlanan öğrencilere soru çözen bir öğretmensin. Sana bir test sorusu ve sorudaki görselin verisi "
              "(JSON, motorun çizdiği görselin aynısı) verilir. Soruyu dikkatle çöz. Yalnız şu JSON'u yaz: "
              '{"cevap": "<harf>", "emin": <0-1>, "tekDogru": true|false, "not": "soruda gördüğün sorun varsa tek cümle, yoksa boş"}')


def coz(argv):
    ad = argv[0]
    k = klasor(ad)
    istekler = []
    for rep, (h, r) in onarim_kayitlari(k).items():
        kok = r["stem"]
        for f in r.get("figures") or []:
            kok = kok.replace("{{fig:" + f["code"] + "}}", "\n" + gorsel_metni(f) + "\n")
        metin = kok + "\n\n" + "\n".join(f"{'ABCDE'[i]}) {o}" for i, o in enumerate(r["options"]))
        p = api.params(MODEL, 16000, system=api.cached_system(COZ_SISTEM), messages=[{"role": "user", "content": metin}])
        p["output_config"]["effort"] = "high" if h["ders"].split("/")[2] in DUSUNEN else "medium"
        istekler.append({"custom_id": rep, "params": p})
    yaz_jsonl(os.path.join(k, "coz-istekler.jsonl"), istekler)
    gonder([ad], "coz-istekler.jsonl", "coz-batch.json")


def topla_coz(argv):
    ad = argv[0]
    k = klasor(ad)
    kayit = onarim_kayitlari(k)
    sonuc, toplam = sonuclari_al(k, "coz-batch.json", "gorsel-onarim-coz")
    out = {}
    for rep, s in sonuc.items():
        h, r = kayit[rep]
        j = s.get("json") or {}
        out[rep] = {"beklenen": r["correct"], "cevap": j.get("cevap"), "emin": j.get("emin"), "tekDogru": j.get("tekDogru"),
                    "not": j.get("not"), "tutar": j.get("cevap") == r["correct"] and j.get("tekDogru") is not False}
    yaz_json(os.path.join(k, "cozum-denetimi.json"), out)
    m = maliyet_ekle(k, "cozum-denetimi", toplam)
    tutmayan = {x: v for x, v in out.items() if not v["tutar"]}
    yaz_json(os.path.join(k, "cozum-hatalari.json"), {
        x: [f"Bağımsız çözümde cevap {v['cevap']} bulundu (anahtar {v['beklenen']}), tek doğru: {v['tekDogru']}. Not: {v['not'] or '-'}"]
        for x, v in tutmayan.items()})
    print(f"{ad}: {len(out)} soru çözüldü, {len(out) - len(tutmayan)} anahtarla tutuyor, {len(tutmayan)} tutmuyor · {toplam:.2f} $ · toplam {m['toplam']:.2f} $")
    for x, v in tutmayan.items():
        print(f"  {x[:8]}: beklenen {v['beklenen']}, çözüm {v['cevap']} (emin {v['emin']}, tek doğru {v['tekDogru']}) {v['not'] or ''}")


# ---------------------------------------------------------------- denetle
def denetle(argv):
    ad = argv[0]
    k = klasor(ad)
    konular = sorted({(h["ders"], h["konu"]) for h in json.load(open(os.path.join(k, "hedefler.json"), encoding="utf-8"))})
    arac = os.path.join(ENGINE, "Curriculum", "Tools", "check_revisions.py")
    hatalar = {}
    for ders, konu in konular:
        p = subprocess.run([sys.executable, arac, ders, "--konu", konu], capture_output=True, text=True, encoding="utf-8")
        satirlar = (p.stdout + p.stderr).strip().splitlines()
        print(f"== {ders} {konu}")
        print("\n".join("  " + s for s in satirlar if "UYARI" not in s)[-3000:])
        for s in satirlar:
            m = re.match(r"QZ-([0-9A-F]{32})[^:]*: (.*)", s)
            # Hazır resim eksikliği onarım hatası değildir (ciz çözer).
            if m and "hazır resim yok" not in m.group(2):
                x = m.group(1)
                hatalar.setdefault(f"{x[:8]}-{x[8:12]}-{x[12:16]}-{x[16:20]}-{x[20:]}", []).append("Denetim: " + m.group(2))
    yaz_json(os.path.join(k, "denetim-hatalari.json"), hatalar)
    print(f"Onarım hatası olan {len(hatalar)} soru" + (f": python visual_repair.py paket {ad} --duzelt" if hatalar else ""))


# ---------------------------------------------------------------- ciz / yukle (merkezin çizemediği türlerin hazır resmi)
def ciz(argv):
    """Onarılan figürleri motora çizdirir ve dersin stills.json'una EKLER (dersin öbür resimleri korunur); yüklenecekleri listeler."""
    ad = argv[0]
    k = klasor(ad)
    turler = set(argv[argv.index("--tur") + 1].split(",")) if "--tur" in argv else None
    ders_gorselleri, tum = defaultdict(dict), defaultdict(dict)
    for rep, (h, r) in onarim_kayitlari(k).items():
        for f in r.get("figures") or []:
            tum[h["ders"]][f"{r['id']}_{f['code']}"] = f["visual"]
            if not turler or f["visual"]["kind"] in turler:
                ders_gorselleri[h["ders"]][f"{r['id']}_{f['code']}"] = f["visual"]
    hatalar = {}
    for ders, gorseller in ders_gorselleri.items():
        sonuc_d = os.path.join(SONUC, *ders.split("/"))
        liste = os.path.join(sonuc_d, "_gorsel-onarim", "liste.jsonl")
        os.makedirs(os.path.dirname(liste), exist_ok=True)
        yaz_jsonl(liste, [{"id": x, "visual": v} for x, v in sorted(gorseller.items())])
        cikti = os.path.join(paths.FIGURES, *ders.split("/"))
        p = subprocess.run(["node", TSX, paths.RENDER_FIGURES_TS, liste, cikti, "--concurrency", "4"] + (["--force"] if "--force" in argv else []), cwd=ENGINE,
                           capture_output=True, text=True, encoding="utf-8")
        for satir in (p.stdout + p.stderr).splitlines():
            m = re.match(r"\s*✗ ([0-9A-Fa-f-]{36})_(\S+): (.*)", satir)
            if m:
                hatalar.setdefault(m.group(1).upper(), []).append(f"figür {m.group(2)}: {m.group(3)}")
                print(satir[:300])
        man = json.load(open(os.path.join(cikti, "manifest.json"), encoding="utf-8"))
        stills_yolu = os.path.join(sonuc_d, "stills.json")
        stills = json.load(open(stills_yolu, encoding="utf-8")) if os.path.exists(stills_yolu) else {}
        resimler, eksik = {}, []
        for x, v in gorseller.items():
            m = man.get(x)
            if not m:
                eksik.append(x)
                continue
            kayit = {"hash": gorsel_ozeti(v), "width": m["width"], "height": m["height"], "files": {}}
            for tema in ("light", "dark"):
                ozet = hashlib.sha256(open(m[tema], "rb").read()).hexdigest()
                kayit[tema] = f"{paths.STILL_BASE_URL}{ozet}.{m['format']}"
                kayit["files"][tema] = m[tema]
                resimler[kayit[tema]] = {"url": kayit[tema], "dosya": m[tema], "ad": kayit[tema].rsplit("/", 1)[1]}
            stills[x] = kayit
        yaz_json(stills_yolu, stills)
        # Yüklenecekler: dersin bu onarımdaki BÜTÜN figürleri (yalnız bu sefer çizilenler değil), resmi güncel olanlar.
        for x, v in tum[ders].items():
            st = stills.get(x)
            if st and st["hash"] == gorsel_ozeti(v):
                for tema in ("light", "dark"):
                    resimler[st[tema]] = {"url": st[tema], "dosya": st["files"][tema], "ad": st[tema].rsplit("/", 1)[1]}
        yaz_json(os.path.join(sonuc_d, "_gorsel-onarim", "yuklenecek-resimler.json"), sorted(resimler.values(), key=lambda r: r["ad"]))
        print(f"{ders}: {len(gorseller) - len(eksik)} figür çizildi, {len(eksik)} çizilemedi · yüklenecek {len(resimler)} dosya")
    yaz_json(os.path.join(k, "sema-hatalari.json"), hatalar)
    if hatalar:
        print(f"Şeması tutmayan {len(hatalar)} soru: python visual_repair.py paket {ad} --duzelt → gonder/topla --duzelt")


def yukle(argv):
    """Hazır resimleri API'nin kabına yükler (yazımdan ÖNCE; aynı içerik aynı adrese gider) ve hepsinin var olduğunu denetler."""
    ad = argv[0]
    k = klasor(ad)
    dersler = sorted({h["ders"] for h, _ in onarim_kayitlari(k).values()})
    arac = os.path.join(ENGINE, "Curriculum", "Tools", "upload_stills.py")
    for ders in dersler:
        if not os.path.exists(os.path.join(SONUC, *ders.split("/"), "_gorsel-onarim", "yuklenecek-resimler.json")):
            continue
        for bayrak in ("--yukle", "--var-mi"):
            p = subprocess.run([sys.executable, arac, ders + "/_gorsel-onarim", bayrak], capture_output=True, text=True, encoding="utf-8")
            print(f"{ders} {bayrak}: " + " ".join((p.stdout + p.stderr).strip().splitlines()[-2:]))
            if p.returncode:
                sys.exit("Yükleme ya da varlık denetimi başarısız.")


# ---------------------------------------------------------------- kuru / canli
def stem_ozeti(stem):
    return hashlib.sha256(stem.encode("utf-16-le")).hexdigest().upper()


def revizyon_istegi(k):
    hedef = json.load(open(os.path.join(k, "hedefler.json"), encoding="utf-8"))
    durum = {}
    cozum_d = os.path.join(k, "cozum-denetimi.json")
    tutmayan = {x for x, v in json.load(open(cozum_d, encoding="utf-8")).items() if not v["tutar"]} if os.path.exists(cozum_d) else None
    if tutmayan is None:
        sys.exit("Önce coz / topla-coz: anahtarla tutarlılık denetlenmeden yazılmaz.")
    kayitlar = {}
    for ders, konu in {(h["ders"], h["konu"]) for h in hedef}:
        yol = os.path.join(SONUC, *ders.split("/"), "_konu", konu, "sonuc.jsonl")
        if os.path.exists(yol):
            for r in oku(yol):
                kayitlar[r["id"].upper()] = r
    veri = sorular()
    secilen = []
    for h in hedef:
        rep = h["temsilci"]
        if rep in tutmayan:
            durum[h["id"]] = "çözüm denetimi tutmadı"
            continue
        if rep not in kayitlar:
            durum[h["id"]] = "denetimden geçmedi ya da onarılmadı"
            continue
        secilen.append(rep)
        # Aynı konudaki kopyalar da aynı içerikle yazılır (check_revisions temsilcinin revizyonunu kopyaya uygular).
        secilen += [x for x, r in kayitlar.items() if r["kaynak"].upper() == rep and x != rep]
    secilen = sorted(set(secilen))
    if not secilen:
        sys.exit("Yazılacak soru yok.")
    kod, disari = cagir("POST", "/api/claude/questions/export", {"ids": secilen})
    if kod != 200:
        sys.exit(f"Dışa aktarma başarısız ({kod}): {str(disari)[:800]}")
    yaz_json(os.path.join(k, "disa-aktarim.json"), disari)
    canli = {q["id"].upper(): q for q in (disari if isinstance(disari, list) else disari.get("questions") or disari.get("items"))}
    istek = []
    for qid in secilen:
        q, r = canli.get(qid), kayitlar[qid]
        if not q:
            durum[qid] = "canlıda bulunamadı"
            continue
        if q["stem"] != veri[qid][1]["stem"] or q["figures"]:
            durum[qid] = "canlıdaki kök dışa aktarımdan sonra değişmiş ya da figür eklenmiş; atlandı"
            continue
        istek.append({
            "questionId": q["id"], "expectedStemHash": q["stemHash"], "stem": r["stem"], "lessonMikroId": r["lessonMikroId"],
            "options": [{"id": o["id"], "stem": o["text"]} for o in r["options"]], "correctOptionId": r["correctOptionId"],
            "markupSpans": r["spans"], "solution": {"id": r["solution"]["id"], "contentText": r["solution"]["ContentText"],
                                                     "structuredContentJson": r["solution"]["StructuredContentJson"]},
            "figures": [{"code": f["Code"], "kind": f["Kind"], "title": f["Title"], "alt": f["Alt"], "dataJson": f["DataJson"],
                         "orderIndex": f["OrderIndex"],
                         "still": {"lightUrl": f["Still"]["light"], "darkUrl": f["Still"]["dark"], "width": f["Still"]["width"],
                                   "height": f["Still"]["height"]} if f.get("Still") else None} for f in r["eklenecekFigurler"]],
            "allowStillRemoval": False})
    return istek, durum


def yaz(argv, canli):
    ad = argv[0]
    k = klasor(ad)
    istek, durum = revizyon_istegi(k)
    govde = {"questions": istek, "usageKind": 2, "dryRun": not canli}
    tur = "canli" if canli else "kuru"
    yaz_json(os.path.join(k, f"revizyon-{tur}.json"), govde)
    kod, yanit = cagir("POST", "/api/claude/questions/revisions", govde)
    yaz_json(os.path.join(k, f"yanit-{tur}.json"), yanit)
    yaz_json(os.path.join(k, f"atlanan-{tur}.json"), durum)
    if kod != 200:
        sys.exit(f"Revizyon {'yazılmadı' if canli else 'kuru çalıştırması geçmedi'} ({kod}): {json.dumps(yanit, ensure_ascii=False)[:3000]}")
    raporlar = yanit.get("questions") if isinstance(yanit, dict) else yanit
    bekleyen = [r for r in raporlar if r.get("awaitsStill")]
    print(f"{ad}: revizyon {'yazıldı' if canli else 'kuru çalıştırma geçti'}: {len(raporlar)} soru · figür eklenen "
          f"{sum(r.get('figuresAdded', 0) for r in raporlar)} · resim bekleyen {len(bekleyen)} · atlanan {len(durum)}")
    for x, neden in durum.items():
        print(f"  atlandı {x[:8]}: {neden}")
    if canli:
        kod, disari = cagir("POST", "/api/claude/questions/export", {"ids": [q["questionId"] for q in istek]})
        geri = {q["id"].upper(): q for q in (disari if isinstance(disari, list) else disari.get("questions") or disari.get("items"))}
        hata = [q["questionId"] for q in istek if geri[q["questionId"].upper()]["stem"] != q["stem"] or len(geri[q["questionId"].upper()]["figures"]) != len(q["figures"])]
        yaz_json(os.path.join(k, "canli-yazim.json"), {"zaman": time.strftime("%Y-%m-%d %H:%M"), "soru": len(istek), "geriOkumaHatasi": hata})
        if hata:
            sys.exit(f"Geri okumada {len(hata)} soru beklenen değil: {hata[:5]}")
        print(f"Doğrulandı: {len(istek)} sorunun kökü ve figürleri canlıda beklenen hâlde.")


# ---------------------------------------------------------------- rapor
def rapor(argv):
    ad = argv[0]
    k = klasor(ad)
    veri = sorular()
    cozd = json.load(open(os.path.join(k, "cozum-denetimi.json"), encoding="utf-8")) if os.path.exists(os.path.join(k, "cozum-denetimi.json")) else {}
    maliyet = json.load(open(os.path.join(k, "maliyet.json"), encoding="utf-8")) if os.path.exists(os.path.join(k, "maliyet.json")) else {}
    kayit = onarim_kayitlari(k)
    satir = [f"# Eksik görsel onarımı: {ad}", "", f"Maliyet: {maliyet}", "",
             f"Karar: {dict(Counter(r['karar'] for _, r in kayit.values()))} · görsel türü: "
             f"{dict(Counter(f['visual']['kind'] for _, r in kayit.values() for f in r.get('figures') or []))} · "
             f"görselsiz: {sum(1 for _, r in kayit.values() if not r.get('figures'))} · motor isteği: {sum(1 for _, r in kayit.values() if r.get('motorIstegi'))}", ""]
    for rep, (h, r) in sorted(kayit.items(), key=lambda x: (x[1][0]["ders"], x[1][0]["konu"])):
        q = veri[rep][1]
        c = cozd.get(rep, {})
        satir += [f"## {h['ders'].split('/')[-1]} · {h['konuAdi']} · {rep[:8]} · {r['karar']}", "",
                  f"**Sorun:** {r.get('sorun')}", "", f"**Önce:** {temizle(q['stem'])}", "",
                  "**Sonra:** " + r["stem"].replace("\n", "  \n"), ""]
        for f in r.get("figures") or []:
            satir += [f"- figür `{f['code']}` ({f['visual']['kind']}): {f.get('title')} — {f.get('alt')}", "",
                      "```json", json.dumps(f["visual"], ensure_ascii=False), "```", ""]
        satir += ["  \n".join(f"{'ABCDE'[i]}) {o}" for i, o in enumerate(r["options"])), "",
                  f"**Doğru:** {r['correct']} · **Çözüm denetimi:** {c.get('cevap')} (emin {c.get('emin')}) {'✓' if c.get('tutar') else '✗ ' + (c.get('not') or '')}", "",
                  f"**Kısa çözüm:** {(r.get('cozum') or {}).get('kisa')}", ""]
        if r.get("motorIstegi"):
            satir += [f"**Motor isteği:** {r['motorIstegi']}", ""]
    with open(os.path.join(k, "rapor.md"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(satir))
    print(os.path.join(k, "rapor.md"))


if __name__ == "__main__":
    komut, argv = sys.argv[1], sys.argv[2:]
    {"sec": sec, "paket": paket,
     "gonder": lambda a: gonder(a, "duzelt-istekler.jsonl", "duzelt-batch.json") if "--duzelt" in a else gonder(a), "topla": topla, "coz": coz, "topla-coz": topla_coz, "denetle": denetle,
     "ciz": ciz, "yukle": yukle, "kuru": lambda a: yaz(a, False), "canli": lambda a: yaz(a, True), "rapor": rapor}[komut](argv)
