# Profil, hesap ve abonelik · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Account.tsx` (profil ve hesap ekranları), `Screens/Web/Panel.tsx` (web profil, abonelik, ayarlar, ödeme), `Parts/Study.tsx` (`TodayCard` deneme süresi bitti hâli), `Screens/Mobile/Onboarding.tsx` (`OnbTrialScreen`), `Parts/Mobile.tsx`, `Parts/Shared.tsx`, `Parts/Web.tsx`
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).
Ortak durumlar (yükleniyor, boş, hata, çevrimdışı, form hatası, gönderiliyor): [11-Bildirim-Destek-Durumlar.md §4.6](11-Bildirim-Destek-Durumlar.md#46-ortak-durum-kalıpları-bütün-modüller). Burada yalnız bu ekranlara özgü hâller yazılır.

## 1. Modül özeti

- **Ne işe yarar:** öğrencinin hesabı, hedefi, aboneliği ve uygulama ayarları tek yerde. Ana işler: hedefi görmek ve değiştirmek, aboneliği görmek, paket almak ya da iptal yolunu bulmak, tema/dil/bildirim ayarı, şifre ve oturumlar, hesabı kapatmak, çıkış.
- **Bu bir modül değil, marka yüzeyidir.** `ModuleKey` yoktur; vurgu rengi marka turuncusudur (`useAccent()` modülsüz: `brand: true`). Profil, ödeme ve abonelik turuncu kalır (UIUX-Rehberi §0, Modul-Kimligi §1).
- **Renk jetonları** (`src/UIUX/Tokens.ts`, açık / koyu):

| Rol | Jeton | Açık | Koyu | Nerede |
|---|---|---|---|---|
| Marka rengi | `brand` | `#EA580C` | `#F97316` | logo, simge, açık anahtar (`Toggle`), okunmamış noktası |
| Düğme dolgusu | `action` | `#C2410C` | `#C2410C` | `Button tone="primary"`, kendi destek balonu; beyaz yazıyla 5,2:1 |
| Turuncu yazı | `brandDeep` | `#C2410C` | `#FB923C` | küçük turuncu bağlantı ("Fotoğrafı değiştir", "Okundu"), menü simgesi |
| Yumuşak dolgu | `brandSoft` | `#FFEDD5` | `#3B1D0C` | `Chip tone="brand"`, `Button tone="soft"` |
| Yıkama | `brandWash` | `#FFF7ED` | `#22150C` | menü satırı simge kutusu, deneme süresi bitti kartı |
| Hata | `error` / `errorSoft` / `errorInk` | `#DC2626` / `#FEE2E2` / `#B91C1C` | `#F87171` / `#3B1414` / `#F87171` | "Hesabımı kapat", oturum "Çıkış" çipi |
| Başarı | `success` / `successInk` | `#059669` / `#047857` | `#34D399` / `#34D399` | paket içeriği tikleri, indirim satırı, ödeme başarılı |

  - Modül saydam katmanları (wash %7, ikon kutusu %12, iz %16, kenar %24) bu ekranlarda kullanılmaz; yerlerini `brandWash`, `brandSoft` ve `line` alır. İstisna: kullanım çubuklarında ve bildirim satırında modülün kendi rengi (Akıllı Özet `#7C3AED`, SinoAI `#475569`), çünkü o modülü anlatır.
  - Abonelik kartı gradyanı (`linear-gradient(135deg, #EA580C, #F97316)`) iki temada aynıdır.
- **Mobil tab bar (Modul-Kimligi §6):** Profil kendi tab bar'ı olan bir modül değildir; her modülün **yuva 5**'idir. Etiket `Profil` / `Profile`, ikon `user`. Profil ana sayfası (`m-profil`, `m-profil-devam`) öğrencinin geldiği modülün tab bar'ını yuva 5 etkin olarak gösterir; çizimde Denemeler'in çubuğu: Denemeler · Denemelerim · Modüller · Sonuçlar · **Profil** (etkin hap o modülün `soft` tonunda). Profilin alt sayfalarında tab bar yoktur.
- **Web:** sol menüde Profil satırı yoktur. Profil üst çubuktaki kullanıcı alanından (ad, e-posta, avatar, aşağı ok) açılır: `/student/profil`. Sayfa altı sekmeli: Hesap · Hedefim · Abonelik · Bildirimler · Görünüm · Güvenlik. Ödeme: `/student/odeme`, `/student/odeme/basarili`, `/student/odeme/basarisiz`. Çıkış sol menünün en altında (`Çıkış yap`).

## 2. Ekran haritası

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-profil` | mobil | Profil | `ProfileMain` | `src/modules/profile/presentation/screens/ProfileMainScreen.tsx` | dolu (üst kısım) |
| `m-profil-devam` | mobil | Profil · alt bölüm | `ProfileMain` | aynı dosya (tek kaydırmalı sayfa) | dolu (aşağı kaydırılmış) |
| `w-panel-profil` | web | Profil (Hesap sekmesi) | `/student/profil` | `src/features/student-profile/pages/StudentProfilePage.tsx` (`#hesap`) | dolu |
| `m-profil-bilgiler` | mobil | Kişisel bilgiler | `ProfileUserInfo / ProfileEdit` | `ProfileUserInfoScreen.tsx` (salt okunur) + `ProfileEditScreen.tsx` (düzenleme) | düzenleme, alan odakta |
| `m-profil-hedef` | mobil | Hedefim | `ProfileAcademic` | `ProfileAcademicScreen.tsx` | dolu |
| — | web | Profil · Hedefim sekmesi | `/student/profil#hedefim` | `AcademicProfileCard.tsx` | çizim yok (`w-panel-profil` sağ sütununda özet var) |
| `m-profil-abonelik` | mobil | Aboneliğim | `ProfileMySubscriptions` | `ProfileMySubscriptionsScreen.tsx` | aktif abonelik |
| `w-panel-abonelik` | web | Profil · abonelik | `/student/profil` (`#abonelik`) | `SubscriptionsCard.tsx`, `SubscriptionOrdersCard.tsx` | aktif abonelik |
| `m-profil-paketler` | mobil | Paketler | `ProfileAvailablePackages` | `ProfileAvailablePackagesScreen.tsx` → `components/ProfileSubscriptionPackagesView.tsx` | yıllık seçili |
| `w-panel-odeme` | web | Ödeme | `/student/odeme` | `src/features/payments/pages/PaymentCheckoutPage.tsx` | kart adımı |
| `w-panel-odeme-basarili` | web | Ödeme başarılı | `/student/odeme/basarili` | `PaymentResultPage.tsx` | başarı |
| `w-panel-odeme-basarisiz` | web | Ödeme başarısız | `/student/odeme/basarisiz` | `PaymentResultPage.tsx` | hata |
| `m-profil-gorunum` | mobil | Görünüm | `ProfileAppearance` | `ProfileAppearanceScreen.tsx` | Sistem seçili |
| `m-profil-dil` | mobil | Dil | `ProfileLanguage` | `ProfileLanguageScreen.tsx` | Türkçe seçili |
| `w-panel-ayarlar` | web | Profil · bildirim ve görünüm | `/student/profil` (`#bildirimler`) | `StudentProfilePage.tsx` (Bildirimler sekmesi: `CommunicationPreferencesCard` + görünüm) | dolu |
| `m-profil-iletisim` | mobil | Bildirim ve iletişim | `ProfileCommunicationPreferences` | `ProfileCommunicationPreferencesScreen.tsx` | dolu |
| `m-bildirim-ayarlar` | mobil | Bildirim ayarları | `ProfileNotificationSettings` | `ProfileNotificationSettingsScreen.tsx` | tanım [11 · §4.3](11-Bildirim-Destek-Durumlar.md) |
| `m-profil-guvenlik` | mobil | Hesap güvenliği | `ProfileAccountSecurity` | `ProfileAccountSecurityScreen.tsx` | dolu |
| — | web | Profil · Güvenlik sekmesi | `/student/profil#guvenlik` | `StudentProfilePage.tsx` | çizim yok |
| `m-profil-kapat` | mobil | Hesabımı kapat | `ProfileAccountClosure` | `ProfileAccountClosureScreen.tsx` | onay öncesi |
| `m-hakkinda` | mobil | Hakkında | `ProfileAbout` | `ProfileAboutScreen.tsx` | dolu |
| `m-geri-bildirim` | mobil | Geri bildirimlerim | `FeedbackMy` | `src/modules/feedback/presentation/screens/FeedbackMyScreen.tsx` | dolu |
| `t-kalem-ayarlar` | tablet | Profil · Kalem ve çizim | `ProfilePenSettings` | `ProfilePenSettingsScreen.tsx` | tanım [Tablet-Kalem.md](../Tablet-Kalem.md) |

Abonelikle ilgili, başka belgede tanımlanan ama bu akışa giren ekranlar: `m-hub-abonelik-bitti`, `w-panel-anasayfa-abonelik-bitti`, `t-hub-abonelik-bitti` (ana ekran, `TodayCard state="expired"`), `m-onb-7-deneme` (3 gün ücretsiz), `w-onb-6-paket` (web paket seçimi), `m-ders-hak` (Dersler'de günlük hak alt sayfası).

Bugünkü kod yolları mobilde `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\profile\presentation\screens\`, webde `C:\Users\onurc\source\repos\sinavika_frontend_student\src\features\` altındadır (tabloda kısaltıldı).

## 3. Süreçler (akışlar)

### 3.1 Profili açma
1. Mobil: herhangi bir modülde tab bar yuva 5 `Profil` → `m-profil` [sekme değişimi, animasyon yok, `selection` titreşimi]. Ana ekrandan (`m-hub-moduller`) üst soldaki kişi simgesi → `m-profil` [push].
2. `GET StudentAuth/me` (ad, e-posta, abonelikler) ve `engagement/today` (seri, dakika, görev). Önbellek varsa içerik hemen görünür, arkada yenilenir.
3. Hata: kart yerine ortak hata kalıbı; çekip yenileme ile tekrar.
4. Web: üst çubuktaki kullanıcı alanı → `/student/profil` (`#hesap`). Sekme değişimi adresin `#` kısmını değiştirir (`#hesap`, `#hedefim`, `#abonelik`, `#bildirimler`, `#gorunum`, `#guvenlik`); geri tuşu sayfadan çıkar, sekmeler arasında gezmez (`history.replaceState`). Eski bağlantılar (`#profile`, `#akademi`, `#siparisler`, `#iletisim`) yeni sekmelere düşer.

### 3.2 Kişisel bilgileri düzenleme
1. `m-profil` → `Kişisel bilgiler` satırı → `m-profil-bilgiler` [push].
2. Alanlar düzenlenir; `Kaydet` → `PUT StudentAuth/profile` (ad, soyad, telefon). Düğme gönderirken `loading` ve kilitli.
3. Başarı: kısa bildirim (toast) "Bilgilerin güncellendi." ve `m-profil`'e geri [pop]. Hata: alanın altında alan hatası; genel hata için toast kullanılmaz, ekranın üstünde hata satırı.
4. Kaydedilmemiş değişiklikle geri: "Değişiklikler kaydedilmedi" onayı sorulur (çizimde yok, doğrulanmadı).
5. E-posta bu ekrandan değiştirilmez (bugünkü kural: "E-posta değişikliği ileride ayrı doğrulama ile eklenecek").
6. Web: Hesap sekmesindeki `Hesap bilgileri` kartı aynı alanlar; `Profili düzenle` düğmesi alanları düzenlenebilir yapar (bugünkü kod: başka sekmedeyken Hesap sekmesine geçirir).

### 3.3 Hedefi değiştirme
1. `m-profil` → `Hedefim` → `m-profil-hedef` [push].
2. Satıra dokunma → seçim alt sayfası [sheet]: sınav, puan türü, hedef net, hedef bölüm, tempo (alt sayfalar çizilmedi; seçim kalıbı onboarding ekranlarıyla aynı: koyu çerçeve ve tik).
3. `Kaydet ve planı güncelle` → hedef kaydı (`StudentProfile/category`, `StudentProfile/education`; hedef net ve tempo alanları API'de doğrulanmalı) → Ders Planı yarından itibaren yeniden kurulur (study-plan yeniden oluşturma ucu doğrulanmalı).
4. Başarı: toast ve geri. Hata: ekranda kalır, alanlar korunur.

### 3.4 Aboneliği görme ve iptal yolu
1. `m-profil` → `Aboneliğim` → `m-profil-abonelik` [push].
2. Mobil iptal: alt alandaki `Nasıl?` bağlantısı **tek dokunuşla** mağazanın abonelik yönetim sayfasını açar (iOS App Store abonelikleri, Android Google Play abonelikleri). Sınavika uygulaması mağaza aboneliğini kendisi iptal etmez.
3. Web'den alınmış abonelik mobilde gösterilir ama yönetilemez: "Bu abonelik web’den alındı ve yalnız oradan yönetilir…" notu (bugünkü katalog `webManagedHint`).
4. Web iptal: `w-panel-abonelik` → `Aboneliği iptal et` → onay penceresi (çizilmedi) → `POST StudentSubscription/{id}/cancel-renewal` → kart "İptal · dönem sonuna kadar" durumuna geçer; dönem sonuna kadar her şey açık. Geri alma `POST StudentSubscription/{id}/resume-renewal`.

### 3.5 Mobil paket alma (mağaza)
1. Girişler: `m-profil-abonelik` → `Paketleri karşılaştır`; `m-profil` → Aboneliğim; ana ekran deneme süresi bitti kartı `Paketleri gör`; modül hak alt sayfası (`m-ders-hak`); `subscription` bildirimi. Hepsi → `m-profil-paketler` [push; hak alt sayfasından modal].
2. Dönem seçimi (`Segmented`: Aylık · Yıllık · 2 ay hediye) → paket kartı seçimi.
3. `3 gün ücretsiz başla` (deneme hakkı yoksa `Premium'a geç` / paket adıyla) → `POST StudentSubscriptionPackageMobile/purchase-eligibility` → mağazanın kendi satın alma penceresi (sistem) → `POST StudentSubscriptionPackageMobile/store-verify-purchase`.
4. Başarı: erişim açılır, `StudentAuth/access-status` yenilenir, öğrenci geldiği ekrana döner (hak alt sayfasından geldiyse o içeriğe). Toast: "“YKS Yıllık” etkinleştirildi."
5. Hata dalları (bugünkü katalogdan): mağazaya bağlanılamadı; ebeveyn onayı bekleniyor; ödeme alındı ama hesaba yansımadı → `Geri yüklemeyi dene`; abonelik başka hesapta → o hesapla giriş; zaten aktif abonelik → satın alma kapalı, bilgi satırı. Öğrenci mağaza penceresini kapatırsa hiçbir şey değişmez, hata gösterilmez.
6. Mağaza alımını geri yükle: `POST StudentSubscriptionPackageMobile/store-restore-purchases` → "Satın alımlar hesabına bağlandı." ya da "Geri yüklenecek satın alma bulunamadı."

### 3.6 Deneme süresi ve erişim
- 3 günlük deneme yalnız mobil mağazada. Üç tarih her yerde açık: **Bugün** (her şey açılır) · **2. gün** (bitişi hatırlatırız) · **3. gün** (ücret; öncesinde iptal edersen ücret yok). Alt satır biçimi: `Bugün ödeme yok · 2. gün hatırlatma · 3. gün ücret` / `No charge today · reminder on day 2 · charged day 3`. Gün sayıları mağazanın deneme süresinden hesaplanır (hatırlatma günü = ücret günü − 1).
- Deneme ya da abonelik bitince erişim yoktur; ilerleme korunur. Ana ekranda `TodayCard` "3 günlük deneme süren bitti" kartı: `Paketleri gör` ve `Mağaza aboneliğini geri yükle`.
- Kota somut yazılır: "Akıllı Özet 7 / 30", "SinoAI üretim 4 / 20".
- Web'de deneme süresi yoktur: paket seçilir, kartla ödenir.

### 3.7 Web ödeme
1. Girişler: site `/corporate/packages` (`s-paketler`), web onboarding `Ödemeye geç` (`w-onb-6-paket`), `w-panel-abonelik` → `Paketi değiştir`, `Subscription`/`Payment` bildirimi. Hepsi → `/student/odeme?packageId=…` (isteğe bağlı kupon parametresi) [sayfa geçişi].
2. Sipariş özeti: `GET StudentSubscription/order-summary` (paket, kupon, toplam).
3. Kupon girilir → özet yeniden hesaplanır (indirim satırı yeşil).
4. Telefon yoksa önce telefon istenir (`PUT StudentAuth/profile`, bugünkü kod).
5. `₺2.691 öde` → `POST StudentSubscription/purchase` → güvenli ödeme sayfası (PayTR, 3D Secure) → sonuç.
6. Sonuç: `GET StudentPayment/{paymentId}/result` → `/student/odeme/basarili` (`w-panel-odeme-basarili`) ya da `/student/odeme/basarisiz` (`w-panel-odeme-basarisiz`). Banka henüz dönmediyse "bekleniyor" hâli: aralıklı yeniden sorma, `Tekrar kontrol et` ve `Destek` (bugünkü kodda var, çizilmedi).
7. Geri tuşu ödeme sırasında: ödeme başlamadıysa paketlere döner; başladıysa sonuç sayfası `paymentId` ile durumu yeniden sorar, ikinci ödeme başlatmaz.

### 3.8 Şifre ve oturumlar
1. `m-profil-devam` → `Hesap güvenliği` → `m-profil-guvenlik` [push].
2. `Şifreni belirle ya da değiştir` → şifre ekranı [push] (çizilmedi). Şifresi olmayan (Apple/Google/kodla giren) öğrenci şifre **ekler**: yeni şifre ve tekrarı. Şifresi olan değiştirir: mevcut, yeni, tekrar → `POST StudentAuth/change-password`. Kurallar (bugünkü katalog): en az 6 karakter, yeni ≠ mevcut, tekrar eşleşir.
3. `E-posta ile kodla giriş` anahtarı: açık/kapalı (API alanı doğrulanmalı).
4. `Apple hesabı · Bağlı`, `Google hesabı · Bağla` → bağlama akışı (Apple/Google girişi; uç doğrulanmalı).
5. Açık oturumlar: bu cihaz ("Bu cihaz · İstanbul", çıkış düğmesi yok) ve diğerleri; `Çıkış` çipi → onay → o oturum kapanır (uç API'de doğrulanmalı).
6. Web: Güvenlik sekmesi (çizilmedi). Bugün: şifre satırı `/student/forgot-password` bağlantısı ve hesap kapatma kartı.

### 3.9 Çıkış
1. `m-profil-devam` → `Çıkış yap` → onay penceresi: "Hesabından çıkmak istiyor musun?" · `Çıkış yap` (kırmızı) / `Vazgeç`.
2. Onay → oturum biter; bu cihazın push kaydı hesaptan ayrılır (`StudentNotificationMobile/devices/deactivate` var; çıkışta çağrıldığı doğrulanmadı) → karşılama `m-giris-karsilama` [replace; geri tuşu profile dönmez; hedef ekran doğrulanmadı].
3. Web: sol menü `Çıkış yap` → aynı onay → `/student/login` (onay penceresi çizilmedi).

### 3.10 Hesabı kapatma
1. `m-profil-devam` → `Hesabımı kapat` (kırmızı satır) → `m-profil-kapat` [push]. Web: Hesap sekmesi sağ sütun `İncele` → aynı içerik (web ekranı çizilmedi).
2. Ekran açılınca `GET StudentAuth/account/close-impact` (aktif abonelik, bağlı cihaz, Apple girişi var mı, geri açma süresi).
3. `Hesabımı kalıcı olarak kapat` → onay penceresi → Apple ile girilmiş hesapta iOS önce Apple doğrulaması ister → `POST StudentAuth/account/close` → oturum kapanır → `m-giris-karsilama` [replace].
4. `Vazgeç` (dolu düğme) → `m-profil` [pop]. Geri tuşu da vazgeçer.
5. Mağaza aboneliği hesap kapatınca durmaz; bu not ekranda her zaman görünür.

### 3.11 Tema, dil, iletişim
- Tema (`Açık` · `Koyu` · `Sistem`) ve dil seçimi **anında** uygulanır; kaydet düğmesi yoktur. Tema cihazda saklanır; dil cihazda saklanır ve hesaba yazılır (doğrulanmalı).
- Anahtarlar (`Toggle`) dokununca hemen kaydedilir: önce ekranda değişir, istek hata verirse eski hâline döner ve ekranın üstünde "Tercih kaydedilemedi. Tekrar dene." yazar. Bir anahtar kaydedilirken diğerleri kilitli (çift istek yok).

## 4. Ekranlar

Ortak profil çerçevesi (`ProfileFrame`, `Account.tsx`):
- `Phone` 390 × 844, düz `bg` (modül yıkaması yok).
- Ana sayfa: `AppHeader` varsayılan: solda profil simgesi (40 × 40, ikon 22), ortada `Logo` 24 yüksekliğinde, sağda zil ve kırmızı sayaç rozeti (`#DC2626`, 18 yükseklik, en az 18 genişlik, yazı 9,5 pt 800 beyaz). Yükseklik 52, yan boşluk 14.
- Alt sayfalar: `AppHeader left="back"` (40 × 40 yuvarlak kart düğme, kenar `line`), ortada başlık `section` (17/23/800), sağda 40 px boşluk (zil yok). Tab bar yok; içerik alt boşluğu 20.
- İçerik alanı (`Content`): yan boşluk 18, üst 4; tab bar varken alt boşluk 108 (son satır yüzen çubuğun altına girmez), yokken 20.
- `BottomBar`: boşluk 12 / 18 / 34, öğeler arası 10; `border` varsa üstte `line2` çizgi ve `card` zemin.
- `MenuRow` (profil menü satırı): satır boşluğu 12 × 14, aralık 12; solda 36 × 36 köşe 12 simge kutusu (`brandWash` zemin, simge 18 `brandDeep`); başlık `headline` (15/20/700) `ink`, alt yazı `small` (13/18/500) `muted`; sağda `right` ok 18 `subtle`. Tehlikeli satır: kutu `errorSoft`, simge ve başlık `error`.
- Grup başlığı: `Text role="over"` (12/16/800, büyük harf), `muted`.
- `List`: satırlar tek kartta (`Card` beyaz, 20 köşe, `line` kenar, `UI_SHADOW.card`), satırlar arası 1 px `line2`.

Web ortak çerçevesi (`Panel`, `Parts/Web.tsx`):
- Sol menü 260 px (`card` zemin, sağda `line`), üst çubuk 68 px, sayfa boşluğu 22 / 28 / 28, bloklar arası 18. Profil ve ödeme sayfalarında sol menüde etkin satır yoktur (`active="profile"`); sayfa zemini `bg`, yıkama yok.
- Profil başlığı (`ProfileHead`): avatar 64, ad `title` 26 pt, alt satır `small` 14 pt "e-posta · sınav · hedef", sağda `Button tone="ghost"` `edit` simgeli `Profili düzenle` / `Edit profile`.
- Profil sekmeleri (`ProfileTabs`): alt çizgili sıra (`line` 1 px); her sekme yükseklik 44, yan boşluk 14, simge 16 + `headline` 14 pt; etkin sekme `ink` yazı ve 2,5 px `ink` alt çizgi, diğerleri `muted`. Sekmeler: `Hesap`/`Account` (`user`), `Hedefim`/`Goal` (`target`), `Abonelik`/`Plan` (`card`), `Bildirimler`/`Notifications` (`bell`), `Görünüm`/`Appearance` (`moon`), `Güvenlik`/`Security` (`shield`).
- Web'de gövde, küçük ve meta yazılar mobilden 1 pt büyüktür (UIUX-Rehberi §3).

### `m-profil` Profil · web: `w-panel-profil`

- **Görseller:** `acik/mobil/m-profil.png`, `koyu/mobil/m-profil.png`, `en/acik/mobil/m-profil.png`; web `acik/web-panel/w-panel-profil.png`, `koyu/web-panel/w-panel-profil.png`, `en/acik/web-panel/w-panel-profil.png`
- **Çerçeve:** `AppHeader` (profil · logo · zil); öğrencinin geldiği modülün tab bar'ı, yuva 5 `Profil` etkin; alt düğme alanı yok; düz zemin. Sayfa tek kaydırmalıdır; `m-profil-devam` aynı sayfanın aşağısıdır.
- **Yerleşim (yukarıdan aşağı), mobil, bloklar arası 12:**
  1. Kimlik kartı: `Card` boşluk 16; satır aralığı 14. `Avatar` 60 (baş harfler, gri gradyan `#64748B → #334155`, yazı 0,36 × boy, 800). Sağda: ad `section` ("Ayşe Yılmaz", veriden `name surname`); `small` "YKS · Sayısal · hedef 78 net" / "YKS · Science · goal 78" (sınav · puan türü · hedef net, veriden); `Chip tone="brand" size="sm" icon="star"` "YKS Aylık · 12 Kasım’a kadar" / "YKS Monthly · until 12 Nov" (aktif paket adı ve bitiş tarihi). Aktif abonelik yoksa çip gösterilmez.
  2. Üç ölçü kartı: 3 sütun ızgara, aralık 8; her biri `Card` boşluk 12, ortalı, aralık 3: simge 18 `#EA580C`, değer `section`, etiket `meta`. Değerler: `flame` "5" / `gün seri` · `day streak`; `clock` "42 sa" / "42 h" `bu ay` · `this month`; `exam` "6" / `deneme` · `exams`. Sıfır değer "0" diye yazılmaz: "—" ya da ölçü gizlenir (UIUX-Rehberi §5.5).
  3. `over` `Hesabım` / `Account` + `List`: `target` `Hedefim`/`My goal` alt "YKS · 78 net · günde 3 saat" / "YKS · 78 · 3 h a day"; `user` `Kişisel bilgiler`/`Personal details` alt `Ad, e-posta, telefon`/`Name, e-mail, phone`; `card` `Aboneliğim`/`My plan` alt paket adı ("YKS Aylık").
  4. `over` `Uygulama` / `App` + `List`: `moon` `Görünüm`/`Appearance` alt seçili tema (`Sistem`/`System`); `language` `Dil`/`Language` alt `Türkçe`/`Turkish`; `bell` `Bildirimler`/`Notifications` (alt yazı yok). Çizimde son satır sığmadığı için görünmez; uygulamada sayfa kayar.
- **Web (`w-panel-profil`):** `ProfileHead`, `ProfileTabs` (Hesap etkin), iki eşit sütun (`Grid 1fr 1fr`, aralık 18):
  - Sol `WCard` `Hesap bilgileri`/`Account details`: ad + soyad yan yana (aralık 12), `E-posta` (`mail`, ipucu `Doğrulandı`/`Verified`), `Telefon` (`phone`, maskeli "+90 5•• ••• •• 21"), `Dil` (`language`, "Türkçe"). Alanlar `Field` (50 yükseklik, 16 köşe, 1,5 kenar `line`, yazı 16 pt).
  - Sağ: `WCard` `Hedefim`/`My goal`, sağ üstte `Değiştir`/`Change` bağlantısı → Hedefim sekmesi; içinde `List`: `grad` Sınav "YKS · TYT + AYT", `target` Hedef net "78", `clock` Tempo "Dengeli · günde 3 saat" (oksuz). Altında `WCard`: 40 px kırmızı `trash` kutusu (`errorSoft`), `Hesabımı kapat`/`Close my account`, `Silinecekleri önce gösteririz.`/`We show what will be deleted first.`, `Button tone="ghost" size="sm"` `İncele`/`Review`.
- **Veri:** `GET StudentAuth/me` (ad, soyad, e-posta, telefon, `subscriptions[]`: `packageName`, `status`, `expiresAt`); seri ve süre `engagement/today` (`study.currentStreakDays`, dakika); "bu ay saat" ve "deneme sayısı" için `statistics` (aylık süre ve deneme sayısı alanları API'de doğrulanmalı); hedef `StudentProfile/category/me`.
- **Etkileşimler:**
  - Kimlik kartı → dokunulmaz (çizimde ok yok).
  - Ölçü kartları → `m-istatistik` [push] (çizimde ok yok; doğrulanmadı).
  - `Hedefim` → `m-profil-hedef` [push]; `Kişisel bilgiler` → `m-profil-bilgiler`; `Aboneliğim` → `m-profil-abonelik`; `Görünüm` → `m-profil-gorunum`; `Dil` → `m-profil-dil`; `Bildirimler` → `m-bildirim-ayarlar`. Hepsi push, `UI_MOTION.duration.screen` 280 ms.
  - Zil → `m-bildirimler` [push]. Profil simgesi ana sayfadayken bir şey yapmaz (zaten profil).
  - Çekip yenileme: içerik yerinde kalır, üstte küçük gösterge.
- **Hâller:** ilk yükleme: kartların yerinde ortada `LoadingLogo`; hata: ortak hata kalıbı ("Profil özeti yüklenemedi. Tekrar dene."). Misafir (hesapsız) öğrenci: kimlik kartı yerine "Misafir oturum" ve hesap isteyen kısa kart; menüde yalnız Paketler, Uygulama ve Destek grupları (bugünkü kod; çizilmedi).
- **Kurallar:** "Daha fazla" sekmesi yoktur; Hakkında, Destek, güvenlik burada. Profil sayfasında turuncu marka rengidir; geldiği modülün rengi yalnız tab bar'da kalır.

### `m-profil-devam` Profil · alt bölüm

- **Görseller:** `acik/mobil/m-profil-devam.png`, `koyu/mobil/m-profil-devam.png`, `en/acik/mobil/m-profil-devam.png`
- **Çerçeve:** `m-profil` ile aynı (aşağı kaydırılmış).
- **Yerleşim:**
  1. `over` `Güvenlik`/`Security` + `List`: `shield` `Hesap güvenliği`/`Account security` alt `Şifre, oturumlar`/`Password, sessions`; `mail` `İletişim tercihleri`/`Communication` alt `E-posta ve SMS izinleri`/`E-mail and SMS consent`.
  2. `over` `Yardım`/`Help` + `List`: `headset` `Destek`/`Support` alt "2 açık talep" / "2 open requests" (açık talep sayısı, `StudentSupport/my-tickets`); `star` `Geri bildirimlerim`/`My feedback`; `info` `Hakkında`/`About` alt "Sürüm 3.4.0" / "Version 3.4.0".
  3. Başlıksız `List`: `logout` `Çıkış yap`/`Sign out`; `trash` `Hesabımı kapat`/`Close my account` (tehlikeli satır, kırmızı).
- **Etkileşimler:** `Hesap güvenliği` → `m-profil-guvenlik`; `İletişim tercihleri` → `m-profil-iletisim`; `Destek` → `m-destek` [push]; `Geri bildirimlerim` → `m-geri-bildirim`; `Hakkında` → `m-hakkinda`; `Çıkış yap` → §3.9 onay; `Hesabımı kapat` → `m-profil-kapat`.
- **Kurallar:** Çıkış ve hesap kapatma en altta, ayrı kartta; yanlışlıkla dokunmaya karşı ikisi de onay ister.

### `m-profil-bilgiler` Kişisel bilgiler · web: `w-panel-profil` (Hesap kartı)

- **Görseller:** `acik/mobil/m-profil-bilgiler.png`, `koyu/mobil/m-profil-bilgiler.png`, `en/acik/mobil/m-profil-bilgiler.png`
- **Çerçeve:** geri + `Kişisel bilgiler`/`Personal details`; tab bar yok; `BottomBar` içinde `Button size="lg" block` `Kaydet`/`Save` (`action` dolgu, 54 yükseklik, tam yuvarlak).
- **Yerleşim (aralık 12):**
  1. Ortalı blok (üst-alt 6, aralık 8): `Avatar` 84; altında `small` 700 `brandDeep` `Fotoğrafı değiştir`/`Change photo`.
  2. İki sütun (aralık 10): `Field` `Ad`/`First name` "Ayşe", `Soyad`/`Last name` "Yılmaz".
  3. `Field` `E-posta`/`E-mail` (`mail` simgesi), altında ipucu `Doğrulandı`/`Verified` (`meta`, `muted`). Salt okunur.
  4. `Field` `Telefon`/`Phone` (`phone`), çizimde odakta: kenar `brand`, 4 px dış halka `brand` %10.
  5. `Field` `Doğum yılı`/`Birth year` "2008".
- **Veri:** `GET StudentAuth/me`; kayıt `PUT StudentAuth/profile` (`name`, `surname`, `phone`; doğum yılı ve fotoğraf alanları API'de doğrulanmalı).
- **Etkileşimler:** `Fotoğrafı değiştir` → sistem seçicisi (kamera/galeri) [sistem sayfası]; izin reddinde ayarlara yönlendiren kısa not. Alanlar: doğru klavye (telefon: sayı, e-posta: e-posta), otomatik doldurma (ad, telefon). `Kaydet` → §3.2.
- **Hâller:** gönderiliyor (`Button loading`), alan hatası (ortak kalıp), kaydedildi (toast 3–5 sn).
- **Kurallar:** doğrulama alandan çıkınca yapılır, yazarken değil. Klavye açıkken `Kaydet` klavyenin üstünde kalır.

### `m-profil-hedef` Hedefim · web: `w-panel-profil` (Hedefim kartı), Hedefim sekmesi

- **Görseller:** `acik/mobil/m-profil-hedef.png`, `koyu/mobil/m-profil-hedef.png`, `en/acik/mobil/m-profil-hedef.png`
- **Çerçeve:** geri + `Hedefim`/`My goal`; tab bar yok; `BottomBar` `Kaydet ve planı güncelle`/`Save and update plan` (lg, block, `action`).
- **Yerleşim:**
  1. `List` (`ListRow plainIcon`: 38 px gri kutu `line2`, simge `ink2`): `grad` `Sınav`/`Exam` "YKS · TYT + AYT"; `layers` `Puan türü`/`Score type` "Sayısal"/"Science"; `target` `Hedef net`/`Target score` "78"; `pin` `Hedef bölüm`/`Target programme` "Bilgisayar Mühendisliği · İstanbul"; `clock` `Tempo`/`Pace` "Dengeli · 3 saat · 6 gün" / "Balanced · 3 h · 6 days". Her satırda sağ ok.
  2. `Card tone="soft"` (zemin `line2`, boşluk 14): `small` "Hedefini değiştirirsen Ders Planı bir sonraki günden itibaren yeniden kurulur." / "Changing your goal rebuilds your plan from tomorrow."
- **Veri:** `StudentProfile/category/me` (sınav, alt sınav/oturum), `StudentProfile/education/me`; hedef net, hedef bölüm ve tempo onboarding cevaplarından (alanlar API'de doğrulanmalı).
- **Etkileşimler:** satır → seçim alt sayfası [sheet, 320 ms, parmağı izler, %45 ya da hızlı fiskeyle kapanır]; seçili seçenek koyu çerçeve ve tik. `Kaydet ve planı güncelle` → §3.3. Değişiklik yoksa düğme `disabled`.
- **Web farkı:** Hesap sekmesinde yalnız özet (3 satır, oksuz) ve `Değiştir`; düzenleme Hedefim sekmesinde (sekme çizilmedi; aynı satırlar iki sütunda).
- **Kurallar:** hedef değişince plan yarından yeniden kurulur; bugünkü görevler bozulmaz.

### `m-profil-abonelik` Aboneliğim · web: `w-panel-abonelik`

- **Görseller:** `acik/mobil/m-profil-abonelik.png`, `koyu/mobil/m-profil-abonelik.png`, `en/acik/mobil/m-profil-abonelik.png`; web `acik/web-panel/w-panel-abonelik.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Aboneliğim`/`My plan`; tab bar yok; `BottomBar` iki satır.
- **Yerleşim (aralık 12):**
  1. Paket kartı: köşe 26, boşluk 20, zemin `linear-gradient(135deg, #EA580C, #F97316)`. `over` `Aktif paket`/`Active plan` (beyaz %85); `hero` (26/32/800) beyaz "YKS Aylık"/"YKS Monthly"; `small` beyaz %90 "12 Kasım’da ₺299 ile yenilenir · App Store" / "Renews 12 Nov for ₺299 · App Store" (yenilenme tarihi, fiyat, kanal: App Store / Google Play / Web).
  2. `SectionTitle` `Bu ay kullanım`/`Usage this month` + `Card` boşluk 14, satırlar arası 12. Her satır: üstte ad (`small` 700 `ink`) ve sağda "7 / 30" (`small`); altında `Bar` 8 yükseklik, dolgu modülün rengi, iz `line2`. Satırlar: `Akıllı Özet` 7 / 30; `SinoAI üretim`/`SinoAI creations` 4 / 20.
  3. `SectionTitle` `Paketinde`/`Included` + liste (aralık 8): her satırda `checkCircle` 18 `success` ve `body` `ink`: "Tüm denemeler ve Türkiye sıralaması", "Dersler, Testler, Bilgi Kartları", "Ders Planı ve ilerleme", "Akıllı Özet · ayda 30", "SinoAI · sınırsız sohbet" (EN: "All exams and national ranking", "Lessons, quizzes, flashcards", "Study plan and progress", "Smart Summary · 30 a month", "SinoAI · unlimited chat").
  4. `BottomBar`: `Button tone="soft" size="lg" block` `Paketleri karşılaştır`/`Compare plans` (`brandSoft` zemin, `brandDeep` yazı); altında ortalı `small` "İptal ve iade App Store ayarlarından yapılır." / "Cancel and refunds are in App Store settings." ve koyu bağlantı `Nasıl?`/`How?`. Android'de "Google Play".
- **Web (`w-panel-abonelik`):** `ProfileHead`, sekme `Abonelik` etkin; `Grid 1.1fr 1fr`:
  - Sol: aynı gradyan kart (köşe 26, boşluk 24; başlık `title` 30 pt): "12 Kasım’da ₺299 ile yenilenir · kartla ödeme"; içinde iki düğme (aralık 10, üstten 14): `Button tone="white" size="sm"` `Paketi değiştir`/`Change plan`, `Button tone="glass" size="sm"` `Faturalar`/`Invoices`. Altında `WCard` `Kullanım · Ekim`/`Usage · October` (aynı iki çubuk, aralık 14).
  - Sağ: `WCard` `Faturalar`/`Invoices`: `List`, satır `file` simgesi, başlık tarih ("12 Ekim 2026"), alt "YKS Aylık · ödendi", sağda tutar `headline` "₺299". Altında `small` "Aboneliği iptal etmek mi istiyorsun? Dönem sonuna kadar her şey açık kalır." ve `Button tone="ghost" size="sm"` `Aboneliği iptal et`/`Cancel subscription`.
- **Veri:** mobil `StudentAuth/me.subscriptions[]`, `StudentSubscriptionPackageMobile/store-subscription-status` (yenilenme, iptal bekliyor, askıda), kota `StudentAiUsage` (bugünkü `StudentAiUsageMeter`; uç adı doğrulanmalı). Web `StudentSubscription/my-subscriptions`, `StudentSubscription/orders`, fatura `StudentSubscription/orders/{orderId}/invoice`.
- **Etkileşimler:** `Paketleri karşılaştır` → `m-profil-paketler` [push]. `Nasıl?` → mağaza abonelik sayfası (tek dokunuş, dış bağlantı). Web `Paketi değiştir` → paket seçimi → `/student/odeme?packageId=` ; `Faturalar` → fatura listesine kaydırır / fatura satırı → PDF (yeni sekme); `Aboneliği iptal et` → onay → §3.4.
- **Hâller:** iptal edilmiş (dönem sonuna kadar): kart alt satırı "İptal · 14 Kasım’a kadar açık", düğme `Aboneliği sürdür`; ödeme güncelleniyor/askıda: uyarı satırı (`warningSoft`); aktif abonelik yok: ortak boş kalıp "Henüz aboneliğin yok" + `Paketleri gör`; web'den alınmış (mobilde): `Nasıl?` yerine "web’den yönetilir" notu. Bu hâller çizilmedi; metinler bugünkü katalogdan.
- **Kurallar:** iptal yolu bir dokunuşla bulunur. Kota sayı olarak yazılır ("7 / 30"), yüzde değil. Kilit simgesi yerine açıklayıcı paket kartı.

### `m-profil-paketler` Paketler

- **Görseller:** `acik/mobil/m-profil-paketler.png`, `koyu/mobil/m-profil-paketler.png`, `en/acik/mobil/m-profil-paketler.png`
- **Çerçeve:** geri + `Paketler`/`Plans`; tab bar yok; `BottomBar` ana düğme ve deneme takvimi satırı.
- **Yerleşim (aralık 12):**
  1. Başlık bloğu (aralık 6): `hero` "Hedefine uygun paketi seç" / "Pick the plan for your goal"; `small` "Tüm paketlerde 3 gün ücretsiz. İstediğin an iptal." / "3 days free on every plan. Cancel any time."
  2. `Segmented` (zemin `line2`, 4 iç boşluk, seçenek 34 yükseklik, 13 pt 700; seçili beyaz kart + hafif gölge, `ink` yazı): `Aylık`/`Monthly` · `Yıllık · 2 ay hediye`/`Yearly · 2 months free` (yıllık seçili).
  3. Paket kartları (her biri satır, aralık 12, boşluk 16, köşe 20, zemin `card`): solda 22 px radyo (seçili: 7 px `ink` kenar; değil: 2 px `line`); ortada ad `headline` + isteğe bağlı `Chip tone="brand" size="sm"` ("2 ay hediye"), altında `small` dönem açıklaması; sağda fiyat `section`. Seçili kart kenarı 2 px `ink`, diğerleri 1,5 px `line`. Örnek: "YKS Yıllık ₺249 /ay · yıllık ₺2.990" (seçili), "YKS Aylık ₺299 /ay", "KPSS Yıllık ₺229 /ay · yıllık ₺2.750".
  4. `Card tone="soft"` boşluk 14: `check` 16 `success` + `small` `ink`: "Tüm modüller ve denemeler", "Akıllı Özet · ayda 30", "SinoAI · sınırsız", "Reklamsız".
  5. Ortalı bağlantı `small` 700 `brandDeep`: "Satın alımı geri yükle" / "Restore purchases" (17 Kasım 2026'da çizime eklendi).
  6. `BottomBar`: `Button size="lg" block` `3 gün ücretsiz başla`/`Start 3 free days`; altında ortalı `meta` "Bugün ödeme yok · 2. gün hatırlatma · 3. gün ücret" / "No charge today · reminder on day 2 · charged day 3".
- **Veri:** paketler `StudentSubscriptionPackageMobile` (öğrencinin sınav kategorisine göre) + mağaza fiyatı (StoreKit / Play Billing; fiyat ve para birimi mağazadan); uygunluk `purchase-eligibility`.
- **Etkileşimler:** `Segmented` → paketleri süzer (seçim korunur). Paket kartı → seçer (`optionSelect`: basılı 0,97 ölçek, `selection` titreşimi). Ana düğme → §3.5. Mağaza alımını geri yükle bağlantısı, Koşullar, Gizlilik ve Promosyon kodu bu ekranın altında bulunur (bkz. §7; çizimde yok).
- **Hâller:** paket yükleniyor (ortak), paket listesi boş ("Şu an paket yok" + yenile), satın alma engelli (aktif abonelik / bekleyen web ödemesi: bilgi satırı, düğme `disabled` "Bu paket satın alınamıyor"), deneme hakkı kullanılmış (düğme "Premium'a geç", takvim satırı yerine "Abonelik otomatik yenilenir; iptal mağaza abonelik ayarlarından yapılır.").
- **Kurallar:** deneme süresinin üç tarihi açık yazılır. Ödeme marka yüzeyidir: düğme her yerden açılsa da turuncu (`action`), modül renginde değil. Fiyatlar örnektir.

### `w-panel-odeme` Ödeme

- **Görseller:** `acik/web-panel/w-panel-odeme.png`, `koyu/web-panel/w-panel-odeme.png`, `en/acik/web-panel/w-panel-odeme.png`
- **Çerçeve:** `Panel`, üst çubukta iz `Ödeme`/`Checkout`; sayfa başlığı `title` 30 pt `Ödeme`/`Checkout`; `Grid 1.4fr 1fr`.
- **Yerleşim:**
  - Sol `WCard` `Kart bilgileri`/`Card details` (aralık 14): `Kart üzerindeki ad`/`Name on card`; `Kart numarası`/`Card number` (`card` simgesi, maskeli, odakta); iki sütun `Son kullanma`/`Expiry` "08 / 29" ve `CVC`; onay satırı: 22 px köşe 7 kutu (`ink` dolgu, beyaz tik) + `small` "Mesafeli satış sözleşmesini okudum ve onaylıyorum." / "I accept the distance sales agreement."; `Button size="lg" block icon="lock"` "₺2.691 öde" / "Pay ₺2,691"; ortalı `meta` "Ödeme 3D Secure ile güvenle alınır; kart bilgin Sınavika’da saklanmaz." / "Paid securely with 3D Secure; we do not store your card."
  - Sağ `WCard` `Sipariş özeti`/`Order summary` (aralık 12): paket satırı `headline` "YKS Yıllık … ₺2.990"; indirim satırı `small` "İndirim kodu: EKIM10" ve sağda `successInk` "−₺299"; 1 px `line` ayraç; `Toplam`/`Total` `section` "₺2.691"; `meta` "KDV dahil. 3 gün içinde koşulsuz iade." / "VAT included. Full refund within 3 days."
- **Veri:** `GET StudentSubscription/order-summary` (paket, kupon, indirim, toplam, para birimi); `POST StudentSubscription/purchase` (`subscriptionPackageId`, `couponCode`, `locale`) → `redirectUrl`, `paymentId`.
- **Etkileşimler:** sözleşme kutusu işaretlenmeden ödeme düğmesi `disabled`; sözleşme metni bağlantısı yeni pencerede. Ödeme düğmesi → `loading`, kilitli → güvenli ödeme adımı (§3.7). Klavye: alanlar arası Sekme, Enter ödemeyi başlatır (sözleşme işaretliyse).
- **Hâller:** paket yok/geçersiz (paketlere dönüş ve Profil › Abonelik), kupon geçersiz (kupon alanı hatası), ödeme başlatılamadı (sayfa üstünde hata, düğme yeniden etkin), bekleniyor (§3.7).
- **Kurallar:** tutar düğmenin içinde yazılır. Kart bilgisi Sınavika sunucusuna gelmez.

### `w-panel-odeme-basarili` Ödeme başarılı · `w-panel-odeme-basarisiz` Ödeme başarısız

- **Görseller:** `acik/web-panel/w-panel-odeme-basarili.png`, `…-basarisiz.png` (açık, koyu, `en/`)
- **Çerçeve:** `Panel`; içerik dikeyde ortalı. Başarılıda `Grid 1.15fr 1fr` aralık 28; başarısızda tek sütun ortalı.
- **Yerleşim:**
  - Sonuç simgesi: 96 × 96, köşe 32, zemin `success` (başarısız: `error`), beyaz `check` / `x` 48, gölge `0 20px 40px -18px` aynı rengin %60'ı.
  - Başlık `display` 36 pt: "Ödemen alındı, hoş geldin" / "Payment received, welcome aboard" · "Ödeme tamamlanamadı" / "Payment did not go through".
  - Metin `body` 17 pt, en çok 560 px: "YKS Yıllık paketin aktif. Faturan e-postana gönderildi. Tüm modüller açık." / "YKS Yearly is active. Invoice sent. Every module is open." · "Bankan işlemi onaylamadı. Kartından para çekilmedi. Başka bir kartla tekrar deneyebilirsin." / "Your bank declined it. You were not charged. Try another card."
  - Düğmeler (aralık 10, lg): başarılı `Planıma git`/`Go to my plan` (dolu) + `Faturayı gör`/`View invoice` (ghost); başarısız `Tekrar dene`/`Try again` (`refresh`, dolu) + `Destek`/`Support` (`headset`, ghost).
  - Başarılıda sağ `WCard` `Sırada ne var?`/`What’s next?`: üç satır (boşluk 12 × 14, köşe 16, `line` kenar): `Tile` 44 modül renginde + başlık + alt + ok: Ders Planı "Bugünkü planın hazır · 3 görev · 70 dk"; Denemeler "İlk Türkiye geneli denemen · Cumartesi 10:00 · TYT"; SinoAI "SinoAI ile soru çöz · Fotoğrafını çek, adım adım anlatsın". Altında `small` "Telefonda da aynı hesap: App Store ve Google Play’de Sınavika."
- **Veri:** `GET StudentPayment/{paymentId}/result` (durum, tutar, paket); fatura `orders/{orderId}/invoice`.
- **Etkileşimler:** `Planıma git` → `w-plan-bugun`; satırlar → ilgili modül sayfası (`w-plan-bugun`, `w-deneme-detay`, `w-sino-sohbet`); `Faturayı gör` → PDF yeni sekmede; `Tekrar dene` → `w-panel-odeme` aynı paketle; `Destek` → `w-panel-destek`.
- **Kurallar:** başarısız sayfası paranın çekilmediğini açıkça söyler. Başarı sayfası yeniden yüklenince ikinci kez sayım (analitik) yapılmaz.

### `m-profil-gorunum` Görünüm · `m-profil-dil` Dil · web: `w-panel-ayarlar` (Görünüm kartı)

- **Görseller:** `acik/mobil/m-profil-gorunum.png`, `acik/mobil/m-profil-dil.png` (açık, koyu, `en/`); web `w-panel-ayarlar.png`
- **Çerçeve:** geri + başlık; tab bar yok; alt düğme yok.
- **Görünüm yerleşimi (aralık 14):**
  1. Üç sütun (aralık 10): her seçenek önizleme kutusu 150 yükseklik, köşe 18, boşluk 10, kenar 2 px (seçili `ink`, değil `line`); içinde 34 px turuncu gradyan şerit (`#EA580C → #F59E0B`, köşe 8) ve iki 18 px kart şeridi. Altında `headline` 14 pt `ink`: `Açık`/`Light` (zemin `#F7F7F8`), `Koyu`/`Dark` (`#0F1115`), `Sistem`/`System` (yarı açık yarı koyu; seçili).
  2. `List`: `Modül renkleri`/`Module colours` alt `Her modül kendi renginde`/`Each module in its colour` + `Toggle` açık; `Hareketi azalt`/`Reduce motion` alt `Geçiş animasyonlarını kısaltır`/`Shortens transitions` + `Toggle` kapalı; `Yazı boyutu`/`Text size` alt `Sistem ayarı`/`System setting` + ok.
- **Dil yerleşimi:** `List` satırları ad + kod, sağda 22 px radyo: `Türkçe` `TR` (seçili), `English` `EN`, `Deutsch` `DE · yakında`, `Nederlands` `NL · yakında`. Altında `Card tone="soft"`: "Uygulama dilini değiştirmek ders ve deneme içeriklerini değiştirmez." / "Changing the app language does not change lessons or exams."
- **Web (`w-panel-ayarlar`):** sekme `Bildirimler` etkin; `Grid 1fr 1fr`: sol `WCard` `Bildirimler` (bkz. aşağı); sağ `WCard` `Görünüm`: üç seçenek (110 yükseklik, köşe 16), altında `List` yalnız `Modül renkleri` anahtarı.
- **Web bildirim kartı:** `List` + `Toggle`: `Günlük plan hatırlatması` "Her gün 08:30" (açık), `Seri hatırlatması` "Akşam, çalışmadıysan" (açık), `Sonuç ve çözümler` "Açıklanınca" (açık), `Kampanyalar` "Ayda en fazla 2" (kapalı).
- **Toggle:** 46 × 28, köşe 14; açık `brand` zemin, düğme 22 px beyaz sağda; kapalı `line` zemin. Dokunma alanı satırın tamamı (en az 44 pt).
- **Veri:** tema ve "hareketi azalt" cihazda; "Modül renkleri" saklama yeri doğrulanmalı; dil cihazda (hesaba yazılması doğrulanmalı). `Yazı boyutu` sistem ayarını açar.
- **Etkileşimler:** seçenek → anında uygulanır, `toggle` 180 ms geçiş. `Yazı boyutu` → sistem erişilebilirlik ayarı (dış). "yakında" diller dokunulamaz (`disabled`, ekran okuyucu "yakında" der).
- **Kurallar:** `Hareketi azalt` açıksa `UI_MOTION.reduced` (150 ms, yalnız solma). Seçili durum koyu çerçeve ve tik/radyo ile; dolgu rengi kullanılmaz.

### `m-profil-iletisim` Bildirim ve iletişim

- **Görseller:** `acik/mobil/m-profil-iletisim.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Bildirim ve iletişim`/`Notifications and contact`; tab bar yok.
- **Yerleşim (aralık 10):** üstte `small` "Seni yalnız işine yarayan şeyler için rahatsız ederiz." / "We only bother you for things that help." Üç grup; her biri `over` başlık (üstten 4) + `List` (`ListRow` + `Toggle`, oksuz):
  - `Çalışma`/`Study`: `Günlük plan hatırlatması` "Her gün 08:30" (açık); `Seri hatırlatması` "Akşam, o gün çalışmadıysan" (açık).
  - `Denemeler`/`Exams`: `Sonuç ve çözümler` "Açıklanınca hemen" (açık); `Yaklaşan deneme` "1 gün ve 1 saat önce" (açık).
  - `Pazarlama`/`Marketing`: `E-posta ile kampanyalar` "Ayda en fazla 2" (kapalı); `SMS` "Yalnız önemli duyurular" (kapalı).
- **Veri:** `GET/PUT StudentProfileNotification/me` (`AllowEmail`, `AllowWhatsApp`, `AllowPhone`, `ReminderEnabled`, `ReminderLocalTime`, `pushTypes`). Pazarlama izinleri `AllowEmail` / `AllowPhone`; SMS alanı API'de doğrulanmalı. `PUT` üç izin alanını birlikte ister (kısmi güncelleme yok).
- **Etkileşimler:** anahtar → §3.11.
- **Kurallar:** pazarlama izinleri varsayılan kapalıdır. Giriş ve doğrulama kodları izinden bağımsız gider.

### `m-profil-guvenlik` Hesap güvenliği

- **Görseller:** `acik/mobil/m-profil-guvenlik.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Hesap güvenliği`/`Account security`; tab bar yok.
- **Yerleşim (aralık 12):**
  1. `List` (`plainIcon`): `lock` `Şifreni belirle ya da değiştir`/`Set or change password` alt "Son değişiklik 3 ay önce" / "Changed 3 months ago" (şifre yoksa "Henüz şifren yok; kodla giriyorsun" — metin doğrulanmadı) + ok; `mail` `E-posta ile kodla giriş`/`Sign in with e-mail code` + `Toggle` açık; `apple` `Apple hesabı`/`Apple account` alt `Bağlı`/`Connected` + ok; `google` `Google hesabı`/`Google account` alt `Bağla`/`Connect` + ok.
  2. `SectionTitle` `Açık oturumlar`/`Active sessions` + `List`: `phone` "iPhone 15" alt "Bu cihaz · İstanbul" / "This device · Istanbul" (oksuz); `globe` "Chrome · Windows" alt "Dün 21:40" ve sağda `Chip tone="error" size="sm"` `Çıkış`/`Sign out`.
- **Veri:** `StudentAuth/me` (e-posta, giriş sağlayıcıları, şifre var mı); şifre `POST StudentAuth/change-password`; şifre yoksa sıfırlama `StudentAuth/forgot-password` + `reset-password`; oturum listesi ve kapatma ucu API'de doğrulanmalı.
- **Etkileşimler:** §3.8. `Çıkış` çipinin dokunma alanı 44 pt'ye genişletilir (görünür boy 24).
- **Hâller:** misafir: "Şifre değiştirmek için giriş yapmış bir hesap gerekir…" notu ve giriş düğmesi.
- **Kurallar:** her yerde "şifre" (parola değil). Şifre alanında göster/gizle. Bu cihazın oturumu buradan kapatılmaz (o iş `Çıkış yap`).

### `m-profil-kapat` Hesabımı kapat

- **Görseller:** `acik/mobil/m-profil-kapat.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Hesabımı kapat`/`Close my account`; tab bar yok; `BottomBar` iki düğme alt alta.
- **Yerleşim (aralık 12):**
  1. Başlık bloğu (aralık 6): `hero` `Gitmeden önce`/`Before you go`; `body` "30 gün içinde giriş yaparsan hesabın geri açılır. 30 gün sonra aşağıdakiler kalıcı olarak silinir." / "Sign in within 30 days and your account opens again. After 30 days the following are deleted for good."
  2. `Card` boşluk 6: dört satır (boşluk 11 × 10, aralarında `line2`): `x` 16 `error` + `small` `ink2`: "6 deneme sonucu ve analizler", "Ders Planı ve 42 saatlik geçmiş", "3 deste, 24 kayıtlı kart", "SinoAI sohbetleri ve kütüphane" (sayılar öğrencinin verisinden).
  3. `Card tone="soft"`: "Aktif aboneliğin App Store’dan ayrıca iptal edilmelidir; hesap kapatma ödemeyi durdurmaz." / "Cancel your App Store subscription separately; closing the account does not stop billing." (Android'de Google Play.)
  4. `BottomBar`: `Button tone="ghost" size="lg" block` `Hesabımı kalıcı olarak kapat`/`Permanently close my account` (yazı `error`, kenar `errorSoft`); `Button size="lg" block` `Vazgeç`/`Keep my account` (dolu `action`).
- **Veri:** `GET StudentAuth/account/close-impact`; `POST StudentAuth/account/close` (neden, not, Apple `authorizationCode`).
- **Etkileşimler:** §3.10. Kapatma düğmesine basınca sistem onay penceresi değil uygulamanın onay penceresi (kırmızı onay düğmesi, `Vazgeç`).
- **Hâller:** gönderiliyor (iki düğme kilitli), etki özeti yüklenemedi (sayılar yerine genel liste, ekran yine çalışır), Apple doğrulaması reddedildi (toast bilgi, ekranda kalır).
- **Kurallar:** güvenli seçenek dolu ve altta (başparmağa yakın); yıkıcı seçenek çerçeveli. Silinecekler sayıyla yazılır.

### `m-hakkinda` Hakkında

- **Görseller:** `acik/mobil/m-hakkinda.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Hakkında`/`About`; tab bar yok.
- **Yerleşim (aralık 14):** ortalı blok (üst-alt 20, aralık 8): `Tile` 72 dolu (`action` zemin, beyaz `grad` simgesi), `section` "Sınavika", `small` "Sürüm 3.4.0 (412)" / "Version 3.4.0 (412)" (uygulama sürümü ve derleme no). `List`: `Kullanım koşulları`/`Terms of use`, `Gizlilik politikası`/`Privacy policy`, `KVKK aydınlatma metni`/`Privacy notice`, `Açık kaynak lisansları`/`Open-source licences` (her biri ok). Altta ortalı `meta` "© 2026 Sınavika".
- **Etkileşimler:** yasal satırlar → uygulama içi tarayıcıda site sayfası (`/corporate/yasal/[slug]`, `s-yasal`); lisanslar → uygulama içi liste ekranı [push] (çizilmedi).

### `m-geri-bildirim` Geri bildirimlerim

- **Görseller:** `acik/mobil/m-geri-bildirim.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Geri bildirimlerim`/`My feedback`; tab bar yok.
- **Yerleşim:** `Card` boşluk 16: `section` "Sınavika’yı nasıl buluyorsun?" / "How do you like Sınavika?"; beş yıldız (30 px, aralık 8; dolu `#F59E0B`, boş `line`). `List` (modül renkli `Tile`): Dersler "Paragraf · Ana fikir dersi" alt "★★★★★ · “Çok net anlatım”"; Denemeler "TYT Deneme 4 · Soru 46" alt "Hata bildirimi · inceleniyor"; SinoAI "SinoAI yanıtı" alt "Faydalı olarak işaretlendi".
- **Veri:** geri bildirim geçmişi (bugünkü `feedbackStudentRepository`); uygulama puanı.
- **Etkileşimler:** yıldız → puan kaydı; 4–5 yıldızda mağaza değerlendirme penceresi (sistem; yılda sınırlı), 1–3 yıldızda kısa yazı alanı (çizilmedi, doğrulanmadı). Satır → ilgili içerik [push].
- **Kurallar:** yıldız dokunma alanı en az 44 pt (görünür 30).

## 5. Takılma ve kilitlenme önlemleri

- **Çift gönderim:** `Kaydet`, `Kaydet ve planı güncelle`, satın alma, geri yükleme, ödeme, hesap kapatma düğmeleri istek sürerken `loading` ve kilitli. Satın alma sırasında ikinci dokunuş mağaza penceresini ikinci kez açmaz.
- **Anahtarlar:** iyimser güncelleme; hata gelirse eski değere döner. Bir anahtar kaydedilirken diğerleri kilitli.
- **Mağaza satın alması yarıda kalırsa:** uygulama kapanıp açılınca bekleyen işlem `store-sync` ile tamamlanır; öğrenci yeniden ödemez. "Ödeme alındı ama hesaba yansımadı" hâlinde `Geri yüklemeyi dene` ve `Destek` her zaman görünür.
- **Web ödeme:** `paymentId` oturum deposunda saklanır; sonuç sayfası yenilense de ödemeyi yeniden başlatmaz, durumu sorar. Banka dönüşü gecikirse artan aralıkla sorulur, sonra "Tekrar kontrol et" ve `Destek`.
- **Zaman aşımı:** her istek zaman aşımında (okuma 25 sn, gönderim 60 sn; [Navigasyon](Navigasyon.md) §6.1) ortak hata hâline düşer ("Tekrar dene"); içerik görünüyorsa yerinde kalır.
- **Geri tuşu:** her alt sayfada çalışır. Ödeme ve hesap kapatma isteği sürerken geri tuşu isteği iptal etmez, ekranı da kapatmaz (istek bitene kadar kilit; en çok gönderim zaman aşımı, 60 sn).
- **Alt sayfalar** (hedef seçimi, onay pencereleri): aşağı çekerek, dışarı dokunarak ve geri tuşuyla kapanır; yıkıcı onay penceresi dışarı dokunmayla kapanır ama işlem yapmaz.
- **Çıkış sırasında** açık onay penceresi kapanmadan oturum bitirilmez (bugünkü kod: kapanış sonrası çalışır; abonelik kapısıyla çakışıp siyah ekran kalmasın).
- **Uzun liste:** fatura ve abonelik geçmişi sayfalı; 20'den fazla satırda sanal liste.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | mobil | `m-profil` | Denemeler'den yuva 5'e dokun; ekran görüntüsünü `acik/mobil/m-profil.png` ile karşılaştır | Logo ortada, Denemeler çubuğu, Profil hapı etkin; kimlik kartı, üç ölçü, Hesabım ve Uygulama grupları aynı sırada |
| 2 | birim | ikisi | `m-profil` | Seri 0, dakika 0 ile çiz | "0" yazılmaz (— ya da gizli) |
| 3 | e2e | mobil | `m-profil-bilgiler` | Telefonu değiştir, `Kaydet`'e iki kez hızlı dokun | Tek `PUT StudentAuth/profile`; toast; profile dönüş |
| 4 | bileşen | mobil | `m-profil-bilgiler` | Geçersiz telefon gir, alandan çık | Alanın altında uyarı simgeli alan hatası; yazarken uyarı yok |
| 5 | e2e | mobil | `m-profil-hedef` | Tempo değiştir, kaydet | Kayıt isteği; "plan yarından yeniden kurulur" notu; bugünkü görevler aynı |
| 6 | e2e | mobil | `m-profil-abonelik` | `Nasıl?`'a dokun | Tek dokunuşla mağaza abonelik sayfası açılır |
| 7 | e2e | web | `w-panel-abonelik` | `Aboneliği iptal et` → onayla | `cancel-renewal` isteği; kart "dönem sonuna kadar açık" durumunda |
| 8 | e2e | mobil | `m-profil-paketler` | Yıllık seç, `3 gün ücretsiz başla` (sandbox), onayla | `store-verify-purchase`; erişim açılır; geldiği ekrana döner |
| 9 | e2e | mobil | `m-profil-paketler` | Mağaza penceresini iptal et | Hata gösterilmez, ekran aynı, düğme yeniden etkin |
| 10 | e2e | mobil | `m-profil-paketler` | Geri yükle | `store-restore-purchases`; başarı ya da "bulunamadı" mesajı |
| 11 | birim | mobil | `m-profil-paketler` | Deneme süresi 3 gün | Satır "Bugün ödeme yok · 2. gün hatırlatma · 3. gün ücret" (EN eşdeğeri) |
| 12 | e2e | web | `w-panel-odeme` | Sözleşmeyi işaretlemeden öde | Düğme `disabled` |
| 13 | e2e | web | `w-panel-odeme` → sonuç | Test kartıyla öde (PayTR test modu), sonuç sayfasını yenile | `basarili` sayfası; yenilemede ikinci ödeme başlamaz |
| 14 | e2e | web | `w-panel-odeme-basarisiz` | Reddedilen test kartı | "Kartından para çekilmedi" metni; `Tekrar dene` aynı paketle ödemeye döner |
| 15 | e2e | mobil | `m-profil-gorunum` | Koyu'yu seç | Anında koyu tema; kaydet düğmesi yok; uygulama yeniden açılınca korunur |
| 16 | e2e | mobil | `m-profil-iletisim` | Ağ kapalıyken anahtarı değiştir | Anahtar eski hâline döner, "Tercih kaydedilemedi" |
| 17 | e2e | mobil | `m-profil-guvenlik` | Şifresiz (Google) hesapla şifre ekle | Şifre eklenir; sonra e-posta + şifreyle giriş çalışır |
| 18 | e2e | mobil | çıkış | `Çıkış yap` → onay | Karşılama ekranı; geri tuşu profile dönmez |
| 19 | e2e | mobil | `m-profil-kapat` | Apple hesabıyla kapat | Önce Apple doğrulaması; sonra `account/close`; karşılamaya dönüş |
| 20 | e2e | mobil | `m-profil-kapat` | `Vazgeç` | Profile dönüş, istek yok |
| 21 | erişilebilirlik | ikisi | tümü | En büyük yazı boyutu, %200 web yakınlaştırma | Başlık, düğme, paket adı, fiyat kesilmez; kutular büyür |
| 22 | erişilebilirlik | ikisi | tümü | Kontrast denetimi | Metin 4,5:1; `action` üstünde beyaz 5,2:1 |
| 23 | erişilebilirlik | web | profil sekmeleri | Sekme tuşuyla gez | Her sekme ve düğmede 2 px odak halkası; sekmeler `role="tab"`, `aria-selected` |
| 24 | görsel | ikisi | tümü | TR/EN, açık/koyu çiz; PNG ile yan yana | Metinler ve sıralar çizimle aynı |
| 25 | birim | ikisi | kota | Akıllı Özet 7/30 | "7 / 30" sayı olarak; yüzde değil |
| 26 | birim | ikisi | yüzde | Varsa yüzde | TR `%45`, EN `45%` |
| 27 | bileşen | mobil | `m-profil` | Liste sonu | Son satır yüzen tab bar'ın altında kalmaz (alt boşluk 108) |

## 7. Çizim ile bugünkü kod arasındaki farklar

Mobil kök: `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\profile\presentation\`. Web kök: `C:\Users\onurc\source\repos\sinavika_frontend_student\src\features\`.

**Mobil**
1. `m-profil` ölçü kartları: çizim "gün seri · bu ay (saat) · deneme"; kod "gün seri · dk bugün · görev bugün" (`screens/ProfileMainScreen.tsx`, `ProfileStat`). Avatar kodda `colors.primary` dolgulu; çizimde gri gradyan.
2. `m-profil` menü sırası farklı: kodda ayrı `İstatistiklerim` grubu, Hesabım içinde ayrıca `Paketler` ve `Hesap güvenliği`; Uygulama grubunda `Bildirimler` ve `İletişim izinleri` iki ayrı satır; Destek grubunda çizimde olmayan `Sınavika'yı puanla`; çizimdeki `Uygulama turu` kodda yok. Kodda `Kişisel bilgiler` adı "Kullanıcı bilgileri", `Hesabımı kapat` adı "Hesabı sil" (alt yazı "Apple gereksinimi").
3. `m-profil-bilgiler`: kodda iki ekran var: `ProfileUserInfoScreen.tsx` salt okunur, `ProfileEditScreen.tsx` ad/soyad/telefon düzenler. Çizimdeki fotoğraf değiştirme ve doğum yılı kodda yok.
4. `m-profil-hedef`: kodda hedef sınav kilitli ("Hedef sınavını değiştirmek için destekten bize yaz.", `profile/academic.ts` katalog) ve ekranın büyük kısmı ÖSYM eğitim profili (diploma notu, OBP, okul kodu); çizimdeki hedef net, hedef bölüm, tempo satırları ve "Kaydet ve planı güncelle" yok.
5. `m-profil-abonelik`: kodda gradyanlı paket kartı yok; durum rozeti, kota ölçeri (`StudentAiUsageMeter`), abonelik kartları (her birinde `Mağazada yönet`), `Önceki satın alımları geri yükle` düğmesi ve hukuki notlar var (`ProfileMySubscriptionsScreen.tsx`).
6. `m-profil-paketler`: kodda deneme takvimi (`ProfileSubscriptionTrialTimeline.tsx`: Bugün · hatırlatma günü · ücret günü), `Paketleri karşılaştır` / `Başka paket seç`, `Geri yükle`, `Koşullar`, `Gizlilik`, `Promosyon kodu` bağlantıları var. **Çizimde geri yükleme bağlantısı yok**; Apple'ın uygulama içi satın alma kuralı geri yükleme yolunu ister, bugünkü kod bu yüzden doğru tarafta.
7. `m-profil-gorunum`: kodda yalnız tema (üç seçenek) ve aynı ekranda dil bölümü var; `Modül renkleri`, `Hareketi azalt`, `Yazı boyutu` satırları yok. `m-profil-dil`: kodda yalnız Türkçe ve English (DE/NL "yakında" satırları yok).
8. `m-profil-iletisim`: kodda e-posta, WhatsApp, telefon izinleri (WhatsApp ve telefon "Kanal henüz aktif değil"); çizimdeki Çalışma / Denemeler / Pazarlama grupları yok (`ProfileCommunicationPreferencesScreen.tsx`).
9. `m-profil-guvenlik`: kodda e-posta adresi (değiştirilemez), mevcut/yeni/tekrar şifre formu ve `Şifremi unuttum`; çizimdeki kodla giriş anahtarı, Apple/Google bağlama satırları ve açık oturumlar listesi yok (`ProfileAccountSecurityScreen.tsx`).
10. `m-profil-kapat`: Düzeltildi (17 Kasım 2026): çizim metni kod ve API'deki 30 günlük geri açma kuralına uyduruldu (`profile/account.ts` `warnText`, `restoreWindow`). Kodda kapatma nedeni seçimi (zorunlu) ve "Diğer" için açıklama var; çizimde yok. Kodda `Vazgeç` ikincil, hesap silme birincil düğme; çizimde tersi.
11. `m-hakkinda`: kodda yalnız gizlilik ve kullanım koşulları; KVKK metni ve açık kaynak lisansları satırları yok.

**Web**
12. Profil sekmeleri: kodda 5 sekme (`hesap`, `hedefim`, `abonelik`, `bildirimler`, `guvenlik`; `student-profile/lib/profileTabs.ts`); çizimde 6 (ayrı `Görünüm`). Kodda görünüm seçimi Bildirimler sekmesinde, çizimde de `w-panel-ayarlar` Bildirimler sekmesinde iki kart olarak duruyor; ayrı Görünüm sekmesinin içeriği çizilmedi.
13. `w-panel-profil`: kodda Hesap sekmesinde sağ sütun (Hedefim özeti, Hesabımı kapat kartı) yok; hesap kapatma Güvenlik sekmesinde (`AccountClosureCard.tsx`).
14. `w-panel-ayarlar`: kodun Bildirimler sekmesi iletişim izinlerini gösterir (`CommunicationPreferencesCard`), çizimdeki günlük plan / seri / sonuç / kampanya anahtarlarını göstermez.
15. `w-panel-abonelik`: kodda abonelik kartı ve sipariş kartı (`SubscriptionsCard.tsx`, `SubscriptionOrdersCard.tsx`); gradyan paket kartı ve kullanım (kota) kartı yok.
16. `w-panel-odeme`: kodda kart alanları Sınavika sayfasında değil, PayTR güvenli çerçevesinde (iframe) açılır; önce kupon ve özet adımı, sonra ödeme adımı (`payments/pages/PaymentCheckoutPage.tsx`). Çizimdeki "Kart bilgileri" kartının yerini bu çerçeve tutar; hangisinin esas olacağı doğrulanmadı. Kodda telefon zorunluluğu adımı da var (çizimde yok).
17. Ödeme sonucu: kodda üçüncü bir "bekleniyor" hâli var (`PaymentResultPage.tsx`); çizilmedi.

**Çizimin kendi içindeki çelişkiler**
18. Düzeltildi (17 Kasım 2026): `m-profil-devam`'daki "Uygulama turu" satırı kaldırıldı ("ön tanıtım turu yok" kuralı).
19. Düzeltildi (17 Kasım 2026): günün planı hatırlatması bütün çizimlerde 08:30 (Saat-Bildirim §4 varsayılanı).
20. `m-profil-paketler` "Tüm paketlerde 3 gün ücretsiz" diyor; deneme hesap başına bir kez kullanılabilir (bugünkü kodda deneme hakkı yoksa düğme "Premium'a geç" olur).
21. Abonelik kartında beyaz `small` metin turuncu gradyan üstünde 4,5:1'in altında kalıyor olabilir (`#EA580C` beyazla 3,6:1); düz zemin olmadığı için `uiux-audit` bunu ölçmüyor. Doğrulanmalı.
