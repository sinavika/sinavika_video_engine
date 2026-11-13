# Mobil Uygulama Ekranları

Videolarda ve görsellerde görünen uygulama ekranları **UI/UX çizimlerinin kendisidir** (`src/UIUX`, `npm run uiux` ile Desktop\Sinavika-UIUX3'e çıkan ekranlar). Her ad bir UI/UX ekran kimliğine bağlıdır. Tasarım orada değişince kamp videoları, reklamlar, mağaza görselleri ve paylaşımlar bir sonraki render'da yeni ekranı alır; ayrıca güncellenecek bir kopya yoktur. Ekran görüntüsü dosyası tutulmaz.

10 Kasım 2026'ya kadar bu ekranlar uygulama kodundan elle yeniden çizilmiş ayrı kopyalardı ve tasarımın gerisinde kalmıştı. O kopyalar silindi. Elle çizim olarak yalnız mağaza görsellerinin dile göre değişen SinoAI sohbeti kaldı (`Screens/AssistantScreens.tsx`, `StoreListing` verisiyle).

## Yapı

| Dosya | Ne tutar |
| --- | --- |
| [`AppScreenTokens.ts`](../../src/Components/AppScreens/AppScreenTokens.ts) | Uygulamanın açık ve koyu renkleri, ölçüleri, yazı boyutları. Tek kaynak. |
| [`AppModules.ts`](../../src/Components/AppScreens/AppModules.ts) | Modüller ve her modülün sekme çubuğu (uygulamadaki adlarıyla). |
| [`AppScreenParts.tsx`](../../src/Components/AppScreens/AppScreenParts.tsx) | Ortak parçalar: kart, etiket, düğme, ikon, ilerleme çubuğu, turuncu çağrı kartı, liste satırı, ekran çerçevesi. |
| [`AppScreenRegistry.tsx`](../../src/Components/AppScreens/AppScreenRegistry.tsx) | Adıyla seçilebilen tüm ekranlar ve her birinin UI/UX ekran kimliği. İçerik dosyaları bu adları kullanır. |
| [`PhoneFrame.tsx`](../../src/Components/AppScreens/PhoneFrame.tsx) | Projenin tek telefonu; video ve görsel aynı telefonu kullanır. |

Ekranlar 390×844'lük sabit bir tuvale çizilir (uygulamanın tasarım boyutu) ve gösterildiği yere bütün olarak ölçeklenir.

## Ekranlar

| Ad | Modül | UI/UX ekranı | Ne gösterir |
| --- | --- | --- | --- |
| `Home` | Modüller | `m-hub-moduller` | Ana ekran: günün planı, sıradaki görev, modüller |
| `ExamHome` | Denemeler | `m-deneme-vitrin` | Canlı deneme, devam eden deneme, öneriler |
| `Exam` | Denemeler | `m-deneme-coz` | Süreli bir denemede soru çözme |
| `Analysis` | Denemeler | `m-deneme-gelisim` | Net trendi ve derslere göre gelişim |
| `SmartSummaryHome` | Akıllı Özet | `m-ozet-vitrin` | Soru analizi, video analizi, geçmiş analizler |
| `SmartSummary` | Akıllı Özet | `m-ozet-sonuc` | Soru görselinden çözüm, kazanım ve hata analizi |
| `SinoAi` | SinoAI | `m-sino-sohbet` | SinoAI ile sohbet |
| `Flashcards` | Bilgi Kartları | `m-kart-on` | Kartı çevir, bilme düzeyini işaretle |
| `Lessons` | Dersler | `m-ders-vitrin` | Mikro dersler, konular, tekrar |
| `Tests` | Testler | `m-test-vitrin` | Konu testleri: Kolay, Orta, Zor |
| `StudyPlan` | Ders Planı | `m-plan-bugun` | Günün görevleri ve çalışma serisi |
| `StudyProgress` | Ders Planı | `m-plan-ilerleme` | Haftalık çalışma süresi ve konu ilerlemesi |

Her ekran uygulamanın **açık** ve **koyu** temasında, **Türkçe** ve **İngilizce** çizilebilir (dil: `PhoneFrame lang`, `AppLanguageProvider`; modül, sekme ve kart adları uygulamanın en-US kataloğundan). Ekranlar telefonda 390 nokta genişliğindedir; `TabletFrame` aynı ekranları daha geniş bir tuvale yayar (`AppCanvasProvider`). `PhoneFrame variant="android"` dinamik ada yerine kamera deliğiyle çizer (Google Play görselleri için). Her modül, uygulamadaki gibi beş sekmeli kendi sekme çubuğunu taşır (ortada her zaman "Modüller"); ana ekranda ve SinoAI'de sekme çubuğu yoktur.

```bash
npm run screens -- --list
```

## Nerede kullanılır

**1. Tanıtım videosu.** `AppPromotion` şablonunda her özellik bir ekran adıyla eşleşir, `ExamJourney` şablonunda uygulama sahnesi (`product.screen`) bir ekran adıdır; `appMode` uygulamanın temasını seçer.

```json
"appMode": "light",
"features": [
  {"screen": "Home", "headline": "Hepsi tek yerde", "narration": "…"},
  {"screen": "Flashcards", "headline": "Kartlarla tekrar", "narration": "…"}
]
```

**2. Telefonlu görseller.** `MobilePromotion` (HeroPhone, DualPhones), `FeatureSpotlight` ve `WebPromotion/DeviceDuo` tasarımlarında `appScreen` alanı telefonun içinde hangi ekranın görüneceğini seçer. Verilmezse ana ekran (`Home`) çizilir; gerçek bir `screenshot` verilirse o kullanılır.

```json
{"category": "MobilePromotion", "variant": "DualPhones", "content": {"screens": [
  {"label": "Denemeler", "appScreen": "Exam"},
  {"label": "Bilgi Kartları", "appScreen": "Flashcards"},
  {"label": "İstatistikler", "appScreen": "Analysis"}
]}}
```

**3. Tek başına ekran.** Story, LinkedIn gönderisi, mağaza sayfası ya da sunum için ekranlar PNG olarak dışa aktarılır:

```bash
npm run screens                                   # tüm ekranlar, açık tema, 1170×2532
npm run screens -- --mode both --device           # açık ve koyu, telefonun içinde
npm run screens -- --screen Exam --screen SinoAi --mode dark
```

Dosyalar `Outputs/AppScreens/<Ekran>_<tema>[_Telefon].png` adıyla yazılır ve her çalıştırmada yenilenir (katalogdur, numaralı üretim değildir). Çıplak ekran 1170×2532 pikseldir: gerçek bir telefon ekran görüntüsünün çözünürlüğü.

**4. Kendi içeriğiyle ekran.** Üç ekran örnek veri yerine gerçek içerik alabilir; bir şablon bunları doğrudan içe aktarıp kullanır:

| Ekran | Değiştirilebilen içerik |
| --- | --- |
| `ExamSolveScreen` | soru, seçenekler, işaretli seçenek, ders, soru numarası, kalan süre |
| `SmartSummaryScreen` | soru, çözüm adımları, kazanım, hata analizi |
| `SinoAiScreen` | soru ve cevap paragrafları |
| `FlashcardScreen` | kart türü, ders, ön yüz, sıra |

## Kurallar

- **Metinler uygulamanındır.** Başlık, sekme adı, düğme ve açıklamalar uygulamanın Türkçe kataloğundan alınır; uydurulmaz. Uygulamada adı "Akıllı Özet" olan modüle içerikte "Lens" denmez (web adı farklıdır, bkz. [`BrandIdentity.md`](../Brand/BrandIdentity.md)).
- **Sayılar örnektir.** Net, süre, görev ve ilerleme sayıları ürün gösterimi içindir ve birbiriyle tutarlıdır (86 doğru, 30 yanlış → 78,5 net). Başarı iddiası gibi sunulmaz, metinde tekrar edilmez.
- **Renk ve ölçü elle yazılmaz.** Bir ekran yalnız `AppScreenTokens` ve `AppScreenParts` üzerinden çizilir.
- **Ekran adları sabittir.** İçerik dosyaları bu adlara bağlıdır; bir ad değiştirilmez, yeni ekran yeni adla eklenir. Ad listesi bir testle kilitlidir.
- **Uygulamada olmayan ekran çizilmez.** Yeni bir özellik uygulamaya geldiğinde önce kodundan doğrulanır, sonra çizilir.

## Yeni ekran eklemek

1. Uygulama deposunda ekranın yapısına ve `src/core/i18n/catalogs/tr-TR` altındaki metinlerine bak.
2. `Screens/` altında ilgili dosyaya ekranı `AppScreenFrame` ve ortak parçalarla çiz; modülünü ve etkin sekmesini belirt.
3. `AppScreenRegistry.ts` içine bir satır ekle.
4. `npm run screens -- --screen <Ad> --mode both` ile bak; testlerdeki ad listesini güncelle.

Uygulamanın rengi, ölçüsü ya da sekme adı değişirse yalnız `AppScreenTokens.ts` ya da `AppModules.ts` güncellenir; bütün ekranlar birlikte değişir.

## Uygulama ekranları ve UI/UX çizimleri

Bu belgedeki ekranlar uygulamanın **bugünkü** halini çizer (mağaza görselleri, videolar). Yeniden tasarım çizimleri ayrı bir servistedir: `src/UIUX` (`npm run uiux`). Modül renkleri ve adları orada tek dosyada tanımlıdır (`src/UIUX/ModuleIdentity.ts`); uygulama yeni tasarıma geçtikçe bu ekranlar da aynı kimliği kullanmalıdır. Ayrıntı: [UIUX/UIUX-Rehberi.md](UIUX-Rehberi.md), [UIUX/Modul-Kimligi.md](Modul-Kimligi.md).

## Mağaza görselleri (App Store ve Google Play)

`npm run store` App Store ve Google Play'in istediği bütün görselleri üretir: 8 slayt × her ölçü, Türkçe ve İngilizce. Metinler, slaytların ekranları ve ölçü listesi [`src/Store/StoreListing.ts`](../../src/Store/StoreListing.ts) içindedir; çizim [`src/Store/StoreScreenshot.tsx`](../../src/Store/StoreScreenshot.tsx).

```bash
npm run store                                     # açık görünüm, tr + en, bütün ölçüler
npm run store -- --look koyu --only iphone-6.3     # alternatif görünüm (koyu, turuncu)
npm run store -- --lang en --slides 0,1
```

Görseller her zaman en yüksek kalitededir: mağazanın istediği tam piksel ölçüsünde, kayıpsız PNG (en büyük ölçüler: iPad 13" 2064 × 2752, Android 10 inç 2160 × 3840). Dosyalar `Outputs/MobileHeader/<dil>/<ios|android>/<format>/` altına yazılır; alternatif görünümler `Outputs/MobileHeader/_alternatifler/` altına. Arka plandaki dalga slaytlar boyunca kesintisiz devam eder: mağazada yan yana duran görseller tek bir şerit gibi okunur.

App Store kreatif görselleri (iOS / iPadOS 27+): **Header** (`ust-gorsel`, 5244 × 2950 ya da 3840 × 1646) ve **Search Results** (`arama-sonucu`, 5244 × 2950, 3840 × 2560 ya da 1920 × 1280). Her boyut metinli ve metinsiz (`-metinsiz`) iki dosyadır; düzen yatay, üç telefonlu. Metin `STORE_CREATIVE` içindedir. Yalnız bunları üretmek için: `npm run store -- --only ust-gorsel` ya da `--only arama-sonucu`.
