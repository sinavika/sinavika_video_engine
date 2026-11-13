# Curriculum

Eğitim içeriğinin işi, modül modül. Klasörler API'deki (`Services/Quizzes`, `Exams`, `Works`) ve mobildeki (`src/modules/quiz`, `exam`, `works`) modüllerle aynı adı taşır. Modül haritası ve kurallar: [docs/Development.md](../docs/Development.md#modül-haritası-9-kasım-2026). Kamp ve ders videoları: [docs/Courses/Courses.md](../docs/Courses/Courses.md).

Burada git'e giren iş durur. Üretilen ve canlıdan çekilen her şey `Outputs/<Modül>/` altındadır, git dışındadır. Eğitim verisi motorda kopyalanmaz; konu anlatımları ve sorular `Desktop\EgitimVerileri`'den doğrudan okunur (31 Ekim 2026).

## Ortak

- `Tools/` · bütün modüllerin ortak Python araçları ve **bütün yollar** (`engine_paths.py`).
  - `common`: okuma, görsel özeti, liste adı, metin temizleme.
  - `database`: canlı veritabanından okuma.
  - `content_api`: Sınavika API'sinin Claude içerik uçları.
  - `anthropic_api`: Anthropic API, Batch ve maliyet kaydı için tek giriş noktası.
  - Figür hattı: `check_revisions.py`, `render_figures.py`, `upload_stills.py`, `RenderFigures.ts`, `geometry_figures.py`, `FigureCheck/`.
- `Catalog/` · sınav → kategori → ders → konu → alt başlık.
- `Sources/` · ders listesinin kopyası (`LessonList.csv`; asıl liste `Desktop\lesson.csv`, `import` her çalıştığında kopyalanır), MEB kazanım belgesi, araştırma notları ve raporları.
- `Desktop\EgitimVerileri\<Sınav>\<Kategori>\CikmisSorular\<Ders>.jsonl` ve `CikmisSorular.xlsx` · ÖSYM çıkmış sorular listesi; `brief` bunu kullanır.

## Kamp (YouTube kampları)

- `Camps/<kamp>.json` · kamp planları (dersin konuları yayın sırasıyla).
- `Scripts/<Kategori>/<Ders>/<Konu>.json` · senaryolar.
- `Jobs/<kamp>/<NN>-<konu>-youtube|reels.json` · render işleri. Senaryonun kopyasını değil yolunu taşır (`npm run curriculum -- jobs make|check`); yanında YouTube notu `-youtube.md`. Çıktı: `Outputs/Camps/<Sınav>/<Bölüm>/<Ders>/<NN>_<Konu>/`.
- `Production/` · üretim kontrol listesi (`Checklist.md`, asıl kayıt `Checklist.json`), kapsam ve ders denetimleri, veri düzeltmeleri, görsel iyileştirmeler.
- `Production/SoruDagilimi/` · ÖSYM soru dağılımı (sınav → ders → konu → yıl), `build-osym-distribution.py` ile üretilir.

## Quiz

- `Quizzes/` · uygulamadaki quiz sorularının revizyonu: revize sorular (`Revisions/`), kurallar (`YazimKurallari.md`), eksik görsel onarımı yönergesi ve quiz araçları (`Tools/`). Figürleri motor çizer. Plan: [Quizzes/CalismaPlani.md](Quizzes/CalismaPlani.md).
- Çıktı: `Outputs/Quizzes/` (çekilen veri, sonuçlar ve SQL, figürler, çalışma kuyruğu, FigureCheck derlemesi).

## Deneme

- `Exams/` · aylık denemeler: plan (`DenemePlani.md`), ajan yönergesi (`YONERGE.md`), `<ay>/plan.json` ve `<ay>/<kitapçık>/<ders>.jsonl`, deneme araçları (`Tools/`).
- Çıktı: `Outputs/Exams/` (canlı katalog, üreticiler `Work/`, sonuçlar ve SQL `Results/`, figürler `Figures/`).

## Works

- `Works/<Kategori>/<Ders>/<Konu>.json` · Works'ün aktardığı konu dosyaları (`npm run curriculum -- works`). Yolları yükleme listesinin anahtarıdır, taşınmaz.
- `WorksWritten/<Kategori>/<Ders>/<Konu>.json` · konunun Works için yazılmış dersi. Varsa `works` onu denetler ve videodan kurulan dosyanın yerine yazar (src/Works/WorksWritten.ts). Araç: `WorksWritten/Tools/works_batch.py`.
- Çıktı: `Outputs/Works/Figures/` (görsellerin hazır resimleri ve `manifest.json`), `Outputs/Works/Written/` (Batch kayıtları ve maliyet).

```bash
npm run curriculum -- import
npm run curriculum -- camp create --category YKS_TYT --lesson TRK
npm run curriculum -- camp show yks-tyt-turkce-kampi
```
