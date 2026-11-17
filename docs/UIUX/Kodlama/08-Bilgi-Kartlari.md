# Bilgi Kartları · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Assist.tsx` (`CardsHomeScreen`, `CardsTodayScreen`, `CardSessionScreen`, `CardSessionBackScreen`, `CardsSavedScreen`, `FlashcardFace`), `Screens/Mobile/States.tsx` (`CardsDoneScreen`), `Screens/Web/AssistWeb.tsx` (`WebCardsHomeScreen`, `WebCardsBrowseScreen`, `WebCardSessionScreen`, `WebCardsSavedScreen`), `Screens/Web/GapsWeb.tsx` (`WebCardsTodayScreen`), `Screens/Tablet/Learn.tsx` (`CardWriteTabletScreen`); parçalar `Parts/Mobile.tsx`, `Parts/Shared.tsx`, `Parts/Web.tsx`, `Parts/Tablet.tsx`, `Parts/Study.tsx` (`StateBlock`).
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

Kod adı: modül anahtarı `flashcards`; API `Flashcards` (`/api/student/flashcard`), web özellik klasörü `flashcard`, mobil modül `flashcard`, mobil rota öneki `Flashcard`. Ekranda yalnız "Bilgi Kartları" / "Flashcards"; "Kelime Kartları", "Knowledge cards" asla.

## 1. Modül özeti

- **Ne işe yarar:** aralıklı tekrar kartları. Öğrenci bugün tekrar zamanı gelen kartları çevirir, cevabı görür ve ne kadar hatırladığını işaretler (Bilmiyorum, Emin değilim, Biliyorum); sistem kartın bir sonraki tekrar zamanını buna göre seçer. Ders → konu → deste sırasıyla göz atar, kartları kaydeder. Ana iş: günün tekrarını bitirmek.
- **Deste:** bir konunun (lesson sub, API'de `unit`) kartlarıdır. Ders ekranında "3 deste" = o derste kartı olan konu sayısı. SinoAI'nin öğrencinin notundan ürettiği kartlar da bir destedir (kişisel deste; API `GET student/flashcard/personal?generationRunId=`).
- **Renk** (`ModuleIdentity.ts`, `MODULES.flashcards`):

| Jeton | Açık tema | Koyu tema |
|---|---|---|
| `color` (kimlik) | `#DB2777` | `#F472B6` |
| gradyan ikinci durak | `#F43F5E` | `#F43F5E` |
| `action` (düğme dolgusu, beyaz yazıyla 4,6:1) | `#DB2777` | `#DB2777` |
| `ink` (modül renginde yazı) | `#A41D59` | `#F8AAD3` |
| `wash` %7 / %12,6 | `rgba(219,39,119,0.07)` | `rgba(244,114,182,0.126)` |
| `soft` %12 / %21,6 | `rgba(219,39,119,0.12)` | `rgba(244,114,182,0.216)` |
| `track` %16 / %28,8 | `rgba(219,39,119,0.16)` | `rgba(244,114,182,0.288)` |
| `line` %24 / %43,2 | `rgba(219,39,119,0.24)` | `rgba(244,114,182,0.432)` |

  Cevap düğmeleri durum renkleriyle yazılır, modül rengiyle değil: Bilmiyorum `errorInk` (`#B91C1C` / koyu `#F87171`), Emin değilim `warningInk` (`#B45309` / `#FBBF24`), Biliyorum `successInk` (`#047857` / `#34D399`). Kart serisi satırı `warningInk` ve `flame` ikonu.

- **Mobil tab bar** (Modul-Kimligi §6):

| Yuva | Etiket TR / EN | İkon | Hedef |
|---|---|---|---|
| 1 | Kartlar / Cards | `cards` | `m-kart-vitrin` (`FlashcardMain`, sekme `FlashcardStack`) |
| 2 | Bugün / Today | `sun` | `m-kart-bugun` (`FlashcardToday`); hepsi bittiyse `m-kart-bitti` |
| 3 | Modüller / Modules | `grid` | Modüller ana ekranı |
| 4 | Kaydedilenler / Saved | `bookmark` | `m-kart-kaydedilen` (`FlashcardSavedTab`) |
| 5 | Profil / Profile | `user` | Profil |

  Tab bar ölçüleri ve aktif yuva görünümü Testler'deki gibidir (`TabBar` parçası): aktif hap `soft`, ikon `color`, etiket 10 pt 800 `ink`.
- **Web:** sol menüde "Modüller" altında altıncı satır, `cards` ikonu. Hap sekmeler: Kartlar · Bugün · **Gözat** · Kaydedilenler (Gözat web'e özgü ektir, yuva 2'den sonra gelir). Sayfa yolları: `/student/flashcard`, `/student/flashcard/bugun`, `/student/flashcard/browse`, `/student/flashcard/kaydedilenler`, `/student/flashcard/session` (odak, `(immersive)`).

## 2. Ekran haritası

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-kart-vitrin` | mobil | Bilgi Kartları | `FlashcardMain` | `src/modules/flashcard/presentation/screens/FlashcardCatalogScreen.tsx` | dolu |
| `w-kart-vitrin` | web | Bilgi Kartları | `/student/flashcard` | `src/features/flashcard/pages/FlashcardHomePage.tsx` | dolu |
| (çizim yok) | mobil | Ders → konu (desteler) | — | `components/FlashcardBrowseTree.tsx` (vitrin içinde ağaç) | dolu |
| `w-kart-gozat` | web | Gözat | `/student/flashcard/browse` | `src/features/flashcard/pages/FlashcardBrowsePage.tsx` | dolu |
| `m-kart-bugun` | mobil | Bugün | `FlashcardToday` | yok (sekme doğrudan oturum açıyor: `navigation/FlashcardModeStackNavigator.tsx` → `FlashcardSessionScreen.tsx`, `mode=today`) | dolu |
| `w-kart-bugun` | web | Bugün | `/student/flashcard/bugun` | `src/features/flashcard/pages/FlashcardTodayPage.tsx` | dolu |
| `m-kart-bitti` | mobil | Bugün · kartlar bitti | `FlashcardToday` | `FlashcardSessionScreen.tsx` (bitti dalı, farklı) | bitti |
| `m-kart-on` | mobil | Kart oturumu · ön yüz | `FlashcardSession` | `FlashcardSessionScreen.tsx` + `components/FlashcardKnowledgeDeckView.tsx` | ön yüz |
| `m-kart-arka` | mobil | Kart oturumu · cevap | `FlashcardSession` | `FlashcardKnowledgeDeckView.tsx` | arka yüz |
| `w-kart-oturum` | web | Kart oturumu (odak) | `/student/flashcard/session` | `src/features/flashcard/pages/FlashcardSessionPage.tsx` | arka yüz |
| `t-kart-el-yazisi` | tablet | Kart · önce kendin yaz | `FlashcardSession` | `components/FlashcardWritePanel.tsx` | ön yüz + yazma |
| `m-kart-kaydedilen` | mobil | Kaydedilenler | `FlashcardSavedTab` | yok (sekme doğrudan oturum açıyor, `mode=saved`) | dolu |
| `w-kart-kaydedilen` | web | Kaydedilenler | `/student/flashcard/kaydedilenler` | `src/features/flashcard/pages/FlashcardSavedPage.tsx` | dolu |

Mobil kod yolları `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\flashcard\presentation\` altında; web yolları `C:\Users\onurc\source\repos\sinavika_frontend_student\src\` altında.

**Çizilmemiş hâller** (bu belgede kural olarak tanımlı): ilk kullanım / hiç kart yok, Kaydedilenler boş, oturum yükleniyor ve hata, abonelik yok, deste oluşturma sayfası.

**Başka modüllerdeki giriş noktaları:**
- Ana ekran "Bugün tekrar" kartı (`m-hub-moduller-kaydir`): `Tile` Bilgi Kartları, "32 kart" / "32 cards", "Bilgi Kartları · unutmak üzere" / "Flashcards · about to slip", `moduleSoft` "Başla" → oturum `mode=today`.
- Ders Planı görev kartı (`PlanTaskCard module="flashcards"`): "TYT Kimya · Bilgi Kartları", "Mol kavramı", "20 kart · 10 dk" → o konunun oturumu.
- SinoAI: `m-sino-calisma` "Tekrar kartları oluştur" / "Create review cards" ("Notlarından Bilgi Kartları destesi"); `m-sino-not` "Kart yap" / "Make cards"; `m-sino-sonuc` öneri çipi "Aynı konudan kart üret" / "Make cards on it"; `m-sino-kutuphane` satırı "Osmanlı kartları · 24 kart · Bilgi Kartları’nda".
- Akıllı Özet sonucu (`m-ozet-sonuc`): "Bilgi kartı yap" / "Make flashcards", "Bu çözümden 3 kart".
- Saat: `k-apple-kart`, `k-apple-kart-cevap` (Saat-Bildirim.md); tekrar günü telefonla aynı.

## 3. Süreçler (akışlar)

### 3.1 Bugünün tekrarı (ana akış)

1. `m-kart-vitrin` vitrin kartı "Tekrara başla" ya da tab yuva 2 → `m-kart-bugun` "Devam et" / satıra dokunma → `m-kart-on` [push, tab bar gizlenir] → API `GET student/flashcard/session?mode=today&skip=0&take=15`.
2. `m-kart-on`: "Cevabı gör" ya da karta dokunmak → `m-kart-arka` [aynı ekranda kart çevrilir].
3. `m-kart-arka`: Bilmiyorum / Emin değilim / Biliyorum → API `POST student/flashcard/{id}/knowledge` `{outcome: 2 | 1 | 0, clientMutationId}` → sıradaki kartın ön yüzü [kart sola çıkar 180 ms, yeni kart 8 pt sağdan 240 ms'de gelir]. 15 kart bitince sonraki sayfa (`skip = nextSkip`) arka planda çekilir; `hasMore=false` ise oturum biter.
4. Oturum biter → API `POST student/flashcard/session/finish` `{clientSessionId, lessonSubId, startedAtUtc, endedAtUtc, reviewedCount, correctCount, wrongCount}` → `m-kart-bitti` [replace; geri tuşu oturuma dönmez].
5. `m-kart-bitti`: "Kaydettiklerime bak" → `m-kart-kaydedilen` [sekme değişimi]; "Yeni bir desteye başla" → `m-kart-vitrin` ders listesi [sekme değişimi].

**Geri ve yarıda bırakma:** oturumda sol üst `x` ya da geri hareketi. Hiç kart cevaplanmadıysa doğrudan çıkar. En az bir kart cevaplandıysa web'deki gibi kısa onay: başlık "Oturuma ara ver" / "Pause the session", metin "Verdiğin yanıtlar kaydedildi. Kalan kartlara daha sonra dönebilirsin.", düğmeler "Ara ver" ve "Devam et" (web bugünkü metni; mobil çizimi yok). Verilen her cevap anında kayıtlıdır; kalan kartlar bir sonraki "bugün" oturumunda yine gelir. Çıkarken `session/finish` gönderilir (çalışma süresi istatistiğe yazılır).

### 3.2 Ders → konu → deste

1. `m-kart-vitrin` ders satırı → dersin konuları (desteler) [push] → API `GET student/flashcard/subjects/{lessonMainId}/units`. Mobilde bu ara ekran çizilmedi; satırlar web `w-kart-gozat`'ın sol ve orta içeriğiyle aynı bilgiyi taşır: konu adı, "x/y kart · %z", zayıf kart sayısı.
2. Konu (deste) → oturum `mode=unit&lessonSubId=` [push].
3. Web: `w-kart-vitrin` ders kartı → `w-kart-gozat?track=&subject=` (solda dersler, sağda seçili destenin kartları); deste seçimi `?unit=`; "Bu üniteyi çalış" / kart → oturum.

### 3.3 Kaydetme

1. Oturumda kartın sağ üstündeki yer imi (`bookmark`, 40 pt, dokunma alanı 44 pt) → API `POST student/flashcard/{id}/save` (kaydet) ya da `DELETE .../save` (kaldır); düğme anında dolar/boşalır, hata olursa geri döner ve hata metni gösterilir.
2. `m-kart-kaydedilen`: kaydedilen kart listesi; "Kaydedilenleri tekrar et" → oturum `mode=saved` (API `GET student/flashcard/saved?skip&take`).
3. Web `w-kart-gozat` kartlarında "Kaydet" / "Save".

### 3.4 Deste oluşturma (SinoAI dahil)

Bilgi Kartları'nda elle kart yazma ekranı çizilmedi. Desteler iki yoldan gelir:
1. **Hazır desteler:** her konunun kartları içerik ekibinden gelir; öğrenci bir şey oluşturmaz, konuyu seçer.
2. **SinoAI ile:** `m-sino-calisma` "Tekrar kartları oluştur" → kaynak seç (not, PDF, konu) → üretim → sonuç kartı (`m-sino-sonuc` kalıbı; Bilgi Kartları için ana düğme "Kartları aç" Bilgi Kartları renginde olur, doğrulanmadı) → oturum. `m-sino-not` "Kart yap", Akıllı Özet "Bilgi kartı yap" aynı üretime gider. Üretim SinoAI'nin aylık hakkını kullanır ("Bu ay 4 / 20"); hak dolunca `m-sino-hak`. Üretilen deste SinoAI kütüphanesinde "Deste" süzgecinde ve "Bilgi Kartları’nda" etiketiyle görünür.
3. **Web "Yeni deste":** `w-kart-vitrin` sağ üstteki `ghost` "Yeni deste" / "New deck" düğmesinin hedef sayfası çizilmedi; SinoAI çalışma moduna "Tekrar kartları oluştur" aracıyla gider (doğrulanmadı).
4. `m-kart-bitti` "Yeni bir desteye başla": yeni deste oluşturmaz, henüz başlanmamış bir konuya götürür (ders listesi).

### 3.5 Hak ve sınır

- Bilgi Kartları'nda günlük hak yoktur; kart sayısı aralıklı tekrardan gelir. Ödeme yoksa erişim yok: API 403 abonelik → modül içeriği yerine paket kartı (çizimi yok; kalıp `m-ders-hak`: açıklayıcı kart, "Paketleri gör" marka turuncusu `#C2410C`, ikinci yol). Web bugünkü metni: "Bilgi Kartları paketinde yok" + "Paketleri incele".
- SinoAI ile kart üretimi SinoAI hakkına tabidir (§3.4).

## 4. Ekranlar

### `m-kart-vitrin` Bilgi Kartları · web: `w-kart-vitrin`

- **Görseller:** `acik/mobil/m-kart-vitrin.png`, `koyu/mobil/m-kart-vitrin.png`, `en/acik/mobil/m-kart-vitrin.png`; `acik/web-panel/w-kart-vitrin.png`, `koyu/web-panel/w-kart-vitrin.png`, `en/acik/web-panel/w-kart-vitrin.png`
- **Çerçeve:** `AppHeader` varsayılan (solda profil, sağda zil ve sayaç). Tab bar var, aktif yuva 1. Modül yıkaması `linear-gradient(180deg, wash 0%, bg 34%)`. Alt düğme alanı yok.
- **Yerleşim:** dolgu 4 / 18 / 108, aralık 12.
  1. `PageTitle`: modül çipi (`cards` ikonu, "Bilgi Kartları" / "Flashcards", `soft` zemin, `ink` yazı), başlık 24 pt "Bilgi Kartları" / "Flashcards".
  2. `ModuleSlide` en az 160 pt: köşe 26, dolgu 20, gradyan 135° `color` → `#F43F5E`, ışık daireleri, `cards` filigranı. `over` "Bugün tekrar" / "Review today"; `hero` 24 pt beyaz "32 kart seni bekliyor" / "32 cards are due" (sayı veriden); `small` beyaz %90 "Unutmak üzere olduğun kartlar. Yaklaşık 8 dakika." / "Cards you are about to forget. About 8 minutes." (dakika = kart × 15 sn, yukarı yuvarlanır); `Button tone=white size=sm` yazı `ink` açık `#A41D59` "Tekrara başla" / "Start review".
  3. `SectionTitle` "Dersler" / "Subjects", alt satır "Önce dersi seç, desteler içinde" / "Pick a subject; decks are inside".
  4. `List`: `ListRow` (dolgu 12 / 14): `Tile` 38 `book` (`soft` zemin, `color` ikon), başlık ders adı, alt satır "3 deste · %62 öğrenildi" / "3 decks · 62% learnt"; sağda (o derste bugün tekrar varsa) `Chip tone=module size=sm` "12 bugün" / "12 today" ve `right` ok 18 pt `subtle`. Örnek dersler: Kimya, Tarih, Türkçe, Coğrafya, Biyoloji, İngilizce.
- **Veri:** `GET student/flashcard/home` → `todayDueCount` (vitrin sayısı), `dueReviewCount`, `newCardCount`, `savedCount`, `reviewAgainCount`, `weakUnits[]`. Dersler: `GET student/flashcard/tracks` (sınav: `categorySubId`, `name`, `cardCount`) → `GET student/flashcard/tracks/{categorySubId}/subjects` (`lessonMainId`, `name`, `cardCount`, `percentComplete`, `studiedCount`, `totalCards`). "N deste" ve ders başına "N bugün": subjects yanıtında alan yok, API'de doğrulanmalı (deste sayısı units listesinden sayılabilir).
- **Etkileşimler:** "Tekrara başla" → `m-kart-on` (`mode=today`) [push]; ders satırı → ders konuları (§3.2) [push]; profil, zil; tab yuvaları.
- **Hâller:**
  - Bugün tekrar yok: vitrin kartı "Bugünlük tekrar tamam" / "Today’s review is done", metin "Tekrar zamanı gelen kartlar yarın burada. Bu arada kaydettiğin kartlara bakabilirsin.", düğme "Kaydettiklerime bak" (mobil katalog metni; çizimi yok).
  - İlk kullanım (hiç kart çalışmamış): vitrin kartı yeni kartlara çağırır: "N yeni kart seni bekliyor" / "Yeni kartlara başla" (web bugünkü metni; çizimi yok); ders satırlarında "Yeni" çipi.
  - Kategoride kart yok: `StateBlock` "Bu sınavda henüz kart yok." ve tek eylem (çizimi yok).
  - Yükleniyor: ortada `LoadingLogo` (Bilgi Kartları renginde). Hata: `m-durum-hata` kalıbı, "Tekrar dene". Abonelik yok: §3.5.
- **Web farkı (`w-kart-vitrin`):** `ModuleHead` hap sekmeler Kartlar · Bugün · Gözat · Kaydedilenler (aktif Kartlar), başlık kartı: `Tile` 52, çip, başlık "Bilgi Kartları", alt satır "6 deste · 32 kart bugün tekrar bekliyor" / "6 decks · 32 due today", sağda `Button tone=ghost icon=plus` "Yeni deste" / "New deck". Altında `ModuleBanner`: `over` "Bugün tekrar", başlık 30 px "32 kart seni bekliyor", gövde "Unutmak üzere olduğun kartlar. Yaklaşık 8 dakika; seri 7 gün." / "Cards you are about to forget. About 8 minutes; 7-day streak.", beyaz düğme "Tekrara başla"; sağında `Ring` 110 px, çizgi 10, beyaz değer, iz `rgba(255,255,255,0.3)`, ortasında `section` beyaz "12/32" (bugün yapılan / bugünkü toplam). Altında üç sütun ders kartı (aralık 14; `Card` dolgu 18, aralık 10): üst satır `Tile` 40 `book` ve sağda çip (tekrar varsa `module` "12 bugün", yoksa nötr "Güncel" / "Up to date"); `section` ders adı; `Bar` 7 px (`color`, iz `track`); `meta` "3 deste · %62 öğrenildi" / "3 decks · 62% learnt" (`Pct`).
- **Kurallar:** ilk ekran yalnız dersleri listeler (hiyerarşi kuralı); kart ve deste vitrinde listelenmez. Vitrin sayısı "bugün tekrar zamanı gelen" sayıdır (yeni kart sayısı değil; UIUX-Gecmis §7 madde 4).

### Ders → konu (desteler) · web: `w-kart-gozat`

- **Görseller:** `acik/web-panel/w-kart-gozat.png`, `koyu/web-panel/w-kart-gozat.png`, `en/acik/web-panel/w-kart-gozat.png`. Mobil çizimi yok.
- **Çerçeve (web):** `Panel`; `ModuleHead` aktif hap Gözat, başlık "Gözat" / "Browse", alt satır yol izi "YKS › Kimya › Mol kavramı" / "YKS › Chemistry › The mole" (sınav › ders › deste).
- **Yerleşim (web):** iki sütun `280px 1fr`, aralık 18.
  1. Sol: `Card` dolgu 8; ders satırları (dolgu 11 / 12, köşe 12): `headline` ders adı, sağda `meta` "8 deste" / "8 decks". Seçili ders satırı `wash` zemin (çizimde sabit `rgba(219,39,119,0.08)`).
  2. Sağ: seçili destenin kartları, üç sütun (aralık 14). Her kart `Card` dolgu 18, en az 150 px, aralık 12: `Chip tone=module size=sm` kart türü ("Tanım" / "Definition", "Sayı" / "Number", "Formül" / "Formula", "İlişki" / "Relation"); `section` kartın ön yüzü ("1 mol nedir?" / "What is 1 mole?"); altta `bookmark` 16 `subtle` + `meta` "Kaydet" / "Save".
- **Veri:** `GET student/flashcard/tracks/{categorySubId}/subjects`, `GET student/flashcard/subjects/{lessonMainId}/units` (konu: `lessonSubId`, `name`, `cardCount`, `totalCards`, `studiedCount`, `masteredCount`, `weakCount`, `percentComplete`), kartlar `GET student/flashcard/session?mode=unit&lessonSubId=` (`items[]`: `id`, `cardKind`, `frontText`, `isSavedByMe`). Kart türü `cardKind`: 0 "Soru–cevap" / "Question–answer", 1 "Tanım" / "Definition", 2 "Doğru / yanlış" / "True / false", 3 "Boşluk doldurma" / "Fill in the blank", 4 "Karşılaştırma" / "Comparison". Çizimdeki "Sayı", "Formül", "İlişki" türleri API'de yok (bkz. §7).
- **Etkileşimler:** ders satırı → sağ taraf o dersin destelerine geçer (adres `?subject=`); deste → kartları (adres `?unit=`); kart → o kartla başlayan oturum (doğrulanmadı) ya da "Bu üniteyi çalış" (web bugünkü metin) → oturum `mode=unit`; "Kaydet" → §3.3.
- **Mobil:** bu bilgi bir push ekranında verilir: başlık ders adı, deste satırları (`ListRow` `cards` ikonu, başlık konu adı, alt satır "x/y kart · %z", sağda zayıf kart çipi), satır → oturum. Çizimi yoktur; ölçüler `m-test-konular` kalıbıyla aynı olmalıdır (doğrulanmadı).
- **Hâller:** ders seçilmedi: "Soldan bir ders seç."; destede kart yok: "Bu ünitede kart yok."; yükleniyor ve hata ortak.
- **Kurallar:** ekranda "ünite" yerine "deste" ya da konu adı yazılır (adlandırma; bugünkü kod "ünite" diyor, §7).

### `m-kart-bugun` Bugün · web: `w-kart-bugun` · bitti: `m-kart-bitti`

- **Görseller:** `acik/mobil/m-kart-bugun.png`, `acik/mobil/m-kart-bitti.png` (+ `koyu/mobil/`, `en/acik/mobil/`); `acik/web-panel/w-kart-bugun.png`
- **Çerçeve:** `AppHeader` varsayılan. Tab bar var, aktif yuva 2. Modül yıkaması.
- **Yerleşim (dolu):** aralık 12.
  1. `PageTitle` çip, başlık "Bugün" / "Today", alt satır "Aralıklı tekrar: unutmadan önce hatırla" / "Spaced repetition: recall before you forget".
  2. İlerleme kartı: `Card` dolgu 18, zemin modül gradyanı, kenarsız. Satır (aralık 16): `Ring` 84 pt, çizgi 9, değer beyaz, iz `rgba(255,255,255,0.3)`, ortada `headline` beyaz "12/32"; sağda `section` beyaz "20 kart kaldı" / "20 cards left", `small` beyaz %90 "Yaklaşık 6 dakika. Seri 7 gün." / "About 6 minutes. 7-day streak.", `Button tone=white size=sm icon=play` yazı `action` "Devam et" / "Continue".
  3. `SectionTitle` "Bugünün desteleri" / "Today’s decks".
  4. `List`: `ListRow` `Tile` 38 (`cards`), başlık "Kimya · Mol" / "Chemistry · Mole" (ders · konu), alt satır "12 kart" / "12 cards", sağda ok.
  5. Bilgi şeridi `Card tone=soft` (`line2` zemin) dolgu 14: `calendar` 18 `muted` + `small` "Yarın 18 kart tekrar zamanına gelecek." / "18 cards will be due tomorrow.".
- **Yerleşim (bitti, `m-kart-bitti`):** `PageTitle` "Bugün" (alt satır yok). `StateBlock tone=success` (dolgu 22 / 18 / 20, köşe 24, `card`, ortalı): 64 pt köşe 22 `successSoft` kutuda `checkCircle` 30 pt `successInk`; `section` 18 "Bugünkü kartlar bitti" / "Today’s cards are done"; `body` 15 / 22 "32 kartı tekrar ettin; 27’sini biliyordun. Yarın 18 kart tekrar zamanına gelecek." / "You reviewed 32 cards and knew 27. 18 come due tomorrow."; `Button module=flashcards block` "Kaydettiklerime bak" / "Open my saved cards"; `small` 700 `ink` bağlantı "Yeni bir desteye başla" / "Start a new deck". Altında ortalı satır (aralık 8): `flame` 16 `warningInk` + `small` 700 `warningInk` "Kart serisi 7 gün" / "7-day card streak".
- **Veri:** `GET student/flashcard/home` (`todayDueCount`, `dueReviewCount`, `newCardCount`, `reviewAgainCount`, `weakUnits`). Bugün yapılan (12/32), deste kırılımı (konu başına bugünkü kart), yarının sayısı, bitti ekranındaki "27’sini biliyordun", kart serisi: API'de doğrulanmalı (home yanıtında yok; seri için `engagement/today` olabilir).
- **Etkileşimler:** "Devam et" → oturum `mode=today` [push]; deste satırı → oturum `mode=today&lessonSubId=` [push]; bitti hâlinde "Kaydettiklerime bak" → yuva 4 [sekme değişimi], "Yeni bir desteye başla" → yuva 1 [sekme değişimi].
- **Hâller:** ilk kullanım (hiç tekrar yok, kart hiç çalışılmamış): "Bitti" yerine yeni kartlara çağıran `StateBlock` (çizimi yok; metin önerisi web'den "Yeni kartlar · Henüz görmediğin N kart"). Sıfır sayı "0 kart" diye gösterilmez.
- **Web farkı (`w-kart-bugun`):** `ModuleHead` aktif hap Bugün, başlık "Bugün", alt satır "32 kart tekrar zamanında · yaklaşık 8 dakika" / "32 cards due · about 8 minutes", sağda `Button tone=module icon=play` "Tekrara başla" / "Start review". Altında iki sütun `WCard` (dolgu 20): `Tile` 42, `headline` "Kimya · Mol", altında `Bar` 6 px (destenin bugünkü payı), sağda `Chip tone=module size=sm` "12 kart" / "12 cards". Bitti hâli webde çizilmedi; mobildeki `StateBlock` aynı metinlerle kullanılır.
- **Kurallar:** Bugün sekmesi bir sayfadır, doğrudan oturum açmaz; oturum düğmeyle başlar.

### `m-kart-on` Kart oturumu · ön yüz · `m-kart-arka` cevap · web: `w-kart-oturum` · tablet: `t-kart-el-yazisi`

- **Görseller:** `acik/mobil/m-kart-on.png`, `acik/mobil/m-kart-arka.png` (+ `koyu/mobil/`, `en/acik/mobil/`); `acik/web-panel/w-kart-oturum.png`; `acik/tablet/t-kart-el-yazisi.png`, `koyu/tablet/t-kart-el-yazisi.png`
- **Çerçeve:** odak ekranı. Tab bar yok, `AppHeader` yok. Zemin `linear-gradient(180deg, soft 0%, bg 70%)`. `FocusHeader` (dolgu 4 / 16 / 10, aralık 10): solda kapat (40 pt, `card`, `line` kenar, `x`), ortada `meta` "Kimya · Mol" / "Chemistry · Mole" ve `headline` 16 "Kart oturumu" / "Card session", sağ 40 pt boş; altında ilerleme çizgisi 5 pt, köşe 3, iz `line2`, dolgu `color` (çizimde %37). `BottomBar` (dolgu 12 / 18 / 34, aralık 10).
- **Yerleşim (ön yüz):**
  1. Kart alanı: esnek yükseklik, kenar boşluğu 6 / 20 / 0. Arkada iki deste katmanı (`card` rengi; `inset 24 18 -12` saydamlık %55; `inset 12 9 -5` saydamlık %80; köşe 28). Ön kart: köşe 28, `card` zemin, gölge `float`, dolgu 26, içerik dikey ortalı, aralık 14, metin ortalı.
  2. Kartın içinde: `Chip tone=module` kart türü "Tanım" / "Definition"; `meta` "Kimya · Mol"; `hero` 28 pt soru "1 mol nedir?" / "What is 1 mole?"; `Button tone=moduleSoft size=sm icon=refresh` "Çevir" / "Flip" (`soft` zemin, `ink` yazı). Kartın altında, 18 pt yukarıda sayaç `meta` "12 / 32".
  3. Kartın sağ üstünde yer imi (`bookmark`) — çizimde yok, bugünkü kodda var; kaydetme yolu budur (§3.3; konum doğrulanmadı).
  4. `BottomBar`: `small` ortalı "Önce kendin hatırlamaya çalış" / "Try to recall it first"; `Button size=lg block` `action` dolgu "Cevabı gör" / "Show answer".
- **Yerleşim (arka yüz, `m-kart-arka`):** aynı çerçeve. Kart içinde: çip "Cevap" / "Answer"; `meta` "Kimya · Mol"; `hero` 26 pt cevap "6,02 × 10²³ tanecik" / "6,02 × 10²³ particles"; `body` açıklama "Avogadro sayısı kadar atom, molekül ya da iyon içeren madde miktarı." / "The amount containing Avogadro’s number of particles."; sayaç. `BottomBar`: `small` "Ne kadar iyi hatırladın?" / "How well did you recall it?"; üç eşit kutu (aralık 8; her biri 62 pt yükseklik, köşe 18, `card` zemin, 1,5 `line` kenar, ortalı, aralık 2): `headline` 13,5 pt "Bilmiyorum" / "Don’t know" `errorInk` + `meta` "1 dk" / "1 min"; "Emin değilim" / "Not sure" `warningInk` + "6 dk" / "6 min"; "Biliyorum" / "I know it" `successInk` + "4 gün" / "4 days". Alt satır, o cevapla kartın ne zaman yeniden geleceğidir.
- **Veri:** `GET student/flashcard/session?mode=&categorySubId=&lessonSubId=&lessonMikroId=&skip=&take=15` → `items[]` (`id`, `cardKind`, `frontText`, `backText`, `explanation`, `isSavedByMe`, `learningLevel`, `nextReviewAt`), `hasMore`, `nextSkip`. Cevap `POST {id}/knowledge` `{outcome: 0 Correct | 1 Unsure | 2 Wrong, clientMutationId}`. Oturum sonu `POST session/finish`. Cevap kutularındaki aralık önizlemesi ("1 dk", "6 dk", "4 gün") API'de doğrulanmalı (kart başına üç aralık dönen alan yok). Sayaç: oturumdaki sıra / bugünkü toplam.
- **Etkileşimler:**
  - Karta dokunmak ya da "Cevabı gör" / "Çevir" → arka yüz [kart Y ekseninde döner; hareketi azaltta yalnız saydamlık geçişi 150 ms]. Arka yüzde karta dokunmak ön yüze döner.
  - Cevap kutusu (her biri ≥ 44 pt) → kayıt ve sonraki kart; basınca 0,97 ölçek; titreşim: Biliyorum hafif darbe, Bilmiyorum uyarı (öneri; Hareket-Standardi'nde kart anı yok, doğrulanmadı).
  - Kapat → §3.1 geri kuralı.
  - Yer imi → kaydet / kaldır.
- **Hâller:** yükleniyor (`LoadingLogo` ortada, "Oturum yükleniyor…"); sonraki sayfa yüklenirken kart alanı yerinde kalır, cevap kutuları kilitli değil (sonraki kart gelene kadar kısa gösterge); oturum boş: "Bu modda çalışılacak kart bulunamadı." ve "Kartlara dön"; cevap kaydedilemedi: kutular açılır, satır içi hata "Yanıtın kaydedilemedi.", kart değişmez.
- **Web farkı (`w-kart-oturum`):** `Immersive` (menü yok): üst çubuk 70 px: "Ara ver" / "Pause" (`ghost`, `x`), `Tile` 36, `headline` "Kart oturumu · Kimya · Mol" / "Card session · Chemistry · Mole", `meta` "12 / 32"; altında 4 px ilerleme çubuğu. İçerik ortalı (aralık 24), zemin `radial-gradient(60% 60% at 50% 40%, wash 0%, card 70%)`. Kart 600 × 330 px, köşe 28, `float` gölge, dolgu 30; arkasında tek `soft` katman (`inset 22 -18 -14 18`). Çizilen arka yüz: çip "Cevap", `meta` soru "1 mol nedir?", `display` 34 px cevap, `body` 16 açıklama. Altında üç cevap kutusu 170 × 70 px, köşe 20, aralık 12: "Bilmiyorum · 1", "Emin değilim · 2", "Biliyorum · 3" (tuş numarasıyla) + `meta` aralık. En altta `meta` "Boşluk: çevir · 1–3: puanla" / "Space: flip · 1–3: rate". Klavye: Boşluk çevirir, 1–3 cevaplar (ön yüzde 1–3 etkisiz).
- **Tablet farkı (`t-kart-el-yazisi`):** 1194 × 834 yatay, modül yıkaması. `SolveBar` kalem düğmeleri olmadan: kapat, `meta` "Kimya · Mol", `headline` "Kart oturumu"; ortada 300 × 5 pt ilerleme çizgisi; sağda `meta` "7 / 19". Satır (aralık 24, dolgu 10 / 40 / 34): solda kart (esnek, köşe 30, bir arka katman %55, ortalı, aralık 16: çip "Tanım", `meta` "Kimya · Mol", `hero` 38 pt "1 mol nedir?"); sağda 470 pt sütun (aralık 14): `Scratchpad` 430 pt yükseklik, başlık "Önce kendin yaz" / "Write it first", sayfa yerine "isteğe bağlı" / "optional", altta ortada küçük `PenToolbar` (kalem, fosforlu, silgi, dört renk, geri al, ileri al); `small` ortalı "Yazdığın kontrol edilmez; cevabı görünce kendin karşılaştırırsın." / "What you write is not checked; compare it with the answer yourself."; `Button size=lg block` "Cevabı gör". Yazılan, arka yüzde de yanda kalır (doğrulanmadı).
- **Kurallar:** cevap kutularının yazısı durum rengindedir, zemini nötr `card`; anlam yalnız renkle verilmez (kelimeler yazılı). "Önce kendin yaz" kontrol edilmez, sunucuya gönderilmez (`Tablet-Kalem.md` §3.5). Odak ekranında başka modül düğmesi yoktur.

### `m-kart-kaydedilen` Kaydedilenler · web: `w-kart-kaydedilen`

- **Görseller:** `acik/mobil/m-kart-kaydedilen.png` (+ `koyu/`, `en/acik/`); `acik/web-panel/w-kart-kaydedilen.png`
- **Çerçeve:** `AppHeader` varsayılan. Tab bar var, aktif yuva 4. Modül yıkaması.
- **Yerleşim:** aralık 12.
  1. `PageTitle` çip, başlık "Kaydedilenler" / "Saved", alt satır "Yıldızladığın 24 kart" / "24 starred cards" (sayı veriden).
  2. Ders süzgeç çipleri (aralık 8, 28 pt): seçili `moduleSolid` (`action` dolgu, beyaz yazı) "Tümü" / "All"; diğerleri `outline` (`card` zemin, 1,5 `line` kenar, `ink2` yazı) "Kimya", "Tarih", "Türkçe"… Sığmazsa yatay kayar.
  3. `List`: `ListRow` `Tile` 38 `bookmark`, başlık kartın ön yüzü ("1 mol nedir?"), alt satır ders adı, sağda ok.
  4. `Button tone=module size=lg block icon=play` "Kaydedilenleri tekrar et" / "Review saved cards".
- **Veri:** `GET student/flashcard/saved?skip=&take=` (oturum biçiminde `items[]`); ders adı kartın `lessonMainId`'sinden (adın eşlenmesi doğrulanmalı). Süzgeç istemci tarafında ya da API'de doğrulanmalı.
- **Etkileşimler:** süzgeç çipi → liste süzülür; satır → o kartla başlayan oturum `mode=saved` (doğrulanmadı); alt düğme → oturum `mode=saved` (seçili süzgeçle); satırda sola kaydırma ya da yer imi ile kaydı kaldırma çizilmedi (doğrulanmadı).
- **Hâller:** boş: `StateBlock` `bookmark` "Henüz kart kaydetmedin" ve "Kart oturumunda yer imine dokun." (web bugünkü metni), tek eylem "Bugünün tekrarına başla" (öneri; çizimi yok). Uzun liste sanallaştırılır, sayfalı çekilir (`skip/take`).
- **Web farkı:** `ModuleHead` aktif hap Kaydedilenler, başlık "Kaydedilenler", alt satır "Yıldızladığın 24 kart", sağda `Button tone=module icon=play` "Hepsini tekrar et" / "Review all". Altında tek `List`: `bookmark` satırları, alt satır "Kimya · Mol" (ders · deste). Süzgeç çipleri webde çizilmedi.
- **Kurallar:** ikon `bookmark`, fiil "kaydet"; "yıldız" sözcüğü ikonla uyuşmuyor (bkz. §7).

## 5. Takılma ve kilitlenme önlemleri

- **Çift gönderim:** cevap kutusuna dokununca istek bitene kadar üç kutu kilitlidir (`busy`); aynı kart iki kez sayılmaz. Her cevap `clientMutationId` taşır; yeniden deneme aynı kimlikle gider, sunucu ikinciyi yok sayar.
- **Zaman aşımı:** oturum ve cevap istekleri zaman aşımı süresinde (okuma 25 sn, gönderim 60 sn; [Navigasyon](Navigasyon.md) §6.1) dönmezse hata hâli ve "Tekrar dene"; kart alanı donmaz.
- **Kaldığı yerden devam:** oturumun süresi yoktur. Her cevap anında kayıtlıdır; uygulama arka plana geçse de oturum ekranı ve kart yerinde kalır. Uygulama kapanırsa kalan kartlar sonraki "bugün" oturumunda gelir. Arka plana geçerken ve çıkışta `session/finish` bir kez gönderilir (yalnız en az bir kart cevaplandıysa).
- **Sayfalama:** oturum 15'er kart çeker; son 3 karta gelince sonraki sayfa arka planda istenir, bekleme görünmez. `hasMore=false` ve kart kalmadıysa bitti.
- **Ağ kopması:** çevrimdışı şeridi; çevrilen kart okunabilir kalır, cevap gönderilemezse kart değişmez ve hata gösterilir.
- **Geri tuşu:** her ekranda çalışır; oturumdan çıkış onayı (cevap varsa) iptal edilebilir ve geri hareketiyle kapanır. Bitti ekranı `replace` ile açılır.
- **Uzun liste:** dersler, desteler ve kaydedilenler sanallaştırılır; son satır yüzen tab barın altında kalmaz.
- **Yükleme donmaz:** ilk yükleme `LoadingLogo`, yenileme içeriği yerinde bırakır. Çekip yenileme listelerde var, oturumda kapalı.
- **Kart çevirme:** çevirme sırasında ikinci dokunuş animasyonu bozmaz (dönüş bitene kadar yok sayılır); hareketi azaltta dönüş yerine saydamlık geçişi.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| K1 | görsel | ikisi | `m-kart-vitrin`, `w-kart-vitrin` | Örnek veri, açık ve koyu tema | PNG ile aynı; vitrin sayısı bugün tekrar zamanı gelen kartlar |
| K2 | e2e | mobil | §3.1 | "Tekrara başla" → 32 kart cevapla | Her cevapta tek `knowledge` isteği; sonda `session/finish` bir kez; `m-kart-bitti` doğru sayılarla |
| K3 | birim | ikisi | oturum | Cevap kutusuna iki kez hızlı dokun | Yalnız bir istek; ikinci dokunuş yok sayılır |
| K4 | birim | ikisi | oturum | Ön yüzde "Cevabı gör" | Arka yüz; cevap kutuları görünür; ön yüzde cevap kutusu yok |
| K5 | birim | web | oturum | Boşluk, 1, 2, 3 tuşları | Boşluk çevirir; arka yüzde 1–3 cevaplar; ön yüzde 1–3 bir şey yapmaz |
| K6 | birim | ikisi | oturum | 16. karta gel | Sonraki sayfa beklemesiz gelir; sayaç doğru |
| K7 | e2e | ikisi | oturum | 3 kart cevapla, kapat | Onay sorulur; "Ara ver" ile çıkılır; `session/finish` gider; sonra kalan kartlar bugünde |
| K8 | birim | ikisi | oturum | Cevap isteği hata verir | Kart değişmez, satır içi hata, kutular yeniden açılır |
| K9 | birim | ikisi | oturum | Yer imine dokun, sonra Kaydedilenler'i aç | Kart listede; kaldırınca listeden çıkar |
| K10 | e2e | mobil | Bugün | Tab yuva 2 | Sayfa açılır (oturum değil); "Devam et" oturumu açar |
| K11 | e2e | mobil | Bugün | Bugünkü tekrar bitmiş hesap | `m-kart-bitti` görünümü; "Kaydettiklerime bak" yuva 4'e geçer |
| K12 | e2e | ikisi | Kaydedilenler | Kaydı olmayan hesap | Boş hâl, tek eylem |
| K13 | e2e | ikisi | Ders → deste | Ders → konu → oturum | Oturum yalnız o konunun kartlarıyla (`mode=unit`) |
| K14 | görsel | ikisi | tümü | TR ve EN | `en/` PNG'leriyle aynı; yüzde TR `%62`, EN `62%` |
| K15 | birim | ikisi | tümü | Metin taraması | "Kelime Kartları", "Knowledge cards", "Lens", "quiz" yok; "ünite" yok |
| K16 | erişilebilirlik | ikisi | oturum | Kontrast açık/koyu | Cevap kutusu yazıları (`errorInk`, `warningInk`, `successInk`) `card` zeminde ≥ 4,5:1; "Cevabı gör" beyaz yazı `#DB2777` üstünde ≥ 4,5:1 |
| K17 | erişilebilirlik | ikisi | oturum | Ekran okuyucu | Kart "Ön yüz: 1 mol nedir?" diye okunur; çevirince "Cevap: …" duyurulur; kapat, yer imi, cevap kutularının adı var |
| K18 | erişilebilirlik | ikisi | tümü | En büyük yazı / %200 yakınlaştırma | Kart metni kesilmez, kart kayar; cevap kutularındaki etiketler iki satıra iner, kesilmez |
| K19 | birim | mobil | tümü | Dokunma alanları | Cevap kutuları, yer imi, süzgeç çipleri ≥ 44 pt / 48 dp, aralarında ≥ 8 pt |
| K20 | birim | ikisi | oturum | Hareketi azalt açık | Kart dönmez, 150 ms saydamlık geçişi |
| K21 | görsel | tablet | `t-kart-el-yazisi` | Kalemle yaz, "Cevabı gör" | Yazı kontrol edilmez, gönderilmez; cevap görünür |
| K22 | birim | ikisi | abonelik | 403 abonelik | Paket kartı; ödeme düğmesi `#C2410C` |
| K23 | görsel | mobil | tümü | Koyu tema | Modül rengi `#F472B6`, yazı `ink` `#F8AAD3`, düğme dolgusu `#DB2777` |

## 7. Çizim ile bugünkü kod arasındaki farklar

Mobil: `C:\Users\onurc\Desktop\sinavika_mobile_reactnative\src\modules\flashcard\`. Web: `C:\Users\onurc\source\repos\sinavika_frontend_student\src\features\flashcard\`.

1. **Bugün ve Kaydedilenler sekmeleri (mobil):** `presentation/navigation/FlashcardModeStackNavigator.tsx` iki sekmede de doğrudan kart oturumu açıyor (`mode=today`, `mode=saved`). Çizimde ikisi de sayfadır (`m-kart-bugun`: ilerleme halkası, bugünün desteleri, yarın satırı; `m-kart-kaydedilen`: süzgeç, kart listesi, tekrar düğmesi). İki sayfa mobilde yok.
2. **Oturum sonu (mobil):** `FlashcardSessionScreen.tsx` "Bu oturum tamamlandı." ve "Kataloğa dön" gösteriyor (+ geri bildirim anketi). Çizimdeki `m-kart-bitti` (kaç kart, kaçı bilindi, yarın kaç kart, kart serisi, "Kaydettiklerime bak") yok. Web `FlashcardSessionPage.tsx` "Oturum bitti · {n} kartı tamamladın." ve "Kartlara dön".
3. **Vitrin (mobil):** `FlashcardCatalogScreen.tsx` sayfalı iki slayt (bugün + "N kart tekrar istiyor"), istatistik kartı, "Çalışılan dersler", tam katalog ağacı (`FlashcardBrowseTree.tsx`: sınav → ders → ünite) ve "Zayıf üniteler" gösteriyor. Çizim: tek vitrin kartı ve ders listesi ("N deste · %X öğrenildi", "N bugün" çipi).
4. **Cevap düğmeleri:** iki uygulamada kutuların altında aralık önizlemesi ("1 dk", "6 dk", "4 gün") yok; API'de de bu alan yok. Mobil EN "I don’t know"; çizim "Don’t know". Mobil ön yüzde önceki/sonraki ok düğmeleri ve "Cevabı gör" hapı var; çizimde ok yok, kartın içinde "Çevir" var. Kart etiketi mobil "Ön yüz" / "Arka yüz", web "Soru" / "Cevap"; çizimde ön yüzde kart türü ("Tanım"), arka yüzde "Cevap".
5. **Bugün (web):** `FlashcardTodayPage.tsx` dört kuyruk kartı (Tekrar zamanı gelenler, Yeni kartlar, Zorlandıkların, Kaydettiklerin; her birinde "Çalış") ve zayıf üniteler; çizim: bugünün desteleri ızgarası ve tek "Tekrara başla".
6. **Kaydedilenler (web):** `FlashcardSavedPage.tsx` yalnız sayı kartı ve "Hepsini tekrar et"; çizimdeki kart listesi yok.
7. **Vitrin (web):** `FlashcardHomePage.tsx` başlık kartında "Yeni deste" düğmesi yok; ders kartlarında "deste" sayısı ve "N bugün" çipi yerine "x/y kart · %z öğrenildi" ve "Yeni" çipi; afişte halka yok. Alt satır "{ders} ders · {due} kart tekrar bekliyor · {fresh} yeni kart".
8. **Gözat (web):** `FlashcardBrowsePage.tsx` sağ tarafta destenin kartlarını değil üniteleri (konuları) listeliyor; kart ızgarası ve kart başına "Kaydet" yok. "Ünite" sözcüğü ekranda görünüyor ("Üniteler", "Bu üniteyi çalış"); mobil katalog da "Zayıf üniteler", "Ünite bulunamadı" diyor.
9. **Deste oluşturma:** iki uygulamada Bilgi Kartları içinde deste oluşturma yok. SinoAI'nin ürettiği kartlar (`GET student/flashcard/personal`) yalnız SinoAI kütüphanesinde gösteriliyor (mobil `modules/sinoai/presentation/screens/SinoAiLibraryScreen.tsx`); Bilgi Kartları vitrininde ya da Bugün'de görünmüyor (doğrulanmadı: bugün oturumuna girip girmediği).
10. **Kart türleri:** çizim `w-kart-gozat`'ta "Sayı", "Formül", "İlişki" türleri var; API `cardKind` yalnız Soru–cevap, Tanım, Doğru / yanlış, Boşluk doldurma, Karşılaştırma.
11. **Çizim içi küçük farklar:** `w-kart-bugun` çizimi `ModuleHead`'e `tabs` vermediği için hap sekmelerde Gözat yok (diğer üç web çiziminde var). Kaydedilenler alt satırı "Yıldızladığın 24 kart" diyor; ikon `bookmark`, fiil "kaydet". `FlashcardFace` sayaç metni `mod.color` ile çizilmiş (yazı için kural `ink`). Mobil çizimde ders → deste ara ekranı yok. Tablet sayaç "7 / 19", mobil ve web "12 / 32" (örnek veri). `w-kart-kaydedilen` EN alt satırı yalnız ders adı ("Chemistry"), TR "Kimya · Mol".
12. **Hak / abonelik:** iki uygulamada abonelik hâli var (mobil `components/FlashcardAccessLocked.tsx`, web `pages/_components/FlashcardAccessGate.tsx`); çizimi yok. Mobil katalog boş metni "Abonelik / kategori profilini kontrol et." öğrenciye teknik geliyor.
