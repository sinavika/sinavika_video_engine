# Eğitim Videoları (Courses)

Ders ve konu listesine bağlı YouTube eğitim videoları ile her birinin kısa özet videosunu üreten altyapı. **Kalite kuralı:** ders videoları ve kısa özetler her zaman 4K (`2160p`, yatayda 3840×2160) en yüksek kalitede render edilir ve YouTube'a o dosya yüklenir (bkz. [`SocialPlan.md`](SocialPlan.md#video-kalitesi)). Sosyal medya Reels akışından (`Posts/`, `npm run social`) ayrıdır; ortak bileşenleri (tema, yazı tipi, seslendirme, render, kapak, Reels kartları) kullanır, onların davranışını değiştirmez.

## 0. Amaç

Sahibin kararı (27 Ekim 2026). Bütün ders videoları bu amaca göre yazılır ve denetlenir.

- **Ölçü öğrenmedir; süre ya da popülerlik değildir.** Öğrenci, 1 saat 40 dakikalık bir ders videosundan alacağı her şeyi bizim videomuzdan almalı. Video "tam ders" görünsün diye uzatılmaz; hiçbir kanal örnek alınmaz.
- **İnsan değil animasyon.** Ekranda bir insan ya da fenomen tarzı sunum dikkati dağıtır. Dikkati animasyonla, anlatımla eşzamanlı görsellerle tutarız.
- **Belgesel gibi.** Öğrenci dersi bir belgesel izler gibi izler. Konunun bütün ayrıntıları ve o konunun **ÖSYM püf noktaları** (nasıl sorulur, tuzak, ayırt edici ölçüt) mutlaka verilir.
- **Kapsamı resmî kaynaklar belirler, piyasa değil.** Piyasada her yayının kendi konu listesi var; biz şunları esas alırız:
  - **MEB:** TTKB'nin YKS'ye esas kazanım belgesi ([`Curriculum/Sources/MEB`](../Curriculum/Sources/MEB/README.md)), MEB/OGM materyalleri ve MEB'in ÖSYM soru derlemeleri;
  - **ÖSYM:** çıkmış sorular (gerçekte ne soruluyor) ve kılavuzlar (testler, soru sayıları).
- **Süre kapsamdan çıkar.** Konu daha fazla süre istiyorsa alır ya da iki derse bölünür. Kapsamın bir parçası eksikse ders bitmiş sayılmaz.

Senaryodan önce konunun **kapsam listesi** çıkarılır: MEB kazanımı ve ÖSYM'nin o konuda sorduğu soru tipleri. Listedeki her madde senaryoda bir bölüm, kart ya da çözümlü soru olarak yer alır. Konu konu kapsam denetimi: [`Curriculum/Production/KapsamDenetimi.md`](../Curriculum/Production/KapsamDenetimi.md).

**ÖSYM çıkmış sorular listesi.** Resmî kaynaklardan (MEB'in YKS derlemeleri ve ÖSYM KPSS kitapçıkları) LessonMain → LessonSub → LessonMikro düzeninde tutulur:
- Veri: `Desktop\EgitimVerileri\<Sınav>\<Kategori>\CikmisSorular\<Ders>.jsonl`.
- Tablo: `Desktop\EgitimVerileri\CikmisSorular.xlsx`; konu ve alt başlık özetleri formüldür.
- Üretim: `python -m sourceparsing cikmis` (`Desktop\sinavika_parse`). Motor veriyi masaüstünden okur, kopyası yoktur.
- Kullanım: `npm run curriculum -- brief <konu>` konunun çıkmış sorularını yıllara, alt başlıklara ve soru kalıplarına göre gösterir. Kod: [`PastExamQuestion.ts`](../src/Courses/PastExamQuestion.ts).
- Her soru kalıbı derste en az bir kart ya da çözümlü soruyla temsil edilir.

## 1. Akış

```
Ders listesi (Desktop\lesson.csv) + Desktop\EgitimVerileri (konu anlatımları, sorular, çıkmış sorular)
        │  npm run curriculum -- import
        ▼
Curriculum/  katalog · üretim kontrol listesi (her konu kendi anlatımına ve sorularına bağlı)
        │  npm run curriculum -- camp create --category YKS_TYT --lesson TRK
        ▼
Kamp planı   Curriculum/Camps/<kamp>.json   (dersin konuları yayın sırasıyla)
        │  npm run curriculum -- next / brief <konu>
        ▼
Senaryo (metin + sahne planı + kamp alanları)   Curriculum/Scripts/<Kategori>/<Ders>/<Konu>.json
        │  npm run curriculum -- check <senaryo> --mark      → "Hazırlandı"
        ▼
Kamp işleri  Curriculum/Jobs/<kamp>/<NN>-<konu>-youtube|reels.json (senaryonun yolunu taşır) + YouTube notu
        │  npm run curriculum -- jobs make <spec.json>  ·  jobs check [kamp]
        ▼
CampLesson (YouTube, 16:9, ≥10 dk)  ve  CampShort (Reels/Shorts/TikTok, 9:16)
        │  npm run render -- --job <iş>  (seslendirme: marka sesi, metin bütün olarak; YouTube bölümleri .chapters.txt)
        ▼
npm run curriculum -- mark <konu> --stage youtube|short --file Outputs/...
```

Kampa girmeyen tek konular için `CourseLesson` ve `CourseShort` aynen kullanılabilir; kamp şablonları onların sahnelerini değiştirmeden sarar.

Sıra her zaman aynıdır: **önce metin ve sahne senaryosu**, sonra görseller ve seslendirme. Bir senaryo tek dosyada hem YouTube dersini hem kısa özeti taşır.

## 2. Klasörler

| Yol | İçerik | Git |
| --- | --- | --- |
| `Curriculum/Sources/LessonList.csv` | Ders listesinin kopyası; asıl liste `Desktop\lesson.csv`, `import` her çalıştığında buraya kopyalanır | ✓ |
| `Curriculum/Catalog/<Kategori>.json` | Sınav → kategori → ders → konu → alt başlık hiyerarşisi (kodlar ve kimlikler platformla aynı) | ✓ |
| `Curriculum/Production/Checklist.json` · `.md` | Üretim kontrol listesi (aşağıda) | ✓ |
| `Curriculum/Production/ImportReport.json` | Son içe aktarmanın sayıları | ✓ |
| `Desktop\EgitimVerileri\Index.json` | Kategori → ders → konu, konu başına soru sayıları | — |
| `Desktop\EgitimVerileri\<Sınav>\<Kategori>\KonuAnlatimi\<Ders>\<Konu>.json` | Konu anlatımı: alt başlıklar (LessonMikro) ve kaynağa göre anlatım metni (MEB OGM PDF'leri, sayfalarıyla) | — |
| `Desktop\EgitimVerileri\<Sınav>\<Kategori>\Sorular\<Ders>\<Konu>.jsonl` | Konuya bağlı sorular: kök, şıklar, cevap, mikro kodu, eşleşme güveni, kaynak (MEB, ÖSYM, Sınavika bankası) | — |
| `Desktop\EgitimVerileri\YKS\_Sekiller\` | Soruların şekil görüntüleri | — |
| `Desktop\EgitimVerileri\VeriEnvanteri.md` | Veri envanteri: kategori ve ders bazında sayılar | — |
| `Curriculum/Camps/<kamp>.json` | Kamp planları | ✓ |
| `Curriculum/Scripts/` | Senaryolar | ✓ |
| `public/Media/` + `Credits.json` | Lisansı kayıtlı görseller | ✓ |
| `public/Geo/` | Harita verileri (GeoJSON / TopoJSON) | ✓ |

**Veri masaüstünde, kopyası yok (31 Ekim 2026).** Eğitim verisi `Desktop\EgitimVerileri`'de durur ve sürekli güncellenir; motor onu doğrudan okur, `Curriculum/Data` kopyası kaldırıldı. Ders listesinin aslı `Desktop\lesson.csv`'dir (veri hattı her yeni satırı ona ve kopyalarına yazar). `brief` konu anlatımını, soru havuzunu ve çıkmış soruları her çağrıda masaüstünden okur; kontrol listesindeki `sources` son `import`'un anlık görüntüsüdür ve `npm run curriculum -- import` ile tazelenir. Başka bir yer `EGITIM_VERILERI` ve `LESSON_LIST` ortam değişkenleriyle verilir.

25 Ekim 2026 içe aktarması: 53 kategori, 112 ders, **1.128 konu (video)**, 7.907 alt başlık; 560 konunun anlatımı var; 706 konuya bağlı **120.899 soru** (109.564'ü cevaplı, 6.489'u ÖSYM). YKS ve KPSS'nin bütün konuları veride karşılığını buluyor (TYT 168, AYT 276, YDT 65, KPSS Lisans 94, Önlisans ve Ortaöğretim 78'er).

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

Her satır ayrıca konunun kaynaklarını gösterir: konu anlatımı var mı, konuya bağlı kaç soru (kaçı cevaplı, kaçı ÖSYM). İçe aktarma yeniden çalıştırılırsa işaretler korunur.

```bash
npm run curriculum -- status
npm run curriculum -- next --count 5
npm run curriculum -- brief YKS_TYT/TRK/SOZCUKTE_ANLAM
```

**Denetim araçları.** Sorunu göz değil araç bulur:

| Komut | Ne yapar |
| --- | --- |
| `npm run curriculum -- check <senaryo>` | Şema ve kural hataları; "?" ile öneriler: anlatılan sürecin görseli yok, 30 sözcüğü aşan cümle var |
| `npm run curriculum -- audit` | Dersler arası aynı cümleler, neredeyse aynı sorular (şekil dahil), her dersin kart ve görsel karışımı → `Curriculum/Production/DersDenetimi.md` |
| `npm run sweep -- <kamp \| senaryo \| all>` | Şekilli sahnelerin, tahmin kartlarının ve şekilli soruların karelerini çizer, yerleşim bekçisini çalıştırır (yazı kareden ya da kutusundan taşıyor mu, iki yazı üst üste mi, yazı ilerleme çubuğunun üstünde mi). Çıktı: `Outputs/Sweeps/<tarih>-<hedef>/RAPOR.md` ve küçük resimli `index.html` |
| `npm run sweep -- <hedef> --motion` | Anlatım sürerken 8 sn ve daha uzun donan ekranlar → `HAREKET.md` |

Render de iki uyarı ekler: yerleşim bekçisi (önizleme ve taramada) ve anlatım hızı (çok hızlı ya da yavaş okunan satır, cümle içinde uzun sessizlik). Taramalar render kullanır; aynı anda iki render çalıştırılmaz.

## 4. Senaryo

Şema: [`src/Courses/LessonScript.ts`](../src/Courses/LessonScript.ts) · örnek: [`src/Courses/LessonScriptSample.ts`](../src/Courses/LessonScriptSample.ts) (Sözcükte Anlam'ın üç alt başlığıyla kısa bir örnek).

**YouTube dersi (`lesson`)**: açılış (dikkat çeken bir cümle, "bu videoda" hedefleri) → her alt başlık için bir bölüm (alt başlık çoksa birlikte öğretilen kardeş başlıklar tek bölümde toplanır: `subtopic` + `subtopics`, ör. Cümlede Anlam'da neden, amaç ve koşul; en çok 14 bölüm; konuya ait olmayan, başka konudan kopyalanmış alt başlıklar `outOfScope` içinde gerekçesiyle yazılır ve VeriDuzeltmeleri'ne işlenir) → bölümde kartlar → özet ve dikkat edilecekler. Kart türleri:

| Kart | Ne için |
| --- | --- |
| `concept` | Tanım, temel kavram |
| `rule` | Kurallar, özellikler (en fazla 6 madde) |
| `example` | Örnek ve ne gösterdiği |
| `mistake` | Sık yapılan hata: yanlış · doğru · neden. `wrong` bir yargı cümlesidir ("Gözleme dayanan her roman natüralisttir."), "… saymak" gibi bir davranış değil: Works bu kartı doğru/yanlış sorusuna çevirir |
| `visual` | Ağırlıklı olarak bir şekil (harita, grafik, molekül, zaman çizelgesi) |
| `question` | Adım adım çözülen soru; her adımın kendi anlatımı var, doğru şık son adımla yanar |

Her kartın `narration` alanı o kartta söylenecek sözdür; ekranda söylenenden azı yazar. Her kart bir görsel taşıyabilir.

**Sesle eş zamanlı canlandırma (27 Ekim 2026).** Kartın parçaları söylendikleri anda gelir. Bunun için seslendirmedeki kelime zamanları kullanılır (`src/Courses/LessonCue.ts`). Yazarın ek bir şey yapması gerekmez:
- kural maddeleri anlatıcı o maddeye gelince çıkar, konuşulan madde hafifçe vurgulanır;
- hata kartında anlatıcı doğruya döndüğünde yanlışın üstü çizilir ve doğru gelir;
- örnek açıklaması, özet maddeleri ve kamp görevleri söylendikleri anda gelir;
- **kalın** sözlerin altına söylendikleri anda fosforlu kalem çizilir. Anlatımda geçmeyen kalın söz düz kalın kalır.

**Dil görselleri (27 Ekim 2026).** Türkçe derslerinde üç yeni hareket var. Hepsi kartın vuruşlarına (`beats`) bağlanır:
- **Ok:** `sentence` görselinde `links: [{"from": 1, "to": 2, "label": "neden → sonuç"}]`. Ok, vuruş onu gösterdiğinde (`show: ["l1"]`) birinci parçadan ikinciye çizilir, üstünden bir ışık geçer. `focus: ["l1"]` oku kalınlaştırır.
- **Sözcük değişimi:** parçaya `"swap": {"text": "Yetişmek için", "role": "amaç"}` eklenir, vuruşta `swap: ["w1"]` yazılır. Eski sözcüğün üstü çizilir, yukarı kayar; yenisi aşağıdan gelir, kutu ders rengine döner. Vuruşsuz kartta değişim cümle kurulduktan sonra kendiliğinden olur.
- **Paragraf haritası:** `paragraph` görseli. Vuruşlar cümleleri `s1…` ve konuyu `topic` adıyla gösterir. `off` cümle, bir vuruş ona odaklandığında (`focus: ["s3"]`) çizilir.

**Biyoloji görselleri (29 Ekim 2026).** Kodları `src/Components/Visuals/Biology/` altında, her görsel kendi dosyasında:
- **Hücre:** `cell` görseli `type` ile çizilir: `animal`, `plant` ya da `prokaryote`. Organeller kendi adlarıyla vurgulanır: `focus: ["ger", "golgi"]`. Her türün parça listesi `CELL_TYPE_PARTS` içindedir; hayvanda sentrozom, bitkide duvar, kloroplast ve merkezi koful vardır, prokaryotta çekirdek yoktur. `labels` adlandırılacak organelleri sırasıyla verir. `numbered: true` adlar yerine I, II, III yazar; soru şekli içindir. `hide` organel çıkarır.
- **Hücre zarı:** `membrane` görseli akıcı-mozaik kesiti çizer: fosfolipit, kolesterol, kanal, taşıyıcı, periferik protein, glikoprotein, glikolipit. `transport` hareketli tanecikler ekler: `difuzyon`, `kolaylastirilmis`, `aktif`, `osmoz`. Taşımalara vuruşlarda `t1…` diye odaklanılır. `numbered` soru şekli içindir.
- **Tonisite:** `tonicity` görseli her ortam için bir kap çizer: hipotonik, izotonik, hipertonik. Kabın içinde alyuvar (`cell: animal`) ya da bitki hücresi (`cell: plant`) durur; hücre su aldıkça şişer ya da büzülür (hemoliz, turgor, plazmoliz). Kaplara vuruşlarda `p1…` diye odaklanılır.
- **Taksonomi:** `taxonomy` görseli âlemden türe yedi basamağı ve türe inerken artan, azalan nicelikleri gösterir. Parçalar: `alem` … `tur` ve `egilim`.
- **Bölünme:** `division` görseli mitozu (`mode: mitosis`) ya da mayozu (`mode: meiosis`) evre evre çizer. `stages` en çok beş panel seçer, `n` kromozom çifti sayısıdır. Panellere vuruşlarda `s1…` diye odaklanılır. Soru şekli için `numbered`, dar çözüm paneli için `layout: grid` kullanılır. Mayoz II evrelerinin (iki ve dört hücre) panelleri daha geniştir.
- **Punnett karesi:** `punnett` görseli `rows` (anne gametleri) ile `columns` (baba gametleri) kesişimlerine zigotları yazar; aleller ders kitabı sırasıyla dizilir (Aa, AO, X^RX^r). Gamet alel alel yazılır: `"SD"`, `"X^R"`, `"Y"`. `phenotypes` hücreleri fenotip sınıfına göre tonlar, her sınıfın payını (3/4, 9/16) ve `ratio` ile fenotip oranını (9 : 3 : 3 : 1) yazar. Sınıf anahtarları: her gende baskın alel (`"SD"`, `"sd"`), eş baskında ikisi (`"AB"`), X'e bağlı gende genotipin kendisi (`"X^rY"`). Her hücre bir sınıfa düşmezse doğrulama hata verir. Parçalar: `r1…`, `c1…`, `p1…`.
- **Soyağacı:** `pedigree` görseli ÖSYM soyağaçlarını çizer: kare erkek (`m`), daire dişi (`f`), dolu `affected`, yarı dolu `carrier`, "?" `unknown`. Her kişi `x` sütununda ve `generation` satırında durur; `label` altına numara ya da genotip yazar. `couples` eşleri bağlar (`related: true` akraba evliliği, çift çizgi) ve çocukları kardeş çizgisine asar. Lejant her durumu kare ve daireyle birlikte gösterir; adları `affectedLabel` ve `normalLabel` verir ("Hasta", "Özelliği gösteren"). Soru şeklinde `legend: below` lejantı tek satırla alta alır ve nesilleri yaklaştırır; kişiler büyük kalır. Kişilere vuruşlarda `p<id>` diye odaklanılır.
- **Besin ağı:** `foodweb` görseli canlıları `level` satırlarına dizer (1 üreticiler … 5) ve `links` çiftlerini [besin, yiyen] oklarla bağlar; ok hep üst satıra gider. `levels: true` satır adlarını solda yazar. Bir canlıya kendi kimliğiyle (`focus: ["tilki"]`), bir düzeye `t2` diye odaklanılır. Kimlikler küçük harftir (`"küçükbalık"`).
- **Besin piramidi:** `trophic` görseli basamakları alttan üste çizer; her basamakta `label`, `example` ve solda `value` ("100 000 J") durur, `trends` yukarı çıktıkça azalan ve artan nicelikleri listeler. Parçalar: `l1…` ve `egilim`.
- **Hiyerarşi (piramit, buz dağı):** `hierarchy` görseli basamakları `levels` sırasıyla çizer. `pyramid` biçiminde ilk basamak temeldedir ve basamaklar birer birer düşüp yerine oturur (Maslow, toplumsal tabakalaşma). `iceberg` biçiminde ilk `above` basamak suyun üstünde, kalanlar altındadır (Freud'un zihin modeli; id, ego, süperego). Her basamağın `label` ve isteğe bağlı `detail` alanı vardır; açıklama sağda yazılır. `groups` basamak dizilerini solda köşeli parantezle gruplar (`from`, `to`: 1'den başlayan basamak numaraları). Parçalar: `l1…` ve `g1…`.
- **Karşıtlık karesi (mantık):** `opposition` görseli `a`, `e`, `i`, `o` köşelerine aynı özne ve yüklemli dört önermeyi yazar; karşıtlık, alt karşıtlık, altıklık ve çelişiklik çizgileri vuruşlarla çizilir. `truth` köşelere D / Y / ? değeri koyar (`deger` parçası). Parçalar: a, e, i, o, karsitlik, altkarsitlik, altiklik, celisiklik, deger.
- **Euler daireleri (mantık):** `euler` görseli ya `pairs` (iki kavramın kaplam ilişkisi: `equal`, `apart`, `inside`, `overlap`; en çok 4 panel) ya da `nested` (kıyasın terimleri iç içe, dıştan içe; `point` en içteki bireyi, `conclusion` sonucu yazar) alır. Parçalar: p1… ya da n1…, nokta, sonuc.
- **Doğruluk çizelgesi (mantık):** `truthTable` görseli `variables` (p, q, r) ve `columns` (önermeler: `~p`, `p ∧ q`, `p ∨ q`, `p ⇒ q`, `p ⇔ q`, parantezli) alır; D ve Y değerlerini motor hesaplar, elle yazılmaz. `check`: `consistency` (son sütun; totoloji / tutarlı / tutarsız), `validity` (yanlışlayıcı satırlar), `joint` (ortak doğrulayıcı), `equivalence` (son iki sütun). Parçalar: v, c1…, r1…, isaret, sonuc. Ekranda sembolle yazılan önermeler seslendirmede sözcükle okunur ("p ve q, ise r").
- **Döngü (`cycle`):** geniş kartta beş ya da altı adım iki sıralı halka olarak dizilir; dört ve daha az adım elipste kalır.

**Edebiyat görselleri (29 Ekim 2026).** Kodları `src/Components/Visuals/Literature/` altında:
- **Şiir:** `poem` görseli dizeleri (`lines`, en çok 8) tek tek getirir. Her dizede `rhyme` (kafiye) ve `redif` dize sonunda yazıldığı gibi durmalıdır (redif en sonda); kafiye ders renginde, redif ikinci tonda italik çizilir. `scheme` kafiye harfidir (`a`…`g`, serbest dize `x`). `syllables: true` her dizenin hece sayısını sağa yazar; `stops: [6]` altıncı heceden sonra durak koyar ve durak sözcüğü bölerse doğrulama hata verir. `stanzas: [4]` dördüncü dizeden sonra dörtlük aralığı bırakır, `poet` şairin adını altına yazar. `marks` dizedeki sözleri sırasıyla kalın ve ders renginde çizer: ÖSYM'nin altı çizili sözü (ekranda koyu), bir benzetmenin iki ögesi. Parçalar: `l1…`, `kafiye`, `redif`, `durak`, `hece`, `sema`, `isaret`. Hece sayımı ve durak yeri `Hece.ts` içindeki saf işlevlerdir. Soru şekli olarak (`figure`) şiir, çözüm panelinin bütün genişliğini alır.

Bu yüzden kart metnindeki maddeyi anlatımda aynı sözlerle başlatmak en iyi sonucu verir ("Kendi başına **anlaşılır**" → "Bir: kendi başına anlaşılır").

Soru okunurken paragrafta o an okunan cümle vurgulanır, (I)–(V) numaraları rozet olarak görünür, şıklar okundukça çerçevelenir. Cevap açıklanınca diğer şıklar geri çekilir. Çözüm adımları üç isteğe bağlı alanla parçayı ve şıkları gösterir:

| Alan | Ne yapar | Örnek |
| --- | --- | --- |
| `eliminate` | Adım bu şıkları eler; harfi söylendiği anda üstü çizilir ve söner. Doğru şık elenemez. | `["A", "D"]` |
| `mark` | Parçada ya da soru kökünde bu sözlerin altına, söylendikleri anda fosforlu kalem çizilir. Söz yazıldığı gibi geçmelidir (denetim yakalar). | `["Oysa", "bazı türlerin"]` |
| `sentences` | Parçanın bu numaralı cümlelerini yakar ((III) → 3; numarasız parçada n. cümle). Anlatımdaki "üç numaralı cümle" anında gelir. | `[3]` |

**Kısa özet (`short`)**: dikkat çeken giriş → 3-12 kart (Reels kartları: bilgi, kavram, formül, dikkat; ayrıca şekil kartı) → bir deneme sorusu (cevabı verilmez, YouTube dersine yönlendirir) → özet → tanıtım.

**Seviyeler arası kapsam (`alsoTeaches`, KPSS):** tek KPSS video seti Lisans, Önlisans ve Ortaöğretim'e hizmet eder (31 Ekim 2026). Alt konu kodları seviye içinde tekildir ama seviyeler arasında aynı şeyi göstermez; bölüm başka seviyenin anlattığı alt konusunu `alsoTeaches` alanına `KPSS_ONLISANS:SES_BILGISI_03` biçiminde yazar. Ortaöğretim, Önlisans'ın ikizidir. `npm run curriculum -- coverage KPSS` her kaydın her alt konusunun bir bölümde anlatıldığını denetler; `--mark` alt konularının hepsi hazır bölümlerde olan kayıtları işaretler. Plan: `Curriculum/Production/KPSS-Kapsam-Analizi.md`.

**Works görünümü (`Curriculum/Works`):** Works senaryoları değil, `npm run curriculum -- works [KATEGORİ ÖNEKİ]` ile üretilen dosyaları aktarır: kontrol listesindeki her konu için kendi kodlarıyla bir dosya (`Curriculum/Works/<KATEGORİ>/<DERS>/<KONU>.json`), o konuyu anlatan bölümlerden kurulur, alt konusu eksik konunun dosyası yazılmaz. Bir senaryo "Hazırlandı" işaretlendikten sonra komut yeniden çalıştırılır. TYT ve AYT dosyaları senaryoyla aynıdır; KPSS ve AYT Tarih-2/Coğrafya-2 dosyaları kendi kodlarını taşır.

**Works notları (`works`)**: senaryolar Sınavika'nın Works modülünde (yazılı konu anlatımları) de kullanılır. Videoya sığmayan ama yazılı derste olması gereken şeyler `works.additions` altına kısa Türkçe talimatlar olarak yazılır: tam tablolar ve listeler, ek örnekler, istisnalar, ÖSYM'nin kullandığı tuzaklar. Her derste en az 2, en çok 12 madde olur; her biri en çok 400 karakter. 31 Ekim 2026'dan beri zorunludur: notu olmayan ders `check` denetiminden geçmez ve "Hazırlandı" işaretlenmez (`worksIssues`). Video bu alanı okumaz. Senaryoların Works'e aktarımı API'dedir (`POST /api/admin/works/imports`); aktarımın bugünkü eksikleri ve motorla uyumu [`Works-Aktarim-Notlari.md`](Works-Aktarim-Notlari.md) içindedir.

Denetim (`check`): hedef süre (ders **en az 10 dk**, hedef 12 dk; kısa 60-120 sn), her alt başlığın bir bölümü olması, en az üç çözümlü soru, görsellerin lisans kaydı, kamp alanlarının kamp planıyla uyumu (ders numarası, toplam, sıradaki ders). 29 Ekim 2026'dan beri ayrıca: doğru şıklar sınavdaki gibi dağılır (bir harf soruların yarısını almaz, aynı harf üç kez üst üste gelmez, ABAB gibi tekrar eden desen olmaz; `answerPatternIssues`) ve hata kartının yanlışı bir yargı cümlesidir (`mistakeIssues`). Sayısal şıklar ÖSYM'deki gibi küçükten büyüğe sıralanır; doğru cevabın yeri çeldirici değerler seçilerek değiştirilir, sıralama bozulmaz. Bir adım bir tuzaktan söz ediyorsa ("On ikiyi seçen…") o değer şıklarda bulunur. Süre konu gerektiriyorsa uzayabilir; süre doldurmak için metin uzatılmaz. Süre hedefi yalnızca bir uyarıdır; asıl ölçü kapsam listesinin tamamlanmasıdır (§0).

### Kaynak kullanımı

- **Konu anlatımları** (MEB OGM konu özetleri, izinli) anlatımın bel kemiğidir. Metin PDF'ten ayrıştırılmıştır: kapak, künye ve sayfa başlıkları karışmış olabilir, bazı bölüm başlıkları kesiktir. Senaryo bilgiyi kendi cümleleriyle yazar ve yazarken doğrular. Anlatımı olmayan konular (ör. TYT Söz Yorumu) müfredattan ve soru havuzundan yazılır, ayrıca doğrulanır.
- **Soru havuzları** sorunun yapısını, bilişsel yükünü ve sınavın soru yaklaşımını öğrenmek içindir. Çıkmış sorular **olduğu gibi kullanılmaz**: MEB ve ÖSYM izni soruları **örnek almayı** kapsar, birebir kopyalamayı değil (sahibin kuralı, 27 Ekim 2026). ÖSYM'den soru kalıbı ve parça yapısı alınır; parça, şıklar ve bağlam yeniden yazılır. Havuzdaki başka bir soru temel alınırsa kişi adları, bağlam ve sayılar değiştirilir. Değişiklikten sonra soru **yeniden çözülür**, doğru şık ve anlatımın tutarlılığı kontrol edilir. Sorunun kökeni ve değişiklik `question.origin` alanına yazılır.

## 5. Tasarım sistemi

Tek yer: [`src/Courses/CourseDesign.ts`](../src/Courses/CourseDesign.ts) (`COURSE_DESIGN`): tema, formatlar, hedef süreler, geçişler, yazı boyutları, kart süreleri, görsel payı, tanıtım süreleri. Renkler temadan ve ders renklerinden gelir; şablonlar kendi ölçüsünü yazmaz.

**Ders renkleri**: [`COURSE_LESSON_COLORS`](../src/Configurations/LessonColors.ts), ders koduna göre (TRK, MAT, FIZ, TAR1…). Yakın dersler aynı tonun farklı koyuluklarını taşır (Matematik ve Geometri mavi, Tarih-1 ve Tarih-2 kahverengi); hepsi beyaz yazı taşır, durum renkleri ve mor kullanılmaz. Ders rengi; ders etiketi, bölüm açılışı, kart rozetleri, şekillerdeki ana çizgi ve doğru cevap için kullanılır. Marka turuncusu her yerde kalır. Reels'teki ders aileleri (`LESSON_GROUPS`) değişmedi.

**Kart düzeni**: YouTube dersinde açık zemin, üstte ders çubuğu (ders · konu · logo), kart başında tür rozeti ve bölüm numarası; metin solda, görsel sağda (`visualShare`). Bölüm açılışları ders renginde tam ekrandır. Kısa videolar Reels'teki "Ses Olayları" kartlarını (QuickRevision) aynen kullanır.

**Tanıtım**: YouTube dersinin sonunda birkaç saniyelik uygulama tanıtımı; kısa videonun sonunda önce "Konunun tamamı YouTube'da", sonra uygulama. İkisi de **yalnız görseldir**, seslendirmeye girmez.

## 6. Derslere özel görseller

Şemalar: her dersin klasöründe (`src/Components/Visuals/<Ders>/<Ders>Schema.ts`, ör. [`Physics/PhysicsSchema.ts`](../src/Components/Visuals/Physics/PhysicsSchema.ts)), hepsini [`VisualSchema.ts`](../src/Components/Visuals/VisualSchema.ts) tek birleşimde toplar · çizim: aynı klasörler. Her görsel veridir; şekildeki sayı ile metindeki sayı ayrışamaz. Her dersin öncelikli görselleri `LESSON_VISUAL_KITS` içindedir (ör. Kimya: atom, molekül, tepkime, tablo).

| Görsel | Ders | Ne yapar | Kütüphane |
| --- | --- | --- | --- |
| `formula` | Matematik, fizik, kimya | Formül | KaTeX |
| `reaction` | Kimya | Tepkime denklemi (alt simge, ok, hâl); uzun denklem kutuya sığacak kadar küçülür | KaTeX mhchem |
| `plot` | Matematik, fizik, coğrafya | Fonksiyon grafikleri sırayla çizilir; ölçüm verisi sütun ya da çizgi; işaretli noktalar. **Katsayılar** (`parameters`: a, b, c, k, m, n) anlatımla değişir ve eğri yeniden biçimlenir; **hareketli teğet** (`tangent`, eğim değeriyle); **alan** (`area`) bütün ya da şeritlere bölünmüş (şerit sayısı artarak gerçek alana yaklaşır) Parçalı fonksiyon: eğriye `domain` [başlangıç, bitiş] ve `ends` (none/open/closed). Limit: `approach` {at, left, right, hole, label}, iki yandan yaklaşan noktalar (parça `approach`). | d3-scale, d3-shape |
| `equation` | Matematik | Denklem çözümü terazide: her adımda aynı işlem iki kefeye düşer, terazi dengede kalır; adımlar yanda listelenir | KaTeX |
| `numberLine` | Matematik | Sayı doğrusu: `range` çizilen bölüm, `ticks` altına yazılan sayılar (varsayılan tam sayılar). Aralıklar (`intervals`, parçalar `i1…`) anlatım gelince soldan sağa çizilir; `closedFrom`/`closedTo` dolu nokta, boş uç boş nokta, `from`/`to` null ise ok. `row` 1 ve 2 doğrunun üstünde ayrı satırdır: sistemde iki eşitsizlik yukarıda, ortak çözüm doğrunun üstünde. Noktalar (`points`, parçalar `p1…`) doğruya düşer. Eşitsizlik, aralık, mutlak değer | SVG (kendi) |
| `unitCircle` | Matematik | Birim çember: açılar (`angles`, parçalar `a1…`; derece, eksi değer saat yönü) vuruş gelince 0°'dan döner; `label` yayın ortasında, `point` noktanın yanında yazılır. `lines` son dönen açı için kosinüsü x ekseninde, sinüsü noktaya kadar, `tan` ile tanjantı x = 1 doğrusunda çizer (parçalar `cos`, `sin`, `tan`). `signs` her bölgede pozitif fonksiyonları köşeye yazar (`q1…q4`); `wave` sinüs ya da kosinüs eğrisini çemberin yanında, açı dönerken izler (`wave`). Esas ölçü, işaret, indirgeme, grafik, denklem | SVG (kendi) |
| `transform` | Matematik | Dönüşümler: `view` koordinat kutusu, `shape` adlı köşeler (1–6). `steps` (parçalar `s1…`) vuruş gelince sırayla oynar: `translate` (`by`), `rotate` (`degrees`, `center`), `reflect` (`over`: x, y, origin, y=x, y=-x), `reflectLine` (`axis`, `at`: x = at ya da y = at), `reflectPoint` (`center`). Eski konumlar soluk kalır, adlar üs işareti alır; `coordinates` koordinatları yazar. Öteleme, yansıma, dönme, bileşke | SVG (kendi) |
| `pie` | İstatistik, Coğrafya | Daire grafiği: dilimler (`slices`, parçalar `p1…`) sırayla ya da vuruş gelince açılır, odaktaki dilim dışarı çıkar; `show` değeri, yüzdeyi ya da merkez açıyı yazar | SVG (kendi) |
| `geometry` | Geometri | Nokta, kenar uzunluğu, eşit kenar çentiği (`ticks`), çember, açı (dik açı işareti), dolgulu çokgen | SVG (kendi) |
| `solid` | Geometri, matematik | 3B cisim döner; ayrıtlar ve ölçüler; `unfold` ile **açınım** (küp, dikdörtgenler prizması, üçgen prizma, kare piramit, silindir, koni) | three.js (@remotion/three) |
| `forces` | Fizik | Serbest cisim diyagramı; düz ya da eğik zemin. Yön yüzeye göre verilir (`weight`, `normal`, `upSlope`…): N her zaman yüzeye diktir; ok boyları `magnitude` ile orantılıdır. Eğik zeminde dik olmayan bir N şemada reddedilir | SVG (kendi) |
| `lever` | Fizik | **Tork ve denge**: destek üzerinde çubuk, kuvvet okları ve asılı yükler, çubuk ağırlığı (`weight`, ortada). Her kuvvetin kolu ve torku (↺ saatin tersine, ↻ saat yönünde) yazılır; çubuk torklar eşitse düz kalır, değilse kazanan yöne döner. `torques: false` sayıları gizler, `verdict: false` kuvvetleri seçenek gibi karşılaştırır; kuvvetin `arm` etiketi kol yerine bilinmeyeni yazar ("x"). Vuruşlar `f1…`, `a1…`, `pivot`, `weight`, `sum` | SVG (kendi) |
| `centreOfMass` | Fizik | **Kütle merkezi** kare ızgarada: noktasal kütleler (disk kütleyle büyür), türdeş çubuklar, levhalar ve kesilen parçalar (`removed`, eksi kütle; levhanın kütlesi verilmezse alanı). Her cismin merkezi ×; sistemin merkezi cisimler sayıldıkça kayar ve koordinatı eksenlere okunur. Soru figüründe `centre: false` cevabı gizler. Vuruşlar `b1…`, `centre`, `coordinates` | SVG (kendi) |
| `pulley` | Fizik | **Makara ve palanga**: `ropes` taşıyıcı ip (1 sabit makara, 2 hareketli makara, 3-6 palanga), `load` (G), isteğe bağlı `pulleyWeight` (her hareketli makara). F = (G + hareketli makaralar) / n yazılır; ip çekilir, yük n kat az yükselir, h ve x = n·h işaretlenir. Soru figüründe `motion: false`, `forceLabel: "F = ?"`. Vuruşlar `ropes` (ipleri numaralar), `load`, `f`, `pull`, `h` | SVG (kendi) |
| `gears` | Fizik | **Dişli, kasnak, çıkrık**: `wheels` (yarıçap birimle; `teeth` dişli/kasnak; `link` önceki tekerleğe `mesh`/`belt`/`crossed`/`axle`; `angle` yerleşim yönü; `hang` ipe asılı yük). İlk tekerlek `turns` tur döner, diğerleri doğru hız ve yönde izler; tur sayaçları ↻/↺. Perçinli tekerlek öndeki katmanda; aynı katmanda çakışma reddedilir. Vuruşlar `w1…`, `turn`, `counts` | SVG (kendi) |
| `kinematics` | Fizik | **Hareket grafikleri**: 1-2 cisim (`x0`, `v0`, `phases`: süre, ivme, isteğe bağlı ani hız `v`) yolda koşar; `graphs` (v, x, a; en çok 2) hareketle çizilir, `area` v-t alanını doldurur ve Δx yazar. Soru figüründe `motion: false`, `track: false`. Vuruşlar `b1`, `b2`, `run`, `area` | SVG (kendi) |
| `energyTrack` | Fizik | **Enerji pisti**: `profile` ([x, h] metre), `start`, `v0`, `mass`, `friction` (sabit kuvvet, N). Cisim enerjisinin izin verdiği hızla kayar, enerjisi bitince geri döner; Eₖ, Eₚ, ısı çubukları ve başlangıç toplamı çizgisi. Vuruşlar `body`, `bars`, `run` | SVG (kendi) + sayısal çözüm |
| `projectile` | Fizik | **Atış**: `v0`, `angle` (derece; 90 düz yukarı, eksi aşağı), `height`, `g` (ya da herhangi bir sabit ivme). Hız oku ve vx, vy bileşenleri; `strobe` eşit zamanlı konumlar; tepe ve menzil (`rangeLabel`). Soru figüründe `motion: false`. Vuruşlar `body`, `path`, `components`, `strobe`, `apex`, `range`, `run` | SVG (kendi) |
| `collision` | Fizik | **Çarpışma**: iki araba (`label`, `mass`, `v`; sağ artı), `type` `elastic` / `inelastic` / `explosion` (`after` ile; momentum denetlenir). Önce ve sonra momentum okları, toplamlar; `energy` kinetik enerjiyi yazar. Vuruşlar `b1`, `b2`, `before`, `after`, `energy`, `run` | SVG (kendi) |
| `electricField` | Fizik | **Elektrik alan**: `charges` (`at`, `q` işaretli, `label`), `view`; alan çizgileri (`lines`), eş potansiyeller (`equipotentials`, kq/d), noktalar (`points`: `field` oku, `potential` değeri). Vuruşlar `c1…`, `lines`, `equipotentials`, `p1…` | SVG (kendi) + sayısal izleme |
| `parallelPlates` | Fizik | **Paralel levhalar**: `top` (+/−), `voltage`, `gap`, `charges` (işaret sayısı), düzgün alan okları; `particle` (`charge`, `mode`: `deflect` / `accelerate` / `balance`). Vuruşlar `plates`, `field`, `particle`, `forces`, `run` | SVG (kendi) |
| `magneticField` | Fizik | **Manyetizma**: `mode` `particle` (alan `in`/`out`, `charge`), `wire` (`current` `in`/`out`), `force` (`current` up/down/left/right), `parallel` (`currents`). Yönler sağ el kuralıyla hesaplanır. Vuruşlar `field`, `body`, `force`, `run` | SVG (kendi) |
| `induction` | Fizik | **İndüksiyon**: mıknatıs (`pole` halkaya bakan kutup) yaklaşır, durur, uzaklaşır; galvanometre ve indüklenen akım (Lenz). Vuruşlar `stage` 0-2, `magnet`, `ring`, `meter` | SVG (kendi) |
| `circular` | Fizik | **Çembersel hareket**: `mode` `disk` / `orbit` / `vertical`; `bodies` (`label`, `radius` 0,2-1); hız ve merkezcil ivme okları. Vuruşlar `b1…`, `velocity`, `acceleration`, `run` | SVG (kendi) |
| `kepler` | Fizik | **Kepler yasaları**: `eccentricity` 0-0,8, `sector` (eşit süre payı), `period` (sn), `motion`; gezegen Kepler denklemiyle elips üstünde ilerler (yakında hızlı), Güneş odakta, eşit sürede taranan iki alan dolar. Vuruşlar `planet`, `sectors`, `run` | SVG (kendi) |
| `oscillator` | Fizik | **Basit harmonik hareket**: `mode` `spring` / `pendulum`; `period` (sn), `marks` (`label`, `at` −1…1 genlik payı), `velocity`, `acceleration`, `energy` (Ek/Ep çubukları), `reference` (yay: izdüşümü olduğu çember), `trace` (yay: aşağı akan x–t şeridi), `motion`, `at` (soru şekli). x = A cos ωt; hız dengede, ivme uçlarda en büyük. Vuruşlar `body`, `velocity`, `acceleration`, `energy`, `reference`, `trace`, `marks`, `run` | SVG (kendi) |
| `interference` | Fizik | **Girişim**: `mode` `ripple` (üstten dalga leğeni: eş fazlı iki kaynak `separation` λ arayla, genişleyen tepeler, `lines` ile katar (düz) ve düğüm (kesikli) hiperbolleri, `points` λ cinsinden) / `double` / `single` (yarık, perde saçakları ve parlaklık eğrisi; `colours` iki ışığı karşılaştırır); `motion`. Vuruşlar `sources`, `crests`, `antinodes`, `nodes`, p1…, `run` (leğen); `slits`, `screen`, `graph`, `width` (yarık) | SVG (kendi) |
| `doppler` | Fizik | **Doppler olayı**: `speed` (dalga hızının payı, 0 = duran kaynak), `motion`; cepheler önde sıkışır (λ kısa, f büyük), arkada açılır. Vuruşlar `source`, `fronts`, `ahead`, `behind`, `run` | SVG (kendi) |
| `bohr` | Fizik | **Bohr atomu**: `levels` 2-6 (yarıçap ∝ n²), `transitions` (`from`, `to`; iniş foton yayar, çıkış foton soğurur), `diagram` (gerçek ölçekli enerji düzeyleri, E = −13,6/n² eV), `motion`. Foton sağa, diyagramdaki ΔE okuna doğru uçar; Balmer çizgileri kendi renginde. Vuruşlar `nucleus`, `orbits`, `levels`, `jump`, `photon`, `run` | SVG (kendi) |
| `halfLife` | Fizik | **Yarı ömür**: `count` çekirdek ızgarası, `halfLives`, `period` (sn), `graph` (N = N₀/2^(t/T) eğrisi), `motion`; çekirdekler rastgele anlarda bozunur ama her yarı ömürde kalanın tam yarısı gider. Vuruşlar `nuclei`, `count`, `graph`, `run` | SVG (kendi) |
| `photoelectric` | Fizik | **Fotoelektrik olay**: `frequency` (ilk metalin eşik frekansı birimiyle), `intensity` 1-3 (foton sayısı), `metals` (`threshold`, `label`; aynı eğimli Eₖ–f doğruları), `graph`, `intercept` (uzantı −W'ye), `motion`. Eşik altında foton kırmızı ve elektron yok; üstünde mor, her foton bir elektron söker, hız √Eₖ ile. Vuruşlar `plate`, `light`, `electrons`, `graph`, `slope`, `run` | SVG (kendi) |
| `orbitals` | Kimya | **Orbital kutuları**: `atomicNumber` 1-36, `charge` −3…+3 (katyon önce en büyük n'den, 4s 3d'den önce boşalır), `symbol`, `highlight` (`n`, `l`, `ml`: eşleşen elektronlar renklenir, ötekiler solar, sayaç yazar), `motion`. Enerji merdiveninde Aufbau sırası, Hund (önce birer, aynı spin), Pauli (zıt spin); Cr ve Cu istisnası. Vuruşlar `boxes`, `electrons`, `config`, `count`, `run` | SVG (kendi) |
| `gas` | Kimya | **Gazlar**: `mode` `container` (pistonlu kapta çarpışan tanecikler; `states` hacim 0,3-1, sıcaklık ve mol ilk hâle göre; vuruşlar `stage` 0, 1… ile hâl değiştirir; P, V, T, n çubukları ilk hâlle karşılaştırılır, P = nRT/V, sabit kalanlar yazılır) / `diffusion` (`gases` iki gaz ve mol kütlesi, `length` cm; Graham'a göre buluşma noktası ve uzaklıklar). Vuruşlar `container`, `particles`, `gauges`; `tube`, `fronts`, `meet`, `run` | SVG (kendi) |
| `solution` | Kimya | **Çözeltiler**: `beakers` 1-3 (`label`, `molality`, `ions`: etiket ve formüldeki sayı; moleküler çözünen tek girişle), `effect` (`freezing`, `boiling`, `osmotic`, `vapour`: i·m çubukları), `motion`. Kristal çözünür, tanecikler (katyon, anyon, molekül) beherde dağılır. Vuruşlar `b1…`, `particles`, `bars`, `run` | SVG (kendi) |
| `energyProfile` | Kimya | **Potansiyel enerji grafiği**: `reactants`, `products`, `peak` (kJ), `catalyst` (kesikli alçak tepe), `intermediate` + `peak2` (iki basamaklı mekanizma, Ea₁ ve Ea₂), `reactantLabel`, `productLabel`, `ea`, `dh`, `reverse` (geri Ea), `values` (düzeyler eksende; soru şeklinde oklar kapatılır), `motion` (top tepeyi aşar). Vuruşlar `curve`, `ea`, `dh`, `reverse`, `catalyst`, `ball`, `run` | SVG (kendi) |
| `equilibrium` | Kimya | **Denge**: `mode` `concentration` (`species`: `start`, `first`, müdahalede `jump` ve `second`; `event` etiketi; `marks` t₁…; derişimler üstel olarak dengeye yaklaşır, müdahalede sıçrar ve yeni dengeye oturur; uç etiketleri çakışmasın diye aralanır) / `rates` (ileri ve geri hız eşitlenir). Vuruşlar `axes`, s1…, `event`, `rates`, `run` | SVG (kendi) |
| `electrochemicalCell` | Kimya | **Elektrokimyasal hücre**: `mode` `galvanic` (iki yarı hücre, tuz köprüsü `bridge`, voltmetre `voltage`) / `electrolysis` (tek kap, güç kaynağı); `anode`, `cathode` (`label`, `solution`), `anodeDissolves`, `cathodeGrows`, `anodeGas`, `cathodeGas`, `motion`. Elektronlar telde anottan katoda, tuz köprüsünde anyonlar anoda, katyonlar katoda akar; anot incelir, katot kalınlaşır, gaz kabarcıkları yükselir. Vuruşlar `anode`, `cathode`, `wire`, `bridge`, `electrons`, `ions`, `meter`, `run` | SVG (kendi) |
| `distillation` | Kimya | **Ayrımsal damıtma**: `fractions` (üstten alta `name`, `range`), `feed`, `heatLabel`, `hotLabel`, `coolLabel`, `motion`. Fırından gelen buhar altı sıcak, üstü soğuk kulede yükselir; her kabarcık kendi kesiminin tablasında yoğunlaşıp borusundan akar. Bir kesim gösterilmeden ona buhar gitmez. Vuruşlar `column`, `feed`, `gradient`, `f1`… | SVG (kendi) |
| `nuclear` | Fizik, Kimya | **Çekirdek tepkimeleri**: `mode` `fission` (nötron çekirdeğe çarpar, çekirdek titrer, `fragments` odaklanınca bölünür; `target`, `products`, `neutrons`, `energy`), `chain` (üç kuşak, k katına büyür; `controlled` ile kontrol çubukları fazla nötronları yutar; sayaç `countLabel`), `fusion` (`fusion.left/right/product`, `product` odaklanınca birleşir); `period`, `motion`. Vuruşlar fisyonda `neutron`, `nucleus`, `fragments`, `neutrons`, `energy`; zincirde `g1`–`g3`, `rods`, `count`; füzyonda `reactants`, `product`, `neutron`, `energy`; hepsinde `run` | SVG (kendi) |
| `neuron` | Biyoloji | **Sinir impulsu**: `mode` `impulse` (aksonda Na⁺ dışarıda, K⁺ içeride; impuls ilerlerken Na⁺ girer, iç taraf artıya döner, K⁺ çıkar, pompa geri taşır; ölçüm noktasının zar potansiyeli grafiği −70, eşik, +30, hiperpolarizasyon), `myelin` (miyelinsiz ve miyelinli akson yarışı, boğumdan boğuma atlama), `synapse` (impuls akson ucuna gelir, kesecikler ekzositozla boşaltır, nörotransmitter reseptörlere bağlanır, sonraki nöron uyarılır, enzim parçalar; her adım kendi vuruşunu bekler); `period`, etiketler, `motion`. Vuruşlar impulsta `axon`, `charges`, `ions`, `probe`, `graph`, `threshold`; miyelinde `plain`, `myelinated`; sinapsta `terminal`, `vesicles`, `transmitters`, `receptors`, `post`, `enzyme`; hepsinde `run` | SVG (kendi) |
| `feedback` | Biyoloji | **Hormonal geri bildirim**: `nodes` (2–4 bez, soldan sağa), `hormones` (her ok için bir hormon), `back` (geri bildirimin döndüğü bezler), `levelLabel`, `setLabel`, `mode` `negative` (düzey bir kez aşar, normalde dengelenir; − oku düzey arttıkça yanar, akış yavaşlar) / `positive` (+ oku akışı hızlandırır, düzey kaçar, olayla biter), `period`, `motion`. Altta düzeyin eğrisi, yanda gösterge. Vuruşlar `n1`…, `h1`…, `feedback`, `level`, `run` | SVG (kendi) |
| `eye` | Biyoloji | **Göz ve görme**: ışınlar korneadan ve mercekten geçip retinada odaklanır; `mode` `normal` (`near` ile yakın noktanın ışığı önce retinanın arkasına odaklanır, `near` vuruşunda mercek kalınlaşır: uyum), `myopia` (odak retinanın önünde) / `hyperopia` (arkasında), retinada bulanık leke; `glasses` vuruşunda kalın kenarlı ya da ince kenarlı mercek odağı retinaya taşır; etiketler (kornea, mercek, retina, sarı benek, görme siniri, `glassesLabel`), `motion`. Vuruşlar `eye`, `lens`, `retina`, `rays`, `focus`, `glasses` / `near`, `run` | SVG (kendi) |
| `sarcomere` | Biyoloji | **Sarkomer, kayan iplikler**: Z çizgilerine bağlı aktin, ortada başlıklı miyozin; `run` vuruşunda Z çizgileri `relaxed` µm'den `contracted` µm'ye yaklaşır (miyozin başları sallanır), `relax` vuruşunda açılır. A bandı (miyozin) sabit, I bandı ve H bölgesi kısalır; köşeli ayraçlar uzunluklarıyla (`lengths`) ya da soru şekli için yalnız etiketleriyle (`aLabel`, `iLabel`, `hLabel` → I, II, III; `motion: false`). Vuruşlar `z`, `actin`, `myosin`, `a`, `i`, `h`, `relax`, `run` | SVG (kendi) |
| `digestion` | Biyoloji | **Kimyasal sindirim haritası**: sütunlar istasyonlar (`stations`: ağız, mide, ince bağırsak), satırlar besinler (`rows`: `label`, `shape` circle/square/drop, `intake` ve istasyon başına `stages` grup boyları: [8] tek zincir, [2, 2, 2, 2] ikililer, birler tek birim; `enzymes`). `run` vuruşunda besin istasyonlara `period` saniye arayla ulaşır; her hücrede gelen zincir çıkan gruplara bölünür, yağ damlası küçük damlalara ayrılır, enzim adı belirir. Birim sayısı korunur (şema denetler). Vuruşlar `s1`…, `r1`…, `run` | SVG (kendi) |
| `circulation` | Biyoloji | **Kan dolaşımı**: önden görülen dört odacıklı kalp (sağ yarı izleyicinin solunda), akciğerler ve vücut; küçük dolaşım (sağ karıncık → akciğer → sol kulakçık) ve büyük dolaşım (sol karıncık → vücut → sağ kulakçık); oksijence zengin kan turuncu, fakir kan dersin koyu tonu, gösterge. `run` vuruşunda işaretli bir alyuvar turu `period` saniyede tamamlar, akciğerde zenginleşir, vücutta fakirleşir; karıncıklar hafifçe atar. Bütün etiketler değiştirilebilir. Vuruşlar `heart`, `lungs`, `body`, `small`, `big`, `cell`, `run` | SVG (kendi) |
| `nephron` | Biyoloji | **Nefron**: glomerulus ve Bowman kapsülü, proksimal tüp, Henle kulpu, distal tüp, toplama kanalı, tüp çevresi kılcallar. `filtration` vuruşunda süzüntü akmaya başlar; `reabsorption` (glikoz, amino asit, Na⁺, su kana), `secretion` (H⁺, K⁺, kreatinin tüpe), `adh` (toplama kanalından su) kendi vuruşlarında belirir; notlar (`reabsorptionLabel`, `secretionLabel`, `adhLabel`) satır satır. Soru şekli için `labels` numaralarla, `numbered` büyük yazı, `motion: false`. Vuruşlar `capsule`, `glomerulus`, `proximal`, `loop`, `distal`, `collecting`, `filtration`, `reabsorption`, `secretion`, `adh` | SVG (kendi) |
| `geneExpression` | Biyoloji | **Gen ifadesi**: `codons` (mRNA üçlüleri ve amino asitleri; yalnız sonuncusu `stop` olabilir), `mode` `transcription` (kodlayan ve kalıp iplik, RNA polimeraz DNA'yı açar, mRNA kalıba eşlenerek harf harf uzar; U, A'nın karşısına) / `translation` (ribozom kodon kodon ilerler, antikodonu eşleşen tRNA amino asidini getirir, peptit bağıyla zincir uzar, boş tRNA ayrılır, durdurma kodonunda zincir serbest kalır, alt birimler ayrılır); `period` (kodon başına saniye), etiketler, `motion`. Vuruşlar transkripsiyonda `dna`, `template`, `polymerase`, `mrna`; translasyonda `mrna`, `ribosome`, `trna`, `peptide`; ikisinde de `run` | SVG (kendi) |
| `cave` | Felsefe | **Platon'un mağarası**: `objects` (en çok 4: `horse`, `vase`, `bird`, `tree`; sırayla alçak duvarın üstünden geçer), `period` (nesne başına saniye), etiketler (`wallLabel`, `prisonersLabel`, `objectsLabel`, `fireLabel`, `exitLabel`, `sunLabel`, isteğe bağlı `outsideLabel`), `outside` (false: dış dünya çizilmez), `freed` (vuruşsuz çizimde tutsak dışarıda), `motion`. Gölgeler ateşin konumundan izdüşümle büyür. `freed` gösterilince bir tutsak kalkar, ateşte gözü kamaşır, mağaradan çıkar. Vuruşlar `wall`, `prisoners`, `objects`, `fire`, `exit`, `outside`, `sun`, `freed` | SVG (kendi) |
| `emanation` | Felsefe | **Sudur (taşma)**: `source` (`label`, isteğe bağlı `detail`), `levels` (2-5; içten dışa, her biri bir halka ve bir öncekinden daha karanlık), `period` (ışık dalgası saniyesi), `motion`. Işık ve kıvılcımlar kaynaktan dışa akar; her halka vuruşla büyüyerek gelir, yandaki listede numarasıyla yazılır. Vuruşlar `source`, `l1`… | SVG (kendi) |
| `theseus` | Felsefe | **Theseus'un gemisi**: `period` (tahta başına saniye), `firstLabel`, `secondLabel`, `pileLabel`, `counterLabel`, `motion`. `replace` gösterilince 24 tahta tek tek yenilenir, sayaç ilerler, eski tahtalar limanda yığılır; `second` gösterilince (bütün tahtalar değiştikten sonra) yığın ikinci gemiye dönüşür. Vuruşsuz çizimde iki gemi de hazırdır. Vuruşlar `ship`, `replace`, `pile`, `second` | SVG (kendi) |
| `trolley` | Felsefe | **Tramvay ikilemi**: `fiveLabel`, `oneLabel`, `leverLabel`, `motion`. Tramvay makasa gelip bekler; `switch` gösterilince kol çekilir ve yan raya geçer, `stay` gösterilince düz devam eder; her durumda insanlardan önce durur (zarar gösterilmez). Vuruşlar `trolley`, `five`, `one`, `lever`, `switch`, `stay` | SVG (kendi) |
| `retrograde` | Fizik, Felsefe | **Gezegenlerin geri hareketi**: `year` (Dünya yılı kaç saniye; 8-30), etiketler (`sunLabel`, `earthLabel`, `marsLabel`, `skyLabel`, `forwardLabel`, `retroLabel`), `motion`. Dünya ve Mars gerçek oranla döner; bakış çizgisi ve gök şeridi Mars'ın ileri, geri, yeniden ileri gidişini çizer (döngü, Dünya Mars'ı geçerken). Vuruşlar `sun`, `earth`, `mars`, `sightline`, `sky`, `retro` | SVG (kendi) |
| `rutherford` | Kimya, Fizik | **Rutherford altın levha deneyi**: `period` (demet kaç saniyede bir yinelenir; 4-20), etiketler (`sourceLabel`, `foilLabel`, `screenLabel`, `nucleusLabel`), `motion`. Alfa tanecikleri levhadan geçip dairesel ekrana çarpar; sapma açısı Rutherford bağıntısından, çoğu düz geçer, çok azı geri döner; büyüteçte boş atom ve küçük çekirdek. Vuruşlar `source`, `foil`, `screen`, `beam`, `atom` | SVG (kendi) |
| `intermolecular` | Kimya, Biyoloji | **Moleküller arası etkileşimler**, 1-2 panel (`panels`: `mode` = `hydrogen` / `london` / `dipole` / `ionDipole`, `label`, `ion`, `anion`), `motion`. Su ağında kopup oluşan hidrojen bağları, kayan elektron bulutlarıyla London, δ+ → δ− dizilen dipoller, iyonu saran su (katyona O, anyona H). Vuruşlar `p1`, `p2`, `links` | SVG (kendi) |
| `stoichiometry` | Kimya | **Tanecik düzeyinde tepkime**: `reactants` (`formula`, `atoms`, `coefficient`, `count`), `products` (`formula`, `atoms`, `coefficient`), `step` (tur süresi), etiketler (`beforeLabel`, `afterLabel`, `limitingLabel`, `excessLabel`, `completeLabel`), `motion`. Denklem tur tur işler, sınırlayıcı bitince durur, artan işaretlenir; denklem denk olmalı. Vuruşlar `reactants`, `react`, `products`, `result` | SVG (kendi) |
| `titration` | Kimya | **Asit-baz titrasyonu** (kuvvetli asit-kuvvetli baz): `flask` (`kind` acid/base, `label`, `molarity`, `volume` mL, `valence`), `burette` (`label`, `molarity`, `valence`), `maxVolume`, `indicator` (`phenolphthalein`, `bromothymol`, `none`), `duration`, `volumeLabel`, `equivalenceLabel`, `motion`. Damlalar, renk dönümü, canlı pH ve hesaplanmış pH eğrisi. Vuruşlar `burette`, `flask`, `curve`, `run`, `equivalence` | SVG (kendi) |
| `phaseDiagram` | Kimya | **Faz diyagramı** (ölçeksiz şema): `substance` (`water` sola yatık erime çizgisi, `co2` sağa yatık), `path` (`kind` isobar/isotherm, `at`, `to`, `label`), `duration`, eksen değerleri (`tripleT`, `tripleP`, `criticalT`, `criticalP`), hâl ve nokta etiketleri, `motion`. Nokta yol boyunca ilerler ve hâlini yazar. Vuruşlar `axes`, `regions`, `curves`, `triple`, `critical`, `path` | SVG (kendi) |
| `tyndall` | Kimya | **Tyndall etkisi**: `beakers` (2-3; `kind` solution/colloid/suspension, `label`, `detail`), `laserLabel`, `motion`. Işın çözeltide görünmez, kolloidde parlar, süspansiyonda saçılır; süspansiyon çöker. Vuruşlar `laser`, `b1`…, `beam`, `settle` | SVG (kendi) |
| `greenhouse` | Kimya, Coğrafya | **Sera etkisi**: `gases` (0-6 şerit), etiketler (`sunLabel`, `groundLabel`, `atmosphereLabel`, `gasLabel`, `lightLabel`, `infraredLabel`, `temperatureLabel`), `motion`. Görünür ışık girer, kızılötesi sera gazlarınca tutulup geri yollanır, termometre yükselir. Vuruşlar `sun`, `light`, `ground`, `infrared`, `gases`, `trapped` (işaret), `thermometer` | SVG (kendi) |
| `micelle` | Kimya | **Sabun ve misel**: `molecules` (8-16), etiketler (`waterLabel`, `fabricLabel`, `oilLabel`, `headLabel`, `tailLabel`), `motion`. Sabun molekülleri yağı sarar (kuyruk içte, baş dışta), misel kumaştan kalkar. Vuruşlar `fabric`, `oil`, `soap`, `wrap`, `lift` | SVG (kendi) |
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
| `sentence` | Türkçe, yabancı dil | Cümle ögeleri / dil bilgisi rolü, vurgu, çeviri; `links` ile parçadan parçaya ok (neden → sonuç), `swap` ile bir parçanın başka sözcüğe dönüşmesi (eş anlamlı, ilişkiyi değiştiren ek) | — |
| `paragraph` | Türkçe | Paragraf haritası: konu, numaralı cümleler (I, II…) ve görevleri; yardımcı cümlelerden ana düşünceye ok hattı, ok ulaşınca ana düşünce yanar; `off` cümle (akışı bozan) hattın dışında kalır ve gösterildiğinde üstü çizilir | — |
| `comparison` | Her ders | İki-üç sütunlu karşılaştırma | — |
| `table` | Her ders, mantık | Tablo, doğruluk tablosu (vurgulu sütun) | — |
| `venn` | Matematik, mantık | İki-üç küme | SVG (kendi) |
| `conceptMap` | Felsefe, sosyoloji, din | Kavram haritası | Mevcut |
| `battle` | Tarih | Savaş düzeni evre evre: tepeden eğik bakılan alan (akarsu, deniz, tepe, orman, bataklık, kale, sur, şehir, ordugâh, yol, mayın hattı); iki tarafın birlikleri sancaklı asker kümeleri; her evrede yürüyüş, çarpışma, ateş, saf değiştirme, bozulup kaçma; kamera evrenin geçtiği yere yaklaşır. Ayrıntı aşağıda | SVG (kendi) |
| `process` | Coğrafya, fizik, kimya, biyoloji, matematik | Bir süreç evre evre, gerçekten olurken: heyelan, erozyon, karst, kaynaklar, kayaç döngüsü, volkan, buzul, kıyı, rüzgâr, çözülme, sel, çığ; hâl değişimi, ısı aktarımı, basınç; mitoz, karbon döngüsü; alan modeli, sayı doğrusu. Ayrıntı aşağıda | SVG (kendi) |
| `matching` | Her ders (özellikle sözel) | Eşleştirme: solda terimler, sağda eşleri karışık sırada; anlatım bir eşe gelince çizgisi çizilir ve kalır (parçalar `p1…`) | — |
| `flipcards` | Her ders (özellikle sözel) | Dönen kartlar: önde terim, anlatım gelince kart dönüp örneği ya da açıklamayı gösterir; arka yüzde terim küçük başlık olarak kalır (parçalar `p1…`) | — |
| `picture` | Tarih, biyoloji, edebiyat | Lisansı kayıtlı resim ya da fotoğraf: belgesel gibi yavaşça yaklaşır; `regions` (resmin payı olarak `[sol, üst, sağ, alt]` ve etiket) anlatım işaret edince kamerayı oraya götürür, çerçeveler ve adını yazar; resim kareyi doldurmazsa boşluğu bulanık kopyası doldurur. `aspect` dosyanın en/boy oranıdır. Yatay videoda tam kadraj | — |

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

Parça adları: grafikte `c1…` eğriler, `p1…` noktalar, `tangent`, `area`; geometride nokta adları, kenarlar uçlarıyla (`AB`), çokgenler noktalarıyla (`ABC`), açılar `angle-A`; kuvvetlerde etiket; akış ve döngüde `n1…`; zaman çizelgesinde `e1…`; haritada vurgu ve işaret adları. Dil görsellerinde: cümlede sözcük kutuları `w1…` (soldan sağa); karşılaştırmada sütunlar `c1…` ve maddeleri `c1-1…`; tabloda satırlar `r1…`, sütunlar `col1…`. Bunlarda `show` parçayı o cümleyle getirir, `focus` parçayı ders rengine boyayıp büyütür, geri kalanı soluklaştırır; tablo başlığı satır vurgulanırken okunur kalır. Bu üç görsel kutularının genişliğini alır ve kutuyu dolduracak kadar (en çok 1,5 kat) büyür; metin büyürken satıra kırılır, kesilmez. Numaralı parçası olan görsellerde (cümle, karşılaştırma, tablo, akış, döngü, zaman çizelgesi) olmayan bir parçaya işaret eden beat şemada reddedilir (ör. iki sözcüklü cümlede `w3`). Beat'i olmayan görsel eskisi gibi kendi kendine çizilir, süreçler aşamalarını sırayla oynatır. Görseli olmayan karta beat yazılırsa şema reddeder (anlatım kaybolmasın).

### Savaş görseli (`battle`)

Sahip (29 Ekim 2026): savaşlar savaş düzeninde ve güçlü bir animasyonla anlatılır. Görsel, öğretmenin tahtaya çizdiği savaş şemasının canlısıdır: kaynağın söylediği dizilişi ve hareketi gösterir, söylemediği ayrıntıyı (asker sayısı, kesin konum) çizmez. Diziliş MEB ders kitabından ve akademik kaynaklardan araştırılır. Çizim: [`Battle.tsx`](../src/Components/Visuals/Humanities/Battle.tsx).

| Alan | Ne yapar |
| --- | --- |
| `sides` | İki taraf: ilki ders renginde, ikincisi mürekkep renginde |
| `ground` | Arazi: tür, noktalar (alan 100 × 60'lık bir ızgara, kuzey yukarıda), isteğe bağlı ad; ad, alanın ortası gemilerle doluysa `nameAt` ile başka yere yazılır. Kıyılar karada yuvarlanır, alanın kenarında köşeye kadar dolar |
| `units` | En çok 16 birlik: taraf (0/1), tür (`cavalry`, `infantry`, `archer`, `artillery`, `ship`, `command`), konum, etiket, `strength` 1–3 (küçük birlik, kanat, büyük ordu) |
| `stages` | En çok 6 evre; evre 0 açılış dizilişidir. Her evrede `moves` (birlik numarası 1'den başlar; hedef ve oku eğen `via` noktaları), `fire` (en yakın düşmana ateş: top gülle atar, okçu ok yağdırır, gemi yaylım ateşi açar), `defect` (saf değiştirir, rengi değişir), `routed` (bozulur, dağılıp kaçar, sancağı düşer), `burned` (yalnız gemi: yakılır, yerinde kalıp yatar, güvertede alev ve duman; Çeşme 1770, Navarin 1827), `note` (alanın altında kısa satır) |
| `outcome` | Son evrede kazananın renginde sonuç |

Evreler beat'lerin `stage` alanıyla ilerler: her beat bir evreyi anlatır. Birbirine yaklaşan iki düşman birlik çarpışır (duman, kıvılcım); bunun için ayrı alan gerekmez. Kamera her evrede hareket eden ve çarpışan birliklere yaklaşır (en çok 1,5 kat), son evrede bütüne döner; kadrajın kenarına gelen adlar solar. Yatay videoda savaş tam kadraj alır: rozet, başlık ve bölüm adı üstte tek satırdadır, uzun başlıkta bölüm adı kısalır. Var olmayan birliğe işaret eden evre şemada reddedilir. Örnekler: TYT Tarih senaryolarındaki 11 savaş (Malazgirt, Miryokefalon, Kösedağ, Ankara, İstanbul'un fethi, Çaldıran, Mohaç, Preveze, 18 Mart, Sakarya, Büyük Taarruz); AYT Tarih'te II. Viyana Kuşatması (1683) ve Çeşme Baskını (1770).

`check`, anlatımı bir süreç (savaş, heyelan, deprem, erozyon…) anlatan ama görseli bunu göstermeyen kartı "?" önerisi olarak yazar.

### Süreç görseli (`process`)

Sahip (29 Ekim 2026): anlatım heyelan diyorsa görüntüde toprak gerçekten kaysın; kayalar ve sular da böyle anlatılsın. `process` bir süreci olurken gösterir: evreler beat'lerin `stage` alanıyla ilerler, kamera her evrede olayın geçtiği yere yaklaşır, evrenin notu sahnenin altında yazılır. Savaş gibi yatay videoda tam kadraj alır. Çizim: `src/Components/Visuals/Processes/` (ortak çerçeve `ProcessScene.tsx`, evreler ve notlar `ProcessCatalog.ts`, her dersin sahneleri kendi alt klasöründe: `Processes/Geography/`, `Physics/`, `Biology/`, `Mathematics/`).

| Süreç (`process`) | Evreler (parça adlarıyla) | Ne olur |
| --- | --- | --- |
| `landslide` | `egim`, `tabaka`, `su`, `kayma`, `kutle`, `set` | Dik yamaç, yamaca paralel tabakalar; yağmur ve kar suyu toprağı doyurur; kil kayganlaşır, tepede çatlak açılır; kütle sütun sütun kayma yüzeyi boyunca kayar (ağaçlar, ev ve yol onunla gider, baş geriye döner, etek kabarır); vadi kapanır, kuşbakışı ek çizimde set gölü büyür |
| `erosion` | `damla`, `akis`, `oluk`, `tasinma`, `ortu`, `onlem` | Ormanlık yamaç ile eğim yönünde sürülmüş tarla yan yana: damla toprağı sıçratır, yüzey akışı toprağı sürükler, oluklar yarıntıya döner, A horizonu incelir, akarsu bulanır ve baraj gölü mille dolar (kuşbakışı), ormanda su toprağa sızar, taraçalar ve eğime dik sürme suyu tutar |
| `karst` | `lapya`, `dolin`, `polye`, `obruk`, `magara`, `traverten` | Kalker platoda erime olukları, dolinler ve birleşip uvala, polye; su düdenden iner, boşluğun tavanı çöker (obruk); mağarada sarkıt, dikit ve sütun büyür; kaynakta traverten basamakları kurulur |
| `spring` | `sizma`, `yamac`, `karstik`, `artezyen`, `fay` | Geçirimli tabakadan sızma ve taban suyu; yamaç kaynağı; kalker kanalından karstik kaynak; delinen kuyudan artezyen fışkırması; fay boyunca yükselen sıcak su ve jeotermal santral |
| `rockcycle` | `magma`, `magmatik`, `tortul`, `baskalasim` | Magma odası; derinde granit (iri kristal) ve yüzeyde bazalt (ince kristal), büyüteçlerle; aşınma, akarsuyla taşınma, denizde katman katman birikme ve sıkışma; gömülme, ısı ve basınçla başkalaşım, erime ve magmaya dönüş. Köşede döngü halkası |
| `volcano` | `batolit`, `lakolit`, `koni`, `lav`, `kaldera`, `maar` | Batolit (iri kristal); sill, lakolit (üstteki tabakalar kabarır) ve dayk; kül ve lav katmanlarıyla koni ve krater; akıp hızla soğuyan lav; tepe çöküp kaldera gölü (Nemrut); gaz patlamasıyla maar gölü (Meke) |

Fen ve matematik süreçleri: `phasechange` (`kati`, `erime`, `sivi`, `kaynama`, `gaz`: tanecik modeli ve eşzamanlı ısınma eğrisi), `heattransfer` (`iletim`, `konveksiyon`, `isima`, `denge`), `pressure` (`kati`, `derinlik`, `acikhava`, `pascal`; fıskiye menzilleri Torricelli'ye göre), `mitosis` (`interfaz` … `telofaz`, 2n = 4), `carboncycle` (`fotosentez`, `solunum`, `ayristirma`, `yanma`), `areamodel` (`tamkare`, `karefarki`), `numberline` (`uzaklik`, `denklem`, `esitsizlik`). Tek evreli kart da olur (`"stages": ["pascal"]`).

`stages` evrelerden bir bölümünü süreç sırasıyla seçer: "Magma nerede soğur?" kartı `["batolit", "lakolit", "koni", "lav"]`, "Kaldera ve maar nasıl oluşur?" kartı `["koni", "kaldera", "maar"]` kullanır. Beat'teki `stage`, gösterilen evrelerin sırasıdır. Parçalar evre adları ve sürecin etiketleridir (`catlak`, `yol`; `ahorizon`, `kok`, `taraca`; `uvala`, `duden`, `sarkit`, `dikit`, `sutun`, `kaynak`; `gecirimli`, `gecirimsiz`, `tabansuyu`, `kuyu`, `kaplica`; `granit`, `bazalt`, `asinma`, `birikme`, `mermer`; `sill`, `dayk`, `krater`, `magma`). Her etiket yalnız kendi evresinde görünür, kadraj onu keserse kadrajın içine kayar. Var olmayan evre ya da sırası bozuk `stages` şemada reddedilir.

```json
{"kind": "visual", "title": "Heyelan nasıl olur?", "visual": {"kind": "process", "process": "landslide"},
 "beats": [{"narration": "Her şey eğimle başlar…", "stage": 0, "focus": ["egim"]}, …]}
```

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
| `CampLesson` | 16:9, YouTube | `CourseLesson` stüdyo düzeninde + kamp kartı, alt bant (ders, kamp sırası, bölüm, bölüm çubuğu), kamp görevi ve sıradaki ders; YouTube bölüm listesi |
| `CampShort` | 9:16, Reels · Shorts · TikTok | `short.rounds` varsa 30 sn altı meydan okuma (ilk karede soru, 2–3 tuzaklı tur, tek skor çağrısı); yoksa `CourseShort` kartları + tanıtım. Üst çubukta kamp rozeti |

Dördünün içeriği aynı senaryodur. Seslendirme marka sesiyle (Lisa) ve metin bütün olarak üretilir; sahneler sese göre uzar.

## 8. Sonraki adımlar

1. İlk konunun (TYT Türkçe · Sözcükte Anlam, 13 alt başlık) tam senaryosunu yazmak; `check --mark`.
2. Örnek YouTube videosu ve kısa videoyu üretip birlikte değerlendirmek; kart süreleri ve görsel payını buna göre ayarlamak.
3. Bölge tablosunun (TurkeyRegions.ts) bir coğrafya öğretmenince kontrolü; eksik akarsuların eklenmesi.
4. Tarih ve biyoloji için kullanılacak görselleri seçip lisanslarıyla kütüphaneye almak.
5. Konu anlatımı paketi olmayan konular (ör. TYT'de 68 konu) için anlatımın hangi kaynaktan doğrulanacağına karar vermek.

## 9. Kamplar

Bir **kamp**, bir sınav dersinin bütün konularının sırayla yayımlanan serisidir: her konu bir YouTube dersi (`CampLesson`, en az 10 dakika) ve aynı senaryodan bir reels (`CampShort`). İki video aynı ders rengini, aynı kamp rozetini ve aynı dili taşır; reels, kampın YouTube'daki dersine yönlendirir.

**Plan**: `npm run curriculum -- camp create --category YKS_TYT --lesson TRK` dersin konularını üretim sırasıyla `Curriculum/Camps/yks-tyt-turkce-kampi.json` dosyasına yazar (ad, söz, dersler). Sıra ya da ad dosyada düzenlenebilir. `camp show <kamp>` her dersin ilerlemesini gösterir. İlk kamp: **TYT Türkçe kampı, 15 ders** (Sözcükte Anlam → Anlatım Bozukluğu).

**Senaryodaki kamp alanları** (`camp`, şema: [`src/Courses/Camp.ts`](../src/Courses/Camp.ts)): kamp kimliği ve adı, ders numarası ve toplam, sıradaki dersin adı, kampın sözü ve **kamp görevi** (1-3 madde ve okunan metni). `check` bu alanları kamp planıyla karşılaştırır.

**YouTube dersinin akışı** (`CampLesson`):

1. **SinoAI karşılaması**, kamp kartının üzerinde (ders renginde): "Merhaba, ben SinoAI. Sınavika'nın TYT Türkçe kampına hoş geldin! …". Karşılama kamp verisinden üretilir ve her derste aynı kalıptadır.
2. Dersin kancası ve "bu videoda" (CourseLesson'ın açılışı).
3. Bölümler. Her bölüm açılışında başlık ayrı bir satır olarak söylenir ("İkinci bölüm: Mecaz anlam."). Ardından kartlar, beat'li şekiller, tahmin kartları ve adım adım çözülen sorular gelir.
4. Özet.
5. **Kamp görevi**: 1-3 görev ve "Sıradaki ders" kartı (son derste "Kamp tamamlandı").
6. Uygulama tanıtımı: yalnız görsel; mağaza düğmelerinde logolar var.

Kartlar arasında 0,7 saniyelik yumuşak geçiş vardır; yeni bölüm, özet ve kamp görevi aşağıdan kayarak gelir. Anlatım dili, ses modeli, okunuş sözlüğü ve kapak kuralları: [CourseNarration.md](CourseNarration.md). Ders renkleri: [CourseColors.md](CourseColors.md).

**Ekran düzeni: stüdyo** (sahibin seçimi, 31 Ekim 2026). Kamp dersleri yalnız bu düzende çizilir; `CourseLesson` tek başına ve dikey video klasik düzende kalır (`LessonLayoutProvider`, [`LessonChrome.tsx`](../src/Templates/Courses/CourseLesson/Scenes/LessonChrome.tsx)).

- **Üst satır**: kartın türü (rozet) ve başlığı, sağda logo. Klasik düzendeki ders ve konu satırı ile "bölüm · kart numarası" satırı yoktur; uzun başlık ikinci satıra geçmez, ölçülerek küçülür (en çok %70'e).
- **Alt bant** (`StudioBand`): ders ve kamp sırası ("Biyoloji · 4/10"), oynayan bölümün adı ve bölüm çubuğu tek satırda.
- **Şekil kartı**: açıklama başlığın altında (en çok 3 satır, ölçülür), şekil kalan bütün yüksekliği alır. Klasiğe göre yaklaşık 1,5 kat büyüktür. Dik bir şekil açıklamasının yanında durur; açıklaması yoksa ortalanır.
- **Yazı kartları** (kural, kavram, örnek, hata): satır en çok ~60 harf; boş yer varsa yazı %15'e kadar büyür.
- **Soru**: şekilsiz soru okunurken ve düşünme süresinde ortada (kısaysa biraz büyük) durur, geri sayım sağındadır. İlk çözüm adımıyla soru sola kayar, çözüm paneli sağdan gelir. Şekilli soruda şekil okurken gerektiği için iki sütun baştan kalır.
- **Bölüm açılışı**: bölüm numarası, başlık ve dersin bölüm listesi (bitenler işaretli, şu anki vurgulu; uzun derslerde şu ankinin çevresindeki 7 bölüm). Sağda SinoAI küresi.
- **Kamp kartı**: kamp kapağıyla aynı düzen: kamp adı ve sınavlar etikette, konu en büyük, altında "Ders N / toplam" ve kampın ilerlemesi.
- **Özet**: maddeler iki sütunda numaralı, uyarılar altta.

Alt banttaki **bölüm çubuğu** her bölümün süresi kadar uzun parçalardan oluşur ve izlenen bölüm ders renginde dolar. Render bittiğinde videonun yanına **YouTube bölüm listesi** yazılır (`<video>.chapters.txt`): Giriş, her bölümün başlığı, Özet, Kamp görevi. YouTube'un kuralları uygulanır: 0:00'da başlar, en az 3 bölüm, her bölüm en az 10 saniye; kısa kalan bölüm bir öncekine katılır ([`SceneChapter.ts`](../src/Scenes/SceneChapter.ts)). Liste açıklamaya olduğu gibi yapıştırılır.

**Kapak**: kamp videolarında render kendiliğinden kamp kapağını yapar (`Thumbnails/CampCover`): ders renginde zemin (tanıtımda lacivert), kapak standardının düzeni, kampın adı, konu, dev ders numarası ve kampın ilerlemesi ([`Sosyal-Kimlik-Standardi.md`](Sosyal-Kimlik-Standardi.md)). Yalnız kapak: `npm run cover -- --job <video işi>`.

**YouTube başlığı** (sahip, 27 Ekim 2026): sınav ve ders başa yazılır, konu hemen ardından gelir; mobilde kesilmesin diye A başlığı ~60 karakteri geçmez. Kalıp `YKS TYT Türkçe | <Konu> Konu Anlatımı | Kamp Ders N`; A/B testindeki B ve C başlıkları da aynı önekle başlar (`YKS TYT Türkçe | <farklı ifade> | Ders N`). Kamp tanıtımı: `YKS TYT | Kamp Başlıyor: … | Bölüm 0`. Başlıklar her dersin `Curriculum/Jobs/<kamp>/NN-…-youtube.md` notundadır.

**Reels** (`CampShort`): senaryoda `short.rounds` varsa 30 saniyenin altında bir meydan okumadır. İlk karede soru vardır, 2–3 tuzaklı tur gelir, sonda tek çağrı olarak "Kaçta kaç? Yoruma yaz." söylenir. Kampın dersi altta sessiz bir satırla anılır, uygulama tanıtımı yoktur; ayrıntılar [CourseNarration.md §10](CourseNarration.md#10-reels-meydan-okuma-biçimi)'dadır. Turu olmayan senaryoda CourseShort'un kartları ve tanıtım kullanılır. Üst çubukta kamp rozeti ("Kamp 3/15") ve hikâye çubuğu durur. Müzik yok, yalnız anlatım.

**Render işleri**: `Curriculum/Jobs/<kamp>/<NN>-<konu>-youtube.json` ve `-reels.json`, yanında YouTube notu `-youtube.md`. Üçünü `npm run curriculum -- jobs make <spec.json>` yazar ([`CampJob.ts`](../src/Courses/CampJob.ts)). Spec yalnız senaryoda olmayanı taşır: dosya adı (`slug`, `stem`), A/B/C başlıkları, açıklama, maddeler, etiketler. İş, senaryonun kopyasını değil yolunu taşır (`"script": "Curriculum/Scripts/…json"`, 31 Ekim 2026): senaryo düzeltilince iş kendiliğinden günceldir, eşitleme gerekmez. Var olan not `--force` verilmedikçe korunur; yazıldıktan sonra sahibin düzenlemesidir. `npm run curriculum -- jobs check [kamp]` her kamp işini doğrular: kendi dersinin senaryosunu gösteriyor mu, ders videosu çıkışsız en az 600 saniye mi, işi eksik ders var mı.

Tasarım ölçüleri `COURSE_DESIGN.camp` içindedir (kart süresi, görev süresi, bölüm çubuğu kalınlığı). Yol haritası ve araştırma: [`StudioRoadmap.md`](StudioRoadmap.md).
