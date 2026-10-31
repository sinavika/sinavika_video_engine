# Sınavika tipografi standardı

Markanın yazı dili: hangi yazı tipi, neden, hangi rolde, hangi dilde nasıl. Web, mobil, video, reklam, sosyal medya ve logo için tek kaynak budur. Platformların kendi uygulama raporları:

- Web (`sinavika_frontend_student`): [Tipografi-Web.md](Tipografi-Web.md)
- Mobil (`sinavika_mobile_reactnative`): [Tipografi-Mobil.md](Tipografi-Mobil.md)
- Video, reklam, sosyal medya (bu repo): [`src/Configurations/BrandTypography.ts`](../../src/Configurations/BrandTypography.ts), özet [BrandIdentity.md](../BrandIdentity.md#yazı-tipi)

Tarih: 15 Ekim 2026.

---

## 1. Karar

**Sınavika'nın tek yazı tipi Manrope'tur.** Sitede, uygulamada, videoda, reklamda, sosyal medya görselinde ve sunumda aynı aile kullanılır. Yanına yalnız iki teknik yardımcı girer; ikisi de marka sesi değildir:

| Görev | Yazı tipi | Not |
| --- | --- | --- |
| Marka sesi: başlık, metin, soru, şık, düğme, rakam, altyazı | **Manrope** 400–800 | Tek aile |
| Matematik ifadeleri | **KaTeX** yazı tipleri | Formül görüntüleyicinin kendi yazısı; ayrıca Manrope'ta olmayan ≤ ≥ ≈ √ ∞ ∫ işaretlerinin yedeği |
| Kod ve teknik kimlik (sipariş no, hata kodu) | Eş genişlikli yazı (apps: sistem monospace, video: JetBrains Mono) | Soru, metin ve rakamda asla |

Logo yazısı bir yazı tipi değildir; çizilmiş bir şekildir (bkz. §8).

## 2. Marka dili ve yazının görevi

Sınavika, öğrencinin doğrudan girip çalıştığı bir sınav markası. Yazının sırasıyla şunları sağlaması gerekiyor:

1. **Güven.** Öğrenci bir rakamı, bir harfi ya da bir şıkkı yanlış okursa bu tasarım hatası değil, yanlış cevaptır. Yazı önce doğru okunmalı.
2. **Sağduyu.** Abartısız, sakin, ciddi; ama soğuk ya da bürokratik değil. Gösteriş yapan, oyuncak gibi yuvarlak ya da aşırı dar/geniş yazılar güveni azaltır.
3. **Akılda kalıcılık.** Her yerde aynı yazı tipi. Bir öğrenci reklamı, videoyu, siteyi ve uygulamayı aynı markadan tanımalı. Tutarlılık, tek başına bir yazı tipinin "özel" olmasından daha çok hatırlanır.
4. **Modernlik.** Güncel, ekran için çizilmiş, genç ama çocuksu değil.
5. **Avrupa'da da aynı marka.** Türkçe, İngilizce, Almanca, Hollandaca ve diğer Latin alfabeli dillerde aynı görünüm, aynı güven.

## 3. Neden Manrope

| Ölçüt | Manrope | Nasıl doğrulandı |
| --- | --- | --- |
| Dil kapsamı | Türkçe, İngilizce, Almanca (ß, ẞ), Hollandaca, Fransızca (œ, «»), İspanyolca, İtalyanca, İskandinav dilleri, Lehçe, Çekçe/Slovakça, Macarca (ő ű), Romence (ș ț), Hırvatça, Baltık dilleri; ayrıca Yunanca ve Kiril | Her dilin özel harfleri yazı tipi dosyasında tek tek denendi; eksik çıkan yalnız Hollandaca tek karakterli `ĳ` (Hollandacada normalde iki harf "ij" yazılır, sorun değil) |
| Rakamlar | Sabit genişlikli rakam (`tabular-nums`) var | "1111" ve "0000" aynı genişlikte ölçüldü; puan, net, süre sütunları kaymaz |
| Ağırlıklar | 200–800 değişken (variable) | Tek dosya, istenen her kalınlık |
| Lisans | SIL Open Font License | Uygulama, web, video, baskı, reklamda ücretsiz |
| Karakter | Geometrik ama sıcak; açık harf içleri, net sayılar | Küçük boyda (12 px) ve videoda uzak mesafeden okunuyor |
| Mevcut kullanım | Web ve mobil zaten Manrope, kendi standart belgeleriyle | Değişiklik maliyeti en düşük seçenek |

**Bilinen sınırlar ve önlemleri:**

- **İtalik yok.** Tarayıcı ve telefon "sahte eğik" üretir; çirkin ve okunaksızdır. Vurgu kalınlıkla (600/700) ya da renkle yapılır. Platform raporlarında sahte italik kullanılan yerler listelendi.
- **900 kalınlık yok.** En kalın 800'dür. 900 istenirse tarayıcı 800 gösterir; kodda 900 yazılmaz.
- **Matematik işaretleri yok:** ≤ ≥ ≠ ≈ √ ∞ ∑ ∫ ∆ ve ‰. Bunlar formül görüntüleyiciyle (KaTeX) yazılır; düz metin içinde geçerse her platformda belirlenmiş bir yedek yazı tipinden gelir (bkz. §6). × ÷ ± − ° ² ½ π Manrope'ta vardır.
- **Büyük I ile küçük l benzer** (ikisi de düz çizgi; l biraz uzun). Sınav metninde Roma rakamları (I, II, III) bağlamdan anlaşılır; tek başına "I/l" ayrımının kritik olduğu yerlerde (birim, kod) eş genişlikli yazı ya da KaTeX kullanılır.

**Değerlendirilip seçilmeyenler:** Inter (çok yaygın, markaya karakter katmıyor; videolarda Ekim 2026'ya kadar kullanılıyordu), Plus Jakarta Sans (web standardı açıkça yasaklıyor; daha "startup" tonu), Nunito (yuvarlak, çocuksu; güveni azaltır), soru metni için Source Serif 4. Soru metninde tırnaklı bir yazı "sınav kitapçığı" hissi verirdi; ama modernlik tercihi, tek aile tutarlılığı ve web/mobilin zaten Manrope'la soru göstermesi nedeniyle **soru metni de Manrope'tur**. Kitapçık disiplini yazı tipiyle değil, düzenle sağlanır: `examQuestion` rolü (17/28 px, 500), sabit numaralandırma, formüllerde KaTeX.

## 4. Roller

Üç platform aynı **anlamsal rol adlarını** kullanır; piksel değerleri platforma göre ayarlıdır (telefon ekranı, masaüstü, 1080 px video). Web ve mobil değerleri kendi `typography.ts` dosyalarındaki değerlerdir.

| Rol | Ne için | Web | Mobil | Video (1080 px kısa kenar) |
| --- | --- | --- | --- | --- |
| `display` | Pazarlama başlığı | 30/38 → 48/56, 800 | 30/38, 800 | hook 112, 800 |
| `hero` | Büyük ürün başlığı | 26/34 → 40/48, 800 | 26/34, 700 | headline 92, 800 |
| `pageTitle` | Sayfa başlığı | 24/32 → 30/38, 700 | 24/32, 700 | kart başlığı, 800 |
| `title` / `sectionTitle` | Kart, bölüm | 24/32 · 20/28, 700 | 20/28 · 18/24, 700 | — |
| `headline` | Kompakt başlık, kart yüzü | 16/24, 600 | 16/24, 600 | — |
| `body` / `bodyEmphasis` | Metin | 16/24, 400/600 | 15/22, 400/600 | metin 500, vurgu 700 |
| `bodySmall` · `caption` · `meta` | İkincil, yardımcı, en küçük | 14 · 13 · 12 | 14 · 13 · 12 | altyazı 40 |
| `label` · `button` | Etiket, düğme | 13 · 14, 600 | 13 · 15, 600 | düğme 36, 700 |
| `examQuestion` | Soru kökü | 17/28, 500 | 16/26, 500 | soru kartı, 500 |
| `learningContent` · `aiMessage` | Uzun eğitim metni, SinoAI | 16/26, 400 | 15/24, 400 | — |
| `numeric` · `timer` | Puan, net, sayaç | 16/24, 700 · 16/24, 700; tabular | 15, 600 · 26, 800; tabular | numeral 230, 800 |

**Kalınlıkların anlamı her yerde aynıdır:** 400 metin · 500 soru ve videoda metin · 600 düğme, etiket, vurgu · 700 başlık · 800 büyük başlık ve marka anı. Metinde 700/800 kullanılmaz.

**En küçük işlevsel boy 12 px'tir.** Daha küçüğü yalnız dekoratif minyatür ekranlarda (pazarlama maketleri) kabul edilir.

## 5. Diller ve Avrupa açılımı

Yazı tipi bütün hedef dilleri karşılıyor (§3). Dil değişince bozulan şey yazı tipi değil, **metnin davranışıdır**. Kurallar:

1. **Dil etiketi metnin dilidir.** Her sayfa, ekran ve video metnin diliyle işaretlenir (`<html lang>`, öğe `lang`, videoda `VideoFrame lang`). Arayüz İngilizce ama soru Türkçeyse, soru kutusu `lang="tr"` taşır.
2. **Büyük harf dile göre yapılır.** Türkçede i → İ, ı → I; İngilizcede i → I; Almancada ß → SS. CSS `text-transform: uppercase` doğru `lang` ile doğru çalışır. Kodda büyük harf gerekiyorsa `toUpperCase()` değil `toLocaleUpperCase(dil)` kullanılır. Test cümlesi: "bilgi işlem" Türkçede "BİLGİ İŞLEM", İngilizcede "BILGI IŞLEM".
3. **Büyük harf yalnız 1–3 kelimelik etiketlerde.** Almanca bileşik kelimeler büyük harfle çok uzar ve okunmaz.
4. **Metin uzar; tasarım buna dayanır.** Almanca ve Hollandaca metinler Türkçe ve İngilizceden belirgin uzun olabilir (Almancada %30'a varan uzama olağandır). Düğme ve etiketlerde sabit genişlik yok; iki satıra inebilir. Dar başlıklarda `hyphens: auto` (doğru `lang` ile) ve `overflow-wrap: break-word`. Uzunluk her yeni dilde en uzun çeviriyle denenir.
5. **Tırnak, sayı, tarih çeviriden gelir, elle yazılmaz.** Almanca „…“, Fransızca « … », Türkçe ve İngilizce “…”. Ondalık ayırıcı Türkçe, Almanca, Hollandacada virgül, İngilizcede nokta; `Intl.NumberFormat` / `Intl.DateTimeFormat` ile, uygulamanın dili verilerek.
6. **Yazı tipi alt kümeleri:** Web `latin` + `latin-ext` yükler; bu, hedef Avrupa dillerinin tamamını kapsar. Kiril veya Yunanca bir pazar açılırsa `cyrillic` / `greek` alt kümesi eklenir; Manrope'ta mevcut.

## 6. Rakamlar ve matematik

- Puan, net, sıralama, süre, sayaç ve tablo sütunlarında **sabit genişlikli rakam** (`tabular-nums`) zorunludur. Ondalık virgüller alt alta hizalanır, sayaç zıplamaz.
- **Formüller KaTeX ile** yazılır (web ve video bunu yapıyor). Değişkenler italik, işaretler matematik yazısıyla; düz Manrope ile formül yazılmaz.
- **Düz metindeki matematik işaretleri** (≤, √…) Manrope'ta yok. Her platform bunlar için belirli bir yedek kullanır ki her cihazda aynı görünsün:
  - Video: `KaTeX_Main` (uygulandı; zaten yüklü).
  - Web: önerilen Noto Sans Math, Manrope'tan sonra (bkz. web raporu).
  - Mobil: sistem yazısı (iOS SF, Android Roboto) ya da formül görüntüleyici (bkz. mobil raporu).
- ∆ (U+2206) yerine Yunanca Δ (U+0394), ∑ yerine Σ yazılırsa Manrope'tan gelir.

## 7. Renk ve yazı

- Metin kömür `#0F172A`; ikincil metin `#6B7280`. Koyu temada metin `#F4F4F5`.
- Turuncu `#EA580C` yazıda yalnız vurgu (başlıkta tek kelime, bağlantı, etkin durum) içindir; turuncu paragraf olmaz. Koyu zeminde vurgu `#FB923C`.

## 8. Logo ile ilişki

- Logo: "Rafine" ikon + "Sınavika" yazısı, ikon ve yazı aynı renk. Ana sürüm açık zeminde `#EA580C`; turuncu ya da koyu zeminde beyaz.
- Logodaki "Sınavika" çizilmiş bir şekildir (SVG); Manrope ya da başka bir yazı tipiyle yazılıp logo yerine konmaz.
- Logonun kalın, geniş harfleri ile Manrope arasındaki fark bilinçlidir: logo bağırır, metin konuşur. Logo yazısı Manrope'a çevrilmez.

## 9. Yapılmayacaklar

- İkinci bir marka yazı tipi eklemek (ör. "sınav fontu", "AI fontu", reklam için ayrı yazı).
- Manrope'ta sahte italik; 900 kalınlık; metinde 700/800.
- `toUpperCase()` ile kullanıcıya görünen metni büyütmek; dil etiketi olmadan `uppercase`.
- Bir ekranda/karede üç farklı yazı tipi.
- Logo yazısını yazı tipiyle yazmak.
- 12 px'ten küçük işlevsel metin.

## 10. Uygulama durumu

| Alan | Durum |
| --- | --- |
| Web | Manrope tek aile, rol sistemi var. Eksikler ve öneriler: [Tipografi-Web.md](Tipografi-Web.md) |
| Mobil | Manrope tek aile, rol sistemi ve mimari test var. Eksikler ve öneriler: [Tipografi-Mobil.md](Tipografi-Mobil.md) |
| Video, reklam, sosyal medya | **Uygulandı (15 Ekim 2026):** bütün temalar Manrope'a geçti, 6 yazı tipi paketi kaldırıldı, matematik işaretleri için KaTeX yedeği, 900 kalınlık kaldırıldı, video dili `VideoFrame lang` ile seçiliyor. Test: `tests/Configurations/BrandTypography.test.ts`. |
| Logo | Rafine ikon ve renk sistemi seçildi; son dosyalar hazırlanınca değiştirilecek. |
