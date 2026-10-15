# Tipografi raporu: Mobil (`sinavika_mobile_reactnative`)

Marka standardı: [Tipografi.md](Tipografi.md). Bu rapor mobil uygulamanın bugünkü durumunu, standarda göre farklarını ve yapılacak değişiklikleri listeler.

İncelenen sürüm: `main`, son commit `376b88f` (9 Ekim 2026). Expo 54, React Native 0.81. Bu repoda hiçbir değişiklik yapılmadı; aşağıdakiler öneridir. Cihazda doğrulanması gerekenler ayrıca belirtildi.

---

## 1. Özet

Mobil tipografi güçlü: **tek aile Manrope** (5 yüz, 400–800), 30'a yakın anlamsal rol (`Typography.*`, 890 kullanım), ekranlarda ham `fontSize` ve ham `fontFamily` **sıfır**, kuralları bir mimari test koruyor (`tests/architecture/typographyPolicy.test.ts`), yazılı standart `src/docs/TYPOGRAPHY.md`. Web ile aynı rol adları kullanılıyor.

Kapatılması gerekenler:

| # | Konu | Öncelik |
| --- | --- | --- |
| 1 | Türkçe büyük harf hatası: `toUpperCase()` ve `textTransform: 'uppercase'` uygulama dilini bilmiyor ("Fizik" → "FIZIK") | Yüksek |
| 2 | Desteklenmeyen cihaz dili Türkçeye düşüyor; Almanca telefon Türkçe uygulama görür | Yüksek (Avrupa açılımında) |
| 3 | `Typography.code` → `fontFamily: 'monospace'` iOS'ta bir yazı tipi adı değil | Orta |
| 4 | Sahte italik (3 yer) | Orta |
| 5 | Matematik: formül görüntüleyici yok, ≤ ≥ √ sistem yazısıyla | Orta |
| 6 | Büyük erişilebilirlik yazı boylarında yoğun bileşenlerin sınırı yok | Düşük |
| 7 | `numeric` 600, web ve marka 700 | Düşük |

## 2. Bugünkü durum

| Konu | Durum |
| --- | --- |
| Yazı tipi | `@expo-google-fonts/manrope`; `src/app/bootstrap/useAppFonts.ts` 5 yüzü açılıştan önce yükler |
| Yüz eşleşmesi | `manrope(weight)` her kalınlığa kendi yüzünü verir (`Manrope_700Bold` …); sahte kalınlık yok |
| Roller | `src/core/theme/typography.ts`: display, hero, pageTitle, title, section(Title), headline, body(+Emphasis, Muted), bodySmall(+Emphasis), label, button, input(+Value), caption(+Emphasis), meta, learningContent, examQuestion, examSupportingText, aiMessage(+Compact), numeric, timer, code … |
| Ölçek | `Type` (`tokens.ts`): 30 / 26 / 24 / 20 / 18 / 16 / 15 / 14 / 13 / 12; `scale.font` 390×844 tasarım ekranına göre hafif ölçekler; en küçük 12 |
| Rakam | `numeric`, `timer` → `fontVariant: ['tabular-nums']` |
| Erişilebilirlik | `allowFontScaling` varsayılan (açık); `maxFontSizeMultiplier` yok |
| Dil | `APP_LOCALES = ['tr-TR', 'en-US']` |
| Denetim | `typographyPolicy.test.ts`: yasak aileler, yüklü yüzler, 800/900, `Type.micro`, ekranlarda ham `fontSize` / `lineHeight` |

Web'den bilinçli farklar (standartla uyumlu, "piksel değil anlam aynı"): gövde 15 px (web 16), soru 16/26 (web 17/28), başlık ölçeği telefon için küçük.

## 3. Bulgular ve değişiklikler

### 3.1 Büyük harf ve dil (yüksek)

İki ayrı yol var, ikisi de uygulamanın dilini bilmiyor:

- **JS `toUpperCase()`** dilden bağımsızdır: Türkçede "Fizik" → "FIZIK", "Bilgi" → "BILGI" (doğrusu "FİZİK", "BİLGİ").
  - Görünen metinde: `src/modules/exam/presentation/examStudent/components/ExamStudentSectionDrawer.tsx:93` (`sec.label.toUpperCase()`, sınav bölüm başlıkları), `src/modules/profile/presentation/utils/categorySelectOptions.ts:11–18` (kategori kısa etiketi).
  - Eşleştirme anahtarı olanlar (`curriculumSubjectVisual.ts` `normalizeKey`, `profileExamCategorySelectionPolicy.ts`, ödeme ve HTTP kodları) görünen metin değildir; dokunulmaz.
- **`textTransform: 'uppercase'`** (34 yer; ör. `Typography` içindeki `sectionTitle`, `AuthSocialSection`, `ExamStudentAnnotationToolbar`). React Native'in büyük harf dönüşümü uygulamanın seçili dilini almaz; platform kendi kuralını uygular. Uygulama dili cihaz dilinden farklı olabildiği için (Türkçe uygulama, İngilizce telefon ya da tersi) Türkçe "i" harfinin "İ" olacağı garanti değildir.

**Yapılacak:**

```ts
// src/core/i18n/format.ts
import { getLocale } from './i18nStore';

/** Görünen metni uygulama dilinin kurallarıyla büyütür: tr "bilgi" → "BİLGİ", en "bilgi" → "BILGI". */
export function upper(text: string, locale = getLocale()): string {
  return text.toLocaleUpperCase(locale);
}
```

- Görünen metinde `toUpperCase()` → `upper()`.
- `textTransform: 'uppercase'` taşıyan rollerde (özellikle `sectionTitle`, eyebrow/etiketler) dönüşümü stilden metne taşıyın: rol büyük harf istemez, bileşen `upper(t('…'))` verir. Ya da yalnız dilden bağımsız kısaltmalarda (TYT, KPSS) bırakın.
- Mimari teste kural: `presentation/**` içinde `.toUpperCase()` ve `textTransform: 'uppercase'` yasak; `upper()` serbest.
- **Cihazda doğrula:** Hermes'te `toLocaleUpperCase('tr-TR')` iOS ve Android'de "i" → "İ" vermeli (repo bunu `marketCategoryFilter.ts`'te zaten kullanıyor). Bir birim testi ve iki cihazda ekran kontrolü.

### 3.2 Avrupa dilleri (yüksek, açılımda)

`mapLanguageTagToAppLocale` (`src/core/i18n/locales.ts`): `tr*` → tr-TR, `en*` → en-US, **diğer her şey → tr-TR**. Almanca ya da Hollandaca bir telefonda uygulama Türkçe açılır.

**Yapılacak:**

- Desteklenmeyen dillerde yedek `en-US` olsun; Türkçe yalnız `tr*` için.
- Yeni dil eklenirken (`de-DE`, `nl-NL` …): `APP_LOCALES`, `catalogs/`, `isAppLocale`.
- Yazı tipi tarafında ek iş yok: Manrope bütün hedef Latin dillerini kapsıyor (ß, ẞ, œ, ą, ő, ș …; yazı tipi dosyasında denendi).
- **Metin uzaması:** Almanca ve Hollandaca metinler belirgin uzun. Düğme, sekme ve çiplerde `numberOfLines={1}` ile kesmek yerine iki satıra izin; sabit genişlik yerine `minWidth`. Sekme çubuğu ve başlık çubuğu en uzun çeviriyle denenir.
- **Biçimler:** Sayı ve tarih `Intl` ile uygulama diline göre. Sabit `'tr-TR'` kullanan görünen biçimler: ör. `pushDiagnostics.ts:174`. Arama normalleştirmesindeki `toLocaleLowerCase('tr-TR')` (ör. `ExamStudentsListScreen.tsx:221`) içerik diline göre seçilmeli; Türkçe olmayan içerikte "I" harfini "ı"ya çevirip aramayı bozar.
- Kalan `'tr-TR'` kullanımları: `grep -rn "'tr-TR'" src` (i18n dışında 34 yer).

### 3.3 Eş genişlikli yazı (orta)

`Typography.code` → `fontFamily: 'monospace'`. Android'de bu genel bir aile adıdır ve çalışır; iOS'ta `monospace` adlı bir yazı tipi yoktur, metin sistem yazısıyla (eş genişlikli olmadan) çıkar.

**Yapılacak:**

```ts
code: textStyle({
  fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  // …
}),
```

**Cihazda doğrula:** iOS'ta SinoAI kod bloğu.

### 3.4 Sahte italik (orta)

Manrope'un italik yüzü yüklenmiyor, ama `fontStyle: 'italic'` 3 yerde var (`TYPOGRAPHY.md` §15'te istisna olarak yazılmış). Telefon eğik çizim üretiyor.

| Dosya |
| --- |
| `src/modules/sinoai/presentation/components/SinoAiMarkdownRenderer.tsx:112` (`em`) |
| `src/modules/works/presentation/components/players/createWorkMarkdownStyles.ts:58` |
| `src/modules/works/presentation/components/players/WorkQuizLessonView.tsx:62` |

**Yapılacak:** `em` → `manrope('600')` (gerekirse `Color.primaryText`). İstisna satırı standarttan kaldırılır, mimari teste `fontStyle: 'italic'` yasağı eklenir.

### 3.5 Matematik (orta)

Uygulamada formül görüntüleyici yok (`react-native-markdown-display`; KaTeX/MathJax yok). Formüller düz metin olarak yazılıyor. Manrope'ta ≤ ≥ ≠ ≈ √ ∞ ∑ ∫ ∆ yok; bunlar iOS'ta SF, Android'de Roboto'dan gelir. Web ve video formülleri KaTeX'le, değişkenler italik olarak gösteriyor; mobil farklı görünüyor.

**Yapılacak:**

- Kısa vadede: içerikte ∆ yerine Δ, ∑ yerine Σ (Manrope'ta var). Sistem yazısından gelen ≤ ≥ √ kabul edilebilir.
- Formül yoğun içerik (Works, SinoAI çözümleri) için bir formül görüntüleyici: KaTeX'i WebView içinde ya da yerel bir matematik bileşeni. Bu bir ürün ve performans kararı; web ve video ile aynı görünüm için önerilir.

### 3.6 Büyük erişilebilirlik boyları (düşük)

`allowFontScaling` açık, sınır yok. Bu doğru: metin, kullanıcının sistem ayarıyla büyümeli. Ama çok büyük ayarlarda yoğun bileşenler (sayaç, sekme çubuğu, şık harfi dairesi, çipler) taşabilir.

**Yapılacak:** Yalnız yoğun bileşen rollerine `maxFontSizeMultiplier` (ör. 1.3–1.5): `timer`, sekme etiketi, çip, şık harfi. Gövde, soru ve açıklamada sınır yok. iOS'ta en büyük erişilebilirlik boyu ve Android'de %200 ile bir tur ekran kontrolü.

### 3.7 Rakam kalınlığı (düşük)

`numeric` mobilde 600, web'de 700. Puan ve net her yerde aynı ağırlıkta görünsün diye 700 önerilir (`manrope('700')`). `timer` 26 px 800 olarak kalabilir (odak ekranındaki büyük sayaç).

## 4. Marka hizalaması

| Konu | Mobil | Marka standardı | Durum |
| --- | --- | --- | --- |
| Aile | Manrope (5 yüz) | Manrope | ✓ |
| Ağırlıklar | 400–800, gerçek yüzler | 400–800 | ✓ |
| Roller | web ile aynı adlar | ortak adlar | ✓ |
| Rakam | tabular | tabular | ✓ (`numeric` 600 → 700, §3.7) |
| Büyük harf | dil bilmiyor | metnin dili | §3.1 |
| Dil yedeği | tr-TR | en-US (TR dışı) | §3.2 |
| Eş genişlik | `monospace` | iOS'ta çalışan aile | §3.3 |
| İtalik | 3 sahte | yok | §3.4 |
| Matematik | düz metin | KaTeX görünümü | §3.5 |
| Logo | `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`, `logo-mark-transparent.png` | Rafine ikon, turuncu/beyaz | Logo dosyaları hazırlanınca değişecek |

## 5. Yapılacaklar listesi

1. `upper()` yardımcı fonksiyonu; görünen `toUpperCase()` ve `textTransform: 'uppercase'` yerine; mimari teste yasak. Cihazda Türkçe "İ" kontrolü.
2. Desteklenmeyen cihaz dili → `en-US`.
3. `Typography.code` için iOS'ta `Menlo`.
4. 3 sahte italiği kaldır, testle yasakla.
5. İçerikte Δ/Σ; formül görüntüleyici için ürün kararı.
6. Yoğun bileşen rollerine `maxFontSizeMultiplier`.
7. `numeric` 700.
8. Avrupa dili eklenirken: katalog, `Intl` biçimleri, en uzun çeviriyle ekran turu.
9. Yeni logo dosyaları gelince uygulama ikonu, açılış ekranı ve logo değişimi.
