# UX kuralları karşılaştırması

3 Kasım 2026 (14 Kasım'da ana ekranın Bugün düzenine göre güncellendi). UI UX Pro Max'in 119 UX kuralı (MIT lisanslı `ux-guidelines.csv`), Sınavika'nın tasarım sistemiyle karşılaştırıldı. Araç kurulmadı; yalnız kural listesi okundu. Kurallar Türkçeye özetlenerek aktarıldı.

## Özet

| Durum | Kural | Anlamı |
|---|---:|---|
| Bizde var | 35 | Tasarımda ve rehberde zaten vardı |
| Eklendi | 12 | Bu turda çizimlere, ortak parçalara ve testlere eklendi |
| Uygulama kuralı | 69 | Çizimle gösterilmez; web ve mobil kodunda uygulanır. `UIUX-Rehberi.md` §8'e yazıldı |
| Bize uymuyor | 3 | visionOS ve toplu düzenleme |

## Bu turda eklenenler

- **Gövde yazısı 16 pt**, satır aralığı 1,5 (24 pt); alanların yazısı 16 pt. Önce 14,5 pt idi. Test: en az 16 pt ve 1,5.
- **Klavye odağı (web):** `Button focus`, 2 px koyu halka. `w-panel-durumlar` ekranında örnek.
- **Gönderiliyor:** `Button loading`, dönen işaret ve kilitli düğme. `m-durum-hata`, `w-panel-durumlar`.
- **Alan hatası:** alanın hemen altında, uyarı simgesiyle ve o alana özel cümleyle. `m-durum-hata`, `w-panel-durumlar`.
- **Şifreyi göster/gizle:** yeni şifre alanlarında göz simgesi. `m-sifre-yeni`, `w-sifre-sifirla`.
- **Kodu yapıştır:** doğrulama kodu ekranında. `m-giris-kod`.
- **Yapay zekâ notu:** SinoAI yazma kutusunun altında "SinoAI bir yapay zekâ; hata yapabilir". Mobil ve web, sohbet ve çalışma ekranları. Test denetliyor.

## Bütün kurallar

| No | Grup | Kural | Durum | Bizde |
|---:|---|---|---|---|
| 1 | Gezinme | Yumuşak kaydırma | Uygulama kuralı | Site içi bağlantılarda; hareketi azalt açıksa anında. |
| 2 | Gezinme | Sabit üst çubuk içeriği örtmez | Uygulama kuralı | Web: sayfa üstü çubuk yüksekliği kadar boşlukla başlar. |
| 3 | Gezinme | Etkin sayfa gösterilir | Bizde var | Sekme hapı; web menüsünde ince modül çizgisi. |
| 4 | Gezinme | Geri tuşu öngörülebilir | Uygulama kuralı | Sistem geri tuşu ve hareketi her ekranda çalışır; kendi geri uyarımız yok. |
| 5 | Gezinme | Adres ekranı anlatır | Uygulama kuralı | Web rotaları ekranı adlandırır; bildirim doğru ekranı açar. |
| 6 | Gezinme | Konum izi | Bizde var | Web üst çubuğu: Dersler › Türkçe › |
| 7 | Hareket | Aşırı hareket yok | Uygulama kuralı | Bir ekranda en çok 1–2 öğe hareket eder. |
| 8 | Hareket | Ortak hareket süreleri | Uygulama kuralı | Süreler tek yerde (`UI_MOTION`, `Hareket-Standardi.md`); her bileşen kendi süresini seçmez. |
| 9 | Hareket | Hareketi azalt | Uygulama kuralı | Sistem ayarı açıksa geçişler kısalır, sürekli animasyon durur. |
| 10 | Hareket | Yükleniyor durumu | Uygulama kuralı | Ortada dönen saatli logo; içerik varsa yerinde kalır, üstte küçük gösterge. İskelet yok (sahibin kararı, 11 Kasım 2026). |
| 11 | Hareket | Hover yerine dokunma | Bizde var | Hiçbir ana eylem yalnız üzerine gelince görünmez. |
| 12 | Hareket | Sürekli animasyon | Uygulama kuralı | Yalnız yükleniyor logosunda ve SinoAI'nin "düşünüyor" noktalarında. |
| 13 | Hareket | Hafif animasyon özellikleri | Uygulama kuralı | Web: transform ve opacity ile. |
| 14 | Hareket | Yumuşatma eğrileri | Uygulama kuralı | Giriş ve çıkış yavaş biten eğriyle, ease-in yok (10 Kasım 2026, `Hareket-Standardi.md`). |
| 15 | Yerleşim | Katman sırası ölçeği | Uygulama kuralı | Web: z-index tek ölçekten. |
| 16 | Yerleşim | Taşan içerik kesilmez | Uygulama kuralı | İçerik kutusuna sığar; en büyük yazı ayarında denenir. |
| 17 | Yerleşim | Sabit öğeler ve güvenli alan | Uygulama kuralı | Yüzen sekme çubuğu güvenli alana göre; son satır altında kalmaz. |
| 18 | Yerleşim | Katman bağlamı | Uygulama kuralı | Web. |
| 19 | Yerleşim | İçerik zıplamaz | Bizde var | Kartlar sabit yükseklikte; API'ye bağlı düğmelerin yeri baştan ayrılır (11 Kasım 2026). |
| 20 | Yerleşim | Mobil tarayıcı yüksekliği | Uygulama kuralı | Web: 100vh yerine dvh. |
| 21 | Yerleşim | Okuma genişliği | Uygulama kuralı | Okuma metni satırda 45–75 karakter; web oynatıcıda 700 px sütun. |
| 22 | Dokunma | Dokunma hedefi 44 pt / 48 dp | Bizde var | Rehber §4. |
| 23 | Dokunma | Dokunma hedefleri arası 8 px | Uygulama kuralı | Yan yana düğme ve çipler arasında en az 8 px. |
| 24 | Dokunma | Sistem hareketiyle çakışma | Uygulama kuralı | Yatay kaydırma yalnız hafta şeridinde ve süzgeç çiplerinde. |
| 25 | Dokunma | Dokunma gecikmesi | Uygulama kuralı | Web: touch-action. |
| 26 | Dokunma | Çekip yenileme | Uygulama kuralı | Yalnız listelerde; çözme ve oynatıcı ekranlarında kapalı. |
| 27 | Dokunma | Titreşim | Uygulama kuralı | Doğru cevapta hafif, yanlışta uyarı titreşimi. |
| 28 | Etkileşim | Odak göstergesi | Eklendi | Button `focus`: 2 px koyu halka (w-panel-durumlar). |
| 29 | Etkileşim | Hover durumu | Uygulama kuralı | Web: imleç ve hafif renk değişimi. |
| 30 | Etkileşim | Basılı durum | Uygulama kuralı | Basınca dolgu bir ton koyulaşır. |
| 31 | Etkileşim | Pasif durum | Bizde var | `disabled` düğme tonu (ör. Doğrula). |
| 32 | Etkileşim | Gönderilirken düğme kilitli | Eklendi | Button `loading`: dönen işaret, kilitli (m-durum-hata, w-panel-durumlar). |
| 33 | Etkileşim | Hata sorunun yanında | Eklendi | Alanın hemen altında, uyarı simgesiyle. |
| 34 | Etkileşim | Başarı bildirimi | Bizde var | Ödeme başarılı, "Doğru tahmin". |
| 35 | Etkileşim | Geri alınamaz işleme onay | Bizde var | Hesabımı kapat ayrı ekran; deneme iptali onaylı. |
| 36 | Erişilebilirlik | Kontrast 4,5:1 | Bizde var | Testle denetleniyor; düğme yazısı da. |
| 37 | Erişilebilirlik | Yalnız renge dayanmama | Bizde var | Doğru/yanlış tik ve çarpıyla; alan hatası simgeyle. |
| 38 | Erişilebilirlik | Görsel için metin | Uygulama kuralı | Figürlerin `alt` alanı ekran okuyucuya verilir. |
| 39 | Erişilebilirlik | Başlık sırası | Uygulama kuralı | Web: h1–h6 sırayla. |
| 40 | Erişilebilirlik | İkon düğmelerinin adı | Uygulama kuralı | Zil, profil, geri, kapat ve şıklar etiketli. |
| 41 | Erişilebilirlik | Klavyeyle gezinme | Eklendi | Web oynatıcıda 1–5 ve Enter; her öğede odak halkası. |
| 42 | Erişilebilirlik | Ekran okuyucuda anlam | Uygulama kuralı | Doğru öğe türleri (düğme, bağlantı, başlık). |
| 43 | Erişilebilirlik | Alan etiketi | Bizde var | Field üstünde etiket. |
| 44 | Erişilebilirlik | Hatanın duyurulması | Uygulama kuralı | Hata mesajı ekran okuyucuya duyurulur. |
| 45 | Erişilebilirlik | Ana içeriğe atla | Uygulama kuralı | Web paneli: menüyü geçen bağlantı. |
| 46 | Performans | Görsel boyutu | Uygulama kuralı | Web/mobil: WebP, doğru ölçü. |
| 47 | Performans | Geç yükleme | Uygulama kuralı | Ekran dışı görseller sonra. |
| 48 | Performans | Kod bölme | Uygulama kuralı | Web: rota başına. |
| 49 | Performans | Önbellek | Uygulama kuralı | Web. |
| 50 | Performans | Font yükleme | Uygulama kuralı | Web: font-display. |
| 51 | Performans | Üçüncü taraf betikler | Uygulama kuralı | Web: async/defer (GA4, Meta). |
| 52 | Performans | Paket boyutu | Uygulama kuralı | Web. |
| 53 | Performans | İlk çizimi engelleyen kaynak | Uygulama kuralı | Web. |
| 54 | Formlar | Görünür alan etiketi | Bizde var | Yalnız yer tutucuya bırakılmaz. |
| 55 | Formlar | Hata alanın altında | Eklendi | Field `error`: o alana özel cümle. |
| 56 | Formlar | Doğrulama zamanı | Uygulama kuralı | Alandan çıkınca denetlenir; yazarken uyarılmaz. |
| 57 | Formlar | Doğru giriş türü | Uygulama kuralı | E-posta, sayı, telefon. |
| 58 | Formlar | Otomatik doldurma | Uygulama kuralı | E-posta, ad ve tek seferlik kod otomatik dolar. |
| 59 | Formlar | Zorunlu alan işareti | Bizde var | İsteğe bağlı alanlar "(isteğe bağlı)" yazar. |
| 60 | Formlar | Şifreyi göster/gizle | Eklendi | Yeni şifre alanlarında göz simgesi (m-sifre-yeni, w-sifre-sifirla). |
| 61 | Formlar | Gönderim durumu | Eklendi | Gönderiliyor, sonra başarı ya da alan hatası. |
| 62 | Formlar | Alan alan gibi görünür | Bizde var | Çerçeveli beyaz alan. |
| 63 | Formlar | Doğru mobil klavye | Uygulama kuralı | inputmode / keyboardType. |
| 64 | Ekran genişliği | Önce mobil | Uygulama kuralı | Web: dar ekran önce. |
| 65 | Ekran genişliği | Ekran genişlikleri | Uygulama kuralı | Web 375, 768, 1024, 1440 px'te denenir. Çizimler yalnız 1440 px: açık iş. |
| 66 | Ekran genişliği | Web'de dokunma boyu | Uygulama kuralı | Dar ekranda hedefler büyür. |
| 67 | Ekran genişliği | Okunur yazı 16 pt | Eklendi | Gövde 14,5 → 16 pt; alanlar 16 pt (iOS yakınlaştırmasını da önler). |
| 68 | Ekran genişliği | Viewport ayarı | Uygulama kuralı | Web. |
| 69 | Ekran genişliği | Yatay kaydırma yok | Uygulama kuralı | Web. |
| 70 | Ekran genişliği | Görsel ölçeklenir | Uygulama kuralı | Web. |
| 71 | Ekran genişliği | Tablo dar ekranda | Uygulama kuralı | Kartlara döner ya da yatay kayar. |
| 72 | Yazı | Satır aralığı 1,5 | Eklendi | Gövde 16/24. |
| 73 | Yazı | Satır uzunluğu | Uygulama kuralı | 21 ile aynı. |
| 74 | Yazı | Tutarlı yazı ölçeği | Bizde var | `UI_TYPE` rolleri. |
| 75 | Yazı | Font kayması | Uygulama kuralı | Web: yedek fontla yer ayrılır. |
| 76 | Yazı | Okuma kontrastı | Bizde var | Testle. |
| 77 | Yazı | Başlık ayrımı | Bizde var | Boy ve kalınlık farkı. |
| 78 | Geri bildirim | Beklemeye göre gösterge | Bizde var | Kısa işte gösterge yanıp sönmez; ortada dönen saatli logo ve düğmede dönen işaret. |
| 79 | Geri bildirim | Boş durum | Bizde var | Ne, neden, tek eylem. |
| 80 | Geri bildirim | Hatadan kurtulma | Bizde var | Tekrar dene; cevaplar güvende. |
| 81 | Geri bildirim | Adım göstergesi | Bizde var | Onboarding 1/5, mikro ders adım çubuğu. |
| 82 | Geri bildirim | Kısa bildirim (toast) | Uygulama kuralı | 3–5 sn; hata için kullanılmaz. |
| 83 | Geri bildirim | Onay mesajı | Bizde var | Kısa ve somut. |
| 84 | İçerik | Uzun içerik | Uygulama kuralı | Üç noktayla kısalır, açılabilir. |
| 85 | İçerik | Tarih biçimi | Bizde var | Dile göre ("12 Ekim"). |
| 86 | İçerik | Sayı biçimi | Bizde var | 12.480 |
| 87 | İçerik | Gerçekçi örnek veri | Bizde var | Çizimlerde gerçek içerik. |
| 88 | Onboarding | Tanıtımı geçebilme | Bizde var | Tek ipucu ve "Anladım"; onboarding'de geri. |
| 89 | Arama | Arama önerisi | Bizde var | Web Ctrl K araması. |
| 90 | Arama | Sonuç yok | Uygulama kuralı | Boş aramada öneri ve ders listesi. |
| 91 | Veri girişi | Toplu işlem | Bize uymuyor | Öğrenci arayüzünde toplu düzenleme yok. |
| 92 | Yapay zekâ | Yapay zekâ olduğu bilinir | Eklendi | SinoAI yazma kutusunun altında not; test denetliyor. |
| 93 | Yapay zekâ | Akan yanıt | Uygulama kuralı | SinoAI yanıtı parça parça yazılır. |
| 94 | Uzamsal arayüz | Göz takibi (visionOS) | Bize uymuyor | visionOS hedefimiz değil. |
| 95 | Uzamsal arayüz | Derinlik katmanı (visionOS) | Bize uymuyor | visionOS hedefimiz değil. |
| 96 | Sürdürülebilirlik | Kendiliğinden oynayan video | Bizde var | Videolar dokununca oynar. |
| 97 | Sürdürülebilirlik | Ağır varlıklar | Uygulama kuralı | 3B figürler WebP önizlemeyle. |
| 98 | Yapay zekâ | Yapay zekâ yanıtına geri bildirim | Uygulama kuralı | Öneri: SinoAI yanıtına beğen/beğenme. |
| 99 | Erişilebilirlik | Paralaks ve kaydırma efektleri | Uygulama kuralı | 9 ile aynı; paralaks yok. |
| 100 | Erişilebilirlik | Odak örtülmez (AA) | Uygulama kuralı | Web: yapışkan öğeler odaklanan öğeyi kapatmaz. |
| 101 | Erişilebilirlik | Odak tam görünür (AAA) | Uygulama kuralı | Web. |
| 102 | Erişilebilirlik | Odak görünümü | Eklendi | 2 px halka, sayfaya karşı 3:1'in üstünde. |
| 103 | Erişilebilirlik | Sürükleme yerine tek dokunuş | Bizde var | Sırala adımı dokunarak çalışır. |
| 104 | Erişilebilirlik | Web hedefi en az 24 px | Bizde var | En küçük çip 24 px. |
| 105 | Erişilebilirlik | Yardım hep aynı yerde | Bizde var | Destek menüde ve Profil'de; oynatıcıda SinoAI'ye sor hep sağda. |
| 106 | Formlar | Aynı bilgi iki kez istenmez | Bizde var | Onboarding bilgileri plana ve hesaba taşınır. |
| 107 | Erişilebilirlik | Erişilebilir giriş | Eklendi | Apple/Google, kodla giriş, "Kodu yapıştır"; şifre yöneticisi ve yapıştırma açık. |
| 108 | Hareket | Kendiliğinden dönen içerik | Uygulama kuralı | Hiçbir içerik kendiliğinden dönmez ya da kaymaz. |
| 109 | Formlar | Form hata özeti | Uygulama kuralı | Web: uzun formda üstte özet, odak oraya. |
| 110 | Yazı | Başlık satır dengesi | Uygulama kuralı | Web, isteğe bağlı. |
| 111 | Yerleşim | Uzun kelime ve adres taşmaz | Uygulama kuralı | Satır içinde kırılır. |
| 112 | Erişilebilirlik | Yazı büyütme ve yeniden akış | Uygulama kuralı | En büyük yazı ayarında ve %200 yakınlaştırmada içerik kesilmez. |
| 113 | İçerik | Önemli metin kırpılmaz | Uygulama kuralı | Başlık, düğme, hata ve adlar tam görünür; sekme etiketleri sığar. |
| 114 | İçerik | Rozet ile çipin anlamı | Uygulama kuralı | Rozet durum, çip değer ya da eylemdir. |
| 115 | Yerleşim | Çip listesi satıra sarar | Bizde var | Onboarding ders çipleri. |
| 116 | İçerik | Rozet tek satır | Bizde var | Çip ve rozetler kırılmaz. |
| 117 | Erişilebilirlik | Etkileşimli çip (web) | Uygulama kuralı | Düğme olarak, seçili durumu bildirerek. |
| 118 | Erişilebilirlik | Sayaç değişimi duyurulur | Uygulama kuralı | Bildirim sayısı değişince kısa durum mesajı. |
| 119 | Hareket | Yarıda kesilen geçiş | Uygulama kuralı | Web: yeni durum eskisinin yerine geçer. |

Kaynak: github.com/nextlevelbuilder/ui-ux-pro-max-skill, `src/ui-ux-pro-max/data/ux-guidelines.csv` (MIT).
