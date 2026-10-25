# Curriculum

Eğitim videolarının ders listesi, üretim kontrol listesi, kamp planları ve verisi. Ayrıntı: [docs/Courses.md](../docs/Courses.md).

- `Sources/LessonList.csv` · ders listesi (değiştirilmeden)
- `Catalog/` · sınav → kategori → ders → konu → alt başlık
- `Production/Checklist.md` · üretim kontrol listesi (`Checklist.json` asıl kayıt)
- `Camps/<kamp>.json` · kamp planları (dersin konuları yayın sırasıyla)
- `Data/` · `Desktop\EgitimVerileri`'nin YKS ve KPSS kopyası: konu anlatımları ve sorular (git'e alınmaz)
- `Scripts/<Kategori>/<Ders>/<Konu>.json` · senaryolar

```bash
npm run curriculum -- import
npm run curriculum -- camp create --category YKS_TYT --lesson TRK
npm run curriculum -- camp show yks-tyt-turkce-kampi
```
