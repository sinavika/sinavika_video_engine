# Matematik ve Geometri — ders pedagojisi ve ÖSYM taktikleri (TYT Temel Matematik, AYT Matematik, KPSS Matematik/Geometri)

> Amaç: "Bölüm 0" kamp tanıtım videoları için kaynaklı notlar. TYT Matematik önce çekileceği için daha derin işlendi.
> Not: Bazı bulgular yalnızca özet/ikincil kaynaktan doğrulandı; bu durum her maddede belirtildi. "Uzman görüşü" = araştırma bulgusu değil, deneyim/öneri.
> Araştırma tarihi: 9 Kasım 2026.

## 1. Sınav yapısı ve konu ağırlıkları (TYT problemler en büyük konu mu?)

### Takeaway
TYT 120 soru / 165 dakika; Temel Matematik testi 40 soru (geometri dahil). Bizim resmî çıkmış soru verimizde (MEB'in 2018–2026 TYT çıkmış soru derlemesi) Temel Matematik sorularının %41,6'sı "Problemler" alt başlığında — yılda ~30 matematik sorusu varsayımıyla ~12 soru/yıl, brief'teki "11–14" aralığıyla uyumlu. KPSS Lisans'ta da en büyük blok problemler (%31) ve sayısal mantık (%11).

### Cited Findings
- 2026 TYT: 120 soru, 165 dakika; önceki yıllarla aynı süre ve soru sayısı — [NTV, 2026](https://www.ntv.com.tr/egitim/galeri-yks-ne-zaman-saat-kacta-tyt-ayt-sinavi-kac-dakika-kac-soru-2026-yks-sinav-saati-ve-suresi-1729085); [Tahta App, 2026](https://www.tahtaapp.com/blog/yks/tyt-kac-dk-tyt-ve-ayt-sinav-sureleri-2026-guncel-bf533) (ikincil; ÖSYM kılavuzu doğrudan açılmadı).
- TYT test dağılımı: Türkçe 40, Sosyal 20, Temel Matematik 40, Fen 20 — [Yeditepe Üniversitesi 2026 puan türleri PDF](https://yeditepe.edu.tr/sites/default/files/2026-07/2026-yeditepe-puan-turleri.pdf).
- AYT: 180 dakika, kitapçıkta 160 soru; aday puan türüne göre ~80 soru cevaplar (AYT Matematik testi 40 soru, geometri dahil) — [Tahta App, 2026](https://www.tahtaapp.com/blog/yks/tyt-kac-dk-tyt-ve-ayt-sinav-sureleri-2026-guncel-bf533).
- **Kendi verimiz (yerel, resmî kaynaklı):** `Desktop/EgitimVerileri/YKS/TYT/CikmisSorular/MAT.jsonl` — kaynak "ÖSYM çıkmış sorular (TYT, MEB derlemesi) 2018–2026", 269 matematik sorusu; alt başlık dağılımı: Problemler 112 (%41,6), Temel Kavramlar 16, Sayı Basamakları 14, Veri-İstatistik 14, Kümeler 11, Fonksiyonlar 11, Permütasyon-Kombinasyon 10, Bölünebilme 9, Olasılık 9, Rasyonel/Mutlak değer/Köklü 8'er, Üslü 7, Eşitsizlik 7, Oran-orantı 6. Uyarı: derleme seçkidir (her yılın tamamı olmayabilir), yıl alanı boş, bazı eşleşmeler `needsReview` işaretli. Bu yüzden videoda "her yıl tam 12" değil, "matematik sorularının yaklaşık beşte ikisi problem" denebilir.
- **TYT Geometri (yerel):** `GEO.jsonl` 91 soru; en çok: Katı Cisimler 18, Özel Üçgenler 10, Üçgende Açı 9, Eşlik-Benzerlik 9, Çokgenler 8, Dikdörtgen 7.
- **KPSS Lisans (yerel, ÖSYM GY-GK kitapçıkları 2009–2021+):** 267 matematik sorusu; Problemler 82 (%30,7), Sayısal Mantık 29 (%10,9), Temel Kavramlar 24, Perm.-Komb.-Olasılık 18, Denklemler 15; 157 soruda şekil/tablo var. Geometri 37 soru (ayrı dosya).
- KPSS Genel Yetenek'te ~30 matematik sorusu var; geometri ayrı test değil, matematik içinde; geometri payı kaynaklara göre 3–4 soru (resmî değil) — [kpss.digital](https://kpss.digital/soru-dagilimi/matematik/); [sinavtime](https://sinavtime.com/kpss-matematik-konulari-ve-soru-dagilimi) (ticari siteler, tutarsız).
- ÖSS/YGS/LYS 2006–2012 matematik-geometri sorularının yarısından fazlası yenilenmiş Bloom'da "uygulama" basamağında, ikinci yoğun basamak "analiz" — [Turcomat/DergiPark](https://dergipark.org.tr/en/download/article-file/201401) (arama özeti; tam metin okunmadı).
- 2018–2024 AYT Matematik soruları MATH taksonomisine göre incelendi (Dicle Üniv.) — [Dicle açık arşiv](https://acikerisim.dicle.edu.tr/items/720babc9-f7c3-439f-8078-ad4e2d85e9aa) (bulgu ayrıntısı alınamadı).

### Inferences
- TYT matematiğinde "problem okuma ve denkleme çevirme" becerisi tek başına en yüksek getirili beceri; tanıtım videosunun omurgası bu olmalı.
- KPSS'de problemler + sayısal mantık birlikte ~%40; tablo/şekil okuma çok sık (157/267).

### Gaps
- ÖSYM'nin resmî yıl-yıl konu dağılımı yayımlanmıyor; TYT matematik için doğrudan Bloom analizi yapan DergiPark makalesi bulunamadı.
- 2026 YKS kılavuzunun kendisi açılamadı; sayılar ikincil kaynaklardan.

## 2. Problem çözme: Pólya, Schoenfeld, sözel problemler

### Takeaway
Başarısız çözücüler metinden sayıları ve anahtar kelimeleri çekip doğrudan işleme çeviriyor; başarılılar önce durumun modelini kuruyor (Hegarty, Mayer & Monk 1995). WWC 2012 rehberi: problem çözme sürecini izleme/yansıtma ve görsel temsil öğretimi en güçlü kanıtlı öneriler.

### Cited Findings
- Pólya (1945, *How to Solve It*): dört aşama — problemi anlama, plan yapma, planı uygulama, geriye bakma (kontrol) — [Wikipedia: How to Solve It](https://en.wikipedia.org/wiki/How_to_Solve_It) (genel kaynak).
- Hegarty, Mayer & Monk (1995), *Journal of Educational Psychology* 87(1), 18–32: başarısız çözücüler "doğrudan çeviri" (sayı + anahtar kelime) stratejisi, başarılılar "problem modeli" stratejisi kullanıyor; göz izleme deneyinde başarısızlar sayılara ve ilişki kelimelerine daha çok bakıyor — [Psicothema özeti](https://www.psicothema.com/pi?pii=304); [Utrecht, consistency effect](https://dspace.library.uu.nl/bitstream/handle/1874/31676/schoot%20-%20the%20consistency%20effect.pdf?sequence=2) (özet/ikincil).
- "Tutarlılık etkisi": anahtar kelime yanlış işlemi çağrıştırdığında ("daha az" ama toplama gerekiyorsa) hata artar; hatalar çoğunlukla ters işlem hatasıdır — [Utrecht, consistency effect](https://dspace.library.uu.nl/bitstream/handle/1874/31676/schoot%20-%20the%20consistency%20effect.pdf?sequence=2).
- WWC *Improving Mathematical Problem Solving in Grades 4–8* (Woodward vd., NCEE 2012-4055) beş öneri: (1) problemleri hazırlayıp sınıfça kullan, (2) öğrencinin süreci izlemesine ve yansıtmasına yardım et, (3) görsel temsil kullanmayı öğret, (4) birden fazla strateji göster, (5) kavram ve notasyonu ifade ettir — [LINCS](https://lincs.ed.gov/professional-development/resource-collections/profile-304); [EdWeek 2012](https://www.edweek.org/leadership/what-works-guide-offers-insights-on-math-problem-solving/2012/05).
- Kanıt düzeyleri (ikincil, metni bozuk özet): izleme/yansıtma ve görsel temsil "güçlü", çoklu strateji ve kavram/notasyon "orta", sınıfça problem hazırlama "minimal" — [Nebraska Eğitim Bakanlığı özeti](https://www.education.ne.gov/wp-content/uploads/2020/05/Improving-mathematical-problem-solving-Recommendation-1.pdf). Orijinal rehberden teyit edilmeli.

### Inferences
- TYT problem stratejisi için videoda: "anahtar kelimeye değil duruma bak", "şekil/tablo/şema çiz", "bitince geri dön, cevap mantıklı mı?" — Pólya'nın 4. adımı + WWC öneri 2–3.
- "Kaç?" sorusunu metnin sonundan önce oku → ne istendiği bilinerek okunur (uzman görüşü; doğrudan araştırma bulunamadı).

### Gaps
- Schoenfeld (1985 *Mathematical Problem Solving*; 1992 "Learning to think mathematically") — üstbiliş/kontrol vurgusu biliniyor ama bu oturumda URL ile doğrulanmadı; videoda adı geçecekse kaynak eklenmeli.
- Türk lise öğrencilerinin sözel problem hatalarına özgü DergiPark çalışması bu turda bulunamadı.

## 3. Çözümlü örnek, aşamalı örnek, karışık (interleaved), aralıklı ve geri çağırma pratiği

### Takeaway
Matematikte en sağlam sınıf kanıtı karışık tekrar için: 54 sınıflık RCT'de karışık pratik yapan grup 1 ay sonra %61, bloklu grup %38 aldı (d = 0,83). Yeni konuda önce çözümlü örnek, sonra adım adım silinen (faded) örnek, sonra bağımsız soru.

### Cited Findings
- Rohrer, Dedrick, Hartwig & Cheung (2020), *Journal of Educational Psychology* 112(1) (çevrimiçi 2019): 7. sınıf, 54 sınıf, 4 ay, sınıflar rastgele karışık/bloklu ödevlere atandı; habersiz sınavda 1 ay sonra karışık %61, bloklu %38, d = 0,83; öğretmenler eğitim almadan uyguladı; karışık ödevler daha uzun sürdü — [zendy, DOI 10.1037/edu0000367](https://zendy.io/pdf-viewer/10.1037/edu0000367); [IES proje sayfası](https://ies.ed.gov/use-work/awards/efficacy-study-interleaved-mathematics-practice); [Gwern PDF 2019](https://Www.Gwern.net/doc/psychology/spaced-repetition/2019-rohrer.pdf).
- Dedrick, Rohrer & Hartwig (2020): incelenen 6 ders kitabındaki alıştırmaların ancak ~%9,7'si karışık — [CAS katalog kaydı](https://katalog.lib.cas.cz/KNAV/EdsRecord/edsair,edsair.doi...........63ea46486a47def1dd8e4f848bfbdce0) (ikincil özet).
- Rohrer & Taylor (2007), *Instructional Science* 35, 481–498: konu konu gruplu alıştırma yerine karışık (shuffled) alıştırma, bir hafta sonraki testte belirgin şekilde daha iyi — [DOI 10.1007/s11251-007-9015-8](https://doi.org/10.1007/S11251-007-9015-8).
- Neden işe yarıyor (yazar yorumu): karışık pratik öğrenciyi "hangi yöntem?" seçimini yapmaya zorlar; bloklu pratikte yöntem sorulmadan bellidir — [Rohrer 2012, Educ. Psychol. Rev., DOI 10.1007/s10648-012-9201-3](https://doi.org/10.1007/s10648-012-9201-3) (başlık/kaynak; tam metin okunmadı).
- Renkl & Atkinson (2002) ve Atkinson, Renkl & Merrill (2003): çözümlü örnekten adımları sırayla çıkarmak (fading) yakın transferi güvenilir biçimde artırıyor; matematik ve fizikte tekrarlandı — [typeset PDF](https://typeset.io/pdf/from-example-study-to-problem-solving-smooth-transitions-15tfd8h0l4.pdf); [ASU fading derlemesi](https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf).
- Sınır: çözümlü örnek ve fading acemiler için; uzmanlaştıkça faydası azalır (expertise reversal) — [ASU fading derlemesi](https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf); [Wikipedia: Worked-example effect](https://en.wikipedia.org/wiki/Worked-example_effect).
- IES/WWC *Organizing Instruction and Study to Improve Student Learning* (Pashler vd., 2007): öneriler arasında öğrenmeyi zamana yaymak, testle yeniden karşılaştırmak, çözümlü örnekle problem çözmeyi dönüşümlü yapmak, derin "neden" soruları — [IES PDF](https://ies.ed.gov/ncee/WWC/Docs/PracticeGuide/20072004.pdf). Kanıt düzeyleri ikincil kaynaklarda çelişkili: bir özet aralıklı öğrenme ve çözümlü örnek–problem dönüşümünü "güçlü" diyor — [Learning Forward brief](https://learningforward.org/wp-content/uploads/2007/12/research-brief.pdf); başka özet quiz'i "güçlü" diyor — [third-bit](https://third-bit.com/2011/12/24/organizing-instruction-and-study-to-improve-student-learning/). Tablo 2 bu oturumda okunamadı.

### Inferences
- TYT kamp önerisi: her ders sonunda eski konulardan 2–3 karışık soru (Sıra sende kartları buna uygun).
- "Konu bitti, 100 soru aynı tipten çözdüm" hissi yanıltıcı; karışık deneme/tekrar gerçek sınavı taklit eder.

### Gaps
- Aralıklı pratiğin matematik-özel güncel meta-analiz sayıları bu turda alınmadı.

## 4. Kavramsal vs işlemsel bilgi, sayı hissi ve kavram yanılgıları

### Takeaway
Kavramsal ve işlemsel bilgi tek yönlü değil, birbirini besliyor (Rittle-Johnson, Schneider & Star 2015). Türkiye'de kavram yanılgısı araştırmaları çoğunlukla ortaokulda ve sayılar-cebir alanında yoğun; üslü sayılarda sıfırıncı kuvvet ve negatif taban/üs, kesirlerin sayı doğrusunda gösterimi, eksi işaretinin aşırı genellenmesi belgelenmiş.

### Cited Findings
- Rittle-Johnson, Schneider & Star (2015), *Educational Psychology Review* 27(4), 587–597: kavramsal ve işlemsel bilgi arasında çift yönlü ilişki (derleme) — [PDF](https://moodle2.units.it/pluginfile.php/574613/mod_resource/content/2/s10648-015-9302-x.pdf).
- Schneider, Rittle-Johnson & Star (2011): ortaokul denklem çözmede iki bilgi türü arasında kararlı çift yönlü ilişki, ön bilgiyle değişmiyor — [Uni Trier PDF](https://www.uni-trier.de/fileadmin/fb1/prof/PSY/PAE/Forschung/SchneiderEtAl2011.pdf).
- Türkiye'de ortaokul–lise kavram yanılgısı çalışmalarının sistematik derlemesi: çalışmalar ortaokulda yoğun; lisede çoğunlukla sayılar ve cebir — [Hacettepe AVESİS](https://avesis.hacettepe.edu.tr/publication/details/ceebb511-ce7d-46a7-a451-7b6af8df09bb/ortaokul-ve-lise-ogrencilerinin-matematiksel-kavram-yanilgilarina-yonelik-turkiyede-yapilan-calismalarin-sistematik-derlemesi).
- Tam sayı kuvvetleri: öğrenciler sıfırıncı kuvvette ve taban/üs negatif olduğunda yanılgıya düşüyor — [DergiPark](https://dergipark.org.tr/en/download/article-file/2606194) (arama özeti; hangi makale olduğu tam metinden teyit edilmeli).
- Rasyonel sayılar ve sayı doğrusu (7. sınıf): yaygın hata/yanılgılar; rasyonel sayının mutlak değerini sayı doğrusunda göstermede zorluk — [DergiPark](https://dergipark.org.tr/en/download/article-file/819792) (arama özeti).
- 9. sınıf doğal sayılar: çok sayıda hata ve yanılgı, cinsiyete göre fark yok (Kastamonu Eğitim Dergisi) — [DergiPark](https://dergipark.org.tr/tr/download/article-file/209823) (arama özeti).
- 8. sınıf: "önünde eksi olan sayı negatiftir" kuralının yanlış bağlamlara genellenmesi — [DergiPark](https://dergipark.org.tr/en/download/article-file/1032940) (arama özeti; dosya–bulgu eşleşmesi kesin değil).

### Inferences
- Videoda örnek tuzaklar: −2² ile (−2)² farkı, a⁰ = 1 (a ≠ 0), |−x| ≠ −x, "−x her zaman negatif" yanılgısı (x negatifse −x pozitif) — bunlar matematiksel olarak doğru; yanılgı olarak yaygınlığı yukarıdaki çalışmalara dayanıyor.
- "Formülü ezberleme, nereden geldiğini gör" mesajı çift yönlü ilişkiyle uyumlu; ama işlem akıcılığı da kavramı besler — "ikisi birlikte" demek doğru.

### Gaps
- Fonksiyon kavramı ve olasılık yanılgılarına (ör. kumarbaz yanılgısı) dair Türk lise çalışması bu turda URL ile alınmadı.
- Lise düzeyi mutlak değer/negatif sayı yanılgısı makalesi bulunamadı.

## 5. Geometri: van Hiele, şekil çizme, yardımcı çizgi

### Takeaway
Türk öğretmen adaylarında bile van Hiele düzeyleri çoğunlukla düşük (ör. 430 adayda 1. düzeyde yığılma); öğrencinin şekli "görünüşten" değil "özelliklerden" tanıması geometri başarısının çekirdeği. WWC: görsel temsil öğretmek güçlü kanıtlı öneri.

### Cited Findings
- 430 öğretmen adayı (Eskişehir): van Hiele düzeyleri genel olarak 1. düzeyde yığılıyor; beyin baskınlığıyla ilişki yok (MAKÜ Eğitim Fak. Dergisi, 2017) — [DergiPark](https://dergipark.org.tr/en/download/article-file/300105) (arama özeti).
- İlköğretim ve ortaöğretim matematik öğretmeni adaylarının büyük bölümü beklenen geometrik düşünme düzeyine ulaşamamış; iki grup farksız (Usiskin testi, Dicle) — [DergiPark](https://dergipark.org.tr/tr/download/article-file/256146) (arama özeti; dosya eşleşmesi teyit edilmeli).
- Sınıf öğretmeni adaylarında geometrik düşünme düzeyi ile tutum arasında düşük ama anlamlı ilişki (Bal, 2011) — [İnönü açık arşiv](https://abakus.inonu.edu.tr/items/7896c702-f594-4631-9f09-6848b17104a9).
- Görsel temsil kullanmayı öğretmek problem çözmede önerilen (ikincil kaynağa göre güçlü kanıt) — [Nebraska özeti](https://www.education.ne.gov/wp-content/uploads/2020/05/Improving-mathematical-problem-solving-Recommendation-1.pdf); [LINCS](https://lincs.ed.gov/professional-development/resource-collections/profile-304).
- Tall & Vinner'in "kavram imajı" çerçevesi geometrik kavramlara da uygulanıyor: Türk öğretmen adaylarının temel geometrik kavram imajları incelendi — [KKÜ açık arşiv](https://acikerisim.kku.edu.tr/items/4b319223-7f1a-4703-b76c-04150ae66ccb).

### Inferences
- Videoda: "Soru şekli 'ölçekli değildir'; gözle değil özellikle karar ver", "şekil yoksa kendin çiz", "yardımcı çizgi = bildiğin bir üçgeni/dik açıyı ortaya çıkarmak" (uzman görüşü; doğrudan deneysel kanıt bu turda bulunamadı).
- TYT geometride katı cisimler ve özel üçgenler en sık (yerel veri) → tanıtımda somut örnek bu iki alandan.

### Gaps
- Lise öğrencisi (öğretmen adayı değil) van Hiele dağılımı ve yardımcı çizgi eğitimi üzerine deneysel çalışma bulunamadı.

## 6. AYT: limit, türev, integral, trigonometri

### Takeaway
Tall & Vinner (1981): öğrencinin kafasındaki "kavram imajı" resmî tanımla çatışabilir; limit ve süreklilikte bu çatışma belgelenmiş. AYT'de tanımı bilmek ile resmi/grafiği yorumlamak ayrı beceriler.

### Cited Findings
- Tall & Vinner (1981), *Educational Studies in Mathematics* 12, 151–169: kavram imajı (zihindeki tüm bilişsel yapı) ile kavram tanımı (sözel/simgesel tanım) ayrımı; bireysel imajlar resmî teoriden farklılaşıyor ve bilişsel çatışma doğuruyor; limit ve süreklilik örneği — [Springer DOI](https://link.springer.com/doi/10.1007/BF00305619); [Warwick WRAP](https://wrap.warwick.ac.uk/id/eprint/507); [CORE PDF](https://core.ac.uk/download/48984.pdf).
- 2018–2024 AYT matematik sorularının MATH taksonomisi analizi mevcut (bulgular alınamadı) — [Dicle](https://acikerisim.dicle.edu.tr/items/720babc9-f7c3-439f-8078-ad4e2d85e9aa).

### Inferences
- AYT tanıtımında: "Türevi sadece kural listesi olarak değil, eğim/değişim hızı olarak gör; grafik sorularında bu imaj seni kurtarır" — Tall & Vinner çerçevesiyle uyumlu (yorum).

### Gaps
- Trigonometri öğrenme güçlükleri ve türev/integral kavram yanılgıları için Türk çalışmaları bu turda alınmadı (araç limiti).

## 7. ÖSYM tarzı taktikler (şıklardan gitme, sayı verme, tahmin, iki tur, zaman)

### Takeaway
Bu taktiklerin çoğu için doğrudan deneysel çalışma bulunamadı; uzman görüşü olarak sunulmalı. Ancak bazıları araştırmaya dayalı ilkelere bağlanabilir: kontrol (Pólya 4. adım), izleme/yansıtma (WWC), çoklu strateji (WWC öneri 4).

### Cited Findings
- Çoklu strateji göstermek orta kanıtlı öneri (WWC 2012) — [LINCS](https://lincs.ed.gov/professional-development/resource-collections/profile-304). → "Şıklardan gitme" ve "sayı verme" alternatif stratejiler olarak bu çerçeveye oturur (yorum).
- Pólya'nın "geriye bakma" adımı: sonucu kontrol et — [Wikipedia: How to Solve It](https://en.wikipedia.org/wiki/How_to_Solve_It).
- ÖSYM sorularının çoğunluğu uygulama/analiz düzeyinde (ÖSS/YGS/LYS dönemi) — [DergiPark](https://dergipark.org.tr/en/download/article-file/201401) → bilgi tek başına yetmez, uygulama pratiği gerekir.
- **Uzman görüşü (araştırma değil):** TYT'de 165 dakika 120 soruya bölününce ortalama ~1,4 dk/soru düşer (aritmetik); matematiğe ayrılan sürenin planlanması, takılan soruyu işaretleyip geçme ("iki tur"), uzun problemi sona bırakma yaygın koçluk önerileri. Şıklar sayısal ve sıralıysa ortadaki şıktan deneme, harfli ifadelerde uygun küçük sayı verme (0, 1 gibi şıkları ayırt etmeyen değerlerden kaçınarak) yaygın taktiklerdir.

### Inferences
- Videoda bu taktikler "deneyimli öğretmenlerin önerisi" diliyle verilmeli, "araştırmalar gösteriyor" denmemeli.

### Gaps
- İki tur stratejisi, şıklardan gitme ve soru atlama sırası için hakemli deneysel çalışma bulunamadı.

## 8. Matematik kaygısı

### Takeaway
Matematik kaygısı ile başarı arasında negatif ilişki var ve karmaşık görevlerde daha güçlü (Namkung, Peng & Lin 2019). Sınav öncesi 10 dakikalık "kaygıları yazma" (Ramirez & Beilock 2011) kaygılı öğrencilerde notları yükseltti; kaygısı düşük öğrencide etkisi yok.

### Cited Findings
- Ramirez & Beilock (2011), *Science* 331(6014), 211–213: sınav hemen öncesinde kaygıları yazmak performansı artırdı; sınıf çalışmasında 106 dokuzuncu sınıf, kaygılı yazanlar B+, kontrol B−; ayrıca 47 üniversite öğrencisiyle laboratuvar (matematik) deneyi; kaygısı düşüklerde fark yok — [UChicago News, 2011](https://news.uchicago.edu/story/writing-about-worries-eases-anxiety-and-improves-test-performance); [ScienceDaily](https://www.sciencedaily.com/releases/2011/01/110113141605.htm).
- Eleştiri: Lang & Lang (Science, 2011) düşük kaygılılarda zararlı olabileceğini savundu; yazarlar aynı sayıda yanıt verdi — [Science News](https://www.sciencenews.org/?p=6917) (arama özeti).
- Namkung, Peng & Lin (2019), *Review of Educational Research* 89(3), 459–496: okul çağı öğrencilerinde matematik kaygısı–performans negatif ilişkisi; karmaşık görev içeren testlerde ilişki daha güçlü — [Frontiers derlemesi içinde atıf](https://www.frontiersin.org/articles/10.3389/feduc.2022.798516) (korelasyon değeri bu turda alınamadı).
- Matematik kaygısı ve performans meta-analizi (Zhang, Zhao & Kong 2019, ayrı çalışma) — [Frontiers 2019](https://www.frontiersin.org/article/10.3389/fpsyg.2019.01613/full).

### Inferences
- Videoda kısa öneri: "Sınavdan önce birkaç dakika endişelerini kâğıda yaz" — kaygılılar için kanıtlı, ama herkese değil diye çerçevelenmeli.

### Gaps
- Namkung 2019'un tam korelasyon değeri; Türk öğrencilerde YKS matematik kaygısı verisi alınamadı.

---

## Videoda söylenebilecek doğrulanmış cümleler ve taktikler

### TYT Matematik (15+)
1. "TYT'de matematik testi 40 soru; geometri de bu 40'ın içinde." — [Yeditepe 2026](https://yeditepe.edu.tr/sites/default/files/2026-07/2026-yeditepe-puan-turleri.pdf)
2. "2018'den bu yana TYT matematik sorularının yaklaşık beşte ikisi problem sorusu." — yerel veri: MEB'in TYT çıkmış soru derlemesi (`EgitimVerileri/YKS/TYT/CikmisSorular/MAT.jsonl`, 112/269)
3. "Yani problemleri çözebilmek, TYT matematiğinin en büyük kapısı." — aynı yerel veri (yorum)
4. "Problemde zorlananlar genelde sayıları ve 'fazla', 'az' gibi kelimeleri yakalayıp hemen işleme geçiyor; başaranlar önce olayı kafasında kuruyor." — [Hegarty, Mayer & Monk 1995](https://www.psicothema.com/pi?pii=304)
5. "'Daha az' kelimesi her zaman çıkarma demek değil; kelimeye değil duruma bak." — [tutarlılık etkisi](https://dspace.library.uu.nl/bitstream/handle/1874/31676/schoot%20-%20the%20consistency%20effect.pdf?sequence=2)
6. "Her problemde dört adım: anla, planla, uygula, kontrol et." — [Pólya 1945](https://en.wikipedia.org/wiki/How_to_Solve_It)
7. "Bulduğun cevabı soruya geri koy: yaş eksi çıktıysa bir yerde hata var." — Pólya geriye bakma adımı (aynı kaynak)
8. "Şema, tablo ya da çizgi çiz; görsel temsil kullanmak araştırmalarda önerilen bir problem çözme becerisi." — [WWC 2012](https://lincs.ed.gov/professional-development/resource-collections/profile-304)
9. "Bir soruyu iki farklı yoldan çözmeyi dene; çoklu strateji de önerilenler arasında." — [WWC 2012](https://lincs.ed.gov/professional-development/resource-collections/profile-304)
10. "Çözerken kendine sor: ne istendi, nereye geldim, doğru yolda mıyım?" — WWC öneri 2, izleme/yansıtma ([Nebraska özeti](https://www.education.ne.gov/wp-content/uploads/2020/05/Improving-mathematical-problem-solving-Recommendation-1.pdf))
11. "Konuları karıştırarak tekrar et: bir çalışmada karışık çalışan sınıflar bir ay sonra %61, konu konu çalışanlar %38 aldı." — [Rohrer vd. 2020](https://zendy.io/pdf-viewer/10.1037/edu0000367)
12. "Karışık çalışma zor gelir, daha uzun sürer; ama kalıcı olan o." — aynı çalışma (karışık ödevler daha uzun sürdü)
13. "Yeni konuda önce çözülmüş örneği adım adım izle, sonra adımları kendin tamamla, en son tek başına çöz." — [Renkl & Atkinson 2002](https://typeset.io/pdf/from-example-study-to-problem-solving-smooth-transitions-15tfd8h0l4.pdf)
14. "Formülün neden çalıştığını bilmek işlemi hızlandırır, işlem pratiği de anlamayı derinleştirir; ikisi birbirini besler." — [Rittle-Johnson vd. 2015](https://moodle2.units.it/pluginfile.php/574613/mod_resource/content/2/s10648-015-9302-x.pdf)
15. "Sıfırıncı kuvvet ve negatif taban/üs, öğrencilerin en çok yanıldığı yerlerden." — [DergiPark, tam sayı kuvvetleri](https://dergipark.org.tr/en/download/article-file/2606194)
16. "Önünde eksi olan her şey negatif değildir: x negatifse −x pozitiftir." — [DergiPark, eksi işareti genellemesi](https://dergipark.org.tr/en/download/article-file/1032940) + matematiksel doğruluk
17. "Kesirleri sayı doğrusuna yerleştirebiliyorsan, onları gerçekten anlıyorsun demektir." — [DergiPark, rasyonel sayılar ve sayı doğrusu](https://dergipark.org.tr/en/download/article-file/819792) (yorum)
18. "Sınavdan önce kaygılıysan, birkaç dakika endişelerini kâğıda yaz; bir çalışmada bu, kaygılı öğrencilerin notunu yükseltti." — [Ramirez & Beilock 2011](https://news.uchicago.edu/story/writing-about-worries-eases-anxiety-and-improves-test-performance)
19. (Uzman görüşü) "Takıldığın soruyu işaretle, geç; turu bitirince geri dön." — doğrudan araştırma yok; koçluk önerisi olarak söylenmeli.

### TYT Geometri
1. "TYT'de geometri ayrı test değil, matematik testinin içinde." — [Yeditepe 2026](https://yeditepe.edu.tr/sites/default/files/2026-07/2026-yeditepe-puan-turleri.pdf)
2. "Çıkmış TYT geometri sorularında en sık konular katı cisimler ve özel üçgenler." — yerel veri (`GEO.jsonl`: 18 ve 10 / 91)
3. "Bir şekli görünüşünden değil, özelliklerinden tanı; geometrik düşünmenin basamakları bunu anlatır." — van Hiele çerçevesi; [DergiPark, 430 öğretmen adayı](https://dergipark.org.tr/en/download/article-file/300105)
4. "Öğretmen adaylarında bile geometrik düşünme düzeyi çoğunlukla ilk basamaklarda kalıyor; zorlanıyorsan yalnız değilsin." — aynı kaynak
5. "Şekil verilmediyse kendin çiz; görsel temsil problem çözmenin önerilen araçlarından." — [WWC 2012](https://lincs.ed.gov/professional-development/resource-collections/profile-304)
6. "Eşlik ve benzerlik, TYT geometrinin sık konularından." — yerel veri (9/91)
7. (Uzman görüşü) "Yardımcı çizgi çekerken amaç bildiğin bir üçgeni ya da dik açıyı ortaya çıkarmak."

### AYT Matematik
1. "AYT 180 dakika; matematik testi 40 soru ve geometri de içinde." — [Tahta App 2026](https://www.tahtaapp.com/blog/yks/tyt-kac-dk-tyt-ve-ayt-sinav-sureleri-2026-guncel-bf533)
2. "Kafandaki limit resmi ile kitaptaki tanım çatışabilir; bu çok bilinen bir öğrenme sorunu." — [Tall & Vinner 1981](https://link.springer.com/doi/10.1007/BF00305619)
3. "Türevi bir kural listesi değil, değişim hızı ve eğim olarak gör." — Tall & Vinner çerçevesi (yorum) + matematiksel doğruluk
4. "ÖSYM matematik sorularının çoğu bilgiyi uygulama ve analiz etme düzeyinde." — [DergiPark ÖSS/YGS/LYS analizi](https://dergipark.org.tr/en/download/article-file/201401)
5. "Türev, integral, trigonometri sorularını karışık çöz; hangi yöntemi seçeceğini bulmak da bir beceri." — [Rohrer & Taylor 2007](https://doi.org/10.1007/S11251-007-9015-8); [Rohrer 2012](https://doi.org/10.1007/s10648-012-9201-3)
6. "Çözülmüş örnekleri incelemek yeni konuda çok işe yarar; konuya hâkim oldukça kendi başına çözmeye geç." — [ASU fading derlemesi](https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf)
7. "Matematik kaygısı ile başarı arasındaki ilişki karmaşık sorularda daha güçlü." — [Namkung vd. 2019, Frontiers'ta atıf](https://www.frontiersin.org/articles/10.3389/feduc.2022.798516)

### AYT Geometri
1. "AYT'de geometri, 40 soruluk matematik testinin içinde." — [Tahta App 2026](https://www.tahtaapp.com/blog/yks/tyt-kac-dk-tyt-ve-ayt-sinav-sureleri-2026-guncel-bf533)
2. "Şekli özelliklerinden okumak geometrik düşünmenin üst basamağı." — [van Hiele, DergiPark](https://dergipark.org.tr/en/download/article-file/300105)
3. "Geometrik kavramların kafandaki görüntüsü tanımla uyuşmayabilir; tanımı her zaman kontrol et." — [KKÜ kavram imajı çalışması](https://acikerisim.kku.edu.tr/items/4b319223-7f1a-4703-b76c-04150ae66ccb); [Tall & Vinner 1981](https://link.springer.com/doi/10.1007/BF00305619)
4. "Görsel temsil kurmak öğretilebilir bir beceri." — [WWC 2012](https://lincs.ed.gov/professional-development/resource-collections/profile-304)
5. "Analitik geometride şekli koordinat düzlemine çizmek, cebiri görünür kılar." — WWC görsel temsil önerisi (yorum)
6. (Uzman görüşü) "Şekil ölçekli olmayabilir; açıyı gözle değil bilgiyle bul."

### KPSS Matematik
1. "KPSS Genel Yetenek'te yaklaşık 30 matematik sorusu var; geometri de içinde." — [kpss.digital](https://kpss.digital/soru-dagilimi/matematik/) (resmî olmayan dağılım)
2. "Çıkmış KPSS Lisans matematik sorularının yaklaşık üçte biri problem." — yerel veri (`KPSS/Lisans/CikmisSorular/MAT.jsonl`, 82/267)
3. "Sayısal mantık soruları da büyük blok; tablo ve şekil okumak şart." — yerel veri (29/267; 157 soruda şekil/tablo)
4. "Problemde anahtar kelimeye değil, olayın kendisine bak." — [Hegarty vd. 1995](https://www.psicothema.com/pi?pii=304)
5. "Anla, planla, uygula, kontrol et." — [Pólya 1945](https://en.wikipedia.org/wiki/How_to_Solve_It)
6. "Konuları karıştırarak tekrar etmek, aynı tipi art arda çözmekten daha kalıcı." — [Rohrer vd. 2020](https://zendy.io/pdf-viewer/10.1037/edu0000367)
7. "Üslü sayılarda sıfırıncı kuvvet ve negatif taban klasik tuzak." — [DergiPark](https://dergipark.org.tr/en/download/article-file/2606194)
8. "Sınav kaygın varsa, sınavdan hemen önce endişelerini yazmak işe yarayabilir." — [Ramirez & Beilock 2011](https://news.uchicago.edu/story/writing-about-worries-eases-anxiety-and-improves-test-performance)

### KPSS Geometri
1. "KPSS'de geometri ayrı test değil; matematik içinde birkaç soru olarak gelir." — [kpss.digital](https://kpss.digital/soru-dagilimi/matematik/); [sinavtime](https://sinavtime.com/kpss-matematik-konulari-ve-soru-dagilimi) (sayı kaynağa göre 3–4, resmî değil)
2. "Az soru ama atlanmamalı: temel üçgen ve alan bilgisi çoğunu çözer." — yerel veri (`KPSS/Lisans/CikmisSorular/GEO.jsonl` 37 soru) (yorum)
3. "Şekli çiz, verilenleri üzerine yaz." — [WWC 2012](https://lincs.ed.gov/professional-development/resource-collections/profile-304)
4. "Şekli görünüşüyle değil özellikleriyle tanı." — [van Hiele, DergiPark](https://dergipark.org.tr/en/download/article-file/300105)
5. "Geometride zorlanmak çok yaygın; öğretmen adaylarında bile düzeyler düşük çıkıyor." — aynı kaynak
6. (Uzman görüşü) "Yardımcı çizgiyle dik üçgen ya da benzer üçgen yakala."
