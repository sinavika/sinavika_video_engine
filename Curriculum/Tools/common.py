"""Quiz ve deneme araçlarının ortak yardımcıları (Curriculum/Tools). Veritabanına bağlanmaz."""
import json, os, re, glob, hashlib
from collections import defaultdict

from engine_paths import QUIZZES as KOK, QUIZ_DATA as DATA, QUIZ_REVISIONS as REVIZYON, QUIZ_RESULTS as SONUC
VERI = os.path.join(DATA, "quiz")

# Çalışma sırası: YKS (TYT → AYT → YDT), sonra KPSS (Lisans → Önlisans → Ortaöğretim)
SINAV_SIRASI = ["YKS/YKS_TYT", "YKS/YKS_AYT", "YKS/YKS_YDT", "KPSS/KPSS_LISANS", "KPSS/KPSS_ONLISANS", "KPSS/KPSS_ORTAOGRETIM"]


def hiyerarsi():
    return json.load(open(os.path.join(DATA, "hiyerarsi.json"), encoding="utf-8"))


def gorsel_ozeti(visual):
    """Motor görselinin içerik özeti: hazır resim bu görselden mi çizildi (stills.json'daki özetle karşılaştırılır)."""
    return hashlib.sha256(json.dumps(visual, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()


def liste_adi(ders):
    """Bir dersin motorun çizeceği görseller listesi: Results/<ders>/soru-figurleri-yks-yks_tyt-cog.jsonl."""
    return "soru-figurleri-" + ders.replace("/", "-").lower() + ".jsonl"


def ders_dosyalari():
    """Çalışma sırasına göre (ders kodu, dosya yolu). Ders kodu: 'YKS/YKS_TYT/TRK'."""
    hiy = hiyerarsi()
    sira = {m["lessonMainId"]: i for i, m in enumerate(hiy)}
    kod_sira = {f'{m["category"]}/{m["categorySub"]}/{m["lessonMainCode"]}': sira[m["lessonMainId"]] for m in hiy}
    out = []
    for grup in SINAV_SIRASI:
        dosyalar = glob.glob(os.path.join(VERI, *grup.split("/"), "*.jsonl"))
        kodlar = [grup + "/" + os.path.basename(p)[:-6] for p in dosyalar]
        for kod, p in sorted(zip(kodlar, dosyalar), key=lambda x: kod_sira.get(x[0], 999)):
            out.append((kod, p))
    return out


def oku(path):
    return [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]


def duz(t):
    return re.sub(r"\s+", " ", re.sub(r"</?u>", "", t or "").lower().replace("−", "-").replace("’", "'")).strip(" .")


def icerik_ozeti(q):
    return hashlib.sha1((duz(q["stem"]) + "|" + "|".join(sorted(duz(o["text"]) for o in q["options"]))).encode()).hexdigest()


def kopya_indeksi():
    """İçeriği aynı quiz sorularını gruplar. Temsilci, çalışma sırasında ilk gelen kayıttır.
    Dönüş: {soruId: temsilciId}"""
    yol = os.path.join(DATA, "kopyalar.json")
    if os.path.exists(yol):
        return json.load(open(yol, encoding="utf-8"))
    gruplar = defaultdict(list)
    for kod, p in ders_dosyalari():
        for q in oku(p):
            gruplar[icerik_ozeti(q)].append(q["id"])
    temsilci = {}
    for ids in gruplar.values():
        for i in ids:
            temsilci[i] = ids[0]
    json.dump(temsilci, open(yol, "w", encoding="utf-8"))
    return temsilci


def ana_ders(hiy, ders_kodu):
    kat, alt, main = ders_kodu.split("/")
    return next(m for m in hiy if m["category"] == kat and m["categorySub"] == alt and m["lessonMainCode"] == main)


def temizle(t):
    """Kaynak metinden boş, çok kısa ve yalnız işaretten oluşan satırları atar; kalanları tek satırda birleştirir."""
    satirlar = [s.strip() for s in (t or "").split("\n")]
    satirlar = [s for s in satirlar if len(s) > 2 and not re.fullmatch(r"[-–—\W\d]{1,4}", s)]
    return " ".join(satirlar)
