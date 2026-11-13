# UI/UX geçmişi: denetimler, kararlar, açık işler

15 Ekim – 14 Kasım 2026 arasındaki denetim ve revizyonların özeti. Ekim raporları 9 Kasım'da, 5 Kasım revizyonu ve 13 Kasım uyum raporu 14 Kasım'da bu dosyaya katıldı; ayrıntılı ilk sürümleri git geçmişinde. Güncel kurallar [UIUX-Rehberi.md](UIUX-Rehberi.md), [Modul-Kimligi.md](Modul-Kimligi.md), [Adlandirma-Kurallari.md](Adlandirma-Kurallari.md), [Tablet-Kalem.md](Tablet-Kalem.md), [UX-Kurallari.md](UX-Kurallari.md), [Hareket-Standardi.md](Hareket-Standardi.md) ve [Ekran-Envanteri.md](Ekran-Envanteri.md) dosyalarındadır.

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

## 4. Revizyon: Bugün düzeni ve yeni ekranlar (5 Kasım)

**Kaynaklar:** canlı test ekran görüntüleri (`Desktop\sinavika-ss-canli-20261103`, 3–4 Kasım), sahibin gönderdiği örnek uygulamanın dört ekranı, mobil kod (yalnız okundu).

**Örnekten alınan:** yalnız bilgi düzeni; markası, rengi, maskotu ve koç özelliği alınmadı.
- Ana ekran önce "bugün" sorusunu cevaplar: hafta şeridi, günün planı ve sıradaki görev, iki eylem kartı, sonra modüller. Modül slayt karuseli kalktı (sahip onayı).
- Görev kartı "nereden, ne, ne kadar" söyler; her kartta tek fiil (Başla, Devam et, Hatırlat, Teslim et).
- Sonuçlar: net sütunları, üç giriş ve **Deneme ekle** (dışarıda çözülen deneme).
- İlk hafta: sıfır duvarı ("0 dk") yerine ilk üç adım.
- Renk kuralı değişmedi: modül rengi modülde, turuncu marka yüzeylerinde.

**Çizilenler:**
- Mobilde 5 ekran yerinde revize edildi (`m-hub-moduller`, `m-hub-moduller-kaydir`, `m-hub-ipucu`, `m-plan-bugun`, `m-deneme-sonuclar`).
- Mobilde 17 yeni ekran çizildi: görev ekle ve işlemleri, teslim onayı, biten deneme, deneme ekle, Dersler adımları (Grupla, Eşleştir, Çevir, Seç, Çoklu, Yazmalı, Formül, Bölüm başı), yanlışlarım, istatistiklerim ve ilk hafta.
- Canlı hatalar ve UX notları bu ekranlarda kapatıldı: kutuda kesilen metin, formül çizimi, gri Android penceresi, biten denemede "Denemeye gir".
- Durum ekranları da çizildi (sahip: "boşluk kalmasın"). Kural [UIUX-Rehberi.md](UIUX-Rehberi.md) §5.5'te.

## 5. Üç platform tek yapı (8 ve 12 Kasım)

**8 Kasım** (sahip: "tablet, web, mobil birbiriyle uyumlu"):
- Ortak parçalar `Parts/Study.tsx`'e taşındı; ders adımları web ve tablet oynatıcısında mobilin çizimiyle gelir (`EmbedStep`).
- Fikir görsellerinden ölçü kartı, yığılı sütun ve değer kutusu, halka, en verimli saatler ısı haritası alındı. Renkleri, "Premium" çağrısı ve dil seçici alınmadı.
- Web'in eski ana sayfa, plan günü, sonuçlar ve istatistik çizimleri silindi; `w-deneme-istatistik` artık `w-istatistik`. Tanıtım şablonları (`src/Templates`) eski adlarla yeni çizimleri gösterir.

**12 Kasım** (sahip: "yüzde yüz uyum"):
- Tam ekran tablet, web sayfasının kendisini gösterir (`PanelInTablet`); ayrı yazılmış tablet kopyaları silindi (`t-test-cozumler-iki-panel` artık `t-test-yanlislar`).
- Eşlik testi her özelliği ve hâli üç platformda ister. Kural [UIUX-Rehberi.md](UIUX-Rehberi.md) §5.7, tablete özgü kalanlar [Tablet-Kalem.md](Tablet-Kalem.md) §6.

## 6. API · mobil · web uyum denetimi (13–14 Kasım)

**Kapsam:** salt okuma. API (102 denetleyici, 844 uç), mobil ve web istemcileri, tasarım kayıt listesi.

**Bulgular:**
- Mobil ve web'in çağırdığı bütün yollar API'de var; tek istisna aşağıdaki transcript fonksiyonu.
- Tasarım belgelerindeki "yeni API gerekir" notları eskimişti. Dış deneme, görev nedeni ve miktarı, en verimli saatler, modül payları, zorunlu güncelleme, Testler ve Dersler'de kalem API'de zaten vardı.

**Tasarım tarafında kapatılanlar (14 Kasım):**
- Eskimiş notlar düzeltildi.
- Kayıt listesindeki 46 rota uygulamanın gerçek adına çevrildi; web sayfa yollarında eşleşmeyen kalmadı.
- Uygulamada olup çizimi olmayan 10 mobil ve 11 web ekranı çizildi; metinler uygulamaların Türkçe kataloglarından.
- Sınava kalan gün örneği her yerde 245.

**Bilinçli ayrımlar (sorun değil):**
- Bildirimler, ödeme (web iyzico, mobil mağaza), misafir girişi ve hesap birleştirme platforma özgü.
- Zorunlu güncelleme yalnız mobilde.

## 7. Hâlâ açık olanlar

**Sahibin kararı ya da onayı gerekenler:**
- **SQL 13:** 2.511 testin adından "tarama"yı kaldırır; canlı veritabanına yazar.
- **Denemede cevap değiştirme:** gerçek sınavdaki gibi değiştirilebilsin mi? API değişikliği gerektirir.
- **Tüm modüller sayfası:** `w-panel-moduller` çizili, web'de `/student/moduller` sayfası yok. Ya web ekibi sayfayı ekler ya çizim kaldırılır.
- **8 Kasım ekran karşılaştırmasının bulduğu çelişkiler** (rapor `Desktop\Sinavika-UIUX3\docs\Ekran-Karsilastirma-2026-11-08.md`):
  - Konu tek ders olarak kesintisiz mi akacak? Öyleyse bölüm başı ve mikro ders bitti çizimleri (`m-ders-bolum`, `m-ders-mikro-bitti`, `w-ders-mikro-bitti`) konu düzeyine çevrilir.
  - Onboarding'de sıra: çizim "plan → hesap → 3 gün ücretsiz → ilk mikro ders", rapordaki karar "sınav → kısa sorular → ödeme".
  - Dersler ve Testler ana ekranında halkalı ızgara mı (27 Ekim kararı), çubuklu liste mi?
  - Eski yönlendirme rotalarının silinmesi ve mobilde genel arama.

**Mobil ekip:**
1. **Denemeden çıkma:** web "Kaydet ve çık", mobil "teslim etmeden çıkarsan deneme iptal olur" (`exitCancels`). API kaldığı yerden devamı destekliyor (`GET student/exams/attempts/{id}/state`). Mobil, web gibi devam ettirmeli.
2. **Testte cevap:** mobil seç + "Cevapla"; web ve tasarım tek dokunuş.
3. **Ölü fonksiyon:** `fetchLensSessionTranscript` API'de olmayan bir uca bağlı ve hiçbir ekrandan çağrılmıyor; silinmeli ya da API'ye uç eklenmeli.
4. **Bilgi Kartları sayısı:** web toplam yeni kartı, mobil bugünün tekrarını söylüyor. Tasarım ikisinde de "bugün tekrar zamanı gelen" sayısı. Web de bu sayıya geçmeli.
5. **Revizyon ekranlarının sırası:**
   - önce Bugün ana ekranı ve Ders Planı · Bugün;
   - sonra canlı hataları kapatan ekranlar;
   - sonra istatistikler ve ilk hafta;
   - sonra görev ekle ve işlemleri.
   Tabletteki açık işler [Tablet-Kalem.md](Tablet-Kalem.md) §4'te.
6. **Kalem renkleri:** kod paletinde turuncu var; tasarımda yok ([Tablet-Kalem.md](Tablet-Kalem.md) §3.2).
7. **Mikro dersten çıkış:** "İlerlemen kaydedildi" kısa bildirimi yok.

**Web ekibi:**
- Çözüm sayfasında kalem notlarını salt okunur göstermek (`student/notes`).
- Profile "Geri bildirimlerim" ve şifre değiştirme eklemek; mobilde ikisi de var.
- Deneme çözerken çevrimdışı cevap kuyruğu ve "cevapların saklanır" metni.

**API ekibi (kullanılmayan uçlar):**
- `student/preference/*`;
- eski `studentexam/exams/*`;
- `studentsubscriptionpackagemobile/ad-free/*`;
- `studentevent/event-bus-info`, kök `studentsupport`, `studentprofilenotification` GET;
- `api/students/statistics` takma adı (eski mobil sürüm mağazadan kalkınca).

**API'ye sorular:**
1. Kayıt şifresiz (yalnız kod ve ad) yapılabiliyor mu? Yapılamıyorsa şifre adımı geri gelir.
2. Testteki sorudan mikro derse geçmek için `lessonMikroId → workMikroId` eşlemesi gerekiyor.
3. SinoAI `work_generate` aracı API planına göre kalkıyor, ama kodda duruyor.

**Elle yapılacak tur:** VoiceOver ve TalkBack ile gerçek cihazda bir denemenin baştan sona denenmesi.

**Eksik kanıt:** "Kusursuz" demek için gerçek öğrenci testi ve huni verisi gerekiyor; ikisi de henüz yok.
