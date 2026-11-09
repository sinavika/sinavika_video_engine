# Quiz soruları revizyonu: çalışma planı

**Revizyon:** 5 (2 Kasım 2026). Geçmiş en altta.

Yalnız quiz soruları revize edilir; **deneme sorularına dokunulmaz** (onlar için ayrı alt çalışma yapılacak). Kurallar: [YazimKurallari.md](YazimKurallari.md). Envanter: [Reports/QuizEnvanteri.md](Reports/QuizEnvanteri.md). Figür durumu ve altyapı istekleri: [Reports/TYT_Figur_Raporu.md](Reports/TYT_Figur_Raporu.md).

## Klasörler

| Yer | İçinde | Git |
|---|---|---|
| `Curriculum/Quizzes/` | Bu plan, yazım kuralları | var |
| `Curriculum/Quizzes/Revisions/<Sınav>/<Kategori>/<Ders>/<Konu>_NN.jsonl` | Revize edilen sorular (asıl iş) | var |
| `Curriculum/Quizzes/Reports/` | Envanter ve figür raporları | var |
| `Curriculum/Quizzes/Pilot/` | TYT Türkçe · Sözcükte Anlam pilotu | var |
| `Curriculum/Quizzes/Tools/` | Araçlar (Python) ve `FigureCheck` (API'nin kendi koduyla denetim, C#) | var |
| `Outputs/Quizzes/Data/` | Canlı veritabanından çekilen quiz soruları, hiyerarşi, kopyalar (`export_data.py`) | yok |
| `Outputs/Quizzes/Results/<Sınav>/<Kategori>/<Ders>/` | Denetlenmiş kayıtlar, `guncelle.sql`, `geri_al.sql`, figürler, ders raporu | yok |
| `Outputs/Quizzes/Figures/<Sınav>/<Kategori>/<Ders>/` | Motorun çizdiği hazır resimler (açık ve koyu SVG) ve çizimin kendi manifesti | yok |
| `Outputs/Quizzes/FigureCheck/` | `FigureCheck` derlemesi | yok |
| `Outputs/Quizzes/Work/` | Konu üreticileri ve karalama; `TytScratchpad/` TYT'nin üreticileri (arşiv) | yok |

- **Eğitim verisi kopyalanmaz.** Kaynak sorular ve konu anlatımları `Desktop/EgitimVerileri`'den olduğu yerde okunur (`EGITIM_VERILERI` ortam değişkeni değiştirir). Orada düzenleme yapılmaz.
- Bütün yollar merkezde, `Curriculum/Tools/engine_paths.py` dosyasında (9 Kasım 2026); `Tools/paths.py` onları quiz araçlarına açar. Quiz araçları `Curriculum/Quizzes/Tools`'tan çalışır. Quiz ve denemenin ortak araçları `Curriculum/Tools`'tan çalışır: `check_revisions.py`, `render_figures.py`, `upload_stills.py`, `common`, `database`, `content_api (Sınavika API), anthropic_api (Anthropic)`, FigureCheck. Örnek: `python Curriculum/Tools/check_revisions.py YKS/YKS_TYT/TRK`.
- `FigureCheck` API'nin çalışma kopyasındaki kodla derlenir: `dotnet build -c Release Tools/FigureCheck`. API'nin denetimi değişince yeniden derlenir.

## Kapsam

| | Soru |
|---|---:|
| Quiz sorusu (YKS + KPSS) | 47.686 |
| Kopyalar çıkarıldığında tekil (revize edilecek) | 43.005 |
| Kopyalar (temsilcinin revizyonunu alır; çoğu KPSS Önlisans → Ortaöğretim) | 4.681 |
| Pilotta revize edilmiş (TYT Türkçe · Sözcükte Anlam) | 139 |
| Kapsam dışı: SAT/ACT quiz soruları | 30 |

Kaynak türü: System 45.540 · SinoAI (öğrenciye özel quiz) 883 · AdminTest (öğrenciye görünmez) 1.263.

## Sıra

1. **YKS TYT:** Türkçe, Tarih, Coğrafya, Felsefe, Din, Matematik, Geometri, Fizik, Kimya, Biyoloji
2. **YKS AYT:** Türk Dili ve Edebiyatı, Tarih-1, Coğrafya-1, Tarih-2, Coğrafya-2, Felsefe, Psikoloji, Sosyoloji, Mantık, Din, Matematik, Geometri, Fizik, Kimya, Biyoloji
3. **KPSS Lisans:** Türkçe, Matematik, Geometri, Tarih, Coğrafya, Vatandaşlık
4. **KPSS Önlisans:** aynı dersler
5. **KPSS Ortaöğretim:** çoğu Önlisans kopyası; yalnız 260 tekil soru ayrıca yazılır

YDT kaldırıldı; YDT soruları revize edilmez. Her derste konu konu ilerlenir.

## Bir dersin akışı

1. `show_topic.py` ya da `show_batch.py <ders> <baş> <adet> [konu]` ile sorular okunur; `show_sources.py <ders> <konu>` eğitim verisindeki aynı konunun sorularını üslup için gösterir.
2. Her soru çözülür; hata türü yazılır; soru düzeltilir ya da yeniden yazılır (doğru harf ve şık sayısı korunur). Konu üreticisi `Outputs/Quizzes/Work/` altında yazılır, `Tools/generator.py` ile `Revisions/<ders>/<konu>_NN.jsonl` dosyalarını üretir.
3. `check_revisions.py <ders>`: metin, altı çizili işaretleme ve çözüm kuralları; ardından **FigureCheck** (API'nin kendi kodu): motor görselini Works aktarımındaki çeviriciyle figüre çevirir, hazır resmi bağlar, metindeki görsel atıfları ve kayıt denetimini çalıştırır, işaretleme derleyicisini dener. Hatalı soru çıktıya girmez. Motorun çizeceği görselleri `Results/<ders>/soru-figurleri-….jsonl` listesine yazar.
4. **Figürleri motor çizer** (1 Kasım 2026 kararı, API'de `docs/works/Motor-Hazir-Resimleri.md`):
   - Figür kayıtta motorun görseli olarak yazılır: `{"code","title","alt","visual"}`. Eski C# figürü `figure_to_visual.py` çevirir.
   - `render_figures.py <ders>`, motorun çizicisiyle (`RenderFigures.ts`) açık ve koyu tema SVG'lerini `Outputs/Quizzes/Figures/<ders>/` altına çizer ve `stills.json`'u yazar. Works'ün ortak manifestine dokunmaz.
   - `check_revisions.py <ders>` yeniden çalışır. Bir dersin figürleri `figurler.html`'de telefon genişliğinde, açık ve koyu kartta gözle kontrol edilir.
   - Gereken öğe motorda yoksa soru sözele çevrilmez: kayda `motorIstegi` yazılır, öğe rapordaki istek listesine girer, soru öğe gelene kadar canlıya yazılmaz.
5. `build_sql.py <ders>` → `guncelle.sql`, `geri_al.sql` ve `yuklenecek-resimler.json`. Hazır resimler adresleri dosya içeriğinin SHA-256 özetiyle yazılır; dosyalar SQL'den önce depoya yüklenir.
6. `dry_run_sql.py <ders>`: LocalDB'de geçici veritabanında şunlar denenir: değişmiş kökle durma, hazır resimli eski figürle durma, güncelleme = beklenen, geri alma = ilk hâl. Geçmezse canlıya gönderilmez.
7. `lesson_report.py <ders>`: ders raporu (hata türleri, cevap anahtarı yanlış olanlar, önce/sonra). **Resim yükleme ve canlıya yazma için ayrı onay** gerekir.

## Durum (1 Kasım 2026)

- **TYT:** 10 ders revize edildi; canlıya yazılmadı.
  - 142 figürün 139'u motora taşındı (rapor bölüm 8). 3 soru motorun iki serili grafiğini bekliyor.
  - Figür turu (R5, rapor bölüm 9): 444 yeni figür eklendi, 40 soru figürlü yeniden yazıldı. Ek dosyaları ve yönerge `Outputs/Quizzes/Work/TYT-R5/` altında.
  - Motorun bildirilen çizim hataları düzeldi. 583 figürün hepsi yeniden çizildi, 10 dersin SQL'i LocalDB'de geçti.
  - **TYT'nin tamamı canlıda (2 Kasım 2026):** 10.704 soru ve 583 motor figürü; 1.148 hazır resim yüklendi. Her ders `apply_sql.py --canli` ile uygulandı ve canlıdan geri okunarak doğrulandı.
  - Motoru bekleyen 4 soru canlıdaki eski hâlinde kalıyor; motor öğesi gelince ayrı SQL ile yazılacak.
- **Güncel API denetimi:** genişletilen görsel atıf kuralı TYT'de 2 yanlış alarm verdi. İkisinin de kökü yeniden yazıldı:
  - FEL `6CE5843A`: “ressamın tablosunda” → “resminde”.
  - MAT `0C3F2614`: “sıklık tablosu hazırlanırsa tabloya”.
- **AYT (2 Kasım 2026'da başladı):** 15 ders, 16.862 tekil soru (kopya yok; Coğrafya-1/2 ve Tarih-1/2 aynı konu kodlarını kullanır, soruları farklı).
  - İş birimi bir konu (≈ 60 soru); işler paralel ajanlarla yürütülür. Yönerge: `Outputs/Quizzes/Work/AYT/YONERGE.md`. Üreticiler `Outputs/Quizzes/Work/AYT/<DERS>/<KONU>.py`.
  - Aynı derste birden çok ajan çalışabilir:
    - Denetim konu moduyla çalışır: `check_revisions.py <ders> --konu <KONU>`, çıktı `Results/<ders>/_konu/<KONU>`.
    - Üretici kayıtları atomik yazar.
  - Figürler en baştan motor görseli. Motorun çizemediği gerekli figür için `fig="motor:…"` yazılır; soru bekletilir.
  - İlk üç pilot konu: MAT_LIMIT, TAR1 TAR_ILK_INSAN, FIZ_TORK.
- **KPSS:** başlanmadı.

## Hazırlıkta denenenler

- Pilotun 139 quiz revizyonu yeni hatta denetlendi: hata yok; SQL LocalDB'de üç adımdan da geçti.
- Figür yolu (eski figürü sil, yeni fonksiyon grafiği ekle, 241 noktaya örnekle, geri alında eskisini koy) uçtan uca denendi.
- FigureCheck bilerek hatalı verilen örnekleri yakaladı: çizimle uyuşmayan uzunluk etiketi, taralı denip taranmamış Venn, figürsüz görsel atfı, canlıda olmayan figür türü.

## Bilinmesi gerekenler

- **Altı çizili sorunu:** 1.326 quiz sorusunda çizgi ile “altı çizili” ifadesi tutmuyor; 1.591 soruda `**`/`__` kalıntısı, 263 soruda gösterilemeyen “koyu yazılmış” ifadesi var.
- **Görsel atfı, figür yok:** 3.026 soru tabloya/grafiğe/şekle atıf yapıyor ama figürü yok. Soru görsele gerçekten dayanıyorsa figür eklenir, dayanmıyorsa atıf kaldırılır.
- **Figürler:** Quiz'de yalnız 444 soruda figür var (çoğu tablo ve zaman çizelgesi).
- **Alt konu:** System quiz sorularının hiçbirinde alt konu yok (45.540); hepsine atanacak.
- **Hız:** Pilotta 211 soru tek tek çözülerek revize edildi. 43.005 tekil soru bu yöntemle uzun sürer; dersler birbirinden bağımsız olduğu için paralel yürütülebilir (her ders kendi klasörüne yazar, çakışma olmaz).

## Revizyon geçmişi

| Revizyon | Tarih | Değişiklik |
|---|---|---|
| 1 | 30 Ekim 2026 | İlk sürüm: kapsam, sıra, bir dersin akışı (Desktop/EgitimVerileri/SoruRevizyon). |
| 2 | 1 Kasım 2026 | Çalışma motora taşındı (`Curriculum/Quizzes`, üretilenler `Outputs/Quizzes`); araçlar İngilizce adlandı; figürler motordan gelir; YDT çıkarıldı; durum bölümü. |
| 3 | 1 Kasım 2026 akşamı | Motor figürü hattı kuruldu (`figure_to_visual.py`, `render_figures.py`, `RenderFigures.ts`, FigureCheck'te API'nin çeviricisi, SQL'de hazır resim sütunları). TYT'nin 139 figürü motora taşındı. |
| 4 | 1 Kasım 2026 gecesi | TYT figür turu: 444 figür, `geometry_figures.py` (ölçekli geometri), `apply_figures.py` (ek dosyasını kayıtlara işler), FigureCheck'te ölçek denetimi. |
| 5 | 2 Kasım 2026 | TYT'nin tamamı canlıda. AYT başladı: konu bazlı paralel iş, `check_revisions --konu`, atomik üretici yazımı, `fig="motor:…"`. |
