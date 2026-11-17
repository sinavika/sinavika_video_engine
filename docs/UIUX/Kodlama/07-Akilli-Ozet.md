# Akıllı Özet · kodlama belgesi (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak çizimler: `Desktop\Sinavika-UIUX3` · Çizim kodu: `sinavika_video_engine/src/UIUX/Screens/Mobile/Assist.tsx` (`Summary*`), `Screens/Mobile/States.tsx` (`SummaryQuotaScreen`, `SummaryFailedScreen`), `Screens/Mobile/Gaps.tsx` (`SummaryPdfScreen`), `Screens/Web/AssistWeb.tsx` (`WebSummary*`), `Screens/Web/GapsWeb.tsx` (`WebSummaryHistoryScreen`), `Parts/Study.tsx` (`StateBlock`)
Önce oku: [README](README.md) (ortak kurallar, ekran tanımı biçimi, testler) ve [Navigasyon](Navigasyon.md).


> **Sahip kararları (17 Kasım 2026). Bu kararlarla çelişen ekran çizmek ya da kodlamak tasarım hatasıdır.** Kaynak: web deposunda `docs/UIUX/Tasarim-Uyum-Plani.md` §9.1 madde 12, §9.3 madde 19.
> - **Hak:** sistemde aylık sayı yoktur; hak SinoAI ile ortak bir yüzdedir. Gösterim:
>   - mobilde başlık çipi "Kullanım %40";
>   - webde alt başlıkta "kullanım %40";
>   - hak dolunca `m-ozet-hak` "Kullanım %100" gösterir ve "Bu arada SinoAI'ye sor" çıkmaz.
> - **Analizden kart üretimi yoktur:** mobilde "Bilgi kartı yap", webde "Kart yap" yoktur.
> - **"Bu konuda devam et":** yalnız "Konuyu çalış" vardır; meta satırı "Dersler · konu adı" olur, süre yazılmaz.
> - **"Benzer 5 soru":** konunun testini Testler'de açar.
> - **PDF kaynak yoktur:** mobilde "Fotoğraf ya da galeri", webde "JPG, PNG, WEBP" yazar.
> - **Kamera:** "Tek soru", "Sayfa" ve "Video" mod çipleri yoktur.
> - **Web yeni analiz:**
>   - "Ne istiyorsun?" çıktı seçimi yoktur; not alanı ve ipuçları vardır.
>   - Düğmeler: "Kamerayla çek" ve "Analizi başlat" ("· 1 hak" eki yok).
> - **İşleniyor:** iptal yoktur; ekranı kapatmak analizi durdurmaz.
> - **Mobil çözüm:** sorunun fotoğrafı en altta, "Sorunun fotoğrafı" başlığıyla durur.
> - **Mobil vitrin:** "Tümü" bağlantısı yoktur; liste zaten tamdır.
> - **Mobil yükleme sayfası:** başlık "Neler alacaksın?" olur. Altındaki satırlar seçim değil, bilgidir; üçüncü satır "Sık yapılan hata".

## 1. Modül özeti

- **Ne işe yarar:** Öğrenci takıldığı sorunun fotoğrafını çeker ya da dosyasını yükler; Akıllı Özet adım adım çözümü, cevabı, kazanımı ve sık yapılan hatayı verir, sonra konuya devam yolunu (konu anlatımı, kart, benzer sorular, SinoAI) açar. Ders videosundan bölüm ve soru üretimi de buradadır. Ana iş: soru yükle → çözümü oku → konuda devam et.
- **Anahtar:** `smartSummary` · kod adları: API `Lenses`, rota `/api/student/lens/sessions`, web özelliği `lens`, mobil modül `lens`, rota öneki `Lens`. Kullanıcı "Lens" sözcüğünü hiçbir ekranda görmez; görünen ad "Akıllı Özet" / "Smart Summary".
- **Renk (`ModuleIdentity.ts`):**

| Jeton | Açık | Koyu |
|---|---|---|
| `color` | `#7C3AED` | `#A78BFA` |
| `action` (düğme dolgusu, beyaz yazı 5,7:1) | `#7C3AED` | `#7C3AED` |
| `ink` | `#6931C9` | `#C6B4FC` |
| `wash` %7 / %12,6 | `rgba(124,58,237,.07)` | `rgba(167,139,250,.126)` |
| `soft` %12 / %21,6 | `rgba(124,58,237,.12)` | `rgba(167,139,250,.216)` |
| `track` %16 / %28,8 | `rgba(124,58,237,.16)` | `rgba(167,139,250,.288)` |
| `line` %24 / %43,2 | `rgba(124,58,237,.24)` | `rgba(167,139,250,.432)` |
| Gradyan ikinci durak | `#C026D3` | `#C026D3` |

- Başka modülü açan düğme o modülün rengindedir: "Benzer 5 soru" Testler (`#4F46E5`, `moduleSoft`), "Konuyu çalış" Dersler, "Bilgi kartı yap" / "Kart yap" Bilgi Kartları; "SinoAI’ye sor" `dark` (`ink` zemin, `bg` yazı).
- **Mobil sekme çubuğu:**

| Yuva | Etiket TR / EN | İkon | Hedef |
|---|---|---|---|
| 1 | Akıllı Özet / Summary | `scan` | `m-ozet-vitrin` (`LensHome`) |
| 2 | Soru yükle / Upload | `camera` | `m-ozet-yukle` (`LensUpload`) |
| 3 | Modüller / Modules | `grid` | Modüller ana ekranı |
| 4 | Video / Video | `video` | `m-ozet-video` (`LensVideo`) |
| 5 | Profil / Profile | `user` | Profil |

- **Web:** sol menüde "Modüller" altında beşinci satır "Akıllı Özet" / "Smart Summary", ikon `scan`. Hap sekmeler: Akıllı Özet · Yeni analiz · Video · Geçmiş (`Summary · New · Video · History`). Yollar: `/student/lens`, `/student/lens/yeni`, `/student/lens/video/[id]`, `/student/lens/gecmis`, `/student/lens/analiz/[id]`.
- **Hak:** aylık analiz hakkı somut yazılır: "Bu ay 7 / 30" / "7 / 30 this month" (UIUX-Rehberi §5.6). Okunamayan fotoğraf hakkı düşürmez.

## 2. Ekran haritası

Kısaltmalar: **M** = `sinavika_mobile_reactnative/src/modules/lens/presentation/`, **W** = `sinavika_frontend_student/src/features/lens/`.

| Kimlik | Platform | Ekran | Rota (Registry) | Bugünkü kod | Hâl |
|---|---|---|---|---|---|
| `m-ozet-vitrin` | mobil | Akıllı Özet (vitrin ve geçmiş) | `LensHome · LensAnalyses` | M `screens/LensHomeScreen.tsx` | dolu |
| `w-ozet-vitrin` | web | Akıllı Özet | `/student/lens` | W `pages/LensHomePage.tsx` | dolu |
| `w-ozet-gecmis` | web | Geçmiş analizler | `/student/lens/gecmis` | W `pages/LensHistoryPage.tsx` | dolu |
| `m-ozet-yukle` | mobil | Soru yükle | `LensNew · LensUpload` | M `screens/LensUploadScreen.tsx` (yığın `LensNew`, kök `LensUpload`) | dolu |
| `w-ozet-yeni` | web | Yeni analiz | `/student/lens/yeni` | W `pages/LensNewAnalysisPage.tsx` | dosya seçili |
| `m-ozet-kamera` | mobil | Kamera | `LensCamera` | M `screens/LensCameraScreen.tsx` | kamera |
| `m-ozet-isleniyor` | mobil | Analiz ediliyor | `LensSessionProgress` | M `screens/LensSessionProgressScreen.tsx` | işleniyor |
| `m-ozet-sonuc` | mobil | Çözüm | `LensSessionDetail` | M `screens/LensSessionDetailScreen.tsx`, `components/LensSessionResultSections.tsx`, `components/LensQuestionFollowUpActions.tsx` | dolu |
| `w-ozet-detay` | web | Analiz detayı | `/student/lens/analiz/[id]` | W `pages/LensAnalysisDetailPage.tsx` | dolu |
| `m-ozet-okunamadi` | mobil | Fotoğraf okunamadı | `LensUpload` | yok (ayrı hâl yok; genel başarısız / reddedildi hâli) | hata |
| `m-ozet-hak` | mobil | Aylık hak doldu | `LensHome` | kısmen: M `components/LensCreditGateBanner.tsx` | hak |
| `m-ozet-pdf` | mobil | Analiz PDF | `LensSessionPdf` | M `screens/LensSessionPdfScreen.tsx`, `screens/LensSessionPdfScreenNative.tsx` | dolu |
| `m-ozet-video` | mobil | Video analizi | `LensVideo` | M `screens/LensSessionCreateScreen.tsx` (yığın `LensVideo`) | dolu |
| `w-ozet-video` | web | Video analizi | `/student/lens/video/[id]` | W `pages/LensVideoDetailPage.tsx` (ayrıca `/student/lens/video` → `LensVideoHomePage.tsx`) | dolu |

Tablet çizimi yok; tablet web düzenini kullanır (600 pt altında telefon düzeni). Web sitesindeki ürün sayfası `s-urun-ozet` bu belgenin dışındadır.

## 3. Süreçler (akışlar)

### 3.1 Fotoğrafla soru analizi (mobil)
1. `m-ozet-vitrin` → vitrindeki beyaz "Soru yükle" düğmesi ya da sekme 2 → `m-ozet-yukle` [sekme değişimi].
2. "Fotoğraf çek" → `m-ozet-kamera` [tam ekran modal]. İlk kez: sistem kamera izni sorulur; reddedilirse yerinde açıklama ve "Ayarları aç" (metin doğrulanmadı), "Galeri" yolu açık kalır.
3. Deklanşör → (kırpma / onay adımı çizimde yok; bugünkü kodda ders çipi seçimi var) → `POST student/lens/sessions` (multipart; dosya + bağlam) → yanıt `sessionId`, `pollAfterSeconds` → `m-ozet-isleniyor` [replace; kamera yığından çıkar].
4. İşleniyor: `GET student/lens/sessions/{id}?outputDetail=summary` her `pollAfterSeconds` saniyede (en az 1 sn, varsayılan 5 sn). Adımlar sırayla işaretlenir.
5. Bitti → `m-ozet-sonuc` [replace]. Okunamadı → `m-ozet-okunamadi` [replace]; hak düşmez. Hak dolu → istek gönderilmeden `m-ozet-hak` hâli (hak `GET student/usage` ile önceden bilinir).
6. Öğrenci işleniyor ekranından çıkarsa (kapat) analiz arka planda sürer; bitince bildirim gelir, geçmişte "İşleniyor" çipiyle görünür.
7. Geri: `m-ozet-sonuc` geri → `m-ozet-vitrin` (işleniyor ve kamera yığında kalmaz).

### 3.2 Galeri ve PDF
1. `m-ozet-yukle` → "Galeri" → sistem fotoğraf seçici (tek görsel) → 3.1 adım 3.
2. PDF: alt yazı "Fotoğraf, galeri ya da PDF" PDF'i kaynak olarak sayar; çizimde ayrı PDF düğmesi yoktur. PDF seçimi galeri düğmesinin açtığı belge seçiciden yapılır (iOS dosya seçici / Android belge seçici); kural doğrulanmadı, §7 madde 1.
3. Sınır: 12 MB (bugünkü metin "Dosya 12 MB sınırını aşıyor."); aşarsa istek gönderilmez.

### 3.3 Web'de yeni analiz
1. `w-ozet-vitrin` → kutuya sürükle-bırak ya da "Dosya seç" → `w-ozet-yeni` [sayfa], dosya önizlemesi.
2. "Döndür", "Kırp" ile düzeltme; "Ne istiyorsun?" seçimleri (Adım adım çözüm ve Konu özeti seçili, Benzer 5 soru seçili değil).
3. "Analizi başlat · 1 hak" → `POST student/lens/sessions` (yükleme ilerlemesi düğmede) → `w-ozet-detay` [push] içinde işleniyor hâli (web'de ayrı işleniyor sayfası çizilmedi; mobil `m-ozet-isleniyor` içeriği detay sayfasının yerinde gösterilir).
4. "Telefonla çek" → telefona bağlantı / QR (akış çizilmedi; doğrulanmadı).

### 3.4 Sonuçtan devam
1. `m-ozet-sonuc` → "Bu konuda devam et" listesi: "Konuyu çalış" → Dersler konu ekranı [push, Dersler yığını]; "Bilgi kartı yap" → bu çözümden 3 kart üretir (kart üretimi ucu API'de doğrulanmalı) ve Bilgi Kartları'nda açar.
2. Alt düğme "Benzer 5 soru" → konunun test yolu (`GET student/lens/sessions/{id}/practice-target` → `lessonSubId`, `publishedQuizCount`) → Testler'de 5 soruluk çözme [push]. Hedef yoksa (204) düğme gizlenir.
3. "SinoAI’ye sor" → SinoAI sohbeti, analiz bağlamıyla (`origin = lens`) [tam ekran modal].
4. Sağ üst "…" menüsü → "PDF oluştur" (`POST .../{id}/exports/pdf`, hazır olunca `m-ozet-pdf` [push]), "Sil" (onay → `DELETE .../{id}`), "Not ekle" (`PATCH .../{id}`; menü içeriği çizilmedi, bugünkü koddan).

### 3.5 Hak doldu
1. `GET student/usage` → `state = exhausted` → `m-ozet-vitrin` yerine `m-ozet-hak` hâli; yükleme düğmeleri pasif.
2. "Geçmiş analizlerim" → geçmiş listesi (vitrin listesi ya da web `w-ozet-gecmis`). "Bu arada SinoAI’ye sor" → SinoAI.
3. Yenilenme tarihi gelince hâl kendiliğinden kalkar (ekran ön plana dönünce yeniden sorulur).

### 3.6 Video analizi
1. Sekme 4 "Video" → `m-ozet-video`; video bağlantısı ile `POST student/lens/sessions` (JSON, `productionKind = 1`) → `m-ozet-isleniyor` ("Videoyu inceliyoruz") → `m-ozet-video` sonuç: bölümler ve "Bu videodan 10 soru üret".

## 4. Ekranlar

### 4.1 `m-ozet-vitrin` Akıllı Özet · web: `w-ozet-vitrin`, `w-ozet-gecmis`
- **Görseller:** `acik/mobil/m-ozet-vitrin.png`, `koyu/mobil/m-ozet-vitrin.png`, `en/acik/mobil/m-ozet-vitrin.png`; `acik/web-panel/w-ozet-vitrin.png`, `acik/web-panel/w-ozet-gecmis.png` (koyu ve EN eşleri).
- **Çerçeve (mobil):** `ModuleScreen module="smartSummary"`, üst çubuk (profil, boş orta, zil), `wash` gradyanı, sekme çubuğu yuva 1 aktif. `Content gap={12}`.
- **Yerleşim:**
  1. `PageTitle`: çip "Akıllı Özet"; başlık "Akıllı Özet" / "Smart Summary"; sağda `Chip tone="module"` "Bu ay 7 / 30" / "7 / 30 this month" (hak sayacı).
  2. `ModuleSlide` 176 pt: Akıllı Özet gradyanı (`#7C3AED` → `#C026D3`, 135°), köşe 26, filigran `scan` ikonu, iki ışık dairesi. `over` "Soru analizi" / "Question analysis"; başlık (`hero` 24, beyaz) "Fotoğrafını çek, çözümünü öğren" / "Snap it, learn the solution"; metin "Adım adım çözüm, kazanım ve hata analizi." / "Step-by-step solution, skill and mistake analysis."; beyaz `sm` düğme "Soru yükle" / "Upload" (yazı `moduleInk` açık). Altında `Dots` 2 adet (1. etkin): vitrin iki kaydırmalı (2. kaydırma Video; içeriği çizilmedi).
  3. `SectionTitle` "Geçmiş analizler" / "Past analyses", sağ eylem "Tümü" / "All".
  4. `Segmented dark`: "Soru analizleri" / "Questions", "Video analizleri" / "Videos" (seçili `ink` zemin, `bg` yazı).
  5. `List` (tek kart, satır arası `line2`): her satır 12 / 14 boşluk; solda 46 × 46 küçük resim (köşe 13, `soft` → `track` gradyan, `image` ya da `video` ikonu 20 `mod.color`; gerçek küçük resim varsa o); ortada konu başlığı (`headline`) ve "Ders · zaman" (`small`): "Matematik · bugün 14:10", "Tarih · dün", "Kimya · 12 Ekim"; sağda durum çipi `Chip tone="module" size="sm"`: "Çözüldü" / "Solved", "Özet" / "Summary" (web'de ayrıca "İşleniyor" / "Processing" `warning` çipi).
- **Veri:** `GET student/usage` (hak; bugün yalnız `usedPercent`, `state`, `resetsAtUtc` dönüyor — "7 / 30" için kullanılan ve toplam sayı API'de doğrulanmalı); `GET student/lens/sessions?skip&take&productionKind` (geçmiş; konu başlığı, ders, oluşturma zamanı, durum); `GET .../sessions/categorized` (mobil). Satır başlığı = analizin bulduğu konu (dosya adı değil).
- **Etkileşimler:** "Soru yükle" → `m-ozet-yukle` [sekme değişimi]; "Tümü" → tam geçmiş listesi [push] (mobil ayrı çizim yok; web `w-ozet-gecmis`); segment → liste türü; satır → `m-ozet-sonuc` [push] ya da işleniyorsa `m-ozet-isleniyor`; aşağı çekme → yenile.
- **Hâller:** yükleniyor (`LoadingLogo` liste yerinde); geçmiş boş → `StateBlock` "Henüz soru analizi yok" (bugünkü metin; çizim yok) ve "Soru yükle"; hak doldu → `m-ozet-hak`; paket dışı → "Akıllı Özet paketinde yok" kapısı (bugünkü web metni; çizim yok); devam eden analiz → listenin başında "İşleniyor" satırı.
- **Web farkı (`w-ozet-vitrin`):** `ModuleHead` sekme 1 "Akıllı Özet" aktif; başlık "Akıllı Özet"; alt yazı "Sorunun fotoğrafından adım adım çözüm ve konu özeti · bu ay 7 / 30" / "Step-by-step solutions from a photo · 7 / 30 this month". İki sütun `1fr 1.3fr`:
  - Sol: yükleme kutusu (`Card` 34, 2 px kesikli `mod.line` kenar, `mod.wash` zemin, gölgesiz, ortalı): `Tile` `upload` 64 dolu; "Soru görselini sürükle ya da seç" / "Drop or choose a question image" (`section`); "JPG, PNG, PDF · tek soru en iyi sonucu verir." / "JPG, PNG, PDF · one question works best."; `module` `upload` "Dosya seç" / "Choose file" ve `ghost` `phone` "Telefonla çek" / "Use phone".
  - Sağ: `WCard` "Son analizlerin" / "Recent analyses", eylem "Tümü"; dört `ListRow` (`image` ikonu) ve durum çipi.
  - Sürükle-bırak: kutu üstüne gelince kenar `mod.color` olur (doğrulanmadı); bırakınca `w-ozet-yeni`.
- **Web farkı (`w-ozet-gecmis`):** `ModuleHead` başlık "Geçmiş analizler" / "Past analyses", alt yazı "Bu ay 7 / 30" / "7 / 30 this month"; tek `WCard` içinde satırlar: ikon (`image` ya da `video`), başlık, "Matematik · soru analizi · 3 Kas" / "Maths · question · 3 Nov"; sağda `ghost sm` `file` "PDF" ve `moduleSoft sm` "Aç" / "Open". Çizimde bu sayfanın hap sekmeleri modülün varsayılan üçlüsüdür (Akıllı Özet · Soru yükle · Video, ilki aktif); diğer web sayfaları dörtlü sekmeyi kullanır (§7 madde 9).
- **Kurallar:** hak sayacı her zaman görünür; sayı tek biçimleyiciden ("7 / 30"). Geçmiş satırı başlığı konudur.

### 4.2 `m-ozet-yukle` Soru yükle · web: `w-ozet-yeni`
- **Görseller:** `acik/mobil/m-ozet-yukle.png`, `koyu/mobil/m-ozet-yukle.png`, `en/acik/mobil/m-ozet-yukle.png`; `acik/web-panel/w-ozet-yeni.png` (koyu, EN).
- **Çerçeve:** sekme yuvası 2 "Soru yükle" aktif.
- **Yerleşim (mobil):**
  1. `PageTitle` "Soru yükle" / "Upload"; alt yazı "Fotoğraf, galeri ya da PDF" / "Photo, gallery or PDF".
  2. Yükleme kartı: 24 boşluk, 2 px kesikli `mod.line` kenar, `mod.wash` zemin, gölgesiz, ortalı, iç aralık 12. `Tile icon="camera"` 58 dolu (`action` zemin, beyaz ikon). "Takıldığın sorunun fotoğrafını çek" / "Snap the question you are stuck on" (`section`). "Tek soru en iyi sonucu verir. 30 saniyede çözüm hazır." / "One question works best. Ready in 30 seconds." (`small`). İki düğme (aralık 8): `module` `camera` "Fotoğraf çek" / "Take photo"; `ghost` `image` "Galeri" / "Gallery".
  3. `SectionTitle` "Ne istiyorsun?" / "What do you need?".
  4. `List` üç satır (`ListRow module="smartSummary"`, `Tile` 38 `soft`): `checkCircle` "Adım adım çözüm" / "Step-by-step solution" — "Cevap, kazanım ve sık hata" / "Answer, skill and common mistake"; `note` "Konu özeti" / "Topic summary" — "Sorunun konusunu tek sayfada" / "The topic on one page"; `quiz` "Benzer sorular" / "Similar questions" — "Testler’e 5 soru ekler" / "Adds 5 questions to Quizzes". Bu satırlar mobilde bilgi satırıdır (seçim değil); sağda ok vardır, dokununca kısa açıklama (doğrulanmadı).
- **Veri:** hak `GET student/usage`; gönderim §3.1.
- **Etkileşimler:** "Fotoğraf çek" → `m-ozet-kamera` [tam ekran modal]; "Galeri" → sistem seçici → §3.1 adım 3.
- **Hâller:** hak dolu → iki düğme pasif, kartın altında hak cümlesi ve `m-ozet-hak`'a yönlendirme; yükleniyor → düğme `loading`; dosya çok büyük → alanın altında "Dosya 12 MB sınırını aşıyor."; okunamadı → `m-ozet-okunamadi`.
- **Web farkı (`w-ozet-yeni`):** `ModuleHead` sekme 2 "Yeni analiz" aktif; başlık "Yeni analiz" / "New analysis"; alt yazı "soru-14.jpg yüklendi" / "soru-14.jpg uploaded" (dosya adı veriden). İki eşit sütun:
  - Sol `Card` 20: 320 px önizleme (köşe 16, kâğıt zemin `#F5F1E8`, içte 3 px kesikli `mod.color` kırpma çerçevesi, köşe 14); altında `ghost sm` `refresh` "Döndür" / "Rotate" ve `ghost sm` `scan` "Kırp" / "Crop".
  - Sağ: `WCard` "Ne istiyorsun?": üç seçilebilir satır (14 boşluk, köşe 16, 1,5 px kenar; seçili `mod.color` kenar, `mod.wash` zemin, 22 px onay kutusu `mod.action` + beyaz `check`; seçili değil `line` kenar, boş kutu): "Adım adım çözüm" (seçili), "Konu özeti" (seçili), "Benzer 5 soru" / "5 similar questions" (seçili değil). Altında `module lg block` `sparkles` "Analizi başlat · 1 hak" / "Start analysis · 1 credit".
- **Kurallar:** bir analiz bir hak düşer ve düğmede yazar; okunamazsa düşmez.

### 4.3 `m-ozet-kamera` Kamera
- **Görseller:** `acik/mobil/m-ozet-kamera.png`, `en/acik/mobil/m-ozet-kamera.png` (iki temada da koyu zemin).
- **Çerçeve:** odak ekranı; sekme çubuğu yok; zemin `#05070C`; durum çubuğu açık yazı (`lightStatus`). Canlı kamera görüntüsü tam ekran.
- **Yerleşim:**
  1. Üst satır (6 / 16 boşluk): solda `x`, sağda `zap` (flaş) — 40 × 40 daire, `rgba(255,255,255,0.14)` zemin, beyaz ikon 20.
  2. Kamera alanı (esner, 12 pt dikey boşluk). Çerçeve köşeleri: dört adet 38 × 38, 4 px `#C4B5FD` kenar, köşe 8 (sol/sağ 34 pt içeride; üst köşeler 60, alt köşeler 300 pt yükseklikte). Çerçevenin altında ortalı `Chip tone="moduleSolid"` `scan` "Soruyu çerçeveye al" / "Frame the question".
  3. Alt alan (alttan 40 pt, aralık 14): mod çipleri ortalı (aralık 8): "Tek soru" / "One question" (seçili, `moduleSolid`), "Sayfa" / "Page", "Video" / "Video" (`glass`).
  4. Düğme satırı (44 pt yan boşluk, arası eşit): solda galeri `image` (48 daire, `rgba(255,255,255,0.14)`); ortada deklanşör 78 pt (4 px beyaz halka, içte 62 pt beyaz daire); sağda `refresh` (kamera çevir) 48 daire.
- **Veri:** yok (yerel kamera); gönderim §3.1.
- **Etkileşimler:** `x` → kapanır [modal kapanışı], önceki sekme; flaş aç/kapa; mod çipi seçimi ("Sayfa" çok sorulu sayfa analizi, "Video" sekme 4'e geçer; davranış doğrulanmadı); galeri → sistem seçici; deklanşör → çekim ve gönderim (kısa titreşim); çevir → ön/arka kamera.
- **Hâller:** kamera hazırlanıyor ("Kamera hazırlanıyor…" bugünkü metin, ortada `LoadingLogo` değil, siyah zemin üstünde yazı); izin yok → açıklama + "Ayarları aç" + "Galeriden seç"; gönderiliyor → deklanşör kilitli ("Gönderiliyor…").
- **Web farkı:** web'de kamera ekranı yok; "Telefonla çek" ya da tarayıcının dosya girişi (`capture="environment"`).
- **Kurallar:** deklanşör tek dokunuşta tek çekim; gönderim sürerken ikinci çekim engellenir. Ekran kararmaz.

### 4.4 `m-ozet-isleniyor` Analiz ediliyor
- **Görseller:** `acik/mobil/m-ozet-isleniyor.png`, `koyu/mobil/m-ozet-isleniyor.png`, `en/acik/mobil/m-ozet-isleniyor.png`.
- **Çerçeve:** sekme çubuğu yok; `AppHeader` solda kapat (`x`), başlık "Analiz ediliyor" / "Analysing"; `wash` gradyanı.
- **Yerleşim (ortalı, üstten 30 pt, aralık 16):**
  1. Tarama görseli 180 × 180: dış kare köşe 40 `mod.soft`; içte (26 pt içeride) köşe 28 kâğıt `#F5F1E8` ve `float` gölge; ortadan geçen 4 pt tarama çizgisi `mod.color` ve 18 pt parıltı. Çizgi yukarı aşağı gider (izinli tek döngü yükleniyor sayılır; "Hareketi azalt" açıkken durur).
  2. "Sorunu okuyoruz" / "Reading your question" (`hero`).
  3. "Yaklaşık 20 saniye. Ekranı kapatsan da bitince haber veririz." / "About 20 seconds. We notify you if you leave." (`body`).
  4. `Card` 14 (tam genişlik, sola hizalı, aralık 12): `Bar` (`mod.color` / `mod.track`, değer ilerleme); üç adım satırı (ikon 18 + `small` `ink2`):
     - bitti: `checkCircle` `success` "Soru metni çıkarıldı" / "Question text extracted";
     - sürüyor: `refresh` `mod.color` "Konu ve kazanım bulunuyor" / "Finding topic and skill";
     - bekliyor: `clock` `subtle` "Adım adım çözüm yazılacak" / "Writing step-by-step solution".
- **Veri:** `GET student/lens/sessions/{id}` yoklaması; aşama ve ilerleme alanları (durum kodları API'de doğrulanmalı); `pollAfterSeconds`.
- **Etkileşimler:** `x` → ekran kapanır, analiz sürer (iptal değil); iptal ayrı eylem değil (bugünkü kodda "İptal" ve onay "Devam eden işlem iptal edilecek; kullanım hakkından düşmez." var; çizimde yok).
- **Hâller:** bitti → `m-ozet-sonuc` [replace]; okunamadı → `m-ozet-okunamadi` [replace]; uzun sürdü → "İşlem arka planda devam ediyor. Geçmişten takip edebilirsin." ve "Geçmişe git"; ağ koptu → yoklama durur, şerit çıkar, ağ gelince sürer.
- **Web farkı:** çizilmedi; detay sayfası yerinde aynı içerik (tarama görseli, başlık, adımlar).
- **Kurallar:** yoklama uygulama arka plandayken durur, öne gelince hemen bir kez sorar. Yoklama aralığı sunucudan.

### 4.5 `m-ozet-sonuc` Çözüm · web: `w-ozet-detay`
- **Görseller:** `acik/mobil/m-ozet-sonuc.png`, `koyu/mobil/m-ozet-sonuc.png`, `en/acik/mobil/m-ozet-sonuc.png`; `acik/web-panel/w-ozet-detay.png` (koyu, EN).
- **Çerçeve (mobil):** sekme çubuğu yok; `AppHeader` solda geri, ortada konu başlığı "Türev · Zincir kuralı" / "Chain rule" (`section`; veriden), sağda `more` (üç nokta, 22, kalınlık 3). `BottomBar border` (üstte `line2` çizgi, `card` zemin) iki düğmeli. İçerik `Content gap={12}`.
- **Yerleşim:**
  1. Çip satırı (aralık 8): `Chip tone="module"` `scan` "Akıllı Özet"; gri `Chip` "AYT Matematik" / "AYT Maths" (sınav + ders); `Chip tone="success"` `check` "Cevap: B" / "Answer: B".
  2. `SectionTitle` "Adım adım çözüm" / "Step by step".
  3. Adımlar (aralık 10): her adım satırı: 26 pt numara dairesi (`mod.action` zemin, beyaz `meta` 800); sağda adım başlığı (`headline` 14) ve altında formül kutusu (9 / 12 boşluk, köşe 12, `card` zemin, `line` kenar, `headline` 14,5). Örnek: "Zincir kuralını uygula" / "Apply the chain rule" — `f'(x) = 4(3x² − 2)³ · 6x`; "İçi hesapla (x = 1)" — `3 · 1² − 2 = 1`; "Yerine koy" / "Substitute" — `f'(1) = 4 · 1³ · 6 = 24`.
  4. Kazanım kartı `Card tone="module"` 14: `over` "Kazanım" / "Skill" (`mod.color`); metin (`small` `ink2`) "İç içe fonksiyonda türev: dıştakinin türevi × içtekinin türevi. AYT’de her yıl 1–2 soru."
  5. Sık hata kartı `Card` 14, 1,5 px `warningSoft` kenar: `over` "Sık hata" / "Common mistake" (`warningInk`); metin "İçteki fonksiyonun türevini (6x) çarpmayı unutmak."
  6. `SectionTitle` "Bu konuda devam et" / "Keep going on this topic".
  7. `List`: `ListRow module="lessons" icon="book"` "Konuyu çalış" / "Study the topic" — "Dersler · Türev · 18 dk"; `ListRow module="flashcards" icon="cards"` "Bilgi kartı yap" / "Make flashcards" — "Bu çözümden 3 kart" / "3 cards from this solution".
  8. `BottomBar` (aralık 10, eşit): `moduleSoft` Testler `quiz` "Benzer 5 soru" / "5 similar"; `dark` `sparkles` "SinoAI’ye sor" / "Ask SinoAI".
- **Veri:** `GET student/lens/sessions/{id}?outputDetail=full`: `modelCorrectAnswer` (cevap çipi), `modelSolutionText` (adımlara bölünür; adım başlığı ve formül ayrımı API'de doğrulanmalı), `modelLearningOutcome` (kazanım), `modelMistakeAnalysis` (sık hata), `confidenceScore`; konu ve ders adı; "Bu konuda devam et" satırları `practice-target` ve Dersler konu eşlemesinden (mikro ders sayısı kaynağı doğrulanmalı).
- **Etkileşimler:** §3.4. Formül kutusuna uzun basma → kopyala (doğrulanmadı). Geri → `m-ozet-vitrin`.
- **Hâller:** düşük güven (`confidenceScore` düşük) → çip satırının altında `warning` şeridi "Bu sonuçtan emin değiliz… daha net bir fotoğrafla yeniden dene." (bugünkü web metni; çizim yok); konu özeti istenmişse adımların altında "Konu özeti" bölümü (çizim yok); `practice-target` yoksa "Benzer 5 soru" gizlenir ve "SinoAI’ye sor" tam genişlik olur.
- **Web farkı (`w-ozet-detay`):** `Panel` üstte kırıntı "Akıllı Özet ›"; `ModuleHead` sekme 4 "Geçmiş" aktif; başlık konu; alt yazı "AYT Matematik · cevap B · bugün 14:10" / "AYT Maths · answer B · today 14:10"; eylemler `ghost` `file` "PDF" ve `dark` `sparkles` "SinoAI’ye sor". İki sütun `1fr 1.5fr`: sol (aralık 16) soru görseli kartı (160 px kâğıt), Kazanım kartı (18 boşluk), Sık hata kartı; sağ `WCard` "Adım adım çözüm": numara dairesi 32 px, adım başlığı `headline`, formül kutusu 12 / 16 boşluk, köşe 14, `line2` zemin, `section` 16; altında `moduleSoft` Testler `quiz` "Benzer 5 soru" / "5 similar questions" ve `moduleSoft` Bilgi Kartları `cards` "Kart yap" / "Make a card".
- **Kurallar:** cevap ve kazanım her zaman çözümün üstünde ya da yanında; düğmeler kendi modül renginde.

### 4.6 `m-ozet-okunamadi` Fotoğraf okunamadı
- **Görseller:** `acik/mobil/m-ozet-okunamadi.png`, `koyu/mobil/m-ozet-okunamadi.png`, `en/acik/mobil/m-ozet-okunamadi.png`.
- **Çerçeve:** sekme yuvası 2 "Soru yükle"; `PageTitle` "Soru yükle" / "Upload".
- **Yerleşim:** `StateBlock tone="warning" icon="image"` (64 pt kutu `warningSoft`, ikon `warningInk`): başlık "Fotoğraf okunamadı" / "We couldn’t read the photo"; metin "Soru bulanık ya da kesik görünüyor. Bu deneme hakkından düşmedi." / "The question looks blurry or cut off. This try was not counted."; içinde ipucu kutusu (10 / 12 boşluk, köşe 14, `line2` zemin, sola hizalı, aralık 6): üç satır `check` 15 `successInk` + `small` `ink2`: "Soruyu çerçevenin içine al" / "Fit the question in the frame", "Işık yansımasın, gölge düşmesin" / "Avoid glare and shadows", "Tek soru çek; şıklar da görünsün" / "One question, options included". Ana düğme `module block` "Yeniden çek" / "Retake"; ikincil yazı "Galeriden seç" / "Pick from gallery" (`small` 700 `mod.ink`).
- **Veri:** oturum durumu "okunamadı" (hata kodu API'de doğrulanmalı; bugün "reddedildi / başarısız" ayrımı var); hak düşmediği sunucuda garanti edilmeli (doğrulanmadı).
- **Etkileşimler:** "Yeniden çek" → `m-ozet-kamera` [modal]; "Galeriden seç" → sistem seçici.
- **Web farkı:** çizilmedi; `w-ozet-detay` yerinde aynı `StateBlock` ve "Yeniden yükle".
- **Kurallar:** ham hata metni gösterilmez; neden ve üç ipucu her zaman yazılır.

### 4.7 `m-ozet-hak` Aylık hak doldu
- **Görseller:** `acik/mobil/m-ozet-hak.png`, `koyu/mobil/m-ozet-hak.png`, `en/acik/mobil/m-ozet-hak.png`.
- **Çerçeve:** `m-ozet-vitrin` ile aynı (yuva 1).
- **Yerleşim:** `PageTitle` "Akıllı Özet" ve sağda çip "Bu ay 30 / 30" / "30 / 30 this month"; `StateBlock icon="clock"` (modül tonu): "Bu ayın analiz hakkı doldu" / "This month’s analyses are used up"; "Hakların 1 Aralık’ta yenilenir. Geçmiş analizlerin ve çözümlerin açık kalır." / "They renew on 1 December. Past analyses stay open."; ana düğme "Geçmiş analizlerim" / "My past analyses"; ikincil yazı "Bu arada SinoAI’ye sor" / "Ask SinoAI meanwhile".
- **Veri:** `GET student/usage` → `state = exhausted`, `resetsAtUtc` (tarih yerel biçimde "1 Aralık" / "1 December").
- **Etkileşimler:** "Geçmiş analizlerim" → geçmiş listesi [push]; "Bu arada SinoAI’ye sor" → SinoAI [tam ekran modal].
- **Web farkı:** çizilmedi; `w-ozet-vitrin` yükleme kutusunun yerinde aynı `StateBlock`; "Analizi başlat" pasif.
- **Kurallar:** yenilenme zamanı her zaman yazılır; geçmiş açık kalır. Bugün API'de Akıllı Özet ve SinoAI aynı aylık hakkı paylaşır (`student/usage`); "Bu arada SinoAI’ye sor" yalnız SinoAI'nin ayrı hakkı varsa gösterilir (§7 madde 4).

### 4.8 `m-ozet-pdf` Analiz PDF
- **Görseller:** `acik/mobil/m-ozet-pdf.png`, `koyu/mobil/m-ozet-pdf.png`.
- **Çerçeve:** sekme çubuğu yok; `AppHeader` geri + "Analiz PDF" / "Analysis PDF"; `BottomBar` iki düğme.
- **Yerleşim:** ortada 300 × 400 sayfa önizlemesi (köşe 10, beyaz, `float` gölge, 18 boşluk): üstte Sınavika logosu (16) ve "Akıllı Özet" (`meta` 12 `#5F6B7D`); 4 pt `mod.color` çizgi; konu başlığı (`headline` 14 `#0B1C30`); metin satırları; altta "1 / 3". Altında başarı şeridi (10 / 14 boşluk, köşe 14, `successSoft`): `checkCircle` 18 + "PDF hazır · 3 sayfa" / "PDF ready · 3 pages" (`small` 700 `successInk`). `BottomBar`: `ghost lg` `send` "Paylaş" / "Share"; `module lg` `file` "PDF aç" / "Open PDF".
- **Veri:** `POST .../{id}/exports/pdf` → `exportId`; `GET .../{id}/exports/{exportId}/download`; sayfa sayısı yanıttan (alan doğrulanmalı).
- **Etkileşimler:** "Paylaş" → sistem paylaşım sayfası; "PDF aç" → sistem PDF görüntüleyici.
- **Hâller:** hazırlanıyor → önizleme yerinde `LoadingLogo` ve "PDF hazırlanıyor"; hata → "Tekrar dene".
- **Web farkı:** "PDF" düğmesi dosyayı indirir (sayfa yok).
- **Kurallar:** PDF sayfası her zaman beyazdır (koyu temada da); logo ve marka renkleri sabit.

### 4.9 `m-ozet-video` Video analizi · web: `w-ozet-video`
- **Görseller:** `acik/mobil/m-ozet-video.png`, `koyu/mobil/m-ozet-video.png`; `acik/web-panel/w-ozet-video.png`.
- **Çerçeve:** sekme yuvası 4 "Video".
- **Yerleşim (mobil):** `PageTitle` "Video analizi" / "Video analysis", alt yazı "Ders videosundan özet ve soru" / "Summary and questions from a lesson video"; video kutusu 190 pt (köşe 22, `#1E1B4B` → `#4C1D95` 160° gradyan; ortada 64 pt beyaz daire ve `play` 26 `mod.color`; altta 4 pt çubuk `#C4B5FD` / `rgba(255,255,255,0.25)`); "Hücre bölünmesi · 18 dk" (`headline`); `SectionTitle` "Bölümler" / "Chapters"; `List` (`playCircle` ikonu, bölüm adı, zaman "00:00"); `module lg block` `quiz` "Bu videodan 10 soru üret" / "Make 10 questions from it".
- **Veri:** video oturumu `GET .../sessions/{id}` (`summarySections`, `keyPoints`, `concepts`; bölüm zamanı alanı doğrulanmalı), oluşturma §3.6.
- **Etkileşimler:** bölüm satırı → videoyu o zamana atlatır; "Bu videodan 10 soru üret" → üretim (uç doğrulanmalı) → Testler.
- **Web farkı:** `ModuleHead` sekme 3 "Video", alt yazı video adı · süre; iki sütun `1.5fr 1fr`: 420 px video (köşe 24, 84 px oynat dairesi, 5 px çubuk) ve sağda `WCard` "Bölümler" + aynı düğme.

## 5. Takılma ve kilitlenme önlemleri

- **Çift gönderim:** deklanşör, "Galeri" seçimi sonrası gönderim, "Analizi başlat" istek sürerken kilitli; aynı dosya iki kez gönderilmez (istemci tekrar anahtarı, sunucuda tekrar güvenli oluşturma; doğrulanmadı).
- **Yükleme:** multipart yüklemede ilerleme gösterilir; zaman aşımı 180 sn (README §7); dolunca "Tekrar dene" ve dosya korunur.
- **Yoklama:** `pollAfterSeconds`'a uyulur; arka planda durur; 20 dakikadan uzun işlemde ekran "arka planda sürüyor" hâline geçer, sonsuz dönmez. Web'de de üst sınır vardır (bugün yok, §7).
- **Ağ kopması:** işleniyor ekranında yoklama durur, çevrimdışı şeridi çıkar; analiz sunucuda sürer, bağlantı gelince devam eder. Sonuç ekranı son yüklenen hâliyle açık kalır.
- **Kamera:** izin reddi çıkmaz sokak değildir (galeri yolu). Kamera açılamazsa 5 sn içinde hata ve "Galeriden seç".
- **Uzun liste:** geçmiş sayfalı yüklenir (`skip`/`take`), sanallaştırılmış listeyle.
- **Geri:** kamera ve işleniyor yığında kalmaz; sonuçtan geri vitrine döner. İşleniyor ekranını kapatmak analizi iptal etmez.

## 6. Kabul testleri

| No | Tür | Platform | Ekran | Adımlar | Beklenen sonuç |
|---|---|---|---|---|---|
| 1 | görsel | ikisi | `m-ozet-vitrin`, `w-ozet-vitrin` | Örnek veriyle TR/EN × açık/koyu | PNG ile aynı |
| 2 | birim | ikisi | hak çipi | Kullanılan 7, toplam 30; TR ve EN | "Bu ay 7 / 30" / "7 / 30 this month" |
| 3 | e2e | mobil | `m-ozet-yukle` → `m-ozet-kamera` → `m-ozet-isleniyor` → `m-ozet-sonuc` | Fotoğraf çek, bekle | Tek `POST sessions`; yoklama `pollAfterSeconds`'a uyar; sonuç açılır; geri vitrine döner |
| 4 | e2e | mobil | `m-ozet-kamera` | Deklanşöre iki kez hızlı bas | Tek çekim, tek istek |
| 5 | e2e | mobil | `m-ozet-kamera` | Kamera iznini reddet | Açıklama, "Ayarları aç" ve galeri yolu |
| 6 | e2e | ikisi | yükleme | 13 MB dosya seç | İstek gitmez; "Dosya 12 MB sınırını aşıyor." |
| 7 | e2e | ikisi | yükleme | PDF seç | PDF kabul edilir ve analiz başlar (§7 madde 1 kapanınca) |
| 8 | e2e | mobil | `m-ozet-isleniyor` | Uygulamayı arka plana al, 30 sn sonra dön | Yoklama arka planda durmuş, dönünce hemen sorar |
| 9 | e2e | mobil | `m-ozet-isleniyor` | `x` ile çık | Analiz sürer; geçmişte "İşleniyor"; bitince bildirim |
| 10 | e2e | ikisi | `m-ozet-okunamadi` | Bulanık fotoğraf gönder | Okunamadı hâli; hak sayacı değişmez |
| 11 | e2e | ikisi | `m-ozet-hak` | Hakkı dolu hesapla aç | Hak hâli, yenilenme tarihi; yükleme düğmeleri pasif; geçmiş açık |
| 12 | e2e | ikisi | `m-ozet-sonuc` | "Benzer 5 soru" | `practice-target` çağrılır, Testler 5 soruyla açılır; hedef yoksa düğme yok |
| 13 | e2e | ikisi | `m-ozet-sonuc` | "SinoAI’ye sor" | SinoAI sohbeti analiz bağlamıyla açılır |
| 14 | e2e | ikisi | `m-ozet-sonuc` | "Konuyu çalış", "Bilgi kartı yap" | Dersler konu ekranı / kart üretimi |
| 15 | bileşen | ikisi | `m-ozet-sonuc` | Düşük güvenli sonuç | Uyarı şeridi görünür |
| 16 | e2e | mobil | `m-ozet-pdf` | PDF oluştur, paylaş | Dışa aktarma bir kez istenir; paylaşım sayfası açılır |
| 17 | e2e | web | `w-ozet-yeni` | Dosya bırak, "Analizi başlat · 1 hak"a iki kez tıkla | Tek istek; detay sayfası işleniyor hâliyle açılır |
| 18 | e2e | ikisi | işleniyor | Yanıt 180 sn gelmesin | Hata hâli, "Tekrar dene"; donma yok |
| 19 | erişilebilirlik | mobil | `m-ozet-kamera` | Ekran okuyucu | `x`, flaş, galeri, deklanşör, çevir düğmelerinin adı var; ≥ 44 pt |
| 20 | erişilebilirlik | ikisi | `m-ozet-sonuc` | En büyük yazı | Formül kutuları sarar, kesilmez; `BottomBar` içeriği örtmez |
| 21 | erişilebilirlik | ikisi | bütün ekranlar | Kontrast | `mod.ink` ve `#7C3AED` üstü beyaz ≥ 4,5:1 |
| 22 | dil | ikisi | bütün ekranlar | EN | "Lens" sözcüğü hiçbir yerde görünmez |
| 23 | e2e | ikisi | bütün ekranlar | Android geri / web geri | Kamera ve işleniyor geri yığında kalmaz |
| 24 | görsel | ikisi | `m-ozet-*`, `w-ozet-*` bütün çizimler | TR/EN × açık/koyu | İlgili PNG'lerle aynı |

## 7. Çizim ile bugünkü kod arasındaki farklar

1. **PDF yükleme yok:** çizimde mobil alt yazı "Fotoğraf, galeri ya da PDF", web "JPG, PNG, PDF"; iki istemcide de PDF kaynak olarak seçilemiyor. Web girişi `accept="image/*"`, ipucu "JPG, PNG, WEBP · en fazla 12 MB" (`W pages/LensHomePage.tsx`); mobilde yalnız kamera ve galeri (`M screens/LensUploadScreen.tsx`). Bugünkü "PDF" yalnız sonucu dışa aktarmak.
2. **"Benzer 5 soru" yok:** mobilde takip düğmesi "Bu konudan test çöz" ("{{topic}} · {{count}} test", `QuizLessonSub` açar; `M components/LensQuestionFollowUpActions.tsx`); webde ne benzer soru ne konu testi var, yalnız "SinoAI'ye sor".
3. **"Bu konuda devam et" bölümü yok:** mobilde başlık "Sırada ne var?"; "Konuyu çalış" (Dersler) ve "Bilgi kartı yap" satırları iki istemcide de yok.
4. **Hak gösterimi:** çizim "Bu ay 7 / 30"; iki istemci yüzde gösteriyor ("Kullanımın %{{percent}} · {{date}} tarihinde yenilenir"). API (`GET student/usage`) yalnız `usedPercent`, `state`, `resetsAtUtc`, `isTrial` döndürüyor; analiz sayısı ve toplam yok. Hak Akıllı Özet ve SinoAI için ortak (tek yapay zekâ hakkı), çizim ise ikisine ayrı hak çiziyor.
5. **Hak doldu hâli:** mobilde ayrı `StateBlock` yok; sayaç metni "Bu ayki kullanım hakkın doldu; {{date}} tarihinde yenilenir." ve `LensCreditGateBanner` ("Kullanım hakkı", "Paketlere git"). Çizimde "Geçmiş analizlerim" ve "Bu arada SinoAI’ye sor" var, "Paketlere git" yok. Web sunucu mesajını olduğu gibi gösteriyor (`lensErrorPresentation.ts`).
6. **Okunamadı hâli yok:** iki istemcide de ayrı "Fotoğraf okunamadı" ekranı ve üç ipucu yok; genel başarısız / reddedildi ("Bu kaynak kabul edilmedi…", web "İçerik politikası nedeniyle işlem reddedildi."). Hakkın düşmediği yalnız iptal için yazıyor; okunamadıda düşüp düşmediği doğrulanmadı.
7. **Rota adları:** Düzeltildi (17 Kasım 2026): Registry `m-ozet-yukle` rotası `LensNew · LensUpload` oldu (`LensSessionCreate` video formudur, yığın `LensVideo`).  için `LensUpload` diyor, ama bu ayrı bir hâl değil.
8. **Kamera:** mobilde ders çipleri (Matematik / Geometri / Fizik) var; çizimde mod çipleri (Tek soru / Sayfa / Video), flaş ve kamera çevirme var. Çizimdeki "Sayfa" modu kodda yok.
9. **Web sekmeleri:** Düzeltildi (17 Kasım 2026): bütün web Akıllı Özet çizimleri dört hapı gösterir (Akıllı Özet · Yeni analiz · Video · Geçmiş); `w-ozet-gecmis`'te Geçmiş seçili. Webde ayrıca `/student/lens/video` ana sayfası var; Registry'de yok.
10. **Web "Telefonla çek":** çizimde var; web kodunda "Kamerayla çek" (`capture="environment"`).
11. **Web yeni analiz:** çizimde "Döndür", "Kırp" ve üç seçilebilir çıktı (Benzer 5 soru dahil) ile "Analizi başlat · 1 hak"; webde isteğe bağlı not "Notun", ipuçları "Daha iyi sonuç için" ve "Analizi başlat" (hak metni yok); çıktı seçimi ve kırpma doğrulanmadı.
12. **Web işleniyor:** web 5 sn sabit aralıkla yokluyor, üst sınır yok; metin "Bu işlem 30–90 saniye sürebilir. Sayfayı kapatma." (çizim "Yaklaşık 20 saniye. Ekranı kapatsan da bitince haber veririz.").
13. **Çevrimdışı:** iki istemcide de fotoğraf analizi için çevrimdışı şeridi bulunmadı (web yalnız video yoklamasında "Bağlantı geçici olarak kesildi; otomatik yeniden deneniyor.").
