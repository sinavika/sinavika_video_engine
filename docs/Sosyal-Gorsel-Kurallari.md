# Sosyal medya görsel kuralları

Instagram, TikTok ve YouTube için **bundan sonra üretilecek** gönderi, karusel, reels, reels kapağı ve profil üçlüleri bu kurallara uyar. Yayımlanmış gönderiler değiştirilmez; kurallar şablonlara ve altyapıya uygulanır. Kaynak: Tuğçe'nin profil incelemesi (26 Ekim 2026). Adlar ve metin kuralları için [`ProductMessaging.md`](ProductMessaging.md) ve [`BrandIdentity.md`](BrandIdentity.md) geçerlidir. Hook, kurgu, kaydırmalı yapı ve yayın öncesi kontrol listesi [`SocialCreativePlaybook.md`](SocialCreativePlaybook.md) içindedir.

## 0. Kapak, bitiş kartı ve mağaza rozetleri

Kapak (reels'in ilk karesi, gönderinin ilk görseli), reels'in bitiş kartı ve App Store / Google Play rozetleri her gönderide aynıdır. Kapakta ve gönderinin bütün sayfalarında punto ve yazı yeri sabittir, satırlar ölçülür, sığmayan yazı render'dan önce reddedilir; hepsi tek yerden yönetilir: [`Sosyal-Kimlik-Standardi.md`](Sosyal-Kimlik-Standardi.md) §1 ve §4. Videoların ve iç sayfaların renkleri serbesttir.

## 1. Profil ızgarası

Instagram profili her gönderiyi ortadan kesilmiş 3:4 bir kare olarak gösterir:
- **4:5 gönderi:** iki yanından yaklaşık 34 px kaybeder.
- **9:16 reels:** üstünden ve altından 240 px kaybeder.
- **Sağ üst köşe:** Instagram karusel, reels ya da sabitleme ikonunu bu köşeye koyar.

Bu yüzden:
1. **Kenar payı:** Yazı ve logo, ızgaranın gösterdiği alanın içinde ve kenardan en az 64 px içeride durur. Kod: `gridInsets` (`src/Images/Templates/ProfileGrids/ProfileGridLayout.ts`). `ImageFrame` ve `PromoDeck` bunu varsayılan olarak kullanır.
2. **Sağ üst köşe:** Başlığın ilk satırları bu köşeden `GRID_ICON_ROOM` (110 px) kadar önce biter.
3. **Kontrol:** Her gönderi, profil ızgarasındaki kırpılmış haliyle de kontrol edilir; yalnız tam görüntüye bakmak yetmez. `npm run image`, dikey ve kare PNG'lerin yanına `<ad>_izgara.png` dosyasını kendisi yazar: gönderiler 3:4 kırpılmış, üçerli dizilmiş ve ikon köşesi gölgeli olarak görünür (`src/Images/Renderers/GridPreview.ts`; kapatmak için `--no-grid`).

## 2. Seri gönderiler

- **Ortak boyut ve hiza:** Yan yana duran gönderilerde (profil üçlüsü, karusel sayfaları) başlıklar aynı punto, aynı hiza ve aynı satır çizgisinde durur. Boyut her karede ayrı ayrı hesaplanmaz; serinin en uzun başlığına göre bir kez seçilir (`AppTrio.headlineSize`).
- **Büyük rakamlar:** Adım numaraları (1, 2, 3…) sabit genişlikte bir kutuda, ortalı ve tablo rakamlarıyla yazılır. "1" gibi dar rakamlar biraz büyütülür, çünkü sola yaslanmış "1" ötekilerden küçük görünüyordu (`PromoDeck.StepNumber`).

## 3. Vurgu

- **Ne vurgulanır:** Başlıkta vurgulanan kelime, gönderinin anlattığı şeydir: özellik, fiil ya da asıl fikir ("yalan", "altı kelime", "çöz"). Son kelime otomatik vurgulanmaz.
  - Reels kapağında `cover.emphasis` ile seçilir.
  - Kampanya gönderisinde slaydın `emphasis` alanıyla seçilir.
  - Yalnız ders videolarının kapağında, seçim yapılmamışsa son kelime vurgulanır; o vurgu ders rengini taşır.
- **Noktalama:** Vurgulanan kelimeden hemen sonra gelen nokta, ünlem ya da soru işareti vurgunun içinde kalır ("çöz.").
- **Zeminle kontrast:** Vurgu rengi zeminden ayrışmalı. Turuncu zeminde turuncu vurgu kaybolur; o durumda vurgu lacivert zemine beyaz yazıyla yapılır (`VideoCover`).

## 4. Boş alan

Tek renkli büyük bir alan, ürün göstermeden bırakılmaz; leke gibi okunur. Telefon maketi büyütülür ve alanı doldurur, kanıt kartı onunla üst üste biner (`PromoDeck`, `proof` görünümü).

## 5. Metin

- **Uygulamadaki ad:** Özellik adı, uygulamada yazdığı gibi kullanılır. SinoAI'nin ürettikleri **Kütüphane**'de durur; cümle içinde küçük harfle yazılır: "Ürettiği her şey kütüphanende durur." "Kitaplık" denmez; ürün metni denetimi bunu hata sayar.
- **Tam cümle:** Başlık, fiili olan bir cümledir. "Türkiye geneli ya da kendi denemen." eksik kalıyordu; doğrusu: "Türkiye geneli denemeyi ya da sana özel denemeni çöz."
- **Yalnız gerçek özellik:** Uygulamada olmayan bir özellik yazılmaz. Örneğin öğrenci deneme yüklemez; SinoAI ona özel deneme hazırlar.
- **Ekler:** SinoAI'nin ekleri `BrandIdentity.md`'deki gibidir: SinoAI'ye, SinoAI'nin. Uzun başlık kenara yaklaşırsa ekli kelime kesik gibi görünür; çözümü 1. kuraldaki kenar payıdır.
- **Yasak kelimeler:** "Koç" ve Türkçe "quiz" hiçbir görselde, açıklamada ya da seslendirmede geçmez. Ürün metni denetimi gönderiyi durdurur.
- **Test sayısı:** Testler'de bir seviye 20 sorudur ve seviyeler Kolay, Orta, Zor'dur. "10 soru" yalnız SinoAI'nin ürettiği, sayısı öğrencinin seçtiği testler için yazılır.

## 6. Video kareleri

- **Hızlı belirme:** Ekrandaki yazı ve etiketler yavaşça belirmez. Kelimeyle birlikte en geç 0,1 saniyede tam görünür olurlar; istenirse kısa bir büyüme hareketi kullanılır. Durdurulan ya da ekran görüntüsü alınan her kare okunur olmalı. "PLANLA." karesindeki "Ders Planı" etiketi yarı saydam yakalanmıştı (`KineticType`).
- **Kontrol:** Video kontrol edilirken yalnız hareket değil, rastgele birkaç durdurulmuş kare de incelenir.
- **İlk kare:** Videonun ilk karesi kapaktır ve hook'u taşır. Kapak, profil ızgarasında da tek başına okunur ve durdurur. Durağan bir başlık kartı 2 saniyeden uzun kalmaz.

## 7. Kaydırmalı gönderi

- **Kapak:** 1. sayfa boş kalmaz; hook ve ürün ya da konu görseli alanı doldurur (31 Ekim admin notu). İkinci derecede çağrılar ("arkadaşını etiketle") daha küçük yazılır. Kısa bir "Kaydır" çağrısı kullanılabilir. Sayfa sayacı ve ilerleme çubuğu kullanılmaz.
- **2. sayfa:** İkinci hook'tur ve tek başına durdurur.
