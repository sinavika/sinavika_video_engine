# Sınavika UI/UX ekran envanteri

Bu dosya `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile çizim kaydından (`src/UIUX/Registry.ts`) üretilir; elle düzenlenmez.
Her satır bir çizimi, gerçek uygulamadaki karşılığını ("Rota") ve değişikliğin nedenini gösterir. "yeni" bugün olmayan ekrandır.

Toplam 162 çizim: mobil uygulama 89, web paneli ve web giriş/onboarding 59, web sitesi (giriş öncesi) 14.

## Mobil uygulama


### Modüller ve tur

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-hub-moduller` | Modüller (ana ekran) | `ModuleHubHome` | Uygulamanın mevcut düzeni korunur: slayt üstte, modül kartları altında. Slaytlar ve kartlar modül renginde; reklam bandı kalkar. |
| `m-hub-moduller-kaydir` | Modüller · aşağı kaydırılmış | `ModuleHubHome` | Kartların tamamı, SinoAI geniş kartı ve Destek. |
| `m-tur-1` | Ürün turu 1 · Slaytlar | `yeni` | — |
| `m-tur-2` | Ürün turu 2 · Modül kartları | `yeni` | — |
| `m-tur-3` | Ürün turu 3 · Profil | `yeni` | — |
| `m-tur-4` | Ürün turu 4 · SinoAI | `yeni` | — |

### Giriş ve kayıt

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-giris-karsilama` | Karşılama | `yeni` | İlk açılış: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var. |
| `m-giris-oturum-ac` | Oturum aç veya kaydol | `AuthLogin` | Apple ve Google üstte, e-posta altta; hesap varsa kod gider, yoksa kayıt açılır. |
| `m-giris-kod` | Doğrulama kodu | `AuthLogin` | 6 kutulu kod, yeniden gönderme süresi, parolayla giriş seçeneği. |
| `m-kayit-eposta` | Hesap oluştur | `AuthRegister` | — |
| `m-kayit-bilgiler` | Hesap oluştur · bilgiler | `AuthRegister` | Ad, soyad, parola gücü ve onay tek ekranda. |
| `m-sifre-unuttum` | Şifremi unuttum | `AuthForgotPassword` | — |
| `m-sifre-yeni` | Kod ve yeni parola | `AuthForgotPassword` | — |
| `m-giris-sayfa` | Misafir · hesap gerekli | `AuthEntrySheet` | Misafir hesap isteyen bir şeye dokununca tam ekran yönlendirme yerine alt sayfa. |
| `m-giris-hazir` | Hesabın hazır | `yeni` | — |

### Onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-onb-1-sinav` | Onboarding 1 · Sınav ve oturum | `OnboardingCategoryExamStep + ScoreTypeStep` | Uygulamadaki 2 adım tek ekranda. |
| `m-onb-2-net` | Onboarding 2 · Mevcut ve hedef net | `OnboardingStudyNetStep` | İki çark seçici yerine tek kaydırıcı ve gerçekçilik yorumu. |
| `m-onb-3-tempo` | Onboarding 3 · Tempo | `OnboardingStudyHoursStep + QuestionsStep` | Saat ve soru sayısı hazır tempo kartlarında. |
| `m-onb-4-dersler` | Onboarding 4 · Zorlandığın dersler | `OnboardingStudyWeakStep` | — |
| `m-onb-5-plan` | Onboarding 5 · Planın hazır | `OnboardingStudySummaryStep` | Hafta modül renkleriyle; bugünkü ilk görev somut. |
| `m-onb-6-deger` | Onboarding 6 · Neden Sınavika | `OnboardingValueStep` | — |
| `m-onb-7-hesap` | Onboarding 7 · Planını kaydet | `AuthRegister` | Hesap ödeme ekranından önce: önce emeğin güvene alınır. |
| `m-onb-8-deneme` | Onboarding 8 · 3 gün ücretsiz | `OnboardingTrialStep` | Bugün, hatırlatma günü ve ücret günü açıkça. |
| `m-onb-9-bildirim` | Bildirim izni | `yeni` | Sistem penceresinden önce kendi açıklamamız; ATT ancak gerekiyorsa. |

### Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-deneme-vitrin` | Denemeler | `ExamDashboard` | Canlı deneme slaytı, devam eden deneme ve öneriler. |
| `m-deneme-katalog` | Tüm denemeler | `ExamStudentsList` | — |
| `m-deneme-detay` | Deneme detayı | `ExamStudentPublicDetail` | — |
| `m-deneme-baslangic` | Başlamadan önce | `ExamStudentStarting` | — |
| `m-deneme-coz` | Deneme çözme | `ExamStudentSolve` | Odak modu: tab bar yok, süre ve soru haritası üstte. |
| `m-deneme-denemelerim` | Denemelerim | `MyExams` | Sınavlarım ve Sınav takvimi birleşti. |
| `m-deneme-sonuclar` | Sonuçlar | `ExamResultsHub` | — |
| `m-deneme-sonuc` | Sonuç | `ExamResultDocument` | — |
| `m-deneme-analiz` | Eksik konu analizi | `ExamStatsLessonOverview` | Analiz eylemle biter: ders, test, plana ekle. |
| `m-deneme-gelisim` | Ders gelişimi | `ExamStatsLessonTrend` | — |
| `m-deneme-cozumler` | Çözümler | `ExamSolutionExamCards` | — |
| `m-deneme-cozum` | Soru çözümü | `ExamSolutionBookletReview` | — |

### Dersler ve Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ders-vitrin` | Dersler | `WorkHome` | — |
| `m-ders-agac` | Konu ağacı | `WorkCatalog` | — |
| `m-ders-akis` | Mikro ders | `WorkLessonFlow` | — |
| `m-ders-bitti` | Ders tamamlandı | `WorkLessonFlow` | — |
| `m-ders-rota` | Öğrenme rotası | `WorkLearningPath` | — |
| `m-ders-gecmis` | Geçmiş | `WorkHistory` | — |
| `m-test-vitrin` | Testler | `QuizHome` | — |
| `m-test-konular` | Konular | `QuizCatalog` | — |
| `m-test-detay` | Test seviyeleri | `QuizOverview` | — |
| `m-test-coz` | Anında geri bildirim | `QuizSolve` | — |
| `m-test-bitti` | Test bitti | `QuizComplete` | — |
| `m-test-cozumler` | Çözümler | `QuizSolutions` | — |

### Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-plan-bugun` | Bugün | `StudyPlanHome` | Görevler modül renginde sol çizgiyle. |
| `m-plan-odak` | Odak sayacı | `StudyPlanFocus` | — |
| `m-plan-ilerleme` | İlerleme | `StudyPlanProgress` | Eski Pusula/Compass burada. |
| `m-plan-konu` | Konu ilerlemesi | `StudyPlanLessonProgress` | — |
| `m-plan-program` | Program | `StudyPlanSchedule` | — |
| `m-plan-ayarlar` | Plan ayarları | `StudyPlanCreate` | — |

### Akıllı Özet

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ozet-vitrin` | Akıllı Özet | `LensHome` | Geçmişte dosya adı yerine konu başlığı; kalan kredi yerine kota. |
| `m-ozet-yukle` | Soru yükle | `LensNew` | — |
| `m-ozet-kamera` | Kamera | `LensCamera` | — |
| `m-ozet-isleniyor` | Analiz ediliyor | `LensSessionProgress` | — |
| `m-ozet-sonuc` | Çözüm | `LensSessionDetail` | — |
| `m-ozet-video` | Video analizi | `LensVideo` | — |

### Bilgi Kartları ve SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-kart-vitrin` | Bilgi Kartları | `FlashcardMain` | Akış yok; sekmeler Kartlar · Bugün · Kaydedilenler. |
| `m-kart-bugun` | Bugün | `FlashcardToday` | — |
| `m-kart-on` | Kart oturumu · ön yüz | `FlashcardSession` | — |
| `m-kart-arka` | Kart oturumu · cevap | `FlashcardSession` | — |
| `m-kart-kaydedilen` | Kaydedilenler | `FlashcardSavedTab` | — |
| `m-sino-ana` | SinoAI | `SinoAi` | — |
| `m-sino-sohbet` | SinoAI · sohbet | `SinoAiChat` | — |
| `m-sino-calisma` | SinoAI · çalışma | `SinoAiChat (Çalışma)` | Kilit simgesi yok; kota yazılı. |
| `m-sino-kutuphane` | SinoAI · kütüphane | `yeni` | — |
| `m-sino-menu` | SinoAI · menü | `SinoAiChat (menü)` | Boş Yeni sohbet kayıtları tutulmaz. |

### Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-profil` | Profil | `ProfileMain` | Daha fazla sekmesi kalktı; her şey Profil içinde. |
| `m-profil-devam` | Profil · alt bölüm | `ProfileMain` | — |
| `m-profil-bilgiler` | Kişisel bilgiler | `ProfileUserInfo / ProfileEdit` | — |
| `m-profil-hedef` | Hedefim | `ProfileAcademic` | — |
| `m-profil-abonelik` | Aboneliğim | `ProfileMySubscriptions` | — |
| `m-profil-paketler` | Paketler | `ProfileAvailablePackages` | — |
| `m-profil-gorunum` | Görünüm | `ProfileAppearance` | — |
| `m-profil-dil` | Dil | `ProfileLanguage` | — |
| `m-profil-iletisim` | Bildirim ve iletişim | `ProfileCommunicationPreferences` | — |
| `m-profil-guvenlik` | Hesap güvenliği | `ProfileAccountSecurity` | — |
| `m-profil-kapat` | Hesabımı kapat | `ProfileAccountClosure` | — |

### Bildirim, destek, durumlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-bildirimler` | Bildirimler | `NotificationInbox` | — |
| `m-destek` | Destek | `SupportHub` | — |
| `m-destek-yeni` | Yeni talep | `SupportNew` | — |
| `m-destek-talep` | Talep detayı | `SupportTicketDetail` | — |
| `m-hakkinda` | Hakkında | `ExamAbout` | Push hata ayıklama bilgisi kalktı. |
| `m-geri-bildirim` | Geri bildirimlerim | `FeedbackMy` | — |
| `m-durum-bos` | Boş durum | `—` | — |
| `m-durum-hata` | Yükleniyor, hata, çevrimdışı | `—` | — |

## Web paneli ve web giriş/onboarding


### Web · giriş ve onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-giris` | Giriş yap | `/student/login` | Sitenin mevcut ortalanmış kart düzeni; Google ve Apple üstte, kodla giriş seçeneği. |
| `w-giris-kod` | Giriş kodu | `/student/login` | — |
| `w-kayit` | Kayıt ol | `/student/register` | Paket seçimi kayıttan çıktı; önce plan, sonra paket. |
| `w-sifre-unuttum` | Şifremi unuttum | `/student/forgot-password` | — |
| `w-sifre-sifirla` | Şifre sıfırla | `/student/reset-password` | — |
| `w-onb-1-sinav` | Web onboarding 1 · Sınav | `yeni` | Web’de onboarding yoktu; mobil ile aynı adımlar, sağda canlı önizleme. |
| `w-onb-2-hedef` | Web onboarding 2 · Hedef | `yeni` | — |
| `w-onb-3-tempo` | Web onboarding 3 · Tempo | `yeni` | — |
| `w-onb-4-dersler` | Web onboarding 4 · Dersler | `yeni` | — |
| `w-onb-5-plan` | Web onboarding 5 · Planın hazır | `yeni` | Sağda aynı planın mobil hali. |
| `w-onb-6-paket` | Web onboarding 6 · 3 gün ücretsiz | `yeni` | — |

### Web · panel

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-anasayfa` | Ana sayfa | `/student/dashboard` | Günün adımı, plan, hedef, son deneme; modül kısa yolları renkli. |
| `w-panel-tur` | İlk giriş turu | `yeni` | — |
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
| `w-deneme-denemelerim` | Denemelerim ve takvim | `/student/sinavlarim + /sinav-takvimi` | Sınavlarım ve Sınav takvimi tek sekmede. |
| `w-deneme-detay` | Deneme detayı | `/student/sinav/[examId]` | — |
| `w-deneme-coz` | Deneme çözme (odak) | `/student/sinav/coz/[examUserId]` | — |
| `w-deneme-sonuclar` | Sonuçlar | `/student/sinav-sonuclari` | — |
| `w-deneme-sonuc` | Sonuç ve analiz | `/student/sinav-sonuclari/[snapshotId]` | — |
| `w-deneme-cozumler` | Soru çözümleri | `/student/soru-cozumleri/[examAttemptId]` | Not Found yerine soru haritası + çözüm. |
| `w-deneme-istatistik` | İstatistik | `/student/raporlarim` | Raporlarım ve İstatistikler buraya; satırlarda ders adı. |

### Web · Dersler ve Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-ders-vitrin` | Dersler | `/student/ders-cal` | Ders Çalış adı Dersler oldu. |
| `w-ders-agac` | Konu ağacı | `/student/ders-cal/kesfet` | — |
| `w-ders-detay` | Konu detayı | `/student/ders-cal/ders/[lessonSubId]` | — |
| `w-ders-rota` | Öğrenme rotası | `/student/ders-cal/ogrenme-rotasi` | — |
| `w-ders-gecmis` | Geçmiş | `/student/ders-cal/gecmis` | — |
| `w-ders-calis` | Mikro ders (odak) | `/student/ders-cal/calis/[workId]` | — |
| `w-test-vitrin` | Testler | `/student/testler` | — |
| `w-test-konular` | Ders konuları | `/student/testler/[lessonMainId]` | — |
| `w-test-coz` | Test çözme (odak) | `/student/testler/quiz/[quizId]` | — |

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
| `w-kart-vitrin` | Bilgi Kartları | `/student/flashcard` | Kelime Kartları adı Bilgi Kartları oldu; akış yok. |
| `w-kart-gozat` | Gözat | `/student/flashcard/browse/...` | — |
| `w-kart-oturum` | Kart oturumu (odak) | `/student/flashcard/session` | — |
| `w-kart-kaydedilen` | Kaydedilenler | `yeni` | — |
| `w-ozet-vitrin` | Akıllı Özet | `/student/lens` | Lens AI Analiz adı Akıllı Özet oldu; geçmişte GUID yok. |
| `w-ozet-yeni` | Yeni analiz | `/student/lens/yeni` | — |
| `w-ozet-detay` | Analiz detayı | `/student/lens/analiz/[id]` | — |
| `w-ozet-video` | Video analizi | `/student/lens/video/[id]` | — |
| `w-sino-sohbet` | SinoAI sohbet | `/student/sinoai/[conversationId]` | Sınavika AI adı SinoAI oldu. |
| `w-sino-calisma` | SinoAI çalışma | `/student/sinoai/study` | — |
| `w-sino-kutuphane` | SinoAI kütüphane | `/student/sinoai/library` | — |

## Web sitesi (giriş öncesi)


### Web sitesi

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-anasayfa` | Ana sayfa | `/` | Sitenin mevcut header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri. |
| `s-urunler-menu` | Ürünler menüsü | `header` | Ürünler açılınca 7 modül, sitenin sade gri tonlarında. |
| `s-sinavlar` | Sınavlar | `/sinavlar` | — |
| `s-sinav-yks` | Sınav sayfası · YKS | `/yks-hazirlik (şablon)` | Tüm sınav ve hazırlık sayfaları bu şablonla. |
| `s-net-hesaplama` | Net hesaplama | `/net-hesaplama` | — |
| `s-paketler` | Paketler | `/corporate/packages` | — |
| `s-urun-denemeler` | Ürün · Denemeler | `/urunler/denemeler (şablon)` | Altı ürün sayfası tek şablon. |
| `s-urun-ozet` | Ürün · Akıllı Özet | `/urunler/lens` | — |
| `s-blog` | Blog | `/blog` | — |
| `s-blog-yazi` | Blog yazısı | `/blog/[slug]` | — |
| `s-hakkimizda` | Hakkımızda | `/corporate/about` | — |
| `s-sss-iletisim` | SSS ve iletişim | `/corporate/sss + /contact` | — |
| `s-yasal` | Yasal sayfa | `/corporate/yasal/[slug]` | — |
| `s-sinoai-misafir` | SinoAI · misafir | `/sinoai` | — |

