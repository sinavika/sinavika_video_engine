# Sosyal Medya Yayın Planı ve Üretim Kuralları

Sınavika'nın standart haftalık ve aylık yayın planı ile bu plana göre içerik hazırlamanın kuralları. Planın kendisi koddadır; bu belge onu açıklar. Plan değişecekse [`src/Configurations/SocialPlan.ts`](../src/Configurations/SocialPlan.ts) değiştirilir, takvimler oradan yeniden üretilir.

| Ne | Nerede |
| --- | --- |
| Haftalık plan, içerik türleri, formatlar, saat kuralları | [`src/Configurations/SocialPlan.ts`](../src/Configurations/SocialPlan.ts) |
| Kurumsal renk paleti (tek kaynak) | [`src/Configurations/BrandColors.ts`](../src/Configurations/BrandColors.ts) |
| Paletler ve temalar | [`src/Themes/Palettes.ts`](../src/Themes/Palettes.ts), [`src/Themes/ThemeRegistry.ts`](../src/Themes/ThemeRegistry.ts) |
| Takvim üretimi | [`src/Services/SocialPlanner.ts`](../src/Services/SocialPlanner.ts) |
| API'ye teslim | [`src/Services/SocialHubClient.ts`](../src/Services/SocialHubClient.ts), `npm run social` |

## 1. Haftalık plan

| Gün | Instagram + TikTok (ana gönderi) | Format | YouTube Shorts | Instagram Story | LinkedIn |
| --- | --- | --- | --- | --- | --- |
| Pazartesi | Soru çözümü (Matematik) | Kaydırmalı | — | Günün sorusu / Anket | Hook / Problem–Çözüm |
| Salı | Konu anlatımı | Video | aynı video | Kısa bilgi / Reels yönlendirmesi | — |
| Çarşamba | Hook / Sınav taktiği | Görsel | — | Sınav taktiği / Mini bilgi | Ürün tanıtımı |
| Perşembe | Soru çözümü (Türkçe veya başka ders) | Kaydırmalı | — | Çoktan seçmeli soru | — |
| Cuma | Sınavika tanıtımı | Video | aynı video | Uygulama özelliği | Marka / Girişim tanıtımı |
| Cumartesi | Zor soru / Mini test | Kaydırmalı | — | Mini test / Doğru cevap | — |
| Pazar | Haftalık tekrar | Video | aynı video | Haftalık tekrar / Motivasyon | — |

Haftalık toplam: 7 ana gönderi (Instagram ve TikTok'ta aynı içerik), 7 Story, 3 YouTube Shorts, 3 LinkedIn gönderisi. Aylık takvim aynı düzenin tekrarıdır; ayın 29–31. günleri de haftanın gününe göre dolar.

## 2. Platform kuralları

- **Instagram + TikTok:** aynı içerik, aynı dosyalar. Kaydırmalı gönderi TikTok'ta fotoğraf serisi olarak gider. Açıklama platforma göre ayrı yazılabilir (`targets[].caption`).
- **YouTube:** bağımsız içerik üretilmez. Yalnız Salı, Cuma ve Pazar videoları Shorts olarak gider; kaydırmalı gönderi ve görsel hiçbir zaman gitmez (API de reddeder). `title` video başlığıdır.
- **Instagram Story:** günün ana gönderisini destekler, aynısını tekrar etmez. Tek görsel veya tek video; kategori `Story` olarak teslim edilir, API bunu hikâye olarak yayınlar.
- **LinkedIn:** yalnız Sınavika'nın tanıtımı, ürünü ve girişim hikâyesi. Ders anlatımı, soru çözümü, mini test paylaşılmaz. Yalnız gerçek özellikler ve doğrulanmış başarılar anlatılır.

| Platform | Medya | Metin sınırı (açıklama + hashtag) |
| --- | --- | --- |
| Instagram | 1 video (Reel) veya 1–10 görsel; Story'de tek dosya | 2.196 |
| TikTok | 1 video veya 1–10 görsel | videoda 2.200, görselde 4.000 |
| YouTube | 1 video | 5.000; başlık 100 |
| LinkedIn | 1 video veya 1–10 görsel | 3.000 |

## 3. Yayın saatleri

Saatler Buffer'da her hesap için tanımlı yayın saatlerinden alınır (`npm run social -- accounts`).

- Bir gönderinin tek saati vardır ve tüm platformlarında o saatte yayınlanır. Saat, gönderinin platformları içinde şu sırayla ilk Buffer saati olan hesaptan gelir: Instagram, TikTok, YouTube, LinkedIn.
- Buffer'da o gün hiç saat yoksa plandaki yedek saat kullanılır: ana gönderi 20:00, LinkedIn 09:30.
- Story, günün ana gönderisinden 3 saat önce yayınlanır (en erken 07:00).
- Tüm saatler İstanbul saatidir ve teslimde `+03:00` ile yazılır.

Takvimdeki her satır saatin kaynağını gösterir (`buffer:instagram`, `fallback`).

## 4. Tasarım ve renk

- Tüm sosyal medya içerikleri iki resmî temadan biriyle üretilir: `SinavikaLight` veya `SinavikaDark`. Başka tema kullanılmaz.
- Tema içerik türüne bağlıdır, tek tek gönderiye göre seçilmez; böylece profil akışında açık–koyu ritmi sabit kalır:

| Tema | İçerik türleri |
| --- | --- |
| `SinavikaLight` | Soru çözümü, konu anlatımı, haftalık tekrar, Story, LinkedIn hook ve ürün |
| `SinavikaDark` | Hook / sınav taktiği, Sınavika tanıtımı, zor soru / mini test, LinkedIn marka |

- Aynı içerik türü her zaman aynı tasarım şablonuyla üretilir. Şablon içinde yerleşim, yazı tipi ve logo konumu değişmez.
- Renk kullanımı: turuncu yalnız vurgu ve çağrı için; antrasit başlık ve metin; nötr griler yüzey ve ayırıcı; yeşil, sarı, kırmızı, mavi yalnız durum (doğru, uyarı, yanlış, bilgi). Mor, mobildeki çözüm inceleme deneyimine ayrılmıştır ve içeriklerde kullanılmaz.
- Ders ve kategoriye göre renk farkı için ayrı bir ders rengi tanımlı değildir; palet buna izin veren bir renk içermiyor. Dersler şimdilik etiket metniyle ayrılır.

## 5. Kaynak veriler

- Soru, konu ve hook içerikleri yalnız verilen JSON kaynaklarından üretilir; kaynakta olmayan bilgi eklenmez. Soru ve cevabın doğruluğu teslimden önce kontrol edilir.
- Her kaynak bir kez kullanılır. Teslimde `sources` alanına yazılan kaynak API'de "kullanıldı" olur; başka gönderide kullanılmak istenirse API reddeder.
- Planlamadan önce: `npm run social -- sources --kind Question --unused`.

| İçerik türü | Kaynak türü |
| --- | --- |
| Soru çözümü, zor soru / mini test | `Question` |
| Konu anlatımı, haftalık tekrar | `Topic` |
| Hook / sınav taktiği, LinkedIn hook | `Hook` |
| Tanıtım, Story, LinkedIn ürün ve marka | kaynak gerekmez; brifingden yazılır |

## 6. Metin

- Her gönderi açıklama, hashtag, medya, platform ve yayın zamanıyla eksiksiz teslim edilir.
- `#sinavika` her gönderide bulunur; diğer hashtag'ler ders ve konuya göre eklenir.
- Görselde "cevap açıklamada" deniyorsa cevap açıklamada gerçekten yer alır.
- Fiyat, kampanya, kullanıcı sayısı gibi iddialar yalnız doğrulanmış bilgiyle yazılır.

## 7. Dosyalar

- Video dosyalarının üst verisinde yalnız marka adı bulunur; üretim aracına dair not yazılmaz. Görseller üst veri taşımaz.
- Buffer'a "yapay zekâ ile üretildi" işareti gönderilmez.

## 8. Onay ve revizyon

1. İçerikler API'ye teslim edilir ve admin onayını bekler. Onay olmadan hiçbir şey yayınlanmaz.
2. Reddedilen gönderi notuyla birlikte `npm run social -- revisions` listesinde görünür.
3. Yenisi aynı tarih ve saatle hazırlanır ve `replacesPostId` ile teslim edilir; eski gönderi geçmiş olarak kalır, kaynakları yenisine devredilir.

## 9. Komutlar

```bash
npm run social -- plan --month 2026-11 --out Plans/2026-11.json
npm run social -- plan --from 2026-11-02 --to 2026-11-09
npm run social -- sources --kind Question --unused
npm run image -- --job Jobs/soru.json --theme SinavikaLight --size Portrait
npm run social -- submit --post Posts/2026-11-02_mon.json
npm run social -- calendar --from 2026-11-01 --to 2026-12-01
npm run social -- revisions
```

Plan dosyasındaki her satır hazırlanacak bir içeriğin brifingidir: tarih, saat, kanal, içerik türü, format, platformlar, tema, boyut ve kullanılacak kaynak türü.
