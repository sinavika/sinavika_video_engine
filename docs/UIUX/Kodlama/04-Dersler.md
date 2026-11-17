# Dersler · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Lessons.tsx`, `Mobile/LessonSteps.tsx`, `Mobile/States.tsx` (Dersler), `Mobile/Gaps.tsx` (`LessonReviewSessionScreen`), `Mobile/Learn.tsx` (yalnız yeniden dışa aktarım), `Web/LessonsWeb.tsx`, `Web/GapsWeb.tsx` (Dersler), `Web/StudyWeb.tsx` (dört yeni adım türü), `Tablet/Learn.tsx`, `Tablet/Wide.tsx` ve `Tablet/Parity.tsx` (ders ekranları)
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

Bu belgede "çizim" `src/UIUX` kodudur, "bugünkü kod" mobil (`sinavika_mobile_reactnative/src/modules/works`) ve web (`sinavika_frontend_student/src/features/works`) kodudur. Adım ekranlarındaki ders içeriği (Sözcükte Anlam, TYT Türkçe kampının 1. dersi) örnektir ve sunucudan gelir. Adım çizimlerinin çerçeve metinleri ("Devam", "Kontrol et") çizimde yalnız Türkçe yazılmıştır (`t()` yok). Bu yüzden EN PNG'lerde de Türkçe görünür. EN karşılıkları mobil `en-US/work` kataloğundan alındı; katalogda olmayanlar "EN: doğrulanmadı" diye işaretlidir.

## 1. Modül özeti

- **Ne işe yarar:** öğrenci bir konuyu kısa mikro derslerle, adım adım öğrenir. Her adımda okur ya da cevaplar. İlk denemede yanlış yaptığı adımlar 1, 3 ve 7 gün sonra Tekrar'da yeniden gelir.
- **Hiyerarşi:** ders (`LessonMain`, ör. Türkçe) → konu (`LessonSub`, ör. Sözcükte Anlam) → mikro ders (`WorkMikro`, 2–6 dk, ör. Mecaz anlam) → adım (`Block`, ör. Tanım). Ana liste her zaman derstir (UIUX-Rehberi "Hiyerarşi kuralı"). Bugün ve plan kartları doğrudan bir konuya götürebilir.
- **Kod adları:** anahtar `lessons`; API `Works`, uç `/api/student/works`; web klasörü `works`; mobil modül `works`, rota öneki `Work`.

**Renk** (`ModuleIdentity.ts`, `moduleTint`, `moduleInk`, `moduleAction`):

| Jeton | Açık | Koyu |
|---|---|---|
| `color` (kimlik, ikon, ilerleme dolgusu) | `#0284C7` | `#38BDF8` |
| `action` (düğme dolgusu, beyaz yazıyla 4,9:1) | `#0277B3` | `#0277B3` |
| `ink` (modül renkli yazı) | `#015C8B` | `#88D7FB` |
| `wash` (sayfa üstü yıkama, seçili satır) | `rgba(2,132,199,0.07)` | `rgba(56,189,248,0.126)` |
| `soft` (ikon kutusu, çip, aktif sekme hapı) | `rgba(2,132,199,0.12)` | `rgba(56,189,248,0.216)` |
| `track` (ilerleme izi) | `rgba(2,132,199,0.16)` | `rgba(56,189,248,0.288)` |
| `line` (modül kenarı) | `rgba(2,132,199,0.24)` | `rgba(56,189,248,0.432)` |
| `gradient` | `linear-gradient(135deg, #0284C7, #22D3EE)` | `linear-gradient(135deg, #38BDF8, #22D3EE)` |

- **Durum renkleri:** doğru yeşil (`success`, `successSoft`, `successInk`), yanlış kırmızı (`error`, `errorSoft`, `errorInk`), ipucu ve dikkat sarı (`warning`, `warningSoft`, `warningInk`). Modül renginden ayrıdır.
- **Başka modüle geçen düğme o modülün rengindedir:** konu sonundaki "Kolay seviye testi" Testler indigosunda (`#4F46E5`). Abonelik alt sayfasındaki "Paketleri gör" marka turuncusundadır (`#C2410C`), çünkü ödeme marka yüzeyidir.

**Mobil tab bar** (Modul-Kimligi §6):

| Yuva | Etiket TR / EN | İkon | Hedef |
|---|---|---|---|
| 1 | Dersler / Lessons | `book` | `m-ders-vitrin` (`WorkHome` → `WorkOverview`) |
| 2 | Konular / Topics | `tree` | `m-ders-konular` (`WorkCatalog`) |
| 3 | Modüller / Modules | `grid` | Modüller ana ekranı |
| 4 | Tekrar / Review | `refresh` | `m-ders-tekrar` (`WorkReview` → `WorkReviewHome`) |
| 5 | Profil / Profile | `user` | Profil |

Oynatıcı (`WorkMikro`) ve tekrar oturumu (`WorkReviewSession`) odak ekranıdır: tab bar gizlenir.

**Web:**
- Sol menüde "Modüller" başlığı altında ikinci sırada "Dersler" (`book` ikonu).
- Hap sekmeler: Dersler · Konular · Tekrar.
- Sayfa yolları `/student/ders-cal/...` altındadır (§2).
- Oynatıcı ve tekrar oturumu odak sayfasıdır (`(immersive)`): sol menü ve üst çubuk yoktur.

**Tablet:**
- Yatayda tab bar yerine 96 pt yan ray (`SideRail`) kullanılır: Dersler, Konular, Tekrar, boşluk, Modüller, Profil.
- Oynatıcı tablet çerçevesinde çizilir (`LessonStep`). Kalem araçları vardır ([Tablet-Kalem.md](../Tablet-Kalem.md)).

## 2. Ekran haritası

Eşleşen ekranlar yan yana sıralıdır. "Bugünkü kod" sütunu: M = mobil `src/modules/works/presentation/...`, W = web `src/features/works/...` ya da `src/app/[locale]/(student)/student/...`.

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-ders-vitrin` | mobil | Dersler | `WorkHome · WorkOverview` | M `screens/WorkOverviewScreen.tsx` (yerleşimi farklı, §7) | dolu |
| `m-ders-ilk` | mobil | Dersler · ilk giriş | `WorkHome · WorkOverview` | yok (ayrı ilk giriş hâli yok) | ilk |
| `w-ders-vitrin` | web | Dersler | `/student/ders-cal` | W `pages/WorksHomePage.tsx` | dolu |
| `t-ders-vitrin` | tablet | Dersler · yatay | `WorkHome` | M `WorkOverviewScreen` + `ModuleTabRailFrame` (Notlarım düğmesi var) | dolu |
| `w-ders-dersler` | web | Dersler listesi | `/student/ders-cal/ders` | W `pages/WorksLessonPage.tsx` (bu yol ilk dersin konularını açar, liste yok) | dolu |
| `m-ders-konular` | mobil | Konular | `WorkLesson · WorkCatalog` | M `screens/WorkLessonScreen.tsx`, `screens/WorkCatalogScreen.tsx`, `components/WorkBrowseTree.tsx` | dolu |
| `w-ders-konular` | web | Konular | `/student/ders-cal/ders/[lessonMainId]` | W `pages/WorksLessonPage.tsx` | dolu, "Yakında" |
| `t-ders-konular-iki-panel` | tablet | Konular iki panel | `WorkCatalog + WorkSub` | M `components/WorkTopicsSplit.tsx`, `WorkTopicPane.tsx` | dolu |
| `m-ders-konu-girisi` | mobil | Konu girişi | `WorkSub` | yok (`WorkSubScreen` doğrudan mikro dersi açar) | dolu |
| `w-ders-konu-girisi` | web | Konu girişi | `/student/ders-cal/konu/[lessonSubId]` | yok (`WorksSubPage` doğrudan oynatıcıya yönlendirir) | dolu |
| `m-ders-hak` | mobil | Günlük konu hakkı | `WorkSub (PAYWALL)` | M `components/WorkGateBanner.tsx`, `WorkAccessLocked.tsx` (alt sayfa değil) | hak |
| `m-ders-bolum` | mobil | Bölüm başı | `WorkMikro` | yok | bölüm başı |
| `w-ders-bolum` | web | Oynatıcı · Bölüm başı | `/student/ders-cal/mikro/[workMikroId]` | yok | bölüm başı |
| `t-ders-bolum` | tablet | Bölüm başı | `WorkMikro` | yok | bölüm başı |
| `m-ders-tanim` | mobil | Adım · Tanım | `WorkMikro` | M `screens/WorkMikroScreen.tsx`, `components/WorkBlockView.tsx` (Concept) | dolu |
| `w-ders-tanim` | web | Oynatıcı · Tanım | `/student/ders-cal/mikro/[workMikroId]` | W `pages/WorksMikroPage.tsx`, `components/WorkBlockView.tsx` | dolu |
| `t-ders-tanim-not` | tablet | Tanım · kenar notu | `WorkMikro` | M `WorkMikroScreen` (kalem, kenar notu 290 pt) | kalem açık |
| `t-ders-sinoai-panel` | tablet | Ders adımı · SinoAI yan panelde | `WorkMikro` | doğrulanmadı (mobilde `SinoAiAskButton` var, yan panel görülmedi) | yanlış sonrası |
| `m-ders-ornek` | mobil | Adım · Örnek | `WorkMikro` | M `WorkBlockView` (Example) | dolu |
| `m-ders-kural` | mobil | Adım · Kural | `WorkMikro` | M `WorkBlockView` (Rule) | dolu |
| `m-ders-gorsel` | mobil | Adım · Görsel | `WorkMikro` | M `WorkBlockView` (Visual, figür) | dolu |
| `m-ders-tahmin` | mobil | Adım · Önce sen tahmin et | `WorkMikro` | M `WorkBlockView` (Choice) | doğru |
| `w-ders-tahmin` | web | Oynatıcı · Önce sen tahmin et | aynı | W `components/WorkInteractiveBlock.tsx` | doğru |
| `m-ders-dogru-yanlis` | mobil | Adım · Doğru mu, yanlış mı? | `WorkMikro` | M `WorkBlockView` (TrueFalse) | doğru |
| `w-ders-dogru-yanlis` | web | Oynatıcı · Doğru mu, yanlış mı? | aynı | W `WorkInteractiveBlock` | doğru |
| `m-ders-sirala` | mobil | Adım · Sırala | `WorkMikro` | M `WorkBlockView` `OrderPicker` | yarıda |
| `w-ders-sirala` | web | Oynatıcı · Sırala | aynı | W `WorkInteractiveBlock` (oklarla) | yarıda |
| `m-ders-bosluk` | mobil | Adım · Boşluk doldur | `WorkMikro` | M `WorkBlockView` (FillBlank) | yanlış |
| `w-ders-bosluk` | web | Oynatıcı · Boşluk doldur | aynı | W `WorkInteractiveBlock` | yanlış |
| `t-ders-bosluk-el-yazisi` | tablet | Boşluk doldur · el yazısı | `WorkMikro` | M `components/WorkFillBlankHandwriting.tsx` | kalemle yazıldı |
| `m-ders-yazmali` | mobil | Adım · Yazmalı boşluk | `WorkMikro` | M `WorkBlockView` (FillBlank metin girişi) | klavye açık |
| `m-ders-soru` | mobil | Adım · TYT tarzı soru | `WorkMikro` | M `WorkBlockView` (Question) | 1. yanlış |
| `w-ders-soru` | web | Oynatıcı · TYT tarzı soru | aynı | W `WorkInteractiveBlock` | 1. yanlış |
| `t-ders-soru-eleme` | tablet | TYT tarzı soru · eleme | `WorkMikro` | M `WorkMikroScreen` (adıma yaz, taslak) | kalemle eleme |
| `m-ders-sekilli-soru` | mobil | Adım · Şekilli soru | `WorkMikro` | M `WorkBlockView` + `ContentFigureView` | boş |
| `m-ders-grupla` | mobil | Adım · Grupla | `WorkMikro` | M `components/steps/WorkGroupStep.tsx` | yarıda |
| `w-ders-grupla` | web | Oynatıcı · Grupla | aynı | W `components/steps/WorkGroupStep.tsx` | yarıda |
| `t-ders-grupla` | tablet | Adım · Grupla | `WorkMikro` | M `WorkGroupStep` | yarıda |
| `m-ders-eslestir` | mobil | Adım · Eşleştir | `WorkMikro` | M `steps/WorkMatchStep.tsx` | yarıda |
| `w-ders-eslestir` | web | Oynatıcı · Eşleştir | aynı | W `steps/WorkMatchStep.tsx` | yarıda |
| `t-ders-eslestir` | tablet | Adım · Eşleştir | `WorkMikro` | M `WorkMatchStep` | yarıda |
| `m-ders-cevir` | mobil | Adım · Çevir | `WorkMikro` | M `steps/WorkFlipStep.tsx` | çevrildi |
| `m-ders-sec` | mobil | Adım · Seç | `WorkMikro` | M `steps/WorkSelectStep.tsx` | seçildi |
| `m-ders-coklu` | mobil | Adım · Çoklu seçim | `WorkMikro` | M `steps/WorkMultiChoiceStep.tsx` | sonuç |
| `m-ders-formul` | mobil | Adım · Formül ve tablo | `WorkMikro` | M `ContentRichText` (KaTeX), figür tablosu | dolu |
| `w-ders-formul` | web | Oynatıcı · Formül ve tablo | aynı | W `WorkBlockView` | dolu |
| `t-ders-formul` | tablet | Adım · Formül ve tablo | `WorkMikro` | M aynı | dolu |
| `m-ders-mikro-bitti` | mobil | Mikro ders bitti | `WorkMikro (mikro ders sonu)` | yok (sıradaki mikro derse ara ekransız geçilir) | bitti |
| `w-ders-mikro-bitti` | web | Mikro ders bitti | aynı | yok | bitti |
| `m-ders-konu-sonu` | mobil | Konu sonu | `WorkSubSummary` | M `screens/WorkSubSummaryScreen.tsx` | bitti |
| `w-ders-konu-sonu` | web | Konu sonu | `/student/ders-cal/konu/[lessonSubId]/ozet` | W `pages/WorksSummaryPage.tsx` | bitti |
| `m-ders-tekrar` | mobil | Tekrar | `WorkReviewHome · WorkReview` | M `screens/WorkReviewScreen.tsx` | dolu |
| `w-ders-tekrar` | web | Tekrar | `/student/ders-cal/tekrar` | W `pages/WorksReviewPage.tsx` | dolu |
| `m-ders-tekrar-bos` | mobil | Tekrar · bugün yok | `WorkReviewHome` | M `WorkReviewScreen` (`AppEmptyState`) | boş |
| `m-ders-tekrar-oturum` | mobil | Tekrar oturumu | `WorkReviewSession` | M `screens/WorkReviewSessionScreen.tsx` | doğru |
| `w-ders-tekrar-oturum` | web | Tekrar oturumu | `/student/ders-cal/tekrar/oturum` | W `pages/WorksReviewSessionPage.tsx` | doğru |
| `t-ders-notlarim` | tablet | Notlarım | `WorkNotes` | M `screens/WorkNotesScreen.tsx` | dolu |
| `w-ders-akis` | web | Akış panosu | — | yok (pano; ekran değil) | — |

Paylaşım kartları `p-konu-hikaye` ve `p-konu-gonderi` (konu bitirme) Dersler'e aittir; tanımları [Paylasim-Kartlari.md](../Paylasim-Kartlari.md)'dedir.

## 3. Süreçler (akışlar)

### 3.1 Konuyu öğrenmek (ana akış)

1. `m-ders-vitrin` / `w-ders-vitrin`. Öğrenci bir ders satırına dokunur → `m-ders-konular` / `w-ders-konular` [push; web: sayfa]. API `GET lessons/{lessonMainId}/subs`.
2. Bir konu satırına dokunur ("Devam et" / "Başla") → `m-ders-konu-girisi` / `w-ders-konu-girisi` [push]. API `GET subs/{lessonSubId}`.
   - Bitmiş konuda (`nextWorkMikroId = null`) konu girişi yerine `m-ders-konu-sonu` açılır [replace].
3. Konu girişinde "{sıradaki mikro ders} ile devam et" → oynatıcı, sıradaki mikro dersin ilk adımı ya da kalınan adım [push, odak geçişi; tab bar gizlenir].
   - API `GET mikros/{id}`. `progress` boşsa `POST mikros/{id}/start`.
   - Günlük konu hakkı burada düşer: bir konuda günün ilk başlatması bir hak harcar, aynı gün aynı konunun diğer mikro dersleri harcamaz.
   - Hak yoksa ya da abonelik yoksa `403 PAYWALL` döner → `m-ders-hak` alt sayfası (§4.6).
4. Her adımda:
   - Anlatım adımı (Tanım, Örnek, Kural, Görsel) → "Devam". API `POST mikros/{id}/position` (`blockKey`, `timeSpentSeconds`).
   - Etkileşimli adım → cevap. API `POST blocks/{blockId}/answer`. Yanıt `isFinal: true` olana kadar adımda kalınır, "Devam" pasiftir.
5. Son adımdan sonra "Devam" → `POST mikros/{id}/complete` → `m-ders-mikro-bitti` [aynı ekranda içerik değişir].
   - "{Sıradaki} geç" → sıradaki mikro dersin ilk adımı [replace].
   - "Konu haritasına dön" → konu girişi [geri].
6. Son mikro dersin bitiş ekranından sonra → `m-ders-konu-sonu` [replace]. API `GET subs/{lessonSubId}/summary`.
   - "Kolay seviye testi · 20 soru · ~25 dk" → Testler, konunun Kolay testi [modül değişimi].
7. **Hata dalı:**
   - Veri gelmezse yerinde hata kutusu ve "Tekrar dene".
   - Cevap gönderilemezse adımın altında kırmızı tek satır. Seçim geri alınmaz, düğme yeniden açılır.
   - Mobil cevap isteği sunucuya hiç ulaşmadıysa bir kez kendiliğinden yeniden dener (`useWorkMikroPlayer`).
8. **Geri ve yarıda bırakma:**
   - Oynatıcıda ✕ (ve Android geri tuşu, iOS kenardan kaydırma) konudan çıkar. Konular sekmesinden açıldıysa Konular'a, başka yerden açıldıysa bir önceki ekrana döner (`useWorkTopicExit`).
   - Onay sorulmaz, çünkü her cevap ve anlatım konumu zaten sunucuya yazılmıştır.
   - Dönünce aynı adım açılır (§3.3).

### 3.2 Tekrar

1. `m-ders-tekrar` (yuva 4) ya da vitrindeki "Tekrar zamanı" kartı.
   - API `GET reviews?take=50` ve `GET reviews/summary` (`dueCount`, `dueTomorrowCount`).
   - "Tekrara başla" → `m-ders-tekrar-oturum` [push, odak geçişi].
2. Oturumda adımlar sırayla gelir. Her adım tek denemedir. API `POST blocks/{blockId}/answer` ve `isReview: true`.
   - Doğru → bir sonraki aralık (1 → 3 → 7 gün). Üçüncü doğrudan sonra adım listeden çıkar ("Bu adımı öğrendin; listeden çıktı.").
   - Doğru ama "Tahmin ediyorum" işaretli → aşama ilerlemez.
   - Yanlış → aşama başa döner, 1 gün sonra yeniden gelir. Yanılınan parçalar `focus` olur.
3. "Sonraki" sıradaki adıma geçer. Son adımda "Bitir" → `m-ders-tekrar` [geri]. Liste boşalınca Tekrar'a dönülür.
4. Bugün adım yoksa `m-ders-tekrar-bos`. "Kaldığın derse dön" → kaldığın mikro ders (`GET continue`). Kalınan yer yoksa → `m-ders-vitrin`.

### 3.3 Kaldığın yerden devam

- `GET continue` → `{workMikroId, title, lessonSubId, lessonSubName, lessonMainName, completedBlockCount, blockCount, remainingMinutes}`. Yanıt 204 ise kalınan yer yok → vitrinde `m-ders-ilk` hâli.
- "Devam et" → oynatıcı. Oynatıcı `progress.currentBlockKey` ile aynı anahtarlı adımdan açılır. Tamamlanmış mikro ders baştan açılır.
- Önceki cevaplar `blocks[].answer`'dan geri yüklenir. Cevaplanmış adım kapalı (sonuç görünür) gelir.
- Tabletteki Notlarım'dan nota dokununca o adım (`blockKey`) açılır.

### 3.4 Mobil ve web farkı

- Web'de geçişler sayfa değişimidir. Oynatıcı ve tekrar oturumu `(immersive)` düzenindedir.
- Web oynatıcısında klavye kullanılır: 1–5 şık seçer, Enter "Devam" ya da "Kontrol et"e basar (UIUX-Rehberi §8).
- Web'de titreşim yoktur.

## 4. Ekranlar

### 4.0 Ortak parçalar (adım ekranlarının hepsi)

**Oynatıcı çerçevesi, mobil** (`Screen`, `StepBar`, `Lessons.tsx`):
- Tuval 390 × 844. Durum çubuğu 50 pt. Arka plan düz `bg`, yıkama yok. Tab bar yok.
- **Adım çubuğu (`StepBar`):**
  - Satır iç boşluğu 6 / 18 / 10, aralık 14.
  - Solda yuvarlak ✕ (`RoundButton`): 38 pt, `card` zemin, 1 px `line` kenar, ikon `x` 17 pt `ink2`. Erişilebilir adı "Dersi kapat" / "Close lesson".
  - Sağda `Segments`: mikro dersin adım sayısı kadar parça, aralık 5, yükseklik 7, köşe tam. Biten parça modül `color`. Şimdiki parça yarı yarıya: soldan %50 `color`, sağ yarı `line`. Gelecek parçalar `line`.
- **İçerik:** iç boşluk 8 / 20 / 12, dikey aralık 14 (ekrana göre 10–14). Taşan içerik kayar.
- **Alt alan (foot):** iç boşluk 10 / 20 / 30, aralık 10. Ana düğme `lg` (54 pt), tam genişlik, modül `action`.
- **Yeni adım türlerinin alt alanı** (`LessonSteps.tsx` `Foot`, Grupla, Eşleştir, Çevir, Seç, Çoklu, Formül), soldan sağa:
  - ghost yuvarlak geri düğmesi, 54 pt, ikon `left`; adı "Önceki adım" / "Previous step"
  - "Tahmin ediyorum" düğmesi: 54 pt daire, 1,5 px `line` kenar, ortada `?` (20 pt, `ink2`)
  - ana düğme, kalan genişlik
  - Gerekirse üstünde ortalı `meta` not ("2 kart kaldı").
  - Ana düğme gereken seçim tamamlanmadan `disabled` tondadır: `line` zemin, `subtle` yazı.

**Adım üst metni:**
- `Kind` satırı: `over` rolü, 12,5 pt, 800, büyük harf, modül `ink`. Biçim "{mikro ders adı ya da adım türü} · {adım} / {adım sayısı}" (ör. "MECAZ ANLAM · 1 / 5").
- `Title`: `title` rolü, 24 pt (yeni türlerde 22), satır yüksekliği 1,25.

**Şık (`Choice`):**
- Kutu: iç boşluk 13 / 14, köşe 16, kenar 1,5 px. Harf kutusu 28 pt, köşe 9, `headline` 13,5 pt 800.
- Metin `body` 15 pt 600 `ink`.

| Görünüm | Kenar | Zemin | Harf kutusu |
|---|---|---|---|
| boşta | `line` | `card` | `line2` zemin, `muted` harf |
| doğru | `success` | `successSoft` | `#047857`, beyaz harf (iki temada aynı) |
| yanlış | `error` | `errorSoft` | `#DC2626`, beyaz harf (iki temada aynı) |

**Geri bildirim kutusu (`Feedback`):**
- Köşe 16, iç boşluk 14, aralık 4.
- Başlık `headline` 15 pt 800 tonun `Ink` renginde. Gövde `body` 14,5 pt `ink`.

| Ton | Zemin | Başlık rengi | Ne zaman |
|---|---|---|---|
| `ok` | `successSoft` | `successInk` | doğru |
| `no` | `errorSoft` | `errorInk` | yanlış |
| `hint` | `warningSoft` | `warningInk` | ipucu, dikkat, çözüm adımı |

**Diğer ortak parçalar:**
- **Beyaz içerik kartı (`PlainCard`):** `Card tone="flat"`, köşe 18, iç boşluk 16, aralık 10.
- **Dinle (`ListenPill`):** hap. İç boşluk 8 / 16, 1 px `line` kenar, `card` zemin. `headset` ikonu 16 pt modül `color`. Metin "Dinle · 0:12" (`small` 14 pt 700 `ink2`; EN: doğrulanmadı). Anlatım adımlarında içeriğin sonunda durur. Süre içerikten gelir.
- **Kalın yazı:** içerikteki `**…**` 800 ağırlıkla yazılır, satır içi `$…$` LaTeX olarak çizilir (API kuralı).

**Geri bildirim kuralları** (UIUX-Rehberi §5.4.1, API §5.8):
- Seçme (Choice, Önce sen tahmin et), Doğru/Yanlış, Sırala ve Boşluk doldur **tek denemedir**.
  - Cevap verilince adım kapanır (`isFinal: true`).
  - Yanlışta doğru şık ya da sözcük yeşil, öğrencinin seçimi kırmızı gösterilir. Altta "Doğrusu: …" başlıklı kırmızı kutu nedeni söyler.
  - Doğruda yeşil kutu çıkar ("Doğru tahmin", "Doğru, bu ifade yanlış" gibi içerikten gelen başlık).
- **TYT tarzı soru:** her yanlışta bir çözüm adımı açılır ve öğrenci yeniden seçer.
  - Deneme hakkı = çözüm adımı sayısı + 1 (en az 2).
  - Yanlış şık kırmızı kalır ve yeniden seçilemez.
  - Hak bitince ya da doğru bulununca doğru şık ve bütün çözüm adımları açılır.
- **Parçalı türler** (Grupla, Eşleştir, Seç, Çoklu seçim, Çevir) "Kontrol et" ile bir kez gönderilir. Her parçanın sonucu ayrı işaretlenir.
- **Tekrar notu:** ilk denemede yanlış yapılan adım Tekrar listesine girer. Bu, geri bildirim kutusunun altında **nötr** bir `meta` satırıyla söylenir: 13 pt, modül `ink`, ikon yok, kırmızı yok.
  - Metin "Bu adım tekrar listene eklendi; yarın yeniden gelecek." (EN: doğrulanmadı).
  - Ceza dili kullanılmaz.
  - Tahminle doğru bulunan adım için mobil katalog metni: "Tahminle doğru buldun; bu adım tekrar listende olacak." / "You guessed right; this step stays on your review list."
- **"Tahmin ediyorum":** cevaptan önce isteğe bağlı işaret (`confidence: 1`). Cevaptan sonra gizlenir. Çevir adımında yoktur.
  - Açıklama: "Emin değilsen işaretle; tahminle doğru bulsan da bu adım tekrar listene eklenir."

**Hareket ve titreşim** (Hareket-Standardi §3):

| An | Hareket | Titreşim |
|---|---|---|
| Şık seçme | basma, ölçek 0,97, 140 ms | seçim (`selection`) |
| Doğru cevap | tik ve yumuşak yeşil dolgu, 240 ms, `easing.out` | hafif darbe (`impactLight`) |
| Yanlış cevap | çarpı ve kırmızı dolgu, 240 ms, sallanma yok | uyarı (`notificationWarning`) |
| Adım geçişi ("Devam") | eski adım 180 ms'de soluklaşarak çıkar, yeni adım 8 pt sağdan 240 ms'de gelir (`nextQuestion`); kaydırma en üste döner | yok |
| "Önceki adım" | aynı hareket ters yönde, yeni adım soldan gelir (Hareket-Standardi §1 "çıkış geldiği yöne gider" kuralından; çizimde ayrıca tanımlı değil) | yok |
| İlerleme çubuğu | biten parça 600 ms'de bir kez dolar (`progressGain`) | yok |
| Geri bildirim kutusu | 8 pt yükselerek 240 ms (`distance.enter`, `duration.enter`; genel giriş kuralı); ekran kutuya kayar (bugünkü mobil kod 120 ms sonra sona kaydırır) | yok |

- Titreşim değişimle aynı karede, cevap başına bir kez verilir. Hiçbir zaman tek geri bildirim değildir: renk ve metin her zaman vardır.
- "Hareketi azalt" açıkken kayma kalkar, yalnız 150 ms soluklaşma kalır.
- Web'de klavyeyle tetiklenen geçişler canlanmaz (Hareket-Standardi §4).

**Oynatıcı çerçevesi, web** (`StudyPlayer`, `LessonsWeb.tsx`): 1440 × 900 tuval. Sol menü ve web üst çubuğu yoktur. Üç sütun:
- **Sol, mikro dersler (`MicroTimeline`):**
  - 290 px, `card` zemin, sağda 1 px `line`, iç boşluk 22, aralık 10.
  - Üstte `Kind` konu adı ("SÖZCÜKTE ANLAM").
  - Altında konunun bütün mikro dersleri `MapRow` olarak: nokta 28, satır 44, ad 14 pt. Şimdiki satırda sağda "{n} adım".
- **Orta, adım:**
  - Üst şerit 76 px, `card` zemin, alt kenar `line`, yan boşluk 28, aralık 16. İçinde soldan:
    - ✕ (38)
    - başlık: mikro ders adı (`headline` 16, 800) ve altında "{konu} · adım 2 / 5" (`small` 13,5, `ink2`)
    - sağda 300 px `Segments` (yükseklik 8)
  - Adım sütunu 700 px, ortalı. Üst boşluk 28, alt 12, aralık 14.
  - Adım çizimi mobil çizimin kendisidir, ölçeklenir: Tanım ×1,15; Tahmin, Boşluk, Doğru/Yanlış, Sırala ×1,1; Soru ve Mikro ders bitti ×1,05.
  - Alt eylem satırı 700 px, iç boşluk 12 / 0 / 24, iki uca yaslı: solda ghost `lg` "Önceki adım" (`left` ikonu), sağda ana `lg` düğme.
- **Sağ, "Bu mikro derste" (`LessonSide`):**
  - 310 px, `card` zemin, solda 1 px `line`, iç boşluk 22, aralık 12.
  - `Kind` gri "BU MİKRO DERSTE".
  - İki kart (köşe 14, iç boşluk 14): "TANIM" + tanımın kısa hâli; "SIK HATA" + sık hata.
  - `VideoRow` "Videoda izle" "1:38 – 4:18".
  - En altta ghost tam genişlik "SinoAI’ye sor" (`sparkles`).
- **Klavye:** 1–5 şık seçer (A–E). Enter etkin ana düğmeye basar. Odak halkası 2 px. Başka kısayol çizimde ve kurallarda tanımlı değil.

**Oynatıcı çerçevesi, tablet** (`LessonStep`, `Tablet/Learn.tsx`): 1194 × 834, modül yıkamalı.
- **Üst çubuk (`SolveBar`, 64 pt, yan boşluk 22, aralık 14):**
  - ✕
  - meta "{konu} · {adım} / {adım sayısı}" ve altında başlık (`headline` 16)
  - ortada 300 pt `Steps` (5 pt parçalar, biten ve şimdiki adım dolu)
  - sağda iki yuvarlak etiketli düğme: "Taslak kâğıdı" / "Scratchpad" (`notebook`) ve "Soruya yaz" / "Write on question" (`pen`; kalem açıkken dolu)
- **Gövde:** satır, aralık 18, iç boşluk 4 / 22 / 26.
  - İsteğe bağlı solda dikey kalem araç çubuğu (`PenToolbar`).
  - Ortada kart: köşe 26, `card`, `line` kenar, `card` gölge. İç boşluk 24 / 28, aralık 14.
  - Kalem açıksa sağda 290 pt kenar boşluğu: sol kenarı kesikli `line`.
- **Alt satır (`Main`):** iki uca yaslı. Solda ghost "SinoAI’ye sor" (`sparkles`). Sağda modül `lg` düğme, en az 220 pt, sağda ok ikonu (cevap düğmelerinde `check`).

**Mobil adım çiziminin web ve tablette gösterilmesi (`EmbedStep`):**
- Web ve tablet oynatıcısı mobil adım ekranını `EmbedStep` içinde çağırır. Adım ekranı o zaman yalnız içeriğini çizer: durum çubuğu, `StepBar` ve alt alan çizilmez.
- Çerçeve, ilerleme ve düğmeler oynatıcınındır.
- Uygulamada da adım bileşeni tek kaynaktır. Adım içeriği bileşeni çerçeveden ayrı yazılır, üç platform aynı bileşeni kendi çerçevesinde kullanır. Yeni adım türü bir kez yazılır (UIUX-Rehberi §5.7). Eşlik testi Grupla, Eşleştir, Formül ve Bölüm başını üç platformda arar.

### 4.1 `m-ders-vitrin` Dersler · web: `w-ders-vitrin` · tablet: `t-ders-vitrin`

- **Görseller:**
  - `acik/mobil/m-ders-vitrin.png`, `koyu/mobil/m-ders-vitrin.png`, `en/acik/mobil/m-ders-vitrin.png`
  - `acik/web-panel/w-ders-vitrin.png`, `koyu/web-panel/w-ders-vitrin.png`
  - `acik/tablet/t-ders-vitrin.png`
- **Çerçeve:**
  - Mobil: `AppHeader` (solda profil, ortada boş, sağda zil ve kırmızı sayaç). Yüzen tab bar, aktif yuva 1 "Dersler". Arka plan modül yıkaması (`wash` → `bg`, %34'te biter).
- **Yerleşim, mobil** (`Content` aralık 12, yan boşluk 18, alt 108):
  1. `PageTitle`: modül çipi "Dersler" (`book`, `sm`) ve başlık `title` 24 "Dersler" / "Lessons".
  2. `ModuleSlide` (yükseklik 158, köşe 26, modül gradyanı, saydam `book` filigranı):
     - Etiket "Kaldığın yerden" / "Pick up where you left off".
     - Başlık "Mecaz anlam" / "Figurative meaning" (`hero` 24, beyaz). Veri: `continue.title`.
     - Metin "Sözcükte Anlam · 2/5 adım · 3 dakika kaldı" / "Word meaning · step 2/5 · 3 minutes left". Veri: `lessonSubName`, `completedBlockCount / blockCount`, `remainingMinutes`.
     - Beyaz `sm` düğme "Devam et" / "Continue" (yazısı modül `ink` açık değeri).
  3. Tekrar kartı (`Card`, iç boşluk 14, satır aralık 12):
     - `Tile` `refresh` 40.
     - `headline` "Tekrar zamanı" / "Time to review".
     - `small` "5 adım · yaklaşık 4 dk" / "5 steps · about 4 min". Süre = adım × 45 sn, en az 1 dk.
     - Sağda `moduleSoft` `sm` "Başla" / "Start".
  4. `SectionTitle` "TYT", alt yazı "10 ders · 168 konu" / "10 subjects · 168 topics". Sınav bölümü (`categorySubName`) başına bir başlık.
  5. `List`, her ders bir `ListRow`:
     - `Tile` `book` 38.
     - Başlık ders adı.
     - Alt yazı "15 konu · 14 / 125 mikro ders" / "15 topics · 14 / 125 micro-lessons".
     - Sağda 56 pt `Bar` (yükseklik 6, en az %2 dolu, `color` / `track`) ve `right` oku 18 `subtle`.
- **Yerleşim, web** (`Panel`, sol menüde Dersler aktif):
  1. `ModuleHead`:
     - Hap sekmeler Dersler (aktif, `action` zemin, beyaz yazı) · Konular · Tekrar, her biri 36 px.
     - Başlık kartı: başlık "Dersler" / "Lessons", alt yazı "Konuları mikro derslerle, adım adım öğren" / "Learn each topic in micro-lessons, step by step".
     - Sağda ghost "Konu ara" / "Find topic" (`search`).
  2. `Grid` 1,5fr / 1fr:
     - `ModuleBanner`: "Kaldığın yerden" · "Mecaz anlam" · "Türkçe · Sözcükte Anlam · 2 / 5 adım · 3 dakika kaldı" / "Turkish · Word meaning · step 2 / 5 · 3 minutes left" · beyaz "Devam et".
     - `WCard` "Tekrar zamanı":
       - `Tile` 48.
       - "Bugün 5 adım" / "5 steps today" (`section`).
       - "İlk denemede yanlış yaptığın adımlar, yaklaşık 4 dakika." / "Steps you missed, about 4 minutes."
       - Tam genişlik "Tekrara başla" / "Start review".
  3. Satır "TYT" (`section`), sağda "10 ders · 168 konu".
  4. 4 sütun ızgara (aralık 14). Ders kartı (`Card` 16): `Tile` 40, ad ve sağda "15 konu", `Bar` 6, "14 / 125 mikro ders".
  5. Satır "AYT" + ders kartı ("Türk Dili ve Edebiyatı · 16 konu" ve ok). İçeriği olmayan ders gri kart (`line2` zemin, `muted` yazı) ve `Chip` "Yakında" / "Soon"; tıklanmaz.
- **Yerleşim, tablet** (`SideRail` aktif Dersler; içerik en çok 1080, iç boşluk 18 / 32 / 26, aralık 18):
  - Üst satır: modül çipi + başlık 28 "Dersler". Sağda yuvarlak "Notlarım" / "My notes" (`notebook`) ve arama.
  - Yan yana iki kart:
    - Kaldığın yer: gradyan, oran 1,3, köşe 24, iç boşluk 22.
      - "Kaldığın yerden · Sözcükte Anlam" / "Continue · …".
      - Kanca cümlesi 24 pt beyaz.
      - "1 / 13 · sıradaki: Mecaz anlam" / "next: Figurative meaning".
      - Beyaz "Devam et" (`play`) ve cam çip "3 notun var" / "3 notes" (`pen`).
    - Bugünkü tekrar: kart 20.
      - "Bugünkü tekrar" / "Today’s review" ve sayı çipi.
      - "İlk denemede yanlış yaptığın adımlar. Her biri tek denemede." / "Steps you missed on the first try. One try each."
      - Adım türü çipleri (outline).
      - `moduleSoft` "Tekrara başla".
  - "Sınavının dersleri" / "Your exam’s lessons": 3 sütun ders kartı. Kartta ad 16, "{n} konu", `Bar`, "{bitti} / {toplam} mikro ders".
  - Son hücre gri kart: `pen` ikonu, "Kalem hazır" / "Pen ready", "Her adımda altını çizebilir, kenara yazabilirsin." / "Underline and write in the margin on every step." Yalnız kalemli tablette.
- **Veri:**
  - `GET continue` (204 → yok)
  - `GET reviews/summary` (`dueCount`) ve `GET reviews?take=50`
  - `GET lessons`: `[{categorySubId, categorySubName, lessons: [{lessonMainId, name, subCount, completedSubCount, mikroCount, completedMikroCount}]}]`
  - "N ders · M konu" toplamı istemcide hesaplanır.
- **Etkileşimler:**
  - "Devam et" → oynatıcı, `continue.workMikroId` [push].
  - "Başla" ve "Tekrara başla" → `m-ders-tekrar-oturum` [push].
  - Ders satırı → `m-ders-konular`, o ders seçili [push].
  - Web "Konu ara" → panel araması (Ctrl K).
  - Tablet "Notlarım" → `t-ders-notlarim`.
- **Hâller:**
  - Yükleniyor: `LoadingLogo` ortada. İçerik varsa yerinde kalır.
  - Kalınan yer yok → `m-ders-ilk`.
  - Tekrar yok → tekrar kartı gizlenir.
  - Hata → yerinde "Tekrar dene".
  - Abonelik yok → abonelik kapısı (Navigasyon.md).
  - Çekip yenileme yalnız bu listede açıktır.
- **Kurallar:**
  - Ana liste derstir; konu listesi bu ekranda açılmaz.
  - İçeriği olmayan ders "Yakında" ile gri durur, gizlenmez.
  - Yüzde biçimi dile göre (`%11` / `11%`).

### 4.2 `m-ders-ilk` Dersler · ilk giriş

- **Görseller:** `acik/mobil/m-ders-ilk.png`, `koyu/mobil/m-ders-ilk.png`, `en/acik/mobil/m-ders-ilk.png`
- **Çerçeve:** `m-ders-vitrin` ile aynı (aktif yuva 1).
- **Yerleşim:**
  1. `PageTitle` "Dersler".
  2. Gradyan kart (köşe 24, iç boşluk 18, aralık 6):
     - `over` "Buradan başla" / "Start here", beyaz %90.
     - `title` 22 "Temel Kavramlar" / "Basic concepts".
     - `small` beyaz "Matematik’te zorlandığını söyledin. İlk mikro ders 4 dk, 6 adım." / "You said maths is hard for you. First micro-lesson: 4 min, 6 steps."
     - Beyaz düğme (`play`, yazı `action`) "İlk mikro dersi başlat" / "Start the first micro-lesson".
  3. `Card` 14: `headline` "Dersler nasıl işler?" / "How lessons work". Üç satır, ikon 18 modül `color`, `small` `ink2`:
     - `book` "Her konu kısa mikro derslerden oluşur" / "Each topic is a few short micro-lessons"
     - `checkCircle` "Her adımda sen de cevaplarsın" / "You answer at every step"
     - `refresh` "İlk denemede yanlışların 1, 3 ve 7 gün sonra tekrar gelir" / "Misses come back after 1, 3 and 7 days"
  4. `SectionTitle` "TYT" · "10 ders · 168 konu", sağda eylem "Tümü" / "All".
  5. Ders satırları. Alt yazı "15 konu · henüz başlamadın" / "15 topics · not started yet" (sıfır sayı yazılmaz). Bar yok.
- **Veri:**
  - `GET continue` boş (204).
  - Önerilen konu: kayıtta seçilen zorlanılan dersin ilk konusu (onboarding cevabı) ve o konunun ilk mikro dersi (`GET subs/{id}` → `nextWorkMikroId`, `stepCount`, `estimatedMinutes`).
  - Kayıt cevabını veren uç: API'de doğrulanmalı.
- **Etkileşimler:**
  - "İlk mikro dersi başlat" → oynatıcı [push]. Plan olmasa da başlar.
  - "Tümü" → `m-ders-konular`.
  - Satır → konular.
- **Kurallar:**
  - Ön tanıtım yoktur; üç satır bu ekranda bir kez görünür.
  - İlk mikro ders bitince bu hâl bir daha gelmez (artık `continue` doludur).

### 4.3 `m-ders-konular` Konular · web: `w-ders-konular`, `w-ders-dersler` · tablet: `t-ders-konular-iki-panel`

- **Görseller:**
  - `acik/mobil/m-ders-konular.png`, `koyu/mobil/...`, `en/acik/mobil/...`
  - `acik/web-panel/w-ders-konular.png`, `acik/web-panel/w-ders-dersler.png`
  - `acik/tablet/t-ders-konular-iki-panel.png`
- **Çerçeve, mobil:**
  - `AppHeader`: solda geri (kartlı 40 pt daire), ortada başlık ders adı ("Türkçe" / "Turkish", `section`), sağda boşluk (zil yok).
  - Tab bar aktif yuva 2 "Konular". Modül yıkaması.
- **Yerleşim, mobil** (aralık 12):
  1. Ders özeti, `Card tone="module"` (`wash` zemin, `line` kenar, iç boşluk 14):
     - `headline` "TYT Türkçe · 15 konu" / "TYT Turkish · 15 topics".
     - `small` "14 / 125 mikro ders · ilk denemede %75" / "14 / 125 micro-lessons · 75% first try".
     - Sağda `Ring` 48, kalınlık 5, `color` / `track`, ortada `meta` 800 "%11" / "11%".
  2. Konu listesi, `Card` iç boşluk 6. Her satır: iç boşluk 10 / 8, köşe 14, satırlar arası `line2`, süren konunun satırı `wash` zemin.
     - Solda `TopicBadge` 34. Bitti: `action` dolgu ve beyaz tik. Süren: `card` zemin, 2,5 px `color` halka, numara `ink`. Başlamadı: `line2` zemin, numara `muted`.
     - Ortada konu adı (`headline`) ve `meta`. Süren konu "1 / 13 mikro ders · ilk denemede %75". Başlamamış konu "7 mikro ders · 21 dk" / "7 micro-lessons · 21 min".
     - Sağda süren konuda `module` `sm` "Devam et" / "Continue", diğerlerinde `right` oku.
- **Yerleşim, web** (`w-ders-konular`):
  - Üst çubukta konum izi "Dersler ›".
  - `ModuleHead`: sekme Konular aktif, başlık "Türkçe", alt yazı "TYT · 15 konu · 14 / 125 mikro ders".
  - `Grid` 2fr / 1fr:
    - Solda konu kartı. Satırlar iç boşluk 14, rozet 36, ad + `small` meta. 120 px `Bar`. Sağda süren konuda `module` "Devam et", diğerlerinde ghost "Başla" / "Start".
    - Sağda iki `WCard`:
      - "Türkçe ilerlemen" / "Your Turkish progress": `Ring` 92 (kalınlık 9) "%11". "1 konu başladı · 14 mikro ders bitti", "İlk denemede doğru: %75", "Bu hafta 1 sa 20 dk".
      - "Tekrar": "Türkçe’den 4 adım bugün tekrar zamanında." / "4 Turkish steps are due today."
- **Yerleşim, web** (`w-ders-dersler`, `/student/ders-cal/ders`):
  - `ModuleHead` (sekme Dersler aktif), "Dersler", "TYT · 10 ders · 168 konu".
  - 3 sütun `WCard`: `Tile` 42, ad 16, "{n} konu", `Bar` 7, "{bitti} / {toplam} mikro ders".
- **Yerleşim, tablet** (`t-ders-konular-iki-panel`, yan ray aktif Konular):
  - **Sol panel** (340 pt, sağ kenar `line`):
    - "TYT" (`meta`), "Türkçe" (`title` 24), "15 konu · ilk denemede %80".
    - Konu satırları: iç boşluk 11 / 12, köşe 16. Seçili satır `soft` zemin. 28 pt numara halkası. Ad 14,5 ve "{n} mikro ders · {dk} dk · {k} bitti".
  - **Sağ panel** (iç boşluk 22 / 30):
    - Gradyan konu kartı: "Sözcükte Anlam · 13 mikro ders", kanca 24, beyaz "Mecaz anlamla devam et", cam çip "Konu videosu · 21:38". Sağda 200 × 112 video kutusu (`playCircle` 44).
    - "Mikro dersler": 2 sütun kart (köşe 16). 26 pt rozet, ad 14, "{adım} adım · {dk} dk". Şimdiki mikro ders `color` kenarlı.
    - Altta "Konu listesi solda kalır; konu değiştirmek tek dokunuş." / "Topics stay on the left."
- **Veri:**
  - `GET lessons/{lessonMainId}/subs` → `[{lessonSubId, name, orderIndex, isAvailable, mikroCount, completedMikroCount, estimatedMinutes, state (0/1/2), answeredCount, firstTryCorrectCount}]`.
  - İlk denemede oranı = `firstTryCorrectCount / answeredCount`. Cevap yoksa yazılmaz.
  - Tablet sağ paneli `GET subs/{lessonSubId}`.
- **Etkileşimler:**
  - Satır ya da "Devam et" / "Başla" → `m-ders-konu-girisi` [push].
  - `isAvailable: false` konu gri, "Yakında"; dokunulmaz.
  - Tablette satır sağ paneli değiştirir, ekran değişmez.
  - Geri → `m-ders-vitrin`.
- **Hâller:**
  - Yükleniyor `LoadingLogo`.
  - Konu yok → "Bu derste henüz konu yok." (mobil katalog).
  - Hata → "Tekrar dene".
- **Kurallar:** konular müfredat sırasıyla (`orderIndex`) dizilir. Süren konu tek "Devam et" düğmesini taşır.

### 4.4 `m-ders-konu-girisi` Konu girişi · web: `w-ders-konu-girisi`

- **Görseller:** `acik/mobil/m-ders-konu-girisi.png`, `koyu/...`, `en/...`; `acik/web-panel/w-ders-konu-girisi.png`
- **Çerçeve, mobil:**
  - Tab bar yok, yıkama yok.
  - Üst satır (`TitleBar`, iç boşluk 6 / 18 / 10): solda 38 pt geri düğmesi (`left`), yanında `headline` 15 800 "Türkçe · TYT" (ders · sınav).
  - Alt alan: ana `lg` düğme.
- **Yerleşim, mobil:**
  1. `Hero` (köşe 22, iç boşluk 18, gradyan):
     - `over` beyaz %92 "Sözcükte Anlam · 13 mikro ders".
     - Kanca `title` 21 beyaz "Sözcüğün anlamını sözlük değil, cümle belirler."
     - `small` 14 600 beyaz "1 / 13 tamamlandı · sıradaki: Mecaz anlam".
  2. `VideoRow` (iç boşluk 12, köşe 16, `line` kenar):
     - 76 × 48 siyah önizleme (`ink` zemin, `play` 18).
     - "Videoyu izle · 21:38" (`headline` 15 800).
     - "Mecaz anlam bölümü 1:38'de" (`small` 13 `ink2`).
     - **Video yoksa (`videoUrl = null`) satır gizlenir.**
  3. Yol haritası: mikro dersler `MapRow` (nokta 32, satır 42, aralık 12).
     - Bitti: `action` dolgu ve tik. Şimdiki: 2 px `color` halka, ad `ink`. Gelecek: `line2`.
     - Noktalar arası 2 px dikey çizgi; biten satırdan sonra `color`, değilse `line`.
     - Sağda "{n} adım" (`meta` 13 `muted`).
     - İlk 8 satırdan sonra "… +5 mikro ders" satırı (`muted`).
  4. Alt alan: "Mecaz anlam ile devam et" (EN: doğrulanmadı; biçim "{sıradaki mikro ders} ile devam et").
- **Yerleşim, web:**
  - Konum izi "Dersler › Türkçe ›". `Grid` 1fr / 1,05fr, aralık 22.
  - **Sol sütun:**
    - `Hero` (başlık 28).
    - "Bu konuda" kartı (iç boşluk 20): `checkCircle` 18 ve hedefler, ör. "Gerçek, yan, mecaz ve terim anlamı ayırmak", "Bağlam sorularını adım adım çözmek".
    - `VideoRow` (16).
    - Tam genişlik `lg` "Mecaz anlam ile devam et".
  - **Sağ sütun:** kart 22, "Yol haritası · 13 mikro ders · 34 dk", bütün mikro dersler (nokta 30, satır 42).
- **Veri:** `GET subs/{lessonSubId}`:
  - `name`, `hook`, `objectives[]`, `videoUrl`, `videoDurationSeconds`, `estimatedMinutes`
  - `mikroCount`, `completedMikroCount`, `nextWorkMikroId`
  - `mikros[] {workMikroId, title, orderIndex, isAvailable, stepCount, estimatedMinutes, videoStartSeconds, state, completedStepCount}`
  - "Mecaz anlam bölümü 1:38'de" = sıradaki mikro dersin `videoStartSeconds` değeri.
- **Etkileşimler:**
  - Ana düğme → `nextWorkMikroId` oynatıcısı [push, odak geçişi]. `POST start` hak düşürür; 403 PAYWALL → `m-ders-hak`.
  - Video satırı → video, ilgili saniyeden.
  - Bitmiş mikro ders satırına dokunmak o mikro dersi baştan açar (doğrulanmadı: çizimde satırlar düğme gibi işaretli değil).
  - Geri → Konular.
- **Hâller:** yükleniyor `LoadingLogo`; hata "Tekrar dene"; hak → `m-ders-hak`.
- **Kurallar:** tek ana düğme vardır, mikro ders seçtirilmez. Öğrenci sıradakine gider.

### 4.5 `m-ders-bolum` Bölüm başı · web: `w-ders-bolum` · tablet: `t-ders-bolum`

- **Görseller:** `acik/mobil/m-ders-bolum.png`, `acik/web-panel/w-ders-bolum.png`, `acik/tablet/t-ders-bolum.png` (+ koyu, en)
- **Çerçeve:**
  - Mobil: `StepBar` (8 parça, hiçbiri dolu değil, ilk parça yarım).
  - Alt alan iki eşit düğme: ghost "Önceki bölüm" (`left`) ve ana "Başla".
  - Web: nav "Önceki bölüm" / "Başla", şeritte "bölüm 2 / 4", çubukta yarım parça yok (`current={false}`).
  - Tablet: alt satırda yalnız "Başla", kalem kapalı.
- **Yerleşim:**
  1. `Kind` "Bölüm 2 / 4 · Sözcükte Anlam".
  2. `Title` 26 "Anlam aktarmaları".
  3. `body` `ink2`: bölümün ne öğrettiği + "8 adım · yaklaşık 6 dk."
  4. "Bu bölümde" kartı: `over` başlık, üç satır, `check` 16 modül `color` + `body` 15 (ör. "Ad aktarması (mecaz-ı mürsel)").
  5. Bölüm haritası: dört satır (iç boşluk 10 / 12, köşe 16, aralık 8). 28 pt rozet: bitti tik, şimdiki halka, gelecek numara. Şimdiki satır `wash` zemin, `line` kenar. Gelecek satır adı `muted`. Biten satırda sağda `meta` "Tekrar bak".
- **Veri:**
  - API'de "bölüm" adım türü yoktur (WorkBlockKind 0–14).
  - Bölüm = mikro ders gruplaması mı, yoksa ayrı bir kayıt mı: API'de doğrulanmalı.
  - Bölüm hedefleri ve adım sayısı için alan: API'de doğrulanmalı.
- **Etkileşimler:**
  - "Başla" → bölümün ilk adımı.
  - "Önceki bölüm" → önceki bölümün başı.
  - "Tekrar bak" → o bölümün ilk adımı.
- **Kurallar:** öğrenci önceki bölüme her zaman dönebilir (canlı testteki eksik).

### 4.6 `m-ders-hak` Günlük konu hakkı

- **Görseller:** `acik/mobil/m-ders-hak.png`, `koyu/...`, `en/...`
- **Çerçeve:** arkada konu girişi (`TitleBar` "Türkçe · TYT", `Hero`, `VideoRow`). Üstünde karartma `rgba(11,28,48,0.45)` ve alt sayfa.
- **Yerleşim** (`Sheet` yükseklik 372, üst köşeler 28, iç boşluk 10 / 20 / 34, aralık 14; marka bağlamı, modül rengi yok):
  1. Tutamak 40 × 5.
  2. `Tile` `lock` 52, ikon `ink2`.
  3. `title` 22 "Bugünkü konu hakkın doldu".
  4. `body` "Bugün Sözcükte Anlam'ı çalıştın. Yarın yeni bir konuya başlayabilirsin; aboneliğinle her gün istediğin kadar konu çalışırsın."
  5. Boşluk.
  6. Ana `lg` tam genişlik "Paketleri gör" (marka `action` `#C2410C`).
  7. Ghost `lg` "Yarın devam ederim".
  - EN: doğrulanmadı. Mobil katalogda yalnız "Paketleri gör" var: `work.session.viewPackages`.
- **Veri:**
  - `POST mikros/{id}/start` → `403 {code: "PAYWALL", error}`. `error` metni nedene göre değişir (abonelik yok ya da günlük hak bitti).
  - Kalan hak `StudentAuth.remainingDailyWorksLessonSubCredits`.
  - Konu adı istemcide bilinir.
- **Etkileşimler:**
  - "Paketleri gör" → Profil › Paketler (`ProfileAvailablePackages`, `sourceModule: 'works'`) [push].
  - "Yarın devam ederim", karartmaya dokunma ya da aşağı çekme → alt sayfa kapanır, konu girişinde kalınır.
- **Kurallar:**
  - Yenilenme zamanı yazılır (yarın).
  - Mikro dersler ve testler SinoAI hakkını kullanmaz.
  - Bugün başlatılmış konunun diğer mikro dersleri hak harcamaz, bu alt sayfa onlarda çıkmaz.

### 4.7 Anlatım adımları

#### `m-ders-tanim` Adım · Tanım (Concept) · web: `w-ders-tanim` · tablet: `t-ders-tanim-not`

- **Görseller:** `acik/mobil/m-ders-tanim.png`, `acik/web-panel/w-ders-tanim.png`, `acik/tablet/t-ders-tanim-not.png` (+ koyu, en)
- **Çerçeve:** `StepBar` 5 parça, şimdiki 1. Alt alan "Devam" / "Continue".
- **Yerleşim:**
  1. `Kind` "Mecaz anlam · 1 / 5".
  2. `Title` 24 "Mecaz anlam nedir?"
  3. Tanım `body` 16 / 24. Kalın kısımlar (`**benzetme ya da ilgi**`) 800 `ink`.
  4. `PlainCard` (aralık 12):
     - Örnek cümle sözcük kartlarında (`Words`): her sözcük bir kutu, iç boşluk 7,5 / 10,8, köşe 12, 1,5 px `line`, `headline` 18 700. Hedef sözcük `color` kenarlı ve `soft` zeminli ("kırdı.").
     - Rol hapı (`RolePill`): `action` zemin, beyaz `meta` 13 800, "mecaz anlam".
     - Not `body` 15 `ink2` ("Ortada kırılan bir nesne yok…").
  5. `ListenPill` "Dinle · 0:12".
- **Öğrenci ne yapar:** okur, isterse dinler, "Devam"a basar. Cevap yoktur.
- **Veri:** `block.kind = 0`, `payload {title, text, example, caption, narration}`. Sözcük kartı ve rol için alan adları: API'de doğrulanmalı.
- **Tablet (`t-ders-tanim-not`):**
  - Solda dikey kalem araç çubuğu (fosforlu kalem, sarı, kalın).
  - Başlık 30. Tanım 20 / 33, en çok 640 pt. Fosforlu vurgu sarı ve nane.
  - Sözcük kartları 22.
  - Sağda 290 pt "Kenar notu" alanı, el yazısı notlar.
  - Altta `InkNote` "Notların bu adıma kayıtlı".
  - Alt satır "SinoAI’ye sor" + "Devam".
  - Not anahtarı: mikro ders + adım (`student/notes`, hedef Dersler, katman kenar notu).

#### `m-ders-ornek` Adım · Örnek (Example)

- **Görseller:** `acik/mobil/m-ders-ornek.png` (+ koyu, en)
- **Çerçeve:** `StepBar` 2 parça, şimdiki 2. "Devam".
- **Yerleşim:**
  1. `Kind` "Terim anlam · 2 / 2".
  2. `Title` "Örnek".
  3. `PlainCard`: örnek cümle `title` 19 / 27, hedef sözcük kalın. Altında `RolePill` "terim anlam".
  4. Açıklama `body` 15,5 / 23 `ink2`, kalınlar `ink`.
  5. `Feedback tone="hint"` başlık "Dikkat": içerikteki uyarı.
  6. `ListenPill` "0:15".
- **Öğrenci:** okur, "Devam".
- **Veri:** `kind = 1`, `payload {example, explanation}`.

#### `m-ders-kural` Adım · Kural (Rule)

- **Görseller:** `acik/mobil/m-ders-kural.png` (+ koyu, en)
- **Yerleşim:**
  1. `Kind` "Eş sesli sözcükler · 1 / 2".
  2. `Title` "Kural".
  3. `PlainCard` (aralık 14): numaralı satırlar. 26 pt yuvarlak numara (`soft` zemin, `meta` 12,5 800 `ink`), metin `body` 15,5 / 22 `ink2`, kalınlar `ink`.
  4. `ListenPill` "0:21".
- **Öğrenci:** okur, "Devam".
- **Veri:** `kind = 2`, `payload.items[]`.

#### `m-ders-gorsel` Adım · Görsel (Visual)

- **Görseller:** `acik/mobil/m-ders-gorsel.png` (+ koyu, en)
- **Yerleşim:**
  1. `Kind` "Temel ve yan anlam · 1 / 2".
  2. `Title` "Bağ kopmuyor".
  3. Merkezi figür. Örnekte iki sütunlu karşılaştırma tablosu:
     - `Card flat` köşe 18, taşma gizli.
     - Başlık hücreleri `soft` zemin, iç boşluk 10 / 14: `headline` 14,5 800 `ink` "Temel anlam" / "Yan anlam" ve `meta` 12 `ink2` alt yazı.
     - Satırlar iç boşluk 12 / 14, üst kenar `line2`, sütun arası `line`. `headline` 15,5.
  4. Kısa açıklama `body` 15,5.
  5. `ListenPill` "0:18".
- **Öğrenci:** okur, "Devam".
- **Veri:** `kind = 3`, `block.figure` (ortak figür sözleşmesi; sunucu SVG ya da veri) ve `payload.caption`. Figür türleri `ContentFigureView`.

#### `m-ders-formul` Adım · Formül ve tablo · web: `w-ders-formul` · tablet: `t-ders-formul`

- **Görseller:** `acik/mobil/m-ders-formul.png`, `acik/web-panel/w-ders-formul.png`, `acik/tablet/t-ders-formul.png`
- **Çerçeve:** `StepBar` 5 parça, şimdiki 2. Yeni tür alt alanı: geri, "?", "Devam".
- **Yerleşim:**
  1. `Kind` "Temel Kavramlar · 2 / 5".
  2. `Title` 22 "Sayı kümeleri".
  3. `PlainCard`: satır `headline` 20 / 34. İçinde:
     - kesir üst üste: pay ve payda 17 pt, 1,6 px çizgi; eksi kesrin önünde
     - kök işareti, üst çizgisi içini örter
     - üs harfe yakın (0,7 em, 0,55 em yukarı)
     - İkinci satır `body` 16.
  4. Tablo: köşe 18, `line` kenar, `card`.
     - Başlık satırı `wash` zemin, 13 pt 800 `ink` ("Küme · Örnek · Değil").
     - Hücre iç boşluk 9 / 10, alt kenar `line2`, **yazı en az 15 pt**, ilk sütun 800.
  5. `meta` "Tablo yana kayar; hücre yazısı en az 15 pt."
- **Öğrenci:** okur, "Devam".
- **Veri:** formül metindeki `$…$` LaTeX'tir (KaTeX). Tablo figür olarak gelir.
- **Kurallar:** dar ekranda tablo yatay kayar, yazı küçülmez.

### 4.8 Etkileşimli adımlar

#### `m-ders-tahmin` Adım · Önce sen tahmin et (Choice) · web: `w-ders-tahmin`

- **Görseller:** `acik/mobil/m-ders-tahmin.png`, `acik/web-panel/w-ders-tahmin.png` (+ koyu, en)
- **Çerçeve:** `StepBar` 5 parça, şimdiki 2. Alt alan "Devam" (cevaptan sonra etkin). İçerik aralığı 12.
- **Yerleşim** (çizim doğru hâli gösterir):
  1. `Kind` "Önce sen tahmin et · 2 / 5".
  2. `Title`: soru, hedef sözcük modül `ink` ("Hangi cümlede **soğuk** sözcüğü mecaz anlamda?").
  3. Şıklar `Choice` A, B… (2 ya da daha çok). Örnekte B doğru: yeşil.
  4. `Feedback ok` "Doğru tahmin" + neden.
  5. Cevaptan sonra açılan figür: iki sütunlu karşılaştırma. Kart iç boşluk 12, köşe 14. Gri `Kind` 11,5 ("GERÇEK" / "MECAZ"), cümle `small` 14, not 13,5 `muted`.
- **Öğrenci ne yapar:** bir şıkka dokunur. Dokunuş cevaptır, "Kontrol et" yoktur.
- **Geri bildirim:** tek deneme.
  - Doğru: şık yeşil, yeşil kutu, hafif titreşim.
  - Yanlış: seçilen şık kırmızı, doğru şık yeşil. Kırmızı kutu "Bu sefer olmadı." / "Not this time." başlığıyla.
  - Yanlış şıkkın kendi açıklaması "Bu cevabı verdiysen:" / "If you answered this:" altında gelir, sonra `explanation`. Altında nötr tekrar notu, uyarı titreşimi.
  - Cevaptan sonra "Devam" açılır.
- **Veri:** `kind = 4`, `payload {prompt, choices[]}`. İstek `{choiceIndex, confidence, timeSpentSeconds}`. Yanıt `{isCorrect, isFinal: true, correctIndex, explanation, feedback, figure, review}`.
- **Web:** aynı içerik ×1,1. Şık 1–5 tuşuyla seçilir.

#### `m-ders-dogru-yanlis` Adım · Doğru mu, yanlış mı? (TrueFalse) · web: `w-ders-dogru-yanlis`

- **Görseller:** `acik/mobil/m-ders-dogru-yanlis.png`, `acik/web-panel/w-ders-dogru-yanlis.png`
- **Çerçeve:** `StepBar` şimdiki 4 / 5, "Devam".
- **Yerleşim:**
  1. `Kind` "Sık yapılan hata · 4 / 5".
  2. `Title` "Bu ifade doğru mu?" / "Is this statement true?"
  3. `PlainCard`: yargı `title` 19 / 26, tırnak içinde.
  4. İki sütun (aralık 10): `Choice` "Doğru" / "True" ve "Yanlış" / "False", harfsiz, ortalı.
  5. Sonuç: doğru seçenek yeşil. `Feedback ok` başlık "Doğru, bu ifade yanlış" + neden.
- **Öğrenci:** iki düğmeden birine dokunur; dokunuş cevaptır.
- **Geri bildirim:** tek deneme.
  - Yanlışta seçilen kırmızı, doğrusu yeşil.
  - Kutuda "Bu ifade doğru." / "Bu ifade yanlış." ("This statement is true / false.") ve neden.
  - Altında nötr tekrar notu.
- **Veri:** `kind = 5`, `payload.statement`. İstek `{value: bool}`. Yanıt `correctValue`.
- **Web:** 1 = Doğru, 2 = Yanlış; Enter "Devam".

#### `m-ders-sirala` Adım · Sırala (Order) · web: `w-ders-sirala`

- **Görseller:** `acik/mobil/m-ders-sirala.png`, `acik/web-panel/w-ders-sirala.png`
- **Çerçeve:** `StepBar` şimdiki 2 / 5. Mobil alt alan ghost tam genişlik "Baştan diz" / "Start over" (`refresh`). Web nav: solda "Baştan diz", sağda "Kontrol et".
- **Yerleşim:**
  1. `Kind` "Sözcüğün bağlamdaki anlamı · 2 / 5".
  2. `Title` "Bağlam sorusunu çözerken hangi sırayla ilerlersin?"
  3. `body` 15 `ink2` "Adımlara sırayla dokun; yanlış dokunursan geri al." (mobil katalog: "Adımlara sırayla dokun." / EN doğrulanmadı).
  4. Satırlar (aralık 8; iç boşluk 12 / 14, köşe 14, `card` zemin):
     - Solda 30 pt daire: sıra verilmemişse 1,5 px kesikli `subtle` halka. Verilmişse `action` dolgu ve beyaz sıra numarası.
     - Sıra verilen satırın kenarı 1,5 px modül `line`, diğerlerininki 1,5 px gri `line` (`colors.line`).
     - Satırda ad `headline` 15 700 ve açıklama `small` 13 `muted`.
- **Öğrenci ne yapar:**
  - Satırlara doğru sırayla dokunur; her dokunuş sıradaki numarayı verir.
  - Numaralı satıra yeniden dokunmak o numarayı ve sonrakileri geri alır. "Baştan diz" hepsini siler.
  - Sürükleme gerekmez. Mobilde basılı tutup sürüklemek ek yoldur.
  - Bütün satırlar numaralanınca "Kontrol et" açılır.
- **Geri bildirim:** tek deneme.
  - Sonuçta satırlar doğru sırayla dizilir. Doğru yerde olan yeşil kenarlı, yanlış yerde olan uyarı kenarlı.
  - Üstte "Doğru sıra" / "Correct order" yazar. Kutu ve nötr tekrar notu.
  - Sonra "Devam".
- **Veri:** `kind = 6`, `payload.items[] {id, label, detail}`. İstek `{order: id[]}`. Yanıt `correctOrder`.
- **Kurallar:**
  - Erişilebilirlik için dokunarak çalışır (UX kuralı 103).
  - Satır dokunma alanı en az 44 pt.

#### `m-ders-bosluk` Adım · Boşluk doldur (FillBlank) · web: `w-ders-bosluk` · tablet: `t-ders-bosluk-el-yazisi`

- **Görseller:** `acik/mobil/m-ders-bosluk.png`, `acik/web-panel/w-ders-bosluk.png`, `acik/tablet/t-ders-bosluk-el-yazisi.png`
- **Çerçeve:** `StepBar` şimdiki 3 / 5. "Devam" cevaptan sonra.
- **Yerleşim** (çizim yanlış hâli gösterir):
  1. `Kind` "Boşluk doldur · 3 / 5".
  2. `Title` "Cümleyi mecaz anlamla tamamla".
  3. `PlainCard`: cümle `headline` 18 / 32 800. Boşluk en az 64 pt genişlikte, 2,5 px alt çizgili.
     - Cevaptan sonra boşlukta doğru sözcük yazılı: çizgi `success`, yazı `successInk`.
  4. Seçenek hapları (aralık 10, iç boşluk 10 / 20, köşe tam, 1,5 px kenar; `headline` 16 800):
     - boşta `line` / `card`
     - doğru `success` / `successSoft` / `successInk`
     - öğrencinin yanlış seçimi `error` / `errorSoft` / `errorInk`
  5. `Feedback no` başlık "Doğrusu: ağır" + neden.
  6. Nötr tekrar notu: `meta` 13 modül `ink` "Bu adım tekrar listene eklendi; yarın yeniden gelecek."
- **Öğrenci:** bir hapa dokunur; dokunuş cevaptır.
- **Geri bildirim:**
  - Tek deneme. Yanlışta doğru sözcük ve nedeni gösterilir, adım kapanır. Mobil katalogda "Doğru cevap: {cevap}" / "Correct answer: {answer}".
  - Doğruda boşluk yeşil, yeşil kutu.
- **Veri:** `kind = 8`, `payload {before, after, options?, input?}`. İstek `{text}`. Büyük-küçük harf ve baş/son boşluk önemsizdir. Yanıt `correctText`.
- **Tablet el yazısı (`t-ders-bosluk-el-yazisi`):**
  - Başlık 26 / 36, boşluk "______".
  - Açıklama "Kalemle kutuya yaz. Tek deneme; yanlışsa doğrusu ve nedeni gösterilir." (EN: "Write in the box with your pen. One try; if it is wrong you see the answer and why.")
  - Yazma kutusu: 180 pt yükseklik, en çok 760 genişlik, köşe 22, 2 px kesikli `line` kenar, `wash` zemin, alttan 46 pt'de yazı çizgisi. Sağ üstte geri al ve silgi (36 pt).
  - Altında okunan sözcük satırı: `color` kenar. "Okunan:" / "Read:" + sözcük `headline` 18, sağda "Doğru okundu" `ink`.
  - Yanında ghost "Klavyeyle yaz" / "Type with keyboard" (EN: doğrulanmadı) her zaman vardır.
  - Alt satır "Kontrol et" (`check`).
  - Okunamazsa: "Okunamadı; yeniden yaz ya da klavyeyle yaz."

#### `m-ders-yazmali` Adım · Yazmalı boşluk (FillBlank, metin girişi)

- **Görseller:** `acik/mobil/m-ders-yazmali.png`
- **Çerçeve:** `StepBar` 6 parça, şimdiki 5. Klavye açık. "Kontrol et" klavyenin hemen üstünde (iç boşluk 0 / 20 / 10), altında sistem klavyesi.
- **Yerleşim:**
  1. `Kind` "Boşluk doldur · 5 / 6".
  2. `Title` 22 "Boşluğa terimi yaz".
  3. `PlainCard`: cümle `headline` 18 / 34.
     - Satırdaki boşluk **giriş alanının kendisidir**: en az 110 pt, yükseklik 34, köşe 10, 2 px `color` kenar, `wash` zemin, yazı `ink`, yanıp sönen 2 px imleç.
  4. `small` `ink2` "Boşluğa dokunup yaz; büyük-küçük harf önemli değil."
- **Öğrenci:** boşluğa dokunur, yazar, "Kontrol et"e basar (ya da klavyede Gönder / web'de Enter).
- **Klavye türü:** sayı girişinde (`input: "number"`) ondalık klavye ve ipucu "Sayıyı yaz; 0,5 gibi" / EN doğrulanmadı. Virgül ve nokta ondalık ayıracıdır, `3/4` kesir okunur.
- **Geri bildirim:** tek deneme; Boşluk doldur ile aynı.
- **Kurallar:** "Kontrol et" boş girişte pasiftir. Klavye açıkken kaydırmadan görünür.

#### `m-ders-soru` Adım · TYT tarzı soru (Question) · web: `w-ders-soru` · tablet: `t-ders-soru-eleme`, `t-ders-sinoai-panel`

- **Görseller:** `acik/mobil/m-ders-soru.png`, `acik/web-panel/w-ders-soru.png`, `acik/tablet/t-ders-soru-eleme.png`, `acik/tablet/t-ders-sinoai-panel.png`
- **Çerçeve:**
  - Mobil: `StepBar` şimdiki 5 / 5. Alt alan ghost tam genişlik "SinoAI’ye sor" (`sparkles`). İçerik aralığı 10.
  - Web nav: solda "Önceki adım", sağda `small` `ink2` "Başka bir şık seç ya da 1–5 tuşlarını kullan".
- **Yerleşim** (çizim ilk yanlıştan sonraki hâli gösterir):
  1. `Kind` "TYT tarzı · 5 / 5".
  2. Soru kökü `headline` 16 / 22 700 `ink`, kalınlar 800.
  3. Beş şık A–E `Choice` 14 pt, aralık 8. Mobilde tek sütun, web'de iki sütun. Yanlış seçilen C kırmızı.
  4. `Feedback hint` başlık "Çözüm adımı 1 / 3" + ilk çözüm adımı. Mobil katalog başlığı "İpucu {n}" / "Hint {n}".
  5. `meta` 13 `ink2` "Başka bir şık seç · 3 deneme hakkın kaldı" (EN: doğrulanmadı).
- **Öğrenci ne yapar:** bir şıkka dokunur.
  - Yanlışsa şık kırmızı kalır ve yeniden seçilemez. Bir sonraki çözüm adımı sarı kutuda açılır. Öğrenci kalan şıklardan yeniden seçer.
  - Yanlış şıkkın kendi açıklaması ("Bu cevabı verdiysen:") ipucuyla birlikte gelir.
- **Geri bildirim:**
  - Deneme hakkı = çözüm adımı + 1.
  - Doğru bulunca: şık yeşil, yeşil kutu "Doğru!" / "Correct!", altında "Çözüm adımları" / "Solution steps" kartı (o ana kadar açılanlar).
  - Hak biterse: doğru şık yeşil, kırmızı kutu, bütün çözüm adımları.
  - **İlk denemede yanlış** yapılmışsa adım Tekrar'a girer, nötr not gösterilir.
  - Her yanlışta uyarı titreşimi, doğruda hafif darbe.
- **Veri:** `kind = 7`, `payload {stem, options[], style?, context?, guide?}`. Her yanıtta `attemptCount`, `isFinal`, `revealedSteps[]`, `feedback`. Kapanınca `correctIndex`, `explanation`.
- **SinoAI'ye sor:** yanlıştan sonra görünür. SinoAI'yi konu ve adımın kısa metniyle taslak soruyla açar. SinoAI hakkını kullanır, mikro ders kullanmaz.
- **Tablet (`t-ders-soru-eleme`):**
  - Kalem araç çubuğu (kırmızı kalem). Soru kökü 21 / 31, hedef sözcük fosforlu.
  - Şıkların üstü kalemle çizilerek elenir. Seçilen şık daire içine alınır.
  - Sarı "Eleme ipucu" kutusu. Alt satırda "Cevapla" (`check`).
  - **Cevap yine dokunarak verilir;** kalem işareti cevap sayılmaz.
  - Soru adımında "Taslak kâğıdı" açılabilir.
- **Tablet SinoAI paneli (`t-ders-sinoai-panel`):**
  - Üst çubukta kalem düğmeleri yok, sağda "SinoAI" yuvarlak düğmesi açık. Çubuk 260 pt, %90 dolu.
  - Solda adım (yanlış C kırmızı, sağ altta modül "Yeniden seç").
  - Sağda 400 pt panel:
    - başlık "SinoAI" ve "Bu adımı biliyor", ✕
    - sohbet balonları; öğrencininki `ink` zemin, sağda
    - öneri çipleri ("Bir örnek daha ver", "Gerçek ile yan anlam farkı")
    - yazma kutusu "SinoAI’ye sor"
    - altında "SinoAI hata yapabilir; önemli bilgileri doğrula."
  - Panel adımı kapatmadan açılır, ✕ ile kapanır.

#### `m-ders-sekilli-soru` Adım · Şekilli soru

- **Görseller:** `acik/mobil/m-ders-sekilli-soru.png`
- **Çerçeve:** `StepBar` 4 parça, şimdiki 3. Alt alan yok (cevap şıkla verilir).
- **Yerleşim:**
  1. `Kind` "Açılar ve üçgenler · 3 / 4".
  2. Kök `headline` 16 / 22.
  3. `PlainCard` 12 içinde şekil (250 pt). Örnekte üçgen: `wash` dolgu, 2,2 px `ink` çizgi, köşe harfleri 15 800, açı yazıları 14 700 modül `ink`.
  4. Şıklar iki sütun (aralık 8).
- **Kurallar:**
  - **Şekil kökle birlikte, şıklardan önce gelir.**
  - Şekil ölçüleri sayılarla uyumlu çizilir.
  - Şeklin `alt` metni okunur.
- **Geri bildirim:** TYT tarzı soru ile aynı.
- **Veri:** `kind = 7`, `block.figure`.

#### `m-ders-grupla` Adım · Grupla (Group) · web: `w-ders-grupla` · tablet: `t-ders-grupla`

- **Görseller:** `acik/mobil/m-ders-grupla.png`, `acik/web-panel/w-ders-grupla.png`, `acik/tablet/t-ders-grupla.png`
- **Çerçeve:** `StepBar` 6 parça, şimdiki 3. Alt alan: üstte `meta` "2 kart kaldı", altında geri, "?", "Kontrol et" (pasif). İçerik aralığı 11.
- **Yerleşim:**
  1. `Kind` "Grupla · 3 / 6".
  2. `Title` 22 "Koyu sözcük gerçek mi, mecaz mı?"
  3. `small` `ink2` "Karta dokun, sonra grubuna dokun. Yanlış yere koyduğunu geri alabilirsin." (mobil katalog: "Bir öğeye dokun, sonra konacağı kutunun başlığına dokun.")
  4. Gruplar alt alta. Her grup: köşe 18, 1,5 px kesikli `line` kenar, `wash` zemin, iç boşluk 10, aralık 8.
     - Başlık satırı: `over` modül `ink` grup adı, sağda `meta` kart sayısı.
     - İçinde kartlar: iç boşluk 11 / 14, köşe 16, `card`, `line` kenar, gölge. Cümle `body` 14,5 600 / 1,4 satır.
     - Hedef sözcük koyu. **Metin kesilmez**, satır sarar.
  5. `meta` "Yerleşmeyenler" (mobil katalog: "Yerleştirilecekler" / EN doğrulanmadı).
  6. Yerleşmeyen kartlar. Seçili kart `wash` zemin, 1,5 px `color` kenar.
- **Öğrenci:** karta dokunur (seçilir), sonra grup başlığına dokunur. Kart gruba geçer. Gruptaki karta dokunmak onu geri alır. Mobilde sürükleme ek yoldur. Bütün kartlar yerleşince "Kontrol et" açılır.
- **Geri bildirim:**
  - Tek gönderim. Her kart yerinde yeşil (`ok`) ya da kırmızı (`no`) işaretlenir. Yanlış kartta "Doğrusu: {grup}".
  - Adım ancak hepsi doğruysa doğrudur. Kutu ve nötr tekrar notu.
- **Veri:** `kind = 10`, `payload {groups[], items[]}`. İstek `{groups: {itemId: groupId}}`. Yanıt `items[] {id, correct, expected, given}`, `correctGroups`.
- **Web ve tablet:** mobil çizim `EmbedStep` içinde. Nav "Önceki adım" / "Kontrol et", şerit "adım 3 / 6".

#### `m-ders-eslestir` Adım · Eşleştir (Match) · web: `w-ders-eslestir` · tablet: `t-ders-eslestir`

- **Görseller:** `acik/mobil/m-ders-eslestir.png`, `acik/web-panel/w-ders-eslestir.png`, `acik/tablet/t-ders-eslestir.png`
- **Çerçeve:** `StepBar` şimdiki 4 / 6. Alt alan `meta` "1 eşleşme kaldı" + geri, "?", "Kontrol et" (pasif). "Kontrol et" sabit altta, kaydırmadan görünür.
- **Yerleşim:**
  1. `Kind` "Eşleştir · 4 / 6".
  2. `Title` 22 "Anlam türünü örneğiyle eşleştir".
  3. `small` "Soldan birine, sonra sağdan eşine dokun. Eşleşen ikili aynı renk ve numarayı alır."
  4. İki sütun ızgara (0,8fr / 1,2fr, aralık 10). Öğeler: en az 50 pt yükseklik, iç boşluk 12, köşe 16, `body` 14,5 600 / 19.
     - Eşlenen ikili aynı numarayı alır: 22 pt dairede beyaz numara. Daire rengi sırayla modül `color`, `action`, `ink`; koyu temada 2. ve 3. renkte numara `#0B1C30`.
     - Eşlenmiş öğenin kenarı aynı renk, zemini o rengin %8'i (`14` hex).
     - Seçili ama eşlenmemiş öğe `ink` kenarlı.
     - **Başka modülün rengi kullanılmaz;** ikilileri numara ayırır.
- **Öğrenci:** soldan bir öğeye, sonra sağdan eşine dokunur (ya da tersi). Eşli sol öğeye yeniden dokunmak eşi kaldırır. Bir sağ öğe birden çok sola verilebilir. Her sol öğe eşlenince "Kontrol et" açılır.
- **Geri bildirim:** parça parça. Yanlış eşte "Doğrusu:" / EN doğrulanmadı ve doğru eş. Kutu ve nötr tekrar notu.
- **Veri:** `kind = 9`, `payload {left[], right[]}`. İstek `{pairs: {leftId: rightId}}`. Yanıt `items`, `correctPairs`.

#### `m-ders-cevir` Adım · Çevir (Flip)

- **Görseller:** `acik/mobil/m-ders-cevir.png`
- **Çerçeve:** `StepBar` şimdiki 4 / 6. Alt alan `meta` "1 kart tekrar listene eklendi" + geri, "?", "Devam".
- **Yerleşim:**
  1. `Kind` "Çevir · 4 / 6".
  2. `Title` 22 "Önce hatırla, sonra çevir".
  3. İki sütun kart yüzü: 104 pt, köşe 18, `section` 18 ortalı. Bilinen kart `success` kenarlı ve sağ üstte `checkCircle`. Bilinmeyen kart `warning` kenarlı ve `refresh`.
  4. Açık kartın arka yüzü:
     - köşe 20, 1,5 px `color` kenar, `wash` zemin, iç boşluk 16
     - `over` "Terim anlam · arka yüz"
     - açıklama `body` ve ek açıklama `small`
     - kartın içinde iki eşit düğme: ghost `sm` "Bilmiyordum" / "I didn't know" ve `module` `sm` "Biliyordum" / "I knew it"
  5. Altında sıradaki kapalı kart ("Yan anlam").
- **Öğrenci:** kartı hatırlar, çevirir ("Kartı çevir"), bilip bilmediğini işaretler. Bütün kartlar işaretlenince "Devam" / "Bitir".
- **Geri bildirim:**
  - Öz değerlendirmedir; doğru/yanlış titreşimi yoktur.
  - "Bilmiyordum" denen kart Tekrar'a girer: "{n} kart tekrar listene eklendi." / "Hepsini biliyordun."
  - "Tahmin ediyorum" yoktur (çizimdeki "?" düğmesi bu adımda gösterilmez; kodla uyumlu kural).
- **Veri:** `kind = 14`, `payload.cards[]`. İstek `{known: {cardId: bool}}`. Tekrarda yalnız `focus` kartları gelir.

#### `m-ders-sec` Adım · Seç, sözcüğe dokun (Select)

- **Görseller:** `acik/mobil/m-ders-sec.png`
- **Çerçeve:** `StepBar` şimdiki 3 / 6. Alt alan geri, "?", "Kontrol et".
- **Yerleşim:**
  1. `Kind` "Yansıma sözcükler · 3 / 6".
  2. `Title` 22 "Yansımayı bul".
  3. `small` "Cümledeki yansıma sözcüklere dokun. Birden çok seçebilirsin."
  4. `PlainCard`: sözcükler dokunulabilir kutular (iç boşluk 9 / 13, köşe 12, `headline` 17). Boşta `line2` zemin. Seçili: `soft` zemin, 1,5 px `color` kenar, yazı `ink`.
  5. `info` 16 + `small` "2 sözcük seçtin" (sayı canlı).
- **Öğrenci:** sözcüklere dokunur (aç/kapa), "Kontrol et".
- **Geri bildirim:** parça parça. Kaçırılan "Bu da seçilmeliydi". Kutu ve nötr not.
- **Veri:** `kind = 11`, `payload.segments[]`. İstek `{selected: id[]}`.

#### `m-ders-coklu` Adım · Çoklu seçim (MultiChoice)

- **Görseller:** `acik/mobil/m-ders-coklu.png`
- **Çerçeve:** `StepBar` şimdiki 5 / 6. Alt alan geri, "?", "Devam" (sonuç gösteriliyor).
- **Yerleşim** (sonuç hâli):
  1. `Kind` "Çoklu seçim · 5 / 6".
  2. `Title` 22 "Hangileri somut anlamlıdır?"
  3. `small` "Birden çok doğru var." (mobil katalog: "Doğru olanların hepsini işaretle.")
  4. Seçenek satırları (iç boşluk 11 / 14, köşe 16, aralık 8). 24 pt onay kutusu: işaretli `action` ve beyaz tik, boş 2 px `line`. Ad `headline` 16.
     - doğru seçilmiş: `successSoft` / `success`
     - **yanlış seçilmiş:** `errorSoft` / `error`, sağda `meta` `errorInk` neden ("soyut")
     - **kaçırılmış:** saydam zemin, kesikli `line` kenar, sağda `meta` `successInk` "bunu da seçmeliydin" (mobil katalog: "Bu da doğruydu")
  5. `Feedback no` "4 / 5 doğru" + neden.
- **Öğrenci:** işaretler, "Kontrol et", sonra "Devam".
- **Veri:** `kind = 13`. İstek `{choiceIndexes}`. Yanıt `correctIndexes`, `items`.

### 4.9 `m-ders-mikro-bitti` Mikro ders bitti · web: `w-ders-mikro-bitti`

- **Görseller:** `acik/mobil/m-ders-mikro-bitti.png`, `acik/web-panel/w-ders-mikro-bitti.png` (+ koyu, en)
- **Çerçeve:**
  - Mobil: adım çubuğu yok. İçerik dikeyde ortalı, aralık 12.
  - Alt alan: ana "Terim anlama geç" ("{sıradaki} geç"; EN: doğrulanmadı) ve ghost "Konu haritasına dön".
  - Web: zaman çizelgesinde biten mikro ders tikli, şeritte "tamamlandı", çubuk tam dolu. Nav: solda ghost "Konu haritası" (`tree`), sağda "Terim anlama geç".
- **Yerleşim:**
  1. `Kind` ortalı "Mecaz anlam tamamlandı".
  2. `num` 50 ortalı "3 / 4": ilk denemede doğru / etkileşimli adım.
  3. `ScoreDots`: etkileşimli adım başına 40 pt daire, aralık 8. Doğru `success` ve beyaz tik, ilk denemede yanlış `error` ve beyaz çarpı.
  4. `body` 14,5 ortalı `ink2` "tahmin · boşluk · doğru mu ilk denemede doğru".
  5. "Aklında kalsın" kartı: `Kind` gri + tek cümle `body` 15 600.
  6. Tekrar satırı (iç boşluk 12, köşe 16, `soft` zemin, nötr):
     - `refresh` 20 `ink`
     - `headline` 14,5 800 `ink` "1 adım tekrar listende" (mobil katalog `reviewAdded`: "{n} adım tekrar listende" / EN doğrulanmadı)
     - `small` `ink2` "\"Ağır\" sorusunu yarın yeniden soracağız." (katalog notu: "Bunları yarın yeniden soracağız; tekrar, öğrenmenin parçası.")
     - İlk denemede yanlış yoksa satır gizlenir.
  7. Sıradaki kartı (iç boşluk 12): 32 pt halkalı numara, "Sıradaki: Terim anlam" (`headline` 15 800), "2 adım · 2 dk" (`muted`).
- **Veri:** `POST mikros/{id}/complete` → `{interactiveCount, answeredCount, firstTryCorrectCount, reviewItemCount, timeSpentSeconds, isSubCompleted, nextWorkMikroId, nextWorkMikroTitle}`.
  - Nokta dizisi adım sonuçlarından istemcide kurulur.
  - "Aklında kalsın" cümlesinin alanı: API'de doğrulanmalı.
  - Sıradakinin adım ve dakikası `GET subs/{id}` → `mikros[]`.
- **Etkileşimler:**
  - Ana düğme → sıradaki mikro ders [replace].
  - "Konu haritasına dön" → `m-ders-konu-girisi` [geri].
  - `isSubCompleted` ise ana düğme konu sonuna gider (metin: doğrulanmadı).
- **Hareket:** bloklar ortak sıralı giriş kuralıyla gelir: 50 ms arayla, grup 300 ms içinde (Hareket-Standardi §1; çizimde ayrıca tanımlı değil). Titreşim yok.
- **Kurallar:**
  - Tekrar satırı ceza değildir: kırmızı yok, ikon `refresh`.
  - Sıfır yazılmaz: hiç etkileşim yoksa skor bloğu gizlenir.

### 4.10 `m-ders-konu-sonu` Konu sonu · web: `w-ders-konu-sonu`

- **Görseller:** `acik/mobil/m-ders-konu-sonu.png`, `acik/web-panel/w-ders-konu-sonu.png` (+ koyu, en)
- **Çerçeve:**
  - Mobil: `TitleBar` ✕ + "Sözcükte Anlam · 13 / 13". Alt alan Testler renginde `lg` tam genişlik düğme, `quiz` ikonu, "Kolay seviye testi · 20 soru · ~25 dk" (EN: "Easy quiz · {count} questions · ~{minutes} min").
  - Web: konum izi "Dersler › Türkçe › Sözcükte Anlam ›".
- **Yerleşim, mobil** (aralık 12):
  1. `Title` "Toparlayalım" / "Let’s wrap up".
  2. Özet kartı (iç boşluk 14, aralık 7): maddeler `small` 13,5, kalınlar 800.
  3. `Feedback hint` "Dikkat" / "Watch out": uyarılar alt alta.
  4. "Kamp görevi" / "Camp task" kartı: `Kind` + numaralı maddeler.
- **Yerleşim, web:**
  - Üstte `Kind` "Sözcükte Anlam · 13 / 13 mikro ders" ve `display` 32 "Toparlayalım". Sağda `Chip success` `checkCircle` "İlk denemede %75 doğru" / "75% right first time".
  - `Grid` 1,4fr / 1fr:
    - Solda özet kartı (iç boşluk 24): `check` 18 yeşil + `body` 16.
    - Sağda "Dikkat" kutusu, "Kamp görevi" kartı ve Testler renginde test düğmesi.
- **Veri:**
  - `GET subs/{lessonSubId}/summary` → `{name, points[], warnings[], taskItems[], mikroCount, completedMikroCount, answeredCount, firstTryCorrectCount}`.
  - Kolay testin kimliği, soru sayısı ve süresi: Testler uçlarından (doğrulanmadı hangi uç).
- **Etkileşimler:**
  - Test düğmesi → Testler, konunun Kolay testi [modül değişimi].
  - ✕ → Konular (ya da açıldığı yer).
  - Paylaşım kartı (`p-konu-hikaye`) konu bitince sunulur: yer ve düğme çizimde yok, doğrulanmadı.
- **Kurallar:** test düğmesi Testler renginde (`#4F46E5`), Dersler renginde değil.

### 4.11 `m-ders-tekrar` Tekrar · web: `w-ders-tekrar`

- **Görseller:** `acik/mobil/m-ders-tekrar.png`, `acik/web-panel/w-ders-tekrar.png` (+ koyu, en)
- **Çerçeve:** `AppHeader`, tab bar aktif yuva 4 "Tekrar", modül yıkaması. Web: sekme Tekrar aktif.
- **Yerleşim, mobil** (aralık 12):
  1. `PageTitle` "Tekrar" / "Review", alt yazı "İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra yeniden gelir." / "Steps you missed come back after 1, 3 and 7 days."
  2. `Card moduleLine` (beyaz, 1,5 px modül `line`, iç boşluk 16, aralık 12):
     - `Tile` `refresh` 44.
     - `section` "Bugün 5 adım" / "5 steps today".
     - `small` "Yaklaşık 4 dakika · tek denemede" / "About 4 minutes · one try each".
     - Tam genişlik ana düğme "Tekrara başla" / "Start review".
  3. `List`, satır başına bir adım:
     - Başlık adım türü ("TYT tarzı soru", "Boşluk doldur" …).
     - Alt yazı "{mikro ders} · {konu}".
     - Sağda `Chip module sm` "1. tekrar" / "Round 1".
  4. Satır: `calendar` 16 `muted` + `small` "Yarın 3 adım daha gelecek." / "3 more steps tomorrow." Yarın adım yoksa gizlenir.
- **Yerleşim, web:**
  - `ModuleHead` "Tekrar", alt yazı "İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra yeniden gelir".
  - `Grid` 1fr / 2fr:
    - Solda `moduleLine` kart (iç boşluk 22): `Tile` 52, `title` 24 "Bugün 5 adım", "Yaklaşık 4 dakika. Her adımı bir kez cevaplarsın; doğruysa bir sonraki tekrar daha geç gelir." / "About 4 minutes. One try per step; a right answer pushes the next review further out.", `lg` "Tekrara başla", "Yarın 3 adım daha gelecek."
    - Sağda liste. Her satırda adım türünün ikonu (`Tile` 40): soru `quiz`, boşluk `edit`, tahmin `bulb`, doğru/yanlış `checkCircle`, sırala `list`.
- **Veri:** `GET reviews/summary` (`dueCount`, `dueTomorrowCount`) ve `GET reviews?take=50` → `[{workMikroId, mikroTitle, lessonSubName, stage, dueAtUtc, reason, focus[], block}]`.
  - Aşama çipi `stage + 1`.
  - Süre = adım × 45 sn.
  - Adım türü adı `block.kind`'dan gelir. Adlar oynatıcıdaki adlarla aynıdır: Önce sen tahmin et, Doğru mu yanlış mı?, Sırala, TYT tarzı soru, Boşluk doldur, Eşleştir, Grupla, Seç, Çoklu seçim, Çevir.
- **Etkileşimler:**
  - "Tekrara başla" → `m-ders-tekrar-oturum` [push, odak].
  - Satırlar bilgi amaçlıdır, dokunulmaz (çizimde ok yok).
- **Hâller:** boş → `m-ders-tekrar-bos`; yükleniyor `LoadingLogo`; hata yerinde "Tekrar dene".

### 4.12 `m-ders-tekrar-bos` Tekrar · bugün yok

- **Görseller:** `acik/mobil/m-ders-tekrar-bos.png` (+ koyu, en)
- **Yerleşim:**
  1. `PageTitle` "Tekrar".
  2. `StateBlock`, Dersler modülü, ton `success`:
     - 64 pt ikon kutusu `successSoft`, `checkCircle` 30 `successInk`.
     - `section` 18 "Bugün tekrar yok" / "Nothing to review today".
     - `body` 15 "Yanlış yaptığın adımlar burada 1, 3 ve 7 gün sonra karşına çıkar. Sıradaki tekrar yarın: 4 adım." / "Steps you miss come back after 1, 3 and 7 days. Next review tomorrow: 4 steps."
     - `module` tam genişlik "Kaldığın derse dön" / "Back to your lesson".
- **Veri:** `dueCount = 0`. Sıradaki tekrar günü ve adım sayısı: `dueTomorrowCount`. Yarından sonraki ilk gün için alan: API'de doğrulanmalı.
- **Etkileşimler:** düğme → kaldığın mikro ders (`GET continue`). Kalınan yer yoksa → `m-ders-vitrin`.
- **Kurallar:** sıfır sayı yazılmaz. Yarın da adım yoksa ikinci cümle "İlk denemede yanlış çözdüğün adımlar 1, 3 ve 7 gün sonra burada yeniden sorulur." olur.

### 4.13 `m-ders-tekrar-oturum` Tekrar oturumu · web: `w-ders-tekrar-oturum`

- **Görseller:** `acik/mobil/m-ders-tekrar-oturum.png`, `acik/web-panel/w-ders-tekrar-oturum.png`
- **Çerçeve:**
  - Mobil: `StepBar` 5 parça (oturumun adım sayısı), şimdiki 2.
  - Alt alan:
    - Yeşil not kutusu: iç boşluk 10 / 14, köşe 14, `successSoft`, `checkCircle` 18 + `small` 700 `successInk` "3 gün sonra yeniden sorulacak." / "It will be asked again in 3 days."
    - Ana `lg` "Sonraki" / "Next". Son adımda "Bitir" / "Finish".
  - Web: oynatıcı çerçevesi, şerit "tekrar 2 / 5", nav "Tekrarı kapat" / "Close review" ve "Sonraki". Adım `EmbedStep` ile mobilden.
- **Yerleşim:**
  1. Çip satırı: `Chip module sm` `refresh` "Tekrar · 2 / 5" ve `Chip outline sm` "1. tekrar".
  2. `meta` modül `ink` "Sözcükte Anlam · Mecaz anlam" (konu · mikro ders). Neden "tahmin" ya da "bilmiyordun" ise sona eklenir: "· Tahmin" / "· Bilmiyordun".
  3. Adımın kendi içeriği (örnekte Doğru mu, yanlış mı?, doğru cevaplanmış).
  4. `Kind` gri "Tek denemede · yaklaşık 45 sn".
- **Öğrenci:** adımı bir kez cevaplar.
  - Doğruysa yeşil not sonraki aralığı söyler (1 → 3 → 7 gün). Üçüncü doğruda "Bu adımı öğrendin; listeden çıktı."
  - Yanlışsa not nötr kalır: "1 gün sonra yeniden sorulacak." Zemin `soft`, ikon `refresh` (doğrulanmadı: yanlış hâli çizilmedi; nötr not kuralına göre).
- **Veri:** `POST blocks/{blockId}/answer` `{..., isReview: true}` → `review {stage, status, dueAtUtc}`. Aralık `dueAtUtc`'den ya da `[1, 3, 7][stage]`'den yazılır.
- **Etkileşimler:** "Sonraki" → sıradaki adım. ✕ / "Tekrarı kapat" → `m-ders-tekrar`. Cevaplanan adım zaten kaydedilmiştir.

### 4.14 `t-ders-notlarim` Notlarım (tablet)

- **Görseller:** `acik/tablet/t-ders-notlarim.png`
- **Çerçeve:** yan ray (aktif Konular), modül yıkaması.
- **Yerleşim:**
  - Üst satır: `meta` "TYT Türkçe · Sözcükte Anlam", `title` 28 "Notlarım" / "My notes".
  - Sağda `Segmented` "Tümü · 4" · "Kenar notları" · "Taslaklar" (mobil katalog: "Tümü · {n}" · "Adım notları" · "Taslaklar") ve ghost "PDF olarak al" (`file`).
  - **Solda 280 pt kart "Mikro dersler":** satırlar (iç boşluk 9 / 8, köşe 12). 10 pt durum noktası. Seçili satır `soft` zemin, `ink` 800. Notu olan satırda `pen` 14.
  - **Sağda iki sütun not kartı:**
    - Üst 140 pt noktalı kâğıt üstünde notun küçük resmi.
    - Altta mikro ders adı (`headline`), adım ve katman ("Tanım · kenar notu"), gün ("Bugün" / "Dün"), ok.
- **Veri:** `GET student/notes/works` ve `GET student/notes/works/subs/{lessonSubId}`.
- **Etkileşimler:** not kartı → oynatıcı, o adımdan (`WorkMikro {workMikroId, blockKey}`). "PDF olarak al" → markalı PDF.
- **Hâller:** boş → "Henüz notun yok" / "Tablette kalemle adıma, kenara ya da taslak kâğıdına yazdığın notlar konuya göre burada toplanır."

### 4.15 `w-ders-akis` Akış panosu (web)

Ekran değildir, akışı anlatan panodur. İçeriği §3.1 ile aynıdır. Kutular sırayla:
1. "Konu girişi" ("Devam et") → "Mikro ders · 2–6 dk" (dokuz adım türü: Concept/Tanım, Example/Örnek, Rule/Kural, Visual/Görsel, Choice/Önce sen tahmin et, TrueFalse/Doğru mu yanlış mı?, Order/Sırala, FillBlank/Boşluk doldur, Question/TYT tarzı soru) → "Mikro ders bitti".
2. Yan dallar:
   - "ilk denemede yanlış" → "Tekrar" (1, 3, 7 gün)
   - "TYT sorusunda yanlış" → "Çözüm adımları"
   - "son mikro dersten sonra" → "Konu sonu" → Testler, Bilgi Kartları, Video.

Kural: etkileşimli adımın cevabını sunucu denetler. İstemci doğru cevabı önceden bilmez.

## 5. Takılma ve kilitlenme önlemleri

- **Adım cevabının kaydı:**
  - Her cevap `POST blocks/{blockId}/answer` ile hemen sunucuya yazılır. Anlatım adımında konum `POST position` ile yazılır.
  - Cevap gidene kadar şıklar ve "Kontrol et" kilitlidir (`busy`). Çift dokunuş tek istek gönderir.
  - İstek sunucuya hiç ulaşmadıysa bir kez kendiliğinden yeniden denenir. Yine olmazsa adımın altında kırmızı satır çıkar, seçim geri açılır.
  - Kapanmış adıma gelen cevap aynı sonucu döner (sunucu tarafı güvenli).
  - README §7.6 gereği cevap yerelde de saklanır. Ağ yokken verilen cevap kuyruğa girer, bağlanınca gönderilir; o arada adım "gönderilecek" hâlinde kalır, sonuç gösterilmez. Bu davranış bugünkü kodda yoktur (§7).
- **Oynatıcıdan çıkıp dönünce aynı adım:**
  - Açılışta `progress.currentBlockKey` adımına gidilir. Cevaplanmış adımlar sonuçlarıyla gelir.
  - Uygulama arka plana geçip dönünce oynatıcı yeniden yüklenmez, aynı adımda kalır.
  - Adımda geçen süre yalnız ön plandayken sayılır.
- **Çekip yenileme oynatıcıda kapalıdır:** adım ekranlarında, tekrar oturumunda ve konu girişinde `RefreshControl` yoktur. Çekip yenileme yalnız vitrin, Konular ve Tekrar listesindedir (UIUX-Rehberi §8).
- **İlerlenemeyen adım:** etkileşimli adım `isFinal` olmadan "Devam" pasiftir. Nedeni ekranda yazar ("Bir şık seç", "2 kart kaldı"). Hiçbir zaman sebepsiz kilitli düğme kalmaz.
- **İçerik güncellenince:** yeni sürümde adım kimliği değişir. Eski adıma cevap `404 WORK_STEP_NOT_PUBLISHED` döner. Öğrenci sıkışmaz (README §7.1): hata satırının "Tekrar dene"si mikro dersi yeniden yükler (`GET mikros/{id}`). Konum, `key`'i değişmeyen adımlarda korunur (API §7).
- **Hak (403 PAYWALL):** yalnız `start`, `answer`, `position`, `complete` dönebilir. Oynatıcıda gelirse `m-ders-hak` alt sayfası açılır, alt sayfa her zaman kapanabilir.
- **Zaman aşımı:** okuma 25 sn, gönderim 60 sn (README §7.3). Süre dolunca "Bağlantı sorunu oldu. Biraz sonra tekrar dene." ve "Tekrar dene". Gösterge sonsuz dönmez.
- **Geri tuşu:**
  - Oynatıcıda Android geri ve iOS kenardan kaydırma ✕ ile aynıdır (`useWorkTopicExit`).
  - Konu girişi, Konular ve Tekrar'da bir önceki ekran.
  - Alt sayfada önce alt sayfa kapanır.
- **Uzun listeler:** Konular ve Tekrar listesi sanallaştırılmış listeyle kurulur (`FlatList`; web'de gerekirse sanallaştırma). Tekrar en çok 50 adım getirir.
- **Klavye:**
  - Yazmalı boşlukta klavye açılınca "Kontrol et" klavyenin üstünde kalır (`KeyboardAvoidingView`).
  - Web'de 1–5 ve Enter giriş alanı odaktayken şık seçmez.
- **Video:** `videoUrl` boşsa video satırları gizlenir, boş kutu kalmaz.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | ikisi | `m-ders-vitrin`, `w-ders-vitrin` | Örnek veriyle aç; TR/EN × açık/koyu ekran görüntüsü al | PNG ile yerleşim, metin, renk aynı |
| 2 | e2e | ikisi | vitrin | `continue` 204 döndür | `m-ders-ilk` hâli; "İlk mikro dersi başlat" oynatıcıyı açar |
| 3 | bileşen | ikisi | vitrin | Tekrar `dueCount = 0` | Tekrar kartı görünmez |
| 4 | e2e | ikisi | Konular | Ders satırına dokun | Konular sırayla; süren konuda tek "Devam et"; `isAvailable: false` gri "Yakında", dokunulmaz |
| 5 | birim | ikisi | Konular | `answeredCount = 0` | "ilk denemede" yazısı yok; "%0" yazmaz |
| 6 | birim | ikisi | Konular | Yüzde biçimi | TR `%11`, EN `11%` |
| 7 | e2e | ikisi | konu girişi | Konuya dokun | Konu girişi açılır; tek ana düğme sıradaki mikro dersi adıyla yazar; `videoUrl` boşsa video satırı yok |
| 8 | e2e | ikisi | `m-ders-hak` | `start` 403 PAYWALL döndür | Alt sayfa açılır; "Paketleri gör" marka turuncusu; "Yarın devam ederim" ve aşağı çekme kapatır |
| 9 | e2e | ikisi | oynatıcı | Bir mikro dersi baştan sona geç | Her anlatım adımında `position`, her etkileşimde `answer`, sonda `complete`; sonra `m-ders-mikro-bitti` |
| 10 | bileşen | ikisi | adım çubuğu | 5 adımlı mikro derste 2. adım | 1 parça dolu, 2. parça yarım, 3 parça boş |
| 11 | bileşen | ikisi | Tahmin | Yanlış şıkka dokun | Seçilen kırmızı, doğru yeşil, kırmızı kutu ve neden, nötr tekrar notu; şıklar kilitli; "Devam" açık |
| 12 | bileşen | ikisi | Doğru/Yanlış | Yanlış cevap | Tek deneme; "Bu ifade doğru/yanlış." ve neden |
| 13 | bileşen | ikisi | Sırala | Dördüne sırayla dokun, birini geri al, "Baştan diz" | Numaralar doğru güncellenir; "Kontrol et" yalnız hepsi numaralıyken açık; sonuçta doğru sıra |
| 14 | bileşen | ikisi | Boşluk doldur | Yanlış haba dokun | Boşlukta doğru sözcük yeşil; seçilen hap kırmızı; "Doğrusu: …" kutusu; adım kapanır |
| 15 | bileşen | ikisi | Yazmalı boşluk | " AĞIR " yaz | Doğru sayılır (büyük harf ve boşluk önemsiz); klavye açıkken "Kontrol et" görünür |
| 16 | bileşen | ikisi | TYT tarzı soru | 3 çözüm adımlı soruda iki yanlış, sonra doğru | Her yanlışta bir çözüm adımı açılır, yanlış şık kilitli, kalan hak yazılı; doğruda "Çözüm adımları" kartı; adım Tekrar'a girer |
| 17 | bileşen | ikisi | TYT tarzı soru | 4 kez yanlış | Hak biter; doğru şık ve bütün çözüm adımları açılır |
| 18 | bileşen | ikisi | Grupla | Kartları yerleştir, birini geri al | Metin kesilmez; kalan kart sayısı canlı; "Kontrol et" hepsi yerleşince açık |
| 19 | bileşen | ikisi | Eşleştir | Üç eş kur | Eşler aynı numara; yalnız Dersler renk tonları; "Kontrol et" kaydırmadan görünür |
| 20 | bileşen | ikisi | Çevir | Bir karta "Bilmiyordum" | "1 kart tekrar listene eklendi."; "Tahmin ediyorum" düğmesi yok |
| 21 | bileşen | ikisi | Çoklu seçim | Bir yanlış işaretle, bir doğruyu kaçır | Yanlış kırmızı ve neden; kaçırılan kesikli ve "Bu da doğruydu" |
| 22 | görsel | ikisi | Formül | Kesir, kök, üs ve tablo içeren adım | Kesir üst üste, kök çizgisi içini örter; hücre yazısı ≥ 15 pt; dar ekranda tablo yatay kayar |
| 23 | birim | mobil | oynatıcı | Doğru ve yanlış cevap | Doğruda `impactLight`, yanlışta `notificationWarning`, her cevapta bir kez |
| 24 | bileşen | ikisi | oynatıcı | "Hareketi azalt" açık, "Devam" | Adım kaymadan, en çok 150 ms soluklaşarak değişir |
| 25 | e2e | mobil | oynatıcı | 3. adımda uygulamayı kapat, yeniden aç, "Devam et" | Aynı adım açılır; önceki cevaplar sonuçlarıyla görünür |
| 26 | e2e | ikisi | oynatıcı | Uçak modunda cevap ver | Ekran donmaz; cevap kuyruğa girer ya da kırmızı satır ve yeniden deneme; çift istek yok |
| 27 | e2e | ikisi | oynatıcı | Şıkka hızla iki kez dokun | Tek `answer` isteği |
| 28 | e2e | mobil | oynatıcı | Adımda aşağı çek | Yenileme olmaz |
| 29 | e2e | mobil | oynatıcı | Android geri tuşu | Konudan çıkılır; Konular'dan açıldıysa Konular'a dönülür |
| 30 | e2e | web | oynatıcı | Klavyeyle 1–5 ve Enter | Şık seçilir; Enter etkin ana düğmeye basar; odak halkası 2 px görünür |
| 31 | e2e | ikisi | Mikro ders bitti | 4 etkileşimden 1'i ilk denemede yanlış | "3 / 4", dört nokta (bir kırmızı), "1 adım tekrar listende" nötr satır, sıradaki kartı |
| 32 | e2e | ikisi | Mikro ders bitti | Hepsi ilk denemede doğru | Tekrar satırı yok |
| 33 | e2e | ikisi | Konu sonu | Son mikro dersi bitir | "Toparlayalım", Dikkat, Kamp görevi; test düğmesi Testler renginde ve konunun Kolay testini açar |
| 34 | e2e | ikisi | Tekrar | `reviews` 5 öğe, `dueTomorrowCount` 3 | "Bugün 5 adım", "Yaklaşık 4 dakika", aşama çipleri, "Yarın 3 adım daha gelecek." |
| 35 | e2e | ikisi | Tekrar boş | `reviews` boş | `m-ders-tekrar-bos`; "Kaldığın derse dön" kalınan mikro dersi açar |
| 36 | e2e | ikisi | Tekrar oturumu | Bir doğru, bir yanlış cevap | Doğruda "3 gün sonra yeniden sorulacak." yeşil; yanlışta nötr "1 gün sonra"; her adım tek deneme; son adımda "Bitir" Tekrar'a döner |
| 37 | görsel | web | `w-ders-*` oynatıcı | Grupla, Eşleştir, Formül, Bölüm başı | Adım içeriği mobil bileşenin aynısı; çerçeve web oynatıcısınınki (sol mikro dersler, sağ "Bu mikro derste") |
| 38 | görsel | tablet | `t-ders-*` | Aynı dört adım | Mobil adım bileşeni tablet çerçevesinde; alt satırda "SinoAI’ye sor" ve ana düğme |
| 39 | erişilebilirlik | ikisi | bütün adımlar | Ekran okuyucu | ✕ "Dersi kapat", geri "Önceki adım", "Tahmin ediyorum" adlı; ilerleme çubuğu `progressbar` değeriyle; geri bildirim kutusu canlı bölge |
| 40 | erişilebilirlik | ikisi | bütün adımlar | En büyük yazı ayarı, iPhone SE | Şık, kart ve grup metni kesilmez; ana düğme ekranda kalır |
| 41 | erişilebilirlik | ikisi | şıklar, haplar | Kontrast ölçümü | Yazılar ≥ 4,5:1; beyaz yazılı harf kutuları iki temada `#047857` / `#DC2626` |
| 42 | erişilebilirlik | mobil | bütün dokunulabilir öğeler | Ölç | ≥ 44 pt (iOS) / 48 dp (Android) |
| 43 | dil | ikisi | bütün ekranlar | EN | Çerçeve metinleri İngilizce; ders içeriği sunucudan geldiği dilde |
| 44 | e2e | tablet | `t-ders-tanim-not` | Kenar notu yaz, çık, dön | Not aynı adımda geri gelir; Notlarım'da görünür; nota dokununca o adım açılır |

## 7. Çizim ile bugünkü kod arasındaki farklar

**Mobil** (`sinavika_mobile_reactnative/src/modules/works/presentation/`):

1. **Konu girişi yok.** `screens/WorkSubScreen.tsx` konuyu yükler ve hemen `WorkMikro`'yu açar (`navigation.replace`); kanca, video ve yol haritası ekranı (`m-ders-konu-girisi`) gösterilmez. Bu ekranın kodu yalnız tabletin iki panelinde, `components/WorkTopicPane.tsx` içinde var.
2. **Mikro ders bitti ekranı yok.** `screens/WorkMikroScreen.tsx` `complete` sonrasında sıradaki mikro derse ya da konu sonuna doğrudan geçer (`navigation.replace`); `completion` verisi ekranda gösterilmez.
3. **İlk denemede yanlış → Tekrar notu oynatıcıda yok.** `components/WorkBlockView.tsx` `Feedback` yalnız tahminle doğru bulunan adım için not yazar ("Tahminle doğru buldun…"). Yanlış cevapta Tekrar'a girdiği söylenmez.
4. **İlerleme çubuğu farklı.**
   - Çizim: mikro dersin adımları parça parça, şimdiki parça yarım.
   - Kod (`components/WorkStepPlayerFrame.tsx`): bütün konu üzerinden tek sürekli çubuk (6 pt) ve "Adım {n} / {toplam}". Üstte konu adı yazar.
5. **Adım geçiş hareketi yok.** `WorkMikroScreen` adım değişince yalnız en üste kaydırır (`scrollTo`, animasyonsuz). `nextQuestion` hareketi uygulanmamış.
6. **Alt alan tutarsızlığı.**
   - Çizimdeki dokuz temel adım ekranında tek "Devam" düğmesi var.
   - Yeni türlerin çiziminde (`LessonSteps.tsx`) geri, "?" ve ana düğme var.
   - Kod bütün adımlarda geri ikonu, "Tahmin ediyorum" ikonu ve "Devam" / "Bitir" gösterir. "Kontrol et" adımın içinde, ayrı düğmedir.
7. **Sırala:** çizimde alt alanda yalnız "Baştan diz" var. Kodda "Baştan diz" ve "Kontrol et" içerikte yan yana; ayrıca sürükleme açık ("Adımlara sırayla dokun ya da basılı tutup yerine sürükle.").
8. **Vitrin yerleşimi farklı.**
   - Çizim: `ModuleSlide`, Tekrar kartı, TYT ders listesi.
   - Kod (`screens/WorkOverviewScreen.tsx`):
     - kaydırılan vitrin (`ModuleHomePagedSlides`): Kaldığın yerden, "Bugün {n} adım seni bekliyor" ve "Bir konu seç" slaytları
     - `ProfileModuleStatisticsCard`
     - halka ızgarası "Derslerin" (`ModuleLessonRingGrid`)
9. **İlk giriş hâli (`m-ders-ilk`) yok.** Kodda kalınan yer yokken yalnız "Bir konu seç" slaytı kalır; önerilen ilk konu ve "Dersler nasıl işler?" kartı yok.
10. **Günlük konu hakkı alt sayfa değil.** 403 PAYWALL `classifyWorkError` → `components/WorkGateBanner.tsx` ya da `WorkAccessLocked.tsx` tam ekran kapı olarak gösterilir.
    - Başlık "Erişimin sınırlı", metin sunucudan, düğme "Paketleri gör".
    - "Bugünkü konu hakkın doldu" başlığı ve "Yarın devam ederim" yok.
11. **Konular ekranı farklı.**
    - Kod (`components/WorkBrowseTree.tsx`): ders çipleri, "{sınav} {ders} · {n} konu" özeti, `AppProgressRing` (renk `colors.primary`; modül rengi olup olmadığı doğrulanmadı) ve çizimde olmayan "Tümü / Süren (n) / Biten (n)" süzgeci.
    - Konu satırında "Devam et" düğmesi yerine satırın kendisi dokunulur (doğrulanmadı).
12. **Tekrar oturumu:**
    - Çizimde "Tekrar · 2 / 5" ve "1. tekrar" çipleri, ana düğme "Sonraki".
    - Kod (`screens/WorkReviewSessionScreen.tsx`): üst satır "Tekrar", ilerleme "Adım n / toplam", adım üstünde "{konu} · {mikro ders} · {neden}". Ana düğme "Devam" / "Bitir" ("Sonraki" anahtarı katalogda var, kullanılmıyor).
    - Sonraki aralık notu yeşil kutu değil, düz metin.
13. **Tekrar listesindeki tür adları farklı** (`screens/WorkReviewScreen.tsx` `KIND_LABEL`, `review.kinds`):

    | Kod | Çizim |
    |---|---|
    | "Sınav tarzı soru" | "TYT tarzı soru" |
    | "Çoktan seçmeli" | "Önce sen tahmin et" |
    | "Doğru parçayı seç" | "Seç" |
    | "Birden çok doğru" | "Çoklu seçim" |
    | "Kartlar" | "Çevir" |

14. **Bölüm başı (`m-ders-bolum`) yok.** API'de bölüm adım türü yok, kodda "Önceki bölüm" yolu yok. Kod mikro dersleri konu içinde "bölüm" sayar, ara ekran göstermez.
15. **Ek ayır (Split, `steps/WorkSplitStep.tsx`)** kodda ve API'de var, çizimi yok.
16. **Cevap yerelde saklanmıyor.** `hooks/useWorkMikroPlayer.ts` cevabı yalnız sunucuya gönderir: ağa hiç ulaşmayan istekte bir kez yeniden dener. Kuyruk ve çevrimdışı hâl yok (README §7.6).
17. **Tablet SinoAI yan paneli (`t-ders-sinoai-panel`)** kodda görülmedi. Yanlış cevaptan sonra `SinoAiAskButton` SinoAI'yi ayrı açar.
18. **Konu sonu:**
    - Kodda (`screens/WorkSubSummaryScreen.tsx`) çizimde olmayan bir istatistik satırı var: "{answered} etkileşimin {firstTry} tanesi ilk denemede doğru". Ayrıca paylaşım kartı düğmesi, "Konuyu baştan oku" ve "Konulara dön" var.
    - Çizimde yalnız test düğmesi var.

**Web** (`sinavika_frontend_student/src/features/works/`):

19. **Konu girişi yok.** `pages/WorksSubPage.tsx` `/konu/[lessonSubId]`'de sayfa göstermez, oynatıcıya ya da `/ozet`'e yönlendirir. `sub.*` çeviri anahtarları kullanılmıyor.
20. **Oynatıcı yerleşimi farklı.**
    - Kod (`components/WorkStepPlayerFrame.tsx`): sol mikro ders zaman çizelgesi yok. Adım çubuğu parçalı değil, konu boyunca ince çubuk ve "Adım {n} / {toplam}".
    - Sağ panel `MikroAside` var ama başlığı "Bu derste" (çizim "Bu mikro derste") ve yalnız `xl` genişlikte görünür.
    - Okuma sütunu `max-w-2xl` (672 px; çizim 700 px).
21. **Klavye kısayolları yok.** works içinde `keydown` işleyicisi yok; 1–5 ve Enter çalışmıyor (yalnız boşluk doldur formunda Enter gönderir).
22. **Mikro ders bitti ekranı yok.** `pages/WorksMikroPage.tsx` `complete` sonrası sıradakine yönlendirir. `player.reviewAdded`, `reviewAddedNote`, `firstTryNote` anahtarları kullanılmıyor.
23. **Yanlış → Tekrar notu yok.** `components/WorkInteractiveBlock.tsx` yanlışta "Bu sefer olmadı." ve nedeni gösterir; Tekrar'a girdiği söylenmez.
24. **`/student/ders-cal/ders` farklı.** Çizim (`w-ders-dersler`): Dersler sekmesinde ders kartları ızgarası. Kod (`pages/WorksLessonPage.tsx`): ilk dersin konularını açar ve hap sekme "Konular" bu yola bağlı (`src/constants/studentModuleRoutes.ts`).
25. **Konular sayfası:** kodda çizimde olmayan ders hapları satırı var. İlerleme kartı "{n} / {m} konu tamamlandı" der (çizim "14 mikro ders bitti"; "Bu hafta 1 sa 20 dk" kodda yok).
26. **Abonelik ve hak:** `components/WorkAccessGate.tsx` başlığı "Erişimin sınırlı", düğmeleri "Aboneliklerim", "Paketleri incele", "Konulara dön". Çizimdeki "Bugünkü konu hakkın doldu" alt sayfası yok. Hak kapısı yalnız oynatıcıda.
27. **Vitrin:**
    - "Kaldığın yerden" kartının başlığı konu adı (çizimde mikro ders adı). "{n} dakika kaldı" anahtarı kullanılmıyor.
    - Tekrar sayısı `reviews/summary` yerine `getWorkReviews(50).length`'ten.
    - İlk giriş hâli yerine "Henüz hedef sınavın seçili değil…" boş hâli var.
28. **Hata metni:** ağ hatasında `apiRequest`'in uzun geliştirici metni ("Sunucuya bağlanılamadı. … .env …") `getWorksErrorMessage` ile ekrana geçebilir (`lib/worksError.ts`). README §7.8'e aykırı.
29. **Zaman aşımı:** works çağrıları `timeoutMs` vermiyor; varsayılan süre doğrulanmadı.
30. **Konu sonu:** kodda "Konuyu baştan oku", paylaşım kartı ve `ContentEndSurvey` var. Uyarı kutusunun başlığı "Sık yapılan hatalar" (çizimde "Dikkat").
