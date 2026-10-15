import type React from 'react';
import type {ModuleKey} from './ModuleIdentity';
import * as Account from './Screens/Mobile/Account';
import * as Assist from './Screens/Mobile/Assist';
import * as Auth from './Screens/Mobile/Auth';
import * as Exam from './Screens/Mobile/Exam';
import {HubScreen, HubScrolledScreen, Tour1Screen, Tour2Screen, Tour3Screen, Tour4Screen} from './Screens/Mobile/Hub';
import * as Learn from './Screens/Mobile/Learn';
import * as Onb from './Screens/Mobile/Onboarding';
import * as Plan from './Screens/Mobile/Plan';
import * as Sino from './Screens/Mobile/SinoAI';
import * as SiteP from './Screens/Site/Site';
import * as WAssist from './Screens/Web/AssistWeb';
import * as WExam from './Screens/Web/ExamWeb';
import * as WLearn from './Screens/Web/LearnWeb';
import * as WOnb from './Screens/Web/OnboardingWeb';
import * as WPanel from './Screens/Web/Panel';
import * as WPlan from './Screens/Web/PlanWeb';
import * as WSino from './Screens/Web/SinoWeb';

/**
 * Every UI/UX drawing, by id. The export (`npm run uiux`), the boards and the
 * screen inventory (docs/UIUX/Ekran-Envanteri.md) read this list.
 *
 * Ids: m-<group>-<name> mobile, w-<group>-<name> web panel, s-<name> site.
 * `route` names the screen in the real app (mobile route name or web path),
 * so a drawing maps to the code it changes.
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
	/** Mobile route name or web path in the real app ("yeni" for screens that do not exist yet). */
	route: string;
	/** What changed and why, one or two sentences. */
	note: string;
	Component: React.FC;
	/** Site pages: full page height in points. */
	height?: number;
};

const mobile = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'mobile', group, title, route, Component, note, module});
const web = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'web', group, title, route, Component, note, module});
const site = (id: string, group: string, title: string, route: string, Component: React.FC, height: number, note = ''): UIScreen => ({id, platform: 'site', group, title, route, Component, note, height});

export const UI_SCREENS: readonly UIScreen[] = [
	mobile('m-hub-moduller', 'Modüller ve tur', 'Modüller (ana ekran)', 'ModuleHubHome', HubScreen, 'Uygulamanın mevcut düzeni korunur: slayt üstte, modül kartları altında. Slaytlar ve kartlar modül renginde; reklam bandı kalkar.'),
	mobile('m-hub-moduller-kaydir', 'Modüller ve tur', 'Modüller · aşağı kaydırılmış', 'ModuleHubHome', HubScrolledScreen, 'Kartların tamamı, SinoAI geniş kartı ve Destek.'),
	mobile('m-tur-1', 'Modüller ve tur', 'Ürün turu 1 · Slaytlar', 'yeni', Tour1Screen),
	mobile('m-tur-2', 'Modüller ve tur', 'Ürün turu 2 · Modül kartları', 'yeni', Tour2Screen),
	mobile('m-tur-3', 'Modüller ve tur', 'Ürün turu 3 · Profil', 'yeni', Tour3Screen),
	mobile('m-tur-4', 'Modüller ve tur', 'Ürün turu 4 · SinoAI', 'yeni', Tour4Screen),
	mobile('m-giris-karsilama', 'Giriş ve kayıt', 'Karşılama', 'yeni', Auth.WelcomeScreen, 'İlk açılış: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var.'),
	mobile('m-giris-oturum-ac', 'Giriş ve kayıt', 'Oturum aç veya kaydol', 'AuthLogin', Auth.SignInScreen, 'Apple ve Google üstte, e-posta altta; hesap varsa kod gider, yoksa kayıt açılır.'),
	mobile('m-giris-kod', 'Giriş ve kayıt', 'Doğrulama kodu', 'AuthLogin', Auth.SignInCodeScreen, '6 kutulu kod, yeniden gönderme süresi, parolayla giriş seçeneği.'),
	mobile('m-kayit-eposta', 'Giriş ve kayıt', 'Hesap oluştur', 'AuthRegister', Auth.SignUpScreen, ''),
	mobile('m-kayit-bilgiler', 'Giriş ve kayıt', 'Hesap oluştur · bilgiler', 'AuthRegister', Auth.SignUpDetailsScreen, 'Ad, soyad, parola gücü ve onay tek ekranda.'),
	mobile('m-sifre-unuttum', 'Giriş ve kayıt', 'Şifremi unuttum', 'AuthForgotPassword', Auth.ForgotPasswordScreen, ''),
	mobile('m-sifre-yeni', 'Giriş ve kayıt', 'Kod ve yeni parola', 'AuthForgotPassword', Auth.NewPasswordScreen, ''),
	mobile('m-giris-sayfa', 'Giriş ve kayıt', 'Misafir · hesap gerekli', 'AuthEntrySheet', Auth.AuthSheetScreen, 'Misafir hesap isteyen bir şeye dokununca tam ekran yönlendirme yerine alt sayfa.'),
	mobile('m-giris-hazir', 'Giriş ve kayıt', 'Hesabın hazır', 'yeni', Auth.AccountReadyScreen, ''),
	mobile('m-onb-1-sinav', 'Onboarding', 'Onboarding 1 · Sınav ve oturum', 'OnboardingCategoryExamStep + ScoreTypeStep', Onb.OnbExamScreen, 'Uygulamadaki 2 adım tek ekranda.'),
	mobile('m-onb-2-net', 'Onboarding', 'Onboarding 2 · Mevcut ve hedef net', 'OnboardingStudyNetStep', Onb.OnbScoreScreen, 'İki çark seçici yerine tek kaydırıcı ve gerçekçilik yorumu.'),
	mobile('m-onb-3-tempo', 'Onboarding', 'Onboarding 3 · Tempo', 'OnboardingStudyHoursStep + QuestionsStep', Onb.OnbTempoScreen, 'Saat ve soru sayısı hazır tempo kartlarında.'),
	mobile('m-onb-4-dersler', 'Onboarding', 'Onboarding 4 · Zorlandığın dersler', 'OnboardingStudyWeakStep', Onb.OnbWeakScreen, ''),
	mobile('m-onb-5-plan', 'Onboarding', 'Onboarding 5 · Planın hazır', 'OnboardingStudySummaryStep', Onb.OnbPlanScreen, 'Hafta modül renkleriyle; bugünkü ilk görev somut.'),
	mobile('m-onb-6-deger', 'Onboarding', 'Onboarding 6 · Neden Sınavika', 'OnboardingValueStep', Onb.OnbValueScreen, ''),
	mobile('m-onb-7-hesap', 'Onboarding', 'Onboarding 7 · Planını kaydet', 'AuthRegister', Onb.OnbAccountScreen, 'Hesap ödeme ekranından önce: önce emeğin güvene alınır.'),
	mobile('m-onb-8-deneme', 'Onboarding', 'Onboarding 8 · 3 gün ücretsiz', 'OnboardingTrialStep', Onb.OnbTrialScreen, 'Bugün, hatırlatma günü ve ücret günü açıkça.'),
	mobile('m-onb-9-bildirim', 'Onboarding', 'Bildirim izni', 'yeni', Onb.OnbNotificationsScreen, 'Sistem penceresinden önce kendi açıklamamız; ATT ancak gerekiyorsa.'),
	mobile('m-deneme-vitrin', 'Denemeler', 'Denemeler', 'ExamDashboard', Exam.ExamHomeScreen, 'Canlı deneme slaytı, devam eden deneme ve öneriler.', 'exam'),
	mobile('m-deneme-katalog', 'Denemeler', 'Tüm denemeler', 'ExamStudentsList', Exam.ExamCatalogScreen, '', 'exam'),
	mobile('m-deneme-detay', 'Denemeler', 'Deneme detayı', 'ExamStudentPublicDetail', Exam.ExamDetailScreen, '', 'exam'),
	mobile('m-deneme-baslangic', 'Denemeler', 'Başlamadan önce', 'ExamStudentStarting', Exam.ExamStartingScreen, '', 'exam'),
	mobile('m-deneme-coz', 'Denemeler', 'Deneme çözme', 'ExamStudentSolve', Exam.ExamSolveScreen, 'Odak modu: tab bar yok, süre ve soru haritası üstte.', 'exam'),
	mobile('m-deneme-denemelerim', 'Denemeler', 'Denemelerim', 'MyExams', Exam.MyExamsScreen, 'Sınavlarım ve Sınav takvimi birleşti.', 'exam'),
	mobile('m-deneme-sonuclar', 'Denemeler', 'Sonuçlar', 'ExamResultsHub', Exam.ExamResultsScreen, '', 'exam'),
	mobile('m-deneme-sonuc', 'Denemeler', 'Sonuç', 'ExamResultDocument', Exam.ExamResultScreen, '', 'exam'),
	mobile('m-deneme-analiz', 'Denemeler', 'Eksik konu analizi', 'ExamStatsLessonOverview', Exam.ExamAnalysisScreen, 'Analiz eylemle biter: ders, test, plana ekle.', 'exam'),
	mobile('m-deneme-gelisim', 'Denemeler', 'Ders gelişimi', 'ExamStatsLessonTrend', Exam.ExamTrendScreen, '', 'exam'),
	mobile('m-deneme-cozumler', 'Denemeler', 'Çözümler', 'ExamSolutionExamCards', Exam.ExamSolutionsScreen, '', 'exam'),
	mobile('m-deneme-cozum', 'Denemeler', 'Soru çözümü', 'ExamSolutionBookletReview', Exam.ExamBookletScreen, '', 'exam'),
	mobile('m-ders-vitrin', 'Dersler ve Testler', 'Dersler', 'WorkHome', Learn.LessonsHomeScreen, '', 'lessons'),
	mobile('m-ders-agac', 'Dersler ve Testler', 'Konu ağacı', 'WorkCatalog', Learn.LessonsTreeScreen, '', 'lessons'),
	mobile('m-ders-akis', 'Dersler ve Testler', 'Mikro ders', 'WorkLessonFlow', Learn.LessonFlowScreen, '', 'lessons'),
	mobile('m-ders-bitti', 'Dersler ve Testler', 'Ders tamamlandı', 'WorkLessonFlow', Learn.LessonDoneScreen, '', 'lessons'),
	mobile('m-ders-rota', 'Dersler ve Testler', 'Öğrenme rotası', 'WorkLearningPath', Learn.LessonsPathScreen, '', 'lessons'),
	mobile('m-ders-gecmis', 'Dersler ve Testler', 'Geçmiş', 'WorkHistory', Learn.LessonsHistoryScreen, '', 'lessons'),
	mobile('m-test-vitrin', 'Dersler ve Testler', 'Testler', 'QuizHome', Learn.TestsHomeScreen, '', 'tests'),
	mobile('m-test-konular', 'Dersler ve Testler', 'Konular', 'QuizCatalog', Learn.TestsTopicsScreen, '', 'tests'),
	mobile('m-test-detay', 'Dersler ve Testler', 'Test seviyeleri', 'QuizOverview', Learn.TestOverviewScreen, '', 'tests'),
	mobile('m-test-coz', 'Dersler ve Testler', 'Anında geri bildirim', 'QuizSolve', Learn.TestSolveScreen, '', 'tests'),
	mobile('m-test-bitti', 'Dersler ve Testler', 'Test bitti', 'QuizComplete', Learn.TestDoneScreen, '', 'tests'),
	mobile('m-test-cozumler', 'Dersler ve Testler', 'Çözümler', 'QuizSolutions', Learn.TestsSolutionsScreen, '', 'tests'),
	mobile('m-plan-bugun', 'Ders Planı', 'Bugün', 'StudyPlanHome', Plan.PlanTodayScreen, 'Görevler modül renginde sol çizgiyle.', 'studyPlan'),
	mobile('m-plan-odak', 'Ders Planı', 'Odak sayacı', 'StudyPlanFocus', Plan.PlanFocusScreen, '', 'studyPlan'),
	mobile('m-plan-ilerleme', 'Ders Planı', 'İlerleme', 'StudyPlanProgress', Plan.PlanProgressScreen, 'Eski Pusula/Compass burada.', 'studyPlan'),
	mobile('m-plan-konu', 'Ders Planı', 'Konu ilerlemesi', 'StudyPlanLessonProgress', Plan.PlanLessonProgressScreen, '', 'studyPlan'),
	mobile('m-plan-program', 'Ders Planı', 'Program', 'StudyPlanSchedule', Plan.PlanScheduleScreen, '', 'studyPlan'),
	mobile('m-plan-ayarlar', 'Ders Planı', 'Plan ayarları', 'StudyPlanCreate', Plan.PlanSettingsScreen, '', 'studyPlan'),
	mobile('m-ozet-vitrin', 'Akıllı Özet', 'Akıllı Özet', 'LensHome', Assist.SummaryHomeScreen, 'Geçmişte dosya adı yerine konu başlığı; kalan kredi yerine kota.', 'smartSummary'),
	mobile('m-ozet-yukle', 'Akıllı Özet', 'Soru yükle', 'LensNew', Assist.SummaryUploadScreen, '', 'smartSummary'),
	mobile('m-ozet-kamera', 'Akıllı Özet', 'Kamera', 'LensCamera', Assist.SummaryCameraScreen, '', 'smartSummary'),
	mobile('m-ozet-isleniyor', 'Akıllı Özet', 'Analiz ediliyor', 'LensSessionProgress', Assist.SummaryProcessingScreen, '', 'smartSummary'),
	mobile('m-ozet-sonuc', 'Akıllı Özet', 'Çözüm', 'LensSessionDetail', Assist.SummaryResultScreen, '', 'smartSummary'),
	mobile('m-ozet-video', 'Akıllı Özet', 'Video analizi', 'LensVideo', Assist.SummaryVideoScreen, '', 'smartSummary'),
	mobile('m-kart-vitrin', 'Bilgi Kartları ve SinoAI', 'Bilgi Kartları', 'FlashcardMain', Assist.CardsHomeScreen, 'Akış yok; sekmeler Kartlar · Bugün · Kaydedilenler.', 'flashcards'),
	mobile('m-kart-bugun', 'Bilgi Kartları ve SinoAI', 'Bugün', 'FlashcardToday', Assist.CardsTodayScreen, '', 'flashcards'),
	mobile('m-kart-on', 'Bilgi Kartları ve SinoAI', 'Kart oturumu · ön yüz', 'FlashcardSession', Assist.CardSessionScreen, '', 'flashcards'),
	mobile('m-kart-arka', 'Bilgi Kartları ve SinoAI', 'Kart oturumu · cevap', 'FlashcardSession', Assist.CardSessionBackScreen, '', 'flashcards'),
	mobile('m-kart-kaydedilen', 'Bilgi Kartları ve SinoAI', 'Kaydedilenler', 'FlashcardSavedTab', Assist.CardsSavedScreen, '', 'flashcards'),
	mobile('m-sino-ana', 'Bilgi Kartları ve SinoAI', 'SinoAI', 'SinoAi', Sino.SinoHomeScreen, '', 'sinoAi'),
	mobile('m-sino-sohbet', 'Bilgi Kartları ve SinoAI', 'SinoAI · sohbet', 'SinoAiChat', Sino.SinoChatScreen, '', 'sinoAi'),
	mobile('m-sino-calisma', 'Bilgi Kartları ve SinoAI', 'SinoAI · çalışma', 'SinoAiChat (Çalışma)', Sino.SinoStudyScreen, 'Kilit simgesi yok; kota yazılı.', 'sinoAi'),
	mobile('m-sino-kutuphane', 'Bilgi Kartları ve SinoAI', 'SinoAI · kütüphane', 'yeni', Sino.SinoLibraryScreen, '', 'sinoAi'),
	mobile('m-sino-menu', 'Bilgi Kartları ve SinoAI', 'SinoAI · menü', 'SinoAiChat (menü)', Sino.SinoMenuScreen, 'Boş Yeni sohbet kayıtları tutulmaz.', 'sinoAi'),
	mobile('m-profil', 'Profil ve hesap', 'Profil', 'ProfileMain', Account.ProfileScreen, 'Daha fazla sekmesi kalktı; her şey Profil içinde.'),
	mobile('m-profil-devam', 'Profil ve hesap', 'Profil · alt bölüm', 'ProfileMain', Account.ProfileMoreScreen, ''),
	mobile('m-profil-bilgiler', 'Profil ve hesap', 'Kişisel bilgiler', 'ProfileUserInfo / ProfileEdit', Account.ProfileDetailsScreen, ''),
	mobile('m-profil-hedef', 'Profil ve hesap', 'Hedefim', 'ProfileAcademic', Account.ProfileGoalScreen, ''),
	mobile('m-profil-abonelik', 'Profil ve hesap', 'Aboneliğim', 'ProfileMySubscriptions', Account.SubscriptionScreen, ''),
	mobile('m-profil-paketler', 'Profil ve hesap', 'Paketler', 'ProfileAvailablePackages', Account.PackagesScreen, ''),
	mobile('m-profil-gorunum', 'Profil ve hesap', 'Görünüm', 'ProfileAppearance', Account.AppearanceScreen, ''),
	mobile('m-profil-dil', 'Profil ve hesap', 'Dil', 'ProfileLanguage', Account.LanguageScreen, ''),
	mobile('m-profil-iletisim', 'Profil ve hesap', 'Bildirim ve iletişim', 'ProfileCommunicationPreferences', Account.CommunicationScreen, ''),
	mobile('m-profil-guvenlik', 'Profil ve hesap', 'Hesap güvenliği', 'ProfileAccountSecurity', Account.SecurityScreen, ''),
	mobile('m-profil-kapat', 'Profil ve hesap', 'Hesabımı kapat', 'ProfileAccountClosure', Account.CloseAccountScreen, ''),
	mobile('m-bildirimler', 'Bildirim, destek, durumlar', 'Bildirimler', 'NotificationInbox', Account.NotificationsScreen, ''),
	mobile('m-destek', 'Bildirim, destek, durumlar', 'Destek', 'SupportHub', Account.SupportHubScreen, ''),
	mobile('m-destek-yeni', 'Bildirim, destek, durumlar', 'Yeni talep', 'SupportNew', Account.SupportNewScreen, ''),
	mobile('m-destek-talep', 'Bildirim, destek, durumlar', 'Talep detayı', 'SupportTicketDetail', Account.SupportTicketScreen, ''),
	mobile('m-hakkinda', 'Bildirim, destek, durumlar', 'Hakkında', 'ExamAbout', Account.AboutScreen, 'Push hata ayıklama bilgisi kalktı.'),
	mobile('m-geri-bildirim', 'Bildirim, destek, durumlar', 'Geri bildirimlerim', 'FeedbackMy', Account.FeedbackScreen, ''),
	mobile('m-durum-bos', 'Bildirim, destek, durumlar', 'Boş durum', '—', Account.EmptyStateScreen, ''),
	mobile('m-durum-hata', 'Bildirim, destek, durumlar', 'Yükleniyor, hata, çevrimdışı', '—', Account.ErrorStateScreen, ''),
	web('w-giris', 'Web · giriş ve onboarding', 'Giriş yap', '/student/login', WOnb.WebSignInScreen, 'Sitenin mevcut ortalanmış kart düzeni; Google ve Apple üstte, kodla giriş seçeneği.'),
	web('w-giris-kod', 'Web · giriş ve onboarding', 'Giriş kodu', '/student/login', WOnb.WebSignInCodeScreen, ''),
	web('w-kayit', 'Web · giriş ve onboarding', 'Kayıt ol', '/student/register', WOnb.WebSignUpScreen, 'Paket seçimi kayıttan çıktı; önce plan, sonra paket.'),
	web('w-sifre-unuttum', 'Web · giriş ve onboarding', 'Şifremi unuttum', '/student/forgot-password', WOnb.WebForgotScreen, ''),
	web('w-sifre-sifirla', 'Web · giriş ve onboarding', 'Şifre sıfırla', '/student/reset-password', WOnb.WebResetScreen, ''),
	web('w-onb-1-sinav', 'Web · giriş ve onboarding', 'Web onboarding 1 · Sınav', 'yeni', WOnb.WebOnbExamScreen, 'Web’de onboarding yoktu; mobil ile aynı adımlar, sağda canlı önizleme.'),
	web('w-onb-2-hedef', 'Web · giriş ve onboarding', 'Web onboarding 2 · Hedef', 'yeni', WOnb.WebOnbGoalScreen, ''),
	web('w-onb-3-tempo', 'Web · giriş ve onboarding', 'Web onboarding 3 · Tempo', 'yeni', WOnb.WebOnbTempoScreen, ''),
	web('w-onb-4-dersler', 'Web · giriş ve onboarding', 'Web onboarding 4 · Dersler', 'yeni', WOnb.WebOnbWeakScreen, ''),
	web('w-onb-5-plan', 'Web · giriş ve onboarding', 'Web onboarding 5 · Planın hazır', 'yeni', WOnb.WebOnbPlanScreen, 'Sağda aynı planın mobil hali.'),
	web('w-onb-6-paket', 'Web · giriş ve onboarding', 'Web onboarding 6 · 3 gün ücretsiz', 'yeni', WOnb.WebOnbPlanChoiceScreen, ''),
	web('w-panel-anasayfa', 'Web · panel', 'Ana sayfa', '/student/dashboard', WPanel.WebHomeScreen, 'Günün adımı, plan, hedef, son deneme; modül kısa yolları renkli.'),
	web('w-panel-tur', 'Web · panel', 'İlk giriş turu', 'yeni', WPanel.WebTourScreen, ''),
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
	web('w-deneme-denemelerim', 'Web · Denemeler', 'Denemelerim ve takvim', '/student/sinavlarim + /sinav-takvimi', WExam.WebMyExamsScreen, 'Sınavlarım ve Sınav takvimi tek sekmede.', 'exam'),
	web('w-deneme-detay', 'Web · Denemeler', 'Deneme detayı', '/student/sinav/[examId]', WExam.WebExamDetailScreen, '', 'exam'),
	web('w-deneme-coz', 'Web · Denemeler', 'Deneme çözme (odak)', '/student/sinav/coz/[examUserId]', WExam.WebExamSolveScreen, '', 'exam'),
	web('w-deneme-sonuclar', 'Web · Denemeler', 'Sonuçlar', '/student/sinav-sonuclari', WExam.WebResultsScreen, '', 'exam'),
	web('w-deneme-sonuc', 'Web · Denemeler', 'Sonuç ve analiz', '/student/sinav-sonuclari/[snapshotId]', WExam.WebResultScreen, '', 'exam'),
	web('w-deneme-cozumler', 'Web · Denemeler', 'Soru çözümleri', '/student/soru-cozumleri/[examAttemptId]', WExam.WebSolutionsScreen, 'Not Found yerine soru haritası + çözüm.', 'exam'),
	web('w-deneme-istatistik', 'Web · Denemeler', 'İstatistik', '/student/raporlarim', WExam.WebStatsScreen, 'Raporlarım ve İstatistikler buraya; satırlarda ders adı.', 'exam'),
	web('w-ders-vitrin', 'Web · Dersler ve Testler', 'Dersler', '/student/ders-cal', WLearn.WebLessonsHomeScreen, 'Ders Çalış adı Dersler oldu.', 'lessons'),
	web('w-ders-agac', 'Web · Dersler ve Testler', 'Konu ağacı', '/student/ders-cal/kesfet', WLearn.WebLessonsTreeScreen, '', 'lessons'),
	web('w-ders-detay', 'Web · Dersler ve Testler', 'Konu detayı', '/student/ders-cal/ders/[lessonSubId]', WLearn.WebLessonDetailScreen, '', 'lessons'),
	web('w-ders-rota', 'Web · Dersler ve Testler', 'Öğrenme rotası', '/student/ders-cal/ogrenme-rotasi', WLearn.WebLessonsPathScreen, '', 'lessons'),
	web('w-ders-gecmis', 'Web · Dersler ve Testler', 'Geçmiş', '/student/ders-cal/gecmis', WLearn.WebLessonsHistoryScreen, '', 'lessons'),
	web('w-ders-calis', 'Web · Dersler ve Testler', 'Mikro ders (odak)', '/student/ders-cal/calis/[workId]', WLearn.WebLessonStudyScreen, '', 'lessons'),
	web('w-test-vitrin', 'Web · Dersler ve Testler', 'Testler', '/student/testler', WLearn.WebTestsHomeScreen, '', 'tests'),
	web('w-test-konular', 'Web · Dersler ve Testler', 'Ders konuları', '/student/testler/[lessonMainId]', WLearn.WebTestTopicsScreen, '', 'tests'),
	web('w-test-coz', 'Web · Dersler ve Testler', 'Test çözme (odak)', '/student/testler/quiz/[quizId]', WLearn.WebTestSolveScreen, '', 'tests'),
	web('w-plan-bugun', 'Web · Ders Planı', 'Bugün', '/student/ders-plani', WPlan.WebPlanTodayScreen, '', 'studyPlan'),
	web('w-plan-program', 'Web · Ders Planı', 'Program', '/student/ders-plani/program', WPlan.WebPlanScheduleScreen, '', 'studyPlan'),
	web('w-plan-oneriler', 'Web · Ders Planı', 'Öneriler', '/student/ders-plani/oneriler', WPlan.WebPlanSuggestionsScreen, '', 'studyPlan'),
	web('w-plan-istatistik', 'Web · Ders Planı', 'İstatistik', '/student/ders-plani/istatistik', WPlan.WebPlanStatsScreen, '', 'studyPlan'),
	web('w-plan-ilerleme', 'Web · Ders Planı', 'İlerleme', '/student/ders-plani/ilerleme', WPlan.WebPlanProgressScreen, '', 'studyPlan'),
	web('w-plan-ayarlar', 'Web · Ders Planı', 'Ayarlar', '/student/ders-plani/ayarlar', WPlan.WebPlanSettingsScreen, '', 'studyPlan'),
	web('w-plan-odak', 'Web · Ders Planı', 'Odak (çalış)', '/student/ders-plani/calis/[taskId]', WPlan.WebPlanFocusScreen, '', 'studyPlan'),
	web('w-kart-vitrin', 'Web · Kartlar, Özet, SinoAI', 'Bilgi Kartları', '/student/flashcard', WAssist.WebCardsHomeScreen, 'Kelime Kartları adı Bilgi Kartları oldu; akış yok.', 'flashcards'),
	web('w-kart-gozat', 'Web · Kartlar, Özet, SinoAI', 'Gözat', '/student/flashcard/browse/...', WAssist.WebCardsBrowseScreen, '', 'flashcards'),
	web('w-kart-oturum', 'Web · Kartlar, Özet, SinoAI', 'Kart oturumu (odak)', '/student/flashcard/session', WAssist.WebCardSessionScreen, '', 'flashcards'),
	web('w-kart-kaydedilen', 'Web · Kartlar, Özet, SinoAI', 'Kaydedilenler', 'yeni', WAssist.WebCardsSavedScreen, '', 'flashcards'),
	web('w-ozet-vitrin', 'Web · Kartlar, Özet, SinoAI', 'Akıllı Özet', '/student/lens', WAssist.WebSummaryHomeScreen, 'Lens AI Analiz adı Akıllı Özet oldu; geçmişte GUID yok.', 'smartSummary'),
	web('w-ozet-yeni', 'Web · Kartlar, Özet, SinoAI', 'Yeni analiz', '/student/lens/yeni', WAssist.WebSummaryNewScreen, '', 'smartSummary'),
	web('w-ozet-detay', 'Web · Kartlar, Özet, SinoAI', 'Analiz detayı', '/student/lens/analiz/[id]', WAssist.WebSummaryDetailScreen, '', 'smartSummary'),
	web('w-ozet-video', 'Web · Kartlar, Özet, SinoAI', 'Video analizi', '/student/lens/video/[id]', WAssist.WebSummaryVideoScreen, '', 'smartSummary'),
	web('w-sino-sohbet', 'Web · Kartlar, Özet, SinoAI', 'SinoAI sohbet', '/student/sinoai/[conversationId]', WSino.WebSinoChatScreen, 'Sınavika AI adı SinoAI oldu.', 'sinoAi'),
	web('w-sino-calisma', 'Web · Kartlar, Özet, SinoAI', 'SinoAI çalışma', '/student/sinoai/study', WSino.WebSinoStudyScreen, '', 'sinoAi'),
	web('w-sino-kutuphane', 'Web · Kartlar, Özet, SinoAI', 'SinoAI kütüphane', '/student/sinoai/library', WSino.WebSinoLibraryScreen, '', 'sinoAi'),
	site('s-anasayfa', 'Web sitesi', 'Ana sayfa', '/', SiteP.SiteHomeScreen, 3718, 'Sitenin mevcut header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri.'),
	site('s-urunler-menu', 'Web sitesi', 'Ürünler menüsü', 'header', SiteP.SiteMenuScreen, 900, 'Ürünler açılınca 7 modül, sitenin sade gri tonlarında.'),
	site('s-sinavlar', 'Web sitesi', 'Sınavlar', '/sinavlar', SiteP.SiteExamsScreen, 1189, ''),
	site('s-sinav-yks', 'Web sitesi', 'Sınav sayfası · YKS', '/yks-hazirlik (şablon)', SiteP.SiteExamLandingScreen, 2657, 'Tüm sınav ve hazırlık sayfaları bu şablonla.'),
	site('s-net-hesaplama', 'Web sitesi', 'Net hesaplama', '/net-hesaplama', SiteP.SiteNetCalcScreen, 1024, ''),
	site('s-paketler', 'Web sitesi', 'Paketler', '/corporate/packages', SiteP.SitePlansScreen, 1160, ''),
	site('s-urun-denemeler', 'Web sitesi', 'Ürün · Denemeler', '/urunler/denemeler (şablon)', SiteP.SiteProductExamScreen, 2068, 'Altı ürün sayfası tek şablon.'),
	site('s-urun-ozet', 'Web sitesi', 'Ürün · Akıllı Özet', '/urunler/lens', SiteP.SiteProductSummaryScreen, 2047, ''),
	site('s-blog', 'Web sitesi', 'Blog', '/blog', SiteP.SiteBlogScreen, 1815, ''),
	site('s-blog-yazi', 'Web sitesi', 'Blog yazısı', '/blog/[slug]', SiteP.SiteBlogPostScreen, 1362, ''),
	site('s-hakkimizda', 'Web sitesi', 'Hakkımızda', '/corporate/about', SiteP.SiteAboutScreen, 1210, ''),
	site('s-sss-iletisim', 'Web sitesi', 'SSS ve iletişim', '/corporate/sss + /contact', SiteP.SiteFaqContactScreen, 1116, ''),
	site('s-yasal', 'Web sitesi', 'Yasal sayfa', '/corporate/yasal/[slug]', SiteP.SiteLegalScreen, 993, ''),
	site('s-sinoai-misafir', 'Web sitesi', 'SinoAI · misafir', '/sinoai', SiteP.SiteSinoGuestScreen, 900, ''),
];

export const UI_SCREEN_IDS = UI_SCREENS.map((screen) => screen.id) as [string, ...string[]];

export const findScreen = (id: string): UIScreen => {
	const screen = UI_SCREENS.find((entry) => entry.id === id);
	if (!screen) throw new Error(`Bilinmeyen UI/UX ekranı: ${id}`);
	return screen;
};
