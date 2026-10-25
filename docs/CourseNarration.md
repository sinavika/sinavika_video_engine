# Ders videosu: anlatım ve sunum kılavuzu

Kamp derslerinin (YouTube) ve reels'lerinin nasıl konuştuğu, nasıl açılıp kapandığı ve slaytların nasıl geçtiği. Kurallar 25 Ekim 2026'da ilk kamp dersi (TYT Türkçe, Sözcükte Anlam) izlendikten sonra sahibin notlarından çıktı.

Çoğu kural koddadır ve her derse kendiliğinden uygulanır. Senaryo yazan kişinin işi §4'tedir. Renkler: [CourseColors.md](CourseColors.md). Akış ve şemalar: [Courses.md](Courses.md).

## 1. Açılış: SinoAI karşılar

Her kamp dersi YouTube'daki gibi bir sunucu karşılamasıyla açılır. Sunucu **SinoAI**'dir. Karşılama kamp verisinden üretilir, her derste aynı kalıptadır ve senaryoya yazılmaz (`campWelcomeNarration`, [Camp.ts](../src/Courses/Camp.ts)).

> Merhaba, ben SinoAI. Sınavika'nın TYT Türkçe kampına hoş geldin! Bugün kampın dördüncü dersindeyiz: Cümlede Anlam. Geçen derste Deyim ve Atasözü konusunu işlemiştik. Konuyu adım adım öğrenecek, sınav tarzı sorular çözeceğiz. Videonun sonunda da seni bir kamp görevi bekliyor. Hazırsan başlayalım!

- **İlk ders:** kampın ne olduğunu anlatır ("Bu kampta Türkçe konularının hepsini sırayla ve soru çözerek işleyeceğiz").
- **Son ders:** "kampın son dersi" der.
- **Ekranda:** kamp kartı (ders renginde). Üstte "SinoAI · Hoş geldin", yanda nefes alır gibi hareket eden SinoAI işareti; ortada kampın adı, "Ders 4 / 15" ve kampın ilerleme noktaları.
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
