# Eğitim Videoları (Courses)

Ders ve konu listesine bağlı YouTube eğitim videoları ile her birinin kısa özet videosunu üreten altyapı. Sosyal medya Reels akışından (`Posts/`, `npm run social`) ayrıdır; ortak bileşenleri (tema, yazı tipi, seslendirme, render, kapak, Reels kartları) kullanır, onların davranışını değiştirmez.

## 1. Akış

```
Ders listesi (CSV) + ReferenceCorpus
        │  npm run curriculum -- import
        ▼
Curriculum/  katalog · üretim kontrol listesi · konuya göre gruplanmış kaynaklar
        │  npm run curriculum -- next / brief <konu>
        ▼
Senaryo (metin + sahne planı)   Curriculum/Scripts/<Kategori>/<Ders>/<Konu>.json
        │  npm run curriculum -- check <senaryo> --mark      → "Hazırlandı"
        ▼
CourseLesson (YouTube, 16:9)  ve  CourseShort (Reels/TikTok/Shorts, 9:16)
        │  npm run render  (seslendirme: marka sesi, metin bütün olarak)
        ▼
npm run curriculum -- mark <konu> --stage youtube|short --file Outputs/...
```

Sıra her zaman aynıdır: **önce metin ve sahne senaryosu**, sonra görseller ve seslendirme. Bir senaryo tek dosyada hem YouTube dersini hem kısa özeti taşır.

## 2. Klasörler

| Yol | İçerik | Git |
| --- | --- | --- |
| `Curriculum/Sources/LessonList.csv` | Ders listesinin kendisi, değiştirilmeden | ✓ |
| `Curriculum/Catalog/<Kategori>.json` | Sınav → kategori → ders → konu → alt başlık hiyerarşisi (kodlar ve kimlikler platformla aynı) | ✓ |
| `Curriculum/Production/Checklist.json` · `.md` | Üretim kontrol listesi (aşağıda) | ✓ |
| `Curriculum/Production/ImportReport.json` | Son içe aktarmanın sayıları | ✓ |
| `Curriculum/ReferenceCorpus/TopicExplanations/<Sınav>/<Kategori>/<Ders>/<Konu>.json` | Konu anlatımı paketleri (MEB müfredat bilgi paketleri: birimler, bilgiler, kazanımlar, sık hatalar) | ✗ |
| `Curriculum/ReferenceCorpus/QuestionPools/<Sınav>/<Kategori>/<Ders>/<Konu>.jsonl` | Konuya bağlanmış çıkmış sorular; her satırda `source.file` ve `source.line` | ✗ |
| `…/<Ders>/_Lesson.jsonl` | Dersin konusu güvenle belirlenemeyen soruları | ✗ |
| `…/<Konu>.phenotypes.jsonl`, `_Lesson.phenotypes.jsonl` | Soruların yapısı (kalıp, zorluk, çeldirici türü) | ✗ |
| `Curriculum/ReferenceCorpus/Taxonomy/` | Kaynağın kendi kod tabloları ve ayrıştırma notları | ✗ |
| `Curriculum/Scripts/` | Senaryolar | ✓ |
| `public/Media/` + `Credits.json` | Lisansı kayıtlı görseller | ✓ |
| `public/Geo/` | Harita verileri (GeoJSON / TopoJSON) | ✓ |

`Curriculum/ReferenceCorpus/` git'e alınmaz: büyüktür (~140 MB) ve içindeki çıkmış sorular yeniden yayımlanamaz. Masaüstündeki kaynak yine asıl kopyadır; içe aktarma her çalıştırıldığında baştan kurulur.

İlk içe aktarmanın sonucu: 53 kategori, 112 ders, **1.128 konu (video)**, 7.907 alt başlık; 560 konu anlatımı paketi konularına bağlandı; 53.641 sorunun 24.387'si bir konuya, kalanı dersin genel havuzuna yerleşti; eşleşmeyen kayıt yok.

## 3. Üretim kontrol listesi

`Curriculum/Production/Checklist.md` bir bakışta görmek içindir; `Checklist.json` asıl kayıttır. Her satır bir **konu** (LessonSub): bir YouTube videosu ve bir kısa video. Alt başlıklar (LessonMikro) o videonun bölümleridir.

Sıra:

1. YKS → TYT, 2. YKS → AYT, 3. YKS → YDT, 4. KPSS (Lisans, Önlisans, Ortaöğretim), 5. listedeki diğer sınavlar.
2. Her kategoride önce **Türkçe → Matematik → Tarih**, sonra diğer dersler liste sırasıyla. AYT'de Türkçe'nin yerini Türk Dili ve Edebiyatı alır; Tarih-1 ve Tarih-2 ikisi de Tarih sayılır.
3. Konular ders listesindeki sırayla. İlk konu, listeden doğrulandı: **TYT · Türkçe · Sözcükte Anlam** (13 alt başlık).

| Aşama | Anlamı | Nasıl işaretlenir |
| --- | --- | --- |
| Hazırlandı | Metin ve sahne planı yazıldı, denetimden geçti | `check <senaryo> --mark` |
| Kullanıldı | Konunun kaynakları bir senaryoda kullanıldı | `check --mark` ile birlikte |
| YouTube videosu üretildi | — | `mark <konu> --stage youtube --file …` |
| Kısa video üretildi | — | `mark <konu> --stage short --file …` |

Her satır ayrıca konunun kaynaklarını gösterir: anlatım paketi var mı, konuya bağlı kaç soru, dersin genel havuzunda kaç soru. İçe aktarma yeniden çalıştırılırsa işaretler korunur.

```bash
npm run curriculum -- status
npm run curriculum -- next --count 5
npm run curriculum -- brief YKS_TYT/TRK/SOZCUKTE_ANLAM
```

## 4. Senaryo

Şema: [`src/Courses/LessonScript.ts`](../src/Courses/LessonScript.ts) · örnek: [`src/Courses/LessonScriptSample.ts`](../src/Courses/LessonScriptSample.ts) (Sözcükte Anlam'ın üç alt başlığıyla kısa bir örnek).

**YouTube dersi (`lesson`)**: açılış (dikkat çeken bir cümle, "bu videoda" hedefleri) → her alt başlık için bir bölüm → bölümde kartlar → özet ve dikkat edilecekler. Kart türleri:

| Kart | Ne için |
| --- | --- |
| `concept` | Tanım, temel kavram |
| `rule` | Kurallar, özellikler (en fazla 6 madde) |
| `example` | Örnek ve ne gösterdiği |
| `mistake` | Sık yapılan hata: yanlış · doğru · neden |
| `visual` | Ağırlıklı olarak bir şekil (harita, grafik, molekül, zaman çizelgesi) |
| `question` | Adım adım çözülen soru; her adımın kendi anlatımı var, doğru şık son adımla yanar |

Her kartın `narration` alanı o kartta söylenecek sözdür; ekranda söylenenden azı yazar. Her kart bir görsel taşıyabilir.

**Kısa özet (`short`)**: dikkat çeken giriş → 3-12 kart (Reels kartları: bilgi, kavram, formül, dikkat; ayrıca şekil kartı) → bir deneme sorusu (cevabı verilmez, YouTube dersine yönlendirir) → özet → tanıtım.

Denetim (`check`): hedef süre (ders en az 8 dk; kısa 60-120 sn), her alt başlığın bir bölümü olması, en az üç çözümlü soru, görsellerin lisans kaydı. Süre konu gerektiriyorsa uzayabilir; süre doldurmak için metin uzatılmaz.

### Kaynak kullanımı

- **Konu anlatımı paketleri** anlatımın bel kemiğidir; kazanımlar ve sık hatalar kartlara dönüşür. Paketler otomatik ayrıştırılmıştır, bazı birim başlıkları kesik ya da hatalıdır: bilgiler yazılırken doğrulanır.
- **Soru havuzları** sorunun yapısını, bilişsel yükünü ve sınavın soru yaklaşımını öğrenmek içindir. Çıkmış sorular **olduğu gibi kullanılmaz** (telif); kişi adları, bağlam ve sayılar değiştirilir. Değişiklikten sonra soru **yeniden çözülür**, doğru şık ve anlatımın tutarlılığı kontrol edilir. Sorunun kökeni ve değişiklik `question.origin` alanına yazılır.

## 5. Tasarım sistemi

Tek yer: [`src/Courses/CourseDesign.ts`](../src/Courses/CourseDesign.ts) (`COURSE_DESIGN`): tema, formatlar, hedef süreler, geçişler, yazı boyutları, kart süreleri, görsel payı, tanıtım süreleri. Renkler temadan ve ders renklerinden gelir; şablonlar kendi ölçüsünü yazmaz.

**Ders renkleri**: [`COURSE_LESSON_COLORS`](../src/Configurations/LessonColors.ts), ders koduna göre (TRK, MAT, FIZ, TAR1…). Yakın dersler aynı tonun farklı koyuluklarını taşır (Matematik ve Geometri mavi, Tarih-1 ve Tarih-2 kahverengi); hepsi beyaz yazı taşır, durum renkleri ve mor kullanılmaz. Ders rengi; ders etiketi, bölüm açılışı, kart rozetleri, şekillerdeki ana çizgi ve doğru cevap için kullanılır. Marka turuncusu her yerde kalır. Reels'teki ders aileleri (`LESSON_GROUPS`) değişmedi.

**Kart düzeni**: YouTube dersinde açık zemin, üstte ders çubuğu (ders · konu · logo), kart başında tür rozeti ve bölüm numarası; metin solda, görsel sağda (`visualShare`). Bölüm açılışları ders renginde tam ekrandır. Kısa videolar Reels'teki "Ses Olayları" kartlarını (QuickRevision) aynen kullanır.

**Tanıtım**: YouTube dersinin sonunda birkaç saniyelik uygulama tanıtımı; kısa videonun sonunda önce "Konunun tamamı YouTube'da", sonra uygulama. İkisi de **yalnız görseldir**, seslendirmeye girmez.

## 6. Derslere özel görseller

Şemalar: [`src/Components/Visuals/VisualSchemas.ts`](../src/Components/Visuals/VisualSchemas.ts) · çizim: `src/Components/Visuals/`. Her görsel veridir; şekildeki sayı ile metindeki sayı ayrışamaz. Her dersin öncelikli görselleri `LESSON_VISUAL_KITS` içindedir (ör. Kimya: atom, molekül, tepkime, tablo).

| Görsel | Ders | Ne yapar | Kütüphane |
| --- | --- | --- | --- |
| `formula` | Matematik, fizik, kimya | Formül | KaTeX |
| `reaction` | Kimya | Tepkime denklemi (alt simge, ok, hâl) | KaTeX mhchem |
| `plot` | Matematik, fizik, coğrafya | Fonksiyon grafikleri sırayla çizilir; ölçüm verisi sütun ya da çizgi; işaretli noktalar. **Katsayılar** (`parameters`: a, b, c, k, m, n) anlatımla değişir ve eğri yeniden biçimlenir; **hareketli teğet** (`tangent`, eğim değeriyle); **alan** (`area`) bütün ya da şeritlere bölünmüş (şerit sayısı artarak gerçek alana yaklaşır) | d3-scale, d3-shape |
| `equation` | Matematik | Denklem çözümü terazide: her adımda aynı işlem iki kefeye düşer, terazi dengede kalır; adımlar yanda listelenir | KaTeX |
| `geometry` | Geometri | Nokta, kenar uzunluğu, çember, açı (dik açı işareti), dolgulu çokgen | SVG (kendi) |
| `solid` | Geometri, matematik | 3B cisim döner; ayrıtlar ve ölçüler; `unfold` ile **açınım** (küp, dikdörtgenler prizması, üçgen prizma, kare piramit, silindir) | three.js (@remotion/three) |
| `forces` | Fizik | Serbest cisim diyagramı; düz ya da eğik zemin. Yön yüzeye göre verilir (`weight`, `normal`, `upSlope`…): N her zaman yüzeye diktir; ok boyları `magnitude` ile orantılıdır. Eğik zeminde dik olmayan bir N şemada reddedilir | SVG (kendi) |
| `dynamics` | Fizik | **Kuvvet → ivme → hareket** tek sahnede: kuvvetler ölçekli, net kuvvet ve a = F/m yazılır, cisim hesaplanan ivmeyle hareket eder, hız oku hızla büyür, v-t / x-t / a-t grafikleri hareketle eşzamanlı çizilir. Eğik düzlem. **Statik ve kinetik sürtünme ayrı katsayılardır**: `staticFriction` (μs) cismin harekete geçip geçmeyeceğini belirler (itici kuvvet ≤ μs·N ise kıpırdamaz, sürtünme itici kuvvete eşittir), `friction` (μk) kayarken etki eder (μk·N); ekranda "fs,max = μs·N … → kayar / kıpırdamaz" yazılır. μs verilmezse μk'ye eşit alınır (sadeleştirme; ayrımın öğretildiği konularda ikisi de verilmeli), μs < μk şemada reddedilir | SVG (kendi) + sayısal çözüm |
| `motion` | Fizik | x(t), y(t) ile hareket simülasyonu: iz ve hız oku (oku boyu hızın büyüklüğüdür) | SVG (kendi) + güvenli ifade çözücü |
| `molecule` | Kimya | SMILES'tan molekül çizimi | SmilesDrawer |
| `atom` | Kimya, fizik | Bohr modeli: çekirdek, katmanlar, elektronlar | SVG (kendi) |
| `molecule3d` | Kimya | VSEPR ile 3B molekül şekli: merkez atom, bağlar, ortaklanmamış çiftler, şekil adı ve bağ açısı | three.js |
| `flow`, `cycle` | Her ders, biyoloji, coğrafya | Süreç adımları, döngüler | Mevcut diyagramlar |
| `timeline` | Tarih, edebiyat, vatandaşlık | Zaman ölçekli olay çizelgesi (MÖ yılları) | SVG (kendi) |
| `map` | Coğrafya, tarih | Harita: dünya, Türkiye'nin bölge/il/ilçeleri, akarsu ve göller; vurgu, etiket, işaret, rota (sefer, göç) | d3-geo, topojson (veri: Natural Earth, OpenStreetMap) |
| `river` | Coğrafya | Akarsuyun çalışması aşama aşama: `profile` (kaynaktan denize kesit: eğime göre akış hızı, yukarı çığırda derine aşındırma ve V vadi, taşıma türleri, biriktirme), `meander` (kıvrımlar büyür, dış kıyı aşınır, iç kıyıda birikir, boyun kopar → menderes gölü), `delta` (yük çöker, kollara ayrılır, delta ovası) | SVG (kendi) |
| `earthquake` | Coğrafya | Deprem aşama aşama: fay, gerilme birikimi (kayaç bükülür, gerilme göstergesi), kırılma (odak, merkez üssü, bloklar kayar), P/S/yüzey dalgaları. Ters, normal, doğrultu atımlı fay; `block3d` ile 3B fay blokları ve fay dikliği | SVG (kendi), three.js |
| `sentence` | Türkçe, yabancı dil | Cümle ögeleri / dil bilgisi rolü, vurgu, çeviri | — |
| `comparison` | Her ders | İki-üç sütunlu karşılaştırma | — |
| `table` | Her ders, mantık | Tablo, doğruluk tablosu (vurgulu sütun) | — |
| `venn` | Matematik, mantık | İki-üç küme | SVG (kendi) |
| `conceptMap` | Felsefe, sosyoloji, din | Kavram haritası | Mevcut |
| `picture` | Tarih, biyoloji, edebiyat | Lisansı kayıtlı görsel ve kaynak satırı | — |

Görsel galerisi: `samples/Courses/VisualGallery.json` (`npm run stills -- --job samples/Courses/VisualGallery.json`). Canlandırılmış görseller, beat'ler ve tahmin kartı: `samples/Courses/AnimatedVisuals.json`.

### Anlatımla eşzamanlı görseller (beat)

Bir şekil ilk saniyelerde çizilip bitmez; öğretmen hangi parçayı anlatıyorsa o parça gelir, vurgulanır, değişir ya da yakınlaşır. Görselli bir kart (`concept`, `rule`, `example`, `visual`) `beats` taşıyabilir: kartın kendi anlatımından sonra her beat'in cümlesi okunur ve şekil o cümle boyunca beat'in söylediğini yapar ([`VisualTimeline`](../src/Components/Visuals/VisualTimeline.tsx)):

| Alan | Ne yapar |
| --- | --- |
| `narration` | Beat'in cümlesi (ayrı seslendirme satırı: `<kart>-b1`, `-b2`…) |
| `show` | Bu beat'le gelen parçalar (öncesinde görünmez) |
| `focus` | Bu beat'te gösterilen parçalar; geri kalanı soluklaşır |
| `zoom` | Kamera: çizimin bir bölümü, oran olarak `[sol, üst, sağ, alt]`; `null` bütüne döner |
| `params` | Katsayıların yeni değerleri (eğri beat boyunca biçimlenir) |
| `stage` | Süreç görsellerinin (akarsu, deprem, dinamik, denklem, cisim) aşaması |
| `note` | Şeklin altında kısa not |

Parça adları: grafikte `c1…` eğriler, `p1…` noktalar, `tangent`, `area`; geometride nokta adları, kenarlar uçlarıyla (`AB`), çokgenler noktalarıyla (`ABC`), açılar `angle-A`; kuvvetlerde etiket; akış ve döngüde `n1…`; zaman çizelgesinde `e1…`; haritada vurgu ve işaret adları. Beat'i olmayan görsel eskisi gibi kendi kendine çizilir, süreçler aşamalarını sırayla oynatır. Görseli olmayan karta beat yazılırsa şema reddeder (anlatım kaybolmasın).

### Önce tahmin, sonra gösterim (`predict` kartı)

"Eğim artarsa ne olur?" gibi kısa bir soru okunur (`narration`), isteğe bağlı şıklarla; ardından geri sayımlı bir düşünme süresi (`thinkSeconds`, sessiz); sonra soru kenara çekilir ve görsel beat'leriyle oynar; en sonda açıklama (`explanation`, `explanationNarration`) gelir ve doğru şık yanar.

**3B.** `solid`, `molecule3d` ve `earthquake` (`block3d`) three.js ile çizilir (@remotion/three). Her kare kare numarasından hesaplanır; render WebGL için ANGLE kullanır (`VideoRenderer` ve `remotion.config.ts`). 3B'yi derinliğin anlamaya katkı sağladığı yerde kullanın: cisimler ve açınımlar, molekül şekilleri, fay blokları.

**Haritalar.** Harita verileri `public/Geo/` altındadır ve `npm run geo` ile ücretsiz kaynaklardan yeniden kurulur (bir kerelik ~200 MB indirme; projede ~1,8 MB kalır). Ücretli bir kütüphane ya da servis gerekmez. Bütün adlar Türkçedir. Atıf isteyen bir katman çizildiğinde atfı haritanın köşesine kendiliğinden yazılır.

| Dosya | Katmanlar | Kaynak · lisans |
| --- | --- | --- |
| `Turkey.json` | `provinces` (81 il, plaka kodu ve ders kitabındaki bölgesiyle) · `country` (Türkiye) | Natural Earth 5.1.2 · kamu malı |
| | `regions` (7 coğrafi bölge, **doğal sınırlarıyla**) | The Emirr'in Wikimedia Commons bölge haritaları · CC BY 3.0; haritada "Bölge sınırları: The Emirr / Wikimedia Commons, CC BY 3.0" yazar |
| | `provinceRegions` (7 bölge, **bütün iller** olarak) | Natural Earth illerinin birleşimi · kamu malı |
| `TurkeyWater.json` | `rivers` (51 akarsu) | HydroRIVERS (Lehner & Grill 2013) · ücretsiz, atıfla; haritada "Akarsular: HydroRIVERS (…)" yazar |
| | `lakes` (24 göl ve baraj gölü) | Natural Earth 5.1.2 ve Avrupa eki · kamu malı |
| `TurkeyDistricts.json` | `districts` (973 ilçe, iliyle) | geoBoundaries / OpenStreetMap · ODbL; haritada "© OpenStreetMap katkıda bulunanlar" yazar |
| `World.json` | `countries` (Türkçe ülke adları) | Natural Earth 5.1.2 · kamu malı |
| `Sources.json` | Her dosyanın kaynağı, lisansı, bölge oturtma hatası ve her akarsuyun nasıl bulunduğu | — |

Merkezi tanım: [`src/Configurations/GeoData.ts`](../src/Configurations/GeoData.ts) (dosyalar, katmanlar, atıf, su/kara renkleri). Harita görseli bir **taban** (`countries`, `country`, `regions`, `provinces`, `districts` ya da `public/Geo` içinde kendi dosyan) ve üstüne en fazla dört **katman** (akarsu, göl, bölge/il sınırı) çizer; vurgular ders renginde, etiketler Türkçe adlarla:

```json
{"kind": "map", "base": "provinces", "overlays": [{"layer": "regions"}, {"layer": "rivers", "labels": true}, {"layer": "lakes"}], "highlights": [{"name": "Konya", "label": "Konya"}]}
```

- **Coğrafi bölgeler iki katmandır.** Hangisinin kullanılacağı ne öğretildiğine bağlıdır:
  - `regions`: 1941 Coğrafya Kongresi bölgeleri **doğal sınırlarıyla**; sınırlar illeri keser (ör. Çorum, Kahramanmaraş, Erzurum iki bölgeye bölünür). Bölge sınırı, yer şekli ve iklimle bölge ilişkisi anlatılırken bu kullanılır. Bu sınırlar için açık bir veri seti yok (OpenStreetMap'te ve Wikidata'da bölge şekli bulunmuyor). Bu yüzden Wikimedia Commons'taki elle çizilmiş bölge haritalarından alındı ve koordinata oturtuldu: haritadaki Türkiye dış sınırı Natural Earth sınırıyla eşleştirildi (Mercator, en yakın noktalar yöntemi), kıyı ve kara sınırları Natural Earth'ten, yalnız iç sınırlar çizimden gelir. Oturtma sonrası dış sınır farkı medyan **3,1 km**, en kötü %10'da **8,2 km**; iç sınırların isabeti çizimin isabetiyle sınırlıdır. Alanlar ders kitaplarındaki değerlerden en çok ~%10 sapar (Akdeniz ve Güneydoğu Anadolu biraz küçük çıkar). Yani `regions` öğretim için doğru biçimi verir, ama sınır üzerindeki bir noktanın hangi bölgede olduğunu kesin olarak söylemez; kesin konum ve alan soruları için kullanılmamalıdır.
  - `provinceRegions`: her il bütünüyle bir bölgede ([`TurkeyRegions.ts`](../src/Configurations/TurkeyRegions.ts), ders kitabı ataması). "Hangi il hangi bölgede" ve il bazlı istatistikler için. Sınırları gerçek bölge sınırı değildir; tablo bir coğrafya öğretmenince kontrol edilmeli.
- İlçelerin hangi ile ait olduğu aynı kaynağın il sınırlarıyla bulundu; il başına ilçe sayıları resmî sayılarla aynı (ör. İstanbul 39, Ankara 25, Konya 31).
- **Akarsular** HydroRIVERS'ın yükseklik verisinden türetilmiş akarsu ağı üzerinde, her akarsuyun Wikidata'daki kaynak ve ağız koordinatlarından izlenir ([`scripts/GeoRivers.ts`](../scripts/GeoRivers.ts)): kaynak ve ağız biliniyorsa akış yönünde kaynaktan inilir ve yol ağza 3 km'den yakın geçmelidir; tek nokta biliniyorsa ana kol (her kavşakta en büyük drenaj alanı) izlenir, adı olan kollara girilmez. Doğrulanamayan akarsu atlanır ve raporlanır, tahmin edilmez. 51 akarsu: Kızılırmak, Yeşilırmak, Sakarya, Fırat (Karasu ve Murat'ın birleşiminden), Dicle, Aras, Kura, Çoruh, Meriç, Ergene, Gediz, Büyük ve Küçük Menderes, Seyhan, Ceyhan, Göksu, Asi, Susurluk, Bakırçay, Biga, Gönen, Filyos, Bartın, Devrekâni, Gökırmak, Kelkit, Çekerek, Delice, Porsuk, Ankara Çayı, Melet, Harşit, Karasu, Murat, Munzur, Peri, Tohma, Botan, Batman, Habur, Zap, Arpaçay, Manavgat, Köprüçay, Aksu, Dalaman, Eşen, Berdan, Nilüfer, Mustafakemalpaşa ve Çarşamba Çayı (Konya kapalı havzasında kanallaştığı için Natural Earth çizgisi). Yükseklik verisinden türetildiği için menderesler düzleşir; çizilen uzunluk resmî uzunluktan kısadır (ör. Kızılırmak 1.189 km çizilir, resmî 1.355 km). Uzunluk öğretilirken resmî değer metinde verilmelidir.
- **Göller**: Van, Tuz, Beyşehir, Eğirdir, Akşehir, Burdur, Salda, Sapanca, İznik, Uluabat, Kuş (Manyas), Terkos, Bafa, Köyceğiz, Marmara, Çıldır, Erçek, Hazar, Seyfe, Yay ve Atatürk, Keban, Karakaya, Seyhan baraj gölleri. Eksik kalanlar (ör. Eber, Acıgöl, Işıklı, Hirfanlı) gerektiğinde aynı yolla eklenir.
- Etiketler çakışmaz: önce vurgu ve işaret adları, sonra büyükten küçüğe akarsu ve göl adları yerleşir; yer kalmayan ad yazılmaz. Belirli adlar için katmana `names` verilir.
- **Tarihî sınırlar** hazır veri olarak eklenmedi: ücretsiz setlerin lisansı ve doğruluğu konu konu kontrol edilmeli. Gerektiğinde konu için çizilen GeoJSON `public/Geo` içine konur ve `base: {"src": "Geo/…json"}` ile kullanılır.
- Yükselti (rölyef) ve iklim verisi henüz yok; ihtiyaç olursa Natural Earth gölgeli rölyef (kamu malı) ve WorldClim (CC BY) eklenebilir.

**Görseller (stok).** `npm run media -- --commons "File:…" --to Tarih/…` Wikimedia Commons'tan görseli indirir ve yazarını, kaynağını, lisansını `public/Media/Credits.json` dosyasına yazar. Yalnız kamu malı, CC0, CC BY ve CC BY-SA kabul edilir; kaynak satırı karta yazılır. Pexels ve Unsplash da uygundur (kendi lisansları atıf istemez) ama API anahtarı gerektirir; eklenirse aynı kayda yazılmalıdır.

## 7. Şablonlar

| Şablon | Format | İçerik |
| --- | --- | --- |
| `CourseLesson` | 16:9, YouTube | Senaryonun `lesson` bölümü; ses profili `Lecturer` |
| `CourseShort` | 9:16, Reels · TikTok · Shorts | Senaryonun `short` bölümü; ses profili `Energizer` |

İkisinin içeriği aynı senaryodur. Seslendirme marka sesiyle (Lisa) ve metin bütün olarak üretilir; sahneler sese göre uzar.

## 8. Sonraki adımlar

1. İlk konunun (TYT Türkçe · Sözcükte Anlam, 13 alt başlık) tam senaryosunu yazmak; `check --mark`.
2. Örnek YouTube videosu ve kısa videoyu üretip birlikte değerlendirmek; kart süreleri ve görsel payını buna göre ayarlamak.
3. Bölge tablosunun (TurkeyRegions.ts) bir coğrafya öğretmenince kontrolü; eksik akarsuların eklenmesi.
4. Tarih ve biyoloji için kullanılacak görselleri seçip lisanslarıyla kütüphaneye almak.
5. Konu anlatımı paketi olmayan konular (ör. TYT'de 68 konu) için anlatımın hangi kaynaktan doğrulanacağına karar vermek.
