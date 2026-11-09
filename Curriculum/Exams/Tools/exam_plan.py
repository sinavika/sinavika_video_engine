"""Bir ayın deneme kitapçıklarını planlar: hangi kitapçıklar, her slotun dersi, konusu, önerilen mikro konusu, zorluğu ve doğru harfi.
Kullanım: python exam_plan.py <ay>            örn. python exam_plan.py 2026-11
Girdi:  Outputs/Exams/katalog.json (exam_catalog.py), EgitimVerileri/<sınav>/CikmisSorular/<ders>.jsonl
Çıktı:  Curriculum/Exams/<ay>/plan.json ve plan.md

Kurallar:
- Kitapçıklar şablondan: her oturum için GeneralExamsPerMonth genel kitapçık (oturumun bütün bölümleri), her bölüm için
  SectionExamsPerMonth bölüm kitapçığı. Bölüm ve ders soru sayıları canlıdaki CategorySections / CategorySectionLessons'tan.
- Konu dağılımı ÖSYM çıkmışlarıyla orantılı: bir dersin bu aydaki bütün kopyaları (genel + bölüm) birlikte en büyük kalan
  yöntemiyle paylaştırılır, sonra kopyalara dengeli dağıtılır. ÖSYM'de hiç sorulmayan konu gelmez. Eşlenmiş ÖSYM sorusu
  kopyaların toplam slotunun üç katından azsa ağırlık konulara eşit payla harmanlanır (plan.md'de belirtilir).
- Mikro konu ÖSYM mikro sıklığıyla önerilir; yazar konu içinde değiştirebilir.
- Zorluk: her ders bloğunda yaklaşık %30 kolay, %45 orta, %25 zor. Doğru harfler bölüm içinde A–E dengeli, aynı harf üst üste
  üç kez gelmez."""
import hashlib, json, os, random, sys, uuid
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exam_common import EXAMS, OSYM_DERS, OSYM_KLASOR, katalog
from paths import EDUCATION_DATA

AY = sys.argv[1]
YIL, AY_NO = map(int, AY.split("-"))
AY_ADI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][AY_NO - 1]
NS = uuid.UUID("6f1d9a52-3c47-4e0b-9a3e-5b1f0c7d2e81")  # Sınavika deneme kimlikleri için sabit ad alanı
KOD_HARF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ZORLUK = (("Easy", 0.30), ("Medium", 0.45), ("Hard", 0.25))
OTURUM_ADI = {"YKS_TYT": "TYT", "YKS_AYT": "AYT", "KPSS_LISANS": "KPSS Lisans", "KPSS_ONLISANS": "KPSS Önlisans", "KPSS_ORTAOGRETIM": "KPSS Ortaöğretim"}
# Ayna: Ortaöğretim kitapçıkları Önlisans'ın sorularını aynen kullanır (sahip kararı, 2 Kasım 2026; konu ağacı ve bölümler birebir aynı).
# Plan slot slot kopyalanır (konu, mikro, zorluk, doğru harf); kimlikler kendi kataloğundan gelir. Sorular exam_mirror.py ile kopyalanır.
AYNA = {"KPSS_ORTAOGRETIM": "KPSS_ONLISANS"}
ONEK = {"YKS_TYT": "TYT", "YKS_AYT": "AYT", "KPSS_LISANS": "KPSS-LISANS", "KPSS_ONLISANS": "KPSS-ONLISANS", "KPSS_ORTAOGRETIM": "KPSS-ORTAOGRETIM"}
# Türkçe bloğunda ÖSYM sırası: anlam → dil bilgisi → paragraf → sözel mantık. Öbür derslerde katalog sırası.
TRK_GRUP = {"SOZCUKTE_ANLAM": 0, "SOZ_YORUMU": 0, "DEYIM_ATASOZU": 0, "CUMLEDE_ANLAM": 0, "PARAGRAF": 2, "PARAGRAF_YAPI": 2,
            "PARAGRAF_ANLAM": 2, "SOZEL_MANTIK": 3, "SOZEL_MUHAKEME_MANTIK": 3}


def kimlik(*parca):
    return str(uuid.uuid5(NS, "/".join(parca))).upper()


def kod8(tohum, kullanilmis):
    n = 0
    while True:
        h = hashlib.sha256(f"{tohum}#{n}".encode()).digest()
        k = "".join(KOD_HARF[b % len(KOD_HARF)] for b in h[:8])
        if k not in kullanilmis:
            kullanilmis.add(k)
            return k
        n += 1


def en_buyuk_kalan(agirlik, toplam):
    """{anahtar: ağırlık} → {anahtar: adet}, toplamı `toplam`."""
    s = sum(agirlik.values())
    pay = {k: toplam * v / s for k, v in agirlik.items()}
    adet = {k: int(p) for k, p in pay.items()}
    kalan = toplam - sum(adet.values())
    for k in sorted(pay, key=lambda k: (-(pay[k] - adet[k]), -agirlik[k], k))[:kalan]:
        adet[k] += 1
    return {k: v for k, v in adet.items() if v}


def osym_sayim(sub, ders, gecerli):
    """ÖSYM çıkmışlarında konu ve mikro sıklığı (yalnız canlı katalogda etkin konular)."""
    p = os.path.join(EDUCATION_DATA, *OSYM_KLASOR[sub].split("/"), "CikmisSorular", OSYM_DERS.get((sub, ders), ders) + ".jsonl")
    konu, mikro = Counter(), defaultdict(Counter)
    if os.path.exists(p):
        for l in open(p, encoding="utf-8"):
            d = json.loads(l)
            k = d.get("lessonSubCode")
            if k in gecerli:
                konu[k] += 1
                if d.get("lessonMikroCode"):
                    mikro[k][d["lessonMikroCode"]] += 1
    return konu, mikro


def dagit(konu_adet, kopya, kapasite):
    """Konu adetlerini kopyalara dengeli dağıtır: [{konu: adet}] (kopya başına toplam = kapasite)."""
    paylar = [Counter() for _ in range(kopya)]
    for k in sorted(konu_adet, key=lambda k: (-konu_adet[k], k)):
        for _ in range(konu_adet[k]):
            i = min((i for i in range(kopya) if sum(paylar[i].values()) < kapasite),
                    key=lambda i: (paylar[i][k], sum(paylar[i].values()), i))
            paylar[i][k] += 1
    return paylar


def harfler(n, tohum):
    r = random.Random(tohum)
    while True:
        h = list("ABCDE" * (n // 5)) + r.sample("ABCDE", n % 5)
        r.shuffle(h)
        if not any(h[i] == h[i + 1] == h[i + 2] for i in range(n - 2)):
            return h


def zorluklar(n, tohum):
    adet = en_buyuk_kalan({z: p for z, p in ZORLUK}, n)
    z = [k for k, _ in ZORLUK for _ in range(adet.get(k, 0))]
    random.Random(tohum).shuffle(z)
    return z


kat = katalog()
kitapcik_kodlari = set(kat["bookletCodes"])
soru_kodlari = set(kat["questionCodes"])
kitapciklar = []        # plan sırası: şablon → oturum → genel, sonra bölüm kitapçıkları
for t in [t for t in kat["templates"] if t["active"]]:
    for ses in t["sessions"]:
        sub = kat["subs"][ses["sub"]]
        bolumler = [b for b in sub["sections"] if not b["isAlternative"]]
        if len(bolumler) != len(sub["sections"]):
            raise SystemExit(f"{ses['sub']}: alternatifli bölüm var; plan aracı bunu henüz kurmuyor.")
        for g in range(t["generalPerMonth"]):
            kitapciklar.append({"sub": ses["sub"], "tur": "genel", "sira": g + 1, "bolumler": [b["code"] for b in bolumler]})
        if ses["hasSectionExams"]:
            for b in bolumler:
                for x in range(t["sectionPerMonth"]):
                    kitapciklar.append({"sub": ses["sub"], "tur": "bolum", "sira": x + 1, "bolumler": [b["code"]]})

# Ders başına kopyalar: (sub, bölüm, ders) → o dersi taşıyan kitapçıkların listesi
kopyalar = defaultdict(list)
for i, kb in enumerate(kitapciklar):
    for bk in kb["bolumler"]:
        kopyalar[(kb["sub"], bk)].append(i)

notlar, dagilim_ozet = [], []
slot_plani = defaultdict(list)   # kitapçık sırası → [slot]
for (sub_kod, bolum_kod), kitap_idx in kopyalar.items():
    if sub_kod in AYNA:
        continue
    sub = kat["subs"][sub_kod]
    bolum = next(b for b in sub["sections"] if b["code"] == bolum_kod)
    agac = {m["code"]: m for m in sub["lessons"]}
    bolum_slotlari = defaultdict(list)
    for ders in bolum["lessons"]:
        m = agac[ders["code"]]
        etkin = {s["code"]: s for s in m["subs"] if s["active"] and any(k["active"] for k in s["mikros"])}
        konu, mikro = osym_sayim(sub_kod, ders["code"], etkin)
        kopya = len(kitap_idx)
        toplam = kopya * ders["questionCount"]
        esitle = sum(konu.values()) < 3 * toplam
        agirlik = dict(konu)
        if esitle:
            esit = sum(konu.values()) / len(etkin) if konu else 1.0
            agirlik = {k: konu.get(k, 0) + max(esit, 1.0) for k in etkin}
            notlar.append(f"{sub_kod} {ders['code']}: eşlenmiş ÖSYM sorusu {sum(konu.values())} < 3 × {toplam}; konulara eşit pay harmanlandı.")
        adet = en_buyuk_kalan(agirlik, toplam)
        dagilim_ozet.append({"sub": sub_kod, "bolum": bolum_kod, "ders": ders["code"], "kopya": kopya, "soruKopyaBasina": ders["questionCount"],
                             "osymSoru": sum(konu.values()), "esitPayHarmanlandi": esitle,
                             "konular": {k: {"ad": etkin[k]["name"], "osym": konu.get(k, 0), "adet": adet[k]} for k in sorted(adet, key=lambda k: etkin[k]["order"])}})
        paylar = dagit(adet, kopya, ders["questionCount"])
        # Mikro önerisi: konu başına bütün kopyalar için ÖSYM mikro sıklığıyla, etkin mikrolarla sınırlı; kopya içinde tekrar en aza
        for konu_kod, n in adet.items():
            mk_etkin = {k["code"]: k for k in etkin[konu_kod]["mikros"] if k["active"]}
            ag = {k: mikro[konu_kod].get(k, 0) + 0.25 for k in mk_etkin}
            mk_adet = en_buyuk_kalan(ag, n)
            havuz = [k for k in sorted(mk_adet, key=lambda k: (-mk_adet[k], mk_etkin[k]["order"])) for _ in range(mk_adet[k])]
            for ci, pay in enumerate(paylar):
                for _ in range(pay[konu_kod]):
                    secim = next((k for k in havuz if k not in [s["mikro"] for s in bolum_slotlari[ci] if s["konu"] == konu_kod]), havuz[0])
                    havuz.remove(secim)
                    bolum_slotlari[ci].append({"ders": ders["code"], "dersAd": ders["name"], "sectionLessonId": ders["sectionLessonId"],
                                               "lessonMainId": ders["lessonMainId"], "konu": konu_kod, "konuAd": etkin[konu_kod]["name"],
                                               "lessonSubId": etkin[konu_kod]["id"], "mikro": secim, "mikroAd": mk_etkin[secim]["name"],
                                               "lessonMikroId": mk_etkin[secim]["id"], "_konuSira": etkin[konu_kod]["order"],
                                               "_mikroSira": mk_etkin[secim]["order"], "_dersSira": ders["order"]})
    for ci, ki in enumerate(kitap_idx):
        sl = bolum_slotlari[ci]
        sl.sort(key=lambda s: (s["_dersSira"], TRK_GRUP.get(s["konu"], 1) if s["ders"] == "TRK" else 0, s["_konuSira"], s["_mikroSira"]))
        tohum = f"{AY}/{ki}/{bolum_kod}"
        hr = harfler(len(sl), tohum)
        zr = {}
        for ders in bolum["lessons"]:
            blok = [i for i, s in enumerate(sl) if s["ders"] == ders["code"]]
            for i, z in zip(blok, zorluklar(len(blok), tohum + "/" + ders["code"])):
                zr[i] = z
        for i, s in enumerate(sl):
            for k in [k for k in s if k.startswith("_")]:
                del s[k]
            s.update({"bolum": bolum_kod, "sectionId": bolum["id"], "sira": i + 1, "dogru": hr[i], "zorluk": zr[i]})
        assert len(sl) == bolum["questionCount"], (sub_kod, bolum_kod, len(sl))
        slot_plani[ki] += sl

# Ayna kitapçıkları: kaynağın slotları aynı sırayla, kendi kataloğunun kimlikleriyle
for ki, kb in enumerate(kitapciklar):
    if kb["sub"] not in AYNA:
        continue
    kaynak_sub = AYNA[kb["sub"]]
    ks = next(i for i, x in enumerate(kitapciklar) if x["sub"] == kaynak_sub and x["tur"] == kb["tur"] and x["sira"] == kb["sira"]
              and [b.replace(kaynak_sub, kb["sub"]) for b in x["bolumler"]] == kb["bolumler"])
    sub = kat["subs"][kb["sub"]]
    agac = {m["code"]: m for m in sub["lessons"]}
    for s in slot_plani[ks]:
        bolum = next(b for b in sub["sections"] if b["code"] == s["bolum"].replace(kaynak_sub, kb["sub"]))
        ders = next(d for d in bolum["lessons"] if d["code"] == s["ders"])
        konu = next(x for x in agac[s["ders"]]["subs"] if x["code"] == s["konu"])
        mk = next(x for x in konu["mikros"] if x["code"] == s["mikro"])
        slot_plani[ki].append({**s, "bolum": bolum["code"], "sectionId": bolum["id"], "sectionLessonId": ders["sectionLessonId"],
                               "lessonMainId": ders["lessonMainId"], "lessonSubId": konu["id"], "lessonMikroId": mk["id"], "_aynaKitapcik": ks})
    notlar.append(f"{kb['sub']} {kb['tur']} kitapçığı {kaynak_sub} kitapçığının aynasıdır: aynı sorular, kendi kimlikleri.")

cikti = []
for i, kb in enumerate(kitapciklar):
    sub = kat["subs"][kb["sub"]]
    if kb["tur"] == "genel":
        anahtar = f"{ONEK[kb['sub']]}-GENEL" + (f"-{kb['sira']}" if kb["sira"] > 1 else "")
        ad = f"{AY_ADI} {YIL} · {OTURUM_ADI[kb['sub']]} genel deneme" + (f" {kb['sira']}" if kb["sira"] > 1 else "")
    else:
        bolum = next(b for b in sub["sections"] if b["code"] == kb["bolumler"][0])
        anahtar = f"{ONEK[kb['sub']]}-{bolum['code'].replace(kb['sub'] + '_', '').replace('_', '-')}" + (f"-{kb['sira']}" if kb["sira"] > 1 else "")
        ad = f"{AY_ADI} {YIL} · {OTURUM_ADI[kb['sub']]} {bolum['name']} denemesi" + (f" {kb['sira']}" if kb["sira"] > 1 else "")
    bid = kimlik("kitapcik", AY, anahtar)
    slotlar = []
    for s in slot_plani[i]:
        sid = kimlik("slot", AY, anahtar, s["bolum"], str(s["sira"]))
        qid = kimlik("soru", AY, anahtar, s["bolum"], str(s["sira"]))
        onek = (s["ders"][:3]).upper().ljust(3, "X")
        n = int(hashlib.sha256(qid.encode()).hexdigest(), 16)
        while f"{onek}{n % 1_000_000:06d}" in soru_kodlari:
            n //= 7
            n += 1
        soru_kodlari.add(f"{onek}{n % 1_000_000:06d}")
        slotlar.append({**{k: v for k, v in s.items() if not k.startswith("_")}, "slotId": sid, "soruId": qid, "soruKodu": f"{onek}{n % 1_000_000:06d}"})
    cikti.append({"anahtar": anahtar, "ad": ad, "id": bid, "kod": kod8(f"{AY}/{anahtar}", kitapcik_kodlari), "sub": kb["sub"],
                  "categorySubId": sub["id"], "tur": kb["tur"], "bolumler": kb["bolumler"], "soru": len(slotlar),
                  "dersler": sorted({s["ders"] for s in slotlar}, key=lambda d: next((b["order"], x["order"]) for b in sub["sections"] for x in b["lessons"] if x["code"] == d and b["code"] in kb["bolumler"])),
                  "slotlar": slotlar})
    if kb["sub"] in AYNA:
        ks = slot_plani[i][0]["_aynaKitapcik"]
        kaynak = cikti[ks]
        cikti[-1]["ayna"] = kaynak["anahtar"]
        for s, k in zip(slotlar, kaynak["slotlar"]):
            assert (s["ders"], s["konu"], s["mikro"], s["dogru"], s["zorluk"]) == (k["ders"], k["konu"], k["mikro"], k["dogru"], k["zorluk"])
            s["aynaSoruId"] = k["soruId"]

klasor = os.path.join(EXAMS, AY)
os.makedirs(klasor, exist_ok=True)
pl = {"ay": AY, "publisherId": kat["publisherId"], "kitapciklar": cikti, "dagilim": dagilim_ozet, "notlar": notlar}
json.dump(pl, open(os.path.join(klasor, "plan.json"), "w", encoding="utf-8", newline="\n"), ensure_ascii=False, indent=1)

# İnsan okuması için özet
L = [f"# {AY_ADI} {YIL} deneme planı", "", "`exam_plan.py` üretir; elle düzenlenmez. Konu adetleri ÖSYM çıkmışlarıyla orantılıdır "
     "(dersin bu aydaki bütün kopyaları birlikte).", "", "## Kitapçıklar", "", "| Kitapçık | Ad | Bölümler | Soru | Kod |", "|---|---|---|---|---|"]
for b in cikti:
    L.append(f"| {b['anahtar']} | {b['ad']} | {', '.join(b['bolumler'])} | {b['soru']} | {b['kod']} |")
L += ["", f"Toplam: {len(cikti)} kitapçık, {sum(b['soru'] for b in cikti)} soru.", "", "## Konu dağılımı", ""]
for d in dagilim_ozet:
    L.append(f"**{d['sub']} · {d['bolum']} · {d['ders']}** ({d['kopya']} kopya × {d['soruKopyaBasina']} soru; ÖSYM eşlenmiş {d['osymSoru']}"
             + ("; eşit pay harmanlandı" if d["esitPayHarmanlandi"] else "") + ")")
    L.append("")
    L.append(" · ".join(f"{v['ad']} {v['adet']}" for v in d["konular"].values()))
    L.append("")
if notlar:
    L += ["## Notlar", ""] + [f"- {n}" for n in notlar]
open(os.path.join(klasor, "plan.md"), "w", encoding="utf-8", newline="\n").write("\n".join(L) + "\n")
print(f"{len(cikti)} kitapçık, {sum(b['soru'] for b in cikti)} soru → {klasor}")
for n in notlar:
    print("NOT:", n)
