# iPhone Duo · kodlama belgesi (mobil)

Güncelleme: 19 Kasım 2026 (ölçüler Xcode 27.2 iPhone Duo simülatöründe ölçüldü; 18 Kasım sürümündeki ölçüler yanlıştı) · Kaynak çizimler: `Desktop\Sinavika-UIUX3\{acik,koyu}\iphone-duo\` ve `en\{acik,koyu}\iphone-duo\`.

**Çizim kodu:**
- Şerit ve ölçüler: `sinavika_video_engine/src/UIUX/Parts/Duo.tsx`
- Dış ekran telefon çerçevesi: `Parts/Mobile.tsx` (`Phone`, `AppHeader`, `TabBar`, `Content`)
- İç ekran tablet çerçevesi: `Parts/Tablet.tsx` (`TabletCanvas`)
- Pozlar: `Screens/Duo/DuoPoses.tsx`
- Kayıt: `Registry.ts` (`duoOuter`, `duoInner`, `DUO_EXTRA`)

Önce oku: [README](README.md), [Navigasyon](Navigasyon.md) ve modül belgeleri (01–11). Bu belge yalnız iPhone Duo'da neyin değiştiğini yazar; ekranların içeriği modül belgelerindedir.

> **Sahip kararı (18 Kasım 2026).** Uygulamanın bütün ekranları iPhone Duo için çizilir: dış ekran ve iç ekran.
> - Ayrı bir "Duo uygulaması" yoktur. Aynı ekranlar genişliğe göre telefon ya da tablet düzenini seçer.
> - Bir ekranda yapılan düzeltme Duo çizimine de geçer: Duo çizimleri ana çizimlerden üretilir.
>
> **Ölçü düzeltmesi (19 Kasım 2026, sahip: "Evet, düzelt").** mac-iphone simülatörde ölçtü: dış ekran dik, iç ekran 951 × 669, sağdaki şerit iOS'un. Çizimler, mağaza görselleri ve bu belge buna göre yenilendi.

## 1. iPhone Duo nedir

Apple'ın ilk katlanabilir telefonudur.
- Duyuru: 9 Eylül 2026.
- Kitap gibi açılır.
- İki ekranı ve her ekranda bir ön kamerası vardır.
- Ortadaki menteşe cihazın farklı açılarda tutulmasını ve masaya konmasını sağlar.

| Ekran | Pencere (pt) | Güvenli alan | İçerik (pt) | Piksel (3x) | Bizim düzen |
|---|---|---|---|---|---|
| Dış ekran (kapalı) | **466 × 678, dik** | sağ 84, alt 34 | 382 × 644 | 1398 × 2034 | Telefon düzeni |
| İç ekran (açık, enine) | **951 × 669** | sağ 84, alt 34 | 867 × 635 | 2853 × 2007 | Tablet / web sayfası |
| İç ekran (açık, dik) | 669 × 951 | üst ve alt (yatay çubuklar) | — | 2007 × 2853 | Tablet dikey düzeni |

- Ölçüler Xcode 27.2 iPhone Duo simülatöründen (iOS 27.2), mac-iphone, 19 Kasım 2026. App Store ekran görüntüsü boyutlarının üçte biriyle aynıdır.
- Yarı açıkken pencere boyutu değişmez; yalnız katlanma bölgesi açılır.
- App Store ekran görüntüleri: dış ekran 1398 × 2034, iç ekran 2853 × 2007 (dik 2007 × 2853 de kabul edilir).
- Duo görüntüsü yüklenen uygulamanın ürün sayfasında "iPhone Duo için yapıldı" rozeti çıkar. iOS 27.1 SDK ile derlenen uygulamalarda Nisan 2027'den sonra bu görüntüler zorunludur.

**Kaynaklar:**
- Xcode 27.2 iPhone Duo simülatörü (pencere, güvenli alan, şerit, `verticalBarEdge`, `reservedRegions`), 19 Kasım 2026.
- Apple HIG, "Designing for iPhone Duo" (`developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo`).
- Apple, "Preparing your app for iPhone Duo"; App Store Connect, "Screenshot specifications".

18 Kasım sürümünde dış ekran enine 678 × 466 ve iç ekran 890 × 626 yazıyordu; bunlar tanıtım haberlerindendi ve yanlıştı.

## 2. Apple'ın kuralları (bizi bağlayanlar)

1. **Uygulama yeniden boyutlanır, ekrana özel düzen yazılmaz.**
   - Dış ekran compact, iç ekran regular boy sınıfındadır.
   - Her poz için ayrı düzen yapılmaz.
   - Sabit genişlik ve cihaz adına göre karar yok; güvenli alan ve iOS'un bildirdiği özellikler kullanılır.
2. **İki ekranda aynı işlev ve aynı durum.**
   - Katlayınca ya da açınca açık olan soru, kaydırma yeri, seçili şık, süre ve taslak korunur.
   - İç ekran bir hiyerarşi düzeyi daha gösterebilir; örneğin liste ve detay yan yana.
3. **Çubuklar sağdaki şerittedir.**
   - Dış ekranda ve enine iç ekranda iOS sağ kenarda 84 pt'lik bir şerit ayırır. Dynamic Island, saat ve durum simgelerini iOS bu şeridin üstüne çizer.
   - Sekme çubuğu (UIKit'te `UITabBar`) bu şeridin altına dikey yerleşir; araç öğeleri sistem öğelerinin altına gelir.
   - Dikey öğede yalnız simge görünür. Yalnız metni olan düğme içerikte kalır.
   - Şeridin araç kısmında en üstte Geri ya da Kapat, sonra öne çıkan eylem durur. Sığmayan araç öğeleri taşma menüsüne gider.
   - Tek istisna dik tutulan iç ekrandır; orada çubuklar yataydır.
   - Şeridin hangi kenarda olduğunu iOS bildirir: `traitCollection.verticalBarEdge` (leading / trailing / unspecified).
4. **Ayrılmış bölgeler.**
   - Ön kameralar şeridin içindedir.
   - Katlanma bölgesi: cihaz yarı açıkken iç ekranı ikiye böler, ortası kullanılmaz. Yeri `UIView.reservedRegions(kind: .division)` ile okunur.
   - Düğme ve önemli içerik katın üstüne gelmez. Izgarada sütun sayısı çift olur.
5. **Katlanırken büyük yerleşim değişikliği yapılmaz.** Yalnız görünür ve dokunulur kalmak için gereken şey kayar.
6. **Bölünmüş görünüm** (split view) iç ekranda açılır, dış ekranda tek bölmeye kapanır.

## 3. Bizim karşılığımız

### 3.1 Dış ekran (466 × 678 pt, dik), `f-dis-*`

- **Düzen:** telefon düzeni. İçerik genişliği 382 pt; telefondan (390) biraz dar, 146 pt daha kısa.
- **Şerit** (iOS'un, 84 pt, sağda):
  - Üstte iOS'un öğeleri: Dynamic Island, saat, Wi‑Fi ve pil. Çizimde cihaz görünsün diye çizilir; **uygulama bunları çizmez.**
  - **Araç öğelerimiz:** iOS'un sistem öğelerinin altından başlar. Yerlerini iOS `reservedRegions(kind: .occlusion)` ile bildirir; dış ekranda 174 pt yüksekliktedir (mac-iphone, simülatör, 19 Kasım). Kod bu bölgeyi okur; çizimde araçlar 180 pt'den başlar. (İlk çizimdeki 132 pt Wi‑Fi halkasıyla çakışıyordu.)
  - **Sekme simgelerimiz:** şeridin altında, alttaki 34 pt güvenli alanın üstünde.
  - Çizimde şerit zemini `card`, solunda 1 pt `line` çizgisi.
- **Şerit düğmesi** (`RailButton`):
  - 46 × 44 pt, simge 22 pt.
  - Seçili sekme modül renginin yumuşak zemininde (`mod.soft`); simge modül renginde.
  - Rozet: kırmızı 16 pt daire.
- **Başlık** (`AppHeader`):
  - Başlık ya da logo içerikte, sol üstte durur; 40 pt yükseklik, logo 22 pt.
  - Simgeli düğmeler şeride geçer: profil / geri / kapat, ardından bildirim zili.
  - Metinli sağ öğe (ör. "Çözüldü", "Tümü") başlık satırında kalır.
- **Şerit araç öğeleri, sıra ve kural** (yukarıdan aşağı, aralarında 4 pt):
  | Telefondaki başlık | Şeritte 1. öğe | Şeritte 2. öğe |
  |---|---|---|
  | Sol profil, sağ zil, sekmeli modül ekranı | — (Profil zaten şeridin altındaki sekmelerde) | Zil (rozetli) |
  | Sol profil, sağ zil, sekmesiz ekran (Modüller hub'ı) | Profil (`user`) | Zil (rozetli) |
  | Sol geri, sağ zil (alt sayfalar) | Geri (`left`) | Zil |
  | Sol kapat (odak, akışlar, sayfa üstü pencereler) | Kapat (`x`) | Zil (sağda başka öğe yoksa) |
  | Sağda metinli ya da özel öğe | Profil / geri / kapat | — (öğe başlık satırında kalır, zil şeride gelmez) |
  | Solu boş (`none`) | — | Zil |
  - Başka simge yok; taşma menüsü gerekmedi.
  - Şeritte aynı simge iki kez görünmez: sekme çubuğu olan ekranda Profil yalnız altta, sekmelerin sonunda durur.
  - Araç grubu ile sekme grubu arasında ayırıcı çizgi yoktur; araçlar üstte (sistem öğelerinin altında, çizimde 180 pt'den), sekmeler altta (alt güvenli alanın üstünde) durur, aradaki boşluk boş kalır.
  - Sekmesiz ekranlarda (Modüller hub'ı, akışlar, odak sayfaları) şeridin altı boştur.
- **Sekme çubuğu** (`TabBar`): yüzen alt çubuk yerine şeritte beş simge. Sıra: sekme 1, sekme 2, Modüller, sekme 3, Profil.
- **İçerik** (`Content`):
  - Tek sütun; sayfa kayar. Çizim sayfanın üstünü gösterir; altta kesilen içerik kaydırmayla gelir.
  - Altta sekme çubuğu olmadığı için alt boşluk yalnız güvenli alan kadardır (34 pt).
- **Alt eylem çubukları** (Sonraki, Cevabı boşalt, Devam, Kontrol et): metinli, içerikte altta kalır; telefondaki gibi kendi alt boşlukları ev çizgisinin üstünde kalır.
- **Kalmayanlar:** kilit ekranı, widget ve canlı etkinlik çizimleri (`m-bildirim-*` sistem yüzeyleri) Duo'da ayrıca çizilmedi. Bunları iOS çizer; içerik [Apple-Yuzeyleri-Teslim.md](../Apple-Yuzeyleri-Teslim.md) ile aynıdır.

### 3.2 İç ekran, enine (951 × 669 pt), `f-ic-*`

- **Düzen:** tablet düzeni; içerik 867 pt. Ekranda web panelinin sayfası, menü ve üst çubuk olmadan durur; tablet çizimleriyle aynı yaklaşım (`PanelInTablet`).
- **Şerit** (iOS'un, 84 pt, sağda):
  - Üstte iOS'un saati ve durum simgeleri (çizimde gösterilir, uygulama çizmez).
  - Araç öğelerimiz: bildirim (rozetli) ve SinoAI; sistem öğelerinin altından (`reservedRegions(kind: .occlusion)`; çizimde 132 pt, adasız olduğu için dış ekrandan kısa).
  - Altta yerlerimiz: Modüller, açık modül (modül renginde) ve Profil.
- **Sol yan menü (ray) yok:** yerler sağdaki şeritte olduğu için tablet geniş düzenindeki sol ray Duo iç ekranda gösterilmez. Karar `verticalBarEdge` ile verilir; genişlik 951 ≥ 900 olsa da.
- **Modülün kendi sekmeleri** sayfanın içinde, başlıktaki hap düğmelerde kalır. Apple'ın "denetim içeriğin yanında" kuralı.
- **Odak sayfaları** (deneme çözme, test, oynatıcı; web'de `Immersive`): çerçeveyi doldurur. Üstte "Ara ver" ve başlık satırı.
- **Telefon akışları** (giriş, kayıt, onboarding, ödeme, bildirim izni):
  - Telefon ekranı ortada **430 pt sütun** olarak çizilir (iPad'deki form sayfası gibi).
  - Zemin `line2`; şeritte yalnız iOS'un öğeleri.
  - Kimlik: `f-ic-giris-*`, `f-ic-kayit-*`, `f-ic-sifre-*`, `f-ic-onb-*`.
- **Kalem yok:** iPhone Duo Apple Pencil'ı desteklemez.
  - Taslak kâğıdı ve işaretleme parmakla yapılır.
  - Kalem araç çubuğu kısa hâliyle çizilir ve en üstte **Kaydır / Çiz** anahtarı bulunur (`noPencil`).

### 3.3 Yarı açık (kitap pozu): katı kaçınma

- Katlanma bölgesi iç ekranın ortasındadır: simülatörde x 455,5–495,5, **40 pt** (mac-iphone, 19 Kasım; çizim de 40 pt). **Uygulamada sabit sayı kullanılmaz;** bölge `reservedRegions(kind: .division)` ile okunur.
- Çizimde bölge hafif gölgeyle gösterilir; uygulamada gölge çizilmez.
- Sol bölme katın soluna, sağ bölme katın sağına yerleşir; iki bölme arasındaki boşluk katın kendisidir (çizimde 41 pt, sol bölme x 455'te biter).
- Sağ bölme kat ile şerit arasındadır: 496 ile 867 arası 371 pt (kodda ölçülen); çizimde bölmenin kartı 349 pt, çünkü sayfanın 22 pt sağ boşluğu kartın dışında kalır.
- Katın üstüne düğme gelmez: deneme çözme ekranının alt çubuğu (soru kartının altındaki Geri · soru baloncukları · Sonraki) katın solunda kalır; üç soru baloncuğu, "Boş bırak" yok, "Sonraki" var.
- Odak sayfalarının üst çubuğu (Kapat, başlık, süre / ilerleme | Taslak kâğıdı, Soruya yaz, Bitir ya da SinoAI) katta ikiye bölünür: Kapat, başlık ve süre ya da ilerleme çubuğu katın solunda kalır (sol grup 433 pt, süre çubuğu sığmazsa daralır); araçlar katın sağında, sağa yaslı.
- Yarı açıkta taslak kâğıdı 349 pt'ye iner; taslaktaki yazılar kâğıtla birlikte küçülür (çizimde %80), kalem araç çubuğunun altına girmez.
- Tam açıkta da (`f-ic-deneme-taslak`) soru kartı dar olduğu için aynı kısa alt çubuk kullanılır; taslak kâğıdı 400 pt, soru metni 17 pt. Alt çubuk soru kartının içinde kalır.
- Yanlışlarım (`f-ic-test-yanlislar`): sol kart 270 pt, numara hücreleri 36 pt, 5 sütun.
- Karşılama: kartlar dış ekranda (678 pt) ve iç ekrandaki 430 pt sütunda (669 pt) daha sık dizilir; son kart başlığa değmez.
- Sağ bölmesi olan iki ekran var:
  - `f-ic-deneme-yari-acik` (deneme çözme): sol bölmede soru kartı (soru, şıklar, alt çubuk), sağ bölmede taslak kâğıdı. Taslak kâğıdı tam açıktaki taslakla aynı bileşendir: başlık satırı (Taslak kâğıdı · Soru 46 · 1 / 1, yeni sayfa, gizle, kapat), noktalı kâğıt, sağ kenarda dikey kalem araç çubuğu (Kaydır / Çiz, kalem, vurgulayıcı, silgi, 4 renk, geri al / yinele), altta "Taslak bu soruya kayıtlı" notu. Taslak soruya bağlıdır; katlanınca dış ekranda aynı taslak açılır.
  - `f-ic-ders-sinoai-yari-acik` (ders adımı): sol bölmede adım (tür etiketi, soru, şıklar, "Yeniden seç"), sağ bölmede SinoAI paneli: uygulamadaki `SinoAiSidePanel` ile aynı (üstte sohbetin kendi başlık satırı `SinoAiChatHeader`, altında baloncuklar ve öneri çipleri, en altta "SinoAI’ye sor" yazma alanı ve "SinoAI hata yapabilir; önemli bilgileri doğrula." notu). Panel adım çubuğundaki SinoAI düğmesiyle açılır ve kapanır; katlanınca dış ekranda alt sayfa (sheet) olur.
- **Geçici uygulama (mac-iphone, 19 Kasım):** öğe kaydırma ekran ekran yapılana kadar, sağ bölmesi olmayan ekranlarda yarı açıkta içerik katın soluna sığdırılır, sağ bölme boş kalır. Güvenli varsayılan budur ve şimdilik kabul edildi; hedef aşağıdaki kuraldır.
- Diğer ekranlarda sağ bölme yoktur; yeni bir panel açılmaz. Yarı açıkta sayfa tam açıktaki düzenini korur (Apple: katlanırken büyük yerleşim değişikliği yok). Kodun tek işi: düğme, alan ve metin satırı katlanma bölgesinin üstüne gelirse katın bir yanına kaydırmak. İki sütunlu sayfalarda sütun aralığı kata denk getirilir.

### 3.4 İç ekran dik (669 × 951 pt)

- Çubuklar yataydır: üstte durum ve başlık, altta çubuk. Tablet dikey düzeniyle aynıdır.
- Örnek: `f-ic-dikey-deneme`. Şıklar üç sütunda, taslak alt yarıda.

### 3.5 Durum sürekliliği (kabul ölçütü)

- Dış ekrandan iç ekrana geçişte aynı şeyler korunur: soru numarası, seçili şık, kalan süre, taslak, kaydırma yeri ve açık sekme.
- SinoAI'nin hâli:
  - iç ekranda yan panelde açıksa, dış ekranda alt sayfa (sheet) olur;
  - geri açınca yine yan panelde olur.
- Teslim penceresi gibi açık bir pencere geçişte kapanmaz, yeni ekrana taşınır.

## 4. Ekran listesi

Kimlik kuralı:
- dış ekran: `f-dis-<mobil kimliği m- olmadan>`; örnek `m-deneme-coz` → `f-dis-deneme-coz`;
- iç ekran: `f-ic-<web kimliği w- olmadan>`; örnek `w-panel-anasayfa` → `f-ic-panel-anasayfa`;
- telefon akışında iç ekran: `f-ic-<mobil kimliği>`; örnek `f-ic-onb-1-sinav`.

| Küme | Sayı | Düzen |
|---|---|---|
| Dış ekran | 152 | Bütün mobil ekranlar (sistem yüzeyleri hariç); telefon düzeni + şerit |
| İç ekran · telefon akışları | 16 | Giriş, kayıt, şifre, onboarding; ortada 430 pt sütun |
| İç ekran · sayfalar | 82 | Bütün web paneli sayfaları ve odak sayfaları; tablet / sayfa düzeni + şerit |
| Pozlar | 5 | Taslak kâğıdı (açık), yarı açık deneme, test taslağı, yarı açık ders + SinoAI, iç ekran dik |

Tam liste kimlik, rota ve notuyla [Ekran-Envanteri.md](../Ekran-Envanteri.md) içinde, "iPhone Duo" bölümündedir. PNG adları kimlikle aynıdır.

## 5. React Native uygulama notları

- **Şerit kararı iOS'tan gelir, ölçüden değil.** Küçük bir yerel modül (Swift) JS'e şunları verir:
  - `verticalBarEdge` (leading / trailing / unspecified);
  - katlanma bölgesi (`reservedRegions(kind: .division)`; yarı açıkta dolu, değilse boş).
  - sistem öğelerinin bölgesi (`reservedRegions(kind: .occlusion)`; şeritteki araçlar bunun altından başlar).
    - Ölçülen değerler (Xcode 27.2, iOS 27.2, mac-iphone 19 Kasım): dış ekranda x 382, y 0, 84 × 174; ayrıca kamera bölgesi 37 × 37 (x 399,7, y 29,3), şeridin içinde. İç ekranda x 867, y 0, 84 × 124; tam açık ve yarı açıkta aynı, ayrı kamera bölgesi yok.
    - Araçlar bölgenin altından `Space.xs` (8–10 pt) boşlukla başlar: dış ekranda ~183, iç ekranda ~133 pt. Çizimdeki 180 ve 132 bununla uyumludur.
    - Poz değişirken iOS bir an döndürülmüş ya da boş değer verebilir (ör. 174 × 84, `verticalBarEdge` null); kod bir sonraki okumayı esas alır.
  - `verticalBarEdge` trailing iken alt sekme çubuğu ve başlık simgeleri sağdaki şeride geçer; şerit genişliği güvenli alanın sağ değeridir (84). Dik iç ekranda `unspecified` gelir, yatay çubuklar kalır.
- **Sistem öğeleri çizilmez:** ada, saat, pil iOS'un. Biz yalnız sekme simgelerini (şeridin altında, alt güvenli alanın üstünde) ve araç öğelerini (sistem öğelerinin altında) çizeriz. Sağ ve alt boşluk için `SafeAreaView` / `useSafeAreaInsets` kullanılır.
- **Düzen kararı pencere boyutuyla verilir** (`useWindowDimensions`); cihaz adıyla karar verilmez:
  - genişlik < 600: telefon (Duo dış ekranı 466);
  - 600–899: tablet dikey (Duo iç ekran dik 669);
  - ≥ 900: tablet geniş (Duo iç ekran 951). Şerit sağdayken soldaki yan ray gösterilmez.
- **Durum sürekliliği:** ekran değişince bileşenler yeniden kurulur, durum kaybolmaz. Durum `zustand` / sorgu önbelleğinde tutulur, bileşen yerelinde tutulmaz. Ekran geçişi bir "yeniden düzen"dir, "yeni sayfa" değil.
- **Dış ekranda tek sütun:** sayfalar telefondaki gibi kayar. İki sütuna bölme yoktur.
- **Fontlar ve jetonlar değişmez:** Manrope, `tokens.ts` ve `moduleIdentity.ts`. Seçili şerit düğmesi zemini `mod.soft`. Yeni renk, font ya da ikon yoktur.
- **Mağaza:** Duo ekran görüntüleri gönderilmeden önce uygulamanın gerçekten yeniden boyutlandığı Xcode Device Hub'da denenir. Rozet ancak o zaman doğrudur.

## 6. Açık işler

- mac-iphone, 19 Kasım (kodda, commit yok, sahip onayı bekliyor):
  - **Yapıldı:** dış ekran şerit araçları (sekmeli ekranda yalnız Zil, Modüller hub'ında Profil + Zil, alt sayfada Geri, metinli öğe başlıkta), araçlar `.occlusion` bölgesinin altından, seçili sekme `mod.soft` / `mod.color`, yarı açık ders + SinoAI (simülatörde doğrulandı), yarı açık deneme + taslak (kodlandı, canlı denenmedi), dar ekranda gradyan kart içeriğe göre uzar.
  - **Kalan:** iç ekran şeridi (araçlar Zil + SinoAI; yerler Modüller, açık modül, Profil; şu an 5 sekme), odak sayfalarında Kapat'ın şeride taşınması, SinoAI'nin dış ekranda alt sayfa olması (şu an gizleniyor), deneme alt çubuğunda 3 baloncuk, yarı açıkta ekran ekran öğe kaydırma.
- Dış ekranda sistem yüzeyleri (kilit ekranı, canlı etkinlik), iOS tarafından. mac-iphone.
- Mağaza görselleri: `magaza-gorselleri/{tr,en}/ios/iphone-duo-dis-ekran` (dik 1398 × 2034) ve `iphone-duo-ic-ekran` (2853 × 2007) 19 Kasım'da yeni ölçülerle yeniden üretildi. Yükleme Sosyal Medya Yönetimi'nde.
