# Brif — Sınavika Mobil Uygulama Tanıtımı

- **Yayın:** 13 Ekim 2026, 18:00 (İstanbul) — Instagram Reels, TikTok, YouTube Shorts
- **Şablon:** `AppPromotion`, `SinavikaDark`, 1080×1920, 60 fps
- **Süre:** 27 sn (kapanış kartı dahil)
- **İş dosyası:** [`Job.json`](Job.json) · **Gönderi dosyası:** [`Post.json`](Post.json)
- **Çıktı:** `Outputs/Videos/04_Sinavika_Mobil_Uygulama_Tanitimi.mp4` ve `…_Kapak.png`

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

Süreler seslendirmenin gerçek uzunluğundan çıkar; görüntü sese göre zamanlandı.

## Ses

- ElevenLabs, `Promoter` profili; seslendiren **Bella** (Eleven v3, tempo 1,05). Profilin ilk tercihi olan Türkçe ses (Nisa) hesapta olmadığı için sıradaki ses kullanıldı.
- 330 karakter, tek kayıt. Üretim öncesi 5.326, sonrası 4.996 karakter.
- "SinoAI" seslendirmede "yapay zekâ sınav koçu" olarak tarif edildi; ekranda gerçek adıyla görünüyor.

## Müzik ve ses tasarımı

- Kodla üretilen özgün müzik: Fa majör, 100 BPM, Fa – Do – Re minör – Si♭; yumuşak pad, sekizlik notalar, hafif vuruş. Ritim telefon sahneye girince başlar, kapanışta durur ve geniş bir akor çınlar.
- Her cümleye girişte hava sesi, sahne değişimlerinde yumuşak vuruş.
- Müzik yatağı −30 LUFS, seslendirme −14 LUFS: müzik sesin yaklaşık 16 dB altında.
- Ana çıkış ölçümü: **−14,7 LUFS, −1,0 dBTP**.

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
