# Deneme sorusu yazımı: ajan yönergesi

Sınavika'nın aylık sabit denemeleri için **yeni** sorular yazılır. Her ay şablondaki kadar deneme vardır: her oturum için bir genel deneme ve her bölüm için bir bölüm denemesi. Kitapçıklar, slotlar, konu dağılımı, zorluk ve doğru harf planda hazırdır (`Exams/<ay>/plan.md`); konu adetleri ÖSYM çıkmışlarıyla orantılıdır.

**İş birimi:** bir kitapçığın bir dersi (ör. `TYT-GENEL` / `TRK`, 40 soru).

Yollar motor kökünden (`C:\Users\onurc\source\repos\sinavika_video_engine`). Kullanıcıya görünen her şey Türkçedir; kod ve dosya adları İngilizcedir. Deneme komutları `Curriculum/Exams/Tools` içinden, ortak araçlar (`render_figures.py`, `upload_stills.py`, `check_revisions.py`) `Curriculum/Tools` içinden; `PYTHONUTF8=1 PYTHONIOENCODING=utf-8` ile çalışır.

## 0. Önce oku

1. [YazimKurallari.md](../Quizzes/YazimKurallari.md): kök ve şık, altı çizili, figür ve çözüm kuralları denemede de geçerlidir. Quiz'e özgü "Kayıt", "Kaynak kullanımı" ve "Yazma" bölümleri yerine bu yönerge geçerlidir.
2. `Tools/exam_generator.py`: üreticinin çalışma biçimi.
3. Figür gerekirse:
   - `Outputs/Quizzes/Work/TYT-R5/YONERGE.md` §1–§4: figür ölçütü ve motor görselleri.
   - Örnek: `Outputs/Quizzes/Work/TYT-R5/GEO_ACIORTAY.py` (ölçekli geometri).

## 1. Değişmezler

- **Yeni soru.** Canlıya hiçbir şey yazılmaz. Başka dosyaya dokunulmaz.
- **Plan sabittir:** her slotun **konusu** (LessonSub) ve **doğru harfi** değişmez.
  - Mikro konu, planlanan konunun etkin mikrolarından biri olur. Plandaki mikro öneridir; konunun içinde değiştirilebilir. Bir kitapçıkta aynı mikro tekrar edilmez, konu elveriyorsa.
  - Doğru içerik plandaki harfe konur. Şıklar doğal sırasında kalır (sayılar küçükten büyüğe ya da büyükten küçüğe; "Yalnız I, Yalnız II, I ve II, …" standart sırası). Çeldiriciler, doğru şık plandaki harfe düşecek biçimde seçilir.
  - **Beş şık.**
- **Zorluk plandakidir:**
  - `Easy`: tek adımlı, temel bilgi ya da doğrudan uygulama.
  - `Medium`: iki üç adımlı; ÖSYM ortalaması.
  - `Hard`: çok adımlı, güçlü çeldiricili; ÖSYM'nin ayırt edici soruları.
- **Deneme üslubu, ÖSYM düzeyi.**
  - TYT ve AYT için o oturumun düzeyi.
  - KPSS'de düzey ayrıdır: Lisans en zor, Önlisans ortada, Ortaöğretim lise mezunu düzeyi.
- **Tek ve tartışmasız doğru cevap.** Bilimsel ve tarihsel doğruluk kesin olmalı. Hesap gerekiyorsa çözümde adım adım yapılır ve sonuç şıkla karşılaştırılır.
- **Her soru tek başınadır.** Birden çok soruya ortak parça yoktur.
- **Ayna kitapçıklar yazılmaz:** KPSS Ortaöğretim kitapçıkları Önlisans'ın sorularını aynen kullanır; ana oturum `exam_mirror.py` ile kopyalar. Önlisans soruları iki sınavın düzeyine de uygun yazılır.
- **Aynı ders, öbür kitapçık:** bu ay aynı dersin başka kitapçıkları da var (`exam_show.py` yazar). Sorular onlardakinden farklı olur. Denetim ay içindeki benzer soruyu hata sayar.

## 2. Kaynak kullanımı

- **Referans:** ÖSYM çıkmış soruları ve deneme kitapları. `exam_sources.py` önce bunları gösterir; azsa `--test` ile soru bankaları da gelir.
- **Kopya yok.** MEB/ÖSYM izni yalnız örnek ve referans içindir. Soru tipi, kök kalıbı, şık yapısı ve zorluk örneklerden alınır; parça, sayılar, şıklar ve kurgu yeniden yazılır. Denetim, kaynağa fazla benzeyen kökü (6 sözcüklük parçaların yarısından çoğu ortak) reddeder.
- **Parçalar özgündür.** Türkçe ve edebiyat paragrafları bu iş için yazılır.
  - Yaşayan ya da ölümünün üzerinden 70 yıl geçmemiş yazarların metni alıntılanmaz.
  - Edebiyat tarihi sorularında telif süresi dolmuş şairlerden (Divan, Halk, Tanzimat, Servet-i Fünun, Millî Edebiyat) kısa dize alıntısı olabilir. Dize doğru olmalı; emin olunmayan dize yazılmaz.
- **Bilgi doğrulama:** bilgi içeren derslerde (tarih, coğrafya, fen, din, felsefe, vatandaşlık) olgular `--anlatim` ile konu anlatımından ve MEB bilgi paketlerinden doğrulanır.
- **Güncel bilgiler** (KPSS `VAT_GUNCEL_BILGILER`, AYT `DIN_GUNCEL` vb.):
  - Yalnız kesin ve kalıcı olgular yazılır: uluslararası kuruluşlar ve Türkiye'nin üyelikleri, kuruluş yılları, UNESCO listelerine 2024'e kadar girmiş varlıklar, Türkiye'nin kurumları ve projeleri.
  - 2025 ortasından sonraki olay ya da "bu yıl, geçen ay" gibi zamana bağlı ifade yazılmaz.
  - Gerekçede olgunun yılı yazılır.
- `kaynak` alanına bakılan EgitimVerileri soru kimlikleri yazılır.

## 3. Bir birimin akışı

1. **Planı oku:** `python exam_show.py <ay> <kitapçık> <DERS>`. Sıra, konu, önerilen mikro, zorluk, doğru harf ve konuların etkin mikroları görünür.
2. **Örneklere bak:** `python exam_sources.py <sub> <DERS> <KONU> 10 [MİKRO] [--anlatim] [--test]`.
   - `sub` değerleri: `YKS_TYT`, `YKS_AYT`, `KPSS_LISANS`, `KPSS_ONLISANS`, `KPSS_ORTAOGRETIM`.
3. **Üreticiyi yaz:** `Outputs/Exams/Work/<ay>/<kitapçık>/<DERS>.py` (kalıp §4'te). Plandaki her sıra için bir `D.Q(...)` olur.
4. **Çalıştır:** `python Outputs/Exams/Work/<ay>/<kitapçık>/<DERS>.py`. Kayıtlar `Curriculum/Exams/<ay>/<kitapçık>/<DERS>.jsonl` dosyasına yazılır.
5. **Denetle:** `python check_exams.py <ay> <kitapçık> --ders <DERS>`.
   - Yalnız şu iki hata kalabilir:
     - "motor:… hazır resim yok": resmi ana oturum çizer;
     - "motor öğesi bekleniyor".
   - Öbür her hata düzeltilir, sonra 4–5 tekrarlanır.
6. **Figür varsa:** `python exam_preview.py <ay> <kitapçık> <DERS>` çizer ve ön izleme PNG'si üretir.
   - PNG'yi **açıp bak**:
     - yazı ve etiket çakışması;
     - kökle tutarlılık;
     - sorulan ölçünün etiketlenmemesi;
     - fizik, kimya ve coğrafya doğruluğu.
   - Gerekirse `--koyu`.

## 4. Üretici kalıbı

```python
"""Kasım 2026 · TYT-FEN · FIZ: deneme soruları."""
import sys
sys.path.insert(0, r"C:\Users\onurc\source\repos\sinavika_video_engine\Curriculum\Exams\Tools")
sys.path.insert(0, r"C:\Users\onurc\source\repos\sinavika_video_engine\Curriculum\Tools")
from exam_generator import deneme  # noqa: E402

D = deneme("2026-11", "TYT-FEN", "FIZ")

D.Q(2, "FIZ_MADDE_02",                                   # dersteki sıra (exam_show), mikro konu
    "Aynı sıcaklıktaki K, L ve M sıvılarının kütle-hacim grafiği şekildeki gibidir. …\n\n{{fig:fig1}}\n\n"
    "Buna göre sıvıların özkütleleri dK, dL ve dM arasındaki ilişki nedir?",
    ["dL > dK > dM", "dM > dL > dK", "dK = dL > dM", "dK > dM > dL", "dK > dL > dM"], "E",   # şıklar, plandaki doğru harf
    "Özkütleler 3, 2 ve 1 g/cm³ olduğundan dK > dL > dM'dir.",                            # kısa çözüm
    "Özkütle kütlenin hacme oranıdır (d = m / V). K için 30 / 10 = 3 g/cm³ …",             # gerekçe (adım adım)
    ["L'nin kütlesi büyük görünse de hacmi iki katıdır; özkütlesi küçüktür.", "…", "…", "…", "—"],   # her şık için; doğru şık —
    "Özkütlenin kütle-hacim grafiğinde eğime eşit olduğunu bilmek.",                     # ön bilgi
    "Kütlesi büyük olan maddenin özkütlesinin de büyük olduğunu sanmak.",                # yanılgı
    kaynak=["yks-tyt-sr-karma-cikmis-2018-2026-5-005"],
    fig=[{"code": "fig1", "title": "K, L ve M sıvılarının kütle-hacim grafiği", "alt": "…",
          "visual": {"kind": "plot", "x": [0, 45], "y": [0, 50], "xLabel": "Hacim (cm³)", "yLabel": "Kütle (g)",
                     "segments": [{"from": [0, 0], "to": [15, 45], "label": "K", "dashed": False}, …]}}])

D.run()
```

- **Matematik:** `$…$` yasak. Unicode yazılır: x², √, π, ≤, ∞, f′(x), ∫, Σ, log₂.
- **Altı çizili:** `<u>…</u>` ile yazılır ve kökte "altı çizili" denir. `**` ve `__` yasak.
- **Yanlış şık analizi:** her yanlış şık en az 15 karakterle, o şıkkın içeriğiyle neden yanlış olduğunu söyler. Aynı analiz iki şıkta tekrar edilmez.
- **Figür:**
  - ÖSYM'nin şekille sorduğu soru figürle yazılır: geometri neredeyse her zaman; grafik, tablo, harita, düzenek, soy ağacı, devre.
  - Kökte `{{fig:fig1}}` tam bir kez geçer. Figür kendi paragrafıdır ve soru cümlesinden önce gelir. Veriler kökte de yazar.
  - Geometri ölçekli kurulur (`geometry_figures.py`).
  - `plot` çizgileri varsayılan olarak kesiklidir; düz çizgi için `"dashed": False`.
  - "Taralı" denen bölge figürde taralı olur:
    - geometride dolgulu çokgen (`poly`, varsayılan dolgulu), dolgulu çember ya da daire dilimi;
    - grafikte `area` ya da `rectangles`.
    - Dolgusuz (`fill: false`) çokgen taralı sayılmaz.
- **Motorun çizemediği gerekli figür:** `fig="motor:<tür>: <eksik öğe>"`. Soru sözele çevrilmez ve bekletilir. Dar tutulur.

## 5. Yasaklar

- Başka kitapçığın ya da dersin dosyalarına dokunma.
- `Tools/`, `src/`, plan dosyalarını değiştirme.
- Şunları çalıştırma:
  - `exam_plan.py`, `exam_catalog.py`, `build_exam_sql.py`, `dry_run_exam_sql.py`, `apply_exam_sql.py`;
  - `render_figures.py`, `upload_stills.py`, `npm run figures`;
  - `--ders` olmadan `check_exams.py`.

## 6. Bitince raporla (son mesaj, Türkçe, kısa)

Kitapçık ve ders başına şunları yaz:
- yazılan soru sayısı ve zorluk dağılımı;
- figürlü soru sayısı ve görsel türleri;
- `motorIstegi` alan sorular;
- son `check_exams --ders` özet satırı;
- güncel bilgi sorularında kullanılan olgular ve yılları (varsa);
- çözemediğin sorunlar.
