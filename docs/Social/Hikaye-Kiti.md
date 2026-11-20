# Hikâye kiti (sinavika.tr reels'leri)

15 Kasım 2026. Dokuru tarzı sinavika.tr reels'leri için ortak altyapı. İsteği Sosyal Medya Yönetimi oturumu iletti; sahibin değerlendirmesi: "Dokuru videolarındaki heyecan yok, akış çok yavaş."

Kod `src/Components/Story/` altında. Şablonlar kendi görünümünü kurar, parçaları buradan alır; aynı parçanın şablona özel kopyası yazılmaz. Tempo değerleri sahibin onayladığı `SINAVIKA_TR_TEMPO`'dan (`src/Configurations/SocialTempo.ts`) gelir; kitte ikinci bir ayar yoktur.

Kitin vitrini: `StoryKit` kompozisyonu, 17 sahne × 3,5 sn (8 ve 9: saat; 10–17: "Dediniz, yaptık"). Şablon değildir, yayımlanmaz. Varsayılan görünümü sıcak gridir; başka bir görünüme `--props` ile bakılır:

```bash
npx remotion still StoryKit kit.png --frame=80
```

```bash
npx remotion still StoryKit kit-kagit.png --frame=400 --props="{\"look\":\"paper\"}"
```

## Görünüm (`look`)

17 Kasım 2026, sahip kararı: her sinavika.tr videosu sanat yönünü prompt-motion.com'daki bir prompttan alır. Sürekli lacivert zemin kalktı; art arda iki video aynı görünmez.

İş dosyasında `content.look` iki biçimde yazılır:
- hazır bir görünümün adı: `"look": "paper"`;
- hazır görünüm ve değişen alanlar: `"look": {"preset": "warmGrey", "accent": "#B45309", "cardAccent": "#B45309", "palette": ["#B45309"]}`.

Alan yazılmazsa görünüm `warmGrey` olur. Lacivert yalnız adıyla seçilince gelir.

| Görünüm | prompt-motion yönü | Zemin | Vurgu |
|---|---|---|---|
| `warmGrey` | Shape morphing through UI states | açık sıcak gri, düz | tek vurgu `#C2410C`; kartlar beyaz, etiket siyah |
| `paper` | kâğıt / el yapımı | krem gradyan, kâğıt dokusu | kırmızı kalem `#B91C1C`, kahve yazı |
| `boldColour` | düz canlı renk, büyük kinetik yazı | koyu turuncu `#C2410C`, düz | sarı `#FDE047`; yazı 1,2 kat büyük |
| `ink` | koyu ama lacivert değil | kömür gradyan, sıcak lamba | turuncu `#F97316` |
| `navy` | ilk görünüm | lacivert gradyan, lamba | turuncu `#F97316` |

Bir görünümün alanları (`src/Components/Story/StoryLook.tsx`):
- `ground`: `colors` (bir renk düz, iki renk yukarıdan aşağı gradyan), `texture` (`none` / `paper`), `light` (lamba ışığının rengi ya da `null`);
- `palette`: en çok 3 renk; siyah, beyaz ve griler serbest;
- `ink`: zemindeki yazı ve logo;
- `accent`: zemindeki vurgu, yani anahtar sözcükler ve sayılar;
- `cardAccent`: kâğıt üstündeki vurgu (çubuklar);
- `paper` ve `sticky`: kart tonları;
- `chip`: etiketin zemini ve yazısı;
- `card`: kapanış kartının zemini; yazılmazsa zeminin kendisi, lambasız;
- `typeScale`: anahtar ifade ve sayıların büyüklüğü.

Kitin bütün parçaları görünümü `StoryLookProvider`'dan okur: `KeyPhrase`, `NumberPop`, `Paper`, `StickyNote`, `CompareBars`, `QuestionCard`, etiket ve kapanış kartı. Şablon zemini kendisi çizmez, `StoryGround` kullanır.

**Denetim.** `lookIssues` okunmayan görünümü reddeder; iş dosyası doğrulanırken hata verir. Ölçülenler:
- zemindeki yazı her zemin renginde en az 4,5:1;
- vurgu her zemin renginde en az 3:1;
- kâğıt ve yapışkan nottaki yazı en az 4,5:1;
- kâğıttaki çubuk vurgusu en az 3:1;
- etiket yazısı en az 4,5:1;
- kapanış kartındaki logo en az 4,5:1;
- görünümdeki her renk ya nötrdür ya paletteki bir rengin tonudur (±15° renk tonu).

Kalemin doğru (yeşil), yanlış (kırmızı) ve cevap (mavi) işaretleri her görünümde aynı anlamı taşır, palete girmez.

**Seri kuralı.** `Posts/Seri-SinavikaTr` altında dosya adı sırasıyla art arda iki işin görünümü aynıysa:
- `tests/Configurations/SocialTempo.test.ts` kırılır;
- `npm run validate` ise uyarı basar.

Görünümler gelmeden yapılan 01–07 pilotları testte adlarıyla muaftır. Onlar lacivertle render edildi; yeniden render edilecekse iş dosyalarına `"look": "navy"` yazılmalı, yoksa sıcak gri çıkarlar.

## Parçalar

| Dosya | Ne verir |
|---|---|
| `StoryStage.tsx` | `StoryStage`: 1080 × 1920 hikâye sahnesini videonun kendi boyutuna ölçekler. Bütün parçalar 1080 genişliğe göre çizer; 1440p ya da 2160p render'da da aynı resim, daha keskin çıkar. Her sahne bunun içine konur (`STORY_STAGE` ölçüleri). |
| `StoryTiming.ts` | `subBeats(clip, satır, 1.2)`: anlatım satırını Doğa'nın gerçek sözcük zamanlarından ≤1,2 sn'lik alt vuruşlara böler. Virgül ve noktada keser; ses yokken tahmini süreye yayar. Tek sözcüğün anı için `phraseCues` (`Scenes/Voiceover`). PromoKit'in orantılı `wordCues`'u yerine bunlar kullanılır. |
| `StoryCamera.tsx` | `StoryCamera moves={[...]}`: `punch` (sahne başında 105 %'ten yumuşak yakınlaşma, alt vuruşlarda 101,5 %'ten yavaş itme; değerler `SINAVIKA_TR_TEMPO.cut` ve `.subBeat`), `shake` (sönen sarsıntı), `whipOut` / `whipIn` (bulanık hızlı kaydırma), `flash` (beyaz kesme). Her hareketin kendi sesi var (`sound: null` susturur). Hesaplar saf fonksiyon: `punchScale`, `shakeOffset`, `whipPan`, `flashOpacity`. |
| `StoryType.tsx` | `KeyPhrase`: anahtar ifade sözcük sözcük düşer; `keywords` turuncu ve fosforlu. `times` verilirse her sözcük söylendiği anda düşer. `NumberPop`: sayı sayar, büyüyüp oturur. Altyazı değildir, yalnız anahtar ifade içindir (altyazı yasağı sürüyor). |
| `StoryMaterial.tsx` | `StoryGround`: görünümün zemini (düz ya da gradyan, kâğıt dokusu, nefes alan lamba). `Paper`: kâğıt dokusu, gölge, kıvrık köşe, isteğe bağlı çizgili defter sayfası. `HandMark`: elle çizilir gibi kırmızı çarpı, yeşil tik, daire, alt çizgi, ok. `Highlight`: fosforlu kalem. Kâğıt rengi ve gölgenin açık ya da koyu zemine uyumu görünümden gelir. |
| `StoryCard.tsx` | `StickyNote`, `ExamSheet` (deneme kâğıdı; işaretler sesle düşer, net kırmızı kalemle), `TopicList`, `NetChart`, `CompareBars`, `QuestionCard`. Hepsi masaya düşer gibi girer (`at`, 106 %'ten ve 2° eğik, sekmeden; `SINAVIKA_TR_TEMPO.land`) ve kendi sesini çalar. |
| `StoryStudent.tsx` | Çizim öğrenci. Pozlar: `slumped`, `upright`, `surprised`, `happy`, `phone`, `wrist` (bileğini kaldırıp saate bakar), `wristTap` (öbür elin parmağı saatte). `watch="apple" \| "wear"` sol bileğe kare ya da yuvarlak saat takar; camı yalnız saate bakarken yanar, görünümün vurgu renginde. `keys={[{at, pose}]}` ile pozlar 0,35 sn'de birbirine geçer. Göz kırpar ve nefes alır; durduğu pozda da kıpırdar. |
| `StoryDevice.tsx` | Gerçek UI/UX ekranı, kimliğine göre kendi cihazında: telefon, tablet (yatay ya da dikey), Apple Watch, yuvarlak Wear OS, tarayıcı. Ekranlar tek kaynaktan gelir (`Desktop\Sinavika-UIUX3`); tablet `t-*`, saat `k-*`. `screens={[{id, at}]}` ile tek cihaz sayfadan sayfaya geçer: yeni ekran sağdan kayar, eskisi biraz sola çekilir, geçişin sesi çalar. Geçiş ekran başına seçilir (`screens[].transition`, yoksa cihazınki): `slide` sağdan kayar; `morph` yerinde dönüşür, yeni ekran %92'den yay (spring) ile büyür; `rise` bildirim gibi alttan yükselir, eskisi geri çekilip kararır; `flip` kart gibi döner (önce soru yüzü kenara döner, sonra cevap öbür kenardan gelir). Her geçişin kendi sesi var: kayma, dönüşüm, `pop`, `cardFlip`. Saatte ayrıca `buzzes={[{at}]}` (titreşim) ve `taps={[{at, x, y}]}` (öbür elin parmağı; x, y ekranın 0–1 oranı) verilir; telefonda ya da tablette bunlar hata verir. Bir sıradaki bütün ekranlar aynı cihazdan olmalı; saat sayfası telefona kaymaz, karışık sıra hata verir. |
| `StoryLook.tsx` | Görünüm: hazır görünümler (`STORY_LOOKS`), `StoryLookProvider`, `useStoryLook`, iş dosyası alanı (`StoryLookFieldSchema`), denetim (`lookIssues`), seri denetimi (`repeatedLooks`). Kâğıt ve kalem renkleri (`STORY_COLORS`) de burada. |
| `StoryCursor.tsx` | `StoryCursor clicks={[{at, x, y}]}`: fare imleci her noktaya yumuşakça kayar, basar; tıkladığı yerde vurgu renginde bir halka yayılır, dokunma sesi çalar. UI dönüşümü yönü için. Telefondaki başparmak (`StoryPhone`) aynı hareketin dokunmatik hâlidir. |
| `StoryWrist.tsx` | Bilekte saat, yakın plan: kol kadrajı yatay geçer (gömlek kolu, ön kol, kayış, gevşek yumruk), saat üstte. Kutusu saatin kasasıdır, yerleşim saate göre yapılır; kol kutudan taşar. `at` anında kol aşağıdan dönerek kalkar. Apple Watch ve Wear OS aynı API ile, ekranlara göre (`k-apple-*` kare, `k-wear-*` yuvarlak). `screens`, `transition`, `buzzes`, `taps` `StoryDevice` ile aynı. Saatte ve kayışta marka logosu yok. |
| `StoryPhone.tsx` | Öğrencinin elindeki telefon. Markasız ana ekran: soyut renkli simgeler, genel adlar (Akış, Video, Mesaj…), bildirim rozetleri, saat, açık ya da koyu duvar kâğıdı. Gerçek uygulama logosu yok; tek gerçek simge Sınavika'nın. `touches={[{at, app, kind: 'hover' \| 'tap'}]}`: parmak yay çizerek simgeye gider; `hover`'da duraksar, titrer ve geri çekilir; `tap`'te basar. Son dokunulan uygulama simgesinden büyüyerek ekranı kaplar ve `screens`'e (gerçek UI/UX ekranları) açılır; sonraki ekranlar kayarak gelir. Dokunuşun ve açılışın sesi var. |

## Saat (Aralık 2026 tanıtımı)

Sosyal Medya, 19 Kasım 2026: Apple Watch ve Wear OS tanıtımı. Plan ve hook'lar `docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md` ("Aralık 2026: saat tanıtımı").

- **Titreşim (`buzzes`):** kasa 0,42 sn sönerek sarsılır; kenarından vurgu renginde iki dalga yayılır, yanlarda titreşim çizgileri çıkar; `hapticBuzz` sesi (iki kısa motor vuruşu) çalar. Ardından bildirim ekranı `rise` ile alttan gelir. İkisi de `on` sözcük ipucuna bağlanır.
- **Kart çevirme:** `k-apple-kart` → `k-apple-kart-cevap`, `transition: "flip"`. "Bildim" düğmesi `k-apple-kart-cevap`'ta x 0,75, y 0,76; "bilmedim" x 0,25, y 0,76.
- **Dokunuş (`taps`):** parmak ucu sağ alttan gelir, tırnağıyla birlikte; düğmeye basar, camda beyaz halka yayılır, `uiTap` çalar.
- **Bilekte:** yakın plan için `wrist` öğesi (StoryWrist), geniş planda öğrencinin `wrist` / `wristTap` pozları ve `watch`.
- **İki platform yan yana:** aynı sahnede iki `device` ya da `wrist` öğesi, ekranları aynı `on` ipuçlarıyla. Ekranlar UI/UX çizimi olduğu için sayaç akmaz; 18:42 sabit görünür.
- **Henüz yok (ikinci dalga):** telefondan saate geçiş (ters çevrilen telefon), kadrandaki komplikasyondan uygulamanın büyüyerek açılması, iPhone kilit ekranı ve Dynamic Island'ın açılması, akan sayaç.

İş dosyasında (StudyDeskStory):

```json
{"kind": "wrist", "id": "k-apple-kadran", "width": 300, "x": 390, "y": 700, "on": "bileğine",
 "screens": [{"id": "k-apple-kadran"}, {"id": "k-apple-bildirim", "transition": "rise", "on": "Odak bitti"}],
 "buzzes": [{"on": "Odak bitti"}]}
```

```json
{"kind": "device", "id": "k-apple-kart", "width": 380, "x": 120, "y": 400,
 "screens": [{"id": "k-apple-kart"}, {"id": "k-apple-kart-cevap", "transition": "flip", "on": "cevap"}],
 "taps": [{"x": 0.75, "y": 0.76, "on": "bildim"}]}
```

```json
{"kind": "student", "watch": "apple", "x": 320, "y": 1200, "poses": [{"pose": "upright"}, {"pose": "wrist", "on": "saatine"}, {"pose": "wristTap", "on": "dokun"}]}
```

## "Dediniz, yaptık" (20 Kasım 2026)

Sosyal Medya, 20 Kasım 2026, sahip onaylı ana seri. Kurallar `docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md` "Ana seri" bölümünde, ilk senaryolar `Posts/Seri-DedinizYaptik/Senaryolar.md` (D1, F1, F4). Hepsi `StudyDeskStory` iş dosyasının öğeleri. Tempo, Doğa sesi ve altyazı yasağı değişmedi.

Örnek kareler: `StoryKit` sahne 10–17. Sahne n'nin ilk karesi (n−1) × 105:

```bash
npx remotion still StoryKit dy.png --frame=1305
```

| Öğe (`kind`) | Ne yapar | Kod |
|---|---|---|
| `beforeAfter` | Aynı ekranın önce ve sonra hâli aynı cihazda. `on` anında yeni ekran soldan sağa silinerek gelir (`transition: "wipe"`, varsayılan; vurgu renginde çizgi, `morph` sesi) ya da kayar (`"slide"`). Altta "Önce · Sonra" etiketi yanan tarafı gösterir (`label: false` kaldırır). Her tarafa ayrı `glass`. | `StoryBeforeAfter.tsx` |
| `comment` | Anonim yorum balonu: kâğıt balon, kuyruk solda ya da sağda (`tail`). Kullanıcı adı, avatar, beğen/yanıtla yok. Sözcükler sırayla düşer (`reveal: "words"`), harf harf yazılır (`"type"`, imleç ve klavye sesi) ya da hepsi birden gelir (`"all"`). `keywords` vurgu renginde, `label` üstte küçük satır ("Bize yazdınız"). `size` 36–96: balon hook'u da taşıyabilir. `text` yazılmazsa kapanıştaki boş balon olur, imleç yanıp söner. | `StoryComment.tsx` |
| `device` + `glass` | Gerçek ekranın üstünde motorun kurgusu; ekran değişmez. Aşağıdaki "Cam kurguları". `screens[].glass` ile sıradaki ekrana da konur. | `StoryGlass.tsx` |
| `screens[].transition: "top"` | Sayfa en başa döner: yeni ekran yukarıdan iner, eskisi aşağı itilir; hızlı, hareket yönünde bulanık, whoosh. F1 sahne 5: "her yeni soru en baştan açılıyor". | `StoryDevice.tsx` |
| `moves: squeeze / release` | Sıkışma: kenarlar içe kapanır, resim daralır, `puzzleSnap` (kilit) sesi. Açılma: kenarlar açılır, resim biraz taşıp oturur, `unlock` sesi. Sahne başındaki `release` (`at: 0`) önceki sahnenin kapalı bıraktığı kadrajı açar. Sarsıntı için ayrıca `shake`. | `StoryCamera.tsx` |
| `power` | 5^(1/2): `steps` `right` (üs küçük ve yukarıda) / `dropped` (kesir satıra düşer, "5 ½"). Düşüşte `blockDrop`, kalkışta `puzzleSnap`. `base` ve `exponent` LaTeX. | `StoryMath.tsx` |
| `root` | Kök: `broken` (çizgi kökten kopmuş, yukarıda süzülür) / `fixed` (çizgi kancaya oturur, klik). `terms` sırayla girer, çizgi onlarla uzar; her terimde `uiTap`. | `StoryMath.tsx` |
| `match` | Aynı ifade telefonda ve tarayıcıda yan yana, her biri kendi ekranının ortasında. Arkada gerçek formül ekranı silik görünür (`m-ders-formul`, `w-ders-formul`), bağlam için. `on` anında iki çerçeve birbirine kayar, ekran merkezleri tek noktada buluşur. Öndeki telefon yarı saydamlaşır; vurgu rengindeki ifadesi webdeki mürekkep ifadenin tam üstüne oturur, ifade iki çerçevenin de içinde kalır. Sonra yeşil tik ve `success` (Sosyal Medya düzeltmesi, 20 Kasım). | `StoryMath.tsx` |
| `desk` | Kütüphane masası, yeşil abajurlu (`lamp`). Öğrencinin kolları üst yüzeye gelecek şekilde öğrenci masanın arkasına konur. | `StoryDesk.tsx` |
| `booklet` | Başka yayının deneme kitapçığı: kendi rengi (`color`, varsayılan petrol yeşili; turuncu değil), uydurma yuvarlak işaret, gerçek yayın adı yok. | `StoryDesk.tsx` |
| `slip` | Net kâğıdı: `write` anında köşeye kırmızı kalemle net yazılır (`net`), `fall` anında masanın kenarına kayıp düşer (`side` 1 sağa, −1 sola). | `StoryDesk.tsx` |

Matematikte rakam ve kesirleri motorun formül çizicisi (KaTeX, `MathExpression`) çizer. Kökün kancası ve çizgisi ayrı çizilir ki çizgi kopabilsin. Bozuk hâller videonun kurgusudur, uygulamanın çizimi değildir.

### "Önce" ekranları

Eski ekranlar UI/UX setinden silindi (tek ilk sürüm kuralı). "Önce" hâli motorda, aynı UI/UX bileşeninin eski davranışlı verisiyle çizilir; Sinavika-UIUX3'e çıkmaz, `Ekran-Envanteri`'nde yoktur. Kimlikler `StoryBefore.tsx` → `STORY_SCREENS`:

| Kimlik | Ne | Eşi |
|---|---|---|
| `once-deneme-sonuclar` | Sonuçlar, "Deneme ekle" öncesi: yalnız 4 Sınavika denemesi, "Son 4 deneme"; 5. yer boş, kesik çizgili çerçevesi yanıp söner; "Deneme ekle" satırı yok. | `m-deneme-sonuclar` |
| `once-test-vitrin` | Testler, uzun konu adı ("Paragrafta anlam, ana düşünce ve yardımcı düşünce · Orta") slaytta 2 satırda "…" ile kesik (2.12.1 öncesi). | `sonra-test-vitrin` |
| `sonra-test-vitrin` | Aynı slayt bugün: başlık tam, 3 satır. Setteki `m-test-vitrin`'in kısa örnek başlığı farkı göstermediği için aynı ekran uzun veriyle. | `once-test-vitrin` |

Bunun için UI/UX'e yalnız geriye uyumlu seçenekler eklendi; setteki çizimler değişmedi: `ModuleSlide` `clamp`, `TestsHomeScreen` `slide`, `ExamResults` `bars` / `sub` / `withAdd` (dışa açıldı), `NetBars` boş yer (`null` değer).

### Cam kurguları (`glass`)

Yerler ekranın 0–1 oranı (x genişlik, y yükseklik). Her kurgu `on` ya da `at` alır.

| `kind` | Alanlar | Ne olur |
|---|---|---|
| `push` | `y`, `by`, `seconds` (1), `fill` [üst, alt], `inset` | `y`'nin altındaki her şey `by` kadar aşağı kayar. Boşluk `y`'nin hemen üstündeki satırın zeminiyle dolar, üstüne `fill` dilimi tekrar eder. `inset` dilimin solundan bir sütunu (tekrar etmemesi gereken simge) dışarıda bırakır. Panel uzar, altındaki düğme ekrandan çıkar. `fill` `y`'nin üstünde olmalı; olmazsa doğrulama hata verir. |
| `swipe` | `from` {x, y}, `to` {x, y}, `seconds` (0,5) | Parmağın dokunma izi kayar (kaydırma), hafif whoosh. |
| `highlight` | `x`, `y`, `width`, `height` | Bir parçanın çevresinde vurgu renginde halka, `pop` ile gelir, nabız gibi atar ve kalır. |
| `tap` | `x`, `y` | Parmak izi bir noktaya (düğmeye) basar, vurgu renginde halka yayılır, `uiTap`. |
| `rise` | `x`, `y`, `width`, `height`, `seconds` (0,55), `ground` (`#FFFFFF`) | O parça, anına kadar kartın zemin rengiyle gizlenir; sonra kendi kutusunun altından yükselir, biraz taşar ve oturur (`puzzleSnap`). D1 sahne 5: çizgili sütun. |

`m-test-coz-yanlis` ölçüleri (F1):
- çözüm paneli metni `fill: [0.766, 0.813]`, `inset: 0.15` (kırmızı çarpı simgesi tekrar etmez);
- bölme `y: 0.815`, `by: 0.24` ile "Devam" ekrandan çıkar;
- "Devam" düğmesi `highlight` `{x: 0.045, y: 0.895, width: 0.91, height: 0.065}`;
- "Devam"a dokunuş `tap` `{x: 0.5, y: 0.927}`, ardından `m-test-coz` `transition: "top"`;
- `m-deneme-sonuclar`'da çizgili sütunun yükselmesi `rise` `{x: 0.755, y: 0.385, width: 0.15, height: 0.11}`, halkası `{x: 0.75, y: 0.38, width: 0.155, height: 0.15}`.

### İş dosyasında

```json
{"kind": "comment", "label": "Bize yazdınız", "text": "Kütüphanede kendi denememi çözüyorum, netim kâğıtta kayboluyor.", "keywords": ["kendi denememi", "kayboluyor"], "size": 66, "x": 90, "y": 330, "on": "yazdınız"}
```

```json
{"kind": "beforeAfter", "before": {"id": "once-deneme-sonuclar"}, "after": {"id": "m-deneme-sonuclar", "glass": [{"kind": "highlight", "x": 0.75, "y": 0.38, "width": 0.155, "height": 0.15, "on": "çizgili"}]}, "width": 500, "x": 290, "y": 200, "on": "yaptık"}
```

```json
{"kind": "device", "id": "m-test-coz-yanlis", "width": 500, "x": 290, "y": 240,
 "glass": [{"kind": "push", "y": 0.815, "by": 0.24, "fill": [0.766, 0.813], "inset": 0.15, "seconds": 1.3, "on": "Uzun"},
           {"kind": "swipe", "from": {"x": 0.55, "y": 0.72}, "to": {"x": 0.55, "y": 0.42}, "on": "devam"}]}
```

Sahnenin `moves`'unda: `{"kind": "squeeze", "on": "hapsediyorduk"}`, sonraki sahnede `{"kind": "release", "at": 0}`.

```json
{"kind": "power", "steps": [{"state": "right"}, {"state": "dropped", "on": "beş buçuk"}], "size": 300, "x": 330, "y": 300}
```

```json
{"kind": "root", "terms": [{"latex": "x"}, {"latex": "+\\,1", "on": "uzadıkça"}], "steps": [{"state": "broken"}, {"state": "fixed", "on": "tek parça"}], "size": 200, "x": 120, "y": 1000}
```

```json
{"kind": "match", "latex": "5^{\\frac{1}{2}}\\cdot\\sqrt{x+1}", "x": 40, "y": 260, "on": "aynı görünene"}
```

```json
{"kind": "slip", "net": "68,5", "write": {"on": "kâğıda"}, "fall": {"on": "kayboluyor"}, "width": 360, "x": 540, "y": 1050}
```

```json
{"kind": "device", "id": "m-test-coz-yanlis", "width": 500, "x": 290, "y": 240,
 "screens": [{"id": "m-test-coz-yanlis", "glass": [{"kind": "tap", "x": 0.5, "y": 0.927, "on": "Devam"}]},
             {"id": "m-test-coz", "transition": "top", "on": "en baştan"}]}
```

```json
{"kind": "beforeAfter", "before": {"id": "once-deneme-sonuclar"}, "on": "Bizimkiyle",
 "after": {"id": "m-deneme-sonuclar", "glass": [{"kind": "rise", "x": 0.755, "y": 0.385, "width": 0.15, "height": 0.11, "on": "çizgili"}]},
 "width": 500, "x": 290, "y": 200}
```

Kapanış: `{"kind": "comment", "x": 110, "y": 1260, "tail": "right"}` (boş balon, yanıp sönen imleç).

Testler: `tests/Components/Story/DedinizYaptik.test.ts`.

## Ses

- **Tempo:** Herald profili, Doğa, Eleven v4, hız 1,12. Sahip onayladı ("Bu tempo iyi"); `SINAVIKA_TR_TEMPO.voiceover`.
- **Tepe noktası:** müzikli ve efektli karışımlar artık sesli dersler gibi kodla ustalaştırılıyor (`AudioLeveling.masterWav`). Tek kazanç ile -14 LUFS'e getiriliyor, ileriye bakan sınırlayıcı tepeyi -1,5 dBTP tavanının altında tutuyor. Sınırlayıcının çok çalıştığı karışımda ses ölçülüp en çok iki kez telafi ediliyor; tavan her zaman önce gelir.
- **Düzeltilen hata:** sınırlayıcı, dosyanın ilk örneğinde tam güçte başlayan bir darbeyi ilk milisaniyelerde neredeyse hiç kısmıyordu (reels'in "0. saniyede olay" kuralı tam bu durum). Çok efektli reels'te -0,7 dBTP uyarısının sebebi buydu.

## Kurallar

- Görüntü 0,5–1,5 sn'de bir değişir: her alt vuruşta kamera hareketi, yeni kart ya da poz.
- Zıplama az (sahip, 20 Kasım 2026: "zıplama biraz fazla göz yordu"). Sahne yine sert kesmeyle açılır, ama yakınlaşma 105 %'ten ve yavaş. Alt vuruştaki itme 101,5 %'ten, 0,6 sn'de. Kart, cihaz ve balon 106 %'ten sekmeden iner. Anahtar ifadenin sözcükleri az büyüyerek düşer. Değerler tek yerde: `SINAVIKA_TR_TEMPO` (`cut`, `subBeat`, `land`, `word`); `tests/Configurations/SocialTempo.test.ts` üst sınırları tutar.
- Köşe logosu yok, hiçbir reels'te (sahip, 20 Kasım 2026: "sağ alttaki logo gereksiz kaldıralım onu hiçbir reels de olmasın bundan sonra"). Marka sondaki sade kartta (logo ve mağaza rozetleri) görünür. Özel günlerin yalnız logolu kapanışı köşe logosu sayılmaz. Bunu `tests/Templates/Advertisements/NoCornerLogo.test.ts` denetler.
- Her hareketin sesi vardır (`SoundEffects.ts`). Ses aynı anda üst üste binse de tepe noktası sınırlayıcıda tutulur.
- Uygulama yalnız gerçek UI/UX ekranlarıyla görünür (`StoryDevice`, `StoryWrist`); elle çizilmiş ekran yok.
- Saatte soru çözülmez, deneme telefonda; cihazlarda gerçek marka, saat ya da kayış logosu yok.
- Her video kendi görünümüyle çıkar (`look`); art arda iki video aynı görünmez, zemin sabit lacivert değildir.
- Marka dili: "indir" yok, "test" (quiz değil), tahmin vaadi yok.

## Testler

`tests/Components/Story/StoryKit.test.ts`:
- alt vuruşlar ve 1,2 sn sınırı;
- kameranın onaylı tempo değerlerini kullanması;
- poz geçişi ve göz kırpma;
- kart girişi;
- her tablet ve saat ekranının doğru cihaza düşmesi ve hatasız çizilmesi;
- her hazır görünümün kontrast ve palet denetiminden geçmesi, varsayılanın lacivert olmaması;
- okunmayan ya da paleti aşan görünümün reddedilmesi;
- art arda aynı görünümün yakalanması;
- imlecin kayması, basması, halkası;
- yaylı dönüşüm;
- bildirimin yükselmesi, kartın dönmesi, titreşim ve parmak dokunuşu;
- `wrist` / `wristTap` pozları ve saatin camı;
- bilek yakın planının iki saati aynı API ile çizmesi, saat olmayan ekranı reddetmesi;
- `hapticBuzz` sesinin dosyasının olması;
- her görünümde parçaların hatasız çizilmesi.

Seri kuralı: `tests/Configurations/SocialTempo.test.ts`.

Ses tavanı: `tests/Services/AudioCheck.test.ts`.
