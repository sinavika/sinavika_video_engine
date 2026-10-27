# Sınavika UI/UX değerlendirmesi

25 Ekim 2026. Bu sorunun cevabı: "UI/UX iyi ve kusursuz mu?"

İncelenen kaynaklar:
- **Tasarım:** v3 tasarım teslimi (`Desktop\Sinavika-UIUX3`): 179 ekran açık, 179 ekran koyu tema, 17 pano.
- **Gerçek uygulama:** 20 Ekim'de emülatörde alınmış ekran görüntüleri, TR, 11 ekran (`Desktop\MobileHeader2\ham-kayitlar`).
- **Kod:** mobil uygulamanın kodu ve kendi tasarım belirteçleri (`src/UIUX/Tokens.ts`).
- **Önceki denetim:** 15 Ekim (`UIUX-Denetim.md`).
- **Kısa bir araştırma:** kaynaklar en sonda.

Uygulama canlı çalıştırılmadı. Gerçek ekranlar 20 Ekim tarihli; o günden sonra düzeltilmiş şeyler aşağıda ayrıca belirtildi.

## 1. Kısa cevap

**İyi, ama kusursuz değil.** Yapı doğru kuruldu. Modül kimliği, sabit alt çubuk kuralı, "Bugün ne çalışalım?" girişi, önce ders seçimi ve koyu tema, 15 Ekim denetimindeki büyük yön bulma sorunlarını çözüyor. Gerçek uygulama da tasarıma büyük ölçüde uymuş.

Kusursuz olmamasının nedenleri dört grupta toplanıyor:
1. Bir ürün kararı: denemede cevaplar anında doğru/yanlış diye boyanıyor.
2. Sayı ve ad tutarsızlıkları: güveni zedeliyor.
3. Erişilebilirlik açıkları.
4. Masaüstü web panelinde boş kalan alan.

Ayrıca "kusursuz" bir kanıtla söylenebilir; o kanıt da gerçek öğrenci testi ve kullanım verisidir. İkisi de henüz yok.

## 2. Güçlü yanlar

- **Yön bulma çözülmüş.** Her modülün bir rengi, ikonu ve sabit bir alt çubuk düzeni var. Ana ekran önce "Bugün ne çalışalım?" sorusunu soruyor, sonra modülleri gösteriyor. 15 Ekim'in M6–M8 ve W4–W7 bulguları tasarımda kapanmış.
- **Önce ders.** Dersler, Testler ve Bilgi Kartları ders listesiyle açılıyor; konu ağacı ondan sonra geliyor. Öğrencinin zihnindeki sırayla aynı.
- **Durum ekranları tasarlanmış:** boş, yükleniyor, hata, ödeme başarılı ve başarısız. Önceki denetimdeki "Not Found" ve sonsuz yükleniyor sorunlarının karşılığı var.
- **Koyu tema eksiksiz:** her ekranın iki teması var.
- **Gerçek uygulama tasarıma yakın.** Ana ekran slaytı, modül kartları, ders listesi ve halka ilerlemeler, Ders Planı haftası, Testler seviyeleri ve SinoAI sohbet düzeni çizimlere uyuyor.
- **Mobil yazı boyutları ve büyük yazı ayarı doğru.** Gövde 15 pt, en küçük meta 12 pt. Sistemdeki yazı büyütme ayarı açık; yalnız sekme etiketi, sayaç ve şık harfi sınırlanmış (`TypographyScaleCap`).

## 3. Sorunlar

Önem: **P0** güveni ya da temel akışı bozar · **P1** belirgin sürtünme ya da güven kaybı · **P2** cila.

| # | Sorun | Kanıt | Önem | Öneri |
|---|---|---|---|---|
| 1 | **Denemede cevap anında doğru/yanlış diye boyanıyor.** 120 soruluk, süreli Genel Yetenek denemesinde 4. soruda doğru şık yeşil, öğrencinin şıkkı kırmızı. Deneme bir sınav provasıdır; gerçek sınavda geri bildirim yoktur. Anında görmek süre yönetimini ve stresi gerçekten uzaklaştırır, net tahminini de bozar. | Gerçek ekran `exam.png`; kod `useExamStudentSolveInteraction.ts` (her cevaptan sonra `isCorrect` ve `correctOptionKey` gösteriliyor) | **P1 · karar** | Deneme **sınav modu**: cevaplar sonuç ekranında açılsın. Anında geri bildirim **Testler**'de kalsın; orada doğru. İsteğe bağlı bir "pratik modu" ayrıca açılabilir. Araştırmalar öğrenme için anlık ve gecikmeli geri bildirimin hangisinin daha iyi olduğunda ayrışıyor; ama deneme öğrenme değil, provadır. |
| 2 | **Sayılar birbirini tutmuyor.** Ders Planı'ndaki SinoAI kartı "günde 60 dk" diyor. Aynı gün ana ekran "1 görev · 30 dakika", plan ekranı "Bugünkü hedef 30 dk" gösteriyor. | Gerçek ekranlar `studyPlan.png`, `home.png` | **P1** | Günlük süre tek kaynaktan gelsin. İki kavram varsa (plan ortalaması ve bugünün hedefi) ekranda adları ayrı olsun ("ortalama 60 dk/gün", "bugün 30 dk"). |
| 3 | **Test seviyelerinin adları tasarımla ve öğrenci diliyle uyuşmuyor.** Uygulamada "Sözcükte Anlam – Kolay tarama, Orta tarama". Tasarımda "Temel, Orta, Zor, Sınav düzeyi, Ustalık". "Tarama" iç bir kavram. | Gerçek ekran `tests.png`; tasarım `m-test-detay` | **P1** | Tasarımdaki seviye adları kullanılsın; "tarama" öğrenciye gösterilmesin. |
| 4 | **Teslim edilen tasarım görselleri güncel değil.** Tur ekranında "notlarından quiz ve kart üret" yazıyor; 25 Ekim kuralı "test". Görseller 15 Ekim'de üretilmiş, kod o günden beri değişti. Ekipler bu görselleri şartname olarak kullanıyor. | `acik/panolar/01`, `m-tur-4` | **P1** | `npm run uiux` ile Desktop'taki seti yeniden üretmek (kaynak kodda düzeltme yapıldı). |
| 5 | **Ekran okuyucu desteği yarım.** 726 dokunulabilir öğeden yaklaşık 250'sinde `accessibilityLabel` var. | `sinavika_mobile_reactnative/src` taraması | **P1** | Önce ikon düğmeleri (zil, profil, geri, kapat, sekmeler) ve şıklar etiketlensin. Sonra VoiceOver ve TalkBack ile tek bir deneme akışı baştan sona denensin. |
| 6 | **Renkli zeminlerde soluk metin ve küçük rozetler.** Soluk metin (`#64748B`) beyaz üzerinde 4.76:1 ile AA sınırının hemen üstünde. Modül renkli açık zeminlerde (mor Testler, yeşil Ders Planı) bu oran düşüyor. Kart içi rozetler ("Cumartesi canlı", "35 / 100") 10-11 pt ve soluk. | Panolar 01, 05; `UI_TYPE.over = 11`, `meta = 12` | **P2** | Renkli zeminde soluk metin yerine ana metin rengi kullanılsın. Rozetlerde en az 12 pt ve 4.5:1 kontrast olsun. Kontrast, renkler değiştikçe otomatik ölçülsün (motordaki `contrastRatio` ile). |
| 7 | **SinoAI "Çalışma" sonucu dağınık.** Üretilen test kartının altında düğme gibi görünmeyen bir "Değişiklik iste" yazısı ve kopyala ikonu var. Ekranın büyük kısmı boş, "Bu konuşmada yeni içerik üret" seçeneği altta tek başına duruyor. | Gerçek ekran `sinoAiStudy.png` | **P2** | Sonuç kartının içinde iki düğme olsun: "Testi aç" (ana) ve "Değiştir" (ikincil). Yeni içerik seçenekleri kartın hemen altında yer alsın. |
| 8 | **Web paneli geniş ekranı kullanmıyor.** 1440 px'te pek çok sayfa ekranın üçte birini kaplayan tek bir sütun: Destek, Abonelik, Ödeme başarılı. Yazılar mobil ölçeğinde kalıyor. | Pano 12 | **P2** | Sayfalara iki sütunlu düzen verilsin (ana içerik ve yan bilgi), en geniş içerik alanı yaklaşık 1200 px olsun. Başlık ve gövde web için bir basamak büyütülsün. |
| 9 | **Küçük dil pürüzleri.** İlerleme ekranında "0 çalışılıyor"; ödeme ve bildirim metinlerinde ayrıca bakılmalı. | Gerçek ekran `studyProgress.png` | **P2** | "Devam eden" denmeli; bütün metinler `BrandIdentity.md` kontrol listesinden geçirilmeli. |
| 10 | **Akıllı Özet geçmişinde dosya adları başlık oluyordu** ("question.png"). | Gerçek ekran `smartSummary.png` (20 Ekim) | Çözüldü | Kodda çözülmüş (`lensSessionDisplayTitle`: genel dosya adları artık başlık sayılmıyor). Yeni bir çekimle doğrulanmalı. |

## 4. Tasarım ile uygulama arasındaki açıklar

Gerçek ekranlar tasarıma yakın. Ayrışan yerler:
- test seviye adları (madde 3);
- günlük süre (madde 2);
- denemede anında boyanan cevaplar (madde 1): tasarımda yok, uygulamada var;
- SinoAI Çalışma sonucunun düzeni (madde 7).

Bunların dışındaki ekranlarda (onboarding, Profil, bildirimler, ödeme) güncel bir gerçek çekim yok. Mağaza çekimlerinin yaptığı gibi, iki dilde (TR ve EN) bir tam tur çekim QA ölçütü olarak tekrarlanmalı.

## 5. "Kusursuz" için eksik olan: kanıt

Tasarım incelemesi sorunları bulur ama bir tasarımın iyi olduğunu kanıtlamaz. Bunun için:
1. **Öğrenci testi:** her sınav türünden 5 öğrenci (YKS, KPSS ve ABD tarafında SAT). Her biri ilk açılıştan ilk teste kadar, sesli düşünerek. Beş kişilik turlar sorunların çoğunu ortaya çıkarır.
2. **Huni ölçümü:** GA4 olayları hazır. Onboarding'den ödeme ekranına, ödeme ekranından ilk teste ve 1. ve 7. gün dönüş oranları haftalık izlenmeli. İlk 3-7 gün, kullanıcının uygulamayı bırakıp bırakmayacağına karar verdiği pencere.
3. **Erişilebilirlik turu:** VoiceOver ve TalkBack ile bir deneme; ayrıca en büyük yazı boyutuyla bütün ekranlar.

## 6. Önerilen sıra

1. Denemede geri bildirim kararı (madde 1). Senin kararın; uygulaması küçük.
2. Sayı ve ad tutarlılığı (madde 2 ve 3).
3. Tasarım setinin yeniden üretilmesi (madde 4).
4. Erişilebilirlik etiketleri ve kontrast (madde 5 ve 6).
5. SinoAI Çalışma sonucu ve web panel düzeni (madde 7 ve 8).
6. Öğrenci testi ve huni ölçümü: sürekli.

## Durum notu

Üç projede de commit edilmemiş değişiklik var (25 Ekim): mobil 53 dosya, API 81 dosya, web 39 dosya. Yayına çıkmadan önce gözden geçirilmeli.

## Kaynaklar

- Mobil onboarding ve elde tutma: [Appcues](https://appcues.com/blog/mobile-onboarding-best-practices), [Lowcode Agency](https://www.lowcode.agency/blog/mobile-onboarding-best-practices), [Icons8](https://icons8.com/blog/articles/user-retention/), [Websnp](https://www.websnp.com/help/mobile-app-ui-ux-design-best-practices), [UX Magazine](https://uxmag.com/articles/onboarding-best-move-for-user-retention-in-mobile-apps)
- Erişilebilirlik (dokunma alanı, kontrast, yazı boyutu): [Adrian Roselli · Target Size](https://adrianroselli.com/2019/06/target-size-and-2-5-5.html), [Design Systems Collective](https://www.designsystemscollective.com/a-designers-field-guide-to-wcag-ios-and-android-rules-31ba5d01d46a), [BrowserStack](https://browserstack.com/docs/app-accessibility/rule-repository/rules-list/touch-target/touch-target-size), [Evinced](https://knowledge.evinced.com/mobile-validations/tappable-area)
- Geri bildirim zamanlaması: [Butler, Karpicke, Roediger · WUSTL](https://profiles.wustl.edu/en/publications/the-effect-of-type-and-timing-of-feedback-on-learning-from-multip/), [Butler & Roediger 2008 · PubMed](https://pubmed.ncbi.nlm.nih.gov/18491500/), [Timing's not everything · WUSTL](https://profiles.wustl.edu/en/publications/timings-not-everything-immediate-and-delayed-feedback-are-equally/), [Immediate vs delayed feedback · JHETP](https://articlegateway.com/index.php/JHETP/article/view/4925)
