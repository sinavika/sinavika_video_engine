# Revizyon yazım kuralları (pilot: TYT Türkçe, Sözcükte Anlam)

Bu kurallar her revize soruda uygulanır. `araclar/revizyon_denetle.py` bunların otomatik denetlenebilenlerini kontrol eder.

## Kayıt

- Soru yerinde güncellenir: soru, şık ve çözüm kimlikleri değişmez.
- **Doğru şıkkın harfi korunur.** Deneme kitapçıklarının cevap dağılımı ve quiz istatistikleri bozulmasın diye doğru cevap aynı harfe yerleştirilir.
- Kopyalar (aynı sorunun Ağustos/Eylül/Ekim kitapçıklarındaki eşleri) aynı içeriği alır.
- Quiz zorluğu (Kolay/Orta/Zor) ve denemenin hedef zorluğu korunur.
- Her soru bir alt konuya (LessonMikro) bağlanır.
- Soru bu konuda kalır. Deneme slotu ve quiz bu konu için planlandığından, başka konudan gelmiş bir soru (yazım, paragraf, cümle bağlantısı…) taşınmaz; aynı yere bu konuya uygun yeni bir soru yazılır. Böylece kitapçık ve quiz dağılımı bozulmaz.

## Kök ve şıklar

- Beş şık (A–E). Şıklar birbirinden farklı, biçimce paralel ve yaklaşık eşit uzunlukta olur. Tek bir doğru cevap vardır.
- Şık metni harfle başlamaz ("A)" yazılmaz).
- Öncüller ayrı satırda yazılır: `I. …`, `II. …`. Parça ile soru cümlesi arasında boş satır bırakılır.
- Soru cümlesi ÖSYM üslubundadır ("…hangisidir?", "…hangisinde … kullanılmıştır?").
- Türkçe yazım ve noktalama TDK'ye uyar. Kesme işareti `’`.

## Altı çizili sözcük

- Bağlam içindeki hedef sözcük `<u>…</u>` ile çizilir. Çizili sözcük tırnak içine alınmaz.
- Kök ya da şık "altı çizili" diyorsa en az bir `<u>` vardır. `<u>` varsa metin "altı çizili" der.
- "Altı çizili iki sözcük" gibi sayı veriliyorsa çizili sayısı tutar. Tekil/çoğul ("sözcük/sözcükler") doğru seçilir.
- Çizgi sözcüğün tamamını kapsar, sözcük ortasından kesmez. Ek de anlamın parçasıysa çekimli sözcüğün tamamı çizilir (`<u>açıldı</u>`).
- "Koyu yazılmış", "vurgulanan", "işaretli", "eğik" denmez. Uygulama yalnız altı çiziliyi gösterir.
- Olumsuz soru sözcükleri ("değildir", "yoktur") çizilmez.
- Sözcüğün kendisinden (bağlamsız) söz edilirken tırnak kullanılabilir: "“göz” sözcüğü aşağıdakilerin hangisinde…". Bu durumda şıklardaki kullanımlar çizilir.
- Doğrulanmış işaretleme kaydı (`QuestionMarkupSpan`) çizgilerden otomatik üretilir.

## Görsel

- Bu konuda figür kullanılmaz. Kök "tablo, şekil, grafik" gibi görsellere atıf yapmaz.

## Çözüm

- Yapı: `short_explanation`, `full_reasoning`, `why_correct`, `wrong_option_analysis` (a–e), `prerequisite_knowledge`, `common_misconceptions`.
- Doğru şıkkın `wrong_option_analysis` değeri `—` olur. Düz metinde o satır yazılmaz (API'nin kuralı).
- Yanlış şıkların her biri neden yanlış olduğunu o şıkkın içeriğiyle açıklar.
- Düz metin (`ContentText`) API'nin `BuildPersistedSolution` kuralıyla bu yapıdan üretilir.

## Kaynak kullanımı

- `EgitimVerileri/YKS/TYT/Sorular/TRK/SOZCUKTE_ANLAM.jsonl` ve ÖSYM çıkmış soruları soru tipi ve üslup için model alınır. Cümleler aynen kopyalanmaz.
