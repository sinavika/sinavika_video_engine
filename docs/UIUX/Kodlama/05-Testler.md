# Testler · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Learn.tsx` (vitrin, konular, seviyeler, çözme, test bitti, çözümler), `Screens/Mobile/Insights.tsx` (`TestWrongReviewScreen`), `Screens/Mobile/States.tsx` (`TestsSolutionsEmptyScreen`), `Screens/Web/TestsWeb.tsx`, `Screens/Web/GapsWeb.tsx` (`WebTestSolutionsListScreen`, `WebTestTopicsAllScreen`), `Screens/Web/StudyWeb.tsx` (`WebTestWrongReviewScreen`), `Screens/Tablet/Solve.tsx` (`TestScratchScreen`, `TestWrongScratchScreen`, `TestFigureScreen`), `Screens/Tablet/Parity.tsx` (`WrongReviewTabletScreen`); parçalar `Parts/Mobile.tsx`, `Parts/Shared.tsx`, `Parts/Web.tsx`, `Parts/Tablet.tsx`, `Parts/Study.tsx` (`StateBlock`).
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

> **Sahip kararları (17 Kasım 2026). Bu kararlarla çelişen ekran çizmek ya da kodlamak tasarım hatasıdır.** Kaynak: web deposunda `docs/UIUX/Tasarim-Uyum-Plani.md` §9.1 madde 8, §9.3 madde 11.
> - Dersler ve Testler vitrininde dersler **çubuklu listeyle** gösterilir; 27 Ekim'deki halkalı ızgara kararı kalktı.
> - Mobil Testler vitrininde **kaydırılan slaytlar** kalır: ilk slayt "Senin için hazır", sonra kaldığın yer ve konular; altında sayfa noktaları (Dersler'deki gibi).
> - Uygulamadaki dört ek çizime eklendi: seviye ekranında modül istatistik kartı ("Bu dersteki haftan") ve ders çipleri; seviye satırlarında "Başla" / "Devam et" / "Tekrar" düğmeleri (ve kilit); Yanlışlarım'da "Bu soruyu paylaş" ve "SinoAI'ye sor"; mobil Konular sekmesinde bütün derslerin açılır ağacı.
> - Çözümler'deki **"İşaretli"** süzgeci ve **"Yanlışlarından tekrar testi"** kartı kalır (API'ye eklenecek). Soru işaretleme düğmesi (`FlagButton`) çözme ekranında ve Yanlışlarım'da sorunun meta satırının sağındadır (§4 `m-test-coz`).
> - **Cevap her yerde tek dokunuş.** Tablet şekilli soruda "Cevapla" düğmesi yok; tablet yanlış cevapta "Devam" var.
> - **Son öğe, boş süzgeç ve çevrimdışı hâlleri çizilir (17 Kasım, §9.1 madde 8, §9.3 madde 12–14).**
>   - Yanlışlarım süzgecin son sorusunda ana düğme **"Bitti"** olur ve Çözümler'e döner (`m/w/t-test-yanlislar-son`).
>   - Yanlış yoksa ekran ilk boştan, o da yoksa "Tümü" süzgeciyle 1. sorudan açılır (`m-test-yanlislar-dogru`). İçi boş süzgeç soluk çizilir ve dokunulmaz.
>   - Webde ve tablette ızgara bütün soruları gösterir (doğrular yeşil); telefonda numara satırı yalnız süzgeçtekileri.
>   - Çözümler › İşaretli satırı soruyu Yanlışlarım'da "Tümü" süzgeciyle açar; test bitmediyse satır "Test bitince açılır" der ve açılmaz (`m/w-test-cozumler-isaretli`).
>   - Web Çözümler'de de süzgeç ve tekrar testi kartı var; satır sağında "Yanlışlarım". Çözülmüş tekrar testinin satır adı **"Konu · Tekrar"**.
>   - Testler çevrimdışı: ortak not (`PendingSyncNote reveal`) "Bağlantı yok; cevabın kaydedildi. Bağlanınca gönderilecek, doğrusu o zaman görünür." Bekleyen cevap varken "Testi bitir" bitirmez: "Bekleyen cevapların henüz gönderilmedi. Bağlantı gelince testi bitirebilirsin." (`m-test-baglanti`, `m-test-bitir-bekliyor`, `w-test-baglanti`).
>   - Web ders sayfasında (`w-test-konular`) ders çipleri yok; sağ üstte "Tüm dersler" Testler vitrinine döner.

Kod adı: modül anahtarı `tests`; API `Quizzes` (`/api/student/quizzes`), web özellik klasörü `quizzes`, mobil modül `quiz`, mobil rota öneki `Quiz`. Ekranda her yerde "test" yazılır, "quiz" asla.

## 1. Modül özeti

- **Ne işe yarar:** konu konu çoktan seçmeli testler. Öğrenci ders → konu → seviye seçer, soruyu çözer ve doğru ya da yanlışı **anında** görür. Yanlışta doğru şık ve nedeni, konunun anlatımı ve SinoAI'ye sor yolu açılır. Test öğrenme içindir; deneme gibi sınav provası değildir (UIUX-Rehberi §5.4.1).
- **Seviyeler:** her konuda üç seviye vardır: Kolay, Orta, Zor (`Easy`, `Medium`, `Hard`; API `difficulty` 0, 1, 2). Her seviye 20 sorudur. "Tarama" iç bir kavramdır, öğrenciye hiçbir yerde (başlık, çip, test adı) gösterilmez. API'den gelen test adında "tarama" geçerse ekranda gösterilmez (bkz. §7).
- **Renk** (`ModuleIdentity.ts`, `MODULES.tests`):

| Jeton | Açık tema | Koyu tema |
|---|---|---|
| `color` (kimlik) | `#4F46E5` | `#818CF8` |
| gradyan ikinci durak | `#8B5CF6` | `#8B5CF6` |
| `action` (düğme dolgusu, beyaz yazıyla 6,3:1) | `#4F46E5` | `#4F46E5` |
| `ink` (modül renginde yazı) | `#473FCE` | `#ADB4FA` |
| `wash` %7 / %12,6 | `rgba(79,70,229,0.07)` | `rgba(129,140,248,0.126)` |
| `soft` %12 / %21,6 (ikon kutusu, çip, sekme hapı) | `rgba(79,70,229,0.12)` | `rgba(129,140,248,0.216)` |
| `track` %16 / %28,8 (ilerleme izi) | `rgba(79,70,229,0.16)` | `rgba(129,140,248,0.288)` |
| `line` %24 / %43,2 (modül kenarı) | `rgba(79,70,229,0.24)` | `rgba(129,140,248,0.432)` |

  Başka modüle giden düğme o modülün rengindedir: "Konu anlatımı", "Konuyu çalış" Dersler renginde (`lessons`: dolgu `#0277B3`, soft `rgba(2,132,199,0.12)`, ink `#015C8B` / koyu `#88D7FB`). "Taslağımı SinoAI'ye göster" SinoAI renginde (`#475569`). Doğru `#047857` ve yanlış `#DC2626` her iki temada aynıdır; modül renginde gösterilmez.

- **Mobil tab bar** (Modul-Kimligi §6; `TabBar` parçası):

| Yuva | Etiket TR / EN | İkon (`Icons.tsx`) | Hedef |
|---|---|---|---|
| 1 | Testler / Quizzes | `quiz` | `m-test-vitrin` (`QuizHome`) |
| 2 | Konular / Topics | `tree` | `m-test-konular` (`QuizCatalog`) |
| 3 | Modüller / Modules | `grid` | Modüller ana ekranı (`m-hub-moduller`) |
| 4 | Çözümler / Solutions | `checkCircle` | `m-test-cozumler` (`QuizSolutions`) |
| 5 | Profil / Profile | `user` | Profil (`m-profil`) |

  Tab bar yüzer: sol/sağ 14 pt, alt 22 pt, yükseklik 72 pt, köşe 28 pt, zemin `card` %96, kenar `line`, gölge `float`. Aktif yuva: 58 pt yüksek hap, köşe 20, zemin `soft`, ikon 22 pt `color` (çizgi 2,2), etiket 10 pt 800 `ink`. Pasif: ikon ve etiket `muted`. Yuva 3: 42 pt daire `line2`, `grid` ikonu `ink2`.
- **Web:** sol menüde "Modüller" başlığı altında üçüncü satır (Denemeler, Dersler, **Testler**, …), `quiz` ikonu. Aktif satır: gri hap (`line2`), solda 3 px `color` çizgi, ikon `color`. Hap sekmeler: Testler · Konular · Çözümler (`ModuleHead`). Sayfa yolları: `/student/testler`, `/student/testler/[lessonMainId]`, `/student/testler/konular`, `/student/testler/cozumler`, `/student/testler/cozumler/[attemptId]`, `/student/testler/quiz/[quizId]` (odak, `(immersive)`).

## 2. Ekran haritası

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-test-vitrin` | mobil | Testler | `QuizHome` | `src/modules/quiz/presentation/screens/QuizOverviewScreen.tsx` | dolu |
| `w-test-vitrin` | web | Testler | `/student/testler` | `src/features/quizzes/pages/QuizzesHomePage.tsx` | dolu |
| `m-test-konular` | mobil | Konular | `QuizCatalog` | `QuizCatalogScreen.tsx` + `components/QuizBrowseTree.tsx` | dolu |
| `w-test-konular` | web | Ders konuları | `/student/testler/[lessonMainId]` | `app/.../(panel)/testler/[lessonMainId]/page.tsx` (yalnız yönlendirme) → `QuizzesTopicsPage.tsx` | dolu |
| `w-test-konular-tum` | web | Konular | `/student/testler/konular` | `src/features/quizzes/pages/QuizzesTopicsPage.tsx` | dolu |
| `m-test-detay` | mobil | Test seviyeleri | `QuizLessonSub · QuizOverview` | `QuizLessonSubScreen.tsx` + `components/QuizStepPath.tsx` | dolu |
| `m-test-coz` | mobil | Doğru cevap | `QuizSolve` | `QuizSolveScreen.tsx` | doğru |
| `w-test-coz` | web | Test çözme · doğru | `/student/testler/quiz/[quizId]` | `src/features/quizzes/pages/QuizzesPlayerPage.tsx` | doğru |
| `t-test-coz-taslak` | tablet | Test çözme · taslak kâğıdı | `QuizSolve` | `QuizSolveScreen.tsx` (`AnnotationScratchpadPanel`) | doğru |
| `m-test-coz-yanlis` | mobil | Yanlış cevap | `QuizSolve` | `QuizSolveScreen.tsx` | yanlış |
| `m-test-baglanti` | mobil | Bağlantı yok | `QuizSolve` | `QuizSolveScreen.tsx` | çevrimdışı |
| `m-test-bitir-bekliyor` | mobil | Testi bitir · bekleyen cevap | `QuizSolve` | `QuizSolveScreen.tsx` | çevrimdışı, son soru |
| `w-test-baglanti` | web | Test çözme · bağlantı yok | `/student/testler/quiz/[quizId]` | `QuizzesPlayerPage.tsx` | çevrimdışı, son soru |
| `w-test-coz-yanlis` | web | Test çözme · yanlış | `/student/testler/quiz/[quizId]` | `QuizzesPlayerPage.tsx` | yanlış |
| `t-test-coz-yanlis` | tablet | Yanlış cevap · taslağı göster | `QuizSolve` | `QuizSolveScreen.tsx` | yanlış |
| `t-test-sekilli-soru` | tablet | Şekilli soru · şekle yaz | `QuizSolve` | `QuizSolveScreen.tsx` (`AnnotationOverlayHost`) | seçili |
| `m-test-bitti` | mobil | Test bitti | `QuizComplete` | `QuizCompleteScreen.tsx` | bitti |
| (çizim yok) | web | Test bitti | `/student/testler/quiz/[quizId]` | `QuizzesPlayerPage.tsx` (`p.result` dalı) | bitti |
| `m-test-cozumler` | mobil | Çözümler | `QuizSolutions · QuizReview` | `QuizSolutionsScreen.tsx` | dolu |
| `w-test-cozumler` | web | Çözümler | `/student/testler/cozumler` | `src/features/quizzes/pages/QuizzesSolutionsPage.tsx` | dolu |
| `m-test-cozumler-bos` | mobil | Çözümler · henüz test yok | `QuizSolutions` | `QuizSolutionsScreen.tsx` (`AppEmptyState`) | boş / ilk |
| `m-test-cozumler-isaretli` | mobil | Çözümler · İşaretli | `QuizSolutions` | `QuizSolutionsScreen.tsx` | İşaretli süzgeci |
| `w-test-cozumler-isaretli` | web | Çözümler · İşaretli | `/student/testler/cozumler` | `QuizzesSolutionsPage.tsx` | İşaretli süzgeci |
| `m-test-yanlislar` | mobil | Yanlışlarım | `QuizReview` | `QuizReviewScreen.tsx` + `components/QuizReviewQuestionList.tsx` | dolu |
| `w-test-yanlislar` | web | Yanlışlarım | `/student/testler/cozumler/[attemptId]` | `src/features/quizzes/pages/QuizReviewPage.tsx` | dolu |
| `t-test-yanlislar` | tablet | Yanlışlarım | `QuizReview` | `QuizReviewScreen.tsx` (iki panel) | dolu |
| `m-test-yanlislar-son` · `w-test-yanlislar-son` · `t-test-yanlislar-son` | üçü | Yanlışlarım · son yanlış | `QuizReview` | aynı | süzgecin son sorusu |
| `m-test-yanlislar-dogru` | mobil | Yanlışlarım · yanlış yok | `QuizReview` | `QuizReviewScreen.tsx` | yanlış ve boş yok |

Mobil kod yolları `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\quiz\presentation\screens\` altında; web yolları `C:\Users\onurc\source\repos\sinavika_frontend_student\src\` altında.

**Başka modüllerdeki giriş noktaları** (bu belgede çizilmez, yalnız hedefleri):
- `m-ders-konu-sonu` · `w-ders-konu-sonu`: "Kolay seviye testi · 20 soru · ~25 dk" (Testler renginde, `quiz` ikonu) → o konunun Kolay seviyesi `QuizSolve`.
- `m-sino-sonuc`: "Testi aç" / "Open test" (Testler renginde) → SinoAI'nin ürettiği test.
- Ana ekran `TodayCard` "Sıradaki · Testler" ve Ders Planı görev kartı (`PlanTaskCard module="tests"`, "20 soru · 25 dk") → ilgili seviye; gün bitti kartında "Fazladan 10 soru" / "10 extra questions".
- `m-deneme-net`, `m-deneme-analiz`: "20 soru" / "20 questions" çipi (Testler renginde) → konunun sıradaki seviyesi.
- Paylaşım kartı `p-soru-hikaye`, `p-soru-gonderi`: "Bu soruyu çözdüm" (bkz. `Paylasim-Kartlari.md`).

## 3. Süreçler (akışlar)

### 3.1 Ders → konu → seviye → çözme (ana akış)

1. `m-test-vitrin`: öğrenci bir ders satırına dokunur → `m-test-konular` [push, modül yığını içinde] → API `GET student/quizzes/lesson-mains/{lessonMainId}/lesson-subs`. Hata: konular ekranında liste yerine hata bloğu ve "Tekrar dene" (kısa bildirim hata için kullanılmaz, UIUX-Rehberi §8).
2. `m-test-konular`: konu satırına dokunur → `m-test-detay` [push] → API `GET student/quizzes/lesson-subs/{lessonSubId}` (seviye listesi).
3. `m-test-detay`: alt düğme "Orta seviyeyi başlat" (sıradaki seviyenin adıyla) → `m-test-coz` [push, tab bar gizlenir] → API `POST student/quizzes/{quizId}/start`. Açık bir seviye kartına dokunmak da o seviyeyi açar. Kilitli seviyeye dokunmak: kısa bilgi bildirimi "Önceki adımı tamamlamadan bu test açılamaz." (mobil katalog metni `quiz.path.lockedHint`), ekran değişmez.
4. Çözme: şıkka dokunmak cevaptır (tek dokunuş, ayrı "Cevapla" düğmesi yok; UIUX-Gecmis §7) → API `POST student/quizzes/{quizId}/solutions` `{quizQuestionId, selectedOptionId}`.
   - Doğru → `m-test-coz` görünümü: şık yeşil tik, alt panel yeşil, "Devam".
   - Yanlış → `m-test-coz-yanlis` görünümü: seçilen şık kırmızı çarpı, doğru şık yeşil tik, alt panel kırmızı, Konu anlatımı ve SinoAI düğmeleri, "Devam".
   - Hata (ağ, 5xx): şıklar eski hâline döner, seçim kaldırılır, panel açılmaz; satır içinde hata metni ve tekrar denenebilir (bkz. §5). 409 "zaten cevaplandı" gelirse paket yeniden çekilir ve sunucudaki cevap gösterilir (bugünkü kod böyle yapıyor).
5. "Devam" → sıradaki cevapsız soru [aynı ekranda içerik değişimi: eski 180 ms'de çıkar, yeni 8 pt sağdan 240 ms'de gelir]. Son soruda "Devam" yerine "Testi bitir" / "Finish quiz" → API `POST student/quizzes/{quizId}/complete` → `m-test-bitti` [replace; geri tuşu çözme ekranına dönmez].
   - **Bağlantı yokken** (`m-test-baglanti`): cevap merkezi çevrimdışı kuyruğa yazılır. Seçilen şık `selected` görünümünde kalır; doğru/yanlış paneli açılmaz. Şıkların altında ortak not (`PendingSyncNote reveal`), altta "Devam" açık. Cevap gönderilince not kalkar; o soru numara çubuğunda doğru/yanlış rengini alır.
   - **Bekleyen cevap varken "Testi bitir"** (`m-test-bitir-bekliyor`, web `w-test-baglanti`): test bitmez, `complete` çağrılmaz. Mobilde alt sayfa yalnız şu metni gösterir: "Bekleyen cevapların henüz gönderilmedi. Bağlantı gelince testi bitirebilirsin." / "Your waiting answers have not been sent yet. You can end the quiz once you are back online." ve "Tamam". Webde aynı metin "Testi bitir" düğmesiyle aynı kartta, düğmenin solunda durur.
6. `m-test-bitti`: "Zor seviyeye geç" → sıradaki seviyenin `QuizSolve`'u [replace]; "Yanlışlarımı incele" → `m-test-yanlislar` [push]; sol üst kapat (`x`) → `m-test-detay` (aynı konunun seviyeleri, güncellenmiş) [pop].

**Geri ve yarıda bırakma:** çözmede sol üstteki `x` ya da sistem geri hareketi çözmeden çıkar; verilen cevaplar sunucuda kayıtlıdır, onay sorulmaz. Aynı seviye yeniden açılınca `start` aktif denemeyi döndürür ve ilk cevapsız sorudan devam edilir (`firstUnansweredQuestionIndex`). Seviye kartı bu durumda "Devam et" / "Continue" der.

**Web farkı:** `w-test-vitrin` → ders kartı → `w-test-konular` (`/student/testler/[lessonMainId]`; bugünkü kod `/student/testler/konular?main=` adresine yönlendirir). Webde seviye ekranı yoktur: konu kartına tıklamak o konunun **sıradaki açık seviyesini** doğrudan açar (`/student/testler/quiz/[quizId]?main=&sub=`). Çözme odak sayfasıdır (menü yok). "Ara ver" konulara döner. Bitti: web çizimi yok; bugünkü kodda aynı sayfada sonuç bloğu.

### 3.2 Senin için hazır test

1. `m-test-vitrin` vitrin kartı "Teste başla" / `w-test-vitrin` afiş "Teste başla" → önerilen konunun sıradaki seviyesi `QuizSolve` [push]. Öneri, son denemede en çok net kaybedilen konudur.
2. Öneri yoksa kart gösterilmez (web bugünkü kod böyle) ya da kart ders seçimine çağırır (çizilmedi; doğrulanmadı). Ekranın düzeni öneri gelince zıplamaz: öneri bilinene kadar sayfa yükleniyor hâlinde kalır.

### 3.3 Yanlıştan öğrenmeye

1. `m-test-coz-yanlis`: "Konu anlatımı" → Dersler'de sorunun konusu, ilgili bölümün ilk adımından (`WorkMikro`, parametre `workMikroId`) [modül değişimi, Dersler yığınına push]. Soruda `workMikroId` yoksa düğme "Konuyu çalış" olur ve konunun Dersler sayfasını açar (`WorkSub`, `lessonSubId`).
2. "SinoAI'ye sor" → SinoAI sohbeti, soru metni taslak olarak hazır (`origin: quiz`, `originId: quizId`, `lessonSubId`) [tam ekran modal]. SinoAI günlük hakkı kurallarına tabidir; test kendisi hak kullanmaz (`m-sino-hak`).
3. Dönüşte (geri) çözme ekranı aynı soruda, panel açık hâlde kalır.

### 3.4 Çözümler ve Yanlışlarım

1. Tab yuva 4 → `m-test-cozumler` [sekme değişimi] → API `GET student/quizzes/result-cards`. Liste boşsa `m-test-cozumler-bos`.
2. Satıra dokunmak → `m-test-yanlislar` [push] → API `GET student/quizzes/review/{attemptId}`. Açılış sırası:
   - yanlış varsa **ilk yanlış soruda**, "Yanlış" süzgeci seçili;
   - yanlış yoksa ilk boşta, "Boş" süzgeci seçili;
   - ikisi de yoksa 1. soruda, "Tümü" süzgeci seçili (`m-test-yanlislar-dogru`; ana düğme "Sonraki soru").
   İçi boş süzgeç (`· 0`) soluk çizilir ve dokunulmaz (`Segmented off`).
3. "Sonraki yanlış" → süzgeçteki bir sonraki soru [aynı ekranda içerik değişimi]. **Süzgecin son sorusunda ana düğme "Bitti" / "Done" (`check` ikonu) olur** ve Çözümler'e döner [pop] (`m-test-yanlislar-son`).
3b. **İşaretli** (`m-test-cozumler-isaretli`): süzgeç işaretli soruları listeler. Satıra dokunmak soruyu Yanlışlarım'da **"Tümü"** süzgeciyle o soruda açar. Bitmemiş testin sorusu kilitlidir: sağda `lock` + "Test bitince açılır" / "Opens when the quiz ends", dokunulmaz.
4. "Konuyu çalış" → Dersler'de konu, oynatıcı kalınan adımdan (`WorkSub` yönlendirir; ara ekran yok) [modül değişimi].

**Web:** `w-test-cozumler` mobildeki süzgeci ve tekrar testi kartını taşır; satırın sağında "Yanlışlarım" düğmesi → `w-test-yanlislar` (`/student/testler/cozumler/[attemptId]`), aynı açılış sırasıyla. Solda 5 sütunlu ızgara **bütün soruları** gösterir (doğrular yeşil); süzgeç yalnız "Sonraki"nin gezdiği soruları seçer. Son soruda "Bitti" (`w-test-yanlislar-son`). İşaretli satırının sağında "Soruyu aç". Tablet webdeki ızgarayı kullanır.

### 3.5 Hak ve sınır

- Ödeme yoksa erişim yok (3 günlük mağaza denemesi dışında). API 403 abonelik hatası dönerse modül içeriği yerine abonelik hâli gösterilir; çizimi yoktur. Kurallar: kilit simgesi yerine açıklayıcı paket kartı, ödeme düğmesi marka turuncusu (`#C2410C`, ödeme marka yüzeyidir), "Paketleri gör" / "See plans" ve ikinci yol (`m-ders-hak` kalıbı, UIUX-Rehberi §5.6).
- Testlerde günlük hak yoktur; SinoAI hakkı dolduğunda da testler açıktır (`m-sino-hak`: "Takıldığın konunun anlatımı ya da testi hakkından düşmez.").
- Seviye kilidi bir sınır değil sıradır: önceki seviye bitince sonraki açılır (API `isUnlocked`; 409 = adım kilitli).

## 4. Ekranlar

### `m-test-vitrin` Testler · web: `w-test-vitrin`

- **Modül istatistik kartı (sahip kararı, 17 Kasım 2026):** her modül vitrininde aynı çerçeveli "Bu hafta" kartı (`ModuleWeekCard`; uygulamada `ProfileModuleStatisticsCard` / `ModuleStatisticsCard`). Tanımı [04-Dersler.md](04-Dersler.md) §4.1 madde 3'tedir: süre, geçen haftaya göre değişim, son 7 günün çubukları, üç kutu; bu hafta çalışma yoksa tek sakin satır. Yeri: slaytın hemen altında; web'de sol sütunda banner'ın altında. Kutular: "Çözülen soru" / "Questions solved" 140; "Başarı" / "Success" %72; "Seri" "5 gün".

- **Görseller:** `acik/mobil/m-test-vitrin.png`, `koyu/mobil/m-test-vitrin.png`, `en/acik/mobil/m-test-vitrin.png`; `acik/web-panel/w-test-vitrin.png`, `koyu/web-panel/w-test-vitrin.png`, `en/acik/web-panel/w-test-vitrin.png`
- **Çerçeve:** `AppHeader` varsayılan: solda profil (40 pt yuvarlak, `user` 22 pt), ortada boş (modül sayfası logosuz), sağda zil ve kırmızı sayaç rozeti (`#DC2626`, 18 pt). Tab bar var, aktif yuva 1. Arka plan modül yıkaması: `linear-gradient(180deg, wash 0%, bg 34%)`. Alt düğme alanı yok.
- **Yerleşim (yukarıdan aşağı):** içerik dolgusu 4 / 18 / 108 pt (alt 108 tab bar için), bloklar arası 14 pt.
  1. `PageTitle`: modül çipi (`Chip tone=module size=sm`, 24 pt yükseklik, `quiz` ikonu 12 pt, "Testler" / "Quizzes", zemin `soft`, yazı `ink`), altında başlık `title` rolü 24 pt 800 "Testler" / "Quizzes", 6 pt aralık.
  2. `ModuleSlide` (vitrin kartı, en az 170 pt): köşe 26, dolgu 20, gradyan 135° `color` → `#8B5CF6`, gölge `0 16 30 -18 rgba(79,70,229,0.8)`, iki saydam ışık dairesi ve sağ altta 120 pt `quiz` filigranı (%18, −12°). İçerik: üst satır `over` (12 pt 800, büyük harf, beyaz %85) "Senin için hazır" / "Ready for you"; başlık `hero` 24 pt beyaz, en çok 270 pt genişlik "Problemler · Orta" / "Word problems · Medium" (veri: konu adı · seviye adı); metin `small` beyaz %90, en çok 260 pt "Denemede en çok net kaybettiğin konu. 20 soru." / "Where you lost most points. 20 questions." (soru sayısı veriden); en altta `Button tone=white size=sm` (36 pt, 13 pt 700, beyaz zemin, yazı `ink` açık `#473FCE`) "Teste başla" / "Start quiz".
     - **Kaydırılan slaytlar:** bu kart sayfa sayfa kayan slaytların ilkidir: "Senin için hazır" (önerilen test), sonra "Kaldığın yer · Devam et" ve "Konular". Altında `Dots` (3 nokta; aktif 18 × 6 modül `color`, diğerleri 6 × 6 `line`, aralık 5; slaytla aralık 8). Tek slayt varsa nokta çizilmez.
  3. `SectionTitle`: "Dersler" / "Subjects" (`section` 17 pt 800), alt satır `small` "TYT · önce dersi seç" / "TYT · pick a subject first" (sınav adı öğrencinin kategorisinden).
  4. `List` (tek kart, 20 pt köşe, ince kenar, satırlar arası `line2` çizgi). Her `ListRow` (dolgu 12 / 14, aralık 12): `Tile` 38 pt (`soft` zemin, `book` ikonu `color`), başlık `headline` 15 pt 700 ders adı, alt satır `small` "12 / 30 test" / "12 / 30 quizzes" (biten / yayındaki test), sağda 70 pt genişliğinde `Bar` (6 pt, dolgu `color`, iz `track`) ve `right` ikonu 18 pt `subtle`. Örnek dersler: Türkçe, Matematik, Geometri, Fizik, Kimya, Biyoloji.
- **Veri:** `GET student/quizzes/lesson-mains?categorySubId=` → `sections[].items[]`: `id`, `name`, `publishedQuizCount`, `completedQuizCount`, `categorySubId`, `categorySubName`. Hazır test: web bugün `GET study-plan` önerilerinden (`source = exam`, `lessonSubId`) ve `GET student/quizzes/lesson-subs/{lessonSubId}` ile sıradaki açık testi seçiyor; mobilde karşılığı yok (API'de doğrulanmalı: tek bir "hazır test" ucu yok).
- **Etkileşimler:**
  - Profil → Profil [push]; zil → Bildirimler [push].
  - "Teste başla" → `m-test-coz` (önerilen test) [push].
  - Ders satırı (tüm satır 44 pt üstü dokunma alanı) → `m-test-konular` [push] (§3.1).
  - Tab yuvaları → §1.
- **Hâller:** yükleniyor: ekranın ortasında `LoadingLogo` (dönen saatli logo, Testler renginde); veri varken yenileme içeriği yerinde bırakır, üstte küçük gösterge. Ders listesi boş: "Kapsamında yayınlı test bulunamadı." tarzı boş hâl, tek eylem (çizimi yok; `m-durum-bos` kalıbı). Hata: `m-durum-hata` kalıbı, "Tekrar dene". Çevrimdışı: ince sarı şerit. Abonelik yok: §3.5.
- **Web farkı (`w-test-vitrin`):** `Panel` (sol menü 260 px, üst çubuk 68 px, içerik dolgusu 22 / 28 / 28, bloklar arası 18, üstte 300 px modül yıkaması). `ModuleHead`: hap sekmeler (36 px yükseklik, 0 16 dolgu, 18 köşe; aktif dolgu `action` beyaz yazı, pasif `card` zemin `line` kenar `ink2` yazı, 13,5 px 700) Testler · Konular · Çözümler; altında başlık kartı (dolgu 18 / 20, köşe 26, `card` zemin, `line` modül kenarı, gölge `card`, sağ üstte 240 px `wash` daire): `Tile` 52, modül çipi, başlık 26 px "Testler" / "Quizzes", alt satır 13,5 px "Kolay, Orta, Zor · her seviye 20 soru" / "Easy, Medium, Hard · 20 questions each", sağda `Button tone=ghost` `search` ikonlu "Konu ara" / "Find topic" (üst çubuk aramasını açar, Ctrl K). Altında iki sütun `1fr 2fr`, aralık 18: solda `ModuleBanner` (köşe 26, dolgu 26, gradyan; `over` "Senin için hazır", başlık 30 px "Problemler · Orta", gövde 15 px "Denemede en çok net kaybettiğin konu. 20 soru, anında açıklama." / "Where you lost most. 20 questions, instant feedback.", beyaz düğme "Teste başla"); sağda iki sütunlu ders kartları (aralık 14; `Card` dolgu 16: `Tile` 40 `book`, ders adı `headline`, sağda `meta` "12 / 30", altında 6 px `Bar`, en sağda `right` 18 px `subtle`). Kart tamamı tıklanır; klavye ile odaklanır (2 px odak halkası).
- **Kurallar:** ilk ekran yalnız dersleri listeler (hiyerarşi kuralı); konu ve test bu ekranda listelenmez. Sınav birden çok kategoriyi kapsıyorsa (TYT, AYT) ders listesi kategoriye göre gruplanır ya da üstte süzgeç çipi olur (web bugünkü kod `ModuleFilterChip`); çizimde tek kategori.

### `m-test-konular` Konular · web: `w-test-konular`, `w-test-konular-tum`

- **Görseller:** `acik/mobil/m-test-konular.png`, `koyu/mobil/m-test-konular.png`, `en/acik/mobil/m-test-konular.png`; `acik/web-panel/w-test-konular.png`, `acik/web-panel/w-test-konular-tum.png` (+ `koyu/`, `en/acik/`)
- **Çerçeve (mobil, 17 Kasım kararı):** `AppHeader` varsayılan (profil, zil). Tab bar var, aktif yuva 2 (Konular). Modül yıkaması var.
- **Yerleşim (mobil): bütün derslerin açılır ağacı.** İçerik aralığı 10 pt.
  1. `PageTitle` "Konular" / "Topics", alt satır "TYT · bütün dersler" / "TYT · every subject".
  2. Her ders bir kart (`Card` dolgu 0, köşe 20). Kapalı ders tek satırdır (dolgu 12): `Tile` `book` 36, `headline` ders adı, `meta` "30 konu · 12 tamamlandı" / "30 topics · 12 complete", sağda `down` 18 `subtle`.
  3. Açık ders kartı `moduleLine` (1,5 px modül `line` kenar); satırında `up` modül `ink`. Altında `line2` çizgiyle ayrılmış konu satırları (dolgu 10 / 14 / 10 / 60; ad `small` 700 `ink`, `meta` "3/3 seviye" / "3/3 levels", sağda `Levels`: üç dikey çubuk 8 × 18 pt, köşe 3, aralık 3; biten seviye `color`, kalan `line`).
  4. Aynı anda bir ders açıktır; başka derse dokunmak onu açar, öncekini kapatır (yerinde, ekran değişmez; açılma 240 ms `easing.out`).
- **Veri:** `GET student/quizzes/lesson-mains/{lessonMainId}/lesson-subs?categorySubId=` → `items[]`: `id`, `name`, `publishedQuizCount`, `completedQuizCount`. "Biten seviye" = `completedQuizCount` (en çok 3); konunun bittiği = biten seviye 3. Üstteki yüzde = biten konu / konu sayısı.
- **Etkileşimler:** ders satırı → aç / kapa (aynı ekran); konu satırı → `m-test-detay` [push]. Uzun liste sanallaştırılır (§5).
- **Hâller:** yükleniyor (`LoadingLogo` ortada); boş: "Bu derste henüz test yok." ve derslere dönüş (çizimi yok); hata: satırlar yerine hata bloğu, "Tekrar dene".
- **Web farkı:**
  - `w-test-konular` (`/student/testler/[lessonMainId]`): üst çubukta yol izi "Testler ›" / "Quizzes ›"; `ModuleHead` aktif hap Konular, başlık "Matematik", alt satır "25 konu · 9 tamamlandı", sağ üstte `Button tone=ghost icon=left` "Tüm dersler" / "All lessons" → Testler vitrini. **Ders süzgeç çipleri yok** (sahip, 17 Kasım); ders vitrindeki listeden seçilir. Altında üç sütun kart ızgarası (aralık 14): `Card` dolgu 16, solda konu adı `headline`, sağda `Levels`; altında `small` "2/3 seviye · Sıradaki: Orta" / "2/3 levels · Next: Medium" ya da "3/3 seviye · Tamamlandı" / "Complete". Öğrencinin şu an çalıştığı konu `moduleLine` kartla (1,5 px `line` kenar) vurgulanır. Karta tıklamak sıradaki seviyeyi açar (§3.1 web farkı); açılırken kart kilitli ve "Test açılıyor…" yazar.
  - `w-test-konular-tum` (`/student/testler/konular`): başlık "Konular" / "Topics", alt satır "TYT Türkçe · konu konu Kolay, Orta, Zor" / "TYT Turkish · by topic"; iki sütun `WCard` (dolgu 20): `Tile` 40, konu adı, `small` "3 seviye · 20’şer soru" / "3 levels · 20 questions each", sağda üç kare 18 × 18 px, köşe 6 (biten `color`, kalan `line2`).
  - Bugünkü kodda ikisi tek sayfadır (`QuizzesTopicsPage`, ders `?main=` ile, üstte ders süzgeç çipleri).
- **Kurallar:** sekme yuvası 2'den (seçili ders olmadan) açılınca hangi dersin gösterileceği çizimde tanımlı değildir (doğrulanmadı); web bugün ilk dersi seçiyor.

### `m-test-detay` Test seviyeleri

- **Görseller:** `acik/mobil/m-test-detay.png`, `koyu/mobil/m-test-detay.png`, `en/acik/mobil/m-test-detay.png`. Web karşılığı yok (web konu kartından sıradaki seviyeyi açar).
- **Çerçeve:** `AppHeader left=back`, başlık konu adı "Problemler" / "Problems", sağ boş. **Tab bar yok.** Modül yıkaması var. Alt düğme alanı yok: her seviyenin kendi düğmesi var.
- **Yerleşim:** içerik dolgusu 4 / 18 / 20, aralık 14.
  0. **Ders çipleri** (`FilterChips module=tests`, yatay kayar): sınavın dersleri; seçili ders (Matematik) `action` zemin, beyaz yazı. Dokununca o dersin konularına gider.
  1. Konu kartı: köşe 22, dolgu 14 / 16, modül gradyanı. `over` beyaz %85 "Matematik · TYT" / "Maths · TYT"; `title` 22 beyaz "Problemler" / "Word problems"; `small` beyaz %90 "Son denemede bu konuda 3,25 net kaybettin." (yoksa satır yok).
  2. **Modül istatistik kartı** (`ModuleWeekCard lesson`; uygulamada `ProfileModuleStatisticsCard lessonMainId=`): başlık "Bu dersteki haftan" / "Your week in this subject"; "40 dk çalışma", "%15 artış", 7 gün çubuğu; kutular "Çözülen soru" 48, "Başarı" %69, "Seri" "5 gün". Tanım 04-Dersler §4.1 madde 3.
  3. `SectionTitle` "Seviyeler" / "Levels".
  4. Üç seviye kartı, aralık 8 (`Card` dolgu 12; sürmekte olan seviye `moduleLine`): solda 40 × 40 numara kutusu (bitmiş `action` dolgu beyaz rakam; diğerleri `soft`, rakam `color`), ad `headline` (Kolay / Orta / Zor), `small` alt satır; sağda **satırın kendi düğmesi**:
     - bitmiş: ghost `sm` "Tekrar" / "Retry" (`refresh`), alt satır "18 doğru · 2 yanlış";
     - başlanmış: `module` `sm` "Devam et" / "Continue", alt satır "8 / 20 soru";
     - açık, başlanmamış: `module` `sm` "Başla" / "Start", alt satır "20 soru · ~25 dk";
     - kilitli: `lock` 16 `subtle` + `meta` "Kilitli" / "Locked"; dokununca kısa bildirim "Önceki adımı tamamlamadan bu test açılamaz."
- **Veri:** `GET student/quizzes/lesson-subs/{lessonSubId}` → her seviye: `id`, `title`, `stepIndex`, `difficulty` (0 Kolay, 1 Orta, 2 Zor), `questionCount`, `isUnlocked`, `latestStatus` (0 aktif, 1 bitti, 2 iptal), `correctCount`, `wrongCount`. Başarı yüzdesi = `correctCount / questionCount`. Süre istemci tahmini: soru başına 75 sn, 5 dakikaya yukarı yuvarlanır (20 soru → 25 dk; mobil `quizDuration.ts`, web aynı). "Net kaybettin" cümlesinin verisi API'de doğrulanmalı (deneme analizi).
- **Etkileşimler:** bitmiş seviye kartı → o seviye yeniden çözülür ("Tekrar" / "Retry") ya da sonucu açılır (çizimde tanımlı değil; bugünkü mobil kod yeniden çözdürüyor); sıradaki seviye kartı ve alt düğme → `m-test-coz` [push]; aktif denemesi olan seviye → kaldığı sorudan devam; kilitli kart → bilgi bildirimi, gezinme yok.
- **Hâller:** yükleniyor (`LoadingLogo`); konuda test yok: "Bu konuda yayınlı test yok." boş hâli ve geri; hepsi bitti: alt düğme "Zor seviyeyi tekrar çöz" ya da konu sonu önerisi (çizilmedi; doğrulanmadı).
- **Kurallar:** seviye adları yalnız Kolay, Orta, Zor; test adı ekranda seviye adının yerine geçmez. Kilitli seviye soluk değil, kilit simgesiyle gösterilir.

### `m-test-coz` Doğru cevap · web: `w-test-coz` · tablet: `t-test-coz-taslak`

- **Soru işaretleme (`FlagButton`, sahip kararı 17 Kasım 2026):** sorunun üstündeki meta satırında ("Problemler · soru 4") sağda hap düğme, 32 pt yükseklik, köşe 16, iç boşluk 0 / 12, aralık 6. Kapalı: `card` zemin, 1,5 px `line` kenar, `bookmark` 15 `ink2`, `small` 13 700 "İşaretle" / "Flag". Açık: modül `soft` zemin, 1,5 px modül `line` kenar, ikon ve yazı modül `ink`, "İşaretli" / "Flagged". Tek dokunuş açar / kapar, seçim titreşimi; anlam yalnız renkle verilmez (yazı da değişir). İşaretli sorular Çözümler › "İşaretli" süzgecinde toplanır. Web'de aynı hap `Immersive` başlığının sağında, doğru sayısı çipinin solunda; Yanlışlarım'da (mobil, web, tablet) soru meta satırının sağında. Veri: işaretleme ucu API'ye eklenecek; ucu gelene kadar düğme gösterilmez.

- **Görseller:** `acik/mobil/m-test-coz.png`, `koyu/mobil/m-test-coz.png`, `en/acik/mobil/m-test-coz.png`; `acik/web-panel/w-test-coz.png` (+ `koyu/`, `en/acik/`); `acik/tablet/t-test-coz-taslak.png`, `koyu/tablet/t-test-coz-taslak.png`
- **Çerçeve:** odak ekranı. Tab bar yok. `FocusHeader` (dolgu 4 / 16 / 10): solda kapat (40 pt yuvarlak, `card` zemin, `line` kenar, `x`), ortada `meta` "Problemler · Orta" / "Problems · Medium" ve `headline` 16 pt "Soru 4 / 20" / "Question 4 / 20", sağda `Chip tone=success` (28 pt, `successSoft` zemin, `successInk` yazı) "3 doğru" / "3 right". Modül yıkaması var. Altta geri bildirim paneli (ekranın altına yapışık).
- **Yerleşim:**
  1. Soru şeridi: yatay, 16 pt yan dolgu, parçalar arası 4 pt; her soru eşit genişlikte 6 pt yükseklik, köşe 3. Renkler: doğru `success`, yanlış `error`, şu anki `color`, cevapsız `line2`. (Çizim 10 parça örnekler; her soru bir parçadır.)
  2. İçerik (dolgu 16 / 18 / 10, aralık 12): soru kökü `body` 17 pt / 26 satır, 600, `ink`. Görsel varsa (`stemImageUrl`, şekil) kökün altında, tam genişlik, `alt` metni okunur.
  3. Şıklar `OptionRow`: dolgu 11 / 14, köşe 16, kenar 1,5 pt, aralık 12; solda 30 × 30 pt köşe 10 harf kutusu, sağda şık metni `body` 600 `ink`. Hâller: boş (`line` kenar, `card` zemin, `line2` kutu, harf `ink2`), doğru (`success` kenar, `successSoft` zemin, kutu `#047857`, beyaz `check` 16 pt harfin yerine). Çizimde A 260, B 288, C 300 (doğru), D 320; şık sayısı veriden (`optionCount`, TYT'de 5).
  4. Geri bildirim paneli: zemin `successSoft`, üstte 2 pt `success` çizgi, dolgu 16 / 18 / 34, aralık 12. Satır: 34 pt `success` daire içinde beyaz `check` 18 pt; yanında `headline` `successInk` "Doğru! Seriyi sürdürdün." / "Correct! Streak kept." ve `small` `ink2` kısa çözüm "Fiyatın %80’i 240 → tamamı 240 ÷ 0,8 = 300." / "80% is 240 → full price 240 ÷ 0.8 = 300.". Altında `Button size=lg block` dolgu `#047857`, gölgesiz "Devam" / "Continue".
- **Veri:** `POST student/quizzes/{quizId}/start` → `attemptId`, `correctCount`, `questions[]` (`id`, `orderIndex`, `stem`, `stemImageUrl`, `options[]` {`id`, `optionKey`, `stem`}, `solutions[]`, `studentAnswer`, `workMikroId`, `workMikroMinutes`). Cevap: `POST .../solutions` → `isCorrect`, `correctOptionId`, `correctOptionKey`, `solutions[]` (ilk açıklama kısa çözüm olarak), `peerSuccessPercent`, `correctCount`, `wrongCount`. Çözümün tamamı uzunsa panelde kısaltılır, "Çözümün tamamı" / "Full solution" ile açılır (web bugünkü kod; çizimde yok). Çözüm türü video, PDF ya da bağlantıysa "Videoyu aç", "PDF’i aç", "Bağlantıyı aç".
- **Etkileşimler:** şık (tam satır, en az 44 pt) → cevap (tek dokunuş) [hareket: tik ve yumuşak yeşil dolgu 240 ms; hafif darbe titreşimi]; cevap verildikten sonra şıklar kilitlenir; "Devam" → sonraki soru; kapat → çıkış (§3.1 geri).
- **Hâller:** ilk açılış: `LoadingLogo` ortada, "Test hazırlanıyor" / "Preparing quiz"; cevap gönderiliyor: seçilen şık seçili görünür (`mod.color` kenar, `wash` zemin, `action` kutu), diğer şıklar kilitli, panel açılmaz; başlatılamadı: hata bloğu ve "Tekrar dene" + konulara dönüş; abonelik yok: §3.5.
- **Web farkı (`w-test-coz`):** `Immersive` odak sayfası (menü yok, 1440 × 900 `card` zemin). Üst çubuk 70 px, dolgu 0 32, alt kenar `line`: `Button tone=ghost size=sm` `x` "Ara ver" / "Pause", `Tile` 36, `headline` "Problemler · Orta" ve `meta` "Soru 4 / 20", sağda başarı çipi `check` ikonlu "3 doğru". Altında 4 px ilerleme çubuğu (`color`, iz `line2`, cevaplanan oranı). İçerik dolgusu 40 / 160, aralık 16: şerit 7 px; kök `body` 20 / 30, 600; şıklar iki sütun (aralık 12, en çok 760 px); geri bildirim kartı (dolgu 18, `successSoft`, kenarsız, en çok 760): `Tile` 42 beyaz `check` `success` zeminde, `section` `successInk` başlık, `small` çözüm "… = 300 TL.", sağda `Button size=lg` `#047857` "Devam". Klavye: 1–5 şık seçer, Enter devam (UIUX-Rehberi §8).
- **Tablet farkı (`t-test-coz-taslak`):** 1194 × 834 yatay. `SolveBar` 64 pt (dolgu 0 / 22): kapat (`x`), `meta` "Problemler · Orta", `headline` 16 "Soru 5 / 20", ortada başarı çipi "4 doğru" / "4 right", sağda iki düğme: "Taslak kâğıdı" / "Scratchpad" (`notebook`, açık: `soft` zemin, `line` kenar, `ink` yazı) ve "Soruya yaz" / "Write on question" (`pen`). Altında satır (aralık 20, dolgu 4 / 22 / 26): solda soru kartı (köşe 26, dolgu 22 / 26, aralık 14; kök `body` 19 / 30; şıklar aralık 9; geri bildirim kartın en altında, dolgu 16, köşe 20, `successSoft` zemin, 1,5 `success` kenar, 34 pt daire, başlık, çözüm "Bir günde 1/6 + 1/12 = 1/4 iş → 4 gün." / "Per day 1/6 + 1/12 = 1/4 of the job → 4 days.", sağda `Button size=md` `#047857` "Devam"); sağda `Scratchpad` 454 pt genişlik (%38), tam yükseklik: 52 pt başlık (`notebook`, "Taslak kâğıdı", sayfa "Soru 5 · 1 / 1" / "Q 5 · 1 / 1", `plus` yeni sayfa, `eyeOff` gizle, `x` kapat), noktalı kâğıt (24 pt aralık), sağ üstte dikey `PenToolbar` (kalem, fosforlu kalem, silgi · mürekkep, mavi, kırmızı, yeşil · ince/orta/kalın · geri al, ileri al · parmakla çizim · temizle). Taslak test oturumu + soruya kayıtlıdır (`student/notes`). Ayrıntı `Tablet-Kalem.md`.
- **Kurallar:** test anında doğru/yanlış gösterir (denemenin tersine). Anlam yalnız renkle verilmez: doğru tik, yanlış çarpı. Sallanma animasyonu yok. Doğru panelinin "Devam" düğmesi yeşil (`#047857`), yanlış panelininki modül rengi.

### `m-test-coz-yanlis` Yanlış cevap · web: `w-test-coz-yanlis` · tablet: `t-test-coz-yanlis`

- **Görseller:** `acik/mobil/m-test-coz-yanlis.png`, `koyu/mobil/m-test-coz-yanlis.png`, `en/acik/mobil/m-test-coz-yanlis.png`; `acik/web-panel/w-test-coz-yanlis.png`; `acik/tablet/t-test-coz-yanlis.png` (+ `koyu/`)
- **Çerçeve:** `m-test-coz` ile aynı; başlık "Soru 5 / 20", çip "3 doğru".
- **Yerleşim:**
  1. Şerit: ilk dört `success`, beşinci `error`.
  2. Kök: "Bir işi Ali 6 günde, Ayşe 12 günde bitiriyor. İkisi birlikte bu işi kaç günde bitirir?" / "Ali finishes a job in 6 days, Ayşe in 12. How many days do they need together?".
  3. Şıklar: A 3; B 4 **doğru** (yeşil, tik); C 9 **yanlış** (seçilen: `error` kenar, `errorSoft` zemin, kutu `#DC2626`, beyaz `x`); D 18.
  4. Panel: zemin `errorSoft`, üstte 2 pt `error` çizgi, dolgu 16 / 18 / 34, aralık 12. Satır (üste hizalı): 34 pt `error` daire, beyaz `x` 18 pt; `headline` `errorInk` "Doğrusu B: 4 gün" / "The answer is B: 4 days" (doğru şık ve değeri); `small` `ink2` neden "Süreler toplanmaz, günlük işler toplanır: 1/6 + 1/12 = 1/4, yani 4 gün." / "Add the daily shares, not the days: 1/6 + 1/12 = 1/4, so 4 days.". Altında iki düğme yan yana (aralık 10, eşit genişlik, 46 pt): solda `Button module=lessons tone=moduleSoft icon=book` "Konu anlatımı" / "Topic lesson" (Dersler `soft` zemin, Dersler `ink` yazı); sağda `Button tone=ghost icon=sparkles` "SinoAI’ye sor" / "Ask SinoAI" (`card` zemin, 1,5 `line` kenar, `ink` yazı). En altta `Button size=lg block` `action` dolgu "Devam" / "Continue".
- **Veri:** cevap yanıtındaki `correctOptionKey`, `solutions`, `peerSuccessPercent`; sorunun `workMikroId`, `workMikroMinutes` (Konu anlatımı düğmesinde kullanılmaz). `workMikroId` yoksa düğme "Konuyu çalış" / "Study the topic".
- **Etkileşimler:** Konu anlatımı → Dersler'de konu anlatımı [modül değişimi, push]; SinoAI'ye sor → SinoAI sohbeti [modal]; Devam → sonraki soru. Yanlışta uyarı titreşimi (`notificationWarning`), çarpı ve kırmızı dolgu 240 ms.
- **Web farkı:** hata kartı (dolgu 18, `errorSoft`): `Tile` 42 beyaz `x` `error` zeminde, `section` `errorInk` "Doğrusu B: 4 gün", `small` neden; altında tek satır: `moduleSoft lessons` `book` "Bu konunun anlatımı" / "This topic’s lesson", `ghost` `sparkles` "SinoAI’ye sor", boşluk, `Button size=lg` `action` "Devam".
- **Tablet farkı (`t-test-coz-yanlis`):** çip "3 doğru"; kartın altındaki hata bloğu (dolgu 16, köşe 20, `errorSoft`, 1,5 `error` kenar): başlık "Doğrusu B: 4 gün", neden "Günleri değil, bir günde yapılan işi topla: 1/6 + 1/12 = 1/4." / "Add the work per day, not the days: 1/6 + 1/12 = 1/4."; iki dolu düğme yan yana: `module=sinoAi` `sparkles` "Taslağımı SinoAI’ye göster" / "Show my working to SinoAI" (`#475569`) ve `module=lessons` `book` "İş problemleri konusu" / "Work problems topic" (`#0277B3`). Taslak kâğıdı yerinde kalır; altında not kutusu (dolgu 12 / 14, köşe 16, SinoAI `wash` zemin, SinoAI `line` kenar): `sparkles` 18 + `small` "SinoAI taslağını yalnız sen istediğinde görür. Okuduğu satırları önce sana gösterir." / "SinoAI sees your working only when you ask, and shows you what it read first.". Taslak hiçbir zaman kendiliğinden gönderilmez (`Tablet-Kalem.md` §3.7).
- **Kurallar:** yanlışta üç yol her zaman vardır: doğru şık ve neden, konunun anlatımı (Dersler renginde), SinoAI'ye sor (UIUX-Rehberi §5.4). Neden metni yoksa "Bu soru için çözüm eklenmemiş." yazılır; düğmeler yine görünür.

### `t-test-sekilli-soru` Şekilli soru · şekle yaz (yalnız tablet)

- **Görseller:** `acik/tablet/t-test-sekilli-soru.png`, `koyu/tablet/t-test-sekilli-soru.png`
- **Çerçeve:** `SolveBar`: `meta` "Üçgende açılar · Kolay" / "Angles in triangles · Easy", `headline` "Soru 3 / 20", çip "2 doğru" / "2 right"; "Soruya yaz" açık, "Taslak kâğıdı" kapalı.
- **Yerleşim:** satır, aralık 18, dolgu 4 / 22 / 26. Solda dikey `PenToolbar` (mavi kalem seçili, ortalı). Ortada soru kartı yatay (aralık 26): sol sütunda kök `body` 19 / 30 "Şekildeki ABC üçgeninde verilenlere göre x kaç derecedir?" / "In triangle ABC, what is x in degrees?" ve 440 pt genişliğinde şekil (üçgen zemini `wash`, kenar `ink` 2,2; köşe adları 15 pt 800 `ink`; açı değerleri 14 pt 700 `ink`); kalem izleri şeklin üstünde. Sağ sütun 260 pt: şıklar A 50, B 60, C 70, D 80; elenen şıklar kalemle çizili ve %55 soluk; B daire içinde ve seçili. Altta `Button block` "Cevapla" / "Answer" (10 pt üst boşluk).
- **Kurallar:** kalemle daire çizmek cevap sayılmaz; cevap şıkka **tek dokunuşla** verilir (`Tablet-Kalem.md` §3.5). "Cevapla" düğmesi yoktur (sahip kararı 17 Kasım 2026); şıkların altında `meta` "Cevap için şıkka dokun; kalem işareti cevap sayılmaz." / "Tap an option to answer; ink is not an answer."

### `m-test-bitti` Test bitti

- **Görseller:** `acik/mobil/m-test-bitti.png`, `koyu/mobil/m-test-bitti.png`, `en/acik/mobil/m-test-bitti.png`. Web çizimi yok.
- **Çerçeve:** `AppHeader left=close` (`x`), başlık "Test bitti" / "Quiz done", sağ boş. Tab bar yok. `BottomBar` iki düğmeli.
- **Yerleşim** (ortalı, aralık 14):
  1. `Ring` 160 pt, çizgi 12, değer `color`, iz `track`; ortada `num` 40 pt "16/20" ve `meta` "doğru" / "correct".
  2. `hero` 26 pt "Orta seviye tamam" / "Medium complete".
  3. `body` "Problemlerde ilerledin. Zor seviye açıldı." / "You moved up in Problems. Hard is unlocked." (sonraki seviye açıldıysa).
  4. Üç küçük kart (üç sütun, aralık 10, `Card` dolgu 12): `section` değer + `meta` etiket: "24 dk" / "süre" ("24 min" / "time"), "4" / "yanlış" ("wrong"), "+1" / "seviye" ("level").
  5. `BottomBar`: `Button size=lg block` `action` "Zor seviyeye geç" / "Go to Hard"; altında `Button tone=moduleSoft size=lg block` "Yanlışlarımı incele" / "Review my mistakes" (`soft` zemin, `ink` yazı).
- **Veri:** `POST .../complete` → `attemptId`, `correctCount`, `wrongCount`. Sonraki seviye: `GET .../lesson-subs/{lessonSubId}` listesinde sıradaki `isUnlocked` test. Süre: API'de doğrulanmalı (tamamlama yanıtında yok). "+1 seviye" istemcide hesaplanır.
- **Etkileşimler:** "Zor seviyeye geç" → sonraki seviye [replace]; "Yanlışlarımı incele" → `m-test-yanlislar` (`attemptId`) [push]; kapat → seviyeler [pop]. Sonraki seviye yoksa (Zor bitti) ana düğme konunun konu sonuna ya da derse döner (çizilmedi; doğrulanmadı). Hiç yanlış yoksa "Yanlışlarımı incele" gizlenir ya da "Çözümleri gör" olur (doğrulanmadı).
- **Hâller:** tamamlama gönderiliyor: "Testi bitir" düğmesi `loading`, kilitli; tamamlama hatası: çözme ekranında kalır, hata mesajı, düğme yeniden dener.
- **Kurallar:** bitti ekranı yalnız bir kez açılır; geri tuşu çözme ekranına dönmez. Başarı halkası rengi modül rengidir; doğru/yanlış sayıları durum rengiyle gösterilmez.

### `m-test-cozumler` Çözümler · web: `w-test-cozumler` · boş: `m-test-cozumler-bos`

- **Görseller:** `acik/mobil/m-test-cozumler.png`, `acik/mobil/m-test-cozumler-bos.png`, `koyu/mobil/…`, `en/acik/mobil/…`; `acik/web-panel/w-test-cozumler.png`
- **Çerçeve:** `AppHeader` varsayılan (profil, zil). Tab bar var, aktif yuva 4. Modül yıkaması.
- **Yerleşim (dolu):** aralık 14.
  1. `PageTitle` modül çipi, başlık "Çözümler" / "Solutions", alt satır "Çözdüğün testlerin cevapları" / "Answers to quizzes you took".
  2. `Segmented` (dolgu 4, tam yuvarlak, `line2` zemin; öğe 34 pt, 13 pt 700; seçili `card` zemin, `ink` yazı, hafif gölge; pasif `muted`): "Tümü" / "All", "Yanlışlar · 9" / "Wrong · 9", "İşaretli · 3" / "Flagged · 3".
  3. `List`: satır `Tile` 38 `checkCircle`, başlık "Problemler · Orta" / "Problems · Medium" (konu · seviye), alt satır gün "Bugün" / "Today", "Dün" / "Yesterday", "Pazartesi" / "Monday"; sağda `headline` "16/20". Çözülmüş tekrar testi satırı `refresh` ikonlu ve **"Problemler · Tekrar"** / "Problems · Review" adlı (seviye yerine "Tekrar"), sağda "8/10".
  4. `Card tone=module` dolgu 14: `sparkles` 18 pt (`color`), `small` "Yanlışlarından 10 soruluk bir tekrar testi hazır." / "A 10-question review quiz from your mistakes is ready." ve sağda `module` `sm` "Başla" / "Start" (sahip kararıyla kalır; uç API'ye eklenecek, gelene kadar kart görünmez). "İşaretli" süzgeci de kalır: işaretli soruların listesi.
- **Yerleşim (boş, `m-test-cozumler-bos`):** `PageTitle` "Çözümler" (alt satır yok); `StateBlock` (dolgu 22 / 18 / 20, köşe 24, `card`, ortalı): 64 pt köşe 22 `soft` kutuda `quiz` 30 pt `color`; `section` 18 "Çözdüğün testler burada" / "Your solved quizzes appear here"; `body` 15 / 22 "Her testin soruları, cevapların ve çözümleri; yanlışlarına tek dokunuşla dönersin." / "Every quiz with your answers and solutions; jump back to mistakes in one tap."; `Button module=tests block` "Senin için hazır test" / "Your ready quiz"; altında `small` 700 `ink` bağlantı "Problemler · Orta · 20 soru" / "Problems · Medium · 20 q".
- **Veri:** `GET student/quizzes/result-cards` → `attemptId`, `quizId`, `title`, `lessonMainId`, `lessonSubId`, `difficulty`, `completedAtUtc`, `correctCount`, `wrongCount`, `questionCount`. Liste en yeni tamamlanan önce. Gün metni `completedAtUtc`'den (bugün, dün, haftanın günü, sonra tarih). "Yanlışlar · 9" sayacı ve "İşaretli" süzgeci: API'de doğrulanmalı (soru işaretleme alanı yok). Tekrar testi kartı: API'de doğrulanmalı.
- **Etkileşimler:** süzgeç → liste süzülür (animasyonsuz, seçim titreşimi); satır → `m-test-yanlislar` [push]; tekrar testi kartı → testi açar (çizimde düğme yok; dokunulabilir kart olarak kodlanırsa 44 pt; doğrulanmadı); boş hâlde "Senin için hazır test" → `m-test-coz` [push], ikinci bağlantı aynı testin adıdır.
- **Yerleşim (İşaretli, `m-test-cozumler-isaretli`):** aynı başlık, süzgeçte "İşaretli · 3" seçili; tekrar testi kartı yok. `List` satırı: `Tile` 38 `bookmark`, başlık "Problemler · Orta · soru 7" (konu · seviye · soru no), alt satır sorunun kökünün başı (tek satır, `…` ile kesilir), sağda ok. Bitmemiş testin sorusu: ok yerine `lock` 14 `subtle` + `meta` "Test bitince açılır"; dokunulmaz.
- **Web farkı (`w-test-cozumler`, `w-test-cozumler-isaretli`):** `ModuleHead` aktif hap Çözümler, başlık "Çözümler", alt satır "Çözdüğün testler; yanlışlarına tek tıkla dön" / "Your solved quizzes". Altında aralık 16 ile iki blok, ikisi de tam genişlik:
  1. `WCard`: üstte en çok 460 px `Segmented` (mobildeki üç süzgeç), altında satırlar (dolgu 12 / 4, alt çizgi `line2`): `Tile` 40 `quiz` (tekrar testi `refresh`), `headline` "Problemler · Orta", `small` "16/20 doğru · Bugün", sağda `Button tone=moduleSoft size=sm` "Yanlışlarım" / "My mistakes". İşaretli süzgecinde satır sağında "Soruyu aç" / "Open question" ya da kilit + "Test bitince açılır".
  2. Tekrar testi `Card tone=module` dolgu 18 (yalnız Tümü / Yanlışlar süzgecinde): `Tile` 40 `refresh`, `headline` "Yanlışlarından tekrar testi", `small` "Yanlışlarından 10 soruluk bir tekrar testi hazır.", sağda `module` "Başla".
- **Kurallar:** sıfır sayısı "0" diye öne çıkarılmaz; boş hâl tek eylem sunar.

### `m-test-yanlislar` Yanlışlarım · web: `w-test-yanlislar` · tablet: `t-test-yanlislar`

- **Görseller:** `acik/mobil/m-test-yanlislar.png`, `koyu/mobil/m-test-yanlislar.png`, `en/acik/mobil/m-test-yanlislar.png`; `acik/web-panel/w-test-yanlislar.png`; `acik/tablet/t-test-yanlislar.png`
- **Çerçeve:** `FocusHeader left=left` (geri oku), ortada `meta` "Temel Kavramlar · Kolay" / "Basics · Easy" ve `headline` "Yanlışlarım" / "My mistakes", sağ boş. Tab bar yok. `BottomBar` var.
- **Yerleşim:**
  1. Üst blok (yan dolgu 18, aralık 10): `Segmented module=tests` "Yanlış · 15" / "Wrong · 15", "Boş · 0" / "Blank · 0", "Tümü · 20" / "All · 20" (seçili yazı `ink`). **İçi boş süzgeç (`· 0`) soluk** (`subtle` yazı, %60 saydamlık) ve dokunulmaz (`Segmented off`). Altında soru numaraları satırı (aralık 6), **yalnız seçili süzgeçteki sorular**: 34 × 34 pt, köşe 10; şu anki `action` dolgu ve kenar, beyaz `meta` 800; yanlış `errorSoft` zemin, 1,5 `error` kenar, `errorInk` rakam; doğru (Tümü süzgecinde) `successSoft` / `success` / `successInk`; boş `card` / `line` / `ink2`. En çok 8 hücre; kalanlar `meta` "+7" ile sayılır (sayaç sonda; son sorular gösterilirken başta, `m-test-yanlislar-son`).
  2. İçerik (dolgu 12 / 18 / 10, aralık 10): `meta` "Soru 3 / 20 · 1. yanlış" / "Question 3 / 20 · 1st mistake"; kök `body` 17 / 26 600 "Aşağıdakilerden hangisi tam sayıdır ama doğal sayı değildir?" / "Which is an integer but not a natural number?"; şıklar (A −4 doğru, B 0, C 3/2 yanlış, D 7); çözüm kartı `Card` dolgu 14: `headline` "Neden −4?" / "Why −4?", `small` `ink2` açıklama, `meta` "Öğrencilerin %50’si bildi" / "50% got it right".
  2b. Neden kartının altında iki eşit ghost `sm` düğme (aralık 8): "Bu soruyu paylaş" / "Share this question" (`upload`; soru paylaşım kartı) ve "SinoAI'ye sor" / "Ask SinoAI" (`sparkles`; soru ve doğru cevapla SinoAI sohbeti). Meta satırının sağında `FlagButton` (örnekte açık: "İşaretli"). Web'de iki düğme "Konuyu çalış"ın yanında.
  3. `BottomBar`: iki eşit düğme (aralık 10): `Button tone=moduleSoft module=lessons icon=book` "Konuyu çalış" / "Study the topic"; `Button tone=module module=tests iconRight=right` "Sonraki yanlış" / "Next mistake". **Süzgecin son sorusunda** ikinci düğme `icon=check` "Bitti" / "Done" (→ Çözümler). Tümü süzgeciyle açıldıysa (yanlış yok) "Sonraki soru" / "Next question".
- **Veri:** `GET student/quizzes/review/{attemptId}` → `title`, `difficulty`, `correctCount`, `wrongCount`, `questionCount`, `questions[]` (her biri `studentAnswer` {`selectedOptionId`, `isCorrect`} ya da boş, `correctOptionId`, `solutions`). Yanlış = `isCorrect === false`; boş = `studentAnswer` yok. "Öğrencilerin %X’i bildi": incelemede alan yok (cevap yanıtındaki `peerSuccessPercent`); API'de doğrulanmalı.
- **Etkileşimler:** süzgeç → numara satırı ve içerik o süzgece geçer, ilk soru açılır; numara → o soru; "Sonraki yanlış" → süzgeçteki sonraki; "Konuyu çalış" → Dersler konusu [modül değişimi]; geri → `m-test-bitti` ya da `m-test-cozumler` [pop]. Paylaş ("Bu soruyu paylaş") ve SinoAI'ye sor çizimde yok; bugünkü kodda var (bkz. §7).
- **Hâller:** yükleniyor; süzgeçte soru yok: "Bu filtrede soru yok." / "No questions in this filter."; deneme bulunamadı (404): "Deneme bulunamadı." yerine kullanıcı dilinde "Bu test bulunamadı." ve Çözümler'e dönüş (öneri; çizilmedi).
- **Web farkı (`w-test-yanlislar`, `w-test-yanlislar-son`):** `ModuleHead` aktif hap Çözümler, başlık "Yanlışlarım · Temel Kavramlar" / "My mistakes · Basics", alt satır "Kolay · 5 / 20 doğru · ilk yanlıştan açıldı" / "Easy · 5 / 20 · opened at the first mistake" (son yanlışta "… · son yanlış"). İki sütun `300px minmax(0, 1fr)`: solda `WCard`: `Segmented` "Yanlış · 15", "Boş · 0" (soluk), "Tümü · 20"; altında 5 sütunlu ızgara **testin bütün soruları** (süzgeç ızgarayı değiştirmez; aralık 8, hücre 40 px, köşe 10; şu anki `action`, yanlış `errorSoft`/`error`/`errorInk`, doğru `successSoft`/`success`/`successInk`, boş `card`/`line`). Son yanlışta sağ alttaki ana düğme `check` "Bitti". Sağda `WCard`: `meta` "Soru 3 / 20 · 1. yanlış", kök `body` 18 600, şıklar iki sütun, açıklama `body`, satır: `moduleSoft lessons` "Konuyu çalış", boşluk, `module tests` "Sonraki yanlış". Klavye: ←/→ soru, Enter sonraki yanlış (öneri; çizimde yok, doğrulanmadı).
- **Tablet farkı (`t-test-yanlislar`):** web sayfasının kendisi tablet çerçevesinde (`PanelInTablet`): üstte uygulama `AppHeader` (profil, zil; 18 pt yan dolgu), altında web sayfası (dolgu 0 / 28 / 22, aralık 14), web sol menüsü ve üst çubuğu yok; modül yıkaması var.
- **Kurallar:** ekran ilk yanlıştan, yoksa ilk boştan, o da yoksa 1. sorudan ("Tümü") açılır; "Tümü" süzgecinde doğru sorular da gösterilir; son soruda ana düğme "Bitti"; içi boş süzgeç dokunulmaz.

### `m-test-baglanti` Bağlantı yok · `m-test-bitir-bekliyor` · web: `w-test-baglanti`

- **Görseller:** `acik/mobil/m-test-baglanti.png`, `acik/mobil/m-test-bitir-bekliyor.png`, `acik/web-panel/w-test-baglanti.png` (+ `koyu/`, `en/acik/`)
- **Çerçeve:** `m-test-coz` ile aynı (`FocusHeader`, numara çubuğu, meta satırında `FlagButton`).
- **Yerleşim (`m-test-baglanti`):** kök, dört şık; seçilen şık `selected` (modül çizgisi ve `wash`), doğru/yanlış rengi yok. Şıkların altında `PendingSyncNote module=tests reveal` (13 pt modül `ink`, ikon yok, kırmızı yok): "Bağlantı yok; cevabın kaydedildi. Bağlanınca gönderilecek, doğrusu o zaman görünür." / "No connection; your answer is saved. It will be sent when you reconnect, and the right answer shows then." Numara çubuğunda bu soru modül renginde (sonuç bilinmiyor). `BottomBar`: `module` `lg` "Devam".
- **Yerleşim (`m-test-bitir-bekliyor`):** son soru (20 / 20), aynı not; altta "Testi bitir". Dokunulunca `Sheet` (230 pt): yalnız `body` 600 metin "Bekleyen cevapların henüz gönderilmedi. Bağlantı gelince testi bitirebilirsin." ve `module` "Tamam". Başlık yok; uyarı kırmızı değil.
- **Web (`w-test-baglanti`):** `Immersive` son soru; şıkların altında aynı not; altında tek `Card` (en çok 760 px): `info` 20 `ink2`, aynı uyarı metni ve sağda `module` `lg` "Testi bitir".
- **Kurallar:** bağlanınca kuyruk kendiliğinden gönderir; not kalkar, başka hiçbir şey yer değiştirmez. Bekleyen cevap varken `complete` çağrılmaz. Not Dersler ve Denemeler'deki notla aynı bileşendir; yalnız Testler `reveal` metnini kullanır.

## 5. Takılma ve kilitlenme önlemleri

- **Çift gönderim:** şıkka dokunulunca cevap isteği bitene kadar bütün şıklar kilitlidir; ikinci dokunuş istek göndermez. "Testi bitir" `loading` iken kilitli. Sunucu `alreadyApplied` ya da 409 "zaten cevaplandı" dönerse paket yeniden çekilir, sunucudaki cevap gösterilir; ikinci kez sayılmaz.
- **Zaman aşımı:** cevap ve başlatma isteği zaman aşımı süresinde (okuma 25 sn, gönderim 60 sn; [Navigasyon](Navigasyon.md) §6.1) dönmezse hata hâli ("Cevap gönderilemedi." / "Test başlatılamadı.") ve "Tekrar dene"; şık seçimi geri alınır.
- **Kaldığı yerden devam:** testin süresi yoktur. Her cevap anında sunucuya yazılır; uygulama arka plana geçse ya da kapansa da kaldığı soru `start` ile geri gelir. Çıkışta onay sorulmaz.
- **Ağ kopması:** cevap merkezi çevrimdışı kuyruğa yazılır, şıklar kilitlenir, "Devam" açık kalır; şıkların altında ortak not (`m-test-baglanti`). Sarı şerit yok. Bekleyen cevap varken "Testi bitir" bitirmez, uyarıyı gösterir (`m-test-bitir-bekliyor`). Çevrimdışıyken açılan liste ekranları son veriyi gösterir.
- **Geri tuşu:** her ekranda çalışır. Çözmeden çıkış veri kaybettirmez. Bitti ekranı `replace` ile açıldığı için geri çözme ekranına dönmez.
- **Uzun liste:** ders, konu ve çözüm listeleri sanallaştırılır (`FlatList` / web'de sayfa kaydırma); son satır yüzen tab barın altında kalmaz (alt dolgu 108 pt + güvenli alan).
- **Yükleme donmaz:** ilk yükleme ortada `LoadingLogo`; veri varken yenileme içeriği yerinde bırakır. Çekip yenileme yalnız listelerde; çözme ekranında kapalı.
- **Modallar:** SinoAI'ye sor modali geri hareketiyle ve kapat düğmesiyle kapanır; kapanınca çözme ekranı aynı soruda kalır.
- **Hareketi azalt:** sonraki soru geçişi ve şık animasyonları kısalır (150 ms, yalnız saydamlık).

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| T1 | görsel | ikisi | `m-test-vitrin`, `w-test-vitrin` | Örnek veriyle aç, açık ve koyu tema | PNG ile yan yana aynı: vitrin kartı, ders listesi, ilerleme çubukları Testler renginde |
| T2 | bileşen | ikisi | vitrin | Ders listesini 0, 1, 30 dersle çiz | Boşta boş hâl; 30 derste liste kayar, son satır tab barın altına girmez |
| T3 | e2e | mobil | §3.1 | Ders → konu → seviye → 20 soru → bitir | Her soru anında doğru/yanlış gösterir; bitti ekranı doğru sayıyı gösterir; sonraki seviye açılır |
| T4 | e2e | web | §3.1 web | Ders → konu kartı | Sıradaki açık seviye doğrudan açılır |
| T5 | birim | ikisi | çözme | Doğru şıkka dokun | Tek istek; şık yeşil ve tikli; panel `successSoft`; "Devam" `#047857` |
| T6 | birim | ikisi | çözme | Yanlış şıkka dokun | Seçilen kırmızı çarpılı, doğru şık yeşil; panelde "Doğrusu X: …" Konu anlatımı (Dersler renginde), SinoAI'ye sor |
| T7 | birim | ikisi | çözme | Şıkka hızlıca iki kez dokun | Yalnız bir `POST .../solutions` isteği |
| T8 | e2e | mobil | çözme | 5. soruda uygulamayı kapat, yeniden aç ve aynı seviyeyi seç | 6. sorudan (ilk cevapsız) devam eder; seviye kartı "Devam et" der |
| T9 | birim | ikisi | çözme | Cevap isteği ağ hatası verir | Panel açılmaz, şıklar geri açılır, hata metni ve yeniden deneme |
| T10 | birim | ikisi | çözme | Yanıt zaman aşımından uzun gecikir | Hata hâli ve "Tekrar dene"; ekran donmaz |
| T11 | e2e | mobil | yanlış | "Konu anlatımı" | Dersler'de doğru konu, ilgili adımdan açılır; geri dönünce aynı soru ve panel |
| T12 | e2e | ikisi | yanlış | `workMikroId` olmayan soru | Düğme "Konuyu çalış" ve konuyu açar |
| T13 | e2e | mobil | bitti | "Yanlışlarımı incele" | `m-test-yanlislar` ilk yanlıştan, "Yanlış" süzgeci seçili açılır |
| T14 | birim | mobil | bitti | Geri tuşu | Çözme ekranına dönmez; seviyeler açılır |
| T15 | e2e | ikisi | Çözümler | Hiç test çözmemiş hesap | `m-test-cozumler-bos`: tek eylem "Senin için hazır test" |
| T16 | birim | ikisi | seviyeler | Kilitli seviyeye dokun | Bilgi bildirimi, gezinme yok, istek yok |
| T17 | birim | ikisi | tümü | Hiçbir ekranda "Tarama", "quiz", "Lens" yazmaz | Test adında "tarama" geçse de ekranda görünmez |
| T18 | birim | ikisi | seviyeler, vitrin | Seviye sayısı | Yalnız Kolay, Orta, Zor; her biri 20 soru, ~25 dk |
| T19 | görsel | ikisi | tümü | TR ve EN | EN kopyası `en/` PNG'leriyle aynı; yüzde TR `%90`, EN `90%` |
| T20 | erişilebilirlik | ikisi | tümü | En büyük yazı boyutu / %200 yakınlaştırma | Başlık, şık ve düğme metni kesilmez; kutular büyür |
| T21 | erişilebilirlik | ikisi | çözme | Kontrast ölçümü açık/koyu | Şık metni, panel başlığı (`successInk`, `errorInk`), düğme yazısı ≥ 4,5:1 |
| T22 | erişilebilirlik | ikisi | çözme | Ekran okuyucu | Şıklar "A şıkkı, 260" diye okunur; cevaptan sonra "Doğru" ya da "Yanlış, doğrusu B" duyurulur; kapat düğmesinin adı var |
| T23 | erişilebilirlik | web | çözme | Klavye | 1–5 şık seçer, Enter devam; odak halkası 2 px görünür |
| T24 | birim | mobil | tümü | Dokunma alanları | Şık satırı, geri, kapat, süzgeç ≥ 44 pt / 48 dp |
| T25 | görsel | tablet | `t-test-coz-taslak` | Kalemli tablette çözme | Taslak sağda 454 pt; araç çubuğu metni kapatmaz; taslak soruya kayıtlı geri gelir |
| T26 | e2e | tablet | `t-test-coz-yanlis` | "Taslağımı SinoAI’ye göster" | Gönderilmeden önce okunan satırlar gösterilir; dokunulmadan hiçbir şey gönderilmez |
| T27 | birim | ikisi | abonelik | 403 abonelik yanıtı | Modül içeriği yerine paket kartı; ödeme düğmesi `#C2410C` |
| T28 | görsel | mobil | tümü | Koyu tema | Modül rengi `#818CF8`, yazı `ink` `#ADB4FA`, düğme dolgusu `#4F46E5` |
| T29 | görsel | mobil | `m-test-vitrin` | Slaytları kaydır | Sayfa sayfa geçer; ilk slayt "Senin için hazır"; noktalar sayfayı gösterir; dersler çubuklu liste |
| T30 | e2e | mobil | `m-test-konular` | Kapalı derse dokun | O ders açılır, öncekini kapatır; konu satırları üç seviye çubuğuyla; ekran değişmez |
| T31 | e2e | ikisi | `m-test-detay` | Bitmiş, başlanmış, açık ve kilitli seviye | Sırasıyla "Tekrar", "Devam et", "Başla", kilit + "Kilitli"; ders çipi dersi değiştirir; "Bu dersteki haftan" kartı |
| T32 | e2e | ikisi | çözme, Yanlışlarım | "İşaretle"ye dokun, sonra yeniden | "İşaretli" (modül renginde, yazı da değişir), sonra yeniden "İşaretle"; soru Çözümler › İşaretli'de görünür / kalkar |
| T33 | e2e | ikisi | Yanlışlarım | "Bu soruyu paylaş", "SinoAI'ye sor" | Paylaşım kartı (hikâye / gönderi) açılır; SinoAI sohbeti soru ve doğru cevapla açılır |
| T34 | e2e | tablet | `t-test-sekilli-soru` | Şıkkı kalemle daire içine al, sonra şıkka dokun | Kalem cevap sayılmaz; dokunuş anında cevaplar; "Cevapla" düğmesi yok |
| T35 | e2e | üçü | Yanlışlarım | Süzgecin son sorusuna gel | Ana düğme "Bitti"; dokununca Çözümler açılır |
| T36 | e2e | ikisi | Yanlışlarım | Yanlışı olmayan, boşu olan deneme | İlk boşta, "Boş" seçili açılır; "Yanlış · 0" soluk ve dokunulmaz |
| T37 | e2e | ikisi | Yanlışlarım | Bütün soruları doğru deneme | 1. soruda, "Tümü" seçili; ana düğme "Sonraki soru" |
| T38 | görsel | web, tablet | Yanlışlarım | Süzgeci değiştir | Izgara hep 20 soru (doğrular yeşil); telefonda numara satırı yalnız süzgeçtekiler |
| T39 | e2e | ikisi | Çözümler › İşaretli | Bitmiş ve bitmemiş testin işaretli sorusu | Bitmiş: Yanlışlarım "Tümü" süzgeciyle o soruda açılır; bitmemiş: "Test bitince açılır", gezinme yok |
| T40 | e2e | ikisi | çözme | Uçak kipinde şıkka dokun, sonra bağlan | Şık seçili kalır, ortak not görünür, "Devam" açık; bağlanınca not kalkar, sonuç numara çubuğunda görünür |
| T41 | e2e | ikisi | çözme | Bekleyen cevapla "Testi bitir" | Test bitmez, `complete` isteği yok; uyarı metni görünür |
| T42 | görsel | web | `w-test-konular`, `w-test-cozumler` | Aç | Ders çipi yok, "Tüm dersler" var; Çözümler'de süzgeç, tekrar testi kartı, satırda "Yanlışlarım"; tekrar testi "Konu · Tekrar" |

## 7. Çizim ile bugünkü kod arasındaki farklar

Mobil: `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\quiz\`. Web: `C:\Users\onurc\source\repos\sinavika_frontend_student\src\features\quizzes\`.

1. **Testte cevap (mobil):** bugünkü kod şık seçtirip alttaki "Cevapla" düğmesiyle gönderiyor (`QuizSolveScreen.tsx`, `quiz.solve.check`); çizim ve web tek dokunuş. Cevaptan sonra mobil düğme "Sonraki soru" / "Testi bitir"; çizimde "Devam". UIUX-Gecmis §7'de açık iş.
2. **Ders → konu atlanıyor (mobil):** `QuizOverviewScreen.tsx` ders satırına dokununca konu listesini göstermeden ilk bitmemiş konunun seviyelerini açıyor (`pickQuizLessonSubParams`). Çizim: ders → `m-test-konular` → `m-test-detay`. Konular sekmesi (`QuizCatalogScreen.tsx`) çizimdeki tek ders konu listesi yerine bütün derslerin açılır ağacı (`QuizBrowseTree.tsx`).
3. **Kapandı (17 Kasım): vitrin slaytları, noktalar ve istatistik kartı çizimde.** Dersler çubuklu liste kalır (halka ızgarası kodda kaldırılacak). Eski not: **Vitrin (mobil):** bugünkü ekran sayfalı iki slayt ("Kaldığın yer · Devam et" ya da "Konu testlerine başla", ikincisi "Konular"), istatistik kartı (`ProfileModuleStatisticsCard`) ve halkalı ders ızgarası (`ModuleLessonRingGrid`) gösteriyor. Çizim: tek "Senin için hazır" kartı ve çubuklu ders listesi. Halka mı çubuk mu sahibin açık kararı (UIUX-Gecmis §7).
4. **Doğru/yanlış paneli metinleri:** mobil "Doğru" / "Yanlış" + "Doğru şık: B" + çözüm listesi; çizim "Doğru! Seriyi sürdürdün." / "Doğrusu B: 4 gün" + kısa neden. Web doğruda çizime yakın, yanlışta "Olmadı. Doğrusu {key}." yazıyor. Konu anlatımı düğmesi iki uygulamada "Konunun ilgili kısmını çalış · 4 dk"; çizimde mobil "Konu anlatımı", web "Bu konunun anlatımı · 4 dk".
5. **Test bitti:** mobil `QuizCompleteScreen.tsx` düğmeleri "Sonraki adım", "Yanlışlarımı incele", "Adımlara dön"; çizimde "Zor seviyeye geç" (sonraki seviyenin adıyla) ve "Yanlışlarımı incele"; çizimdeki süre ve "+1 seviye" kartları yok, "Orta seviye tamam" başlığı yerine "Test bitti". Web bitti bloğunda (`QuizzesPlayerPage.tsx`) "Sıradaki seviyeye geç", "Çözümleri gör" (bu denemenin incelemesine değil Çözümler listesine gider), "Konulara dön"; web çizimi yok.
6. **Kapandı (17 Kasım): uygulama çizime geçti; son yanlış, yanlış yok, ızgara kuralları çizildi.** Eski not: **Yanlışlarım:** mobil `QuizReviewScreen.tsx` ilk sorudan (`index 0`) ve "Tümü" süzgeciyle açılıyor; çizim ilk yanlıştan ve "Yanlış" süzgeciyle. "Sonraki yanlış" yerine "Önceki soru" / "Sonraki soru" ve "Tekrar çöz". Web `QuizReviewPage.tsx` bütün soruları alt alta liste olarak gösteriyor; çizimdeki sol soru ızgarası, süzgeç ve "Sonraki yanlış" yok; "Konuyu çalış" yok, onun yerine paylaş ve SinoAI'ye sor var.
7. **Kapandı (17 Kasım): uygulamada süzgeç ve tekrar testi kartı iki platformda; web çizimi eklendi (`w-test-cozumler`, `w-test-cozumler-isaretli`).** Eski not: **Çözümler:** mobil ve web listede süzgeç ("Tümü / Yanlışlar / İşaretli") ve "tekrar testi hazır" kartı yok. Web satırında "Yanlışlarım" düğmesi yerine satırın tamamı bağlantı. Mobil boş hâl eylemi "Bir test seç"; çizimde "Senin için hazır test". Web boş metni farklı ve eylemi "Konulara git".
8. **Kapandı (17 Kasım): istatistik kartı, ders çipleri ve satır düğmeleri çizimde.** Eski not: **Seviye ekranı (mobil):** `QuizLessonSubScreen.tsx`'te çizimde olmayan istatistik kartı ve ders çipi satırı var; konu kartında "net kaybettin" cümlesi yerine "x / y tamamlandı" ve ilerleme çubuğu; alt "… seviyeyi başlat" düğmesi yok, seviye satırlarında "Başla / Devam et / Tekrar / Kilitli / İptal" düğmeleri var (`QuizStepPath.tsx`). Satır başlığı test adından (`item.title`) geliyor; adda "tarama" kalmışsa öğrenciye görünür (SQL 13 hâlâ açık, UIUX-Gecmis §7).
9. **Web rota:** Registry `w-test-konular` için `/student/testler/[lessonMainId]` diyor; bu yol bugün yalnız `/student/testler/konular?main=` adresine yönlendiriyor (`app/[locale]/(student)/student/(panel)/testler/[lessonMainId]/page.tsx`). İki çizim (`w-test-konular`, `w-test-konular-tum`) tek sayfaya düşüyor.
10. **Web metadata:** `/student/testler` sayfa açıklaması "Adım adım, beş seviyeli konu testleri." (`app/[locale]/(student)/student/(panel)/testler/page.tsx`); ürün üç seviyelidir.
11. **Mobil "Senin için hazır":** web öneri uçlarından hazır testi buluyor; mobilde hazır test kartı yok. Mobil Çözümler boş hâli de hazır testi açmıyor.
12. **Kapandı (17 Kasım): tablet şekilli soruda "Cevapla" kaldırıldı; `t-test-coz-yanlis`'e "Devam" eklendi.**
13. **Çizim içi küçük farklar:** Düzeltildi (17 Kasım 2026): `m-test-bitti` EN süresi "24 min"; `w-test-yanlislar` Registry satırına modül (`tests`) eklendi; `m-test-vitrin` ok ikonu `subtle` jetonu. Açık kalan: `w-test-konular-tum` konu adları EN kopyada Türkçe.
14. **Hak / abonelik:** iki uygulamada abonelik hâli var (mobil `QuizPaywallView.tsx`, web hata ekranı); çizimi yok. Mobil ders açarken abonelik hatasını sistem uyarısıyla (`Alert`) gösteriyor; kural paket kartıdır.
