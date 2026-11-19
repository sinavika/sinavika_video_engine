# 13 · İstatistik raporu PDF'i (A4)

Güncelleme: 19 Kasım 2026 (API uygulamasıyla eşlendi) · Çizim: `src/UIUX/Screens/Print/StatsReport.tsx` · PNG: `Desktop\Sinavika-UIUX3\acik\pdf\r-istatistik-*.png` (pano `panolar\50-pdf-istatistik-raporu-pdf.png`) · Testler: `tests/UIUX/PrintReport.test.ts`

> **Karar kutusu**
> - Web İstatistiklerim'deki **PDF olarak al** düğmesi tarayıcının yazdırma penceresini açmaz. API, QuestPDF ile gerçek bir A4 PDF üretir ve web onu indirir.
>   - Kararı sahip verdi; api+web+mobile oturumu 19 Kasım 2026'da aktardı.
>   - Çizim bu belgedir; kod `sinavika/Services/Exports/Pdf/StatisticsReportPdf.cs` dosyasında, Akıllı Özet PDF'lerinin `LensPdfLayout` ve `SinavikaPdfBrand` altyapısıyla yazılır.
> - Turuncu yalnız markadır: logo ve altlıktaki "sinavika.com". Grafiklerde turuncu yoktur. Modül renkleri `src/UIUX/ModuleIdentity.ts` açık temadan alınır.
> - Kâğıt beyazdır; koyu tema yoktur (`koyu/pdf` kopyası açık temanın aynısıdır).
> - Yalnız Manrope 400, 600, 700 ve 800 kullanılır; API bu dört ağırlığı gömer. Yalnız Manrope'ta olan karakterler yazılır.
>   - **↗ ↘ ▲ ▼ Manrope'ta yoktur**; PDF'te boş kutu çıkar. Değişim `+` ve `−` (U+2212) ile yazılır.
>   - `→ – · × % …` Manrope'ta vardır.
> - Sayfa 1 "ne kadar ve nerede çalıştın", sayfa 2 "nasıl gidiyor" sorusunu cevaplar. Rapor iki sayfadır; ikinci sayfanın verisi yoksa tek sayfa olur (§5). API en çok 8 ders verdiği için ikinci sayfa taşmaz.
> - Hiçbir sayı veri dışından gelmez. Çizimdeki ad, tarih ve sayılar örnektir. Hangi alanın neyi doldurduğu §6'da yazar.

## 1. Çizimler

| Kimlik | Sayfa | Ne gösterir |
|---|---|---|
| `r-istatistik-1` | Son 30 gün · 1/2 | Üst bant, dört ölçü, günlük çalışma (modüllere göre yığılı, günlük ortalama çizgisi), modüllere dağılım (halka ve tablo) |
| `r-istatistik-2` | Son 30 gün · 2/2 | Sürekli üst satır, derslere göre tablo, altında TYT net gelişimi ve ÖSYM notu, en verimli saatler |
| `r-istatistik-hafta` | Bu hafta · deneme yok · 1/2 | Dördüncü ölçü **Seri**; yedi sütunun üstünde süre, altında gün adı ve tarih; Denemeler lejantta yok |

Kimlikler `r-<belge>-<sayfa>` biçimindedir (rapor). Çizim türü `print` olup A4 sayfayı PDF noktası (pt) ile çizer. Kodlama oranı 1:1'dir: çizimdeki 1 birim QuestPDF'te 1 pt'dir.

## 2. Sayfa, yazı ve renk

### 2.1 Sayfa

- A4, 595 × 842 pt. Kenar boşlukları `LensPdfLayout.ConfigurePage` ile aynıdır: yatay 40, dikey 32. İçerik genişliği 515 pt.
- Bölümler arası boşluk 18 pt (`col.Spacing(18)`).
- **Altlık** her sayfada vardır (`LensPdfLayout.Footer`):
  - solda "sinavika.com" 8 pt 600 turuncu `#EA580C`, ardından " · İstatistiklerim" 8 pt `Muted`;
  - sağda "1 / 2" 8 pt `Muted` (`CurrentPageNumber` / `TotalPages`).
- **Üst bant** yalnız birinci sayfadadır (§3.1). İkinci sayfadan itibaren yalnız sürekli üst satır vardır (§4.1; QuestPDF `page.Header().SkipOnce()`).

### 2.2 Yazı (Manrope, pt)

| Rol | Boyut | Ağırlık | Renk | Kullanım |
|---|---|---|---|---|
| title | 22 | 800, harf aralığı −0,02 em | Charcoal | "İstatistiklerim" |
| section | 12 | 800 | Charcoal | Bölüm başlıkları |
| value | 18 | 800, tabular | Charcoal | Ölçü kartı değeri |
| trendValue | 16 | 800, tabular | Charcoal | Net gelişimi değeri |
| body / cell | 9 | 400; ders adı 700 | Text | Satırlar, cümleler |
| small | 8 | 400 | Muted | Yan yazılar, lejant, altlık |
| label | 7 | 700, BÜYÜK HARF, harf aralığı 0,08 em | Muted | Kart etiketleri, tablo başlığı, "İSTATİSTİK RAPORU" |
| change | 7,5 | 700, tabular | yeşil / kırmızı | Değişim çipi |

- Hiçbir yazı 7 pt'nin altına inmez (test).
- Büyük harf `LensPdfLayout.Upper` ile dile göre yapılır: Türkçede "İSTATİSTİK", İngilizcede "STATISTICS".
- Sayılar tabular yazılır, böylece sütunlar hizalı kalır.

### 2.3 Renkler

| Ad | Değer | Kaynak / kullanım |
|---|---|---|
| Charcoal | `#0F172A` | `SinavikaPdfBrand.Charcoal`: başlık, değer, dönem çipinin zemini, ortalama çizgisi |
| Text | `#334155` | `SinavikaPdfBrand.Text`: gövde |
| Muted | `#64748B` | `SinavikaPdfBrand.Muted`: etiket, yan yazı, eksen; beyazda 4,76:1 |
| Line | `#E5E7EB` | `SinavikaPdfBrand.Line`: kart kenarı, satır çizgisi, eksen |
| Canvas | `#F8FAFC` | `SinavikaPdfBrand.Canvas`: tablo başlık satırı |
| Track | `#F1F5F9` | Yeni: çubuk izi, boş ısı hücresi |
| Orange | `#EA580C` | Yalnız logo ve "sinavika.com" (test: sayfa başına tam iki yer) |
| Artış | yazı `#047857`, zemin `#DCFCE7` | `successInk` / `successSoft` |
| Azalış | yazı `#B91C1C`, zemin `#FEE2E2` | `errorInk` / `errorSoft` |
| Doğru oranı çubuğu | ≥ %50 `#059669`, < %50 `#D97706` | Web `w-istatistik` ders tablosuyla aynı kural |

Modül renkleri MODULE_ORDER sırasıyla verilir (sahip kararı, 18 Kasım: grafik ve halkada sıra Ders Planı · Dersler · Testler · Denemeler · Bilgi Kartları · Akıllı Özet).

| API anahtarı | Ad (TR / EN) | Renk | Modül |
|---|---|---|---|
| `focus` | Odak / Focus | `#0D9488` | Ders Planı (odak sayacı Ders Planı'nın ekranıdır) |
| `lesson` | Dersler / Lessons | `#0284C7` | Dersler |
| `quiz` | Testler / Quizzes | `#4F46E5` | Testler |
| `exam` | Denemeler / Practice exams | `#4D7C0F` | Denemeler (zeytin) |
| `flashcard` | Bilgi Kartları / Flashcards | `#DB2777` | Bilgi Kartları |

- Akıllı Özet (`#7C3AED`) bugün DTO'da süre olarak yoktur; bu yüzden çizimde de yoktur. API ileride `LensSeconds` eklerse Bilgi Kartları'ndan sonra mor olarak gelir.
- SinoAI'nin rengi yoktur ve rapora girmez.

## 3. Sayfa 1

### 3.1 Üst bant

Yükseklik yaklaşık 100 pt; altında 1 pt `Line` çizgisi ve 14 pt iç boşluk vardır.

- **Satır 1:**
  - solda turuncu yatay logo, 20 pt yüksek (`SinavikaPdfBrand.Logo`, `FitHeight`);
  - sağda "İSTATİSTİK RAPORU" / "STATISTICS REPORT" (label).
- **Satır 2 (12 pt aşağıda):**
  - **Sol:** "İstatistiklerim" / "My statistics" (title). Altında 6 pt boşlukla dönem çipi ve tarih aralığı:
    - dönem çipi: Charcoal zemin, köşe 4, iç boşluk 2 × 7, beyaz label. Değerler "BU HAFTA", "SON 30 GÜN", "TÜMÜ"; EN "THIS WEEK", "LAST 30 DAYS", "ALL".
    - tarih aralığı 9 pt Text: "21 Ekim – 19 Kasım 2026" / "October 21 – November 19, 2026". Aynı aydaysa kısaltılır: "13 – 19 Kasım 2026" / "November 13 – 19, 2026".
  - **Sağ (alta hizalı):** öğrencinin adı ve sınavı ("Ayşe Yılmaz · TYT", 9 pt 700 Charcoal). Sınav, profildeki hedef değil `ExamTrends[0].ExamTypeName`'dir; deneme yoksa yalnız ad yazılır. Altında "Oluşturulma 19 Kasım 2026" / "Created November 19, 2026" (8 pt Muted).

**Dönem adları web sayfasıyla aynıdır** (`w-istatistik` segmenti: Bu hafta · Son 30 gün · Tümü).
- API'nin `month` dönemi bir takvim ayı değildir; **bugün dahil son 30 gündür** (`StatisticPeriodRange`). Bu yüzden ad "Bu ay" değil, "Son 30 gün"dür.
- `week` dönemi bugün dahil son 7 gündür; adı "Bu hafta"dır.

**`ToDate` hariçtir** (yarının 00:00'ı). Basılan son gün `ToDate.AddDays(-1)`'dir; yoksa rapor yarının tarihini yazar.

### 3.2 Dört ölçü

Dört eşit kart yan yana, aralarında 8 pt. Kartın kenarı 0,75 pt `Line`, köşe 8, iç boşluk 11 × 10, yükseklik 76 pt; zemin beyaz. İçerik üstten alta:
1. etiket (label);
2. değer (value);
3. değişim satırı: çip ve yanında "neye göre" (7 pt Muted), ya da yalnız bir not satırı (7,5 pt Muted).

| # | Etiket | Değer | Değişim satırı |
|---|---|---|---|
| 1 | Çalışma süresi / Study time | `StudyTime.TotalSeconds` → "39 sa 10 dk" | `ChangePercent` ≠ 0: "+%22" ya da "−%9", ardından "önceki 30 güne göre" / "önceki 7 güne göre". `all` döneminde ve 0'da çip yok, satır boş kalır |
| 2 | Çözülen soru / Questions solved | `Questions.SolvedCount` ("742"; TR binlik nokta) | Not: "test, ders ve deneme soruları" / "questions across all modules" (API'nin adlandırma testi metinde "quiz" sözcüğünü yasaklar) |
| 3 | Doğru oranı / Accuracy | `Questions.SuccessPercent` → "%62"; boşsa "—" | `SuccessPercent − PreviousSuccessPercent` ≠ 0: "+6 puan" / "+6 pts" ve "önceki … güne göre" |
| 4a | "{ExamTypeName} net" ("TYT net") | `ExamTrends[0].LastNet` → "84,25" (iki ondalık) | `AttemptCount > 1` ve `NetChange` ≠ 0: "+12,50" ve "ilk denemeye göre" |
| 4b | deneme yoksa: Seri / Streak | `Streak.CurrentDays` → "5 gün" / "5 days" | Not: "en uzun serin {LongestDays} gün" / "your longest: {n} days" |

- Çip: yazı 7,5 pt 700, iç boşluk 1,5 × 5, köşe 4. Artış yeşil, azalış kırmızı; renkler §2.3.
- Kartların yüksekliği sabittir. Çip olmayan kart da aynı yüksekliktedir (sahip kuralı: eşit yükseklikte kartlar).

### 3.3 Günlük çalışma

- **Başlık satırı:**
  - solda "Günlük çalışma" (`ChartBucket = day`) ya da "Haftalık çalışma" (`week`);
  - sağda "modüllere göre" (small).
- **Lejant (10 pt aşağıda):**
  - yalnız dönemde süresi olan modüller, MODULE_ORDER sırasıyla;
  - kare 8 × 8 (köşe 2), 5 pt boşluk, ad 8 pt Text; öğeler arası 14 pt;
  - sağa yaslı "- - - günlük ortalama **1 sa 18 dk**" (14 pt kesikli Charcoal çizgi; yalnız `day` grafiğinde, `DailyAverageSeconds`).

**Grafik.** SVG olarak çizilir (QuestPDF `.Svg(string)`); eksenli yığılı sütun kutularla temiz kurulmaz.
- **Çizgiler QuestPDF'tedir, SVG'de değil:** eksen ızgarası, sıfır çizgisi, ortalama çizgisi ve net grafiğinin tabanı `LineHorizontal` ve `LineDashPattern` ile çizilir. SVG `<line>` öğesinin stroke rengi QuestPDF'te uygulanmıyor, açık gri çizgiler siyah çıkıyordu. Sütunlar, halka ve net çizgisi SVG'de kalır. Genişlik 515 pt; çizim alanı 150 pt yüksek, altında 26 pt etiket şeridi vardır.
- **Y ekseni** solda 26 pt:
  - adım 15 dk, 30 dk, 1 sa, 2 sa, 3 sa, 5 sa, 10 sa ya da 20 sa olabilir; en uzun sütunu en çok 3,2 çizgide kapsayan ilk adım seçilir;
  - çizgi sayısı tavana yuvarlanır;
  - etiketler "1 sa", "2 sa" (7 pt Muted, sağa yaslı, eksenden 6 pt);
  - sıfır çizgisi düz 0,75 pt `Line`, diğerleri kesikli 2–2.
- **Sütunlar:**
  - yuva = 489 / n, sütun genişliği = min(18, yuva × 0,62), yuvada ortalı;
  - parçalar alttan üste MODULE_ORDER sırasıyla dizilir, aralarında 0,75 pt beyaz boşluk olur (gri baskıda da ayrılsın diye);
  - yalnız en üst parçanın köşesi 2 pt yuvarlaktır;
  - süresi 0 olan gün, sıfır çizgisinin üstünde 1,5 pt yüksekliğinde `Line` rengi bir iz olarak çizilir; böylece "boş gün" okunur.
- **Ortalama çizgisi:** `DailyAverageSeconds` yüksekliğinde, 0,75 pt Charcoal, kesik 4–3, grafiğin tam genişliğinde. Etiketi lejantta durur; sütunların üstüne yazı konmaz.
- **X etiketleri (7 pt):**
  - **n ≤ 7** (Bu hafta): her sütunun üstünde toplam süre (7 pt 600 Text, sütunun 5 pt üstünde); altında gün adı ("Pzt", Text) ve ikinci satırda ayın günü ("16", Muted).
  - **8–31 gün** (Son 30 gün, kısa "Tümü"): her sütunun altında ayın günü (Muted). İlk sütunun ve her ayın 1'inin altında ikinci satırda ay kısaltması ("Eki", "Kas").
  - **Haftalık** (`week`, en çok 26 nokta): pazartesinin günü ve ayı ("3 Kas"); 14 noktadan fazlaysa birer atlanır.

### 3.4 Nerede çalıştın?

Başlık satırı: "Nerede çalıştın?" / "Where did you study?"; sağda "çalışma süresinin modüllere dağılımı" (small).

Solda **halka**:
- 112 pt, kalınlık 16;
- parçalar saat 12'den saat yönünde MODULE_ORDER sırasıyla dizilir; aralarında 1,5 pt beyaz boşluk vardır;
- uçlar düzdür (yuvarlak uç baskıda oranları bozar);
- ortada toplam süre (11 pt 800 Charcoal) ve altında "toplam" (7 pt Muted).

Halkanın 28 pt sağında **tablo**:
- her modül için 21 pt yüksekliğinde bir satır; aralarında 0,5 pt `Line`;
- satır içeriği:
  - 8 × 8 renk karesi;
  - ad (9 pt Text, esnek);
  - süre (9 pt Muted, 80 pt, sağa yaslı);
  - yüzde (9 pt 800 Charcoal, 36 pt, sağa yaslı);
- yüzdeler `Modules[].Percent` alanından gelir ve toplamı 100'dür. Çizim en büyük kalan yöntemiyle yuvarlar; API de aynısını yapmalıdır.

Sıra MODULE_ORDER'dır, **süreye göre sıralanmaz**. Süresi 0 olan modül gösterilmez.

## 4. Sayfa 2

### 4.1 Sürekli üst satır

- Solda logo, 12 pt yüksek.
- Sağda "İstatistiklerim · Son 30 gün · 21 Ekim – 19 Kasım 2026" (8 pt Muted).
- Altında 8 pt boşluk ve 1 pt `Line`.

Sayfa tek başına okunduğunda kimin hangi dönemi olduğu bu satırdan anlaşılır.

### 4.2 Derslere göre

Başlık "Derslere göre" / "By lesson"; sağda "en çok çalıştığın 8 ders" (`Lessons.Count < 8` ise "çalıştığın {n} ders").

**Tablo.** Sütunlar arası 12 pt, yatay iç boşluk 8 pt.

| Sütun | Genişlik | Hizalama | İçerik |
|---|---|---|---|
| Ders | esnek | sol | `Name`, 9 pt 700 Charcoal |
| Soru | 56 | sağ | `SolvedQuestionCount`; 0 ise "—" |
| Doğru oranı | 150 | — | Çubuk ve yüzde. Çubuk esnek, 5 pt yüksek, köşe 2,5; iz `Track`, dolgu §2.3'teki kurala göre. Yüzde 30 pt, 9 pt 700, sağa yaslı. `SuccessPercent` boşsa yalnız "—" |
| Süre | 72 | sağ | `StudySeconds` ("7 sa 5 dk") |

- Başlık satırı: `Canvas` zemin, köşe 4, iç boşluk 6 × 8, label yazısı ("DERS", "SORU", "DOĞRU ORANI", "SÜRE").
- Satırlar 24 pt yüksektir; altlarında 0,5 pt `Line` vardır.
- Sıra API'nin sırasıdır (süreye göre çoktan aza, `MaxLessons = 8`). Tabloda "Toplam" satırı yoktur: ders süreleri derssiz süreyi (Odak) içermez, toplam ilk ölçüyle çelişirdi.

### 4.3 Net gelişimi (tablonun altında)

`ExamTrends` dizisindeki her sınav türü için bir kart çizilir; TYT ve AYT varsa iki kart alt alta, aralarında 8 pt.
- Kart: kenar 0,75 pt `Line`, köşe 8, iç boşluk 12 × 14.
- **Sol, 140 pt:**
  - "TYT NET GELİŞİMİ" (label);
  - `LastNet` (16 pt 800);
  - değişim çipi `NetChange` ("+12,50") ve "ilk denemeye göre".
- **Orta, 260 × 58 pt çizgi grafiği (SVG):** (150 + 300 ile sağ sütuna 22 pt kalıyordu ve QuestPDF düzen hatası veriyordu; şimdi sağ sütun yaklaşık 87 pt)
  - noktalar `Points` (en çok son 12);
  - x ekseni denemelerin sırasıdır, tarih ölçekli değildir;
  - y ekseni en düşük ve en yüksek net arasıdır; yatay 18, üst 14 ve alt 14 pt boşluk bırakılır;
  - çizgi 1,5 pt Denemeler zeytini `#4D7C0F`, birleşimleri yuvarlak;
  - altı aynı renkte, %8 saydamlıkta dolgu (QuestPDF'te düz `#F1F4EC` kullanılabilir);
  - taban çizgisi 0,75 pt `Line`;
  - noktalar r 2,75, kenar 1,25 pt zeytin. Sınavika denemesi dolu, `IsExternal` (eklenen deneme) içi beyaz;
  - yalnız ilk ve son noktanın üstünde net (7 pt 700 Charcoal, 6 pt yukarıda), altında tarih ("25 Eki", 7 pt Muted).
- **Sağ:** "{n} deneme" (`Points.Count`, 7 pt Muted). Eklenen deneme varsa altında içi boş nokta ve "eklediğin".
- **`Points.Count < 2`:** grafik yerine tek satır "Gelişim çizgisi için en az iki deneme gerekir." (9 pt Text). Sol blok kalır.
- **`ExamTrends` boşsa** bölüm hiç çizilmez; dördüncü ölçü zaten Seri'dir.

Kartın altında 7,5 pt Muted not: "Netler Sınavika denemelerinden ve eklediğin denemelerden hesaplanır; ÖSYM puanı değildir." / "Nets come from Sınavika exams and the exams you added; they are not an official score."

### 4.4 En verimli saatlerin

Başlık "En verimli saatlerin" / "Your best hours"; sağda "son 30 gün · doğru oranına göre".
- `BestHours` dönemden bağımsız olarak hep son 30 gündür (`StatisticBestHoursBuilder.WindowDays`). Bu yüzden "Bu hafta" raporunda da yan yazı "son 30 gün" der.

**Izgara:**
- Sütunlar `BestHours.Slots` sırasıyla gelir: 06–09, 09–12, 12–15, 15–18, 18–20, 20–22, 22–24, 00–06. Başlıklar 7 pt Muted, ortalı; `EndHour` 24 ise "24" yazılır.
- Satırlar pazartesi (0) ile pazar (6) arasıdır. Gün adı 8 pt Muted, 34 pt sütunda.
- Hücre 18 pt yüksek, köşe 2; hücreler arası 2 pt.
- `CorrectPercent` doluysa hücrede yüzde yazılır (7 pt 600, tabular). Rengin yanında sayı olduğu için gri baskıda da okunur.
- En iyi hücrenin yüzdesi 800 ağırlıkla yazılır.

**Renk basamakları** (slate tek renk; turuncu ve modül rengi yok):

| `CorrectPercent` | Dolgu | Yazı |
|---|---|---|
| boş (az cevap) | `#F1F5F9` | yazı yok |
| < 40 | `#CBD5E1` | `#0F172A` |
| 40–54 | `#94A3B8` | `#0F172A` |
| 55–69 | `#64748B` | `#FFFFFF` |
| 70–84 | `#334155` | `#FFFFFF` |
| ≥ 85 | `#0F172A` | `#FFFFFF` |

Her basamakta yazının zemine karşıtlığı en az 4,5:1'dir (test).

**Altında tek satır:**
- **Solda cümle** `BestHours.Best` alanından kurulur (9 pt Text; gün ve saat 700 Charcoal):
  - "En çok **perşembe 20:00–22:00** arası doğru yapıyorsun (%91)." / "You are most accurate on **Thursday 20:00–22:00** (91%)."
  - `Best` boşsa: "Soru çözdükçe en verimli saatlerin burada belirginleşir."
- **Sağda lejant:**
  - boş hücre karesi (`Line` kenarlı) ve "az cevap";
  - beş basamağın kareleri (10 × 8);
  - "%85+ doğru".

## 5. Boş ve az veri

- Dönemde hiç çalışma yoksa web düğmesi pasiftir ve PDF üretilmez. Boş PDF yoktur.
- Bir bölümün verisi yoksa bölüm başlığıyla birlikte çizilmez. Başlık altı boş bir bölüm olmaz (sahip kuralı).
  - Tek istisna net gelişimidir: tek denemede §4.3'teki tek satır yazılır.
- Sayfa 2 ancak bölümlerden biri varsa basılır. Hiçbiri yoksa rapor tek sayfadır ve altlıkta "1 / 1" yazar.
- Ders sayısı 8'i geçmez; sayfa 2 taşmaz. Sayfa kırılmasında başlık yalnız kalmasın diye her bölüm `EnsureSpace` / `ShowEntire` ile tek parça tutulur.

## 6. Alan eşlemesi (`StatisticOverviewStudentDto`)

| Yer | Alan |
|---|---|
| Dönem çipi | `Period` (`week` → Bu hafta, `month` → Son 30 gün, `all` → Tümü) |
| Tarih aralığı | `FromDate` – `ToDate.AddDays(-1)` |
| Öğrenci ve sınav | Ad kullanıcı profilinden (DTO'da yok); sınav `ExamTrends[0].ExamTypeName`, deneme yoksa yazılmaz |
| Ölçü 1 | `StudyTime.TotalSeconds`, `StudyTime.ChangePercent` |
| Ölçü 2 | `Questions.SolvedCount` |
| Ölçü 3 | `Questions.SuccessPercent`, `Questions.PreviousSuccessPercent` |
| Ölçü 4 | `ExamTrends[0]` (`ExamTypeName`, `LastNet`, `NetChange`, `AttemptCount`); yoksa `Streak.CurrentDays`, `Streak.LongestDays` |
| Çalışma grafiği | `ChartBucket`, `Chart[]` (`Date`, `FocusSeconds`, `LessonSeconds`, `QuizSeconds`, `ExamSeconds`, `FlashcardSeconds`), `StudyTime.DailyAverageSeconds` |
| Dağılım | `Modules[]` (`Key`, `StudySeconds`, `Percent`) |
| Ders tablosu | `Lessons[]` (`Name`, `SolvedQuestionCount`, `SuccessPercent`, `StudySeconds`) |
| Net gelişimi | `ExamTrends[]` (`Points[]`: `Net`, `CompletedAtUtc`, `IsExternal`) |
| Saatler | `BestHours` (`Slots`, `Cells[]`, `Best`) |

`Highlights`, `StrongTopics`, `WeakTopics`, `Works`, `Flashcards`, `Lens` ve `StudyPlan` rapora girmez.

**Süre biçimi:**
- TR: "7 sa 5 dk", tam saatte "2 sa", saatin altında "45 dk";
- EN: "7 h 5 min", "2 h", "45 min".

**Sayılar:**
- TR: "%62", "84,25", "1.204";
- EN: "62%", "84.25", "1,204".

## 7. Taslak `StatisticsReportPdf.cs` ile farklar (19 Kasım taslağı)

> 19 Kasım akşamı api+web+mobile oturumu bu farkların hepsini uyguladığını bildirdi. Uygulamadan gelen beş düzeltme (net kartı 140 + 260 pt, üst bantta deneme sınavı, aynı aydaki kısa tarih, QuestPDF çizgileri, EN soru notu) çizime ve bu belgeye işlendi.

1. **Oklar:** `"↗"` ve `"↘"` Manrope'ta yok, PDF'te boş kutu çıkar. Değişim, işaretli çipte yazılır: "+%22", "−%9" (§3.2).
2. **Tarih aralığı:** `Range()` `ToDate` değerini olduğu gibi basıyor, bu yüzden yarının tarihi çıkıyor. Bitiş `ToDate.AddDays(-1)` olmalı.
3. **Dönem adı:** `month` için "Bu ay" yazılıyor; dönem son 30 gündür. Web segmentindeki gibi "Son 30 gün" olmalı. `all` için "Tüm zamanlar" yerine "Tümü".
4. **Dağılım:** taslak modülleri süreye göre sıralıyor ve tek bir %100 çubuk çiziyor. Çizim MODULE_ORDER sırasıyla halka ve tablo kullanır (§3.4).
5. **Net eğilimi:** taslakta sütunlar var. Çizim nokta ve çizgi kullanır, eklenen denemeyi içi boş nokta yapar, ilk ve son neti yazar (§4.3).
6. **Isı haritası:** taslakta Ders Planı yeşili ve sayısız hücreler var. Çizim slate basamakları kullanır ve yüzdeyi hücreye yazar. Yan yazı "son 30 gün"dür (§4.4).
7. **Ölçü kartları:** taslakta `Canvas` zemin var. Çizimde beyaz zemin ve 0,75 pt kenar, eşit yükseklik (76 pt) ve çip biçiminde değişim kullanılır. Soru kartının not satırı vardır.
8. **Sayfa düzeni:** taslak tek sütunda akıyor. Çizim iki sayfadır; ikinci sayfada sürekli üst satır vardır (§2.1).
9. **Çalışma grafiği:** eksen, kesikli ızgara, günlük ortalama çizgisi, parçalar arası beyaz boşluk, boş gün izi ve ay etiketleri (§3.3) eklenmeli. Grafiği SVG olarak çizmek önerilir.
10. **Doğru oranı çubuğu:** yeşil `#16A34A` yerine `#059669` (web ile aynı).

## 8. Kabul

- Üç çizim, aynı veriyle QuestPDF'te üretilen PDF'in sayfa görüntüleriyle yan yana konduğunda bölüm sırası, ölçüler (±1 pt), renkler ve metinler aynıdır.
- PDF'te boş kutu (eksik karakter) yoktur. Yazılar Manrope'tur; sistem yazı tipine düşen karakter yoktur.
- Turuncu yalnız logoda ve "sinavika.com"dadır.
- Gri tonlu baskıda modül parçaları beyaz boşluklarla, ısı haritası sayılarla ayrılır.
- `ToDate` bugünse rapor bugünün tarihiyle biter.
- Türkçe büyük harf "İSTATİSTİK" ve "DOĞRU ORANI" doğru yazılır.
