# Brif — Sınavika Mobil: Deneme çöz, sonucunu gör

- **Yayın:** 14 Ekim 2026, 18:00 (İstanbul) — Instagram Reels, TikTok, YouTube Shorts
- **Şablon:** `MobilePromotion` (yeni), `SinavikaDark`, 1080×1920, 60 fps
- **Süre:** 19,2 sn (marka kartı dahil)
- **İş dosyası:** [`Job.json`](Job.json) · **Gönderi dosyası:** [`Post.json`](Post.json)
- **Çıktı:** `Outputs/Videos/05_Sinavika_Mobil_Deneme_Coz_Sonucunu_Gor.mp4` ve `…_Kapak.png`
- **Sunucu:** gönderi `bd306a1f-828c-4956-869f-7d21a5cc8e4f`, admin onayı bekliyor

## Fikir

Ana mesaj: **Sınava hazırlık, tek uygulamada.** Hazırlık üç net hareketle anlatılır: denemeni çöz, sonucunu gör, hedefine yaklaş. Bu videoda yalnız deneme çözme ve sonuç analizi gösterilir; başka modül yoktur.

## Zaman çizelgesi

| Süre | Sahne | Ekranda | Hareket | Anlatım (altyazı) |
| --- | --- | --- | --- | --- |
| 0,0–0,2 | Kapak | "Deneme çöz, **sonucunu gör**" | — | — |
| 0,2–3,2 | Soru | "Sınava **nasıl** hazırlanıyorsun?" | Kelimeler yandan, hareket bulanıklığıyla tek tek gelir; turuncu çizgi aşağıyı, ürünün geleceği yeri gösterir | Sınava nasıl hazırlanıyorsun? |
| 3,2–6,2 | Adım 1 | **TYT Denemesi** ekranı · "Denemeni çöz." | Telefon ışığın içinden, büyükten küçülerek gelir ve netleşir; soru kartını uygulamanın dışındaki turuncu çerçeve işaretler | Sınavika ile denemeni çöz. |
| 6,2–10,2 | Adım 2 | **İstatistikler** ekranı · "Sonucunu gör." | Ekran büyüyen bir daire maskesiyle açılır; çerçeve net trendi kartına oturur | Sonuçlarını gör, eksiklerini fark et. |
| 10,2–14,2 | Tek uygulama | İki ekran yan yana · "Hazırlığın tek uygulamada." | Telefonlar iki yandan gelip hizalanır; altlarına tek bir turuncu çizgi çekilir | Hazırlığını tek uygulamada sürdür. |
| 14,2–17,8 | Çağrı | **Denemeler** ekranı · "Hedefine yaklaş." · "Sınavika'yı keşfet" düğmesi | Telefon ortada dengelenir; düğmenin üstünden ışık geçer | Sınavika ile hedefine yaklaş. |
| 17,8–19,2 | Marka kartı | Logo · sinavika.com · App Store · Google Play | Logo netleşerek yerine oturur; son akor çınlar | — |

## Ses

- **Bu sürümde seslendirme yok.** Ana dili Türkçe marka sesleri ElevenLabs kütüphane sesleridir ve hesap ücretsiz planda olduğu için API'den kullanılamıyor (`npm run voices`). Ana dili Türkçe olmayan yedek sesle üretim, 13 Ekim'de konan kural gereği kendiliğinden yapılmadı; ücretli üretim de yapılmadı (0 karakter harcandı).
- Mesajı ekran yazıları ve altyazılar taşır; video sessiz izlenince de eksiksizdir.
- Seslendirme metni hazır (toplam 158 karakter, tek istek): "Sınava nasıl hazırlanıyorsun? Sınavika ile denemeni çöz. Sonuçlarını gör, eksiklerini fark et. Hazırlığını tek uygulamada sürdür. Sınavika ile hedefine yaklaş. Sınavika'yı keşfet." Marka sesi hesaba eklenince `Job.json` içinde `"voiceover": true` yapılıp yeniden üretilir; görüntü sese göre kendiliğinden yeniden zamanlanır ve gönderi `replacesPostId` ile yenilenir.

## Müzik ve ses tasarımı

- Kodla üretilen özgün müzik ve efektler (`SoundtrackComposer`): her satır girişinde hava sesi, her sahne değişiminde yumuşak vuruş, marka kartında çınlayan son akor.
- Ölçüm: **−13,7 LUFS, −1,0 dBTP**.
- İstenen harici SFX kütüphanesi (`/Volumes/Extreme Pro/…`) bu bilgisayarda yok; kullanılmadı, yerine başka kaynak da indirilmedi.

## Kullanılan varlıklar

- Logo: `public/Brand/SinavikaLogo.png` (özgün dosya; yalnız konumu ve netliği canlandırıldı, biçimi değişmedi).
- Uygulama ekranları: `src/Components/AppScreens` kataloğundan `Exam`, `Analysis`, `ExamHome` — mobil uygulamanın kodundan yeniden çizilmiş ekranlar. Vurgu çerçeveleri uygulamanın dışındadır, ekran içeriğini değiştirmez.
- Mağazalar düz yazıyla (App Store, Google Play); resmî rozet dosyaları projede olmadığı için rozet kullanılmadı.
- Yazı tipi: projenin merkezî marka tipografisi (`BrandTypography.ts`). Manrope'a geçiş ayrı bir marka kararıdır, yapılmadı.
- Dışarıdan görsel, fotoğraf, müzik ya da ses efekti indirilmedi.

## Doğruluk

- Yalnız deneme çözme ve sonuç/istatistik ekranları gösterilir. Fiyat, kullanıcı sayısı, başarı garantisi ya da sıralama iddiası yoktur.
- Ekranlardaki sayılar (118:42, 78,5 net, %72) ürün gösterimi için örnek veridir; hiçbiri vurgulanıp vaat gibi sunulmaz, anlatımda geçmez.

## Bu istekten yapılmayanlar

- 16:9 sürüm üretilmedi (istek Reels / TikTok / Shorts içindi). Şablon yatay yerleşimi destekler: `"format": "Horizontal"`.
- Ayrı VO / müzik / SFX stem dosyaları teslim edilmedi; seslendirme olmadığı için tek ses katmanı var.
