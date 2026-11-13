# Quiz soruları revizyonu: çalışma planı

**Revizyon:** 7 (14 Kasım 2026). Geçmiş en altta.

Yalnız quiz (test) soruları revize edilir; **deneme sorularına dokunulmaz** (onlar `Curriculum/Exams`'te). Yazım kuralları: [YazimKurallari.md](YazimKurallari.md). Eksik görsel onarımının model yönergesi: [GorselOnarimYonergesi.md](GorselOnarimYonergesi.md).

## Klasörler

| Yer | İçinde | Git |
|---|---|---|
| `Curriculum/Quizzes/` | Bu plan, yazım kuralları, onarım yönergesi | var |
| `Curriculum/Quizzes/Revisions/<Sınav>/<Kategori>/<Ders>/<Konu>_NN.jsonl` | Revize edilen sorular (asıl iş). `<Konu>_00_gorsel.jsonl`: eksik görsel onarımı; aynı sorunun tam revizyonu (`_01`…) sonra sıralandığı için onu geçer. | var |
| `Curriculum/Quizzes/Tools/` | Quiz araçları (Python) | var |
| `Curriculum/Tools/` | Quiz ve denemenin ortak araçları: yollar (`engine_paths.py`), `check_revisions.py`, `render_figures.py`, `upload_stills.py`, `content_api.py` (Sınavika API), `anthropic_api.py` (Anthropic), `VisualSchemas.ts`, FigureCheck (C#) | var |
| `Outputs/Quizzes/Data/` | Canlıdan çekilen quiz soruları, hiyerarşi, kopyalar (`export_data.py`) | yok |
| `Outputs/Quizzes/Results/<Sınav>/<Kategori>/<Ders>/` | Denetlenmiş kayıtlar (`sonuc.jsonl`, konu modunda `_konu/<KONU>/`), `stills.json`, figür sayfası, ders raporu; TYT ve AYT TDE için SQL | yok |
| `Outputs/Quizzes/Figures/<Sınav>/<Kategori>/<Ders>/` | Motorun çizdiği hazır resimler (açık ve koyu SVG) ve çizimin manifesti | yok |
| `Outputs/Quizzes/Work/` | Konu üreticileri (`AYT/<DERS>/<KONU>.py`, TYT'ninkiler `TytScratchpad/`, TYT figür turu `TYT-R5/`), `GorselOnarim/<parti>/` (onarım partileri: istekler, yanıtlar, denetimler, rapor, canlı yazım kaydı) | yok |
| `Outputs/Quizzes/FigureCheck/` | `FigureCheck` derlemesi | yok |

- **Eğitim verisi kopyalanmaz.** Kaynak sorular ve konu anlatımları `Desktop/EgitimVerileri`'den olduğu yerde okunur (`EGITIM_VERILERI` ortam değişkeni değiştirir). Orada düzenleme yapılmaz.
- Bütün yollar `Curriculum/Tools/engine_paths.py`'de. Quiz araçları önce `paths`'i içe aktarır; `Outputs` ya da `Desktop` yolunu kendisi kurmaz. Quiz araçları deneme araçlarını içe aktarmaz.
- `FigureCheck` API'nin çalışma kopyasındaki kodla derlenir: `dotnet build -c Release Curriculum/Tools/FigureCheck`. API'nin denetimi değişince yeniden derlenir.
- **Ölü kopya bırakılmaz (sahip, 14 Kasım 2026):** bir şey yeniden üretildiğinde eskisi silinir. Ön izleme, ara liste ve yedek işi bitince Geri Dönüşüm Kutusu'na taşınır (kalıcı silme yok); silinenler `Outputs/Checks/` altında tarihli listeye yazılır. Canlıya yazılmış partinin dışa aktarılan eski hâli (geri alma verisi) ve yazım kaydı kalır.

## Kapsam

Canlıdan salt okunur envanter (30 Ekim 2026; tek seferlik araç ve ayrıntısı git geçmişinde):

| | Soru |
|---|---:|
| Quiz sorusu (YKS + KPSS) | 47.686 |
| Kopyalar çıkarıldığında tekil (revize edilecek) | 43.005 |
| Kopyalar (temsilcinin revizyonunu alır; çoğu KPSS Önlisans → Ortaöğretim) | 4.681 |
| Kapsam dışı: SAT/ACT quiz soruları | 30 |

- Kaynak türü: System 45.540 · SinoAI (öğrenciye özel quiz) 883 · AdminTest (öğrenciye görünmez) 1.263.
- Revizyondan önceki yaygın sorunlar: hiçbir System sorusunda alt konu yok; 1.326 soruda altı çizgi ile "altı çizili" ifadesi tutmuyor; 1.591 soruda `**`/`__` kalıntısı; görsel atfı olup figürü olmayan sorular (13 Kasım sayımı: 2.222 test sorusu). Revize edilen her soru bunlardan arınır.

## Sıra

1. **YKS TYT:** Türkçe, Tarih, Coğrafya, Felsefe, Din, Matematik, Geometri, Fizik, Kimya, Biyoloji
2. **YKS AYT:** Türk Dili ve Edebiyatı, Tarih-1, Coğrafya-1, Tarih-2, Coğrafya-2, Felsefe, Psikoloji, Sosyoloji, Mantık, Din, Matematik, Geometri, Fizik, Kimya, Biyoloji
3. **KPSS Lisans:** Türkçe, Matematik, Geometri, Tarih, Coğrafya, Vatandaşlık
4. **KPSS Önlisans:** aynı dersler
5. **KPSS Ortaöğretim:** çoğu Önlisans kopyası; yalnız 260 tekil soru ayrıca yazılır

YDT kaldırıldı; YDT soruları revize edilmez. Her derste konu konu ilerlenir. Eksik görsel onarımında da sıra aynı: AYT bitmeden KPSS'ye geçilmez (sahip, 13 Kasım).

## Bir işin akışı

1. **Yazım.**
   - Tam revizyon: her soru çözülür, hata türü yazılır, soru düzeltilir ya da yeniden yazılır (doğru harf ve şık sayısı korunur). Konu üreticisi `Outputs/Quizzes/Work/` altında, `Tools/generator.py` ile `Revisions/` dosyalarını yazar. Okuma araçları: `show_topic.py`, `show_batch.py`, `show_sources.py`.
   - Eksik görsel onarımı: `Tools/visual_repair.py` Claude API'nin Batch moduyla yazdırır (aşağıda).
   - 9 Kasım'dan beri yeni toplu yazım Claude API ile yapılır (sahip: "bundan sonra API kullanacaksın"); ücretli her çalıştırma model ve tutar onayıyla.
2. **Denetim:** `Curriculum/Tools/check_revisions.py <ders> [--konu KONU]`: metin, altı çizili işaretleme ve çözüm kuralları; ardından **FigureCheck** (API'nin kendi kodu): motor görselini figüre çevirir, hazır resmi bağlar, metindeki görsel atıflarını ve kayıt denetimini çalıştırır. Hatalı soru çıktıya girmez.
3. **Figürleri motor çizer** (1 Kasım 2026 kararı):
   - Figür kayıtta motorun görseli olarak yazılır: `{"code","title","alt","visual"}` (şema `src/Components/Visuals/VisualSchema.ts`).
   - `render_figures.py <ders>` (onarımda `visual_repair.py ciz`) açık ve koyu tema SVG'lerini çizer ve `stills.json`'u yazar; denetim yeniden çalışır. Figürler telefon genişliğinde (≈360 px) gözle kontrol edilir.
   - Gereken öğe motorda yoksa soru sözele çevrilmez: kayda `motorIstegi` yazılır, öğe merkez oturuma iletilir, soru öğe gelene kadar canlıya yazılmaz.
4. **Canlıya yazım** (her parti ayrı onayla): resimler yüklenir (`upload_stills.py`), sorular Claude içerik API'siyle yazılır: dışa aktar → `dryRun` → yaz → geri oku. Ayrıntı [YazimKurallari.md](YazimKurallari.md#yazma). TYT 2 Kasım'da henüz SQL ile yazılmıştı (`build_sql.py`, `dry_run_sql.py`, `apply_sql.py`); AYT TDE'nin hazır SQL'i de API'ye çevrilecek.

### Eksik görsel onarımı (`visual_repair.py`)

Canlıda kökü tabloya, grafiğe, şekle atıf yapan ama figürü olmayan test soruları (13 Kasım 2026: 2.222 soru; AYT 1.178, KPSS Lisans 419, Önlisans 312, Ortaöğretim 312, TYT 1 yanlış alarm). Sahip: ara önlem yok, sorular testlerden çıkarılmaz, onarılır; her parti ayrı onayla; her parti sonrası api+web+mobile oturumuna sayılar bildirilir.

1. `sec <liste.csv> --sinav AYT`: hedefleri seçer; tam revizyonu biten konulardaki soruları (o revizyonla düzelir) ve daha önce onarılanları atlar.
2. `paket` → `gonder` → `topla`: Sonnet 5.5, Batch; doğru harfi değiştiren ya da JSON'u bozuk yanıt alınmaz.
3. `ciz`: figürler çizilir; şemaya uymayan figür hatasıyla kaydedilir.
4. `denetle`, `coz` → `topla-coz`: denetim ve **cevap görülmeden ikinci çözüm**; anahtarla tutmayan soru yazılmaz.
5. `paket|gonder|topla --duzelt`: şema, denetim, çözüm ve inceleme hataları önceki yanıtla geri gönderilir; 3–5 temiz olana kadar tekrarlanır.
6. `rapor`, örneklem incelemesi; `yukle`, `kuru`, `canli` (onayla).

Otomatik düzeltmeler: tablolarda `highlightColumn` (cevabı ele verir) ve makine görsellerinde hareket işaretleri kaldırılır; `{{fig:kod}}` kendi paragrafına alınır.

## Durum (14 Kasım 2026)

- **TYT:** 10 ders canlıda (2 Kasım 2026): 10.704 soru ve 583 motor figürü; 1.148 hazır resim. Her ders canlıdan geri okunarak doğrulandı.
- **AYT tam revizyon:** 22 konu (1.345 soru) revize edildi ve denetlendi (TDE 16/16, TAR1 4 konu, MAT_LIMIT, FIZ_TORK). Kuyruk `Outputs/Quizzes/Work/AYT/kuyruk.json` (254 konu bekliyor).
  - TDE canlıya hazır: 985 soru, 18 figür, 36 hazır resim; cevap anahtarı yanlış 82, birden çok doğrulu 90 soru. Ders raporu `Outputs/Quizzes/Results/YKS/YKS_AYT/TDE/DersRaporu.md`. Sahibin onayını bekliyor.
  - Kalan konular API ile yazılacak; araç henüz yok (Works'teki Batch kalıbı, tahmin 130–150 $, sahibin onayıyla).
- **Eksik görsel onarımı:**
  - AYT pilotu 18 soru canlıda (14 Kasım 2026, 00:16; 0,63 $): 9 düzeltildi, 9 yeniden yazıldı. Öğrenci bildirimi 49CDD64E'deki "Basit Makineler — Kolay" testi düzeldi.
  - AYT'nin kalan 1.076 sorusu onarılıyor (sahip 40 $ onayladı). İlk tur 15,39 $: 1.055 yanıt alındı, 21 soru düzeltme turunda.
  - KPSS (1.043): AYT bitince.
- **KPSS tam revizyon:** başlanmadı.

## Açık kalanlar

- **Motoru bekleyen sorular** (`motorIstegi`, canlıda eski hâlinde):
  - TYT 4: iki serili aylık sıcaklık çizgisi (COG_IKLIM), iki serili sütun ve çizgi grafiği (MAT), küre kesiti (GEO_KATI).
  - AYT FIZ_TORK 2 (`F8C8B41B`, `9EF9CC5A`): motor gerekli `lever` seçeneklerini 2 Kasım'da ekledi (iki destek, açılı ip); sorular bu seçeneklerle yeniden kurulacak.
- **AYT TAR_1900_OSM `32E96BE2`:** Balkan haritasında Midye–Enez çizgisi Karadeniz kıyısına değmiyor; çizgi iki kıyıya uzatılacak (cevap etkilenmiyor).
- **TYT hazır resimlerinin yazı boyutu:** motor 2 Kasım'dan beri 28 pikselin altında yazı bırakmıyor; canlıdaki 1.148 TYT resmi eski boyutla çizildi. Yeniden çizim yükleme ve yazım ister (sahibin onayıyla).
- **Sahibin kararı bekleyen:** TYT Fizik'te figür payının artırılması (elektrostatik 19/150, dalgalar 10/95, ısı 11/90) ve adsız geometri problemlerinde figür.
- **Çözüm adımları:** 8 Kasım toplantı konusu; çözüm biçimi kararı gelene kadar değiştirilmez. Testlerde "Kavram / Uygulama / Sınav tarzı" aşaması önerildi, karar verilmedi.

## Revizyon geçmişi

| Revizyon | Tarih | Değişiklik |
|---|---|---|
| 1 | 30 Ekim 2026 | İlk sürüm: kapsam, sıra, bir dersin akışı (Desktop/EgitimVerileri/SoruRevizyon). |
| 2 | 1 Kasım 2026 | Çalışma motora taşındı; araçlar İngilizce adlandı; figürler motordan gelir; YDT çıkarıldı; durum bölümü. |
| 3 | 1 Kasım 2026 akşamı | Motor figürü hattı kuruldu (`figure_to_visual.py`, `render_figures.py`, `RenderFigures.ts`, FigureCheck'te API'nin çeviricisi, SQL'de hazır resim sütunları). TYT'nin 139 figürü motora taşındı. |
| 4 | 1 Kasım 2026 gecesi | TYT figür turu: 444 figür, `geometry_figures.py` (ölçekli geometri), `apply_figures.py`, FigureCheck'te ölçek denetimi. |
| 5 | 2 Kasım 2026 | TYT'nin tamamı canlıda. AYT başladı: konu bazlı paralel iş, `check_revisions --konu`, `fig="motor:…"`. |
| 6 | 14 Kasım 2026 | Eksik görsel onarımı (`visual_repair.py`, Claude API Batch; pilot 18 soru canlıda). Ölü kopya kuralı; eski ön izleme ve yedekler Geri Dönüşüm Kutusu'na (liste `Outputs/Checks/2026-11-14-Quiz-Temizlik.md`). |
| 7 | 14 Kasım 2026 | Belgeler sadeleşti: envanter, TYT figür raporu ve AYT raporu bu plana katıldı (ayrıntı git geçmişinde); canlıya yazım API ile; durum ve açık kalanlar güncellendi. |
