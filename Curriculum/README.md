# Curriculum

Eğitim videolarının ders listesi, üretim kontrol listesi, kamp planları ve verisi. Ayrıntı: [docs/Courses.md](../docs/Courses.md).

- `Sources/LessonList.csv` · ders listesinin kopyası; asıl liste `Desktop\lesson.csv`, `import` her çalıştığında kopyalanır
- `Catalog/` · sınav → kategori → ders → konu → alt başlık
- `Production/Checklist.md` · üretim kontrol listesi (`Checklist.json` asıl kayıt)
- `Production/KapsamDenetimi.md` · konu listesinin ve senaryoların MEB kazanımı ve ÖSYM'ye göre denetimi
- `Desktop\EgitimVerileri\<Sınav>\<Kategori>\CikmisSorular\<Ders>.jsonl` ve `CikmisSorular.xlsx` · ÖSYM çıkmış sorular listesi (resmî kaynaklar, ders listesi düzeninde); `brief` bunu kullanır
- `Production/SoruDagilimi/` · ÖSYM soru dağılımı (sınav → ders → konu → yıl), `build-osym-distribution.py` ile üretilir
- `Camps/<kamp>.json` · kamp planları (dersin konuları yayın sırasıyla)
- Eğitim verisi motorda kopyalanmaz: konu anlatımları ve sorular `Desktop\EgitimVerileri`'den doğrudan okunur (31 Ekim 2026)
- `Works/<Kategori>/<Ders>/<Konu>.json` · Works'ün aktardığı konu dosyaları (`npm run curriculum -- works`)
- `Scripts/<Kategori>/<Ders>/<Konu>.json` · senaryolar
- `Jobs/<kamp>/<NN>-<konu>-youtube|reels.json` · render işleri; senaryonun kopyasını değil yolunu taşır (`npm run curriculum -- jobs make|check`), yanında YouTube notu `-youtube.md`

```bash
npm run curriculum -- import
npm run curriculum -- camp create --category YKS_TYT --lesson TRK
npm run curriculum -- camp show yks-tyt-turkce-kampi
```
