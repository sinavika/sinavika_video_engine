# "Dediniz, yaptık": ilk üç senaryo (20 Kasım 2026)

Kurallar: [Sinavika-Tr-Icerik-Yaklasimi.md](../../docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md) "Ana seri" bölümü.
- Süre 25–40 sn, sonda 2 sn sade kart (logo ve mağaza rozeti, "indir" yok).
- Ses Doğa (Herald, pace 1,12, sıkı satır arası). Altyazı yok.
- Hook ilk 2 sn'de ekranda büyük yazılır.
- Her video 3 hook varyasyonuyla üretilir. Hook'lar sahibin kör testte seçtikleri: [Hook-Kor-Test.md](Hook-Kor-Test.md).
- Görsel yön her video için prompt-motion.com'dan seçilir; lacivert varsayılan değil.
- Ekranlar yalnız gerçek UI/UX çizimlerinden alınır (`m-…` kimlikleri).
- "Önce" hâli sade bir yeniden çizimdir; altyapı isteği aşağıda.

Yayın koşulu: anlatılan düzeltme mağazadaki sürümde yayında olmalı. Son kontrol api+web+mobile oturumunda.

---

## D1 · Kendi denemen de sayılır

**Hook A (ana):** "Başka yayının denemesini çözdün diye sana küsecek değiliz."
**Hook B:** "Grafiğimde sadece Sınavika denemeleri var, kendi çözdüklerim hiç sayılmıyor mu?"
**Hook C:** "Haklıydınız, dünyadaki tek deneme bizimki değilmiş."

Görsel yön önerisi: sıcak kâğıt dokusu, kütüphane masası, kurşun kalem çizgisi. Sonra uygulamanın temiz ekranına keskin geçiş (kâğıt → ekran zıtlığı).

| # | Süre | Dış ses (Doğa) | Görüntü |
|---|---|---|---|
| 1 | 0–2,5 | Başka yayının denemesini çözdün diye sana küsecek değiliz. | Hook büyük yazı. Öğrenci karakteri kütüphane masasında, önünde başka renkte bir deneme kitapçığı. |
| 2 | 2,5–7 | Bize yazdınız: "Kütüphanede kendi denememi çözüyorum, netimi kâğıda yazıyorum, sonra kayboluyor." | Yorum balonu açılır. Kâğıdın köşesine "68,5" yazılır, kâğıt masadan kayıp düşer. |
| 3 | 7–11 | Haklısınız. Grafiğinde yalnız bizim denemeler vardı. Gerisi yok sayılıyordu. | `m-deneme-sonuclar` "önce" hâli: yalnız düz sütunlar, aralarda boşluk. Boşluklar yanıp söner. |
| 4 | 11–18 | O yüzden "Deneme ekle"yi yaptık. Yayını, tarihi yazıyorsun, ders ders doğrunu yanlışını giriyorsun. Netin anında hesaplanıyor. | `m-deneme-ekle`: alanlar sırayla dolar, net sayacı canlı artar. Her alan dolarken kısa "tık" sesi. |
| 5 | 18–24 | Bir de şunu tartıştık: Bizimkiyle karışmasın diye dışarıda çözdüğün denemeyi çizgili sütun yaptık. | `m-deneme-sonuclar`: yeni çizgili sütun aşağıdan yükselip yerine oturur. Yakınlaşma "Dışarıda" etiketine. |
| 6 | 24–28 | Artık hangi denemeyi nerede çözersen çöz, gelişimin tek grafikte. | Grafik geniş açı: düz ve çizgili sütunlar birlikte, gelişim çizgisi soldan sağa çizilir. |
| 7 | 28–31 | Sırada ne var? Uygulamada neyi değiştirelim, yoruma yaz. | Öğrenci telefona bakıp başını kaldırır, ekranda boş yorum balonu ve yanıp sönen imleç. |
| 8 | 31–33 | (ses yok, kısa müzik çıkışı) | Sade kart: logo ve mağaza rozetleri. |

Dış ses: 75 kelime, ≈30–34 sn. Son kart dahil ≈32–36 sn.

---

## F1 · Kaybolan "Devam" düğmesi

**Hook A (ana, 20 Kasım düzeltmesi):** "Bize yazdınız: Telefonum mu küçük, çözümünüz mü uzun?" (balonla). İlk hâli kimin söylediği belli olmadığı için reddedildi; [kurallar](../../docs/Social/Dediniz-Yaptik-Hook-Kurallari.md).
**Hook B:** "Yalan yok, uzun çözümlerde seni o soruda hapsediyorduk."
**Hook C:** "Cevap paneli ekrandan taştı, aşağı kaydırıyorum, düğme yok"

Görsel yön önerisi: dar bir kutuya sıkışma hissi. Ekran kenarları içe doğru daralır, sonra açılıp ferahlar. Çözüm anında renk ve genişlik değişimi.

| # | Süre | Dış ses (Doğa) | Görüntü |
|---|---|---|---|
| 1 | 0–2,5 | Telefonum mu küçük, sizin çözüm mü fazla uzun? | Hook büyük yazı. Küçük bir telefonda `m-test-coz-yanlis`, çözüm paneli aşağı doğru uzar. |
| 2 | 2,5–8 | Telefonda test çözüyorsun. Yanlış yaptın, çözümü açtın. Uzun bir çözüm. Okudun, devam edeceksin… Düğme yok. | Parmak aşağı kaydırır. "Devam" ekranın altından dışarı kayıp kaybolur. Öğrenci "şaşkın" pozunda. |
| 3 | 8–12 | Yalan yok, uzun çözümlerde seni o soruda hapsediyorduk. | Ekranın kenarları içe daralır, kısa "kilit" sesi. Ekran hafifçe sallanır. |
| 4 | 12–20 | Ekranı baştan düzenledik. Çözüm ne kadar uzarsa uzasın panel kayıyor, "Devam" hep altta, hep görünür. | Kenarlar açılır. `m-test-coz-yanlis` yeni hâli: panel kayar, "Devam" altta sabit kalır ve vurgulanır. |
| 5 | 20–25 | Bir de sonraki soruya geçince sayfa aşağıda kalıyordu. Artık her yeni soru en baştan açılıyor. | "Devam"a dokunulur, `m-test-coz` yeni soru en üstten açılır. Yukarı doğru hızlı kayma ve "vınn" sesi. |
| 6 | 25–28 | Dar ekranda kesilen başlıklar da artık sığıyor. | Hızlı önce/sonra: kesik başlık "…" ile, sonra tam başlık. |
| 7 | 28–31 | Senin telefonunda ne sıkıştırıyor? Yoruma yaz, sıradaki onu düzeltelim. | Öğrenci rahat pozda testi sürdürür; boş yorum balonu açılır. |
| 8 | 31–33 | (müzik çıkışı) | Sade kart. |

Dış ses: 77 kelime, ≈31–35 sn. Son kart dahil ≈33–37 sn.
Yayın: bu düzeltmeler iOS 2.12.1/2.12.2'de. 2.12.2 mağazada yayına girmeden paylaşılmaz.

---

## F4 · "Beş buçuk" görünen üs

**Hook A (ana):** "Yalan yok, matematik sorularında matematiği biz bozuyormuşuz."
**Hook B:** "Soruyu yanlış yapmadım, siz soruyu yanlış göstermişsiniz."
**Hook C:** "Kök işaretinin çizgisi kopmuş, hangi sayı kökün içinde?"

Görsel yön önerisi: büyük tipografi ve matematik sembolleri sahnenin kahramanı. Üs ve kesir parçaları ekranda fiziksel nesne gibi kayıp yerine oturur, büyük ve sade.

| # | Süre | Dış ses (Doğa) | Görüntü |
|---|---|---|---|
| 1 | 0–2,5 | Yalan yok, matematik sorularında matematiği biz bozuyormuşuz. | Hook büyük yazı. Arkada dev boyutta, bozuk görünen "5 ½". |
| 2 | 2,5–7 | Ekranda beş üzeri bir bölü iki yazması gerekiyordu. Telefonda böyle görünüyordu: beş buçuk. | Doğru ifade 5^(1/2) belirir. Üsteki kesir aşağı düşüp 5'in yanına oturur ve "5 ½" olur. "Düşme" sesi. |
| 3 | 7–11 | Bir de kök vardı. Çizgisi kopuk, hangi sayı içeride, belli değil. | Kopuk kök çizimi; çizgi kökten ayrı ve yukarıda süzülür. Soru işareti belirir. |
| 4 | 11–14 | Yani bazı sorularda hata sende değil, bizdeydi. | Öğrenci karakteri "şaşkın" pozdan "rahatlamış" poza geçer. Kırmızı çarpı yeşile döner. |
| 5 | 14–22 | Telefondaki matematik yazımını baştan çizdik. Üsteki kesir artık küçük ve yukarıda. Kök tek parça, içi uzadıkça kendisi de uzuyor. | Kesir yukarı kalkıp küçülür ve üsse yerleşir. Kökün içine terimler eklendikçe çizgi uzar. Her yerleşmede "klik" sesi. |
| 6 | 22–26 | Her ifadeyi webdeki çizimle tek tek karşılaştırdık, aynı görünene kadar. | Yan yana iki ekran (telefon ve web) aynı ifadeyi gösterir, üst üste biner ve tam örtüşür. |
| 7 | 26–29 | Şimdi soru neyse ekranda da o. | `m-ders-formul` yeni hâli, temiz kök, kesir ve üs. |
| 8 | 29–32 | Sen hangi soruda "bu böyle mi yazılır" dedin? Yoruma yaz. | Boş yorum balonu, imleç yanıp söner. |
| 9 | 32–34 | (müzik çıkışı) | Sade kart. |

Dış ses: 83 kelime, ≈33–38 sn. Son kart dahil ≈35–40 sn.
Doğruluk: düzeltme 8 Kasım'da yapıldı (Öğrenci Deneyimi İyileştirme Planı §2, E3, E4). Hangi mobil sürümde mağazaya çıktığı api+web+mobile'a sorulur. Okunuş "beş üzeri bir bölü iki" SpokenText'te kontrol edilir.

---

## Altyapı ihtiyaçları (Video Engine kurulumu oturumuna)

1. **Önce/sonra sahnesi:** aynı UI/UX ekranının "önce" (sade yeniden çizim) ve "sonra" hâli arasında kayarak ya da silerek geçiş.
2. **Yorum balonu açılışı:** anonim yorum kartı. Kullanıcı adı ve avatar olmaz, sosyal medya arayüzü taklit edilmez.
3. **Ekran içi durum kurguları:** "Devam" düğmesinin ekran dışına kayması (F1); kesirli üssün düşüp "5 ½" olması ve kökün kopması (F4). Bunlar UI/UX çiziminin üstüne motorun eklediği animasyonlardır, ekranın kendisi değişmez.
4. **"Önce" ekran çizimleri:** `m-deneme-sonuclar` (çizgili sütun yok) ve dar ekranda kesik başlık. Ya motor sahnede sade bir yeniden çizim yapar ya da UI/UX oturumu bir defalık "önce" çizimi verir.

---

## D7 · Hepsi tek uygulamada (20 Kasım, sahibin fikri)

İş: `Posts/Seri-SinavikaTr/11-DY-Tek-Uygulama.json` (görünüm `ink`). Örnek render: `Outputs/Videos/SinavikaTr/Pilot/11_DY_Tek_Uygulama.mp4`, 37,5 sn.

- **Hook (B):** "Bize yazdınız: Her şeye ayrı uygulama, telefonum doldu!" Balon metni: "Plana ayrı, teste ayrı, karta ayrı uygulama… Telefonum doldu, bir çare bulun!" Altta markasız telefonun ana ekranı, parmak uygulamalar arasında geziniyor.
- **İtiraf (A):** "Haklıydınız. Hepsini tek uygulamaya sığdırmak bizi de çok zorladı."
- **Çözüm:** "Ama sığdırdık." Sınavika simgesine dokunuluyor, Modüller ekranı açılıyor.
- **Montaj:** Her modül için "… dediniz: [modül]". Ders Planı, Dersler, Testler, Denemeler, Bilgi Kartları, Akıllı Özet, SinoAI; yapışkan notta öğrencinin isteği, yanında modülün gerçek ekranı.
- **Kapanış:** "Şunu istediniz, yaptık. Hepsi bir arada." Ardından "Sırada ne var? Uygulamada neyi değiştirelim, yoruma yaz."

Yayın koşulu yok: modüllerin hepsi mağazadaki sürümde var. İstatistikler 2.12.2'de ayrı bölüm oldu; o sürüm yayında olmadığı için montaja konmadı.
