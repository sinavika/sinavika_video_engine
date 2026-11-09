# UI/UX geçmişi: denetimler, kararlar, açık işler

15–29 Ekim 2026 arasındaki dört raporun özeti (9 Kasım'da tek dosyada toplandı; ayrıntılı ilk sürümleri git geçmişinde). Güncel kurallar [UIUX-Rehberi.md](UIUX-Rehberi.md), [Modul-Kimligi.md](Modul-Kimligi.md), [Adlandirma-Kurallari.md](Adlandirma-Kurallari.md) ve [Ekran-Envanteri.md](Ekran-Envanteri.md) dosyalarındadır. 3 Kasım sonrası işler: [UX-Kurallari.md](UX-Kurallari.md), [Revizyon-2026-11-05.md](Revizyon-2026-11-05.md), [Tablet-Kalem.md](Tablet-Kalem.md).

## 1. İlk denetim (15 Ekim)

**Kapsam:** mobil uygulama (47 ekran görüntüsü), web paneli ve site (85 ekran görüntüsü), API özellik envanteri.

**Bulgu:** Özellikler olgun; öğrenciyi yoran **yön bulma**.
- Aynı şeyin birden çok adı ve yeri vardı: web'de 13 düz menü maddesi, deneme için 5 ayrı menü.
- Açılışta "şimdi ne yapmalıyım?" sorusunun cevabı yoktu.
- İlk değer geç geliyordu: 11 adımlık onboarding'in hemen ardından ödeme.
- Kart dili tekrarlı ve düzdü.
- Ham sistem durumları kullanıcıya sızıyordu: "Not Found", GUID dosya adları, sonsuz yükleniyor.

**Yeniden tasarımın ilkeleri** (bugün de geçerli):
1. Bir ekran, bir sonraki adım; her ekranda tek birincil eylem.
2. Her yerde aynı modül, aynı yer, aynı ad.
3. Önce değer, sonra istek: plan önce, hesap sonra, ödeme en son.
4. Sayının yanında yorum ("+6,5 net, hedefe 3 hafta erken").
5. Renk anlam taşır: modül rengi yön bulmadır; yeşil, sarı ve kırmızı yalnız durum için.
6. Boş, yükleniyor, hata ve çevrimdışı durumlar tasarlanır.
7. Heyecan abartısız olur: konfeti ve sahte aciliyet yok.

**Başarı ölçütleri** (olaylar `Adlandirma-Kurallari.md` kalıbında):
- onboarding tamamlama;
- ilk değere süre;
- D1/D7/D30 dönüş;
- "Bugünün adımı" kullanımı;
- yön bulma (geri tuşu);
- deneme süresinden ücretliye geçiş;
- "bulamıyorum" destek talepleri.

## 2. Değerlendirme ve düzeltmeler (25 Ekim)

**Değerlendirmenin cevabı: "İyi, ama kusursuz değil."** Modül kimliği, sabit alt çubuk, "Bugün ne çalışalım?" girişi ve koyu tema 15 Ekim'deki sorunları çözdü. Kalanlar dört gruptu:
- denemede cevapların anında boyanması;
- sayı ve ad tutarsızlıkları;
- erişilebilirlik;
- masaüstü web'de boş alan.

**Aynı gün kapatılanlar** (mobil, web ve API'de, tasarım setiyle):
- **Deneme:** sınav provası gibi; cevaplar sonda boyanıyor.
- **Ders Planı:** tek sayı.
- **Test seviyeleri:** Kolay, Orta, Zor.
- **Erişilebilirlik:**
  - dokunma alanları ve ekran okuyucu etiketleri düzeltildi;
  - soluk metin `#5F6B7D` oldu, her açık zeminde en az 4,86:1;
  - modül rengindeki metin kontrastı düzeltildi.
- **Diğer:**
  - SinoAI üretim sonucu ekranı;
  - geniş ekran web düzeni;
  - giriş ve kayıt sayfasında tanıtım alanı.
- **Ad tutarlılığı (26 Ekim):** SinoAI üretimlerinin durduğu yerin tek adı **Kütüphane** (Tuğçe'nin incelemesi).

## 3. İnceleme ve uygulama (29 Ekim)

**Üç sorun bulundu:**
- Dersler'in yarısı, Works v4'ün kaldırdığı ekranları çiziyordu.
- Ortak parçalar modülü bilmediği için her yer turuncuydu.
- Düğme yazıları 4,5:1 kontrastın altındaydı.

**Sahibin kararları ve uygulananlar** (yalnız tasarım: `src/UIUX`, belgeler, masaüstü seti):

| Karar | Uygulanan |
|---|---|
| Dersler sekmeleri | Dersler · Konular · Tekrar |
| Turuncu düğme | Dolgu `#C2410C`; logo ve simgeler `#EA580C` |
| Logo | Yalnız Modüller ana ekranında ve marka ekranlarında; web menüsündeki logo kalır |
| Denemeler rengi | Turuncu kaldı; turuncu tek modül Denemeler |
| Onboarding | Soru yok, plan 6. ekranda, tur kalktı; bildirim izni ilk mikro dersten sonra |

**Dersler (Works v4):** 12 eski ekran silindi. Yeni akış mobilde 17, web'de 13 ekran (`m-ders-*`, `w-ders-*`).

**Renk:**
- Ortak parçalar rengi bağlamdan alır (`useAccent`).
- Her modülün düğme rengi (`moduleAction`) beyaz yazıyla 4,5:1 tutar.
- Test, iki şeyi denetler: Denemeler dışındaki modüllerde turuncu yok, düğme kontrastı 4,5:1.

**Diğer:**
- Test yanlış cevap ekranı.
- Ders Planı "Bugün tekrar" kartı.
- Site paketlerinden "Ücretsiz ₺0" çıktı.
- Seçili durumlar çerçeve ve tikle gösteriliyor.
- Bildirim rozeti kırmızı.

### Web, mobil ve API ajanına devir notu (29 Ekim)

- **Ekran yolları:** `Desktop\Sinavika-UIUX3\ders-v4\…` artık yok; Dersler ana setin içinde: `acik/mobil/m-ders-*.png`, `acik/web-panel/w-ders-*.png`, koyu tema `koyu/` altında.
- **Eski kimliklerin karşılığı:**

  | Eski | Yeni |
  |---|---|
  | `m-dersv4-1` | `m-ders-konu-girisi` |
  | `m-dersv4-2` | `m-ders-tanim` |
  | `m-dersv4-3` | `m-ders-tahmin` |
  | `m-dersv4-4` | `m-ders-bosluk` |
  | `m-dersv4-5` | `m-ders-dogru-yanlis` |
  | `m-dersv4-6` | `m-ders-soru` |
  | `m-dersv4-7` | `m-ders-sirala` |
  | `m-dersv4-8` | `m-ders-mikro-bitti` |
  | `m-dersv4-9` | `m-ders-konu-sonu` |
  | `m-dersv4-10` | (sesli yanıt) API gelince çizilir |

  Web karşılıkları: `w-ders-konu-girisi`, `w-ders-tanim`, `w-ders-soru`, `w-ders-akis`, `w-ders-tahmin`, `w-ders-mikro-bitti`.
- **Renk kuralı:**
  - modül içinde birincil düğme modülün düğme rengi ([Modul-Kimligi.md](Modul-Kimligi.md) §2);
  - modül dışındaki marka düğmesi `#C2410C`;
  - başka modülü açan düğme o modülün renginde.
- **Akış farkları:**
  - boşluk doldurma tek denemelik;
  - TYT sorusunda "Bir ipucu daha" düğmesi yok;
  - mikro ders sonunda "Kartlarıma ekle" yok;
  - günlük konu hakkı bitince alt sayfa açılıyor (`m-ders-hak`).
- **Onboarding:**
  - "Netimi bilmiyorum" seçilirse plan, sınavın ortalama netiyle kurulur;
  - hub turu tek ipucu (`m-hub-ipucu`, web'de `w-panel-tur`).

## 4. Hâlâ açık olanlar

**Sahibin kararı ya da onayı gerekenler:**
- **SQL 13:** 2.511 testin adından "tarama"yı kaldırır; canlı veritabanına yazar.
- **Denemede cevap değiştirme:** gerçek sınavdaki gibi değiştirilebilsin mi? API değişikliği gerektirir.

**API'ye sorular:**
1. Kayıt şifresiz (yalnız kod ve ad) yapılabiliyor mu? Yapılamıyorsa şifre adımı geri gelir.
2. Testteki sorudan mikro derse geçmek için `lessonMikroId → workMikroId` eşlemesi gerekiyor.
3. SinoAI `work_generate` aracı API planına göre kalkıyor, ama kodda duruyor.

**Elle yapılacak tur:** VoiceOver ve TalkBack ile gerçek cihazda bir denemenin baştan sona denenmesi.

**Eksik kanıt:** "Kusursuz" demek için gerçek öğrenci testi ve huni verisi gerekiyor; ikisi de henüz yok.
