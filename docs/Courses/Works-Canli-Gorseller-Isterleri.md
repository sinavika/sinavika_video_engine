# Works: canlı ve etkileşimli görseller (isterler, 20–21 Kasım 2026)

**Durum (21 Kasım):**
- **Kapsam büyüdü:** Sahip, beş ders için ders bazında bütün etkileşimleri istedi (§0). API tek seferde ve büyük yapılacak.
- **Eskiyen bölümler:** §2–§4'teki dört adımlık ilk taslak ve sorular eskidi; yalnız geçmiş için duruyor.
- **Sıradaki iş:** Mimari api+web+mobile ile birlikte kesinleşecek ve sahibe tek anlatım olarak sunulacak.

Sıra: mimari anlatımı → sahibin onayı → UI/UX çizimi → motor altyapısı ve API/mobil/web kodlaması → yerel veritabanında seed verisiyle deneme → içerik.

## 0. Sahibin kararları (21 Kasım)

Sahibin sözü: "tek seferde api işlemini halletmek istiyorum iş büyük olsun. fizik tarih cografya biyoloji matematik için etkileşim istiyorum bunlar zaten merkezi yapılar olacak … ölçeklenebilir büyütülebilir genişletilebilir mimari olsun".

| Ders | İstenen etkileşimlerin hepsi (sahip her derste dört seçeneğin dördünü de seçti) |
|---|---|
| **Fizik** | Kuvvet ve vektör sürükleme; bileşke canlı (kaldıraç ve makara dengesi dahil) · Hareket benzetimi: sürgüyle hız ve ivme, cisim hareket eder, konum-zaman ve hız-zaman grafiği canlı çizilir; eğik atışta açı ve hız sürgüsü · Elektrik devresi: anahtar, direnç, akım ve gerilim canlı okunur · Optik ve dalgalar: ayna, mercek ve cisim sürüklenir, ışınlar canlı çizilir |
| **Matematik ve Geometri** | Geometride köşe sürükleme; açı, kenar ve alan canlı · Fonksiyon grafiği: katsayı sürgüleri, noktayı grafiğe yerleştirme · Sayı doğrusu ve aralıklar (eşitsizlik, mutlak değer, kesir) · Olasılık deneyi (zar, para, torba) ve kesir-oran modelleri |
| **Biyoloji** | Şemaya etiket sürükleme (hücre, organ, sistem) · Süreç adım adım açılır, evreler sıralanır (mitoz, mayoz, sindirim, dolaşım, fotosentez) · Kalıtım: Punnett karesini doldurma, soyağacında işaretleme · Grafik ve deney: sıcaklık ya da pH sürgüsüyle enzim ve fotosentez grafiği |
| **Coğrafya** | Haritada il, bölge ve akarsu işaretleme · Harita katmanları aç-kapa (iklim, bitki, maden, nüfus, tarım) · Dünya ve Güneş canlandırması: yörünge, gündönümü ve ekinokslarda gündüz süresi ve gölge · İklim grafiğinden tip bulma, koordinatla yer bulma, yer şeklinin oluşumu adım adım |
| **Tarih** | Zaman çizelgesine yerleştirme · Harita üstünde savaş, sefer ve cephe adım adım; sınırlar döneme göre değişir · Neden-sonuç bağlama, olay zinciri · Antlaşma maddesi ve dönem eşleme |

- **Adımın rolü:** ikisi birden. Önce anlatır: öğrenci serbestçe oynar, canlı görür. Sonra aynı sahneyle soru sorar ve cevabı denetler.
- **İçerik sırası:** TYT → KPSS → AYT.
- **Deneme:** önce yerel veritabanında seed verisiyle. İçerik üretimi sonra ayrıntılı yapılacak. Works mimarisi boş (nullable) alanlarda hata vermiyor.
- **Örnek alınan uygulamalar:** PhET (benzetimler), GeoGebra (geometri ve fonksiyon), Brilliant (kısa dokunmalı görevler), Duolingo (hızlı geri bildirim, oyunlaşma).
- **Eski uygulama sürümleri:** uyumluluk mekanizması yok; gerekirse zorunlu güncelleme.
**Kim yürütür:** "Works iyileştirilmesi" oturumu. Kararlar kesinleşince bu belgenin özü `Curriculum/Works/README.md` dosyasına katılır.
**Neden:** Google Ads "Dersler vitrini" dersleri etkileşimli ve animasyonlu göstermek istiyor (Sosyal Medya oturumu, `Desktop\Sinavika-GoogleAds\Reklam-Icerik-Ister-Raporu-2026-11-20.md` §4.5). Bugün bu gerçek değil.
**Sahibin kuralı:** reklam ve sosyal medya "animasyonlu" ya da "etkileşimli" sözünü ancak bu adımlar canlıya çıktıktan sonra söyler.

## 1. Bugün ne var

- **Görseller:** uygulamada görseller motorun çizdiği sabit resimlerdir. Mobilde `ContentFigureView` resmi uzak resim olarak (`AppRemoteImage`) gösterir, webde de durum aynıdır. Uygulama resmin içine dokunamaz, onu canlandıramaz.
- **Etkileşim:** yalnız cevap adımlarındadır: tahmin, doğru/yanlış, boşluk, eşleştirme, gruplama, dokunarak seçme, çevrilen kart, sıralama.
- **Paketler:** mobilde react-native-svg, Reanimated ve gesture-handler kurulu.
- **Veri hazır:** görsellerin hepsi veriden çiziliyor. Canlandırmak ya da etkileşime açmak için gereken bilgi dosyalarda var:

| Görsel türü | Canlıdaki sayı | En çok olduğu dersler | Verisi |
|---|---|---|---|
| `map` (Türkiye, iller) | 393 | Coğrafya (TYT, AYT, KPSS) | il adlarıyla boyanan bölgeler (`shades`), noktalar (`markers`) |
| `timeline` | 186 | Tarih (KPSS, AYT), Coğrafya | olaylar (`year`, `label`) |
| `battle` | 63 | Tarih | taraflar, birlikler, kara, deniz ve şehir şekilleri |
| `climate` | 27 | Coğrafya | 12 aylık sıcaklık ve yağış |
| `vectors` | 22 | Fizik (TYT 7, AYT 15) | okların `from` ve `to` noktaları |
| `river` | 8 | Coğrafya | profil görünümü |
| `forces` | 3 | AYT Fizik | cisim, yüzey, kuvvetler |

## 2. İlk taslak: istenen özellikler (20 Kasım; §0 ile eskidi)

| Adım | Öğrenci ne yapar | Doğru sayılması | Veri nereden | İlk kapsam |
|---|---|---|---|---|
| **Adım adım açılan görsel** (`reveal`) | Görselin parçaları sırayla belirir (olaylar, oklar, bölgeler, savaş hareketleri); öğrenci "devam" der | Soru yok, anlatım adımıdır | Görselin kendi parça sırası | Çizelge, harita, savaş, vektör görselleri |
| **Haritada işaretleme** (`mapTap`) | Haritada bir ile ya da bölgeye dokunur; doğruysa bölge boyanır | Dokunulan il cevap listesindeyse (birden çok olabilir) | `map.shades`, `markers` | KPSS ve TYT Coğrafya |
| **Zaman çizelgesine yerleştirme** (`timelineOrder`) | Olay kartlarını çizelgedeki yerlerine sürükler; yanlış bırakılan kart geri seker | Her kart kendi yılının yerine oturunca | `timeline.events` | KPSS ve AYT Tarih |
| **Kuvvet sürükleme** (`forceDrag`) | Bir okun ucunu sürükler; bileşke canlı çizilir, büyüklüğü yazılır | Bileşke hedefe tolerans içinde gelince | `vectors` | TYT FIZ_GIRIS, FIZ_HAREKET; AYT vektörler |

**Güçler ayrılığı (KPSS Vatandaşlık):** bugünkü eşleştirme ve gruplama adımlarıyla yapılabiliyor; yeni adım gerekmez. Eksikse içerik turunda eklenir.

## 3. Teknoloji (api+web+mobile ile konuşuldu, 21 Kasım)

**Seçilen yol: sabit taban resmi + parça listesi.** Çizim tek yerde, motorda kalır.

**Motor ne verir:**
- **Taban resmi:** etkileşimli parçaları çıkarılmış hâli (`still`, açık ve koyu).
- **Parça listesi (JSON):** her parçada şunlar bulunur:
  - `id` ve `name` (ör. "Ankara", "e3");
  - normalize kutu (`x`, `y`, `w`, `h`);
  - parçanın küçük resmi (sprite);
  - gerekirse sadeleştirilmiş dokunma çokgeni;
  - çizelgede olayların yuva konumları.

**Uygulama ne yapar:**
- Parçaları taban resminin üstüne koyar; saydamlık ve konumu Reanimated ile canlandırır (webde CSS geçişi).
- Dokunmayı "nokta çokgenin içinde mi" testiyle bulur.

**Neden ham SVG değil:**
- Mobilde SVG içindeki parçaya dokunma bağlanamıyor; kendi ayrıştırıcımızı yazmak kırılgan olur.
- Webde SVG'yi satır içi basmak güvenlik temizliği ister.
- 81 ilin tamamını canlı çizmek düşük uçlu Android'de takılır; bu sınıfta kullanıcımız var.
- Parça listesinde yalnız dokunulan ilin küçük resmi canlanır.

**Kurallar:**
- **Yazılar resmin içinde** (sprite ya da motorda yola dönüştürülmüş) olur. Uygulama yazı çizmez; yazı tipi ve ölçü farkı çıkmaz.
- **Küçük iller** (Yalova, Kilis, Bartın): çokgene ek olarak en az 22 pt yarıçaplı bir dokunma alanı olur.
- **Kuvvet sürükleme:** oklar az olduğu için uygulamada react-native-svg ile çizilir; bileşke cihazda canlı hesaplanır.
- **İlk sürümde olmayacaklar:** harita yakınlaştırma ve kaydırma, Lottie ya da video.

**Sözleşme:**
- **Soran adımlar yeni Works türüdür:** `MapTap = 15`, `TimelineOrder = 16`, `ForceDrag = 17`. Cevap denetimi, geri bildirim ve tekrar kuyruğu türe göre çalışır.
- **`reveal` tür değildir:** Visual adımına isteğe bağlı `reveal: {order: [...]}` alanı eklenir. Cevabı yoktur, eski uygulama bu alanı yok sayıp sabit resmi gösterir.
- **Eski uygulama sürümleri** (sahibin kararı, 21 Kasım: "uygulama hızlıca güncelleniyor, çok büyük kitlemiz yok"): uyumluluk mekanizması kurulmaz. Ek başlık ve sunucuda düşürme yoktur. Gerekirse yayında zorunlu güncelleme (`minimumVersion`) yükseltilir.
- **Çevrimdışı cevap kuyruğu** yeni cevap biçimlerini taşır: il listesi, sıra, `{x, y}`.

```jsonc
// Motor kartı (taslak). Görsel verisi bugünkü şemadır.
{"kind": "visual", "visual": {"kind": "timeline", ...}, "reveal": {"order": ["e0", "e1", "e2"]}}
{"kind": "mapTap", "visual": {"kind": "map", ...}, "prompt": "Yıllık yağışın en fazla olduğu iki ili işaretle.", "answer": ["Rize", "Artvin"]}
{"kind": "timelineOrder", "visual": {"kind": "timeline", ...}, "prompt": "Olayları yerlerine yerleştir.", "items": ["e2", "e0", "e3"]}
{"kind": "forceDrag", "visual": {"kind": "vectors", ...}, "prompt": "Bileşke 5 N olacak şekilde F2'yi sürükle.", "drag": "F2", "target": {"to": [3, -4], "tolerance": 0.25}}
```

**Kaba iş büyüklüğü (tek kişi):**

| İş | Süre | Kim |
|---|---|---|
| Motor: parça listesi, taban resmi, sprite, dokunma çokgenleri | (ölçülecek) | "Sınavika Video Engine kurulumu" |
| API: 3 tür, doğrulama, testler | ~2 gün | api+web+mobile |
| Mobil: ortak parça çizicisi, 4 özellik, çevrimdışı kuyruk, düşük uçlu Android denemesi | ~6–8 gün | api+web+mobile |
| Web: 4 özellik | ~4–5 gün | api+web+mobile |
| İçerik: kartların yazılması | 4. sorudaki karara bağlı | "Works iyileştirilmesi" |

API'nin yayını ve canlıya geçiş sahibin onayıyla yapılır.

## 4. İlk taslağın soruları (21 Kasım; §0 ile cevaplandı ya da eskidi)

1. **İlk kapsam:** önce `reveal` ve `mapTap` mi (öneri; API oturumu da aynı sırayı öneriyor), yoksa dördü birden mi?
2. **Teknoloji:** "sabit taban resmi + parça listesi" yolu uygun mu?
3. **Var olan görseller:** 186 çizelge ve 393 harita kendiliğinden adım adım açılsın mı, yoksa yalnız seçilen kartlar mı?
4. **İçerik:** soran adımlar var olan görsellerden ücretsiz kuralla mı türetilsin, yoksa Claude API ile mi yazılsın? İkincisi ücretlidir; model ve tutar ayrıca sorulur.
5. **Platform:** mobil ve web birlikte mi, önce mobil mi?
6. **Koyu tema:** parçaların resimleri açık ve koyu iki takım olarak mı üretilsin (dosya sayısı iki kat), yoksa tek renk üretilip uygulamada mı boyansın (harita vurgusu için yeterli)?
