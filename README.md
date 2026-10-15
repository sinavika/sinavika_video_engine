# Sınavika Video Engine

Sınavika için veri odaklı video ve görsel üretim motoru. Bir JSON işi (job) alır, şemaya göre doğrular ve
[Remotion](https://www.remotion.dev) ile MP4 ya da PNG/JPEG/WebP üretir. Ana .NET backend'den bağımsız çalışır.

Video ve görsel üretimi iki ayrı alandır: kendi şablonları, şemaları, kayıtları ve renderer'ları vardır. İkisi
aynı tasarım sistemini (temalar, tipografi, bileşenler, marka, logo) paylaşır.

- **Video: 5 eğitim template'i:** soru çözümü, konu anlatımı, hızlı tekrar, kavram açıklama, sınav hazırlığı
- **Görsel: 12 kategoride 18 tasarım:** mobil ve web tanıtımı, soru, konu, hook, özellik, infografik, sınav
  taktikleri, kaydırmalı seri, duyuru, kampanya, video kapağı
- **Numaralı çıktılar:** `Outputs/Videos/01_Matematik_Denklem_Cozumu.mp4`, `Outputs/Images/01_...png`
- **6 tema:** template'lerden bağımsız; her template her temayla çalışır
- **3 format:** 9:16, 16:9, 1:1 (720p – 2160p, 24/25/30/50/60 fps)
- **Seslendirme:** ElevenLabs ile Türkçe anlatım; içerik türüne göre ses profili, sahne süreleri sese göre ayarlanır
- **LaTeX**, Türkçe karakterler, görselli sorular, otomatik taşma kontrolü

## Kurulum

Node.js 24 ile geliştirildi ve test edildi.

```bash
npm install
```

İlk render sırasında Remotion, Chrome Headless Shell'i (~120 MB) bir kez indirir.

Seslendirme için ElevenLabs API anahtarı gerekir. `.env.example` dosyasını `.env` olarak kopyalayıp anahtarı yazın
(`ELEVENLABS_API_KEY=...`) ya da aynı adlı ortam değişkenini tanımlayın. `.env` git tarafından yok sayılır.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run studio` | Remotion Studio: bütün template'leri önizle, props'ları canlı düzenle |
| `npm run render -- --job <job.json>` | Video render eder, `Outputs/Videos` altına sıradaki numarayla kaydeder |
| `npm run render -- --job <job.json> --out <video.mp4>` | Videoyu tam olarak verilen yola yazar |
| `npm run image -- --job <job.json> [--job ...]` | Görsel render eder, `Outputs/Images` altına sıradaki numarayla kaydeder |
| `npm run image -- --job <job.json> --out <görsel.png>` | Görseli tam olarak verilen yola yazar |
| `npm run render -- --job <job.json> --out <kare.png> --frame 120` | Tek kare render eder |
| `npm run screens [-- --mode both --device]` | Mobil uygulama ekranlarını PNG olarak `Outputs/AppScreens` altına çıkarır |
| `npm run uiux [-- --only m-deneme --lang en]` | UI/UX çizimlerini (mobil, web paneli, site; açık ve koyu ayrı; ekranlar ve panolar) `Desktop\Sinavika-UIUX3\acik|koyu` altına çıkarır; `--mode light|dark|both`. Ayrıntı: [docs/UIUX/UIUX-Rehberi.md](docs/UIUX/UIUX-Rehberi.md) |
| `npm run google-ads [-- --lang tr --exam yks --platform mobile]` | Google Ads setini (YKS/KPSS, mobil uygulama/web sitesi, TR/EN; 3 boyut görsel, metinsiz kopyalar, HTML5 zip, metin CSV, logolar) `Desktop\Sinavika-GoogleAds` altına çıkarır. Plan: [docs/GoogleAds/Icerik-Plani.md](docs/GoogleAds/Icerik-Plani.md) |
| `npm run render -- ... --concurrency 4 --json` | Paralel sekme sayısı; makine tarafından okunabilir çıktı |
| `npm run validate -- <job.json> [...]` | Render etmeden doğrular, süreyi raporlar |
| `npm run validate -- <job.json> --narration` | Ayrıca seslendirme metnini satır satır yazdırır |
| `npm run stills -- --job <job.json> --formats all` | Her sahneden bir PNG üretir (yerleşim kontrolü) |
| `npm run render:samples` | Bütün örnek videoları `out/Samples/` altına üretir |
| `npm run schema` | Video şablonlarını ve görsel tasarımlarını listeler |
| `npm run schema -- <TemplateId>` ya da `Image:<Kategori>[:<Tasarım>]` | İçerik şemasını JSON Schema olarak yazdırır |
| `npm run voices` | Marka sesleri (ana dili Türkçe), hesabın kullanabildikleri, dinleme bağlantıları ve şu an kimin seslendirdiği |
| `npm run voices -- --audition "<cümle>"` | Cümleyi kullanılabilir seslerle üretir (`out/Auditions/`), dinleyip seçmek için |
| `npm run typecheck` | TypeScript derleme kontrolü |
| `npm test` | Birim testleri (şema, zamanlama, animasyon, tema kontrastı) |
| `npm run test:render` | Gerçek render testleri (headless Chrome; birkaç dakika sürer) |

## Video işi (job)

Motorun tek girdisi düz bir JSON nesnesidir:

```json
{
  "template": "QuestionSolution",
  "format": "Vertical",
  "theme": "AcademicLight",
  "fps": 30,
  "quality": "2160p",
  "voiceover": true,
  "content": {
    "title": "Birinci Dereceden Denklem",
    "subject": "Matematik",
    "question": {
      "text": "$2x + 5 = 15$ ise $x$ kaçtır?",
      "options": ["$3$", "$4$", "$5$", "$6$"]
    },
    "steps": [
      {"title": "Denklemi düzenleyelim", "content": "Sabit terimi sağa atıyoruz.", "formula": "2x = 15 - 5"},
      {"title": "Sonucu bulalım", "content": "İki tarafı $2$'ye bölüyoruz.", "formula": "x = 5"}
    ],
    "answer": {"text": "$x = 5$", "correctOptionIndex": 2}
  }
}
```

| Alan | Değerler | Varsayılan |
| --- | --- | --- |
| `template` | `QuestionSolution`, `TopicExplanation`, `QuickRevision`, `ConceptExplanation`, `ExamPreparation` | zorunlu |
| `format` | `Vertical` (9:16), `Horizontal` (16:9), `Square` (1:1) | `Vertical` |
| `theme` | `SinavikaBrand`, `WhiteboardMinimal`, `AcademicLight`, `TechDark`, `VibrantDynamic`, `ExamFocus` | template'in kendi teması |
| `fps` | 24, 25, 30, 50, 60 | 30 |
| `quality` | `720p`, `1080p`, `1440p`, `2160p`. **Kural: her zaman en yüksek kalite, 4K.** YouTube'a 4K dosya yüklenir; sosyal medyaya gönderirken motor kendi 1080p kopyasını çıkarır (Buffer/Instagram en fazla 1080p tutar). Düşük kalite yalnız hızlı önizleme için elle seçilir | `2160p` |
| `voiceover` | `true`, `false` ya da `{profile, voice, model, pace, standIn}` | `false` |
| `content` | Template'e özel içerik | zorunlu |

Her template için eksiksiz örnekler [samples/](samples) klasöründedir. Bir template'in içerik şemasını görmek için
`npm run schema -- QuestionSolution` çalıştırın veya template klasöründeki `*Schema.ts` dosyasına bakın.

### Metin biçimi

Açıklama alanları düz metindir ve üç işaret destekler:

| Yazım | Sonuç |
| --- | --- |
| `$x^2 + 1$` | Satır içi LaTeX |
| `$$\frac{a}{b}$$` | Ayrı satırda, ortalanmış LaTeX |
| `**önemli**` | Vurgu (tema rengiyle kalın) |
| `\$` | Düz dolar işareti |

`formula` ve `latex` alanları doğrudan LaTeX'tir, `$` kullanılmaz. JSON içinde ters bölü çift yazılır: `"\\frac{1}{2}"`.

### Seslendirme

Bütün anlatım Türkçedir ve ElevenLabs ile üretilir. `"voiceover": true` videoyu **marka sesiyle** seslendirir.

**Sınavika tek sesle konuşur ve o ses ana dili Türkçe olan bir seslendirmendir.** Çok dilli (ana dili İngilizce)
bir ses Türkçeyi okuyabilir ama kendi aksanını ve ritmini korur, yapay durur; bu yüzden böyle bir sese
**kendiliğinden geçilmez**. Yapı tek dosyada yönetilir ([src/Configurations/Voices.ts](src/Configurations/Voices.ts)):

| Katman | Ne | Örnek |
| --- | --- | --- |
| Ses | Kim konuşuyor: bir ElevenLabs sesi ve karakteri | Lisa: İstanbul Türkçesi, dinamik, gündelik konuşma tonu |
| Marka sesi | Her şeyi seslendiren tek ses: `BRAND_VOICES` listesinde hesabın kullanabildiği ilk ses | Lisa → Gözde → Eda → Derya → Melis |
| Profil | Nasıl konuşuyor: rol ve söyleyiş ayarı (kim konuştuğu değil) | `Teacher`, `Energizer`, `Promoter` |

Üç kural her profilde aynıdır:

- **Doğal hız.** Tempo 1,0'dır; ses hızlandırılmaz. (Bir iş `pace` ile kendi temposunu isteyebilir.)
- **Abartısız ton.** `style` 0'dır: anlatım reklam okur gibi değil, günlük konuşma gibidir.
- **Metin bütün olarak üretilir.** Satırlar tek tek değil, tek istekte ve tek ses dosyası olarak seslendirilir;
  tonlama cümleden cümleye taşınır. Her satırın dosyadaki yeri ElevenLabs'in karakter zamanlarından bulunur ve
  görüntü bu sürelere göre zamanlanır.

Ana dili Türkçe sesler ElevenLabs ses kütüphanesindedir: API'den kullanmak için hesabın **ücretli planda (ya da
API kredili)** olması ve sesin **"My Voices"a eklenmiş** olması gerekir. Marka seslerinden hiçbiri kullanılamıyorsa
seslendirme **hata verir**; yabancı sese sessizce düşmez. Güncel durumu, dinleme bağlantılarıyla birlikte
`npm run voices` gösterir. Marka sesini değiştirmek için `BRAND_VOICES` listesinin sırasını değiştirin.

Bir işte farklı ses, model ya da tempo istemek, ya da ana dili Türkçe olmayan yedek sesi bilerek kabul etmek için:

```json
"voiceover": {"profile": "Creator", "voice": "Derya", "model": "stable", "pace": 1.05}
"voiceover": {"standIn": true}
```

| Alan | Değerler |
| --- | --- |
| `profile` | `Teacher`, `Lecturer`, `Energizer`, `Coach`, `Promoter`, `Creator` |
| `voice` | Katalogdaki bir ses (ör. `Gozde`, `Derya`, `Sarah`, erkek ses için `Liam`, `Daniel`). Hesapta yoksa iş hata verir |
| `model` | `stable` (Multilingual v2: Türkçe seslerin varsayılanı, bu sesler onun için ayarlıdır) ya da `expressive` (Eleven v3: yedek seslerin varsayılanı) |
| `pace` | 0,8 – 1,3; varsayılan 1,0. Ses oynatılırken uygulanır; ses dosyası yeniden üretilmez |
| `standIn` | `true`: hiçbir Türkçe ses kullanılamıyorsa profilin çok dilli yedek sesiyle (Sarah, Bella, Jessica...) üret. Sonuçta `voiceCast.note` bunu belirtir |

**Akış.** (1) Her sahne için bir anlatım satırı kurulur; satırlar dikkat çekici bir girişle başlar. (2) Metnin tamamı
tek istekte sese çevrilir ve `public/Voiceovers/` altında önbelleğe alınır: aynı metin ve ses için bir daha kredi harcanmaz.
(3) Sahne süreleri ses uzunluğuna göre ayarlanır, ekrandaki öğeler anlatım hızına yayılır. Üretimden önce
hesapta yeterli karakter olup olmadığı denetlenir; yetmiyorsa hiçbir şey üretilmeden hata verilir.

**Anlatım metnini yazmak.** Otomatik satırlar formülleri de okur (`$x^2$` → "x kare"), ama bu en iyi çabadır.
Formül ağırlıklı içerikte metni kendiniz verin; iki yolu var:

- Sahne niteliğindeki öğelerde `narration` alanı (soru, çözüm adımı, bölüm, tekrar kartı, kavram adımı):
  `{"title": "Parantezi açalım", "content": "...", "narration": "İlk işimiz parantezi açmak. Üçü, içerideki her terimle çarpıyoruz."}`
- Diğer satırlar için içerikteki `script` nesnesi, satır kimliğiyle:
  `"script": {"answer": "Doğru cevap C şıkkı: dokuz. Tam isabet!", "outro": "..."}`

Bir işin bütün satırlarını ve kimliklerini görmek için: `npm run validate -- job.json --narration`

Seslendirme olmadan da süreler otomatik hesaplanır (metin uzunluğundan). Bir öğenin süresini elle sabitlemek için
`durationSeconds` kullanılabilir; ses varsa ses uzunluğu önceliklidir.

### Doğrulama

Hatalı iş render edilmez. Şu durumlar render başlamadan, alan yoluyla birlikte raporlanır:

```
GEÇERSİZ job.json
  - content.title: Invalid input: expected string, received undefined
  - content.steps.1.formula: Invalid LaTeX: KaTeX parse error: Expected '}', got 'EOF' ...
  - content.answer.correctOptionIndex: correctOptionIndex must point at an existing entry of question.options.
```

Eksik alan, fazla uzun metin, bozuk LaTeX, eşleşmeyen `$`, var olmayan seçenek/düğüm indeksi, toplamı tutmayan süre
planı ve 15–60 saniye dışına çıkan hızlı tekrar videosu doğrulamadan geçemez.

## Görsel işi (image job)

Görsellerin girdisi de düz bir JSON nesnesidir:

```json
{
  "category": "HookContent",
  "variant": "BoldQuestion",
  "size": "Square",
  "theme": "SinavikaBrand",
  "palette": "MidnightGoldV1",
  "format": "png",
  "name": "Günlük Soru Hook",
  "content": {
    "eyebrow": "Günün sorusu",
    "hook": "0,999… gerçekten 1’e eşit mi?",
    "emphasis": "1’e eşit",
    "teaser": "Evet, tam olarak eşit. İspatı tek satır sürüyor.",
    "cue": "Cevap açıklamada"
  }
}
```

| Alan | Değerler | Varsayılan |
| --- | --- | --- |
| `category` | Aşağıdaki 12 kategoriden biri | zorunlu |
| `variant` | Kategorinin bir tasarımı | kategorinin ilk tasarımı |
| `size` | `Square` 1080×1080, `Portrait` 1080×1350, `Story` 1080×1920, `Landscape` 1920×1080 ya da `{"width": 1200, "height": 628}` | tasarımın kendi boyutu |
| `theme` | Videolarla aynı 6 tema | tasarımın kendi teması |
| `palette` | Kayıtlı palet adı ya da satır içi palet nesnesi; temanın renklerinin yerine geçer | yok |
| `format` | `png`, `jpeg`, `webp` | `png` |
| `quality` | JPEG kalitesi, 1–100 (varsayılan en yüksek; PNG zaten kayıpsız) | 100 |
| `name` | Çıktı dosyasına verilecek ad | içerikten türetilir |
| `content` | Tasarıma özel içerik | zorunlu |

| Kategori | Tasarımlar | Ne için |
| --- | --- | --- |
| `MobilePromotion` | `HeroPhone`, `DualPhones` | Telefon mockup'lı uygulama tanıtımı; tek ekran ya da 2–3 ekran yan yana |
| `WebPromotion` | `BrowserHero`, `DeviceDuo` | Tarayıcı penceresinde web paneli; masaüstü + mobil birlikte |
| `QuestionSolution` | `QuestionCard`, `SolutionSteps` | Tek soruluk paylaşım; adım adım çözüm ve cevap |
| `TopicExplanation` | `ConceptCard`, `Timeline` | Kavram ve formül kartı; zaman çizelgesi |
| `HookContent` | `BoldQuestion`, `MythFact` | Merak uyandıran dev soru; doğru bilinen yanlış |
| `FeatureSpotlight` | `Spotlight` | Tek bir özelliği öne çıkarma |
| `Infographics` | `Stats`, `Process` | Büyük rakamlar ve çubuk grafik; süreç adımları |
| `ExamTips` | `TipList` | Numaralı sınav taktikleri |
| `Carousel` | `SlideDeck` | Kapak + içerik slaytları + kapanış; tek işten birden çok görsel |
| `Announcements` | `Update` | Yenilik ve güncelleme duyurusu |
| `Campaigns` | `Offer` | İndirim, fiyat, kupon kodu, son tarih |
| `Thumbnails` | `VideoCover` | YouTube / Reels kapağı |

Her tasarım için eksiksiz örnek [samples/Images/](samples/Images) klasöründedir.

**Ekran görüntüleri.** Tanıtım tasarımlarındaki `screenshot` alanlarına `public/` içindeki bir dosya yolu ya da
URL verilir; görüntü olduğu gibi, değiştirilmeden çerçeveye yerleştirilir. Alan boş bırakılırsa tarafsız bir
yer tutucu ekran çizilir (örnekler bu şekilde üretildi).

**Kaydırmalı seri.** `Carousel` işi slayt sayısı kadar görsel üretir; hepsi aynı numara altında
(`03_Uslu_Sayilar_1.png`, `03_Uslu_Sayilar_2.png`…) kaydedilir.

### Renk paletleri

Temalar tipografi, biçim ve renk taşır. Bir **palet** yalnızca renktir ve bir temanın renklerinin yerine geçer;
böylece yeni marka renkleri mevcut hiçbir şeyi değiştirmeden eklenir.

```json
"palette": {
  "primary": "#0057B8", "accent": "#FFD700",
  "background": "#FFFFFF", "surface": "#F5F7FA", "text": "#0B1F33",
  "secondary": "#00A3A3", "muted": "#5B6B7B", "border": "#D5DCE5",
  "success": "#12A66A", "warning": "#F59E0B", "error": "#E5484D",
  "gradient": ["#0057B8", "#00A3A3"]
}
```

İlk beş alan zorunludur, diğerleri verilmezse türetilir. Renk üstü yazı renkleri (ör. buton üzerindeki metin)
okunaklı kalacak şekilde otomatik seçilir. Kalıcı paletler [src/Themes/Palettes.ts](src/Themes/Palettes.ts)
içine sürüm adıyla eklenir (`SinavikaV1`, sonra `SinavikaV2`…) ve işte adıyla seçilir. Palet eklemek mevcut video
temalarını değiştirmez; bir paleti videolara da sunmak için `ThemeRegistry` içine `applyPalette` ile kurulmuş bir
tema eklenir.

**Kurumsal palet.** Sınavika'nın resmî renkleri tek dosyada durur: [src/Configurations/BrandColors.ts](src/Configurations/BrandColors.ts).
Bu renklerden iki palet (`SinavikaLightV1`, `SinavikaDarkV1`) ve aynı renkleri taşıyan iki tema (`SinavikaLight`,
`SinavikaDark`) kurulur. Sosyal medya içeriklerinin tamamı bu iki temayla üretilir; hangi içerik türünün hangi temayı
kullandığı [docs/SocialPlan.md](docs/SocialPlan.md) içindedir. Eski temalar (`SinavikaBrand` dahil) kendi renklerini korur.

```bash
npm run image -- --job samples/Images/QuestionSolution-QuestionCard.json --theme SinavikaLight --size Portrait
```

Videoda tema işin içinde seçilir: `"theme": "SinavikaLight"`.

## Çıktı dosyaları

`--out` verilmeyen her üretim `Outputs/` altına sıralı ve anlamlı bir adla kaydedilir:

```
Outputs/
  Videos/   01_Geometri_Dik_Ucgende_Hipotenus.mp4   02_Turkce_Ses_Olaylari.mp4
  Images/   01_Sinavika_Mobil.png   02_Gunun_Sorusu_Hook.png   03_Matematik_Uslu_Sayilarda_3_Kural_1.png …
```

- Videolar ve görseller ayrı ayrı numaralanır; numara 99'dan sonra 100, 101 diye sürer.
- Ad içerikten türetilir (ya da işteki `name` alanından), Türkçe karakterler ASCII'ye çevrilir.
- Numara, render başlamadan önce atomik olarak ayrılır; eşzamanlı üretimler aynı numarayı alamaz.
- Render geçici bir dosyaya yapılır, yalnızca tamamlanan dosya son adına taşınır. Başarısız render hiçbir şey
  bırakmaz; mevcut bir dosyanın üzerine asla yazılmaz.
- Her üretim `Outputs/<Tür>/Manifest.jsonl` dosyasına bir satır ekler (numara, ad, dosyalar, şablon, tema, boyut,
  zaman). Aynı bilgiler komutun ve API'nin sonucunda da döner.
- Klasörü değiştirmek için `SINAVIKA_OUTPUT_DIRECTORY` ortam değişkeni kullanılabilir. `Outputs/` git tarafından
  yok sayılır.

Video, kapağıyla birlikte aynı numara altında kaydedilir: `03_Turkce_Ses_Olaylari.mp4` ve `03_Turkce_Ses_Olaylari_Kapak.png`. Kapak videonun
açılış karesi olarak da videoya yerleştirilir; `"cover": false` ile kapatılır, `"cover": {"title": "...", "emphasis": "..."}` ile metinleri
değiştirilir. Ayrıntı: [docs/SocialPlan.md](docs/SocialPlan.md).

## Eğitim videoları (YouTube dersi + kısa özet)

Ders ve konu listesine bağlı üretim: `Curriculum/` (katalog, üretim kontrol listesi, konuya göre gruplanmış kaynaklar), senaryo şeması, `CourseLesson` (YouTube, 16:9) ve `CourseShort` (Reels/TikTok/Shorts) şablonları, derslere özel görseller (grafik, geometri, kuvvet, hareket, molekül, atom, tepkime, zaman çizelgesi, harita, cümle şeması…). Görseller anlatımla eşzamanlı değişir (beat: göster, vurgula, yakınlaştır, katsayı değiştir, aşama ilerlet); süreç görselleri (akarsu, deprem, kuvvet → ivme → hareket, denklem terazisi), önce tahmin sonra gösterim kartı ve 3B görseller (cisim ve açınım, molekül şekli, fay blokları; three.js) vardır. Ayrıntı: [docs/Courses.md](docs/Courses.md).

| Komut | Ne yapar |
| --- | --- |
| `npm run curriculum -- import --lessons <csv> --corpus <klasör>` | Ders listesini ve kaynakları `Curriculum/` içine alır |
| `npm run curriculum -- status` / `next` | İlerleme ve sıradaki konular |
| `npm run curriculum -- brief <konu>` | Senaryo yazmak için konunun alt başlıkları, kaynakları ve görsel seti |
| `npm run curriculum -- check <senaryo> [--mark]` | Senaryoyu doğrular, hedeflere göre denetler, "Hazırlandı" işaretler |
| `npm run curriculum -- mark <konu> --stage youtube\|short` | Üretim aşamasını işaretler |
| `npm run media -- --commons "File:…" --to <yol>` | Wikimedia Commons görselini lisans kaydıyla ekler |
| `npm run geo` | Harita verilerini kurar: Türkiye (il, bölge, ilçe, akarsu, göl) ve dünya, Türkçe adlarla |

## Tanıtım videosu

`AppPromotion` şablonu Sınavika mobil uygulamasını tanıtır: dev hareketli yazıyla giriş, uygulamanın gerçek ekranlarını gezen tek telefon ve
mağaza adlı kapanış. Ekran çizimleri [src/Components/AppScreens](src/Components/AppScreens) içindedir ve mobil uygulamanın kodundan yeniden çizilmiştir.

`ExamJourney` şablonu telefon göstermek yerine bir denemeyi oynatır: süre başlar, bir soru işaretlenir, sonuç kendini çizen bir çizgi olur,
en zayıf ders işaretlenir ve uygulama en sonda görünür. Düz renk blokları (turuncu, açık, koyu lacivert) ve itmeli geçişler kullanır;
`AppPromotion`'ın koyu sahnesinin bilerek tersidir. Anlatım altyazı olarak da gösterilir (`"subtitles": false` ile kapatılır).

**Her tanıtım videosu kendine özgüdür.** Aynı ürün için arka arkaya iki tanıtım aynı şablonla, aynı görünümle ve aynı müzikle yapılmaz;
yeni fikir yeni bir şablon olarak eklenir. Müzik de değişir: `"soundtrack": "Pulse"` (stiller: `Bright`, `Pulse`; `true` = `Bright`).

```bash
npm run render -- --job samples/AppPromotion.json
```

```bash
npm run render -- --job samples/ExamJourney.json
```

- `"fps": 60` ile akıcı hareket, `"soundtrack": true` ile kodla üretilen özgün müzik ve ses tasarımı eklenir; ses −14 LUFS'e ayarlanır.
- Uygulama ekranları merkezi bir katalogdur (11 ekran, açık ve koyu tema); videoda, telefonlu görsellerde (`appScreen`) ve tek başına kullanılır: `npm run screens`. Ayrıntı: [docs/AppScreens.md](docs/AppScreens.md).
- Tanıtım videolarının standart brifi: [docs/AdPrompt.md](docs/AdPrompt.md). Marka kimliği: [docs/BrandIdentity.md](docs/BrandIdentity.md).

## Sosyal medya teslimi (SocialHub)

Üretilen görsel ve videolar Sınavika API'ye teslim edilir; orada admin onayını bekler ve onaylanınca Buffer üzerinden Instagram, TikTok ve YouTube'da paylaşılır. Bu araç onay veremez ve yayın yapamaz.

```bash
npm run social -- accounts
npm run social -- plan --month 2026-11 --out Plans/2026-11.json
npm run social -- submit --post samples/Social/Post.json
npm run social -- calendar --from 2026-11-01 --to 2026-12-01
npm run social -- revisions
npm run social -- sources --kind Question --unused
npm run social -- import-sources --file samples/Social/Sources.json
```

| Komut | Ne yapar |
| --- | --- |
| `accounts` | Aktif hesaplar ve Buffer'ın her biri için önerdiği saatler |
| `plan` | Standart haftalık plandan tarihli takvim: gün, saat (Buffer'dan), içerik türü, format, platformlar. Kurallar: [docs/SocialPlan.md](docs/SocialPlan.md) |
| `submit` | Gönderi dosyasındaki medyayı yükler, gönderiyi "onay bekliyor" olarak oluşturur |
| `calendar` | Tarih aralığındaki plan, hesap bazında durumla |
| `revisions` | Adminin reddettiği, yeniden hazırlanacak gönderiler ve notları |
| `sources`, `import-sources` | Kaynak veriler (soru, konu, hook) ve kullanıldı bilgisi |

Gönderi dosyası [`samples/Social/Post.json`](samples/Social/Post.json) biçimindedir; `media` yolları dosyanın bulunduğu klasöre göredir, `scheduledAt` saat dilimiyle yazılır (`+03:00`). `targets` her platformun gerçek gönderi türünü (`reel`, `carousel`, `short`…) ve kendi saatini taşır; plan komutunun ürettiği `targets` olduğu gibi kullanılır. Videonun yanındaki `_Kapak.png` kendiliğinden kapak olarak yüklenir. Reddedilen bir gönderinin yerine hazırlananda `replacesPostId` eskisinin kimliğidir. Bir kaynak yalnız bir gönderide kullanılabilir; API ikinci kullanımı reddeder.

`.env`: `SINAVIKA_API_URL` ve `SINAVIKA_SOCIALHUB_KEY` (sunucudaki `SocialHub__ClaudeApiKey` ile aynı). İstemci: [`src/Services/SocialHubClient.ts`](src/Services/SocialHubClient.ts). Sunucu tarafı ve uçlar: Sınavika deposunda `docs/social-hub-integration.md`.

## Video template'leri

| Template | Karakter | Sahne akışı |
| --- | --- | --- |
| `QuestionSolution` | Soru sabit kalır, çözüm adım adım yanında/altında oynar | giriş → soru → çözüm adımları → doğru cevap → sonuç |
| `TopicExplanation` | Ders slaytı: bölüm numaralı başlık sütunu, tipli içerik blokları, bölüm çubuğu | kapak + içindekiler → bölümler → özet |
| `QuickRevision` | Tam ekran renkli kartlar, dev numara, hızlı itme geçişleri, hikâye çubuğu. **Eğitim Reels'lerinin standart şablonu**: `subject` (ders) kapakta ve girişte sol üstte, `exams` (ör. `["KPSS", "YKS"]`) "Hızlı Tekrar" satırının üstünde gösterilir | giriş → kartlar → özet |
| `ConceptExplanation` | Görsel sahnede kalır; açıklama ilerledikçe ilgili düğüm vurgulanır | kavram → görsel anlatım → ilişkili kavramlar → örnek |
| `ExamPreparation` | Koç brifingi: sayı kutuları, süre çubuğu, yanlış → doğru satırları | sınav → strateji → süre → hatalar → ipuçları → motivasyon |

Hepsi isteğe bağlı kapatılabilen marka kapanışıyla biter (`"outro": {"enabled": false}`).

## .NET backend'den çağırma

`--json` ile her stdout satırı bir JSON olayıdır; backend süreci başlatıp satırları okur:

```bash
npm run --silent render -- --job job.json --out out/video.mp4 --json
```

```json
{"type":"progress","stage":"rendering","progress":0.42,"renderedFrames":412,"totalFrames":980,"percent":42}
{"type":"progress","stage":"voiceover","progress":0.5,"percent":50}
{"type":"done","outputPath":"...","width":1080,"height":1920,"fps":30,"durationSeconds":32.7,"voiceLineCount":9,"voiceCast":{"voiceName":"Gözde Arıkan","native":true,"modelId":"eleven_multilingual_v2","pace":1},"warnings":[]}
{"type":"error","kind":"validation","message":"...","issues":["content.title: ..."]}
```

Çıkış kodları: `0` başarılı, `2` geçersiz iş, `1` render hatası. Aynı işlev Node içinden de kullanılabilir:

```ts
import {renderVideo, renderVideoToOutputs} from './src/Renderers/VideoRenderer';
import {renderImage, renderImageToOutputs} from './src/Images/Renderers/ImageRenderer';

const video = await renderVideo(job, {outputPath: 'out/video.mp4', onProgress: ({stage, progress}) => console.log(stage, progress)});
const numbered = await renderVideoToOutputs(job);        // Outputs/Videos/NN_Ad.mp4
const image = await renderImageToOutputs(imageJob);      // Outputs/Images/NN_Ad.png
```

Görseller için de aynı sözleşme geçerlidir: `npm run --silent image -- --job job.json --json`.

Her çağrı kendi tarayıcısını açar ve yalnızca kendi çıktı dosyasına yazar; işler yan yana çalıştırılabilir.

## Proje yapısı

```
src/
  Configurations/   Video formatları, FPS, kalite, güvenli alanlar; marka kuralları; ses kataloğu ve profilleri
  Themes/           Tasarım token'ları, 6 tema, tema kaydı, renk paletleri, font yükleme
  Animations/       Saf animasyon matematiği: süreler, easing, preset → CSS
  Components/
    Animations/     Animated, Stagger, Typewriter, Highlight, DrawPath, ProgressBar
    Typography/     Text, RichText, MathExpression, Badge
    Layouts/        VideoFrame, SafeArea, FitBox, Card, Callout, ThemeBackground
    Illustrations/  Illustration (akış, döngü, formül, görsel), ConceptMap, Icon
    Overlays/       BrandMark, SegmentedProgress
  Scenes/           Sahne planlama, süre tahmini, geçişler, seslendirme modeli, ortak kapanış sahnesi
  Schemas/          Ortak Zod şemaları: zengin metin, okunacak metin, görsel, video props
  Templates/        Video: TemplateDefinition, TemplateRegistry, Education/<Template>/
  Images/           Görsel: ImageTemplateDefinition, ImageTemplateRegistry,
                    Templates/<Kategori>/, Schemas/, Renderers/, Components/ (mockup'lar, çerçeve, CTA)
  Compositions/     Video ve görsel şablonlarını Remotion composition'larına bağlar
  Services/         ElevenLabs konuşma servisi, ses seçimi, seslendirme üretimi; numaralı çıktı kaydı (OutputFiles)
  Renderers/        VideoJob (doğrulama) ve VideoRenderer (MP4/PNG)
  Root.tsx          Kayıtlı bütün template'ler × bütün formatlar
samples/            Her video template'i için örnek iş; samples/Images/ altında her görsel tasarımı için örnek iş
Outputs/            Numaralı video ve görsel çıktıları (git dışında)
scripts/            Komut satırı araçları
tests/              Birim testleri (*.test.ts) ve render testleri (*.render.ts)
public/             Görsellerin okunduğu statik klasör
```

Mimari kararlar, yeni template/tema ekleme adımları ve yol haritası için: [docs/Development.md](docs/Development.md)
