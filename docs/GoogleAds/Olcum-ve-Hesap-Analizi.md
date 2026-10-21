# Google Ads: ölçüm denetimi ve hesap analizi (20 Ekim 2026)

Hesap: 704-426-1654 · Dönem: 23 Şubat – 20 Ekim 2026 (tüm zamanlar) · Kaynak: Google Ads arayüzü (salt okunur), uygulama ve web kodu, canlı site.

## 0. Önce bunu çöz: reklamlar yayında değil

Google Ads "Hesap bakiyesinin son ödeme tarihi geçti" ve "Reklamlarınız yayınlanmıyor" diyor. Bakiye ₺8.932,38; birincil ödeme yöntemi Visa •••• 8616. Harcama grafiği Ekim ortasında sıfıra iniyor. Ödeme yapılana kadar hiçbir kampanya gösterim almaz. Ödemeyi senin yapman gerekiyor (Faturalandırma › Ödeme yap).

## 1. Hesap özeti

| Kampanya | Tür | Günlük bütçe | Harcama | Tıklama | TO | Dönüşüm | Dönüşüm başı |
|---|---|---|---|---|---|---|---|
| App promotion-App-android | Uygulama | ₺150 | ₺18.806,63 | 19.970 | %3,46 | 6.833 | ₺2,75 |
| Online Deneme Sınavı | Maks. Performans | ₺5 | ₺2.831,20 | 1.842 | %2,86 | 31 | ₺91,33 |
| Sales-Search-2 | Arama | ₺50 | ₺2.366,36 | 860 | %1,33 | 2 | ₺1.183,18 |
| App promotion-App--İOS | Uygulama | ₺50 | ₺262,74 | 168 | %0,19 | 30 | ₺8,76 |
| Anahtar kelime kampanyası | Arama | ₺30 | ₺0 | 0 | — | 0 | — |
| App promotion-ABD-android | Uygulama | ₺100 | ₺0 | 0 | — | 0 | — |
| App promotion-ABD-ios | Uygulama | ₺100 | ₺0 | 0 | — | 0 | — |
| **Toplam** | | ₺455 | **₺24.266,93** | **22.840** | %2,87 | 6.896 | ₺3,52 |

Cihaz: harcamanın %83'ü telefon. Ağ: tıklamaların %71,5'i Google arama, %19,6'sı Görüntülü Reklam Ağı, %8,1'i ağlar arası.

Dönüşüm işlemlerinin tümü (tüm dönüşümler sütunu):

| Dönüşüm işlemi | Kaynak | Durum | Tüm dönüşüm | Değer |
|---|---|---|---|---|
| Google Play'de uygulama içi satın alma | Google Play | Etkin | 87 | ₺28.439,13 |
| Android yükleme | Google Play | Etkin | 6.862 | — |
| iOS first_open | Üçüncü taraf (AppsFlyer) | İkincil, "daha önce dönüşüm yok" | 30 | — |
| Kaydolma | Web (GA4) | **Etkin değil** | 0 | — |
| Satın alma işlemi | Web sitesi | **Müdahale gerekiyor** | 0 | — |
| Hakkımızda | Web sitesi | Etkin değil | 0 | — |
| YouTube abonelik / takip görüntüleme | YouTube | Dönüşüm yok | 0 | — |

## 2. Ne anlama geliyor

1. **Android uygulama kampanyası iyi yükleme getiriyor ama yükleme için optimize ediliyor.** ₺2,75'e yükleme ucuz; ama Google hangi yüklemenin kayda ve satın almaya döndüğünü bilmiyor. Play'de 87 satın alma (₺28,4 bin) var, ancak bunlar kampanyaya "Dönüşüm" olarak bağlanmıyor. Kayıt olayı (sign_up) Ads'e hiç gelmiyor.
2. **Web tarafında hiçbir şey ölçülmüyor.** Kayıt (GA4) "etkin değil", web satın alma hiç tetiklenmemiş. Arama ve Maks. Performans kampanyaları webe yönlendirdiği için "2 dönüşüm, ₺1.183" gibi görünüyor. Bu kötü bir kampanyadan çok ölçülmeyen bir kampanya demek.
3. **Arama terimleri boşa para harcatıyor.** Ciddi bir kısmı PDF, "çıkmış sorular indir", rakip adları ("ozard", "derece vip", "kpss pusula", "ders platosu", "sınavbank", "astra ai", "yerles net") ve sunmadığımız sınavlar ("ags online deneme"). Tek arama reklamı "Sınavika ile Sınava Hazır | Soru Çöz, Kendini Geliştir" başlıklı ve büyük harfli; marka dilinde cümle düzeni kullanılıyor.
4. **iOS ve ABD reklamları reddedilmiş.** Gerekçeler: "Kabul edilemez boşluk kullanımı" ve "Güvenilir olmayan iddialar". ABD kampanyaları ₺100/gün bütçeyle duruyor ama gösterim almıyor. Mevcut İngilizce setimiz Türk sınavlarına (YKS/KPSS) hazırlanan öğrenciler için; ABD pazarı için ayrı bir SAT/ACT seti gerekir.
5. **Maks. Performans ₺5/gün** ile öğrenemeyecek kadar düşük. Öğe gücü "Mükemmel"in altında.

## 3. Kodda düzelttiklerim (deploy ile devreye girer)

| Sorun | Düzeltme | Nerede |
|---|---|---|
| Mobilde kayıt (`sign_up`) ve deneme başlatma (`start_trial`) onboarding sırasında oluyor; analitik onayı ise onboarding sonunda veriliyor; `track()` onaydan önceki olayları atıyordu. **Yeni kullanıcıların en değerli iki olayı hiç gitmiyordu.** | Dönüşüm hunisi olayları onaya kadar kuyrukta bekliyor, onay verilince gönderiliyor. Onay verilmezse hiçbir şey gitmiyor. | mobil `infrastructure/analytics/preConsentQueue.ts`, `analyticsService.ts`, `analyticsConsent.ts` |
| Google/Apple ile "kayıt" var olan hesaba girince de `sign_up` sayılıyordu; e-postayla kodla girişte yeni hesap açılınca ise `login` sayılıyordu. | API cevabına `IsNewAccount` eklendi (geriye uyumlu). Web ve mobil `sign_up` olayını yalnız gerçekten yeni hesapta gönderiyor. | API `StudentAuthService`, `StudentAuthDto`; web `Analytics.trackAuthResultOnce`; mobil `trackAuthResult` |

| Mobilde satın alma, kullanıcı satın almadığı hâlde Google'a "satın alma" olarak gidiyordu: mağaza bekleyen eski bir işlemi yeniden bildirdiğinde (409 eşitleme) ve promosyon kodu kullanılınca da `purchase` gönderiliyordu. | Reklam dönüşümü yalnız kullanıcının başlattığı, sunucuda doğrulanan **yeni** satın almada gidiyor. Eşitleme ve promosyon yolları artık dönüşüm göndermiyor. | mobil `storeBilling/shared/purchaseDelivery.ts` |
| Google Ads'in "kaçırılan derin bağlantı fırsatları" raporu: web reklamına telefonda tıklayan, uygulaması yüklü kullanıcı tarayıcıya düşüyordu. | Android App Links ve iOS Universal Links kuruldu. Sınav, deneme, net hesaplama, ürün ve sınav sayfaları uygulamada karşılığı olan ekranı açıyor. | web `public/.well-known/assetlinks.json` ve `apple-app-site-association`, `src/proxy.ts`; mobil `app.json`, `navigation/webDeepLinks.ts` |

Testler:
- API 3289 geçti.
- Mobil kuyruk, kayıt/giriş ayrımı, satın alma ve derin bağlantı testleri eklendi.

Derin bağlantılar web deploy'u ve yeni uygulama sürümüyle çalışır. Google ve Apple alan adını o zaman doğrular.

## 4. Hesapta yaptıklarım (20 Ekim)

**Veri kaynakları:**
- Web: Google etiketi (AW-17971740768) ve GA4 (sinavika-e1a4c).
- Uygulama: Google Play, GA4 Android ve AppsFlyer iOS.

**GA4 temel etkinlikleri:**
- `sign_up`, `start_trial` ve `exam_completed` eklendi.
- `session_start` çıkarıldı.
- `purchase` Google'ın varsayılanı olarak kalıyor.

**Google Ads dönüşümleri (GA4'ten içe aktarıldı, web ve Android ayrı):**

| Dönüşüm | Hedef | Optimizasyon |
|---|---|---|
| `sign_up` (web, Android) | Kaydolma | Birincil |
| `start_trial` (web, Android) | Abone olma | Birincil |
| `purchase` (web) | Satın alma | Birincil |
| Google Play uygulama içi satın alma | Satın alma | Birincil (Android'in gerçek satın alması) |
| `purchase` (Android, GA4) | Satın alma | İkincil: Play ile çift sayılmasın |
| Google Play yüklemeleri | İndirme | Birincil |
| iOS `first_open` (AppsFlyer) | İndirme | Birincil (iOS kampanyası bununla öğrenir) |
| `begin_checkout` (web, Android) | Ödeme başlatma | İkincil |
| `exam_completed` (web, Android) | Etkileşim | İkincil |
| YouTube abonelik ve izlemeler | Etkileşim | İkincil |

Kaldırılanlar:
- eski web "Satın alma işlemi" (müdahale gerekiyordu);
- etkin olmayan "Kaydolma (GA4)";
- "Hakkımızda".

**Kampanyalar:**
- "Online Deneme Sınavı" (PMax), "Sales-Search-2" ve "Anahtar kelime kampanyası" kaldırıldı.
- ABD Android ve iOS bütçesi ₺100'den ₺50'ye indi.
- Türkiye Android ₺150 ve iOS ₺50 olarak kaldı.

## 5. Senin yapacakların

1. **Bakiyeyi öde.** Ödeme yapılana kadar hiçbir kampanya yayınlanmaz.
2. **AppsFlyer'da Google Ads postback'lerini aç.**
   - Yol: Integrated partners › Google Ads › In-app events.
   - Eşlenecek olaylar: `af_complete_registration`, `af_start_trial`, `af_subscribe`.
   - Olaylar Ads'e ulaşınca iOS kaydı ve satın alması Hedefler › Yeni dönüşüm › Uygulama › AppsFlyer'dan eklenir. Şu an Ads tarafında AppsFlyer'dan yalnız `first_open` görünüyor.
3. **iOS GA akışı son 48 saatte veri almadı.** iOS dönüşümleri AppsFlyer'dan geldiği için reklam ölçümü bundan etkilenmez. Yeni iOS sürümünde Firebase'in başladığını kontrol et.
4. **Deploy ve yeni sürüm:** web (`.well-known` dosyaları, kayıt olayı) ve mobil (satın alma düzeltmesi, onay kuyruğu, derin bağlantılar). Dönüşümler bundan sonra doğru dolar.
5. **Uygulama kampanyasının hedefi:** Android kampanyası şimdilik yükleme odaklı. `sign_up` 30 günde 50'yi geçince "Uygulama içi işlemler"e (`sign_up`) geç; hedef EBM ₺25 civarından başla.

## 6. Bütçe (seçtiğin öneri)

| Kampanya | Günlük | Not |
|---|---|---|
| Android uygulama (Türkiye) | ₺150 | Ana kanal; YKS ve KPSS reklam grupları |
| iOS uygulama (Türkiye) | ₺50 | YKS ve KPSS |
| Arama · KPSS · Web | ₺75 | Maksimum tıklama, TBM sınırı ₺3; kayıt ölçülünce Maksimum dönüşüm |
| Arama · YKS · Web | ₺75 | Aynı |
| Arama · Marka | ₺15 | Marka aramalarını korur, ucuzdur |
| PMax web (Türkiye) | ₺50 | YKS ve KPSS öğe grupları |
| Android ve iOS uygulama (ABD) | ₺50 + ₺50 | SAT ve ACT; tıklama pahalı |
| PMax web (ABD) | ₺30 | SAT ve ACT öğe grupları |
