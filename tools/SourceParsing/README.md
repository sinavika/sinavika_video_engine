# SourceParsing (geçici araç)

Kaynak kitapları (`Desktop\SinavikaKaynaklar`: PDF'ler, ReferenceCorpus kopyaları, `Veri/SORULAR.csv`) ders listesine
(`Curriculum/Sources/LessonList.csv`) birebir kodlanmış JSON kütüphanesine çevirir. İş bitince bu klasör silinebilir;
çıktı `Curriculum/Library/` altında kalır (git'e girmez).

```
cd tools/SourceParsing
python -m sourceparsing stage kpss     # PDF metin katmanı + MEB bölümleri + Sınavika bankası → _Stage (API gerekmez)
python -m sourceparsing vision kpss    # şekil/formül/altı çizili sorular ve dağınık PDF'ler sayfa görüntüsünden (Claude)
python -m sourceparsing code kpss      # ders/konu/alt konu kodlama: önce kurallar, sonra Claude (code kpss rules: yalnız kurallar)
python -m sourceparsing build kpss     # Curriculum/Library/KPSS/... yazılır, Index.json ve Rapor.md güncellenir
```

Claude adımları `ANTHROPIC_API_KEY` ister (ortam değişkeni ya da projenin `.env` dosyası); anahtar hiçbir yere yazdırılmaz.
Gereken tek Python paketi PyMuPDF'tir (`pip install -r requirements.txt`).

## Çıktı

```
Curriculum/Library/<Sınav>/<Kategori>/
  Sorular/<DERS>/<KONU>.jsonl          konuya (ve biliniyorsa alt konuya) bağlı sorular
  Sorular/<DERS>/_KonuBekliyor.jsonl   dersi belli, konusu henüz kodlanmamış
  Sorular/_DersBekliyor.jsonl          dersi henüz belli değil
  Sorular/_GorselOkumaBekliyor.jsonl   şekil/formül nedeniyle metni eksik, görsel okuma bekliyor
  KonuAnlatimi/<DERS>/<KONU>.json      konu anlatımı bölümleri + ReferenceCorpus bilgi paketleri
Curriculum/Library/_Figures/           sorulardan kesilen şekiller (videoda da kullanılabilir)
Curriculum/Library/Index.json, Rapor.md
```

Her soru: `lessonMainCode`, `lessonSubCode`, `lessonMikroCode`, `match {method, confidence, needsReview}`, metin, şıklar,
cevap, kaynak (dosya, sayfa, soru no), `usedForVideo` (üretimde işaretlenir, yeniden derlemede korunur).
KPSS Önlisans ve Ortaöğretim aynı klasördedir; `categoryCodes` hangisine (ya da ikisine) ait olduğunu söyler.

ÖSYM ve yayınevi soruları yalnızca iç referans içindir (`source.license`); videolarda olduğu gibi yayımlanmaz.

## Kodlama sırası

1. Kaynağın kendisi kesinse (Sınavika bankasında listede var olan kod, MEB bölümünün kendi testi + alt konu) karar odur.
2. Değilse soru, ipuçlarıyla birlikte (ÖSYM soru sırası, soru kodu öneki, eski konu adı) hızlı modele sorulur;
   ders biliniyorsa yalnızca o dersin konu ağacı gösterilir. Kodlar listeye karşı doğrulanır.
3. Model emin değilse ya da güçlü bir ipucuyla çelişiyorsa daha dikkatli model ikinci kez bakar; yine ayrışırsa
   soru `needsReview: true` ve iki öneriyle kalır.

Kararlar `_Stage/coding/<sınav>.jsonl` dosyasında birikir; yeniden derleme tekrar sormaz.
