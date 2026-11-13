# API · mobil · web · UI/UX uyum raporu

Tarih: 13 Kasım 2026. Salt okuma; hiçbir projede kod değişmedi.

Kaynaklar: API `sinavika/API` (102 denetleyici, 844 uç), mobil `Desktop/sinavika_mobile_reactnative/src`, web `sinavika_frontend_student/src`, tasarım `src/UIUX/Registry.ts` (259 ekran). Yöntem: denetleyicilerden uç listesi; istemcilerde dosya içi sabitler çözülerek çağrılan yollar; tasarım kayıt listesindeki rota adları ile uygulamanın gerçek rota adları ve web sayfa yolları; tasarımın istediği alanlar ile API DTO'ları.

## A. İstemci ile API arasında kırık bağ

1. **Mobil, API'de olmayan bir uca bağlı fonksiyon taşıyor.** `fetchLensSessionTranscript` → `GET student/lens/sessions/{id}/transcript`. API'deki `StudentLensController`'da böyle bir uç yok. Fonksiyon hiçbir ekrandan çağrılmıyor (ölü kod); uç kayıt listesinde de duruyor (`studentApiEndpointRegistry.ts:457`). Ya silinmeli ya API'ye uç eklenmeli.
2. Bunun dışında mobil ve web'in çağırdığı bütün yollar API'de karşılığını buluyor. Taramada "eksik" görünen öteki satırlar sorgu dizesi (`calendar?...`), önbellek anahtarı (`student/me`), sayfa yolu ya da MIME türü; gerçek bir kırık değil.

## B. Mobil ile web arasında davranış farkı

3. **Denemeden çıkma kuralı iki platformda zıt.** Web: "Kaydet ve çık" (cevaplar kalır, süre işler). Mobil: "Teslim etmeden çıkarsan deneme iptal olur, hakkın geri gelmez" (`tr-TR/exam/list.ts` `exitCancels`). API kaldığı yerden devamı destekliyor (`GET student/exams/attempts/{id}/state`). Mobil, web gibi devam ettirmeli; tasarım (`m-deneme-detay`, `m-deneme-baglanti`) da devam eden denemeyi gösteriyor.
4. **Testte cevap verme.** Mobil hâlâ seç + "Cevapla" (`quiz/solve.ts` `check: 'Cevapla'`); web tek dokunuşla cevaplıyor. Tasarım (`m-test-coz`, `w-test-coz`) tek dokunuş. Mobil iki adımı bırakmalı ya da bilinçli bir kural ise web'e de konmalı.
5. **Bilgi Kartları sayısı farklı anlatılıyor.** Web "… kart seni bekliyor" (toplam yeni kart), mobil "Bugün {count} kart" (bugünün tekrarı). Tasarım ikisinde de "bugün tekrar zamanı gelen" sayısını kullanıyor.
6. **Kalem notları web'de görünmüyor.** Mobil `student/notes` ile yazıyor ve okuyor; web hiç okumuyor. Tasarımın kuralı "notlar hesabına kaydedilir, her cihazda açılır; çözümlerde salt okunur gösterilir". Web çözüm sayfası notları salt okunur gösterebilir.
7. **Zorunlu güncelleme yalnız mobilde.** Bu doğal (web her zaman güncel), fark değil; bilgi için.
8. **Bilinçli ayrımlar (sorun değil):** bildirimler (`studentnotificationmobile` / `studentnotificationweb`), ödeme (web iyzico `studentsubscription/*`, mobil mağaza `studentsubscriptionpackagemobile/*`), misafir girişi ve hesap birleştirme (yalnız mobil).
9. **Yalnız mobilde olanlar:** "Geri bildirimlerim" (`student/feedback/my`), şifre değiştirme (`studentauth/change-password`). Web profilde bu ikisi yok; tasarımda mobil için var (`m-geri-bildirim`, `m-profil-guvenlik`), web için çizim yok.

## C. API'de olup kimsenin kullanmadığı uçlar

10. `student/preference/*` (filters, programs, recommendations): ne mobil ne web çağırıyor.
11. Eski deneme denetleyicisi `studentexam/exams/*` (start, complete, cancel, state, solutions, month): yerini `student/exams/*` almış; iki istemci de eskisini çağırmıyor. Silinebilir.
12. Reklamsız paket uçları `studentsubscriptionpackagemobile/ad-free/*`: kullanılmıyor (ücretsiz plan 20 Ekim'de kalktı).
13. `studentevent/event-bus-info`, kök `studentsupport` ve `studentprofilenotification` GET: istemcide karşılığı yok.
14. `api/students/statistics` geçici takma ad hâlâ duruyor (eski mobil sürüm için). Eski sürüm mağazadan kalkınca silinmeli.

## D. Tasarım belgelerinde eskimiş bilgi (UI/UX tarafı, bende)

Bu maddeler kodda sorun değil; benim belgelerimdeki "yeni API gerekir" notları eskimiş. API ve istemciler bunları zaten yapıyor:

15. **Deneme ekle:** API `student/external-exams` (GET, POST, DELETE, options) var; mobil (`ExamExternalResultScreen`) ve web (`externalExamService`) kullanıyor.
16. **Görev kartında neden ve miktar:** `StudyPlanTaskDto`'da `ReasonCode`, `QuestionCount`, `ResourceType/ResourceId`, `LockReason` var.
17. **Isı haritası ve en verimli saatler:** `StatisticStudentDto.BestHours` (saat dilimleri, `Cells`, `Best`) ve modül payları (`Modules`) var; mobil ve web okuyor.
18. **Zorunlu güncelleme:** `GET api/app/version` var; mobilde `ForceUpdateGate` var.
19. **Testler ve Dersler'de kalem:** API `student/notes` (hedef türü Deneme / Test / Dersler; katman taslak / soru üstü / kenar notu), mobil `QuizSolveScreen`, `WorkMikroScreen`, `WorkNotesScreen`, `ProfilePenSettingsScreen`. `Tablet-Kalem.md` "Testler ve Dersler kalemsiz" diyor; eskimiş.

## E. Tasarımdaki rota adları uygulamayla tutmuyor

Tasarım kaydındaki ad, uygulamada o adla bulunmuyor (ekran var, adı değişmiş):

20. Mobil: `ExamAbout` → `ProfileAbout`; `ExamStudentsList` → katalog rotası yok (Denemeler listesi `ExamDashboard` içinde); `WorkMikroDone` → yok (mikro ders sonu `WorkMikro` içinde); onboarding adımları `ScoreTypeStep`, `OnboardingStudyHoursStep`, `OnboardingStudySummaryStep` → `OnboardingStudyTempoStep` ve diğerleri; `ProfileSettings (yeni bölüm)` → `ProfilePenSettings`; `WorkNotes (yeni)` artık var.
21. Web: `/student/moduller` sayfası yok (Tüm modüller çizimi var, sayfa yok); `/student/ders-cal/[lessonMainId]` → `/student/ders-cal/ders/[lessonMainId]`; `/student/sinoai/study` → `/student/sinoai/uret`; `/student/sinoai/library` → `/student/sinoai/kutuphane`.

## F. Uygulamada olup tasarımı olmayan ekranlar

22. Mobil: `ExamMonth` (aylık denemeler), `ExamResultsList`, `ExamStatistics`, `ExamStatsExamNet`, `LensAnalyses`, `LensSessionCreate`, `LensSessionPdf`, `ProfileStatisticsLesson`, `QuizLessonSub`, `QuizReview`, `SinoAiLibrary`, `SinoAiSources`, `SinoAiStudyNote`, `StudyPlanPlan`, `SupportTickets`, `WorkLesson`, `WorkOverview`, `WorkReviewHome`, `WorkReviewSession`; onboarding'de `OnboardingRegionStep` ve `OnboardingWelcomeStep`.
23. Web: `/student/sinav-takvimi`, `/student/sinav/[id]/basla`, `/student/ders-cal/ders`, `/student/ders-cal/tekrar/oturum`, `/student/flashcard/bugun`, `/student/lens/gecmis`, `/student/sinoai/kaynaklarim`, `/student/sinoai/kutuphane/not/[id]`, `/student/soru-cozumleri`, `/student/testler/cozumler`, `/student/testler/konular`.

## G. Önerilen sıra

| Öncelik | İş | Kim |
|---|---|---|
| 1 | Deneme çıkış kuralını mobilde web'e eşitle (madde 3) | Mobil |
| 2 | Testte tek dokunuşla cevap (madde 4) | Mobil |
| 3 | Kırık transcript bağını sil ya da ucu ekle (madde 1) | Mobil / API |
| 4 | Kart sayısı metnini eşitle (madde 5) | Mobil + web |
| 5 | Tasarım belgelerindeki eskimiş notları ve rota adlarını düzelt; eksik ekranları çiz (D, E, F) | UI/UX (motor) |
| 6 | Kullanılmayan uçları temizle (C) | API |
| 7 | Web çözümlerde kalem notlarını salt okunur göster; web'e Geri bildirimlerim ve şifre değiştir (madde 6, 9) | Web |

## H. Tasarım tarafında yapılanlar (14 Kasım)

D, E ve F maddeleri motor tarafında kapatıldı; mobil, web ve API'de kod değişmedi.

- **D (eskimiş bilgi):** `Revizyon-2026-11-05.md` §4, §7, §8 ve `Tablet-Kalem.md` §1, §4 güncellendi: dış deneme, görev nedeni ve miktarı, en verimli saatler, modül payları, zorunlu güncelleme ve Testler/Dersler kalemi "var" olarak yazıldı. Kayıt listesindeki "Yeni API gerekir" notları ve çizim kodundaki eski yorumlar düzeltildi.
- **E (rota adları):** tasarım kaydındaki 46 rota uygulamanın gerçek adına çevrildi (ör. `ProfileAbout`, `ProfilePenSettings`, `WorkNotes`, `QuizLessonSub · QuizOverview`, `ExamResultsHub · ExamResultsList`, `/student/sinoai/kutuphane`, `/student/ders-cal/ders/[lessonMainId]`). Web sayfa yollarında eşleşmeyen kalmadı. Kalan mobil satırlar rota değil bileşen adı (`StudyPlanManualTaskSheet`, `ForceUpdateGate`, onboarding adımları) ve kodda var.
- **F (çizimi olmayan ekranlar):** 10 mobil ve 11 web çizimi eklendi:
  - Mobil: `m-onb-0-karsilama`, `m-onb-0-bolge`, `m-deneme-ay`, `m-deneme-net`, `m-istatistik-ders`, `m-ozet-pdf`, `m-sino-kaynaklar`, `m-sino-not`, `m-destek-talepler`, `m-ders-tekrar-oturum`.
  - Web: `w-sinav-takvimi`, `w-deneme-basla`, `w-deneme-cozum-liste`, `w-ders-dersler`, `w-ders-tekrar-oturum`, `w-test-konular-tum`, `w-test-cozumler`, `w-kart-bugun`, `w-ozet-gecmis`, `w-sino-kaynaklar`, `w-sino-not`.
  - Metinler uygulamaların kendi Türkçe kataloglarından alındı.
- **Kalan (bilinçli):** mobilde yalnız kapsayıcılar (modül, yığın, sekme gezginleri); web'de yalnız yönlendirme sayfaları (`/student`, `/student/moduller/ders-cal`) ile `/student/lens/video` listesi ve `/student/sinoai/[sohbet]` (sohbet çizimi `w-sino-sohbet`).
- **Örnek sayı birliği:** sınava kalan gün her yerde 245 (web üst çubuğu, onboarding ve ana ekranlar artık aynı).
- **Web'de sayfası olmayan çizim:** `w-panel-moduller` (Tüm modüller). Web ekibi sayfayı ekleyecek ya da çizim kaldırılacak; karar sahipte.
