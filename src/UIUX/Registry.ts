import type React from 'react';
import type {ModuleKey} from './ModuleIdentity';
import * as Account from './Screens/Mobile/Account';
import * as Assist from './Screens/Mobile/Assist';
import * as Auth from './Screens/Mobile/Auth';
import * as Exam from './Screens/Mobile/Exam';
import * as Insights from './Screens/Mobile/Insights';
import {HubDayDoneScreen, HubExpiredScreen, HubNoPlanScreen, HubScreen, HubScrolledScreen, HubTipScreen} from './Screens/Mobile/Hub';
import * as Tests from './Screens/Mobile/Learn';
import * as Lessons from './Screens/Mobile/Lessons';
import * as Steps from './Screens/Mobile/LessonSteps';
import * as States from './Screens/Mobile/States';
import * as Onb from './Screens/Mobile/Onboarding';
import * as Plan from './Screens/Mobile/Plan';
import * as Sino from './Screens/Mobile/SinoAI';
import * as SiteP from './Screens/Site/Site';
import * as TLearn from './Screens/Tablet/Learn';
import * as TSolve from './Screens/Tablet/Solve';
import * as TWide from './Screens/Tablet/Wide';
import * as WAssist from './Screens/Web/AssistWeb';
import * as WExam from './Screens/Web/ExamWeb';
import * as WLessons from './Screens/Web/LessonsWeb';
import * as WOnb from './Screens/Web/OnboardingWeb';
import * as WPanel from './Screens/Web/Panel';
import * as WPlan from './Screens/Web/PlanWeb';
import * as WSino from './Screens/Web/SinoWeb';
import * as WStudy from './Screens/Web/StudyWeb';
import * as WTests from './Screens/Web/TestsWeb';

/**
 * Every UI/UX drawing, by id. The export (`npm run uiux`), the boards and the
 * screen inventory (docs/UIUX/Ekran-Envanteri.md) read this list.
 *
 * Ids: m-<group>-<name> mobile, w-<group>-<name> web panel, s-<name> site, t-<group>-<name> tablet.
 * `route` names the screen in the app (mobile route name or web path), so a
 * drawing maps to the code that draws it. `note` says what the screen does.
 */
export type UIPlatform = 'mobile' | 'web' | 'site' | 'tablet';

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
	/** Tablet screens drawn upright (834 × 1194) instead of landscape. */
	portrait?: boolean;
};

const mobile = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'mobile', group, title, route, Component, note, module});
const web = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'web', group, title, route, Component, note, module});
const site = (id: string, group: string, title: string, route: string, Component: React.FC, height: number, note = ''): UIScreen => ({id, platform: 'site', group, title, route, Component, note, height});
const tablet = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey, portrait?: boolean): UIScreen => ({id, platform: 'tablet', group, title, route, Component, note, module, portrait});

export const UI_SCREENS: readonly UIScreen[] = [
	mobile('m-hub-moduller', 'Modüller', 'Modüller (ana ekran)', 'ModuleHubHome', HubScreen, 'Ana ekran (5 Kas 2026 revizyonu): önce “bugün ne yapacağım”. Selam, hedef ve seri; hafta şeridi (bugünün halkası); günün planı ve sıradaki görev tek düğmeyle; iki eylem kartı (kaldığın yer, sıradaki deneme); modüller üç sütun. Veri: engagement/today, study-plan calendar, works continue, yaklaşan deneme.'),
	mobile('m-hub-moduller-kaydir', 'Modüller', 'Modüller · aşağı kaydırılmış', 'ModuleHubHome', HubScrolledScreen, 'Modüller ızgarası, SinoAI, Bugün tekrar (Dersler adımları + Bilgi Kartları) ve Destek.'),
	mobile('m-hub-ipucu', 'Modüller', 'İlk açılış ipucu', 'ModuleHubHome', HubTipScreen, 'İlk açılışta tek ipucu, günün planı kartında. Tur yok.'),
	mobile('m-hub-plansiz', 'Modüller', 'Ana ekran · planı olmayan öğrenci', 'ModuleHubHome', HubNoPlanScreen, 'Plan kartı kayıttaki cevapları gösterir ve tek düğmeyle planı hazırlar; ilk mikro ders plansız da başlar.'),
	mobile('m-hub-gun-bitti', 'Modüller', 'Ana ekran · günün planı bitti', 'ModuleHubHome', HubDayDoneScreen, 'Bitti kartı: görev, dakika, seri; Yarına bak ve isteğe bağlı fazladan 10 soru.'),
	mobile('m-hub-abonelik-bitti', 'Modüller', 'Ana ekran · deneme süresi bitti', 'ModuleHubHome', HubExpiredScreen, 'Ödeme yoksa erişim yok: ilerleme korunur, modüller kilitli; Paketleri gör ve mağaza alımını geri yükle.'),
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
	mobile('m-deneme-detay-bitti', 'Denemeler', 'Biten denemenin detayı', 'ExamStudentPublicDetail', Exam.ExamDoneDetailScreen, 'Canlı hata #3: biten denemede “Denemeye gir” ve hatırlatma yok; önce sonuç, sonra Sonuç belgesi, Çözümler, Analiz ve net kaybettiren konular.', 'exam'),
	mobile('m-deneme-baslangic', 'Denemeler', 'Başlamadan önce', 'ExamStudentStarting', Exam.ExamStartingScreen, '', 'exam'),
	mobile('m-deneme-coz', 'Denemeler', 'Deneme çözme', 'ExamStudentSolve', Exam.ExamSolveScreen, 'Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Doğru ve yanlış teslimden sonra açılır.', 'exam'),
	mobile('m-deneme-teslim', 'Denemeler', 'Teslim onayı', 'ExamStudentSolve', Exam.ExamSubmitScreen, 'Gri sistem penceresi yerine uygulamanın alt sayfası: cevaplı, boş, işaretli sayıları ve boş soruların numaraları; Boşlara dön / Teslim et.', 'exam'),
	mobile('m-deneme-baglanti', 'Denemeler', 'Deneme · bağlantı koptu', 'ExamStudentSolve', States.ExamOfflineScreen, 'Cevaplar telefonda saklanır, süre işler, bağlanınca kendiliğinden gönderilir; bekleyen cevap sayısı.', 'exam'),
	mobile('m-deneme-denemelerim', 'Denemeler', 'Denemelerim', 'MyExams', Exam.MyExamsScreen, 'Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede.', 'exam'),
	mobile('m-deneme-sonuclar', 'Denemeler', 'Sonuçlar', 'ExamResultsHub', Exam.ExamResultsScreen, 'Net gelişimi sütunlarla (değer sütunun üstünde, dışarıda çözülen çizgili), üç giriş: Sınavika denemelerim, Analizlerim, Deneme ekle; son sonuçlar.', 'exam'),
	mobile('m-deneme-sonuclar-bos', 'Denemeler', 'Sonuçlar · henüz deneme yok', 'ExamResultsHub', States.ExamResultsEmptyScreen, 'İlk denemeden önce: ne birikeceği, sıradaki deneme ve Deneme ekle.', 'exam'),
	mobile('m-deneme-ekle', 'Denemeler', 'Deneme ekle', 'ExamExternalResult (yeni)', Exam.ExamAddExternalScreen, 'Yeni: dışarıda çözülen denemenin sonucu (yayın, ad, tarih, ders ders doğru/yanlış, net canlı hesaplanır). Yeni API gerekir.', 'exam'),
	mobile('m-deneme-sonuc', 'Denemeler', 'Sonuç', 'ExamResultDocument', Exam.ExamResultScreen, '', 'exam'),
	mobile('m-deneme-analiz', 'Denemeler', 'Eksik konu analizi', 'ExamStatsLessonOverview', Exam.ExamAnalysisScreen, 'Analiz eylemle biter: mikro ders, test, plana ekle.', 'exam'),
	mobile('m-deneme-gelisim', 'Denemeler', 'Ders gelişimi', 'ExamStatsLessonTrend', Exam.ExamTrendScreen, '', 'exam'),
	mobile('m-deneme-cozumler', 'Denemeler', 'Çözümler', 'ExamSolutionExamCards', Exam.ExamSolutionsScreen, '', 'exam'),
	mobile('m-deneme-cozum', 'Denemeler', 'Soru çözümü', 'ExamSolutionBookletReview', Exam.ExamBookletScreen, '', 'exam'),
	mobile('m-ders-vitrin', 'Dersler', 'Dersler', 'WorkHome', Lessons.LessonsHomeScreen, 'Kaldığın yerden (GET continue), bugünkü tekrar (GET reviews) ve sınavın dersleri mikro ders ilerlemesiyle (GET lessons).', 'lessons'),
	mobile('m-ders-ilk', 'Dersler', 'Dersler · ilk giriş', 'WorkHome', States.LessonsFirstVisitScreen, 'Kaldığın yer henüz yok: kayıtta zorlandığın dersten ilk konu ve Dersler’in nasıl işlediği üç satırda.', 'lessons'),
	mobile('m-ders-konular', 'Dersler', 'Konular', 'WorkCatalog', Lessons.LessonsTopicsScreen, 'Dersin konuları müfredat sırasıyla: mikro ders sayısı, süre, ilerleme ve ilk denemede doğru oranı.', 'lessons'),
	mobile('m-ders-tekrar', 'Dersler', 'Tekrar', 'WorkReview', Lessons.LessonsReviewScreen, 'İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede.', 'lessons'),
	mobile('m-ders-tekrar-bos', 'Dersler', 'Tekrar · bugün yok', 'WorkReview', States.LessonsReviewEmptyScreen, 'Sıradaki tekrarın günü ve adım sayısı; kaldığın derse dönüş.', 'lessons'),
	mobile('m-ders-konu-girisi', 'Dersler', 'Konu girişi', 'WorkSub', Lessons.LessonTopicIntroScreen, 'Kanca, video ve mikro derslerin yol haritası; tek düğme sıradaki mikro derse götürür. Video yoksa satır gizlenir.', 'lessons'),
	mobile('m-ders-tanim', 'Dersler', 'Adım · Tanım', 'WorkMikro', Lessons.LessonConceptScreen, 'Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle.', 'lessons'),
	mobile('m-ders-ornek', 'Dersler', 'Adım · Örnek', 'WorkMikro', Lessons.LessonExampleScreen, 'Example: örnek cümle, açıklama ve dikkat notu.', 'lessons'),
	mobile('m-ders-kural', 'Dersler', 'Adım · Kural', 'WorkMikro', Lessons.LessonRuleScreen, 'Rule: numaralı kural listesi.', 'lessons'),
	mobile('m-ders-gorsel', 'Dersler', 'Adım · Görsel', 'WorkMikro', Lessons.LessonVisualScreen, 'Visual: merkezi figür (burada karşılaştırma tablosu) ve kısa açıklama.', 'lessons'),
	mobile('m-ders-tahmin', 'Dersler', 'Adım · Önce sen tahmin et', 'WorkMikro', Lessons.LessonPredictScreen, 'Choice: seçimden sonra açıklama ve Gerçek/Mecaz karşılaştırması.', 'lessons'),
	mobile('m-ders-dogru-yanlis', 'Dersler', 'Adım · Doğru mu, yanlış mı?', 'WorkMikro', Lessons.LessonTrueFalseScreen, 'TrueFalse: sık yapılan hata yargı olarak sorulur; doğrusu ve nedeni.', 'lessons'),
	mobile('m-ders-grupla', 'Dersler', 'Adım · Grupla', 'WorkMikro', Steps.LessonGroupScreen, 'Gruplar alt alta, kutudaki metin tam (kesilmez), hedef sözcük koyu; kalan kart sayısı Kontrol et’in üstünde.', 'lessons'),
	mobile('m-ders-eslestir', 'Dersler', 'Adım · Eşleştir', 'WorkMikro', Steps.LessonMatchScreen, 'Eşleşen ikili aynı numarayı alır; Kontrol et sabit altta, kaydırmadan görünür.', 'lessons'),
	mobile('m-ders-cevir', 'Dersler', 'Adım · Çevir', 'WorkMikro', Steps.LessonFlipScreen, 'Arka yüzde içeriğin açıklaması da görünür; Biliyordum / Bilmiyordum kartın içinde.', 'lessons'),
	mobile('m-ders-sec', 'Dersler', 'Adım · Seç (sözcüğe dokun)', 'WorkMikro', Steps.LessonPickWordsScreen, 'Cümlenin sözcükleri dokunulabilir; seçilen sayısı yazılı.', 'lessons'),
	mobile('m-ders-coklu', 'Dersler', 'Adım · Çoklu seçim', 'WorkMikro', Steps.LessonMultiScreen, 'Sonuçta yanlış seçilen ve kaçırılan ayrı işaretli.', 'lessons'),
	mobile('m-ders-sirala', 'Dersler', 'Adım · Sırala', 'WorkMikro', Lessons.LessonOrderScreen, 'Order: adımlara sırayla dokunulur; sürükleme gerekmez.', 'lessons'),
	mobile('m-ders-bosluk', 'Dersler', 'Adım · Boşluk doldur', 'WorkMikro', Lessons.LessonFillScreen, 'FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer.', 'lessons'),
	mobile('m-ders-yazmali', 'Dersler', 'Adım · Yazmalı boşluk', 'WorkMikro', Steps.LessonTypedBlankScreen, 'Satırdaki boşluk giriş alanının kendisi; klavye açıkken Kontrol et klavyenin üstünde.', 'lessons'),
	mobile('m-ders-formul', 'Dersler', 'Adım · Formül ve tablo', 'WorkMikro', Steps.LessonFormulaScreen, 'Kesir üst üste, eksi kesrin önünde; kök çizgisi içini örter; üs harfe yakın; tablo hücresi en az 15 pt.', 'lessons'),
	mobile('m-ders-bolum', 'Dersler', 'Bölüm başı', 'WorkMikro', Steps.LessonSectionScreen, 'Bölümün ne öğreteceği, bölüm haritası ve Önceki bölüm düğmesi.', 'lessons'),
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
	mobile('m-test-yanlislar', 'Testler', 'Yanlışlarım', 'QuizSolutions', Insights.TestWrongReviewScreen, 'İlk yanlıştan açılır; Yanlış / Boş / Tümü; konuyu çalış (Dersler renginde) ve Sonraki yanlış.', 'tests'),
	mobile('m-test-bitti', 'Testler', 'Test bitti', 'QuizComplete', Tests.TestDoneScreen, '', 'tests'),
	mobile('m-test-cozumler', 'Testler', 'Çözümler', 'QuizSolutions', Tests.TestsSolutionsScreen, '', 'tests'),
	mobile('m-test-cozumler-bos', 'Testler', 'Çözümler · henüz test yok', 'QuizSolutions', States.TestsSolutionsEmptyScreen, 'Senin için hazır testle başla.', 'tests'),
	mobile('m-plan-bugun', 'Ders Planı', 'Bugün', 'StudyPlanHome', Plan.PlanTodayScreen, 'Örnek takvim yapısı: Gün/Hafta/Ay, modül süzgeçleri, hafta halkaları, günün yüzdesi ve süre; her görev kaynağını (sınav · ders · neden), konusunu, modül rozetini ve miktarını (soru, mikro ders, kart) ya da saatini söyler. + kendi görevin.', 'studyPlan'),
	mobile('m-plan-yok', 'Ders Planı', 'Planı olmayan öğrenci', 'StudyPlanHome (StudyPlanNoPlanEmpty)', States.PlanNoneScreen, 'Planın ne yaptığı, kayıt cevaplarından örnek bir gün; Planımı hazırla ya da kendim kurayım.', 'studyPlan'),
	mobile('m-plan-dunden', 'Ders Planı', 'Dünden kalan görevler', 'StudyPlanHome', States.PlanMissedScreen, 'Biten olmayan görev sessizce kaybolmaz: Bugüne ekle ya da haftaya yay (PATCH schedule).', 'studyPlan'),
	mobile('m-plan-gorev-ekle', 'Ders Planı', 'Görev ekle', 'StudyPlanManualTaskSheet', Plan.PlanAddTaskScreen, 'Kendi görevin: tür, ders ve konu, not, gün ve saat, süre (POST study-plan tasks).', 'studyPlan'),
	mobile('m-plan-gorev-islem', 'Ders Planı', 'Görev işlemleri', 'StudyPlanTaskActionSheet', Plan.PlanTaskActionScreen, 'Görevi başlat (modül renginde), odak sayacıyla başla, yarına taşı, yaptım olarak işaretle, bugünden kaldır (PATCH status / schedule).', 'studyPlan'),
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
	mobile('m-ozet-hak', 'Akıllı Özet', 'Aylık hak doldu', 'LensHome', States.SummaryQuotaScreen, 'Yenilenme tarihi, geçmiş analizler açık; SinoAI’ye yönlendirme.', 'smartSummary'),
	mobile('m-ozet-okunamadi', 'Akıllı Özet', 'Fotoğraf okunamadı', 'LensUpload', States.SummaryFailedScreen, 'Neden ve üç çekim ipucu; hak düşmedi.', 'smartSummary'),
	mobile('m-ozet-video', 'Akıllı Özet', 'Video analizi', 'LensVideo', Assist.SummaryVideoScreen, '', 'smartSummary'),
	mobile('m-kart-vitrin', 'Bilgi Kartları', 'Bilgi Kartları', 'FlashcardMain', Assist.CardsHomeScreen, 'Sekmeler Kartlar · Bugün · Kaydedilenler.', 'flashcards'),
	mobile('m-kart-bugun', 'Bilgi Kartları', 'Bugün', 'FlashcardToday', Assist.CardsTodayScreen, '', 'flashcards'),
	mobile('m-kart-bitti', 'Bilgi Kartları', 'Bugün · kartlar bitti', 'FlashcardToday', States.CardsDoneScreen, 'Kaç kart, kaçını bildin, yarın kaç kart; kart serisi.', 'flashcards'),
	mobile('m-kart-on', 'Bilgi Kartları', 'Kart oturumu · ön yüz', 'FlashcardSession', Assist.CardSessionScreen, '', 'flashcards'),
	mobile('m-kart-arka', 'Bilgi Kartları', 'Kart oturumu · cevap', 'FlashcardSession', Assist.CardSessionBackScreen, '', 'flashcards'),
	mobile('m-kart-kaydedilen', 'Bilgi Kartları', 'Kaydedilenler', 'FlashcardSavedTab', Assist.CardsSavedScreen, '', 'flashcards'),
	mobile('m-sino-ana', 'SinoAI', 'SinoAI', 'SinoAi', Sino.SinoHomeScreen, '', 'sinoAi'),
	mobile('m-sino-sohbet', 'SinoAI', 'SinoAI · sohbet', 'SinoAiChat', Sino.SinoChatScreen, '', 'sinoAi'),
	mobile('m-sino-calisma', 'SinoAI', 'SinoAI · çalışma', 'SinoAiChat (Çalışma)', Sino.SinoStudyScreen, 'Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı.', 'sinoAi'),
	mobile('m-sino-sonuc', 'SinoAI', 'SinoAI · üretim sonucu', 'SinoAiChat (Çalışma sonucu)', Sino.SinoStudyResultScreen, 'Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir.', 'sinoAi'),
	mobile('m-sino-kutuphane', 'SinoAI', 'SinoAI · kütüphane', '—', Sino.SinoLibraryScreen, '', 'sinoAi'),
	mobile('m-sino-menu', 'SinoAI', 'SinoAI · menü', 'SinoAiChat (menü)', Sino.SinoMenuScreen, 'Arama, yeni sohbet, kütüphane ve gün gün sohbetler.', 'sinoAi'),
	mobile('m-sino-hak', 'SinoAI', 'SinoAI · günlük hak doldu', 'SinoAi', States.SinoLimitScreen, 'Ne zaman yenileneceği, kütüphane açık; mikro ders ve testler bu hakkı kullanmaz.', 'sinoAi'),
	mobile('m-profil', 'Profil ve hesap', 'Profil', 'ProfileMain', Account.ProfileScreen, 'Hedef, abonelik, görünüm, destek ve hakkında tek yerde.'),
	mobile('m-profil-devam', 'Profil ve hesap', 'Profil · alt bölüm', 'ProfileMain', Account.ProfileMoreScreen, ''),
	mobile('m-istatistik', 'İstatistikler', 'İstatistiklerim', 'ProfileStatistics', Insights.StatisticsScreen, 'Bu hafta: süre, soru, seri; günlük çalışma modüllere göre yığılı; net gelişimi; derslere göre doğru oranı ve süre.'),
	mobile('m-istatistik-ilk', 'İstatistikler', 'İstatistikler · ilk hafta', 'ProfileStatistics', Insights.StatisticsFirstWeekScreen, 'Sıfır duvarı yerine ilk üç adım; veri geldikçe grafikler açılır.'),
	mobile('m-profil-bilgiler', 'Profil ve hesap', 'Kişisel bilgiler', 'ProfileUserInfo / ProfileEdit', Account.ProfileDetailsScreen, ''),
	mobile('m-profil-hedef', 'Profil ve hesap', 'Hedefim', 'ProfileAcademic', Account.ProfileGoalScreen, ''),
	mobile('m-profil-abonelik', 'Profil ve hesap', 'Aboneliğim', 'ProfileMySubscriptions', Account.SubscriptionScreen, ''),
	mobile('m-profil-paketler', 'Profil ve hesap', 'Paketler', 'ProfileAvailablePackages', Account.PackagesScreen, ''),
	mobile('m-profil-gorunum', 'Profil ve hesap', 'Görünüm', 'ProfileAppearance', Account.AppearanceScreen, ''),
	mobile('m-profil-dil', 'Profil ve hesap', 'Dil', 'ProfileLanguage', Account.LanguageScreen, ''),
	mobile('m-profil-iletisim', 'Profil ve hesap', 'Bildirim ve iletişim', 'ProfileCommunicationPreferences', Account.CommunicationScreen, ''),
	mobile('m-profil-guvenlik', 'Profil ve hesap', 'Hesap güvenliği', 'ProfileAccountSecurity', Account.SecurityScreen, 'Şifre belirleme ya da değiştirme, oturumlar.'),
	mobile('m-profil-kapat', 'Profil ve hesap', 'Hesabımı kapat', 'ProfileAccountClosure', Account.CloseAccountScreen, ''),
	mobile('m-hakkinda', 'Profil ve hesap', 'Hakkında', 'ExamAbout', Account.AboutScreen, ''),
	mobile('m-geri-bildirim', 'Profil ve hesap', 'Geri bildirimlerim', 'FeedbackMy', Account.FeedbackScreen, ''),
	mobile('m-bildirimler', 'Bildirimler', 'Bildirimler', 'NotificationInbox', Account.NotificationsScreen, ''),
	mobile('m-bildirimler-bos', 'Bildirimler', 'Bildirim yok', 'NotificationInbox', States.NotificationsEmptyScreen, 'Neyin burada görüneceği ve bildirim ayarları.'),
	mobile('m-destek', 'Destek', 'Destek', 'SupportHub', Account.SupportHubScreen, ''),
	mobile('m-destek-yeni', 'Destek', 'Yeni talep', 'SupportNew', Account.SupportNewScreen, ''),
	mobile('m-destek-talep', 'Destek', 'Talep detayı', 'SupportTicketDetail', Account.SupportTicketScreen, ''),
	mobile('m-durum-bos', 'Durumlar', 'Boş durum', '—', Account.EmptyStateScreen, ''),
	mobile('m-durum-hata', 'Durumlar', 'Yükleniyor, hata, çevrimdışı', '—', Account.ErrorStateScreen, ''),
	mobile('m-durum-guncelleme', 'Durumlar', 'Zorunlu güncelleme', '— (yeni: açılışta sürüm kontrolü)', States.ForceUpdateScreen, 'Desteklenmeyen sürüm: yüklü ve gerekli sürüm, tek düğme; ilerleme hesapta.'),
	web('w-giris', 'Web · Giriş ve kayıt', 'Giriş yap', '/student/login', WOnb.WebSignInScreen, 'Solda form (Google ve Apple üstte, kodla giriş), sağda tanıtım paneli.'),
	web('w-giris-kod', 'Web · Giriş ve kayıt', 'Giriş kodu', '/student/login', WOnb.WebSignInCodeScreen, ''),
	web('w-kayit', 'Web · Giriş ve kayıt', 'Kayıt ol', '/student/register', WOnb.WebSignUpScreen, 'Kayıtta paket yok: önce plan, sonra paket.'),
	web('w-sifre-unuttum', 'Web · Giriş ve kayıt', 'Şifremi unuttum', '/student/forgot-password', WOnb.WebForgotScreen, ''),
	web('w-sifre-sifirla', 'Web · Giriş ve kayıt', 'Şifre sıfırla', '/student/reset-password', WOnb.WebResetScreen, ''),
	web('w-onb-1-sinav', 'Web · Onboarding', 'Web onboarding 1 · Sınav', '/student/baslangic', WOnb.WebOnbExamScreen, 'Mobil ile aynı adımlar, sağda canlı önizleme.'),
	web('w-onb-2-hedef', 'Web · Onboarding', 'Web onboarding 2 · Hedef', '/student/baslangic', WOnb.WebOnbGoalScreen, ''),
	web('w-onb-3-tempo', 'Web · Onboarding', 'Web onboarding 3 · Tempo', '/student/baslangic', WOnb.WebOnbTempoScreen, ''),
	web('w-onb-4-dersler', 'Web · Onboarding', 'Web onboarding 4 · Dersler', '/student/baslangic', WOnb.WebOnbWeakScreen, ''),
	web('w-onb-5-plan', 'Web · Onboarding', 'Web onboarding 5 · Planın hazır', '/student/baslangic', WOnb.WebOnbPlanScreen, 'Sağda aynı planın mobil hali.'),
	web('w-onb-6-paket', 'Web · Onboarding', 'Web onboarding 6 · Paketini seç', '/student/baslangic', WOnb.WebOnbPlanChoiceScreen, 'Web’de deneme süresi yok: paket seçilir, kartla ödenir; “Şimdilik paket seçme” de var.'),
	web('w-panel-anasayfa', 'Web · Ana sayfa', 'Ana sayfa', '/student/dashboard', WStudy.WebHomeScreen, 'Mobil ile aynı Bugün düzeni: selam, hedef ve seri; günün planı ve sıradaki görev; hafta şeridi ve iki ölçü; Kaldığın yerden, Sıradaki deneme, Bugün tekrar.'),
	web('w-panel-tur', 'Web · Ana sayfa', 'İlk giriş ipucu', '/student/dashboard', WStudy.WebTourScreen, 'İlk girişte tek ipucu, günün adımının üstünde.'),
	web('w-panel-anasayfa-plansiz', 'Web · Ana sayfa', 'Ana sayfa · planı olmayan öğrenci', '/student/dashboard', WStudy.WebHomeNoPlanScreen, 'Plan kartı kayıt cevaplarını gösterir, Planımı hazırla; ilk mikro ders plansız başlar.'),
	web('w-panel-anasayfa-gun-bitti', 'Web · Ana sayfa', 'Ana sayfa · günün planı bitti', '/student/dashboard', WStudy.WebHomeDoneScreen, ''),
	web('w-panel-anasayfa-abonelik-bitti', 'Web · Ana sayfa', 'Ana sayfa · deneme süresi bitti', '/student/dashboard', WStudy.WebHomeExpiredScreen, 'Ödeme yoksa erişim yok; ilerleme korunur.'),
	web('w-panel-moduller', 'Web · Ana sayfa', 'Tüm modüller', '/student/moduller', WPanel.WebModulesScreen, ''),
	web('w-panel-bildirimler', 'Web · Bildirimler', 'Bildirimler', '/student/bildirimler', WPanel.WebNotificationsScreen, ''),
	web('w-panel-profil', 'Web · Profil ve hesap', 'Profil', '/student/profil', WPanel.WebProfileScreen, ''),
	web('w-panel-abonelik', 'Web · Profil ve hesap', 'Profil · abonelik', '/student/profil', WPanel.WebSubscriptionScreen, ''),
	web('w-panel-ayarlar', 'Web · Profil ve hesap', 'Profil · bildirim ve görünüm', '/student/profil', WPanel.WebSettingsScreen, ''),
	web('w-panel-destek', 'Web · Destek', 'Destek', '/student/destek', WPanel.WebSupportScreen, ''),
	web('w-panel-destek-talep', 'Web · Destek', 'Destek talebi', '/student/destek/[id]', WPanel.WebSupportTicketScreen, ''),
	web('w-panel-odeme', 'Web · Ödeme', 'Ödeme', '/student/odeme', WPanel.WebCheckoutScreen, ''),
	web('w-panel-odeme-basarili', 'Web · Ödeme', 'Ödeme başarılı', '/student/odeme/basarili', WPanel.WebPaySuccessScreen, ''),
	web('w-panel-odeme-basarisiz', 'Web · Ödeme', 'Ödeme başarısız', '/student/odeme/basarisiz', WPanel.WebPayFailScreen, ''),
	web('w-panel-durumlar', 'Web · Durumlar', 'Boş, yükleniyor, hata', '—', WPanel.WebStatesScreen, ''),
	web('w-deneme-vitrin', 'Web · Denemeler', 'Denemeler', '/student/sinavlarim', WExam.WebExamHomeScreen, '', 'exam'),
	web('w-deneme-denemelerim', 'Web · Denemeler', 'Denemelerim ve takvim', '/student/denemelerim', WExam.WebMyExamsScreen, 'Denemelerin ve sınav takvimi tek sekmede.', 'exam'),
	web('w-deneme-detay', 'Web · Denemeler', 'Deneme detayı', '/student/sinav/[examId]', WExam.WebExamDetailScreen, '', 'exam'),
	web('w-deneme-detay-bitti', 'Web · Denemeler', 'Biten denemenin detayı', '/student/sinav/[examId]', WStudy.WebExamDoneDetailScreen, 'Önce sonuç, sonra belge, çözüm, analiz ve net kaybettiren konular.'),
	web('w-deneme-coz', 'Web · Denemeler', 'Deneme çözme (odak)', '/student/sinav/coz/[examUserId]', WExam.WebExamSolveScreen, '', 'exam'),
	web('w-deneme-teslim', 'Web · Denemeler', 'Teslim onayı', '/student/sinav/coz/[examUserId]', WStudy.WebExamSubmitScreen, 'Mobil ile aynı: cevaplı, boş, işaretli; boş numaralar; Enter / Esc.'),
	web('w-deneme-sonuclar', 'Web · Denemeler', 'Sonuçlar', '/student/sinav-sonuclari', WStudy.WebResultsScreen, '', 'exam'),
	web('w-deneme-sonuclar-bos', 'Web · Denemeler', 'Sonuçlar · henüz deneme yok', '/student/sinav-sonuclari', WStudy.WebResultsEmptyScreen, ''),
	web('w-deneme-ekle', 'Web · Denemeler', 'Deneme ekle', '/student/sinav-sonuclari (yeni)', WStudy.WebExamAddScreen, 'Yeni API gerekir.'),
	web('w-deneme-sonuc', 'Web · Denemeler', 'Sonuç ve analiz', '/student/sinav-sonuclari/[snapshotId]', WExam.WebResultScreen, '', 'exam'),
	web('w-deneme-cozumler', 'Web · Denemeler', 'Soru çözümleri', '/student/soru-cozumleri/[examAttemptId]', WExam.WebSolutionsScreen, 'Soru haritası ve çözüm.', 'exam'),
	web('w-istatistik', 'Web · İstatistikler', 'İstatistiklerim', '/student/raporlarim', WStudy.WebStatsScreen, 'Satırlarda ders adı.', 'exam'),
	web('w-ders-vitrin', 'Web · Dersler', 'Dersler', '/student/ders-cal', WLessons.WebLessonsHomeScreen, 'Kaldığın yerden, bugünkü tekrar ve sınavın dersleri; henüz içeriği olmayan ders “Yakında”.', 'lessons'),
	web('w-ders-konular', 'Web · Dersler', 'Konular', '/student/ders-cal/[lessonMainId]', WLessons.WebLessonsTopicsScreen, 'Dersin konuları: mikro ders, süre, ilerleme, ilk denemede doğru; yanda ders ilerlemesi.', 'lessons'),
	web('w-ders-tekrar', 'Web · Dersler', 'Tekrar', '/student/ders-cal/tekrar', WLessons.WebLessonsReviewScreen, 'Günü gelen adımlar; 1, 3 ve 7 gün aralıkla.', 'lessons'),
	web('w-ders-konu-girisi', 'Web · Dersler', 'Konu girişi', '/student/ders-cal/konu/[lessonSubId]', WLessons.WebLessonTopicIntroScreen, 'Panelin içinde iki sütun: kanca, hedefler, video ve devam düğmesi; yanda mikro derslerin yol haritası.', 'lessons'),
	web('w-ders-tanim', 'Web · Dersler', 'Oynatıcı · Tanım', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonConceptScreen, 'Solda mikro dersler, ortada 700 px adım, sağda Bu mikro derste ve SinoAI.', 'lessons'),
	web('w-ders-tahmin', 'Web · Dersler', 'Oynatıcı · Önce sen tahmin et', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonPredictScreen, '', 'lessons'),
	web('w-ders-bosluk', 'Web · Dersler', 'Oynatıcı · Boşluk doldur', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonFillScreen, 'Tek deneme; yanlışta doğru sözcük ve nedeni.', 'lessons'),
	web('w-ders-dogru-yanlis', 'Web · Dersler', 'Oynatıcı · Doğru mu, yanlış mı?', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonTrueFalseScreen, '', 'lessons'),
	web('w-ders-sirala', 'Web · Dersler', 'Oynatıcı · Sırala', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonOrderScreen, '', 'lessons'),
	web('w-ders-grupla', 'Web · Dersler', 'Oynatıcı · Grupla', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonGroupScreen, 'Mobilin adım çizimi oynatıcının içinde (EmbedStep).'),
	web('w-ders-eslestir', 'Web · Dersler', 'Oynatıcı · Eşleştir', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonMatchScreen, ''),
	web('w-ders-formul', 'Web · Dersler', 'Oynatıcı · Formül ve tablo', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonFormulaScreen, ''),
	web('w-ders-bolum', 'Web · Dersler', 'Oynatıcı · Bölüm başı', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonSectionScreen, ''),
	web('w-ders-soru', 'Web · Dersler', 'Oynatıcı · TYT tarzı soru', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonQuestionScreen, 'Yanlış şıktan sonra çözüm adımı açılır, öğrenci yeniden seçer; 1–5 tuşları.', 'lessons'),
	web('w-ders-mikro-bitti', 'Web · Dersler', 'Mikro ders bitti', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonMicroDoneScreen, '', 'lessons'),
	web('w-ders-konu-sonu', 'Web · Dersler', 'Konu sonu', '/student/ders-cal/konu/[lessonSubId]/ozet', WLessons.WebLessonTopicDoneScreen, 'Özet, dikkat notları, kamp görevi ve Testler’e geçiş.', 'lessons'),
	web('w-ders-akis', 'Web · Dersler', 'Akış panosu', '—', WLessons.WebLessonFlowBoardScreen, 'Konu girişi → mikro dersler → konu sonu → Testler ve Kartlar; yanlışlar Tekrar’a.', 'lessons'),
	web('w-test-vitrin', 'Web · Testler', 'Testler', '/student/testler', WTests.WebTestsHomeScreen, '', 'tests'),
	web('w-test-konular', 'Web · Testler', 'Ders konuları', '/student/testler/[lessonMainId]', WTests.WebTestTopicsScreen, '', 'tests'),
	web('w-test-coz', 'Web · Testler', 'Test çözme · doğru', '/student/testler/quiz/[quizId]', WTests.WebTestSolveScreen, '', 'tests'),
	web('w-test-coz-yanlis', 'Web · Testler', 'Test çözme · yanlış', '/student/testler/quiz/[quizId]', WTests.WebTestSolveWrongScreen, 'Doğru şık ve nedeni; konunun mikro dersine ya da SinoAI’ye geçiş.', 'tests'),
	web('w-test-yanlislar', 'Web · Testler', 'Yanlışlarım', '/student/testler/quiz/[quizId]', WStudy.WebTestWrongReviewScreen, 'İlk yanlıştan açılır; soru ızgarası solda.'),
	web('w-plan-bugun', 'Web · Ders Planı', 'Bugün', '/student/ders-plani', WStudy.WebPlanTodayScreen, '', 'studyPlan'),
	web('w-plan-program', 'Web · Ders Planı', 'Program', '/student/ders-plani/program', WPlan.WebPlanScheduleScreen, '', 'studyPlan'),
	web('w-plan-oneriler', 'Web · Ders Planı', 'Öneriler', '/student/ders-plani/oneriler', WPlan.WebPlanSuggestionsScreen, '', 'studyPlan'),
	web('w-plan-istatistik', 'Web · Ders Planı', 'İstatistik', '/student/ders-plani/istatistik', WPlan.WebPlanStatsScreen, '', 'studyPlan'),
	web('w-plan-ilerleme', 'Web · Ders Planı', 'İlerleme', '/student/ders-plani/ilerleme', WPlan.WebPlanProgressScreen, '', 'studyPlan'),
	web('w-plan-ayarlar', 'Web · Ders Planı', 'Ayarlar', '/student/ders-plani/ayarlar', WPlan.WebPlanSettingsScreen, '', 'studyPlan'),
	web('w-plan-odak', 'Web · Ders Planı', 'Odak (çalış)', '/student/ders-plani/calis/[taskId]', WPlan.WebPlanFocusScreen, '', 'studyPlan'),
	web('w-ozet-vitrin', 'Web · Akıllı Özet', 'Akıllı Özet', '/student/lens', WAssist.WebSummaryHomeScreen, 'Geçmişte konu başlığı.', 'smartSummary'),
	web('w-ozet-yeni', 'Web · Akıllı Özet', 'Yeni analiz', '/student/lens/yeni', WAssist.WebSummaryNewScreen, '', 'smartSummary'),
	web('w-ozet-detay', 'Web · Akıllı Özet', 'Analiz detayı', '/student/lens/analiz/[id]', WAssist.WebSummaryDetailScreen, '', 'smartSummary'),
	web('w-ozet-video', 'Web · Akıllı Özet', 'Video analizi', '/student/lens/video/[id]', WAssist.WebSummaryVideoScreen, '', 'smartSummary'),
	web('w-kart-vitrin', 'Web · Bilgi Kartları', 'Bilgi Kartları', '/student/flashcard', WAssist.WebCardsHomeScreen, '', 'flashcards'),
	web('w-kart-gozat', 'Web · Bilgi Kartları', 'Gözat', '/student/flashcard/browse/...', WAssist.WebCardsBrowseScreen, '', 'flashcards'),
	web('w-kart-oturum', 'Web · Bilgi Kartları', 'Kart oturumu (odak)', '/student/flashcard/session', WAssist.WebCardSessionScreen, '', 'flashcards'),
	web('w-kart-kaydedilen', 'Web · Bilgi Kartları', 'Kaydedilenler', '/student/flashcard (Kaydedilenler)', WAssist.WebCardsSavedScreen, '', 'flashcards'),
	web('w-sino-sohbet', 'Web · SinoAI', 'SinoAI sohbet', '/student/sinoai/[conversationId]', WSino.WebSinoChatScreen, 'Solda geçmiş, ortada tek sohbet sütunu.', 'sinoAi'),
	web('w-sino-calisma', 'Web · SinoAI', 'SinoAI çalışma', '/student/sinoai/study', WSino.WebSinoStudyScreen, '', 'sinoAi'),
	web('w-sino-kutuphane', 'Web · SinoAI', 'SinoAI kütüphane', '/student/sinoai/library', WSino.WebSinoLibraryScreen, '', 'sinoAi'),
	site('s-anasayfa', 'Web sitesi · Ana sayfa', 'Ana sayfa', '/', SiteP.SiteHomeScreen, 3718, 'Sitenin header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri.'),
	site('s-urunler-menu', 'Web sitesi · Ana sayfa', 'Ürünler menüsü', 'header', SiteP.SiteMenuScreen, 900, 'Ürünler açılınca 7 modül, sitenin sade gri tonlarında.'),
	site('s-sinavlar', 'Web sitesi · Sınavlar', 'Sınavlar', '/sinavlar', SiteP.SiteExamsScreen, 1189, ''),
	site('s-sinav-yks', 'Web sitesi · Sınavlar', 'Sınav sayfası · YKS', '/yks-hazirlik (şablon)', SiteP.SiteExamLandingScreen, 2657, 'Tüm sınav ve hazırlık sayfaları bu şablonla.'),
	site('s-net-hesaplama', 'Web sitesi · Sınavlar', 'Net hesaplama', '/net-hesaplama', SiteP.SiteNetCalcScreen, 1024, ''),
	site('s-paketler', 'Web sitesi · Paketler', 'Paketler', '/corporate/packages', SiteP.SitePlansScreen, 1160, 'Yalnız ücretli paketler; deneme süresi mobil uygulamada.'),
	site('s-urun-denemeler', 'Web sitesi · Ürünler', 'Ürün · Denemeler', '/urunler/denemeler (şablon)', SiteP.SiteProductExamScreen, 2068, 'Altı ürün sayfası tek şablon.'),
	site('s-urun-ozet', 'Web sitesi · Ürünler', 'Ürün · Akıllı Özet', '/urunler/lens', SiteP.SiteProductSummaryScreen, 2047, ''),
	site('s-blog', 'Web sitesi · Blog', 'Blog', '/blog', SiteP.SiteBlogScreen, 1815, ''),
	site('s-blog-yazi', 'Web sitesi · Blog', 'Blog yazısı', '/blog/[slug]', SiteP.SiteBlogPostScreen, 1362, ''),
	site('s-hakkimizda', 'Web sitesi · Kurumsal', 'Hakkımızda', '/corporate/about', SiteP.SiteAboutScreen, 1210, ''),
	site('s-sss-iletisim', 'Web sitesi · Kurumsal', 'SSS ve iletişim', '/corporate/sss + /contact', SiteP.SiteFaqContactScreen, 1116, ''),
	site('s-yasal', 'Web sitesi · Kurumsal', 'Yasal sayfa', '/corporate/yasal/[slug]', SiteP.SiteLegalScreen, 993, ''),
	site('s-sinoai-misafir', 'Web sitesi · SinoAI misafir', 'SinoAI · misafir', '/sinoai', SiteP.SiteSinoGuestScreen, 900, ''),

	/* Tablet (iPad 11", Android tablet): pen in exams, tests and lessons. Layout modes: tabletWide ≥ 900 pt (landscape), tabletPortrait 600–899 pt. */
	tablet('t-deneme-coz-taslak', 'Tablet · Denemeler', 'Deneme çözme · taslak kâğıdı', 'ExamStudentSolve', TSolve.ExamScratchScreen, 'Yatay: soru solda, Taslak kâğıdı sağda (%38). Araç çubuğu kâğıdın kenarında, metni kapatmaz. Taslak soruya kayıtlı; soru haritasında kalem rozeti.', 'exam'),
	tablet('t-deneme-coz-isaretleme', 'Tablet · Denemeler', 'Deneme çözme · soruya yaz', 'ExamStudentSolve', TSolve.ExamMarkupScreen, 'Soru üzeri işaretleme: fosforlu kalem, altını çizme, şık eleme, kenar notu. Kalem çizer, parmak kaydırır; Kaydır/Çiz yalnız parmakla çizim açıkken görünür.', 'exam'),
	tablet('t-deneme-coz-dikey', 'Tablet · Denemeler', 'Deneme çözme · dikey', 'ExamStudentSolve', TSolve.ExamPortraitScreen, 'Dikey: şıklar üç sütun, Taslak kâğıdı alt yarıda. Parmakla çizim açık olduğu için Kaydır/Çiz anahtarı araç çubuğunda.', 'exam', true),
	tablet('t-deneme-cozum-notlar', 'Tablet · Denemeler', 'Çözüm · notlarım', 'ExamSolutionBookletReview', TSolve.ExamSolutionNotesScreen, 'Çözümlerde öğrencinin kendi işaretleri salt okunur geri gelir (göster/gizle); taslağı resmî çözümün yanında.', 'exam'),
	tablet('t-deneme-kalem-ipucu', 'Tablet · Denemeler', 'Kalem · ilk açılış ipucu', 'ExamStudentSolve', TSolve.PenTipScreen, 'Kalemli tablette ilk çözümde tek ipucu, Soruya yaz düğmesinde. Tur yok.', 'exam'),
	tablet('t-test-coz-taslak', 'Tablet · Testler', 'Test çözme · taslak kâğıdı', 'QuizSolve', TSolve.TestScratchScreen, 'Yeni: Testler’e taslak kâğıdı. Anında geri bildirim soru sütununda, işlem yanda kalır.', 'tests'),
	tablet('t-test-coz-yanlis', 'Tablet · Testler', 'Yanlış cevap · taslağı göster', 'QuizSolve', TSolve.TestWrongScratchScreen, 'Yanlışta taslak yerinde kalır; “Taslağımı SinoAI’ye göster” yalnız öğrenci isterse gönderir ve okunanı önce gösterir.', 'tests'),
	tablet('t-test-sekilli-soru', 'Tablet · Testler', 'Şekilli soru · şekle yaz', 'QuizSolve', TSolve.TestFigureScreen, 'Kalem şeklin üstüne yazar: açı, bulunan değer. Şıklar sağ sütunda, elenenler çizili.', 'tests'),
	tablet('t-ders-vitrin', 'Tablet · Dersler', 'Dersler · yatay', 'WorkHome', TLearn.LessonsHomeTabletScreen, 'Yatayda sekme çubuğu yerine yan ray. Kaldığın yer ve tekrar yan yana, dersler üç sütun; Notlarım üstte.', 'lessons'),
	tablet('t-ders-tanim-not', 'Tablet · Dersler', 'Adım · Tanım · kenar notu', 'WorkMikro', TLearn.LessonConceptTabletScreen, 'Yeni: Dersler’e kalem. Okuma sütunu ve sağda kenar boşluğu; fosforlu kalem ve not adıma kayıtlı.', 'lessons'),
	tablet('t-ders-soru-eleme', 'Tablet · Dersler', 'Adım · TYT tarzı soru · eleme', 'WorkMikro', TLearn.LessonQuestionTabletScreen, 'Şıklar kalemle elenir, seçilen daire içinde; cevap yine dokunarak verilir.', 'lessons'),
	tablet('t-ders-bosluk-el-yazisi', 'Tablet · Dersler', 'Adım · Boşluk doldur · el yazısı', 'WorkMikro', TLearn.LessonFillTabletScreen, 'Kalemle kutuya yazılır, okunan sözcük gösterilir, sonra kontrol edilir. Klavye her zaman seçenek.', 'lessons'),
	tablet('t-ders-notlarim', 'Tablet · Dersler', 'Notlarım', 'WorkNotes (yeni)', TLearn.LessonNotesTabletScreen, 'Yeni ekran: konunun tüm kenar notları ve taslakları mikro derse göre; dokununca adımına götürür. PDF olarak alınabilir.', 'lessons'),
	tablet('t-kart-el-yazisi', 'Tablet · Bilgi Kartları', 'Kart · önce kendin yaz', 'FlashcardSession', TLearn.CardWriteTabletScreen, 'Ön yüzde isteğe bağlı yazma alanı; kontrol edilmez, cevapla öğrenci kendisi karşılaştırır.', 'flashcards'),
	tablet('t-hub-moduller', 'Tablet · Modüller', 'Ana ekran · yatay', 'ModuleHubHome', TLearn.HubTabletScreen, 'Telefonun Bugün düzeni iki sütunda: solda selam, günün planı ve iki eylem kartı; sağda hafta ve iki ölçü, tekrar, modüller.'),
	tablet('t-hub-plansiz', 'Tablet · Modüller', 'Ana ekran · planı olmayan öğrenci', 'ModuleHubHome', TLearn.HubTabletNoPlanScreen, 'Kayıt cevaplarıyla Planımı hazırla; ilk mikro ders plansız başlar.'),
	tablet('t-hub-gun-bitti', 'Tablet · Modüller', 'Ana ekran · günün planı bitti', 'ModuleHubHome', TLearn.HubTabletDoneScreen, ''),
	tablet('t-hub-abonelik-bitti', 'Tablet · Modüller', 'Ana ekran · deneme süresi bitti', 'ModuleHubHome', TLearn.HubTabletExpiredScreen, 'Ödeme yoksa erişim yok; ilerleme korunur.'),
	tablet('t-kalem-ayarlar', 'Tablet · Kalem', 'Profil · Kalem ve çizim', 'ProfileSettings (yeni bölüm)', TLearn.PenSettingsScreen, 'Parmakla çizim, kalemde çift dokunuş, varsayılan renk ve kalınlık, taslak yeri, çözümlerde notlar, notların saklandığı yer.'),
	/* Tablet without the pen (5 Nov 2026): keyboard, two panes, side panel, week, dashboard, Split View. */
	tablet('t-deneme-klavye', 'Tablet · Kalemsiz', 'Deneme · klavye ve soru haritası', 'ExamStudentSolve', TWide.ExamKeyboardScreen, 'Bağlı klavyede A–E cevaplar, oklar gezdirir, İ işaretler; soru haritası yatayda hep açık.', 'exam'),
	tablet('t-ders-sinoai-panel', 'Tablet · Kalemsiz', 'Ders adımı · SinoAI yan panelde', 'WorkMikro', TWide.LessonSinoPanelScreen, 'SinoAI adımı kapatmadan yanda açılır ve adımı bilir; uyarı satırı panelin altında.', 'lessons'),
	tablet('t-ders-konular-iki-panel', 'Tablet · Kalemsiz', 'Dersler · konular iki panel', 'WorkCatalog + WorkSub', TWide.LessonTopicsSplitScreen, 'Konu listesi solda kalır, seçilen konunun girişi ve mikro dersleri sağda; konu değiştirmek tek dokunuş.', 'lessons'),
	tablet('t-test-cozumler-iki-panel', 'Tablet · Kalemsiz', 'Testler · çözümler iki panel', 'QuizSolutions', TWide.TestSolutionsSplitScreen, 'Soru listesi doğru/yanlış/boş işaretli solda, çözüm sağda.', 'tests'),
	tablet('t-plan-hafta', 'Tablet · Kalemsiz', 'Ders Planı · hafta', 'StudyPlanSchedule', TWide.PlanWeekScreen, 'Haftanın yedi günü yan yana, görevler sürüklenerek taşınır; bugünün görevleri sağda.', 'studyPlan'),
	tablet('t-istatistik-pano', 'Tablet · Kalemsiz', 'İstatistikler · pano', 'ProfileStatistics', TWide.StatisticsDashboardScreen, 'Web ve telefonla aynı parçalar: dört ölçü, haftalık yığılı çalışma ve değer kutusu, halka, en verimli saatler ısı haritası.'),
	tablet('t-bolunmus-ekran', 'Tablet · Kalemsiz', 'Bölünmüş ekran', 'Uygulama geneli', TWide.SplitViewScreen, 'Split View / Stage Manager: pencere 600 pt altına inince telefon düzeni; süre ve oturum kesilmez.'),
];

export const findScreen = (id: string): UIScreen => {
	const screen = UI_SCREENS.find((entry) => entry.id === id);
	if (!screen) throw new Error(`Bilinmeyen UI/UX ekranı: ${id}`);
	return screen;
};
