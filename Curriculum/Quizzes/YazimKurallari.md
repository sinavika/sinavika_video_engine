# Quiz soruları revizyon kuralları

Yalnız quiz soruları (`UsageKind = 2`) revize edilir. **Deneme sorularına dokunulmaz.** Sıra: YKS (TYT → AYT), sonra KPSS (Lisans → Önlisans → Ortaöğretim); YDT kaldırıldı. Her sınavda ders ders, her derste konu konu.

Bu kuralların otomatik denetlenebilenleri `Curriculum/Tools/check_revisions.py` (metin, işaretleme, çözüm) ve `Curriculum/Tools/FigureCheck` (API'nin kendi figür ve işaretleme kodu) ile denetlenir. Denetimden geçmeyen soru veritabanına yazılmaz.

## Kayıt

- Soru yerinde güncellenir: soru, şık ve çözüm kimlikleri değişmez.
- **Doğru şıkkın harfi korunur.** Quiz istatistikleri (çözülme, doğru sayısı) bozulmasın diye doğru cevap aynı harfe yerleştirilir. Cevap anahtarı yanlış olan soruda doğru içerik o harfe taşınır.
- **Şık sayısı korunur** (quiz 4 ya da 5 şıklı olabilir).
- Quiz'in zorluğu (Kolay/Orta/Zor) korunur; soru zorluğa uygun yazılır.
- Her soru kendi quiz'inin konusunda (LessonSub) kalır ve bir alt konuya (LessonMikro) bağlanır. Başka konudan gelmiş soru taşınmaz; yerine bu konuya uygun yeni soru yazılır.
- **Kopyalar:** Aynı soru başka kategoride de varsa (ör. KPSS Lisans ve Önlisans) aynı içerik iki kayda da yazılır; konu ve alt konu her kaydın kendi kategorisindeki karşılığına koduyla eşlenir. Karşılık yoksa kopya ayrıca ele alınır.
- Öğrenciye özel (SinoAI) ve yönetici deneme (AdminTest) quiz'leri ayrı sayılır ve onaya göre revize edilir.

## Kök ve şıklar

- Şıklar birbirinden farklı, biçimce paralel, yaklaşık eşit uzunlukta; tek doğru cevap.
- Şık metni harfle başlamaz (“A)” yazılmaz).
- Öncüller ayrı satırda (`I. …`), parça ile soru cümlesi arasında boş satır.
- ÖSYM üslubu; Türkçe yazım ve noktalama TDK'ye uygun. Yabancı dil derslerinde kök ve şıklar o dilde, o sınavın üslubunda.
- Kök cevabı içinde vermez (“…duyularla algılanamayan bir durumu anlatan sözcük soyut mudur?” gibi).
- Soru, sorduğu şeyi kökte gerçekten içerir: “parçadaki”, “parantez içindeki”, “numaralanmış” denen her şey kökte vardır.

## Quiz ekranında gösterim

Web ve mobil kökü ve şıkları şöyle çizer (`normalizeQuestionMarkup` + `renderInlineMarkup`):

- `<u>…</u>` altı çizili. **Kullanılan tek etiket budur.**
- Satır sonları korunur.
- `x^2`, `a^{n+1}`, `2^(n+1)` üst simge olur. `\( … \)` LaTeX düz Unicode'a çevrilir (√, ·, ≤ …).
- **`$…$` çizilmez**, ekranda dolar işaretiyle görünür. Kullanılmaz; formüller Unicode (x², √2, ≤, π) ya da `^` ile yazılır.
- `**…**` ve `__…__` eski üretim kalıntısıdır; kullanılmaz.

## Altı çizili sözcük

- Bağlamdaki hedef `<u>…</u>` ile çizilir; çizili hedef tırnak içine alınmaz; çizgi sözcüğü bütün olarak kapsar.
- Metin “altı çizili” diyorsa en az bir `<u>` vardır; `<u>` varsa metin “altı çizili” der. Yabancı dilde karşılıkları: *underlined*, *unterstrichen*, *souligné*, *подчёркнутый*, *المسطر تحته*.
- Sayı veriliyorsa (“altı çizili iki sözcük”) çizili sayısı tutar.
- “Koyu, kalın, eğik, vurgulanan, işaretli” denmez.
- Sözcüğün kendisinden bağlamsız söz edilirken tırnak kullanılabilir (“kırmak” sözcüğü aşağıdakilerin hangisinde…).
- `QuestionMarkupSpan` kayıtları çizgilerden otomatik üretilir (düz metne göre UTF-16 konum).

## Figür

- Figür, soru gerçekten görsele dayanıyorsa kullanılır. Kök “tablo, grafik, şekil, harita” diyorsa figür vardır; figür yoksa bu ifadeler kullanılmaz.
- Kökte `{{fig:kod}}` atfı figürün yerini gösterir; kod yalnız harf, rakam, `_` ve `-` içerir (ör. `fig1`).
- **Figürü motor çizer (1 Kasım 2026 kararı).** Figür motorun görsel şemasıyla (`src/Components/Visuals/VisualSchema.ts`) yazılır; motor açık ve koyu tema için SVG üretir ve bu çizim soruya hazır resim olarak bağlanır. C# çizicisine yeni tür eklenmez. `Image` (0) türü kullanılmaz.
- **Figürden taviz verilmez.** Soru çizime dayanıyorsa figürle yazılır. Gereken öğe motorda yoksa soru sözele çevrilmez: kayda `motorIstegi` yazılır, öğe merkez oturuma (Sınavika Video Engine kurulumu) iletilir ve [CalismaPlani.md](CalismaPlani.md#açık-kalanlar)'daki açık listeye girer; soru o öğe gelene kadar canlıya yazılmaz.
- Ölçekli geometride sayısal etiketler çizimle uyuşur (uzunluk ±%5, açı ±2°); ÖSYM tarzı ölçeksiz şekilde `"toScale": false`.
- “Taralı” deniyorsa figürde taralı bölge vardır (Venn `shaded`, geometri `shaded: true`).
- Metindeki görsel atıfları `FigureCheck` ile API'nin kayıt denetiminden geçer. Bir dersin bütün figürleri motorun açık ve koyu tema SVG'leriyle toplu görüntüde gözle kontrol edilir: yazı kesilmez, telefon genişliğinde (≈360 px) okunur.
- Eski figür revize soruya uymuyorsa silinir; uyuyorsa düzeltilip korunur.

## Çözüm

- Yapı: `short_explanation`, `full_reasoning`, `why_correct`, `wrong_option_analysis` (her şık), `prerequisite_knowledge`, `common_misconceptions`.
- Doğru şıkkın `wrong_option_analysis` değeri `—`. Düz metin API'nin `BuildPersistedSolution` kuralıyla üretilir.
- Her yanlış şık, o şıkkın içeriğiyle neden yanlış olduğunu açıklar. Matematik ve fen sorularında çözüm adım adım hesaplanır ve sonuç şıkla karşılaştırılır.

## Kaynak kullanımı

- **İzin:** EgitimVerileri'ndeki sorular için örnek ve referans alma izni var; birebir kopyalanmaz. Her soru, örnekler üzerinde düşünülerek yeniden türetilir.
- Her konuya başlamadan önce `Curriculum/Quizzes/Tools/show_sources.py <ders> <konu>` ile `EgitimVerileri/<SINAV>/<Kategori>/Sorular/<DERS>/<KONU>.jsonl` incelenir. Sıra: **test kitapları** (soru bankası, dörtdörtlük, tarama testi, MEB beceri ve kelime kitapları, kamp kitabı) önce; **ÖSYM çıkmış soruları** kök ve şık yapısı için. Soru tipi, kök kalıbı, şık yapısı ve zorluk bunlardan alınır.
- **Quiz için referans alınmaz:** deneme kitapları (başlığında “deneme” geçenler) ve sistemin kendi ürettiği kitapçıklar (“… Kitapçık”, cevap kaynağı `sinavika-bank`). Araç bunları göstermez.
- Bilgi içeren derslerde (tarih, coğrafya, fen, din, felsefe…) olgular `KonuAnlatimi/<DERS>/<KONU>.json` anlatım ve MEB bilgi paketlerinden doğrulanır (`--anlatim`).
- Kaynak cümleleri aynen kopyalanmaz; yeni parça ve şıklar yazılır. Kaynağın OCR bozuklukları ve kayıp altı çizgileri revizyona taşınmaz; cevabı olmayan ya da şüpheli kaynak sorusu model alınmaz.
- Revizyon kaydının `kaynak` alanı model alınan kaynak soruların kimliklerini taşır (ör. `["yks-tyt-sr-karma-cikmis-2018-2026-0-016"]`).

## Yazma

- Canlıya yazım Claude içerik API'siyle yapılır (2 Kasım 2026'dan beri; sinavika `docs/claude/Claude-Icerik-API.md`), doğrudan SQL ile değil:
  1. Hazır resimler önce yüklenir (`figures/stills`); adres içeriğin SHA-256 özetidir.
  2. Sorular canlıdan dışa aktarılır (`questions/export`). Bu eski hâl geri alma verisidir ve saklanır.
  3. Revizyon önce `dryRun` ile gönderilir; kök özeti (`expectedStemHash`) değişmişse ya da resim düşecekse API reddeder.
  4. Sonra tek işlemde yazılır ve canlıdan geri okunarak doğrulanır.
- Geri alma: dışa aktarılan eski hâl, yeni kök özetiyle revizyon olarak geri gönderilir.
- Canlıya yazma her parti (ders ya da konu) için ayrı onayla yapılır.
