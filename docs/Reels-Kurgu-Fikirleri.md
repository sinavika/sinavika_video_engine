# Reels kurgu fikirleri: prompt-motion.com'dan seçilenler

30 Ekim 2026. Sahip istedi: "prompt-motion.com'dan bizim yapımıza uygun prompt ve şablonlar seç; reels kurguları için fikir çıkar."

[prompt-motion.com](https://prompt-motion.com/), Claude Opus 5.5 ile yapılmış 400'den fazla hareketli video ve arkalarındaki prompt'ları toplar. Videolar çoğunlukla HTML + Playwright ile kare kare render edilmiş; bizim motorumuz Remotion. Teknikler aynı mantıkla bize taşınır: her stil zamandan hesaplanır, her kare bağımsızdır.

Aşağıdaki prompt'lar birebir kopyalanmadı; seçilenlerin özü ve bize uyarlanmış hâli yazıldı. Kaynaklar bağlantılıdır.

## 1. İyi örneklerin ortak ilkeleri

En çok izlenen ve en iyi sonuç veren prompt'lar aynı birkaç kuralı tekrarlıyor:

| İlke | Ne demek | Bizde durum |
|---|---|---|
| **Her plan bir öncekinden doğar** | Kesme ve geçiş efekti yok; şekil, yazı ve renk bir sonraki sahneye dönüşür. Bir düğme yükleyiciye, yükleyici onay işaretine dönüşür. | Sahnelerimiz sert kesmeyle değişiyor. En büyük fark burada. |
| **Ritim ızgarası** | Müzik 120 BPM; her vuruşta bir şey olur, kesmeler ana vuruşa denk gelir. Şarkı ölçülür, vuruşlar gerçek davul vuruşlarına oturtulur. | Müziği BPM vererek ürettiriyoruz ama sahneleri vuruşa oturtmuyoruz. Sahne süreleri sese göre. |
| **İmleç ya da parmak her değişikliği sürer** | Arayüz kendi kendine değişmez; bir tıklama, sürükleme ya da uzun basma onu değiştirir. | Telefon ekranları durağan; dokunuş yok. |
| **Kamera ekrana yaklaşır** | Screen Studio tarzı: anlatılan öğe kareyi doldurana kadar yakınlaşır. | Telefon küçük kalıyor; ekrandaki yazı okunmuyor. |
| **Hızlı harekette bulanıklık** | Hareketin yönünde ve hızına göre bulanıklık. Kare başına 3–4 alt kare karıştırılır. | Yalnız `Slam` yazısında var. |
| **Yasak listesi** | Parçacık patlaması, parıltı, lens parlaması, kamera sarsıntısı, RGB kayması, çapraz geçiş, zıplayan yumuşatma, yarım saniyeden uzun duraklama, "şablon gibi görünen" her şey. | Kurallarımızla uyumlu, yazılı değildi. |
| **Döngü** | Son kare ilk kareye eşit; video kendi içinde döner. | REEL_STANDARD'daki "döngü köprüsü" bunun yarısı; bitiş kartı döngüyü kesiyor. |
| **Önce storyboard, sonra vuruş başına bir kare kontrolü** | Her vuruşun karesi render edilip bakılır; kalabalık, binen ya da okunmayan düzeltilir. | Önizleme betiğimiz var; vuruşa bağlı değil. |

## 2. Seçilen prompt ve şablonlar

| Kaynak | Ne yapıyor | Bize uyarlanışı |
|---|---|---|
| [Showreel şablonu](https://prompt-motion.com/templates/showreel) (sitenin kendi yeniden yazımı, 49 videonun kaynağı) | Tek bir konsept seçer, her plan bir öncekinden doğar. En fazla 3 renk, tek yazı tipi. Kinetik yazı → şekil dönüşümü → 2B'den 3B'ye → arayüz anı → bitiş başlığı. Döngü. | **Ayın özeti reels'i:** "Kasım'da Sınavika" tek konsept. Lacivert, turuncu ve beyaz, Manrope. Son kare ilk kare. |
| [Arayüz hâlleri arasında tek şekil](https://prompt-motion.com/twoclipping-5cba86) | Hiç kesmeden tek bir şekil düğmeye, yükleyiciye, onaya, oynatıcıya, sekmelere ve grafiğe dönüşür. Sekme göstergesinin iki kenarı farklı yaylarla gider; öndeki kenar uzar. | **Sınavika döngüsü tek şekilde:** turuncu hap "Deneme çöz" düğmesi → yükleyici → net kartı → eksik konu çipi → Ders Planı görevi → odak sayacı → onay → bitiş kartı. |
| [Fotoğraf baskı uygulaması lansmanı](https://prompt-motion.com/twoclipping-221cab) | Apple keynote tarzı, tek plan, yalnız 2B. Diyafram kanatları fotoğrafa kapanıp açılır. Dynamic Island sıvı gibi uzar ve bir Mac penceresine dönüşür. Sipariş adımları tek bir siyah şeklin dönüşümüdür. | **20 Kasım ScanViewfinder:** diyafram soru fotoğrafına kapanır, çözüme açılır. **29 Kasım DualScreen:** telefonun Dynamic Island'ı uzayıp bilgisayar penceresi olur ("Plan telefonda, sen bilgisayarda mı?"). |
| [Yazma kutusu → cevap sayfası tanıtımı](https://prompt-motion.com/notdwd-c2037d) | İmleç menü çubuğuna tıklar, buzlu cam yazma kutusu açılır, cümle yazılır. Kamera hızla yukarı kayıp cevap sayfasına iner, üstüne kartlar yükselir. Her plan hareket hâlinde girer. | **SinoAI haftası (9–15 Kasım):** SinoAI'nin yazma kutusunda soru yazılır, cevap sayfasına geçilir, kartlar (test, bilgi kartı, özet) yükselir. 9 Kasım ThreeModes'ta Hızlı/Dengeli/Derin seçicisi bu kutunun içinde döner. |
| [UGC reklam üreticisi tanıtımı](https://prompt-motion.com/twoclipping-6dd14e) | Hook vuruşlara kelime kelime iner; hook'un bir kelimesi ürün arayüzüne dönüşür. Düğmeden bir daire açılıp karanlık sahneye geçilir. Büyük rakamlar itme kesmeleriyle gelir, üç kelimelik kayan yazı, logo. | **Hook reels kalıbı** (en iyi reels'imiz "Netin sana yalan söylüyor" gibi): hook kelime kelime vuruşta, "net" kelimesi deneme sonuç kartına dönüşür, rakamlar itme kesmesiyle. 22 Kasım PovText için uygun. |
| [Ondefica uygulama reels'i](https://prompt-motion.com/jesscaroline7-1ff7cb) (dikey 1080×1920) | Tek satırlık showreel prompt'uyla dikey uygulama tanıtımı; grafik ve kinetik yazı. | Dikeyde aynı ilkelerin çalıştığını gösteriyor; bizim reels biçimimiz. |

## 3. Kalan Kasım reels'lerine uyarlama önerisi

Plan değişmez (hook, ses, gün, saat aynı). Yalnız kurgu dili güçlenir:

| Gün | Şablon | Önerilen teknik |
|---|---|---|
| 9 Kas | ThreeModes | Yazma kutusu → cevap sayfası; Hızlı/Dengeli/Derin seçicisinde uzayan sıvı gösterge |
| 11 Kas | NotebookDoodle | Defterdeki karalama çizgisi bilgi kartına dönüşür (tek plan) |
| 13 Kas | PrintShop | Tek siyah şekil: "Hazırlanıyor %" → baskı → kitapçık (baskı filmindeki sipariş adımları gibi) |
| 15 Kas | GroupChat | Grup balonları susar, SinoAI cevabı yazma kutusundan doğar |
| 18 Kas | PuzzleGap | Eksik yapboz parçası tek şekil olarak Ders Planı görevine dönüşür |
| 20 Kas | ScanViewfinder | Diyafram kanatları soruya kapanıp çözüme açılır |
| 22 Kas | PovText | Hook kelime kelime vuruşta, bir kelime sonuç kartına dönüşür |
| 25 Kas | BlockWeek | Bloklar her vuruşta haftaya düşer (ritim ızgarası) |
| 29 Kas | DualScreen | Dynamic Island uzayıp bilgisayar penceresi olur |
| 30 Kas | LevelSelect | Tek şekil: Kolay/Orta/Zor düğmesi → yükleyici → puan → bir üst seviye |

## 4. Motora eklenecek ortak parçalar

Bunlar bir kez yazılır, bütün reels'ler kullanır:

1. **Ritim ızgarası:** ElevenLabs Music'in ürettiği parçanın vuruşlarını ölç; sahne geçişlerini ve önemli anları en yakın vuruşa kaydır (120 BPM'de en çok 0,25 sn).
2. **Kamera yakınlaşması:** telefon ekranının bir bölgesine yakınlaş, anlatılan kart kareyi doldursun. Küçük telefon sorununu da çözer.
3. **Parmak dokunuşu:** ekranda bir dokunuş halkası ve basma animasyonu; değişiklik dokunuşla başlar.
4. **Hareket bulanıklığı:** hızlı hareketlerde yöne göre bulanıklık (`@remotion/motion-blur`).
5. **Şekil dönüşümüyle geçiş:** iki sahne arasında ortak bir öğe (hap, kart, daire) boyut, köşe ve renk değiştirerek sonraki sahneye taşınır.
6. **Vuruş başına kare kontrolü:** önizleme her vuruşun karesini çıkarsın; yerleşim bekçisi bunlara da baksın.
7. **Yasak listesi** `REEL_STANDARD`'a yazılır: parçacık patlaması, parıltı, kamera sarsıntısı, çapraz geçiş, yarım saniyeden uzun duraklama.
8. **Ses efektleri** (sahip, 30 Ekim: "efektsel sesleri unutma"): her hareketin sesi vardır. Liste tek yerde: [`SoundEffects.ts`](../src/Configurations/SoundEffects.ts). Dosyalar bir kez ElevenLabs Sound Effects ile üretilir (`npm run sound-effects`, yalnız eksikleri), seviyelenip `public/SoundEffects/` altında durur. Oynatıcı ortaktır: [`SoundEffect`](../src/Components/Sounds/SoundEffect.tsx).
   - Hareket parçaları sesini kendi çalar: `Tap` dokunuş, `Morph` geçiş, `CameraZoom` gerçek bir kamera hareketinde fısıltı, `Slam` alçak vuruş, `TypeOn` klavye. `sound={null}` susturur, başka bir kimlik değiştirir.
   - Şablon kendine özgü sesleri ekler: kol, makara, yaprak koparma, yazıcı, deklanşör, baskı, gök gürültüsü, yapboz oturma, tarama, kart karıştırma ve çevirme, blok düşüşü, satır tamamlama, uyarı, kilit, tebeşir, yıldız.
   - ElevenLabs 0,5 saniyeden kısa ses üretmez; test bunu ve her dosyanın varlığını denetler (`tests/Configurations/SoundEffects.test.ts`).

## 5. Uygulandı (30 Ekim 2026)

Kasım'ın 20 reels'i bu dille yapıldı. Her biri yeni bir şablondur:

| Gün | Şablon | Kurgu dili |
|---|---|---|
| 1 | SlotSpin | Çark kolu, makaralar vuruşta durur |
| 2 | TearCalendar | Yapraklar hızlanarak kopar |
| 4 | FocusTimer | Bildirimler patlar, odak sayacı |
| 6 | StudyReceipt | Fiş yazıcıdan satır satır çıkar |
| 8 | SplitDay | Bölünmüş ekran, görevler vuruşta işaretlenir |
| 9 | ThreeModes | Sıvı seçici, yazma kutusu, kamera yakınlaşması |
| 10 | AtaturkMemorial | Özel gün: saat, siren, 1933 filmi, Nutuk |
| 11 | NotebookDoodle | Sayfa tek şekil hâlinde ek çipine dönüşür |
| 13 | PrintShop | Kurşun harf, "Hazırlanıyor %" hapı → kitapçık → telefon |
| 15 | GroupChat | Mesaj kutusu tarayıcı penceresine dönüşür |
| 16 | StudyForecast | Hava durumu bölgeleri sonuç satırlarına dönüşür |
| 18 | PuzzleGap | Kamera boşluğa dalar, görev parçaya dönüşür |
| 20 | ScanViewfinder | Vizör, tarama, diyafram, çarpı onaya dönüşür |
| 22 | PovText | POV yazısı kelime kelime, düğme sonuç kartına dönüşür, itme kesmeleri |
| 23 | CardTrick | Yelpaze, sesle 3-2-1, kart çevirme |
| 24 | Basogretmen | Özel gün: tebeşir, kamu malı arşiv, tahta zamanda ilerler |
| 25 | BlockWeek | Bloklar vuruşta düşer, taşar, günlere dağılır |
| 27 | CampTrailer | Kampın kendi derslerinden sinema oranında kesmeler |
| 29 | DualScreen | Kamera adası dizüstü penceresine dönüşür |
| 30 | LevelSelect | Kolay durağı teste dönüşür, yol çizilir, kilit açılır |

