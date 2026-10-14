# Brif — Sınavika Mobil Uygulama Tanıtımı

- **Yayın:** 13 Ekim 2026, 18:00 (İstanbul) — Instagram Reels, TikTok, YouTube Shorts
- **Şablon:** `AppPromotion`, `SinavikaDark`, 1080×1920, 60 fps
- **Süre:** 31,6 sn (kapanış kartı dahil)
- **İş dosyası:** [`Job.json`](Job.json) · **Gönderi dosyası:** [`Post.json`](Post.json)
- **Çıktı:** `Outputs/Videos/06_Sinavika_Mobil_Uygulama_Tanitimi.mp4` ve `…_Kapak.png`

## Fikir

Öğrencinin derdi dağınıklık: deneme bir yerde, konu anlatımı başka yerde. Cevap tek cümle: hepsi tek uygulamada. Telefon sahneye bir kez girer ve hiç çıkmaz; anlatım ilerledikçe ekranı değişir. Göz kesmeleri değil ürünü izler.

## Zaman çizelgesi

| Süre | Sahne | Ekranda | Seslendirme |
| --- | --- | --- | --- |
| 0,0–0,2 | Kapak | "Sınava hazırlık **tek uygulamada**" | — |
| 0,2–5,2 | Giriş | Dev hareketli yazı: "Sınava hazırlık / tek uygulamada." | Deneme bir yerde, konu anlatımı başka yerde. Sınava böyle mi hazırlanıyorsun? |
| 5,2–7,8 | Uygulama 1 | Telefon yükselir · **Modüller** · "Hepsi tek yerde" | Sınavika'da hepsi tek uygulamada. |
| 7,8–9,9 | Uygulama 2 | **TYT Denemesi** · "Deneme çöz" | Denemeni çöz. |
| 9,9–13,1 | Uygulama 3 | **İstatistik ve özet** · "Analizini gör" | Güçlü ve eksik alanlarını hemen gör. |
| 13,1–19,3 | Uygulama 4 | **Akıllı Özet** · "Fotoğrafını çek" | Takıldığın sorunun fotoğrafını çek; Akıllı Özet çözümünü ve hata analizini çıkarsın. |
| 19,3–22,5 | Uygulama 5 | **SinoAI** · "Koçuna sor" | Aklına takılanı yapay zekâ sınav koçuna sor. |
| 22,5–26,9 | Kapanış | Logo · "Ölç, öğren, geliş." · App Store · Google Play | Ölç, öğren, geliş. Sınavika'yı hemen indir. |

Süreler seslendirmenin gerçek uzunluğundan çıkar; görüntü sese göre zamanlandı. Tablodaki süreler ilk sürüme (Bella, 27 sn) aittir; Lisa ile yeniden üretilen sürüm 31,6 sn sürer, sahne sırası aynıdır.

## Ses

- **Seslendiren: Lisa** — ana dili Türkçe (İstanbul), marka sesi. Model: Multilingual v2 (Lisa'nın doğrulandığı en iyi model), tempo 1,0, abartısız ayar, 192 kbps kaynak.
- Metin tek istekte, bütün olarak üretildi; görüntü sesin gerçek sürelerine göre zamanlandı.
- Ses, yazıya dökülerek denetlendi (ElevenLabs Scribe): çıkan metin, "Sınavika" dahil, yazılan metinle kelimesi kelimesine aynı.

## Müzik ve ses tasarımı

- Müzik bu video için ElevenLabs Music ile yaptırıldı; tarifi `Job.json` içindeki `soundtrack.music` alanındadır. Önceki sürümlerdeki kodla üretilen müzik ve efektler beğenilmediği için kaldırıldı.
- Seslendirme karışıma seviyelenmiş olarak girer (−20 LUFS dolayı), müzik 16 dB altındadır. Önceki sürümdeki cızırtının nedeni, tam seviyede gelen sesin müzikle toplanınca taşmasıydı.
- Ana çıkış −14 LUFS; ses yazıya dökülerek denetlendi, metinle aynı.

## Kullanılan varlıklar

- Logo: `public/Brand/SinavikaLogo.png`
- Uygulama ekranları: `src/Components/AppScreens` (Modüller, TYT Denemesi, İstatistik ve özet, Akıllı Özet, SinoAI) — mobil uygulamanın kodundaki yapı, renk ve Türkçe metinlerden yeniden çizildi.
- Dışarıdan görsel, fotoğraf, müzik ya da ses efekti indirilmedi.

## Doğrulanan bilgiler

| Bilgi | Kaynak |
| --- | --- |
| Modül adları ve alt başlıkları | Mobil uygulama, `tr-TR/hub.ts` |
| "Hedefine bilgiyle yaklaş", "Deneme çöz, analizini gör, gelişimini takip et." | Mobil uygulama ana ekranı |
| Akıllı Özet: çözüm, kazanım, hata analizi | Mobil uygulama |
| "Türevi kısaca anlat" sohbet örneği, "Ölç, öğren, geliş." | sinavika.com |
| App Store ve Google Play'de yayında | sinavika.com |

Ekranlardaki sayılar (118:42, 78,5 net, ders çubukları) ürün gösterimi için örnek veridir. Fiyat, kullanıcı sayısı ya da başarı iddiası yoktur.
