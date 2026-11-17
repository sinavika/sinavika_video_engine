# SinoAI · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/SinoAI.tsx`, `Screens/Mobile/States.tsx` (`SinoLimitScreen`), `Screens/Mobile/Gaps.tsx` (`SinoSourcesScreen`, `SinoStudyNoteScreen`), `Screens/Web/SinoWeb.tsx`, `Screens/Web/GapsWeb.tsx` (`WebSinoSourcesScreen`, `WebSinoStudyNoteScreen`), `Parts/Study.tsx` (`StateBlock`)
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).

## 1. Modül özeti

- **Ne işe yarar:** Öğrencinin hedefini ve son denemesini bilerek soru çözen, konu anlatan ve çalışma üreten (deneme, test, tekrar kartları, çalışma planı, özet) sohbet asistanı. İki kipi var: **Sohbet** (soru-cevap) ve **Çalışma** (üretim). Ana iş: takıldığı yeri sormak ya da kendine çalışma üretmek ve üretileni ilgili modülde açmak.
- **Anahtar:** `sinoAi` · kod adları: API `SinoAI` (klasör bugün `SinosAI`), web özelliği `sinoai`, mobil modül `sinoai`, rota öneki `SinoAi`. Uç tabanı bugün `student/sinoai` (sohbet) ve `student/generations` (üretim, kaynak, not). `ModuleIdentity.ts`'teki `route: '/api/student/sino-ai'` bugünkü uçla aynı değil (§7).
- **Renk: yok.** SinoAI beyaz zemin ve gri tonlarla çizilir (ChatGPT / Gemini sadeliği). Sayfa zemini `card` (açık temada beyaz), yazı `ink`, ikincil `ink2`, `muted`, yer tutucu `subtle`, balon ve kutu zemini `line2`, kenar `line`. Gönder düğmesi `ink` zemin, `card` ikon. Modül yıkaması ve gradyan yok. Kayıtlı "kimlik" değerleri yalnız modül karosu ve hub için: `color` `#475569` / `#CBD5E1`, `action` `#475569`, `ink` `#475569` / `#DDE4EC`, gradyan ikinci durak `#94A3B8`.
- **Renk kuralı istisnası:** başka modülü açan öğe o modülün rengindedir (üretim kartında "Testi aç" Testler `#4F46E5`; kütüphanede satır karoları modül rengi).
- **Marka işareti:** `sparkles` ikonu, `ink` renginde, çizgi kalınlığı 1,6 (`Mark`). Logo ya da renkli kıvılcım kullanılmaz.
- **Mobil sekme çubuğu: yok.** SinoAI tam ekrandır (Modul-Kimligi §6). Üstte menü, Sohbet · Çalışma geçişi ve yeni sohbet; solda açılan menü geçmişi ve kütüphaneyi taşır. Çıkış: menüdeki çıkış satırı ya da sistem geri hareketi.
- **Web:** sol menüde "Modüller" altında yedinci satır "SinoAI", ikon `sparkles`. Sayfa panel içinde tek beyaz çerçeve: solda geçmiş sütunu, ortada sohbet sütunu. Hap sekme yok. Yollar: `/student/sinoai` (sohbet), `/student/sinoai/uret` (çalışma), `/student/sinoai/kutuphane`, `/student/sinoai/kaynaklarim`, `/student/sinoai/kutuphane/not/[id]`.
- **Yapay zekâ notu:** her yazma kutusunun altında "SinoAI bir yapay zekâ; hata yapabilir. Önemli bilgileri kontrol et." / "SinoAI is an AI and can make mistakes. Check important facts." (UX-Kurallari 92). Çalışma notunda kısa biçimi: "SinoAI hata yapabilir; önemli bilgileri doğrula."
- **Sözcükler:** SinoAI'ye "koç" denmez; "test" (asla "quiz"); sohbet kişisi kendini SinoAI diye tanıtmaz, selam öğrencinin adıyla.

## 2. Ekran haritası

Kısaltmalar: **M** = `sinavika_mobile_reactnative/src/modules/sinoai/presentation/`, **W** = `sinavika_frontend_student/src/features/sinoai/`.

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-sino-ana` | mobil | SinoAI (karşılama) | `SinoAi` | M `screens/SinoAiChatScreen.tsx` + `components/SinoAiWelcome.tsx` (giriş: `src/modules/hub/presentation/navigation/ModuleHubNavigator.tsx` `SinoAi`) | ilk / boş sohbet |
| `w-sino-sohbet` | web | SinoAI sohbet | `/student/sinoai` | W `pages/SinoAiStartPage.tsx` (`view="chat"`), `pages/SinoAiChatPage.tsx` (`/student/sinoai/[conversationId]`) | dolu |
| `m-sino-sohbet` | mobil | SinoAI · sohbet | `SinoAiChat` | M `screens/SinoAiChatScreen.tsx`, `components/SinoAiMessageItem.tsx`, `components/SinoAiComposer.tsx` | dolu |
| `m-sino-menu` | mobil | SinoAI · menü | `SinoAiChat (menü)` | M `components/SinoAiHistoryDrawer.tsx` | açık menü |
| `m-sino-calisma` | mobil | SinoAI · çalışma | `SinoAiChat (Çalışma)` | M `components/SinoAiStudyPane.tsx` | dolu |
| `w-sino-calisma` | web | SinoAI çalışma | `/student/sinoai/uret` | W `pages/SinoAiStartPage.tsx` (`view="produce"`) | dolu |
| `m-sino-sonuc` | mobil | SinoAI · üretim sonucu | `SinoAiChat (Çalışma sonucu)` | M `components/SinoAiRunCard.tsx` | bitti |
| `m-sino-kutuphane` | mobil | SinoAI · kütüphane | `SinoAiLibrary` | M `screens/SinoAiLibraryScreen.tsx` | dolu |
| `w-sino-kutuphane` | web | SinoAI kütüphane | `/student/sinoai/kutuphane` | W `pages/SinoAiLibraryPage.tsx` | dolu |
| `m-sino-kaynaklar` | mobil | SinoAI · kaynaklarım | `SinoAiSources` | M `screens/SinoAiSourcesScreen.tsx` | dolu |
| `w-sino-kaynaklar` | web | Kaynaklarım | `/student/sinoai/kaynaklarim` | W `pages/SinoAiSourcesPage.tsx` | dolu |
| `m-sino-not` | mobil | SinoAI · çalışma notu | `SinoAiStudyNote` | M `screens/SinoAiStudyNoteScreen.tsx` | dolu |
| `w-sino-not` | web | Çalışma notu | `/student/sinoai/kutuphane/not/[id]` | W `pages/SinoAiStudyNotePage.tsx` | dolu |
| `m-sino-hak` | mobil | SinoAI · günlük hak doldu | `SinoAi` | kısmen: sayaç ve kilitli yazma kutusu `SinoAiComposer.tsx` | hak |

İlgili, başka belgede: `t-ders-sinoai-panel` (ders adımında yan panel; [04-Dersler.md](04-Dersler.md) ve `Tablet-Kalem.md`), `s-sinoai-misafir` (web sitesi). Her modüldeki "SinoAI’ye sor" düğmesi bu modülün sohbetini bağlamla açar (mobil `components/SinoAiAskButton.tsx`, web `components/SinoAiAskButton.tsx`).

## 3. Süreçler (akışlar)

### 3.1 SinoAI'yi açmak
1. Giriş noktaları: Modüller ana ekranındaki SinoAI satırı; herhangi bir modülde "SinoAI’ye sor" (bağlam: kaynak modül, konu, soru, analiz); Akıllı Özet hak doldu ekranı.
2. Mobil: `SinoAi` [tam ekran modal, `fullScreenFlow`; sekme çubuğu gizli] → yığının kökü `SinoAiChat`. Bağlamsız açılışta boş sohbet `m-sino-ana`; bağlamlı açılışta yeni sohbet bağlam kartıyla `m-sino-sohbet`. Web: `/student/sinoai` [sayfa].
3. Veri: `GET student/sinoai/capabilities` (`enabled`, `modes`, `toolsEnabled`, `attachmentsEnabled`, `usage`). `enabled = false` → "SinoAI şu an kullanılamıyor." hâli ve geri. Misafir ya da yüzey kapalıysa mobil geri döner.
4. Çıkış: mobil menüdeki çıkış satırı, sistem geri hareketi (sohbet ekranında) ya da Android geri → SinoAI'yi açan ekran. Yazılmış ama gönderilmemiş metin sohbet başına taslak olarak saklanır.

### 3.2 Mesaj göndermek ve yanıtın akması
1. Yazma kutusuna yazılır → gönder (yukarı ok) → yoksa önce `POST student/sinoai/conversations` (yeni sohbet, `origin`) → `POST .../conversations/{id}/messages` (`{content, mode}`), yanıt SSE akışıdır.
2. Öğrencinin mesajı hemen sağda gri balonda görünür (8 pt yükselerek 240 ms). Gönder düğmesi "Durdur" (kare) olur.
3. İlk parça gelene kadar SinoAI işaretinin yanında **düşünüyor noktaları** (üç nokta, izinli tek döngü; §4.3).
4. `delta` olayları geldikçe metin parça parça yazılır; aynı metin iki kez harf harf yazılmaz; ekran alta yapışık kayar (öğrenci yukarı kaydırırsa yapışma bırakılır, "en alta" düğmesi çıkar).
5. `citations` → kaynak bağlantıları yanıtın altında; `tool_suggestion` → öneri kartı ("Öneri", "Hazırla" / "Hayır"); `done` → eylem ikonları ve öneri çipleri görünür.
6. Hata: `error` ya da bağlantı kopması → yanıtın altında "Bağlantı koptu; cevap tamamlanamadı." ve "Yeniden üret" (`POST .../messages/{mid}/regenerate`). Durdur → `POST .../messages/{mid}/cancel`; yazılan kısım kalır.
7. Hak dolu → gönderim yapılmaz; yazma kutusu kilitli hâle geçer (§4.9).

### 3.3 Çalışma üretmek
1. Üstte "Çalışma" → `m-sino-calisma` [aynı ekranda kip değişimi; animasyonsuz, seçim titreşimi]. Web: geçmiş sütununda "Çalışma üret" ya da yazma kutusundaki "Çalışma üret" çipi → `/student/sinoai/uret`.
2. Araç satırına dokunma (Deneme oluştur, Tekrar kartları oluştur, Test oluştur, Çalışma planı oluştur; webde ayrıca Özet çıkar) → araç formu (`GET student/sinoai/tools/{code}/form`; kaynak seçimi: not, PDF ya da konu) [alt sayfa / iletişim kutusu] → `POST .../conversations/{id}/tool-calls` → `accept`.
3. Üretim kartı sohbet akışına eklenir; durum `GET student/generations/runs/{id}` yoklaması (web: `GET .../runs/{id}/events` SSE). Ara durumlar: Sırada, Hazırlanıyor · %N.
4. Hazır → `m-sino-sonuc`: kartta "Testi aç" (üretilen türe göre: Testi aç / Denemeyi aç / Kartları aç / Planı aç / Notu aç) → ilgili modül ekranı [push; o modülün yığını]; "Değiştir" → aynı araç formu önceki seçimlerle açılır → yeni üretim.
5. Çalışma planı önerisinde kart "Planıma uygula" (`POST .../runs/{id}/apply-study-plan`) / "Şimdilik değil" / "Planımı aç" sunar.
6. Öğrenci ekrandan çıkabilir; üretim sürer, bitince bildirim gelir ve sonuç kütüphanede olur.

### 3.4 Menü, geçmiş, yeni sohbet, kütüphane
1. Mobil sol üst `menu` → `m-sino-menu` [soldan çekmece, 300 pt; karartma]. Web: geçmiş sütunu her zaman açık (dar ekranda çekmece).
2. "Sohbetlerde ara" → başlıklarda arama (yerel süzme ya da uç doğrulanmadı). Geçmiş satırı → o sohbet (`GET .../conversations/{id}/messages`) [çekmece kapanır].
3. "Yeni sohbet" (menüde ya da sağ üst `newChat`) → boş sohbet `m-sino-ana` [aynı ekran; yeni sohbet ilk mesajda oluşturulur].
4. "Kütüphanen" → `m-sino-kutuphane` [push]. Kütüphane satırı → ilgili modülde açar. Kaynaklarım → `m-sino-kaynaklar` [push]; not satırı → `m-sino-not` [push].
5. Sohbet satırına uzun basma (mobil) / satır menüsü (web) → sabitle, yeniden adlandır (`PATCH`), sil (onay; "Hazırlanan testler, kartlar ve notlar kütüphanende kalır." → `DELETE`).

## 4. Ekranlar

### 4.1 Ortak parçalar (mobil `SinoAI.tsx`, web `SinoWeb.tsx`)
- **`SinoPhone` (mobil çerçeve):** `Phone` zemini `card` (beyaz); durum çubuğu koyu yazı; sekme çubuğu yok; modül yıkaması yok.
- **`SinoTop` (mobil üst satır):** 4 / 10 / 8 boşluk, aralık 6. Solda `menu` ikon düğmesi (40 × 40, zeminsiz, ikon 22 `ink`; ad "Menü" / "Menu"). Ortada esnek alan, iki metin sekmesi ortalı, aralarında 18: "Sohbet" / "Chat" ve "Çalışma" / "Study" (`headline` 15; seçili `ink`, seçili değil `muted`); seçilinin altında 18 × 2,5 köşe 2 `ink` çizgi (seçili değilde saydam). Sağda `newChat` ikon düğmesi (40 × 40; ad "Yeni sohbet" / "New chat").
- **`Composer` (mobil yazma kutusu):** dış 8 / 14 / 18 boşluk. Kutu: köşe 26, `card` zemin, 1 px `line`, `card` gölge, 12 / 10 / 10 / 16 boşluk. Üstte yer tutucu (`body`, `subtle`): varsayılan "SinoAI’ye sor" / "Ask SinoAI"; sohbet içinde "Devam et…" / "Reply…"; Çalışma'da "Ya da ne istediğini yaz…" / "Or describe what you need…". Altında 10 pt boşlukla düğme satırı (aralık 8): `plus` (32 daire, 1 px `line`, ikon 18 `ink2`; ad "Ekle" — dosya, araç, yanıt kipi menüsü), `camera` (32 daire, ikon 17; ad "Fotoğraf çek"), esner, gönder (34 daire, `ink` zemin, `up` 18 `card` renkte, kalınlık 2,4; ad "Gönder"). Kutunun altında 8 pt ile yapay zekâ notu (`meta`, ortalı). Kutu yazdıkça 6 satıra kadar büyür, sonra içinde kayar (doğrulanmadı). Klavye açılınca kutu klavyenin üstüne çıkar, not görünür kalır.
- **Web `Composer`:** köşe 28, `card` zemin, 1 px `line`, `float` gölge, 16 / 14 / 12 / 20 boşluk; yer tutucu `body` 15,5 `subtle`; 14 pt altında çipler (34 yükseklik, köşe 17, 1 px `line`, 0 / 12 boşluk, ikon 16 `ink2`, `small` 600): `plus` "Dosya ekle" / "Attach", `layers` "Çalışma üret" / "Create"; sağda gönder 38 daire (`up` 19). Altında `Disclaimer` (`meta`, ortalı, 8 pt üst boşluk). Enter gönderir, Shift+Enter satır atlar.
- **`HistoryColumn` (web geçmiş sütunu):** 250 px, sağda 1 px `line` ayırıcı, 16 sağ boşluk, satır aralığı 2. Satır: 9 / 10 boşluk, köşe 10, ikon 17 `ink2`, `small`; seçili satır `line2` zemin ve 700. Sıra: `newChat` "Yeni sohbet" / "New chat" (700), `layers` "Çalışma üret" / "Create study work", `bookmark` "Kütüphanen" / "Your library"; `over` "Bugün" / "Today" ve sohbet başlıkları; `over` "Bu hafta" / "This week" ve başlıklar. Başlık tek satır, sığmazsa `…`.
- **`SinoFrame` (web çerçeve):** `Panel active="sinoAi"` içinde, köşe 24, `card` zemin, 1 px `line`, 18 boşluk; solda `HistoryColumn`, sağda ortalı içerik sütunu (sohbet ve çalışma 720 px, kütüphane 760 px).
- **Yanıt eylem ikonları:** yanıtın altında aralık 14 (web 16), ikon 18 `muted`: `bookmark` (kaydet), `refresh` (yeniden üret), `cards` (kart yap); webde ayrıca `quiz` (test üret). Her birinin erişilebilir adı vardır; dokunma alanı 44 pt.

### 4.2 `m-sino-ana` SinoAI (karşılama)
- **Görseller:** `acik/mobil/m-sino-ana.png`, `koyu/mobil/m-sino-ana.png`, `en/acik/mobil/m-sino-ana.png`.
- **Çerçeve:** `SinoPhone`, `SinoTop` (Sohbet seçili), altta `Composer` (varsayılan yer tutucu).
- **Yerleşim:** içerik 70 / 20 / 10 boşluk, aralık 18:
  1. `Mark` 34 ve 12 pt altında karşılama (`display` 28 / 34): "Merhaba Ayşe." / "Hi Ayşe." ve yeni satırda `muted` "Bugün neye takıldın?" / "Where are you stuck today?". Ad profilden.
  2. Dört öneri satırı (aralık 8): 13 / 14 boşluk, köşe 16, 1 px `line`, ikon 19 `ink2`, metin `body` `ink`: `camera` "Sorunun fotoğrafını çek, adım adım çöz" / "Snap a question, solve it step by step"; `book` "Türevde zincir kuralını anlat" / "Explain the chain rule"; `quiz` "Eksiklerimden 10 soruluk test hazırla" / "Make a 10-question quiz from my gaps"; `note` "Notlarımı tek sayfada özetle" / "Summarise my notes on one page".
  3. `meta`: "SinoAI hedefini (YKS · 78 net) ve son denemeni bilerek yanıtlar." / "SinoAI answers with your goal (YKS · 78) and last exam in mind." (hedef veriden).
- **Veri:** `capabilities`; öğrenci adı ve hedef (profil, hedef net; kaynak uç doğrulanmadı); öneri satırları istemcide sabit ya da öğrencinin son eksiklerinden (doğrulanmadı).
- **Etkileşimler:** öneri satırı → metni gönderir (fotoğraf önerisi kamerayı açar); yazma kutusu → §3.2; `menu` → `m-sino-menu`; "Çalışma" → `m-sino-calisma`.
- **Hâller:** yükleniyor (`LoadingLogo` ortada; ilk açılış); kapalı → `StateBlock` "SinoAI şu an kullanılamıyor."; hak dolu → `m-sino-hak`; çevrimdışı → sarı şerit, gönder pasif.
- **Web farkı:** web karşılaması `w-sino-sohbet` çerçevesinde; bugünkü başlık "Bugün ne çalışalım?" (çizilmedi; `w-sino-calisma` düzeni örnek alınır).
- **Kurallar:** SinoAI kendini tanıtmaz ("Merhaba, ben SinoAI" yok); selam öğrencinin adıyla.

### 4.3 `m-sino-sohbet` SinoAI · sohbet · web: `w-sino-sohbet`
- **Görseller:** `acik/mobil/m-sino-sohbet.png`, `koyu/mobil/m-sino-sohbet.png`, `en/acik/mobil/m-sino-sohbet.png`; `acik/web-panel/w-sino-sohbet.png`, `koyu/web-panel/w-sino-sohbet.png`, `en/acik/web-panel/w-sino-sohbet.png`.
- **Çerçeve:** `SinoPhone`, `SinoTop` (Sohbet), altta `Composer` "Devam et…".
- **Yerleşim (mobil, 10 / 20 boşluk, aralık 16):**
  1. Öğrenci mesajı (sağa yaslı, aralık 8):
     - Ek görsel: fotoğraflanan soru kâğıdı 176 pt genişlik, 10 / 12 boşluk, köşe 12, `#FBF8F1` zemin, 1 px `line`, gölge `0 6px 14px -8px rgba(15,23,42,.35)`, −2° eğik; içinde "12. soru" (`meta` 10), soru metni (`body` 13 / 18), şıklar (`meta` 10). Gerçek uygulamada eklenen görselin küçük resmi; dokununca tam ekran.
     - Metin balonu: en çok 270 pt, 10 / 14 boşluk, köşe 20, `line2` zemin, `body` `ink`: "Bu soruda neden 6x ile çarpıyoruz?" / "Why do we multiply by 6x here?"
  2. SinoAI yanıtı (sola yaslı, balonsuz, aralık 12): `Mark` 22; paragraflar `body` 15,5 / 24 `ink`; formül kutusu (12 / 14 boşluk, köşe 14, `line2`, `headline` 15) `f'(x) = 4(3x² − 2)³ · 6x`; ikinci paragraf "x = 1 için içerisi 1 olur, sonuç 24. Bu konu son denemende 1 net kaybettirdi."; eylem ikonları (§4.1).
  3. Öneri çipleri (sarar, aralık 8, `Chip tone="outline"`): "Benzer bir soru ver" / "Give a similar one", "Daha basit anlat" / "Simpler please", "Kart yap" / "Make a card".
- **Düşünüyor hâli (çizilmedi, kural `UI_MOTION_MOMENTS.sinoThinking`):** yanıtın yerinde `Mark` 22 ve yanında üç nokta; noktalar sırayla solar (izinli tek döngü); renk `muted`; nokta ölçüsü ve süresi çizimde yok (doğrulanmadı). "Hareketi azalt" açıkken döngü durur, yerine sabit "Düşünüyor…" yazısı.
- **Akış hâli:** yanıt metni gelen parçalarla uzar; parça sonunda imleç gösterilmez (doğrulanmadı); `done` gelene kadar eylem ikonları ve öneri çipleri gizli; gönder düğmesi "Durdur".
- **Veri:** `GET .../conversations/{id}/messages`; akış olayları `message`, `delta`, `citations`, `tool_suggestion`, `done`, `error`; geri bildirim `POST .../messages/{mid}/feedback`; ek `POST .../attachments`.
- **Etkileşimler:** öneri çipi → metni gönderir; `bookmark` → kaydet; `refresh` → yeniden üret; `cards` → bu yanıttan kart üret; yanıta uzun basma → kopyala, paylaş, beğen / beğenme (bugünkü kod); `camera` → kamera ile ek; `plus` → menü (Dosya ekle, Araçlar, yanıt kipi Hızlı / Dengeli / Derin).
- **Hâller:** bağlantı koptu → yanıt altında hata satırı ve "Yeniden üret"; sohbet yüklenemedi → yerinde "Sohbet yüklenemedi." ve "Tekrar dene"; hak doldu → `m-sino-hak` düzeni.
- **Web farkı (`w-sino-sohbet`):** `SinoFrame`. İçerik sütununun üstünde başlık satırı (24 pt sol boşluk, 10 alt): sohbet başlığı "Türevde zincir kuralı" (`headline`) ve sağda `cards` 18 ve `more` 20 (`muted`). Sohbet sütunu 720 px, aralık 22, üstten 16: öğrenci balonu en çok 520 px, 12 / 18 boşluk, köşe 22, `body` 15,5; yanıt `sparkles` 24 + paragraflar `body` 16 / 26, formül kutusu 14 / 18 boşluk `headline` 16 ("f'(x) = 4(3x² − 2)³ · 6x → f'(1) = 24"), son paragraf "Bu konu son denemende 1 net kaybettirdi. İstersen benzer 3 soruyla pekiştirelim."; eylem ikonları dört adet; öneri çipleri (38 px sol girinti, 34 yükseklik, 13 pt): "Benzer 3 soru ver" / "Give 3 similar", "Daha basit anlat", "Bunu kart yap" / "Make a card". Altta `Composer` "Devam et…" ve `Disclaimer`. Klavye: Enter gönder, Esc akışı durdurur (doğrulanmadı).
- **Kurallar:** yanıt parça parça yazılır (UX-Kurallari 93); yapay zekâ notu her zaman görünür; SinoAI yanıtı balonsuz, öğrencininki gri balonda.

### 4.4 `m-sino-menu` SinoAI · menü
- **Görseller:** `acik/mobil/m-sino-menu.png`, `koyu/mobil/m-sino-menu.png`, `en/acik/mobil/m-sino-menu.png`.
- **Çerçeve:** arkada `SinoTop`; karartma `rgba(11, 28, 48, 0.28)`; soldan çekmece 300 pt genişlik, tam yükseklik, zemin `bg`, 64 / 14 / 30 boşluk, aralık 4.
- **Yerleşim:**
  1. Arama kutusu: 44 yükseklik, 0 / 12 boşluk, köşe 22, `card` zemin, 1 px `line`, 10 alt boşluk; `search` 17 `muted` + "Sohbetlerde ara" / "Search chats" (`small`).
  2. Satırlar (10 / 8 boşluk, köşe 12, ikon 19 `ink2`, `headline` 14,5): `newChat` "Yeni sohbet" / "New chat" (vurgulu: `line2` zemin, 700); `layers` "Kütüphanen" / "Your library".
  3. `over` "Bugün" / "Today" (14 / 8 / 4 boşluk) ve başlıklar (`small` 600 `ink`, 9 / 8 boşluk): "Türevde zincir kuralı", "Mol hesaplama".
  4. `over` "Bu hafta" / "This week" ve başlıklar (`ink2`): "Paragrafta çeldirici şıklar", "Osmanlı duraklama özeti", "Kuvvet problemleri".
  5. Esnek boşluk; en altta `settings` "SinoAI ayarları" / "SinoAI settings".
- **Veri:** `GET student/sinoai/conversations?skip&take` (başlık, oluşturma / güncelleme zamanı, sabitlenmiş); günlere göre gruplama istemcide (Sabitlenen, Bugün, Bu hafta, Daha eski).
- **Etkileşimler:** satır → sohbet; karartmaya dokunma, sola fiske ya da geri tuşu → kapanır; "SinoAI ayarları" → ayarlar (ekran çizilmedi; içerik doğrulanmadı).
- **Hâller:** geçmiş boş → yalnız "Yeni sohbet" ve "Kütüphanen"; uzun liste → sayfalı, sanallaştırılmış.
- **Web farkı:** `HistoryColumn` sürekli açık (§4.1).
- **Kurallar:** bugünkü kodda çekmecede ayrıca "Kaynaklarım", hak sayacı ve "SinoAI'den çık" satırı var; çizimde yok (§7). Çıkış yolu her zaman bulunmalıdır: çizimde çıkış satırı olmadığından sistem geri hareketi sohbet ekranında SinoAI'yi kapatır.

### 4.5 `m-sino-calisma` SinoAI · çalışma · web: `w-sino-calisma`
- **Görseller:** `acik/mobil/m-sino-calisma.png`, `koyu/mobil/m-sino-calisma.png`, `en/acik/mobil/m-sino-calisma.png`; `acik/web-panel/w-sino-calisma.png` (koyu, EN).
- **Çerçeve:** `SinoPhone`, `SinoTop` (Çalışma seçili), `Composer` "Ya da ne istediğini yaz…".
- **Yerleşim (16 / 20 boşluk, aralık 8):**
  1. "Ne üretelim?" / "What shall we make?" (`title` 22).
  2. "Kaynak olarak notunu, PDF’ini ya da bir konuyu seç. Bu ay 4 / 20." / "Use your notes, a PDF or a topic. 4 / 20 this month." (`small`; sayılar veriden).
  3. 6 pt boşluk; dört araç satırı (14 / 4 boşluk, aralık 14; ilk satır dışında üstte 1 px `line2`): ikon 21 `ink`, başlık `headline`, alt yazı `small`, sağda `right` 18 `subtle`:
     - `exam` "Deneme oluştur" / "Create an exam" — "Eksiklerine göre kişisel deneme" / "A personal exam on your gaps";
     - `cards` "Tekrar kartları oluştur" / "Create review cards" — "Notlarından Bilgi Kartları destesi" / "A deck from your notes";
     - `quiz` "Test oluştur" / "Create a quiz" — "10 soru, anında açıklamalı" / "10 questions, instant feedback";
     - `calendar` "Çalışma planı oluştur" / "Create a study plan" — "Bir haftalık konu planı" / "A one-week topic plan".
- **Veri:** `GET student/sinoai/tools` (araç listesi ve kodları `exam`, `flashcard`, `quiz`, `studyplan`, `summary`); üretim sayacı "4 / 20" için kullanılan ve toplam sayı API'de doğrulanmalı (bugün yalnız yüzde).
- **Etkileşimler:** araç satırı → araç formu [alt sayfa] → §3.3; yazma kutusu → serbest istek (SinoAI uygun aracı önerir: öneri kartı).
- **Hâller:** araçlar kapalı (`toolsEnabled = false`) → "Çalışma" sekmesi gösterilmez (bugünkü kod), webde "Çalışma üretme şu an kapalı."; hak dolu → satırlar pasif ve hak cümlesi.
- **Web farkı (`w-sino-calisma`):** `SinoFrame active="study"` (geçmişte "Çalışma üret" seçili). 720 px sütun, üstten 70: ortalı `sparkles` 32, "Bugün ne üretelim?" / "What shall we make today?" (`display` 30), "Kaynağını seç: notun, PDF’in ya da bir konu. Bu ay 4 / 20 üretim." / "Pick a source: notes, a PDF or a topic. 4 / 20 this month." (`small` 14). Üç sütunlu kart ızgarası (aralık 10): kart 16 boşluk, köşe 18, 1 px `line`, ikon 20, başlık `headline`, alt yazı `small`; beş araç: Deneme oluştur, "Tekrar kartları" / "Review cards", Test oluştur, "Çalışma planı" / "Study plan", `note` "Özet çıkar" / "Summarise" — "PDF ya da metinden tek sayfa" / "One page from a PDF or text". Altta `Composer` yer tutucu "Örnek: Mol kavramı.pdf’ten 10 soruluk test" / "e.g. a 10-question quiz from Mole.pdf" ve `Disclaimer`.
- **Kurallar:** üretim hakkı somut yazılır ("Bu ay 4 / 20"); mobil ve webde araç sayısı aynı olmalı (çizimde mobil 4, web 5; §7).

### 4.6 `m-sino-sonuc` SinoAI · üretim sonucu
- **Görseller:** `acik/mobil/m-sino-sonuc.png`, `koyu/mobil/m-sino-sonuc.png`, `en/acik/mobil/m-sino-sonuc.png`.
- **Çerçeve:** `SinoPhone`, `SinoTop` (Çalışma), `Composer` "Ya da ne istediğini yaz…".
- **Yerleşim (12 / 20 boşluk, aralık 14):**
  1. Öğrenci isteği (sağda gri balon, en çok 280 pt): "Türevde zincir kuralından 20 soruluk test hazırla" / "Make a 20-question test on the chain rule".
  2. SinoAI satırı: `Mark` 20 + "Testin hazır. Kolaydan zora sıraladım." / "Your test is ready, easy to hard." (`small` `ink2`).
  3. Üretim kartı `Card` 16 (`card` zemin, `line` kenar, `card` gölge): `Tile module="tests"` 44 + "Zincir kuralı testi" / "Chain rule test" (`headline`) + "20 soru · Orta · Matematik" / "20 questions · Medium · Maths" (`small`). 14 pt altında iki gerçek düğme (aralık 10, `md`): dolu `Button module="tests"` `play` "Testi aç" / "Open test" (Testler `action` `#4F46E5`, beyaz yazı); `ghost` `edit` "Değiştir" / "Change".
  4. `over` "Sırada ne var?" / "What next?" (6 pt üst boşluk) ve öneri çipleri (`outline`): "Aynı konudan kart üret" / "Make cards on it", "Konuyu kısaca anlat" / "Explain it briefly", "Kişisel deneme" / "Personal exam".
- **Veri:** `GET student/generations/runs/{id}`: durum, `outputs[].targetKind`, `outputs[].targetId`, başlık, soru sayısı, zorluk, ders; plan üretiminde `studyPlanProposal`.
- **Etkileşimler:** "Testi aç" → Testler çözme ekranı `targetId` ile [push; Testler yığını]; tür başka ise düğme metni ve rengi o modülün: "Denemeyi aç" (Denemeler), "Kartları aç" (Bilgi Kartları), "Planı aç" (Ders Planı), "Notu aç" (`m-sino-not`, gri). "Değiştir" → araç formu önceki seçimlerle [alt sayfa] → yeni üretim (eski sonuç kütüphanede kalır). Öneri çipi → metni gönderir.
- **Hâller (kart içinde):** "Sırada" / "Hazırlanıyor · %N" (ince `Bar`, `ink` dolgu; düğmeler yerine "İptal et") → "Hazır"; "Kısmen hazır" (açılabilen kısım için düğme); "Hazırlanamadı" (neden ve "Yeniden dene"); "İptal edildi". Hazırlanırken alt not: "Ekrandan çıkabilirsin; hazır olunca bildirim gelir." (bugünkü metin).
- **Web farkı:** web üretim kartı aynı düzen ve aynı düğmeler (çizilmedi; mobil esastır).
- **Kurallar:** eylemler kartın içinde gerçek düğmedir; kartın altında başıboş metin bağlantısı ya da kopyala ikonu yok (25 Ekim incelemesi). "Testi aç" her zaman Testler renginde.

### 4.7 `m-sino-kutuphane` SinoAI · kütüphane · web: `w-sino-kutuphane`
- **Görseller:** `acik/mobil/m-sino-kutuphane.png`, `koyu/mobil/m-sino-kutuphane.png`; `acik/web-panel/w-sino-kutuphane.png` (koyu, EN).
- **Çerçeve:** `SinoPhone`; `AppHeader` solda geri, başlık "Kütüphanen" / "Your library"; `Composer` yok.
- **Yerleşim:**
  1. `Segmented` (gri, modülsüz): "Tümü" / "All", "Test · 4" / "Quizzes · 4", "Deste · 2" / "Decks · 2", "Özet · 6" / "Notes · 6" (sayılar veriden).
  2. `List` (satır karosu 38, satır modülünün `soft` zemini ve ikonu): `tests` "Mol kavramı testi" — "10 soru · bugün"; `flashcards` "Osmanlı kartları" — "24 kart · Bilgi Kartları’nda"; `studyPlan` "Türev haftalık planı" — "5 gün · Ders Planı’na eklendi"; `note` (gri, `plainIcon`) "Hücre bölünmesi özeti" — "PDF · 2 sayfa"; `exam` "Kişisel deneme · Matematik" — "30 soru". Sağda ok.
- **Veri:** üretim çıktıları (`student/generations` kütüphane; testler ve denemeler için uç doğrulanmalı), notlar `GET student/generations/library/study-notes`, kartlar `GET student/flashcard/personal?generationRunId=`.
- **Etkileşimler:** segment süzer; satır → ilgili modülde açar (test → Testler, deste → Bilgi Kartları, plan → Ders Planı, özet → `m-sino-not`, deneme → Denemeler) [push].
- **Hâller:** boş → `StateBlock` (gri) "Henüz bir şey üretmedin" ve "Çalışma üret" (metin doğrulanmadı; çizim yok); yükleniyor `LoadingLogo`.
- **Web farkı:** `SinoFrame active="library"`; 760 px sütun; başlık "Kütüphanen" (`title` 26) ve sağda 400 px `Segmented`; aynı liste, alt yazılar "10 soru · bugün · Testler’de çöz", "24 kart · Bilgi Kartları’na eklendi", "30 soru · Denemeler’de çöz".

### 4.8 `m-sino-kaynaklar` Kaynaklarım · web: `w-sino-kaynaklar` ve `m-sino-not` Çalışma notu · web: `w-sino-not`
- **Görseller:** `acik/mobil/m-sino-kaynaklar.png`, `acik/mobil/m-sino-not.png`, `acik/web-panel/w-sino-kaynaklar.png`, `acik/web-panel/w-sino-not.png` (koyu, EN).
- **Kaynaklarım (mobil):** `AppHeader` geri + "Kaynaklarım" / "My sources". `Button tone="dark" block` `plus` "Kaynak ekle" / "Add a source"; `meta` "Fotoğraf, galeri ya da PDF · kaynaklar 90 gün sonra silinir" / "Photo, gallery or PDF · kept for 90 days"; `List` kaynak satırları (12 / 14 boşluk, 40 × 40 köşe 12 `line2` kutu, ikon 20 `ink2`): "Fizik defterim.pdf" — "24 sayfa · okundu"; "Kimya sorusu" — "1 fotoğraf · okundu"; "Tarih özet.pdf" — "12 sayfa" ve sağda `Chip outline sm` "okunuyor" / "reading" (bitmiş satırda sağda `more` 18 `subtle`). `SectionTitle` "Çalışma notları" / "Study notes"; not satırı `note` "Fizik · Kuvvet ve hareket" — "Fizik defterim.pdf’ten · 3 Kas"; `meta` `muted` "@özet ile notunu özetlediğinde burada görünür." / "Appears here when you summarise with @özet."
- **Çalışma notu (mobil):** `AppHeader` geri + "Çalışma notu" / "Study note". Üstte `meta` kaynak ve tarih "Fizik defterim.pdf · 3 Kasım"; başlık "Kuvvet ve hareket" (`title`). `Card` 14 "Önemli noktalar" / "Key points" (`over`) ve satırlar `check` 16 `successInk` + `body` 15. `Card` 14 "Terimler" / "Terms": kalın terim · tanım (`small` `ink2`). Ortalı `meta` "SinoAI hata yapabilir; önemli bilgileri doğrula." / "SinoAI can make mistakes; check important facts." `BottomBar`: `ghost` `cards` "Kart yap" / "Make cards" ve `dark` `quiz` "Test üret" / "Make a quiz".
- **Veri:** `POST|GET student/generations/sources`, `DELETE .../sources/{id}` (yükleme ilerlemesi; durum okundu / okunuyor); `GET|DELETE .../library/study-notes/{id}`.
- **Etkileşimler:** "Kaynak ekle" → kamera / galeri / dosya seçici [alt sayfa]; kaynak satırı `more` → sil (onay); not satırı → `m-sino-not` [push]; "Kart yap" / "Test üret" → üretim (§3.3) ve sohbete dönüş.
- **Web farkı:** Kaynaklarım: başlık "Kaynaklarım" (`title` 28), alt yazı "Fotoğraf, PDF ya da not; kaynaklar 90 gün sonra silinir.", sağda `dark` `plus` "Kaynak ekle"; iki sütun `1.4fr 1fr`: `WCard` "Kaynaklar" / "Sources" ve `WCard` "Çalışma notları". Çalışma notu: üstte `meta` "Kütüphane · çalışma notu · Fizik defterim.pdf", başlık 28, sağda "Kart yap" ve "Test üret"; iki sütun `1.5fr 1fr`: "Önemli noktalar" ve "Terimler"; en altta uyarı satırı. Bu iki web sayfası `SinoFrame` kullanmaz, düz panel sayfasıdır.
- **Kurallar:** 90 gün kuralı her zaman yazılır; okunuyor durumundaki kaynak üretimde seçilemez (doğrulanmadı).

### 4.9 `m-sino-hak` SinoAI · hak doldu
- **Görseller:** `acik/mobil/m-sino-hak.png`, `koyu/mobil/m-sino-hak.png`, `en/acik/mobil/m-sino-hak.png`.
- **Çerçeve:** `SinoAI` modülünde; `AppHeader` solda `menu`, ortada "SinoAI"; `Content` sekmesiz, aralık 12.
- **Yerleşim:**
  1. `StateBlock module="sinoAi" icon="clock"` (ikon kutusu gri `soft`): "Bugünkü SinoAI hakkın doldu" / "Today’s SinoAI limit is reached"; "Yarın 00:00’da yenilenir. Sohbetlerin ve ürettiğin testler kütüphanende duruyor." / "It renews at midnight. Your chats and generated quizzes stay in your library."; ana düğme "Kütüphaneme git" / "Open my library" (`module` tonu: `#475569` zemin, beyaz yazı).
  2. `Card tone="soft"` 14: "Bu arada" / "Meanwhile" (`headline`) ve "Takıldığın konunun mikro dersi ya da testi hakkından düşmez." / "Micro-lessons and quizzes don’t use this limit." (`small` `ink2`).
  3. En altta (0 / 18 / 30 boşluk) kilitli yazma kutusu: 50 yükseklik, köşe 25, `line2` zemin, opaklık 0,6, `small` "Yarın yeniden sorabilirsin" / "You can ask again tomorrow". Dokunulmaz.
- **Veri:** `GET student/sinoai/usage` (ya da `capabilities.usage`): `state = exhausted`, `resetsAtUtc`. Yenilenme metni bu alandan üretilir: aynı gün değilse tarih ("1 Aralık’ta yenilenir"), ertesi gün ise "Yarın 00:00’da" (biçim kuralı doğrulanmadı).
- **Etkileşimler:** "Kütüphaneme git" → `m-sino-kutuphane` [push]; `menu` → `m-sino-menu` (geçmiş okunabilir).
- **Web farkı:** çizilmedi; sohbet sütununda aynı `StateBlock`, `Composer` kilitli.
- **Kurallar:** hak dolduğunda yenilenme zamanı ve etkilenmeyen haklar (mikro ders, testler) yazılır; geçmiş ve kütüphane açık kalır.

## 5. Takılma ve kilitlenme önlemleri

- **Akış:** SSE bağlantısı 60 sn içinde ilk olayı vermezse hata satırı ve "Yeniden üret"; akış sırasında bağlantı koparsa gelen metin kalır, altına "Bağlantı koptu; cevap tamamlanamadı." yazılır. Sonsuz düşünüyor noktası yok.
- **Çift gönderim:** gönder düğmesi akış boyunca "Durdur"dur; Enter'a iki kez basmak ikinci mesaj göndermez. "Testi aç", "Değiştir", "Planıma uygula" istek sürerken `loading`.
- **Arka plan:** uygulama arka plana geçerse akış kesilebilir; dönünce `GET .../messages` ile son hâl alınır, yarım yanıt sunucudaki tam hâliyle değişir. Üretimler (`runs`) arka planda sürer; dönünce yoklama ya da SSE yeniden bağlanır.
- **Uzun sohbet:** mesaj listesi sanallaştırılır (ters liste); eski mesajlar yukarı kaydırınca sayfalı yüklenir. Uzun yanıtta kaydırma akıcıdır; alta yapışma öğrenci yukarı kaydırınca bırakılır.
- **Klavye:** yazma kutusu ve not her zaman klavyenin üstünde; geri tuşu önce klavyeyi, sonra çekmeceyi / alt sayfayı, en son SinoAI'yi kapatır.
- **Çekmece ve alt sayfalar:** karartma, fiske ve geri tuşuyla kapanır.
- **Taslak:** gönderilmemiş metin sohbet başına saklanır; uygulama kapanıp açılınca geri gelir.
- **Ağ yok:** çevrimdışı şeridi; gönder pasif; geçmiş ve kütüphane son yüklenen hâliyle okunur.
- **Zaman aşımı:** okuma 25 sn, gönderim 60 sn; yükleme (kaynak, ek) ilerleme gösterir.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | ikisi | `m-sino-ana`, `m-sino-sohbet`, `w-sino-sohbet` | Örnek veriyle TR/EN × açık/koyu | PNG ile aynı; zemin beyaz (koyuda `card`), renkli yüzey yok |
| 2 | bileşen | ikisi | yazma kutusu | Her SinoAI ekranında say | Yazma kutusunun altında yapay zekâ notu, TR ve EN metni tam |
| 3 | e2e | ikisi | `m-sino-sohbet` | Mesaj gönder, ağı yavaşlat | Mesaj hemen balonda; ilk parçaya kadar üç nokta; metin parça parça uzar; `done` sonrası ikonlar ve çipler |
| 4 | e2e | ikisi | `m-sino-sohbet` | Akış sırasında "Durdur" | `cancel` bir kez; yazılan kısım kalır |
| 5 | e2e | ikisi | `m-sino-sohbet` | Akış sırasında ağı kes | Gelen metin kalır; "Bağlantı koptu; cevap tamamlanamadı."; "Yeniden üret" çalışır |
| 6 | e2e | ikisi | yazma kutusu | Enter'a / gönder'e iki kez hızlı bas | Tek mesaj |
| 7 | erişilebilirlik | ikisi | düşünüyor | "Hareketi azalt" açık | Döngü yok; "Düşünüyor…" yazısı |
| 8 | e2e | mobil | `m-sino-menu` | Menü aç, sohbet seç | Çekmece kapanır, sohbet yüklenir; karartma ve geri tuşu kapatır |
| 9 | e2e | ikisi | yeni sohbet | `newChat` | Boş karşılama; ilk mesajda `POST conversations` |
| 10 | e2e | ikisi | `m-sino-calisma` | "Test oluştur" → form → onay | `tool-calls` + `accept`; kart Sırada → Hazırlanıyor → Hazır |
| 11 | e2e | ikisi | `m-sino-sonuc` | "Testi aç" | Testler çözme ekranı `targetId` ile açılır; düğme Testler renginde |
| 12 | e2e | ikisi | `m-sino-sonuc` | "Değiştir" | Form önceki seçimlerle açılır; yeni üretim; eski sonuç kütüphanede |
| 13 | e2e | ikisi | üretim | Hazırlanırken ekrandan çık, bitince dön | Üretim sürmüş; kart "Hazır"; bildirim gelmiş |
| 14 | e2e | ikisi | `m-sino-sonuc` | Plan üretimi → "Planıma uygula" | `apply-study-plan` bir kez; "Planımı aç" Ders Planı'nı açar |
| 15 | e2e | ikisi | `m-sino-kutuphane` | Segment ve satırlar | Süzme doğru; her satır kendi modülünde açılır |
| 16 | e2e | ikisi | `m-sino-hak` | Hakkı dolu hesap | Yenilenme zamanı yazılı; yazma kutusu kilitli; kütüphane ve geçmiş açık |
| 17 | e2e | ikisi | `m-sino-kaynaklar` | PDF ekle | Yükleme ilerlemesi; "okunuyor" → "okundu"; 90 gün notu görünür |
| 18 | e2e | ikisi | bağlamlı açılış | Testler yanlış cevabında "SinoAI’ye sor" | Yeni sohbet soru bağlamıyla açılır; geri → test ekranı |
| 19 | e2e | mobil | çıkış | Sohbette sistem geri hareketi | SinoAI kapanır, açan ekrana döner; taslak saklanır |
| 20 | erişilebilirlik | ikisi | `SinoTop`, yazma kutusu | Ekran okuyucu | `menu`, `newChat`, `plus`, `camera`, gönder, eylem ikonlarının adı var; ≥ 44 pt |
| 21 | erişilebilirlik | ikisi | sohbet | En büyük yazı | Balonlar ve formül kutuları sarar; yazma kutusu ve not kesilmez |
| 22 | erişilebilirlik | ikisi | bütün ekranlar | Kontrast | `muted` yer tutucu ve not ≥ 4,5:1 (koyu temada da) |
| 23 | dil | ikisi | bütün ekranlar | TR ve EN | "koç" / "coach" ve kullanıcıya görünen "quiz" yok (EN arayüz sözcüğü "quiz" Testler adıdır, TR'de "test") |
| 24 | birim | ikisi | hak sayacı | 4 / 20, TR ve EN | "Bu ay 4 / 20" / "4 / 20 this month" |
| 25 | görsel | ikisi | `m-sino-*`, `w-sino-*` bütün çizimler | TR/EN × açık/koyu | İlgili PNG'lerle aynı |

## 7. Çizim ile bugünkü kod arasındaki farklar

1. **Hak türü:** çizimde sohbet için günlük hak ("Bugünkü SinoAI hakkın doldu", "Yarın 00:00’da yenilenir", kilitli kutuda "Yarın yeniden sorabilirsin") ve üretim için aylık sayaç ("Bu ay 4 / 20"). İki istemcide de tek bir aylık yapay zekâ hakkı var (`usedPercent`, `state`, `resetsAtUtc`), Akıllı Özet ile ortak; günlük hak ve "4 / 20" sayısı yok. Mobil metinler: "Bu ayki kullanım hakkın doldu; {{date}} tarihinde yenilenir.", kilitli yer tutucu "Bu ayki hakkın doldu; yenilenince yeniden sorabilirsin" (`src/core/i18n/catalogs/tr-TR/aiUsage.ts`, `sinoai.ts`). Hak doldu için ayrı `StateBlock` ve "Kütüphaneme git" yok; bildirimde "Paketleri incele" ya da "Kayıt ol" var.
2. **Düşünüyor noktaları yok:** mobil "Düşünüyor…" yazısı ve `sparkles` ikonu; web "SinoAI yazıyor…" ve nabız gibi atan ikon (`animate-pulse`). Hareket standardındaki üç nokta iki istemcide de yok.
3. **Üretim kartı düğmeleri:** mobil kart genel "Aç" diyor, "Değiştir" yok (`M components/SinoAiRunCard.tsx`); webde türe göre "Testi aç", "Denemeyi aç", "Kartları aç", "Planı aç", "Notu aç" var, "Değiştir" yok (öneri kartında "Düzenle"). "Testi aç"ın Testler renginde olduğu doğrulanmadı.
4. **Sohbet · Çalışma geçişi:** mobilde var (araçlar açıkken). Webde geçiş yok; yerine geçmiş sütunundaki "Çalışma üret" bağlantısı ve `/student/sinoai/uret` sayfası (çizimle uyumlu). Web karşılama başlığı "Bugün ne çalışalım?" (çizimde web sohbet karşılaması yok).
5. **Mobil menü:** bugünkü çekmecede çizimde olmayan "Kaynaklarım", tam hak sayacı ve "SinoAI'den çık" var; çizimdeki "SinoAI ayarları" kodda bulunamadı. Web sütununda ayrıca "Kaynaklarım" ve "Sabitlenen / Bugün / Bu hafta / Eski" grupları var.
6. **Yazma kutusu:** mobil çizimde `plus` ve `camera` ayrı; bugünkü kodda `plus` menüsü (ek, araçlar, Hızlı / Dengeli / Derin). Web çizimi "Dosya ekle" ve "Çalışma üret" çipleri; bugünkü web ayrıca kip seçimi ve yer tutucu "Sorunu yaz ya da @ ile araç seç…" (çizim "SinoAI’ye sor" / "Devam et…").
7. **Çalışma araçları:** mobil çizimde dört araç, web çiziminde beş (Özet çıkar ek); API araç kodlarında `summary` var. Mobil Çalışma alt yazısı kodda "Kaynak olarak notunu, PDF’ini ya da bir konuyu seç." (sayaç yok).
8. **Kütüphane:** mobil kodda iki sekme "Çalışma notları" ve "SinoAI kartlarım"; çizimde "Tümü · Test · Deste · Özet" ve test, plan, deneme satırları. Testlerin ve denemelerin kütüphanede listelendiği uç bulunamadı (doğrulanmadı).
9. **Web tam ekran değil:** web SinoAI öğrenci paneli içinde (`W shells/SinoAiLayout.tsx`, ana alan tam yükseklik); çizimle uyumlu (çizim de `Panel` içinde çerçeve). Mobilde tam ekran (`fullScreenFlow`), çizimle uyumlu.
10. **API yolu:** `ModuleIdentity.ts` `route: '/api/student/sino-ai'`; iki istemci `student/sinoai` ve `student/generations` kullanıyor.
11. **Yanıt eylemleri:** mobil kodda "Durdur", "Yeniden üret", kopyala, paylaş, beğen / beğenme; çizimde kaydet, yeniden üret, kart yap ikonları. Kaydet ve kart yap kodda bulunamadı (doğrulanmadı).
12. **Çevrimdışı:** iki istemcide de çevrimdışı algılama yok; yalnız akış kopunca hata metni.
