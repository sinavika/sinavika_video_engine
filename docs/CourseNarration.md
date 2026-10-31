# Ders videosu: anlatım ve sunum kılavuzu

Kamp derslerinin (YouTube) ve reels'lerinin nasıl konuştuğu, nasıl açılıp kapandığı ve slaytların nasıl geçtiği. Kurallar 25 Ekim 2026'da ilk kamp dersi (TYT Türkçe, Sözcükte Anlam) izlendikten sonra sahibin notlarından çıktı.

Çoğu kural koddadır ve her derse kendiliğinden uygulanır. Senaryo yazan kişinin işi §4'tedir. Renkler: [CourseColors.md](CourseColors.md). Akış ve şemalar: [Courses.md](Courses.md).

## 1. Açılış: SinoAI karşılar

Her kamp dersi YouTube'daki gibi bir sunucu karşılamasıyla açılır. Sunucu **SinoAI**'dir. Karşılama kamp verisinden üretilir, her derste aynı kalıptadır ve senaryoya yazılmaz (`campWelcomeNarration`, [Camp.ts](../src/Courses/Camp.ts)).

> Merhaba, ben SinoAI. Sınavika'nın TYT Türkçe kampına hoş geldin! Bugün kampın dördüncü dersindeyiz: Cümlede Anlam. Geçen derste Deyim ve Atasözü konusunu işlemiştik. Konuyu adım adım öğrenecek, sınav tarzı sorular çözeceğiz. Videonun sonunda da seni bir kamp görevi bekliyor. Hazırsan başlayalım!

- **İlk ders:** kampın ne olduğunu anlatır ("Bu kampta Türkçe konularının hepsini sırayla ve soru çözerek işleyeceğiz").
- **Son ders:** "kampın son dersi" der.
- **Ekranda:** kamp kartı (ders renginde). Üstte "SinoAI · Hoş geldin", ortada kampın adı, "Ders 4 / 15" ve kampın ilerleme noktaları. Yanda **SinoAI'nin ses küresi** (voice orb) durur: anlatımın ses şiddetine göre büyüyüp küçülür, içindeki ders rengi tonları döner ve konuşurken hızlanır ([VoiceOrb.tsx](../src/Components/Overlays/VoiceOrb.tsx)). Küre bölüm açılışlarında da başlığın yanında konuşur. Ses seviyesi son üçte bir saniyenin ortalamasıdır ve küre en çok yüzde 7 büyür; her heceyle zıplamaz, cümleyle nefes alır.
- **Özel karşılama:** bir derse özel söz gerekiyorsa senaryodaki `camp.welcome` alanı karşılamanın yerine geçer.
- Karşılamadan sonra dersin kancası (`lesson.hook`) gelir: öğrenciye soru soran bir giriş.

## 2. Bölüm başlıkları ayrıca söylenir

Bir bölüm açılırken başlık kendi satırında, cümleden ayrı söylenir: "İkinci bölüm: Mecaz anlam." Ardından bölümün kendi girişi gelir (`sectionTitleNarration`).

Bu yüzden:
- **Senaryodaki bölüm girişi (`section.narration`) başlığı tekrar etmez.** "Şimdi mecaz anlama geçelim" yazılmaz; başlık zaten söylendi.
- Giriş, bölüme merak uyandırır: "Şimdi işler biraz renkleniyor. Aynı sözcük bambaşka bir kılığa nasıl giriyor, birlikte görelim."
- Başlık en az 2,4 saniye tutar (`COURSE_DESIGN.camp.sectionTitleSeconds`), böylece başlık gibi duyulur.

## 3. Slayt geçişleri sakin

Ders on dakikadan uzun; geçişler göz yormamalı (`COURSE_DESIGN.transition`):
- **Kartlar arası:** 0,7 saniyede yumuşak geçiş (cross-fade). Önceki 0,35 saniyelik itme sertti.
- **Yeni bölüm**, özet, kamp görevi ve açılıştan sonraki kanca: aşağıdan yukarı kayarak gelir.
- Her geçiş yavaş başlar, yavaş biter (ease in-out).
- **Slayt içi hareketler** (beat'ler, sırayla gelen maddeler) kendi hızındadır ve iyi bulundu; onlara dokunulmaz.

Bir sahnenin kendine özgü geçişi `TemplateScene.transitionIn` ile verilir; süresi şablonunkiyle aynıdır.

## 4. Anlatım dili: öğrenciyle konuş, metin okuma

Ses, yazılanı okur. Düz metin yazılırsa düz okunur. Bu yüzden asıl iş senaryodadır:

| Yapma | Yap |
|---|---|
| "Yan anlamı yakalamak için iki soru sor." | "Peki sınavda yan anlamı mecazdan nasıl ayıracaksın? Sana iki soru vereceğim, bunları bir kenara yaz." |
| "Gerçek anlam, sözcüğün ilk anlamıdır." (tanımı bitirip geçmek) | "Gerçek anlam, bir sözcüğü duyduğun anda aklına gelen ilk anlamdır." Arkasından hemen bir örnek ya da soru. |
| Maddeleri sırayla okumak | "Nicel anlamı nerede arayacaksın? Üç yerde. Önce… Sonra… Ve en çok gözden kaçanlar…" |
| "Rüzgâr somuttur." | "Rüzgârı görebiliyor musun? Göremiyorsun. Peki o zaman rüzgâr soyut mu? Hayır!" |
| "Cevap B." | "Peki sözleri tartabilir misin? Tabii ki hayır. … Cevabımız B." |

İlkeler:
- **Sen dili** kullan ve soru sor: "Sence?", "Bil bakalım…", "Önce kendin bir dene."
- **Dur ve dikkat çek:** "Ama dur bir saniye.", "Burada bir tuzak var.", "Bunu ezberle, her soruda işine yarayacak."
- **Önce soru, sonra cevap.** Bir kuralı söylemeden önce öğrencinin aklına soruyu düşür.
- **Kartın yazısı söylenenden azdır.** Ekrandaki madde listesi okunmaz, anlatılır.
- **Cümleler kısa olsun.** Uzun yan cümleler sesli okumada düzleşir.
- **Kısaltmaları olduğu gibi yaz** ("TYT", "KPSS"). Okunuşları sözlüktedir (§5); senaryoya "teyete" yazılmaz.
- **Marka dili:** "koç" denmez; yalnız Sınavika ve SinoAI adları geçer ([BrandIdentity.md](BrandIdentity.md)).

### Ekrandaki metin birebir okunur

Ses ile ekran hiçbir yerde ayrışmaz (sahip, 25 Ekim 2026: "yazılan soru ile seslendirilen soru başka gibi").

- **Sorular şablon tarafından okunur.** Sorunun paragrafı, kökü ve şıkları ekranda yazdığı gibi okunur ([LessonSpeech.ts](../src/Courses/LessonSpeech.ts)). Okunuş kuralları:
  - "----" boşlukları "boşluk" diye okunur.
  - "(II)" işaretleri "iki numara" diye okunur.
  - Roma rakamları harf gibi okunmaz (28 Ekim 2026):
    - Öncül listesi "I. …, II. …" "bir numara, …, iki numara, …" diye okunur.
    - Sıra sayısı "II. cümle", "XI. yüzyıl", "II. Murat" "ikinci cümle", "on birinci yüzyıl", "ikinci Murat" diye okunur.
    - Yalnız rakamdan oluşan şık "Yalnız I", "I ve II", "II - IV - I" "yalnız bir", "bir ve iki", "iki, dört, bir" diye okunur.
    - Metin içindeki tek başına "I" İngilizce sözcük olabileceği için dokunulmaz.
    - Ders ve bölüm başlıkları karşılamada ve bölüm girişinde ham okunur; bu yüzden sıra sayısı kuralı her Türkçe seslendirmede de uygulanır (`pronounceAbbreviations`): "XX. Yüzyıl" "yirminci Yüzyıl" olur.
  - "yalın - dolaşırken" gibi çiftler araya kısa bir duraklamayla okunur.
  - Yalnız I, II, III gibi etiket olan şıklar okunmaz.
  - " - " ayracı yalnız formül dışında duraklamadır; formülün içinde (`$a - b$`) "eksi" okunur (28 Ekim 2026).
- **Matematik okunuşu** ([SpokenText.ts](../src/Schemas/SpokenText.ts), TYT Matematik kampı, 28 Ekim 2026). Formüller öğretmenin söylediği gibi okunur:
  - $\overline{AB}$ "A B"; $0{,}\overline{3}$ "0,3 devirli"; $0{,}25$ "0,25" (duraklamasız).
  - $5!$ "5 faktöriyel"; $|x - 3|$ "mutlak değer x eksi 3"; %20 "yüzde 20"; $\sqrt[3]{8}$ "küpkök 8".
  - $\cup$, $\cap$, $\setminus$, $\varnothing$: "birleşim", "kesişim", "fark", "boş küme"; $A'$ "A tümleyen".
  - $\wedge$, $\vee$, $\Rightarrow$, $\Leftrightarrow$, $\equiv$: "ve", "veya", "ise", "ancak ve ancak", "denktir"; $p'$ "p değil".
  - $f(2)$ "f 2", $f^{-1}(7)$ "f tersi 7", $f \circ g$ "f bileşke g", $P(x + 1)$ "P x artı 1"; $\binom{8}{3}$ "C 8 3"; $\Delta$ "delta"; $\pmod{5}$ "mod 5".
  - Tanımlı işlemler: $\triangle$ "üçgen", $\ast$ "yıldız".
  - Reels'te şık da okunur: "3/7" "3 bölü 7", "6√2" "6 karekök 2", "50 km/sa" "saatte 50 kilometre".
  - Birimden sonra Türkçe ek gelirse birim açılmaz: "3 mü" "3 metreü" olmaz.
- **Senaryodaki `question.narration` yalnız giriştir:** "Hadi bunu bir soruda deneyelim." Soru kendi sözlerinle tekrar anlatılmaz.
- **Tahmin kartında da aynısı geçerli:** önce soru (`narration`), sonra şıklar (şablon okur), sonra "Birkaç saniye düşün." Senaryoya "düşün" yazılmaz.
- **Tahmin kartı, ekranda olmayan bir şey hakkında soru sormaz** (sahip, 27 Ekim 2026: "soru sorulmadan cevap bekleniyor").
  - Soru bir cümleye, söze ya da örneğe dayanıyorsa o metin `context` alanına yazılır.
  - `context` en baştan sorunun üstünde durur. Şablon onu ve soruyu (`prompt`) ekranda yazdığı gibi okur; `narration` yalnız giriştir ("Şimdi sıra sende. Şu cümleye bak.").
  - Sağdaki görsel yalnız düşünme süresinden sonra açıklama içindir.
  - `check`, `context` olmadan "bu cümle", "bu söz" gibi atıf yapan tahmin kartını reddeder.
- **Örnekler birebir okunur.** Bir örnek kartındaki cümle ya da bir cümle görselindeki cümle, anlatımda ekrandaki sözcüklerle geçer.
- **Denetim bunu kendiliğinden yakalar:** `check`, okunmayan örneği ve cümleyi listeler (`spokenTextIssues`).

### Her beat tam bir cümledir

Her beat ayrı bir satır olarak okunur. Yarım cümle ("Müzikte nota,") okunduğunda ses cümle ortasında durur, araya boşluk girer. Bu yüzden her beat nokta, soru ya da ünlem işaretiyle biter: "Müzikte nota bir terimdir." `check` yarım beat'i reddeder.

### Düşünme süresi sayılır

Soru okunduktan sonra 5 saniye sessiz düşünme süresi vardır (`COURSE_DESIGN.pacing.questionThinkSeconds`). Bu sürede çözüm panelinde geri sayım görünür: boşalan bir halka, her saniye büyüyerek değişen sayı ve altında "DÜŞÜN" yazısı. Tahmin kartlarında da aynı sayaç kullanılır.

### Öğrenci odaklı senaryo için araştırma

Bir konunun senaryosu yazılmadan önce:
1. **Kapsam listesi (amaç: [Courses.md §0](Courses.md#0-amaç)):** konunun MEB kazanımları ve ÖSYM'nin bu konuda sorduğu soru tipleri tek bir listeye yazılır. Listedeki her madde senaryoda yer alır; eksik madde varsa senaryo bitmiş sayılmaz. Kapsamı başka kanalların ya da yayınların konu listesi belirlemez; hiçbir kanal örnek alınmaz.
2. **Sınavdaki yeri:** `Desktop\EgitimVerileri` içindeki ÖSYM sorularının yılları ve soru tipleri, ayrıca [`KapsamDenetimi.md`](../Curriculum/Production/KapsamDenetimi.md) içindeki soru dağılımları. Kaynaklar çelişiyorsa kesin sayı söylenmez: "her yıl birkaç soru" denir.
3. **Öğrencinin dili:** sınav kaygısı, "bunu ezberle", "tuzak" gibi öğrencinin kendi kullandığı ifadeler ve sınıfta konuşulan hafif espriler (memler) kullanılır. Marka diline uygun ve kimseyi küçümsemeden.
4. **Yapı:** kanca (soru ya da şaşırtan bir bilgi), sık yapılan hata, tuzak, "sınavda nasıl çıkar" ve en az üç çözümlü soru.

### Sesler arasında hep aynı nefes payı, kesik yok

Ders tek parça seslendirilir, sonra satırlara kesilir. Bu kesimde iki kural vardır:

- **Kesim, sesin en sessiz anına düşer.** Eleven v4 satırlar arasında çoğu zaman hiç duraklamaz. Ses servisinin karakter zamanlarına göre yapılan kesim bir sözcüğün içine düşüyordu ve sözcüğün başı ya da sonu kırpılıyordu ("seste hafif kesilmeler"). Artık her kesim, bulunduğu yerin ±0,35 saniye çevresindeki en sessiz ana, yani iki sözcük arasındaki boşluğa ya da nefese kaydırılır. Bu ölçüm doğrudan ses dalgası üzerinde yapılır ([NarrationCut.ts](../src/Services/NarrationCut.ts)). Önbellekteki eski seslendirmeler ilk kullanımda bir kez yeniden kesilir; yeni ses üretilmez. 25 Ekim ölçümü: 159 kesimin hiçbiri konuşmanın içinde değil (öncesinde yaklaşık üçte biri içindeydi).
- **Sahneler arasında nefes payı:** Sahneler geçiş süresi kadar üst üste biner. Konuşan her sahnenin süresine bu geçiş payı eklenir (`planTemplateScenes`). Böylece iki satır arasında hep yaklaşık 0,45 saniye kalır; bir satır, öncekinin üstüne binmez. Beat satırlarının en kısa süresi 1,2 saniyedir.

## 5. Ses

- **Model:** kamp dersleri ve reels Eleven v4 ile seslendirilir (`COURSE_VOICE_MODEL`). Önceki model (Multilingual v2) 15 dakika boyunca düz okuyordu. Şablon modelini kendisi söyler (`voiceModel`), iş dosyasına yazılmaz.
- **Ses:** marka sesi Doğa, eğitmen profili (`Lecturer`). Kararlılık 0,6'dan 0,48'e indi; sorular ve vurgular daha çok inip çıkıyor.
- **Okunuş sözlüğü:** ekranda kısaltma, seste Türkçe okunuşu. Bütün seslendirmeler (dersler, reels, tanıtımlar, Google Ads videoları) bu sözlükten geçer. Yeni bir kısaltma yalnız buraya eklenir: [`ABBREVIATIONS`](../src/Schemas/SpokenText.ts). Bir işin ya da şablonun `script` alanına okunuş yazılmaz; test bunu engeller (31 Ekim 2026).

  | Yazılan | Okunan |
  |---|---|
  | YKS | yekase |
  | KPSS | kapesese |
  | TYT | teyete |
  | AYT | ayete |
  | YDT | yedete |
  | SinoAI, SinoAI'ye | Sino Ey Ay, Sino Ey Ay'ye (sahip 31 Ekim 2026'da "Sino Eyay" ve bitişik "Sinoeyay" ile karşılaştırıp bunu seçti) |
  | PDF, PDF'in | Pidiyef, Pidiyefin |
  | sinavika.com'da | Sınavika nokta kom'da |
  | MÖ 680, MS 375 | milattan önce altı yüz seksen, milattan sonra üç yüz yetmiş beş |
  | Hz. Ali, Hz. Peygamber | Hazreti Ali, Hazreti Peygamber ("50 Hz." hertz kalır) |

- **Sayılar sözle okunur (29 Ekim 2026):** anlatımda ve ekrandan okunan sorularda rakamlar seslendirmeden önce merkezde söze çevrilir ([`spokenNumbers`](../src/Schemas/SpokenText.ts)). Senaryoda rakam yazılabilir; ses onu öğretmenin söylediği gibi okur. Eskiden 475 anlatım satırında rakam vardı ve ses bunları kendisi tahmin ediyordu.

  | Yazılan | Okunan |
  |---|---|
  | 1912'de, 23'ü 5'e, 4'ün | bin dokuz yüz on ikide, yirmi üçü beşe, dördün |
  | 19. yüzyıl, 2'nci | on dokuzuncu yüzyıl, ikinci |
  | 52 718, 40.075 km, 3 000'den | elli iki bin yedi yüz on sekiz, kırk bin yetmiş beş kilometre, üç binden |
  | 2,05; %30'u; 1/4 | iki virgül sıfır beş; yüzde otuzu; bir bölü dört |
  | 0-14 yaş; -5 | sıfır ile on dört yaş; eksi beş |
  | 14.20'de; 37 °C'de | on dört yirmide; otuz yedi derecede |
  | G1, 5N1K, 2n = 8, x² | G bir, beş N bir K, iki n eşittir sekiz, x kare |

  Cümle sonundaki "1453." sıra sayısı sayılmaz (büyük harfle başlayan cümle gelir); "16. yüzyıl" gibi küçük harfli bir sözden önceki nokta sıra sayısıdır. Formülden ve boşluktan sonraki ek kopmaz: "$50°$'dir" "elli derecedir", "----'dir" "boşluk" diye okunur.

- **Müzik yok:** ders videolarında ve kamp reels'lerinde arka plan müziği kullanılmaz; yalnız anlatım vardır. Reklam ve tanıtım videoları bu kuralın dışındadır.

## 6. Kapanış

Kapanış iki parçadır:
1. **Kamp görevi** ve "Sıradaki ders" kartı.
2. **Uygulama tanıtımı:** yalnız görseldir, seslendirilmez. App Store ve Google Play ortak mağaza rozetleriyle gösterilir ([StoreBadge.tsx](../src/Components/Brand/StoreBadge.tsx)).

## 7. Kapak

Kapak, kamp kapağıdır ([CampCover](../src/Images/Templates/Thumbnails/CampCover.tsx)):
- zemin dersin renginde, kamp tanıtımında lacivert; düzen kapak standardında ([`Sosyal-Kimlik-Standardi.md`](Sosyal-Kimlik-Standardi.md)), logo sol üstte;
- etiket olarak kampın adı ve sınav etiketleri;
- konu adı;
- videonun türü ("Konu anlatımı" ya da "Kısa tekrar") ve dev ders numarası ("03 / 16");
- kampın ilerleme noktaları.

Kamp videolarında render kendiliğinden bu kapağı yapar; yalnız kapak için `npm run cover -- --job <video işi>`. Bütün dersler aynı tasarımı taşır; seri kanal sayfasında tanınır, ders de renginden bulunur.

## 8. Yerleşim güvenliği

Ekrandaki hiçbir şey kesilmez ya da bölüm çubuğunun altına taşmaz:
- **Uzun özet:** sığana kadar küçültülür (`FitBox`).
- **Cümle, karşılaştırma, tablo ve akış görselleri:** kutularını dolduracak kadar büyür (en çok 1,5 kat). Bir sözcük dar bir sütuna sığmıyorsa büyüme durur (`FitBox` iç içe taşmayı da yakalar).
- **Vurgulanan karşılaştırma sütunu:** iç çerçeveyle belirir; boyutu değişmediği için kutudan taşmaz.

## 9. Render öncesi kontrol listesi

1. `npm run curriculum -- check <senaryo> --mark`: süre, alt başlıklar, sorular, kamp alanları.
2. `npm run stills -- --job <iş> --quality 1080p`: her sahnenin bir karesi. Taşma, kesilme ve renk açısından gözle bakılır.
3. Render: `npm run render -- --job <iş>`. Ders 4K'da yaklaşık 40 dakika sürer; bilgisayar uykuya geçmemeli.
4. Videonun yanındaki `.chapters.txt` YouTube açıklamasına yapıştırılır, kapak yüklenir.

## 10. Reels: meydan okuma biçimi

Kamp reels'i bir tanım listesi değil, kısa bir yarışmadır. 25 Ekim'deki ilk reels "ders notu okur gibi" bulundu: ilk saniyede kanca yoktu, kartlar birbirinin aynısıydı, sorunun cevabı verilmiyordu.

27 Ekim'de 4–6 soruluk, 71–106 saniyelik reels'ler dışarıdan bir yapay zekâya değerlendirildi (Gemini, 100 üzerinden 11–26; rapor `Outputs/ViralCheck/`). Bulgular:
- ilk soruya kadar 5–7 sn duran başlık kartı vardı;
- cevaptan sonra açıklama kartı 6–8 sn kıpırdamadan duruyordu;
- 12–13 sn'lik çift kapanış vardı (YouTube + uygulama);
- sorular TYT adayı için fazla kolaydı.

Kurgu buna göre yeniden kuruldu.

Akış (`short.rounds`, [CampShort/Scenes](../src/Templates/Camps/CampShort/Scenes)):

1. **İlk karede soru.** Ayrı başlık kartı yoktur. İlk tur animasyonsuz, ilk kareden ekrandadır.
   - Kanca (`short.hook`, en çok 40 karakter: "Üçünde de tuzak var.") sorunun üstünde ders renginde bir şerit olarak görünür ama **okunmaz**. Duyulan ilk şey sorunun kendisidir.
   - Ses kapalı izleyen de kancayı okur.
2. **2–3 tur**, her biri yaklaşık 9 saniye:
   - vurgulu sözcüğüyle bir cümle, bir soru ve 2–3 seçenek. Cümle ve soru ekranda yazdığı gibi okunur;
   - 2 saniyelik sessiz geri sayım (`COURSE_DESIGN.camp.roundThinkSeconds`). Şıklar soru okunurken de ekrandadır;
   - cevap yanar ve 3–4 sözcüklük "neden" söylenir ("Deyim! Öğüt vermiyor."). Ses bitince sahne geçer; en kısa bekleme `roundRevealSeconds` (1,6 sn).
3. **Tek çağrı:** "Kaçta kaç? Yoruma yaz." (`CHALLENGE_SCORE_LINE`). Kampın dersi altta küçük ve sessiz bir satırla anılır. Uygulama tanıtımı reels'te yoktur; turu olmayan özet reels'te durur.

Turları yazarken:
- Toplam süre 30 saniyenin altındadır (`COURSE_DESIGN.length.challenge`). `check`, Doğa sesinin ölçülen hızıyla hesaplar: saniyede 1,9 sözcük, satır başına 0,45 sn ses payı.
  - Bu hızla tur başına cümle + soru yaklaşık 8 sözcük, cevap + neden 3–5 sözcük kalır.
  - Tur 14 sözcüğü geçerse `check` uyarır.
- **Her tur bir tuzaktır.** Sorular dersin "dikkat" notlarından gelir: olgun → ham (olumsuzluk karşıtlık değildir), biraz → nicel, günlük dildeki terim, kalıbı bozulmuş deyim, keşkesiz pişmanlık, yorum taşıyan bilgi cümlesi.
- "Tatlı söz mecaz mı" düzeyindeki sorular yazılmaz.
- En güçlü tuzak birinci sıradadır, çünkü izleyicinin çoğu ilk sorudan sonra kalmaz. Örnek: "Atı alan Üsküdar'ı geçti: atasözü mü, deyim mi?" 26 Ekim'de 60. saniyeye gömülüydü.
- Kanca ve seslendirme süre vaat etmez ("Her soruda üç saniyen var" gibi). Doğrulanamayan oran da vermez ("%90'ı yanlış yapıyor" gibi).
- "Neden" kuralı söyler; açıklamanın uzunu YouTube dersindedir.
- Turlar YouTube dersindeki örneklerle aynı dili kullanır.
- Müzik yoktur. **Ses efektleri** vardır (sahibin isteği, 27 Ekim 2026):
  - geri sayımın her saniyesinde bir tik;
  - cevap yanarken kısa bir zil;
  - 2. ve 3. soruya ve skor kartına girişte bir hışırtı. İlk soruda hışırtı yoktur, çünkü soru ilk karede zaten ekrandadır.
- Efektler ElevenLabs Sound Effects ile bir kez üretildi ve `public/SoundEffects/` altında tutuluyor. Tarifleri ve tepe seviyeleri [SoundEffects.ts](../src/Configurations/SoundEffects.ts) içinde. Seviyeler anlatımın altında kalacak biçimde ayarlı; anlatımın tepesi −4 dBFS, efektler −9 ile −14 dBFS arasında.
  - `npm run sound-effects` yalnız eksik efektleri üretir; kredi yalnız onlar için harcanır.
  - `npm run sound-effects -- --relevel` ElevenLabs'in sakladığı dosyaları (`Source/`) yeniden seviyeler; kredi harcamaz.
  - Bir efekti yeniden üretmek için iki dosyasını da sil.
  - Neredeyse sessiz gelen bir üretim reddedilir. İlk tik denemesi −46 dBFS tepeyle böyle geldi.

## 11. Kart görünümü (27 Ekim 2026)

- **Rozetlerde baştaki "?" simgesi yok.** "?Önce tahmin et" diye okunuyordu. Tahmin rozeti "Önce tahmin et?", soru rozeti yalnız sınav tarzını yazar ("TYT tarzı").
- **Tahmin kartında ikinci başlık yok.** Rozet zaten söylüyor; kartın `title` alanı ekranda gösterilmez. Altta ikinci bir başlık göz hizasını bozuyordu.
- **Odak dışındaki parçalar okunur kalır.**
  - Odak dışındaki parça yüzde 60 opaklığa iner (`UNFOCUSED_FADE`, [VisualTimeline.tsx](../src/Components/Visuals/VisualTimeline.tsx)); önceki yüzde 32'ydi.
  - Bütün görseller bu tek değeri kullanır: karşılaştırma, tablo, cümle, akış, döngü.
  - Karşılaştırmada sütunun satırları ikinci kez soluklaşmaz. Odaktaki sütunun satırları hiç soluklaşmaz; önceden iki soluklaşma çarpılınca yazı onda birine iniyordu.

