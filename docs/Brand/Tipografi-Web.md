# Tipografi raporu: Web (`sinavika_frontend_student`)

Marka standardı: [Tipografi.md](Tipografi.md). Bu rapor web uygulamasının bugünkü durumunu, standarda göre farklarını ve yapılacak değişiklikleri listeler.

İncelenen sürüm: `main`, son commit `ab73827` (5 Ekim 2026). Canlı site: sinavika.com/tr. Bu repoda hiçbir değişiklik yapılmadı; aşağıdakiler öneridir.

---

## 1. Özet

Web tipografisi iyi durumda ve markanın referansı olacak olgunlukta: **tek aile Manrope**, `next/font` ile yükleniyor, 23 anlamsal rol (`Typography.*`, 1.768 kullanım), yazılı bir standart (`src/core/theme/TYPOGRAPHY.md`), sayısal alanlarda `tabular-nums`, sayfa dili pazara göre (`htmlLang`). Video motoru bu sisteme hizalandı.

Kapatılması gerekenler:

| # | Konu | Öncelik |
| --- | --- | --- |
| 1 | `verify:typography` ve diğer `verify:*` betikleri repoda yok; standart denetlenmiyor | Yüksek |
| 2 | Matematik işaretleri (≤ ≥ ≠ √ …) Manrope'ta yok; KaTeX dışındaki metinde her cihazda farklı yazıyla çıkıyor | Yüksek |
| 3 | Manrope'ta sahte italik (5 yer) | Orta |
| 4 | Sabit `"tr-TR"` ile biçimlenen sayılar ve büyük harf (16 yer) | Orta (İngilizce bugün, Almanca yarın) |
| 5 | Avrupa dilleri için uzun kelime ve metin uzaması kuralları yok (`hyphens` hiç kullanılmıyor) | Orta |
| 6 | İçerik dili ≠ arayüz dili durumunda soru kutusu `lang` taşımıyor | Düşük, pazar açılırken |

## 2. Bugünkü durum

| Konu | Durum |
| --- | --- |
| Yazı tipi | `src/core/theme/fonts.ts`: `Manrope`, `subsets: ["latin", "latin-ext"]`, 400–800, `display: "swap"`, değişken `--font-manrope`; `next/font` otomatik "Manrope Fallback" (yükleme sırasında kaymayı azaltır) |
| Tailwind | `fontFamily.sans = var(--font-manrope), ui-sans-serif, system-ui, …` |
| Roller | `src/core/theme/typography.ts`: display, hero, pageTitle, title, sectionTitle, headline, body(+Emphasis), bodySmall(+Emphasis), label, button, input, caption(+Emphasis), meta, learningContent, examQuestion, examSupportingText, aiMessage(+Compact), numeric, timer, prose* |
| Ölçek | En küçük 12 px (`meta`); input 16 px (iOS yakınlaştırmasını önler); yalnız display/hero/pageTitle ekranla büyür |
| Rakam | `numeric` ve `timer` → `tabular-nums` |
| Dil | `APP_LOCALES = ["tr", "en"]`; `<html lang>` pazardan (`markets.ts` `htmlLang`) |
| Matematik | KaTeX (`LensMarkdown`, `ChatMessageRenderer`) |
| Ham boyutlar | 47 `text-[Npx]` (12 dosya), çoğu 7–11 px; standarttaki istisna listesiyle (maketler, mega menü) uyumlu |
| Büyük harf | 92 `uppercase` sınıfı; `lang` doğru olduğu için Türkçede İ doğru (canlı sitede doğrulandı) |

Standarda uygun: tek aile, 800 üstü yok (`font-black` 0), ince ağırlık yok (`font-light` 0), metin rolleri merkezi.

## 3. Bulgular ve değişiklikler

### 3.1 Denetim betikleri eksik (yüksek)

`package.json` 14 `verify:*` komutu tanımlıyor (`verify:typography` dahil) ve `TYPOGRAPHY.md` §15–16 istisna listesinin `scripts/verify-typography.mjs` içinde olduğunu söylüyor; ama repoda `scripts/` klasörü yok. Yani `npm run verify:typography` çalışmıyor ve standart fiilen denetlenmiyor.

**Yapılacak:** `scripts/` klasörünü repoya geri koyun (`.gitignore` ya da eksik commit olabilir) ve CI'da `verify:typography` çalıştırın. Mobil repodaki `tests/architecture/typographyPolicy.test.ts` iyi bir örnek: yasak aileler, 800 üstü ağırlık, ham `fontSize` kapısı.

### 3.2 Matematik işaretleri (yüksek)

Manrope'ta ≤ ≥ ≠ ≈ √ ∞ ∑ ∫ ∆ ve ‰ yok (yazı tipi dosyasında tek tek denendi). KaTeX dışında, düz metinde geçtiklerinde (soru kökü, şık, açıklama, SinoAI düz metni) tarayıcı bunları sistem yazısından alır: Windows'ta Segoe UI, Mac'te SF, Android'de Roboto. Aynı soru her cihazda farklı görünür, kalınlık ve hizası Manrope'la uyuşmaz.

**Yapılacak:** Manrope'tan sonra yalnız bu işaretleri dolduracak bir matematik yazısı ekleyin:

```ts
// src/core/theme/fonts.ts
import { Manrope, Noto_Sans_Math } from "next/font/google";

/** Manrope'ta olmayan matematik işaretleri (≤ ≥ ≠ √ ∞ ∫) için yedek; marka yazısı değildir. */
export const mathSymbols = Noto_Sans_Math({
  subsets: ["math"],
  weight: "400",
  variable: "--font-math",
  display: "swap",
  preload: false,
});
```

```js
// tailwind.config.js
sans: ["var(--font-manrope)", "var(--font-math)", "ui-sans-serif", "system-ui", /* … */],
```

Tarayıcı bir karakteri yalnız Manrope'ta yoksa ikinci aileden alır; Manrope metni değişmez. `next/font`'un `Noto_Sans_Math` için kabul ettiği alt küme adı derlemede doğrulanmalı. Gövdeye eklenen değişken (`mathSymbols.variable`) `[locale]/layout.tsx`'teki `manrope.variable` yanına konur.

Ek kural: içerik üretiminde ∆ yerine Yunanca Δ, ∑ yerine Σ kullanılırsa bunlar zaten Manrope'tan gelir.

### 3.3 Sahte italik (orta)

Manrope'un italiği yok ve yüklenmiyor (`TYPOGRAPHY.md` §3), ama şu yerlerde `italic` sınıfı var; tarayıcı eğik çizim üretiyor:

| Dosya | Metin |
| --- | --- |
| `src/features/content-figures/components/ContentFigureView.tsx:63` | "Figür görseli yok" |
| `src/features/content-figures/components/QuestionContentWithFigures.tsx:62` | "Şık metni yok" |
| `src/features/content-figures/components/RemoteFigureImage.tsx:62, :66` | "Figür görseli yok", "Görsel yüklenemedi" |
| `src/features/feedback/components/FeedbackCommentsList.tsx:135` | boş/silinmiş yorum notu |

**Yapılacak:** `italic` kaldırılır; bu durum notları zaten `text-ma-muted` ile ayrışıyor. Gerekirse `Typography.captionEmphasis`. Markdown `em` için: `[&_em]:not-italic [&_em]:font-semibold`. Kural `verify:typography`'ye eklenir (`\bitalic\b` yalnız `not-italic` ile).

Bu yerlerdeki metinler ayrıca kodda Türkçe yazılmış; Avrupa açılımında çeviri dosyasına taşınmalı.

### 3.4 Sabit "tr-TR" (orta)

16 yerde dil sabit `"tr-TR"` verilmiş. İngilizce sayfada "12,345" beklenirken sayı Türkçe biçimle "12.345" çıkar; Almanca ve Hollandaca eklenince de dil yerine hep Türkçe biçim kullanılır.

| Dosya | Ne |
| --- | --- |
| `src/features/net-calculator/pages/NetHesaplamaForm.tsx:361, 364, 365, 429` | Sıralama tahmini |
| `src/features/exam-results/components/OsymResultDocument.tsx:239` | Katılımcı sayısı |
| `src/features/exam-results/components/OsymSectionTables.tsx:147` | Tablo başlığı büyük harf |
| diğerleri | `grep -rn '"tr-TR"' src` |

**Yapılacak:** Projede zaten olan `getIntlLocale(locale)` / `intl(locale)` kullanılır. ÖSYM belgesi gibi yalnız Türkiye'ye ait ekranlarda `"tr-TR"` bilinçli kalabilir; o satırlara kısa bir yorum yazılır. `normalizeCurriculumKey` (`curriculumSubjectVisual.ts`) bir eşleştirme anahtarıdır, görünen metin değildir; dokunulmaz.

### 3.5 Avrupa dilleri: uzun kelime ve metin uzaması (orta)

Bugün `hyphens` hiç kullanılmıyor. Almanca ve Hollandacada bileşik kelimeler ("Prüfungsvorbereitung", "examenvoorbereiding") dar kartlarda, düğmelerde ve mobil web başlıklarında taşar.

**Yapılacak:**

- `globals.css`: başlık ve dar kart metinlerinde `hyphens: auto; overflow-wrap: break-word;` (tireleme `lang` ile çalışır; `htmlLang` zaten doğru).
- Düğme ve etiketlerde sabit genişlik ve `whitespace-nowrap` yerine en az genişlik + iki satıra izin.
- `uppercase` yalnız 1–3 kelimelik etiketlerde; Almanca uzun etiketlerde büyük harf kaldırılır.
- Yeni dil eklenirken en uzun çeviriyle ekran görüntüsü kontrolü (`verify:i18n-parity` yanına bir "uzunluk" kontrolü düşünülebilir).
- Tırnak işaretleri çeviri dosyasında dile göre yazılır („…“ Almanca, “…” İngilizce/Türkçe).
- Yeni pazar `markets.ts`'e `htmlLang` ile eklenir; Manrope `latin-ext` alt kümesi hepsini kapsar, yazı tipi tarafında ek iş yok.

### 3.6 İçerik dili (düşük, pazar açılırken)

Arayüz İngilizceyken Türkçe bir soru gösterildiğinde (ya da tersi) büyük harf ve tireleme sayfa dilini izler. Soru/açıklama kapsayıcısına içeriğin dili yazılır: `<div lang={question.language}>`. API soru dilini döndürmüyorsa bu, Avrupa içeriği eklenirken eklenmelidir.

## 4. Marka hizalaması

| Konu | Web | Marka standardı | Durum |
| --- | --- | --- | --- |
| Aile | Manrope | Manrope | ✓ |
| Ağırlıklar | 400–800 | 400–800 | ✓ |
| Soru | `examQuestion` 17/28, 500 | Manrope 500, kitapçık disiplini düzenle | ✓ |
| Rakam | tabular | tabular | ✓ |
| Matematik | KaTeX; düz metinde sistem yazısı | KaTeX + belirli yedek | §3.2 |
| İtalik | 5 sahte italik | yok | §3.3 |
| Dil | tr, en; `lang` doğru | metnin dili | §3.4–3.6 |
| Logo | `/logos/favicon.png` | Rafine ikon, turuncu/beyaz | Logo dosyaları hazırlanınca değişecek |

## 5. Yapılacaklar listesi

1. `scripts/` klasörünü geri getir, `verify:typography`'yi CI'a bağla.
2. `Noto_Sans_Math` yedeğini `fonts.ts` ve Tailwind yığınına ekle.
3. 5 `italic` kullanımını kaldır; denetime "Manrope'ta italik yok" kuralını ekle.
4. Görünen sayı ve büyük harflerde sabit `"tr-TR"` yerine `getIntlLocale(locale)`.
5. `hyphens: auto` + `overflow-wrap` kuralları; düğmelerde iki satıra izin.
6. Avrupa pazarı açılırken: `markets.ts`'e yeni `htmlLang`, içerik kapsayıcılarına `lang`, kodda kalan Türkçe metinlerin çeviriye taşınması.
7. Yeni logo dosyaları gelince `/public/logos/*` değişimi.
