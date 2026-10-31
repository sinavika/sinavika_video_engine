# Modül kimliği: renk, ad ve merkezi kod

Sınavika'nın yedi modülünün her birinin bir **kimlik rengi** vardır. Bu belge rengin nasıl kullanılacağını ve her serviste bu bilginin hangi tek dosyada duracağını tanımlar. Dört projede aynı içerikle durur: API, web, mobil ve içerik motoru.

**Tarih:** 29 Ekim 2026
**Kaynak kod (tek doğru):** `sinavika_video_engine/src/UIUX/ModuleIdentity.ts`
**İlgili:** `BrandIdentity.md` §5 (adlar ve renk kuralı), `Adlandirma-Kurallari.md` (görünen ad ↔ kod adı), `UIUX-Rehberi.md` (tasarım sistemi)

## 1. Neden

- Öğrenci hangi modülde olduğunu yazıyı okumadan, renkten anlar.
- Aynı modül her yerde aynı renktedir: hub kartı, slayt, sekme, sayfa zemini, bildirim, plan görevi, e-posta ikonu, mağaza görseli, sosyal medya.
- Modülün içinde "bu ekranı" gösteren her şey modülün rengindedir: ikon kutuları, sekme hapı, slayt, ilerleme, seçili durumlar ve **ana düğme**.
- Turuncu yalnız marka yüzeylerindedir: logo, giriş ve kayıt, onboarding, ödeme ve abonelik, profil, site. Denemeler'in kendi rengi turuncu olduğu için turuncu modül yalnız Denemeler'dir.

## 2. Renkler

| Modül | Anahtar (`moduleKey`) | Açık tema | Koyu tema | Gradyan ikinci durak |
|---|---|---|---|---|
| Denemeler | `exam` | `#E8590C` | `#FB8A3C` | `#F59E0B` |
| Dersler | `lessons` | `#0284C7` | `#38BDF8` | `#22D3EE` |
| Testler | `tests` | `#4F46E5` | `#818CF8` | `#8B5CF6` |
| Ders Planı | `studyPlan` | `#0D9488` | `#2DD4BF` | `#34D399` |
| Akıllı Özet | `smartSummary` | `#7C3AED` | `#A78BFA` | `#C026D3` |
| Bilgi Kartları | `flashcards` | `#DB2777` | `#F472B6` | `#F43F5E` |
| SinoAI | `sinoAi` | nötr `#475569` | `#CBD5E1` | `#94A3B8` |

- Kimlik renkleri beyaz yazıyla en az **3:1** verir (simge ve büyük yazı için yeter).
- **Düğme rengi (`moduleAction`):** düğme dolgusu, kimlik renginin beyaz yazıyla **4,5:1** tutana kadar %5 adımlarla koyulaştırılmış hâlidir; iki temada aynıdır. Koyu temadaki açık renkler beyaz yazıyla 1,5–3,0:1 kalıyordu.

| Modül | Düğme rengi | Beyaz yazıyla |
|---|---|---|
| Denemeler | `#C54C0A` | 4,8:1 |
| Dersler | `#0277B3` | 4,9:1 |
| Testler | `#4F46E5` | 6,3:1 |
| Ders Planı | `#0C857A` | 4,5:1 |
| Akıllı Özet | `#7C3AED` | 5,7:1 |
| Bilgi Kartları | `#DB2777` | 4,6:1 |
| SinoAI | `#475569` | 7,6:1 |
| Marka (modül dışı) | `#C2410C` | 5,2:1 |

- Logo ve simgeler marka turuncusunu (`#EA580C`) korur; yalnız düğme dolgusu `#C2410C`'dir. İkisini de test kontrol eder (`tests/UIUX/UIUX.test.ts`).
- SinoAI'nin rengi yoktur: web ve mobilde **beyaz zemin, gri tonlar**; sohbet ekranı ChatGPT/Gemini gibi sade (geçmiş sütunu, ortada tek sohbet sütunu, yuvarlak yazma kutusu, mürekkep gönder düğmesi). Kıvılcım gradyanı kaldırıldı.
- **Sakin yüzeyler (`calm`):** giriş öncesi site `UIProvider calm` içinde çizilir; modül renkleri griye düşer. Uygulama maketleri (`DevicePhone`, `DeviceBrowser`) `calm={false}` ile kendi renklerine döner.
- Durum renkleri (yeşil başarı, sarı uyarı, kırmızı hata) modül renginden ayrıdır ve yalnız durum bildirir.

## 3. Saydam katmanlar

Modül rengi yeni bir renk üretilerek açılmaz. Aynı rengin **sabit opaklık adımları** kullanılır:

| Adım | Opaklık (açık / koyu tema) | Nerede |
|---|---|---|
| `wash` | %7 / %12,6 | Modül sayfasının üstündeki zemin geçişi |
| `soft` | %12 / %21,6 | İkon kutusu, seçili satır, çip, aktif sekme hapı |
| `track` | %16 / %28,8 | İlerleme halkası ve çubuğun boş kısmı, grafik alanı |
| `line` | %24 / %43,2 | Modül renkli kenarlıklar ve ayırıcılar |

Koyu temada opaklık 1,8 ile çarpılır; aynı görünür yoğunluk korunur.

## 4. Nerede kullanılır, nerede kullanılmaz

**Kullanılır**

- Hub: modül slaytı (gradyan) ve modül kartının alt paneli (`soft`).
- Modül sayfaları: sayfa zemini (`wash`), sayfa başlığındaki modül çipi, ikon kutuları.
- Tab bar: aktif sekmenin hapı (`soft`) ve ikon/yazı rengi.
- Web panel: sol menüdeki modül ikonu ve aktif satırın şeridi, modül başlık kartı, modül sekmeleri.
- İlerleme halkası ve çubukları, plan görevlerinin sol kenarı, program ızgarası.
- Bildirim satırı ikonu; e-posta ve push'ta modül ikonu.
- Mağaza, site ve sosyal medya görsellerinde modül anlatımı.

**Kullanılmaz**

- Turuncu: modül ekranında turuncu düğme, çip, halka ya da bağlantı olmaz (Denemeler hariç). Test, Denemeler dışındaki modül ekranlarında marka turuncusunu arar.
- Başka modülü açan düğme **o modülün** rengindedir: konu sonundaki "Kolay seviye testi" ve SinoAI'deki "Testi aç" Testler renginde, yanlış cevaptan sonraki "Mikro ders" Dersler renginde.
- Uzun gövde metni: modül renginde paragraf yazılmaz.
- Durum: "doğru" yeşil, "yanlış" kırmızıdır; modül renginde gösterilmez.
- Bir ekranda başka bir modülün rengi yalnız o modüle bağlantı verirken görünür. Örnek: deneme analizindeki "Mikro ders" çipi Dersler renginde, "10 soru" çipi Testler renginde.

## 5. Merkezi kod: her serviste tek dosya

Modül bilgisi her projede **tek bir dosyada** tanımlanır. Bileşenler renk, ad ya da sekme yazmaz; bu dosyadan okur.

| Servis | Dosya | İçerik |
|---|---|---|
| İçerik motoru (kaynak) | `src/UIUX/ModuleIdentity.ts` | Tam tablo: ad (TR/EN), ikon, renk, gradyan, kod adları, sekmeler, slayt metni, `moduleTint`, `moduleGradient` |
| Web (`sinavika_frontend_student`) | `src/core/modules/moduleIdentity.ts` (yeni) | Aynı tablo; adlar i18n anahtarı olarak. Tailwind temasına `module.*` renkleri buradan üretilir |
| Mobil (`sinavika_mobile_reactnative`) | `src/core/theme/moduleIdentity.ts` (yeni) | Aynı tablo; adlar i18n anahtarı olarak. `MainTabBar` ve hub kartları buradan okur |
| API (`sinavika`) | `Domain/Modules/StudentModuleKey.cs` (yeni) | Yalnız anahtar (enum). Bildirim, e-posta ve analitik olayları `moduleKey` taşır; renk istemcide çözülür |

### 5.1 TypeScript biçimi (web ve mobil)

```ts
export type ModuleKey = 'exam' | 'lessons' | 'tests' | 'studyPlan' | 'smartSummary' | 'flashcards' | 'sinoAi';

export type ModuleIdentity = {
  key: ModuleKey;
  nameKey: string;          // i18n: 'modules.exam.name' → "Denemeler"
  taglineKey: string;       // i18n: 'modules.exam.tagline'
  icon: IconName;           // ortak ikon seti
  color: {light: string; dark: string};
  gradientTo: string;
  tabs: [TabSlot, TabSlot, TabSlot] | null;   // yuva 1, 2, 4; 3 Modüller, 5 Profil
};

export const MODULE_ORDER: readonly ModuleKey[] = ['exam', 'lessons', 'tests', 'studyPlan', 'smartSummary', 'flashcards', 'sinoAi'];
export const TINT = {wash: 0.07, soft: 0.12, track: 0.16, line: 0.24} as const;
```

Değerler §2 ve §3'teki tablolarla birebir aynıdır. Bir değer değişirse önce içerik motorundaki kaynak, sonra bu belge, sonra uygulamalar güncellenir.

### 5.2 C# biçimi (API)

```csharp
namespace Domain.Modules;

/// Öğrenci modülleri. İstemciler rengi ve adı bu anahtardan çözer (docs/UIUX/Modul-Kimligi.md).
public enum StudentModuleKey
{
    Exam = 1,
    Lessons = 2,
    Tests = 3,
    StudyPlan = 4,
    SmartSummary = 5,
    Flashcards = 6,
    SinoAi = 7,
}
```

JSON'a `"exam"`, `"lessons"` gibi camelCase metin olarak yazılır. Bildirim gelen kutusu, push verisi (`fallbackTargetType` yanında) ve e-posta şablonları bu anahtarı taşır.

## 6. Sekme yuvaları

| Modül | Yuva 1 | Yuva 2 | Yuva 3 | Yuva 4 | Yuva 5 |
|---|---|---|---|---|---|
| Denemeler | Denemeler | Denemelerim | Modüller | Sonuçlar | Profil |
| Dersler | Dersler | Konular | Modüller | Tekrar | Profil |
| Testler | Testler | Konular | Modüller | Çözümler | Profil |
| Ders Planı | Bugün | İlerleme | Modüller | Program | Profil |
| Akıllı Özet | Akıllı Özet | Soru yükle | Modüller | Video | Profil |
| Bilgi Kartları | Kartlar | Bugün | Modüller | Kaydedilenler | Profil |
| SinoAI | — | — | — | — | — (tam ekran; Sohbet · Çalışma geçişi üstte) |

Web'de modül sayfasının üstündeki hap sekmeler yuva 1, 2 ve 4'tür. Web'e özgü ek sekmeler bunların arkasına gelir; örneğin Ders Planı'nda Öneriler, İstatistik, Ayarlar.

## 7. Denetim listesi

1. Yeni ekran bir modüle aitse `module` bilgisi var mı?
2. Renk, ad ve ikon merkezi dosyadan mı geliyor?
3. Ana düğme modülün düğme renginde mi (modül dışında marka düğme renginde mi)?
4. Modül rengi yalnız §4'teki yerlerde mi?
5. Koyu temada `dark` değeri ve 1,8 kat opaklık mı kullanılıyor?
6. Durum renkleri ve modül rengi karışmıyor mu?
