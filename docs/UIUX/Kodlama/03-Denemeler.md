# Denemeler · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/` → `Screens/Mobile/Exam.tsx`, `Screens/Mobile/Insights.tsx`, `Screens/Mobile/Gaps.tsx` (`ExamMonthScreen`, `ExamNetScreen`, `StatisticsLessonScreen`), `Screens/Mobile/States.tsx` (`ExamResultsEmptyScreen`, `ExamOfflineScreen`), `Screens/Web/ExamWeb.tsx`, `Screens/Web/StudyWeb.tsx` (sonuçlar, istatistik, teslim, biten deneme, deneme ekle), `Screens/Web/GapsWeb.tsx` (takvim, başlamadan önce, çözüm listesi), `Screens/Tablet/Solve.tsx`, `Screens/Tablet/Wide.tsx`, `Screens/Tablet/Parity.tsx`, parçalar `Parts/Study.tsx`, `Parts/Mobile.tsx`, `Parts/Shared.tsx`, `Parts/Web.tsx`, `Parts/Tablet.tsx`.

Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

Kısaltmalar: `mod` = Denemeler modül renkleri (`useModuleColors('exam')`), `colors` = tema jetonları (`UI_COLORS`). Ölçüler pt (mobil) ve CSS px (web). Metinler `TR` / `EN` biçimindedir. Çizimdeki ad, sayı ve tarihler örnektir.

---

## 1. Modül özeti

**Ne işe yarar.** Denemeler gerçek sınavın provasıdır. Öğrenci Türkiye geneli (canlı) ve branş denemelerine girer, süreli ve odaklı çözer, teslim eder. Sonra sonucunu, sıralamasını, çözümleri ve net kaybettiği konuları görür. Her analiz bir eylemle biter: Mikro ders (Dersler), test (Testler), Bu hafta planıma ekle (Ders Planı). Öğrenci dışarıda çözdüğü denemeleri de ekleyebilir; net gelişimi tek grafikte birleşir. İstatistiklerim sayfası bütün modüllerin çalışma süresini, doğru oranını ve netleri gösterir.

**Temel kural (UIUX-Rehberi §5.4.1).** Deneme çözülürken doğru ya da yanlış **gösterilmez**. Şık yalnız "seçili" görünür (`OptionRow state="selected"`). Doğru/yanlış, renk, tik, çarpı, titreşim (`answerCorrect`/`answerWrong`) yalnız teslimden sonra çözümlerde açılır. Çözme ekranında yalnız şık seçme ve sonraki soru hareketleri vardır (`Hareket-Standardi.md`).

**Renk (ModuleIdentity.ts, modül anahtarı `exam`).** Denemeler tek turuncu modüldür.

| Jeton | Açık tema | Koyu tema |
|---|---|---|
| `color` (kimlik: ikon, halka, çubuk, sekme hapı ikonu) | `#E8590C` | `#FB8A3C` |
| `action` (düğme dolgusu, beyaz yazı 4,8:1; iki temada aynı) | `#C54C0A` | `#C54C0A` |
| `ink` (modül renginde yazı, `moduleInk`) | `#A23E08` | `#FCB380` |
| gradyan ikinci durak (`gradientTo`) | `#F59E0B` | `#F59E0B` |
| `wash` %7 / koyu %12,6 | `rgba(232,89,12,0.07)` | `rgba(251,138,60,0.126)` |
| `soft` %12 / %21,6 (ikon kutusu, çip, aktif sekme hapı) | `rgba(232,89,12,0.12)` | `rgba(251,138,60,0.216)` |
| `track` %16 / %28,8 (halka ve çubuk izi) | `rgba(232,89,12,0.16)` | `rgba(251,138,60,0.288)` |
| `line` %24 / %43,2 (modül renkli kenar) | `rgba(232,89,12,0.24)` | `rgba(251,138,60,0.432)` |

Başka modüle götüren düğme o modülün rengindedir (Modul-Kimligi §4): Mikro ders / Konuyu çalış / Ders → Dersler (`#0284C7`, düğme `#0277B3`, yazı açık `#015C8B` koyu `#88D7FB`); Test / 20 soru → Testler (`#4F46E5`, düğme `#4F46E5`, yazı açık `#473FCE` koyu `#ADB4FA`); Plana ekle → Ders Planı (`#0D9488`, düğme `#0C857A`, yazı açık `#09685F` koyu `#81E5D9`). Doğru yeşil (`success*`), yanlış kırmızı (`error*`), boş ve işaretli sarı (`warning*`); bunlar modül renginde gösterilmez.

**Mobil sekme çubuğu (Modul-Kimligi §6).**

| Yuva | Etiket TR / EN | İkon (çizim) | Hedef ekran | Rota |
|---|---|---|---|---|
| 1 | Denemeler / Exams | `exam` | `m-deneme-vitrin` | `ExamDashboard` |
| 2 | Denemelerim / My exams | `list` | `m-deneme-denemelerim` | `MyExams` → `ExamMyExams` |
| 3 | Modüller / Modules | `grid` | Modüller ana ekranı | `ModuleHub` |
| 4 | Sonuçlar / Results | `chart` | `m-deneme-sonuclar` | `ExamResults` → `ExamResultsHub` |
| 5 | Profil / Profile | `user` | Profil | `Profile` |

Sekme çubuğu yalnız yuva ekranlarında ve onların alt sayfalarında görünür (`ModuleScreen tab=…`). Odak ekranlarında yoktur: başlamadan önce, çözme, teslim, bağlantı koptu, soru çözümü (kitapçık), deneme detayı, deneme ekle (`noTabBar`).

**Web.** Sol menüde "Modüller" başlığı altında ilk satır **Denemeler** (`exam` ikonu; aktifken gri hap, 3 px turuncu şerit, turuncu ikon). Modül sayfalarında üstte hap sekmeler (çizimde yuva 1, 2, 4): **Denemeler** · **Denemelerim** · **Sonuçlar** (`ModuleHead`; aktif hap `mod.action` dolgu, beyaz yazı; pasif `colors.card`, `colors.line` kenar, `colors.ink2` yazı; yükseklik 36, köşe 18, yatay 16 boşluk, yazı 13,5 / 700). İstatistiklerim sol menüde **Hesap** başlığı altında (`chart` ikonu) ayrı bir satırdır; modül sayfası değildir.

| Web yolu | Çizim |
|---|---|
| `/student/sinavlarim` | `w-deneme-vitrin` |
| `/student/denemelerim` | `w-deneme-denemelerim` |
| `/student/sinav-takvimi` | `w-sinav-takvimi` |
| `/student/sinav/[examId]` | `w-deneme-detay`, `w-deneme-detay-bitti` |
| `/student/sinav/[examId]/basla` | `w-deneme-basla` |
| `/student/sinav/coz/[examUserId]` | `w-deneme-coz`, `w-deneme-teslim` (odak yolu, `(immersive)`) |
| `/student/sinav-sonuclari` | `w-deneme-sonuclar`, `w-deneme-sonuclar-bos`, `w-deneme-ekle` (pencere) |
| `/student/sinav-sonuclari/[snapshotId]` | `w-deneme-sonuc` |
| `/student/soru-cozumleri` | `w-deneme-cozum-liste` |
| `/student/soru-cozumleri/[examAttemptId]` | `w-deneme-cozumler` |
| `/student/raporlarim` | `w-istatistik` |

**Tablet.** Tam ekran tablet ortak sayfalarda web sayfasının kendisini gösterir (`PanelInTablet`, UIUX-Rehberi §5.7). Kalemli ekranlar [Tablet-Kalem.md](../Tablet-Kalem.md) §2'de, klavyeli deneme §6'da. Bu belge tablet için yalnız yerleşimi kısa yazar (§4.10). 600 pt altında (Split View) tablet telefon düzenini kullanır.

**Paylaşım kartı.** Deneme sonucunun paylaşım kartları `p-deneme-hikaye`, `p-deneme-gonderi`: [Paylasim-Kartlari.md](../Paylasim-Kartlari.md).

---

## 2. Ekran haritası

Kök yollar: mobil `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\exam\presentation\` (aşağıda `exam/`), mobil profil `...\src\modules\profile\presentation\screens\`, web `C:\Users\onurc\source\repos\sinavika_frontend_student\src\features\` (aşağıda `features/`).

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-deneme-vitrin` | mobil | Denemeler | `ExamDashboard` | `exam/screens/main/ExamDashboardScreen.tsx` | dolu |
| `w-deneme-vitrin` | web | Denemeler | `/student/sinavlarim` | `features/exams/pages/StudentExamsPage.tsx` | dolu |
| `m-deneme-katalog` | mobil | Tüm denemeler | `ExamDashboard (tüm denemeler)` | yok (ayrı katalog ekranı yok) | dolu |
| `m-deneme-detay` | mobil | Deneme detayı (yaklaşan) | `ExamStudentPublicDetail` | `exam/screens/ExamStudentPublicDetailScreen.tsx` | yaklaşan |
| `w-deneme-detay` | web | Deneme detayı | `/student/sinav/[examId]` | `features/exams/pages/StudentExamDetailPage.tsx` | yaklaşan |
| `t-deneme-detay` | tablet | Deneme detayı | `ExamStudentPublicDetail` | aynı mobil ekran | yaklaşan |
| `m-deneme-detay-bitti` | mobil | Biten denemenin detayı | `ExamStudentPublicDetail` | aynı ekran, sonuç kartlı dal | bitti |
| `w-deneme-detay-bitti` | web | Biten denemenin detayı | `/student/sinav/[examId]` | `StudentExamDetailPage.tsx` (`ExamDoneOverview`) | bitti |
| `t-deneme-detay-bitti` | tablet | Biten denemenin detayı | `ExamStudentPublicDetail` | aynı mobil ekran | bitti |
| `m-deneme-baslangic` | mobil | Başlamadan önce | `ExamStudentStarting` | `exam/screens/ExamStudentStartingScreen.tsx` | geri sayım |
| `w-deneme-basla` | web | Başlamadan önce | `/student/sinav/[examId]/basla` | `features/exam-sessions/pages/ExamStartPage.tsx` | geri sayım |
| `m-deneme-coz` | mobil | Deneme çözme | `ExamStudentSolve` | `exam/screens/ExamStudentSolveScreen.tsx` | çözülüyor |
| `w-deneme-coz` | web | Deneme çözme (odak) | `/student/sinav/coz/[examUserId]` | `features/exam-sessions/pages/ExamSolvePage.tsx` | çözülüyor |
| `t-deneme-coz-taslak` | tablet | Çözme · taslak kâğıdı | `ExamStudentSolve` | `exam/annotations/components/ExamStudentScratchpadPanel.tsx` | kalem |
| `t-deneme-coz-isaretleme` | tablet | Çözme · soruya yaz | `ExamStudentSolve` | `exam/annotations/components/ExamStudentQuestionOverlayHost.tsx` | kalem |
| `t-deneme-coz-dikey` | tablet | Çözme · dikey | `ExamStudentSolve` | aynı ekran (`examStudentSolveLayout.ts`) | kalem, dikey |
| `t-deneme-klavye` | tablet | Çözme · klavye ve soru haritası | `ExamStudentSolve` | `exam/hooks/useExamKeyboardShortcuts.ts`, `components/ExamKeyboardHints.tsx` | klavye |
| `t-deneme-kalem-ipucu` | tablet | Kalem · ilk açılış ipucu | `ExamStudentSolve` | doğrulanmadı | ilk |
| `m-deneme-baglanti` | mobil | Deneme · bağlantı koptu | `ExamStudentSolve` | `components/ExamStudentSolveSyncRibbon.tsx` | çevrimdışı |
| `m-deneme-teslim` | mobil | Teslim onayı | `ExamStudentSolve` | `components/ExamStudentSubmitSheet.tsx` | onay |
| `w-deneme-teslim` | web | Teslim onayı | `/student/sinav/coz/[examUserId]` | `features/exam-sessions/…/ExamExitConfirmModal.tsx` | onay |
| `t-deneme-teslim` | tablet | Teslim onayı | `ExamStudentSolve` | `ExamStudentSubmitSheet.tsx` | onay |
| `m-deneme-denemelerim` | mobil | Denemelerim | `MyExams · ExamMyExams` | `exam/screens/myExams/ExamMyExamsScreen.tsx` | dolu |
| `w-deneme-denemelerim` | web | Denemelerim ve takvim | `/student/denemelerim` | `features/exams/pages/MyExamsPage.tsx` | dolu |
| `w-sinav-takvimi` | web | Sınav takvimi | `/student/sinav-takvimi` | yönlendirme (`/student/denemelerim`'e) | dolu |
| `m-deneme-ay` | mobil | Geçmiş ay | `ExamMonth` | `exam/screens/myExams/ExamMonthScreen.tsx` | bitti (ay kapandı) |
| `m-deneme-sonuclar` | mobil | Sonuçlar | `ExamResultsHub · ExamResultsList` | `exam/results/screens/ExamResultsListScreen.tsx` | dolu |
| `w-deneme-sonuclar` | web | Sonuçlar | `/student/sinav-sonuclari` | `features/exam-results/pages/ExamResultsPage.tsx` | dolu |
| `t-deneme-sonuclar` | tablet | Sonuçlar | `ExamResultsHub` | aynı mobil ekran | dolu |
| `m-deneme-sonuclar-bos` | mobil | Sonuçlar · henüz deneme yok | `ExamResultsHub · ExamResultsList` | aynı ekran, boş dal | boş |
| `w-deneme-sonuclar-bos` | web | Sonuçlar · henüz deneme yok | `/student/sinav-sonuclari` | `ExamResultsPage.tsx` boş dal | boş |
| `t-deneme-sonuclar-bos` | tablet | Sonuçlar · boş | `ExamResultsHub` | aynı mobil ekran | boş |
| `m-deneme-ekle` | mobil | Deneme ekle | `ExamExternalResult` | `exam/results/screens/ExamExternalResultScreen.tsx` | form |
| `w-deneme-ekle` | web | Deneme ekle (pencere) | `/student/sinav-sonuclari` | `features/exam-results/…/ExternalExamDialog.tsx` | form |
| `t-deneme-ekle` | tablet | Deneme ekle | `ExamExternalResult` | aynı mobil ekran | form |
| `m-deneme-sonuc` | mobil | Sonuç | `ExamResultDocument · ExamResults` | `exam/results/screens/ExamResultDocumentScreen.tsx` | dolu |
| `w-deneme-sonuc` | web | Sonuç ve analiz | `/student/sinav-sonuclari/[snapshotId]` | `features/exam-results/pages/ExamResultDetailPage.tsx` | dolu |
| `m-deneme-analiz` | mobil | Eksik konu analizi | `ExamStatsLessonOverview · ExamStatistics` | `exam/statistics/screens/ExamStatsLessonOverviewScreen.tsx` | dolu |
| `m-deneme-gelisim` | mobil | Ders gelişimi | `ExamStatsLessonTrend` | `exam/statistics/screens/ExamStatsLessonTrendScreen.tsx` | dolu |
| `m-deneme-net` | mobil | Deneme neti | `ExamStatsExamNet` | `exam/statistics/screens/ExamStatsExamNetScreen.tsx` | dolu |
| `m-deneme-cozumler` | mobil | Çözümler | `ExamSolutionExamCards` | `exam/solutions/screens/ExamSolutionExamCardsScreen.tsx` | dolu |
| `w-deneme-cozum-liste` | web | Soru çözümleri listesi | `/student/soru-cozumleri` | `features/question-solutions/pages/QuestionSolutionsPage.tsx` | dolu |
| `m-deneme-cozum` | mobil | Soru çözümü | `ExamSolutionBookletReview` | `exam/solutions/screens/ExamSolutionBookletReviewScreen.tsx` | dolu |
| `w-deneme-cozumler` | web | Soru çözümleri | `/student/soru-cozumleri/[examAttemptId]` | `features/question-solutions/pages/QuestionSolutionDetailPage.tsx` | dolu |
| `t-deneme-cozum-notlar` | tablet | Çözüm · notlarım | `ExamSolutionBookletReview` | `annotations/components/ExamStudentAnnotationReviewOverlay.tsx` | kalem, salt okunur |
| `m-istatistik` | mobil | İstatistiklerim | `ProfileStatistics` | `profile/…/ProfileStatisticsScreen.tsx` | dolu |
| `w-istatistik` | web | İstatistiklerim | `/student/raporlarim` | `features/statistics/pages/StatisticsPage.tsx` | dolu |
| `t-istatistik-pano` | tablet | İstatistiklerim | `ProfileStatistics` | aynı mobil ekran | dolu |
| `m-istatistik-ilk` | mobil | İstatistikler · ilk hafta | `ProfileStatistics` | `ProfileStatisticsScreen.tsx` ilk hafta dalı | ilk |
| `m-istatistik-ders` | mobil | İstatistikler · tek ders | `ProfileStatisticsLesson` | `profile/…/ProfileStatisticsLessonScreen.tsx` | dolu |

Toplam 50 çizim: mobil 22, web 15, tablet 13.

Çizilmemiş ama gereken hâller (bu belge metinle tanımlar, §4): deneme açık (canlı başladı) detayı, devam eden denemenin detayı, mobil soru haritası alt sayfası, ara ver penceresi, süre bitti / otomatik teslim, teslim edildi (sonuç hazırlanıyor), yükleniyor ve hata hâlleri, deneme ekle alan hataları.

---

## 3. Süreçler

### 3.1 Canlı (yaklaşan) denemeyi hatırlatma

1. `m-deneme-vitrin` → vitrin kartındaki **Hatırlat** / **Remind me** → hatırlatma kurulur, yerinde kalınır. Kart düğmesi **Hatırlatma açık** / **Reminder on** olur (Denemelerim'deki başarı çipi gibi, `check` ikonu).
   - API: `POST student/engagement` (hatırlatma kaydı); kaldırma `DELETE student/engagement/{id}`; liste `GET student/engagement`. İki istemci de bugün bu uçları kullanıyor.
   - Başarı: kısa bildirim (toast, 3–5 sn) "Hatırlatma kuruldu" — metin çizilmedi, katalogda doğrulanmalı.
   - Hata: düğme eski hâline döner, kısa bildirim çıkar; ekran değişmez.
2. Vitrin kartının gövdesi ya da `Tümü` → `m-deneme-detay` [push]. Detayda alt çubukta açılış zamanı ve kalan süre, **Hatırlat** düğmesi (§4.3).
3. Push bildirimi: canlı denemeye 15 dk kala (`liveExamStart`, [Saat-Bildirim.md](../Saat-Bildirim.md)); iOS'ta canlı etkinlik geri sayımı ve **Hazırım**. Bildirim deneme detayını açar.
4. Web: `w-deneme-vitrin` banner'ındaki **Hatırlat** ve `w-deneme-detay` sağ kolondaki **Hatırlat** aynı uçla çalışır. Ana ekrandaki "Sıradaki deneme" eylem kartı (`ActionCard` geri sayım: gün / saat / dk) [01-Bugun.md](01-Bugun.md)'de.

### 3.2 Denemeye girme ve çözme

1. Deneme açıkken `m-deneme-detay` (ya da vitrin kartı, Denemelerim satırı, ana ekran kartı) → **Başla** / **Start** (açık deneme detayı çizilmedi; fiil UIUX-Rehberi §5.1'e göre) → `m-deneme-baslangic` [push, odak geçişi].
   - API: `POST student/exams/{examId}/start` (oturumu açar; açık oturum varsa onu döner). İstek sürerken düğme `loading`, kilitli.
   - Hata: abonelik yoksa abonelik kapısı (alt sayfa / tam ekran, 10-Profil-Hesap-Abonelik.md); erişim penceresi dışındaysa düğme pasif ve neden yazar; diğer hatalarda yerinde "Tekrar dene".
2. `m-deneme-baslangic`: 3 saniyelik geri sayım halkası ve kurallar. **Şimdi başla** / **Start now** ya da sayımın bitmesi → `m-deneme-coz` [replace: geri ile başlangıç ekranına dönülmez].
3. `m-deneme-coz`: şık seçilir → cevap **anında** cihazda saklanır ve gönderilir (§5.1). API: `POST student/exams/attempts/{id}/solutions`. Ekran beklemez; gönderim arkada yürür.
4. **Sonraki** / **Next**, **Boş bırak** / **Skip**, geri oku (önceki soru), **İşaretle** / **Flag**, soru haritası (`grid` simgesi) ile gezinilir.
5. Son soruda **Sonraki** ya da haritadaki **Bitir** → teslim onayı (§3.3).
6. Web: `w-deneme-basla` [replace] → `w-deneme-coz`. Başlıktaki **Denemeyi bitir** / **Finish exam** teslim onayını açar.

### 3.3 Teslim

1. `m-deneme-coz` → teslim isteği → `m-deneme-teslim` [alt sayfa, 520 pt].
2. Alt sayfada cevaplı / boş / işaretli sayıları ve boş soruların numaraları.
   - Numaraya dokunma → alt sayfa kapanır, o soru açılır.
   - **Boşlara dön** / **Back to blanks** → alt sayfa kapanır, ilk boş soru açılır. Boş yoksa düğme **Vazgeç** / **Cancel** olur (bugünkü iki istemcide böyle; metin çizimde yok).
   - **Teslim et** / **Hand in** → bekleyen cevaplar önce gönderilir, sonra `POST student/exams/attempts/{id}/complete`. Düğme `loading`, alt sayfa kapatılamaz, ikinci dokunuş istek göndermez.
3. Başarı → sonuç ekranı [replace]: sonuç hazırsa `m-deneme-detay-bitti` / `m-deneme-sonuc`; hazırlanıyorsa "Sonucun hazırlanıyor" bekleme hâli (çizilmedi; bugünkü kod `ExamStudentPostFinishSheet`). Geri tuşu çözme ekranına dönmez; akışın açıldığı listeye döner (Navigasyon §4).
4. Hata → alt sayfa açık kalır, düğme yeniden etkin olur, alt sayfanın içinde hata satırı ve **Tekrar dene**. Cevaplar cihazda kalır.
5. Süre biterse kullanıcıya sorulmadan otomatik teslim yapılır (§3.6).
6. Web: `w-deneme-teslim` [pencere]. Enter teslim eder, Esc kapatır (yükleme sürerken Esc çalışmaz).

### 3.4 Teslim sonrası: sonuç, çözümler, analiz, belge

1. `m-deneme-detay-bitti` (ya da Sonuçlar listesindeki satır) → **Sonuç belgesi** / **Result document** → sonuç belgesi [push] (`ExamResultDocument`). API: `GET StudentScoringExam/result-document/{scoringResultId}` (ya da `…/by-attempt/{attemptId}`; 202 = hazırlanıyor).
2. **Çözümler** / **Solutions** → `m-deneme-cozumler` [push] → soru satırı → `m-deneme-cozum` [push, odak]. API: `GET StudentQuestionSolution/cards`, `GET StudentQuestionSolution/review/{examAttemptId}`.
3. **Analiz** / **Analysis** → `m-deneme-analiz` [push]. Satırdaki **Mikro ders** → Dersler'de konunun mikro dersi [modül değişimi, push]; **20 soru** → Testler'de konunun testi; alttaki **Bu hafta planıma ekle** → Ders Planı'na görev ekler (API: study-plan `tasks` `POST`), başarıda kısa bildirim ve düğme "Planına eklendi" hâline geçer (metin çizilmedi).
4. `m-deneme-net` (bir denemenin neti) → konu satırında **Konuyu çalış** (Dersler) ve **Test** (Testler). API: `GET student/statistics/exams/{examAttemptId}?includeMikro=` (202 = işleniyor, yoklama en çok ~2 dk).
5. Web: `w-deneme-detay-bitti` ve `w-deneme-sonuc` aynı eylemleri yan yana kolonlarda verir.

### 3.5 Dışarıdaki denemeyi ekleme

1. `m-deneme-sonuclar` → **Deneme ekle** / **Add an exam** satırı → `m-deneme-ekle` [modal, sol üstte kapat `x`].
2. Seçenekler yüklenir: `GET student/external-exams/options` (sınav türü ve ders listesi, soru sayıları).
3. Öğrenci yayın, deneme adı, tarih ve ders ders doğru / yanlış girer; net her ders ve toplam için anında hesaplanır (net = doğru − yanlış/4, örnek: 32 D, 5 Y → 30,75). Doğru + yanlış dersin soru sayısını aşamaz.
4. **Kaydet** / **Save** → `POST student/external-exams` → modal kapanır, Sonuçlar'da çizgili sütun olarak görünür [geri]. Düğme `loading` iken kilitli.
5. Hata: alan hatası alanın altında (`Field error`); sunucu hatası kısa bildirim; girilenler silinmez.
6. Yarıda bırakma: kapat `x` ya da geri → bir şey girilmişse "Girdiklerin silinsin mi?" onayı (çizilmedi; metin doğrulanmalı). Boşsa onaysız kapanır.
7. Silme: çizimde yok. API'de `DELETE student/external-exams/{id}` var (UIUX-Rehberi §5.8); iki istemcide de kullanılmıyor.
8. Web: `w-deneme-ekle` Sonuçlar sayfasının üstünde pencere (600 px). Esc kapatır.

### 3.6 Yarıda kalan deneme, uygulamadan çıkış, arka plan

Çizimdeki kural: "Çıkarsan kaldığın yerden devam edersin; süre arka planda işler." / "Leave and resume later; the timer keeps running." (`m-deneme-detay`), "165 dakika, ara verilebilir" (`m-deneme-baslangic`), web çözme çubuğunda **Ara ver** / **Pause**.

1. Çözerken çıkış (`m-deneme-coz` sol üst `x`, Android geri tuşu, iOS kenar kaydırma, web **Ara ver**) hemen çıkmaz; ara ver penceresi açılır (Navigasyon §4): **Devam et** (birincil) ve **Ara ver, sonra devam ederim**. Pencere metinlerinin EN karşılığı çizilmedi; katalogda birlikte belirlenmeli.
2. Ara verilince: bekleyen cevaplar gönderilmeye çalışılır (beklemeden), ekran kapanır, Denemelerim açılır. Deneme **iptal olmaz**. Süre sunucuda işlemeye devam eder.
3. Devam: vitrindeki "Devam eden" kartı (**Devam** / **Resume**), Denemelerim'deki "Devam eden" sekmesi ya da web **Kaldığın yerden devam et** / **Resume** → doğrudan `m-deneme-coz` açılır (başlamadan önce ekranı ve geri sayım yok).
   - API: `GET student/exams/attempts/{id}/state` → verilen cevaplar, sürüm, `endsAtUtc`, `serverTimeUtc`. Yerel kuyruktaki cevaplar sunucudakinin üstüne birleştirilir; açılan soru, cevapsız ilk soru ya da son bakılan sorudur.
   - Süre bu arada bittiyse sunucu denemeyi kapatmıştır; çözme yerine "Süre doldu, deneme teslim edildi" hâli ve sonuca götüren düğme (çizilmedi).
4. Uygulama arka plana geçerse ya da kapatılırsa: süre işler, cevaplar cihazda saklıdır. Öne gelince `state` ile eşitlenir, sayaç `endsAtUtc − sunucu saati` ile yeniden kurulur; kalan süre doğru gösterilir. Arka planda kalmak denemeyi kendiliğinden bitirmez; yalnız süre biterse teslim olur.
5. Süre biterse: cevaplar kilitlenir, bekleyen cevaplar gönderilir, `complete` otomatik çağrılır, "Süre doldu" bildirimi ve sonuç bekleme hâli açılır. Kullanıcıya teslim penceresi sorulmaz.
6. **Denemeyi iptal etme** çizimde yoktur. Bugünkü iki istemcide iptal var (`POST student/exams/attempts/{id}/cancel`); farklar §7'de.

### 3.7 Bağlantı kopması

1. Çözerken ağ koparsa `m-deneme-baglanti`: başlığın altında sarı şerit "Bağlantı koptu", bekleyen cevap sayısı çipi. Çözme sürer; seçilen şık seçili kalır, geri alınmaz.
2. Bağlantı gelince kuyruk sırayla gönderilir, sayı azalır, şerit kapanır. Kuyruk boşalmadan teslim edilirse önce kuyruk gönderilir.
3. Web'de aynı davranış (çizimdeki kural "Bağlantı koparsa cevapların saklanır" web detay ve başlangıç sayfasında da yazıyor).

### 3.8 İstatistiklerim

1. Mobil: Profil → **İstatistikler** → `m-istatistik` [push] (ilk haftada `m-istatistik-ilk`). Ders satırı → `m-istatistik-ders` [push].
2. Web: sol menü Hesap › **İstatistiklerim** → `w-istatistik`. Ana sayfadaki "Bu hafta" kartının **İstatistiklerim** bağlantısı da buraya gelir.
3. API: `GET student/statistics/overview?period=` (dönem: bu hafta / son 30 gün / tümü), ders için `GET student/statistics/overview/lessons/{id}?period=`.

---

## 4. Ekranlar

### 4.1 `m-deneme-vitrin` Denemeler · web: `w-deneme-vitrin`

- **Görseller:** `acik/mobil/m-deneme-vitrin.png`, `koyu/mobil/m-deneme-vitrin.png`, `en/acik/mobil/m-deneme-vitrin.png`; web `acik/web-panel/w-deneme-vitrin.png`, `koyu/web-panel/…`, `en/acik/web-panel/…`.
- **Çerçeve:** `AppHeader` varsayılan (solda profil, sağda zil ve kırmızı sayaç rozeti; logo yok). Sekme çubuğu var, aktif yuva 1. Arka plan modül yıkaması (`mod.wash` → `colors.bg`, %34'te biter). Alt düğme alanı yok.
- **Yerleşim (yukarıdan aşağı), `Content` boşluğu 14, kenar 18:**
  1. `PageTitle module="exam"`: üstte modül çipi (`Chip tone="module" size="sm"`, `exam` ikonu, "Denemeler" / "Practice exams"), altında başlık **Denemeler** / **Practice exams** (`title` rolü, 24 pt).
  2. `ModuleSlide module="exam" height=186`: modül gradyanı (`#E8590C → #F59E0B`, 135°), köşe 26, iç boşluk 20, iki ışık dairesi ve saydam `exam` filigranı.
     - Üst satır (`over`, beyaz %85): **Canlı · Türkiye geneli** / **Live · nationwide**.
     - Başlık (`hero` 24, beyaz): deneme adı, örn. **TYT Deneme 5** / **TYT Exam 5**.
     - Satır (`small`, beyaz %90): **Cumartesi 10:00 · 120 soru · 165 dk · 12.480 kişi** / **Saturday 10:00 · 120 questions · 165 min · 12,480 students**.
     - Düğme `Button tone="white" size="sm"` (beyaz dolgu, yazı `moduleInk` açık `#A23E08`): **Hatırlat** / **Remind me**. Deneme açıldığında **Başla** / **Start** (çizilmedi, §5.1 fiili).
  3. Devam eden deneme kartı `Card tone="moduleLine"` (beyaz, 1,5 `mod.line` kenar, gölge), iç boşluk 14, satır, boşluk 12:
     - `Ring` 48, kalınlık 5, `mod.color`: içinde yüzde (`meta` 800), örn. **%60** / **60%** = cevaplanan / toplam.
     - Metin sütunu: `over` `mod.ink` **Devam eden** / **In progress**; `headline` deneme adı (örn. **AYT Sayısal Deneme 3**); `small` **48 / 80 soru · 74 dk kaldı** / **48 / 80 · 74 min left**.
     - Sağda `Button tone="module" size="sm"`: **Devam** / **Resume**.
     - Devam eden deneme yoksa kart hiç çizilmez.
  4. `SectionTitle`: **Senin için** / **For you**, sağda bağlantı **Tümü** / **All** (`small` 700, `mod.ink`) → `m-deneme-katalog`.
  5. `List` (tek kart, satırlar ince çizgiyle ayrılı), satır = `ListRow module="exam"`: 38 pt modül kutusu, başlık (`headline`), alt satır (`small`), meta (`meta`), sağda `Chip tone="module" size="sm"` etiket. Örnek satırlar:
     - **TYT Deneme 4 · Tekrar** / **TYT Exam 4 · Retake** · **Eksiklerinin üzerinden yeniden** / **Built on your gaps** · **120 soru · 165 dk** · etiket **Önerilen** / **Suggested**.
     - **Paragraf Branş Denemesi** / **Reading Subject Exam** · **Türkçe · 40 soru** · **50 dk** · etiket **Yeni** / **New**.
- **Veri:** `GET student/exams/month[?year&month]` (bugün vitrin, Denemelerim ve geçmiş ay bu tek uçtan besleniyor). Alanlar: deneme adı, tür (Türkiye geneli / branş), başlangıç zamanı, soru sayısı, süre (dk), katılımcı sayısı, devam eden oturum (cevaplanan, toplam, kalan süre), hatırlatma durumu. "Senin için" önerisi (Önerilen/Yeni etiketi): API'de doğrulanmalı. Katılımcı sayısı: API'de doğrulanmalı.
- **Etkileşimler:** slayt düğmesi → hatırlatma (§3.1) ya da başlat (§3.2); slaydın gövdesi → `m-deneme-detay` [push]; **Devam** → `m-deneme-coz` [push, odak] (§3.6); `Tümü` → `m-deneme-katalog` [push]; liste satırı → `m-deneme-detay` [push].
- **Hâller:** ilk yükleme `LoadingLogo` ortada; yenilemede içerik kalır. Bu ay deneme yoksa slayt yerinde `StateBlock` "Denemeler hazırlanıyor" (bugünkü koddaki metin; çizilmedi). Hata: yerinde "Tekrar dene". Abonelik yoksa abonelik kapısı.
- **Web farkı (`w-deneme-vitrin`):** `Panel active="exam"`; `ModuleHead tab=0`, başlık **Denemeler**, alt satır **Türkiye geneli ve konu denemeleri** / **Nationwide and topic exams**, sağda `Button tone="ghost"` `filter` **Filtrele** / **Filter**.
  - İki kolon `Grid 2fr 1fr`, boşluk 18: solda `ModuleBanner` (gradyan, köşe 26, iç boşluk 26; `over` **Canlı · Türkiye geneli · Cumartesi 10:00**; başlık `title` 30 beyaz; metin `body` 15 **120 soru · 165 dk · 12.480 kişi katılıyor · sonuç 2 saat sonra** / **… results in 2 hours**; beyaz düğme **Hatırlat**). Sağda devam eden kartı (`Card moduleLine`, iç boşluk 20, boşluk 10): `over` **Devam eden**, `section` deneme adı, `small` **Fen Bilimleri · 48 / 80 soru · 74 dk kaldı**, `Bar` 0,6 `mod.color`, `Button block` **Kaldığın yerden devam et** / **Resume**.
  - Süzgeç çipleri (yükseklik 34, yazı 13): **Tümü** (`moduleSolid`), **TYT**, **AYT**, **Branş** / **Subject**, **Ücretsiz** / **Free** (`outline`).
  - Kart ızgarası `repeat(3, 1fr)`, boşluk 14: her kart `Card` iç boşluk 16; solda 42 modül kutusu; başlık + etiket çipi; `small` alt satır; `meta` "120 · 165 dk"; sağda `right` oku (`#94A3B8`).
- **Kurallar:** slayt tek fiil taşır (Hatırlat / Başla / Devam et). Sayı biçimi: TR `12.480`, EN `12,480`. Biten deneme vitrinde "Hatırlat" ya da "Başla" göstermez.

### 4.2 `m-deneme-katalog` Tüm denemeler

- **Görseller:** `acik/mobil/m-deneme-katalog.png`, `koyu/…`, `en/acik/…`.
- **Çerçeve:** `AppHeader left="back"`, ortada **Tüm denemeler** / **All exams** (`section`), sağda boş 40 pt. Sekme çubuğu var, aktif yuva 1. Yıkama var.
- **Yerleşim:**
  1. Süzgeç çipleri satırı, boşluk 8: **Tümü** / **All** (`moduleSolid`: `mod.action` dolgu, beyaz), **TYT**, **AYT**, **Branş** / **Subject**, **Ücretsiz** / **Free** (`outline`). Çip yüksekliği 28, yazı 13 / 700. Sığmazsa yatay kayar (`FilterChips` kuralı).
  2. `List` içinde `ListRow` satırları (vitrindeki biçim). Örnek: **TYT Deneme 5** · **Türkiye geneli · Cumartesi 10:00** · `120 · 165 dk` · **Canlı** / **Live**; **AYT Sayısal Deneme 3** · **Matematik, Fen** · `80 · 180 dk`; **TYT Deneme 4** · **Arşiv · sıralama açık** / **Archive · ranking open**; **Problemler Branş** · **Matematik** · `30 · 45 dk` · **Ücretsiz**; **Fen Branş Denemesi** · **Fizik, Kimya, Biyoloji** · `20 · 30 dk`; **Tarih Branş Denemesi** · **Sosyal Bilimler** · `20 · 25 dk`.
- **Veri:** `student/exams/month` ve arşiv. Arşiv listesi ve "Ücretsiz" bayrağı: API'de doğrulanmalı.
- **Etkileşimler:** çip → liste süzülür (istek yoksa yerelde; seçili çip `moduleSolid`); satır → `m-deneme-detay` [push]; geri → vitrin.
- **Hâller:** süzgeç sonucu boşsa `StateBlock` "Bu süzgeçte deneme yok" ve **Tümünü göster** (çizilmedi). Uzun liste sanal listeyle çizilir.
- **Kurallar:** "Canlı" etiketi yalnız henüz bitmemiş Türkiye geneli denemede.

### 4.3 `m-deneme-detay` Deneme detayı (yaklaşan) · web: `w-deneme-detay` · tablet: `t-deneme-detay`

- **Görseller:** `acik/mobil/m-deneme-detay.png`, `koyu/…`, `en/acik/…`; web `w-deneme-detay.png`; tablet `acik/tablet/t-deneme-detay.png`.
- **Çerçeve:** `AppHeader left="back"`, başlık **Deneme detayı** / **Exam details**. Sekme çubuğu yok. Yıkama var. `BottomBar` (iç boşluk 12 18 34, boşluk 10).
- **Yerleşim:**
  1. Başlık bloğu (boşluk 8): `Chip tone="module"` **TYT · Türkiye geneli** / **TYT · Nationwide**; `hero` (26/32/800) deneme adı; `body` **Sonuçlar sınavdan 2 saat sonra açıklanır. Sıralaman 12.480 kişi içinde hesaplanır.** / **Results in 2 hours. Ranked among 12,480 students.**
  2. Üç sayı kutusu (ızgara 3 kolon, boşluk 10), her biri `Card tone="flat"` iç boşluk 12, ortalı: `num` 24 (`120`, `165`, `4`) ve `meta` **soru** / **questions**, **dakika** / **minutes**, **oturum** / **sections**.
  3. `SectionTitle` **Bölümler** / **Sections**.
  4. `List`: her satır iç boşluk 12 14; solda 10 × 10 köşe 4 ders rengi kare; `headline` ders adı (**Türkçe**, **Sosyal**, **Matematik**, **Fen**); sağda `small` **40 soru** / **40 questions**. Ders kare renkleri çizimde örnektir (Türkçe `#0284C7`, Sosyal `#0D9488`, Matematik `#4F46E5`, Fen `#DB2777`); uygulamada ders renk tablosundan gelir (doğrulanmadı).
  5. Bilgi kutusu `Card tone="soft"` (`colors.line2` dolgu) iç boşluk 14: `info` 18 `colors.muted` + `small` **Çıkarsan kaldığın yerden devam edersin; süre arka planda işler.** / **Leave and resume later; the timer keeps running.**
  6. `BottomBar`: ortalı `small` **Cumartesi 10:00’da açılır · 2 gün 4 saat kaldı** / **Opens Saturday 10:00 · 2 days 4 hours left**; altında `Button tone="module" size="lg" block icon="bell"` **Hatırlat** / **Remind me** (54 pt).
- **Veri:** `GET student/exams/{examId}`: ad, tür, açıklama, soru sayısı, süre, oturum sayısı, bölümler (ders + soru sayısı), açılış zamanı, katılımcı sayısı, sonuç açıklanma süresi, erişim penceresi; hatırlatma `student/engagement`. Kalan süre sunucu saatine göre hesaplanır (`serverTimeUtc`).
- **Etkileşimler:** **Hatırlat** → §3.1; kurulduysa düğme `tone="moduleSoft"` **Hatırlatma açık** / **Reminder on** (`check`), dokununca kaldırma seçeneği (alt sayfa: **Hatırlatmayı kaldır**; çizilmedi). Geri → önceki ekran.
- **Deneme açıkken (çizilmedi):** alt çubuk metni **Açık · {kalan süre} sonra kapanır**, düğme `tone="module"` **Başla** / **Start** → §3.2. Devam eden oturum varsa **Devam et** / **Continue** → doğrudan çözme.
- **Erişim penceresi dışında (çizilmedi):** düğme `disabled`, altında nedeni (örn. açılış tarihi).
- **Kalan süre biçimi:** 1 günden fazla "X gün Y saat kaldı"; 1 günden az "X saat Y dk kaldı"; 1 saatten az dakika dakika. Sayaç her dakika yenilenir; ekran okuyucuya her değişimde duyurulmaz (yalnız açılınca okunur).
- **Hâller:** yükleniyor `LoadingLogo`; hata yerinde "Tekrar dene" ve **Denemelere dön**; bulunamadı (silinmiş deneme) → modül kökü ve kısa bildirim "Bu içerik artık yok" (Navigasyon §5.3).
- **Web farkı (`w-deneme-detay`):** `Panel crumb="Denemeler ›"`. Üstte tam genişlik `ModuleBanner`: `over` **TYT · Türkiye geneli**, başlık deneme adı, metin **Cumartesi 17 Ekim, 10:00. Sonuçlar 2 saat sonra; sıralaman 12.480 kişi içinde.** / **Saturday 17 Oct, 10:00. Results in 2 hours; ranked among 12,480.**, beyaz **Hatırlat**. Altında iki kolon `1.3fr 1fr`: solda `WCard` **Bölümler** (aynı liste, satır iç boşluk 13 16); sağda `WCard` **Kurallar** / **Rules**: dört satır (`Tile` 34 + `small` `colors.ink2`): **165 dakika; ara verilebilir, süre işler** / **165 min; pausing keeps time running**, **4 yanlış 1 doğruyu götürür** / **4 wrong cancel 1 right**, **Emin olmadığın soruyu işaretle** / **Flag questions you are unsure of**, **Bağlantı koparsa cevapların saklanır** / **Answers are kept offline**; ortalı açılış metni ve `Button module lg block bell` **Hatırlat**.
- **Tablet:** web sayfasının kendisi, uygulama üst çubuğunun altında, modül yıkamalı.
- **Kurallar:** yaklaşan denemede "Denemeye gir" yoktur; tek eylem Hatırlat.

### 4.4 `m-deneme-detay-bitti` Biten denemenin detayı · web: `w-deneme-detay-bitti` · tablet: `t-deneme-detay-bitti`

- **Görseller:** `acik/mobil/m-deneme-detay-bitti.png` ve koyu, EN; web ve tablet aynı adla.
- **Çerçeve:** `AppHeader left="back"`, başlık **Deneme detayı** / **Exam detail**. Sekme çubuğu yok. Yıkama var. Alt düğme alanı yok.
- **Yerleşim (boşluk 12):**
  1. Çipler satırı (boşluk 6): `Chip module sm` **Branş · TYT** / **Subject · TYT**; `Chip success check sm` **Tamamlandı · 3 Kas** / **Done · 3 Nov**. Altında `title` (22/28) deneme adı, örn. **TYT Temel Matematik Denemesi · Kasım 2026** / **TYT Basic Maths · November 2026**.
  2. Sonuç kartı `Card tone="module"` (`mod.wash` dolgu, `mod.line` kenar), iç boşluk 16, satır boşluk 16:
     - `Ring` 84, kalınlık 9, `mod.color` / iz `mod.track`; değer = net / soru sayısı; ortada `headline` 20 **10,75** ve `meta` **net**.
     - Sağda üç sayı (eşit aralık): `headline` 18 **14** `successInk` **doğru** / **right**; **13** `errorInk` **yanlış** / **wrong**; **13** `colors.ink2` **boş** / **blank** (etiketler `meta`).
     - Altında `small` **Katılanların %41’inden iyi · 52 dk** / **Better than 41% · 52 min**.
  3. Eylemler (boşluk 8): `Button tone="module" size="lg" block icon="file"` **Sonuç belgesi** / **Result document**; altında yan yana iki `Button tone="moduleSoft"` (46 pt): `checkCircle` **Çözümler** / **Solutions**, `chart` **Analiz** / **Analysis**.
  4. `SectionTitle` **Net kaybettiğin konular** / **Topics that cost you**.
  5. `List`, satır `ListRow` (ok yok): Testler satırı `quiz` kutusu, **Problemler** / **Word problems**, **6 soru · 4 yanlış** / **6 questions · 4 wrong**, sağda `Button moduleSoft module="tests" sm` **Test** / **Quiz**; Dersler satırı `book` kutusu, **Üslü sayılar** / **Exponents**, **3 soru · 2 yanlış**, sağda `Button moduleSoft module="lessons" sm` **Ders** / **Lesson**.
- **Veri:** sonuç kartı `StudentScoringExam/result-cards` (net, D/Y/B, yüzdelik, süre, tamamlanma tarihi); konular `student/statistics/exams/{examAttemptId}`.
- **Etkileşimler:** Sonuç belgesi → belge [push]; Çözümler → `m-deneme-cozumler` [push] (ya da doğrudan bu denemenin kitapçığı `m-deneme-cozum`); Analiz → `m-deneme-analiz` / `m-deneme-net` [push]; Test → Testler konu testi; Ders → Dersler konu mikro dersi.
- **Hâller:** sonuç hazırlanıyorsa kartın yerinde `LoadingLogo` ve "Sonucun hazırlanıyor" (çizilmedi; bugün yoklama 20 × 3 sn); çözümler hazır değilse Çözümler düğmesi `disabled` ve altında neden.
- **Web farkı (`w-deneme-detay-bitti`):** `ModuleHead tab=1` (Denemelerim hapı aktif), başlık deneme adı, alt satır **Tamamlandı · 3 Kasım · 52 dk**, sağda `Chip success check` **Tamamlandı** / **Done**. İki kolon `1fr 1.2fr`: solda `WCard` içinde 110 px halka (10 px `mod.color` kenar), `title` 24 **10,75** + `meta` net; sağında üç sayı (`title` 22); **Katılanların %41’inden iyi** / **Better than 41% of participants**; **Sonuç belgesi** (module lg block), **Çözümler** + **Analiz** (moduleSoft). Sağda `WCard` **Net kaybettiğin konular**: üç satır (`Tile` 40 + başlık + alt satır + `moduleSoft sm` düğme): Testler **Problemler** · **Test çöz** / **Solve a quiz**; Dersler **Üslü sayılar** · **Mikro ders** / **Micro-lesson**; Ders Planı (`calendar`) **Plana ekle** / **Add to plan** · **İkisini bu haftaya koy** / **Put both into this week** · **Ekle** / **Add**.
- **Tablet:** web sayfasının kendisi.
- **Kurallar (canlı hata #3, Registry notu):** biten denemede **Denemeye gir** ve **Hatırlat** yoktur. Sıra: önce sonuç, sonra Sonuç belgesi, Çözümler, Analiz, sonra net kaybettiren konular.

### 4.5 `m-deneme-baslangic` Başlamadan önce · web: `w-deneme-basla`

- **Görseller:** `acik/mobil/m-deneme-baslangic.png`, koyu, EN; web `w-deneme-basla.png`.
- **Çerçeve:** `FocusHeader` (solda `x` 40 pt kart, ortada `meta` deneme adı **TYT Deneme 5** ve `headline` 16 **Başlamadan önce** / **Before you start**). Sekme çubuğu yok. Yıkama var. `BottomBar`.
- **Yerleşim (ortalı, üst boşluk 30, boşluk 16):**
  1. `Ring` 170, kalınlık 12, `mod.color`, iz `mod.track`; ortada `num` 48 **3** ve `meta` **saniye** / **seconds**.
  2. `hero` **Hazırsan başlıyoruz** / **Starting when you are ready**.
  3. Kurallar kartı `Card` iç boşluk 6, tam genişlik, sola hizalı; 4 satır (iç boşluk 11 10, aralarında `line2` çizgi), her satırda `Tile module="exam"` 32 ve `small` `colors.ink2`:
     - `clock` **165 dakika, ara verilebilir** / **165 minutes, pausing allowed**
     - `bookmark` **Emin olmadığın soruyu işaretle** / **Flag questions you are unsure of**
     - `x` **4 yanlış 1 doğruyu götürür** / **4 wrong cancel 1 right**
     - `wifi` **Bağlantı koparsa cevapların saklanır** / **Answers are kept offline**
  4. `BottomBar`: `Button size="lg" block` (birincil, modül içinde `mod.action`) **Şimdi başla** / **Start now**.
- **Veri:** `POST student/exams/{examId}/start` bu ekran açılınca arkada çağrılır (soru paketi ve oturum kimliği). Süre ve yanlış kuralı (4 yanlış 1 doğru) deneme ayarından gelir (`Scoring/methods`; doğrulanmadı); süresiz denemede ilk satır "Süresiz; ara verip dönebilirsin" olur (metin doğrulanmalı).
- **Etkileşimler:** halka 3 → 0 sayar (saniyede bir, `progressGain` gibi tek yönlü azalır; "hareketi azalt" açıksa yalnız sayı değişir). Sayım biter ya da **Şimdi başla**'ya basılırsa ve oturum hazırsa → `m-deneme-coz` [replace]. Oturum hazır değilse düğme `loading`, sayım 0'da bekler. `x` → detaya döner, oturum başlamadıysa hiçbir şey kaydedilmez.
- **Hâller:** başlatma hatası → halkanın yerine `StateBlock tone="error"` "Deneme başlatılamadı", **Tekrar dene** ve **Denemelere dön**; abonelik yok → abonelik kapısı (**Paketleri gör**).
- **Web farkı (`w-deneme-basla`):** `Immersive` (menü yok; 70 px çubuk: `ghost sm x` **Ara ver**, 36 modül kutusu, başlık deneme adı, alt satır **Başlamadan önce**). Ortada (boşluk 22): 150 px halka (12 px `mod.color` kenar) içinde `display` 56 **3**; `title` 28 **Hazırsan başlıyoruz**; 520 px genişlikte dört kural satırı (iç boşluk 10 14, köşe 14, `colors.line2` dolgu, ikon 18 `mod.ink`, `body` 15). Web kural sırası: süre, 4 yanlış, işaretle, bağlantı; ilk satır **165 dakika; ara verilebilir, süre işler** / **165 min; you can pause, time runs**. Altta 520 px `Button module lg icon="play"` **Şimdi başla**.

### 4.6 `m-deneme-coz` Deneme çözme · web: `w-deneme-coz` · tablet: §4.10

- **Görseller:** `acik/mobil/m-deneme-coz.png`, koyu, EN; web `w-deneme-coz.png`.
- **Çerçeve:** odak ekranı. Sekme çubuğu yok. Yıkama var. `FocusHeader`:
  - Solda `x` (40 pt yuvarlak kart, `colors.line` kenar): ara ver penceresi (§3.6).
  - Ortada `meta` bölüm adı **Temel Matematik** / **Basic Maths** ve `headline` 16 kalan süre **1:42:18** (s:dd:ss; 1 saatin altında dd:ss).
  - Sağda 40 pt yuvarlak kart içinde `grid` ikonu (20, kalınlık 3): soru haritası.
  - Altında 5 pt ilerleme çizgisi (`colors.line2` iz, `mod.color` dolu; değer = cevaplanan / toplam).
  - `BottomBar border` (beyaz `colors.card` zemin, üstte `line2` çizgi).
- **Yerleşim (boşluk 14):**
  1. Satır, iki uca: `Chip` (nötr) **Soru 46 / 120** / **Question 46 / 120**; `Chip tone="outline" icon="bookmark"` **İşaretle** / **Flag**. İşaretliyken çip `tone="warning"` ve **İşaretlendi** / **Flagged** (metin web kodunda var; çizilmedi).
  2. Soru metni: `body` 17 pt, kalınlık 600, satır yüksekliği 27, `colors.ink`. Şekil varsa metnin altında, tam genişlik (figür sözleşmesi, `alt` metni okunur).
  3. Şıklar (boşluk 8): `OptionRow` A–E. Boşta: `colors.line` 1,5 kenar, `colors.card` dolgu, 30 pt harf kutusu (`line2`, harf `ink2`), köşe 16, iç boşluk 11 14, metin `body` 600. **Seçili:** kenar `mod.color`, dolgu `mod.wash`, harf kutusu `mod.action`, harf beyaz.
  4. `BottomBar`, satır boşluk 10: `Button tone="ghost" size="lg" icon="left"` (54 × 54, yazısız; ekran okuyucu adı **Önceki soru** / **Previous question**); `Button tone="soft" size="lg"` esnek **Boş bırak** / **Skip** (`mod.soft` dolgu, `mod.ink` yazı); `Button size="lg" iconRight="right"` esnek **Sonraki** / **Next** (`mod.action`).
- **Soru haritası (mobil; çizilmedi, web ve tabletle aynı içerik):** `grid` → alt sayfa: bölüm başlıkları (`over`, örn. **Temel Matematik · 40 soru**), 5 kolon numara kutusu (yükseklik 36, köşe 10): cevaplı `mod.soft` dolgu / `mod.ink` yazı; şu anki `mod.action` dolgu / beyaz; boş `colors.card` / `colors.muted`, `colors.line` kenar; işaretli `warningSoft` / `warningInk`, `warning` kenar. Altta açıklama ("cevaplı · işaretli · boş") ve `Button module block` **Bitir** / **Finish** (teslim onayını açar). Numaraya dokunma → alt sayfa kapanır, soru açılır.
- **Veri:** oturum `POST start` ya da `GET attempts/{id}/state`: sorular (bölüm, sıra, metin, şekil, şıklar), verilen cevaplar, `endsAtUtc`, `serverTimeUtc`, cevap politikası, tamamlama politikası (`allowBlanks`). Cevap `POST attempts/{id}/solutions` (soru kimliği + şık). İşaretler: API'de alan doğrulanmalı; en azından cihazda oturum kimliğiyle saklanır ve devamda geri gelir.
- **Etkileşimler:**
  - Şıkka dokunma → seçili olur (`optionSelect`: basma ölçeği 0,97, seçim titreşimi), cevap kuyruğa ve sunucuya gider (§5.1). Otomatik olarak sonraki soruya **geçilmez**.
  - Seçili şıkka yeniden dokunma ya da başka şık: bugünkü API cevabı ilk gönderimde kilitler (`lockOnFirstSubmit`; "Bu soru cevaplandı; şık değiştirilemez."). Cevap değiştirme sahibin açık kararıdır (UIUX-Gecmis §7). Kilit sürdükçe seçili şıkta değişiklik yoktur, kısa bildirim gösterilir.
  - **Boş bırak** → soru cevapsız kalır, sonraki soru açılır. Seçili şık varken (kilit sürdükçe) gizlenir; web bugün böyle.
  - **Sonraki** → sonraki soru (`nextQuestion`: eski 180 ms çıkar, yeni 240 ms sağdan 8 pt girer). Son soruda **Bitir** / **Finish** olur ve teslim onayını açar (çizimde son soru hâli yok; metin web/tablet **Bitir** ile aynı).
  - Önceki (`left`) → önceki soru; ilk soruda pasif.
  - **İşaretle** → işaret aç/kapa, haritada sarı.
  - Yatay kaydırma ile soru değiştirme yoktur; çekip yenileme kapalı.
- **Hâller:** yükleniyor `LoadingLogo` ("Yükleniyor" düz metni yok); bağlantı koptu `m-deneme-baglanti` (§4.7); süre son 5 dk sayaç `warningInk`, son 1 dk `errorInk` ve ekran okuyucuya bir kez duyuru (web kodundaki eşikler; çizilmedi); süre doldu → otomatik teslim (§3.6); oturum açılamadı → `StateBlock tone="error"` "Bu oturum açılamadı" ve **Denemelere dön**.
- **Web farkı (`w-deneme-coz`):** `Immersive` (1440 × 900, beyaz zemin).
  - Çubuk 70 px, iç boşluk 0 32: `ghost sm x` **Ara ver** / **Pause**; 36 modül kutusu; `headline` deneme adı **TYT Deneme 5**, `meta` **Temel Matematik · 2. oturum** / **Basic Maths · section 2**; sağda (boşluk 18) `clock` 20 `mod.color` + `num` 24 **1:42:18**; `small` **46 / 120 yanıtlandı** / **46 / 120 answered**; `Button tone="dark"` **Denemeyi bitir** / **Finish exam**. Altında 4 px ilerleme çizgisi.
  - Ana sütun (iç boşluk 40 120, boşluk 20): `Chip` (32 yükseklik, 13) **Soru 46** / **Question 46** ve `outline bookmark` **İşaretle**; soru `body` 20 / 600, satır 32, en çok 760 px; şıklar en çok 560 px, boşluk 10; en altta satır: `ghost lg left` **Önceki** / **Previous**, `soft lg` **Boş bırak**, `lg right` **Sonraki**, yanında `meta` klavye ipucu.
  - Sağ panel 300 px (`colors.bg`, solda `colors.line` çizgi, iç boşluk 24): `over` **Temel Matematik · 40 soru** / **Basic Maths · 40 questions**; 5 kolon ızgara (boşluk 6, kutu 36, köşe 10): cevaplı `colors.card` + `line` kenar + `ink`; şu anki `mod.action` + beyaz; cevapsız saydam + kesikli `line` kenar + `muted`; işaretli kutunun sağ üstünde 6 px `warning` nokta. Altta `meta` **1 işaretli soru** / **1 flagged question**.
  - Klavye: A–E şık seçer, → sonraki, ← önceki; **M** işaretler ("M işaretle" / "M flag"); Enter teslim penceresinde onaylar.
- **Kurallar:** doğru/yanlış gösterilmez; şık yalnız seçili görünür; titreşim yalnız seçimde. Süre sunucu saatinden hesaplanır; cihaz saati değiştirilse de kalan süre değişmez.

### 4.7 `m-deneme-baglanti` Deneme · bağlantı koptu

- **Görseller:** `acik/mobil/m-deneme-baglanti.png`, koyu, EN.
- **Çerçeve:** `m-deneme-coz` ile aynı (`FocusHeader` örnek **1:31:02**, ilerleme 0,45; sağdaki harita düğmesi bu çizimde yok).
- **Yerleşim:**
  1. Şerit (başlığın hemen altında, yan boşluk 16, iç boşluk 10 14, köşe 16, `warningSoft` dolgu), satır boşluk 10: `wifi` 18 `warningInk`; metin sütunu: `headline` 14 `warningInk` **Bağlantı koptu** / **Connection lost**, `meta` `colors.ink2` **Cevapların telefonda saklanıyor; süre işliyor. Bağlanınca kendiliğinden gönderilir.** / **Answers are kept on the phone; the timer runs. They are sent when you reconnect.**; sağda `Chip tone="warning" sm` **3 bekliyor** / **3 waiting** (bekleyen cevap sayısı).
  2. Altında çözme içeriği (iç boşluk 14 18 10): `Chip` **Soru 22 / 40**, soru `body` 17/26, `OptionRow` A–D (B seçili), çözme alt çubuğu (§4.6).
- **Veri:** yerel kuyruk uzunluğu; ağ durumu (NetInfo / `navigator.onLine` ve istek hataları).
- **Etkileşimler:** çözme aynen sürer; teslim edilebilir (önce kuyruk gönderilir; gönderilemezse teslim alt sayfasında "Bağlanınca teslim edilecek" bilgisi; çizilmedi).
- **Hâller:** bağlantı gelince "Bekleyen cevaplar gönderiliyor…" / "Sending pending answers…" (bugünkü mobil metni), sayı sıfırlanınca şerit 180 ms'de kapanır.
- **Kurallar:** seçilen şık geri alınmaz, hata kırmızısı gösterilmez; bu bir uyarıdır (sarı). Web aynı şeridi gösterir.

### 4.8 `m-deneme-teslim` Teslim onayı · web: `w-deneme-teslim` · tablet: `t-deneme-teslim`

- **Görseller:** `acik/mobil/m-deneme-teslim.png`, koyu, EN; web `w-deneme-teslim.png`; tablet `t-deneme-teslim.png`.
- **Çerçeve:** çözme ekranı arkada (`FocusHeader` örnek **0:12:40**, ilerleme 0,9), üstünde karartma `rgba(11,28,48,0.45)` ve `Sheet height=520` (üst köşeler 28, iç boşluk 10 20 34, boşluk 14, ortada 40 × 5 tutamaç). Sistemin gri penceresi kullanılmaz.
- **Yerleşim:**
  1. Ortalı (boşluk 8): `Tile module="exam" icon="checkCircle" size=52 solid` (gradyan, beyaz ikon); `section` 20 **Denemeyi teslim et?** / **Hand in the exam?**; `small` **Teslim edince cevaplar değişmez; sonuç ve çözümler hemen açılır.** / **Answers lock when you hand in; results open at once.**
  2. Üç sayı kutusu (satır, boşluk 8; her biri esnek, iç boşluk 10 0, köşe 16, `colors.line2`): `num` 24 değer ve `meta` etiket: **36** `colors.ink` **cevaplı** / **answered**; **4** `warningInk` **boş** / **blank**; **2** `mod.ink` **işaretli** / **flagged**.
  3. `meta` **Boş sorular** / **Blank questions**; altında numara kutuları (44 × 40, köşe 12, 1,5 `warning` kenar, `warningSoft` dolgu, `headline` `warningInk`). Sığmazsa alt satıra geçer; çok boş varsa ilk 24'ü ve **+N soru** / **+N questions**. Boş yoksa bu blok çizilmez.
  4. Esnek boşluk; altta satır (boşluk 10): `Button tone="ghost" size="lg"` esnek **Boşlara dön** / **Back to blanks** ve `Button tone="module" size="lg"` esnek **Teslim et** / **Hand in**.
- **Veri:** sayılar yerelden (cevaplanan, cevapsız, işaretli); tamamlama politikası `allowBlanks` değilse ve boş varsa **Teslim et** `disabled`, metin "Tüm soruları cevaplamadan deneme bitirilemez." (bugünkü kod metni; çizilmedi).
- **Etkileşimler:** §3.3. Boş numaraya dokunma → o soru. Karartmaya dokunma, aşağı çekme ya da geri → alt sayfa kapanır, çözme sürer (teslim sürerken kapanmaz). **Teslim et** → `loading` (dönen işaret, %80 opaklık), ikinci dokunuş yok sayılır.
- **Hâller:** teslim sürüyor: alt sayfa kilitli, düğme `loading`; hata: alt sayfada hata satırı ve **Tekrar dene**; süre bu sırada biterse otomatik teslim aynı isteği kullanır (çift `complete` gitmez).
- **Web farkı (`w-deneme-teslim`):** çözme sayfasının üstünde ortalı pencere (`Modal` 520 px, köşe 26, iç boşluk 26, boşluk 16, `UI_SHADOW.float`, aynı karartma). `Tile` 56; başlık `section` 21; açıklama **Teslim edince cevaplar değişmez; sonuç ve çözümler hemen açılır.** / **Answers lock; results open at once.** Sayılar örnek **116 / 4 / 2**. Boşlar tek satırda: `meta` **Boş:** / **Blank:** ve numara çipleri (iç boşluk 4 12, köşe 10, `headline` 14). Düğmeler aynı. Altta ortalı `meta` **Klavye: Enter teslim eder, Esc kapatır** / **Keyboard: Enter hands in, Esc closes**. Açılınca odak **Teslim et**'e değil pencerenin başlığına gelir; Tab yalnız pencerede döner.
- **Tablet (`t-deneme-teslim`):** klavyeli çözme ekranı (`t-deneme-klavye`) üstünde web penceresinin aynısı.
- **Kurallar:** teslimde çift gönderim yoktur (§5.3). Teslimden sonra çözme ekranına geri dönülmez.

### 4.9 Ara ver penceresi (çizilmedi)

- Mobil `Sheet` (UIUX-Rehberi §4 kalıbı) ya da web `Modal`. Başlık: "Ara vermek istiyor musun?" (doğrulanmadı), açıklama: detay ekranındaki kural cümlesi **Çıkarsan kaldığın yerden devam edersin; süre arka planda işler.** / **Leave and resume later; the timer keeps running.**
- Düğmeler (Navigasyon §4): **Devam et** (birincil, `mod.action`) ve **Ara ver, sonra devam ederim** (ghost). Bekleyen cevap varsa sayısı küçük satırda.
- Ara ver → Denemelerim [replace]; deneme "Devam eden" sekmesinde.

### 4.10 Tablet çözme ekranları (kısa)

Ayrıntı ve kalem kuralları: [Tablet-Kalem.md](../Tablet-Kalem.md) §2, §3, §6. Tuval 1194 × 834 (yatay), dikey 834 × 1194. Hepsinde üstte `SolveBar` (64 pt): `x` 40 pt, `meta` bölüm + `headline` 16 deneme adı, ortada `TimerProgress` (260 pt: `clock` 16 `mod.ink`, süre `headline` 16, `meta` **kaldı** / **left**, altında 5 pt ilerleme), kalemli tablette **Taslak kâğıdı** / **Scratchpad** (`notebook`) ve **Soruya yaz** / **Write on question** (`pen`) geçiş düğmeleri (açıkken `mod.soft` + `mod.line`), sağda `Button sm` **Bitir** / **Finish**. Soru kartı köşe 26, iç boşluk 22 26; soru `body` 19 / 600, satır 30.

- `t-deneme-coz-taslak`: soru solda (esnek), taslak kâğıdı sağda 454 pt (%38); kalem araç çubuğu kâğıdın sağ üst kenarında dikey; kâğıdın sol altında **Taslak bu soruya kayıtlı** / **Saved with this question**. Soru kartının altında `SolveFoot`: ghost `left`, ortada soru şeridi (`QuestionStrip`, 34 pt kutular: boş, cevaplı `mod.soft`, şu anki `mod.action`, işaretli `warningSoft`, notlu soruda kalem rozeti), **Boş bırak** (soft), **Sonraki**.
- `t-deneme-coz-isaretleme`: araç çubuğu solda dikey (fosforlu kalem, sarı, kalın); soru kartında metin + 200 pt kesikli çizgili kenar notu sütunu; şıklar kalemle elenir (üstü çizili, %55 soluk), seçilen şık daire içinde, kararsızda "?". Üstte `meta` **Soruya yazıyorsun · sayfa kalemle kaymaz, parmakla kayar** / **Writing on the question · the pencil draws, a finger scrolls**. Cevap yine dokunarak verilir; kalemle daire cevap sayılmaz.
- `t-deneme-coz-dikey`: `SolveBar compact` (geçiş düğmeleri etiketsiz); şıklar 3 kolon; **Boş bırak** yok; taslak alt yarıda (üstte 48 × 5 tutamaç); parmakla çizim açık olduğu için araç çubuğunda **Kaydır / Çiz** anahtarı.
- `t-deneme-klavye`: kalem düğmesi yok; sağda **Klavye bağlı** / **Keyboard on** (`outline`, `language`) ve **Bitir**. Soru paneli + 330 pt soru haritası paneli (köşe 26, iç boşluk 20 22): **Soru haritası** / **Question map**, **18 cevaplı · 2 işaretli** / **18 answered · 2 flagged**, `over` `mod.ink` **Temel Matematik · 1–40**, 5 kolon (boşluk 8) numara kutuları, altta renk açıklaması **cevaplı** / **işaretli** / **boş**. Soru panelinin altında kısayol kutusu (`line2`, köşe 16): `A – E` **cevapla** / **answer**, `← →` **önceki / sonraki** / **prev / next**, `İ` **işaretle** / **flag**, `⌫` **cevabı sil** / **clear**, `⌘ /` **tüm kısayollar** / **all shortcuts**. Tuş kapakları 24 pt, alt kenar 2,5.
- `t-deneme-kalem-ipucu`: kalemli tablette ilk çözümde bir kez; **Soruya yaz** düğmesinin çevresi delikli karartma (`rgba(11,28,48,0.62)`), altında 440 pt kart: `over` `mod.ink` **İpucu** / **Tip**, `section` **Kalemle doğrudan soruya yaz** / **Write straight on the question**, `body` **Altını çiz, şıkları ele, kenara not al. Kalem çizer, parmağın sayfayı kaydırır. İşlem için Taslak kâğıdı yanda açılır.**, `Button sm` **Anladım** / **Got it**. Süre bu sırada işler; ipucu sayaç başlamadan önce (ilk soru açılırken) gösterilir.
- `t-deneme-cozum-notlar`: çözümlerde `SolveBar pen={false}`, başlık **TYT Deneme 5 · Çözümler**, ortada soru şeridi, sağda `RoundButton eye` **Notlarım** / **My notes** (açık). Solda soru, `Chip success` **Doğru** / **Correct**, öğrencinin işaretleri %60 soluk ve salt okunur; altta `pen` + **Çözerken yaptığın işaretler burada salt okunur. Silmek ya da düzenlemek için soruyu tekrar çöz.** + `Toggle`. Sağda 454 pt: çözüm kartı (`over` `mod.ink` **Çözüm**, `body` çözüm, `small` **Doğru cevap B. Bu soruyu adayların %58’i doğru yaptı.**) ve **Taslağın** / **Your scratchpad** · **salt okunur** kâğıdı (380 pt).
- Notlar API'si: `student/notes` (Tablet-Kalem §4).

### 4.11 `m-deneme-denemelerim` Denemelerim · web: `w-deneme-denemelerim`, `w-sinav-takvimi`

- **Görseller:** `acik/mobil/m-deneme-denemelerim.png`, koyu, EN; web `w-deneme-denemelerim.png`, `w-sinav-takvimi.png`.
- **Çerçeve:** `AppHeader` varsayılan. Sekme çubuğu, aktif yuva 2. Yıkama var.
- **Yerleşim:**
  1. `PageTitle module="exam"` **Denemelerim** / **My exams**.
  2. `Segmented module="exam"` (hap, 4 iç boşluk, `line2` zemin; seçili `colors.card` + `mod.ink`, 34 yükseklik, 13 / 700): **Yaklaşan · 2** / **Upcoming · 2**, **Devam eden · 1** / **Active · 1**, **Biten · 6** / **Done · 6**. Açılışta devam eden varsa o sekme seçilir, yoksa Yaklaşan.
  3. `List`, satır (iç boşluk 12 14, boşluk 12): tarih kutusu 44 × 50, köşe 14, `mod.soft` dolgu: gün `headline` 17 `mod.ink` (**17**), ay `meta` 10 / 800 `mod.ink` (**EKİ** / **OCT**); metin: `headline` ad, `small` **Cumartesi · 10:00** / **Saturday · 10:00**; sağda çip: kurulu hatırlatmada `Chip success check sm` **Hatırlatma açık** / **Reminder on**, değilse `Chip outline bell sm` **Hatırlat** / **Remind me**.
  4. `SectionTitle` **Takvim** / **Calendar**, alt satır **Ekim 2026** / **October 2026**.
  5. Takvim kartı `Card` iç boşluk 14: bir haftalık şerit, 7 gün (40 pt genişlik, iç boşluk 6 0, köşe 12): `meta` gün harfi (**P S Ç P C C P**; EN çizimde Türkçe harfler kalmış, §7), `headline` gün; denemeli gün `mod.color` dolgu ve beyaz yazı.
- **Sekme içerikleri:** Devam eden satırında sağda `Button module sm` **Devam** (kalan süre alt satırda); Biten satırında sağda net (`section` `mod.ink`) ve satır `m-deneme-detay-bitti`'yi açar. Geçmiş aylar listesi bu sekmenin altındadır → `m-deneme-ay`.
- **Veri:** `student/exams/month`; hatırlatmalar `student/engagement`.
- **Etkileşimler:** segment → liste değişir (istek yok); satır → `m-deneme-detay` / `-detay-bitti` [push]; **Hatırlat** çipi → §3.1, çip yerinde değişir; takvimde denemeli güne dokunma → o günün denemesi; hafta şeridi yatay kayar.
- **Hâller:** sekme boşsa satır yerine tek cümle ve eylem: Yaklaşan boş "Bu ay yeni deneme yok" (doğrulanmadı), Biten boş → **Sonuçlar**'daki boş hâl dili.
- **Web farkı (`w-deneme-denemelerim`):** `ModuleHead tab=1`, alt satır **Yaklaşan, devam eden ve biten denemelerin; takvim burada** / **Upcoming, active and finished; the calendar lives here**. İki kolon `1fr 1.1fr`: solda segment ve liste (tarih kutusu 52 × 56, köşe 16, gün `section` `mod.color`, ay 10,5; alt satır **Cumartesi 10:00 · Türkiye geneli**); sağda `WCard` **Ekim 2026** aylık takvim: 7 kolon, boşluk 6, gün hücresi 46 yükseklik, köşe 12; bugün `colors.ink` dolgu / `colors.bg` yazı; denemeli gün `mod.soft` dolgu ve altında 6 px `mod.color` nokta; ay dışı günler `muted`.
- **`w-sinav-takvimi` Sınav takvimi:** `ModuleHead tab=0`, başlık **Sınav takvimi** / **Exam calendar**, alt satır **Hedef sınavın ve öteki resmî sınavlar; tarihler ÖSYM duyurusuyla güncellenir.** / **Your target exam and other official exams.** İki kolon `1.4fr 1fr`: solda `WCard` **Sınavlar** / **Exams**: satırlar (40 modül kutusu `calendar`, ad **YKS · TYT**, tarih **Haziran 2027 · Cumartesi**, sağda `section` kalan gün **245** + `meta` **gün** / **days**; hedef sınavın sayısı `mod.ink`, diğerleri `ink`); sağda `WCard` **Bu ay Sınavika denemeleri** / **Sınavika exams this month**: `EntryRow` satırları (ilki `strong`). Veri: resmî sınav tarihleri (API'de doğrulanmalı) ve `student/exams/month`.
- **Kurallar:** takvim ayrı menü değildir; Denemelerim sekmesindedir (Adlandirma-Kurallari). ÖABT, AGS, ALES, DHBT gösterilmez.

### 4.12 `m-deneme-ay` Geçmiş ay

- **Görseller:** `acik/mobil/m-deneme-ay.png`, koyu, EN.
- **Çerçeve:** `AppHeader left="back"`, başlık ay adı **Ekim 2026** / **October 2026**. Sekme çubuğu, aktif yuva 2. Yıkama var.
- **Yerleşim (boşluk 12):**
  1. Özet `Card tone="module"` iç boşluk 14: `headline` **3 / 4 deneme · ortalama 44,25 net** / **3 / 4 exams · avg 44.25**; `small` **Ay kapandı; sıralamalar kesinleşti.** / **Month closed; ranks are final.**
  2. Her deneme ayrı `Card` (iç boşluk 14, boşluk 10, kartlar arası 10): satır: `Tile module="exam"` 40; ad (`headline`, örn. **TYT Genel Deneme**) ve tür (`small` **Genel deneme · 120 soru** / **General · 120 q**, **Bölüm denemesi · 40 soru**); sağda net (`section` `mod.ink` **78,5** + `meta` **net**) ya da kaçırılan için `Chip outline sm` **Kaçırıldı** / **Missed**.
     - Girilen: altında iki `Button moduleSoft sm` esnek **Sonuç** / **Result** ve **Çözümler** / **Solutions**.
     - Kaçırılan: `small` `colors.muted` **Çözümleri yine açık: konuları görmek için dokun.** / **Solutions are still open.**
- **Veri:** `GET student/exams/month?year&month`.
- **Etkileşimler:** Sonuç → `m-deneme-sonuc` / belge [push]; Çözümler → `m-deneme-cozum`; kaçırılan kart → kitapçık (çözümler cevapsız gösterilir).
- **Hâller:** ay boşsa "Bu ay deneme yoktu" (doğrulanmadı).

### 4.13 `m-deneme-sonuclar` Sonuçlar · web: `w-deneme-sonuclar` · tablet: `t-deneme-sonuclar`

- **Görseller:** `acik/mobil/m-deneme-sonuclar.png`, koyu, EN; web, tablet aynı adla.
- **Çerçeve:** `AppHeader` varsayılan. Sekme çubuğu, aktif yuva 4. Yıkama var.
- **Yerleşim (boşluk 12):**
  1. `PageTitle module="exam"` **Sonuçlar** / **Results**; sağda `Chip outline info` **Nasıl hesaplanır?** / **How it works**.
  2. Net kartı `Card` iç boşluk 16, boşluk 12:
     - Üst satır: `headline` 16 **TYT net gelişimim** / **My TYT nets** ve `small` **Son 5 deneme · çizgili: dışarıda çözdüğün** / **Last 5 · hatched: solved elsewhere**; sağda 112 pt `Segmented` **TYT** · **AYT**.
     - `NetBars` (yükseklik 150, en büyük değer 120): %25, %50, %75, %100'de kesikli `colors.line` çizgiler; her sütun esnek, aralık 10, köşe 14 14 6 6, en az 30 yükseklik; Sınavika denemesi `mod.color → mod.action` dikey gradyan ve üstte beyaz değer (`headline` 13,5, TR `84,25`, EN `84.25`); dışarıda çözülen 135° çizgili (`mod.soft` / `mod.track`, 6 px) ve değer `mod.ink`. Altında etiketler `meta` 12: **D2** / **E2**, **D3**, **Yayın** / **Pub.**, **D4**, **D5**.
     - Başarı şeridi (iç boşluk 8 12, köşe 14, `successSoft`): `trend` 16 `successInk` + `small` 700 **Son 4 denemede +20,25 net** / **+20.25 nets over the last 4**. Düşüşte şerit nötr (`line2`, `ink2`) ve "−" ile; kırmızı kullanılmaz (doğrulanmadı: çizilmedi).
  3. `FitList` (boşluk 8) üç `EntryRow` (iç boşluk 14 16, köşe 20, 42 kutu, `headline` 15,5, sağda ok): **Sınavika denemelerim** / **My Sınavika exams** · **6 deneme · sonuç belgeleri** (`strong`: `mod.wash` dolgu, `mod.line` kenar, dolu gradyan kutu); **Analizlerim** / **My analyses** · **Net kaybettiğin konular** / **Topics that cost nets** (`chart`); **Deneme ekle** / **Add an exam** · **Dışarıda çözdüğün denemenin sonucu** / **A result from another exam** (`plus`).
  4. `SectionTitle` **Son sonuçlar** / **Latest results**, **Tümü** / **All**.
  5. `List` satırları `ListRow`: ad, `small` **19 Ekim · sıralama 6.870** / **19 Oct · rank 6,870**; sağda `headline` 16 net **84,25** ve altında `meta` `successInk` fark **+5,75**.
- **Veri:** sütunlar `StudentScoringExam/result-cards` + `student/external-exams` (son 5, seçili sınav türüne göre); satırlar `result-cards`. Fark = bir önceki aynı tür denemeye göre.
- **Etkileşimler:** TYT/AYT segmenti → grafik değişir; sütuna dokunma → o denemenin sonucu (dışarıdakine dokunma → bilgi alt sayfası; doğrulanmadı); **Nasıl hesaplanır?** → alt sayfa (net = doğru − yanlış/4, puan ve sıralama notu; içerik çizilmedi); Sınavika denemelerim → sonuç listesi [push]; Analizlerim → `m-deneme-analiz` [push]; Deneme ekle → `m-deneme-ekle` [modal]; satır → `m-deneme-sonuc` [push]; Tümü → sonuç listesi.
- **Hâller:** boş → `m-deneme-sonuclar-bos` (§4.14); sonuç hazırlanıyor satırında net yerine `LoadingLogo` küçük ve "Hazırlanıyor".
- **Web farkı (`w-deneme-sonuclar`):** `ModuleHead tab=2`, alt satır **Netlerin, sıralaman ve gelişimin** / **Your nets, rank and progress**. İki kolon `1.6fr 1fr`: solda `WCard` içinde aynı başlık, 130 px segment, `NetBars height=200`, etiketler **Deneme 2** / **Exam 2** … ; sağda üç `EntryRow` (boşluk 12; üçüncünün alt satırı **Dışarıda çözdüğün** / **Solved elsewhere**) ve başarı şeridi. Altta `WCard` **Son sonuçlar** tablosu: başlık satırı `line2` zemin, 13 / 700 `muted`: **Deneme · Tarih · Net · Sıralama · Değişim** / **Exam · Date · Net · Rank · Change**; hücre iç boşluk 10 8, alt çizgi `line2`; ad 15 / 700, net 15 / 800, fark `successInk` "↗ +5,75"; son kolonda `Button moduleSoft sm` **Analiz** / **Analysis**. Dışarıda çözülen satır listede yer alır (sıralama "—", fark boş).
- **Tablet:** web sayfası; tablo iki satırla sınırlı (kısa ekran), grafik alçak.

### 4.14 `m-deneme-sonuclar-bos` Sonuçlar · henüz deneme yok · web: `w-deneme-sonuclar-bos` · tablet: `t-deneme-sonuclar-bos`

- **Görseller:** `acik/mobil/m-deneme-sonuclar-bos.png` ve diğerleri.
- **Çerçeve:** `m-deneme-sonuclar` ile aynı.
- **Yerleşim:**
  1. `PageTitle` **Sonuçlar**.
  2. `StateBlock module="exam" icon="chart"` (köşe 24, iç boşluk 22 18 20, ortalı): 64 pt kutu (`mod.soft`, ikon 30 `mod.color`); `section` 18 **İlk denemenden sonra burada** / **Here after your first exam**; `body` 15/22 **Netin, sıralaman ve net kaybettiğin konular her denemeden sonra burada birikir.** / **Your nets, rank and the topics that cost you collect here after each exam.**; `Button module block` **Sıradaki denemeye bak** / **See the next exam**; altında `small` 700 `mod.ink` bağlantı **Dışarıda çözdüğün bir denemeyi ekle** / **Add an exam you solved elsewhere**.
  3. Sıradaki deneme kartı `Card tone="module"` iç boşluk 14: `Tile solid` 42; **TYT Deneme 5** ve **Cumartesi 10:00 · 12.480 kişi** / **Saturday 10:00 · 12,480 joined**; `Button module sm` **Hatırlat** / **Remind**.
- **Etkileşimler:** Sıradaki denemeye bak → `m-deneme-detay`; bağlantı → `m-deneme-ekle`; Hatırlat → §3.1.
- **Web farkı:** iki kolon `1.6fr 1fr`: solda `StateBlock`, sağda iki `EntryRow` (sıradaki deneme `strong`, **Deneme ekle**).
- **Kurallar:** sıfır net, boş grafik ya da "0" gösterilmez.

### 4.15 `m-deneme-ekle` Deneme ekle · web: `w-deneme-ekle` · tablet: `t-deneme-ekle`

- **Görseller:** `acik/mobil/m-deneme-ekle.png`, koyu, EN; web, tablet aynı adla.
- **Çerçeve:** `AppHeader left="close"` (`x`), başlık **Deneme ekle** / **Add an exam**. Sekme çubuğu yok. Yıkama var. `BottomBar`.
- **Yerleşim (boşluk 12):**
  1. `small` **Dışarıda çözdüğün denemenin sonucunu gir; net gelişimine ve Ders Planı’na eklenir.** / **Enter a result from another exam; it joins your trend and plan.**
  2. Sınav türü çipleri (birden çok seçenek varsa; bugünkü kodda var, çizimde yok).
  3. `Field` (etiket `small` 700 `ink2`, kutu 50 yükseklik, köşe 16, 1,5 kenar, yazı 16): **Yayın** / **Publisher** (`book` ikonu; örnek **Örnek Yayınları**).
  4. Yan yana iki alan (boşluk 10): **Deneme** / **Exam** (örn. **TYT 3**) ve **Tarih** / **Date** (`calendar`, örn. **2 Kasım**; tarih seçici, ileri tarih seçilemez).
  5. Ders tablosu `Card` iç boşluk 14, boşluk 10: başlık satırı `meta`: **Ders** / **Subject** (esnek), **Doğru** / **Right** (52), **Yanlış** / **Wrong** (52), **Net** (48, sağa). Her ders satırı: ad `headline` 14,5 ve altında `meta` **40 soru** / **40 q**; iki sayı kutusu 52 × 40, köşe 12, 1,5 `line` kenar, `card` dolgu, `headline` 16 eşit genişlikli rakam (doğru `successInk`, yanlış `errorInk`); net `headline` 15 `mod.ink` (TR `30,75`). Alt çizgiden sonra `headline` **Toplam net** / **Total net** ve `section` `mod.ink` **68,5**.
  6. `BottomBar`: `Button module lg block` **Kaydet** / **Save**.
- **Veri:** `GET student/external-exams/options` (sınav türleri, dersler, soru sayıları), kayıt `POST student/external-exams` (tür, yayın, ad, tarih, ders ders doğru/yanlış). Liste `GET student/external-exams`.
- **Etkileşimler:** sayı kutuları sayısal klavye açar; doğru + yanlış soru sayısını aşarsa değer sınırlanır ve alanın altında "En çok 40 soru" (doğrulanmadı); net ve toplam her tuşta hesaplanır. **Kaydet**: ad ve en az bir sayı girilmeden pasif; basınca `loading`. `x` → §3.5 adım 6.
- **Hâller:** seçenekler yükleniyor → tablo yerinde `LoadingLogo`; seçenek gelmezse "Tekrar dene"; kayıt hatası kısa bildirim.
- **Web farkı (`w-deneme-ekle`):** Sonuçlar sayfası arkada, 600 px `Modal`: başlık satırı `section` 21 **Deneme ekle** ve sağda `x` 22; açıklama; üç alan tek satırda (`1.4fr 1fr 1fr`: Yayın, Deneme, Tarih); ders satırları (ad + soru sayısı tek metin **Türkçe · 40**; kutular 64 × 40); alt satır: `headline` **Toplam net: 68,5** / **Total net: 68.5** ve sağda `Button module` **Kaydet**. Esc kapatır; Enter formu gönderir.
- **Kurallar:** net TR virgüllü (`68,5`), EN noktalı (`68.5`). Dışarıdaki deneme sıralama almaz; grafikte çizgili, tabloda "—".

### 4.16 `m-deneme-sonuc` Sonuç · web: `w-deneme-sonuc`

- **Görseller:** `acik/mobil/m-deneme-sonuc.png`, koyu, EN; web `w-deneme-sonuc.png`.
- **Çerçeve:** `AppHeader left="back"`, başlık deneme adı (**TYT Deneme 4**). Sekme çubuğu, aktif yuva 4. Yıkama var.
- **Yerleşim (boşluk 12):**
  1. Sonuç kartı `Card` iç boşluk 18:
     - Satır (boşluk 16): `Ring` 104, kalınlık 10, `mod.color`; ortada `num` 28 **78,5** ve `meta` **net**. Sağda (boşluk 6): `Chip success trend` **+6,5 net** / **+6.5**; `small` **TYT puanın** / **TYT score** **362,4** (kalın, `ink`); `small` **Sıralaman** / **Rank** **8.214** / 12.480.
     - Ders çubukları (üst boşluk 16, aralık 10): her ders: üst satır `small` 700 `ink` ad ve sağda `small` **32,5 / 40**; altında `Bar` (8 pt, dersin rengi, iz `line2`).
  2. `Card moduleLine` iç boşluk 14: `Tile` 40 `target`; `headline` **En çok net kaybettiğin 3 konu** / **Your 3 costliest topics**; `small` **Problemler, Paragraf, Kuvvet ve hareket**; sağda ok → `m-deneme-analiz`.
  3. İki `Button moduleSoft` esnek: `checkCircle` **Çözümler** / **Solutions**, `file` **Sonuç belgesi** / **Report**.
- **Veri:** `result-document` / `result-cards`: net, fark, puan, sıralama, katılımcı, ders ders net / soru. Puan "ÖSYM puanı değildir" notu belge sayfasında (Paylasim-Kartlari kuralı; mobil bugünkü kodda `ExamResultCohortDisclaimer`).
- **Sonuç belgesi:** ayrı çizimi yok. Bugünkü belge (`ExamResultDocumentScreen`: marka başlığı, oturum D/Y tablosu, toplamlar, puan ve sıralama tabloları, kitle notu, performans özeti) içerik olarak kalır; çerçeve bu modülün kurallarıyla (geri, başlık, modül rengi). Paylaş düğmesi paylaşım kartını açar.
- **Web farkı (`w-deneme-sonuc`):** `Panel crumb="Sonuçlar ›"`; `ModuleHead tab=2` başlık deneme adı, alt satır **12 Ekim · Türkiye geneli · 12.480 katılımcı**; sağda `ghost chart` **Karşılaştır** / **Compare** ve `moduleSoft checkCircle` **Çözümler**. İki kolon `1fr 1.4fr`:
  - Sol: `Card` iç boşluk 20: 120 halka (kalınlık 11), `num` 30 **78,5**; sağda çip **+6,5 net**, `small` 14 **TYT puanın 362,4**, **Türkiye sıralaman** / **National rank** **8.214**. Altında `WCard` **Derslere göre** / **By subject**: ders çubukları (ad: **Türkçe, Sosyal Bilimler, Temel Matematik, Fen Bilimleri**).
  - Sağ: `WCard` **Net kaybettiğin konular** / **Where you lost points**, başlık eylemi **+ Bu hafta planıma ekle** / **+ Add to this week**; içinde `Card module` ipucu (`sparkles` 18 `mod.color` + `small` `ink2` **Bu 3 konuyu bu hafta çalışırsan yaklaşık 5 net kazanabilirsin.** / **Study these 3 this week to gain about 5 points.**); liste satırları (iç boşluk 12 14): ad + `small` **Matematik · D/Y/B 4 / 9 / 2**, 90 px `headline` `errorInk` **−3,25 net**, `Chip module="lessons" book sm` **Ders** / **Lesson**, `Chip module="tests" quiz sm` **Test** / **Quiz**. Beş satır örneği: Problemler, Paragraf, Kuvvet ve hareket, Osmanlı kültür ve medeniyeti, Hücre.
- **Kurallar:** web ve mobil aynı sırayı verir: net → puan → sıralama → derslere göre → konular ve eylem.

### 4.17 `m-deneme-analiz` Eksik konu analizi

- **Görseller:** `acik/mobil/m-deneme-analiz.png`, koyu, EN.
- **Çerçeve:** `AppHeader left="back"`, başlık **Eksik konu analizi** / **Gap analysis**. Sekme çubuğu, aktif yuva 4.
- **Yerleşim (boşluk 12):**
  1. `Card tone="module"` iç boşluk 14: `sparkles` 20 `mod.color` ve `small` `ink2` **Bu 3 konuyu bu hafta çalışırsan yaklaşık 5 net kazanabilirsin.** / **Study these 3 this week and gain about 5 points.**
  2. `List`, her satır iç boşluk 14, üste hizalı: sıra kutusu 28 × 28, köşe 9, `errorSoft`, `headline` 13 `errorInk` (**1**); içerik (boşluk 6): üst satır ad (`headline`, **Problemler** / **Problems**) ve sağda `headline` `errorInk` **−3,25 net**; `small` **Matematik · yüzde ve oran** / **Maths · ratios**; çip satırı (boşluk 6): `Chip module="lessons" book sm` **Mikro ders** / **Micro-lesson**, `Chip module="tests" quiz sm` **20 soru** / **20 questions**.
  3. `Button size="lg" block icon="plus"` **Bu hafta planıma ekle** / **Add to this week’s plan** (çizimde birincil düğme; modül içinde `mod.action` dolgu).
- **Veri:** `student/statistics/exams/{examAttemptId}` (konu, ders, kaybedilen net, D/Y/B); "kazanabilirsin" tahmini: API'de doğrulanmalı (yoksa cümle gösterilmez). Mikro ders hedefi: konu → Dersler mikro ders eşlemesi (`lessonMikroId → workMikroId`, UIUX-Gecmis §7 açık soru). Test hedefi: Testler konu testi; yoksa çip pasif ve "Bu konunun testi henüz yok."
- **Etkileşimler:** Mikro ders → Dersler mikro ders [push, modül değişimi]; 20 soru → Testler test başlangıcı; planıma ekle → `POST` study-plan `tasks` (konu başına görev; kaynak `ReasonCode` deneme analizi), `loading`, başarıda düğme `success` görünümünde **Planına eklendi** (doğrulanmadı) ve kısa bildirim; ikinci basış yeni görev açmaz.
- **Hâller:** işleniyor (202) → `LoadingLogo` ve "Analizin hazırlanıyor"; kayıp konu yoksa `StateBlock tone="success"` "Bu denemede net kaybettiren konu yok" (doğrulanmadı).
- **Kurallar:** analiz eylemle biter (UIUX-Rehberi §5.4). Çip renkleri hedef modülün rengidir.

### 4.18 `m-deneme-gelisim` Ders gelişimi

- **Görseller:** `acik/mobil/m-deneme-gelisim.png`, koyu, EN.
- **Çerçeve:** `AppHeader left="back"`, **Ders gelişimi** / **Subject progress**. Sekme çubuğu, yuva 4.
- **Yerleşim:**
  1. `Segmented module="exam"` dersler: **Türkçe**, **Matematik** (seçili), **Fen**, **Sosyal**.
  2. `Card` iç boşluk 16: satır `meta` **Son net** / **Latest** + `num` **21,75**; sağda `Chip success trend` **+5,5 · 4 denemede** / **+5.5 · 4 exams**. Altında `Sparkline` (318 × 120, alan dolgulu, son noktada nokta). Çizgi rengi çizimde Testler rengi (`#4F46E5`).
  3. `SectionTitle` **Konulara göre** / **By topic**.
  4. `List` satırları (iç boşluk 12 14): ad `headline` 130 pt genişlik; `Bar` (8 pt; %50 altı `colors.error`, üstü Testler rengi); sağda `small` 700 yüzde **%36** / **36%**.
- **Veri:** `GET student/statistics/lessons/{levelKind}/{scopeId}` (mobil bugünkü kod), ders net geçmişi ve konu başarıları.
- **Etkileşimler:** segment → ders değişir; konu satırı → `m-deneme-net` ya da konu için Dersler/Testler eylemleri (çizilmedi).

### 4.19 `m-deneme-net` Deneme neti

- **Görseller:** `acik/mobil/m-deneme-net.png`, koyu, EN.
- **Çerçeve:** `AppHeader left="back"`, **Deneme neti** / **Exam net**. Sekme çubuğu, yuva 4.
- **Yerleşim (boşluk 12):**
  1. `Card tone="module"` iç boşluk 16: `meta` **TYT Deneme 4 · toplam net** / **TYT Exam 4 · total net**, `num` 32 **79,25**; sağda `Chip success trend` **+6,75 net**.
  2. Tablo `Card` iç boşluk 14: başlık `meta` **Ders** / **Subject**, **D**, **Y**, **B** (her biri 34 pt, ortalı), **Net** (50, sağa); satırlar: ad `headline` 14,5; D `successInk`, Y `errorInk`, B `ink2` (`small`); net `headline` 15 `mod.ink`. Örnek: Türkçe 34/4/2 → 33.
  3. `SectionTitle` **Net kaybettiğin konular**.
  4. `List` satırları: ad + `small` **D/Y/B 3/3/2 · −3,75 net**; sağda `Button moduleSoft module="lessons" sm` **Konuyu çalış** / **Study** ve `Button moduleSoft module="tests" sm` **Test** / **Quiz**.
- **Veri:** `GET student/statistics/exams/{examAttemptId}?includeMikro=`.
- **Etkileşimler:** Konuyu çalış → Dersler konu; Test → Testler konu testi.

### 4.20 `m-deneme-cozumler` Çözümler · web: `w-deneme-cozum-liste`

- **Görseller:** `acik/mobil/m-deneme-cozumler.png`, koyu, EN; web `w-deneme-cozum-liste.png`.
- **Çerçeve:** `AppHeader left="back"`, **Çözümler** / **Solutions**. Sekme çubuğu, yuva 4.
- **Yerleşim (boşluk 12):**
  1. `Segmented module="exam"`: **Tümü** / **All**, **Yanlışlar · 12** / **Wrong · 12** (açılışta seçili), **Boşlar · 3** / **Blank · 3**.
  2. Soru haritası `Card` iç boşluk 14: `over` **Temel Matematik · soru haritası** / **Basic Maths · question map**; 8 kolon ızgara, boşluk 6, kutu 32 yükseklik, köşe 9: doğru `successSoft` / `successInk`, yanlış `errorSoft` / `errorInk`, boş `line2` / `muted`; seçili soru 2 px `ink` dış çizgi. Numara `meta` 800. Bölüm başına bir ızgara.
  3. `List`: `ListRow module="exam" icon="playCircle"` **Soru 46 · Problemler** / **Q46 · Problems**, `small` **Senin cevabın A · doğru B** / **You: A · correct: B**.
- **Veri:** `GET StudentQuestionSolution/review/{examAttemptId}`; deneme listesi `GET StudentQuestionSolution/cards`.
- **Etkileşimler:** segment süzer; kutu ya da satır → `m-deneme-cozum` [push, odak], seçili süzgeç kitapçığa taşınır.
- **Hâller:** çözümler hazırlanıyor → `LoadingLogo` ve "Çözümlerin hazırlanıyor" (bugün yoklama 20 × 3 sn); yanlış yoksa segmentte "Yanlışlar · 0" pasif.
- **Renk kuralı:** doğru yanlış burada yalnız teslimden sonra; renk yanında sayı ve sözcük vardır (yalnız renkle anlam verilmez; ekran okuyucu "46, yanlış").
- **Web farkı (`w-deneme-cozum-liste`):** `ModuleHead tab=2` **Soru çözümleri** / **Solutions**, alt satır **Girdiğin denemelerin soruları, cevapların ve çözümleri** / **Questions, your answers and solutions**; tek `WCard`, satırlar (40 kutu `checkCircle`, ad, `small` **19 Ekim · 12 yanlış, 6 boş** / **19 Oct · 12 wrong, 6 blank**, sağda `moduleSoft sm` **Yanlışlarım** / **My mistakes**), satır ayırıcı `line2`.

### 4.21 `m-deneme-cozum` Soru çözümü · web: `w-deneme-cozumler` · tablet: `t-deneme-cozum-notlar` (§4.10)

- **Görseller:** `acik/mobil/m-deneme-cozum.png`, koyu, EN; web `w-deneme-cozumler.png`.
- **Çerçeve:** odak; sekme çubuğu yok. `FocusHeader left="left"` (geri), `meta` **Çözümler · Matematik** / **Solutions · Maths**, `headline` **Soru 46** / **Question 46**; sağda 40 pt kart `bookmark` (soruyu kaydet; hedef çizilmedi, doğrulanmadı). `BottomBar border`.
- **Yerleşim (boşluk 12):**
  1. Çipler (boşluk 8): `Chip error x` **Senin cevabın: A** / **Yours: A**; `Chip success check` **Doğru: B** / **Correct: B**. Boşsa ilk çip `neutral` **Boş bıraktın** (doğrulanmadı).
  2. Soru `body` 600 `ink`.
  3. `OptionRow` yanlış (`errorSoft` dolgu, `error` kenar, kırmızı kutuda `x`) ve doğru (`successSoft`, `success` kenar, `#047857` kutuda `check`); diğer şıklar boşta.
  4. Çözüm `Card` iç boşluk 16: `section` 15 **Çözüm** / **Solution**, `body` çözüm metni (üst boşluk 6).
  5. İki düğme (boşluk 10): `Button moduleSoft playCircle` **Video çözüm** / **Video**; `Button tone="dark" sparkles` **SinoAI’ye sor** / **Ask SinoAI**.
  6. `BottomBar`: `ghost` `left` **45**, ortada `small` **Yalnız yanlışlar · 12** / **Wrong only · 12** (seçili süzgeç), `ghost` `right` **47**.
- **Veri:** `review/{examAttemptId}`: soru, şıklar, öğrencinin cevabı, doğru cevap, çözüm türü (metin, video, PDF, bağlantı), soru başarı oranı. Kalem notları `student/notes` (salt okunur).
- **Etkileşimler:** önceki / sonraki süzgece göre gezer; Video → oynatıcı (tam ekran ya da gömülü); **SinoAI’ye sor** → SinoAI tam ekran, soru ve öğrencinin cevabı bağlamla (09-SinoAI.md); geri → `m-deneme-cozumler`.
- **Web farkı (`w-deneme-cozumler`):** `Panel crumb="Sonuçlar ›"`; `ModuleHead tab=2` **Çözümler · TYT Deneme 4**, alt satır bölüm, sağda 320 px segment **Tümü · Yanlışlar · 12 · Boşlar**. İki kolon `240px 1fr`: solda `Card` **Soru haritası** (5 kolon, kutu 34, köşe 9, seçili 2,5 px `ink` çizgi); sağda bölünmüş kart: soru sütunu (iç boşluk 24, çipler **Soru 46**, yanlış, doğru; soru `body` 17/27; şıklar) ve 380 px çözüm sütunu: `section` **Çözüm**, `body` metin, `warningSoft` kutuda `small` `warningInk` **Sık hata: paydayı (toplamı) artırmayı unutmak.** / **Common mistake: forgetting the total grows too.**, 150 px video alanı (`#0B1220` zemin, `playCircle` 46 beyaz), `Button dark sparkles block` **SinoAI’ye bu soruyu sor** / **Ask SinoAI about this**. Klavye: ← → soru değiştirir.
- **Kurallar:** öğrencinin kalem işaretleri yalnız salt okunur; göster/gizle ayarı Profil'deki "Çözümlerde notlarımı göster"e uyar.

### 4.22 `m-istatistik` İstatistiklerim · web: `w-istatistik` · tablet: `t-istatistik-pano`

- **Görseller:** `acik/mobil/m-istatistik.png`, koyu, EN; web `w-istatistik.png`; tablet `t-istatistik-pano.png`.
- **Çerçeve:** Profil altı sayfa. `AppHeader left="back"`, **İstatistiklerim** / **My statistics**. Modül yok: yıkama yok (`colors.bg`), sekme çubuğu yok. Vurgu rengi marka (`useAccent`: `brand`, ikon kutuları `brandSoft`, yazı `brandDeep`).
- **Yerleşim (boşluk 12):**
  1. `Segmented` (modülsüz): **Bu hafta** / **This week** (seçili), **Son 30 gün** / **Last 30 days**, **Tümü** / **All**.
  2. Üç `KpiCard compact` (satır, boşluk 8; köşe 22, iç boşluk 12 14): etiket `small` 600 `ink2`, sağda 30 pt daire (`brandSoft`, ikon 15 `brandDeep`), değer `num` 22, fark hapı (iç boşluk 2 8, köşe 8, `successSoft`, `meta` 800 `successInk` "↗ %22"; düşüşte `errorSoft` / `errorInk` "↘"): **Çalışma** / **Study** `clock` **4 sa** / **4 h** ↗ %22; **Soru** / **Questions** `quiz` **176** ↗ %31; **Doğru** / **Accuracy** `target` **%62** / **62%** ↗ %6.
  3. `Card` iç boşluk 16: başlık `headline` 16 **Günlük çalışma** / **Daily study** ve `Chip success trend sm` **geçen haftadan +%22** / **+22% vs last week**; `StudyBars` (120 yükseklik): 7 gün (**P S Ç P C C P**), her sütun modüllere göre yığılı (alttan Dersler, Testler, Denemeler, Bilgi Kartları; renkler modül `color.light`), köşe 12, boş gün en az 6 pt `line2`; seçili gün (Perşembe) tam opak, diğerleri %35; seçili sütunun tepesinde 10 pt nokta (2,5 `ink` kenar); ipucu kutusu (en az 150, köşe 14, `float` gölge): `headline` 13,5 **Perşembe** / **Thursday**, satırlar `meta` **Planlanan** / **Planned** **90 dk**, **Çalışılan** / **Studied** **50 dk**. Altında renk açıklaması (9 pt kare, köşe 3, `meta` modül adı).
  4. `Card` iç boşluk 16: `headline` 16 **TYT net gelişimi** / **TYT net trend**, `small` **5 deneme** / **5 exams**; sağda `section` `moduleInk(exam)` **84,25**; `Sparkline` 318 × 70 Denemeler renginde.
  5. `Card` iç boşluk 16: **En verimli saatlerin** / **Your best hours** ve sağda `meta` **doğru oranına göre** / **by accuracy**; `StudyHeatmap` 7 gün × 8 saat dilimi (**06 09 12 15 18 20 22 24**), hücre yüksekliği 26 × 0,72, köşe 6; çalışılmamış `line2`, diğerleri vurgu rengi %18 + oran × %82 opaklık; gün etiketleri **Pzt…Paz** / **Mon…Sun** (34 pt). Altında `small` `ink2` **Hafta içi 18:00–20:00 en çok doğru yapıyorsun.** / **You are most accurate 18:00–20:00 on weekdays.**
  6. `SectionTitle` **Derslere göre** / **By subject**, **Tümü**.
  7. `Card` iç boşluk 14, satırlar (boşluk 12): ad `headline` ve sağda `small` **82 soru · %58 doğru · 1 sa 30 dk** / **82 q · 58% · 1 h 30 m**; altında `Bar` 6 pt (%50 altı `warning`, üstü `success`).
- **Veri:** `GET student/statistics/overview?period=`: süre, soru, doğru oranı ve farkları, günlük/haftalık modül dakikaları (`Modules`), planlanan vs çalışılan (study-plan günlük istatistik), net geçmişi, `BestHours`, ders ders soru / doğru / süre. Seri tablette ek KPI.
- **Etkileşimler:** dönem segmenti → yeniden yükler (içerik yerinde kalır, üstte küçük gösterge); sütuna dokunma → ipucu o güne taşınır; net kartı → Denemeler › Sonuçlar; ders satırı → `m-istatistik-ders` [push]; **Tümü** → tüm dersler.
- **Hâller:** ilk hafta → `m-istatistik-ilk`; hata yerinde "Tekrar dene"; deneme yoksa net kartı çizilmez (sıfır grafik yok).
- **Web farkı (`w-istatistik`):** `Panel active="stats"` (sol menü Hesap › İstatistiklerim aktif; modül yıkaması ve `ModuleHead` yok).
  - Başlık satırı: `title` 28 **İstatistiklerim**, `small` **Çalışma süren, doğru oranın, netlerin ve en verimli saatlerin tek yerde.** / **Your time, accuracy, nets and best hours in one place.**; sağda 300 px segment (çizimde **Son 30 gün** seçili; EN **30 days**) ve `ghost file` **PDF olarak al** / **Download PDF**.
  - Dört `KpiCard` (geniş: köşe 22, iç boşluk 16 18, değer `num` 28, 36 pt ikon dairesi, altında `meta` dönem): **Çalışma süresi** / **Study time** **19 sa 40 dk** ↗ %22 **geçen 30 güne göre** / **vs previous 30 days**; **Çözülen soru** / **Questions** **742** ↗ %31; **Doğru oranı** / **Accuracy** **%62** ↗ %6; **TYT net** **84,25** ↗ 5,75 **son denemeye göre** / **vs last exam**.
  - İki kolon `1.35fr 1fr`: `WCard` **Haftalık çalışma** / **Weekly study** · **modüllere göre** / **by module**: `StudyBars` 150, 5 hafta (**1. hf … Bu hf** / **W1 … Now**), seçili 3. hafta, ipucu **3. hafta**: **Planlanan 6 sa**, **Çalışılan 6 sa 5 dk**, **Deneme 2 sa 45 dk**. `WCard` **Nerede çalıştın?** / **Where did you study?**: `StudyDonut` 140 (halka kalınlığı 16, ortada `section` 22 **19 sa** + `meta` **toplam** / **total**; sağda açıklama: 10 pt kare, modül adı `small` `ink2`, yüzde `headline` 14).
  - İki kolon `1.35fr 1fr`: `WCard` **Derslere göre** · **Tümü**: tablo **Ders · Soru · Doğru · Süre · Değişim** / **Subject · Questions · Accuracy · Time · Change** (başlık `line2` zemin 13 / 700 `muted`; hücre 9 8, 14 pt; doğru kolonunda 90 px çubuk + yüzde; değişim `successInk` "↗ +%8" ya da `errorInk` "↘ −%3"). `WCard` **En verimli saatlerin** · **doğru oranına göre**: ısı haritası (hücre 24) ve **Hafta içi 18:00–20:00 arası en çok doğru yapıyorsun; plan zor dersleri bu saate koyar.** / **… the plan puts hard subjects there.**
- **Tablet (`t-istatistik-pano`):** web sayfasının kendisi; çubuklar 96, halka 110, ısı hücresi 19.
- **Kurallar:** yüzde TR `%62`, EN `62%`; sıfır değerler "0 dk" diye gösterilmez.

### 4.23 `m-istatistik-ilk` İstatistikler · ilk hafta

- **Görseller:** `acik/mobil/m-istatistik-ilk.png`, koyu, EN.
- **Çerçeve:** `m-istatistik` ile aynı.
- **Yerleşim (boşluk 12):**
  1. `Card tone="soft"` iç boşluk 18, boşluk 6: `over` **İlk haftan** / **Your first week**; `title` 21 **Grafiklerin ilk çalışmanla dolmaya başlar** / **Your charts fill in from your first session**; `small` **Bu üç adımdan sonra çalışma süren, doğru oranın ve net gelişimin burada.** / **After these three steps your time, accuracy and nets appear here.**; `Bar` 8 pt (1/3); `meta` **1 / 3 tamamlandı** / **1 / 3 done**.
  2. Üç adım kartı (iç boşluk 14, köşe 20, `card`, `line` kenar): `Tile` 42 modül rengi; başlık `headline` ve `small` alt satır; sağda `Button moduleSoft sm` hedef modül renginde. Biten adım %65 opak, başlığın üstü çizili, sağda `checkCircle` 22 `successInk`.
     - Dersler: **İlk mikro dersini bitir** / **Finish your first micro-lesson** · **Sözcükte Anlam · 4 dk** · (bitti).
     - Testler: **Bir test çöz** / **Solve a quiz** · **Temel Kavramlar · Kolay · 20 soru** · **Başla** / **Start**.
     - Denemeler: **İlk denemene katıl** / **Join your first exam** · **TYT Deneme 5 · Cumartesi 10:00** · **Hatırlat** / **Remind**.
- **Veri:** `engagement/today` ve istatistik özeti (ilk hafta = yeterli veri yok); adım hedefleri öneri uçlarından.
- **Etkileşimler:** her düğme hedef modülü açar; Hatırlat → §3.1 yerinde.
- **Kurallar:** sıfır duvarı yerine üç adım (UIUX-Rehberi §5.5). Veri geldikçe ilgili grafik açılır.

### 4.24 `m-istatistik-ders` İstatistikler · tek ders

- **Görseller:** `acik/mobil/m-istatistik-ders.png`, koyu, EN.
- **Çerçeve:** `AppHeader left="back"`, başlık ders adı (**Matematik** / **Maths**).
- **Yerleşim (boşluk 12):** `Segmented` (çizimde **Son 30 gün** seçili); üç `KpiCard compact`: **Çalışma** **2 sa 50** ↗ %14, **Soru** **164** (farksız), **Başarı** / **Success** **%60** ↗ %5; `SectionTitle` **Konular** / **Topics**; `Card` iç boşluk 14: konu satırları (ad `headline` + sağda yüzde `small` 700; `Bar` 6 pt, %50 altı `warning`; altında `meta` **64 soru · 1 sa 10 dk** / **64 q · 1 h 10 m**).
- **Veri:** `GET student/statistics/overview/lessons/{id}?period=`.
- **Etkileşimler:** segment → yeniden yükler; konu satırı → Dersler/Testler konu (çizilmedi).
- **Not:** KPI etiketi ana sayfada **Doğru**, burada **Başarı**; çizimde böyle.

---

## 5. Takılma ve kilitlenme önlemleri

### 5.1 Cevapların anında kaydı

- Şıkka dokunulduğu karede cevap cihazda saklanır (oturum kimliği + soru kimliği + şık + yerel zaman damgası), sonra sunucuya gönderilir. Ekran gönderimi beklemez; şık hemen seçili görünür.
- Saklama uygulama kapanınca da kalır (mobil: şifreli kalıcı depo; web: `localStorage` / IndexedDB, oturum kimliğiyle). Teslim başarılı olunca o oturumun kaydı silinir.
- Aynı soruya ikinci gönderim aynı değeri taşıyorsa tekrar güvenlidir (sunucu idempotent).
- Gönderilemeyen cevap seçimi geri almaz; kırmızı hata göstermez. Yalnız bekleyen sayısı artar (§4.7).

### 5.2 Ağ kopunca kuyruk

- Kuyruk sıralıdır; bağlantı gelince, uygulama öne gelince ve teslimden önce boşaltılır. Yeniden deneme artan bekleme ile (ör. 0,8 sn × 2ⁿ, en çok 25 sn) yapılır; sonsuz döngü yoktur.
- Ağ durumu değişince `m-deneme-baglanti` şeridi açılır/kapanır; şerit ekranı kaydırmaz, soru alanının üstünde sabit kalır.
- Web de aynı kuyruğu kullanır (bugün yok, §7).

### 5.3 Teslimde çift gönderim olmaması

- **Teslim et** basılınca: düğme `loading`, alt sayfa / pencere kapatılamaz, Enter tekrarları yok sayılır, yerel bir kilit (`finishLock`) ikinci `complete` çağrısını engeller.
- Süre bitince otomatik teslim aynı kilidi kullanır; elle teslimle aynı anda gelirse tek istek gider.
- `complete` ağ hatasında kuyruk boşaltılır ve aynı istek yeniden denenir; sunucu ikinci `complete`'i başarı sayar (idempotent). 409 (süre doldu / zaten teslim) hata gösterilmeden sonuç hâline geçer.
- Teslim süreci ilerleme katmanı gösterir (adımlar: cevaplar gönderiliyor → teslim ediliyor); 60 sn içinde bitmezse "Tekrar dene" çıkar, cevaplar kaybolmaz.

### 5.4 Süre ve arka plan

- Sayaç cihaz saatine değil sunucu saatine göre kurulur: `kalan = endsAtUtc − (şimdi + saatFarkı)`; saat farkı `serverTimeUtc`'den hesaplanır. Saniyede bir yeniden çizilir; ekran kapalıyken çizim durur, öne gelince yeniden hesaplanır.
- Arka plana geçiş ve geri dönüş denemeyi bozmaz: süre işler, cevaplar korunur, dönüşte `state` ile eşitlenir (§3.6). Süre arka plandayken biterse sunucu teslim eder; dönüşte sonuç hâli açılır.
- iOS canlı etkinlik ve Android kalıcı bildirimde kalan süre yerelde akar ([Saat-Bildirim.md](../Saat-Bildirim.md)); teslim edilince en çok 1 dk içinde kapanır.
- Süre bitince: cevaplar kilitlenir, gezinme durur, otomatik teslim (§5.3). Kullanıcıdan onay istenmez.

### 5.5 Geri tuşu ve modallar

- Çözme ekranında geri tuşu / kenar kaydırma / web Ara ver her zaman ara ver penceresini açar (Navigasyon §4). Pencere kapanabilir (Devam et, karartma, geri tuşu).
- Teslim alt sayfası teslim sürmüyorsa her yoldan kapanır. Web'de `beforeunload` tarayıcı uyarısı sekme kapatmayı korur.
- Teslimden sonra geri tuşu çözme ekranına dönmez.

### 5.6 Yükleme, zaman aşımı, uzun liste

- İlk yükleme `LoadingLogo`; okuma 25 sn, gönderim 60 sn zaman aşımı (README §7). Süre dolunca yerinde "Tekrar dene".
- Sonuç ve çözüm hazırlanırken yoklama sınırlıdır (bugün 20 × 3 sn mobil, ~2 dk web); sınır dolunca "Hazırlanıyor, birazdan tekrar bak" ve **Yenile**, sonsuz dönen gösterge yok.
- 120 soruluk harita ve çözüm listeleri sanal listeyle çizilir; harita kutusu 60 fps kaydırılır. Soru görselleri önceden (sonraki 2 soru) yüklenir.
- Deneme ekle formunda klavye alanı ve **Kaydet**'i kapatmaz.

---

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| D1 | görsel | ikisi | `m-deneme-vitrin`, `w-deneme-vitrin` | Örnek veriyle aç; TR/EN × açık/koyu | Dört PNG ile yerleşim, metin, renk aynı |
| D2 | e2e | ikisi | vitrin, detay | Yaklaşan denemede **Hatırlat** | `POST student/engagement` bir kez; düğme **Hatırlatma açık**; Denemelerim çipi aynı |
| D3 | birim | ikisi | detay | Açılışa 2 gün 4 saat, 5 saat, 40 dk kala | "2 gün 4 saat kaldı", "5 saat … kaldı", "40 dk kaldı"; sunucu saatiyle |
| D4 | bileşen | ikisi | `m-deneme-detay-bitti` | Biten deneme | "Denemeye gir" ve "Hatırlat" yok; sıra: sonuç, belge, çözümler, analiz, konular |
| D5 | e2e | ikisi | başlangıç → çözme | **Şimdi başla** | 3 sn sayaç; çözme açılır; geri ile başlangıca dönülmez |
| D6 | bileşen | ikisi | `m-deneme-coz` | Şık seç | Yalnız seçili görünüm (`mod.wash`, `mod.color` kenar); yeşil/kırmızı, tik/çarpı ve doğru/yanlış titreşimi yok |
| D7 | e2e | ikisi | çözme | Şık seç, uygulamayı zorla kapat, yeniden aç, Devam | Seçilen şık seçili; sayaç kalan süreyi doğru gösterir |
| D8 | e2e | ikisi | çözme | Uçak modu; 3 şık seç | Sarı şerit, "3 bekliyor"; şıklar seçili kalır; bağlantı gelince sayı 0, şerit kapanır, sunucuda 3 cevap |
| D9 | e2e | ikisi | çözme | Arka plana al 10 dk, dön | Deneme iptal ya da teslim olmamış; kalan süre 10 dk azalmış; cevaplar yerinde |
| D10 | e2e | ikisi | çözme | Süreyi bitir (test sunucusu) | Otomatik teslim, tek `complete`; sonuç bekleme hâli; onay penceresi yok |
| D11 | e2e | ikisi | teslim | **Teslim et**'e hızlı çift dokunuş / Enter basılı tut | Tek `POST complete` |
| D12 | bileşen | ikisi | teslim | 4 boş, 2 işaretli | Sayılar 36/4/2; boş numaralar; numaraya dokununca o soru; **Boşlara dön** ilk boşa gider |
| D13 | e2e | ikisi | teslim | `complete` 500 döner | Alt sayfa açık, hata satırı, **Tekrar dene**; cevaplar cihazda |
| D14 | e2e | ikisi | çözme | Geri tuşu (Android), kenar kaydırma (iOS), web Ara ver | Ara ver penceresi; Devam et kapatır; Ara ver → Denemelerim, deneme "Devam eden"de, iptal yok |
| D15 | e2e | web | çözme | Sekmeyi kapatmaya çalış | `beforeunload` uyarısı |
| D16 | e2e | web | çözme, teslim | A–E, ←, →, işaret tuşu, Enter, Esc | Şık seçer, gezer, işaretler; pencerede Enter teslim eder, Esc kapatır (yükleme sürerken kapatmaz) |
| D17 | birim | ikisi | deneme ekle | 32 D 5 Y, 40 soru; 38 D 5 Y | Net 30,75 (EN 30.75); ikincide değer 35'e sınırlanır ya da alan hatası |
| D18 | e2e | ikisi | deneme ekle | Kaydet | `POST student/external-exams` bir kez; Sonuçlar'da çizgili sütun |
| D19 | görsel | ikisi | `m-deneme-sonuclar`, `-bos` | Dolu ve boş | NetBars değer sütunun üstünde, dışarıdaki çizgili; boşta sıfır grafik yok |
| D20 | e2e | ikisi | analiz | Mikro ders, 20 soru, Bu hafta planıma ekle | Dersler ve Testler doğru konuyu açar; plan görevi bir kez oluşur |
| D21 | bileşen | ikisi | çözümler | Yanlışlar süzgeci | Yalnız yanlış sorular; renk yanında sözcük; ekran okuyucu "46, yanlış" |
| D22 | görsel | ikisi | `m-istatistik`, `w-istatistik`, `m-istatistik-ilk` | Dolu ve ilk hafta | Yüzde TR `%62`, EN `62%`; ilk haftada üç adım, sıfır yok |
| D23 | erişilebilirlik | ikisi | çözme, teslim | VoiceOver / TalkBack ile bir deneme baştan sona | Şıklar "A, 24, seçili" okunur; ikon düğmelerin adı var; sayaç son 1 dk'da bir kez duyurulur |
| D24 | erişilebilirlik | ikisi | tümü | En büyük yazı boyutu, iPhone SE | Soru, şık, alt çubuk ve alt sayfa kesilmez; liste sekme çubuğunun altına girmez |
| D25 | erişilebilirlik | ikisi | tümü | Kontrast ölçümü | Metin 4,5:1 (`mod.ink` açık `#A23E08`, koyu `#FCB380`; düğme `#C54C0A` beyazla 4,8:1) |
| D26 | görsel | tablet | `t-deneme-*` | Yatay/dikey, kalemli/kalemsiz | Tablet-Kalem.md kuralları; ortak sayfalar web sayfasıyla aynı |
| D27 | e2e | ikisi | detay | Silinmiş deneme bağlantısı | Modül kökü ve "Bu içerik artık yok" kısa bildirimi |

---

## 7. Çizim ile bugünkü kod arasındaki farklar

Kaynak: 17 Kasım 2026 okuması (değiştirilmedi). Mobil kök `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\exam\`, web kök `C:\Users\onurc\source\repos\sinavika_frontend_student\src\features\`.

**Çözme, çıkış, süre (en önemlileri)**

1. **Mobilde çıkış denemeyi iptal ediyor.** Başlıktaki `x` "Denemeyi iptal et" penceresini, diğer geri yolları (`beforeRemove`) "Teslim etmeden çıkarsan deneme iptal olur; kullandığın hak geri gelmez." penceresini açıyor; seçenekler Vazgeç / İptal et ve çık / Tamamla. Kurallar kartı da aynı şeyi söylüyor (`exam.list.rules.exitCancels`, `presentation/components/ExamStudentRulesCard.tsx`). Çizim ve Navigasyon §4: ara ver, sonra kaldığın yerden devam. API devamı destekliyor (`GET student/exams/attempts/{id}/state`).
2. **Mobilde arka plan 5 dk sonra denemeyi bitiriyor.** `EXAM_BACKGROUND_GRACE_MS = 5 * 60_000` (`model/session/examStudentBackgroundGrace.ts`); süre dolunca `auto_away` ile otomatik tamamlanıyor. Çizim: "süre arka planda işler", çıkıp dönülebilir.
3. **Web'de çevrimdışı kuyruk yok.** Cevap seçilince hemen gönderiliyor (2 deneme, 400 ms); başarısızsa seçim geri alınıyor ve "Bağlantı yok. Tekrar deneyin." çıkıyor (`exam-sessions/…/useExamSolveSession.ts`). Çizimdeki "Bağlantı koparsa cevapların saklanır" ve `m-deneme-baglanti` davranışı web'de yok. Mobilde kuyruk var (`model/session/pendingExamSolutions.ts`, `model/transport/submitExamSolutionReliable.ts`).
4. **Web'de `beforeunload` yok**; sekme kapatma korumasız (Navigasyon §6.2 ile aynı).
5. **Web çıkış düğmesi "Kaydet ve çık"** (`exam-sessions.ts` `pause`); çizimde **Ara ver**. Davranış (süre işler, devam edilir) çizimle uyumlu; ara ver penceresi yok, doğrudan Denemelerim'e gidiyor.
6. **Denemeyi iptal etme** iki istemcide var (mobil başlık `x`, web harita altında "Denemeyi iptal et" bağlantısı, `POST attempts/{id}/cancel`); çizimlerde yok.
7. **Mobilde soru üzerinde İşaretle düğmesi yok.** İşaret yalnız bölüm çekmecesinde numaraya uzun basarak ya da `i` tuşuyla; işaretler kalıcı değil (yerel durum). Web'de **İşaretle** düğmesi var, işaretler `sessionStorage` `examMarks_{attemptId}`'de.
8. **Klavye işaret tuşu:** Düzeltildi (17 Kasım 2026): web ve tablet çizimi ile Tablet-Kalem.md tek tuşta birleşti: **M** (web kodu da M). Mobil kodu `i`/`ı` kullanıyor (bağlı klavye); M olmalı.
9. **Mobil sayaç biçimi `m:ss`**; çizim `s:dd:ss` (**1:42:18**).
10. **Mobil "Boş bırak" yalnız sonrakine geçiyor** ("Sonraki" ile aynı); çizimde seçili şık varken de görünüyor. Web yalnız cevapsız soruda gösteriyor. İki istemcide cevap ilk gönderimde kilitli (`lockOnFirstSubmit`); cevap değiştirme sahibin açık kararı (UIUX-Gecmis §7).
11. **Başlamadan önce ekranı iki istemcide yükleme ara ekranı:** geri sayım, kurallar ve **Şimdi başla** yok; "Deneme hazırlanıyor" yazıp kendiliğinden çözmeye geçiyor (`presentation/screens/ExamStudentStartingScreen.tsx`, `exam-sessions/pages/ExamStartPage.tsx`).
12. **Mobil çözme ekranı yüklenirken düz "Yükleniyor" metni** gösteriyor; kural `LoadingLogo`.

**Vitrin, detay, Denemelerim**

13. **Mobil vitrinde canlı deneme slaytı, Hatırlat ve geri sayım yok.** Yerinde "Sıradaki deneme" kartı (**Başla**), "Devam eden" kartı, "Bu ay sırada" (en çok 3) ve istatistik kartı var (`screens/main/ExamDashboardScreen.tsx`). "Senin için" önerileri yok.
14. **`m-deneme-katalog` (süzgeçli tüm denemeler) mobilde yok.** Web vitrininde süzgeç çipleri ve 3 kolon kart ızgarası yerine aylık deneme panosu var (`exams/pages/StudentExamsPage.tsx`).
15. **Mobil detayda "Denemeye gir" erişim penceresi dışında da etkin** (`ExamStudentPublicDetailScreen.tsx`); çizimde yaklaşan denemede yalnız **Hatırlat** var. Mobil hatırlatma hazır seçenekli ("1 saat sonra", "Yarın 09:00", "Sınavdan 2 saat önce", özel); web tek düğme (2 saat önce). Web detayda canlı geri sayım yok, yalnız "{gün} gün sonra açılıyor".
16. **Mobil Denemelerim sekmeleri "Sıradaki · Devam eden · Biten"**, çizim "Yaklaşan · Devam eden · Biten"; takvim yok (iki istemcide). Web `/student/denemelerim` yalnız geçmiş ayları gösteriyor; `/student/sinav-takvimi` sayfası yok, Denemelerim'e yönleniyor.
17. **Web sekme hapları 5:** Denemeler · Denemelerim · Sonuçlar · Çözümler · İstatistik (`src/constants/studentModuleRoutes.ts`, `common.ts` `moduleTabs.exam`); çizimde 3. Adlandirma-Kurallari'na göre Çözümler ve İstatistik Sonuçlar'ın içindedir. Ayrıca İstatistiklerim sol menüde Hesap altında, ama Denemeler menü satırı `/student/raporlarim`'de de aktif görünüyor.

**Sonuçlar, analiz, çözümler**

18. **Web Sonuçlar'da net sütunları yok:** "Net eğrin" çizgi grafiği (`Sparkline`) ve ÖSYM tarzı tablo var; üç giriş satırı (Sınavika denemelerim, Analizlerim, Deneme ekle) yerine başlıkta **Deneme ekle** düğmesi (`exam-results/pages/ExamResultsPage.tsx`). Mobil sütunlar çizimle uyumlu (`ExamResultsNetBarsCard.tsx`), ama dışarıdaki denemeler "Son sonuçlar" listesinde satır olarak yok.
19. **Analizden plana ekleme mobilde yok** (`statistics/screens/*`: yalnız "Konuyu çalış" ve "Test"). Web'de "İlk {count} konuyu planıma ekle" var. Mobil analizde "Mikro ders / 20 soru" çipleri ve "yaklaşık 5 net" ipucu yok.
20. **Analiz çipindeki soru sayısı:** Düzeltildi (17 Kasım 2026): "20 soru" (Testler'de bir seviye testi 20 sorudur); UIUX-Rehberi §5.4 buna göre güncellendi. Web çizimi ve kod "Test" yazıyor; "20 soru" olmalı.
21. **Web sonuç detayında net halkası ve derslere göre çubuklar yok**; ÖSYM belgesi ve konu listesi var (`exam-results/pages/ExamResultDetailPage.tsx`). Çizimdeki **Karşılaştır** yok.
22. **Çözümlerde SinoAI'ye sor yok** (iki istemci). Mobil kitapçıkta Tümü / Yanlışlar / Boşlar süzgeci yok (`solutions/screens/ExamSolutionBookletReviewScreen.tsx`). Web çözümde kalem notları gösterilmiyor (UIUX-Gecmis §7 açık iş).
23. **Dış deneme silme** API'de var (UIUX-Rehberi §5.8), iki istemcide yok; çizimde de yok.

**İstatistikler**

24. **Web İstatistiklerim'de "PDF olarak al" yok** (`statistics/pages/StatisticsPage.tsx`).
25. **Mobil İstatistiklerim'de modül halkası (donut) var**; mobil çizimde yok (web çiziminde var). Mobil ilk hafta adım metni "İlk konunu çalış", çizim "İlk mikro dersini bitir"; mobilde üç adımın düğmesi de **Başla** (çizimde Denemeler adımı **Hatırlat**).

**Çizim içi küçük farklar (olgu)**

26. `MyExamsScreen` takvim şeridinde gün harfleri EN çizimde de Türkçe (`P S Ç P C C P`) ve ay **EKİ**/**OCT** yalnız ilk satırda çevrili; EN'de gün kısaltmaları `Mon…Sun` olmalı (Insights ve StudyWeb öyle).
27. `ExamResultScreen` iki düğmede EN **Report**, `ExamDoneDetailScreen` EN **Result document**; aynı eylem iki ayrı İngilizce adla.
28. `m-deneme-gelisim` çizgi ve çubukları Testler renginde (`MODULES.tests`), ekran Denemeler'de.
