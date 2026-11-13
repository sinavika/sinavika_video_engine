# Hook listesi

Reels ve gönderi açılışları için hook havuzu. Burada taslak olarak durur, üzerine çalışılır. Seçilen hook ay kampanyasına (`src/Social/Campaigns/`) taşınınca durumu "kampanyada" olur.

**Hook kuralları** (kaynak: [SocialCreativePlaybook.md](SocialCreativePlaybook.md) §11, `REEL_STANDARD`, hafızadaki reels ve hook kuralları):

- **Biçim:** En fazla 5 kelime, ekranda en çok 1,8 saniye. Seslendirmenin ilk sözü de odur.
- **İçerik:** Bir inancı sarsar ya da bir acıyı adlandırır. Özellik saymaz ("fotoğrafını çek" gibi kalıplardan kaçın).
- **İlk saniye:** Bir soru, bir hata ya da bir görsel var; SinoAI kendini tanıtmaz. Her 2 saniyede yeni bilgi gelir.
- **Dil:** Sen dili, cümle düzeni. "İndir" denmez, "quiz" yerine "test" denir. Modül adları uygulamadaki gibi yazılır: Denemeler, Testler, Dersler, Bilgi Kartları.
- **Hesap:** Bu listedeki hook'lar sinavika.tr hesapları içindir. sinavika.yks'te uygulama reklamı yoktur.

---

## Aralık 2026 · sinavika.tr

### Tablet ve kalem reklamı

Ne anlatıyor: tablette kalemle soru çözmek. Taslak kâğıdı sorunun yanında, şık eleme ve altını çizme sorunun üstünde, notlar soruya ve adıma kayıtlı, kalem çizer, parmak kaydırır.

- **Ekranlar:** [Tablet-Kalem.md](../UIUX/Tablet-Kalem.md), tasarımlar `t-…` kimlikli 16 ekran (`Desktop\Sinavika-UIUX3\…\tablet`).
- **Kod durumu (10 Kasım):** Mobil kodda Denemeler, Testler (`QuizSolveScreen`), Dersler (Notlarım, el yazısıyla boşluk doldurma, kenar notu), Bilgi Kartları ("Önce kendin yaz") ve Profil'de "Kalem ve çizim" ayarı var.
- **Yayın şartı:** Reklam yayınlanmadan önce bu özelliklerin mağazadaki sürümde olduğu doğrulanır. Yalnız mağazadaki sürümde olan gösterilir.
- **Görsel kuralı:** Videoda tablet ve kalem markasız gösterilir; Apple, Samsung ya da başka bir logo görünmez.

| # | Hook | Açı (inanç / acı) | İlk saniye | Gösterilen ekran | Modül | Durum |
|---|---|---|---|---|---|---|
| T1 | Kâğıtta çözüyorsun, ekranda kaybediyorsun. | Acı: soru tablette, işlem ayrı kâğıtta; ikisi birbirini bulamıyor. | Masada dağınık karalama kâğıtları, kalem tablete iner. | `t-deneme-coz-taslak`: soru solda, taslak kâğıdı sağda, "Taslak bu soruya kayıtlı" | Denemeler | taslak |
| T2 | Sınavda da kâğıda yazacaksın. | İnanç: dijital çalışınca kâğıt alışkanlığı kaybolur. ÖSYM kitapçığına nasıl yazıyorsan tablette de öyle çalışırsın. | Optik form ve kitapçık, kalemle şık üstü çizilir; kesme ile aynı hareket tablette. | `t-deneme-coz-isaretleme`: altını çizme, şık eleme, kararsız şıkta "?" | Denemeler | taslak |
| T3 | Şıkları kafandan mı eliyorsun? | Acı: elenen şıkları akılda tutmak, ikinci okumada aynı şıkka dönmek. | İki şık kalemle tek tek çizilir, kalan iki şık parlar. | `t-ders-soru-eleme` / `t-deneme-coz-isaretleme` | Denemeler, Dersler | taslak |
| T4 | Deneme bitti, karalamalar çöpte. | Acı: yanlışın nedenini gösteren işlem kâğıtla birlikte atılıyor. | Buruşturulan kâğıt çöpe uçar, geri sarılır, tablette çözümün yanında açılır. | `t-deneme-cozum-notlar`: kendi taslağın resmî çözümün yanında | Denemeler | taslak |
| T5 | Cevabın değil, işlemin yanlış. | İnanç: yanlışı cevap anahtarı söyler. Hatayı gösteren işlemdir. | Kırmızı çarpı şıkkın üstünde, kamera taslaktaki hatalı satıra yaklaşır. | `t-test-coz-yanlis`: taslak yerinde kalır, "Taslağımı SinoAI'ye göster" | Testler | taslak (SinoAI'ye gösterme mağazada mı, kontrol) |
| T6 | Tabletin var, kalemin boşta. | Acı: tablet dizi izlemeye, kalem çekmeceye gidiyor. | Kalem çekmeceden çıkar, tabletteki dizi ekranı soruya döner. | `t-hub-moduller`: kalemli modüllerde "Kalem" etiketi | Tümü | taslak |
| T7 | Avucun ekrana değince bozuluyor mu? | Acı: tablete yazarken el ekrana değer, sayfa kayar, çizgi bozulur. | Avuç ekrana yaslanır, hiçbir şey olmaz; parmak kaydırır, kalem çizer. | `t-deneme-coz-dikey`: kalem çizer, parmak kaydırır | Denemeler | taslak |
| T8 | Altını çizdiğin yer kayboluyor. | Acı: fosforlu kalemle çalışılan yer ertesi gün bulunmuyor. | Fosforlu kalem bir satırı boyar, sonra Notlarım'da aynı satır adımıyla açılır. | `t-ders-tanim-not`, `t-ders-notlarim` (PDF olarak al) | Dersler | taslak |
| T9 | Yazmadan ezber olmaz. | İnanç: okuyarak ezberlenir. Önce yazmak hatırlamayı güçlendirir. | Kartın ön yüzüne kalemle formül yazılır, kart döner, doğrusu çıkar. | `t-kart-el-yazisi`: "Önce kendin yaz" | Bilgi Kartları | taslak |
| T10 | Klavyeyle değil, elinle yaz. | Acı: boşluk doldurmada klavye açılıp soruyu kapatıyor. | Kalem boşluğa yazar, "Okunan: …" belirir, Kontrol et. | `t-ders-bosluk-el-yazisi` | Dersler | taslak |

**Önerilen sıra:** T1 → T4 → T2 → T5 → T7. İlk ikisi en geniş acıyı adlandırıyor, sonrakiler tek tek özellik gösteriyor.

**Notlar:**
- **T5:** Açık bir soru var. "Taslağımı SinoAI'ye göster" mağazadaki sürümde yoksa bu hook çıkarılır ya da yalnız taslağın yerinde kalması gösterilir.
- **T9 ve T10:** Yeni modüllerin özelliklerini gösteriyor. Mağazadaki sürüm doğrulanmadan kampanyaya alınmaz.
- **Sonraki iş (sahiple):** Seçilen 4–5 hook için kurgu, ses ve müzik. Her reels yeni bir konsept, görünüm ve müzikle yapılır; şablon tekrarı yok.

### Özellik tanıtımı

Her modül için birkaç hook. Kaynak: mobil uygulamanın ekranları (`sinavika_mobile_reactnative/src/modules`, 11 Kasım) ve [`ProductMessaging.ts`](../../src/Configurations/ProductMessaging.ts).

**Tekrar yok:** Kasım'da kullanılan hook'lar (`Tanitim2026Kasim.ts`) ve onlara çok benzeyenler bu listeye alınmadı. Ekim–Kasım'da kullanılan ve bu yüzden dışarıda kalan kalıplar:
- "Telefonu bırakmak için telefonu kullan"
- "Bu hafta kaç saat çalıştın?"
- "Planın hazır"
- "Notunu at, test olsun"
- "Soracak kimse yok mu?"
- "Hocanın PDF'i"

**Durum:** "taslak" = yazıldı, seçilmedi. Satırdaki not bir doğrulama şartı söylüyorsa o şart sağlanmadan kampanyaya alınmaz.

#### Denemeler

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| D1 | Netin değil, konun düşüyor. | İnanç: neti tek sayı sanmak. Düşüş tek bir konudan gelir. | Net sayısı büyük yazılır, çatlar, içinden tek bir konu çubuğu düşer. | Deneme sonucu, konu konu doğru, yanlış ve boş | taslak |
| D2 | Boş bıraktığın sorular konuşuyor. | Acı: boşları görmezden gelmek. | Optikte boş daireler tek tek yanar. | Sonuçlar, boşların konulara dağılımı | taslak |
| D3 | Süre bitti, yarısı boş. | Acı: süre yetmiyor. Süreli denemeyle alışılır. | Kum saati biter, kitapçığın yarısı boş. | Süreli deneme çözme ekranı, sayaç | taslak |
| D4 | Geçen ayki netini hatırlıyor musun? | Merak: gelişimi bilmemek. | Boş bir grafik, noktalar tek tek gelir. | Netin değişimi grafiği | taslak |

#### Testler

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| TS1 | On soru, bir eksik kapanır. | Sonuç: kısa iş, somut kazanç. | 10 kutu dolar, sonuncusunda bir konu kilidi açılır. | 10 soruluk test, sonuç ekranı | taslak |
| TS2 | Kolayda takılıyorsan zora geçme. | İnanç: zor soru çözen ilerler. Sıra önemlidir. | Merdiven, ilk basamak çatlak. | Kolay, Orta, Zor seviyeleri | taslak |
| TS3 | Yanlışı ertesi güne bırakma. | Acı: yanlışın nedeni unutuluyor. | Kırmızı çarpı, açıklama hemen altında açılır. | Soru sonrası anında açıklama | taslak |
| TS4 | Konuyu bitirdin mi, emin misin? | Meydan okuma. | "Bitti" yazısının üstüne bir soru düşer. | Konu testleri ve sonuç | taslak |

#### Dersler

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| DR1 | Konu uzun, molan kısa. | Acı: uzun konuya başlayamamak. | Uzun bir sayfa, küçük parçalara bölünür. | Mikro dersler | taslak |
| DR2 | Kaldığın yeri unuttun mu? | Acı: her seferinde baştan başlamak. | Kitap ayracı düşer, uygulama kaldığı adımdan açılır. | "Kaldığın yer" ve devam | taslak |
| DR3 | Formülden önce anlamı öğren. | İnanç: formül ezberi yeter. | Formül silinir, yerine bir çizim gelir. | Tanım, anlam ve çözümlü örnek adımları | taslak |
| DR4 | Konuyu okudun, soruda donuyorsun. | Acı: okumak ile çözmek ayrı. | Okunan sayfadan bir soruya kesme; imleç donar. | Dersin içindeki TYT tarzı soru | taslak |

#### Ders Planı

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| DP1 | Yirmi beş dakika, tek konu. | Somut kural; dağılmaya karşı. | Sayaç 25:00'dan akmaya başlar. | Odak ekranı | taslak |
| DP2 | Haftan dolu, hangi konu eksik? | Acı: çok çalışıp bir konuyu hiç görmemek. | Dolu bir takvim, bir gün boş kalır. | Haftalık program | taslak |
| DP3 | Tekrar etmeyi unuttuğun konu. | Merak: unutulan konu hangisi? | Tozlu bir kart, üstü silinir. | Tekrar etmen gereken konular | taslak |
| DP4 | Matematik ilerliyor, Türkçe yerinde. | Karşılaştırma: dengesiz çalışma. | İki çubuk; biri uzar, biri durur. | Derslere göre ilerleme | taslak |

#### Akıllı Özet

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| AO1 | Ders notun var, özetin yok. | Acı: dağınık not. | Dağınık sayfalar tek bir özet sayfasına katlanır. | Not yükleme, özet ve PDF | taslak |
| AO2 | Çözümü değil, hatanı gör. | İnanç: doğru çözümü görmek yeter. | Çözüm satırları geçer, bir satır kırmızı yanar. | Adım adım çözüm, kazanım ve hata | taslak |
| AO3 | Gece 1, soru hâlâ çözülmedi. | Durum: yalnız çalışan öğrenci. | Saat 01:00, masada tek lamba. | Soru yükleme, videolu anlatım | taslak ("fotoğrafını çek" denmez) |
| AO4 | Bu soruyu kim anlatacak? | Acı: soracak kimse yok. | Soru ekranda, boş sandalye. | Videolu anlatım | taslak (Ekim'deki "Soracak kimse yok mu?"ya yakın; ikisinden biri) |

#### Bilgi Kartları

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| BK1 | Dün öğrendin, bugün unuttun. | Acı: unutma eğrisi. | Bir bilgi yazılır, harf harf silinir. | Tam zamanında gelen kart | taslak |
| BK2 | Otobüste beş kart. | Kimlik: kısa molaları kullanan öğrenci. | Otobüs camı, telefonda kart döner. | Kart oturumu | taslak |
| BK3 | Unutmadan bir gün önce. | Merak: neden bugün bu kart? | Takvimde yarın kırmızı; kart bugün gelir. | Tekrar zamanı gelen kartlar | taslak |

#### SinoAI

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| S1 | Hedefini bilen bir cevap. | Fark: sıradan cevap ile seni tanıyan cevap. | Aynı soruya iki cevap; biri öğrencinin hedefini anar. | SinoAI sohbeti | taslak |
| S2 | Eksiğini sen söyleme, o bilsin. | Rahatlık: öğrencinin anlatmasına gerek yok. | Öğrenci yazmaya başlar, SinoAI eksik konuyu önce söyler. | SinoAI, eksik konuya göre yanıt | taslak |
| S3 | Gece 2'de kime soracaksın? | Durum: herkes uyurken takılmak. | 02:00, karanlık oda, ekran ışığı. | SinoAI sohbeti | taslak |
| S4 | Kütüphanende ne birikti? | Merak: üretilenlerin birikmesi. | Raflar dolar: testler, kartlar, özetler. | SinoAI Kütüphane | taslak (adı uygulamadaki gibi "Kütüphane") |

#### Günlük seri

| # | Hook | Açı | İlk saniye | Gösterilen ekran | Durum |
|---|---|---|---|---|---|
| SR1 | Serin bugün bozulmasın. | Kayıp korkusu. | Yedi günlük şerit, son kutu yanıp söner. | Hafta şeridi ve seri | taslak |
| SR2 | Yedi gün, yedi tik. | Somut hedef. | Kutular tek tek işaretlenir. | Hafta şeridi | taslak |

**Önerilen sıra (ilk deneme):** D1, AO2, BK1, TS2, DP2, S2. Her biri bir inancı sarsıyor ya da bir acıyı adlandırıyor; aynı modül arka arkaya gelmiyor.

### Diğer Aralık başlıkları

- **KPSS çalışan reels'i:** "KPSS’ye çalışırken işe de gidiyorsan, bu senin için." ([2026-12-Tanitim-Notlari.md](../Campaigns/2026-12-Tanitim-Notlari.md)). Bu hook 8 kelime, kural 5 kelime. Sahip hook'u beğendiği için ekranda kısa hâli ("İşten sonra KPSS mi?") kullanılabilir, uzun hâli seslendirmede söylenir. Karar sahibin.

Sahip ekledikçe buraya yazılır.
