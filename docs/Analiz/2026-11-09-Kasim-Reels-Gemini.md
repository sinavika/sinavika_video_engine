# Kasım tanıtım reels'leri: Gemini değerlendirmesi, 9 Kasım 2026

- **Ne:** 1–8 Kasım arasında yayınlanan 5 tanıtım reels'i Google AI Studio'da (Gemini 3.8 Flash, info@sinavika.com, geçici sohbet, Google arama kapalı) YouTube Shorts bağlantısıyla, saniyede 4 kareyle izletildi.
- **Gemini'ye verilenler:** gerçek Buffer ve YouTube ölçümleri, marka kuralları. Gemini'nin yüzde tahminleri kullanılmadı. Ölçü Buffer'dır ([2026-11-08-Kamp-ve-Reels-Analizi.md](2026-11-08-Kamp-ve-Reels-Analizi.md) Ek 2).
- **İstek:** sahip, 9 Kasım: Kasım videolarını Google AI Studio'da analiz et, bu hatalar sonraki videolarda olmasın.
- **Çıkan kurallar:** genel kurallara eklendi, [`SocialCreativePlaybook.md`](../Social/SocialCreativePlaybook.md) §11 (kural 9–17); motor denetler.

## Videolar

| Video | Ölçüm | Gemini puanı | En büyük hata |
|---|---|---|---|
| Bugünkü dersin şansa mı kaldı? (1 Kas, ders çarkı) | IG 123 · 3,3 sn; TikTok 413; YT 95 · %60 | 40 | Çark 1.–10. saniye dönüyor, yeni bilgi yok; uygulama 11. saniyede geliyor. Dert gerçek değil, metafor. "Yine mi paragraf?" bıkkınlığı tekdüze seste kayboluyor. |
| Kasım 30 gün. Kaçında çalışacaksın? (2 Kas, takvim) | IG 126 · 3,8 sn; TikTok 423; YT 85 · %69 | 60 | Kanca iyi (zaman baskısı) ama takvim 4. saniyeye kadar hareketsiz. 4. saniyeden sonra "30 gün × 15 dk = 7,5 saat" güçlü. |
| Telefonunu bırakmanın en iyi yolu (4 Kas, kronometre) | IG 115 · 3,1 sn; TikTok 148; YT 108 · %46 | 35 | Kronometre ve bildirim kutuları "yine bir Pomodoro" hissi veriyor; sayaç 5 sn boş dönüyor. Paradoks cümlesi zekice ama kişisel gelişim gibi, sınav derdi değil. |
| Bu haftanın fişi (6 Kas, fiş yazıcı) | YT 4; diğerleri ölçülmedi | 70 | Fiş özgün; 2–3. saniyede fişte henüz veri yok. "Gelecek haftanın fişi daha uzun olsun" serinin en iyi kapanışı. |
| Aynı gün, iki öğrenci (8 Kas, bölünmüş ekran) | ölçülmedi | 85 | İlk saniye boş lacivert yazı ekranı; bölünmüş ekran 0. saniyede başlamalı. Ekrandaki küçük yazılar telefonda okunmuyor. "Fark saatte değil, planda" çok iyi içgörü. |

## Ortak hatalar

1. **Hep aynı açılış.** Beş video da 0. saniyede aynı lacivert zemin, sol üstte logo ve ortada 2–3 satır yazıyla açılıyor. İzleyici bunu "kurumsal reklam" diye okuyup geçiyor. Kapak karesi platform için gerekli (`SocialPlan.md` §6), ama yalnız ilk 0,1–0,2 sn; ondan sonra olay başlamalı.
2. **Bilgi taşımayan hareket.** Çark ve kronometre saniyelerce dönüyor. Ekran hareket ediyor ama yeni bilgi yok. `REEL_STANDARD.maxStillSeconds` bunu yakalamıyor, çünkü yalnız hareketi sayıyor.
3. **Tekdüze ses.** "Yine mi paragraf?", "Çark çevirmeyi bırak!" gibi duygusal cümleler düz bir tonla okunuyor; inandırıcılık düşüyor.
4. **Küçük yazı.** Bölünmüş ekran ve sayaç kartlarındaki açıklamalar dikey ekranda okunmuyor.
5. **Durağan kapanış.** Son 3 sn'deki kart hareketsiz; izleyici videonun bittiğini 14. saniyede anlayıp geçiyor.
6. **Gerçek dert yerine metafor.** En iyi puanlar öğrencinin her gün yaşadığı somut karşılaştırmaya (iki öğrenci, haftanın fişi) gitti. En düşükler soyut metafora (çark) ve tükenmiş biçimlere (Pomodoro sayacı).

## Not

- Kapanış kartındaki "Ücretsiz indir" sabit kapanış kartının yazısıdır ([`Sosyal-Kimlik-Standardi.md`](../Social/Sosyal-Kimlik-Standardi.md)). Gemini'ye verilen "indir demiyoruz" kuralı yalnız seslendirme içindi. Bu yüzden bu not hata sayılmadı.
- Gemini ilk denemede yalnız düşünce üretti, cevap boş geldi. "Cevabı yaz" denince tam cevap geldi.
