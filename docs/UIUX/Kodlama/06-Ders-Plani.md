# Ders Planı · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Plan.tsx`, `Screens/Mobile/States.tsx` (`PlanNoneScreen`, `PlanMissedScreen`), `Screens/Web/PlanWeb.tsx`, `Screens/Web/StudyWeb.tsx` (`WebPlanTodayScreen`, `ReviewCard`), `Screens/Tablet/Parity.tsx` (`PlanDayTabletScreen`), `Screens/Tablet/Wide.tsx` (`PlanWeekScreen`), `Screens/Mobile/Hub.tsx` (Bugün tekrar kartı), `Parts/Study.tsx` (`WeekStrip`, `FilterChips`, `PlanTaskCard`, `StateBlock`, `TodayCard`)
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

> **Sahip kararları (17 Kasım 2026). Bu kararlarla çelişen ekran çizmek ya da kodlamak tasarım hatasıdır.** Kaynak: web deposunda `docs/UIUX/Tasarim-Uyum-Plani.md` §9.3 madde 17.
> - **Görev işlemleri:**
>   - Ana düğmenin fiili görevin modülüne göre değişir: "Konuya başla", "Testi başlat", "Denemeye geç", "Kartlara başla".
>   - İçeriği bağlanmamış (kendi) görevde ana düğme "Odak sayacıyla başla"dır (`m-plan-gorev-islem-kendi`).
>   - "Saati değiştir" satırı vardır.
>   - Odak her zaman 25 dk çalışma + 5 dk moladır; Pomodoro / Tek parça seçim sayfası yoktur.
> - **Mobil Program başlığında "Düzenle" (Planım) ve "Haftanı paylaş" vardır.** Bugün ekranında yoktur.
> - **Görev ekle:**
>   - Başlık alanı yoktur; görevin adı konudan, dersten ya da nottan üretilir.
>   - "Ders ve konu" yalnız Konu çalış, Soru çöz ve Tekrar'da zorunludur.
>   - Webde aynı alanlar iletişim kutusunda gelir.
> - **Web görev kartı:**
>   - Kartın gövdesi içeriği açar; sağ üstteki daire görevi tamamlar.
>   - "…" Diğer işlemler menüsünde Odak sayacıyla başla, Yarına taşı, Saati değiştir ve Bugünden kaldır vardır (`w-plan-gorev-menu`).
> - **Web plan yok ve dünden kalan hâlleri:** `w-plan-yok` ortalı kutuyla açılır, sağda örnek gün durur. `w-plan-dunden`'de dünden kalan kutusu sol kartın üstündedir.
> - **Bugün ekranında "Çalışmaya devam et" ve "Bugün tekrar" kartları yoktur** (Bugün tekrar ana ekrandadır). Boş günde "0 görev · 0 dk" yazılmaz.

## 1. Modül özeti

- **Ne işe yarar:** Öğrencinin her gününe sınav tarihine, boş günlerine ve zorlandığı derslere göre görev koyar. Her görev nereden geldiğini (neden), ne olduğunu (konu, modül) ve ne kadar olduğunu (soru, dakika, kart ya da saat) söyler. Öğrencinin ana işi: bugünün görevlerini sırayla başlatmak, bitirmek, kaçanı yeniden yerleştirmek.
- **Anahtar:** `studyPlan` · kod adları: API `StudyPlans`, rota `/api/student/study-plan`, web özelliği `study-plan`, mobil modül `studyPlan`, rota öneki `StudyPlan`.
- **Renk (`ModuleIdentity.ts`):**

| Jeton | Açık | Koyu |
|---|---|---|
| `color` (kimlik: ikon, halka, çubuk dolgusu) | `#0D9488` | `#2DD4BF` |
| `action` (düğme dolgusu, beyaz yazı 4,5:1) | `#0C857A` | `#0C857A` |
| `ink` (modül renkli yazı) | `#09685F` | `#81E5D9` |
| `wash` %7 / %12,6 | `rgba(13,148,136,.07)` | `rgba(45,212,191,.126)` |
| `soft` %12 / %21,6 (ikon kutusu, seçili çip) | `rgba(13,148,136,.12)` | `rgba(45,212,191,.216)` |
| `track` %16 / %28,8 (halka ve çubuk izi) | `rgba(13,148,136,.16)` | `rgba(45,212,191,.288)` |
| `line` %24 / %43,2 (modül kenarı) | `rgba(13,148,136,.24)` | `rgba(45,212,191,.432)` |
| Gradyan ikinci durak | `#34D399` | `#34D399` |

- **Görev kartları kendi modülünün rengindedir**, Ders Planı renginde değil: Dersler `#0284C7`, Testler `#4F46E5`, Denemeler `#4D7C0F`, Bilgi Kartları `#DB2777`. "Kendi görevin" gri (`line2` zemin, `ink2` yazı). Bir görevi başlatan düğme görevin modülünün `action` rengindedir (Testi başlat = Testler `#4F46E5`).
- **Mobil sekme çubuğu (Modul-Kimligi §6):**

| Yuva | Etiket TR / EN | İkon | Hedef |
|---|---|---|---|
| 1 | Bugün / Today | `sun` | `m-plan-bugun` (`StudyPlanHome`) |
| 2 | İlerleme / Progress | `trend` | `m-plan-ilerleme` (`StudyPlanProgressHome`) |
| 3 | Modüller / Modules | `grid` | Modüller ana ekranı |
| 4 | Program / Schedule | `calendar` | `m-plan-program` (`StudyPlanSchedule`) |
| 5 | Profil / Profile | `user` | Profil |

- **Web:** sol menüde "Modüller" başlığı altında dördüncü satır, "Ders Planı" / "Study Plan", ikon `calendar`. Sayfanın üstünde altı hap sekme: Bugün · Program · Öneriler · İstatistik · İlerleme · Ayarlar (`Today · Schedule · Suggestions · Statistics · Progress · Settings`). Yollar: `/student/ders-plani`, `/program`, `/oneriler`, `/istatistik`, `/ilerleme`, `/ayarlar`; odak sayfası menüsüz `/student/ders-plani/calis/[taskId]`.
- **Tablet:** web sayfasının kendisi uygulama üst çubuğunun altında (`t-plan-bugun`); geniş hafta görünümü sürükle-bırak ile (`t-plan-hafta`).

## 2. Ekran haritası

Kısaltmalar: **M** = `sinavika_mobile_reactnative/src/modules/studyPlan/presentation/`, **W** = `sinavika_frontend_student/src/features/study-plan/`.

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-plan-bugun` | mobil | Bugün | `StudyPlanHome` | M `screens/StudyPlanHomeScreen.tsx` | dolu |
| `w-plan-bugun` | web | Bugün | `/student/ders-plani` | W `pages/StudyPlanTodayPage.tsx` | dolu |
| `t-plan-bugun` | tablet | Ders Planı · Bugün | `StudyPlanHome` | yok (tablet düzeni doğrulanmadı) | dolu |
| `m-plan-yok` | mobil | Planı olmayan öğrenci | `StudyPlanHome (StudyPlanNoPlanEmpty)` | M `components/StudyPlanNoPlanEmpty.tsx` | yok / ilk |
| `m-plan-dunden` | mobil | Dünden kalan görevler | `StudyPlanHome` | M `components/StudyPlanMissedBanner.tsx` | dünden |
| `m-plan-gorev-ekle` | mobil | Görev ekle (alt sayfa) | `StudyPlanManualTaskSheet` | M `components/StudyPlanManualTaskSheet.tsx` | form |
| `m-plan-gorev-islem` | mobil | Görev işlemleri (alt sayfa) | `StudyPlanTaskActionSheet` | M `components/StudyPlanTaskActionSheet.tsx` | eylem |
| `m-plan-odak` | mobil | Odak sayacı | `StudyPlanFocus` | M `screens/StudyPlanFocusScreen.tsx` | süreli |
| `w-plan-odak` | web | Odak (çalış) | `/student/ders-plani/calis/[taskId]` | W `pages/StudyPlanFocusPage.tsx` | süreli |
| `m-plan-program` | mobil | Program | `StudyPlanSchedule · StudyPlanPlan` | M `screens/StudyPlanScheduleScreen.tsx`, `screens/StudyPlanPlanScreen.tsx` | dolu |
| `w-plan-program` | web | Program (hafta) | `/student/ders-plani/program` | W `pages/StudyPlanSchedulePage.tsx` | dolu |
| `t-plan-hafta` | tablet | Ders Planı · hafta | `StudyPlanSchedule` | yok (sürükleme mobilde Takvim hafta görünümünde var) | dolu |
| `m-plan-ilerleme` | mobil | İlerleme | `StudyPlanProgressHome` | M `screens/StudyPlanProgressHomeScreen.tsx` | dolu |
| `w-plan-ilerleme` | web | İlerleme | `/student/ders-plani/ilerleme` | W `pages/StudyPlanProgressPage.tsx` | dolu |
| `m-plan-konu` | mobil | Konu ilerlemesi | `StudyPlanLessonProgress` | M `screens/StudyPlanLessonProgressScreen.tsx` | dolu |
| `w-plan-istatistik` | web | İstatistik | `/student/ders-plani/istatistik` | W `pages/StudyPlanStatisticsPage.tsx` | dolu |
| `w-plan-oneriler` | web | Öneriler | `/student/ders-plani/oneriler` | W `pages/StudyPlanPersonalPage.tsx` | dolu |
| `m-plan-ayarlar` | mobil | Plan ayarları | `StudyPlanCreate` | M `screens/StudyPlanCreateScreen.tsx` (ayrıca `components/StudyPlanSettingsSheet.tsx`; hangisinin karşılık olduğu doğrulanmadı) | form |
| `w-plan-ayarlar` | web | Ayarlar | `/student/ders-plani/ayarlar` | W `pages/StudyPlanSettingsPage.tsx` | form |

Başka belgelerde tanımlı, bu modülün verisini gösteren çizimler: `m-hub-moduller`, `m-hub-plansiz`, `m-hub-gun-bitti`, `m-hub-moduller-kaydir` (Bugün tekrar kartı), `w-panel-anasayfa*`, `t-hub-*` → [01-Bugun.md](01-Bugun.md); `m-onb-5-plan`, `w-onb-5-plan` → [02-Giris-Onboarding.md](02-Giris-Onboarding.md); `k-apple-plan`, widget'lar → `Saat-Bildirim.md`; `p-hafta-hikaye`, `p-hafta-gonderi` → `Paylasim-Kartlari.md`. Bugün tekrar kartı bu belgede de tanımlanır (§4.12), çünkü mobil kod onu Ders Planı'nda da gösterir.

## 3. Süreçler (akışlar)

### 3.1 Günü açmak ve görevi başlatmak
1. Modüller ana ekranı → Ders Planı karosu ya da "Plana git" → `m-plan-bugun` [push; Ders Planı sekme yığınının kökü]. Web: sol menü "Ders Planı" → `w-plan-bugun` [sayfa].
2. Ekran açılır, veri içeride yüklenir: `GET student/study-plan/calendar?rangeStart&rangeEnd` (hafta şeridi ve günün görevleri), `GET engagement/today` (dakika, seri). İlk yüklemede `LoadingLogo` ortada.
3. Plan yoksa (`GET student/study-plan` plan yok ya da `needs-onboarding`) → aynı ekranda `m-plan-yok` hâli (§3.5).
4. Dünden biten olmayan görev varsa → üstte "Dünden kalan" kutusu (§3.6).
5. Görev kartına dokunma → `m-plan-gorev-islem` [alt sayfa]. Web: karttaki eylemler ve "Diğer işlemler" menüsü (çizimde web alt sayfası yok; aynı eylemler açılır menüde verilir).
6. "Testi başlat" (görevin modül adıyla: "Konuya başla", "Kartlara başla" gibi; çizimde yalnız Testler örneği var, diğer modüllerin fiil metni doğrulanmadı) → `GET student/study-plan/tasks/{id}/launch` → dönen `resourceType` / `resourceId` / `launchKind` ile ilgili modülün ekranı [push; o modülün yığınına]. `isLocked = true` ise kilit nedeni (`lockReason`) kısa bildirimle yazılır, ekran açılmaz; abonelik kilidinde paket kapısı açılır.
7. Modül ekranından dönünce (geri) `m-plan-bugun` görünür ve takvim yenilenir; görev modülde bittiyse (`completionSource`) kart "bitti" görünür (tik, üstü çizili, opaklık 0,62).
8. Hata: launch başarısızsa "Görev açılamadı." kısa bildirim; bağlantı yoksa bildirim + çevrimdışı şeridi. Alt sayfa açık kalır.

### 3.2 Odak sayacıyla çalışmak
1. `m-plan-gorev-islem` → "Odak sayacıyla başla" → `m-plan-odak` [tam ekran modal; sekme çubuğu yok]. Web: `w-plan-bugun` sağ sütun "Odak sayacı" kartı → "Problemler · Orta ile başla" → `w-plan-odak` [sayfa, menüsüz].
2. `POST student/study-plan/tasks/{id}/sessions/start` → sunucu `sessionId`, `serverTimeUtc`, `elapsedSeconds` döner. Sayaç sunucu zamanına göre çalışır.
3. "Duraklat" yerel duraklatır (API ucu doğrulanmadı; bugünkü kod yerel duraklatır).
4. 25 dakikalık tur biter → 5 dk mola → sonraki tur; 4 tur. Çizimdeki görev kartı: "Odak bitince teste geçersin" → odak bitince görev `launch` ile açılır.
5. "Bitir" → onay penceresi (bugünkü metin "Odak seansını bitir?") → `POST .../sessions/{sid}/complete` → `m-plan-bugun` [kapanır]; dakika günün ilerlemesine eklenir.
6. Vazgeçme (kapat) → `POST .../sessions/{sid}/cancel`.
7. Uygulama arka plana geçerse sayaç durmaz; dönüşte `GET student/study-plan/sessions/active` ile süre sunucudan yeniden hesaplanır. Uygulama kapanıp açılırsa etkin oturum varsa `m-plan-bugun` üstünde "Çalışmaya devam et" kartı çıkar (bugünkü kod; çizimde yok).

### 3.3 Görev eklemek
1. `m-plan-bugun` sağ üst "+" (40 pt daire) → `m-plan-gorev-ekle` [alt sayfa, 640 pt]. Web: "Görev ekle" düğmesi → aynı alanlarla iletişim kutusu (web çizimi yok; mobil alt sayfanın alanları geçerlidir).
2. Alanlar doldurulur (§4.4). "Plana ekle" → `POST student/study-plan/tasks` → başarı: alt sayfa kapanır, görev listede yerini alır, kısa bildirim yok (liste değişimi geri bildirimdir). Hata: alan hatası alanın altında; sunucu hatası alt sayfada kısa bildirim, alt sayfa açık ve girilenler korunur.
3. Alt sayfa aşağı çekilerek, karartmaya dokunarak ya da geri tuşuyla kapanır. Girilmiş veri varsa kapatmadan önce sorulmaz (form kısa); taslak tutulmaz.

### 3.4 Görev işlemleri
`m-plan-gorev-islem` alt sayfasından:
- **Yarına taşı** → `PATCH student/study-plan/tasks/{id}/schedule` (yarının tarihi) → alt sayfa kapanır; kart bugünden çıkar.
- **Yaptım olarak işaretle** → `PATCH .../tasks/{id}/status` (`status = 1` Completed) → kart bitti görünümüne geçer (tik 240 ms çizilir, titreşim "başarı").
- **Bugünden kaldır** (kırmızı) → sistem görevi: `PATCH .../status` (`2` Skipped); kendi görevi: onay ("Görevi sil" / "Bu görev kalıcı olarak silinir.") → `DELETE .../tasks/{id}`.
- Kartın sağındaki yuvarlağa dokunmak da tamamlar (aynı `PATCH status`); tekrar dokunmak `0` Planned'a döndürür.
- Sürüm çakışması (görev başka yerde değişti): "Bu görev başka bir yerde güncellendi. Güncel halini yeniden yükledik." kısa bildirim ve liste yenilenir.
- Geçmiş gün (`editableFromDate` öncesi) görevleri yalnız görüntülenir; eylemler kapalıdır, "Bu gün kapandı…" yazar.

### 3.5 Planı olmayan öğrenci
1. `m-plan-yok` → "Planımı hazırla · 1 dk" → plan oluşturma akışı (`StudyPlanCreate`; kayıt cevapları dolu gelir: `GET .../profile-prefill`) → `POST .../generate` → `m-plan-bugun` [replace].
2. "Kendi planımı kuracağım" → `POST .../manual` → boş günlerle `m-plan-bugun`; öğrenci "+" ile görev ekler.
3. Web: aynı iki seçenek `w-plan-bugun` içinde aynı `StateBlock` ile verilir (web çizimi yok; mobil hâl esastır).

### 3.6 Dünden kalan görevler
1. Takvimde dünün `status = 0` (Planned) görevleri varsa `m-plan-bugun` hafta şeridinin altında sarı kutu çıkar (`m-plan-dunden`).
2. "Bugüne ekle" → her görev için `PATCH .../tasks/{id}/schedule` (bugün) → kutu kapanır, görevler listeye "Dünden" rozetiyle eklenir.
3. "Haftaya yay" → görevler haftanın kalan günlerine dağıtılır (her görev için `PATCH .../schedule`; dağıtım kuralı istemcide mi sunucuda mı, doğrulanmadı) → kutu kapanır.
4. Kutu kapatılmadan geçilirse görevler sessizce kaybolmaz; ertesi açılışta yine gösterilir.

### 3.7 Program, ilerleme, ayarlar
- Sekme 4 "Program" → `m-plan-program` [sekme değişimi, animasyonsuz, seçim titreşimi]. Önceki / sonraki hafta okları → `GET .../schedule?weekOffset&weekCount=1`.
- Sekme 2 "İlerleme" → `m-plan-ilerleme` → "Konu ilerlemesi" satırı → `m-plan-konu` [push]. Veri: `GET .../progress/overview`, `GET .../progress/lessons`, `GET .../statistics/weekly`.
- `m-plan-konu` "Ekle" çipi → tekrar görevini plana ekler (`POST .../tasks`, `reasonCode = spacedReview`; doğrulanmadı).
- Ayarlar (`m-plan-ayarlar`, bugün `Düzenle` düğmesinden) → "Planı yeniden oluştur" → `POST .../regenerate/preview` → onay → `POST .../regenerate` (önizleme belirteci; 409'da yeniden önizleme).

## 4. Ekranlar

### 4.1 `m-plan-bugun` Bugün · web: `w-plan-bugun` · tablet: `t-plan-bugun`
- **Görseller:** `acik/mobil/m-plan-bugun.png`, `koyu/mobil/m-plan-bugun.png`, `en/acik/mobil/m-plan-bugun.png`; `acik/web-panel/w-plan-bugun.png`, `koyu/web-panel/w-plan-bugun.png`, `en/acik/web-panel/w-plan-bugun.png`; `acik/tablet/t-plan-bugun.png`.
- **Çerçeve (mobil):** `ModuleScreen module="studyPlan"`; üst çubukta solda profil, ortada boş, sağda zil; üst %34 `wash` gradyanı; sekme çubuğu var, aktif yuva 1 "Bugün". Alt düğme alanı yok. İçerik `Content gap={12}`.
- **Yerleşim (yukarıdan aşağı):**
  1. `PageTitle`: modül çipi "Ders Planı" / "Study Plan"; başlık "Bugün" / "Today" (24 pt, `title`). Sağda iki öğe yan yana (8 pt arayla):
     - `Segmented` 168 pt genişlik, üç seçenek "Gün · Hafta · Ay" / "Day · Week · Month"; seçili "Gün". Hap yüksekliği 34, dış dolgu 4, iz `line2`, seçili `card` zemin ve `mod.ink` yazı, 13 pt 700.
     - "+" düğmesi: 40 × 40 daire, `mod.action` dolgu, `card` gölge, `plus` ikonu 22 beyaz. Erişilebilir adı "Görev ekle" / "Add a task".
  2. `FilterChips` (yana kayar, kenardan kenara; 18 pt iç boşlukla başlar): "Tümü · 5" / "All · 5", "Dersler" / "Lessons", "Testler" / "Quizzes", "Denemeler" / "Exams", "Tekrar" / "Review", "Kendi görevlerim" / "My tasks". Çip: 8 / 14 boşluk, köşe 14, `small` 700. Seçili: `mod.action` zemin, beyaz yazı; diğerleri `card` zemin, `line` kenar, `ink2` yazı. "Tümü"deki sayı görev sayısıdır. Yalnız günde görevi olan modüllerin çipi gösterilir (bugünkü kod da böyle süzer; çizimde Bilgi Kartları çipi yok ama listede Bilgi Kartları görevi var: çizimdeki çip listesi örnektir).
  3. Hafta halkaları (`DayRings`; ortak parça `WeekStrip` ile aynı ölçü): yedi sütun, eşit aralıklı. Sütun 46 pt genişlik, 8 pt dikey boşluk, köşe 22. Üstte gün kısaltması (`meta`): "Pzt Sal Çar Per Cum Cmt Paz" / "Mon Tue Wed Thu Fri Sat Sun". Altında 36 pt halka: iz `card` dolgu + 1,5 px `line` çizgi; ilerleme yayı 2,6 px, uçları yuvarlak, saat 12'den başlar. Yay rengi: gün tamamsa `success`, kısmi ise `mod.color`, sıfırsa yay yok. Ortada gün numarası (`headline` 14, tabular rakam). Bugün: sütun `card` zemin + `card` gölge, gün adı ve numara `mod.ink`, 800.
  4. Günün başlığı satırı: solda "15 Ekim Perşembe" / "Thursday 15 October" (`headline`); sağda `clock` ikonu 15 + "45 / 90 dk" / "45 / 90 min" (`small` 700, `mod.ink`, tabular rakam).
  5. Günün ilerleme çubuğu: 10 pt yükseklik, köşe 5, iz `mod.track`, dolgu `mod.color`. Dolgunun ucunda yüzde hapı: `mod.action` zemin, 2 / 8 boşluk, köşe 10, beyaz `meta` 800 "%45" / "45%"; hap çubuğun 8 pt üstüne taşar, ucu dolgunun sonuna hizalanır (sola 22 pt kayık). Hap 0 ile %100 arasında çubuğun dışına taşmaz.
  6. Görev listesi (`FitList gap={9}`): her satır bir `PlanTaskCard` (§4.11). Çizimdeki sıra: bitti olan Dersler görevi, şu anki (`now`) Testler görevi, Bilgi Kartları, Canlı deneme (saatli), kendi görevi (saatli). Sıra: bitenler üstte sönük kalır; sıradaki görev `now` görünümündedir.
- **Veri:** `GET student/study-plan/calendar` (gün listesi, `today`, `editableFromDate`, görevler `StudyPlanTaskDto`: `id`, `taskType`, `status`, `durationMinutes`, `startTime`, `questionCount`, `reasonCode`, `isSystemGenerated`, `version`, `resourceType`/`resourceId`); dakika ve yüzde: planlanan `durationMinutes` toplamı ve `engagement/today` çalışılan dakika. Görevin modülü istemcide `taskType`'tan çıkarılır (API'de `moduleKey` yok; mobil `resolveStudyPlanTaskModuleKey`, web `lib/studyPlanTaskModule.ts`). Gün adı, tarih, sayılar veriden; çizimdeki değerler örnektir.
- **Etkileşimler:**
  - `Segmented` Gün / Hafta / Ay → aynı ekranda görünüm değişir (Hafta: yedi günün görevleri; Ay: ay ızgarası). Gezinme olmaz; seçim titreşimi.
  - "+" → `m-plan-gorev-ekle` [alt sayfa].
  - Süzgeç çipi → liste süzülür, sayılar değişmez; seçim titreşimi.
  - Hafta halkasındaki güne dokunma → o günün görevleri listelenir (başlık ve çubuk o güne göre). Geçmiş gün salt okunur.
  - Görev kartı → `m-plan-gorev-islem` [alt sayfa]. Karttaki yuvarlak → tamamla / geri al (`PATCH status`).
  - Aşağı çekip bırakma → yenileme (içerik yerinde, üstte küçük gösterge).
- **Hâller:** yükleniyor (`LoadingLogo` ortada; yenilemede içerik yerinde); plan yok → `m-plan-yok`; dünden kalan → `m-plan-dunden`; günde görev yok → `StateBlock` "Bugün görev yok" (çizim yok; bugünkü metin "Bugün görev yok") ve "+ Görev ekle"; hepsi bitti → çubuk %100 `success`, liste bitti görünümünde (ana ekrandaki "Bugünkü planın bitti" kartı `m-hub-gun-bitti`); hata → yerinde `StateBlock tone="error"` ve "Tekrar dene"; çevrimdışı → sarı şerit, son takvim gösterilir, işlemler kuyruğa girer.
- **Web farkı (`w-plan-bugun`):** `Panel` (sol menü "Ders Planı" aktif) + `ModuleHead`:
  - Hap sekmeler (36 yükseklik, köşe 18, aktif `mod.action` zemin beyaz yazı 13,5 / 800): Bugün (aktif) · Program · Öneriler · İstatistik · İlerleme · Ayarlar.
  - Başlık kartı (köşe 26, `mod.line` kenar, 52 pt `Tile`, çip "Ders Planı"): başlık "Bugün · Perşembe 15 Ekim" / "Today · Thursday 15 Oct" (26 pt); alt yazı "5 görev · 90 dk hedef · seri 5 gün" / "5 tasks · 90 min goal · 5-day streak". Sağda `Segmented` 230 px "Gün · Hafta · Ay" ve `Button tone="module"` `plus` "Görev ekle" / "Add task".
  - Başlığın altında `FilterChips` (aynı altı çip).
  - İki sütun `1.7fr 1fr`, aralık 18:
    - Sol `WCard`: "Günün ilerlemesi" / "Today’s progress" (`headline` 16) ve sağında "45 / 90 dk · %45" / "45 / 90 min · 45%" (`small` 700, `mod.ink`); 10 px çubuk; görev kartları iki sütunlu ızgarada (aralık 12).
    - Sağ sütun: `WCard` içinde `WeekStrip` (bugün `soft` dairede yay, biten günlerin altında 5 px nokta); `WCard` "Odak sayacı" / "Focus timer": "Sıradaki görevi 25 dk odak ve 5 dk molayla çalış." / "Work the next task in 25-minute rounds." ve `Button tone="module"` `clock` "Problemler · Orta ile başla" / "Start with Problems" (görev adı veriden); bilgi şeridi (`mod.wash` zemin, `mod.line` kenar, köşe 16, `sparkles` 18 `mod.ink`): "Denemeden sonra plan güncellendi: Matematik’e 2 görev eklendi." / "Updated after your exam: 2 maths tasks added." (yalnız son deneme sonrası güncelleme varsa).
  - Klavye: hap sekmeler `role="tablist"`, ok tuşlarıyla gezilir; görev kartı Enter ile eylem menüsünü açar.
- **Tablet (`t-plan-bugun`):** web sayfasının aynısı uygulama üst çubuğunun altında; grafikler alçak çizilir. 600 pt altında telefon düzeni.
- **Kurallar:** sıfır dakika "0 dk" yazılmaz ("Henüz başlamadın"). Yüzde tek biçimleyiciden (TR `%45`, EN `45%`). Görevin başlatma düğmesi görevin modül renginde; Ders Planı yeşili yalnız planın kendi öğelerinde (çubuk, "+", süzgeç, segment).

### 4.2 `m-plan-yok` Planı olmayan öğrenci
- **Görseller:** `acik/mobil/m-plan-yok.png`, `koyu/mobil/m-plan-yok.png`, `en/acik/mobil/m-plan-yok.png`.
- **Çerçeve:** `m-plan-bugun` ile aynı (sekme yuvası 1); `PageTitle` "Bugün" / "Today", sağ eylem yok.
- **Yerleşim:**
  1. `StateBlock module="studyPlan" icon="calendar"`: 22 / 18 / 20 boşluk, köşe 24, `card` zemin, `line` kenar, `card` gölge, ortalı. 64 pt ikon kutusu (köşe 22, `mod.soft` zemin, `calendar` 30 `mod.color`). Başlık "Henüz planın yok" / "No plan yet" (`section` 18). Metin "Sınav tarihine, boş günlerine ve zorlandığın derslere göre her güne görev koyarız; denemeden sonra kendini günceller." / "We put tasks on each day from your exam date, free days and weak subjects; it updates after every exam." (`body` 15 / 22). Ana düğme `Button tone="module" block`: "Planımı hazırla · 1 dk" / "Build my plan · 1 min". İkincil yazı düğmesi (`small` 700 `mod.ink`): "Kendi planımı kuracağım" / "I’ll make my own".
  2. `SectionTitle` "Örnek bir gün" / "A sample day"; alt yazı "Kayıttaki cevaplarına göre" / "From your sign-up answers".
  3. İki örnek `PlanTaskCard`, opaklık 0,85, aralık 8: "TYT Matematik · Dersler" / "Temel Kavramlar" / "İlk konu · 12 dk"; "TYT Fizik · Testler" / "Fizik Bilimine Giriş · Kolay" / "20 soru · 25 dk". Bu kartlar dokunulmaz (eylem yok).
  4. Ortalı `meta` `muted`: "Plan hazırlanınca bu görevler takvimine yerleşir." / "These go into your calendar once the plan is ready."
- **Veri:** plan durumu `GET student/study-plan` / `GET .../needs-onboarding`; örnek gün kayıt cevaplarından (`GET .../profile-prefill`); örnek görevlerin konu adları için kaynak API'de doğrulanmalı.
- **Etkileşimler:** "Planımı hazırla · 1 dk" → plan oluşturma (`StudyPlanCreate`) [push] → `POST .../generate` → `m-plan-bugun` [replace]. "Kendi planımı kuracağım" → `POST .../manual` (düğme `loading`, kilitli) → `m-plan-bugun`.
- **Hâller:** oluşturma sırasında düğme `loading`; hata → kısa bildirim "Manuel program açılamadı." (bugünkü metin) ve düğme yeniden etkin.
- **Web farkı:** web çizimi yok; `w-plan-bugun` içinde aynı `StateBlock` ve iki seçenek kullanılır. Ana sayfadaki karşılığı `w-panel-anasayfa-plansiz`.
- **Kurallar:** çıkmaz sokak yok: iki yol da her zaman görünür. Hub'daki `m-hub-plansiz` kartıyla metinler aynıdır.

### 4.3 `m-plan-dunden` Dünden kalan görevler
- **Görseller:** `acik/mobil/m-plan-dunden.png`, `koyu/mobil/m-plan-dunden.png`, `en/acik/mobil/m-plan-dunden.png`.
- **Çerçeve:** `m-plan-bugun` ile aynı; `PageTitle` "Bugün".
- **Yerleşim:**
  1. `WeekStrip module="studyPlan"`: bugün halkasında yay yok (pay 0), Pzt ve Sal altında 5 pt nokta.
  2. Uyarı kutusu: 14 boşluk, köşe 20, `warningSoft` zemin, 1 px `warning` kenar, iç aralık 10.
     - Satır: `history` 20 `warningInk`; başlık "Dünden 2 görev kaldı" / "2 tasks left from yesterday" (`headline`, `warningInk`); açıklama "Bugüne eklersek günün 40 dk uzar. Haftaya yayarsak her güne biraz düşer." / "Adding to today makes it 40 min longer; spreading adds a little to each day." (`small`, `ink2`). Sayı ve dakika veriden.
     - İki eşit düğme (aralık 8, `sm`): solda `ghost` "Haftaya yay" / "Spread over the week"; sağda `module` "Bugüne ekle" / "Add to today".
  3. Görev listesi (aralık 8): dünden kalan kart `badge="Dünden"` / "Yesterday", kaynak "Dün · TYT Matematik" / "Yesterday · TYT Maths"; ardından bugünün sıradaki (`now`) kartı.
- **Veri:** takvim `GET .../calendar?rangeStart=<dün>&rangeEnd=<bugün>`; dünün `status = 0` görevleri; ek dakika = bu görevlerin `durationMinutes` toplamı; `editableFromDate` dünü içermelidir (bugünkü kod "dünün görevlerini hâlâ işaretleyebilirsin" der).
- **Etkileşimler:** "Bugüne ekle" / "Haftaya yay" → §3.6. İki düğme de istek sürerken `loading` ve kilitli.
- **Hâller:** başarıdan sonra kutu 180 ms solarak kalkar; hata → kısa bildirim, kutu kalır.
- **Web farkı:** web çizimi yok; aynı kutu `w-plan-bugun` sol kartının üstünde gösterilmelidir (kural UIUX-Rehberi §5.5).
- **Kurallar:** kaçan görev sessizce kaybolmaz; kutu kullanıcı karar verene kadar her açılışta görünür.

### 4.4 `m-plan-gorev-ekle` Görev ekle (alt sayfa)
- **Görseller:** `acik/mobil/m-plan-gorev-ekle.png`, `koyu/mobil/m-plan-gorev-ekle.png`, `en/acik/mobil/m-plan-gorev-ekle.png`.
- **Çerçeve:** arkada `m-plan-bugun` (başlık ve hafta halkaları) karartma altında; `Sheet` 640 pt yükseklik, üst köşe 28, tutamaç 40 × 5.
- **Yerleşim:**
  1. Başlık satırı: "Görev ekle" / "Add a task" (`section` 19); sağda `x` 22 `ink2` (kapat; 44 pt dokunma alanı).
  2. "Ne yapacaksın?" / "What will you do?" (`meta`) ve seçim hapları (sarar, aralık 8): "Konu çalış" / "Study a topic", "Soru çöz" / "Solve questions" (seçili), "Deneme" / "Exam", "Tekrar" / "Review", "Diğer" / "Other". Hap: 9 / 14 boşluk, köşe 14, 1,5 px kenar; seçili `mod.soft` zemin, `mod.color` kenar, `mod.ink` yazı; seçili değil `card` zemin, `line` kenar, `ink2` yazı; `small` 700.
  3. `Field` "Ders ve konu" / "Subject and topic", değer "TYT Türkçe · Paragraf" / "TYT Turkish · Reading", sol ikon `book`, sağda `down` 18 `muted` (seçici açar).
  4. `Field` "Not (isteğe bağlı)" / "Note (optional)", örnek "Paragraf kitabı · 2 test", ikon `edit`.
  5. "Ne zaman?" / "When?" ve haplar: "Bugün" / "Today" (seçili), "Yarın" / "Tomorrow", "Tarih seç" / "Pick a date", saat hapı "18:00".
  6. "Süre" / "Duration" ve haplar: "15 dk", "25 dk", "40 dk" (seçili), "60 dk" / "15 min" …
  7. Boşluk (esner), en altta `Button tone="module" size="lg" block icon="plus"` "Plana ekle" / "Add to plan".
- **Veri:** `POST student/study-plan/tasks` gövdesi: tür (`taskType`), ders ve konu (lesson / topic kimlikleri), not (başlık ya da açıklama alanı; alan adı API'de doğrulanmalı), tarih, `startTime`, `durationMinutes`. Ders ve konu listesi kategori ders ağacından (uç API'de doğrulanmalı). Düzenleme `PUT .../tasks/{id}` ile aynı alt sayfa, başlık "Görevi düzenle".
- **Etkileşimler:** hap seçimi tek seçim (seçim titreşimi); "Tarih seç" → sistem tarih seçicisi; saat hapı → sistem saat seçicisi; "Plana ekle" → §3.3.
- **Hâller:** "Ders ve konu" seçilmeden "Plana ekle" pasif değil, basılınca alanın altında hata ("Ders ve konu seç"; metin doğrulanmadı). Gönderilirken düğme `loading`.
- **Web farkı:** çizim yok; web aynı alanları iletişim kutusunda (`Overlay`) verir.
- **Kurallar:** klavye açılınca alt sayfa klavyenin üstüne çıkar, "Plana ekle" görünür kalır. Varsayılanlar: bugün, ilk boş saat, 40 dk (çizimdeki seçimler; varsayılan kuralı doğrulanmadı).

### 4.5 `m-plan-gorev-islem` Görev işlemleri (alt sayfa)
- **Görseller:** `acik/mobil/m-plan-gorev-islem.png`, `koyu/mobil/m-plan-gorev-islem.png`, `en/acik/mobil/m-plan-gorev-islem.png`.
- **Çerçeve:** arkada `m-plan-bugun`; `Sheet` 560 pt.
- **Yerleşim:**
  1. Görevin `PlanTaskCard`'ı (aynı görünüm, dokunulmaz): "TYT Matematik · denemende net kaybettin" / "Problemler · Orta" / "20 soru · 25 dk".
  2. Ana düğme: görevin modülünde `Button tone="module" module="tests" size="lg" block icon="play"` "Testi başlat" / "Start the quiz".
  3. Satır listesi (her satır 12 / 4 boşluk, 40 × 40 ikon kutusu köşe 13 `line2` zemin, ikon 20 `ink2`; başlık `headline`, alt yazı `small`):
     - `clock` "Odak sayacıyla başla" / "Start with the focus timer" — "25 dk odak, sonra 5 dk mola" / "25 min focus, then a 5 min break".
     - `calendar` "Yarına taşı" / "Move to tomorrow" — "Planın kalan günlere göre yeniden dağılır" / "The rest of your plan adjusts".
     - `check` "Yaptım olarak işaretle" / "Mark as done" — "Uygulama dışında çözdüysen" / "If you did it outside the app".
     - `trash` "Bugünden kaldır" / "Remove from today", ikon ve yazı `errorInk`, alt yazı yok.
- **Veri:** görev (`StudyPlanTaskDto`); başlat için `GET .../tasks/{id}/launch` (`resourceType`, `isLocked`, `lockReason`, `launchKind`).
- **Etkileşimler:** §3.1 adım 6, §3.2, §3.4. Her satır en az 44 pt yükseklikte tek dokunma hedefidir.
- **Hâller:** kilitli görev (`isLocked`): ana düğme yerine kilit nedeni satırı ve "Paketleri gör" (abonelik) ya da nedenin metni (metinler API'nin `lockReason` koduna göre; eşleme doğrulanmadı). Bitmiş görevde "Yaptım olarak işaretle" yerine "Planlandıya al" (bugünkü metin).
- **Web farkı:** web görev kartında "Tamamla" ve "Diğer işlemler" menüsü (Görevi düzenle, Yarına taşı, Bugünden kaldır); odak sayacı sağ sütundaki kartta.
- **Kurallar:** sistem görevi silinmez, atlanır (`status = 2`); yalnız kendi görevi silinir.

### 4.6 `m-plan-odak` Odak sayacı · web: `w-plan-odak`
- **Görseller:** `acik/mobil/m-plan-odak.png`, `koyu/mobil/m-plan-odak.png`, `en/acik/mobil/m-plan-odak.png`; `acik/web-panel/w-plan-odak.png`, `koyu/web-panel/w-plan-odak.png`.
- **Çerçeve (mobil):** odak ekranı; sekme çubuğu yok. `FocusHeader`: solda `x` (40 pt daire), ortada başlık "Odak" / "Focus" ve üstünde alt yazı görev adı "Problemler · Orta". `BottomBar` iki düğmeli. Zemin `wash` gradyanı.
- **Yerleşim:**
  1. `Ring` 250 pt, kalınlık 16, dolgu `mod.color`, iz `mod.track`; değer turun geçen payı (çizimde 0,62). Ortada "09:24" (`num` 56; kalan süre, dakika:saniye, tabular) ve "25 dakikalık odak" / "25-minute focus" (`small`).
  2. Tur çubukları: 4 adet 26 × 8, köşe 4, aralık 8; biten turlar `mod.color`, kalanlar `mod.track`.
  3. "2 / 4 tur · sonra 5 dk mola" / "Round 2 / 4 · then a 5 min break" (`small`).
  4. Görev kartı (`Card` 14, tam genişlik, sola hizalı): `Tile module="tests"` 40; "Problemler · Orta" (`headline`); "Odak bitince teste geçersin" / "Quiz opens when focus ends" (`small`).
  5. `BottomBar`: iki eşit `lg` düğme, aralık 10: `ghost` `x` "Bitir" / "End"; `module` `pause` "Duraklat" / "Pause" (duraklatılmışken "Devam et" / "Resume", ikon `play`; EN metni doğrulanmadı).
- **Veri:** `POST .../tasks/{id}/sessions/start` (`sessionId`, `serverTimeUtc`, `elapsedSeconds`); bitirme `.../complete`; vazgeçme `.../cancel`; geri dönüşte `GET .../sessions/active`. Tur sayısı ve süreler (25 / 5 / 4) mod seçiminden (Pomodoro); "Tek parça" modu bugünkü kodda var, çizimde yok.
- **Etkileşimler:** "Duraklat" ↔ "Devam et"; "Bitir" → onay → complete → kapanır; üst `x` → onay ("Odak seansını bitir?") → kapanır; mola bitince sonraki tur kendiliğinden başlar (titreşim yok, ses yok; doğrulanmadı).
- **Hâller:** mola hâli (halka `success` mı modül rengi mi, çizimde yok: doğrulanmadı); süre bitti → görev `launch` ile açılır; ağ yok → sayaç yerel sürer, bitirme kuyruğa girer.
- **Web farkı (`w-plan-odak`):** `Immersive` (menüsüz, 70 px üst şerit): solda `ghost` `x` "Ara ver" / "Pause", `Tile` 36, başlık "Odak · Problemler · Orta" / "Focus · Problems · Medium" ve alt yazı "Görev 2/3" / "Task 2/3"; sağda `ghost` `check` "Görevi bitir" / "Finish task". Orta alan: `mod.wash` merkezli dairesel gradyan; `Ring` 340 px, kalınlık 20; "09:24" `num` 72; "25 dakikalık odak · 2/4 tur" / "25-minute focus · round 2/4" (`small` 15); altında `lg` "Bitir" (`ghost` `x`) ve "Duraklat" (`module` `pause`); en altta "Mola sırasında bir sonraki görev hazırlanır: Kimya kartları." / "During the break your next task gets ready: Chemistry cards." Klavye: Boşluk = duraklat / devam (doğrulanmadı), Esc = çıkış onayı.
- **Kurallar:** sayaç sunucu zamanına göre hesaplanır, yerel `setInterval` sayımı biriktirmez; arka plan ve sekme gizlenmesi süreyi bozmaz. Ekran açıkken ekran kararmaz (keep-awake; doğrulanmadı). Oturum en fazla 4 saat kaydedilir (bugünkü web metni).

### 4.7 `m-plan-program` Program · web: `w-plan-program` · tablet: `t-plan-hafta`
- **Görseller:** `acik/mobil/m-plan-program.png`, `koyu/mobil/m-plan-program.png`; `acik/web-panel/w-plan-program.png`, `koyu/web-panel/w-plan-program.png`; `acik/tablet/t-plan-hafta.png`.
- **Çerçeve (mobil):** `ModuleScreen`, sekme yuvası 4 "Program" aktif.
- **Yerleşim (mobil):**
  1. `PageTitle` "Program" / "Schedule"; alt yazı "12–18 Ekim · 21 saat" / "12–18 Oct · 21 hours"; sağda iki `ghost sm` ok düğmesi (`left`, `right`; ad "Önceki hafta" / "Sonraki hafta").
  2. `Card` 10 boşluk: üstte gün harfleri "P S Ç P C C P" (`meta`, bugün `#0D9488`), 40 pt sol boşluk; altında saat satırları (çizimde 18:00–21:00): solda saat (`meta`, 36 pt), yedi hücre (yükseklik 52, köşe 10, aralık 4). Dolu hücre: görev modülünün rengi %13 saydam zemin (`#RRGGBB22`) ve 3 px sol kenar modül renginde; boş hücre `line2`.
  3. Açıklama satırı (sarar, aralık 10): 9 × 9 köşe 3 renk kareleri ve modül adları: Dersler, Testler, Denemeler, Bilgi Kartları, Ders Planı.
  4. `List`: `ListRow module="exam"` "TYT Deneme 5" / "Cumartesi 17 Ekim · 10:00"; `ListRow module="studyPlan" icon="refresh"` "Haftalık tekrar" / "Pazar · 60 dk".
- **Veri:** `GET .../schedule?weekOffset&weekCount` ya da `GET .../calendar?rangeStart&rangeEnd`; toplam saat = görev sürelerinin toplamı.
- **Etkileşimler:** oklar hafta değiştirir; dolu hücre → `m-plan-gorev-islem` [alt sayfa]; boş hücre → `m-plan-gorev-ekle` o gün ve saatle [alt sayfa]; liste satırı → ilgili görev.
- **Web farkı (`w-plan-program`):** `ModuleHead` sekme 2 "Program" aktif; başlık "Bu hafta" / "This week"; alt yazı "12–18 Ekim · hedef 21 saat · 11 sa 20 dk tamam" / "12–18 Oct · goal 21 h · 11 h 20 min done"; eylemler: iki ok (`ghost sm`) ve `ghost` `edit` "Düzenle" / "Edit". Yedi sütunlu ızgara (aralık 10): her gün `Card` 12, en az 300 yükseklik; üstte gün kısaltması (`meta`) ve numara (`section`); bugün 2 px `#0D9488` kenar. Görev parçası: 9 / 10 boşluk, köşe 12, modül rengi %12 zemin (`1F`), 3 px sol kenar; başlık `headline` 12,5, altında modül adı `meta` 10,5; biten görev üstü çizili, opaklık 0,55. Altta renk açıklaması. Hafta / Ay geçişi bugünkü webde var; çizimde segment yok.
- **Tablet (`t-plan-hafta`):** solda modül kenar menüsü (aktif yuva "Program"); başlık "Bu hafta" (26) ve "12–18 Ekim · 13 görev · 7 sa 40 dk"; sağda `Segmented` 230 "Gün · Hafta · Ay" (Hafta seçili) ve `module` `plus` "Görev ekle". Yedi sütun: bugün `card` zemin ve 1,5 px `mod.line`, diğer günler 1 px kesikli `line`; görev parçası 8 / 9 boşluk, köşe 12, `card` zemin, 4 px sol modül kenarı, başlık 13, miktar `meta` 12. Alt not: "Görevi sürükleyip başka güne bırakabilirsin; plan kalan günleri yeniden dağıtır." / "Drag a task to another day; the plan rebalances." Sağda 330 pt "Bugün" sütunu: iki `PlanTaskCard` ve görevin modülünde `lg` `play` "Sıradakini başlat" / "Start next". Sürükle-bırak → `PATCH .../tasks/{id}/schedule`.
- **Kurallar:** renkli hücrede renk tek bilgi değildir; erişilebilir ad görev adını ve modülü okur.

### 4.8 `m-plan-ilerleme` İlerleme · web: `w-plan-ilerleme`, `w-plan-istatistik`

- **Modül istatistik kartı (sahip kararı, 17 Kasım 2026):** her modül vitrininde aynı çerçeveli "Bu hafta" kartı (`ModuleWeekCard`; uygulamada `ProfileModuleStatisticsCard` / `ModuleStatisticsCard`). Tanımı [04-Dersler.md](04-Dersler.md) §4.1 madde 3'tedir: süre, geçen haftaya göre değişim, son 7 günün çubukları, üç kutu; bu hafta çalışma yoksa tek sakin satır. Yeri: dönem seçicinin altında; web'de sağ sütunun en üstünde. Kutular: "Biten görev" / "Tasks done" "12/15"; "Plan uyumu" / "Plan kept" %80; "Seri" "5 gün".
- **Görseller:** `acik/mobil/m-plan-ilerleme.png`, `koyu/mobil/m-plan-ilerleme.png`; `acik/web-panel/w-plan-ilerleme.png`, `acik/web-panel/w-plan-istatistik.png` (koyu ve EN eşleri).
- **Çerçeve:** sekme yuvası 2 "İlerleme".
- **Yerleşim (mobil):**
  1. `PageTitle` "İlerleme" / "Progress".
  2. `Segmented module="studyPlan"`: "Bu hafta · Bu ay · Tümü" / "This week · This month · All".
  3. `Card` 16: solda "Çalışma süresi" / "Study time" (`meta`) ve "11 sa 20 dk" / "11 h 20 min" (`num`); sağda `Chip tone="success" icon="trend"` "%18" / "18%". Altında 14 pt boşlukla `Bars` (yedi gün, 90 yükseklik, çubuk 26, bugün vurgulu, renk `mod.color`; etiketler gün baş harfleri).
  4. `Card` 16: "Hedefe giden yol" / "Road to your goal" (`headline`) ve sağda "48 → **78**"; `Sparkline` 318 × 80; "Bu hızla hedefine **sınavdan 3 hafta önce** ulaşıyorsun." / "At this pace you reach it **3 weeks before the exam**."
  5. İki sütunlu ızgara (aralık 10): `Card` 14 + `Tile` 36 + değer (`section`) + etiket (`meta`): `flame` "5 gün" / "Seri"; `checkCircle` "%86" / "Plana uyum" (EN "5 days" / "Streak", "86%" / "On plan").
- **Veri:** `GET .../progress/overview`, `GET .../statistics/weekly?weekOffset`, `GET .../statistics/daily`; hedef net yolu kaynağı API'de doğrulanmalı; seri `engagement/today`.
- **Etkileşimler:** segment dönemi değiştirir; çubuğa dokunma o günün dakikasını gösterir (ipucu; doğrulanmadı); konu ilerlemesine geçiş satırı çizimde yok, bugünkü kodda var → `m-plan-konu` [push].
- **Web farkı:** `w-plan-ilerleme` (`ModuleHead` sekme "İlerleme", alt yazı "Hedefe giden yol ve konu ilerlemesi"): sol `WCard` "Hedefe giden yol" (`num` 32 "48 → 78", `Chip success` "3 hafta erken" / "3 weeks early", `Sparkline` 560 × 150, cümle); sağda dört sayı kartı (Tamamlandı 38 `success`, Devam 12 `mod.color`, Tekrar 6 `warning`, Başlanmadı 55 `muted`) ve `WCard` "Tekrar gerekenler" listesi. `w-plan-istatistik` (alt yazı "Süre, uyum ve modül dağılımı"): dört `Card` (Bu hafta "11 sa 20 dk", Plana uyum "%86", En uzun seri "12 gün", Odak turu "38"); "Günlere göre süre" `Bars` 170 yükseklik, çubuk 46; "Modüllere göre" beş satır (`Tile` 30, ad, `Bar` modül renginde, yüzde).
- **Kurallar:** ilk haftada sıfır duvarı yok; veri yoksa ilk üç adım gösterilir (UIUX-Rehberi §5.5).

### 4.9 `m-plan-konu` Konu ilerlemesi
- **Görseller:** `acik/mobil/m-plan-konu.png`, `koyu/mobil/m-plan-konu.png`.
- **Çerçeve:** `AppHeader` solda geri, başlık "Konu ilerlemesi" / "Topic progress"; sekme çubuğu var, yuva 2 aktif.
- **Yerleşim:** 2 × 2 sayı kartları (`num` 26, renkleri `success`, `mod.color`, `warning`, `muted`; etiketler "Tamamlandı / Devam / Tekrar / Başlanmadı" — "Done / Active / Review / Not started"); `SectionTitle` "Tekrar gerekenler" / "Due for review", alt yazı "Unutma eğrisine göre" / "Based on the forgetting curve"; `List` üç satır (`refresh` ikonu, konu, "3 gün önce · %45" gibi), sağda `Chip tone="module" sm` "Ekle" / "Add"; `SectionTitle` "Derslere göre" / "By subject"; `Card` içinde ders adı (80 pt), `Bar` (`mod.color` / `mod.track`), yüzde (34 pt, sağa hizalı).
- **Veri:** `GET .../progress/lessons`, `GET .../progress/lesson-mains/{id}`, `GET|PUT .../progress/lesson-subs/{id}`.
- **Etkileşimler:** "Ekle" → tekrar görevi plana (§3.7); ders satırı → o dersin konu listesi (doğrulanmadı).

### 4.10 `m-plan-ayarlar` Plan ayarları · web: `w-plan-ayarlar`, `w-plan-oneriler`
- **Görseller:** `acik/mobil/m-plan-ayarlar.png`; `acik/web-panel/w-plan-ayarlar.png`, `acik/web-panel/w-plan-oneriler.png` (koyu ve EN eşleri).
- **Çerçeve (mobil):** sekme çubuğu yok; `AppHeader` geri + "Plan ayarları" / "Plan settings"; `BottomBar` tek düğme.
- **Yerleşim (mobil):** `Card tone="module"` (`Tile` `target` 42; "YKS · 48 → 78 net"; "Dengeli · günde 3 saat · 6 gün" / "Balanced · 3 h a day · 6 days"; `Chip outline` "Değiştir" / "Change"); `List`: "Çalışma günleri" (Pazartesi–Cumartesi), "Başlangıç saati" (18:00), "Zorlandığın dersler" (Matematik, Geometri, Kimya), "Haftalık tekrar günü" (Pazar); ikinci `List` iki anahtar (`Toggle module="studyPlan"`): "Denemeden sonra planı güncelle" / "Eksik konular otomatik eklenir", "Günlük hatırlatma" / "08:00"; `BottomBar` `module lg block refresh` "Planı yeniden oluştur" / "Rebuild plan".
- **Veri:** `GET|PUT .../availabilities`, `PATCH .../settings`, `PATCH .../intake`; hatırlatma bildirim ayarından; yeniden oluşturma §3.7.
- **Web farkı:** `w-plan-ayarlar`: `ModuleHead` sekme "Ayarlar", başlık "Plan ayarları", alt yazı "Hedef, tempo ve günler", eylem `module` `refresh` "Planı yeniden oluştur"; iki `WCard`: "Hedef ve tempo" (Hedef, Tempo, Çalışma günleri, Zorlandığın dersler) ve "Otomatik güncelleme" (dört anahtar: Denemeden sonra planı güncelle, Tekrar zamanı gelenleri ekle, Pazar tekrar günü, Günlük hatırlatma). `w-plan-oneriler`: alt yazı "Denemelerine ve tekrar zamanına göre"; üç sütunlu altı kart (`Card tone="moduleLine"` öneri modülünün renginde; `Tile` 40 + `Chip` neden; başlık `section`; açıklama; `moduleSoft sm plus` "Plana ekle" ve `ghost sm` "Sonra"). Veri `GET student/study-plan/suggestions`, "Sonra" → `POST .../suggestions/{key}/dismiss`.
- **Kurallar:** yeniden oluşturma bugün başlamış oturumların görevlerini silmez; önizleme bunu söyler.

### 4.11 Görev kartı (`PlanTaskCard`, ortak parça)
- **Kullanıldığı yerler:** `m-plan-bugun`, `m-plan-yok`, `m-plan-dunden`, `m-plan-gorev-islem`, `w-plan-bugun`, `t-plan-bugun`, `t-plan-hafta`.
- **Ölçü:** 12 / 14 boşluk, köşe 20, `card` zemin, 1,5 px kenar (`now` iken görevin modül `line`'ı ve `card` gölge, değilse `line`), iç aralık 8.
- **Üst satır:** solda kaynak (`meta` 12,5): "<sınav> <ders> · <neden ya da modül>", örn. "TYT Matematik · denemende net kaybettin"; altında konu (`headline` 15,5). Sağda 26 pt daire: boşsa 2 px `line` kenar; bittiyse `success` dolgu ve beyaz `check` 15.
- **Alt satır:** solda `Tile` 26 (görev modülü; kendi görevinde yok) ve rozet (3 / 10 boşluk, köşe 8, `over` 12): varsayılan modül adı (`mod.soft` zemin, `mod.ink` yazı) ya da `badge` ("Canlı deneme", "Dünden"); kendi görevinde "Kendi görevin" / "Your task" (`line2` zemin, `ink2`). Sağda miktar (`small` 600 `ink2`): "20 soru · 25 dk", "Kaldığın yerden · 8 dk", "20 kart · 10 dk" ya da saat aralığı "10:00 – 12:45".
- **Bitti:** opaklık 0,62, konu üstü çizili.
- **Veri eşlemesi:** kaynak = sınav kategorisi + ders adı + `reasonCode` metni (`own` Kendi görevin, `examMistakes` denemende net kaybettin, `quizMistakes` testte zorlandın, `spacedReview` tekrar zamanı, `weakTopic` zayıf konun, `exam` bu ayın denemesi, `plan` = modül adı); miktar = `questionCount` + `durationMinutes` ya da `startTime`–bitiş. Kilitli görev (`lockReason`): rozetin yanında `lock` ikonu (çizimde yok; doğrulanmadı).
- **Erişilebilirlik:** tek erişilebilir öğe; okunan metin "Konu, kaynak, miktar, durum"; yuvarlak ayrı düğme ("<konu> görevini tamamla").

### 4.12 Bugün tekrar kartı (ana ekran ve Ders Planı)
- **Görseller:** `acik/mobil/m-hub-moduller-kaydir.png`, `acik/web-panel/w-panel-anasayfa.png`.
- **Yerleşim (mobil, `Hub.tsx`):** 16 boşluk, köşe 22, `card` zemin, `line` kenar, iç aralık 10. Başlık satırı: "Bugün tekrar" / "Review today" (`headline`) ve sağda "yaklaşık 12 dk" / "about 12 min" (`meta`). İki satır (aralık 10): `Tile module="lessons" icon="refresh"` 36 + "5 adım" / "5 steps" (`headline` 14,5) + "Dersler · ilk denemede yanlış" / "Lessons · missed first time" + `moduleSoft lessons sm` "Başla" / "Start"; `Tile module="flashcards"` 36 + "32 kart" / "32 cards" + "Bilgi Kartları · unutmak üzere" / "Flashcards · about to slip" + `moduleSoft flashcards sm` "Başla".
- **Web (`StudyWeb.tsx` `ReviewCard`):** `WCard` başlık "Bugün tekrar", sağda "yaklaşık 12 dk"; satırlar `Tile` 40, aralık 12.
- **Veri:** Works `reviews` (adım sayısı), Bilgi Kartları bugün (kart sayısı); süre tahmini kaynağı doğrulanmadı.
- **Etkileşimler:** Dersler "Başla" → Dersler tekrar oturumu `m-ders-tekrar-oturum` (bkz. [04-Dersler.md](04-Dersler.md)) [push]; Bilgi Kartları "Başla" → kart oturumu `m-kart-on` (bkz. [08-Bilgi-Kartlari.md](08-Bilgi-Kartlari.md)) [push].
- **Hâller:** iki sayı da sıfırsa kart gösterilmez; biri sıfırsa yalnız o satır gizlenir.

## 5. Takılma ve kilitlenme önlemleri

- **Çift gönderim:** "Plana ekle", "Bugüne ekle", "Haftaya yay", tamamla yuvarlağı, "Bitir" istek sürerken kilitli; yuvarlak iyimser güncellenir, hata gelirse geri alınır ve kısa bildirim çıkar. Görev isteklerinde `version` gönderilir; 409 çakışmasında liste yeniden yüklenir.
- **Sayaç:** odak süresi sunucu zamanından hesaplanır (`serverTimeUtc` + `elapsedSeconds`). Arka plana geçişte sayaç durmaz, dönüşte `GET sessions/active` ile eşitlenir. Mobilde `AppState`, webde `visibilitychange` dinlenir. Ağ yokken complete kuyruğa girer, uygulama açılınca gönderilir.
- **Launch:** görev açma isteği zaman aşımına uğrarsa (25 sn) alt sayfa açık kalır, "Görev açılamadı." ve yeniden deneme; gezinme isteği beklemeden başlamaz (önce yanıt, sonra push), ama düğme `loading` gösterir.
- **Uzun liste:** Program ve Ay görünümünde görevler sanallaştırılır (`FlatList` / web sanal liste); günde 30'dan çok görevde de kaydırma akıcıdır.
- **Alt sayfalar:** her zaman kapanır (aşağı çekme, karartma, geri tuşu, `x`). Klavye açıkken geri tuşu önce klavyeyi kapatır.
- **Zaman aşımı:** okuma 25 sn, gönderim 60 sn; sonra yerinde hata ve "Tekrar dene". Sonsuz dönen gösterge yok.
- **Gün değişimi:** uygulama gece yarısı açık kalırsa ön plana dönüşte "bugün" yeniden hesaplanır ve takvim yenilenir; dünkü görevler "Dünden kalan" kutusuna düşer.
- **Geri:** `m-plan-odak` geri hareketi onay sorar (oturum kaybolmasın); diğer ekranlarda doğrudan geri.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | ikisi | `m-plan-bugun`, `w-plan-bugun` | Örnek veriyle TR/EN × açık/koyu ekran görüntüsü al | PNG ile yerleşim, sıra, metin, renk aynı |
| 2 | bileşen | ikisi | `PlanTaskCard` | `own`, `now`, `done`, `badge` varyantlarını çiz | Kendi görevinde `Tile` yok ve gri rozet; `now` modül kenarı ve gölge; `done` 0,62 opaklık ve üstü çizili |
| 3 | birim | ikisi | görev kartı | Her `reasonCode` için kaynak metnini üret | Tablo §4.11 ile aynı metin; bilinmeyen kod modül adına düşer |
| 4 | e2e | ikisi | `m-plan-bugun` → modül | Testler görevine dokun → "Testi başlat" | `launch` çağrılır, Testler çözme ekranı açılır; dönünce görev bitti görünür |
| 5 | e2e | mobil | `m-plan-gorev-islem` | Kilitli görevde "Testi başlat" | Ekran açılmaz; kilit nedeni ya da paket kapısı gösterilir |
| 6 | e2e | ikisi | `m-plan-gorev-ekle` | Alanları doldur, "Plana ekle"ye iki kez hızlı dokun | Tek `POST tasks`; alt sayfa kapanır; görev listede |
| 7 | e2e | ikisi | `m-plan-gorev-ekle` | Ağ kapalıyken gönder | Alt sayfa açık, girilenler korunur, kısa bildirim |
| 8 | e2e | mobil | `m-plan-gorev-islem` | "Yarına taşı" | `PATCH schedule` yarın; kart bugünden çıkar, yarının halkasında görünür |
| 9 | e2e | mobil | `m-plan-gorev-islem` | Sistem görevinde "Bugünden kaldır" | `PATCH status = 2`; `DELETE` gönderilmez |
| 10 | e2e | mobil | `m-plan-gorev-islem` | Kendi görevinde "Bugünden kaldır" | Onay penceresi, sonra `DELETE` |
| 11 | e2e | ikisi | `m-plan-odak`, `w-plan-odak` | Odağı başlat, uygulamayı 3 dk arka plana al, dön | Kalan süre 3 dk azalmış; `sessions/active` ile eşit |
| 12 | e2e | ikisi | `m-plan-odak` | "Bitir" → onayla | `complete` bir kez; günün dakikası artar |
| 13 | e2e | mobil | `m-plan-dunden` | Dünden 2 Planned görev hazırla, aç | Sarı kutu, "Dünden 2 görev kaldı", dakika toplamı doğru |
| 14 | e2e | mobil | `m-plan-dunden` | "Bugüne ekle" | Her görev için `PATCH schedule`; kutu kalkar; kartlarda "Dünden" rozeti |
| 15 | e2e | ikisi | `m-plan-yok` | Planı olmayan hesapla aç | `StateBlock` + iki seçenek + örnek gün; "Planımı hazırla · 1 dk" plan oluşturmayı açar |
| 16 | e2e | ikisi | `m-plan-yok` | "Kendi planımı kuracağım" | `POST manual`; boş gün ve "+" görünür |
| 17 | bileşen | ikisi | `m-plan-bugun` | Gün / Hafta / Ay segmentini değiştir | Görünüm değişir, gezinme olmaz, seçim titreşimi |
| 18 | bileşen | ikisi | süzgeç çipleri | "Testler" seç | Yalnız Testler görevleri; "Tümü · N" sayısı değişmez |
| 19 | birim | ikisi | ilerleme çubuğu | 0, 45, 100 değerleri, TR ve EN | Hap çubuğun dışına taşmaz; TR `%45`, EN `45%` |
| 20 | birim | ikisi | gün başlığı | Sıfır dakikalı gün | "0 dk" yerine sıfır metni |
| 21 | erişilebilirlik | mobil | `m-plan-bugun` | En büyük yazı boyutu, iPhone SE | Başlık, segment ve kartlar kesilmez; son kart sekme çubuğunun üstüne kaydırılır |
| 22 | erişilebilirlik | ikisi | bütün ekranlar | Kontrast ölçümü | `mod.ink` yazı ve `mod.action` üstü beyaz yazı ≥ 4,5:1 |
| 23 | erişilebilirlik | ikisi | "+", oklar, `x` | Ekran okuyucu | Her ikon düğmesinin adı okunur; dokunma alanı ≥ 44 pt / 48 dp |
| 24 | e2e | ikisi | bütün ekranlar | Android geri tuşu / web geri | Alt sayfa kapanır; odakta onay; başka yerde bir önceki ekran |
| 25 | e2e | ikisi | `m-plan-bugun` | Takvim isteği 25 sn yanıt vermesin | Hata hâli ve "Tekrar dene"; donma yok |
| 26 | e2e | tablet | `t-plan-hafta` | Görevi başka güne sürükle | `PATCH schedule`; görev yeni günde |
| 27 | görsel | ikisi | `m-plan-*`, `w-plan-*` bütün çizimler | TR/EN × açık/koyu | İlgili dört PNG ile aynı |
| 28 | e2e | ikisi | Bugün tekrar kartı | Adım sayısı 0 | Dersler satırı gizli; ikisi 0 ise kart yok |

## 7. Çizim ile bugünkü kod arasındaki farklar

1. **Mobil sekme 4 adı:** çizim "Program" / "Schedule"; bugünkü kod "Takvim" (`src/core/i18n/catalogs/tr-TR/studyPlan.ts` `tabs.schedule`).
2. **Gün / Hafta / Ay:** çizimde `m-plan-bugun` ve `w-plan-bugun` başlığında; mobilde bu geçiş yalnız Takvim ekranında (`screens/StudyPlanScheduleScreen.tsx`, "Gün" / "Hafta" / "Ay"); webde Program sayfasında yalnız "Hafta" / "Ay" var, "Gün" görünümü yok (`W pages/StudyPlanSchedulePage.tsx`).
3. **Görev ekle düğmesi:** çizimde mobil 40 pt "+" daire ("Görev ekle"), web "Görev ekle"; mobil kod "+ Ders ekle" metinli düğme ve alt sayfa başlığı "Ders ekle" (`studyPlan.home.addTask`, `task.createTitle`).
4. **Görev ekle alanları:** çizim "Ne yapacaksın?" (Konu çalış, Soru çöz, Deneme, Tekrar, Diğer), "Ders ve konu" tek alan, "Ne zaman?" (Bugün, Yarın, Tarih seç, saat), süre hapları 15/25/40/60, düğme "Plana ekle". Mobil kod ayrı Ders, Konu, Çalışma (dokuz tür), Başlık, Tarih, Saat, Süre (+ "Özel"), Not, "Kaydet". Web formu (`W pages/_components/StudyPlanTaskForm.tsx`) yalnız başlık, açıklama, süre, saat: tür, ders, konu ve tarih yok.
5. **Görev işlemleri:** çizimde modül renkli "Testi başlat", "Odak sayacıyla başla", "Yarına taşı", "Yaptım olarak işaretle", "Bugünden kaldır". Mobil kodda "Çalışmaya başla" (mod seçimi Pomodoro / Tek parça), "Saati değiştir", "Tamamlandı", "Ertele / Atla" ya da "Sil"; "Yarına taşı" ve "Bugünden kaldır" adıyla eylem yok (`components/StudyPlanTaskActionSheet.tsx`). Web: "Tamamla" ve "Diğer işlemler" (Görevi düzenle, Atla, Ertele = `status` Deferred, Sil); yarına taşıma yok.
6. **Dünden kalan:** mobilde var (`components/StudyPlanMissedBanner.tsx`, metinler çizimle aynı); webde hiç yok.
7. **Plan yok hâli:** mobil metinler çizimle aynı (`components/StudyPlanNoPlanEmpty.tsx`; yalnız örnek gün alt yazısı "Derslerine göre", çizim "Kayıttaki cevaplarına göre"). Web: "Çalışma planını oluşturalım" ve "Planı oluştur" bağlantısı (`StudyPlanSetupPrompt`); "Kendi planımı kuracağım" seçeneği ve örnek gün yok.
8. **Bugün ekranı ek bölümleri:** mobil kod listeyi "Sıradaki", "Bugünün programı", "Saati belirlenmemiş", "Tamamlananlar" bölümlerine ayırır ve "Çalışmaya devam et" kartı gösterir; çizimde bölüm başlığı yok, tek liste var. Mobil ve web Bugün sayfasında "Bugün tekrar" kartı var (`components/StudyPlanReviewTodayCard.tsx`, web `StudyPlanReviewTodayCard`); `m-plan-bugun` ve `w-plan-bugun` çizimlerinde yok (kart ana ekran çiziminde). Mobil kart düğmeleri "Adımları tekrar et" / "Kartlara başla", çizimde iki satırda da "Başla".
9. **Hafta halkaları:** çizimde her gün halka ve ilerleme yayı (bitti = yeşil); mobil kodda `StudyPlanWeekStrip` var, yay davranışı çizimle karşılaştırılmadı (doğrulanmadı).
10. **Odak:** mobil metinler "Duraklat", "Seansı bitir", "İçeriği aç"; çizim "Bitir", "Duraklat" ve görev kartı "Odak bitince teste geçersin". Web üst şeritte "Ara ver" ve "Görevi bitir" çizimle aynı.
11. **Web "Odak sayacı":** web Bugün sayfasında başlıkta "Odak sayacı" düğmesi; çizimde sağ sütunda ayrı kart ("Problemler · Orta ile başla").
12. **Plan ayarları rotası:** Registry `StudyPlanCreate` diyor; mobilde ayarlar ayrıca `components/StudyPlanSettingsSheet.tsx` alt sayfasında; çizimdeki tam ekran "Plan ayarları"nın hangi koda karşılık geldiği doğrulanmadı.
13. **API'de olmayan alan:** görevde `moduleKey` / `sourceType` yok; modül iki istemcide de `taskType`'tan çıkarılıyor. "Dünden kalan" için ayrı uç yok; takvimden süzülüyor.
14. **Çevrimdışı:** Ders Planı modülünde iki istemcide de çevrimdışı şeridi ya da kuyruk bulunmadı (genel katman doğrulanmadı).
15. **Çizimin kendi içinde:** Düzeltildi (17 Kasım 2026): `t-plan-hafta` görev adları EN çizimde çevrildi. Açık kalan: mobil süzgeç çiplerinde Bilgi Kartları yok ama listede Bilgi Kartları görevi var.
