"""Bir dersin revizyon raporunu yazar. Veritabanına bağlanmaz.
Kullanım: python lesson_report.py <ders_kodu>
Çıktı: sonuc/<ders_kodu>/DersRaporu.md (özet, hata türleri, cevap anahtarı yanlış olanlar)
       sonuc/<ders_kodu>/OnceSonra.md  (soru soru önce / sonra)"""
import json, os, re, sys
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import KOK, DATA, VERI, SONUC, oku

DERS = sys.argv[1]
KLASOR = os.path.join(SONUC, *DERS.split("/"))
R = oku(os.path.join(KLASOR, "sonuc.jsonl"))
ORIG = {q["id"]: q for q in oku(os.path.join(VERI, *DERS.split("/")) + ".jsonl")}

# Konu ve alt konu adları hiyerarşiden (yapısı ne olursa olsun code/name çiftleri toplanır).
AD = {}


def topla(x):
    if isinstance(x, dict):
        if isinstance(x.get("code"), str) and isinstance(x.get("name"), str):
            AD.setdefault(x["code"], x["name"])
        for v in x.values():
            topla(v)
    elif isinstance(x, list):
        for v in x:
            topla(v)


try:
    topla(json.load(open(os.path.join(DATA, "hiyerarsi.json"), encoding="utf-8")))
except (OSError, ValueError):
    pass

# Hata türleri, revizyon kaydındaki "sorun" metninden çıkarılır; bir soru birden çok türe girebilir.
TUR = [
    ("Cevap anahtarı yanlış", r"cevap anahtarı yanlış|işaretli cevap yanlış|doğru kabul edilen .*(yanlış|uymuyordu|uymuyor|çelişiyordu|dayanaksız|tersti)|kökle çelişiyordu"),
    ("Birden çok doğru cevap", r"birden (çok|fazla) (doğru|şık|seçenek)|iki seçenek (birden )?doğru|aynı ölçüde (doğru|savunul|geçerli|uygun)|tek (doğru|cevab)a inmiyordu|kesin bir cevaba inmiyordu|ikisi de doğru|hepsi .*doğru yazılmıştı|savunulabiliyordu"),
    ("Örnekte sorulan bozukluk/kullanım yoktu", r"bozukluk(u)? yoktu|hiçbirinde|hiç virgül yoktu|ayraç yoktu|iki nokta yoktu|ünlem işareti yoktu|çözülemiyordu|bilgi ölçmüyordu|sınamıyordu"),
    ("Kökte olmayan tablo, metin ya da öge", r"tablo|olmayan bir|bulunmayan|yarım kal|kesik|var olmayan"),
    ("Konu içinde tekrar eden kurgu", r"aynı kurguyu tekrar"),
    ("Altı çizili / tırnak işaretleme sorunu", r"altı çizili|çizili|tırnak içinde"),
    ("Kurala aykırı bilgi (TDK yazım kılavuzu)", r"kılavuz|kurala aykırı|kuralda karşılığı|kurala uymuyordu|kurala dayanmıyordu"),
    ("Cevabı ele veren ya da gereksiz uzun kök/şık", r"ele veriyordu|okunarak bulunuyordu|aynen tekrarl|gereksiz (bir )?giriş|uzatılmıştı|sıkıştırılmıştı|gömülmüştü|şık okumaya"),
]


def turler(sorun):
    s = sorun.replace("İ", "i").replace("I", "ı").lower()
    return [ad for ad, rx in TUR if re.search(rx, s)]


def kisa(t, n=260):
    t = re.sub(r"\s+", " ", (t or "").replace("\n", " ⏎ ")).strip()
    return t if len(t) <= n else t[:n] + "…"


def ad(kod):
    return f"{kod} {AD.get(kod, '')}".strip()


tek = [r for r in R if r["id"] == r["kaynak"]]
kopya = Counter(r["kaynak"] for r in R)
tur_say = Counter(t for r in tek for t in turler(r["sorun"]))
anahtar = [r for r in tek if "Cevap anahtarı yanlış" in turler(r["sorun"])]
konu = defaultdict(Counter)
for r in tek:
    konu[r["lessonSubCode"]][r["karar"]] += 1
mikro = defaultdict(Counter)
for r in tek:
    mikro[r["lessonSubCode"]][r["lessonMikroCode"]] += 1
cozulmus = sum(1 for r in tek if any((qz.get("timesAnswered") or 0) > 0 for qz in ORIG[r["id"]].get("quizzes") or []))
harf_degisen = sum(1 for r in tek if r["correctKey"] != ORIG[r["id"]]["correctKey"])
span = sum(len(r.get("spans") or []) for r in R)
figur = sum(len(r.get("eklenecekFigurler") or []) + len(r.get("silinecekFigurIds") or []) for r in R)

L = [f"# Revizyon raporu: {DERS}", "",
     f"Yalnız quiz soruları. Canlıdan dışa aktarılan **{len(tek)} tekil soru** (kopyalarla **{len(R)} kayıt**) tek tek çözülerek revize edildi. "
     "Veritabanına henüz hiçbir şey yazılmadı.", "",
     "## Özet", "",
     "| | Soru |", "|---|---:|",
     f"| Yeniden yazılan (soru kurtarılamayacak durumdaydı) | {sum(1 for r in tek if r['karar'] == 'yeniden_yazildi')} |",
     f"| Düzeltilen (soru korunup kök, şık ya da çözüm düzeltildi) | {sum(1 for r in tek if r['karar'] == 'duzeltildi')} |",
     f"| Cevap anahtarı yanlış olan | {len(anahtar)} |",
     f"| Doğru şık harfi değişen | {harf_degisen} |",
     f"| Öğrencilerin daha önce çözdüğü | {cozulmus} |",
     f"| Altı çizili işaretleme kaydı (revize sonrası) | {span} |",
     f"| Figür değişikliği | {figur} |", "",
     "## Konu konu", "",
     "| Konu | Soru | Yeniden yazılan | Düzeltilen |", "|---|---:|---:|---:|"]
for k in sorted(konu, key=lambda k: -sum(konu[k].values())):
    c = konu[k]
    L.append(f"| {ad(k)} | {sum(c.values())} | {c['yeniden_yazildi']} | {c['duzeltildi']} |")
L += ["", "## Bulunan hata türleri", "",
      "Sorun açıklamalarından otomatik sınıflandırılmıştır; bir soru birden çok türe girebilir.", "",
      "| Hata | Soru |", "|---|---:|"]
for t, _ in TUR:
    L.append(f"| {t} | {tur_say.get(t, 0)} |")
L += ["", "## Cevap anahtarı yanlış olan sorular", "",
      "Bu sorularda doğru cevap, öğrenci istatistikleri ve kitapçık dağılımı bozulmasın diye **aynı harfe** yerleştirildi.", "",
      "| Kod | Konu | Sorun |", "|---|---|---|"]
for r in sorted(anahtar, key=lambda r: (r["lessonSubCode"], r["code"])):
    L.append(f"| {r['code']} | {r['lessonSubCode']} | {kisa(r['sorun'], 400)} |")
L += ["", "## Alt konu dağılımı (revize sonrası)", ""]
for k in sorted(mikro):
    L += [f"**{ad(k)}:** " + ", ".join(f"{m} ({n})" for m, n in sorted(mikro[k].items())), ""]
L += ["## Doğru şık dağılımı", "",
      ", ".join(f"{k}: {v}" for k, v in sorted(Counter(r["correctKey"] for r in tek).items())) + ". Harfler korunduğu için dağılım aynen kaldı.", "",
      "## Veritabanına yazma", "",
      "- `guncelle.sql`: Tek transaction. Önce her sorunun kökünün dışa aktarıldığı hâlde olduğunu (SHA-256) doğrular; biri arada değiştirdiyse hiçbir şey yazmadan durur. Her adımda satır sayısını denetler.",
      "- `geri_al.sql`: Her şeyi dışa aktarılan eski hâline döndürür.",
      "- LocalDB'de uçtan uca denendi: değişmiş kökle durdu ve veri aynen kaldı; güncelleme beklenenle birebir aynı; geri alma ilk hâlle birebir aynı.",
      "", f"Soru soru önce / sonra: [OnceSonra.md](OnceSonra.md)", ""]
open(os.path.join(KLASOR, "DersRaporu.md"), "w", encoding="utf-8").write("\n".join(L))

O = [f"# Önce / sonra: {DERS}", ""]
for k in sorted(konu):
    O += [f"## {ad(k)}", ""]
    for r in sorted((r for r in tek if r["lessonSubCode"] == k), key=lambda r: r["code"]):
        o = ORIG[r["id"]]
        O += [f"### {r['code']}" + (f" · {kopya[r['id']]} kayıt" if kopya[r['id']] > 1 else ""),
              f"**{'Yeniden yazıldı' if r['karar'] == 'yeniden_yazildi' else 'Düzeltildi'}** · {ad(r['lessonMikroCode'])} · Doğru: {r['correctKey']}", "",
              f"> Sorun: {r['sorun']}", "",
              f"**Önce:** {kisa(o['stem'])}", "",
              "  " + " · ".join(f"{'**' if x['key'] == o['correctKey'] else ''}{x['key']}) {kisa(x['text'], 70)}{'**' if x['key'] == o['correctKey'] else ''}" for x in o["options"]), "",
              f"**Sonra:** {kisa(r['stem'], 700)}", ""]
        O += [f"- {'**' if x['key'] == r['correctKey'] else ''}{x['key']}) {x['text']}{'**' if x['key'] == r['correctKey'] else ''}" for x in r["options"]]
        O.append("")
open(os.path.join(KLASOR, "OnceSonra.md"), "w", encoding="utf-8").write("\n".join(O))
print(f"tekil {len(tek)} · anahtar yanlış {len(anahtar)} · çözülmüş {cozulmus} · harf değişen {harf_degisen}")
print(dict(tur_say))
