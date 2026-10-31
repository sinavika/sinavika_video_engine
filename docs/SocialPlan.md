# Sosyal Medya Yayın Planı ve Üretim Kuralları

Sınavika'nın standart haftalık ve aylık yayın planı ile bu plana göre içerik hazırlamanın kuralları. Planın kendisi koddadır; bu belge onu açıklar. Bir kural değişecekse aşağıdaki dosyada değiştirilir, takvimler ve üretim oradan beslenir.

Plan bir stratejiye hizmet eder. Vizyon, 1 milyon takipçi hedefi, içerik sütunları ve ölçüm [`SocialStrategy.md`](SocialStrategy.md) belgesindedir. Hook, kurgu, açıklama ve yayın öncesi kontrol listesi [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) belgesindedir. Dayanılan kaynaklar [`SocialResources.md`](SocialResources.md) belgesindedir. Planlanan her içerik bir sütuna bağlanır ve sütun gönderinin `Brief.md` dosyasına yazılır.

| Ne | Nerede |
| --- | --- |
| Haftalık plan, içerik türleri, formatlar, gönderi türleri, saat kuralları | [`src/Configurations/SocialPlan.ts`](../src/Configurations/SocialPlan.ts) |
| Kurumsal renk paleti (tek kaynak) | [`src/Configurations/BrandColors.ts`](../src/Configurations/BrandColors.ts) |
| Ders renkleri | [`src/Configurations/LessonColors.ts`](../src/Configurations/LessonColors.ts) |
| Video kapağı ayarları | [`src/Configurations/VideoCover.ts`](../src/Configurations/VideoCover.ts) |
| Paletler ve temalar | [`src/Themes/Palettes.ts`](../src/Themes/Palettes.ts), [`src/Themes/ThemeRegistry.ts`](../src/Themes/ThemeRegistry.ts) |
| Takvim üretimi | [`src/Services/SocialPlanner.ts`](../src/Services/SocialPlanner.ts) |
| API'ye teslim | [`src/Services/SocialHubClient.ts`](../src/Services/SocialHubClient.ts), `npm run social` |

## 1. Haftalık plan

| Gün | Instagram + TikTok (ana gönderi) | Format | YouTube Shorts | Instagram Story | LinkedIn |
| --- | --- | --- | --- | --- | --- |
| Pazartesi | Soru çözümü (Matematik) | Kaydırmalı | — | Günün sorusu / Anket | Hook / Problem–Çözüm |
| Salı | Konu anlatımı | Video | aynı video | Kısa bilgi / Reels yönlendirmesi | — |
| Çarşamba | Hook / Sınav taktiği | Tekli görsel | — | Sınav taktiği / Mini bilgi | Ürün tanıtımı |
| Perşembe | Soru çözümü (Türkçe veya başka ders) | Kaydırmalı | — | Çoktan seçmeli soru | — |
| Cuma | Sınavika tanıtımı | Video | aynı video | Uygulama özelliği | Marka / Girişim tanıtımı |
| Cumartesi | Zor soru / Mini test | Kaydırmalı | — | Mini test / Doğru cevap | — |
| Pazar | Haftalık tekrar | Video | aynı video | Haftalık tekrar / Motivasyon | — |

Haftalık toplam: 7 ana gönderi (Instagram ve TikTok'ta aynı içerik), 7 Story, 3 YouTube Shorts, 3 LinkedIn gönderisi. Aylık takvim aynı düzenin tekrarıdır; ayın 29–31. günleri de haftanın gününe göre dolar.

### Tanıtım planı (Ekim 2026'dan)

Eğitim içeriği paylaşılmayan dönemlerde `PROMO_WEEKLY_PLAN` kullanılır:
- Haftada 4 reels: Pazartesi, Çarşamba, Cuma, Pazar. Instagram, TikTok ve YouTube Shorts.
- Haftada 3 gönderi: Salı ve Cumartesi kaydırmalı, Perşembe tek görsel.
- Her gün 1 Instagram hikâyesi. Buffer TikTok hikâyesi paylaşamaz.

Yalnız mobil uygulama ve web sitesi tanıtılır; hook'lar kullanıcı kazanmaya yöneliktir. Takvim:

```
npm run social -- plan --plan tanitim --from 2026-10-17 --to 2026-11-01
```

Gün gün içerik kampanya dosyasındadır (`src/Campaigns/`). Plan belgesi: [Campaigns/2026-10-Tanitim.md](Campaigns/2026-10-Tanitim.md).

## 2. Gönderi türleri

Her içeriğin iki etiketi vardır: **içerik kategorisi** (soru çözümü, konu anlatımı…) ve paylaşıldığı platformdaki **gerçek gönderi türü**. Tür, formata ve platforma göre belirlenir; bir platformun sahip olmadığı tür planlanamaz ve API tarafından reddedilir.

| Format | Instagram | TikTok | YouTube | LinkedIn |
| --- | --- | --- | --- | --- |
| Kaydırmalı (2–10 görsel) | `carousel` | `photo` | — | `images` |
| Tekli görsel | `image` | `photo` | — | `image` |
| Kısa video | `reel` | `video` | `short` | `video` |
| Story (tek görsel veya video) | `story` | — | — | — |
| Metin | — | — | — | `text` |

- **Instagram + TikTok:** aynı içerik, aynı dosyalar. Açıklama platforma göre ayrı yazılabilir (`targets[].caption`).
- **YouTube:** bağımsız içerik üretilmez. Yalnız Salı, Cuma ve Pazar videoları Shorts olarak gider; görsel ve kaydırmalı gönderi hiçbir zaman gitmez. `title` video başlığıdır.
- **Instagram Story:** günün ana gönderisini destekler, aynısını tekrar etmez.
- **LinkedIn:** yalnız tanıtım, marka ve hook içerikleri. Ders anlatımı, soru çözümü, mini test paylaşılmaz. Yalnız gerçek özellikler ve doğrulanmış başarılar anlatılır.

| Platform | Metin sınırı (açıklama + hashtag) |
| --- | --- |
| Instagram | 2.196 |
| TikTok | videoda 2.200, görselde 4.000 |
| YouTube | 5.000; başlık 100 |
| LinkedIn | 3.000 |

## 3. Yayın saatleri

Saatler Buffer'da her hesap için tanımlı yayın saatlerinden alınır (`npm run social -- accounts`).

- **Her platform kendi Buffer saatinde yayınlar.** Aynı video Instagram'da Instagram'ın, YouTube'da YouTube'un saatinde çıkar.
- Buffer saatleri hesap başına tanımlıdır, gönderi türü başına değil: aynı hesaptaki Reel ile kaydırmalı gönderi o hesabın saatlerini paylaşır. Buffer API'sinde gönderi türüne göre ayrı saat yoktur.
- Bir platformun o gün Buffer saati yoksa, gönderinin ana saatini kullanır: sırayla Instagram, TikTok, YouTube, LinkedIn içinde saati olan ilk hesabınki.
- Hiçbir hesabın saati yoksa plandaki yedek saat kullanılır: ana gönderi 20:00, LinkedIn 09:30. Takvimde bunlar `*` ile işaretlenir.
- Story, günün ana gönderisinden 3 saat önce yayınlanır (en erken 07:00).
- Tüm saatler İstanbul saatidir ve teslimde `+03:00` ile yazılır.
- **Saat kuralı:** Bütün gönderiler Buffer saatlerini kullanır (sahip, 29 Ekim 2026).
  - Tek istisna, anı belli olan özel günlerdir. Bu günler kampanya dosyasındaki `time` alanıyla kendi saatinde çıkar, ör. 10 Kasım 09.05.
  - Özel gün saatini sahip onaylar ya da daha iyisini önerir.
- Saatler test edilerek iyileştirilir. Öğrencinin aktif olduğu akşam saatleri (18:00–23:00) 4–6 hafta denenir; Buffer'daki programı sahip değiştirir. Sonuç haftalık raporda okunur ([`SocialStrategy.md`](SocialStrategy.md) §9).

## 4. Tasarım ve renk

- Tüm sosyal medya içerikleri iki resmî temadan biriyle üretilir: `SinavikaLight` veya `SinavikaDark`.
- Tema içerik türüne bağlıdır, tek tek gönderiye göre seçilmez; böylece profil akışında açık–koyu ritmi sabit kalır:

| Tema | İçerik türleri |
| --- | --- |
| `SinavikaLight` | Soru çözümü, konu anlatımı, haftalık tekrar, Story, LinkedIn hook ve ürün |
| `SinavikaDark` | Hook / sınav taktiği, Sınavika tanıtımı, zor soru / mini test, LinkedIn marka |

- Aynı içerik türü her zaman aynı tasarım şablonuyla üretilir. Şablon içinde yerleşim, yazı tipi ve logo konumu değişmez.
- Turuncu yalnız vurgu ve çağrı için; üstündeki yazı sinavika.com'daki gibi beyazdır. Antrasit başlık ve metin; nötr griler yüzey ve ayırıcı; yeşil, sarı, kırmızı, mavi yalnız durum (doğru, uyarı, yanlış, bilgi). Mor, mobildeki çözüm inceleme deneyimine ayrılmıştır.

### Ders renkleri

Turuncu her tasarımda marka rengi olarak kalır. Ders yalnız küçük vurguları değiştirir: ders etiketi, fosforlu vurgu ve vurgu rengini kullanan küçük öğeler. Dersler beş aileye ayrılır; ailesi olmayan içerik (rehberlik, tanıtım) marka turuncusunu kullanır.

| Aile | Dersler | Açık tema | Koyu tema |
| --- | --- | --- | --- |
| Sayısal | Matematik, Geometri | `#1E40AF` | `#93B4FF` |
| Fen | Fizik, Kimya, Biyoloji, Fen Bilimleri | `#0F766E` | `#5EEAD4` |
| Türkçe | Türkçe, Edebiyat, Paragraf, Dil Bilgisi | `#BE185D` | `#F9A8D4` |
| Sosyal | Tarih, Coğrafya, Felsefe, Din Kültürü, Vatandaşlık | `#4D7C0F` | `#BEF264` |
| Yabancı dil | İngilizce, Almanca, Fransızca | `#0E7490` | `#67E8F9` |

Neden böyle: her derse ayrı renk yerine beş aile seçildi, çünkü az sayıda sabit renk akışta hızla öğrenilir ve marka bütünlüğünü bozmaz. Tonlar markanın antrasit ve turuncusunun yanında duran koyu "mürekkep" tonlarıdır; hiçbiri uygulamadaki durum renkleriyle ya da ayrılmış morla aynı değildir ve hepsi üstündeki yazıyla 4,5:1 kontrastı sağlar. Ders–renk eşlemesi için yerleşik bir standart yoktur (yaygın eğilim matematik için mavi, fen için yeşildir); bu yüzden seçim bir kez yapılıp sabitlenmiştir. Ders, işteki `lesson` alanından ya da içerikteki `subject` alanından otomatik alınır.

## 5. Görsel türleri

Kaydırmalı gönderi, tekli görsel, Story ve video kapağı ayrı türlerdir; biri diğerinin yerine kullanılmaz.

| Tür | Boyut | Kural |
| --- | --- | --- |
| Kaydırmalı gönderi | 1080×1350 | İlk görsel hook'u taşıyan güçlü bir kapaktır ve boş kalmaz. İkinci görsel ikinci hook'tur, çünkü Instagram gönderiyi yeniden gösterirken 2. görselden açabilir. Son görsel sonuç ve tek çağrıdır. Sayfa sayacı (`1/5`) ve ilerleme çubuğu **yoktur**; bunları Instagram ve TikTok kendi arayüzünde gösterir. Kapakta kısa bir "Kaydır" çağrısı olabilir (sahip, 31 Ekim 2026); iç sayfalarda kaydırma oku yoktur. İçeriğin parçası olan `01`, `02`, `03` kural numaraları kalır. Ayrıntı: [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §5. |
| Tekli görsel | 1080×1350 | Kaydırmaya işaret eden hiçbir öğe (ok, sayaç, "kaydır" çağrısı) bulunmaz. |
| Story | 1080×1920 | Tek görsel veya tek video. Günün ana gönderisinin kopyası olmaz. |
| Video kapağı | videonun boyutu | Yalnız videonun kapağıdır; kaydırmalı gönderinin görseli olarak kullanılmaz ve medya listesine girmez. |

## 6. Video kapağı

- **Her kısa video için kapak görseli otomatik üretilir.** Kapak tek kapak standardındadır ([`Sosyal-Kimlik-Standardi.md`](Sosyal-Kimlik-Standardi.md) §1): lacivert zemin, sol üstte beyaz logo, etiket ve tek vurgulu başlık. Videonun teması kapağı değiştirmez; ders yalnız etiketteki noktanın rengini verir. Başlık, ders ve içerik türü videonun içeriğinden alınır. İş dosyasındaki `cover` alanı metinleri değiştirebilir; `"cover": false` kapağı kapatır.
- Kapak, videoyla aynı numara altında kaydedilir: `03_Turkce_Ses_Olaylari.mp4` ve `03_Turkce_Ses_Olaylari_Kapak.png`.
- Teslimde kapak videoyla birlikte, medya listesinden ayrı olarak API'ye yüklenir.
- **Platformlar ayrı yüklenen kapak görselini kabul etmez.** Buffer üzerinden yapılabilen tek şey, videonun bir karesini kapak olarak seçmektir (Instagram Reels ve TikTok). Bu yüzden kapak, videonun ilk 0,2 saniyesinde ekranda tutulur ve platforma kapak karesi olarak bu an (100. milisaniye) bildirilir.
- YouTube Shorts'ta API ile kapak seçilemez. Kapak görseli orada elle ayarlamak için saklanır; API bunu "uygulandı" saymaz.

| Platform | Kapak nasıl uygulanır |
| --- | --- |
| Instagram Reels | Otomatik: videodaki kapak karesi |
| TikTok | Otomatik: videodaki kapak karesi |
| YouTube Shorts | Elle (YouTube uygulamasından); görsel API'de hazır durur |

## 7. Kaynak veriler

- Soru, konu ve hook içerikleri yalnız verilen JSON kaynaklarından üretilir; kaynakta olmayan bilgi eklenmez. Soru ve cevabın doğruluğu teslimden önce kontrol edilir.
- Her kaynak bir kez kullanılır. Teslimde `sources` alanına yazılan kaynak API'de "kullanıldı" olur; başka gönderide kullanılmak istenirse API reddeder.
- Planlamadan önce: `npm run social -- sources --kind Question --unused`.

| İçerik türü | Kaynak türü |
| --- | --- |
| Soru çözümü, zor soru / mini test | `Question` |
| Konu anlatımı, haftalık tekrar | `Topic` |
| Hook / sınav taktiği, LinkedIn hook | `Hook` |
| Tanıtım, Story, LinkedIn ürün ve marka | kaynak gerekmez; brifingden yazılır |

## 8. Metin ve teslim

- Her gönderi açıklama, hashtag, medya, platformlar, gönderi türleri ve yayın zamanıyla eksiksiz teslim edilir.
- Açıklamanın ilk satırı hook ile aranacak ifadeyi birlikte taşır (sosyal SEO). Her gönderide tek bir çağrı bulunur ([`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §6).
- Hashtag 3–5 tanedir: `#sinavika` her gönderide; ardından sınav ve ders ya da konu. TikTok'ta en fazla 5.
- **Bütün milli ve dini bayramlar ile anma ve kutlama günleri reklam taşımaz** (sahip, 29 Ekim 2026). Liste: [`src/Configurations/SpecialDay.ts`](../src/Configurations/SpecialDay.ts).
  - Günler: 23 Nisan, 19 Mayıs, 30 Ağustos, 29 Ekim; Ramazan ve Kurban Bayramı'nın her günü (arefe hariç); 10 Kasım; 24 Kasım.
  - Marka yalnız görselin köşesindeki küçük logoyla görünür.
  - Ürün, çağrı ("indir", "profilde", bağlantı, "ücretsiz"), marka adı (Sınavika, SinoAI) ve `#sinavika` kullanılmaz. Yalnız güne ait hashtag'ler kullanılır.
  - Kural o günün bütün gönderileri için geçerlidir, hikâye dahil. Bayramın diğer günlerinde de reklamlı gönderi çıkmaz.
  - Kampanya testleri ve `npm run social -- submit` bunu her seferinde denetler. Bayram gününe tarihli reklamlı bir gönderi gönderilemez.
  - Dini bayramlar her yıl değişir. Yeni yıl planlanmadan önce Diyanet takviminden `SpecialDay.ts` dosyasına eklenir; test, planlanan yılın girilip girilmediğini denetler.
- sinavika.com'a giden her bağlantı UTM taşır ([`SocialStrategy.md`](SocialStrategy.md) §6). Instagram ve TikTok açıklamasında bağlantı tıklanmadığı için "profildeki bağlantı" denir.
- Görselde "cevap açıklamada" deniyorsa cevap açıklamada gerçekten yer alır.
- Fiyat, kampanya, kullanıcı sayısı gibi iddialar yalnız doğrulanmış bilgiyle yazılır.
- Video dosyalarında üretim aracına dair etiket bulunmaz; görseller üst veri taşımaz. Buffer'a "yapay zekâ ile üretildi" işareti gönderilmez.
  - Bu kural, içeriğin platformların etiket istediği sınırın içinde kalmasına dayanır: gerçekçi yapay insan ya da yaşanmamış gerçekçi sahne yok, gerçek kişinin sesi taklit edilmiyor, müzik videonun ana konusu değil.
  - YouTube ve TikTok bu sınırın içindeki animasyon, grafik ve seslendirme için etiket istemez ([`SocialStrategy.md`](SocialStrategy.md) §8).
  - Sınır aşılacaksa önce sahibe sorulur ve içerik etiketle yayınlanır.

## 9. Onay ve revizyon

1. İçerikler API'ye teslim edilir ve admin onayını bekler. Onay olmadan hiçbir şey yayınlanmaz.
2. Reddedilen gönderi notuyla birlikte `npm run social -- revisions` listesinde görünür.
3. Yenisi aynı tarih ve saatlerle hazırlanır ve `replacesPostId` ile teslim edilir; eski gönderi geçmiş olarak kalır, kaynakları yenisine devredilir.

### Onay bekleyen gönderiyi değiştirme (30 Ekim 2026)

> **Durum:** Uçlar API kodunda hazır ama canlıda değil. API yayını ve mig127, mig128, mig129 migration'ları sahibin onayıyla canlıya alınana kadar bu uçlara istek atılmaz. Motor tarafında (`SocialHubClient`, `npm run social`) henüz karşılığı yok; sahip söyleyince eklenir. Tam belge: API deposunda `docs/frontend/claude-social-hub-api.md`.

**Sahibin kuralı:**
- Claude yalnız onay bekleyen gönderiye dokunur. Onaylı, reddedilmiş, geri çekilmiş ya da Buffer'a gitmiş gönderiye dokunamaz.
- Değiştireceği gönderiyi önce "Claude değiştiriyor" durumuna alır. Sahip o sürede onaylayamaz, reddedemez, düzenleyemez.
- Onay, red, yayın, Buffer ve silme yalnız sahiptedir. Claude için silme ucu yoktur.

**Durumlar (`status`):** 0 `Pending` (onay bekliyor) · 1 `Approved` · 2 `Rejected` · 3 `ClaudeRevising` (Claude değiştiriyor) · 4 `Withdrawn` (geri çekildi, silinmez).

**Her değiştiren istekte:**
- **Gerekçe:** `reason` alanı zorunludur, en çok 2000 karakter. Geçmişe yazılır; panelde "Claude güncelledi: …" rozeti olarak görünür.
- **Sürüm:** gönderinin `version` alanı vardır; Claude'un ve adminin her işleminde bir artar. `GET posts/{id}` sürümü `ETag: "3"` olarak verir. Değiştiren istek `If-Match: "3"` gönderir.
  - Başlık yoksa 428 döner.
  - Sürüm değiştiyse 409 `{error, currentVersion}` döner. Bu durumda iş durur ve sahibe sorulur.

**Yeni uçlar** (`/api/claude/social-hub`, `X-SocialHub-Key`):

| Uç | Ne yapar | İzin verilen durum → sonuç |
|---|---|---|
| `POST posts/{id}/hold` `{reason}` | Değiştirmeden önce bekletir; video yeniden üretilmeden önce çağrılır | `Pending` → `ClaudeRevising` |
| `POST posts/{id}/release` `{reason}` | Değiştirmeden onaya bırakır | `ClaudeRevising` → `Pending` |
| `PUT posts/{id}` (multipart: `payload`, `files`, `cover`) | Medyayı, kapağı ve metni yeniler. Kimlik, takvim ve hesaplar aynı kalır | `Pending` ya da `ClaudeRevising` → `Pending`, sürüm +1 |
| `PATCH posts/{id}` (JSON) | Yalnız metni düzeltir; gönderilmeyen alan değişmez | Durum değişmez |
| `POST posts/{id}/withdraw` `{reason}` | Silmeden geri çeker | `Pending` ya da `ClaudeRevising` → `Withdrawn` |
| `GET posts/{id}/revisions` | Sürüm geçmişi, eskiden yeniye | — |
| `POST posts/validate` | `POST posts` ile aynı gövdeyi kaydetmeden denetler | — |

**`PUT` ayrıntıları:**
- **Payload:** `{reason, title, caption, hashtags, coverOffsetMs, targets: [{platform, postType?, caption?}]}`.
- **`files`:** 1–10 dosyadır ve eskilerin hepsinin yerine geçer.
- **`targets`:** yalnız gönderide olan platformları değiştirir. Gönderide olmayan bir platform 400 döner.
- **Tam yenileme:** `hashtags` gönderilmezse temizlenir; `cover` gönderilmezse kapak kalkar.

**`PATCH`:** `hashtags: ""` hashtag'leri temizler. Hiçbir şey değişmiyorsa 400 "Değişen metin yok." döner.

**Geçmiş (`revisions`):**
- **`actor`:** 0 Claude, 1 Admin.
- **`action`:** 0 Created, 1 Held, 2 Released, 3 Updated, 4 TextEdited, 5 Withdrawn, 6 Edited, 7 CoverChanged, 8 Approved, 9 Rejected, 10 ApprovalCancelled.
- **Son Claude işlemi:** gönderi yanıtındaki `lastClaudeRevision` alanıdır.

**Sunucunun denetlemediği:** özel gün metni ve ürün adları sunucuda kural değildir. Bu denetim motorda kalır (`assertSpecialDayCopy`, `assertProductCopy`).

**Değişmeyen:** `replacesPostId` eskisi gibi yalnız reddedilmiş gönderi için kullanılır.

**Akış (canlıya alınınca):** `hold` → video yeniden üretilir → `PUT`. Vazgeçilirse `release`.

## 10. Komutlar

```bash
npm run social -- plan --month 2026-11 --out Posts/Plans/2026-11.json
npm run social -- sources --kind Question --unused
npm run image -- --job Jobs/soru.json --theme SinavikaLight --size Portrait
npm run render -- --job Jobs/konu.json
npm run social -- submit --post Posts/2026-11-03_tue.json
npm run social -- calendar --from 2026-11-01 --to 2026-12-01
npm run social -- revisions
```

Plan dosyasındaki her satır hazırlanacak bir içeriğin brifingidir: tarih, kanal, içerik türü, format, tema, boyut, kaynak türü ve `targets` (platform, gönderi türü, o platformun saati). `targets` gönderi dosyasına olduğu gibi kopyalanır. `npm run render` videoyu kapağıyla birlikte `Outputs/Videos` altına kaydeder; gönderi dosyasında videoyu göstermek yeterlidir, yanındaki kapak kendiliğinden yüklenir.

## Video kalitesi

- **Kural: her render en yüksek kalitede yapılır.** Videolar 4K (`2160p`, dikeyde 2160×3840) üretilir; ana dosya budur. Varsayılan `DEFAULT_RENDER_QUALITY` (`src/Configurations/VideoFormats.ts`); daha düşük kalite yalnız hızlı önizleme için elle seçilir.
- **YouTube videoları (ders anlatımları ve Shorts) 4K yüklenir**, ana dosyanın kendisiyle.
- **Instagram, Facebook, TikTok, LinkedIn (Buffer üzerinden):** Instagram'ın API'si en fazla 1920 piksel genişlik kabul eder, Buffer daha büyük videoyu kendi kodlayıcısıyla Full HD'ye indirir ve sonuç daha kötü görünür. Bu yüzden gönderirken motor 4K ana dosyadan kendi 1080p kopyasını çıkarır (`Ad_1080p.mp4`, Lanczos ölçekleme, aynı kodlama, Instagram'ın 25 Mbps sınırının altında kalması için en fazla 24 Mbps; `src/Services/PlatformCopies.ts`) ve onu yükler. Ana dosya 4K kalır, başkasının kodlayıcısı hiçbir zaman ölçeklemez.
- Kodlama: H.264, CRF 12, `slow` ön ayarı, BT.709, AAC 192 kbps (`VIDEO_ENCODING`). Platformlar her videoyu yeniden kodlar; dosya onlara fazladan ayrıntıyla gider.
- Görseller PNG (kayıpsız) üretilir; JPEG istenirse kalite 100.
- **Sunucu dosyaya dokunmaz.** API videoyu olduğu gibi Blob'a yazar; Buffer'a o dosyanın bağlantısı verilir. Yerel dosya ile sunucudaki dosyanın birebir aynı olduğu 13 Ekim 2026'da özet (SHA-256) karşılaştırmasıyla doğrulandı.
- Sınırlar: Instagram 300 MB ve 25 Mbps altı, TikTok 1 GB, YouTube Shorts 10 GB; API'nin kabul ettiği en büyük video 300 MB.
