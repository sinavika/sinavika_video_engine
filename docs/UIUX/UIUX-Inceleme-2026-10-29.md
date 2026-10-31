# UI/UX incelemesi ve optimizasyon planı

29 Ekim 2026. Sahibin isteği: Works v4'e göre Dersler ekranlarını güncellemek, modüllerdeki fazla turuncuyu modül rengine çevirmek, verilen UI/UX kaynaklarına göre hataları ve eksikleri bulmak. **Bu belge yalnız inceleme ve plandır; kod değişmedi.**

İncelenenler:
- **Tasarım kodu:** `src/UIUX` (179 çizim: 100 mobil, 65 web, 14 site). Açık tema panoları bugün yeniden üretilip tek tek bakıldı.
- **Works v4:** API'deki `docs/works/Works-v4-*.md` planları ve `docs/frontend/student-works-api.md` sözleşmesi.
- **Önceki raporlar:** `UIUX-Degerlendirme-2026-10-25.md`, `UIUX-Duzeltmeler-2026-10-25.md`, masaüstündeki `UYUM-KONTROLU-2026-10-27.md`.
- **Kaynaklar:** NN/g (gençler, 10 sezgisel ilke, onboarding), CAST UDL 3.0, EEF dijital teknoloji rehberi, UX Magazine (özerklik, aidiyet, yetkinlik), Retrieval Practice, Laws of UX, Apple HIG, Material 3, Baymard, WCAG 2.2, Android kalite rehberi.

## 1. Kısa sonuç

Yapı sağlam: modül kimliği, sabit sekme düzeni, "Bugün ne çalışalım?" girişi ve Ders Çalış v4'ün adım adım akışı kaynakların önerdiği yönde. Ama üç büyük sorun var:

1. **Dersler modülünün yarısı artık var olmayan bir ürünü çiziyor.** Works v4 öğrenme rotasını, geçmişi, konu ağacını ve eski mikro ders oynatıcısını kaldırdı. Tasarımda bunların 12 ekranı duruyor. Yeni yapının ana sayfası, konu listesi ve Tekrar ekranı ise hiç çizilmemiş.
2. **Turuncu her yerde, çünkü varsayılan turuncu.** Ortak `Button`, halka, ilerleme çubuğu, anahtar ve odak çizgisi modülü bilmiyor; ekran ayrıca renk vermezse turuncu çiziliyor. Kuralın kendisi de böyle yazılmış: "Ana eylem her zaman marka turuncusu" (`ModuleIdentity.ts`). Sonuç: Testler'de mor ekranda turuncu düğme, Bilgi Kartları'nda pembe ekranda turuncu "Cevabı gör".
3. **Düğme yazıları kontrast sınırının altında.** Beyaz yazı turuncu düğmede 3,56:1 (en az 4,5:1 olmalı). Koyu temada modül düğmeleri 1,5–3,0:1. Bu, WCAG 2.2 ve Android kalite rehberinin açık şartı.

## 2. Kaynaklardan Sınavika'ya uyan ilkeler

| Kaynak | İlke | Bizdeki durum |
|---|---|---|
| NN/g · gençler | Kısa metin, büyük yazı, bölünmüş içerik; sürükle-bırak ve küçük hedeflerden kaçın; çocuksu dil yok | v4 adımları kısa ve iyi. Sıralama adımı dokunarak çalışıyor (iyi). Küçük düğmeler 36 pt |
| NN/g · 10 ilke | Tutarlılık, kullanıcı kontrolü, hata önleme ve hatadan kurtulma | Mobil oynatıcıda geri adım yok, web'de var. Çıkışta "ilerlemen kaydedildi" güvencesi yok. Ağ hatası durumu çizilmemiş |
| NN/g · onboarding | Önce arayüzü düzelt; kart destesi tanıtımları işe yaramaz; bağlamsal ipucu daha iyi; sıradan simgeyi anlatma | 9 adımlı onboarding + 4 adımlı tur. Tur 3 sıradan bir simgeyi (Profil) anlatıyor |
| UX Magazine · SDT | Özerklik (sıra ve hız öğrencide), yetkinlik (bağlamsal yardım, kolay başla, derinleş), aidiyet (az ve yerinde bildirim) | Konu haritasında öğrenci istediği mikro derse geçebilmeli. Mobil oynatıcıda SinoAI yardımı yok |
| CAST UDL 3.0 | Birden çok sunum (dinle, video, görsel), eyleme dönük geri bildirim (8.5), ilerlemeyi izleme (6.4), beklenti ve inanç (9.1) | "Dinle" ve video var (iyi). Tekrar listesine düşmek kırmızı bir hata kutusuyla gösteriliyor; ceza gibi okunuyor |
| EEF · dijital teknoloji | Teknoloji açıklamayı, alıştırmayı (geri çağırma, aralıklı tekrar) ve geri bildirimi güçlendirdiğinde işe yarar | Works v4'ün 1-3-7 gün tekrarı tam bu, ama tasarımda Tekrar ekranı ve günlük yüzeyi yok |
| Retrieval Practice | Düşük riskli sık yoklama, aralıklı tekrar, karışık alıştırma | Testler ve Tekrar var; Bilgi Kartları ile Works tekrarı iki ayrı yerde, birleşik bir "bugün tekrar" yok |
| Laws of UX | Von Restorff: tek ana eylem tek renkte öne çıkar. Benzerlik: aynı renk aynı gruptur. Hedef gradyanı ve Zeigarnik: ilerleme ve yarım kalan iş çeker | Turuncu her yerde olunca ana düğme öne çıkmıyor ve Testler'deki turuncu düğme Denemeler'e aitmiş gibi okunuyor |
| Apple HIG, Material 3, Android | Dokunma hedefi 44 pt (iOS), 48 dp (Android); metin 4,5:1; iki tema; durum korunur | `sm` düğme 36 pt; turuncu düğme 3,56:1; v4 ekranlarının koyu teması üretilmemiş |
| WCAG 2.2 | 1.4.3 kontrast, 2.5.7 sürükleme yerine tek dokunuş, 2.5.8 hedef boyutu, 3.3.8 erişilebilir giriş | Kodla giriş ve dokunarak sıralama uyumlu; kontrast uyumsuz |
| Baymard · mobil | Ödeme ve abonelikte şartlar açık; form alanı az; hesap yalnız gerekince | Deneme süresi ekranı açık (iyi). Web'de deneme yokken tasarımda "3 gün ücretsiz" duruyor |

## 3. Bulgular

Önem: **P0** yanlış ürünü çiziyor ya da temel akışı bozar · **P1** belirgin sürtünme, erişilebilirlik ya da güven kaybı · **P2** cila.

### 3.1 Works v4 uyumu

| # | Bulgu | Önem | Öneri |
|---|---|---|---|
| W1 | Silinen özelliklerin 12 ekranı duruyor: mobil `m-ders-vitrin`, `m-ders-agac`, `m-ders-akis`, `m-ders-bitti`, `m-ders-rota`, `m-ders-gecmis`; web `w-ders-vitrin`, `w-ders-agac`, `w-ders-detay`, `w-ders-rota`, `w-ders-gecmis`, `w-ders-calis` | P0 | Çizimler, kodları (`Learn.tsx`, `LearnWeb.tsx` içindeki ders bölümü) ve masaüstü PNG'leri silinir |
| W2 | Yeni yapının ana ekranları yok: Dersler ana sayfası (`GET continue` + `GET reviews` + TYT/AYT gruplu dersler), konu listesi (yakında konular gri, süre, ilerleme) ve Tekrar | P0 | Mobil ve web için 3'er yeni ekran |
| W3 | Modül kimliği eski: sekmeler "Dersler · Konu ağacı · Geçmiş", kart alt yazısı "Mikro ders ve öğrenme rotası", slayt "Ders 4/9" | P0 | Sekmeler **Dersler · Konular · Tekrar** (karar 1), alt yazı ve slayt `continue` verisine göre |
| W4 | Boşluk doldurmada "Tekrar dene" çizilmiş; API bu adıma tek deneme veriyor | P1 | Yanlışta adım kapanır: doğru sözcük ve açıklama gösterilir |
| W5 | TYT sorusunda "Bir ipucu daha" düğmesi var; API'de ipucu istemek yok, ipucu yalnız yanlış cevapla açılıyor | P1 | Düğme kalkar; öğrenci başka şıkkı seçer. Kalan deneme sayısı yazılır |
| W6 | "Kartlarıma ekle" düğmesinin API karşılığı yok (Works ile kart bağı kaldırıldı) | P1 | Düğme kalkar ya da "yakında" diye işaretlenir. API ajanına not |
| W7 | Adım türlerinden Kural, Örnek ve Görsel çizilmemiş; soru şekli (`question.figure`, ör. geometri üçgeni) de yok | P1 | Mobil 4 adım ekranı; web'de aynıları oynatıcının içinde |
| W8 | Konu girişinde video her zaman var gibi çizilmiş; API'de video adresi şimdilik boş. Henüz dersi olmayan alt konular (`isAvailable: false`) haritada yok | P1 | Videosuz düzen varsayılan; "yakında" satırları gri |
| W9 | Günlük konu hakkı bitince ya da abonelik yokken (`403 PAYWALL`) ne görüneceği çizilmemiş | P1 | Alt sayfa: "Bugünkü konu hakkın bitti" ve abonelik yolu |
| W10 | Web'de dört etkileşim adımı (doğru/yanlış, sırala, boşluk) ve konu sonu yok; konu girişi panel çerçevesi olmadan 1440 px'in yarısını kullanıyor | P1 | Web'e 4 ekran; konu girişi panelin içinde, iki sütun |
| W11 | v4 ekranlarının koyu teması üretilmemiş (yalnız `ders-v4/acik`) | P1 | Ana setin içine alınır, iki temada üretilir |
| W12 | v4 kendi düğme ve çubuk bileşenlerini yazmış (`Action`, `Segments`, `RoundButton`); başlık etiketi metni modül rengiyle yazıyor (gök mavisi beyazda 4,1:1) | P2 | Ortak parçalara taşınır; metin `moduleInk` ile |
| W13 | Bağlı ekranlarda eski kavram: Ders Planı önerisinde "Rotadan", web ana sayfada "25 dakikalık mikro ders" (v4 mikro dersi 2–6 dk), SinoAI'de "Çalışma oluştur" (API planına göre kalkıyor, API kodunda hâlâ var) | P1 | Öneri kaynağı "Dersler · sıradaki mikro ders" ve "Tekrar"; süre düzeltilir; SinoAI aracı API kesinleşince çıkarılır |
| W14 | Ad karışık: API, panel ve pano başlıkları "Ders Çalış", öğrenci arayüzü "Dersler" | P2 | Öğrencinin gördüğü her yerde "Dersler"; "Ders Çalış v4" panosu "Dersler" olur |

### 3.2 Renk ve turuncu

| # | Bulgu | Önem | Öneri |
|---|---|---|---|
| R1 | Kural yanlış yönde: "ana eylem her zaman turuncu". Ortak parçaların varsayılanı da turuncu (düğme, halka, ilerleme, adım noktaları, anahtar, giriş kutusu odağı, grafik çizgisi) | P0 | Yeni kural: **modülün içinde vurgu modülün rengindedir.** Turuncu yalnız marka yüzeylerinde kalır: logo, giriş ve kayıt, onboarding, ödeme ve abonelik, site. Ortak parçalar rengi bağlamdan alır (tek yerde) |
| R2 | Modül ekranlarında turuncu düğmeler: Testler "Orta seviyeyi başlat", "Zor seviyeye geç"; Bilgi Kartları "Cevabı gör"; SinoAI "Testi aç"; Ders Planı ilerleme grafiği ve hedef net; web Testler "Önce bunu çalış" | P0 | R1 ile kendiliğinden modül rengine döner; kalanlar ekran ekran düzeltilir |
| R3 | Başka modüle geçiren düğmenin rengi karışık: Konu sonu "Kolay seviye testi" mor (doğru), SinoAI "Testi aç" turuncu | P1 | Kural: başka modülü açan düğme **o modülün** rengindedir. SinoAI'nin kendi ana eylemi koyu gri |
| R4 | Ana ekranda "Destek" kartı tam turuncu; destek ana eylem değil | P1 | Nötr kart |
| R5 | Denemeler'in rengi (#E8590C) marka turuncusuyla (#EA580C) neredeyse aynı | P2 | Denemeler turuncu kalır (karar 4). R1'den sonra modüller arasında turuncu yalnız Denemeler'de görüneceği için karışma biter |
| R6 | Modül sayfalarının üst çubuğunda turuncu logo, altında modül rozeti, altında büyük modül başlığı: aynı bilgi üç kez | P2 | Logo yalnız Modüller ana ekranında; modül sayfalarında profil, başlık ve zil (karar 3) |

### 3.3 Erişilebilirlik

| # | Bulgu | Önem | Öneri |
|---|---|---|---|
| E1 | Beyaz yazı turuncu düğmede 3,56:1; koyu temada 2,80:1 | P1 | Düğme dolgusu bir ton koyu: `#C2410C` (5,18:1). Logo ve simgeler `#EA580C` kalır (karar 2) |
| E2 | Modül düğmeleri açık temada: Dersler 4,10, Ders Planı 3,74, Denemeler 3,58; koyu temada hepsi 1,5–3,0 (koyu temada açık renk dolgu + beyaz yazı) | P1 | Her modüle bir "eylem rengi": beyaz yazının 4,5:1 tuttuğu ton (Dersler `#0277B3`, Ders Planı `#0C857A`, Denemeler `#C54C0A`; Testler, Akıllı Özet ve Bilgi Kartları zaten geçiyor). İki temada aynı. Test eşiği 3'ten 4,5'e çıkar |
| E3 | `sm` düğme 36 pt, sekme ve filtre hapları ~32 pt | P2 | Görünür boy aynı kalabilir, dokunma alanı 44 pt; Rehber'e kural, uygulamalara not |
| E4 | Sekme etiketleri sığmıyor ("Denemeler Denemelerim" bitişik, "Kaydedilenler") | P2 | Kısa etiket (ör. "Benim", "Kayıtlı") ya da ölçüye göre küçülme; karar gerekmez, çizimde denenir |

### 3.4 Öğrenme deneyimi

| # | Bulgu | Önem | Öneri |
|---|---|---|---|
| Ö1 | Testlerde yanlış cevap ekranı çizilmemiş; yalnız doğru hali var. Yanlıştan sonra öğrenci nereye gidecek, belirsiz | P1 | Yanlış hali: açıklama, "Bu konuyu 4 dk'lık mikro dersle çalış" (Dersler mavisi) ve "SinoAI'ye sor". Soru → mikro ders eşlemesi için API'de küçük bir uç gerekebilir (not) |
| Ö2 | İki ayrı tekrar kuyruğu (Bilgi Kartları ve Works) ve hiçbiri günün ilk ekranında değil | P1 | Ana ekran slaytında ve Ders Planı "Bugün"de tek "Bugün tekrar" kartı: "5 adım + 32 kart" |
| Ö3 | İlk soruya kadar 9 onboarding adımı + ödeme + 4 adımlık tur. "Neden Sınavika" adımı kart destesi tanıtımı | P2 | Onboarding'e tek etkileşimli soru (v4'ün tahmin adımı) eklenir, değer adımı kısalır; tur 2 adıma iner, Profil adımı kalkar (karar 5) |
| Ö4 | "Tekrar listesine eklendi" kırmızı hata kutusu | P2 | Nötr ya da amber: "Bunu yarın yeniden soracağız." Tekrar ceza değil, öğrenmenin parçası |
| Ö5 | Mobil oynatıcıda geri adım ve SinoAI yok (web'de ikisi de var); çıkışta güvence yok | P2 | Geri adım, yanlış cevap kutusunda "SinoAI'ye sor", kapatırken "İlerlemen kaydedildi" |
| Ö6 | Konu listesinde ilk denemede doğru oranı gösterilmiyor (API veriyor) | P2 | Konu satırında ilerleme yanında "ilk denemede %75" |

### 3.5 Tutarlılık ve dil

| # | Bulgu | Önem | Öneri |
|---|---|---|---|
| D1 | Web Testler alt başlığı "5 seviyeli konu testleri"; ürün Kolay, Orta, Zor | P1 | "Kolay, Orta, Zor konu testleri" |
| D2 | Site fiyat tablosunda "Ücretsiz · ₺0" planı; web onboarding'de "3 gün ücretsiz" (web'de deneme yok). 27 Ekim uyum raporunda tasarım düzeltmesi istenmişti | P1 | Ücretsiz plan kalkar; web onboarding paket adımı denemesiz |
| D3 | "Devam", "Devam et", "Kaldığın yerden devam et" karışık; "Şifre" ve "Parola" karışık | P2 | Adlandırma kurallarına tek liste |

## 4. Plan

Sıra bağımlılığa göre. Her adımdan sonra `npx vitest run tests/UIUX/UIUX.test.ts` ve `npx tsc --noEmit`.

1. **Renk altyapısı** (`Tokens.ts`, `ModuleIdentity.ts`, `Context.tsx`, `Parts/*`):
   - `moduleAction` (beyaz yazının 4,5:1 tuttuğu ton) ve bağlamdan renk veren tek bir `useAccent`.
   - `Button` primary/soft ve ortak parçaların varsayılanı bu vurguyu kullanır. Marka yüzeyleri (`UIProvider` modülsüz) turuncu kalır.
   - Kural yorumu ve `Modul-Kimligi.md` yeni kuralla yazılır; testlere kontrast eşiği 4,5 ve "modül ekranında turuncu düğme yok" denetimi.
2. **Dersler (Works v4):**
   - W1'deki 12 ekran ve kodu silinir; v4 ortak parçalara taşınır (W12).
   - Modül kimliği güncellenir (W3).
   - Yeni ekranlar: mobil Dersler ana sayfası, konu listesi, Tekrar, Kural, Örnek, Görsel, şekilli soru, hak bitti; web Dersler ana sayfası, konu listesi, Tekrar, doğru/yanlış, sırala, boşluk, konu sonu.
   - Düzeltmeler: W4–W8, W10, Ö4, Ö5.
   - Mevcut `m-dersv4-*` ve `w-dersv4-*` kimlikleri korunur (web ve mobil planları bunlara bakıyor).
3. **Turuncu temizliği:** R2–R4, R6 ekran ekran; açık ve koyu temada panolarla bakılır.
4. **Öğrenme deneyimi ve dil:** Ö1, Ö2, Ö6, W13, D1–D3; onboarding ve tur (Ö3) yalnız karar 5 onaylanırsa.
5. **Belgeler:** `UIUX-Rehberi.md` (renk kuralı, dokunma alanı), `Modul-Kimligi.md`, `Adlandirma-Kurallari.md`, envanter (`npm run uiux -- --inventory`). Web, mobil ve API ajanları için devir notu: yeni renk kuralı ve eylem renkleri, Works ekran yolları, API'de eksik iki şey (soru → mikro ders eşlemesi, kart ekleme).
6. **Teslim:** `npm run uiux` ile `Desktop\Sinavika-UIUX3` açık ve koyu yeniden üretilir. Silinen ekranların PNG'leri kaldırılır, `ders-v4/` ana sete katılır (referans HTML `referans/` altında kalır). README'ye 29 Ekim bölümü.

Tahmini boyut: 12 ekran silinir, yaklaşık 18 ekran eklenir, 25–30 ekran düzeltilir.

## 5. Senin kararların (önerim ilk seçenek)

1. **Dersler sekmeleri:** *Dersler · Konular · Tekrar* (Testler'in "Testler · Konular · Çözümler" düzeniyle aynı). Mobil planındaki ad "Ana · Dersler · Tekrar".
2. **Turuncu düğme tonu:** düğmelerde `#C2410C` (kontrast geçer, logo `#EA580C` kalır) ya da tonu koruyup düğme yazısını 19 pt yapmak.
3. **Modül sayfalarında logo:** kalkar, yalnız Modüller ana ekranında kalır ya da her yerde kalır.
4. **Denemeler rengi:** turuncu kalır ya da ayrı bir renk alır. Önerim kalması: mağaza, reklam ve sosyal medya görselleri bu renkle yapıldı.
5. **Onboarding ve tur (Ö3):** tek etkileşimli soru eklemek ve turu 2 adıma indirmek ya da şimdilik dokunmamak.

## 6. Kapsam dışı

- Web, mobil ve API kodu bu sohbette değişmez; bu işler devir notuyla gider.
- `src/Templates` ve video işleri bu plana girmez.
- "Kusursuz" demek için gerçek öğrenci testi ve huni verisi gerekir (25 Ekim raporu §5). Bu plan onların yerini tutmaz.

## 7. Uygulananlar (29 Ekim 2026)

Sahibin kararı: önerilerle uygula, onboarding'e soru koyma. Yalnız tasarım değişti (`src/UIUX`, belgeler, masaüstü seti); web, mobil ve API koduna dokunulmadı.

| Karar | Uygulanan |
|---|---|
| 1. Dersler sekmeleri | Dersler · Konular · Tekrar |
| 2. Turuncu düğme | Düğme dolgusu `#C2410C`; logo ve simgeler `#EA580C` |
| 3. Logo | Yalnız Modüller ana ekranında ve marka ekranlarında; modül sayfalarında yok. Web menüsündeki logo kalır |
| 4. Denemeler rengi | Turuncu kaldı; turuncu modül yalnız Denemeler |
| 5. Onboarding | Soru yok. Plan 6. ekranda; "Neden Sınavika", "Hesabın hazır" ve 4 adımlık tur kalktı; bildirim izni ilk mikro dersten sonra |

**Dersler (Works v4):** 12 eski ekran silindi. Dersler yeni yapıya göre yerli yerinde çizildi:
- **Mobilde 17 ekran:** ana sayfa, konular, tekrar, konu girişi, dokuz adım türü, şekilli soru, mikro ders bitti, konu sonu ve günlük konu hakkı.
- **Web'de 13 ekran:** aynı akış ve akış panosu.

Ayrı `ders-v4` klasörü yok. Kimlikler `m-ders-*` ve `w-ders-*`.

**Renk:**
- Ortak parçalar rengi bağlamdan alıyor (`useAccent`): modül ekranında modülün rengi, dışında marka.
- Her modülün düğme rengi (`moduleAction`) beyaz yazıyla 4,5:1 tutuyor.
- Test iki şeyi denetliyor: Denemeler dışındaki modül ekranlarında turuncu yok, düğme kontrastı 4,5:1.

**Diğerleri:**
- Test yanlış cevap ekranı (mobil ve web).
- Ders Planı'nda "Bugün tekrar" kartı.
- "Rotadan" önerisi ve "25 dk mikro ders" metinleri düzeltildi.
- SinoAI'den "Çalışma oluştur" çıktı; "Testi aç" Testler renginde.
- Site paketlerinden "Ücretsiz ₺0" çıktı; web onboarding'de paket adımı denemesiz.
- "Şifre" tek kelime oldu.
- Seçili durumlar koyu çerçeve ve tikle gösteriliyor.
- Sekme etiketleri artık sığıyor.
- Bildirim rozeti kırmızı; Destek kartı nötr.

### Web, mobil ve API ajanına devir notu

- **Ekran yolları değişti:** `Desktop\Sinavika-UIUX3\ders-v4\…` artık yok. Dersler ekranları ana setin içinde: `acik/mobil/m-ders-*.png`, `acik/web-panel/w-ders-*.png` (koyu tema `koyu/` altında). Eski kimliklerin karşılığı:
  - `m-dersv4-1` → `m-ders-konu-girisi`
  - `m-dersv4-2` → `m-ders-tanim`
  - `m-dersv4-3` → `m-ders-tahmin`
  - `m-dersv4-4` → `m-ders-bosluk`
  - `m-dersv4-5` → `m-ders-dogru-yanlis`
  - `m-dersv4-6` → `m-ders-soru`
  - `m-dersv4-7` → `m-ders-sirala`
  - `m-dersv4-8` → `m-ders-mikro-bitti`
  - `m-dersv4-9` → `m-ders-konu-sonu`
  - `m-dersv4-10` sesli yanıt çizimden çıktı; API'si yok, gelince yeniden çizilir.
  - Web karşılıkları `w-ders-konu-girisi`, `w-ders-tanim`, `w-ders-soru`, `w-ders-akis`, `w-ders-tahmin`, `w-ders-mikro-bitti`.
  - Referans HTML: `docs/Ders-akisi-referans.html`.
- **Mobil sekme adları:** plandaki "Ana · Dersler · Tekrar" yerine **Dersler · Konular · Tekrar**.
- **Renk kuralı (web ve mobil):**
  - Modül içinde birincil düğme modülün düğme rengi (`Modul-Kimligi.md` §2 tablosu), iki temada aynı ve beyaz yazılı.
  - Modül dışındaki marka düğmesi `#C2410C`.
  - Başka modülü açan düğme o modülün renginde.
- **Akış farkları:**
  - Boşluk doldurma tek deneme.
  - TYT sorusunda "Bir ipucu daha" düğmesi yok.
  - Mikro ders sonunda "Kartlarıma ekle" yok.
  - Tekrar notu nötr renkte.
  - Günlük konu hakkı bitince alt sayfa açılıyor (`m-ders-hak`).
- **API'ye sorular:**
  1. Kayıt şifresiz (yalnız kod ve ad) yapılabiliyor mu? Değilse şifre adımı geri gelir.
  2. Testteki bir sorudan o konunun mikro dersine gitmek için `lessonMikroId → workMikroId` eşlemesi gerekiyor.
  3. SinoAI `work_generate` aracı API planına göre kalkıyor, ama kodda hâlâ duruyor.
- **Onboarding:**
  - "Netimi bilmiyorum" seçilirse plan, sınavın ortalama netiyle kurulur.
  - Bildirim izni ilk mikro ders tamamlanınca sorulur.
  - Hub turu tek ipucuna indi (`m-hub-ipucu`), web turu da öyle (`w-panel-tur`).
