# Geliştirme Rehberi

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
sesli ve sessiz videoyu üretir. `SceneSeries` klipleri sahnenin içinde sırayla çalar. Klipler metin + ses ayarının
özetiyle adlandırılıp önbelleğe alınır; aynı iş tekrar render edildiğinde aynı ses dosyaları kullanılır.

**Ses merkezîdir: katalog → profil → seçim.** `Configurations/Voices.ts` kimin (ses), nasıl (profil: rol, sıralı
ses listesi, model, tempo) ve nerede (kategori/template → profil) konuştuğunu tanımlar. Template'ler ses kimliği
bilmez, yalnızca profil adı verir. `Services/VoiceCasting.ts` isteği hesabın kullanabildiği seslere göre somut bir
sese çevirir (saf fonksiyon); `Services/ElevenLabsSpeech.ts` ElevenLabs'e giden tek kapıdır. Profilin ilk tercihi
hesapta yoksa listedeki sıradaki ses seçilir ve bu, sonuçta `voiceCast.note` olarak bildirilir; işte açıkça
istenen bir ses yoksa sessizce değiştirilmez, hata verilir. Tempo ses üretilirken değil oynatılırken uygulanır
(Eleven v3 `speed` ayarını dikkate almıyor), bu yüzden tempo değişikliği yeniden üretim ve kredi gerektirmez.

**Kapsam dışı bırakılanlar.** HTTP sunucusu, kuyruk, bulut depolama, LLM çağrısı, altyazı yoktur. Girdi JSON, çıktı dosyadır;
bunların hepsi bu sınırın dışına eklenebilir.

## Yeni template eklemek

`src/Templates/<Kategori>/<TemplateAdı>/` altında dört dosya:

| Dosya | İçerik |
| --- | --- |
| `<Ad>Schema.ts` | İçerik Zod şeması. Sahne niteliğindeki öğeler `SceneTimingSchema.extend(...)` kullanır |
| `<Ad>Sample.ts` | Şemayı geçen örnek içerik (Studio varsayılanı, testlerde kullanılır) |
| `<Ad>Scenes.tsx` | Sahne bileşenleri |
| `<Ad>.tsx` | `defineTemplate({...})`: `buildScenes`, geçiş, üst katman |

Sonra `TemplateRegistry.ts` içine tek satır eklenir. Studio'da üç formatta görünür, `npm run render`/`validate`/`schema`
ile çalışır ve `tests/Templates.test.ts` ile `tests/VideoRenderer.render.ts` içindeki genel testlere otomatik girer.
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

## Yeni tema eklemek

`src/Themes/<TemaAdı>.ts` dosyasında bir `Theme` nesnesi tanımlayın ve `ThemeRegistry.ts` içine ekleyin. Bütün
template'ler temayı hemen kabul eder. `tests/VideoJob.test.ts` renklerin 6 haneli hex olduğunu ve metin/zemin
çiftlerinin WCAG kontrastını otomatik denetler. Yeni bir font gerekiyorsa `@fontsource-variable/<font>` paketini
kurup `FontFamilies.ts` ve `FontFaces.ts` içine ekleyin (Türkçe için `latin-ext` alt kümesi olmalı).

## Diğer genişletmeler

| Ne | Nerede |
| --- | --- |
| Yeni görsel türü (ör. sayı doğrusu, grafik) | `Schemas/Visual.ts` içine bir şema, `Illustration.tsx` içine bir `case` |
| Konu anlatımına yeni blok türü | `TopicBlockSchema` içine bir şema, `TopicBlockView` içine bir `case` |
| Yeni animasyon preset'i | `AnimationSpec.ts` içindeki liste, `AnimationStyle.ts` içine bir `case` |
| Yeni sahne geçişi | `SceneTransition.ts` (sahneler saydamdır; yalnızca eski sahneyi götüren geçişler uygundur) |
| Yeni video formatı veya kalite | `Configurations/VideoFormats.ts` |
| Yeni ses | `Configurations/Voices.ts` içindeki `VOICES`; sonra bir profilin listesine (denemek için başına) ekleyin |
| Yeni ses profili (ör. çocuklara yönelik) | `VOICE_PROFILES`; template tanımında `voiceProfile` ile kullanın |
| Bir içerik türünün sesi, modeli, temposu | İlgili profil. Model: `expressive` (v3) ya da `stable` (Multilingual v2) |
| Yeni model (ör. Eleven v4) | `VOICE_MODELS` içine bir satır |
| Okunuş kuralı (birim, formül) | `Schemas/SpokenText.ts` |
| Logoyu ya da boyutlarını değiştirmek | `public/Brand/SinavikaLogo.png` (şeffaf zeminli PNG) ve `Configurations/Brand.ts`. Logo yalnızca `BrandMark` ile çizilir; dosyanın rengi önemli değildir, zeminin metin rengine boyanır |
| Derse özel bileşen | `Components/` altına; ilgili template sahnesinde kullanılır. Derse özel render motoru yoktur |

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

Template'in karşılayamadığı özel animasyonlar için LLM'in **kod** üretmesi ayrı bir konudur ve bilinçli olarak
uygulanmamıştır. Eklenecekse üretilen kod uygulama sunucusunda değil, ağ ve dosya erişimi kısıtlı ayrı bir
sandbox'ta derlenip render edilmeli ve insan onayından geçmelidir.

## Bilinen kısıtlar

- **Türkçe (ana dili) sesler ücretli plan ister.** Ücretsiz planda ElevenLabs kütüphane seslerini API'den
  kullandırmaz; profiller o durumda çok dilli varsayılan seslere düşer. Bu sesler Türkçe konuşur ama ana dili
  Türkçe olan seslendirmenler değildir.
- **Ücretsiz planın çıktısı ticari kullanıma uygun değildir** (ElevenLabs lisansı ücretli planla gelir) ve dönem
  başına 10.000 karakterle sınırlıdır; bir video kabaca 700–1.100 karakter harcar.
- **Ses seçimi kulakla doğrulanmadı.** Katalogdaki Türkçe sesler kütüphane verisine (kullanım amacı, yaygınlık,
  açıklama) göre seçildi. `npm run voices -- --audition "..."` ile dinleyip listeleri düzenleyin.
- **Eleven v3 tonlaması satırdan satıra değişebilir** ve `seed` yalnızca en iyi çabadır: aynı satır yeniden
  üretilirse biraz farklı duyulabilir. Önbellek, render edilmiş bir videonun sesini sabit tutar. İstikrar
  gereken içerikte işte `"model": "stable"` kullanın.
- **Seslendirme ağ gerektirir** (önbellekte olmayan satırlar için) ve anlatım metni ElevenLabs'e gönderilir.
- **Formül okuma en iyi çabadır.** Okul düzeyi ifadeler okunur; karmaşık ifadelerde `narration` verin.
- **Altyazı ve arka plan müziği yok.** Satır metinleri ve süreleri elde olduğu için altyazı eklenebilir.
- **Ses ile ekran eşlemesi sahne düzeyindedir:** sahne, sesi kadar sürer ve öğeler süreye yayılır; kelime
  kelime eşleme yapılmaz.
- **Marka renkleri varsayımdır.** Logo gerçek Sınavika logosudur (`public/Brand/SinavikaLogo.png`), ama
  `SinavikaBrand` temasındaki renkler henüz resmî marka renkleri değildir.
- **Görseller yalnızca `public/` içinden ya da URL'den okunur.** URL'li görsel render sırasında ağ gerektirir.
  SVG görsellerin içindeki yazılar sistem fontuyla çizilir.
- **Studio'da "Can't save default props" uyarısı** beklenen bir durumdur: varsayılan props dosyadaki sabit bir
  nesne değil, şemadan geçirilmiş örnek içeriktir. Props panelinde düzenleme ve önizleme çalışır.
- **Sahne geçişleri fade ve slide ile sınırlıdır** (sahneler ortak, sabit bir arka plan üzerinde saydamdır).
- **Diyagramlar basittir:** akış (2–5 düğüm), döngü (3–6 düğüm), kavram haritası, formül, görsel. Koordinat
  düzlemi, grafik, geometri çizimi yoktur.
- **Süre tahmini sezgiseldir** (kelime sayısı). Seslendirme gelene kadar `durationSeconds` ile elle ayarlanabilir.
- **Render tek makinede, tek süreçte çalışır.** Eşzamanlı iş sayısını çağıran taraf sınırlamalıdır.
