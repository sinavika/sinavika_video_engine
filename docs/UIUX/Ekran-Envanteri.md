# Sınavika UI/UX ekran envanteri

Bu dosya `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile çizim kaydından (`src/UIUX/Registry.ts`) üretilir; elle düzenlenmez.
Her satır bir çizimi, gerçek uygulamadaki karşılığını ("Rota") ve değişikliğin nedenini gösterir. "yeni" bugün olmayan ekrandır.

Toplam 587 çizim: mobil uygulama 162, web paneli ve web giriş/onboarding 95, tablet (ipad ve android tablet, kalem) 37, iphone duo (dış ve iç ekran) 255, web sitesi (giriş öncesi) 13, akıllı saat (apple watch ve wear os) 12, paylaşım kartları (hikâye ve gönderi) 10, pdf belgeleri (a4) 3.

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
| `m-giris-oturum-ac` | Oturum aç veya kaydol | `AuthLogin` | E-posta ve şifreyle açılır; “E-postama kod gönder” ikincil. Apple ve Google üstte. |
| `m-giris-kod` | Doğrulama kodu | `AuthLogin` | 6 kutulu kod, yeniden gönderme süresi, şifreyle giriş seçeneği. |
| `m-kayit-eposta` | Hesap oluştur | `AuthRegister` | Apple ve Google önde; e-postayla devam edene kod gider. |
| `m-sifre-unuttum` | Şifremi unuttum | `AuthForgotPassword` | — |
| `m-sifre-yeni` | Kod ve yeni şifre | `AuthForgotPassword` | — |
| `m-giris-sayfa` | Misafir · hesap gerekli | `AuthEntrySheet` | Misafir hesap isteyen bir şeye dokununca alt sayfa açılır; her bağlamda aynı: marka tonunda kişi simgesi, modül simgesi yok. |

### Onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-onb-0-karsilama` | Onboarding 0 · Karşılama | `Onboarding · OnboardingWelcomeStep` | Uygulamanın ilk ekranı: tek cümle, iki örnek kart (kaldığın yer, deneme), Başlayalım ve Hesabım var. |
| `m-onb-0-bolge` | Onboarding 0 · Bölge | `Onboarding · OnboardingRegionStep` | Yalnız cihaz bölgesi belirsizse: Türkiye (YKS, KPSS) ya da United States (SAT, ACT). |
| `m-onb-1-sinav` | Onboarding 1 · Sınav ve oturum | `Onboarding · OnboardingCategoryExamStep` | Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir. |
| `m-onb-2-net` | Onboarding 2 · Mevcut ve hedef net | `Onboarding · OnboardingStudyNetStep` | Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”. |
| `m-onb-3-tempo` | Onboarding 3 · Tempo ve günler | `Onboarding · OnboardingStudyTempoStep` | Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz). |
| `m-onb-4-dersler` | Onboarding 4 · Zorlandığın dersler | `Onboarding · OnboardingStudyWeakStep` | İsteğe bağlı; planda bu derslere daha çok yer ayrılır. |
| `m-onb-5-plan` | Onboarding 5 · Planın hazır | `Onboarding · plan özeti (OnboardingStudyWeakStep sonrası)` | Ayrı adım, ödemeden önce (mobil 5/5). Hafta modül renkleriyle; ilk görev kartında ok yok, ödeme öncesi görev açılmaz. |
| `m-onb-7-deneme` | 3 gün ücretsiz | `Onboarding · OnboardingTrialStep` | Bugün, hatırlatma günü ve ücret günü açıkça. Ödemeden sonra ana ekran açılır; ilk konu kendiliğinden açılmaz. Hesap adımı yok: mağaza satın alması hesapsız. |
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
| `m-profil` | Profil | `ProfileMain` | Üç ölçü kartı yok; Hesabım: Hedefim, Kişisel bilgiler, Aboneliğim, İstatistiklerim; Uygulama: Görünüm, Dil, Bildirimler. Ayrı Paketler, İletişim tercihleri, Puanla satırı yok. |
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
| `m-profil-bilgiler` | Kişisel bilgiler | `ProfileUserInfo / ProfileEdit` | Ad, soyad, e-posta, telefon; fotoğraf ve doğum yılı yok. |
| `m-profil-hedef` | Hedefim | `ProfileAcademic` | Sınav ve puan türü; hedef net, bölüm, tempo yok. |
| `m-profil-abonelik` | Aboneliğim | `ProfileMySubscriptions` | Kullanım tek satır yapay zekâ yüzdesi (Akıllı Özet + SinoAI ortak). |
| `m-profil-abonelik-hediye` | Aboneliğim · hediye erişim | `ProfileMySubscriptions` | Admin hediyesi: … tarihine kadar açık; mağaza notu yok. |
| `m-profil-paketler` | Paketler | `ProfileAvailablePackages` | — |
| `m-profil-gorunum` | Görünüm | `ProfileAppearance` | Yalnız tema. |
| `m-profil-dil` | Dil | `ProfileLanguage` | Türkçe, English; yakında diller yok. |
| `m-profil-iletisim` | Bildirimler | `ProfileCommunicationPreferences` | — |
| `m-profil-guvenlik` | Hesap güvenliği | `ProfileAccountSecurity` | Şifre satırı ve açık oturumlar; kodla giriş anahtarı ve Apple/Google bağlama yok. |
| `m-profil-kapat` | Hesabımı kapat | `ProfileAccountClosure` | Neden seçimi isteğe bağlı. |
| `m-hakkinda` | Hakkında | `ProfileAbout` | 72 px kutu, sürüm, Kullanım koşulları, Gizlilik politikası, KVKK aydınlatma metni, Açık kaynak lisansları, telif satırı. |
| `m-hakkinda-lisanslar` | Açık kaynak lisansları | `ProfileLicenses` | Paket adı, sürüm, lisans. |
| `m-geri-bildirim` | Geri bildirimlerim | `FeedbackMy` | Yalnız içerik tepkileri ve SinoAI işaretleri; SinoAI “hatalı” işareti Hata bildirimi. Yıldız kartı ve soru hata bildirimi yok. |

### Bildirimler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `m-bildirimler` | Bildirimler | `NotificationInbox` | Son iki gün başlıksız, sonra BU HAFTA ve DAHA ÖNCE; haftalık özet nötr grafik simgesi. |
| `m-bildirimler-bos` | Bildirim yok | `NotificationInbox` | Yeşil zil kutusu, neyin burada görüneceği ve Bildirim ayarları. |
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
| `m-destek` | Destek | `Support · SupportHub` | Karşılama kartı düz marka tonu (action), gradyan yok; yanıt süresi vaat edilmez. |
| `m-destek-talepler` | Taleplerim | `SupportTickets` | Açılan taleplerin durumu (Yanıtlandı, İnceleniyor, Kapandı) ve Yeni talep. |
| `m-destek-yeni` | Yeni talep | `SupportNew` | API’nin altı konusu (Öneri yok); ekran görüntüleri 72 pt küçük kutu + kaldır, en çok 3; e-posta alanı yok. |
| `m-destek-talep` | Talep detayı | `SupportTicketDetail` | Başlık sağında Çözüldü metin düğmesi; talep no kimliğin ilk 8 hanesi. |

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
| `w-giris` | Giriş yap | `/student/login` | Solda form (Google ve Apple üstte, kodla giriş), sağda tanıtım paneli. Ticari ileti kutusu yok; altta yasal satır. |
| `w-giris-kod` | Giriş kodu | `/student/login` | — |
| `w-kayit` | Kayıt ol | `/student/register` | Kayıtta paket yok: önce plan, sonra paket. Şifre en az 6 karakter; Koşullar + KVKK kutusunun altında işaretsiz ticari ileti (İYS) kutusu; altta yasal satır. |
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
| `w-onb-6-paket` | Web onboarding 6 · Paketini seç | `/student/baslangic` | Web’de deneme süresi yok: paket seçilir, kartla ödenir. “Şimdilik paket seçme” yok: paketsiz panel açılmaz. |

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
| `w-panel-profil` | Profil | `/student/profil` | Sağ sütunda Hedefim özeti ve Hesabımı kapat (İncele). |
| `w-panel-abonelik` | Profil · abonelik | `/student/profil` | Erişimin kartı (açık modüller, tarih, yapay zekâ kullanımı yüzdesi); altta paket seçimi, Paketi değiştir oraya kaydırır. |
| `w-panel-ayarlar` | Profil · bildirimler | `/student/profil` | Çalışma · Denemeler · Pazarlama. |
| `w-panel-gorunum` | Profil · görünüm | `/student/profil` | Ayrı sekme; yalnız tema. |

### Web · Destek

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `w-panel-destek` | Destek | `/student/destek` | — |
| `w-panel-destek-yeni` | Yeni talep | `/student/destek` | Sayfa içi form: API’nin altı konusu, Başlık, Açıklama, en çok 3 ekran görüntüsü (72 pt, kaldır düğmesi), Gönder / Vazgeç. Giriş yapmış öğrencide e-posta alanı yok. |
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

## iPhone Duo (dış ve iç ekran)


### Duo dış · Modüller

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-hub-moduller` | Modüller (ana ekran) | `ModuleHubHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ana ekran (5 Kas 2026 revizyonu; 17 Kas sahip kararları): önce “bugün ne yapacağım”. Selamın üstünde tarih yok; hedef selamın karşısında, seri hedefin altında. Hafta şeridi (bugünün halkası); günün planı ve sıradaki görev tek düğmeyle; iki eylem kartı (kaldığın yer, sıradaki deneme); modüller üç sütun. Veri: engagement/today, study-plan calendar, works continue, yaklaşan deneme. |
| `f-dis-hub-moduller-kaydir` | Modüller · aşağı kaydırılmış | `ModuleHubHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Modüller ızgarası, SinoAI, Bugün tekrar (Dersler adımları + Bilgi Kartları) ve Destek. |
| `f-dis-hub-ipucu` | İlk açılış ipucu | `ModuleHubHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İlk açılışta tek ipucu, günün planı kartında. Tur yok. |
| `f-dis-hub-plansiz` | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Plan kartı kayıttaki cevapları gösterir ve tek düğmeyle planı hazırlar; ilk konu plansız da başlar. |
| `f-dis-hub-gun-bitti` | Ana ekran · günün planı bitti | `ModuleHubHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bitti kartı: görev, dakika, seri; Yarına bak ve isteğe bağlı fazladan 10 soru. |
| `f-dis-hub-abonelik-bitti` | Ana ekran · deneme süresi bitti | `ModuleHubHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ödeme yoksa erişim yok: ilerleme korunur, modüller kilitli; Paketleri gör ve mağaza alımını geri yükle. |

### Duo dış · Giriş ve kayıt

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-giris-karsilama` | Karşılama | `—` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Oturumu kapatmış öğrencinin karşılaması: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var. Uygulamanın ilk açılışı m-onb-0-karsilama’dır. |
| `f-dis-giris-oturum-ac` | Oturum aç veya kaydol | `AuthLogin` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. E-posta ve şifreyle açılır; “E-postama kod gönder” ikincil. Apple ve Google üstte. |
| `f-dis-giris-kod` | Doğrulama kodu | `AuthLogin` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. 6 kutulu kod, yeniden gönderme süresi, şifreyle giriş seçeneği. |
| `f-dis-kayit-eposta` | Hesap oluştur | `AuthRegister` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Apple ve Google önde; e-postayla devam edene kod gider. |
| `f-dis-sifre-unuttum` | Şifremi unuttum | `AuthForgotPassword` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-sifre-yeni` | Kod ve yeni şifre | `AuthForgotPassword` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-giris-sayfa` | Misafir · hesap gerekli | `AuthEntrySheet` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Misafir hesap isteyen bir şeye dokununca alt sayfa açılır; her bağlamda aynı: marka tonunda kişi simgesi, modül simgesi yok. |

### Duo dış · Onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-onb-0-karsilama` | Onboarding 0 · Karşılama | `Onboarding · OnboardingWelcomeStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Uygulamanın ilk ekranı: tek cümle, iki örnek kart (kaldığın yer, deneme), Başlayalım ve Hesabım var. |
| `f-dis-onb-0-bolge` | Onboarding 0 · Bölge | `Onboarding · OnboardingRegionStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yalnız cihaz bölgesi belirsizse: Türkiye (YKS, KPSS) ya da United States (SAT, ACT). |
| `f-dis-onb-1-sinav` | Onboarding 1 · Sınav ve oturum | `Onboarding · OnboardingCategoryExamStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir. |
| `f-dis-onb-2-net` | Onboarding 2 · Mevcut ve hedef net | `Onboarding · OnboardingStudyNetStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”. |
| `f-dis-onb-3-tempo` | Onboarding 3 · Tempo ve günler | `Onboarding · OnboardingStudyTempoStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz). |
| `f-dis-onb-4-dersler` | Onboarding 4 · Zorlandığın dersler | `Onboarding · OnboardingStudyWeakStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İsteğe bağlı; planda bu derslere daha çok yer ayrılır. |
| `f-dis-onb-5-plan` | Onboarding 5 · Planın hazır | `Onboarding · plan özeti (OnboardingStudyWeakStep sonrası)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ayrı adım, ödemeden önce (mobil 5/5). Hafta modül renkleriyle; ilk görev kartında ok yok, ödeme öncesi görev açılmaz. |
| `f-dis-onb-7-deneme` | 3 gün ücretsiz | `Onboarding · OnboardingTrialStep` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bugün, hatırlatma günü ve ücret günü açıkça. Ödemeden sonra ana ekran açılır; ilk konu kendiliğinden açılmaz. Hesap adımı yok: mağaza satın alması hesapsız. |
| `f-dis-onb-8-bildirim` | Bildirim izni · ilk çalışmadan sonra | `—` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İzin, ilk çalışma bitince ve hatırlatmanın değeri belliyken istenir; sistem penceresinden önce kendi açıklamamız. |

### Duo dış · Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-deneme-vitrin` | Denemeler | `ExamDashboard` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Aylık deneme setinden şerit (yaklaşan: tarih, kalan süre, Hatırlat; açık: Canlı, kapanış, Başla), devam eden deneme (1 saat 14 dk kaldı), Bu ay sırada. |
| `f-dis-deneme-katalog` | Tüm denemeler | `ExamDashboard (tüm denemeler)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-deneme-detay` | Deneme detayı | `ExamStudentPublicDetail` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yaklaşan: Açılış Cumartesi 10:00 · kalan süre, Hatırlat (tek dokunuş; yeniden dokunmak kapatır). |
| `f-dis-deneme-detay-acik` | Deneme detayı · açık | `ExamStudentPublicDetail` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Açık · kapanmasına kalan süre ve Başla. |
| `f-dis-deneme-detay-kapali` | Deneme detayı · süre dışında | `ExamStudentPublicDetail` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Pencere dışında Başla pasif, nedeni üstünde. |
| `f-dis-deneme-detay-bitti` | Biten denemenin detayı | `ExamStudentPublicDetail` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Canlı hata #3: biten denemede “Denemeye gir” ve hatırlatma yok; önce sonuç, sonra Sonuç belgesi, Çözümler, Analiz ve net kaybettiren konular. |
| `f-dis-deneme-baslangic` | Başlamadan önce | `ExamStudentStarting` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-deneme-coz` | Deneme çözme | `ExamStudentSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Cevap teslime kadar değişir ve boşaltılır; çıkış her zaman ara ver penceresi, iptal yolu yok. Doğru ve yanlış teslimden sonra açılır. |
| `f-dis-deneme-teslim` | Teslim onayı | `ExamStudentSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Gri sistem penceresi yerine uygulamanın alt sayfası: cevaplı, boş, işaretli sayıları ve boş soruların numaraları; Boşlara dön / Teslim et. |
| `f-dis-deneme-baglanti` | Deneme · bağlantı koptu | `ExamStudentSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ortak “gönderilecek” görünümü: seçilen şık kilitli, altında nötr satır; süre işler, bağlanınca kendiliğinden gönderilir. |
| `f-dis-deneme-denemelerim` | Denemelerim | `MyExams · ExamMyExams` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede. |
| `f-dis-deneme-ay` | Geçmiş ay | `ExamMonth` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Geçmiş bir ayın deneme haritası: girilenlerin neti, sonuç ve çözüm; kaçırılan yazılı. |
| `f-dis-deneme-sonuclar` | Sonuçlar | `ExamResultsHub · ExamResultsList` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Net gelişimi sütunlarla (değer sütunun üstünde, dışarıda çözülen çizgili), üç giriş: Sınavika denemelerim, Analizlerim, Deneme ekle; son sonuçlar. |
| `f-dis-deneme-sonuclar-disarida` | Sonuçlar · dışarıda çözülen | `ExamResultsHub` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Çizgili sütuna dokununca: ne olduğu ve Sil (onaylı). |
| `f-dis-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `ExamResultsHub · ExamResultsList` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İlk denemeden önce: ne birikeceği, sıradaki deneme ve Deneme ekle. |
| `f-dis-deneme-ekle` | Deneme ekle | `ExamExternalResult` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Dışarıda çözülen denemenin sonucu (yayın, ad, tarih, ders ders doğru/yanlış, net canlı hesaplanır). API: student/external-exams. |
| `f-dis-deneme-sonuc` | Sonuç | `ExamResultDocument · ExamResults` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-deneme-analiz` | Eksik konu analizi | `ExamStatsLessonOverview · ExamStatistics` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Analiz eylemle biter: konu anlatımı, konunun testinin gerçek soru sayısı (test yoksa pasif), plana ekle. |
| `f-dis-deneme-analiz-eklendi` | Eksik konu analizi · plana eklendi | `ExamStatsLessonOverview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Düğme modül yumuşak tonunda Planına eklendi; kısa bildirim. |
| `f-dis-deneme-gelisim` | Ders gelişimi | `ExamStatsLessonTrend` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-deneme-net` | Deneme neti | `ExamStatsExamNet` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Toplam net, ders ders D/Y/B ve net kaybettiren konular (Konuyu çalış, Test). |
| `f-dis-deneme-cozumler` | Çözümler | `ExamSolutionExamCards` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-deneme-cozum` | Soru çözümü | `ExamSolutionBookletReview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Tümü / Yanlışlar · N / Boşlar · N sorunun üstünde, Yanlışlar ile açılır; koyu SinoAI’ye sor, altında Derse git. |

### Duo dış · Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-ders-vitrin` | Dersler | `WorkHome · WorkOverview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kaydırılan slaytlar (Kaldığın yerden, Tekrar, Ders çalış), modülün haftası (istatistik kartı) ve sınavın dersleri yüzde ilerlemeyle (GET lessons). |
| `f-dis-ders-ilk` | Dersler · ilk giriş | `WorkHome · WorkOverview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kaldığın yer henüz yok: kayıtta zorlandığın dersten ilk konu ve Dersler’in nasıl işlediği üç satırda. |
| `f-dis-ders-konular` | Konular | `WorkLesson · WorkCatalog` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ders hapları, Tümü / Süren / Biten süzgeci; konular müfredat sırasıyla: adım sayısı, süre, yüzde ilerleme ve ilk denemede doğru. Konuya basınca oynatıcı kaldığın yerden açılır. |
| `f-dis-ders-tekrar` | Tekrar | `WorkReviewHome · WorkReview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede. |
| `f-dis-ders-tekrar-bos` | Tekrar · bugün yok | `WorkReviewHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Sıradaki tekrarın günü ve adım sayısı; kaldığın derse dönüş. |
| `f-dis-ders-tekrar-oturum` | Tekrar oturumu | `WorkReviewSession` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Tekrarda bir adım: tekrar sırası, kaynağı, tek deneme; doğruysa bir sonraki aralık yazılır. |
| `f-dis-ders-tanim` | Adım · Tanım | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle. |
| `f-dis-ders-baglanti` | Oynatıcı · bağlantı yok | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ortak “gönderilecek” görünümü (Dersler, Testler, Denemeler aynı): adım seçimle kilitli, doğru/yanlış yok; altında nötr satır “Bağlantı yok; cevabın kaydedildi. Bağlanınca gönderilecek.”; Devam açık. Tek merkezi kuyruk. |
| `f-dis-ders-ornek` | Adım · Örnek | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Example: örnek cümle, açıklama ve dikkat notu. |
| `f-dis-ders-kural` | Adım · Kural | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Rule: numaralı kural listesi. |
| `f-dis-ders-gorsel` | Adım · Görsel | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Visual: merkezi figür (burada karşılaştırma tablosu) ve kısa açıklama. |
| `f-dis-ders-tahmin` | Adım · Önce sen tahmin et | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Choice: seçimden sonra açıklama ve Gerçek/Mecaz karşılaştırması. |
| `f-dis-ders-dogru-yanlis` | Adım · Doğru mu, yanlış mı? | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. TrueFalse: sık yapılan hata yargı olarak sorulur; doğrusu ve nedeni. |
| `f-dis-ders-grupla` | Adım · Grupla | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Gruplar alt alta, kutudaki metin tam (kesilmez), hedef sözcük koyu; kalan kart sayısı Kontrol et’in üstünde. |
| `f-dis-ders-eslestir` | Adım · Eşleştir | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Eşleşen ikili aynı numarayı alır; Kontrol et sabit altta, kaydırmadan görünür. |
| `f-dis-ders-cevir` | Adım · Çevir | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Arka yüzde içeriğin açıklaması da görünür; Biliyordum / Bilmiyordum kartın içinde. |
| `f-dis-ders-sec` | Adım · Seç (sözcüğe dokun) | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Cümlenin sözcükleri dokunulabilir; seçilen sayısı yazılı. |
| `f-dis-ders-coklu` | Adım · Çoklu seçim | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Sonuçta yanlış seçilen ve kaçırılan ayrı işaretli. |
| `f-dis-ders-sirala` | Adım · Sırala | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Order: basılı tutup sürükle ya da sırayla dokun; Baştan diz. |
| `f-dis-ders-bosluk` | Adım · Boşluk doldur | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer. |
| `f-dis-ders-yazmali` | Adım · Yazmalı boşluk | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Satırdaki boşluk giriş alanının kendisi; klavye açıkken Kontrol et klavyenin üstünde. |
| `f-dis-ders-formul` | Adım · Formül ve tablo | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kesir üst üste, eksi kesrin önünde; kök çizgisi içini örter; üs harfe yakın; tablo hücresi en az 15 pt. |
| `f-dis-ders-soru` | Adım · Sınav tarzı soru | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Question: her yanlışta bir çözüm adımı açılır, öğrenci yeniden seçer; kalan deneme yazılı. SinoAI’ye sor. |
| `f-dis-ders-sekilli-soru` | Adım · Şekilli soru | `WorkMikro` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Question ve soru şekli (figure): şekil kökle birlikte, şıklardan önce. |
| `f-dis-ders-konu-sonu` | Konu sonu | `WorkSubSummary` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İlk denemede doğru sayısı ve Paylaş; özet, dikkat notları, kamp görevi; Testler’in Kolay seviyesine geçiş (Testler renginde); Konuyu baştan oku, Konulara dön; içerik anketi (Beğendim / Beğenmedim). |
| `f-dis-ders-hak` | Günlük konu hakkı | `WorkSub (PAYWALL)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Abonelik yokken ya da günün konu hakkı bitince alt sayfa; metin konu adı içermez; arkada düz zemin (oynatıcı açılamadı, giriş ekranı yok). Ödeme marka yüzeyi olduğu için düğmesi turuncu. |

### Duo dış · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-test-vitrin` | Testler | `QuizHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kaydırılan slaytlar (Senin için hazır, kaldığın yer, konular) ve noktalar; modül istatistik kartı; dersler çubuklu listede. |
| `f-dis-test-konular` | Konular | `QuizCatalog` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bütün derslerin açılır ağacı; açık derste konular ve üç seviye. |
| `f-dis-test-detay` | Test seviyeleri | `QuizLessonSub · QuizOverview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ders çipleri, konu, bu dersteki hafta kartı; Kolay, Orta, Zor · 20’şer soru; satırda Tekrar / Devam et / Başla ya da kilit. |
| `f-dis-test-coz` | Doğru cevap | `QuizSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Anında geri bildirim (tek dokunuş): doğru şık, kısa çözüm; soru meta satırında İşaretle. |
| `f-dis-test-coz-yanlis` | Yanlış cevap | `QuizSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Doğru şık ve nedeni; konunun anlatımına (Dersler renginde) ya da SinoAI’ye geçiş. |
| `f-dis-test-baglanti` | Bağlantı yok | `QuizSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Cevap merkezi kuyrukta; seçili şık kalır, doğru/yanlış gönderilince görünür; ortak not ve Devam. |
| `f-dis-test-bitir-bekliyor` | Testi bitir · bekleyen cevap | `QuizSolve` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bekleyen cevap varken test bitmez; alt sayfada uyarı ve Tamam. |
| `f-dis-test-yanlislar` | Yanlışlarım | `QuizReview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İlk yanlıştan açılır; Yanlış / Boş / Tümü (boş süzgeç soluk, dokunulmaz); numara satırı yalnız süzgeçtekiler; İşaretli düğmesi; Bu soruyu paylaş, SinoAI’ye sor; konuyu çalış (Dersler renginde) ve Sonraki yanlış. |
| `f-dis-test-yanlislar-son` | Yanlışlarım · son yanlış | `QuizReview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Süzgeçteki son soruda ana düğme Bitti; Çözümler’e döner. |
| `f-dis-test-yanlislar-dogru` | Yanlışlarım · yanlış yok | `QuizReview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yanlış yoksa ilk boştan, o da yoksa Tümü süzgeciyle 1. sorudan açılır; boş süzgeçler soluk. |
| `f-dis-test-bitti` | Test bitti | `QuizComplete` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-test-cozumler` | Çözümler | `QuizSolutions · QuizReview` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Tümü · Yanlışlar · N · İşaretli; tekrar testi satırı “Konu · Tekrar”; hazırsa tekrar testi kartı. |
| `f-dis-test-cozumler-isaretli` | Çözümler · İşaretli | `QuizSolutions` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İşaretli soru Yanlışlarım’da Tümü süzgeciyle açılır; bitmemiş testin sorusu kilitli: Test bitince açılır. |
| `f-dis-test-cozumler-bos` | Çözümler · henüz test yok | `QuizSolutions` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Senin için hazır testle başla. |

### Duo dış · Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-plan-bugun` | Bugün | `StudyPlanHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Örnek takvim yapısı: Gün/Hafta/Ay, modül süzgeçleri, hafta halkaları, günün yüzdesi ve süre; her görev kaynağını (sınav · ders · neden), konusunu, modül rozetini ve miktarını (soru, dakika, kart) ya da saatini söyler. + kendi görevin. |
| `f-dis-plan-yok` | Planı olmayan öğrenci | `StudyPlanHome (StudyPlanNoPlanEmpty)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Planın ne yaptığı, kayıt cevaplarından örnek bir gün; Planımı hazırla ya da kendim kurayım. |
| `f-dis-plan-dunden` | Dünden kalan görevler | `StudyPlanHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Biten olmayan görev sessizce kaybolmaz: Bugüne ekle ya da haftaya yay (PATCH schedule). |
| `f-dis-plan-gorev-ekle` | Görev ekle | `StudyPlanManualTaskSheet` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kendi görevin: tür, ders ve konu, not, gün ve saat, süre (POST study-plan tasks). |
| `f-dis-plan-gorev-islem` | Görev işlemleri | `StudyPlanTaskActionSheet` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ana düğme görevin modülüne göre (Konuya başla, Testi başlat, Denemeye geç, Kartlara başla); odak sayacıyla başla (25 + 5 dk), yarına taşı, saati değiştir, yaptım, bugünden kaldır. |
| `f-dis-plan-gorev-islem-kendi` | Görev işlemleri · kendi görevin | `StudyPlanTaskActionSheet` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İçeriği olmayan görevde ana düğme Odak sayacıyla başla (25 dk + 5 dk mola); Yarına taşı, Saati değiştir, Yaptım, Bugünden kaldır. |
| `f-dis-plan-odak` | Odak sayacı | `StudyPlanFocus` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-plan-ilerleme` | İlerleme | `StudyPlanProgressHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-plan-konu` | Konu ilerlemesi | `StudyPlanLessonProgress` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-plan-program` | Program | `StudyPlanSchedule · StudyPlanPlan` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Başlıkta Düzenle (Planım) ve Haftanı paylaş. |
| `f-dis-plan-ayarlar` | Plan ayarları | `StudyPlanCreate` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |

### Duo dış · Akıllı Özet

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-ozet-vitrin` | Akıllı Özet | `LensHome · LensAnalyses` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Geçmişte konu başlığı; başlıkta Kullanım %N (SinoAI ile ortak hak, aylık sayı yok); Tümü yok. |
| `f-dis-ozet-yukle` | Soru yükle | `LensNew · LensUpload` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Fotoğraf ya da galeri (PDF yok); Neler alacaksın? bilgi satırları. |
| `f-dis-ozet-kamera` | Kamera | `LensCamera` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Mod çipi yok; tek soru çekilir. |
| `f-dis-ozet-isleniyor` | Analiz ediliyor | `LensSessionProgress` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. İptal yok; kapatmak analizi durdurmaz. |
| `f-dis-ozet-sonuc` | Çözüm | `LensSessionDetail` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kart yapma yok; Konuyu çalış (Dersler · konu); Benzer 5 soru konunun testini açar; en altta Sorunun fotoğrafı. |
| `f-dis-ozet-hak` | Aylık hak doldu | `LensHome` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kullanım %100; yenilenme tarihi, geçmiş analizler açık; SinoAI’ye yönlendirme yok. |
| `f-dis-ozet-okunamadi` | Fotoğraf okunamadı | `LensUpload` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Neden ve üç çekim ipucu; hak düşmedi. |
| `f-dis-ozet-pdf` | Analiz PDF | `LensSessionPdf` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. PDF önizlemesi, sayfa sayısı; Paylaş ve PDF aç. |
| `f-dis-ozet-video` | Video analizi | `LensVideo` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |

### Duo dış · Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-kart-vitrin` | Bilgi Kartları | `FlashcardMain` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Sekmeler Kartlar · Bugün · Kaydedilenler. Dersler sınav başına bölümlü (başlık sınav adı, sağda N ders). |
| `f-dis-kart-vitrin-ilk` | Bilgi Kartları · ilk kullanım | `FlashcardMain` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. N yeni kart seni bekliyor · Yeni kartlara başla; ders satırlarında Yeni. |
| `f-dis-kart-desteler` | Ders · desteler | `FlashcardLesson` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ders özeti (N deste · %X öğrenildi + halka); deste satırı: konu, x/y kart · %z, N zayıf. |
| `f-dis-kart-bugun` | Bugün | `FlashcardToday` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-kart-bugun-bos` | Bugün · tekrar yok | `FlashcardToday` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bugün tekrar edilecek kart yok · Derslere git. |
| `f-dis-kart-bitti` | Bugün · kartlar bitti | `FlashcardToday` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bugün modunda oturum sonu: kaç kart, kaçını bildin, yarın kaç kart; kart serisi. |
| `f-dis-kart-deste-bitti` | Deste bitti | `FlashcardSession` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Deste ve kaydedilenler oturumunun sonu; altında içerik anketi. |
| `f-dis-kart-on` | Kart oturumu · ön yüz | `FlashcardSession` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-kart-arka` | Kart oturumu · cevap | `FlashcardSession` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-kart-kaydedilen` | Kaydedilenler | `FlashcardSavedTab` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kaydettiğin N kart (yer imi); ders çipiyle süzülünce Kaydedilenleri tekrar et o dersle açılır. |

### Duo dış · SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-sino-ana` | SinoAI | `SinoAi` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-sino-sohbet` | SinoAI · sohbet | `SinoAiChat` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yanıt eylemleri: yeniden üret, kopyala, paylaş, beğen, beğenme. |
| `f-dis-sino-calisma` | SinoAI · çalışma | `SinoAiChat (Çalışma)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı. |
| `f-dis-sino-sonuc` | SinoAI · üretim sonucu | `SinoAiChat (Çalışma sonucu)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir. |
| `f-dis-sino-kutuphane` | SinoAI · kütüphane | `SinoAiLibrary` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Tümü · Test · Deste · Özet sayılarla; satır N soru · ders · tarih; plan satırı yalnız Tümü’de. |
| `f-dis-sino-kaynaklar` | SinoAI · kaynaklarım | `SinoAiSources` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kaynak ekle; okundu/okunuyor; 90 gün kuralı; çalışma notları. |
| `f-dis-sino-not` | SinoAI · çalışma notu | `SinoAiStudyNote` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Önemli noktalar ve terimler; Kart yap, Test üret; uyarı satırı. |
| `f-dis-sino-menu` | SinoAI · menü | `SinoAiChat (menü)` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Arama, yeni sohbet, kütüphane, Kaynaklarım, gün gün sohbetler; altta kullanım çubuğu ve SinoAI’den çık. |
| `f-dis-sino-hak` | SinoAI · aylık hak doldu | `SinoAi` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Hak aylık ve Akıllı Özet ile ortak: yenilenme tarihi, Kütüphaneme git, Bu arada kartı. |

### Duo dış · Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-profil` | Profil | `ProfileMain` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Üç ölçü kartı yok; Hesabım: Hedefim, Kişisel bilgiler, Aboneliğim, İstatistiklerim; Uygulama: Görünüm, Dil, Bildirimler. Ayrı Paketler, İletişim tercihleri, Puanla satırı yok. |
| `f-dis-profil-devam` | Profil · alt bölüm | `ProfileMain` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |

### Duo dış · İstatistikler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-istatistik` | İstatistiklerim | `ProfileStatistics` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bu hafta: süre, soru, seri; günlük çalışma modüllere göre yığılı; net gelişimi; derslere göre doğru oranı ve süre. |
| `f-dis-istatistik-ilk` | İstatistikler · ilk hafta | `ProfileStatistics` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Sıfır duvarı yerine ilk üç adım; veri geldikçe grafikler açılır. |
| `f-dis-istatistik-ders` | İstatistikler · tek ders | `ProfileStatisticsLesson` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Bir dersin süresi, sorusu, başarısı ve konu konu başarı. |

### Duo dış · Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-profil-bilgiler` | Kişisel bilgiler | `ProfileUserInfo / ProfileEdit` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Ad, soyad, e-posta, telefon; fotoğraf ve doğum yılı yok. |
| `f-dis-profil-hedef` | Hedefim | `ProfileAcademic` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Sınav ve puan türü; hedef net, bölüm, tempo yok. |
| `f-dis-profil-abonelik` | Aboneliğim | `ProfileMySubscriptions` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Kullanım tek satır yapay zekâ yüzdesi (Akıllı Özet + SinoAI ortak). |
| `f-dis-profil-abonelik-hediye` | Aboneliğim · hediye erişim | `ProfileMySubscriptions` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Admin hediyesi: … tarihine kadar açık; mağaza notu yok. |
| `f-dis-profil-paketler` | Paketler | `ProfileAvailablePackages` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-profil-gorunum` | Görünüm | `ProfileAppearance` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yalnız tema. |
| `f-dis-profil-dil` | Dil | `ProfileLanguage` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Türkçe, English; yakında diller yok. |
| `f-dis-profil-iletisim` | Bildirimler | `ProfileCommunicationPreferences` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-profil-guvenlik` | Hesap güvenliği | `ProfileAccountSecurity` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Şifre satırı ve açık oturumlar; kodla giriş anahtarı ve Apple/Google bağlama yok. |
| `f-dis-profil-kapat` | Hesabımı kapat | `ProfileAccountClosure` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Neden seçimi isteğe bağlı. |
| `f-dis-hakkinda` | Hakkında | `ProfileAbout` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. 72 px kutu, sürüm, Kullanım koşulları, Gizlilik politikası, KVKK aydınlatma metni, Açık kaynak lisansları, telif satırı. |
| `f-dis-hakkinda-lisanslar` | Açık kaynak lisansları | `ProfileLicenses` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Paket adı, sürüm, lisans. |
| `f-dis-geri-bildirim` | Geri bildirimlerim | `FeedbackMy` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yalnız içerik tepkileri ve SinoAI işaretleri; SinoAI “hatalı” işareti Hata bildirimi. Yıldız kartı ve soru hata bildirimi yok. |

### Duo dış · Bildirimler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-bildirimler` | Bildirimler | `NotificationInbox` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Son iki gün başlıksız, sonra BU HAFTA ve DAHA ÖNCE; haftalık özet nötr grafik simgesi. |
| `f-dis-bildirimler-bos` | Bildirim yok | `NotificationInbox` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yeşil zil kutusu, neyin burada görüneceği ve Bildirim ayarları. |
| `f-dis-bildirim-ayarlar` | Bildirim ayarları | `ProfileNotificationSettings` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Yeni: türlere göre aç/kapa. Günde en çok 2 hatırlatma, 22:00–08:00 sessiz; canlı etkinlikler ayrı; bağlı saat. |

### Duo dış · Destek

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-destek` | Destek | `Support · SupportHub` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Karşılama kartı düz marka tonu (action), gradyan yok; yanıt süresi vaat edilmez. |
| `f-dis-destek-talepler` | Taleplerim | `SupportTickets` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Açılan taleplerin durumu (Yanıtlandı, İnceleniyor, Kapandı) ve Yeni talep. |
| `f-dis-destek-yeni` | Yeni talep | `SupportNew` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. API’nin altı konusu (Öneri yok); ekran görüntüleri 72 pt küçük kutu + kaldır, en çok 3; e-posta alanı yok. |
| `f-dis-destek-talep` | Talep detayı | `SupportTicketDetail` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Başlık sağında Çözüldü metin düğmesi; talep no kimliğin ilk 8 hanesi. |

### Duo dış · Durumlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-dis-durum-bos` | Boş durum | `—` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-durum-hata` | Yükleniyor, hata, çevrimdışı | `—` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. |
| `f-dis-durum-guncelleme` | Zorunlu güncelleme | `ForceUpdateGate` | Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. Desteklenmeyen sürüm: yüklü ve gerekli sürüm, tek düğme; ilerleme hesapta. API: app/version, mobil ForceUpdateGate. |

### Duo iç · Giriş ve kayıt

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-giris-karsilama` | Karşılama | `—` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Oturumu kapatmış öğrencinin karşılaması: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var. Uygulamanın ilk açılışı m-onb-0-karsilama’dır. |
| `f-ic-giris-oturum-ac` | Oturum aç veya kaydol | `AuthLogin` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. E-posta ve şifreyle açılır; “E-postama kod gönder” ikincil. Apple ve Google üstte. |
| `f-ic-giris-kod` | Doğrulama kodu | `AuthLogin` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. 6 kutulu kod, yeniden gönderme süresi, şifreyle giriş seçeneği. |
| `f-ic-kayit-eposta` | Hesap oluştur | `AuthRegister` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Apple ve Google önde; e-postayla devam edene kod gider. |
| `f-ic-sifre-unuttum` | Şifremi unuttum | `AuthForgotPassword` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. |
| `f-ic-sifre-yeni` | Kod ve yeni şifre | `AuthForgotPassword` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. |
| `f-ic-giris-sayfa` | Misafir · hesap gerekli | `AuthEntrySheet` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Misafir hesap isteyen bir şeye dokununca alt sayfa açılır; her bağlamda aynı: marka tonunda kişi simgesi, modül simgesi yok. |

### Duo iç · Onboarding

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-onb-0-karsilama` | Onboarding 0 · Karşılama | `Onboarding · OnboardingWelcomeStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Uygulamanın ilk ekranı: tek cümle, iki örnek kart (kaldığın yer, deneme), Başlayalım ve Hesabım var. |
| `f-ic-onb-0-bolge` | Onboarding 0 · Bölge | `Onboarding · OnboardingRegionStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Yalnız cihaz bölgesi belirsizse: Türkiye (YKS, KPSS) ya da United States (SAT, ACT). |
| `f-ic-onb-1-sinav` | Onboarding 1 · Sınav ve oturum | `Onboarding · OnboardingCategoryExamStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir. |
| `f-ic-onb-2-net` | Onboarding 2 · Mevcut ve hedef net | `Onboarding · OnboardingStudyNetStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”. |
| `f-ic-onb-3-tempo` | Onboarding 3 · Tempo ve günler | `Onboarding · OnboardingStudyTempoStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz). |
| `f-ic-onb-4-dersler` | Onboarding 4 · Zorlandığın dersler | `Onboarding · OnboardingStudyWeakStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. İsteğe bağlı; planda bu derslere daha çok yer ayrılır. |
| `f-ic-onb-5-plan` | Onboarding 5 · Planın hazır | `Onboarding · plan özeti (OnboardingStudyWeakStep sonrası)` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Ayrı adım, ödemeden önce (mobil 5/5). Hafta modül renkleriyle; ilk görev kartında ok yok, ödeme öncesi görev açılmaz. |
| `f-ic-onb-7-deneme` | 3 gün ücretsiz | `Onboarding · OnboardingTrialStep` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. Bugün, hatırlatma günü ve ücret günü açıkça. Ödemeden sonra ana ekran açılır; ilk konu kendiliğinden açılmaz. Hesap adımı yok: mağaza satın alması hesapsız. |
| `f-ic-onb-8-bildirim` | Bildirim izni · ilk çalışmadan sonra | `—` | İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun. İzin, ilk çalışma bitince ve hatırlatmanın değeri belliyken istenir; sistem penceresinden önce kendi açıklamamız. |

### Duo iç · Ana sayfa

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-panel-anasayfa` | Ana sayfa | `/student/dashboard` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Mobil ile aynı Bugün düzeni: selam ve altında hedef (tarih yok); sağda seri ve Paylaş. Her satır aynı iki sütun (1,3 / 1), satırdaki kartlar eş boy: günün planı + hafta; Kaldığın yerden ve Sıradaki deneme sol sütunda, Bugün tekrar sağda; Bu hafta + Modüller. |
| `f-ic-panel-tur` | İlk giriş ipucu | `/student/dashboard` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. İlk girişte tek ipucu, günün adımının üstünde. |
| `f-ic-panel-anasayfa-plansiz` | Ana sayfa · planı olmayan öğrenci | `/student/dashboard` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Plan kartı kayıt cevaplarını gösterir, Planımı hazırla; ilk konu plansız başlar. |
| `f-ic-panel-anasayfa-gun-bitti` | Ana sayfa · günün planı bitti | `/student/dashboard` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-panel-anasayfa-abonelik-bitti` | Ana sayfa · deneme süresi bitti | `/student/dashboard` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ödeme yoksa erişim yok; ilerleme korunur. |
| `f-ic-panel-moduller` | Tüm modüller | `/student/moduller (yeni sayfa: web uygulamasında yok)` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Bildirimler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-panel-bildirimler` | Bildirimler | `/student/bildirimler` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Profil ve hesap

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-panel-profil` | Profil | `/student/profil` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Sağ sütunda Hedefim özeti ve Hesabımı kapat (İncele). |
| `f-ic-panel-abonelik` | Profil · abonelik | `/student/profil` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Erişimin kartı (açık modüller, tarih, yapay zekâ kullanımı yüzdesi); altta paket seçimi, Paketi değiştir oraya kaydırır. |
| `f-ic-panel-ayarlar` | Profil · bildirimler | `/student/profil` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Çalışma · Denemeler · Pazarlama. |
| `f-ic-panel-gorunum` | Profil · görünüm | `/student/profil` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ayrı sekme; yalnız tema. |

### Duo iç · Destek

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-panel-destek` | Destek | `/student/destek` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-panel-destek-yeni` | Yeni talep | `/student/destek` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Sayfa içi form: API’nin altı konusu, Başlık, Açıklama, en çok 3 ekran görüntüsü (72 pt, kaldır düğmesi), Gönder / Vazgeç. Giriş yapmış öğrencide e-posta alanı yok. |
| `f-ic-panel-destek-talep` | Destek talebi | `/student/destek/[id]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Ödeme

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-panel-odeme` | Ödeme | `/student/odeme` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-panel-odeme-basarili` | Ödeme başarılı | `/student/odeme/basarili` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-panel-odeme-basarisiz` | Ödeme başarısız | `/student/odeme/basarisiz` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Denemeler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-deneme-vitrin` | Denemeler | `/student/sinavlarim` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-deneme-denemelerim` | Denemelerim ve takvim | `/student/denemelerim` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Denemelerin ve sınav takvimi tek sekmede. |
| `f-ic-sinav-takvimi` | Sınav takvimi | `/student/sinav-takvimi` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Resmî sınavlara kalan gün ve bu ayın Sınavika denemeleri. |
| `f-ic-deneme-basla` | Başlamadan önce | `/student/sinav/[examId]/basla` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Mobildeki Başlamadan önce ile aynı kurallar ve geri sayım. |
| `f-ic-deneme-detay` | Deneme detayı | `/student/sinav/[examId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-deneme-detay-bitti` | Biten denemenin detayı | `/student/sinav/[examId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Önce sonuç, sonra belge, çözüm, analiz ve net kaybettiren konular. |
| `f-ic-deneme-coz` | Deneme çözme (odak) | `/student/sinav/coz/[examUserId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-deneme-teslim` | Teslim onayı | `/student/sinav/coz/[examUserId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Mobil ile aynı: cevaplı, boş, işaretli; boş numaralar; Enter / Esc. |
| `f-ic-deneme-sonuclar` | Sonuçlar | `/student/sinav-sonuclari` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Sütun etiketleri tarih, dışarıdaki Dışarıda; ÖSYM düzeninde tablo (ders netleri, toplam net, Puan), satır sonunda Analiz, dışarıdakinde Sil. |
| `f-ic-deneme-sonuclar-bos` | Sonuçlar · henüz deneme yok | `/student/sinav-sonuclari` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-deneme-ekle` | Deneme ekle | `/student/sinav-sonuclari` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. API: student/external-exams. |
| `f-ic-deneme-sonuc` | Sonuç ve analiz | `/student/sinav-sonuclari/[snapshotId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-deneme-cozumler` | Soru çözümleri | `/student/soru-cozumleri/[examAttemptId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Soru haritası ve çözüm. |
| `f-ic-deneme-cozum-liste` | Soru çözümleri listesi | `/student/soru-cozumleri` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · İstatistikler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-istatistik` | İstatistiklerim | `/student/raporlarim` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Satırlarda ders adı. Hesap sayfası (modül değil, mobildeki gibi). |

### Duo iç · Dersler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-ders-vitrin` | Dersler | `/student/ders-cal` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Kaldığın yerden, bugünkü tekrar ve sınavın dersleri; henüz içeriği olmayan ders “Yakında”. |
| `f-ic-ders-konular` | Konular | `/student/ders-cal/ders · /ders/[lessonMainId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ders hapları ve Tümü / Süren / Biten süzgeci; konular: adım, süre, yüzde ilerleme, ilk denemede doğru; yanda ders ilerlemesi. |
| `f-ic-ders-tekrar` | Tekrar | `/student/ders-cal/tekrar` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Günü gelen adımlar; 1, 3 ve 7 gün aralıkla. |
| `f-ic-ders-tekrar-oturum` | Tekrar oturumu | `/student/ders-cal/tekrar/oturum` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Mobilin tekrar adımı oynatıcıda. |
| `f-ic-ders-tanim` | Oynatıcı · Tanım | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ortada 700 px adım, üstte konu boyu ilerleme (Adım x / y), sağda Bu konuda ve SinoAI. Parça zaman çizelgesi yok. |
| `f-ic-ders-tahmin` | Oynatıcı · Önce sen tahmin et | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ders-bosluk` | Oynatıcı · Boşluk doldur | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Tek deneme; yanlışta doğru sözcük ve nedeni. |
| `f-ic-ders-dogru-yanlis` | Oynatıcı · Doğru mu, yanlış mı? | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ders-sirala` | Oynatıcı · Sırala | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ders-grupla` | Oynatıcı · Grupla | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Mobilin adım çizimi oynatıcının içinde (EmbedStep). |
| `f-ic-ders-eslestir` | Oynatıcı · Eşleştir | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ders-formul` | Oynatıcı · Formül ve tablo | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ders-soru` | Oynatıcı · Sınav tarzı soru | `/student/ders-cal/mikro/[workMikroId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Yanlış şıktan sonra çözüm adımı açılır, öğrenci yeniden seçer; 1–5 tuşları. |
| `f-ic-ders-konu-sonu` | Konu sonu | `/student/ders-cal/konu/[lessonSubId]/ozet` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. İlk denemede doğru ve Paylaş; özet, dikkat notları, kamp görevi, Testler’e geçiş; Konuyu baştan oku, Konulara dön; içerik anketi. |

### Duo iç · Testler

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-test-vitrin` | Testler | `/student/testler` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-test-konular` | Ders konuları | `/student/testler/[lessonMainId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ders çipleri yok; sağ üstte Tüm dersler Testler vitrinine döner. |
| `f-ic-test-konular-tum` | Konular | `/student/testler/konular` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Konu konu Kolay, Orta, Zor ilerlemesi. |
| `f-ic-test-cozumler` | Çözümler | `/student/testler/cozumler` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Mobildeki süzgeç ve tekrar testi kartı; satır sağında Yanlışlarım; tekrar testi satırı “Konu · Tekrar”. |
| `f-ic-test-cozumler-isaretli` | Çözümler · İşaretli | `/student/testler/cozumler` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Soruyu aç → Yanlışlarım, Tümü süzgeci; bitmemiş testin sorusu: Test bitince açılır. |
| `f-ic-test-coz` | Test çözme · doğru | `/student/testler/quiz/[quizId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-test-coz-yanlis` | Test çözme · yanlış | `/student/testler/quiz/[quizId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Doğru şık ve nedeni; konunun anlatımına ya da SinoAI’ye geçiş. |
| `f-ic-test-baglanti` | Test çözme · bağlantı yok | `/student/testler/quiz/[quizId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ortak çevrimdışı not; bekleyen cevap varken Testi bitir bitirmez, uyarı düğmenin yanında. |
| `f-ic-test-yanlislar` | Yanlışlarım | `/student/testler/cozumler/[attemptId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. İlk yanlıştan açılır; ızgara bütün soruları gösterir (doğrular yeşil), süzgeç Sonraki’nin gezdiği soruları seçer. |
| `f-ic-test-yanlislar-son` | Yanlışlarım · son yanlış | `/student/testler/cozumler/[attemptId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Süzgeçteki son soruda Bitti; Çözümler’e döner. |

### Duo iç · Ders Planı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-plan-bugun` | Bugün | `/student/ders-plani` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Kart gövdesi içeriği açar, sağ üstteki daire tamamlar, … Diğer işlemler. |
| `f-ic-plan-gorev-menu` | Bugün · Diğer işlemler | `/student/ders-plani` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Odak sayacıyla başla, Yarına taşı, Saati değiştir, Bugünden kaldır. |
| `f-ic-plan-yok` | Planı olmayan öğrenci | `/student/ders-plani` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Ortalı kutu (Planımı hazırla · 1 dk, Kendi planımı kuracağım), sağda örnek gün. |
| `f-ic-plan-dunden` | Dünden kalan görevler | `/student/ders-plani` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Dünden kalan kutusu sol kartın üstünde: Haftaya yay, Bugüne ekle. |
| `f-ic-plan-program` | Program | `/student/ders-plani/program` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-plan-oneriler` | Öneriler | `/student/ders-plani/oneriler` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-plan-istatistik` | İstatistik | `/student/ders-plani/istatistik` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-plan-ilerleme` | İlerleme | `/student/ders-plani/ilerleme` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-plan-ayarlar` | Ayarlar | `/student/ders-plani/ayarlar` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-plan-odak` | Odak (çalış) | `/student/ders-plani/calis/[taskId]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Akıllı Özet

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-ozet-vitrin` | Akıllı Özet | `/student/lens` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Geçmişte konu başlığı. |
| `f-ic-ozet-gecmis` | Geçmiş analizler | `/student/lens/gecmis` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ozet-yeni` | Yeni analiz | `/student/lens/yeni` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Çıktı seçimi yok; not alanı ve ipuçları; Analizi başlat. |
| `f-ic-ozet-detay` | Analiz detayı | `/student/lens/analiz/[id]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-ozet-video` | Video analizi | `/student/lens/video/[id]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Bilgi Kartları

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-kart-vitrin` | Bilgi Kartları | `/student/flashcard` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Yeni deste düğmesi yok (deste oluşturma yok). |
| `f-ic-kart-bugun` | Bugün | `/student/flashcard/bugun` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-kart-gozat` | Gözat | `/student/flashcard/browse` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Deste seçimi ızgaranın üstünde çip satırı; x/y kart · %z ve Bu desteyi çalış. |
| `f-ic-kart-oturum` | Kart oturumu (odak) | `/student/flashcard/session` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Boşluk: çevir · 1–3: puanla; ←/→ ile kart gezme yok. |
| `f-ic-kart-kaydedilen` | Kaydedilenler | `/student/flashcard/kaydedilenler` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · SinoAI

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-sino-sohbet` | SinoAI sohbet | `/student/sinoai` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Solda geçmiş, ortada tek sohbet sütunu. |
| `f-ic-sino-hak` | SinoAI · aylık hak doldu | `/student/sinoai` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. Hak doldu bloğu sohbet sütununda; yazma alanı kapalı. |
| `f-ic-sino-calisma` | SinoAI çalışma | `/student/sinoai/uret` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-sino-kutuphane` | SinoAI kütüphane | `/student/sinoai/kutuphane` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-sino-kaynaklar` | Kaynaklarım | `/student/sinoai/kaynaklarim` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |
| `f-ic-sino-not` | Çalışma notu | `/student/sinoai/kutuphane/not/[id]` | İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi. |

### Duo iç · Pozlar ve taslak kâğıdı

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-deneme-taslak` | Deneme çözme · taslak kâğıdı (açık) | `ExamStudentSolve` | İç ekran tam açık: soru solda, taslak kâğıdı sağda. Kalem yok: taslak parmakla çizilir, araç çubuğunda Kaydır / Çiz. Katlayınca aynı soru, süre ve taslak dış ekranda devam eder. |
| `f-ic-deneme-yari-acik` | Deneme çözme · yarı açık (kitap) | `ExamStudentSolve` | Yarı açık: katlanma bölgesi ekranın ortasında (40 pt). Soru katın solunda, taslak kâğıdı sağında; hiçbir düğme katın üstüne gelmez (Apple: ReservedRegion, split arrangement). |
| `f-ic-test-taslak` | Test çözme · taslak kâğıdı | `QuizSolve` | Testte de taslak yanda; geri bildirim soru sütununda. |
| `f-ic-ders-sinoai-yari-acik` | Ders adımı · SinoAI yanda (yarı açık) | `WorkMikro` | Adım katın solunda, SinoAI sağında. Katlayınca SinoAI dış ekranda alt sayfa olur. |

### Duo iç · Dik tutuş

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `f-ic-dikey-deneme` | Deneme çözme · iç ekran dik | `ExamStudentSolve` | İç ekran dik (669 × 951): Apple’ın tek istisnası, çubuklar yatay (üstte durum ve başlık). Şıklar üç sütun, taslak alt yarıda. |

## Web sitesi (giriş öncesi)


### Web sitesi · Ana sayfa

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-anasayfa` | Ana sayfa | `/` | Sitenin header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri. |
| `s-urunler-menu` | Ürünler menüsü | `header` | Ürünler açılınca 7 modül, sitenin sade gri tonlarında. |

### Web sitesi · Sınavlar

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
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
| `s-blog` | Blog | `/blog` | 12 yazı ve Daha fazla yazı (N); arama kutusu çiplerin sağında. |
| `s-blog-yazi` | Blog yazısı | `/blog/[slug]` | — |

### Web sitesi · Kurumsal

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `s-hakkimizda` | Hakkımızda | `/corporate/about` | Sayı satırı yok; başlık ve Ölç / Öğren / Geliş kartları. |
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

## PDF belgeleri (A4)


### İstatistik raporu (PDF)

| Kimlik | Ekran | Rota | Not |
|---|---|---|---|
| `r-istatistik-1` | Son 30 gün · sayfa 1 | `API StatisticsReportPdf (QuestPDF) · w-istatistik “PDF olarak al”` | Üst bant (logo, rapor adı, dönem ve tarih aralığı, öğrenci), dört ölçü, günlük çalışma modüllere göre yığılı ve günlük ortalama, modüllere dağılım halkası ve tablosu. |
| `r-istatistik-2` | Son 30 gün · sayfa 2 | `API StatisticsReportPdf (QuestPDF) · w-istatistik “PDF olarak al”` | Sürekli üst satır; derslere göre tablo (en çok 8 ders), altında TYT net gelişimi; en verimli saatler (son 30 gün, hücrede yüzde). |
| `r-istatistik-hafta` | Bu hafta · deneme yok · sayfa 1 | `API StatisticsReportPdf (QuestPDF) · w-istatistik “PDF olarak al”` | Deneme yokken dördüncü ölçü seri; yedi sütunun üstünde süre, altında gün adı ve tarihi. |

