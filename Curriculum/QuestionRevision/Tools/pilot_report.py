"""Pilot revizyonun önce/sonra raporunu yazar: pilot/PilotRaporu.md"""
import json, os, re
from collections import Counter

from paths import PILOT as KOK
R = [json.loads(l) for l in open(os.path.join(KOK, "sonuc.jsonl"), encoding="utf-8")]
ORIG = {q["id"]: q for q in (json.loads(l) for l in open(os.path.join(KOK, "sorular.jsonl"), encoding="utf-8"))}
alt = {mk["code"]: mk["name"] for mk in json.load(open(os.path.join(KOK, "altkonular.json"), encoding="utf-8"))["mikros"]}
tek = [r for r in R if r["id"] == r["kaynak"]]
kopya = Counter(r["kaynak"] for r in R)

TUR = [
    ("Cevap anahtarı yanlış", r"cevap anahtarı yanlış|doğru kabul edilen .*(savunulamıyor|yanlış|tersti)|hiçbir şık doğru değil"),
    ("Birden çok doğru cevap", r"birden çok doğru|iki doğru|üç şık|tek doğru(su)? (belirlenemiyor|savunulamıyor|belirsiz)|yanıt tartışmalı"),
    ("Konu dışı soru (paragraf, yazım, noktalama…)", r"sözcükte anlam sorusu değil|atasözü sorusu"),
    ("Kökte olmayan sözcük/parça/parantez soruluyor", r"hiç verilmemiş|geçmiyordu|metinde yoktu|parantez içi açıklamalar yoktu|boşluk yoktu|tablo yoktu|hiç kullanılmamıştı|verilmemişti"),
    ("Altı çizili işaretleme sorunu", r"altı çizili|çizili değil|işaretlenmemiş|tırnakla|__|koyu yazı|kalın yazı|sözcük ortasından|işaretleme kaydı"),
    ("İlgisiz figür / görsel atfı", r"figür|diyagram|tablo"),
    ("Yazım ve anlatım bozukluğu", r"anlatım bozukluğu|yazım yanlışı|yazım hataları|satır sonu|anlamsız|bozuk"),
]


def tur(sorun):
    s = sorun.lower()
    return [ad for ad, rx in TUR if re.search(rx, s)]


turler = Counter(t for r in tek for t in tur(r["sorun"]))
kullanim = Counter((r["usageKind"], r["sourceKind"]) for r in tek)
anahtar = [r for r in tek if "Cevap anahtarı yanlış" in tur(r["sorun"])]
cozulmus = sum(1 for r in tek for qz in ORIG[r["id"]]["quizzes"] if qz["timesAnswered"])


def kisa(t, n=260):
    t = re.sub(r"\s+", " ", t.replace("\n", " ⏎ ")).strip()
    return t if len(t) <= n else t[:n] + "…"


L = ["# Pilot revizyon raporu: TYT Türkçe · Sözcükte Anlam", "",
     f"30 Ekim 2026. Canlıdan dışa aktarılan **{len(tek)} tekil soru** (kopyalarla **{len(R)} kayıt**) tek tek çözülerek revize edildi. "
     "Veritabanına henüz hiçbir şey yazılmadı.", "",
     "## Özet", "",
     "| | Soru |", "|---|---:|",
     f"| Yeniden yazılan (soru kurtarılamayacak durumdaydı) | {sum(1 for r in tek if r['karar'] == 'yeniden_yazildi')} |",
     f"| Düzeltilen (soru korunup hataları giderildi) | {sum(1 for r in tek if r['karar'] == 'duzeltildi')} |",
     f"| Hatasız bulunan | 0 |",
     f"| Alt konusu atanan (önceden boş olanlar dahil hepsi) | {len(tek)} |",
     f"| Doğru şık harfi değişen | 0 |", "",
     "Kullanım: " + ", ".join(f"{a}/{b}: {n}" for (a, b), n in sorted(kullanim.items())) + f". Öğrencilerin çözdüğü quiz sorusu: {cozulmus}.", "",
     "## Bulunan hata türleri", "",
     "Bir soruda birden çok hata olabilir.", "",
     "| Hata | Soru |", "|---|---:|"]
for ad, _ in TUR:
    L.append(f"| {ad} | {turler.get(ad, 0)} |")
L += ["", "### Cevap anahtarı yanlış olan sorular", "",
      "Bu sorularda doğru cevap içeriği, öğrenci istatistikleri ve kitapçık dağılımı bozulmasın diye **aynı harfe** yerleştirildi.", "",
      "| Kod | Kullanım | Sorun |", "|---|---|---|"]
for r in anahtar:
    L.append(f"| {r['code']} | {r['usageKind']}/{r['sourceKind']} | {r['sorun']} |")
L += ["", "## Alt konu dağılımı (revize sonrası)", "", "| Alt konu | Soru |", "|---|---:|"]
for k, v in sorted(Counter(r["lessonMikroCode"] for r in tek).items()):
    L.append(f"| {k} {alt.get(k, '')} | {v} |")
L += ["",
      "## Sistemle ilgili bulgular", "",
      "- **Aylık branş kitapçıkları:** Mayıs–Temmuz kitapçıklarındaki “Sözcükte Anlam” slotlarına konmuş soruların neredeyse hepsi başka konudandı (paragraf, yazım, noktalama, cümle yapısı). Üretim hattı konu hedefine uymayan adayları kabul etmiş görünüyor.",
      "- **API'nin işaretleme denetleyicisi** (`ExamGenerationMarkupCompiler`), kök “altı çizili” deyip çizgiler yalnız şıklarda olduğunda soruyu reddediyor. Oysa bu ÖSYM'nin en sık kullandığı tiptir (“Aşağıdaki cümlelerin hangisinde altı çizili sözcük…”). Uygulama bu tipi doğru gösteriyor; yalnız üretim bu tipi hiç üretemiyor.",
      "- **Soru ailesi etiketleri** (`QuestionFamily`) AdminTest quiz sorularında konuyla ilgisiz (ör. sözcükte anlam sorusunda `tyt_tr_yazim_noktalama`). Bu alana dokunulmadı.",
      f"- **Doğru şık dağılımı dengesiz:** {', '.join(f'{k}: {v}' for k, v in sorted(Counter(r['correctKey'] for r in tek).items()))}. Harfler korunduğu için dağılım aynen kaldı.",
      "- **Kabul özeti** (`AcceptanceContentHash`) içerik değiştiği için artık güncel değil; yalnız denetim listesinde ve bir indekste kullanılıyor, öğrenciye etkisi yok. Dokunulmadı.",
      "",
      "## Veritabanına yazma", "",
      "- `sql/guncelle.sql`: Tek transaction. Önce her sorunun kökünün dışa aktarıldığı hâlde olduğunu (SHA-256) doğrular; biri arada değiştirdiyse hiçbir şey yazmadan durur. Her adımda satır sayısını denetler.",
      "  Yazdıkları: soru kökü, konu ve alt konu, şıklar, doğru cevap (aynı), altı çizili işaretleme kayıtları (eskiler silinip yenileri), çözümler; ilgisiz 9 figür silinir.",
      "- `sql/geri_al.sql`: Her şeyi dışa aktarılan eski hâline döndürür (silinen figürler dahil).",
      "- **LocalDB'de uçtan uca denendi:** değişmiş kökle durdu ve veri aynen kaldı; güncelleme beklenenle birebir aynı; geri alma ilk hâlle birebir aynı. Denemede bulunan satır sonu hatası (`\\r\\n`) giderildi.",
      "", "## Soru soru önce / sonra", ""]
for n, r in enumerate(tek, 1):
    o = ORIG[r["id"]]
    qz = o["quizzes"][0]["title"] if o["quizzes"] else (o["booklet"]["bookletName"] if o["booklet"] else "")
    L += [f"### {n}. {r['code']} · {r['usageKind']}/{r['sourceKind']} · {qz}" + (f" · {kopya[r['id']]} kayıt" if kopya[r['id']] > 1 else ""),
          f"**{'Yeniden yazıldı' if r['karar'] == 'yeniden_yazildi' else 'Düzeltildi'}** · {r['lessonMikroCode']} {alt.get(r['lessonMikroCode'], '')} · Doğru: {r['correctKey']}", "",
          f"> Sorun: {r['sorun']}", "",
          f"**Önce:** {kisa(o['stem'])}", "",
          "  " + " · ".join(f"{'**' if k == o['correctKey'] else ''}{k}) {kisa(t, 60)}{'**' if k == o['correctKey'] else ''}" for k, t in r["eski"]["options"].items()), "",
          f"**Sonra:** {kisa(r['stem'], 600)}", ""]
    for x in r["options"]:
        L.append(f"- {'**' if x['key'] == r['correctKey'] else ''}{x['key']}) {x['text']}{'**' if x['key'] == r['correctKey'] else ''}")
    L.append("")
open(os.path.join(KOK, "PilotRaporu.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(dict(turler)); print("anahtar yanlış:", len(anahtar), "çözülmüş:", cozulmus)
