# Sınavika UI/UX rehberi

Web (Next.js + Tailwind), mobil (React Native) ve içerik motoru için ortak arayüz kuralları.

**Tarih:** 29 Ekim 2026
**Çizimler:** `Desktop\Sinavika-UIUX3` · `acik/` ve `koyu/` ayrı klasörler (her biri mobil, web-panel, web-site, panolar) · kaynak: `sinavika_video_engine/src/UIUX`
**Belgeler:** `Modul-Kimligi.md` (renk ve merkezi kod), `Ekran-Envanteri.md` (her çizim ve gerçek rotası), `Adlandirma-Kurallari.md`, `UIUX-Denetim.md`, `BrandIdentity.md`

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
Modüller (ana ekran, hub)
├── Slaytlar: her modülün bugünkü teklifi (7 slayt, nokta renkleri modül renkleri)
├── Modül kartları: Denemeler · Dersler · Testler · Ders Planı · Akıllı Özet · Bilgi Kartları · SinoAI (geniş)
└── Destek
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
- **Slaytlar:** modül gradyanı, büyük saydam ikon (filigran), iki yumuşak ışık dairesi, beyaz eylem düğmesi.
- **Kartlar:** beyaz, 20 px köşe, ince kenarlık ve yumuşak gölge. Modüle ait vurgulu kart `moduleLine` (modül renginde kenar).
- **Yazı:** yalnız Manrope (`Tipografi-Web.md`, `Tipografi-Mobil.md`). Rol ölçeği `src/UIUX/Tokens.ts` → `UI_TYPE`.
- **Renk jetonları, köşe, gölge:** `src/UIUX/Tokens.ts`. Koyu tema aynı jetonların koyu değerleri; modül renkleri bir ton açılır.
- **İkonlar:** tek çizgi seti (Lucide uyumlu adlar, `src/UIUX/Icons.tsx`).
- **Kontrast ve en küçük yazı:**
  - Metin her zeminde en az 4,5:1 olmalı; düğme yazısı da (düğme dolgusu `moduleAction`, modül dışında `action` #C2410C).
  - Küçük turuncu bağlantı `brandDeep` ile yazılır; #EA580C yalnız logo, simge ve büyük başlıkta.
  - En küçük yazı 12 pt.
  - Modül renginde yazı her zaman `ink` ile yazılır (tasarımda `moduleInk`, mobilde `palette.ink`). Bu renk, modülün tonlarında da okunur kalacak kadar koyulaştırılmış modül rengidir.
  - İkon, dolgu ve sekme hapı modülün kendi rengini kullanır.
  - Modül renkli kartın içinde soluk metin kullanılmaz; ikincil metin rengi kullanılır.
  - Başarı, uyarı ve hata rozetlerinin yazısı `successInk`, `warningInk`, `errorInk` jetonlarıyla yazılır.
- **Web paneli:** Gövde, küçük ve meta yazılar mobilden 1 pt büyüktür. Geniş ekranda tek bir blok ortada bırakılmaz: ana içerik ve yan bilgi iki sütunda durur.

## 4. Bileşenler

Kaynak: `src/UIUX/Parts`. Web ve mobil aynı adları ve varyantları kullanır. Halka, çubuk, adım noktaları, anahtar ve odak çizgisi de rengini ekranın bağlamından (`useAccent`) alır.

- **Dokunma alanı:** görünür boy küçük olabilir (`sm` düğme 36 pt), ama uygulamada dokunma alanı en az 44 pt (iOS) ve 48 dp (Android) olur.

| Grup | Bileşenler |
|---|---|
| Temel | `Text`, `Stack`, `Button` (primary ve soft rengi bağlamdan alır: modülde modül, dışında marka · dark · ghost · white · module · moduleSoft · glass · disabled), `Chip`, `Card` (card · flat · soft · module · moduleLine · dark), `Tile`, `Field`, `Segmented`, `Toggle`, `Avatar`, `Logo` |
| Veri | `Ring`, `Bar`, `Bars`, `Sparkline`, `Levels`, `Steps`, `Dots`, `OptionRow`, `List` / `ListRow`, `Skeleton` |
| Mobil | `Phone`, `AppHeader`, `TabBar`, `ModuleSlide`, `ModuleCarousel`, `HubCard`, `ModuleScreen`, `PageTitle`, `SectionTitle`, `FocusHeader`, `BottomBar`, `Sheet`, `TourOverlay` |
| Web | `Panel`, `Sidebar`, `Topbar`, `ModuleHead`, `ModuleBanner`, `Immersive`, `WCard`, `Grid`, `AuthLayout`, `WebOnboarding`, `SiteHeader`, `SiteFooter`, `Site`, `Section`, `SiteTitle`, `ExamStrip`, `DevicePhone`, `DeviceBrowser` |

## 5. Kalıplar

### 5.1 Hub ve slaytlar

- İlk slayt günün en önemli şeyidir: canlı deneme, yarım kalan mikro ders ya da günün planı. Diğer slaytlar modül sırasıyla.
- Destek kartı nötrdür (beyaz kart, gri simge); ana eylem değildir.
- Hub kartı: modül adı ve tek satır; altında modül renkli panelde ikon ve **durum etiketi** ("Cumartesi canlı", "32 kart bugün", "Bu ay 7 / 30").
- Reklam bandı ücretli kullanıcıda yok; ücretsiz kullanıcıda kartların arasında değil, en altta.

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

Boş (ne, neden, tek eylem), yükleniyor (iskelet), hata ("bu bizden kaynaklı", tek eylem), çevrimdışı (ince sarı şerit). Ham "Not Found", GUID, enum adı ve hata ayıklama bilgisi asla gösterilmez.

### 5.6 Abonelik

Deneme süresinin üç tarihi açık (bugün, 2. gün hatırlatma, 3. gün ücret). Kota somut ("bu ay 7 / 30"). Kilit simgesi yerine açıklayıcı paket kartı. İptal yolu bir dokunuşla bulunur.

## 6. Çizim servisi (`src/UIUX`)

| Dosya | Görev |
|---|---|
| `ModuleIdentity.ts` | Modüllerin tek tanımı (renk, ad, ikon, sekme, kod adları) |
| `Tokens.ts`, `Icons.tsx`, `Context.tsx` | Jetonlar, ikon seti, tema/dil/modül bağlamı |
| `Parts/Shared.tsx`, `Parts/Mobile.tsx`, `Parts/Web.tsx` | Bileşen kitaplığı |
| `Screens/Mobile/*`, `Screens/Web/*`, `Screens/Site/*` | Ekranlar |
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
- Renklerin ayrı ve beyaz yazıya uygun olması.
- Eski adların ("Lens", "Kelime Kartları" vb.) ekranda geçmemesi.
- Her ekranın TR ve EN olarak hatasız çizilmesi.

## 7. Uygulama sırası

`UIUX-Denetim.md` §5'teki dalgalar geçerlidir. v2 ile değişenler:

- **Dalga 1:** web ve mobilde `moduleIdentity` dosyası, jetonlar, ortak bileşenler.
- **Dalga 2:** tab bar yuvaları, sayfa başlığında modül çipi, web menüsü ve modül hap sekmeleri.
- **Dalga 3:** hub slaytlarının veriyle doldurulması (günün adımı ilk slayt), mobil giriş/kayıt akışı, kısaltılmış onboarding, **web onboarding**.
- **Dalga 4:** modül ekranları (envanterdeki sırayla).
- **Dalga 5:** koyu tema (her ekranın `koyu/` karşılığı), sakin site sayfaları, boş/hata kalıpları.

Çizimlerdeki sayılar, adlar, yorumlar ve fiyatlar örnektir.
