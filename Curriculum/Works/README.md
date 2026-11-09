# Curriculum/Works: uygulamaya giden Works dersleri

Bu klasördeki her dosya, uygulamanın **Dersler (Works)** modülünde bir konunun dersidir. Sunucuya giden dosya budur.

- **Yol:** `Curriculum/Works/<KATEGORİ>/<DERS>/<KONU>.json`, örneğin `YKS_TYT/MAT/MAT_BASAMAK.json`.
- **Elle düzenlenmez.** Dosyalar `npm run curriculum -- works <KATEGORİ> --topic <KAT/DERS/KONU,...>` ile yazılır.
  - Konunun yazılı dersi varsa (`Curriculum/WorksWritten`), komut onu denetler ve buraya yazar.
  - Yoksa dosya videonun senaryosundan (`Curriculum/Scripts`) kurulur.
- **`--topic` kullan.** Bütün kategoriyi bir kerede yazmak, dokunulmayan konuların görsel özetini (rawHash) de değiştirir ve gereksiz yeniden çizim doğurur.

## Kategorilerin durumu (9 Kasım 2026)

| Kategori | Konu | İçerik | Canlıda |
|---|---|---|---|
| YKS_TYT | 168 | **Yazılı ders.** Etkileşimli; tanım, formülden önce anlam, çözümlü örnekler var | Evet |
| KPSS_LISANS | 97 | **Yazılı ders**, aynı kurallarla | Evet |
| YKS_AYT | 276 | Videodan kurulan hâl. Yazılı ders henüz yazılmadı | Evet |
| KPSS_ONLISANS | 81 | Videodan kurulan hâl. Yazılı ders henüz yazılmadı | Evet |
| KPSS_ORTAOGRETIM | 81 | Videodan kurulan hâl. Önlisans'ın ikizi | Evet |

Bir dosyanın yazılı ders olduğu, içindeki `written` alanından anlaşılır.

## Canlıya nasıl gider

1. **Görseller:** `npm run figures -- --works <KATEGORİ veya dosya>`.
   - Çizimler `Outputs/Works/Figures` klasörüne, listesi `Outputs/Works/Figures/manifest.json` dosyasına yazılır.
   - Yeri kayan ama verisi aynı görsel yeniden çizilmez, eski resmine bağlanır.
2. **Kuru deneme:** `python sinavika/scripts/works_claude_import.py --cats <KATEGORİ> --manifest --api-dry-run`. Bu adım hiçbir şey yazmaz; sunucu hangi bölümlerin değişeceğini ve kalkacağını söyler.
3. **Aktarım:** aynı komut `--api-dry-run` olmadan çalıştırılır. Eksik resimler yüklenir, konular aktarılır ve yayınlanır.

- Her canlı yazma için sahibin onayı gerekir.
- Works yüklemeleri ve revizyonları "Works iyileştirilmesi" oturumunun işidir.

API tarafının notları `docs/Courses/Works-Aktarim-Notlari.md` dosyasındadır.
