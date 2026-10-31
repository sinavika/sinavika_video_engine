# Sınavika Tanıtım Videosu — Standart Brif

Tanıtım (reklam) videosu istenirken kullanılacak şablon ve her tanıtım videosunda geçerli kurallar. Genel bir "spec ad" brifinden Sınavika'ya uyarlanmıştır: marka kimliği [`BrandIdentity.md`](BrandIdentity.md), yayın kuralları [`SocialPlan.md`](SocialPlan.md), strateji [`SocialStrategy.md`](SocialStrategy.md), hook ve kurgu kuralları [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) içindedir ve burada tekrar edilmez. Tanıtım videoları stratejideki **Ürün** sütunudur: ürünü, öğrencinin gerçek bir sorununu çözerken gösterir.

## İstek şablonu

```
Sınavika için tanıtım videosu hazırla.

Konu / mesaj: [1–2 cümle, ya da "3 fikir öner"]
Ürün: [mobil uygulama / web / bir modül: Denemeler, Akıllı Özet, SinoAI…]
Metin: [benim cümlelerim, ya da "sen yaz"]
Ses: [profil: Promoter / Creator, ya da "seçenek göster"]
Süre: [15–35 sn, kapanış kartı dahil]
Yayın: [tarih, saat, platformlar]
Kaçınılacaklar: [ör. "fiyat yok", "geçen seferki gibi olmasın"]
```

## Her tanıtım videosunda geçerli kurallar

### Yapı

- **Hook → Gövde → Kapanış** (TikTok Creative Codes).
- **Hook ilk saniyededir.** Görüntü, ekran yazısı ve ses aynı anda gelir. İlk kare kapaktır ve hook'u taşır. Logo açılışı ya da durağan başlıkla başlanmaz.
- Brifte farklı türlerden üç hook adayı yazılır ([`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §2). Özelliği anlatan cümle yerine öğrencinin durumunu soran cümle tercih edilir. Ekim 2026'da "Soracak kimse yok mu?" onaylandı, "Üç soru hakkın var. Kayıt yok." reddedildi.
- Gövdede tek fikir anlatılır. Her 1,2–2 saniyede yeni görsel bilgi gelir; 2 saniyeden uzun durağan kare olmaz.
- **Tempo standardı** (`REEL_STANDARD`, 29 Ekim ölçümü): ekran hook'u en fazla 5 kelime ve 1,8 saniye; ilk 0,5 saniyede hareket; içerik en fazla 15 saniye, bitiş kartıyla toplam 18 saniye; seslendirme en fazla 190 karakter. Ayrıntı: [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §11.
- Kapanışta tek çağrı yapılır.

### Görünüm

- **Gerçek marka:** resmî logo (`public/Brand`), uygulamanın kodundan yeniden çizilmiş gerçek ekranlar (`src/Components/AppScreens`, katalog: [`AppScreens.md`](AppScreens.md)), sitede ve uygulamada doğrulanmış özellikler. Hayalî ekran ya da karikatür çizim yok.
- **Fotoğraf kullanılmaz.** Dışarıdan görsel indirilmez. Gerekirse önce sorulur; kaynak ve lisans kaydedilir.
- **Stil:** videodan videoya değişir (yukarıdaki kural). Sabit kalan: `SinavikaLight` / `SinavikaDark` temaları, kurumsal palet ve yazı tipi düzeni (`src/Configurations/BrandTypography.ts`) dışına çıkılmaz; yazı boyutları oradaki tanıtım ölçeğinden alınır.
- **Her tanıtım videosu kendine özgüdür.** "Aynı şablonu kullan" denmedikçe yeni bir tanıtım, öncekiyle aynı şablonu, sahne düzenini, renk kurgusunu ve müziği kullanamaz; küçük hareket farkları yenilik sayılmaz. Yeni fikir yeni bir şablon olarak eklenir (eğitim videoları ve hook içerikleri bu kuralın dışındadır, aynı şablonla üretilebilir). Mevcut tanıtım şablonları: `AppPromotion` (koyu sahne, tek telefon, çok özellik), `ExamJourney` (düz renk blokları, bir denemenin hikâyesi, telefon yalnız sonda) ve Ekim 2026 kampanyası için `SinoAIFilm` (beyaz SinoAI ürün filmi), `ProfilePicker` (profil seçim ekranı), `OrbReveal` (turuncu küre ve sayaç), `Keynote` (lansman filmi), `KineticType` (kinetik tipografi), `NightDesk` (gece masası, web), `FlatMorph` (düz renk açıklayıcı), `CountdownChat` (3-2-1 sohbet). Ortak mekanik `PromoKit`'tedir; görünüm her şablonda ayrıdır.
- Üretimden önce son tanıtımların brifine (`Posts/`) bakılır ve yeni videonun onlardan neyle ayrıldığı brife yazılır.
- Hızlı giriş ve çıkışlar hareket bulanıklığıyla yapılır; okunacak yazı ve ürün ekranı durduğu anda nettir.
- Videolara anlatım altyazısı eklenmez (sahip, 30 Ekim 2026: altyazı alanı daraltıyor ve üretimi yoruyor). Ses kapalı izleyen için anlamı hook ve ekrandaki yazılar taşır.
- **60 fps, 9:16** (Reels, TikTok, Shorts). İstenirse 16:9.
- Platform arayüzlerinin kapladığı üst ve alt bölgeler boş bırakılır.

### Ses

- Tanıtım videosu seslidir. Marka sesi kullanılamıyorsa yedek (ana dili Türkçe olmayan) sesle üretilir ve bu, brifte ve raporda açıkça yazılır.
- **Marka sesi.** Ana dili Türkçe tek ses (`BRAND_VOICES`), doğal hızda (tempo 1,0), abartısız: reklam okur gibi değil, bir arkadaşın önerisi gibi. Yabancı (çok dilli) sese kendiliğinden geçilmez; marka sesi kullanılamıyorsa üretim durur ve bu bildirilir.
- **Metin bütün olarak üretilir:** kısa reklam metni tek istekte seslendirilir, cümle cümle değil.
- **ElevenLabs.** Üretimden önce karakter sayısı hesaplanır ve kalan krediyle karşılaştırılır. Tek kayıt alınır; ikinci kayıt yalnız istenirse. Hesap Pro planında (30 Ekim 2026'dan beri, ayda 600.000 kredi): ses kayıpsız 44,1 kHz WAV, müzik 320 kbps gelir.
- Metin tam ve açık cümlelerle yazılır; telefon hoparlöründe her kelime anlaşılmalıdır.
- Modül adları ve tanıtım cümleleri `src/Configurations/ProductMessaging.ts`'ten alınır (`moduleCopy`); kalıp ve yasaklı ifadeler: [`ProductMessaging.md`](ProductMessaging.md).
- Marka ve modül adları doğru okunacak şekilde yazılır; okunuşu belirsiz ad (ör. SinoAI) seslendirmede tarif edilir, ekranda gerçek adıyla görünür.
- **Görüntü sese göre zamanlanır**, ses görüntüye göre değil.

### Müzik ve ses tasarımı

- **Müzik her video için ayrı yaptırılır** (ElevenLabs Music): iş dosyasında müzik sözle tarif edilir, `"soundtrack": {"music": "…"}`. Tarif videonun havasını, temposunu, çalgılarını ve "No vocals" koşulunu içerir; iki tanıtım aynı tarifi kullanmaz. Parça bir kez üretilir ve `public/Music/` altında saklanır; yeniden render kredi harcamaz. (`src/Services/MusicLibrary.ts`)
- Motorun kendi bestelediği müzik (`"soundtrack": true` ya da `Bright` / `Pulse`) yedektir; tanıtım videolarında kullanılmaz (Ekim 2026'da beğenilmedi).
- **Seviyeler tek yerdedir** (`AUDIO_LEVELS`, `src/Services/AudioLeveling.ts`): seslendirme karışıma −20 LUFS / en fazla −4 dBTP ile girer, müzik −36 LUFS ile (sesin 16 dB altında). Konuşma servisleri sesi tam seviyede verir; seviyelenmeden müzikle toplanırsa karışım taşar ve cızırtı duyulur. Karışım mastering öncesi −0,3 dBTP'yi aşarsa render uyarı verir.
- Ana çıkış **−14 LUFS, −1,5 dBTP**; önce ölçülür, sonra tek sabit kazançla ayarlanır.
- Üretilen ses, yazıya dökülerek (ElevenLabs Scribe) metinle karşılaştırılır.

### Kapanış

- Her reels aynı merkezi uygulama kartıyla biter: `AppEndCard` ([`Sosyal-Kimlik-Standardi.md`](Sosyal-Kimlik-Standardi.md) §2). Kartta logo, uygulamayı gösteren telefon, "Ücretsiz indir", iki mağaza rozeti ve sinavika.com bulunur. Kart 3 saniye sürer ve ayar almaz. Son akor kartın altında çınlar.
- Kartın cümlesini ("Sınavika'yı ücretsiz indir.") kart söyler. Videonun kendi seslendirmesi "indir" diye bitmez, yoksa çağrı iki kez duyulur.
- Seslendirmede ve kartta "böyle olsun" gibi dolgu cümleleri kullanılmaz (sahip, 16 Ekim 2026).

### Çalışma sırası

1. Brif yazılır: sütun ve huni aşaması, üç hook adayı, fikir, zaman çizelgesi, metin, ses, müzik planı, kullanılacak ekranlar, izlenecek metrik. `Posts/<tarih>_<ad>/Brief.md`.
2. Yayın saati yakınsa ya da "hazırla ve gönder" denmişse onay beklenmeden üretime geçilir; değilse brif onayı beklenir.
3. Kredi hesabı, seslendirme, render (video + kapak), ses seviyesi ölçümü, kare kontrolü. Ardından seslendirmede boşluk ve kesik cümle kontrolü (Scribe dökümü ve dalga biçimi) ile yayın öncesi kontrol listesi ([`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §10).
4. Açıklama, hashtag, platformlar, gönderi türleri ve saatle birlikte API'ye teslim. Admin onayı olmadan yayınlanmaz.

### Asla

- Doğrulanmamış fiyat, sayı, başarı iddiası ya da "en iyi" türü söz.
- Rakip adı ya da karşılaştırma.
- Mağaza logoları, başka markaların logoları.
- Onay ve yayın: bunları yalnız admin yapar.
