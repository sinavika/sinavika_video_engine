# Sınavika UI/UX denetimi

**Tarih:** 15 Ekim 2026
**Kapsam:** Mobil uygulama (47 ekran görüntüsü), web paneli ve web sitesi (85 ekran görüntüsü), API özellik envanteri
**Çıktılar:** Bu rapor, `UIUX-Rehberi.md` (v3), `Modul-Kimligi.md`, `Adlandirma-Kurallari.md`, `Ekran-Envanteri.md` ve çizimler (`Sinavika-UIUX3`)

> **v2 notu (15 Ekim):** Bulgular geçerlidir. Çözümlerde iki değişiklik var: mobil ana ekran yeni bir "Bugün" ekranı değil, uygulamanın mevcut **Modüller** hub'ıdır (slaytlar + modül kartları) ve tab bar uygulamanın mevcut yüzen çubuğudur. Bilgi Kartları'nda Akış (feed) yoktur. Çizim kimlikleri `Ekran-Envanteri.md`'deki yeni kimliklerdir; aşağıdaki m-xx / w-xx numaraları v1 çizimlerine aittir.

Bu belge kod değişikliği içermez. Neyin neden değişmesi gerektiğini ve hangi sırayla yapılacağını anlatır.

## 1. Özet

Sınavika'nın özellik derinliği güçlü. Denemeler, Dersler, Testler, Ders Planı, Akıllı Özet, Bilgi Kartları ve SinoAI arka uçta olgun. Öğrenciyi yoran şey özellik eksikliği değil, **yön bulma**:

1. **Aynı şeyin birden çok adı ve birden çok yeri var.** Web'de 13 düz menü maddesi; deneme ile ilgili 5 ayrı menü (Sınavlarım, Sınav takvimi, Sınav sonuçları, Soru çözümleri, İstatistik). Mobilde aynı modülün adı web'den farklı.
2. **Açılışta "şimdi ne yapmalıyım?" sorusunun cevabı yok.** Ana ekranlar modül listesiyle açılıyor; öğrencinin bugünkü tek adımı görünmüyor.
3. **İlk değer geç geliyor.** Mobil onboarding 11 adım, ardından ödeme ekranı. Öğrenci kendi planını görmeden ödeme kararı veriyor.
4. **Kart dili tekrarlı ve düz.** Aynı turuncu rozetli başlık kartı her sayfada; bilgi hiyerarşisi yok. "Heyecan" yaratan ilerleme, seri, hedef gibi öğeler geri planda.
5. **Ham sistem durumları kullanıcıya sızıyor.** "Not Found", GUID dosya adları, push hata ayıklama bilgisi, test reklam bandı, sonsuz yükleniyor göstergesi.

Önerinin özü: **modül yapısı aynen kalır** (öğrenciyi karmaşadan kurtaran şey bu). Değişen; modüllerin her yerde aynı adla, aynı düzende ve aynı kart diliyle sunulması, açılışa "Bugün" ekranının konması ve ilk değerin onboarding içinde verilmesidir.

## 2. Önem dereceleri

| Seviye | Anlamı |
|---|---|
| **P0** | Güveni ya da temel akışı bozar. Hemen düzeltilir. |
| **P1** | Yön bulmayı veya dönüşümü belirgin şekilde zorlaştırır. Yeniden tasarımın çekirdeği. |
| **P2** | Tutarlılık ve cila. Tasarım sistemi uygulanırken birlikte çözülür. |

## 3. Bulgular

### 3.1 Mobil uygulama

| # | Bulgu | Etki | Seviye | Çözüm (çizim) |
|---|---|---|---|---|
| M1 | Hakkında ekranında push token ve hata ayıklama bilgisi görünüyor. | Güven, gizlilik izlenimi | **P0** | Profil › Hakkında yalnız sürüm ve yasal bağlantılar (m-42) |
| M2 | Ödeme yapan kullanıcıda "Test mode" reklam bandı görünüyor. | Güven, ücretli kullanıcı deneyimi | **P0** | Ücretli kullanıcıda reklam yok; test reklam kimliği yalnız geliştirme yapısında |
| M3 | Bilgi Kartları boş bir dönen göstergeyle açılıyor, içerik gelmiyor. | Modül kullanılamıyor izlenimi | **P0** | İskelet yükleme + boş durum + hata durumu kalıbı (m-45, m-46) |
| M4 | Onboarding 11 adım: sınav, grup, puan türü, mevcut net, hedef net, saat, soru sayısı, konular, plan, ödeme, ATT, giriş. | Terk oranı, ilk değere geç ulaşma | **P1** | 6 adım: sınav ve oturum tek ekranda, net aralığı tek kaydırıcıda, tempo kartları, dersler, **planın hazır**, hesap (m-02…m-07) |
| M5 | Ödeme ekranı, öğrenci planını görmeden ve hesap açmadan geliyor. | Dönüşüm, güven | **P1** | Önce plan ve hesap, sonra şeffaf 3 gün ücretsiz ekranı: bugün, 2. gün hatırlatma, 3. gün ücret (m-09) |
| M6 | Her modülün alt çubuğu farklı: Denemeler'de "Daha fazla" içinde Hakkında ve Destek; "Ana sayfa / Ana Sayfa / Anasayfa" yazımları karışık. | Yön bulma | **P1** | 5 yuvalı sabit kural: modül · ana iş · Modüller · geçmiş · Profil (m-13, `UIUX-Rehberi` §2) |
| M7 | Hangi modülde olunduğu ekranın üstünden anlaşılmıyor. | Yön bulma | **P1** | Üstte modül şeridi (renkli ikon + ad) her modül ekranında |
| M8 | Açılışta günün tek adımı görünmüyor. | Günlük alışkanlık | **P1** | Hub'ın ilk slaytı günün adımı; kartlarda modül durumu (m-hub-moduller) |
| M9 | SinoAI geçmişinde onlarca "Yeni sohbet" başlığı. | Geri dönüp bulamama | **P1** | İlk mesajdan otomatik başlık; boş sohbet kaydedilmez (m-39, m-40) |
| M10 | SinoAI araçlarında kilit simgeleri, ne kilitli olduğu ve nasıl açılacağı belirsiz. | Hayal kırıklığı | **P1** | Kilit simgesi yerine dokununca açıklayıcı paket kartı; kota somut ("bu ay 4 / 20") |
| M11 | "Kalan kredi" ifadesi. | Belirsizlik | **P1** | Somut kota: "Akıllı Özet bu ay 7 / 30" (m-43) |
| M12 | Hata metinleri ham ve suçlayıcı. | Güven | **P2** | Hata kalıbı: ne oldu, bizden mi, ne yapmalı, tek buton (m-46) |
| M13 | Emoji ikonlu ders kutuları ve farklı ikon setleri. | Görsel tutarlılık | **P2** | Tek ikon seti (çizgi, 2 px), modül renkli yumuşak kutular |
| M14 | Koyu tema yok ya da yarım. | Gece kullanımı | **P2** | Jeton tabanlı koyu tema (m-47) |

### 3.2 Web paneli (giriş sonrası)

| # | Bulgu | Etki | Seviye | Çözüm (çizim) |
|---|---|---|---|---|
| W1 | Soru Çözümleri sayfası ham "Not Found" gösteriyor. | Güven, temel akış | **P0** | Soru haritası + çözüm; içerik yoksa açıklayıcı boş durum (w-05, w-16) |
| W2 | Akıllı Özet (Lens) geçmişinde başlık olarak GUID dosya adları. | Kullanılamaz liste | **P0** | Otomatik konu başlığı + ders + durum (w-10) |
| W3 | İstatistik satırlarında ders adları yok, yalnız "Ders". | Veri okunamıyor | **P0** | Her satırda ders ve konu adı (w-04) |
| W4 | 13 düz menü maddesi; deneme için 5 ayrı menü; "Modüller" sayfasında Ders Çalış; "Sınav takvimi" ile "Sınavlarım" tekrar. | Yön bulma | **P1** | Menü: Bugün · Tüm modüller · 7 modül · Destek. Deneme işleri Denemeler'in 3 sekmesinde (w-01, w-03) |
| W5 | Menü ve sayfa üstünde aynı işi yapan çift sekme (pill) satırları. | Görsel gürültü | **P1** | Modül başlığı + tek sekme satırı; sekmeler mobil yuvalarla aynı |
| W6 | Her sayfada aynı turuncu rozetli başlık kartı. | Hiyerarşi yok | **P1** | Sayfa başlığı modül kimliğiyle; turuncu yalnız birincil eylem ve "bugünün adımı" kartında |
| W7 | Adlar mobil ile farklı: Ders Çalış, Kelime Kartları, Lens AI Analiz, Sınavika AI, Sınavlarım. | Marka ve yön bulma | **P1** | `Adlandirma-Kurallari.md` §3 |
| W8 | "siz" ve "sen" karışık. | Marka sesi | **P2** | Öğrenciye her yerde "sen" (`BrandIdentity.md` §3) |
| W9 | Deneme çözerken menü ve üst çubuk görünür kalıyor. | Odak | **P2** | Odak modu: menü gizli, büyük süre, soru haritası, klavye kısayolları (w-06) |

### 3.3 Web sitesi (giriş öncesi)

**Korunacaklar.** Ana sayfadaki mini ürün maketleri ("Deneme paneli" tarayıcı + telefon) ve yumuşak ikon kutuları güçlü ve markaya özgü. Yeni tasarım sistemi bu dili temel alır: modül kartlarında, onboarding'de, blog kapaklarında ve mağaza görsellerinde aynı minyatür ekranlar kullanılır.

| # | Bulgu | Seviye | Çözüm (çizim) |
|---|---|---|---|
| S1 | Site metinlerinde eski adlar (Lens, Ders Çalış, Kelime Kartları). SEO sayfaları dahil. | **P1** | Ad tablosuna göre güncelleme; sayfa başlıkları ve meta açıklamalar dahil |
| S2 | Ürünü tek ekranda anlatan bir "ürün turu" yok; özellikler dağınık. | **P1** | Özellikler sayfası: modül seçici + canlı maket (s-03) |
| S3 | Sınav sayfaları (YKS, KPSS…) farklı kalıplarda. | **P2** | Tek şablon: geri sayım, oturumlar, denemeler, SSS (s-02) |
| S4 | Paket karşılaştırmasında kotalar belirsiz. | **P2** | Somut kotalar, deneme süresi her kartta (s-04) |
| S5 | Net hesaplama ürüne bağlanmıyor. | **P2** | Sonuç kartında "Bu netle ne yapmalısın?" geçişi (s-05) |

### 3.4 Adlandırma ve kod

Ayrıntı `Adlandirma-Kurallari.md`. Öne çıkanlar:

- API'de `SinosAI` klasör ve namespace adı; tipler ve tablolar `SinoAI`. Yalnız derleme etkili bir yeniden adlandırma.
- "Lens" ve "Compass/Pusula" yalnız kod adı olarak kalır; görünen ad Akıllı Özet ve Ders Planı › İlerleme.
- "Deneme" ile "sınav" karışıyor. Kural: Sınavika'da çözülen = **deneme**, hedeflenen gerçek sınav = **sınav**.

## 4. Yeniden tasarımın ilkeleri

1. **Bir ekran, bir sonraki adım.** Her ekranda tek bir birincil (turuncu) eylem.
2. **Her yerde aynı modül, aynı yer, aynı ad.** Mobil alt çubuk yuvaları = web sekmeleri.
3. **Önce değer, sonra istek.** Plan önce, hesap sonra, ödeme en son.
4. **Sayı + yorum.** "78,5 net" yanında "+6,5" ve "bu hızla hedefe 3 hafta erken" gibi bir cümle.
5. **Renk anlam taşır.** Turuncu = eylem ve marka. Modül renkleri = yön bulma. Yeşil, sarı, kırmızı = yalnız durum.
6. **Durumlar tasarlanır.** Boş, yükleniyor, hata ve çevrimdışı her listede aynı kalıpla.
7. **Heyecan, abartı olmadan.** Seri, halka, ilerleme ve ölçülü kutlama (ders bitti ekranı). Konfeti ve sahte aciliyet yok.

## 5. Uygulama sırası (öneri)

| Dalga | İçerik | Neden önce |
|---|---|---|
| **0 · Hemen** | M1, M2, M3, W1, W2, W3 | Güveni bozan, küçük ve bağımsız düzeltmeler. Tasarım sistemini beklemez. |
| **1 · Temel** | Tasarım jetonları ve ortak bileşenler (web + mobil), ad tablosunun i18n'e uygulanması (M6, W7, S1) | Sonraki tüm ekranlar bunun üstüne kurulur. |
| **2 · Yön bulma** | Mobil 5 yuva kuralı ve modül şeridi; web menüsü ve modül sekmeleri (M6, M7, W4, W5, W6) | En büyük karmaşa kaynağı. |
| **3 · Bugün ve ilk değer** | Bugün ekranı (mobil + web), yeni onboarding, plan önizleme, şeffaf deneme süresi, ürün turu (M4, M5, M8) | Günlük alışkanlık ve dönüşüm. |
| **4 · Modül ekranları** | Denemeler sonuç ve analiz, Dersler konu yolu, Testler seviyeleri, Akıllı Özet, Bilgi Kartları, SinoAI geçmişi (M9, M10, M11, W9) | Modül modül, her biri ayrı PR. |
| **5 · Cila** | Koyu tema, boş/hata kalıpları, site şablonları (M12–M14, S2–S5, W8) | Sistem oturduktan sonra ucuzlar. |

## 6. Başarı ölçütleri

Şu an analitik veri yok. Uygulamayla birlikte şu olaylar eklenmeli (adlar `Adlandirma-Kurallari.md` kalıbında):

| Ölçüt | Nasıl ölçülür | Hedef yönü |
|---|---|---|
| Onboarding tamamlama | `onboarding_step_viewed` / `onboarding_completed` | Artış |
| İlk değere süre | Kayıttan ilk tamamlanan göreve (ders, test ya da deneme) geçen süre | Azalış |
| Günlük dönüş | D1, D7, D30 aktif öğrenci | Artış |
| "Bugünün adımı" kullanımı | Bugün kartındaki "Başla" dokunuşu / Bugün görüntülenmesi | Artış |
| Yön bulma | Modüller ekranına dönüş sayısı, oturum başına geri tuşu | Azalış |
| Deneme süresi → ücretli | 3 gün sonunda dönüşüm, ilk hafta iade ve iptal | Artış, iptalde azalış |
| Destek talepleri | "Bulamıyorum" ve "çalışmıyor" kategorileri | Azalış |

## 7. Açık sorular

1. Tablet için ayrı yerleşim mi, telefonun genişletilmiş hali mi? (Çizimlerde telefon ve web var; tablet web paneli düzenini kullanabilir.)
2. Koyu tema ilk sürümde mi, dalga 5'te mi?
3. Ücretsiz katman kotaları (çizimlerde örnek değerler: ayda 1 deneme, SinoAI günde 5 soru) ürün kararı olarak netleşmeli.
4. Mobilde "Ara" sekmesi: global arama (ders, konu, deneme, kart) API'de tek uçla mı, istemcide birleştirmeyle mi?
