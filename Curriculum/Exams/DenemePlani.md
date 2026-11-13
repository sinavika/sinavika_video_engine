# Deneme kitapçıkları: plan ve kurallar

Sınavika'nın aylık sabit denemeleri için soru kitapçıkları hazırlanır. Bu belge her ay için geçerli yapıyı, dağılımı, akışı ve kuralları tutar. Ayın kitapçık listesi ve konu adetleri o ayın `plan.md` dosyasındadır; bu dosyayı `exam_plan.py` üretir (Kasım: [2026-11/plan.md](2026-11/plan.md)). Ajanların yazım yönergesi [YONERGE.md](YONERGE.md).

## 1. Yapı

- **Denemeler sabittir.** Her sınavın şablonu (`ExamTemplate`) ayda kaç genel ve kaç bölüm denemesi olduğunu söyler; erişim o ayla sınırlıdır.
  - YKS, KPSS Lisans, Önlisans ve Ortaöğretim şablonlarında ayda 1 genel deneme ve her bölüm için 1 bölüm denemesi vardır.
  - YDT yoktur.
- **Bir ay 19 kitapçıktır, 1.280 soru kaydıdır:**
  - YKS 10 kitapçık, 560 soru: TYT genel ve 4 TYT bölümü; AYT genel ve 4 AYT bölümü.
  - KPSS her düzeyde 3 kitapçık, 240 soru: genel (GY 60 + GK 60), GY ve GK.
- **Deneme nasıl açılır:** admin, hazır kitapçığı panelde ayın slotuna atar. Atanınca kitapçık "Sınav aşamasında" (4) olur; ay başladıysa deneme yayına girer.
- **Atanabilir kitapçık:**
  - sistem kaynaklı ve "Tamamlandı" durumunda;
  - aynı sınava ait ve başka denemede kullanılmamış;
  - bölümleri slotla birebir;
  - her bölümde soru sayısı kadar dolu ve cevaplı slot;
  - resmi eksik motor görseli içermez.
- **Yayınevi her zaman Sınavika'dır** (sahip kararı, 2 Kasım 2026). Yalnız Sınavika'ya izin veren abonelik paketindeki öğrenci, yayınevi boş bir denemeye giremez. API, Claude'un oluşturduğu her kitapçığa Sınavika yazar.
- **KPSS Ortaöğretim, Önlisans'ın aynasıdır** (sahip kararı, 2 Kasım 2026): "herkesin kendi sorusu ama soru aynı olsun."
  - Ortaöğretim planı Önlisans'ınkinin slot slot kopyasıdır.
  - Sorular `exam_mirror.py` ile kopyalanır; her kayıt kendi slotunu, soru kimliğini, kodunu ve Ortaöğretim kataloğunun konu kimliklerini alır.
  - Ortaöğretim için ayrıca yazılmaz.
  - Denetim bir soruyu aynasıyla benzer saymaz.

## 2. Dağılım

- **Ders soru sayıları** canlıdaki `CategorySectionLessons` kaydından gelir (ör. TYT Sosyal'de dört ders 5'er; KPSS GK'de Tarih 27, Coğrafya 18, Vatandaşlık 15).
- **Konu adetleri ÖSYM çıkmışlarıyla orantılıdır.**
  - Kaynak: `EgitimVerileri/<sınav>/CikmisSorular/<ders>.jsonl`.
  - Bir dersin aydaki bütün kopyaları (genel + bölüm) birlikte en büyük kalan yöntemiyle paylaştırılır, sonra kopyalara dengeli dağıtılır.
  - ÖSYM'nin sormadığı konu gelmez.
  - AYT Tarih-2 ve Coğrafya-2, Tarih-1 ve Coğrafya-1'in ÖSYM verisiyle dağıtılır.
- **Mikro konu** ÖSYM sıklığıyla önerilir; yazar konu içinde değiştirebilir.
- **Zorluk:** her ders bloğunda yaklaşık %30 kolay, %45 orta, %25 zor.
- **Cevap anahtarı:** bölüm içinde A–E dengeli; aynı harf üst üste üç kez gelmez.
- **Sıra:** bölüm dersleri canlıdaki sırayla; ders içinde konular katalog sırasıyla. Türkçe'de sıra anlam → dil bilgisi → paragraf → sözel mantık.

## 3. Akış

Deneme araçları `Tools/` içindedir; ortak araçlar ve bütün yollar (`engine_paths.py`) `Curriculum/Tools` içindedir.

1. `exam_catalog.py`: canlıdan salt okunur katalog çeker (şablonlar, bölümler, konu ağacı, mevcut kodlar).
2. `exam_plan.py <ay>`: kitapçıkları ve slotları planlar; `<ay>/plan.json` ve `plan.md` yazar. Kimlikler sabit ad alanlı UUID'dir; soru kodu ders öneki + 6 rakamdır, kitapçık kodu 8 karakterdir.
3. **Yazım:** kitapçık × ders birimleri ajanlara verilir. Akış: `exam_show.py` → `exam_sources.py` → üretici (`exam_generator.py`) → `check_exams.py --ders` → `exam_preview.py`. Ayrıntı: [YONERGE.md](YONERGE.md).
4. **Ana oturum:**
   - `exam_mirror.py <ay>` (Önlisans bittikten sonra);
   - `check_exams.py <ay>`: plan uyumu, metin ve işaretleme, API'nin figür denetimi (FigureCheck), ay içinde ve kaynakla benzerlik;
   - `render_figures.py Exams/<ay>/<kitapçık>`;
   - yeniden `check_exams.py`.
5. **İsteğe bağlı yerel prova:** `build_exam_sql.py` ve `dry_run_exam_sql.py`, LocalDB'de canlı şemanın kopyasıyla dener. Canlıya SQL ile yazılmaz.
6. **Canlı, sahibin onayıyla, yalnız API ile:**
   - `upload_stills.py Exams/<ay> --yukle`, sonra `--var-mi`;
   - `exam_api.py <ay> --kuru`: `dryRun`; yanıtta yayınevi Sınavika olmalı, resim bekleyen soru olmamalı;
   - `exam_api.py <ay> --canli`: istek başına bir kitapçık (`POST api/claude/booklets`). Göndermeden önce kod canlıda aranır; sonunda `GET api/claude/booklets/{id}` ile geri okunur ve canlı kimlikler `Results/<ay>/api/yazilanlar.json`'a yazılır;
   - geri alma: `exam_api.py <ay> --geri-al` (atanmış kitapçığı API silmez);
   - kitapçıkları sahip panelde ayın slotlarına atar.
7. **Canlıdaki bir soruyu düzeltmek:** `api/claude/questions/revisions`. Önce dışa aktarılır, sonra `dryRun`, sonra yazılır ve geri okunur. Doğru şıkkın harfi, soru ve şık kimlikleri değişmez.

## 4. Kurallar ve dersler

- **Figürden taviz yok.**
  - Kök bir tabloya, haritaya ya da şekle dayanıyorsa figür vardır; soru sözele çevrilmez.
  - Motor görseli (tür 58) soruda kabul edilir, ama hazır resmi yüklenmeden kitapçık atanamaz.
  - Taralı bölge motorda dolgulu çizilir.
  - `table` hücresi en çok 40, başlığı en çok 30 karakterdir.
- **Güncel bilgiler** (KPSS Vatandaşlık, kitapçık başına 4–5 soru): yalnız kalıcı ve kesin olgular yazılır, 2025 ortasına kadar. Gerekçede olgunun yılı yazılır.
- **Büyük istek bölünür.** 560 soruluk tek istek ağ geçidinin yaklaşık 240 saniyelik sınırına takıldı (504) ve hiçbir şey yazmadı. Bir kitapçığın yazımı 18–133 saniye sürer.
- **Ölü kopya bırakılmaz** (sahip, 14 Kasım 2026).
  - Bir şey yeniden üretilince eskisi silinir.
  - Silme Geri Dönüşüm Kutusu'na yapılır; önce dosyayı kodun, manifestin ya da işlerin okumadığı denetlenir.
  - Ön izlemeler, `_ders` ara denetimleri ve kuru çalıştırma yanıtları iş bitince silinir.
  - Silinenlerin listesi `Outputs/Checks` altına yazılır.

## 5. Aylar

- **Kasım 2026: canlıda.**
  - 2 Kasım'da API ile yazıldı: 19 kitapçık; 1.280 soru (1.040 yazılan + 240 Ortaöğretim aynası); 240 resimli figür.
  - 9 Kasım'da panelde atandı; 19 kitapçık "Sınav aşamasında".
- **Eski üretimden kalan sorular (13 Kasım):**
  - Destek talebi 49CDD64E üzerine, Ağustos üretiminden kalan ve görsele atıf yapıp figürü olmayan 25 deneme sorusu figürle yeniden yazıldı.
  - API revizyonuyla canlıya yazıldı ve doğrulandı.
  - İş dosyası: `Outputs/Exams/Work/Repairs/2026-11-13/onarim.py`.
- **Aralık 2026: yapılacak.**
  1. `exam_catalog.py` ile katalogu tazele.
  2. `exam_plan.py 2026-12` çalıştır.
  3. Kasım'la aynı akışı izle.
  - Sorular Kasım'dakilerden farklı olmalıdır. `check_exams` yalnız ay içi benzerliği denetler; önceki aylarla karşılaştırma için Kasım dosyaları da benzerlik havuzuna eklenmelidir.

## Revizyon geçmişi

| Rev | Tarih | Değişiklik |
|---|---|---|
| 1–4 | 2 Kas 2026 | İlk sürüm; Ortaöğretim aynası; Kasım yazıldı, denendi ve API ile canlıya alındı. |
| 5 | 14 Kas 2026 | Kalıcı belgeye indirildi: günlük durum satırları ve kapanmış açık konular çıkarıldı (ayrıntı git geçmişinde). Yayınevi, 504, tablo sınırları, onarım ve ölü kopya kuralı eklendi. Aralık için yapılacaklar yazıldı. |
