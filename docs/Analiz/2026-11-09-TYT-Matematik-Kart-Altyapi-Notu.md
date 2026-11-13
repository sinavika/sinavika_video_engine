# TYT Matematik senaryoları: altyapı ve kart ihtiyaçları (9 Kasım 2026)

Kamp senaryosu oturumundan "Sınavika Video Engine kurulumu" oturumuna devir notu. YKS TYT Matematik'in 23 kamp senaryosu yeniden yazıldı (Opus 5.5 + elle düzeltme). Bu not, yeni senaryoların motordan ne beklediğini veriyle anlatır. Sahne/kart işi altyapı oturumunundur; bu oturum yalnız senaryo içeriğine dokunur.

## 1. Senaryolar nerede, durumları ne?

- Yeni senaryolar: 23 dersin hepsi `Curriculum/Scripts/YKS_TYT/MAT/` içinde (9 Kasım gece kopyalandı). `Outputs/Camps/Scripts` altındaki ara kopyalar 14 Kasım'da Geri Dönüşüm Kutusu'na taşındı.
- 23 dersin hepsi `npx tsx Curriculum/Production/Tools/camp_check.mts <klasör>` kontrolünden sorunsuz geçiyor: şema, `reviewScript`, duran ekran (≤ 10 sn), süre ve kısa video. Tek istisna: İkinci Derece'de 7 yanlış "akarsu aşındırması" önerisi (bkz. §4.1).
- 361 sorunun hepsi elle yeniden çözüldü; şekiller metinle karşılaştırıldı. ÖSYM yıl iddiaları çıkmış soru listesiyle doğrulandı. ÖSYM metnine yakın 13 soru kendi cümlelerimizle yeniden yazıldı.

## 2. Yeni senaryoların biçimi (veri)

| Ölçü | Değer |
|---|---|
| Ders / bölüm / soru | 23 / 154 / 361 |
| Ders süresi | 21–40 dk (Problemler 40,0; Fonksiyonlar 40,0; Temel 39,5; Köklü 35,4; kalanların çoğu 25–33) |
| Kartlar | soru 361 · örnek 207 · kural 155 · hata 154 · kavram 132 · görsel 102 · tahmin 47 · sıra sende 10 |
| Kart görselleri | tablo 150 · akış 36 · sayı doğrusu 29 · denklem/terazi 27 · grafik (plot) 22 · formül 17 · karşılaştırma 16 · process 6 · doğruluk tablosu 6 · venn 5 · geometri 5 · pie 4 |
| Soru şekilleri | 46 soru: tablo 18 · grafik 11 · geometri 6 · pie 4 · sayı doğrusu 3 · venn 1 · cycle 1 |
| Soru kökü (bağlam + kök) | ortalama 32 sözcük, 60 soru ≥ 50 sözcük, en uzun 76 |
| Çözüm adımı | soru başına ortalama 3, en çok 5 |
| Cevap dağılımı | A 65 · B 75 · C 72 · D 77 · E 72 |

Eski senaryolarla fark: dersler yaklaşık 2–3 kat uzun (13–15 dk → 25–40 dk). Kökler yaklaşık 2 kat uzun (17 → 32 sözcük). Bölüm başına bir çözümlü örnek ve ÖSYM tarzı soru var; grafikten okunan sorular yeni geldi.

## 3. Kart ve sahne ihtiyaçları (öncelik sırasıyla)

### 3.1 Adım adım çözümlü örnek kartı

- 207 örnek kartı var. Yazım sırasında çıkan duran ekran uyarılarının neredeyse hepsi bu kartlardandı.
- Bugünkü örnek kartı önce örnek metnini, sonra tek parça açıklamayı gösteriyor. Açıklama, ilk **düz** sözcükleri anlatımda geçtiğinde geliyor; `LessonCue.cuesInLine`, `plainWords` matematiği atar.
- Açıklama formülle başlıyorsa (`$123 \equiv 6$ …`) hiç tetiklenmiyor. Bu kartları kalın işaret ekleyerek ve açıklamanın başını düz sözcükle başlatarak geçirdim.
- **İstek:**
  - Soru adımları gibi satır satır gelen bir "çözümlü örnek" kartı: her satırın kendi anlatımı ve kendi işaretleri olsun.
  - Ya da açıklama ipucunun matematik içindeki sayı ve harflerle de eşleşmesi.

### 3.2 Soru şeklinde adım vurgusu

- 46 soru şekilden okunuyor (grafik 11, tablo 18).
- Adımlar bugün kökteki sözcükleri işaretleyebiliyor (`mark`), şıkları eleyebiliyor (`eliminate`), kendi görselini taşıyabiliyor. Ama sorunun **kendi şeklindeki** bir parçayı gösteremiyor. Örnekler: grafikte kesişim noktası, "f > g olan aralık", bir sütun, tabloda bir satır ya da hücre.
- **İstek:** adıma `figureFocus` benzeri bir alan (nokta, eğri, aralık gölgesi, tablo satırı/hücresi, pie dilimi). Böylece "1 ile 2 arası" denince o aralık boyansın.
- Örnekler: `MAT_FONK` s4-c7, s8-c7; `MAT_PROBLEM` s8-c6 (iki aracın grafiği), s10-c5/c6; `MAT_POLINOM` s6-c8.

### 3.3 Uzun kök ve bağlam düzeni

- 60 sorunun kökü 50 sözcüğü geçiyor. Bir kısmında üstüne I/II/III listesi, madde işaretli koşullar ve şekil birlikte geliyor (ör. `MAT_PROBLEM` s13-c6, `MAT_MANTIK` s4-c8, s8-c8).
- **İstek:** bu üçlünün 16:9 ekrana sığdığını gösteren bir yerleşim denetimi. Gerekirse kökü cümle cümle yakan okuma (paragraf sorularındaki `sentences` gibi).

### 3.4 Uzun ders: çok parçalı konu ve dikkat

- Sahip sınırı 20–30 dk, en çok 35 dk; büyük konular en çok 40 dk. Problemler 13 bölümle tam 40 dakikada.
- Bugün bir konu = bir senaryo; konu bir kampta bir kez geçebiliyor.
- **İstek:**
  - Bir konuyu iki videoya bölme desteği: "Problemler 1/2" gibi aynı `topic` kodu, iki senaryo ve iki bölüm. Problemler ve Temel Kavramlar ilk adaylar.
  - Uzun derste bölüm geçişlerinde dikkat tazeleyen bir öğe: ilerleme çubuğu, "3/13" ya da kısa ara özet.

### 3.5 En çok kullanılan görsel: tablo

- 150 kart görseli tablo. Satır satır açılma var.
- **İstek:** hücre vurgusu ve sütun vurgusu (`highlightColumn` tek sütun; birkaç hücre seçilemiyor). Doğruluk tablosu, sıklık tablosu ve işlem tablosu (`MAT_ISLEM` s7) buna ihtiyaç duyuyor.

## 4. Kontrol (check) eksikleri

1. **Yanlış "akarsu aşındırması" önerisi.** `LessonScript.ts` içindeki süreç önerisi "delta" sözcüğüne bakıyor; matematikteki diskriminant da yakalanıyor (`MAT_IKINCI_DER`, 7 öneri). Öneri ders alanına göre sınırlanmalı (yalnız Coğrafya).
2. **`curriculum check` çöküyor.** Başka bir oturumun `public/Media/Credits.json` dosyası yüzünden çöküyor; bu yüzden `camp_check.mts` ile denetledim.
3. **Eksik kurallar.** Yönergede olup motorda olmayanlar:
   - sayısal şıkların küçükten büyüğe sıralanması;
   - şekle "yukarıdaki/aşağıdaki" diye işaret eden kök (ekranda yer değişebilir; "şekildeki/verilen" olmalı);
   - adım `mark` ifadesi kökten silinince şema hatası veriyor. Bu iyi; kalsın.
4. **ÖSYM'ye yakınlık denetimi.**
   - Kökleri `EgitimVerileri/YKS/TYT/CikmisSorular/*.jsonl` ile sözcük dörtlüsü (4-gram) örtüşmesine göre karşılaştırdım. 0,20'nin üstü elle bakılmalı; 0,80 neredeyse kopya.
   - "ÖSYM 20xx'te … sordu" cümleleri listedeki yıl, konu ve içerikle tutmalı.
   - İkisi de motora ya da `camp_check`'e taşınabilir. Betikler bu oturumun scratchpad'inde (`osym_overlap.py`, `yearclaims.py`); istenirse temiz hâli verilir.
5. **Duran ekran için otomatik öneri.** Anlatımın söylediği anlamlı sözcüklerden ekranda kalın yapılacakları seçen açgözlü bir araç yazdım: bağlaç ve işlem sözcükleri dışarıda, en uzun boşluğu bölen sözcük önce. 35 uyarının 19'unu kendisi çözdü. `curriculum fix-still --dry` gibi bir komut olabilir.

## 5. Kısa video (CampShort)

- Kanca ≤ 5 sözcük, tur başına yaklaşık 12 sözcük, toplam ≤ 32 sn. 13 dersin kısası sınırı aşıyordu; elle kısalttım.
- `$s(A) = 5$` gibi matematik okunurken çok uzuyor ("s parantez içinde A, eşittir 5"). Tur cümlesi düz sözle yazılınca sorun kalmıyor. Yönergeye eklendi; motorda kısa turlarda matematik uzunluğu uyarısı yararlı olur.

## 6. Bu oturumda değişen altyapı dosyaları

- Yalnız senaryo araçları değişti: `Curriculum/Production/Tools/camp_script_batch.py`, `camp_contract.mts`, `camp_check.mts`, `Curriculum/Production/KampSenaryoYonergesi.md`.
- `src/` altında bu oturumdan değişiklik yok. Sabah yapılan `worksIssues` değişikliği bunun dışında; o, Works ayrımı içindi.
