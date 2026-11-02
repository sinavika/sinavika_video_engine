# Deneme kitapçıkları: plan ve durum

Sınavika'nın aylık sabit denemeleri için soru kitapçıkları hazırlanır. Bu belge planı, akışı ve durumu tutar; ay ay güncellenir.

## 1. Ne değişti (2 Kasım 2026)

- **Denemeler artık sabit.** Her sınavın şablonu (`ExamTemplate`) ayda kaç genel ve kaç bölüm denemesi olduğunu söyler. Erişim o ayla sınırlıdır.
- **Eski denemeler silindi.** Sistem ve AdminTest denemeleri, kitapçıkları ve soruları temizlendi (sinavika `docs/sql/15–16`). SinoAI'nin kişisel branş denemeleri (73 kitapçık) kaldı; bu işe girmez.
- **Deneme nasıl açılır:** admin, hazır bir kitapçığı şablon slotuna atar (`POST /api/AdminExamCalendar/assignments`).
- **Atanabilir kitapçık:**
  - sistem kaynaklı ve "Tamamlandı" durumunda;
  - aynı sınava ait ve başka denemede kullanılmamış;
  - bölümleri slotla birebir: genel deneme oturumun bütün bölümleri, bölüm denemesi yalnız o bölüm;
  - her bölümde soru sayısı kadar slot; boş slot ve cevapsız soru yok.

## 2. Kasım 2026

Şablonların hepsi ayda 1 genel + her bölüm için 1 bölüm denemesi. YDT yok.

| Sınav | Kitapçıklar | Soru |
|---|---|---|
| YKS | TYT genel (Türkçe 40, Sosyal 20, Temel Matematik 40, Fen 20) + 4 TYT bölüm; AYT genel (4 × 40) + 4 AYT bölüm | 560 |
| KPSS Lisans | genel (GY 60 + GK 60) + GY + GK | 240 |
| KPSS Önlisans | aynı yapı | 240 |
| KPSS Ortaöğretim | aynı yapı; sorular Önlisans'ınkiyle aynı (ayna) | 240 kayıt |

Toplam: 19 kitapçık, 1.280 soru kaydı; 1.040'ı ayrı yazılan soru. Ayrıntı ve konu adetleri: [2026-11/plan.md](2026-11/plan.md).

**Ortaöğretim = Önlisans (sahip kararı, 2 Kasım 2026):** "kpss önlisans ile ortaöğretim soruları bir olsun … herkesin kendi sorusu ama soru aynı olsun."
- İki sınavın konu ağacı ve bölümleri birebir aynı.
- Ortaöğretim kitapçıklarının planı Önlisans'ınkinin slot slot kopyasıdır: konu, mikro, zorluk ve doğru harf aynı.
- Sorular `exam_mirror.py` ile kopyalanır. Her kayıt kendi kitapçığının slotunu, soru kimliğini ve kodunu, Ortaöğretim kataloğunun konu kimliklerini alır.
- Denetim bir soruyu aynasıyla benzer saymaz.

## 3. Dağılım

- **Ders soru sayıları** canlıdaki `CategorySectionLessons` kaydından gelir. Örnek: TYT Sosyal'de Tarih, Coğrafya, Felsefe ve Din 5'er; KPSS GK'de Tarih 27, Coğrafya 18, Vatandaşlık 15.
- **Konu adetleri ÖSYM çıkmışlarıyla orantılıdır.**
  - Kaynak: `EgitimVerileri/<sınav>/CikmisSorular/<ders>.jsonl`.
  - Bir dersin aydaki bütün kopyaları (genel + bölüm) birlikte en büyük kalan yöntemiyle paylaştırılır, sonra kopyalara dengeli dağıtılır.
  - ÖSYM'nin sormadığı konu gelmez.
  - AYT Tarih-2 ve Coğrafya-2, ÖSYM verisinde Tarih-1 ve Coğrafya-1 ile birlikte tutulur; aynı konu kodlarıyla dağıtılır.
- **Mikro konu** ÖSYM sıklığıyla önerilir; yazar konu içinde değiştirebilir.
- **Zorluk:** her ders bloğunda yaklaşık %30 kolay, %45 orta, %25 zor.
- **Cevap anahtarı:** bölüm içinde A–E dengeli; aynı harf üst üste üç kez gelmez. Slotun `PreferredCorrectOptionKey` alanına yazılır.
- **Sıra:** bölüm dersleri canlıdaki sırayla; ders içinde konular katalog sırasıyla. Türkçe'de sıra anlam → dil bilgisi → paragraf → sözel mantık.

## 4. Akış

Araçlar `Tools/` içinde; ajanların yönergesi [YONERGE.md](YONERGE.md).

1. `exam_catalog.py`: canlıdan salt okunur katalog çeker (şablonlar, bölümler, konu ağacı, mevcut kodlar).
2. `exam_plan.py <ay>`: kitapçıkları ve slotları planlar → `<ay>/plan.json`, `plan.md`.
   - Kimlikler sabit ad alanlı UUID'dir.
   - Soru kodu ders öneki + 6 rakamdır (API'nin deneme kodu biçimi); kitapçık kodu 8 karakterdir. İkisi de canlıdakilerle çakışmaz.
3. **Yazım:** kitapçık × ders birimleri ajanlara verilir. Her birimde `exam_show.py` → `exam_sources.py` (ÖSYM ve deneme kitapları) → üretici (`exam_generator.py`) → `check_exams.py --ders` → `exam_preview.py`.
4. **Ana oturum:**
   - `check_exams.py <ay>`: plan uyumu, quiz denetimleri, API'nin figür denetimi, ay içinde ve kaynakla benzerlik;
   - `render_figures.py Exams/<ay>/<kitapçık>`;
   - yeniden `check_exams.py`.
5. `build_exam_sql.py <ay>`: tek transaction, ön koşullar, satır sayısı denetimleri ve son doğrulama.
   - `ekle.sql`, `geri_al.sql`, `yuklenecek-resimler.json`.
   - Kitapçıklar "Tamamlandı" yazılır.
6. `dry_run_exam_sql.py <ay>`: LocalDB'de canlı şemanın kopyasıyla denenir.
   - ekle → beklenenle birebir → API atama kuralları → ikinci ekleme durur → pasif mikroyla durur → atanmışken geri alma durur → geri al → boş hâl.
7. **Onaydan sonra:**
   - `upload_stills.py Exams/<ay> --yukle` ile hazır resimler yüklenir;
   - `ekle.sql` canlıda çalışır (`apply_exam_sql.py <ay> --canli`);
   - kitapçıklar admin panelinden Kasım slotlarına atanır.

## 5. Durum

| Tarih | Durum |
|---|---|
| 2 Kas 2026 | Yapı incelendi. Katalog, plan ve araçlar hazır. Hat iki sınama sorusuyla uçtan uca denendi: denetim, motor çizimi, SQL ve LocalDB'nin yedi adımı. Yazım başladı. |
| 2 Kas 2026 | Ortaöğretim, Önlisans'ın aynası oldu; Ortaöğretim ajanları durduruldu. 596/1.280 kayıt yazıldı. |
| 2 Kas 2026 | **Kasım hazır, canlıya yazılmadı.** 19 kitapçık, 1.280 soru (1.040 yazılan + 240 Ortaöğretim aynası), 240 figür (motor resimli). `check_exams` bütün ay hatasız. `ekle.sql` LocalDB'de 7 adımı geçti. 428 resim dosyası (54 MB) yerel denetimde tamam. Koni sorusunda (AYT-MAT GEO 8) motor hatası yüzünden yalnız yarıçap etiketli. |
| 2 Kas 2026 | Motor 8 çizim hatasını düzeltti (koni ve 3B ölçüler, molekül, pil, yüzde çubuğu, zar, hazne, çember etiketleri, koyu tema). Koni sorusu yeniden iki ölçülü. Ayın 240 figürü yeni motorla yeniden çizildi; ay hatasız, `ekle.sql` LocalDB'de 7 adımı yeniden geçti, 428 resim (54 MB) hazır. Canlıya yazılmadı. |

## 6. Açık konular

- **Güncel bilgiler** (KPSS Vatandaşlık, ders başına 4–5 soru): yalnız kalıcı ve kesin olgular yazılıyor (2025 ortasına kadar). Canlıdan önce sahibinin gözden geçirmesi önerilir.
- **Kitapçık ataması:** admin panelinden yapılır. İstenirse API ile de yapılabilir; bu da ayrı onay ister.
- **Motor görseli (58) olan sorular:** enerji diyagramı ve pil gibi C# karşılığı olmayan motor görselleri soruya tür 58 olarak yazılır.
  - API oturumunun bildirdiğine göre, sorularda 58 kabulü, `AnyAwaitsStill` ve `ExamStudentService` 2 Kasım 07:58Z'den beri canlıda.
  - Resmi eksik 58'li kitapçık denemeye atanamıyor; deneme elle de yayına alınamıyor.
  - Canlıdan önce bir deneme ekranında 58'li bir sorunun resmiyle göründüğü doğrulanır.
- **Taralı bölge:** API dönüştürücüsü motor geometrisindeki taralı bölgeyi taşımıyordu. API oturumu 2 Kasım'da düzeltti; değişiklik 08:25Z'den beri canlıda (Works aktarımında da geçerli).
  - Dolgulu çokgen, dolgulu çember ya da daire dilimi artık `shaded:true` olur. Grafikte `area` alanı ve `rectangles` şeritleri de taralı sayılır.
  - Dolgusuz (`fill:false`) çokgen taralı sayılmaz.
  - FigureCheck 2 Kasım'da bu kodla yeniden derlendi.
- **Motor çizim istekleri:** 2 Kasım'da iletilen 8 istek aynı gün düzeltildi (motor oturumu). Kalan küçük kusur: Zn–Ag pilinde "tuz köprüsü" yazısının ilk harfi köprünün iç kenarına değiyor; okunuyor.
- **Canlıdaki TYT quiz konileri:** 7 koni figürü (GEO_KATI_01–03) eski hatayla çizildi. Yalnız resim adreslerini değiştiren ayrı bir küçük güncelleme gerekiyor (ayrı onay).

## Revizyon geçmişi

| Rev | Tarih | Değişiklik |
|---|---|---|
| 1 | 2 Kas 2026 | İlk sürüm: yeni deneme yapısı, Kasım planı, araçlar, akış. |
| 2 | 2 Kas 2026 | Ortaöğretim = Önlisans (ayna); motor görseli (58) için API koşulu; motor çizim istekleri. |
| 3 | 2 Kas 2026 | Kasım'ın bütün kitapçıkları yazıldı, denetlendi ve LocalDB'de denendi; taralı bölge API'de çözüldü; koni için geçici çözüm. |
