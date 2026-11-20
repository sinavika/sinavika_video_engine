# 14 · Web sitesi: giriş öncesi sayfalar

Güncelleme: 20 Kasım 2026 · Çizim kodu: `src/UIUX/Screens/Site/SitePages.tsx`, metin ve ekran eşlemesi: `src/UIUX/Screens/Site/SiteContent.ts` · Çizimler: `Desktop\Sinavika-UIUX3\{acik,koyu}\web-site\`

> **Sahip kararları (20 Kasım 2026).** Kodlamadan önce okunur.
> - Ürün detay sayfalarında her özelliğin kendi görseli ve anlatımı olur; "tek giriş görseli, 3 kart" düzeni kalkar.
> - Hakkımızda gerçekten şirketi anlatır: misyon, yaklaşım, ürün, sınavlar, değerler, şirket bilgileri.
> - İletişim düz liste değildir: kanal kartları, form, Destek Merkezi yönlendirmesi, şirket bilgileri.
> - Paketler: önce sınav (YKS | KPSS), KPSS'de önce tür, sonra süre; **tek paket kartı**. Üç kart yan yana dizilmez. **Sayfanın hiçbir yerinde YDT yazmaz.**
> - Uydurma sayı ya da istatistik yok (UIUX-Rehberi §0). Sayfadaki sayılar ya ürünün kuralıdır (3 seviye × 20 soru, 1 / 3 / 7 gün tekrar, 3 gün ücretsiz) ya da API'den gelir (fiyat, süre, deneme hakkı, konu sayısı, takvim).
> - Site sakin kalır: beyaz ve paletteki griler, turuncu yalnız ana düğmede. Modül rengi sayfada yalnız kimlik işareti olarak görünür (karo, çip, bağlantı karoları); ürünün renkleri telefon ve tarayıcı içindeki gerçek çizimlerdedir.

## 1. Çizimler

Her sayfa iki genişlikte çizilir: masaüstü 1440 pt (PNG 2880 px) ve telefon 390 pt (`-mobil`). Telefon PNG'si 3× yazılır; ancak 16.000 px'ten uzun sayfada ölçek küçülür, çünkü Chrome daha uzun resim çekemiyor. Ürün sayfaları bu yüzden yaklaşık 1,7× (≈ 670 px genişlik) yazılır. İkisi de açık ve koyu temada, TR ve EN.

| Çizim | Sayfa | Rota |
|---|---|---|
| `s-urun-ders-plani` · `-mobil` | Ürün · Ders Planı | `/[locale]/urunler/ders-plani` |
| `s-urun-dersler` · `-mobil` | Ürün · Dersler | `/[locale]/urunler/ders-cal` |
| `s-urun-testler` · `-mobil` | Ürün · Testler | `/[locale]/urunler/testler` (**yeni rota**; bugün Testler'in sayfası yok) |
| `s-urun-denemeler` · `-mobil` | Ürün · Denemeler | `/[locale]/urunler/denemeler` |
| `s-urun-bilgi-kartlari` · `-mobil` | Ürün · Bilgi Kartları | `/[locale]/urunler/flashcard` |
| `s-urun-akilli-ozet` · `-mobil` | Ürün · Akıllı Özet | `/[locale]/urunler/lens` |
| `s-urun-sinoai` · `-mobil` | Ürün · SinoAI | `/[locale]/urunler/sinoai` |
| `s-hakkimizda` · `-mobil` | Hakkımızda | `/[locale]/corporate/about` |
| `s-iletisim` · `-mobil` | İletişim | `/[locale]/corporate/contact` |
| `s-sss` | SSS | `/[locale]/corporate/sss` |
| `s-sinav-yks` · `-mobil` | Sınav sayfası şablonu (YKS örneği) | `/yks-hazirlik`, `/tyt-hazirlik`, `/ayt-hazirlik`, `/kpss-lisans`, `/kpss-onlisans`, `/kpss-ortaogretim` |
| `s-deneme-sinavi` · `-mobil` | Deneme sayfası şablonu | `/online-deneme-sinavi`, `/yks-deneme-sinavi`, `/kpss-deneme-sinavi`, `/turkiye-geneli-deneme-sinavi` |
| `s-paketler` · `-mobil` | Paketler · YKS seçili | `/[locale]/corporate/packages` |
| `s-paketler-kpss` · `-mobil` | Paketler · KPSS seçili | aynı sayfa, KPSS sekmesi |

Kalkan çizimler: `s-urun-ozet` (yerine `s-urun-akilli-ozet`), `s-sss-iletisim` (yerine `s-sss` ve `s-iletisim`).

## 2. Ortak düzen

### 2.1 Ölçüler ve kırılımlar

| | Masaüstü (≥ 1024 px) | Tablet (768–1023 px) | Telefon (< 768 px) |
|---|---|---|---|
| Yan boşluk | 112 | 48 | 20 |
| İçerik genişliği | 1216 (en çok) | akışkan | akışkan |
| Bant dikey boşluğu | 72–80 | 56 | 36–40 |
| Izgaralar | çizimdeki sütun sayısı | 2 sütun | tek sütun (7 modül ızgarası 2 sütun) |
| Metin + görsel satırı | yan yana, özelliklerde sırayla yer değiştirir | yan yana, görsel %45 | alt alta: önce metin, sonra görsel |

Tabletin ayrı çizimi yoktur; masaüstü düzeni bu kurallarla daralır.

### 2.2 Bantlar

- Sayfa bantlardan oluşur. Zemin sırayla `card` (beyaz) ve `bg` (açık gri) değişir; bantlar arasında çizgi yok.
- Bant başlığı `SiteTitle`: üst etiket (`over`, 12 / 800, büyük harf aralıklı, `muted`), başlık (masaüstü 36–44, telefon en çok 30; satır yüksekliği 1,12; harf aralığı −0,03 em), isteğe bağlı açıklama (masaüstü 18 / 28, telefon 16 / 24, en çok 720 genişlik).
- Header ve footer bugünkü site parçalarıdır (`SiteHeader`, `SiteFooter`). Telefonda header 60 pt: solda yazı logo, sağda "Kayıt Ol" (36 pt) ve menü düğmesi (36 pt yuvarlak). Footer telefonda iki sütunlu bağlantı ızgarası; ödeme logoları ve © alt alta.

### 2.3 Ekran görseli paneli (`ShotPanel`)

Bütün ürün görselleri gerçek UI/UX çizimleridir; elle ekran çizilmez.

- **Panel:** `line2` zemin, köşe 28, taşan kısım gizli.
- **Telefon:** çerçeveli telefon panelin ortasında, üstten 30 pt; alt kenardan taşar (ekranın üst kısmı görünür). Genişlik: adım kartında 190–200, özellikte 250 (telefonda 220).
- **Yakın çekim** (`zoom`): telefon panel genişliğinde (en çok 380) büyütülür ve ekranın `zoom` pt aşağısındaki kısmı panelin üstüne gelecek kadar yukarı kayar. Belgede "yakın çekim (üstten N pt)" diye yazar.
- **Tarayıcı:** panelin içinde her yandan 32 pt boşlukla; üstte üç noktalı başlık çubuğu (30 pt).
- **Görsel kaynağı:** her görselin çizim kimliği yazılıdır (ör. `m-plan-bugun`). Web, aynı adlı PNG'yi `Sinavika-UIUX3\acik\mobil\` (koyu temada `koyu\mobil\`), tarayıcı görselleri için `web-panel\` klasöründen alır. Önerilen yol: `public/site/screens/{acik,koyu}/<kimlik>.png`, `next/image`, temaya göre `<picture>` ile seçim. Ürün değişince PNG'ler yeniden alınır (UIUX-Rehberi "gerçek çizimler").
- **Erişilebilirlik:** her görselin `alt` metni o adımın ya da özelliğin başlığıdır.

### 2.4 Ortak parçalar

- **Giriş bandı (hero):**
  - Solda 540–620 genişlikte sütun: kırıntı (`small`, 700), varsa modül karosu ve çipi, başlık (masaüstü 52 / 58, telefon 34 / 40), giriş metni (18 / 29; telefon 16 / 25), düğmeler, alt not.
  - Sağda tarayıcı (600 genişlik, üstten 18) ve onun sağ üstüne binen telefon (210–220, üstten 50–56).
  - Telefonda düğmeler tam genişlik, alt alta; görsel olarak yalnız telefon, 380 pt yüksek panelde.
- **Kimin için şeridi:** üst ve alt ince çizgili tek satır. "Kimin için" etiketi, sınav çipleri (`YKS · TYT`, `YKS · AYT`, `KPSS Lisans`, `KPSS Önlisans`, `KPSS Ortaöğretim`; 34 pt, kenarlı) ve sağda "Web, iOS ve Android". Telefonda satır kırılır.
- **SSS:** solda 360 genişlikte başlık, "Aradığın cevap yoksa bize yaz." ve "İletişim →". Sağda akordeon: soru satırı 17 / 700, sağda artı / eksi; ilk soru açık. Telefonda alt alta.
  - Her sayfa SSS'sini `FAQPage` yapılandırılmış verisiyle verir (SEO).
- **Kapanış çağrısı (CTA):** `bg` zeminli, kenarlı, köşe 32 kutu.
  - Solda başlık 38 / 44 ve "Mobil uygulamada 3 gün ücretsiz dene. Web ve mobilde aynı hesap."
  - Sağda turuncu "Ücretsiz başla →" ve altında koyu App Store / Google Play.
  - Telefonda alt alta, düğmeler tam genişlik.
- **Düğmeler:**
  - "Ücretsiz başla" → kayıt sayfası (header'daki "Kayıt Ol" ile aynı hedef).
  - Mağaza düğmeleri → mağaza sayfaları.
  - "Nasıl çalışır?" → aynı sayfada `#nasil-calisir` çapasına kaydırır.

## 3. Ürün detay şablonu

Yedi ürün sayfası tek şablondur (`ProductDetail`). Sıra `MODULE_ORDER`. Bantlar yukarıdan aşağı:

1. **Giriş** (`card`): kırıntı "Ürünler › {Modül}"; modül karosu (48) ve modül çipi; başlık, giriş metni; "Ücretsiz başla →" (turuncu) ve "Nasıl çalışır?" (kenarlı); alt not "Mobil uygulamada 3 gün ücretsiz · Web ve mobilde aynı hesap" (`gift` ikonu). Sağda web ve telefon görseli.
2. **Kimin için şeridi** (§2.4).
3. **Nasıl çalışır** (`bg`, çapa `#nasil-calisir`):
   - Üst etiket "Nasıl çalışır"; başlık "{N} adımda {Modül}" / *"{Module} in {N} steps"*.
   - 3–4 kart eşit sütunlarda, eş boyda. Kart: üstte 290 pt yüksek görsel paneli (telefon 200), altta "Adım N" etiketi, başlık 19 / 700 ve metin.
4. **Özellikler** (`card`):
   - Üst etiket "Özellikler"; başlık "{Modül} neler yapar?" / *"What {Module} does"*.
   - Her özellik bir satırdır. Solda 470 genişlikte: numara (`01`, `num` 15, `muted`), başlık 32 / 38, metin 17 / 27 ve tikli maddeler (`checkCircle` 19, `ink2`).
   - Sağda 674 × 440 panel. Satırlar sırayla yer değiştirir (2. ve 4. satırda görsel solda). Satırlar arası 64.
5. **Örnek** (`card` içinde `bg` kutu, köşe 32, iç boşluk 40):
   - Solda "Örnek" çipi (`bulb`), başlık 36 / 42 ve somut senaryo metni.
   - Sağda 480 × 380 panel.
6. **Birlikte çalışır** (`bg`):
   - Başlık "{Modül} ve diğer modüller".
   - 3 kart. Kartta modülün karosu → bağlı modülün karosu (40), bağlı modülün adı, ilişki cümlesi, "Ürünü incele →" (o modülün ürün sayfası).
7. **SSS** (§2.4): başlık "{Modül} hakkında", 5–6 soru.
8. **Kapanış çağrısı**: başlık "{Modül} ile bugün başla".

**Veri:** sayfa durağandır. Paketle değişen tek sayı Denemeler SSS'sindeki deneme hakkıdır (20 / 240); paket API'sinden okunur.

**Metin ve ekranlar:** aşağıdaki tablolar `SiteContent.ts`'ten üretildi. Metin değişirse önce o dosya değişir, sonra bu bölüm yeniden üretilir.

### 3.1 Ders Planı · `/urunler/ders-plani` · çizim `s-urun-ders-plani`, `s-urun-ders-plani-mobil`

- **Başlık:** Her gün ne çalışacağını bil / *Know what to study every day*
- **Giriş metni:** Ders Planı sınav tarihine, boş günlerine ve zorlandığın derslere göre her güne görev koyar. Her görev neden orada olduğunu, ne olduğunu ve ne kadar süreceğini söyler. / *Study Plan puts tasks on every day from your exam date, free days and weak subjects. Each task says why it is there, what it is and how long it takes.*
- **Giriş görselleri:** tarayıcıda `w-plan-bugun`, telefonda `m-plan-bugun` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Hedefini söyle / *Tell us your goal* | Sınavını, haftada kaç gün ve günde kaç dakika çalışacağını seç. / *Pick your exam, how many days a week and minutes a day.* | `m-plan-yok` |
| 2 | Planın hazır / *Your plan is ready* | Bugünün görevleri sırayla gelir: konu, test, deneme ya da kart. / *Today’s tasks come in order: a topic, a quiz, an exam or cards.* | `m-plan-bugun` |
| 3 | Odaklan ve bitir / *Focus and finish* | Görevi tek dokunuşla başlat, odak sayacıyla çalış. / *Start a task with one tap and work with the focus timer.* | `m-plan-odak` |
| 4 | İlerlemeni gör / *See your progress* | Kaç saat çalıştığını ve hangi konuları bitirdiğini takip et. / *Track the hours you studied and the topics you finished.* | `m-plan-ilerleme` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Haftanı tek bakışta gör / *Your week at a glance* | Program sayfası haftanın her gününü görevleri ve süreleriyle gösterir. / *The schedule shows every day of the week with its tasks and minutes.* | Gün gün görev ve dakika / *Tasks and minutes per day*<br>Sınava kalan gün / *Days left to the exam*<br>Web’de geniş görünüm / *A wide view on the web* | `w-plan-program` tarayıcıda |
| 2 | Kaçan görev kaybolmaz / *Missed tasks don’t get lost* | Dünden kalan görevleri bugüne al ya da başka bir güne yerleştir. / *Move yesterday’s tasks to today or to another day.* | Tek dokunuşla bugüne al / *Move to today in one tap*<br>Başka güne taşı / *Move to another day*<br>Plan bozulmaz / *The plan stays intact* | `m-plan-dunden` |
| 3 | Kendi görevini ekle / *Add your own task* | Okulda çözdüğün test ya da kendi kitabın: kendi görevini plana ekle. / *A school test or your own book: add your own task to the plan.* | Süre ve gün seç / *Pick a time and day*<br>Planla aynı listede / *In the same list as the plan* | `m-plan-gorev-ekle` |
| 4 | Konu konu ilerleme / *Progress topic by topic* | Her dersin konularında nerede olduğunu gör: bitti, sürüyor, başlamadı. / *See where you are in every subject: done, in progress, not started.* | Ders ders çubuklar / *A bar for every subject*<br>Sıradaki konu / *The next topic* | `m-plan-konu` yakın çekim (üstten 60 pt) |
| 5 | Çalışma istatistiğin / *Your study statistics* | Gün ve hafta bazında çalışma süren, bitirdiğin görevler ve serin. / *Your study time by day and week, finished tasks and your streak.* | Haftalık grafik / *Weekly chart*<br>Modül modül süre / *Time per module* | `w-plan-istatistik` tarayıcıda |

**Örnek:** Denemenin eksikleri planına geçer / *Your exam gaps go into your plan*

> Denemede Matematik’ten net kaybettin. Analizde “Bu hafta planıma ekle”ye basınca en çok kaybettiğin 3 konu sonraki günlerine 30 dakikalık tekrar olarak eklenir.
>
> *You lost points in Maths. Tap “Add to this week’s plan” in the analysis and the 3 topics you lost most on become 30-minute reviews on your next days.*

Görsel: `m-deneme-analiz-eklendi`.

**Diğer modüllerle bağı**

- Denemeler (`/urunler/…` bağlantısı): Deneme analizindeki eksik konular planına eklenir. / *Gaps from your exam analysis go into your plan.*
- Dersler (`/urunler/…` bağlantısı): Konu görevi Dersler’de kaldığın adımdan açılır. / *A topic task opens in Lessons where you left off.*
- Testler (`/urunler/…` bağlantısı): Test görevi doğrudan o konunun testini başlatır. / *A quiz task starts that topic’s quiz directly.*

**SSS** (ilki açık)

1. **Planı nasıl hazırlıyorsunuz?** Sınav tarihine, seçtiğin çalışma günlerine ve dakikalarına, zorlandığın derslere göre. Deneme çözdükçe eksik konuların da plana girer.  
   *How is the plan made? From your exam date, the days and minutes you chose and your weak subjects. As you take exams, your gaps join the plan.*
2. **Bir günü kaçırırsam ne olur?** Kalan görevler “Dünden kalan” olarak görünür; bugüne alabilir ya da başka güne taşıyabilirsin.  
   *What if I miss a day? Missed tasks show as “From yesterday”; move them to today or another day.*
3. **Planı değiştirebilir miyim?** Evet. Plan ayarlarından günlerini ve süreni değiştir; kendi görevini de ekleyebilirsin.  
   *Can I change the plan? Yes. Change your days and time in plan settings; you can add your own tasks too.*
4. **Web ve mobilde aynı plan mı?** Evet, aynı hesapla iki yerde aynı plan ve ilerleme görünür.  
   *Same plan on web and mobile? Yes, the same account shows the same plan and progress on both.*
5. **KPSS için de çalışır mı?** Evet. YKS (TYT, AYT) ve KPSS Lisans, Önlisans, Ortaöğretim için plan hazırlanır.  
   *Does it work for KPSS? Yes. Plans are made for YKS (TYT, AYT) and KPSS Bachelor’s, Associate and Secondary.*

### 3.2 Dersler · `/urunler/ders-cal` · çizim `s-urun-dersler`, `s-urun-dersler-mobil`

- **Başlık:** Konuyu adım adım öğren / *Learn a topic step by step*
- **Giriş metni:** Dersler her konuyu kısa adımlarla anlatır: tanım, örnek, kural, görsel ve sen cevapladıkça ilerleyen sorular. İstediğin yerde bırak, kaldığın adımdan devam et. / *Lessons teach every topic in short steps: definition, example, rule, picture and questions that move on as you answer. Stop anywhere and pick up where you left off.*
- **Giriş görselleri:** tarayıcıda `w-ders-vitrin`, telefonda `m-ders-tanim` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Dersini seç / *Pick a subject* | Türkçe, Matematik, Fizik… Her derste konular sınav sırasıyla. / *Turkish, Maths, Physics… Topics follow the exam order.* | `m-ders-vitrin` |
| 2 | Adım adım öğren / *Learn step by step* | Her adım tek bir şey anlatır; örnekle pekişir. / *Each step teaches one thing and an example locks it in.* | `m-ders-ornek` |
| 3 | Cevaplayarak ilerle / *Move on by answering* | Önce sen tahmin et, sonra doğrusunu ve nedenini gör. / *Guess first, then see the answer and why.* | `m-ders-tahmin` |
| 4 | Yanlışın tekrar gelir / *Mistakes come back* | İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra Tekrar’da. / *Steps you got wrong come back in Review after 1, 3 and 7 days.* | `m-ders-tekrar` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Okuyarak değil, yaparak / *Learn by doing* | Sırala, eşleştir, grupla, boşluk doldur: her konu etkileşimli adımlarla ilerler. / *Order, match, group, fill the gap: every topic moves on with interactive steps.* | Eşleştir ve grupla / *Match and group*<br>Boşluk doldur / *Fill the gap*<br>Doğru mu yanlış mı / *True or false* | `m-ders-eslestir` |
| 2 | Görselle anlat / *Taught with pictures* | Grafik, şekil ve tablolar adımın içinde; formüller ne anlama geldiğiyle birlikte. / *Charts, figures and tables sit inside the step; formulas come with their meaning.* | Şekil ve grafik / *Figures and charts*<br>Formül ve tablo / *Formulas and tables* | `m-ders-gorsel` |
| 3 | Sınav tarzı soru / *Exam-style questions* | Konunun sonunda sınavdaki gibi bir soruyla kendini dene. / *End the topic with a question like the one in the exam.* | Çözümüyle birlikte / *With the solution*<br>Takılırsan SinoAI’ye sor / *Stuck? Ask SinoAI* | `m-ders-soru` yakın çekim (üstten 40 pt) |
| 4 | Kaldığın yerden devam / *Pick up where you left off* | Konular listesi hangi konuda kaçıncı adımda olduğunu gösterir. / *The topic list shows which step you are on in every topic.* | Konu konu ilerleme / *Progress per topic*<br>Tek dokunuşla devam / *Continue in one tap* | `m-ders-konular` |
| 5 | Web’de geniş oynatıcı / *A wide player on the web* | Aynı konu web’de geniş ekranda; ilerlemen iki yerde aynı. / *The same topic on a wide screen; your progress matches on both.* | Klavyeyle ilerle / *Move on with the keyboard*<br>Aynı hesap, aynı adım / *Same account, same step* | `w-ders-bosluk` tarayıcıda |

**Örnek:** Yanlışın unutulmaz / *Your mistakes aren’t forgotten*

> Sözcükte Anlam’da mecaz anlam adımını ilk denemede yanlış yaptın. O adım 1, 3 ve 7 gün sonra Tekrar’da yeniden karşına gelir; doğru yaptıkça aralık açılır.
>
> *You got the figurative-meaning step wrong the first time. It comes back in Review after 1, 3 and 7 days; the gap grows as you get it right.*

Görsel: `m-ders-tekrar-oturum`.

**Diğer modüllerle bağı**

- Testler (`/urunler/…` bağlantısı): Konu bitince Kolay seviye testiyle pekiştir. / *Finish a topic and lock it in with the Easy quiz.*
- Denemeler (`/urunler/…` bağlantısı): Denemede kaybettiğin konunun anlatımı tek dokunuşla açılır. / *The topic you lost points on opens in one tap.*
- SinoAI (`/urunler/…` bağlantısı): Takıldığın adımı SinoAI’ye sor. / *Ask SinoAI about the step you’re stuck on.*

**SSS** (ilki açık)

1. **Bir konu ne kadar sürer?** Konuya göre değişir; adımlar kısadır ve istediğin yerde bırakabilirsin. Kaldığın adım saklanır.  
   *How long is a topic? It depends on the topic; steps are short and you can stop anywhere. Your step is saved.*
2. **Konular hangi sınava göre?** Hedef sınavına göre: YKS (TYT, AYT) ya da KPSS. Konular MEB kazanımları ve sınav kapsamıyla sıralanır.  
   *Which exam are topics for? Your target exam: YKS (TYT, AYT) or KPSS. Topics follow the curriculum and the exam scope.*
3. **Tekrar nasıl çalışır?** İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra Tekrar’da yeniden gelir.  
   *How does Review work? Steps you got wrong come back after 1, 3 and 7 days.*
4. **Video ders mi?** Hayır. Dersler okuyup cevaplayarak ilerleyen adımlardır; video izlemek yerine konuyu yaparak öğrenirsin.  
   *Are these video lessons? No. Lessons are steps you read and answer; you learn by doing instead of watching.*
5. **İnternetsiz çalışır mı?** Bağlantı koparsa cevapların kaydedilir ve bağlanınca gönderilir.  
   *Does it work offline? If the connection drops, your answers are saved and sent when you reconnect.*

### 3.3 Testler · `/urunler/testler` · çizim `s-urun-testler`, `s-urun-testler-mobil`

- **Başlık:** Konu testleriyle eksiğini kapat / *Close gaps with topic quizzes*
- **Giriş metni:** Testler konu konu, seviye seviye çoktan seçmeli sorulardır. Her soruda doğru ya da yanlışı anında görürsün; yanlışta doğru şık, nedeni ve konunun anlatımı açılır. / *Quizzes are multiple-choice questions by topic and level. You see right or wrong on every question at once; a wrong answer opens the right option, the reason and the topic.*
- **Giriş görselleri:** tarayıcıda `w-test-vitrin`, telefonda `m-test-coz` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Konunu seç / *Pick a topic* | Önce ders, sonra konu: listede hangi konuda nerede olduğun görünür. / *Subject first, then topic: the list shows where you are.* | `m-test-konular` |
| 2 | Seviyeni seç / *Pick a level* | Her konuda Kolay, Orta ve Zor; her seviye 20 soru. / *Easy, Medium and Hard in every topic; 20 questions each.* | `m-test-detay` |
| 3 | Çöz, anında gör / *Answer, see it at once* | Şıkka dokunmak cevaptır; doğru ya da yanlış hemen görünür. / *Tapping an option is your answer; right or wrong shows at once.* | `m-test-coz-yanlis` |
| 4 | Yanlışlarını tekrar et / *Review your mistakes* | Yanlışlarım bütün yanlış sorularını tek yerde toplar. / *My mistakes gathers every wrong answer in one place.* | `m-test-yanlislar` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Yanlıştan öğren / *Learn from mistakes* | Yanlış cevapta doğru şık ve nedeni açılır; konunun anlatımına ya da SinoAI’ye tek dokunuşla geç. / *A wrong answer opens the right option and why; jump to the topic or SinoAI in one tap.* | Doğru şık ve neden / *The right option and why*<br>Konu anlatımı / *The topic*<br>SinoAI’ye sor / *Ask SinoAI* | `m-test-coz-yanlis` yakın çekim (üstten 120 pt) |
| 2 | Senin için hazır / *Ready for you* | Denemede en çok net kaybettiğin konunun sıradaki seviyesi vitrinde seni bekler. / *The next level of the topic you lost most on waits on the home page.* | Denemeye göre öneri / *Suggested from your exam*<br>Kaldığın test / *The quiz you left* | `m-test-vitrin` |
| 3 | Üç seviye, 20’şer soru / *Three levels, 20 each* | Kolaydan zora ilerle; her seviyenin sonucunu ayrı gör. / *Move from easy to hard and see each level’s result.* | Kolay · Orta · Zor / *Easy · Medium · Hard*<br>Seviye seviye sonuç / *Results by level* | `m-test-detay` yakın çekim (üstten 60 pt) |
| 4 | Çözümler ve işaretli sorular / *Solutions and flagged questions* | Bitirdiğin testlerin çözümleri; işaretlediğin soruları ayrı süz. / *Solutions of your finished quizzes; filter the questions you flagged.* | Test test çözümler / *Solutions per quiz*<br>İşaretli süzgeci / *Flagged filter* | `m-test-cozumler` |
| 5 | Web’de de aynı / *The same on the web* | Yanlışlarını web’de geniş ekranda gözden geçir. / *Go through your mistakes on a wide screen.* | Soru numaraları tek bakışta / *All question numbers at once*<br>Aynı hesap / *Same account* | `w-test-yanlislar` tarayıcıda |

**Örnek:** Denemeden teste tek adım / *From exam to quiz in one step*

> Denemede Üslü Sayılar’dan net kaybettin. Testler vitrinindeki “Senin için hazır” kartı o konunun sıradaki seviyesini açar; 20 soruda eksiğini kapatırsın.
>
> *You lost points on Exponents. The “Ready for you” card opens that topic’s next level; close the gap in 20 questions.*

Görsel: `m-test-bitti`.

**Diğer modüllerle bağı**

- Dersler (`/urunler/…` bağlantısı): Yanlışta konunun anlatımı Dersler’de açılır. / *A wrong answer opens the topic in Lessons.*
- Denemeler (`/urunler/…` bağlantısı): Denemede kaybettiğin konu testlere öneri olarak gelir. / *Topics you lost on in exams become suggestions.*
- SinoAI (`/urunler/…` bağlantısı): Anlamadığın soruyu SinoAI’ye sor. / *Ask SinoAI about a question you don’t get.*

**SSS** (ilki açık)

1. **Test ile deneme arasındaki fark ne?** Test öğrenmek içindir: doğruyu her soruda hemen görürsün. Deneme sınav provasıdır: sonuç teslimden sonra açılır.  
   *Quiz or exam: what’s the difference? A quiz is for learning: you see the answer after every question. An exam is a rehearsal: results open after you submit.*
2. **Kaç seviye var?** Her konuda üç seviye: Kolay, Orta, Zor. Her seviye 20 sorudur.  
   *How many levels? Three per topic: Easy, Medium, Hard. Each has 20 questions.*
3. **Yanlışlarımı nerede görürüm?** Yanlışlarım bütün testlerdeki yanlış sorularını tek yerde toplar.  
   *Where are my mistakes? My mistakes collects every wrong answer from all quizzes.*
4. **Bağlantı koparsa cevabım gider mi?** Hayır. Cevap kaydedilir; bağlanınca gönderilir ve doğrusu o zaman görünür.  
   *Do I lose answers offline? No. Your answer is saved and sent when you reconnect; the right answer shows then.*
5. **Sorular hangi sınava göre?** Hedef sınavına göre: YKS (TYT, AYT) ya da KPSS.  
   *Which exam are questions for? Your target exam: YKS (TYT, AYT) or KPSS.*

### 3.4 Denemeler · `/urunler/denemeler` · çizim `s-urun-denemeler`, `s-urun-denemeler-mobil`

- **Başlık:** Denemeni çöz, netini gör / *Take an exam, see your score*
- **Giriş metni:** Denemeler gerçek sınavın provasıdır. Türkiye geneli ve branş denemelerine gir, süreli çöz, teslim et. Sonra netini, sıralamanı, çözümleri ve hangi konudan kaç net kaybettiğini gör. / *Exams are a rehearsal for the real thing. Join nationwide and subject exams, solve on the clock and submit. Then see your score, rank, solutions and where you lost points.*
- **Giriş görselleri:** tarayıcıda `w-deneme-sonuc`, telefonda `m-deneme-vitrin` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Denemeni seç / *Pick an exam* | Canlı denemeye hatırlatma kur ya da açık denemeye hemen gir. / *Set a reminder for a live exam or start an open one now.* | `m-deneme-detay` |
| 2 | Süreli çöz / *Solve on the clock* | Sınavdaki gibi: doğru ya da yanlış çözerken görünmez. / *Like the real exam: right or wrong stays hidden while you solve.* | `m-deneme-coz` |
| 3 | Sonucunu gör / *See your result* | Netin, ders ders sonucun ve sıralaman. / *Your score, results per subject and your rank.* | `m-deneme-sonuc` |
| 4 | Eksiğini kapat / *Close the gaps* | Net kaybettiğin konular, her biri bir eylemle: konu, test ya da plan. / *Topics you lost points on, each with an action: lesson, quiz or plan.* | `m-deneme-analiz` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Konu konu net analizi / *Points lost by topic* | Hangi konudan kaç net kaybettiğini sırayla gör; her konunun yanında anlatım ve test. / *See in order where you lost points; each topic comes with a lesson and a quiz.* | Kaybın en çok olduğu konu üstte / *Biggest loss on top*<br>Konu anlatımı ve test / *Lesson and quiz*<br>Bu hafta planıma ekle / *Add to this week’s plan* | `m-deneme-analiz` yakın çekim (üstten 70 pt) |
| 2 | Net gelişimin tek grafikte / *Your progress in one chart* | Son denemelerin yan yana; dışarıda çözdüğün denemeleri de ekle. / *Your last exams side by side; add exams you took elsewhere.* | TYT ve AYT ayrı / *TYT and AYT apart*<br>Dışarıda çözdüğün deneme / *Exams from elsewhere* | `m-deneme-sonuclar-disarida` |
| 3 | Soru soru çözümler / *Solutions question by question* | Teslimden sonra her sorunun doğrusu ve çözümü; yalnız yanlışlarını süz. / *After you submit, every answer and solution; filter only your mistakes.* | Yanlışlar · Boşlar süzgeci / *Wrong · Blank filter*<br>SinoAI’ye sor / *Ask SinoAI* | `m-deneme-cozum` |
| 4 | Ders gelişimi / *Progress by subject* | Her dersin netini deneme deneme izle. / *Follow each subject’s score exam by exam.* | Ders ders çizgi / *A line per subject*<br>Artış ve düşüş / *Rises and falls* | `m-deneme-gelisim` |
| 5 | Web’de sonuç ve analiz / *Results on the web* | Sonuçlar sayfası denemelerini ve netlerini geniş ekranda gösterir. / *The results page shows your exams and scores on a wide screen.* | Ders ders net sütunları / *Score columns per subject*<br>ÖSYM düzeninde tablo / *ÖSYM-style table* | `w-deneme-sonuclar` tarayıcıda |

**Örnek:** Deneme bitince ne çalışacağını bilirsin / *After the exam you know what to study*

> Deneme bitince hangi konudan kaç net kaybettiğini görürsün. En çok kaybettiğin konunun anlatımını açar, 20 soruluk testini çözer ya da “Bu hafta planıma ekle” ile planına koyarsın.
>
> *After the exam you see where you lost points. Open the lesson for your biggest loss, take its 20-question quiz or add it to this week’s plan.*

Görsel: `m-deneme-analiz-eklendi`.

**Diğer modüllerle bağı**

- Dersler (`/urunler/…` bağlantısı): Kaybettiğin konunun anlatımı Dersler’de. / *The topic you lost on opens in Lessons.*
- Testler (`/urunler/…` bağlantısı): Aynı konunun testi Testler’de. / *That topic’s quiz opens in Quizzes.*
- Ders Planı (`/urunler/…` bağlantısı): Eksik konular bu haftanın planına eklenir. / *Gaps go into this week’s plan.*

**SSS** (ilki açık)

1. **Denemeler ÖSYM formatında mı?** Evet. Soru sayısı, süre ve net hesabı sınavın kendi kurallarıyla.  
   *Do exams follow the ÖSYM format? Yes. Question count, time and scoring follow the exam’s own rules.*
2. **Türkiye geneli deneme nedir?** Belli bir zaman aralığında herkesin girdiği denemedir; sonuçta sıralaman da görünür.  
   *What is a nationwide exam? An exam everyone takes in the same window; your rank shows in the result.*
3. **Çözerken doğruyu görebilir miyim?** Hayır, sınavdaki gibi. Doğru ve yanlış teslimden sonra çözümlerde açılır.  
   *Can I see answers while solving? No, like the real exam. Answers open in the solutions after you submit.*
4. **Yarıda bırakırsam?** Ara verebilirsin; deneme kaldığın sorudan devam eder.  
   *What if I stop halfway? You can pause; the exam continues from where you stopped.*
5. **Dışarıda çözdüğüm denemeyi ekleyebilir miyim?** Evet. Netlerini gir; gelişim grafiğinde çizgili sütun olarak görünür.  
   *Can I add exams from elsewhere? Yes. Enter your scores; they show as hatched bars in the chart.*
6. **Kaç denemeye girebilirim?** Paketine göre: aylık pakette 20, yıllık pakette 240 deneme hakkı.  
   *How many exams can I take? Depends on your plan: 20 on monthly, 240 on yearly.*

### 3.5 Bilgi Kartları · `/urunler/flashcard` · çizim `s-urun-bilgi-kartlari`, `s-urun-bilgi-kartlari-mobil`

- **Başlık:** Öğrendiğini aklında tut / *Keep what you learn*
- **Giriş metni:** Bilgi Kartları unutmak üzere olduğun kartı tam zamanında önüne getirir. Kartı çevir, cevabı gör, ne kadar hatırladığını işaretle; sıradaki tekrar zamanı buna göre seçilir. / *Flashcards bring back each card just before you’d forget it. Flip it, see the answer and mark how well you knew it; the next review is timed from that.*
- **Giriş görselleri:** tarayıcıda `w-kart-vitrin`, telefonda `m-kart-on` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Bugünün kartları / *Today’s cards* | Tekrar zamanı gelen kartlar her gün tek listede. / *Cards due for review in one list every day.* | `m-kart-bugun` |
| 2 | Kartı çevir / *Flip the card* | Önce kendin hatırla, sonra cevabı gör. / *Recall it first, then see the answer.* | `m-kart-on` |
| 3 | Ne kadar hatırladın? / *How well did you know it?* | Bilmiyorum, Emin değilim ya da Biliyorum: sıradaki tekrar buna göre. / *Don’t know, Not sure or Know it: the next review follows.* | `m-kart-arka` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Ders, konu, deste / *Subject, topic, deck* | Her konunun kartları bir destedir; ders ders göz at. / *Each topic’s cards are a deck; browse by subject.* | Konu konu desteler / *A deck per topic*<br>Kaldığın kart / *The card you left* | `m-kart-desteler` |
| 2 | Kaydet, sonra bak / *Save it for later* | Tekrar bakmak istediğin kartları kaydet; hepsi tek listede. / *Save the cards you want to see again; all in one list.* | Tek dokunuşla kaydet / *Save in one tap*<br>Kaydedilenler sekmesi / *Saved tab* | `m-kart-kaydedilen` |
| 3 | Kendi notundan deste / *A deck from your notes* | SinoAI notundan ya da PDF’inden sana özel kart destesi hazırlar. / *SinoAI makes a personal deck from your notes or PDF.* | Kişisel deste / *Personal deck*<br>Bilgi Kartları’nda açılır / *Opens in Flashcards* | `m-sino-sonuc` |
| 4 | Günü bitir, seriyi koru / *Finish the day, keep the streak* | Bugünün kartları bitince kaç kart tekrar ettiğini ve serini gör. / *When today’s cards are done, see how many you reviewed and your streak.* | Günlük seri / *Daily streak*<br>Yarının kartları / *Tomorrow’s cards* | `m-kart-bitti` |
| 5 | Web’de göz at / *Browse on the web* | Desteleri web’de geniş ekranda gez, oturumu klavyeyle ilerlet. / *Browse decks on a wide screen and move on with the keyboard.* | Ders ders göz at / *Browse by subject*<br>Aynı hesap / *Same account* | `w-kart-gozat` tarayıcıda |

**Örnek:** Unutmadan önce tekrar / *Review before you forget*

> “Bilmiyorum” dediğin kart yakında yeniden gelir; “Biliyorum” dediğin kartın arası açılır. Böylece zamanını bildiğin kartlara değil, unutmak üzere olduklarına harcarsın.
>
> *A card you didn’t know comes back soon; one you knew comes back later. Your time goes to the cards you’re about to forget.*

Görsel: `m-kart-arka` yakın çekim (üstten 200 pt).

**Diğer modüllerle bağı**

- SinoAI (`/urunler/…` bağlantısı): SinoAI notundan kart destesi hazırlar. / *SinoAI makes a deck from your notes.*
- Akıllı Özet (`/urunler/…` bağlantısı): Analiz sonucundan tek dokunuşla kart yap. / *Make a card from an analysis in one tap.*
- Ders Planı (`/urunler/…` bağlantısı): Günün kartları planında görev olarak. / *Today’s cards show as a task in your plan.*

**SSS** (ilki açık)

1. **Aralıklı tekrar nedir?** Kartı unutmak üzereyken yeniden görmen. Hatırladıkça aralık açılır, unuttukça kısalır.  
   *What is spaced repetition? Seeing a card just before you forget it. The gap grows when you remember and shrinks when you don’t.*
2. **Günde kaç kart gelir?** Tekrar zamanı gelen kartlar ve sınırlı sayıda yeni kart; sayı vitrinde yazar.  
   *How many cards a day? Cards due for review plus a limited number of new ones; the count is on the home page.*
3. **Kendi kartımı yapabilir miyim?** SinoAI notundan ya da PDF’inden sana özel deste hazırlar.  
   *Can I make my own cards? SinoAI makes a personal deck from your notes or PDF.*
4. **Kartlar hangi derslerde?** Hedef sınavının derslerinde, konu konu desteler hâlinde.  
   *Which subjects have cards? In your target exam’s subjects, in a deck per topic.*
5. **Web ve mobilde aynı mı?** Evet. Tekrar zamanların ve kaydettiğin kartlar iki yerde aynı.  
   *Same on web and mobile? Yes. Your review times and saved cards match on both.*

### 3.6 Akıllı Özet · `/urunler/lens` · çizim `s-urun-akilli-ozet`, `s-urun-akilli-ozet-mobil`

- **Başlık:** Takıldığın sorunun fotoğrafını çek / *Snap the question you’re stuck on*
- **Giriş metni:** Akıllı Özet sorunun adım adım çözümünü, cevabını, kazanımını ve sık yapılan hatayı verir. Sonra konuda devam yolunu açar: konu anlatımı, benzer sorular, kart ya da SinoAI. / *Smart Summary gives the step-by-step solution, the answer, the skill and the common mistake. Then it opens the way on: the lesson, similar questions, a card or SinoAI.*
- **Giriş görselleri:** tarayıcıda `w-ozet-detay`, telefonda `m-ozet-sonuc` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Fotoğrafını çek / *Take a photo* | Kitaptaki ya da defterdeki soruyu çek; galeriden ya da PDF’ten de yükleyebilirsin. / *Snap a question from a book or notebook; upload from your gallery or a PDF too.* | `m-ozet-kamera` |
| 2 | Soru okunur / *The question is read* | Soru, şıklar ve şekil ayrıştırılır; birkaç saniye sürer. / *The question, options and figure are read; it takes a few seconds.* | `m-ozet-isleniyor` |
| 3 | Çözümü oku / *Read the solution* | Adım adım çözüm, cevap, kazanım ve sık yapılan hata. / *Step-by-step solution, answer, skill and the common mistake.* | `m-ozet-sonuc` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Adım adım çözüm / *A step-by-step solution* | Her adım neden yapıldığını söyler; sonunda cevap ve kazanım. / *Each step says why it is done; the answer and the skill at the end.* | Kazanım ve konu / *Skill and topic*<br>Sık yapılan hata / *The common mistake* | `m-ozet-sonuc` yakın çekim (üstten 90 pt) |
| 2 | Galeriden ve PDF’ten / *From your gallery or a PDF* | Telefondaki fotoğrafı ya da PDF sayfasını yükle. / *Upload a photo from your phone or a PDF page.* | Kamera, galeri, PDF / *Camera, gallery, PDF*<br>Okunamazsa hak düşmez / *Unreadable photos don’t count* | `m-ozet-yukle` |
| 3 | Ders videosundan analiz / *Analyse a lesson video* | Ders videosunu ekle; bölümlerini özetler ve videodan sorular hazırlar. / *Add a lesson video; it summarises the sections and makes questions from it.* | Bölüm bölüm özet / *Summary by section*<br>Videodan sorular / *Questions from the video* | `m-ozet-video` |
| 4 | Analizini PDF olarak sakla / *Keep it as a PDF* | Çözümü Sınavika PDF’i olarak indir, defterine ekle. / *Download the solution as a Sınavika PDF for your notes.* | Sınavika PDF’i / *A Sınavika PDF*<br>Defterine ekle / *Add it to your notes* | `m-ozet-pdf` |
| 5 | Web’de geçmişin / *Your history on the web* | Bütün analizlerin web’de tek listede; istediğini yeniden aç. / *All your analyses in one list on the web; reopen any of them.* | Tarih ve ders / *Date and subject*<br>Aynı hesap / *Same account* | `w-ozet-gecmis` tarayıcıda |

**Örnek:** Çözümden konuya / *From the solution to the topic*

> Türev sorusunda takıldın. Fotoğrafını çekince çözümün yanında “Benzer 5 soru” Testler’de, “Konuyu çalış” Dersler’de açılır; aynı hataya bir daha düşmezsin.
>
> *You got stuck on a derivative. Snap it and next to the solution “5 similar questions” opens in Quizzes and “Study the topic” in Lessons.*

Görsel: `m-ozet-sonuc` yakın çekim (üstten 360 pt).

**Diğer modüllerle bağı**

- Testler (`/urunler/…` bağlantısı): Benzer 5 soruyla pekiştir. / *Practise with 5 similar questions.*
- Dersler (`/urunler/…` bağlantısı): Sorunun konusunu Dersler’de çalış. / *Study the topic in Lessons.*
- Bilgi Kartları (`/urunler/…` bağlantısı): Çözümden bilgi kartı yap. / *Make a flashcard from the solution.*

**SSS** (ilki açık)

1. **Hangi soruları çözebilir?** Hedef sınavının derslerindeki çoktan seçmeli ve açık uçlu sorular; şekilli sorular dahil.  
   *Which questions can it solve? Multiple-choice and open questions in your exam’s subjects, figures included.*
2. **Fotoğraf okunmazsa?** Daha net bir fotoğraf istenir; okunamayan fotoğraf hakkından düşmez.  
   *What if the photo is unreadable? You’re asked for a clearer photo; unreadable photos don’t count.*
3. **Çözüm doğru mu?** Çözümler yapay zekâyla hazırlanır ve hata yapabilir; önemli bilgileri kontrol et.  
   *Is the solution right? Solutions are made with AI and can be wrong; check important facts.*
4. **Web’de de kullanabilir miyim?** Evet. Web’de dosya yükleyerek yeni analiz başlat; geçmişin iki yerde aynı.  
   *Can I use it on the web? Yes. Upload a file on the web; your history matches on both.*
5. **Video analizi nasıl çalışır?** Ders videosunu ekle; bölümlerini özetler ve videodan sorular hazırlar.  
   *How does video analysis work? Add a lesson video; it summarises sections and makes questions.*

### 3.7 SinoAI · `/urunler/sinoai` · çizim `s-urun-sinoai`, `s-urun-sinoai-mobil`

- **Başlık:** Takıldığın yerde seni tanıyan asistan / *An assistant that knows you*
- **Giriş metni:** SinoAI hedefini, eksiklerini ve geçmiş çalışmalarını bilerek yanıtlar. Soruyu adım adım çözer, konuyu sade anlatır, notundan sana test, kart ya da plan hazırlar. / *SinoAI answers with your goal, gaps and past work in mind. It solves step by step, explains simply and makes quizzes, cards or a plan from your notes.*
- **Giriş görselleri:** tarayıcıda `w-sino-sohbet`, telefonda `m-sino-sohbet` (mobilde yalnız telefon).

**Nasıl çalışır**

| Adım | Başlık | Metin | Ekran |
|---|---|---|---|
| 1 | Sor / *Ask* | Soruyu yaz ya da fotoğrafını ekle. / *Type your question or add a photo.* | `m-sino-ana` |
| 2 | Adım adım yanıt / *A step-by-step answer* | Hedefini ve son denemeni bilerek, sade bir dille. / *In plain words, knowing your goal and last exam.* | `m-sino-sohbet` |
| 3 | Çalışma üret / *Make study work* | Konudan ya da notundan test, kart, özet veya plan iste. / *Ask for a quiz, cards, a summary or a plan from a topic or your notes.* | `m-sino-calisma` |
| 4 | Kütüphanende aç / *Open it in your library* | Ürettiklerin kütüphanende durur; ilgili modülde açılır. / *What you make stays in your library and opens in its module.* | `m-sino-kutuphane` |

**Özellikler** (sırayla; masaüstünde metin ve görsel yer değiştirir)

| # | Başlık | Metin | Maddeler | Görsel |
|---|---|---|---|---|
| 1 | Seni tanır / *It knows you* | Hedef sınavını, son denemeni ve eksik konularını bilerek anlatır. / *It explains knowing your exam, your last result and your gaps.* | Hedefine göre / *For your goal*<br>Eksiklerini bilerek / *Knowing your gaps* | `m-sino-sohbet` yakın çekim (üstten 120 pt) |
| 2 | Notundan çalışma / *Study work from your notes* | Konu ya da not ver; test, kart destesi, özet ya da çalışma planı hazırlasın. / *Give a topic or notes; get a quiz, a deck, a summary or a plan.* | Test ve kart / *Quizzes and cards*<br>Özet ve plan / *Summaries and plans* | `m-sino-sonuc` |
| 3 | Kaynaklarım / *My sources* | PDF’lerini ve notlarını yükle; SinoAI onlardan çalışma hazırlar. / *Upload your PDFs and notes; SinoAI makes study work from them.* | PDF ve not / *PDFs and notes*<br>Tek yerde / *In one place* | `m-sino-kaynaklar` |
| 4 | Çalışma notu / *Study notes* | Sohbetten çıkan konuyu düzenli bir notta topla. / *Turn a chat topic into a tidy study note.* | Başlıklı not / *A note with headings*<br>Kütüphanende / *In your library* | `m-sino-not` |
| 5 | Web’de geniş sohbet / *A wide chat on the web* | Solda geçmiş, ortada tek sohbet sütunu; mobildeki sohbetlerin de burada. / *History on the left, one chat column in the middle; your mobile chats are here too.* | Sohbet ve Çalışma / *Chat and Study*<br>Aynı geçmiş / *Same history* | `w-sino-calisma` tarayıcıda |

**Örnek:** Bir sorudan bir çalışmaya / *From one question to a study set*

> Türevde zincir kuralını sordun. SinoAI adım adım anlatır, sonra “Bu konudan 10 soruluk test hazırla” dediğinde test kütüphanene eklenir ve Testler’de açılır.
>
> *You asked about the chain rule. SinoAI explains step by step; ask for a 10-question quiz and it goes to your library and opens in Quizzes.*

Görsel: `m-sino-sonuc` yakın çekim (üstten 80 pt).

**Diğer modüllerle bağı**

- Testler (`/urunler/…` bağlantısı): Ürettiğin test Testler’de açılır. / *Your quiz opens in Quizzes.*
- Bilgi Kartları (`/urunler/…` bağlantısı): Ürettiğin deste Bilgi Kartları’nda. / *Your deck opens in Flashcards.*
- Ders Planı (`/urunler/…` bağlantısı): Ürettiğin plan Ders Planı’na eklenir. / *Your plan goes into Study Plan.*

**SSS** (ilki açık)

1. **SinoAI ne bilir?** Hedef sınavını, son denemeni, eksik konularını ve ürettiğin çalışmaları.  
   *What does SinoAI know? Your exam, last result, gaps and the study work you made.*
2. **Cevaplarına güvenebilir miyim?** SinoAI bir yapay zekâ; hata yapabilir. Önemli bilgileri kontrol et.  
   *Can I trust its answers? SinoAI is an AI and can make mistakes. Check important facts.*
3. **Fotoğrafla soru sorabilir miyim?** Evet. Fotoğrafı yazma kutusuna ekle.  
   *Can I ask with a photo? Yes. Add the photo to the message box.*
4. **Misafir olarak kullanabilir miyim?** Sitedeki SinoAI sayfasında sınırlı sayıda soru sorabilirsin; hesapla hedefini bilerek yanıtlar.  
   *Can I use it as a guest? On the site’s SinoAI page you can ask a few questions; with an account it knows your goal.*
5. **Ürettiklerim nerede durur?** Kütüphanende; her biri kendi modülünde açılır.  
   *Where does my work go? In your library; each opens in its own module.*

## 4. Hakkımızda · `s-hakkimizda`, `s-hakkimizda-mobil`

Metnin son hâlini "Sınavika Video Engine kurulumu" oturumu hazırlıyor. Bölümler ve düzen sabittir; metin geldiğinde aşağıdaki çizim metinlerinin yerine konur. Sayı ya da istatistik yazılmaz.

| # | Bant | Düzen | Metin (TR / EN) |
|---|---|---|---|
| 1 | Giriş (`card`) | Solda 560 sütun; sağda web ana sayfası (`w-ana-sayfa`) ve ana ekran (`m-hub-moduller`) | Üst etiket: Hakkımızda / *About us*<br>Başlık: Sınava hazırlanan her öğrenci ne çalışacağını bilsin / *Every student preparing for an exam should know what to study*<br>Metin: Sınavika, YKS ve KPSS'ye hazırlanan öğrencinin her gün sorduğu soruya cevap vermek için kuruldu: bugün ne çalışmalıyım? Denemeden günlük plana kadar hazırlığın tamamını tek yerde topluyoruz. |
| 2 | Misyon (`bg`) | Solda 440 başlık ve metin; sağda 3 kart | Misyonumuz · Tahmin değil, öğrencinin kendi verisi. Kartlar: **Ölç** (Deneme ve testlerle nerede olduğunu konu konu gör.) · **Öğren** (Eksik konuyu kısa adımlarla öğren, testle pekiştir.) · **Geliş** (Her gün planındaki net adımı at, gelişimini izle.) |
| 3 | Yaklaşım ve içerik kalitesi (`card`) | Ortalı başlık; 4 kart | İçerik sınavdan başlar. Kartlar: **Kapsam sınavdan gelir** (MEB kazanımları ve ÖSYM kapsamı) · **Sınav formatında soru** · **Yayından önce kontrol** (kontrolden geçmeyen içerik gösterilmez) · **Senin verinle öneri** |
| 4 | 7 modül (`bg`) | 7 sütun (telefonda 2) | Yedi modül, tek düzen. Kartta modül karosu, adı ve sloganı (`ModuleIdentity.tagline`). |
| 5 | Sınavlar (`card`) | 2 büyük kart | **YKS**: Üniversiteye hazırlanan öğrenciler için; çipler TYT, AYT Sayısal, AYT Eşit Ağırlık, AYT Sözel. **KPSS**: Kamuda çalışmak isteyen adaylar için; çipler Lisans, Önlisans, Ortaöğretim. |
| 6 | Değerler (`bg`) | 4 kart | **Önce öğrenci** · **Açıklık** (Gizli ücret yok; istediğin an iptal edersin.) · **Sadelik** · **Gizlilik** (Verin yalnız sana hizmet için işlenir, KVKK.) |
| 7 | Şirket bilgileri (`card`) | Solda şirket kartı (1,4), sağda yayınevi kartı (1) | Kurumsal · Sınavika'nın arkasında. Şirket kartı §5.4 ile aynı. Yayınevi kartı: "Yayınevleriyle iş birliği" ve "Yayınevleri sayfası →" (`/corporate/yayinevleri`). |
| 8 | SSS | §2.4 | Sınavika kimler için? · İçerikleri kim hazırlıyor? · Verilerim nasıl korunuyor? · Hangi cihazlarda kullanabilirim? · Yayınevi olarak nasıl iş birliği yaparız? (cevaplar çizim kodunda) |
| 9 | Kapanış çağrısı | §2.4 | Bugün ne çalışacağını bil |

## 5. İletişim · `s-iletisim`, `s-iletisim-mobil`

### 5.1 Giriş

Ortalı (telefonda sola dayalı) `SiteTitle`:
- Üst etiket: İletişim
- Başlık: "Sana nasıl yardımcı olabiliriz?" / *How can we help?*
- Metin: "Soru, öneri ya da ödeme sorunu: bize yaz, ara ya da WhatsApp'tan ulaş."

### 5.2 Kanal kartları

Üç eşit kart. Kartta ikon karosu, kanal adı, kısa açıklama, en altta büyük değer (22 / 700) ve tam genişlik kenarlı düğme.

| Kanal | Değer | Açıklama | Düğme | Bağlantı |
|---|---|---|---|---|
| E-posta (`mail`) | info@sinavika.com | Ayrıntılı sorular ve ekler için. | E-posta yaz | `mailto:info@sinavika.com` |
| Telefon (`phone`) | 0 538 236 26 05 | Hesap ve ödeme sorularında. | Ara | `tel:+905382362605` |
| WhatsApp Business (`chat`) | 0 538 236 26 05 | Kısa sorular için mesaj at. | WhatsApp'tan yaz | `https://wa.me/905382362605` |

- Kartların altında not: "Mesajlarını sırayla yanıtlıyoruz; yanıtımız e-postana gelir." (`info` ikonu).
- **Yanıt süresi yazılmadı.** "Vaat yok" kuralı: süre ancak sahip bir değer verirse eklenir (§10).

### 5.3 Destek talebi formu ve kısayollar (`bg` bant)

Solda form kartı (1,25), sağda üç kart (1).

**Form:**
- Başlık "Destek talebi oluştur", altında "Yıldızlı alanlar zorunlu."
- Alanlar (masaüstünde iki sütun):
  - E-posta * ve Adın (isteğe bağlı);
  - Konu * ve Telefon (isteğe bağlı);
  - Mesajın * (140 pt).
- Onay kutusu: "Aydınlatma metnini okudum; bu talep için bana dönülmesini kabul ediyorum." "Aydınlatma metni" KVKK sayfasına bağlanır.
- Turuncu düğme: "Talebi gönder".
- Konu listesi destek API'sinin konularıdır; API'de olmayan konu yazılmaz.
- **Gönderince:** form yerine onay kutusu açılır: "Talebin alındı. Yanıtımız {e-posta} adresine gelecek."
- **Hata:** alanın altında kırmızı tek satır. E-posta biçimi ve boş zorunlu alan gönderirken denetlenir.

**Sağdaki kartlar:**
- **Hesabın var mı?** (`headset`): "Giriş yaptıysan talebini Destek Merkezi'nden aç; önceki taleplerini ve yanıtlarını orada görürsün." Koyu tam genişlik düğme "Destek Merkezi'ne git" → `/student/destek`.
  - Oturum açık ziyaretçi bu sayfaya gelirse kart en üste çıkar; form yine görünür.
- **Belki cevabı burada:** 3 soru satırı ve "Tüm sık sorulanlar →" (`/corporate/sss`).
- **Bizi takip et:** sosyal profil çipleri. Hesaplar sahipten doğrulanır (§10).

### 5.4 Şirket bilgileri ve harita

Solda şirket kartı, sağda harita alanı (isteğe bağlı; eş boy).

| Etiket | Değer |
|---|---|
| Ünvan | Coşkunlar Dış Ticaret Ltd. Şti. |
| MERSİS | 0211135358300001 |
| Adres | Folkart Towers, Bayraklı / İzmir |
| E-posta | info@sinavika.com |
| Telefon | 0 538 236 26 05 |

Harita:
- Durağan harita görseli ya da sade yer tutucu: ızgara desen, koyu yuvarlak `pin`, "Folkart Towers", "Bayraklı / İzmir · Haritada aç".
- Tıklayınca harita uygulamasında açılır.
- Çerez gerektiren gömülü harita kullanılmaz.

## 6. Sınav sayfası şablonu · `s-sinav-yks`, `s-sinav-yks-mobil`

Bütün sınav hazırlık sayfaları tek şablondur. Çizim YKS örneğidir; diğer sayfalar §6.2'deki değerleri alır.

### 6.1 Bantlar

1. **Giriş:**
   - Kırıntı "Sınavlar › {Sınav}", başlık, metin.
   - Turuncu "{Sınav} planımı hazırla" (kayıt sayfası, sınav ön seçili) ve kenarlı "Net hesapla" (ilgili net hesaplama sayfası).
   - Sağda sayaç kartı: "{Sınav} {yıl}'e kalan", "ÖSYM takvimi" çipi ve üç kutu: gün, hafta, bu ayki Türkiye geneli deneme sayısı.
   - Kartın altında kaynak notu. Gün ve hafta ÖSYM'nin açıkladığı tarihten hesaplanır; tarih yoksa kutular yerine "Tarih ÖSYM tarafından açıklanınca" yazar. Deneme sayısı deneme takviminden gelir; 0 ise o kutu görünmez.
2. **Sınav yapısı** (`bg`):
   - Başlık "İki oturum, dört puan türü"; açıklamada puan türleri.
   - Oturum başına bir kart: ad, "soru · dakika", test satırları ("N soru") ve "{Oturum} konuları →".
3. **Sınavika ile:** "YKS hazırlığın dört adımda".
   - 4 kart, sırasıyla Ders Planı (`m-plan-bugun`), Dersler (`m-ders-vitrin`), Testler (`m-test-vitrin`), Denemeler (`m-deneme-sonuc`).
   - Kartta görsel, modül karosu ve adı, tek cümle.
4. **Denemeler** (`bg`): solda başlık, metin ve "{Sınav} deneme sınavları →"; sağda tarayıcıda `w-deneme-sonuc`.
5. **SSS:** sınava özgü 5 soru.
6. **Kapanış çağrısı:** "{Sınav} planın 2 dakikada hazır".

### 6.2 Sayfa değerleri

| Sayfa | Başlık | Oturumlar ve testler | Puan türleri / not |
|---|---|---|---|
| `/yks-hazirlik` | YKS'ye hazırlık: TYT ve AYT | TYT 120 soru · 165 dk (Türkçe 40, Sosyal 20, Temel Matematik 40, Fen 20); AYT 160 soru · 180 dk (Matematik 40, Fen 40, Edebiyat-Sosyal 1 40, Sosyal 2 40) | SAY, EA, SÖZ |
| `/tyt-hazirlik` | TYT'ye hazırlık | Yalnız TYT kartı (tek kart tam genişlik) | TYT puanı |
| `/ayt-hazirlik` | AYT'ye hazırlık | Yalnız AYT kartı; testlerin alan alan dağılımı | SAY, EA, SÖZ |
| `/kpss-lisans` | KPSS Lisans hazırlık | Genel Yetenek 60 (Türkçe 30, Matematik 30) · Genel Kültür 60 (Tarih 27, Coğrafya 18, Vatandaşlık 9, Güncel 6); 120 soru · 130 dk | P3 ve diğer puan türleri ÖSYM kılavuzundan |
| `/kpss-onlisans` | KPSS Önlisans hazırlık | Lisans ile aynı yapı | P93 |
| `/kpss-ortaogretim` | KPSS Ortaöğretim hazırlık | Lisans ile aynı yapı | P94 |

- Soru dağılımları ÖSYM kılavuzundan doğrulanır; kılavuz değişirse yalnız bu tablo değişir.
- YDT hiçbir sayfada yazılmaz.

## 7. Deneme sayfası şablonu · `s-deneme-sinavi`, `s-deneme-sinavi-mobil`

1. **Giriş:**
   - Kırıntı "Kaynaklar › Denemeler", başlık "Online deneme sınavı", metin.
   - Turuncu "Denemeye başla" (kayıt / giriş) ve kenarlı "Sınav takvimi" (`/sinav-takvimi`).
   - Sağda tarayıcıda `w-deneme-sonuclar`, telefonda `m-deneme-coz`.
2. **Kimin için şeridi.**
3. **Denemeler takvimi:**
   - Solda "Bu ay · Denemeler takvimi" ve metin.
   - Sağda deneme satırları. Satırda ikon karosu, ad, "{sınav} · {durum}", sağda "Başla" (açık, koyu) ya da "Hatırlat" (yaklaşan, kenarlı, `bell`).
   - Veri: deneme takvimi API'si (`exams/month`; misafir için okuma ucu gerekiyorsa API'ye eklenir). Satırlar sayfanın sınavına göre süzülür (`/yks-deneme-sinavi` yalnız YKS).
   - Çizimdeki ad ve tarihler örnektir.
4. **Nasıl işler** (`bg`): 3 adım kartı: `m-deneme-detay`, `m-deneme-coz`, `m-deneme-analiz`.
5. **SSS**, **kapanış çağrısı** ("İlk denemeni bugün çöz").

| Sayfa | Başlık | Süzgeç |
|---|---|---|
| `/online-deneme-sinavi` | Online deneme sınavı | hepsi |
| `/yks-deneme-sinavi` | YKS deneme sınavı | YKS |
| `/kpss-deneme-sinavi` | KPSS deneme sınavı | KPSS |
| `/turkiye-geneli-deneme-sinavi` | Türkiye geneli deneme sınavı | yalnız Türkiye geneli |

## 8. Paketler · `s-paketler`, `s-paketler-mobil` (YKS) · `s-paketler-kpss`, `s-paketler-kpss-mobil` (KPSS)

### 8.1 Hiyerarşi

Öğrenci adım adım seçer. Her adımın üstünde numaralı etiket vardır:

1. **Sınavını seç:**
   - İki büyük seçim kartı yan yana, eşit genişlikte: **YKS** (alt satır "TYT + AYT") ve **KPSS** (alt satır "Lisans · Önlisans · Ortaöğretim"; telefonda "3 tür").
   - Seçili kartın 2 px `ink` kenarı ve sağda tik dairesi vardır.
2. **Yalnız KPSS'de: "Hangi KPSS'ye gireceksin?"**
   - Üç seçenek satırı (radyo). Lisans: 4 yıllık mezun ya da son sınıf. Önlisans: 2 yıllık mezun. Ortaöğretim: lise mezunu.
   - Varsayılan Lisans.
3. **Süreni seç:**
   - Aylık | Yıllık anahtarı (`Segmented`, 240). Yanında yeşil çip "Yıllıkta %45 tasarruf".
   - **Varsayılan Yıllık.** Öğrenci için daha ucuz; tasarruf çipi seçimi açıklar.
4. **Paket kartı** (tek kart, köşe 30, gölgeli). Masaüstünde iki yarım, telefonda alt alta.

### 8.2 Paket kartı

**Sol yarı:**
- Ad: "YKS · TYT + AYT" ya da "KPSS Lisans / Önlisans / Ortaöğretim".
- Kapsam çipleri:
  - YKS: TYT, AYT Sayısal, AYT Eşit Ağırlık, AYT Sözel;
  - KPSS: Genel Yetenek, Genel Kültür.
- Kapsam cümlesi.
- Fiyat (`num` 48) ve "/ yıl" ya da "/ ay".
- Yıllıkta "Ayda ~₺166 · aylık pakete göre %45 tasarruf".
- Turuncu tam genişlik "Paketi seç →" → `/student/odeme?packageId=…` (girişsizse önce kayıt).
- Güven satırları:
  - "İstediğin an iptal; dönem sonuna kadar açık kalır";
  - "Güvenli ödeme: VISA, Mastercard, troy";
  - "Mobil uygulamada 3 gün ücretsiz dene".

**Sağ yarı** (`bg` zemin, solda çizgi):
- "Neler dahil": 7 modül satırı (karo 32, ad, tek satır fayda).
- Üç sayı kutusu: erişim günü (yıllık 365, aylık 30), deneme hakkı (yıllık 240, aylık 20), 7 modül. Konu sayısı yazılmaz: içerik API'sinin misafir ucu yok (web uygulamasıyla aynı, 20 Kasım).
- "Gelişmiş istatistik de dahil."

**Hesaplar ve veri:**

| Değer | Kaynak |
|---|---|
| Fiyat, süre, deneme hakkı | `GET api/Subscription/markets/TR/packages` (bugün: Aylık ₺299 / 30 gün / 20 deneme; Yıllık ₺1.990 / 365 gün / 240 deneme; KPSS türleri aynı) |
| Aylık karşılığı | yıllık fiyat ÷ 12, tam sayıya yuvarlanır, başına "~" konur (₺1.990 → ~₺166) |
| Tasarruf | 1 − yıllık ÷ (aylık × 12), yuvarlanmış yüzde (1 − 1.990 ÷ 3.588 = %45) |

API değeri değişince sayfa kendiliğinden değişir.

### 8.3 Altta

- **Karşılaştırma** (`bg`): "Aylık mı, yıllık mı?" tablosu.
  - Satırlar: Fiyat, Süre, Aylık karşılığı, Deneme hakkı, Yedi modül, Gelişmiş istatistik.
  - Başlık satırı `line2` zemin.
- **SSS:** iptal, yenileme, hangi KPSS, web ve mobil aynı hesap, ücretsiz deneme.
- **Kurumsal satır:** "Okul, dershane ya da yayınevi misin?" ve "İletişime geç →" (`/corporate/contact`).

## 9. SSS · `s-sss`

- Solda soru listesi (akordeon, ilki açık).
- Sağda "Cevabını bulamadın mı?" kartı: metin, turuncu "İletişim sayfası →" ve "Giriş yaptıysan talebini Destek Merkezi'nden aç."
- Form artık yalnız İletişim sayfasında.

## 10. Açık sorular (sahip)

1. **Yanıt süresi:** İletişim'de süre yazılsın mı? Yazılacaksa değeri ("Vaat yok" kuralı).
2. **Sosyal profiller:** hangi hesaplar gösterilecek? Çizimde Instagram, YouTube, TikTok, LinkedIn.
3. **Testler ürün sayfası:** yeni rota `/urunler/testler`; ürünler menüsü ve footer'a eklenir.
4. **Misafir deneme takvimi:** deneme sayfasındaki takvim için misafirin okuyabileceği bir uç gerekiyor mu?
5. **Hakkımızda metni:** kurulum oturumunun metni gelince §4 güncellenir; düzen değişmez.

## 11. Kabul testleri

1. Her sayfa 1440, 1024, 768 ve 390 genişlikte yatay kaydırma olmadan açılır; telefonda bütün satırlar alt alta.
2. Ürün sayfalarındaki her görsel §3'te yazan çizim kimliğinin PNG'sidir; koyu temada `koyu/` sürümü gelir.
3. Sayfalarda YDT, "quiz", "koç", "mikro ders" yazmaz; sayı yalnız §0'daki kaynaklardan gelir.
4. Paketler'de aynı anda tek paket kartı görünür. KPSS seçilince önce tür seçicisi gelir. Yıllık varsayılandır; aylık ve yıllık fiyatlar API'den gelir.
5. İletişim formu zorunlu alanlar olmadan gönderilmez. Gönderilince onay görünür. Oturum açıkken Destek Merkezi kartı üsttedir.
6. Her SSS bölümü `FAQPage` yapılandırılmış verisini verir; her sayfanın tek `h1`'i başlığıdır.
7. Turuncu yalnız ana düğmededir (Ücretsiz başla, Paketi seç, Talebi gönder); modül rengi yalnız karo ve çiplerde.
