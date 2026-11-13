# Sınavika UI/UX rehberi

Web (Next.js + Tailwind), mobil ve tablet (React Native) ve içerik motoru için ortak arayüz kuralları.

**Güncelleme:** 14 Kasım 2026
**Çizimler:** `Desktop\Sinavika-UIUX3` · `acik/` ve `koyu/` ayrı klasörler (her biri mobil, web-panel, web-site, tablet, panolar) · kaynak: `sinavika_video_engine/src/UIUX`
**Belgeler:** `Modul-Kimligi.md` (renk ve merkezi kod), `Ekran-Envanteri.md` (her çizim ve gerçek rotası, üretilir), `Adlandirma-Kurallari.md`, `Tablet-Kalem.md` (tablet ve kalem), `UX-Kurallari.md` (119 UX kuralı), `Hareket-Standardi.md`, `AppScreens.md` (videolardaki uygulama ekranları), `UIUX-Gecmis.md` (denetimler, kararlar, açık işler), `BrandIdentity.md`

## 0. Temel kurallar

- **Renk:** modülün içinde vurgu modülün rengindedir (ana düğme dahil); turuncu yalnız marka yüzeylerinde (logo, giriş ve kayıt, onboarding, ödeme ve abonelik, profil, site). Ayrıntı `Modul-Kimligi.md`.
- **Seçili durum:** onboarding ve ayarlarda seçili kart, çip ve gün koyu çerçeve ve tikle gösterilir; dolgu rengi ana düğmeye kalır.
- **Site sakin:** beyaz ve paletteki griler, ikonsuz logo (yazı), turuncu yalnız ana düğmede; modül renkleri yalnız uygulama maketlerinin içinde.
- **SinoAI renksiz:** beyaz ve gri; web'de solda geçmiş, ortada tek sohbet sütunu, yuvarlak yazma kutusu.
- **Web panel sol menü sade:** gri ikonlar; aktif satırda gri hap, ince modül çizgisi ve ikon rengi.
- **Açık ve koyu tema ayrı set:** her ekran iki temada çizilir, `acik/` ve `koyu/` klasörlerine ayrı yazılır; çizimler temayı kendisi seçmez.
- **Ön tanıtım yok:** özellikler ilk karşılaşıldıkları yerde tek satırlık ipucuyla anlatılır.

## Hiyerarşi kuralı (Dersler, Testler, Bilgi Kartları)

İçeriğe erişim her zaman **ders (lesson main) → konu (lesson sub) → içerik** sırasıyla olur. Bu üç modülün ilk ekranı yalnız dersleri listeler (Türkçe, Matematik…); konular, testler ve desteler dersin seçilmesinden sonra açılır. Dersler'de konu, mikro derslere (2–6 dk) bölünür; mikro ders adımlardan oluşur. Bugün ve plan kartları doğrudan bir konuya götürebilir, ama ana liste her zaman derstir.

## 1. Bilgi mimarisi

```
Modüller (ana ekran, hub) = Bugün
├── Selam, hedef sınav ve kalan gün, seri · hafta şeridi
├── Bugünün planı: görev ve dakika ilerlemesi, sıradaki görev ve Başla
├── İki eylem kartı (Kaldığın yerden · Sıradaki deneme)
├── Modül kartları: Denemeler · Dersler · Testler · Ders Planı · Akıllı Özet · Bilgi Kartları · SinoAI (geniş)
└── Bugün tekrar · Destek
Her modülün içinde: modül tab bar'ı (5 yuva) · Profil yuva 5'te
Bildirimler: üst sağdaki zil · Profil: üst soldaki kişi simgesi ve yuva 5
```

Modül sırası her yerde aynıdır: Denemeler, Dersler, Testler, Ders Planı, Akıllı Özet, Bilgi Kartları, SinoAI.

## 2. Gezinme

### Mobil

- **Üst çubuk:** solda profil, sağda bildirim zili ve sayaç (kırmızı rozet). Logo ortada yalnız Modüller ana ekranında ve marka ekranlarında; modül sayfası kendini sayfa başlığıyla adlandırır. Alt sayfalarda solda geri, ortada başlık.
- **Tab bar:** beş yuva. Yuva 1 modülün kendisi, yuva 2 ana işi, yuva 3 Modüller, yuva 4 kayıtlar ya da ikinci işi, yuva 5 Profil. Etiketler sığdığı kadar yer alır. Tam tablo `Modul-Kimligi.md` §6'da.
- **Sayfa başlığı:** modül çipi (renkli ikon ve ad) ve büyük başlık. Öğrenci hangi modülde olduğunu her ekranda görür.
- **Odak ekranları** (deneme/test çözme, mikro ders, kart oturumu, odak sayacı, kamera): tab bar yok; üstte çıkış, başlık, süre ve ilerleme.
- **"Daha fazla" yok.** Hakkında, Destek, güvenlik ve diğer ayarlar Profil'de.
- **SinoAI** tam ekran: solda menü (geçmiş ve kütüphane), ortada Sohbet · Çalışma geçişi, sağda yeni sohbet.

### Web panel

- **Sol menü** (panelin mevcut düzeni): Ana sayfa, Tüm modüller; "Modüller" başlığı altında 7 modül, her biri renkli ikonuyla; "Hesap" altında Bildirimler, Destek; en altta seri kartı ve Çıkış yap.
- **Üst çubuk:** arama (Ctrl K), sınava kalan gün, tema, destek, bildirim, kullanıcı.
- **Modül sayfası:** hap sekmeler (yuva 1, 2, 4 ve web'e özgü ekler) ve modül renkli başlık kartı.
- **Odak sayfaları** (`(immersive)` rotaları): menü yok; ince çubukta Ara ver, başlık, süre, eylem.

### Web sitesi

- Sitenin mevcut header'ı. "Ürünler" açılınca 7 modül kendi rengiyle listelenir.
- Maketlerde **gerçek çizimler** kullanılır: telefonda mobil ekran, tarayıcıda panel. Ürün değiştikçe site görselleri de aynı kaynaktan güncellenir.

## 3. Görsel dil

- **Modül rengi ve saydam katmanlar:** `Modul-Kimligi.md`. Her modül sayfasının üstü kendi renginin %7'siyle yıkanır; ikon kutuları %12; ilerleme izleri %16; kenarlar %24.
- **Modül vitrin kartı** (`ModuleSlide`): modül gradyanı, büyük saydam ikon (filigran), iki yumuşak ışık dairesi, beyaz eylem düğmesi.
- **Kartlar:** beyaz, 20 px köşe, ince kenarlık ve yumuşak gölge. Modüle ait vurgulu kart `moduleLine` (modül renginde kenar).
- **Yazı:** yalnız Manrope (`docs/Brand/Tipografi-Uygulama.md`). Rol ölçeği `src/UIUX/Tokens.ts` → `UI_TYPE`.
- **Renk jetonları, köşe, gölge:** `src/UIUX/Tokens.ts`. Koyu tema aynı jetonların koyu değerleri; modül renkleri bir ton açılır.
- **İkonlar:** tek çizgi seti (Lucide uyumlu adlar, `src/UIUX/Icons.tsx`).
- **Kontrast ve en küçük yazı:**
  - Metin her zeminde en az 4,5:1 olmalı; düğme yazısı da (düğme dolgusu `moduleAction`, modül dışında `action` #C2410C).
  - Küçük turuncu bağlantı `brandDeep` ile yazılır; #EA580C yalnız logo, simge ve büyük başlıkta.
  - Gövde (okuma) yazısı 16 pt, satır aralığı 1,5; alan yazısı 16 pt. En küçük yazı 12 pt.
  - Anlam yalnız renkle verilmez: doğru/yanlış tik ve çarpıyla, alan hatası uyarı simgesiyle gösterilir.
  - Modül renginde yazı her zaman `ink` ile yazılır (tasarımda `moduleInk`, mobilde `palette.ink`). Bu renk, modülün tonlarında da okunur kalacak kadar koyulaştırılmış modül rengidir.
  - İkon, dolgu ve sekme hapı modülün kendi rengini kullanır.
  - Modül renkli kartın içinde soluk metin kullanılmaz; ikincil metin rengi kullanılır.
  - Başarı, uyarı ve hata rozetlerinin yazısı `successInk`, `warningInk`, `errorInk` jetonlarıyla yazılır.
- **Web paneli:** Gövde, küçük ve meta yazılar mobilden 1 pt büyüktür. Geniş ekranda tek bir blok ortada bırakılmaz: ana içerik ve yan bilgi iki sütunda durur.

## 4. Bileşenler

Kaynak: `src/UIUX/Parts`. Web ve mobil aynı adları ve varyantları kullanır. Halka, çubuk, adım noktaları, anahtar ve odak çizgisi de rengini ekranın bağlamından (`useAccent`) alır.

- **Dokunma alanı:** görünür boy küçük olabilir (`sm` düğme 36 pt), ama uygulamada dokunma alanı en az 44 pt (iOS) ve 48 dp (Android) olur; yan yana hedefler arasında en az 8 px boşluk.
- **Düğme durumları:** `loading` (gönderiliyor: dönen işaret, düğme kilitli, işlem iki kez gitmez), `focus` (web klavye odağı: 2 px koyu halka), `disabled`. Basılı durum dolguyu bir ton koyulaştırır.
- **Alan:** etiket her zaman görünür; hata alanın hemen altında, uyarı simgesiyle ve o alana özel cümleyle (`Field error`). Şifre alanında göster/gizle.

| Grup | Bileşenler |
|---|---|
| Temel | `Text`, `Stack`, `Button` (primary ve soft rengi bağlamdan alır: modülde modül, dışında marka · dark · ghost · white · module · moduleSoft · glass · disabled), `Chip`, `Card` (card · flat · soft · module · moduleLine · dark), `Tile`, `Field`, `Segmented`, `Toggle`, `Avatar`, `Logo` |
| Veri | `Ring`, `Bar`, `Bars`, `Sparkline`, `Levels`, `Steps`, `Dots`, `OptionRow`, `List` / `ListRow`, `LoadingLogo` |
| Çalışma (üç platform ortak, `Parts/Study.tsx`) | `WeekStrip`, `TodayCard` (plan · plan yok · gün bitti · deneme süresi bitti), `ActionCard`, `FilterChips`, `PlanTaskCard`, `NetBars`, `StateBlock`, `KpiCard`, `StudyBars`, `StudyDonut`, `StudyHeatmap`, `EntryRow` |
| Mobil | `Phone`, `AppHeader`, `TabBar`, `ModuleSlide` (modül vitrininin üst kartı), `HubCard`, `ModuleScreen`, `PageTitle`, `SectionTitle`, `FocusHeader`, `BottomBar`, `Sheet`, `TourOverlay` |
| Web | `Panel` (tablette `PanelInTablet`), `Sidebar`, `Topbar`, `ModuleHead`, `ModuleBanner`, `Immersive`, `WCard`, `Grid`, `AuthLayout`, `WebOnboarding`, `SiteHeader`, `SiteFooter`, `Site`, `Section`, `SiteTitle`, `ExamStrip`, `DevicePhone`, `DeviceBrowser` |
| Tablet (`Parts/Tablet.tsx`, `Parts/Ink.tsx`) | `Tablet`, `SolveBar`, `PenToolbar`, `Scratchpad`, `QuestionStrip`, `InkNote`, `SideRail`, kalem izleri (`HandText`, `InkLayer`, `PEN`) |

## 5. Kalıplar

### 5.1 Ana ekran: Bugün

- Ana ekran önce "bugün ne çalışacağım?" sorusunu cevaplar (sahip onayı, 5 Kasım 2026; modül slayt karuseli kalktı). Sıra: hafta şeridi (bugünün halkası, işli günlerde nokta), **Bugünün planı** kartı, iki eylem kartı, modüller.
- Bugünün planı kartının dört hâli vardır: plan var, plan yok (kayıttaki cevaplar ve "Planımı hazırla"), gün bitti, deneme süresi bitti (ilerleme korunur, Paketleri gör). Mobil, web ve tablet aynı kartı kullanır.
- Eylem kartında tek fiil (Başla, Devam et, Hatırlat, Teslim et) ve bir ölçü: ilerleme, geri sayım ya da kilit nedeni.
- Görev kartı "nereden, ne, ne kadar" söyler: kaynak ve konu, neden önerildiği, soru ya da dakika.
- Destek kartı nötrdür (beyaz kart, gri simge); ana eylem değildir.
- Hub kartı: modül adı ve tek satır; altında modül renkli panelde ikon ve **durum etiketi** ("Cumartesi canlı", "32 kart bugün", "Bu ay 7 / 30").
- Reklam yoktur; ödeme olmadan erişim yoktur (3 günlük mağaza denemesi).

### 5.2 Giriş ve kayıt

- Mobil: Karşılama → "Başlayalım" (onboarding) ya da "Zaten hesabım var" (oturum aç).
- Oturum aç: Apple, Google, e-posta. E-posta varsa 6 haneli kod; yoksa aynı akış hesap oluşturur.
- Hesap oluştur: Apple ve Google önde; e-postayla kod ve yalnız ad istenir. Şifre gerekmez, sonra Hesap güvenliği'nden eklenir.
- Şifremi unuttum: e-posta → kod ve yeni şifre tek ekranda. Her yerde tek kelime: şifre.
- Misafir hesap gerektiren bir şeye dokununca tam ekran yönlendirme değil alt sayfa açılır.
- Web, giriş ve kayıt: onboarding gibi iki yarım. Solda form kartı, sağda tanıtım paneli: başlık, üç madde, panel ve telefon görseli, mağaza düğmeleri. Panel yalnız geniş ekranda görünür. Şifre sayfaları ortalanmış kart olarak kalır. Kayıttan sonra web onboarding başlar.

### 5.3 Onboarding

- **Mobil:** Karşılama → sınav ve oturum → mevcut ve hedef net ("Netimi bilmiyorum" seçeneğiyle) → tempo ve günler → zorlanılan dersler → **planın hazır** (6. ekran) → planını kaydet (Apple ve Google önde) → 3 gün ücretsiz → bugünkü ilk mikro ders.
- İlerleme çubuğu yalnız planı kuran beş adımı sayar.
- Plan, hesap ve ödemeden önce gösterilir. "Hesabın hazır" ara ekranı ve ön tanıtım turu yoktur.
- Bildirim izni ilk mikro ders bitince, kendi açıklama ekranımızla istenir.
- **Web:** aynı beş adım ve paket seçimi. Web'de deneme süresi yoktur; "Şimdilik paket seçme" seçeneği vardır.

### 5.4 Analizden eyleme

Her sonuç ve analiz bir eylemle biter: konu satırında "Mikro ders" (Dersler renginde) ve "10 soru" (Testler renginde); altında "Bu hafta planıma ekle". Testte yanlış cevaptan sonra da aynı yol vardır: doğru şık ve nedeni, konunun mikro dersi, SinoAI'ye sor.

### 5.4.1 Deneme ve test geri bildirimi

- **Deneme** gerçek sınavın provasıdır. Çözerken doğru ya da yanlış gösterilmez; şık yalnız seçili görünür. Sonuçlar teslimden sonra çözümlerde açılır.
- **Testler** öğrenme içindir. Doğru ve yanlış anında gösterilir.
- **Dersler'in adımları:** seçme, doğru/yanlış, sıralama ve boşluk doldurma tek denemedir; yanlışta doğrusu ve nedeni gösterilir. TYT tarzı soruda her yanlış bir çözüm adımı açar ve öğrenci yeniden seçer. İlk denemede yanlış yapılan adım Tekrar'a girer (1, 3, 7 gün); bu bir ceza değil, nötr bir notla söylenir.
- **Bugün tekrar:** Ders Planı'nda Dersler tekrarı ve Bilgi Kartları tek kartta.
- **Test seviyeleri:** Kolay, Orta, Zor; her biri 20 soru. "Tarama" iç bir kavramdır, öğrenciye gösterilmez.
- **SinoAI üretim sonucu:** Eylemler kartın içinde gerçek düğmedir: ana düğme dolu ("Testi aç"), ikincil düğme çerçeveli ("Değiştir").

### 5.5 Durumlar

Boş (ne, neden, tek eylem), yükleniyor (ortada dönen saatli logo, `LoadingLogo`; içerik varsa yerinde kalır, üstte küçük gösterge; iskelet yok, 11 Kasım 2026), hata ("bu bizden kaynaklı", tek eylem), çevrimdışı (ince sarı şerit). Ham "Not Found", GUID, enum adı ve hata ayıklama bilgisi asla gösterilmez.

**Boşluk kalmaz** (sahip, 5 Kasım 2026): her ekranın dolu hâlinin yanında boş, ilk kullanım, bitti, sınır ve hata hâli de çizilir.
- Hiçbir hâl çıkmaz sokak değildir: neden böyle olduğunu ve sonra ne olacağını söyler, tek eylem sunar.
- Sıfır olan sayı "0 dk" diye gösterilmez; ilk haftada sıfır duvarı yerine ilk üç adım gösterilir.
- Kaçan görev sessizce kaybolmaz ("Dünden kalan": bugüne ekle ya da haftaya yay).
- Hak dolunca yenilenme zamanı yazılır; başka hakların etkilenmediği söylenir.
- Test: her mobil modülün en az bir durum ekranı vardır (`-bos`, `-ilk`, `-yok`, `-bitti`, `-hak`, `-okunamadi`, `-dunden`, `-baglanti`). Hâllerin listesi `Ekran-Envanteri.md`'de.

### 5.6 Abonelik

Deneme süresinin üç tarihi açık (bugün, 2. gün hatırlatma, 3. gün ücret). Kota somut ("bu ay 7 / 30"). Kilit simgesi yerine açıklayıcı paket kartı. İptal yolu bir dokunuşla bulunur.

### 5.7 Üç platform tek yapı

Mobil, web ve tablet aynı özelliği aynı parçalarla çizer (sahip, 8 ve 12 Kasım 2026: "yüzde yüz uyum").
- **Ortak parçalar** `Parts/Study.tsx`'tedir (§4). Bir parça değişince üç platform birlikte değişir.
- **Ders adımları tek kaynak:** web ve tablet oynatıcısı mobilin adım çizimini kendi çerçevesinde gösterir (`EmbedStep`). Yeni adım türü bir kez çizilir.
- **Tablet = web sayfası:** tam ekran tablet, web sayfasının kendisini uygulamanın üst çubuğunun altında gösterir (`PanelInTablet`; kenar menü ve web üst çubuğu çizilmez). Tablet ekranı kısa olduğu için grafikler alçak çizilir (`useInTablet`); içerik ve sıra aynıdır. 600 pt altında (Split View) tablet telefon düzenini kullanır. Tablete özgü ekranlar `Tablet-Kalem.md`'de.
- **Eşlik testi** (`tests/UIUX/UIUX.test.ts`, "keeps mobile, web and tablet in step"): ana ekran ve dört hâli, Ders Planı günü, sonuçlar ve boş hâli, deneme detayı, teslim onayı, biten deneme, deneme ekle, istatistikler, yanlışlarım ve Grupla, Eşleştir, Formül, Bölüm başı adımları üç platformda (`m-`, `w-`, `t-`) çizili olmalı. Biri eksikse test düşer.

### 5.8 Ekranların veri kaynağı (API)

Çizimlerdeki her alanın API'de karşılığı vardır; "yeni API gerekir" yazmadan önce API'de aranır (14 Kasım denetimi, `UIUX-Gecmis.md` §6).

| Ekran | Veri |
|---|---|
| Ana ekran | `engagement/today` (seri, planlanan ve çalışılan dakika, görev sayıları), study-plan `calendar` (hafta şeridi, sıradaki görev), Works `continue` ve `reviews`, Bilgi Kartları bugün, yaklaşan deneme |
| Görev kartı | `StudyPlanTaskDto`: `ReasonCode` (neden), `QuestionCount` (miktar), `ResourceType`/`ResourceId` (açılacak kaynak), `LockReason` |
| Görev ekle ve işlemleri | study-plan `tasks` (`POST`, `PUT`, `PATCH status`, `PATCH schedule`, `DELETE`), task `launch`, odak oturumu `start/complete`; "Dünden kalan" için takvimde `editableFromDate` |
| İstatistikler | `statistics` (süre, soru, net), `StatisticStudentDto.Modules` (modül payları), `BestHours` (ısı haritası), study-plan günlük istatistik |
| Deneme ekle | `student/external-exams` (`GET`, `POST`, `DELETE`, `GET options`) |
| Deneme devamı | `student/exams/attempts/{id}/state` |
| Kalem notları | `student/notes` (bkz. `Tablet-Kalem.md`) |
| Zorunlu güncelleme | `GET api/app/version` |
| Akıllı Özet ve SinoAI hakları | mevcut kota uçları |

## 6. Çizim servisi (`src/UIUX`)

| Dosya | Görev |
|---|---|
| `ModuleIdentity.ts` | Modüllerin tek tanımı (renk, ad, ikon, sekme, kod adları) |
| `Tokens.ts`, `Icons.tsx`, `Context.tsx` | Jetonlar, ikon seti, tema/dil/modül bağlamı |
| `Parts/Shared.tsx`, `Parts/Mobile.tsx`, `Parts/Web.tsx`, `Parts/Tablet.tsx`, `Parts/Ink.tsx` | Bileşen kitaplığı |
| `Parts/Study.tsx` | Üç platformun ortak çalışma parçaları (§5.7) |
| `Screens/Mobile/*`, `Screens/Web/*`, `Screens/Site/*`, `Screens/Tablet/*` | Ekranlar (`m-`, `w-`, `s-`, `t-`) |
| `Registry.ts` | Her çizimin kimliği, grubu, gerçek rotası ve notu |
| `UIUXComposition.tsx`, `UIUXProps.ts` | Remotion kompozisyonları (tek ekran ve pano) |
| `scripts/RenderUIUX.ts` | Dışa aktarım |

```bash
npm run uiux
```

Seçenekler: `--only m-deneme` (önek), `--lang en` (İngilizce kopyalar `en/` altına), `--no-boards`, `--boards-only`, `--list`, `--inventory docs/UIUX/Ekran-Envanteri.md`.

Yeni ekran eklemek:

1. Ekranı `Screens/` altında parçalardan kur.
2. `Registry.ts`'ye tek satır ekle: kimlik, grup, başlık, gerçek rota, not, modül.
3. `npm run uiux -- --only <kimlik>` ile çiz.
4. `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile envanteri güncelle.

Testler (`tests/UIUX/UIUX.test.ts`) şunları denetler:

- Modül tablosunun eksiksiz olması.
- Renklerin ayrı ve beyaz yazıya uygun olması; düğme yazısının iki temada 4,5:1 olması.
- Denemeler dışındaki modül ekranlarında marka turuncusu olmaması.
- Gövde yazısının en az 16 pt ve 1,5 satır aralığında, hiçbir yazının 12 pt'nin altında olmaması.
- SinoAI yazma kutularının altında yapay zekâ notunun olması.
- Eski adların ("Lens", "Kelime Kartları" vb.) ekranda geçmemesi.
- Her ekranın TR ve EN olarak hatasız çizilmesi.
- Her mobil modülün dolu hâlinin yanında en az bir durum ekranı olması (§5.5).
- Mobil, web ve tablet eşliği (§5.7).

## 7. Uygulama sırası

İlk denetimdeki (15 Ekim, [UIUX-Gecmis.md](UIUX-Gecmis.md) §1) dalga sırası geçerlidir; önce güveni bozan küçük düzeltmeler (Dalga 0), sonra şunlar:

- **Dalga 1:** web ve mobilde `moduleIdentity` dosyası, jetonlar, ortak bileşenler.
- **Dalga 2:** tab bar yuvaları, sayfa başlığında modül çipi, web menüsü ve modül hap sekmeleri.
- **Dalga 3:** Bugün ana ekranının veriyle doldurulması (§5.1, §5.8), mobil giriş/kayıt akışı, kısaltılmış onboarding, **web onboarding**.
- **Dalga 4:** modül ekranları (envanterdeki sırayla).
- **Dalga 5:** koyu tema (her ekranın `koyu/` karşılığı), sakin site sayfaları, boş/hata kalıpları.

## 8. Uygulama kuralları (web ve mobil kodu)

Çizimde görünmeyen ama uygulamada şart olan kurallar. Kaynak: UI UX Pro Max'in 119 UX kuralıyla karşılaştırma (`UX-Kurallari.md`).

**Hareket**
- Bütün değerler ve kurallar: [`Hareket-Standardi.md`](Hareket-Standardi.md) (jetonlar `src/UIUX/Tokens.ts` → `UI_MOTION`, `UI_MOTION_MOMENTS`).
- Bir ekranda en çok 1–2 öğe hareket eder; sürekli animasyon yalnız yükleniyor göstergesinde ve SinoAI'nin "düşünüyor" noktalarında.
- Süreler ortak hareket jetonlarından gelir; giriş ve çıkış yavaş biten eğriyle (ease-in yok, 10 Kasım 2026), çıkış girişten kısa.
- Sistemde "hareketi azalt" açıksa geçişler kısalır, paralaks ve sürekli animasyon durur.
- Hiçbir içerik kendiliğinden dönmez ya da kaymaz.

**Dokunma ve gezinme**
- Sistem geri tuşu ve hareketi her ekranda çalışır.
- Yatay kaydırma yalnız hafta şeridinde ve süzgeç çiplerinde; çekip yenileme yalnız listelerde, çözme ve oynatıcı ekranlarında kapalı.
- Doğru cevapta hafif, yanlışta uyarı titreşimi.
- Yüzen sekme çubuğu güvenli alana göre yerleşir; son satır onun altında kalmaz.
- Web adresi ekranı anlatır; bildirim doğru ekranı açar.

**Klavye ve odak (web)**
- Her öğeye sekme tuşuyla gelinir, sıra görsel sırayla aynıdır; odak halkası 2 px, sayfaya karşı en az 3:1.
- Yapışkan üst çubuk ve alt sayfalar odaklanan öğeyi kapatmaz; panelde "ana içeriğe atla" bağlantısı.
- Oynatıcıda 1–5 şık, Enter devam.

**Formlar**
- Doğru klavye türü (e-posta, sayı, telefon) ve otomatik doldurma: e-posta, ad, tek seferlik kod.
- Doğrulama alandan çıkınca yapılır; yazarken uyarılmaz.
- Gönderiliyor → başarı ya da alan hatası; uzun web formlarında üstte hata özeti ve odak oraya.
- Girişte şifre yöneticisi ve yapıştırma çalışır; kod kutusu yapıştırılan 6 haneyi dağıtır.

**Metin ve yerleşim**
- En büyük yazı ayarında ve %200 yakınlaştırmada içerik kesilmez; kutular yazıya göre büyür.
- Başlık, düğme, hata ve adlar tam görünür; uzun sözcük ve adresler satır içinde kırılır.
- Okuma metni satırda 45–75 karakter.
- Web 375, 768, 1024 ve 1440 px'te denenir; yatay kaydırma olmaz.

**Geri bildirim**
- Kısa işte yükleniyor göstergesi yanıp sönmez; yükleme her yerde ortada dönen saatli logo (iskelet yok, 11 Kasım 2026).
- Kısa bildirim (toast) 3–5 saniye kalır, hata için kullanılmaz.
- Boş aramada öneri ve ders listesi gösterilir.

**Ekran okuyucu**
- İkon düğmelerinin adı vardır (zil, profil, geri, kapat, şıklar); figürlerin `alt` metni okunur.
- Hata ve sayaç değişimi (bildirim sayısı) kısa bir durum mesajıyla duyurulur.

**Yapay zekâ**
- SinoAI'nin bir yapay zekâ olduğu ve hata yapabileceği yazma kutusunun altında yazar. Bu not ürünün içinde kalır; pazarlama metninde "yapay zekâ destekli" denmez.
- SinoAI yanıtı parça parça yazılır.

**Performans (web ve mobil ekibi):** görseller WebP ve doğru ölçüde, ekran dışı içerik sonra yüklenir, kod rota başına bölünür, fontlar yazıyı bekletmez, üçüncü taraf betikler sayfayı bekletmez.

Çizimlerdeki sayılar, adlar, yorumlar ve fiyatlar örnektir.
