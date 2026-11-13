# Hareket standardı (web ve mobil)

10 Kasım 2026. Uygulamadaki her hareketin tek kaynağı. Değerler [`src/UIUX/Tokens.ts`](../../src/UIUX/Tokens.ts) içinde, `UI_MOTION` ve `UI_MOTION_MOMENTS` adlarıyla durur. Web (Tailwind/CSS değişkenleri) ve mobil (Reanimated sabitleri) bu tabloyu kendi dosyalarına kopyalar; bileşen kendi süresini ve eğrisini seçmez.

Kaynak: [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT). Oradaki animate, animate-expo, choreograph, gestures, animation-performance ve review-animations kuralları Sınavika'nın UI/UX kurallarıyla birleştirildi. Amaç daha çok hareket değil; uygulamanın doğal, hızlı ve sakin hissettirmesi.

## 1. Temel kurallar

**Hareket mi, değil mi?**
- Her hareketin bir işi olmalı: geri bildirim, yer duygusu (nereden geldi, nereye gitti), durum değişimi ya da sert bir değişimi yumuşatmak.
- Bunlardan birini yapmayan hareket eklenmez.
- Günde yüzlerce kez yapılan ya da klavyeyle tetiklenen eylem canlanmaz. Örnekler: sekme değiştirme, şık seçme, sayfa içinde gezinme.
- Öğrencinin okuduğu veri (soru, şık, puan, tablo) yerinden oynamaz.
- Bir ekranda aynı anda en çok 1–2 öğe hareket eder.
- Sürekli dönen hareket yalnız iki yerde vardır: yükleniyor logosu (ortada dönen saatli logo) ve SinoAI'nin "düşünüyor" noktaları.

**Eğri ve süre**
- Giriş ve çıkış yavaş biter (`easing.out`). Ekranda zaten duran bir şey yer değiştirirken `easing.inOut` kullanılır. Alt sayfa ve çekmece `easing.sheet` ile açılır.
- Arayüzde yavaş başlayan eğri (ease-in) yoktur; geç kalmış hissettirir. Önceki kural "gidişte hızlanan eğri" diyordu, 10 Kasım'da değişti.
- Ürün arayüzündeki hareket 300 ms'yi geçmez. Yalnız alt sayfa (320 ms) ve parmak bırakıldıktan sonraki yay daha uzun sürer.
- Çıkış girişten kısadır (yaklaşık üçte ikisi) ve geldiği yöne gider.
- Yay (spring) zıplamaz: `dampingRatio` 0,8–1.

**Biçim**
- Hiçbir şey sıfırdan büyümez. Giriş 0,96 ölçekten ve görünmezden başlar, 8 pt kayar.
- Basılan düğme ya da kart 0,97'ye iner.
- Açılır menü ve ipucu, kendisini açan öğenin yanından büyür. Ortadaki pencere (modal) ortadan büyür.
- Yalnız `transform` ve `opacity` canlanır. Genişlik, yükseklik, kenar boşluğu, `top/left` ve gölge canlanmaz. Gölge gerekiyorsa `filter: drop-shadow` kullanılır.

**Sıra (stagger)**
- Bir kapsayıcı tek girişle gelir. Hem kapsayıcı hem içindekiler ayrı ayrı canlanmaz.
- Liste öğeleri 50 ms arayla gelir. Bütün grup 300 ms içinde biter. Önemli öğe önce ve biraz daha belirgin gelir.
- Çıkışlar sırasız, hepsi birlikte ve kısa olur.

**Parmak**
- Sürüklerken öğe parmağı birebir izler; eğri ya da gecikme olmaz.
- Bırakınca parmağın hızını taşıyan bir yay devralır.
- Alt sayfa ya da kart iki durumda kapanır: yolun %45'i geçilince ya da 500 pt/sn'den hızlı fiske atılınca.
- Kenardan öteye çekişte öğe parmağın 0,2'si kadar gider (lastik etkisi).
- Dokunma alanı en az 44 pt (Android'de 48 dp).

**Titreşim (haptik)**
- Değişimle aynı karede, eylem başına bir kez verilir. Hiçbir zaman tek geri bildirim olmaz.
- Doğru cevapta hafif, yanlışta uyarı titreşimi verilir. Bu, rehberdeki kuralın aynısı.

**Hareketi azalt**
- Sistemde açıksa soluklaşma kalır; kayma, ölçek ve fiske kalkar.
- Geçişler en çok 150 ms sürer; ekran geçişleri yalnız soluklaşmadır.
- Parmak takibi çalışmaya devam eder.

**Performans**
- 60 Hz'de kare başına 16,7 ms, 120 Hz'de 8 ms bütçe vardır; küçük olana göre tasarlanır.
- Mobilde Reanimated kullanılır ve hareket UI iş parçacığında kalır. Kare başına `setState` ya da `runOnJS` çağrılmaz.
- Web'de `transition: all` yoktur. `will-change` yalnız ölçülmüş bir takılmada kullanılır.
- Bulanıklık canlanacaksa 20 px'in altında kalır.
- Alt sayfa ve çekmecede bulanıklık yoğunluğu ve Android gölgesi (elevation) canlanmaz.
- His en yavaş desteklenen telefonda, sürüm derlemesinde denenir (Expo Go'da değil).

## 2. Jetonlar

| Ad | Değer |
|---|---|
| `easing.out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `easing.inOut` | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `easing.sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| `duration.press` | 140 ms |
| `duration.toggle` / `popover` | 180 ms |
| `duration.menu` | 200 ms |
| `duration.enter` | 240 ms |
| `duration.screen` / `modal` | 280 ms |
| `duration.sheet` | 320 ms |
| `duration.exit` | 180 ms |
| `duration.max` | 300 ms (gerekçesiz üst sınır) |
| `stagger.step` / `groupMax` | 50 ms / 300 ms |
| `distance.enter` / `float` | 8 pt / 12 pt |
| `scale.press` / `enter` | 0,97 / 0,96 |
| `spring.settle` | 400 ms, sönüm 1 |
| `spring.snapBack` | 400 ms, sönüm 0,8, parmağın hızıyla |
| `spring.sheet` | 300 ms, sönüm 0,8 |
| `gesture.dismissDistance` / `dismissVelocity` | %45 / 500 pt/sn |
| `gesture.rubberBand` / `minTarget` | 0,2 / 44 pt |
| `reduced.duration` | 150 ms |

## 3. Sınavika anları

| An | Hareket | Titreşim |
|---|---|---|
| Sekme değiştirme | Yok | Seçim |
| Şık seçme | Basma (0,97) | Seçim |
| Doğru cevap (Testler, Dersler) | Tik ve yumuşak yeşil dolgu, 240 ms | Hafif darbe |
| Yanlış cevap (Testler, Dersler) | Çarpı ve kırmızı dolgu, 240 ms; sallanma yok | Uyarı |
| Sonraki soru | Eski 180 ms'de çıkar, yeni 8 pt sağdan 240 ms'de gelir | Yok |
| Görev tamamlandı (Ders Planı) | Tik 240 ms'de çizilir, satır "bitti" görünümüne geçer | Başarı |
| İlerleme artışı | Çubuk bir kez 600 ms'de dolar, sayı onunla birlikte sayar | Yok |
| Rozet kazanıldı | 0,96'dan ve görünmezden 320 ms; bir kez ışıldar | Başarı |
| SinoAI mesajı | 8 pt yükselerek 240 ms; metin akarak gelir | Yok |
| SinoAI düşünüyor | Üç nokta (izinli tek döngü, yükleniyor dışında) | Yok |
| Alt sayfa | Sayfa eğrisi, 320 ms; parmağı izler; %45 ya da fiskeyle kapanır | Yok |
| Yükleniyor (ilk yükleme) | Sayfanın ya da bölümün ortasında dönen saatli logo; iskelet yok (sahibin kararı, 11 Kasım 2026) | Yok |
| Yenileniyor (içerik zaten var) | İçerik yerinde kalır; üstte küçük gösterge | Yok |

**Deneme:** Çözülürken doğru ya da yanlış gösterilmez (UIUX-Rehberi §5.4.1). Deneme ekranında yalnız şık seçme ve sonraki soru anları vardır.

## 4. Denetim listesi (inceleme için)

Bir ekranın hareketi incelenirken aşağıdakilerden biri varsa düzeltilir:

- `transition: all` var.
- `scale(0)` ya da sıfırdan büyüme var.
- Arayüzde ease-in eğrisi var.
- Sık yapılan ya da klavyeyle tetiklenen eylem canlanıyor.
- Gerekçesiz 300 ms'den uzun hareket var.
- Açılır menü ortadan büyüyor.
- Genişlik, yükseklik ya da kenar boşluğu canlanıyor.
- "Hareketi azalt" desteği yok.
- Üzerine gelme (hover) etkisi dokunmatik ekranda da tetikleniyor. Web'de `@media (hover: hover) and (pointer: fine)` gerekir.
- Her şey aynı anda giriyor.
- Çıkış girişten uzun.

Düzeltme sırası:
1. Gereksizse sil.
2. Kısalt.
3. Eğriyi düzelt.
4. Büyüme noktasını düzelt.
5. Yarıda kesilebilir yap.
6. `transform` ve `opacity`'ye taşı.

Mobil ve web oturumlarında [emilkowalski/skills](https://github.com/emilkowalski/skills) kurulursa (`npx skills@latest add emilkowalski/skills`) review-animations ve animation-performance bu listeyle birlikte kullanılır; değerler bu belgedeki jetonlardır.
