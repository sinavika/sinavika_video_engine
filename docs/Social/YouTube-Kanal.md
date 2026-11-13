# YouTube kanalı: ayarlar, yükleme ve Shorts

Kanal: [youtube.com/@sinavika](https://www.youtube.com/@sinavika) · kanal kimliği `UCjImz5YJVbVTKLHe0f7AoEQ`. Kanalın işi ücretsiz sınav kamplarıdır: YKS (TYT, AYT) ve KPSS. Kamp listesi `Curriculum/Camps` klasöründedir. Her videonun başlığı, açıklaması, etiketleri ve yüklendikten sonra kimliği o dersin `Curriculum/Jobs/<kamp>/<NN>-<konu>-youtube.md` notundadır.

Studio'daki her değişiklik sahibin onayıyla yapılır; değişiklikten sonra herkese açık sayfa yeniden açılıp kontrol edilir.

## 1. Kanal ayarları (1 Kasım 2026'dan beri yayında)

| Alan | Değer |
|---|---|
| Ad | Sınavika (ı ile; kullanıcı adı `@Sinavika` aynı). Ad 14 günde en çok iki kez değişebilir. |
| Kitle, ülke | Çocuklara özel değil; Türkiye |
| Yükleme varsayılanları | Kategori Eğitim, dil Türkçe, yorumlar açık |
| Özellikler | Standart, orta ve gelişmiş özellikler etkin |
| Banner | Açık zemin, TR, tanımlayıcı "Sana göre sınav hazırlığı" |
| Oynatma listeleri | Her kamp kendi listesi ("TYT Türkçe Kampı · Sınavika", "TYT Matematik Kampı \| Sınavika"), sınav başına bir üst liste ("YKS Kampı · Sınavika"; KPSS için "KPSS Kampı · Sınavika" açılacak). Herkese açık, en eski önce, Türkçe. |
| Google Ads hesabı | Bağlı değil (bağlanırsa YouTube izleyicileri reklamda yeniden hedeflenebilir) |

**Açıklama:**

```
TYT, AYT ve KPSS'ye Sınavika'nın ücretsiz YouTube kamplarıyla hazırlan. Her konu sırayla anlatılıyor, ÖSYM tarzı sorularla adım adım çözülüyor.

📚 YKS kampı
TYT: Türkçe, Matematik, Geometri, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe, Din Kültürü
AYT: Edebiyat, Matematik, Geometri, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe, Psikoloji, Sosyoloji, Mantık, Din Kültürü

📚 KPSS kampı
Türkçe, Matematik, Geometri, Tarih, Coğrafya, Vatandaşlık

Her kamp dersinde:
✅ Konu anlatımı ve ÖSYM tarzı sorularla çözüm
✅ Sınavda en çok düşülen tuzaklar
✅ Ders sonunda bir kamp görevi
✅ Kısa tekrar videoları (Shorts)

Dersleri SinoAI anlatıyor. Kampın testleri ve Ders Planı Sınavika uygulamasında: neyi bildiğini ölç, eksiğini gör, planını yap.

Sınavika · Sana göre sınav hazırlığı.
Kanala abone ol, kampa Bölüm 0'dan başla. 🔔

İş birliği için: info@sinavika.com
```

- İlk cümle aramada ve kanal başlığında görünen kısımdır: TYT, AYT, KPSS ve "kamp" sözcükleri oradadır. Sunmadığımız sınavlar (ÖABT, AGS, ALES, DHBT) hiçbir yerde geçmez. "Ücretsiz" yalnız YouTube kampı için kullanılır.
- "Dersleri SinoAI anlatıyor" satırı, kamplarda anlatıcının SinoAI adıyla anılmaması kuralıyla (sahip, 9 Kasım 2026) çelişiyor; değiştirilmesi sahibin kararı (§6).

**Anahtar kelimeler** (254/500):

```
Sınavika, SinoAI, YKS, TYT, AYT, KPSS, YKS kampı, TYT kampı, AYT kampı, KPSS kampı, TYT konu anlatımı, AYT konu anlatımı, KPSS konu anlatımı, TYT Türkçe, TYT Matematik, TYT Geometri, ÖSYM tarzı sorular, YKS hazırlık, KPSS hazırlık, ücretsiz kamp
```

**Bağlantılar** (kanal başlığında ilk bağlantı görünür; web sitesi ilk sırada):

| Başlık | Adres |
|---|---|
| Sınavika | https://sinavika.com |
| App Store | https://apps.apple.com/tr/app/id6762061768?l=tr |
| Google Play | https://play.google.com/store/apps/details?id=com.sinavika.mobile |
| Instagram | https://www.instagram.com/sinavika.tr |
| TikTok | https://www.tiktok.com/@sinavika.tr |
| LinkedIn | https://www.linkedin.com/company/sinavika |

**Ana Sayfa sekmesi:** açık. Sırası: kanal fragmanı (TYT Bölüm 0, abone olmayanlar için), öne çıkan video (yayındaki en son kamp dersi, geri dönen aboneler için), kamp listeleri, YKS Kampı listesi, Videolar, Kısa videolar. Yeni ders yayına girince öne çıkan video o ders yapılır; yeni kamp listesi açılınca kendi bölümü eklenir.

## 2. Kamp dersi yükleme

Sahip videoyu yükler; ayarları biz yaparız. Her ders için:

1. **Başlık:** iş notundaki başlık A. A/B testi açılmaz (sahip).
2. **Açıklama:** iş notundaki metin. Bölümler render'ın `*.chapters.txt` dosyasından, "Kampı baştan izle" kampın Bölüm 0'ına, önceki dersin bağlantısıyla. Not, senaryo yeniden yazılmadan önce hazırlandıysa render edilen senaryoya göre yeniden yazılır (bölüm listesi ve soru sayısı senaryoyla tutmalı).
3. **Kapak:** kamp kapağı (`*_YouTube_Kapak.png`, 3840 × 2160, [`Sosyal-Kimlik-Standardi.md`](Sosyal-Kimlik-Standardi.md) §1).
4. **Listeler:** kampın kendi listesi ve sınavın üst listesi.
5. **Diğer:** etiketler, ücretli tanıtım yok, yapay zekâ beyanı "Hayır", bitiş ekranı Ders 4'ten içe aktarılır (abone ol + en son yükleme).
6. **Yayın saati:** sahibin seçtiği gün; saat okul çıkışından sonra 18:00 ya da akşam 19:00–21:00. Aynı gün iki ders varsa en az 3 saat ara. Özel günlerde (10 Kasım, 24 Kasım, bayramlar) mağaza bağlantılı ders yayına konmaz. Kanal büyüyünce Studio'daki "izleyicilerin YouTube'da olduğu saatler" kartı yeniden kontrol edilir (5 aboneyle "yeterli veri yok" diyor).
7. **Doğrulama:** sayfa yeniden açılır; açıklama dosyayla karakter karakter karşılaştırılır, kapağın kaydedildiği görülür. Video kimliği dersin iş notunun "Yükleme" bölümüne yazılır.
8. **Kampın ilk dersi yüklenince** Bölüm 0'ın açıklamasına "▶️ İlk ders" bağlantısı eklenir.

## 3. Shorts ve kapaklar

Buffer YouTube Shorts'a kapak gönderemez ([`VideoCover.ts`](../../src/Configurations/VideoCover.ts)); YouTube videonun bir karesini seçer. Bu yüzden her Short'un kapağı Studio'da "Küçük resim" alanına elle yüklenir.

| Short | Kapak dosyası |
|---|---|
| Kamp Short'u | `Outputs/Camps/YKS/TYT/<Ders>/<NN_Konu>/<Konu>_Reels_Kapak.png` |
| Reklam Short'u (Kasım'a kadar) | `Posts/<tarih>_<Ad>/Media/<Ad>_Kapak.png`; yalnız kapak gerekirse `npm run cover` |
| Özel gün videosu (10 Kasım gibi) | Kapaksız kalır |

## 4. YouTube Shorts: yalnız kamp içerikleri (sahip, 10 Kasım 2026)

- **Kasım 2026, reklam Short'larının son ayıdır.** Onaylı reklam Short'ları Buffer'da kalır.
- **Aralık'tan itibaren** YouTube Shorts'a yalnız sinavika.yks'teki kamp reels'leri gider. sinavika.tr hesaplarına giden reklam içerikleri YouTube'a hiç gönderilmez; tek istisna Google Ads videolarıdır (liste dışı, SocialHub'dan geçmez). Motor tarafı: [`SocialPlan.md`](SocialPlan.md) §1.
- **Hedef:** kamp reels'i gönderilirken `youtube/Sinavika` (short) hedefi her zaman eklenir. Hedefin `caption` alanı dersin bağlantısını verir: ders yayındaysa "Dersin tamamı ücretsiz: https://youtu.be/<id>", değilse "kanalda, TYT <ders> Kampı oynatma listesinde".
- **Saat (çakışma yok):** YouTube Short'u sinavika.yks Instagram reels'iyle aynı saate konur. O saatin 90 dakika yakınında kanalda başka bir paylaşım varsa (reklam Short'u ya da uzun ders), günün öteki sinavika.yks Buffer saati kullanılır; o da doluysa YouTube'un Buffer saati.
- **Short → ders geçişi.** Short merak uyandırır, "İlgili video" derse taşır, dersin bitiş ekranı sonraki derse götürür. Buffer kapak ve İlgili video gönderemediği için yayından sonra Studio'da her kamp Short'u için:
  1. **Başlık:** "TYT <Ders>: <Konu>, hızlı tekrar" (ör. "Türkçe: Söz Yorumu, hızlı tekrar"). Sahibin elle yüklediği Short'ların başlığı dosya adı olabilir; seri başlığıyla değiştirilir.
  2. **Açıklama:** reels metni, ders bağlantısı ve etiketler. Ders henüz yüklenmediyse açıklama oynatma listesine yönlendirir; ders yüklenince açıklama güncellenir.
  3. **Kapak:** §3'teki dosya, "Küçük resim › Dosya yükle".
  4. **İlgili video:** "İlgili video" alanında ders aranıp seçilir.
  5. **Kaydet ve doğrula:** sayfayı yenile; başlık, açıklama ve İlgili video duruyor mu bak. Studio'nun listesinde özel kapaklı videoların küçük resmi `mqdefault.jpg` olur; otomatik karede `mq1`, `mq2` gibi görünür.

## 5. Studio tuzakları

- **Metin kutuları:** kutuya konumla tıklayıp yazmak metni gösterse de Studio değişikliği algılamayabilir. Kutuyu öğe kimliğiyle (find) seç; kaydetmeden önce Kaydet düğmesinin etkin olduğunu gör.
- **Boş kutuda Ctrl+A** tümünü seçmez, "a" harfi yazar. Boş kutuda kullanma; yazdıktan sonra kutunun ilk harflerini oku.
- **Sayfa yeni açılmışken** yazılan başlık ya da açıklama kaydedilmeyebilir (Kaydet henüz etkin değilken). Yazdıktan sonra kaydet, sayfayı yeniden aç, açıklamanın özetini dosyayla karşılaştır.
- **Uzun açıklama:** araç 30 saniyede "zaman aşımı" verse de metin tam yazılmış olabilir. Yeniden yazmadan önce kutudaki metnin özetini (hash) dosyayla karşılaştır; kutunun metni sonda fazladan bir satır sonu taşır, karşılaştırmadan önce at.
- **Kapak yükleme:** "Değiştir" dosya penceresi açar; kapak sayfadaki gizli dosya alanına (`#file-loader`) doğrudan yüklenir. Dosyadan sonra ~10 sn bekleyip kaydet; hemen kaydedilirse kapak işlenmeden kaydedilir ve kalmaz. ~10 sn sonra sayfayı yeniden açıp kapak alanında yüklenen resmi gör.
- **Oynatma listesi penceresi:** kutulara öğe referansıyla tıklamak pencereyi kapatabilir; kutulara ekrandaki konumlarından tıkla, sonra yakınlaştırıp işaretlendiklerini gör.
- **Planlama:** takvimden güne tıklamak bazen tarihi değiştirmez. Tarih kutusuna "10 Kas 2026" yazıp Enter'a bas; saati listeden seç.
- **İlgili video araması** ilk harfleri yutar: tümünü seçip (Ctrl+A) yeniden yaz, sonra Enter.

## 6. Açık konular (sahibin kararı)

- Kanal açıklamasındaki "Dersleri SinoAI anlatıyor" satırı (§1).
- Kampların Bölüm 0 kapağı: motor lacivert tanıtım kapağı çiziyor (CampLessonIntro). TYT Matematik Bölüm 0 için ders kapaklarının mavi görünümünde kapak elle çizildi (`Outputs/Camps/YKS/TYT/Matematik/00_Tanitim/Tanitim_YouTube_Kapak.png`). Bütün kampların Bölüm 0'ı böyle olacaksa kapak kuralı motorda değişmeli.
- Eski tanıtım Short'ları: "Sınavika artık sadece bir deneme uygulaması değil" görüntüsünde "YKS, KPSS, ALES, DGS" yazıyor (ALES sunulmuyor); "Sınavika Premium ile tüm denemeler tek yerde" Short'unda "Aylık sadece 99 TL" ve "54 deneme" yazıyor. Videolar düzenlenemez; gizlemek ya da bırakmak sahibin kararı.
- Google Ads hesabını kanala bağlamak.
- TYT Matematik kamp reels'leri 23 Kasım'dan itibaren "Dersin tamamı YouTube'da" diyor; o günün dersi o tarihte kanalda olmalı (Ders 3–7 henüz yüklenmedi, 10 Kasım).
