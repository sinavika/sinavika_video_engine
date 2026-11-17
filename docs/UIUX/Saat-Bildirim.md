# Saat, bildirim, canlı etkinlik ve widget: istek belgesi

**Tarih:** 15 Kasım 2026
**Kime:** mobil (`sinavika_mobile_reactnative`) ve API (`sinavika`) ekipleri
**Kimden:** UI/UX (içerik motoru; motor yalnız tasarımı çizer, uygulama kodu yazmaz)

**Çizimler:**
- `Desktop\Sinavika-UIUX3\acik\…` ve `koyu\…`
  - `mobil/m-bildirim-*.png`: 11 ekran
  - `saat/k-*.png`: 12 ekran
- Panolar: `panolar/` içinde "Bildirimler · kilit ekranı ve canlı etkinlik", "Saat · Apple Watch", "Saat · Wear OS".
- Kaynak: `sinavika_video_engine/src/UIUX`.
  - Ekranlar: `Screens/Mobile/Notifications.tsx`, `Screens/Watch/Watch.tsx`
  - Parçalar: `Parts/System.tsx`, `Parts/Watch.tsx`
- Her ekranın kimliği ve notu: `docs/UIUX/Ekran-Envanteri.md`.

Çizimlerdeki sayılar, adlar ve metinler örnektir; gerçek veri API'den gelir.

**Resmî kaynaklarla karşılaştırıldı (15 Kasım 2026):**
- Apple Human Interface Guidelines: Live Activities, Widgets, Notifications, Designing for watchOS, Layout, App icons, Typography.
- Google Play simge özellikleri.
- Android uyarlanabilir simge kuralları.
- Android widget tasarımı ve kalite rehberi (Tier 1–3).
- Wear OS kutucuk (Tile) ve komplikasyon sayfaları.
- Android 16 ilerleme odaklı bildirimler.
- Wear OS'un ekran boyutu, kenar payı ve yazı boyutu sayfalarına ulaşılamadı (404). O kısımda Apple'ın saat kuralları ve Material 3 bilgisi esas alındı.

Aşağıdaki kurallar bu kaynaklardan gelir; "(Apple)" ya da "(Google)" ile işaretlidir.

---

## 1. Amaç ve ilkeler

Amaç: öğrencinin uygulamayı açmadan günün planını görmesi, çalışmaya tek dokunuşla dönmesi ve canlı denemeyi kaçırmaması. Beklenen etki indirmeden çok dönüş ve kullanım (1. ve 7. gün dönüşü, günlük çalışma dakikası).

Kalıplar, iyi çalışma uygulamalarından (özellikle Duolingo) alındı:
- kilit ekranında canlı geri sayım;
- dersin Dynamic Island'da sürmesi;
- akşam seri hatırlatması;
- görselli bildirim.

Ses Sınavika'nın: sakin, somut, sen dili. Maskot, korkutma ve sahte aciliyet yok.

Kurallar (hepsi zorunlu):
1. **Canlı etkinlik yalnız gerçek bir saati olan şey içindir.** iOS Live Activity ve Android Live Update şunlarda açılır:
   - canlı deneme başlangıcı;
   - odak oturumu;
   - deneme sürerken kalan süre;
   - ders oynatıcısı (konu);
   - günün sonu (seri).
   Tanıtım ve genel hatırlatma bu yüzeylere konmaz.
2. **Günde en çok 2 hatırlatma.** Canlı etkinlik ve deneme sonucu bu sayıya girmez. Sınır sunucuda uygulanır.
3. **Sessiz saat 22:00–08:00**, öğrencinin saat diliminde. Bu aralıkta push gönderilmez; sıradaki uygun saate ertelenir.
4. **Akşam serisi** yalnız o gün çalışılmadıysa ve günde bir kez gönderilir (varsayılan 20:00).
5. **Aynı şey için ikinci bildirim yok (Apple).** Canlı etkinlik bir değişikliği gösteriyorsa onun için ayrıca push gönderilmez. Örneğin canlı deneme etkinliği açıkken "deneme başladı" bildirimi gitmez.
6. **Her bildirim tek bilgi taşır:** somut sayı ve modül renginde küçük görsel. "Hemen", "kaçırma", "son şans" gibi sözler kullanılmaz.
7. **Her bildirim doğru ekrana iner.** Örneğin deneme sonucu Sonuçlar'ı, kart hatırlatması kart oturumunu açar.
8. **Bildirim metni (Apple):**
   - Başlık kısadır ve noktalama işaretiyle bitmez.
   - Uygulamanın adı ya da simgesi başlığa yazılmaz; sistem gösterir.
   - Rozet (badge) yalnız okunmamış sayısıdır.
9. **Gizli önizleme (Apple).** Net, puan ve sıralama kişisel bilgidir. Önizleme kapalıyken bildirim yalnız türünü söyler (`hiddenPreviewsBodyPlaceholder`); örneğin "Deneme sonucun hazır". Sayı gösterilmez.
10. Metinler uygulamanın TR/EN kataloğundan gelir. Marka ve modül adları: Sınavika, SinoAI, Denemeler, Dersler, Testler, Ders Planı, Akıllı Özet, Bilgi Kartları.

---

## 2. Bugün kodda ne var (okundu, değiştirilmedi)

| Alan | Var olan |
|---|---|
| Push altyapısı (API) | Azure Notification Hubs sağlayıcısı (`Services/Notifications/Mobile/Providers/AzureNotificationHubs`), FCM v1 ve APNs gönderimi |
| Cihaz kaydı (API) | `api/StudentNotificationMobile/devices/register`, `PUT devices`, `devices/link`, `devices/deactivate` (`MobileNotificationDtos`: jeton, platform, etiketler) |
| Bildirim kutusu (API) | `notifications`, `notifications/unread-count`, `notifications/read-all`, `notifications/{id}/read` |
| Tercihler (API) | `api/StudentProfileNotification/me` GET/PUT: `AllowWhatsApp`, `AllowEmail`, `AllowPhone`, `ReminderEnabled`, `ReminderLocalTime`, `TimeZone`, `OptInVersion` |
| Mobil | `expo-notifications`, `getDevicePushTokenAsync` ile yerel cihaz jetonu (`src/infrastructure/notifications/notificationService.ts`) |

**Yok:**
- iOS Live Activity ve Dynamic Island;
- iOS ve Android widget;
- Android Live Update;
- bildirim türüne göre tercih, günlük üst sınır, sessiz saat;
- Apple Watch ve Wear OS uygulaması.

---

## 3. İş sırası (öncelik)

| Sıra | İş | Etki | Ekip |
|---|---|---|---|
| 1 | Bildirim türleri, günde 2 sınırı, sessiz saat, doğru ekrana iniş | Yüksek, ucuz | API + mobil |
| 2 | Akşam serisi ve sabah planı bildirimleri; zengin bildirim görselleri | Yüksek | API + mobil |
| 3 | iOS ve Android widget'ları | Orta–yüksek | Mobil |
| 4 | Odak oturumu ve canlı deneme canlı etkinlikleri (iOS) | Orta | Mobil + API |
| 5 | Android 16 canlı güncelleme | Orta | Mobil |
| 6 | Apple Watch uygulaması | Düşük | Mobil |
| 7 | Wear OS uygulaması | En düşük; ertelenebilir | Mobil |

Her iş bir kontrol grubuyla açılır (§9).

---

## 4. Bildirim türleri, tercihler ve sınırlar (sıra 1)

**Ekran:** `m-bildirim-ayarlar` (Profil › Bildirimler).

| Tür (anahtar önerisi) | Varsayılan | Sayılır mı (günde 2) | Ne zaman |
|---|---|---|---|
| `liveExamStart` · canlı deneme başlangıcı | Açık | Hayır | Canlı denemeye 15 dk kala |
| `focusSession` · odak oturumu | Açık | Hayır (yerel) | Öğrenci başlatınca |
| `eveningStreak` · akşam serisi | Açık | Evet | 20:00, o gün çalışılmadıysa |
| `dailyPlan` · günün planı | Açık | Evet | `ReminderLocalTime` (varsayılan 08:30) |
| `cardsDue` · kart tekrarı | Açık | Evet | Tekrar zamanı gelen kart varsa |
| `examResult` · deneme sonucu | Açık | Hayır | Sonuç hazır olunca |
| `sinoAiReady` · SinoAI üretimi | Kapalı | Evet | Test ya da özet hazır olunca |

**API (öneri; mevcut `StudentProfileNotification` genişletilir):**
- `Types`: tür → açık/kapalı sözlüğü.
- `QuietStart` / `QuietEnd` (varsayılan 22:00 / 08:00); `TimeZone` zaten var.
- Gönderim kuyruğunda günlük sayaç, sessiz saat ertelemesi ve tür kapalıysa atlama.
- Push yükünde `type` ve `deepLink` (ör. `sinavika://deneme/sonuc/{examStudentId}`).

**Mobil:**
- Ayar ekranı çizimdeki gibi; üstte "Günde en çok 2 hatırlatma; 22:00–08:00 sessiz" notu.
- `deepLink` ile doğru ekrana iniş, uygulama kapalıyken de.
- iOS bildirim kategorileri (eylem düğmeleri) ve Android kanalları türlere göre: kullanıcı sistem ayarından türü ayrı kapatabilir.

**Kabul ölçütleri:**
- Bir öğrenciye aynı gün 3. hatırlatma gitmez.
- 22:00–08:00 arası push gitmez.
- Kapalı tür hiç gitmez.
- Her türün bildirimi doğru ekranı açar.

---

## 5. Zengin bildirimler (sıra 2)

**Ekranlar:** `m-bildirim-zengin`, `m-bildirim-genis`, `m-bildirim-seri`.

- **Görsel:** her bildirimin sağında modül renginde küçük görsel; deneme sonucunda net sütunları, diğerlerinde modül simgesi.
  - iOS: Notification Service Extension ile ek (attachment).
  - Android: `BigPictureStyle` ya da büyük simge.
- **Uzun basınca (deneme sonucu):** ders ders net ve fark, iki eylem: Yanlışlarımı çalış, Planıma ekle. iOS Notification Content Extension ile çizilir.
- **Eylemler (Apple):**
  - En çok dört eylem olur; ilki en sık kullanılandır (saatte çift dokunuş ilk eylemi çalıştırır).
  - Etiketler kısadır.
  - Yalnız uygulamayı açan eylem konmaz; bildirime dokunmak zaten açar.
- **Kart hatırlatması eylemleri:** Başla, Akşam hatırlat.
- **Akşam serisi:** seri günü, hafta şeridi, tek kısa yol (12 kart · 5 dk). iOS'ta canlı etkinlik olarak (§7); Android'de normal bildirim.

**API:** push yükünde `type`, `deepLink`, `imageUrl` (ya da istemcinin çizeceği veri: `nets: [...]`), `actions`.

**Kabul ölçütleri:**
- Görsel yüklenemezse bildirim yine metniyle gider.
- Eylemler uygulamayı doğru ekranda açar; "Akşam hatırlat" o gün 20:00'ye bir kez erteler.

---

## 6. Widget'lar (sıra 3)

**Ekranlar:** `m-bildirim-widget-kilit` (iOS kilit), `m-bildirim-widget-ana` (iOS ana ekran), `m-bildirim-widget-android` (Android ana ekran).

| Widget | iOS | Android | İçerik |
|---|---|---|---|
| Bugün halkası | Küçük; kilit ekranında yuvarlak | 2×2 | Planlanan / çalışılan dakika, görev sayısı, seri |
| Sıradaki görev | Kilit ekranında dikdörtgen | — | Görev adı, miktar, süre |
| Sıradaki deneme | Küçük | 4×1 | Deneme adı, kalan gün, saat |
| Odak başlat | — | 2×1 | Tek dokunuşla 25 dk odak |
| Bugünün planı | Orta, etkileşimli | 4×2, etkileşimli | 3 görev; yuvarlağa ya da kutuya dokununca görev tamamlanır, uygulama açılmaz |

**Apple kuralları:**
- Kenar boşluğu 16 pt; sıkı gruplarda 11 pt. Yazı en az 11 pt; bizde en az 12 pt.
- **Kilit ekranı widget'ları tek renk çizilir** (vibrant): renk vermeyiz, sistem tonlar. Çizim buna göre.
- **Ana ekran widget'ları tonlu (accented) modda da görünür.** Öğe iki gruba ayrılır:
  - vurgu grubu: halka, işaretli kutu, sayı;
  - ana grup: yazılar.
  Modül renkleri o modda kaybolur, anlam şekil ve sayıyla kalır.
- Widget sürekli, canlı güncellenmez (sayaç canlı etkinliğin işi). Animasyon en çok 2 sn.
- Uygulama gibi kalabalık düzen yok. Satır içi (inline) widget'ta tek dokunma hedefi olur.

**Google kuralları (Android widget, kalite rehberi):**
- Tek ana kullanım; uyarlanabilir boyut (`targetCellWidth`/`targetCellHeight`), sabit kare yok.
- Kutu dört kenara değer; dışa özel boşluk eklenmez.
- Köşe yarıçapı sistemin verdiğidir; özel yarıçap verilmez. Çizimdeki 28 yalnız örnek.
- Boyutlandırılabilir; en küçük ve en büyük boy tanımlı.
- Tier 1 için 2×1 ve 1×1, 2×2, 4×2, 4×4'ten en az ikisi. Bizim set: 2×2, 2×1, 4×2.
- Dokunma hedefi en az 48 × 48 dp; yazı ve simge boyla doğrusal büyütülmez.
- Renk cihaz temasından (Material You), açık ve koyu palet.
- Boş ve sıfır hâli de büyük boyda düzgün görünür.
  - Örnek: plan yoksa "Planını hazırla"; görev bitince "Bugün tamam".
- Yükleme ve hata hâli widget'ın içinde gösterilir; ayar sistemin widget yapılandırmasıyla yapılır; açılış sistem geçişiyle olur.
- Mağaza ve seçici için önizleme görseli, ad ve açıklama verilir. Önizleme görseli bu çizimden alınabilir.

**Teknik:**
- iOS: WidgetKit, Expo config plugin ile yerel hedef; App Group ile plan verisi paylaşılır; etkileşim App Intents ile.
- Android: Jetpack Glance; Material You, renkler duvar kâğıdından; boyutlandırılabilir.
- **Veri:** mevcut uçlar yeter: `engagement/today` (seri, dakika, görev sayıları), study-plan `calendar` (görevler), yaklaşan deneme.
  - Görev tamamlama: study-plan `PATCH status`.
  - Widget, uygulama son açıldığında yazılan veriyi gösterir ve en çok 30 dakikada bir yenilenir.

**Kabul ölçütleri:**
- Widget'tan tamamlanan görev uygulamada ve web'de de tamamlanmış görünür.
- Çevrimdışıyken son veri, "güncellendi: saat" notuyla gösterilir.

---

## 7. iOS canlı etkinlikler ve Dynamic Island (sıra 4)

**Ekranlar:** `m-bildirim-canli-deneme`, `m-bildirim-canli-odak`, `m-bildirim-seri`, `m-bildirim-ada`.

| Etkinlik | Başlatan | Biter | Kilit ekranı | Dynamic Island |
|---|---|---|---|---|
| Canlı deneme başlangıcı | Sunucu, push-to-start, 15 dk kala | Deneme başlayınca | Geri sayım, katılan sayısı, Hazırım | Kompakt: modül simgesi + süre |
| Deneme sürüyor | Uygulama, deneme başlayınca | Teslim ya da süre bitince | Soru, kalan süre, boş sayısı | Genişletilmiş: soru 34/120, 1:42:18, 12 boş |
| Odak oturumu | Uygulama (yerel) | Süre bitince ya da uygulamada Bitir | Halka, kalan süre, soru ilerlemesi; tek düğme: Duraklat | Kompakt: halka + süre |
| Konu (ders oynatıcısı) | Uygulama (yerel) | Konu bitince ya da oynatıcıdan çıkınca | Adım 4/30, kalan dakika, Devam | Genişletilmiş |
| Akşam serisi | Sunucu, push-to-start, 20:00 | 23:59 ya da çalışma yapılınca | Seri, tek kısa yol (12 kart) | — |

**Apple kuralları:**
- **Uygulamanın tam simgesi konmaz.** Kartta modül simgesi durur; reklam ve tanıtım yok.
- **Tek etkileşimli öğe tercih edilir.** Odakta Duraklat, denemede Hazırım, derste Devam, seride tek kısa yol.
- Yazılar orta (medium) ya da daha kalın ağırlıktadır.
- Kenar boşluğu 14 pt.
- Kompakt ve minimal hâl 28 pt'lik bir daireye sığar; adanın arka planı siyahtır ve değiştirilmez.
- Animasyon en çok 2 sn.
- Kilit ekranında etkinlik kart olarak görünür; kompakt ada yalnız telefon açıkken çıkar.
- Kart en çok 160 pt yüksekliktedir.
- Etkinlik en çok 8 saat canlı kalır, sonra 4 saat kilit ekranında durur.
- **İş bitince etkinlik hemen bitirilir.** Biten etkinlik 15–30 dk ekranda kalır (`dismissalPolicy: .after(...)`), sonra kalkar. 4 saat beklenmez.
- Güncelleme yalnız içerik değişince gönderilir; uyarı (ses, titreşim) yalnız önemli değişiklikte verilir.
- Sayaç yerelde akar (`Text(timerInterval:)`); push ile saniye saniye güncellenmez.
- Duraklat ve Devam, App Intents ile uygulamayı açmadan çalışır; Hazırım deneme detayını açar.

**API:**
- Live Activity jetonları için yeni alanlar: push-to-start jetonu (cihaz başına) ve güncelleme jetonu (etkinlik başına).
- APNs `liveactivity` push türü (topic `<bundleId>.push-type.liveactivity`).
- **Doğrulanmalı:** Azure Notification Hubs bu push türünü desteklemiyorsa, canlı etkinlik push'u APNs'e doğrudan (token tabanlı `.p8`) gönderilir.
- Canlı deneme 15 dk kala, akşam serisi 20:00'de zamanlanmış işle başlatılır; deneme başlayınca ya da çalışma kaydı gelince bitirilir (`end` olayı).

**Kabul ölçütleri:**
- Aynı anda iki etkinlik varsa önemli olan büyük kalır (minimal hâl).
- Deneme teslim edilince etkinlik en çok 1 dk içinde kapanır.
- Uygulama kapalıyken Duraklat çalışır, sayaç telefonda ve saatte aynı kalır.
- Teslim ya da süre bitince etkinlik 30 dk içinde ekrandan kalkar.

---

## 8. Android 16 canlı güncelleme (sıra 5)

**Ekran:** `m-bildirim-android`.

- **Odak oturumu:** `Notification.ProgressStyle`.
  - Durum çubuğunda süre çipi.
  - Bildirimde günün görevleri dilim dilim, bulunulan görevde nokta.
  - Duraklat / Bitir.
- Canlı deneme başlangıcı aynı yapıyla (geri sayım) verilebilir.
- **Google kuralı:** canlı güncelleme yalnız kullanıcının başlattığı, süren ve zamanı belli işler içindir. Tanıtım ve genel hatırlatma konmaz.
- **Google'ın örnekleri** taksi, teslimat ve navigasyon. Odak oturumu bu kalıba uyar: başı, sonu ve aşamaları var.
- Bildirim çekmecesinin üstüne çıkmak (promoted) Google'ın koşullarına bağlıdır; çıkmazsa da bildirim aynı içerikle görünür.
- Metin kısa ve açık olur. Eylemler yalnız işe yarayanlardır: Duraklat, Bitir.
- İlerleme gerçek durumu yansıtır. Görevler `Segment`, bulunulan görev `Point` ile gösterilir.
- Android 16 öncesi cihazlarda süren bildirim (ongoing) ve ilerleme çubuğu.

**Kabul ölçütleri:** süre çipi ve bildirim, uygulamadaki sayaçla aynı saniyeyi gösterir; Bitir oturumu kaydeder.

---

## 9. Ölçüm

Her iş açılırken öğrencilerin %10'u kontrol grubunda kalır ve özelliği görmez. GA4 olayları (öneri; adlar Adlandirma-Kurallari kalıbında):

| Olay | Ne zaman |
|---|---|
| `notification_permission` (`granted`) | İzin sorulduğunda |
| `notification_open` (`type`) | Bildirime dokunulunca |
| `live_activity_start` / `live_activity_action` (`type`, `action`) | Etkinlik başlayınca / düğmeye basılınca |
| `widget_add` / `widget_task_done` (`platform`, `size`) | Widget eklenince / widget'tan görev tamamlanınca |
| `watch_session` (`screen`) | Saat ekranı açılınca |

Bakılacaklar:
- izin oranı;
- açılma oranı;
- 1. ve 7. gün dönüşü;
- günlük çalışma dakikası;
- bildirim kapatma ve uygulamayı silme oranı (artarsa sınır daraltılır).

---

## 10. Saat (sıra 6 ve 7)

Ders çalışmak saatte ağır kalır. Saat şunları yapar:
- günü gösterir;
- odak sayacını çalıştırır;
- tek hafif çalışmayı (kart tekrarı) sunar.

Her ekran yaklaşık 2 saniyede okunur: bir sayı, bir satır, bir eylem. Daha uzun işler telefona devredilir ("Telefonda aç"). Saat iki temada da koyudur; modül renkleri koyu tema değerleriyle.

**Apple Watch** (208 × 248 pt, 46 mm; SwiftUI watchOS hedefi):

| Kimlik | Ekran | Veri |
|---|---|---|
| `k-apple-bugun` | Dakika halkası, görev sayısı, seri, sıradaki görev; Başla odak sayacını saatte açar | `engagement/today`, `calendar` |
| `k-apple-plan` | Günün görevleri; yuvarlağa dokununca görev tamamlanır | `calendar`, `PATCH status` |
| `k-apple-odak` | Odak sayacı; telefondaki canlı etkinlikle eşit; Duraklat, Bitir | Odak oturumu `start/complete` |
| `k-apple-kart`, `k-apple-kart-cevap` | Kart tekrarı: soru, cevap, bilmedim / bildim; tekrar günü telefonla aynı | Bilgi Kartları bugün ve cevap ucu |
| `k-apple-deneme` | Canlı denemeye kalan süre, 15 dk önce hatırlat; deneme telefonda çözülür | Yaklaşan deneme |
| `k-apple-kadran` | Komplikasyonlar: seri, sıradaki görev, dakika, kart, deneme | WidgetKit (watchOS) |
| `k-apple-yigin` | Akıllı Yığın: sabah ve canlı deneme öncesi üste çıkar (relevance) | WidgetKit (watchOS) |
| `k-apple-bildirim` | Odak bitti: sonuç, sıradaki görev ya da 5 dk mola | Yerel bildirim |

Telefonla veri: WatchConnectivity (plan, odak durumu). Kart tekrarı saat çevrimiçiyse doğrudan API'den.

**Wear OS** (yuvarlak 227 × 227 dp; Compose for Wear OS):

| Kimlik | Ekran |
|---|---|
| `k-wear-kutucuk` | Kutucuk (Tile, ProtoLayout): kenarda dakika yayı, 45/90, seri, sıradaki görev çipi |
| `k-wear-odak` | Odak sayacı: kenarda kalan süre yayı, yuvarlak Duraklat / Bitir (ongoing activity) |
| `k-wear-kadran` | Komplikasyonlar: dakika (aralıklı değer), seri (kısa metin), sıradaki görev (uzun metin) |

İçerik yuvarlak ekranda iç kareye sığar; halkalar kenardan akar. Telefonla veri: Wearable Data Layer.

**Google kuralları (Wear OS):**
- **Kutucuk:** anında, öngörülebilir ve ilgili. Tek bir kullanıcı işine odaklanır, fazla işlev yoktur.
  - Ana eylem, ekranın altına oturan Material 3 kenar düğmesidir (edge button).
  - İlerleme yayı altta düğmeye boşluk bırakır.
- **Komplikasyon:** bakışta okunur, içerik öne çıkar, gizlilik önce gelir. Türler:
  - dakika: aralıklı değer (`RANGED_VALUE`);
  - seri: kısa metin (`SHORT_TEXT`), simgeyle;
  - sıradaki görev: uzun metin (`LONG_TEXT`).
  - Uygulama kısayolu komplikasyonunu sistem kendisi ekler.
- Komplikasyonda kişisel sayı (net, puan) gösterilmez; dakika, seri ve görev adı yeterli.

**Apple kuralları (saat):**
- Yazı en az 12 pt (varsayılan 16).
- Bir satırda en çok üç simgeli ya da iki yazılı düğme.
- Tek ekranda, kısa ve bakışta okunan etkileşim; gezinme derinliği az, dikey gezinme Digital Crown ile.
- Uzun bildirim görünümünde en çok dört eylem; ilki çift dokunuşla çalışır, bu yüzden en sık kullanılan önce gelir.

**Mağaza görselleri (16 Kasım 2026):** `Desktop\sinavika-mobileheader\magaza-gorselleri`; üretim `npm run store`.
- `ios/apple-watch/`: 7 ham arayüz görüntüsü, 416 × 496.
- `android/wear-os/`: 3 ham arayüz görüntüsü, 454 × 454.

Mağaza kuralı gereği yalnız uygulamanın arayüzü kullanılır:
- Wear OS (WO-G5): 1:1, çerçeve, yazı ve maske yok.
- Apple Watch: Apple'ın saat boylarından biri, alfa yok.

Telefon ve tablet mağaza karelerinde saat gösterilmez (sahip, 16 Kasım 2026).
- Saat uygulaması yayına girmeden saat görüntüleri yüklenmez.
- Saat ekranları değişirse görüntüler `npm run store` ile yeniden üretilir.

**Kabul ölçütleri:**
- Saatte başlatılan odak telefonda canlı etkinlik olarak görünür; tersi de geçerli.
- Saatte tamamlanan görev ve kart cevabı telefonda ve web'de aynıdır.

---

## 11. Ekran listesi

| Kimlik | Ad |
|---|---|
| `m-bildirim-ayarlar` | Bildirim ayarları |
| `m-bildirim-canli-deneme` | Canlı etkinlik · deneme başlıyor |
| `m-bildirim-canli-odak` | Canlı etkinlik · odak oturumu |
| `m-bildirim-ada` | Dynamic Island hâlleri |
| `m-bildirim-seri` | Canlı etkinlik · akşam serisi |
| `m-bildirim-zengin` | Zengin bildirimler |
| `m-bildirim-genis` | Bildirim · uzun basınca |
| `m-bildirim-android` | Android 16 · canlı güncelleme |
| `m-bildirim-widget-kilit` | iOS kilit ekranı widget'ları |
| `m-bildirim-widget-ana` | iOS ana ekran widget'ları |
| `m-bildirim-widget-android` | Android ana ekran widget'ları |
| `k-apple-bugun` … `k-apple-bildirim` | Apple Watch, 9 ekran |
| `k-wear-kutucuk`, `k-wear-odak`, `k-wear-kadran` | Wear OS, 3 ekran |

---

## 12. Uygulama simgesi (Apple ve Google kuralları)

**Bugünkü durum** (mobil `assets/`, okundu):
- iOS: açık simge turuncu zeminde beyaz işaret; koyu ve tonlu sürümler de var (1024 px).
- Android uyarlanabilir simge: turuncu arka plan, beyaz işaret, tek renkli katman.

**Bulunan ve düzeltilenler (15 Kasım 2026):**

1. **Mağaza ile telefon farklıydı.** Mağaza setine yanlışlıkla eski, beyaz zeminli Play simgesi konmuştu; telefondaki simge turuncu zeminli (seçili A, 3 Kasım).
   Düzeltme: mağaza setinde ve alternatiflerde A'nın 512 px simgesi kullanılıyor.
   Yapılacak: Play Console'da yüklü simge beyaz zeminliyse A ile değiştirilir.
2. **Android işareti küçüktü.** 108 dp'de 43 dp kaplıyordu; Google en az 48 dp istiyor.
   Düzeltme: A, B, C ön planları ve tek renkli katman 54 dp ile yeniden çizildi.
   Yapılacak: mobil repo `assets/android-icon-foreground.png` ve `android-icon-monochrome.png` güncellenip yeniden derlenir.
3. **iOS 26 katmanları eksikti.**
   Eklendi: Icon Composer için arka plan (opak, tam taşan) ve ön plan (şeffaf) katmanları.
   Yapılacak: `.icon` dosyası bir Mac'te Icon Composer ile bu iki katmandan kurulur, Xcode projesine eklenir. Cam (clear) ve tonlu görünümleri sistem üretir.
4. **Saat simgesi yoktu.**
   Eklendi: 1088 px, turuncu zemin. Saat uygulaması yapılınca kullanılır.

**Dosyalar** (`Desktop\Sinavika-Logo`, ayrıntı README §6):
- `uygulama-ikonu/A-turuncu-zemin/android/` ve `B`, `C`: `android-icon-foreground.png`
- `mobil/assets/android-icon-monochrome.png`
- `uygulama-ikonu/A-turuncu-zemin/ios/icon-composer/`: `arka-plan-1024.png`, `on-plan-1024.png`
- `uygulama-ikonu/A-turuncu-zemin/watchos/watch-icon-1088.png`
- `uygulama-ikonu/A-turuncu-zemin/android/play-store-icon-512.png` (değişmedi; zaten kurala uygun)

**Kurallar:**

| Dosya | Kural |
|---|---|
| Google Play 512 × 512 | 32-bit PNG, sRGB, en çok 1024 KB, kare; köşeleri yuvarlatılmaz (Play %30 yarıçapla keser); gölge yok (Play ekler); saydamlık yok; sıralama, indirim ya da kampanya yazısı yok (Google) |
| Android uyarlanabilir (ön, arka, tek renk) | Katman 108 × 108 dp; işaret 66 dp güvenli alanda, en az 48 dp; katmanda maske ve gölge yok; tek renkli katman Android 13+ temalı simgeler için (Google) |
| iOS 1024 × 1024 ve katmanlar | Kare, maskesiz; sistem yuvarlatır. Arka plan katmanı tam taşan ve opak. İnce çizgi, yumuşak kenar ve uygulama ekranı yok (Apple) |
| watchOS 1088 × 1088 | Yuvarlak kesilir; siyah zemin olmaz (Apple) |
