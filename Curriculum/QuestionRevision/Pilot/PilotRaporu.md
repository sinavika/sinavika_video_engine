# Pilot revizyon raporu: TYT Türkçe · Sözcükte Anlam

30 Ekim 2026. Canlıdan dışa aktarılan **211 tekil soru** (kopyalarla **275 kayıt**) tek tek çözülerek revize edildi. Veritabanına henüz hiçbir şey yazılmadı.

## Özet

| | Soru |
|---|---:|
| Yeniden yazılan (soru kurtarılamayacak durumdaydı) | 103 |
| Düzeltilen (soru korunup hataları giderildi) | 108 |
| Hatasız bulunan | 0 |
| Alt konusu atanan (önceden boş olanlar dahil hepsi) | 211 |
| Doğru şık harfi değişen | 0 |

Kullanım: Exam/System: 72, Quiz/AdminTest: 79, Quiz/System: 60. Öğrencilerin çözdüğü quiz sorusu: 60.

## Bulunan hata türleri

Bir soruda birden çok hata olabilir.

| Hata | Soru |
|---|---:|
| Cevap anahtarı yanlış | 13 |
| Birden çok doğru cevap | 25 |
| Konu dışı soru (paragraf, yazım, noktalama…) | 35 |
| Kökte olmayan sözcük/parça/parantez soruluyor | 17 |
| Altı çizili işaretleme sorunu | 77 |
| İlgisiz figür / görsel atfı | 5 |
| Yazım ve anlatım bozukluğu | 34 |

### Cevap anahtarı yanlış olan sorular

Bu sorularda doğru cevap içeriği, öğrenci istatistikleri ve kitapçık dağılımı bozulmasın diye **aynı harfe** yerleştirildi.

| Kod | Kullanım | Sorun |
|---|---|---|
| TRK061724 | Exam/System | Sözcükte anlam sorusu değil (yazım-noktalama); 'altı çizili bölüm' deniyor ama çizili bölüm yok ve doğru kabul edilen virgül kuralı yanlış. |
| TRK149331 | Exam/System | Doğru kabul edilen C savunulamıyor (“dağıtıldı” eşitlik anlamı taşımıyor); hiçbir şık doğru değildi ve hedef sözcükler tırnakla verilmişti. |
| TRK892799-202610 | Exam/System | 'Altı çizili sözcük' çizili değildi; şıklar cümleyle ilgisizdi ve doğru kabul edilen D savunulamıyordu. |
| TRK988483 | Exam/System | Sözcükte anlam sorusu değil; noktalama sorusu ve doğru kabul edilen virgül kuralı yanlış. |
| QZ-242EAF2AAB9A48B7B2D0D0C7955D0017 | Quiz/AdminTest | Doğru kabul edilen cümlede “soğuk tavır” mecazdı, yani hiçbir şık doğru değildi; kökte 'altı çizili' denmiyordu, şıklar cümleleri tekrarlıyordu. |
| QZ-957348F5568F4E769FEF5B3CF56C33F6 | Quiz/AdminTest | I. cümledeki “sandalyenin kolu” da yan anlamlı olduğundan doğru kabul edilen “Yalnız II” yanlıştı; sözcük tırnakla soruluyordu. |
| QZ-42FC9F48837A4E558732C914BEBEFEDF | Quiz/System | Cevap anahtarı yanlıştı: cümlede “sert” parçaların katı, sıkı olduğunu anlatıyor; doğru kabul edilen “kaba, kırıcı tutum” açıklaması yanlıştı. Doğru anlam aynı harfe yerleştirildi. |
| QZ-550BFA19EE2C42F495F56A2FC76CAA5F | Quiz/System | Cevap anahtarı yanlıştı: kökteki “ince örtü” kalınlığı az olanı anlatıyor, doğru kabul edilen “ince ayrıntı” ise “ayrıntılı” anlamındaydı; D şıkkı anlamsızdı (“hava daha inceydi”). |
| QZ-88B9CB554B3147AC8507EF0271FED216 | Quiz/System | Cevap anahtarı yanlıştı: “ayağı gevşemiş” gerçek, “içimde bir gevşeme” mecazdır; doğru kabul edilen “yan anlam - temel anlam” sıralaması tersti. Kök “koyu yazılmış” diyordu. Doğru yargı aynı harfe yerleştirildi. |
| QZ-8BBCD90F81524355852DFAA4B25D0D91 | Quiz/System | Cevap anahtarı yanlıştı: ikinci cümledeki kullanım mecazdır, doğru kabul edilen şık “yan anlam” diyordu; iki cümlede farklı fiiller (yanmak, yakmak) vardı, kök 'altı çizili' demiyordu. Doğru yargı aynı harfe yerleştirildi. |
| QZ-3838BCCCA085411BB9841CF610CDE899 | Quiz/System | Cevap anahtarı yanlıştı: “okumak” ile “gözden geçirmek” eş anlamlı değildir, biri ötekinin yerini tutmaz; doğru kabul edilen yargı yanlıştı. Doğru yargı aynı harfe yerleştirildi. |
| QZ-8952D7A309184D358F9F57774BF30AF2 | Quiz/System | Cevap anahtarı yanlıştı: dört cümlede “kırmak” dört farklı anlamdayken “hepsi aynı anlamda” şıkkı doğru kabul edilmişti; cümleler bozuktu (“sonunda kırdı döngüyü”, “oyunu bırakıp kırdı”), kök “koyu yazılan” diyordu. |
| QZ-8F23038529124552B5FBCFACE2B0CE38 | Quiz/System | Cevap anahtarı yanlıştı: “hafif bir dil” ciddiyetten uzak anlatım demektir, mecazdır; doğru kabul edilen “gerçek anlamına bağlı kalarak” yargısı yanlıştı. Kök “1.” ile başlıyordu. Doğru yargı aynı harfe yerleştirildi. |

## Alt konu dağılımı (revize sonrası)

| Alt konu | Soru |
|---|---:|
| SOZCUKTE_ANLAM_01 Gerçek Anlam | 12 |
| SOZCUKTE_ANLAM_02 Mecaz Anlam | 24 |
| SOZCUKTE_ANLAM_03 Terim Anlam | 16 |
| SOZCUKTE_ANLAM_04 Temel ve Yan Anlam | 13 |
| SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam | 16 |
| SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam | 15 |
| SOZCUKTE_ANLAM_07 Genel ve Özel Anlam | 12 |
| SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler | 25 |
| SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler | 10 |
| SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler | 7 |
| SOZCUKTE_ANLAM_11 Yansıma Sözcükler | 9 |
| SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı | 51 |
| SOZCUKTE_ANLAM_13 Anlam Değişmesi | 1 |

## Sistemle ilgili bulgular

- **Aylık branş kitapçıkları:** Mayıs–Temmuz kitapçıklarındaki “Sözcükte Anlam” slotlarına konmuş soruların neredeyse hepsi başka konudandı (paragraf, yazım, noktalama, cümle yapısı). Üretim hattı konu hedefine uymayan adayları kabul etmiş görünüyor.
- **API'nin işaretleme denetleyicisi** (`ExamGenerationMarkupCompiler`), kök “altı çizili” deyip çizgiler yalnız şıklarda olduğunda soruyu reddediyor. Oysa bu ÖSYM'nin en sık kullandığı tiptir (“Aşağıdaki cümlelerin hangisinde altı çizili sözcük…”). Uygulama bu tipi doğru gösteriyor; yalnız üretim bu tipi hiç üretemiyor.
- **Soru ailesi etiketleri** (`QuestionFamily`) AdminTest quiz sorularında konuyla ilgisiz (ör. sözcükte anlam sorusunda `tyt_tr_yazim_noktalama`). Bu alana dokunulmadı.
- **Doğru şık dağılımı dengesiz:** A: 73, B: 41, C: 52, D: 23, E: 22. Harfler korunduğu için dağılım aynen kaldı.
- **Kabul özeti** (`AcceptanceContentHash`) içerik değiştiği için artık güncel değil; yalnız denetim listesinde ve bir indekste kullanılıyor, öğrenciye etkisi yok. Dokunulmadı.

## Veritabanına yazma

- `sql/guncelle.sql`: Tek transaction. Önce her sorunun kökünün dışa aktarıldığı hâlde olduğunu (SHA-256) doğrular; biri arada değiştirdiyse hiçbir şey yazmadan durur. Her adımda satır sayısını denetler.
  Yazdıkları: soru kökü, konu ve alt konu, şıklar, doğru cevap (aynı), altı çizili işaretleme kayıtları (eskiler silinip yenileri), çözümler; ilgisiz 9 figür silinir.
- `sql/geri_al.sql`: Her şeyi dışa aktarılan eski hâline döndürür (silinen figürler dahil).
- **LocalDB'de uçtan uca denendi:** değişmiş kökle durdu ve veri aynen kaldı; güncelleme beklenenle birebir aynı; geri alma ilk hâlle birebir aynı. Denemede bulunan satır sonu hatası (`\r\n`) giderildi.

## Soru soru önce / sonra

### 1. TRK005667 · Exam/System · YKS TYT Türkçe Branş Temmuz 55 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; 'eklemelerin işlevi' üzerine belirsiz, tek doğrusu savunulamayan bir soru.

**Önce:** I. Eski bir not defterinde, yarım bırakılmış cümlelerin arasına küçük eklemeler yapılmıştı. II. Metni inceleyen kişi, bu eklemelerin cümlelerin anlamını bozmadığını; aksine, eksik kalan düşünceleri birbirine bağladığını fark etti. III. Ancak bazı yerlerde, ekl…

  **A) Cümleler arasında anlam ilişkisi kurması** · B) Sözcüklerin kökenini açıklaması · C) Fiil çekimlerini düzenlemesi · D) Ses düşmesini göstermesi · E) Yazım birliğini sağlaması

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük gerçek anlamıyla kullanılmıştır?

- **A) Kışın donan boruları onarmaya gelen usta, işe başlamadan önce <u>soğuk</u> su vanasını kapattı.**
- B) Toplantıda bize öyle <u>soğuk</u> davrandı ki kimse ona soru sormaya cesaret edemedi.
- C) Yıllardır görüşmediği arkadaşından gelen <u>sıcak</u> mektup onu çok mutlu etti.
- D) Sonuçlar açıklanmadan önce sınıfa <u>ağır</u> bir sessizlik çökmüştü.
- E) Komşumuzun <u>tatlı</u> dili sayesinde aradaki tartışma kısa sürede yatıştı.

### 2. TRK010999 · Exam/System · YKS TYT Türkçe Branş Temmuz 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragrafta ana düşünce sorusu.

**Önce:** Bir kütüphanede eski baskı bir romanın tanıtım notu hazırlanırken, metindeki bazı sözcüklerin okurda çağrıştırdığı anlamların eserin havasını değiştirdiği fark edilir. Notu hazırlayan kişi, yalnızca sözlük anlamına bağlı kalmanın yeterli olmadığını; bir sözcüğ…

  **A) Sözcüklerin metindeki etkisi, yalnızca temel anlamlarıyla de…** · B) Edebi metinlerde anlatım gücü, çoğunlukla uzun cümlelerin ku… · C) Bir metnin etkileyici olması için sözcüklerin herkesçe aynı … · D) Sözlük anlamı bilinmeyen sözcükler, metnin bütünü üzerinde b… · E) Tanıtım yazılarında amaç, eserin konusunu ayrıntılı biçimde …

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük yan anlamıyla kullanılmıştır?

- **A) Dağın <u>eteğindeki</u> köyde kışlar uzun ve sert geçer.**
- B) Annesi, düğün için diktirdiği uzun <u>eteği</u> dolaptan çıkardı.
- C) Bahçedeki ağacın <u>dalları</u> rüzgârla sallanıyordu.
- D) Düşerken dizini çarpan çocuğun <u>bacağı</u> morarmıştı.
- E) Kanadı kırılan <u>kuş</u> günlerce balkonda bakıldı.

### 3. TRK016137 · Exam/System · YKS TYT Mayıs 2 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; yazım-noktalama sorusu ve tek doğru cevabı yok (B, C ve D aynı yargıyı söylüyor).

**Önce:** Bir yazım kuralları çalışmasında, öğretmeninin verdiği örnekte noktalama işaretlerinin eksik kullanılması, cümledeki anlamı olumsuz etkilemiştir. Bu duruma göre, aşağıdakilerden hangisi bu cümledeki yazım kuralını ihlal etmiştir?

  A) Öğrencilerin çalışmaları süresince doğru noktalama işaretler… · **B) Cümlede yer alan ifadelere uygun noktalama işaretleri kullan…** · C) Cümledeki anlamın net olması için gerekli olan noktalama işa… · D) Doğru noktalama işaretleri kullanılmadığında, cümlede karmaş… · E) Öğrenciler, yazım kurallarına uymadıkları için cümlede anlam…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- A) Aralarındaki tartışmanın <u>kökü</u> çok eski bir anlaşmazlığa dayanıyordu.
- **B) Kimya dersinde tuzun suda çözünmesiyle oluşan karışımın bir <u>çözelti</u> olduğunu öğrendik.**
- C) Bu olaya bir de onun <u>açısından</u> bakmalısın.
- D) İki ortak arasındaki <u>denge</u> bozulunca şirket zor günler geçirdi.
- E) Akşam yemeğinde çorbanın <u>tuzunu</u> biraz fazla kaçırmışız.

### 4. TRK028604-202610 · Exam/System · YKS TYT Türkçe Branş 1 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: E

> Sorun: Kök 'altı çizili sözcük' diyor ama çizili sözcük yok; doğru cevaptaki “egemen”in karşılığı parçada geçmiyordu.

**Önce:** Öfke düzeyi yükseldikçe çevredeki insanların gösterdiği hoşgörü azalır. İnsanlar, karşılarındaki kişi öfkeli olduğunda çoğu zaman kendilerini korumak için pasif davranışlar sergiler ve durumu görmezden gelmeyi seçer. Bu yüzden tartışmanın temelindeki sorun dah…

  A) Uzak gelecekte insanların doğayla uyum içinde yaşayacağı düş… · B) Yorgunluktan ve isteksizlikten kurtulmak için erken kalkmak … · C) Artık kullanılmayan bu kutuyu kaldırıp atmak istedim. · D) Bilgi, en güç görünen engeller karşısında direnç kazandırır. · **E) Şair, sevginin egemen olduğu bir dünyanın kapısını aralıyor.**

**Sonra:** Öfkenin <u>hâkim</u> olduğu bir tartışmada çevredeki insanların gösterdiği hoşgörü azalır. İnsanlar, karşılarındaki kişi öfkeliyken çoğu zaman kendilerini korumak için geri çekilir ve durumu görmezden gelmeyi seçer. Bu yüzden tartışmanın temelindeki sorun daha da çözümsüz hâle gelebilir. ⏎ ⏎ Bu parçadaki altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- A) Uzak bir gelecekte insanların doğayla uyum içinde yaşayacağı düşünülüyor.
- B) Yorgunluktan ve isteksizlikten kurtulmak için erken kalkmak gerekir.
- C) Artık kullanılmayan bu kutuyu kaldırıp atmak istedim.
- D) Bilgi, en güç görünen engeller karşısında insana direnç kazandırır.
- **E) Şair, sevginin egemen olduğu bir dünyanın kapısını aralıyor.**

### 5. TRK034050-202610 · Exam/System · YKS TYT Tam Deneme 4 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Hedef sözcük çizili değil, tırnakla verilmiş; parçada “görmek” yalnız iki yerde geçtiği hâlde beş anlam sorulmuş; kökte “anlamların- dan” satır sonu artığı var.

**Önce:** Atatürk ile yaptığımız yolculuklarda, hangi bölgeye gitsek resmî makamlar kadar halkın da ilgisini görürdük. Bizim geldiğimizi çok uzaktan fark eden yöre halkı, büyük bir heyecan içinde onu beklerdi. Çünkü o, en zor zamanlarda Türk halkının iradesine tanık ola…

  A) Gözle bir şeyin varlığını algılama · **B) Karşılaşmak** · C) Ziyaret etmek · D) Gezmek · E) Bir olaya tanık olmak, yaşamak

**Sonra:** Atatürk ile çıktığımız yurt gezilerinde gittiğimiz her yerde halkın büyük ilgisiyle karşılanırdık. O, millî mücadelenin en zor günlerini <u>görmüş</u>, milletin direncine yakından tanıklık etmişti. Uğradığımız kentlerde okulları, fabrikaları <u>görmeden</u> ayrılmaz; önemli konuları konuşmak için yöneticileri <u>görmeye</u> özen gösterirdi. Yol kenarında <u>gördüğü</u> bir köylü kalabalığı için arabayı durdurduğu bile olurdu. ⏎ ⏎ Bu parçadaki altı çizili sözcükler, aşağıdaki anlamlardan hangisini karşılayacak biçimde kullanılmamıştır?

- A) Gözle bir şeyin varlığını algılamak
- **B) Karşılaşmak, uğramak**
- C) Ziyaret etmek, görüşmek
- D) Gezip incelemek
- E) Yaşamak, başından geçirmek

### 6. TRK039932-202610 · Exam/System · YKS TYT Tam Deneme 2 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Birden çok doğru cevap vardı (E'de de üç sözcük verilen anlamlarıyla kullanılmıştı).

**Önce:** • savrulmak: Rüzgârın etkisiyle bir yerden başka bir yere dağılmak. • eksilmek: Miktarı ya da sayısı azalmak. • kıvılcım: Isı ve sürtünmeyle oluşan küçük ateş parçası. Aşağıdaki cümlelerin hangisinde “savrulmak, eksilmek, kıvılcım” sözcükleri belirtilen anlaml…

  **A) Fırtınada savrulan yapraklar yüzünden bahçedeki çiçekler eks…** · B) Rüzgârla savrulan tozlar arasında sayıları eksilen kuşlar gö… · C) Bahçedeki çiçekler savrulunca dal sayısı eksildi, ateşin kıv… · D) Rüzgârda savrulan kâğıtlar azalırken sobadan çıkan kıvılcım,… · E) Şiddetli rüzgârda savrulan yapraklar eksildi; ardından çıkan…

**Sonra:** • dökülmek: Bir yere çok sayıda gelmek, akın etmek. ⏎ • tutmak: Bir yeri kaplamak. ⏎ • ağır: Önemli, ciddi. ⏎ ⏎ Aşağıdaki cümlelerin hangisinde “dökülmek, tutmak, ağır” sözcüklerinin tümü belirtilen anlamlarıyla kullanılmıştır?

- **A) Taraftarlar maçtan sonra sokaklara döküldü; kutlamalar ana caddeyi baştan sona tuttu, güvenlik güçleri ise ağır olaylar yaşanmaması için önlem aldı.**
- B) Sonbahar gelince yapraklar döküldü; ağır yük taşıyan kamyon da yolun yarısını tuttu.
- C) Halk yeni açılan pazara döküldü; ancak ağır adımlarla yürüyen yaşlılar kalabalıkta kendine yer tutamadı.
- D) Dedemin geçirdiği ağır hastalık hepimizi üzdü; bayramda torunları kapısına döküldü ama o gün kimse elini tutup öpemedi.
- E) Saçları dökülmeye başlayınca ağır bir bunalıma girdi; doktorun önerdiği ilacı da bir türlü tutturamadı.

### 7. TRK056497 · Exam/System · YKS TYT Türkçe Branş Haziran 34 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; cümleler arası ilişki sorusu ve kök neden-sonuç sorduğu hâlde doğru cevap amaç bildiriyor.

**Önce:** Bir notta yer alan cümleler karışık biçimde verilmiştir: I. Sabah erkenden yola çıktık. II. Hava kapatmadan köye ulaşmak istiyorduk. III. Bu yüzden molaları kısa tuttuk. IV. Yol boyunca sis yer yer görüşü azalttı. V. Akşamüstü köye vardığımızda herkes bizi bek…

  A) I. cümlede, zaman bildirimiyle olayların başlangıcı verilmek… · **B) II. cümlede, amaç bildirimiyle hareketin gerekçesi açıklanma…** · C) III. cümlede, sonuç bildirimiyle önceki durum özetlenmektedi… · D) IV. cümlede, karşılaştırma bildirimiyle iki durum yan yana g… · E) V. cümlede, koşul bildirimiyle varışın şartı belirtilmektedi…

**Sonra:** I. Sabah erkenden çıktığımız yolda <u>sis</u> görüşümüzü epey azalttı. ⏎ II. Köye vardığımızda herkesin yüzünde derin bir <u>özlem</u> vardı. ⏎ III. Ev sahibi bize sıcak bir <u>çorba</u> ikram etti. ⏎ IV. Gece boyunca sobada yanan <u>odun</u> çıtırdadı. ⏎ V. Ertesi gün dönüş için <u>bavullarımızı</u> erkenden hazırladık. ⏎ ⏎ Numaralanmış cümlelerin hangisinde altı çizili sözcük soyut anlamlıdır?

- A) I
- **B) II**
- C) III
- D) IV
- E) V

### 8. TRK061724 · Exam/System · YKS TYT Temmuz 4 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: A

> Sorun: Sözcükte anlam sorusu değil (yazım-noktalama); 'altı çizili bölüm' deniyor ama çizili bölüm yok ve doğru kabul edilen virgül kuralı yanlış.

**Önce:** Aşağıdaki cümle, bir arşiv çalışmasında yer alan notlardan alınmıştır: “Restorasyon sırasında, yapının girişindeki eski levha dikkatle sökülüp yeni bölüme taşındı.” Bu cümlede altı çizili bölümün yazımıyla ilgili hangi değerlendirme yapılmalıdır?

  **A) “Restorasyon sırasında” ifadesinden sonra virgül kullanılmal…** · B) “Yapının girişindeki” ifadesi bitişik yazılmalıdır. · C) “Eski levha” ifadesinde birleştirme eki kullanılmalıdır. · D) “Dikkatle sökülüp” ifadesinden önce noktalı virgül gelmelidi… · E) “Yeni bölüme” ifadesi kesme işaretiyle ayrılmalıdır.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük, ötekilerdeki sözcükle yazılışı ve okunuşu aynı olan ancak anlamca hiçbir ilgisi bulunmayan (eş sesli) bir sözcüktür?

- **A) Güneşli bir yaz günü <u>yüz</u> metre ötedeki iskeleye kadar yürüdük.**
- B) Müjdeyi duyan çocuğun <u>yüzü</u> sevinçten pembeleşmişti.
- C) Bu kumaşın <u>yüzü</u> parlak, astarı mattır.
- D) Yaptıklarından sonra bu evin kapısından girmeye <u>yüzü</u> yoktu.
- E) Dağın kuzey <u>yüzü</u> yılın büyük bölümünde karla kaplıdır.

### 9. TRK077012-202610 · Exam/System · YKS TYT Tam Deneme 1 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Soru doğru ama alt konusu yoktu; numaralar ayrı satıra alındı, çözüm yenilendi.

**Önce:** (I) Bu yıl elimizdeki zamanı ve enerjiyi yeterince kullanmadık. (II) Çok fazla plan yaptık fakat az uyguladık. (III) Makineden çok, insan emeğine ihtiyaç duyuyoruz. (IV) Bilgiden çok, anlayış ve nezakete ihtiyaç duyuyoruz. (V) Bunlar olmazsa yaşam giderek sert…

  **A) I** · B) II · C) III · D) IV · E) V

**Sonra:** (I) Bu yıl elimizdeki zamanı ve enerjiyi yeterince kullanmadık. (II) Çok fazla plan yaptık fakat azını uyguladık. (III) Makineden çok insan emeğine ihtiyaç duyuyoruz. (IV) Bilgiden çok anlayışa ve nezakete ihtiyaç duyuyoruz. (V) Bunlar olmazsa yaşam giderek sertleşir ve birçok şeyi yitiririz. ⏎ ⏎ Bu parçada numaralanmış cümlelerin hangisinde “gerektiği kadar, kararında” anlamını taşıyan bir söz kullanılmıştır?

- **A) I**
- B) II
- C) III
- D) IV
- E) V

### 10. TRK108906 · Exam/System · YKS TYT Türkçe Branş Temmuz 55 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; paragrafta ana düşünce sorusu.

**Önce:** Aşağıdaki iki cümle birlikte değerlendirildiğinde, yazarın asıl olarak vurgulamak istediği düşünce hangisidir? ⏎ ⏎ I. Bir sözcüğün anlamı, yalnızca sözlükteki karşılığıyla sınırlı değildir; kullanıldığı bağlam, ona yeni bir değer ve yön kazandırabilir. ⏎ II. B…

  A) Sözcüklerin değeri, ancak teknik terim olarak kullanıldıklar… · **B) Anlam, sözcükten çok onu çevreleyen bağlam içinde şekillenir…** · C) Bir metnin etkisi, yalnızca uzun ve ayrıntılı cümleler kurul… · D) Dil, her durumda sözlükteki ilk karşılığıyla anlaşılmalı ve … · E) Kelime seçimi, anlatımda yalnızca yazım kurallarına uygunluk…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük “etkisini yitirmek, gücü azalmak” anlamında kullanılmıştır?

- A) Rüzgâr çıkınca kamp ateşi bir anda <u>söndü</u>.
- **B) Yılların yorgunluğuyla gençliğindeki o büyük heyecan da <u>söndü</u>.**
- C) Çocuğun elindeki balon iğneye değince <u>söndü</u>.
- D) Elektrik kesilince sokak lambaları birer birer <u>söndü</u>.
- E) Mangaldaki közler sabaha doğru tamamen <u>söndü</u>.

### 11. TRK137597-202610 · Exam/System · YKS TYT Türkçe Branş 3 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: B

> Sorun: Hedef söz çizili değil, tırnakla verilmiş; parçadaki söz (“puslu dönemlerinden birinde”) kökte farklı biçimde aktarılmış.

**Önce:** 1930 kuşağı, Türk şiir tarihinin puslu dönemlerinden birinde var olmuştur. Gelişmemiş, cılız bir modernizmin kuşatıcı olamayan gölgesi de hayli dardır. Bireycisinden toplumcusuna, gelenekçisinden yenilikçisine temsil yelpazesi epey dalgalı olan bu kuşağın imkâ…

  A) Yeni atılımların ortaya çıkabildiği bir zaman dilimi · **B) Belirsizliğin egemen olduğu bir dönem** · C) Birçok şiir anlayışının iç içe geçtiği bir süreç · D) Sanatsal açıdan zayıf örneklerle dolu bir çağ · E) Eskinin yeniyle sürekli çatıştığı bir devre

**Sonra:** 1930 kuşağı, Türk şiir tarihinin <u>puslu dönemlerinden birinde</u> var olmuştur. Gelişmemiş, cılız bir modernizmin kuşatıcı olamayan gölgesi de hayli dardır. Bireycisinden toplumcusuna, gelenekçisinden yenilikçisine temsil yelpazesi epey dalgalı olan bu kuşağın imkânı da mekânı da kısıtlıdır. Birkaç kahveye sığan dar mekânları, kimsesizlik konumuna mahsus dramları, ne yapsalar önemsenmeyen uğraşları, küçümsendikçe kabaran egoları vardır. ⏎ ⏎ Bu parçadaki altı çizili sözle anlatılmak istenen aşağıdakilerden hangisidir?

- A) Yeni atılımların ortaya çıkabildiği bir zaman dilimi
- **B) Belirsizliğin egemen olduğu bir dönem**
- C) Birçok şiir anlayışının iç içe geçtiği bir süreç
- D) Sanatsal açıdan zayıf örneklerle dolu bir çağ
- E) Eskinin yeniyle sürekli çatıştığı bir devre

### 12. TRK149331 · Exam/System · YKS TYT Türkçe Branş Haziran 37 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Doğru kabul edilen C savunulamıyor (“dağıtıldı” eşitlik anlamı taşımıyor); hiçbir şık doğru değildi ve hedef sözcükler tırnakla verilmişti.

**Önce:** Bir not uygulamasında şu cümleler yer alıyor: I. Toplantıdan sonra herkes kendi bölümüne döndü. II. Müdür, çalışanlara kısa bir açıklama yaptı. III. Ardından yeni görevler dağıtıldı. Bu cümlelerde geçen bazı sözcüklerin anlamı, metnin bütününe göre belirlenirk…

  A) I. cümledeki “bölüm” sözcüğü, bir yapının ayrı kısmını anlat… · B) II. cümledeki “açıklama” sözcüğü, kapalı ve anlaşılmaz bir a… · **C) III. cümledeki “dağıtıldı” sözcüğü, görevlerin eşit biçimde …** · D) I. cümledeki “kendi” sözcüğü, başkasına ait olanı ifade eder… · E) II. cümledeki “kısa” sözcüğü, süresi uzun olan bir konuşmayı…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük ötekilerden farklı bir anlamda kullanılmıştır?

- A) Postacı, sabahın erken saatlerinde mektupları kapı kapı <u>dağıttı</u>.
- B) Öğretmen, sınav kâğıtlarını sıraların üzerine tek tek <u>dağıttı</u>.
- **C) Sert esen rüzgâr, gökyüzündeki bulutları kısa sürede <u>dağıttı</u>.**
- D) Belediye, depremzedelere battaniye ve yiyecek <u>dağıttı</u>.
- E) Müdür, toplantının sonunda yeni görevleri çalışanlara <u>dağıttı</u>.

### 13. TRK181459-202610 · Exam/System · YKS TYT Türkçe Branş 1 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Soru doğru ama alt konusu yoktu; kök ile soru cümlesi ayrıldı, çözüm yenilendi.

**Önce:** Kimi yazarlar romanın toplum hayatındaki aksaklıkların ortadan kalkmasına yardım etmesini, ---- isterken kimileri ise romanın bir toplum bilimi kitabı değil bir sanat eseri olduğunu, ondan ancak ---- beklenebileceğini ileri sürer. Bu cümlede boş bırakılan yerl…

  A) gerçekleri yansıtmasını - kılavuzluk yapmasının · **B) doğru yolu göstermesini - edebî güzelliğin** · C) güzellikleri anlatmasını - kusursuz dil kullanımının · D) ironiyi öne çıkarmasını - iyi bir anlatımın · E) geleneği aktarmasını - mantıksal bir akışın

**Sonra:** Kimi yazarlar romanın toplum hayatındaki aksaklıkların ortadan kalkmasına yardım etmesini, ---- isterken kimileri ise romanın bir toplum bilimi kitabı değil bir sanat eseri olduğunu, ondan ancak ---- beklenebileceğini ileri sürer. ⏎ ⏎ Bu cümlede boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- A) gerçekleri yansıtmasını - kılavuzluk yapmasının
- **B) doğru yolu göstermesini - edebî güzelliğin**
- C) güzellikleri anlatmasını - kusursuz dil kullanımının
- D) ironiyi öne çıkarmasını - iyi bir anlatımın
- E) geleneği aktarmasını - mantıksal bir akışın

### 14. TRK203460-202610 · Exam/System · YKS TYT Tam Deneme 3 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: E

> Sorun: Soru doğru ama alt konusu yoktu; kök ile soru cümlesi ayrıldı, çözüm yenilendi.

**Önce:** Bazı enzimlerin, tamamen ---- olmakla birlikte bağışıklık sisteminin kontrol edilmesinde önemli role sahip olduğu ve ilaçlarla engellendiğinde bazı olumsuz ---- ortaya çıktığı biliniyor. Bu cümlede boş bırakılan yerlere aşağıdakilerden hangisi sırasıyla getiri…

  A) keşfedilememiş - tesirlerin · B) belirtilememiş - yönlerinin · C) araştırılamamış - özelliklerinin · D) bilinememiş - etkenlerin · **E) açıklanamamış - durumların**

**Sonra:** Bazı enzimlerin, tamamen ---- olmakla birlikte bağışıklık sisteminin kontrol edilmesinde önemli role sahip olduğu ve ilaçlarla engellendiğinde bazı olumsuz ---- ortaya çıktığı biliniyor. ⏎ ⏎ Bu cümlede boş bırakılan yerlere aşağıdakilerden hangisi sırasıyla getirilmelidir?

- A) keşfedilememiş - tesirlerin
- B) belirtilememiş - yönlerinin
- C) araştırılamamış - özelliklerinin
- D) bilinememiş - etkenlerin
- **E) açıklanamamış - durumların**

### 15. TRK212437-202610 · Exam/System · YKS TYT Tam Deneme 3 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: D

> Sorun: Sorulan “gelişigüzel” sözcüğünün kendisi IV. cümlede geçiyordu; soru eş anlamlıyı değil sözcüğün kendisini aratıyordu.

**Önce:** (I) Yanlış kullanılan her şey bir süre sonra yıpranır. (II) “Dürüstlük” sözcüğü de son zamanlarda iyice yıprandı. (III) İnsanlar durmadan her şeyi dürüstçe yaptıklarını söylüyor. (IV) “Dürüstlük” sözcüğü gelişigüzel kullanıla kullanıla yıprandıysa “dürüstlük” …

  A) I · B) II · C) III · **D) IV** · E) V

**Sonra:** (I) Yanlış kullanılan her şey bir süre sonra yıpranır. (II) “Dürüstlük” sözcüğü de son zamanlarda iyice yıprandı. (III) İnsanlar durmadan her şeyi dürüstçe yaptıklarını söylüyor. (IV) “Dürüstlük” sözcüğü rastgele kullanıla kullanıla yıprandıysa dürüstlük kavramı da yıprandı mı? (V) Hayır, yıpranmadı; çünkü kavramlar yıpranmaz, yalnızca anlam değiştirir, bölünür, silinir. ⏎ ⏎ Bu parçada numaralanmış cümlelerin hangisinde “gelişigüzel” anlamına gelen bir söz kullanılmıştır?

- A) I
- B) II
- C) III
- **D) IV**
- E) V

### 16. TRK235297 · Exam/System · YKS TYT Haziran 2 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; paragraftan yargı çıkarma sorusu.

**Önce:** Aşağıdaki kısa notta, bir araştırma ekibinin üç farklı okuma grubundan elde ettiği gözlemler özetlenmiştir: I. Grup, metindeki az bilinen sözcükleri sözlükten kontrol etmesine rağmen ana düşünceyi daha iyi kurmuştur. II. Grup, sözcükleri tek tek ezberlemeye od…

  A) Sözcükleri tek tek öğrenmek, metni anlamanın en güvenli yolu… · **B) Anlama başarısı, sözcük bilgisinden çok bağlamı kavrayabilme…** · C) Sözlük kullanmak, okuma sürecini gereksiz biçimde yavaşlatır… · D) Cümleler arasındaki bağ, yalnızca uzun metinlerde belirleyic… · E) Yeni metinleri hızlı okumak, ayrıntıları göz ardı etmeyi ger…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcükler arasında genel-özel anlam ilişkisi vardır?

- A) Bu yıl <u>kış</u> erken geldi, <u>yaz</u> ise çok kısa sürdü.
- **B) Pazardan aldığımız <u>meyvelerin</u> arasında en çok <u>elmayı</u> sevdim.**
- C) Odadaki <u>masa</u> ile <u>sandalye</u> aynı ağaçtan yapılmıştı.
- D) Çocuk <u>hızlı</u> koşunca <u>yavaş</u> yürüyen annesinden uzaklaştı.
- E) Bu <u>kitabı</u> okuyunca <u>yazarını</u> merak etmeye başladım.

### 17. TRK245512 · Exam/System · YKS TYT Türkçe Branş Haziran 37 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragrafta ana düşünce sorusu.

**Önce:** I. Bir sözcüğün anlamı, kullanıldığı cümledeki diğer sözcüklerle kurduğu ilişkiye göre daralabilir, genişleyebilir ya da bütünüyle değişebilir. II. Bu yüzden bir metindeki sözcükleri tek tek sözlük karşılığıyla okumak, anlatılmak isteneni her zaman doğru kavra…

  **A) Sözcüklerin anlamı, metindeki kullanımlarına göre değişebild…** · B) Sözlükte yer alan ilk anlam, her metinde sözcüğün en uygun k… · C) Metin çözümlemesinde yalnızca cümlelerin sayısı ve sıralanış… · D) Yazarın anlatım gücü, sözcükleri olabildiğince az kullanması… · E) Okurun metni anlaması, sözcüklerin yazım kurallarına uygun s…

**Sonra:** Aşağıdaki cümlelerin hangisinde karşıt anlamlı sözcükler bir arada kullanılmıştır?

- **A) İnsan, yaşamın acısını da tatlısını da aynı sabırla karşılamalıdır.**
- B) Uzun yolculuktan sonra yorgun ve bitkin bir hâlde eve döndü.
- C) Eski kentin dar ve eğri sokaklarında saatlerce dolaştık.
- D) Çocuk sevinçle ve coşkuyla babasının boynuna sarıldı.
- E) Yaşlı adam bastonuna dayanarak ağır ağır, yavaş yavaş yürüyordu.

### 18. TRK255293-202610 · Exam/System · YKS TYT Türkçe Branş 1 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Soru bozuktu: parantez içi açıklamalar yoktu, metinde dört numara varken şıklarda V vardı, soru cümlesi iki kez yazılmıştı.

**Önce:** Aşağıdaki parçada numaralanmış sözlerden hangisinin anlamı, parantez içinde verilen açıklamayla örtüşmez? İnsanı merkeze alan ve yalnızca onun ihtiyaçları doğrultusunda şekillenen bir dünya tasarımı I insanın doğanın efendisi olmasını sağlamıştır. İnsanın ikti…

  A) I · B) II · **C) III** · D) IV · E) V

**Sonra:** İnsanı merkeze alan ve yalnızca onun ihtiyaçları doğrultusunda biçimlenen bir dünya tasarımı, insanın doğanın efendisi (I) olmasını sağlamıştır. İnsanın iktidar (II) mücadelesi de buna eklenince doğayı denetleme gücü giderek artmış; denetim zamanla sömürüye (III) dönüşmüştür. Bu süreç, insanın etik (IV) değerlerden uzaklaşmasına, hem kendine hem doğaya karşı insafsız (V) oluşuna yol açmıştır. ⏎ ⏎ Bu parçada numaralanmış sözlerden hangisinin anlamı karşısında verilen açıklamayla uyuşmamaktadır?

- A) I - hükmeden, buyruğu altında tutan
- B) II - güç, egemenlik
- **C) III - koruma altına alma**
- D) IV - ahlakla ilgili
- E) V - acımasız, merhametsiz

### 19. TRK262292 · Exam/System · YKS TYT Türkçe Branş Haziran 55 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; iki yargının ortak düşüncesi (paragraf) sorusu.

**Önce:** Aşağıdaki iki yargı, bir metinde sözcük seçiminin okuyucu üzerindeki etkisini tartışmaktadır: I. “Sözleri özenle seçmek, anlatımı yalnızca daha düzgün değil, aynı zamanda daha düşündürücü hâle getirir.” II. “Bir metni etkili yapan, süslü ifadelerin çokluğu değ…

  **A) Anlatımın gücü, sözcüklerin gösterişli olmasından çok anlamı…** · B) Bir metinde uzun cümleler kurmak, düşüncenin derinliğini art… · C) Sözcüklerin sık kullanımı, metnin anlaşılmasını kolaylaştıra… · D) Aynı düşünceyi farklı biçimlerde yinelemek, anlatımı daha ik… · E) Duygusal çağrışımı güçlü sözcükler, her metinde nesnel anlat…

**Sonra:** Aşağıdaki cümlelerin hangisinde “özen” sözcüğünün eş anlamlısı kullanılmıştır?

- **A) Raporu büyük bir itinayla hazırladığı her satırından belli oluyordu.**
- B) Toplantıya gösterdiği ilgi hepimizi şaşırttı.
- C) Sınava girmeden önce içini derin bir kaygı kaplamıştı.
- D) Yolculuk boyunca sabır gösteren çocuklar ödüllendirildi.
- E) Bu işteki ustalığı herkesçe kabul ediliyordu.

### 20. TRK289119 · Exam/System · YKS TYT Türkçe Branş Haziran 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: A

> Sorun: Sözcükte anlam sorusu değil (yazım); altı çizili sözcük işaretlenmemiş, alt çizgi karakteriyle (_…_) yazılmıştı.

**Önce:** Bir notta yer alan şu cümlede altı çizili sözcüğün yazımı, metnin anlamını değiştirmeden düzenlenmek isteniyor: “Toplantıdan sonra kaleme aldığı notta, beklenmedik bir ayrıntıdan söz ederek durumu _özetlediğini_ belirtti.” Buna göre altı çizili sözcüğün yazımı…

  **A) Sözcük, ek almış biçimiyle bırakılmalıdır.** · B) Sözcüğe kesme işareti eklenmelidir. · C) Sözcükteki ünlü daralması kaldırılmalıdır. · D) Sözcük birleşik yazım kurallarına göre ayrılmalıdır. · E) Sözcüğün ilk harfi büyük yazılmalıdır.

**Sonra:** Aşağıdaki cümlelerin hangisinde yansıma (doğadaki seslerden türemiş) bir sözcük kullanılmamıştır?

- **A) Bahçedeki çocuklar akşama kadar top oynadı.**
- B) Derenin şırıl şırıl akışı hepimizi uyuttu.
- C) Kapı gıcırdayınca herkes başını çevirdi.
- D) Sobanın üstündeki çaydanlık fokurduyordu.
- E) Yaprakların hışırtısı ormanın sessizliğini bozdu.

### 21. TRK291133 · Exam/System · YKS TYT Türkçe Branş Haziran 55 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: Sözcükte anlam sorusu değil; bildirim metinleri üzerine belirsiz bir anlatım sorusu.

**Önce:** Aşağıdaki kısa notta, bir kullanıcı arayüzünde yer alan bildirimler incelenmektedir: I. “Dosya yüklendi.” II. “Yeni mesajlarınız var.” III. “Toplantı 14.30’da başlayacak.” Bu üç cümledeki sözcüklerin, iletilmek istenen anlamı daha açık ve kısa biçimde vermesi …

  A) Sözcükler, anlamı daraltıp ayrıntıyı artıracak biçimde seçil… · B) Sözcükler, anlatımı uzatıp açıklığı azaltacak biçimde seçilm… · **C) Sözcükler, iletinin doğrudan ve hızlı anlaşılmasını sağlayac…** · D) Sözcükler, duygusal çağrışımı güçlendirecek biçimde seçilmiş… · E) Sözcükler, mecazlı anlatımı öne çıkaracak biçimde seçilmişti…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük mecaz anlamıyla kullanılmıştır?

- A) Kış gelince çocuklara <u>kalın</u> birer mont aldık.
- B) Merdivenden inerken çocuk <u>ayağını</u> burktu.
- **C) Bu kadar <u>kırıcı</u> sözlerden sonra ona nasıl güvenebilirim?**
- D) Bahçedeki <u>yaşlı</u> çınar dünkü fırtınada devrildi.
- E) Annem akşam için <u>tatlı</u> bir kek hazırladı.

### 22. TRK291681-202610 · Exam/System · YKS TYT Tam Deneme 2 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: C

> Sorun: Kök 'altı çizili sözcükler' diyor ama hiçbir sözcük çizili değildi.

**Önce:** Kendi kendine kâfi müphem bir idrak hâlinde bu korku, uykunun derecelerini fevkalade hassas bir ölçü ile tayin ediyor ve şuurun simsiyah kesileceği anda, sessiz bir patlayışla bütün vücudu sarsarak hastayı sıçratıyor ve uyandırıyordu. Aşağıdakilerden hangisi b…

  A) anlayış · B) belirsiz · **C) duygu** · D) belirlemek · E) bilinç

**Sonra:** Kendi kendine kâfi, <u>müphem</u> bir <u>idrak</u> hâlinde bu korku, uykunun derecelerini fevkalade hassas bir ölçüyle <u>tayin</u> ediyor ve <u>şuurun</u> simsiyah kesileceği anda, sessiz bir patlayışla bütün vücudu sarsarak hastayı sıçratıyor ve uyandırıyordu. ⏎ ⏎ Aşağıdakilerden hangisi bu cümledeki altı çizili sözcüklerden herhangi birinin eş anlamlısı değildir?

- A) anlayış
- B) belirsiz
- **C) duygu**
- D) belirlemek
- E) bilinç

### 23. TRK303224 · Exam/System · YKS TYT Türkçe Branş Haziran 70 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragraftan yargı çıkarma sorusu.

**Önce:** Aşağıdaki kısa paragrafta, bir yazarın aynı kavramı farklı bağlamlarda kullanırken anlamı daraltıp genişlettiği görülmektedir: "Kimi zaman bir sözcük, günlük konuşmada sıradan bir çağrışım taşırken metin içinde daha yoğun, daha özel bir anlam kazanır; kimi zam…

  **A) Sözcüklerin anlamı, kullanıldıkları bağlama göre değişebilir…** · B) Sözlükte yer alan karşılıklar, her durumda sözcüklerin anlam… · C) Bir sözcüğün etkisi, yalnızca ses yapısının güçlü olmasına b… · D) Cümledeki anlam ilişkileri, sözcüklerin biçim özelliklerinde… · E) Okurun görevi, metindeki sözcükleri bağlamdan bağımsız biçim…

**Sonra:** Aşağıdaki cümlelerin hangisinde “kırmak” sözcüğü gerçek anlamıyla kullanılmıştır?

- **A) Çocuk, bahçede top oynarken mutfağın camını kırdı.**
- B) Söylediği sözlerle annesinin kalbini kırdı.
- C) Mağaza fiyatları kırınca satışlar birden arttı.
- D) Kıyıdaki ağaçlar rüzgârın hızını kırıyordu.
- E) Genç atlet yarışmada ülke rekorunu kırdı.

### 24. TRK316949 · Exam/System · YKS TYT Türkçe Branş Temmuz 70 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: C

> Sorun: Sözcükte anlam sorusu değil; noktalama sorusu.

**Önce:** Aşağıdaki iki cümle, bir metnin son kontrolünde yan yana duruyor: I. “Toplantıda alınan kararlar, ertesi gün çalışanlara ayrıntılı biçimde duyuruldu.” II. “Toplantıda alınan kararlar ertesi gün çalışanlara ayrıntılı biçimde duyuruldu.” Bu iki cümle karşılaştır…

  A) I. cümlede virgül, özneyi ve yüklemi ayırdığı için zorunlu k… · B) II. cümlede virgül eksikliği anlamı bozduğu için cümle tamam… · **C) I. cümlede virgül, gereksiz bir durak oluşturduğu için çıkar…** · D) II. cümledeki yazım, yüklemden önceki ögeyi belirginleştirdi… · E) Her iki cümlede de noktalama kullanımı aynı ölçüde yerindedi…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcüğün yerine, cümlenin anlamı değişmeden ayraç içindeki sözcük getirilebilir?

- A) Konuşmasının sonunda <u>kısaca</u> teşekkür etti. (öfkeyle)
- B) Bu konuda <u>tecrübeli</u> biriyle görüşmelisin. (cesur)
- **C) Yaşlı adam, olanları büyük bir <u>sükûnetle</u> dinledi. (sakinlikle)**
- D) Yarışmayı <u>kazanan</u> takım kupayı törenle aldı. (yarışan)
- E) Çocukluğum bu <u>eski</u> evde geçti. (büyük)

### 25. TRK325789 · Exam/System · YKS Türkçe Branş Mayıs 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: C

> Sorun: Sözcükte anlam sorusu değil; şıkları birbirine çok yakın, tek doğrusu savunulamayan genel bir anlatım sorusu.

**Önce:** Bir metinde yazar, kullandığı kelimelerin anlamını etkili bir şekilde iletebilmek için dikkatli bir seçim yapmalıdır. Bu bağlamda, kelime seçimindeki titizliğin metnin anlaşılabilirliğine katkısı hangi durumla en iyi şekilde açıklanır?

  A) Yazarın kelime tercihinin metnin akışını güçlendirmesi. · B) Kelime seçimindeki titizliğin okuyucunun dikkatini artırması… · **C) Kullanılan kelimelerin anlamının net bir şekilde ifade edilm…** · D) Yazarın kullandığı kelimelerin çok anlamlı olması. · E) Kelime seçimindeki titizliğin metnin duygusal etkisini artır…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük temel anlamıyla kullanılmıştır?

- A) Masanın <u>ayağı</u> kırılınca üzerindeki vazo yere düştü.
- B) Kapının <u>kolu</u> çevirirken elimde kaldı.
- **C) Çocuk bisikletten düşünce <u>kolunu</u> incitti.**
- D) Dağın <u>sırtında</u> küçük bir köy vardı.
- E) Testerenin <u>dişleri</u> zamanla körelmişti.

### 26. TRK328070-202610 · Exam/System · YKS TYT Tam Deneme 1 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: “Yansıtmak” tanımı eksikti (yalnız görüntü); şıkların bir kısmı belirsizdi, maddeler tek satıra yazılmıştı.

**Önce:** • parlak: Işığı güçlü ve göz alıcı olan. • yansıtmak: Bir yüzeyde görüntüyü geri vermek. • uç: Bir şeyin en dış ya da en ileri noktası. Aşağıdaki cümlelerin hangisinde “parlak, yansıtmak, uç” sözcükleri belirtilen anlamlarını karşılayacak şekilde kullanılmıştı…

  **A) Sahildeki parlak taşlar ışığı yansıtıyor, kayığın ucu kıyıya…** · B) Parlak fikirleriyle dikkat çeken öğrenci, sözlerini duvara y… · C) Yansıtılan görüntü, parlak ekranda belirince kalemin ucu mas… · D) Uç fikirlerini parlak bir sesle yansıtan konuşmacı, salondak… · E) Parlak ışık, gölgedeki resmi yansıtınca çadırın ucu rüzgârda…

**Sonra:** • parlak: Işığı güçlü ve göz alıcı olan. ⏎ • yansıtmak: Işığı, sesi ya da görüntüyü bir yüzeyden geri çevirmek. ⏎ • uç: Bir şeyin en dış ya da en ileri noktası. ⏎ ⏎ Aşağıdaki cümlelerin hangisinde “parlak, yansıtmak, uç” sözcüklerinin tümü belirtilen anlamlarıyla kullanılmıştır?

- **A) Sahildeki parlak taşlar güneş ışığını yansıtıyor, kayığın ucu kıyıya değiyordu.**
- B) Parlak fikirleriyle dikkat çeken öğrenci, düşüncelerini yazısına yansıtıp sözlerini kısa kesti.
- C) Yaşadıklarını eserlerine yansıtan yazarın parlak kapaklı kitabı rafın en ucunda duruyordu.
- D) Uç görüşlerini toplantıda dile getiren konuşmacı, parlak bir başarı elde etti.
- E) Parlak ışık gölgedeki resmi aydınlatınca çadırın ucu rüzgârda sallandı.

### 27. TRK366269 · Exam/System · YKS TYT Haziran 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; paragrafta ana düşünce sorusu.

**Önce:** I. Bir metni anlamak, yalnızca sözcüklerin sözlük karşılıklarını bilmekle sınırlı değildir; sözcüklerin cümle içindeki ilişkisi, metnin yönünü de belirler. II. Bu yüzden okur, bir ifadenin hangi çağrışımı taşıdığını ve hangi duyguyu güçlendirdiğini de dikkate …

  A) Bir metni anlamada sözcüklerin sözlük karşılıkları, çoğu zam… · **B) Sözcüklerin metin içindeki işlevi, okurun metnin yönünü ve i…** · C) Benzer görünen sözcükler, metinde her zaman aynı duyguyu ve … · D) Metinlerde asıl önemli olan, yazarın kullandığı sözcük sayıs… · E) Okur, bir metni değerlendirirken yalnızca cümlelerin uzunluğ…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük nicel (sayı, miktar bildiren) anlamda kullanılmıştır?

- A) Bu yıl bahçemizde çok <u>tatlı</u> elmalar yetişti.
- **B) Toplantıya <u>birkaç</u> kişi geç kaldı.**
- C) Masanın üzerinde <u>kırmızı</u> bir defter duruyordu.
- D) Bu <u>dar</u> sokaktan arabayla geçmek zordu.
- E) Doğum gününde ona <u>güzel</u> bir hediye aldık.

### 28. TRK464756-202610 · Exam/System · YKS TYT Paragraf Branş 11 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Soru doğru ama alt konusu yoktu; soru cümlesi ayrıldı, çözüm yenilendi.

**Önce:** Ders materyalleri, sınıf içi öğretim sürecinin ---- kılınmasında öğretmen ve öğrenciler için vazgeçilmez destek unsurlarıdır. Ancak bu materyallerin etkili olabilmesi, zamanında ve amacına uygun biçimde kullanılmalarına bağlıdır. Bu nedenle görsel ve işitsel ö…

  **A) işlevsel - planlanmış** · B) sağlıklı - tartışılmış · C) başarılı - değerlendirilmiş · D) etkileyici - sunulmuş · E) verimli - seçilmiş

**Sonra:** Ders materyalleri, sınıf içi öğretim sürecinin ---- kılınmasında öğretmen ve öğrenciler için vazgeçilmez destek unsurlarıdır. Ancak bu materyallerin etkili olabilmesi, zamanında ve amacına uygun biçimde kullanılmalarına bağlıdır. Bu nedenle görsel ve işitsel ögelerle zenginleştirilen öğrenme ortamlarının önceden ---- biçimde hazırlanması, öğrenme sürecine olumlu katkı sağlayacaktır. ⏎ ⏎ Bu parçada boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- **A) işlevsel - planlanmış**
- B) sağlıklı - tartışılmış
- C) başarılı - değerlendirilmiş
- D) etkileyici - sunulmuş
- E) verimli - seçilmiş

### 29. TRK486967-202610 · Exam/System · YKS TYT Tam Deneme 3 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kök 'parantez içinde verilen anlamlar' diyor ama hiçbir anlam verilmemişti; şıklar 'üç sözcük' diyor, cümlede iki sözcük çiziliydi.

**Önce:** Aşağıdaki cümlelerde geçen altı çizili sözcüklerin, parantez içinde verilen anlamları karşılayıp karşılamadığına bakınız. Bu değerlendirmede, sözcüklerin cümle içindeki kullanımı esas alınacaktır. ⏎ ⏎ I. Uyandığımız anda, günün dörtte birini <u>arkada</u> bıra…

  **A) I. cümledeki üç sözcük de verilen anlamlarıyla kullanılmıştı…** · B) Yalnızca ilk cümledeki ilk sözcük verilen anlamıyla kullanıl… · C) İkinci cümledeki iki sözcük de verilen anlamlarıyla kullanıl… · D) İki cümlede de yalnızca son sözcük verilen anlamıyla kullanı… · E) Her iki cümledeki sözcüklerin tamamı verilen anlamlarıyla ku…

**Sonra:** Uyandığımız anda günün dörtte birini çoktan (yavaş yavaş) [I] geride bırakmış sayılırız. Bundan sonraki derdimiz (uğraşımız) [II] sabahı nasıl değerlendireceğimizdir. Kimi insan güne erkenden koyulur (başlar) [III], kimi ise saatlerce oyalanır (vakit geçirir) [IV]. Oysa günün ilk saatleri çoğu zaman bütün günün seyrini (gidişatını) [V] belirler. ⏎ ⏎ Bu parçada numaralanmış sözlerden hangisinin anlamı ayraç içinde verilen açıklamayla uyuşmamaktadır?

- **A) I**
- B) II
- C) III
- D) IV
- E) V

### 30. TRK497163 · Exam/System · YKS TYT Türkçe Branş Temmuz 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; özne ve cümle yapısı üzerine bir dil bilgisi sorusu.

**Önce:** Bir notta yer alan iki kullanım karşılaştırılıyor: I. “Sözleri, beklenmedik bir anda herkesin dikkatini çekti.” II. “Onun sözleri, beklenmedik bir anda herkesin dikkatini çekti.” Bu iki cümle arasında anlam farkı oluşturan öge, aşağıdakilerden hangisinde doğru…

  **A) I. cümlede öznenin belirtilmemesi anlatımı daha genel hâle g…** · B) II. cümlede sözcüğün başına getirilen ek, anlamı daraltarak … · C) I. cümlede virgül kullanımı, anlamı genişletip cümleyi tamam… · D) II. cümlede tamlama yapısı, cümledeki yüklemi zaman bakımınd… · E) I. cümlede sözcük tekrarları, cümlenin duygusunu güçlendirip…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük somut anlamlıdır?

- **A) Rüzgârın getirdiği <u>koku</u> bütün sokağı sardı.**
- B) Bu işte en çok onun <u>sabrına</u> güveniyorum.
- C) Çocukluğuna dair tatlı bir <u>hatıra</u> anlattı.
- D) Yeni kurallara herkes <u>saygı</u> gösterdi.
- E) Ödevlerini bitirmenin <u>huzuruyla</u> uyudu.

### 31. TRK509340-202610 · Exam/System · YKS TYT Tam Deneme 1 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Soru doğru ama alt konusu yoktu; soru cümlesi düzeltildi ('hangileri' → 'hangisi sırasıyla'), çözüm yenilendi.

**Önce:** Çevreye zarar veren fosil yakıtların giderek azaldığı günümüzde, her ne kadar ülkemizde ---- olarak kullanılıyor olmasa da gelişmiş ülkelerde elektrik / benzin ---- ile çalışan ---- otomobil modelleri hızla artıyor. Bu cümlede boş bırakılan yerlere aşağıdakile…

  A) çokça - karışımı - farklı · B) nadiren - birleşimi - ekonomik · **C) yaygın - karışımı - karma** · D) fazla - tüketimi - pahalı · E) seyrek - sıralaması - çevreci

**Sonra:** Çevreye zarar veren fosil yakıtların giderek azaldığı günümüzde, her ne kadar ülkemizde ---- olarak kullanılmıyor olsa da gelişmiş ülkelerde elektrik / benzin ---- ile çalışan ---- otomobil modelleri hızla artıyor. ⏎ ⏎ Bu cümlede boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- A) çokça - karışımı - farklı
- B) nadiren - birleşimi - ekonomik
- **C) yaygın - karışımı - karma**
- D) fazla - tüketimi - pahalı
- E) seyrek - sıralaması - çevreci

### 32. TRK521320-202610 · Exam/System · YKS TYT Türkçe Branş 2 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: E

> Sorun: Doğru kabul edilen “aracılığıyla kullanarak” söyleyişi anlatım bozukluğu doğuruyordu; birden çok şık savunulabilirdi.

**Önce:** Aşağıdaki cümlede boş bırakılan yerlere, anlam akışını en iyi tamamlayan seçenekler sırasıyla getirilmelidir: “Nörobilim, insan zihninin işleyişini sinir hücreleri ve beyin devreleri aracılığıyla ---- inceleyen bir bilim dalı olarak kabul edilir. Son yıllarda …

  A) yoluyla - değişken · B) sayesinde - benimsenen · C) deneyerek - bilinen · D) geliştirerek - sevilen · **E) kullanarak - gelişen**

**Sonra:** Nörobilim, insan zihninin işleyişini sinir hücreleri ve beyin devreleri düzeyinde ---- inceleyen bir bilim dalıdır. Son yıllarda yapılan çalışmalarla birlikte alan, kısa sürede ---- bir araştırma sahası hâline gelmiştir. ⏎ ⏎ Bu parçada boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- A) ayrıntılı biçimde - durağan
- B) deneysel yöntemlerle - eskimiş
- C) yüzeysel olarak - genişleyen
- D) sezgisel olarak - unutulan
- **E) deneysel yöntemlerle - hızla gelişen**

### 33. TRK527024 · Exam/System · YKS TYT Mayıs 2 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: Sözcükte anlam sorusu değil; paragrafta ana düşünce sorusu.

**Önce:** Bir okulda öğrencilerin derslere olan ilgisini artırmak amacıyla yapılan etkinliklerin etkileri üzerine yapılan bir araştırmada, öğrencilerin bu tür etkinliklere katılımının öğrenme süreçlerini olumlu yönde etkilediği gözlemlenmiştir. Bu bağlamda, araştırmanın…

  A) Öğrencilerin derslere katılımı, öğrenme süreçlerini olumsuz … · B) Etkinliklere katılan öğrenciler, derslerde daha az başarı gö… · **C) Ders dışı etkinlikler, öğrencilerin öğrenme motivasyonunu ar…** · D) Öğrencilerin katıldığı etkinlikler, sadece sosyal gelişimler… · E) Okul etkinlikleri, öğrencilerin akademik başarılarını etkile…

**Sonra:** Aşağıdaki cümlelerin hangisinde terim anlamlı bir sözcük kullanılmamıştır?

- A) Bir üçgenin iç açılarının toplamı 180 derecedir.
- B) Hücre zarı, hücre ile çevresi arasındaki madde alışverişini denetler.
- **C) Akşam yemeğinden sonra parkta biraz yürüyüp eve döndük.**
- D) Romanın serim bölümünde kişiler ve olayın geçtiği yer tanıtılır.
- E) Mahkeme, davalının itirazını yerinde bulmadı.

### 34. TRK527494 · Exam/System · YKS TYT Haziran 2 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: B

> Sorun: Sözcükte anlam sorusu değil (yazım); 'altı çizili sözcük' deniyor ama çizili sözcük yok, doğru cevap savunulamıyor.

**Önce:** Aşağıdaki kısa notta bir öğrencinin yaptığı işaretlemeler verilmiştir. Notu inceleyen kişi, hangi cümledeki altı çizili sözcüğün yazımıyla ilgili bir düzeltme gerektiğini belirlemek istemektedir? I. Sınavdan sonra arkadaşına teşekkür etti. II. Bu olay, beklenm…

  A) I. cümledeki sözcük, ayrı yazılması gerektiği için düzeltilm… · **B) II. cümledeki sözcük, birleşik yazılması gerektiği için düze…** · C) III. cümledeki sözcük, büyük harfle başlaması gerektiği için… · D) IV. cümledeki sözcük, kesme işaretiyle ayrılması gerektiği i… · E) V. cümledeki sözcük, bitişik yazılması gerektiği için düzelt…

**Sonra:** Aşağıdaki cümlelerin hangisinde aynı sözcük, birbiriyle anlam ilgisi olmayan iki ayrı sözcük (eş sesli) olarak kullanılmıştır?

- A) Yaşlı adam ağır adımlarla yürürken sırtındaki ağır yükü yere indirdi.
- **B) Çocuk, yüzünü yıkadıktan sonra havuzda yüz metre yüzdü.**
- C) Kapının kolunu çevirince kolundaki saat yere düştü.
- D) Dağın eteğinde oturan kadın, eteğini toplayıp yola koyuldu.
- E) Ağzı bozuk adam, öfkeyle şişenin ağzını açtı.

### 35. TRK548685 · Exam/System · YKS TYT Haziran 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: E

> Sorun: 'Altı çizili sözler' deniyor ama çizili söz yok; şıklar birbirine çok yakın ve doğru kabul edilen E cümlelerle uyuşmuyor.

**Önce:** Aşağıdaki cümlelerde altı çizili sözlerin anlam ilişkisi dikkate alındığında, hangi seçenekteki kullanım diğerlerinden farklı bir anlam alanına yönelir? I. Bu karar, ilk günlerde çalışanların işini biraz zorlaştırdı. II. Zamanla aynı karar, süreci daha düzenli…

  A) I ve II’deki sözler, bir durumun etkisinin zaman içinde deği… · B) II ve III’teki sözler, yapılan işin yeniden değerlendirilmes… · C) I ve IV’teki sözler, dikkat ve özen gerektiren bir süreci be… · D) III ve IV’teki sözler, bir konunun ayrıntılı biçimde ele alı… · **E) I ve III’teki sözler, bir işin başlangıçta güçlük oluşturduğ…**

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcükler yakın anlamlıdır?

- A) Bu <u>uzun</u> yolu beklediğimizden <u>kısa</u> sürede aldık.
- B) <u>Kırmızı</u> elbisesinin altına <u>mavi</u> ayakkabılar giydi.
- C) Kardeşim <u>okula</u>, ben de <u>işe</u> gittim.
- D) Sabahları <u>çay</u>, akşamları <u>kahve</u> içmeyi sever.
- **E) Haberi duyunca önce <u>şaşırdı</u>, sonra bir süre <u>afalladı</u>.**

### 36. TRK557521 · Exam/System · YKS TYT Türkçe Branş Haziran 16 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; cümleler arası anlam ilişkisi sorusu.

**Önce:** Bir kent arşivinde, eski bir defterin kenarına şu not düşülüyor: "I. Yaz sonunda başlayan onarım, beklenenden uzun sürdü. II. Binanın dış cephesi, rüzgârın etkisiyle yer yer dökülmüştü. III. Çalışmalar tamamlandığında, yapı yeniden kullanılabilecek duruma geld…

  **A) İlk cümlede zaman bildirimi, ikinci cümlede neden, üçüncü cü…** · B) İlk cümlede amaç, ikinci cümlede koşul, üçüncü cümlede karşı… · C) İlk cümlede benzetme, ikinci cümlede varsayım, üçüncü cümled… · D) İlk cümlede olasılık, ikinci cümlede pekiştirme, üçüncü cüml… · E) İlk cümlede durum, ikinci cümlede örnekleme, üçüncü cümlede …

**Sonra:** Aşağıdaki cümlelerin hangisinde “ağır” sözcüğü “yavaş” anlamında kullanılmıştır?

- **A) Yaşlı adam, merdivenleri ağır adımlarla çıktı.**
- B) Taşıdığı ağır bavul kolunu ağrıtmıştı.
- C) Bu kadar ağır sözleri hiç hak etmemişti.
- D) Geçen kış ağır bir hastalık geçirdi.
- E) Odanın havası ağır bir kokuyla doluydu.

### 37. TRK574892 · Exam/System · YKS TYT Türkçe Branş Haziran 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; iki cümleden ana düşünce sorusu.

**Önce:** Aşağıdaki iki cümle birlikte değerlendirildiğinde, yazarın asıl olarak vurgulamak istediği düşünce hangisidir? ⏎ ⏎ I. İnsan, elindeki imkânları çoğaltmak için çoğu zaman çevresindeki küçük ayrıntıları fark etmeyi ihmal eder. ⏎ II. Oysa günlük yaşamda gözden ka…

  **A) Küçük ayrıntılar, insanın düşünme ve karar verme sürecinde b…** · B) İnsan, büyük hedeflere ulaşmak için çevresindeki her ayrıntı… · C) Günlük yaşamda karşılaşılan sorunların temel nedeni, çoğu za… · D) İmkânları artırmanın en etkili yolu, çevresel koşulları bütü… · E) Karar verme sürecinde duygular, ayrıntılardan daha güçlü bir…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcüğün karşıt anlamlısı da kullanılmıştır?

- **A) <u>Erken</u> kalkan çocuklar, geç yatanlardan daha dinç görünüyordu.**
- B) Bu <u>dar</u> sokakta iki araba yan yana geçemez.
- C) Yolun sonunda <u>yüksek</u> bir tepe görünüyordu.
- D) Pazardan akşam yemeği için <u>taze</u> sebze aldık.
- E) Odanın <u>loş</u> ışığı bir süre sonra gözlerimi yordu.

### 38. TRK580915-202610 · Exam/System · YKS TYT Tam Deneme 4 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: B

> Sorun: Kök 'altı çizili söz' soruyor ama parçada çizili söz yok; parça bir metni özetliyor, sorulacak söz hiç verilmemiş.

**Önce:** Bir metinde, bir kişinin yaşadığı duyguyu paylaşmakla kalmayıp onun dünyasını kendi sınırlarının dışından görmeye çalıştığı anlatılıyor. Metinde ayrıca, başkasının sevinci ya da sıkıntısı karşısında kişinin kendi iç çerçevesinden çıkabildiği vurgulanıyor. Bu p…

  A) Başkalarının duygularını yüzeysel biçimde fark etmek · **B) Kendi sınırlarının dışındaki hayatları anlamaya çalışmak** · C) Farklı düşüncelere karşı mesafeli ve temkinli durmak · D) Kendisi dışındaki insanları örnek alarak onlara benzemek · E) Çevresindeki olaylara karşı ilgisini giderek azaltmak

**Sonra:** Empati, yalnızca başkasının duygusunu paylaşmak değildir. Empati kuran kişi, karşısındakinin sevincini ya da sıkıntısını anlayabilmek için <u>kendi kabuğundan çıkar</u> ve dünyaya bir süreliğine onun gözüyle bakar. Bu yüzden empati, insan ilişkilerini derinleştiren bir beceri olarak görülür. ⏎ ⏎ Bu parçadaki altı çizili sözle anlatılmak istenen aşağıdakilerden hangisidir?

- A) Başkalarının duygularını yüzeysel biçimde fark etmek
- **B) Kendi bakış açısının dışına çıkarak başkasını anlamaya çalışmak**
- C) Farklı düşüncelere karşı mesafeli ve temkinli durmak
- D) Kendisi dışındaki insanları örnek alarak onlara benzemek
- E) Çevresindeki olaylara karşı ilgisini giderek azaltmak

### 39. TRK598355 · Exam/System · YKS TYT Türkçe Branş Haziran 34 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; iki okurun yaklaşımından yargı çıkarma sorusu.

**Önce:** Bir kütüphane çalışanı, aynı gün içinde gelen iki okurdan birine “okuması kolay ama yüzeysel” bir kitap, diğerine ise “ilk bakışta zor görünse de üzerinde durdukça açılan” bir kitap önerir. İlk okur kısa sürede sonuca ulaşmak isterken ikinci okur, metnin ayrın…

  **A) Sözcüklerin etkisi, onları kullanan kişinin amacına ve bağla…** · B) Bir metnin değeri, yalnızca içindeki bilgi miktarıyla ölçülm… · C) Aynı kelime, her durumda tek ve değişmez bir çağrışım oluştu… · D) Okuma sürecinde hız, anlamı derinleştirmekten daha belirleyi… · E) Zor görünen metinler, okur için her zaman gereksiz bir engel…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük nitel (özellik bildiren) anlamdadır?

- **A) Bahçenin köşesinde <u>yaşlı</u> bir köpek uyuyordu.**
- B) Sınıfa <u>yirmi</u> yeni sıra getirildi.
- C) Bu yıl şehrimize <u>az</u> yağmur yağdı.
- D) Rafta <u>birkaç</u> eski kitap kalmıştı.
- E) Toplantıya <u>yarım</u> saat geç kaldı.

### 40. TRK606447 · Exam/System · YKS TYT Türkçe Branş Temmuz 34 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; sayısal veri özetleme sorusu.

**Önce:** Bir çevrim içi kitap satış sitesinin günlük notunda şu veriler yer alıyor: I. Pazartesi günü 120 kitap satıldı. II. Salı günü satış 180’e çıktı. III. Çarşamba günü ise 150 kitapta kaldı. Bu notu okuyan biri, satışların günlere göre değişimini tek bir kısa ifad…

  **A) Satışlar, pazartesiden salıya yükselmiş, çarşamba günü ise b…** · B) Satışlar, pazartesiden çarşambaya her gün düzenli biçimde ar… · C) Satışlar, salı günü düşmüş, çarşamba günü yeniden aynı düzey… · D) Satışlar, üç gün boyunca değişmeden aynı sayıda gerçekleşmiş… · E) Satışlar, pazartesi ve çarşamba günleri eşit, salı günü daha…

**Sonra:** Kitabın ilk sayfalarında yazarın anlatımı bana biraz <u>yavan</u> geldi; ama ilerleyen bölümlerde olaylar hızlandıkça anlatım da canlandı. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamı aşağıdakilerden hangisidir?

- **A) Tatsız tuzsuz, sıradan**
- B) Karmaşık, anlaşılması güç
- C) Abartılı, gösterişli
- D) Kaba, özensiz
- E) Hüzünlü, karamsar

### 41. TRK617130-202610 · Exam/System · YKS TYT Tam Deneme 3 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Boşluklu cümle hiç verilmemişti; ilgisiz bir diyagrama ({{fig:diag1}}) atıf vardı ve doğru kabul edilen “sıralaması” sözü anlamsızdı.

**Önce:** Aşağıdaki diyagramda, çevreye zarar veren fosil yakıtların kullanımındaki değişim ve buna bağlı olarak elektrik ile benzinle çalışan otomobil modellerinin artışı gösterilmektedir. Cümlede boş bırakılan yerlere, anlam akışını en uygun biçimde tamamlayan seçenek…

  A) çokça - karışımı - farklı · B) nadir - birleşimi - ekonomik · **C) yaygın - sıralaması - karma** · D) fazla - yakıtı - pahalı · E) seyrek - tüketimi - çevreci

**Sonra:** Kentte açılan yeni kütüphane, kısa sürede gençlerin ---- uğrak yeri hâline geldi; özellikle sınav dönemlerinde okuma salonlarında boş bir masa bulmak neredeyse ----. ⏎ ⏎ Bu cümlede boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- A) nadir - kolaylaştı
- B) gözde - mümkündü
- **C) vazgeçilmez - olanaksızdı**
- D) unutulmuş - zordu
- E) sıradan - kolaydı

### 42. TRK620419-202610 · Exam/System · YKS TYT Tam Deneme 2 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Soru doğru ama alt konusu yoktu; çözüm yenilendi. (Tırnak, bağlamsız sözcük adı için kullanıldığından yerindedir.)

**Önce:** “Kaldırmak” sözcüğü aşağıdaki cümlelerin hangisinde, bir şeyi bulunduğu yerden yukarıya doğru hareket ettirme anlamıyla kullanılmıştır?

  A) Kirlenen örtüyü masanın üzerinden kaldırdı. · B) Annesi ve kardeşi ile beraber sofrayı kaldırdılar. · **C) Gözlerini yüzüme kaldırdı ve dikkatlice bana baktı.** · D) Yarasının dikişleri açılan dayımı hastaneye kaldırdık. · E) Annem bu sabah herkesi erkenden kaldırdı.

**Sonra:** “Kaldırmak” sözcüğü aşağıdaki cümlelerin hangisinde “bir şeyi bulunduğu yerden yukarıya doğru hareket ettirmek” anlamıyla kullanılmıştır?

- A) Kirlenen örtüyü masanın üzerinden kaldırdı.
- B) Annesi ve kardeşiyle birlikte sofrayı kaldırdılar.
- **C) Gözlerini yüzüme kaldırdı ve dikkatlice bana baktı.**
- D) Yarasının dikişleri açılan dayımı hastaneye kaldırdık.
- E) Annem bu sabah herkesi erkenden kaldırdı.

### 43. TRK639651-202610 · Exam/System · YKS TYT Türkçe Branş 3 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Kök 'parantez içinde verilen anlamlar' diyor ama hiçbir anlam verilmemiş; çizili sözcükler __…__ ile yazılmış, soru çözülemiyordu.

**Önce:** Aşağıdaki cümlede altı çizili sözcüklerin, parantez içinde verilen anlamları karşılayacak biçimde kullanıldığı seçenek hangisidir? ⏎ ⏎ “Uyandığımız an, günün dörtte birini __arkada__ bırakmışızdır; yeni güne __başlamak__ için önce zihnimizi toparlarız ve ertel…

  **A) Sabahın ilk ışıklarıyla birlikte bahçedeki kuşlar ötmeye baş…** · B) Geçen yaz arkasında bıraktığı eşyaları topladı, işe başlamak… · C) Zamanın geride kalan kısmını düşünmeden güne başladı, çevres… · D) Gece boyunca arkasını kolladı, işine başlamak için acele ett… · E) Öğleden sonra geride kalan saatleri saydı, bir konuşmaya baş…

**Sonra:** Uyandığımız an günün dörtte birini <u>geride</u> bırakmış oluruz. Güne <u>başlamak</u> için önce zihnimizi <u>toparlarız</u>; ama dünden kalan sıkıntılar da yine <u>kapımızı</u> çalar ve omuzlarımıza <u>yük</u> olur. ⏎ ⏎ Bu parçadaki altı çizili sözcüklerden hangisi gerçek anlamıyla kullanılmıştır?

- **A) başlamak**
- B) geride
- C) toparlarız
- D) kapımızı
- E) yük

### 44. TRK652494-202610 · Exam/System · YKS TYT Tam Deneme 4 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: C

> Sorun: 'Altı çizili söz' çizili değildi; “yalınkat” ayrı yazılmıştı; soru cümlesi iki kez yazılmıştı.

**Önce:** Aşağıdaki cümlede altı çizili sözün anlamını en iyi karşılayan kullanım hangisidir? "Benim bu konudaki bilgilerim oldukça yalın kat; bir uzmanın sahip olduğu bilgi ve görgü derinliğinden oldukça uzak." Bu cümledeki altı çizili sözle benzer anlam taşıyan ifade,…

  A) Kendisine yöneltilen eleştirilere sakin ve ölçülü bir tutuml… · B) Resmî toplantıya sade bir kıyafetle katılıp dikkat çekmemeyi… · **C) Onun yazıları, yüzeysel ve üstünkörü hazırlanmış metinler ol…** · D) Odanın duvarlarını kaplayan canlı renkler, gözleri rahatsız … · E) Konuşmasındaki düşünsel derinlik, dinleyenlerin üzerinde güç…

**Sonra:** Benim bu konudaki bilgilerim oldukça <u>yalınkat</u>; bir uzmanın sahip olduğu bilgi ve görgü derinliğinden çok uzak. ⏎ ⏎ Bu cümledeki altı çizili sözü anlamca karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- A) Kendisine yöneltilen eleştirilere sakin ve ölçülü bir tutumla karşılık verdi.
- B) Resmî toplantıya sade bir kıyafetle katılıp dikkat çekmemeyi tercih etti.
- **C) Onun yazıları, yüzeysel ve üstünkörü hazırlanmış metinler olarak değerlendiriliyordu.**
- D) Odanın duvarlarını kaplayan canlı renkler, gözleri rahatsız edecek kadar parlaktı.
- E) Konuşmasındaki düşünsel derinlik, dinleyenlerin üzerinde güçlü bir etki bıraktı.

### 45. TRK662450 · Exam/System · YKS TYT Türkçe Branş Haziran 52 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: D

> Sorun: Soru anlamsızdı: beş cümlede aynı sözcük __…__ ile işaretlenmiş, hangisinin 'en uygun' olduğu ölçütsüz; tek doğrusu savunulamıyor.

**Önce:** Aşağıdaki kısa notta, bir metin düzenleme çalışmasında seçilen sözcüklerin altı çizilmiştir. Numaralanmış cümlelerden hangisinde altı çizili sözcük, cümlede anlatılmak istenen anlamı en uygun biçimde karşılamaktadır? I. Dosyaların bir kısmı, sabah saatlerinde …

  A) Yalnız I. · B) Yalnız II. · C) Yalnız III. · **D) Yalnız IV.** · E) Yalnız V.

**Sonra:** Aşağıdaki cümlelerin hangisinde “açık” sözcüğü “anlaşılır, belirgin” anlamında kullanılmıştır?

- A) Pencereyi açık bırakınca oda kısa sürede soğudu.
- B) Bu ay aile bütçemizde epey açık var.
- C) Düğün için açık mavi bir gömlek aldı.
- **D) Öğretmen, konuyu herkesin anlayacağı açık bir dille anlattı.**
- E) Mahalledeki fırın pazar günleri de açık.

### 46. TRK684875-202610 · Exam/System · YKS TYT Türkçe Branş 2 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: B

> Sorun: Hedef söz çizili değil, tırnakla verilmiş ve parçadaki biçimiyle uyuşmuyordu.

**Önce:** Yazarın öyküleri ve denemeleri bir cümleyle ya da kısa bir öykücükle başlar, sonra yavaş yavaş genişler. Kişileri yazma süreci içinde ortaya çıkar ve biçimlenir. Onun metinlerine asıl yönünü veren şey, yazma eyleminin kendisidir. Yazar, kahramanlarının ne söyl…

  A) Kahramanların davranışlarını baştan sona denetlemek · **B) Kişileri, kendi yapısına uygun biçimde yansıtmak** · C) Roman kişilerini belirli bir plana göre sıralamak · D) Karakterlerin özelliklerini döneme göre değiştirmek · E) Kahramanların eylemlerini yönlendirmeyi sürdürmek

**Sonra:** Yazarın öyküleri ve denemeleri bir cümleyle ya da kısa bir öykücükle başlar, sonra yavaş yavaş genişler. Kişileri yazma süreci içinde ortaya çıkar ve biçimlenir. Onun metinlerine asıl yönünü veren şey, yazma eyleminin kendisidir. Yazar, kahramanlarının ne söyleyip ne hissettiğini yazarken elinde kalemle <u>onların izini sürdüğünü</u> de belirtmiştir. ⏎ ⏎ Bu parçadaki altı çizili sözle anlatılmak istenen aşağıdakilerden hangisidir?

- A) Kahramanların davranışlarını baştan sona denetlemek
- **B) Kişileri, kendi yapılarına uygun biçimde yansıtmak**
- C) Roman kişilerini belirli bir plana göre sıralamak
- D) Karakterlerin özelliklerini döneme göre değiştirmek
- E) Kahramanların eylemlerini yönlendirmeyi sürdürmek

### 47. TRK699781-202610 · Exam/System · YKS TYT Türkçe Branş 3 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: B

> Sorun: Kök 'altı çizili söz' diyor ama çizili söz yoktu.

**Önce:** Yazı üzerine düşünen, üstelik bunu çalışma alanı hâline getiren bir yazar için yazı ile yaşamak arasındaki gerilim, ilk kitaplarından başlayarak metinlerinde belirgin bir çizgi olarak ortaya çıkmıştır. Bu cümlede altı çizili sözün anlamını en iyi karşılayan ku…

  A) Yazarın son romanı, çocukluk yıllarından başlayıp bugüne uza… · **B) İncelediğimiz bütün eserlerde sanatçının asıl yönelişinin ya…** · C) Dönem metinlerinin çoğunda kullanılan dil, hedeflenen okur k… · D) Diyalogların yoğun olduğu bu yapıtın modernist çizgide olduğ… · E) İlk öykülerinden başlayarak yazarın kronolojik bir sıra izle…

**Sonra:** Yazı üzerine düşünen, üstelik bunu çalışma alanı hâline getiren bir yazar için yazı ile yaşamak arasındaki gerilim, ilk kitaplarından başlayarak metinlerinde belirgin bir <u>çizgi</u> olarak ortaya çıkmıştır. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamını en iyi karşılayan kullanım aşağıdakilerin hangisindedir?

- A) Yazarın son romanı, çocukluk yıllarından başlayıp bugüne uzanan yaşam öyküsünü ayrıntılı biçimde izliyor.
- **B) İncelediğimiz bütün eserlerde sanatçının asıl yönelişinin, yalnızlaşan insanın iç dünyasına girmek olduğu görülüyor.**
- C) Dönem metinlerinin çoğunda kullanılan dil, hedeflenen okur kitlesi hakkında ipucu veriyor.
- D) Diyalogların yoğun olduğu bu yapıtta zaman zaman bilinç akışı tekniğine başvurulmuş.
- E) İlk öykülerinden başlayarak yazarın kronolojik bir sıra izleyip ülkenin tarihsel sürecine ulaştığını görebiliyoruz.

### 48. TRK704113-202610 · Exam/System · YKS TYT Tam Deneme 4 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: Kök ilgisiz figürlere ({{fig:tbl1}}, {{fig:chart1}}) atıf yapıyordu; 'altı çizili sözcük' diyor ama çizili sözcük yoktu.

**Önce:** {{fig:tbl1}} ve {{fig:chart1}} incelendiğinde, bir metinde bir sanatçının başka bir sanatçıdan etkilenmesinin doğal görülebileceği; ancak bunun, ortaya çıkan ürünün özünü zedeleyen bir boyuta ulaştığında hoş karşılanmadığı anlaşılmaktadır. Buna göre, altı çizi…

  **A) Gençlerin, kişiliklerini kurarken hayran oldukları birini ör…** · B) Okuma alışkanlıklarındaki benzerlik, iki kişinin aynı kitapl… · C) Dizilerdeki yapay karakterler, gerçek yaşamı yorumlama biçim… · D) Bir futbolcunun teknik gelişimi, antrenörünün yönergelerine … · E) Tarihsel olayları açıklarken kullanılan döngüsel tarih anlay…

**Sonra:** Bir sanatçının başka bir sanatçıdan <u>etkilenmesi</u> doğal karşılanabilir; ancak bu durum, ortaya çıkan ürünün özünü zedeleyen bir boyuta ulaştığında hoş görülmez. ⏎ ⏎ Bu cümledeki altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- **A) Gençlerin, kişiliklerini kurarken hayran oldukları birini örnek alma eğilimi göstermesi sık rastlanan bir durumdur.**
- B) Okuma alışkanlıklarındaki benzerlik, iki kişinin aynı kitaplardan aynı sonuçları çıkardığı anlamına gelmez.
- C) Dizilerdeki yapay karakterler, gerçek yaşamı yorumlama biçimleriyle izleyiciler üzerinde kalıcı iz bırakır.
- D) Bir futbolcunun teknik gelişimi, antrenörünün yönergelerine eksiksiz uymasıyla hızlanır.
- E) Tarihsel olayları açıklarken kullanılan döngüsel tarih anlayışı, günümüzde eskisi kadar benimsenmiyor.

### 49. TRK780408 · Exam/System · YKS TYT Temmuz 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Soru anlamsızdı: sözü edilen sözcük ve cümleler hiç verilmemişti; yalnızca notlardan yorum isteniyordu.

**Önce:** Aşağıdaki kısa notlarda, bir kelimenin farklı cümlelerde kazandığı anlamlar inceleniyor: ⏎ I. Bu sözcük, metinde “dar bir alan” anlamında kullanılmıştır. ⏎ II. Aynı sözcük, başka bir cümlede “sınırlı bir süre” anlamı taşımaktadır. ⏎ III. Üçüncü cümlede ise söz…

  A) Sözcük, her kullanımda aynı temel anlamı koruyarak yalnızca … · **B) Sözcük, bağlama göre farklı anlamlar üstlenmiş ve anlam geni…** · C) Sözcük, yalnızca mecaz anlamda kullanılmış; gerçek anlamla i… · D) Sözcük, terim anlamı kazanmış ve teknik bir alana özgüleşmiş… · E) Sözcük, ses benzerliği nedeniyle başka bir sözcükle karıştır…

**Sonra:** Aşağıdaki cümlelerin hangisinde “dar” sözcüğü “sınırlı, kısıtlı” anlamında kullanılmıştır?

- A) Bu dar sokaktan iki araç aynı anda geçemez.
- **B) Dar bir bütçeyle bütün ay idare etmek zorunda kaldık.**
- C) Ayakkabılar dar gelince yürürken ayaklarım acıdı.
- D) Kardeşim, kendisine dar gelen ceketi bana verdi.
- E) Koşa koşa gidip son treni dar yetiştirdik.

### 50. TRK789024 · Exam/System · YKS TYT Temmuz 4 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; bir uygulamanın arkasındaki düşünceyi soran paragraf sorusu.

**Önce:** Bir kütüphane, raf düzenini yenilerken aynı kökten türeyen sözcükleri ve yakın anlamlıları ayrı bölümlere ayırmak yerine, okurun bağlam içinde anlam kurmasını kolaylaştıracak biçimde yan yana yerleştirmeyi tercih ediyor. Bu uygulamanın arkasındaki temel düşünc…

  **A) Sözcüklerin anlamı, kullanıldıkları cümle ve çevreyle birlik…** · B) Sözcüklerin değeri, yalnızca sözlükteki ilk karşılıklarıyla … · C) Anlam karışıklığını önlemek için her sözcük tek bir alanda t… · D) Dil, kurallardan çok ses benzerlikleriyle düzenlenen bir yap… · E) Bir metinde önemli olan, sözcüklerin köken bakımından aynı a…

**Sonra:** Aşağıdaki cümlelerin hangisinde sözcükler genelden özele doğru sıralanmıştır?

- **A) Fuarda taşıtlar, otomobiller ve en çok da elektrikli otomobiller ilgi gördü.**
- B) Pazardan elma, armut ve ayva aldık.
- C) Kardeşim önce kediyi, sonra köpeği, en son da kuşu besledi.
- D) Sınıfta kalem, defter ve silgi eksikti.
- E) Akşam yemeğinde çorba, pilav ve salata vardı.

### 51. TRK794672 · Exam/System · YKS TYT Temmuz 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragraftan yargı çıkarma sorusu.

**Önce:** Bir kargo dağıtım merkezinde çalışan görevli, aynı gün içinde gelen şikâyetleri incelerken şunu fark ediyor: Bazı müşteriler, paketlerinin geç ulaşmasından çok, kendilerine önceden bilgi verilmemesinden rahatsız oluyor. Bu nedenle ekip, yalnızca teslimat süres…

  **A) Sorunların çözümünde hız kadar iletişim düzeni de belirleyic…** · B) Müşteriler için en önemli ölçüt, yalnızca teslimatın mümkün … · C) Şikâyetlerin temel nedeni, dağıtım merkezindeki personel say… · D) Bilgilendirme yapılmasa da hizmet kalitesi, sonuç olumluysa … · E) Dağıtım süreçlerinde yaşanan her aksaklık, mutlaka teknik bi…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük yan anlamıyla kullanılmıştır?

- **A) Şişenin <u>ağzı</u> sıkıca kapatılmıştı.**
- B) Çocuk çikolatayı bir anda <u>ağzına</u> attı.
- C) Yemekten sonra <u>dişlerini</u> özenle fırçaladı.
- D) Soğuktan çocukların <u>kulakları</u> kızarmıştı.
- E) Koşarken düşüp <u>dizini</u> sıyırdı.

### 52. TRK800961-202610 · Exam/System · YKS TYT Paragraf Branş 11 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Cümlede tek boşluk varken şıklarda iki sözcük veriliyordu; soru çözülemiyordu.

**Önce:** Aşağıdaki cümlede boş bırakılan yerlere, anlam akışını en iyi tamamlayan sözcükler sırasıyla getirilmelidir: "Bir roman, yalnızca olay örgüsüyle değil, her ayrıntısının bütüne kattığı ____ ile de değerlendirilir; bu yüzden parçalar arasındaki ilişkiler dikkatl…

  A) tek yönlü - konu · B) karmaşık - sorun · **C) çok yönlü - değer** · D) çok boyutlu - kaynak · E) yaratıcı - anlam

**Sonra:** Bir roman yalnızca olay örgüsüyle değil, her ayrıntının bütüne kattığı ---- ile de ölçülür; bu yüzden ---- bir okuma, parçalar arasındaki ilişkileri gözden kaçırabilir. ⏎ ⏎ Bu cümlede boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- A) sorun - dikkatli
- B) kaynak - ayrıntılı
- **C) değer - aceleci**
- D) konu - özenli
- E) anlam - derinlikli

### 53. TRK822111 · Exam/System · YKS TYT Türkçe Branş Haziran 16 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; metnin asıl vurgusunu soran paragraf sorusu.

**Önce:** I. Kentteki eski sinema binası, uzun süredir kullanılmadığı için giderek yıpranmıştı. II. Bu yapının onarılması, yalnızca dış görünüşünü değil, çevredeki kültürel hareketliliği de canlandıracaktı. III. Ancak bazı kişiler, böyle bir girişimin bütçeye yük olacağ…

  **A) Tarihi yapıların korunması, kent yaşamına kültürel ve toplum…** · B) Eski binaların onarımı, yalnızca estetik görünüm açısından ö… · C) Kültürel yatırımlar, bütçe planlamasında her zaman ikinci pl… · D) Kentlerdeki yıpranmış yapılar, çoğu zaman ekonomik sorunları… · E) Bir yapının yenilenmesi, çevredeki ulaşım düzenini doğrudan …

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük gerçek anlamıyla kullanılmamıştır?

- **A) Bu <u>tatlı</u> çocuk kısa sürede herkesin sevgisini kazandı.**
- B) Fırından çıkan <u>sıcak</u> ekmeğin kokusu bütün sokağı sardı.
- C) Kışın göl yüzeyi <u>kalın</u> bir buz tabakasıyla kaplanır.
- D) Mutfakta salata için <u>acı</u> biberleri ayıkladık.
- E) Dağdan inen <u>soğuk</u> rüzgâr yüzümüzü yaktı.

### 54. TRK830675 · Exam/System · YKS TYT Haziran 3 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; iki cümleden ana düşünce sorusu.

**Önce:** Aşağıdaki iki cümle birlikte değerlendirildiğinde, yazarın asıl vurgusunun hangi seçenekte toplandığı söylenebilir? I. Bir metinde sözcüklerin sözlük anlamı kadar, cümle içinde kazandığı çağrışım da anlatımı belirler. II. Bu yüzden aynı sözcük, farklı bağlamla…

  A) Sözcüklerin etkisi, yalnızca sözlükte verilen anlamlarıyla s… · **B) Bağlam değiştikçe sözcüklerin etkisi de değişir ve anlatım b…** · C) Metinde önemli olan, sözcüklerin sayıca fazla kullanılmasıdı… · D) Anlatım gücü, yalnızca uzun ve süslü cümlelerle sağlanır. · E) Okuyucu, sözcükleri her zaman aynı biçimde yorumlamak zorund…

**Sonra:** Aşağıdaki cümlelerin hangisinde mecaz anlamlı bir sözcük kullanılmıştır?

- A) Kış gelince sobayı yakıp odayı ısıttık.
- **B) Annesinin söyledikleri onu derinden yaraladı.**
- C) Bahçedeki ağaçların yaprakları sararmaya başladı.
- D) Sabah erkenden kalkıp ilk otobüse bindik.
- E) Kitabı okuyup kütüphaneye geri götürdüm.

### 55. TRK831738 · Exam/System · YKS TYT Türkçe Branş Haziran 19 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Soru anlamsızdı: 'altı çizili sözcük' sorulan not hiç verilmemişti; III. madde soru cümlesiydi.

**Önce:** I. Bir sözcük, günlük konuşmada dar bir anlamla kullanılırken metin içinde daha geniş bir çağrışım kazanabilir. II. Bu yüzden, bir cümledeki anlamı belirlerken yalnızca sözlük karşılığına bakmak yeterli olmaz. III. Aşağıdaki kısa notta altı çizili sözcüğün han…

  A) Sınıfın penceresinden içeri giren ışık, sıraların üstünde yu… · **B) Toplantıda ortaya atılan düşünce, kısa sürede herkesin ilgis…** · C) Bahçedeki ağaçlar, rüzgârın etkisiyle bütün gün aynı yönde e… · D) Kütüphaneden aldığı kitap, beklediğinden daha kısa sürede el… · E) Yağmur başlayınca herkes, kapının önünde bir süre sessizce b…

**Sonra:** Aşağıdaki cümlelerin hangisinde “çekmek” sözcüğü “ilgiyi, dikkati kendine yöneltmek” anlamında kullanılmıştır?

- A) Yaşlı kadın kuyudan kovayla su çekti.
- **B) Toplantıda ortaya atılan düşünce kısa sürede herkesin ilgisini çekti.**
- C) Çocukluğunda yokluk yüzünden çok sıkıntı çekmişti.
- D) Kardeşime toplantının saatini bildiren bir ileti çektim.
- E) Yeni aldığı pamuklu tişört ilk yıkamada biraz çekti.

### 56. TRK832890 · Exam/System · YKS TYT Türkçe Branş Haziran 52 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragrafta ana düşünce sorusu.

**Önce:** Bir dağ köyünde yaşayan yaşlı kadın, her sabah kapısının önündeki taşları tek tek temizler; çünkü rüzgârın taşıdığı toz, yalnızca yolu değil, evlerin içini de kısa sürede kaplar. Bu davranış, onun için küçük bir uğraş gibi görünse de aslında günün geri kalanın…

  **A) Küçük ve düzenli önlemler, sonradan ortaya çıkabilecek büyük…** · B) Doğal koşullar, kırsal yaşamda insanların günlük alışkanlıkl… · C) Yaşlı insanların alışkanlıkları, gençlere göre daha titiz ve… · D) Temizlik, insanın çevresine karşı duyarlılığını gösteren en … · E) Zor koşullarda yaşayan kişiler, zamanlarını çoğunlukla ev iş…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcüklerin ikisi de soyut anlamlıdır?

- **A) <u>Sevgi</u> ile <u>umut</u>, insanı zor günlerde ayakta tutar.**
- B) <u>Kalemini</u> ve <u>defterini</u> çantasına yerleştirdi.
- C) <u>Rüzgâr</u> sertleşince içindeki <u>korku</u> büyüdü.
- D) Masadaki <u>çiçeğin</u> <u>kokusu</u> bütün odaya yayıldı.
- E) Pazardan aldığı <u>elmaları</u> <u>sepete</u> koydu.

### 57. TRK855271-202610 · Exam/System · YKS TYT Tam Deneme 1 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: Atasözü sorusuydu (Deyim-Atasözü konusu); deneme slotu Sözcükte Anlam için ayrıldığından bu konuya uygun yeni soru yazıldı.

**Önce:** Bir kişi genelde olayların kötü yönüne odaklanıyorsa, zaman içinde çevresindeki küçük olumsuzlukları daha çabuk fark etmeye başlıyor. Üstelik bir iş beklenmedik biçimde kötüye gittiğinde, bunun artık toparlanamayacağını da kolayca kabulleniyor. Böyle bir tutum…

  A) Balık baştan kokar. · B) Kara haber tez duyulur. · **C) Battı balık yan gider.** · D) Dağ başından duman eksik olmaz. · E) Akacak kan damarda durmaz.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük “umutsuz, karamsar” anlamında kullanılmıştır?

- A) Odanın <u>karanlık</u> köşesinde eski bir sandık duruyordu.
- B) <u>Kara</u> bulutlar yağmurun yaklaştığını haber veriyordu.
- **C) Her olayın kötü yanını gören bu <u>kara</u> bakışla hiçbir sorunu çözemezsin.**
- D) Fırtına çıkınca balıkçı tekneleri hemen <u>karaya</u> yanaştı.
- E) Çocuk, yanağındaki <u>kara</u> lekeyi silmeye çalıştı.

### 58. TRK856753-202610 · Exam/System · YKS TYT Türkçe Branş 1 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: C

> Sorun: 'Altı çizili söz' çizili değildi; “yalınkat” ayrı yazılmıştı.

**Önce:** Benim bu konudaki bilgilerim oldukça yalın kat; bir uzmanın sahip olduğu bilgi ve görgü derinliğinden epey uzak. Bu cümlede altı çizili sözü, anlamca en iyi karşılayan kullanım aşağıdakilerin hangisinde verilmiştir?

  A) Kendisine yöneltilen sert eleştirilere sakin ve ölçülü bir t… · B) Toplantıya sade bir kıyafetle gelerek gösterişten özellikle … · **C) Onun kısa yazıları, yüzeyde kalan ve ayrıntıya inmeyen notla…** · D) Odanın süslemeleri, dikkati dağıtacak kadar abartılı ve göz … · E) Konuşmasındaki derinlik, dinleyenlerin konuya ilgisini artır…

**Sonra:** Benim bu konudaki bilgilerim oldukça <u>yalınkat</u>; bir uzmanın sahip olduğu bilgi ve görgü derinliğinden epey uzak. ⏎ ⏎ Bu cümledeki altı çizili sözü anlamca en iyi karşılayan kullanım aşağıdakilerin hangisindedir?

- A) Kendisine yöneltilen sert eleştirilere sakin ve ölçülü bir tavırla karşılık verdi.
- B) Toplantıya sade bir kıyafetle gelerek gösterişten özellikle kaçındığını belli etti.
- **C) Onun kısa yazıları, yüzeyde kalan ve ayrıntıya inmeyen notlar olarak değerlendiriliyordu.**
- D) Odanın süslemeleri, dikkati dağıtacak kadar abartılı ve göz alıcıydı.
- E) Konuşmasındaki derinlik, dinleyenlerin konuya ilgisini artıracak güçteydi.

### 59. TRK863766 · Exam/System · YKS Türkçe Branş Mayıs 1 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; yazarın kelime seçimi üzerine genel, şıkları bariz bir yorum sorusu.

**Önce:** Bir metinde yazar, duygu ve düşüncelerini ifade etmek için kullandığı kelimelerin anlamını, okuyucuya doğru bir şekilde iletebilmek amacıyla dikkatli bir şekilde seçmelidir. Aşağıdakilerden hangisi, yazarın bu amaç doğrultusunda kelime seçimindeki dikkatinin b…

  **A) Yazar, kelimeleri kullanırken hedef kitlesinin anlayacağı te…** · B) Yazar, metin boyunca her kelimeyi eşit derecede önemsemeden … · C) Yazar, kelime seçiminde tamamen rastgele bir yaklaşım benims… · D) Yazar, metinde kullanılan kelimelerin anlamlarını açıklamakt… · E) Yazar, kullandığı kelimelerin duygusal etkisini göz ardı ede…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük terim anlamıyla kullanılmamıştır?

- **A) Aramızdaki anlaşmazlığın <u>çözümü</u> için hepimiz kafa yorduk.**
- B) Bu denklemin <u>kökleri</u> toplamı beştir.
- C) Hakem, rakibini çelen oyuncu için <u>faul</u> kararı verdi.
- D) Şiirin ikinci dörtlüğünde <u>kafiye</u> düzeni değişiyor.
- E) Mahkeme, sanığın <u>tutukluluk</u> hâlinin sürmesine karar verdi.

### 60. TRK868839-202610 · Exam/System · YKS TYT Türkçe Branş 2 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: E

> Sorun: Hedef söz çizili değil, tırnakla verilmişti; C şıkkındaki deyim bozuk yazılmıştı (“Alt yanı çıkmaz sokak”).

**Önce:** Bazı sanatçılar, bütün hayatları boyunca didinip uğraşsa da kalburla su taşımaktan öteye gidemezler. Bu cümledeki “kalburla su taşımak” sözüyle anlatılmak istenen anlamı aşağıdakilerden hangisi karşılamaz?

  A) Havanda su dövmek · B) Akıntıya kürek çekmek · C) Alt yanı çıkmaz sokak · D) Abesle iştigal etmek · **E) Bin dereden su getirmek**

**Sonra:** Bazı sanatçılar bütün hayatları boyunca didinip uğraşsalar da <u>kalburla su taşımaktan</u> öteye gidemezler. ⏎ ⏎ Bu cümledeki altı çizili sözün anlamını aşağıdakilerden hangisi karşılamaz?

- A) Havanda su dövmek
- B) Akıntıya kürek çekmek
- C) Çıkmaz sokağa girmek
- D) Abesle iştigal etmek
- **E) Bin dereden su getirmek**

### 61. TRK870996 · Exam/System · YKS TYT Türkçe Branş Temmuz 70 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: B

> Sorun: Sözcükte anlam sorusu değil; paragrafta anlatılmak isteneni soran soru.

**Önce:** Bir kargo firmasında çalışan görevli, aynı gün içinde farklı adreslere gidecek paketleri ayırırken yalnızca etiketlerde yazan kodlara bakar; çünkü kısa bir gecikme, tüm dağıtım planını aksatabilir. Bu nedenle o, her paketi tek tek incelemek yerine, kodların ha…

  A) Aynı işi yaparken ayrıntılara takılmak, sürecin düzenini kor… · **B) Bir işte asıl belirleyici olan, elindeki işaretleri doğru yo…** · C) Planlı çalışmanın en önemli yönü, her aşamayı baştan sona ay… · D) Yoğun işlerde başarı, yalnızca dikkatli olmakla değil, aynı … · E) Günlük işlerde en güvenli yöntem, karar vermeden önce tüm ol…

**Sonra:** Aşağıdaki cümlelerin hangisinde eş anlamlı sözcükler bir arada kullanılmıştır?

- A) Uzun yolun sonunda kısa bir mola verdik.
- **B) Bu yanıtla, aslında sorduğum soruya çok güzel bir cevap verdin.**
- C) Akşamları çay, sabahları kahve içmeyi sever.
- D) Büyük evlerinden küçük bir daireye taşındılar.
- E) Kardeşim kitap okurken ben de dergimi okudum.

### 62. TRK875456-202610 · Exam/System · YKS TYT Paragraf Branş 11 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kök 'boş bırakılan yerlere' diyor ama metinde boşluk yoktu; soru çözülemiyordu.

**Önce:** Bir eleştirmen, romanın toplum hayatındaki aksaklıkları görünür kılmasını önemseyen bazı yazarlarla konuşur. Bu yazarlar, romanın toplumsal sorunlara karşı etkili bir yön taşımasını savunurken; diğerleri, romanın bir ders kitabı gibi davranamayacağını, asıl de…

  **A) topluma yol göstermesini - estetik değerinin** · B) gerçeği olduğu gibi vermesini - öğretici yönünün · C) gelenekleri aktarmasını - anlatım düzeninin · D) duyguları büyütmesini - düşünsel tutarlılığın · E) olayları hızla sıralamasını - tarihsel doğruluğun

**Sonra:** Teknoloji, yaşamı kolaylaştırdığı ölçüde insanları birbirinden ----; ekran başında geçen saatler arttıkça yüz yüze ilişkiler de ----. ⏎ ⏎ Bu cümlede boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?

- **A) uzaklaştırıyor - zayıflıyor**
- B) yakınlaştırıyor - güçleniyor
- C) koparıyor - güçleniyor
- D) ayırıyor - derinleşiyor
- E) soğutuyor - çoğalıyor

### 63. TRK892799-202610 · Exam/System · YKS TYT Türkçe Branş 2 — Ekim 2026 Kitapçık · 3 kayıt
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: D

> Sorun: 'Altı çizili sözcük' çizili değildi; şıklar cümleyle ilgisizdi ve doğru kabul edilen D savunulamıyordu.

**Önce:** Edebiyat tarihinde saygın bir mertebeye ulaşan bazı yazarlar, yaşadıkları dönemde ne yazık ki hak ettikleri ilgiyi görememiştir. Bu cümlede altı çizili sözcüğün yerine, anlamı en uygun biçimde karşılayacak kullanım aşağıdakilerin hangisinde verilmiştir?

  A) Tatil için gittikleri yayla köyünde elektrikler kesilince ço… · B) Gece boyunca masasında biriktirdiği sözcükleri, sabahın ilk … · C) Kentin en yüksek tepesinden bakarken sokakların içine gömülm… · **D) Yaşam, insanı içten içe dönüştüren ince çizgilerle örülüdür;…** · E) Göl kenarında yürürken kulağına çalınan bir türkü, çocukluk …

**Sonra:** Edebiyat tarihinde saygın bir <u>mertebeye</u> ulaşan bazı yazarlar, yaşadıkları dönemde ne yazık ki hak ettikleri ilgiyi görememiştir. ⏎ ⏎ Bu cümledeki altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- A) Yarışmada elde ettiği ödül ona büyük bir ün kazandırdı.
- B) Sınavdaki başarısı bütün ailesini mutlu etti.
- C) Kitabı yayımlanınca adı geniş bir okur kitlesine ulaştı.
- **D) Usta, mesleğinde ulaşılabilecek en yüksek düzeye kısa sürede erişti.**
- E) Yazarın son romanı eleştirmenlerden övgü aldı.

### 64. TRK897264 · Exam/System · YKS TYT Temmuz 2 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: C

> Sorun: Kök 'koyu yazılan sözcükler' diyor ama uygulama koyu yazıyı göstermiyor ve hiçbir sözcük işaretli değildi; doğru cevap savunulamıyordu.

**Önce:** Aşağıdaki numaralanmış cümlelerde, koyu yazılan sözcüklerin cümleye kattığı anlamlar inceleniyor. I. Eski defterin arasından çıkan not, yıllar sonra bile onu aynı heyecana götürdü. II. Uzun yürüyüşten sonra dinlenmek, ona yeniden güç verdi. III. Bu konuda söyl…

  A) I. cümledeki sözcük, geçmişe dönük bir çağrışım kurmaktadır. · B) II. cümledeki sözcük, bir durumun sonuç etkisini belirtmekte… · **C) III. cümledeki sözcük, yapılan işin biçimini açıklamaktadır.** · D) IV. cümledeki sözcük, zaman değişimini bildirmektedir. · E) I. cümledeki sözcük, duygusal bir yönelim ifade etmektedir.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük, ötekilerden farklı olarak nitel (özellik bildiren) anlamdadır?

- A) Sepette <u>beş</u> elma kalmıştı.
- B) Toplantıya <u>birçok</u> kişi katıldı.
- **C) Kapının önünde <u>yorgun</u> bir adam bekliyordu.**
- D) Bardağın ancak <u>yarısı</u> doluydu.
- E) Bu yıl okulumuza <u>yüzlerce</u> öğrenci kaydoldu.

### 65. TRK899283 · Exam/System · YKS TYT Türkçe Branş Haziran 70 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: C

> Sorun: Sözcükte anlam sorusu değil; “buna rağmen” bağlacı üzerine çelişkili ve çözülemeyen bir anlam ilişkisi sorusu.

**Önce:** Aşağıdaki numaralanmış cümleler, kısa bir bilgilendirme notundan alınmıştır. I. Rüzgârın sertleşmesiyle birlikte sahildeki yürüyüş yolu kısa sürede boşaldı. II. Buna rağmen kıyıdaki çay bahçesinde oturanlar, dalgaların sesini dinlemeyi sürdürdü. III. Akşam saa…

  A) I. cümledeki durum, rüzgârın etkisini doğrudan gösteren bir … · B) II. cümledeki ifade, önceki yargıya karşıt bir beklenti kura… · **C) II. cümledeki ifade, önceki yargıyla aynı doğrultuda gelişen…** · D) III. cümledeki zaman bildirimi, önceki cümlelerin anlam akış… · E) I. cümledeki eylem, ikinci cümledeki davranışın nedenini açı…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcükler arasında karşıt anlam ilişkisi yoktur?

- A) <u>Gece</u> yağan kar, <u>gündüz</u> çıkan güneşle eridi.
- B) <u>Zengin</u> ile <u>yoksul</u> aynı sofrada buluştu.
- **C) Uzun yürüyüşten sonra <u>yorgun</u> ve <u>bitkin</u> bir hâlde eve döndü.**
- D) <u>İçeri</u> girenler <u>dışarıdaki</u> soğuktan yakınıyordu.
- E) <u>Eski</u> dostlarımızla <u>yeni</u> bir başlangıç yaptık.

### 66. TRK914949-202610 · Exam/System · YKS TYT Türkçe Branş 3 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: B

> Sorun: 'Altı çizili sözcük' çizili değildi; A şıkkı da “yorumlanmak” sözüyle aynı anlamı karşıladığından iki doğru cevap vardı.

**Önce:** Dijital teknolojilerin gelişmesiyle birlikte fotoğrafın gerçeklikle kurduğu bağ tartışmalı hâle gelmiştir. Bir fotoğrafta yapılan teknik düzenlemeler, ışık oyunları ve kadraj tercihleri nesnenin doğrudan yansıtılmasını zayıflatınca, izleyici çoğu zaman görüntü…

  A) Sergideki tablolar, farklı bakış açılarıyla yorumlandığında … · **B) Okurun esere kendi birikimine göre verdiği anlam, eleştirmen…** · C) Yazar, metindeki ayrıntıları açık bir dille anlatarak okurun… · D) Fotoğrafın teknik yönü geliştikçe, sanatçıların kullandığı a… · E) Müzede yer alan eserler, ışık düzeni değişince ziyaretçileri…

**Sonra:** Dijital teknolojilerin gelişmesiyle birlikte fotoğrafın gerçeklikle kurduğu bağ tartışmalı hâle gelmiştir. Bir fotoğrafta yapılan teknik düzenlemeler, ışık oyunları ve kadraj tercihleri nesnenin doğrudan yansıtılmasını zayıflatınca izleyici, görüntüyü çoğu zaman yalnızca gördüğü hâliyle değil, kendi birikimi ve beklentileriyle de <u>değerlendirir</u>. ⏎ ⏎ Bu parçadaki altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- A) Sergideki tablolar, farklı ışıklarla aydınlatıldığında yeni renk tonları kazanıyordu.
- **B) Okur, esere kendi birikimine göre anlam yükleyerek onu yorumlar.**
- C) Yazar, metindeki ayrıntıları açık bir dille anlatarak okurun dikkatini canlı tutmayı amaçlıyordu.
- D) Fotoğrafın teknik yönü geliştikçe sanatçıların kullandığı araçlar da daha işlevsel bir hâl alıyordu.
- E) Müzedeki eserler, ışık düzeni değişince ziyaretçilerin ilgisini daha çok çekmeye başladı.

### 67. TRK924079 · Exam/System · YKS TYT Temmuz 2 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragrafın asıl vurgusunu soran soru.

**Önce:** I. Kentin eski çarşısında yıllardır aynı dükkânı işleten ustalar, müşteriye yalnızca ürün değil, onlara ait bir öykü de sunar. II. Bu yüzden bazı semtlerde alışveriş, kısa bir ihtiyaç giderme işinden çok, insanların birbirini tanıdığı bir karşılaşmaya dönüşür.…

  **A) Eski çarşıların, ticaretin yanında toplumsal ilişkiyi de can…** · B) Büyük mağazaların, her zaman küçük dükkânlardan daha çok ter… · C) Alışverişin, yalnızca ekonomik bir işlem olarak değerlendiri… · D) Semt esnafının, modernleşme karşısında bütünüyle etkisiz kal… · E) Müşteri sadakatinin, ürün kalitesinden daha önemli görülmesi

**Sonra:** Aşağıdaki cümlelerin hangisinde yansıma bir sözcük kullanılmıştır?

- **A) Gece boyunca saatin tıkırtısı uyumamı engelledi.**
- B) Sabah erkenden kalkıp bahçedeki çiçekleri suladık.
- C) Kardeşim yeni aldığı kitabı bir günde bitirdi.
- D) Akşam yemeğinden sonra hep birlikte yürüyüşe çıktık.
- E) Kış yaklaşınca göçmen kuşlar güneye doğru uçtu.

### 68. TRK934692-202610 · Exam/System · YKS TYT Paragraf Branş 11 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: D

> Sorun: 'Altı çizili söz' çizili değildi; doğru cevabın dayandığı “naif” sözcüğü işaretlenmemişti, çözüm başka bir söze göre yazılmıştı.

**Önce:** Hulki Aktaş; çizimlerinde tekniğe ve ustalığa yüklenmemiş, sevdiği halk ressamlarının ve naif resmin izinde yürümüştür. Egemen Berköz, kullandığı renklerin sönük ve soluk oluşuna dikkat çekince “Sönük yerine birbiri içinde eritilmiş desem daha doğru ve genelli…

  A) Elleri çok küçüktü, bilekleri bir çöp kadar inceydi ve çelim… · B) Çevresindekiler onun hassas bir karaktere sahip olduğunu bil… · C) Onu kime sorsanız nezaketin ete kemiğe bürünmüş hâlidir, diy… · **D) Toprak, taş, kütük ve sazlardan yapılan bu yamru yumru ev; a…** · E) Kimse onun temiz duyguları sayesinde buralara gelmiş olabile…

**Sonra:** Hulki Aktaş, çizimlerinde tekniğe ve ustalığa yüklenmemiş; sevdiği halk ressamlarının ve <u>naif</u> resmin izinde yürümüştür. Egemen Berköz, kullandığı renklerin sönük ve soluk oluşuna dikkat çekince “Sönük yerine birbiri içinde eritilmiş desem daha doğru…” yanıtını vermiştir. ⏎ ⏎ Bu parçadaki altı çizili sözün anlamını karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- A) Elleri çok küçüktü, bilekleri bir çöp kadar inceydi ve çelimsiz bacaklarıyla doktorun karşısında titriyordu.
- B) Çevresindekiler onun hassas bir karaktere sahip olduğunu bilirdi; ailede onun kadar duygulu bakan biri yoktu.
- C) Onu kime sorsanız “Nezaketin ete kemiğe bürünmüş hâlidir.” diyerek size tanıtacaktır.
- **D) Toprak, taş, kütük ve sazlardan yapılan bu yamru yumru ev, acemice yapılmış süslerle güzelleştirilmeye çalışılmıştı.**
- E) Kimse onun temiz duyguları sayesinde buralara gelmiş olabileceğini düşünmüyor, herkes onu bu makama getiren gizli bir el arıyordu.

### 69. TRK962628-202610 · Exam/System · YKS TYT Tam Deneme 2 — Ekim 2026 Kitapçık · 3 kayıt
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: E

> Sorun: Kök 'altı çizili sözcük' diyor ama çizili sözcük yoktu; doğru cevaptaki anlamın karşılığı parçada belirsizdi.

**Önce:** Öfke düzeyi yükseldikçe çevredeki insanların bize gösterdiği tolerans azalır. İnsanlar, öfkeli tavırlarla karşılaştıklarında çoğu zaman kendilerini korumak için pasif-agresif davranışlar ve yok sayma gibi savunmalar geliştirirler. Bu durum, öfkenin odağındaki …

  A) Ütopik bir kent planı, insanların gerçek yaşam koşullarını g… · B) Tembellikten ve miskinlikten kurtulmak isteyen kişi, gününü … · C) Artık işlevi kalmayan bu dosyayı ayıklayıp arşivin dışına çı… · D) Bilgi, insanın en zor durumlarda bile ayakta kalmasına deste… · **E) Şair, sevginin egemen olduğu bir dünyanın kapısını okuruna a…**

**Sonra:** Öfke düzeyi yükseldikçe çevredeki insanların bize gösterdiği hoşgörü azalır. İnsanlar, öfkeli tavırlarla karşılaştıklarında çoğu zaman kendilerini korumak için içe kapanma ve yok sayma gibi savunmalar geliştirir. Bu durum, öfkenin <u>odağındaki</u> meselenin çözümünü daha da güçleştirebilir. ⏎ ⏎ Bu parçadaki altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerin hangisinde vardır?

- A) Ütopik bir kent planı, insanların gerçek yaşam koşullarını göz ardı eden bir düzen kurmayı amaçlıyordu.
- B) Tembellikten ve miskinlikten kurtulmak isteyen kişi, gününü daha düzenli geçirmeye karar verdi.
- C) Artık işlevi kalmayan bu dosyayı ayıklayıp arşivin dışına çıkarmak gerekiyordu.
- D) Bilgi, insanın en zor durumlarda bile ayakta kalmasına destek olan bir güç verir.
- **E) Şair bu dizelerde, sevginin merkezinde durduğu bir dünyanın kapısını okuruna aralıyor.**

### 70. TRK975337 · Exam/System · YKS TYT Türkçe Branş Haziran 19 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragrafın ortak mesajını soran soru.

**Önce:** I. Bir sözcük, günlük kullanımda ilk bakışta tek bir anlamı çağrıştırsa da bağlam değişince daha geniş bir anlam alanı kazanabilir. II. Bu yüzden metni okurken sözcüğün sözlükteki karşılığını ezberlemek kadar, cümlede üstlendiği görevi de dikkate almak gerekir…

  **A) Sözcüklerin anlamı, kullanıldıkları cümleye göre değişebilir…** · B) Sözlükte yer alan ilk anlam, her cümlede değişmeden korunur … · C) Bir metinde sözcüklerin ses değeri, anlamlarından daha belir… · D) Anlatımın etkisi, yalnızca uzun ve ayrıntılı sözcükler kulla… · E) Okur, metindeki her sözcüğü ayrı ayrı değerlendirerek genel …

**Sonra:** Aşağıdaki cümlelerin hangisinde “göz” sözcüğü “bölme, çekmece” anlamında kullanılmıştır?

- **A) Dolabın alt gözüne kışlık giysileri yerleştirdi.**
- B) Çocuğun gözleri uykusuzluktan kızarmıştı.
- C) Yıllar geçse de gözü hâlâ o evde kalmıştı.
- D) Malzemeyi tartmadan, göz kararı ayarladık.
- E) Annem bu örtüyü göz nuru dökerek ördü.

### 71. TRK981267 · Exam/System · YKS TYT Türkçe Branş Temmuz 34 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Sözcükte anlam sorusu değil; paragraftan yargı çıkarma sorusu.

**Önce:** Bir araştırma notunda, bir ürünün satışları beklenmedik biçimde artınca ekibin ilk yorumu, bunun yalnızca reklam bütçesindeki yükselişten kaynaklandığı yönünde olur. Ancak sonraki veriler, asıl etkinin ürünün kullanım kolaylığını anlatan kısa videoların sosyal…

  **A) Bir sonucun tek bir etkene bağlanması, çoğu zaman eksik ve y…** · B) Görünürlüğü artıran her çalışma, satışlarda mutlaka aynı ora… · C) Reklam bütçesi yükselince ürünün başarısı diğer bütün etkenl… · D) Sosyal medyada paylaşılan her içerik, kısa sürede geniş kitl… · E) Ürünlerin satış başarısı, yalnızca teknik özelliklerinin ayr…

**Sonra:** Aşağıdaki cümlelerin hangisinde “derin” sözcüğü gerçek anlamıyla kullanılmıştır?

- **A) Çocuklar, gölün derin yerlerine girmemeleri konusunda uyarıldı.**
- B) Yazarın derin düşünceleri okurları uzun süre etkiledi.
- C) İki kardeş arasında derin bir sevgi vardı.
- D) Yorgunluktan yatar yatmaz derin bir uykuya daldı.
- E) Bu konuda derin bilgisi olan birine danışmalıyız.

### 72. TRK988483 · Exam/System · YKS TYT Haziran 3 Kitapçık
**Yeniden yazıldı** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: D

> Sorun: Sözcükte anlam sorusu değil; noktalama sorusu ve doğru kabul edilen virgül kuralı yanlış.

**Önce:** Bir çevrim içi alışveriş uygulamasında ürün açıklaması hazırlanırken şu cümleler yazılıyor: “Kampanya, 12 Mayıs’ta başlayacak. İndirim oranı yüzde 30’a kadar çıkıyor. Stoklar sınırlı olduğu için erken davranmak gerekiyor.” Bu metinde yazım ve noktalama bakımın…

  A) İlk cümledeki tarih ifadesi bitişik yazılmalı, diğer cümlele… · B) İkinci cümledeki yüzde ifadesinden sonra virgül getirilmeli,… · C) Üçüncü cümledeki gerekçe bildiren bölümden önce iki nokta ku… · **D) İlk cümledeki tarih ifadesinden sonra virgül getirilmeli, di…** · E) İkinci cümledeki sayı ifadesi harfle yazılmalı, diğer cümlel…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük, ötekilerdekiyle yazılışı aynı olan ancak anlamca ilgisi bulunmayan (eş sesli) bir sözcüktür?

- A) Kahvaltıda iki bardak <u>çay</u> içti.
- B) Annem misafirlere taze demlenmiş <u>çay</u> ikram etti.
- C) Doğu Karadeniz'de <u>çay</u> bahçeleri yamaçları kaplar.
- **D) Köyün kenarından geçen <u>çay</u> yazın neredeyse kurur.**
- E) Marketin rafında birçok <u>çay</u> çeşidi vardı.

### 73. QZ-02C52CB4E39C4D88BC2EDC2BC3171969 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: A

> Sorun: I. cümledeki “salonda ölçülen alan” kullanımı terim sayılıp sayılmayacağı tartışmalıydı; giriş cümlesi gereksizdi.

**Önce:** Bir üniversitenin duyurusu ve günlük cümleler aşağıdadır. ⏎ I. Salonda ölçülen <u>alan</u> 20 metrekaredir. ⏎ II. Öğrenciler <u>sıra</u> beklerken öğretmenin odasına girdi. ⏎ III. Geometri dersinde dairenin <u>alan</u> formülü sınıfta gösterildi. ⏎ Yukarıdakil…

  **A) I ve III** · B) Yalnız III · C) II ve III · D) Yalnız II · E) Yalnız I

**Sonra:** I. Fizik dersinde mıknatısın manyetik <u>alan</u> çizgilerini inceledik. ⏎ II. Öğrenciler <u>sıra</u> beklerken öğretmen odasına girdi. ⏎ III. Geometri dersinde dairenin <u>alan</u> formülü gösterildi. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük terim anlamında kullanılmıştır?

- **A) I ve III**
- B) Yalnız III
- C) II ve III
- D) Yalnız II
- E) Yalnız I

### 74. QZ-075BABB6702C4A38BEA0BCB8C49202C9 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: D

> Sorun: Kök, sözcüğü vermeden anlamını anlatıyor ve çözümü kökte veriyordu; şıklar sorulan anlamla zayıf ilişkiliydi.

**Önce:** Bir şair, düşüncelerinin özgürce yayıldığını ve bir fikir kıvılcımıyla yeni eserlerin doğduğunu söylerken sözcüğü gerçek ateş/parıltı anlamından uzaklaşıp soyut bir etkiyi belirtmek için kullanmıştır. Bu kullanıma anlamca en yakın örnek aşağıdakilerden hangisi…

  A) Geçmişteki deyimlerin tekrarı, dilin canlılığını azaltıp ifa… · B) Yazar, sade üslubuyla okurda kalıcı duygular bırakan yapıtla… · C) Yazarın eleştirileri, yüzeysel metinlere karşı sert ifadeler… · **D) Küçük bir söz, toplantıda beklenmedik bir heyecan uyandırıp …** · E) Sergideki renk oyunları, izleyicilerin önünde gerçek aydınla…

**Sonra:** Toplantıda söylenen tek bir cümle, ekipte yeni projelerin doğmasına yol açan bir <u>kıvılcım</u> oldu. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- A) Ateşten sıçrayan küçük kor parçası
- B) Ani ve şiddetli bir öfke
- C) Kısa süren parlak bir ışık
- **D) Bir şeyin başlamasına yol açan küçük etken**
- E) Kalıcı ve derin bir iz

### 75. QZ-13E994E531B84A23892810AA52909C59 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: E

> Sorun: Eşleştirmeler tek satıra sıkıştırılmış, “sayı” ve “adet” gibi aynı türü iki adla veren karışık bir biçimde yazılmıştı; şık sırası düzensizdi.

**Önce:** Bir pazar tezgâhında satıcı ürünleri tanıtırken parantez içinde verilen açıklamalarla numaralandırılmış sözcükleri kullandı: I çok (miktar), II kırmızı (sayı), III üç (sayı), IV taze (özellik), V birkaç (adet). Bu parçada parantez içindeki açıklamalardan hangi…

  A) IV · B) III · C) V · D) I · **E) II**

**Sonra:** Bir pazar tezgâhında satıcının kullandığı bazı sözcükler, bildirdikleri anlam türüyle şöyle eşleştirilmiştir: ⏎ I. çok: miktar ⏎ II. kırmızı: özellik ⏎ III. üç: sayı ⏎ IV. taze: özellik ⏎ V. birkaç: özellik ⏎ ⏎ Bu eşleştirmelerin hangisinde sözcüğün anlam türü yanlış verilmiştir?

- A) I
- B) II
- C) III
- D) IV
- **E) V**

### 76. QZ-1E4B664D85F3442499DE63DFE06A739D · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Şıklarda yazım hataları vardı (“tarafındanher”, “teknikinceleme”); sorulan anlam yalnızca “kaba” sıfatına dayandığı hâlde soru “inceleme” sözcüğünü soruyordu, doğru şık belirsizdi.

**Önce:** Bir dil araştırmacısı, sözcüklerin tarihî kökenlerine bakıldığında bugün kullanılan pek çoğunun ilk anlamıyla ilişkisinin zayıfladığını göstermek için kaba bir inceleme yaptı; bu çalışma ayrıca eş anlamlı sandığımız sözcüklerin gerçekte farklı anlamlar taşıdığ…

  A) Mimari tasarım sürecinde proje detayları, mimar tarafındanhe… · B) Resimlerde ışık ve gölge doğruluğunu belirlemek için yapılan… · **C) Yeni programların uygulanabilirliğini kabaca ölçmek için öğr…** · D) Roman üzerine yapılan edebiyat incelemesi genellikle metin ç… · E) Çevre bilincindeki değişimi kesin verilerle ortaya koymak am…

**Sonra:** Aşağıdaki cümlelerin hangisinde “kaba” sözcüğü “ayrıntıya inmeyen, yaklaşık” anlamında kullanılmıştır?

- A) Kaba davranışları yüzünden kimse onunla konuşmak istemiyordu.
- B) Bu kaba kumaştan dikilen gömlek tenimi kaşıdı.
- **C) Yapılan kaba bir hesapla gezinin yaklaşık bin liraya mal olacağı anlaşıldı.**
- D) Ustanın kaba işçiliği masanın her yerinden belli oluyordu.
- E) Kaba saba sözleriyle ortamı bir anda gerdi.

### 77. QZ-242EAF2AAB9A48B7B2D0D0C7955D0017 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: E

> Sorun: Doğru kabul edilen cümlede “soğuk tavır” mecazdı, yani hiçbir şık doğru değildi; kökte 'altı çizili' denmiyordu, şıklar cümleleri tekrarlıyordu.

**Önce:** Aşağıdaki beş cümleden hangisinde sözcüklerin tamamı temel (yan anlamı olmayan) anlamlarında kullanılmıştır? 1. Köylüler, tepenin <u>sırt</u>larına yeni fidanlar dikmeye başladı. 2. Yemek tarifine bir <u>diş</u> sarımsak ekleyince lezzet değişti. 3. Uçağın <u>…

  A) Duvarın gözü sayılan küçük pencereyi kapattılar. · B) Uçağın kanadı onarım sırasında parçalanmış rapor edildi. · C) Köylüler, tepenin sırtlarına yeni fidanlar dikmeye başladı. · D) Yemek tarifine bir diş sarımsak ekleyince lezzet değişti. · **E) Karşısındaki kişiye soğuk bir tavırla cevap verdi.**

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük yan anlamıyla kullanılmamıştır?

- A) Köylüler, tepenin <u>sırtına</u> yeni fidanlar dikti.
- B) Yemeğe bir <u>diş</u> sarımsak ekleyince lezzeti değişti.
- C) Uçağın <u>kanadı</u> bakım sırasında değiştirildi.
- D) Yaşlı kadın ipliği iğnenin <u>gözüne</u> geçiremedi.
- **E) Kuşun kırık <u>kanadını</u> sarıp onu iyileştirdik.**

### 78. QZ-25574B355B2145D1AA48EB5F1D45C05A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: Hedef sözcükler bozuk tırnaklarla verilmişti (“'penceres'inden”, “'çiçek'lere”); altı çizili işaretlemeye çevrildi.

**Önce:** Aşağıdaki cümlelerde tırnak içinde verilen sözcükler kullanılmaktadır. ⏎ I. Maçın son anında hakem 'ofsayt' kararını verip bayrağı kaldırdı. ⏎ II. Sabah erken saatte komşu bahçedeki 'çiçek'lere su verildi. ⏎ III. Odanın 'penceres'inden gün ışığı içeri doldu. ⏎…

  A) II ve III · B) Yalnız III · **C) Yalnız I** · D) I ve II · E) Yalnız II

**Sonra:** I. Maçın son anında yan hakem <u>ofsayt</u> bayrağını kaldırdı. ⏎ II. Sabah erken saatte bahçedeki <u>çiçeklere</u> su verildi. ⏎ III. Odanın <u>penceresinden</u> içeri gün ışığı doldu. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük terim anlamında kullanılmıştır?

- A) II ve III
- B) Yalnız III
- **C) Yalnız I**
- D) I ve II
- E) Yalnız II

### 79. QZ-26AF0DB0D6A4470985A7F5A2C4ED147B · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: Kök cevabı içinde veriyordu (“tahammülsüz davranıyorlar”); D şıkkında anlatım bozukluğu vardı (“yapıcı … daha yapıcı olur”).

**Önce:** Topluluk tartışmasında sık sık karşılaşılan tutumlar, kişilerin farklı görüşlere sabırla yaklaşmasını sağlar; ancak tartışma sırasında bazı kişiler açıkça <u>hoşgörü</u> göstermiyor, eleştirilere tahammülsüz davranıyorlar. Bu parçadaki altı çizili sözcüğün anl…

  **A) Sınırlar zorlandığında tahammülsüzlük sergilemek yaygındır.** · B) Tartışmada karşısındakine anlayış göstermek gerekir. · C) Farklı görüşlere karşı müsamaha göstermek önemlidir. · D) Eleştirilere yapıcı biçimde yaklaşmak daha yapıcı olur. · E) Çoğu kişi fikir ayrılıklarında sabırlı davranmayı tercih ede…

**Sonra:** Topluluk tartışmalarında bazı kişiler farklı görüşlere karşı <u>hoşgörü</u> göstermiyor, eleştirilere sert tepki veriyor. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün karşıt anlamlısı aşağıdakilerin hangisinde kullanılmıştır?

- **A) Sınırlar zorlandığında tahammülsüzlük göstermek yaygın bir davranıştır.**
- B) Tartışmada karşısındakine anlayış göstermek gerekir.
- C) Farklı görüşlere karşı müsamaha göstermek önemlidir.
- D) Eleştirilere yapıcı biçimde yaklaşmak tartışmayı verimli kılar.
- E) Çoğu kişi fikir ayrılıklarında sabırlı davranmayı tercih eder.

### 80. QZ-29495CA1C3474034865D2E10DAC48989 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: B

> Sorun: Kök cümlelerin somut olup olmadığını soruyordu, hangi sözcüğün değerlendirileceği belirsizdi; şıklar uzun ve gereksiz tekrarlıydı.

**Önce:** Aşağıdaki kısa ifadelerde geçen sözcüklerin somut veya soyut anlamlı olup olmadığı değerlendiriliyor. I. Rüzgâr pencereden içeri girip perdeleri titretti. II. Başarı, yılların emeğinin birikimiyle oluştu. III. Konserde çalan davulun sesi salonda yankılandı. Yu…

  A) I, II ve III somut anlamlıdır. · **B) I ve III somut anlamlıdır.** · C) Yalnız II somut anlamlıdır. · D) Yalnız III somut anlamlıdır. · E) Yalnız I somut anlamlıdır.

**Sonra:** I. <u>Rüzgâr</u> pencereden içeri girip perdeleri titretti. ⏎ II. <u>Başarı</u>, yılların emeğinin birikimiyle oluştu. ⏎ III. Konserde çalan davulun <u>sesi</u> salonda yankılandı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük somut anlamlıdır?

- A) I, II ve III
- **B) I ve III**
- C) Yalnız II
- D) Yalnız III
- E) Yalnız I

### 81. QZ-2DC779F8B2704743872E7C4AE564DB4B · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: A

> Sorun: Hedef sözcük tırnakla verilmişti; II. cümlede yazım yanlışı vardı (“kitapı”); III. cümlenin genel mi özel mi olduğu tartışmalıydı.

**Önce:** I. Kitap okumak, insanın bilgi dünyasını genişletir. ⏎ II. Masadaki kitapı sabah çantama koydum. ⏎ III. Kütüphanedeki kitaplar arasından tarih ansiklopedisini seçti. ⏎ Yukarıdakilerden hangilerinde "kitap" sözcüğü özel anlamda kullanılmıştır?

  **A) II ve III** · B) Yalnız III · C) Yalnız II · D) I ve II · E) Yalnız I

**Sonra:** I. <u>Kitap</u>, insanın en iyi dostudur. ⏎ II. Masadaki <u>kitabı</u> sabah çantama koydum. ⏎ III. Kardeşime doğum gününde aldığım <u>kitap</u> çok beğenildi. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük özel anlamda kullanılmıştır?

- **A) II ve III**
- B) Yalnız III
- C) Yalnız II
- D) I ve II
- E) Yalnız I

### 82. QZ-2F0FA174F3E341188E04BCB0DC06E011 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: Parçada yansıma sözcük de yoktu; iki şık birden doğruydu. Kök, ne aranacağını anlatan açıklamalar içeriyordu.

**Önce:** Sabah erkenden mutfakta tencerenin kaynayan sesiyle uyanan Ahmet, pencereyi açıp temiz havayı içine çekti; masadaki ekmek ve çayın kokusu somut algısını güçlendiriyordu. Bir yudum çay alırken yüzünde beliren huzur ifadesi iç dünyasını anlattı; komşunun kapı zi…

  A) Soyut anlamlı sözcük · B) Yansıma anlamlı sözcük · **C) Terim anlamlı sözcük** · D) Somut anlamlı sözcük · E) Mecaz anlamlı sözcük

**Sonra:** Sabah erkenden çaydanlığın fokurtusuyla uyanan Ahmet, pencereyi açıp serin havayı içine çekti. Masadaki taze ekmeğin kokusu bütün mutfağı sarmıştı. İlk yudum çayla birlikte içi ısındı, yüzüne derin bir huzur yayıldı. ⏎ ⏎ Bu parçada aşağıdakilerden hangisi yoktur?

- A) Soyut anlamlı sözcük
- B) Yansıma sözcük
- **C) Terim anlamlı sözcük**
- D) Somut anlamlı sözcük
- E) Mecaz anlamlı söz

### 83. QZ-307E4C46DAE84DCABB5A4217822FB54A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Sorulan “ince” sözcüğü II. cümlede hiç geçmiyordu; I ile III'ün aynı anlamda olduğu da tartışmalıydı.

**Önce:** Aşağıdaki cümlelerde aynı sözcüğün hangi kullanımları yakın anlamlıdır, belirleyiniz. ⏎ I. Annemin sesi odaya ince bir hüzün getirdi. ⏎ II. Keten kumaş yazlık elbise için uygundur. ⏎ III. Konuşmasını dinlerken adamın nükteleri oldukça inceydi. ⏎ Yukarıdakilerd…

  A) II ve III · **B) Yalnız III** · C) I ve II · D) Yalnız II · E) Yalnız I

**Sonra:** I. Yaz için <u>ince</u> bir ceket aldı. ⏎ II. Kalemin <u>ince</u> ucu kâğıdı yırttı. ⏎ III. Konuşmasındaki <u>ince</u> espriler herkesi güldürdü. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük “zekice, ustalıklı” anlamında kullanılmıştır?

- A) II ve III
- **B) Yalnız III**
- C) I ve II
- D) Yalnız II
- E) Yalnız I

### 84. QZ-32F40A92929C47D2B2B64BE9C23A6DD7 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Soru “inziva” sözcüğünün mecaz anlamını soruyordu ama doğru kabul edilen şık sözcüğün gerçek anlamını veriyordu; kökte anlatım bozukluğu vardı.

**Önce:** Uzun süreli projeler üzerinde çalıştıktan sonra yazar, herkesten uzaklaşıp bir süreliğine <u>inziva</u> hayatı seçmiş; ardından çalışmalarına ara verdiği izlenimi vermişti. Bu bağlamda altı çizili sözcüğün mecaz anlamına en çok uyan kullanım hangisidir?

  A) Yeni tanıştığı kişilerle iletişim kurmaktan kaçınarak soğuk … · **B) Kendi içine çekilip yalnız kalarak yeni projelerini düşünme …** · C) Yaşanan olaylara hep aynı açıdan bakıp farklı yorumlara kapa… · D) Sabit fikirli bir söylemle çevresini etkilemeye çalışıp eleş… · E) Her olaya karamsar ve hoşgörüsüz bir tavırla yaklaşarak her …

**Sonra:** Uzun süren bir çalışmanın ardından yazar, kalabalıktan uzaklaşmak için bir dağ köyünde aylarca <u>inziva</u> hayatı yaşadı. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamı aşağıdakilerden hangisidir?

- A) Yoğun ve düzensiz bir çalışma temposu
- **B) Toplumdan çekilip yalnız yaşama**
- C) Uzun bir yolculuğa çıkma
- D) Hastalık nedeniyle dinlenme
- E) Bir topluluğa katılıp onlarla yaşama

### 85. QZ-38C4DE19F9794EB599AA5003E189DED2 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Hangi sözcüğün değerlendirileceği belirsizdi; I. cümlede “çok” sözcüğü de bulunduğu için yanıt tartışmalıydı.

**Önce:** Aşağıdaki üç cümlede geçen sözcüklerden hangileri nitel (özellik, durum, biçim belirten) anlam taşımaktadır? I. Bu elma çok tatlı. II. Sınıfta on üç öğrenci var. III. Hava bugün puslu ve soğuk.

  **A) I ve III** · B) II ve III · C) Yalnız II · D) I ve II · E) Yalnız I

**Sonra:** I. Bu elma çok <u>tatlı</u>. ⏎ II. Sınıfta <u>on üç</u> öğrenci var. ⏎ III. Hava bugün <u>puslu</u>. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili söz nitel (özellik bildiren) anlamdadır?

- **A) I ve III**
- B) II ve III
- C) Yalnız II
- D) I ve II
- E) Yalnız I

### 86. QZ-3B91E547C49E4303AE0A17B83841707A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: B

> Sorun: I. cümledeki “kütüphanedeki kitaplar” belirli bir kümeyi gösterdiği için genel anlam sayılması tartışmalıydı; II. cümlede anlatım bozukluğu vardı.

**Önce:** Aşağıdaki iki cümlede aynı sözcük farklı anlamlarda kullanılmıştır. ⏎ I. Kütüphanedeki kitaplar dünya edebiyatından seçmeler içerir. ⏎ II. Rafın en üstünde duran kitap, Ahmet'in ders çalışmak için getirdiği tek örnektir. ⏎ Yukarıdakilerden hangisi sözcüğün kul…

  A) I. cümlede sözcük özel bir bireyi karşılayan anlamda, II. cü… · **B) I. cümlede sözcük genel anlamda, II. cümlede özel bir bireyi…** · C) Her iki cümlede sözcük yalnızca soyut bir kavramı karşılayan… · D) Cümlelerde sözcük yalnızca mecaz anlamlı olarak kullanılmışt… · E) Her iki cümlede sözcük aynı genel kategori anlamında kullanı…

**Sonra:** I. Kitaplar, insanlığın birikimini kuşaktan kuşağa taşır. ⏎ II. Rafın en üstünde duran kitap, Ahmet'in ders çalışmak için getirdiği kitaptır. ⏎ ⏎ Bu iki cümlede “kitap” sözcüğünün kullanımıyla ilgili aşağıdakilerden hangisi doğrudur?

- A) I. cümlede sözcük belirli bir varlığı karşılayan özel anlamda, II. cümlede genel anlamda kullanılmıştır.
- **B) I. cümlede sözcük genel anlamda, II. cümlede belirli bir varlığı karşılayan özel anlamda kullanılmıştır.**
- C) Her iki cümlede de sözcük soyut bir kavramı karşılayacak biçimde kullanılmıştır.
- D) Her iki cümlede de sözcük mecaz anlamda kullanılmıştır.
- E) Her iki cümlede de sözcük aynı genel anlamda kullanılmıştır.

### 87. QZ-3F7FE08A8D214AEFA20F4679EC50BD1F · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: B

> Sorun: Kök “yan anlam” soruyordu ama şıklar mecaz anlamı sınıyordu; doğru şıktaki “güneşinde” sözü de yan anlam tartışmasına açıktı.

**Önce:** Aşağıdaki cümlelerin hangisinde geçen sözcüklerden hiçbiri temel anlamından saparak yeni bir yan anlam kazanmamıştır? Cümleleri dikkatle okuyunuz.

  A) Eski öğretmen, öğrencilerin kalplerine bilgi tohumları ekti. · **B) Bahçedeki kedi sabah güneşinde uyuyordu.** · C) Müzik grubu yeni albümüyle dinleyici kitlesinin sınırlarını … · D) Şirket, rakiplerine karşı güçlü bir savunma hattı oluşturdu. · E) Gazetedeki köşe yazarı eleştirileriyle birçok kapıyı araladı…

**Sonra:** Aşağıdaki cümlelerin hangisinde sözcüklerin tümü gerçek anlamıyla kullanılmıştır?

- A) Eski öğretmen, öğrencilerinin kalplerine bilgi tohumları ekti.
- **B) Bahçedeki kedi, ağacın altında uyuyordu.**
- C) Müzik grubu yeni albümüyle dinleyici kitlesinin sınırlarını zorladı.
- D) Şirket, rakiplerine karşı güçlü bir savunma hattı oluşturdu.
- E) Gazetedeki köşe yazarı, eleştirileriyle birçok kapıyı araladı.

### 88. QZ-46C4D55000864F4C80363861D16C69A2 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: A

> Sorun: Sözcükler çizili ama kök 'altı çizili' demiyordu (soru tırnakla soruyordu); giriş açıklaması gereksiz uzundu.

**Önce:** Aşağıda aynı sözcüğün farklı cümlelerde kullanımları verilmiştir. Her bir numaralı cümledeki sözcüğün anlamı bağlama göre incelendiğinde mecaz (benzetme ya da deyimsel) anlam taşıyan kullanımları belirleyiniz. ⏎ ⏎ I. Doktor, titiz <u>el</u> hareketleriyle yara…

  **A) II ve IV** · B) I ve III · C) Yalnız II · D) Yalnız IV · E) I, II ve IV

**Sonra:** I. Doktor, titiz <u>el</u> hareketleriyle yaranın üzerine pansuman yaptı. ⏎ II. Komite projeye hızlıca <u>el</u> atınca uygulama aşamaları kısaldı. ⏎ III. Çocuğun boyadığı resimde uzun <u>el</u> figürleri dikkat çekiyordu. ⏎ IV. Komşular, yangında zarar gören aileye yardım için <u>el</u> uzattı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük mecaz anlamda kullanılmıştır?

- **A) II ve IV**
- B) I ve III
- C) Yalnız II
- D) Yalnız IV
- E) I, II ve IV

### 89. QZ-46F1A8F20CA3438D9E0F693EB2393C9C · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: E

> Sorun: Hedef sözler bozuk tırnaklarla verilmişti; “birbirine yakın olanlar” sorusunda tek cümleli şıklar (Yalnız I, Yalnız II) anlamsızdı.

**Önce:** Metindeki aşağıdaki numaralı cümlelerde tırnak içinde verilen sözcük veya sözcük grupları sırasıyla kullanılmıştır. I. Randevuyu beklenmedik bir arıza nedeniyle 'mecburen öteledim'. II. Zor günlerimde yanımda olarak bana sürekli 'destek verdi'. III. Şirketteki…

  A) II ve III · B) Yalnız II · C) Yalnız I · D) I ve II · **E) I ve III**

**Sonra:** I. Beklenmedik bir arıza yüzünden randevuyu <u>mecburen</u> erteledim. ⏎ II. Zor günlerimde bana hep <u>destek</u> oldu. ⏎ III. Bazı toplantılara bütün çalışanların katılması <u>zorunlu</u> tutuluyor. ⏎ IV. Hafta sonu düzenlenen etkinliğe <u>gönüllü</u> olarak katıldı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcükler anlamca birbirine yakındır?

- A) I ve II
- B) I ve IV
- C) II ve III
- D) II ve IV
- **E) I ve III**

### 90. QZ-49CD992C88D04365BB67DD3C588BAD5D · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Soru doğruydu; alt konusu bağlamdaki anlama göre düzeltildi, soru cümlesi ve çözüm yenilendi.

**Önce:** I. İlk kuşak mimari yapılar zamanla çeşitli işlevlere göre yeniden düzenlendi. II. Toplumsal yaşamın koşulları ve alışkanlıklar değiştikçe yerleşim biçimleri yavaş yavaş evrildi. III. Yeni teknolojiler gündelik eşyaların üretiminde farklı yöntemler gerektirdi.…

  **A) Yalnız II.** · B) Yalnız III. · C) II ve III. · D) I ve II. · E) Yalnız I.

**Sonra:** I. İlk kuşak mimari yapılar zamanla çeşitli işlevlere göre yeniden düzenlendi. ⏎ II. Toplumsal yaşamın koşulları ve alışkanlıklar değiştikçe yerleşim biçimleri yavaş yavaş evrildi. ⏎ III. Yeni teknolojiler gündelik eşyaların üretiminde farklı yöntemler gerektirdi. ⏎ ⏎ Yukarıdakilerin hangilerinde “bir biçimden başka bir biçime kendiliğinden dönüşmek” anlamına gelen bir sözcük kullanılmıştır?

- **A) Yalnız II**
- B) Yalnız III
- C) II ve III
- D) I ve II
- E) Yalnız I

### 91. QZ-4B0BC2DD74BB4CDBB54B6CEFF158B555 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: D

> Sorun: Soru doğruydu; altı çizili sözcüklerin işaretleme kaydı yoktu, cümleler ayrı satıra alındı, çözüm yenilendi.

**Önce:** I. Küçük kasabada sabahleyin fırından yeni pişmiş <u>ekmeklerin</u> kokusu herkesi sarmıştı. II. Kongrede bilim insanları gelecek hakkında çeşitli <u>teoriler</u> sundular. III. Resim sergisindeki tablo izleyicide derin bir <u>özlem</u> duygusu uyandırdı. Yuka…

  A) Yalnız III · B) II ve III · C) Yalnız II · **D) Yalnız I** · E) I ve II

**Sonra:** I. Küçük kasabada sabahleyin fırından yeni çıkan <u>ekmeklerin</u> kokusu her yeri sarmıştı. ⏎ II. Kongrede bilim insanları gelecek hakkında çeşitli <u>teoriler</u> sundu. ⏎ III. Sergideki tablo, izleyicide derin bir <u>özlem</u> duygusu uyandırdı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük beş duyudan biriyle algılanabilen bir varlığı karşılar?

- A) Yalnız III
- B) II ve III
- C) Yalnız II
- **D) Yalnız I**
- E) I ve II

### 92. QZ-53FA2C7D43DF442295CB5FFCFC6BCA6A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: E

> Sorun: Hedef sözcükler işaretlenmemişti; soru temel-yan anlam ayrımını sorduğu hâlde alt konusu “gerçek anlam”dı.

**Önce:** Aşağıdaki cümlelerde ayak sözcüğü farklı anlamlarda kullanılmıştır. I. Geziden dönerken ayağıma diken battı. II. Masanın ayakları tamir edilmeliydi. III. Dağın ayaklarında küçük bir köy kurulmuştu. Bu cümlelerin hangisinde ayak sözcüğü gerçek (temel) anlamıyla…

  A) Yalnız II. · B) II ve III. · C) I ve II. · D) Yalnız III. · **E) Yalnız I.**

**Sonra:** I. Geziden dönerken <u>ayağıma</u> diken battı. ⏎ II. Masanın <u>ayakları</u> tamir edilmeliydi. ⏎ III. Dağın <u>ayaklarında</u> küçük bir köy kurulmuştu. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük temel anlamıyla kullanılmıştır?

- A) Yalnız II
- B) II ve III
- C) I ve II
- D) Yalnız III
- **E) Yalnız I**

### 93. QZ-5A921817B82E4D728FB3C1D82BA50785 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Parçada sorulan “örtmek” fiili hiç kullanılmamıştı (yalnızca “kapattı”, “örtü” ve “örtbas” geçiyordu); soru çözülemiyordu.

**Önce:** Mutfakta akşam yemeğini hazırlayan kişi tencerenin kapağını kapattı, sofrayı masa örtüsüyle düzenledi ve misafirlerin konuşmalarını duymamak için pencereleri kapattı; ardından eski defterini alıp bazı satırları örtbas eden notlar yaptı. Bu paragrafta geçen “ör…

  A) Bir kabın veya tencerenin üstünü kapayarak kapatma eylemi · **B) Bir boşluğu tıkamak ya da içini doldurmak suretiyle tamamlam…** · C) Görüşü veya sesi azaltmak için pencere/kapı gibi geçitleri k… · D) Gerçeği saklamak, izleri gizlemek amacıyla örtbas etme · E) Yüzeyin üzerine örtü sererek masa veya eşyayı kaplama

**Sonra:** Akşam yemeğini hazırlayan Ayşe, yemek soğumasın diye tencerenin üstünü <u>örttü</u>. Odaya serin rüzgâr dolmasın diye pencereyi <u>örttü</u>, ardından masayı yeni aldığı keten örtüyle <u>örttü</u>. Kardeşinin kırdığı bardağı da annesinden <u>örttü</u>. ⏎ ⏎ Bu parçadaki altı çizili sözcükler, aşağıdaki anlamlardan hangisini karşılayacak biçimde kullanılmamıştır?

- A) Bir kabın üstünü kapamak
- **B) Bir boşluğu doldurarak tıkamak**
- C) Pencere ya da kapıyı kapamak
- D) Bir şeyi başkasından gizlemek
- E) Bir yüzeyi örtüyle kaplamak

### 94. QZ-5CEAAFFA600D4583B981DAAB8ABA3EB6 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: “Sükûnet” şapkasız yazılmıştı; soru cümlesi düzeltildi ('en zıt anlamlısını veren'), çözüm yenilendi.

**Önce:** Akşam geç saatlerde apartman koridorunda çıkan tartışma komşuların <u>huzursuzluk</u> duymasına neden oldu. Altı çizili sözcüğün en zıt anlamlısını veren seçenek hangisidir?

  **A) Orada yaşayanlar derin bir sükunet içindeydi.** · B) Komşular gündelik koşuşturmalarını sürdürdü. · C) Herkes ortamda giderek artan bir endişe hissediyordu. · D) Mahallede belirsizlik ve kaygı hâkim olmuştu. · E) Topluluk tartışmanın etkisiyle tedirginlik yaşadı.

**Sonra:** Akşam geç saatlerde apartman koridorunda çıkan tartışma, komşuların <u>huzursuzluk</u> duymasına neden oldu. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün karşıt anlamlısı aşağıdakilerin hangisinde kullanılmıştır?

- **A) Orada yaşayanlar derin bir sükûnet içindeydi.**
- B) Komşular gündelik koşuşturmalarını sürdürdü.
- C) Herkes ortamda giderek artan bir endişe hissediyordu.
- D) Mahallede belirsizlik ve kaygı hâkim olmuştu.
- E) Topluluk tartışmanın etkisiyle tedirginlik yaşadı.

### 95. QZ-6136DDA96EE14142850738797EC04974 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: B

> Sorun: Soru doğruydu; altı çizili sözcüklerin işaretleme kaydı yoktu, çözüm yenilendi.

**Önce:** I. Kitabın <u>kapağı</u> parlak süslerle bezeliydi. ⏎ II. Sözleri dinleyenlerin gönlüne <u>dokundu</u>. ⏎ III. Hastanın <u>baş</u> ağrısı gece boyunca devam etti. ⏎ Numaralanmış cümlelerde altı çizili sözcüklerin anlam özellikleri aşağıdakilerden hangisinde sı…

  A) Mecaz anlam - Yan anlam - Temel anlam · **B) Yan anlam - Mecaz anlam - Temel anlam** · C) Temel anlam - Mecaz anlam - Yan anlam · D) Yan anlam - Temel anlam - Mecaz anlam · E) Temel anlam - Yan anlam - Mecaz anlam

**Sonra:** I. Kitabın <u>kapağı</u> parlak süslerle bezeliydi. ⏎ II. Sözleri dinleyenlerin gönlüne <u>dokundu</u>. ⏎ III. Hastanın <u>baş</u> ağrısı gece boyunca sürdü. ⏎ ⏎ Numaralanmış cümlelerdeki altı çizili sözcüklerin anlam özellikleri aşağıdakilerin hangisinde sırasıyla verilmiştir?

- A) Mecaz anlam - Yan anlam - Temel anlam
- **B) Yan anlam - Mecaz anlam - Temel anlam**
- C) Temel anlam - Mecaz anlam - Yan anlam
- D) Yan anlam - Temel anlam - Mecaz anlam
- E) Temel anlam - Yan anlam - Mecaz anlam

### 96. QZ-61C02A75BC12406F98EF213880954309 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: E

> Sorun: Hedef sözcükler işaretlenmemişti; gereksiz giriş cümlesi vardı.

**Önce:** Metindeki ifadeleri inceleyiniz. ⏎ I. Uzman doktor çocuğun göz muayenesini dikkatle yaptı. ⏎ II. Yeni açılan program, şirketin göz bebeği oldu. ⏎ III. Kedinin parlak gözleri karanlıkta görüldü. ⏎ Yukarıdakilerden hangileri "göz" sözcüğünün mecaz anlamıyla kull…

  A) Yalnız III · B) Yalnız I · C) II ve III · D) I ve II · **E) Yalnız II**

**Sonra:** I. Uzman doktor, çocuğun <u>göz</u> muayenesini dikkatle yaptı. ⏎ II. Yeni açılan program, kısa sürede şirketin <u>göz bebeği</u> oldu. ⏎ III. Kedinin parlak <u>gözleri</u> karanlıkta seçiliyordu. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili söz mecaz anlamda kullanılmıştır?

- A) Yalnız III
- B) Yalnız I
- C) II ve III
- D) I ve II
- **E) Yalnız II**

### 97. QZ-61D2E5687F854ECA99895C6ACC02ADCB · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: D

> Sorun: Soru kavramsal olarak yanlıştı: “domates” sözcüğü nitel ya da nicel anlam taşımaz; nicel olan onunla kullanılan “yirmi kilo” sözüdür. Altı çizgi yanlış sözcükteydi.

**Önce:** Kent pazarına ilişkin kısa bilgi: Tezgâhlarda satılan ürünler hem görünüşleri hem de miktarlarıyla değerlendiriliyordu. Aşağıdaki cümlelerde "domates" sözcüğü farklı bağlamlarda kullanılmıştır. ⏎ I. Tezgâhın önünde duran <u>domates</u>lerin rengi parlak kırmız…

  A) Yalnız I · B) Yalnız III · C) II ve III · **D) Yalnız II** · E) I ve II

**Sonra:** I. Tezgâhtaki domateslerin rengi <u>parlak</u> kırmızıydı. ⏎ II. Tezgâhta günde <u>yirmi</u> kilo domates satılıyordu. ⏎ III. Akşam yemeğinde <u>taze</u> domateslerle salata yapıldı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük nicel (sayı, miktar bildiren) anlamdadır?

- A) Yalnız I
- B) Yalnız III
- C) II ve III
- **D) Yalnız II**
- E) I ve II

### 98. QZ-622FAB076A6F498BA1923B51A83319D0 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: E

> Sorun: II. cümlede anlatım bozukluğu vardı (“Başarı haberi, takımın göğüsleri kabardı”); hedef sözcükler işaretlenmemişti.

**Önce:** Aşağıdaki cümlelerde geçen göğüs sözcüğü farklı bağlamlarda kullanılmıştır. I. Doktor, hastanın göğüs röntgenine baktı. II. Başarı haberi, takımın göğüsleri kabardı. III. Savaşta kentliler, gençlerin göğsünü siper edenleri andı. Yukarıdakilerden hangilerinde g…

  A) Yalnız III · B) Yalnız II · C) I, II ve III · D) Yalnız I · **E) II ve III**

**Sonra:** I. Doktor, hastanın <u>göğüs</u> röntgenine baktı. ⏎ II. Şampiyonluk haberiyle bütün takımın <u>göğsü</u> kabardı. ⏎ III. Kentliler, savaşta <u>göğsünü</u> siper eden gençleri rahmetle andı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük mecaz anlamda kullanılmıştır?

- A) Yalnız III
- B) Yalnız II
- C) I, II ve III
- D) Yalnız I
- **E) II ve III**

### 99. QZ-645D1076C0164859B8665BC8ADAC9CBE · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: D

> Sorun: Hedef sözcük çizili değil, tırnakla verilmişti.

**Önce:** Soruya verilen yanıt beklenen ölçüde açıklayıcı değildi; öğrencinin düşüncesi tam anlaşılmadı. Bu cümlede 'yanıt' sözcüğünün yerine kullanılabilecek en yakın eş anlamlı sözcük hangisidir?

  A) çözüm · B) açıklama · C) tahmin · **D) cevap** · E) görüş

**Sonra:** Soruya verilen <u>yanıt</u> beklenen ölçüde açıklayıcı değildi; öğrencinin düşüncesi tam anlaşılmadı. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün yerine anlamı değiştirmeden aşağıdakilerden hangisi getirilebilir?

- A) çözüm
- B) açıklama
- C) tahmin
- **D) cevap**
- E) görüş

### 100. QZ-64739633F96F47D39D448C8B93548A82 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Soru “inceleme” sözcüğünü soruyordu ama sorulan anlam yalnızca “kaba” sıfatından geliyordu; şıklar ayrıntılı ve birbirine yakın tanımlardı, tek doğru belirsizdi.

**Önce:** Bir derlemede yapılan kaba inceleme, birçok sözcüğün günümüzdeki kullanımıyla etimolojik kökeninin örtüşmediğini ortaya koydu. Bu bağlamda "inceleme" sözcüğünün cümlede hangi anlamda kullanıldığını belirleyiniz.

  A) Çevre bilincinin artışına ilişkin sayısal verileri ve ayrınt… · B) Yaptırılacak yapının tüm teknik ayrıntılarını gösteren kapsa… · **C) Belirli bir konuda sorunları ve çözüm önerilerini ana hatlar…** · D) Bir eseri değersizleştirmek amacıyla yapılmış eleştirel yoru… · E) Resim çalışmasında son esere geçmeden önce yapılan ilk kaba …

**Sonra:** Aşağıdaki cümlelerin hangisinde “çıkmak” sözcüğü “belli olmak, anlaşılmak” anlamında kullanılmıştır?

- A) Yağmur dinince çocuklar hemen bahçeye çıktı.
- B) Yaşlı adam merdivenleri ağır ağır çıktı.
- **C) Yapılan araştırmada pek çok sözcüğün kökenindeki anlamdan uzaklaştığı ortaya çıktı.**
- D) Gömleğindeki leke ikinci yıkamada çıktı.
- E) Babam her sabah erkenden işe çıkar.

### 101. QZ-65629BDD61E34B25962920A48FDEAE01 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Şıklar birbiriyle örtüşüyordu (“azaltmak” ile “eksiltmek”, “büzmek” ile “biraz kapamak”); aynı kullanım iki şıkla karşılanabildiği için soru güvenilir değildi.

**Önce:** Gece yarısı yorgun ve uykusuz olduğu için göz kapaklarını kıstı; düşünceleri dağılmasın diye lambayı biraz kısmak gerektiğini düşündü, yakacaktan tasarruf etmek amacıyla harcamayı kısmak zorunda olduğunu hatırladı. Bu parçada geçen "kısmak" sözcüğü aşağıdaki a…

  A) Eksiltmek, miktarı sınırlandırmak · B) Azaltmak veya düzeyi alçaltmak · **C) Yatıştırmak, sakinleştirmek ya da teskin etmek** · D) Büzmek, daraltmak veya gözleri kısmak · E) Biraz kapamak, kısıtlı biçimde kapatma

**Sonra:** Sabah erkenden kalkan Ali, perdeleri <u>açınca</u> havanın da <u>açtığını</u> gördü. Haberleri dinlemek için radyoyu <u>açtı</u>. Kahvaltıda babası, yıllardır hayalini kurduğu kitapçıyı <u>açma</u> isteğini yeniden gündeme getirdi. ⏎ ⏎ Bu parçadaki altı çizili sözcükler, aşağıdaki anlamlardan hangisini karşılayacak biçimde kullanılmamıştır?

- A) Kapalı olanı açık duruma getirmek
- B) Bulutların dağılıp havanın aydınlanması
- **C) Bir konudan söz etmeye başlamak**
- D) Bir aracı çalıştırmak
- E) Bir işyeri kurup çalışmaya başlamak

### 102. QZ-65FFAC2BDD1A4243B887192F67EA2EED · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: C

> Sorun: “Etkili kalemlerden biri” (yazar) kullanımının yan anlam mı mecaz mı olduğu tartışmalıydı; şıklar gereksiz uzundu.

**Önce:** I. Masadaki kalemle sınav kâğıdına cevaplarını yazdı. II. Yerel gazetede yazdığı yazılarla tanınan o, kasabada en etkili kalemlerden biri sayılıyor. III. Çocuklar resim dersinde renkli kalemlerle figürler çizdiler. Yukarıdaki cümlelerden hangisinde aynı sözcüğ…

  A) I. ve III. cümlelerinde kullanılmıştır. · B) I. ve II. cümlelerinde kullanılmıştır. · **C) II. cümlede kullanılmıştır.** · D) I. cümlede kullanılmıştır. · E) III. cümlede kullanılmıştır.

**Sonra:** I. Sabah kalktığında <u>başı</u> çok ağrıyordu. ⏎ II. Kardeşim beni yolun <u>başında</u> bekliyordu. ⏎ III. Çocuk, <u>başını</u> annesinin omzuna yasladı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük yan anlamıyla kullanılmıştır?

- A) I ve III
- B) I ve II
- **C) Yalnız II**
- D) Yalnız I
- E) Yalnız III

### 103. QZ-6BC2B3274B734BD8ABA36E5DC88FA58D · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: III. cümledeki “roman” bir edebiyat türü olarak terim sayılabileceğinden yanıt tartışmalıydı; I. cümle anlamsızdı; sözcükler tırnakla verilmişti.

**Önce:** Aşağıdaki kısa açıklamada numaralanmış sözcüklerin kullanımı verilmiştir. Her bir numaralı cümle kendi bağlamında değerlendirilmelidir. ⏎ I. Bahçe köşesindeki çiçeğe komşu çocuklar 'kırmızı' demeyi tercih ettiler. ⏎ II. Hastanın raporunda görüntüleme sonuçları…

  A) II ve III · B) I, II ve III · **C) Yalnız II** · D) Yalnız I · E) I ve II

**Sonra:** I. Bahçedeki <u>kırmızı</u> çiçekler bu sabah açmıştı. ⏎ II. Hastanın raporunda görüntüleme sonuçlarına göre <u>inme</u> tanısı yer aldı. ⏎ III. Salonda oturan kişi raflardan bir <u>kitap</u> seçti. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- A) II ve III
- B) I, II ve III
- **C) Yalnız II**
- D) Yalnız I
- E) I ve II

### 104. QZ-75788070F4DD4C9BA21B66AB0F636D32 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: A

> Sorun: “Yüzü kış gibiydi” bir benzetmedir; “kış” sözcüğünün kendisi mecaz kazanmadığından yanıt tartışmalıydı.

**Önce:** Öyküde, tanımlanan kişinin soğuk davrandığı anlatılırken cümlede altı çizili sözcük kullanılmıştır: Yüzü <u>kış</u> gibiydi. Bu kullanımda altı çizili sözcükle kastedilen aşağıdakilerden hangisidir?

  **A) Sözcüğün mecaz anlamıyla kişinin duygusal olarak soğuk ve uz…** · B) Sözcüğün yan anlamıyla yüzün bir bölümünün tipleştirildiği b… · C) Sözcüğün genel anlamıyla çevresel yaşam koşullarının olumsuz… · D) Sözcüğün bedensel anlamıyla yüzün fiziksel solgunluğu anlatı… · E) Sözcüğün gerçek anlamıyla mevsimsel ve fiziksel olarak soğuk…

**Sonra:** Kardeşinin <u>soğuk</u> bakışları karşısında söyleyecek söz bulamadı. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün kullanımıyla ilgili aşağıdakilerden hangisi doğrudur?

- **A) Mecaz anlamıyla kişinin ilgisiz ve mesafeli olduğu anlatılmıştır.**
- B) Yan anlamıyla gözün bir bölümü adlandırılmıştır.
- C) Genel anlamıyla bütün bakış türleri kastedilmiştir.
- D) Terim anlamıyla bir bilim dalına özgü kavram karşılanmıştır.
- E) Gerçek anlamıyla sıcaklığın düşük olduğu belirtilmiştir.

### 105. QZ-7B7E201745A142EA8156ECD42A2C2040 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: B

> Sorun: Kök “bu sözcüğün” diyordu ama hangi sözcüğün sorulduğu işaretlenmemişti.

**Önce:** Her yeni fikre ve etkinliğe kapalı bir karaktere sahipti. Aşağıdakilerden hangisinde bu sözcüğün bu cümledeki anlamına karşıt bir kullanım vardır?

  A) Kışın pencereler çoğu gün dış etkenlere kapalı olur. · **B) Farklı görüşlere ve yeni fikirlere her zaman açık davranır.** · C) Yeni önerilere genellikle kapalı kalır; değişime mesafe koya… · D) Toplantı gerektiğinde kapalı oturumlarda yapılır. · E) Gözleri kapalı olduğu için yolu göremiyordu.

**Sonra:** Her yeni fikre ve etkinliğe <u>kapalı</u> bir karaktere sahipti. ⏎ ⏎ Aşağıdakilerin hangisinde, bu cümledeki altı çizili sözcüğün anlamca karşıtı olan bir kullanım vardır?

- A) Kışın pencereler çoğu gün dış etkenlere kapalı olur.
- **B) Farklı görüşlere ve yeni fikirlere her zaman açık davranır.**
- C) Yeni önerilere genellikle kapalı kalır, değişime mesafe koyar.
- D) Toplantı gerektiğinde kapalı oturumlarda yapılır.
- E) Gözleri kapalı olduğu için yolu göremiyordu.

### 106. QZ-7D59CD0FCE3240BC8169801AAC353CA1 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: “Keder” dışında “tasa” ve “sıkıntı” şıkları da “hüzün”e yakın anlamlı olduğundan birden çok doğru cevap vardı.

**Önce:** Bir günlük kaydında şu cümle var: 'Sınavdan düşük alınca içimde derin bir <u>hüzün</u> oluştu; günlerce neşelenemedim.' Bu bağlamda altı çizili sözcüğün en yakın anlamlısını seçiniz.

  **A) Keder** · B) Tasa · C) Neşe · D) Sevinç · E) Sıkıntı

**Sonra:** Sınavdan düşük not alınca içimde derin bir <u>hüzün</u> oluştu; günlerce neşelenemedim. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamca en yakını aşağıdakilerden hangisidir?

- **A) Keder**
- B) Öfke
- C) Neşe
- D) Sevinç
- E) Merak

### 107. QZ-7DBB09E49D824622AFA913CAED72A991 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Soru kavramsal olarak yanlıştı: “deneyim” sözcüğü nitel ya da nicel anlam taşımaz; nicel olan onunla kullanılan “beş yıllık” sözüdür.

**Önce:** Bir işe alım komisyonu, görüşmelerde adayların farklı yönlerini değerlendirmek için aynı sözcüğü çeşitli cümlelerde kullandı. Komisyon üyeleri, bu sözcüğün nitel (özellik belirten) ya da nicel (sayı/ölçü belirten) kullanımını ayırt etmek istiyor. Aşağıdaki cüm…

  **A) Adayın beş yıllık deneyimleri işe başvurusu için yeterli bul…** · B) Özgeçmişindeki deneyimler, ekibin aradığı özellikleri yansıt… · C) Ekip, adayın farklı alanlardaki deneyimlerini örneklerle tar… · D) Proje sürecindeki deneyimleri onun yaklaşımını şekillendirdi… · E) Görüşmede anlattığı deneyimler ekibin bakış açısını değiştir…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili söz nicel (sayı, ölçü bildiren) anlamdadır?

- **A) Adayın <u>beş yıllık</u> deneyimi işe başvurusu için yeterli bulundu.**
- B) Adayın <u>zengin</u> deneyimi ekibin dikkatini çekti.
- C) Ekip, adayın <u>farklı</u> alanlardaki deneyimlerini tartıştı.
- D) Proje sürecindeki <u>değerli</u> deneyimleri onun yaklaşımını şekillendirdi.
- E) Görüşmede anlattığı <u>etkileyici</u> deneyimler ekibin bakış açısını değiştirdi.

### 108. QZ-7DDCF72A655540BF8B7609FAEF7870AB · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: C

> Sorun: Şıklar karışık ve birbirine yakın tanımlardı (B şıkkı anlamsızdı); kısa ve açık anlam türü adlarına çevrildi.

**Önce:** Genç kız günlük defterine şu cümleyi yazdı: 'Bugün içimde tarifsiz bir <u>umut</u> taşıyorum.' Bu cümledeki altı çizili sözcüğün kullanımına göre sözcük hangi anlam türüne girer?

  A) Bir bilim veya meslek alanına özgü teknik bir terim anlamınd… · B) Mecazla gerçek bir nesneye gönderme yapan kullanım söz konus… · **C) Zihinde var olan bir duygu veya düşünceyi ifade eder.** · D) Fiziksel bir olguyu anlatan somut bir kullanım içermektedir. · E) Beş duyu organıyla algılanabilen bir nesneyi ifade eder.

**Sonra:** Bugün içimde tarifsiz bir <u>umut</u> taşıyorum. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Terim anlamlıdır.
- B) Somut anlamlıdır.
- **C) Soyut anlamlıdır.**
- D) Yansıma bir sözcüktür.
- E) Nicel anlamlıdır.

### 109. QZ-7F79C8D16D514B52BF4056DE0AEAE3F1 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Kesme işaretleri çizginin dışında kalmıştı (“<u>bölüm</u>'de”); “vurgulanan” ifadesi gösterilemeyen bir vurgu iddia ediyordu.

**Önce:** Bir yazar yeni romanının ilk baskısında her <u>bölüm</u> için ayrı düzenleme yaptı; öğrenciler kayıt sırasında hangi <u>bölüm</u>'de okuyacaklarını belirledi; fabrikada üretim hatlarının her biri farklı bir <u>bölüm</u> olarak çalışıyordu; ayrıca ilin hastanes…

  A) Bir metnin veya eserin parçası olan kısım · **B) Televizyon ya da dizinin yayımlanan sıra parçası** · C) Bir iş yerinde üretim veya hizmet yürüten birim · D) Üniversitede eğitim veren bir akademik birim · E) Hastanedeki cerrahi veya benzeri servis niteliğindeki bölüm

**Sonra:** Bir yazar, yeni romanının ilk baskısında her <u>bölüm</u> için ayrı düzenleme yaptı. Üniversiteyi kazanan öğrenciler, kayıt sırasında hangi <u>bölümde</u> okuyacaklarını belirledi. Fabrikada üretim hatlarının her biri ayrı bir <u>bölüm</u> olarak çalışıyordu. İlin hastanesinde cerrahi <u>bölümü</u> en yoğun servislerden biriydi. ⏎ ⏎ Bu parçadaki altı çizili sözcükler, aşağıdaki anlamlardan hangisini karşılayacak biçimde kullanılmamıştır?

- A) Bir eserin parçası olan kısım
- **B) Bir dizinin her gün yayımlanan parçası**
- C) Bir iş yerinde üretim yapan birim
- D) Üniversitede eğitim veren birim
- E) Hastanede belirli bir alanda hizmet veren servis

### 110. QZ-81BE052183964310B17636EF880BC99A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: A

> Sorun: Hedef sözcük işaretlenmemişti; giriş cümlesi gereksizdi.

**Önce:** Aşağıdaki üç cümlede aynı sözcük farklı anlamlarda kullanılmıştır. I–III arasından hangisinde bu sözcüğün özel anlamıyla kullanımı vardır? ⏎ ⏎ I. Okumayı sevenlerin günlük yaşamında kitap her zaman önemli bir araçtır. ⏎ II. Masadaki kitabı rafta duran kırmızı …

  **A) Yalnız II** · B) Yalnız I · C) Yalnız III · D) II ve III · E) I ve II

**Sonra:** I. Okumayı sevenler için <u>kitap</u> her zaman önemli bir araçtır. ⏎ II. Masadaki <u>kitabı</u> raftaki kırmızı ciltli kitaptan ayırdım. ⏎ III. Ders programında her hafta bir <u>kitap</u> incelemesi yapılacak. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük özel anlamda kullanılmıştır?

- **A) Yalnız II**
- B) Yalnız I
- C) Yalnız III
- D) II ve III
- E) I ve II

### 111. QZ-87D153C120D7486F9FA48E029A102178 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: E

> Sorun: Şıklar gereksiz uzundu; I. cümlede anlatım bozukluğu vardı (“kuşların cıvıldadığı sesler uyandırdı”).

**Önce:** Aşağıdaki cümlelerde bazı sözcüklerin kaynağı yansıma (doğadaki sesleri taklit etme) türündendir. I. Sabah bahçede kuşların cıvıldadığı sesler uyandırdı. II. Sokaktan geçen bisikletin tıngır tıngır sesi uzaklardan geliyordu. III. Eski kitapların sayfalarından …

  A) Yalnız III numaralı cümlede yansıma sözcükten türemiş bir sö… · B) I ve II numaralı cümlelerde yansıma sözcükten türemiş sözcük… · C) Yalnız I numaralı cümlede yansıma sözcükten türemiş bir sözc… · D) Yalnız II numaralı cümlede yansıma sözcükten türemiş bir söz… · **E) Yalnız IV numaralı cümlede yansıma sözcükten türemiş bir söz…**

**Sonra:** I. Sabah bahçedeki kuşların cıvıltısı beni uyandırdı. ⏎ II. Sokaktan geçen eski bisikletin tıngır tıngır sesi uzaklardan geliyordu. ⏎ III. Eski kitapların sayfalarından hafif bir hışırtı yükseliyordu. ⏎ IV. Öğrenciler ders sırasında not aldı ve öğretmene sorular yöneltti. ⏎ ⏎ Yukarıdakilerin hangisinde yansıma bir sözcük yoktur?

- A) Yalnız III
- B) I ve II
- C) Yalnız I
- D) Yalnız II
- **E) Yalnız IV**

### 112. QZ-8F68D0A379AC4F2A8B89FEB8B50D14A2 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: D

> Sorun: Çözüm doğru şıkkı “b” olarak gösteriyordu (doğru cevap D); kök gereksiz uzundu.

**Önce:** Bir dergide yayımlanmak üzere seçilen kısa cümlelerden, verilen sözcüğün temel anlamından tamamen uzaklaşarak kullanıldığı örneği belirleyiniz. Aşağıdakilerden hangisinde "taş" sözcüğü mecaz anlamlıdır?

  A) Bahçedeki patika doğal taşlarla döşenmişti. · B) Köy meydanındaki tarihi taş yıllardır yerinde duruyor. · C) İnşaat ekibi duvarın üzerine birkaç büyük taş yerleştirdi. · **D) Uzun ihanetler onu duygusuz, adeta taş hâline getirmişti.** · E) Saatin çalışma mekanizmasının en küçük taşı dikkatle temizle…

**Sonra:** Aşağıdaki cümlelerin hangisinde “taş” sözcüğü mecaz anlamda kullanılmıştır?

- A) Bahçedeki patika doğal taşlarla döşenmişti.
- B) Köy meydanındaki tarihî taş yıllardır yerinde duruyor.
- C) İnşaat ekibi duvarın üzerine birkaç büyük taş yerleştirdi.
- **D) Yaşadığı acılar onu duygusuz, adeta bir taş hâline getirmişti.**
- E) Ustası, saatin mekanizmasındaki küçük taşı dikkatle temizledi.

### 113. QZ-92C4183B1743456E81A1610961FBAAE7 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: D

> Sorun: I. örnek yanlıştı: oturulan “bank” ile para kurumu “banka” ayrı sözcüklerdir, eş sesli değildir; çizgiler yalnızca bir sözcükte vardı ve kök 'altı çizili' demiyordu.

**Önce:** Aşağıda üç örnek verilmiştir. Her örnekte aynı sözcük farklı anlamlarda kullanılmıştır. Sözcüklerin anlamları arasında bağ olup olmadığını değerlendiriniz. ⏎ ⏎ I. "Sabah iş yerine giderken karşı sokaktaki <u>banka</u>'ya oturdum; sonra bankaya kredi başvurusu …

  A) Yalnız II · B) I ve II · C) Yalnız III · **D) I ve III** · E) Yalnız I

**Sonra:** I. Çocuk <u>yüzünü</u> yıkadı, ardından <u>yüz</u> sayfalık kitabını okumaya başladı. ⏎ II. Tasarımcı koltuğun <u>kolunu</u> genişletti; doktor da hastanın sol <u>kolunu</u> muayene etti. ⏎ III. Köyün yakınındaki <u>çay</u> boyunca yürüdüler; akşam da <u>çay</u> demleyip sohbet ettiler. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcükler birbiriyle eş seslidir?

- A) Yalnız II
- B) I ve II
- C) Yalnız III
- **D) I ve III**
- E) Yalnız I

### 114. QZ-957348F5568F4E769FEF5B3CF56C33F6 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: C

> Sorun: I. cümledeki “sandalyenin kolu” da yan anlamlı olduğundan doğru kabul edilen “Yalnız II” yanlıştı; sözcük tırnakla soruluyordu.

**Önce:** I. Sandalyenin kolu kırıldığı için tamir edilmesi gerekti. II. Şirketin pazarlama kolu yeni kampanya için toplantıya başladı. III. Ressam, portrede figürün kolunu ayrıntılı çalışmış. Yukarıdakilerden hangisinde "kol" sözcüğünün yan anlamı kullanılmıştır?

  A) Yalnız III · B) I ve II · **C) Yalnız II** · D) Yalnız I · E) II ve III

**Sonra:** I. Çocuk bisikletten düşünce <u>kolunu</u> incitti. ⏎ II. Şirketin pazarlama <u>kolu</u> yeni kampanya için toplandı. ⏎ III. Ressam, portredeki figürün <u>kolunu</u> ayrıntılı çalışmış. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük yan anlamıyla kullanılmıştır?

- A) Yalnız III
- B) I ve II
- **C) Yalnız II**
- D) Yalnız I
- E) II ve III

### 115. QZ-99990258766344AE87AD40627D016852 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: B

> Sorun: Sorulan “yalın” sözcüğü kökte hiç geçmiyordu; soru çözülemiyordu.

**Önce:** Eleştirmen, yazarın konu hakkındaki bilgisinin eksik olduğunu belirtti; metindeki 'yalın' sözcüğünün anlamına uygun kullanım hangisidir?

  A) Eserdeki anlatım zenginliği, dinleyici ve okurun üzerinde gü… · **B) Yazarın denemeleri, konuları derinlemesine incelemeden yüzey…** · C) Toplantıya katılanlar, gösterişten uzak sade bir giyim terci… · D) Eleştirmenin tavrı, olay karşısında ölçülü ve soğukkanlı bir… · E) Mekan, ayrıntılarla o kadar doluydu ki ziyaretçinin dikkatin…

**Sonra:** Eleştirmen, yazarın bu konudaki bilgisini <u>yalınkat</u> bulduğunu söyledi. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamına uygun bir kullanım aşağıdakilerin hangisinde vardır?

- A) Eserdeki anlatım zenginliği okur üzerinde güçlü bir etki bıraktı.
- **B) Yazarın denemeleri, konuları derinlemesine incelemeden yüzeysel biçimde ele alıyordu.**
- C) Toplantıya katılanlar, gösterişten uzak sade bir giyim tercih etti.
- D) Eleştirmenin tavrı, olay karşısında ölçülü ve soğukkanlı bir duruş sergilediğini gösteriyordu.
- E) Salon ayrıntılarla o kadar doluydu ki ziyaretçiler dikkatlerini toplayamıyordu.

### 116. QZ-9AF912D3B95D4EDE9ABF63271094FB4E · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: A

> Sorun: II. örnekteki mimarlık kullanımı da terim sayılabileceğinden yanıt tartışmalıydı; sözcük tırnakla soruluyordu.

**Önce:** Aşağıda aynı sözcüğün farklı bağlamlardaki kullanımlarına ilişkin kısa örnekler verilmiştir. I. Yazılım dersinde modül, belirli bir işlevi yerine getiren bağımsız program birimidir. II. Mimarlık raporunda modül, bir binanın estetik parçası olarak tanımlanmıştı…

  **A) Yalnız I** · B) Yalnız III · C) I ve II · D) II ve III · E) Yalnız II

**Sonra:** I. Yazılım dersinde her <u>modül</u>, belirli bir işlevi yerine getiren program birimi olarak tanıtıldı. ⏎ II. Bu yaz bahçeye yeni bir <u>salıncak</u> kurduk. ⏎ III. Kardeşim akşam yemeğinden sonra <u>bulaşıkları</u> yıkadı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- **A) Yalnız I**
- B) Yalnız III
- C) I ve II
- D) II ve III
- E) Yalnız II

### 117. QZ-9B6F369A8CD049C6A58AE212B58F201C · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: E

> Sorun: I. cümledeki “evin başı” anlamsızdı; II. cümledeki “taş gibi” bir benzetmeydi, III. cümledeki yağmur birikintisine “göl” denmesi temel anlam değildi.

**Önce:** I. Mahallenin eski evinin <u>başı</u> onarılamayacak kadar zarar görmüştü. ⏎ II. Konuşmanın tonu öylesine soğuktu ki salon bir anda <u>taş</u> gibi oldu. ⏎ III. Yağmurdan sonra bahçede ortaya çıkan küçük bir <u>göl</u> kuşları çekti. ⏎ Numaralanmış cümlelerde …

  A) I numara: mecaz anlam, II numara: yan anlam, III numara: tem… · B) I numara: temel anlam, II numara: yan anlam, III numara: mec… · C) I numara: temel anlam, II numara: mecaz anlam, III numara: y… · D) I numara: yan anlam, II numara: temel anlam, III numara: mec… · **E) I numara: yan anlam, II numara: mecaz anlam, III numara: tem…**

**Sonra:** I. Yolun <u>başında</u> eski bir çeşme vardı. ⏎ II. Onun <u>soğuk</u> tavrı salondakileri rahatsız etti. ⏎ III. Köyün kenarındaki <u>gölde</u> ördekler yüzüyordu. ⏎ ⏎ Numaralanmış cümlelerdeki altı çizili sözcüklerin anlam özellikleri aşağıdakilerin hangisinde sırasıyla verilmiştir?

- A) Mecaz anlam - Yan anlam - Temel anlam
- B) Temel anlam - Yan anlam - Mecaz anlam
- C) Temel anlam - Mecaz anlam - Yan anlam
- D) Yan anlam - Temel anlam - Mecaz anlam
- **E) Yan anlam - Mecaz anlam - Temel anlam**

### 118. QZ-9D391F047B8E42B1B645916E0DBBF9C1 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: C

> Sorun: Şıklarda anlatım bozuklukları vardı (“cıvıldamalar sabahı müjdeledi”, “tıkırtılar sesi”); kökte gereksiz açıklamalar vardı.

**Önce:** Aşağıdaki cümlelerin hangisinde yansıma (onomatopoeik) kökenli bir sözcükten türemiş bir sözcük bulunmamaktadır? Her cümle tek bir yargı niteliğindedir; doğru cevabı belirleyin.

  A) Koridorda bir hırıltı duyuldu, karanlıkta yankılandı. · B) Pencerede cıvıldamalar sabahı müjdeledi. · **C) Bu rapor dikkatle incelendi mi?** · D) Birden patırtılar başladı, raflar sallandı. · E) Kahvaltıda tıkırtılar sesi rahatsız etti.

**Sonra:** Aşağıdaki cümlelerin hangisinde yansıma bir sözcük yoktur?

- A) Koridorda bir hırıltı duyuldu, karanlıkta yankılandı.
- B) Pencerenin önündeki kuşlar sabahtan beri cıvıldıyordu.
- **C) Bu rapor dikkatle incelendi mi?**
- D) Birden patırtılar başladı, raflar sallandı.
- E) Kahvaltıda kaşıkların tıkırtısı herkesi rahatsız etti.

### 119. QZ-A55845258FB24C08BA89E6E9DA3A07B3 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Kök “vurgulanan sözcük” diyor ama hiçbir sözcük işaretli değildi; A şıkkı da (“ana hatları tasarladı”) aynı anlamı karşılayabildiğinden yanıt belirsizdi.

**Önce:** Bir dil çalışmasında araştırmacılar, sözcüklerin tarihî kökeniyle günümüzdeki kullanımının çoğu zaman örtüşmediğini saptamış; çalışmaların bir kısmında ise ayrıntıya girilmeden yalnızca kaba bir değerlendirme yapılmış. Bu paragrafta vurgulanan sözcüğün bağlamd…

  A) Ressam, portre çalışmasına başlamadan önce ana hatları dikka… · B) Mimar, yapının her ölçüsünü ve malzeme seçimini titizlikle b… · **C) Eğitim programı değişiklikleri, ayrıntılara girilmeden özet …** · D) Eleştirmen, eserin değerini küçültmek amacıyla küçümseyici b… · E) Belediye, çevre raporunu son beş yılın verileriyle eksiksiz …

**Sonra:** Bir dil çalışmasında araştırmacılar, sözcüklerin tarihî kökeniyle günümüzdeki kullanımının çoğu zaman örtüşmediğini saptamış; çalışmaların bir kısmında ise ayrıntıya girilmeden yalnızca <u>kaba</u> bir değerlendirme yapılmış. ⏎ ⏎ Bu parçadaki altı çizili sözcüğün bağlamdaki anlamı aşağıdakilerin hangisinde vardır?

- A) Ressam, portredeki her ayrıntıyı uzun uğraşlarla işledi.
- B) Mimar, yapının her ölçüsünü ve malzemesini titizlikle belirleyip çizimini tamamladı.
- **C) Eğitim programındaki değişiklikler, ayrıntılara girilmeden özet bir plan hâlinde komisyona sunuldu.**
- D) Eleştirmen, eserin değerini küçültmek amacıyla küçümseyici bir dil kullanmıştı.
- E) Belediye, çevre raporunu son beş yılın verileriyle eksiksiz biçimde yayımladı.

### 120. QZ-A6E632DAB09C43F488591AFF7CD42974 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: C

> Sorun: Çözüm doğru cevabı A olarak gösteriyordu (doğrusu C); D şıkkında anlatım bozukluğu vardı.

**Önce:** Aşağıdaki cümlelerin her birinde "taşımak" sözcüğü farklı anlamlarda kullanılmıştır. Bu cümlelerden hangisinde sözcük "bir nesneyi bir yerden başka bir yere fiziksel olarak götürmek" anlamında kullanılmıştır?

  A) Aile, atalarının anılarını nesilden nesile taşımaya özen gös… · B) Bu sözcük metinde şiirsel bir ağırlık taşıyor. · **C) İşçiler malları fabrikadan depoya taşıdı.** · D) Proje, sorumluluğu tek bir kişide taşımamayı hedefliyor. · E) Şair şiirlerinde kentin hüznünü okura taşımaya çalışır.

**Sonra:** Aşağıdaki cümlelerin hangisinde “taşımak” sözcüğü “bir şeyi bir yerden başka bir yere götürmek” anlamında kullanılmıştır?

- A) Aile, atalarının anılarını kuşaktan kuşağa taşımaya özen gösteriyor.
- B) Bu sözcük metinde şiirsel bir ağırlık taşıyor.
- **C) İşçiler malları fabrikadan depoya taşıdı.**
- D) Proje yöneticisi ekibin bütün sorumluluğunu tek başına taşıyordu.
- E) Şair, şiirlerinde kentin hüznünü okura taşımaya çalışır.

### 121. QZ-A7DB3BDFD9534F2FB041FD310332FCAA · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: C

> Sorun: Kök “paragrafta geçen umut sözcüğü” diyordu ama “umut” paragrafta geçmiyordu; şıklar gereksiz uzundu.

**Önce:** Kuraklık yüzünden verim düşen köyde kimi çiftçiler tarlalara yeni fidan dikme planları yaptı; bazıları geleceğe dair beklentilerini ifade ederken paragrafta geçen umut sözcüğünü güçlü bir duygusal istek olarak kullanmıştı. Bu kullanıma göre sözcüğün anlam özel…

  A) Hem somut hem soyut bir anlam taşır; cümlenin bağlamında nes… · B) Somut bir kavramdır; çünkü paragrafta fiziksel bir nesneye i… · **C) Soyut bir kavramdır; çünkü duygusal ve zihinsel bir beklenti…** · D) Özel bir terimdir; paragrafta bilimsel veya mesleki bir kavr… · E) Mecaz anlamlıdır; burada kelime gerçek bir nesne yerine benz…

**Sonra:** Kuraklık yüzünden verimin düştüğü köyde çiftçiler, gelecek yıl için yeni fidanlar dikerek <u>umutlarını</u> tazeledi. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Hem somut hem soyut anlam taşır.
- B) Somut anlamlıdır; elle tutulabilen bir nesneyi karşılar.
- **C) Soyut anlamlıdır; duyularla algılanamayan bir beklentiyi karşılar.**
- D) Terim anlamlıdır; bir bilim dalına özgüdür.
- E) Yansıma bir sözcüktür.

### 122. QZ-AA97A7B5AD1B47C997C2BD323E1A2E47 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: E

> Sorun: II. cümle anlamsızdı (“kafa hali çok iyiydi”); sözcük tırnakla soruluyordu.

**Önce:** I. Doktor yaralanan kişinin kafa travmasını inceledi. ⏎ II. Dün gece maçtan sonra onun kafa hali çok iyiydi. ⏎ III. Çalışırken kafa patlatmam gerekti. ⏎ Yukarıdaki numaralanmış cümlelerin hangisinde "kafa" sözcüğü gerçek anlamında kullanılmıştır?

  A) I ve II · B) II ve III · C) Yalnız II · D) Yalnız III · **E) Yalnız I**

**Sonra:** I. Doktor, yaralanan kişinin <u>kafasındaki</u> yarayı inceledi. ⏎ II. Sınav bitince <u>kafası</u> rahatladı. ⏎ III. Bu problemi çözmek için saatlerce <u>kafa</u> patlattım. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük gerçek anlamıyla kullanılmıştır?

- A) I ve II
- B) II ve III
- C) Yalnız II
- D) Yalnız III
- **E) Yalnız I**

### 123. QZ-AD6DBA7EC27D45DAA30BC3941CDF29E3 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: B

> Sorun: “Taş gibi” bir benzetmeydi, mecaz değildi; kök cevabı içinde açıklıyordu ve A şıkkı da aynı benzetmeyi kullandığından yanıt tartışmalıydı.

**Önce:** Öğrenciler sınav yaklaştıkça kaygı duymaya başladı; sınıftaki en sessiz Ali bile artık taş gibi görünüyordu çünkü duygularını dışa vurmuyordu. Bu bağlamda mecaz kullanımı en çok hangi cümlede karşılanır?

  A) Takımdaki lider, zorlu anlarda arkadaşlarına taş gibi dayana… · **B) Konuşurken gözleri dolmasına rağmen, o her zaman taş gibi ka…** · C) Dedikodular mahallede hızla yayıldı; haberler kulağından kul… · D) İnşaatta duvarı örmek için kalın taş bloklar sırayla dizildi… · E) Bahçedeki eski çeşmenin taş yüzeyi yıllar içinde aşınmıştı.

**Sonra:** Acı haberi duyan ağabeyi olduğu yerde <u>taş kesilmişti</u>; ne ağlıyor ne de konuşuyordu. ⏎ ⏎ Bu cümledeki altı çizili sözün anlamı aşağıdakilerin hangisinde vardır?

- A) Zor anlarda arkadaşlarına sağlam bir dayanak oldu.
- **B) Haberi duyunca olduğu yerde donup kaldı, hiçbir tepki veremedi.**
- C) Dedikodular mahallede kulaktan kulağa yayıldı.
- D) İnşaatta duvarı örmek için kalın taş bloklar dizildi.
- E) Bahçedeki eski çeşmenin taş yüzeyi yıllar içinde aşınmıştı.

### 124. QZ-B11995217F9043879FB1605B6F3AD12B · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: E

> Sorun: Numaralanmış sözcükler bir metin içinde verilmemiş, yalnızca listelenmişti; bağlamsız terim değerlendirmesi yapılamaz.

**Önce:** Konservatuvarda bir öğretmen yeni bir eseri prova ederken öğrencilere parça üzerinde durulması gereken noktaları anlattı. Metinde numaralanmış sözcükler: I. nota, II. çaba, III. duygu. Bu parçada numaralanmış sözcüklerden hangisi terim anlamıyla kullanılmıştır…

  A) III · B) I ve II · C) II ve III · D) II · **E) I**

**Sonra:** Konservatuvarda öğretmen, provada öğrencilerden her notaya (I) özen göstermelerini, bunun için büyük çaba (II) harcamalarını ve eseri çalarken içlerindeki duyguyu (III) dinleyiciye aktarmalarını istedi. ⏎ ⏎ Bu cümlede numaralanmış sözcüklerden hangileri terim anlamıyla kullanılmıştır?

- A) Yalnız III
- B) I ve II
- C) II ve III
- D) Yalnız II
- **E) Yalnız I**

### 125. QZ-B4248CB1477E44C3B06117891C9128AA · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: D

> Sorun: Örnek cümle anlamsızdı (“elma sayısı (az) geçen yılkinden farklı”); sözcük ayraç içinde veriliyordu.

**Önce:** Aşağıdaki cümlede parantez içinde verilen sözcüğün kullanımı özellik/durum bildiriyor mu yoksa sayı ya da miktar bildirimi mi gösteriyor? Cümle: "Bahçedeki elma sayısı (az) geçen yılkinden farklı." Bu bağlamda parantez içindeki sözcüğün kullanım türü hangisidi…

  A) Özellik veya durum bildiren anlam türüne örnektir. · B) Soyut bir kavram olarak kullanıldığına örnektir. · C) Mecaz anlamla kullanıldığına örnektir. · **D) Sayı ya da miktar bildiren anlam türüne örnektir.** · E) Bir bilim/alan terimi olarak kullanıldığına örnektir.

**Sonra:** Bu yıl bahçemizdeki ağaçlar <u>az</u> elma verdi. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Özellik ya da durum bildirir.
- B) Soyut bir kavramı karşılar.
- C) Mecaz anlamda kullanılmıştır.
- **D) Miktar bildirir; nicel anlamdadır.**
- E) Terim anlamlıdır.

### 126. QZ-BBFBF90E27EE4441A42DEE11C54356D7 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: Üç şık (“belirlemek, anlayış, bilinç”) çizili sözcüklerin hiçbirinin eş anlamlısı olmadığından birden çok doğru cevap vardı.

**Önce:** Gece yarısı odanın içine çöken <u>muğlak</u> bir duygu, insanın zihninde ani bir <u>sezgi</u> uyandırıyor ve bedeni <u>sarsıntıyla</u> irkiltiyordu. Aşağıdakilerden hangisi bu cümlede geçen altı çizili sözcüklerden hiçbirinin eş anlamlısı değildir?

  **A) belirlemek** · B) anlayış · C) bilinç · D) belirsiz · E) his

**Sonra:** Gece yarısı odaya çöken <u>muğlak</u> bir duygu, zihninde ani bir <u>sezgi</u> uyandırdı; bu kısa <u>idrak</u> anında <u>şuuru</u> bir anda berraklaştı. ⏎ ⏎ Aşağıdakilerden hangisi bu cümledeki altı çizili sözcüklerden hiçbirinin eş anlamlısı değildir?

- **A) belirlemek**
- B) anlayış
- C) bilinç
- D) belirsiz
- E) his

### 127. QZ-BFABCEF49A864D54B610F242E345C1E8 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: B

> Sorun: Kök “sözcüğün” diyordu ama hangi sözcüğün değerlendirileceği belirsizdi; doğru kabul edilen cümlede “yolları kapattı” gibi tartışmalı bir kullanım vardı.

**Önce:** Aşağıdaki cümlelerin hangisinde sözcüğün yalnızca temel (gerçek) anlamı kullanılmıştır? Metindeki tüm cümleler tek paragrafta verilmiştir.

  A) Tekniker iğnenin gözünden ipliği geçirmek için dikkatli oldu… · **B) Geçen hafta yağan kar yolları kapattı ve okullar tatil edild…** · C) Yeni inşa edilen köprünün ayakları güçlendirilmişti. · D) Bahçedeki eski sandalyenin kolu çatlamıştı; tamiri gerekiyor… · E) Şişenin boğazına tıpa iyi oturmadığından şişe sızdırıyordu.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük temel anlamıyla kullanılmıştır?

- A) İpliği iğnenin <u>gözünden</u> geçirmekte zorlandı.
- **B) Gece boyunca yağan <u>kar</u> bütün bahçeyi örttü.**
- C) Yeni yapılan köprünün <u>ayakları</u> güçlendirildi.
- D) Bahçedeki eski sandalyenin <u>kolu</u> çatlamıştı.
- E) Şişenin <u>boğazına</u> tıpa tam oturmadı.

### 128. QZ-C27725D296354B8D8A0E3F9D310F915A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: D

> Sorun: Cümleler yanlışlıkla “dize” olarak adlandırılmıştı; kökte gereksiz açıklamalar vardı.

**Önce:** Aşağıdaki dizelerde yansıma sözcüklerden türemiş isimler aranıyor. Metinde verilen her dize bağımsız bir yargıdır; hangisinde yansıma kökenli isim kullanılmamıştır? ⏎ I. Koridordan bir hapşırık geçti, herkes irkildi. ⏎ II. Bahçe, yaprakların hışırtısıyla doluy…

  A) IV. dize · B) V. dize · C) I. dize · **D) III. dize** · E) II. dize

**Sonra:** I. Koridordan bir hapşırık sesi geldi, herkes irkildi. ⏎ II. Bahçe, yaprakların hışırtısıyla doluydu. ⏎ III. Mutfakta annem yemeği karıştırıyordu. ⏎ IV. Akşamın sessizliğini bir sinek vızıltısı böldü. ⏎ V. Kuşların cıvıltısı pencereden içeri doldu. ⏎ ⏎ Numaralanmış cümlelerin hangisinde yansıma bir sözcük yoktur?

- A) IV
- B) V
- C) I
- **D) III**
- E) II

### 129. QZ-C32B269BA95344B5B8B3411F9EE2EA2F · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: D

> Sorun: Giriş cümlesi soruyla çelişiyordu (“eş anlamlılardan hiçbiri kullanılmamıştır”); B şıkkında sözcüğün kendisi geçtiği için birden çok doğru cevap vardı.

**Önce:** Aşağıda dört sözcük numaralandırılmıştır. Bu sözcüklerin eş veya yakın anlamlılarından hiçbiri cümlelerde kullanılmamıştır. I. birkaç II. sıcak III. az IV. samimi Bu bilgilere göre aşağıdaki cümlelerin hangisinde numaralanmış sözcüklerden herhangi birinin eş v…

  A) Akşamüstü hava ılık olduğu için herkes dışarıda oturdu. · B) Konuklara ikram için sofraya sadece birkaç tabak bırakılmışt… · C) Sınıfta kalan kitap sayısı beklendiğinden yetersizdi. · **D) Karmaşık sorunlar uzun tartışmalar gerektirdi.** · E) Konuşmacının içten tavrı salondakilerin güvenini kazandı.

**Sonra:** Aşağıdaki cümlelerin hangisinde hem nitel hem de nicel anlamlı bir sözcük kullanılmıştır?

- A) Sofraya ikram için birkaç tabak konmuştu.
- B) Akşamüstü hava oldukça ılıktı.
- C) Sınıfta yalnızca az sayıda kitap kalmıştı.
- **D) Üç küçük çocuk bahçede oynuyordu.**
- E) Konuşmacının içten tavrı herkesi etkiledi.

### 130. QZ-CA0BD5432D624F308F11CECF545ECFC1 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: “Dikkatle” şıkkı da “özenle” ile yakın anlamlı olduğundan iki doğru cevap vardı; kök 'altı çizili' demiyordu.

**Önce:** Bir kreş, yeni açılan oyuncak kutularını hijyen ve güvenlik açısından kontrol ederken her paketi <u>özenle</u> inceledi; eksik veya tehlikeli parçaya rastlanmadı. Buna göre cümledeki sözcüğün bağlamına en yakın anlamlı sözcük hangisidir?

  **A) Titizlikle** · B) Umursamazca · C) Hemen · D) Aceleyle · E) Dikkatle

**Sonra:** Kreş, yeni gelen oyuncak kutularını güvenlik açısından kontrol ederken her paketi <u>özenle</u> inceledi; eksik ya da tehlikeli bir parçaya rastlanmadı. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamca en yakını aşağıdakilerden hangisidir?

- **A) Titizlikle**
- B) Umursamazca
- C) Hemen
- D) Aceleyle
- E) Sessizce

### 131. QZ-CB3348DED1F24DEDBCB7C489C7C0B677 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: C

> Sorun: D şıkkındaki “tepki” sözcüğü de cümlede “yanıt” yerine kullanılabildiğinden yanıt tartışmalıydı; soruyla ilgisiz I ve III. cümleler vardı.

**Önce:** I. Tanzimat dönemi yasal düzenlemeler toplumda geniş yankı buldu. II. Halkın sorunlara verdiği <u>yanıt</u> uzun tartışmalara yol açtı. III. Mevzuat değişiklikleri yönetimde yeni uygulamalara kapı araladı. Aşağıdaki sözcüklerden hangisi II. cümledeki altı çizi…

  A) Çözüm · B) Yorum · **C) Cevap** · D) Tepki · E) Eylem

**Sonra:** Halkın sorunlara verdiği <u>yanıt</u> uzun tartışmalara yol açtı. ⏎ ⏎ Aşağıdaki sözcüklerden hangisi bu cümledeki altı çizili sözcüğün yerine kullanıldığında cümlenin anlamı değişmez?

- A) Çözüm
- B) Yorum
- **C) Cevap**
- D) Soru
- E) Eylem

### 132. QZ-CD12DD2F7BF24ABCA1103F33163AFCC1 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: D

> Sorun: Soru doğruydu; kökteki gereksiz açıklamalar çıkarıldı, şıklardaki anlatım düzeltildi ve çözüm yenilendi.

**Önce:** Aşağıdaki beş cümleden hangisinde doğadaki ya da nesne seslerini taklit eden sözcüklerden türemiş (yansıma kökenli) bir sözcük yoktur? Cümleleri dikkatle inceleyiniz.

  A) Dere kenarında su şırıl şırıl akıyor, arada balıklar su yüze… · B) Sabah bahçede kuşlar cıvıldıyordu, rüzgâr da yaprakları hışı… · C) Perdeler pencereye vurup tiz bir ses çıkarınca köpek aşağı b… · **D) Kitapçıdaki yoğun sessizlik herkesin konuşmasını engelledi; …** · E) Mutfakta tencereler tıngır mıngır çarpışırken ocaktaki su ka…

**Sonra:** Aşağıdaki cümlelerin hangisinde yansıma bir sözcük yoktur?

- A) Dere kenarında su şırıl şırıl akıyor, arada balıklar suyun yüzüne sıçrıyordu.
- B) Sabah bahçede kuşlar cıvıldıyor, rüzgâr yaprakları hışırdatıyordu.
- C) Perde rüzgârla pencereye çarpınca bahçedeki köpek havladı.
- **D) Kitapçıdaki derin sessizlikte müşteriler sayfaların arasına dalmıştı.**
- E) Mutfakta tencereler tıngır mıngır çarpışırken ocaktaki su kaynamaya başladı.

### 133. QZ-CDBB1650235946C0A7FDF81B9B08C9F5 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: C

> Sorun: I. cümlede yazım yanlışı vardı (“kitapleri”); II. cümledeki “her öğrenciye bir kitap” belirli bir kitabı göstermediği için yanıt tartışmalıydı.

**Önce:** Aşağıdaki cümlelerde aynı sözcük farklı kullanımlarıyla verilmiştir. ⏎ I. Okurlar genellikle kaliteli kitapleri tercih eder. ⏎ II. Okul kütüphanesinde her öğrenciye bir kitap verildi. ⏎ III. Masadaki kitabı raftan aldım. ⏎ Yukarıdakilerden hangilerinde kitap s…

  A) Yalnız II · B) II ve III · **C) Yalnız I** · D) I ve II · E) Yalnız III

**Sonra:** I. Okurlar genellikle kaliteli <u>kitapları</u> tercih eder. ⏎ II. Okul kütüphanesinden ödünç aldığım <u>kitabı</u> dün bitirdim. ⏎ III. Masadaki <u>kitabı</u> rafa kaldırdım. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük genel anlamda kullanılmıştır?

- A) Yalnız II
- B) II ve III
- **C) Yalnız I**
- D) I ve II
- E) Yalnız III

### 134. QZ-D97D385398B447E88743D89957925708 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: A

> Sorun: Hedef sözcük işaretlenmemişti; şıklar gereksiz uzundu.

**Önce:** Toplantıda ekip, karmaşık sorunlara farklı bakış açıları getirebilecek kişileri çağırdı; bu nedenle birçok kafa projeyi daha hızlı çözdü. Parçada geçen kafa sözcüğünün bağlamda hangi anlamda kullanıldığı söylenebilir?

  **A) Mecaz anlamıyla, farklı düşünen kişiler topluluğunu ifade ed…** · B) Yan anlamıyla, bir nesnenin parçasını ifade eden anlamda kul… · C) Gerçek anlamıyla, bedensel bir organı gösteren anlamda kulla… · D) Soyut anlamıyla, duygusal bir durumu ya da ruh halini anlata… · E) Terimsel anlamıyla, belirli bir meslek ya da bilim alanına a…

**Sonra:** Toplantıya karmaşık sorunlara farklı bakış açıları getirebilecek kişiler çağrıldı; birçok <u>kafa</u> bir araya gelince proje daha hızlı ilerledi. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- **A) Mecaz anlamıyla, düşünen kişileri karşılamaktadır.**
- B) Yan anlamıyla, bir nesnenin parçasını karşılamaktadır.
- C) Gerçek anlamıyla, bir organı karşılamaktadır.
- D) Soyut anlamıyla, bir duyguyu karşılamaktadır.
- E) Terim anlamıyla, bir bilim dalına özgü kavramı karşılamaktadır.

### 135. QZ-DDE1A2506DE14D6496D4C67672D7CCC0 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: C

> Sorun: Kök “cümlelerdeki 'açık' sözcüğü” diyor ama sözcük yalnız I. cümlede geçiyordu; hedef sözcük tırnakla verilmişti; soru ailesi yanlış etiketliydi (yazım-noktalama).

**Önce:** I. Yeni fikirlere açık olan ekip sorunları hızlı çözdü. II. Projenin başarısı, üyelerin değişime karşı tutumlarından etkilendi. Yukarıdaki cümlelerdeki 'açık' sözcüğünün bağlama göre karşıt anlamlısı aşağıdakilerden hangisidir?

  A) Çekingen ve isteksiz davranışlar göstermek. · B) Eleştiriye açık olduğunu göstermek. · **C) Değişikliklere kapalı tutum sergilemek.** · D) Yavaş ve temkinli hareket etmek. · E) Esnek ve uyum sağlayan bir tavır takınmak.

**Sonra:** Yeni fikirlere <u>açık</u> olan ekip, sorunları kısa sürede çözdü. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün karşıt anlamlısı aşağıdakilerin hangisinde kullanılmıştır?

- A) Toplantıda çekingen ve isteksiz davrandı.
- B) Eleştirilere açık olduğunu her fırsatta gösterdi.
- **C) Değişikliklere kapalı bir tutum sergiledi.**
- D) Yeni işinde yavaş ve temkinli hareket etti.
- E) Ekip arkadaşlarına karşı esnek ve uyumlu bir tavır takındı.

### 136. QZ-DF560768B35E4AE3BD14E0E5B43C9A6A · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: B

> Sorun: I. cümledeki “garajdaki arabalar” belirli bir kümeyi gösterdiği için genel anlam sayılması tartışmalıydı; “Cümlelerin anlamı belirsizdir” gibi anlamsız bir şık vardı.

**Önce:** I. Garajda birkaç araba yan yana dizilmiş, motor sesleri sokakta yankılanıyordu. II. Sedat, sabah işe giderken kullandığı araba ile trafikte ilerledi. Bu iki cümlede geçen "araba" sözcüğünün hangisinde sözcüğün genel anlamı kullanılmıştır?

  A) Hiçbirinde. · **B) Yalnız I.** · C) Cümlelerin anlamı belirsizdir. · D) Yalnız II. · E) Her iki cümlede de.

**Sonra:** I. <u>Araba</u>, günümüzde en yaygın ulaşım araçlarından biridir. ⏎ II. Sedat, sabah işe giderken babasının <u>arabasını</u> kullandı. ⏎ ⏎ Bu iki cümledeki altı çizili sözcüğün kullanımıyla ilgili aşağıdakilerden hangisi doğrudur?

- A) İki cümlede de özel anlamdadır.
- **B) I'de genel, II'de özel anlamdadır.**
- C) I'de özel, II'de genel anlamdadır.
- D) İki cümlede de mecaz anlamdadır.
- E) İki cümlede de genel anlamdadır.

### 137. QZ-E2AB535730B94F1CB92AA8B524D8E0D7 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Kök “yan anlam” diyordu ama cümleler mecaz anlamı sınıyordu; gereksiz giriş açıklaması vardı.

**Önce:** Aşağıdaki cümlelerde bazı sözcükler temel anlamlarında, bazıları ise yan anlamla kullanılmıştır. Verilen cümlelerden hangilerinde yer alan sözcüklerin tamamı yalnızca temel (gerçek) anlamdadır? ⏎ I. Bahçedeki ağaç gölgesinde çocuklar oynadı. ⏎ II. Öğretmenin a…

  **A) I ve III.** · B) Yalnız I. · C) II ve IV. · D) Yalnız II. · E) III ve IV.

**Sonra:** I. Bahçedeki ağacın gölgesinde çocuklar oynadı. ⏎ II. Öğretmenin anlatımı bütün sınıfı aydınlattı. ⏎ III. Parkta bir köpeğin tasması koptu. ⏎ IV. Konuşmacı kısa sürede salonu fethetti. ⏎ ⏎ Yukarıdakilerin hangilerinde sözcüklerin tümü gerçek anlamıyla kullanılmıştır?

- **A) I ve III**
- B) Yalnız I
- C) II ve IV
- D) Yalnız II
- E) III ve IV

### 138. QZ-EAF8089183A742779185350F976221C9 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: E

> Sorun: Öncüller “bu kullanımda sözcük” diyordu ama hangi sözcüğün değerlendirileceği işaretlenmemişti.

**Önce:** Köy halkı, okulun koridorunda açılan resim sergisinde teması umut olan bir panoyu inceliyor; panoda eski mektuplar, yıpranmış bir ayakkabı ve çiçek fotoğrafları sergileniyor. ⏎ I. Bu kullanımda sözcük bir nesneyi değil duygu ve düşünceyi gösterir. ⏎ II. Sözcük…

  A) Yalnız II · B) Yalnız III · C) Yalnız I · D) II ve III · **E) I ve III**

**Sonra:** Köy halkı, okulun koridorunda açılan resim sergisinde teması <u>umut</u> olan bir panoyu inceliyor; panoda eski mektuplar, yıpranmış bir ayakkabı ve çiçek fotoğrafları sergileniyor. ⏎ ⏎ I. Altı çizili sözcük bir nesneyi değil, bir duyguyu karşılar. ⏎ II. Altı çizili sözcük beş duyuyla algılanabildiği için somuttur. ⏎ III. Panoda soyut bir kavram somut nesnelerle anlatılmıştır. ⏎ ⏎ Yukarıdakilerden hangileri doğrudur?

- A) Yalnız II
- B) Yalnız III
- C) Yalnız I
- D) II ve III
- **E) I ve III**

### 139. QZ-EB10D1CB0B5940409ECF233F09878DAD · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: D

> Sorun: III. cümlede anlatım bozukluğu vardı (“üretim miktarını çok olarak kaydetti”); sözcük tırnakla soruluyordu.

**Önce:** Bir süreç kaydında aynı sözcüğün farklı kullanımları görüldü. I. Bahçedeki ağaçlarda çok elma vardı. II. O, bu işi çok ciddiye alır. III. Yönetim raporu, üretim miktarını çok olarak kaydetti. Yukarıdakilerden hangileri 'çok' sözcüğünün nicel (miktar bildiren) …

  A) Yalnız I · B) Yalnız III · C) Yalnız II · **D) I ve III** · E) II ve III

**Sonra:** I. Bahçedeki ağaçlarda <u>çok</u> elma vardı. ⏎ II. O, bu işi <u>çok</u> ciddiye alır. ⏎ III. Bu yıl fabrikada <u>çok</u> üretim yapıldı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük nicel (miktar bildiren) anlamdadır?

- A) Yalnız I
- B) Yalnız III
- C) Yalnız II
- **D) I ve III**
- E) II ve III

### 140. QZ-EBBCD20C046244CDA133E06AB57A13CA · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: E

> Sorun: Soru genel-özel anlam ayrımını çok anlamlılıkla karıştırıyordu; “ocak” sözcüğünün farklı anlamları genel anlam diye sorulmuştu.

**Önce:** Osmanlı belgelerinde aynı sözcüğün farklı anlamlarda kullanıldığı görülür. Aşağıdaki cümlelerde yer alan "ocak" sözcüğünün kullanımını değerlendirin. ⏎ I. Her hanede ayrı bir ocak vardı; aileler akşamları burada toplanırdı. ⏎ II. Yeniçeri Ocağı, imparatorluğun…

  A) Yalnız I · B) Yalnız II · C) I, II ve III · D) II ve III · **E) I ve III**

**Sonra:** Aşağıdaki cümlelerin hangisinde “ocak” sözcüğü “aile, hane” anlamında kullanılmıştır?

- A) Annem çorbayı ocağın üstüne koydu.
- B) Yeniçeri Ocağı 1826'da kaldırıldı.
- C) Kömür ocağında çalışan işçiler hakları için bir araya geldi.
- D) Yılın ilk ayı olan ocakta bol kar yağdı.
- **E) Savaşta nice ocak söndü, aileler dağıldı.**

### 141. QZ-EBF8A835ECD74B92A5244212B78E155C · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: D

> Sorun: Kök gereksiz yere karışıktı (paketteki “öğeler”); soru doğrudan soruldu, çözüm yenilendi.

**Önce:** Paketi açınca içinden çıkan üç öğe doğrudan beş duyu organıyla algılanabiliyordu: görünür parlaklık, burunda hissedilen hoş koku ve elde duyulan hafif tıkırtı; dördüncü öğe ise yalnızca zihinde hissedilen bir durumdu. Buna göre metindeki dördüncü öğe gibi somu…

  A) Tıkırtı · B) Renk · C) Koku · **D) Hüzün** · E) Tat

**Sonra:** Aşağıdaki sözcüklerden hangisi soyut anlamlıdır?

- A) Tıkırtı
- B) Renk
- C) Koku
- **D) Hüzün**
- E) Tat

### 142. QZ-EF242836194144F490DDB984CF947F93 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: C

> Sorun: II. cümle yanlıştı: parktaki oturma yeri “bank”tır, “banka” değildir; soru var olmayan bir eş seslilik üzerine kurulmuştu.

**Önce:** Aşağıdaki cümlelerde aynı sözcük farklı bağlamlarda kullanılmıştır. I–III arasından hangisinde sözcüğün diğerlerinden farklı bir anlamı olduğu söylenebilir? ⏎ ⏎ I. Birikimlerini güvenli bulduğu bankaya yatırdı ve hesap hareketlerini takip etti. ⏎ II. Parktaki …

  A) Yalnız III. · B) I ve II. · **C) Yalnız II.** · D) I ve III. · E) Yalnız I.

**Sonra:** I. Bahçedeki <u>güller</u> bu sabah açtı. ⏎ II. Arkadaşının şakasına herkes <u>güldü</u>. ⏎ III. Vazodaki <u>gül</u> iki günde soldu. ⏎ ⏎ Yukarıdakilerin hangisinde altı çizili sözcük, ötekilerdekiyle eş seslidir?

- A) Yalnız III
- B) I ve II
- **C) Yalnız II**
- D) I ve III
- E) Yalnız I

### 143. QZ-EF2AD0CC984D4355BB027B6FF5588DEF · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: B

> Sorun: Çizgiler sözcük ortasından kesiyordu (“<u>yaz</u>ı”); III. cümledeki “yazı” sözcüğü için “yazmak eylemi” açıklamasının yanlışlığı tartışmalıydı; kök 'altı çizili' demiyordu.

**Önce:** Aşağıdaki cümlelerde aynı yazıma sahip sözcüğün farklı kullanımları verilmiştir. Her cümlenin yanında parantez içinde sözcüğe atfedilen anlam belirtilmiştir. ⏎ ⏎ I. Öğrenciler uzun <u>yaz</u> tatilini dört gözle bekliyor. (yaz: yılın sıcak mevsimi) ⏎ II. Öğret…

  A) Yalnız IV · **B) Yalnız III** · C) Yalnız I · D) Yalnız II · E) I ve II

**Sonra:** I. Öğrenciler uzun <u>yaz</u> tatilini dört gözle bekliyor. (yılın en sıcak mevsimi) ⏎ II. Öğretmen, deftere kısa bir not <u>yazdı</u>. (harflerle kâğıda geçirmek) ⏎ III. Annem yeni defterimin kapağına adımı <u>yazdı</u>. (yılın en sıcak mevsimi) ⏎ IV. Çiftçiler <u>yaz</u> için hazırlık yapıyordu. (yılın en sıcak mevsimi) ⏎ ⏎ Yukarıdakilerin hangisinde ayraç içindeki açıklama, altı çizili sözcüğün anlamıyla uyuşmamaktadır?

- A) Yalnız IV
- **B) Yalnız III**
- C) Yalnız I
- D) Yalnız II
- E) I ve II

### 144. QZ-EF883A2F0E6B413EB0D0A5927F76741C · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: E

> Sorun: Kesme işaretleri çizginin dışında kalmış, ekler yanlış yazılmıştı (“umut'ten”); IV. madde çizili bir söz içermiyordu, şıklar “I'incisi” gibi yanlış yazılmıştı.

**Önce:** Aşağıdaki paragrafta numaralanmış sözcüklerin bağlam içindeki kullanımları verilmiştir. Yazar, anılarında kent yaşamından gözlemler, duygular ve mesleki notları iç içe anlatır; I. Sokakta yürürken karşılaştığı <u>taş</u>ın üzerindeki rutubet kokusunu betimler.…

  A) I'incisi somut anlamlıdır. · B) IV'üncüsü deyimsel kullanım gösterir. · C) V'incisi somut anlamlıdır. · D) II'ncisi soyut anlamlıdır. · **E) III'üncüsü terim anlamlıdır.**

**Sonra:** Yazar anılarında kent yaşamından izlenimler aktarır. Sokakta yürürken karşılaştığı bir <u>taşın</u> (I) üzerindeki yosunu betimler. Geleceğe dair içindeki <u>umuttan</u> (II) söz eder. Resmî bir dairede herkesin doldurmak zorunda olduğu bir <u>formdan</u> (III) yakınır. Komşusunun her zor anında ona <u>el uzattığını</u> (IV) anlatır. Çocukluğundan kalan eski bir <u>masanın</u> (V) çizgilerine değinir. ⏎ ⏎ Bu parçadaki altı çizili sözlerle ilgili aşağıdakilerden hangisi yanlıştır?

- A) I somut anlamlıdır.
- B) IV mecaz anlamlıdır.
- C) V somut anlamlıdır.
- D) II soyut anlamlıdır.
- **E) III terim anlamlıdır.**

### 145. QZ-F40B3E0187A74436B250401DC63B556C · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: E

> Sorun: Kök 'numaralanmış sözcükler' diyordu ama cümleler numaralanmıştı; “mayalanma” sözcüğünün terim sayılıp sayılmayacağı tartışmalıydı.

**Önce:** Bir gıda atölyesinde uzman, ekmek yapım sürecini anlatırken şu cümleleri kurdu: I. Hamurun mayalanma süresi iyi ayarlanmalıdır. II. Komşular yeni fırına hayran kaldılar. III. Tarifte belirtilen un ölçüleri kesinlikle korunmalıdır. Bu parçada numaralanmış sözcü…

  A) II ve III · B) Yalnız II · C) I ve II · D) Yalnız III · **E) Yalnız I**

**Sonra:** I. Hamurun <u>fermantasyon</u> süresi iyi ayarlanmalıdır. ⏎ II. Komşular yeni açılan <u>fırına</u> hayran kaldı. ⏎ III. Tarifte belirtilen <u>un</u> miktarı korunmalıdır. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- A) II ve III
- B) Yalnız II
- C) I ve II
- D) Yalnız III
- **E) Yalnız I**

### 146. QZ-F53ADE4A7C50431B83012D5E3C2018C1 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: C

> Sorun: Kök cümlelerin somut olup olmadığını soruyordu, hangi sözcüğün değerlendirileceği belirsizdi; III. cümlede anlatım bozukluğu vardı.

**Önce:** Aşağıdaki kısa ifadeler ayrı yargılar hâlinde verilmiştir. I. Sabah bahçede açan bir gülün kokusunu derin bir nefesle aldım. II. İnsanların eşit haklara sahip olma isteği güçlü bir özgürlük duygusudur. III. Sandalyeyi taşırken taşıdığım nesnenin ağırlığı beni …

  A) Yalnız III · B) II ve III · **C) I ve III** · D) Yalnız II · E) Yalnız I

**Sonra:** I. Sabah bahçede açan gülün <u>kokusunu</u> derin bir nefesle içime çektim. ⏎ II. İnsanların içinde güçlü bir <u>özgürlük</u> isteği vardır. ⏎ III. Taşıdığım sandalyenin <u>ağırlığı</u> kollarımı yordu. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük somut anlamlıdır?

- A) Yalnız III
- B) II ve III
- **C) I ve III**
- D) Yalnız II
- E) Yalnız I

### 147. QZ-F5434744A8D54A9BBDD19275BD7D58F4 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: Hedef sözcük işaretlenmemişti; II. cümle (“evde izolasyon süresi”) anlatım bakımından belirsizdi.

**Önce:** Aşağıdaki cümlelerde aynı sözcük farklı bağlamlarda kullanılmıştır. I. İnşaat mühendisi, binada ısı izolasyon gereksinimini hesapladı. II. Soğuk algınlığı nedeniyle evde izolasyon süresi uzadı. III. Mikrobiyoloji laboratuvarında kültürde izolasyon işlemi uygul…

  A) Yalnız III · B) Yalnız II · **C) I ve III** · D) Yalnız I · E) I, II ve III

**Sonra:** I. İnşaat mühendisi, binanın ısı <u>izolasyonu</u> için gereken malzemeyi hesapladı. ⏎ II. Kalabalıktan bunalınca hafta sonu kendini evde bir tür <u>izolasyona</u> aldı. ⏎ III. Mikrobiyoloji laboratuvarında bakterinin <u>izolasyonu</u> başarıyla yapıldı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- A) Yalnız III
- B) Yalnız II
- **C) I ve III**
- D) Yalnız I
- E) I, II ve III

### 148. QZ-F549FE68BA1E4698BF53B7EEE2EBC84B · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: E

> Sorun: İlk cümle bozuktu (“On yıl arasındaki”); şıklar gereksiz uzundu.

**Önce:** On yıl arasındaki şiir akımlarının çoğu, kısıtlı destek ve dar mekânlarda varlık sürdürdü. Küçük dergilerde yayılan dizeler, izleyici bulmakta zorlandı; eleştirmen ilgisi azdı ve üretim ortamı genel olarak <u>loş</u> sayılabilirdi. Altı çizili sözcük bağlamda …

  A) Ortamda karanlık ve tehlikeli bir atmosfer bulunduğu · B) Ortamın ışık bakımından zayıf olduğu, fiziksel olarak az ayd… · C) Etkinliklerin sessiz ve düzenli bir ortamda gerçekleştiği · D) Çalışma koşullarının henüz gelişme göstermeye açık, başlangı… · **E) Etkinliklerin canlılık ve önem açısından sönük, ilgi çekmeye…**

**Sonra:** Bu on yıl içindeki şiir akımlarının çoğu, kısıtlı destekle ve dar mekânlarda varlığını sürdürdü. Küçük dergilerde yayımlanan dizeler okur bulmakta zorlandı, eleştirmenlerin ilgisi azdı; kısacası üretim ortamı oldukça <u>loş</u> sayılabilirdi. ⏎ ⏎ Bu parçadaki altı çizili sözcük hangi anlamda kullanılmıştır?

- A) Karanlık ve tehlikeli
- B) Az aydınlatılmış
- C) Sessiz ve düzenli
- D) Henüz başlangıç aşamasında olan
- **E) Canlılığı ve ilgi çekiciliği az olan, sönük**

### 149. QZ-F7F3D7482F984733975DC3C990E1334D · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: A

> Sorun: Soru doğruydu; kök sadeleştirildi, alt konu temel-yan anlama göre düzeltildi, çözüm yenilendi.

**Önce:** Çocuğun <u>kolu</u> kırıldı; doktor parmağından başlayıp omuza kadar inceleyerek alçıya aldı. Verilen cümlede altı çizili sözcüğün bağlamına göre aynı gerçek (bedensel) anlamı koruyan cümleyi işaretleyiniz.

  **A) Sporcu kolunu güçlendirmek için ağırlık çalışmalarına başlad…** · B) Ağacın kolu fırtına sonucu kırılarak yolun ortasına düştü. · C) Mitingin bir kolu gençlerin katılımıyla güçlendiği bildirild… · D) Gömleğin kolu dikiş yerinden sökülmüş, terzide onarılıyordu. · E) Sandalyenin kolu boydan boya çatlamış, tamir gerektiriyordu.

**Sonra:** Çocuğun <u>kolu</u> kırıldı; doktor parmaklarından omzuna kadar inceleyip alçıya aldı. ⏎ ⏎ Bu cümledeki altı çizili sözcük, aşağıdakilerin hangisinde aynı anlamda kullanılmıştır?

- **A) Sporcu kolunu güçlendirmek için ağırlık çalışmalarına başladı.**
- B) Fırtınada ağacın kalın bir kolu kırılarak yola düştü.
- C) Derneğin gençlik kolu yeni bir etkinlik düzenledi.
- D) Gömleğin kolu dikiş yerinden sökülmüştü.
- E) Sandalyenin kolu boydan boya çatlamıştı.

### 150. QZ-FB9FE70ADA6A49D1962731DFC9FD283B · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: A

> Sorun: I. cümledeki “kütüphanedeki kitaplar” belirli bir kümeyi gösterdiği için genel anlam sayılması tartışmalıydı; hedef sözcük işaretlenmemişti.

**Önce:** Aşağıdaki üç cümlede aynı sözcük farklı anlamlarda kullanılmıştır. Bu kullanımlardan hangisi sözcüğün o türün tamamını değil, belirli bir örneğini (özel anlamını) göstermektedir? ⏎ I. Kitaplar kütüphanede türlerine göre dizilmişti. ⏎ II. Masadaki kitap, dedemi…

  **A) Yalnız II** · B) I ve III · C) Yalnız I · D) Yalnız III · E) II ve III

**Sonra:** I. <u>Kitaplar</u>, insanın ufkunu genişletir. ⏎ II. Masadaki <u>kitap</u>, dedemin gençlik yıllarından kalma bir romandı. ⏎ III. Çocukken <u>kitap</u>, hayal kurmamızı sağlayan en iyi araçtı. ⏎ ⏎ Yukarıdakilerin hangilerinde altı çizili sözcük özel anlamda kullanılmıştır?

- **A) Yalnız II**
- B) I ve III
- C) Yalnız I
- D) Yalnız III
- E) II ve III

### 151. QZ-FDF008BC879A458DB0F604084B00A184 · Quiz/AdminTest · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: D

> Sorun: Hedef sözcük tırnakla soruluyordu; paragraf gereksiz uzundu.

**Önce:** Geçen ay bisikletten düşüp sağ kolumu incittim; o bölgedeki ağrı ve hareket kısıtlılığı birkaç hafta sürdü, kolda morarma ve kas hassasiyeti de gözlendi. Bu paragraftaki "kol" sözcüğünün kullanımına en çok benzeyen anlam aşağıdaki cümlelerden hangisindedir?

  A) Deltanın kuzey kolu kıyı boyunca uzanırken balıkçılar ağları… · B) Kapının kolundan tutup kapıyı açtıktan sonra içeri girdi. · C) Partinin gençlik kolları mahallede etkinlik düzenledi. · **D) Bisiklet kazasında sağ kolunu inciten sporcu tedavi gördü.** · E) Sandalyenin kolu kırılınca oturmak eskisi kadar rahat olmadı…

**Sonra:** Geçen ay bisikletten düşüp sağ <u>kolumu</u> incittim; ağrı birkaç hafta sürdü. ⏎ ⏎ Bu cümledeki altı çizili sözcük, aşağıdakilerin hangisinde aynı anlamda kullanılmıştır?

- A) Nehrin kuzey kolu kıyı boyunca uzanıyordu.
- B) Kapının kolundan tutup içeri girdi.
- C) Partinin gençlik kolları mahallede etkinlik düzenledi.
- **D) Kazada sağ kolunu inciten sporcu tedavi gördü.**
- E) Sandalyenin kolu kırılınca oturmak zorlaştı.

### 152. QZ-0A743D9AE8E643699289004A618B92E3 · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: A

> Sorun: Soru belirsizdi: hangi bakımdan “en yakın” kullanımın arandığı söylenmiyordu; A ve E şıkları aynı ölçüde savunulabiliyordu.

**Önce:** Aşağıdaki cümlede altı çizili sözcük, cümledeki anlamıyla değerlendirildiğinde hangi seçenekteki kullanıma en yakındır? Sabah erken saatlerde esen hafif rüzgâr, deniz kıyısındaki insanları <u>serinletti</u> ve yürüyüşlerini daha rahat hâle getirdi.

  **A) Sıcak bir çorba, akşam yemeğinde içimi ısıttı.** · B) Yeni haber, sınıftaki herkesin ilgisini çekti. · C) Uzun toplantı sonunda herkes biraz yorgun düştü. · D) Kalın perde, odanın içine fazla ışık girmesini engelledi. · E) Dün gece yağan yağmur, toprağın üstünü tamamen ıslattı.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük, ötekilerden farklı olarak mecaz anlamda kullanılmıştır?

- **A) Annesinin sıcak sözleri içini <u>ısıttı</u>.**
- B) Sabah esen rüzgâr kıyıdaki insanları <u>serinletti</u>.
- C) Kalın perde odaya ışık girmesini <u>engelledi</u>.
- D) Gece yağan yağmur toprağı <u>ıslattı</u>.
- E) Güneş öğleye doğru kumu iyice <u>ısıttı</u>.

### 153. QZ-2F152A77CCE045E584520DD00F5C6FA2 · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: “Derin çizgiler” sözünde “derin”in karşıtı olarak “ince” de savunulabildiği için yanıt tartışmalıydı; soruyla ilgisiz II ve III. cümleler vardı.

**Önce:** I. Uzun süredir ertelediği işi sonunda bitiren Selim, yüzündeki <u>derin</u> çizgilerle değil, rahatlamış tavrıyla dikkat çekiyordu. II. Arkadaşları onun bu hâlini görünce, günlerdir taşıdığı yükün hafiflediğini söyledi. III. Selim ise yaşadığı değişimin, dışa…

  **A) sığ** · B) ince · C) düz · D) geniş · E) dar

**Sonra:** Çocuklar, gölün <u>derin</u> kısmına girmemeleri için uyarıldı. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün karşıt anlamlısı aşağıdakilerden hangisidir?

- **A) sığ**
- B) ince
- C) düz
- D) geniş
- E) dar

### 154. QZ-3464555A6579479193602BD0CEDF7E37 · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: Kök “aşağıdaki tabloda” diyordu ama tablo yoktu; doğru kabul edilen C belirsizdi, A'daki “kalp” de terim sayılabilirdi.

**Önce:** Aşağıdaki tabloda bir araştırmada yer alan ifadelerin kullanım alanları verilmiştir. Hangi satırdaki sözcük, günlük anlamından uzaklaşmadan, belirli bir alanın kavramını karşılayan özel bir kullanım göstermektedir?

  A) Kalp, vücudun kan dolaşımını sağlayan temel organdır. · B) Köprü, iki yakayı birbirine bağlayan yapılardan biridir. · **C) Işık, laboratuvarda deney düzeneğinde kullanılan bir ölçüt o…** · D) Soğuk havada ellerim hemen üşür ve morarıyor. · E) Çocuk, bahçede koşarken düştü ve dizini yaraladı.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- A) Annemin <u>kalbi</u> herkese karşı tertemizdir.
- B) İki ülke arasında bir kültür <u>köprüsü</u> kurmak istiyoruz.
- **C) Fizik dersinde ışığın <u>kırılmasını</u> bir deneyle gözlemledik.**
- D) Soğuk havada ellerim hemen <u>üşür</u>.
- E) Bahçede koşarken düşüp <u>dizini</u> yaraladı.

### 155. QZ-42FC9F48837A4E558732C914BEBEFEDF · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Cevap anahtarı yanlıştı: cümlede “sert” parçaların katı, sıkı olduğunu anlatıyor; doğru kabul edilen “kaba, kırıcı tutum” açıklaması yanlıştı. Doğru anlam aynı harfe yerleştirildi.

**Önce:** Bir tamir atölyesinde ustanın, “Yeni gelen parçalar ilk gün biraz <u>sert</u> duruyor; birkaç kez kullanınca yerine oturuyor.” sözündeki <u>sert</u> sözcüğü, cümlede hangi anlamda kullanılmıştır?

  A) Katı ve kolay bükülmeyen bir özelliği anlatmaktadır. · B) Yumuşak olmayan, dokununca direnç gösteren bir durumu belirt… · **C) İlk bakışta kaba, kırıcı ve hoşgörüsüz bir tutumu anlatmakta…** · D) Parçanın dayanıklı, sağlam ve uzun ömürlü oluşunu vurgulamak… · E) Bir davranışın sıkı, ödünsüz ve tavizsiz oluşunu ifade etmek…

**Sonra:** Tamir atölyesindeki usta, “Yeni gelen parçalar ilk gün biraz <u>sert</u> duruyor; birkaç kez kullanınca yerine oturuyor.” dedi. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- A) Kaba, kırıcı ve hoşgörüsüz
- B) Şiddetli, güçlü
- **C) Kolay hareket etmeyen, sıkı**
- D) Dayanıklı, uzun ömürlü
- E) Ödünsüz, tavizsiz

### 156. QZ-47936D4BF995413095A0DF35837EA90D · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Doğru şık sözcüğün kendisini içeriyordu (“içi sıkıldı”); B şıkkı da anlamca yakın olduğundan yanıt tartışmalıydı.

**Önce:** Aşağıdaki cümlede altı çizili sözcük, cümlenin akışına göre hangi anlamda kullanılmıştır? ⏎ “Yolculuk uzadıkça çocuklar daha çok <u>sıkıldı</u>; sonunda kimse konuşmak istemedi.”

  **A) Daralıp bunaldı, içi sıkıldı.** · B) Tekrarlanan bir işi yapmaktan yoruldu. · C) Bir yere başvuru yapıp bekledi. · D) Sıkıca kavrayıp elinde tuttu. · E) Gürültüden rahatsız olup uzaklaştı.

**Sonra:** Yolculuk uzadıkça çocuklar daha çok <u>sıkıldı</u>; sonunda kimse konuşmak istemedi. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- **A) Bıkıp usandı, bunaldı**
- B) Bir şeyin baskısı altında ezildi
- C) Bir şeyi sıkıca kavradı
- D) Utanıp kızardı
- E) Gürültüden rahatsız olup uzaklaştı

### 157. QZ-4B59034A24E74B9191B4F22114A09C01 · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: A

> Sorun: Kök “kolay sözcüğüyle karşılaştırılan anlamlar” diyordu ama “kolay” sözcüğü metinde yoktu; çizgi metinde olmayan bir sözcükteydi.

**Önce:** Bir depoda çalışan görevli, ağır koliyi tek başına kaldırırken zorlandı; aynı gün, yeni alınan bilgisayarın kurulumu birkaç dakika içinde tamamlandı. Bu iki kullanımda <u>kolay</u> sözcüğüyle karşılaştırılan anlamlar arasında hangi ayrım vardır?

  **A) İlki somut, ikincisi soyut anlam taşır.** · B) İlki soyut, ikincisi somut anlam taşır. · C) İkisi de somut anlamlıdır. · D) İkisi de soyut anlamlıdır. · E) İlki terim, ikincisi genel anlam taşır.

**Sonra:** I. Depodaki görevli, <u>ağır</u> koliyi tek başına kaldırırken zorlandı. ⏎ II. Bu <u>ağır</u> haber bütün aileyi derinden sarstı. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerle ilgili aşağıdakilerden hangisi doğrudur?

- **A) İlki gerçek, ikincisi mecaz anlamdadır.**
- B) İlki mecaz, ikincisi gerçek anlamdadır.
- C) İkisi de gerçek anlamdadır.
- D) İkisi de mecaz anlamdadır.
- E) İlki terim, ikincisi gündelik anlamdadır.

### 158. QZ-550BFA19EE2C42F495F56A2FC76CAA5F · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Cevap anahtarı yanlıştı: kökteki “ince örtü” kalınlığı az olanı anlatıyor, doğru kabul edilen “ince ayrıntı” ise “ayrıntılı” anlamındaydı; D şıkkı anlamsızdı (“hava daha inceydi”).

**Önce:** Aşağıdaki cümlede altı çizili sözcük, cümledeki anlamına göre hangi seçenekteki kullanıma daha yakındır? Yağmur, gün boyu <u>ince</u> bir örtü gibi kentin üzerine serildi ve sokaklar sessizleşti.

  A) Bahçedeki masanın <u>ince</u> bacağı kolayca eğildi. · **B) Öğrenci, konuyu <u>ince</u> ayrıntılarına kadar anlattı.** · C) Bu kumaş, dokusu bakımından oldukça <u>ince</u> görünüyor. · D) Kış sabahı, hava beklenenden daha <u>ince</u>ydi. · E) Usta, tahtayı zımparayla <u>ince</u> bir yüzey hâline getird…

**Sonra:** Sabaha karşı yağan kar, <u>ince</u> bir örtü gibi kentin üzerine serildi. ⏎ ⏎ Bu cümledeki altı çizili sözcük, aşağıdakilerin hangisinde aynı anlamda kullanılmıştır?

- A) Öğrenci konuyu <u>ince</u> ayrıntılarına kadar anlattı.
- **B) Annem masaya <u>ince</u> bir dantel örtü serdi.**
- C) Konuşmasındaki <u>ince</u> espriler herkesi güldürdü.
- D) Yaşlı kadın <u>ince</u> bir sesle şarkı söyledi.
- E) Bu meseleye <u>ince</u> bir bakış gerekir.

### 159. QZ-685828E58ACC4A16A112212581B33A2B · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Çizgi soru cümlesindeki sözcüğe konmuştu; örnek cümledeki sözcük işaretli değildi ve 'altı çizili' denmiyordu.

**Önce:** Aşağıdaki cümlede <u>sert</u> sözcüğü hangi anlamda kullanılmıştır? Rüzgâr sert estiği için öğrenciler bahçede uzun süre kalamadı.

  A) Dokunulduğunda can acıtan bir yapıdadır. · **B) Güçlü ve şiddetli bir etki gösterir.** · C) Kolayca kırılmayan, dayanıklı bir özelliktedir. · D) Kararlı ve tavizsiz bir tutum sergiler. · E) Keskin, sivri ve pürüzlü bir yüzeye sahiptir.

**Sonra:** Rüzgâr <u>sert</u> estiği için öğrenciler bahçede uzun süre kalamadı. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- A) Dokunulduğunda can acıtan
- **B) Güçlü ve şiddetli**
- C) Kolayca kırılmayan, dayanıklı
- D) Kararlı ve tavizsiz
- E) Keskin, sivri ve pürüzlü

### 160. QZ-8704A170D1AF4D7CB4E24F77E32C2224 · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: Soru karışıktı: cümledeki iki sözcük birbirine yakın anlamlıyken şıklarda “çaba” ile başka sözcükler eşleştiriliyordu.

**Önce:** Aşağıdaki cümlede geçen iki sözcük, anlam bakımından birbirine en çok yaklaşan seçeneği işaretleyiniz: “Bu konuda gösterdiği <u>çaba</u>, beklediğimiz <u>gayret</u> düzeyinin de üstündeydi.”

  **A) çaba – uğraş** · B) çaba – sonuç · C) çaba – kolaylık · D) çaba – rahatlık · E) çaba – sessizlik

**Sonra:** Bu konuda gösterdiği <u>çaba</u>, beklediğimiz düzeyin de üstündeydi. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamca en yakını aşağıdakilerden hangisidir?

- **A) uğraş**
- B) sonuç
- C) kolaylık
- D) rahatlık
- E) sessizlik

### 161. QZ-88B9CB554B3147AC8507EF0271FED216 · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: Cevap anahtarı yanlıştı: “ayağı gevşemiş” gerçek, “içimde bir gevşeme” mecazdır; doğru kabul edilen “yan anlam - temel anlam” sıralaması tersti. Kök “koyu yazılmış” diyordu. Doğru yargı aynı harfe yerleştirildi.

**Önce:** Aşağıdaki cümlelerde koyu yazılmış sözcükler, anlam ilişkisi bakımından nasıl değerlendirilir? ⏎ I. Bu eski sandalyenin ayağı <u>gevşemiş</u>, biraz sallanıyor. ⏎ II. Dün akşamdan beri içimde bir <u>gevşeme</u> var; uzun yürüyüşten sonra oturmak iyi geldi.

  A) İkisi de aynı kökten türemiş, biri temel anlamda kullanılmış… · B) İkisi de mecaz anlam kazanmış, günlük kullanımda yer değişti… · **C) Birincisi yan anlam, ikincisi temel anlam örneğidir.** · D) Birincisi gerçek anlamdadır, ikincisi ise yan anlamla kurulm… · E) Birincisi karşıt anlamlı, ikincisi eş sesli bir kullanımdır.

**Sonra:** I. Bu eski sandalyenin ayağı <u>gevşemiş</u>, biraz sallanıyor. ⏎ II. Uzun yürüyüşten sonra oturunca içimde tatlı bir <u>gevşeme</u> oldu. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerle ilgili aşağıdakilerden hangisi doğrudur?

- A) İkisi de gerçek anlamdadır.
- B) İkisi de mecaz anlamdadır.
- **C) Birincisi gerçek, ikincisi mecaz anlamdadır.**
- D) Birincisi mecaz, ikincisi gerçek anlamdadır.
- E) İki sözcük birbiriyle eş seslidir.

### 162. QZ-960EAB0B141944F281CF4AB0D5C1A8CB · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Soruyla ilgisiz II ve III. cümleler vardı; kök sadeleştirildi, çözüm yenilendi.

**Önce:** Tarihsel bir süreç anlatılırken şu cümleler kuruluyor: I. Bu görüş, kısa sürede <u>yerleşik</u> bir anlayış hâline geldi. II. Ardından farklı çevrelerde yeni yorumlar ortaya çıktı. III. Sonunda eski kabuller yavaş yavaş geri çekildi. Bu cümlelerde altı çizili …

  **A) Bir yere kalıcı olarak kurulmuş ve kökleşmiş olma durumu** · B) Bir yapının zemine sağlam biçimde oturtulmuş olması · C) Kısa süre önce ortaya çıkmış ve henüz değişmemiş olma · D) Her yerde aynı biçimde kabul görmüş ve yaygınlaşmış olma · E) Dış görünüşü düzenli ve temiz olan bir şeyin niteliği

**Sonra:** Bu görüş, kısa sürede <u>yerleşik</u> bir anlayış hâline geldi. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- **A) Kalıcı olarak benimsenmiş, kökleşmiş**
- B) Bir yapının zemine sağlam biçimde oturtulmuş olması
- C) Kısa süre önce ortaya çıkmış
- D) Yalnızca bir çevrede kabul görmüş
- E) Dış görünüşü düzenli ve temiz olan

### 163. QZ-9D307E9CAADD46148D0C6361F39E21A2 · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: A

> Sorun: Kök “diğerlerine göre” diyordu ama karşılaştırılacak başka sözcük yoktu; hedef sözcük işaretlenmemişti.

**Önce:** Aşağıdaki cümlede geçen ses taklidi sözcüğün anlam özelliği, diğerlerine göre nasıl değerlendirilmelidir? "Eski demir kapı, rüzgârda gıcırdayarak açıldı."

  **A) Doğrudan duyulan bir sesi karşılar.** · B) Bir varlığın rengini belirtir. · C) Bir mesleğe ait özel terimi karşılar. · D) Bir duyguyu soyut biçimde anlatır. · E) Sayıyla ölçülebilen bir nitelik verir.

**Sonra:** Eski demir kapı, rüzgârda <u>gıcırdayarak</u> açıldı. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- **A) Doğadaki bir sesin taklidinden türemiş yansıma bir sözcüktür.**
- B) Bir varlığın rengini bildirir.
- C) Bir mesleğe özgü terimdir.
- D) Bir duyguyu soyut biçimde anlatır.
- E) Sayıyla ölçülebilen bir nitelik bildirir.

### 164. QZ-B0DC1D4A158F46C4859468AD35BC0E0D · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: “Bilet yazdırmak” hem çıktı almak hem kayıt yaptırmak anlamına gelebildiğinden C ve D şıkları birlikte savunulabiliyordu; kök “1.” ile başlıyordu.

**Önce:** 1. Sabah erken saatte istasyonda bekleyen yolcu, "Biletimi <u>yazdırdım</u> ama tren yine de gecikti." derken görevlinin yüz ifadesi bir an değişti. Bu cümlede altı çizili sözcük, hangi özelliğiyle kullanılmıştır?

  A) Yazı yazmak eylemini anlatan gerçek anlamıyla kullanılmıştır… · B) Bir kâğıda harf ve işaretleri aktarma anlamıyla kullanılmışt… · **C) Bir belgeyi çıktı alma anlamıyla kullanılmıştır.** · D) Bir şeyi kayda geçirme anlamıyla kullanılmıştır. · E) Bir metni düzenleme anlamıyla kullanılmıştır.

**Sonra:** Ödevi yazıcıdan <u>yazdırdım</u> ama mürekkep bitince sayfalar soluk çıktı. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- A) El yazısıyla kâğıda geçirmek
- B) Birine söyleyerek yazmasını sağlamak
- **C) Yazıcıdan çıktısını almak**
- D) Bir kuruma kaydettirmek
- E) Bir metni düzeltmek

### 165. QZ-BBA62E7786794175BC66882AE3C32283 · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Soru doğruydu; kök sadeleştirildi, alt konusu atanıp çözüm yenilendi.

**Önce:** Bir sergi salonunda kullanılan afişte, "Bu yılki etkinlikte daha <u>çok</u> sanatçı yer alacak ve program daha ayrıntılı hazırlanacak." cümlesi yer alıyor. Bu cümlede altı çizili sözcük, aşağıdakilerden hangisini belirtmektedir?

  **A) Katılım sayısının önceki yıllara göre arttığını** · B) Programın daha nitelikli hâle geldiğini · C) Sanatçıların daha ünlü olduğunu · D) Etkinliğin daha uzun süreceğini · E) Hazırlıkların daha erken başladığını

**Sonra:** Sergi afişinde “Bu yılki etkinlikte daha <u>çok</u> sanatçı yer alacak.” cümlesi yer alıyor. ⏎ ⏎ Bu cümledeki altı çizili sözcük aşağıdakilerden hangisini bildirmektedir?

- **A) Katılacak sanatçı sayısının önceki yıllara göre arttığını**
- B) Programın daha nitelikli hâle geldiğini
- C) Sanatçıların daha ünlü olduğunu
- D) Etkinliğin daha uzun süreceğini
- E) Hazırlıkların daha erken başladığını

### 166. QZ-DA3F6C7B614D48F5BF3CFA21DE0B4619 · Quiz/System · Sözcükte Anlam — Kolay
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Kök hangi sözcüğün değerlendirileceğini belirtmiyordu (“hangi tür anlamı öne çıkarmış olur”); şıklar belirsizdi.

**Önce:** Bir kargo deposunda aynı üründen 12 kutu, 7 koli ve 3 palet olduğu not ediliyor. Görevli, raporda ürün sayısını belirtirken hangi tür anlamı öne çıkarmış olur?

  **A) Sayıyla ifade edilen miktarı temel alan bir kullanım yapmış …** · B) Sözcüğün duygusal çağrışımını ön plana alan bir kullanım yap… · C) Bir kavramı teknik alana özgü biçimde kullanmış olur. · D) Genel bir yargıyı özel bir örnekle sınırlandırmış olur. · E) Ses taklidi bir anlatımı tercih etmiş olur.

**Sonra:** Depo görevlisi raporuna “Depoda <u>on iki</u> kutu ürün var.” diye yazdı. ⏎ ⏎ Bu cümledeki altı çizili sözle ilgili aşağıdakilerden hangisi doğrudur?

- **A) Sayı bildirir; nicel anlamdadır.**
- B) Duygusal bir çağrışım taşır.
- C) Teknik bir alana özgü terimdir.
- D) Mecaz anlamda kullanılmıştır.
- E) Bir sesin taklidinden türemiştir.

### 167. QZ-F1B710F3EC6046469772959080F8A1A3 · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kök “anlam değişimine uğramıştır” diyerek gereksiz bir yargı veriyordu; kök sadeleştirildi, çözüm yenilendi.

**Önce:** Aşağıdaki cümlede altı çizili sözcük, bağlama göre anlam değişimine uğramıştır: "Yoğun sis yüzünden uçuşlar yine <u>aksadı</u>." Bu kullanımdaki sözcüğün cümleye kattığı anlam, aşağıdakilerden hangisidir?

  **A) Planlanan işin beklenen zamanda gerçekleştirilememesi** · B) Bir eşyanın yıpranıp kullanılmaz duruma gelmesi · C) Sesin uzaklardan güçlükle duyulması · D) Bir etkinliğin tamamen sona ermesi · E) Düzenli giden bir işin kısa süreli hızlanması

**Sonra:** Yoğun sis yüzünden uçuşlar yine <u>aksadı</u>. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamı aşağıdakilerden hangisidir?

- **A) Planlanan işin beklenen zamanda gerçekleştirilememesi**
- B) Bir eşyanın yıpranıp kullanılmaz duruma gelmesi
- C) Sesin uzaklardan güçlükle duyulması
- D) Bir etkinliğin tamamen sona ermesi
- E) Düzenli giden bir işin kısa süreli hızlanması

### 168. QZ-F6E13C294039415DA25BA2DEDDAFD986 · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: A şıkkı (“I ve III'te aynı anlamda”) da savunulabildiği için iki doğru cevap vardı; hedef sözcük tırnakla soruluyordu.

**Önce:** Aşağıdaki cümlelerde “genel” sözcüğü hangi kullanımla verilmiştir? I. Bu konuda genel bir değerlendirme yaptı. II. Toplantıya genel müdür de katıldı. III. Yazıda genel hatlarıyla plan anlatıldı.

  A) I ve III'te aynı anlamda kullanılmıştır. · B) Yalnız I’de herkesi kapsayan bir anlam kazanmıştır. · **C) Yalnız II’de özel bir unvanı belirtmiştir.** · D) III’te soyut bir kavramı karşılamıştır. · E) I’de nicelik bildiren bir anlam taşımıştır.

**Sonra:** I. Bu konuda <u>genel</u> bir değerlendirme yaptı. ⏎ II. Toplantıya <u>genel</u> müdür de katıldı. ⏎ III. Yazıda plan <u>genel</u> hatlarıyla anlatıldı. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) I'de ayrıntılı bir değerlendirmeyi bildirmiştir.
- B) III'te sayı bildirmiştir.
- **C) Yalnız II'de bir unvanın parçası olarak kullanılmıştır.**
- D) III'te soyut bir duyguyu karşılamıştır.
- E) I'de miktar bildirmiştir.

### 169. QZ-F775865D7C82457283B8135BD4F8EACC · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: B

> Sorun: Kök cevabı içinde veriyordu (“varlığı duyu organlarıyla algılanamayan bir durum”); “sessizlik” sözcüğünün somut mu soyut mu olduğu tartışmalıydı.

**Önce:** Aşağıdaki cümlede geçen sözcük, varlığı duyu organlarıyla algılanamayan bir durumu anlatmaktadır: "Uzun bekleyiş, sınıftaki herkeste derin bir <u>sessizlik</u> yarattı." Buna göre altı çizili sözcüğün anlam özelliği aşağıdakilerden hangisidir?

  A) Somut bir varlığı adlandıran kullanımdır. · **B) Soyut bir durumu karşılayan kullanımdır.** · C) Özel bir kavramı belirten kullanımdır. · D) Nicelik bildiren bir kullanımdır. · E) Terim anlamıyla kullanılan bir ifadedir.

**Sonra:** Uzun bekleyiş, sınıftaki herkeste derin bir <u>endişe</u> yarattı. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Somut bir varlığı adlandırır.
- **B) Soyut bir durumu karşılar.**
- C) Belirli bir kişiyi ya da yeri karşılar.
- D) Sayı ya da miktar bildirir.
- E) Terim anlamıyla kullanılmıştır.

### 170. QZ-FE49277ED5EC473C9E434C519350E32B · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: A

> Sorun: Cümledeki “ağaçlarda öten kuşlar” belirli kuşları gösterdiği için genel anlam sayılması yanlıştı; kök 'altı çizili' demiyordu.

**Önce:** Aşağıdaki cümlede geçen <u>kuşlar</u> sözcüğü hangi anlam özelliğine örnek olur? "Sabah erken saatte kuşlar ağaçların arasında ötüşmeye başladı."

  **A) Tek bir türü değil, aynı adla anılan canlıların tamamını anl…** · B) Bir varlığın yalnızca dar bir bölümünü anlatmak için kullanı… · C) Bir sözcüğün gerçek anlamından uzaklaşıp yeni bir anlam kaza… · D) Sayıyla ölçülebilen özellikleri bildiren kullanımları karşıl… · E) Bir sesin doğadaki karşılığını taklit ederek kurulur.

**Sonra:** <u>Kuşlar</u>, göç ederken yönlerini bulmak için güneşten yararlanır. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlam özelliğine örnektir?

- **A) Belirli bir bireyi değil, türün bütününü karşılayan genel anlama**
- B) Bir varlığın yalnızca bir bölümünü anlatan yan anlama
- C) Gerçek anlamından uzaklaşıp yeni bir anlam kazanan mecaz anlama
- D) Sayı ve miktar bildiren nicel anlama
- E) Bir sesin taklidinden oluşan yansımaya

### 171. QZ-FF58766AB56A493D88EBB2B5494D92BB · Quiz/System · Sözcükte Anlam — Kolay
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kök “1.” ile başlıyordu; doğru kabul edilen “gerçek, hayal ürünü olmayan” açıklaması sözcüğün bu cümledeki “hakikaten” anlamını tam karşılamıyordu, şıklar anlam türleriyle karışmıştı.

**Önce:** 1. Bir yarışmada hakem, sporcuların hareketlerini izlerken “Bu kez işi <u>gerçekten</u> ciddiye aldı.” notunu düşüyor. Bu cümlede altı çizili söz, aşağıdaki anlamlardan hangisinde kullanılmıştır?

  **A) Gerçek, hayal ürünü olmayan anlamda kullanılmıştır.** · B) Mecazlı bir anlatım kurmak için kullanılmıştır. · C) Bir alan terimini karşılamak için kullanılmıştır. · D) Nicelik bildiren bir ifade olarak kullanılmıştır. · E) Karşıtlık kuran bir sözcük olarak kullanılmıştır.

**Sonra:** Hakem, sporcunun performansı için “Bu kez işi <u>gerçekten</u> ciddiye aldı.” notunu düştü. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- **A) Hakikaten, sahiden**
- B) Az çok, biraz
- C) Belki, olasılıkla
- D) Gizlice, kimseye belli etmeden
- E) Tersine, aksine

### 172. QZ-1269F9FA927E4F5994FB704BC23EEAC2 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: C

> Sorun: Hedef sözcükler tırnakla verilmişti; A şıkkı (“büyüklük ve küçüklük”) ile doğru cevap arasındaki fark belirsizdi.

**Önce:** Bir teknik servis, aynı model cihaz için iki ayrı rapor hazırlıyor. Raporlardan birinde arıza için “küçük”, diğerinde ise “önemli” ifadesi kullanılıyor. Bu iki sözcük, anlatımda hangi açıdan karşılaştırılabilir?

  A) Büyüklük ve küçüklük bakımından karşılaştırılabilir. · B) Yapı ve biçim bakımından karşılaştırılabilir. · **C) Nitelik ve derecelendirme bakımından karşılaştırılabilir.** · D) Neden ve sonuç bakımından karşılaştırılabilir. · E) Gerçek ve mecaz anlam bakımından karşılaştırılabilir.

**Sonra:** Teknik servis, aynı cihaz için hazırladığı iki rapordan birinde arızayı <u>küçük</u>, ötekinde <u>önemli</u> olarak nitelendirdi. ⏎ ⏎ Bu cümledeki altı çizili sözcükler ortak olarak aşağıdakilerden hangisini bildirir?

- A) Arızaların sayısını
- B) Arızanın nedenini
- **C) Arızanın niteliğini ve derecesini**
- D) Arızanın ne zaman ortaya çıktığını
- E) Arızanın giderilme yolunu

### 173. QZ-150622E1E6264ED8905B99232C306A87 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: A

> Sorun: Hedef sözcük tırnakla verilmişti; E şıkkı anlamsızdı (“aynı biçimde yazılıp farklı seslenen”).

**Önce:** Bir dağ yürüyüşünde rehber, “Bu sabahki sis, vadinin görüntüsünü kapattı; hava açılınca manzara yeniden belirdi.” diyor. Bu cümledeki “sis” sözcüğü, aşağıdaki anlam türlerinden hangisine örnek oluşturur?

  **A) Duyu organlarıyla algılanabilen bir varlığı karşılar.** · B) Bir duyguyu ya da düşünceyi adlandırır. · C) Bir bilim dalına özgü terim olarak kullanılır. · D) Başka bir sözcükle birlikte yeni bir anlam kazanır. · E) Aynı biçimde yazılıp farklı seslenen bir sözcüğü gösterir.

**Sonra:** Dağ yürüyüşündeki rehber, “Bu sabahki <u>sis</u> vadinin görüntüsünü kapattı; hava açılınca manzara yeniden belirdi.” dedi. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- **A) Duyularla algılanabilen bir varlığı karşılar.**
- B) Bir duyguyu ya da düşünceyi adlandırır.
- C) Bir bilim dalına özgü terimdir.
- D) Mecaz anlamda kullanılmıştır.
- E) Bir sesin taklidinden türemiştir.

### 174. QZ-1D35B1A851C441A09D92DA9CBEF263F2 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: D

> Sorun: Kök cevabın ipucunu veriyordu (“nesne adı mı, zihinde kurulan özellik mi”); “umut sözü” ifadesi sözcüğün kendisinden mi söz edildiğini belirsizleştiriyordu.

**Önce:** Aşağıdaki cümlede altı çizili sözcük, anlam bakımından hangi türde kullanılmıştır? Kararını verirken sözcüğün nesne adı mı, yoksa zihinde kurulan bir özellik mi anlattığına dikkat ediniz: "Toplantıda <u>umut</u> sözü, tartışmanın yönünü bir anda değiştirdi."

  A) Sözcük, elle tutulup gözle görülebilen bir varlığı karşılama… · B) Sözcük, doğada kendiliğinden bulunan bir nesneyi karşılamakt… · C) Sözcük, ölçülebilen bir niceliği ve miktarı belirtmektedir. · **D) Sözcük, duyularla algılanamayan bir kavramı karşılamaktadır.** · E) Sözcük, bir meslek ya da alan terimini karşılamaktadır.

**Sonra:** Kitabın son bölümü okurlarda büyük bir <u>merak</u> uyandırdı. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Elle tutulup gözle görülebilen bir varlığı karşılar.
- B) Doğada kendiliğinden bulunan bir nesneyi karşılar.
- C) Ölçülebilen bir miktarı bildirir.
- **D) Duyularla algılanamayan bir kavramı karşılar.**
- E) Bir meslek dalına özgü terimdir.

### 175. QZ-1EF7D80A73174F18BC02642439C73F0D · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kök anlamsızdı (“hangi seçenekteki anlam değişmesine benzer”); dört cümlede farklı anlamlar varken tek bir anlam soruluyordu, sözcük işaretlenmemişti.

**Önce:** Aşağıdaki cümlelerde geçen <u>döndü</u> sözcüğü, hangi seçenekteki anlam değişmesine benzer biçimde kullanılmıştır? I. Sabah rüzgârı birden döndü ve hava serinledi. II. Konuşma uzayınca konu başka yöne döndü. III. Çocuk, elindeki topu ustaca döndürdü. IV. Uzun…

  **A) Bir şeyin yönü ya da durumu değişmek** · B) Bir hareketi kendi ekseni çevresinde yapmak · C) Bir yerden ayrılıp geri gelmek · D) Bir işi tamamlayıp sonuçlandırmak · E) Bir düşünceyi daha açık hâle getirmek

**Sonra:** I. Sabah rüzgâr birden <u>döndü</u> ve hava serinledi. ⏎ II. Konuşma uzayınca konu başka bir yöne <u>döndü</u>. ⏎ III. Uzun bekleyişten sonra herkes evine <u>döndü</u>. ⏎ ⏎ I ve II. cümlelerdeki altı çizili sözcüklerin ortak anlamı aşağıdakilerden hangisidir?

- **A) Yönü ya da durumu değişmek**
- B) Kendi ekseni çevresinde hareket etmek
- C) Bir yerden ayrılıp geri gelmek
- D) Bir işi tamamlayıp sonuçlandırmak
- E) Bir düşünceyi açık hâle getirmek

### 176. QZ-33A0D3DD14244420A1807E0D1DBA9CB4 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: B

> Sorun: Kök değerlendirilecek bir sözcük vermiyordu; kılavuz notunun kendisi cevabı söylüyordu (“özel anlamda kullanılmaktadır”).

**Önce:** Bir teknik serviste, cihazın içindeki parçaların işlevini anlatan kılavuzda “bu bölümde geçen kavramlar, ölçüm birimleri ve işlem adımları özel anlamda kullanılmaktadır” notu yer alıyor. Buna göre, metindeki sözcüklerin hangi özellikte kullanıldığı söylenebili…

  A) Her sözcük, günlük kullanımındaki anlamıyla değerlendirilmiş… · **B) Sözcükler, alanına özgü bir anlatımı karşılayacak biçimde ku…** · C) İfadeler, bir duyguyu dolaylı yoldan anlatacak biçimde kurul… · D) Kelimeler, birbirinin yerine geçebilecek yakınlıkta seçilmiş… · E) Sözcükler, ses benzerliği nedeniyle farklı anlamları çağrışt…

**Sonra:** Cihazın kullanım kılavuzunda “Ölçüm sırasında <u>voltaj</u> değerini sabit tutun.” uyarısı yer alıyor. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Gündelik dildeki anlamıyla kullanılmıştır.
- **B) Bir alana özgü kavramı karşılayan terimdir.**
- C) Bir duyguyu dolaylı yoldan anlatır.
- D) Mecaz anlam kazanmıştır.
- E) Bir sesin taklidinden türemiştir.

### 177. QZ-3E4AAE24B9CD482388B80A5A98D0E61B · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: B

> Sorun: Çizgiler sözcük ortasından kesiyordu (“<u>ağır</u>laşmıştı”, “<u>ağır</u>dan”).

**Önce:** Aşağıdaki cümlelerde altı çizili sözcüklerin hangi anlamda kullanıldığını düşününüz: ⏎ I. Uzun yolculuktan sonra omuzları <u>ağır</u>laşmıştı. ⏎ II. Bu dosyayı yarına kadar <u>ağır</u>dan alırsan yetişemez. ⏎ III. Sınavdan önce sınıfta <u>ağır</u> bir sessizli…

  A) Sözcük, her cümlede aynı temel anlamını korumuştur. · **B) Sözcük, bağlama göre farklı çağrışımlar kazanmıştır.** · C) Sözcük, yalnızca teknik bir alanı karşılamak için kullanılmı… · D) Sözcük, karşıt anlamlı bir başka sözcükle yer değiştirmiştir… · E) Sözcük, somut bir varlığın adını doğrudan belirtmiştir.

**Sonra:** I. Uzun yolculuktan sonra omuzları <u>ağırlaşmıştı</u>. ⏎ II. Bu dosyayı <u>ağırdan</u> alırsan yarına yetiştiremezsin. ⏎ III. Sınavdan önce sınıfta <u>ağır</u> bir sessizlik vardı. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerin ortak özelliği aşağıdakilerin hangisinde doğru verilmiştir?

- A) Sözcük her cümlede aynı temel anlamını korumuştur.
- **B) Sözcük bağlama göre farklı anlamlar kazanmıştır.**
- C) Sözcük yalnızca teknik bir alanı karşılamak için kullanılmıştır.
- D) Sözcük karşıt anlamlı bir sözcükle yer değiştirmiştir.
- E) Sözcük somut bir varlığın adını doğrudan bildirmiştir.

### 178. QZ-485E462AF0E84308A2F7E3B52F5837A7 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: II. cümledeki “söylediklerimi toparladım” da mecaz olduğundan doğru kabul edilen “I ve III” eksikti; I. cümle anlamca tutarsızdı (“sınav yaklaşınca düğüm çözüldü”).

**Önce:** Aşağıdaki cümleler, bir öğrencinin aynı olay için yazdığı notlardan alınmıştır: ⏎ I. Sınav yaklaşınca içimdeki düğüm çözüldü. ⏎ II. Kısa sürede söylediklerimi toparladım. ⏎ III. Arkadaşımın bakışı bir anda soğudu. ⏎ IV. Akşam olunca hava belirgin biçimde serin…

  A) Yalnız I. · B) I ve II. · **C) I ve III.** · D) II ve IV. · E) III ve IV.

**Sonra:** I. Sınav bitince içimdeki düğüm çözüldü. ⏎ II. Masadaki kitapları kısa sürede toparladım. ⏎ III. Arkadaşımın bakışları bir anda soğudu. ⏎ IV. Akşam olunca hava belirgin biçimde serinledi. ⏎ ⏎ Yukarıdakilerin hangilerinde mecaz anlamlı bir söz kullanılmıştır?

- A) Yalnız I
- B) I ve II
- **C) I ve III**
- D) II ve IV
- E) III ve IV

### 179. QZ-61A01B17E64A4471A3828A232D52880E · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: D

> Sorun: Kök 'altı çizili' demiyordu; soru doğruydu, kök sadeleştirildi ve çözüm yenilendi.

**Önce:** Bir kargo deposunda çalışan görevli, etiketleri kontrol ederken şu cümleyi kuruyor: “Bu kutu çok <u>ağır</u>; tek başıma kaldırmam zor.” Aynı sözcük, aşağıdaki cümlelerin hangisinde bu kullanımına en yakın anlamda yer alır?

  A) Sabah yürüyüşünde hava ağır ağır ısınıyordu. · B) Onun ağır sözleri ortamı bir anda gerdi. · C) Bu bölgede ağır kış koşulları sık görülür. · **D) Masa, iki kişinin zorlanarak taşıyacağı kadar ağırdı.** · E) Sınavdan önce ağır bir sessizlik çöktü.

**Sonra:** Depo görevlisi, “Bu kutu çok <u>ağır</u>; tek başıma kaldırmam zor.” dedi. ⏎ ⏎ Bu cümledeki altı çizili sözcük, aşağıdakilerin hangisinde aynı anlamda kullanılmıştır?

- A) Sabah yürüyüşünde hava ağır ağır ısınıyordu.
- B) Onun ağır sözleri ortamı bir anda gerdi.
- C) Bu bölgede ağır kış koşulları sık görülür.
- **D) Masa, iki kişinin zorlanarak taşıyacağı kadar ağırdı.**
- E) Sınavdan önce sınıfa ağır bir sessizlik çöktü.

### 180. QZ-67B42C4209824F9A945741AEE1D59306 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_04 Temel ve Yan Anlam · Doğru: C

> Sorun: Kök belirsizdi (“yakın bir ilişki kurularak genişletilen anlam”); yalnızca doğru şıkta çizili sözcük vardı, “işin kalbi atıyor” kullanımının yan anlam mı mecaz mı olduğu tartışmalıydı.

**Önce:** Bir kitap kulübü için hazırlanan notta, bazı cümlelerde sözcüklerin kendi anlamı korunurken bazı cümlelerde anlam, yakın bir ilişki kurularak genişletiliyor. Aşağıdaki cümlelerde altı çizili sözcüklerden hangisi, bu notta belirtilen ikinci kullanıma örnek olur…

  A) Sabahki haberler hepimizi şaşırttı. · B) Toplantıda herkesin sesi bir anda yükseldi. · **C) Bu işin <u>kalbi</u> burada atıyor.** · D) Sınavda üç yanlışın bir doğruyu götürdüğü söylendi. · E) Pencereden içeri serin bir rüzgâr girdi.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük yan anlamıyla kullanılmıştır?

- A) Sabah <u>haberleri</u> hepimizi şaşırttı.
- B) Toplantıda herkesin <u>sesi</u> bir anda yükseldi.
- **C) Kitabın <u>sırtında</u> yazarın adı yazıyordu.**
- D) Sınavda üç yanlış bir <u>doğruyu</u> götürüyor.
- E) Pencereden içeri serin bir <u>rüzgâr</u> girdi.

### 181. QZ-6C676675A03C4347B82D00E2780C0E8D · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: A

> Sorun: Kök karışıktı (“bu kullanımla aynı türden bir örnek”); soru doğrudan soruldu, çözüm yenilendi.

**Önce:** Aşağıdaki cümlelerde altı çizili sözcükler, kullanıldıkları bilim alanına özgü bir anlam taşımaktadır. Buna göre hangi seçenek, altı çizili sözcüğün bu kullanımıyla aynı türden bir örnek içerir?

  **A) Mühendis, köprünün <u>temel</u> hesabını yeniden yaptı.** · B) Çocuk, parkta <u>uçurtma</u> uçurduktan sonra eve döndü. · C) Gazeteci, olayın <u>nabzını</u> uzun süre tuttu. · D) Öğrenci, sınavdan önce notlarını <u>yazdı</u>. · E) Kışın soğukta ellerim <u>uyuştu</u>.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük terim anlamıyla kullanılmıştır?

- **A) Mühendis, köprünün <u>temel</u> hesabını yeniden yaptı.**
- B) Çocuk, parkta <u>uçurtma</u> uçurduktan sonra eve döndü.
- C) Gazeteci, olayın <u>nabzını</u> uzun süre tuttu.
- D) Öğrenci, sınavdan önce notlarını <u>yazdı</u>.
- E) Kışın soğukta ellerim <u>uyuştu</u>.

### 182. QZ-8BBCD90F81524355852DFAA4B25D0D91 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: Cevap anahtarı yanlıştı: ikinci cümledeki kullanım mecazdır, doğru kabul edilen şık “yan anlam” diyordu; iki cümlede farklı fiiller (yanmak, yakmak) vardı, kök 'altı çizili' demiyordu. Doğru yargı aynı harfe yerleştirildi.

**Önce:** Aşağıdaki iki cümlede geçen aynı sözcük, bağlama göre farklı bir anlam kazanmıştır: “Tencerenin dibi iyice <u>yandı</u>.” ve “Söyledikleriyle arkadaşını <u>yaktı</u>.” Bu iki kullanım arasındaki anlam ilişkisi aşağıdakilerden hangisinde doğru verilmiştir?

  A) Birinci cümlede sözcük, kendi temel anlamından uzaklaşmadan … · B) Birinci cümlede sözcük, gerçek anlamıyla kullanılmıştır; iki… · **C) Birinci cümlede sözcük, temel anlamına bağlıdır; ikinci cüml…** · D) Birinci cümlede sözcük, karşıt anlamlı bir kullanım göstermi… · E) Birinci cümlede sözcük, mecaz anlam taşımıştır; ikinci cümle…

**Sonra:** I. Tencerenin dibi ocakta iyice <u>yandı</u>. ⏎ II. Gelen acı haber hepimizin içini <u>yaktı</u>. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerle ilgili aşağıdakilerden hangisi doğrudur?

- A) İki cümlede de gerçek anlamdadır.
- B) Birincide mecaz, ikincide gerçek anlamdadır.
- **C) Birincide gerçek, ikincide mecaz anlamdadır.**
- D) İki cümlede de mecaz anlamdadır.
- E) İkincide terim anlamı kazanmıştır.

### 183. QZ-9D16122ADD1649699EB3315ACFA5CE80 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: Kökte gereksiz bir bağlam vardı (“ertesi gün hazırladığı kısa listede”); kök sadeleştirildi, çözüm yenilendi.

**Önce:** Bir mağazada yapılan stok sayımında görevli kişi, “Bu raflardaki kutuların sayısı <u>az</u>, fakat ürünlerin yerleşimi oldukça düzenli.” notunu düşüyor. Aynı kişinin, ertesi gün hazırladığı kısa listede yer alan sözcüklerden hangisi, bu cümledeki altı çizili s…

  **A) çok** · B) seyrek · C) ufak · D) eksik · E) kısa

**Sonra:** Mağazadaki görevli, “Bu raflardaki kutuların sayısı <u>az</u>, fakat ürünler oldukça düzenli yerleştirilmiş.” notunu düştü. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün karşıt anlamlısı aşağıdakilerden hangisidir?

- **A) çok**
- B) seyrek
- C) ufak
- D) eksik
- E) kısa

### 184. QZ-BB5E6FCA36564E12B01BB150B8BB918B · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: D

> Sorun: Kök “aşağıdaki tabloda” diyordu ama tablo yoktu; şıkların her birinde genel bir sözcük bulunduğundan soru çözülemiyordu.

**Önce:** Aşağıdaki tabloda bir dersin dört farklı bölümünde kullanılan sözcükler verilmiştir. Öğrenci, bu sözcüklerin kapsadığı anlam alanlarını karşılaştırarak ortak olanı belirlemek istiyor. Buna göre hangi seçenek, diğerlerinden daha geniş bir anlam alanına sahip ol…

  A) Kuş, serçe ve güvercin gibi tür adları · B) Mobilya, sandalye ve masa gibi eşya adları · C) Çiçek, gül ve lale gibi bitki adları · **D) Hayvan, kedi ve köpek gibi canlı adları** · E) Araç, otomobil ve bisiklet gibi taşıt adları

**Sonra:** Aşağıdakilerin hangisinde ilk sözcük, ötekilerin hepsini kapsayan genel anlamlı bir sözcüktür?

- A) serçe, kuş, güvercin
- B) sandalye, mobilya, masa
- C) gül, çiçek, lale
- **D) hayvan, kedi, köpek**
- E) otomobil, taşıt, bisiklet

### 185. QZ-C6F9FDD96C2E4959B36B29AA19C68D16 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: A

> Sorun: Kök çelişkiliydi (“koyu yazılan sözcükler en yakın anlamlı değildir”) ve gösterilemeyen koyu yazıya atıf yapıyordu; D şıkkı cümledeki sözcüklerin kendisiydi.

**Önce:** Aşağıdaki iki cümlede koyu yazılan sözcükler, cümle içindeki kullanımları bakımından en yakın anlamlı değildir. Bu ikiliden hangisinde iki sözcük arasındaki anlam ilişkisi, diğerlerine göre daha yakındır? I. Gezi boyunca arkadaşımın sakin tavrı, kalabalık orta…

  **A) sakinleştirdi - toparladı** · B) dinlendirdi - süsledi · C) avuttu - ayarladı · D) yatıştırdı - düzenledi · E) hafifletti - temizledi

**Sonra:** I. Arkadaşımın sakin tavrı, kalabalıktaki herkesi <u>yatıştırdı</u>. ⏎ II. Çocuk, sabah erkenden kalkıp odasını <u>düzenledi</u>. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerin yerine, anlam değişmeden sırasıyla aşağıdakilerden hangisi getirilebilir?

- **A) sakinleştirdi - toparladı**
- B) dinlendirdi - süsledi
- C) avuttu - ayarladı
- D) korkuttu - dağıttı
- E) hafifletti - temizledi

### 186. QZ-C791151F2F8C4AE6A168F7BECB7924A8 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Hedef sözcük tırnakla verilmişti; kök sadeleştirildi, çözüm yenilendi.

**Önce:** Bir kargo dağıtım merkezinde yeni başlayan çalışan, sabah vardiyasında şu notu okur: “Depodaki kutular, rafların kenarına sıkışmış durumda; dikkatli taşıyalım.” Bu cümledeki “sıkışmış” sözcüğü, aşağıdaki anlamlardan hangisiyle kullanılmıştır?

  **A) Dar bir yerde hareket edemez durumda bulunmak** · B) Bir düşünceyi zorla kabul ettirmek · C) Beklenmedik bir anda ortaya çıkmak · D) Bir işi geciktirmeden tamamlamak · E) Bir yere çok az sayıda eşya yerleştirmek

**Sonra:** Depo görevlisinin notunda “Kutular rafların kenarına <u>sıkışmış</u>, dikkatli taşıyalım.” yazıyordu. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- **A) Dar bir yerde hareket edemez durumda kalmak**
- B) Bir düşünceyi zorla kabul ettirmek
- C) Beklenmedik bir anda ortaya çıkmak
- D) Bir işi geciktirmeden tamamlamak
- E) Bir yere çok az sayıda yerleştirilmek

### 187. QZ-D3D18A9B65BC4553912E78743E1BB8A2 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: E şıkkı (“I. cümledeki sözcük hava koşulunun şiddetini bildirir”) da doğru olduğundan iki doğru cevap vardı; kök ile şıklar birbirini tutmuyordu.

**Önce:** Aşağıdaki cümlelerde altı çizili sözcüklerden hangisi, bir özelliğin derece, miktar ya da yoğunluk bakımından değiştiğini bildirir? ⏎ I. Bu yıl kış, geçen yıla göre daha <u>sert</u> geçti. ⏎ II. Toplantı salonunda <u>sessiz</u> bir bekleyiş vardı. ⏎ III. Yeni …

  A) I. cümledeki sözcük, dayanıklılık düzeyini bildirir. · B) II. cümledeki sözcük, gürültü düzeyini bildirir. · **C) III. cümledeki sözcük, sürenin miktarını bildirir.** · D) IV. cümledeki sözcük, anlatımın ayrıntı düzeyini bildirir. · E) I. cümledeki sözcük, hava koşulunun şiddetini bildirir.

**Sonra:** I. Bu yıl kış, geçen yıla göre daha <u>sert</u> geçti. ⏎ II. Toplantı salonunda <u>sessiz</u> bir bekleyiş vardı. ⏎ III. Yeni düzenlemeyle işlem süresi <u>uzun</u> olmadı. ⏎ IV. Çocuğun sorularına <u>kısa</u> ve net yanıtlar verildi. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerle ilgili aşağıdakilerden hangisi doğrudur?

- A) I'deki sözcük dayanıklılık bildirir.
- B) II'deki sözcük bir sesi taklit eder.
- **C) III'teki sözcük süreyle ilgili bir ölçü bildirir.**
- D) IV'teki sözcük sayı bildirir.
- E) I'deki sözcük bir nesnenin katılığını bildirir.

### 188. QZ-D618340CDBE74C65B5E8483ED78C7BD8 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: Parçadaki “okul” hâlâ bir yer anlamındaydı; doğru kabul edilen “topluluğu kapsayan geniş anlam” cümleyle desteklenmiyordu, kök 'altı çizili' demiyordu.

**Önce:** Aşağıdaki kısa metinde geçen <u>okul</u> sözcüğü, önceki ve sonraki cümlelerle birlikte düşünüldüğünde hangi anlamda kullanılmıştır? O sabah okul, mahalledeki çocuklar için yalnızca ders yapılan bir bina gibi görünmüyordu; herkesin buluştuğu, haberlerin paylaş…

  A) Eğitim etkinliklerinin yürütüldüğü kurum anlamında kullanılm… · B) Bir yapının fiziksel bölümünü belirten dar anlamda kullanılm… · **C) Bir topluluğu ya da çevreyi kapsayan daha geniş anlamda kull…** · D) Benzer sesli başka bir sözcüğün yerine kullanılmıştır. · E) Soyut bir duygu durumunu anlatmak için kullanılmıştır.

**Sonra:** Bayram sabahı bütün <u>okul</u> bahçede toplanıp töreni izledi. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- A) Eğitim veren kurum
- B) Okulun binası
- **C) Okuldaki öğrenci ve öğretmenlerin hepsi**
- D) Bir sanat ya da düşünce akımı
- E) Okulun bahçesi

### 189. QZ-D6306B5D62C243448A39C0E2BF48BF52 · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: A

> Sorun: Martıya “vak vak” sesi yakıştırılmıştı; III. cümlede yansıma sözcük yoktu, yalnızca birinde çizgi vardı ve kök belirsizdi (“altı çizili ya da ses çağrışımı yapan”).

**Önce:** I. Sokaktaki martıların <u>vak vak</u> sesleri, sabahın sessizliğini birden bozdu. II. Pencereden gelen tıkırtı, odadaki herkesin dikkatini kapıya çevirdi. III. Yağmur başlayınca çatının üstünden uzun süre kesintisiz bir ses duyuldu. Bu cümlelerde altı çizili …

  **A) Duyulan sesin doğrudan taklit edilmesiyle kurulmuş olmaları** · B) Bir nesnenin rengini ya da biçimini belirginleştirmeleri · C) Zaman, yer ve kişi bildiren özel adlar olmaları · D) Bir kavramı soyut ve dolaylı biçimde anlatmaları · E) Bir sözcüğün başka bir alanın terimi olarak kullanılması

**Sonra:** I. Göldeki ördeklerin <u>vak vak</u> sesleri sabahın sessizliğini bozdu. ⏎ II. Pencereden gelen <u>tıkırtı</u> herkesin dikkatini çekti. ⏎ III. Yağmur başlayınca çatıdan <u>şıpır şıpır</u> damlalar düştü. ⏎ ⏎ Bu cümlelerdeki altı çizili sözlerin ortak özelliği aşağıdakilerden hangisidir?

- **A) Duyulan seslerin taklit edilmesiyle oluşmaları**
- B) Bir nesnenin rengini ya da biçimini belirtmeleri
- C) Zaman, yer ya da kişi bildiren özel adlar olmaları
- D) Bir kavramı soyut ve dolaylı biçimde anlatmaları
- E) Bir bilim dalına özgü terimler olmaları

### 190. QZ-EF7380DFE86147D4A3D60E46964E7A6B · Quiz/System · Sözcükte Anlam — Orta
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Cümlelerin bir kısmı anlamsızdı (“hırsız kilidi çalar”, “rüzgâr kiremitleri çalar”); sözcük beş cümlede üç farklı anlamda geçtiği için tek doğru belirlenemiyordu.

**Önce:** Aşağıdaki cümlelerde geçen altı çizili sözcüklerden hangisi, diğerlerinden farklı bir anlamda kullanılmıştır? ⏎ I. Babam, akşamları eski plakları <u>çalar</u>. ⏎ II. Hırsız, penceredeki kilidi sessizce <u>çalar</u>. ⏎ III. Rüzgâr, sabaha karşı çatıdaki kiremit…

  A) I. cümledeki kullanım, diğerlerinden daha farklı bir anlam t… · B) II. cümledeki kullanım, diğerlerinden daha farklı bir anlam … · **C) III. cümledeki kullanım, diğerlerinden daha farklı bir anlam…** · D) IV. cümledeki kullanım, diğerlerinden daha farklı bir anlam … · E) V. cümledeki kullanım, diğerlerinden daha farklı bir anlam t…

**Sonra:** I. Babam akşamları eski plakları <u>çalar</u>. ⏎ II. Orkestra, konserin sonunda son parçayı <u>çaldı</u>. ⏎ III. Hırsız, kalabalıkta yaşlı adamın cüzdanını <u>çaldı</u>. ⏎ IV. Kardeşim her akşam piyano <u>çalar</u>. ⏎ V. Köşedeki sokak müzisyeni keman <u>çalıyordu</u>. ⏎ ⏎ Yukarıdakilerin hangisinde altı çizili sözcük ötekilerden farklı anlamda kullanılmıştır?

- A) I
- B) II
- **C) III**
- D) IV
- E) V

### 191. QZ-F32E0D4D207F4E2CA087951834584EE7 · Quiz/System · Sözcükte Anlam — Orta
**Düzeltildi** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: C

> Sorun: Kökte çizili sözcük vardı ama 'altı çizili' denmiyordu ve şıklardaki sözcükler işaretli değildi; kök uzun ve cevabı açıklıyordu.

**Önce:** Aşağıdaki cümlelerin hangisinde <u>ince</u> sözcüğü, somut bir nesnenin fiziksel özelliğini değil, bir davranışın ya da yaklaşımın daha duyarlı ve özenli oluşunu anlatmaktadır?

  A) Bu kumaşın dokusu oldukça incedir ve kolayca yıpranır. · B) Sınıftaki ince ses, arka sıralardan bile rahatça duyuluyordu… · **C) Onun ince tavrı, tartışma sırasında kimseyi kırmadan konuşma…** · D) Bu kalemin ucu ince olduğu için ayrıntılar rahatça çiziliyor… · E) Kışın dağ yollarında ince bir buz tabakası oluşmuştu.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük bir davranışın nazik ve özenli oluşunu anlatmaktadır?

- A) Bu kumaşın dokusu oldukça <u>ince</u> olduğu için kolayca yıpranır.
- B) Sınıftaki <u>ince</u> ses arka sıralardan bile rahatça duyuluyordu.
- **C) Onun <u>ince</u> tavrı, tartışmada kimseyi kırmadan konuşmasını sağladı.**
- D) Kalemin ucu <u>ince</u> olduğu için ayrıntılar rahatça çiziliyor.
- E) Kışın dağ yollarında <u>ince</u> bir buz tabakası oluşmuştu.

### 192. QZ-088F0DAE1C4F4FFC8AE7903F80E4C9E1 · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Kök “kalın yazılmış sözcük” diyordu; uygulama kalın yazıyı göstermiyor, sözcük altı çiziliydi.

**Önce:** Aşağıdaki cümlede kalın yazılmış sözcük, anlatımın içinde hangi anlam özelliğini taşımaktadır? ⏎ ⏎ Cumhuriyetin ilk yıllarında kentlere yapılan yatırımlar <u>arttı</u>, buna bağlı olarak ulaşım ağları ve kamu hizmetleri de daha hızlı gelişti.

  **A) Sözcük, sayıca ölçülebilen bir değişimi bildirir.** · B) Sözcük, duygu ve düşünceyi dolaylı biçimde anlatır. · C) Sözcük, bir nesnenin adını doğrudan karşılar. · D) Sözcük, soyut bir yargıyı açıkça belirtir. · E) Sözcük, bir ses taklidini ifade eder.

**Sonra:** Cumhuriyetin ilk yıllarında kentlere yapılan yatırımlar <u>arttı</u>, buna bağlı olarak ulaşım ağları ve kamu hizmetleri de daha hızlı gelişti. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlam özelliğini taşımaktadır?

- **A) Ölçülebilen bir miktardaki değişimi bildirir.**
- B) Bir duyguyu dolaylı biçimde anlatır.
- C) Bir nesnenin adını doğrudan karşılar.
- D) Soyut bir değeri över.
- E) Bir ses taklidinden türemiştir.

### 193. QZ-0AB8355EB9394A6D99D02EFD0A0B2F24 · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_11 Yansıma Sözcükler · Doğru: A

> Sorun: Soru doğruydu; kök sadeleştirildi, alt konusu atanıp çözüm yenilendi.

**Önce:** Bir kargo merkezinde çalışan görevli, sabah vardiyasında yaşananları rapora şöyle geçiriyor: "Kamyon geri geri gelirken <u>tak tak</u> sesleri arttı, ardından depoda kısa bir sessizlik oldu." Bu cümlede altı çizili ifade, anlam bakımından hangi özelliği taşır?

  **A) Duyulan sesin doğrudan taklit edilerek verilmesi** · B) Bir durumun abartılı biçimde anlatılması · C) Sesin türünü belirten teknik bir terim kullanılması · D) Bir nesnenin rengini belirten somut bir ifade kullanılması · E) Zıt anlamlı iki sözcüğün yan yana getirilmesi

**Sonra:** Depo görevlisi raporuna şöyle yazdı: “Kamyon geri geri gelirken <u>tak tak</u> sesleri arttı, ardından depoda kısa bir sessizlik oldu.” ⏎ ⏎ Bu cümledeki altı çizili söz hangi özelliği taşır?

- **A) Duyulan sesin doğrudan taklit edilmesiyle oluşmuştur.**
- B) Bir durumu abartılı biçimde anlatır.
- C) Sesin türünü belirten teknik bir terimdir.
- D) Bir nesnenin rengini belirtir.
- E) Karşıt anlamlı iki sözcükten oluşur.

### 194. QZ-2317D8B9E1134A76B9F6933B0267C92F · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_06 Nitel ve Nicel Anlam · Doğru: A

> Sorun: Örnek kullanımlar verilmeden yalnızca anlatılmıştı; doğru kabul edilen açıklama karışıktı (“ölçülebilir bir özellik” - “nicelik bildiren durum”).

**Önce:** Bir mağazada aynı ürünün farklı paketleri için hazırlanan açıklamada, “küçük”, “orta” ve “büyük” ibareleri kullanılıyor; ancak “küçük” sözcüğü bir yerde ürünün fiziksel boyutunu, başka bir yerde ise fiyat farkını anlatıyor. Bu iki kullanım arasındaki ayrımı en…

  **A) İlk kullanım ölçülebilir bir özelliği, ikinci kullanım ise n…** · B) İlk kullanım soyut bir yargıyı, ikinci kullanım ise somut bi… · C) İlk kullanım olumlu bir değerlendirmeyi, ikinci kullanım ise… · D) İlk kullanım genel bir anlamı, ikinci kullanım ise özel bir … · E) İlk kullanım eş sesli bir sözcüğü, ikinci kullanım ise yansı…

**Sonra:** I. Bu ürünün <u>küçük</u> paketi çantaya rahatça sığıyor. ⏎ II. İki paket arasında yalnızca <u>küçük</u> bir fiyat farkı var. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerle ilgili aşağıdakilerden hangisi doğrudur?

- **A) I'de boyut bildiren bir nitelik, II'de miktarın azlığını bildiren bir anlam taşır.**
- B) I'de soyut, II'de somut bir anlam taşır.
- C) I'de olumlu, II'de olumsuz bir değerlendirme bildirir.
- D) I'de genel, II'de özel anlamdadır.
- E) İki sözcük birbiriyle eş seslidir.

### 195. QZ-3838BCCCA085411BB9841CF610CDE899 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_08 Eş ve Yakın Anlamlı Sözcükler · Doğru: B

> Sorun: Cevap anahtarı yanlıştı: “okumak” ile “gözden geçirmek” eş anlamlı değildir, biri ötekinin yerini tutmaz; doğru kabul edilen yargı yanlıştı. Doğru yargı aynı harfe yerleştirildi.

**Önce:** Aşağıdaki cümlelerde altı çizili sözcüklerin anlam ilişkisi için en uygun yargı hangisidir? "Yeni aldığı kitabı bir solukta <u>okudu</u>; ardından notlarını hızlıca <u>gözden geçirdi</u>."

  A) İki sözcük arasında anlam yakınlığı vardır; biri daha genel,… · **B) İki sözcük arasında anlam eşdeğerliliği vardır; bağlama göre…** · C) İki sözcük arasında karşıtlık vardır; biri olumlu, diğeri ol… · D) İki sözcük arasında neden-sonuç ilişkisi vardır; biri diğeri… · E) İki sözcük arasında ses benzerliği vardır; anlamları arasınd…

**Sonra:** Yeni aldığı kitabı bir solukta <u>okudu</u>; ardından notlarını hızlıca <u>gözden geçirdi</u>. ⏎ ⏎ Bu cümledeki altı çizili sözlerle ilgili aşağıdakilerden hangisi doğrudur?

- A) İki söz eş anlamlıdır; birbirinin yerine kullanılabilir.
- **B) İki söz yakın anlamlıdır; ikincisi bir metne ayrıntıya girmeden göz atmayı anlatır.**
- C) İki söz karşıt anlamlıdır.
- D) İki söz de mecaz anlamdadır.
- E) İki söz eş seslidir.

### 196. QZ-3E9816AA6D734F48A269587A2E351FC9 · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: C

> Sorun: Soru doğruydu; kök sadeleştirildi, alt konusu atanıp çözüm yenilendi.

**Önce:** Aşağıdaki kısa paragrafta geçen altı çizili sözcük, cümledeki kullanımıyla değerlendirildiğinde hangi anlam özelliğini örneklemektedir? ⏎ ⏎ “Son günlerde içime çöken <u>ağırlık</u>, derslere odaklanmamı zorlaştırdı; buna rağmen birkaç saatlik dinlenmeden sonra…

  A) Duyularla algılanabilen bir durumu anlatmaktadır. · B) Somut bir varlığın ölçülebilir niteliğini belirtmektedir. · **C) Soyut bir duygu ya da iç durumunu karşılamaktadır.** · D) Bir nesnenin ağırlık ölçüsünü doğrudan vermektedir. · E) Gündelik kullanım dışında teknik bir kavramı karşılamaktadır…

**Sonra:** Son günlerde içime çöken <u>ağırlık</u>, derslere odaklanmamı zorlaştırdı; birkaç saatlik dinlenmeden sonra zihnim biraz toparlandı. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Duyularla algılanabilen bir durumu anlatır.
- B) Somut bir varlığın ölçülebilir niteliğini belirtir.
- **C) Soyut bir duygu ya da iç durumu karşılar.**
- D) Bir nesnenin ağırlık ölçüsünü doğrudan verir.
- E) Teknik bir kavramı karşılar.

### 197. QZ-60479FA4D6B14BE385DA96F51FC6DB3B · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: B

> Sorun: Kökteki tarihsel giriş gereksiz ve yanıltıcıydı; A şıkkındaki “veri” ve “göç” sözcükleri de terim sayılabileceğinden yanıt tartışmalıydı.

**Önce:** Osmanlı’dan Cumhuriyet’e uzanan süreçte bazı kelimeler, günlük konuşmada geniş bir anlam taşırken belli alanlarda daha dar ve teknik bir kullanıma kavuşmuştur. Aşağıdaki cümlelerin hangisinde, bir sözcüğün özel bir alanda yerleşmiş anlamı kullanılmaktadır?

  A) Bu yılın verileri, kentteki göç hareketinin hızlandığını gös… · **B) Tıp fakültesindeki konferansta doz, hastanın kilosuna göre y…** · C) Rüzgâr, akşamüstü sokaklarda usul usul dolaşıyordu. · D) Babam, eski defterleri karıştırırken çocukluk günlerine dönd… · E) Toplantıda herkes, yeni yol haritası için farklı öneriler su…

**Sonra:** Aşağıdaki cümlelerin hangisinde terim anlamlı bir sözcük kullanılmıştır?

- A) Bu yıl kentimizde kış her zamankinden uzun sürdü.
- **B) Hekim, ilacın dozunu hastanın kilosuna göre yeniden hesapladı.**
- C) Rüzgâr, akşamüstü sokaklarda usul usul esiyordu.
- D) Babam eski defterleri karıştırırken çocukluk günlerini andı.
- E) Toplantıda herkes yeni plan için farklı öneriler sundu.

### 198. QZ-7B3275C04D2041269C2C3AE7A333EE20 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_03 Terim Anlam · Doğru: C

> Sorun: Kök cevabı içinde veriyordu (“belirli bir alanın kavramlarını karşılamak için seçilmiştir”); sözcükler bir cümle içinde verilmemişti.

**Önce:** Osmanlı’dan Cumhuriyet’e geçiş sürecini anlatan bir metinde, “divan”, “tezhip”, “aruz” ve “kaside” gibi sözcüklerin aynı cümle içinde kullanılması, anlatımın hangi yönünü öne çıkarır? Metnin genel anlamına göre bu sözcükler, günlük kullanımda değil, belirli bi…

  A) Sözcüklerin duygusal çağrışım gücünü artırır. · B) Sözcüklerin tarihsel kökenlerini belirginleştirir. · **C) Sözcüklerin bir bilim ya da sanat alanına bağlı olduğunu gös…** · D) Sözcüklerin mecazlı bir anlatım kurduğunu ortaya koyar. · E) Sözcüklerin karşıt anlam ilişkisi kurduğunu gösterir.

**Sonra:** Öğretmen derste divan şiirinde <u>aruz</u> ölçüsünün nasıl kullanıldığını, <u>kaside</u> türünün bölümlerini ve el yazması divanlardaki <u>tezhip</u> sanatını anlattı. ⏎ ⏎ Bu cümledeki altı çizili sözcüklerin ortak özelliği aşağıdakilerden hangisidir?

- A) Duygusal çağrışımları güçlü sözcükler olmaları
- B) Gündelik dilde sık kullanılmaları
- **C) Bir sanat alanına özgü kavramları karşılamaları**
- D) Mecaz anlamda kullanılmaları
- E) Birbirleriyle karşıt anlam ilişkisi kurmaları

### 199. QZ-8952D7A309184D358F9F57774BF30AF2 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: E

> Sorun: Cevap anahtarı yanlıştı: dört cümlede “kırmak” dört farklı anlamdayken “hepsi aynı anlamda” şıkkı doğru kabul edilmişti; cümleler bozuktu (“sonunda kırdı döngüyü”, “oyunu bırakıp kırdı”), kök “koyu yazılan” diyordu.

**Önce:** Aşağıdaki cümlelerde koyu yazılan sözcüklerden hangisi, kullanılma biçimi bakımından diğerlerinden farklı bir anlam ilişkisi kurmuştur? I. Uzun tartışmalar sonunda ekip, sonunda <u>kırdı</u> döngüyü ve yeni bir plan hazırladı. II. Bu haber, herkesi bir anda <u…

  A) I. cümledeki sözcük, sonuç alma ve engeli aşma anlamı kazanm… · B) II. cümledeki sözcük, üzmek ve moral bozmak anlamı kazanmışt… · C) III. cümledeki sözcük, topluluğu hızla dağıtıp ayrılmak anla… · D) IV. cümledeki sözcük, fiziksel olarak parçalanmak anlamında … · **E) Hepsi aynı bağlamda, doğrudan parçalanma anlamında kullanılm…**

**Sonra:** I. Ekip, uzun tartışmalardan sonra aradaki buzları <u>kırdı</u>. ⏎ II. Bu acı haber hepimizin moralini <u>kırdı</u>. ⏎ III. Kaptan, fırtına yaklaşınca dümeni sola <u>kırdı</u>. ⏎ IV. Rakip takım bu sezon gol rekorunu <u>kırdı</u>. ⏎ V. Çocuk, topla oynarken komşunun camını <u>kırdı</u>. ⏎ ⏎ Yukarıdakilerin hangisinde altı çizili sözcük gerçek anlamıyla kullanılmıştır?

- A) I
- B) II
- C) III
- D) IV
- **E) V**

### 200. QZ-8F1BC141E4F84566A799BC36D3FE193F · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_13 Anlam Değişmesi · Doğru: B

> Sorun: Kökteki tarihsel bilgi (“şarj” sözcüğünün Osmanlı'da askerî bir işlemi anlattığı) doğrulanamıyordu; soru dayanaksız bir bilgiye kurulmuştu.

**Önce:** Aşağıdaki paragrafta geçen <u>şarj</u> sözcüğünün zaman içindeki anlam değişimi, hangi seçenekte doğru biçimde açıklanmıştır? Osmanlı’dan Cumhuriyet’in ilk yıllarına uzanan günlük yaşam metinlerinde bu sözcük, önce askerî bir düzenleme ve doldurma işlemi için …

  A) Sözcük, tarih içinde daralarak yalnızca eski bir resmî işlem… · **B) Sözcük, yeni bir nesne ve durumla ilişkilendirilerek eski an…** · C) Sözcük, yazılışını değiştirmeden ses değerini koruyup anlam … · D) Sözcük, birden fazla anlamını aynı anda eşit ölçüde koruyara… · E) Sözcük, yalnızca deyim içinde yaşayan kalıplaşmış bir anlatı…

**Sonra:** Bilgisayarın <u>faresi</u> bozulunca bütün gün işlerim aksadı. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Anlamı daralarak yalnızca eski bir kavramı karşılar hâle gelmiştir.
- **B) Yeni bir nesneyle ilişkilendirilerek benzerlik yoluyla yeni bir anlam kazanmıştır.**
- C) Gerçek anlamıyla bir hayvanı karşılamaktadır.
- D) Eş sesli başka bir sözcükle karıştırılmıştır.
- E) Bir deyimin parçası olarak kullanılmıştır.

### 201. QZ-8F23038529124552B5FBCFACE2B0CE38 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_02 Mecaz Anlam · Doğru: B

> Sorun: Cevap anahtarı yanlıştı: “hafif bir dil” ciddiyetten uzak anlatım demektir, mecazdır; doğru kabul edilen “gerçek anlamına bağlı kalarak” yargısı yanlıştı. Kök “1.” ile başlıyordu. Doğru yargı aynı harfe yerleştirildi.

**Önce:** 1. Bir yazar, yeni kitabı için hazırladığı notlarda şu cümleleri kullanmıştır: “İlk baskıdaki bazı bölümler <u>hafif</u> bir dille yazıldı; ancak ikinci baskıda anlatım daha ciddi bir tona kavuştu. Okur, ilk baskıda sözü edilen ayrıntıları kolayca fark etti.” …

  A) Sözcüğün, ölçülebilir bir miktarı bildirmesiyle kullanılmışt… · **B) Sözcüğün, gerçek anlamına bağlı kalarak nesnenin niteliğini …** · C) Sözcüğün, soyut bir duyguyu karşılayacak biçimde kullanılmış… · D) Sözcüğün, teknik bir alanın özel kavramını karşılamasıyla ku… · E) Sözcüğün, eş sesli başka bir anlamını çağrıştıracak biçimde …

**Sonra:** Yazar, notlarında “İlk baskıdaki bazı bölümler <u>hafif</u> bir dille yazıldı; ikinci baskıda ise anlatım daha ciddi bir tona kavuştu.” demiştir. ⏎ ⏎ Bu cümledeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Ölçülebilir bir ağırlığı bildirir.
- **B) Gerçek anlamından uzaklaşarak anlatımın ciddiyetten uzak olduğunu bildirir.**
- C) Soyut bir duyguyu adlandırır.
- D) Teknik bir alanın kavramını karşılar.
- E) Eş sesli başka bir sözcüktür.

### 202. QZ-A0EC1D42FBBD4932A24BD40EC7F4BE36 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: D

> Sorun: Üç cümlede üç farklı anlam vardı ama hangisinin karşılaştırılacağı belirtilmemişti; soru çözülemiyordu, kök 'altı çizili' demiyordu.

**Önce:** Aşağıdaki cümlelerde geçen <u>ince</u> sözcüğü, hangi seçenekteki kullanımla aynı anlam ilişkisini kurar? I. Bu konuda çok ince düşünüp en küçük ayrıntıyı bile atlamadı. II. İnce bir ses, koridorun sonunda yankılandı. III. Çocuk, ince bir atkıyı boynuna doladı…

  A) Masadaki ince çizgi, uzaktan ancak seçiliyordu. · B) Onun ince davranışı, herkesin dikkatini çekti. · C) Uzun ince bir yol, ovayı baştan başa geçiyordu. · **D) İnce bir hesap yapmadan işe girişmemek gerekir.** · E) Bu ince kumaş, yaz günlerinde daha rahattır.

**Sonra:** Bu konuda çok <u>ince</u> düşünüp en küçük ayrıntıyı bile atlamadı. ⏎ ⏎ Bu cümledeki altı çizili sözcük, aşağıdakilerin hangisinde aynı anlamda kullanılmıştır?

- A) Masadaki ince çizgi uzaktan ancak seçiliyordu.
- B) Onun ince davranışı herkesin dikkatini çekti.
- C) Uzun ince bir yol ovayı baştan başa geçiyordu.
- **D) İnce bir hesap yapmadan işe girişmemek gerekir.**
- E) Bu ince kumaş yaz günlerinde daha rahattır.

### 203. QZ-B2FA52584AD24092B984405338710F31 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: A

> Sorun: Bütün şıklarda “köylü” sözcüğü hem tek kişi hem topluluk olarak okunabildiğinden (D'de “birlikte yaptı” bile vardı) tek doğru belirlenemiyordu; kök 'altı çizili' demiyordu.

**Önce:** Aşağıdaki cümlelerin hangisinde <u>köylü</u> sözcüğü, tek tek bireyleri değil, bir topluluğu ya da kesimi anlatacak biçimde kullanılmıştır? Cümlelerin anlamına dikkat ederek değerlendiriniz.

  **A) Köylü, sabahın erken saatlerinde pazara ürün indirdi.** · B) Köylü, bu yıl yağış az olduğu için tarlasını geç sürdü. · C) Köylü, toplantıda söz alıp yeni yolu destekledi. · D) Köylü, kış gelince ahırın bakımını birlikte yaptı. · E) Köylü, komşusuna göre daha çalışkan biri olarak tanındı.

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük tek bir kişiyi değil, bir toplumsal kesimin tamamını karşılamaktadır?

- **A) Cumhuriyetin ilk yıllarında <u>köylü</u>, ülke nüfusunun büyük bölümünü oluşturuyordu.**
- B) Yoldan geçen <u>köylü</u>, bize çeşmenin yerini gösterdi.
- C) Toplantıda söz alan yaşlı <u>köylü</u> yeni yolu destekledi.
- D) Komşumuz olan <u>köylü</u> kışlık odununu erkenden hazırladı.
- E) Pazarda tanıştığımız <u>köylü</u> bize taze peynir sattı.

### 204. QZ-B3D02DA1284145F4BC1F2FBE2EB77919 · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_05 Somut ve Soyut Anlam · Doğru: D

> Sorun: Yalnız iki sözcük çiziliydi; A ve C şıkları da doğru yargılar içerdiğinden birden çok doğru cevap vardı.

**Önce:** Aşağıdaki kısa notta geçen altı çizili sözcüklerin hangi özelliği taşıdığı düşünülmektedir? ⏎ ⏎ I. Kutunun içinden çıkan taş, avucumda ağır geldi. ⏎ II. Sınavdan sonra içimde tuhaf bir <u>ağırlık</u> kaldı. ⏎ III. Rafın üstündeki kitap, çantadakinden daha hafi…

  A) I ve III. cümlelerdeki sözcükler nesnel bir durumu bildirmek… · B) II ve IV. cümlelerdeki sözcükler dokunma duyusuyla algılanan… · C) I ve IV. cümlelerdeki sözcükler ölçülebilen bir özelliği bil… · **D) II. cümledeki sözcük, elle tutulamayan bir durumu bildirmekt…** · E) III. cümledeki sözcükler soyut bir duyguyu anlatmaktadır.

**Sonra:** I. Kutudan çıkan taş avucumda <u>ağır</u> geldi. ⏎ II. Sınavdan sonra içimde tuhaf bir <u>ağırlık</u> kaldı. ⏎ III. Raftaki kitap çantadakinden daha <u>hafifti</u>. ⏎ IV. Uzun yolculukta omzumdaki çanta giderek <u>ağırlaştı</u>. ⏎ ⏎ Yukarıdakilerin hangisinde altı çizili sözcük elle tutulamayan, soyut bir durumu bildirir?

- A) Yalnız I
- B) Yalnız III
- C) I ve IV
- **D) Yalnız II**
- E) II ve IV

### 205. QZ-BBFC4B68DD6849B78B59EEC43A37E924 · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kök “koyu yazılmış” diyordu; ikinci cümle soruyla ilgisizdi; kışın derenin daralması da anlamca tutarsızdı.

**Önce:** Aşağıdaki iki cümlede koyu yazılmış sözcüklerin anlamı, aynı kökten gelmelerine rağmen birbirinden farklıdır. Bu farkı doğru belirleyen öğrenci, birinci cümledeki sözcüğün hangi anlamda kullanıldığını ikinci cümledeki kullanımından ayırt edebilmelidir: “Kış ba…

  **A) Birinci cümlede sözcük, genişliği azalmak anlamında kullanıl…** · B) Birinci cümlede sözcük, sayıca eksilmek anlamında kullanılmı… · C) Birinci cümlede sözcük, uzunluğu kısalmak anlamında kullanıl… · D) Birinci cümlede sözcük, kapsamı dar bir alana sıkışmak anlam… · E) Birinci cümlede sözcük, yapısal olarak bozularak işlevini yi…

**Sonra:** Kurak geçen yazın ardından köyün yanındaki dere iyice <u>daraldı</u>. ⏎ ⏎ Bu cümledeki altı çizili sözcük hangi anlamda kullanılmıştır?

- **A) Genişliği azalmak**
- B) Sayıca eksilmek
- C) Uzunluğu kısalmak
- D) Sıkıntıdan bunalmak
- E) Bozularak işlevini yitirmek

### 206. QZ-C2209C1BBC8F474689D1E665017D1C5A · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_10 Eş Sesli Sözcükler · Doğru: B

> Sorun: Çizgi sözcük ortasından kesiyordu (“<u>yaz</u>dığı”); kökteki “farklı bir söz varlığına dayanır” ifadesi belirsizdi.

**Önce:** Bir metinde yer alan şu cümleler inceleniyor: I. Sabahın ilk ışıklarıyla birlikte köyün <u>yaz</u> işleri başladı. II. Öğretmen, sınavdan sonra öğrencilerin <u>yaz</u>dığı notları topladı. III. Çocuklar parkta uzun süre <u>yaz</u> oyunları oynadı. Bu cümlelerd…

  A) I. cümledeki kullanım · **B) II. cümledeki kullanım** · C) III. cümledeki kullanım · D) I. ve II. cümledeki kullanımlar · E) II. ve III. cümledeki kullanımlar

**Sonra:** I. Sabahın ilk ışıklarıyla birlikte köyün <u>yaz</u> işleri başladı. ⏎ II. Öğretmen, sınavdan sonra öğrencilerin <u>yazdığı</u> notları topladı. ⏎ III. Çocuklar parkta uzun süre <u>yaz</u> oyunları oynadı. ⏎ ⏎ Yukarıdakilerin hangisinde altı çizili sözcük, ötekilerle eş seslidir?

- A) I
- **B) II**
- C) III
- D) I ve II
- E) II ve III

### 207. QZ-C94F977036424B27A448B18BF2E3D582 · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: A

> Sorun: Kökte çizili sözcük vardı ama 'altı çizili' denmiyordu ve şıklardaki sözcükler işaretli değildi; kökte gereksiz yönergeler vardı.

**Önce:** Aşağıdaki cümlelerin hangisinde <u>sert</u> sözcüğü, sert bir zemine dokunma anlamında kullanılmıştır? Cümlelerdeki kullanımı dikkatle karşılaştırınız ve anlamı bağlamdan çıkarınız.

  **A) Bu sandalyenin yüzeyi oldukça sert olduğu için uzun süre otu…** · B) Sınavdan önceki sert uyarı, sınıftaki herkesin dikkatini top… · C) Onun sert bakışları, konuşmanın yönünü bir anda değiştirdi. · D) Kışın sert geçen günleri, yolu kaplayan karı daha da artırdı… · E) Yeni düzenleme, küçük işletmeler için sert bir yük oluşturdu…

**Sonra:** Aşağıdaki cümlelerin hangisinde altı çizili sözcük “dokunulduğunda yumuşak olmayan, katı” anlamında kullanılmıştır?

- **A) Bu sandalyenin oturma yeri oldukça <u>sert</u> olduğu için uzun süre oturamadı.**
- B) Sınavdan önceki <u>sert</u> uyarı sınıftaki herkesin dikkatini topladı.
- C) Onun <u>sert</u> bakışları konuşmanın yönünü bir anda değiştirdi.
- D) Bu yıl kış oldukça <u>sert</u> geçti.
- E) Yeni vergi düzenlemesi küçük işletmeler için <u>sert</u> bir önlem oldu.

### 208. QZ-D00AF82A5A5B4617B413D14B348B9CCB · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_09 Karşıt Anlamlı Sözcükler · Doğru: A

> Sorun: Kök “koyu yazılan sözcük” diyordu; uygulama koyu yazıyı göstermiyor, sözcük altı çiziliydi.

**Önce:** Aşağıdaki kısa paragrafta koyu yazılan sözcüğün anlamı, cümledeki kullanıma göre hangi seçenekteki sözcükle en iyi karşıtlık kurar? "Sınavdan sonra sınıfta <u>sessiz</u> bir bekleyiş vardı; fakat koridordan gelen haberle ortam bir anda değişti."

  **A) Gürültülü bir hareketlilik** · B) Kısa süreli bir durgunluk · C) Dikkatli bir hazırlık · D) İçten bir rahatlama · E) Yavaş bir toparlanma

**Sonra:** Sınavdan sonra sınıfta <u>sessiz</u> bir bekleyiş vardı; fakat koridordan gelen haberle ortam bir anda değişti. ⏎ ⏎ Bu cümledeki altı çizili sözcüğün anlamca karşıtı aşağıdakilerin hangisinde vardır?

- **A) Gürültülü bir hareketlilik**
- B) Kısa süreli bir durgunluk
- C) Dikkatli bir hazırlık
- D) İçten bir rahatlama
- E) Yavaş bir toparlanma

### 209. QZ-E0A2D68E4F9447348EB62CF62C0003B1 · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_07 Genel ve Özel Anlam · Doğru: C

> Sorun: E şıkkı (“çiçek, gülden daha geneldir”) da doğru olduğundan iki doğru cevap vardı; soru cümlesindeki “kapsayıcı” sözcüğü gereksiz yere çizilmişti, “<u>gül</u>ler” sözcük ortasından kesilmişti.

**Önce:** Aşağıdaki cümlelerde altı çizili sözcüklerden hangisi, diğerlerinden daha <u>kapsayıcı</u> bir anlam taşımaktadır? ⏎ I. Bu bölgede <u>çiçek</u> yetiştiriciliği son yıllarda arttı. ⏎ II. Parkın girişindeki <u>ağaç</u> gölgesi öğleden sonra serinlik veriyor. ⏎ I…

  A) I. cümledeki sözcük, II. cümledeki sözcükten daha genel bir … · B) II. cümledeki sözcük, III. cümledeki sözcükten daha genel bi… · **C) III. cümledeki sözcük, I. cümledeki sözcükten daha genel bir…** · D) IV. cümledeki sözcük, I. cümledeki sözcükten daha genel bir … · E) I. cümledeki sözcük, IV. cümledeki sözcükten daha genel bir …

**Sonra:** I. Bu bölgede <u>çiçek</u> yetiştiriciliği son yıllarda arttı. ⏎ II. Parkın girişindeki <u>ağaç</u> öğleden sonra serin bir gölge veriyor. ⏎ III. Bahçedeki <u>bitki</u> sayısı beklenenden fazlaydı. ⏎ IV. Seradaki <u>güller</u> sabah erken saatlerde açtı. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcüklerle ilgili aşağıdakilerden hangisi doğrudur?

- A) I. cümledeki sözcük, II. cümledekinden daha genel anlamlıdır.
- B) II. cümledeki sözcük, III. cümledekinden daha genel anlamlıdır.
- **C) III. cümledeki sözcük, I. cümledekinden daha genel anlamlıdır.**
- D) IV. cümledeki sözcük, I. cümledekinden daha genel anlamlıdır.
- E) IV. cümledeki sözcük, II. cümledekinden daha genel anlamlıdır.

### 210. QZ-ECD74912A26242A18EDED7DFA5AED5DA · Quiz/System · Sözcükte Anlam — Zor
**Düzeltildi** · SOZCUKTE_ANLAM_01 Gerçek Anlam · Doğru: A

> Sorun: Kök “koyu yazılmış” diyordu; şıklar her cümleyi doğru biçimde betimlediği için (ör. D) birden çok doğru yargı vardı.

**Önce:** Aşağıdaki cümlelerde koyu yazılmış sözcüklerden biri, gerçek anlamıyla kullanıldığı için diğerlerinden ayrılır. Buna göre numaralanmış cümlelerden hangisinde sözcük, günlük kullanımda akla gelen temel anlamıyla verilmiştir? ⏎ ⏎ I. Uzun yürüyüşten sonra ayaklar…

  **A) I. cümledeki sözcük, bedensel bir durumu doğrudan anlatmakta…** · B) II. cümledeki sözcük, zihinsel bir yorgunluğu dolaylı olarak… · C) III. cümledeki sözcük, ortamın huzursuzlaşmasını mecaz yoluy… · D) IV. cümledeki sözcük, nesnelerin yer değiştirmeden durmasını… · E) V. cümledeki sözcük, bir davranışın duygusal etkisini anlatm…

**Sonra:** I. Uzun yürüyüşten sonra ayakları <u>şişti</u>. ⏎ II. Yoğun program yüzünden zihni iyice <u>şişti</u>. ⏎ III. Tartışma uzayınca ortam birden <u>gerildi</u>. ⏎ IV. Eski dosyalar yıllarca rafın üstünde <u>yattı</u>. ⏎ V. Sözleriyle arkadaşının canını <u>yaktı</u>. ⏎ ⏎ Yukarıdakilerin hangisinde altı çizili sözcük gerçek anlamıyla kullanılmıştır?

- **A) I**
- B) II
- C) III
- D) IV
- E) V

### 211. QZ-F8394DC8108D44CE8257C2DC2E863DAE · Quiz/System · Sözcükte Anlam — Zor
**Yeniden yazıldı** · SOZCUKTE_ANLAM_12 Sözcüğün Bağlamdaki Anlamı · Doğru: C

> Sorun: Kök var olmayan bir tabloya atıf yapıyordu; değerlendirilecek sözcük ve cümleler verilmemişti.

**Önce:** Aşağıdaki tabloda bir öğrencinin aynı sözcüğü farklı cümlelerde nasıl kullandığı gösterilmiştir. Bu kullanımlara bakıldığında, sözcüğün her cümlede taşıdığı anlamın değiştiği görülmektedir. Buna göre, tabloda yer alan sözcüğün hangi anlam özelliği öne çıkmakta…

  A) Sözcüğün, gerçek anlamını koruyarak yalnızca ses değeriyle f… · B) Sözcüğün, yeni bir kavram alanında teknik bir karşılık kazan… · **C) Sözcüğün, geçtiği cümleye göre farklı bir anlam katmanı edin…** · D) Sözcüğün, yalnızca somut varlıkları karşılayacak biçimde kul… · E) Sözcüğün, zıt anlamlısı ile birlikte düşünülerek anlam kazan…

**Sonra:** I. Çıkarken kapıyı <u>açık</u> bıraktı. ⏎ II. Öğretmen konuyu <u>açık</u> bir dille anlattı. ⏎ III. Düğün için <u>açık</u> mavi bir gömlek giydi. ⏎ ⏎ Bu cümlelerdeki altı çizili sözcükle ilgili aşağıdakilerden hangisi doğrudur?

- A) Gerçek anlamını koruyup yalnızca ses değeriyle farklılaşmıştır.
- B) Her cümlede teknik bir karşılık kazanmıştır.
- **C) Geçtiği cümleye göre farklı bir anlam kazanmıştır.**
- D) Yalnızca somut varlıkları karşılamıştır.
- E) Her cümlede karşıt anlamlısıyla birlikte kullanılmıştır.

