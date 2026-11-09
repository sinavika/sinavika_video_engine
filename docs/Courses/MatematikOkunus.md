# Matematik okunuş tablosu (seslendirme)

*29 Ekim 2026. Onay bekliyor: AYT Matematik kampı bu tablo onaylanınca başlar.*

Ekrandaki formüller ElevenLabs'e gitmeden önce Türkçe okunuşa çevrilir. Bu belge, sesin bir formülü **nasıl okuyacağını** gösterir. Tablolardaki okunuş, sesin aldığı metnin kendisidir (sayılar yazıyla).

Okuyucu yenilendi. Eski düz kurallar iç içe formülü bozuyordu; limit, türev, integral, toplam, logaritma ve trigonometriyi hiç bilmiyordu. Yeni okuyucu formülü önce ağaç olarak çözüyor (`src/Schemas/MathSpeech.ts`). Sayılar eskisi gibi merkezde yazıya çevriliyor ("2'ye" → "ikiye").

**Kısaca ne değişti**

- Senaryolardaki 3971 farklı formülün **3536 tanesinin okunuşu aynı kaldı**. **435 okunuş değişti**: hepsi aşağıda, önce ve sonra yan yana.
- Değişenlerin çoğu hata düzeltmesi. 87 formülde Yunan harfi ya da sinüs, kosinüs, tanjant **hiç okunmuyordu**: `\sin 30° = \frac{1}{2}` "otuz derece eşittir bir bölü iki" diye okunuyordu. `12\,000` "on iki virgül sıfır sıfır sıfır", cebirdeki `2m` "iki metre" okunuyordu. `[AB]` köşeli parantezle sese gidiyordu.
- 152 anlatım satırında ve kalın yazılmış formüllerde (`**$P(a)$**`) LaTeX **olduğu gibi sese gidiyordu** (örnek: `Küpte dayanıklılık $\propto \frac{1}{a}$.`). Artık bunlar da formül gibi okunuyor. Bu satırların sesi bir sonraki seslendirmede yeniden üretilir. Formülsüz satırların sesi değişmez.
- AYT için yeni okunuşlar: limit, türev, integral, toplam, logaritma, trigonometri, aralık, dizi, karmaşık sayı.

## Onayınızı bekleyen kararlar

Bir öğretmenin farklı okuyabileceği yerler. Her biri için seçilen okunuş ve nedeni:

| # | Konu | Seçilen okunuş | Neden, seçenek |
|---|---|---|---|
| 1 | Karmaşık kesir: payında ya da paydasında toplam, fark, çarpım ya da başka bir kesir var | `\frac{x+1}{x-1}` → "kesrin payı x artı bir, paydası x eksi bir" | "x artı bir bölü x eksi bir" kulakta x + 1/x − 1 diye de anlaşılır. Basit kesir aynı kaldı: "bir bölü üç", "a bölü b". 121 senaryo formülü değişti. |
| 2 | İçinde toplam olan kök | `\sqrt{x+1}` → "karekök içinde x artı bir" | "karekök x artı bir" √x + 1 diye anlaşılır. Tek terimli kök aynı: "karekök iki", "karekök x". 58 formül değişti. |
| 3 | Bileşik üs, alt indis ve fonksiyon girdisinden sonra kısa duraklama | `2^{x+1} = 8` → "iki üssü x artı bir, eşittir sekiz"; `f(x+1) = 2` → "f x artı bir, eşittir iki" | Virgül, sesin kısa durmasıdır: üssün ya da girdinin nerede bittiğini duyurur. |
| 4 | Limit | `\lim_{x\to 2}` → "x ikiye giderken limit" | İstenen okunuş. Tek yanlı limit: "x sıfıra sağdan giderken limit". |
| 5 | Türev | `f'(x)` → "f türev x", `f''(x)` → "f ikinci türev x" | İstenen okunuş. `\frac{dy}{dx}` → "y'nin x'e göre türevi". |
| 6 | İntegral | `\int_0^1 x^2\,dx` → "sıfırdan bire x kare dx'in integrali" | İstenen okunuş. |
| 7 | Toplam | `\sum_{k=1}^{n}` → "k eşittir birden n'e toplam" | İstenen okunuş. |
| 8 | Harfe gelen ek | "n'e", "b'ye", "x'in", "a'dan" | n harfi "en" okunur ("birden n'e"), öbür harfler Türkçe adıyla (be, ce, iks). |
| 9 | Üs işareti (′) | Kümede "A tümleyen", olasılıkta `P(A')` "P A tümleyen"; geometride ve fizikte "B üssü", "F üssü"; mantıkta "p değil"; fonksiyonda "f türev" | Metinde küme, tümleyen, eleman ya da olasılık sözcüğü varsa tümleyen okunur. Eskiden geometrideki `\|AB'\|` "mutlak değer A B tümleyen" okunuyordu. |
| 10 | Koşullu olasılık | `P(A \mid B)` → "P A, B verilmişken" | Seçenek: "B olduğunda A'nın olasılığı". |
| 11 | Ok (→) | Limit dışında `x \to 2` → "x ikiye giderken"; `a = 7 \to b = 8` → "a eşittir yedi ise b eşittir sekiz"; kimyada tepkime "CaCO üçten CaO ve CO iki oluşur" | Eskiden her ok ", sonra" okunuyordu. |
| 12 | Kimya | İyon "Ca iki artı", "Cl eksi"; hâl (g) "gaz", (k) "katı", (s) "sıvı"; çekirdek `{}^{14}_{6}\text{C}` "kütle numarası on dört, atom numarası altı olan C" | Eskiden "Ca üssü iki artı artı iki Cl üssü eksi". |
| 13 | Aralık | `[a,b)` → "a kapalı b açık aralığı", `[a, b]` → "a, b kapalı aralığı" | Köşeli parantez, sonsuz ya da ∈'den sonra gelen parantez aralık sayılır. `(3, 2)` gibi bir nokta "parantez içinde üç, iki" kalır. |
| 14 | Karmaşık sayı | `z = a + bi` → "z eşittir a artı b i"; `\overline{z}` → "z eşleniği" | "bi" bitişik okunursa ses "bi(r)" diyebilir; i ayrı okunur. |
| 15 | Benzerlik, eşlik, orantı | "ABE benzerdir DCE", "ABC eştir CDE", "F, … ile orantılıdır" | Eskiden üçü de hiç okunmuyordu ("ABE DCE"). |

## AYT formülleri

Senaryolarda henüz olmayan, AYT Matematik kampında sık geçecek formüller. "Önceki okunuş" eski okuyucunun ne diyeceğini gösterir.

### Limit

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\lim_{x\to 2}` | x ikiye giderken limit | x, sonra iki |
| `\lim_{x \to 2} (x^2 + 1) = 5` | x ikiye giderken limit parantez içinde x kare artı bir, eşittir beş | x, sonra iki parantez içinde x kare artı bir, eşittir beş |
| `\lim_{x \to 2} \frac{x^2 - 4}{x - 2} = 4` | x ikiye giderken limit kesrin payı x kare eksi dört, paydası x eksi iki, eşittir dört | x, sonra iki x kare eksi dört bölü x eksi iki eşittir dört |
| `\lim_{x \to 0^+} \frac{1}{x} = \infty` | x sıfıra sağdan giderken limit bir bölü x eşittir sonsuz | x, sonra sıfır üssü artı bir bölü x eşittir sonsuz |
| `\lim_{x \to 3^-} f(x)` | x üçe soldan giderken limit f x | x, sonra üç üssü eksi f x |
| `\lim_{x \to \infty} \frac{2x + 1}{x - 3} = 2` | x sonsuza giderken limit kesrin payı iki x artı bir, paydası x eksi üç, eşittir iki | x, sonra sonsuz iki x artı bir bölü x eksi üç eşittir iki |
| `\lim_{x \to -\infty} e^x = 0` | x eksi sonsuza giderken limit e üssü x eşittir sıfır | x, sonra eksi sonsuz e üssü x eşittir sıfır |
| `\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e` | n sonsuza giderken limit parantez içinde bir artı bir bölü n, üssü n eşittir e | n, sonra sonsuz parantez içinde bir artı bir bölü n, üssü n eşittir e |
| `\lim_{x \to 0} \frac{\sin x}{x} = 1` | x sıfıra giderken limit sinüs x bölü x eşittir bir | x, sonra sıfır x bölü x eşittir bir |
| `\lim\limits_{x \to a} f(x) = L` | x a'ya giderken limit f x eşittir L | x, sonra a f x eşittir L |
| `x \to 2^+` | x ikiye sağdan giderken | x, sonra iki üssü artı |

### Türev

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `f'(x)` | f türev x | f' parantez içinde x |
| `f''(x)` | f ikinci türev x | f'' parantez içinde x |
| `f'''(x)` | f üçüncü türev x | f''' parantez içinde x |
| `f'(2) = 3` | f türev iki eşittir üç | f' parantez içinde iki, eşittir üç |
| `y' = 2x` | y türev eşittir iki x | y' eşittir iki x |
| `f'(x) = 0` | f türev x eşittir sıfır | f' parantez içinde x, eşittir sıfır |
| `(f \cdot g)'(x) = f'(x)g(x) + f(x)g'(x)` | parantez içinde f çarpı g, türev x eşittir f türev x g x artı f x g türev x | parantez içinde f çarpı g, değili parantez içinde x, eşittir f' parantez içinde x, g x artı f x g' parantez içinde x |
| `(f \circ g)'(x) = f'(g(x)) \cdot g'(x)` | parantez içinde f bileşke g, türev x eşittir f türev g x çarpı g türev x | parantez içinde f bileşke g, değili parantez içinde x, eşittir f' parantez içinde g x, çarpı g' parantez içinde x |
| `\left(\frac{f}{g}\right)'(x) = \frac{f'(x)g(x) - f(x)g'(x)}{g^2(x)}` | parantez içinde f bölü g, türev x eşittir kesrin payı f türev x g x eksi f x g türev x, paydası g kare x | parantez içinde f bölü g, değili parantez içinde x, eşittir f' parantez içinde x, g x eksi f x g' parantez içinde x, bölü g kare parantez içinde x |
| `\frac{d}{dx}(x^n) = n x^{n-1}` | x'e göre türev parantez içinde x üssü n, eşittir n x üssü n eksi bir | d bölü dx parantez içinde x üssü n, eşittir n x üssü n eksi bir |
| `\frac{dy}{dx}` | y'nin x'e göre türevi | dy bölü dx |
| `(x^n)' = n \cdot x^{n-1}` | parantez içinde x üssü n, türev eşittir n çarpı x üssü n eksi bir | parantez içinde x üssü n, değili eşittir n çarpı x üssü n eksi bir |
| `(\sin x)' = \cos x` | parantez içinde sinüs x, türev eşittir kosinüs x | parantez içinde x, değili eşittir x |
| `f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}` | f türev a eşittir h sıfıra giderken limit kesrin payı f a artı h, eksi f a, paydası h | f' parantez içinde a, eşittir h, sonra sıfır f a artı h eksi f a bölü h |

### İntegral

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\int_0^1 x^2\,dx` | sıfırdan bire x kare dx'in integrali | sıfır üssü bir x kare,dx |
| `\int_0^1 x^2\,dx = \frac{1}{3}` | sıfırdan bire x kare dx'in integrali eşittir bir bölü üç | sıfır üssü bir x kare,dx eşittir bir bölü üç |
| `\int x^n\,dx = \frac{x^{n+1}}{n+1} + c` | x üssü n dx'in integrali eşittir kesrin payı x üssü n artı bir, paydası n artı bir, artı c | x üssü n,dx eşittir x üssü n artı bir bölü n artı bir artı c |
| `\int (2x + 1)\,dx = x^2 + x + c` | parantez içinde iki x artı bir, dx'in integrali eşittir x kare artı x artı c | parantez içinde iki x artı bir,dx eşittir x kare artı x artı c |
| `\int_a^b f(x)\,dx = F(b) - F(a)` | a'dan b'ye f x dx'in integrali eşittir F b eksi F a | a üssü b f x,dx eşittir F parantez içinde b, eksi F parantez içinde a |
| `\int_{-1}^{2} 3x^2\,dx = 9` | eksi birden ikiye üç x kare dx'in integrali eşittir dokuz | eksi bir kare üç x kare,dx eşittir dokuz |
| `\int_0^{\pi} \sin x\,dx = 2` | sıfırdan pi'ye sinüs x dx'in integrali eşittir iki | sıfır üssü pi x,dx eşittir iki |
| `\int \frac{1}{x}\,dx = \ln\|x\| + c` | bir bölü x dx'in integrali eşittir l n mutlak değer x, artı c | bir bölü x,dx eşittir mutlak değer x, artı c |
| `\int e^x\,dx = e^x + c` | e üssü x dx'in integrali eşittir e üssü x artı c | e üssü x,dx eşittir e üssü x artı c |
| `\int_1^e \frac{1}{t}\,dt = 1` | birden e'ye bir bölü t dt'nin integrali eşittir bir | bir üssü e bir bölü t,dt eşittir bir |

### Toplam ve diziler

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\sum_{k=1}^{n}` | k eşittir birden n'e toplam | k eşittir bir üssü n |
| `\sum_{k=1}^{n} k = \frac{n(n+1)}{2}` | k eşittir birden n'e toplam k eşittir n parantez içinde n artı bir, bölü iki | k eşittir bir üssü n k eşittir n parantez içinde n artı bir, bölü iki |
| `\sum_{k=1}^{10} (2k - 1) = 100` | k eşittir birden ona toplam parantez içinde iki k eksi bir, eşittir yüz | k eşittir bir üssü on parantez içinde iki k eksi bir, eşittir yüz |
| `\sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}` | i eşittir birden n'e toplam i kare eşittir n parantez içinde n artı bir, parantez içinde iki n artı bir, bölü altı | i eşittir bir üssü n i kare eşittir n parantez içinde n artı bir, parantez içinde iki n artı bir, bölü altı |
| `\prod_{k=1}^{n} k = n!` | k eşittir birden n'e çarpım k eşittir n faktöriyel | k eşittir bir üssü n k eşittir n faktöriyel |
| `a_n` | a n | aynı |
| `a_n = a_1 + (n - 1)d` | a n eşittir a bir artı parantez içinde n eksi bir, d | aynı |
| `a_{n+1} = a_n + 3` | a n artı bir, eşittir a n artı üç | a n artı bir eşittir a n artı üç |
| `a_n = a_1 \cdot r^{n-1}` | a n eşittir a bir çarpı r üssü n eksi bir | aynı |
| `S_n = \frac{n}{2}(a_1 + a_n)` | S n eşittir n bölü iki parantez içinde a bir artı a n | aynı |
| `a_{10} = 21` | a on eşittir yirmi bir | aynı |

### Logaritma ve üstel

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\log_2 8` | log iki tabanında sekiz | iki sekiz |
| `\log_2 8 = 3` | log iki tabanında sekiz eşittir üç | iki sekiz eşittir üç |
| `\ln x` | l n x | x |
| `\log x + \log y = \log(xy)` | log x artı log y eşittir log xy | x artı y eşittir parantez içinde xy |
| `\log_a b = \frac{\log b}{\log a}` | log a tabanında b eşittir log b bölü log a | a b eşittir b bölü a |
| `\log_3(x - 1) = 2` | log üç tabanında x eksi bir, eşittir iki | üç parantez içinde x eksi bir, eşittir iki |
| `\ln e = 1` | l n e eşittir bir | e eşittir bir |
| `e^{\ln x} = x` | e üssü l n x eşittir x | e üssü x eşittir x |
| `2^{x+1} = 8` | iki üssü x artı bir, eşittir sekiz | iki üssü x artı bir eşittir sekiz |
| `\log_{\frac{1}{2}} 4 = -2` | log bir bölü iki tabanında dört eşittir eksi iki | bir bölü iki dört eşittir eksi iki |
| `\log_a(b \cdot c) = \log_a b + \log_a c` | log a tabanında b çarpı c eşittir log a tabanında b artı log a tabanında c | a parantez içinde b çarpı c, eşittir a b artı a c |

### Trigonometri

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\sin^2 x` | sinüs kare x | kare x |
| `\sin^2 x + \cos^2 x = 1` | sinüs kare x artı kosinüs kare x eşittir bir | kare x artı kare x eşittir bir |
| `\tan^2 x + 1 = \frac{1}{\cos^2 x}` | tanjant kare x artı bir eşittir bir bölü kosinüs kare x | kare x artı bir eşittir bir bölü kare x |
| `\cot x = \frac{\cos x}{\sin x}` | kotanjant x eşittir kosinüs x bölü sinüs x | x eşittir x bölü x |
| `\sin 2x = 2\sin x\cos x` | sinüs iki x eşittir iki sinüs x kosinüs x | iki x eşittir iki x x |
| `\cos(a + b) = \cos a \cos b - \sin a \sin b` | kosinüs a artı b, eşittir kosinüs a kosinüs b eksi sinüs a sinüs b | parantez içinde a artı b, eşittir a b eksi a b |
| `\arcsin\left(\frac{1}{2}\right) = \frac{\pi}{6}` | arksinüs bir bölü iki, eşittir pi bölü altı | parantez içinde bir bölü iki, eşittir pi bölü altı |
| `\sin^{-1} x` | arksinüs x | üssü eksi bir x |
| `\tan\left(\frac{\pi}{4}\right) = 1` | tanjant pi bölü dört, eşittir bir | parantez içinde pi bölü dört, eşittir bir |
| `\sin(-x) = -\sin x` | sinüs eksi x eşittir eksi sinüs x | parantez içinde eksi x, eşittir eksi x |
| `\sin 30° = \frac{1}{2}` | sinüs otuz derece eşittir bir bölü iki | otuz derece eşittir bir bölü iki |

### Aralıklar

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `[a,b)` | a kapalı b açık aralığı | [a,b |
| `[a, b]` | a, b kapalı aralığı | [a, b] |
| `(a, b]` | a açık b kapalı aralığı | parantez içinde a, b] |
| `x \in (2, 5)` | x elemanıdır iki, beş açık aralığı | x elemanıdır parantez içinde iki, beş |
| `x \in [-1, 3)` | x elemanıdır eksi bir kapalı üç açık aralığı | x elemanıdır [ eksi bir, üç |
| `(-\infty, 2]` | eksi sonsuz açık iki kapalı aralığı | parantez içinde eksi sonsuz, iki] |
| `[0, \infty)` | sıfır kapalı sonsuz açık aralığı | [sıfır, sonsuz |

### Karmaşık sayılar

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `i^2 = -1` | i kare eşittir eksi bir | aynı |
| `z = 3 + 4i` | z eşittir üç artı dört i | aynı |
| `z = a + bi` | z eşittir a artı b i | z eşittir a artı bi |
| `\|z\| = \sqrt{a^2 + b^2}` | mutlak değer z, eşittir karekök içinde a kare artı b kare | mutlak değer z, eşittir karekök a kare artı b kare |
| `\overline{z} = a - bi` | z eşleniği eşittir a eksi b i | z eşittir a eksi bi |
| `\overline{4a73b}` (rakamları harfle verilmiş sayı) | dört a yedi üç b | 4a73b (ses "dört a yetmiş üç b" diyebiliyordu) |
| `i^{4n+1} = i` | i üssü dört n artı bir, eşittir i | i üssü dört n artı bir eşittir i |
| `\text{Re}(z) = 3` | z'nin reel kısmı eşittir üç | Re parantez içinde z, eşittir üç |
| `(2 + i)(2 - i) = 5` | parantez içinde iki artı i, parantez içinde iki eksi i, eşittir beş | aynı |

### Kesir, kök, iç içe

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\frac{\sqrt{x}}{x^2+1}` | kesrin payı karekök x, paydası x kare artı bir | karekök x bölü x kare artı bir |
| `\frac{x+1}{x-1}` | kesrin payı x artı bir, paydası x eksi bir | x artı bir bölü x eksi bir |
| `\frac{1}{\sqrt{x} + 1}` | kesrin payı bir, paydası karekök x artı bir | bir bölü karekök x artı bir |
| `\sqrt{\frac{a}{b}}` | karekök içinde a bölü b | karekök a bölü b |
| `\sqrt[3]{x^2 + 1}` | küpkök içinde x kare artı bir | küpkök x kare artı bir |
| `\sqrt[n]{a}` | n'inci dereceden kök a | n. dereceden kök a |
| `\frac{\frac{1}{2}}{3}` | kesrin payı bir bölü iki, paydası üç | bir bölü iki bölü üç |
| `\frac{1}{2(x + 1)}` | kesrin payı bir, paydası iki parantez içinde x artı bir | bir bölü iki parantez içinde x artı bir |
| `x_{1,2} = \frac{-b \pm \sqrt{\Delta}}{2a}` | x bir, iki eşittir kesrin payı eksi b artı eksi karekök delta, paydası iki a | x bir virgül iki eşittir eksi b artı eksi karekök delta bölü iki a |

### Fonksiyon, polinom, olasılık

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `f: \mathbb{R} \to \mathbb{R}` | f, reel sayılardan reel sayılara | f: reel sayılar, sonra reel sayılar |
| `f(x) = 2x - 3m` | f x eşittir iki x eksi üç m | f x eşittir iki x eksi üç metre |
| `f^{-1}(x) = \frac{x + 3}{2}` | f tersi x eşittir kesrin payı x artı üç, paydası iki | f tersi x eşittir x artı üç bölü iki |
| `P(2m - 1) = 0` | P iki m eksi bir, eşittir sıfır | P iki metre eksi bir eşittir sıfır |
| `x^2 - (m + 1)x + 2m = 0` | x kare eksi parantez içinde m artı bir, x artı iki m eşittir sıfır | x kare eksi parantez içinde m artı bir, x artı iki metre eşittir sıfır |
| `\binom{n}{r}` | C n r | aynı |
| `P(n, r) = \frac{n!}{(n - r)!}` | P n, r eşittir n faktöriyel bölü parantez içinde n eksi r, faktöriyel | aynı |
| `P(A') = 1 - P(A)` | P A tümleyen eşittir bir eksi P A | aynı |
| `P(A \cap B) = P(A) \cdot P(B)` | P A kesişim B eşittir P A çarpı P B | aynı |
| `P(A \mid B) = \frac{P(A \cap B)}{P(B)}` | P A, B verilmişken, eşittir kesrin payı P A kesişim B, paydası P B | P A öyle ki B eşittir P A kesişim B bölü P B |
| `\mathbb{Z}^+` | pozitif tam sayılar | tam sayılar üssü artı |
| `\mathbb{R}^-` | negatif reel sayılar | reel sayılar üssü eksi |

### Geometri ve vektör

| Formül | Okunuş | Önceki okunuş |
|---|---|---|
| `\triangle ABC` | A B C üçgeni | üçgen ABC |
| `\angle ABC` | A B C açısı | ABC |
| `m(\widehat{ABC}) = 90°` | A B C açısı eşittir doksan derece | aynı |
| `\vec{AB}` | A B vektörü | a be vektörü |
| `\|\vec{u}\| = 5` | u vektörünün uzunluğu eşittir beş | mutlak değer u vektörü, eşittir beş |
| `\|AB\| = 5` | A B uzunluğu eşittir beş | aynı |
| `[AB] \perp [CD]` | A B diktir C D | [a be] diktir [CD] |
| `ABC \sim DEF` | ABC benzerdir DEF | ABC DEF |


## Mevcut senaryolardan örnekler, konu konu

Durum: **Aynı** (okunuş değişmedi) ya da **Değişti** (eski okunuş altında).

### Temel işlemler ve bağıntılar

| Formül | Okunuş | Durum |
|---|---|---|
| `-(2 \cdot 2 \cdot 2 \cdot 2)` | eksi parantez içinde iki çarpı iki çarpı iki çarpı iki | Aynı |
| `-1 \leq x < 5` | eksi bir küçük eşit x küçüktür beş | Aynı |
| `= \frac{1500}{2000} \cdot 100 = \%75` | eşittir bin beş yüz bölü iki bin çarpı yüz eşittir yüzde yetmiş beş | Aynı |
| `a \ast b = \frac{a \cdot b}{2}` | a yıldız b eşittir a çarpı b bölü iki | Aynı |
| `1{,}2a \cdot 0{,}8b = 0{,}96\,ab` | bir virgül iki a çarpı sıfır virgül sekiz b eşittir sıfır virgül doksan altı ab | Değişti; önce: bir virgül iki a çarpı sıfır virgül sekiz b eşittir sıfır virgül doksan altı,ab |
| `2:1:2` | iki: bir: iki | Değişti; önce: iki:bir:iki |
| `100\,000` | yüz bin | Değişti; önce: yüz virgül sıfır sıfır sıfır |

### Kesirler ve devirli sayılar

| Formül | Okunuş | Durum |
|---|---|---|
| `-\frac{1}{3}` | eksi bir bölü üç | Aynı |
| `\frac{x}{x + 3}` | kesrin payı x, paydası x artı üç | Değişti; önce: x bölü x artı üç |
| `\frac{a + c}{2}` | kesrin payı a artı c, paydası iki | Değişti; önce: a artı c bölü iki |
| `\frac{9! + 8!}{8!} = \frac{8!(9 + 1)}{8!} = 10` | kesrin payı dokuz faktöriyel artı sekiz faktöriyel, paydası sekiz faktöriyel, eşittir sekiz faktöriyel parantez içinde dokuz artı bir, bölü sekiz faktöriyel eşittir on | Değişti; önce: dokuz faktöriyel artı sekiz faktöriyel bölü sekiz faktöriyel eşittir sekiz faktöriyel parantez içinde dokuz artı bir, bölü sekiz faktöriyel eşittir on |
| `\frac{1}{3} = 0{,}\overline{3}` | bir bölü üç eşittir sıfır virgül üç devirli | Aynı |
| `\;1{,}2\overline{5} = \frac{125 - 12}{90} = \frac{113}{90}` | bir virgül yirmi beş devirli eşittir kesrin payı yüz yirmi beş eksi on iki, paydası doksan, eşittir yüz on üç bölü doksan | Değişti; önce: bir virgül yirmi beş devirli eşittir yüz yirmi beş eksi on iki bölü doksan eşittir yüz on üç bölü doksan |

### Üs ve kök

| Formül | Okunuş | Durum |
|---|---|---|
| `(a^m)^n = a^{mn}` | parantez içinde a üssü m, üssü n eşittir a üssü mn | Aynı |
| `4^{x+1} = 8^{x-1}` | dört üssü x artı bir, eşittir sekiz üssü x eksi bir | Değişti; önce: dört üssü x artı bir eşittir sekiz üssü x eksi bir |
| `\sqrt[3]{-8} = -2` | küpkök eksi sekiz eşittir eksi iki | Aynı |
| `\sqrt{72} = \sqrt{36 \cdot 2} = 6\sqrt{2}` | karekök yetmiş iki eşittir karekök içinde otuz altı çarpı iki, eşittir altı karekök iki | Değişti; önce: karekök yetmiş iki eşittir karekök otuz altı çarpı iki eşittir altı karekök iki |
| `\sqrt[n]{a^m} = a^{\frac{m}{n}}` | n'inci dereceden kök a üssü m eşittir a üssü m bölü n | Değişti; önce: n. dereceden kök a üssü m eşittir a üssü m bölü n |
| `\sqrt{a} + \sqrt{b} \neq \sqrt{a + b}` | karekök a artı karekök b eşit değildir karekök içinde a artı b | Değişti; önce: karekök a artı karekök b eşit değildir karekök a artı b |

### Fonksiyon ve polinom

| Formül | Okunuş | Durum |
|---|---|---|
| `f(x) = 2x + 3` | f x eşittir iki x artı üç | Aynı |
| `f(2x - 1) = 4x + 3` | f iki x eksi bir, eşittir dört x artı üç | Değişti; önce: f iki x eksi bir eşittir dört x artı üç |
| `(f \circ g)(x) = f(g(x))` | parantez içinde f bileşke g, x eşittir f g x | Değişti; önce: parantez içinde f bileşke g, parantez içinde x, eşittir f parantez içinde g x |
| `(f \cdot g)(x) = f(x) \cdot g(x)` | parantez içinde f çarpı g, x eşittir f x çarpı g x | Değişti; önce: parantez içinde f çarpı g, parantez içinde x, eşittir f x çarpı g x |
| `P(x + 1) = x^2 + 3x + 2` | P x artı bir, eşittir x kare artı üç x artı iki | Değişti; önce: P x artı bir eşittir x kare artı üç x artı iki |
| `P\left(-\frac{b}{a}\right)` | P eksi b bölü a | Değişti; önce: P parantez içinde eksi b bölü a |
| `\text{der}[P \cdot Q] = \text{der}[P] + \text{der}[Q]` | P çarpı Q'nun derecesi eşittir P'nin derecesi artı Q'nun derecesi | Değişti; önce: der [P çarpı Q] eşittir der [P] artı der [Q] |

### Kümeler, mantık, olasılık

| Formül | Okunuş | Durum |
|---|---|---|
| `A = \{x \mid x \text{ asal sayı ve } x < 20\}` | A eşittir x öyle ki x asal sayı ve x küçüktür yirmi | Aynı |
| `\mathbb{Q} \cup \mathbb{Q}' = \mathbb{R}` | rasyonel sayılar birleşim irrasyonel sayılar eşittir reel sayılar | Değişti; önce: rasyonel sayılar birleşim rasyonel sayılar ' eşittir reel sayılar |
| `(p \vee q)' \equiv p' \wedge q'` | parantez içinde p veya q, değili denktir p değil ve q değil | Aynı |
| `p \Rightarrow q \equiv q' \Rightarrow p'` | p ise q denktir q değil ise p değil | Aynı |
| `(\forall x, p(x))' \equiv \exists x, p'(x)` | parantez içinde her x, p parantez içinde x, değili denktir en az bir x, p değil parantez içinde x | Aynı |
| `P(A') = 1 - P(A)` | P A tümleyen eşittir bir eksi P A | Aynı |
| `\binom{8}{3} = 56` | C sekiz üç eşittir elli altı | Aynı |
| `\binom{7}{3} = \frac{7 \cdot 6 \cdot 5}{3 \cdot 2 \cdot 1} = 35` | C yedi üç eşittir kesrin payı yedi çarpı altı çarpı beş, paydası üç çarpı iki çarpı bir, eşittir otuz beş | Değişti; önce: C yedi üç eşittir yedi çarpı altı çarpı beş bölü üç çarpı iki çarpı bir eşittir otuz beş |

### Sayılar ve modüler aritmetik

| Formül | Okunuş | Durum |
|---|---|---|
| `7^2 \to 9` | yedi kare ise dokuz | Değişti; önce: yedi kare, sonra dokuz |
| `a = 7 \to b = 8` | a eşittir yedi ise b eşittir sekiz | Değişti; önce: a eşittir yedi, sonra b eşittir sekiz |
| `\overline{AB} + \overline{BA}` | A B artı B A | Aynı |
| `2,8,1` | iki, sekiz, bir | Değişti; önce: iki virgül sekiz,bir |

### Geometri

| Formül | Okunuş | Durum |
|---|---|---|
| `m(\widehat{ABC}) = 35°` | A B C açısı eşittir otuz beş derece | Aynı |
| `\|AB\| = \sqrt{16 + 9} = 5` | A B uzunluğu eşittir karekök içinde on altı artı dokuz, eşittir beş | Değişti; önce: A B uzunluğu eşittir karekök on altı artı dokuz eşittir beş |
| `[AB] \perp [BD]` | A B diktir B D | Değişti; önce: [a be] diktir [BD] |
| `[AB` | A B ışını | Değişti; önce: [a be |
| `\|AB'\| = \sqrt{36 + 64} = 10` | A B üssü uzunluğu eşittir karekök içinde otuz altı artı altmış dört, eşittir on | Değişti; önce: mutlak değer A B tümleyen, eşittir karekök otuz altı artı altmış dört eşittir on |
| `ABE \sim DCE` | ABE benzerdir DCE | Değişti; önce: ABE DCE |
| `A(ABC) = 36` | A parantez içinde ABC, eşittir otuz altı | Aynı |
| `\frac{\|ax_0 + by_0 + c\|}{\sqrt{a^2 + b^2}}` | mutlak değer ax sıfır artı by sıfır artı c, bölü karekök içinde a kare artı b kare | Değişti; önce: mutlak değer ax sıfır artı by sıfır artı c, bölü karekök a kare artı b kare |
| `\pi r^2 \cdot \frac{\alpha}{360°}` | pi r kare çarpı alfa bölü üç yüz altmış derece | Değişti; önce: pi r kare çarpı bölü üç yüz altmış derece |

### Trigonometri

| Formül | Okunuş | Durum |
|---|---|---|
| `\sin 30° = \frac{1}{2}` | sinüs otuz derece eşittir bir bölü iki | Değişti; önce: otuz derece eşittir bir bölü iki |
| `\sin \alpha = \frac{\text{karşı}}{\text{hipotenüs}}` | sinüs alfa eşittir karşı bölü hipotenüs | Değişti; önce: eşittir karşı bölü hipotenüs |
| `\tan(\widehat{ADC})` | tanjant A D C açısı | Değişti; önce: parantez içinde A D C açısı |
| `A = \frac{1}{2} b c \sin \alpha` | A eşittir bir bölü iki b c sinüs alfa | Değişti; önce: A eşittir bir bölü iki b c |

### Fizik ve kimya gösterimleri

| Formül | Okunuş | Durum |
|---|---|---|
| `F_{net} = m \cdot a` | F net eşittir m çarpı a | Aynı |
| `E_K = \frac{1}{2} m v^2` | E K eşittir bir bölü iki m v kare | Değişti; önce: E K eşittir bir bölü iki metre v kare |
| `v = \lambda f` | v eşittir lamda f | Değişti; önce: v eşittir f |
| `F \propto \frac{q_1 q_2}{d^2}` | F, q bir q iki bölü d kare ile orantılıdır | Değişti; önce: F q bir q iki bölü d kare |
| `\text{CaCO}_3(k) \rightarrow \text{CaO}(k) + \text{CO}_2(g)` | CaCO üç katıdan CaO katı ve CO iki gaz oluşur | Değişti; önce: CaCO üç parantez içinde k, sonra CaO parantez içinde k, artı CO iki parantez içinde g |
| `\text{Ca}^{2+}` | Ca iki artı | Değişti; önce: Ca üssü iki artı |
| `{}^{23}_{11}\text{Na}^+` | kütle numarası yirmi üç, atom numarası on bir olan Na artı | Değişti; önce: üssü yirmi üç on bir Na üssü artı |
| `d_{yağ} = 800 \text{ kg/m}^3` | d yağ eşittir sekiz yüz kilogram bölü m küp | Aynı |


## Değişen 435 okunuş: özet

| Değişiklik | Formül sayısı | Örnek (önce → şimdi) |
|---|---|---|
| Yalnız duraklama eklendi (bileşik üs, alt indis, fonksiyon girdisinden sonra) | 7 | `4^{x+1} = 8^{x-1}`: dört üssü x artı bir eşittir sekiz üssü x eksi bir → dört üssü x artı bir, eşittir sekiz üssü x eksi bir |
| Karmaşık kesir: "kesrin payı …, paydası …" | 121 | `\frac{a}{a+1}`: a bölü a artı bir → kesrin payı a, paydası a artı bir |
| Bileşik kök: "karekök içinde …" | 58 | `\sqrt{a^2 + b^2}`: karekök a kare artı b kare → karekök içinde a kare artı b kare |
| Okunmayan semboller artık okunuyor: Yunan harfleri, sinüs-kosinüs-tanjant, ∝, ∼, ≅, ℓ | 87 | `\Phi`: *(hiç okunmuyordu)* → fi |
| Doğru parçası ve ışın: [AB] → "A B", [AB → "A B ışını" | 50 | `[AB`: [a be → A B ışını |
| Aralıklar: "a kapalı b açık aralığı" | 10 | `(2, 7]`: parantez içinde iki, yedi] → iki açık yedi kapalı aralığı |
| Binlik boşluk: 12\,000 → "on iki bin" (önce "on iki virgül sıfır sıfır sıfır") | 19 | `10\,000`: on virgül sıfır sıfır sıfır → on bin |
| Cebirdeki harf birim sanılmıyor: 2m → "iki m" (önce "iki metre") | 11 | `2m`: iki metre → iki m |
| Kimya: iyon yükü, tepkime oku, hâl, çekirdek gösterimi | 29 | `\text{F}^-`: F üssü eksi → F eksi |
| Üs işareti (′): geometride "üssü", kümede "tümleyen", ℚ′ "irrasyonel sayılar" | 12 | `A'`: A tümleyen → A üssü |
| Fonksiyon değeri ve bileşke: "f g x", "parantez içinde f bileşke g, 2" | 13 | `R(x) = P(P(x))`: R x eşittir P parantez içinde P x → R x eşittir P P x |
| Ok (→): ", sonra" yerine "ise" | 11 | `7^1 \to 7`: yedi üssü bir, sonra yedi → yedi üssü bir ise yedi |
| Diğer düzeltmeler | 7 | `2,8,1`: iki virgül sekiz,bir → iki, sekiz, bir |

## Ek: değişen okunuşların tamamı

Her formül, geçtiği konu kodlarıyla. Bunlar testteki altın tablonun (`tests/Fixtures/MathSpeechGolden.json`) değişen satırlarıdır.

<details><summary>Yalnız duraklama eklendi (bileşik üs, alt indis, fonksiyon girdisinden sonra) (7)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `(a - 2)x^3 + x^{b - 1} - 4x + 7 = 0` | parantez içinde a eksi iki, x küp artı x üssü b eksi bir eksi dört x artı yedi eşittir sıfır | parantez içinde a eksi iki, x küp artı x üssü b eksi bir, eksi dört x artı yedi eşittir sıfır | MAT_IKINCI_DER |
| `(x - 2)^{x + 3} = 1` | parantez içinde x eksi iki, üssü x artı üç eşittir bir | parantez içinde x eksi iki, üssü x artı üç, eşittir bir | MAT_USLU |
| `4^{x+1} = (2^2)^{x+1} = 2^{2x+2}` | dört üssü x artı bir eşittir parantez içinde iki kare, üssü x artı bir eşittir iki üssü iki x artı iki | dört üssü x artı bir, eşittir parantez içinde iki kare, üssü x artı bir, eşittir iki üssü iki x artı iki | MAT_USLU |
| `4^{x+1} = 8^{x-1}` | dört üssü x artı bir eşittir sekiz üssü x eksi bir | dört üssü x artı bir, eşittir sekiz üssü x eksi bir | MAT_USLU |
| `8^{x-1} = (2^3)^{x-1} = 2^{3x-3}` | sekiz üssü x eksi bir eşittir parantez içinde iki küp, üssü x eksi bir eşittir iki üssü üç x eksi üç | sekiz üssü x eksi bir, eşittir parantez içinde iki küp, üssü x eksi bir, eşittir iki üssü üç x eksi üç | MAT_USLU |
| `f(2x - 1) = 4x + 3` | f iki x eksi bir eşittir dört x artı üç | f iki x eksi bir, eşittir dört x artı üç | MAT_FONK |
| `P(x + 1) = x^2 + 3x + 2` | P x artı bir eşittir x kare artı üç x artı iki | P x artı bir, eşittir x kare artı üç x artı iki | MAT_POLINOM |

</details>

<details><summary>Karmaşık kesir: "kesrin payı …, paydası …" (121)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `-\frac{x - 2}{4} = \frac{-x + 2}{4}` | eksi x eksi iki bölü dört eşittir eksi x artı iki bölü dört | eksi kesrin payı x eksi iki, paydası dört, eşittir kesrin payı eksi x artı iki, paydası dört | MAT_DENKLEM |
| `\;1{,}2\overline{5} = \frac{125 - 12}{90} = \frac{113}{90}` | bir virgül yirmi beş devirli eşittir yüz yirmi beş eksi on iki bölü doksan eşittir yüz on üç bölü doksan | bir virgül yirmi beş devirli eşittir kesrin payı yüz yirmi beş eksi on iki, paydası doksan, eşittir yüz on üç bölü doksan | MAT_RASYONEL |
| `\binom{7}{3} = \frac{7 \cdot 6 \cdot 5}{3 \cdot 2 \cdot 1} = 35` | C yedi üç eşittir yedi çarpı altı çarpı beş bölü üç çarpı iki çarpı bir eşittir otuz beş | C yedi üç eşittir kesrin payı yedi çarpı altı çarpı beş, paydası üç çarpı iki çarpı bir, eşittir otuz beş | MAT_PER_KOM |
| `\binom{8}{3} = \frac{8 \cdot 7 \cdot 6}{3 \cdot 2 \cdot 1} = 56` | C sekiz üç eşittir sekiz çarpı yedi çarpı altı bölü üç çarpı iki çarpı bir eşittir elli altı | C sekiz üç eşittir kesrin payı sekiz çarpı yedi çarpı altı, paydası üç çarpı iki çarpı bir, eşittir elli altı | MAT_PER_KOM |
| `\binom{n}{r} = \frac{n!}{r! \cdot (n - r)!}` | C n r eşittir n faktöriyel bölü r faktöriyel çarpı parantez içinde n eksi r, faktöriyel | C n r eşittir kesrin payı n faktöriyel, paydası r faktöriyel çarpı parantez içinde n eksi r, faktöriyel | MAT_PER_KOM |
| `\frac{-3 + y}{2} = 1` | eksi üç artı y bölü iki eşittir bir | kesrin payı eksi üç artı y, paydası iki, eşittir bir | GEO_ANALITIK |
| `\frac{-x}{x + 3}` | eksi x bölü x artı üç | kesrin payı eksi x, paydası x artı üç | MAT_CARPAN |
| `\frac{\sqrt{5} + 1}{4}` | karekök beş artı bir bölü dört | kesrin payı karekök beş artı bir, paydası dört | MAT_KOKLU |
| `\frac{\text{ilk} + \text{son}}{2} \cdot` | ilk artı son bölü iki çarpı | kesrin payı ilk artı son, paydası iki, çarpı | MAT_TEMEL |
| `\frac{\text{iş}_1}{\text{işçi}_1 \cdot \text{gün}_1} = \frac{\text{iş}_2}{\text{işçi}_2 \cdot \text{gün}_2}` | iş bir bölü işçi bir çarpı gün bir eşittir iş iki bölü işçi iki çarpı gün iki | kesrin payı iş bir, paydası işçi bir çarpı gün bir, eşittir kesrin payı iş iki, paydası işçi iki çarpı gün iki | MAT_ORAN |
| `\frac{\text{son} - \text{ilk}}{\text{artış}} + 1` | son eksi ilk bölü artış artı bir | kesrin payı son eksi ilk, paydası artış, artı bir | MAT_TEMEL |
| `\frac{\|b - c\|}{2} < V_a < \frac{b + c}{2}` | mutlak değer b eksi c, bölü iki küçüktür V a küçüktür b artı c bölü iki | mutlak değer b eksi c, bölü iki küçüktür V a küçüktür kesrin payı b artı c, paydası iki | GEO_ACI_KENAR |
| `\frac{\|DE\|}{\|BC\|} = \frac{m}{m + n}` | D E uzunluğu bölü B C uzunluğu eşittir m bölü m artı n | D E uzunluğu bölü B C uzunluğu eşittir kesrin payı m, paydası m artı n | GEO_ESLIK |
| `\frac{1}{f(x)}` | bir bölü f x | kesrin payı bir, paydası f x | MAT_FONK |
| `\frac{1}{x + 3}` | bir bölü x artı üç | kesrin payı bir, paydası x artı üç | MAT_CARPAN |
| `\frac{1}{x_1} + \frac{1}{x_2} = \frac{x_1 + x_2}{x_1 x_2} = \frac{3}{3/2} = 2` | bir bölü x bir artı bir bölü x iki eşittir x bir artı x iki bölü x bir x iki eşittir üç bölü üç bölü iki eşittir iki | bir bölü x bir artı bir bölü x iki eşittir kesrin payı x bir artı x iki, paydası x bir x iki, eşittir kesrin payı üç, paydası üç bölü iki, eşittir iki | MAT_IKINCI_DER |
| `\frac{1}{x_1} + \frac{1}{x_2} = \frac{x_1 + x_2}{x_1 x_2}` | bir bölü x bir artı bir bölü x iki eşittir x bir artı x iki bölü x bir x iki | bir bölü x bir artı bir bölü x iki eşittir kesrin payı x bir artı x iki, paydası x bir x iki | MAT_IKINCI_DER |
| `\frac{10 - 6}{2} < V_a < \frac{10 + 6}{2}` | on eksi altı bölü iki küçüktür V a küçüktür on artı altı bölü iki | kesrin payı on eksi altı, paydası iki, küçüktür V a küçüktür kesrin payı on artı altı, paydası iki | GEO_ACI_KENAR |
| `\frac{12 + 14}{2} = 13` | on iki artı on dört bölü iki eşittir on üç | kesrin payı on iki artı on dört, paydası iki, eşittir on üç | MAT_VERI_IST |
| `\frac{16 - 6}{2}` | on altı eksi altı bölü iki | kesrin payı on altı eksi altı, paydası iki | GEO_YAMUK |
| `\frac{18 + 10}{2} = 14` | on sekiz artı on bölü iki eşittir on dört | kesrin payı on sekiz artı on, paydası iki, eşittir on dört | GEO_YAMUK |
| `\frac{180° - 100°}{2} = 40°` | yüz seksen derece eksi yüz derece bölü iki eşittir kırk derece | kesrin payı yüz seksen derece eksi yüz derece, paydası iki, eşittir kırk derece | GEO_UCGEN_ACI |
| `\frac{2 + 3 - 5}{3 + 4 - 6} = \frac{0}{1} = 0` | iki artı üç eksi beş bölü üç artı dört eksi altı eşittir sıfır bölü bir eşittir sıfır | kesrin payı iki artı üç eksi beş, paydası üç artı dört eksi altı, eşittir sıfır bölü bir eşittir sıfır | MAT_RASYONEL |
| `\frac{2 + x}{2} = 5` | iki artı x bölü iki eşittir beş | kesrin payı iki artı x, paydası iki, eşittir beş | GEO_ANALITIK |
| `\frac{2}{\sqrt{3} + 1}` | iki bölü karekök üç artı bir | kesrin payı iki, paydası karekök üç artı bir | MAT_KOKLU |
| `\frac{2^{-3} + 2^{-2}}{2^{-4}}` | iki üssü eksi üç artı iki üssü eksi iki bölü iki üssü eksi dört | kesrin payı iki üssü eksi üç artı iki üssü eksi iki, paydası iki üssü eksi dört | MAT_USLU |
| `\frac{20 + a + b}{5} = a \Rightarrow b = 4a - 20` | yirmi artı a artı b bölü beş eşittir a ise b eşittir dört a eksi yirmi | kesrin payı yirmi artı a artı b, paydası beş, eşittir a ise b eşittir dört a eksi yirmi | MAT_VERI_IST |
| `\frac{2a + 1}{a - 3} = 5` | iki a artı bir bölü a eksi üç eşittir beş | kesrin payı iki a artı bir, paydası a eksi üç, eşittir beş | MAT_FONK |
| `\frac{3}{6 \cdot 8} = \frac{3}{48} = \frac{1}{16}` | üç bölü altı çarpı sekiz eşittir üç bölü kırk sekiz eşittir bir bölü on altı | kesrin payı üç, paydası altı çarpı sekiz, eşittir üç bölü kırk sekiz eşittir bir bölü on altı | MAT_ORAN |
| `\frac{3}{x - 1} = \frac{2}{x + 1}` | üç bölü x eksi bir eşittir iki bölü x artı bir | kesrin payı üç, paydası x eksi bir, eşittir kesrin payı iki, paydası x artı bir | MAT_DENKLEM |
| `\frac{4}{\sqrt{5} - 1}` | dört bölü karekök beş eksi bir | kesrin payı dört, paydası karekök beş eksi bir | MAT_KOKLU |
| `\frac{40 \cdot \frac{2h}{5}}{2} = 8h = 160` | kırk çarpı iki h bölü beş bölü iki eşittir sekiz h eşittir yüz altmış | kesrin payı kırk çarpı iki h bölü beş, paydası iki, eşittir sekiz h eşittir yüz altmış | GEO_ESLIK |
| `\frac{5!}{2! \cdot 2!} = \frac{120}{4} = 30` | beş faktöriyel bölü iki faktöriyel çarpı iki faktöriyel eşittir yüz yirmi bölü dört eşittir otuz | kesrin payı beş faktöriyel, paydası iki faktöriyel çarpı iki faktöriyel, eşittir yüz yirmi bölü dört eşittir otuz | MAT_PER_KOM |
| `\frac{6}{30 + s} = \frac{15}{100} \Rightarrow 30 + s = 40` | altı bölü otuz artı s eşittir on beş bölü yüz ise otuz artı s eşittir kırk | kesrin payı altı, paydası otuz artı s, eşittir on beş bölü yüz ise otuz artı s eşittir kırk | MAT_PROBLEM |
| `\frac{7 - a}{4 - 1} = 1` | yedi eksi a bölü dört eksi bir eşittir bir | kesrin payı yedi eksi a, paydası dört eksi bir, eşittir bir | GEO_ANALITIK |
| `\frac{750 + 900}{2} = 825` | yedi yüz elli artı dokuz yüz bölü iki eşittir sekiz yüz yirmi beş | kesrin payı yedi yüz elli artı dokuz yüz, paydası iki, eşittir sekiz yüz yirmi beş | MAT_MUTLAK |
| `\frac{8 + 9 - 10}{12} = \frac{7}{12}` | sekiz artı dokuz eksi on bölü on iki eşittir yedi bölü on iki | kesrin payı sekiz artı dokuz eksi on, paydası on iki, eşittir yedi bölü on iki | MAT_RASYONEL |
| `\frac{8x + 3x}{12} = \frac{11x}{12} = 33` | sekiz x artı üç x bölü on iki eşittir on bir x bölü on iki eşittir otuz üç | kesrin payı sekiz x artı üç x, paydası on iki, eşittir on bir x bölü on iki eşittir otuz üç | MAT_DENKLEM |
| `\frac{9 - 5}{2} < x < \frac{9 + 5}{2}` | dokuz eksi beş bölü iki küçüktür x küçüktür dokuz artı beş bölü iki | kesrin payı dokuz eksi beş, paydası iki, küçüktür x küçüktür kesrin payı dokuz artı beş, paydası iki | GEO_ACI_KENAR |
| `\frac{9! + 8!}{8!} = \frac{8!(9 + 1)}{8!} = 10` | dokuz faktöriyel artı sekiz faktöriyel bölü sekiz faktöriyel eşittir sekiz faktöriyel parantez içinde dokuz artı bir, bölü sekiz faktöriyel eşittir on | kesrin payı dokuz faktöriyel artı sekiz faktöriyel, paydası sekiz faktöriyel, eşittir sekiz faktöriyel parantez içinde dokuz artı bir, bölü sekiz faktöriyel eşittir on | MAT_TEMEL |
| `\frac{900 - 750}{2} = 75` | dokuz yüz eksi yedi yüz elli bölü iki eşittir yetmiş beş | kesrin payı dokuz yüz eksi yedi yüz elli, paydası iki, eşittir yetmiş beş | MAT_MUTLAK |
| `\frac{a - c}{2}` | a eksi c bölü iki | kesrin payı a eksi c, paydası iki | GEO_YAMUK |
| `\frac{a + b}{3 + 5} = k` | a artı b bölü üç artı beş eşittir k | kesrin payı a artı b, paydası üç artı beş, eşittir k | MAT_ORAN |
| `\frac{a + c}{2} \cdot h` | a artı c bölü iki çarpı h | kesrin payı a artı c, paydası iki, çarpı h | GEO_YAMUK |
| `\frac{a + c}{2}` | a artı c bölü iki | kesrin payı a artı c, paydası iki | GEO_YAMUK |
| `\frac{A(ABC)}{A(ACD)} = \frac{12}{4} = 3` | A parantez içinde ABC, bölü A parantez içinde ACD, eşittir on iki bölü dört eşittir üç | kesrin payı A parantez içinde ABC, paydası A parantez içinde ACD, eşittir on iki bölü dört eşittir üç | GEO_YAMUK |
| `\frac{A(ABD)}{A(ABC)} = \frac{3}{8}` | A parantez içinde ABD, bölü A parantez içinde ABC, eşittir üç bölü sekiz | kesrin payı A parantez içinde ABD, paydası A parantez içinde ABC, eşittir üç bölü sekiz | GEO_UCGEN_ALAN |
| `\frac{A(ABD)}{A(ADC)} = \frac{\|AB\|}{\|AC\|}` | A parantez içinde ABD, bölü A parantez içinde ADC, eşittir A B uzunluğu bölü A C uzunluğu | kesrin payı A parantez içinde ABD, paydası A parantez içinde ADC, eşittir A B uzunluğu bölü A C uzunluğu | GEO_ACIORTAY |
| `\frac{A(ABD)}{A(ADC)} = \frac{c}{b}` | A parantez içinde ABD, bölü A parantez içinde ADC, eşittir c bölü b | kesrin payı A parantez içinde ABD, paydası A parantez içinde ADC, eşittir c bölü b | GEO_ACIORTAY |
| `\frac{A(ABD)}{A(ADC)} = \frac{m}{n}` | A parantez içinde ABD, bölü A parantez içinde ADC, eşittir m bölü n | kesrin payı A parantez içinde ABD, paydası A parantez içinde ADC, eşittir m bölü n | GEO_UCGEN_ALAN |
| `\frac{A(ADE)}{A(ABC)} = \frac{\frac{1}{2}\|AD\|\|AE\|\sin A}{\frac{1}{2}\|AB\|\|AC\|\sin A} = \frac{\|AD\|}{\|AB\|} \cdot \frac{\|AE\|}{\|AC\|}` | A parantez içinde ADE, bölü A parantez içinde ABC, eşittir bir bölü iki A D uzunluğu A E uzunluğu A bölü bir bölü iki A B uzunluğu A C uzunluğu A eşittir A D uzunluğu bölü A B uzunluğu çarpı A E uzunluğu bölü A C uzunluğu | kesrin payı A parantez içinde ADE, paydası A parantez içinde ABC, eşittir kesrin payı bir bölü iki A D uzunluğu A E uzunluğu sinüs A, paydası bir bölü iki A B uzunluğu A C uzunluğu sinüs A, eşittir A D uzunluğu bölü A B uzunluğu çarpı A E uzunluğu bölü A C uzunluğu | GEO_UCGEN_ALAN |
| `\frac{A(ADE)}{A(ABC)} = \frac{4}{9}` | A parantez içinde ADE, bölü A parantez içinde ABC, eşittir dört bölü dokuz | kesrin payı A parantez içinde ADE, paydası A parantez içinde ABC, eşittir dört bölü dokuz | GEO_ESLIK |
| `\frac{A(ADE)}{A(ABC)}` | A parantez içinde ADE, bölü A parantez içinde ABC | kesrin payı A parantez içinde ADE, paydası A parantez içinde ABC | GEO_UCGEN_ALAN |
| `\frac{A(DBC)}{A(ABC)} = \frac{8}{6 + 8 + 10} = \frac{8}{24} = \frac{1}{3}` | A parantez içinde DBC, bölü A parantez içinde ABC, eşittir sekiz bölü altı artı sekiz artı on eşittir sekiz bölü yirmi dört eşittir bir bölü üç | kesrin payı A parantez içinde DBC, paydası A parantez içinde ABC, eşittir kesrin payı sekiz, paydası altı artı sekiz artı on, eşittir sekiz bölü yirmi dört eşittir bir bölü üç | GEO_ACIORTAY |
| `\frac{A(DBC)}{A(ABC)}` | A parantez içinde DBC, bölü A parantez içinde ABC | kesrin payı A parantez içinde DBC, paydası A parantez içinde ABC | GEO_ACIORTAY |
| `\frac{a}{a+1}` | a bölü a artı bir | kesrin payı a, paydası a artı bir | MAT_RASYONEL |
| `\frac{C + D}{2}` | C artı D bölü iki | kesrin payı C artı D, paydası iki | GEO_DORTGENLER |
| `\frac{Ç(ABC)}{Ç(DEF)} = \frac{3}{2}` | Ç parantez içinde ABC, bölü Ç parantez içinde DEF, eşittir üç bölü iki | kesrin payı Ç parantez içinde ABC, paydası Ç parantez içinde DEF, eşittir üç bölü iki | GEO_ESLIK |
| `\frac{C}{100} = \frac{F - 32}{180} = \frac{K - 273}{100}` | C bölü yüz eşittir F eksi otuz iki bölü yüz seksen eşittir K eksi iki yüz yetmiş üç bölü yüz | C bölü yüz eşittir kesrin payı F eksi otuz iki, paydası yüz seksen, eşittir kesrin payı K eksi iki yüz yetmiş üç, paydası yüz | FIZ_ISI |
| `\frac{D_{küçük}}{D_{büyük}} = \frac{1/2}{1/6} = 3` | D küçük bölü D büyük eşittir bir bölü iki bölü bir bölü altı eşittir üç | D küçük bölü D büyük eşittir kesrin payı bir bölü iki, paydası bir bölü altı, eşittir üç | FIZ_MADDE |
| `\frac{k}{3} + \frac{k}{4} + \frac{k}{6} = \frac{4k + 3k + 2k}{12} = \frac{9k}{12} = 90 \Rightarrow k = 120` | k bölü üç artı k bölü dört artı k bölü altı eşittir dört k artı üç k artı iki k bölü on iki eşittir dokuz k bölü on iki eşittir doksan ise k eşittir yüz yirmi | k bölü üç artı k bölü dört artı k bölü altı eşittir kesrin payı dört k artı üç k artı iki k, paydası on iki, eşittir dokuz k bölü on iki eşittir doksan ise k eşittir yüz yirmi | MAT_ORAN |
| `\frac{n!}{a! \cdot b!}` | n faktöriyel bölü a faktöriyel çarpı b faktöriyel | kesrin payı n faktöriyel, paydası a faktöriyel çarpı b faktöriyel | MAT_PER_KOM |
| `\frac{X - 20}{220 - 20} = \frac{15}{100}` | X eksi yirmi bölü iki yüz yirmi eksi yirmi eşittir on beş bölü yüz | kesrin payı X eksi yirmi, paydası iki yüz yirmi eksi yirmi, eşittir on beş bölü yüz | FIZ_ISI |
| `\frac{x + 1}{2} > \frac{x - 3}{3}` | x artı bir bölü iki büyüktür x eksi üç bölü üç | kesrin payı x artı bir, paydası iki, büyüktür kesrin payı x eksi üç, paydası üç | MAT_ESITSIZLIK |
| `\frac{x + 1}{3} - \frac{x - 2}{4} = 1` | x artı bir bölü üç eksi x eksi iki bölü dört eşittir bir | kesrin payı x artı bir, paydası üç, eksi kesrin payı x eksi iki, paydası dört, eşittir bir | MAT_DENKLEM |
| `\frac{x(x - 3)}{(x - 3)(x + 3)} = \frac{x}{x + 3}` | x parantez içinde x eksi üç, bölü parantez içinde x eksi üç, parantez içinde x artı üç, eşittir x bölü x artı üç | kesrin payı x parantez içinde x eksi üç, paydası parantez içinde x eksi üç, parantez içinde x artı üç, eşittir kesrin payı x, paydası x artı üç | MAT_CARPAN |
| `\frac{x}{10 - x} = \frac{6}{9} = \frac{2}{3}` | x bölü on eksi x eşittir altı bölü dokuz eşittir iki bölü üç | kesrin payı x, paydası on eksi x, eşittir altı bölü dokuz eşittir iki bölü üç | GEO_ACIORTAY |
| `\frac{x}{10 - x} = \frac{6}{9}` | x bölü on eksi x eşittir altı bölü dokuz | kesrin payı x, paydası on eksi x, eşittir altı bölü dokuz | GEO_ACIORTAY |
| `\frac{x}{x - 3}` | x bölü x eksi üç | kesrin payı x, paydası x eksi üç | MAT_CARPAN |
| `\frac{x}{x + 3}` | x bölü x artı üç | kesrin payı x, paydası x artı üç | MAT_CARPAN |
| `\frac{x}{x + 5} = \frac{4}{6} = \frac{2}{3}` | x bölü x artı beş eşittir dört bölü altı eşittir iki bölü üç | kesrin payı x, paydası x artı beş, eşittir dört bölü altı eşittir iki bölü üç | GEO_ACIORTAY |
| `\frac{x^2 - 3x}{x^2 - 9}` | x kare eksi üç x bölü x kare eksi dokuz | kesrin payı x kare eksi üç x, paydası x kare eksi dokuz | MAT_CARPAN |
| `\frac{y}{y + 6} = \frac{1}{2}` | y bölü y artı altı eşittir bir bölü iki | kesrin payı y, paydası y artı altı, eşittir bir bölü iki | GEO_ACIORTAY |
| `\left(\frac{0 + 6}{2}, \frac{0 + 4}{2}\right) = (3, 2)` | parantez içinde sıfır artı altı bölü iki, sıfır artı dört bölü iki, eşittir parantez içinde üç, iki | parantez içinde kesrin payı sıfır artı altı, paydası iki, kesrin payı sıfır artı dört, paydası iki, eşittir parantez içinde üç, iki | GEO_GRAFIK |
| `\left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)` | parantez içinde x bir artı x iki bölü iki, y bir artı y iki bölü iki | parantez içinde kesrin payı x bir artı x iki, paydası iki, kesrin payı y bir artı y iki, paydası iki | GEO_ANALITIK |
| `= \frac{20 + 22 + 24 + 25 + 200}{5} = \frac{291}{5} = 58{,}2` | eşittir yirmi artı yirmi iki artı yirmi dört artı yirmi beş artı iki yüz bölü beş eşittir iki yüz doksan bir bölü beş eşittir elli sekiz virgül iki | eşittir kesrin payı yirmi artı yirmi iki artı yirmi dört artı yirmi beş artı iki yüz, paydası beş, eşittir iki yüz doksan bir bölü beş eşittir elli sekiz virgül iki | MAT_VERI_IST |
| `= \frac{9 + 12}{2} = 10{,}5` | eşittir dokuz artı on iki bölü iki eşittir on virgül beş | eşittir kesrin payı dokuz artı on iki, paydası iki, eşittir on virgül beş | MAT_VERI_IST |
| `\|AH\| = \frac{16 - 6}{2} = 5` | A H uzunluğu eşittir on altı eksi altı bölü iki eşittir beş | A H uzunluğu eşittir kesrin payı on altı eksi altı, paydası iki, eşittir beş | GEO_YAMUK |
| `\|AK\| = \frac{14 - 4}{2} + 4 = 9` | A K uzunluğu eşittir on dört eksi dört bölü iki artı dört eşittir dokuz | A K uzunluğu eşittir kesrin payı on dört eksi dört, paydası iki, artı dört eşittir dokuz | GEO_YAMUK |
| `\|EF\| = \frac{a + c}{2}` | E F uzunluğu eşittir a artı c bölü iki | E F uzunluğu eşittir kesrin payı a artı c, paydası iki | GEO_YAMUK |
| `14 - 10 = 4 = \frac{18 - 10}{2}` | on dört eksi on eşittir dört eşittir on sekiz eksi on bölü iki | on dört eksi on eşittir dört eşittir kesrin payı on sekiz eksi on, paydası iki | GEO_YAMUK |
| `2{,}\overline{3} = \frac{23 - 2}{9} = \frac{21}{9}` | iki virgül üç devirli eşittir yirmi üç eksi iki bölü dokuz eşittir yirmi bir bölü dokuz | iki virgül üç devirli eşittir kesrin payı yirmi üç eksi iki, paydası dokuz, eşittir yirmi bir bölü dokuz | MAT_RASYONEL |
| `a = \frac{\Delta v}{\Delta t} = \frac{20 - 0}{5} = 4 \text{ m/s}^2` | a eşittir delta v bölü delta t eşittir yirmi eksi sıfır bölü beş eşittir dört metre bölü s kare | a eşittir delta v bölü delta t eşittir kesrin payı yirmi eksi sıfır, paydası beş, eşittir dört metre bölü s kare | FIZ_HAREKET |
| `A = \frac{15 + 9}{2} \cdot 8 = 12 \cdot 8 = 96` | A eşittir on beş artı dokuz bölü iki çarpı sekiz eşittir on iki çarpı sekiz eşittir doksan altı | A eşittir kesrin payı on beş artı dokuz, paydası iki, çarpı sekiz eşittir on iki çarpı sekiz eşittir doksan altı | GEO_YAMUK |
| `A = \frac{a + c}{2} \cdot h` | A eşittir a artı c bölü iki çarpı h | A eşittir kesrin payı a artı c, paydası iki, çarpı h | GEO_YAMUK |
| `ab - 2b = 2a \Rightarrow b = \frac{2a}{a - 2}` | ab eksi iki b eşittir iki a ise b eşittir iki a bölü a eksi iki | ab eksi iki b eşittir iki a ise b eşittir kesrin payı iki a, paydası a eksi iki | MAT_BASAMAK |
| `b = \frac{a + c}{2}` | b eşittir a artı c bölü iki | b eşittir kesrin payı a artı c, paydası iki | GEO_UCGEN_ACI |
| `d = \frac{24 + 16}{30 + 10} = \frac{40}{40} = 1` | d eşittir yirmi dört artı on altı bölü otuz artı on eşittir kırk bölü kırk eşittir bir | d eşittir kesrin payı yirmi dört artı on altı, paydası otuz artı on, eşittir kırk bölü kırk eşittir bir | FIZ_MADDE |
| `d = \frac{d_1 + d_2}{2}` | d eşittir d bir artı d iki bölü iki | d eşittir kesrin payı d bir artı d iki, paydası iki | FIZ_MADDE |
| `d = \frac{m_1 + m_2}{V_1 + V_2}` | d eşittir m bir artı m iki bölü V bir artı V iki | d eşittir kesrin payı m bir artı m iki, paydası V bir artı V iki | FIZ_MADDE |
| `f(x) = \frac{2x + 1}{x - 3}` | f x eşittir iki x artı bir bölü x eksi üç | f x eşittir kesrin payı iki x artı bir, paydası x eksi üç | MAT_FONK |
| `f\left(\frac{16}{3}\right) = \frac{35/3}{7/3} = 5` | f parantez içinde on altı bölü üç, eşittir otuz beş bölü üç bölü yedi bölü üç eşittir beş | f on altı bölü üç, eşittir kesrin payı otuz beş bölü üç, paydası yedi bölü üç, eşittir beş | MAT_FONK |
| `f^{-1}(x) = \frac{x + 5}{3}` | f tersi x eşittir x artı beş bölü üç | f tersi x eşittir kesrin payı x artı beş, paydası üç | MAT_FONK |
| `G = \left(\frac{1 + 5 + 3}{3}, \frac{2 + 4 + 9}{3}\right) = (3, 5)` | G eşittir parantez içinde bir artı beş artı üç bölü üç, iki artı dört artı dokuz bölü üç, eşittir parantez içinde üç, beş | G eşittir parantez içinde kesrin payı bir artı beş artı üç, paydası üç, kesrin payı iki artı dört artı dokuz, paydası üç, eşittir parantez içinde üç, beş | GEO_ANALITIK |
| `m = \frac{4 - 0}{0 - 2} = -2` | m eşittir dört eksi sıfır bölü sıfır eksi iki eşittir eksi iki | m eşittir kesrin payı dört eksi sıfır, paydası sıfır eksi iki, eşittir eksi iki | GEO_ANALITIK |
| `m = \frac{9 - 1}{6 - 2} = \frac{8}{4} = 2` | m eşittir dokuz eksi bir bölü altı eksi iki eşittir sekiz bölü dört eşittir iki | m eşittir kesrin payı dokuz eksi bir, paydası altı eksi iki, eşittir sekiz bölü dört eşittir iki | GEO_ANALITIK |
| `m = \frac{a + b}{2}` | m eşittir a artı b bölü iki | m eşittir kesrin payı a artı b, paydası iki | MAT_MUTLAK |
| `m = \frac{y_2 - y_1}{x_2 - x_1} = \tan \alpha` | m eşittir y iki eksi y bir bölü x iki eksi x bir eşittir | m eşittir kesrin payı y iki eksi y bir, paydası x iki eksi x bir, eşittir tanjant alfa | GEO_ANALITIK |
| `m_{AB} = \frac{6 - 2}{3 - 1} = 2` | m a be eşittir altı eksi iki bölü üç eksi bir eşittir iki | m a be eşittir kesrin payı altı eksi iki, paydası üç eksi bir, eşittir iki | GEO_ANALITIK |
| `m_{BC} = \frac{k - 6}{5 - 3} = 2` | m BC eşittir k eksi altı bölü beş eksi üç eşittir iki | m BC eşittir kesrin payı k eksi altı, paydası beş eksi üç, eşittir iki | GEO_ANALITIK |
| `m(\widehat{ADC}) = m(\widehat{ACD}) = \frac{180° - 100°}{2} = 40°` | A D C açısı eşittir A C D açısı eşittir yüz seksen derece eksi yüz derece bölü iki eşittir kırk derece | A D C açısı eşittir A C D açısı eşittir kesrin payı yüz seksen derece eksi yüz derece, paydası iki, eşittir kırk derece | GEO_EK_CIZIM |
| `m(\widehat{EAB}) = m(\widehat{EBA}) = \frac{180° - 50°}{2} = 65°` | E A B açısı eşittir E B A açısı eşittir yüz seksen derece eksi elli derece bölü iki eşittir altmış beş derece | E A B açısı eşittir E B A açısı eşittir kesrin payı yüz seksen derece eksi elli derece, paydası iki, eşittir altmış beş derece | GEO_DIKDORTGEN |
| `n = \frac{3 \cdot 10^8}{2 \cdot 10^8} = 1{,}5` | n eşittir üç çarpı on üssü sekiz bölü iki çarpı on üssü sekiz eşittir bir virgül beş | n eşittir kesrin payı üç çarpı on üssü sekiz, paydası iki çarpı on üssü sekiz, eşittir bir virgül beş | FIZ_OPTIK |
| `n_C = \frac{1{,}8 \cdot 10^{23}}{6 \cdot 10^{23}} = 0{,}3` | n C eşittir bir virgül sekiz çarpı on üssü yirmi üç bölü altı çarpı on üssü yirmi üç eşittir sıfır virgül üç | n C eşittir kesrin payı bir virgül sekiz çarpı on üssü yirmi üç, paydası altı çarpı on üssü yirmi üç, eşittir sıfır virgül üç | KIM_HESAP |
| `P(A) = \frac{s(A)}{s(E)}` | P A eşittir s parantez içinde A, bölü s parantez içinde E | P A eşittir kesrin payı s parantez içinde A, paydası s parantez içinde E | MAT_OLASILIK |
| `r = \frac{8 + 15 - 17}{2} = 3` | r eşittir sekiz artı on beş eksi on yedi bölü iki eşittir üç | r eşittir kesrin payı sekiz artı on beş eksi on yedi, paydası iki, eşittir üç | GEO_MERKEZLER |
| `r = \frac{a + b - c}{2}` | r eşittir a artı b eksi c bölü iki | r eşittir kesrin payı a artı b eksi c, paydası iki | GEO_MERKEZLER |
| `r = \frac{b - a}{2}` | r eşittir b eksi a bölü iki | r eşittir kesrin payı b eksi a, paydası iki | MAT_MUTLAK |
| `t = \frac{\text{ara mesafe}}{V_1 - V_2}` | t eşittir ara mesafe bölü V bir eksi V iki | t eşittir kesrin payı ara mesafe, paydası V bir eksi V iki | MAT_PROBLEM |
| `t = \frac{\text{ara mesafe}}{V_1 + V_2}` | t eşittir ara mesafe bölü V bir artı V iki | t eşittir kesrin payı ara mesafe, paydası V bir artı V iki | MAT_PROBLEM |
| `u = \frac{5 + 6 + 7}{2} = 9` | u eşittir beş artı altı artı yedi bölü iki eşittir dokuz | u eşittir kesrin payı beş artı altı artı yedi, paydası iki, eşittir dokuz | GEO_MERKEZLER |
| `u = \frac{7 + 8 + 9}{2} = 12` | u eşittir yedi artı sekiz artı dokuz bölü iki eşittir on iki | u eşittir kesrin payı yedi artı sekiz artı dokuz, paydası iki, eşittir on iki | GEO_MERKEZLER |
| `V = \frac{F_k}{d \cdot g} = \frac{4}{1000 \cdot 10} = 4 \cdot 10^{-4} \text{ m}^3 = 400 \text{ cm}^3` | V eşittir F k bölü d çarpı g eşittir dört bölü bin çarpı on eşittir dört çarpı on üssü eksi dört metre küp eşittir dört yüz santimetre küp | V eşittir kesrin payı F k, paydası d çarpı g, eşittir kesrin payı dört, paydası bin çarpı on, eşittir dört çarpı on üssü eksi dört metre küp eşittir dört yüz santimetre küp | FIZ_KALDIRMA |
| `x = \frac{180° - 108°}{2} = 36°` | x eşittir yüz seksen derece eksi yüz sekiz derece bölü iki eşittir otuz altı derece | x eşittir kesrin payı yüz seksen derece eksi yüz sekiz derece, paydası iki, eşittir otuz altı derece | GEO_COKGEN |
| `x = \frac{180° - 150°}{2} = 15°` | x eşittir yüz seksen derece eksi yüz elli derece bölü iki eşittir on beş derece | x eşittir kesrin payı yüz seksen derece eksi yüz elli derece, paydası iki, eşittir on beş derece | GEO_COKGEN |
| `x = \frac{180° - 162°}{2} = 9°` | x eşittir yüz seksen derece eksi yüz altmış iki derece bölü iki eşittir dokuz derece | x eşittir kesrin payı yüz seksen derece eksi yüz altmış iki derece, paydası iki, eşittir dokuz derece | GEO_COKGEN |
| `x = \frac{3 + (-5)}{2} = -1` | x eşittir üç artı parantez içinde eksi beş, bölü iki eşittir eksi bir | x eşittir kesrin payı üç artı parantez içinde eksi beş, paydası iki, eşittir eksi bir | MAT_MUTLAK |
| `x = \frac{4 \pm 2\sqrt{3}}{2} = 2 \pm \sqrt{3}` | x eşittir dört artı eksi iki karekök üç bölü iki eşittir iki artı eksi karekök üç | x eşittir kesrin payı dört artı eksi iki karekök üç, paydası iki, eşittir iki artı eksi karekök üç | MAT_IKINCI_DER |
| `x = \frac{C + D}{2}` | x eşittir C artı D bölü iki | x eşittir kesrin payı C artı D, paydası iki | GEO_DORTGENLER |
| `x = 180° - \frac{(180° - B) + (180° - C)}{2} = \frac{B + C}{2} = \frac{130°}{2} = 65°` | x eşittir yüz seksen derece eksi parantez içinde yüz seksen derece eksi B, artı parantez içinde yüz seksen derece eksi C, bölü iki eşittir B artı C bölü iki eşittir yüz otuz derece bölü iki eşittir altmış beş derece | x eşittir yüz seksen derece eksi kesrin payı parantez içinde yüz seksen derece eksi B, artı parantez içinde yüz seksen derece eksi C, paydası iki, eşittir kesrin payı B artı C, paydası iki, eşittir yüz otuz derece bölü iki eşittir altmış beş derece | GEO_UCGEN_ACI |
| `x_{1,2} = \frac{-b \pm \sqrt{\Delta}}{2a}` | x bir virgül iki eşittir eksi b artı eksi karekök delta bölü iki a | x bir, iki eşittir kesrin payı eksi b artı eksi karekök delta, paydası iki a | MAT_IKINCI_DER |

</details>

<details><summary>Bileşik kök: "karekök içinde …" (58)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `\frac{\|2 - (-8)\|}{\sqrt{9 + 16}} = \frac{10}{5} = 2` | mutlak değer iki eksi parantez içinde eksi sekiz, bölü karekök dokuz artı on altı eşittir on bölü beş eşittir iki | mutlak değer iki eksi parantez içinde eksi sekiz, bölü karekök içinde dokuz artı on altı, eşittir on bölü beş eşittir iki | GEO_ANALITIK |
| `\frac{\|3 \cdot 0 + 4 \cdot 0 - 10\|}{\sqrt{9 + 16}} = \frac{10}{5} = 2` | mutlak değer üç çarpı sıfır artı dört çarpı sıfır eksi on, bölü karekök dokuz artı on altı eşittir on bölü beş eşittir iki | mutlak değer üç çarpı sıfır artı dört çarpı sıfır eksi on, bölü karekök içinde dokuz artı on altı, eşittir on bölü beş eşittir iki | GEO_ANALITIK |
| `\frac{\|ax_0 + by_0 + c\|}{\sqrt{a^2 + b^2}}` | mutlak değer ax sıfır artı by sıfır artı c, bölü karekök a kare artı b kare | mutlak değer ax sıfır artı by sıfır artı c, bölü karekök içinde a kare artı b kare | GEO_ANALITIK |
| `\sqrt[3]{54} = \sqrt[3]{27 \cdot 2} = 3\sqrt[3]{2}` | küpkök elli dört eşittir küpkök yirmi yedi çarpı iki eşittir üç küpkök iki | küpkök elli dört eşittir küpkök içinde yirmi yedi çarpı iki, eşittir üç küpkök iki | MAT_KOKLU |
| `\sqrt{(\Delta x)^2 + (\Delta y)^2}` | karekök parantez içinde delta x, kare artı parantez içinde delta y, kare | karekök içinde parantez içinde delta x, kare artı parantez içinde delta y, kare | GEO_ANALITIK |
| `\sqrt{\frac{8 \cdot 18}{2}} = \sqrt{72} = 6\sqrt{2}` | karekök sekiz çarpı on sekiz bölü iki eşittir karekök yetmiş iki eşittir altı karekök iki | karekök içinde sekiz çarpı on sekiz bölü iki, eşittir karekök yetmiş iki eşittir altı karekök iki | MAT_KOKLU |
| `\sqrt{13^2 - 48} = \sqrt{121} = 11` | karekök on üç kare eksi kırk sekiz eşittir karekök yüz yirmi bir eşittir on bir | karekök içinde on üç kare eksi kırk sekiz, eşittir karekök yüz yirmi bir eşittir on bir | GEO_DELTOID |
| `\sqrt{144 - 36} = 6\sqrt{3}` | karekök yüz kırk dört eksi otuz altı eşittir altı karekök üç | karekök içinde yüz kırk dört eksi otuz altı, eşittir altı karekök üç | GEO_DIKDORTGEN |
| `\sqrt{169 - 25} = 12` | karekök yüz altmış dokuz eksi yirmi beş eşittir on iki | karekök içinde yüz altmış dokuz eksi yirmi beş, eşittir on iki | GEO_DIKDORTGEN |
| `\sqrt{24^2 + 7^2} = 25` | karekök yirmi dört kare artı yedi kare eşittir yirmi beş | karekök içinde yirmi dört kare artı yedi kare, eşittir yirmi beş | GEO_ESKENAR_DORT |
| `\sqrt{2x + 7} = x + 2` | karekök iki x artı yedi eşittir x artı iki | karekök içinde iki x artı yedi, eşittir x artı iki | MAT_KOKLU |
| `\sqrt{36 + 64} = 10` | karekök otuz altı artı altmış dört eşittir on | karekök içinde otuz altı artı altmış dört, eşittir on | GEO_KENARORTAY |
| `\sqrt{3x - 2} = 5` | karekök üç x eksi iki eşittir beş | karekök içinde üç x eksi iki, eşittir beş | MAT_KOKLU |
| `\sqrt{4^2 + 3^2} = 5` | karekök dört kare artı üç kare eşittir beş | karekök içinde dört kare artı üç kare, eşittir beş | GEO_KATI |
| `\sqrt{625 - 400} = 15` | karekök altı yüz yirmi beş eksi dört yüz eşittir on beş | karekök içinde altı yüz yirmi beş eksi dört yüz, eşittir on beş | GEO_ESKENAR_DORT |
| `\sqrt{64 + 225} = 17` | karekök altmış dört artı iki yüz yirmi beş eşittir on yedi | karekök içinde altmış dört artı iki yüz yirmi beş, eşittir on yedi | GEO_MERKEZLER |
| `\sqrt{64 + 36} = 10` | karekök altmış dört artı otuz altı eşittir on | karekök içinde altmış dört artı otuz altı, eşittir on | GEO_ESKENAR_DORT, GEO_OZEL_UCGEN |
| `\sqrt{72} = \sqrt{36 \cdot 2} = 6\sqrt{2}` | karekök yetmiş iki eşittir karekök otuz altı çarpı iki eşittir altı karekök iki | karekök yetmiş iki eşittir karekök içinde otuz altı çarpı iki, eşittir altı karekök iki | MAT_KOKLU |
| `\sqrt{81 + 144} = 15` | karekök seksen bir artı yüz kırk dört eşittir on beş | karekök içinde seksen bir artı yüz kırk dört, eşittir on beş | GEO_ANALITIK |
| `\sqrt{a} + \sqrt{b} \neq \sqrt{a + b}` | karekök a artı karekök b eşit değildir karekök a artı b | karekök a artı karekök b eşit değildir karekök içinde a artı b | MAT_KOKLU |
| `\sqrt{a^2 + b^2}` | karekök a kare artı b kare | karekök içinde a kare artı b kare | GEO_ANALITIK |
| `\sqrt{x - 3} + \sqrt{7 - x}` | karekök x eksi üç artı karekök yedi eksi x | karekök içinde x eksi üç, artı karekök içinde yedi eksi x | MAT_KOKLU |
| `\sqrt{x + 1} = -2` | karekök x artı bir eşittir eksi iki | karekök içinde x artı bir, eşittir eksi iki | MAT_KOKLU |
| `\|AB'\| = \sqrt{36 + 64} = 10` | mutlak değer A B tümleyen, eşittir karekök otuz altı artı altmış dört eşittir on | A B üssü uzunluğu eşittir karekök içinde otuz altı artı altmış dört, eşittir on | GEO_EK_CIZIM |
| `\|AB\| = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}` | A B uzunluğu eşittir karekök parantez içinde x iki eksi x bir, kare artı parantez içinde y iki eksi y bir, kare | A B uzunluğu eşittir karekök içinde parantez içinde x iki eksi x bir, kare artı parantez içinde y iki eksi y bir, kare | GEO_ANALITIK |
| `\|AB\| = \sqrt{16 + 9} = 5` | A B uzunluğu eşittir karekök on altı artı dokuz eşittir beş | A B uzunluğu eşittir karekök içinde on altı artı dokuz, eşittir beş | GEO_GRAFIK |
| `\|AB\| = \sqrt{25 + 144} = 13` | A B uzunluğu eşittir karekök yirmi beş artı yüz kırk dört eşittir on üç | A B uzunluğu eşittir karekök içinde yirmi beş artı yüz kırk dört, eşittir on üç | GEO_OZEL_UCGEN |
| `\|AB\| = \sqrt{36 + 64} = 10` | A B uzunluğu eşittir karekök otuz altı artı altmış dört eşittir on | A B uzunluğu eşittir karekök içinde otuz altı artı altmış dört, eşittir on | GEO_ANALITIK |
| `\|AB\| = \sqrt{64 + 36} = 10` | A B uzunluğu eşittir karekök altmış dört artı otuz altı eşittir on | A B uzunluğu eşittir karekök içinde altmış dört artı otuz altı, eşittir on | GEO_ANALITIK, GEO_DELTOID |
| `\|AC'\| = \sqrt{100 - 36} = 8` | mutlak değer A C tümleyen, eşittir karekök yüz eksi otuz altı eşittir sekiz | A C üssü uzunluğu eşittir karekök içinde yüz eksi otuz altı, eşittir sekiz | GEO_DIKDORTGEN |
| `\|AC\| = \sqrt{144 + 25} = 13` | A C uzunluğu eşittir karekök yüz kırk dört artı yirmi beş eşittir on üç | A C uzunluğu eşittir karekök içinde yüz kırk dört artı yirmi beş, eşittir on üç | GEO_ANALITIK |
| `\|AC\| = \sqrt{81 + 144} = 15` | A C uzunluğu eşittir karekök seksen bir artı yüz kırk dört eşittir on beş | A C uzunluğu eşittir karekök içinde seksen bir artı yüz kırk dört, eşittir on beş | GEO_YAMUK |
| `\|AH\| = \sqrt{100 - 36} = 8` | A H uzunluğu eşittir karekök yüz eksi otuz altı eşittir sekiz | A H uzunluğu eşittir karekök içinde yüz eksi otuz altı, eşittir sekiz | GEO_OZEL_UCGEN |
| `\|AO\| = \sqrt{100 - 64} = 6` | A O uzunluğu eşittir karekök yüz eksi altmış dört eşittir altı | A O uzunluğu eşittir karekök içinde yüz eksi altmış dört, eşittir altı | GEO_DELTOID |
| `\|AO\| = \sqrt{225 - 81} = 12` | A O uzunluğu eşittir karekök iki yüz yirmi beş eksi seksen bir eşittir on iki | A O uzunluğu eşittir karekök içinde iki yüz yirmi beş eksi seksen bir, eşittir on iki | GEO_DELTOID |
| `\|AO\| = \sqrt{25 - 16} = 3` | A O uzunluğu eşittir karekök yirmi beş eksi on altı eşittir üç | A O uzunluğu eşittir karekök içinde yirmi beş eksi on altı, eşittir üç | GEO_DELTOID |
| `\|AO\| = \sqrt{64 - 16} = 4\sqrt{3}` | A O uzunluğu eşittir karekök altmış dört eksi on altı eşittir dört karekök üç | A O uzunluğu eşittir karekök içinde altmış dört eksi on altı, eşittir dört karekök üç | GEO_ESKENAR_DORT |
| `\|ax_0 + by_0 + c\| / \sqrt{a^2 + b^2}` | mutlak değer ax sıfır artı by sıfır artı c, bölü karekök a kare artı b kare | mutlak değer ax sıfır artı by sıfır artı c, bölü karekök içinde a kare artı b kare | GEO_ANALITIK |
| `\|BC\| = \sqrt{25 + 144} = 13` | B C uzunluğu eşittir karekök yirmi beş artı yüz kırk dört eşittir on üç | B C uzunluğu eşittir karekök içinde yirmi beş artı yüz kırk dört, eşittir on üç | GEO_MERKEZLER |
| `\|BD\| = \sqrt{36 + 64} = 10` | B D uzunluğu eşittir karekök otuz altı artı altmış dört eşittir on | B D uzunluğu eşittir karekök içinde otuz altı artı altmış dört, eşittir on | GEO_DORTGENLER |
| `\|BO\| = \sqrt{169 - 144} = 5` | B O uzunluğu eşittir karekök yüz altmış dokuz eksi yüz kırk dört eşittir beş | B O uzunluğu eşittir karekök içinde yüz altmış dokuz eksi yüz kırk dört, eşittir beş | GEO_ESKENAR_DORT |
| `\|CB\| = \sqrt{144 + 36} = 6\sqrt{5}` | C B uzunluğu eşittir karekök yüz kırk dört artı otuz altı eşittir altı karekök beş | C B uzunluğu eşittir karekök içinde yüz kırk dört artı otuz altı, eşittir altı karekök beş | GEO_DELTOID |
| `\|CB\| = \sqrt{81 + 1600} = \sqrt{1681} = 41` | C B uzunluğu eşittir karekök seksen bir artı bin altı yüz eşittir karekök bin altı yüz seksen bir eşittir kırk bir | C B uzunluğu eşittir karekök içinde seksen bir artı bin altı yüz, eşittir karekök bin altı yüz seksen bir eşittir kırk bir | GEO_DELTOID |
| `\|CD\| = \sqrt{100 - 64} = 6` | C D uzunluğu eşittir karekök yüz eksi altmış dört eşittir altı | C D uzunluğu eşittir karekök içinde yüz eksi altmış dört, eşittir altı | GEO_DORTGENLER |
| `\|CO\| = \sqrt{289 - 64} = 15` | C O uzunluğu eşittir karekök iki yüz seksen dokuz eksi altmış dört eşittir on beş | C O uzunluğu eşittir karekök içinde iki yüz seksen dokuz eksi altmış dört, eşittir on beş | GEO_DELTOID |
| `\|OB\| = \sqrt{100 - 64} = 6` | O B uzunluğu eşittir karekök yüz eksi altmış dört eşittir altı | O B uzunluğu eşittir karekök içinde yüz eksi altmış dört, eşittir altı | GEO_DORTGENLER |
| `3\sqrt{5} = \sqrt{9 \cdot 5} = \sqrt{45}` | üç karekök beş eşittir karekök dokuz çarpı beş eşittir karekök kırk beş | üç karekök beş eşittir karekök içinde dokuz çarpı beş, eşittir karekök kırk beş | MAT_KOKLU |
| `a = \sqrt{36 + 25} = \sqrt{61}` | a eşittir karekök otuz altı artı yirmi beş eşittir karekök altmış bir | a eşittir karekök içinde otuz altı artı yirmi beş, eşittir karekök altmış bir | GEO_ESKENAR_DORT |
| `a = \sqrt{6^2 + 8^2} = 10` | a eşittir karekök altı kare artı sekiz kare eşittir on | a eşittir karekök içinde altı kare artı sekiz kare, eşittir on | GEO_ESKENAR_DORT |
| `a = 2\sqrt{3} = \sqrt{4 \cdot 3} = \sqrt{12}` | a eşittir iki karekök üç eşittir karekök dört çarpı üç eşittir karekök on iki | a eşittir iki karekök üç eşittir karekök içinde dört çarpı üç, eşittir karekök on iki | MAT_KOKLU |
| `b = 3\sqrt{2} = \sqrt{9 \cdot 2} = \sqrt{18}` | b eşittir üç karekök iki eşittir karekök dokuz çarpı iki eşittir karekök on sekiz | b eşittir üç karekök iki eşittir karekök içinde dokuz çarpı iki, eşittir karekök on sekiz | MAT_KOKLU |
| `d = \sqrt{81 + 144} = \sqrt{225} = 15` | d eşittir karekök seksen bir artı yüz kırk dört eşittir karekök iki yüz yirmi beş eşittir on beş | d eşittir karekök içinde seksen bir artı yüz kırk dört, eşittir karekök iki yüz yirmi beş eşittir on beş | GEO_DIKDORTGEN |
| `h = \sqrt{169 - 25} = 12` | h eşittir karekök yüz altmış dokuz eksi yirmi beş eşittir on iki | h eşittir karekök içinde yüz altmış dokuz eksi yirmi beş, eşittir on iki | GEO_YAMUK |
| `R = \sqrt{6^2 + 8^2} = \sqrt{100} = 10` | R eşittir karekök altı kare artı sekiz kare eşittir karekök yüz eşittir on | R eşittir karekök içinde altı kare artı sekiz kare, eşittir karekök yüz eşittir on | FIZ_HAREKET |
| `x = \sqrt{100 - 36} = 8` | x eşittir karekök yüz eksi otuz altı eşittir sekiz | x eşittir karekök içinde yüz eksi otuz altı, eşittir sekiz | GEO_CEMBER |
| `x = \sqrt{169 - 144} = 5` | x eşittir karekök yüz altmış dokuz eksi yüz kırk dört eşittir beş | x eşittir karekök içinde yüz altmış dokuz eksi yüz kırk dört, eşittir beş | GEO_CEMBER |
| `x = \sqrt{36 + 64} = 10` | x eşittir karekök otuz altı artı altmış dört eşittir on | x eşittir karekök içinde otuz altı artı altmış dört, eşittir on | GEO_DIKDORTGEN, GEO_PARALELKENAR |
| `x = \sqrt{64 + 36} = 10` | x eşittir karekök altmış dört artı otuz altı eşittir on | x eşittir karekök içinde altmış dört artı otuz altı, eşittir on | GEO_YAMUK |

</details>

<details><summary>Okunmayan semboller artık okunuyor: Yunan harfleri, sinüs-kosinüs-tanjant, ∝, ∼, ≅, ℓ (87)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `\alpha + 2(\alpha + 30°) = 180°` | artı iki parantez içinde artı otuz derece, eşittir yüz seksen derece | alfa artı iki parantez içinde alfa artı otuz derece, eşittir yüz seksen derece | GEO_ACIORTAY |
| `\alpha = 360° \cdot \frac{4}{12} = 120°` | eşittir üç yüz altmış derece çarpı dört bölü on iki eşittir yüz yirmi derece | alfa eşittir üç yüz altmış derece çarpı dört bölü on iki eşittir yüz yirmi derece | GEO_KATI |
| `\alpha = 40°` | eşittir kırk derece | alfa eşittir kırk derece | GEO_ACIORTAY |
| `\alpha` | *(hiç okunmuyordu)* | alfa | GEO_ACIORTAY, GEO_ANALITIK, GEO_CEMBER, GEO_ESLIK, GEO_UCGEN_ALAN |
| `\Delta L = L_0 \cdot \lambda \cdot \Delta T` | delta L eşittir L sıfır çarpı çarpı delta T | delta L eşittir L sıfır çarpı lamda çarpı delta T | FIZ_ISI |
| `\Delta L = L_0 \lambda \Delta T` | delta L eşittir L sıfır delta T | delta L eşittir L sıfır lamda delta T | FIZ_ISI |
| `\Delta L_K = L \lambda \Delta T` | delta L K eşittir L delta T | delta L K eşittir L lamda delta T | FIZ_ISI |
| `\Delta L_L = 2L \cdot \frac{\lambda}{2} \Delta T = L \lambda \Delta T` | delta L L eşittir iki L çarpı bölü iki delta T eşittir L delta T | delta L L eşittir iki L çarpı lamda bölü iki delta T eşittir L lamda delta T | FIZ_ISI |
| `\Delta L_M = 2L \cdot 2\lambda \Delta T = 4 L \lambda \Delta T` | delta L M eşittir iki L çarpı iki delta T eşittir dört L delta T | delta L M eşittir iki L çarpı iki lamda delta T eşittir dört L lamda delta T | FIZ_ISI |
| `\ell^2 = r^2 + h^2` | kare eşittir r kare artı h kare | l kare eşittir r kare artı h kare | GEO_KATI |
| `\frac{\alpha}{360°} \cdot 2\pi \cdot 12 = 8\pi` | bölü üç yüz altmış derece çarpı iki pi çarpı on iki eşittir sekiz pi | alfa bölü üç yüz altmış derece çarpı iki pi çarpı on iki eşittir sekiz pi | GEO_KATI |
| `\frac{\lambda}{2}` | bölü iki | lamda bölü iki | FIZ_ISI |
| `\frac{1}{2} b c \sin \alpha` | bir bölü iki b c | bir bölü iki b c sinüs alfa | GEO_UCGEN_ALAN |
| `\frac{1}{2} e f \sin \theta` | bir bölü iki e f | bir bölü iki e f sinüs teta | GEO_DORTGENLER |
| `\frac{e \cdot f}{2} = a \cdot h = a^2 \sin \alpha` | e çarpı f bölü iki eşittir a çarpı h eşittir a kare | e çarpı f bölü iki eşittir a çarpı h eşittir a kare sinüs alfa | GEO_ESKENAR_DORT |
| `\lambda = \frac{v}{f}` | eşittir v bölü f | lamda eşittir v bölü f | FIZ_DALGA |
| `\lambda` | *(hiç okunmuyordu)* | lamda | FIZ_ISI |
| `\mu N` | N | mü N | FIZ_HAREKET |
| `\mu_k N` | k N | mü k N | FIZ_HAREKET |
| `\mu_s N` | s N | mü s N | FIZ_HAREKET |
| `\Phi` | *(hiç okunmuyordu)* | fi | FIZ_OPTIK |
| `\pi r \ell` | pi r | pi r l | GEO_KATI |
| `\pi r^2 \cdot \frac{\alpha}{360}` | pi r kare çarpı bölü üç yüz altmış | pi r kare çarpı alfa bölü üç yüz altmış | GEO_CEMBER |
| `\pi r^2 \cdot \frac{\alpha}{360°}` | pi r kare çarpı bölü üç yüz altmış derece | pi r kare çarpı alfa bölü üç yüz altmış derece | GEO_CEMBER |
| `\propto \frac{\text{kesit alanı}}{\text{hacim}}` | kesit alanı bölü hacim | kesit alanı bölü hacim ile orantılıdır | FIZ_MADDE |
| `\propto \frac{1}{a}` | bir bölü a | bir bölü a ile orantılıdır | FIZ_MADDE |
| `\quad \cos \alpha = \frac{\text{komşu}}{\text{hipotenüs}}` | eşittir komşu bölü hipotenüs | kosinüs alfa eşittir komşu bölü hipotenüs | GEO_OZEL_UCGEN |
| `\quad \cot \alpha = \frac{\text{komşu}}{\text{karşı}}` | eşittir komşu bölü karşı | kotanjant alfa eşittir komşu bölü karşı | GEO_OZEL_UCGEN |
| `\sin \alpha = \cos(90° - \alpha)` | eşittir parantez içinde doksan derece eksi | sinüs alfa eşittir kosinüs doksan derece eksi alfa | GEO_OZEL_UCGEN |
| `\sin \alpha = \frac{\text{karşı}}{\text{hipotenüs}}` | eşittir karşı bölü hipotenüs | sinüs alfa eşittir karşı bölü hipotenüs | GEO_OZEL_UCGEN |
| `\sin 120° = \sin 60°` | yüz yirmi derece eşittir altmış derece | sinüs yüz yirmi derece eşittir sinüs altmış derece | GEO_UCGEN_ALAN |
| `\sin 135° = \sin 45°` | yüz otuz beş derece eşittir kırk beş derece | sinüs yüz otuz beş derece eşittir sinüs kırk beş derece | GEO_UCGEN_ALAN |
| `\sin 150° = \sin 30° = \frac{1}{2}` | yüz elli derece eşittir otuz derece eşittir bir bölü iki | sinüs yüz elli derece eşittir sinüs otuz derece eşittir bir bölü iki | GEO_UCGEN_ALAN |
| `\sin 150° = \sin 30°` | yüz elli derece eşittir otuz derece | sinüs yüz elli derece eşittir sinüs otuz derece | GEO_ESKENAR_DORT, GEO_UCGEN_ALAN |
| `\sin 150° = \sin(180° - 150°) = \sin 30°` | yüz elli derece eşittir parantez içinde yüz seksen derece eksi yüz elli derece, eşittir otuz derece | sinüs yüz elli derece eşittir sinüs yüz seksen derece eksi yüz elli derece, eşittir sinüs otuz derece | GEO_UCGEN_ALAN |
| `\sin 30° = \frac{1}{2}` | otuz derece eşittir bir bölü iki | sinüs otuz derece eşittir bir bölü iki | GEO_UCGEN_ALAN |
| `\sin 45° = \frac{\sqrt{2}}{2}` | kırk beş derece eşittir karekök iki bölü iki | sinüs kırk beş derece eşittir karekök iki bölü iki | GEO_UCGEN_ALAN |
| `\sin 60° = \frac{\sqrt{3}}{2}` | altmış derece eşittir karekök üç bölü iki | sinüs altmış derece eşittir karekök üç bölü iki | GEO_UCGEN_ALAN |
| `\sin 90° = 1` | doksan derece eşittir bir | sinüs doksan derece eşittir bir | GEO_UCGEN_ALAN |
| `\sin A = \frac{12}{13}` | A eşittir on iki bölü on üç | sinüs A eşittir on iki bölü on üç | GEO_OZEL_UCGEN |
| `\sin(\widehat{A})` | parantez içinde A açısı | sinüs A açısı | GEO_OZEL_UCGEN |
| `\tan \alpha = \cot(90° - \alpha)` | eşittir parantez içinde doksan derece eksi | tanjant alfa eşittir kotanjant doksan derece eksi alfa | GEO_OZEL_UCGEN |
| `\tan \alpha = \frac{\text{karşı}}{\text{komşu}}` | eşittir karşı bölü komşu | tanjant alfa eşittir karşı bölü komşu | GEO_OZEL_UCGEN |
| `\tan 45° = 1` | kırk beş derece eşittir bir | tanjant kırk beş derece eşittir bir | GEO_ANALITIK |
| `\tan(\widehat{ADC}) = \frac{\|AH\|}{\|DH\|} = \frac{8}{4} = 2` | parantez içinde A D C açısı, eşittir A H uzunluğu bölü D H uzunluğu eşittir sekiz bölü dört eşittir iki | tanjant A D C açısı eşittir A H uzunluğu bölü D H uzunluğu eşittir sekiz bölü dört eşittir iki | GEO_OZEL_UCGEN |
| `\tan(\widehat{ADC})` | parantez içinde A D C açısı | tanjant A D C açısı | GEO_OZEL_UCGEN |
| `2\lambda` | iki | iki lamda | FIZ_ISI |
| `2\pi r \cdot \frac{\alpha}{360}` | iki pi r çarpı bölü üç yüz altmış | iki pi r çarpı alfa bölü üç yüz altmış | GEO_CEMBER |
| `2\pi r \cdot \frac{\alpha}{360°}` | iki pi r çarpı bölü üç yüz altmış derece | iki pi r çarpı alfa bölü üç yüz altmış derece | GEO_CEMBER |
| `3\alpha = 120°` | üç eşittir yüz yirmi derece | üç alfa eşittir yüz yirmi derece | GEO_ACIORTAY |
| `8 \cdot \cos 60° = 4` | sekiz çarpı altmış derece eşittir dört | sekiz çarpı kosinüs altmış derece eşittir dört | GEO_DELTOID |
| `90° - \alpha` | doksan derece eksi | doksan derece eksi alfa | GEO_ESLIK |
| `a \cdot h = a \cdot b \cdot \sin \alpha` | a çarpı h eşittir a çarpı b çarpı | a çarpı h eşittir a çarpı b çarpı sinüs alfa | GEO_PARALELKENAR |
| `A = \frac{1}{2} \cdot 8 \cdot 10 \cdot \sin 30° = 40 \cdot \frac{1}{2} = 20` | A eşittir bir bölü iki çarpı sekiz çarpı on çarpı otuz derece eşittir kırk çarpı bir bölü iki eşittir yirmi | A eşittir bir bölü iki çarpı sekiz çarpı on çarpı sinüs otuz derece eşittir kırk çarpı bir bölü iki eşittir yirmi | GEO_DORTGENLER |
| `A = \frac{1}{2} \cdot 8 \cdot 6 \cdot \sin 30° = 24 \cdot \frac{1}{2} = 12` | A eşittir bir bölü iki çarpı sekiz çarpı altı çarpı otuz derece eşittir yirmi dört çarpı bir bölü iki eşittir on iki | A eşittir bir bölü iki çarpı sekiz çarpı altı çarpı sinüs otuz derece eşittir yirmi dört çarpı bir bölü iki eşittir on iki | GEO_UCGEN_ALAN |
| `A = \frac{1}{2} \cdot b \cdot c \cdot \sin \alpha` | A eşittir bir bölü iki çarpı b çarpı c çarpı | A eşittir bir bölü iki çarpı b çarpı c çarpı sinüs alfa | GEO_UCGEN_ALAN |
| `A = \frac{1}{2} \cdot e \cdot f \cdot \sin \theta` | A eşittir bir bölü iki çarpı e çarpı f çarpı | A eşittir bir bölü iki çarpı e çarpı f çarpı sinüs teta | GEO_DORTGENLER |
| `A = \frac{1}{2} b c \sin \alpha` | A eşittir bir bölü iki b c | A eşittir bir bölü iki b c sinüs alfa | GEO_UCGEN_ALAN |
| `A = 36 \cdot \sin 150° = 36 \cdot \frac{1}{2} = 18` | A eşittir otuz altı çarpı yüz elli derece eşittir otuz altı çarpı bir bölü iki eşittir on sekiz | A eşittir otuz altı çarpı sinüs yüz elli derece eşittir otuz altı çarpı bir bölü iki eşittir on sekiz | GEO_ESKENAR_DORT |
| `A = 8 \cdot 6 \cdot \sin 30° = 48 \cdot \frac{1}{2} = 24` | A eşittir sekiz çarpı altı çarpı otuz derece eşittir kırk sekiz çarpı bir bölü iki eşittir yirmi dört | A eşittir sekiz çarpı altı çarpı sinüs otuz derece eşittir kırk sekiz çarpı bir bölü iki eşittir yirmi dört | GEO_PARALELKENAR |
| `A = a \cdot b \cdot \sin \alpha` | A eşittir a çarpı b çarpı | A eşittir a çarpı b çarpı sinüs alfa | GEO_PARALELKENAR |
| `A = a \cdot h = a \cdot b \cdot \sin \alpha` | A eşittir a çarpı h eşittir a çarpı b çarpı | A eşittir a çarpı h eşittir a çarpı b çarpı sinüs alfa | GEO_PARALELKENAR |
| `A = a^2 \cdot \sin \alpha` | A eşittir a kare çarpı | A eşittir a kare çarpı sinüs alfa | GEO_ESKENAR_DORT |
| `a^2 \cdot \sin 30° = 50` | a kare çarpı otuz derece eşittir elli | a kare çarpı sinüs otuz derece eşittir elli | GEO_ESKENAR_DORT |
| `a^2 \sin \alpha` | a kare | a kare sinüs alfa | GEO_ESKENAR_DORT |
| `ABC \cong CDE` | ABC CDE | ABC eştir CDE | GEO_ESLIK |
| `ABE \cong BCF` | ABE BCF | ABE eştir BCF | GEO_KARE |
| `ABE \sim DCE` | ABE DCE | ABE benzerdir DCE | GEO_ESLIK |
| `ADE \sim ABC` | ADE ABC | ADE benzerdir ABC | GEO_ESLIK |
| `AEC \sim DEB` | AEC DEB | AEC benzerdir DEB | GEO_CEMBER |
| `F \propto \frac{q_1 q_2}{d^2}` | F q bir q iki bölü d kare | F, q bir q iki bölü d kare ile orantılıdır | FIZ_ELEKTROSTATIK |
| `f = \frac{v}{\lambda}` | f eşittir v bölü | f eşittir v bölü lamda | FIZ_DALGA |
| `f_k = \mu_k N` | f k eşittir k N | f k eşittir mü k N | FIZ_HAREKET |
| `m = \frac{\Delta y}{\Delta x} = \tan \alpha` | m eşittir delta y bölü delta x eşittir | m eşittir delta y bölü delta x eşittir tanjant alfa | GEO_ANALITIK |
| `m = \tan 45° = 1` | m eşittir kırk beş derece eşittir bir | m eşittir tanjant kırk beş derece eşittir bir | GEO_ANALITIK |
| `m(\widehat{ACB}) = 90° - \alpha` | A C B açısı eşittir doksan derece eksi | A C B açısı eşittir doksan derece eksi alfa | GEO_ESLIK |
| `m(\widehat{ADB}) = \alpha + 30°` | A D B açısı eşittir artı otuz derece | A D B açısı eşittir alfa artı otuz derece | GEO_ACIORTAY |
| `m(\widehat{BAC}) = \alpha` | B A C açısı eşittir | B A C açısı eşittir alfa | GEO_ESLIK |
| `m(\widehat{BAD}) = m(\widehat{DAC}) = \alpha` | B A D açısı eşittir D A C açısı eşittir | B A D açısı eşittir D A C açısı eşittir alfa | GEO_ACIORTAY |
| `m(\widehat{ECD}) = \alpha` | E C D açısı eşittir | E C D açısı eşittir alfa | GEO_ESLIK |
| `m(\widehat{KBA}) = 90° - \alpha` | K B A açısı eşittir doksan derece eksi | K B A açısı eşittir doksan derece eksi alfa | GEO_KARE |
| `R = \rho \frac{L}{A}` | R eşittir L bölü A | R eşittir ro L bölü A | FIZ_ELEK_MANY |
| `v = \lambda \cdot f` | v eşittir çarpı f | v eşittir lamda çarpı f | FIZ_DALGA |
| `v = \lambda f = 2 \cdot 5 = 10` | v eşittir f eşittir iki çarpı beş eşittir on | v eşittir lamda f eşittir iki çarpı beş eşittir on | FIZ_DALGA |
| `v = \lambda f` | v eşittir f | v eşittir lamda f | FIZ_DALGA |
| `x = 180° - \alpha - (90° - \alpha) = 90°` | x eşittir yüz seksen derece eksi eksi parantez içinde doksan derece eksi, eşittir doksan derece | x eşittir yüz seksen derece eksi alfa eksi parantez içinde doksan derece eksi alfa, eşittir doksan derece | GEO_KARE |
| `x = m(\widehat{ADB}) = \alpha + 30°` | x eşittir A D B açısı eşittir artı otuz derece | x eşittir A D B açısı eşittir alfa artı otuz derece | GEO_ACIORTAY |

</details>

<details><summary>Doğru parçası ve ışın: [AB] → "A B", [AB → "A B ışını" (50)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `[AB] \parallel [CD]` | [a be] paraleldir [CD] | A B paraleldir C D | GEO_ESLIK |
| `[AB] \parallel [DC]` | [a be] paraleldir [DC] | A B paraleldir D C | GEO_YAMUK |
| `[AB] \perp [BD]` | [a be] diktir [BD] | A B diktir B D | GEO_ESLIK |
| `[AB]` | [a be] | A B | GEO_ACILAR_UCGENLER, GEO_ACIORTAY, GEO_ANALITIK, GEO_CEMBER, GEO_COKGEN, GEO_DIKDORTGEN, GEO_EK_CIZIM, GEO_ESKENAR_DORT, GEO_GRAFIK, GEO_KARE, GEO_KENARORTAY, GEO_MERKEZLER, GEO_OZEL_UCGEN, GEO_PARALELKENAR, GEO_YAMUK |
| `[AB` | [a be | A B ışını | GEO_MERKEZLER |
| `[AC] \perp [BD]` | [AC] diktir [BD] | A C diktir B D | GEO_DELTOID, GEO_DORTGENLER |
| `[AC] \perp [CE]` | [AC] diktir [CE] | A C diktir C E | GEO_ESLIK |
| `[AC]` | [AC] | A C | GEO_ACILAR_UCGENLER, GEO_ACIORTAY, GEO_ACI_KENAR, GEO_COKGEN, GEO_DELTOID, GEO_DORTGENLER, GEO_GRAFIK, GEO_KARE, GEO_KENARORTAY, GEO_MERKEZLER, GEO_UCGEN_ALAN, GEO_YAMUK |
| `[AD] \perp [BC]` | [AD] diktir [BC] | A D diktir B C | GEO_KENARORTAY |
| `[AD]` | [AD] | A D | GEO_ACILAR_UCGENLER, GEO_ACIORTAY, GEO_DIKDORTGEN, GEO_ESLIK, GEO_GRAFIK, GEO_KENARORTAY, GEO_YAMUK |
| `[AE]` | [AE] | A E | GEO_KARE |
| `[AF]` | [AF] | A F | GEO_KENARORTAY |
| `[AH] \perp [BC]` | [AH] diktir [BC] | A H diktir B C | GEO_OZEL_UCGEN |
| `[AR` | [AR | A R ışını | GEO_ACIORTAY |
| `[BA]` | [be a] | B A | GEO_EK_CIZIM |
| `[BC] = 12` | [BC] eşittir on iki | B C eşittir on iki | GEO_OZEL_UCGEN |
| `[BC]` | [BC] | B C | GEO_ACILAR_UCGENLER, GEO_ACIORTAY, GEO_EK_CIZIM, GEO_ESKENAR_DORT, GEO_ESLIK, GEO_GRAFIK, GEO_KENARORTAY, GEO_OZEL_UCGEN, GEO_PARALELKENAR, GEO_UCGEN_ACI, GEO_UCGEN_ALAN |
| `[BD]` | [BD] | B D | GEO_ACILAR_UCGENLER, GEO_ACIORTAY, GEO_DELTOID, GEO_DORTGENLER, GEO_ESKENAR_DORT, GEO_UCGEN_ACI |
| `[BE]` | [BE] | B E | GEO_DIKDORTGEN, GEO_KENARORTAY |
| `[BF]` | [BF] | B F | GEO_KARE |
| `[BH]` | [BH] | B H | GEO_OZEL_UCGEN |
| `[CB` | [CB | C B ışını | GEO_EK_CIZIM |
| `[CD]` | [CD] | C D | GEO_ACILAR_UCGENLER, GEO_CEMBER, GEO_UCGEN_ACI |
| `[CE]` | [CE] | C E | GEO_KARE |
| `[CF]` | [CF] | C F | GEO_KARE |
| `[DC] \parallel [AB]` | [DC] paraleldir [a be] | D C paraleldir A B | GEO_PARALELKENAR |
| `[DC]` | [DC] | D C | GEO_DIKDORTGEN, GEO_EK_CIZIM, GEO_PARALELKENAR |
| `[DE] \parallel [BC]` | [DE] paraleldir [BC] | D E paraleldir B C | GEO_ESLIK |
| `[DE]` | [DE] | D E | GEO_KENARORTAY |
| `[ED] \perp [BD]` | [ED] diktir [BD] | E D diktir B D | GEO_ESLIK |
| `[EF]` | [EF] | E F | GEO_PARALELKENAR |
| `[GD]` | [GD] | G D | GEO_KENARORTAY |
| `\text{der}[K] < \text{der}[B]` | der [K] küçüktür der [B] | K'nin derecesi küçüktür B'nin derecesi | MAT_POLINOM |
| `\text{der}[P \cdot Q] = \text{der}[P] + \text{der}[Q]` | der [P çarpı Q] eşittir der [P] artı der [Q] | P çarpı Q'nun derecesi eşittir P'nin derecesi artı Q'nun derecesi | MAT_POLINOM |
| `\text{der}[P \cdot Q] = 3 + 2 = 5` | der [P çarpı Q] eşittir üç artı iki eşittir beş | P çarpı Q'nun derecesi eşittir üç artı iki eşittir beş | MAT_POLINOM |
| `\text{der}[P \cdot Q]` | der [P çarpı Q] | P çarpı Q'nun derecesi | MAT_POLINOM |
| `\text{der}[P(Q(x))] = \text{der}[P] \cdot \text{der}[Q]` | der [P parantez içinde Q x, ] eşittir der [P] çarpı der [Q] | P Q x'in derecesi eşittir P'nin derecesi çarpı Q'nun derecesi | MAT_POLINOM |
| `\text{der}[P(Q)]` | der [ P Q ] | P Q'nun derecesi | MAT_POLINOM |
| `\text{der}[P(x^2)] = 3 \cdot 2 = 6` | der [ P x kare ] eşittir üç çarpı iki eşittir altı | P x karenin derecesi eşittir üç çarpı iki eşittir altı | MAT_POLINOM |
| `C \in [BD]` | C elemanıdır [BD] | C elemanıdır B D | GEO_ESLIK |
| `D \in [AB]` | D elemanıdır [a be] | D elemanıdır A B | GEO_UCGEN_ALAN |
| `D \in [BC]` | D elemanıdır [BC] | D elemanıdır B C | GEO_ACIORTAY, GEO_KENARORTAY, GEO_OZEL_UCGEN, GEO_UCGEN_ALAN |
| `d \parallel [BC]` | d paraleldir [BC] | d paraleldir B C | GEO_UCGEN_ALAN |
| `E \in [AC]` | E elemanıdır [AC] | E elemanıdır A C | GEO_UCGEN_ALAN |
| `E \in [AD]` | E elemanıdır [AD] | E elemanıdır A D | GEO_KARE |
| `E \in [BC]` | E elemanıdır [BC] | E elemanıdır B C | GEO_DELTOID, GEO_KARE |
| `E \in [DC]` | E elemanıdır [DC] | E elemanıdır D C | GEO_DIKDORTGEN |
| `F \in [AB]` | F elemanıdır [a be] | F elemanıdır A B | GEO_KARE |
| `F \in [CD]` | F elemanıdır [CD] | F elemanıdır C D | GEO_DELTOID, GEO_KARE |
| `P \in [BC]` | P elemanıdır [BC] | P elemanıdır B C | GEO_GRAFIK |

</details>

<details><summary>Aralıklar: "a kapalı b açık aralığı" (10)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `(-3, 4]` | parantez içinde eksi üç, dört] | eksi üç açık dört kapalı aralığı | MAT_ESITSIZLIK |
| `(2, \infty)` | parantez içinde iki, sonsuz | iki, sonsuz açık aralığı | MAT_ESITSIZLIK |
| `(2, 7]` | parantez içinde iki, yedi] | iki açık yedi kapalı aralığı | MAT_ESITSIZLIK |
| `[-1, 4]` | [ eksi bir, dört] | eksi bir, dört kapalı aralığı | MAT_ESITSIZLIK |
| `[-1, 6)` | [ eksi bir, altı | eksi bir kapalı altı açık aralığı | MAT_ESITSIZLIK |
| `[0, 4)` | [sıfır, dört | sıfır kapalı dört açık aralığı | MAT_ESITSIZLIK |
| `[0, 9)` | [sıfır, dokuz | sıfır kapalı dokuz açık aralığı | MAT_ESITSIZLIK |
| `[2, 5)` | [iki, beş | iki kapalı beş açık aralığı | MAT_ESITSIZLIK |
| `[2, 5]` | [iki, beş] | iki, beş kapalı aralığı | MAT_ESITSIZLIK |
| `[a, b]` | [a, b] | a, b kapalı aralığı | MAT_ESITSIZLIK |

</details>

<details><summary>Binlik boşluk: 12\,000 → "on iki bin" (önce "on iki virgül sıfır sıfır sıfır") (19)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `= 100\,000` | eşittir yüz virgül sıfır sıfır sıfır | eşittir yüz bin | MAT_ORAN |
| `= 12\,000 \cdot 0{,}75 = 9000` | eşittir on iki virgül sıfır sıfır sıfır çarpı sıfır virgül yetmiş beş eşittir dokuz bin | eşittir on iki bin çarpı sıfır virgül yetmiş beş eşittir dokuz bin | FIZ_HAREKET |
| `= 4{,}5 \cdot 200\,000 = 900\,000` | eşittir dört virgül beş çarpı iki yüz virgül sıfır sıfır sıfır eşittir dokuz yüz virgül sıfır sıfır sıfır | eşittir dört virgül beş çarpı iki yüz bin eşittir dokuz yüz bin | MAT_ORAN |
| `10\,000` | on virgül sıfır sıfır sıfır | on bin | FIZ_BASINC, FIZ_ISI |
| `100\,000` | yüz virgül sıfır sıfır sıfır | yüz bin | FIZ_BASINC |
| `12\,000` | on iki virgül sıfır sıfır sıfır | on iki bin | FIZ_HAREKET |
| `14\,000` | on dört virgül sıfır sıfır sıfır | on dört bin | FIZ_ISI |
| `15\,000` | on beş virgül sıfır sıfır sıfır | on beş bin | FIZ_BASINC |
| `18\,000` | on sekiz virgül sıfır sıfır sıfır | on sekiz bin | FIZ_ISI |
| `20\,000` | yirmi virgül sıfır sıfır sıfır | yirmi bin | FIZ_BASINC |
| `3\,000\,000` | üç virgül sıfır sıfır sıfır,sıfır sıfır sıfır | üç milyon | FIZ_BASINC |
| `30\,000` | otuz virgül sıfır sıfır sıfır | otuz bin | FIZ_BASINC |
| `300\,000` | üç yüz virgül sıfır sıfır sıfır | üç yüz bin | FIZ_BASINC |
| `36\,000 \cdot \frac{1}{3} = 12\,000` | otuz altı virgül sıfır sıfır sıfır çarpı bir bölü üç eşittir on iki virgül sıfır sıfır sıfır | otuz altı bin çarpı bir bölü üç eşittir on iki bin | MAT_VERI_IST |
| `40\,000` | kırk virgül sıfır sıfır sıfır | kırk bin | FIZ_BASINC |
| `60\,000` | altmış virgül sıfır sıfır sıfır | altmış bin | FIZ_BASINC |
| `900\,000 \div 100\,000 = 9` | dokuz yüz virgül sıfır sıfır sıfır bölü yüz virgül sıfır sıfır sıfır eşittir dokuz | dokuz yüz bin bölü yüz bin eşittir dokuz | MAT_ORAN |
| `F_2 = 10\,000` | F iki eşittir on virgül sıfır sıfır sıfır | F iki eşittir on bin | FIZ_BASINC |
| `P = 3 \cdot 1000 \cdot 10 = 30\,000` | P eşittir üç çarpı bin çarpı on eşittir otuz virgül sıfır sıfır sıfır | P eşittir üç çarpı bin çarpı on eşittir otuz bin | FIZ_BASINC |

</details>

<details><summary>Cebirdeki harf birim sanılmıyor: 2m → "iki m" (önce "iki metre") (11)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `\Delta = 36 - 4m > 0` | delta eşittir otuz altı eksi dört metre büyüktür sıfır | delta eşittir otuz altı eksi dört m büyüktür sıfır | MAT_IKINCI_DER |
| `2m` | iki metre | iki m | FIZ_IS_ENERJI |
| `3n \cdot r = \frac{6}{5} \cdot 4n \cdot m \Rightarrow 3r = \frac{24}{5}m` | üç n çarpı r eşittir altı bölü beş çarpı dört n çarpı m ise üç r eşittir yirmi dört bölü beş metre | üç n çarpı r eşittir altı bölü beş çarpı dört n çarpı m ise üç r eşittir yirmi dört bölü beş m | MAT_ORAN |
| `4a + 2m = 74` | dört a artı iki metre eşittir yetmiş dört | dört a artı iki m eşittir yetmiş dört | MAT_PROBLEM |
| `4m < 36 \Rightarrow m < 9` | dört metre küçüktür otuz altı ise m küçüktür dokuz | dört m küçüktür otuz altı ise m küçüktür dokuz | MAT_IKINCI_DER |
| `E_K = \frac{1}{2} m (2v)^2 = 2 m v^2` | E K eşittir bir bölü iki metre parantez içinde iki v, kare eşittir iki metre v kare | E K eşittir bir bölü iki m parantez içinde iki v, kare eşittir iki m v kare | FIZ_IS_ENERJI |
| `E_K = \frac{1}{2} m v^2` | E K eşittir bir bölü iki metre v kare | E K eşittir bir bölü iki m v kare | FIZ_IS_ENERJI |
| `E_L = \frac{1}{2} (2m) v^2 = m v^2` | E L eşittir bir bölü iki parantez içinde iki metre, v kare eşittir m v kare | E L eşittir bir bölü iki parantez içinde iki m, v kare eşittir m v kare | FIZ_IS_ENERJI |
| `m g h = \frac{1}{2} m v^2` | m g h eşittir bir bölü iki metre v kare | m g h eşittir bir bölü iki m v kare | FIZ_IS_ENERJI |
| `m_1 m_2 = -1` | m bir metre iki eşittir eksi bir | m bir m iki eşittir eksi bir | GEO_ANALITIK |
| `r = \frac{8}{5}m` | r eşittir sekiz bölü beş metre | r eşittir sekiz bölü beş m | MAT_ORAN |

</details>

<details><summary>Kimya: iyon yükü, tepkime oku, hâl, çekirdek gösterimi (29)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `{}_{8}\text{O}^{2-}` | sekiz O üssü iki eksi | sekiz O iki eksi | KIM_ETKILESIM |
| `{}^{12}_{6}\text{C}` | üssü on iki altı C | kütle numarası on iki, atom numarası altı olan C | KIM_ATOM |
| `{}^{12}\text{C}` | üssü on iki C | on iki C | KIM_ATOM |
| `{}^{14}_{6}\text{C}` | üssü on dört altı C | kütle numarası on dört, atom numarası altı olan C | KIM_ATOM |
| `{}^{14}_{7}\text{N}` | üssü on dört yedi N | kütle numarası on dört, atom numarası yedi olan N | KIM_ATOM |
| `{}^{14}\text{C}` | üssü on dört C | on dört C | KIM_ATOM |
| `{}^{14}\text{N}` | üssü on dört N | on dört N | KIM_ATOM |
| `{}^{23}_{11}\text{Na}^+` | üssü yirmi üç on bir Na üssü artı | kütle numarası yirmi üç, atom numarası on bir olan Na artı | KIM_ATOM |
| `\dfrac{m_\text{Mg}}{m_\text{O}} = \dfrac{3}{2}` | m M g bölü m O eşittir üç bölü iki | m Mg bölü m O eşittir üç bölü iki | KIM_KANUN |
| `\text{Al}^{3+}` | Al üssü üç artı | Al üç artı | KIM_ETKILESIM |
| `\text{ATP} \rightarrow \text{ADP} + \text{P} + \text{enerji}` | ATP, sonra ADP artı P artı enerji | ATP'den ADP ve P ve enerji oluşur | BIO_BILESEN |
| `\text{Ca}^{2+}` | Ca üssü iki artı | Ca iki artı | KIM_DOGA |
| `\text{CaCl}_2 \rightarrow \text{Ca}^{2+} + 2\text{Cl}^-` | CaCl iki, sonra Ca üssü iki artı artı iki Cl üssü eksi | CaCl ikiden Ca iki artı ve iki Cl eksi oluşur | KIM_KARISIM |
| `\text{CaCO}_3 \rightarrow \text{CaO} + \text{CO}_2` | CaCO üç, sonra CaO artı CO iki | CaCO üçten CaO ve CO iki oluşur | KIM_HERYER |
| `\text{CaCO}_3(k) \rightarrow \text{CaO}(k) + \text{CO}_2(g)` | CaCO üç parantez içinde k, sonra CaO parantez içinde k, artı CO iki parantez içinde g | CaCO üç katıdan CaO katı ve CO iki gaz oluşur | KIM_HESAP |
| `\text{F}^-` | F üssü eksi | F eksi | KIM_ETKILESIM |
| `\text{H}^+` | H üssü artı | H artı | KIM_ASIT_BAZ |
| `\text{KNO}_3 \rightarrow \text{K}^+ + \text{NO}_3^-` | KNO üç, sonra K üssü artı artı NO üç üssü eksi | KNO üçten K artı ve NO üç eksi oluşur | KIM_KARISIM |
| `\text{Mg}^{2+}` | Mg üssü iki artı | Mg iki artı | KIM_DOGA, KIM_ETKILESIM |
| `\text{N}_2(g) + 3\text{H}_2(g) \rightarrow 2\text{NH}_3(g)` | N iki parantez içinde g, artı üç H iki parantez içinde g, sonra iki NH üç parantez içinde g | N iki gaz ve üç H iki gazdan iki NH üç gaz oluşur | KIM_HESAP, KIM_KANUN |
| `\text{Na}^+` | Na üssü artı | Na artı | KIM_ATOM |
| `\text{NaCl} \rightarrow \text{Na}^+(suda) + \text{Cl}^-(suda)` | NaCl, sonra Na üssü artı parantez içinde suda, artı Cl üssü eksi parantez içinde suda | NaCl'den Na artı suda ve Cl eksi suda oluşur | KIM_KARISIM |
| `\text{NaClO} + 2\text{HCl} \rightarrow \text{NaCl} + \text{Cl}_2 + \text{H}_2\text{O}` | NaClO artı iki HCl, sonra NaCl artı Cl iki artı H iki O | NaClO ve iki HCl'den NaCl ve Cl iki ve H iki O oluşur | KIM_DOGA |
| `\text{O}^{2-}` | O üssü iki eksi | O iki eksi | KIM_ETKILESIM |
| `\text{OH}^-` | OH üssü eksi | OH eksi | KIM_ASIT_BAZ |
| `2\text{H}_2 + \text{O}_2 \rightarrow 2\text{H}_2\text{O}` | iki H iki artı O iki, sonra iki H iki O | iki H iki ve O ikiden iki H iki O oluşur | KIM_KANUN |
| `2\text{H}_2(g) + \text{O}_2(g) \rightarrow 2\text{H}_2\text{O}(g)` | iki H iki parantez içinde g, artı O iki parantez içinde g, sonra iki H iki O parantez içinde g | iki H iki gaz ve O iki gazdan iki H iki O gaz oluşur | KIM_HESAP |
| `2\text{H}_2(g) + \text{O}_2(g) \rightarrow 2\text{H}_2\text{O}(s)` | iki H iki parantez içinde g, artı O iki parantez içinde g, sonra iki H iki O parantez içinde s | iki H iki gaz ve O iki gazdan iki H iki O sıvı oluşur | KIM_HESAP |
| `a\,\text{C}_2\text{H}_6 + b\,\text{O}_2 \rightarrow c\,\text{CO}_2 + d\,\text{H}_2\text{O}` | a, C iki H altı artı b, O iki, sonra c, CO iki artı d, H iki O | a C iki H altı ve b O ikiden c CO iki ve d H iki O oluşur | KIM_HESAP |

</details>

<details><summary>Üs işareti (′): geometride "üssü", kümede "tümleyen", ℚ′ "irrasyonel sayılar" (12)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `\mathbb{Q} \cup \mathbb{Q}' = \mathbb{R}` | rasyonel sayılar birleşim rasyonel sayılar ' eşittir reel sayılar | rasyonel sayılar birleşim irrasyonel sayılar eşittir reel sayılar | MAT_TEMEL |
| `\mathbb{Q}'` | rasyonel sayılar ' | irrasyonel sayılar | MAT_TEMEL |
| `\|AC'\|` | mutlak değer A C tümleyen | A C üssü uzunluğu | GEO_DIKDORTGEN |
| `\|AP\| + \|PB\| = \|AP\| + \|PB'\| \ge \|AB'\|` | A P uzunluğu artı P B uzunluğu eşittir A P uzunluğu artı mutlak değer P B tümleyen, büyük eşit mutlak değer A B tümleyen | A P uzunluğu artı P B uzunluğu eşittir A P uzunluğu artı P B üssü uzunluğu büyük eşit A B üssü uzunluğu | GEO_EK_CIZIM |
| `\|BC'\| = \|BC\| = 10` | mutlak değer B C tümleyen, eşittir B C uzunluğu eşittir on | B C üssü uzunluğu eşittir B C uzunluğu eşittir on | GEO_DIKDORTGEN |
| `\|BC'\| = \|BC\|` | mutlak değer B C tümleyen, eşittir B C uzunluğu | B C üssü uzunluğu eşittir B C uzunluğu | GEO_DIKDORTGEN |
| `A'` | A tümleyen | A üssü | MAT_KUME |
| `ABC'` | a be C tümleyen | ABC üssü | GEO_DIKDORTGEN |
| `B'` | B tümleyen | B üssü | GEO_EK_CIZIM |
| `C'` | C tümleyen | C üssü | GEO_DIKDORTGEN |
| `F' = 2 \cdot 4 \cdot F = 8F` | F tümleyen eşittir iki çarpı dört çarpı F eşittir sekiz F | F üssü eşittir iki çarpı dört çarpı F eşittir sekiz F | FIZ_ELEKTROSTATIK |
| `h'` | h' | h üssü | GEO_KATI |

</details>

<details><summary>Fonksiyon değeri ve bileşke: "f g x", "parantez içinde f bileşke g, 2" (13)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `(f \cdot g)(1) = (1 + a)(a + 1) = (a + 1)^2` | parantez içinde f çarpı g, parantez içinde bir, eşittir parantez içinde bir artı a, parantez içinde a artı bir, eşittir parantez içinde a artı bir, kare | parantez içinde f çarpı g, bir eşittir parantez içinde bir artı a, parantez içinde a artı bir, eşittir parantez içinde a artı bir, kare | MAT_FONK |
| `(f \cdot g)(1) = (f + g)(3)` | parantez içinde f çarpı g, parantez içinde bir, eşittir parantez içinde f artı g, parantez içinde üç | parantez içinde f çarpı g, bir eşittir parantez içinde f artı g, üç | MAT_FONK |
| `(f \cdot g)(x) = f(x) \cdot g(x)` | parantez içinde f çarpı g, parantez içinde x, eşittir f x çarpı g x | parantez içinde f çarpı g, x eşittir f x çarpı g x | MAT_FONK |
| `(f \circ f^{-1})(5)` | parantez içinde f bileşke f tersi, parantez içinde beş | parantez içinde f bileşke f tersi, beş | MAT_FONK |
| `(f \circ g)(2) + (g \circ f)(1)` | parantez içinde f bileşke g, parantez içinde iki, artı parantez içinde g bileşke f, parantez içinde bir | parantez içinde f bileşke g, iki artı parantez içinde g bileşke f, bir | MAT_FONK |
| `(f \circ g)(2) = f(g(2)) = f(1) = 3` | parantez içinde f bileşke g, parantez içinde iki, eşittir f parantez içinde g iki, eşittir f bir eşittir üç | parantez içinde f bileşke g, iki eşittir f g iki eşittir f bir eşittir üç | MAT_FONK |
| `(f \circ g)(x) = f(g(x))` | parantez içinde f bileşke g, parantez içinde x, eşittir f parantez içinde g x | parantez içinde f bileşke g, x eşittir f g x | MAT_FONK |
| `(f + g)(3) = (3 + a) + (3a + 1) = 4a + 4` | parantez içinde f artı g, parantez içinde üç, eşittir parantez içinde üç artı a, artı parantez içinde üç a artı bir, eşittir dört a artı dört | parantez içinde f artı g, üç eşittir parantez içinde üç artı a, artı parantez içinde üç a artı bir, eşittir dört a artı dört | MAT_FONK |
| `(f + g)(x) = f(x) + g(x)` | parantez içinde f artı g, parantez içinde x, eşittir f x artı g x | parantez içinde f artı g, x eşittir f x artı g x | MAT_FONK |
| `(g \circ f)(1) = g(f(1)) = g(3) = 6` | parantez içinde g bileşke f, parantez içinde bir, eşittir g parantez içinde f bir, eşittir g üç eşittir altı | parantez içinde g bileşke f, bir eşittir g f bir eşittir g üç eşittir altı | MAT_FONK |
| `P\left(-\frac{b}{a}\right)` | P parantez içinde eksi b bölü a | P eksi b bölü a | MAT_POLINOM |
| `P\left(\frac{1}{2}\right) = 8 \cdot \frac{1}{8} - 4 \cdot \frac{1}{2} + 3 = 1 - 2 + 3 = 2` | P parantez içinde bir bölü iki, eşittir sekiz çarpı bir bölü sekiz eksi dört çarpı bir bölü iki artı üç eşittir bir eksi iki artı üç eşittir iki | P bir bölü iki, eşittir sekiz çarpı bir bölü sekiz eksi dört çarpı bir bölü iki artı üç eşittir bir eksi iki artı üç eşittir iki | MAT_POLINOM |
| `R(x) = P(P(x))` | R x eşittir P parantez içinde P x | R x eşittir P P x | MAT_POLINOM |

</details>

<details><summary>Ok (→): ", sonra" yerine "ise" (11)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `7^1 \to 7` | yedi üssü bir, sonra yedi | yedi üssü bir ise yedi | MAT_MODULER |
| `7^2 \to 9` | yedi kare, sonra dokuz | yedi kare ise dokuz | MAT_MODULER |
| `7^3 \to 3` | yedi küp, sonra üç | yedi küp ise üç | MAT_MODULER |
| `7^4 \to 1` | yedi üssü dört, sonra bir | yedi üssü dört ise bir | MAT_MODULER |
| `a = 3 \to 6` | a eşittir üç, sonra altı | a eşittir üç ise altı | MAT_BASAMAK |
| `a = 4 \to 4` | a eşittir dört, sonra dört | a eşittir dört ise dört | MAT_BASAMAK |
| `a = 6 \to 3` | a eşittir altı, sonra üç | a eşittir altı ise üç | MAT_BASAMAK |
| `a = 7 \to b = 8` | a eşittir yedi, sonra b eşittir sekiz | a eşittir yedi ise b eşittir sekiz | MAT_VERI_IST |
| `a = 8 \to b = 12` | a eşittir sekiz, sonra b eşittir on iki | a eşittir sekiz ise b eşittir on iki | MAT_VERI_IST |
| `d = 300 \to x = 900` | d eşittir üç yüz, sonra x eşittir dokuz yüz | d eşittir üç yüz ise x eşittir dokuz yüz | MAT_MUTLAK |
| `d = 450 \to x = 750` | d eşittir dört yüz elli, sonra x eşittir yedi yüz elli | d eşittir dört yüz elli ise x eşittir yedi yüz elli | MAT_MUTLAK |

</details>

<details><summary>Diğer düzeltmeler (7)</summary>

| Formül | Önce | Şimdi | Konu |
|---|---|---|---|
| `(1{,}1a)^2 = 1{,}21\,a^2` | parantez içinde bir virgül bir a, kare eşittir bir virgül yirmi bir,a kare | parantez içinde bir virgül bir a, kare eşittir bir virgül yirmi bir a kare | GEO_KARE |
| `\sqrt[n]{a^m} = a^{\frac{m}{n}}` | n. dereceden kök a üssü m eşittir a üssü m bölü n | n'inci dereceden kök a üssü m eşittir a üssü m bölü n | MAT_KOKLU |
| `1{,}2a \cdot 0{,}8b = 0{,}96\,ab` | bir virgül iki a çarpı sıfır virgül sekiz b eşittir sıfır virgül doksan altı,ab | bir virgül iki a çarpı sıfır virgül sekiz b eşittir sıfır virgül doksan altı ab | GEO_DIKDORTGEN |
| `2,8,1` | iki virgül sekiz,bir | iki, sekiz, bir | KIM_ATOM |
| `2,8,6` | iki virgül sekiz,altı | iki, sekiz, altı | KIM_ATOM |
| `2,8,8,1` | iki virgül sekiz,sekiz virgül bir | iki, sekiz, sekiz, bir | KIM_ATOM |
| `2:1:2` | iki:bir:iki | iki: bir: iki | KIM_KANUN |

</details>


## Nasıl değiştirilir

- Okunuş kuralları `src/Schemas/MathSpeech.ts` dosyasında. Formülün çevresindeki sözcükler, birimler ve sayılar `src/Schemas/SpokenText.ts` dosyasında.
- `tests/Schemas/MathSpeech.test.ts` iki tabloyu korur: bu belgedeki AYT formülleri ve senaryolardaki her formülün onaylı okunuşu. Bir okunuş değişirse test kırılır; önce bu belge güncellenir.
- Yeni bir senaryo formülü için teste satır eklemek gerekmez. Ama hiçbir formül sese `\`, `{`, `}`, `^`, `_`, `$` ya da rakam bırakamaz; aynı test bunu bütün senaryolarda denetler.
