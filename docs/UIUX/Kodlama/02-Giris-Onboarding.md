# Giriş, kayıt ve onboarding · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Auth.tsx`, `Screens/Mobile/Onboarding.tsx`, `Screens/Mobile/Gaps.tsx` (`OnbWelcomeScreen`, `OnbRegionScreen`), `Screens/Web/OnboardingWeb.tsx` (web giriş, kayıt, şifre ve onboarding), `Parts/Web.tsx` (`AuthLayout`, `WebOnboarding`, `DevicePhone`), `Parts/Mobile.tsx` (`Phone`, `AppHeader`, `BottomBar`, `Sheet`, `FocusHeader`, `ModuleSlide`), `Parts/Shared.tsx` (`Button`, `Chip`, `Field`, `Card`, `Tile`, `Steps`)
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

## 1. Modül özeti

- **Ne işe yarar:** Öğrencinin uygulamaya ilk girişi ve hesabı. Mobilde karşılama, planı kuran beş adım, planın hazır ekranı, planı kaydeden hesap, 3 günlük mağaza denemesi, bugünkü ilk konu ve ilk çalışmadan sonra bildirim izni. Ayrıca oturum açma (Apple, Google, e-posta kodu), kod ekranı, kayıt, şifremi unuttum ve misafir için hesap alt sayfası. Web'de giriş/kayıt iki yarım düzende, onboarding beş adım ve paket seçimiyle.
- **Öğrencinin ana işi:** İki dakikada kendi planını görmek, sonra hesabını ve denemesini başlatmak. Plan, hesap ve ödemeden önce gösterilir (UIUX-Rehberi §5.3).
- **Renk:** Marka yüzeyi (Modul-Kimligi §1). Modül rengi yok; vurgu marka turuncusu:
  - `brand` `#EA580C` / koyu `#F97316`: logo, odaklı alan kenarı, kod kutusu odağı, ilerleme çubuğu, karşılama başlığının ikinci satırı.
  - `action` `#C2410C` (iki temada): birincil düğme dolgusu (beyaz yazı 5,2:1), gölge `0 14px 28px -14px` `action` %60.
  - `brandDeep` `#C2410C` / koyu `#FB923C`: küçük turuncu bağlantılar ("Hesap oluştur", "Tekrar gönder · 0:42").
  - `brandSoft` `#FFEDD5` / `#3B1D0C`: `Chip tone="brand"` zemini (üst satır çipleri); `brandWash` `#FFF7ED` / `#22150C`: şifre sayfası zemini.
  - **Seçili durum** turuncu değildir: koyu çerçeve (`ink`, 2 pt) ve tik (UIUX-Rehberi §0). Turuncu yalnız ana düğmede.
  - İstisnalar: "Planın hazır" ekranındaki ilk görev kartı Dersler renginde (`moduleLine` lessons); hesap ekranındaki "Kaydedilecek" kartı Ders Planı gradyanında; bildirim izni ekranı Dersler bağlamında çizilir (düğme Dersler `action` `#0277B3`, zemin Dersler `wash`).
- **Mobil tab bar:** Bu ekranların hiçbirinde tab bar yok.
- **Web:** Sol menü yok. Yollar: `/student/login`, `/student/register`, `/student/forgot-password`, `/student/reset-password` (giriş öncesi), `/student/baslangic` (onboarding, `(immersive)` düzeni).
- **Bu belgeye ait olmayan:** Mağaza alımı, paketler, abonelik ve ödeme ekranları Profil belgesindedir (`m-profil-paketler`, `m-profil-abonelik`, `w-panel-odeme`, `w-panel-abonelik`); burada yalnız bağlantı verilir.

## 2. Ekran haritası

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-giris-karsilama` | mobil | Karşılama | — | `src/app/onboarding/steps/OnboardingWelcomeStep.tsx` | ilk |
| `m-onb-0-karsilama` | mobil | Onboarding 0 · Karşılama | `Onboarding · OnboardingWelcomeStep` | aynı dosya | ilk |
| `m-onb-0-bolge` | mobil | Onboarding 0 · Bölge | `Onboarding · OnboardingRegionStep` | `src/app/onboarding/steps/OnboardingRegionStep.tsx` | yalnız bölge belirsizse |
| `m-onb-1-sinav` | mobil | Onboarding 1 · Sınav ve oturum | `Onboarding · OnboardingCategoryExamStep` | `.../steps/OnboardingCategoryExamStep.tsx` | dolu |
| `w-onb-1-sinav` | web | Web onboarding 1 · Sınav | `/student/baslangic` | `src/features/onboarding/pages/OnboardingPage.tsx` (adım 1) | dolu |
| `m-onb-2-net` | mobil | Onboarding 2 · Mevcut ve hedef net | `Onboarding · OnboardingStudyNetStep` | `.../steps/OnboardingStudyNetStep.tsx` | dolu |
| `w-onb-2-hedef` | web | Web onboarding 2 · Hedef | `/student/baslangic` | `OnboardingPage.tsx` (adım 2) | dolu |
| `m-onb-3-tempo` | mobil | Onboarding 3 · Tempo ve günler | `Onboarding · OnboardingStudyTempoStep` | `.../steps/OnboardingStudyTempoStep.tsx` | dolu |
| `w-onb-3-tempo` | web | Web onboarding 3 · Tempo | `/student/baslangic` | `OnboardingPage.tsx` (adım 3) | dolu |
| `m-onb-4-dersler` | mobil | Onboarding 4 · Zorlandığın dersler | `Onboarding · OnboardingStudyWeakStep` | `.../steps/OnboardingStudyWeakStep.tsx` | dolu (isteğe bağlı) |
| `w-onb-4-dersler` | web | Web onboarding 4 · Dersler | `/student/baslangic` | `OnboardingPage.tsx` (adım 4) | dolu |
| `m-onb-5-plan` | mobil | Onboarding 5 · Planın hazır | `Onboarding · plan özeti` | yok (özet ödeme ekranının üstünde: `OnboardingTrialStep.tsx`) | dolu |
| `w-onb-5-plan` | web | Web onboarding 5 · Planın hazır | `/student/baslangic` | yok (özet paket adımının üstünde `PlanSummaryCard`) | dolu |
| `m-onb-6-hesap` | mobil | Planını kaydet | `AuthRegister` | yok | dolu |
| `w-onb-6-paket` | web | Web onboarding 6 · Paketini seç | `/student/baslangic` | `OnboardingPage.tsx` (adım 5) | dolu |
| `m-onb-7-deneme` | mobil | 3 gün ücretsiz | `Onboarding · OnboardingTrialStep` | `.../steps/OnboardingTrialStep.tsx` (paket ekranı) | dolu |
| `m-onb-8-bildirim` | mobil | Bildirim izni · ilk çalışmadan sonra | — | yok (izin modülden dönüşte: `NotificationStudyPlanPromptHost`) | dolu |
| `m-giris-oturum-ac` | mobil | Oturum aç veya kaydol | `AuthLogin` | `src/modules/auth/presentation/guest/screens/AuthLoginScreen.tsx` | dolu |
| `w-giris` | web | Giriş yap | `/student/login` | `src/features/auth/pages/LoginPage.tsx` | dolu |
| `m-giris-kod` | mobil | Doğrulama kodu | `AuthLogin` | `AuthLoginScreen.tsx` (`otp` adımı) | dolu |
| `w-giris-kod` | web | Giriş kodu | `/student/login` | `src/features/auth/pages/_components/LoginCodeStep.tsx` | dolu |
| `m-kayit-eposta` | mobil | Hesap oluştur | `AuthRegister` | `AuthLoginScreen.tsx` (aynı ekran) | dolu |
| `w-kayit` | web | Kayıt ol | `/student/register` | `LoginPage.tsx` (`showcase="register"`) | dolu |
| `m-kayit-bilgiler` | mobil | Hesap oluştur · adın | `AuthRegister` | yok | dolu |
| `m-sifre-unuttum` | mobil | Şifremi unuttum | `AuthForgotPassword` | `.../guest/screens/AuthForgotPasswordScreen.tsx` (`request`) | dolu |
| `w-sifre-unuttum` | web | Şifremi unuttum | `/student/forgot-password` | `src/features/auth/pages/ForgotPasswordPage.tsx` | dolu |
| `m-sifre-yeni` | mobil | Kod ve yeni şifre | `AuthForgotPassword` | `AuthForgotPasswordScreen.tsx` (`verify`) | dolu |
| `w-sifre-sifirla` | web | Şifre sıfırla | `/student/reset-password` | `src/features/auth/pages/ResetPasswordPage.tsx` | dolu |
| `m-giris-sayfa` | mobil | Misafir · hesap gerekli | `AuthEntrySheet` | `src/modules/auth/presentation/components/AuthEntrySheet.tsx` | alt sayfa |

## 3. Süreçler (akışlar)

Geçiş türleri: adımlar arası **replace** (onboarding tek ekran içinde adım değiştirir, yığın büyümez), giriş ekranları **push** (tam ekran akış, `UI_MOTION.duration.screen` 280 ms), sistem pencereleri (Apple, Google, mağaza, bildirim izni) **modal**.

### 3.1 Mobil ilk açılış (yeni öğrenci)
1. Uygulama ilk kez açılır → `m-giris-karsilama`.
2. "Başlayalım / Let's start" → (cihaz bölgesi belirsizse) `m-onb-0-bolge` → "Devam / Continue".
3. `m-onb-1-sinav`: sınav kartı ve oturum seç → "Devam et / Continue". API: öğrencinin hedef sınavı (profil kategori) kaydedilir. Hata: alan altında "Kaydedemedik. Tekrar dene." ve düğme yeniden açılır.
4. `m-onb-2-net` → "Devam et". `m-onb-3-tempo` → "Devam et".
5. `m-onb-4-dersler` → "Planımı hazırla / Build my plan". API: plan girdisi + müsaitlik + onboarding tamamla (web kodu: `POST student/study-plan/intake`, `PUT student/study-plan/availabilities`, `POST student/study-plan/onboarding/complete`). Düğme loading; hata: "Planını hazırlayamadık. Tekrar dene."
6. `m-onb-5-plan` → "Planımı kaydet / Save my plan".
7. `m-onb-6-hesap`:
   - "Apple ile devam et" → Apple sistem penceresi [modal] → `POST StudentAuth/apple/register` (yoksa `apple/login`) → 8. adım.
   - "Google ile devam et" → Google penceresi → `POST StudentAuth/google/register` → 8. adım.
   - "E-posta ile devam et" → `m-kayit-eposta` [push] → "Devam et" → `POST StudentAuth/email-login` (`email`) → `m-giris-kod` → 6 hane → `POST StudentAuth/email-login` (`email`, `code`) → yeni hesapsa `m-kayit-bilgiler` → "Hesabımı oluştur" (`name` ile) → 8. adım.
   - Sistem penceresinden vazgeçilirse hata gösterilmez; ekran yerinde kalır.
8. `m-onb-7-deneme` → "3 gün ücretsiz başla / Start 3 free days" → mağaza alım penceresi [modal, Profil belgesi]. Başarı → bugünkü planın ilk konusu, oynatıcıda ilk adımdan (`WorkMikro`, ör. `m-ders-tanim`) [replace: onboarding kapanır]. Vazgeçme → ekran yerinde. "Paketleri karşılaştır / Compare plans" → `m-profil-paketler` [push].
9. İlk çalışma biter (öğrenci oynatıcıdan ilk kez çıkar ya da ilk konu sonuna ulaşır; ara "bitti" ekranı yok) → `m-onb-8-bildirim` [push]. "Bildirimleri aç" → sistem izin penceresi; "Şimdi değil" → izin sorulmaz. Sonraki ekran çizimde tanımlı değil (doğrulanmadı); bugünkü kod ana ekrana girer.
- **Geri:** Karşılamadan geri yok (Android geri uygulamayı kapatır). Diğer adımlarda sol üstteki geri ve sistem geri bir önceki adıma döner; cevaplar korunur. Ödeme ekranından cevaplara dönülebilir.
- **Yarıda bırakma:** Adım ve cevaplar her değişimde cihaza yazılır (karşılama hariç); uygulama kapanırsa aynı adımdan devam edilir. Sınav kataloğu değiştiyse geçersiz seçimler düşer. Plan bir kez kurulur; geri dönülüp yeniden ilerlenirse yeniden kurulmaz.

### 3.2 Mobil, hesabı olan öğrenci
1. `m-giris-karsilama` → "Zaten hesabım var / I already have an account" → `m-giris-oturum-ac` [push].
2. Apple / Google → sistem penceresi → `POST StudentAuth/apple/login` / `google/login` → ana ekran `m-hub-moduller` [replace].
3. E-posta → "Kod gönder / Send code" → `POST StudentAuth/email-login` (`email`) → `m-giris-kod` [aynı ekranda adım]. Kod 6 hane dolunca "Doğrula" etkinleşir → `POST StudentAuth/email-login` (`email`, `code`) → ana ekran. Hesap yoksa aynı akış hesabı oluşturur → `m-kayit-bilgiler`.
4. `m-giris-kod` "Şifrenle giriş yap" → şifre alanı → `POST StudentAuth/login` (`email`, `password`). Şifre ekranının ayrı çizimi yok (doğrulanmadı).
5. "Farklı bir e-posta mı? · Değiştir" ya da geri → `m-giris-oturum-ac`, e-posta alanı dolu ve düzenlenebilir.
- Hata: yanlış kod → kutuların altında alan hatası ("Kod geçersiz veya süresi dolmuş. Yeni kod isteyin."), kutular temizlenmez; kapalı hesap → "Hesabın kapatılmış. Destek ile iletişime geç."

### 3.3 Mobil, şifremi unuttum
1. Şifre girişinden "Şifremi unuttum" → `m-sifre-unuttum` [push] (e-posta alanı önceki ekrandan dolu gelir).
2. "Kod gönder" → `POST StudentAuth/forgot-password` (`email`) → `m-sifre-yeni` [aynı ekranda adım].
3. 6 hane + yeni şifre + tekrar → "Şifremi güncelle" → `POST StudentAuth/reset-password` (`email`, `code`, `newPassword`, `confirmNewPassword`) → başarı penceresi ("Şifre güncellendi") → `m-giris-oturum-ac`.
- Geri: `m-sifre-yeni`'den geri → `m-sifre-unuttum` (e-posta korunur). Kodun süresi bitince "Kod süresi doldu. Yeni kod isteyin." ve yeniden gönderme.

### 3.4 Misafir hesap gerektiren işe dokunur
1. Misafir (hesapsız erişim) hesap isteyen bir şeye dokunur (ör. Akıllı Özet analizi kaydetme) → `m-giris-sayfa` [alt sayfa, `UI_MOTION` sheet 320 ms].
2. Apple / Google → 3.1'deki gibi; "E-posta ile devam et" → `m-kayit-eposta`; "Oturum aç" → `m-giris-oturum-ac`. Başarıdan sonra öğrenci dokunduğu işe döner.
3. Aşağı çekme (%45 ya da hızlı fiske) ya da karartmaya dokunma → alt sayfa kapanır, iş yapılmaz.

### 3.5 Web, kayıt ve onboarding
1. `/student/register` (`w-kayit`) → Google / Apple ya da form → "Hesabımı oluştur" → yeni hesap → `/student/baslangic` adım 1 (`w-onb-1-sinav`) [sayfa geçişi].
2. Adım 1 "Devam et" (hedef sınav kaydı) → 2 → 3 → 4 "Planımı hazırla" (plan kurulur, 3.1/5 ile aynı API) → 5 `w-onb-5-plan` "Planımı kaydet" → 6 `w-onb-6-paket`.
3. "Ödemeye geç / Go to payment" → `w-panel-odeme` (`/student/odeme`, Profil/ödeme belgesi). "Şimdilik paket seçme / Not now" → panel ana sayfası; ödeme yoksa erişim yok, öğrenci `w-panel-anasayfa-abonelik-bitti` görür (doğrulanmadı).
4. "Geri / Back" ve tarayıcı geri bir önceki adıma döner. Adım ve cevaplar tarayıcıya yazılır; sayfa kapanırsa aynı adımdan devam edilir. Planı zaten olan öğrenci `/student/baslangic`'e gelirse ana sayfaya yönlenir.

### 3.6 Web, giriş
1. `/student/login` (`w-giris`): e-posta + şifre → "Giriş yap" → `POST StudentAuth/login` → `/student/dashboard` (ya da güvenli `returnUrl`).
2. "E-postama kod gönder" → `w-giris-kod` (aynı yol) → 6 hane → "Doğrula ve giriş yap". "Değiştir" → e-posta formuna dönüş.
3. "Şifremi unuttum" → `/student/forgot-password` → "Kod gönder" → `/student/reset-password` → "Şifremi güncelle" → `/student/login?passwordReset=1` (başarı bildirimi).
4. Google / Apple → sağlayıcı → yeni hesapsa `/student/baslangic`, değilse ana sayfa.

## 4. Ekranlar

Ortak ölçüler (mobil): tuval 390 × 844 pt, durum çubuğu 50. `BottomBar`: iç boşluk 12 / 18 / 34, öğeler arası 10, sabit altta. `AuthTitle`: üst 8, aralık 8; isteğe bağlı `Chip tone="brand"` (yükseklik 28, yan 11, yazı 13/700), `hero` 26/32/800 başlık, `body` 16/24 açıklama (`ink2`). `Field`: etiket `small` 700 `ink2` (alanın 7 pt üstünde), kutu yükseklik 50, köşe 16, `card`, 1,5 pt kenar (`line`; odakta `brand` ve 4 pt `brand` %10 halka; hatada `error`), sol ikon 18 `muted`, yazı 16/500, boşken yer tutucu `subtle`. Hata alanın altında `alert` 15 + `meta` `errorInk`. Düğmeler: `lg` 54 pt yükseklik, yazı 16/700, köşe tam. Apple düğmesi `tone="dark"` (`ink` zemin, `bg` yazı), Google `tone="ghost"` (`card` zemin, 1,5 pt `line`, `ink` yazı).

### `m-giris-karsilama` Karşılama

- **Görseller:** `acik/mobil/m-giris-karsilama.png`, `koyu/mobil/m-giris-karsilama.png`, `en/acik/mobil/m-giris-karsilama.png`
- **Çerçeve:** Üst çubuk yok. Zemin: `radial-gradient(90% 55% at 50% 30%, brandSoft 0%, bg 70%)`. Tab bar yok. `BottomBar` var.
- **Yerleşim:**
  1. Logo 30 pt yükseklik, ortalı, üstten 12.
  2. Kart yelpazesi (yükseklik 360, üstten 18): üç `ModuleSlide` (genişlik 270, yükseklik 150, köşe 26, modül gradyanı, iç 20, aralık 6, gölge `0 16px 30px -18px` modül rengi %80), üst üste; sol 30 / 64 / 98, üst 12 / 88 / 164, dönüş −7° / 3° / −2°. Sıra: Dersler, Denemeler, Akıllı Özet. Her kartta: `over` beyaz %85 etiket, `hero` 24 beyaz başlık (en çok 270), `small` beyaz %90 metin (en çok 260), iki ışık dairesi ve büyük saydam ikon (%18, −12°), altta beyaz `sm` düğme (yazı modül `ink`). Metinler `MODULES[*].slide`:
     - Dersler: "Kaldığın yerden" / "Pick up where you left off" · "Mecaz anlam" / "Figurative meaning" · "Sözcükte Anlam · 2/5 adım · 3 dakika kaldı" / "Word meaning · step 2/5 · 3 minutes left" · "Devam et" / "Continue".
     - Denemeler: "Deneme" / "Practice exam" · "Hedefine bilgiyle yaklaş" / "Get closer to your goal" · "TYT Deneme 5 cumartesi 10:00’da. 12.480 kişi katılıyor." / "TYT Exam 5 is on Saturday at 10:00. 12,480 students joining." · "Denemelere git" / "Go to exams".
     - Akıllı Özet: "Soru analizi" / "Question analysis" · "Fotoğrafını çek, çözümünü öğren" / "Snap it, learn the solution" · "Adım adım çözüm, kazanım ve hata analizi." / "Step-by-step solution, skill and mistake analysis." · "Soru yükle" / "Upload".
  3. Metin bloğu (yan 28, üst 8, aralık 10, ortalı): `display` 30/36/800 "Ne çalışacağını bil," satır sonu "**her gün ilerle.**" (ikinci satır `#EA580C`) / "Know what to study, move forward daily."; `body` "Deneme, ders, test, plan ve SinoAI tek uygulamada. Planın 2 dakikada hazır." / "Exams, lessons, quizzes, a plan and SinoAI in one app. Your plan in 2 minutes."
  4. `BottomBar`: birincil `lg` tam genişlik, sağda `right` ikonu: "Başlayalım" / "Let's start"; `ghost` `lg`: "Zaten hesabım var" / "I already have an account".
- **Veri:** Yok (statik). Kartlar dekor; dokunulmaz ve ekran okuyucudan gizlenir.
- **Etkileşimler:** "Başlayalım" → `m-onb-0-bolge` (bölge belirsizse) ya da `m-onb-1-sinav`. "Zaten hesabım var" → `m-giris-oturum-ac`; giriş olmazsa (geri) kalınan yere dönülür.
- **Hâller:** Yok.
- **Kurallar:** Ön tanıtım turu yok. Yatay kaydırma (slayt karuseli) yok; kartlar durağandır.

### `m-onb-0-karsilama` Onboarding 0 · Karşılama (uygulama kataloğundan çizilen hâl)

- **Görseller:** `acik/mobil/m-onb-0-karsilama.png`, `koyu/mobil/m-onb-0-karsilama.png`, `en/acik/mobil/m-onb-0-karsilama.png`
- **Not:** İki karşılama çizimi vardır. `m-giris-karsilama` UIUX-Rehberi §5.2'nin karşılamasıdır; `m-onb-0-karsilama` 13–14 Kasım uyumluluk raporunda uygulamanın katalog metinleriyle çizildi. Metinleri aynı, yerleşimi farklı.
- **Yerleşim:** İçerik yan 22, üst 24, aralık 18: logo 30 (sola yaslı); `display` 32/38 "Ne çalışacağını bil, **her gün ilerle.**" (ikinci kısım `brand`) / "Know what to study, move ahead every day."; `body` aynı; iki önizleme kartı (iç 14, köşe 20, `card`, `line` kenar, kart gölgesi, aralık 12, `Tile` 42): Dersler `over` "Devam et" / "Continue", "Sözcükte Anlam" / "Word meaning", "Türkçe · 11 dakika kaldı" / "Turkish · 11 min left"; Denemeler "Deneme" / "Exam", "Hedefine bilgiyle yaklaş", "TYT Deneme cumartesi 10:00’da" / "TYT exam on Saturday 10:00". `BottomBar`: birincil `lg` "Başlayalım"; altında ortalı `small` 700 `brandDeep` bağlantı "Hesabım var" / "I have an account".
- **Etkileşimler:** `m-giris-karsilama` ile aynı.

### `m-onb-0-bolge` Onboarding 0 · Bölge

- **Görseller:** `acik/mobil/m-onb-0-bolge.png`, `koyu/mobil/m-onb-0-bolge.png`, `en/acik/mobil/m-onb-0-bolge.png`
- **Çerçeve:** `FocusHeader` (iç 4/16/10): solda 40 pt geri dairesi (`card`, `line` kenar, `left` ikonu), başlık boş; altında `Steps` 6 bölüm, 1'i dolu (5 pt, köşe 3, aralık 5).
- **Yerleşim:** İçerik yan 22, üst 10, aralık 14: `title` 26 "Bölgeni seç" / "Choose your region"; `body` "Sınavika’yı bölgene göre kişiselleştiririz." / "We tailor Sınavika to your region."; iki seçenek (iç 16, köşe 20, aralık 14): 44 pt yuvarlak `line2` içinde "TR" / "US" (`headline` 15); `headline` 16 "Türkiye" + `small` "YKS, KPSS · Türkçe" / "YKS, KPSS · Turkish"; "United States" + "SAT, ACT · English"; sağda 24 pt radyo. Seçili: `card` zemin, 2 pt `ink` kenar, sağda 24 pt `ink` daire içinde `bg` renkli tik (onboarding seçim kuralı: koyu çerçeve ve tik). İlerleme çubuğu yok: bölge adımı planı kuran beş adımdan sayılmaz. `BottomBar`: birincil `lg` "Devam" / "Continue".
- **Etkileşimler:** Seçim → bölge, dil ve sınav listesi buna göre; "Devam" → `m-onb-1-sinav`.
- **Kurallar:** Yalnız cihaz bölgesi belirsizse gösterilir; ilerleme çubuğunda sayılmaz (bkz. §7).

### Onboarding çerçevesi (`OnbFrame`, adım 1–7)

- Üst satır (iç 6/16/0, aralık 12): 40 pt geri dairesi; adım ekranlarında `Steps` 5 bölüm (dolu: `brand`, boş: `line`) ve sağda `meta` "1/5" (genişlik 34, sağa yaslı). Hesap ve deneme ekranlarında yalnız geri dairesi.
- İçerik (iç 18/18/10, aralık 14): `Chip tone="brand"` üst satır, `hero` 26/32 başlık, `body` açıklama, sonra ekranın içeriği. İçerik sığmazsa dikey kayar.
- `BottomBar`: isteğe bağlı ek satır, sonra birincil `lg` tam genişlik (varsayılan "Devam et" / "Continue"); seçim eksikse `disabled` (`line` zemin, `subtle` yazı).
- Seçim satırı (`Pick`): iç 14, köşe 20, `card`; seçili 2 pt `ink` kenar, değilse 1,5 pt `line`; sağda 22 pt kutu (onay: köşe 7; radyo: köşe 11), seçiliyse `ink` dolgu ve `bg` renkli tik (radyoda 8 pt nokta); isteğe bağlı solda `Tile` 42 (seçiliyse ikon `ink`).

### `m-onb-1-sinav` Sınav ve oturum · web: `w-onb-1-sinav`

- **Görseller:** `acik/mobil/m-onb-1-sinav.png`, `koyu/...`, `en/acik/mobil/m-onb-1-sinav.png`; `acik/web-panel/w-onb-1-sinav.png`
- **Yerleşim:** Adım 1/5. Çip "Hedef sınav" / "Target exam"; başlık "Hangi sınava hazırlanıyorsun?" / "Which exam are you preparing for?"; metin "Planını, denemelerini ve içeriklerini buna göre kuracağız." / "We build your plan, exams and content around it."
  - İki sütun sınav kartı (aralık 10, `Card` iç 16): YKS (seçili: 2 pt `ink` kenar, sağ üstte 12/12'de 22 pt `ink` kutu ve tik; `Tile` `grad` 42 `ink`; `section` "YKS"; `small` "TYT · AYT · YDT"), KPSS (`briefcase`; "Lisans · Ön lisans · Ortaöğretim" / "Degree · Associate · High school").
  - `section` "Oturumlar ve puan türü" / "Sessions and score type".
  - Seçim satırları (onay kutusu, aralık 8): "TYT" · "Temel Yeterlilik Testi" / "Basic proficiency" (seçili); "AYT · Sayısal" · "Matematik, Fizik, Kimya, Biyoloji" / "Maths, Physics, Chemistry, Biology" (seçili); "YDT" · "Yabancı Dil Testi" / "Foreign language test".
  - Düğme "Devam et"; en az bir oturum yoksa pasif ve uyarı "En az bir oturum seç."
- **Veri:** Sınav listesi pazara göre katalogdan (kategoriler ve alt kategoriler). Kayıt: öğrencinin profil kategorisi (`categoryId`, `categorySubIds`). Hedef sınav zaten seçilmişse değiştirilemez, salt okunur gösterilir (abonelik paketi belirler).
- **Hâller:** Katalog yüklenirken ortada `LoadingLogo`; hata: "Sınav listesi yüklenemedi." + "Tekrar dene".
- **Web farkı:** `WebOnboarding` düzeni (aşağıda). Kartlar `Pick` (iç 16, `Tile` 44, `section` 16, 22 pt radyo: seçili 7 pt `ink` kenarlı daire). Oturumlar çip olarak (yükseklik 40, yan 16, yazı 14; seçili 2 pt `ink` kenar ve tik): "TYT", "AYT · Sayısal", "AYT · Eşit ağırlık", "AYT · Sözel", "YDT"; başlık `section` 16 "Oturum ve puan türü" / "Session and score type". Sağ önizleme: hedef kartı (`Card` iç 24, genişlik 420: `over` "Hedefin" / "Your goal", `num` 48 "48" → "78", `small` "YKS · Sayısal · 245 gün" / "YKS · Science · 245 days").

### `m-onb-2-net` Mevcut ve hedef net · web: `w-onb-2-hedef`

- **Görseller:** `acik/mobil/m-onb-2-net.png`, `koyu/...`, `en/...`; `acik/web-panel/w-onb-2-hedef.png`
- **Yerleşim:** Adım 2/5. Çip "Hedef" / "Goal"; başlık "Şu an neredesin, nereye varmak istiyorsun?" / "Where are you now, where do you want to be?"; metin "Kabaca seçmen yeterli; ilk denemenden sonra biz güncelleriz." / "A rough guess is fine; we update it after your first exam."
  - `Card` iç 20, aralık 18: solda `meta` "Şu anki netin" / "Current score" + `num` 34 "48"; ortada `right` 22 `subtle`; sağda "Hedef netin" / "Target score" + "78".
  - Çift tutamaçlı kaydırıcı (yükseklik 30): iz 6 pt `line2`; aralık `ink`; iki tutamaç 26 pt beyaz, 3 pt `ink` kenar, kart gölgesi. Altında ölçek `meta`: 0, 30, 60, 90, 120 (ölçek sınavın soru sayısından; TYT ve KPSS 120).
  - Seçim satırı: "Netimi bilmiyorum" / "I don't know my score" · "İlk denemenden sonra biz ölçeriz" / "We measure it after your first exam".
  - `Card tone="soft"` (iç 14): `trend` 22 `successInk` + `small`: "**+30 net** sınava kalan 245 günde gerçekçi bir hedef: haftada ortalama 1 net." / "**+30 points** is realistic in 245 days: about 1 a week."
- **Etkileşimler:** Tutamaçlar sürüklenir (parmağı 1:1 izler), hedef mevcudun altına inemez. "Netimi bilmiyorum" seçilince kaydırıcı pasifleşir (doğrulanmadı). Erişilebilirlik: her tutamaç ayrı kaydırıcı, ses tuşlarıyla 1'er artar.
- **Web farkı:** `Card` iç 22, `num` 36; ok yok; kaydırıcı aynı. Altında `Field` "Hedef bölüm (isteğe bağlı)" / "Target programme (optional)", değer "Bilgisayar Mühendisliği · İstanbul", `pin` ikonu. `soft` kart: "+30 net, 245 günde gerçekçi: haftada ortalama 1 net." Web çiziminde "Netimi bilmiyorum" yok. Önizleme: hedef kartı.

### `m-onb-3-tempo` Tempo ve günler · web: `w-onb-3-tempo`

- **Görseller:** `acik/mobil/m-onb-3-tempo.png`, `koyu/...`, `en/...`; `acik/web-panel/w-onb-3-tempo.png`
- **Yerleşim:** Adım 3/5. Çip "Tempo" / "Pace"; başlık "Günde ne kadar çalışabilirsin?" / "How much can you study a day?"; metin "Sürdürebileceğin bir tempo seç; istediğin zaman değiştirirsin." / "Pick a pace you can keep; change it any time."
  - Üç radyo satırı (aralık 10): `sun` "Hafif" / "Light" · "1 saat · 40 soru · okul ya da işle birlikte" / "1 hour · 40 questions · alongside school or work"; `target` "Dengeli" / "Balanced" + `Chip brand sm` "Önerilen" / "Suggested" · "3 saat · 100 soru · çoğu öğrenci için" / "3 hours · 100 questions · for most students" (varsayılan seçili); `zap` "Yoğun" / "Intense" · "5+ saat · 180 soru · son aylar ve kamp" / "5+ hours · 180 questions · final months".
  - `Card tone="flat"` iç 14: `headline` "Hangi günler?" / "Which days?" + sağda `meta` "6 gün" / "6 days"; yedi gün kutusu (42 × 38, köşe 12): "Pzt Sal Çar Per Cum Cmt Paz" / "Mon … Sun"; seçili `ink` zemin `bg` yazı 800; seçili değil `card`, 1,5 pt `line`, `muted` yazı. Varsayılan Pzt–Cmt.
- **Kurallar:** En az bir gün seçili kalır (doğrulanmadı). Gün kutuları dokunma alanı 44 pt.
- **Web farkı:** Yalnız üç tempo kartı (iç 16, `Tile` 44, radyo daire); gün seçimi yok. Sağ önizleme: "Bu hafta" haftalık plan kartı (genişlik 470, aşağıda `WeekPlan`). EN metinleri kısalır ("1 hour · 40 questions").

### `m-onb-4-dersler` Zorlandığın dersler · web: `w-onb-4-dersler`

- **Görseller:** `acik/mobil/m-onb-4-dersler.png`, `koyu/...`, `en/...`; `acik/web-panel/w-onb-4-dersler.png`
- **Yerleşim:** Adım 4/5. Çip "Dersler" / "Subjects"; başlık "Hangi derslerde daha çok desteğe ihtiyacın var?" / "Where do you need more support?"; metin "Planında bu derslere daha çok yer ayırırız. Seçmesen de olur." / "We give these more room in your plan. Optional."
  - Satıra sarılan çipler (aralık 8): `Chip tone="outline"` yükseklik 44, yan 16, yazı 14; seçili 2 pt `ink` kenar, `ink` yazı ve `check` ikonu; değilse 1,5 pt `line`, `ink2`. Örnek: Matematik, Türkçe, Geometri, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe (EN: Maths, Turkish, Geometry, Physics, Chemistry, Biology, History, Geography, Philosophy).
  - `Card tone="soft"`: `info` 18 `muted` + "Emin değil misin? İlk denemenden sonra eksik konularını biz buluruz." / "Not sure? We find your gaps after your first exam."
  - `BottomBar` ek satırı: ortalı `small` "**3** ders seçildi" / "**3** selected"; düğme "Planımı hazırla" / "Build my plan".
- **Veri:** Ders listesi seçilen oturumların puan türü derslerinden (aynı adlı dersler tek çipte birleşir). Liste boşsa "Bu sınav için ders listesi bulunamadı. Devam edebilirsin."
- **Etkileşimler:** "Planımı hazırla" → plan kurulur (§3.1/5), düğme loading; başarı → `m-onb-5-plan`.
- **Web farkı:** Aynı çipler (yan 18) ve "Din Kültürü" / "Religion"; seçili sayı satırı yok; önizleme haftalık plan.

### `m-onb-5-plan` Planın hazır · web: `w-onb-5-plan`

- **Görseller:** `acik/mobil/m-onb-5-plan.png`, `koyu/...`, `en/...`; `acik/web-panel/w-onb-5-plan.png`
- **Yerleşim:** Adım 5/5. Çip "Hazır" / "Ready"; başlık "YKS planın hazır" / "Your YKS plan is ready" (sınav adı veriden); metin "48 netten 78 nete, günde 3 saatlik dengeli tempoyla." / "From 48 to 78, at a balanced 3 hours a day."
  - `WeekPlan` kartı (`Card` iç 14): üst satır `section` 15 "Bu hafta" / "This week" + `Chip` "12–18 Ekim" / "12–18 Oct"; yedi sütun (genişlik 44, aralık 5): gün `meta` (bugün `ink`), tarih dairesi 30 (bugün `ink` dolgu, `bg` yazı; `headline` 13), altında en çok 3 görev bloğu (38 × 24, köşe 8, modül rengi %16 zemin, solda 3 pt modül rengi çizgi). Altta açıklama: 8 pt kare (köşe 3) + `meta` modül adı: Dersler, Testler, Denemeler, Bilgi Kartları.
  - İlk görev kartı `Card tone="moduleLine"` Dersler (iç 14; `card` zemin, 1,5 pt Dersler `line`, gölge): `Tile` Dersler 42; `over` Dersler `ink` "Bugünkü ilk görevin" / "Your first task today"; `headline` "Türkçe · Sözcükte Anlam" / "Turkish · Word meaning"; `small` "Dersler · ilk konu · 8 dk" / "Lessons · first topic · 8 min"; sağda ok.
  - Düğme "Planımı kaydet" / "Save my plan".
- **Veri:** Plan tamamlama yanıtı (haftalık saat, ilk hafta görev sayısı, sınava kalan gün, günlere göre görevler). Modül renkleri görev türünden.
- **Etkileşimler:** İlk görev kartı dokunulmaz (bilgi; hesap ve deneme önce gelir). "Planımı kaydet" → `m-onb-6-hesap` (zaten oturum açıksa `m-onb-7-deneme`; doğrulanmadı).
- **Web farkı:** Metin sonuna "Telefonda da aynı plan." / "Same plan on your phone."; ilk görev kartı (iç 16, `Tile` 44) `over` Dersler kimlik rengiyle, "Paragraf · Ana fikir · 25 dk" / "Reading · Main idea · 25 min". Sağ önizleme: telefon içinde Ders Planı Bugün ekranı (`DevicePhone` genişlik 300, −3°) ve altında `Chip outline` "Mobilde aynı plan" / "Same plan on mobile".

### `m-onb-6-hesap` Planını kaydet

- **Görseller:** `acik/mobil/m-onb-6-hesap.png`, `koyu/...`, `en/...`
- **Çerçeve:** `OnbFrame`, adım çubuğu yok (yalnız geri).
- **Yerleşim:** Çip "Hesap" / "Account"; başlık "Planını kaydedelim" / "Let's save your plan"; metin "Hesabınla planın, netlerin ve ilerlemen web ve mobilde aynı kalır." / "Your plan, scores and progress stay the same on web and mobile."
  - Ders Planı gradyan kartı (yükseklik 260, köşe 26, iç 18): `over` beyaz %85 "Kaydedilecek" / "Will be saved"; 12 pt altta üç satır (aralık 8; iç 10/12, köşe 14, beyaz %18 zemin): `check` 16 beyaz + `headline` beyaz: "Haftalık plan · 21 saat" / "Weekly plan · 21 hours", "Hedef · 48 → 78 net" / "Goal · 48 → 78", "Zorlandığın dersler · 3" / "Weak subjects · 3".
  - `BottomBar`: `dark` `lg` `apple` "Apple ile devam et" / "Continue with Apple"; `ghost` `lg` `google` "Google ile devam et" / "Continue with Google"; ortalı `small` 700 `ink` bağlantı (dikey 6) "E-posta ile devam et" / "Continue with e-mail".
- **Veri:** Kart satırları onboarding cevapları ve plan özetinden.
- **Etkileşimler:** §3.1/7. Android'de Apple düğmesi gösterilir mi: doğrulanmadı (bugünkü kod: "Apple ile giriş yalnızca iOS cihazlarda kullanılabilir.").
- **Kurallar:** Hesap ödeme ekranından önce gelir: önce emek güvene alınır. "Hesabın hazır" ara ekranı yok.

### `m-onb-7-deneme` 3 gün ücretsiz

- **Görseller:** `acik/mobil/m-onb-7-deneme.png`, `koyu/...`, `en/...`
- **Çerçeve:** `OnbFrame`, adım çubuğu yok.
- **Yerleşim:** Çip "3 gün ücretsiz" / "3 days free"; başlık "Tüm özellikleri 3 gün ücretsiz dene" / "Try everything free for 3 days"; metin "Bugün ödeme yok. İstediğin an iptal edebilirsin." / "No payment today. Cancel any time."
  - Zaman çizelgesi `Card` (iç 6): üç satır (iç 12/10, aralarında 1 pt `line2`; `Tile` 36, ilk satırın ikonu `brand`, diğerleri `ink2`): `gift` "Bugün" / "Today" · "Planın, denemeler, SinoAI ve tüm modüller açılır." / "Your plan, exams, SinoAI and every module unlock."; `bell` "2. gün" / "Day 2" · "Deneme sürenin bittiğini hatırlatırız." / "We remind you the trial is ending."; `card` "3. gün" / "Day 3" · "YKS Aylık ₺299 ile devam eder. Öncesinde iptal edersen ücret yok." / "Continues as YKS Monthly ₺299. Cancel before and pay nothing."
  - Paket satırı (iç 14/16, köşe 20, 2 pt `ink` kenar, `card`): `headline` "YKS Aylık Paket" / "YKS Monthly" + `small` "3 gün ücretsiz, sonra aylık" / "3 days free, then monthly"; sağda `section` "₺299/ay".
  - `BottomBar` ek satırı: ortalı `small` 700 `ink` "Paketleri karşılaştır" / "Compare plans"; düğme "3 gün ücretsiz başla" / "Start 3 free days".
- **Veri:** Paket adı, fiyat ve deneme süresi mağaza ürününden (fiyatlar örnektir). Deneme metni yalnız mağaza bu öğrenciye deneme veriyorsa gösterilir; vermiyorsa başlık "Planına hemen başla", düğme "Planıma başla" (bugünkü kod katalogu).
- **Etkileşimler:** §3.1/8. Mağaza alımı ve "Paketleri karşılaştır" Profil belgesine aittir.
- **Kurallar:** Üç tarih açık (bugün, 2. gün hatırlatma, 3. gün ücret). Ödemeden geçiş yok.

### `m-onb-8-bildirim` Bildirim izni · ilk çalışmadan sonra

- **Görseller:** `acik/mobil/m-onb-8-bildirim.png`, `koyu/...`, `en/...`
- **Çerçeve:** Üst çubuk yok, tab bar yok. Dersler bağlamı: zemin `linear-gradient(180deg, Dersler wash 0%, bg 50%)`.
- **Yerleşim:** İçerik ortalı, üst 60, aralık 16:
  - 96 pt kutu (köşe 32, `card`, gölge `float`), `bell` 44 Dersler `color`.
  - `Chip tone="success"` `checkCircle`: "İlk çalışman bitti" / "First session done".
  - `hero` ortalı: "Yarın 08:00’de hatırlatalım mı?" / "Shall we remind you at 08:00 tomorrow?"
  - `body` ortalı: "Günün planını sabah, deneme sonucunu açıklanınca haber veririz. Gece 22:00–08:00 sessiz." / "Your plan in the morning, exam results when ready. Quiet 22:00–08:00."
  - Örnek bildirimler `Card` (iç 12, tam genişlik, sola yaslı; satır arası 8): `Tile` 32 Ders Planı + `headline` 13,5 "Bugünün planı hazır" / "Today's plan is ready" + `meta` "08:00"; `Tile` Denemeler + "Sonucun hazır: TYT Deneme 4" / "Your result: TYT Exam 4" + "12:24".
  - `BottomBar`: birincil `lg` (Dersler `action`) "Bildirimleri aç" / "Turn on notifications"; `ghost` `lg` "Şimdi değil" / "Not now".
- **Etkileşimler:** "Bildirimleri aç" → sistem izin penceresi; izin verilirse cihaz jetonu kaydedilir (API'de doğrulanmalı). "Şimdi değil" → sistem penceresi açılmaz, istek sonra tekrar sorulabilir (kaç gün sonra: doğrulanmadı).
- **Kurallar:** Sistem penceresinden önce kendi açıklamamız. İzin onboarding'de değil, ilk çalışmadan sonra sorulur. Sessiz saat ve saat bilgisi Saat-Bildirim.md ile aynı olmalı (bkz. §7).

### `m-giris-oturum-ac` Oturum aç veya kaydol · web: `w-giris`

- **Görseller:** `acik/mobil/m-giris-oturum-ac.png`, `koyu/...`, `en/...`; `acik/web-panel/w-giris.png`, `koyu/web-panel/w-giris.png`
- **Çerçeve:** `AppHeader`: solda geri (40 pt daire, `card`, `line` kenar, `left`), ortada logo 24, sağda boş 40. Tab bar yok. `BottomBar` var. Zemin `bg`.
- **Yerleşim:** İçerik aralık 18:
  1. `AuthTitle`: "Oturum aç veya kaydol" / "Sign in or sign up"; "Devam etmek için e-posta adresini gir. Hesabın varsa kod göndeririz, yoksa birlikte oluştururuz." / "Enter your e-mail. If you have an account we send a code; if not, we create one together."
  2. Sosyal düğmeler (aralık 10): `dark` `lg` `apple` "Apple ile devam et" / "Continue with Apple"; `ghost` `lg` `google` "Google ile devam et" / "Continue with Google".
  3. Ayırıcı: iki 1 pt `line` çizgi arasında `meta` "ya da e-posta ile" / "or with e-mail".
  4. `Field` "E-posta" / "E-mail", `mail` ikonu, odaklı (örnek değer "ayse@ornek.com").
  5. `BottomBar`: birincil `lg` "Kod gönder" / "Send code"; ortalı satır `small` "Hesabın yok mu?" / "No account?" + `small` 800 `brandDeep` "Hesap oluştur" / "Create one".
- **Veri:** `POST StudentAuth/email-login` (`email`, `installationId`, `registerPlatform`) → `codeSent`. Apple/Google: kimlik jetonu ile `apple/login`, `google/login` (yoksa `register`).
- **Etkileşimler:** "Kod gönder" → `m-giris-kod` (geçersiz e-postada alan hatası "Geçerli bir e-posta adresi gir."; boşsa "E-posta gerekli."). "Hesap oluştur" → `m-kayit-eposta`. Geri → önceki ekran (karşılama ya da misafirin geldiği yer).
- **Kurallar:** Klavye e-posta türü, otomatik doldurma `email`, büyük harf ve düzeltme kapalı. Doğrulama alandan çıkınca yapılır, yazarken uyarılmaz. Gönderilirken düğme loading ve kilitli.
- **Web farkı (`w-giris`):** `AuthLayout` iki yarım: sol 720 px (üst satır yükseklik 64, yan 28: solda `left` + `small` 700 "Ana sayfa" / "Home" (200 px), ortada logo 30, sağda 38 pt tema düğmesi `bulb`); form kartı ortada (genişlik 440, iç 30, köşe 26, `card`, `line` kenar, gölge `float`). Sağ yarım: kenarlardan 16, köşe 32, `radial-gradient(120% 100% at 100% 0%, brandSoft 0%, card 62%)`, `line` kenar, iç 48/52, aralık 18: `Chip brand` "Tekrar hoş geldin" / "Welcome back"; `display` 32/38 "Kaldığın yerden devam et" / "Pick up where you left off"; `body` 16 "Planın, denemelerin ve SinoAI geçmişin seni bekliyor. Telefonda da aynı hesap." / "Your plan, practice tests and SinoAI history are waiting. Same account on your phone."; üç madde (`check` 18 `brand` + `headline`): "Gerçek sınav gibi denemeler, net ve konu analizi", "Eksik konularına göre günlük Ders Planı", "Takıldığın soruda SinoAI ile adım adım çözüm" / "Real exam-style practice tests with score and topic analysis", "A daily study plan built around your weak topics", "Stuck on a question? SinoAI solves it step by step"; `dark` "App Store" ve "Google Play" düğmeleri; altta telefon içinde ana ekran (`DevicePhone` 280, −4°, alttan −190 taşar). Panel yalnız geniş ekranda (dar ekranda form tek).
  - Kart içeriği: `title` 28 ortalı "Giriş yap" / "Sign in"; altında "Hesabın yok mu?" + `brandDeep` 800 "Kayıt ol" / "Sign up" (18 alt boşluk); aralık 14: `ghost` `md` Google, `ghost` `md` Apple (web'de Google önce); ayırıcı "veya" / "or"; `Field` E-posta (odaklı); `Field` "Şifre" / "Password" (`lock`, sağda `eye`); satır: solda `small` 700 `ink2` "E-postama kod gönder" / "E-mail me a code", sağda `small` 700 `brandDeep` "Şifremi unuttum" / "Forgot password"; birincil `lg` "Giriş yap" / "Sign in".
  - Klavye: Enter gönderir; şifre yöneticisi ve yapıştırma açık.

### `m-giris-kod` Doğrulama kodu · web: `w-giris-kod`

- **Görseller:** `acik/mobil/m-giris-kod.png`, `koyu/...`, `en/...`; `acik/web-panel/w-giris-kod.png`
- **Çerçeve:** `m-giris-oturum-ac` ile aynı.
- **Yerleşim:** aralık 18:
  1. `AuthTitle` "Doğrulama kodu" / "Verification code"; "ayse@ornek.com adresine gelen 6 haneli kodu gir." / "Enter the 6-digit code sent to ayse@ornek.com." (adres veriden).
  2. `CodeBoxes`: 6 kutu (48 × 58, köşe 16, `card`, 1,5 pt `line`; sıradaki boş kutu odaklı: `brand` kenar ve 4 pt `brand` %10 halka), rakam `title` 24.
  3. `Chip tone="outline"` `note` ikonlu "Kodu yapıştır" / "Paste code".
  4. Satır: `small` "Kod gelmedi mi?" / "No code?" ve sağda `small` 700 `brandDeep` "Tekrar gönder · 0:42" / "Resend · 0:42" (geri sayım; bitince yalnız "Tekrar gönder").
  5. `Card tone="soft"` (iç 14): `info` 18 `muted` + "Kod 10 dakika geçerli. Spam klasörüne de bak." / "The code is valid for 10 minutes. Check spam too."
  6. `small` 700 `ink2` "Şifrenle giriş yap" / "Sign in with your password".
  7. `BottomBar`: "Doğrula" / "Verify" (6 hane dolana kadar `disabled`); "Farklı bir e-posta mı?" / "Different e-mail?" + "Değiştir" / "Change".
- **Veri:** `POST StudentAuth/email-login` (`email`, `code`) → `auth` (oturum). Tekrar gönder aynı uca kodsuz.
- **Etkileşimler:** Kod alanı tek gizli giriş olarak çalışır; otomatik doldurma `one-time-code`; yapıştırılan 6 hane kutulara dağılır; 6. hane girilince doğrulama kendiliğinden başlayabilir (doğrulanmadı). "Kodu yapıştır" panodan okur. "Değiştir" ve geri → e-posta adımı.
- **Hâller:** Gönderiliyor (düğme loading); yanlış kod (alan hatası, kutular `error` kenar); süre doldu ("Kod süresi doldu. Yeni kod isteyin.").
- **Web farkı (`w-giris-kod`):** `AuthLayout` tanıtım panelsiz: ortalı kart, zemin `radial-gradient(60% 50% at 50% 0%, brandWash 0%, bg 70%)`; altta `over` "Sınavika’yı keşfet" / "Explore Sınavika" ve çipler: SinoAI, "Türkiye Geneli Deneme" / "Nationwide exams", "Net Hesaplama" / "Score calculator", "Paketler" / "Plans", Blog, "YKS hazırlık" / "YKS prep". Kart: başlık "Kodu gir" / "Enter the code", altında e-posta + `brandDeep` "Değiştir"; aralık 16: ortalı `small` "E-postana gelen 6 haneli kodu gir. Kod 10 dakika geçerli." / "Enter the 6-digit code from your e-mail. Valid for 10 minutes."; kod kutuları; ortalı "Kod gelmedi mi? · Tekrar gönder · 0:42"; `lg` "Doğrula ve giriş yap" / "Verify and sign in".

### `m-kayit-eposta` Hesap oluştur · web: `w-kayit`

- **Görseller:** `acik/mobil/m-kayit-eposta.png`, `koyu/...`, `en/...`; `acik/web-panel/w-kayit.png`
- **Yerleşim (mobil):** `m-giris-oturum-ac` ile aynı yerleşim; farklar: `AuthTitle` üstünde `Chip brand` "Planını kaydet" / "Save your plan"; başlık "Hesap oluştur" / "Create account"; metin "Planın, netlerin ve ilerlemen web ve mobilde aynı hesapta kalır." / "Your plan, scores and progress stay in one account on web and mobile."; düğme "Devam et" / "Continue"; alt satır "Zaten hesabın var mı?" / "Have an account?" + "Oturum aç" / "Sign in".
- **Etkileşimler:** "Devam et" → kod gönderilir → `m-giris-kod` → `m-kayit-bilgiler`. "Oturum aç" → `m-giris-oturum-ac`.
- **Web farkı (`w-kayit`):** Tanıtım paneli kayıt metinleriyle: "Sınavika’ya katıl" / "Join Sınavika"; "Ne çalışacağını bil, her gün ilerle" / "Know what to study, move forward every day"; "Sınavını ve hedefini seç; ilk günün planı iki dakikada hazırlansın." / "Choose your exam and goal; your first day's plan is ready in two minutes."; aynı üç madde. Kart (aralık 12): `title` 28 "Kayıt ol" / "Sign up" + "Zaten hesabın var mı? · Giriş yap"; Google, Apple; "veya"; iki sütun `Field` (yükseklik 46) "Ad" / "First name", "Soyad" / "Last name"; `Field` E-posta (46); `Field` Şifre (46, odaklı) ipucu "En az 8 karakter ve bir rakam" / "At least 8 characters and a number"; 20 pt `ink` onay kutusu (köşe 6) + `meta` "Kullanım Koşulları’nı ve KVKK aydınlatma metnini okudum." / "I have read the Terms and Privacy Notice."; `lg` "Hesabımı oluştur" / "Create my account"; ortalı `meta` "Kayıttan sonra 2 dakikada planını hazırlıyoruz." / "After sign-up we build your plan in 2 minutes." Kayıtta paket yok: önce plan, sonra paket.

### `m-kayit-bilgiler` Hesap oluştur · adın

- **Görseller:** `acik/mobil/m-kayit-bilgiler.png`, `koyu/...`, `en/...`
- **Yerleşim:** aralık 14: `AuthTitle` "Seni tanıyalım" / "Tell us about you"; "Adın, SinoAI ve e-postalarda sana hitap etmemiz için. Şifre gerekmez: her girişte e-postana kod gelir." / "Your name is how SinoAI and our e-mails address you. No password needed: each sign-in sends a code."; `Field` "Adın" / "First name" (odaklı, örnek "Ayşe"); onay satırı (aralık 10): 22 pt kutu (köşe 7, seçiliyse `ink` dolgu ve `bg` tik) + `small` "Kullanım Koşulları’nı ve KVKK aydınlatma metnini okudum." / "I have read the Terms and the Privacy Notice." (iki ad bağlantıdır). `BottomBar`: "Hesabımı oluştur" / "Create my account".
- **Veri:** `POST StudentAuth/email-login` (`email`, `code`, `name`) ile yeni hesap (DTO'da `name` alanı var; çağrı sırası API'de doğrulanmalı).
- **Etkileşimler:** Ad boşsa ya da onay yoksa düğme pasif. Bağlantılar yasal sayfayı uygulama içi tarayıcıda açar.
- **Kurallar:** Yalnız ad ve onay. Şifre sonra Hesap güvenliği'nden eklenir (`m-profil-guvenlik`).

### `m-sifre-unuttum` Şifremi unuttum · web: `w-sifre-unuttum`

- **Görseller:** `acik/mobil/m-sifre-unuttum.png`, `koyu/...`, `en/...`; `acik/web-panel/w-sifre-unuttum.png`
- **Yerleşim:** `AuthTitle` "Şifremi unuttum" / "Forgot password"; "E-posta adresine 6 haneli bir kod göndereceğiz." / "We will send a 6-digit code to your e-mail."; `Field` E-posta (odaklı). `BottomBar`: "Kod gönder" / "Send code"; "Şifreni hatırladın mı?" / "Remembered it?" + "Oturum aç" / "Sign in".
- **Veri:** `POST StudentAuth/forgot-password` (`email`).
- **Kurallar:** Hesap var mı yok mu söylenmez (aynı başarı cümlesi; doğrulanmadı).
- **Web farkı:** Ortalı kart (panelsiz): "Şifremi unuttum" + "Hatırladın mı? · Giriş yap" / "Remembered? · Sign in"; ortalı `small` açıklama; alan; "Kod gönder".

### `m-sifre-yeni` Kod ve yeni şifre · web: `w-sifre-sifirla`

- **Görseller:** `acik/mobil/m-sifre-yeni.png`, `koyu/...`, `en/...`; `acik/web-panel/w-sifre-sifirla.png`
- **Yerleşim:** aralık 14: `AuthTitle` "Gelen kutunu kontrol et" / "Check your inbox"; "a•••@ornek.com adresine gelen kodu gir, ardından yeni şifreni belirle." / "Enter the code sent to a•••@ornek.com, then set a new password." (adres maskeli); kod kutuları; `meta` `muted` "Kodun süresi: 8:12" / "Code expires in 8:12"; `Field` "Yeni şifre" / "New password" (`lock`, `eye`, odaklı); `Field` "Yeni şifre (tekrar)" / "Repeat password", yer tutucu "Şifreni tekrar yaz" / "Type it again". `BottomBar`: "Şifremi güncelle" / "Update password".
- **Veri:** `POST StudentAuth/reset-password` (`email`, `code`, `newPassword`, `confirmNewPassword`).
- **Hâller:** Eşleşmeyen şifre: tekrar alanının altında "Yeni şifre ve tekrarı eşleşmiyor."; süre doldu: "Kod süresi doldu. Yeni kod isteyin."; başarı: "Şifre güncellendi · Yeni şifre ile giriş yapabilirsin." → giriş.
- **Kurallar:** Şifre alanında göster/gizle (`eye`), ekran okuyucu adı "Şifreyi göster" / "Şifreyi gizle". Otomatik doldurma `new-password`.
- **Web farkı:** Ortalı kart: başlık "Yeni şifre" / "New password", altında maskeli adres + `brandDeep` "Kodu tekrar gönder" / "Resend code"; kod kutuları; iki alan (46); "Şifremi güncelle".

### `m-giris-sayfa` Misafir · hesap gerekli

- **Görseller:** `acik/mobil/m-giris-sayfa.png`, `koyu/...`, `en/...`
- **Çerçeve:** Arkadaki ekran karartılır (`rgba(11, 28, 48, 0.45)`, z 20); alt sayfa `Sheet` yükseklik 430, üst köşeler 28, `card`, iç 10/20/34, aralık 14; üstte 40 × 5 tutma çubuğu (`line`). (Arka plan çizimde eski iki sütunlu modül kartlarıdır; yalnız bağlamdır.)
- **Yerleşim:** Satır: `Tile` dokunulan modülün (örnek Akıllı Özet) 46 pt `solid` + `section` "Analizini kaydedelim" / "Let's save your analysis" + `small` "Akıllı Özet için hesap gerekir. 30 saniye sürer." / "Smart Summary needs an account. Takes 30 seconds."; Apple ve Google düğmeleri; `soft` `lg` `mail` "E-posta ile devam et" / "Continue with e-mail" (`brandSoft` zemin, `brandDeep` yazı); "Zaten hesabın var mı? · Oturum aç".
- **Veri:** Başlık ve metin dokunulan işe göre değişir (modül adı ve neden).
- **Etkileşimler:** §3.4.
- **Kurallar:** Tam ekran yönlendirme değil alt sayfa; öğrencinin işi arkada korunur.

### Web onboarding çerçevesi (`WebOnboarding`)

- Tuval 1440 × 900, zemin `card`. Sol sütun 700 px, iç 34/72, aralık 22: üst satır logo 30 ve sağda `small` 700 "Adım 1/6" / "Step 1/6"; `Steps` 6 bölüm; `Chip brand`; `display` 34/40 başlık; `body` 16 açıklama; içerik; boşluk; alt satır `ghost` `left` "Geri" / "Back" ve sağda birincil `lg` `right` ikonlu "Devam et" (ya da adımın düğmesi).
- Sağ panel: kenarlardan 16, köşe 32, `radial-gradient(120% 100% at 100% 0%, #FFEDD5 0%, bg 60%)`, önizleme ortada.
- Klavye: Enter "Devam et"; seçimler radyo grubu (oklarla gezilir); odak halkası 2 px `ink`.

### `w-onb-6-paket` Web onboarding 6 · Paketini seç

- **Görseller:** `acik/web-panel/w-onb-6-paket.png`, `koyu/web-panel/w-onb-6-paket.png`
- **Yerleşim:** Adım 6/6. Çip "Paket" / "Plan"; başlık "Paketini seç" / "Pick your plan"; metin "Ödemeden sonra bütün modüller açılır. İstediğin an iptal edebilirsin; iptal, dönemin sonunda geçerli olur." / "Every module opens after payment. Cancel any time; it takes effect at the end of the period."
  - Paket satırları (aralık 10; iç 16, köşe 18, seçili 2 pt `ink` kenar, değilse 1,5 pt `line`; solda 22 pt radyo): "YKS Yıllık" / "YKS Yearly" · "₺249/ay · yıllık ₺2.990 · 2 ay hediye" / "₺249/mo · ₺2,990 a year" + sağda `Chip brand` "En çok seçilen" / "Most popular" (seçili); "YKS Aylık" / "YKS Monthly" · "₺299/ay".
  - `small` 700 `ink2` bağlantı "Şimdilik paket seçme" / "Not now".
  - Yedi modülün `Tile` 34 sırası (aralık 8).
  - Düğme "Ödemeye geç" / "Go to payment".
  - Sağ önizleme: telefon içinde ana ekran ve `Chip outline` "Tüm modüller açık" / "Every module open".
- **Veri:** Satılabilir paketler (abonelik paketleri ucu), seçilen sınava göre süzülür; fiyatlar pazara ve para birimine göre.
- **Etkileşimler:** §3.5/3. Ödeme sayfası Profil/ödeme belgesine aittir.
- **Kurallar:** Web'de deneme süresi yok; kartla ödenir.

## 5. Takılma ve kilitlenme önlemleri

- **Çift dokunuş:** Onboarding yalnız görünen adımdan ilerler; hızlı çift dokunuş adım atlatmaz. Her gönderen düğme (Kod gönder, Doğrula, Planımı hazırla, Hesabımı oluştur, Şifremi güncelle, Ödemeye geç) loading iken kilitli; ikinci istek gitmez.
- **Sosyal giriş:** Apple/Google penceresi açıkken ikinci düğme yok sayılır. Vazgeçme hata değildir (sessizce eski hâl).
- **Zaman aşımı:** Her istek zaman aşımı süresinde (okuma 25 sn, gönderim 60 sn; [Navigasyon](Navigasyon.md) §6.1) dönmezse düğme açılır, alanın altında ya da kısa bildirimle "Kaydedemedik. Tekrar dene." Plan kurma uzun sürebilir: düğme loading kalır, ekran donmaz, geri tuşu çalışır.
- **Kaldığı yerden devam:** Onboarding adımı ve cevaplar her değişimde yazılır (mobil cihaz deposu, web tarayıcı deposu); uygulama ya da sekme kapanırsa aynı adım. Plan bir kez kurulur.
- **Kod sayacı:** Geri sayım ekran arka plandayken de doğru kalır (bitiş zamanı saklanır, saniye sayılmaz). Süre dolunca "Doğrula" pasif, "Tekrar gönder" açık.
- **Klavye:** Alanlar klavyenin altında kalmaz; `BottomBar` klavyenin üstüne çıkar. Kod kutusu odakta kalır.
- **Ağ kopması:** Gönderim hatası alanın altında; girilen değerler silinmez.
- **Geri:** Her ekranda sistem geri çalışır; karşılama hariç (orada uygulamadan çıkar). Alt sayfa geri tuşuyla kapanır. Mağaza ve izin pencereleri kapanınca ekran aynı hâlde döner.
- **Oturum değişimi:** Giriş sırasında başka bir oturum değişirse eski yanıt yok sayılır.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | mobil | tüm `m-giris-*`, `m-kayit-*`, `m-sifre-*`, `m-onb-*` | Açık, koyu, EN | `acik/`, `koyu/`, `en/acik/mobil/<id>.png` ile yan yana aynı |
| 2 | görsel | web | `w-giris`, `w-giris-kod`, `w-kayit`, `w-sifre-*`, `w-onb-*` | 1440 × 900 açık ve koyu | `web-panel/<id>.png` ile aynı |
| 3 | e2e | mobil | 3.1 | Karşılama → 5 adım → plan → Apple → deneme → mağaza (test ortamı) | Bugünkü ilk konu oynatıcıda açılır; ilk çalışmadan sonra bildirim izni ekranı |
| 4 | e2e | mobil | 3.1 | E-posta yolu: kod → ad → deneme | Hesap açılır, ad kaydolur, deneme ekranı |
| 5 | e2e | mobil | onboarding | 3. adımda uygulamayı kapat, aç | 3. adım ve önceki cevaplar geri gelir |
| 6 | e2e | mobil | onboarding | "Devam et"e iki kez hızlı dokun | Yalnız bir adım ilerler |
| 7 | birim | ikisi | ilerleme | Adım kimlikleri | Karşılama ve bölge sayılmaz; çubuk 5 adım (mobil) |
| 8 | e2e | mobil | `m-onb-1-sinav` | Oturum seçmeden "Devam et" | Düğme pasif ya da "En az bir oturum seç." |
| 9 | e2e | mobil | `m-onb-4-dersler` | Plan kurma ucu 500 | "Planını hazırlayamadık. Tekrar dene."; düğme yeniden açık |
| 10 | e2e | mobil | `m-giris-kod` | 6 haneyi yapıştır | Haneler kutulara dağılır, "Doğrula" etkin |
| 11 | e2e | mobil | `m-giris-kod` | Yanlış kod | Alan hatası, kutular kırmızı kenar; yeniden denenebilir |
| 12 | e2e | ikisi | kod | Sayaç 0:00 | "Tekrar gönder" açılır; tek istek |
| 13 | e2e | ikisi | şifre | Unuttum → kod → eşleşmeyen şifre | Tekrar alanının altında eşleşme hatası |
| 14 | e2e | ikisi | şifre | Doğru kod ve şifre | Başarı; giriş ekranı; yeni şifreyle giriş olur |
| 15 | e2e | mobil | `m-giris-sayfa` | Misafir Akıllı Özet kaydına dokunur, aşağı çeker | Alt sayfa kapanır, iş yerinde |
| 16 | e2e | web | 3.5 | Kayıt → 6 adım → "Ödemeye geç" | `/student/odeme` açılır, seçilen paketle |
| 17 | e2e | web | onboarding | Planı olan öğrenci `/student/baslangic` | Ana sayfaya yönlenir |
| 18 | e2e | web | `w-giris` | Tarayıcı geri adım 4'ten | Adım 3, seçim korunur |
| 19 | erişilebilirlik | ikisi | tüm alanlar | Ekran okuyucu | Her alanın etiketi okunur; hata duyurulur; Apple/Google düğme adları |
| 20 | erişilebilirlik | mobil | onboarding | En büyük yazı | Başlık, seçim satırları ve düğmeler kesilmez; içerik kayar |
| 21 | erişilebilirlik | web | giriş | Yalnız klavye | Sekme sırası görsel sırayla aynı; odak halkası görünür; Enter gönderir |
| 22 | erişilebilirlik | ikisi | tümü | Kontrast | Düğme yazısı `#C2410C` üstünde 5,2:1; `brandDeep` bağlantılar ≥ 4,5:1 |
| 23 | birim | ikisi | fiyat ve yüzde | TR ve EN | TR `₺2.990`, `%20`; EN `₺2,990`, `20%` |
| 24 | görsel | web | `w-giris` | 768 px | Tanıtım paneli gizli, form tek; yatay kaydırma yok |
| 25 | e2e | mobil | `m-onb-8-bildirim` | "Şimdi değil" | Sistem penceresi açılmaz |

## 7. Çizim ile bugünkü kod arasındaki farklar

Mobil kök: `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src`. Web kök: `C:\Users\onurc\source\repos\sinavika_frontend_student\src`.

1. **Mobil onboarding sırası farklı.** `app/onboarding/config/onboardingSteps.ts`: karşılama → (bölge) → sınav → net → tempo → dersler → ödeme. Ayrı "Planın hazır" ekranı (`m-onb-5-plan`) yok; plan özeti ödeme ekranının üstünde (`OnboardingTrialStep.tsx`, `StudyPlanOnboardingSummaryCard`). Hesap ekranı (`m-onb-6-hesap`) yok: satın alma hesapsız yapılır, erişim cihaza bağlanır; hesap isteği sonra uygulama içinde gelir (`registerReminderStore`). İlerleme çubuğu planı değil ödeme adımını 5. sayar.
2. **İlk konu ve bildirim izni.** Satın almadan sonra ana ekrana girilir, ilk konu açılmaz. Bildirim izni ilk çalışmadan hemen sonra değil, öğrenci bir modülden ana ekrana döndüğünde sorulur (`infrastructure/engagement/inAppAskQueue.ts`, `app/navigation/RootNavigator.tsx`). Metinler farklı: "Çalışma planını sana hatırlatalım mı?" / "Evet, hatırlat" / "Şimdi değil" (`catalogs/tr-TR/onboarding.ts`).
3. **Tek giriş ekranı, varsayılan şifre.** `AuthLogin` ve `AuthRegister` aynı ekranı açar (`RootNavigator.tsx`). `AuthLoginScreen.tsx` varsayılan adımı e-posta + şifre (`step = 'password'`); kod yolu "Şifren yok mu? Kodla devam et" bağlantısıyla ikincil (kod adımından dönüş "Şifrenle giriş yap"). Çizimde e-posta kodu varsayılan, şifre ikincil ("Şifrenle giriş yap"). Ad soran `m-kayit-bilgiler` ekranı kodda yok (DTO'da `name` var). "Hesap oluştur" alt satırı ve "Planını kaydet" çipi yok; ekranda yasal onay cümlesi ve "Paketlere dön" bağlantısı var.
4. **Misafir alt sayfası.** `AuthEntrySheet.tsx` ortalı bir pencere (`AppDialog`, en çok 380 pt), alt sayfa değil; metin "Devam etmek için giriş yap" / "Hesabınla giriş yapabilir veya ücretsiz kayıt oluşturabilirsin."
5. **Gün kısaltmaları.** Mobil tempo adımında günler tek harf: "P S Ç P C C P" (EN "M …") (`catalogs/tr-TR/onboarding.ts` `dayMon…daySun`); çizimde "Pzt … Paz".
6. **Karşılama metinleri.** Kod slaytları `m-onb-0-karsilama`'nın önizleme metinlerini kullanır (Dersler "DEVAM ET · Sözcükte Anlam", Denemeler "DENEME · Hedefine bilgiyle yaklaş"); Akıllı Özet slaytı "Soruyu çek, videoyu özetle · Adım adım soru çözümü ve YouTube özeti; ikisi de PDF olarak iner." Çizimde (`m-giris-karsilama`) slaytlar `MODULES.*.slide` metinleri ve beyaz eylem düğmeleriyle; kodda düğme yok.
7. **Web kayıt.** `/student/register` giriş sayfasını açar (`LoginPage showcase="register"`): Ad, Soyad, Şifre alanları ve "Kayıttan sonra 2 dakikada…" satırı yok. Pazarlama izni onay kutusu var.
8. **Web giriş düzeni.** `features/auth/pages/_components/AuthLayout.tsx`: üst satır ("Ana sayfa" geri bağlantısı, ortada logo, tema düğmesi) yok; logo formun üstünde, altta alt bilgi. Tanıtım paneli teal tonlarında (`brand-teal-light`, `text-brand-teal-dark`), çizimde `brandSoft` turuncu yıkama ve `Chip brand`. Panelde telefon içinde ana ekran yerine site görselleri (`HeroScreens`). Şifre sayfalarındaki "Sınavika’yı keşfet" çipleri doğrulanmadı.
9. **Web onboarding.** `features/onboarding/pages/OnboardingPage.tsx` 5 adım (paket 5. adım); çizimde 6 adım ve ayrı "Planın hazır" sayfası. Paket adımı metinleri: başlık "Sana uygun paketi seç", açıklama "Planın hazır. Paketini seç; web'de ücretsiz süre yok, ödeme kartla hemen alınır.", düğme "Paketi al" (çizim: "Paketini seç", "Ödemeye geç"). "Şimdilik paket seçme" yok (kodun kuralı: paket alınmazsa panel açılmaz). 2. adımda "Hedef bölüm (isteğe bağlı)" alanı yok.
10. **Bölge ekranı.** Çizimde `Steps` 6 bölümden 1'i dolu ve seçim turuncu (`brandWash`, `brand` kenar); bu, "ilerleme yalnız beş adımı sayar" ve "seçili = koyu çerçeve ve tik" kurallarıyla çelişir. Düğme "Devam" (diğerleri "Devam et"). Kod ilerleme çubuğunu bölgede göstermez (`resolveOnboardingProgressIndex` −1).
11. **Çizim içi tutarsızlıklar.** Düzeltildi (17 Kasım 2026): sessiz saat her yerde 22:00–08:00; EN fiyat "₺299/mo"; iki karşılamanın EN başlığı "Know what to study, move ahead every day."; `w-onb-5-plan` ilk görev etiketi Dersler `ink` tonunda; web onboarding sağ paneli koyu temada `brandSoft`; `m-onb-0-bolge` seçimi koyu çerçeve ve tik, ilerleme çubuğu yok. Uygulamanın ilk ekranı `m-onb-0-karsilama`; `m-giris-karsilama` oturumu kapatmış öğrencinin karşılamasıdır. Açık kalan: `w-onb-6-paket` EN alt satırında "2 months free" yok; `m-giris-sayfa` arka planındaki eski modül kartları (alt sayfanın arkası, karartma altında).
