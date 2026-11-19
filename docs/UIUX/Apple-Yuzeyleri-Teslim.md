# Apple yüzeyleri: teslim notu (iOS widget, Live Activity, Dynamic Island, Apple Watch)

**Tarih:** 18 Kasım 2026
**Kime:** mac-iphone (native Swift/SwiftUI, `sinavika_mobile_reactnative`)
**Tam spec:** `Saat-Bildirim.md` (§6 widget, §7 Live Activity, §10 saat). Bu not onun özeti ve token eşleşmesidir.

**Görseller:**
- `gorseller/{acik,koyu}/mobil/m-bildirim-*.png`
- `gorseller/{acik,koyu}/saat/k-apple-*.png`
- EN sürümleri `gorseller/en/...` altında.
- Panolar `gorseller/.../panolar/` altında.

Sayılar ve metinler örnektir; metinler uygulamanın TR/EN kataloğundan gelir.

## Genel kurallar

- Uygulamanın tam simgesi yüzeylere konmaz; modül simgesi ve modül rengi kullanılır.
- Tanıtım, sahte aciliyet ve "hemen", "kaçırma" gibi sözler yok.
- Yazı en az 12 pt; animasyon en çok 2 sn.
- Kişisel sayılar (net, puan) kilit ekranında ve komplikasyonda gösterilmez.

## 1. iOS widget'ları (WidgetKit)

### Ana ekran (`m-bildirim-widget-ana`)

| Aile | Widget | İçerik | Dokununca |
|---|---|---|---|
| systemSmall | Bugün halkası | Planlanan / çalışılan dakika halkası (45/90), görev sayısı (2/5), seri | Bugün / ana ekran |
| systemSmall | Sıradaki deneme | Deneme adı, kalan gün, saat | Deneme detayı |
| systemMedium | Bugünün planı (etkileşimli) | 3 görev | Yuvarlak: görev tamamlanır, uygulama açılmaz (App Intent, study-plan `PATCH status`). Satır: o görev açılır |

- Kenar boşluğu 16 pt; sıkı grupta 11 pt.
- Tonlu (accented) mod:
  - vurgu grubu: halka, kutu, sayı;
  - ana grup: yazılar;
  - modül rengi bu modda kaybolur; anlam şekil ve sayıyla kalır.

### Kilit ekranı (`m-bildirim-widget-kilit`)

| Aile | İçerik |
|---|---|
| accessoryCircular | Dakika halkası |
| accessoryRectangular | Sıradaki görev: ad · miktar · süre |
| accessoryInline | Seri ("5 gün seri"); tek dokunma hedefi |

Kilit ekranı widget'ları tek renk (vibrant) çizilir. Renk vermiyoruz; sistem tonluyor.

### Durumlar

| Durum | Gösterilen |
|---|---|
| Plan yok | "Planını hazırla" |
| Hepsi bitti | "Bugün tamam" |
| Oturum açılmamış | "Sınavika'da oturum aç"; dokununca giriş |
| Çevrimdışı | Son veri ve "güncellendi: SS:DD" |
| Yükleniyor | İskelet (redacted placeholder) |

### Veri

- Widget, uygulamanın App Group'a yazdığı son veriyi gösterir; en çok 30 dakikada bir yenilenir.
- Uç: `api/student/companion/today`, Android widget'larının kullandığı uçla aynı. Eşlik anahtarıyla çağrılır ve ETag'lidir. Tek çağrıda seri, dakika, görev sayıları, günün görevleri ve yaklaşan deneme gelir. 18 Kasım düzeltmesi: ilk notta `engagement/today` ve study-plan `calendar` yazıyordu.
- Widget canlı sayaç göstermez; sayaç Live Activity'nin işi.

## 2. Live Activity ve Dynamic Island (ActivityKit)

Kilit ekranı kartı:
- en çok 160 pt yüksek;
- kenar boşluğu 14 pt;
- yazılar medium ve daha kalın;
- tek etkileşimli öğe.

| Etkinlik | Başlatan | Kart | Biter |
|---|---|---|---|
| Odak oturumu (`m-bildirim-canli-odak`) | Öğrenci (yerel) | Halka, kalan süre, soru ilerlemesi; tek düğme Duraklat/Devam (App Intent, uygulama açılmaz). Sayaç `Text(timerInterval:)` | Süre bitince ya da uygulamada Bitir; `dismissalPolicy .after` 15–30 dk |
| Canlı deneme başlıyor (`m-bildirim-canli-deneme`) | Sunucu, push-to-start, 15 dk kala | Geri sayım, katılan sayısı; Hazırım → deneme detayı | Deneme başlayınca. Bu etkinlik açıkken "deneme başladı" push'u gitmez |
| Deneme sürüyor | Uygulama | Soru 34/120, kalan süre 1:42:18, 12 boş | Teslimden en çok 1 dk sonra |
| Akşam serisi (`m-bildirim-seri`) | Sunucu, 20:00, yalnız o gün çalışılmadıysa | Seri, tek kısa yol "12 kart · 5 dk" | 23:59 ya da çalışma kaydı gelince |
| Konu (ders oynatıcısı) | Uygulama | Adım 4/30, kalan dakika, Devam | Konu bitince ya da oynatıcıdan çıkınca |

### Dynamic Island (`m-bildirim-ada`)

- **Compact:**
  - leading: modül simgesi; odakta halka;
  - trailing: süre.
- **Minimal** (iki etkinlik varken): modül simgesi ya da halka; 28 pt'lik daireye sığar.
- **Expanded:**
  - deneme: soru, kalan süre, boş sayısı;
  - konu: adım ve Devam.
- Adanın zemini siyahtır, değişmez.

API ekibinin işi:
- push-to-start jetonu (cihaz başına);
- güncelleme jetonu (etkinlik başına);
- APNs `liveactivity` push türü.

## 3. Apple Watch (208 × 248 pt, 46 mm; SwiftUI)

- Saat iki temada da koyudur; modül renkleri koyu tema değerlerini kullanır.
- Her ekran yaklaşık 2 saniyede okunur: bir sayı, bir satır, bir eylem.
- Uzun işler "Telefonda aç" ile telefona devredilir.

| Kimlik | Ekran |
|---|---|
| `k-apple-bugun` | Dakika halkası, görev sayısı, seri, sıradaki görev; Başla odak sayacını saatte açar |
| `k-apple-plan` | Görevler modül renginde; yuvarlağa dokununca görev tamamlanır (`PATCH status`) |
| `k-apple-odak` | Sayaç telefondaki Live Activity ile aynı saniyede; Duraklat, Bitir |
| `k-apple-kart`, `k-apple-kart-cevap` | Bilgi Kartları: soru → Cevabı göster → bilmedim / bildim; tekrar günü telefonla aynı |
| `k-apple-deneme` | Canlı denemeye kalan süre, 15 dk önce hatırlat; deneme telefonda çözülür |
| `k-apple-kadran` | Komplikasyonlar: accessoryCircular (dakika; kart ya da deneme halkası), accessoryRectangular (sıradaki görev), accessoryInline (seri), accessoryCorner (seri ya da dakika yayı) |
| `k-apple-yigin` | Akıllı Yığın: relevance ile sabah ve canlı deneme öncesi üste çıkar |
| `k-apple-bildirim` | Long look: "Odak bitti" sonucu; iki eylem: sıradaki görev, 5 dk mola. İlk eylem çift dokunuşla çalışır |

**Veri:**
- Plan ve odak durumu telefondan WatchConnectivity ile gelir.
- Kart tekrarı, saat çevrimiçiyse doğrudan API'den gelir.

**Durumlar:**
- Oturum açılmamış: "iPhone'da oturum aç".
- Plan yok: "Planını iPhone'da hazırla".
- Odak sayacı: çalışıyor, duraklatıldı, bitti.

## 4. Deep link (öneri, şema `sinavika://`)

| Hedef | Bağlantı | Uygulamadaki route |
|---|---|---|
| Bugün | `sinavika://bugun` | ModuleHubHome |
| Bugünün planı | `sinavika://plan` | StudyPlanHome |
| Görev / takvim | `sinavika://plan/gorev/{taskId}` | StudyPlanSchedule |
| Deneme detayı | `sinavika://deneme/{examId}` | ExamStudentPublicDetail |
| Deneme sonucu | `sinavika://deneme/sonuc/{examStudentId}` | ExamResultsHub |
| Kart oturumu | `sinavika://kartlar/bugun` | FlashcardToday |
| Odak | `sinavika://odak` | StudyPlanFocus |
| Ders adımı | `sinavika://ders/{topicId}` | WorkMikro |

## 5. Token eşleşmesi

Yeni token yok; `docs/DESIGN.md`'ye ek gerekmiyor.

Modül renkleri, mobil `src/core/theme/moduleIdentity.ts` içindeki `color {light, dark}` değerleriyle birebir aynıdır:

| Modül | Açık | Koyu |
|---|---|---|
| exam | #4D7C0F | #A3E635 |
| lessons | #0284C7 | #38BDF8 |
| tests | #4F46E5 | #818CF8 |
| studyPlan | #0D9488 | #2DD4BF |
| smartSummary | #7C3AED | #A78BFA |
| flashcards | #DB2777 | #F472B6 |
| sinoAi | #475569 | #CBD5E1 |

Diğer renkler:

| Çizim | Mobil token |
|---|---|
| brand #EA580C | `Color.primary` |
| brandSoft #FFEDD5 | `primaryFixed` |
| success #059669 | `Color.success` |
| ink #0B1C30 | `Brand.navy` (onSurface) |
| ikincil yazı | `Brand.navyMuted` |

**Tipografi:**
- Font her yüzeyde Manrope'tur: uygulama, widget, Live Activity, Dynamic Island ve saat. Font extension'lara gömülür; SF Pro yalnız yedek (fallback) olarak kalır (DESIGN.md "Typography", marka kuralı: tek font ailesi). 18 Kasım düzeltmesi: ilk notta SF Pro'ya izin veriliyordu, bu yanlıştı.
- Sayılar tabular (eşit genişlikte) rakamla yazılır; sayaç dar yerde kaymaz.
- Live Activity'de yazı ağırlığı medium ve daha kalın olur.

**Simgeler:** Çizimlerde Ionicons kullanıldı; modül simgeleri `moduleIdentity.ts` içindeki `icon` alanlarıyla aynı. Native tarafta en yakın SF Symbol seçilir.
