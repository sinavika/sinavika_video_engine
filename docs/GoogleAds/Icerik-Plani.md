# Sınavika Google Ads içerik planı

**Tarih:** 15 Ekim 2026
**Kapsam:**
- Yalnız öğrenciler; veli hedeflenmez.
- YKS ve KPSS ayrı.
- Mobil uygulama ve web sitesi tanıtımı ayrı.
- Türkçe ve İngilizce.

**Tek kaynak:** `src/Ads/Google/GoogleAdsPlan.ts`. Konseptler, kanıt kartları, metinler ve formatlar buradan okunur.
**Üretim:** `npm run google-ads`. Çıktı `Desktop\Sinavika-GoogleAds` klasörüne yazılır (yapı §10'da).

---

## 1. Önceki 32 görselin değerlendirmesi

Önceki set, beklenen performansı vermedi. Ortak nedenler:

| Bulgu | Etkisi |
|---|---|
| Hepsi tek boyutta (1080 × 1350). Google'ın istediği yatay 1,91:1 ve kare 1:1 yok | Google görseli kırpıyor ya da az sayıda yerde gösteriyor; yatay alanların çoğunda reklam hiç çıkmıyor |
| Yoğun metin: paragraf, özellik listesi, fiyat, telefon, adres | Küçük reklam alanında okunmuyor. Google, metnin görselin yaklaşık beşte birini aşmamasını önerir; aşanlar daha az gösterilir |
| Bir görselde birden çok mesaj (deneme + analiz + plan + fiyat + indir) | Göz tek bir şeye tutunamıyor, mesaj akılda kalmıyor |
| Eski arayüz: Compass, Feed, ATLAS gibi kullanılmayan adlar, akış ekranı | Ürünle tutarsız; mağaza ve uygulamayla aynı dil konuşulmuyor |
| Telefon ekranları küçük ve okunmuyor | Reklam ürünün ne yaptığını göstermiyor, yalnızca "bir uygulama var" diyor |
| Stok fotoğraf ve şablon kalıntıları ("Your Logo", "LOGO", "harikasite.web.tr", örnek telefon numaraları, işletme metinleri) | Güven kaybı ve "yanıltıcı/alakasız içerik" politikası riski |
| Sahte düğmeler, QR kod, "Şimdi indir" kutuları | Google'ın görsel kalitesi kuralına takılır; tıklanabilir sanılan ama tıklanmayan öğe hayal kırıklığı yaratır |
| Doğrulanmamış iddialar ("ÖSYM uyumlu sonuç", "En çok tercih edilen", "Derecelere ödüller") ve birbirini tutmayan fiyatlar | Politika ve Reklam Kurulu riski, güven kaybı |
| YKS ve KPSS aynı görselde, LGS anılmış | Kimse kendini muhatap hissetmiyor |
| Hep aynı açı: "Türkiye geneli deneme" | Google'ın döndüreceği çeşitlilik yok, kreatif hızla yoruluyor |

## 2. Yeni setin ilkeleri

1. **Tek görsel, tek fikir:** Her görselde tek bir kısa kanca var, altında tek bir destek cümlesi.
2. **Kanıt kartı:** Ürünün gerçek bir anı (net kaybı, bugünün planı, adım adım çözüm, sıralama, kart, SinoAI cevabı) büyük ve beyaz bir kart olarak çizilir. Küçük reklam alanında bile okunur; vaadi göstererek kanıtlar.
3. **Gerçek ve güncel ürün:** Telefon ve tarayıcıdaki ekranlar UI/UX v3 parçalarıyla çizilir. Veri sınava özeldir: KPSS reklamında TYT ekranı görünmez.
4. **Marka renginde zemin:** Zemin yalnız marka paletinden gelir: 1. ve 3. konsept turuncu, 2. ve 4. konsept lacivert (`src/Ads/Google/AdGround.ts`). Google döndürürken reklamlar yine değişir, ama hepsi aynı markaya ait görünür. Modül renkleri yalnız uygulama ekranlarının içinde kalır. 30 Ekim 2026'ya kadar her konsept kendi modülünün rengindeydi (yeşil, mor, pembe); sahip bunu marka dışı buldu.
5. **Görselde olmayanlar:** düğme, fiyat, telefon, adres, QR, stok fotoğraf. Yönlendirme yalnız tek bir satırdır: "iOS ve Android'de ücretsiz indir" ya da "sinavika.com'da ücretsiz başla". Asıl çağrıyı Google'ın kendi düğmesi yapar.
6. **Metinli ve metinsiz kopya:** Her görselin bir de metinsiz kopyası var (yalnız ürün ve kanıt kartı). Google başlığı ve logoyu kendisi ekler; iki yaklaşım karşılaştırılır (§8).
7. **Doğru boyutlar:**
   - 1200 × 628 (1,91:1), 1200 × 1200 (1:1), 1200 × 1500 (4:5); her biri 5 MB'ın altında.
   - HTML5: 320 × 480 ve 480 × 320. Her biri tek ZIP, 5 MB'ın altında ve 512 dosyadan az.
8. **Marka dili:** "Sen" dili; modül adları `ProductMessaging` kurallarından. "Koç" kelimesi ve eski adlar kullanılmaz; bunu test kontrol eder.

## 3. Kampanya yapısı

| Tanıtım | Google Ads kampanya türü | Kampanyalar | Varlıklar |
|---|---|---|---|
| Mobil uygulama | **Uygulama kampanyası** (yükleme odaklı; uygulama içi etkinlik ölçülüyorsa "ilk deneme başlatıldı" hedefi) | YKS-TR, KPSS-TR, YKS-EN, KPSS-EN | Her kampanyada: 4 konseptin 3 boyutu, metinli ve metinsiz (24 görsel), 2 HTML5, 5 başlık, 5 açıklama |
| Web sitesi | **Demand Gen** ya da **Görüntülü Reklam ağı** (duyarlı görüntülü reklam). Dönüşüm izleme oturduktan sonra Performance Max | YKS-TR, KPSS-TR, YKS-EN, KPSS-EN | Her kampanyada: 4 konseptin 3 boyutu (+ metinsiz), 5 başlık, uzun başlık, 5 açıklama, logolar |

**Notlar:**
- **HTML5 boyutları:** 320 × 480 ve 480 × 320, uygulama kampanyalarının HTML5 boyutlarıdır. Web sitesi klasöründeki HTML5'ler, aynı boyutun kabul edildiği görüntülü yerleşimler için hazır bekler.
- **HTML5 yükleme koşulu:** Google, HTML5 yüklemesini her hesaba açmaz; politika geçmişi ve harcama koşulu arar. Yükleme reddedilirse görseller tek başına yeterlidir.
- **Reklam grupları:** Web kampanyasında her konsept ayrı bir reklam grubu olursa, hangi mesajın çalıştığı net okunur.
- **İngilizce kampanyalar:** Kitlesi dar (Türkiye'deki yabancı uyruklu ve yurt dışındaki Türk öğrenciler). Başlangıçta bütçenin en fazla %10'u ayrılmalı. KPSS-EN'in değeri özellikle sınırlı; ilk sonuçlara göre kapatılabilir.

## 4. Kitle (yalnız öğrenciler)

- **YKS:**
  - Kitlenin çoğu 18 yaş altında. Google bu yaştakilere kişiselleştirilmiş (ilgi alanına dayalı) reklamı kısıtlar.
  - Bu yüzden hedefleme içerik üzerinden yapılır:
    - anahtar kelime ve konu (TYT, AYT, deneme, net hesaplama, YKS çalışma programı);
    - eğitim YouTube kanalları ve sınav siteleri gibi yerleşimler.
  - Uygulama kampanyasında Google bu sinyallerle kendisi optimize eder.
  - Web kampanyasında "ebeveyn" demografisi hariç tutulur.
- **KPSS:**
  - 22–35 yaş, mezun ve çoğu çalışan.
  - Hedefleme sinyalleri: KPSS GY-GK, tarih, coğrafya, vatandaşlık, memurluk ve tercih aramalarından özel segment.
  - Bu kitlede ebeveyn hariç tutulmaz, çünkü aday kendisi ebeveyn olabilir. Mesaj her durumda adaya konuşur.
- **Velilere:** Hiçbir metin ve görsel veliye seslenmez. Tüm kopya "sen" diliyle adaya yazılmıştır.

## 5. Konseptler

Her sınavda dört konsept var. Her biri bir modülü ve öğrencinin bir sorununu temsil eder.

### YKS

| # | Konsept | Modül | Kanca | Kanıt kartı | Aşama |
|---|---|---|---|---|---|
| 1 | `net-kaybi` | Denemeler | Netini nerede kaybettin? | En çok net kaybettiğin 3 konu (Problemler −3,25 net…) | Keşif · **HTML5** |
| 2 | `bugun-ne-calisayim` | Ders Planı | Bugün ne çalışacağını bil. | Bugünün planı: 3 görev, 45 dk | Keşif |
| 3 | `fotograf-cek-coz` | Akıllı Özet | Çözemediğin soruyu çek. | Adım adım çözüm, cevap ve konu | Keşif |
| 4 | `turkiye-geneli-deneme` | Denemeler | Türkiye genelinde yerini gör. | 78,5 net, +6,5, sıralama 8.214 / 12.480 | Değerlendirme |

### KPSS

| # | Konsept | Modül | Kanca | Kanıt kartı | Aşama |
|---|---|---|---|---|---|
| 1 | `puan-kaybi` | Denemeler | Puanını nerede kaybettin? | GY-GK'da en çok kaybettiğin 3 konu | Keşif · **HTML5** |
| 2 | `isten-sonra-plan` | Ders Planı | İşten sonra da hazırlan. | Bugünün planı: 3 görev, 40 dk | Keşif |
| 3 | `genel-kultur-kartlar` | Bilgi Kartları | Genel kültür aklında kalsın. | Kart: Lale Devri → 1718–1730; bugün 32 kart | Değerlendirme |
| 4 | `sinoai-sor` | SinoAI | Takıldığın konuyu sor! | Anayasa Mahkemesi sorusu ve SinoAI cevabı | Yeniden pazarlama |

**Neden bunlar:**
- **"Netini/puanını nerede kaybettin?":** Sınavika'nın en ayırt edici vaadi "ne çalışacağını bil". Deneme sonrası öğrencinin en çok sorduğu soruyla açılır, cevabı kanıt kartında verir.
- **Plan:** "Bugün ne çalışayım?" kararsızlığını bitirir. KPSS'de "işten sonra" açısı, çalışan adayın gerçek kısıtına konuşur.
- **Fotoğrafla çözüm (YKS) ve kartlar (KPSS):** En somut, en hızlı anlaşılan faydalar. YKS'de soru çözümü, KPSS'de genel kültür ezberi öne çıkar.
- **Türkiye geneli deneme (YKS):** Önceki setin ana mesajı. Kaldırılmadı, sıralama kanıtıyla güçlendirildi.
- **SinoAI (KPSS):** Siteyi ya da uygulamayı tanıyan kişiye ikinci adım olarak "seni tanıyan yapay zekâ".

Kanıt kartlarındaki sayılar ürün ekranının örnek verisidir. Garanti, kesin net artışı ya da "en iyi" gibi iddia içermez.

## 6. Metin varlıkları

Her grup için 5 başlık (en çok 30 karakter), 1 uzun başlık (90) ve 5 açıklama (90; ilki 60'ın altında) hazırlandı. Metinler `Metinler.md` dosyasında; her klasörde ayrıca `metinler.csv` var (Excel'de açılır, Google Ads'e kopyalanır). Karakter sınırlarını test kontrol eder.

## 7. Takvim

- **YKS:**
  - Ekim–Aralık: keşif ağırlıklı (net kaybı, plan).
  - Ocak–Mart: deneme ve sıralama.
  - Nisan–Haziran: son dönem (plan, fotoğrafla çözüm).
  - Sınav haftasından sonra kampanya durdurulur.
- **KPSS:** ÖSYM takvimi açıklanınca başvuru ve son 3 ay yoğunlaştırılır.
- Görsellerde ve metinlerde tarih yoktur. Takvim değişince yalnız bütçe ve zamanlama değişir.

## 8. Ölçüm ve test

- **Dönüşüm:** Uygulamada kurulum, kayıt ve "ilk deneme başlatıldı" (Firebase/GA4 etkinliği); web'de kayıt. Bunlar ölçülmeden optimizasyon kör kalır, bu yüzden önce dönüşüm izleme kurulmalı.
- **Öğrenme süresi:** En az 3–4 hafta değişiklik yapılmadan çalıştırılır.
- **Varlık raporu:** Google görselleri "Düşük / İyi / En iyi" diye derecelendirir. İki haftada bir "Düşük" olanlar çıkarılır; kazanan konseptin yeni bir varyasyonu üretilir (`GoogleAdsPlan.ts`'e konsept eklemek yeter).
- **Karşılaştırmalar:** metinli ve metinsiz görsel; konseptler arası; HTML5 ile görsel.
- **Ana metrikler:** kurulum ve kayıt başına maliyet. Tıklama oranı yalnız yardımcı sinyaldir.

## 9. Politika kontrol listesi

- Görselde düğme, QR, fiyat, telefon numarası yok.
- Garanti, "en iyi", "1 numara" yok. ÖSYM logosu, yayınevi içeriği, gerçek sınav sorusu yok.
- "Ücretsiz" yalnız gerçek anlamıyla kullanılıyor: uygulama ücretsiz indirilir, web'de ücretsiz plan var. Ücretsiz plan kalkarsa bu satır değişmeli.
- Metinler ürün dili kontrolünden (`checkProductCopy`) geçiyor.
- HTML5:
  - Boyut `ad.size` meta etiketinde.
  - Tıklama yalnız `ExitApi.exit()` ile.
  - Dış dosya yok (yalnız Google'ın ExitApi betiği).
  - Animasyon 30 saniyenin altında: iki kez oynar, son karede durur.

## 10. Klasör yapısı (`Desktop\Sinavika-GoogleAds`)

```
README.md, Icerik-Plani.md, Metinler.md
ortak/logo/                      logo-kare-1200x1200.png, logo-yatay-1200x300.png
<tr|en>/<yks|kpss>/<mobil-uygulama|web-sitesi>/
  gorseller/                     metinli
    yatay-1200x628/  kare-1200x1200/  dikey-1200x1500/   (01–04, konsept sırasıyla)
  gorseller-metinsiz/            aynı yapı
  html5/                         <sınav>-<tanıtım>-<dil>-320x480.zip ve -480x320.zip
  metinler.csv
onizleme/                        tüm setin özet sayfaları
```

**Google Ads'e yükleme:**
- **Görseller:** Kampanyanın "Görseller" alanına aynı klasörün üç boyutu birlikte yüklenir.
- **HTML5:** ZIP olduğu gibi yüklenir; açmaya gerek yok.
- **Metinler:** `metinler.csv`'deki satırlar başlık ve açıklama alanlarına girilir.
