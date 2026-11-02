# AYT quiz revizyonu raporu

YKS AYT quiz sorularının (`UsageKind = 2`) yerinde revizyonu. TYT aynı yöntemle bitti ve canlıda; bkz. `TYT_Figur_Raporu.md`.

## Kısaca

- **Kapsam:** 15 ders, 276 konu, 16.862 soru. YDT yok.
- **Durum (2 Kasım 2026):** 22 konu (1.345 soru) bitti ve denetlendi. Türk Dili ve Edebiyatı'nın tamamı canlıya hazır; yeni ajan açılması sahibin isteğiyle durduruldu.
- **Canlı:** AYT'den canlıya hiçbir şey yazılmadı. Her ders, LocalDB denemesinden sonra sahibin onayıyla yazılır.
- **Engel kalktı:** API'nin soru figüründe motor görselini (58) kabul etmesi (A1.1) 2 Kasım'da canlıya çıktı. 58'li sorular, hazır resimleri önce yüklenerek ders SQL'iyle birlikte yazılır.

## 1. Yöntem

- **İş birimi:** konu (≈ 60 soru), bir ajan.
  - Ajan yönergesi: `Outputs/QuestionRevision/Work/AYT/YONERGE.md`.
  - Kuyruk: `Outputs/QuestionRevision/Work/AYT/kuyruk.json` (`bekliyor` / `calisiyor` / `bitti`).
  - Aynı anda 10–12 ajan çalışır.
- **Ajan:** konunun sorularını çözer, sorunu yazar ve bütün soruları üreticiyle (`Work/AYT/<DERS>/<KONU>.py`) yeniden yazar. Ardından:
  - `check_revisions --konu` ile denetler;
  - figür varsa ön izlemeyi gözle kontrol eder.
- **Ana oturum:** her konuyu yeniden denetler ve rastgele soruları kendisi çözer. Ders bitince şu adımlar ders düzeyinde yapılır:
  1. Denetim.
  2. Çizim (`render_figures --force`).
  3. SQL.
  4. LocalDB denemesi.
  5. Ders raporu.
- **Sıra:**
  1. Sözel dersler: TDE, TAR1, COG1, TAR2, COG2, FEL, PSI, SOS, MAN, DIN.
  2. MAT ve GEO.
  3. FIZ, KIM, BIO.

## 2. Pilotlar

| Konu | Soru | Figürlü | Görseller | Öne çıkan hatalar | Not |
|---|---:|---:|---|---|---|
| MAT_LIMIT | 60 | 9 | plot 8, table 2 | 4 yanlış anahtar, 6 birden çok doğru, 19 tekrar eden kurgu | İki oturumun ajanı aynı konuya yazdı; son sürüm okundu, örnek çözümler doğru. |
| TAR1 TAR_ILK_INSAN | 60 | 5 | timeline 2, map 2, table 1 | 3 yanlış anahtar, 11 kökte olmayan öğe, 10 cevabı ele veren kök, 23 tekrar | — |
| FIZ_TORK | 60 | 42 (+2 bekliyor) | lever 30, vectors 11, forces 4 | 11 yanlış anahtar, 7 fiziksel çelişki, 9 çözülemeyen | `lever` 58 türü; A1.1 bekleniyor. |

- **Süre ve maliyet:** konu başına yaklaşık 40–90 dakika ve 0,4–0,45 milyon jeton. Figürü yoğun konular uzun sürüyor.

## 3. İstekler

### API (sinavika)

**A1.1 Soru figüründe motor görseli (58)**

- *Durum (2 Kasım):* (1), (2) ve (3) canlıda (yeni kapsayıcı 07:58Z, 3.781 test geçti). 58'li sorular hazır resimleriyle aynı işlemde canlıya yazılabilir.
  - Ek kural (sahibin kararı): hazır resmi eksik 58'e dayanan sorusu olan kitapçık denemeye atanamaz (`figure_still_missing`). Böyle bir deneme elle yayına alınamaz.
  - Testler engellenmez; o soru atlanır.
  - FigureCheck yeni kodla derlendi; denetim 58'i artık hata saymıyor.
  - Panel, 58'in verisini değiştirmediği sürece hazır resmi korur. Verisi değişen figürün resmi düşer; yeni resim yüklenince de eski still düşer.
- *Adımlar:*
  1. `TryValidateForPersist` 58'i kabul etsin.
  2. Hazır resmi eksik 58'e dayanan soru, quiz, deneme ve kitapçık yollarında atlansın.
  3. Panelde düzenlemede hazır resim korunsun (KeepStills; kodda yok, yeniden yazılacak).
- *Kural:* (2) ve (3) canlıya çıkmadan 58'li AYT sorusu canlıya yazılmaz. Bu sorular yerelde hazır bekler, ders SQL'inde ayrı bir betiğe ayrılır.

### Video motoru (sinavika_video_engine)

| # | İstenen | Durum | Bekleyen |
|---|---|---|---|
| M3.1 | `lever`: tork ve karar kapalıyken oklar tork yönüne göre renkleniyor; cevabı ele veriyordu (hata) | Yapıldı (2 Kasım, `forceTone`) | FIZ_TORK yeniden çizilecek |
| M3.2 | `lever`: desteksiz çubuk, ipe asılı çubuk, iki destek (N_K, N_L) | Yapıldı (2 Kasım) | FIZ `F8C8B41B` |
| M3.3 | `lever`: açılı kuvvet ya da eğik ip, açı yayı | Yapıldı (2 Kasım) | FIZ `9EF9CC5A` |
| M3.4 | `lever`: G'nin yeri seçilebilsin (türdeş olmayan çubuk) | Yapıldı (2 Kasım) | G ayrı kuvvet olarak çiziliyor |
| M3.5 | `vectors`: adlı nokta işareti (O) | Yapıldı (2 Kasım) | Konum vektörünün başlangıcıyla gösteriliyor |
| M3.6 | `forces`: kısa oklar cismin içinde kalıyor | Yapıldı (2 Kasım) | `size` ile uzatılıyor |
| M3.7 | `forces`: kuvvetler arası açı etiketi | Yapıldı (2 Kasım) | Açı kökte veriliyor |
| M3.8 | `plot`: tek içi boş nokta (`points[].open`) | Yapıldı (2 Kasım) | Eğri bölünüp uçlar `open` yapılıyor |
| M3.9 | `plot`: parçalı fonksiyonun parçaları aynı renkte | Yapıldı (2 Kasım) | — |
| M3.10 | `plot`: x ekseni ~7 birimden sonra işaret atlıyor | Yapıldı (2 Kasım) | `equalScale` ile geçiştiriliyor |
| M3.11 | `map`: koyu temada kara ile deniz karşıtlığı zayıf | Yapıldı (2 Kasım) | — |

- **M2.20 (TYT raporu) yapıldı:** motor 2 Kasım'da resimlerde 28 pikselin altında yazı bırakmıyor.
  - TYT'nin canlıdaki 1.148 hazır resmi eski boyutla çizilmişti. Yeniden çizilirse yeni dosya adları çıkar; yükleme ve still URL'lerini güncelleyen SQL gerekir.
  - Bu, sahibin onayıyla yapılacak ayrı bir iş.

## 3b. Canlıya hazır dersler

| Ders | Soru | Figür | Hazır resim | Yerel deneme | Canlı |
|---|---:|---:|---|---|---|
| TDE | 985 (16 konu) | 18 (tablo 13, zaman çizelgesi 5) | 36 dosya, 1,8 MB | Geçti: değişmiş kökle durdu, güncelleme = beklenen, geri alma = ilk hâl | Sahibin onayını bekliyor |

- **TDE:** cevap anahtarı yanlış 82 soru, birden çok doğru 90 soru. Ayrıntı `Outputs/QuestionRevision/Results/YKS/YKS_AYT/TDE/DersRaporu.md`.
- **Dışa aktarım:** canlı verinin dışa aktarımı 30 Ekim tarihli. Betik, o tarihten sonra değişmiş bir kökte kendini durdurur.

## 4. Açık küçük düzeltmeler

- **FIZ_TORK `F8C8B41B` ve `9EF9CC5A`:** motorun yeni `lever` seçenekleriyle (`support: 'two'`, açılı `rope`) kurulacak.
- **TAR1 TAR_1900_OSM `32E96BE2`:** Balkan haritasında Midye–Enez çizgisi Karadeniz kıyısına değmeden bitiyor. Çizgi iki kıyıya uzatılacak; cevap etkilenmiyor.

## Revizyon geçmişi

| Rev. | Tarih | Değişiklik |
|---|---|---|
| 1 | 2 Kasım 2026 | Rapor açıldı: yöntem, pilotlar, A1.1 durumu ve motor istekleri M3.1–M3.11; M3.1 yapıldı. |
| 2 | 2 Kasım 2026 | A1.1 ve A3 canlıya çıktı; 58'li sorular hazır resimleriyle yazılabilir. M3.2–M3.11 motora eklendi; FIZ `F8C8B41B` ve `9EF9CC5A` yeni seçeneklerle kurulmayı bekliyor. |
