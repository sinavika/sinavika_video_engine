# Sınavika adlandırma kuralları

Bu belge API, web ve mobil için ortaktır. Üç projenin `docs/` klasöründe aynı içerikle durur.

**Tarih:** 15 Ekim 2026 · v2 (sekme yuvaları ve feed kararı güncellendi)
**İlgili belgeler:** `BrandIdentity.md` (ses ve dil), `Modul-Kimligi.md` (renk ve merkezi kod), `UIUX-Rehberi.md` (tasarım sistemi), `UIUX-Denetim.md` (bulgular), `Ekran-Envanteri.md`

## 1. Temel kural

Her özelliğin iki adı vardır.

| | Kod adı | Görünen ad |
|---|---|---|
| Nerede | Klasör, servis, controller, route, DTO, analytics olayı, depolama anahtarı | Ekran, menü, buton, bildirim, e-posta, mağaza, site, sosyal medya |
| Dil | İngilizce, tek kalıp | Kullanıcının dili (TR, EN, DE, NL) |
| Kim belirler | API ile frontend birlikte; API'deki ad esastır | Bu belge ve `BrandIdentity.md` |
| Değişir mi | Yalnız gerçek bir hata varsa, uyumluluk katmanıyla | Ürün kararıyla, tüm yüzeylerde aynı anda |

1. **Kod adları üç projede aynıdır.** API `Flashcards` ise web `features/flashcard`, mobil `modules/flashcard` olur.
2. **Görünen ad kodda yazılmaz.** Metinler i18n kataloglarından gelir (web `src/i18n/messages`, mobil `src/core/i18n`). Bileşende sabit Türkçe metin olmaz.
3. **Kod adı kullanıcıya gösterilmez.** "Lens", "Works", "Compass", GUID, enum adı, ham hata metni ("Not Found") hiçbir ekranda görünmez.
4. **Bir görünen ad tek bir şeyi anlatır.** Aynı modül web'de ve mobilde farklı adla anılmaz.

## 2. Modüller: kod adı ↔ görünen ad

| Görünen ad (TR) | EN | DE | NL | API (klasör · route) | Web (`src/features`) | Mobil (`src/modules` · prefix) |
|---|---|---|---|---|---|---|
| **Denemeler** | Practice exams | Probeprüfungen | Oefenexamens | `Exams`, `ExamStudents`, `Scorings`, `QuestionSolutions`, `Statistics` · `/api/StudentExamStudent`, `/api/students/statistics` | `exams`, `exam-sessions`, `exam-results`, `question-solutions`, `statistics` | `exam` · `Exam` |
| **Dersler** | Lessons | Lektionen | Lessen | `Works` (+ `Lessons` ağacı) · `/api/student/works`, `/api/student/works/learning-paths` | `works` | `works` · `Work` |
| **Testler** | Quizzes | Quizze | Quizzen | `Quizzes` · `/api/student/quizzes` | `quizzes` | `quiz` · `Quiz` |
| **Ders Planı** | Study plan | Lernplan | Studieplan | `StudyPlans` · `/api/student/study-plan` | `study-plan` | `studyPlan` · `StudyPlan` |
| **Akıllı Özet** | Smart Summary | Smart Summary | Smart Summary | `Lenses` · `/api/student/lens/sessions` | `lens` | `lens` · `Lens` |
| **Bilgi Kartları** | Flashcards | Lernkarten | Flashcards | `Flashcards` · `/api/student/flashcard` (`/feed` uçları kaldırılacak) | `flashcard` | `flashcard` · `Flashcard` |
| **SinoAI** | SinoAI | SinoAI | SinoAI | `SinosAI` → **`SinoAI`** (bkz. §5) · `/api/student/sino-ai` | `sinoai` | `sinoai` · `SinoAi` |

### Modül içi sekme adları

Her modülün alt çubuğu (mobil) ve üst sekmeleri (web) aynı yuvaları kullanır. Yuva kuralı `UIUX-Rehberi.md` §2'de.

| Modül | 1 · Modülün kendisi | 2 · Ana işi | 4 · Geçmiş ve kayıtlar |
|---|---|---|---|
| Denemeler | Denemeler | Denemelerim | Sonuçlar |
| Dersler | Dersler | Konu ağacı | Geçmiş |
| Testler | Testler | Konular | Çözümler |
| Ders Planı | Bugün | İlerleme | Program |
| Akıllı Özet | Akıllı Özet | Soru yükle | Video |
| Bilgi Kartları | Kartlar | Bugün | Kaydedilenler |

Yuva 3 her zaman **Modüller**, yuva 5 her zaman **Profil**'dir. SinoAI tam ekran açılır, alt çubuğu yoktur.

Ana ekran **Modüller**'dir (hub): üstte modül slaytları, altında modül kartları; tab bar yoktur. Bildirimler üst sağdaki zilde, Profil üst soldaki kişi simgesinde ve her modülün 5. yuvasında.

## 3. Artık kullanılmayan görünen adlar

| Eski ad | Nerede görüldü | Yerine | Not |
|---|---|---|---|
| Lens, Lens AI Analiz | Web menüsü, site metinleri, mobil sekme | **Akıllı Özet** | 15 Ekim kararı (1-B). `Lens` yalnız kodda kalır. |
| Compass, Pusula | Eski mobil modül, site metinleri | **Ders Planı › İlerleme** | Mobilde eski rotalar `StudyPlanProgress`'e yönleniyor. |
| Ders Çalış | Web menüsü ve SEO metinleri | **Dersler** | Fiil olarak ("ders çalış") buton ve sloganda kullanılabilir. |
| Kelime Kartları, Knowledge cards | Web, mobil EN | **Bilgi Kartları** / Flashcards | |
| Sınavika AI | Web | **SinoAI** | |
| Sınavlarım | Web menüsü, mobil deneme sekmesi | **Denemelerim** | §4'teki "deneme / sınav" ayrımı. |
| Sınav takvimi | Web menüsü | Denemeler › Denemelerim (takvim) ve Ders Planı › Program | Ayrı menü olmaz. |
| Sınav sonuçları, Soru çözümleri, İstatistik (ayrı menüler) | Web menüsü | Denemeler › Sonuçlar (çözümler ve istatistik bu sekmenin içinde) | |
| Daha fazla | Mobil deneme sekmesi | Kalkar. Hakkında ve Destek **Profil**'e taşınır. | |
| Ana sayfa / Ana Sayfa / Anasayfa | Mobil modül sekmeleri | Yuva 1'de **modülün adı** (Denemeler, Dersler, Testler…); ana ekran **Modüller** | Yazım farkları da biter. |
| Analiz (ayrı modül) | Eski marka belgesi | Denemeler › Sonuçlar | Analiz bir modül değildir. |
| Kalan kredi | Mobil | Somut kota: "Akıllı Özet bu ay 7 / 30" | |
| Koç, koçun, coach | Mobil katalog, içerik türü "Koç İpucu" | SinoAI, çalışma planı, İpucu | İnsan koç hizmeti yok. |

## 4. Kelime kuralları

| Kavram | Kullan | Kullanma | Örnek |
|---|---|---|---|
| Sınavika'da çözülen deneme | **deneme** | sınav | "TYT Deneme 5", "Denemelerim", "Denemeye başla" |
| Öğrencinin hedeflediği gerçek sınav | **sınav** | deneme | "YKS'ye 214 gün", "Hangi sınava hazırlanıyorsun?" |
| Bir konu için kısa soru seti | **test** | quiz (TR'de) | "Problemler · Seviye 2 testi" |
| SinoAI'nin ürettiği soru seti | **quiz** | test | "Notlarından quiz üret" (üretilen içerik olduğu için) |
| Deneme sonrası konu dökümü | **analiz** (ortak ad) | rapor, karne | "Eksik konu analizi" |
| Sorunun fotoğrafından çözüm | **Akıllı Özet** (modül), **analiz** (tek kayıt) | Lens, tarama | "Son analizlerin" |
| Kişisel çalışma programı | **plan** | program, takvim (takvim ayrı sekme) | "Bugünün planı" |
| Seri | **seri** | streak | "5 günlük seri" |
| Kullanıcı | **sen** | siz | Ses kuralları `BrandIdentity.md` §3'te. |

Rakamlar ve birimler: `78,5 net`, `%40`, `₺299`, `12.480 kişi`, `1 sa 20 dk`, `25 dk`. Tarihler: `15 Ekim`, `Cumartesi 17 Ekim · 10:00`.

## 5. Kod adlarında düzeltilecekler

Bu maddeler kullanıcıya görünmez. Yine de üç proje arasındaki tutarlılığı bozdukları için düzeltilmelidir. Her biri ayrı bir PR'dır; dış sözleşme (route, JSON alanı, analytics olayı) bozulmaz.

| # | Yer | Sorun | Öneri | Risk |
|---|---|---|---|---|
| 1 | API `Services/SinosAI`, `API/Controllers/SinosAI`, `Entity/SinosAI`, `Data/Dtos/SinosAI`, `API/Helpers/SinosAI` | Klasör ve namespace "SinosAI"; içerideki tipler ve tablolar "SinoAI" (kodda ~13.500 "SinoAI", ~2.600 "SinosAI"). | Klasör ve namespace → `SinoAI`. Route `/api/student/sino-ai` aynı kalır. | Düşük: yalnız derleme. Tablo adları zaten `SinoAI*` (ör. `SinoAIConversations`); migration gerekmez. |
| 2 | API `WorkerSinoAi` | Prefix `SinoAi` (mobil prefix ile aynı, API ile farklı). | API'de `SinoAI`, TypeScript'te `SinoAi` kalıbı yazılı kural olsun (C# kısaltma geleneği `AI`, TS PascalCase `Ai`). | Yok: yalnız kural. |
| 3 | API `Works` ↔ görünen ad "Dersler", API `Lessons` ↔ konu ağacı | "Lesson" iki anlamda: modül adı ve konu ağacı. | Kod adları kalır. Belgelerde: **Works = Dersler modülü**, **Lessons = konu ağacı verisi** (LessonMain/Sub/Mikro). | Yok. |
| 4 | API `Quizzes` ↔ SinoAI quiz üretimi | "Quiz" hem Testler modülü hem SinoAI üretim türü. | Kod adları kalır. SinoAI üretim türü belgelerde "SinoAI quiz" olarak ayrılır. | Yok. |
| 5 | Mobil eski rotalar (`Pusula*`, `Compass*`, `Feed*`, `Works*`) | Uyumluluk tablosunda. | Tablo kalsın; yeni kodda yalnız canonical adlar. Bir sonraki büyük sürümde kaldırma planı. | Düşük. |
| 6 | Feed / Akış kodu (API `/api/student/feed`, `AdminFeed`; mobil `Feed*` uyumluluk rotaları; web `flashcard` içindeki feed parçaları) | Ürün akışı kaldırdı; kod kaldı. | Ölü kod silinir; uyumluluk rotaları bir sürüm boyunca `FlashcardToday`'e yönlenir. | Düşük. |
| 7 | Web `studentHasCompassAccess` oturum anahtarı | Eski modül adı. | Ders Planı erişimine bağlanmışsa `studentHasStudyPlanAccess`; okunurken eski anahtar bir sürüm boyunca desteklenir. | Düşük. |

## 6. Yeni bir özellik adlandırırken

1. Kod adını API ile birlikte seç; İngilizce, tekil kök (`Flashcard`, `StudyPlan`).
2. Görünen adı bu belgedeki tabloya ekle (TR, EN, DE, NL).
3. Var olan bir modülün içindeyse yeni modül açma; sekme ya da kart olarak ekle.
4. Marka adı yaratma. Marka adı yalnız **Sınavika** ve **SinoAI**'dir.
5. Metni i18n kataloğuna yaz, bileşene yazma.
6. `BrandIdentity.md` §16 kontrol listesinden geçir.
