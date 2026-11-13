# Sosyal medya kimlik ve görsel standardı

Instagram, TikTok ve YouTube'a giden her kapak, gönderi, karusel, reels ve story bu kurallara uyar. Tek görsel kural belgesi budur. Yayımlanmış gönderiler değiştirilmez; kurallar şablonlara ve altyapıya uygulanır.

- **Kaynaklar:** sahibin kapak kararı (29 Ekim 2026), sosyal içerik puntosu kararı (30 Ekim 2026), Tuğçe'nin profil incelemesi (26 Ekim 2026).
- **Kod:** sabit parçalar tek yerden yönetilir: [`src/Configurations/SocialIdentity.ts`](../../src/Configurations/SocialIdentity.ts). Değerlerin hepsi marka paletinden gelir ([`BrandColors.ts`](../../src/Configurations/BrandColors.ts)).
- **İlgili belgeler:** adlar ve metin kuralları [`ProductMessaging.md`](../Brand/ProductMessaging.md) ve [`BrandIdentity.md`](../Brand/BrandIdentity.md); hook, kurgu ve yayın öncesi kontrol listesi [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md).

**Sahip, 29 Ekim 2026:** "Kapak fotoğrafları sosyal medyada bir kimliktir. Markaya bakınca rengi, logosu vb. sabit olsun. Videolarda her renk kullan tamam, ama kapak stabil olsun; son kapaklar da öyle. Google Play ve iOS kartları da stabil ve merkezi olsun."

Bir videonun ve gönderinin iç sayfaları istediği rengi kullanır. Kapak, bitiş kartı, mağaza rozetleri ve punto hiçbir gönderide değişmez.

## 1. Kapak

Kapak, profil ızgarasında görünen karedir: reels'in ilk karesi ve gönderinin (karusel ya da tek görsel) ilk görseli.

| Öğe | Kural |
| --- | --- |
| Zemin | Düz marka laciverti `#0B1C30`. Gradyan ya da ışık yok; turuncu ışık lacivertin üstünde kahverengiye döndü. |
| Logo | Beyaz, sol üstte, her kapakta aynı boyda (`BRAND.logo.sizes.cover`, 64 px) ve aynı yerde. Izgaranın gösterdiği alanın içindedir (§5). |
| Etiket | Başlığın üstünde küçük bir hap: seri, özellik ya da ders. Marka adı yazılmaz, çünkü logo zaten söyler. Ders varsa noktası dersin rengindedir. Yanında sınav hapları (YKS, KPSS) durabilir. Tek satıra sığmayan etiket reddedilir. |
| Başlık | Beyaz, Manrope 800. **Punto sabittir:** dikey reels 124 px, 4:5 gönderi 96 px, yatay YouTube 136 px (`COVER_STANDARD.titleSizes`). Kamp serisi kendi tek puntosunu alır (aşağıda). |
| Yazı yeri | Başlık her kapakta aynı noktadan başlar, etiket olsa da olmasa da. Görsel varsa logonun altından, yoksa ortaya yakın sabit bir yerden. Etiket hep başlığın hemen üstündedir. |
| Satır | En çok 4 satır. Büyük punto daha az satır alır: punto × satır dikeyde ≤ 576, yatayda ≤ 600, 4:5'te ≤ 400 (`COVER_STANDARD.titleBlock`). Satırlar Manrope'un gerçek harf genişlikleriyle ölçülür ([`TextMeasure.ts`](../../src/Components/Typography/TextMeasure.ts)); başlık kesilmez, görsele ya da ders numarasına değmez. |
| Vurgu | Tek kelime ya da ifade, turuncu `#EA580C` üstünde beyaz. Kutu yalnız harflerin boyunda boyanır, üst satırın harf kuyruklarını kapatmaz ve sütunun sol kenarıyla hizalıdır. Ne vurgulanacağı §6'da. |
| Görsel | Varsa başlığın altında: telefon, tarayıcı, kanıt kartı, modül kartları, dev rakam ya da arşiv fotoğrafı. Görsel yoksa başlık kapağın ortasına gelir, kapak boş görünmez. |
| Kaydır | Karusel kapağında başlığın altında küçük "Kaydır" hapı olabilir. |
| Yatay kapak (YouTube) | Aynı düzen: logo sol üstte, metin solda ve dikeyde ortalı, görsel sağda. |

- **Kod:** [`BrandCover.tsx`](../../src/Images/Components/BrandCover.tsx).
  - Video kapağı [`VideoCover`](../../src/Images/Templates/Thumbnails/VideoCover.tsx) bu bileşeni kullanır. Videonun teması kapağı değiştirmez.
  - Gönderilerin ilk görseli [`PromoDeck`](../../src/Images/Templates/Campaigns/PromoDeck.tsx) içindeki `CoverSlide` ile çizilir. Görünüşler (looks) ikinci görselden başlar.
- **Tanıtım kapağı:** şablonun iç adı ("Üç soru geri sayımı" gibi) kapakta etiket olmaz. Ders videosu türünü yazar ("Hızlı tekrar").
- **Kamp dersleri** (sahip, 29 Ekim 2026: "çok iyi olmuş, sakın bozma"): kamp kapağı ([`CampCover`](../../src/Images/Templates/Thumbnails/CampCover.tsx)) bu düzeni kullanır. Hem reels hem YouTube kapağıdır.
  - **Zemin:** dersin rengi (`COURSE_LESSON_COLORS`): Türkçe pembe, Matematik mavi, Fizik yeşil, Tarih kahve. Kampın tanıtımı (Bölüm 0) tek bir derse ait olmadığı için marka lacivertindedir.
  - **Ortak kalanlar:** logo yeri, yazı tipi, etiket ve sınav hapları.
  - **Kamp başına tek punto:** kampın bütün ders başlıklarına sığan en büyük punto bir kez seçilir (`COVER_STANDARD.seriesTitleSteps`: 150, 136, 124, 112, 104, 96, 88). Böylece bir kampın bütün kapaklarında başlık aynı boyda; etiket, başlık ve ders numarası aynı yerdedir. Ders numarası, kampın en uzun başlığının bitiş yerine göre konur.

    | Kamp | Dikey | Yatay |
    | --- | --- | --- |
    | Türkçe, Fizik, Coğrafya, Felsefe, Geometri | 150 | 150 |
    | Matematik, Kimya, AYT Edebiyat | 136 | 150 |
    | Biyoloji ("Sınıflandırılması" tek satıra ancak bu boyda sığar), Din Kültürü | 112 | 124 |
    | Tarih | 104 | 112 |
  - **Serinin kendi parçası** başlığın altındadır: "DERS · Konu anlatımı", dev ders numarası ("03 / 15") ve kampın ilerleme noktaları. Şu anki ders, ders renginde beyaz, lacivertte turuncudur.
  - **Tanıtım kapağı:** "BÖLÜM · Başlamadan önce", "00" ve kamptaki her dersin renginde bir nokta.
  - **Komut:** `npm run cover -- --job <video işi>` videoyu render etmeden yalnız kapağı üretir. Daha önce render edilmiş bir videonun ilk karesinde eski kapak kalır; o ancak video yeniden render edilince değişir.

## 2. Bitiş kartı

Her reels aynı uygulama kartıyla biter: tanıtım reels'leri, eğitim şablonları ve eski reklam şablonları.

- **Kart:** açık zemin, turuncu logo, uygulama ana ekranını gösteren telefon, turuncu "Ücretsiz indir" düğmesi, iki mağaza rozeti ve "sinavika.com".
- **Seslendirme:** Doğa'nın sesiyle "Sınavika'yı ücretsiz indir." Satır kimliği `app-end-card` olduğu için kayıt her reels'te aynıdır. İş dosyasındaki `script` bu cümleyi değiştiremez. Videonun kendi seslendirmesi "Sınavika'yı indir" demez; bunu kart söyler.
- **Süre:** 3 saniye (`APP_END_CARD.seconds`). Daha uzunu yalnız ses gerektirirse olur.
- **Ayarlar:** kart hiçbir ayar almaz. `closing.cta`, `closing.channels` ve `closing.narration` alanları kaldırıldı.
- **Kapatma:** `outro.enabled: false` kartı kaldırır. Bayram ve anma videoları kartsız, yalnız logoyla biter ([`SocialPlan.md`](SocialPlan.md) §8).
- **Kendi kapanışıyla bitenler:**
  - Google Ads filmleri (`GoogleVideoAd`): sınavın kendi ekranı, üç biçim, iki dil. Mağaza rozetleri ve palet yine ortaktır.
  - 16:9 mağaza tanıtım filmi (`AppShowcase`).
  - Kamp ve ders videoları: sıradaki ders kartı. sinavika.yks kamp reels'i (`CampShort`) YouTube kartıyla biter; o hesaplarda uygulama reklamı yoktur.
- **Kod:** [`src/Scenes/AppEndScene.tsx`](../../src/Scenes/AppEndScene.tsx) (`appEndScenes`, `outroScenes`).

## 3. Mağaza rozetleri

App Store ve Google Play nerede anılırsa aynı rozetle anılır: reels bitişi, Google Ads filmi, mağaza tanıtım filmi, kamp tanıtımının ve ders videosunun kapanışı, tanıtım görselleri.

- **Görünüm:** marka antrasiti `#0F172A` zemin, beyaz mağaza işareti, küçük satır ve büyük mağaza adı. Koyu zeminde ince bir çerçeve eklenir. Sıra her zaman aynı: App Store, sonra Google Play.
- **Küçük satır:** Türkçede platformu söyler: "iPhone için", "Android için". İngilizcede mağazaların kendi sözleri kullanılır: "Download on the", "Get it on".
- **Kod:** [`src/Components/Brand/StoreBadge.tsx`](../../src/Components/Brand/StoreBadge.tsx). Mağaza işaretleri yalnız buradan çizilir.
- **Resmî rozet:** Apple ve Google'ın resmî rozet görselleri indirilip lisansları uygun görülürse değişiklik bu tek dosyada yapılır. İndirme sahibin onayıyla yapılır.

## 4. Gönderi içi punto

**Sahip, 30 Ekim 2026:** "Bu durum sosyal medya için hazırlanan içerikler ve kapaklar için de geçerli; orası için de önlem al, merkezi olarak kur, koru."

Kapaktan sonraki sayfalar, story'ler ve diğer sosyal görseller de aynı kurala uyar. Tek kaynak `SocialIdentity.ts` içindeki `POST_TYPE`'tır.

- **Her rolün tek puntosu var.** Örneğin:
  - karusel sayfa etiketi 28, metni 38, kapanış başlığı 74;
  - story hook'u 92, alt satırı 40, seçenekleri 40 (görselsiz 46);
  - hook görseli 122 (yatayda 112);
  - soru kartı 40.
- **Karuselde sayfa başlıkları tek puntodur.** Gönderinin bütün sayfa başlıklarına en çok 3 satırda sığan en büyük punto (72, 64, 56) bir kez seçilir. Profil ızgarasının üç karosu (GrowthLine, AppTrio) da başlıklarını tek puntoda yazar (`AppTrio.headlineSize`).
- **Görseller sabit yerde.** Telefon, tarayıcı, kanıt kartı ve adım numarası, gönderinin en derin yazısının altından başlar. Böylece her sayfada aynı yükseklikte dururlar ve yazıya değmezler.
- **Ölçüm, tahmin değil.** Satırlar Manrope'un üç ağırlığının (500, 700, 800) gerçek harf genişlikleriyle ölçülür. Puntoyu metnin karakter sayısına göre seçmek yasaktır; bir test bunu kaynak kodda arar.
- **Sığmayan yazı reddedilir.** Her sosyal şablonun bir `checkLayout` denetimi vardır: PromoDeck, PromoStory, VideoCover, CampCover, BoldQuestion, GrowthLine ve AppTrio. `resolveImageJob`, render başlamadan önce bu denetimi çalıştırır. Sığmayan yazı küçültülmez ya da kesilmez; iş, neyin kısaltılacağını söyleyen bir hatayla durur. Örnek: "2. sayfa: başlık "…" 56 puntoda 4 satır tutuyor (en çok 3). Kısalt."
- **Büyük rakamlar:** adım numaraları (1, 2, 3…) sabit genişlikte bir kutuda, ortalı ve tablo rakamlarıyla yazılır. "1" gibi dar rakamlar biraz büyütülür (`PromoDeck.StepNumber`).

## 5. Profil ızgarası

Instagram profili her gönderiyi ortadan kesilmiş 3:4 bir kare olarak gösterir:
- **4:5 gönderi:** iki yanından yaklaşık 34 px kaybeder.
- **9:16 reels:** üstünden ve altından 240 px kaybeder.
- **Sağ üst köşe:** Instagram karusel, reels ya da sabitleme ikonunu bu köşeye koyar.

Bu yüzden:
1. **Kenar payı:** yazı ve logo, ızgaranın gösterdiği alanın içinde ve kenardan en az 64 px içeride durur. Kod: `gridInsets` ([`ProfileGridLayout.ts`](../../src/Images/Templates/ProfileGrids/ProfileGridLayout.ts)). `ImageFrame` ve `PromoDeck` bunu varsayılan olarak kullanır.
2. **Sağ üst köşe:** başlığın ilk satırları bu köşeden `GRID_ICON_ROOM` (110 px) kadar önce biter.
3. **Kontrol:** her gönderi profil ızgarasındaki kırpılmış hâliyle de kontrol edilir. `npm run image`, dikey ve kare PNG'lerin yanına `<ad>_izgara.png` dosyasını yazar: gönderiler 3:4 kırpılmış, üçerli dizilmiş ve ikon köşesi gölgeli görünür ([`GridPreview.ts`](../../src/Images/Renderers/GridPreview.ts); kapatmak için `--no-grid`).

## 6. Vurgu, boş alan ve metin

**Vurgu**
- Başlıkta vurgulanan kelime, gönderinin anlattığı şeydir: özellik, fiil ya da asıl fikir ("yalan", "altı kelime", "çöz"). Son kelime otomatik vurgulanmaz.
  - Reels kapağında `cover.emphasis`, kampanya gönderisinde slaydın `emphasis` alanıyla seçilir.
  - Yalnız ders videolarının kapağında, seçim yapılmamışsa son kelime vurgulanır; o vurgu ders rengini taşır.
- Vurgulanan kelimeden hemen sonra gelen nokta, ünlem ya da soru işareti vurgunun içinde kalır ("çöz.").
- Vurgu rengi zeminden ayrışmalı. Turuncu zeminde turuncu vurgu kaybolur; o durumda vurgu lacivert zemine beyaz yazıyla yapılır (`VideoCover`).

**Boş alan:** tek renkli büyük bir alan ürün göstermeden bırakılmaz; leke gibi okunur. Telefon maketi büyütülür ve alanı doldurur, kanıt kartı onunla üst üste biner (`PromoDeck`, `proof` görünümü).

**Metin**
- **Uygulamadaki ad:** özellik adı uygulamada yazdığı gibi kullanılır. SinoAI'nin ürettikleri **Kütüphane**'de durur; cümle içinde küçük harfle: "Ürettiği her şey kütüphanende durur." "Kitaplık" denmez; ürün metni denetimi bunu hata sayar.
- **Tam cümle:** başlık, fiili olan bir cümledir. "Türkiye geneli ya da kendi denemen." eksik kalıyordu; doğrusu: "Türkiye geneli denemeyi ya da sana özel denemeni çöz."
- **Yalnız gerçek özellik:** uygulamada olmayan bir özellik yazılmaz. Örneğin öğrenci deneme yüklemez; SinoAI ona özel deneme hazırlar.
- **Ekler:** SinoAI'nin ekleri `BrandIdentity.md`'deki gibidir: SinoAI'ye, SinoAI'nin. Uzun başlık kenara yaklaşırsa ekli kelime kesik gibi görünür; çözümü §5'teki kenar payıdır.
- **Yasak kelimeler:** "Koç" ve Türkçe "quiz" hiçbir görselde, açıklamada ya da seslendirmede geçmez. Ürün metni denetimi gönderiyi durdurur.
- **Test sayısı:** Testler'de bir seviye 20 sorudur ve seviyeler Kolay, Orta, Zor'dur. "10 soru" yalnız SinoAI'nin ürettiği, sayısı öğrencinin seçtiği testler için yazılır.

## 7. Video kareleri ve karusel

- **Hızlı belirme:** ekrandaki yazı ve etiketler kelimeyle birlikte en geç 0,1 saniyede tam görünür olur; istenirse kısa bir büyüme hareketi kullanılır. Durdurulan ya da ekran görüntüsü alınan her kare okunur olmalı (`KineticType`).
- **Kontrol:** video kontrol edilirken yalnız hareket değil, rastgele birkaç durdurulmuş kare de incelenir.
- **İlk kare:** videonun ilk karesi kapaktır ve hook'u taşır; profil ızgarasında da tek başına okunur. Reels'te kapak karesi yalnız 0,2 saniye kalır, ardından hareketli bir olay gelir ([`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §11).
- **Karusel kapağı:** 1. sayfa boş kalmaz; hook ve ürün ya da konu görseli alanı doldurur. İkinci derecede çağrılar ("arkadaşını etiketle") daha küçük yazılır. Sayfa sayacı ve ilerleme çubuğu kullanılmaz. Karuselin sayfa sayfa yapısı [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) §5'tedir.

## 8. Denetim

- `tests/Configurations/SocialIdentity.test.ts` şunları denetler:
  - kendi kapanışı olanlar dışındaki her şablonun ortak kartla bittiğini;
  - kartın cümlesinin ve süresinin sabit olduğunu;
  - kapak renklerinin paletten geldiğini;
  - mağaza işaretinin ve "App Store · Google Play" satırının şablonlara geri dönmediğini;
  - `Posts/` ve `samples/` altındaki her görsel işinin ve her video işinin kapağının yerleşim denetiminden geçtiğini;
  - puntonun metin uzunluğundan seçilmediğini.
- `npm run image` profil ızgarası önizlemesini (`<ad>_izgara.png`) yazar; kapaklar ızgarada yan yana kontrol edilir.
