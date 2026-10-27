# Curriculum

Eğitim videolarının ders listesi, üretim kontrol listesi, kamp planları ve verisi. Ayrıntı: [docs/Courses.md](../docs/Courses.md).

- `Sources/LessonList.csv` · ders listesi (değiştirilmeden)
- `Catalog/` · sınav → kategori → ders → konu → alt başlık
- `Production/Checklist.md` · üretim kontrol listesi (`Checklist.json` asıl kayıt)
- `Production/KapsamDenetimi.md` · konu listesinin ve senaryoların MEB kazanımı ve ÖSYM'ye göre denetimi
- `Data/<Sınav>/<Kategori>/CikmisSorular/<Ders>.jsonl` ve `Data/CikmisSorular.xlsx` · ÖSYM çıkmış sorular listesi (resmî kaynaklar, ders listesi düzeninde); `brief` bunu kullanır
- `Production/SoruDagilimi/` · ÖSYM soru dağılımı (sınav → ders → konu → yıl), `build-osym-distribution.py` ile üretilir
- `Camps/<kamp>.json` · kamp planları (dersin konuları yayın sırasıyla)
- `Data/` · `Desktop\EgitimVerileri`'nin YKS ve KPSS kopyası: konu anlatımları ve sorular (git'e alınmaz)
- `Scripts/<Kategori>/<Ders>/<Konu>.json` · senaryolar

```bash
npm run curriculum -- import
npm run curriculum -- camp create --category YKS_TYT --lesson TRK
npm run curriculum -- camp show yks-tyt-turkce-kampi
```
