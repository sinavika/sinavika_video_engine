# Works TYT yazılı dersleri: üretim raporu (3 Kasım 2026)

## Sonuç

- TYT'nin **168 konusunun hepsi** Works için yazılı ve etkileşimli derse dönüştürüldü:
  - temel, her konunun hazır Works dosyası;
  - kaynak, EgitimVerileri (MEB anlatımı, ÖSYM çıkmış soruları, cevabı doğrulanmış havuz soruları);
  - araç, API'ye 2 Kasım'da eklenen 12 özellik.
- 168 dosyanın hepsi motor denetiminden ve API'nin **yeni** eşleyicisinden yerelde geçti (`WorkEngineScenarioDryRunTests` 3/3). Motor testleri 130/130.
- **Sunucuya hiçbir şey yüklenmedi.** İçerik ve resim yüklemesi senin onayını bekliyor.

## Nasıl yapıldı

1. **Ölçüm:** iki pilot konu Sonnet 5.5 ve Opus 5.5 ile yazdırıldı (2,03 $). Sonnet'in matematik içeriği tek tek çözüldü; 15/15 doğruydu. Bu yüzden bütün TYT Sonnet 5.5 ile yazıldı.
2. **Ana üretim:** 166 konu tek Batch'te yazıldı.
   - Sözel derslerde düşünme düzeyi orta, Matematik, Geometri, Fizik ve Kimya'da yüksekti.
   - Bozuk JSON gelen 32 dersin 29'u yerelde onarıldı, 3'ü yeniden yazıldı.
3. **Düzeltme:** motor denetimine takılan sorunlar yama turlarıyla giderildi. Model yalnız değişen alanları döndürdü; dersi baştan yazmaktan yaklaşık 7 kat ucuz.
   - Yama turları: 86 → 26 → 12 ders.
   - Yamayı iki kez bozan 3 ders Opus'la yamandı.
   - Son 8 sorunun 7'si denetimin yanlış alarmıydı; denetim inceltildi, 1'i (Afetler'de alt konu kodu) elle düzeltildi.

## Maliyet

| Kalem | Tutar |
|---|---|
| Ölçüm (2 konu, Opus + Sonnet) | 2,03 $ |
| Ana üretim (166 konu + 2 pilot düzeltmesi) | 47,93 $ |
| 3 yeniden yazım + 4 yama turu | 4,77 $ |
| **Toplam** | **54,73 $** (Sonnet 53,16 $, Opus 1,57 $) |

Ayrıntı `Outputs/Works/Written/kullanim.jsonl` dosyasında, ayrıca `EgitimVerileri/_Claude/usage.jsonl` dosyasına da işlendi.

## Derslerde neler var

Sütun adları: Tanım = concept, Kural = rule, Örnek = example, Soru = 5 şıklı soru, D/Y = doğru/yanlış adımı (önce doğru, sonra yanlış ifade sayısı), Boşluk = boşluk ve sayısal cevap, Rehberli = rehberli çözüm, Hata = hatayı bul, Eşle = eşleştirme, Grup = gruplara ayırma, Dokun = dokunarak seçme, Ayır = ek ayırma, Çoklu = çoklu seçim, Kart = çevrilen kart, Sıra = sıralama, Not = karşılanan Works notu, Düz. = düzeltme kaydı.

| Ders | Konu | Tanım | Kural | Örnek | Görsel | Soru | D/Y (D+Y) | Boşluk | Rehberli | Hata | Eşle | Grup | Dokun | Ayır | Çoklu | Kart | Sıra | Not | Düz. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Biyoloji | 10 | 55 | 58 | 17 | 101 | 127 | 40+46 | 29 | 3 | 7 | 36 | 36 | 4 | 0 | 11 | 4 | 10 | 71 | 42 |
| Coğrafya | 19 | 85 | 74 | 13 | 172 | 166 | 60+77 | 36 | 6 | 13 | 64 | 59 | 6 | 0 | 18 | 13 | 14 | 62 | 90 |
| Din Kültürü | 22 | 125 | 60 | 9 | 91 | 214 | 63+65 | 15 | 1 | 4 | 61 | 41 | 8 | 0 | 20 | 15 | 5 | 80 | 91 |
| Felsefe | 13 | 93 | 40 | 9 | 82 | 115 | 39+45 | 10 | 1 | 7 | 44 | 33 | 10 | 0 | 9 | 8 | 9 | 41 | 56 |
| Fizik | 11 | 84 | 63 | 36 | 105 | 165 | 41+51 | 47 | 15 | 14 | 31 | 32 | 3 | 0 | 16 | 9 | 8 | 58 | 54 |
| Geometri | 23 | 120 | 95 | 79 | 104 | 357 | 80+85 | 87 | 22 | 34 | 33 | 22 | 1 | 0 | 19 | 9 | 5 | 76 | 122 |
| Kimya | 10 | 70 | 53 | 19 | 85 | 131 | 40+42 | 25 | 12 | 12 | 30 | 34 | 4 | 0 | 12 | 7 | 8 | 55 | 59 |
| Matematik | 23 | 72 | 129 | 107 | 70 | 280 | 70+98 | 114 | 30 | 38 | 37 | 33 | 4 | 0 | 21 | 5 | 7 | 73 | 131 |
| Tarih | 22 | 110 | 150 | 1 | 127 | 198 | 65+83 | 36 | 0 | 10 | 70 | 42 | 5 | 0 | 18 | 9 | 31 | 76 | 117 |
| Türkçe | 15 | 100 | 95 | 36 | 85 | 138 | 48+77 | 16 | 9 | 14 | 38 | 61 | 30 | 8 | 16 | 12 | 11 | 55 | 71 |
| **Toplam** | **168** | 914 | 817 | 326 | 1.022 | 1.891 | 546+669 | 415 | 99 | 153 | 444 | 393 | 75 | 8 | 160 | 91 | 108 | **647** | **833** |

- **Seçeneğe özel açıklama** (`choiceFeedback`) soruların ve seçmeli adımların çoğunda var.
- **Eminlik işareti** içerik gerektirmez; uygulama her adımda gösterir.
- **Sesli formül** yok, **video sözü** yok, **cevabı ele veren ipucu** yok: üçü de motor denetiminde.

## İçerik düzeltmeleri

Model 833 düzeltme kaydetti; her dosyada `written.fixes` alanında duruyor. Rastgele 14'lük örneklem okundu.

**Gerçek hatalar:**
- **Tarih:** Navarin'de donanmayı yalnız Ruslar değil İngiltere, Fransa ve Rusya birlikte yaktı (MEB metni eksik).
- **Coğrafya:** eğim hesabında birim hatası.
- **Matematik:** olasılıkta 12'nin de 2 ve 3'ün ortak katı olduğu.
- **Türkçe:** kır, sağ ve yaz sesteş köktür, kökteş değil.

**Biçim düzeltmeleri:** cevap harfi dağılımı, sıralanmamış sayısal şıklar, "Cevabımız B" gibi video sözleri, doğru/yanlış adımlarının hep yanlış olması.

**Öneri:** Uygulamada her dersten bir konuyu açıp okuman iyi olur. Özellikle sözel derslerde modelin "düzeltme" diye değiştirdiği bilgiler kaynakla bir kez karşılaştırılmalı.

## Bekleyen işler (senin onayın)

1. **SVG (hazır resim):**
   - TYT'de 1.455 görselden 1.450'si çizilecek: 465'i yeniden, 985'i yeni.
   - "Sınavika Video Engine kurulumu" oturumuna plan isteği gönderildi. O oturum çizime başlamadan senden onay isteyecek, bitince manifest yolunu bana iletecek.
2. **Yükleme sırası** (her adım senin onayınla):
   1. API, web ve mobil: 12 özellik ve mig130 canlıya çıkar. Bu "api+web+mobile" oturumunun işi. **Yeni kart türlerini bugünkü canlı API tanımaz**, bu yüzden içerik ondan önce yüklenemez.
   2. Resimler: `stills/exists` sorgusu, ardından yalnız eksik olanların yüklenmesi.
   3. İçerik: `api/claude/works/imports`, önce `dryRun` ile denenir, sonra 168 konu yayınlanır.
3. **AYT ve KPSS:** senin onayın olmadan başlanmadı. Aynı hat (`Curriculum/WorksWritten/Tools/works_batch.py`) hazır. AYT'nin tahmini maliyeti TYT'ye yakın: 277 konu için yaklaşık 85–95 $.

## Dosyalar

- **Yazılı dersler:** `Curriculum/WorksWritten/YKS_TYT/<DERS>/<KONU>.json`
- **Works dosyaları:** `Curriculum/Works/YKS_TYT/**`
- **Hat:**
  - `Curriculum/WorksWritten/Tools/works_batch.py`: paket, gönder, topla, onar, denetle, yama, maliyet;
  - `Curriculum/WorksWritten/Tools/Yonerge.md`.
- **Motor:**
  - `src/Courses/WorksWritten.ts`: şema ve denetimler, 12 yeni kart dahil;
  - `scripts/Curriculum.ts`: `works --topic`, `--written`, `--dry`.
- **Notlar:**
  - diğer dersler için özellik önerileri: `docs/Courses/Works-Ozellik-Onerileri.md`;
  - API devir notu: `docs/Courses/Works-Aktarim-Notlari.md` §8.
