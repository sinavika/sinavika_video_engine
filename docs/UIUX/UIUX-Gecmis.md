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
- Test, iki şeyi denetler: Denemeler dışındaki modüllerde turuncu yok, düğme kontrastı 4,5:1. (17 Kasım 2026: Denemeler zeytin yeşiline geçti; istisna kalktı, test bütün modüllere bakar.)

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

## 6b. Sahip kararları: Bugün ve Dersler (17 Kasım)

Uygulama oturumu ("api+web+mobil", web deposu `docs/UIUX/Tasarim-Uyum-Plani.md` §9.1 madde 6–7 ve §9.3) sahibin kararlarını iletti; çizim ve Kodlama belgeleri buna göre düzeltildi. Sahip bunları tasarım hatası saydı; tekrarlanmaması için kurallar UIUX-Rehberi §0 "Tasarım hataları"nda.

- **Bugün:** selamın üstünde tarih yok; mobil ve tablette hedef selamın karşısında, seri telefonda hedefin altında, tablette yanında; web ve tablette her satır aynı 1,3 / 1 sütunu izler, aynı satırdaki kartlar eş boy; web seri "Paylaş" düğmesi; tablet Modüller kartında "Tümü" yok, SinoAI ve Destek altta yan yana; Akıllı Özet kutusunda ve web Tüm modüller sayfasında "Bu ay 7 / 30" yok; deneme kartındaki kişi sayısı 100'ün altında yazılmaz; yüklenirken kayma yok.
- **Dersler:** konu tek derstir (1 Kasım kararı yeniden onaylandı). Kaldırılan çizimler: `m-ders-konu-girisi`, `w-ders-konu-girisi`, `m-ders-bolum`, `w-ders-bolum`, `t-ders-bolum`, `m-ders-mikro-bitti`, `w-ders-mikro-bitti` (PNG'leri Geri Dönüşüm Kutusu'nda, kayıt `Outputs/Checks`). İlerleme konu boyunca tek çubuk ("Adım x / y"); web oynatıcısında sol zaman çizelgesi yok; "mikro ders" hiçbir metinde yok (test bunu denetler). Eklenenler: konu sonu ekleri (paylaş, "Konuyu baştan oku", "Konulara dön", ilk denemede doğru, anket), Konular'da ders hapları ve "Tümü / Süren / Biten" süzgeci, Sırala'da sürükleme, vitrinde kaydırılan slaytlar ve modül istatistik kartı, ortak "gönderilecek" notu (`m-ders-baglanti`, `PendingSyncNote`).
- **Adım türü adı:** "TYT tarzı soru" → "Sınav tarzı soru" / "Exam-style question".
- **Tekrar süresi:** API'de (`reviews/summary` → `estimatedMinutes`; adım 45 sn, kart 15 sn, yukarı yuvarlanır).
- **Testler:** dersler çubuklu liste (27 Ekim halkalı ızgara kararı kalktı; §7'deki açık soru kapandı); mobil vitrin kaydırılan slaytlar + noktalar; seviye ekranında ders çipleri, "Bu dersteki haftan" kartı ve satır düğmeleri (Tekrar / Devam et / Başla / kilit); mobil Konular bütün derslerin açılır ağacı; Yanlışlarım'da "Bu soruyu paylaş" ve "SinoAI'ye sor"; soru işaretleme (`FlagButton`) çözme ekranında ve Yanlışlarım'da; Çözümler'de "İşaretli" ve "Yanlışlarından tekrar testi" kalır; tablet şekilli soruda "Cevapla" kalktı, tablet yanlış cevapta "Devam" var.
- **Testler uç hâlleri (17 Kasım, §9.3 madde 12–14):** Yanlışlarım son yanlışta "Bitti" (`m/w/t-test-yanlislar-son`); yanlış yoksa ilk boş, o da yoksa 1. soru "Tümü" ile (`m-test-yanlislar-dogru`); içi boş süzgeç soluk ve dokunulmaz; web/tablet ızgarası bütün sorular, telefon numara satırı yalnız süzgeç. Çözümler › İşaretli (`m/w-test-cozumler-isaretli`), bitmemiş testin sorusu "Test bitince açılır"; web Çözümler'de süzgeç ve tekrar testi kartı; tekrar testi satırı "Konu · Tekrar". Testler çevrimdışı notu ve "Testi bitir" uyarısı (`m-test-baglanti`, `m-test-bitir-bekliyor`, `w-test-baglanti`). Web ders sayfasında ders çipleri yok, "Tüm dersler". Kalıcı kural: UIUX-Rehberi §0 "Uç hâller de çizilir".
- **18 Kasım (plan §9.1 madde 15–16, §9.3 madde 22–23):**
  - **Modül sırası:** Ders Planı, Dersler, Testler, Denemeler, Bilgi Kartları, Akıllı Özet, SinoAI (`MODULE_ORDER`).
  - **Web kabuğu:**
    - Üst çubuk ve sol menü tek yüzey; içerik ayrı yüzey, sol üst köşesi 26 px.
    - Arama ortada; zil, destek ve hedef çipi üst çubuktan kalktı.
    - Logo 68 px satırda; altta "Çıkış yap" ve daralt düğmesi.
  - **Web ana sayfa:** hedef ve seri selamın karşısında, aynı satırda.
  - **Yükleme hâli:** ortada tek logo; geç kalan kart boş çerçeve olarak durur; kartın içinde logo dönmez.
  - **Profil ve abonelik:** `m-hakkinda-lisanslar` eklendi; web abonelikte altta paket seçimi var.
  - **Site:**
    - Üst menüde "Sınavlar" yok; `s-sinavlar` çizimi kaldırıldı (kayıt `Outputs/Checks/Temizlik-2026-11-18-UIUX-Sinavlar.md`).
    - Alt bilgi beş sütun: Kaynaklar sütunu ve "Çerez tercihleri" eklendi; ödeme logoları ve ETBİS var, dil listesi yok.
    - Paketler: sınav çipleri ve Aylık/Yıllık, aynı kartlar, rozet yok.
    - Blog: 12 yazı ve "Daha fazla yazı"; arama çiplerin sağında.
    - Hakkımızda: sayı satırı yok.
- **18 Kasım, bildirim, destek ve durumlar (plan §9.3 madde 24):**
  - **Destek:** karşılama kartı düz `action`, gradyan yok; süre vaadi yok ("Talebini aç, yanıtı e-postana ve buraya gelsin."). Konular API'nin altısı (Öneri yok); Taleplerim'de uzun konu adı. Yeni talepte 72 pt ekran görüntüsü kutuları ve kaldır düğmesi, en çok 3; e-posta alanı yok. Talep detayında "Çözüldü" metin düğmesi; talep no kimliğin ilk 8 hanesi. Web için sayfa içi yeni talep formu eklendi (`w-panel-destek-yeni`).
  - **Geri bildirimlerim:** yıldız kartı ve soru hata bildirimi kalktı; yalnız içerik tepkileri ve SinoAI işaretleri.
  - **Bildirimler:** son iki gün başlıksız, sonra "BU HAFTA" ve "DAHA ÖNCE"; haftalık özet nötr grafik simgesi; boş kutuda yeşil zil.
  - **Alt sayfa başlığı (B5):** `AppHeader` üç sütun; başlık her zaman ortada, 40 pt yuvarlak geri, modalda çarpı.
- **18 Kasım, giriş ve onboarding (plan §9.1 madde 18, §9.3 madde 25):**
  - **Akış:** "Planın hazır" ayrı adım kalır (mobil 5/5, web 5/6); `m-onb-6-hesap` kaldırıldı (mobilde satın alma hesapsız). Ödemeden sonra ana ekran. "Planın hazır" ilk görev kartında ok yok, düğme "Devam et". Web'de "Şimdilik paket seçme" kalktı.
  - **Giriş:** mobil e-posta + şifreyle açılır, "E-postama kod gönder" ikincil; `m-kayit-bilgiler` kaldırıldı. Web kayıtta "En az 6 karakter", işaretsiz ticari ileti (İYS) kutusu; giriş ve kayıt altında yasal satır.
  - **Misafir alt sayfası:** tek görünüm, marka tonunda kişi simgesi; "Devam etmek için hesabın olsun".
- **18 Kasım, iPhone Duo (sahip: "iphone duo için tüm ekranların uı ux lerini çiz eksiksiz detaylı"):** Apple'ın katlanabilir telefonu iPhone Duo (9 Eylül 2026) için bütün ekranlar çizildi; belge [Kodlama/12-iPhone-Duo.md](Kodlama/12-iPhone-Duo.md).
  - **Ölçüler:** dış ekran 678 × 466 (telefon düzeni), iç ekran 890 × 626 enine ve 626 × 890 dik (tablet düzeni).
  - **Apple kuralı:** dış ekranda ve enine iç ekranda ada, durum, araç ve sekme çubuğu sağ kenarda tek dikey şeritte.
  - **Çizimler:** 152 dış ekran (`f-dis-*`), 100 iç ekran (`f-ic-*`; telefon akışları ortada 430 pt sütun), 5 poz (yarı açık, dik, taslak kâğıdı). Ana çizimlerden üretilir.
  - **Dış ekranda iki sütun:** sığmayan içerik ikiye bölünür, şıklı ekranlarda soru solda, şıklar sağda.
  - **Kalem yok:** taslak parmakla çizilir (Kaydır / Çiz).
  - **Mağaza:** `iphone-duo-dis-ekran` 2034 × 1398 (kapalı Duo), `iphone-duo-ic-ekran` 2853 × 2007 (açık Duo + kapalı Duo).
  - **Düzeltme:** öğleden sonraki söylenti ölçülü taslak (`katlanabilir`, 474 × 696 / 904 × 640) kaldırıldı.
- **19 Kasım, iPhone Duo ölçü düzeltmesi (mac-iphone, Xcode 27.2 simülatörü; sahip: "Evet, düzelt"):** 18 Kasım ölçüleri tanıtım haberlerindendi ve yanlıştı.
  - **Doğru ölçüler:** dış ekran **dik** 466 × 678 (içerik 382 × 644), iç ekran 951 × 669 (içerik 867 × 635), dik tutuşta 669 × 951. App Store görüntü boyutlarının üçte biriyle aynı.
  - **Şerit:** sağdaki 84 pt şerit iOS'un güvenli alanıdır; ada, saat ve durum simgelerini iOS çizer. Bizim olan yalnız sekme ve araç simgeleri. Altta 34 pt güvenli alan.
  - **Dış ekranda iki sütun kalktı:** dış ekran telefondan biraz kısa; sayfa tek sütun ve kayar, çizim sayfanın üstünü gösterir.
  - **Yarı açık:** kat 951 / 2'de; sağ bölme 357 pt. Deneme taslak pozunda alt çubuk katın solunda kalır (üç baloncuk, Boş bırak yok).
  - **Mağaza:** `iphone-duo-dis-ekran` artık dik 1398 × 2034; `iphone-duo-ic-ekran` 2853 × 2007 yeni iç ekranla. 32 görsel yeniden üretildi; Sosyal Medya Yönetimi'ne bildirildi. Dış ekranda cihazın altı kesiliyordu (Sosyal Medya fark etti): cihaz artık altta GAP.bottom boşlukla, tamamı görselde; `StoreShotCheck` alt kenar kontrolü artık Duo dahil her cihaz görselinde çalışıyor.
  - **Gözle denetim düzeltmeleri (sahip: "problemli olarak düzeltilmesi gerekenler var onları düzelt"):**
    - Karşılama (`m-giris-karsilama`, `f-dis-`/`f-ic-giris-karsilama`): kart yığınının kutusu kartların gerçek boyuna göre (kart ~210 pt) ayarlandı; son kart başlığa değmiyor. Telefonda da değiyordu. Kısa ekranlarda (678 ve 669 pt) kartlar daha sık dizilir.
    - Yanlışlarım (`f-ic-test-yanlislar`, `-son`): tablet boyutlu sayfada sol kart 270 pt, numaralar 36 pt; beşinci sütun ve "Tümü · 20" artık kartın içinde.
    - Deneme taslak kâğıdı (`f-ic-deneme-taslak`): iç ekranda taslak 400 pt, soru 17 pt; alt çubuk üç baloncuk, Boş bırak yok. Alt çubuk artık kartın içinde, ekran altında kesilmiyor.
  - Zip'e gerek kalmadı; iki Duo zip'i Geri Dönüşüm Kutusu'nda.
  - **Katlanma bölgesi 40 pt** (mac-iphone simülatörde ölçtü: x 455,5–495,5; önce 24 pt çizilmişti). Sağ bölme 349 pt, bölmeler arası boşluk katın kendisi; sol bölme artık katın üstüne hiç taşmıyor (24 pt'de 0,5 pt taşıyordu). Odak sayfalarının üst çubuğu katta ikiye bölündü (ilerleme çubuğu katı geçiyordu); yarı açık taslakta yazılar %80'e küçüldü (kalem araç çubuğunun altında kalıyordu).
  - **Dış ekran araçları 180 pt'den** (mac-iphone: iOS'un sistem öğeleri `reservedRegions(.occlusion)` ile 174 pt; 132 pt Wi‑Fi halkasıyla çakışıyordu). 152 dış ekran, panolar ve dış ekran mağaza görselleri yeniden üretildi; Sosyal Medya'ya bildirildi.
  - **Şeritte çift Profil kalktı** (Sosyal Medya fark etti): sekmeli modül ekranlarında Profil hem üst araçlarda hem alttaki sekmelerdeydi. Artık yalnız altta; üstte yalnız Zil. Modüller hub'ında (sekmesiz) Profil üstte kalır. Dış ekranlar, panolar ve dış ekran mağaza görselleri yeniden üretildi.
- **20 Kasım, web sitesi giriş öncesi sayfalar (sahip, api+web+mobile oturumu aracılığıyla: "ürün detay sayfasında özelliklerle alakalı görsel de yok, anlatım da yok … UI/UX'ten yeni çizimler iste, daha iyi ve daha kapsamlı olsun"; Paketler: "YKS diyor; TYT mi AYT mi belli değil. KPSS için 3 paket gözüküyor"):**
  - **Ürün detay şablonu**, 7 modül (`s-urun-ders-plani` … `s-urun-sinoai`):
    - giriş (web ve telefon), nasıl çalışır (her adımın ekranı);
    - 4–6 özellik, metin ve ekran dönüşümlü, yakın çekimli;
    - somut örnek, diğer modüller, SSS, çağrı.
    - Metin ve ekran eşlemesi `Screens/Site/SiteContent.ts`; test `tests/UIUX/SiteContent.test.ts` (ürün dili kuralları, her görsel gerçek çizim).
  - **Hakkımızda:** misyon, yaklaşım, 7 modül, sınavlar, değerler, şirket bilgileri, SSS. Metin kurulum oturumundan gelecek, düzen hazır.
  - **İletişim:** kanal kartları, destek formu, Destek Merkezi yönlendirmesi, şirket bilgileri ve harita.
  - **SSS** ayrı sayfa oldu (`s-sss`).
  - **Sınav ve deneme sayfası şablonları:** `s-sinav-yks`, `s-deneme-sinavi`. YDT çıkarıldı.
  - **Paketler:**
    - sınav → (KPSS türü) → süre → tek kart; yıllık varsayılan, "%45 tasarruf";
    - karşılaştırma tablosu;
    - `s-paketler`, `s-paketler-kpss`.
  - **Altyapı:**
    - Her site sayfası telefon genişliğinde de çiziliyor (`siteNarrow`, `-mobil`, 390 pt).
    - Denetim sayfa boyunu ölçüyor (`sayfa boyu`); footer tuvalin altına sabit.
    - Chrome'un 16.384 px sınırı için uzun resimlerin ölçeği küçülüyor. Telefon sayfaları bu yüzden yaklaşık 2× yazılıyor.
  - **Kalkan çizimler:** `s-urun-ozet`, `s-sss-iletisim`. Belge: [Kodlama/14-Web-Sitesi.md](Kodlama/14-Web-Sitesi.md).
- **20 Kasım, sınav kişisi (Sosyal Medya, Google Ads):** reklam yalnız kendi sınavını gösterebilir. Çizimlere `exam` kişisi eklendi: yks, kpss (TR); sat, act (EN).
  - Kişiye göre değişenler: sınav ve deneme adları, dersler, puanlar, ders adımları, kart, Akıllı Özet ve SinoAI sorusu, sınav takvimi.
  - Veri `src/UIUX/ExamPersona.ts`; test `tests/UIUX/ExamPersona.test.ts`; dışa aktarma `--exam`.
  - Varsayılan İngilizce (SAT) düzeldi:
    - ders adımları Türkçeydi, artık İngilizce;
    - SAT ekranlarında "TYT score", "net" ve TYT dersleri vardı, kalktı;
    - sonuç grafiği sekmesinde ACT yazıyordu.
  - Web sınav takvimi yalnız kişinin sınavını gösterir; YDT ve KPSS satırı kalktı. Ayrıntı: [Kodlama/README.md](Kodlama/README.md) §2.
- **Vitrin istatistik kartı:** her modül vitrininde aynı çerçeveli kart (`ModuleWeekCard`). **Çevrimdışı:** adım kilitli + nötr satır (`PendingSyncNote`), Testler ve Denemeler de aynı. **Web `/student/ders-cal/ders`** Konular sekmesi; `w-ders-dersler` kaldırıldı.
- **Deneme çıkışı:** mobil de kaldığı yerden devam ettirir ("Ara ver"); arka planda 5 dakika sonra otomatik bitirme kalkar.

## 7. Hâlâ açık olanlar

**Sahibin kararı ya da onayı gerekenler:**
- **SQL 13:** 2.511 testin adından "tarama"yı kaldırır; canlı veritabanına yazar.
- **Denemede cevap değiştirme:** gerçek sınavdaki gibi değiştirilebilsin mi? API değişikliği gerektirir.
- **Tüm modüller sayfası:** `w-panel-moduller` çizili, web'de `/student/moduller` sayfası yok. Ya web ekibi sayfayı ekler ya çizim kaldırılır.
- **8 Kasım ekran karşılaştırmasının bulduğu çelişkiler** (rapor `Desktop\Sinavika-UIUX3\docs\Ekran-Karsilastirma-2026-11-08.md`):
  - ~~Konu tek ders olarak kesintisiz mi akacak?~~ Kapandı (17 Kasım 2026): evet; bölüm başı, mikro ders bitti ve konu girişi çizimleri kaldırıldı (§6b).
  - Onboarding'de sıra: çizim "plan → hesap → 3 gün ücretsiz → ilk mikro ders", rapordaki karar "sınav → kısa sorular → ödeme".
  - ~~Dersler ve Testler ana ekranında halkalı ızgara mı, çubuklu liste mi?~~ Kapandı (17 Kasım 2026): çubuklu liste.
  - Eski yönlendirme rotalarının silinmesi ve mobilde genel arama.

**Mobil ekip:**
1. **Denemeden çıkma (karar 17 Kasım: mobil de kaldığı yerden devam ettirir):** web "Kaydet ve çık", mobil "teslim etmeden çıkarsan deneme iptal olur" (`exitCancels`). API kaldığı yerden devamı destekliyor (`GET student/exams/attempts/{id}/state`). Mobil, web gibi devam ettirmeli.
2. **Testte cevap (karar 17 Kasım: her yerde tek dokunuş):** mobil seç + "Cevapla"; web ve tasarım tek dokunuş.
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
