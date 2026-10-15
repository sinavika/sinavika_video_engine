# Sınavika Tanıtım Videosu — Standart Brif

Tanıtım (reklam) videosu istenirken kullanılacak şablon ve her tanıtım videosunda geçerli kurallar. Genel bir "spec ad" brifinden Sınavika'ya uyarlanmıştır: marka kimliği [`BrandIdentity.md`](BrandIdentity.md), yayın kuralları [`SocialPlan.md`](SocialPlan.md) içindedir ve burada tekrar edilmez.

## İstek şablonu

```
Sınavika için tanıtım videosu hazırla.

Konu / mesaj: [1–2 cümle, ya da "3 fikir öner"]
Ürün: [mobil uygulama / web / bir modül: Denemeler, Akıllı Özet, SinoAI…]
Metin: [benim cümlelerim, ya da "sen yaz"]
Ses: [profil: Promoter / Creator, ya da "seçenek göster"]
Süre: [~20–30 sn] + kapanış kartı
Yayın: [tarih, saat, platformlar]
Kaçınılacaklar: [ör. "fiyat yok", "geçen seferki gibi olmasın"]
```

## Her tanıtım videosunda geçerli kurallar

### Görünüm

- **Gerçek marka:** resmî logo (`public/Brand`), uygulamanın kodundan yeniden çizilmiş gerçek ekranlar (`src/Components/AppScreens`, katalog: [`AppScreens.md`](AppScreens.md)), sitede ve uygulamada doğrulanmış özellikler. Hayalî ekran ya da karikatür çizim yok.
- **Fotoğraf kullanılmaz.** Dışarıdan görsel indirilmez. Gerekirse önce sorulur; kaynak ve lisans kaydedilir.
- **Stil:** videodan videoya değişir (yukarıdaki kural). Sabit kalan: `SinavikaLight` / `SinavikaDark` temaları, kurumsal palet ve yazı tipi düzeni (`src/Configurations/BrandTypography.ts`) dışına çıkılmaz; yazı boyutları oradaki tanıtım ölçeğinden alınır.
- **Her tanıtım videosu kendine özgüdür.** "Aynı şablonu kullan" denmedikçe yeni bir tanıtım, öncekiyle aynı şablonu, sahne düzenini, renk kurgusunu ve müziği kullanamaz; küçük hareket farkları yenilik sayılmaz. Yeni fikir yeni bir şablon olarak eklenir (eğitim videoları ve hook içerikleri bu kuralın dışındadır, aynı şablonla üretilebilir). Mevcut tanıtım şablonları: `AppPromotion` (koyu sahne, tek telefon, çok özellik), `ExamJourney` (düz renk blokları, bir denemenin hikâyesi, telefon yalnız sonda) ve Ekim 2026 kampanyası için `SinoAIFilm` (beyaz SinoAI ürün filmi), `ProfilePicker` (profil seçim ekranı), `OrbReveal` (turuncu küre ve sayaç), `Keynote` (lansman filmi), `KineticType` (kinetik tipografi), `NightDesk` (gece masası, web), `FlatMorph` (düz renk açıklayıcı), `CountdownChat` (3-2-1 sohbet). Ortak mekanik `PromoKit`'tedir; görünüm her şablonda ayrıdır.
- Üretimden önce son tanıtımların brifine (`Posts/`) bakılır ve yeni videonun onlardan neyle ayrıldığı brife yazılır.
- Hızlı giriş ve çıkışlar hareket bulanıklığıyla yapılır; okunacak yazı ve ürün ekranı durduğu anda nettir.
- Sessiz izleyen için anlatım altyazı olarak gösterilir; altyazı ekran yazısıyla aynıysa çizilmez.
- **60 fps, 9:16** (Reels, TikTok, Shorts). İstenirse 16:9.
- Platform arayüzlerinin kapladığı üst ve alt bölgeler boş bırakılır.

### Ses

- Tanıtım videosu seslidir. Marka sesi kullanılamıyorsa yedek (ana dili Türkçe olmayan) sesle üretilir ve bu, brifte ve raporda açıkça yazılır.
- **Marka sesi.** Ana dili Türkçe tek ses (`BRAND_VOICES`), doğal hızda (tempo 1,0), abartısız: reklam okur gibi değil, bir arkadaşın önerisi gibi. Yabancı (çok dilli) sese kendiliğinden geçilmez; marka sesi kullanılamıyorsa üretim durur ve bu bildirilir.
- **Metin bütün olarak üretilir:** kısa reklam metni tek istekte seslendirilir, cümle cümle değil.
- **ElevenLabs.** Üretimden önce karakter sayısı hesaplanır ve kalan krediyle karşılaştırılır. Kredi sınırlı olduğu için tek kayıt alınır; ikinci kayıt yalnız istenirse.
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

- Sınavika logosu, "Ölç, öğren, geliş." ve mağaza adları (App Store, Google Play; düz yazı). Son akor kartın altında çınlar.

### Çalışma sırası

1. Brif yazılır: fikir, zaman çizelgesi, metin, ses, müzik planı, kullanılacak ekranlar. `Posts/<tarih>_<ad>/Brief.md`.
2. Yayın saati yakınsa ya da "hazırla ve gönder" denmişse onay beklenmeden üretime geçilir; değilse brif onayı beklenir.
3. Kredi hesabı, seslendirme, render (video + kapak), ses seviyesi ölçümü, kare kontrolü.
4. Açıklama, hashtag, platformlar, gönderi türleri ve saatle birlikte API'ye teslim. Admin onayı olmadan yayınlanmaz.

### Asla

- Doğrulanmamış fiyat, sayı, başarı iddiası ya da "en iyi" türü söz.
- Rakip adı ya da karşılaştırma.
- Mağaza logoları, başka markaların logoları.
- Onay ve yayın: bunları yalnız admin yapar.
