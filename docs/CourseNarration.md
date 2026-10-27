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
  - "yalın - dolaşırken" gibi çiftler araya kısa bir duraklamayla okunur.
  - Yalnız I, II, III gibi etiket olan şıklar okunmaz.
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
2. **Sınavdaki yeri:** `Curriculum/Data` içindeki ÖSYM sorularının yılları ve soru tipleri, ayrıca [`KapsamDenetimi.md`](../Curriculum/Production/KapsamDenetimi.md) içindeki soru dağılımları. Kaynaklar çelişiyorsa kesin sayı söylenmez: "her yıl birkaç soru" denir.
3. **Öğrencinin dili:** sınav kaygısı, "bunu ezberle", "tuzak" gibi öğrencinin kendi kullandığı ifadeler ve sınıfta konuşulan hafif espriler (memler) kullanılır. Marka diline uygun ve kimseyi küçümsemeden.
4. **Yapı:** kanca (soru ya da şaşırtan bir bilgi), sık yapılan hata, tuzak, "sınavda nasıl çıkar" ve en az üç çözümlü soru.

### Sesler arasında hep aynı nefes payı, kesik yok

Ders tek parça seslendirilir, sonra satırlara kesilir. Bu kesimde iki kural vardır:

- **Kesim, sesin en sessiz anına düşer.** Eleven v4 satırlar arasında çoğu zaman hiç duraklamaz. Ses servisinin karakter zamanlarına göre yapılan kesim bir sözcüğün içine düşüyordu ve sözcüğün başı ya da sonu kırpılıyordu ("seste hafif kesilmeler"). Artık her kesim, bulunduğu yerin ±0,35 saniye çevresindeki en sessiz ana, yani iki sözcük arasındaki boşluğa ya da nefese kaydırılır. Bu ölçüm doğrudan ses dalgası üzerinde yapılır ([NarrationCuts.ts](../src/Services/NarrationCuts.ts)). Önbellekteki eski seslendirmeler ilk kullanımda bir kez yeniden kesilir; yeni ses üretilmez. 25 Ekim ölçümü: 159 kesimin hiçbiri konuşmanın içinde değil (öncesinde yaklaşık üçte biri içindeydi).
- **Sahneler arasında nefes payı:** Sahneler geçiş süresi kadar üst üste biner. Konuşan her sahnenin süresine bu geçiş payı eklenir (`planTemplateScenes`). Böylece iki satır arasında hep yaklaşık 0,45 saniye kalır; bir satır, öncekinin üstüne binmez. Beat satırlarının en kısa süresi 1,2 saniyedir.

## 5. Ses

- **Model:** kamp dersleri ve reels Eleven v4 ile seslendirilir (`COURSE_VOICE_MODEL`). Önceki model (Multilingual v2) 15 dakika boyunca düz okuyordu. Şablon modelini kendisi söyler (`voiceModel`), iş dosyasına yazılmaz.
- **Ses:** marka sesi Doğa, eğitmen profili (`Lecturer`). Kararlılık 0,6'dan 0,48'e indi; sorular ve vurgular daha çok inip çıkıyor.
- **Okunuş sözlüğü:** ekranda kısaltma, seste Türkçe okunuşu. Yeni bir kısaltma yalnız buraya eklenir: [`ABBREVIATIONS`](../src/Schemas/SpokenText.ts).

  | Yazılan | Okunan |
  |---|---|
  | YKS | yekase |
  | KPSS | kapesese |
  | TYT | teyete |
  | AYT | ayete |
  | YDT | yedete |
  | SinoAI | Sino Ey Ay |

- **Müzik yok:** ders videolarında ve kamp reels'lerinde arka plan müziği kullanılmaz; yalnız anlatım vardır. Reklam ve tanıtım videoları bu kuralın dışındadır.

## 6. Kapanış

Kapanış iki parçadır:
1. **Kamp görevi** ve "Sıradaki ders" kartı.
2. **Uygulama tanıtımı:** yalnız görseldir, seslendirilmez. App Store ve Google Play düğmelerinde mağazaların logoları vardır ([StoreLogo.tsx](../src/Components/Illustrations/StoreLogo.tsx)).

## 7. Kapak

Kapak, kamp kapağıdır ([CampCover](../src/Images/Templates/Thumbnails/CampCover.tsx)):
- zemin ders renginde;
- dev ders numarası ("DERS 01");
- konu adı ve videonun türü ("Konu anlatımı" ya da "Kısa tekrar");
- kampın adı ve sınav etiketleri;
- kampın ilerleme noktaları ve logo.

Kamp videolarında render kendiliğinden bu kapağı yapar. Bütün dersler aynı tasarımı taşır; seri kanal sayfasında tanınır, ders de renginden bulunur.

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

Akış (`short.rounds`, [CampChallengeScenes.tsx](../src/Templates/Camps/CampShort/CampChallengeScenes.tsx)):

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
- Müzik yoktur.

## 11. Kart görünümü (27 Ekim 2026)

- **Rozetlerde baştaki "?" simgesi yok.** "?Önce tahmin et" diye okunuyordu. Tahmin rozeti "Önce tahmin et?", soru rozeti yalnız sınav tarzını yazar ("TYT tarzı").
- **Tahmin kartında ikinci başlık yok.** Rozet zaten söylüyor; kartın `title` alanı ekranda gösterilmez. Altta ikinci bir başlık göz hizasını bozuyordu.
- **Odak dışındaki parçalar okunur kalır.**
  - Odak dışındaki parça yüzde 60 opaklığa iner (`UNFOCUSED_FADE`, [VisualTimeline.tsx](../src/Components/Visuals/VisualTimeline.tsx)); önceki yüzde 32'ydi.
  - Bütün görseller bu tek değeri kullanır: karşılaştırma, tablo, cümle, akış, döngü.
  - Karşılaştırmada sütunun satırları ikinci kez soluklaşmaz. Odaktaki sütunun satırları hiç soluklaşmaz; önceden iki soluklaşma çarpılınca yazı onda birine iniyordu.

