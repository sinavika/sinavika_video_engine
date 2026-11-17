# Bildirimler, destek ve durumlar · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Account.tsx` (`NotificationsScreen`, `SupportHubScreen`, `SupportNewScreen`, `SupportTicketScreen`, `EmptyStateScreen`, `ErrorStateScreen`), `Screens/Mobile/Notifications.tsx` (ayarlar, kilit ekranı, canlı etkinlik, widget), `Screens/Mobile/States.tsx` (`NotificationsEmptyScreen`, `ForceUpdateScreen` ve modül durumları), `Screens/Mobile/Gaps.tsx` (`SupportTicketsScreen`), `Screens/Mobile/Onboarding.tsx` (`OnbNotificationsScreen`), `Screens/Web/Panel.tsx` (`WebNotificationsScreen`, `WebSupportScreen`, `WebSupportTicketScreen`, `WebStatesScreen`), `Parts/Study.tsx` (`StateBlock`), `Parts/Shared.tsx` (`LoadingLogo`, `Field`, `Button`), `Parts/System.tsx`
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

**Bu dosyanın §4.6 bölümü bütün modül dosyalarının başvurduğu ortak durum tanımıdır** (yükleniyor, boş, hata, çevrimdışı, form hatası, gönderiliyor, klavye odağı, hak doldu, zorunlu güncelleme, zaman aşımı). Modül dosyaları yalnız kendi metinlerini ve kendi durum ekranlarını (`-bos`, `-ilk`, `-hak`, `-baglanti` …) yazar.

## 1. Modül özeti

- **Ne işe yarar:** öğrencinin kendisine gelenleri (deneme sonucu, günün planı, SinoAI üretimi, destek yanıtı) tek listede görmesi ve doğru ekrana tek dokunuşla inmesi; bildirim türlerini açıp kapatması; sorununu destek ekibine yazması; uygulamanın her ekranında aynı yükleniyor, boş, hata ve çevrimdışı kalıbını görmesi.
- **Bu bir modül değil.** Bildirimler ve Destek marka yüzeyidir: vurgu `brand` turuncu, düğme `action` `#C2410C` (beyazla 5,2:1), küçük turuncu yazı `brandDeep` (açık `#C2410C`, koyu `#FB923C`), yumuşak `brandSoft` (`#FFEDD5` / `#3B1D0C`), yıkama `brandWash` (`#FFF7ED` / `#22150C`). Bildirim satırının simge kutusu ve web'deki modül çipi, bildirimin geldiği **modülün** rengindedir (`Tile module`, `Chip tone="module"`: modülün `soft` tonu %12 / koyuda %21,6, simge modül rengi, yazı `moduleInk`).
- **Durumlar** bağlamın rengini alır: modül ekranında modülün rengi (`useAccent(module)`), modül dışında marka turuncusu. Durum renkleri ayrıdır: uyarı `warning` `#D97706` / `#FBBF24`, `warningSoft` `#FEF3C7` / `#3A2A08`, `warningInk` `#B45309` / `#FBBF24`; hata `error` `#DC2626` / `#F87171`, `errorSoft` `#FEE2E2` / `#3B1414`, `errorInk` `#B91C1C` / `#F87171`; başarı `success` `#059669` / `#34D399`, `successInk` `#047857` / `#34D399`. Bildirim rozeti her iki temada `#DC2626`.
- **Mobil tab bar:** bu ekranların hiçbirinde tab bar yoktur. Bildirimler üst çubuğun sağındaki zilden, Destek Profil'den (`m-profil-devam` › Destek) ve ana ekranın Destek kartından açılır. Bildirim ayarları Profil › Bildirimler'dedir.
- **Web:** sol menünün "Hesap" bölümünde `İstatistiklerim`, `Bildirimler` (okunmamış sayısı, `meta` 700 `muted`), `Destek`. Üst çubukta destek simgesi ve zil (okunmamış varsa 8 px `error` nokta, 2 px `card` halka). Yollar: `/student/bildirimler`, `/student/destek`, `/student/destek/[id]`.

## 2. Ekran haritası

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-bildirimler` | mobil | Bildirimler | `NotificationInbox` | `src/modules/notifications/presentation/screens/NotificationInboxScreen.tsx` | dolu, 3 okunmamış |
| `w-panel-bildirimler` | web | Bildirimler | `/student/bildirimler` | `src/features/notifications/pages/NotificationsPage.tsx` | dolu |
| `m-bildirimler-bos` | mobil | Bildirim yok | `NotificationInbox` | aynı ekranın `ListEmptyComponent` | boş |
| `m-bildirim-ayarlar` | mobil | Bildirim ayarları | `ProfileNotificationSettings` | `src/modules/profile/presentation/screens/ProfileNotificationSettingsScreen.tsx` | dolu |
| `m-onb-8-bildirim` | mobil | Bildirim izni · ilk mikro dersten sonra | `—` | yok (bugün `NotificationStudyPlanPromptHost.tsx` onay penceresi) | izin sorusu |
| `m-bildirim-canli-deneme` | mobil (iOS) | Canlı etkinlik · deneme başlıyor | `iOS Live Activity (ActivityKit)` | yok | §4.4 özet |
| `m-bildirim-canli-odak` | mobil (iOS) | Canlı etkinlik · odak oturumu | `iOS Live Activity (ActivityKit)` | yok | §4.4 özet |
| `m-bildirim-ada` | mobil (iOS) | Dynamic Island hâlleri | `iOS Live Activity (ActivityKit)` | yok | §4.4 özet |
| `m-bildirim-seri` | mobil (iOS) | Canlı etkinlik · akşam serisi | `iOS Live Activity (ActivityKit)` | yok | §4.4 özet |
| `m-bildirim-zengin` | mobil | Zengin bildirimler | `UNNotificationContent + attachment` | yok (metin bildirimi var) | §4.4 özet |
| `m-bildirim-genis` | mobil (iOS) | Bildirim · uzun basınca | `Notification Content Extension` | yok | §4.4 özet |
| `m-bildirim-android` | mobil (Android) | Android 16 · canlı güncelleme | `Notification.ProgressStyle (Live Update)` | yok | §4.4 özet |
| `m-bildirim-widget-kilit` | mobil (iOS) | Kilit ekranı widget’ları | `WidgetKit (accessory)` | yok | §4.4 özet |
| `m-bildirim-widget-ana` | mobil (iOS) | Ana ekran widget’ları | `WidgetKit (iOS)` | yok | §4.4 özet |
| `m-bildirim-widget-android` | mobil (Android) | Android ana ekran widget’ları | `Jetpack Glance (Android)` | yok | §4.4 özet |
| `m-destek` | mobil | Destek | `Support · SupportHub` | `src/modules/support/presentation/screens/SupportHubScreen.tsx` | dolu |
| `w-panel-destek` | web | Destek | `/student/destek` | `src/features/support/pages/student/SupportTicketsPage.tsx` | dolu (talep listesi + SSS) |
| `m-destek-talepler` | mobil | Taleplerim | `SupportTickets` | `SupportTicketsListScreen.tsx` | 3 talep |
| `m-destek-yeni` | mobil | Yeni talep | `SupportNew` | `SupportCreateTicketScreen.tsx` | dolduruluyor |
| `m-destek-talep` | mobil | Talep detayı | `SupportTicketDetail` | `SupportTicketDetailScreen.tsx` | yanıtlandı |
| `w-panel-destek-talep` | web | Destek talebi | `/student/destek/[id]` | `src/features/support/pages/student/SupportTicketDetailPage.tsx` | yanıtlandı |
| `m-durum-bos` | mobil | Boş durum (örnek: Akıllı Özet geçmişi) | `—` | ortak `src/shared/components/ui/AppEmptyState.tsx` | boş |
| `m-durum-hata` | mobil | Yükleniyor, hata, çevrimdışı (örnek: Denemelerim) | `—` | `ScreenState.tsx` (`ScreenLoading`, `ScreenError`), `AppConnectionBanner.tsx`, `SinavikaLoader.tsx` | yükleniyor + hata + çevrimdışı + form hatası |
| `w-panel-durumlar` | web | Boş, yükleniyor, hata | `—` | `src/components/ui/StatePanel.tsx` (`StateLoading`, `StateError`), `EmptyState.tsx`, `components/layout/student/OfflineStrip.tsx` | hepsi bir sayfada |
| `m-durum-guncelleme` | mobil | Zorunlu güncelleme | `ForceUpdateGate` | `src/app/bootstrap/ForceUpdateGate.tsx` | güncelleme gerekli |

Mobil yollar `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\`, web yollar `C:\Users\onurc\source\repos\sinavika_frontend_student\` altındadır. Modüllere ait durum ekranları (`m-plan-yok`, `m-ozet-hak`, `m-deneme-baglanti` …) kendi modül dosyalarında; burada yalnız kalıp tanımlanır.

## 3. Süreçler (akışlar)

### 3.1 Bildirim listesini açma ve okuma
1. Mobil: üst çubuktaki zil → `m-bildirimler` [push]. Web: sol menü `Bildirimler` ya da üst çubuk zili → `/student/bildirimler`.
2. `GET StudentNotificationMobile/notifications?skip=&take=` (web: `StudentNotificationWeb/notifications`). İlk açılışta ortada `LoadingLogo`; sonraki odaklanmalarda liste yerinde kalır, arkada yenilenir.
3. Satıra dokunma → okunmamışsa `POST …/notifications/{id}/read` → hedef ekran (§3.2) [push; hedef bir modülün sekmesindeyse o modüle geçilir]. Okundu isteği hata verse de gezinme olur.
4. `Okundu` (mobil üst sağ) / `Tümünü okundu yap` (web) → `POST …/notifications/read-all` → bütün satırlar okundu görünür, rozet sıfırlanır. Okunmamış yoksa düğme gizlenir.
5. `Okunmamış · 3` süzgeci yalnız okunmamışları gösterir; bu süzgeçte liste boşsa "Okunmamış bildirimin yok".
6. Liste sonuna gelince sonraki sayfa yüklenir (altta küçük satır içi gösterge).
7. Geri tuşu: geldiği ekrana döner. Rozet sayısı geri dönüşte güncellenir.

### 3.2 Bildirime dokununca açılan ekran
Kural: her bildirim doğru ekrana iner (Saat-Bildirim §1 kural 7); uygulama kapalıyken de. Hedef, push yükündeki `type` / `deepLink` ya da gelen kutusundaki `targetType` + `resourceId` ile seçilir.

Gelen kutusu üç adım kuralı (bugünkü `resolveMobileInboxNavigation.ts`, iki platform aynı uygular):
1. `targetType` `none` ya da boş → `fallbackTargetType` (bugün her zaman `notificationInbox`).
2. `resourceId` boş → `fallbackTargetType`.
3. İkisi dolu → `targetType` + `resourceId` ile hedef.
Bilinmeyen tür → `m-bildirimler` / `w-panel-bildirimler`; boş ya da kırık ekran açılmaz.

| Tür (push `type` · gelen kutusu `targetType`) | Örnek metin | Mobil hedef | Web hedef | Bugünkü mobil | Bugünkü web |
|---|---|---|---|---|---|
| `examResult` · `scoringResult` | "Sonucun hazır: TYT Deneme 4 · 78,5 net" | `m-deneme-sonuc` (`ExamResultDocument`, `scoringResultId`) | `w-deneme-sonuc` `/student/sinav-sonuclari/[snapshotId]` | aynı | aynı |
| çözümler hazır · `examAttempt` | "Çözümlerin hazır: KPSS Deneme 2" | `m-deneme-cozum` (`ExamSolutionBookletReview`, `examAttemptId`) | `w-deneme-cozumler` `/student/soru-cozumleri/[examAttemptId]` | `examAttempt` → `m-deneme-net` (`ExamStatsExamNet`); yalnız `Solutions` ekran adı çözüme gider | aynı |
| `liveExamStart` (bugün `examStart`) · `exam` | "TYT Deneme 5 birazdan açılıyor" | `m-deneme-detay` (`ExamStudentPublicDetail`, `examId`) | `w-deneme-detay` `/student/sinav/[examId]` | aynı | `targetType exam` aynı; `dataJson` `Exam` → `/basla` (`w-deneme-basla`) |
| `dailyPlan` · `studyPlanTask` (kimliksiz) | "Bugünün planı hazır · 3 görev, 45 dk" | `m-plan-bugun` (`StudyPlanHome`) | `w-plan-bugun` `/student/ders-plani` | aynı | aynı |
| plana eklendi · `studyPlanTask` + kimlik | "Planına eklendi · Yarın 10:00 · Paragraf" | `m-plan-bugun`, görevin günü seçili | `w-plan-bugun`, görevin günü seçili | `StudyPlanHome` (gün seçimi yok) | `/student/ders-plani/calis/[taskId]` (`w-plan-odak`, görevi başlatır) |
| `eveningStreak` | "Serin 5 gün · bugünün 10 dakikası kaldı" | kısa yol "12 kart · 5 dk" → `m-kart-on`; bildirimin kendisi → doğrulanmadı | — (web push'ta yok) | yok | yok |
| `cardsDue` · `flashcardDeck` | "32 kart seni bekliyor" | `m-kart-on` (`FlashcardSession`, `mode: today`) | `w-kart-oturum` `/student/flashcard/session` | `flashcardSession` aynı; `flashcardDeck` → `m-kart-vitrin` | `flashcardDeck` → `/student/flashcard` |
| `sinoAiReady` · `generationRun` | "Testin hazır · SinoAI 20 soruluk testini hazırladı" | `m-sino-kutuphane` (`SinoAiLibrary`, `runId`) | `w-sino-kutuphane` `/student/sinoai/kutuphane` | aynı | eşleme yok (gezinme olmaz) |
| `supportReply` · `supportTicket` | "Destek talebine yanıt geldi" | `m-destek-talep` (`SupportTicketDetail`, kimlik) | `w-panel-destek-talep` `/student/destek/[id]` | `m-destek` (`SupportHub`), talep açılmaz | aynı |
| analiz hazır · `lensSession` | "Analizin hazır · Mol hesaplamaları" | `m-ozet-sonuc` (`LensSessionDetail`, kimlik) | `w-ozet-detay` `/student/lens/analiz/[id]` | `m-ozet-vitrin` (`LensHome`) | aynı |
| `quiz` | — | `m-test-detay` (`QuizOverview`, test kimliğiyle) | `w-test-coz` `/student/testler/quiz/[quizId]` | `QuizOverview` (kimlik geçmez) | aynı |
| `work` | — | `m-ders-vitrin` (`WorkOverview`) | `w-ders-vitrin` `/student/ders-cal` | aynı | aynı |
| `weeklySummary` | "Haftalık özetin hazır" | `m-istatistik` (`ProfileStatistics`) | `w-istatistik` `/student/raporlarim` | aynı (`ProfileStatistics` ekran adıyla) | `Statistics` ekran adıyla aynı |
| `subscription` | — | `m-profil-abonelik` (çizimde tanımlı değil; iptal yolu orada olduğu için seçildi, doğrulanmalı) | `w-panel-abonelik` `/student/profil#abonelik` | `m-profil-paketler` | aynı |
| deneme süresi bitiyor (yerel bildirim) | "Deneme süren yarın bitiyor" | `m-profil-abonelik` (doğrulanmalı) | — | hedef yok (uygulama açılır) | — |
| `registerReminder` · `AuthRegister` | "Hesabınla ilgili bir hatırlatma" | hesap kaydetme alt sayfası `m-giris-sayfa` [sheet] | — | aynı (`requestRegisterReminder`) | — |
| `none` · `notificationInbox` | genel duyuru | `m-bildirimler` | `w-panel-bildirimler` | aynı | `Notifications` ekran adıyla aynı |

- Uygulama kapalıyken gelen dokunuş: gezinme kuyruğa alınır, kök navigasyon hazır olunca ve sınav kategorisi kapısı geçilince uygulanır (bugünkü `navigateFromNotification.ts`).
- Gizli önizleme açıkken bildirim yalnız türünü söyler ("Deneme sonucun hazır"); net ve puan yazılmaz (Saat-Bildirim §1 kural 9).

### 3.3 Bildirim izni isteme
1. İzin **ilk mikro ders bitince** istenir, onboarding'de ya da ilk açılışta değil: `m-ders-mikro-bitti` → `m-onb-8-bildirim` [tam ekran modal, bir kez].
2. Önce kendi açıklama ekranımız; `Bildirimleri aç` → sistem izin penceresi (`Notifications.requestPermissionsAsync`) → izin verilirse cihaz kaydı `POST StudentNotificationMobile/devices/register` (girişliyse `devices/link`) ve deneme bitiş hatırlatması kurulur.
3. `Şimdi değil` → ekran kapanır, sistem penceresi açılmaz. Yeniden sorma kuralı (bugünkü kod): 7 gün sonra, en çok iki kez; sistem izni reddedildiyse bir daha sorulmaz.
4. Her iki düğmeden sonra öğrenci mikro ders bitti akışına (sıradaki mikro ders) döner (doğrulanmadı).
5. İzin kapalıysa `m-bildirim-ayarlar` üstünde not ve `Telefon ayarlarını aç`.
6. Ölçüm: `notification_permission` (`granted`) olayı (Saat-Bildirim §9).
7. Web: tarayıcı bildirimi için kendi kartımız (bugünkü `WebPushEnableCard.tsx`); web için zaman kuralı çizilmedi.

### 3.4 Bildirim ayarını değiştirme
1. `m-profil` › `Bildirimler` → `m-bildirim-ayarlar` [push]. Boş bildirim listesindeki `Bildirim ayarları` da buraya gelir.
2. Anahtar → iyimser değişim → `PUT StudentProfileNotification/me` (`pushTypes: {tür: bool}`; günün planı `reminderEnabled` + `reminderLocalTime` ile). Hata: eski değere döner, ekranın üstünde "Ayar kaydedilemedi. Tekrar dene." Kayıt sürerken diğer anahtarlar kilitli.
3. Sınırlar sunucuda: günde en çok 2 hatırlatma (canlı etkinlik ve deneme sonucu sayılmaz), sessiz saat 22:00–08:00 (öğrencinin saat diliminde).

### 3.5 Destek talebi açma ve yanıtlama
1. Girişler: `m-profil-devam` › `Destek`; ana ekran Destek kartı; ödeme hatası `Destek` düğmesi → `m-destek` [push]. Web: menü `Destek` → `/student/destek`.
2. `Yeni talep` → `m-destek-yeni` [modal, sol üstte kapat]. Konu çipi seçilir, başlık ve açıklama yazılır, isteğe bağlı ekran görüntüsü.
3. `Gönder` → `POST StudentSupport` → başarı: "Talebin alındı" ve talep no (#4821), `Talebi görüntüle` → `m-destek-talep` [replace]. Hata: alan hataları ya da üstte "Talep gönderilemedi. Bağlantını kontrol edip tekrar dene." Yazılanlar kaybolmaz.
4. Yarıda bırakılırsa: kapatırken metin varsa "Taslağı sil?" onayı (çizilmedi, doğrulanmadı).
5. `Taleplerim` → `m-destek-talepler` (`GET StudentSupport/my-tickets`) → satır → `m-destek-talep` (`GET StudentSupport/{id}`; açılınca `POST StudentSupport/{id}/read`).
6. Yanıt: alttaki alan → gönder → `POST StudentSupport/{id}/reply` → balon listeye eklenir. Kapanmış talepte alan yerine "Bu talep kapatıldı; yeni yanıt eklenemez."
7. Web `Sorun çözüldü` → talebi kapatır (uç API'de doğrulanmalı).
8. `Ders sorusu mu?` → `m-sino-ana` / `w-sino-sohbet` (SinoAI, ders soruları için daha hızlı).

### 3.6 Zorunlu güncelleme
1. Uygulama açılınca ve ön plana her dönüşte (en sık 30 dakikada bir) `GET api/app/version?platform=ios|android` (oturum gerekmez, 8 sn zaman aşımı).
2. Yüklü sürüm `minimumVersion`'ın altındaysa `m-durum-guncelleme` her şeyin üstünde açılır [kapanmayan tam ekran modal; geri tuşu bir şey yapmaz].
3. `Mağazada güncelle` → `storeUrl` (yoksa mağaza sayfası).
4. Ağ hatasında ya da ayar boşsa hiçbir şey gösterilmez; uygulama engellenmez.

## 4. Ekranlar

### 4.1 `m-bildirimler` Bildirimler · web: `w-panel-bildirimler`

- **Görseller:** `acik/mobil/m-bildirimler.png`, `koyu/mobil/m-bildirimler.png`, `en/acik/mobil/m-bildirimler.png`; web `acik/web-panel/w-panel-bildirimler.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** `AppHeader` solda geri (40 × 40 yuvarlak kart), ortada `Bildirimler`/`Notifications` (`section`), sağda metin düğme `Okundu`/`Read` (`small` 700 `brandDeep`). Tab bar yok; düz zemin; içerik yan boşluğu 18, alt 20; bloklar arası 10.
- **Yerleşim (mobil):**
  1. `Segmented` (bkz. §4.6 bileşenler): `Tümü`/`All` · `Okunmamış · 3`/`Unread · 3` (sayı okunmamış sayısı).
  2. `List` (tek kart): satır boşluğu 12 × 14, aralık 12, üst hizalı. Okunmamış satır zemini `brandWash`. Solda `Tile module=<bildirimin modülü>` 38 (köşe 0,32 × boy, simge 19). Ortada üst satır: başlık `headline` 14 pt (solda) ve zaman `meta` (sağda); altında gövde `small`. Okunmamışsa en sağda 8 px `brand` nokta (üstten 6).
  3. `over` `Bu hafta`/`This week` + ikinci `List`: `ListRow module="exam"` "Çözümlerin hazır: KPSS Deneme 2" / "Solutions ready: KPSS Exam 2", alt "Soru çözümlerin açıldı." / "Your solutions are open.", sağda zaman `meta` "Cmt"/"Sat".
  - Örnek satırlar (TR / EN, zaman, okunmamış): Denemeler "Sonucun hazır: TYT Deneme 4" / "Your result: TYT Exam 4", "78,5 net · eksik konularını gör." / "78.5 · see your gaps.", 10:24, ●; Ders Planı "Bugünün planı hazır" / "Today’s plan is ready", "3 görev, yaklaşık 45 dakika." / "3 tasks, about 45 minutes.", 08:00, ●; SinoAI "SinoAI yanıtladı" / "SinoAI replied", "Türev sorunun çözümü hazır." / "Your derivative answer is ready.", Dün / Yday, ●; Bilgi Kartları "32 kart seni bekliyor" / "32 cards are due", "Bugün 8 dakika yeter." / "8 minutes today is enough.", Pzt / Mon; Akıllı Özet "Analizin hazır" / "Your analysis is ready", "Mol hesaplamaları." / "Mole calculations.", Paz / Sun.
  - Zaman biçimi: bugün saat (10:24), dün `Dün`/`Yday`, bu hafta gün kısaltması (`Pzt`, `Sal`, `Çar`, `Per`, `Cum`, `Cmt`, `Paz` / `Mon` …), daha eski tarih ("3 Eki" / "3 Oct"; çizilmedi).
  - Gruplama: ilk grup başlıksız (en yeniler), sonra `Bu hafta`. Grup sınırının tam kuralı çizimde yok (doğrulanmadı); öneri olarak değil, olgu olarak: çizimde son iki günün satırları ilk grupta.
- **Web (`w-panel-bildirimler`):** `Panel` sol menüde `Bildirimler` etkin. Başlık satırı: `title` 30 pt `Bildirimler` solda; sağda 300 px `Segmented` ve `Button tone="ghost" size="sm" icon="check"` `Tümünü okundu yap`/`Mark all read`. Altında tek `List`: satır boşluğu 16 × 20, aralık 14; okunmamış zemin `rgba(234, 88, 12, 0.04)`; `Tile` 42; başlık `headline`, gövde `small`; sağda modül çipi (`Chip tone="module" size="sm"`, modül adı); zaman `meta` 80 px sağa yaslı (web'de gün tam adıyla: "Pazartesi" / "Monday", "Dün" / "Yesterday"); 8 px nokta (okunmuşta saydam, yer tutar). Web'de gruplama yok; altıncı satır "Çözümlerin hazır: KPSS Deneme 2" aynı listede.
- **Veri:** mobil `GET StudentNotificationMobile/notifications` (sayfalı, varsayılan sayfa boyu `notificationQuery.ts`), web `GET StudentNotificationWeb/notifications?skip=&take=`. Alanlar: `id`, `title`, `body`, `dataJson`, `isRead`, `readAt`, `createdAt`, `targetType`, `resourceId`, `fallbackTargetType`, `schemaVersion`. Modül, `targetType`'tan çözülür (web `moduleFromNotificationTarget`); `moduleKey` alanı API'de doğrulanmalı (Modul-Kimligi §5.2 bildirimlerin bu anahtarı taşımasını ister). Okunmamış sayısı `notifications/unread-count`.
- **Etkileşimler:** satır → §3.2 [push]; `Okundu` / `Tümünü okundu yap` → §3.1 adım 4; süzgeç → yerinde süzer (istek yok); çekip yenileme (yalnız liste); sonsuz kaydırma. Sola kaydırarak silme yok (çizilmedi). Satırın tamamı dokunma alanıdır (en az 44 pt).
- **Hâller:** ilk yükleme: ortada `LoadingLogo` ("Bildirimler yükleniyor"); boş → `m-bildirimler-bos`; okunmamış süzgecinde boş: "Okunmamış bildirimin yok" (eylemsiz); hata ve liste boş: ortak hata kalıbı ("Bildirimler yüklenemedi. Tekrar dene."); hata ve liste dolu: liste kalır, üstte hata satırı; hesapsız öğrenci: "Bildirimler için giriş yap" + `Giriş yap`; bildirim başkasına ait (403): "Bu bildirime erişimin yok."
- **Kurallar:** rozet yalnız okunmamış sayısıdır. Sayı değişince ekran okuyucuya kısa durum mesajı. Bildirim başlığı noktalama ile bitmez; uygulama adı başlıkta yazılmaz.

### 4.2 `m-bildirimler-bos` Bildirim yok

- **Görseller:** `acik/mobil/m-bildirimler-bos.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Bildirimler`; sağda 40 px boşluk (`Okundu` yok); tab bar yok.
- **Yerleşim:** tek `StateBlock` (§4.6.2): simge `bell`, başlık `Bildirimin yok`/`No notifications`, metin "Deneme sonucun, günün planı ve SinoAI yanıtları geldiğinde burada görünür." / "Exam results, your daily plan and SinoAI replies show up here.", ana düğme `Bildirim ayarları`/`Notification settings` (modülsüz: `action` turuncu). Segmented gösterilmez.
- **Etkileşimler:** `Bildirim ayarları` → `m-bildirim-ayarlar` [push].
- **Web farkı:** web boş hâli çizilmedi; aynı `StateBlock` kalıbı, düğme web bildirim ayarına (`/student/profil#bildirimler`).

### 4.3 `m-bildirim-ayarlar` Bildirim ayarları

- **Görseller:** `acik/mobil/m-bildirim-ayarlar.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** `AppHeader` geri + `Bildirimler`/`Notifications`; çizimde sağda varsayılan zil ve rozet duruyor; tab bar yok; bloklar arası 12.
- **Yerleşim:**
  1. `Card tone="soft"` (zemin `line2`, boşluk 14): `info` 18 `ink2` + `small` "Günde en çok 2 hatırlatma gönderiyoruz; 22:00–08:00 arası sessiz." / "We send at most 2 reminders a day; quiet from 22:00 to 08:00." (sayı ve saatler sunucudan: `dailyPushLimit`, `quietStart`, `quietEnd`).
  2. `SectionTitle` `Canlı etkinlikler`/`Live Activities` + `List`; her satır `ListRow plainIcon` (38 px `line2` kutu, simge `ink2`), başlık `headline`, alt `small`, sağda `Toggle` (oksuz):
     - `exam` `Canlı deneme başlangıcı`/`Live exam start` · "Kilit ekranında geri sayım, 15 dk önce" / "Lock screen countdown, 15 min before" · açık
     - `focus` `Odak oturumu`/`Focus session` · "Kalan süre ve Duraklat / Bitir" / "Time left and Pause / End" · açık
     - `flame` `Akşam seri hatırlatması`/`Evening streak reminder` · "Yalnız bugün çalışmadıysan, 20:00’de" / "Only if you have not studied today, at 20:00" · açık
  3. `SectionTitle` `Hatırlatmalar`/`Reminders` + `List`:
     - `calendar` `Günün planı`/`Today's plan` · "08:30" (saat; satıra dokununca saat seçici, doğrulanmadı) · açık
     - `cards` `Kart tekrarı`/`Card review` · "Tekrar zamanı gelince" / "When cards are due" · açık
     - `chart` `Deneme sonucu`/`Exam result` · "Sonuç hazır olunca" / "When the result is ready" · açık
     - `sparkles` `SinoAI üretimleri`/`SinoAI results` · "Test ya da özet hazır olunca" / "When a test or summary is ready" · kapalı
  4. `SectionTitle` `Saat`/`Watch` + `List`: `clock` "Apple Watch" · "Bağlı · plan, odak ve kartlar" / "Connected · plan, focus and cards" + ok (Android'de Wear OS; saat yoksa bölüm gizlenir).
- **Toggle:** 46 × 28, köşe 14; açık `brand`, düğmecik 22 px beyaz; kapalı `line`. Satırın tamamı dokunma alanı.
- **Veri:** `GET/PUT StudentProfileNotification/me`: `pushTypes` (sunucu `StudentPushTypes`: `examStart`, `eveningStreak`, `cardsDue`, `examResult`, `sinoAiReady`; `focusSession` yerel), `reminderEnabled`, `reminderLocalTime`, `dailyPushLimit`, `quietStart`, `quietEnd`, `timeZone`. Varsayılanlar (Saat-Bildirim §4): hepsi açık, `sinoAiReady` kapalı.
- **Etkileşimler:** anahtar → §3.4. Saat satırı → saat ayarı (çizilmedi). Sistem izni kapalıysa listenin üstünde uyarı satırı "Telefonda bildirim izni kapalı; ayarlar yine kaydedilir ama bildirim görünmez." ve `Telefon ayarlarını aç`.
- **Kurallar:** iOS bildirim kategorileri ve Android kanalları türlere göre ayrılır; öğrenci sistem ayarından türü ayrı kapatabilir (kanal adları bugünkü katalogda: Günün planı, Akşam serisi, Kart tekrarı, Deneme sonucu, Deneme başlangıcı, SinoAI üretimleri, Sınav hatırlatmaları, Destek yanıtları, Haftalık özet, Hesap hatırlatmaları).

### 4.4 Kilit ekranı, canlı etkinlik, zengin bildirim ve widget'lar (özet)

Ayrıntı, API ve kabul ölçütleri: [Saat-Bildirim.md](../Saat-Bildirim.md) §4–§8 (saat: §10). Burada yalnız ne olduğu ve dokununca nereye gittiği.

| Kimlik | Ne gösterir | Kim başlatır, ne zaman biter | Dokununca | Ayrıntı |
|---|---|---|---|---|
| `m-bildirim-canli-deneme` | Deneme adı, `CANLI`/`LIVE`, 40 pt geri sayım "14:32", "sonra başlıyor · 12.480 kişi hazır", ilerleme çubuğu, `Hazırım`/`I'm ready` (`moduleAction('exam')`); altında Ders Planı bildirimi | Sunucu push-to-start, 15 dk kala; deneme başlayınca biter | `Hazırım` → `m-deneme-detay` | §7 |
| `m-bildirim-canli-odak` | 86 px halka (Testler rengi) "18:42 kaldı", "ODAK · 25 DK", görev adı, "8 / 20 soru · bugün 2 / 5 görev", tek düğme `Duraklat` | Öğrenci (yerel); süre bitince ya da `Bitir` | `Duraklat` uygulamayı açmadan (App Intents); karta dokunma → `m-plan-odak` | §7 |
| `m-bildirim-ada` | Kompakt (halka + süre), minimal (iki etkinlik), genişletilmiş deneme ("Soru 34 / 120 · 12 boş", 1:42:18) ve mikro ders ("3/5", `Devam`) | Etkinlikle aynı | deneme → `m-deneme-coz`; mikro ders `Devam` → `m-ders-*` kaldığı adım | §7 |
| `m-bildirim-seri` | "Serin 5 gün", "Bugünün 10 dakikası kaldı · gün 23:59’da biter", hafta şeridi, tek kısa yol "12 kart · 5 dk" (`moduleAction('flashcards')`) | Sunucu 20:00, yalnız o gün çalışılmadıysa; 23:59 ya da çalışma kaydıyla biter | kısa yol → `m-kart-on` | §5, §7 |
| `m-bildirim-zengin` | Her bildirimde tek bilgi ve sağda 52 px modül renkli görsel (deneme: net sütunları; diğerleri modül simgesi) | Sunucu push | §3.2 tablosu | §5 |
| `m-bildirim-genis` | Uzun basınca deneme sonucu: "78,5 net", "+6,5", ders ders çubuk ve fark; eylemler `Yanlışlarımı çalış`, `Sosyal’i planıma ekle` | — | eylemler: yanlışlar → `m-deneme-cozum`; plana ekle → `m-plan-bugun` (doğrulanmadı) | §5 |
| `m-bildirim-android` | Durum çubuğunda süre çipi, odak bildirimi (5 dilim, `Duraklat`, `Bitir`), büyük görselli deneme sonucu, eylemli kart hatırlatması (`Başla`, `Akşam hatırlat`) | Öğrenci / sunucu | `Başla` → `m-kart-on`; `Akşam hatırlat` → o gün 20:00'ye bir kez erteler | §8 |
| `m-bildirim-widget-kilit` | Dakika halkası "45 dk", sıradaki görev, seri; sabah plan bildirimi | WidgetKit, en çok 30 dk'da bir yenilenir | → `m-plan-bugun` / `m-hub-moduller` | §6 |
| `m-bildirim-widget-ana` | Bugün halkası 45/90, sıradaki deneme "2 gün", etkileşimli plan listesi | aynı | görev yuvarlağı → görevi tamamlar (`PATCH status`), uygulama açılmaz | §6 |
| `m-bildirim-widget-android` | 2×2 bugün halkası, 2×1 sıradaki deneme ve odak başlat, 4×2 etkileşimli plan | Glance | aynı; `Odak başlat` → 25 dk odak | §6 |

Ortak kurallar: canlı etkinlik yalnız gerçek saati olan iş için; uygulama simgesi canlı etkinliğe konmaz; sahte aciliyet yok ("hemen", "kaçırma", "son şans" yasak); aynı şey için ikinci bildirim yok.

### 4.5 `m-onb-8-bildirim` Bildirim izni · ilk mikro dersten sonra

- **Görseller:** `acik/mobil/m-onb-8-bildirim.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** başlık çubuğu yok; tab bar yok; zemin `linear-gradient(180deg, Dersler wash %7 0%, bg 50%)` (Dersler'in içinden açıldığı için Dersler rengi). `BottomBar` iki düğme.
- **Yerleşim (ortalı, üstten 60, aralık 16):**
  1. 96 × 96 köşe 32 `card` kutu, `UI_SHADOW.float`, `bell` 44 Dersler rengi (`#0284C7` / `#38BDF8`).
  2. `Chip tone="success" icon="checkCircle"` `İlk mikro dersin bitti`/`First micro-lesson done`.
  3. `hero` "Yarın 08:00’de hatırlatalım mı?" / "Shall we remind you at 08:00 tomorrow?" (saat öğrencinin plan saatinden).
  4. `body` "Günün planını sabah, deneme sonucunu açıklanınca haber veririz. Gece 22:00–08:00 sessiz." / "Your plan in the morning, exam results when ready. Quiet 22:00–08:00." (saatler için bkz. §7 çelişki).
  5. Örnek `Card` boşluk 12, tam genişlik, sola hizalı: iki satır `Tile` 32 + `headline` 13,5 + zaman `meta`: Ders Planı "Bugünün planı hazır" 08:00; Denemeler "Sonucun hazır: TYT Deneme 4" 12:24.
  6. `BottomBar`: `Button size="lg" block` `Bildirimleri aç`/`Turn on notifications` (Dersler bağlamında açıldığı için dolgu Dersler `moduleAction` `#0277B3`); `Button tone="ghost" size="lg" block` `Şimdi değil`/`Not now`.
- **Etkileşimler:** §3.3.
- **Kurallar:** sistem penceresi kendi ekranımızdan önce asla açılmaz; tek ekran, tek soru.

### 4.6 Ortak durum kalıpları (bütün modüller)

Kaynak: UIUX-Rehberi §5.5 ve §8, `UI_MOTION_MOMENTS.loading` / `refreshing`, çizimler `m-durum-bos`, `m-durum-hata`, `w-panel-durumlar`, `m-durum-guncelleme`. Her modül dosyası buraya başvurur.

**Genel kural:** hiçbir hâl çıkmaz sokak değildir; neden böyle olduğunu, sonra ne olacağını söyler ve tek eylem sunar. Ham "Not Found", GUID, enum adı, HTTP kodu ve hata ayıklama bilgisi asla gösterilmez. Sıfır sayı "0 dk" diye yazılmaz.

#### 4.6.1 Yükleniyor
- **İlk yükleme:** sayfanın ya da bölümün ortasında `LoadingLogo`. İskelet (skeleton) yoktur (sahip, 11 Kasım 2026).
  - Ölçü: halka çapı = logo boyu + 18; halka 3 px `line`, üst yayı bağlamın rengi (modülde modül rengi, dışında `brand`), 40° açıyla başlar ve döner. İçinde logonun saat simgesi (`Brand/SinavikaIcon.svg`) aynı renkte, maske ile, varsayılan 44 pt (bölüm içi örnekte 28). Altında isteğe bağlı etiket `small` ortalı ("Denemelerin yükleniyor" / "Loading your exams", web "Sayfa yükleniyor" / "Loading the page"); ekran okuyucu etiketi her zaman var.
  - Hareket: tek döngüsel hareket bu ve SinoAI'nin düşünme noktalarıdır. "Hareketi azalt" açıkken dönme durur, logo ve etiket kalır (UIUX-Rehberi §8'den, doğrulanmalı).
- **İçerik zaten görünüyorsa:** içerik yerinde kalır; üstte küçük gösterge (mobil `RefreshControl`, web "Güncelleniyor"). Liste ve kartlar boşaltılmaz.
- **Kısa işte gösterge yanıp sönmez:** çok çabuk biten istekte logo görünmeden içerik gelir (eşik çizimde yok; doğrulanmadı).
- **Sonsuz kaydırma:** listenin altında küçük satır içi gösterge (mobil `SinavikaLoader size="inline"`).
- **Web:** `w-panel-durumlar` orta kart: `Card` boşluk 24, içerik ortada `LoadingLogo` 44 + "Sayfa yükleniyor".

#### 4.6.2 Boş
- **Bileşen `StateBlock`** (`Parts/Study.tsx`, üç platform ortak): ortalı dikey blok, aralık 10, boşluk 22 / 18 / 20, köşe 24, `card` zemin, 1 px `line` kenar, `UI_SHADOW.card`, yazılar ortalı.
  - Simge kutusu 64 × 64 köşe 22; dolgu tona göre: `module` → modülün `soft`'u, `success` → `successSoft`, `warning` → `warningSoft`, `error` → `errorSoft`; simge 30, rengi modül rengi ya da `successInk` / `warningInk` / `errorInk`.
  - Başlık `section` 18 pt ortalı. Metin `body` 15 pt, satır 22. İsteğe bağlı ek içerik (ipucu listesi, sürüm satırı).
  - Ana düğme `Button block` (modülde `tone="module"` modülün `action`'ı, modül dışında `primary` `#C2410C`), üstten 4. İkinci eylem düğme değil yazı bağlantısı: `small` 700, modül `ink` ya da `brandDeep`.
  - Metin kalıbı: **ne** (başlık), **neden ve sonra ne olacak** (metin), **tek eylem**.
- **Resimli boş** (`m-durum-bos`, örnek Akıllı Özet "Geçmiş analizler"): modül çerçevesi (`ModuleScreen`, yıkama, tab bar yuva 1), `PageTitle`; ortalı blok üstten 50, aralık 14: 170 × 140 çizim (modül `soft` rengi, −6° dönmüş 130 × 104 köşe 24 kart; önünde 112 × 112 köşe 24 `card` kart ve içinde 56 px dolu modül `Tile`, simge `camera`); `section` "Henüz analiz yok" / "No analyses yet"; `body` "İlk soruyu çek; çözüm ve konu özeti burada saklanır. Bu ay 30 hakkın var." / "Snap your first question; the solution and notes live here. 30 this month."; `Button tone="module" size="lg" icon="camera"` "İlk fotoğrafı çek" / "Take the first photo". Resimli boş yalnız modülün ilk kullanımında; diğer boşlarda `StateBlock`.
- **Web örneği** (`w-panel-durumlar` sol kart): `Card` boşluk 28, ortalı, aralık 12: dolu `Tile` 60 (Denemeler), `section` "Henüz deneme çözmedin" / "No exams yet", `small` "İlk denemen eksiklerini bulmamızı ve planını kişiselleştirmemizi sağlar." / "Your first exam lets us find gaps and tailor your plan.", `Button` "İlk denemeni seç" / "Pick your first exam".
- **Boş arama:** öneri ve ders listesi gösterilir (UIUX-Rehberi §8).

#### 4.6.3 Hata
- **Metin:** "bu bizden kaynaklı" çizgisi; suçlamaz, verinin güvende olduğunu söyler. Örnek: başlık "Sonuçlar şu an yüklenemedi" / "Results could not load" (web: "Bu sayfa şu an açılamadı" / "This page could not open"); metin "Bu bizden kaynaklı. Birkaç dakika sonra tekrar dene; cevapların güvende." / "This is on us. Try again in a few minutes; your answers are safe."
- **Görünüm (mobil, bölüm içi):** `Card` boşluk 12, ortalı, aralık 6: `Tile icon="alert"` 34 (`errorSoft` zemin, `error` simge); `section` başlık; `small` metin; `Button tone="soft" icon="refresh"` `Tekrar dene`/`Try again` (bağlamın `soft`'u). Web: aynı, `Tile` 60, boşluk 28, aralık 12.
- **Sayfa tamamı hata verdiyse** blok sayfanın ortasında; bir bölüm hata verdiyse yalnız o bölümün yerinde, sayfanın kalanı çalışır.
- **İçerik görünüyorken yenileme hatası:** içerik kalır, üstte tek satır uyarı; toast hata için kullanılmaz.
- **Sınıflar:** oturum düştü (401) → giriş alt sayfası `m-giris-sayfa`; erişim yok / deneme süresi bitti (403 trial) → paket yolu (`m-hub-abonelik-bitti`, `m-ders-hak` kalıbı); sahiplik yok (403) → "Bu içeriğe erişimin yok."; bulunamadı (404) → "Bu içerik artık yok" + bir üst ekrana dönüş; sunucu (5xx) ve zaman aşımı → yukarıdaki hata kalıbı.

#### 4.6.4 Zaman aşımı
- Her istek istemci zaman aşımında hata hâline düşer ve `Tekrar dene` sunar: okuma 25 sn, gönderim 60 sn, Akıllı Özet işleme 180 sn (mobil `requestConstants.ts`; web aynı değerleri kullanır, [Navigasyon](Navigasyon.md) §6.1). Yükleme göstergesi bu süreden uzun dönmez. Gönderim isteklerinde (cevap gönderme, ödeme) zaman aşımı veri kaybettirmez: istek kimliğiyle yeniden denenir, ikinci kayıt oluşmaz.
- Zorunlu güncelleme kontrolü 8 sn (bugünkü kod) ve hata verirse sessizce geçer.

#### 4.6.5 Çevrimdışı
- **İnce sarı şerit**, ekranın üstünde: satır, aralık 10, boşluk 10 × 14, köşe 14 (mobil çizimde içerik alanının en üstünde, sayfa başlığının üstünde), zemin `warningSoft`, `wifi` 18 `warning`, metin `small` `warningInk`: kalın "Çevrimdışısın." / "You are offline." + "Kaydettiğin çözümler açık." / "Saved solutions still open." (ikinci cümle bağlama göre: ne açık kalıyor).
- **Web:** sayfanın tepesinde tam genişlik ince şerit (`warningSoft` zemin, `WifiOff` simgesi, kalın başlık + açıklama), "önbellekteki içerik açık kalır".
- Önbellekteki içerik açık kalır; yeni veri isteyen eylemler `disabled` ya da kuyruğa alınır (deneme cevapları: `m-deneme-baglanti` kalıbı, "3 bekliyor"). Bağlantı gelince şerit kalkar ve sayfa sessizce yenilenir.

#### 4.6.6 Form hatası ve gönderiliyor
- **`Field`:** etiket her zaman görünür (`small` 700 `ink2`), alan 50 yükseklik, köşe 16, 1,5 px kenar (`line`; odakta bağlam rengi + 4 px %10 dış halka; hatada `error`), yazı 16 pt.
  - Hata: alanın hemen altında `alert` 15 `errorInk` + `meta` `errorInk`, o alana özel cümle: "E-posta adresinde nokta eksik gibi: ayse@ornek.com" / "The e-mail seems to miss a dot: ayse@ornek.com".
  - Doğrulama alandan çıkınca; yazarken uyarı yok. Uzun web formunda üstte hata özeti ve odak oraya.
- **Gönderiliyor:** `Button loading`: metnin solunda dönen üç çeyrek halka (yazı boyu + 3), opaklık 0,8, gölge yok, düğme kilitli; metin "Gönderiliyor…" / "Sending…". "İstek sürerken düğme kilitli; işlem iki kez gitmez." / "Locked while sending, so nothing goes twice."
- **Başarı:** kısa bildirim (toast) 3–5 sn; hata için toast kullanılmaz.

#### 4.6.7 Klavye odağı (web)
- Sekme tuşuyla gelinen her öğede 2 px `ink` halka, 3 px dışarıda; fareyle tıklayınca görünmez (`:focus-visible`). Sıra görsel sırayla aynı; panelde "ana içeriğe atla" bağlantısı. Çizim: `w-panel-durumlar` sağ alt kart (`Kaydet` odakta, `Vazgeç` ghost, odaktaki `Field` "Ayşe").

#### 4.6.8 Hak doldu, sınır
- Kalıp `StateBlock` (simge `clock`, modül tonu) + yenilenme zamanı + başka hakların etkilenmediği cümlesi + tek eylem. Örnekler modül dosyalarında: `m-ozet-hak` ("Hakların 1 Aralık’ta yenilenir."), `m-sino-hak` ("Yarın 00:00’da yenilenir."), `m-ders-hak` (alt sayfa, düğme turuncu çünkü ödeme marka yüzeyi).

#### 4.6.9 Erişim yok (abonelik)
- Ödeme olmadan erişim yoktur; ilerleme korunur. Kalıp: ana ekran `TodayCard state="expired"` (bkz. [10-Profil-Hesap-Abonelik.md §3.6](10-Profil-Hesap-Abonelik.md)).

#### 4.6.10 `m-durum-guncelleme` Zorunlu güncelleme
- **Görseller:** `acik/mobil/m-durum-guncelleme.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** yalnız durum çubuğu; başlık çubuğu, tab bar, geri yok. İçerik dikey ve yatay ortalı, üstten 80.
- **Yerleşim:** `StateBlock` modülsüz: simge `refresh` (`brandSoft` kutu, `brand` simge), başlık `Yeni sürüm gerekli`/`Update required`, metin "Bu sürüm artık desteklenmiyor. Güncellemeden sonra kaldığın yerden devam edersin; ilerlemen hesabında." / "This version is no longer supported. Your progress is safe in your account.", ek satır `meta` `muted` "Yüklü 2.4.0 · gerekli 2.6.0" / "Installed 2.4.0 · required 2.6.0" (veriden), ana düğme `Mağazada güncelle`/`Update in the store` (`action`).
- **Veri:** `GET api/app/version?platform=` → `minimumVersion`, `recommendedVersion`, `storeUrl`; yüklü sürüm cihazdan.
- **Etkileşimler:** düğme → mağaza. Başka hiçbir yere gidilemez; Android geri tuşu yutulur.
- **Kurallar:** yalnız `installed < minimumVersion` ise. `recommendedVersion` için yumuşak uyarı çizilmedi.

### 4.7 `m-durum-hata` Yükleniyor, hata, çevrimdışı (örnek ekran) · web: `w-panel-durumlar`

- **Görseller:** `acik/mobil/m-durum-hata.png`, `koyu/…`, `en/acik/…`; `acik/web-panel/w-panel-durumlar.png`, `koyu/…`, `en/acik/…`
- **Mobil çerçeve:** Denemeler modül ekranı (`ModuleScreen module="exam"`, yıkama, tab bar yuva 2 `Denemelerim` etkin). Yukarıdan aşağı (aralık 12): çevrimdışı şeridi (§4.6.5) → `PageTitle` Denemeler çipi + `Denemelerim`/`My exams` → `Card` boşluk 10 içinde `LoadingLogo` 28 "Denemelerin yükleniyor" → hata kartı (§4.6.3) → `Card` boşluk 14 içinde hatalı e-posta alanı ve `Button block loading` "Gönderiliyor…". Bu ekran bir kalıp panosudur; dört hâl gerçek ekranda aynı anda görünmez.
- **Web çerçeve:** `Panel active="exam"`; başlık `title` 28 "Boş, yükleniyor ve hata durumları" / "Empty, loading and error states"; üç eşit sütun (boş · yükleniyor · hata), altında iki sütun (form hatası ve gönderiliyor · klavye odağı), en altta `Card tone="soft"` boşluk 18: `wifi` 20 `warning` + `small` `ink2` kalın "Çevrimdışı:" / "Offline:" + "üstte ince sarı şerit; önbellekteki içerik açık kalır." / "a thin yellow strip on top; cached content stays open."

### 4.8 `m-destek` Destek · web: `w-panel-destek`

- **Görseller:** `acik/mobil/m-destek.png`, `koyu/…`, `en/acik/…`; `acik/web-panel/w-panel-destek.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Destek`/`Support`; tab bar yok; düz zemin; bloklar arası 12.
- **Yerleşim (mobil):**
  1. Karşılama kartı: köşe 24, boşluk 18, zemin `linear-gradient(135deg, #EA580C, #F97316)`. `section` beyaz "Nasıl yardımcı olabiliriz?" / "How can we help?"; `small` beyaz %90 "Genelde birkaç saat içinde yanıtlıyoruz." / "We usually reply within a few hours." (süre sunucudan, bugünkü katalog "Genellikle {{hours}} saat içinde yanıtlıyoruz"); `Button tone="white" size="sm" icon="plus"` `Yeni talep`/`New request`, yazı `#C2410C`, üstten 12.
  2. `List`: `list` (gri kutu) `Taleplerim`/`My requests` alt "2 açık · 1 yanıt bekliyor" / "2 open · 1 awaiting you"; `sparkles` SinoAI renkli `Tile` `Ders sorusu mu?`/`A study question?` alt `SinoAI çok daha hızlı yanıtlar`/`SinoAI answers much faster`.
  3. `SectionTitle` `Sık sorulanlar`/`FAQ` + `List`: "Deneme sonucum ne zaman açıklanır?", "Aboneliğimi nasıl iptal ederim?", "Akıllı Özet hakkım ne zaman yenilenir?", "Web ve mobilde aynı hesap" (EN: "When are results out?", "How do I cancel?", "When does my quota reset?", "Same account on web and mobile"); her satırda ok.
- **Web (`w-panel-destek`):** sol menü `Destek` etkin. Başlık satırı: `title` 30 `Destek` + `small` 14 "Genelde birkaç saat içinde yanıtlıyoruz."; sağda `Button icon="plus"` `Yeni talep` (`action`). `Grid 1.4fr 1fr`: sol `List` talepler (`chat` gri kutu, başlık, alt "Ödeme · Bugün 11:20", sağda durum çipi: `success` "Yanıtlandı", `warning` "İnceleniyor", `neutral` "Kapandı"); sağ `WCard` `Sık sorulanlar` (3 soru, satır başına `headline` 14 + aşağı ok 16, açılır-kapanır) ve kart (köşe 22, boşluk 18, `line` kenar): SinoAI `Tile` 40, "Ders sorusu mu?", "SinoAI çok daha hızlı yanıtlar.", `Button size="sm" tone="dark"` "SinoAI".
- **Veri:** SSS `GET StudentSupport/faqs?lang=tr|en`; talepler `GET StudentSupport/my-tickets` (açık ve yanıt bekleyen sayısı buradan).
- **Etkileşimler:** `Yeni talep` → `m-destek-yeni` [modal] / web yeni talep (çizilmedi; bugün sayfa içi form); `Taleplerim` → `m-destek-talepler` [push]; `Ders sorusu mu?` → SinoAI; SSS satırı → mobilde cevap ekranı ya da satır içi açılma (çizimde ok; doğrulanmadı), web'de satır içi açılır (`aria-expanded`); "Aboneliğimi nasıl iptal ederim?" cevabında mağaza yönetimine tek dokunuş bağlantısı.
- **Hâller:** SSS yüklenemedi: SSS bölümü gizlenir, talep yolu çalışır. Hesapsız öğrenci: `Taleplerim` yerine "Giriş yap — taleplerim" ve "Son talebimi gör" (bugünkü kod).
- **Kurallar:** Destek nötr değil marka yüzeyidir (karşılama kartı turuncu); ana ekrandaki Destek kartı ise nötrdür (UIUX-Rehberi §5.1).

### 4.9 `m-destek-talepler` Taleplerim

- **Görseller:** `acik/mobil/m-destek-talepler.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** geri + `Taleplerim`/`My requests`; tab bar yok; `BottomBar` `Button size="lg" block icon="plus"` `Yeni talep`.
- **Yerleşim:** `small` "Açtığın destek taleplerinin durumunu buradan takip et." / "Track your support requests here."; `List` satırları (boşluk 12 × 14): başlık `headline` + alt `small` "Konu · tarih" ("Abonelik ve ödeme · 2 Kas"), sağda durum çipi `size="sm"`: `success` "Yanıtlandı"/"Answered", `warning` "İnceleniyor"/"In review", `outline` "Kapandı"/"Closed"; `Card tone="soft"` `small` `ink2` "Yanıtlar e-postana da gelir." / "Replies also come to your e-mail."
- **Durum eşlemesi** (API'nin 8 durumu → 3 çip; eşleme doğrulanmalı): alındı, inceleniyor, belge bekleniyor, iade sürecinde → `İnceleniyor`; destek ekibi yanıtladı, yanıtın iletildi → `Yanıtlandı`; tamamlandı, kapatıldı → `Kapandı`. Yanıt okunmamışsa satırda `Yeni yanıt` işareti.
- **Etkileşimler:** satır → `m-destek-talep` [push]; `Yeni talep` → `m-destek-yeni` [modal].
- **Hâller:** boş: `StateBlock` "Henüz destek talebin yok" + `Yeni talep`; hata: ortak.

### 4.10 `m-destek-yeni` Yeni talep

- **Görseller:** `acik/mobil/m-destek-yeni.png`, `koyu/…`, `en/acik/…`
- **Çerçeve:** `AppHeader left="close"` (x) + `Yeni talep`/`New request`; tab bar yok; `BottomBar` `Button size="lg" block` `Gönder`/`Send`.
- **Yerleşim (aralık 12):**
  1. `small` 700 `Konu`/`Topic`.
  2. Çipler (sarmalı satır, aralık 8; her çip 38 yükseklik, yan 14, 13 pt): `Ödeme`/`Payment` (seçili: `tone="brand"`), `Hesap`/`Account`, `Deneme`/`Exam`, `Teknik sorun`/`Bug`, `Öneri`/`Idea` (seçili değil: `outline`).
  3. `Field` `Başlık`/`Title` "Ödeme iki kez çekildi".
  4. `Field` `Açıklama`/`Details`, 120 yükseklik, çok satırlı.
  5. `Card tone="soft"` boşluk 14: `image` 18 + `small` "Ekran görüntüsü ekle (isteğe bağlı)" / "Add a screenshot (optional)".
- **Veri:** `POST StudentSupport` (konu, başlık, mesaj, e-posta; hesapsızken e-posta zorunlu). Ek dosya alanı API'de doğrulanmalı.
- **Etkileşimler:** çip → seçer (tek seçim); ekran görüntüsü → sistem galeri seçicisi; `Gönder` → §3.5. Klavye açıkken `Gönder` klavyenin üstünde.
- **Hâller:** zorunlu alan boş: alan hatası ("Konu zorunludur.", "Mesaj zorunludur."); gönderiliyor; başarı: "Talebin alındı", "Onay e-postası … adresine gönderildi.", "Talep no: #4821".

### 4.11 `m-destek-talep` Talep detayı · web: `w-panel-destek-talep`

- **Görseller:** `acik/mobil/m-destek-talep.png`, `koyu/…`, `en/acik/…`; `acik/web-panel/w-panel-destek-talep.png`, `koyu/…`, `en/acik/…`
- **Çerçeve (mobil):** geri + talep başlığı ("Ödeme iki kez çekildi" / "Charged twice"); tab bar yok; `BottomBar border` (üstte `line2`, `card` zemin) içinde yanıt alanı.
- **Yerleşim (mobil, aralık 12):**
  1. Çip satırı (aralık 8): durum `Chip tone="success"` `Yanıtlandı`; nötr `Chip` "Ödeme · #4821" / "Payment · #4821" (konu · talep no).
  2. Öğrencinin balonu, sağa yaslı: en çok 280 genişlik, boşluk 12 × 14, köşe 20 20 6 20, zemin `action`, `body` beyaz; altında `meta` "Sen · 12 Ekim 10:02" / "You · 12 Oct 10:02" (üstten 4).
  3. Ekibin balonu, sola yaslı: `Avatar` "SD" 32 + `Card` boşluk 14 köşe 20 (sol üst 6); `body` "Merhaba Ayşe, kontrol ettik: ikinci çekim 3 iş günü içinde kartına iade edilecek. Kusura bakma."; altında `meta` "Sınavika Destek · bugün 11:20" / "Sınavika Support · today 11:20".
  4. `BottomBar`: `Field` yer tutucu "Yanıt yaz…" / "Write a reply…", sağda `send` 18 `brand`.
- **Web:** `Panel active="support"`, iz `Destek ›`. Başlık satırı: `title` 26 + çipler (aralık 8); sağda `Button tone="ghost" icon="check"` `Sorun çözüldü`/`Mark resolved`. Altında `Card` boşluk 24 (kalan yüksekliği doldurur), balonlar arası 18: öğrenci balonu en çok 560, boşluk 14 × 18, `action` zemin; ekip balonu en çok 600, köşe 6 20 20 20, zemin `line2`, `Avatar` 36. En altta `Field` 56 yükseklik, sağında `Button size="sm" icon="send"` `Gönder`.
- **Veri:** `GET StudentSupport/{id}` (mesajlar, durum, konu, no), `POST StudentSupport/{id}/reply`, `POST StudentSupport/{id}/read`.
- **Etkileşimler:** gönder → §3.5 adım 6; boş metinle gönder `disabled`; yeni yanıt gelince liste en alta kayar. Web: Enter gönderir, Shift+Enter yeni satır (doğrulanmadı).
- **Hâller:** kapanmış talep: alan yerine "Bu talep kapatıldı; yeni yanıt eklenemez."; bulunamadı: "Destek talebi bulunamadı ya da sana ait değil." + Taleplerim'e dönüş.

## 5. Takılma ve kilitlenme önlemleri

- **Çift gönderim:** talep gönder, yanıt gönder, `Tümünü okundu yap`, anahtarlar ve `Bildirimleri aç` istek sürerken kilitli.
- **Bildirim dokunuşu:** okundu isteği beklenmez ya da hata verse de gezinme yapılır; aynı bildirime art arda dokunmak ikinci push açmaz (gezinme kilidi). Uygulama soğuk açılışta bildirimle açıldıysa hedef, kök hazır olunca bir kez uygulanır.
- **Hedef bulunamazsa** (silinmiş deneme, kapanmış talep): hedef ekran kendi "bulunamadı" hâlini gösterir ve bir üst ekrana dönüş sunar; boş ekran kalmaz.
- **Uzun liste:** bildirim listesi sanal (`FlatList`), sayfalı; destek talep listesi 20'den fazlaysa sanal.
- **Ağ kopması:** bildirim listesi önbellekten açılır ve çevrimdışı şeridi görünür; destek yanıtı gönderilemezse metin alanda kalır ve "Yanıt gönderilemedi. Tekrar dene." yazar.
- **Zaman aşımı:** okuma 25 sn, gönderim 60 sn (§4.6.4).
- **Modallar:** yeni talep modalı kapat düğmesi, geri tuşu ve aşağı çekme ile kapanır; zorunlu güncelleme hiçbir yolla kapanmaz (bilerek).
- **İzin ekranı** bir oturumda en çok bir kez görünür; sistem penceresi kapanınca ekran da kapanır, öğrenci takılmaz.
- **Rozet:** okundu işlemleri rozetle aynı anda güncellenir; uygulama simgesindeki rozet de (iOS `setBadgeCount`) okunmamış sayısıdır.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | mobil | `m-bildirimler` | 3 okunmamış ile aç; PNG ile karşılaştır | Okunmamış satırlar `brandWash` zeminli, sağda turuncu nokta; modül renkli simge kutuları |
| 2 | görsel | web | `w-panel-bildirimler` | Aynı veri | Modül çipi ve zaman sütunu; `Tümünü okundu yap` |
| 3 | e2e | ikisi | bildirim | Okunmamış deneme sonucuna dokun | `…/read` isteği; `m-deneme-sonuc` / `w-deneme-sonuc` açılır; rozet 1 azalır |
| 4 | birim | ikisi | §3.2 | `targetType=none`, `fallbackTargetType=notificationInbox` | Bildirimler ekranında kalır |
| 5 | birim | ikisi | §3.2 | `targetType=supportTicket`, `resourceId` dolu | Talep detayı açılır (mobil `m-destek-talep`) |
| 6 | birim | ikisi | §3.2 | Bilinmeyen `targetType` | Bildirimler ekranı; hata ya da boş ekran yok |
| 7 | e2e | mobil | bildirim | Uygulama kapalıyken kart hatırlatmasına dokun | Açılışta `m-kart-on` (bugünün kartları) |
| 8 | e2e | ikisi | bildirim | `Okundu` / `Tümünü okundu yap` iki kez hızlı | Tek `read-all` isteği; düğme gizlenir |
| 9 | bileşen | mobil | `m-bildirimler` | Okunmamış süzgecinde liste boş | "Okunmamış bildirimin yok", eylem yok |
| 10 | e2e | mobil | `m-bildirimler-bos` | `Bildirim ayarları` | `m-bildirim-ayarlar` açılır (sistem ayarı değil) |
| 11 | e2e | mobil | `m-bildirim-ayarlar` | SinoAI üretimleri anahtarını aç | `PUT StudentProfileNotification/me` `pushTypes.sinoAiReady=true` |
| 12 | e2e | mobil | `m-bildirim-ayarlar` | Ağ kapalıyken anahtar | Eski değere döner; hata satırı |
| 13 | e2e | API+mobil | sınırlar | Aynı gün 3 hatırlatma tetikle; 23:00'te push | 3. gitmez; 23:00 push 08:00'e ertelenir |
| 14 | e2e | mobil | `m-onb-8-bildirim` | İlk mikro dersi bitir | İzin ekranı açılır; sistem penceresi `Bildirimleri aç`'tan sonra |
| 15 | e2e | mobil | `m-onb-8-bildirim` | `Şimdi değil` | Sistem penceresi açılmaz; 7 gün içinde yeniden sorulmaz |
| 16 | e2e | mobil | `m-destek-yeni` | Konu seç, başlık+açıklama yaz, `Gönder`'e iki kez dokun | Tek `POST StudentSupport`; talep no gösterilir |
| 17 | bileşen | mobil | `m-destek-yeni` | Açıklama boş gönder | Alan hatası, istek yok |
| 18 | e2e | ikisi | talep detayı | Yanıt yaz, gönder | `…/reply`; balon eklenir, en alta kayar |
| 19 | e2e | ikisi | talep detayı | Kapanmış talep | Yanıt alanı yerine kapalı notu |
| 20 | e2e | mobil | `m-durum-guncelleme` | `minimumVersion` yüklü sürümün üstünde | Kapanmayan ekran; geri tuşu çalışmaz; düğme mağazayı açar |
| 21 | e2e | mobil | güncelleme | `app/version` 500 döner | Uygulama normal açılır |
| 22 | bileşen | ikisi | §4.6.1 | İlk yükleme | Ortada `LoadingLogo`; iskelet yok |
| 23 | bileşen | ikisi | §4.6.1 | İçerik varken yenile | İçerik yerinde; üstte küçük gösterge |
| 24 | e2e | ikisi | §4.6.4 | Sunucu 20 sn yanıt vermesin | 15. saniyede hata kalıbı ve `Tekrar dene` |
| 25 | e2e | ikisi | §4.6.5 | Ağı kes | Üstte ince sarı şerit; önbellekteki içerik açık; ağ gelince şerit kalkar |
| 26 | birim | ikisi | §4.6.3 | 404, 500, GUID içeren hata | Ham metin, kod, GUID gösterilmez |
| 27 | erişilebilirlik | web | §4.6.7 | Sekme tuşuyla gez | 2 px koyu odak halkası; fareyle tıklamada yok |
| 28 | erişilebilirlik | ikisi | tümü | En büyük yazı; %200 yakınlaştırma | Bildirim başlığı, çipler, düğmeler kesilmez |
| 29 | erişilebilirlik | ikisi | rozet | Okunmamış sayısı değişir | Ekran okuyucu kısa durum mesajı okur |
| 30 | erişilebilirlik | ikisi | tümü | Kontrast | Metin 4,5:1; uyarı şeridi `warningInk` / `warningSoft` |
| 31 | görsel | ikisi | tümü | TR/EN, açık/koyu çiz | PNG ile aynı; yüzde TR `%45`, EN `45%` |
| 32 | e2e | ikisi | geri | Her ekranda sistem geri | Bir önceki ekran; zorunlu güncelleme hariç |

## 7. Çizim ile bugünkü kod arasındaki farklar

Mobil kök: `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\`. Web kök: `C:\Users\onurc\source\repos\sinavika_frontend_student\src\`.

**Bildirimler**
1. Bildirim izni bugün ilk mikro dersten sonra değil, öğrenci bir modülden ana sayfaya dönünce uygulama içi istek sırasının ilki olarak sorulur ve tam ekran açıklama değil onay penceresidir ("Çalışma planını sana hatırlatalım mı?", `Evet, hatırlat` / `Şimdi değil`; `modules/notifications/presentation/components/NotificationStudyPlanPromptHost.tsx`). `m-onb-8-bildirim` ekranı kodda yok.
2. `m-bildirimler-bos` `Bildirim ayarları` düğmesi bugün telefonun sistem ayarlarını açıyor (`Linking.openSettings`), `m-bildirim-ayarlar`'ı değil (`NotificationInboxScreen.tsx`).
3. Bildirim listesinde `Bu hafta` gruplaması yok; tek düz liste (`NotificationInboxScreen.tsx`).
4. `m-bildirim-ayarlar`: kodda `Odak oturumu` anahtarı ve `Saat` bölümü yok; `Kart tekrarı` alt yazısı "Bugün çalıştıysan, 17:00'de" (çizim "Tekrar zamanı gelince"); `Günün planı` varsayılanı kodda kapalı, çizimde ve Saat-Bildirim §4'te açık (`modules/profile/application/profilePushSettings.ts`).
5. Hedef ekran farkları (§3.2 tablosu): mobil `supportTicket` → Destek merkezi (talep açılmaz); mobil `lensSession` → Akıllı Özet ana sayfası (analiz açılmaz); mobil `examAttempt` → deneme net ekranı (çözüm değil); mobil `subscription` → Paketler; web `generationRun` için eşleme yok; web `studyPlanTask` doğrudan odak/çalış sayfasını açıyor (`modules/notifications/presentation/navigation/navigateFromNotification.ts`, web `features/notifications/lib/notificationNavigation.ts`).
6. Mobilde bilinmeyen ekran adı sessizce atlanıyor (`default` → log); öğrenci listede kalıyor ama geri bildirim almıyor.
7. Zengin bildirim görseli, uzun basınca görünüm, canlı etkinlik, Dynamic Island, Android canlı güncelleme ve widget'lar kodda yok (Saat-Bildirim §2).
8. Web bildirim sayfası boşken "Ana sayfaya dön" düğmesi gösteriyor (`features/notifications/pages/NotificationsPage.tsx`); mobil boş hâliyle aynı değil.

**Destek**
9. `m-destek`: kodda çizimde olmayan `WhatsApp ile yaz` satırı var; `Ders sorusu mu?` (SinoAI) satırı yok (`modules/support/presentation/screens/SupportHubScreen.tsx`).
10. `m-destek-yeni`: kod konuları "Hesap ve giriş, Abonelik ve ödeme, Denemeler, İçerik, Teknik sorun, Diğer"; çizim "Ödeme, Hesap, Deneme, Teknik sorun, Öneri". Kodda e-posta, ad, telefon alanları var; ekran görüntüsü ekleme yok. Düğme metni kodda `Talebi gönder`, çizimde `Gönder`.
11. Durumlar: kodda 8 durum etiketi (`supportStatusLabels.ts`: alındı, yanıtladı, inceleniyor, yanıtın iletildi, belge bekleniyor, iade sürecinde, tamamlandı, kapatıldı); çizimde 3. Kod "Siz", çizim "Sen".
12. `w-panel-destek`: kodda yeni talep formu sayfanın içinde açılıyor (`features/support/pages/student/SupportTicketsPage.tsx`); SSS kartı ve SinoAI kartı yok. `w-panel-destek-talep`'teki `Sorun çözüldü` düğmesi kodda doğrulanmadı.

**Durumlar**
13. Mobilde sayfanın üstünde ortak çevrimdışı şeridi yok: bağlantı sorunu ekran ekran `AppConnectionBanner` kartıyla (başlık "Bağlantı sorunu") gösteriliyor ve yalnız birkaç ekranda kullanılıyor (`shared/components/ui/AppConnectionBanner.tsx`). Web'de ortak şerit var (`components/layout/student/OfflineStrip.tsx`, `StudentLayout.tsx`).
14. Mobil `ScreenError` metni sunucu hatasında "Sunucu geçici olarak yanıt veremiyor. Birkaç saniye sonra tekrar dene." (`core/i18n/catalogs/tr-TR/errors.ts`); "bu bizden kaynaklı" çizgisi yok.
15. Mobilde zaman aşımı tek yerde (`infrastructure/http/requestConstants.ts`: okuma 25 sn, gönderim 60 sn, Akıllı Özet 180 sn); web istemcisinde varsayılan zaman aşımı yok (yalnız Akıllı Özet süre veriyor); `app/version` 8 sn.
16. `m-durum-guncelleme`: kodda sürüm satırı düğmenin altında, simge `cloud-download-outline` (çizimde `refresh`); `StateBlock` kartı yerine düz sayfa (`app/bootstrap/ForceUpdateGate.tsx`). Metinler aynı.

**Çizimin kendi içindeki çelişkiler**
17. Sessiz saat ve hatırlatma saati çizimlerde birleştirildi (17 Kasım 2026): her yerde sessiz saat 22:00–08:00, günün planı hatırlatması varsayılan 08:30 (Saat-Bildirim.md §1, §4).
18. `m-bildirim-ayarlar` başlık çubuğunda sağda zil duruyor (`AppHeader` varsayılanı); diğer alt sayfalarda sağ boş. Ayar ekranından zile gitmek döngü oluşturur.
19. `m-profil-iletisim` (Profil) ile `m-bildirim-ayarlar` aynı türleri iki ekranda gösteriyor; ayrıntı [10-Profil-Hesap-Abonelik.md §7](10-Profil-Hesap-Abonelik.md#7-çizim-ile-bugünkü-kod-arasındaki-farklar).
