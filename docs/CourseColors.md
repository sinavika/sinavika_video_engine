# Ders renkleri

Eğitim videolarında (kamp dersleri, reels, kapaklar) her dersin kendi rengi vardır. Öğrenci bir dersi rengiyle tanır: YouTube kanal sayfasında Türkçe dersleri pembe kapaklarla, Matematik dersleri mavi kapaklarla sıralanır.

Bu dosya kuralları ve 25 Ekim 2026 denetiminin sonucunu anlatır. Renklerin tek kaynağı koddur: [`COURSE_LESSON_COLORS`](../src/Configurations/LessonColors.ts). Burada bir rengi değiştirmek hiçbir şeyi değiştirmez.

## 1. Renk tablosu

Tüm renkler koyu tonlardır ve üzerinde beyaz yazı taşır. Yakın dersler aynı tonun farklı koyuluklarını alır (Matematik ve Geometri ikisi de mavi). Durum renkleri (kırmızı hata, yeşil doğru) ve mor kullanılmaz.

| Kod | Ders | Renk | Kullanıldığı kategoriler |
|---|---|---|---|
| `TRK` | Türkçe | `#BE185D` pembe | TYT, KPSS (üçü) |
| `TDE` | Türk Dili ve Edebiyatı | `#9D174D` koyu pembe | AYT |
| `MAT` | Matematik | `#1E40AF` mavi | TYT, AYT, KPSS (üçü) |
| `GEO` | Geometri | `#0369A1` açık mavi | TYT, AYT, KPSS (üçü) |
| `FIZ` | Fizik | `#0F766E` deniz yeşili | TYT, AYT |
| `KIM` | Kimya | `#155E75` petrol | TYT, AYT |
| `BIO` | Biyoloji | `#4D7C0F` yaprak yeşili | TYT, AYT |
| `TAR`, `TAR1` | Tarih, Tarih-1 | `#8A4B16` kahve | TYT, KPSS / AYT |
| `TAR2` | Tarih-2 | `#6B3A12` koyu kahve | AYT |
| `COG`, `COG1` | Coğrafya, Coğrafya-1 | `#4D6B1A` zeytin | TYT, KPSS / AYT |
| `COG2` | Coğrafya-2 | `#3F5714` koyu zeytin | AYT |
| `FEL` | Felsefe | `#475569` arduvaz | TYT, AYT |
| `PSI` | Psikoloji | `#4B5A82` gri mavi | AYT |
| `SOS` | Sosyoloji | `#52606D` gri | AYT |
| `MAN` | Mantık | `#334155` koyu arduvaz | AYT |
| `DIN` | Din Kültürü | `#5E5A3A` haki | TYT, AYT |
| `VAT` | Vatandaşlık | `#7A2E2E` bordo | KPSS (üçü) |
| `ING` | İngilizce | `#0E7490` camgöbeği | YDT |
| `ALM` | Almanca | `#155E75` petrol | YDT |
| `ARA` | Arapça | `#0F5F5A` koyu yeşil | YDT |
| `FRA` | Fransızca | `#1D5E8A` çelik mavi | YDT |
| `RUS` | Rusça | `#2B5A7A` koyu çelik | YDT |

Koyu temada renk beyaza doğru açılır, böylece koyu zeminde de okunur (`courseLessonTheme`).

## 2. Kurallar: bir ders videosunda bir vurgu rengi vardır

Bir ders videosunda **vurgu rengi dersin rengidir**. Marka turuncusu yalnız markayı gösterir.

| Öğe | Renk | Kodda nerede |
|---|---|---|
| Kapak zemini | Ders rengi | `Thumbnails/CampCover` |
| Kamp kartı (SinoAI karşılaması), bölüm açılışları | Ders rengi, tam ekran | `CampCardScene`, `SectionScene` |
| Kalın yazı (`**…**`): kartlar, soru şıkları, özet | Ders rengi | `courseLessonTheme`: `canvasAccent` ve `primaryText` |
| Ders etiketi, kart rozetleri, doğru şık, "Cevap" | Ders rengi | tema `lesson` |
| Karşılaştırma sütunları, Venn kümeleri | Ders rengi → koyu lacivert → dersin koyu tonu | `COMPARISON_ACCENTS` (StructureVisuals) |
| Akış ve döngü şeması: vurgulanan adım ve numaralar | Ders rengi | `DiagramNode` |
| Bölüm çubuğu (alttaki ilerleme) | Ders rengi | `ChapterBar` |
| "Sıradaki ders" kartı, kamp görevi numaraları | Ders rengi | `CampTaskScene` |
| Logo | Marka turuncusu | `BrandMark` |
| Kapanış (uygulama tanıtımı, mağaza düğmeleri) | Marka turuncusu | `CoursePromotionScenes` |
| Şekillerde ikinci seri (grafikte ikinci eğri, nokta, açı, kuvvet) | Marka turuncusu | `palette.brand` (VisualFrame) |

Şekillerde turuncu, ders rengiyle karıştırılmaması gereken ikinci bir şeyi gösterir (iki eğri, iki kuvvet). Yazıda ve kategori renginde turuncu kullanılmaz.

Yeni bir öğe yazarken:
- Ders rengini `colors.lesson` ya da `palette.lesson` ile al.
- Koyu ton gerekiyorsa `palette.lessonDeep` kullan.
- Hex kodu elle yazma.
- `colors.primary` yalnız marka öğesi içindir.

## 3. Reels'te renk

Kamp reels'i (`CampShort`) Reels kartlarının "Ses Olayları" görünümünü kullanır. Bu görünümde ders ailesinin rengi gelir (`LESSON_GROUPS`, `lessonTheme`): sözel dersler bir aile, sayısal dersler bir aile gibi. Kampa özgü öğeler ders rengindedir:
- üst çubuktaki kamp rozeti;
- reels kapağı (`CampCover`, dikey).

## 4. Denetim: 25 Ekim 2026

İlk kamp dersi (TYT Türkçe, Sözcükte Anlam) izlenirken sorulan "her ders için bir renk şablonu var mı, ona göre gidildi mi?" sorusunun cevabı:

**Tablo vardı ve bütün YKS ve KPSS dersleri kapsanıyordu** (24 kod; YDT dilleri dahil). Ama videonun birçok yerinde ders rengi yerine marka turuncusu kullanılıyordu. Hepsi düzeltildi:

| Bulgu | Düzeltme |
|---|---|
| Kalın yazılar turuncuydu (kartlarda `primaryText`, düz zeminde `canvasAccent`) | Ders temasında ikisi de ders rengi |
| Karşılaştırmanın ikinci sütunu turuncuydu | Sütunlar ders rengi, lacivert, dersin koyu tonu |
| Akış şemasında vurgulanan adım turuncuydu, numaralar gökkuşağı renklerindeydi | Ders rengi |
| Kamp kartı ve "Sıradaki ders" kartı turuncuydu | Ders rengi |
| Kapak turuncu zemindeydi, ders rengi yalnız bir sözcüğün altında vardı | Yeni kamp kapağı: zemin ders renginde |

**Karar (sahip, 25 Ekim 2026):**
- Kimya (`KIM`) ile Almanca (`ALM`) aynı renkte (`#155E75`) kalıyor. İkisi farklı sınavlarda (TYT/AYT ve YDT), bu yüzden aynı kanalda yan yana çok gelmezler.
- `TAR` ile `TAR1`, `COG` ile `COG1` bilerek aynı renkte: aynı dersin TYT ve AYT hâlleri.
