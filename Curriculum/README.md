# Curriculum

Eğitim videolarının ders listesi, üretim kontrol listesi ve kaynakları. Ayrıntı: [docs/Courses.md](../docs/Courses.md).

- `Sources/LessonList.csv` · ders listesi (değiştirilmeden)
- `Catalog/` · sınav → kategori → ders → konu → alt başlık
- `Production/Checklist.md` · üretim kontrol listesi (`Checklist.json` asıl kayıt)
- `ReferenceCorpus/` · konu anlatımları ve soru havuzları (git'e alınmaz; `npm run curriculum -- import` ile kurulur)
- `Scripts/<Kategori>/<Ders>/<Konu>.json` · senaryolar

```bash
npm run curriculum -- import --lessons <lesson.csv> --corpus <ReferenceCorpus>
```
