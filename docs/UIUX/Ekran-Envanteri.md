# Sınavika UI/UX ekran envanteri

Bu dosya `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile çizim kaydından (`src/UIUX/Registry.ts`) üretilir; elle düzenlenmez.
Her satır bir çizimi, gerçek uygulamadaki karşılığını ("Rota") ve değişikliğin nedenini gösterir. "yeni" bugün olmayan ekrandır.

Toplam 178 çizim: mobil uygulama 97, web paneli ve web giriş/onboarding 67, web sitesi (giriş öncesi) 14.

## Mobil uygulama


### Modüller

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-hub-moduller` | Modüller (ana ekran) | `ModuleHubHome` | Uygulamanın ana ekranı: üstte her modülün bugünkü teklifi slayt olarak, altında modül kartları. Logo yalnız bu ekranda ve marka ekranlarında. |
| `m-hub-moduller-kaydir` | Modüller · aşağı kaydırılmış | `ModuleHubHome` | Kartların tamamı, SinoAI geniş kartı ve Destek. |
| `m-hub-ipucu` | İlk açılış ipucu | `ModuleHubHome` | Modüller ilk açıldığında tek ipucu. Ön tanıtım turu yok; her özellik ilk karşılaşıldığı yerde tek satırla anlatılır. |

### Giriş ve kayıt

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-giris-karsilama` | Karşılama | `—` | İlk açılış: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var. |
| `m-giris-oturum-ac` | Oturum aç veya kaydol | `AuthLogin` | Apple ve Google üstte, e-posta altta; hesap varsa kod gider, yoksa kayıt açılır. |
| `m-giris-kod` | Doğrulama kodu | `AuthLogin` | 6 kutulu kod, yeniden gönderme süresi, şifreyle giriş seçeneği. |
| `m-kayit-eposta` | Hesap oluştur | `AuthRegister` | Apple ve Google önde; e-postayla devam edene kod gider. |
| `m-kayit-bilgiler` | Hesap oluştur · adın | `AuthRegister` | Yalnız ad ve onay. Şifre gerekmez: her girişte e-postaya kod gelir; şifre sonra Hesap güvenliği’nden eklenir. |
| `m-sifre-unuttum` | Şifremi unuttum | `AuthForgotPassword` | — |
| `m-sifre-yeni` | Kod ve yeni şifre | `AuthForgotPassword` | — |
| `m-giris-sayfa` | Misafir · hesap gerekli | `AuthEntrySheet` | Misafir hesap isteyen bir şeye dokununca alt sayfa açılır. |

### Onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-onb-1-sinav` | Onboarding 1 · Sınav ve oturum | `OnboardingCategoryExamStep + ScoreTypeStep` | Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir. |
| `m-onb-2-net` | Onboarding 2 · Mevcut ve hedef net | `OnboardingStudyNetStep` | Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”. |
| `m-onb-3-tempo` | Onboarding 3 · Tempo ve günler | `OnboardingStudyHoursStep + QuestionsStep` | Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz). |
| `m-onb-4-dersler` | Onboarding 4 · Zorlandığın dersler | `OnboardingStudyWeakStep` | İsteğe bağlı; planda bu derslere daha çok yer ayrılır. |
| `m-onb-5-plan` | Onboarding 5 · Planın hazır | `OnboardingStudySummaryStep` | Hafta modül renkleriyle; bugünkü ilk görev somut. İlerleme çubuğu planı kuran beş adımı sayar. |
| `m-onb-6-hesap` | Planını kaydet | `AuthRegister` | Hesap ödeme ekranından önce: önce emeğin güvene alınır. Apple ve Google önde, e-posta ikincil. |
| `m-onb-7-deneme` | 3 gün ücretsiz | `OnboardingTrialStep` | Bugün, hatırlatma günü ve ücret günü açıkça. Başlayınca öğrenci bugünkü ilk mikro derse girer. |
| `m-onb-8-bildirim` | Bildirim izni · ilk mikro dersten sonra | `—` | İzin, ilk mikro ders bitince ve hatırlatmanın değeri belliyken istenir; sistem penceresinden önce kendi açıklamamız. |

### Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-deneme-vitrin` | Denemeler | `ExamDashboard` | Canlı deneme slaytı, devam eden deneme ve öneriler. |
| `m-deneme-katalog` | Tüm denemeler | `ExamStudentsList` | — |
| `m-deneme-detay` | Deneme detayı | `ExamStudentPublicDetail` | — |
| `m-deneme-baslangic` | Başlamadan önce | `ExamStudentStarting` | — |
| `m-deneme-coz` | Deneme çözme | `ExamStudentSolve` | Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Doğru ve yanlış teslimden sonra açılır. |
| `m-deneme-denemelerim` | Denemelerim | `MyExams` | Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede. |
| `m-deneme-sonuclar` | Sonuçlar | `ExamResultsHub` | — |
| `m-deneme-sonuc` | Sonuç | `ExamResultDocument` | — |
| `m-deneme-analiz` | Eksik konu analizi | `ExamStatsLessonOverview` | Analiz eylemle biter: mikro ders, test, plana ekle. |
| `m-deneme-gelisim` | Ders gelişimi | `ExamStatsLessonTrend` | — |
| `m-deneme-cozumler` | Çözümler | `ExamSolutionExamCards` | — |
| `m-deneme-cozum` | Soru çözümü | `ExamSolutionBookletReview` | — |

### Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ders-vitrin` | Dersler | `WorkHome` | Kaldığın yerden (GET continue), bugünkü tekrar (GET reviews) ve sınavın dersleri mikro ders ilerlemesiyle (GET lessons). |
| `m-ders-konular` | Konular | `WorkCatalog` | Dersin konuları müfredat sırasıyla: mikro ders sayısı, süre, ilerleme ve ilk denemede doğru oranı. |
| `m-ders-tekrar` | Tekrar | `WorkReview` | İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede. |
| `m-ders-konu-girisi` | Konu girişi | `WorkSub` | Kanca, video ve mikro derslerin yol haritası; tek düğme sıradaki mikro derse götürür. Video yoksa satır gizlenir. |
| `m-ders-tanim` | Adım · Tanım | `WorkMikro` | Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle. |
| `m-ders-ornek` | Adım · Örnek | `WorkMikro` | Example: örnek cümle, açıklama ve dikkat notu. |
| `m-ders-kural` | Adım · Kural | `WorkMikro` | Rule: numaralı kural listesi. |
| `m-ders-gorsel` | Adım · Görsel | `WorkMikro` | Visual: merkezi figür (burada karşılaştırma tablosu) ve kısa açıklama. |
| `m-ders-tahmin` | Adım · Önce sen tahmin et | `WorkMikro` | Choice: seçimden sonra açıklama ve Gerçek/Mecaz karşılaştırması. |
| `m-ders-dogru-yanlis` | Adım · Doğru mu, yanlış mı? | `WorkMikro` | TrueFalse: sık yapılan hata yargı olarak sorulur; doğrusu ve nedeni. |
| `m-ders-sirala` | Adım · Sırala | `WorkMikro` | Order: adımlara sırayla dokunulur; sürükleme gerekmez. |
| `m-ders-bosluk` | Adım · Boşluk doldur | `WorkMikro` | FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer. |
| `m-ders-soru` | Adım · TYT tarzı soru | `WorkMikro` | Question: her yanlışta bir çözüm adımı açılır, öğrenci yeniden seçer; kalan deneme yazılı. SinoAI’ye sor. |
| `m-ders-sekilli-soru` | Adım · Şekilli soru | `WorkMikro` | Question ve soru şekli (figure): şekil kökle birlikte, şıklardan önce. |
| `m-ders-mikro-bitti` | Mikro ders bitti | `WorkMikroDone` | İlk denemede doğru sayısı, akılda kalacak tek cümle, tekrar listesine girenler ve sıradaki mikro ders. |
| `m-ders-konu-sonu` | Konu sonu | `WorkSubSummary` | Özet, dikkat notları, kamp görevi; Testler’in Kolay seviyesine geçiş (Testler renginde). |
| `m-ders-hak` | Günlük konu hakkı | `WorkSub (PAYWALL)` | Abonelik yokken ya da günün konu hakkı bitince alt sayfa; ödeme marka yüzeyi olduğu için düğmesi turuncu. |

### Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-test-vitrin` | Testler | `QuizHome` | Senin için hazır test ve ders listesi. |
| `m-test-konular` | Konular | `QuizCatalog` | — |
| `m-test-detay` | Test seviyeleri | `QuizOverview` | Kolay, Orta, Zor · 20’şer soru. |
| `m-test-coz` | Doğru cevap | `QuizSolve` | Anında geri bildirim: doğru şık, kısa çözüm. |
| `m-test-coz-yanlis` | Yanlış cevap | `QuizSolve` | Doğru şık ve nedeni; konunun mikro dersine (Dersler renginde) ya da SinoAI’ye geçiş. |
| `m-test-bitti` | Test bitti | `QuizComplete` | — |
| `m-test-cozumler` | Çözümler | `QuizSolutions` | — |

### Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-plan-bugun` | Bugün | `StudyPlanHome` | Görevler modül renginde sol çizgiyle; Dersler tekrarı ve Bilgi Kartları tek “Bugün tekrar” kartında. |
| `m-plan-odak` | Odak sayacı | `StudyPlanFocus` | — |
| `m-plan-ilerleme` | İlerleme | `StudyPlanProgress` | — |
| `m-plan-konu` | Konu ilerlemesi | `StudyPlanLessonProgress` | — |
| `m-plan-program` | Program | `StudyPlanSchedule` | — |
| `m-plan-ayarlar` | Plan ayarları | `StudyPlanCreate` | — |

### Akıllı Özet

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ozet-vitrin` | Akıllı Özet | `LensHome` | Geçmişte konu başlığı; kalan kota yazılı. |
| `m-ozet-yukle` | Soru yükle | `LensNew` | — |
| `m-ozet-kamera` | Kamera | `LensCamera` | — |
| `m-ozet-isleniyor` | Analiz ediliyor | `LensSessionProgress` | — |
| `m-ozet-sonuc` | Çözüm | `LensSessionDetail` | — |
| `m-ozet-video` | Video analizi | `LensVideo` | — |

### Bilgi Kartları ve SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-kart-vitrin` | Bilgi Kartları | `FlashcardMain` | Sekmeler Kartlar · Bugün · Kaydedilenler. |
| `m-kart-bugun` | Bugün | `FlashcardToday` | — |
| `m-kart-on` | Kart oturumu · ön yüz | `FlashcardSession` | — |
| `m-kart-arka` | Kart oturumu · cevap | `FlashcardSession` | — |
| `m-kart-kaydedilen` | Kaydedilenler | `FlashcardSavedTab` | — |
| `m-sino-ana` | SinoAI | `SinoAi` | — |
| `m-sino-sohbet` | SinoAI · sohbet | `SinoAiChat` | — |
| `m-sino-calisma` | SinoAI · çalışma | `SinoAiChat (Çalışma)` | Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı. |
| `m-sino-sonuc` | SinoAI · üretim sonucu | `SinoAiChat (Çalışma sonucu)` | Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir. |
| `m-sino-kutuphane` | SinoAI · kütüphane | `—` | — |
| `m-sino-menu` | SinoAI · menü | `SinoAiChat (menü)` | Arama, yeni sohbet, kütüphane ve gün gün sohbetler. |

### Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-profil` | Profil | `ProfileMain` | Hedef, abonelik, görünüm, destek ve hakkında tek yerde. |
| `m-profil-devam` | Profil · alt bölüm | `ProfileMain` | — |
| `m-profil-bilgiler` | Kişisel bilgiler | `ProfileUserInfo / ProfileEdit` | — |
| `m-profil-hedef` | Hedefim | `ProfileAcademic` | — |
| `m-profil-abonelik` | Aboneliğim | `ProfileMySubscriptions` | — |
| `m-profil-paketler` | Paketler | `ProfileAvailablePackages` | — |
| `m-profil-gorunum` | Görünüm | `ProfileAppearance` | — |
| `m-profil-dil` | Dil | `ProfileLanguage` | — |
| `m-profil-iletisim` | Bildirim ve iletişim | `ProfileCommunicationPreferences` | — |
| `m-profil-guvenlik` | Hesap güvenliği | `ProfileAccountSecurity` | Şifre belirleme ya da değiştirme, oturumlar. |
| `m-profil-kapat` | Hesabımı kapat | `ProfileAccountClosure` | — |

### Bildirim, destek, durumlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-bildirimler` | Bildirimler | `NotificationInbox` | — |
| `m-destek` | Destek | `SupportHub` | — |
| `m-destek-yeni` | Yeni talep | `SupportNew` | — |
| `m-destek-talep` | Talep detayı | `SupportTicketDetail` | — |
| `m-hakkinda` | Hakkında | `ExamAbout` | — |
| `m-geri-bildirim` | Geri bildirimlerim | `FeedbackMy` | — |
| `m-durum-bos` | Boş durum | `—` | — |
| `m-durum-hata` | Yükleniyor, hata, çevrimdışı | `—` | — |

## Web paneli ve web giriş/onboarding


### Web · giriş ve onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-giris` | Giriş yap | `/student/login` | Solda form (Google ve Apple üstte, kodla giriş), sağda tanıtım paneli. |
| `w-giris-kod` | Giriş kodu | `/student/login` | — |
| `w-kayit` | Kayıt ol | `/student/register` | Kayıtta paket yok: önce plan, sonra paket. |
| `w-sifre-unuttum` | Şifremi unuttum | `/student/forgot-password` | — |
| `w-sifre-sifirla` | Şifre sıfırla | `/student/reset-password` | — |
| `w-onb-1-sinav` | Web onboarding 1 · Sınav | `/student/baslangic` | Mobil ile aynı adımlar, sağda canlı önizleme. |
| `w-onb-2-hedef` | Web onboarding 2 · Hedef | `/student/baslangic` | — |
| `w-onb-3-tempo` | Web onboarding 3 · Tempo | `/student/baslangic` | — |
| `w-onb-4-dersler` | Web onboarding 4 · Dersler | `/student/baslangic` | — |
| `w-onb-5-plan` | Web onboarding 5 · Planın hazır | `/student/baslangic` | Sağda aynı planın mobil hali. |
| `w-onb-6-paket` | Web onboarding 6 · Paketini seç | `/student/baslangic` | Web’de deneme süresi yok: paket seçilir, kartla ödenir; “Şimdilik paket seçme” de var. |

### Web · panel

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-anasayfa` | Ana sayfa | `/student/dashboard` | Günün adımı, plan, hedef, son deneme; modül kısa yolları renkli. |
| `w-panel-tur` | İlk giriş ipucu | `/student/dashboard` | İlk girişte tek ipucu, günün adımının üstünde. |
| `w-panel-moduller` | Tüm modüller | `/student/moduller` | — |
| `w-panel-bildirimler` | Bildirimler | `/student/bildirimler` | — |
| `w-panel-profil` | Profil | `/student/profil` | — |
| `w-panel-abonelik` | Profil · abonelik | `/student/profil` | — |
| `w-panel-ayarlar` | Profil · bildirim ve görünüm | `/student/profil` | — |
| `w-panel-destek` | Destek | `/student/destek` | — |
| `w-panel-destek-talep` | Destek talebi | `/student/destek/[id]` | — |
| `w-panel-odeme` | Ödeme | `/student/odeme` | — |
| `w-panel-odeme-basarili` | Ödeme başarılı | `/student/odeme/basarili` | — |
| `w-panel-odeme-basarisiz` | Ödeme başarısız | `/student/odeme/basarisiz` | — |
| `w-panel-durumlar` | Boş, yükleniyor, hata | `—` | — |

### Web · Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-deneme-vitrin` | Denemeler | `/student/sinavlarim` | — |
| `w-deneme-denemelerim` | Denemelerim ve takvim | `/student/denemelerim` | Denemelerin ve sınav takvimi tek sekmede. |
| `w-deneme-detay` | Deneme detayı | `/student/sinav/[examId]` | — |
| `w-deneme-coz` | Deneme çözme (odak) | `/student/sinav/coz/[examUserId]` | — |
| `w-deneme-sonuclar` | Sonuçlar | `/student/sinav-sonuclari` | — |
| `w-deneme-sonuc` | Sonuç ve analiz | `/student/sinav-sonuclari/[snapshotId]` | — |
| `w-deneme-cozumler` | Soru çözümleri | `/student/soru-cozumleri/[examAttemptId]` | Soru haritası ve çözüm. |
| `w-deneme-istatistik` | İstatistik | `/student/raporlarim` | Satırlarda ders adı. |

### Web · Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-ders-vitrin` | Dersler | `/student/ders-cal` | Kaldığın yerden, bugünkü tekrar ve sınavın dersleri; henüz içeriği olmayan ders “Yakında”. |
| `w-ders-konular` | Konular | `/student/ders-cal/[lessonMainId]` | Dersin konuları: mikro ders, süre, ilerleme, ilk denemede doğru; yanda ders ilerlemesi. |
| `w-ders-tekrar` | Tekrar | `/student/ders-cal/tekrar` | Günü gelen adımlar; 1, 3 ve 7 gün aralıkla. |
| `w-ders-konu-girisi` | Konu girişi | `/student/ders-cal/konu/[lessonSubId]` | Panelin içinde iki sütun: kanca, hedefler, video ve devam düğmesi; yanda mikro derslerin yol haritası. |
| `w-ders-tanim` | Oynatıcı · Tanım | `/student/ders-cal/mikro/[workMikroId]` | Solda mikro dersler, ortada 700 px adım, sağda Bu mikro derste ve SinoAI. |
| `w-ders-tahmin` | Oynatıcı · Önce sen tahmin et | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-bosluk` | Oynatıcı · Boşluk doldur | `/student/ders-cal/mikro/[workMikroId]` | Tek deneme; yanlışta doğru sözcük ve nedeni. |
| `w-ders-dogru-yanlis` | Oynatıcı · Doğru mu, yanlış mı? | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-sirala` | Oynatıcı · Sırala | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-soru` | Oynatıcı · TYT tarzı soru | `/student/ders-cal/mikro/[workMikroId]` | Yanlış şıktan sonra çözüm adımı açılır, öğrenci yeniden seçer; 1–5 tuşları. |
| `w-ders-mikro-bitti` | Mikro ders bitti | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-konu-sonu` | Konu sonu | `/student/ders-cal/konu/[lessonSubId]/ozet` | Özet, dikkat notları, kamp görevi ve Testler’e geçiş. |
| `w-ders-akis` | Akış panosu | `—` | Konu girişi → mikro dersler → konu sonu → Testler ve Kartlar; yanlışlar Tekrar’a. |

### Web · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-test-vitrin` | Testler | `/student/testler` | — |
| `w-test-konular` | Ders konuları | `/student/testler/[lessonMainId]` | — |
| `w-test-coz` | Test çözme · doğru | `/student/testler/quiz/[quizId]` | — |
| `w-test-coz-yanlis` | Test çözme · yanlış | `/student/testler/quiz/[quizId]` | Doğru şık ve nedeni; konunun mikro dersine ya da SinoAI’ye geçiş. |

### Web · Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-plan-bugun` | Bugün | `/student/ders-plani` | — |
| `w-plan-program` | Program | `/student/ders-plani/program` | — |
| `w-plan-oneriler` | Öneriler | `/student/ders-plani/oneriler` | — |
| `w-plan-istatistik` | İstatistik | `/student/ders-plani/istatistik` | — |
| `w-plan-ilerleme` | İlerleme | `/student/ders-plani/ilerleme` | — |
| `w-plan-ayarlar` | Ayarlar | `/student/ders-plani/ayarlar` | — |
| `w-plan-odak` | Odak (çalış) | `/student/ders-plani/calis/[taskId]` | — |

### Web · Kartlar, Özet, SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-kart-vitrin` | Bilgi Kartları | `/student/flashcard` | — |
| `w-kart-gozat` | Gözat | `/student/flashcard/browse/...` | — |
| `w-kart-oturum` | Kart oturumu (odak) | `/student/flashcard/session` | — |
| `w-kart-kaydedilen` | Kaydedilenler | `/student/flashcard (Kaydedilenler)` | — |
| `w-ozet-vitrin` | Akıllı Özet | `/student/lens` | Geçmişte konu başlığı. |
| `w-ozet-yeni` | Yeni analiz | `/student/lens/yeni` | — |
| `w-ozet-detay` | Analiz detayı | `/student/lens/analiz/[id]` | — |
| `w-ozet-video` | Video analizi | `/student/lens/video/[id]` | — |
| `w-sino-sohbet` | SinoAI sohbet | `/student/sinoai/[conversationId]` | Solda geçmiş, ortada tek sohbet sütunu. |
| `w-sino-calisma` | SinoAI çalışma | `/student/sinoai/study` | — |
| `w-sino-kutuphane` | SinoAI kütüphane | `/student/sinoai/library` | — |

## Web sitesi (giriş öncesi)


### Web sitesi

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-anasayfa` | Ana sayfa | `/` | Sitenin header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri. |
| `s-urunler-menu` | Ürünler menüsü | `header` | Ürünler açılınca 7 modül, sitenin sade gri tonlarında. |
| `s-sinavlar` | Sınavlar | `/sinavlar` | — |
| `s-sinav-yks` | Sınav sayfası · YKS | `/yks-hazirlik (şablon)` | Tüm sınav ve hazırlık sayfaları bu şablonla. |
| `s-net-hesaplama` | Net hesaplama | `/net-hesaplama` | — |
| `s-paketler` | Paketler | `/corporate/packages` | Yalnız ücretli paketler; deneme süresi mobil uygulamada. |
| `s-urun-denemeler` | Ürün · Denemeler | `/urunler/denemeler (şablon)` | Altı ürün sayfası tek şablon. |
| `s-urun-ozet` | Ürün · Akıllı Özet | `/urunler/lens` | — |
| `s-blog` | Blog | `/blog` | — |
| `s-blog-yazi` | Blog yazısı | `/blog/[slug]` | — |
| `s-hakkimizda` | Hakkımızda | `/corporate/about` | — |
| `s-sss-iletisim` | SSS ve iletişim | `/corporate/sss + /contact` | — |
| `s-yasal` | Yasal sayfa | `/corporate/yasal/[slug]` | — |
| `s-sinoai-misafir` | SinoAI · misafir | `/sinoai` | — |

