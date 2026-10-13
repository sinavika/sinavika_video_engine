# Sınavika Marka Kimliği

İçerik hazırlanırken her seferinde yeniden anlatılması gerekmeyen her şey: Sınavika kimdir, ne sunar, nasıl görünür, nasıl konuşur, neyi asla yapmaz. Bir bilgi burada yoksa uydurulmaz; kaynağından doğrulanır ya da sorulur.

Kaynaklar: [sinavika.com](https://www.sinavika.com), mobil uygulamanın kodu (`sinavika/sinavika_mobile_reactnative`), kurumsal renk paleti ve onaylanmış yayın planı. Son doğrulama: 13 Ekim 2026.

## 1. Sınavika nedir

- Sınava hazırlık platformu: web ve mobil (iOS, Android).
- Tek cümle: **"Deneme, ders çalışma, analiz ve rehberlik — sınav hazırlığını tek platformda."**
- Kısa söz: **"Ölç, öğren, geliş."**
- Temel fikir: dağınık araçlar yerine tek yer. Öğrenci ölçer (deneme), öğrenir (ders, test, kart), gelişimini görür (analiz, plan).
- Hedef sınavlar: **YKS (TYT, AYT, YDT)** ve **KPSS (Lisans, Ön Lisans, Ortaöğretim)**. Sitede ÖABT, AGS, SAT, GRE kategori ve blog sayfaları da var. LGS için içerik üretilmez; sitede yer almıyor.
- Hedef kitle: bu sınavlara hazırlanan öğrenciler ve adaylar. LinkedIn'de: eğitim sektörü, veliler, yatırımcılar, iş ortakları.

## 2. Ürün ve modüller

Modül adları yazıldığı gibi kullanılır; çevrilmez, kısaltılmaz.

| Modül (mobil uygulamadaki ad) | Ne yapar (uygulamanın kendi cümlesi) | Web'deki ad |
| --- | --- | --- |
| **Denemeler** | Deneme çöz, sonucu gör | Denemeler |
| **Analiz** (İstatistik ve özet) | Her denemeden sonra net görüş: güçlü ve eksik alanların bir arada | Analiz |
| **Dersler** | Mikro ders, flashcard ve koç planı | Ders Çalış |
| **Testler** | Adım adım konu testleri | — |
| **Ders Planı** | Haftalık programın ve görevlerin | Ders Planı |
| **Akıllı Özet** | Soru görselinden analiz: çözüm, kazanım ve hata analizi | Lens |
| **Bilgi Kartları** | Kartlarla öğrenmeye devam et | Kelime Kartları |
| **SinoAI** | Sınav koçunla sohbet et: soru çöz, özet çıkar, çalışma üret | Sınavika AI |

- Mobil içerikte mobil adlar, web içeriğinde web adları kullanılır. Aynı içerikte ikisi karıştırılmaz.
- Uygulama ana ekranının adı **Modüller**'dir.
- Seslendirmede "SinoAI" yerine "yapay zekâ sınav koçu" denebilir; yazıda ad her zaman **SinoAI**'dir.

## 3. Hesaplar ve bağlantılar

| Kanal | Hesap |
| --- | --- |
| Web | sinavika.com |
| Instagram | `sinavika.tr` |
| TikTok | `sinavikatr` |
| YouTube | `Sinavika` |
| LinkedIn | henüz Buffer'a bağlı değil |
| Mağazalar | App Store ve Google Play |

Marka hashtag'i: `#sinavika` (her gönderide).

## 4. Görsel kimlik

### Renkler

Tek kaynak: [`src/Configurations/BrandColors.ts`](../src/Configurations/BrandColors.ts).

| Rol | Renk | Kullanım |
| --- | --- | --- |
| Marka turuncusu | `#EA580C` | Ana çağrı, aktif durum, vurgu. Üstündeki yazı **beyaz**. |
| Turuncu (kap) | `#F97316` | Buton ve aktif alan, gradyan ucu |
| Açık turuncu | `#FFEDD5` | Hafif turuncu yüzey, ikon zemini |
| Antrasit | `#0F172A` | Koyu marka yüzeyi |
| Ana metin | `#0B1C30` | Başlık ve metin |
| Açık zemin / kart | `#FAFAFA` / `#FFFFFF` | Arka plan ve kartlar |
| Koyu zemin / yüzey | `#0F1115` / `#1E2026` | Koyu tema |
| Koyu temada turuncu | `#FB923C` | Koyu zeminde vurgu |

- Yeşil, sarı, kırmızı, mavi **yalnız durum** bildirir (doğru, uyarı, yanlış, bilgi).
- Mor, mobildeki çözüm inceleme deneyimine ayrılmıştır; içerikte kullanılmaz.
- Ders renkleri beş ailedir ve yalnız küçük vurguları değiştirir: [`docs/SocialPlan.md`](SocialPlan.md) §4.

### Temalar

Sosyal medya içeriklerinin tamamı `SinavikaLight` ya da `SinavikaDark` temasıyla üretilir. Hangi içerik türünün hangi temayı kullandığı sabittir (bkz. [`docs/SocialPlan.md`](SocialPlan.md)); akışta açık–koyu ritmi böyle korunur.

### Yazı tipi

Tek kaynak: [`src/Configurations/BrandTypography.ts`](../src/Configurations/BrandTypography.ts). Marka temaları yazı tipini ve kalınlıkları, tanıtım şablonları yazı boyutlarını buradan alır; başka hiçbir yerde marka yazı tipi, kalınlığı ya da tanıtım yazı boyutu yazılmaz.

| Rol | Yazı tipi | Kalınlık |
| --- | --- | --- |
| Başlık, hook, büyük sayılar | Plus Jakarta Sans | 800 |
| Hareketli dev yazı (tanıtım) | Plus Jakarta Sans | 900 |
| Metin, etiket, uygulama ekranları | Inter | 450; vurgu ve düğmelerde 700 |
| Kod ve tablo rakamları | JetBrains Mono | — |

Tanıtım videolarında yazı boyutları (1080 piksel kısa kenara göre): giriş 112, ürün üstü başlık 92, kapanış sözü 84, düğme ve mağaza adı 36. Küçük etiketler büyük harfle yazılır; başlıklarda harf aralığı −0,02 em.

- Bunlar Ekim 2026'da onaylanan tasarımların yazı tipleri ve boyutlarıdır ve sabittir. Bu dosyadaki bir değişiklik o andan sonraki tüm içeriği değiştirir; video bazında değil, marka kararı olarak yapılır. Değerler bir testle de kilitlidir.
- Web ve mobil uygulamanın yazı tipi **Manrope**'tur (başlıklar 800, düğmeler 600). İçerik motoru bilerek kendi yazı tiplerini kullanır; Manrope'a geçiş ayrı bir karardır.

### Logo

- Dosya: `public/Brand/SinavikaLogo.png` (ikon + yazı). Tek renk çizilir: açık zeminde koyu, koyu zeminde beyaz.
- En küçük yükseklik ve çevresindeki boşluk [`src/Configurations/Brand.ts`](../src/Configurations/Brand.ts) içindedir.
- Logo eğilmez, gölgelenmez, renklendirilmez, üstüne yazı konmaz.

### Biçim dili

- Geniş köşe yuvarlaklıkları (kartlarda 16, düğmelerde tam yuvarlak), ince gri kenarlıklar, bol boşluk.
- Açık turuncu daire içinde çizgi ikonlar.
- Uygulama ekranı gerekiyorsa çizim [`src/Components/AppScreens`](../src/Components/AppScreens) içinden, adıyla alınır; on bir ekran uygulamanın kodundan, açık ve koyu temada yeniden çizilmiştir. Katalog ve kullanım: [`docs/AppScreens.md`](AppScreens.md). Hayalî ekran, başka uygulamanın ekranı ya da karikatür çizim kullanılmaz.

## 5. Ses ve dil

- **Türkçe**, "sen" diliyle; öğrenciyle aynı hizadan konuşan bir çalışma arkadaşı gibi. Tepeden bakmaz, korkutmaz, abartmaz.
- Kısa, tam cümleler. Telefon hoparlöründen her kelime anlaşılmalı.
- Emir kipinde, eyleme çağıran fiiller: çöz, gör, öğren, takip et, sor.
- Emoji yok ya da çok az; ünlem tek tük.
- Seslendirme: ElevenLabs, kadın sesi. Eğitimde açıklayıcı ve sakin, tanıtımda parlak ve ikna edici. Profiller: [`src/Configurations/Voices.ts`](../src/Configurations/Voices.ts).
- LinkedIn'de dil profesyoneldir: "siz" ya da kişisiz anlatım, ürün ve girişim odaklı.

Örnekler:

| Yaz | Yazma |
| --- | --- |
| Deneme çöz, analizini gör. | Türkiye'nin en iyi deneme platformu! |
| Takıldığın sorunun fotoğrafını çek. | Yapay zekâ her soruyu saniyeler içinde çözer!!! |
| Ölç, öğren, geliş. | %100 başarı garantisi |

## 6. Doğruluk kuralları

- **Yalnız gerçek özellikler.** Bir özellik sitede ya da uygulamada görülmüyorsa yazılmaz.
- **Sayı, fiyat, kampanya, kullanıcı adedi, başarı oranı, sıralama** yalnız doğrulanmış kaynakla yazılır. Elde yoksa hiç yazılmaz.
- "En iyi", "tek", "garanti", "kesin" gibi kanıtlanamayan iddialar kullanılmaz.
- Resmî sınav tarihleri ve kuralları yalnız resmî kaynaktan (ÖSYM) alınır; tahmin yazılmaz.
- Eğitim içeriği yalnız verilen soru, konu ve hook kaynaklarından üretilir; soru ve cevabın doğruluğu teslimden önce kontrol edilir.
- Uygulama ekranlarındaki örnek sayılar (net, süre) ürün gösterimidir; başarı iddiası gibi sunulmaz.
- Rakip adı anılmaz, karşılaştırma yapılmaz.
- Mağaza logoları çizilmez; adları düz yazıyla geçer.
- Görselde "cevap açıklamada" deniyorsa cevap açıklamada vardır.

## 7. Yayın düzeni

Ayrıntı [`docs/SocialPlan.md`](SocialPlan.md) içindedir; özet:

- Instagram ve TikTok: her gün bir ana içerik, aynı takvim. Instagram'da her gün bir Story.
- YouTube: yalnız Salı, Cuma, Pazar videoları Shorts olarak.
- LinkedIn: Pazartesi, Çarşamba, Cuma; yalnız tanıtım, marka ve hook. Ders ve soru paylaşılmaz.
- Saatler Buffer'daki hesap saatlerinden gelir; her platform kendi saatinde yayınlar.
- Her içerik admin onayından geçer; onaysız hiçbir şey yayınlanmaz.
- Platformlara "yapay zekâ ile üretildi" işareti gönderilmez; dosyalarda üretim aracına dair etiket bırakılmaz.

## 8. Tasarım kuralları (kısa)

- Aynı içerik türü her zaman aynı şablonla üretilir.
- Kaydırmalı gönderide sayfa sayacı, ilerleme çubuğu ve kaydırma oku olmaz; tekli görselde kaydırma çağrısı olmaz.
- Her videonun kapağı vardır ve videonun açılış karesidir.
- Tanıtım videoları: koyu sahne, yavaşça kayan turuncu ışıma, dev hareketli yazı, uygulama ekranlarını gezen tek telefon, logolu kapanış. Kurallar: [`docs/AdPrompt.md`](AdPrompt.md).

## 9. Açık kararlar

Bunlar netleşene kadar içerikte kullanılmaz:

- Fiyatlar, paketler, ücretsiz kullanımın kapsamı (sitedeki çağrı "Ücretsiz başla"dır; kapsamı doğrulanmadı).
- Kullanıcı sayısı, başarı hikâyeleri, basın ve ödüller.
- Manrope'a geçiş.
- Video sonundaki ortak kapanış kartında yazan söz (`Brand.ts` içindeki `tagline`) ile sitedeki resmî söz farklı; hangisinin kalacağı.
