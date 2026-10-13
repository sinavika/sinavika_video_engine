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
- **Stil:** `SinavikaDark` teması; koyu sahne, yavaşça kayan turuncu ışıma, dev hareketli yazı, sahnede kalan tek telefon ve onun üstünde değişen ekranlar. Kurumsal palet ve yazı tipi düzeni (`src/Configurations/BrandTypography.ts`) dışına çıkılmaz; yazı boyutları oradaki tanıtım ölçeğinden alınır.
- Her videoda hareketler yenilenir; bir öncekinin aynısı tekrar edilmez.
- **60 fps, 9:16** (Reels, TikTok, Shorts). İstenirse 16:9.
- Platform arayüzlerinin kapladığı üst ve alt bölgeler boş bırakılır.

### Ses

- **ElevenLabs.** Üretimden önce karakter sayısı hesaplanır ve kalan krediyle karşılaştırılır. Kredi sınırlı olduğu için tek kayıt alınır; ikinci kayıt yalnız istenirse.
- Metin tam ve açık cümlelerle yazılır; telefon hoparlöründe her kelime anlaşılmalıdır.
- Marka ve modül adları doğru okunacak şekilde yazılır; okunuşu belirsiz ad (ör. SinoAI) seslendirmede tarif edilir, ekranda gerçek adıyla görünür.
- **Görüntü sese göre zamanlanır**, ses görüntüye göre değil.

### Müzik ve ses tasarımı

- **Özgün müzik, kodla üretilir** (`src/Services/SoundtrackComposer.ts`); örnek ses ya da lisanslı parça kullanılmaz.
- Müzik sesin çevresinde düzenlenir ve konuşma sırasında sesin en az 15 dB altında kalır.
- Ses efektleri de kodla üretilir: her cümleye girişte bir hava sesi, her sahne değişiminde yumuşak bir vuruş, kapanışta çınlayan son akor.
- Ana çıkış **−14 LUFS, −1 dBTP**.
- İş dosyasında `"soundtrack": true` ile açılır.

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
