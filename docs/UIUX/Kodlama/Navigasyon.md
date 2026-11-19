# Navigasyon, geçişler ve kilitlenmeme kuralları (mobil ve web)

Güncelleme: 17 Kasım 2026 · Önce oku: [README](README.md)

Bu belge ekranlar arası yolu tanımlar:
- hangi ekran hangi rotada;
- ekranlar arasında hangi geçiş türü kullanılır;
- geri tuşu ne yapar;
- kapılar (güncelleme, giriş, onboarding, abonelik) hangi sırayla çalışır;
- bildirim ve bağlantı hangi ekranı açar;
- hiçbir ekranda takılma ve kilitlenme olmaması için hangi kurallar uyulur.

Modül dosyalarındaki süreçler buradaki geçiş türlerini kullanır.

Bugünkü kodun durumu 17 Kasım 2026'da okundu. Kaynaklar:
- **Mobil:** `sinavika_mobile_reactnative`, React Navigation 7 (`native-stack`, `bottom-tabs`), Expo 54.
- **Web:** `sinavika_frontend_student`, Next.js 16 App Router, `next-intl`, `/tr` ve `/en` önekli.

## 1. Mobil gezinme ağacı

Rota adları korunan bir sözleşmedir. Çizim, uygulamanın bugünkü rota adlarına göre çizilmiştir; çizim için rota adı değiştirilmez. Aşağıda her rotanın yanında çizim kimlikleri vardır.

```
RootStack (src/app/navigation/RootNavigator.tsx)
├── [açılış] ScreenLoading → boot bitene kadar (en çok 3 sn oturum geri yükleme)
├── Onboarding  (ProductOnboardingScreen)                          m-giris-karsilama, m-onb-0-karsilama … m-onb-7-deneme, m-onb-8-bildirim
├── AuthLogin   [fullScreenFlow]                                   m-giris-oturum-ac, m-giris-kod, m-giris-sayfa (alt sayfa)
├── AuthRegister [fullScreenFlow]                                  m-kayit-eposta
├── AuthForgotPassword [fullScreenFlow]                            m-sifre-unuttum, m-sifre-yeni
└── Main = ModuleHubNavigator (stack)
    ├── ModuleHubHome  (Bugün, ana ekran)                          m-hub-moduller, -kaydir, -ipucu, -plansiz, -gun-bitti, -abonelik-bitti
    ├── NotificationInbox                                          m-bildirimler, m-bildirimler-bos
    ├── Profile → ProfileStack                                     m-profil … (bkz. 10-Profil-Hesap-Abonelik.md)
    ├── Support → SupportStack                                     m-destek, m-destek-talepler, m-destek-yeni, m-destek-talep
    ├── SinoAi → SinoAiStack [fullScreenFlow]                      m-sino-*
    ├── ExamModule → ExamTabNavigator                              m-deneme-*, m-istatistik-* için 03-Denemeler.md
    ├── WorksModule → WorkTabNavigator                             m-ders-*
    ├── QuizModule → QuizTabNavigator                              m-test-*
    ├── StudyPlanModule → StudyPlanStack (kökü sekme gezgini)      m-plan-*
    ├── LensModule → LensTabNavigator                              m-ozet-*
    └── FlashcardModule → FlashcardTabNavigator                    m-kart-*
Kökün dışında, her şeyin üstünde: ForceUpdateGate (m-durum-guncelleme), StudentAccessCategoryGate, SubscriptionRequiredGate, AppToastHost
```

### 1.1 Modül sekme gezgini (beş yuva)

Her modül gezgini aynı beş yuvayı kullanır (`MainTabBar`, `Modul-Kimligi.md` §6):

| Yuva | Ne yapar |
|---|---|
| 1 | Modülün kendisi. Vitrin: o modülün `-vitrin` çizimi |
| 2 | Modülün ana işi |
| 3 | **Modüller**: `ModuleHubHome`'a döner (`popToModuleHubHome`). Gezinme geçmişine yeni ekran eklemez |
| 4 | Kayıtlar ya da ikinci iş |
| 5 | **Profil**: hub düzeyindeki `Profile` yığınını açar; sekme değildir |

| Modül | Yuva 1 | Yuva 2 | Yuva 4 |
|---|---|---|---|
| Denemeler | `ExamDashboard` · Denemeler (`m-deneme-vitrin`) | `MyExams` · Denemelerim (`m-deneme-denemelerim`) | `ExamResults` · Sonuçlar (`m-deneme-sonuclar`) |
| Dersler | `WorkHome` · Dersler (`m-ders-vitrin`) | `WorkCatalog` · Konular (`m-ders-konular`) | `WorkReview` · Tekrar (`m-ders-tekrar`) |
| Testler | `QuizHome` · Testler (`m-test-vitrin`) | `QuizCatalog` · Konular (`m-test-konular`) | `QuizSolutions` · Çözümler (`m-test-cozumler`) |
| Ders Planı | `StudyPlanHome` · Bugün (`m-plan-bugun`) | `StudyPlanProgress` · İlerleme (`m-plan-ilerleme`) | `StudyPlanSchedule` · Program (`m-plan-program`) |
| Akıllı Özet | `LensAnalyses` · Akıllı Özet (`m-ozet-vitrin`) | `LensNew` · Soru yükle (`m-ozet-yukle`) | `LensVideo` · Video (`m-ozet-video`) |
| Bilgi Kartları | `FlashcardStack` · Kartlar (`m-kart-vitrin`) | `FlashcardToday` · Bugün (`m-kart-bugun`) | `FlashcardSavedTab` · Kaydedilenler (`m-kart-kaydedilen`) |
| SinoAI | sekme çubuğu yok; tam ekran, üstte Sohbet · Çalışma geçişi | | |

Sekme kuralları:
- Sekme değişiminde animasyon yoktur; seçim titreşimi vardır.
- Her sekme kendi yığınını korur. Sekmeye dönünce kaldığı ekran ve kaydırma yeri durur (`freezeOnBlur`).
- Etkin sekmeye yeniden dokunmak:
  - sekme kendi kökünde değilse köke döner;
  - kökündeyse sayfanın başına kaydırır.
- Odak ekranlarında sekme çubuğu gizlenir (`tabBarStyle: {display: 'none'}`): `ExamStudentSolve`, `QuizSolve`, `WorkMikro`, `WorkReviewSession`, `FlashcardSession`, `StudyPlanFocus`, `LensCamera`.
- Geniş pencerede (tablet, 600 pt üstü) sekme çubuğu sol rayına döner (`ModuleTabRailFrame`). Yuvalar ve sıra aynıdır.

## 2. Web rota ağacı

Bütün yollar `/{locale}/student/...` altındadır (`tr` varsayılan, `en`). Gezinme `@/i18n/navigation` ile yapılır; `next/link` kullanılmaz.

| Alan | Yol | Çizim |
|---|---|---|
| Giriş (boş düzen) | `login`, `register`, `forgot-password`, `reset-password` | `w-giris`, `w-giris-kod`, `w-kayit`, `w-sifre-unuttum`, `w-sifre-sifirla` |
| Onboarding (odak) | `baslangic` | `w-onb-1-sinav` … `w-onb-6-paket` |
| Ana sayfa | `dashboard` | `w-panel-anasayfa`, `-plansiz`, `-gun-bitti`, `-abonelik-bitti`, `w-panel-tur` |
| Tüm modüller | `moduller` (bugün `dashboard`'a yönlenir) | `w-panel-moduller` |
| Denemeler | `sinavlarim`, `denemelerim`, `sinav/[examId]`, `sinav/[examId]/basla`, `sinav-sonuclari`, `sinav-sonuclari/[snapshotId]`, `soru-cozumleri`, `soru-cozumleri/[examAttemptId]`, `raporlarim` | `w-deneme-*`, `w-istatistik` |
| Deneme çözme (odak) | `sinav/coz/[examUserId]` | `w-deneme-coz`, `w-deneme-teslim` |
| Dersler | `ders-cal`, `ders-cal/ders` (Konular sekmesi: ilk dersin konuları), `ders-cal/ders/[lessonMainId]`, `ders-cal/konu/[lessonSubId]` (konuya yönlendirir; sayfa yok), `.../ozet`, `ders-cal/tekrar` | `w-ders-*` |
| Ders oynatıcı (odak) | `ders-cal/mikro/[workMikroId]`, `ders-cal/tekrar/oturum` | `w-ders-tanim` … `w-ders-soru`, `w-ders-tekrar-oturum` |
| Testler | `testler`, `testler/konular?main=&sub=`, `testler/cozumler`, `testler/cozumler/[attemptId]` | `w-test-*` |
| Test çözme (odak) | `testler/quiz/[quizId]` | `w-test-coz`, `w-test-coz-yanlis` |
| Ders Planı | `ders-plani`, `.../program`, `.../oneriler`, `.../istatistik`, `.../ilerleme`, `.../ayarlar` | `w-plan-*` |
| Odak (odak) | `ders-plani/calis/[taskId]` | `w-plan-odak` |
| Akıllı Özet | `lens`, `lens/yeni`, `lens/gecmis`, `lens/analiz/[id]`, `lens/video`, `lens/video/[id]` | `w-ozet-*` |
| Bilgi Kartları | `flashcard`, `flashcard/bugun`, `flashcard/browse`, `flashcard/kaydedilenler` | `w-kart-*` |
| Kart oturumu (odak) | `flashcard/session` | `w-kart-oturum` |
| SinoAI | `sinoai`, `sinoai/uret`, `sinoai/[conversationId]`, `sinoai/kutuphane`, `sinoai/kutuphane/not/[id]`, `sinoai/kaynaklarim` | `w-sino-*` |
| Hesap | `bildirimler`, `profil` (`#hesap`, `#hedefim`, `#abonelik`, `#bildirimler`, `#guvenlik`), `destek`, `destek/[id]`, `odeme`, `odeme/basarili`, `odeme/basarisiz` | `w-panel-bildirimler`, `w-panel-profil`, `w-panel-abonelik`, `w-panel-ayarlar`, `w-panel-destek*`, `w-panel-odeme*` |

Kurallar:
- **Panel düzeni:**
  - Sol menü + üst çubuk + modül hap sekmeleri (`StudentModuleTabs`). SinoAI'de hap sekme yoktur.
  - **Kabuk (sahip, 18 Kasım 2026):**
    - Üst çubuk ve sol menü aynı `card` zeminde, aralarında çizgi yoktur. Sayfa `bg` zeminde ayrı bir yüzeydir; sol üst köşesi 26 px yuvarlaktır.
    - Üst çubuk üç sütundur (1fr / 32rem / 1fr): arama ortada, sağda tema düğmesi ve hesap menüsü. Zil ve destek sol menünün Hesap bölümündedir; hedef çipi yoktur.
    - Sol menüde logo 68 px satırda tek başınadır. Altta "Çıkış yap" ve yanında daralt düğmesi durur; menü daraltılınca ikisi alt alta gelir.
    - Modüller menüde Ders Planı, Dersler, Testler, Denemeler, Bilgi Kartları, Akıllı Özet, SinoAI sırasıyla dizilir.
  - 768 px altında sol menü çekmeceye döner. Çekmece üstte açılır; Escape ve dışına dokunma kapatır, açıkken sayfa kaymaz.
- **Odak (`(immersive)`) sayfaları:**
  - Menü ve üst çubuk yoktur.
  - Üstte "Ara ver" / "Pause" düğmesi vardır; panelde kaldığı sayfaya döner.
- **Web adresi ekranı anlatır.** Sekme, süzgeç ve seçili ders adreste durur (`?main=`, `#abonelik`). Sayfa yenilenince ya da adres paylaşılınca aynı görünüm açılır.
- Tarayıcının geri ve ileri düğmeleri uygulama içi gezinmeyle aynı sonucu verir.

## 3. Geçiş türleri

| Tür | Mobil | Web | Ne zaman |
|---|---|---|---|
| **İtme (push)** | `StackTransition.detail`: sağdan 280 ms, kenardan kaydırarak geri | sayfa geçişi (`StudentMainTransition`), içerik 240 ms solar ve 8 px yükselir | Liste → detay, modül içi alt sayfa |
| **Tam ekran akış** | `StackTransition.fullScreenFlow` (alttan, `fullScreenModal`) | odak düzeni | Giriş ve kayıt, SinoAI, onboarding |
| **Odak oturumu** | `StackTransition.focusedSession`: kaydırarak geri kapalı, sekme çubuğu yok | `(immersive)` yolu | Deneme ve test çözme, ders oynatıcısı, tekrar oturumu, kart oturumu, odak sayacı, kamera |
| **Alt sayfa** | `AppSheet`: 320 ms sayfa eğrisi, parmağı izler, %45 ya da 500 pt/sn fiskeyle kapanır | `Overlay` (ortada pencere ya da sağdan panel) | Görev ekle ve görev işlemleri, giriş isteyen eylem, seçim listeleri |
| **Onay penceresi** | `AppDialog`: 0,96 ölçekten 280 ms | `ConfirmDialog` | Geri alınamaz işlem: teslim et, sil, hesabı kapat, oturumu bitir |
| **Yerinde değişim (replace)** | `navigation.replace` / `reset` | `router.replace` | Kapıdan geçince (giriş → ana ekran), adım akışı bitince (test bitti, teslim edildi). Geri tuşu bitmiş akışa dönmez |
| **Sekme değişimi** | animasyon yok, seçim titreşimi | hap sekme, animasyon yok | Modül yuvaları |

Kurallar:
- Süreler `UI_MOTION`'dan gelir (README §4.4).
- Çıkış girişten kısadır ve geldiği yöne gider.
- "Hareketi azalt" açıkken itme ve alt sayfa en çok 150 ms solmaya döner.
- Bir ekranda aynı anda tek geçiş olur. Alt sayfa açıkken yeni ekran itilmez:
  1. alt sayfa kapanır;
  2. kapanış bitince (`onDismiss`) gezinme yapılır.

  iOS'ta açık bir `Modal` varken yığına itilen ekran görünmez; bu sıra o yüzden zorunludur.

## 4. Geri davranışı

Sistem geri tuşu (Android) ve kenardan kaydırma (iOS) **her ekranda** çalışır. Kullanıcı hiçbir ekranda sıkışmaz.

| Ekran türü | Geri / kapat ne yapar |
|---|---|
| Modül sekme kökü (yuva 1, 2, 4) | `ModuleHubHome`'a döner (Modüller). Android'de sistem geri tuşu da aynısını yapar |
| `ModuleHubHome` | Android: uygulamadan çıkar (sistem davranışı). İlk geri basışta onay istenmez |
| Detay ekranı | Bir önceki ekrana döner; liste kaydırma yeri korunur |
| Alt sayfa, pencere | Yalnız kendisini kapatır. Karartmaya dokunma da kapatır; zorunlu kapılar hariç |
| **Deneme çözme** (`ExamStudentSolve`, `w-deneme-coz`) | Hemen çıkmaz. "Ara ver" penceresi açılır: **Devam et** (birincil) ve **Ara ver, sonra devam ederim**. Ara verilince cevaplar kayıtlıdır, süre sunucuda işlemeye devam eder; çizimdeki kural `03-Denemeler.md`'de. Web'de tarayıcıdan çıkış ve sekme kapatma `beforeunload` uyarısıyla korunur |
| Test çözme, ders oynatıcısı, tekrar oturumu, kart oturumu | Onay istemeden çıkar. Verilen her cevap zaten kaydedilmiştir. Geri dönünce aynı soru ya da adım açılır |
| Odak sayacı (`StudyPlanFocus`) | "Odağı bitir?" penceresi: **Devam et** / **Bitir**. Bitirilirse geçen süre kaydedilir |
| Kamera (`LensCamera`) | Kamerayı kapatır, Soru yükle ekranına döner |
| Onboarding adımı | Bir önceki adıma döner; cevaplar korunur. İlk adımda Karşılama'ya döner |
| Giriş ve kayıt akışı | Kapat (`x`) Karşılama'ya ya da geldiği ekrana döner. Kod ekranında geri e-posta alanına döner, e-posta dolu kalır |
| Bitmiş akış ekranı (test bitti, konu sonu, teslim edildi, ödeme sonucu) | Akışın başına değil, akışın açıldığı listeye döner. Geri ile çözme ekranına dönülmez |
| Zorunlu güncelleme (`m-durum-guncelleme`) | Kapatılamaz; tek eylem mağazaya gider. Kullanıcının çıkış yolu uygulamayı kapatmaktır |

## 5. Kapılar ve sıralama

### 5.1 Mobil açılış sırası

1. **Açılış:**
   - Yazı tipleri, tema ve dil okunur.
   - Açılış ekranı en çok 1,2 sn kalır.
   - Oturum geri yüklemesi en çok 3 sn sürer. Süre dolarsa kayıtlı oturumla devam edilir; kullanıcı beklemez.
2. **Zorunlu güncelleme** (`GET api/app/version`): sürüm eskiyse `m-durum-guncelleme`. Kapatılamaz.
3. **Onboarding bitmediyse:** `Onboarding` (Karşılama).
4. **Oturum yoksa:**
   - Misafir modülleri görebilir.
   - Hesap gerektiren eyleme dokununca alt sayfa açılır (`m-giris-sayfa`); tam ekran yönlendirme yapılmaz.
   - Doğrudan giriş isteyen yol `AuthLogin`'dir.
5. **Sınav kategorisi seçilmediyse:** kategori kapısı (`StudentAccessCategoryGate`).
6. **Erişim yoksa** (3 günlük mağaza denemesi bitti, ödeme yok): `m-hub-abonelik-bitti`.
   - Ana ekran açılır, ilerleme korunur, modül kartları kilitlidir.
   - Eylemler: "Paketleri gör" ve "Satın alımı geri yükle".
   - Tam ekran abonelik kapısı yalnız kilitli modüle girilmeye çalışılınca açılır. Paket ve abonelik ekranlarında, hesap kapatmada ve giriş ekranlarında açılmaz.
7. **Bekleyen bağlantı:** Uygulama bir bildirim ya da bağlantıyla açıldıysa hedef bu kapıların hepsinden geçtikten sonra açılır. Kapıda beklerken bağlantı kaybolmaz.

### 5.2 Web sırası

1. **Oturum kapısı** (`StudentRouteGuard`):
   - Oturum yoksa `login?returnUrl=…` açılır.
   - Girişten sonra `returnUrl`'e dönülür; yalnız güvenli iç yollar kabul edilir.
2. **Erişim kapısı** (`StudentAppAccessGuard`):
   - Erişim yoksa `profil?kilit=erisim#abonelik` açılır.
   - Yalnız `odeme`, `profil`, `baslangic` açık kalır.
3. **Yeni hesap:**
   - Girişten sonra `baslangic` (web onboarding) açılır.
   - Planı olmayan öğrenciye ana sayfa `w-panel-anasayfa-plansiz` hâlini gösterir.
4. **Kapı bekleme süresi:**
   - Kapılar beklerken tam ekran `SinavikaPageLoader` görünür.
   - Bu bekleme en çok istemci zaman aşımı kadar sürer.
   - Süre dolunca "Tekrar dene" ve "Çıkış yap" seçenekli hata görünür. Sonsuz yükleme olmaz (§6).

### 5.3 Bildirim ve bağlantı hedefleri

- Bildirime ya da `sinavika.com` bağlantısına dokununca doğrudan hedef ekran açılır. Arada ana ekran ya da açılış animasyonu gösterilmez.
- Geri tuşu hedeften modülün köküne, oradan `ModuleHubHome`'a gider; uygulamadan atmaz.
- Bütün tür → ekran tablosu [11-Bildirim-Destek-Durumlar.md](11-Bildirim-Destek-Durumlar.md)'dedir.
- Mobilde tek giriş noktası `runNotificationNavigation`'dır; web bağlantıları `webUrlToAppLink` ile çevrilir.
- Webde `resolveNotificationActionUrl` ve `resolveNotificationTargetUrl` kullanılır.
- Hedef artık yoksa (silinmiş deneme, kapanmış talep) modülün kökü açılır ve kısa bildirim çıkar: "Bu içerik artık yok" / "This item is no longer available". Boş ya da hatalı ekran açılmaz.

## 6. Takılma ve kilitlenme olmaması

### 6.1 Kurallar (iki istemci)

1. **Gezinme beklemez.**
   - Dokunuşta ekran hemen açılır. Veri, açılan ekranın içinde yüklenir (ortada `LoadingLogo`).
   - Gezinmeden önce `await` ile API beklenmez.
   - İstisna: sonucu hedef ekranı belirleyen işlem (ör. görev oluştur → görev ekranı). Bu durumda düğme `loading` olur, ekran dokunmaya açık kalır, iş bitince gidilir. Hata olursa aynı ekranda kısa bildirim çıkar.
2. **Her bekleyişin sonu vardır.** İstemci zaman aşımları:
   - mobil okuma 25 sn;
   - gönderim 60 sn;
   - Akıllı Özet işleme 180 sn.

   Web de aynı değerleri kullanır. Süre dolunca yerinde "Tekrar dene"li hata çıkar. Kapı yüklemesi de dahil, hiçbir dönen gösterge süresiz kalmaz.
3. **Tek istek.**
   - Gönderen düğme `loading` iken kilitlidir.
   - Aynı ekran aynı veriyi iki kez istemez; yeni yükleme eskisini geçersiz kılar.
   - Teslim, ödeme ve görev oluşturma sunucuda tekrar güvenlidir (idempotent anahtar).
4. **Odakta yenileme ekranı silmez.** Ekrana dönünce içerik yerinde kalır, arkada yenilenir, üstte küçük gösterge çıkar. Odaklanınca `loading` açıp içeriği silmek yasaktır.
5. **Cevaplar kaybolmaz.**
   - Çözme, oynatıcı ve kart oturumunda her cevap önce cihazda saklanır, sonra gönderilir.
   - Ağ koparsa sıraya girer, gelince sırayla gider.
   - Uygulama kapanır ya da arka plana geçerse aynı yerden devam edilir.
6. **Kapı gezinmeyi kilitlemez.**
   - Tam ekran kapı (abonelik, kategori, güncelleme) açıkken altta yığına ekran itilmez.
   - Kapı kapanınca bekleyen hedef açılır.
   - Kapı içindeki her düğme çalışır; kapı kendi yüklemesinde takılırsa "Tekrar dene" vardır.
7. **Tek hata sınırı yetmez.**
   - Mobilde uygulama düzeyindeki sınırın yanında her modül yığınının kendi sınırı vardır. Bir modül çökerse yalnız o modül "bu bizden kaynaklı" hata ekranını gösterir; sekme çubuğu ve geri tuşu çalışır.
   - Webde her panel yolunun `error.tsx` dosyası olur; yoksa en yakın düzeyde vardır.
8. **İlerleme çubuğu takılmaz.** Webde yol ilerleme çubuğu gezinme başarısız olursa da kapanır (en çok 10 sn).
9. **Uzun listeler** sanal listeyle (mobil `FlatList` / `FlashList`) ya da sayfalı yüklemeyle ("Daha fazla") çizilir. Kaydırma 60 fps'in altına düşmez. Ana iş parçacığını 100 ms'den uzun bloklayan iş (büyük JSON dönüşümü, resim işleme) arka plana alınır.
10. **Klavye** açılınca alanı ve gönder düğmesini kapatmaz. Alt sayfa klavyeyle birlikte yukarı kalkar.

### 6.2 Bugünkü kodda görülen riskler (17 Kasım 2026)

Olgu listesidir. Her madde §6.1'deki bir kuralla çelişir.

| Repo | Yer | Durum | Kural |
|---|---|---|---|
| Mobil | `ModuleHubHomeScreen.tsx:343` (`postStudyPlanManual`), `useStudyPlanNoPlanActions.ts:31`, `QuizSolveScreen.tsx:309,336`, `LensSessionProgressScreen.tsx:81` | Gezinmeden önce API bekleniyor | 1 |
| Mobil | `SubscriptionRequiredGate.tsx` (RN `Modal`) | Açıkken iOS'ta yığına itilen ekran görünmüyor (kod yorumunda yazıyor) | 6 |
| Mobil | `ThemeProvider` | Tema okunana kadar `null` çiziyor (en çok 800 ms boş ekran) | 2 |
| Mobil | `src/app/AppErrorBoundary.tsx` | Tek hata sınırı; modül düzeyinde sınır yok | 7 |
| Mobil | NetInfo yalnız deneme çözmede | Test, ders oynatıcısı ve kart oturumunda ağ kopması izlenmiyor | 5 |
| Web | `infrastructure/api/apiRequest.ts` | Varsayılan zaman aşımı yok. Yalnız Akıllı Özet süre veriyor | 2 |
| Web | `StudentAppAccessGuard` (`/me`) | İlk girişte `/me` asılı kalırsa tam ekran yükleme bitmiyor | 2, 6 |
| Web | `RouteProgressBar` | Gezinme başarısız olunca %92'de kalıyor | 8 |
| Web | `src/app` | Hiç `error.tsx` ya da hata sınırı yok | 7 |
| Web | Deneme çözme | `beforeunload` yok; sekme kapatma ve tarayıcı geri tuşu korumasız | §4 |
| Web | `AppCacheContext` | Hatadan sonra 5 sn boyunca istek hemen reddediliyor. "Tekrar dene" bu sürede tekrar hata gösterir. Düğme bu sürede `loading` kalmalı | 3 |
| İkisi | `docs/UIUX` kopyaları | Mobil repoda `Hareket-Standardi.md`, `Paylasim-Kartlari.md`, `Yukleme-Gecis-Hata-Merkezilestirme-Plani.md` yok, ama kod yorumları bunlara bağlanıyor. Web envanteri `w-panel-moduller` için `/student/moduller` yazıyor, oysa yol `dashboard`'a yönleniyor | — |

## 7. Testler: araçlar ve yer

Testler iki repoda da üst düzey `tests/` altındadır ve `src` yapısını izler. `src` içinde test olmaz. Mimari testlerdeki tavanlar yalnız düşer.

| | Mobil | Web |
|---|---|---|
| Birim ve bileşen | Jest (`jest-expo`) + `@testing-library/react-native`: `tests/modules/<modül>/…`, `tests/shared/…` | Vitest + jsdom + Testing Library: `tests/features/<modül>/…` |
| Süreç (uçtan uca, sahte API) | `tests/flows/<süreç>.test.tsx`: gezgin gerçek, API sahte; örnek `tests/flows/firstOpenPaywallFlow.test.tsx` | Playwright `e2e/`: sahte cevaplar `e2e/visual/fixtures`, `/api/proxy` karşılanır, saat sabit |
| Görsel | Ölçü ve sığma testleri (`tests/shared/components/controlFit.test.tsx` kalıbı): yazı sınırı, satır sınırı, ≥ 44 pt dokunma alanı. Ekran görüntüsü elle, simülatörde çizimle yan yana | Playwright ekran görüntüsü `e2e/visual/` (390, 834, 1280 px × açık/koyu); `npm run test:visual` |
| Mimari | `tests/architecture/` (`routeContract`, `buttonPolicy`, `screenStatePolicy`, `overlayPolicy`, `motionPolicy`, `themeColorPolicy`, `typographyPolicy`, `softReloadContract`, `turkishTestNaming` …) | `tests/architecture/` (`screenStatePolicy`, `buttonPolicy`, `errorPresentationPolicy`, `stylePolicy`, `localeNavigationPolicy`, `turkishTestNaming`, `unusedMessageKeys` …) |
| Ad | `<davranış>.test.ts(x)`, ör. `useModuleHubHome.loading.test.ts` | aynı |

### 7.1 Gezinme testleri (her iki istemci)

| No | Tür | Test | Beklenen |
|---|---|---|---|
| N1 | süreç | Her modül kökünde sistem geri tuşu | `ModuleHubHome` açılır |
| N2 | süreç | Her modülde yuva 3 (Modüller) | `ModuleHubHome` açılır; yığında modül ekranı birikmez (iki kez gidip gelince geri tuşu bir kez basışta ana ekranda) |
| N3 | süreç | Etkin sekmeye yeniden dokunma | Detaydaysa sekme köküne döner |
| N4 | süreç | Sekme değiştirip geri gelme | Önceki ekran ve kaydırma yeri korunur |
| N5 | süreç | Her odak ekranında geri tuşu | §4 tablosundaki davranış; deneme ve odakta pencere, diğerlerinde kayıtlı çıkış |
| N6 | süreç | Biten akıştan (test bitti, konu sonu, teslim) geri | Çözme ekranına dönülmez; akışı açan liste açılır |
| N7 | süreç | Alt sayfa açıkken ondan gezinme | Önce sayfa kapanır, sonra hedef açılır; hedef görünür (iOS) |
| N8 | süreç | Her bildirim türüne dokunma (soğuk açılış ve açıkken) | 11. dosyadaki tabloda yazan ekran; geri tuşu modül köküne |
| N9 | süreç | Silinmiş hedefe bildirim | Modül kökü ve "Bu içerik artık yok" bildirimi |
| N10 | süreç | Oturum yokken korunan yola gitme (web) | `login?returnUrl=…`; girişten sonra aynı yol |
| N11 | süreç | Erişim yokken modül kartına dokunma | Abonelik kapısı; "Paketleri gör" paketleri açar; kapı kapanınca ana ekran |
| N12 | süreç | Kapıda beklerken gelen bağlantı | Kapı geçilince bağlantının ekranı açılır |
| N13 | kilitlenme | API hiç cevap vermiyor (sahte, asılı istek) | Zaman aşımında yerinde "Tekrar dene"; sonsuz yükleme yok; geri tuşu çalışır |
| N14 | kilitlenme | Kapı yüklemesi asılı (web `/me`, mobil oturum geri yükleme) | Zaman aşımında hata ve "Tekrar dene"; tam ekran yükleme biter |
| N15 | kilitlenme | Gönder düğmesine art arda iki dokunuş | Tek istek |
| N16 | kilitlenme | Gezinme sırasında ağ kopuyor | Hedef ekran açılır, yerinde hata hâli; çevrimdışı şeridi |
| N17 | kilitlenme | Çözme sırasında uygulamayı kapatıp açma | Aynı soru, aynı cevaplar, süre doğru |
| N18 | kilitlenme | Bir modül ekranı hata atıyor (sahte) | Yalnız o modül hata ekranı; sekme çubuğu ve geri çalışır |
| N19 | web | Tarayıcı geri ve ileri, sayfa yenileme | Aynı görünüm (adres sekme ve süzgeci taşır) |
| N20 | web | Deneme çözerken sekmeyi kapatma | Tarayıcı uyarısı |
| N21 | web | 768 px altında menü | Çekmece açılır ve kapanır; Escape kapatır; açıkken sayfa kaymaz |
| N22 | erişilebilirlik | Ekran okuyucu ile sekme çubuğu | Her yuvanın adı ve "seçili" durumu okunur |
