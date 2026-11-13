# Curriculum/Works: uygulamaya giden Works dersleri

Bu klasördeki her dosya, uygulamanın **Dersler (Works)** modülünde bir konunun dersidir. Sunucuya giden dosya budur. Works'ün tek kalıcı belgesi de bu dosyadır: kararlar, açık işler ve öneriler burada durur; eski raporların ayrıntısı git geçmişindedir.

- **Yol:** `Curriculum/Works/<KATEGORİ>/<DERS>/<KONU>.json`, örneğin `YKS_TYT/MAT/MAT_BASAMAK.json`.
- **Elle düzenlenmez.** Dosyalar `npm run curriculum -- works <KATEGORİ> --topic <KAT/DERS/KONU,...>` ile yazılır.
  - Konunun yazılı dersi varsa (`Curriculum/WorksWritten`), komut onu denetler ve buraya yazar.
  - Yoksa dosya videonun senaryosundan (`Curriculum/Scripts`) kurulur.
- **`--topic` kullan.** Bütün kategoriyi bir kerede yazmak, dokunulmayan konulara görsel şemasının sonradan eklenen varsayılan alanlarını da yazar. Bu, görsel özetini (`rawHash`) değiştirir ve gereksiz yeniden çizim doğurur.
- **Sorumluluk:** Works içerikleri, revizyonları ve canlı yüklemeleri "Works iyileştirilmesi" oturumunun işidir. API oturumu Works aktarmaz.

## Kategorilerin durumu (14 Kasım 2026)

| Kategori | Konu | İçerik | Canlıda |
|---|---|---|---|
| YKS_TYT | 168 | **Yazılı ders.** Etkileşimli; tanım, formülden önce anlam, çözümlü örnekler var | Evet |
| KPSS_LISANS | 97 | **Yazılı ders**, aynı kurallarla | Evet |
| YKS_AYT | 276 | Videodan kurulan hâl. Yazılı ders henüz yazılmadı | Evet |
| KPSS_ONLISANS | 81 | Videodan kurulan hâl. Yazılı ders henüz yazılmadı | Evet |
| KPSS_ORTAOGRETIM | 81 | Videodan kurulan hâl. Önlisans'ın ikizi | Evet |

- Klasörde 703 dosya var. 9 Kasım'daki kuru denemede canlıdaki 703 konunun hepsi bu dosyalarla aynıydı.
- Bir dosyanın yazılı ders olduğu, içindeki `written` alanından anlaşılır. Yazılı dersin kuralları ve üretim hattı: `Curriculum/WorksWritten/README.md`.

## Canlıya nasıl gider

1. **Görseller:** `npm run figures -- --works <KATEGORİ veya dosya>`.
   - Çizimler `Outputs/Works/Figures` klasörüne, listesi `Outputs/Works/Figures/manifest.json` dosyasına yazılır.
   - Yeri kayan ama verisi aynı görsel yeniden çizilmez, eski resmine bağlanır.
2. **Kuru deneme:** `python sinavika/scripts/works_claude_import.py --cats <KATEGORİ> --manifest --api-dry-run`. Bu adım hiçbir şey yazmaz; sunucu hangi bölümlerin değişeceğini ve kalkacağını söyler.
3. **Aktarım:** aynı komut `--api-dry-run` olmadan çalıştırılır. Eksik resimler yüklenir (resim adı içeriğin sha256'sıdır), konular aktarılır ve yayınlanır.

Her canlı yazma için sahibin onayı gerekir.

## Dosya biçimi ve API ile anlaşma

- **Biçim:** API'nin `WorkScriptDto` biçimi. Alanlar: `topic`, `title`, `lesson.hook`, `lesson.objectives`, `lesson.sections` (subtopic, subtopics, title, cards), `lesson.summary`, `camp.task`. Eşlemeyi API'de `WorkScriptMapper` yapar.
- **Yalnız motorun alanları:** `sourceScripts` (dosyanın kurulduğu video senaryoları) ve `written` (yazılı dersin kaynakları, karşılanan notlar, düzeltmeler). API bunları yok sayar.
- **Bölüm anahtarı alt konu kodudur** ve değişmez. Adım anahtarı kart sırası ile türünden oluşur (`03-predict`). Kart sırası değişen mikro derste öğrencinin kaldığı yer baştan başlar.
- **Kart eşlemesi:**
  - `rule` ve `visual` kartındaki `narration`, öğrencinin okuduğu açıklamadır.
  - Doğru cevabı "Doğru" olan ifade `predict` kartıyla yazılır; `mistake` kartı her zaman yanlış ifadedir.
  - Soru adımları ipucudur: cevabın harfini söylemez, son adım sonucu vermez.
  - 2 Kasım'da eklenen kartlar: `blank`, `findError`, `match`, `classify`, `tap`, `split`, `multi`, `flip`, `guided` ve seçeneğe özel `choiceFeedback`.
- **Yarım konu gitmez:** alt konularının hepsi anlatılmamış konunun dosyası yazılmaz.

## Kapsam kararları

- **İkiz dersler (30 Ekim):** AYT Tarih-2 ve Coğrafya-2 tek ders sayılır. Video ve senaryo yalnız `TAR1` ve `COG1` için yapılır. `Curriculum/Works/YKS_AYT/TAR2` ve `COG2` dosyalarının içeriği bu senaryolardan gelir, kodları kendi konularındandır.
- **`outOfScope`:** Ders listesinde başka ünitenin alt konuları bir konunun altına kopyalanmışsa (Coğrafya'nın çevre alt konuları gibi), o alt konular orada anlatılmaz. Senaryonun `outOfScope` alanı bunu gerekçesiyle kaydeder ve bu kodlar kapsanmış sayılır.
- **KPSS'de tek video seti üç seviyeye (31 Ekim):**
  - Senaryolar `Curriculum/Scripts/KPSS` altında; plan `Curriculum/Production/KPSS-Kapsam-Analizi.md`.
  - Aynı alt konu kodu seviyeden seviyeye farklı alt konuyu gösterir. Başka seviyenin alt konusunu da anlatan bölüm bunu `alsoTeaches` alanına yazar (`KPSS_ONLISANS:SES_BILGISI_03`).
  - Ortaöğretim, Önlisans'ın ikizidir.
  - Motor her seviyenin konusunu bu bölümlerden toplar ve kendi kodlarıyla ayrı dosya yazar. `Curriculum/Scripts/KPSS` doğrudan aktarılmaz.

## Açık işler

- **Öğretim sırası artıkları** (TYT ve KPSS Lisans; 9 Kasım ölçümü): 17 bölüm tanımla açılmıyor, 1 bölümde formül anlamından önce geliyor, 124 sözel bölümde ilk sorudan önce çözümlü örnek yok. Bir sonraki yama turunda düzeltilecek.
- **Sırada yazılacaklar:** KPSS Önlisans (Ortaöğretim aynası; tahmini 15–25 $) ya da AYT (276 konu; tahmini 85–95 $). Her ikisi de sahibin model ve tutar adlı onayını bekliyor. Anthropic hesabının harcama sınırı 5 Kasım'da doldu; Console'da yükseltilmeden ücretli üretim yapılamaz.
- **İçerik okuması:** Model TYT yazımında 833 düzeltme kaydetti (`written.fixes`). 14'lük örneklemde 4 gerçek hata vardı: Navarin, eğim birimi, olasılıkta ortak kat ve sesteş kök. Sözel derslerde modelin "düzeltme" diye değiştirdiği bilgiler kaynakla bir kez karşılaştırılmalı.

## Yeni adım önerileri (karar sahibin; 2-3 Kasım)

TYT yazılırken ve AYT ile KPSS'ye bakılırken eksikliği hissedilen etkileşimler. API, web ve mobil işi "api+web+mobile" oturumundadır.

| Öneri | Öğrenci ne yapar | En çok yarayacağı dersler |
|---|---|---|
| **Çoklu boşluk** | Bir cümlede ya da formülde birden çok boşluğu tek adımda doldurur | Kimya (denklem denkleştirme), Matematik, Türkçe (yazım, ek) |
| **Tablo doldurma** | Tablonun bazı hücrelerini yazar ya da seçer | Matematik (değer tablosu), Kimya, Coğrafya, Fizik (birimler) |
| **Şekilde etiketleme** | Görselde bir parçaya ya da bölgeye dokunur, ya da parçalara ad yerleştirir. Motor görselleri adlı parçalardan oluşur | Biyoloji, Coğrafya ve Tarih (harita), Geometri |
| **Sayısal cevapta birim** | Değeri yazar, birimi seçer | Fizik, Kimya |
| **Zaman çizelgesine yerleştirme** | Olayları çizelgede doğru yere koyar; sıralama adımı aradaki mesafeyi öğretmez | Tarih, Felsefe, Edebiyat |

İkinci sırada: hatalı sözcüğü düzeltme (Türkçe), grafik üzerinde işaretleme (Fizik, Matematik), kaydırıcıyla tahmin (`plot.parameters` uygun) ve akıl yürütme zinciri (Felsefe, Mantık).
