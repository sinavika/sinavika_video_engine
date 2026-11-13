# Sınavika UI/UX ekran envanteri

Bu dosya `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile çizim kaydından (`src/UIUX/Registry.ts`) üretilir; elle düzenlenmez.
Her satır bir çizimi, gerçek uygulamadaki karşılığını ("Rota") ve değişikliğin nedenini gösterir. "yeni" bugün olmayan ekrandır.

Toplam 259 çizim: mobil uygulama 129, web paneli ve web giriş/onboarding 79, tablet (ipad ve android tablet, kalem) 37, web sitesi (giriş öncesi) 14.

## Mobil uygulama


### Modüller

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-hub-moduller` | Modüller (ana ekran) | `ModuleHubHome` | Ana ekran (5 Kas 2026 revizyonu): önce “bugün ne yapacağım”. Selam, hedef ve seri; hafta şeridi (bugünün halkası); günün planı ve sıradaki görev tek düğmeyle; iki eylem kartı (kaldığın yer, sıradaki deneme); modüller üç sütun. Veri: engagement/today, study-plan calendar, works continue, yaklaşan deneme. |
| `m-hub-moduller-kaydir` | Modüller · aşağı kaydırılmış | `ModuleHubHome` | Modüller ızgarası, SinoAI, Bugün tekrar (Dersler adımları + Bilgi Kartları) ve Destek. |
| `m-hub-ipucu` | İlk açılış ipucu | `ModuleHubHome` | İlk açılışta tek ipucu, günün planı kartında. Tur yok. |
| `m-hub-plansiz` | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | Plan kartı kayıttaki cevapları gösterir ve tek düğmeyle planı hazırlar; ilk mikro ders plansız da başlar. |
| `m-hub-gun-bitti` | Ana ekran · günün planı bitti | `ModuleHubHome` | Bitti kartı: görev, dakika, seri; Yarına bak ve isteğe bağlı fazladan 10 soru. |
| `m-hub-abonelik-bitti` | Ana ekran · deneme süresi bitti | `ModuleHubHome` | Ödeme yoksa erişim yok: ilerleme korunur, modüller kilitli; Paketleri gör ve mağaza alımını geri yükle. |

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
| `m-deneme-detay-bitti` | Biten denemenin detayı | `ExamStudentPublicDetail` | Canlı hata #3: biten denemede “Denemeye gir” ve hatırlatma yok; önce sonuç, sonra Sonuç belgesi, Çözümler, Analiz ve net kaybettiren konular. |
| `m-deneme-baslangic` | Başlamadan önce | `ExamStudentStarting` | — |
| `m-deneme-coz` | Deneme çözme | `ExamStudentSolve` | Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Doğru ve yanlış teslimden sonra açılır. |
| `m-deneme-teslim` | Teslim onayı | `ExamStudentSolve` | Gri sistem penceresi yerine uygulamanın alt sayfası: cevaplı, boş, işaretli sayıları ve boş soruların numaraları; Boşlara dön / Teslim et. |
| `m-deneme-baglanti` | Deneme · bağlantı koptu | `ExamStudentSolve` | Cevaplar telefonda saklanır, süre işler, bağlanınca kendiliğinden gönderilir; bekleyen cevap sayısı. |
| `m-deneme-denemelerim` | Denemelerim | `MyExams` | Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede. |
| `m-deneme-sonuclar` | Sonuçlar | `ExamResultsHub` | Net gelişimi sütunlarla (değer sütunun üstünde, dışarıda çözülen çizgili), üç giriş: Sınavika denemelerim, Analizlerim, Deneme ekle; son sonuçlar. |
| `m-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `ExamResultsHub` | İlk denemeden önce: ne birikeceği, sıradaki deneme ve Deneme ekle. |
| `m-deneme-ekle` | Deneme ekle | `ExamExternalResult (yeni)` | Yeni: dışarıda çözülen denemenin sonucu (yayın, ad, tarih, ders ders doğru/yanlış, net canlı hesaplanır). Yeni API gerekir. |
| `m-deneme-sonuc` | Sonuç | `ExamResultDocument` | — |
| `m-deneme-analiz` | Eksik konu analizi | `ExamStatsLessonOverview` | Analiz eylemle biter: mikro ders, test, plana ekle. |
| `m-deneme-gelisim` | Ders gelişimi | `ExamStatsLessonTrend` | — |
| `m-deneme-cozumler` | Çözümler | `ExamSolutionExamCards` | — |
| `m-deneme-cozum` | Soru çözümü | `ExamSolutionBookletReview` | — |

### Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ders-vitrin` | Dersler | `WorkHome` | Kaldığın yerden (GET continue), bugünkü tekrar (GET reviews) ve sınavın dersleri mikro ders ilerlemesiyle (GET lessons). |
| `m-ders-ilk` | Dersler · ilk giriş | `WorkHome` | Kaldığın yer henüz yok: kayıtta zorlandığın dersten ilk konu ve Dersler’in nasıl işlediği üç satırda. |
| `m-ders-konular` | Konular | `WorkCatalog` | Dersin konuları müfredat sırasıyla: mikro ders sayısı, süre, ilerleme ve ilk denemede doğru oranı. |
| `m-ders-tekrar` | Tekrar | `WorkReview` | İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede. |
| `m-ders-tekrar-bos` | Tekrar · bugün yok | `WorkReview` | Sıradaki tekrarın günü ve adım sayısı; kaldığın derse dönüş. |
| `m-ders-konu-girisi` | Konu girişi | `WorkSub` | Kanca, video ve mikro derslerin yol haritası; tek düğme sıradaki mikro derse götürür. Video yoksa satır gizlenir. |
| `m-ders-tanim` | Adım · Tanım | `WorkMikro` | Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle. |
| `m-ders-ornek` | Adım · Örnek | `WorkMikro` | Example: örnek cümle, açıklama ve dikkat notu. |
| `m-ders-kural` | Adım · Kural | `WorkMikro` | Rule: numaralı kural listesi. |
| `m-ders-gorsel` | Adım · Görsel | `WorkMikro` | Visual: merkezi figür (burada karşılaştırma tablosu) ve kısa açıklama. |
| `m-ders-tahmin` | Adım · Önce sen tahmin et | `WorkMikro` | Choice: seçimden sonra açıklama ve Gerçek/Mecaz karşılaştırması. |
| `m-ders-dogru-yanlis` | Adım · Doğru mu, yanlış mı? | `WorkMikro` | TrueFalse: sık yapılan hata yargı olarak sorulur; doğrusu ve nedeni. |
| `m-ders-grupla` | Adım · Grupla | `WorkMikro` | Gruplar alt alta, kutudaki metin tam (kesilmez), hedef sözcük koyu; kalan kart sayısı Kontrol et’in üstünde. |
| `m-ders-eslestir` | Adım · Eşleştir | `WorkMikro` | Eşleşen ikili aynı numarayı alır; Kontrol et sabit altta, kaydırmadan görünür. |
| `m-ders-cevir` | Adım · Çevir | `WorkMikro` | Arka yüzde içeriğin açıklaması da görünür; Biliyordum / Bilmiyordum kartın içinde. |
| `m-ders-sec` | Adım · Seç (sözcüğe dokun) | `WorkMikro` | Cümlenin sözcükleri dokunulabilir; seçilen sayısı yazılı. |
| `m-ders-coklu` | Adım · Çoklu seçim | `WorkMikro` | Sonuçta yanlış seçilen ve kaçırılan ayrı işaretli. |
| `m-ders-sirala` | Adım · Sırala | `WorkMikro` | Order: adımlara sırayla dokunulur; sürükleme gerekmez. |
| `m-ders-bosluk` | Adım · Boşluk doldur | `WorkMikro` | FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer. |
| `m-ders-yazmali` | Adım · Yazmalı boşluk | `WorkMikro` | Satırdaki boşluk giriş alanının kendisi; klavye açıkken Kontrol et klavyenin üstünde. |
| `m-ders-formul` | Adım · Formül ve tablo | `WorkMikro` | Kesir üst üste, eksi kesrin önünde; kök çizgisi içini örter; üs harfe yakın; tablo hücresi en az 15 pt. |
| `m-ders-bolum` | Bölüm başı | `WorkMikro` | Bölümün ne öğreteceği, bölüm haritası ve Önceki bölüm düğmesi. |
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
| `m-test-yanlislar` | Yanlışlarım | `QuizSolutions` | İlk yanlıştan açılır; Yanlış / Boş / Tümü; konuyu çalış (Dersler renginde) ve Sonraki yanlış. |
| `m-test-bitti` | Test bitti | `QuizComplete` | — |
| `m-test-cozumler` | Çözümler | `QuizSolutions` | — |
| `m-test-cozumler-bos` | Çözümler · henüz test yok | `QuizSolutions` | Senin için hazır testle başla. |

### Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-plan-bugun` | Bugün | `StudyPlanHome` | Örnek takvim yapısı: Gün/Hafta/Ay, modül süzgeçleri, hafta halkaları, günün yüzdesi ve süre; her görev kaynağını (sınav · ders · neden), konusunu, modül rozetini ve miktarını (soru, mikro ders, kart) ya da saatini söyler. + kendi görevin. |
| `m-plan-yok` | Planı olmayan öğrenci | `StudyPlanHome (StudyPlanNoPlanEmpty)` | Planın ne yaptığı, kayıt cevaplarından örnek bir gün; Planımı hazırla ya da kendim kurayım. |
| `m-plan-dunden` | Dünden kalan görevler | `StudyPlanHome` | Biten olmayan görev sessizce kaybolmaz: Bugüne ekle ya da haftaya yay (PATCH schedule). |
| `m-plan-gorev-ekle` | Görev ekle | `StudyPlanManualTaskSheet` | Kendi görevin: tür, ders ve konu, not, gün ve saat, süre (POST study-plan tasks). |
| `m-plan-gorev-islem` | Görev işlemleri | `StudyPlanTaskActionSheet` | Görevi başlat (modül renginde), odak sayacıyla başla, yarına taşı, yaptım olarak işaretle, bugünden kaldır (PATCH status / schedule). |
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
| `m-ozet-hak` | Aylık hak doldu | `LensHome` | Yenilenme tarihi, geçmiş analizler açık; SinoAI’ye yönlendirme. |
| `m-ozet-okunamadi` | Fotoğraf okunamadı | `LensUpload` | Neden ve üç çekim ipucu; hak düşmedi. |
| `m-ozet-video` | Video analizi | `LensVideo` | — |

### Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-kart-vitrin` | Bilgi Kartları | `FlashcardMain` | Sekmeler Kartlar · Bugün · Kaydedilenler. |
| `m-kart-bugun` | Bugün | `FlashcardToday` | — |
| `m-kart-bitti` | Bugün · kartlar bitti | `FlashcardToday` | Kaç kart, kaçını bildin, yarın kaç kart; kart serisi. |
| `m-kart-on` | Kart oturumu · ön yüz | `FlashcardSession` | — |
| `m-kart-arka` | Kart oturumu · cevap | `FlashcardSession` | — |
| `m-kart-kaydedilen` | Kaydedilenler | `FlashcardSavedTab` | — |

### SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-sino-ana` | SinoAI | `SinoAi` | — |
| `m-sino-sohbet` | SinoAI · sohbet | `SinoAiChat` | — |
| `m-sino-calisma` | SinoAI · çalışma | `SinoAiChat (Çalışma)` | Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı. |
| `m-sino-sonuc` | SinoAI · üretim sonucu | `SinoAiChat (Çalışma sonucu)` | Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir. |
| `m-sino-kutuphane` | SinoAI · kütüphane | `—` | — |
| `m-sino-menu` | SinoAI · menü | `SinoAiChat (menü)` | Arama, yeni sohbet, kütüphane ve gün gün sohbetler. |
| `m-sino-hak` | SinoAI · günlük hak doldu | `SinoAi` | Ne zaman yenileneceği, kütüphane açık; mikro ders ve testler bu hakkı kullanmaz. |

### Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-profil` | Profil | `ProfileMain` | Hedef, abonelik, görünüm, destek ve hakkında tek yerde. |
| `m-profil-devam` | Profil · alt bölüm | `ProfileMain` | — |

### İstatistikler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-istatistik` | İstatistiklerim | `ProfileStatistics` | Bu hafta: süre, soru, seri; günlük çalışma modüllere göre yığılı; net gelişimi; derslere göre doğru oranı ve süre. |
| `m-istatistik-ilk` | İstatistikler · ilk hafta | `ProfileStatistics` | Sıfır duvarı yerine ilk üç adım; veri geldikçe grafikler açılır. |

### Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-profil-bilgiler` | Kişisel bilgiler | `ProfileUserInfo / ProfileEdit` | — |
| `m-profil-hedef` | Hedefim | `ProfileAcademic` | — |
| `m-profil-abonelik` | Aboneliğim | `ProfileMySubscriptions` | — |
| `m-profil-paketler` | Paketler | `ProfileAvailablePackages` | — |
| `m-profil-gorunum` | Görünüm | `ProfileAppearance` | — |
| `m-profil-dil` | Dil | `ProfileLanguage` | — |
| `m-profil-iletisim` | Bildirim ve iletişim | `ProfileCommunicationPreferences` | — |
| `m-profil-guvenlik` | Hesap güvenliği | `ProfileAccountSecurity` | Şifre belirleme ya da değiştirme, oturumlar. |
| `m-profil-kapat` | Hesabımı kapat | `ProfileAccountClosure` | — |
| `m-hakkinda` | Hakkında | `ExamAbout` | — |
| `m-geri-bildirim` | Geri bildirimlerim | `FeedbackMy` | — |

### Bildirimler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-bildirimler` | Bildirimler | `NotificationInbox` | — |
| `m-bildirimler-bos` | Bildirim yok | `NotificationInbox` | Neyin burada görüneceği ve bildirim ayarları. |

### Destek

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-destek` | Destek | `SupportHub` | — |
| `m-destek-yeni` | Yeni talep | `SupportNew` | — |
| `m-destek-talep` | Talep detayı | `SupportTicketDetail` | — |

### Durumlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-durum-bos` | Boş durum | `—` | — |
| `m-durum-hata` | Yükleniyor, hata, çevrimdışı | `—` | — |
| `m-durum-guncelleme` | Zorunlu güncelleme | `— (yeni: açılışta sürüm kontrolü)` | Desteklenmeyen sürüm: yüklü ve gerekli sürüm, tek düğme; ilerleme hesapta. |

## Web paneli ve web giriş/onboarding


### Web · Giriş ve kayıt

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-giris` | Giriş yap | `/student/login` | Solda form (Google ve Apple üstte, kodla giriş), sağda tanıtım paneli. |
| `w-giris-kod` | Giriş kodu | `/student/login` | — |
| `w-kayit` | Kayıt ol | `/student/register` | Kayıtta paket yok: önce plan, sonra paket. |
| `w-sifre-unuttum` | Şifremi unuttum | `/student/forgot-password` | — |
| `w-sifre-sifirla` | Şifre sıfırla | `/student/reset-password` | — |

### Web · Onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-onb-1-sinav` | Web onboarding 1 · Sınav | `/student/baslangic` | Mobil ile aynı adımlar, sağda canlı önizleme. |
| `w-onb-2-hedef` | Web onboarding 2 · Hedef | `/student/baslangic` | — |
| `w-onb-3-tempo` | Web onboarding 3 · Tempo | `/student/baslangic` | — |
| `w-onb-4-dersler` | Web onboarding 4 · Dersler | `/student/baslangic` | — |
| `w-onb-5-plan` | Web onboarding 5 · Planın hazır | `/student/baslangic` | Sağda aynı planın mobil hali. |
| `w-onb-6-paket` | Web onboarding 6 · Paketini seç | `/student/baslangic` | Web’de deneme süresi yok: paket seçilir, kartla ödenir; “Şimdilik paket seçme” de var. |

### Web · Ana sayfa

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-anasayfa` | Ana sayfa | `/student/dashboard` | Mobil ile aynı Bugün düzeni: selam, hedef ve seri; günün planı ve sıradaki görev; hafta şeridi ve iki ölçü; Kaldığın yerden, Sıradaki deneme, Bugün tekrar. |
| `w-panel-tur` | İlk giriş ipucu | `/student/dashboard` | İlk girişte tek ipucu, günün adımının üstünde. |
| `w-panel-anasayfa-plansiz` | Ana sayfa · planı olmayan öğrenci | `/student/dashboard` | Plan kartı kayıt cevaplarını gösterir, Planımı hazırla; ilk mikro ders plansız başlar. |
| `w-panel-anasayfa-gun-bitti` | Ana sayfa · günün planı bitti | `/student/dashboard` | — |
| `w-panel-anasayfa-abonelik-bitti` | Ana sayfa · deneme süresi bitti | `/student/dashboard` | Ödeme yoksa erişim yok; ilerleme korunur. |
| `w-panel-moduller` | Tüm modüller | `/student/moduller` | — |

### Web · Bildirimler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-bildirimler` | Bildirimler | `/student/bildirimler` | — |

### Web · Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-profil` | Profil | `/student/profil` | — |
| `w-panel-abonelik` | Profil · abonelik | `/student/profil` | — |
| `w-panel-ayarlar` | Profil · bildirim ve görünüm | `/student/profil` | — |

### Web · Destek

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-destek` | Destek | `/student/destek` | — |
| `w-panel-destek-talep` | Destek talebi | `/student/destek/[id]` | — |

### Web · Ödeme

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-odeme` | Ödeme | `/student/odeme` | — |
| `w-panel-odeme-basarili` | Ödeme başarılı | `/student/odeme/basarili` | — |
| `w-panel-odeme-basarisiz` | Ödeme başarısız | `/student/odeme/basarisiz` | — |

### Web · Durumlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-durumlar` | Boş, yükleniyor, hata | `—` | — |

### Web · Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-deneme-vitrin` | Denemeler | `/student/sinavlarim` | — |
| `w-deneme-denemelerim` | Denemelerim ve takvim | `/student/denemelerim` | Denemelerin ve sınav takvimi tek sekmede. |
| `w-deneme-detay` | Deneme detayı | `/student/sinav/[examId]` | — |
| `w-deneme-detay-bitti` | Biten denemenin detayı | `/student/sinav/[examId]` | Önce sonuç, sonra belge, çözüm, analiz ve net kaybettiren konular. |
| `w-deneme-coz` | Deneme çözme (odak) | `/student/sinav/coz/[examUserId]` | — |
| `w-deneme-teslim` | Teslim onayı | `/student/sinav/coz/[examUserId]` | Mobil ile aynı: cevaplı, boş, işaretli; boş numaralar; Enter / Esc. |
| `w-deneme-sonuclar` | Sonuçlar | `/student/sinav-sonuclari` | — |
| `w-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `/student/sinav-sonuclari` | — |
| `w-deneme-ekle` | Deneme ekle | `/student/sinav-sonuclari (yeni)` | Yeni API gerekir. |
| `w-deneme-sonuc` | Sonuç ve analiz | `/student/sinav-sonuclari/[snapshotId]` | — |
| `w-deneme-cozumler` | Soru çözümleri | `/student/soru-cozumleri/[examAttemptId]` | Soru haritası ve çözüm. |

### Web · İstatistikler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-istatistik` | İstatistiklerim | `/student/raporlarim` | Satırlarda ders adı. |

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
| `w-ders-grupla` | Oynatıcı · Grupla | `/student/ders-cal/mikro/[workMikroId]` | Mobilin adım çizimi oynatıcının içinde (EmbedStep). |
| `w-ders-eslestir` | Oynatıcı · Eşleştir | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-formul` | Oynatıcı · Formül ve tablo | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-bolum` | Oynatıcı · Bölüm başı | `/student/ders-cal/mikro/[workMikroId]` | — |
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
| `w-test-yanlislar` | Yanlışlarım | `/student/testler/quiz/[quizId]` | İlk yanlıştan açılır; soru ızgarası solda. |

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

### Web · Akıllı Özet

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-ozet-vitrin` | Akıllı Özet | `/student/lens` | Geçmişte konu başlığı. |
| `w-ozet-yeni` | Yeni analiz | `/student/lens/yeni` | — |
| `w-ozet-detay` | Analiz detayı | `/student/lens/analiz/[id]` | — |
| `w-ozet-video` | Video analizi | `/student/lens/video/[id]` | — |

### Web · Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-kart-vitrin` | Bilgi Kartları | `/student/flashcard` | — |
| `w-kart-gozat` | Gözat | `/student/flashcard/browse/...` | — |
| `w-kart-oturum` | Kart oturumu (odak) | `/student/flashcard/session` | — |
| `w-kart-kaydedilen` | Kaydedilenler | `/student/flashcard (Kaydedilenler)` | — |

### Web · SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-sino-sohbet` | SinoAI sohbet | `/student/sinoai/[conversationId]` | Solda geçmiş, ortada tek sohbet sütunu. |
| `w-sino-calisma` | SinoAI çalışma | `/student/sinoai/study` | — |
| `w-sino-kutuphane` | SinoAI kütüphane | `/student/sinoai/library` | — |

## Tablet (iPad ve Android tablet, kalem)


### Tablet · Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-deneme-coz-taslak` | Deneme çözme · taslak kâğıdı | `ExamStudentSolve` | Yatay: soru solda, Taslak kâğıdı sağda (%38). Araç çubuğu kâğıdın kenarında, metni kapatmaz. Taslak soruya kayıtlı; soru haritasında kalem rozeti. |
| `t-deneme-coz-isaretleme` | Deneme çözme · soruya yaz | `ExamStudentSolve` | Soru üzeri işaretleme: fosforlu kalem, altını çizme, şık eleme, kenar notu. Kalem çizer, parmak kaydırır; Kaydır/Çiz yalnız parmakla çizim açıkken görünür. |
| `t-deneme-coz-dikey` | Deneme çözme · dikey | `ExamStudentSolve` | Dikey: şıklar üç sütun, Taslak kâğıdı alt yarıda. Parmakla çizim açık olduğu için Kaydır/Çiz anahtarı araç çubuğunda. |
| `t-deneme-cozum-notlar` | Çözüm · notlarım | `ExamSolutionBookletReview` | Çözümlerde öğrencinin kendi işaretleri salt okunur geri gelir (göster/gizle); taslağı resmî çözümün yanında. |
| `t-deneme-kalem-ipucu` | Kalem · ilk açılış ipucu | `ExamStudentSolve` | Kalemli tablette ilk çözümde tek ipucu, Soruya yaz düğmesinde. Tur yok. |
| `t-deneme-detay` | Deneme detayı | `ExamStudentPublicDetail` | Canlı deneme açılmadan önce: kalan süre ve Hatırlat (web ile aynı sayfa). |
| `t-deneme-teslim` | Teslim onayı | `ExamStudentSolve` | Web ile aynı pencere; klavyede Enter / Esc. |
| `t-deneme-detay-bitti` | Biten denemenin detayı | `ExamStudentPublicDetail` | — |
| `t-deneme-sonuclar` | Sonuçlar | `ExamResultsHub` | Net sütunları, üç giriş satırı, son sonuçlar tablosu. |
| `t-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `ExamResultsHub` | — |
| `t-deneme-ekle` | Deneme ekle | `ExamExternalResult (yeni)` | Yeni API gerekir. |

### Tablet · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-test-coz-taslak` | Test çözme · taslak kâğıdı | `QuizSolve` | Yeni: Testler’e taslak kâğıdı. Anında geri bildirim soru sütununda, işlem yanda kalır. |
| `t-test-coz-yanlis` | Yanlış cevap · taslağı göster | `QuizSolve` | Yanlışta taslak yerinde kalır; “Taslağımı SinoAI’ye göster” yalnız öğrenci isterse gönderir ve okunanı önce gösterir. |
| `t-test-sekilli-soru` | Şekilli soru · şekle yaz | `QuizSolve` | Kalem şeklin üstüne yazar: açı, bulunan değer. Şıklar sağ sütunda, elenenler çizili. |

### Tablet · Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-ders-vitrin` | Dersler · yatay | `WorkHome` | Yatayda sekme çubuğu yerine yan ray. Kaldığın yer ve tekrar yan yana, dersler üç sütun; Notlarım üstte. |
| `t-ders-tanim-not` | Adım · Tanım · kenar notu | `WorkMikro` | Yeni: Dersler’e kalem. Okuma sütunu ve sağda kenar boşluğu; fosforlu kalem ve not adıma kayıtlı. |
| `t-ders-soru-eleme` | Adım · TYT tarzı soru · eleme | `WorkMikro` | Şıklar kalemle elenir, seçilen daire içinde; cevap yine dokunarak verilir. |
| `t-ders-bosluk-el-yazisi` | Adım · Boşluk doldur · el yazısı | `WorkMikro` | Kalemle kutuya yazılır, okunan sözcük gösterilir, sonra kontrol edilir. Klavye her zaman seçenek. |
| `t-ders-notlarim` | Notlarım | `WorkNotes (yeni)` | Yeni ekran: konunun tüm kenar notları ve taslakları mikro derse göre; dokununca adımına götürür. PDF olarak alınabilir. |
| `t-ders-grupla` | Adım · Grupla | `WorkMikro` | Mobilin adım çizimi tablet oynatıcısında (EmbedStep). |
| `t-ders-eslestir` | Adım · Eşleştir | `WorkMikro` | — |
| `t-ders-formul` | Adım · Formül ve tablo | `WorkMikro` | — |
| `t-ders-bolum` | Bölüm başı | `WorkMikro` | — |

### Tablet · Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-kart-el-yazisi` | Kart · önce kendin yaz | `FlashcardSession` | Ön yüzde isteğe bağlı yazma alanı; kontrol edilmez, cevapla öğrenci kendisi karşılaştırır. |

### Tablet · Modüller

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-hub-moduller` | Ana ekran · yatay | `ModuleHubHome` | Web ana sayfasının kendisi tablet çerçevesinde (PanelInTablet): aynı Bugün düzeni, aynı parçalar. |
| `t-hub-plansiz` | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | Kayıt cevaplarıyla Planımı hazırla; ilk mikro ders plansız başlar. |
| `t-hub-gun-bitti` | Ana ekran · günün planı bitti | `ModuleHubHome` | — |
| `t-hub-abonelik-bitti` | Ana ekran · deneme süresi bitti | `ModuleHubHome` | Ödeme yoksa erişim yok; ilerleme korunur. |

### Tablet · Kalem

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-kalem-ayarlar` | Profil · Kalem ve çizim | `ProfileSettings (yeni bölüm)` | Parmakla çizim, kalemde çift dokunuş, varsayılan renk ve kalınlık, taslak yeri, çözümlerde notlar, notların saklandığı yer. |

### Tablet · Kalemsiz

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-deneme-klavye` | Deneme · klavye ve soru haritası | `ExamStudentSolve` | Bağlı klavyede A–E cevaplar, oklar gezdirir, İ işaretler; soru haritası yatayda hep açık. |
| `t-ders-sinoai-panel` | Ders adımı · SinoAI yan panelde | `WorkMikro` | SinoAI adımı kapatmadan yanda açılır ve adımı bilir; uyarı satırı panelin altında. |
| `t-ders-konular-iki-panel` | Dersler · konular iki panel | `WorkCatalog + WorkSub` | Konu listesi solda kalır, seçilen konunun girişi ve mikro dersleri sağda; konu değiştirmek tek dokunuş. |

### Tablet · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-test-yanlislar` | Yanlışlarım | `QuizSolutions` | Web Yanlışlarım sayfası tablette: soru ızgarası solda, çözüm sağda. |

### Tablet · Kalemsiz

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-plan-bugun` | Ders Planı · Bugün | `StudyPlanHome` | Web Ders Planı · Bugün sayfası tablette: Gün/Hafta/Ay, süzgeçler, görev kartları. |
| `t-plan-hafta` | Ders Planı · hafta | `StudyPlanSchedule` | Haftanın yedi günü yan yana, görevler sürüklenerek taşınır; bugünün görevleri sağda. |
| `t-istatistik-pano` | İstatistiklerim | `ProfileStatistics` | Web İstatistiklerim sayfasının kendisi tablette. |
| `t-bolunmus-ekran` | Bölünmüş ekran | `Uygulama geneli` | Split View / Stage Manager: pencere 600 pt altına inince telefon düzeni; süre ve oturum kesilmez. |

## Web sitesi (giriş öncesi)


### Web sitesi · Ana sayfa

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-anasayfa` | Ana sayfa | `/` | Sitenin header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri. |
| `s-urunler-menu` | Ürünler menüsü | `header` | Ürünler açılınca 7 modül, sitenin sade gri tonlarında. |

### Web sitesi · Sınavlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-sinavlar` | Sınavlar | `/sinavlar` | — |
| `s-sinav-yks` | Sınav sayfası · YKS | `/yks-hazirlik (şablon)` | Tüm sınav ve hazırlık sayfaları bu şablonla. |
| `s-net-hesaplama` | Net hesaplama | `/net-hesaplama` | — |

### Web sitesi · Paketler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-paketler` | Paketler | `/corporate/packages` | Yalnız ücretli paketler; deneme süresi mobil uygulamada. |

### Web sitesi · Ürünler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-urun-denemeler` | Ürün · Denemeler | `/urunler/denemeler (şablon)` | Altı ürün sayfası tek şablon. |
| `s-urun-ozet` | Ürün · Akıllı Özet | `/urunler/lens` | — |

### Web sitesi · Blog

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-blog` | Blog | `/blog` | — |
| `s-blog-yazi` | Blog yazısı | `/blog/[slug]` | — |

### Web sitesi · Kurumsal

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-hakkimizda` | Hakkımızda | `/corporate/about` | — |
| `s-sss-iletisim` | SSS ve iletişim | `/corporate/sss + /contact` | — |
| `s-yasal` | Yasal sayfa | `/corporate/yasal/[slug]` | — |

### Web sitesi · SinoAI misafir

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-sinoai-misafir` | SinoAI · misafir | `/sinoai` | — |

