# Tablet ve kalem: çizimler ve özelleştirmeler

Güncelleme: 4 Kasım 2026. Çizimler: `src/UIUX/Screens/Tablet/`, parçalar `src/UIUX/Parts/Tablet.tsx` ve `src/UIUX/Parts/Ink.tsx`. Görseller: `Desktop\Sinavika-UIUX3\acik\tablet`, `koyu\tablet`, panolar 37–42.

Bu belge mobil uygulama ekibine (sinavika_mobile_reactnative) devir notudur. Motor yalnız tasarımı çizer; kod mobil repoda yazılır.

## 1. Bugün uygulamada ne var

Kaynak: `src/shared/annotations` ve Denemeler'in çözüm ekranları (okundu, değiştirilmedi).

| Konu | Bugün |
|---|---|
| Kalem takımı | Skia; araçlar Kalem, Fosforlu kalem (opaklık 0,35), Silgi; kalınlık İnce 2 / Orta 4 / Kalın 8; Geri al, İleri al, Sayfayı temizle; Parmakla çizim |
| Yüzeyler | `scratchpad` (Taslak kâğıdı) ve `questionOverlay` (Soru üzeri işaretleme) |
| Kaydırma | Soru üzerinde Kaydır modu / Çizim modu; çizimde sayfa kilitlenir |
| Nerede | Yalnız Denemeler: çözme (`ExamStudentScratchpadPanel`, başlıkta kalem ve fırça düğmeleri), çözümlerde salt okunur katman (`ExamSolutionQuestionBlock`) |
| Kayıt | Sunucuya senkron (deneme notları) |
| Yerleşim | `compact` < 600, `tabletPortrait` 600–899, `tabletWide` ≥ 900 pt; geniş modda taslak sağda %38 |
| Kapı | `isAnnotationDevice` = yerel tablet ve genişlik ≥ 600 |
| Eksik | Testler (Quiz) ve Dersler (Works v4) kalemsiz |

## 2. Çizilen ekranlar (16)

| Pano | Kimlik | Ekran | Ne gösteriyor |
|---|---|---|---|
| Denemeler | `t-deneme-coz-taslak` | Taslak kâğıdı | Soru solda, kâğıt sağda %38; araç çubuğu kâğıdın kenarında dikey; "Taslak bu soruya kayıtlı" |
| | `t-deneme-coz-isaretleme` | Soruya yaz | Fosforlu kalem, altını çizme, şık eleme (üstü çizili, soluk), seçilen şık daire içinde, kararsız şıkta "?", sağda kenar notu sütunu |
| | `t-deneme-coz-dikey` | Dikey | Şıklar üç sütun, taslak alt yarıda; parmakla çizim açık → Kaydır / Çiz anahtarı araç çubuğunda |
| | `t-deneme-cozum-notlar` | Çözüm · notlarım | Öğrencinin işaretleri salt okunur, göster/gizle; taslağı resmî çözümün yanında |
| | `t-deneme-kalem-ipucu` | İlk açılış ipucu | Kalemli tablette ilk çözümde tek ipucu, Soruya yaz düğmesinde |
| Testler | `t-test-coz-taslak` | Taslak kâğıdı | **Yeni.** Anında geri bildirim soru sütununda, işlem yanda kalır |
| | `t-test-coz-yanlis` | Yanlış · taslağı göster | Taslak yerinde kalır; "Taslağımı SinoAI'ye göster" ve konunun mikro dersi |
| | `t-test-sekilli-soru` | Şekle yaz | Kalem şeklin üstüne yazar; şıklar sağ sütunda |
| Dersler | `t-ders-vitrin` | Dersler · yatay | Sekme çubuğu yerine yan ray; kaldığın yer ve tekrar yan yana, dersler üç sütun, Notlarım üstte |
| | `t-ders-tanim-not` | Tanım · kenar notu | **Yeni.** Okuma sütunu + sağda 290 pt kenar boşluğu; fosforlu kalem ve not adıma kayıtlı |
| | `t-ders-soru-eleme` | TYT tarzı soru · eleme | Şıklar kalemle elenir; cevap yine dokunarak verilir |
| | `t-ders-bosluk-el-yazisi` | Boşluk doldur · el yazısı | Kalemle kutuya yazılır, okunan sözcük gösterilir, sonra Kontrol et; Klavyeyle yaz her zaman var |
| | `t-ders-notlarim` | Notlarım | **Yeni ekran.** Konunun tüm notları mikro derse göre; dokununca adımına gider; PDF olarak al |
| Bilgi Kartları | `t-kart-el-yazisi` | Önce kendin yaz | Ön yüzde isteğe bağlı yazma alanı; kontrol edilmez |
| Modüller | `t-hub-moduller` | Modüller · yatay | İki slayt yan yana, kartlar dört sütun; kalemli modüllerde "Kalem" etiketi |
| Kalem | `t-kalem-ayarlar` | Profil · Kalem ve çizim | Ayarların tamamı (§3.6) |

## 3. Tablet için özelleştirme önerileri

### 3.1 Kalem çizer, parmak kaydırır (en önemlisi)

- Kalem ekrana değince çizim başlar; parmak her zaman kaydırır. Böylece Kaydır / Çizim modu çoğu öğrenci için gereksiz olur.
- Kaydır / Çiz anahtarı yalnız **Parmakla çizim** açıkken araç çubuğunda görünür (`t-deneme-coz-dikey`).
- Avuç içi reddi her zaman açık; ayarı yok.
- iOS: `UITouch.type == .pencil` (Skia dokunuşlarında `touchType`/`pointerType` 'pen'). Android: `MotionEvent.TOOL_TYPE_STYLUS` (S Pen).

### 3.2 Araç çubuğu

- Metni hiç kapatmaz: yatayda ekranın ya da kâğıdın kenarına **dikey** yapışır; dikey tutuşta kâğıdın altında yatay durur.
- Sıra: (Kaydır/Çiz) · Kalem, Fosforlu kalem, Silgi · renkler · İnce/Orta/Kalın · Geri al, İleri al · Parmakla çizim · Temizle.
- Renkler: kalemde mürekkep, mavi, kırmızı, yeşil; fosforlu kalemde sarı, yeşil, pembe. Turuncu yok (marka ve Denemeler rengiyle karışmasın). Koyu temada mürekkep açık renge döner (`PEN` tablosu, `Parts/Ink.tsx`).
- Etkin araç modülün açık tonunda; düğmeler 40 pt (dokunma hedefi ≥ 44 pt satırla).
- Apple Pencil çift dokunuş / sıkma ve S Pen düğmesi: varsayılan Silgi'ye geçiş (ayarlanabilir).

### 3.3 Yerleşim

- `tabletWide` (≥ 900 pt): soru solda, taslak sağda 454 pt (%38). Soru sütunu küçülür, kâğıt küçülmez.
- `tabletPortrait`: taslak alt yarıda, tutamaçla büyütülür; şıklar kısa ise üç sütun.
- Dersler'de taslak yerine **kenar boşluğu** (290 pt): adımın metni okuma genişliğinde (≤ 760 pt) kalır, not yanına yazılır.
- Modül ekranlarında yatayda yüzen sekme çubuğu yerine **yan ray** (96 pt); içerik en çok 1080 pt.
- Soru haritasında notlu soruda küçük kalem rozeti.

### 3.4 Notlar soruya ve adıma bağlı

- Her not bir yere bağlı: deneme sorusu, test sorusu ya da mikro ders adımı. Aynı soruya dönünce not geri gelir.
- Çözümlerde öğrencinin notları **salt okunur** gösterilir, göster/gizle düğmesiyle (ayarda varsayılan açık).
- Dersler'de **Notlarım**: konunun bütün notları tek yerde, mikro derse göre; PDF olarak alınabilir (mevcut markalı PDF şablonuyla).

### 3.5 Kalemle cevap

- Boşluk doldur adımında el yazısı tanıma: önce "Okunan: …" gösterilir, öğrenci onaylayınca kontrol edilir. Tek deneme kuralı değişmez. Klavye her zaman seçenek.
- Tanıma cihazda yapılır (iOS: Vision / PencilKit tanıma; Android: ML Kit Digital Ink, Türkçe modeli). Sunucuya yalnız okunan metin gider.
- Çoktan seçmeli sorularda cevap **dokunarak** verilir; kalemle daire çizmek cevap sayılmaz (yanlış işaretlemeyi önler).
- Bilgi Kartları'nda "Önce kendin yaz" isteğe bağlıdır ve kontrol edilmez.

### 3.6 Ayarlar (Profil → Kalem ve çizim)

| Ayar | Seçenekler | Varsayılan |
|---|---|---|
| Parmakla çizim | açık / kapalı | Kapalı |
| Kalemde çift dokunuş | Silgi / Son araç / Kapalı | Silgi |
| Varsayılan renk | mürekkep, mavi, kırmızı, yeşil | Mürekkep |
| Varsayılan kalınlık | İnce / Orta / Kalın | Orta |
| Taslak kâğıdının yeri (yatay) | Sağda / Solda | Sağda (dikeyde hep altta) |
| Çözümlerde notlarımı göster | açık / kapalı | Açık |
| Notlar | hesaba kayıtlı, sayısı | — |

Kalem yoksa (parmakla kullanılan tablet) ekranlar aynı kalır; Parmakla çizim ilk kullanımda önerilir.

### 3.7 SinoAI ve taslak

- Yanlış cevapta "Taslağımı SinoAI'ye göster": yalnız öğrenci isterse gönderilir; SinoAI önce okuduğu satırları gösterir, sonra hatayı anlatır.
- Taslak hiçbir zaman kendiliğinden gönderilmez. SinoAI kotası olağan kurallarla düşer.

## 4. Mobil ekip için işler

1. **Testler'e kalem**: `QuizSolve` ekranına `scratchpad` ve `questionOverlay` hostları (Denemeler'deki panel ve katman bileşenleri yeniden kullanılır). Not anahtarı: test oturumu + soru.
2. **Dersler'e kalem**: `WorkMikro` adımlarına `questionOverlay` (adımın tamamı) ve kenar boşluğu; Question adımlarında `scratchpad`. Not anahtarı: mikro ders + adım.
3. **Notlarım** ekranı (`WorkNotes`, yeni rota): konuya göre not listesi ve adıma derin bağlantı.
4. **Kalem çizer, parmak kaydırır**: dokunuş türüne göre ayrım; mod anahtarı yalnız parmakla çizimde.
5. **Ayarlar**: Profil'e "Kalem ve çizim" bölümü (§3.6), cihazda saklanır, hesapla eşitlenir.
6. **El yazısı tanıma**: Boşluk doldur adımında, cihazda.
7. **Yan ray ve geniş yerleşim**: `tabletWide`'da modül sekmeleri yan raya, içerik 1080 pt.

API ekibine (devir ayrı md ile): Quiz ve Works notları için deneme notlarıyla aynı biçimde saklama ve senkron (soru / adım anahtarı, sürüm, silme). Bugünkü deneme notu uç noktaları örnek alınır; yeni tablo ve göç sahibin onayıyla.

## 5. Kurallar (çizimlerde uygulandı)

- Modül ekranlarında modül rengi; kalem renkleri modül renginden bağımsız ve turuncusuz.
- El yazısı yazı tipi değil, tek çizgili kalem izi (`HandText`); marka yazı tipi yalnız Manrope.
- Yazı en küçük 12 pt, okuma metni tablette 18–20 pt.
- Turlar yok: kalem için tek ipucu, ilk karşılaşmada.
