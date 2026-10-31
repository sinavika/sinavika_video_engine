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
| `Outputs/` | Bütün çıktılar (video, görsel, kare, örnek, ses denemesi, mağaza görselleri); git dışında |
| `Posts/` | Sosyal medya gönderileri (yalnız json ve md); ay planları `Posts/Plans/` |

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

## Claude ile içerik üretimi (sonraki faz)

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

- **Görsel örneklerindeki ekranlar yer tutucudur.** Gerçek uygulama/web ekran görüntüleri verilmedi; tanıtım
  tasarımları tarafsız iskelet ekranlarla render edildi. Örnek metinler (web adresi, fiyat, kampanya, "ücretsiz
  dene") de yer tutucudur.
- **Mağaza rozetleri düz metindir.** App Store / Google Play logoları tescilli olduğu için çizilmedi.
- **Görsellerde taşma denetimi `FitBox` içindeki içerik içindir.** Sabit boyutlu öğelerin birbirine binmesi
  otomatik yakalanmaz; yeni bir tasarım dört boyutta gözle kontrol edilmelidir.
- **Başlangıç paletleri marka kararı değildir** (`MidnightGoldV1`, `FreshMintV1`); mekanizmayı göstermek içindir.

- **Türkçe (ana dili) sesler ücretli plan ister.** Ücretsiz planda ElevenLabs kütüphane seslerini API'den
  kullandırmaz (402 `paid_plan_required`). O durumda seslendirme hata verir; çok dilli yedek ses yalnızca işte
  `"voiceover": {"standIn": true}` denirse kullanılır ve ana dili Türkçe olan bir seslendirmen gibi duyulmaz.
- **Ücretsiz planın çıktısı ticari kullanıma uygun değildir** (ElevenLabs lisansı ücretli planla gelir) ve dönem
  başına 10.000 karakterle sınırlıdır; bir video kabaca 700–1.100 karakter harcar.
- **Ses seçimi kulakla doğrulanmadı.** `BRAND_VOICES` sırası kütüphane verisine (açıklama, kullanım amacı,
  yaygınlık) göre kuruldu. `npm run voices` bağlantılarından ya da `npm run voices -- --audition "..." --brand`
  ile dinleyip sırayı düzenleyin.
- **Satır sınırları karakter zamanlarından gelir.** Sınır iki satır arasındaki duraklamanın ortasına konur ve
  uçlar iki karelik geçişle yumuşatılır; çok kısa duraklamalarda komşu satırın nefesi duyulabilir.
- **`seed` yalnızca en iyi çabadır:** aynı metin yeniden üretilirse biraz farklı duyulabilir (Eleven v3'te daha
  belirgin). Önbellek, render edilmiş bir videonun sesini sabit tutar. İstikrar
  gereken içerikte işte `"model": "stable"` kullanın.
- **Seslendirme ağ gerektirir** (önbellekte olmayan metinler için) ve anlatım metni ElevenLabs'e gönderilir.
- **Formül okuma en iyi çabadır.** Okul düzeyi ifadeler okunur; karmaşık ifadelerde `narration` verin.
- **Altyazı yok.** Satır metinleri ve süreleri elde olduğu için eklenebilir. Reklam müziği ElevenLabs Music ile
  her reklam için ayrı üretilir; ders videolarında müzik yoktur.
- **Ses ile ekran eşlemesi kelime düzeyindedir (ders videoları):** kartın parçaları seslendirmedeki kelime
  zamanlarıyla söylendikleri anda gelir (`Courses/LessonCue.ts`). Eski eğitim şablonlarında eşleme sahne
  düzeyindedir.
- **Marka renkleri varsayımdır.** Logo gerçek Sınavika logosudur (`public/Brand/SinavikaLogo.png`), ama
  `SinavikaBrand` temasındaki renkler henüz resmî marka renkleri değildir.
- **Görseller yalnızca `public/` içinden ya da URL'den okunur.** URL'li görsel render sırasında ağ gerektirir.
  SVG görsellerin içindeki yazılar sistem fontuyla çizilir.
- **Studio'da "Can't save default props" uyarısı** beklenen bir durumdur: varsayılan props dosyadaki sabit bir
  nesne değil, şemadan geçirilmiş örnek içeriktir. Props panelinde düzenleme ve önizleme çalışır.
- **Sahne geçişleri fade ve slide ile sınırlıdır** (sahneler ortak, sabit bir arka plan üzerinde saydamdır).
- **Eğitim şablonlarının diyagramları basittir** (akış, döngü, kavram haritası, formül, görsel). Ders videolarında
  ise grafik, geometri, 3B katı cisim, harita, süreç ve fizik/kimya simülasyonları vardır (`Components/Visuals/`).
- **Süre tahmini sezgiseldir** (kelime sayısı). Seslendirme gelene kadar `durationSeconds` ile elle ayarlanabilir.
- **Render tek makinede, tek süreçte çalışır.** Eşzamanlı iş sayısını çağıran taraf sınırlamalıdır.
