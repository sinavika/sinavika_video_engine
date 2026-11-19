# UI/UX kodlama belgeleri (mobil ve web)

Güncelleme: 17 Kasım 2026 · Kaynak: `sinavika_video_engine/src/UIUX` · Çizimler: `Desktop\Sinavika-UIUX3`

Bu klasör, Sınavika'nın UI/UX çizimlerini metne çevirir. Mobil (React Native) ve öğrenci web (Next.js) kodu yazılırken görsel okunamadığı için her ekran burada yazıyla tanımlanır: yerleşim, metinler (TR ve EN), bileşenler, renk jetonları, veri, etkileşimler, geçişler, hâller ve kabul testleri. Ekranı görmeden bu belgeyle çizimdekiyle aynı ekran kurulabilmelidir.

Doğruluk sırası:
1. Çizimin kodu (`src/UIUX`).
2. Bu belgeler.
3. PNG'ler.

Belge ile PNG çelişirse çizim kodu esastır. Çizimlerdeki ad, sayı, tarih ve fiyatlar örnektir; hangi alanın veriden geldiği her ekranın **Veri** maddesinde yazar.

## 1. Dosyalar

| Dosya | Kapsam |
|---|---|
| [Navigasyon.md](Navigasyon.md) | Mobil ve web gezinme ağacı, geçiş türleri, geri davranışı, korumalar (giriş, onboarding, abonelik), bildirim ve bağlantı hedefleri, takılma ve kilitlenme kuralları |
| [01-Bugun.md](01-Bugun.md) | Modüller ana ekranı (Bugün): dört hâl, ipucu, kaydırılmış hâl; web ana sayfa; tablet |
| [02-Giris-Onboarding.md](02-Giris-Onboarding.md) | Karşılama, oturum aç, kod, kayıt, şifremi unuttum, onboarding beş adımı ve plan; web giriş ve onboarding |
| [03-Denemeler.md](03-Denemeler.md) | Denemeler: vitrin, canlı deneme, çözme, teslim, sonuç, çözümler, analiz, deneme ekle; İstatistikler |
| [04-Dersler.md](04-Dersler.md) | Dersler: ders, konu (tek ders), adım türleri, oynatıcı, Tekrar, ortak "gönderilecek" şeridi |
| [05-Testler.md](05-Testler.md) | Testler: ders, konu, seviye, çözme, sonuç, çözümler |
| [06-Ders-Plani.md](06-Ders-Plani.md) | Ders Planı: gün, hafta, ay, görevler, görev ekle, odak, dünden kalan |
| [07-Akilli-Ozet.md](07-Akilli-Ozet.md) | Akıllı Özet: yükleme, kamera, işleniyor, sonuç, okunamadı, hak |
| [08-Bilgi-Kartlari.md](08-Bilgi-Kartlari.md) | Bilgi Kartları: deste, bugün, kart oturumu, oturum sonu |
| [09-SinoAI.md](09-SinoAI.md) | SinoAI: sohbet, çalışma, geçmiş, kütüphane, üretim sonucu |
| [10-Profil-Hesap-Abonelik.md](10-Profil-Hesap-Abonelik.md) | Profil, hesap, güvenlik, ayarlar, paketler, abonelik, web ödeme |
| [11-Bildirim-Destek-Durumlar.md](11-Bildirim-Destek-Durumlar.md) | Bildirimler, destek, ortak durum kalıpları (yükleniyor, boş, hata, çevrimdışı, güncelleme) |
| [13-Istatistik-Raporu-PDF.md](13-Istatistik-Raporu-PDF.md) | İstatistik raporu PDF'i (A4, API QuestPDF): iki sayfa, ölçüler, grafik çizim kuralları, alan eşlemesi, taslakla farklar |
| [12-iPhone-Duo.md](12-iPhone-Duo.md) | iPhone Duo (katlanabilir): dış ve iç ekran ölçüleri, dikey çubuk şeridi, iki sütun, yarı açık ve dik pozlar, durum sürekliliği, RN notları |

Genel kurallar üst klasördedir; bu klasör onları tekrar etmez, uygular:

| Belge | İçerik |
|---|---|
| [UIUX-Rehberi.md](../UIUX-Rehberi.md) | Kurallar, bilgi mimarisi, kalıplar, API kaynakları, uygulama kuralları |
| [Modul-Kimligi.md](../Modul-Kimligi.md) | Renkler, katmanlar, sekme yuvaları |
| [Ekran-Envanteri.md](../Ekran-Envanteri.md) | Bütün çizimler ve rotaları; üretilir, elle düzenlenmez |
| [Hareket-Standardi.md](../Hareket-Standardi.md) | Hareket ve titreşim |
| [UX-Kurallari.md](../UX-Kurallari.md) | 119 UX kuralı |
| [Adlandirma-Kurallari.md](../Adlandirma-Kurallari.md) | Kod adı ↔ görünen ad |
| [Tablet-Kalem.md](../Tablet-Kalem.md) | Tablet ve kalem |
| [Saat-Bildirim.md](../Saat-Bildirim.md) | Saat, kilit ekranı, canlı etkinlik, widget |
| [Paylasim-Kartlari.md](../Paylasim-Kartlari.md) | Paylaşım kartları |

## 2. Çizimleri bulmak

Her ekranın bir kimliği vardır. Kimlik dosya adıdır ve değişmez:
- `m-` mobil;
- `w-` web paneli;
- `s-` site;
- `t-` tablet;
- `k-` saat;
- `p-` paylaşım.

| Platform | Açık tema | Koyu tema | İngilizce | Tuval (pt) | PNG |
|---|---|---|---|---|---|
| Mobil | `acik/mobil/<id>.png` | `koyu/mobil/<id>.png` | `en/acik/mobil/<id>.png`, `en/koyu/mobil/<id>.png` | 390 × 844 | 3× → 1170 × 2532 |
| Web paneli | `acik/web-panel/<id>.png` | `koyu/web-panel/<id>.png` | `en/acik/web-panel/...` | 1440 × 900 | 2× → 2880 × 1800 |
| Tablet | `acik/tablet/<id>.png` | `koyu/tablet/<id>.png` | `en/...` | 1194 × 834 (dikey 834 × 1194) | 2× |

Yollar `Desktop\Sinavika-UIUX3\` altındadır. Her modülün bütün ekranları tek resimde: `acik/panolar/`.

**Çizim ile uygulama farkı:**
- Çizim sabit bir resimdir; listeyi en üste kaydırılmış hâliyle gösterir.
- Uygulamada liste kayar. Son öğe de kaydırılınca sekme çubuğunun üstünde tam görünmelidir (§5.2).
- Çizimde sığmayan öğe gösterilmez. Bu, uygulamada "öğe yok" demek değildir; aşağıda, kaydırınca görünür.

## 3. Ekran tanımı nasıl okunur

Her modül dosyası aynı yedi bölümden oluşur.

| Bölüm | Ne anlatır |
|---|---|
| **1. Modül özeti** | Amaç, renkler, sekme yuvaları, web'deki yeri |
| **2. Ekran haritası** | Bütün mobil, web ve tablet ekranları; rota; bugünkü kod dosyası; ekranın hâli |
| **3. Süreçler** | Akış adım adım: başlangıç ekranı → eylem (düğme metni) → hedef ekran [geçiş türü] → API → başarı ve hata dalı |
| **4. Ekranlar** | Her ekranın tanımı (aşağıda) |
| **5. Takılma ve kilitlenme önlemleri** | Modüle özgü riskler |
| **6. Kabul testleri** | Ekran ve süreç testleri |
| **7. Çizim ile bugünkü kod arasındaki farklar** | Olgu listesi |

Bölüm 4'te her ekranın tanımında şu maddeler vardır:
- **Görseller** ve **Çerçeve:** üst çubuk, sekme çubuğu, alt düğme alanı, arka plan.
- **Yerleşim (yukarıdan aşağı):** bileşen, metin TR / EN, ölçü, jeton.
- **Veri**, **Etkileşimler**, **Hâller**, **Web farkı**, **Kurallar**.

Bileşen adları çizim kodundaki adlardır (`PageTitle`, `ListRow`, `Button tone="module"` …). Uygulamada aynı ad ve varyantla bir bileşen bulunmalı ya da kurulmalıdır (§6).

## 4. Jetonlar

Değerler `src/UIUX/Tokens.ts` ve `src/UIUX/ModuleIdentity.ts` dosyalarından gelir. Uygulamalarda tek dosyada tutulur (mobil: tema dosyası, web: Tailwind/CSS değişkenleri). Ekran kodunda ham renk yazılmaz. Tek istisna doğru/yanlış kutularıdır (§5.4).

### 4.1 Renk

| Jeton | Açık | Koyu | Kullanım |
|---|---|---|---|
| `bg` | `#F7F7F8` | `#0F1115` | Sayfa zemini |
| `card` | `#FFFFFF` | `#17191E` | Kart |
| `raised` | `#FFFFFF` | `#1E2026` | Kartın üstündeki kart |
| `ink` | `#0B1C30` | `#F4F4F5` | Başlık ve ana yazı |
| `ink2` | `#334155` | `#CBD5E1` | İkincil yazı; modül renkli kartın içindeki ikincil yazı |
| `muted` | `#5F6B7D` | `#A1A1AA` | Soluk yazı (4,5:1 üstü) |
| `subtle` | `#94A3B8` | `#71717A` | Yalnız ikon ve ayraç; yazı için kullanılmaz |
| `line` | `#E7EAEE` | `#2A2E37` | Kart kenarı |
| `line2` | `#F1F3F6` | `#1D2028` | Liste ayracı, gri dolgu |
| `brand` | `#EA580C` | `#F97316` | Logo, marka simgesi, büyük başlık |
| `brandDeep` | `#C2410C` | `#FB923C` | Küçük turuncu bağlantı yazısı |
| `action` | `#C2410C` | `#C2410C` | Marka düğmesi dolgusu (beyaz yazıyla 5,2:1) |
| `success` / `successSoft` / `successInk` | `#059669` / `#DCFCE7` / `#047857` | `#34D399` / `#0B3B2C` / `#34D399` | Başarı simgesi / zemini / yazısı |
| `warning` / `warningSoft` / `warningInk` | `#D97706` / `#FEF3C7` / `#B45309` | `#FBBF24` / `#3A2A08` / `#FBBF24` | Uyarı |
| `error` / `errorSoft` / `errorInk` | `#DC2626` / `#FEE2E2` / `#B91C1C` | `#F87171` / `#3B1414` / `#F87171` | Hata |

**Modül renkleri** (`Modul-Kimligi.md` §2–3):

| Modül | Anahtar | `color` (açık / koyu) | `action` (dolgu, iki tema) |
|---|---|---|---|
| Denemeler | `exam` | `#4D7C0F` / `#A3E635` | `#4D7C0F` |
| Dersler | `lessons` | `#0284C7` / `#38BDF8` | `#0277B3` |
| Testler | `tests` | `#4F46E5` / `#818CF8` | `#4F46E5` |
| Ders Planı | `studyPlan` | `#0D9488` / `#2DD4BF` | `#0C857A` |
| Akıllı Özet | `smartSummary` | `#7C3AED` / `#A78BFA` | `#7C3AED` |
| Bilgi Kartları | `flashcards` | `#DB2777` / `#F472B6` | `#DB2777` |
| SinoAI | `sinoAi` | `#475569` / `#CBD5E1` | `#475569` |

Her modül rengi dört katmanla açılır:

| Katman | Opaklık (açık / koyu) | Kullanım |
|---|---|---|
| `wash` | %7 / %12,6 | Sayfa üstü geçişi |
| `soft` | %12 / %21,6 | İkon kutusu, seçili satır, çip, aktif sekme hapı |
| `track` | %16 / %28,8 | Boş ilerleme |
| `line` | %24 / %43,2 | Modül kenarı |

`ink` modül renginin yazı tonudur. Modül renginde yazı her zaman `ink` ile yazılır; `color` ile yazılmaz.

Kurallar:
- Beyaz yazı ya da ikon taşıyan dolgu `action` kullanır. Koyu temada `color` açık bir tondur; beyaz yazı onun üstünde okunmaz.
- Turuncu (`action` `#C2410C`) yalnız marka yüzeylerinde kullanılır: giriş ve kayıt, onboarding, ödeme ve abonelik, profil, site. Modülün içinde vurgu modül rengindedir. Turuncu modül yalnız Denemeler'dir.
- SinoAI renksizdir: beyaz ve gri.

### 4.2 Yazı

Yazı tipi yalnız **Manrope**. Rol ölçeği (pt, satır yüksekliği, kalınlık):

| Rol | Boy / satır / kalınlık | Kullanım |
|---|---|---|
| `display` | 30 / 36 / 800 | Büyük karşılama başlığı |
| `hero` | 26 / 32 / 800 | Vitrin başlığı |
| `title` | 22 / 28 / 800 | Sayfa başlığı (`PageTitle` 24 kullanır) |
| `section` | 17 / 23 / 800 | Bölüm başlığı (`SectionTitle`), üst çubuk başlığı |
| `headline` | 15 / 20 / 700 | Kart ve satır başlığı |
| `body` | 16 / 24 / 500 | Okuma metni |
| `small` | 13 / 18 / 500 | Alt yazı |
| `meta` | 12 / 16 / 600 | Etiket, süre |
| `over` | 12 / 16 / 800, büyük harf | Kart üstü etiketi ("KALDIĞIN YERDEN") |
| `num` | 28 / 32 / 800 | Büyük sayı |

Web'de `body`, `small` ve `meta` 1 pt büyüktür. En küçük yazı 12 pt'dir. Tek istisna sekme etiketleri ve rozet sayısıdır (10 ve 9,5 pt; çizimde de öyledir). Uygulamada sistemin yazı büyütme ayarı açık kalır (§5.3).

### 4.3 Köşe, gölge, boşluk

- **Köşe:**
  - `xs` 8, `sm` 12, `md` 16, `lg` 20 (kart), `xl` 26 (büyük kart, web modül başı), `full` (hap, düğme).
  - Alt sayfa üst köşeleri 28; yüzen sekme çubuğu 28.
- **Gölge:**
  - `card` `0 1px 2px rgba(15,23,42,.04), 0 8px 22px -14px rgba(15,23,42,.18)`;
  - `float` (sekme çubuğu, açılır kart) `0 2px 6px rgba(15,23,42,.05), 0 18px 40px -18px rgba(15,23,42,.32)`;
  - `brand` (turuncu ana düğme).
  - React Native'de iOS `shadow*`, Android `elevation` ile yaklaşık karşılık kullanılır.
- **Boşluk:**
  - Mobil sayfa kenarı 18 pt; bloklar arası 12–14 pt; kart içi 14–16 pt.
  - Web sayfa kenarı 28 px; bloklar arası 18 px.

### 4.4 Hareket

Bütün süre ve eğriler `UI_MOTION` (`Hareket-Standardi.md`):
- Ekran itme 280 ms;
- Modal 280 ms;
- Alt sayfa 320 ms (eğri `0.32, 0.72, 0, 1`);
- Giriş 240 ms, çıkış 180 ms;
- Basma 140 ms, ölçek 0,97;
- Eğri `0.23, 1, 0.32, 1` (yavaş biten).

Kurallar:
- Ease-in kullanılmaz.
- Yalnız `transform` ve `opacity` hareket eder.
- "Hareketi azalt" açıkken en çok 150 ms solma.

Sekme değişiminde animasyon yoktur, seçim titreşimi vardır.

## 5. Ortak çerçeve ve yerleşim

### 5.1 Mobil çerçeve (`src/UIUX/Parts/Mobile.tsx`)

- **Durum çubuğu:**
  - Çizimde 50 pt yükseklik. Uygulamada güvenli alan (`useSafeAreaInsets().top`) kullanılır; sabit 50 yazılmaz.
  - Durum çubuğu yazısı zemine göre seçilir: koyu zeminde açık (`lightStatus`).
- **Üst çubuk (`AppHeader`):**
  - Ölçüler: 52 pt yükseklik, yan boşluk 14.
  - Sol: profil (`user`, 40 × 40 daire, zeminsiz) ya da geri / kapat (`left` / `x`, 40 × 40 daire, `card` zemin ve `line` kenar).
  - Orta: logo (24 pt) yalnız Modüller ana ekranı ve marka ekranlarında; alt sayfada başlık (`section` rolü). Modül sayfasında orta boştur; sayfa kendini `PageTitle` ile adlandırır.
  - Sağ: zil (`bell` 22) ve kırmızı rozet. Rozet `#DC2626`, en az 18 × 18, 9,5 pt beyaz yazı; 9'dan büyük sayı "9+" yazılır.
- **Modül sayfası (`ModuleScreen`):**
  - Zemin `bg`; üst %34'lük bölüm modülün `wash` katmanından `bg`'ye geçen dikey gradyandır.
  - İçerik `Content` içindedir: yan boşluk 18, üst 4, bloklar arası 14 (ekran belgesinde farklıysa yazar).
- **Sayfa başlığı (`PageTitle`):**
  - Üstte modül çipi: `Chip tone="module" size="sm"`, `soft` zemin, `ink` yazı, modül ikonu.
  - Altında başlık (`title` rolü, 24 pt).
  - Gerekirse altında `small` alt yazı, sağda eylem.
- **Bölüm başlığı (`SectionTitle`):**
  - `section` rolünde başlık; altında isteğe bağlı `small` açıklama.
  - Sağda isteğe bağlı eylem yazısı ("Tümü"), `small` 700, vurgu rengi `ink`.
- **Yüzen sekme çubuğu (`TabBar`):**
  - Yerleşim: soldan ve sağdan 14 pt içeride, alttan 22 pt yukarıda (uygulamada alt güvenli alan + 8 pt).
  - Görünüm: 72 pt yükseklik, köşe 28; `card` zemin %96 opak, `line` kenar, `float` gölge.
  - Beş yuva:
    1. Modülün kendisi.
    2. Ana iş.
    3. Modüller (ortada 42 pt `line2` daire, `grid` ikonu, "Modüller" / "Modules").
    4. Kayıtlar ya da ikinci iş.
    5. Profil.
  - Aktif yuva: 58 pt yükseklikte, köşesi 20 olan `soft` hap; ikon `color`, etiket `ink`, 10 pt 800.
  - Pasif yuva: ikon ve etiket `muted`, 10 pt 600.
  - Etiket tek satırdır, kesilmez. Yuva tabloları `Modul-Kimligi.md` §6'da ve her modül dosyasının §1'inde.
- **Odak ekranları:**
  - Deneme ve test çözme, ders oynatıcısı, kart oturumu, odak sayacı ve kamera.
  - Sekme çubuğu yoktur. Üstte `FocusHeader` vardır:
    - sol çıkış (`x`, 40 pt daire);
    - ortada başlık (`headline` 16) ve üstünde `meta` alt yazı;
    - sağda süre ya da eylem;
    - altında 5 pt ilerleme çubuğu (`line2` iz, modül `color` dolgu) ya da adım noktaları.
- **Alt düğme alanı (`BottomBar`):**
  - İç boşluk 12 / 18 / 34 (uygulamada alt güvenli alan + 12).
  - Gerekirse üstte `line2` çizgi ve `card` zemin.
  - Ekranın ana eylemi buradadır; içerik bu alanın altında kalmaz.
- **Alt sayfa (`Sheet`):**
  - Karartma `rgba(11, 28, 48, 0.45)`.
  - Kart: üst köşe 28, `card` zemin, iç boşluk 10 / 20 / 34; tutamaç 40 × 5 `line`.
  - Parmağı izler; yolun %45'inde ya da hızlı fiskede kapanır. Karartmaya dokununca ve geri tuşuyla kapanır.

### 5.2 Liste ve sekme çubuğu

- Kayan içeriğin altına, sekme çubuğu için boşluk konur. Çizimde bu 108 pt'dir (72 çubuk + 22 alt + 14 nefes). Uygulamada boşluk `tabBarHeight + insets.bottom + 14` olur.
- Son kart sekme çubuğunun altında kalmaz ve çubuğun altındaki boşlukta görünmez.
- `BottomBar` olan ekranda liste o alanın üstünde biter.
- Sekme çubuğu yarı saydamdır. Altından geçen içerik görünür ama okunmaz; son öğe kaydırınca tamamen çubuğun üstüne gelir.
- Liste bitince altta boşluk kalabilir. Kartlar aralarına boşluk koyarak yayılmaz.

### 5.3 Metin ve sayı

- Başlık, düğme, hata ve adlar kesilmez; satıra sığmazsa alt satıra geçer.
- Üç nokta (`…`) yalnız uzun liste alt yazılarında ve kullanıcı içeriğinde (sohbet başlığı, deste adı) kullanılır.
- Sistemin en büyük yazı ayarında ve web'de %200 yakınlaştırmada içerik kesilmez; kutular yazıya göre büyür.
- **Yüzde:** TR `%45`, EN `45%`. Tek bir biçimleyiciden geçer (çizimde `Pct`).
- **Sayı ve tarih:**
  - Ondalık: TR `84,25`, EN `84.25`. Binlik: TR `12.480`, EN `12,480`.
  - Tarih ve saat: TR `19 Ekim`, `Cumartesi 10:00`; EN `19 Oct`, `Saturday 10:00`.
  - `Intl` / `toLocaleString(lang)` kullanılır; dize birleştirerek biçim kurulmaz.
- **Sıfır:** "0 dk" gösterilmez. Sıfır hâli kendi metniyle yazılır ("Henüz başlamadın").
- **Sözcükler:**
  - "Test" kullanılır, asla "quiz". "Şifre" kullanılır, parola değil.
  - Modül adları (bu sırayla): Ders Planı, Dersler, Testler, Denemeler, Bilgi Kartları, Akıllı Özet, SinoAI. "Lens", "Compass", "Kelime Kartları" ekranda geçmez.
  - SinoAI'ye "koç" denmez.
  - TYT, AYT, YKS büyük harfle yazılır.
- **Dil:** TR ve EN metinler her ekranda belgededir. EN'de sınav adları (TYT, AYT, YKS) aynı kalır.

### 5.4 Renk kuralları (özet)

- Metin her zeminde en az 4,5:1, büyük yazı 3:1.
- Doğru ve yanlış:
  - Kutular iki temada `#047857` (doğru) ve `#DC2626` (yanlış) dolgudur, beyaz tik ve çarpı taşır.
  - Yazıları `successInk` ve `errorInk` tonundadır.
  - Anlam yalnız renkle verilmez; tik, çarpı ve metin de vardır.
- Durum rozetleri:
  - Yazı `*Ink`, zemin `*Soft`.
- Bilerek soluk öğe:
  - Tamamlanmış görev, devre dışı düğme ve yer tutucu soluktur.
  - Bilerek soluk olduğu için kontrast kuralı uygulanmaz. Yine de okunur kalır (en az 3:1).

### 5.5 Web çerçevesi (`src/UIUX/Parts/Web.tsx`)

- **Sol menü:**
  - 260 px genişlik, `card` zemin, sağda `line` kenar, iç boşluk 18 / 14.
  - Üstte logo (26) ve daraltma ikonu.
  - Menü sırası:
    1. "Ana sayfa".
    2. "Tüm modüller".
    3. "MODÜLLER" başlığı altında yedi modül.
    4. "HESAP" başlığı altında İstatistiklerim, Bildirimler (sayaç), Destek.
    5. En altta seri kartı ve "Çıkış yap".
  - Menü satırı:
    - 40 px yükseklik, köşe 12, ikon 19, yazı 14.
    - Aktif satır `line2` hap üstünde durur. Solunda 3 px modül renkli çizgi vardır; ikonu modül rengindedir.
    - Pasif satırda ikon `muted`, yazı `ink2` olur.
- **Üst çubuk:**
  - 68 px yükseklik, yan boşluk 28, altta `line` kenar, %85 opak `card`.
  - Soldan sağa:
    - arama kutusu (340 px, "Ders, konu, deneme ara", `Ctrl K` çipi);
    - boşluk;
    - sınava kalan gün çipi;
    - fikir, destek ve bildirim ikonları (38 px daire, bildirimde kırmızı nokta);
    - ad, e-posta ve avatar (36).
- **Sayfa:**
  - İç boşluk 22 / 28 / 28, bloklar arası 18.
  - Modül sayfasında üstteki 300 px modül `wash` geçişidir.
- **Modül başı (`ModuleHead`):**
  - Hap sekmeler:
    - 36 px, köşe tam, yazı 13,5.
    - Aktif hap `action` dolgu ve beyaz yazıdır; pasif hap `card` zemin, `line` kenar ve `ink2` yazıdır.
    - Mobilin yuva 1, 2 ve 4'ü; web'e özgü sekmeler arkada.
  - Altında modül kartı:
    - köşe 26, `line` modül kenarı;
    - içinde 52 px `Tile`, modül çipi, başlık 26 ve alt yazı 13,5;
    - sağda eylemler.
- **Odak sayfaları (`Immersive`):**
  - Menü ve üst çubuk yoktur.
  - 70 px ince çubuk: "Ara ver" / "Pause" (ghost sm, `x`), 36 px `Tile`, başlık ve alt yazı, sağda süre ve eylem.
  - Altında 4 px ilerleme çubuğu.
- **Genişlik:**
  - Tasarım 1440 px'tir.
  - 375, 768, 1024 ve 1440 px'te denenir; yatay kaydırma olmaz.
  - 1024 px altında sol menü daraltılır ya da çekmeceye döner.
  - Geniş ekranda tek bir blok ortada bırakılmaz; ana içerik ve yan bilgi iki sütundur.
  - Bir sayfadaki kart satırları aynı sütun oranını izler (ör. ana sayfa `minmax(0, 1.3fr) minmax(0, 1fr)`). İki küçük kart gerekiyorsa bir sütunu birlikte doldururlar (iç ızgara); satır satır farklı oran kullanılmaz. Aynı satırdaki kartlar eş boydur (`align-items: stretch`).
- **Tablet:**
  - Tablet web sayfasının kendisini gösterir (`PanelInTablet`): menü ve web üst çubuğu çizilmez.
  - 600 pt altında (iPad Split View, `t-bolunmus-ekran`) telefon düzeni kullanılır.
  - Ayrıntı `Tablet-Kalem.md`.

## 6. Bileşen sözlüğü

Belgelerde bileşen adları çizim kodundaki adlardır. Uygulamada **ikinci bir tasarım sistemi kurulmaz**; çizimdeki bileşen uygulamanın mevcut ortak bileşeniyle kurulur (mobil `src/shared/components/ui/`, web `src/components/ui/`). Ölçü ya da varyant eksikse ortak bileşen genişletilir, ekranda elle yeniden yazılmaz. Sıra: jeton → ortak bileşen → ekran.

| Çizim | Mobil karşılığı | Web karşılığı |
|---|---|---|
| `Button`, ikon düğmesi | `AppButton`, `AppIconButton` | `Button`, `IconButton` |
| `Card` | `AppCard` | `Card` |
| `List` / `ListRow` | `AppCatalogGroupRow`, `AppCatalogParentRow`, `AppCatalogLeafRow` (genel satır bileşeni yok) | `Card` içinde satırlar (genel satır bileşeni yok) |
| `Chip`, `FilterChips` | `AppBadge`, `AppFilterChip` | `ModuleChip`, `ModuleFilterChip` |
| `Segmented` | `AppSegmentedControl` | profil sekmeleri elle (`role="tablist"`) |
| `ModuleWeekCard` (vitrin "Bu hafta" kartı; Dersler, Denemeler, Testler, Bilgi Kartları, Ders Planı İlerleme) | `ProfileModuleStatisticsCard` (`framed`; her modülde aynı çerçeveli kart) | `ModuleStatisticsCard` |
| `PendingSyncNote` (çevrimdışı "gönderilecek" satırı; Dersler, Testler, Denemeler; Testler `reveal`: "…, doğrusu o zaman görünür.") | tek merkezi kuyruğun ortak satırı (kurulacak) | aynı (kurulacak) |
| `Field` | `AppTextField`, `AppSelect` | `Input`, `PasswordInput`, `CodeInput`, `FormError` |
| `Ring`, `Bar` | `AppProgressRing`, `AppProgressBar` | `ProgressRing`, `LinearProgress` |
| `Sheet` | `AppSheet` | `Overlay` |
| Onay penceresi | `AppDialog`, `AppConfirmDialog` | `ConfirmDialog` |
| `LoadingLogo` | `SinavikaLoader`, `ScreenLoading` | `SinavikaLoader`, `SinavikaPageLoader`, `StateLoading` |
| `StateBlock` (boş, hata) | `AppEmptyState`, `ScreenError`, `ScreenState` | `EmptyState`, `StatePanel`, `StateError`, `SectionStateView` |
| Çevrimdışı şeridi | `AppConnectionBanner` | `OfflineStrip` |
| Kısa bildirim | `toast` + `AppToastHost` (4 sn) | `ToastContext`, `useErrorToast` |
| `ModuleSlide`, `ModuleHead` | `ModuleHeroSurface`, `ModuleScreenLayout` | `ModuleHero`, `ModuleHeader`, `ModuleTabs` |
| `TabBar` | `MainTabBar` (geniş pencerede `ModuleTabRailFrame`) | `StudentModuleTabs` (hap sekmeler) |
| `AppHeader` | `ModuleHomeNavHeader`, `nativeStackHeaderDefaults` | `StudentHeader` |
| `Tile` | `ModuleTileSize` ile modül karosu | `IconTile` |

Ölçü ve varyantlar:

| Bileşen | Ölçü ve varyant |
|---|---|
| `Button` | **Boy:** `sm` 36 / `md` 46 / `lg` 54 yükseklik; yazı 13 / 15 / 16, 800; köşe tam; yan boşluk 14 (`sm`) ya da 20. **Tonlar:** `primary` (bağlamın `action` rengi: modülde modül, dışında marka), `module`, `moduleSoft` (`soft` zemin, `ink` yazı), `soft`, `dark` (`ink` zemin, `bg` yazı), `ghost` (`card`, 1,5 px `line` kenar), `white`, `glass`, `disabled`. **Davranış:** `loading` iken dönen işaret gösterir, kilitlenir, ikinci dokunuş istek göndermez. Basılınca ölçek 0,97. Dokunma alanı en az 44 pt / 48 dp. |
| `Card` | **Köşe** 20 (`lg`), iç boşluk 16. **Tonlar:** `card` (beyaz, `line` kenar, `card` gölge), `flat`, `soft` (`line2`), `module` (`wash` zemin, modül `line` kenar; içindeki ikincil yazı `ink2`), `moduleLine` (beyaz, 1,5 px modül kenar), `dark` |
| `Chip` | **Boy:** `sm` ve `md`. **Tonlar:** `module`, `outline`, `success`, `warning`, varsayılan gri. İkon soldadır. |
| `Tile` | Yuvarlatılmış kare ikon kutusu. **Varsayılan** 42. **Renk:** modül `soft` zemin ve modül `color` ikon; `solid` iken `action` zemin ve beyaz ikon. |
| `List` / `ListRow` | Tek kart içinde satırlar, satır arası `line2` çizgi. **Satır:** boşluk 12 / 14; sol `Tile` (38); başlık `headline`; alt yazı `small`; sağda sağ ok ya da `trailing`. |
| `Ring`, `Bar`, `Steps`, `Dots` | İlerleme. **İz** `track`, **dolgu** modül `color`. Çubuk yüksekliği ekran belgesinde yazar. |
| `Segmented` | İki-üç seçenekli geçiş (Gün · Hafta · Ay, TYT · AYT). **Seçili** `card` hap. İçi boş öğe (`off`, "Boş · 0") soluk ve dokunulmaz. |
| `Field` | **Etiket** her zaman görünür. **Hata** alanın altında, uyarı simgesiyle, alana özel cümleyle. **Şifre alanında** göster/gizle. |
| `OptionRow` | Şık satırı. **Harf kutusu:** seçili `action`, doğru `#047857`, yanlış `#DC2626`. |
| `LoadingLogo` | Ortada dönen saatli logo (44) ve altında isteğe bağlı yazı. İskelet ekran kullanılmaz. |
| `StateBlock` | Boş, ilk kullanım ve hata bloğu: ikon kutusu, başlık, açıklama, bir ana ve bir ikincil eylem |
| `ModuleSlide` | Modül vitrini: modül gradyanı, büyük saydam modül ikonu, iki yumuşak ışık dairesi, `over` etiketi, başlık, metin, beyaz eylem düğmesi. Köşe 26, yükseklik 158–196. |
| `PlanTaskCard`, `WeekStrip`, `TodayCard`, `ActionCard`, `FilterChips`, `NetBars`, `KpiCard`, `EntryRow` | Üç platformun ortak çalışma parçaları (`Parts/Study.tsx`); tanımları ilgili modül dosyasında |

## 7. Takılma ve kilitlenme yok

Ayrıntı [Navigasyon.md](Navigasyon.md) §6'dadır. Her ekranda şunlar geçerlidir:
1. Geri tuşu ve kaydırma hareketi her ekranda çalışır. Kullanıcı hiçbir ekranda sıkışmaz; modal ve alt sayfa her zaman kapanır.
2. İstek sürerken ekran donmaz. İlk yüklemede ortada `LoadingLogo` döner. İçerik varsa yerinde kalır, üstte küçük gösterge çıkar.
3. Her isteğin zaman aşımı vardır: mobil istemcide okuma 25 sn, gönderim 60 sn, Akıllı Özet 180 sn; web istemcisinde de aynı değerler. Süre dolunca hata hâli ve "Tekrar dene" gösterilir; sonsuz dönen gösterge olmaz.
4. Gönderen düğme `loading` iken kilitlidir. Aynı işlem iki kez gitmez; sunucu tarafında da tekrar güvenli olmalıdır. API'ye bağlı düğmenin yeri baştan ayrılır, cevap gelene kadar pasif durur; sayfa zıplamaz.
   - Yüklenirken hiçbir parça boy ya da yer değiştirmez (sahip, 17 Kasım 2026). Veri bekleyen kartın bekleme hâli gerçek kartla aynı boyda çizilir; geç gelen satırın (hedef, seri, hafta şeridi) yeri baştan bellidir.
5. Gezinme beklemez: önce ekran açılır, veri ekranın içinde yüklenir. `await` gezinmeyi bloklamaz.
6. Çözme, oynatıcı ve kart oturumunda cevap anında yerel olarak saklanır. Uygulama kapanınca, ağ kopunca ya da arka plana geçince kaldığı yerden devam eder.
7. Ağ yoksa ince sarı "çevrimdışı" şeridi çıkar. Kaydedilmiş içerik açılır, gönderimler kuyruğa girer.
8. Ham hata metni, GUID, enum adı ve hata ayıklama bilgisi ekranda asla görünmez. Hatanın dört türü vardır:
   - Veri gelmedi: yerinde "Tekrar dene"li hata kutusu.
   - Kullanıcının işlemi başarısız: kısa bildirim.
   - Form hatası: alanın altında.
   - Oturum ve abonelik: tam ekran kapı.

   Metin tek yardımcıdan gelir: mobil `resolveUserFacingError`, web `presentError`.

Bu kurallar iki istemcide de yürürlükteki "Yükleme, geçiş, hata ve bileşen kuralları" belgesiyle aynıdır (`sinavika_frontend_student/docs/UIUX/Yukleme-Gecis-Hata-Merkezilestirme-Plani.md`). Kodlama belgeleri onunla çelişmez; ona ekranlar düzeyinde ayrıntı ekler.

## 8. Kabul testleri (ortak)

Her modül dosyasının §6'sı ekran ve süreç testlerini listeler. Bunlara ek olarak her ekran için şu testler zorunludur.

| Tür | Ne denetlenir |
|---|---|
| Görsel | Ekran görüntüsü aynı tuvalde alınır (mobil 390 × 844 pt, web 1440 × 900), aynı tema ve dille, örnek veriyle. İlgili PNG ile yan yana konur: yerleşim, sıra, metin, renk ve boşluk aynı olmalıdır. |
| Dil | TR ve EN'de bütün metinler çevrilmiştir; çeviri anahtarı ya da Türkçe metin İngilizce ekranda kalmaz. Yüzde ve sayı biçimi dile uyar. |
| Tema | Açık ve koyu temada her yazı okunur. Ham renk kullanılmaz, jetonlar kullanılır. |
| Yerleşim | En küçük telefon (iPhone SE, 375 × 667) ve en büyük yazı ayarında yazı kesilmez, üst üste binmez. Son öğe sekme çubuğunun üstüne kaydırılabilir. Web 375 / 768 / 1024 / 1440 px'te yatay kaydırma yok. |
| Kayma | Yavaş ağda veri parça parça gelirken hiçbir blok yer ya da boy değiştirmez (web: CLS 0; mobil: ilk ve son çerçevede blok konumları aynı). Aynı satırdaki kartlar eş boy, sütun kenarları satırdan satıra aynı x'te. |
| Veri | Ekrandaki her sayı ve etiketin API'de bir alanı vardır; alan yoksa o parça görünmez, yerine uydurma değer yazılmaz. |
| Hâller | Ekranın bütün hâlleri (boş, ilk, hata, çevrimdışı, hak doldu …) tetiklenebilir ve çizimdekiyle aynıdır. |
| Gezinme | Ekrana giriş yolları ve çıkışı (geri, kapat, sekme) çalışır. Bildirim ve bağlantı doğru ekranı açar. |
| Kilitlenme | Yavaş ağda (3G), ağ yokken ve zaman aşımında ekran donmaz. Çift dokunuş tek istek gönderir. |
| Erişilebilirlik | İkon düğmelerinin adı vardır. Dokunma alanı en az 44 pt / 48 dp'dir. Ekran okuyucu sırası görsel sırayla aynıdır. Web'de klavyeyle her öğeye gelinir; odak halkası 2 px'tir. |
| Hareket | Süreler `UI_MOTION`'dan gelir. "Hareketi azalt" açıkken hareket kalkar. |

**Bitti sayılmak için:** ekranın bütün testleri geçer; görsel karşılaştırma TR/EN × açık/koyu dört PNG'yle yapılmış olur; §7'deki fark listesindeki maddeler kapanır.

Testlerin hangi araçla ve nereye yazılacağı [Navigasyon.md](Navigasyon.md) §7'dedir.
