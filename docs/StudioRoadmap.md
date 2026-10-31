# Stüdyo yol haritası: reels ve ders videoları

25 Ekim 2026. Konu: video motorunun (`sinavika_video_engine`) ders anlatımı ve reels üretimini nasıl ileri taşıyacağımız. Araştırma internet kaynaklarına, motorun bugünkü koduna ve `EgitimVerileri` verisine dayanır. Kaynaklar en sonda.

## 1. Kısaca

- **Kamp altyapısı kuruldu.** Ortak şablon: YouTube'da en az 10 dakikalık kamp dersi (`CampLesson`) ve aynı senaryodan reels (`CampShort`). İlk kamp planı: **TYT Türkçe kampı, 15 ders**. Ayrıntı: [Courses.md §9](Courses.md#9-kamplar).
- **Veri motora alındı.** `Desktop\EgitimVerileri`'nin YKS ve KPSS kısmı `Curriculum/Data`'da (424 MB, git dışında). 1.128 konunun 560'ının anlatımı var; 706 konuya **120.899 soru** bağlı, 109.564'ü cevaplı, 6.489'u ÖSYM.
- **Görseldeki önerilerin çoğu bizde zaten var**, birçoğu daha ileri seviyede: Remotion, ffmpeg ve kalite kontrolü motorda. Whisper'a gerek yok, çünkü ElevenLabs sesi zaten zaman damgasıyla üretiyor. Alınabilecek iki fikir: "yorumlara anahtar sözcük yaz" ile etkileşim, ve kalite kontrolünü otomatik bir rapora çevirmek.
- **En çok değer katacak beş yenilik**, sırayla:
  1. ~~reels'te kelime kelime altyazı ve YouTube için SRT~~ (30 Ekim 2026: sahip altyazıyı istemedi);
  2. her dersten 3 reels türetmek;
  3. soru çözümünde kalem animasyonu (altını çizme, daire içine alma, şık eleme);
  4. "Bu konudan sınavda kaç soru çıktı" veri kartı;
  5. matematik kampı için denklem dönüşüm animasyonu.

## 2. Görseldeki öneriler bizim için ne ifade ediyor

Görsel, singreybuilds'in bir reels'i: "Tek prompt'la reels stüdyosu kur: Whisper sesi yazıya döker, Remotion videoyu çizer, ffmpeg ve diğer araçlar hallediyor."

| Öneri | Bizde durum | Karar |
|---|---|---|
| **Whisper** (sesi yazıya dökme, altyazı zamanlaması) | Seslendirmeyi biz üretiyoruz. ElevenLabs `convertWithTimestamps` her karakterin zamanını zaten veriyor ([`ElevenLabsSpeech.ts`](../src/Services/ElevenLabsSpeech.ts)); bu zamanları satırları ayırmak için kullanıyoruz. | **Gerek yok.** Kelime zamanlarını saklayıp altyazıya bağlamak yeter (§4.1). Dışarıdan gelen ses için (ör. kayıtlı bir öğretmen sesi) ElevenLabs Forced Alignment var. Whisper ancak yerel ve ücretsiz bir yedek olarak düşünülür (`@remotion/install-whisper-cpp`). |
| **Remotion** (videoyu kodla çizmek) | Motorun temeli: Remotion 4.0.534 sürümü, 22 şablon, three.js, KaTeX ve harita kullanıyor. | **Var.** Lisans kontrol edilmeli: 3 kişiyi aşan şirketler ücretli lisansa geçmek zorunda. Elle ya da AI ajanıyla üretim "Creators" kapsamında ve kişi başı aylık 25 $. Ekip büyüklüğünü sen belirle (§7). |
| **ffmpeg ve diğer araçlar** | Ses iki geçişle −14 LUFS'a çekiliyor ve −1 dB tepe tavanı var ([`AudioLeveling.ts`](../src/Services/AudioLeveling.ts)). Müzik ElevenLabs Music'ten geliyor, kapak otomatik üretiliyor, sosyal medya için 1080p kopya çıkıyor. | **Var.** |
| **/kurulum, boş klasör, tek prompt** | Bizde stüdyo hazır. Senaryo yazma bilerek yarı otomatik: önce senaryo, sonra denetim (`check`), sonra render. | Remotion'ın resmi ajan kural paketi (`npx skills add remotion-dev/skills`) Claude'un Remotion kodunu daha doğru yazması için denenebilir. **Düşük öncelik:** motorun kendi kuralları (`COURSE_DESIGN`, şemalar) daha sıkı. |
| **Kalite kontrol** | Sahne başına kare görüntüsü (`npm run stills`), metin taşma uyarıları, süre hedefi uyarısı, 627 test. | **Geliştirilecek:** otomatik QA raporu (§4.8). |
| **"Prompt için yorumlara STÜDYO yaz"** (yorumda anahtar sözcük, DM ile içerik) | Yok. | **Denenebilir:** "Yorumlara KAMP yaz, kampın çalışma planını DM'den gönderelim." Instagram'da otomatik DM için Meta API ya da ManyChat gibi bir araç gerekir. Ücretli olabilir; karar sende (§7). |

## 3. Araştırma bulguları

### Platform kuralları (resmî kaynaklar)

- **YouTube ara reklam**: 8 dakika ve üzeri videolarda ara reklam açılabilir. Mayıs 2025'ten beri YouTube reklamları doğal geçişlere yerleştiriyor. Kampın "en az 10 dakika" kuralı bu sınırın rahatça üstünde.
- **YouTube bölümleri**:
  - liste 0:00'da başlamalı;
  - en az 3 bölüm olmalı;
  - her bölüm en az 10 saniye olmalı;
  - kural bozulursa bölümler hata vermeden görünmez.

  Motor bu kuralları artık kendisi uyguluyor (`.chapters.txt`).
- **YouTube Shorts**: 15 Ekim 2024'ten beri 3 dakikaya kadar dikey video Shorts sayılıyor. 1 dakikayı aşan bir Short'ta telif talebi varsa video engellenebilir. Bu yüzden reels müziği ElevenLabs Music ile kendi üretimimiz kalmalı.
- **Instagram Reels**: Ocak 2025'ten beri 3 dakikaya kadar. Profil ızgarası dikdörtgen oldu, yani kapak görselinin ortası önemli. Instagram'ın erişim için önerisi hâlâ 90 saniye civarı. Kamp reels'imiz 60–120 sn; bu aralıkta kalmalı.

### İzlenme süresi ve dikkat (çoğu sektör blogu; rakamlar yön gösterir, kesin değildir)

- **İlk saniyeler**: reels için ilk 1,5–3 sn, YouTube için ilk 10 sn belirleyici. Uzun giriş ve tanıtım düşük performans veriyor. CampLesson'da hook önce geliyor, kamp kartı ondan sonra ve 3 saniyeyi geçmiyor.
- **Görsel değişim**: kaynaklar her 40–90 saniyede bir görsel değişim öneriyor; çok sık değişim odaklanmayı düşürüyor. Bizde her kart zaten bir değişim; beat'ler kart içinde de hareket getiriyor.
- **Altyazı**: reels'lerin çoğu sessiz izleniyor, altyazı şart sayılıyor. Bizde kelime kelime altyazı yok, en büyük eksik bu.
- **Uzun video**: 10 dakikayı aşan eğitim videolarında %35–50 ortalama izlenme oranı güçlü sayılıyor. Bölüm listesi izleyiciye ileri atlama imkânı verdiği için videodan tamamen çıkmayı azaltıyor.

### Öğrenme bilimi (Mayer'in çoklu ortam ilkeleri)

| İlke | Anlamı | Bizde |
|---|---|---|
| **İşaretleme** (signaling) | Önemli olanı vurgula: renk, ok, yakınlaştırma | Beat'lerde `focus` ve `zoom` var. Soru köklerinde yok (§4.3). |
| **Bölümleme** (segmenting) | Kısa, adlandırılmış parçalar | Bölümler, bölüm çubuğu ve YouTube bölümleri ✓ |
| **Fazlalık** (redundancy) | Anlatılan metni ekrana aynen yazma | Kartlar söylenenden azını yazıyor ✓. Uzun derste tam altyazı ekranda olmamalı; reels'te altyazı sessiz izleme için gerekli. |
| **Yakınlık** (contiguity) | Söz ve şekil aynı anda, yan yana | Beat'ler şekli cümleye bağlıyor ✓ |
| **Animasyon her zaman daha iyi değil** | Hareket ancak anlamı taşıyorsa işe yarar | 3B ve animasyonu derinliğin ya da sürecin anlamı taşıdığı yerde kullanıyoruz ✓ |

### Araçlar

- **Remotion paketleri**:
  - `@remotion/captions`: TikTok tarzı kelime grupları;
  - `@remotion/elevenlabs`: ElevenLabs dökümünden altyazıya;
  - `@remotion/paths`: SVG yolunu çizerek göstermek;
  - `@remotion/motion-blur`: hareket bulanıklığı. Renkleri bozabiliyor, dikkatli kullanılmalı;
  - `@remotion/transitions`: yeni bulanık kayma geçişleri. Chrome bayrağı istiyor, render ortamında denenmeli;
  - `@remotion/lottie` ve `@remotion/rive`: hazır animasyonlar;
  - `@remotion/skia`: hızlı 2B çizim.

  Grafikler için kural: üçüncü parti kütüphanelerin kendi animasyonu kapalı olmalı, her şey kare numarasından hesaplanmalı. Bizim görseller zaten böyle.
- **Manim / Motion Canvas**: Manim matematik animasyonunun standardı (3Blue1Brown). Ama Python'da çalışıyor ve bizim React ve şema düzenimize uymuyor. Bizim için doğru yol, Manim'in "denklem dönüşümü" fikrini KaTeX ve Remotion ile kendimiz yazmak (§4.5). Motion Canvas yalnız canvas'a çiziyor; bizdeki HTML, SVG ve three.js karışımını taşımaz.
- **ElevenLabs**: TTS ile birlikte karakter zamanları geliyor (kullanıyoruz). Forced Alignment API'si var olan ses ve metinden kelime zamanı çıkarıyor.
- **YouTube çok dilli ses**: Eylül 2025'te herkese açıldı; YouTube otomatik dublaj da yapıyor. Erken verilerde ek ses dili yükleyenlerin izlenme süresinin %25'ten fazlası ana dil dışından geliyor. ABD'deki SAT/ACT ve Avrupa açılımı için önemli (§4.9).

## 4. Yenilikçi grafik ve animasyon önerileri

Her öneri için: ne, neden, nasıl, emek (S küçük, M orta, L büyük).

### 4.1 Kelime kelime altyazı ve SRT (S–M) · iptal

> **30 Ekim 2026, sahip:** videolara altyazı eklenmez; altyazı alanı daraltıyor ve üretimi yoruyor. Tanıtım şablonlarındaki altyazı (`PromoSubtitle`) kaldırıldı. Aşağıdaki plan uygulanmayacak; YouTube için ayrı bir SRT dosyası ancak sahip isterse yapılır.

- **Ne:** Reels'te konuşulan kelimeyle birlikte yanan, 2–4 kelimelik altyazı; anahtar terim ders renginde. YouTube için `.srt` altyazı dosyası.
- **Neden:** Reels sessiz izleniyor. YouTube'da altyazı erişilebilirlik ve arama için önemli. Uzun derste ekrana altyazı basmıyoruz (fazlalık ilkesi); SRT ile isteyen açar.
- **Nasıl:**
  - ElevenLabs'ın karakter zamanlarını kelimelere çevirip `VoiceClip`'e `words` olarak sakla.
  - Altyazı kutusu Reels arayüzünün altta ve sağda kapladığı alana girmemeli: alttan ~%20, sağdan ~%12 boşluk.
  - `@remotion/captions` ile kelime grupları (`createTikTokStyleCaptions`); `formatChapters` yanına `formatSrt`.

### 4.2 Bir dersten üç reels (M) · öncelik 2

- **Ne:** Her kamp dersinden ana reels'e ek iki reels:
  - "Sık yapılan hata" kartı;
  - adım adım çözülen bir soru ("Bu soruyu 20 saniyede çöz").
- **Neden:** Instagram'da hacim ve sürekliliği sağlar. 15 derslik bir kamp 45 reels eder, bunların her biri YouTube dersine yönlendirir.
- **Nasıl:** Senaryoda kartları `clip: true` ile işaretle. `CampShort`'un yanına, tek kartı 9:16'ya yerleştiren bir `CampClip` şablonu. Seslendirme aynı kartın metni, yeni yazı yok.

### 4.3 Soru çözümünde kalem (M) · öncelik 3

- **Ne:** Çözüm adımı söylerken kökte anahtar ifadenin altı çizilir, bir sözcük daire içine alınır, elenen şıkların üstü çizilir, doğru şık işaretlenir. Hepsi elle çizilmiş gibi, `@remotion/paths` ile.
- **Neden:** İşaretleme ilkesi. Sınav çözme refleksini (eleme, anahtar sözcük) gözle gösterir. Türkçe paragraf ve anlam sorularında çok etkili.
- **Nasıl:** `QuestionSchema.steps[]` adımına `marks: [{target: "stem:12-18" | "option:C", kind: "underline" | "circle" | "strike" | "tick"}]` alanı. Çizim, mevcut beat zamanlamasına bağlanır.

### 4.4 "Sınavda kaç soru çıktı?" veri kartı (S–M) · öncelik 4

- **Ne:** Reels'in ilk 2 saniyesi için: "TYT'de son yıllarda Paragraf'tan her yıl ~X soru". Yıllara göre animasyonlu sütun grafiği.
- **Neden:** Reels için en güçlü kanca türlerinden biri: somut ve öğrenciyi doğrudan ilgilendiren bilgi.
- **Nasıl:**
  - Veri `Curriculum/Data` sorularındaki `source.year` ve `source.exam` alanlarından sayılır. ÖSYM kaynaklı 6.489 soru var; yıl alanı bir kısmında var.
  - **Dikkat:** derleme ve eşleştirme eksik olabilir. Sayı, ÖSYM'nin yayımladığı soru dağılımıyla doğrulanmadan ekrana çıkmaz.

### 4.5 Denklem dönüşümü (L) · matematik kampı için

- **Ne:** Bir çözüm adımında denklem yeniden yazılmaz. Aynı terimler yerinde kayar, sadeleşen terimler söner, yeni terim belirir (Manim'in TransformMatchingTex'i gibi).
- **Neden:** Türkiye'deki sınav içeriğinde neredeyse yok; matematik kampını ayırır. "Terim karşıya geçince işaret değiştirir" gibi kuralları gözle anlatır.
- **Nasıl:** KaTeX çıktısını parçalara böl, aynı LaTeX parçalarını eşleştir, konumdan konuma `spring()` ile taşı. Mevcut `equation` (terazi) görselinin yanına `morph` kipi.

### 4.6 Kinetik vurgu (S)

- **Ne:** Kart metnindeki **kalın** terim, anlatıcı o sözcüğü söylediği anda ders renginde belirir.
- **Nasıl:** PromoKit'teki `wordCues` mantığı ve §4.1'deki kelime zamanlarıyla.

### 4.7 Kapak ve küçük resim seti (S–M)

- **Ne:** Her kamp dersi için tutarlı YouTube küçük resmi: ders rengi, "Ders 3", büyük konu adı, tek görsel. Bundan üç varyant.
- **Neden:** Serinin rafta tanınması. YouTube'un küçük resim A/B testi ("Test & compare") için varyant gerekir. Bu özellik bu araştırmada doğrulanmadı, kullanılmadan önce kontrol edilecek.
- **Nasıl:** Mevcut `VideoCoverGenerator` ile `CampCover`.

### 4.8 Otomatik kalite raporu (M)

- **Ne:** Render sonrası tek sayfalık rapor:
  - sahne kareleri (kontakt sayfası);
  - süre hedefi ve ara reklam sınırı;
  - YouTube bölüm kuralları;
  - ses seviyesi (ölçülen LUFS);
  - metin taşmaları;
  - reels güvenli alanına giren yazı;
  - lisanssız görsel.
- **Neden:** Görseldeki "kalite kontrol" adımının otomatik hâli. İnceleme admin SocialHub'da yapıldığı için rapor oraya bağlanabilir.
- **Nasıl:** `sceneFrames` ve `AudioLeveling` ölçümü zaten var; bunları toplayan `scripts/QualityReport.ts`.

### 4.9 Çok dilli ses (M) · sonra

- **Ne:** Aynı dersin İngilizce ses parçası YouTube'a ek ses dili olarak yüklenir.
- **Neden:** Avrupa ve ABD açılımı (SAT/ACT). YouTube otomatik dublajı da var, ama marka sesi kendi ElevenLabs sesimiz olmalı.
- **Nasıl:** Senaryo `script` alanına dil başına metin; seslendirme dil başına bir kez; görüntü aynı kalır. Ekrandaki yazılar için ayrı bir render gerekir. Bu yüzden önce yalnız ses.

### 4.10 Küçük dokunuşlar

- **Hareket bulanıklığı:** yalnız geçişlerde ve hızlı kaymalarda. Renk bozulmasını kontrol et.
- **Ritim kesmeleri:** uzun bölümlerde 60–90 saniyede bir "tahmin" kartı ya da soru. `check` bunu sayıp önerebilir.
- **Lottie/Rive:** SinoAI ya da maskot yerine yalnız ikon animasyonları. Marka dilinde "koç" yok; karakter kullanılmıyor.

## 5. Kamp şablonu: bugün yapılanlar

| Parça | Dosya |
|---|---|
| Kamp planı ve senaryodaki kamp alanları | [`src/Courses/Camp.ts`](../src/Courses/Camp.ts), `Curriculum/Camps/` |
| YouTube kamp dersi (≥10 dk): kamp kartı, bölüm çubuğu, kamp görevi, sıradaki ders | [`src/Templates/Camps/CampLesson`](../src/Templates/Camps/CampLesson/CampLesson.tsx) |
| Kamp reels'i: kamp rozeti, "Ders N" yönlendirmesi | [`src/Templates/Camps/CampShort`](../src/Templates/Camps/CampShort/CampShort.tsx) |
| YouTube bölüm listesi (kurallarıyla), render yanında `.chapters.txt` | [`src/Scenes/SceneChapter.ts`](../src/Scenes/SceneChapter.ts) |
| Veri bağlama: içe aktarma `Curriculum/Data`'yı okuyor; `brief` anlatımın kaynağını, sayfalarını ve soru sayılarını gösteriyor | [`src/Courses/CurriculumImport.ts`](../src/Courses/CurriculumImport.ts) |
| Ders süresi kuralı: en az 10 dk, hedef 12 dk | `COURSE_DESIGN.length` |

`CourseLesson`, `CourseShort` ve diğer şablonlara dokunulmadı; kamp şablonları onların sahnelerini sarıyor.

## 6. Sıralı plan

| Faz | İş | Çıktı |
|---|---|---|
| **1 · bu hafta** | TYT Türkçe kampı 1. ders: Sözcükte Anlam'ın tam senaryosu (13 alt başlık, ≥10 dk, ≥3 çözümlü soru, kamp görevi). Ardından seslendirme, 4K render ve senin incelemen. | İlk kamp dersi + reels |
| | ~~§4.1 kelime kelime altyazı (reels) + SRT (YouTube)~~ iptal (30 Ekim) | — |
| **2** | §4.2 bir dersten üç reels · §4.3 soru çözümünde kalem · §4.6 kinetik vurgu | Kamp başına ~45 reels |
| | Kampın kalan 14 dersi, haftalık yayın sırasıyla | TYT Türkçe kampı tamam |
| **3** | §4.4 veri kartı · §4.7 kapak seti · TYT Matematik kampı ve §4.5 denklem dönüşümü | İkinci kamp |
| **4** | §4.8 otomatik kalite raporu · §4.9 çok dilli ses denemesi · KPSS kampları | Ölçeklenen üretim |

Her kamp dersinin akışı:
1. `brief` ile senaryo yazılır.
2. `check --mark` ile denetlenir.
3. 4K render alınır; `.chapters.txt` açıklamaya eklenir.
4. Reels render alınır.
5. Sen incelersin.
6. YouTube'a yükleme manuel yapılır (ilk yükleme her zaman elle).

## 7. Kararlar (25 Ekim 2026, sahip)

1. **Remotion lisansı:** ekip tek kişi. 3 kişiye kadar şirketler ücretsiz lisansla kullanabiliyor; ücretli lisans gerekmiyor. Ekip 3 kişiyi aşarsa yeniden bakılacak.
2. **Yayın temposu:** kamp dersleri neredeyse her gün çekilecek. Her ders sahibin komutuyla başlar; sıradaki ders kendiliğinden üretilmez.
3. **Yorumda anahtar sözcükle otomatik DM:** yapılmayacak.
4. **Altyazı:** 30 Ekim 2026'da karar verildi: videolara altyazı eklenmez.
5. **SinoAI'nin okunuşu:** "Sino Ey Ay" doğru. 31 Ekim 2026'da bitişik "Sinoeyay" ve "Sino Eyay" ile dinlenerek karşılaştırıldı; sahip yine "Sino Ey Ay"ı seçti.
6. **Kimya ile Almanca'nın aynı renkte olması:** sorun değil, kalıyor.

## Kaynaklar

- Remotion: [altyazı API'si](https://remotion.dev/docs/captions/api), [ses yazıya dökme](https://www.remotion.dev/docs/captions/transcribing), [TikTok şablonu](https://github.com/remotion-dev/template-tiktok), [hareket bulanıklığı](https://www.remotion.dev/docs/motion-blur-guide), [geçişler](https://www.remotion.dev/docs/transitions), [Skia](https://www.remotion.dev/docs/skia), [Rive](https://cloudrun.remotion.dev/docs/rive), [lisans ve fiyat](https://www.remotion.dev/docs/license/pricing), [Remotion ve Motion Canvas](https://www.remotion.dev/docs/compare/motion-canvas)
- Remotion ve Claude Code: [OpenReplay rehberi](https://blog.openreplay.com/making-videos-claude-code-remotion/), [Remotion Skills rehberi](https://gaga.art/blog/?p=1287), [grafik kuralları](https://cdn.jsdelivr.net/npm/@colin4k1024/tsp@2.5.2/skills/remotion-video-creation/rules/charts.md)
- Araç karşılaştırması: [Remotion, Motion Canvas, Manim](https://beginnersinai.org/remotion-vs-motion-canvas-vs-manim/), [Manim web ve React](https://www.sitepoint.com/manim-web-3blue1brown-mathematical-animations-react/)
- ElevenLabs: [Forced Alignment](https://elevenlabs.io/docs/capabilities/forced-alignment), [zaman damgalı akış](https://elevenlabs.io/docs/api-reference/streaming-with-timestamps)
- YouTube: [ara reklamlar](https://support.google.com/youtube/answer/6175006?hl=en), [3 dakikalık Shorts](https://support.google.com/youtube/answer/15424877?hl=en), [bölüm kuralları](https://www.storyblocks.com/resources/tutorials/how-to-add-chapters-to-youtube-video), [bölümler](https://timeskip.io/blog/youtube-chapters), [çok dilli ses](https://techcrunch.com/?p=2489593), [otomatik dublaj](https://www.tbsnews.net/node/1353236)
- Instagram: [3 dakikalık Reels ve yeni ızgara](https://www.engadget.com/social-media/instagram-swoops-in-with-3-minute-reels-and-rectangular-profile-grids-as-the-tiktok-ban-gets-real-201316339.html), [uzunluk önerileri](https://klap.app/blog/instagram-reels-length), [Reels iyi uygulamaları](https://quso.ai/blog/instagram-reels-best-practices.html)
- İzlenme süresi (sektör blogları): [senaryo ve kanca](https://rivereditor.com/guides/how-to-script-youtube-videos-2026), [izlenme taktikleri](https://www.startmotionmedia.com/2025/08/10/27-battle-tested-tactics-to-max-video-retention/), [Uppbeat](https://fastly-f.uppbeat.io/blog/youtube-growth/youtube-analytics/youtube-audience-retention)
- Öğrenme bilimi: [Mayer'in 12 ilkesi](https://elearning.adobe.com/2019/12/12-principles-of-multimedia-learning-relevant-to-video-from-richard-e-mayers-work), [Learning Scientists](https://www.learningscientists.org/blog/2021/7/1-1), [NUS özeti](https://medicine.nus.edu.sg/medixperience/?p=148)
- Ses seviyesi: [ffmpeg loudnorm rehberi](https://dev.to/javidjamae/ffmpeg-loudnorm-filter-ebu-r128-loudness-normalization-guide-15d4)
