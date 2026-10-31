# Sosyal medya kimlik standardı

**Sahip, 29 Ekim 2026:** "Kapak fotoğrafları sosyal medyada bir kimliktir. Markaya bakınca rengi, logosu vb. sabit olsun. Videolarda her renk kullan tamam, ama kapak stabil olsun; son kapaklar da öyle. Google Play ve iOS kartları da stabil ve merkezi olsun."

Bir videonun içi istediği rengi kullanır. Aşağıdaki üç parça hiçbir gönderide değişmez ve tek yerden yönetilir: [`src/Configurations/SocialIdentity.ts`](../src/Configurations/SocialIdentity.ts). Değerlerin hepsi marka paletinden gelir ([`BrandColors.ts`](../src/Configurations/BrandColors.ts)).

## 1. Kapak

Kapak, profil ızgarasında görünen karedir: reels'in ilk karesi ve gönderinin (carousel ya da tek görsel) ilk görseli.

| Öğe | Kural |
| --- | --- |
| Zemin | Düz marka laciverti `#0B1C30`. Gradyan ya da ışık yok; turuncu ışık lacivertin üstünde kahverengiye döndü. |
| Logo | Beyaz, sol üstte, her kapakta aynı boyda (`BRAND.logo.sizes.cover`, 64 px) ve aynı yerde. Izgaranın gösterdiği alanın içindedir (`gridInsets`). |
| Etiket | Başlığın üstünde küçük bir hap: seri, özellik ya da ders. Marka adı yazılmaz, çünkü logo zaten söyler. Ders varsa noktası dersin rengindedir. Yanında sınav hapları (YKS, KPSS) durabilir. |
| Başlık | Beyaz, Manrope 800. **Punto sabittir:** her kapak biçiminin tek puntosu var. Dikey reels 124 px, 4:5 gönderi 96 px, yatay YouTube 136 px. Kamp serisi kendi tek puntosunu alır (aşağıda). |
| Yazı yeri | Başlık her kapakta aynı noktadan başlar, etiket olsa da olmasa da. Görsel varsa logonun altından, yoksa ortaya yakın sabit bir yerden. Etiket hep başlığın hemen üstündedir. |
| Satır | En çok 4 satır. Büyük punto daha az satır alır: dikeyde punto × satır ≤ 576, yatayda ≤ 600, 4:5'te ≤ 400. Satırlar tahminle değil, Manrope'un gerçek harf genişlikleriyle ölçülür ([`TextMeasure.ts`](../src/Images/Components/TextMeasure.ts)). Böylece başlık kesilmez, görsele ya da ders numarasına değmez. |
| Vurgu | Tek kelime ya da ifade, turuncu `#EA580C` üstünde beyaz. Kutu yalnız harflerin boyunda boyanır, üst satırın harf kuyruklarını kapatmaz. Kutu sütunun sol kenarıyla hizalıdır. |
| Görsel | Varsa başlığın altında: telefon, tarayıcı, kanıt kartı, modül kartları, dev rakam ya da arşiv fotoğrafı. Görsel yoksa başlık kapağın ortasına gelir, kapak boş görünmez. |
| Kaydır | Carousel kapağında başlığın altında küçük "Kaydır" hapı olabilir. |
| Yatay kapak (YouTube) | Aynı düzen: logo sol üstte, metin solda ve dikeyde ortalı, görsel sağda. |

- **Kod:** [`src/Images/Components/BrandCover.tsx`](../src/Images/Components/BrandCover.tsx).
  - Video kapağı [`VideoCover`](../src/Images/Templates/Thumbnails/VideoCover.tsx) bu bileşeni kullanır. Videonun teması kapağı değiştirmez.
  - Gönderilerin ilk görseli [`PromoDeck`](../src/Images/Templates/Campaigns/PromoDeck.tsx) içindeki `CoverSlide` ile çizilir. Görünüşler (looks) ikinci görselden başlar.
- **Tanıtım kapağı:** Şablonun iç adı ("Üç soru geri sayımı" gibi) kapakta etiket olmaz. Ders videosu ise türünü yazar ("Hızlı tekrar").
- **Kamp dersleri** (sahip, 29 Ekim 2026: "çok iyi olmuş, sakın bozma"): kamp kapağı ([`CampCover`](../src/Images/Templates/Thumbnails/CampCover.tsx)) bu düzeni kullanır. Hem reels hem YouTube kapağıdır.
  - **Zemin:** dersin kendi rengidir (ders videolarının rengi, `COURSE_LESSON_COLORS`): Türkçe pembe, Matematik mavi, Fizik yeşil, Tarih kahve. Kampın tanıtımı (bölüm 0) tek bir derse ait olmadığı için marka lacivertindedir.
  - **Ortak kalanlar:** logo yeri, yazı tipi, etiket ve sınav hapları.
  - **Kamp başına tek punto:** kampın bütün ders başlıklarına sığan en büyük punto bir kez seçilir (150, 136, 124, 112, 104…). Böylece bir kampın bütün kapaklarında başlık aynı boyda, etiket, başlık ve ders numarası aynı yerdedir. Ders numarası, kampın en uzun başlığının bitiş yerine göre konur. Başlıklar kesilmez.

    | Kamp | Dikey | Yatay |
    | --- | --- | --- |
    | Türkçe, Fizik, Coğrafya, Felsefe, Geometri | 150 | 150 |
    | Matematik, Kimya, AYT Edebiyat | 136 | 150 |
    | Biyoloji ("Sınıflandırılması" tek satıra ancak bu boyda sığar), Din Kültürü | 112 | 124 |
    | Tarih | 104 | 112 |
  - **Serinin kendi parçası** başlığın altındadır: "DERS · Konu anlatımı", dev ders numarası ("03 / 15") ve kampın ilerleme noktaları. Şu anki ders ders renginde beyaz, lacivertte turuncudur.
  - **Tanıtım kapağı:** "BÖLÜM · Başlamadan önce", "00" ve kamptaki her dersin renginde bir nokta.
  - **Komut:** `npm run cover -- --job <video işi>` videoyu render etmeden yalnız kapağı üretir. Daha önce render edilmiş bir videonun ilk karesinde eski kapak kalır; o ancak video yeniden render edilince değişir.

## 2. Bitiş kartı

Her reels aynı uygulama kartıyla biter. Tanıtım reels'leri, eğitim şablonları ve eski reklam şablonları bu kartı kullanır.

- **Kart:** açık zemin, turuncu logo, uygulama ana ekranını gösteren telefon, turuncu "Ücretsiz indir" düğmesi, iki mağaza rozeti ve "sinavika.com".
- **Seslendirme:** Doğa'nın sesiyle "Sınavika'yı ücretsiz indir." Satır kimliği `app-end-card` olduğu için kayıt her reels'te aynıdır. İş dosyasındaki `script` bu cümleyi değiştiremez.
- **Süre:** 3 saniye. Daha uzunu yalnız ses gerektirirse olur.
- **Ayarlar:** Kart hiçbir ayar almaz. Şablonların eskiden taşıdığı `closing.cta`, `closing.channels` ve `closing.narration` alanları kaldırıldı.
- **Seslendirme kuralı:** Videonun kendi seslendirmesi "Sınavika'yı indir" demez; bunu kart söyler.
- **Kapatma:** `outro.enabled: false` kartı kaldırır. Bayram ve anma videoları kartsız, yalnız logoyla biter ([`SocialPlan.md`](SocialPlan.md) §8).
- **Kendi kapanışıyla bitenler:**
  - Google Ads filmleri (`GoogleVideoAd`): sınavın kendi ekranı, üç biçim, iki dil. Mağaza rozetleri ve palet yine ortaktır.
  - 16:9 mağaza tanıtım filmi (`AppShowcase`).
  - Kamp ve ders videoları: sıradaki ders kartı.
- **Kod:** [`src/Scenes/AppEndScene.tsx`](../src/Scenes/AppEndScene.tsx) (`appEndScenes`, `outroScenes`).

## 3. Mağaza rozetleri

App Store ve Google Play nerede anılırsa aynı rozetle anılır:
- reels bitişi, Google Ads filmi, mağaza tanıtım filmi;
- kamp tanıtımının kapanışı, ders videosu kapanışı;
- tanıtım görselleri.

- **Görünüm:**
  - Marka antrasiti `#0F172A` zemin, beyaz mağaza işareti, küçük satır ve büyük mağaza adı.
  - Koyu zeminde ince bir çerçeve eklenir.
  - Sıra her zaman aynı: App Store, sonra Google Play.
- **Küçük satır:** Türkçede platformu söyler: "iPhone için", "Android için". İngilizcede mağazaların kendi sözleri kullanılır: "Download on the", "Get it on".
- **Kod:** [`src/Components/Brand/StoreBadge.tsx`](../src/Components/Brand/StoreBadge.tsx). Mağaza işaretleri yalnız buradan çizilir.
- **Resmî rozet:** Apple ve Google'ın resmî rozet görselleri indirilip lisansları uygun görülürse, değişiklik bu tek dosyada yapılır. İndirme sahibin onayıyla yapılır.

## 4. Gönderi içi punto

**Sahip, 30 Ekim 2026:** "Bu durum sosyal medya için hazırlanan içerikler ve kapaklar için de geçerli; orası için de önlem al, merkezi olarak kur, koru."

Kapaktan sonraki sayfalar, story'ler ve diğer sosyal görseller de aynı kurala uyar. Tek kaynak `SocialIdentity.ts` içindeki `POST_TYPE`'tır.

- **Her rolün tek puntosu var.** Örneğin:
  - carousel sayfa etiketi 28, metni 38, kapanış başlığı 74;
  - story hook'u 92, alt satırı 40, seçenekleri 40 (görselsiz 46);
  - hook görseli 122 (yatayda 112);
  - soru kartı 40.
- **Carousel'de sayfa başlıkları tek puntodur.** Gönderinin bütün sayfa başlıklarına en çok 3 satırda sığan en büyük punto (72, 64, 56) bir kez seçilir.
  - Eskiden 40 karakteri geçen başlık 60'a düşüyordu; aynı carousel'de 72 ve 60 karışıyordu ("Yedi modül" gönderisinde 1. ve 5. sayfa 60, diğerleri 72'ydi).
  - Profil ızgarasının üç karosu (GrowthLine, AppTrio) da başlıklarını tek puntoda yazar; o punto da artık karakter sayısıyla değil, ölçülerek seçilir.
- **Görseller sabit yerde.** Telefon, tarayıcı, kanıt kartı ve adım numarası, gönderinin en derin yazısının altından başlar. Böylece her sayfada aynı yükseklikte dururlar ve yazıya değmezler.
- **Ölçüm, tahmin değil.** Satırlar Manrope'un üç ağırlığının (500, 700, 800) gerçek harf genişlikleriyle ölçülür ([`TextMeasure.ts`](../src/Images/Components/TextMeasure.ts)). Puntoyu metnin karakter sayısına göre seçmek yasaktır; bir test bunu kaynak kodda arar.
- **Sığmayan yazı reddedilir.** Her sosyal şablonun bir `checkLayout` denetimi vardır: PromoDeck, PromoStory, VideoCover, CampCover, BoldQuestion, GrowthLine ve AppTrio.
  - `resolveImageJob`, render başlamadan önce bu denetimi çalıştırır. Sığmayan yazı küçültülmez ya da kesilmez; iş, neyin kısaltılacağını söyleyen bir hatayla durur. Örnek: "2. sayfa: başlık "…" 56 puntoda 4 satır tutuyor (en çok 3). Kısalt."
  - Kapakta tek satıra sığmayan etiket satırı da reddedilir; eskiden sessizce kesiliyordu.

## 5. Denetim

- `tests/Configurations/SocialIdentity.test.ts` şunları denetler:
  - kendi kapanışı olanlar dışındaki her şablonun ortak kartla bittiğini;
  - kartın cümlesinin ve süresinin sabit olduğunu;
  - kapak renklerinin paletten geldiğini;
  - mağaza işaretinin ve "App Store · Google Play" satırının şablonlara geri dönmediğini;
  - `Posts/` ve `samples/` altındaki her görsel işinin ve her video işinin kapağının yerleşim denetiminden geçtiğini (30 Ekim 2026: 46 görsel, 473 kapak);
  - puntonun metin uzunluğundan seçilmediğini.
- `npm run image`, profil ızgarası önizlemesini (`<ad>_izgara.png`) yazar. Kapaklar ızgarada yan yana kontrol edilir.
