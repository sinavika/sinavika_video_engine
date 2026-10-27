# Kamp tanıtımı: Bölüm 0

Her kampın ilk videosu "0" diye numaralanır ve kampın ilk dersinden önce yayımlanır. Konu anlatmaz; sınavı, kampı ve Sınavika'yı tanıtır. Ders şablonlarını kullanmaz. Reklam dilinde, kendine ait bir şablonu vardır: `CampIntro` ([`src/Templates/Camps/CampIntro`](../src/Templates/Camps/CampIntro)).

| Kamp | İş dosyası | Ne zaman yayımlanır |
|---|---|---|
| TYT | [`Curriculum/Jobs/yks-tyt-turkce-kampi/00-tyt-kampi-tanitim-youtube.json`](../Curriculum/Jobs/yks-tyt-turkce-kampi/00-tyt-kampi-tanitim-youtube.json) | TYT Türkçe kampının 1. dersinden (Sözcükte Anlam) önce |
| AYT | [`Curriculum/Jobs/yks-ayt-edebiyat-kampi/00-ayt-kampi-tanitim-youtube.json`](../Curriculum/Jobs/yks-ayt-edebiyat-kampi/00-ayt-kampi-tanitim-youtube.json) | AYT Edebiyat kampının 1. dersinden (Anlam Bilgisi) önce |

Render: `npm run render -- --job <iş dosyası>`. Çıktı 4K, 16:9, YouTube içindir. Seslendirmeyi SinoAI yapar (Doğa, Eleven v4). Kamp kuralı gereği müzik yoktur. YouTube bölümleri (chapters) kendiliğinden çıkar.

## 1. Şablonun yapısı

On sahne var. Her sahne kendi seslendirmesinin süresi kadar ekranda kalır ve o sırada anlatılanı çizer.

| # | Sahne | Ekranda | YouTube bölümü |
|---|---|---|---|
| 1 | Kanca | Lacivert zeminde iki-dört kısa vuruş ("120 soru." "165 dakika." "Tek bir sabah."), sonuncusu turuncu; SinoAI küresi | Giriş |
| 2 | Bölüm 0 | Dev turuncu "0", seri adı, başlık; kampın ders renklerinden bir şerit; logo | — |
| 3 | Sınav | Sınavın her sorusu bir kare: test test, ders renginde dolar; yanda test adları ve sayıları; köşede dakika halkası | Sınav nasıl? |
| 4 | Net | Dört kırmızı ✗ = üstü çizilen bir yeşil ✓; formül; boş soru kuralı; örnek hesap sayarak iner | Net nasıl hesaplanır? |
| 5 | Puan | YKS puanı tek çubuk: TYT %40, AYT %60 (anlatılan sınav turuncu); altta kartlar | Puan |
| 6 | Kamp haritası | Ders başına bir kart (ders renginde, konu sayısıyla); ilk kamp parlar; toplam sayı sayarak çıkar | Kamp haritası |
| 7 | Bir kamp dersi | Dört kart sırayla gelir: YouTube dersi, kısa video, kamp görevi, Sınavika testi | Bir kamp dersi |
| 8 | Yöntem | Üç büyük adım, bir çizgiyle bağlı | Nasıl çalışmalı? |
| 9 | Sınavika | Turuncu zeminde üç telefon (uygulama ekranları), üstlerinde modül cümlesi | Sınavika |
| 10 | Kapanış | İlk dersin kartı ders renginde, "Kanala abone ol", mağaza düğmeleri, logo | İlk ders |

İçerik doğrulanır:
- testlerin soru sayılarının toplamı sınavın soru sayısına eşit olmalı;
- "ilk kamp" kamp listesinde bulunmalı;
- ikonlar ve uygulama ekranları yalnız motorun kataloğundan seçilebilir.

## 2. Kaynaklar ve sayılar

- **Ders ve konu sayıları:** `Desktop\lesson.csv`; sahibin belirttiği güvenilir kaynak (26 Ekim 2026). `Curriculum/Production/Checklist.json` ile birebir aynı.
  - **TYT:** 10 ders, 168 konu: Türkçe 15, Matematik 23, Geometri 23, Tarih 22, Coğrafya 19, Felsefe 13, Din Kültürü 22, Fizik 11, Kimya 10, Biyoloji 10.
  - **AYT:** csv'de 15 ders kodu ve 276 satır var. Tarih-1/Tarih-2 ile Coğrafya-1/Coğrafya-2 aynı konu listesini taşıyor; bu yüzden videoda Tarih ve Coğrafya birer kamp olarak geçiyor. Felsefe 14, Psikoloji 4, Sosyoloji 6 ve Mantık 4 konu "Felsefe grubu" adlı tek kampta toplanıyor (28). Diğerleri: Edebiyat 16, Matematik 32, Geometri 16, Fizik 21, Kimya 22, Biyoloji 15, Tarih 27, Coğrafya 31, Din Kültürü 10. Toplam **218** benzersiz konu.
- **Sınav yapısı:** 2026 YKS'nin bilinen yapısı.
  - **TYT:** 120 soru, 165 dakika. Türkçe 40, Sosyal Bilimler 20, Temel Matematik 40, Fen Bilimleri 20.
  - **AYT:** 160 soru, 180 dakika. Edebiyat-Sosyal Bilimler 1: 40 (Edebiyat 24, Tarih-1 10, Coğrafya-1 6). Sosyal Bilimler 2: 40. Matematik 40. Fen Bilimleri 40 (Fizik 14, Kimya 13, Biyoloji 13).
  - **Ağırlık:** TYT %40, AYT %60.
- **Bilerek videoya koyulmayanlar:**
  - **2027 YKS tarihi:** ÖSYM 2027 takvimini henüz yayımlamadı.
  - **Baraj puanı:** Kaynaklar çelişiyor.
  - **"Ücretsiz" iddiası:** Abonelik kuralına göre ödeme olmadan erişim yok.

ÖSYM 2027 kılavuzu yayımlanınca soru dağılımları yeniden kontrol edilir.

## 3. TYT senaryosu (Bölüm 0)

**Kanca.** Yüz yirmi soru. Yüz altmış beş dakika. Ve tek bir sabah. TYT tam olarak bu. Bu videoda sınavı baştan sona tanıyacak, sonra kampı nasıl kurduğumuzu göreceksin. Hazırsan başlıyoruz.

**Bölüm 0.** Merhaba, ben SinoAI. Sınavika'nın YKS kampına hoş geldin. Bu, TYT kampının sıfırıncı bölümü. Bugün konu anlatmıyoruz; önce haritayı çiziyoruz ki her dersin nereye oturduğunu bil.

**Sınav.** TYT, yani Temel Yeterlilik Testi, YKS'nin ilk oturumu. Dört testten oluşur. Türkçe kırk soru. Sosyal Bilimler yirmi soru: tarih, coğrafya, felsefe ve din kültürü. Temel Matematik kırk soru. Fen Bilimleri yirmi soru: fizik, kimya ve biyoloji. Toplam yüz yirmi soru için yüz altmış beş dakikan var; soru başına bir dakikadan biraz fazla. Yani TYT, bilgi kadar hız ve dikkat de ister.

**Net.** Puanını belirleyen şey netin. Her doğru bir net kazandırır, ama dört yanlış bir doğruyu götürür. Boş bıraktığın soru ise hiçbir şey kaybettirmez. Mesela kırk doğru ve sekiz yanlışın varsa netin otuz sekiz olur. Bu yüzden kampta, emin olmadığın soruda şansa işaretlemek yerine şıkları elemeyi öğreneceğiz.

**Puan.** TYT puanı iki yerde işine yarar. Ön lisans tercihlerinde tek başına kullanılır. Lisans tercihlerinde ise YKS puanının yüzde kırkını oluşturur; kalan yüzde altmış AYT'den gelir. Hangi alanda olursan ol, TYT hepsinin ortak temeli.

**Kamp haritası.** Kampımız TYT'nin on dersini kapsıyor ve toplam yüz altmış sekiz konu var. Her konu için bir YouTube dersi ve bir kısa video hazırlıyoruz. Türkçe ile başlıyoruz: on beş ders. Ardından Matematik ve Tarih gelecek. Hemen her gün yeni bir ders yayınlıyoruz; düzenli takip edersen konuları sınavdan çok önce bitirirsin.

**Bir kamp dersi.** Her kamp dersi aynı düzende ilerler. Önce YouTube'da on, on beş dakikalık bir konu anlatımı; içinde ÖSYM tarzı sorular var ve her soruda düşünmen için duruyoruz. Ardından dört soruluk kısa bir video: kaçını bileceğini görürsün. Dersin sonunda sana bir kamp görevi veriyorum. Görevi de Sınavika'daki konu testiyle tamamlıyorsun.

**Yöntem.** Kampı en verimli şöyle takip edersin. Bir: dersi izle ve kısa notlar al. İki: aynı gün o konunun testini çöz; yanlışlarını dersin adımlarıyla yeniden dene. Üç: bir hafta sonra kısa videoyla konuyu tekrar et. Öğrendiğini bu üç adım kalıcı yapar.

**Sınavika.** Bu kampı Sınavika ile birlikte kurduk. Denemeler'de Türkiye geneli denemelere katılır, hangi konudan kaç net kaybettiğini görürsün. Testler'de her konu Kolay, Orta ve Zor seviyede yirmişer soruyla seni bekler. Ders Planı eksik konularını günlük görevlere çevirir. Takıldığın soruda da ben varım: soruyu adım adım çözer, konuyu sade anlatırım.

**Kapanış.** Kampın ilk dersi Sözcükte Anlam. Kanala abone ol ki hiçbir dersi kaçırma. Testlerin ve planın için Sınavika'yı App Store'dan ya da Google Play'den indir. İlk derste görüşmek üzere.

## 4. AYT senaryosu (Bölüm 0)

**Kanca.** Yüz altmış soru. Yüz seksen dakika. Ama hepsini çözmen gerekmiyor. AYT'nin ilk sırrı bu: sadece senin testlerin. Bu videoda AYT'yi baştan sona tanıyacak, sonra kampın haritasını göreceksin.

**Bölüm 0.** Merhaba, ben SinoAI. Sınavika'nın YKS kampına hoş geldin. Bu, AYT kampının sıfırıncı bölümü. TYT'de temeli attıysan şimdi alan derslerine geçiyoruz; önce sınavı ve haritayı tanıyalım.

**Sınav.** AYT, yani Alan Yeterlilik Testleri, YKS'nin ikinci oturumu. Dört testten oluşur. Türk Dili ve Edebiyatı, Sosyal Bilimler bir testi kırk soru: yirmi dört edebiyat, on tarih, altı coğrafya. Sosyal Bilimler iki testi kırk soru: tarih, coğrafya, felsefe grubu ve din kültürü. Matematik kırk soru. Fen Bilimleri kırk soru: on dört fizik, on üç kimya, on üç biyoloji. Süre yüz seksen dakika. Ama sen yalnızca puan türünün istediği testleri çözersin.

**Net.** Kural TYT ile aynı: dört yanlış bir doğruyu götürür, boş soru hiçbir şey kaybettirmez. Otuz doğru ve sekiz yanlış, yirmi sekiz net eder. AYT'de sorular daha uzun ve daha derin; o yüzden kampta süreyi testlere nasıl böleceğini de birlikte çalışacağız.

**Puan.** Hangi testleri çözeceğini puan türün belirler. Sayısal için Matematik ve Fen. Eşit ağırlık için Matematik ile Edebiyat, Sosyal Bilimler bir. Sözel için Edebiyat, Sosyal Bilimler bir ve Sosyal Bilimler iki. Dil puanı ise ayrı bir oturum olan YDT'den gelir. Hangi türde olursan ol, YKS puanının yüzde altmışı AYT'den, yüzde kırkı TYT'den gelir.

**Kamp haritası.** AYT kampında on kamp ve toplam iki yüz on sekiz konu var. Her konuya yine bir YouTube dersi ve bir kısa video. Edebiyat ile başlıyoruz: on altı ders. Sayısalcıysan Matematik, Geometri ve Fen kamplarını; sözelciysen Edebiyat, Tarih ve Coğrafya kamplarını takip et. Hemen her gün yeni bir ders yayınlıyoruz.

**Bir kamp dersi.** AYT dersleri de aynı düzende ilerler. Önce on, on beş dakikalık bir konu anlatımı ve ÖSYM tarzı sorular. Sonra dört soruluk kısa bir video. En sonda bir kamp görevi; onu da Sınavika'daki konu testiyle tamamlıyorsun.

**Yöntem.** AYT'de verimin üç adımı var. Bir: puan türünü netleştir. İki: o türün testlerine ait kampları sırayla izle ve her dersin testini aynı gün çöz. Üç: her hafta bir deneme çöz; hangi konudan kaç net kaybettiğin, bir sonraki haftanın planını belirlesin.

**Sınavika.** AYT'nin yükünü Sınavika ile hafiflet. Denemeler'de çözdüğün her denemeden sonra hangi konudan kaç net kaybettiğini görürsün. Ders Planı bu eksikleri günlük görevlere çevirir. Testler'de her konu Kolay, Orta ve Zor seviyede seni bekler. Takıldığın yerde de ben varım: soruyu adım adım çözer, kendi notlarından sana özel test hazırlarım.

**Kapanış.** AYT kampının ilk dersi Edebiyat'tan: Anlam Bilgisi. Kanala abone ol ki hiçbir dersi kaçırma. Testlerin ve planın için Sınavika'yı App Store'dan ya da Google Play'den indir. İlk derste görüşmek üzere.

## 5. Yeni bir kampa Bölüm 0 eklemek

TYT ya da AYT iş dosyası kopyalanır ve şu alanlar değiştirilir:
- `exam`, `series`;
- `anatomy`: sınavın testleri;
- `camp.lessons`: `lesson.csv`'den sayılır;
- `camp.first`;
- `closing.next`: kampın ilk dersi;
- seslendirme metinleri.

KPSS kampları da aynı şablonla açılır; KPSS'nin kendi testleri ve puan türleri yazılır.
