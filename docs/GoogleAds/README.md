# Sınavika Google Ads seti

İlk sürüm: 15 Ekim 2026.

20 Ekim 2026 güncellemesi:
- sınav etiketi ve aramaya dayalı kancalar;
- Türkiye ve ABD ayrımı;
- SAT ve ACT;
- ölçüm ve dönüşüm düzeni;
- arama kampanyaları, bannerlar ve videolar.

30 Ekim 2026 yenilemesi (sahibin isteğiyle bütün görseller ve videolar yeniden üretildi, adlar aynı):
- **Renk:** zemin yalnız marka paletinden; turuncu ve lacivert, konsepte göre sırayla. Modül renkleri (yeşil Ders Planı, mor Akıllı Özet, pembe Bilgi Kartları) zemin olmaktan çıktı; yalnız uygulama ekranlarının içinde kaldı.
- **Logo:** her yerde yeni logo (simge ve yazı birlikte). Eskiden yalnız yazı vardı.
- **Çözünürlük:** görseller iki kat boyutta (ör. kare 2400×2400); Google aynı oranda büyük dosyayı kabul eder ve daha net gösterir. Videolar 4K.
- **Üst üste binme yok:**
  - Kanıt kartı ile telefon ya da tarayıcı yan yana durur. Cihazlar karenin içinde kalır, kenardan taşıp menüsü kesilmez.
  - Bannerlarda ve web HTML5'lerinde tarayıcı çıkarıldı; yalnız kanıt kartı var. Orta boy bannerlarda (300×250, 336×280, 250×250) kart kancaya ve alt satıra değiyordu; orada kart yerine destek cümlesi var.
  - Videoda altyazı ayrı bir bantta durur. Ekrandaki kancayı tekrarlayan altyazı gösterilmez.
- **Dil:** İngilizce reklamda Türkçe ekran yok; web ekranındaki kullanıcı adı da İngilizce. Bunu bir test her seferinde denetler.
- **Ses:** bütün 15 sn videolar ElevenLabs ile yeniden seslendirildi: Türkçe Doğa, İngilizce Liam (ABD'li, ana dili İngilizce).

Set yalnız öğrencilere yöneliktir. Pazar klasörle ayrılır:
- `tr/` Türkiye'dir: YKS ve KPSS, Türkçe.
- `en/` ABD'dir: SAT ve ACT, İngilizce.

Her sınavda mobil uygulama ve web sitesi tanıtımı ayrı klasördedir.

## Nereden başlamalı

1. **`Anahtar-Kelime-ve-Kanca-Kurallari.md`**: kancalar Google'da gerçekten aranan kelimelerden kuruldu. Bu dosya Planlayıcı verisini, kuralları ve yeni reklam yazarken kontrol listesini içerir.
2. **`Olcum-ve-Hesap-Analizi.md`**: hesabın durumu, neyin ölçüldüğü ve senin yapacakların. Reklamlar gecikmiş bakiye ödenene kadar yayında değil.
3. `onizleme/index.html`: görsellerin toplu önizlemesi.
4. `Icerik-Plani.md`: konseptler, ilkeler, kampanya yapısı.
5. `arama/Arama-Plani.md`: arama kampanyaları, kelimeler, negatifler.
6. `Metinler.md`: uygulama ve görüntülü kampanyaların başlık ve açıklamaları, karakter sayılarıyla.

## Her reklam hangi sınav olduğunu söyler

Her görselin üstünde küçük bir sınav etiketi var:
- "KPSS · Lisans · Önlisans · Ortaöğretim"
- "YKS · TYT · AYT"
- "Digital SAT · Math · Reading & Writing"
- "ACT · English · Math · Reading · Science"

Kanca da sınavın adını taşır (ör. "KPSS puanını nerede kaybettin?"). Bir reklamda yalnız kendi sınavı görünür; kanıt kartı, ürün ekranı ve video kapanışı dahil.

## Klasörler

```
Anahtar-Kelime-ve-Kanca-Kurallari.md  kelime araştırması, kanca kuralları, kontrol listesi
Olcum-ve-Hesap-Analizi.md             hesap analizi ve yapılacaklar
arama/
  google-ads-editor-arama.csv         Google Ads Editor içe aktarma: 3 kampanya (KPSS ₺75, YKS ₺75, Marka ₺15 günlük),
                                      14 reklam grubu, kelimeler, negatifler, 14 duyarlı arama reklamı (ETKİN gelir)
  site-baglantilari.csv               6 site bağlantısı
  ek-aciklamalar.csv                  6 ek açıklama
  yapilandirilmis-snippet.csv         "Kurslar" snippet'i
  negatif-kelimeler.txt               paylaşılan negatif kelime listesine yapıştırmak için
  Arama-Plani.md                      planın okunur hâli
ortak/logo/                           logo alanları: kare 1200×1200, yatay 1200×300
ortak/video-isleri/                   her videonun render işi (tek videoyu yeniden üretmek için)
tr/  (Türkiye)  yks/ ve kpss/
en/  (ABD)      sat/ ve act/
    mobil-uygulama/ ve web-sitesi/
      gorseller/                      metinli: yatay-1200x628, kare-1200x1200, dikey-1200x1500
      gorseller-metinsiz/             aynı görseller, yalnız ürün
      html5/                          320x480 ve 480x320 ZIP (animasyonlu)
      banner/                         YALNIZ web-sitesi: 9 standart boyut, JPEG, her biri 150 KB altı
                                      300x250 · 336x280 · 250x250 · 300x600 · 160x600 · 728x90 · 970x250 · 320x100 · 320x50
      video/                          15sn (yatay-16x9, kare-1x1, dikey-9x16) ve 6sn-bumper (yatay, dikey)
      metinler.csv                    başlıklar ve açıklamalar
```

## Kampanya yapısı

| Kampanya | Pazar | Reklam grupları / öğe grupları | Günlük bütçe |
|---|---|---|---|
| App promotion-App-android | Türkiye | YKS, KPSS (`tr/*/mobil-uygulama`) | ₺150 |
| App promotion-App--İOS | Türkiye | YKS, KPSS (`tr/*/mobil-uygulama`) | ₺50 |
| App promotion-ABD-android | ABD | SAT, ACT (`en/*/mobil-uygulama`) | ₺50 |
| App promotion-ABD-ios | ABD | SAT, ACT (`en/*/mobil-uygulama`) | ₺50 |
| Arama · KPSS · Web | Türkiye | 7 grup (`arama/`) | ₺75 |
| Arama · YKS · Web | Türkiye | 6 grup (`arama/`) | ₺75 |
| Arama · Marka | Türkiye | 1 grup (`arama/`) | ₺15 |
| PMax · Web · TR | Türkiye | YKS, KPSS (`tr/*/web-sitesi`) | ₺50 |
| PMax · Web · ABD | ABD | SAT, ACT (`en/*/web-sitesi`) | ₺30 |

Eski "Anahtar kelime kampanyası", "Sales-Search-2" ve eski PMax "Online Deneme Sınavı" kaldırıldı.

ABD'de tıklama Türkiye'nin 10–30 katı pahalı (₺30–130). ABD bütçesi bu yüzden küçük tutuldu.

## Videolar

- **15 sn:** kanca, kanıt kartı, ürün, kapanış.
  - Türkçe videolar marka sesi Doğa ile (ElevenLabs, Eleven v4) seslendirildi.
  - İngilizce videolar ElevenLabs'in ana dili İngilizce olan sesi Liam ile seslendirildi. Türk sesi İngilizce okuyunca yapay duruyor.
  - Altyazı, ekrandaki kancadan farklı bir şey söylendiğinde görünür.
  - Hepsi 15 saniye veya altında, yani atlanamaz yayın içi reklamda da kullanılabilir.
- **6 sn bumper:** yalnız müzik; kanca, kanıt ve kapanış.
- **Müzik:** her sınav ve tanıtım için ayrı üretildi (ElevenLabs Music).
- **Kalite:** 4K render edildi; YouTube'a olduğu gibi yükle.

Videoları Google Ads'te kullanmak için:
1. YouTube kanalına "Liste dışı" olarak yükle.
2. Kampanyada YouTube bağlantısını seç.
3. Uygulama kampanyası için 16:9, 1:1 ve 9:16'nın üçünü de ekle.

## Arama kampanyalarını içe aktarma

İki yol var.

**Google Ads Editor ile:**
1. Google Ads Editor'ü aç, hesabı (704-426-1654) indir.
2. **Hesap › İçe aktar › Dosyadan** seç ve `arama/google-ads-editor-arama.csv` dosyasını aç.
3. **Gönder**'e bas. Kampanyalar etkin ve seçtiğin bütçelerle gelir; bakiye ödenene kadar yayınlanmaz.

**Web arayüzü ile:** **Araçlar › Toplu işlemler › Yüklemeler** bölümünde aynı CSV'yi yükle.

Her iki yolda da sonrası aynı:
- Site bağlantıları, ek açıklamalar ve snippet'leri **Öğeler** bölümünden kampanyalara ekle; CSV'lerdeki metinler hazır.
- Editor bir sütunu tanımazsa önizlemede uyarı verir. Bu durumda o satırı arayüzden eklemek yeterli.

## HTML5 nedir

HTML5 banner küçük bir web sayfası gibi çalışan animasyonlu reklamdır. İki kez oynar, sonra son karede durur. ZIP'i açmadan yükle.

Google HTML5 yüklemeyi her hesaba açmaz. Reddedilirse `banner/` klasöründeki statik görseller aynı işi görür.

## Değiştirmek gerekirse

Her şey `sinavika_video_engine/src/Ads/Google/` altındaki tek kaynaktan üretilir:

```
npm run google-ads           görseller, bannerlar, HTML5, metinler, arama dosyaları
npm run google-ads-video     videolar
```

Yeni bir kanca yazmadan önce `Anahtar-Kelime-ve-Kanca-Kurallari.md` içindeki kontrol listesine bak. `npx vitest run tests/Ads/Google/GoogleAds.test.ts` kuralları denetler.
