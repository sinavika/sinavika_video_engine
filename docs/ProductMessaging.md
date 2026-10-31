# Ürün ve modül anlatımı: reklam, mağaza ve sosyal medya

Sınavika'nın ve modüllerinin reklamlarda nasıl anıldığını tanımlar ve içerik motorunda bunun nasıl merkezi olarak uygulandığını anlatır.

**Tarih:** 15 Ekim 2026
**Kod:** [`src/Configurations/ProductMessaging.ts`](../src/Configurations/ProductMessaging.ts) (adlar [`src/UIUX/ModuleIdentity.ts`](../src/UIUX/ModuleIdentity.ts) tablosundan gelir)
**Test:** [`tests/Configurations/ProductMessaging.test.ts`](../tests/Configurations/ProductMessaging.test.ts)
**İlgili:** [`BrandIdentity.md`](BrandIdentity.md) §5 (adlar), §13 (noktalama), §15.1 (modül renkleri), §18 (içerik motoru); [`UIUX/Modul-Kimligi.md`](UIUX/Modul-Kimligi.md); [`AdPrompt.md`](AdPrompt.md)

## 1. Rapor: motordaki mevcut kullanım

Motorun reklam, mağaza ve sosyal medya içeriği üreten bütün yerleri tarandı.

| Yer | Bulgu | Durum |
|---|---|---|
| `Templates/Advertisements/AppPromotion/AppPromotionSample.ts` | "Koçuna sor", "sınav koçun SinoAI" (insan koç yok, §5) | Düzeltildi: SinoAI'nin merkezi `invite` ve `tool` cümleleri |
| `Images/Templates/ProfileGrids/AppTrio.tsx` | "Koçuna sor."; "Analiz" bir modül adı gibi kullanılmış | Düzeltildi: "SinoAI'ye sor.", modül adları `moduleName()` |
| `Images/Templates/ProfileGrids/GrowthLine.tsx` | "koçuna sor"; "Analiz" modül listesinde | Düzeltildi |
| `Images/Templates/MobilePromotions/DualPhones.tsx` | Modül adları elle yazılmış; virgüllü başlık noktasız | Ad `moduleName()`, başlık "Çöz, öğren, takip et." |
| `Components/AppScreens` (mağaza ve videolardaki ekranlar) | Dersler alt yazısı "Mikro ders ve koç planı"; EN "Knowledge cards"; SinoAI açıklaması "Sınav koçuyla sohbet" | Düzeltildi: "Mikro ders ve çalışma planı", "Flashcards", "Yapay zekâ çalışma asistanınla sohbet" |
| `Store/StoreListing.ts` | "Compass" (önceki turda düzeltildi); SinoAI bir kez tanıtıldıktan sonra "yapay zekâ" diye genel anılmış; araç cümlesi ile kullanıcıya hitap aynı paragrafta; virgüllü başlıklar noktasız; "Kaydır" (akış kaldırıldı) | Düzeltildi (§4) |
| `Services/SocialHubClient.ts` | Gönderilen başlık ve açıklamada ad denetimi yoktu | Eklendi: kurala aykırı metin gönderilmez (§5) |

Uygulama kataloğundaki aynı hatalar (mobil "koç planı", EN "Knowledge cards") `BrandIdentity.md` §17'de mobil ekibine yazılı; motordaki çizimler artık doğru adı gösteriyor.

## 2. Adlar

- **Marka:** Sınavika (ı ile). Alan adı `sinavika.com` ve `#sinavika` küçük harf ve ı'sız kalır.
- **Yapay zekâ asistanı:** SinoAI. Bitişik yazılır, AI büyük harfle.
  - İlk geçişte bir kez tanıtılır: "Seni tanıyan yapay zekâ: SinoAI".
  - Sonra hep adıyla ve **cümlenin öznesi** olarak geçer: "SinoAI hedefini bilerek yanıtlar." Bir kez tanıtıldıktan sonra "yapay zekâ" diye genel anılmaz.
  - Seslendirmede "Sino Ey Ay" diye okunur. Okunuş merkezdedir ([`SpokenText.ts`](../src/Schemas/SpokenText.ts)), mesaj dosyasında değil.
- **Modüller:** Denemeler, Dersler, Testler, Ders Planı, Akıllı Özet, Bilgi Kartları, SinoAI.
  - EN karşılıkları: Practice exams, Lessons, Quizzes, Study Plan, Smart Summary, Flashcards.
  - Adlar her zaman `moduleName(key, lang)` ile alınır.
- **Kullanılmaz:**
  - "koç" ve "coach" (insan koç hizmeti yok).
  - "Sınavika AI", "Lens", "Lens AI".
  - "Compass" ve "Pusula" (bugün Ders Planı › İlerleme).
  - "Kelime Kartları", "Knowledge cards", "Ders Çalış".
  - Analiz ayrı bir modül olarak anılmaz.

## 3. Cümle kalıbı: araç ve kullanıcı ayrı

Her modül için üç parça vardır (`MODULE_MESSAGING`):

| Parça | Görevi | Örnek (SinoAI) |
|---|---|---|
| `claim` | Başlık ya da video yazısı, 3–5 kelime | Seni tanıyan yapay zekâ: SinoAI |
| `invite` | Kullanıcıya seslenir; kısa; noktalama ile biter | Takıldığın konuyu sor! |
| `tool` | Modül öznedir; ne yaptığını söyler; tek cümle | SinoAI hedefini, eksiklerini ve geçmiş çalışmalarını bilerek yanıtlar. |

- `invite` ve `tool` aynı cümlede birleşmez. Görselde `tool` kendi zemininde, modül ikonuyla ayrı bir kutuda durur; bu hem anlam karışıklığını önler hem dikkat çeker.
- Bir görselde en fazla bir `tool` cümlesi olur.
- Ünlem en fazla bir tane ve yalnız `invite`'ta kullanılır (§13).

## 4. Noktalama

- Virgülle sıralanan emir başlıkları noktayla biter: "Fotoğrafını çek, çözümünü öğren." · "Tekrar et, aklında tut."
- Ad tamlaması olan başlıklar noktasız kalır: "Sınav hazırlığın tek yerde" · "Kendi notlarından sana özel içerik".
- Alt metin (`invite`) ve `tool` her zaman noktalama işaretiyle biter.
- Testler bu üç kuralı mağaza slaytlarında denetler.

## 5. Merkezi uygulama

| Nerede | Nasıl |
|---|---|
| Mağaza görselleri (`Store/StoreListing.ts`) | Slaytların `subline` ve `tool` alanları `MODULE_MESSAGING`'den gelir. `tool` `StoreScreenshot` içinde modül ikonlu kutuda çizilir |
| Reklam videoları (`Templates/Advertisements`) | Örnek içerikler `moduleCopy()` kullanır. Yeni reklam yazılırken adlar ve cümleler buradan alınır (`AdPrompt.md`) |
| Görsel şablonlar (`Images/Templates`) | Modül etiketleri `moduleName()` |
| Sosyal medya gönderisi (`Services/SocialHubClient.ts`) | `submit` başlık, açıklama ve platform açıklamalarını `assertProductCopy` ile denetler. Hata varsa gönderi oluşmaz ve neden yazılır; uyarılar konsola yazılır |
| Testler | Bütün mağaza metinleri, reklam örnekleri ve görsel şablon örnek içerikleri her test çalışmasında taranır |

**Hata ile uyarı farkı:** "koç", "Sınavika AI", "Kelime Kartları", "Ders Çalış", yanlış marka yazımı **hatadır**. "Lens", "Compass", "Pusula" ise **uyarıdır**, çünkü ders içeriğinde gerçek anlamlarıyla geçebilirler (optikte lens, coğrafyada pusula). "Koç Üniversitesi" hata sayılmaz.

## 6. Mağaza görselleri revizyonu (15 Ekim)

Kreatör ve reklamcı Tuğçe Erkısasu'nun önerileri:

| Öneri | Karar | Uygulama |
|---|---|---|
| Mockup'lar kenarlara yakın; bazı cihazlarda kesilebilir | Uygulandı | Bütün formatlarda yatay güvenli alan %6: cihazlar ve rozetler kenara yaklaşmaz. Telefonların alttan taşması bilinçli tasarımdır, korundu |
| Virgüllü başlıkların sonunda noktalama yok | Uygulandı | §4 |
| "Takıldığın konuyu sor!" ve ardından SinoAI özne olarak | Uygulandı | §3, SinoAI slaytı |
| SinoAI bir kez tanıtılınca hep adıyla anılsın | Uygulandı | §2; "Kendi notların" slaytında "yapay zekâ" yerine SinoAI |
| Aracın ne yaptığını söyleyen cümle tek olsun ve zeminle ayrılsın | Uygulandı | §3; `tool` kutusu |
| Compass | Zaten kaldırılmıştı | Ders Planı |

Ayrıca kart slaytının başlığı "Kaydır, öğren, tekrar et" → "Tekrar et, aklında tut." oldu, çünkü akış (kaydırma) özelliği kaldırıldı.

## 7. Yeni içerik yazarken

1. Modül adını ve cümleleri `moduleCopy(key, lang)` ile al.
2. Kullanıcıya seslenen cümle ile aracın cümlesini ayır.
3. Virgüllü emir başlığını noktayla bitir.
4. Gönderiden önce `checkProductCopy(metin)` ile denetle. `submit` bunu zaten yapar.
