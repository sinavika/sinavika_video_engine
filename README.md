# Sınavika Video Engine

Sınavika için veri odaklı eğitim videosu üretim motoru. Bir JSON işi (job) alır, şemaya göre doğrular ve
[Remotion](https://www.remotion.dev) ile MP4 üretir. Ana .NET backend'den bağımsız çalışır.

- **5 eğitim template'i:** soru çözümü, konu anlatımı, hızlı tekrar, kavram açıklama, sınav hazırlığı
- **6 tema:** template'lerden bağımsız; her template her temayla çalışır
- **3 format:** 9:16, 16:9, 1:1 (720p – 2160p, 24/25/30/50/60 fps)
- **Seslendirme:** Türkçe kadın sesiyle anlatım; sahne süreleri sese göre ayarlanır
- **LaTeX**, Türkçe karakterler, görselli sorular, otomatik taşma kontrolü

## Kurulum

Node.js 24 ile geliştirildi ve test edildi.

```bash
npm install
```

İlk render sırasında Remotion, Chrome Headless Shell'i (~120 MB) bir kez indirir.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run studio` | Remotion Studio: bütün template'leri önizle, props'ları canlı düzenle |
| `npm run render -- --job <job.json> --out <video.mp4>` | Tek video render eder |
| `npm run render -- --job <job.json> --out <kare.png> --frame 120` | Tek kare render eder |
| `npm run render -- ... --concurrency 4 --json` | Paralel sekme sayısı; makine tarafından okunabilir çıktı |
| `npm run validate -- <job.json> [...]` | Render etmeden doğrular, süreyi raporlar |
| `npm run validate -- <job.json> --narration` | Ayrıca seslendirme metnini satır satır yazdırır |
| `npm run stills -- --job <job.json> --formats all` | Her sahneden bir PNG üretir (yerleşim kontrolü) |
| `npm run render:samples` | Bütün örnek videoları `out/Samples/` altına üretir |
| `npm run schema -- <TemplateId>` | Template içerik şemasını JSON Schema olarak yazdırır |
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
  "quality": "1080p",
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
| `quality` | `720p`, `1080p`, `1440p`, `2160p` | `1080p` |
| `voiceover` | `true`, `false` ya da `{provider, voice, rate, pitch}` | `false` |
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

`"voiceover": true` videoyu varsayılan sesle (Türkçe kadın sesi, `tr-TR-EmelNeural`) seslendirir. Akış:

1. Her sahne için bir anlatım satırı üretilir. Satırlar içerikten otomatik kurulur ve dikkat çekici bir girişle
   başlar ("Dikkat! Bu soru tipi sınavda karşına çıkabilir...", "Hızlı tekrar: ... Hazır mısın?").
2. Satırlar sese çevrilir ve `public/Voiceovers/` altında önbelleğe alınır (aynı metin ve ses tekrar üretilmez).
3. Sahne süreleri ses uzunluğuna göre ayarlanır; ekrandaki öğeler de anlatımın hızına göre sırayla gelir.

Sesi ya da okuma biçimini değiştirmek için nesne verin:

```json
"voiceover": {"voice": "tr-TR-AhmetNeural", "rate": "+10%", "pitch": "-2%", "provider": "edge"}
```

| Sağlayıcı | Açıklama |
| --- | --- |
| `edge` (varsayılan) | Microsoft Edge'in sesli okuma servisi. Hesap gerektirmez; geliştirme ve önizleme içindir. Resmî bir API değildir, art arda isteklerde hız sınırına takılabilir. |
| `azure` | Azure AI Speech (resmî, aynı sesler). `AZURE_SPEECH_KEY` ve `AZURE_SPEECH_REGION` ortam değişkenlerini okur. Canlı kullanım için bu önerilir. |

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

## Template'ler

| Template | Karakter | Sahne akışı |
| --- | --- | --- |
| `QuestionSolution` | Soru sabit kalır, çözüm adım adım yanında/altında oynar | giriş → soru → çözüm adımları → doğru cevap → sonuç |
| `TopicExplanation` | Ders slaytı: bölüm numaralı başlık sütunu, tipli içerik blokları, bölüm çubuğu | kapak + içindekiler → bölümler → özet |
| `QuickRevision` | Tam ekran renkli kartlar, dev numara, hızlı itme geçişleri, hikâye çubuğu | giriş → kartlar → özet |
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
{"type":"done","outputPath":"...","width":1080,"height":1920,"fps":30,"durationSeconds":32.7,"voiceLineCount":9,"warnings":[]}
{"type":"error","kind":"validation","message":"...","issues":["content.title: ..."]}
```

Çıkış kodları: `0` başarılı, `2` geçersiz iş, `1` render hatası. Aynı işlev Node içinden de kullanılabilir:

```ts
import {renderVideo} from './src/Renderers/VideoRenderer';

const result = await renderVideo(job, {
  outputPath: 'out/video.mp4',
  onProgress: ({stage, progress}) => console.log(stage, progress),
});
```

Her çağrı kendi tarayıcısını açar ve yalnızca kendi çıktı dosyasına yazar; işler yan yana çalıştırılabilir.

## Proje yapısı

```
src/
  Configurations/   Video formatları, FPS, kalite, güvenli alanlar; marka kuralları
  Themes/           Tasarım token'ları, 6 tema, tema kaydı, font yükleme
  Animations/       Saf animasyon matematiği: süreler, easing, preset → CSS
  Components/
    Animations/     Animated, Stagger, Typewriter, Highlight, DrawPath, ProgressBar
    Typography/     Text, RichText, MathExpression, Badge
    Layouts/        VideoFrame, SafeArea, FitBox, Card, Callout, ThemeBackground
    Illustrations/  Illustration (akış, döngü, formül, görsel), ConceptMap, Icon
    Overlays/       BrandMark, SegmentedProgress
  Scenes/           Sahne planlama, süre tahmini, geçişler, seslendirme modeli, ortak kapanış sahnesi
  Schemas/          Ortak Zod şemaları: zengin metin, okunacak metin, görsel, video props
  Templates/        TemplateDefinition, TemplateRegistry, Education/<Template>/
  Compositions/     Template → Remotion composition köprüsü
  Services/         Ses sentezi sağlayıcıları ve önbellekli seslendirme üretimi
  Renderers/        VideoJob (doğrulama) ve VideoRenderer (MP4/PNG)
  Root.tsx          Kayıtlı bütün template'ler × bütün formatlar
samples/            Her template için örnek JSON işi
scripts/            Komut satırı araçları
tests/              Birim testleri (*.test.ts) ve render testleri (*.render.ts)
public/             Görsellerin okunduğu statik klasör
```

Mimari kararlar, yeni template/tema ekleme adımları ve yol haritası için: [docs/Development.md](docs/Development.md)
