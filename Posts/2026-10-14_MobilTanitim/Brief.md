# Brif — Sınavika Mobil: Bir Deneme Hikâyesi

- **Yayın:** 14 Ekim 2026, 18:00 (İstanbul) — Instagram Reels, TikTok, YouTube Shorts
- **Şablon:** `ExamJourney` (yeni), `SinavikaLight`, 1080×1920, 60 fps, müzik stili `Pulse`
- **Süre:** 16,6 sn
- **İş dosyası:** [`Job.json`](Job.json) · **Gönderi dosyası:** [`Post.json`](Post.json)
- **Çıktı:** `Outputs/Videos/05_Sinavika_Bir_Deneme_Hikayesi.mp4` ve `…_Kapak.png`
- **Sunucu:** gönderi `e9ea0235-69b3-4ad7-a0b4-1d44b081425c`, admin onayı bekliyor. Reddedilen `bd306a1f-828c-4956-869f-7d21a5cc8e4f` gönderisinin yerine geçer.

## Neden yeniden üretildi

İlk sürüm reddedildi: "sesli üretim olsun, ayın 13'ü için hazırlanan videonun aynısı olmuş, daha yenilikçi." İlk sürüm 13 Ekim videosuyla aynı dili kullanıyordu (koyu sahne, turuncu ışıma, telefon ve üstünde büyük başlık) ve sessizdi.

## 13 Ekim videosundan farkı

| | 13 Ekim (`AppPromotion`) | 14 Ekim (`ExamJourney`) |
| --- | --- | --- |
| Fikir | Özellik turu: tek telefon, beş modül | Bir denemenin hikâyesi: süre, soru, sonuç, eksik |
| Görünüm | Koyu sahne, turuncu ışıma | Düz renk blokları: turuncu, açık, koyu lacivert; ışıma yok |
| Ürün | Telefon baştan sona sahnede | Uygulamanın öğeleri tam ekran; telefon yalnız sonda |
| Yazı | Aşağıdan gelen dev hareketli kelimeler | Bir renk bloğunun arkasından açılan, sola yaslı başlıklar |
| Geçiş | Yumuşak geçiş (fade) | Her sahne farklı yönden iterek girer |
| Müzik | `Bright`: Fa majör, 100 BPM | `Pulse`: La minör, 120 BPM, ters vuruşlu bas |
| Kapak | Koyu | Turuncu |

## Zaman çizelgesi

| Sahne | Ekranda | Hareket | Seslendirme |
| --- | --- | --- | --- |
| Kapak (0,2 sn) | "Süre başladı. **Hazır mısın?**" | — | — |
| Süre | Turuncu zemin, "TYT Denemesi", dev sayaç 120:00'dan geri sayar | Kadran çizilir, sayaç her saniye atar; başlık blokla açılır | Süre başladı. |
| Soru | "Denemeni çöz." · soru kartı · A–E şıkları · süre | Şıklar sırayla gelir; C şıkkına dokunulur, dalga yayılır | Sınavika'da denemeni çöz. |
| Sonuç | Koyu zemin, "Sonucunu gör." · net trendi | Çizgi kendini çizer, son nokta atar | Bitince sonucunu gör. |
| Eksikler | "Eksiğini fark et." · ders çubukları | Çubuklar dolar; en düşük ders çerçevelenir, "Buraya odaklan" etiketi gelir | Hangi derste eksiğin var, hemen fark et. |
| Uygulama | "Hepsi tek uygulamada." · Denemeler ekranı | Turuncu daire yükselir, telefon eğik durur | Hepsi tek uygulamada. |
| Kapanış | Turuncu zemin, logo · "Sınavika'yı keşfet" · sinavika.com · App Store · Google Play | Son akor çınlar | Sınavika'yı keşfet. |

Sahne süreleri seslendirmenin gerçek uzunluğundan çıkar; anlatım altyazı olarak da görünür.

## Ses

- **Seslendiren: Bella (Eleven v3, tempo 1,0, abartısız ayar) — ana dili Türkçe değil.** Ret notu sesli üretim istediği ve ana dili Türkçe marka sesleri hesapta hâlâ kullanılamadığı için (ücretsiz plan; `npm run voices`) yedek ses bilerek kullanıldı (`"voiceover": {"standIn": true}`).
- Metin tek istekte, bütün olarak üretildi (149 karakter); hız değiştirilmedi.
- Marka sesi hesaba eklenince `Job.json` içinde `"voiceover": true` yapılıp yeniden üretilir; görüntü yeni sese göre kendiliğinden zamanlanır.

## Müzik ve ses tasarımı

- Kodla üretilen özgün müzik, `Pulse` stili (bu video için eklendi). Her satır girişinde hava sesi, sahne değişimlerinde yumuşak vuruş, kapanışta çınlayan Do majör akoru.
- Ölçüm: **−15,1 LUFS, −1,0 dBTP**.

## Kullanılan varlıklar ve doğruluk

- Logo: `public/Brand/SinavikaLogo.png`. Uygulama ekranı: katalogdan `ExamHome`.
- Soru, şıklar, net trendi ve ders çubukları uygulamanın deneme ve istatistik ekranlarındaki öğelerin tam ekran çizimidir; sayılar örnek veridir. Net sayısı ekranda yazılmaz, anlatımda geçmez; fiyat, kullanıcı sayısı ya da başarı vaadi yoktur.
- Mağazalar düz yazıyla. Dışarıdan görsel, müzik ya da ses efekti indirilmedi. 16:9 sürüm üretilmedi (şablon destekler).
