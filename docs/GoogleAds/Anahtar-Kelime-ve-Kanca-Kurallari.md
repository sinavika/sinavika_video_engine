# Anahtar kelime araştırması ve kanca kuralları (20 Ekim 2026)

Kaynak: Google Ads Anahtar Kelime Planlayıcı, hesap 704-426-1654, dönem Ekim 2025 – Eylül 2026.
- Türkiye için Türkçe sorgu: 49 kelime.
- ABD için İngilizce sorgu: 40 kelime.

Ham veri `data/` (masaüstü setinde `veri/`) klasöründeki `keyword-volumes-tr-2026-10.tsv` ve `keyword-volumes-us-2026-10.tsv` dosyalarında. Bu kurallar `src/Ads/Google/GoogleAdsPlan.ts` içinde uygulanıyor ve `tests/Ads/Google/GoogleAds.test.ts` ile denetleniyor.

## 1. Ne gördük

Eski görsellerde kanca "Puanını nerede kaybettin?" ve "Netini nerede kaybettin?" idi. Sade ve iyiydi ama **hangi sınav olduğunu söylemiyordu**. KPSS adı yalnız küçük kanıt kartında geçiyordu. Google'da ise öğrenci sınavı ve hatta düzeyini yazarak arıyor:

| Türkiye: en çok aranan | Aylık | | ABD: en çok aranan | Aylık |
|---|---|---|---|---|
| kpss puan hesaplama | 550.000 | | sat practice test | 110.000 |
| yks puan hesaplama | 368.000 | | act practice test | 60.500 |
| tyt net hesaplama | 165.000 | | sat test dates | 60.500 |
| yks net hesaplama | 110.000 | | sat prep | 33.100 |
| kpss ortaöğretim | 74.000 | | sat score calculator | 22.200 |
| kpss çıkmış sorular | 60.500 | | sat vs act | 22.200 |
| kpss net hesaplama | 33.100 | | photo math solver | 22.200 |
| kpss önlisans | 33.100 | | act prep | 18.100 |
| kpss lisans | 27.100 | | sat practice questions | 18.100 |
| tyt konuları | 22.200 | | act score calculator | 12.100 |
| kpss deneme / tyt deneme | 14.800 | | sat math practice | 9.900 |
| kpss tarih | 12.100 | | free sat / act practice test | 8.100 |
| kpss deneme çöz | 6.600 | | how to study for the sat | 5.400 |
| kpss çalışma programı | 3.600 | | sat study plan | 1.300 |

Çıkarımlar:
- **Sınav adı ve düzeyi aramanın merkezinde.** "kpss ortaöğretim" (74 bin), "kpss önlisans" (33 bin) ve "kpss lisans" (27 bin), "kpss deneme"den (15 bin) çok daha fazla aranıyor. Öğrenci kendi düzeyini görmek istiyor.
- **Hesaplama ve deneme niyeti en güçlüsü.** "puan/net hesaplama" ve "deneme (çöz)" aramaları bizim ürünle (deneme → net/puan → eksik konu) birebir örtüşüyor.
- **"Çıkmış sorular" çok aranıyor ama PDF ve indirme niyeti taşıyor.** Bunu kancaya almıyoruz; arama tarafında "pdf" ve "indir" negatif kelime.
- **ABD'de "practice test" ve "score" baskın.** Tıklama maliyeti Türkiye'nin 10–30 katı (sayfa üstü teklif ₺30–130). Bu yüzden ABD'de geniş kelime yerine dar ve niyetli ifadeler gerekir: "SAT practice test online", "SAT score by section".

## 2. Kurallar (uygulandı)

1. **Her kanca sınavı adıyla söyler.** KPSS kancasında "KPSS", YKS kancasında "TYT/AYT/YKS", SAT'ta "SAT", ACT'de "ACT" geçer. Test bunu zorunlu kılıyor.
2. **Her görselin üstünde sınav etiketi bulunur.** Kancanın üstünde küçük, yarı saydam bir hap:
   - "KPSS · Lisans · Önlisans · Ortaöğretim"
   - "YKS · TYT · AYT"
   - "Digital SAT · Math · Reading & Writing"
   - "ACT · English · Math · Reading · Science"

   Tasarım aynı kalıyor: zemin, logo, kanca, cihaz ve kanıt kartı yerinde. Etiket yalnızca "hangi sınav?" sorusunu kancadan önce cevaplıyor. Çok dar bannerlarda (160×600, 728×90, 320×100, 320×50) etiket sığmadığı için yer almıyor; sınav adı orada kancanın içinde.
3. **Kanca, aranan kelimeden kurulur ve ürünün gerçekten yaptığı işi söyler.**

   | Sınav | Eski kanca | Yeni kanca | Dayandığı arama |
   |---|---|---|---|
   | KPSS | Puanını nerede kaybettin? | KPSS puanını nerede kaybettin? | kpss puan hesaplama, kpss deneme |
   | KPSS | İşten sonra da hazırlan. | KPSS çalışma programın hazır. | kpss çalışma programı |
   | KPSS | Genel kültür aklında kalsın. | KPSS tarihi aklında kalsın. | kpss tarih (12.100) |
   | KPSS | Takıldığın konuyu sor! | KPSS'de takıldığın konuyu sor | kpss soru çöz |
   | YKS | Netini nerede kaybettin? | TYT netini nerede kaybettin? | tyt net hesaplama, tyt deneme |
   | YKS | Bugün ne çalışacağını bil. | YKS çalışma programın hazır. | yks/tyt çalışma programı |
   | YKS | Çözemediğin soruyu çek. | Çözemediğin TYT sorusunu çek. | tyt soru çöz |
   | YKS | Türkiye genelinde yerini gör. | Türkiye geneli TYT denemesi | türkiye geneli deneme |
   | SAT | (yoktu) | Where did your SAT score drop? | sat practice test, sat score calculator |
   | SAT | (yoktu) | Your SAT study plan, daily. | sat study plan, how to study for the sat |
   | SAT | (yoktu) | Stuck? Snap the SAT question. | photo math solver |
   | SAT | (yoktu) | Ask SinoAI any SAT topic. | sat practice questions |
   | ACT | (yoktu) | Where did your ACT score drop? / Your ACT study plan, daily. / Stuck? Snap the ACT question. / Ask SinoAI any ACT topic. | act practice test, act prep, act score calculator |
4. **Alt satır aranan ikinci kelimeyi taşır.** Örnek: "KPSS denemeni çöz; puanını hesapla, eksik konunu tek ekranda gör."
5. **Bir reklamda yalnız kendi sınavı görünür.** KPSS'de TYT yok, YKS'de KPSS yok, SAT'ta ACT yok. Bu metinlerde, kanıt kartında, ürün ekranında ve video kapanışında geçerli. Eski kapanış kartı KPSS videosunda "TYT Deneme"li ana ekranı gösteriyordu; artık her video kendi sınavının ekranıyla bitiyor.
6. **Pazar dili ayrı tutulur.** `tr/` klasörü Türkiye'dir (YKS, KPSS, Türkçe). `en/` klasörü ABD'dir (SAT, ACT, İngilizce). İngilizce YKS/KPSS seti kaldırıldı.
7. **Doğrulanamayan iddia yok.**
   - "En iyi", "garanti", "1 numara" yok.
   - Yalnız uygulama gerçekten ücretsiz indirildiği ve ücretsiz plan olduğu için "ücretsiz" var.
   - SAT/ACT puanları örnektir; ürünün gösterdiği biçimde (bölüm bazında puan kaybı) sunulur.
   - iOS reklamının reddedilme nedeni ("güvenilir olmayan iddialar") bu kuralla kapanıyor.
8. **Sunulmayan sınav ve rakip adı kancaya girmez.** ÖABT, AGS, ALES, DHBT ve LGS kancada yer almaz; aramada bunlar negatif kelime.
9. **Uzunluk sınırları Google'ın sınırlarıdır.**
   - Kanca 30 karakteri geçmez (başlık olarak da kullanılıyor).
   - Uzun başlık ve açıklama en fazla 90 karakter; ilk açıklama en fazla 60.

## 3. Yeni bir reklam yazarken kontrol listesi

- [ ] Bu sınav için en çok aranan 3 ifadeye Planlayıcı'dan baktım.
- [ ] Kanca sınav adını içeriyor ve ürünün gerçekten yaptığı bir işi söylüyor.
- [ ] Alt satır ikinci bir aranan ifadeyi taşıyor.
- [ ] Görselde sınav etiketi var; kanıt kartı ve ekran yalnız bu sınavın verisini gösteriyor.
- [ ] Başka sınav, rakip, sunulmayan sınav, "PDF/indir" ve doğrulanamayan iddia yok.
- [ ] `npm run google-ads` ve `npx vitest run tests/Ads/Google/GoogleAds.test.ts` geçiyor.
