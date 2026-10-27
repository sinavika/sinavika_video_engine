# Kapsam denetimi: MEB ve ÖSYM'ye göre eksikler

27 Ekim 2026. Amaç: [docs/Courses.md §0](../../docs/Courses.md#0-amaç). Ders videolarının kapsamını piyasa değil MEB kazanımları ile ÖSYM'nin soruları ve kılavuzları belirler. Bu belge, konu listemizi (`Curriculum/Catalog`, kaynağı `lesson.csv`) ve yazılmış senaryoları bu iki kaynağa göre denetler.

## 1. Kaynaklar

| Kaynak | Ne verir | Nerede |
|---|---|---|
| MEB TTKB, 2026 YKS'ye esas kazanımlar (26 Kasım 2025) | Ders ve sınıf bazında kazanımlar | [`Curriculum/Sources/MEB`](../Sources/MEB/README.md) |
| MEB'in ÖSYM çıkmış soru derlemeleri (havuzda) | TYT, AYT, YDT 2018–2026 bütün sorular; yıl ve MEB'in konu başlığıyla | `Curriculum/Data/YKS/*/Sorular` (`source.publisher = ÖSYM`) |
| ÖSYM KPSS kitapçıkları (havuzda) | KPSS GY-GK: Lisans 2009–2021, Önlisans ve Ortaöğretim 2014–2020 | `Curriculum/Data/KPSS/*/Sorular` |
| **ÖSYM 2026 KPSS kılavuzları (bugün indirildi)** | Lisans, Ön Lisans ve Ortaöğretim için Tablo-1 "Testlerin kapsamı" | `Desktop\VeriKaynaklari\KPSS\Kilavuz\osym-2026-kpss-{lisans,onlisans,ortaogretim}-kilavuz.pdf` (+ `.txt`) |
| **ÖSYM çıkmış sorular listesi** (27 Ekim) | Her soru LessonMain → LessonSub → LessonMikro, yıl, MEB başlığı, cevap, MEB video çözüm | `Curriculum/Data/<Sınav>/<Kategori>/CikmisSorular/<Ders>.jsonl` + `CikmisSorular.xlsx`; üretim `python -m sourceparsing cikmis` |
| Soru dağılımı tabloları (bugün üretildi) | Sınav → ders → konu → yıl soru sayısı; hiç soru eşlenmeyen alt başlıklar | [`SoruDagilimi/`](SoruDagilimi/) (`build-osym-distribution.py` ile yeniden üretilir) |

**İndirilemeyenler:**
- **2026 YKS kılavuzu:** ÖSYM sunucusu dosyayı yalnız tarayıcı indirmesiyle veriyor. Bağlantı: <https://dokuman.osym.gov.tr/pdfdokuman/2026/YKS/basvuru_kilavuz06022026.pdf>. Test yapısı aşağıda haberlerden ve havuzdaki yıl başına soru sayılarından doğrulandı.
- **KPSS 2022–2026 soruları:** 2022 sonrası ÖSYM kitapçıkları metin olarak ayrıştırılamıyor (bkz. `sinavika_parse`). Bu yüzden havuzda yok.

## 2. Sınav yapısı (resmî)

**YKS 2026:**
- TYT 120 soru, 165 dk: Türkçe 40, Sosyal 20 (Tarih 5, Coğrafya 5, Felsefe 5, Din 5), Temel Matematik 40, Fen 20 (Fizik 7, Kimya 7, Biyoloji 6).
- AYT 160 soru, 180 dk.
- YDT 80 soru, 120 dk.
- Havuzdaki 2024–2026 TYT sayıları bu yapıyla uyumlu: Türkçe 33–40, Matematik + Geometri 36–40, Fizik 5–7, Kimya 6–7. Eksik kalanlar şekilli sorular ve yılı yazılmamış sorulardır.

**KPSS 2026 (üç düzeyde aynı, Tablo-1):**
- **Genel Yetenek:** Sözel %50 (sözel akıl yürütme, dil bilgisi, yazım) · Sayısal %50 (sayısal ve mantıksal akıl yürütme).
- **Genel Kültür:**
  - Tarih %45: Osmanlı öncesi %5, Osmanlı %15, Atatürk ilkeleri ve inkılap tarihi %20, **Çağdaş Türk ve Dünya tarihi %5**.
  - Türkiye coğrafyası %30: fiziki %12, beşerî %5, ekonomik %13.
  - Temel yurttaşlık %15: hukuk başlangıcı %5, anayasa ve insan hakları %5, idare %5.
  - Güncel konular %10.

## 3. Gelecek

- **2027 YKS:** Kılavuz ve MEB kazanım belgesi henüz yok. Kazanım belgesi geçen yıl kasım sonunda, kılavuz şubatta çıktı. ÖSYM'nin 2027 sınav takvimi de yayımlanmadı. Belgeler çıkınca bu denetim yenilenir.
- **2028 ve sonrası:** MEB, Maarif Modeli'ne uygun beceri ve bağlam temelli soruların YKS'de 2028'den itibaren kullanılacağını açıkladı (Bakan Yardımcısı Ö. F. Yelkenci; haber kaynakları). Sınav yapısında değişiklik açıklanmadı. Yeni müfredattan çıkan konular sınavdan da çıkacak. 2028 adayları için konu listesi yeni programla yeniden karşılaştırılmalı.

## 4. Bulgular

### A. Konu listesinde eksik

| # | Sınav | Eksik | Dayanak | Öneri |
|---|---|---|---|---|
| A1 | KPSS (üç düzey) | **Çağdaş Türk ve Dünya Tarihi** (II. Dünya Savaşı sonrası Türkiye ve dünya, Soğuk Savaş, küreselleşme) | Kılavuz Tablo-1: GK'nin %5'i (yaklaşık 3 soru). Lisans listesi Atatürk dönemi dış politikada, Önlisans ve Ortaöğretim listesi Cumhuriyet dönemi dış politikada bitiyor | Tarih'e konu olarak ekle |
| A2 | KPSS (üç düzey) | **Sayısal mantık / sayısal akıl yürütme** (tablo-grafik yorumlama, şekil ve sayı örüntüleri) | Kılavuz: GY Sayısal "sayısal ve mantıksal akıl yürütme". Türkçe'de "Sözel Mantık" var, Matematik'te karşılığı yok | Matematik'e konu olarak ekle |
| A3 | AYT Matematik | **Dönüşümler** (analitik düzlemde öteleme, dönme, simetri) | MEB 12.4.1; MEB derlemesinde 2018–2026 arası 8 ÖSYM sorusu (şimdi Fonksiyon/Türev'e dağılmış) | AYT Matematik'e konu olarak ekle |
| A4 | TYT Geometri | **Dik üçgende trigonometrik oranlar** (alt başlık) | MEB 9.4.4.3; MEB derlemesinde "Dik Üçgen ve Trigonometri" başlığıyla 11 soru, Pisagor alt başlığına kodlanmış | Özel Üçgenler'e alt başlık ekle |
| A5 | TYT Türkçe | Standart dil, ağız, şive, lehçe, argo, jargon | MEB 9. sınıf; 2018–2026 TYT'de doğrudan soru yok | Ayrı ders gerekmez; bir derse kart olarak girer |

**Durum (27 Ekim 2026):** A1–A4 sahibin onayıyla `lesson.csv`'ye ve kataloğa eklendi. Kimlikler ve backend'e aktarım: [DersListesiEklemeleri.md](DersListesiEklemeleri.md). A5 bekliyor; ayrı konu açılmayacak.

### B. Konu var, senaryoda eksik (yazılmış 5 TYT Türkçe dersi)

ÖSYM'nin 2018–2026 TYT soru kökleri, senaryolardaki soru ve kartlarla karşılaştırıldı.

| # | Ders | Eksik | ÖSYM'de | Öneri |
|---|---|---|---|---|
| B1 | 05 Paragraf, "Anlatımın özellikleri" | Anlatım unsurlarının listesi: **kişileştirme, benzetme, mecazlı söyleyiş, ikileme, niteleme, karşılaştırma, öznellik, örnekleme, tartışma** | "Bu parçanın anlatımında aşağıdakilerden hangisi yoktur?" 2018 (iki soru), 2020; şıklar tam bu sözcükler | Bölüme bu unsurlar ve her birinin tanınma ölçütü eklenir |
| B2 | 01 Sözcükte Anlam | "Altı çizili sözü anlamca karşılayabilecek kullanım hangisidir?" soru tipi | 9 yılda 4 kez | Bağlamdaki anlam bölümüne bir çözümlü soru |
| B3 | 01 Sözcükte Anlam | Sınavdaki yeri ve soru tipleri | MEB başlığı "Sözcükte Anlam": 9 yılda 33 soru (yılda 3–4). Tipler: boşluk doldurma, ayraçtaki anlam uyuşmazlığı, altı çizili sözün karşılığı, sözcüğün belirtilen anlamda kullanılması, altı çizili sözle anlatılmak istenen | Dersin açılışında bu sayı söylenebilir; kaynaklar uyumlu |

**Durum (27 Ekim 2026):**
- **B1 yapıldı:** Paragraf'ın "Anlatımın özellikleri" bölümüne üç kart eklendi: söyleyiş unsurları tablosu (7 unsur), "kişileştirme de bir mecazdır" hata kartı ve ÖSYM kalıbında özgün bir soru. Özete bir uyarı eklendi.
- **B2 yapıldı:** Sözcükte Anlam'ın bağlam bölümüne "koyu yazılmış sözcüğü anlamca karşılayan kullanım" sorusu eklendi ("çekmek").
- **Denetim:** Paragraf ~27 dk, 8 çözümlü soru; Sözcükte Anlam ~18 dk, 5 çözümlü soru. İkisi de `check`ten geçti; kareler kontrol edildi.
- **Yayın:** Sözcükte Anlam'ın YouTube videosu bu eklemeden önce render edildi ve yayında. Video ancak yeniden render edilirse yeni soruyu içerir.
- **B3:** Bekliyor.

**Önceki bir önerinin düzeltmesi.** Kinaye, tariz, ad aktarması ve deyim aktarması 2018–2026 TYT'de doğrudan hiç sorulmadı. Bunlar AYT Edebiyat konusudur; AYT listemizde "Söz Sanatları" var ve 9 yılda 10 ÖSYM sorusu çıkmış. Bu yüzden Sözcükte Anlam dersine eklenmeleri gerekmez. TYT'de gereken B1'deki anlatım unsurlarıdır.

### C. Listede olup sınavda sorulmayan ya da öncelik

Bunlar dersten çıkarılmaz; MEB kazanımında oldukları sürece anlatılır. Ama sürenin ve sıranın kararı bu sayılara dayanmalı:
- **AYT'de TYT'den taşınmış konular:** 2018–2026 AYT'de hiç soru yok.
  - Kimya: Kimya Bilimi, Kimyanın Temel Kanunları, Maddenin Halleri, Karışımlar, Doğa ve Kimya, Kimya Her Yerde.
  - Matematik: Rasyonel Sayılar, Üslü Sayılar, Köklü Sayılar, Oran Orantı, Veri–İstatistik.

  AYT kampında bunlara ayrı video yapılmaz; TYT dersine yönlendirilir.
- **TYT'de soru eşlenmeyenler (2018–2026):**
  - Matematik: 2. Dereceden Denklemler (0), Polinomlar (1), Modüler Aritmetik (1).
  - Tarih: 22 konudan 10'u. Sorular Millî Mücadele, İlk ve Orta Çağlarda Türk Dünyası ile Türk-İslam devletlerinde toplanıyor.
  - Coğrafya: 19 konudan 7'si.
  - Geometri: Ek Çizimler, Açıortay, Üçgende Merkezler, Paralelkenar.
- **KPSS Önlisans/Ortaöğretim "Değerlendirme":** Bir konu değil, karma test setleri. Video konusu olarak sayılmamalı.

### D. Veri eksikleri

| # | Eksik | Etki | Çözüm |
|---|---|---|---|
| D1 | KPSS 2022–2026 ÖSYM soruları (Lisans 2022/2024/2026, Önlisans ve Ortaöğretim 2022/2024/2026; 2026 Ortaöğretim kitapçığı 25 Ekim'de çıktı) | KPSS dağılımı son beş yılı göstermiyor | Kitapçıklar görüntüden okunmalı (ücretli görsel okuma) ya da yayınevlerinin çözümlü çıkmış soru kitapları kaynak eklenmeli. Sahibin kararı |
| D2 | Yılı yazılmamış ÖSYM soruları: TYT 149, AYT 278, YDT 9 | Yıl başına sayılar biraz düşük çıkıyor | Yıl, MEB derlemesindeki kutudan okunabilir (`VeriDuzeltmeleri.md` #9) |
| D3 | Alt başlık eşlemesi gürültülü (TYT ÖSYM sorularının 244'ü "inceleme bekliyor") | "Hiç soru eşlenmeyen alt başlıklar" sütunu kesin değil | Kural tabanlı yeniden eşleme (`VeriDuzeltmeleri.md` #8 ile aynı iş) |
| D4 | MEB kazanım belgesinde Mantık, Sosyoloji, Psikoloji okunamadı | AYT Felsefe grubu denetlenemedi | Sayfalar görüntüden okunmalı |

## 5. Senaryo yazarken kullanım

1. `SoruDagilimi/osym-soru-dagilimi-<sınav>.md` içinden konunun satırına bak: yılda kaç soru, hangi yıllar.
2. Havuzda konunun ÖSYM sorularının köklerini çıkar. Her soru tipi derste en az bir çözümlü soru ya da kartla temsil edilsin.
3. MEB kazanımındaki her madde senaryoda bir bölüm ya da kart olsun.
4. Sınavdaki yerini söylerken bu tablolardaki sayıyı kullan. Kaynaklar çelişiyorsa sayı söyleme.
