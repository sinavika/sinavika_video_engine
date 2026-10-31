import type React from 'react';
import type {ModuleKey} from './ModuleIdentity';
import * as Account from './Screens/Mobile/Account';
import * as Assist from './Screens/Mobile/Assist';
import * as Auth from './Screens/Mobile/Auth';
import * as Exam from './Screens/Mobile/Exam';
import {HubScreen, HubScrolledScreen, HubTipScreen} from './Screens/Mobile/Hub';
import * as Tests from './Screens/Mobile/Learn';
import * as Lessons from './Screens/Mobile/Lessons';
import * as Onb from './Screens/Mobile/Onboarding';
import * as Plan from './Screens/Mobile/Plan';
import * as Sino from './Screens/Mobile/SinoAI';
import * as SiteP from './Screens/Site/Site';
import * as WAssist from './Screens/Web/AssistWeb';
import * as WExam from './Screens/Web/ExamWeb';
import * as WLessons from './Screens/Web/LessonsWeb';
import * as WOnb from './Screens/Web/OnboardingWeb';
import * as WPanel from './Screens/Web/Panel';
import * as WPlan from './Screens/Web/PlanWeb';
import * as WSino from './Screens/Web/SinoWeb';
import * as WTests from './Screens/Web/TestsWeb';

/**
 * Every UI/UX drawing, by id. The export (`npm run uiux`), the boards and the
 * screen inventory (docs/UIUX/Ekran-Envanteri.md) read this list.
 *
 * Ids: m-<group>-<name> mobile, w-<group>-<name> web panel, s-<name> site.
 * `route` names the screen in the app (mobile route name or web path), so a
 * drawing maps to the code that draws it. `note` says what the screen does.
 */
export type UIPlatform = 'mobile' | 'web' | 'site';

export type UIScreen = {
	id: string;
	platform: UIPlatform;
	/** Board the drawing belongs to. */
	group: string;
	title: string;
	/** The module the screen belongs to, if any. */
	module?: ModuleKey;
	/** Mobile route name or web path in the app. */
	route: string;
	/** What the screen does, one or two sentences. */
	note: string;
	Component: React.FC;
	/** Site pages: full page height in points. */
	height?: number;
};

const mobile = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'mobile', group, title, route, Component, note, module});
const web = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'web', group, title, route, Component, note, module});
const site = (id: string, group: string, title: string, route: string, Component: React.FC, height: number, note = ''): UIScreen => ({id, platform: 'site', group, title, route, Component, note, height});

export const UI_SCREENS: readonly UIScreen[] = [
	mobile('m-hub-moduller', 'Modüller', 'Modüller (ana ekran)', 'ModuleHubHome', HubScreen, 'Uygulamanın ana ekranı: üstte her modülün bugünkü teklifi slayt olarak, altında modül kartları. Logo yalnız bu ekranda ve marka ekranlarında.'),
	mobile('m-hub-moduller-kaydir', 'Modüller', 'Modüller · aşağı kaydırılmış', 'ModuleHubHome', HubScrolledScreen, 'Kartların tamamı, SinoAI geniş kartı ve Destek.'),
	mobile('m-hub-ipucu', 'Modüller', 'İlk açılış ipucu', 'ModuleHubHome', HubTipScreen, 'Modüller ilk açıldığında tek ipucu. Ön tanıtım turu yok; her özellik ilk karşılaşıldığı yerde tek satırla anlatılır.'),
	mobile('m-giris-karsilama', 'Giriş ve kayıt', 'Karşılama', '—', Auth.WelcomeScreen, 'İlk açılış: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var.'),
	mobile('m-giris-oturum-ac', 'Giriş ve kayıt', 'Oturum aç veya kaydol', 'AuthLogin', Auth.SignInScreen, 'Apple ve Google üstte, e-posta altta; hesap varsa kod gider, yoksa kayıt açılır.'),
	mobile('m-giris-kod', 'Giriş ve kayıt', 'Doğrulama kodu', 'AuthLogin', Auth.SignInCodeScreen, '6 kutulu kod, yeniden gönderme süresi, şifreyle giriş seçeneği.'),
	mobile('m-kayit-eposta', 'Giriş ve kayıt', 'Hesap oluştur', 'AuthRegister', Auth.SignUpScreen, 'Apple ve Google önde; e-postayla devam edene kod gider.'),
	mobile('m-kayit-bilgiler', 'Giriş ve kayıt', 'Hesap oluştur · adın', 'AuthRegister', Auth.SignUpDetailsScreen, 'Yalnız ad ve onay. Şifre gerekmez: her girişte e-postaya kod gelir; şifre sonra Hesap güvenliği’nden eklenir.'),
	mobile('m-sifre-unuttum', 'Giriş ve kayıt', 'Şifremi unuttum', 'AuthForgotPassword', Auth.ForgotPasswordScreen, ''),
	mobile('m-sifre-yeni', 'Giriş ve kayıt', 'Kod ve yeni şifre', 'AuthForgotPassword', Auth.NewPasswordScreen, ''),
	mobile('m-giris-sayfa', 'Giriş ve kayıt', 'Misafir · hesap gerekli', 'AuthEntrySheet', Auth.AuthSheetScreen, 'Misafir hesap isteyen bir şeye dokununca alt sayfa açılır.'),
	mobile('m-onb-1-sinav', 'Onboarding', 'Onboarding 1 · Sınav ve oturum', 'OnboardingCategoryExamStep + ScoreTypeStep', Onb.OnbExamScreen, 'Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir.'),
	mobile('m-onb-2-net', 'Onboarding', 'Onboarding 2 · Mevcut ve hedef net', 'OnboardingStudyNetStep', Onb.OnbScoreScreen, 'Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”.'),
	mobile('m-onb-3-tempo', 'Onboarding', 'Onboarding 3 · Tempo ve günler', 'OnboardingStudyHoursStep + QuestionsStep', Onb.OnbTempoScreen, 'Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz).'),
	mobile('m-onb-4-dersler', 'Onboarding', 'Onboarding 4 · Zorlandığın dersler', 'OnboardingStudyWeakStep', Onb.OnbWeakScreen, 'İsteğe bağlı; planda bu derslere daha çok yer ayrılır.'),
	mobile('m-onb-5-plan', 'Onboarding', 'Onboarding 5 · Planın hazır', 'OnboardingStudySummaryStep', Onb.OnbPlanScreen, 'Hafta modül renkleriyle; bugünkü ilk görev somut. İlerleme çubuğu planı kuran beş adımı sayar.'),
	mobile('m-onb-6-hesap', 'Onboarding', 'Planını kaydet', 'AuthRegister', Onb.OnbAccountScreen, 'Hesap ödeme ekranından önce: önce emeğin güvene alınır. Apple ve Google önde, e-posta ikincil.'),
	mobile('m-onb-7-deneme', 'Onboarding', '3 gün ücretsiz', 'OnboardingTrialStep', Onb.OnbTrialScreen, 'Bugün, hatırlatma günü ve ücret günü açıkça. Başlayınca öğrenci bugünkü ilk mikro derse girer.'),
	mobile('m-onb-8-bildirim', 'Onboarding', 'Bildirim izni · ilk mikro dersten sonra', '—', Onb.OnbNotificationsScreen, 'İzin, ilk mikro ders bitince ve hatırlatmanın değeri belliyken istenir; sistem penceresinden önce kendi açıklamamız.'),
	mobile('m-deneme-vitrin', 'Denemeler', 'Denemeler', 'ExamDashboard', Exam.ExamHomeScreen, 'Canlı deneme slaytı, devam eden deneme ve öneriler.', 'exam'),
	mobile('m-deneme-katalog', 'Denemeler', 'Tüm denemeler', 'ExamStudentsList', Exam.ExamCatalogScreen, '', 'exam'),
	mobile('m-deneme-detay', 'Denemeler', 'Deneme detayı', 'ExamStudentPublicDetail', Exam.ExamDetailScreen, '', 'exam'),
	mobile('m-deneme-baslangic', 'Denemeler', 'Başlamadan önce', 'ExamStudentStarting', Exam.ExamStartingScreen, '', 'exam'),
	mobile('m-deneme-coz', 'Denemeler', 'Deneme çözme', 'ExamStudentSolve', Exam.ExamSolveScreen, 'Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Doğru ve yanlış teslimden sonra açılır.', 'exam'),
	mobile('m-deneme-denemelerim', 'Denemeler', 'Denemelerim', 'MyExams', Exam.MyExamsScreen, 'Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede.', 'exam'),
	mobile('m-deneme-sonuclar', 'Denemeler', 'Sonuçlar', 'ExamResultsHub', Exam.ExamResultsScreen, '', 'exam'),
	mobile('m-deneme-sonuc', 'Denemeler', 'Sonuç', 'ExamResultDocument', Exam.ExamResultScreen, '', 'exam'),
	mobile('m-deneme-analiz', 'Denemeler', 'Eksik konu analizi', 'ExamStatsLessonOverview', Exam.ExamAnalysisScreen, 'Analiz eylemle biter: mikro ders, test, plana ekle.', 'exam'),
	mobile('m-deneme-gelisim', 'Denemeler', 'Ders gelişimi', 'ExamStatsLessonTrend', Exam.ExamTrendScreen, '', 'exam'),
	mobile('m-deneme-cozumler', 'Denemeler', 'Çözümler', 'ExamSolutionExamCards', Exam.ExamSolutionsScreen, '', 'exam'),
	mobile('m-deneme-cozum', 'Denemeler', 'Soru çözümü', 'ExamSolutionBookletReview', Exam.ExamBookletScreen, '', 'exam'),
	mobile('m-ders-vitrin', 'Dersler', 'Dersler', 'WorkHome', Lessons.LessonsHomeScreen, 'Kaldığın yerden (GET continue), bugünkü tekrar (GET reviews) ve sınavın dersleri mikro ders ilerlemesiyle (GET lessons).', 'lessons'),
	mobile('m-ders-konular', 'Dersler', 'Konular', 'WorkCatalog', Lessons.LessonsTopicsScreen, 'Dersin konuları müfredat sırasıyla: mikro ders sayısı, süre, ilerleme ve ilk denemede doğru oranı.', 'lessons'),
	mobile('m-ders-tekrar', 'Dersler', 'Tekrar', 'WorkReview', Lessons.LessonsReviewScreen, 'İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede.', 'lessons'),
	mobile('m-ders-konu-girisi', 'Dersler', 'Konu girişi', 'WorkSub', Lessons.LessonTopicIntroScreen, 'Kanca, video ve mikro derslerin yol haritası; tek düğme sıradaki mikro derse götürür. Video yoksa satır gizlenir.', 'lessons'),
	mobile('m-ders-tanim', 'Dersler', 'Adım · Tanım', 'WorkMikro', Lessons.LessonConceptScreen, 'Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle.', 'lessons'),
	mobile('m-ders-ornek', 'Dersler', 'Adım · Örnek', 'WorkMikro', Lessons.LessonExampleScreen, 'Example: örnek cümle, açıklama ve dikkat notu.', 'lessons'),
	mobile('m-ders-kural', 'Dersler', 'Adım · Kural', 'WorkMikro', Lessons.LessonRuleScreen, 'Rule: numaralı kural listesi.', 'lessons'),
	mobile('m-ders-gorsel', 'Dersler', 'Adım · Görsel', 'WorkMikro', Lessons.LessonVisualScreen, 'Visual: merkezi figür (burada karşılaştırma tablosu) ve kısa açıklama.', 'lessons'),
	mobile('m-ders-tahmin', 'Dersler', 'Adım · Önce sen tahmin et', 'WorkMikro', Lessons.LessonPredictScreen, 'Choice: seçimden sonra açıklama ve Gerçek/Mecaz karşılaştırması.', 'lessons'),
	mobile('m-ders-dogru-yanlis', 'Dersler', 'Adım · Doğru mu, yanlış mı?', 'WorkMikro', Lessons.LessonTrueFalseScreen, 'TrueFalse: sık yapılan hata yargı olarak sorulur; doğrusu ve nedeni.', 'lessons'),
	mobile('m-ders-sirala', 'Dersler', 'Adım · Sırala', 'WorkMikro', Lessons.LessonOrderScreen, 'Order: adımlara sırayla dokunulur; sürükleme gerekmez.', 'lessons'),
	mobile('m-ders-bosluk', 'Dersler', 'Adım · Boşluk doldur', 'WorkMikro', Lessons.LessonFillScreen, 'FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer.', 'lessons'),
	mobile('m-ders-soru', 'Dersler', 'Adım · TYT tarzı soru', 'WorkMikro', Lessons.LessonQuestionScreen, 'Question: her yanlışta bir çözüm adımı açılır, öğrenci yeniden seçer; kalan deneme yazılı. SinoAI’ye sor.', 'lessons'),
	mobile('m-ders-sekilli-soru', 'Dersler', 'Adım · Şekilli soru', 'WorkMikro', Lessons.LessonFigureQuestionScreen, 'Question ve soru şekli (figure): şekil kökle birlikte, şıklardan önce.', 'lessons'),
	mobile('m-ders-mikro-bitti', 'Dersler', 'Mikro ders bitti', 'WorkMikroDone', Lessons.LessonMicroDoneScreen, 'İlk denemede doğru sayısı, akılda kalacak tek cümle, tekrar listesine girenler ve sıradaki mikro ders.', 'lessons'),
	mobile('m-ders-konu-sonu', 'Dersler', 'Konu sonu', 'WorkSubSummary', Lessons.LessonTopicDoneScreen, 'Özet, dikkat notları, kamp görevi; Testler’in Kolay seviyesine geçiş (Testler renginde).', 'lessons'),
	mobile('m-ders-hak', 'Dersler', 'Günlük konu hakkı', 'WorkSub (PAYWALL)', Lessons.LessonQuotaScreen, 'Abonelik yokken ya da günün konu hakkı bitince alt sayfa; ödeme marka yüzeyi olduğu için düğmesi turuncu.', 'lessons'),
	mobile('m-test-vitrin', 'Testler', 'Testler', 'QuizHome', Tests.TestsHomeScreen, 'Senin için hazır test ve ders listesi.', 'tests'),
	mobile('m-test-konular', 'Testler', 'Konular', 'QuizCatalog', Tests.TestsTopicsScreen, '', 'tests'),
	mobile('m-test-detay', 'Testler', 'Test seviyeleri', 'QuizOverview', Tests.TestOverviewScreen, 'Kolay, Orta, Zor · 20’şer soru.', 'tests'),
	mobile('m-test-coz', 'Testler', 'Doğru cevap', 'QuizSolve', Tests.TestSolveScreen, 'Anında geri bildirim: doğru şık, kısa çözüm.', 'tests'),
	mobile('m-test-coz-yanlis', 'Testler', 'Yanlış cevap', 'QuizSolve', Tests.TestSolveWrongScreen, 'Doğru şık ve nedeni; konunun mikro dersine (Dersler renginde) ya da SinoAI’ye geçiş.', 'tests'),
	mobile('m-test-bitti', 'Testler', 'Test bitti', 'QuizComplete', Tests.TestDoneScreen, '', 'tests'),
	mobile('m-test-cozumler', 'Testler', 'Çözümler', 'QuizSolutions', Tests.TestsSolutionsScreen, '', 'tests'),
	mobile('m-plan-bugun', 'Ders Planı', 'Bugün', 'StudyPlanHome', Plan.PlanTodayScreen, 'Görevler modül renginde sol çizgiyle; Dersler tekrarı ve Bilgi Kartları tek “Bugün tekrar” kartında.', 'studyPlan'),
	mobile('m-plan-odak', 'Ders Planı', 'Odak sayacı', 'StudyPlanFocus', Plan.PlanFocusScreen, '', 'studyPlan'),
	mobile('m-plan-ilerleme', 'Ders Planı', 'İlerleme', 'StudyPlanProgress', Plan.PlanProgressScreen, '', 'studyPlan'),
	mobile('m-plan-konu', 'Ders Planı', 'Konu ilerlemesi', 'StudyPlanLessonProgress', Plan.PlanLessonProgressScreen, '', 'studyPlan'),
	mobile('m-plan-program', 'Ders Planı', 'Program', 'StudyPlanSchedule', Plan.PlanScheduleScreen, '', 'studyPlan'),
	mobile('m-plan-ayarlar', 'Ders Planı', 'Plan ayarları', 'StudyPlanCreate', Plan.PlanSettingsScreen, '', 'studyPlan'),
	mobile('m-ozet-vitrin', 'Akıllı Özet', 'Akıllı Özet', 'LensHome', Assist.SummaryHomeScreen, 'Geçmişte konu başlığı; kalan kota yazılı.', 'smartSummary'),
	mobile('m-ozet-yukle', 'Akıllı Özet', 'Soru yükle', 'LensNew', Assist.SummaryUploadScreen, '', 'smartSummary'),
	mobile('m-ozet-kamera', 'Akıllı Özet', 'Kamera', 'LensCamera', Assist.SummaryCameraScreen, '', 'smartSummary'),
	mobile('m-ozet-isleniyor', 'Akıllı Özet', 'Analiz ediliyor', 'LensSessionProgress', Assist.SummaryProcessingScreen, '', 'smartSummary'),
	mobile('m-ozet-sonuc', 'Akıllı Özet', 'Çözüm', 'LensSessionDetail', Assist.SummaryResultScreen, '', 'smartSummary'),
	mobile('m-ozet-video', 'Akıllı Özet', 'Video analizi', 'LensVideo', Assist.SummaryVideoScreen, '', 'smartSummary'),
	mobile('m-kart-vitrin', 'Bilgi Kartları ve SinoAI', 'Bilgi Kartları', 'FlashcardMain', Assist.CardsHomeScreen, 'Sekmeler Kartlar · Bugün · Kaydedilenler.', 'flashcards'),
	mobile('m-kart-bugun', 'Bilgi Kartları ve SinoAI', 'Bugün', 'FlashcardToday', Assist.CardsTodayScreen, '', 'flashcards'),
	mobile('m-kart-on', 'Bilgi Kartları ve SinoAI', 'Kart oturumu · ön yüz', 'FlashcardSession', Assist.CardSessionScreen, '', 'flashcards'),
	mobile('m-kart-arka', 'Bilgi Kartları ve SinoAI', 'Kart oturumu · cevap', 'FlashcardSession', Assist.CardSessionBackScreen, '', 'flashcards'),
	mobile('m-kart-kaydedilen', 'Bilgi Kartları ve SinoAI', 'Kaydedilenler', 'FlashcardSavedTab', Assist.CardsSavedScreen, '', 'flashcards'),
	mobile('m-sino-ana', 'Bilgi Kartları ve SinoAI', 'SinoAI', 'SinoAi', Sino.SinoHomeScreen, '', 'sinoAi'),
	mobile('m-sino-sohbet', 'Bilgi Kartları ve SinoAI', 'SinoAI · sohbet', 'SinoAiChat', Sino.SinoChatScreen, '', 'sinoAi'),
	mobile('m-sino-calisma', 'Bilgi Kartları ve SinoAI', 'SinoAI · çalışma', 'SinoAiChat (Çalışma)', Sino.SinoStudyScreen, 'Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı.', 'sinoAi'),
	mobile('m-sino-sonuc', 'Bilgi Kartları ve SinoAI', 'SinoAI · üretim sonucu', 'SinoAiChat (Çalışma sonucu)', Sino.SinoStudyResultScreen, 'Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir.', 'sinoAi'),
	mobile('m-sino-kutuphane', 'Bilgi Kartları ve SinoAI', 'SinoAI · kütüphane', '—', Sino.SinoLibraryScreen, '', 'sinoAi'),
	mobile('m-sino-menu', 'Bilgi Kartları ve SinoAI', 'SinoAI · menü', 'SinoAiChat (menü)', Sino.SinoMenuScreen, 'Arama, yeni sohbet, kütüphane ve gün gün sohbetler.', 'sinoAi'),
	mobile('m-profil', 'Profil ve hesap', 'Profil', 'ProfileMain', Account.ProfileScreen, 'Hedef, abonelik, görünüm, destek ve hakkında tek yerde.'),
	mobile('m-profil-devam', 'Profil ve hesap', 'Profil · alt bölüm', 'ProfileMain', Account.ProfileMoreScreen, ''),
	mobile('m-profil-bilgiler', 'Profil ve hesap', 'Kişisel bilgiler', 'ProfileUserInfo / ProfileEdit', Account.ProfileDetailsScreen, ''),
	mobile('m-profil-hedef', 'Profil ve hesap', 'Hedefim', 'ProfileAcademic', Account.ProfileGoalScreen, ''),
	mobile('m-profil-abonelik', 'Profil ve hesap', 'Aboneliğim', 'ProfileMySubscriptions', Account.SubscriptionScreen, ''),
	mobile('m-profil-paketler', 'Profil ve hesap', 'Paketler', 'ProfileAvailablePackages', Account.PackagesScreen, ''),
	mobile('m-profil-gorunum', 'Profil ve hesap', 'Görünüm', 'ProfileAppearance', Account.AppearanceScreen, ''),
	mobile('m-profil-dil', 'Profil ve hesap', 'Dil', 'ProfileLanguage', Account.LanguageScreen, ''),
	mobile('m-profil-iletisim', 'Profil ve hesap', 'Bildirim ve iletişim', 'ProfileCommunicationPreferences', Account.CommunicationScreen, ''),
	mobile('m-profil-guvenlik', 'Profil ve hesap', 'Hesap güvenliği', 'ProfileAccountSecurity', Account.SecurityScreen, 'Şifre belirleme ya da değiştirme, oturumlar.'),
	mobile('m-profil-kapat', 'Profil ve hesap', 'Hesabımı kapat', 'ProfileAccountClosure', Account.CloseAccountScreen, ''),
	mobile('m-bildirimler', 'Bildirim, destek, durumlar', 'Bildirimler', 'NotificationInbox', Account.NotificationsScreen, ''),
	mobile('m-destek', 'Bildirim, destek, durumlar', 'Destek', 'SupportHub', Account.SupportHubScreen, ''),
	mobile('m-destek-yeni', 'Bildirim, destek, durumlar', 'Yeni talep', 'SupportNew', Account.SupportNewScreen, ''),
	mobile('m-destek-talep', 'Bildirim, destek, durumlar', 'Talep detayı', 'SupportTicketDetail', Account.SupportTicketScreen, ''),
	mobile('m-hakkinda', 'Bildirim, destek, durumlar', 'Hakkında', 'ExamAbout', Account.AboutScreen, ''),
	mobile('m-geri-bildirim', 'Bildirim, destek, durumlar', 'Geri bildirimlerim', 'FeedbackMy', Account.FeedbackScreen, ''),
	mobile('m-durum-bos', 'Bildirim, destek, durumlar', 'Boş durum', '—', Account.EmptyStateScreen, ''),
	mobile('m-durum-hata', 'Bildirim, destek, durumlar', 'Yükleniyor, hata, çevrimdışı', '—', Account.ErrorStateScreen, ''),
	web('w-giris', 'Web · giriş ve onboarding', 'Giriş yap', '/student/login', WOnb.WebSignInScreen, 'Solda form (Google ve Apple üstte, kodla giriş), sağda tanıtım paneli.'),
	web('w-giris-kod', 'Web · giriş ve onboarding', 'Giriş kodu', '/student/login', WOnb.WebSignInCodeScreen, ''),
	web('w-kayit', 'Web · giriş ve onboarding', 'Kayıt ol', '/student/register', WOnb.WebSignUpScreen, 'Kayıtta paket yok: önce plan, sonra paket.'),
	web('w-sifre-unuttum', 'Web · giriş ve onboarding', 'Şifremi unuttum', '/student/forgot-password', WOnb.WebForgotScreen, ''),
	web('w-sifre-sifirla', 'Web · giriş ve onboarding', 'Şifre sıfırla', '/student/reset-password', WOnb.WebResetScreen, ''),
	web('w-onb-1-sinav', 'Web · giriş ve onboarding', 'Web onboarding 1 · Sınav', '/student/baslangic', WOnb.WebOnbExamScreen, 'Mobil ile aynı adımlar, sağda canlı önizleme.'),
	web('w-onb-2-hedef', 'Web · giriş ve onboarding', 'Web onboarding 2 · Hedef', '/student/baslangic', WOnb.WebOnbGoalScreen, ''),
	web('w-onb-3-tempo', 'Web · giriş ve onboarding', 'Web onboarding 3 · Tempo', '/student/baslangic', WOnb.WebOnbTempoScreen, ''),
	web('w-onb-4-dersler', 'Web · giriş ve onboarding', 'Web onboarding 4 · Dersler', '/student/baslangic', WOnb.WebOnbWeakScreen, ''),
	web('w-onb-5-plan', 'Web · giriş ve onboarding', 'Web onboarding 5 · Planın hazır', '/student/baslangic', WOnb.WebOnbPlanScreen, 'Sağda aynı planın mobil hali.'),
	web('w-onb-6-paket', 'Web · giriş ve onboarding', 'Web onboarding 6 · Paketini seç', '/student/baslangic', WOnb.WebOnbPlanChoiceScreen, 'Web’de deneme süresi yok: paket seçilir, kartla ödenir; “Şimdilik paket seçme” de var.'),
	web('w-panel-anasayfa', 'Web · panel', 'Ana sayfa', '/student/dashboard', WPanel.WebHomeScreen, 'Günün adımı, plan, hedef, son deneme; modül kısa yolları renkli.'),
	web('w-panel-tur', 'Web · panel', 'İlk giriş ipucu', '/student/dashboard', WPanel.WebTourScreen, 'İlk girişte tek ipucu, günün adımının üstünde.'),
	web('w-panel-moduller', 'Web · panel', 'Tüm modüller', '/student/moduller', WPanel.WebModulesScreen, ''),
	web('w-panel-bildirimler', 'Web · panel', 'Bildirimler', '/student/bildirimler', WPanel.WebNotificationsScreen, ''),
	web('w-panel-profil', 'Web · panel', 'Profil', '/student/profil', WPanel.WebProfileScreen, ''),
	web('w-panel-abonelik', 'Web · panel', 'Profil · abonelik', '/student/profil', WPanel.WebSubscriptionScreen, ''),
	web('w-panel-ayarlar', 'Web · panel', 'Profil · bildirim ve görünüm', '/student/profil', WPanel.WebSettingsScreen, ''),
	web('w-panel-destek', 'Web · panel', 'Destek', '/student/destek', WPanel.WebSupportScreen, ''),
	web('w-panel-destek-talep', 'Web · panel', 'Destek talebi', '/student/destek/[id]', WPanel.WebSupportTicketScreen, ''),
	web('w-panel-odeme', 'Web · panel', 'Ödeme', '/student/odeme', WPanel.WebCheckoutScreen, ''),
	web('w-panel-odeme-basarili', 'Web · panel', 'Ödeme başarılı', '/student/odeme/basarili', WPanel.WebPaySuccessScreen, ''),
	web('w-panel-odeme-basarisiz', 'Web · panel', 'Ödeme başarısız', '/student/odeme/basarisiz', WPanel.WebPayFailScreen, ''),
	web('w-panel-durumlar', 'Web · panel', 'Boş, yükleniyor, hata', '—', WPanel.WebStatesScreen, ''),
	web('w-deneme-vitrin', 'Web · Denemeler', 'Denemeler', '/student/sinavlarim', WExam.WebExamHomeScreen, '', 'exam'),
	web('w-deneme-denemelerim', 'Web · Denemeler', 'Denemelerim ve takvim', '/student/denemelerim', WExam.WebMyExamsScreen, 'Denemelerin ve sınav takvimi tek sekmede.', 'exam'),
	web('w-deneme-detay', 'Web · Denemeler', 'Deneme detayı', '/student/sinav/[examId]', WExam.WebExamDetailScreen, '', 'exam'),
	web('w-deneme-coz', 'Web · Denemeler', 'Deneme çözme (odak)', '/student/sinav/coz/[examUserId]', WExam.WebExamSolveScreen, '', 'exam'),
	web('w-deneme-sonuclar', 'Web · Denemeler', 'Sonuçlar', '/student/sinav-sonuclari', WExam.WebResultsScreen, '', 'exam'),
	web('w-deneme-sonuc', 'Web · Denemeler', 'Sonuç ve analiz', '/student/sinav-sonuclari/[snapshotId]', WExam.WebResultScreen, '', 'exam'),
	web('w-deneme-cozumler', 'Web · Denemeler', 'Soru çözümleri', '/student/soru-cozumleri/[examAttemptId]', WExam.WebSolutionsScreen, 'Soru haritası ve çözüm.', 'exam'),
	web('w-deneme-istatistik', 'Web · Denemeler', 'İstatistik', '/student/raporlarim', WExam.WebStatsScreen, 'Satırlarda ders adı.', 'exam'),
	web('w-ders-vitrin', 'Web · Dersler', 'Dersler', '/student/ders-cal', WLessons.WebLessonsHomeScreen, 'Kaldığın yerden, bugünkü tekrar ve sınavın dersleri; henüz içeriği olmayan ders “Yakında”.', 'lessons'),
	web('w-ders-konular', 'Web · Dersler', 'Konular', '/student/ders-cal/[lessonMainId]', WLessons.WebLessonsTopicsScreen, 'Dersin konuları: mikro ders, süre, ilerleme, ilk denemede doğru; yanda ders ilerlemesi.', 'lessons'),
	web('w-ders-tekrar', 'Web · Dersler', 'Tekrar', '/student/ders-cal/tekrar', WLessons.WebLessonsReviewScreen, 'Günü gelen adımlar; 1, 3 ve 7 gün aralıkla.', 'lessons'),
	web('w-ders-konu-girisi', 'Web · Dersler', 'Konu girişi', '/student/ders-cal/konu/[lessonSubId]', WLessons.WebLessonTopicIntroScreen, 'Panelin içinde iki sütun: kanca, hedefler, video ve devam düğmesi; yanda mikro derslerin yol haritası.', 'lessons'),
	web('w-ders-tanim', 'Web · Dersler', 'Oynatıcı · Tanım', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonConceptScreen, 'Solda mikro dersler, ortada 700 px adım, sağda Bu mikro derste ve SinoAI.', 'lessons'),
	web('w-ders-tahmin', 'Web · Dersler', 'Oynatıcı · Önce sen tahmin et', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonPredictScreen, '', 'lessons'),
	web('w-ders-bosluk', 'Web · Dersler', 'Oynatıcı · Boşluk doldur', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonFillScreen, 'Tek deneme; yanlışta doğru sözcük ve nedeni.', 'lessons'),
	web('w-ders-dogru-yanlis', 'Web · Dersler', 'Oynatıcı · Doğru mu, yanlış mı?', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonTrueFalseScreen, '', 'lessons'),
	web('w-ders-sirala', 'Web · Dersler', 'Oynatıcı · Sırala', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonOrderScreen, '', 'lessons'),
	web('w-ders-soru', 'Web · Dersler', 'Oynatıcı · TYT tarzı soru', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonQuestionScreen, 'Yanlış şıktan sonra çözüm adımı açılır, öğrenci yeniden seçer; 1–5 tuşları.', 'lessons'),
	web('w-ders-mikro-bitti', 'Web · Dersler', 'Mikro ders bitti', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonMicroDoneScreen, '', 'lessons'),
	web('w-ders-konu-sonu', 'Web · Dersler', 'Konu sonu', '/student/ders-cal/konu/[lessonSubId]/ozet', WLessons.WebLessonTopicDoneScreen, 'Özet, dikkat notları, kamp görevi ve Testler’e geçiş.', 'lessons'),
	web('w-ders-akis', 'Web · Dersler', 'Akış panosu', '—', WLessons.WebLessonFlowBoardScreen, 'Konu girişi → mikro dersler → konu sonu → Testler ve Kartlar; yanlışlar Tekrar’a.', 'lessons'),
	web('w-test-vitrin', 'Web · Testler', 'Testler', '/student/testler', WTests.WebTestsHomeScreen, '', 'tests'),
	web('w-test-konular', 'Web · Testler', 'Ders konuları', '/student/testler/[lessonMainId]', WTests.WebTestTopicsScreen, '', 'tests'),
	web('w-test-coz', 'Web · Testler', 'Test çözme · doğru', '/student/testler/quiz/[quizId]', WTests.WebTestSolveScreen, '', 'tests'),
	web('w-test-coz-yanlis', 'Web · Testler', 'Test çözme · yanlış', '/student/testler/quiz/[quizId]', WTests.WebTestSolveWrongScreen, 'Doğru şık ve nedeni; konunun mikro dersine ya da SinoAI’ye geçiş.', 'tests'),
	web('w-plan-bugun', 'Web · Ders Planı', 'Bugün', '/student/ders-plani', WPlan.WebPlanTodayScreen, '', 'studyPlan'),
	web('w-plan-program', 'Web · Ders Planı', 'Program', '/student/ders-plani/program', WPlan.WebPlanScheduleScreen, '', 'studyPlan'),
	web('w-plan-oneriler', 'Web · Ders Planı', 'Öneriler', '/student/ders-plani/oneriler', WPlan.WebPlanSuggestionsScreen, '', 'studyPlan'),
	web('w-plan-istatistik', 'Web · Ders Planı', 'İstatistik', '/student/ders-plani/istatistik', WPlan.WebPlanStatsScreen, '', 'studyPlan'),
	web('w-plan-ilerleme', 'Web · Ders Planı', 'İlerleme', '/student/ders-plani/ilerleme', WPlan.WebPlanProgressScreen, '', 'studyPlan'),
	web('w-plan-ayarlar', 'Web · Ders Planı', 'Ayarlar', '/student/ders-plani/ayarlar', WPlan.WebPlanSettingsScreen, '', 'studyPlan'),
	web('w-plan-odak', 'Web · Ders Planı', 'Odak (çalış)', '/student/ders-plani/calis/[taskId]', WPlan.WebPlanFocusScreen, '', 'studyPlan'),
	web('w-kart-vitrin', 'Web · Kartlar, Özet, SinoAI', 'Bilgi Kartları', '/student/flashcard', WAssist.WebCardsHomeScreen, '', 'flashcards'),
	web('w-kart-gozat', 'Web · Kartlar, Özet, SinoAI', 'Gözat', '/student/flashcard/browse/...', WAssist.WebCardsBrowseScreen, '', 'flashcards'),
	web('w-kart-oturum', 'Web · Kartlar, Özet, SinoAI', 'Kart oturumu (odak)', '/student/flashcard/session', WAssist.WebCardSessionScreen, '', 'flashcards'),
	web('w-kart-kaydedilen', 'Web · Kartlar, Özet, SinoAI', 'Kaydedilenler', '/student/flashcard (Kaydedilenler)', WAssist.WebCardsSavedScreen, '', 'flashcards'),
	web('w-ozet-vitrin', 'Web · Kartlar, Özet, SinoAI', 'Akıllı Özet', '/student/lens', WAssist.WebSummaryHomeScreen, 'Geçmişte konu başlığı.', 'smartSummary'),
	web('w-ozet-yeni', 'Web · Kartlar, Özet, SinoAI', 'Yeni analiz', '/student/lens/yeni', WAssist.WebSummaryNewScreen, '', 'smartSummary'),
	web('w-ozet-detay', 'Web · Kartlar, Özet, SinoAI', 'Analiz detayı', '/student/lens/analiz/[id]', WAssist.WebSummaryDetailScreen, '', 'smartSummary'),
	web('w-ozet-video', 'Web · Kartlar, Özet, SinoAI', 'Video analizi', '/student/lens/video/[id]', WAssist.WebSummaryVideoScreen, '', 'smartSummary'),
	web('w-sino-sohbet', 'Web · Kartlar, Özet, SinoAI', 'SinoAI sohbet', '/student/sinoai/[conversationId]', WSino.WebSinoChatScreen, 'Solda geçmiş, ortada tek sohbet sütunu.', 'sinoAi'),
	web('w-sino-calisma', 'Web · Kartlar, Özet, SinoAI', 'SinoAI çalışma', '/student/sinoai/study', WSino.WebSinoStudyScreen, '', 'sinoAi'),
	web('w-sino-kutuphane', 'Web · Kartlar, Özet, SinoAI', 'SinoAI kütüphane', '/student/sinoai/library', WSino.WebSinoLibraryScreen, '', 'sinoAi'),
	site('s-anasayfa', 'Web sitesi', 'Ana sayfa', '/', SiteP.SiteHomeScreen, 3718, 'Sitenin header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri.'),
	site('s-urunler-menu', 'Web sitesi', 'Ürünler menüsü', 'header', SiteP.SiteMenuScreen, 900, 'Ürünler açılınca 7 modül, sitenin sade gri tonlarında.'),
	site('s-sinavlar', 'Web sitesi', 'Sınavlar', '/sinavlar', SiteP.SiteExamsScreen, 1189, ''),
	site('s-sinav-yks', 'Web sitesi', 'Sınav sayfası · YKS', '/yks-hazirlik (şablon)', SiteP.SiteExamLandingScreen, 2657, 'Tüm sınav ve hazırlık sayfaları bu şablonla.'),
	site('s-net-hesaplama', 'Web sitesi', 'Net hesaplama', '/net-hesaplama', SiteP.SiteNetCalcScreen, 1024, ''),
	site('s-paketler', 'Web sitesi', 'Paketler', '/corporate/packages', SiteP.SitePlansScreen, 1160, 'Yalnız ücretli paketler; deneme süresi mobil uygulamada.'),
	site('s-urun-denemeler', 'Web sitesi', 'Ürün · Denemeler', '/urunler/denemeler (şablon)', SiteP.SiteProductExamScreen, 2068, 'Altı ürün sayfası tek şablon.'),
	site('s-urun-ozet', 'Web sitesi', 'Ürün · Akıllı Özet', '/urunler/lens', SiteP.SiteProductSummaryScreen, 2047, ''),
	site('s-blog', 'Web sitesi', 'Blog', '/blog', SiteP.SiteBlogScreen, 1815, ''),
	site('s-blog-yazi', 'Web sitesi', 'Blog yazısı', '/blog/[slug]', SiteP.SiteBlogPostScreen, 1362, ''),
	site('s-hakkimizda', 'Web sitesi', 'Hakkımızda', '/corporate/about', SiteP.SiteAboutScreen, 1210, ''),
	site('s-sss-iletisim', 'Web sitesi', 'SSS ve iletişim', '/corporate/sss + /contact', SiteP.SiteFaqContactScreen, 1116, ''),
	site('s-yasal', 'Web sitesi', 'Yasal sayfa', '/corporate/yasal/[slug]', SiteP.SiteLegalScreen, 993, ''),
	site('s-sinoai-misafir', 'Web sitesi', 'SinoAI · misafir', '/sinoai', SiteP.SiteSinoGuestScreen, 900, ''),
];

export const findScreen = (id: string): UIScreen => {
	const screen = UI_SCREENS.find((entry) => entry.id === id);
	if (!screen) throw new Error(`Bilinmeyen UI/UX ekranı: ${id}`);
	return screen;
};
