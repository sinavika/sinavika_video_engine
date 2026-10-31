# Kasım 2026 tanıtım kampanyası · 1–30 Kasım

**Durum (30 Ekim 2026):** Bütün içerik üretildi ve sahibin onayına gönderildi (SocialHub, Pending): 20 reels, 6 kaydırmalı gönderi, 4 görsel, 30 hikâye. Reels'lerin kurgu dili ve ses efektleri: [`Reels-Kurgu-Fikirleri.md`](../Reels-Kurgu-Fikirleri.md).

- **30 Ekim akşamı yeniden gönderim:** Sahip 60 gönderinin hepsini reddetti. Bu bir inceleme reddi değildi; not yalnız ".". Aynı gün iki karar geldi:
  - Videolara altyazı eklenmeyecek (altyazı alanı daraltıyor).
  - Hepsi yeniden onaya gönderilecek.

  Her `Post.json`'a reddedilen gönderinin kimliği `replacesPostId` olarak yazıldı. 40 görsel olduğu gibi yeniden gönderildi. 20 reels altyazısız, ses efektli ve lacivert zeminle yeniden render edilip gönderildi; 10 Kasım'da zaten altyazı yoktu.
- **24 Kasım arşivi:** 1928 kara tahta fotoğrafı indirilmedi (indirme sahibin onayı ister). Video depodaki kamu malı portreyi ve 1933 filmini kullanır; kaynak satırı "Arşiv görüntüleri · kamu malı". Onay gelirse fotoğraf eklenir.

- **Tek kaynak:** [`src/Campaigns/Tanitim2026Kasim.ts`](../../src/Campaigns/Tanitim2026Kasim.ts). Kavram, hook ve alternatifleri, sahne akışı, seslendirme taslağı, müzik tarifi, açıklama, hashtag, sütun, huni ve metrik oradadır.
- **Gönderi taslakları:** `Posts/2026-11-<gün>_<Ad>/`, her biri `Brief.md` ve `Post.json`. Komut: `npm run social -- campaign --campaign tanitim-2026-11`.
- **Takvim:** [`Posts/Plans/2026-11-Tanitim.json`](../../Posts/Plans/2026-11-Tanitim.json). Komut: `npm run social -- plan --plan tanitim --from 2026-11-01 --to 2026-12-01`.
- **Test:** `tests/Campaigns/Campaign.test.ts`. Testler şunları denetler:
  - her günün dolu olması;
  - her reels'in Ekim dahil yeni bir şablon ve yeni bir müzikle yapılması;
  - sütun ve metrik alanları;
  - 3–5 hashtag;
  - ürün metni denetimi;
  - "ücretsiz başla / dene" yazılmaması;
  - özel günlerde ürün çağrısı olmaması.

## 1. Çerçeve

- **Sahibin kararı (29 Ekim):** Kasım yalnız tanıtımla geçer; eğitim içeriği yoktur. Kullanılan sütunlar Ürün, Topluluk ve Anlar'dır ([`SocialStrategy.md`](../SocialStrategy.md) §4).
- **Ritim:** `PROMO_WEEKLY_PLAN`. Kasım'da:
  - 20 reels: 18 tanıtım ve 2 özel gün. Her biri Instagram reels, TikTok video ve YouTube Shorts olarak çıkar.
  - 6 kaydırmalı ve 4 tek görsel. Instagram ve TikTok fotoğraf olarak çıkar.
  - 30 hikâye, yalnız Instagram.
- **Sütun dağılımı:** Ürün 24, Topluluk 4, Anlar 2. Tanıtım ayında Ürün ağır basar. Ürün içerikleri de bir öğrencinin sorununu çözerken gösterilir.
- **Haftalar:**
  1. Kasım düzeni (1–8): plan ve alışkanlık.
  2. SinoAI haftası ve 10 Kasım (9–15).
  3. Ölç: deneme ve analiz (16–22).
  4. Birlikte: Öğretmenler Günü, YouTube kampı, ay sonu (23–30).
- **"Ücretsiz" sözü:** 20 Ekim'den beri ödeme yoksa erişim de yok. Doğru olanlar şunlardır:
  - uygulamayı ücretsiz indirmek (bitiş kartı `AppEndCard`'daki "Ücretsiz indir");
  - mağazanın 3 günlük denemesi;
  - sinavika.com'da hesap açmadan SinoAI;
  - YouTube'daki ücretsiz TYT kampı.

  "Ücretsiz başla / dene / kullan" yazılmaz.
- **Saatler:** Bütün günler Buffer saatlerini kullanır (sahip, 29 Ekim). Instagram'ın cumartesi ve pazar saati yok; o günlerde TikTok'un saati kullanılır.
- **Özel günlerin saati:** Yalnız 10 ve 24 Kasım kendi saatinde çıkar. Sahip bu iki gün için daha iyi saat önermemi istedi; öneriler §4'te.

## 2. Takvim

I: Instagram, T: TikTok, Y: YouTube Shorts.

| Tarih | Gün | Tür | Sütun | İçerik | Hook | Hook türü | Şablon | Tanıtılan | Saat (I/T/Y) |
|---|---|---|---|---|---|---|---|---|---|
| 01.11 | Paz | Reels | Ürün | Bugünkü dersin şansa mı kaldı? | Bugünkü dersin şansa mı kaldı? | Durum sorusu | SlotSpin | mobil | I 09:27 · T 09:27 · Y 20:38 |
| 02.11 | Pzt | Reels | Topluluk | Kasım 30 gün. Kaçında çalışacaksın? | Kasım 30 gün. Kaçında çalışacaksın? | Meydan okuma | TearCalendar | mobil | I 20:53 · T 09:47 · Y 20:53 |
| 03.11 | Sal | Kaydırmalı | Ürün | Kasım planın 4 adımda | Kasım planını 4 adımda kur. | Dönüşüm | PromoDeck/rail | mobil | I 19:09 · T 07:46 |
| 04.11 | Çar | Reels | Ürün | Telefonunu bırakmanın en iyi yolu | Telefonu bırakmak için telefonu kullan. | Ters köşe | FocusTimer | mobil | I 18:50 · T 18:50 · Y 18:50 |
| 05.11 | Per | Görsel | Ürün | Planın hazır | Bugün ne çalışacağını düşünme. Planın hazır. | Sonuçtan başlama | PromoDeck/proof | mobil | I 10:25 · T 10:25 |
| 06.11 | Cum | Reels | Ürün | Bu haftanın fişi | Bu hafta kaç saat çalıştın? | Merak boşluğu | StudyReceipt | mobil | I 07:17 · T 22:46 · Y 18:53 |
| 07.11 | Cmt | Kaydırmalı | Topluluk | Bugün hangi gündesin? | Bugün hangi gündesin? | Kimlik | PromoDeck/mood | mobil | I 17:39 · T 17:39 |
| 08.11 | Paz | Reels | Ürün | Aynı gün, iki öğrenci | Aynı sınav, iki farklı akşam. | Dönüşüm | SplitDay | mobil | I 09:27 · T 09:27 · Y 20:38 |
| 09.11 | Pzt | Reels | Ürün | Hızlı mı, derin mi? Sen seç. | Hızlı mı, derin mi? Seç. | Merak boşluğu | ThreeModes | ikisi | I 20:53 · T 09:47 · Y 20:53 |
| 10.11 | Sal | Reels | Anlar | 10 Kasım: Saat 09.05 | Saat 09.05. Zaman durdu. | Akışı kırma | AtaturkMemorial | marka | **09:05** (özel) |
| 11.11 | Çar | Reels | Ürün | Defterin dolu. Aklında ne kaldı? | Defterin dolu. Aklında ne kaldı? | Durum sorusu | NotebookDoodle | ikisi | I 18:50 · T 18:50 · Y 18:50 |
| 12.11 | Per | Görsel | Ürün | SinoAI her dosyayı okur | Notların hangi biçimde olursa olsun, SinoAI okur. | Kimlik | PromoDeck/tool | ikisi | I 10:25 · T 10:25 |
| 13.11 | Cum | Reels | Ürün | Sana özel deneme | Sadece sana basılmış bir deneme? | Merak boşluğu | PrintShop | ikisi | I 07:17 · T 22:46 · Y 18:53 |
| 14.11 | Cmt | Kaydırmalı | Ürün | SinoAI’ye sorman gereken 5 şey | SinoAI’ye ne soracağını bilmiyor musun? Bunlarla başla. | Merak boşluğu | PromoDeck/prompt | ikisi | I 17:39 · T 17:39 |
| 15.11 | Paz | Reels | Ürün | Grup sessiz, soru cevapsız | Grup sessiz. Soru hâlâ cevapsız. | Hikâye | GroupChat | web | I 09:27 · T 09:27 · Y 20:38 |
| 16.11 | Pzt | Reels | Ürün | Bu haftanın sınav hava durumu | Sınav hava durumu: Matematik’te fırtına. | Akışı kırma | StudyForecast | mobil | I 20:53 · T 09:47 · Y 20:53 |
| 17.11 | Sal | Kaydırmalı | Ürün | Netin aynı kalıyorsa | Netin aynı kalıyorsa nedeni bu 3 şeyden biri. | Hata | PromoDeck/diagnosis | mobil | I 19:09 · T 07:46 |
| 18.11 | Çar | Reels | Ürün | Eksik parça burada | Netin neden artmıyor? Eksik parça. | Merak boşluğu | PuzzleGap | mobil | I 18:50 · T 18:50 · Y 18:50 |
| 19.11 | Per | Görsel | Ürün | KPSS’ye çalışırken işe de gidiyorsan | KPSS’ye çalışırken işe de gidiyorsan, bu senin için. | Kimlik | PromoDeck/floating | mobil | I 10:25 · T 10:25 |
| 20.11 | Cum | Reels | Ürün | Yanlışını silip geçme | Yanlışını silme. Önce nedenini öğren. | Hata | ScanViewfinder | mobil | I 07:17 · T 22:46 · Y 18:53 |
| 21.11 | Cmt | Kaydırmalı | Ürün | Derdini seç, aracını bul | Derdini seç, aracını bul. | Kimlik | PromoDeck/flow | mobil | I 17:39 · T 17:39 |
| 22.11 | Paz | Reels | Topluluk | POV: Deneme bitti | POV: Deneme bitti, planın hazır. | Kimlik | PovText | mobil | I 09:27 · T 09:27 · Y 20:38 |
| 23.11 | Pzt | Reels | Ürün | Bir kart seç | Bir kart seç. Biliyor musun? | Meydan okuma | CardTrick | mobil | I 20:53 · T 09:47 · Y 20:53 |
| 24.11 | Sal | Reels | Anlar | 24 Kasım: Başöğretmen | Bir tebeşir, bir kara tahta, bir millet. | Hikâye | Basogretmen | marka | **08:00** (özel) |
| 25.11 | Çar | Reels | Ürün | Bu haftaya kaç konu sığar? | Bu haftaya kaç konu sığar? | Meydan okuma | BlockWeek | mobil | I 18:50 · T 18:50 · Y 18:50 |
| 26.11 | Per | Görsel | Ürün | Bir fotoğraf, üç cevap | Bir fotoğraf, üç cevap. | Sonuçtan başlama | PromoDeck/proof | mobil | I 10:25 · T 10:25 |
| 27.11 | Cum | Reels | Ürün | TYT kampı YouTube’da | TYT kampı YouTube’da. Ücretsiz. | Sonuçtan başlama | CampTrailer | youtube | I 07:17 · T 22:46 · Y 18:53 |
| 28.11 | Cmt | Kaydırmalı | Topluluk | Kasım bitmeden kendine 5 soru sor | Kasım bitmeden kendine 5 soru sor. | Meydan okuma | PromoDeck/checklist | mobil | I 17:39 · T 17:39 |
| 29.11 | Paz | Reels | Ürün | Telefonda da bilgisayarda da | Plan telefonda, sen bilgisayarda mı? | Durum sorusu | DualScreen | web | I 09:27 · T 09:27 · Y 20:38 |
| 30.11 | Pzt | Reels | Ürün | Hangi seviyedesin? | Hangi seviyedesin? Kolay, Orta, Zor. | Meydan okuma | LevelSelect | mobil | I 20:53 · T 09:47 · Y 20:53 |

## 3. Hikâyeler (her gün, yalnız Instagram)

Seçenekler görselin içine çizilir; anket etiketi Buffer'dan eklenemez.

| Tarih | Saat | Hikâye hook'u | Destekler |
|---|---|---|---|
| 01.11 | 07:00 | Bugün ne çalışacağını nasıl seçiyorsun? | Bugünkü dersin şansa mı kaldı? |
| 02.11 | 17:53 | Kasım’da kaç gün çalışacaksın? | Kasım 30 gün. Kaçında çalışacaksın? |
| 03.11 | 16:09 | Kasım planın hazır mı? | Kasım planın 4 adımda |
| 04.11 | 15:50 | Çalışırken telefonuna kaç kez bakıyorsun? | Telefonunu bırakmanın en iyi yolu |
| 05.11 | 07:25 | Bugünün planı hazır. | Planın hazır |
| 06.11 | 07:00 | Bu hafta kaç saat çalıştın? | Bu haftanın fişi |
| 07.11 | 14:39 | Bugün hangi gündesin? | Bugün hangi gündesin? |
| 08.11 | 07:00 | Sol mu, sağ mı? | Aynı gün, iki öğrenci |
| 09.11 | 17:53 | Hızlı mı, derin mi? | Hızlı mı, derin mi? Sen seç. |
| 10.11 | **09:05** | Saygı, sevgi ve özlemle. | 10 Kasım: Saat 09.05 |
| 11.11 | 15:50 | Notlarını tekrar ediyor musun? | Defterin dolu. Aklında ne kaldı? |
| 12.11 | 07:25 | Notların en çok hangi biçimde? | SinoAI her dosyayı okur |
| 13.11 | 07:00 | Sana özel bir deneme ister misin? | Sana özel deneme |
| 14.11 | 14:39 | SinoAI’ye en son ne sordun? | SinoAI’ye sorman gereken 5 şey |
| 15.11 | 07:00 | Gece sorduğun soruya kim cevap veriyor? | Grup sessiz, soru cevapsız |
| 16.11 | 17:53 | Bu hafta hangi derste fırtına var? | Bu haftanın sınav hava durumu |
| 17.11 | 16:09 | Netin son 3 denemede değişti mi? | Netin aynı kalıyorsa |
| 18.11 | 15:50 | Senin eksik parçan hangi konu? | Eksik parça burada |
| 19.11 | 07:25 | İşten sonra kaç dakika çalışabiliyorsun? | KPSS’ye çalışırken işe de gidiyorsan |
| 20.11 | 07:00 | Yanlışlarına geri dönüyor musun? | Yanlışını silip geçme |
| 21.11 | 14:39 | Bugünkü derdin ne? | Derdini seç, aracını bul |
| 22.11 | 07:00 | Deneme bitince ilk ne yapıyorsun? | POV: Deneme bitti |
| 23.11 | 17:53 | Bir kart seç. | Bir kart seç |
| 24.11 | **12:30** | Öğretmenler Günün kutlu olsun. | 24 Kasım: Başöğretmen |
| 25.11 | 15:50 | Bu hafta kaç konu çalışacaksın? | Bu haftaya kaç konu sığar? |
| 26.11 | 07:25 | Takıldığın sorunun fotoğrafını çek. | Bir fotoğraf, üç cevap |
| 27.11 | 07:00 | TYT kampı YouTube’da. | TYT kampı YouTube’da |
| 28.11 | 14:39 | Kasım’ı kaç puanla bitiriyorsun? | Kasım bitmeden kendine 5 soru sor |
| 29.11 | 07:00 | En çok nereden çalışıyorsun? | Telefonda da bilgisayarda da |
| 30.11 | 17:53 | Hangi seviyedesin? | Hangi seviyedesin? |

## 4. Özel günler

Sahibin isteği (29 Ekim): o günlere özel, Atatürk temalı, heyecan veren ve tüyleri diken diken eden anma ve konuşma kurguları. İki gün de takvimde kaydırmalı günüydü; reels ve Shorts oldular ve kendi saatlerinde çıkarlar.

**Reklam yok, yalnız logo (sahip, 29 Ekim).** Bu iki günde:
- ürün, çağrı, "indir", bağlantı, marka adı ve `#sinavika` yoktur;
- görselde yalnız köşede küçük bir logo bulunur;
- hashtag'ler yalnız güne aittir.

Test bunu denetler.

### 10 Kasım · 09.05 · `AtaturkMemorial`
- **Açılış:** Saat 09.05'te durur, siren başlar: "Saat 09.05. Zaman durdu."
- **Malzeme:** 1933 kamu malı film (`public/Media/History/Film1933`) ve Atatürk'ün kendi sesi. Ses, Onuncu Yıl Nutku'nun 29 Ekim reels'inde kullanılmayan kesitlerinden gelir.
- **Ses:** Seslendirme, yapay ses ve taklit yoktur. Müzik sabit ve kısıktır (sahibin 29 Ekim notu).
- **Görünüm:** RepublicDay'den farklıdır: tek saat, siren, sessizlik, ağır çekim, gren, siyah-beyaz.
- **Kapanış:** "Saygı, sevgi ve özlemle." Küçük logo, ürün çağrısı yok.
- **Hikâye:** 09.05'te kamu malı portre ve "10 Kasım 1938 · 09.05".
- **Saat:** 09.05, Atatürk'ün aramızdan ayrıldığı dakika. Reels ve hikâye aynı anda çıkar; bundan daha anlamlı bir saat yok.
- **Hashtag:** #10Kasım #Atatürk #SaygıylaAnıyoruz

### 24 Kasım · 08.00 · `Basogretmen`
- **Açılış:** Kara tahtada tebeşir sesi: "Bir tebeşir, bir kara tahta, bir millet."
- **Arşiv:** 1928 harf devrimi döneminden, kara tahta başındaki Atatürk'ün kamu malı fotoğrafları. Kaynak ve lisans brifte yazılır.
- **Söz:** "Öğretmenler! Yeni nesil sizin eseriniz olacaktır." sözü tebeşirle belirir. Ardından tahtadan bugünün sınıflarına geçilir.
- **Ses:** Doğa kısa bir anma ve teşekkür okur. Atatürk'ün sesi taklit edilmez; sözü ekranda, adıyla yazılır.
- **Kapanış:** "Sana ilk harfi kim öğretti? Öğretmenini etiketle." Köşede yalnız küçük logo.
- **Saat önerisi:** Reels 08.00'de çıkar. Öğrenciler okula giderken ve tören öncesinde telefondadır, öğretmenlere teşekkür mesajları sabah başlar; video günün tamamında paylaşılabilir. Hikâye 12.30'da öğle arasında ikinci bir hatırlatma olur: "Öğretmenini etiketle."
- **Hashtag:** #24Kasım #ÖğretmenlerGünü #Başöğretmen

## 5. Üretim kuralları

- Her reels yeni bir şablon, yeni bir sahne dili ve yeni bir müzikle yapılır ([`AdPrompt.md`](../AdPrompt.md)). Test, Ekim şablonlarıyla çakışma olmadığını da denetler.
- Hook ilk saniyede görüntü, yazı ve sesle birlikte gelir. İlk kare kapaktır ve tek kapak standardındadır ([`Sosyal-Kimlik-Standardi.md`](../Sosyal-Kimlik-Standardi.md)). Kapanış ortak `AppEndCard` ile yapılır ve 3 saniye sürer.
- **Tempo (29 Ekim ölçümü ve Gemini değerlendirmesi, [`SocialCreativePlaybook.md`](../SocialCreativePlaybook.md) §11).** Tanıtım reels'lerinin süreleri bu kurala göre yeniden yazıldı; test denetler:
  - Ekran hook'u en fazla 5 kelimedir.
  - İçerik 0–15 saniye, bitiş kartı 15–18 saniye.
  - Seslendirme hook'la başlar, en fazla 190 karakterdir ve "Sınavika'yı indir" demez; bunu kart söyler.
  - 10 ve 24 Kasım kendi ritmindedir ve kartsızdır.
- Ses Doğa'dır (Eleven v4). Seslendirmede boşluk ve kesik cümle kontrolü yapılır. Müzik her reels için ElevenLabs Music'ten ayrı üretilir.
- Ekranlar gerçek uygulama ekranlarıdır (`AppScreens`, UI/UX v3). Telefon çerçevesi ortak `PHONE_GEOMETRY`'yi kullanır. Lacivert ya da açık zemin kullanılır; kahverengi ve yasaklı gradyan kullanılmaz.
- Gönderiler `PromoDeck` ile yapılır. Beş yeni görünüş eklenir: `mood`, `prompt`, `diagnosis`, `flow`, `checklist`. Kapak boş kalmaz; 2. sayfa ikinci hook'tur.
- Her gönderi yayın öncesi kontrol listesinden geçer ([`SocialCreativePlaybook.md`](../SocialCreativePlaybook.md) §10).

## 6. Üretim sırası ve iş yükü

- 20 yeni reels şablonu, 5 yeni gönderi görünüşü ve 30 hikâye görseli üretilecek.
- Gönderiler yayından en az bir hafta önce hazır olmalı. 1–8 Kasım için zaman dar: 1 Kasım reels'i 3 gün sonra yayında.
- **Önerilen sıra:**
  1. 1–3 Kasım.
  2. 4–8 Kasım.
  3. 10 Kasım (arşiv kesitleri ve onay için erken).
  4. 9–15 Kasım.
  5. 24 Kasım (fotoğraf kaynağı ve lisansı için erken).
  6. Kalanlar haftalık partilerle.
- Her parti teslim edilince admin panelinden onaylanır. Reddedilen gönderi notuyla geri gelir ve `replacesPostId` ile yeniden gönderilir.

## 7. Üretimden önce doğrulanacaklar

| Gün | Doğrulanacak |
|---|---|
| 6 Kas | Ders Planı › İlerleme ekranında haftalık deneme, test ve odak süresi gerçekten görünüyor mu? Görünmüyorsa fişin satırları gerçek alanlara göre değişir |
| 1, 3, 18 Kas | "Deneme sonucu → eksik konu → bugünün görevi" akışı uygulamada nasıl görünüyor? Hangi ekranlar? |
| 4 Kas | Ders Planı'ndaki odak süresi ekranı ve süre seçenekleri |
| 9 Kas | SinoAI'deki Hızlı, Dengeli ve Derin seviyeleri uygulamada aynı adlarla mı? |
| 13 Kas | SinoAI'nin kişisel deneme seçenekleri (tam ve branş) |
| 15 Kas | sinavika.com'da hesap açmadan SinoAI hâlâ açık mı? |
| 29 Kas | Deneme sonucu telefona bildirim olarak geliyor mu? |
| 30 Kas | Testler'de seviye seçimi; Kolay, Orta ve Zor'un her biri 20 soru mu? |
| 10 Kas | Onuncu Yıl Nutku'ndan kullanılacak kesitler ve dökümü |
| 24 Kas | 1928 kara tahta fotoğraflarının Commons kaynağı ve lisansı |
| 19 Kas | Haberlere göre KPSS Ortaöğretim sonuçları 19 Kasım'da açıklanıyor. ÖSYM'den doğrulanırsa o günün hikâyesi buna çevrilebilir |

## 8. Açık kararlar

1. **Özel gün saatleri.** Öneri: 10 Kasım reels ve hikâye 09.05; 24 Kasım reels 08.00, hikâye 12.30 (§4). Sahip onaylarsa kesinleşir.
2. **Fiyat ve indirim.** Ayın son cuma günü için fiyat ya da indirim kampanyası planlanmadı, çünkü fiyatlar doğrulanmadı.
3. **Tekrar eden seri.** Topluluk içeriklerinde aynı şablonla haftalık bir seri, üretim yükünü azaltır. Bu, tanıtımların her seferinde yeni olması kuralının bir istisnası olur; sahibin iznini gerektirir.
