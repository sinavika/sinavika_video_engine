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
| `plot` | Matematik, fizik, coğrafya | Fonksiyon grafikleri sırayla çizilir; ölçüm verisi sütun ya da çizgi; işaretli noktalar | d3-scale, d3-shape |
| `geometry` | Geometri | Nokta, kenar uzunluğu, çember, açı (dik açı işareti), dolgulu çokgen | SVG (kendi) |
| `forces` | Fizik | Serbest cisim diyagramı; düz ya da eğik zemin | SVG (kendi) |
| `motion` | Fizik | x(t), y(t) ile hareket simülasyonu: iz ve hız oku | SVG (kendi) + güvenli ifade çözücü |
| `molecule` | Kimya | SMILES'tan molekül çizimi | SmilesDrawer |
| `atom` | Kimya, fizik | Bohr modeli: çekirdek, katmanlar, elektronlar | SVG (kendi) |
| `flow`, `cycle` | Her ders, biyoloji, coğrafya | Süreç adımları, döngüler | Mevcut diyagramlar |
| `timeline` | Tarih, edebiyat, vatandaşlık | Zaman ölçekli olay çizelgesi (MÖ yılları) | SVG (kendi) |
| `map` | Coğrafya, tarih | Harita: vurgulu alanlar, etiketler, işaretler, rotalar (sefer, göç) | d3-geo, topojson-client, world-atlas (Natural Earth) |
| `sentence` | Türkçe, yabancı dil | Cümle ögeleri / dil bilgisi rolü, vurgu, çeviri | — |
| `comparison` | Her ders | İki-üç sütunlu karşılaştırma | — |
| `table` | Her ders, mantık | Tablo, doğruluk tablosu (vurgulu sütun) | — |
| `venn` | Matematik, mantık | İki-üç küme | SVG (kendi) |
| `conceptMap` | Felsefe, sosyoloji, din | Kavram haritası | Mevcut |
| `picture` | Tarih, biyoloji, edebiyat | Lisansı kayıtlı görsel ve kaynak satırı | — |

Görsel galerisi: `samples/Courses/VisualGallery.json` (`npm run stills -- --job samples/Courses/VisualGallery.json`).

**Haritalar.** Dünya haritası pakete dahildir (world-atlas, Natural Earth, kamu malı). Türkiye'nin illeri için `npm run geo -- turkey` Natural Earth il sınırlarını indirir (~40 MB bir kez; yalnız Türkiye saklanır) ve `public/Geo/TurkeyProvinces.json` yazar; harita görseli onu `{"kind": "file", "src": "Geo/TurkeyProvinces.json"}` ile kullanır. Henüz çalıştırılmadı. Coğrafi bölgeler (7 bölge) ve tarihî sınırlar için ayrı veri gerekir; tarihî sınır verilerinin çoğunun lisansı kontrol edilmeden kullanılmamalıdır.

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
3. Coğrafya için Türkiye il haritasını indirmek (`npm run geo -- turkey`) ve bölge tablosunu eklemek.
4. Tarih ve biyoloji için kullanılacak görselleri seçip lisanslarıyla kütüphaneye almak.
5. Konu anlatımı paketi olmayan konular (ör. TYT'de 68 konu) için anlatımın hangi kaynaktan doğrulanacağına karar vermek.
