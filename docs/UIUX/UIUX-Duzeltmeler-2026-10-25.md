# UI/UX düzeltmeleri

25 Ekim 2026. Bu rapor, [UIUX-Degerlendirme-2026-10-25.md](UIUX-Degerlendirme-2026-10-25.md) dosyasındaki bulguların nasıl kapatıldığını anlatır. Sahibin isteği: "Hepsini düzenle, klasörü güncelle, değişenleri yaz." Giriş ve kayıt sayfalarına bir tanıtım alanı da eklendi.

Değişiklikler dört yerde yapıldı:
- **Mobil:** `sinavika_mobile_reactnative`
- **Web:** `sinavika_frontend_student`
- **API:** `sinavika`
- **Tasarım seti:** motorda `src/UIUX`, çıktısı `Desktop\Sinavika-UIUX3`

Hiçbir şey commit edilmedi ve hiçbir şey yayına çıkmadı.

> **Web, API ve mobil ajanı için devir notu.** Bu rapordaki web, API ve mobil değişiklikleri **zaten ilgili depoların çalışma kopyasında**; dosya adları aşağıdaki bölümlerde yazıyor. Commit edilmediler. Yapılacaklar:
> 1. Değişiklikleri gözden geçir. Yeniden yazma; ancak beğenmediğin yer olursa düzelt.
> 2. Kendi testlerinle doğrula.
> 3. Commit et. Yayına almayı sahiple planla.
>
> Bu depolardaki sonraki işler artık senin. Bölüm 5'teki kararlar (SQL 13, cevap değiştirme) da sana ait. Tasarım seti ve `src/UIUX` motorda kalır.

## 1. Özet

| # | Bulgu | Durum | Nerede |
|---|---|---|---|
| 1 | Denemede cevap anında doğru/yanlış diye boyanıyor | **Düzeltildi** | Mobil, web |
| 2 | Ders Planı'nda "günde 60 dk" ile "30 dk" çelişiyor | **Düzeltildi** | Mobil, web |
| 3 | Test seviyeleri: uygulamada "Kolay tarama", tasarımda 5 seviye | **Düzeltildi**; eski kayıtlar için SQL hazır, onay bekliyor | Mobil, API, tasarım |
| 4 | Tasarım seti güncel değil | **Yeniden üretildi** | Masaüstü klasörü |
| 5 | Ekran okuyucu etiketleri eksik | **Düzeltildi** | Mobil |
| 6 | Renkli zeminde soluk metin ve küçük rozetler | **Düzeltildi** | Mobil, tasarım |
| 7 | SinoAI üretim sonucundaki eylemler düğme gibi görünmüyor | **Düzeltildi** | Mobil, web, tasarım |
| 8 | Web paneli geniş ekranı boş bırakıyor | **Düzeltildi** (tasarım); canlı web zaten iki sütunlu | Tasarım |
| 9 | "0 çalışılıyor" | **Düzeltildi** | Mobil |
| Yeni | Giriş ve kayıt sayfalarına tanıtım alanı | **Eklendi** | Web, tasarım |

## 2. Ne değişti

### 2.1 Deneme artık sınav provası gibi

Öğrenci şıkkı seçince yalnız seçili görünüyor; doğru ya da yanlış gösterilmiyor. Sonuçlar, deneme teslim edildikten sonra çözümlerde açılıyor. Anında geri bildirim **Testler**'de olduğu gibi kalıyor.

- **Mobil:** cevap sonucunu tutan durum ve yeşil/kırmızı şık boyaması kaldırıldı.
  - `useExamStudentSolveInteraction.ts`
  - `ExamStudentSolveQuestionBody.tsx`
  - `ExamStudentSolveScreen.tsx`
- **Web:**
  - "Doğru / Yanlış · doğru şık C" satırı kaldırıldı. Yerine nötr bir not geldi: "Cevabın kaydedildi. Doğru cevaplar denemeyi bitirince açılır."
  - Kullanılmayan doğru/yanlış alanları ve metinleri silindi.
  - Dosyalar:
    - `ExamQuestionPanel.tsx`
    - `ExamSolvePage.tsx`
    - `useExamSolveSession.ts`
    - `exam-sessions.ts` (TR ve EN)

**Bilinmesi gerekenler (karar senin):**
- **Cevap değiştirme:** Cevaplar hâlâ ilk seçimde kilitleniyor. Bu bir sunucu kuralı (`lockOnFirstSubmit`). Bu kural büyük olasılıkla anında geri bildirim gösterildiği için konmuştu. Gerçek sınavda cevap değiştirilebilir. Bunu açmak bir API değişikliği gerektirir.
- **Doğru şık API yanıtında:** API, cevap kaydında doğru şıkkı hâlâ döndürüyor, çünkü eski uygulama sürümleri bu alanı okuyor. Yeni sürüm yaygınlaşınca bu alan yanıttan çıkarılmalı; ağ trafiğini izleyen biri doğru cevabı görebilir.

### 2.2 Ders Planı'nda tek sayı

SinoAI'nin plan önerisi kartı, öğrencinin hedefini (60 dk) gösteriyordu. Hemen altında etkin planın bugünkü görev süresi (30 dk) duruyordu. Kart artık önerideki görevlerin gerçek ortalamasını gösteriyor: "… · ortalama günde 35 dk". Hedef yalnız görevlerin toplam süresi bilinmiyorsa gösteriliyor.
- **Mobil:** `StudyPlanDraftCard.tsx`, `studyPlan.ts` (TR ve EN).
- **Web:** `StudyPlanDraftCard.tsx`, `study-plan.ts` (TR ve EN).

### 2.3 Test seviyeleri: Kolay, Orta, Zor

Üründe her konunun 3 seviyesi var. Kolay, Orta ve Zor her biri 20 soru. Tasarım artık bunu gösteriyor; öğrenci "tarama" kelimesini görmüyor.

- **Mobil:** Seviye listesinde her satırın başlığı seviye adı ("Kolay"). Konu adı zaten ekranın başlığında. Bu sayede veritabanındaki eski başlık da görünmüyor (`QuizStepPath.tsx`).
- **API:**
  - Yeni testlerin adı "Sözcükte Anlam — Kolay" biçiminde. SAT ve ACT için İngilizce: "— Easy / Medium / Hard" (`QuizGenerationProductionPlanBuilder.cs`).
  - Bir test güncellendi, bir test eklendi. Quiz üretim testleri geçti (23/23).
- **Veritabanı:**
  - "… tarama" adlı **2.511 test** var: 993 Kolay, 759 Orta, 759 Zor.
  - Bu testlerin adını düzelten SQL hazır: `sinavika/docs/sql/13-quiz-titles-without-tarama.sql`.
  - **Çalıştırılmadı; senin onayını bekliyor.** Web'de test oynatıcısının başlığı bu adı gösterdiği için SQL gerekli.
- **Tasarım:**
  - 5 seviye (Temel … Ustalık) ve "10 soru" çizimleri 3 seviyeye ve 20 soruya çekildi.
  - "Seviye 2" geçen yerler "Orta" oldu.
  - Seviye çubukları 3 parça.

### 2.4 Erişilebilirlik

**Ekran okuyucu.** Mobil kodda tıklanabilir öğeler yeniden sayıldı. Değerlendirmedeki "726'dan 250'si" sayısı fazla kaba bir taramadan gelmişti; bu tarama `Pressable` öğelerine bakıyor. Düzeltmeden önceki durum:

| Durum | Öğe sayısı |
|---|---|
| Etiketi var | 138 |
| İçinde okunan bir metin var; ekran okuyucu metni okur | 140 |
| Ne metni ne etiketi var | **12** |
| **Toplam** | **290** |

Ortak `AppIconButton` bileşeni etiketi zorunlu tutuyor; şıklar zaten "A şıkkı, …" diye okunuyor. Etiketsiz 12 öğe şöyle düzeltildi:
- Pencerelerin arkasındaki karartılmış alanlar: 8 yerde "Kapat" etiketi.
- SinoAI üretim detayının kapatma ikonu.
- İstatistikte açılır/kapanır bölüm başlığına "açık/kapalı" durumu.

Kalan 2 öğe zaten metin içeriyordu.

**Kontrast** (WCAG AA: normal metin için en az 4,5:1):
- **Mobil:** Modül renginde yazılan metin, kendi açık zemininde 3,1–3,8:1 kalıyordu; turuncu, mavi, yeşil ve pembe modüllerde sorun vardı.
  - Modül paletine `ink` adlı bir yazı rengi eklendi. Modül rengi adım adım koyulaştırılıyor (koyu temada açılıyor) ve modülün en güçlü tonunda da 4,5:1'i geçene kadar devam ediliyor.
  - Bunu kullanan dosyalar: `moduleIdentity.ts`, `resolveModuleInk`.
  - Modül renginde yazılan 16 yer (rozet, "Tümü", tarih, yüzde) bu renge geçti. İkonlar ve dolgular modül renginde kaldı.
- **Tasarım:**
  - Aynı kural `moduleInk` adıyla eklendi.
  - Açık temadaki soluk metin #64748B'den #5F6B7D'ye geçti. Eski renk sayfa zemininde bile 4,44:1'di; yenisi her açık zeminde en az 4,86:1.
  - Modül renkli kartın içinde soluk metin yerine koyu ikincil metin kullanılıyor.
  - Başarı, uyarı ve hata rozetlerine koyu yazı tonları eklendi. Önceki oranlar: başarı 3,4:1, uyarı 2,9:1, hata 4,0:1. Şimdi hepsi en az 4,5:1.
- **En küçük yazı 12 pt:**
  - Tasarımda `over` rolü 11'den 12'ye çıktı.
  - Küçük rozet yazısı 10,5'ten 12'ye çıktı.
  - Ekranlarda elle verilmiş 10–11 pt yazılar artık 12'nin altına inemiyor.
  - Mobil uygulamada zaten 12'nin altında yazı yoktu.

### 2.5 SinoAI üretim sonucu

Üretilen içeriğin kartında artık iki gerçek düğme var: dolu bir ana düğme ("Testi aç") ve çerçeveli ikincil düğme "Değiştir". "Değiştir"e basınca açılan form, kartın içinde tam genişlikte duruyor.
- **Mobil:**
  - Dosyalar: `SinoAiArtifactCardShell.tsx`, `SinoAiDomainArtifactCards.tsx`, `SinoAiArtifactRenderer.tsx`, `SinoAiArtifactRevision.tsx`.
  - Ana düğme önceden soluk bir hap gibiydi; şimdi 44 pt yüksekliğinde dolu bir düğme.
- **Web:** "Değişiklik iste" yazısı, kalem ikonlu çerçeveli bir "Değiştir" düğmesi oldu (`SinoaiArtifactRevision.tsx`).
- **Tasarım:** Yeni ekran `m-sino-sonuc`: sonuç kartı, iki düğme ve hemen altında "Sırada ne var?" önerileri.

### 2.6 Web panelinde geniş ekran

Canlı web panelinde içerik genişliği yaklaşık 1150 px. Destek ve Ödeme sayfaları zaten iki sütunlu. Boşluk sorunu tasarım çizimlerindeydi.

Tasarımda yapılanlar:
- **Ödeme başarılı:** Sayfa iki sütun oldu: solda sonuç, sağda "Sırada ne var?" (bugünkü plan, ilk deneme, SinoAI). Ödeme başarısız sayfası ortada kaldı.
- **Yazı ölçeği:** Web paneli ve tam ekran sayfalarda gövde, küçük ve meta yazılar 1 pt büyüdü. Bu ortak bileşende yapıldı; web sayfalarındaki telefon görselleri etkilenmiyor.

### 2.7 Giriş ve kayıt sayfasında tanıtım

Onboarding'deki düzen buraya da taşındı (senin sevdiğin şekil): solda form, sağda yumuşak bir panel.

Sağ panelin içeriği:
- **Başlık:** Girişte "Kaldığın yerden devam et", kayıtta "Ne çalışacağını bil, her gün ilerle".
- **Kısa açıklama.**
- **Üç madde:**
  - denemeler ve net analizi;
  - eksik konulara göre Ders Planı;
  - SinoAI ile adım adım çözüm.
- **Görsel:** panel ve telefon.
- **Mağaza düğmeleri.**

Davranış:
- Panel yalnız geniş ekranda (lg ve üstü) görünüyor; telefonda form tek başına kalıyor.
- Uzun kayıt formunda panel yerinde sabit kalıyor.
- Metinler TR ve EN.
- Metinlerde "ücretsiz" iddiası yok. Abonelik kuralına göre ödeme yoksa erişim de yok.

Dosyalar:
- **Web:**
  - `AuthShowcase.tsx` (yeni)
  - `LoginPage.tsx`, `RegisterPage.tsx`
  - `auth.ts` (TR ve EN)
- **Tasarım:**
  - `AuthLayout`: `promo` aldığında ikiye bölünüyor.
  - `w-giris` ve `w-kayit` ekranları. Şifre sayfaları ortada kaldı.

Yerel sunucuda kontrol edildi: 1440 px'te giriş ve kayıt yeni düzende, telefon genişliğinde eskisi gibi, konsolda hata yok.

### 2.8 Küçük dil düzeltmesi

"{n} çalışılıyor" ifadesi "{n} devam ediyor" oldu; yanındaki "başlanmadı" ve "tamamlandı" ile aynı biçimde. "{n} konu çalışılıyor" da "{n} konu devam ediyor" oldu.

## 3. Tasarım seti (Desktop\Sinavika-UIUX3)

Bütün set yeniden üretildi: açık ve koyu tema, mobil, web paneli, site ve panolar. Ekran envanteri (`docs/UIUX/Ekran-Envanteri.md`) de yeniden yazıldı.

Setle ilgili notlar:
- Yeni ekran: `m-sino-sonuc`. Mobil ekran sayısı 89'dan 90'a çıktı.
- 15 Ekim'den sonraki bütün kod değişiklikleri sette yer alıyor; örneğin Türkçe "quiz" yerine "test".
- Klasördeki `docs/` dosyaları motordaki güncel kopyalarıyla değiştirildi; bu rapor da oraya eklendi.

## 4. Doğrulama

- **Mobil:** Tip kontrolü temiz. Bütün testler geçti (1.614 test, 326 dosya).
- **Web:** Tip kontrolü temiz. İlgili testler geçti (43/43). Giriş ve kayıt sayfaları tarayıcıda açılıp kontrol edildi.
- **API:** Derleme temiz. Quiz üretim testleri geçti (23/23).
- **Motor:** Tip kontrolü temiz. UIUX testleri geçti (9/9). Değişen ekranlar tek tek açılıp kontrol edildi.

## 5. Senin kararın ya da onayın gereken işler

1. **SQL 13:** 2.511 testin adından "tarama"yı kaldırır. Canlı veritabanına yazar.
2. **Denemede cevap değiştirme:** Gerçek sınav gibi değiştirilebilsin mi? Bu bir API değişikliği.
3. **Site fiyat tablosu:** Tasarım setindeki tabloda "Ücretsiz · ₺0" planı var. Bu, "ödeme yoksa erişim yok" kuralıyla çelişiyor. Kaldırılmalı mı, yoksa bir ücretsiz katman mı planlanıyor?
4. **Yayın:**
   - Mobil için yeni sürüm gerekiyor.
   - Web ve API ayrıca yayına alınmalı.
   - Üç projede de commit yok.

## 6. Hâlâ açık olanlar

- **Ekran okuyucu turu:** VoiceOver ve TalkBack ile gerçek cihazda bir deneme baştan sona hâlâ denenmedi. Kod tarafı hazır; bu tur elle yapılmalı.
- **Kanıt eksik:** Öğrenci testi ve huni ölçümü hâlâ yok. "Kusursuz" demek için gereken kanıt bunlar (değerlendirme raporu §5).

## Ek (26 Ekim 2026): web ve mobil için ad tutarlılığı

Tuğçe'nin Instagram incelemesinde bir tutarsızlık çıktı: reels'te "Kitaplığında" yazıyordu, ama telefonda "Kütüphanen" görünüyordu. Tasarım seti ve web, SinoAI'nin üretimlerinin durduğu yere **Kütüphane** diyor. Uygulamalarda da ad tek olmalı.

| Yer | Bugün | Olmalı |
|---|---|---|
| Mobil `src/core/i18n/catalogs/tr-TR/sinoai.ts` → `library` | "Kitaplık" | "Kütüphane" (menü ve başlık) |
| Mobil, aynı dosya → `studyLimitReached` | "Kütüphanendeki" | Kalabilir |
| Web `src/i18n/messages/tr/post-login/sinoai.ts` → `subhead` | "Sonuç Kütüphanen’de görünür." | "Sonuç kütüphanende görünür." (cümle içinde küçük harf) |

Başlık ve menüdeki ad büyük harfle başlar ("Kütüphanen"); cümle içinde küçük harfle yazılır ("kütüphanende"). Motordaki reklam ve gönderi metinleri düzeltildi. Ürün metni denetimi artık "Kitaplık"ı hata sayıyor.
