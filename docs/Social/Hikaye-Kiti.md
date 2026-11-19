# Hikâye kiti (sinavika.tr reels'leri)

15 Kasım 2026. Dokuru tarzı sinavika.tr reels'leri için ortak altyapı. İsteği Sosyal Medya Yönetimi oturumu iletti; sahibin değerlendirmesi: "Dokuru videolarındaki heyecan yok, akış çok yavaş."

Kod `src/Components/Story/` altında. Şablonlar kendi görünümünü kurar, parçaları buradan alır; aynı parçanın şablona özel kopyası yazılmaz. Tempo değerleri sahibin onayladığı `SINAVIKA_TR_TEMPO`'dan (`src/Configurations/SocialTempo.ts`) gelir; kitte ikinci bir ayar yoktur.

Kitin vitrini: `StoryKit` kompozisyonu, 9 sahne × 3,5 sn (8 ve 9: saat). Şablon değildir, yayımlanmaz. Varsayılan görünümü sıcak gridir; başka bir görünüme `--props` ile bakılır:

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

Kitin bütün parçaları görünümü `StoryLookProvider`'dan okur: `KeyPhrase`, `NumberPop`, `Paper`, `StickyNote`, `CompareBars`, `QuestionCard`, etiket, köşe logosu ve kapanış kartı. Şablon zemini kendisi çizmez, `StoryGround` kullanır.

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
| `StoryCamera.tsx` | `StoryCamera moves={[...]}`: `punch` (112 %'den yakınlaşma), `shake` (sönen sarsıntı), `whipOut` / `whipIn` (bulanık hızlı kaydırma), `flash` (beyaz kesme). Her hareketin kendi sesi var (`sound: null` susturur). Hesaplar saf fonksiyon: `punchScale`, `shakeOffset`, `whipPan`, `flashOpacity`. |
| `StoryType.tsx` | `KeyPhrase`: anahtar ifade sözcük sözcük düşer; `keywords` turuncu ve fosforlu. `times` verilirse her sözcük söylendiği anda düşer. `NumberPop`: sayı sayar, büyüyüp oturur. Altyazı değildir, yalnız anahtar ifade içindir (altyazı yasağı sürüyor). |
| `StoryMaterial.tsx` | `StoryGround`: görünümün zemini (düz ya da gradyan, kâğıt dokusu, nefes alan lamba). `Paper`: kâğıt dokusu, gölge, kıvrık köşe, isteğe bağlı çizgili defter sayfası. `HandMark`: elle çizilir gibi kırmızı çarpı, yeşil tik, daire, alt çizgi, ok. `Highlight`: fosforlu kalem. Kâğıt rengi ve gölgenin açık ya da koyu zemine uyumu görünümden gelir. |
| `StoryCard.tsx` | `StickyNote`, `ExamSheet` (deneme kâğıdı; işaretler sesle düşer, net kırmızı kalemle), `TopicList`, `NetChart`, `CompareBars`, `QuestionCard`. Hepsi masaya düşer gibi girer (`at`) ve kendi sesini çalar. |
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

## Ses

- **Tempo:** Herald profili, Doğa, Eleven v4, hız 1,12. Sahip onayladı ("Bu tempo iyi"); `SINAVIKA_TR_TEMPO.voiceover`.
- **Tepe noktası:** müzikli ve efektli karışımlar artık sesli dersler gibi kodla ustalaştırılıyor (`AudioLeveling.masterWav`). Tek kazanç ile -14 LUFS'e getiriliyor, ileriye bakan sınırlayıcı tepeyi -1,5 dBTP tavanının altında tutuyor. Sınırlayıcının çok çalıştığı karışımda ses ölçülüp en çok iki kez telafi ediliyor; tavan her zaman önce gelir.
- **Düzeltilen hata:** sınırlayıcı, dosyanın ilk örneğinde tam güçte başlayan bir darbeyi ilk milisaniyelerde neredeyse hiç kısmıyordu (reels'in "0. saniyede olay" kuralı tam bu durum). Çok efektli reels'te -0,7 dBTP uyarısının sebebi buydu.

## Kurallar

- Görüntü 0,5–1,5 sn'de bir değişir: her alt vuruşta kamera hareketi, yeni kart ya da poz.
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
