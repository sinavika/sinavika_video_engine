# Ekim 2026 tanıtım kampanyası · 16–31 Ekim

**Durum (15 Ekim 2026):** Üretildi ve gönderildi. 32 içerik API'de, admin onayı bekliyor; reddedilen 6 eski gönderinin yerine yenileri `replacesPostId` ile geçti.

- **Ses:** Kullanıcı Lisa'yı tanıtım için uygun bulmadı. Hesaptaki yeni ana dili Türkçe ses Gökçe Deniz, `Launch` söyleyiş profiliyle kullanıldı (tempo 1,06, daha az monoton).
- **SinoAI telaffuzu:** Seslendirmede "Sino Ey Ay" (`script` alanıyla); ekranda SinoAI.
- **Müzik:** Her reels için ayrı ve daha hareketli tarif (118–132 BPM).
- **Plan önizlemesi:** https://claude.ai/artifact/1T1gz9cjkPau79ZkC2c9o5
**Tek kaynak:** `src/Campaigns/Tanitim2026Ekim.ts`. Konsept, hook, sahne akışı, seslendirme taslağı, müzik tarifi, açıklama ve hashtag'ler oradan okunur.
**Haftalık düzen:** `PROMO_WEEKLY_PLAN` (`src/Configurations/SocialPlan.ts`). Takvim: `npm run social -- plan --plan tanitim --from 2026-10-17 --to 2026-11-01`.

## 1. Çerçeve

- **Eğitim içeriği yok:** soru çözümü, konu anlatımı ve günün sorusu bu dönemde paylaşılmaz.
- **Tanıtılanlar:** yalnız mobil uygulama ve web sitesi (sinavika.com). Hook'lar öğretmek için değil, kullanıcı kazanmak için yazıldı: merak, itiraf, kimlik, meydan okuma.
- **Haftalık ritim:**
  - 4 reels: Pazartesi, Çarşamba, Cuma, Pazar. Instagram reels, TikTok video ve YouTube Shorts.
  - 3 gönderi: Salı ve Cumartesi kaydırmalı, Perşembe tek görsel. Instagram ve TikTok fotoğraf.
  - Her gün 1 hikâye, günün gönderisinden önce.
- **Hikâyeler yalnız Instagram'da:**
  - Buffer'ın TikTok desteği video ve fotoğraf gönderisiyle sınırlı; TikTok hikâyesi Buffer'dan paylaşılamıyor ([Buffer TikTok rehberi](https://support.buffer.com/article/559-using-tiktok-with-buffer), [Buffer API PostType](https://developers.buffer.com/types/PostType.html)). API'mizde de TikTok için yalnız `photo` ve `video` var.
  - Hikâyedeki anket, soru ve link etiketleri API ile eklenemez. Seçenekler görselin içine çizilir, link "profilde" diye yönlendirilir.
- **Saatler** Buffer'daki hesap programından gelir; uydurma saat yok. Hikâye, gönderiden 3 saat önce çıkar (en erken 07:00).

## 2. Örneklerden ne alındı

| Örnek | Kurgu dili | Nerede kullanılıyor |
|---|---|---|
| Masa başında UI hareketi (kinso) | Akşam ışığında masa ve monitör; ekranda kinetik yazı, turuncu bant, logo açılışı, ardından ürün | 26.10 "Saat 23.40" (web) |
| Kinetik tipografi vitrini | Her vuruşta tek dev kelime, üst üste binen satırlar, 3B nesneler | 25.10 "Dene. Gör. Planla." |
| Masa başında parlak UI (sepet akışı) | Derinlikli, parlak arayüz parçaları; bir düğmeye basılır, sonuç belirir | 21.10 ve 26.10'daki ekran hareketleri |
| folio_ai | Beyaz zeminde eğik, yüzen, yuvarlak özellik kartları; kısa Türkçe kanca | 17.10, 20.10, 31.10 kaydırmalıları |
| Düz renk açıklayıcı (Arapça örnek) | Tek renk zemin, dev kelime, biçim değiştiren ikonlar, bulanık geçişler, telefon çevresinde yüzen etiketler | 28.10 "Soru? Fotoğrafını çek." |
| "Dashboard is lying" | Koyu sahne, parlayan turuncu küre, büyük sayaç, provokatif kanca | 21.10 "Netin sana yalan söylüyor" |
| Ürün lansmanı (kulaklık) | Yumuşak renk geçişi, ortada tek ürün, sakin başlık | 23.10 "Tanıştırayım: SinoAI Çalışma" |
| Profil seçim ekranı | "Kim izliyor?" → profil seç → sinematik başlık → bölümler | 19.10 "Kim çalışıyor?" |
| OpenAI ürün filmi | Beyaz zemin, yazma kutusu, adım adım düşünme satırları, beyaz kinetik kartlar, üretilen işe yakınlaşma | 18.10 SinoAI filmi (SinoAI serisinin ana dili) |

**Sınırlar:**
- Örneklerin yalnız kurgu dili alınır. Marka adı, logo, arayüz kopyası ve tanınır ses imzası (ör. yayın platformu açılış sesi) kullanılmaz; rakip adı geçmez (`docs/AdPrompt.md`).
- Fotoğraf kullanılmaz. Masa sahnesi çizim ve 3B olarak kurulur.

## 3. Takvim

| Tarih | Gün | Saat (IG) | Tür | İçerik | Hook | Tanıtılan | Sunucu |
|---|---|---|---|---|---|---|---|
| 16.10 | Cum | 07:17 | Reels | Sınav hazırlığın böyle mi görünüyor? (Önce/Sonra) | Sınav hazırlığın böyle mi görünüyor? | mobil | yeni |
| 17.10 | Cmt | 17:39 | Kaydırmalı | Yedi modül, tek uygulama | Sınava hazırlanmak için 7 uygulama mı? Bir tane yeter. | mobil | yeni |
| 18.10 | Paz | 09:27 | Reels | SinoAI: seni tanıyan yapay zekâ | Yapay zekâ çok. Seni tanıyan bir tane. | ikisi | yeni |
| 19.10 | Pzt | 20:53 | Reels | Kim çalışıyor? | Bu akşam ne izliyoruz? Yanlış soru. | mobil | revize (reddedilenin yerine) |
| 20.10 | Sal | 19:09 | Kaydırmalı | SinoAI ile yapabileceğin 6 şey | SinoAI'ye sadece soru sorma. | ikisi | revize (reddedilenin yerine) |
| 21.10 | Çar | 18:50 | Reels | Netin sana yalan söylüyor | Netin sana yalan söylüyor. | mobil | revize (reddedilenin yerine) |
| 22.10 | Per | 10:25 | Görsel | Peki nerede kaybettin? | Netin 78,5. Peki nerede kaybettin? | mobil | revize (reddedilenin yerine) |
| 23.10 | Cum | 07:17 | Reels | Tanıştırayım: SinoAI Çalışma | Notunu at. Quiz olsun. | ikisi | yeni |
| 24.10 | Cmt | 17:39 | Kaydırmalı | Denemeden sonra ne yapıyorsun? | Denemeden sonra ne yapıyorsun? Çoğu öğrenci hiçbir şey. | ikisi | revize (reddedilenin yerine) |
| 25.10 | Paz | 09:27 | Reels | Dene. Gör. Planla. Sor. | Sınav hazırlığı altı kelime. | mobil | revize (reddedilenin yerine) |
| 26.10 | Pzt | 20:53 | Reels | Saat 23.40 | Saat 23.40. Hâlâ ne çalışacağını düşünüyorsun. | web | yeni |
| 27.10 | Sal | 19:09 | Kaydırmalı | Web'de de Sınavika | Büyük ekranda çalışmayı sevenler buraya. | web | yeni |
| 28.10 | Çar | 18:50 | Reels | Soru? Fotoğrafını çek. | Çözemediğin soru mu var? | mobil | yeni |
| 29.10 | Per | 10:25 | Görsel | Unutmadan önce | Dün çalıştığını bugün hatırlıyor musun? | mobil | yeni |
| 30.10 | Cum | 07:17 | Reels | Kayıt olmadan 3 soru | Üç soru hakkın var. Kayıt yok. | web | yeni |
| 31.10 | Cmt | 17:39 | Kaydırmalı | Hangi öğrencisin? | Hangi öğrencisin? Arkadaşını etiketle. | mobil | yeni |

**Notlar:**
- **Platform saatleri:** TikTok ve YouTube saatleri Buffer'da ayrı. Örneğin 19.10'da TikTok 09:47'de, YouTube 20:53'te çıkar. Ayrıntı plan komutunun çıktısında.
- **Reddedilen eski gönderiler:** 19, 20, 21, 22, 24 ve 25 Ekim'deki "[Deneme]" eğitim gönderileri admin panelinde reddedilmiş durumda. Bu günlerin yeni tanıtım içeriği, o gönderilerin yerine geçer (`replacesPostId`). Diğer 9 gün boş; oralara yeni gönderi yüklenir.
- **Tarih:** "31.10.2025" 2026 olarak alındı (bugün 15 Ekim 2026).

### Hikâyeler (her gün, yalnız Instagram)

| Tarih | Saat | Hikâye hook'u | Destekler |
|---|---|---|---|
| 17.10 | 14:39 | Telefonunda kaç ders uygulaması var? | Yedi modül, tek uygulama |
| 18.10 | 07:00 | Bu yapay zekâ son denemeni biliyor. | SinoAI: seni tanıyan yapay zekâ |
| 19.10 | 17:53 | Kim çalışıyor? | Kim çalışıyor? |
| 20.10 | 16:09 | SinoAI'ye sadece soru sorma. | SinoAI ile yapabileceğin 6 şey |
| 21.10 | 15:50 | 78,5 net. İyi mi? | Netin sana yalan söylüyor |
| 22.10 | 07:25 | Son denemende en çok nereden kaybettin? | Peki nerede kaybettin? |
| 23.10 | 07:00 | Notunu at. Quiz olsun. | Tanıştırayım: SinoAI Çalışma |
| 24.10 | 14:39 | Denemeden sonra ne yapıyorsun? | Denemeden sonra ne yapıyorsun? |
| 25.10 | 07:00 | Sınav hazırlığı altı kelime. | Dene. Gör. Planla. Sor. |
| 26.10 | 17:53 | Saat 23.40. Sen ne yapıyorsun? | Saat 23.40 |
| 27.10 | 16:09 | Bilgisayardan da çalışabilirsin. | Web'de de Sınavika |
| 28.10 | 15:50 | Çözemediğin soruyu at, biz çözelim. | Soru? Fotoğrafını çek. |
| 29.10 | 07:25 | Lale Devri hangi yıllar arasındadır? | Unutmadan önce |
| 30.10 | 07:00 | Üç soru hakkın var. | Kayıt olmadan 3 soru |
| 31.10 | 14:39 | Hangi öğrencisin? | Hangi öğrencisin? |

## 4. SinoAI serisi

SinoAI'nin özellikleri backend'den çıkarıldı. Kaynak: `sinavika/docs/frontend/student-sinoai-frontend-guide.md`, `Services/SinosAI`.

| Özellik (backend) | Reklamdaki karşılığı | Nerede |
|---|---|---|
| Sohbet; yanıt akarak gelir, model seviyesi Hızlı / Dengeli / Derin | "Takıldığın konuyu sor, adım adım anlatsın" | 18.10, 20.10 |
| Eğitim ve öğrenci bağlamı (hedef, sınav, ders) | "Hedefini ve son denemeni bilerek cevap verir" | 18.10 |
| Sohbete ek: fotoğraf, PDF, Word, PowerPoint, metin, link | "Notunu, PDF'ini ya da sunumunu ekle" | 20.10, 23.10 |
| Çalışma araçları: Çalışma, Quiz, Kişisel Deneme (tam/branş), Bilgi Kartları, Çalışma Planı | "SinoAI Çalışma: konu anlatımı, quiz, deneme, kart, plan" | 20.10, 23.10 |
| Kitaplık ve PDF olarak indirme | "Ürettiği her şey Kitaplığında durur, PDF olarak indirirsin" | 20.10, 23.10 |
| Misafir: kayıt olmadan 3 mesaj (yalnız Hızlı, yalnız PDF eki) | "Üç soru hakkın var. Kayıt yok." | 30.10 |

**Kurgu:**
- **18.10 (ana film):** OpenAI ürün filminin dili. Soru yazılır, SinoAI'nin adımları görünür, cevap akar, üretilen işler kartlar halinde gelir.
- **23.10:** Lansman filmi dili; beş Çalışma aracı tek tek tanıtılır.
- **30.10:** Web'e, kayıtsız denemeye çağırır.
- **20.10:** Kaydırmalı; altı kullanım tek tek gösterilir.

SinoAI her yerde renksiz (beyaz ve gri), UI/UX v3'teki gibi.

## 5. Üretim kuralları (her içerikte)

- **Her reels yeni bir üretim:** Sekiz reels'in sekizi de ayrı şablon, ayrı sahne dili ve ayrı müzik. Bunu test kontrol ediyor.
- **Ses:**
  - Reels'ler sesli: marka sesi Lisa (ElevenLabs), doğal hız.
  - Seslendirme taslakları kampanya dosyasında; üretimden önce karakter hesabı yapılır.
  - Müzik her reels için ayrı tarifle ElevenLabs Music'ten üretilir; motorun kendi bestesi kullanılmaz.
- **Ekranlar:** Gerçek ürün ekranları UI/UX v3 parçalarından çizilir, veri sınava uygun. SinoAI renksiz (beyaz ve gri).
- **Teknik:** 60 fps, 9:16, kapak karesi videonun ilk karesi. Altyazı, platform arayüzünün kapladığı bölgelerin dışında.
- **Metin:** Açıklama ve hashtag'ler kampanya dosyasında. TikTok için en fazla 5 hashtag; Instagram metin sınırı içinde. Test kontrol ediyor.
- **Onay:** Admin onayı olmadan hiçbir şey yayınlanmaz. Claude yalnız API'ye teslim eder.

## 6. Altyapı (hazır)

| Parça | Nerede |
|---|---|
| Tanıtım haftalık planı | `PROMO_WEEKLY_PLAN`, `npm run social -- plan --plan tanitim` |
| Kampanya dosyası ve testi | `src/Campaigns/Tanitim2026Ekim.ts`, `tests/Campaign.test.ts` |
| Gönderi iskeleti | `npm run social -- campaign --campaign tanitim-2026-10`. Her gün için `Posts/<tarih>_<Ad>/` klasörüne Brief.md ve Post.json taslağı yazar; reddedilen gönderisi olan 6 güne `replacesPostId` koyar. Taslaklar yazıldı, hiçbiri gönderilmedi. |
| Ortak tanıtım kiti | `src/Templates/Advertisements/PromoKit`: zamanlama, tuval, kinetik kelime, daktilo yazı, altyazı, cihaz içinde gerçek UI/UX v3 ekranları (`PromoScreens`: kampanya verili kayıp, plan, çözüm ve kart ekranları dahil) |
| 8 reels şablonu (her biri ayrı dil ve müzik) | `SinoAIFilm` (18.10), `ProfilePicker` (19.10), `OrbReveal` (21.10), `Keynote` (23.10), `KineticType` (25.10), `NightDesk` (26.10), `FlatMorph` (28.10), `CountdownChat` (30.10) |
| Gönderi şablonu | `Campaigns/PromoDeck`: altı görünüş (floating, tool, proof, rail, browser, persona); her gönderi kendi görünüşünde |
| Hikâye şablonu | `Campaigns/PromoStory` (1080 × 1920): hook, çizili seçenekler, tek görsel (telefon, web, rakam, modül ikonları, kart) |

Şablonların her sahnesinden kare alınıp kontrol edildi (`npm run stills -- --template <Ad>`). Örnek iş dosyaları `samples/` altında. Testler: 541 geçti.

### Üretim sırası (komut gelince)

1. Her reels için iş dosyası: kampanya dosyasındaki sahne akışı ve seslendirme şablonun içerik alanlarına yazılır; müzik tarifi `soundtrack.music`.
2. Seslendirme: karakter hesabı, Lisa sesiyle tek seferde üretim, Scribe ile kontrol.
3. Render: 60 fps 9:16, kapak karesi; gönderiler ve hikâyeler `npm run image`.
4. Medya `Posts/<tarih>_<Ad>/Media/` altına; Post.json taslakları tamamlanır.
5. `npm run social -- submit`: reddedilenlerin yerine geçenler `replacesPostId` ile, diğerleri yeni gönderi olarak. Admin onayı bekler.

## 7. Açık sorular (üretimden önce)

1. **Misafir SinoAI (30.10):** Kayıtsız 3 soru özelliği web'de canlıda açık mı (`SinoAI:Guest:Enabled`)? Kapalıysa 30.10 reels'i "Web'de SinoAI" olarak değişir.
2. **Kaydırmalı gönderilerde son sayfa:** "Ücretsiz indir" ve "sinavika.com'da ücretsiz başla" ifadeleri, ücretsiz başlangıç planının olduğu varsayımına dayanıyor.
