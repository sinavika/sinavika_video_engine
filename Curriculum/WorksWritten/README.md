# Curriculum/WorksWritten: Works için yazılmış dersler

Video senaryosundan kurulan ders, telefonda sesi olmayan bir videoya benziyordu: anlatımın çoğu eksik, formüller sesli okunacak biçimde, sorular öğretmeden önce. Bu klasör, her konunun **Works için yeniden yazılmış, etkileşimli dersini** tutar.

- **Yol:** `Curriculum/WorksWritten/<KATEGORİ>/<DERS>/<KONU>.json`.
- **Asıl kaynak budur.** `Curriculum/Works` dosyası buradan üretilir. Bir dersi düzeltmek gerekirse burası düzeltilir, ardından `works --topic` çalıştırılır.
- **Video senaryolarına dokunulmaz.** Videolar `Curriculum/Scripts` klasöründen gelmeye devam eder.

## İçerik (9 Kasım 2026)

- **YKS_TYT:** 168 konu.
- **KPSS_LISANS:** 97 konu.
- İkisi de canlıda.
- AYT, KPSS Önlisans ve Ortaöğretim henüz yazılmadı.

## Bir dersin kuralları

Kurallar motorda, `src/Works/WorksWritten.ts` dosyasında denetlenir.

**Ret kuralları** (kural bozulursa ders kullanılmaz, videodan kurulan hâl yazılır):
- Bütün alt konular anlatılmış olmalı.
- Kartlar API'nin okuduğu biçimde olmalı. Kart türleri: tanım, kural, örnek, görsel, tahmin, doğru/yanlış, soru, boşluk, eşleştirme, gruplama, dokunarak seçme, ek ayırma, çoklu seçim, çevrilen kart, rehberli çözüm, hatayı bul.
- İpucu ve şık açıklaması cevabı ele vermemeli.
- Sesli okunur biçimde yazılmış formül ("10 A artı B") ve video sözü olmamalı.
- Art arda en çok 4 okuma kartı olabilir.
- Doğru/yanlış adımları dengeli olmalı.
- Works notlarının hepsi karşılanmış olmalı.

**Öğretim sırası** (sahibin ve Eymen'in kuralı, 4–5 Kasım; 9 Kasım'da yeniden doğrulandı). Canlıdaki derslerde uyarıdır: ders yine kullanılır, bir sonraki geçişte düzeltilir. **Yeni üretimlerde `--strict` ile rettir**: kuralı bozan yeni ders canlıya gitmez, düzeltme turuna döner.
- Ders ve her bölüm bir tanımla açılır.
- Sayısal derslerde formülden önce anlamı anlatılır.
- İlk sorudan önce çözümlü örnek gelir: sayısalda en az 2, sözelde en az 1.

Her dosyanın `written` alanı şunları tutar:
- `sources`: dersin dayandığı kaynaklar;
- `additions`: Works notlarının nerede karşılandığı;
- `fixes`: bulunan ve düzeltilen hatalar.

## Nasıl üretilir

Araçlar `Tools/` klasöründedir:
- `Tools/Yonerge.md`: modelin her derste uyduğu yönerge (kurallar, kart biçimleri, öğretim sırası).
- `Tools/works_batch.py`: Claude Batch API ile yazdırma, denetleme ve düzeltme hattı.

Kullanım (motor kökünden):
```
python Curriculum/WorksWritten/Tools/works_batch.py gonder --model sonnet KPSS_ONLISANS/TRK   # ilk yazım (temel: videodan kurulan ders)
python Curriculum/WorksWritten/Tools/works_batch.py topla <batch_id>                          # sonuçları yazar
python Curriculum/WorksWritten/Tools/works_batch.py onar KPSS_ONLISANS/TRK                    # biçim onarımı (ücretsiz)
python Curriculum/WorksWritten/Tools/works_batch.py denetle --strict KPSS_ONLISANS/TRK        # motor denetimi (yeni üretimde --strict zorunlu)
python Curriculum/WorksWritten/Tools/works_batch.py yama --model sonnet                       # sorunlu derslere yalnız gereken değişiklik (ucuz)
python Curriculum/WorksWritten/Tools/works_batch.py gonder --temel yazili ...                 # mevcut yazılı ders üzerinden yeni geçiş
python Curriculum/WorksWritten/Tools/works_batch.py maliyet                                   # toplam harcama
```

- Ücretli API her çalıştırmada sahibin açık onayıyla (model ve tutar) kullanılır.
- Kaynaklar `Desktop/EgitimVerileri` klasöründen okunur: MEB anlatımı, ÖSYM çıkmış soruları, doğrulanmış havuz.
- Ara çıktılar ve kayıtlar `Outputs/Works/Written` klasöründedir.
