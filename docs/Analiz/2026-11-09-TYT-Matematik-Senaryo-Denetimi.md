# TYT Matematik kampı senaryo denetimi

9 Kasım 2026. Kapsam: `Curriculum/Scripts/YKS_TYT/MAT/` altındaki 23 senaryonun içeriği (anlatım, kartlar, sorular, çözümler, açılış, özet, kamp görevi, kısa video metni). Sahne, görsel zamanlaması ve duran ekranlar bu denetimin dışında.

Yöntem: her senaryo okunur metne döküldü ve baştan sona okundu; 211 sorunun hepsi yeniden çözüldü; her anlatımdaki "şunu seçen şunu bulur" tuzak açıklamaları hesapla sınandı; kapsam `Desktop/lesson.csv` alt konularıyla, ağırlık ve soru tarzı resmî çıkmış soru listesiyle (`EgitimVerileri/YKS/TYT/CikmisSorular/MAT.jsonl`, 2018–2026, 269 soru) karşılaştırıldı.

## Kısa sonuç

Çözümlerin matematiği sağlam: 211 sorunun hepsinin cevabı doğru. Sorun derinlikte ve denge'de. Senaryolar her konuyu aynı kalıpla geçiyor: kural kartı, hemen ardından tek adımlı bir ders kitabı sorusu. ÖSYM'nin en çok sorduğu yerler (problemler, grafik okuma, rutin olmayan sorular) en ince işlenen yerler. Bunun yanında 6 içerik hatası, birkaç dil hatası ve ÖSYM metnine fazla yakın 5 yer var.

## 1. Ağırlık: kamp ile ÖSYM aynı yeri tartmıyor

Her konu yaklaşık 10 dakikalık tek ders. ÖSYM'nin dağılımı ise çok dengesiz:

| | ÖSYM 2018–2026 | Kamptaki soru |
| --- | --- | --- |
| Problemler (18 alt konu) | **112 soru (%42)** | 1 ders, 13 soru |
| EBOB-EKOK, Çarpanlara Ayırma, İşlem, Modüler, Polinom, İkinci Derece (6 ders) | **9 soru** toplam | 6 ders, **58 soru** |

- Problemlerin içinde rutin olmayan problemler (30) ile işlem ve denklem kurma (31), tüm TYT matematiğinin %23'ü. ÖSYM 2025'te bu iki türden 8, 2026'da 8 soru sordu (yılda ~30 sorunun 8'i). Kampta bu iki türe ayrılmış 4 soru var.
- Problemler dersinin hook'u bunu kendisi söylüyor ("her beş sorudan ikisi problem"), ama ders 18 alt konuyu çoğunda tek soruyla geçiyor. Faiz ve havuz için yalnız bir kural satırı var, sorusu yok. Hareket problemlerinde yalnız karşılaşma var; yakalama, dairesel pist, konum-zaman grafiği yok.
- İkinci Dereceden Denklemler'den 9 yılda hiç TYT sorusu yok, Modüler ve Polinom'dan birer soru var; üçüne 31 soru ayrılmış.

Not: listedeki 269 eşlemenin 58'i "inceleme bekliyor" işaretli. Konu sayıları bu yüzden yaklaşık, ama Problemler'in payı değişmez (112'nin yalnız 10'u işaretli).

## 2. Soru tarzı: ÖSYM'nin soru tipine denk soru çok az

| | Kamp (211 soru) | ÖSYM 2022–2026 (144 soru) |
| --- | --- | --- |
| Soru kökünün ortalama uzunluğu | 17 sözcük | 61 sözcük |
| 40 sözcük ve üstü kök | 4 soru | 119 soru |

ÖSYM soruları çok koşullu, okuma ağırlıklı ve yeni bir durum kuruyor (Efe'nin atış oranları, sokaktaki 9 ev, haftalık ders programı, karışan roka-tere fiyatı, "yangen" tanımı). Kamptakiler çoğunlukla tek kurala tek soru. En belirgin açıklar:

- **Fonksiyonlar:** ÖSYM'nin 11 sorusunun 8'i grafik okuma (f, g, h grafikleri). Hook da bunu söylüyor. Kampta grafik okuma sorusu yok; "Grafik" bölümündeki tek soru grafiksiz (doğrunun eksenlerle yaptığı üçgenin alanı).
- **Grafik ve tablo:** Problemler'in grafik sorusu ve Veri-İstatistik'in daire grafiği sorusu grafiksiz, yazıyla veriliyor ("dilim 72 derece"). ÖSYM'nin 5 grafik yorumlama sorusu çok adımlı (2018 iki grafik, 2022 otobüs durakları, 2023 dolap, 2024 fabrikalar, 2026 sporcu).
- **Eşit bölmeli gösterge okuma** (2018 şişe ölçeği, 2019 radyo frekansı, 2024 termometre) hiçbir derste yok.
- **İşlem:** ÖSYM'nin 3 sorusunun üçü de şekilli gösterim (çokgen içine sayı, kutucuk köşeleri). Kampın 9 sorusunun 6'sı birim/ters/değişme/kapalılık (listede hiç yok); şekilli gösterim yalnız sözle, şekilsiz.
- **Tek-çift:** ÖSYM 2020–2025 her yıl sordu, hepsinde belirsizlik ya da bağlam var. Kampta tek soru var, o da harflerin hepsi baştan belli olan en kolay biçim; dersteki "bulamadığın harf için iki durumu dene" kuralı hiç kullanılmıyor.

Bu açığın en iyi kapatıldığı yerler de var: Mutlak Değer (şeker kavanozu, koşu), Mantık (internet alışverişi, sağlık kartı), Olasılık (defolu ürün, hediye), Veri-İstatistik'in ortanca soruları, Kümeler'in sayarak toplama sorusu. Bunlar diğer derslere örnek olabilir.

## 3. Öğretim sırası: örnek yok, kural anlamdan önce

Sahibin 5 Kasım kuralı (tanım → anlam → formül → çözümlü örnek → soru) senaryolarda büyük ölçüde yok:

- 103 bölümün yalnız 3'ünde ilk sorudan önce çözümlü örnek kartı var (Sayı Basamakları 2, Bölme 1). Kalan 21 derste hiç örnek kartı yok.
- Hiçbir derste tanım (kavram) kartı yok; tanımlar kural listelerinin içinde.
- Formül çoğu zaman nedeninden önce geliyor: terim sayısındaki "+1", AB + BA = 11(A + B) (nedeni sonraki tahmin kartında), EBOB-EKOK'ta "ortak taban küçük üs" (ortak bölen ne demek gösterilmeden), üs kuralları.
- Anlatım sık sık kart metnini okuyor: "Dört kural. Birincisi… İkincisi…".
- Bazı kurallar soru almadan bölümü kapatıyor: faktöriyel (Temel Kavramlar), işlem tablosu (İşlem), doğrusal fonksiyon hikâyeleri ve örten fonksiyon (Fonksiyonlar), ax² + bx + c ile a ≠ 1 (Çarpanlara Ayırma).
- Köklü Sayılar'daki köklü denklem, bir sonraki derste öğretilecek çarpanlara ayırmayla çözülüyor.

İyi örnekler: Mutlak Değer ("mutlak değer bir uzaklıktır"), Kümeler (alt küme sayısı "her eleman var ya da yok"), Çarpanlara Ayırma (alan modeli), Mantık ("p ise q bir sözdür").

## 4. İçerik hataları

**Durum (9 Kasım 2026): bu bölümdeki hataların hepsi düzeltildi** (aşağıda "Yapılan düzeltmeler"). Değişen 10 senaryo şema ve kural denetiminden sorunsuz geçti; duran ekran 0, render kapısı açık, YouTube süreleri 775–889 sn; `tests/Courses` ve `StillScreenGate` testleri yeşil. `curriculum check` başka bir oturumun bozuk `public/Media/Credits.json` kaydı yüzünden hâlâ çöküyor; denetim aynı fonksiyonlarla doğrudan yapıldı.

| Ders | Yer | Hata | Doğrusu |
| --- | --- | --- | --- |
| Temel Kavramlar | s6-c1 (görsel ve anlatım) | İşlem sırası "önce üslü ifadeler, sonra parantez" | Parantez → üs → çarpma-bölme → toplama-çıkarma (Rasyonel Sayılar'ın özeti de böyle diyor) |
| Temel Kavramlar | s1-c3, 1. adım | Anlatım "A, D ve E gidiyor" diyor; A doğru cevap | Elenenler C, D ve E |
| Oran Orantı | s2-c3, son adım | "Doğru orantı kuran 45'i bulur" | 3, 4, 6 ile doğru orantıda en büyük pay ≈ 41,5; 45 çıkmaz |
| Denklem Çözme | s2-c2, son adım | "Eksiyi yalnız ilk terime dağıtan x'i −2 bulur" | O hata x = 14 verir |
| Polinomlar | s3-c2 (tahmin) | "13'ü seçen x yerine −2 yazmıştır" | P(−2) de 5; tahmin, öğretmek istediği tuzağı ölçmüyor, polinom değişmeli |
| Basit Eşitsizlikler | s1-c2 (hata kartı) | "Yanlış" tarafı "(2,7] aralığında 5 tam sayı ve 2 de dahil": 5 sayısı doğru, 2 dahil olsa 6 olurdu | Yanlışı tek bir hataya indir; yarı açık aralık için b − a kuralını ekle |

Dil ve anlatım hataları:

- Rasyonel Sayılar s5-c4: "dörtün" → "dördün". Açılışta 0,9̄ "sıfır virgül dokuz dokuz" diye okunuyor → "sıfır virgül dokuz devirli".
- Çarpanlara Ayırma s2-c1: "2'yi karesini almış" → "2'nin karesini almış". s4-c3 kökü eksik: "çarpanlarından biri değildir?" → "çarpanlarından hangisi değildir?". s2-c3'te "Payda iki terim var" (payında) hemen ardından "Payda x kare eksi 9" (paydada): dinleyen pay ile paydayı karıştırır.
- Oran Orantı s2-c5: "Yetmiş beşi aramayan, artışı değil yeni hızı bulmuş olabilir" anlamsız (75 şıklarda da yok).
- İşlem: s1-c3 "Sırayı karıştırıp iki tarafı aynı açan bir şey bulamaz", s3-c2 "Tersi sıfıra eşitleyen eksi 3, toplamadaki gibi eksi 7 düşünen başka bir sonuç bulur" bulanık; s1-c4 ve s3-c2'deki tuzak değerleri (19, −3) şıklarda yok. s4-c2 hata kartının başlığı ("a'ya bağlı olamaz") içeriğiyle ("iki taraftan kontrol et") uyuşmuyor.
- Mutlak Değer s4-c1: denklem hata kartı "eşitsizlikler" bölümünde; "yanlış" tarafı ("karesini almak zorunludur") kimsenin yapmadığı yapay bir hata.
- Polinomlar özeti, derste hiç anlatılmayan iki bilgi veriyor (sıfır polinomun derecesi, sabit polinomun derecesi).

### Yapılan düzeltmeler (9 Kasım 2026)

| Ders | Değişiklik |
| --- | --- |
| Temel Kavramlar | İşlem sırası parantez → üs → çarpma-bölme → toplama-çıkarma (görsel, vuruş, s6-c2 anlatımı); s1-c3 "C, D ve E gidiyor"; tek-çift iddiası "2020–2025 arasında her yıl" (hook, s3-c3) |
| Sayı Basamakları | Hook: "her yıl" → "sık sık" yeni sayı türü |
| Oran Orantı | s2-c3 tuzağı: soruyu "en büyük kardeş" diye okuyan 20'yi seçer; s2-c5 tuzağı: hız ile süreyi doğru orantılı sanan 48 bulur, 12'yi işaretler |
| Denklem Çözme | s2-c2: E şıkkı 10 → 14, tuzak açıklaması "x − 2 = 12, x = 14" |
| Polinomlar | s3-c2 tahmini yeni polinomla: P(x) = x³ − 2x + 1; şıklar 5 / −3 (x yerine −2 yazan) / 1 (sabit terimi kalan sanan). Sabit ve sıfır polinomunun derecesi s1-c1 kural kartına eklendi; özette "belirsiz" → "tanımsız" |
| Basit Eşitsizlikler | s1-c2 hata kartı tek hataya indi ("2'den 7'ye 6 tam sayı"); açık, yarı açık, kapalı aralık kuralları kartta ve özette |
| Rasyonel Sayılar | "dördün"; açılışta "sıfır virgül dokuz devirli" |
| Çarpanlara Ayırma | "2'nin karesini"; "Payın iki terimi var"; s4-c3 kökü "çarpanlarından hangisi değildir?"; s4-c1'deki 34 sözcüklük cümle ikiye bölündü |
| İşlem | s1-c3 tuzağı: iki tarafta da a ile b'yi karıştıran 5'i bulur (E); s1-c4: A şıkkı 17 → 19 (sıra hatası); s3-c2 tuzağı: birim elemanla tersi karıştıran 4'ü seçer; s4-c2 başlığı "Birimi iki taraftan kontrol et" |
| Mutlak Değer | Hata kartı gerçek bir hatayla yeniden yazıldı ("içleri eşitleyip çözüm yok demek"; iki durum ve eşit uzaklık) ve denklemler bölümüne taşındı: s4-c1 → s3-c3 (s3-c3 ve s3-c4 birer kaydı, S4 kartları birer öne geldi) |

Works ile ilişkisi: TYT'de uygulamaya giden ders, senaryodan ayrı yazılmış yazılı derstir (`Curriculum/WorksWritten`); senaryodaki değişiklik oraya kendiliğinden geçmez ve geçmesi de gerekmez. Works oturumu bu hataların çoğunu yazılı derslerde zaten kendisi düzeltmiş (her dosyanın `written.fixes` listesi: işlem önceliği, Polinom −2/13, Oran 45, Denklem −2, Eşitsizlik kartı, İşlem cümleleri, Çarpanlar kökü). Yazılı derslerde kalan üç küçük fark: Temel Kavramlar ve Sayı Basamakları hook başlıklarındaki "her yıl" abartısı, Mutlak Değer'deki yapay "karesini almak zorunludur" kartı. Yazılı dersi olmayan kategorilerde (AYT, KPSS Önlisans/Ortaöğretim) Works doğrudan senaryodan kurulur; orada senaryo değişikliği `curriculum works` ve aktarım ister.

## 5. Açılışlar

7 derste açılış anlatımı hook başlığını okuyup hemen başka bir soruya geçiyor; ilk soru cevapsız kalıyor:

- Bölme ("Bir sayıyı bölmeden kalanını bulabilir misin?" iki kez arka arkaya)
- Denklem Çözme (çay-simit + "Bu kesirli denklemi sağlayan x kaç?")
- Basit Eşitsizlikler ("Ya taraf tarafa çıkarırsan?" + "x karenin aralığı ne?")
- Kümeler, Olasılık, Oran Orantı (iki ayrı problem)

İkinci Dereceden Denklemler'in açılışı "öğrenciler işaretleri karıştırır" diyor, ama açılış sorusunun cevabı (köklerin farkının mutlak değeri) işaret karışsa da değişmiyor.

Not: CampLesson açılış varken hook'un uzun anlatımını okumuyor, yerine `promise` geliyor. Hook metni yine de Works'e gidiyor, bu yüzden oradaki iddialar da önemli.

## 6. ÖSYM metnine fazla yakın yerler (izin kuralı: örnek alınır, birebir alınmaz)

- Kümeler hook'u: ÖSYM 2020 sorusunu sayılarıyla birlikte aynen anlatıyor (100 fotoğraf, ya ikisi ya üçü, her kardeş 83).
- Sayı Basamakları s4-c2: "sıralı sayı" tanımı ve örneği (132) ÖSYM 2022 ile aynı.
- Fonksiyonlar s2-c3: fonksiyonlar ÖSYM 2023 ile aynı (a pozitif, f(x) = x + a, g(x) = ax + 1); yalnız 2 → 3 yapılmış.
- Polinomlar s2-c2: kökün tanım cümlesi ÖSYM 2018'den birebir, yapı aynı (R(x) = P(P(x)), I-II-III).
- Bölme s5-c4: kök, ÖSYM 2026 kökünün çok yakın bir açıklaması (n yerine 7).

## 7. Biçim ve tekrar

- **Cevap şıkkı dağılımı:** A 29, B 60, C 75, D 38, **E 9** (211 soru). E neredeyse hiç cevap değil; deneme çözen öğrenci bunu fark eder. Mevcut `answerPatternIssues` tek ders içindeki kalıplara bakıyor, kamp geneli dağılımı yakalamıyor.
- **Sayısal şıklar sırasız:** 15 soru (örnek: 64, 73, 82, 91, 37). ÖSYM sayısal şıkları küçükten büyüğe dizer.
- **Kalıp cümleler:** "Şimdi sıra sende. Bir tahmin yap." 24 tahmin kartının hepsinde aynı (yeni "Sıra sende" kartıyla da karışıyor); "Hadi toparlayalım" 23 derste; kamp görevi 22 derste aynı cümleyle başlıyor ve aynı cümleyle bitiyor.
- **Kısa video kancaları:** 23 kancanın 17'si "X'de üç tuzak" ya da "üç kısa yol", 2'si "Üç soruda …". Reels kuralı aynı açılışın tekrarına izin vermiyor.
- **Örtüşme:** Bölme S5 (döngü: gün, lamba renkleri, "kalan 0 → son eleman") ile Modüler S4 (gün, karo renkleri, harf dizisi) neredeyse aynı içerik. "Bugün salı, 100 gün sonra?" hem Bölme'de soru, hem Bölme'nin kamp görevi, hem Modüler'in hook'u.
- **Tekrar eden soru hakkı:** Mutlak Değer'de tahmin kartı (|x + 4| = −2) ile hemen ardından gelen soru (|x + 2| = −3) aynı fikir.

## 8. ÖSYM iddialarının doğruluğu

Anlatımlardaki 50 "ÖSYM şu yıl şunu sordu" cümlesinin hepsi listede o yıl o konudan bir soruyla eşleşiyor; örnek aldıkları kalıplar da doğru. İki abartı vardı (9 Kasım'da düzeltildi):

- Temel Kavramlar: "ÖSYM 2020'den bu yana her yıl en az bir tek-çift sorusu sordu" → 2020–2025 doğru, 2026'da yok.
- Sayı Basamakları: "ÖSYM her yıl yeni bir sayı türü tanımlıyor" → 9 yılın 4'ünde (2019, 2021, 2022, 2024).

## 9. Ders ders özet

| # | Ders | ÖSYM 2018–26 | Kamp sorusu | Hata | Ana bulgu |
| --- | --- | --- | --- | --- | --- |
| 1 | Temel Kavramlar | 16 | 6 | 2 | İşlem önceliği yanlış; tek-çift tek ve kolay soru; faktöriyel sorusuz |
| 2 | Sayı Basamakları | 14 | 8 | – | 2 örnek kartı (iyi); sıralı sayı ÖSYM ile aynı; BASAMAK_06 anlatılmıyor |
| 3 | Bölme ve Bölünebilme | 9 | 9 | – | Modüler ile örtüşme; "kalan 0" tuzağı sorusuz |
| 4 | EBOB – EKOK | 2 | 9 | – | Kural anlamdan önce; ÖSYM'nin 2 sorusu bağlamlı, kampınki klasik |
| 5 | Rasyonel Sayılar | 8 | 8 | dil | Hook "günlük hayatta sorulur" diyor, 8 sorunun 7'si saf işlem; gösterge okuma yok |
| 6 | Basit Eşitsizlikler | 7 | 8 | 1 | Tutarsız hata kartı; iki bilinmeyenli eşitsizlik tek cümle |
| 7 | Mutlak Değer | 8 | 8 | – | En iyi derslerden; tekrar eden soru hakkı |
| 8 | Üslü Sayılar | 7 | 9 | – | Kurallar nedensiz; bilimsel gösterim anlatılmıyor |
| 9 | Köklü Sayılar | 8 | 8 | – | Öğretilmemiş araçla (çarpanlara ayırma) çözüm |
| 10 | Çarpanlara Ayırma | 2 | 9 | dil | Alan modeli iyi; a ≠ 1 sorusuz |
| 11 | Oran Orantı | 6 | 10 | 1 | 5 bağlamlı soru (iyi); limonata üç kez |
| 12 | Denklem Çözme | 4 | 10 | 1 | Çözüm kümesinin üç durumu iyi |
| 13 | Problemler | 112 | 13 | – | En büyük açık: tek ders, rutin olmayan ve denklem kurma 4 soru |
| 14 | Kümeler | 11 | 9 | – | Venn sorusu şekilsiz; hook ÖSYM ile aynı |
| 15 | Mantık | 6 | 7 | – | İyi; iç içe koşullu önerme (2025) yok |
| 16 | İşlem | 3 | 9 | dil | ÖSYM şekilli gösterim soruyor, kamp birim/ters |
| 17 | Modüler Aritmetik | 1 | 10 | – | Bölme ile örtüşme; ağırlık çok yüksek |
| 18 | Fonksiyonlar | 11 | 8 | – | Grafik okuma sorusu yok (ÖSYM 8/11); s2-c3 ÖSYM ile aynı |
| 19 | Polinomlar | 1 | 11 | 1 | Tahmin kartı tuzağı ölçmüyor |
| 20 | İkinci Dereceden Denklemler | 0 | 10 | – | Açılış tuzağı ölçmüyor |
| 21 | Permütasyon ve Kombinasyon | 10 | 11 | – | İyi; rakamlarla sayı oluşturma yok |
| 22 | Olasılık | 9 | 10 | – | İyi; şekil üzerinden sayma (şifre ızgarası, ocak) yok |
| 23 | Veri – İstatistik | 14 | 11 | – | Ortanca ağırlığı doğru; grafik soruları grafiksiz |

## 10. Önerilen işler (karar sahibin)

1. **Kesin hatalar** (bölüm 4): 6 içerik hatası ve dil düzeltmeleri. **Yapıldı, 9 Kasım.**
2. **ÖSYM'ye yakın metinler** (bölüm 6): 5 yeri özgünleştirmek.
3. **Kamp yapısı:** Problemler'i türlerine göre birkaç derse bölmek (ör. denklem kurma ve sayı-kesir-yaş; yüzde-kâr-zarar-karışım; hareket ve işçi; tablo-grafik; rutin olmayan problemler); az sorulan konuları kısaltmak ya da birleştirmek (Modüler'in döngü kısmı Bölme ile). Kamp numaralarını ve Bölüm 0'ı etkiler.
4. **Çözümlü örnek:** Her bölümde ilk sorudan önce bir örnek kartı; önce sayısal dersler.
5. **ÖSYM tarzı soru katmanı:** grafik okuma (Fonksiyonlar, Veri, Problemler), şekilli gösterim (İşlem), gösterge okuma, rutin olmayan ve çok koşullu sorular; Venn ve grafik sorularına gerçek şekil.
6. **Biçim kuralları:** E şıkkını dengelemek, sayısal şıkları sıralamak; ikisini `curriculum check`e kural olarak eklemek. Açılışlardaki çift soruyu tek soruya indirmek, kalıp cümleleri ve kısa video kancalarını çeşitlendirmek.
