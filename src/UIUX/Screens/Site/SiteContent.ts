import type React from 'react';
import type {ModuleKey} from '../../ModuleIdentity';
import * as Assist from '../Mobile/Assist';
import * as Exam from '../Mobile/Exam';
import * as Gaps from '../Mobile/Gaps';
import * as Insights from '../Mobile/Insights';
import * as Tests from '../Mobile/Learn';
import * as Lessons from '../Mobile/Lessons';
import * as Steps from '../Mobile/LessonSteps';
import * as Plan from '../Mobile/Plan';
import * as Sino from '../Mobile/SinoAI';
import * as States from '../Mobile/States';
import * as WAssist from '../Web/AssistWeb';
import * as WExam from '../Web/ExamWeb';
import * as WGaps from '../Web/GapsWeb';
import * as WLessons from '../Web/LessonsWeb';
import * as WPlan from '../Web/PlanWeb';
import * as WSino from '../Web/SinoWeb';
import * as WStudy from '../Web/StudyWeb';
import * as WTests from '../Web/TestsWeb';

/**
 * The words and pictures of the product detail pages (site, before sign-in),
 * one entry per module in MODULE_ORDER. The drawing (SitePages.tsx) and the
 * coding spec (docs/UIUX/Kodlama/14-Web-Sitesi.md) both read from here, so a
 * text changes in one place. Every picture names the drawing it shows by id:
 * the web site takes the same PNG from Desktop\Sinavika-UIUX3.
 *
 * Copy rules: sen dili, "test" (never "quiz") in Turkish, no "koç", no
 * made-up numbers (only what the product has: 3 levels × 20 questions,
 * 1 / 3 / 7 day review, 3 days free in the mobile app).
 */

export type Bi = readonly [tr: string, en: string];

/** A real drawing: its id (the PNG name) and the component that draws it. */
export type Shot = {id: string; C: React.FC; kind: 'phone' | 'browser'};
const phone = (id: string, C: React.FC): Shot => ({id, C, kind: 'phone'});
const browser = (id: string, C: React.FC): Shot => ({id, C, kind: 'browser'});

export type ProductStep = {title: Bi; text: Bi; shot: Shot};
/** A feature row; `zoom` shows the upper part of the phone screen larger (close-up) from this offset (pt). */
export type ProductFeature = {title: Bi; text: Bi; points: Bi[]; shot: Shot; zoom?: number};
export type ProductLink = {module: ModuleKey; text: Bi};
export type ProductFaq = {q: Bi; a: Bi};

export type ProductContent = {
	module: ModuleKey;
	/** Live route under /[locale]; Testler has no page yet (new route). */
	route: string;
	title: Bi;
	lead: Bi;
	hero: {phone: Shot; browser: Shot};
	steps: ProductStep[];
	features: ProductFeature[];
	example: {title: Bi; text: Bi; shot: Shot; zoom?: number};
	links: ProductLink[];
	faq: ProductFaq[];
};

const studyPlan: ProductContent = {
	module: 'studyPlan',
	route: '/urunler/ders-plani',
	title: ['Her gün ne çalışacağını bil', 'Know what to study every day'],
	lead: ['Ders Planı sınav tarihine, boş günlerine ve zorlandığın derslere göre her güne görev koyar. Her görev neden orada olduğunu, ne olduğunu ve ne kadar süreceğini söyler.', 'Study Plan puts tasks on every day from your exam date, free days and weak subjects. Each task says why it is there, what it is and how long it takes.'],
	hero: {phone: phone('m-plan-bugun', Plan.PlanTodayScreen), browser: browser('w-plan-bugun', WStudy.WebPlanTodayScreen)},
	steps: [
		{title: ['Hedefini söyle', 'Tell us your goal'], text: ['Sınavını, haftada kaç gün ve günde kaç dakika çalışacağını seç.', 'Pick your exam, how many days a week and minutes a day.'], shot: phone('m-plan-yok', States.PlanNoneScreen)},
		{title: ['Planın hazır', 'Your plan is ready'], text: ['Bugünün görevleri sırayla gelir: konu, test, deneme ya da kart.', 'Today’s tasks come in order: a topic, a quiz, an exam or cards.'], shot: phone('m-plan-bugun', Plan.PlanTodayScreen)},
		{title: ['Odaklan ve bitir', 'Focus and finish'], text: ['Görevi tek dokunuşla başlat, odak sayacıyla çalış.', 'Start a task with one tap and work with the focus timer.'], shot: phone('m-plan-odak', Plan.PlanFocusScreen)},
		{title: ['İlerlemeni gör', 'See your progress'], text: ['Kaç saat çalıştığını ve hangi konuları bitirdiğini takip et.', 'Track the hours you studied and the topics you finished.'], shot: phone('m-plan-ilerleme', Plan.PlanProgressScreen)},
	],
	features: [
		{title: ['Haftanı tek bakışta gör', 'Your week at a glance'], text: ['Program sayfası haftanın her gününü görevleri ve süreleriyle gösterir.', 'The schedule shows every day of the week with its tasks and minutes.'], points: [['Gün gün görev ve dakika', 'Tasks and minutes per day'], ['Sınava kalan gün', 'Days left to the exam'], ['Web’de geniş görünüm', 'A wide view on the web']], shot: browser('w-plan-program', WPlan.WebPlanScheduleScreen)},
		{title: ['Kaçan görev kaybolmaz', 'Missed tasks don’t get lost'], text: ['Dünden kalan görevleri bugüne al ya da başka bir güne yerleştir.', 'Move yesterday’s tasks to today or to another day.'], points: [['Tek dokunuşla bugüne al', 'Move to today in one tap'], ['Başka güne taşı', 'Move to another day'], ['Plan bozulmaz', 'The plan stays intact']], shot: phone('m-plan-dunden', States.PlanMissedScreen)},
		{title: ['Kendi görevini ekle', 'Add your own task'], text: ['Okulda çözdüğün test ya da kendi kitabın: kendi görevini plana ekle.', 'A school test or your own book: add your own task to the plan.'], points: [['Süre ve gün seç', 'Pick a time and day'], ['Planla aynı listede', 'In the same list as the plan']], shot: phone('m-plan-gorev-ekle', Plan.PlanAddTaskScreen)},
		{title: ['Konu konu ilerleme', 'Progress topic by topic'], text: ['Her dersin konularında nerede olduğunu gör: bitti, sürüyor, başlamadı.', 'See where you are in every subject: done, in progress, not started.'], points: [['Ders ders çubuklar', 'A bar for every subject'], ['Sıradaki konu', 'The next topic']], shot: phone('m-plan-konu', Plan.PlanLessonProgressScreen), zoom: 60},
		{title: ['Çalışma istatistiğin', 'Your study statistics'], text: ['Gün ve hafta bazında çalışma süren, bitirdiğin görevler ve serin.', 'Your study time by day and week, finished tasks and your streak.'], points: [['Haftalık grafik', 'Weekly chart'], ['Modül modül süre', 'Time per module']], shot: browser('w-plan-istatistik', WPlan.WebPlanStatsScreen)},
	],
	example: {title: ['Denemenin eksikleri planına geçer', 'Your exam gaps go into your plan'], text: ['Denemede Matematik’ten net kaybettin. Analizde “Bu hafta planıma ekle”ye basınca en çok kaybettiğin 3 konu sonraki günlerine 30 dakikalık tekrar olarak eklenir.', 'You lost points in Maths. Tap “Add to this week’s plan” in the analysis and the 3 topics you lost most on become 30-minute reviews on your next days.'], shot: phone('m-deneme-analiz-eklendi', Exam.ExamAnalysisAddedScreen)},
	links: [
		{module: 'exam', text: ['Deneme analizindeki eksik konular planına eklenir.', 'Gaps from your exam analysis go into your plan.']},
		{module: 'lessons', text: ['Konu görevi Dersler’de kaldığın adımdan açılır.', 'A topic task opens in Lessons where you left off.']},
		{module: 'tests', text: ['Test görevi doğrudan o konunun testini başlatır.', 'A quiz task starts that topic’s quiz directly.']},
	],
	faq: [
		{q: ['Planı nasıl hazırlıyorsunuz?', 'How is the plan made?'], a: ['Sınav tarihine, seçtiğin çalışma günlerine ve dakikalarına, zorlandığın derslere göre. Deneme çözdükçe eksik konuların da plana girer.', 'From your exam date, the days and minutes you chose and your weak subjects. As you take exams, your gaps join the plan.']},
		{q: ['Bir günü kaçırırsam ne olur?', 'What if I miss a day?'], a: ['Kalan görevler “Dünden kalan” olarak görünür; bugüne alabilir ya da başka güne taşıyabilirsin.', 'Missed tasks show as “From yesterday”; move them to today or another day.']},
		{q: ['Planı değiştirebilir miyim?', 'Can I change the plan?'], a: ['Evet. Plan ayarlarından günlerini ve süreni değiştir; kendi görevini de ekleyebilirsin.', 'Yes. Change your days and time in plan settings; you can add your own tasks too.']},
		{q: ['Web ve mobilde aynı plan mı?', 'Same plan on web and mobile?'], a: ['Evet, aynı hesapla iki yerde aynı plan ve ilerleme görünür.', 'Yes, the same account shows the same plan and progress on both.']},
		{q: ['KPSS için de çalışır mı?', 'Does it work for KPSS?'], a: ['Evet. YKS (TYT, AYT) ve KPSS Lisans, Önlisans, Ortaöğretim için plan hazırlanır.', 'Yes. Plans are made for YKS (TYT, AYT) and KPSS Bachelor’s, Associate and Secondary.']},
	],
};

const lessons: ProductContent = {
	module: 'lessons',
	route: '/urunler/ders-cal',
	title: ['Konuyu adım adım öğren', 'Learn a topic step by step'],
	lead: ['Dersler her konuyu kısa adımlarla anlatır: tanım, örnek, kural, görsel ve sen cevapladıkça ilerleyen sorular. İstediğin yerde bırak, kaldığın adımdan devam et.', 'Lessons teach every topic in short steps: definition, example, rule, picture and questions that move on as you answer. Stop anywhere and pick up where you left off.'],
	hero: {phone: phone('m-ders-tanim', Lessons.LessonConceptScreen), browser: browser('w-ders-vitrin', WLessons.WebLessonsHomeScreen)},
	steps: [
		{title: ['Dersini seç', 'Pick a subject'], text: ['Türkçe, Matematik, Fizik… Her derste konular sınav sırasıyla.', 'Turkish, Maths, Physics… Topics follow the exam order.'], shot: phone('m-ders-vitrin', Lessons.LessonsHomeScreen)},
		{title: ['Adım adım öğren', 'Learn step by step'], text: ['Her adım tek bir şey anlatır; örnekle pekişir.', 'Each step teaches one thing and an example locks it in.'], shot: phone('m-ders-ornek', Lessons.LessonExampleScreen)},
		{title: ['Cevaplayarak ilerle', 'Move on by answering'], text: ['Önce sen tahmin et, sonra doğrusunu ve nedenini gör.', 'Guess first, then see the answer and why.'], shot: phone('m-ders-tahmin', Lessons.LessonPredictScreen)},
		{title: ['Yanlışın tekrar gelir', 'Mistakes come back'], text: ['İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra Tekrar’da.', 'Steps you got wrong come back in Review after 1, 3 and 7 days.'], shot: phone('m-ders-tekrar', Lessons.LessonsReviewScreen)},
	],
	features: [
		{title: ['Okuyarak değil, yaparak', 'Learn by doing'], text: ['Sırala, eşleştir, grupla, boşluk doldur: her konu etkileşimli adımlarla ilerler.', 'Order, match, group, fill the gap: every topic moves on with interactive steps.'], points: [['Eşleştir ve grupla', 'Match and group'], ['Boşluk doldur', 'Fill the gap'], ['Doğru mu yanlış mı', 'True or false']], shot: phone('m-ders-eslestir', Steps.LessonMatchScreen)},
		{title: ['Görselle anlat', 'Taught with pictures'], text: ['Grafik, şekil ve tablolar adımın içinde; formüller ne anlama geldiğiyle birlikte.', 'Charts, figures and tables sit inside the step; formulas come with their meaning.'], points: [['Şekil ve grafik', 'Figures and charts'], ['Formül ve tablo', 'Formulas and tables']], shot: phone('m-ders-gorsel', Lessons.LessonVisualScreen)},
		{title: ['Sınav tarzı soru', 'Exam-style questions'], text: ['Konunun sonunda sınavdaki gibi bir soruyla kendini dene.', 'End the topic with a question like the one in the exam.'], points: [['Çözümüyle birlikte', 'With the solution'], ['Takılırsan SinoAI’ye sor', 'Stuck? Ask SinoAI']], shot: phone('m-ders-soru', Lessons.LessonQuestionScreen), zoom: 40},
		{title: ['Kaldığın yerden devam', 'Pick up where you left off'], text: ['Konular listesi hangi konuda kaçıncı adımda olduğunu gösterir.', 'The topic list shows which step you are on in every topic.'], points: [['Konu konu ilerleme', 'Progress per topic'], ['Tek dokunuşla devam', 'Continue in one tap']], shot: phone('m-ders-konular', Lessons.LessonsTopicsScreen)},
		{title: ['Web’de geniş oynatıcı', 'A wide player on the web'], text: ['Aynı konu web’de geniş ekranda; ilerlemen iki yerde aynı.', 'The same topic on a wide screen; your progress matches on both.'], points: [['Klavyeyle ilerle', 'Move on with the keyboard'], ['Aynı hesap, aynı adım', 'Same account, same step']], shot: browser('w-ders-bosluk', WLessons.WebLessonFillScreen)},
	],
	example: {title: ['Yanlışın unutulmaz', 'Your mistakes aren’t forgotten'], text: ['Sözcükte Anlam’da mecaz anlam adımını ilk denemede yanlış yaptın. O adım 1, 3 ve 7 gün sonra Tekrar’da yeniden karşına gelir; doğru yaptıkça aralık açılır.', 'You got the figurative-meaning step wrong the first time. It comes back in Review after 1, 3 and 7 days; the gap grows as you get it right.'], shot: phone('m-ders-tekrar-oturum', Gaps.LessonReviewSessionScreen)},
	links: [
		{module: 'tests', text: ['Konu bitince Kolay seviye testiyle pekiştir.', 'Finish a topic and lock it in with the Easy quiz.']},
		{module: 'exam', text: ['Denemede kaybettiğin konunun anlatımı tek dokunuşla açılır.', 'The topic you lost points on opens in one tap.']},
		{module: 'sinoAi', text: ['Takıldığın adımı SinoAI’ye sor.', 'Ask SinoAI about the step you’re stuck on.']},
	],
	faq: [
		{q: ['Bir konu ne kadar sürer?', 'How long is a topic?'], a: ['Konuya göre değişir; adımlar kısadır ve istediğin yerde bırakabilirsin. Kaldığın adım saklanır.', 'It depends on the topic; steps are short and you can stop anywhere. Your step is saved.']},
		{q: ['Konular hangi sınava göre?', 'Which exam are topics for?'], a: ['Hedef sınavına göre: YKS (TYT, AYT) ya da KPSS. Konular MEB kazanımları ve sınav kapsamıyla sıralanır.', 'Your target exam: YKS (TYT, AYT) or KPSS. Topics follow the curriculum and the exam scope.']},
		{q: ['Tekrar nasıl çalışır?', 'How does Review work?'], a: ['İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra Tekrar’da yeniden gelir.', 'Steps you got wrong come back after 1, 3 and 7 days.']},
		{q: ['Video ders mi?', 'Are these video lessons?'], a: ['Hayır. Dersler okuyup cevaplayarak ilerleyen adımlardır; video izlemek yerine konuyu yaparak öğrenirsin.', 'No. Lessons are steps you read and answer; you learn by doing instead of watching.']},
		{q: ['İnternetsiz çalışır mı?', 'Does it work offline?'], a: ['Bağlantı koparsa cevapların kaydedilir ve bağlanınca gönderilir.', 'If the connection drops, your answers are saved and sent when you reconnect.']},
	],
};

const tests: ProductContent = {
	module: 'tests',
	route: '/urunler/testler',
	title: ['Konu testleriyle eksiğini kapat', 'Close gaps with topic quizzes'],
	lead: ['Testler konu konu, seviye seviye çoktan seçmeli sorulardır. Her soruda doğru ya da yanlışı anında görürsün; yanlışta doğru şık, nedeni ve konunun anlatımı açılır.', 'Quizzes are multiple-choice questions by topic and level. You see right or wrong on every question at once; a wrong answer opens the right option, the reason and the topic.'],
	hero: {phone: phone('m-test-coz', Tests.TestSolveScreen), browser: browser('w-test-vitrin', WTests.WebTestsHomeScreen)},
	steps: [
		{title: ['Konunu seç', 'Pick a topic'], text: ['Önce ders, sonra konu: listede hangi konuda nerede olduğun görünür.', 'Subject first, then topic: the list shows where you are.'], shot: phone('m-test-konular', Tests.TestsTopicsScreen)},
		{title: ['Seviyeni seç', 'Pick a level'], text: ['Her konuda Kolay, Orta ve Zor; her seviye 20 soru.', 'Easy, Medium and Hard in every topic; 20 questions each.'], shot: phone('m-test-detay', Tests.TestOverviewScreen)},
		{title: ['Çöz, anında gör', 'Answer, see it at once'], text: ['Şıkka dokunmak cevaptır; doğru ya da yanlış hemen görünür.', 'Tapping an option is your answer; right or wrong shows at once.'], shot: phone('m-test-coz-yanlis', Tests.TestSolveWrongScreen)},
		{title: ['Yanlışlarını tekrar et', 'Review your mistakes'], text: ['Yanlışlarım bütün yanlış sorularını tek yerde toplar.', 'My mistakes gathers every wrong answer in one place.'], shot: phone('m-test-yanlislar', Insights.TestWrongReviewScreen)},
	],
	features: [
		{title: ['Yanlıştan öğren', 'Learn from mistakes'], text: ['Yanlış cevapta doğru şık ve nedeni açılır; konunun anlatımına ya da SinoAI’ye tek dokunuşla geç.', 'A wrong answer opens the right option and why; jump to the topic or SinoAI in one tap.'], points: [['Doğru şık ve neden', 'The right option and why'], ['Konu anlatımı', 'The topic'], ['SinoAI’ye sor', 'Ask SinoAI']], shot: phone('m-test-coz-yanlis', Tests.TestSolveWrongScreen), zoom: 120},
		{title: ['Senin için hazır', 'Ready for you'], text: ['Denemede en çok net kaybettiğin konunun sıradaki seviyesi vitrinde seni bekler.', 'The next level of the topic you lost most on waits on the home page.'], points: [['Denemeye göre öneri', 'Suggested from your exam'], ['Kaldığın test', 'The quiz you left']], shot: phone('m-test-vitrin', Tests.TestsHomeScreen)},
		{title: ['Üç seviye, 20’şer soru', 'Three levels, 20 each'], text: ['Kolaydan zora ilerle; her seviyenin sonucunu ayrı gör.', 'Move from easy to hard and see each level’s result.'], points: [['Kolay · Orta · Zor', 'Easy · Medium · Hard'], ['Seviye seviye sonuç', 'Results by level']], shot: phone('m-test-detay', Tests.TestOverviewScreen), zoom: 60},
		{title: ['Çözümler ve işaretli sorular', 'Solutions and flagged questions'], text: ['Bitirdiğin testlerin çözümleri; işaretlediğin soruları ayrı süz.', 'Solutions of your finished quizzes; filter the questions you flagged.'], points: [['Test test çözümler', 'Solutions per quiz'], ['İşaretli süzgeci', 'Flagged filter']], shot: phone('m-test-cozumler', Tests.TestsSolutionsScreen)},
		{title: ['Web’de de aynı', 'The same on the web'], text: ['Yanlışlarını web’de geniş ekranda gözden geçir.', 'Go through your mistakes on a wide screen.'], points: [['Soru numaraları tek bakışta', 'All question numbers at once'], ['Aynı hesap', 'Same account']], shot: browser('w-test-yanlislar', WStudy.WebTestWrongReviewScreen)},
	],
	example: {title: ['Denemeden teste tek adım', 'From exam to quiz in one step'], text: ['Denemede Üslü Sayılar’dan net kaybettin. Testler vitrinindeki “Senin için hazır” kartı o konunun sıradaki seviyesini açar; 20 soruda eksiğini kapatırsın.', 'You lost points on Exponents. The “Ready for you” card opens that topic’s next level; close the gap in 20 questions.'], shot: phone('m-test-bitti', Tests.TestDoneScreen)},
	links: [
		{module: 'lessons', text: ['Yanlışta konunun anlatımı Dersler’de açılır.', 'A wrong answer opens the topic in Lessons.']},
		{module: 'exam', text: ['Denemede kaybettiğin konu testlere öneri olarak gelir.', 'Topics you lost on in exams become suggestions.']},
		{module: 'sinoAi', text: ['Anlamadığın soruyu SinoAI’ye sor.', 'Ask SinoAI about a question you don’t get.']},
	],
	faq: [
		{q: ['Test ile deneme arasındaki fark ne?', 'Quiz or exam: what’s the difference?'], a: ['Test öğrenmek içindir: doğruyu her soruda hemen görürsün. Deneme sınav provasıdır: sonuç teslimden sonra açılır.', 'A quiz is for learning: you see the answer after every question. An exam is a rehearsal: results open after you submit.']},
		{q: ['Kaç seviye var?', 'How many levels?'], a: ['Her konuda üç seviye: Kolay, Orta, Zor. Her seviye 20 sorudur.', 'Three per topic: Easy, Medium, Hard. Each has 20 questions.']},
		{q: ['Yanlışlarımı nerede görürüm?', 'Where are my mistakes?'], a: ['Yanlışlarım bütün testlerdeki yanlış sorularını tek yerde toplar.', 'My mistakes collects every wrong answer from all quizzes.']},
		{q: ['Bağlantı koparsa cevabım gider mi?', 'Do I lose answers offline?'], a: ['Hayır. Cevap kaydedilir; bağlanınca gönderilir ve doğrusu o zaman görünür.', 'No. Your answer is saved and sent when you reconnect; the right answer shows then.']},
		{q: ['Sorular hangi sınava göre?', 'Which exam are questions for?'], a: ['Hedef sınavına göre: YKS (TYT, AYT) ya da KPSS.', 'Your target exam: YKS (TYT, AYT) or KPSS.']},
	],
};

const exam: ProductContent = {
	module: 'exam',
	route: '/urunler/denemeler',
	title: ['Denemeni çöz, netini gör', 'Take an exam, see your score'],
	lead: ['Denemeler gerçek sınavın provasıdır. Türkiye geneli ve branş denemelerine gir, süreli çöz, teslim et. Sonra netini, sıralamanı, çözümleri ve hangi konudan kaç net kaybettiğini gör.', 'Exams are a rehearsal for the real thing. Join nationwide and subject exams, solve on the clock and submit. Then see your score, rank, solutions and where you lost points.'],
	hero: {phone: phone('m-deneme-vitrin', Exam.ExamHomeScreen), browser: browser('w-deneme-sonuc', WExam.WebResultScreen)},
	steps: [
		{title: ['Denemeni seç', 'Pick an exam'], text: ['Canlı denemeye hatırlatma kur ya da açık denemeye hemen gir.', 'Set a reminder for a live exam or start an open one now.'], shot: phone('m-deneme-detay', Exam.ExamDetailScreen)},
		{title: ['Süreli çöz', 'Solve on the clock'], text: ['Sınavdaki gibi: doğru ya da yanlış çözerken görünmez.', 'Like the real exam: right or wrong stays hidden while you solve.'], shot: phone('m-deneme-coz', Exam.ExamSolveScreen)},
		{title: ['Sonucunu gör', 'See your result'], text: ['Netin, ders ders sonucun ve sıralaman.', 'Your score, results per subject and your rank.'], shot: phone('m-deneme-sonuc', Exam.ExamResultScreen)},
		{title: ['Eksiğini kapat', 'Close the gaps'], text: ['Net kaybettiğin konular, her biri bir eylemle: konu, test ya da plan.', 'Topics you lost points on, each with an action: lesson, quiz or plan.'], shot: phone('m-deneme-analiz', Exam.ExamAnalysisScreen)},
	],
	features: [
		{title: ['Konu konu net analizi', 'Points lost by topic'], text: ['Hangi konudan kaç net kaybettiğini sırayla gör; her konunun yanında anlatım ve test.', 'See in order where you lost points; each topic comes with a lesson and a quiz.'], points: [['Kaybın en çok olduğu konu üstte', 'Biggest loss on top'], ['Konu anlatımı ve test', 'Lesson and quiz'], ['Bu hafta planıma ekle', 'Add to this week’s plan']], shot: phone('m-deneme-analiz', Exam.ExamAnalysisScreen), zoom: 70},
		{title: ['Net gelişimin tek grafikte', 'Your progress in one chart'], text: ['Son denemelerin yan yana; dışarıda çözdüğün denemeleri de ekle.', 'Your last exams side by side; add exams you took elsewhere.'], points: [['TYT ve AYT ayrı', 'TYT and AYT apart'], ['Dışarıda çözdüğün deneme', 'Exams from elsewhere']], shot: phone('m-deneme-sonuclar-disarida', Exam.ExamResultsExternalScreen)},
		{title: ['Soru soru çözümler', 'Solutions question by question'], text: ['Teslimden sonra her sorunun doğrusu ve çözümü; yalnız yanlışlarını süz.', 'After you submit, every answer and solution; filter only your mistakes.'], points: [['Yanlışlar · Boşlar süzgeci', 'Wrong · Blank filter'], ['SinoAI’ye sor', 'Ask SinoAI']], shot: phone('m-deneme-cozum', Exam.ExamBookletScreen)},
		{title: ['Ders gelişimi', 'Progress by subject'], text: ['Her dersin netini deneme deneme izle.', 'Follow each subject’s score exam by exam.'], points: [['Ders ders çizgi', 'A line per subject'], ['Artış ve düşüş', 'Rises and falls']], shot: phone('m-deneme-gelisim', Exam.ExamTrendScreen)},
		{title: ['Web’de sonuç ve analiz', 'Results on the web'], text: ['Sonuçlar sayfası denemelerini ve netlerini geniş ekranda gösterir.', 'The results page shows your exams and scores on a wide screen.'], points: [['Ders ders net sütunları', 'Score columns per subject'], ['ÖSYM düzeninde tablo', 'ÖSYM-style table']], shot: browser('w-deneme-sonuclar', WStudy.WebResultsScreen)},
	],
	example: {title: ['Deneme bitince ne çalışacağını bilirsin', 'After the exam you know what to study'], text: ['Deneme bitince hangi konudan kaç net kaybettiğini görürsün. En çok kaybettiğin konunun anlatımını açar, 20 soruluk testini çözer ya da “Bu hafta planıma ekle” ile planına koyarsın.', 'After the exam you see where you lost points. Open the lesson for your biggest loss, take its 20-question quiz or add it to this week’s plan.'], shot: phone('m-deneme-analiz-eklendi', Exam.ExamAnalysisAddedScreen)},
	links: [
		{module: 'lessons', text: ['Kaybettiğin konunun anlatımı Dersler’de.', 'The topic you lost on opens in Lessons.']},
		{module: 'tests', text: ['Aynı konunun testi Testler’de.', 'That topic’s quiz opens in Quizzes.']},
		{module: 'studyPlan', text: ['Eksik konular bu haftanın planına eklenir.', 'Gaps go into this week’s plan.']},
	],
	faq: [
		{q: ['Denemeler ÖSYM formatında mı?', 'Do exams follow the ÖSYM format?'], a: ['Evet. Soru sayısı, süre ve net hesabı sınavın kendi kurallarıyla.', 'Yes. Question count, time and scoring follow the exam’s own rules.']},
		{q: ['Türkiye geneli deneme nedir?', 'What is a nationwide exam?'], a: ['Belli bir zaman aralığında herkesin girdiği denemedir; sonuçta sıralaman da görünür.', 'An exam everyone takes in the same window; your rank shows in the result.']},
		{q: ['Çözerken doğruyu görebilir miyim?', 'Can I see answers while solving?'], a: ['Hayır, sınavdaki gibi. Doğru ve yanlış teslimden sonra çözümlerde açılır.', 'No, like the real exam. Answers open in the solutions after you submit.']},
		{q: ['Yarıda bırakırsam?', 'What if I stop halfway?'], a: ['Ara verebilirsin; deneme kaldığın sorudan devam eder.', 'You can pause; the exam continues from where you stopped.']},
		{q: ['Dışarıda çözdüğüm denemeyi ekleyebilir miyim?', 'Can I add exams from elsewhere?'], a: ['Evet. Netlerini gir; gelişim grafiğinde çizgili sütun olarak görünür.', 'Yes. Enter your scores; they show as hatched bars in the chart.']},
		{q: ['Kaç denemeye girebilirim?', 'How many exams can I take?'], a: ['Paketine göre: aylık pakette 20, yıllık pakette 240 deneme hakkı.', 'Depends on your plan: 20 on monthly, 240 on yearly.']},
	],
};

const flashcards: ProductContent = {
	module: 'flashcards',
	route: '/urunler/flashcard',
	title: ['Öğrendiğini aklında tut', 'Keep what you learn'],
	lead: ['Bilgi Kartları unutmak üzere olduğun kartı tam zamanında önüne getirir. Kartı çevir, cevabı gör, ne kadar hatırladığını işaretle; sıradaki tekrar zamanı buna göre seçilir.', 'Flashcards bring back each card just before you’d forget it. Flip it, see the answer and mark how well you knew it; the next review is timed from that.'],
	hero: {phone: phone('m-kart-on', Assist.CardSessionScreen), browser: browser('w-kart-vitrin', WAssist.WebCardsHomeScreen)},
	steps: [
		{title: ['Bugünün kartları', 'Today’s cards'], text: ['Tekrar zamanı gelen kartlar her gün tek listede.', 'Cards due for review in one list every day.'], shot: phone('m-kart-bugun', Assist.CardsTodayScreen)},
		{title: ['Kartı çevir', 'Flip the card'], text: ['Önce kendin hatırla, sonra cevabı gör.', 'Recall it first, then see the answer.'], shot: phone('m-kart-on', Assist.CardSessionScreen)},
		{title: ['Ne kadar hatırladın?', 'How well did you know it?'], text: ['Bilmiyorum, Emin değilim ya da Biliyorum: sıradaki tekrar buna göre.', 'Don’t know, Not sure or Know it: the next review follows.'], shot: phone('m-kart-arka', Assist.CardSessionBackScreen)},
	],
	features: [
		{title: ['Ders, konu, deste', 'Subject, topic, deck'], text: ['Her konunun kartları bir destedir; ders ders göz at.', 'Each topic’s cards are a deck; browse by subject.'], points: [['Konu konu desteler', 'A deck per topic'], ['Kaldığın kart', 'The card you left']], shot: phone('m-kart-desteler', Assist.CardsDecksScreen)},
		{title: ['Kaydet, sonra bak', 'Save it for later'], text: ['Tekrar bakmak istediğin kartları kaydet; hepsi tek listede.', 'Save the cards you want to see again; all in one list.'], points: [['Tek dokunuşla kaydet', 'Save in one tap'], ['Kaydedilenler sekmesi', 'Saved tab']], shot: phone('m-kart-kaydedilen', Assist.CardsSavedScreen)},
		{title: ['Kendi notundan deste', 'A deck from your notes'], text: ['SinoAI notundan ya da PDF’inden sana özel kart destesi hazırlar.', 'SinoAI makes a personal deck from your notes or PDF.'], points: [['Kişisel deste', 'Personal deck'], ['Bilgi Kartları’nda açılır', 'Opens in Flashcards']], shot: phone('m-sino-sonuc', Sino.SinoStudyResultScreen)},
		{title: ['Günü bitir, seriyi koru', 'Finish the day, keep the streak'], text: ['Bugünün kartları bitince kaç kart tekrar ettiğini ve serini gör.', 'When today’s cards are done, see how many you reviewed and your streak.'], points: [['Günlük seri', 'Daily streak'], ['Yarının kartları', 'Tomorrow’s cards']], shot: phone('m-kart-bitti', States.CardsDoneScreen)},
		{title: ['Web’de göz at', 'Browse on the web'], text: ['Desteleri web’de geniş ekranda gez, oturumu klavyeyle ilerlet.', 'Browse decks on a wide screen and move on with the keyboard.'], points: [['Ders ders göz at', 'Browse by subject'], ['Aynı hesap', 'Same account']], shot: browser('w-kart-gozat', WAssist.WebCardsBrowseScreen)},
	],
	example: {title: ['Unutmadan önce tekrar', 'Review before you forget'], text: ['“Bilmiyorum” dediğin kart yakında yeniden gelir; “Biliyorum” dediğin kartın arası açılır. Böylece zamanını bildiğin kartlara değil, unutmak üzere olduklarına harcarsın.', 'A card you didn’t know comes back soon; one you knew comes back later. Your time goes to the cards you’re about to forget.'], shot: phone('m-kart-arka', Assist.CardSessionBackScreen), zoom: 200},
	links: [
		{module: 'sinoAi', text: ['SinoAI notundan kart destesi hazırlar.', 'SinoAI makes a deck from your notes.']},
		{module: 'smartSummary', text: ['Analiz sonucundan tek dokunuşla kart yap.', 'Make a card from an analysis in one tap.']},
		{module: 'studyPlan', text: ['Günün kartları planında görev olarak.', 'Today’s cards show as a task in your plan.']},
	],
	faq: [
		{q: ['Aralıklı tekrar nedir?', 'What is spaced repetition?'], a: ['Kartı unutmak üzereyken yeniden görmen. Hatırladıkça aralık açılır, unuttukça kısalır.', 'Seeing a card just before you forget it. The gap grows when you remember and shrinks when you don’t.']},
		{q: ['Günde kaç kart gelir?', 'How many cards a day?'], a: ['Tekrar zamanı gelen kartlar ve sınırlı sayıda yeni kart; sayı vitrinde yazar.', 'Cards due for review plus a limited number of new ones; the count is on the home page.']},
		{q: ['Kendi kartımı yapabilir miyim?', 'Can I make my own cards?'], a: ['SinoAI notundan ya da PDF’inden sana özel deste hazırlar.', 'SinoAI makes a personal deck from your notes or PDF.']},
		{q: ['Kartlar hangi derslerde?', 'Which subjects have cards?'], a: ['Hedef sınavının derslerinde, konu konu desteler hâlinde.', 'In your target exam’s subjects, in a deck per topic.']},
		{q: ['Web ve mobilde aynı mı?', 'Same on web and mobile?'], a: ['Evet. Tekrar zamanların ve kaydettiğin kartlar iki yerde aynı.', 'Yes. Your review times and saved cards match on both.']},
	],
};

const smartSummary: ProductContent = {
	module: 'smartSummary',
	route: '/urunler/lens',
	title: ['Takıldığın sorunun fotoğrafını çek', 'Snap the question you’re stuck on'],
	lead: ['Akıllı Özet sorunun adım adım çözümünü, cevabını, kazanımını ve sık yapılan hatayı verir. Sonra konuda devam yolunu açar: konu anlatımı, benzer sorular, kart ya da SinoAI.', 'Smart Summary gives the step-by-step solution, the answer, the skill and the common mistake. Then it opens the way on: the lesson, similar questions, a card or SinoAI.'],
	hero: {phone: phone('m-ozet-sonuc', Assist.SummaryResultScreen), browser: browser('w-ozet-detay', WAssist.WebSummaryDetailScreen)},
	steps: [
		{title: ['Fotoğrafını çek', 'Take a photo'], text: ['Kitaptaki ya da defterdeki soruyu çek; galeriden ya da PDF’ten de yükleyebilirsin.', 'Snap a question from a book or notebook; upload from your gallery or a PDF too.'], shot: phone('m-ozet-kamera', Assist.SummaryCameraScreen)},
		{title: ['Soru okunur', 'The question is read'], text: ['Soru, şıklar ve şekil ayrıştırılır; birkaç saniye sürer.', 'The question, options and figure are read; it takes a few seconds.'], shot: phone('m-ozet-isleniyor', Assist.SummaryProcessingScreen)},
		{title: ['Çözümü oku', 'Read the solution'], text: ['Adım adım çözüm, cevap, kazanım ve sık yapılan hata.', 'Step-by-step solution, answer, skill and the common mistake.'], shot: phone('m-ozet-sonuc', Assist.SummaryResultScreen)},
	],
	features: [
		{title: ['Adım adım çözüm', 'A step-by-step solution'], text: ['Her adım neden yapıldığını söyler; sonunda cevap ve kazanım.', 'Each step says why it is done; the answer and the skill at the end.'], points: [['Kazanım ve konu', 'Skill and topic'], ['Sık yapılan hata', 'The common mistake']], shot: phone('m-ozet-sonuc', Assist.SummaryResultScreen), zoom: 90},
		{title: ['Galeriden ve PDF’ten', 'From your gallery or a PDF'], text: ['Telefondaki fotoğrafı ya da PDF sayfasını yükle.', 'Upload a photo from your phone or a PDF page.'], points: [['Kamera, galeri, PDF', 'Camera, gallery, PDF'], ['Okunamazsa hak düşmez', 'Unreadable photos don’t count']], shot: phone('m-ozet-yukle', Assist.SummaryUploadScreen)},
		{title: ['Ders videosundan analiz', 'Analyse a lesson video'], text: ['Ders videosunu ekle; bölümlerini özetler ve videodan sorular hazırlar.', 'Add a lesson video; it summarises the sections and makes questions from it.'], points: [['Bölüm bölüm özet', 'Summary by section'], ['Videodan sorular', 'Questions from the video']], shot: phone('m-ozet-video', Assist.SummaryVideoScreen)},
		{title: ['Analizini PDF olarak sakla', 'Keep it as a PDF'], text: ['Çözümü Sınavika PDF’i olarak indir, defterine ekle.', 'Download the solution as a Sınavika PDF for your notes.'], points: [['Sınavika PDF’i', 'A Sınavika PDF'], ['Defterine ekle', 'Add it to your notes']], shot: phone('m-ozet-pdf', Gaps.SummaryPdfScreen)},
		{title: ['Web’de geçmişin', 'Your history on the web'], text: ['Bütün analizlerin web’de tek listede; istediğini yeniden aç.', 'All your analyses in one list on the web; reopen any of them.'], points: [['Tarih ve ders', 'Date and subject'], ['Aynı hesap', 'Same account']], shot: browser('w-ozet-gecmis', WGaps.WebSummaryHistoryScreen)},
	],
	example: {title: ['Çözümden konuya', 'From the solution to the topic'], text: ['Türev sorusunda takıldın. Fotoğrafını çekince çözümün yanında “Benzer 5 soru” Testler’de, “Konuyu çalış” Dersler’de açılır; aynı hataya bir daha düşmezsin.', 'You got stuck on a derivative. Snap it and next to the solution “5 similar questions” opens in Quizzes and “Study the topic” in Lessons.'], shot: phone('m-ozet-sonuc', Assist.SummaryResultScreen), zoom: 360},
	links: [
		{module: 'tests', text: ['Benzer 5 soruyla pekiştir.', 'Practise with 5 similar questions.']},
		{module: 'lessons', text: ['Sorunun konusunu Dersler’de çalış.', 'Study the topic in Lessons.']},
		{module: 'flashcards', text: ['Çözümden bilgi kartı yap.', 'Make a flashcard from the solution.']},
	],
	faq: [
		{q: ['Hangi soruları çözebilir?', 'Which questions can it solve?'], a: ['Hedef sınavının derslerindeki çoktan seçmeli ve açık uçlu sorular; şekilli sorular dahil.', 'Multiple-choice and open questions in your exam’s subjects, figures included.']},
		{q: ['Fotoğraf okunmazsa?', 'What if the photo is unreadable?'], a: ['Daha net bir fotoğraf istenir; okunamayan fotoğraf hakkından düşmez.', 'You’re asked for a clearer photo; unreadable photos don’t count.']},
		{q: ['Çözüm doğru mu?', 'Is the solution right?'], a: ['Çözümler yapay zekâyla hazırlanır ve hata yapabilir; önemli bilgileri kontrol et.', 'Solutions are made with AI and can be wrong; check important facts.']},
		{q: ['Web’de de kullanabilir miyim?', 'Can I use it on the web?'], a: ['Evet. Web’de dosya yükleyerek yeni analiz başlat; geçmişin iki yerde aynı.', 'Yes. Upload a file on the web; your history matches on both.']},
		{q: ['Video analizi nasıl çalışır?', 'How does video analysis work?'], a: ['Ders videosunu ekle; bölümlerini özetler ve videodan sorular hazırlar.', 'Add a lesson video; it summarises sections and makes questions.']},
	],
};

const sinoAi: ProductContent = {
	module: 'sinoAi',
	route: '/urunler/sinoai',
	title: ['Takıldığın yerde seni tanıyan asistan', 'An assistant that knows you'],
	lead: ['SinoAI hedefini, eksiklerini ve geçmiş çalışmalarını bilerek yanıtlar. Soruyu adım adım çözer, konuyu sade anlatır, notundan sana test, kart ya da plan hazırlar.', 'SinoAI answers with your goal, gaps and past work in mind. It solves step by step, explains simply and makes quizzes, cards or a plan from your notes.'],
	hero: {phone: phone('m-sino-sohbet', Sino.SinoChatScreen), browser: browser('w-sino-sohbet', WSino.WebSinoChatScreen)},
	steps: [
		{title: ['Sor', 'Ask'], text: ['Soruyu yaz ya da fotoğrafını ekle.', 'Type your question or add a photo.'], shot: phone('m-sino-ana', Sino.SinoHomeScreen)},
		{title: ['Adım adım yanıt', 'A step-by-step answer'], text: ['Hedefini ve son denemeni bilerek, sade bir dille.', 'In plain words, knowing your goal and last exam.'], shot: phone('m-sino-sohbet', Sino.SinoChatScreen)},
		{title: ['Çalışma üret', 'Make study work'], text: ['Konudan ya da notundan test, kart, özet veya plan iste.', 'Ask for a quiz, cards, a summary or a plan from a topic or your notes.'], shot: phone('m-sino-calisma', Sino.SinoStudyScreen)},
		{title: ['Kütüphanende aç', 'Open it in your library'], text: ['Ürettiklerin kütüphanende durur; ilgili modülde açılır.', 'What you make stays in your library and opens in its module.'], shot: phone('m-sino-kutuphane', Sino.SinoLibraryScreen)},
	],
	features: [
		{title: ['Seni tanır', 'It knows you'], text: ['Hedef sınavını, son denemeni ve eksik konularını bilerek anlatır.', 'It explains knowing your exam, your last result and your gaps.'], points: [['Hedefine göre', 'For your goal'], ['Eksiklerini bilerek', 'Knowing your gaps']], shot: phone('m-sino-sohbet', Sino.SinoChatScreen), zoom: 120},
		{title: ['Notundan çalışma', 'Study work from your notes'], text: ['Konu ya da not ver; test, kart destesi, özet ya da çalışma planı hazırlasın.', 'Give a topic or notes; get a quiz, a deck, a summary or a plan.'], points: [['Test ve kart', 'Quizzes and cards'], ['Özet ve plan', 'Summaries and plans']], shot: phone('m-sino-sonuc', Sino.SinoStudyResultScreen)},
		{title: ['Kaynaklarım', 'My sources'], text: ['PDF’lerini ve notlarını yükle; SinoAI onlardan çalışma hazırlar.', 'Upload your PDFs and notes; SinoAI makes study work from them.'], points: [['PDF ve not', 'PDFs and notes'], ['Tek yerde', 'In one place']], shot: phone('m-sino-kaynaklar', Gaps.SinoSourcesScreen)},
		{title: ['Çalışma notu', 'Study notes'], text: ['Sohbetten çıkan konuyu düzenli bir notta topla.', 'Turn a chat topic into a tidy study note.'], points: [['Başlıklı not', 'A note with headings'], ['Kütüphanende', 'In your library']], shot: phone('m-sino-not', Gaps.SinoStudyNoteScreen)},
		{title: ['Web’de geniş sohbet', 'A wide chat on the web'], text: ['Solda geçmiş, ortada tek sohbet sütunu; mobildeki sohbetlerin de burada.', 'History on the left, one chat column in the middle; your mobile chats are here too.'], points: [['Sohbet ve Çalışma', 'Chat and Study'], ['Aynı geçmiş', 'Same history']], shot: browser('w-sino-calisma', WSino.WebSinoStudyScreen)},
	],
	example: {title: ['Bir sorudan bir çalışmaya', 'From one question to a study set'], text: ['Türevde zincir kuralını sordun. SinoAI adım adım anlatır, sonra “Bu konudan 10 soruluk test hazırla” dediğinde test kütüphanene eklenir ve Testler’de açılır.', 'You asked about the chain rule. SinoAI explains step by step; ask for a 10-question quiz and it goes to your library and opens in Quizzes.'], shot: phone('m-sino-sonuc', Sino.SinoStudyResultScreen), zoom: 80},
	links: [
		{module: 'tests', text: ['Ürettiğin test Testler’de açılır.', 'Your quiz opens in Quizzes.']},
		{module: 'flashcards', text: ['Ürettiğin deste Bilgi Kartları’nda.', 'Your deck opens in Flashcards.']},
		{module: 'studyPlan', text: ['Ürettiğin plan Ders Planı’na eklenir.', 'Your plan goes into Study Plan.']},
	],
	faq: [
		{q: ['SinoAI ne bilir?', 'What does SinoAI know?'], a: ['Hedef sınavını, son denemeni, eksik konularını ve ürettiğin çalışmaları.', 'Your exam, last result, gaps and the study work you made.']},
		{q: ['Cevaplarına güvenebilir miyim?', 'Can I trust its answers?'], a: ['SinoAI bir yapay zekâ; hata yapabilir. Önemli bilgileri kontrol et.', 'SinoAI is an AI and can make mistakes. Check important facts.']},
		{q: ['Fotoğrafla soru sorabilir miyim?', 'Can I ask with a photo?'], a: ['Evet. Fotoğrafı yazma kutusuna ekle.', 'Yes. Add the photo to the message box.']},
		{q: ['Misafir olarak kullanabilir miyim?', 'Can I use it as a guest?'], a: ['Sitedeki SinoAI sayfasında sınırlı sayıda soru sorabilirsin; hesapla hedefini bilerek yanıtlar.', 'On the site’s SinoAI page you can ask a few questions; with an account it knows your goal.']},
		{q: ['Ürettiklerim nerede durur?', 'Where does my work go?'], a: ['Kütüphanende; her biri kendi modülünde açılır.', 'In your library; each opens in its own module.']},
	],
};

export const PRODUCT_CONTENT: Record<ModuleKey, ProductContent> = {studyPlan, lessons, tests, exam, flashcards, smartSummary, sinoAi};
