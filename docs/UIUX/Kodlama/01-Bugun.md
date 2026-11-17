# Modüller ana ekranı (Bugün) · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Hub.tsx`, `Parts/Study.tsx` (`TodayCard`, `WeekStrip`, `ActionCard`), `Parts/Mobile.tsx` (`Phone`, `AppHeader`, `TabBar`, `TourOverlay`, `FitList`), `Parts/Shared.tsx`, `Screens/Web/StudyWeb.tsx` (`WebHome*`, `WebTourScreen`), `Screens/Web/Panel.tsx` (`WebModulesScreen`), `Parts/Web.tsx` (`Panel`, `Sidebar`, `Topbar`, `WCard`, `Grid`), `Screens/Tablet/Parity.tsx` (`HubTablet*`), `Parts/Tablet.tsx` (`Tablet`)
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

## 1. Modül özeti

- **Ne işe yarar:** Uygulamanın ana ekranı. Öğrenci açınca önce "bugün ne yapacağım?" sorusunun cevabını görür: selam, hedef ve seri, hafta şeridi, bugünün planı ve sıradaki görev (tek düğme), iki eylem kartı (kaldığın yer, sıradaki deneme), sonra modüller, SinoAI, bugün tekrar ve destek (UIUX-Rehberi §1, §5.1; sahip onayı 5 Kasım 2026, modül slayt karuseli kalktı).
- **Öğrencinin ana işi:** Günün sıradaki görevine tek dokunuşla girmek; ya da bir modüle geçmek.
- **Renk:** Ana ekranın kendi modül rengi yoktur. `UIProvider` modülsüz çizilir, bu yüzden bağlamın vurgusu (`useAccent`) marka turuncusudur:
  - Vurgu: `brand` `#EA580C` / koyu `#F97316` (hafta şeridi halkası ve noktası), `brandDeep` `#C2410C` / koyu `#FB923C` (bugünün gün adı, ipucu üst satırı), `brandSoft` `#FFEDD5` / koyu `#3B1D0C` (bugünün dairesi), düğme dolgusu `action` `#C2410C` (iki temada aynı; "Paketleri gör", "Anladım").
  - Kartların içi kendi modülünün rengindedir (Modul-Kimligi §4: başka modülü açan düğme o modülün rengindedir). Bu ekranda kullanılan modül değerleri (`ModuleIdentity.ts` ile hesaplandı):

| Modül | `color` açık / koyu | `action` (düğme) | `ink` açık / koyu | `soft` açık / koyu |
|---|---|---|---|---|
| Ders Planı (`studyPlan`) | `#0D9488` / `#2DD4BF` | `#0C857A` | `#09685F` / `#81E5D9` | %12 / %21,6 |
| Testler (`tests`) | `#4F46E5` / `#818CF8` | `#4F46E5` | `#473FCE` / `#ADB4FA` | %12 / %21,6 |
| Dersler (`lessons`) | `#0284C7` / `#38BDF8` | `#0277B3` | `#015C8B` / `#88D7FB` | %12 / %21,6 |
| Denemeler (`exam`) | `#E8590C` / `#FB8A3C` | `#C54C0A` | `#A23E08` / `#FCB380` | %12 / %21,6 |
| Bilgi Kartları (`flashcards`) | `#DB2777` / `#F472B6` | `#DB2777` | `#A41D59` / `#F8AAD3` | %12 / %21,6 |
| Akıllı Özet (`smartSummary`) | `#7C3AED` / `#A78BFA` | `#7C3AED` | `#6931C9` / `#C6B4FC` | %12 / %21,6 |
| SinoAI (`sinoAi`) | `#475569` / `#CBD5E1` | `#475569` | `#475569` / `#DDE4EC` | %12 / %21,6 |

  Saydam katmanlar her modülde aynı adımlarla: wash %7, soft (ikon kutusu) %12, track (iz) %16, line (kenar) %24; koyu temada ×1,8 (%12,6 / %21,6 / %28,8 / %43,2).
- **Mobil tab bar:** Ana ekranda **tab bar yoktur** (`Content tabBar={false}`, `TabBar` çizilmez; Adlandirma-Kurallari §2). Ana ekrana dönüş her modülün tab bar'ındaki **yuva 3 Modüller**'dir (Modul-Kimligi §6):

| Yuva | Etiket TR / EN | İkon | Hedef |
|---|---|---|---|
| 1 | Modülün kendisi (ör. Denemeler / Exams) | modül ikonu | modülün vitrini |
| 2 | Ana işi (ör. Denemelerim / My exams) | modüle göre | modülün 2. ekranı |
| **3** | **Modüller / Modules** | `grid` (22 pt, stroke 3) 42 pt `line2` daire içinde, etiket `meta` 10 pt (taban 12 pt) `muted` | **`m-hub-moduller`**, yığın ana ekrana kadar geri sarılır (sekme değiştirmez) |
| 4 | Kayıtlar ya da ikinci iş (ör. Sonuçlar / Results) | modüle göre | modülün 4. ekranı |
| 5 | Profil / Profile | `user` | `m-profil` (modülden bağımsız açılır) |

  Yuva 3'ün kendi aktif hâli yoktur; modül rengini almaz. Tab bar: `left/right 14`, `bottom 22`, yükseklik 72, köşe 28, `card` %96, kenar `line`, gölge `UI_SHADOW.float`; aktif yuva `mod.soft` hapı (58 yüksek, köşe 20), ikon `mod.color`, etiket `mod.ink` 800.
- **Web:** Sol menüde en üstte **Ana sayfa / Home** (`home` ikonu) ve **Tüm modüller / All modules** (`apps`); "Modüller" başlığı altında yedi modül; "Hesap" altında İstatistiklerim, Bildirimler (sayaç 3), Destek; en altta seri kartı ve Çıkış yap. Ana sayfada hap sekme yoktur. Yollar: `/student/dashboard` (ana sayfa ve dört hâli), `/student/moduller` (Tüm modüller; Registry: "yeni sayfa: web uygulamasında yok").
- **Tablet:** Tam ekran tablet, web ana sayfasının kendisini uygulamanın üst çubuğunun altında gösterir (`PanelInTablet`: sol menü ve web üst çubuğu yok). 600 pt altında (Split View) telefon düzeni.

## 2. Ekran haritası

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-hub-moduller` | mobil | Modüller (ana ekran) | `ModuleHubHome` | `src/modules/hub/presentation/screens/ModuleHubHomeScreen.tsx` | dolu (plan var) |
| `w-panel-anasayfa` | web | Ana sayfa | `/student/dashboard` | `src/features/dashboard/pages/DashboardPage.tsx` | dolu (plan var) |
| `t-hub-moduller` | tablet | Ana ekran · yatay | `ModuleHubHome` | aynı mobil ekran, `wide` dalı | dolu (plan var) |
| `m-hub-moduller-kaydir` | mobil | Modüller · aşağı kaydırılmış | `ModuleHubHome` | aynı ekran | kaydırılmış |
| `m-hub-ipucu` | mobil | İlk açılış ipucu | `ModuleHubHome` | `.../hub/presentation/components/ModuleHubTip.tsx` | ilk |
| `w-panel-tur` | web | İlk giriş ipucu | `/student/dashboard` | `src/features/dashboard/components/PanelTip.tsx` | ilk |
| `m-hub-plansiz` | mobil | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | `ModuleHubHomeScreen.tsx` + `src/shared/components/study/TodayPlanCard.tsx` | boş (plan yok) |
| `w-panel-anasayfa-plansiz` | web | Ana sayfa · planı olmayan öğrenci | `/student/dashboard` | `DashboardPage.tsx` | boş (plan yok) |
| `t-hub-plansiz` | tablet | Ana ekran · planı olmayan öğrenci | `ModuleHubHome` | mobil `wide` dalı | boş (plan yok) |
| `m-hub-gun-bitti` | mobil | Ana ekran · günün planı bitti | `ModuleHubHome` | `TodayPlanCard.tsx` (`done`) | bitti |
| `w-panel-anasayfa-gun-bitti` | web | Ana sayfa · günün planı bitti | `/student/dashboard` | `DashboardPage.tsx` | bitti |
| `t-hub-gun-bitti` | tablet | Ana ekran · günün planı bitti | `ModuleHubHome` | mobil `wide` dalı | bitti |
| `m-hub-abonelik-bitti` | mobil | Ana ekran · deneme süresi bitti | `ModuleHubHome` | `TodayPlanCard.tsx` (`expired`) | hak (erişim bitti) |
| `w-panel-anasayfa-abonelik-bitti` | web | Ana sayfa · deneme süresi bitti | `/student/dashboard` | `DashboardPage.tsx` | hak (erişim bitti) |
| `t-hub-abonelik-bitti` | tablet | Ana ekran · deneme süresi bitti | `ModuleHubHome` | mobil `wide` dalı | hak (erişim bitti) |
| — | mobil | (çizilmedi) | — | — | yükleniyor, hata, çevrimdışı: ortak `m-durum-hata` |
| `w-panel-moduller` | web | Tüm modüller | `/student/moduller` | yok (yalnız `/student/moduller/ders-cal` yönlendirmesi var) | dolu |

## 3. Süreçler (akışlar)

### 3.1 Ana ekranı açmak
1. Uygulama açılır (oturum açık ya da misafir erişimi etkin) → `m-hub-moduller` [kök ekran]. Veriler paralel istenir (§4.1 Veri); her kart kendi kaynağı gelince dolar, en yavaş uç diğerlerini bekletmez.
2. İlk açılışsa ve hedef sınav penceresi kapalıysa → `m-hub-ipucu` [kaplama]. "Anladım / Got it" → ipucu bir daha gösterilmez (cihazda/tarayıcıda işaret).
3. Ekran her odaklandığında (modülden dönüş) veriler tazelenir; içerik yerinde kalır, üstte küçük gösterge (`UI_MOTION_MOMENTS.refreshing`).
- **Geri:** Ana ekran yığının köküdür. Android geri tuşu uygulamayı arka plana alır; iOS'ta geri hareketi yoktur.

### 3.2 Her kartın açtığı ekran

| Öğe (metin TR / EN) | Hedef ekran | Geçiş | Not |
|---|---|---|---|
| Üst çubuk solda profil simgesi | `m-profil` | push | web: üst çubuktaki kullanıcı menüsü → `w-panel-profil` |
| Üst çubuk sağda zil (rozet) | `m-bildirimler` (boşsa `m-bildirimler-bos`) | push | web: zil → `w-panel-bildirimler` |
| Seri çipi "5 gün" | çizimde dokunma tanımlı değil | — | doğrulanmadı |
| Hafta şeridinde bir gün | çizimde dokunma tanımlı değil | — | doğrulanmadı |
| Bugünün planı · "Tümü / All" | `m-plan-bugun` (web `/student/ders-plani`) | sekme değişimi (Ders Planı modülü, yuva 1) | |
| Bugünün planı · sıradaki görev "Başla / Start" | görevin kaynağı (`ResourceType`/`ResourceId`, task `launch`); örnekte Testler → `m-test-coz` | push (modül yığını) | modül, görevin modülüdür; düğme o modülün renginde |
| Plan yok · "Planımı hazırla / Build my plan" | plan kayıt cevaplarıyla hazırlanır → `m-plan-bugun` | push | API: study-plan intake / onboarding complete (API'de doğrulanmalı) |
| Plan yok · "Kendi planımı kuracağım / I'll make my own" | `POST student/study-plan/manual` → `m-plan-program` | push | düğme loading iken kilitli |
| Gün bitti · "Yarına bak / See tomorrow" | `m-plan-bugun` yarının tarihiyle | push | |
| Gün bitti · "Fazladan 10 soru / 10 extra questions" | `m-test-vitrin` | push | Testler renginde |
| Deneme süresi bitti · "Paketleri gör / See plans" | `m-profil-paketler` (web `w-panel-abonelik`) | push | Profil belgesine ait |
| Deneme süresi bitti · "Mağaza aboneliğini geri yükle / Restore a store purchase" | mağaza geri yükleme (sistem) | sistem penceresi | yalnız mobil; Profil belgesine ait |
| Eylem kartı "Kaldığın yerden" · "Devam et / Continue" | kalınan mikro dersin adımı (`WorkMikro`: `m-ders-tanim` … `m-ders-soru`) | push (Dersler yığını) | |
| Eylem kartı "İlk adımın" · "Başla / Start" (plansız) | ilk mikro dersin ilk adımı (`WorkMikro`) | push | ilk mikro ders plansız başlar |
| Eylem kartı (abonelik bitti) · "Paketleri gör" | `m-profil-paketler` | push | |
| Eylem kartı "Sıradaki deneme" (kartın kendisi) | `m-deneme-detay` | push (Denemeler yığını) | |
| Eylem kartı "Sıradaki deneme" · "Hatırlat / Remind me" | hatırlatma kurulur, ekran değişmez | durum değişimi | API'de doğrulanmalı; bugünkü kod düğme metnini deneme hâline göre değiştirir (§7) |
| Modül kutusu Denemeler | `m-deneme-vitrin` | push | |
| Modül kutusu Dersler | `m-ders-vitrin` (ilk girişte `m-ders-ilk`) | push | |
| Modül kutusu Testler | `m-test-vitrin` | push | |
| Modül kutusu Ders Planı | `m-plan-bugun` (plan yoksa `m-plan-yok`) | push | |
| Modül kutusu Akıllı Özet | `m-ozet-vitrin` (hak dolduysa `m-ozet-hak`) | push | |
| Modül kutusu Bilgi Kartları | `m-kart-vitrin` | push | |
| SinoAI kartı | `m-sino-ana` | tam ekran (push, `fullScreenFlow`) | SinoAI'nin tab bar'ı yok |
| Bugün tekrar · Dersler "Başla" | `m-ders-tekrar` → `m-ders-tekrar-oturum` | push | Dersler renginde |
| Bugün tekrar · Bilgi Kartları "Başla" | `m-kart-bugun` → `m-kart-on` | push | Bilgi Kartları renginde |
| Destek kartı | `m-destek` | push | web: menü → `w-panel-destek` |
| Paket dışı modül (kilitli) | uyarı: "Erişim" + "Paketler" | sistem uyarısı | bugünkü kodun davranışı; çizimde yok |

- **Web farkı:** Aynı hedefler web yollarıyla açılır (Dersler `/student/ders-cal`, Testler `/student/testler`, Ders Planı `/student/ders-plani`, Akıllı Özet `/student/lens`, Bilgi Kartları `/student/flashcard`, SinoAI `/student/sinoai`, Denemeler `/student/sinavlarim`). "Bu hafta" kartındaki "İstatistiklerim / My statistics" → `/student/istatistik` (İstatistikler belgesi; yol doğrulanmadı). "Modüller" kartındaki "Tümü / All" → `w-panel-moduller`.
- **Yarıda bırakma:** Bu ekranda yarıda kalan iş yoktur. "Kendi planımı kuracağım" isteği düşerse kart yerinde kalır, hata kısa bildirimle (toast) söylenir.

## 4. Ekranlar

Ortak ölçüler: telefon tuvali 390 × 844 pt, durum çubuğu 50 pt. İçerik alanı `Content` (yan 18, üst 4, alt 20; tab bar yok), bloklar arası 14 pt. Kart gölgesi `UI_SHADOW.card`. Yazı rolleri `UI_TYPE` (boy / satır / kalınlık): `title` 22/28/800, `section` 17/23/800, `headline` 15/20/700, `body` 16/24/500, `small` 13/18/500, `meta` 12/16/600, `over` 12/16/800 BÜYÜK HARF, harf aralığı 0,08 em. Hiçbir yazı 12 pt altına inmez. `Tile`: köşe = boy × 0,32, ikon = boy × 0,5, dolgu modülün `soft`, ikon modülün `color` (`solid`: modül gradyanı, beyaz ikon). Düğme boyları: `sm` 36 (yazı 13), `md` 46 (15), `lg` 54 (16), köşe tam yuvarlak, yazı 700.

### `m-hub-moduller` Modüller (ana ekran) · web: `w-panel-anasayfa` · tablet: `t-hub-moduller`

- **Görseller:** `acik/mobil/m-hub-moduller.png`, `koyu/mobil/m-hub-moduller.png`, `en/acik/mobil/m-hub-moduller.png`; `acik/web-panel/w-panel-anasayfa.png`, `koyu/web-panel/w-panel-anasayfa.png`; `acik/tablet/t-hub-moduller.png`
- **Çerçeve:** `AppHeader` (yükseklik 52, yan 14): solda profil simgesi (`user` 22 pt, 40 pt daire, zeminsiz), ortada logo (yükseklik 24, marka turuncusu; koyu temada `#F97316`), sağda zil (`bell` 22 pt, 40 pt daire) ve rozet. Rozet: en az 18 × 18, köşe 9, `#DC2626`, yazı beyaz 800 (12 pt taban), üstten 2 sağdan 0, yan iç boşluk 4. Modül sekme çubuğu yok. Alt düğme alanı yok. Arka plan `bg` (`#F7F7F8` / `#0F1115`), yıkama yok.
- **Yerleşim (yukarıdan aşağı):** Sayfa dikey kayar. Üstte yalnız tam sığan bloklar görünür; bir blok yarım kesilmez (`FitList`).
  1. **Selam satırı** (yatay, alta hizalı, iki yana yaslı):
     - Solda `title` 23 pt: "Günaydın Ayşe" / "Good morning, Ayşe". Ad öğrencinin adından; saat 05–12 Günaydın, 12–18 İyi günler, diğer saatler İyi akşamlar (bugünkü kodun kuralı).
     - Altında 4 pt arayla `target` ikonu 15 pt `ink2` ve `small` `ink2`: "Hedef **TYT · 245 gün kaldı**" / "Goal **TYT · 245 days left**" (kalın kısım `ink`). Sınav adı ve kalan gün en yakın resmi sınav takviminden.
     - Sağda `Chip tone="warning"` `flame` ikonlu: "5 gün" / "5 days" (yükseklik 28, yan 11, yazı 13/700, `warningSoft` zemin, `warningInk` yazı). Seri 0 ise çip yok.
  2. **Hafta şeridi** `WeekStrip` (Pazartesi–Pazar, bugünkü hafta):
     - 7 sütun, her biri 46 pt genişlik, üst 8 alt 9 iç boşluk, köşe 22. Bugünün sütunu `card` zemin ve kart gölgesi.
     - Gün adı `meta`: "Pzt Sal Çar Per Cum Cmt Paz" / "Mon Tue Wed Thu Fri Sat Sun"; bugün `brandDeep` 800, diğerleri `muted` 600.
     - Gün dairesi 34 pt: bugün `brandSoft` zemin ve çevresinde 2,5 pt `brand` halka (yarıçap 15,5; çevre 97,4; dolu kısım = bugünün tamamlanan görev payı, saat 12'den başlar, uçları yuvarlak); diğer günler `card` zemin, 1 pt `line` kenar. Sayı `headline` 14 pt, eşit genişlikli rakam; bugün `brandDeep`.
     - Altında 5 pt nokta: o gün en az bir görev bittiyse `brand`, değilse görünmez.
  3. **Bugünün planı** `TodayCard state="plan"`: köşe 24, `card` zemin, 1 pt `line` kenar, kart gölgesi, iç boşluk 16, satır arası 12.
     - Üst satır: `over` Ders Planı `ink` "Bugünün planı" / "Today's plan"; altında `headline` 16 "2 / 5 görev · 45 / 90 dk" / "2 / 5 tasks · 45 / 90 min". Sağda `small` 700 Ders Planı `ink` "Tümü" / "All".
     - `Bar` 8 pt: dolu kısım Ders Planı `color`, iz Ders Planı `track` (%16); değer = çalışılan / planlanan dakika (örnek 0,45).
     - Sıradaki görev satırı: iç boşluk 10/12, köşe 18, `line2` zemin. `Tile` görev modülü 40 pt; `meta` "Sıradaki · Testler" / "Next · Quizzes"; `headline` "Problemler · Orta" / "Problems · Medium"; `small` "20 soru · 25 dk" / "20 questions · 25 min"; sağda `Button tone="module"` görev modülü, `sm`, `play` ikonlu: "Başla" / "Start".
  4. **İki eylem kartı** yan yana, aralık 10, eşit yükseklik. `ActionCard`: esnek genişlik, köşe 24, `card` zemin, `line` kenar, kart gölgesi, iç boşluk 14, satır arası 6.
     - Üst satır: `over` modül `ink` + sağda `right` ok 16 pt `subtle`.
     - Başlık `section` 17 pt, satır 22. Altında `small` tek satır (gerekirse iki).
     - Ölçü kutusu: en az 64 pt, köşe 16, modül `soft` zemin, dış boşluk 4/0, iç 10/12.
     - Altta `Button tone="module" size="sm" block`.
     - **Sol kart (Dersler):** "Kaldığın yerden" / "Continue"; "Mecaz anlam" / "Figurative meaning"; "Sözcükte Anlam · 4 dk kaldı" / "Word meaning · 4 min left"; ölçü: solda `small` 700 Dersler `ink` "2 / 5 adım" / "2 / 5 steps", sağda `meta` 800 yüzde (`%40` / `40%`), altında 8 pt `Bar` (dolu Dersler `color`, iz `card`, en az %2); düğme "Devam et" / "Continue".
     - **Sağ kart (Denemeler):** "Sıradaki deneme" / "Next exam"; "TYT Deneme 5" / "TYT Exam 5"; "Cumartesi 10:00 · 12.480 kişi" / "Saturday 10:00 · 12,480 joined"; ölçü: üç kutu yan yana (aralık 6, her biri esnek, üst/alt 4, köşe 10, `card` zemin): `headline` 17 eşit genişlikli sayı + `meta` 12 birim: "2 gün", "4 saat", "15 dk" / "2 days", "4 hours", "15 min"; düğme "Hatırlat" / "Remind me".
  5. **Modüller başlığı ve ilk sıra** birlikte (başlık asla sayfanın altında tek başına kalmaz): `SectionTitle` `section` "Modüller" / "Modules"; altında 10 pt arayla 3 sütunlu ızgara (aralık 10): Denemeler, Dersler, Testler.
  6. **İkinci sıra:** Ders Planı, Akıllı Özet, Bilgi Kartları. Modül kutusu (`ModuleTile`): ortalı, iç boşluk 10/6/8, köşe 20, `card` zemin, 1 pt `line` kenar, öğeler arası 5. `Tile` 40 pt; ad `headline` 13,5 pt (satır 17) ortalı; durum etiketi `meta` 12 pt `muted` ortalı. Örnek durumlar: Denemeler "Cumartesi canlı" / "Live on Saturday"; Dersler "1 konu sürüyor" / "1 topic in progress"; Testler "1 test hazır" / "1 quiz ready"; Ders Planı "Bugün 2 / 5" / "Today 2 / 5"; Akıllı Özet "Bu ay 7 / 30" / "7 / 30 this month"; Bilgi Kartları "32 kart bugün" / "32 due today".
  7. **SinoAI kartı** (tam genişlik, satır): iç boşluk 14, köşe 22, `card`, `line` kenar, aralık 12. `Tile` SinoAI 44 pt; "SinoAI" `headline`; `small` "Takıldığın yerde hedefini bilerek anlatır" / "Explains with your goal in mind"; sağda `right` 20 pt `subtle`.
  8. **Bugün tekrar** kartı: iç boşluk 16, köşe 22, `card`, `line` kenar, satır arası 10.
     - Başlık satırı: `headline` "Bugün tekrar" / "Review today", sağda `meta` "yaklaşık 12 dk" / "about 12 min".
     - Satır 1: `Tile` Dersler `refresh` ikonlu 36 pt; `headline` 14,5 "5 adım" / "5 steps"; `small` "Dersler · ilk denemede yanlış" / "Lessons · missed first time"; `Button tone="moduleSoft"` Dersler `sm` "Başla" / "Start".
     - Satır 2: `Tile` Bilgi Kartları 36 pt; "32 kart" / "32 cards"; "Bilgi Kartları · unutmak üzere" / "Flashcards · about to slip"; `moduleSoft` Bilgi Kartları "Başla".
  9. **Destek kartı** (nötr): iç boşluk 14, köşe 20, `card`, `line` kenar, aralık 12. 40 pt kutu (köşe 13, `line2` zemin, `headset` 20 pt `ink2`); `headline` "Destek" / "Support"; `small` "Soruların ve taleplerin için yardım merkezi" / "Help centre for your questions"; sağda ok.
- **Veri:** (UIUX-Rehberi §5.8 ve bugünkü mobil/web servisleri)
  - Selam ve seri, planlanan/çalışılan dakika: `GET student/engagement/today` (`study.currentStreakDays`, `study.studiedMinutes`, `study.plannedMinutes`; seri yedek alanı `streak.currentDays`). Ad: öğrencinin `name` alanı (`StudentAuth/me`).
  - Hedef satırı: öğrencinin hedef sınav alt kategorileri (profil kategori) + resmi sınav takvimi (`Categories/exam-calendar`); en yakın sınavın kısa adı ("TYT (Temel Yeterlilik Testi)" → "TYT") ve kalan gün; gün 0 ise saat ve dakika. Takvim "tahmini" ise "~245 gün".
  - Hafta şeridi, bugünün planı, sıradaki görev: `GET student/study-plan/calendar` (bu hafta). Görev durumu: 0 bekliyor, 1 tamamlandı, 2 atlandı, 3 ertelendi. Sıradaki görev = bugünün ilk bekleyen görevi (saati olan önce, saate göre; sonra önceliğe göre). Plan yoksa yanıtta `noPlan`.
  - Kaldığın yerden: `GET student/works/continue` (`title`, `lessonSubName`, `completedBlockCount`, `blockCount`, `workMikroId`).
  - Sıradaki deneme: Denemeler ay özeti (bugünkü kod `fetchExamMonth`, `.../month?year=&month=`): odak adımı olan ilk şablonun odak adımı (`title`, `questionCount`, `durationMinutes`, `examId`, `state`). Katılımcı sayısı ve geri sayım: API'de doğrulanmalı.
  - Bugün tekrar: `GET student/works/reviews?take=50` (adım sayısı), Bilgi Kartları ana özeti `.../flashcard/home?weakUnits=false` (bugünkü kart sayısı). "yaklaşık 12 dk": API'de doğrulanmalı.
  - Modül durum etiketleri yalnız bu ekranın zaten çektiği veriden üretilir; ek istek atılmaz. Testler ("1 test hazır") ve Akıllı Özet ("Bu ay 7 / 30") için kaynak: API'de doğrulanmalı (Akıllı Özet: mevcut kota ucu).
  - Bildirim rozeti: okunmamış bildirim sayısı (bildirim bağlamı); 9'dan büyükse "9+".
  - Erişim: modül hakları (entitlements); hiçbir modül açık değilse "deneme süresi bitti" hâli.
- **Etkileşimler:** §3.2 tablosu. Her dokunulabilir öğenin dokunma alanı en az 44 pt (iOS) / 48 dp (Android); `sm` düğme görünürde 36 pt olsa da dokunma alanı genişletilir. Kartın tamamı ve kartın düğmesi aynı yere gider (eylem kartı). Basılı durumda kart/düğme 0,97 ölçek, 140 ms (`UI_MOTION.scale.press`, `duration.press`).
- **Hâller:**
  - İlk yükleme: içerik yokken sayfanın ortasında `LoadingLogo` (dönen saatli logo); iskelet yok. Kaynağı henüz gelmeyen tek kartın yerinde o kartın `LoadingLogo`'su durur, diğerleri dolar.
  - Yenileme: içerik yerinde kalır, üstte küçük gösterge.
  - Bir kaynak düşerse yalnız o kart önceki hâlinde kalır; hiçbiri gelmezse ortak hata hâli `m-durum-hata` ("Tekrar dene").
  - Plan yok → `m-hub-plansiz`; gün bitti → `m-hub-gun-bitti`; erişim bitti → `m-hub-abonelik-bitti`; ilk açılış → `m-hub-ipucu`.
  - Bugün tekrar: adım ve kart ikisi de 0 ise kart çizilmez (mobil); web'de sakin bir satır (bugünkü web kodu).
  - Hedef sınav seçilmemiş öğrenci: hedef sınav seçim penceresi açılır, ipucu bekler (bugünkü kodun davranışı; çizimi yok).
- **Web farkı (`w-panel-anasayfa`):** `Panel active="home"`: sol menü 260 px, üst çubuk 68 px, sayfa iç boşluğu 22/28/28, bloklar arası 18. Web'de gövde, küçük ve meta yazılar 1 pt büyüktür.
  1. Başlık satırı: `small` 14 tarih "Perşembe, 15 Ekim" / "Thursday, 15 October"; `title` 30 "Günaydın Ayşe"; hedef satırı aynı; sağda `Chip warning flame` "5 gün seri" / "5-day streak".
  2. İki sütun `1.3fr 1fr` (aralık 18): solda `TodayCard`; sağda `WCard` (iç boşluk 20) içinde `WeekStrip` ve altında iki `KpiCard compact` yan yana: "Bu hafta" / "This week" (`clock`) "4 sa 10 dk" / "4 h 10 m", değişim çipi "↗ %22"; "Doğru oranı" / "Accuracy" (`target`) "%62", "↗ %6". `KpiCard compact`: köşe 22, iç 12/14, ikon dairesi 30, sayı `num` 22.
  3. Üç sütun `1fr 1fr 1.1fr`: Dersler eylem kartı, Denemeler eylem kartı, `WCard` "Bugün tekrar" (sağ üstte `small` 700 "yaklaşık 12 dk"; satırlarda `Tile` 40).
  4. İki sütun `1.3fr 1fr`: `WCard` "Bu hafta" / "This week" (sağda "İstatistiklerim" / "My statistics"): `StudyBars` yükseklik 110 (tablette 56), yedi gün modüllere göre yığılı (Dersler, Testler, Denemeler, Bilgi Kartları), bugün (Per) öne çıkar; ipucu kutusu "Perşembe · Planlanan 90 dk · Çalışılan 45 dk" / "Thursday · Planned 90 min · Studied 45 min". `WCard` "Modüller" / "Modules" (sağda "Tümü" / "All"): 3 sütun ızgara (aralık 10), her öğe satır: iç 9/10, köşe 14, `line` kenar, `Tile` 30, ad `headline` 13,5 tek satır. SinoAI bu kartta yoktur (sol menüde var).
  - Klavye: menü, kartlar ve düğmeler sekme sırasıyla görsel sıradadır; odak halkası 2 px `ink`, 3 px boşluk. Üst çubukta "Ctrl K" arama.
- **Tablet farkı (`t-hub-moduller`):** 1194 × 834 yatay tuval, durum çubuğu 30. Üstte mobil `AppHeader` (yan 18; profil, logo, zil). Altında web sayfasının içeriği aynen (yan 28, alt 22, bloklar arası 14); sol menü ve web üst çubuğu yok; `StudyBars` yükseklik 56. Yıkama yok. Altta ev çubuğu (200 × 5).
- **Kurallar:**
  - Sıra her platformda aynı: selam → hafta → bugünün planı → eylemler → modüller → SinoAI → tekrar → destek (web'de iki/üç sütuna yayılır, sıra korunur).
  - Modül sırası her yerde: Denemeler, Dersler, Testler, Ders Planı, Akıllı Özet, Bilgi Kartları, SinoAI.
  - Kartın içindeki düğme kendi modülünün renginde; marka turuncusu yalnız logo, hafta şeridi vurgusu ve ödeme ile ilgili düğmede.
  - Destek kartı nötrdür (beyaz kart, gri simge); ana eylem değildir.
  - Reklam yok. Ödeme olmadan erişim yok (3 günlük mağaza denemesi).
  - Sıfır sayı "0 dk" diye yazılmaz; web ölçüleri veri yoksa "—".

### `m-hub-moduller-kaydir` Modüller · aşağı kaydırılmış

- **Görseller:** `acik/mobil/m-hub-moduller-kaydir.png`, `koyu/mobil/m-hub-moduller-kaydir.png`, `en/acik/mobil/m-hub-moduller-kaydir.png`
- **Çerçeve:** `m-hub-moduller` ile aynı; üst çubuk sabit kalır, içerik altından geçer.
- **Yerleşim:** Sayfanın sonu ekranın altına oturmuş hâli: üstte (kesik olabilir) eylem kartları, sonra Modüller başlığı ve iki sıra, SinoAI kartı, Bugün tekrar, Destek. Son kart (Destek) güvenli alanın üstünde, alt boşluk 20 pt.
- **Etkileşimler:** §3.2.
- **Kurallar:** Kaydırma dikey; yatay kaydırma yok (hafta şeridi telefonda 7 günü sığdırır). Son satır ekranın altına girmez (güvenli alan + 20 pt). Çekip yenileme bu ekranda açık olabilir (liste değil; doğrulanmadı).

### `m-hub-ipucu` İlk açılış ipucu · web: `w-panel-tur`

- **Görseller:** `acik/mobil/m-hub-ipucu.png`, `koyu/mobil/m-hub-ipucu.png`, `en/acik/mobil/m-hub-ipucu.png`; `acik/web-panel/w-panel-tur.png`
- **Çerçeve:** `m-hub-moduller` üstünde kaplama (`TourOverlay`, z-index 30).
- **Yerleşim:**
  - Karartma: `rgba(11, 28, 48, 0.62)`; vurgulanan delik bugünün planı kartının çevresi (çizimde x 12, y 268, 366 × 196, köşe 28) ve 4 pt beyaz (%95) halka. Uygulamada delik kartın gerçek ölçüsünden hesaplanır.
  - İpucu kartı deliğin 18 pt altında, yanlardan 16 pt, köşe 22, `card`, iç boşluk 18, gölge `float`; üstte deliğe bakan 16 pt döndürülmüş kare (ok), yatay ortada.
  - `over` `brandDeep`: "İpucu" / "Tip".
  - `section` (6 pt üst): "Her gün buradan başla" / "Start here every day".
  - `body` (4 pt üst): "Planındaki sıradaki görev burada; tek dokunuşla açılır. Plan yoksa Ders Planı birkaç soruyla hazırlar." / "The next task of your plan is here, one tap away. No plan yet? Ders Planı builds one with a few questions."
  - Sağ altta (14 pt üst) `Button sm` birincil (marka `action`): "Anladım" / "Got it". Tek ipucu olduğu için adım noktaları ve "Geç" yok.
- **Veri:** "Gösterildi" işareti: mobilde cihaz deposu, web'de tarayıcı deposu (öğrenci başına).
- **Etkileşimler:** "Anladım" → kaplama kapanır (çıkış 180 ms soluklaşma), işaret yazılır. Android geri tuşu = "Anladım". Karartmaya dokunmak kapatmaz (web kodu `allowBackdropDismiss=false`).
- **Hâller:** Ekran verisi gelmeden ipucu açılmaz; hedef sınav penceresi açıkken bekler. Kart ölçüsü geç gelen içerikle değişirse delik yeniden ölçülür.
- **Web farkı (`w-panel-tur`):** Delik sol 282, üst 196, 640 × 300, köşe 28; karartma `rgba(11,28,48,0.6)`. Kart sol 300, üst 520, 440 px, köşe 22, iç 20, ok soldan 60 px. Metin: "Planındaki sıradaki görev burada; tek tıkla açılır. Modüller solda, hep aynı yerde." / "Your next task is here, one click away. Modules stay on the left." Düğme sağa yaslı "Anladım". Odak açılınca düğmeye gider; Esc = "Anladım".
- **Kurallar:** Ön tanıtım turu yok; tek ipucu, bir kez (UIUX-Rehberi §0).

### `m-hub-plansiz` Ana ekran · planı olmayan öğrenci · web: `w-panel-anasayfa-plansiz` · tablet: `t-hub-plansiz`

- **Görseller:** `acik/mobil/m-hub-plansiz.png`, `koyu/mobil/m-hub-plansiz.png`, `en/acik/mobil/m-hub-plansiz.png`; `acik/web-panel/w-panel-anasayfa-plansiz.png`; `acik/tablet/t-hub-plansiz.png`
- **Çerçeve:** `m-hub-moduller` ile aynı.
- **Yerleşim (yalnız farklar):**
  - Hafta şeridi: nokta yok, bugünün halkası boş (pay 0).
  - Plan kartı `NoPlanCard`: köşe 24, `card`, **1,5 pt Ders Planı `line`** kenar, gölge, iç 16, aralık 12.
    - Üst: `Tile` Ders Planı 46 pt `solid` (gradyan, beyaz ikon); yanında `over` Ders Planı `ink` "Planın yok" / "No plan yet" ve `section` 17 (satır 22) "Planını 1 dakikada hazırlayalım" / "Let's build your plan in a minute".
    - Kayıt cevapları kutusu: iç 10/12, köşe 16, Ders Planı `wash` zemin, satır arası 6; üç satır (solda `small` etiket, sağda `small` 700 `ink` değer): "Sınavın · TYT · 245 gün" / "Exam · TYT · 245 days"; "Haftada · 5 gün · günde 90 dk" / "Per week · 5 days · 90 min a day"; "Zorlandığın · Matematik, Fizik" / "Hard for you · Maths, Physics". Altında `meta`: "Bunları kayıtta söyledin; istersen değiştirirsin." / "From your sign-up; you can change them."
    - `Button tone="module"` Ders Planı, `md`, tam genişlik, `sparkles` ikonlu: "Planımı hazırla" / "Build my plan".
    - Altında ortalı `small` 700 Ders Planı `ink` bağlantı: "Kendi planımı kuracağım" / "I'll make my own".
  - Sol eylem kartı: "İlk adımın" / "First step"; "Gerçek anlam" / "Literal meaning"; "TYT Türkçe · ilk mikro ders" / "TYT Turkish · first micro-lesson"; ölçü "6 adım · 4 dk" / "6 steps · 4 min", `%0`; düğme "Başla" / "Start". İlk mikro ders kayıtta zorlandığın dersten gelir.
  - Ders Planı kutusunun durum etiketi: veri yoksa yok (bugünkü kod "Plan yok").
  - Web: KPI'lar "—", değişim çipi yok; "Bu hafta" grafiği boş, ipucu kutusu yok.
- **Veri:** Kayıt cevapları (sınav, haftalık gün ve dakika, zorlanılan dersler) onboarding'de kaydedilen değerlerden; sınav kalan gün takvimden. Haftalık gün/dakika ve zorlanılan dersler için okuma ucu: API'de doğrulanmalı.
- **Etkileşimler:** "Planımı hazırla" → plan bu cevaplarla kurulur → `m-plan-bugun` (düğme loading iken kilitli). "Kendi planımı kuracağım" → `POST student/study-plan/manual` → `m-plan-program`; hata: kısa bildirim, kart yerinde. "Başla" → ilk mikro ders.
- **Kurallar:** İlk mikro ders plansız da başlar. Çıkmaz sokak yok: kart neden plan olmadığını söyler ve tek ana eylem sunar.

### `m-hub-gun-bitti` Ana ekran · günün planı bitti · web: `w-panel-anasayfa-gun-bitti` · tablet: `t-hub-gun-bitti`

- **Görseller:** `acik/mobil/m-hub-gun-bitti.png`, `koyu/mobil/m-hub-gun-bitti.png`, `en/acik/mobil/m-hub-gun-bitti.png`; `acik/web-panel/w-panel-anasayfa-gun-bitti.png`; `acik/tablet/t-hub-gun-bitti.png`
- **Yerleşim (farklar):**
  - Hafta şeridi: bugün dahil noktalı, bugünün halkası tam.
  - Plan kartı `DayDoneCard`: köşe 24, `card`, **1,5 pt `success`** kenar, gölge, iç 16, aralık 12.
    - 46 pt yuvarlak `success` dolgu, içinde `check` 24 pt beyaz; yanında `section` 17 "Bugünkü planın bitti" / "Today's plan is done" ve `small` "5 / 5 görev · 92 dk · seri 6 gün" / "5 / 5 tasks · 92 min · 6-day streak".
    - İki düğme yan yana (aralık 8, eşit genişlik, `sm`): `ghost` `calendar` ikonlu "Yarına bak" / "See tomorrow"; `moduleSoft` Testler `quiz` ikonlu "Fazladan 10 soru" / "10 extra questions".
  - Web: seri çipi "6 gün seri" / "6-day streak".
- **Etkileşimler:** "Yarına bak" → `m-plan-bugun` yarının tarihiyle. "Fazladan 10 soru" → `m-test-vitrin` (isteğe bağlı iş).
- **Hareket:** Son görev bittiği anda kart `taskDone` + `badgeEarned` anı: tik 240 ms çizilir, titreşim `notificationSuccess` bir kez.
- **Kurallar:** Fazladan iş isteğe bağlıdır; zorlayıcı dil yok.

### `m-hub-abonelik-bitti` Ana ekran · deneme süresi bitti · web: `w-panel-anasayfa-abonelik-bitti` · tablet: `t-hub-abonelik-bitti`

- **Görseller:** `acik/mobil/m-hub-abonelik-bitti.png`, `koyu/mobil/m-hub-abonelik-bitti.png`, `en/acik/mobil/m-hub-abonelik-bitti.png`; `acik/web-panel/w-panel-anasayfa-abonelik-bitti.png`; `acik/tablet/t-hub-abonelik-bitti.png`
- **Yerleşim (farklar):**
  - Plan kartı `ExpiredCard` (marka yüzeyi): köşe 24, `brandWash` zemin, 1,5 pt `brandSoft` kenar, gölgesiz, iç 16, aralık 10.
    - 46 pt kutu (köşe 15, `card`), `lock` 22 pt `brandDeep`; yanında `section` 17 "3 günlük deneme süren bitti" / "Your 3-day trial has ended" ve `small` `ink2` "Planın, ilerlemen ve notların duruyor. Abone olunca kaldığın yerden devam edersin." / "Your plan, progress and notes are kept."
    - `Button` birincil (marka `action` `#C2410C`), `md`, tam genişlik: "Paketleri gör" / "See plans".
    - Ortalı `meta`: "Mağaza aboneliğini geri yükle" / "Restore a store purchase" (yalnız mobil).
  - Sol eylem kartı: başlık ve satır aynı ("Kaldığın yerden · Mecaz anlam"), ölçü kutusunda `lock` 16 + `small` 700 Dersler `ink` "Abone olunca açılır" / "Opens with a plan"; düğme "Paketleri gör" / "See plans" (Dersler renginde).
  - Sıradaki deneme kartı aynı kalır (geri sayım ve "Hatırlat").
  - Modül kutuları kilitlidir (Registry notu: "modüller kilitli"); çizimde kilit işareti ayrıca gösterilmez.
- **Veri:** Erişim: modül hakları; hepsi kapalı ve oturum doğrulanmışsa bu hâl.
- **Etkileşimler:** "Paketleri gör" → `m-profil-paketler` (web `w-panel-abonelik`, Profil belgesi). "Mağaza aboneliğini geri yükle" → mağaza geri yükleme; başarıda ekran `m-hub-moduller`'e döner. Kilitli modül kutusu → paket bilgisi.
- **Kurallar:** Ödeme yoksa erişim yok; ilerleme korunur ve bu açıkça yazılır. Kilit simgesi tek başına neden anlatmaz; kart nedenini söyler.

### `w-panel-moduller` Tüm modüller (yalnız web)

- **Görseller:** `acik/web-panel/w-panel-moduller.png`, `koyu/web-panel/w-panel-moduller.png`
- **Çerçeve:** `Panel active="modules"` (sol menüde "Tüm modüller" aktif).
- **Yerleşim:**
  - `title` 30 "Tüm modüller" / "All modules"; `small` 14 "Her modülün kendi rengi var: simgede, menüde ve sekmede aynı renk. Ana sayfadaki kutucuklarla aynı düzen." / "Each module keeps its colour on its icon, menu and tabs."
  - 4 sütunlu ızgara (aralık 18), yedi kart; SinoAI 2 sütun kaplar. Kart: iç 18, köşe 22, `card`, `line` kenar, aralık 10. Üstte `Tile` 48 ve sağda `right` 18 `subtle`; `section` modül adı; `small` modülün tek satırı (tagline: "Deneme çöz, sonucunu gör", "Konuyu adım adım öğren", "Adım adım konu testleri", "Haftalık programın ve görevlerin", "Soru görselinden analiz al", "Kartlarla öğrenmeye devam et", "Soru çöz, özet çıkar, çalışma üret"); `Chip tone="module" size="sm"` durum: "Cumartesi: TYT Deneme 5" / "Sat: TYT Exam 5", "3 ders sürüyor" / "3 in progress", "35 / 100", "Bugün 1/3" / "Today 1/3", "Bu ay 7 / 30" / "7 / 30 this month", "32 kart bugün" / "32 due today", "Hedefini bilir" / "Knows your goal".
- **Etkileşimler:** Kart → modülün web ana sayfası (§3.2 web yolları).

## 5. Takılma ve kilitlenme önlemleri

- **Paralel yükleme:** Kaynaklar birbirini beklemez; her kart kendi kaynağıyla dolar. En yavaş uç (kart özeti, istatistik) ekranı kilitlemez.
- **Eski yanıt:** Ekrana yeniden odaklanınca başlayan yükleme, öncekinin geç gelen yanıtını yok sayar (çalıştırma sayacı).
- **Zaman aşımı:** Bir kaynak zaman aşımı süresinde (okuma 25 sn, gönderim 60 sn; [Navigasyon](Navigasyon.md) §6.1) dönmezse o kart önceki hâlinde kalır ya da hata hâlini gösterir; hiçbir kaynak gelmezse sayfa hata hâli ve "Tekrar dene".
- **Çift gönderim:** "Kendi planımı kuracağım" ve "Planımı hazırla" loading iken kilitli; ikinci dokunuş istek atmaz. Kart dokunuşu hedef ekran açılırken ikinci kez gezinme başlatmaz.
- **Geri sayım:** Saniyelik sayaç yalnız ekran odaktayken çalışır; arka planda durur, dönüşte sunucu saatine göre düzelir (sunucu saati farkı). Sınava 0 gün kala dakika/saniye, yoksa dakikalık tik.
- **İpucu:** Ölçü bulunamazsa ipucu karartmasız ortada açılır; ölçü 4 sn boyunca yeniden denenir. İpucu hiçbir zaman ekranı kilitli bırakmaz (Android geri = kapat).
- **Hafıza:** Modül ekranları ilk boş anda önceden yüklenir; ana ekran listesi kısa, sanallaştırma gerekmez.
- **Çevrimdışı:** İnce sarı şerit; son gelen veriler yerinde kalır; dokunulan modül kendi çevrimdışı kuralını uygular.
- **Erişim durumu bilinmiyorsa:** Modül dokunuşu "bekliyor" durumunda yok sayılır; sunucuya ulaşılamıyorsa "Bağlantı sorunu" uyarısı.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | mobil | `m-hub-moduller` | Plan var verisiyle aç, açık tema | Ekran görüntüsü `acik/mobil/m-hub-moduller.png` ile yan yana aynı; tab bar yok |
| 2 | görsel | mobil | `m-hub-moduller` | Koyu tema | `koyu/mobil/m-hub-moduller.png` ile aynı; logo `#F97316`, hafta halkası `#F97316` |
| 3 | görsel | mobil | `m-hub-moduller` | Dil EN | `en/acik/mobil/m-hub-moduller.png` ile aynı; yüzde "40%" |
| 4 | birim | ikisi | Bugünün planı | expired/noPlan/planned/completed kombinasyonları | Sıra: erişim bitti > plan yok > hepsi bitti = gün bitti > plan |
| 5 | birim | ikisi | Sıradaki görev | Saatli ve saatsiz bekleyen görevler | Saatli olan önce (saate göre), sonra öncelik |
| 6 | birim | ikisi | Hafta şeridi | Biten görevli günler | Yalnız biten görevi olan günlerde nokta; bugünün halkası tamamlanan/planlanan |
| 7 | bileşen | ikisi | `TodayCard` | Dört hâli ayrı çiz | Metinler §4'teki TR ve EN ile birebir |
| 8 | e2e | mobil | `m-hub-moduller` | Sıradaki görev "Başla" | Görevin modül ekranı açılır; geri ile ana ekran |
| 9 | e2e | ikisi | Modül kutuları | Yedi modüle sırayla dokun | Her biri §3.2'deki hedefi açar; geri tuşu ana ekrana döner |
| 10 | e2e | mobil | Tab bar yuva 3 | Bir modülde 3 ekran derine in, "Modüller"e dokun | Doğrudan `m-hub-moduller`; yığın birikmez |
| 11 | e2e | mobil | `m-hub-ipucu` | İlk açılış | İpucu bir kez; "Anladım" sonrası yeniden açılışta yok |
| 12 | e2e | web | `w-panel-tur` | İlk giriş, Esc | İpucu kapanır, bir daha gösterilmez |
| 13 | e2e | ikisi | `m-hub-plansiz` | "Kendi planımı kuracağım"a iki kez hızlı dokun | Tek `POST study-plan/manual`; Program ekranı açılır |
| 14 | e2e | ikisi | `m-hub-plansiz` | Manuel plan isteği 500 döner | Kısa hata bildirimi; kart ve düğme yeniden kullanılabilir |
| 15 | e2e | ikisi | `m-hub-gun-bitti` | "Yarına bak" | Ders Planı yarının tarihiyle |
| 16 | e2e | ikisi | `m-hub-abonelik-bitti` | "Paketleri gör" | Paketler ekranı; geri ile ana ekran |
| 17 | e2e | mobil | `m-hub-abonelik-bitti` | "Mağaza aboneliğini geri yükle" | Mağaza geri yükleme başlar; başarıda plan hâli |
| 18 | e2e | ikisi | ana ekran | Ağ kapalı aç | Sarı şerit; hata hâli ve "Tekrar dene"; ekran donmaz |
| 19 | e2e | ikisi | ana ekran | Takvim ucu 20 sn gecikir | Diğer kartlar dolu; plan kartı yerinde `LoadingLogo`, zaman aşımında (okuma 25 sn, gönderim 60 sn; [Navigasyon](Navigasyon.md) §6.1) hata |
| 20 | erişilebilirlik | mobil | ana ekran | En büyük yazı boyutu | Selam, kart başlıkları, düğmeler kesilmez; kutular büyür |
| 21 | erişilebilirlik | ikisi | ana ekran | Ekran okuyucu | Zil "Bildirimler, 3 okunmamış", profil, hafta günleri ("Perşembe, bugün, görev tamamlandı") okunur |
| 22 | erişilebilirlik | ikisi | ana ekran | Kontrast ölçümü | Her yazı en az 4,5:1 (modül `ink`, `muted` `#5F6B7D`) |
| 23 | erişilebilirlik | mobil | ana ekran | Dokunma hedefleri | Her hedef ≥ 44 pt / 48 dp, yan yana hedefler arası ≥ 8 |
| 24 | görsel | web | `w-panel-anasayfa` | 1440 × 900, açık ve koyu | `acik/` ve `koyu/web-panel/w-panel-anasayfa.png` ile aynı |
| 25 | görsel | web | `w-panel-anasayfa` | 375, 768, 1024 px | Yatay kaydırma yok; sütunlar alt alta |
| 26 | görsel | tablet | `t-hub-*` | Dört hâl | `acik/tablet/t-hub-*.png` ile aynı (web sayfası, menüsüz) |
| 27 | birim | ikisi | yüzde | TR ve EN | TR `%40`, EN `40%`; değişim çipi TR `%22` |
| 28 | e2e | mobil | geri sayım | Uygulamayı arka plana al, 5 dk sonra dön | Sayaç doğru değerde; arka planda tik yok |

## 7. Çizim ile bugünkü kod arasındaki farklar

Mobil kök: `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src`. Web kök: `C:\Users\onurc\source\repos\sinavika_frontend_student\src`.

1. **Eylem kartında ölçü yok (mobil).** `shared/components/study/StudyActionCard.tsx` ölçü kutusunda yalnız modül simgesini (`solid`) gösterir; ilerleme çubuğu ve yüzde, deneme geri sayımı (gün/saat/dk) ve kilit nedeni yoktur. Web `components/study/StudyParts` için aynı durum doğrulanmadı.
2. **Erişim bitti metinleri.** Mobil `core/i18n/catalogs/tr-TR/study.ts`: başlık "Erişim süren bitti" (çizim "3 günlük deneme süren bitti"); "Mağaza aboneliğini geri yükle" bağlantısı `TodayPlanCard.tsx`'te yok. Kilitli Dersler kartının düğmesi "Kilitli" (`hub.action.locked`), çizimde "Paketleri gör" ve ölçüde "Abone olunca açılır".
3. **Plan yok kartı.** Mobil ve web yalnız "Sınavın" satırını gösterir (`ModuleHubHomeScreen.tsx` `rows`, `features/dashboard/pages/DashboardPage.tsx`); "Haftada" ve "Zorlandığın" satırları yok. Not metni farklı ("Plan sınav tarihine ve günlük süreye göre kurulur; istediğin an değiştirirsin."). "Planımı hazırla" mobilde `StudyPlanCreate` (plan ayarları), web'de `/student/baslangic` (onboarding) açar; çizimde kayıt cevaplarıyla tek dokunuşta plan kurar. Plansız ilk eylem kartı başlığı "Derslere başla" / "Konu konu, adım adım" (çizim: ilk mikro dersin adı ve "6 adım · 4 dk").
4. **Modül durum etiketleri.** Kod: Denemeler "Bu ay {done} / {total}", Dersler "Konu sürüyor", Ders Planı "Bugün d/t" ya da "Plan yok", Bilgi Kartları "{n} kart bugün"; Testler ve Akıllı Özet için etiket yok (`catalogs/tr-TR/hub.ts` `status`). Çizim: "Cumartesi canlı", "1 konu sürüyor", "1 test hazır", "Bu ay 7 / 30".
5. **SinoAI kartı.** Mobilde SinoAI ızgaranın altında tek başına bir `ModuleHubTile` (ortalı kutu, durum "Hedefini bilerek anlatır") olarak çizilir ve yalnız SinoAI açıkken görünür; çizimde satır kartı (44 pt kutu, başlık, "Takıldığın yerde hedefini bilerek anlatır", ok).
6. **Bugün tekrar.** Mobil satır metni "Dersler · tekrar zamanı gelen" (çizim "Dersler · ilk denemede yanlış"); başlıkta "yaklaşık 12 dk" yok. Dersler "Başla" `WorkReview`'u, Bilgi Kartları "Başla" `FlashcardToday`'i açar (oturumu değil).
7. **Sıradaki görev "Başla".** Mobil görevi doğrudan açmaz; Ders Planı'nı `startTaskId` ile açar (`openStudyPlanHome`). Web `studyPlanFocusPath(id)` (odak sayacı) açar. Çizim: görevin kaynağı açılır.
8. **Sıradaki deneme düğmesi.** Kod düğme metnini deneme hâline göre seçer: Başla, Devam et, Sonucu gör, Hatırlat, Aç; ay bittiyse "Bu ayın denemeleri bitti" kartı (`hub.action.exam.*`). Çizimde yalnız "Hatırlat" ve geri sayım; katılımcı sayısı kodda yok.
9. **Web ana sayfa düzeni.** `DashboardPage.tsx`'te "Bu hafta" yığılı çubuk grafiği (`StudyBars`) yok. Modüller, çizimdeki küçük "Modüller" kartı yerine eylem kartlarının altında büyük gradyanlı kartlar olarak 4 sütun çizilir (`features/dashboard/components/DashboardModules.tsx`, SinoAI dahil). `/student/moduller` sayfası yok (yalnız `moduller/ders-cal` yönlendirmesi); web mesajlarında "Tüm modüller" menü satırı bulunmadı.
10. **Web ipucu metni.** `i18n/messages/tr/post-login/dashboard.ts` `tip.body`: "…tek dokunuşla açılır. Plan yoksa Ders Planı birkaç soruyla hazırlar. Modüller aşağıda ve solda, hep aynı yerde." Çizim: "…tek tıkla açılır. Modüller solda, hep aynı yerde."
11. **Tablet.** Mobil `wide` dalı kendi iki sütununu çizer (solda selam, plan, eylemler; sağda hafta + iki ölçü, tek satırlık tekrar, iki sütun modül, SinoAI, destek). Çizimde tablet = web sayfasının aynısı (üç sütunlu eylem satırı, "Bu hafta" grafiği, Modüller kartı).
12. **Hafta şeridi plansızken.** Mobil kod hafta verisi yoksa şeridi hiç çizmez; çizimde plansız öğrencide boş şerit görünür.
13. **Tab bar orta yuva.** Mobil `app/navigation/MainTabBar.tsx` orta yuvayı yükseltir (`CENTER_LIFT`, büyük ikon kutusu, `apps` ikonu); çizimde düz, 42 pt `line2` daire ve `grid` ikonu.
14. **İpucu deposu.** Mobil işaret cihaz başına (`sinavika_hub_tour_v1`), web öğrenci başına; çizim kuralı tek ipucu, bir kez (fark değil, bilgi).
15. **Kodda olup çizimi olmayanlar.** Hedef sınav seçim penceresi (`hub/presentation/components/ModuleHubTargetExamCard.tsx`), "Oturum gerekli" kartı (`ModuleHubSessionNotice.tsx`), paket dışı modüle dokununca "Erişim" uyarısı (`useModuleHubNavigation.ts`), web'de seri paylaşma düğmesi (`ShareCardButton`, seri eşiği üstünde).
16. **Doğrulanamayanlar.** "Hatırlat" düğmesinin API'si, deneme katılımcı sayısı, "Bugün tekrar" süresi, Testler ve Akıllı Özet durum etiketlerinin kaynağı ve "Planımı hazırla"nın kayıt cevaplarıyla tek dokunuşta plan kuran ucu: API'de doğrulanmalı.
