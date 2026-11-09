# Matematik kartları ve görselleri (9 Kasım 2026)

Bu belge, TYT Matematik senaryolarının yeniden yazılmasından sonra motora eklenen kartları ve görselleri anlatır. İsteklerin kaynağı: [docs/Analiz/2026-11-09-TYT-Matematik-Kart-Altyapi-Notu.md](../Analiz/2026-11-09-TYT-Matematik-Kart-Altyapi-Notu.md).

Ana kural: çizimdeki her işareti, rakamı ve sayıyı motor hesaplar. Senaryo yalnız sayıları ve parçaları verir. Böylece işaret tablosundaki bir işaret, bölmedeki bir basamak ya da olasılıktaki bir sayım anlatımla çelişemez. Hesaplar `src/Components/Visuals/Mathematics/MathWork.ts` içindedir. Şema, çizilemeyecek veriyi geri çevirir; örneğin eksik kritik noktası olan işaret tablosunu.

## 1. Adım adım çözümlü örnek (`example.steps`)

Çözüm tek blok açıklama ya da "Adım | İşlem" tablosu olarak yazılmaz. Satır satır yazılır:
- her satırın kendi formülü (`math`) ya da kısa sözü (`text`) olur, istenirse ikisi birden;
- her satırın kendi cümlesi (`narration`) olur.

Kartın kendi `narration`'ı örneği okur, sonra adımlar sırayla gelir. Söylenen adımın satırı vurgulanır, numarası büyür.

```json
{
  "kind": "example",
  "title": "Yakalama",
  "example": "Saatte 60 km giden aracın **90 km arkasından**, aynı yönde saatte 90 km giden bir araç çıkıyor. **Kaç saatte** yakalar?",
  "narration": "Saatte 60 km giden aracın 90 km arkasından, aynı yönde saatte 90 km giden bir araç çıkıyor. Kaç saatte yakalar?",
  "steps": [
    {"narration": "Aynı yöndeler: ara her saat 90 eksi 60, yani 30 kilometre kapanır.", "math": "V_{fark} = 90 - 60 = 30", "text": "Aynı yön: hızlar çıkarılır"},
    {"narration": "Kapanacak ara 90 kilometre: 30 çarpı t eşittir 90.", "math": "30 \\cdot t = 90"},
    {"narration": "Her iki tarafı 30'a bölelim: t eşittir 3 saat.", "math": "t = 3", "text": "**3 saatte** yakalar."}
  ]
}
```

- En çok 7 adım yazılır. Her adım tam bir cümledir; duran ekran kuralı adım başına ölçülür.
- `steps` olan kartta `explanation` ve `beats` olmaz:
  - kapanış cümlesi son adıma yazılır;
  - kartın görseli de adımlarla hareket eder: adım bir vuruştur, `show`, `focus`, `stage` ve `zoom` alır.
- Formüldeki büyük harfle başlayan sözcükler ("Anne", "Toplam") ve Türkçe harfli sözcükler ("Kız") düz yazılır, italik harf çarpımı gibi çizilmez.
- `curriculum check` hangi örneklerin adımlara çevrilmesi gerektiğini önerir (`?` satırları):
  - çözümü tabloya ya da akışa sığdırılmış örnekler;
  - açıklamasında iki ya da daha çok formül olan örnekler.

## 2. Soru adımı sorunun şeklini gösterir (`step.figure`)

Çözüm adımı, sorunun kendi şeklindeki bir parçayı söylendiği anda gösterebilir ya da işaret edebilir. Alanlar:
- `show`: parçayı o adımda getirir;
- `focus`: parçayı vurgular, gerisini soldurur;
- `zoom`, `stage`, `note`: kartlardaki vuruşlarla aynı.

| Şekil | Parça adları |
|---|---|
| Grafik (`plot`) | eğri `c1`…, nokta `p1`…, yardımcı çizgi `s1`…, **boyalı aralık `z1`…**, sütun `b1`…, `tangent`, `area`, `approach` |
| Tablo | satır `r1`…, sütun `col1`…, **hücre `r2c3`** |
| Pasta | dilim `p1`… |
| Sayı doğrusu | aralık `i1`…, nokta `p1`… |
| Yeni görseller | §3'teki tablo |

Grafikte boyalı aralık `regions` ile tanımlanır. Üç biçimi var:
- iki eğrinin arası (`between`);
- bir eğriyle x ekseni arası (`curve`);
- grafiğin bütün yüksekliği (ikisi de verilmezse).

```json
"figure": {"kind": "plot", "x": [-1, 5], "y": [-2, 8],
  "curves": [{"expression": "-(x-1)*(x-4)+2", "label": "f"}, {"expression": "2", "label": "g"}],
  "points": [{"x": 1, "y": 2, "label": "A"}, {"x": 4, "y": 2, "label": "B"}],
  "regions": [{"from": 1, "to": 4, "between": [0, 1], "label": "f > g"}]},
"steps": [
  {"text": "Kesişimler **x = 1** ve **x = 4**.", "narration": "…", "figure": {"focus": ["p1", "p2"]}},
  {"text": "Bu aralıkta f, g'nin **üstünde**.", "narration": "…", "figure": {"show": ["z1"], "focus": ["z1"]}},
  {"text": "Cevap **B**.", "narration": "…", "eliminate": ["A", "C", "D", "E"]}
]
```

Kurallar:
- Bir adımın `show` ile getirdiği parça o adıma kadar görünmez. Cevabı veren aralığı soru okunurken göstermemek için `show` kullanılır.
- Şekli olmayan soruda ya da şeklin sahip olmadığı bir parçaya işaret eden adım şema hatası verir.
- Kamp açılışında (soğuk açılış) soru çözülmez; adımların işaret ettiği parçalar gelmez.

## 3. Yeni matematik görselleri

Hepsi matematik kitinde (`LESSON_VISUAL_KITS.MAT`). Kart görseli, soru şekli ya da tahmin kartı görseli olabilirler. Vuruşla parçaları gösterilir, aşamalıları `stage` ile ilerler.

| Görsel | Ne için | Senaryo ne verir | Motor ne hesaplar | Parçalar / aşamalar |
|---|---|---|---|---|
| `signTable` işaret tablosu | Eşitsizlik, ikinci derece, polinom, rasyonel ifade | `points` (kritik değerler), `factors` (`expression`, `label`, `denominator`), isteğe bağlı `relation` (`>`, `<`, `>=`, `<=`) | Her işaret, sonuç satırı, paydanın kökünde tanımsız (‖), çözüm kümesi ("[−1, 2] ∪ (4, ∞)"). Kritik nokta eksikse şema hatası. | `x`, `f1`…, `result`, `solution`, aralık sütunları `i1`… |
| `longDivision` bölme | Bölme, bölünebilme | `dividend`, `divisor`, `check` | Okuldaki gibi her tur: alınan parça, bölüm basamağı, çarpım, kalan; sağlama satırı | `quotient`, `remainder`, `check`; aşama = tur, sonra "Sağlama" |
| `primeLadder` bölen merdiveni | EBOB-EKOK, asal çarpanlar | `numbers` (1–3 sayı), `show` (`ebob`, `ekok`, `both`, `powers`, `none`) | Her satırın asalı; hepsini bölen asallar halkalı; EBOB ve EKOK çarpım olarak; tek sayıda asal kuvvetler | `r1`…, `ebob`, `ekok`, `powers`; aşama = satır |
| `barModel` şerit modeli | Yaş, kesir, oran, işçi ve havuz problemleri | `bars` (her şerit parçalardan oluşur: `units`, `label`, `shade`), `braces` (şeridin parçalarını kapsayan etiket) | Bütün şeritler tek ölçekte: "3 katı" ekranda 3 kat uzun | `b1`…, parça `b1-2`…, parantez `k1`… |
| `slots` kutu yöntemi | Sayma, permütasyon, kombinasyon, basamak | `slots` (`count`, `label`, `note`), `order` (kısıtlı kutu önce), `divideBy` (kombinasyon) | Çarpım ve bölüm ("= 60 ÷ 3! = 10") | `k1`…, `result`; aşama = kutu (`order` sırasıyla), sonra "Sonuç" |
| `areaModel` alan modeli | Çarpanlara ayırma, özdeşlik, çarpma | `rows` ve `columns` (`label`, `size`), isteğe bağlı `cells`, `removed` (a² − b²), `total` | Hücre alanları kenarlardan: x·x → x², x·3 → 3x, 20·3 → 60 | hücre `r1c1`…, `rows`, `columns`, `total` |
| `sampleSpace` örnek uzay | Olasılık (iki zar, iki çekiliş) | `rows`, `columns` (varsayılan 1–6), `cell` (`sum`, `product`, `difference`, `pair`), `events` (`of`, `is`, `value`, `label`) | Olayın hücreleri ve olasılık en sade kesirle ("6/36 = 1/6") | `grid`, olay `e1`, `e2`, olasılık `p1`, `p2` |
| `mapping` eşleme şeması | Fonksiyon, bağıntı, kümeler | `domain`, `codomain` (`label`, `items`), `arrows` ([kaynak, hedef]), `properties` | Fonksiyon mu, bire bir mi, örten mi; okla eşleşmeyen ya da iki ok alan eleman halkalı | `domain`, `codomain`, `properties`, ok `a1`… |

Örnekler: `tests/Fixtures/MathCardLesson.json` bütün kart ve görselleri içeren deneme dersidir. Gerçek kare çizimi testi de bu dersi çizer.

## 4. Denetimler (`curriculum check`, `camp_check`)

Engelleyici (`!`, "Hazırlandı" olmaz):
- **Aritmetik:** Senaryodaki sayısal eşitlikler hesaplanır.
  - Kapsananlar: formüller, tablo hücreleri ve notlardaki "2 · 4 = 8".
  - Tutmayan eşitlik bildirilir. Örnek: `"5 \cdot 4 \cdot 3 = 50" does not hold (60 ≠ 50)`.
  - Bilerek yanlış olanlar atlanır:
    - hata kartının yanlış inancı;
    - şıklar;
    - tırnak içindeki önerme;
    - "çelişkidir", "olamaz" ya da ✗ ile biten iddia;
    - mantık dersleri.
  - Denklem görselinde son adımın cevabı her adıma geri konur. Tahmin kartındaki bilinçli tuzak denklemler atlanır.
- **Şekle yer sözcüğüyle işaret:** Şekilli soruda "aşağıdaki/yukarıdaki şekil" yazılmaz; "şekildeki", "verilen" yazılır. Şekil videoda kökün yanında, uygulamada üstünde durur.
- **Formül dışında ters eğik çizgi:** `$R$\'nin`, metinde `\div` gibi. Ekranda ve seste olduğu gibi çıkar. Metinde küme farkı "A \ B" serbesttir.

Öneri (`?`):
- **Sayısal şıklar küçükten büyüğe:** ÖSYM sırası; kökler ve kesirler değeriyle karşılaştırılır.
- **Uzun kök sığıyor mu:** Kök, bağlam ve şıkların 16:9 kamp düzeninde hangi ölçekte sığdığı ölçülür. %75'in altı (kök yazısı yaklaşık 30 pikselin altında) önerilir: kökü kısalt, listeyi `context`'e taşı.
- **Adımlara çevrilecek örnekler:** §1'deki öneri.
- **Matematik derslerinde süreç önerisi yok:** Diskriminantı anlatan "delta" artık akarsu deltası sanılmaz.

## 5. Test altyapısı

- `tests/Components/Visuals/Mathematics/MathWork.test.ts`:
  - işaret tablosu, kökü eksik etken, çözüm kümesi;
  - binlerce bölmede `bölünen = bölen · bölüm + kalan`;
  - yüzlerce sayı çiftinde EBOB/EKOK = gcd/lcm;
  - zar sayımları, eşleme özellikleri, alan etiketleri.
- `tests/Components/Visuals/Mathematics/TeachingVisual.test.ts`:
  - her yeni görselin şeması, parça adları ve dünya oranı;
  - geri çevrilen veriler;
  - hesaplanan yazılar (sağlama, EBOB/EKOK satırı, olasılık, hükümler);
  - aşamalar, grafikteki boyalı aralık ve tablo hücresi.
- `tests/Courses/MathCard.test.ts`:
  - adımlı örnek: şema, anlatım, görsel parçaları, öneri;
  - formülle başlayan açıklamanın zamanlaması;
  - soru adımının şekle işaret etmesi;
  - matematik dersi denetimleri.
- `tests/Courses/ArithmeticCheck.test.ts`, `tests/Courses/QuestionReview.test.ts`, `tests/Schemas/LatexWords.test.ts`.
- `tests/Components/Visuals/Mathematics/MathVisual.render.ts` (`npm run test:render`):
  - deneme dersindeki 11 kart gerçekten çizilir;
  - kamp dersi 16:9 ve dikey ders;
  - yerleşmiş ve giriş karesi;
  - yerleşim uyarısı sıfır olmalı.
