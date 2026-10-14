# Brif — Sınavika Mobil: Bir Deneme Hikâyesi

- **Yayın:** 14 Ekim 2026, 18:00 (İstanbul) — Instagram Reels, TikTok, YouTube Shorts
- **Şablon:** `ExamJourney` (yeni), `SinavikaLight`, 1080×1920, 60 fps, müzik stili `Pulse`
- **Süre:** 16,8 sn
- **İş dosyası:** [`Job.json`](Job.json) · **Gönderi dosyası:** [`Post.json`](Post.json)
- **Çıktı:** `Outputs/Videos/07_Sinavika_Bir_Deneme_Hikayesi.mp4` ve `…_Kapak.png`
- **Sunucu:** gönderi `d620c0cb-538a-433b-816a-7a557d976ec7`, admin onayı bekliyor (üçüncü sürüm: Türkçe ses ve kodlama iyileştirmesi).

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

- **Seslendiren: Lisa** — ana dili Türkçe (İstanbul), marka sesi. Model: Multilingual v2 (Lisa'nın doğrulandığı en iyi model), tempo 1,0, abartısız ayar, 192 kbps kaynak.
- Metin tek istekte, bütün olarak üretildi; görüntü sesin gerçek sürelerine göre zamanlandı.
- Ses, yazıya dökülerek denetlendi (ElevenLabs Scribe): çıkan metin, "Sınavika" dahil, yazılan metinle kelimesi kelimesine aynı.

## Müzik ve ses tasarımı

- Müzik bu video için ElevenLabs Music ile yaptırıldı; tarifi `Job.json` içindeki `soundtrack.music` alanındadır. Önceki sürümlerdeki kodla üretilen müzik ve efektler beğenilmediği için kaldırıldı.
- Seslendirme karışıma seviyelenmiş olarak girer (−20 LUFS dolayı), müzik 16 dB altındadır. Önceki sürümdeki cızırtının nedeni, tam seviyede gelen sesin müzikle toplanınca taşmasıydı.
- Ana çıkış −14 LUFS; ses yazıya dökülerek denetlendi, metinle aynı.

## Kullanılan varlıklar ve doğruluk

- Logo: `public/Brand/SinavikaLogo.png`. Uygulama ekranı: katalogdan `ExamHome`.
- Soru, şıklar, net trendi ve ders çubukları uygulamanın deneme ve istatistik ekranlarındaki öğelerin tam ekran çizimidir; sayılar örnek veridir. Net sayısı ekranda yazılmaz, anlatımda geçmez; fiyat, kullanıcı sayısı ya da başarı vaadi yoktur.
- Mağazalar düz yazıyla. Dışarıdan görsel, müzik ya da ses efekti indirilmedi. 16:9 sürüm üretilmedi (şablon destekler).
