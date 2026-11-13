# Geliştirme Rehberi

## İki üretim alanı, tek tasarım sistemi

| | Video | Görsel |
| --- | --- | --- |
| Şablon modeli | `Templates/TemplateDefinition.ts` | `Images/ImageTemplateDefinition.ts` |
| Kayıt | `Templates/TemplateRegistry.ts` | `Images/ImageTemplateRegistry.ts` |
| İş şeması ve doğrulama | `Renderers/VideoJob.ts` | `Images/Renderers/ImageJob.ts` |
| Renderer | `Renderers/VideoRenderer.ts` | `Images/Renderers/ImageRenderer.ts` |
| Composition kaydı | `Compositions/TemplateCompositions.tsx` | `Compositions/ImageCompositions.tsx` |
| Komut | `npm run render` | `npm run image` |

Ortak olanlar: `Themes/` (temalar, token'lar, paletler, fontlar), `Components/` (tipografi, yerleşim, ikon, logo),
`Configurations/` (marka, ses, formatlar), `Schemas/` (zengin metin, görsel), `Services/OutputFile.ts`.

Video kodu bulunduğu yerde bırakıldı (`src/Templates`, `src/Renderers`, `src/Scenes`); bir `src/Videos/` klasörüne
taşınmadı. Taşıma, çalışan video akışında onlarca import'u değiştirip hiçbir davranış kazandırmayacaktı. Ayrım
klasör adıyla değil bağımlılık yönüyle kuruldu: görsel tarafı video şablonlarını, sahnelerini ya da kaydını
import etmez; video tarafı da `src/Images` altındaki hiçbir şeyi. İkisi yalnızca ortak katmanda buluşur.

Görsel tarafının videodan aldığı iki şey vardır ve ikisi de altyapıdır: derlenmiş paket (`bundleProject`) ve
doğrulama hatası sınıfı (`VideoJobValidationError`).

### Render süresi ve ilerleme göstergesi (10 Kasım 2026)

**Başlamadan önce:** `npm run render` tahmini süreyi ve bitiş saatini yazar. Örnek:

```
Tahmini süre: ~1 sa 27 dk (3840x2160, 56.490 kare = 31 dk video; son 3 render'a göre). Bitiş ~15:36.
```

Tahmin `Outputs/Checks/RenderTimes.jsonl` dosyasındaki eski render'lardan gelir. Her tam render bittiğinde buraya kare başına süresini yazar. Aynı boyut ve aynı şablon önce aranır; ortanca değer kullanılır. Kayıt yoksa dayanak ilk ölçümdür: TYT Matematik 02, 4K, 56.490 kare, 5.273 sn.

**Çalışırken:** her satırda şunlar görünür:
- aşama: seslendirme, hazırlık, kareler, kodlama, ses ve denetim;
- ilerleme çubuğu;
- kare sayısı;
- geçen süre, kalan süre ve bitiş saati.

Kalan süre kareler çizildikçe gerçek hıza geçer; karelerin %5'i bitince yalnız ölçülen hız kullanılır. Terminalde tek satır her saniye yenilenir. Arka planda (çıktı dosyaya ya da başka bir programa giderken) her %5'te ve en az dakikada bir satır yazılır. `--json` olayları `forecast`, `progress` (`remainingSeconds`, `finishAt` ile), `done` ve `error`'dur.

**Başka pencereden izleme:** Her tam render durumunu birkaç saniyede bir `Outputs/Checks/RenderStatus/<ad>.json` dosyasına yazar. `npm run render-status` şunları listeler:
- çalışan render'lar;
- son 24 saatte bitenler;
- 3 dakikadır güncellenmeyen ("durmuş olabilir") işler.

Kod: `src/Renderers/RenderEstimate.ts`, `scripts/RenderStatus.ts`, testler `tests/Renderers/RenderEstimate.test.ts`.

Aynı iş sırasında bir hata da düzeldi. Duran ekran kapısı (`StillScreenGate`) `--frames` verilmeyen her render'ı önizleme sanıyordu ve hiçbir derste çalışmıyordu. Kapının çalışmadığı dönemde render edilen dersler denetlendi: TYT Matematik 00, 01 ve 02 temiz.

### Hareket ve sıralama (10 Kasım 2026)

Videodaki hareketin kuralları. Kaynak: [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT) choreograph ve review-animations kuralları, videoya uyarlandı. Uygulamanın (web, mobil) hareket standardı ayrıdır: [`docs/UIUX/Hareket-Standardi.md`](UIUX/Hareket-Standardi.md). Reel'lerin hareket dili `ReelStandard.motion` ve `PromoMotion` içinde.

**Kurallar**
- **Anlatım önce gelir.** Bir öğe, anlatımda adı geçtiği anda girer (`cues`, vuruşlar). Sabit aralıklı sıra (`0.8 + index * 0.9`) yalnız ipucu olmayan işler için yedektir.
- **Her sahnenin bir ana öğesi vardır.** Önce o gelir; destek öğeleri ondan sonra, süsler en son gelir. Süs, ana öğeyle aynı anda girmez.
- **Bir kapsayıcı tek girişle gelir.** Hem kart hem içindeki satırlar ayrı ayrı canlanmaz.
- **Okunan metin yerinden oynamaz.** Soru, şık, formül ya da tablo yerine oturunca durur; yeni bilgi yanına eklenir. Bu, "her 2 sn'de yeni bilgi" kuralını tamamlar: hareket bilgiyi taşır, okunan şey sabit kalır.
- **Çıkış girişten kısadır.** `Animated` girişi `MOTION_DURATIONS.base` (0,5 sn), çıkışı `fast` (0,3 sn) ile yapar. Bir grup birlikte çıkar.
- **Sıfırdan büyüme yok.** Ölçekli giriş en az 0,5'ten başlar; sakin kartlar 0,8–0,96'dan.
- **Zıplama yok.** `Easing.back`, `bounce` ve `elastic` kullanılmaz; bunlar hedefin altına ve üstüne sallanır. Tek bir varış vurgusu için `overshoot` eğrisi kalır. O yalnız bir kez ve yaklaşık %2 aşar; tekrar eden harekette (her saniye yenilenen sayı gibi) kullanılmaz.
- **Hareket kareye bağlıdır.** CSS `transition`, `animation` ve `@keyframes` kullanılmaz. Bunlar tarayıcının saatiyle çalışır; render edilen kare onları rastgele bir anda yakalar.

**Otomatik denetim:** [`tests/Animations/MotionRules.test.ts`](../tests/Animations/MotionRules.test.ts) `src` içindeki kodu tarar. Şunlarda düşer:
- CSS geçişi ya da keyframe;
- `back`, `bounce` ya da `elastic` eğrisi;
- 0,5'in altındaki bir ölçekten giriş;
- çıkışı girişten uzun süren jeton.

Taranmayanlar: `src/UIUX` (durağan çizim) ve `Html5Banner.ts` (canlı HTML reklam).

İlk taramada tek ihlal bulundu: düşünme süresinin sayacı (`Countdown`) her saniye `Easing.back(2)` ile sallanıyordu. Artık yumuşak iniyor. Etkilenen yerler:
- kamp dersinin soru, tahmin ve "Sıra sende" sahneleri;
- kamp kısalarının meydan okuma turu;
- `CountdownChat` reklamı.


## Klasör haritası ve adlandırma (29 Ekim 2026, 31 Ekim'de güncellendi)

| Klasör | İçinde |
| --- | --- |
| `src/Animations/` | Hareket matematiği ve şemaları: `Motion.ts` (`easeFrom`, `smooth`, `smoothStep`, `lerp`, `clamp01`, süre ve eğri token'ları), `AnimationSpec.ts`, `AnimationStyle.ts`. React bileşeni yoktur |
| `src/Components/Animations/` | Hareketli React bileşenleri (`Animated`, `DrawPath`, `Highlight` …) |
| `src/Components/Visuals/` | Ders videolarının görselleri. `CourseVisual.tsx` tek dağıtıcıdır; her ders klasörünün `<Ders>Schema.ts` dosyası o dersin türlerinin şemasıdır, `VisualSchema.ts` onları tek birleşimde toplar (birden çok dersin kullandığı şema parçaları `VisualSchemaPart.ts`); `VisualWorld.tsx` 1000 × 600 çizim dünyası (`World`, `pathOf`, `usePartLook`, `Tag`, `Chip`); `VisualTimeline.tsx` vuruşların parçaları göstermesi ve odaklaması; `VisualFrame.tsx` kutu, palet ve sahne saati |
| `src/Components/Visuals/<Ders>/` | Her görsel kendi dosyasında, dersin şeması `<Ders>Schema.ts`: `Biology`, `Chemistry`, `Geography`, `Humanities` (harita, zaman çizelgesi, savaş, ayet, resim), `Language` (cümle, paragraf), `Literature` (şiir, hece), `Logic`, `Mathematics` (grafik, geometri, terazi, sayı doğrusu), `Philosophy`, `Physics`, `Processes` (süreç sahneleri), `Structure` (karşılaştırma, tablo, Venn, ağaç, yığın, dörtlü, akış, döngü), `Three` (3B katı cisim, molekül, fay) |
| `src/Templates/Courses/CourseLesson/Scenes/`, `Camps/Scenes/`, `Camps/CampIntro/Scenes/`, `Camps/CampShort/Scenes/` | Ders ve kamp şablonlarının sahneleri, sahne başına bir dosya; ortak parçalar `LessonChrome`, `CampChrome`, `IntroKit`, `ChallengeKit` |
| `src/Courses/` | Ders senaryosu şeması (`LessonScript.ts`, `OPTION_LETTERS` burada), kamplar ve kamp işleri (`Camp.ts`, `CampJob.ts`), Works görünümü (`WorksView.ts`), söyleniş, kelime zamanları (`LessonCue.ts`), çıkmış sorular |
| `src/Renderers/` | İşi doğrulama ve render: `VideoJob.ts` (saf, dosya okumaz), `VideoJobFile.ts` (iş dosyasını okur; kamp işinin `script` yolundaki senaryoyu yükler) |
| `scripts/` | Komutlar (`npm run …`), dosya başına bir komut. `DeadCode.ts`: kimsenin içe aktarmadığı dışa aktarımları listeler |
| `tests/` | `src` düzenini izler: bir test, sınadığı modülün klasöründedir (`tests/Components/Visuals/Physics/Kepler.test.ts`). Bütün motoru kesen kurallar kökte `Architecture.test.ts`; ortak yollar `tests/Support/Paths.ts` (`ROOT`, `FIXTURES`), ortak veriler `tests/Fixtures/` |
| `Outputs/` | Bütün çıktılar, git dışında, modül modül: `Camps/`, `Quizzes/`, `Exams/`, `Works/`, `Checks/` (kareler, taramalar, ön izlemeler, ses denemeleri, viral kontrolü); genel `Videos/` ve `Images/` (numaralı), `Covers/`, `Brand/` |
| `Posts/` | Sosyal medya gönderileri, gönderi başına bir klasör (`<tarih>_<Ad>/`: Brief, Job, Post ve medyası `Media/`); ay planları `Posts/Plans/`. Sosyal kodu `src/Social/` |
| `Curriculum/` | Eğitim içeriğinin işi, modül modül (aşağıdaki harita); ortak Python ve bütün yollar `Curriculum/Tools/` |
| `docs/` | Belgeler konu klasörlerinde: `Courses/` (ders ve kamp videoları, anlatım, renkler, matematik okunuşu ve kartları; Works'ün belgesi `Curriculum/Works/README.md`), `Social/` (strateji, plan, kurgu, kimlik standardı, kanallar), `Brand/` (marka kimliği, ürün dili, tipografi), `Ads/` (reklam brifi, mağaza metni, `GoogleAds/`), `UIUX/` (tasarım sistemi, ekranlar, geçmiş), `Campaigns/` (ay kampanyaları), `Analiz/` (veri raporları, `YYYY-AA-GG-Konu.md`). Kökte yalnız `Development.md` durur. Biten işin raporu ayrı dosyada bekletilmez: kararı ve açık kalanı ilgili belgeye katılır, ayrıntısı git geçmişinde kalır. **Ölü kopya yok** (sahip, 14 Kasım 2026): bir şey yeniden üretilince eskisi silinir, yenisi konur; silme yalnız Geri Dönüşüm Kutusu'na (PowerShell `Microsoft.VisualBasic.FileIO.FileSystem` `DeleteFile`/`DeleteDirectory`, `SendToRecycleBin`; `rm`, `Remove-Item`, `git clean` yok), silinenlerin tam yol listesi `Outputs/Checks/Temizlik-<tarih>-<Alan>.md` |

## Modül haritası (9 Kasım 2026)

Motor, API'deki (`Services/Exams`, `Quizzes`, `Works`, `SocialHubs`) ve mobildeki (`src/modules/exam`, `quiz`, `works`) modüllerle aynı adlarla klasörlenir. Her modülün işi bir oturumda yürür. Bu oturum (merkezî altyapı) kuralları, ortak yapıları ve hata düzeltmeyi taşır; kural değişince bütün oturumlara yazar.

| Modül | İş (git) | Kod ve araç | Çıktı (git dışı) | Belge | Oturum |
| --- | --- | --- | --- | --- | --- |
| Kamp | `Curriculum/Camps`, `Scripts`, `Jobs`, `Production`, `Sources` | `src/Courses`, `src/Templates/Camps`, `npm run curriculum` | `Outputs/Camps/<Sınav>/<Bölüm>/<Ders>/<NN>_<Konu>/` | `docs/Courses/` | Kamp senaryoları iyileştirmeleri; render: Render |
| Quiz | `Curriculum/Quizzes` (Revisions, plan, kurallar, onarım yönergesi) | `Curriculum/Quizzes/Tools` | `Outputs/Quizzes/` (Data, Results, Figures, Work, FigureCheck) | `Curriculum/Quizzes/CalismaPlani.md`, `YazimKurallari.md` | Quiz iyileştirilmesi |
| Deneme | `Curriculum/Exams` (plan, `<ay>/<kitapçık>/<ders>.jsonl`) | `Curriculum/Exams/Tools` | `Outputs/Exams/` (katalog, Work, Results, Figures) | `Curriculum/Exams/DenemePlani.md`, `YONERGE.md` | Exam iyileştirilmesi |
| Works | `Curriculum/Works`, `Curriculum/WorksWritten` | `src/Works`, `npm run figures`, `WorksWritten/Tools/works_batch.py` | `Outputs/Works/Figures` (manifest), `Outputs/Works/Written` | `docs/Courses/Works-*.md`, README'ler | Works iyileştirilmesi |
| Sosyal medya | `Posts/<tarih>_<Ad>/` (medya `Media/` içinde) | `src/Social` (kampanyalar `src/Social/Campaigns`), `npm run social` | gönderinin `Media/` klasörü; kamp reels'i `Outputs/Camps` | `docs/Social/`, `docs/Campaigns/`, `docs/Analiz/` | Sosyal Medya Yönetimi |
| UI/UX | — | `src/UIUX`, `npm run uiux` | `Desktop\Sinavika-UIUX3` | `docs/UIUX/` | UI/UX |
| Reklam ve mağaza | — | `src/Ads`, `src/Store`, `npm run google-ads`, `apple-ads`, `store` | `Desktop\Sinavika-GoogleAds`, `Sinavika-AppleAds`, `MobileHeader` | `docs/Ads/` | — |
| VC | `Desktop\Sinavika-Yatirim` (motorda kod yok) | — | `Desktop\Sinavika-Yatirim\Sunum` | — | VC |

Ortak (merkezî) olanlar, modüller kendi kopyasını yazmaz:

- **Tasarım:** `Themes/`, `Components/`, `Configurations/` (marka, logo, ses, formatlar).
- **Render ve ses:** `Renderers/`, `Services/` (seslendirme, ses son ayarı `AudioLeveling`, ses denetimi `AudioCheck`, çıktı dosyası `OutputFile`).
- **Python:** `Curriculum/Tools/`:
  - `engine_paths.py`: bütün yollar;
  - `common`, `database`;
  - `content_api`: Sınavika API'sinin Claude içerik uçları;
  - `anthropic_api`: Anthropic, Batch ve maliyet kaydı;
  - figür hattı: `check_revisions`, `render_figures`, `upload_stills`, `RenderFigures.ts`, `FigureCheck`.

  Bir modül aracı önce kendi `Tools/paths.py`'sini içe aktarır; o dosya ortak klasörü Python yoluna ekler.

Kurallar (`tests/Architecture.test.ts` → `module layout`):

- `Curriculum` ve `Outputs` altında yalnız haritadaki klasörler olur. Yeni bir modül önce bu tabloya ve testteki listeye yazılır.
- Python araçları klasör yolu yazmaz (`"Outputs"`, `"Desktop"`); yolu `engine_paths.py`'den alır.
- Quiz ve deneme araçları birbirini içe aktarmaz; ikisinin paylaştığı şey `Curriculum/Tools`'a taşınır.
- Anthropic'e giden her çağrı `anthropic_api` üzerinden yapılır. Toplu işlerin (Batch) sabit istemi `cached_system(...)` ile **1 saatlik önbellekle** gönderilir; sabit kısım sistem isteminde bayt bayt aynı kalır, değişen kısım kullanıcı mesajına konur. 5 dakikalık önbellek toplu işin ortasında ölür: 2–5 Kasım'da Works isteklerinde önbellek okuma oranı %11–24'te kaldı. 1 saatlik önbellekle ilk ölçüm (9 Kasım, kamp senaryosu aracı, yaklaşık 68 bin token sabit önek): ikinci istek öneki önbellekten okudu. 40 dakika sonraki toplu iş de öneki okudu; isabet %62, kalan kısım derse özel içerik. Ücretli çağrı sahibin açık onayıyla yapılır.
- Bir modülün eski yerine (listesi testte, `RETIRED_PATHS`) hiçbir kod ya da belge işaret etmez.

Kurallar (`tests/Architecture.test.ts` denetler):

- **Yalnız klasör adı çoğul olur.** Dosya, içindeki tek şeyin adını tekil taşır (`Sentence.tsx`, `LessonCue.ts`). Birden çok şey taşıyan bir dosya klasöre bölünür. İstisnalar testteki listede gerekçesiyle durur: sabit koleksiyonlar (`BrandColors`, `DesignTokens`, `Voices`), görsel türüyle aynı adı taşıyanlar (`Forces`, `Plates`), kütle isimleri (`Dynamics`, `Optics`). Reklam ve eğitim şablon arşivi, UI/UX, reklam, mağaza, görsel ve kampanya kodu bu kuralın dışında bırakıldı.
- **Bir yardımcı tek yerde tanımlanır.** Hareket eğrileri `Animations/Motion.ts`, çizim dünyası `Visuals/VisualWorld.tsx`, şık harfleri `Courses/LessonScript.ts`. Kopya yazılmaz, içe aktarılır.
- **Yalnız başka bir modülün kullandığı şey dışa aktarılır.** Hiç kullanılmayan tanım silinir. `npx tsx scripts/DeadCode.ts` raporu boş kalır; `--fix` gereksiz `export` sözcüklerini kaldırır.
- **Testler `tests/` altındadır**, `src` içinde test olmaz; `tests/` içinde `src` düzenini izler.
- **Proje kökünde ve `scripts/` içinde başıboş dosya olmaz.** Kökteki girdiler testteki listededir; karalama dosyaları projenin dışında tutulur.
- **Belgelerdeki dosya bağlantıları çalışır.** `README.md`, `docs/`, `Curriculum/`, `Posts/` ve `samples/` içindeki md dosyalarında var olmayan dosyaya bağlantı olmaz.
- **Kamp işleri senaryonun kopyasını değil yolunu taşır** (`script`); `npm run curriculum -- jobs check` hepsini doğrular.
- **Yalnız Sınavika görünümü:** temalar `SinavikaLight`, `SinavikaDark` ve ikisinin tabanı `SinavikaBrand` (eski 5 tema 31 Ekim'de kaldırıldı).

## Akış

```
JSON iş ──► VideoJob.resolveVideoJob ──► Remotion composition ──► MP4
             (zarf + template şeması)     (TemplateCompositions)
                                              │
                    template.buildScenes(content) ──► SceneSeries ──► sahne bileşenleri
                                                                        │
                                                         Components + Themes + Animations
```

1. **İş doğrulanır.** `resolveVideoJob` zarfı (template, format, tema, fps, kalite), sonra içeriği template'in kendi
   Zod şemasıyla doğrular. Formüller de bu aşamada KaTeX ile ayrıştırılır. Hata varsa render hiç başlamaz.
2. **Sahneler kurulur.** Template'in `buildScenes` fonksiyonu içerikten `{id, seconds, element}` listesi üretir.
   Video süresi bu listeden hesaplanır; ayrıca bir süre tablosu tutulmaz.
3. **Remotion çizer.** `SceneSeries` sahneleri geçişlerle arka arkaya dizer; `VideoFrame` temayı ve fontları sağlar.

## Mimari kararlar

**Template bir veri tanımıdır, sınıf değil.** `TemplateDefinition` = şema + örnek içerik + `buildScenes` + geçiş +
isteğe bağlı üst katman. Önizleme, doğrulama, süre ve render bu tanımı okuyan genel kodlardır; hiçbirinde template adı
geçmez, `switch (template)` yoktur.

**Tema ile template ayrıdır.** Tema renk, yazı tipi, köşe, gölge, arka plan ve hareket karakterini; template yerleşim
ve anlatım akışını belirler. Template'ler renk veya font adı yazmaz, yalnızca rol kullanır (`primary`, `onSurface`,
`display`). Bu yüzden 5 template × 6 tema ek kod olmadan çalışır.

**Mürekkep (ink) bağlamı.** `Card` ve renkli paneller içlerindeki metne okunaklı rengi kendileri bildirir. `Text`
nerede durduğunu bilmek zorunda değildir.

**Ölçüler referans pikseldir.** Tüm boyutlar 1080 px kısa kenara göre yazılır ve `useVideoLayout().u()` ile ölçeklenir.
Çözünürlük render ölçeğiyle (`quality`) değişir, yerleşim değişmez. Format farkları `isPortrait/isLandscape/isSquare`
ile ele alınır.

**Sahne zamanı ile animasyon zamanı ayrıdır.** Sahne yalnızca ne kadar ekranda kalacağını söyler (`Scenes/`).
Animasyonlar sahnenin başlangıcına göre saniye cinsinden çalışır (`Animations/`). Sahneyi zaman çizelgesinde taşımak
ya da süresini değiştirmek içindeki animasyonlara dokunmayı gerektirmez. Süreler saniyedir; FPS değişince görünüm aynı
kalır.

**Animasyon veridir.** `AnimationSpec` (`{preset, direction, durationSeconds, delaySeconds, easing}`) Zod şemalı düz
bir nesnedir; temadan, template'ten veya JSON'dan gelebilir. `animationStyle(spec, progress)` saf bir fonksiyondur.

**Determinizm.** Her şey kare numarasının saf fonksiyonudur: zamanlayıcı, `Date`, rastgelelik yok. Fontlar npm
paketinden gelir (ağ gerekmez) ve render fontlar yüklenene kadar bekletilir. Metin kenar yumuşatma gri tonlamaya
sabitlenir. Render testi aynı karenin tekrar tekrar aynı piksellerle çıktığını doğrular (Chrome'un kenar
yumuşatmasından gelen, tek tük pikselde 1 seviyelik yuvarlama farkı dışında).

**Taşma kontrolü üç katmanlıdır.** (1) Şemalar her alana uzunluk sınırı koyar. (2) `FitBox` içeriği önce tam boyutta
dizer; sığmazsa metni yeniden akıtarak küçültür, `fill` ile kısa içeriği büyütür. (3) En küçük ölçekte de sığmayan
içerik render uyarısı olarak raporlanır (`RenderResult.warnings`); render testleri uyarı sıfır olmasını şart koşar.

**Seslendirme sahne modelinin parçasıdır.** `buildScenes` her sahne için ne söyleneceğini (`voice` satırları)
de döndürür. Ses üretimi (`Services/`) motorun dışındadır: satırları alır, klipleri ve sürelerini döndürür.
`buildScenes(content, voiceClips)` klip varsa süreyi klipten, yoksa okuma süresi tahmininden alır; yani aynı kod
sesli ve sessiz videoyu üretir. `SceneSeries` klipleri sahnenin içinde sırayla çalar.

**Anlatım tek metin olarak üretilir.** Satırlar paragraf aralarıyla birleştirilir ve tek istekte seslendirilir
(`Services/NarrationScript.ts`); model her cümleyi bağlamıyla duyar, tonlama satırdan satıra sıfırlanmaz. Servis
her karakterin ne zaman söylendiğini döndürür; bir klip, o tek ses dosyasının bir parçasıdır (`startSeconds` +
`durationSeconds`). Yalnızca modelin sınırını aşan metin, satır aralarından bölünür. Ses dosyası ve satır
zamanları (`.mp3` + `.json`) metin + ses ayarının özetiyle adlandırılıp önbelleğe alınır; aynı iş tekrar render
edildiğinde aynı dosya kullanılır.

**Ses merkezîdir: katalog → marka sesi → profil.** `Configurations/Voices.ts` kimin konuştuğunu (ses kataloğu ve
`BRAND_VOICES`: ana dili Türkçe seslerin tercih sırası) ve nasıl konuştuğunu (profil: rol, söyleyiş ayarı, yedek
sesler) tanımlar. Template'ler ses kimliği bilmez, yalnızca profil adı verir. `Services/VoiceCasting.ts` isteği
hesabın kullanabildiği seslere göre somut bir sese çevirir (saf fonksiyon): `BRAND_VOICES` içindeki ilk
kullanılabilir ses her profili seslendirir. Hiçbiri kullanılamıyorsa **hata verilir**; çok dilli yedek sese ancak
iş `standIn: true` derse geçilir ve bu `voiceCast.note` ile bildirilir. İşte açıkça istenen ses yoksa da hata
verilir. Model sesin kökenine göre seçilir (`VOICE_MODEL_BY_ORIGIN`: Türkçe sesler Multilingual v2, yedekler
Eleven v3). `Services/ElevenLabsSpeech.ts` ElevenLabs'e giden tek kapıdır. Bütün profiller doğal hızda (tempo 1)
ve `style: 0` ile konuşur; tempo ses üretilirken değil oynatılırken uygulanır, bu yüzden tempo değişikliği yeniden
üretim ve kredi gerektirmez.

**Kapsam dışı bırakılanlar.** HTTP sunucusu, kuyruk, bulut depolama, LLM çağrısı, altyazı yoktur. Girdi JSON, çıktı dosyadır;
bunların hepsi bu sınırın dışına eklenebilir.

## Yeni template eklemek

`src/Templates/<Kategori>/<TemplateAdı>/` altında dört dosya:

| Dosya | İçerik |
| --- | --- |
| `<Ad>Schema.ts` | İçerik Zod şeması. Sahne niteliğindeki öğeler `SceneTimingSchema.extend(...)` kullanır |
| `<Ad>Sample.ts` | Şemayı geçen örnek içerik (Studio varsayılanı, testlerde kullanılır) |
| `<Ad>Scenes.tsx` ya da `Scenes/<SahneAdı>.tsx` | Sahne bileşenleri. Birden çok sahnesi olan yeni şablonda `Scenes/` klasörü, sahne başına bir dosya |
| `<Ad>.tsx` | `defineTemplate({...})`: `buildScenes`, geçiş, üst katman |

Sonra `TemplateRegistry.ts` içine tek satır eklenir. Studio'da üç formatta görünür, `npm run render`/`validate`/`schema`
ile çalışır ve `tests/Templates/Template.test.ts` ile `tests/Renderers/VideoRenderer.render.ts` içindeki genel testlere otomatik girer.
Mevcut hiçbir dosya değişmez.

Sahne yazarken:

- Kökte `<SafeArea chrome>` kullanın; içerik güvenli alanda kalır ve üst çubuğa yer açılır.
- Ana içeriği `<FitBox>` içine koyun. İçindeki öğeleri zamana göre mount/unmount etmeyin; `Animated` ile gizleyip
  gösterin (opacity/transform yerleşimi değiştirmez, FitBox ölçümü her karede aynı kalır).
- `FitBox` içinde öğeleri `transform` ile **konumlandırmayın**. Ölçüm sırasında bütün transform'lar kapatılır;
  çünkü render sekmeleri videonun herhangi bir karesinden başlayabilir ve animasyonun ortasındaki bir öğe taşma
  sayılmamalıdır. Bir noktaya ortalamak için `CycleDiagram` içindeki sıfır boyutlu `ANCHOR` kalıbını kullanın.
- Metin için `Text`/`RichText`, yüzey için `Card`, yan not için `Callout` kullanın. Doğrudan renk veya font yazmayın.
- Her sahneye `createNarrator` ile bir `voice` satırı verin ve sahne süresini o satırdan alın
  (`const intro = say('intro', metin, tahminiSüre, enAzSüre)` → `{seconds: intro.seconds, voice: [intro]}`).
  Sahne içinde sırayla gelen öğeleri `paceSeconds` ile sahne süresine yayın; böylece anlatım uzadığında
  ekrandaki akış da onunla birlikte yavaşlar.
- Sahne içinde alt adımlar varsa `planScenes` + `Sequence layout="none"` kullanın (bkz. `SolutionScene`).

## Yeni görsel tasarımı eklemek

`src/Images/Templates/<Kategoriler>/<Tasarım>.tsx` adında tek dosya: içerik şeması (Zod), bileşen ve
`defineImageTemplate({...})`. Sonra `ImageTemplateRegistry.ts` içine bir satır. Yeni kategori için ayrıca bir şey
gerekmez: kategori, tasarımın `category` alanından doğar. Tasarım Studio'da "Images" klasöründe görünür,
`npm run image`/`validate`/`schema` ile çalışır ve genel testlere (her boyutta render, örnek içerik, şema)
otomatik girer.

Tasarım yazarken:

- Kökte `<ImageFrame backdrop=... branding={content.branding}>` kullanın: zemini boyar, kenar boşluğunu ve logoyu
  yönetir, zemine uygun metin rengini ayarlar.
- Boyuta göre yerleşim için `useImageLayout()` (`wide`, `tall`, `u`, `padding`) kullanın. Her tasarım dört adlandırılmış
  boyutta ve özel boyutlarda render edilir.
- Uzunluğu değişen içeriği `<FitBox>` içine koyun. `FitBox` dışında kalan, sabit boyutlu öğeler (mockup'lar gibi)
  için taşma otomatik yakalanmaz: ya kalan alanı dolduran bir sahneye koyun (`BrowserHero`), ya da bilinçli olarak
  kenardan kırpın (`HeroPhone`, `DualPhones`).
- Ortak animasyonlu bileşenler (`Highlight`, diyagramlar) görselde son hâlleriyle çizilir; ayrı bir "statik" sürüm
  yazmanız gerekmez.
- Gerçek ekran görüntülerini `PhoneMockup`/`BrowserMockup` ile gösterin; bu bileşenler görüntüye filtre, kırpma
  dışında bir işlem uygulamaz.

## Yeni tema eklemek

`src/Themes/<TemaAdı>.ts` dosyasında bir `Theme` nesnesi tanımlayın ve `ThemeRegistry.ts` içine ekleyin. Bütün
template'ler temayı hemen kabul eder. `tests/Renderers/VideoJob.test.ts` renklerin 6 haneli hex olduğunu ve metin/zemin
çiftlerinin WCAG kontrastını otomatik denetler. Tema yazı tipi seçmez: bütün temalar marka tipografisini
(`BRAND_THEME_TYPOGRAPHY`, Manrope) kullanır, yalnız etiketlerin büyük harfini kapatabilir. Yeni bir yazı tipi
marka kararıdır; bkz. [`docs/Brand/Tipografi.md`](Brand/Tipografi.md).

## Diğer genişletmeler

| Ne | Nerede |
| --- | --- |
| Ders videosuna yeni görsel türü | `Components/Visuals/<Ders>/<Ders>Schema.ts` listesine şema (yeni ders klasörüyse listesini `VisualSchema.ts` birleşimine ekle), `Components/Visuals/<Ders>/<Ad>.tsx` bileşen, `CourseVisual.tsx` içine bir `case`. Ortak çizim parçaları `VisualWorld.tsx`, hareket `Animations/Motion.ts` |
| Eğitim şablonlarına yeni görsel (ör. sayı doğrusu) | `Schemas/Visual.ts` içine bir şema, `Illustration.tsx` içine bir `case` |
| Konu anlatımına yeni blok türü | `TopicBlockSchema` içine bir şema, `TopicBlockView` içine bir `case` |
| Yeni animasyon preset'i | `AnimationSpec.ts` içindeki liste, `AnimationStyle.ts` içine bir `case` |
| Yeni sahne geçişi | `SceneTransition.ts` (sahneler saydamdır; yalnızca eski sahneyi götüren geçişler uygundur) |
| Yeni video formatı veya kalite (kural: varsayılan her zaman en yüksek, 4K; bkz. `DEFAULT_RENDER_QUALITY`) | `Configurations/VideoFormats.ts` |
| Yeni ses | `Configurations/Voices.ts` içindeki `VOICES`; marka sesi yapmak için `BRAND_VOICES` listesinin başına ekleyin |
| Yeni ses profili (ör. çocuklara yönelik) | `VOICE_PROFILES`; template tanımında `voiceProfile` ile kullanın |
| Marka sesini değiştirmek | `BRAND_VOICES` sırası (ilk kullanılabilir ses her şeyi seslendirir) |
| Bir içerik türünün söyleyişi | İlgili profil (`stability`, `similarity`, `style`, `pace`) |
| Yeni model (ör. Eleven v4) | `VOICE_MODELS` içine bir satır |
| Okunuş kuralı (birim, formül) | `Schemas/SpokenText.ts` |
| Logoyu ya da boyutlarını değiştirmek | `public/Brand/SinavikaLogo.png` (şeffaf zeminli PNG) ve `Configurations/Brand.ts`. Logo yalnızca `BrandMark` ile çizilir; dosyanın rengi önemli değildir, zeminin metin rengine boyanır |
| Derse özel bileşen | `Components/` altına; ilgili template sahnesinde kullanılır. Derse özel render motoru yoktur |

## Yeni renk paleti eklemek

`Themes/Palettes.ts` içine sürümlü bir adla (`SinavikaV1`) ekleyin. `applyPalette(tema, palet)` paleti bir temanın
tipografi ve biçimiyle birleştirip yeni bir tema üretir; renk üstü yazı renklerini kontrasta göre kendisi seçer.
Mevcut temalar değişmez (`tests/Images/Image.test.ts` bunu denetler). Görsel işleri paleti adıyla seçer; videolar
yalnızca `ThemeRegistry` içindeki temaları kullanır, bu yüzden bir palet videoları ancak siz onu orada bir tema
olarak kaydederseniz etkiler.

## Claude ile içerik üretimi

Motor şimdiden bu akışa uygun: LLM kod değil, şemaya uyan **veri** üretir.

1. İçerik türüne göre template seçilir (`TEMPLATES` listesindeki `id`, `title`, `description` modele verilebilir).
2. `npm run schema -- <TemplateId>` çıktısı (ya da `z.toJSONSchema(template.contentSchema)`) yapılandırılmış çıktı
   şeması olarak modele verilir.
3. Modelin çıktısı `resolveVideoJob` ile doğrulanır. Hata listesi alan yollarıyla geldiği için modele geri verilip
   düzeltme istenebilir.
4. Geçerli iş `renderVideo` ile render edilir.

Bu katman `src/Services/` altında (ör. `ContentPlanner.ts`) yaşayabilir; motorun geri kalanı değişmez. Modelden
ekran metninin yanında `narration`/`script` alanlarını da doldurması istenirse formüllerin okunuşu doğal olur.

Aynı akış görseller için de geçerlidir: kategori ve tasarım `npm run schema` listesinden seçilir,
`npm run schema -- Image:<Kategori>:<Tasarım>` çıktısı yapılandırılmış çıktı şeması olur, sonuç `resolveImageJob`
ile doğrulanır, `renderImageToOutputs` ile kaydedilir.

Mevcut tasarımların karşılamadığı bir istek için yeni bir tasarım dosyası yazılabilir (yukarıdaki "Yeni görsel
tasarımı eklemek" tek dosyalık bir iştir). Bu, üretim anında çalışan bir yol değildir: yeni dosya bir geliştirme
dalında yazılır, tip denetiminden ve render testlerinden geçer (testler her kayıtlı tasarımı her boyutta render
eder), gözden geçirilir ve ancak ondan sonra kayda eklenir.

Template'in karşılayamadığı özel animasyonlar için LLM'in üretim anında **kod** üretmesi ayrı bir konudur ve
bilinçli olarak uygulanmamıştır. Eklenecekse üretilen kod uygulama sunucusunda değil, ağ ve dosya erişimi kısıtlı ayrı bir
sandbox'ta derlenip render edilmeli ve insan onayından geçmelidir.

## Bilinen kısıtlar

14 Kasım 2026'da gözden geçirildi; artık geçerli olmayan maddeler (ücretsiz ses planı, yer tutucu ekranlar, metin mağaza rozetleri, varsayım marka renkleri) çıkarıldı.

- **Seslendirme ağ gerektirir** (önbellekte olmayan metinler için) ve anlatım metni ElevenLabs'e gönderilir. Plan ve sesler: Pro plan, marka sesi Doğa (`BRAND_VOICES`).
- **`seed` yalnızca en iyi çabadır:** aynı metin yeniden üretilirse biraz farklı duyulabilir. Önbellek, render edilmiş bir videonun sesini sabit tutar. İstikrar gereken içerikte işte `"model": "stable"` kullanın.
- **Satır sınırları karakter zamanlarından gelir.** Sınır iki satır arasındaki duraklamanın ortasına konur ve uçlar iki karelik geçişle yumuşatılır; çok kısa duraklamalarda komşu satırın nefesi duyulabilir.
- **Formül okuması kurallıdır.** Okuyucu formülü ağaç olarak çözer ([`MatematikOkunus.md`](Courses/MatematikOkunus.md)); tabloda olmayan bir yapı çıkarsa işte `narration` verilir.
- **Altyazı yok, eklenmez** (sahibin kararı, 30 Ekim 2026). Reklam müziği ElevenLabs Music ile her reklama ayrı üretilir; ders videolarında müzik yoktur.
- **Ses ile ekran eşlemesi:** ders videolarında kelime düzeyindedir (`Courses/LessonCue.ts`); eski eğitim şablonlarında sahne düzeyindedir.
- **Görsellerde taşma denetimi `FitBox` içindeki içerik içindir.** Sabit boyutlu öğelerin birbirine binmesini yalnız sosyal gönderilerde `checkLayout` yakalar; yeni bir tasarım dört boyutta gözle de kontrol edilir.
- **Başlangıç paletleri marka kararı değildir** (`MidnightGoldV1`, `FreshMintV1`, `src/Themes/Palettes.ts`); mekanizmayı göstermek içindir.
- **Görseller yalnızca `public/` içinden ya da URL'den okunur.** URL'li görsel render sırasında ağ gerektirir. SVG görsellerin içindeki yazılar sistem fontuyla çizilir.
- **Studio'da "Can't save default props" uyarısı** beklenen bir durumdur: varsayılan props şemadan geçirilmiş örnek içeriktir.
- **Sahne geçişleri fade ve slide ile sınırlıdır** (sahneler ortak, sabit bir arka plan üzerinde saydamdır).
- **Süre tahmini seslendirme gelene kadar sezgiseldir** (kelime sayısı); render süresi tahmini ise eski render'lardan gelir.
- **Render tek makinede, tek süreçte çalışır.** Eşzamanlı iş sayısını çağıran taraf sınırlamalıdır.
