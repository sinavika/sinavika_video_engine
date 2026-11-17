# Mobil Uygulama Ekranları

Videolarda ve görsellerde görünen uygulama ekranları **UI/UX çizimlerinin kendisidir** (`src/UIUX`, `npm run uiux` ile Desktop\Sinavika-UIUX3'e çıkan ekranlar). Her ad bir UI/UX ekran kimliğine bağlıdır. Tasarım orada değişince kamp videoları, reklamlar, mağaza görselleri ve paylaşımlar bir sonraki render'da yeni ekranı alır; ayrıca güncellenecek bir kopya yoktur. Ekran görüntüsü dosyası tutulmaz.

10 Kasım 2026'ya kadar bu ekranlar uygulama kodundan elle yeniden çizilmiş ayrı kopyalardı ve tasarımın gerisinde kalmıştı. O kopyalar silindi; son kalan elle çizimler (mağazanın SinoAI sohbeti, eski modül ve sekme tablosu, eski ekran parçaları) ve eski uygulamanın emülatör görüntülerine dayanan mağaza düzeni de 14 Kasım 2026'da kalktı.

## Yapı

| Dosya | Ne tutar |
| --- | --- |
| [`AppScreenTokens.ts`](../../src/Components/AppScreens/AppScreenTokens.ts) | Tuval ölçüsü (390 × 844) ve telefon çerçevesinin açık/koyu zemin renkleri. |
| [`AppScreenParts.tsx`](../../src/Components/AppScreens/AppScreenParts.tsx) | Ekranın teması, dili ve tuvali (bağlam sağlayıcıları). |
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
| `Lessons` | Dersler | `m-ders-vitrin` | Konular adım adım, kaldığın yerden ve tekrar |
| `Tests` | Testler | `m-test-vitrin` | Konu testleri: Kolay, Orta, Zor |
| `StudyPlan` | Ders Planı | `m-plan-bugun` | Günün görevleri ve çalışma serisi |
| `StudyProgress` | Ders Planı | `m-plan-ilerleme` | Haftalık çalışma süresi ve konu ilerlemesi |

Her ekran **açık** ve **koyu** temada, **Türkçe** ve **İngilizce** çizilebilir (`PhoneFrame mode`, `PhoneFrame lang`). Sekme çubuğu, modül rengi ve adlar UI/UX çiziminin kendisinden gelir. `PhoneFrame variant="android"` dinamik ada yerine kamera deliğiyle çizer.

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

**4. İçerik değiştirmek.** Ekranlar UI/UX çizimidir; içeriği değiştirmek için çizim `src/UIUX`'te değiştirilir ve `npm run uiux -- --only <kimlik>` ile UIUX3 de güncellenir.

## Kurallar

- **Metinler uygulamanındır.** Başlık, sekme adı, düğme ve açıklamalar uygulamanın Türkçe kataloğundan alınır; uydurulmaz. Uygulamada adı "Akıllı Özet" olan modüle içerikte "Lens" denmez (web adı farklıdır, bkz. [`BrandIdentity.md`](../Brand/BrandIdentity.md)).
- **Sayılar örnektir.** Net, süre, görev ve ilerleme sayıları ürün gösterimi içindir ve birbiriyle tutarlıdır (86 doğru, 30 yanlış → 78,5 net). Başarı iddiası gibi sunulmaz, metinde tekrar edilmez.
- **Renk ve ölçü elle yazılmaz.** Ekranlar UI/UX çizimleridir; renk ve ölçü `src/UIUX/Tokens.ts` ve `ModuleIdentity.ts`'ten gelir. `AppScreenTokens` yalnız tuval ölçüsü ve telefon çerçevesi içindir.
- **Ekran adları sabittir.** İçerik dosyaları bu adlara bağlıdır; bir ad değiştirilmez, yeni ekran yeni adla eklenir. Ad listesi bir testle kilitlidir.
- **Uygulamada olmayan ekran çizilmez.** Yeni bir özellik uygulamaya geldiğinde önce kodundan doğrulanır, sonra çizilir.

## Yeni ekran eklemek

1. Ekran `src/UIUX`'te yoksa önce orada çizilir ([UIUX-Rehberi.md](UIUX-Rehberi.md) §6).
2. `AppScreenRegistry.tsx`'teki `APP_SCREENS` listesine bir satır eklenir: ad, UI/UX kimliği, başlık, açıklama.
3. `npm run screens -- --screen <Ad> --mode both` ile bakılır; testlerdeki ad listesi güncellenir.

Modül renkleri ve adları tek dosyadadır (`src/UIUX/ModuleIdentity.ts`, bkz. [Modul-Kimligi.md](Modul-Kimligi.md)); orada değişince bütün ekranlar birlikte değişir.

## Mağaza görselleri (App Store ve Google Play)

`npm run store` App Store ve Google Play'in istediği bütün görselleri üretir: 8 kare × her ölçü, Türkçe ve İngilizce (14 Kasım 2026). Ana görünüm "Turuncu"; alternatifler `--look krem`, `lacivert` ve `seritli` (sekiz kare boyunca kesintisiz şerit). Başlıklar virgülsüz ve noktasız kısa ifadelerdir; kilit sözcük turuncu zeminde lacivert kutudadır. Metinler, karelerin UI/UX çizimleri ve ölçü listesi [`src/Store/StoreListing.ts`](../../src/Store/StoreListing.ts), çizim [`src/Store/StoreSet.tsx`](../../src/Store/StoreSet.tsx).

```bash
npm run store -- --out "C:\Users\onurc\Desktop\sinavika-mobileheader\magaza-gorselleri"
npm run store -- --out <klasör> --lang en --only ios/ipad
npm run store -- --look seritli --out "C:\Users\onurc\Desktop\sinavika-mobileheader\alternatifler\seritli"
```

- **Önce ders çalışma:** ilk üç kare Bugün planı, ders adımı ve deneme neti; SinoAI son karede.
- **Cihazlar:** iPhone ve Android'de telefon (mobil çizim), iPad'de yatay tablet (tablet çizimi; olmayan karede telefon), Chromebook'ta tarayıcı (web çizimi). Eski uygulamanın ekran görüntüsü ya da elle çizilmiş kopya kullanılmaz; test bunu denetler.
- **App Store kreatif görselleri (iOS 27+):** üst görsel (3840 × 1646 ve ortak 16:9 5244 × 2950) ve arama sonucu (3840 × 2560, 1920 × 1280, 5244 × 2950), metinli ve metinsiz. Yazı yalnız Apple'ın güvenli alanında durur.
- **Google Play öne çıkan görsel:** 1024 × 500, cihaz ve beyaz zemin yok.
- Araştırma ve kurallar: `Desktop\sinavika-mobileheader\README.md`.
