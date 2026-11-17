# Sınavika UI/UX ekran envanteri

Bu dosya `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile çizim kaydından (`src/UIUX/Registry.ts`) üretilir; elle düzenlenmez.
Her satır bir çizimi, gerçek uygulamadaki karşılığını ("Rota") ve değişikliğin nedenini gösterir. "yeni" bugün olmayan ekrandır.

Toplam 328 çizim: mobil uygulama 162, web paneli ve web giriş/onboarding 93, tablet (ipad ve android tablet, kalem) 37, web sitesi (giriş öncesi) 14, akıllı saat (apple watch ve wear os) 12, paylaşım kartları (hikâye ve gönderi) 10.

## Mobil uygulama


### Modüller

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-hub-moduller` | Modüller (ana ekran) | `ModuleHubHome` | Ana ekran (5 Kas 2026 revizyonu; 17 Kas sahip kararları): önce “bugün ne yapacağım”. Selamın üstünde tarih yok; hedef selamın karşısında, seri hedefin altında. Hafta şeridi (bugünün halkası); günün planı ve sıradaki görev tek düğmeyle; iki eylem kartı (kaldığın yer, sıradaki deneme); modüller üç sütun. Veri: engagement/today, study-plan calendar, works continue, yaklaşan deneme. |
| `m-hub-moduller-kaydir` | Modüller · aşağı kaydırılmış | `ModuleHubHome` | Modüller ızgarası, SinoAI, Bugün tekrar (Dersler adımları + Bilgi Kartları) ve Destek. |
| `m-hub-ipucu` | İlk açılış ipucu | `ModuleHubHome` | İlk açılışta tek ipucu, günün planı kartında. Tur yok. |
| `m-hub-plansiz` | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | Plan kartı kayıttaki cevapları gösterir ve tek düğmeyle planı hazırlar; ilk konu plansız da başlar. |
| `m-hub-gun-bitti` | Ana ekran · günün planı bitti | `ModuleHubHome` | Bitti kartı: görev, dakika, seri; Yarına bak ve isteğe bağlı fazladan 10 soru. |
| `m-hub-abonelik-bitti` | Ana ekran · deneme süresi bitti | `ModuleHubHome` | Ödeme yoksa erişim yok: ilerleme korunur, modüller kilitli; Paketleri gör ve mağaza alımını geri yükle. |

### Giriş ve kayıt

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-giris-karsilama` | Karşılama | `—` | Oturumu kapatmış öğrencinin karşılaması: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var. Uygulamanın ilk açılışı m-onb-0-karsilama’dır. |
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
| `m-onb-0-karsilama` | Onboarding 0 · Karşılama | `Onboarding · OnboardingWelcomeStep` | Uygulamanın ilk ekranı: tek cümle, iki örnek kart (kaldığın yer, deneme), Başlayalım ve Hesabım var. |
| `m-onb-0-bolge` | Onboarding 0 · Bölge | `Onboarding · OnboardingRegionStep` | Yalnız cihaz bölgesi belirsizse: Türkiye (YKS, KPSS) ya da United States (SAT, ACT). |
| `m-onb-1-sinav` | Onboarding 1 · Sınav ve oturum | `Onboarding · OnboardingCategoryExamStep` | Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir. |
| `m-onb-2-net` | Onboarding 2 · Mevcut ve hedef net | `Onboarding · OnboardingStudyNetStep` | Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”. |
| `m-onb-3-tempo` | Onboarding 3 · Tempo ve günler | `Onboarding · OnboardingStudyTempoStep` | Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz). |
| `m-onb-4-dersler` | Onboarding 4 · Zorlandığın dersler | `Onboarding · OnboardingStudyWeakStep` | İsteğe bağlı; planda bu derslere daha çok yer ayrılır. |
| `m-onb-5-plan` | Onboarding 5 · Planın hazır | `Onboarding · plan özeti (OnboardingStudyWeakStep sonrası)` | Hafta modül renkleriyle; bugünkü ilk görev somut. İlerleme çubuğu planı kuran beş adımı sayar. |
| `m-onb-6-hesap` | Planını kaydet | `AuthRegister` | Hesap ödeme ekranından önce: önce emeğin güvene alınır. Apple ve Google önde, e-posta ikincil. |
| `m-onb-7-deneme` | 3 gün ücretsiz | `Onboarding · OnboardingTrialStep` | Bugün, hatırlatma günü ve ücret günü açıkça. Başlayınca öğrenci bugünkü ilk konuya girer. |
| `m-onb-8-bildirim` | Bildirim izni · ilk çalışmadan sonra | `—` | İzin, ilk çalışma bitince ve hatırlatmanın değeri belliyken istenir; sistem penceresinden önce kendi açıklamamız. |

### Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-deneme-vitrin` | Denemeler | `ExamDashboard` | Aylık deneme setinden şerit (yaklaşan: tarih, kalan süre, Hatırlat; açık: Canlı, kapanış, Başla), devam eden deneme (1 saat 14 dk kaldı), Bu ay sırada. |
| `m-deneme-katalog` | Tüm denemeler | `ExamDashboard (tüm denemeler)` | — |
| `m-deneme-detay` | Deneme detayı | `ExamStudentPublicDetail` | Yaklaşan: Açılış Cumartesi 10:00 · kalan süre, Hatırlat (tek dokunuş; yeniden dokunmak kapatır). |
| `m-deneme-detay-acik` | Deneme detayı · açık | `ExamStudentPublicDetail` | Açık · kapanmasına kalan süre ve Başla. |
| `m-deneme-detay-kapali` | Deneme detayı · süre dışında | `ExamStudentPublicDetail` | Pencere dışında Başla pasif, nedeni üstünde. |
| `m-deneme-detay-bitti` | Biten denemenin detayı | `ExamStudentPublicDetail` | Canlı hata #3: biten denemede “Denemeye gir” ve hatırlatma yok; önce sonuç, sonra Sonuç belgesi, Çözümler, Analiz ve net kaybettiren konular. |
| `m-deneme-baslangic` | Başlamadan önce | `ExamStudentStarting` | — |
| `m-deneme-coz` | Deneme çözme | `ExamStudentSolve` | Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Cevap teslime kadar değişir ve boşaltılır; çıkış her zaman ara ver penceresi, iptal yolu yok. Doğru ve yanlış teslimden sonra açılır. |
| `m-deneme-teslim` | Teslim onayı | `ExamStudentSolve` | Gri sistem penceresi yerine uygulamanın alt sayfası: cevaplı, boş, işaretli sayıları ve boş soruların numaraları; Boşlara dön / Teslim et. |
| `m-deneme-baglanti` | Deneme · bağlantı koptu | `ExamStudentSolve` | Ortak “gönderilecek” görünümü: seçilen şık kilitli, altında nötr satır; süre işler, bağlanınca kendiliğinden gönderilir. |
| `m-deneme-denemelerim` | Denemelerim | `MyExams · ExamMyExams` | Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede. |
| `m-deneme-ay` | Geçmiş ay | `ExamMonth` | Geçmiş bir ayın deneme haritası: girilenlerin neti, sonuç ve çözüm; kaçırılan yazılı. |
| `m-deneme-sonuclar` | Sonuçlar | `ExamResultsHub · ExamResultsList` | Net gelişimi sütunlarla (değer sütunun üstünde, dışarıda çözülen çizgili), üç giriş: Sınavika denemelerim, Analizlerim, Deneme ekle; son sonuçlar. |
| `m-deneme-sonuclar-disarida` | Sonuçlar · dışarıda çözülen | `ExamResultsHub` | Çizgili sütuna dokununca: ne olduğu ve Sil (onaylı). |
| `m-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `ExamResultsHub · ExamResultsList` | İlk denemeden önce: ne birikeceği, sıradaki deneme ve Deneme ekle. |
| `m-deneme-ekle` | Deneme ekle | `ExamExternalResult` | Dışarıda çözülen denemenin sonucu (yayın, ad, tarih, ders ders doğru/yanlış, net canlı hesaplanır). API: student/external-exams. |
| `m-deneme-sonuc` | Sonuç | `ExamResultDocument · ExamResults` | — |
| `m-deneme-analiz` | Eksik konu analizi | `ExamStatsLessonOverview · ExamStatistics` | Analiz eylemle biter: konu anlatımı, konunun testinin gerçek soru sayısı (test yoksa pasif), plana ekle. |
| `m-deneme-analiz-eklendi` | Eksik konu analizi · plana eklendi | `ExamStatsLessonOverview` | Düğme modül yumuşak tonunda Planına eklendi; kısa bildirim. |
| `m-deneme-gelisim` | Ders gelişimi | `ExamStatsLessonTrend` | — |
| `m-deneme-net` | Deneme neti | `ExamStatsExamNet` | Toplam net, ders ders D/Y/B ve net kaybettiren konular (Konuyu çalış, Test). |
| `m-deneme-cozumler` | Çözümler | `ExamSolutionExamCards` | — |
| `m-deneme-cozum` | Soru çözümü | `ExamSolutionBookletReview` | Tümü / Yanlışlar · N / Boşlar · N sorunun üstünde, Yanlışlar ile açılır; koyu SinoAI’ye sor, altında Derse git. |

### Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ders-vitrin` | Dersler | `WorkHome · WorkOverview` | Kaydırılan slaytlar (Kaldığın yerden, Tekrar, Ders çalış), modülün haftası (istatistik kartı) ve sınavın dersleri yüzde ilerlemeyle (GET lessons). |
| `m-ders-ilk` | Dersler · ilk giriş | `WorkHome · WorkOverview` | Kaldığın yer henüz yok: kayıtta zorlandığın dersten ilk konu ve Dersler’in nasıl işlediği üç satırda. |
| `m-ders-konular` | Konular | `WorkLesson · WorkCatalog` | Ders hapları, Tümü / Süren / Biten süzgeci; konular müfredat sırasıyla: adım sayısı, süre, yüzde ilerleme ve ilk denemede doğru. Konuya basınca oynatıcı kaldığın yerden açılır. |
| `m-ders-tekrar` | Tekrar | `WorkReviewHome · WorkReview` | İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede. |
| `m-ders-tekrar-bos` | Tekrar · bugün yok | `WorkReviewHome` | Sıradaki tekrarın günü ve adım sayısı; kaldığın derse dönüş. |
| `m-ders-tekrar-oturum` | Tekrar oturumu | `WorkReviewSession` | Tekrarda bir adım: tekrar sırası, kaynağı, tek deneme; doğruysa bir sonraki aralık yazılır. |
| `m-ders-tanim` | Adım · Tanım | `WorkMikro` | Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle. |
| `m-ders-baglanti` | Oynatıcı · bağlantı yok | `WorkMikro` | Ortak “gönderilecek” görünümü (Dersler, Testler, Denemeler aynı): adım seçimle kilitli, doğru/yanlış yok; altında nötr satır “Bağlantı yok; cevabın kaydedildi. Bağlanınca gönderilecek.”; Devam açık. Tek merkezi kuyruk. |
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
| `m-ders-sirala` | Adım · Sırala | `WorkMikro` | Order: basılı tutup sürükle ya da sırayla dokun; Baştan diz. |
| `m-ders-bosluk` | Adım · Boşluk doldur | `WorkMikro` | FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer. |
| `m-ders-yazmali` | Adım · Yazmalı boşluk | `WorkMikro` | Satırdaki boşluk giriş alanının kendisi; klavye açıkken Kontrol et klavyenin üstünde. |
| `m-ders-formul` | Adım · Formül ve tablo | `WorkMikro` | Kesir üst üste, eksi kesrin önünde; kök çizgisi içini örter; üs harfe yakın; tablo hücresi en az 15 pt. |
| `m-ders-soru` | Adım · Sınav tarzı soru | `WorkMikro` | Question: her yanlışta bir çözüm adımı açılır, öğrenci yeniden seçer; kalan deneme yazılı. SinoAI’ye sor. |
| `m-ders-sekilli-soru` | Adım · Şekilli soru | `WorkMikro` | Question ve soru şekli (figure): şekil kökle birlikte, şıklardan önce. |
| `m-ders-konu-sonu` | Konu sonu | `WorkSubSummary` | İlk denemede doğru sayısı ve Paylaş; özet, dikkat notları, kamp görevi; Testler’in Kolay seviyesine geçiş (Testler renginde); Konuyu baştan oku, Konulara dön; içerik anketi (Beğendim / Beğenmedim). |
| `m-ders-hak` | Günlük konu hakkı | `WorkSub (PAYWALL)` | Abonelik yokken ya da günün konu hakkı bitince alt sayfa; metin konu adı içermez; arkada düz zemin (oynatıcı açılamadı, giriş ekranı yok). Ödeme marka yüzeyi olduğu için düğmesi turuncu. |

### Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-test-vitrin` | Testler | `QuizHome` | Kaydırılan slaytlar (Senin için hazır, kaldığın yer, konular) ve noktalar; modül istatistik kartı; dersler çubuklu listede. |
| `m-test-konular` | Konular | `QuizCatalog` | Bütün derslerin açılır ağacı; açık derste konular ve üç seviye. |
| `m-test-detay` | Test seviyeleri | `QuizLessonSub · QuizOverview` | Ders çipleri, konu, bu dersteki hafta kartı; Kolay, Orta, Zor · 20’şer soru; satırda Tekrar / Devam et / Başla ya da kilit. |
| `m-test-coz` | Doğru cevap | `QuizSolve` | Anında geri bildirim (tek dokunuş): doğru şık, kısa çözüm; soru meta satırında İşaretle. |
| `m-test-coz-yanlis` | Yanlış cevap | `QuizSolve` | Doğru şık ve nedeni; konunun anlatımına (Dersler renginde) ya da SinoAI’ye geçiş. |
| `m-test-baglanti` | Bağlantı yok | `QuizSolve` | Cevap merkezi kuyrukta; seçili şık kalır, doğru/yanlış gönderilince görünür; ortak not ve Devam. |
| `m-test-bitir-bekliyor` | Testi bitir · bekleyen cevap | `QuizSolve` | Bekleyen cevap varken test bitmez; alt sayfada uyarı ve Tamam. |
| `m-test-yanlislar` | Yanlışlarım | `QuizReview` | İlk yanlıştan açılır; Yanlış / Boş / Tümü (boş süzgeç soluk, dokunulmaz); numara satırı yalnız süzgeçtekiler; İşaretli düğmesi; Bu soruyu paylaş, SinoAI’ye sor; konuyu çalış (Dersler renginde) ve Sonraki yanlış. |
| `m-test-yanlislar-son` | Yanlışlarım · son yanlış | `QuizReview` | Süzgeçteki son soruda ana düğme Bitti; Çözümler’e döner. |
| `m-test-yanlislar-dogru` | Yanlışlarım · yanlış yok | `QuizReview` | Yanlış yoksa ilk boştan, o da yoksa Tümü süzgeciyle 1. sorudan açılır; boş süzgeçler soluk. |
| `m-test-bitti` | Test bitti | `QuizComplete` | — |
| `m-test-cozumler` | Çözümler | `QuizSolutions · QuizReview` | Tümü · Yanlışlar · N · İşaretli; tekrar testi satırı “Konu · Tekrar”; hazırsa tekrar testi kartı. |
| `m-test-cozumler-isaretli` | Çözümler · İşaretli | `QuizSolutions` | İşaretli soru Yanlışlarım’da Tümü süzgeciyle açılır; bitmemiş testin sorusu kilitli: Test bitince açılır. |
| `m-test-cozumler-bos` | Çözümler · henüz test yok | `QuizSolutions` | Senin için hazır testle başla. |

### Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-plan-bugun` | Bugün | `StudyPlanHome` | Örnek takvim yapısı: Gün/Hafta/Ay, modül süzgeçleri, hafta halkaları, günün yüzdesi ve süre; her görev kaynağını (sınav · ders · neden), konusunu, modül rozetini ve miktarını (soru, dakika, kart) ya da saatini söyler. + kendi görevin. |
| `m-plan-yok` | Planı olmayan öğrenci | `StudyPlanHome (StudyPlanNoPlanEmpty)` | Planın ne yaptığı, kayıt cevaplarından örnek bir gün; Planımı hazırla ya da kendim kurayım. |
| `m-plan-dunden` | Dünden kalan görevler | `StudyPlanHome` | Biten olmayan görev sessizce kaybolmaz: Bugüne ekle ya da haftaya yay (PATCH schedule). |
| `m-plan-gorev-ekle` | Görev ekle | `StudyPlanManualTaskSheet` | Kendi görevin: tür, ders ve konu, not, gün ve saat, süre (POST study-plan tasks). |
| `m-plan-gorev-islem` | Görev işlemleri | `StudyPlanTaskActionSheet` | Ana düğme görevin modülüne göre (Konuya başla, Testi başlat, Denemeye geç, Kartlara başla); odak sayacıyla başla (25 + 5 dk), yarına taşı, saati değiştir, yaptım, bugünden kaldır. |
| `m-plan-gorev-islem-kendi` | Görev işlemleri · kendi görevin | `StudyPlanTaskActionSheet` | İçeriği olmayan görevde ana düğme Odak sayacıyla başla (25 dk + 5 dk mola); Yarına taşı, Saati değiştir, Yaptım, Bugünden kaldır. |
| `m-plan-odak` | Odak sayacı | `StudyPlanFocus` | — |
| `m-plan-ilerleme` | İlerleme | `StudyPlanProgressHome` | — |
| `m-plan-konu` | Konu ilerlemesi | `StudyPlanLessonProgress` | — |
| `m-plan-program` | Program | `StudyPlanSchedule · StudyPlanPlan` | Başlıkta Düzenle (Planım) ve Haftanı paylaş. |
| `m-plan-ayarlar` | Plan ayarları | `StudyPlanCreate` | — |

### Akıllı Özet

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-ozet-vitrin` | Akıllı Özet | `LensHome · LensAnalyses` | Geçmişte konu başlığı; başlıkta Kullanım %N (SinoAI ile ortak hak, aylık sayı yok); Tümü yok. |
| `m-ozet-yukle` | Soru yükle | `LensNew · LensUpload` | Fotoğraf ya da galeri (PDF yok); Neler alacaksın? bilgi satırları. |
| `m-ozet-kamera` | Kamera | `LensCamera` | Mod çipi yok; tek soru çekilir. |
| `m-ozet-isleniyor` | Analiz ediliyor | `LensSessionProgress` | İptal yok; kapatmak analizi durdurmaz. |
| `m-ozet-sonuc` | Çözüm | `LensSessionDetail` | Kart yapma yok; Konuyu çalış (Dersler · konu); Benzer 5 soru konunun testini açar; en altta Sorunun fotoğrafı. |
| `m-ozet-hak` | Aylık hak doldu | `LensHome` | Kullanım %100; yenilenme tarihi, geçmiş analizler açık; SinoAI’ye yönlendirme yok. |
| `m-ozet-okunamadi` | Fotoğraf okunamadı | `LensUpload` | Neden ve üç çekim ipucu; hak düşmedi. |
| `m-ozet-pdf` | Analiz PDF | `LensSessionPdf` | PDF önizlemesi, sayfa sayısı; Paylaş ve PDF aç. |
| `m-ozet-video` | Video analizi | `LensVideo` | — |

### Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-kart-vitrin` | Bilgi Kartları | `FlashcardMain` | Sekmeler Kartlar · Bugün · Kaydedilenler. Dersler sınav başına bölümlü (başlık sınav adı, sağda N ders). |
| `m-kart-vitrin-ilk` | Bilgi Kartları · ilk kullanım | `FlashcardMain` | N yeni kart seni bekliyor · Yeni kartlara başla; ders satırlarında Yeni. |
| `m-kart-desteler` | Ders · desteler | `FlashcardLesson` | Ders özeti (N deste · %X öğrenildi + halka); deste satırı: konu, x/y kart · %z, N zayıf. |
| `m-kart-bugun` | Bugün | `FlashcardToday` | — |
| `m-kart-bugun-bos` | Bugün · tekrar yok | `FlashcardToday` | Bugün tekrar edilecek kart yok · Derslere git. |
| `m-kart-bitti` | Bugün · kartlar bitti | `FlashcardToday` | Bugün modunda oturum sonu: kaç kart, kaçını bildin, yarın kaç kart; kart serisi. |
| `m-kart-deste-bitti` | Deste bitti | `FlashcardSession` | Deste ve kaydedilenler oturumunun sonu; altında içerik anketi. |
| `m-kart-on` | Kart oturumu · ön yüz | `FlashcardSession` | — |
| `m-kart-arka` | Kart oturumu · cevap | `FlashcardSession` | — |
| `m-kart-kaydedilen` | Kaydedilenler | `FlashcardSavedTab` | Kaydettiğin N kart (yer imi); ders çipiyle süzülünce Kaydedilenleri tekrar et o dersle açılır. |

### SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-sino-ana` | SinoAI | `SinoAi` | — |
| `m-sino-sohbet` | SinoAI · sohbet | `SinoAiChat` | Yanıt eylemleri: yeniden üret, kopyala, paylaş, beğen, beğenme. |
| `m-sino-calisma` | SinoAI · çalışma | `SinoAiChat (Çalışma)` | Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı. |
| `m-sino-sonuc` | SinoAI · üretim sonucu | `SinoAiChat (Çalışma sonucu)` | Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir. |
| `m-sino-kutuphane` | SinoAI · kütüphane | `SinoAiLibrary` | Tümü · Test · Deste · Özet sayılarla; satır N soru · ders · tarih; plan satırı yalnız Tümü’de. |
| `m-sino-kaynaklar` | SinoAI · kaynaklarım | `SinoAiSources` | Kaynak ekle; okundu/okunuyor; 90 gün kuralı; çalışma notları. |
| `m-sino-not` | SinoAI · çalışma notu | `SinoAiStudyNote` | Önemli noktalar ve terimler; Kart yap, Test üret; uyarı satırı. |
| `m-sino-menu` | SinoAI · menü | `SinoAiChat (menü)` | Arama, yeni sohbet, kütüphane, Kaynaklarım, gün gün sohbetler; altta kullanım çubuğu ve SinoAI’den çık. |
| `m-sino-hak` | SinoAI · aylık hak doldu | `SinoAi` | Hak aylık ve Akıllı Özet ile ortak: yenilenme tarihi, Kütüphaneme git, Bu arada kartı. |

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
| `m-istatistik-ders` | İstatistikler · tek ders | `ProfileStatisticsLesson` | Bir dersin süresi, sorusu, başarısı ve konu konu başarı. |

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
| `m-hakkinda` | Hakkında | `ProfileAbout` | — |
| `m-geri-bildirim` | Geri bildirimlerim | `FeedbackMy` | — |

### Bildirimler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-bildirimler` | Bildirimler | `NotificationInbox` | — |
| `m-bildirimler-bos` | Bildirim yok | `NotificationInbox` | Neyin burada görüneceği ve bildirim ayarları. |
| `m-bildirim-ayarlar` | Bildirim ayarları | `ProfileNotificationSettings` | Yeni: türlere göre aç/kapa. Günde en çok 2 hatırlatma, 22:00–08:00 sessiz; canlı etkinlikler ayrı; bağlı saat. |

### Bildirimler · kilit ekranı ve canlı etkinlik

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-bildirim-canli-deneme` | Canlı etkinlik · deneme başlıyor | `iOS Live Activity (ActivityKit)` | Yeni: canlı denemeye 15 dk kala kilit ekranında geri sayım, katılan sayısı ve Hazırım. Uygulama simgesi yok (Apple), modül simgesi var. Sunucu push-to-start ile başlatır, deneme başlayınca biter. |
| `m-bildirim-canli-odak` | Canlı etkinlik · odak oturumu | `iOS Live Activity (ActivityKit)` | Yeni: odak sayacı kilit ekranında; tek düğme (Duraklat) uygulamayı açmadan çalışır (App Intents, Apple: tek etkileşimli öğe). Öğrenci başlatır, süre bitince hemen kapanır. |
| `m-bildirim-ada` | Dynamic Island hâlleri | `iOS Live Activity (ActivityKit)` | Kompakt, minimal (iki etkinlik), genişletilmiş deneme ve konu. Deneme sürerken soru, kalan süre ve boşlar. |
| `m-bildirim-seri` | Canlı etkinlik · akşam serisi | `iOS Live Activity (ActivityKit)` | Yeni: yalnız o gün çalışılmadıysa 20:00’de; gerçek son (23:59) ve tek kısa yol (12 kart · 5 dk). Sahte aciliyet yok. |
| `m-bildirim-zengin` | Zengin bildirimler | `UNNotificationContent + attachment` | Yeni: her bildirim tek bilgi ve modül renginde küçük görsel (net sütunları, modül simgesi). Metinler sen dilinde, sayı somut. |
| `m-bildirim-genis` | Bildirim · uzun basınca | `Notification Content Extension` | Yeni: deneme sonucu bildirimi açılınca ders ders net ve iki eylem (Yanlışlarımı çalış, Planıma ekle). Yalnız uygulamayı açan eylem yok: bildirime dokunmak açar. |
| `m-bildirim-android` | Android 16 · canlı güncelleme | `Notification.ProgressStyle (Live Update)` | Yeni: odak oturumu durum çubuğunda süre çipi ve bildirimde görev dilimleri; deneme sonucu büyük görselle, kart hatırlatması eylemli. |
| `m-bildirim-widget-kilit` | Kilit ekranı widget’ları | `WidgetKit (accessory)` | Yeni: dakika halkası, sıradaki görev, seri. Sabah plan bildirimi. |
| `m-bildirim-widget-ana` | Ana ekran widget’ları | `WidgetKit (iOS)` | Yeni: iOS ana ekranı. Bugün halkası, sıradaki deneme, etkileşimli plan listesi (görev uygulama açılmadan tamamlanır). |
| `m-bildirim-widget-android` | Android ana ekran widget’ları | `Jetpack Glance (Android)` | Yeni: Material You, renkler duvar kâğıdından. 2×2 bugün halkası, 2×1 sıradaki deneme ve odak başlat, 4×2 etkileşimli plan listesi; boyutlandırılabilir. Dokunma hedefi 48 dp, köşe sistemin (Google, Tier 1). |

### Destek

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-destek` | Destek | `Support · SupportHub` | — |
| `m-destek-talepler` | Taleplerim | `SupportTickets` | Açılan taleplerin durumu (Yanıtlandı, İnceleniyor, Kapandı) ve Yeni talep. |
| `m-destek-yeni` | Yeni talep | `SupportNew` | — |
| `m-destek-talep` | Talep detayı | `SupportTicketDetail` | — |

### Durumlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-durum-bos` | Boş durum | `—` | — |
| `m-durum-hata` | Yükleniyor, hata, çevrimdışı | `—` | — |
| `m-durum-guncelleme` | Zorunlu güncelleme | `ForceUpdateGate` | Desteklenmeyen sürüm: yüklü ve gerekli sürüm, tek düğme; ilerleme hesapta. API: app/version, mobil ForceUpdateGate. |

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
| `w-panel-anasayfa` | Ana sayfa | `/student/dashboard` | Mobil ile aynı Bugün düzeni: selam ve altında hedef (tarih yok); sağda seri ve Paylaş. Her satır aynı iki sütun (1,3 / 1), satırdaki kartlar eş boy: günün planı + hafta; Kaldığın yerden ve Sıradaki deneme sol sütunda, Bugün tekrar sağda; Bu hafta + Modüller. |
| `w-panel-tur` | İlk giriş ipucu | `/student/dashboard` | İlk girişte tek ipucu, günün adımının üstünde. |
| `w-panel-anasayfa-plansiz` | Ana sayfa · planı olmayan öğrenci | `/student/dashboard` | Plan kartı kayıt cevaplarını gösterir, Planımı hazırla; ilk konu plansız başlar. |
| `w-panel-anasayfa-gun-bitti` | Ana sayfa · günün planı bitti | `/student/dashboard` | — |
| `w-panel-anasayfa-abonelik-bitti` | Ana sayfa · deneme süresi bitti | `/student/dashboard` | Ödeme yoksa erişim yok; ilerleme korunur. |
| `w-panel-moduller` | Tüm modüller | `/student/moduller (yeni sayfa: web uygulamasında yok)` | — |

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
| `w-sinav-takvimi` | Sınav takvimi | `/student/sinav-takvimi` | Resmî sınavlara kalan gün ve bu ayın Sınavika denemeleri. |
| `w-deneme-basla` | Başlamadan önce | `/student/sinav/[examId]/basla` | Mobildeki Başlamadan önce ile aynı kurallar ve geri sayım. |
| `w-deneme-detay` | Deneme detayı | `/student/sinav/[examId]` | — |
| `w-deneme-detay-bitti` | Biten denemenin detayı | `/student/sinav/[examId]` | Önce sonuç, sonra belge, çözüm, analiz ve net kaybettiren konular. |
| `w-deneme-coz` | Deneme çözme (odak) | `/student/sinav/coz/[examUserId]` | — |
| `w-deneme-teslim` | Teslim onayı | `/student/sinav/coz/[examUserId]` | Mobil ile aynı: cevaplı, boş, işaretli; boş numaralar; Enter / Esc. |
| `w-deneme-sonuclar` | Sonuçlar | `/student/sinav-sonuclari` | Sütun etiketleri tarih, dışarıdaki Dışarıda; ÖSYM düzeninde tablo (ders netleri, toplam net, Puan), satır sonunda Analiz, dışarıdakinde Sil. |
| `w-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `/student/sinav-sonuclari` | — |
| `w-deneme-ekle` | Deneme ekle | `/student/sinav-sonuclari` | API: student/external-exams. |
| `w-deneme-sonuc` | Sonuç ve analiz | `/student/sinav-sonuclari/[snapshotId]` | — |
| `w-deneme-cozumler` | Soru çözümleri | `/student/soru-cozumleri/[examAttemptId]` | Soru haritası ve çözüm. |
| `w-deneme-cozum-liste` | Soru çözümleri listesi | `/student/soru-cozumleri` | — |

### Web · İstatistikler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-istatistik` | İstatistiklerim | `/student/raporlarim` | Satırlarda ders adı. Hesap sayfası (modül değil, mobildeki gibi). |

### Web · Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-ders-vitrin` | Dersler | `/student/ders-cal` | Kaldığın yerden, bugünkü tekrar ve sınavın dersleri; henüz içeriği olmayan ders “Yakında”. |
| `w-ders-konular` | Konular | `/student/ders-cal/ders · /ders/[lessonMainId]` | Ders hapları ve Tümü / Süren / Biten süzgeci; konular: adım, süre, yüzde ilerleme, ilk denemede doğru; yanda ders ilerlemesi. |
| `w-ders-tekrar` | Tekrar | `/student/ders-cal/tekrar` | Günü gelen adımlar; 1, 3 ve 7 gün aralıkla. |
| `w-ders-tekrar-oturum` | Tekrar oturumu | `/student/ders-cal/tekrar/oturum` | Mobilin tekrar adımı oynatıcıda. |
| `w-ders-tanim` | Oynatıcı · Tanım | `/student/ders-cal/mikro/[workMikroId]` | Ortada 700 px adım, üstte konu boyu ilerleme (Adım x / y), sağda Bu konuda ve SinoAI. Parça zaman çizelgesi yok. |
| `w-ders-tahmin` | Oynatıcı · Önce sen tahmin et | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-bosluk` | Oynatıcı · Boşluk doldur | `/student/ders-cal/mikro/[workMikroId]` | Tek deneme; yanlışta doğru sözcük ve nedeni. |
| `w-ders-dogru-yanlis` | Oynatıcı · Doğru mu, yanlış mı? | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-sirala` | Oynatıcı · Sırala | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-grupla` | Oynatıcı · Grupla | `/student/ders-cal/mikro/[workMikroId]` | Mobilin adım çizimi oynatıcının içinde (EmbedStep). |
| `w-ders-eslestir` | Oynatıcı · Eşleştir | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-formul` | Oynatıcı · Formül ve tablo | `/student/ders-cal/mikro/[workMikroId]` | — |
| `w-ders-soru` | Oynatıcı · Sınav tarzı soru | `/student/ders-cal/mikro/[workMikroId]` | Yanlış şıktan sonra çözüm adımı açılır, öğrenci yeniden seçer; 1–5 tuşları. |
| `w-ders-konu-sonu` | Konu sonu | `/student/ders-cal/konu/[lessonSubId]/ozet` | İlk denemede doğru ve Paylaş; özet, dikkat notları, kamp görevi, Testler’e geçiş; Konuyu baştan oku, Konulara dön; içerik anketi. |
| `w-ders-akis` | Akış panosu | `—` | Konuya dokun → oynatıcı (kaldığın adımdan, bölüm geçişi aynı ekranda) → konu sonu → Testler ve Kartlar; yanlışlar Tekrar’a. |

### Web · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-test-vitrin` | Testler | `/student/testler` | — |
| `w-test-konular` | Ders konuları | `/student/testler/[lessonMainId]` | Ders çipleri yok; sağ üstte Tüm dersler Testler vitrinine döner. |
| `w-test-konular-tum` | Konular | `/student/testler/konular` | Konu konu Kolay, Orta, Zor ilerlemesi. |
| `w-test-cozumler` | Çözümler | `/student/testler/cozumler` | Mobildeki süzgeç ve tekrar testi kartı; satır sağında Yanlışlarım; tekrar testi satırı “Konu · Tekrar”. |
| `w-test-cozumler-isaretli` | Çözümler · İşaretli | `/student/testler/cozumler` | Soruyu aç → Yanlışlarım, Tümü süzgeci; bitmemiş testin sorusu: Test bitince açılır. |
| `w-test-coz` | Test çözme · doğru | `/student/testler/quiz/[quizId]` | — |
| `w-test-coz-yanlis` | Test çözme · yanlış | `/student/testler/quiz/[quizId]` | Doğru şık ve nedeni; konunun anlatımına ya da SinoAI’ye geçiş. |
| `w-test-baglanti` | Test çözme · bağlantı yok | `/student/testler/quiz/[quizId]` | Ortak çevrimdışı not; bekleyen cevap varken Testi bitir bitirmez, uyarı düğmenin yanında. |
| `w-test-yanlislar` | Yanlışlarım | `/student/testler/cozumler/[attemptId]` | İlk yanlıştan açılır; ızgara bütün soruları gösterir (doğrular yeşil), süzgeç Sonraki’nin gezdiği soruları seçer. |
| `w-test-yanlislar-son` | Yanlışlarım · son yanlış | `/student/testler/cozumler/[attemptId]` | Süzgeçteki son soruda Bitti; Çözümler’e döner. |

### Web · Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-plan-bugun` | Bugün | `/student/ders-plani` | Kart gövdesi içeriği açar, sağ üstteki daire tamamlar, … Diğer işlemler. |
| `w-plan-gorev-menu` | Bugün · Diğer işlemler | `/student/ders-plani` | Odak sayacıyla başla, Yarına taşı, Saati değiştir, Bugünden kaldır. |
| `w-plan-yok` | Planı olmayan öğrenci | `/student/ders-plani` | Ortalı kutu (Planımı hazırla · 1 dk, Kendi planımı kuracağım), sağda örnek gün. |
| `w-plan-dunden` | Dünden kalan görevler | `/student/ders-plani` | Dünden kalan kutusu sol kartın üstünde: Haftaya yay, Bugüne ekle. |
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
| `w-ozet-gecmis` | Geçmiş analizler | `/student/lens/gecmis` | — |
| `w-ozet-yeni` | Yeni analiz | `/student/lens/yeni` | Çıktı seçimi yok; not alanı ve ipuçları; Analizi başlat. |
| `w-ozet-detay` | Analiz detayı | `/student/lens/analiz/[id]` | — |
| `w-ozet-video` | Video analizi | `/student/lens/video/[id]` | — |

### Web · Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-kart-vitrin` | Bilgi Kartları | `/student/flashcard` | Yeni deste düğmesi yok (deste oluşturma yok). |
| `w-kart-bugun` | Bugün | `/student/flashcard/bugun` | — |
| `w-kart-gozat` | Gözat | `/student/flashcard/browse` | Deste seçimi ızgaranın üstünde çip satırı; x/y kart · %z ve Bu desteyi çalış. |
| `w-kart-oturum` | Kart oturumu (odak) | `/student/flashcard/session` | Boşluk: çevir · 1–3: puanla; ←/→ ile kart gezme yok. |
| `w-kart-kaydedilen` | Kaydedilenler | `/student/flashcard/kaydedilenler` | — |

### Web · SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-sino-sohbet` | SinoAI sohbet | `/student/sinoai` | Solda geçmiş, ortada tek sohbet sütunu. |
| `w-sino-hak` | SinoAI · aylık hak doldu | `/student/sinoai` | Hak doldu bloğu sohbet sütununda; yazma alanı kapalı. |
| `w-sino-calisma` | SinoAI çalışma | `/student/sinoai/uret` | — |
| `w-sino-kutuphane` | SinoAI kütüphane | `/student/sinoai/kutuphane` | — |
| `w-sino-kaynaklar` | Kaynaklarım | `/student/sinoai/kaynaklarim` | — |
| `w-sino-not` | Çalışma notu | `/student/sinoai/kutuphane/not/[id]` | — |

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
| `t-deneme-ekle` | Deneme ekle | `ExamExternalResult` | API: student/external-exams. |

### Tablet · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-test-coz-taslak` | Test çözme · taslak kâğıdı | `QuizSolve` | Yeni: Testler’e taslak kâğıdı. Anında geri bildirim soru sütununda, işlem yanda kalır. |
| `t-test-coz-yanlis` | Yanlış cevap · taslağı göster | `QuizSolve` | Yanlışta taslak yerinde kalır; “Taslağımı SinoAI’ye göster” yalnız öğrenci isterse gönderir ve okunanı önce gösterir. |
| `t-test-sekilli-soru` | Şekilli soru · şekle yaz | `QuizSolve` | Kalem şeklin üstüne yazar: açı, bulunan değer. Şıklar sağ sütunda, elenenler çizili. Cevap şıkka tek dokunuşla; Cevapla düğmesi yok. |

### Tablet · Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-ders-vitrin` | Dersler · yatay | `WorkHome` | Yatayda sekme çubuğu yerine yan ray. Kaldığın yer ve tekrar yan yana, dersler üç sütun; Notlarım üstte. |
| `t-ders-tanim-not` | Adım · Tanım · kenar notu | `WorkMikro` | Yeni: Dersler’e kalem. Okuma sütunu ve sağda kenar boşluğu; fosforlu kalem ve not adıma kayıtlı. |
| `t-ders-soru-eleme` | Adım · Sınav tarzı soru · eleme | `WorkMikro` | Şıklar kalemle elenir, seçilen daire içinde; cevap yine dokunarak verilir. |
| `t-ders-bosluk-el-yazisi` | Adım · Boşluk doldur · el yazısı | `WorkMikro` | Kalemle kutuya yazılır, okunan sözcük gösterilir, sonra kontrol edilir. Klavye her zaman seçenek. |
| `t-ders-notlarim` | Notlarım | `WorkNotes` | Konunun tüm kenar notları ve taslakları bölüme göre; dokununca adımına götürür. API: student/notes/works. |
| `t-ders-grupla` | Adım · Grupla | `WorkMikro` | Mobilin adım çizimi tablet oynatıcısında (EmbedStep). |
| `t-ders-eslestir` | Adım · Eşleştir | `WorkMikro` | — |
| `t-ders-formul` | Adım · Formül ve tablo | `WorkMikro` | — |

### Tablet · Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-kart-el-yazisi` | Kart · önce kendin yaz | `FlashcardSession` | Ön yüzde isteğe bağlı yazma alanı; kontrol edilmez, cevapla öğrenci kendisi karşılaştırır. |

### Tablet · Modüller

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-hub-moduller` | Ana ekran · yatay | `ModuleHubHome` | Web ana sayfasının kendisi tablet çerçevesinde (PanelInTablet): aynı Bugün düzeni. Hedef ve seri selamın karşısında yan yana; Modüller kartında Tümü yok, altında SinoAI ve Destek yan yana (sol menü yok). |
| `t-hub-plansiz` | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | Kayıt cevaplarıyla Planımı hazırla; ilk konu plansız başlar. |
| `t-hub-gun-bitti` | Ana ekran · günün planı bitti | `ModuleHubHome` | — |
| `t-hub-abonelik-bitti` | Ana ekran · deneme süresi bitti | `ModuleHubHome` | Ödeme yoksa erişim yok; ilerleme korunur. |

### Tablet · Kalem

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-kalem-ayarlar` | Profil · Kalem ve çizim | `ProfilePenSettings` | Parmakla çizim, kalemde çift dokunuş, varsayılan renk ve kalınlık, taslak yeri, çözümlerde notlar, notların saklandığı yer. |

### Tablet · Kalemsiz

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-deneme-klavye` | Deneme · klavye ve soru haritası | `ExamStudentSolve` | Bağlı klavyede A–E cevaplar, oklar gezdirir, İ işaretler; soru haritası yatayda hep açık. |
| `t-ders-sinoai-panel` | Ders adımı · SinoAI yan panelde | `WorkMikro` | 400 pt panel, adımı kapatmadan açılır; SinoAI sohbet oturumunun kendi üst çubuğu (menü, Sohbet · Çalışma, yeni sohbet); uyarı satırı panelin altında. |
| `t-ders-konular-iki-panel` | Dersler · konular iki panel | `WorkCatalog + WorkSub` | Konu listesi solda kalır, seçilen konunun özeti ve Bu konuda listesi sağda; konu değiştirmek tek dokunuş. |

### Tablet · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `t-test-yanlislar` | Yanlışlarım | `QuizReview` | Web Yanlışlarım sayfası tablette: 5 sütunlu ızgara solda (bütün sorular), çözüm sağda. |
| `t-test-yanlislar-son` | Yanlışlarım · son yanlış | `QuizReview` | Son yanlışta Bitti; Çözümler’e döner. |

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

## Akıllı saat (Apple Watch ve Wear OS)


### Saat · Apple Watch

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `k-apple-bugun` | Bugün | `watchOS app` | Dakika halkası, görev sayısı, seri ve sıradaki görev; Başla odak sayacını saatte açar. |
| `k-apple-plan` | Günün planı | `watchOS app` | Görevler modül renginde; yuvarlağa dokununca görev tamamlanır. |
| `k-apple-odak` | Odak sayacı | `watchOS app` | Sayaç saatte çalışır, telefondaki canlı etkinlikle eşit; Duraklat ve Bitir. |
| `k-apple-kart` | Hızlı kart tekrarı | `watchOS app` | Saatte yapılabilen tek çalışma: Bilgi Kartları. Soru yüzü ve Cevabı göster. |
| `k-apple-kart-cevap` | Kart · cevap | `watchOS app` | Cevap ve iki düğme: bilmedim / bildim. Tekrar günü telefonla aynı. |
| `k-apple-deneme` | Deneme geri sayımı | `watchOS app` | Canlı denemeye kalan süre ve hatırlatma; deneme telefonda çözülür. |
| `k-apple-kadran` | Kadran komplikasyonları | `WidgetKit (watchOS)` | Seri, sıradaki görev (dikdörtgen), dakika, kart ve deneme halkaları. |
| `k-apple-yigin` | Akıllı Yığın | `WidgetKit (watchOS)` | Sabah ve canlı deneme öncesi Sınavika widget’ı yığının üstüne çıkar. |
| `k-apple-bildirim` | Bildirim · eylemli | `watchOS notification (long look)` | Odak bitince sonuç ve iki eylem: sıradaki görev ya da 5 dk mola. |

### Saat · Wear OS

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `k-wear-kutucuk` | Kutucuk (Tile) | `Wear OS Tile (ProtoLayout)` | Kenarda dakika yayı (altta kenar düğmesi için boşluk), ortada 45/90 ve seri; sıradaki görev Material 3 kenar düğmesinde. Tek görev, fazla işlev yok (Google). |
| `k-wear-odak` | Odak sayacı | `Wear OS app (Compose for Wear OS)` | Kenarda kalan süre yayı, ortada sayaç, yuvarlak Duraklat ve Bitir; ongoing activity. |
| `k-wear-kadran` | Kadran komplikasyonları | `Wear OS complications` | Aralıklı değer (dakika), kısa metin (seri) ve uzun metin (sıradaki görev). |

## Paylaşım kartları (hikâye ve gönderi)


### Paylaşım kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `p-deneme-hikaye` | Deneme sonucu · hikâye | `ShareCard (mobil: görünümden PNG · web: next/og)` | Net, geçen denemeye göre fark, D/Y/B (simge + sözcük), en iyi ders. “ÖSYM puanı değildir” notu; puan tahmini yok. |
| `p-deneme-gonderi` | Deneme sonucu · gönderi | `ShareCard (mobil: görünümden PNG · web: next/og)` | Aynı içerik 1080 × 1080; istatistikten ilk üçü. |
| `p-seri-hikaye` | Seri rozeti · hikâye | `ShareCard (mobil: görünümden PNG · web: next/og)` | 3 · 7 · 14 · 30 gün basamakları: ulaşılan beyaz ve tikli, sıradaki kesikli. Marka yüzeyi (turuncu). |
| `p-seri-gonderi` | Seri rozeti · gönderi | `ShareCard (mobil: görünümden PNG · web: next/og)` | Aynı içerik 1080 × 1080. |
| `p-konu-hikaye` | Konu bitirme · hikâye | `ShareCard (mobil: görünümden PNG · web: next/og)` | Dersler: konu adı, adım sayısı, ilk denemede doğru oranı. |
| `p-konu-gonderi` | Konu bitirme · gönderi | `ShareCard (mobil: görünümden PNG · web: next/og)` | Aynı içerik 1080 × 1080. |
| `p-hafta-hikaye` | Haftalık özet · hikâye | `ShareCard (mobil: görünümden PNG · web: next/og)` | Ders Planı: haftalık süre, günlük sütunlar (en çok çalışılan gün beyaz), soru, deneme, seri. |
| `p-hafta-gonderi` | Haftalık özet · gönderi | `ShareCard (mobil: görünümden PNG · web: next/og)` | Aynı içerik 1080 × 1080. |
| `p-soru-hikaye` | Bu soruyu çözdüm · hikâye | `ShareCard (mobil: görünümden PNG · web: next/og)` | Testler: soru metni ya da görseli ve şıklar; cevap ve çözüm yok. Ders · konu etiketi, süre ve seviye. |
| `p-soru-gonderi` | Bu soruyu çözdüm · gönderi | `ShareCard (mobil: görünümden PNG · web: next/og)` | Aynı içerik 1080 × 1080. |

