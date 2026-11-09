# Araç değerlendirmesi (8 Kasım 2026)

Sahip iki kaynak gönderdi:
- "Claude ile sınırsız video" rehberi (Burak Cem Sayılar, PDF, 10 araç ve 25 adım);
- drillup.io'daki "Stravo/Strava videosu" yapım notu (Luca, DrillUp).

Soru şuydu: motorun altyapısında bir iyileştirme ya da yeni araç gerekiyor mu?

## Sonuç

Yeni bağımlılık gerekmiyor. Rehberdeki araçların karşılığı motorda zaten var:

| Rehberdeki araç | Ne yapar | Motordaki karşılığı |
|---|---|---|
| HyperFrames | HTML sahneleri videoya çevirir | Remotion (bütün şablonlar) |
| GSAP | Hareket zamanlaması, yumuşak geçiş | `src/Animations` (Motion, EASINGS), `Animated`, PromoKit |
| HyperFrames registry | Hazır geçiş, sayaç, yazı efekti | PromoKit / PromoMotion, `SoundEffects.ts` |
| three.js | 3B sahne | three (Works 3B figürleri, kimya ve fizik görselleri) |
| onetake / cinecode | Kesmesiz kamera, hazır kamera hareketi | `VisualClip` pencere kaydırma, CampTrailer telefon çekimleri |
| ClaudeAnimationBase / animate | Karakter ve tek tuval çizim | SinoAI küresi (VoiceOrb), ders görselleri |
| lottie-web | After Effects vektör animasyonu | Gerek yok; görseller veri olarak çiziliyor |
| ElevenLabs ve benzerleri | Ses klonu, seslendirme | ElevenLabs (Doğa sesi, Pro plan), cümle hizalaması |

Rehberin 25 adımlık akışı da motorda kurulu:
- storyboard: senaryo kartları ve beat'ler;
- sahne testleri: `--frame` render'ı ve yerleşim bekçisi;
- transkript ve seslendirme;
- sahneyi sese hizalama: `createNarrator`, NarrationCuts;
- son render.

Altyazı sahibin kararıyla kullanılmıyor (30 Ekim).

## Alınan dersler ve uygulananlar

| Ders (kaynak) | Uygulama |
|---|---|
| Mesaj bitince video biter; 5 sn'lik boş kapanış izlenme süresinin %30'unu götürür (drillup) | Flash reels'in kapanışı 2 sn, sessiz (`CampFlash`). Kamp reels'inde tek çağrı var. |
| Her sahnenin bir görevi olsun (drillup) | Açılış türleri (`question`, `mistake`, `visual`) her dersin ilk 5–10 saniyesine bir görev verir. |
| Önce his ya da soru, logo geç (drillup) | Soğuk açılış soruyla başlar; kamp kartı ondan sonra gelir. |
| Her olaya ses (drillup) | Zaten var: `SoundEffects.ts`, her harekete efekt (30 Ekim). |
| Üç renkli palet, her renge görev (drillup) | Zaten var: ders rengi, marka turuncusu, lacivert (Sosyal Kimlik Standardı). |
| İlk 3 saniyede hareket (rehber) | Reels açılışı tam ekran kanca ve atan sözcükler (8 Kasım). |

## Sonraya kalanlar (öneri, onay bekler)

- **Tek plan kamera hareketi:** savaş ve süreç görsellerinde evreler arasında kesmesiz yakınlaşma. Bunun için VisualClip'teki pencere kaydırma ders sahnelerine taşınabilir.
- **Flash reels ölçümü:** ilk 10 flash reels yayımlandıktan sonra Buffer verisiyle ortalama izlenme ve tamamlanma oranı karşılaştırılmalı (`docs/Analiz`).
