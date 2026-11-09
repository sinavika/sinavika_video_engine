# Kamp senaryosu yazım yönergesi

Bu yönerge, YouTube kamp dersinin senaryosunu (`Curriculum/Scripts/<Kategori>/<Ders>/<Konu>.json`) baştan yazan modele verilir (`Curriculum/Production/Tools/camp_script_batch.py`). Senaryo, Sınavika'nın insansız, animasyonlu ders videosunu üretir: her kart ekranda bir sahne, her anlatım cümlesi seslendirilir.

## 1. Hedef

Türkiye'nin önde gelen YKS ve KPSS kanallarındaki tam konu anlatımları kadar eksiksiz, onlardan daha düzenli bir ders. Öğrenci videoyu bitirdiğinde konuda açık kalmamalı: her alt konu tanımıyla, anlamıyla, kuralıyla, çözümlü örnekleriyle ve kolaydan zora sorularıyla işlenmiş olmalı. Ders öğrenciyle konuşur ("sen" dili), dikkatini dağıtmaz, her birkaç saniyede ekrana yeni bir şey getirir.

## 2. Kaynaklar ve doğruluk

- Pakette verilenler: MEB konu anlatımı (asıl kaynak), ÖSYM'nin 2018–2026 çıkmış soruları (o konudan, yıl ve cevaplarıyla), soru havuzundan örnekler, konunun resmî alt konu listesi, dersin bugünkü senaryosu ve denetimde bulunan eksikler.
- Bu kaynakların dışında yalnız lise matematiğinin herkesçe bilinen, doğrulanabilir bilgisini kullan. Uydurma istatistik, uydurma "ÖSYM şu yıl şunu sordu" cümlesi yok. Yıl anan her cümle paketteki listeyle tutmalı; emin değilsen yıl verme.
- ÖSYM ve MEB metinleri yalnız kalıp ve referanstır, hiçbir soru kökü, şık dizisi ya da örnek birebir alınmaz. Bağlamı, sayıları ve soruyu kendin kur.
- Her soruyu, her örneği, her "şunu seçen şunu bulur" açıklamasını kendin baştan çöz. Tuzak olarak adı geçen değer şıklarda olmalı ve o hata gerçekten o değeri vermeli.

## 3. Dersin akışı

1. **Açılış (`lesson.opening`)**: soru, hata ya da görselle başlar; tek bir soru sorar, iki soru birleştirilmez. Selam, "ben SinoAI", "geçen derste", "bu videoda" yok.
2. **Bölümler**: resmî alt konuların hepsi bir bölümde işlenir (`subtopic` / `subtopics`). Kardeş alt konular aynı bölümde toplanabilir. En çok 14 bölüm, bölümde en çok 14 kart.
3. **Her bölümün içi, bu sırayla:**
   - **Tanım** (`concept`): kavram ne, ne değil. Bölümün ilk kartı tanım ya da anlamı gösteren bir görsel olur.
   - **Anlam** (görsel ya da `predict`): formülden önce neden böyle olduğunu gösteren bir sahne: sayı doğrusu, alan modeli, tablo, grafik, terazi.
   - **Kural** (`rule`): anlamdan çıkan kural, kısa maddelerle; her maddenin örneği.
   - **Çözümlü örnek** (`example`, en az bir; sayısal konularda iki): öğrenci ilk soruyu görmeden önce yöntemin bir kez baştan sona uygulandığını görür.
   - **Sık hata** (`mistake`): öğrencinin gerçekten yaptığı bir hata; `wrong` bir yargı cümlesidir.
   - **Sorular** (`question`): kolaydan zora iki ya da üç; bölümün son sorusu ÖSYM tarzında.
   - İstersen **Sıra sende** (`practice`) ile hatırlatma (derste en çok iki, bölümde en çok bir, bölümün ilk kartı olamaz).
4. **Özet** (`summary`): yalnız derste anlatılanlar; yeni bilgi özete girmez.
5. **Kamp görevi** (`camp.task`): verildiği gibi kalır ya da konuya göre güncellenir; "uygulamada X testinden 20 soru çöz" maddesi kalır.

**Süre (sahip, 9 Kasım 2026: uzun video öğrenciyi sıkar):** ders 20–30 dakika, en çok 35 dakika; çok alt konulu büyük konular (Problemler gibi) en çok 40 dakika. Alt konuların hiçbiri atlanmaz; süreyi tutturmak için her bölümde bir çözümlü örnek (sayısal ağırlıklı bölümde iki), bir sık hata ve iki-üç soru (kolay → ÖSYM tarzı) yeter. Dolgu yok: her cümle yeni bir şey öğretir; kartın metnini anlatımda ikinci kez okuma.

## 4. Sorular

- **Merdiven**: her bölümde kolay (tek kural) → orta (iki adım) → ÖSYM tarzı (bağlam, çok koşul, okuma) sırası.
- **ÖSYM tarzı**: gerçek hayattan bir durum, yeni tanımlanmış bir kavram ya da çok koşullu bir yapı; kök çoğu zaman 40–80 sözcük. Paketteki ÖSYM sorularının kalıplarını tanı ve her kalıptan özgün birer soru yaz.
- **Şekil**: grafikten, tablodan, sayı doğrusundan ya da şekilden okunan sorularda şekil `question.figure` ile verilir (ör. fonksiyon grafiği `plot`, veri `table`/`pie`/`plot` sütunları). Şekli yazıyla anlatıp şekilsiz soru sorma. Köke "yukarıdaki/aşağıdaki şekil" yazma; ekranda yeri değişir: "şekildeki", "tablodaki", "verilen" de.
- **ÖSYM'ye yakınlık**: ÖSYM sorusunun hikâyesini ve cümle kalıbını taşıma ("tahtadaki eşitliği defterine yazarken…", "hangi üçü binerse binsin…"). Fikri al, bağlamı, kurguyu ve soruyu değiştir. Kökün sözcük dörtlüleri ÖSYM metniyle %20'den fazla örtüşmemeli.
- **Şıklar**: beş şık; sayısal şıklar küçükten büyüğe. Dersteki doğru cevaplar A–E arasında dengeli dağılır (E de cevap olur), ardışık üç aynı harf ya da düzenli tekrar yok.
- **Adımlar**: her adım tek bir iş yapar, anlatımı tam cümledir. Son adım cevabı söyler; şık eleme (`eliminate`) gerçekten o adımın gösterdiği şıkları eler.
- `origin.changes`: neyin örnek alındığını ve neyin özgün olduğunu yaz.

## 5. Ekran ve dikkat

- Hiçbir ekran 10 saniyeden uzun değişmeden kalmaz. Görsel kartlarda her vuruş (`beats`) ekrana yeni bir parça getirir ya da bir parçayı gösterir; uzun bir anlatımı vuruşlara böl. Kural kartında maddeler anlatım onlara geldikçe gelir; anlatım maddelerin kendi sözlerini söyler. Kalın (`**…**`) yazılan sözler söylendiği anda yanar: anlatımın gerçekten söylediği anlamlı sözleri kalın yaz.
- Hata kartında düzeltme (`right`) ve neden (`why`), anlatım onların ilk sözlerini söylediğinde gelir; anlatımı buna göre kur.
- Örnek kartında açıklama (`explanation`), ilk **düz** sözcükleri (formül dışındakiler) anlatımda geçtiğinde gelir. Açıklamayı formülle başlatma; anlatımın aynen söylediği iki-üç sözcükle başlat ("123'ün kalanı 6, …"). Uzun örnek metninde, okunurken yanacak bir-iki anlamlı sözü kalın yaz.
- Birden çok hesap satırı olan çözümlü örneği `example.steps` ile yaz: her adımda bir satır matematik (`math`) ya da metin (`text`) ve onu söyleyen tek cümle (`narration`). `steps` olan kartta `explanation` ve `beats` olmaz. Çözümü tabloya, akışa ya da tek açıklama bloğuna sıkıştırma (ayrıntı: `docs/Courses/MatematikKartlari.md`).
- Şekilden okunan soruda adım, şeklin parçasını gösterir (`step.figure`: `show`, `focus`, `zoom`, `note`): grafikte nokta, eğri ya da boyalı aralık (`regions`), tabloda hücre (`r2c3`), pastada dilim.
- Hesabı motor yapan görselleri kullan: işaret tablosu (`signTable`), bölme (`longDivision`), bölen merdiveni (`primeLadder`), şerit modeli (`barModel`), kutu yöntemi (`slots`), alan modeli (`areaModel`), örnek uzay (`sampleSpace`), eşleme (`mapping`).
- Formül dışında `\'` ya da `\div` yazma: kesme işareti düz `'`, bölme `÷`.
- Her görselin parçaları adlandırılmış biçimiyle (`n1`, `r2`, `p1` …) vuruşlarda kullanılır; yalnız şemada olan parçaları kullan.
- Matematiği hareketle göster: sayı doğrusu (`numberLine`, `process` numberline), alan modeli (`process` areamodel), terazi (`equation`), grafik (`plot`), tablo satır satır (`table`), akış (`flow`), karşılaştırma (`comparison`), Venn (`venn`), birim küpler (`cubes`), dönüşüm (`transform`).

## 6. Dil ve okunuş

- Öğrenciyle konuş: "bak", "dikkat et", "şimdi sen dene". Ders kitabı cümlesi okuma.
- Anlatım cümleleri en çok 30 sözcük, her vuruş tam bir cümle.
- Sayıları ve formülleri ekranda yazıldığı gibi yaz; okunuşu motor yapar. Anlatımda formülü sözle söyle ("x kare eksi 4"). Kesirleri "üçte iki", ondalıkları "sıfır virgül beş" diye söyle.
- Yalnız Sınavika ve SinoAI marka adları; derste anlatıcıya SinoAI deme. "Quiz" değil "test". "İndir" deme. Video dışı modüllerden (Works, Dersler) söz etme.
- TYT, KPSS, ÖSYM gibi kısaltmaları yazıldığı gibi bırak.

## 7. Korunacaklar

- `topic` ve `camp` alanları pakette verildiği gibi kalır (görevin metni güncellenebilir). `works` alanı yazılmaz.
- Kısa video (`short`) konunun en çarpıcı üç tuzağından kurulur; kanca en çok beş sözcük ve diğer derslerin kancalarını tekrar etmez ("X'de üç tuzak", "Bu üç soruda herkes…" kalıbı yok). Her tur, cümle + soru + cevap + neden birlikte yaklaşık 12 sözcük; kısa toplam 32 saniyeyi geçmez. Tur cümlesinde uzun okunan gösterim kullanma (`$s(A) = 5$` "s parantez içinde A, eşittir 5" diye okunur); düz sözle yaz ("A'da 5 eleman"). Bir turu başka bir dersin kısasında tekrar etme.
- Şemadaki sınırlar (uzunluklar, sayılar) aşılmaz.

## 8. Çıktı

Yalnız tek bir JSON belgesi: dersin tam senaryosu, ```json çiti içinde. Açıklama, not ya da ikinci bir blok yok.
