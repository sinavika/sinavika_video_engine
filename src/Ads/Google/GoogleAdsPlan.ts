/**
 * The Google Ads plan for Sınavika: one source for the concepts, the proof on
 * each picture, the text assets and the formats. The pictures
 * (GoogleAdImage), the HTML5 banners and the content plan all read it
 * (docs/Ads/GoogleAds/Icerik-Plani.md).
 *
 * Audience: students only, no parents. Two markets, each in its own language
 * and folder: Turkey in Turkish (YKS, KPSS) and the United States in English
 * (SAT, ACT). Two promotions: the mobile app and the web site.
 *
 * Every hook names its exam and is built from searched terms (Google Keyword
 * Planner, Oct 2026; docs/Ads/GoogleAds/Anahtar-Kelime-ve-Kanca-Kurallari.md), and
 * every picture carries the exam tag (EXAM_TAG) above the hook, so the student
 * knows at a glance which exam the ad is for.
 */
import type {ModuleKey} from '../../UIUX/ModuleIdentity';

export type AdLang = 'tr' | 'en';
export type AdExam = 'yks' | 'kpss' | 'sat' | 'act';
export type AdPlatform = 'mobile' | 'web';
export type AdFormat = 'yatay' | 'kare' | 'dikey';
type Copy = Record<AdLang, string>;

export const AD_LANGS: readonly AdLang[] = ['tr', 'en'];
export const AD_EXAMS: readonly AdExam[] = ['yks', 'kpss', 'sat', 'act'];

/** The market of an exam decides its language: Turkey in Turkish, the United States in English. */
export const EXAM_LANG: Record<AdExam, AdLang> = {yks: 'tr', kpss: 'tr', sat: 'en', act: 'en'};
export const examsForLang = (lang: AdLang): AdExam[] => AD_EXAMS.filter((exam) => EXAM_LANG[exam] === lang);

/**
 * The exam tag above every hook: which exam, and which parts of it. "KPSS"
 * alone is not enough; a student searches "kpss önlisans" or "kpss
 * ortaöğretim" (74,000 a month), so the tag names the levels.
 */
export const EXAM_TAG: Record<AdExam, string> = {
	kpss: 'KPSS · Lisans · Önlisans · Ortaöğretim',
	yks: 'YKS · TYT · AYT',
	sat: 'Digital SAT · Math · Reading & Writing',
	act: 'ACT · English · Math · Reading · Science',
};

/** US copy is English only; the Turkish slot repeats it because the shared UI parts read copy as {tr, en}. */
const us = (text: string): Copy => ({tr: text, en: text});
export const AD_PLATFORMS: readonly AdPlatform[] = ['mobile', 'web'];

/** Google's image sizes for responsive display, Performance Max, Demand Gen and app campaigns. */
export const AD_FORMATS: Record<AdFormat, {width: number; height: number; folder: string; label: string}> = {
	yatay: {width: 1200, height: 628, folder: 'yatay-1200x628', label: 'Yatay 1,91:1'},
	kare: {width: 1200, height: 1200, folder: 'kare-1200x1200', label: 'Kare 1:1'},
	dikey: {width: 1200, height: 1500, folder: 'dikey-1200x1500', label: 'Dikey 4:5'},
};

/** HTML5 sizes Google accepts for these campaigns; one ZIP each, at most 5 MB and 512 files. */
export const HTML5_SIZES = [
	{width: 320, height: 480, name: '320x480'},
	{width: 480, height: 320, name: '480x320'},
] as const;

/**
 * Display-network banner sizes (uploaded image ads, web site promotion only):
 * the sizes Google fills most, each at most 150 KB.
 */
export const DISPLAY_SIZES = ['300x250', '336x280', '250x250', '300x600', '160x600', '728x90', '970x250', '320x100', '320x50'] as const;
export type DisplaySize = (typeof DISPLAY_SIZES)[number];
export const DISPLAY_MAX_BYTES = 150 * 1024;

export const PLATFORM_FOLDER: Record<AdPlatform, string> = {mobile: 'mobil-uygulama', web: 'web-sitesi'};

/** The proof on a picture: one piece of the real product, large enough to read in a small ad slot. */
export type AdProof =
	| {kind: 'loss'; title: Copy; rows: {topic: Copy; lesson: Copy; loss: Copy}[]}
	| {kind: 'tasks'; title: Copy; meta: Copy; tasks: {text: Copy; sub: Copy; module: ModuleKey; done?: boolean}[]}
	| {kind: 'steps'; title: Copy; topic: Copy; steps: Copy[]; answer: Copy}
	| {kind: 'score'; title: Copy; net: Copy; unit?: Copy; delta: Copy; rank: Copy; rankOf: Copy; rankLabel: Copy}
	| {kind: 'card'; title: Copy; meta: Copy; front: Copy; back: Copy; deck: Copy}
	| {kind: 'chat'; question: Copy; answer: Copy; note: Copy}
	/** Dersler: one interactive step of the one flow ("Adım x / y", fill the blank, then "Konu anlatımı"). */
	| {kind: 'lesson'; title: Copy; step: Copy; prompt: Copy; options: Copy[]; answer: number; link: Copy}
	/** Testler: the retake test built from the student's own mistakes. */
	| {kind: 'retake'; title: Copy; count: Copy; meta: Copy; topics: Copy[]};

/**
 * Where a concept runs (report §4.7): the product group of its exam, the
 * Dersler showcase or the KPSS level group. Backups wait for a concept that
 * comes out "Low" in the first three weeks.
 */
export type AdGroup = 'urun' | 'dersler' | 'duzey';

export type AdConcept = {
	/** Folder-safe code, unique within the exam; the asset name is `<exam>-<promotion>-<id>-<format>-2026-11` (report §3.4). */
	id: string;
	exam: AdExam;
	module: ModuleKey;
	group: AdGroup;
	/** Waits in reserve (report §4: Y1, Y2). */
	backup?: boolean;
	/** Short hook, the main line on the picture (also an ad headline: 30 characters at most). */
	headline: Copy;
	/** The headline-field version when the picture's hook is longer than 30 characters. */
	shortHeadline?: Copy;
	/** One supporting sentence under the hook. */
	subline: Copy;
	proof: AdProof;
	/** The real UI/UX drawing in the phone and in the browser (src/UIUX Registry ids), drawn with this exam's data. */
	screen: {mobile: string; web: string};
	/** Where it sits in the funnel. */
	stage: 'keşif' | 'değerlendirme' | 'yeniden pazarlama';
	/** This concept carries an HTML5 banner of its exam. */
	html5?: boolean;
	/** This concept carries the 15 s spot of its exam. */
	video?: boolean;
};

/**
 * The line under the copy that says where the student goes (no button shapes
 * on pictures). Owner, 20 Nov 2026: there is no free plan; the app has a
 * 3-day free trial in the stores, the web site has none (report §3.1).
 */
export const PLATFORM_LINE: Record<AdPlatform, Copy> = {
	mobile: {tr: 'iOS ve Android: 3 gün ücretsiz dene', en: 'iOS and Android: try it free for 3 days'},
	web: {tr: "sinavika.com'da başla", en: 'Start at sinavika.com'},
};

/** The HTML5 call to action (the whole banner is the click; the button only says where it goes). */
export const PLATFORM_CTA: Record<AdPlatform, Copy> = {
	mobile: {tr: '3 gün ücretsiz dene', en: 'Try it free for 3 days'},
	web: {tr: "sinavika.com'da başla", en: 'Start at sinavika.com'},
};

/** The only sentences that may say "ücretsiz" / "free": the store trial (report §3.1). */
export const TRIAL_PHRASES: readonly string[] = ['3 gün ücretsiz dene', 'try it free for 3 days', 'Try it free for 3 days'];

const tr = (text: string, en: string): Copy => ({tr: text, en});

const LESSON_SCREEN = {mobile: 'm-ders-bosluk', web: 'w-ders-bosluk'};
const LOSS_SCREEN = {mobile: 'm-deneme-net', web: 'w-deneme-sonuc'};
const PLAN_SCREEN = {mobile: 'm-plan-bugun', web: 'w-plan-bugun'};
const RETAKE_SCREEN = {mobile: 'm-test-yanlislar', web: 'w-test-yanlislar'};
const SNAP_SCREEN = {mobile: 'm-ozet-sonuc', web: 'w-ozet-detay'};
const SCORE_SCREEN = {mobile: 'm-deneme-sonuc', web: 'w-deneme-sonuc'};
const CALENDAR_SCREEN = {mobile: 'm-deneme-ay', web: 'w-sinav-takvimi'};
const CARD_SCREEN = {mobile: 'm-kart-on', web: 'w-kart-oturum'};
const CHAT_SCREEN = {mobile: 'm-sino-sohbet', web: 'w-sino-sohbet'};

export const AD_CONCEPTS: readonly AdConcept[] = [
	// ---------------------------------------------------------------- YKS (report §4.1)
	{
		id: 'net-kaybi',
		exam: 'yks',
		module: 'exam',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: LOSS_SCREEN,
		headline: tr('TYT netini nerede kaybettin?', 'Where did you lose points?'),
		subline: tr('Her TYT ve AYT denemesinden sonra eksik konunu gör.', 'See your gaps topic by topic after every mock exam.'),
		proof: {
			kind: 'loss',
			title: tr('En çok net kaybettiğin 3 konu', 'Where you lost the most'),
			rows: [
				{topic: tr('Problemler', 'Problems'), lesson: tr('TYT Matematik', 'TYT Maths'), loss: tr('−3,25 net', '−3.25')},
				{topic: tr('Paragraf', 'Reading'), lesson: tr('TYT Türkçe', 'TYT Turkish'), loss: tr('−2,5 net', '−2.5')},
				{topic: tr('Kuvvet ve hareket', 'Force and motion'), lesson: tr('TYT Fizik', 'TYT Physics'), loss: tr('−1,75 net', '−1.75')},
			],
		},
	},
	{
		id: 'calisma-programi',
		exam: 'yks',
		module: 'studyPlan',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: PLAN_SCREEN,
		headline: tr('YKS çalışma programın hazır', 'Your YKS plan is ready'),
		subline: tr('Ders Planı TYT ve AYT eksiklerinden günlük görevler kurar.', 'Study Plan turns your gaps into daily tasks.'),
		proof: {
			kind: 'tasks',
			title: tr('Bugünün planı', "Today's plan"),
			meta: tr('3 görev · 45 dk', '3 tasks · 45 min'),
			tasks: [
				{text: tr('Paragraf · ana düşünce', 'Reading · main idea'), sub: tr('Dersler · 8 dk', 'Lessons · 8 min'), module: 'lessons', done: true},
				{text: tr('Problemler · 20 soru', 'Problems · 20 questions'), sub: tr('Test · Orta', 'Quiz · Medium'), module: 'tests'},
				{text: tr('Kimya · mol kartları', 'Chemistry · mole cards'), sub: tr('20 kart · 6 dk', '20 cards · 6 min'), module: 'flashcards'},
			],
		},
	},
	{
		id: 'dersler',
		exam: 'yks',
		module: 'lessons',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: LESSON_SCREEN,
		headline: tr('TYT konusunu adım adım öğren', 'Learn TYT topics step by step'),
		subline: tr('Dersler konuyu adım adım, etkileşimli anlatır.', 'Lessons teach each topic step by step.'),
		proof: {
			kind: 'lesson',
			title: tr('TYT Fizik · Kuvvet ve hareket', 'TYT Physics · Force and motion'),
			step: tr('Adım 4 / 12', 'Step 4 / 12'),
			prompt: tr('Net kuvvet sıfırsa cisim durur ya da sabit hızla ___.', 'With zero net force a body stays still or ___ at constant speed.'),
			options: [tr('hareket eder', 'moves'), tr('hızlanır', 'speeds up')],
			answer: 0,
			link: tr('Konu anlatımı', 'Topic summary'),
		},
	},
	{
		id: 'yanlis-tekrar',
		exam: 'yks',
		module: 'tests',
		group: 'urun',
		stage: 'değerlendirme',
		screen: RETAKE_SCREEN,
		headline: tr('TYT yanlışların tekrar testi', 'Retake your TYT mistakes'),
		subline: tr('Testler yanlış yaptığın sorulardan yeni bir test kurar.', 'Quizzes build a new quiz from your mistakes.'),
		proof: {
			kind: 'retake',
			title: tr('Yanlışlarından tekrar testi', 'Your mistakes, as a quiz'),
			count: tr('12 soru hazır', '12 questions ready'),
			meta: tr('Son 2 haftadaki yanlışların', 'Your mistakes from the last 2 weeks'),
			topics: [tr('Problemler', 'Problems'), tr('Paragraf', 'Reading'), tr('Kuvvet ve hareket', 'Force and motion')],
		},
	},
	{
		id: 'fotograf-cek-coz',
		exam: 'yks',
		module: 'smartSummary',
		group: 'urun',
		stage: 'keşif',
		video: true,
		screen: SNAP_SCREEN,
		headline: tr('Çözemediğin TYT sorusunu çek', 'Stuck? Snap the question'),
		subline: tr('Akıllı Özet adım adım çözer, konusunu söyler.', 'Smart Summary solves it step by step and names the topic.'),
		proof: {
			kind: 'steps',
			title: tr('Adım adım çözüm', 'Step-by-step solution'),
			topic: tr('Oran ve orantı · TYT Matematik', 'Ratio · TYT Maths'),
			steps: [tr('Kız ve erkek sayısı 3k ve 5k olsun.', 'Let girls and boys be 3k and 5k.'), tr('5k − 3k = 12 ise k = 6.', '5k − 3k = 12, so k = 6.'), tr('Sınıf mevcudu 8k = 48.', 'Class size 8k = 48.')],
			answer: tr('Cevap: 48', 'Answer: 48'),
		},
	},
	{
		id: 'turkiye-geneli',
		exam: 'yks',
		module: 'exam',
		group: 'urun',
		stage: 'değerlendirme',
		screen: SCORE_SCREEN,
		headline: tr('Türkiye geneli TYT denemesi', 'A nationwide TYT mock'),
		subline: tr('Canlı denemeye katıl; netini ve Türkiye sıralamanı öğren.', 'Join a live mock exam and get your rank.'),
		proof: {kind: 'score', title: tr('TYT Deneme 4', 'TYT Mock 4'), net: tr('78,5', '78.5'), unit: tr('net', 'net'), delta: tr('+6,5 net', '+6.5'), rank: tr('8.214', '8,214'), rankOf: tr('', ''), rankLabel: tr('Türkiye sıralaman', 'Your national rank')},
	},
	{
		id: 'turkiye-geneli-ayt',
		exam: 'yks',
		module: 'exam',
		group: 'urun',
		backup: true,
		stage: 'değerlendirme',
		screen: SCORE_SCREEN,
		headline: tr('Türkiye geneli AYT denemesi', 'A nationwide AYT mock'),
		subline: tr('AYT denemesini çöz; netini ve Türkiye sıralamanı öğren.', 'Take the AYT mock and get your rank.'),
		proof: {kind: 'score', title: tr('AYT Sayısal Deneme 2', 'AYT Mock 2'), net: tr('46,25', '46.25'), unit: tr('net', 'net'), delta: tr('+4,5 net', '+4.5'), rank: tr('5.930', '5,930'), rankOf: tr('', ''), rankLabel: tr('Türkiye sıralaman', 'Your national rank')},
	},
	{
		id: 'deneme-takvimi',
		exam: 'yks',
		module: 'exam',
		group: 'urun',
		backup: true,
		stage: 'değerlendirme',
		screen: CALENDAR_SCREEN,
		headline: tr('Bu ayın TYT denemesi hazır', "This month's TYT mock"),
		subline: tr('Aylık deneme takvimini gör, başlamadan hatırlatma al.', 'See the monthly mock calendar.'),
		proof: {kind: 'score', title: tr('Kasım TYT denemesi', 'November TYT mock'), net: tr('Cumartesi', 'Saturday'), delta: tr('10:00', '10:00'), rank: tr('15 dk önce', '15 min before'), rankOf: tr('', ''), rankLabel: tr('Hatırlatma', 'Reminder')},
	},
	{
		id: 'ayt-kartlar',
		exam: 'yks',
		module: 'flashcards',
		group: 'urun',
		backup: true,
		stage: 'değerlendirme',
		screen: CARD_SCREEN,
		headline: tr('AYT formülleri aklında kalsın', 'Make AYT formulas stick'),
		subline: tr('Bilgi Kartları unutmak üzere olduğun kartı tam zamanında getirir.', 'Flashcards bring each card back just before you forget it.'),
		proof: {kind: 'card', title: tr('Bugün tekrar', 'Due today'), meta: tr('24 kart · 7 dk', '24 cards · 7 min'), front: tr('Türevde çarpım kuralı?', 'Product rule?'), back: tr("(f·g)' = f'·g + f·g'", "(f·g)' = f'·g + f·g'"), deck: tr('AYT Matematik · Türev', 'AYT Maths · Derivative')},
	},
	{
		id: 'sinoai',
		exam: 'yks',
		module: 'sinoAi',
		group: 'urun',
		backup: true,
		stage: 'yeniden pazarlama',
		screen: CHAT_SCREEN,
		headline: tr('Takıldığın TYT konusunu sor', 'Ask about any TYT topic'),
		subline: tr('SinoAI hedefini ve eksiklerini bilerek anlatır.', 'SinoAI explains with your goal and gaps in mind.'),
		proof: {kind: 'chat', question: tr('Paragrafta ana düşünceyi nasıl bulurum?', 'How do I find the main idea?'), answer: tr('Önce yazarın neden yazdığını sor; ana düşünce çoğu zaman giriş ya da sonuçtadır.', 'Ask why the writer wrote it; the main idea is usually at the start or the end.'), note: tr('Son denemende paragraftan 2,5 net kaybettin.', 'You lost 2.5 on reading in your last mock.')},
	},
	// ---------------------------------------------------------------- KPSS (report §4.2)
	{
		id: 'puan-kaybi',
		exam: 'kpss',
		module: 'exam',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: LOSS_SCREEN,
		headline: tr('KPSS puanını nerede kaybettin?', 'Where did your score slip?'),
		subline: tr('KPSS denemeni çöz; GY-GK eksiklerini tek ekranda gör.', 'See your weak KPSS topics on one screen.'),
		proof: {
			kind: 'loss',
			title: tr('GY-GK: en çok kaybettiğin 3 konu', 'Where you lost the most'),
			rows: [
				{topic: tr('Osmanlı kültür ve medeniyeti', 'Ottoman culture'), lesson: tr('GK · Tarih', 'GC · History'), loss: tr('−2,5 net', '−2.5')},
				{topic: tr('Sayısal mantık', 'Numerical reasoning'), lesson: tr('GY · Matematik', 'GA · Maths'), loss: tr('−2 net', '−2')},
				{topic: tr('Temel haklar', 'Fundamental rights'), lesson: tr('GK · Vatandaşlık', 'GC · Civics'), loss: tr('−1,25 net', '−1.25')},
			],
		},
	},
	{
		id: 'isten-sonra-plan',
		exam: 'kpss',
		module: 'studyPlan',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: PLAN_SCREEN,
		headline: tr('KPSS çalışma programın hazır', 'Your KPSS plan is ready'),
		subline: tr('Ders Planı günü kısa görevlere böler; işten sonra da yetişir.', 'Study Plan splits your day into short tasks.'),
		proof: {
			kind: 'tasks',
			title: tr('Bugünün planı · işten sonra', "Today's plan · after work"),
			meta: tr('3 görev · 40 dk', '3 tasks · 40 min'),
			tasks: [
				{text: tr('Paragraf · 20 soru', 'Reading · 20 questions'), sub: tr('Test · Zor', 'Quiz · Hard'), module: 'tests', done: true},
				{text: tr('Coğrafya · iklim tipleri', 'Geography · climates'), sub: tr('Dersler · 12 dk', 'Lessons · 12 min'), module: 'lessons'},
				{text: tr('Tarih · Lale Devri', 'History · Tulip Era'), sub: tr('24 kart · 8 dk', '24 cards · 8 min'), module: 'flashcards'},
			],
		},
	},
	{
		id: 'dersler',
		exam: 'kpss',
		module: 'lessons',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: LESSON_SCREEN,
		headline: tr('KPSS konusunu adım adım öğren', 'Learn KPSS topics step by step'),
		subline: tr('Dersler konuyu adım adım, etkileşimli anlatır.', 'Lessons teach each topic step by step.'),
		proof: {
			kind: 'lesson',
			title: tr('KPSS Tarih · Lale Devri', 'KPSS History · Tulip Era'),
			step: tr('Adım 3 / 10', 'Step 3 / 10'),
			prompt: tr('Lale Devri, ___ Antlaşması ile başladı.', 'The Tulip Era began with the Treaty of ___.'),
			options: [tr('Pasarofça', 'Passarowitz'), tr('Karlofça', 'Karlowitz')],
			answer: 0,
			link: tr('Konu anlatımı', 'Topic summary'),
		},
	},
	{
		id: 'yanlis-tekrar',
		exam: 'kpss',
		module: 'tests',
		group: 'urun',
		stage: 'değerlendirme',
		screen: RETAKE_SCREEN,
		headline: tr('KPSS yanlışların tekrar testi', 'Retake your KPSS mistakes'),
		subline: tr('Testler yanlış yaptığın sorulardan yeni bir test kurar.', 'Quizzes build a new quiz from your mistakes.'),
		proof: {
			kind: 'retake',
			title: tr('Yanlışlarından tekrar testi', 'Your mistakes, as a quiz'),
			count: tr('10 soru hazır', '10 questions ready'),
			meta: tr('Son 2 haftadaki yanlışların', 'Your mistakes from the last 2 weeks'),
			topics: [tr('Tarih', 'History'), tr('Vatandaşlık', 'Civics'), tr('Sayısal mantık', 'Numerical reasoning')],
		},
	},
	{
		id: 'tarih-kartlar',
		exam: 'kpss',
		module: 'flashcards',
		group: 'urun',
		stage: 'keşif',
		video: true,
		screen: CARD_SCREEN,
		headline: tr('KPSS tarihi aklında kalsın', 'Make KPSS history stick'),
		subline: tr('Bilgi Kartları unutmak üzere olduğun kartı tam zamanında getirir.', 'Flashcards bring each card back just before you forget it.'),
		proof: {kind: 'card', title: tr('Bugün tekrar', 'Due today'), meta: tr('32 kart · 8 dk', '32 cards · 8 min'), front: tr('Lale Devri hangi yıllar arasındadır?', 'When was the Tulip Era?'), back: tr('1718 – 1730', '1718 – 1730'), deck: tr('GK · Tarih', 'GC · History')},
	},
	{
		id: 'sinoai',
		exam: 'kpss',
		module: 'sinoAi',
		group: 'urun',
		stage: 'yeniden pazarlama',
		screen: CHAT_SCREEN,
		headline: tr("KPSS'de takıldığın konuyu sor", 'Ask about any KPSS topic'),
		subline: tr('SinoAI hedefini ve eksiklerini bilerek anlatır.', 'SinoAI explains with your goal and gaps in mind.'),
		proof: {kind: 'chat', question: tr('Anayasa Mahkemesi kaç üyeden oluşur?', 'How many members does the Constitutional Court have?'), answer: tr("15 üyeden. Üyelerin 3'ünü TBMM, 12'sini Cumhurbaşkanı seçer.", 'Fifteen. Parliament elects 3 and the President appoints 12.'), note: tr('Son denemende bu konudan 1 net kaybettin.', 'You lost 1 point on this in your last mock.')},
	},
	{
		id: 'ezber-kartlar',
		exam: 'kpss',
		module: 'flashcards',
		group: 'urun',
		backup: true,
		stage: 'değerlendirme',
		screen: CARD_SCREEN,
		headline: tr('KPSS vatandaşlık kartlarla', 'KPSS civics with cards'),
		subline: tr('Bilgi Kartları maddeleri unutmadan tekrar ettirir.', 'Flashcards bring each card back just before you forget it.'),
		proof: {kind: 'card', title: tr('Bugün tekrar', 'Due today'), meta: tr('30 kart · 8 dk', '30 cards · 8 min'), front: tr('Yasama yetkisi kime aittir?', 'Who holds legislative power?'), back: tr('Türkiye Büyük Millet Meclisi', 'The Grand National Assembly'), deck: tr('GK · Vatandaşlık', 'GC · Civics')},
	},
	{
		id: 'fotograf-cek-coz',
		exam: 'kpss',
		module: 'smartSummary',
		group: 'urun',
		backup: true,
		stage: 'keşif',
		screen: SNAP_SCREEN,
		headline: tr('Çözemediğin KPSS sorusunu çek', 'Stuck? Snap the question'),
		subline: tr('Akıllı Özet adım adım çözer, konusunu söyler.', 'Smart Summary solves it step by step and names the topic.'),
		proof: {kind: 'steps', title: tr('Adım adım çözüm', 'Step-by-step solution'), topic: tr('Sayısal mantık · KPSS GY', 'Numerical reasoning · KPSS'), steps: [tr('Ali x yaşında, babası 3x.', 'Ali is x, his father 3x.'), tr('10 yıl sonra: 3x + 10 = 2(x + 10).', 'In 10 years: 3x + 10 = 2(x + 10).'), tr('x = 10, babası 30 yaşında.', 'x = 10, the father is 30.')], answer: tr('Cevap: 30', 'Answer: 30')},
	},
	// KPSS levels (report §4.6): one picture set per level, the tag names only that level.
	...(['lisans', 'onlisans', 'ortaogretim'] as const).map(
		(level): AdConcept => ({
			id: level,
			exam: 'kpss',
			module: 'exam',
			group: 'duzey',
			stage: 'keşif',
			screen: SCORE_SCREEN,
			headline: {lisans: tr('KPSS Lisans denemesi çöz', 'KPSS Lisans mock'), onlisans: tr('KPSS Önlisans denemesi çöz', 'KPSS Önlisans mock'), ortaogretim: tr('KPSS Ortaöğretim denemesi çöz', 'KPSS Ortaöğretim mock')}[level],
			subline: {
				lisans: tr('GY-GK denemeni çöz; P3 puanını ve eksik konularını gör.', 'See your score and weak topics.'),
				onlisans: tr('Önlisans denemeni çöz; P93 puanını ve eksiklerini gör.', 'See your score and weak topics.'),
				ortaogretim: tr('Ortaöğretim denemeni çöz; P94 puanını ve eksiklerini gör.', 'See your score and weak topics.'),
			}[level],
			proof: {
				kind: 'score',
				title: {lisans: tr('KPSS Lisans Deneme 3', 'Lisans mock 3'), onlisans: tr('KPSS Önlisans Deneme 3', 'Önlisans mock 3'), ortaogretim: tr('KPSS Ortaöğretim Deneme 3', 'Ortaöğretim mock 3')}[level],
				net: {lisans: tr('81,2', '81.2'), onlisans: tr('78,6', '78.6'), ortaogretim: tr('80,4', '80.4')}[level],
				unit: tr('puan', 'pts'),
				delta: tr('+3,4 puan', '+3.4'),
				rank: tr('GY 42 · GK 38 net', 'GA 42 · GC 38'),
				rankOf: tr('', ''),
				rankLabel: {lisans: tr('P3 puanı', 'P3 score'), onlisans: tr('P93 puanı', 'P93 score'), ortaogretim: tr('P94 puanı', 'P94 score')}[level],
			},
		}),
	),
	// ---------------------------------------------------------------- SAT (report §4.3; United States, English)
	{
		id: 'score-gaps',
		exam: 'sat',
		module: 'exam',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: LOSS_SCREEN,
		headline: us('Where did your SAT score drop?'),
		subline: us('See your weak skills by section after every practice test.'),
		proof: {
			kind: 'loss',
			title: us('Points lost by skill'),
			rows: [
				{topic: us('Advanced math'), lesson: us('SAT Math'), loss: us('−40 pts')},
				{topic: us('Words in context'), lesson: us('SAT Reading and Writing'), loss: us('−30 pts')},
				{topic: us('Geometry and trigonometry'), lesson: us('SAT Math'), loss: us('−20 pts')},
			],
		},
	},
	{
		id: 'practice-test',
		exam: 'sat',
		module: 'exam',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: SCORE_SCREEN,
		headline: us('Take a full SAT practice test'),
		subline: us('Timed sections and your score by section right after.'),
		proof: {kind: 'score', title: us('SAT Practice Test 3'), net: us('1,280'), delta: us('+70'), rank: us('650 · 630'), rankOf: us(''), rankLabel: us('Math · Reading and Writing')},
	},
	{
		id: 'study-plan',
		exam: 'sat',
		module: 'studyPlan',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: PLAN_SCREEN,
		headline: us('Your SAT study plan, daily'),
		subline: us('Study Plan turns your weak SAT skills into short daily tasks.'),
		proof: {
			kind: 'tasks',
			title: us("Today's plan"),
			meta: us('3 tasks · 45 min'),
			tasks: [
				{text: us('Linear equations · 20 questions'), sub: us('Quiz · Medium'), module: 'tests', done: true},
				{text: us('Words in context'), sub: us('Lessons · 8 min'), module: 'lessons'},
				{text: us('SAT vocabulary'), sub: us('24 cards · 6 min'), module: 'flashcards'},
			],
		},
	},
	{
		id: 'mistake-review',
		exam: 'sat',
		module: 'tests',
		group: 'urun',
		stage: 'değerlendirme',
		screen: RETAKE_SCREEN,
		headline: us('Retake the SAT questions you missed'),
		shortHeadline: us('Retake your missed SAT Qs'),
		subline: us('Quizzes build a new quiz from the SAT questions you missed.'),
		proof: {kind: 'retake', title: us('Your mistakes, as a quiz'), count: us('12 questions ready'), meta: us('From your last 2 weeks'), topics: [us('Advanced math'), us('Words in context'), us('Geometry')]},
	},
	{
		id: 'snap',
		exam: 'sat',
		module: 'smartSummary',
		group: 'urun',
		stage: 'keşif',
		screen: SNAP_SCREEN,
		headline: us('Stuck? Snap the SAT question'),
		subline: us('Smart Summary solves it step by step and names the skill.'),
		proof: {kind: 'steps', title: us('Step-by-step solution'), topic: us('Linear equations · SAT Math'), steps: [us('3x + 7 = 2x + 12'), us('Subtract 2x from both sides.'), us('x + 7 = 12, so x = 5.')], answer: us('Answer: x = 5')},
	},
	{
		id: 'sinoai',
		exam: 'sat',
		module: 'sinoAi',
		group: 'urun',
		stage: 'yeniden pazarlama',
		screen: CHAT_SCREEN,
		headline: us('Ask SinoAI any SAT topic'),
		subline: us('SinoAI explains with your target score and weak skills in mind.'),
		proof: {kind: 'chat', question: us('When do I use a colon in SAT writing?'), answer: us('After a full sentence, to introduce a list, an example or an explanation.'), note: us('You missed 2 of these in your last practice test.')},
	},
	{
		id: 'fluency',
		exam: 'sat',
		module: 'exam',
		group: 'urun',
		backup: true,
		stage: 'keşif',
		screen: SCORE_SCREEN,
		headline: us('SAT Math, section by section'),
		subline: us('See your SAT Math score by skill after every test.'),
		proof: {kind: 'score', title: us('SAT Math · Practice Test 3'), net: us('650'), delta: us('+40'), rank: us('Algebra 90% · Geometry 70%'), rankOf: us(''), rankLabel: us('Accuracy by skill')},
	},
	{
		id: 'cards',
		exam: 'sat',
		module: 'flashcards',
		group: 'urun',
		backup: true,
		stage: 'değerlendirme',
		screen: CARD_SCREEN,
		headline: us('SAT vocab that sticks'),
		subline: us('Flashcards bring each word back just before you forget it.'),
		proof: {kind: 'card', title: us('Due today'), meta: us('24 cards · 6 min'), front: us('Meaning of "ubiquitous"?'), back: us('Found everywhere'), deck: us('SAT Reading and Writing · Vocabulary')},
	},
	// ---------------------------------------------------------------- ACT (report §4.4; United States, English)
	{
		id: 'score-gaps',
		exam: 'act',
		module: 'exam',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: LOSS_SCREEN,
		headline: us('Where did your ACT score drop?'),
		subline: us('See your weak skills by section after every practice test.'),
		proof: {
			kind: 'loss',
			title: us('Points lost by skill'),
			rows: [
				{topic: us('Algebra'), lesson: us('ACT Math'), loss: us('−3 pts')},
				{topic: us('Punctuation'), lesson: us('ACT English'), loss: us('−2 pts')},
				{topic: us('Data representation'), lesson: us('ACT Science'), loss: us('−2 pts')},
			],
		},
	},
	{
		id: 'practice-test',
		exam: 'act',
		module: 'exam',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: SCORE_SCREEN,
		headline: us('Take a full ACT practice test'),
		subline: us('Timed sections and your composite score right after.'),
		proof: {kind: 'score', title: us('ACT Practice Test 3'), net: us('28'), delta: us('+2'), rank: us('29 · 27'), rankOf: us(''), rankLabel: us('English · Math')},
	},
	{
		id: 'study-plan',
		exam: 'act',
		module: 'studyPlan',
		group: 'urun',
		stage: 'keşif',
		html5: true,
		video: true,
		screen: PLAN_SCREEN,
		headline: us('Your ACT study plan, daily'),
		subline: us('Study Plan turns your weak ACT skills into short daily tasks.'),
		proof: {
			kind: 'tasks',
			title: us("Today's plan"),
			meta: us('3 tasks · 45 min'),
			tasks: [
				{text: us('Algebra · 20 questions'), sub: us('Quiz · Medium'), module: 'tests', done: true},
				{text: us('Punctuation rules'), sub: us('Lessons · 8 min'), module: 'lessons'},
				{text: us('Science vocabulary'), sub: us('20 cards · 6 min'), module: 'flashcards'},
			],
		},
	},
	{
		id: 'mistake-review',
		exam: 'act',
		module: 'tests',
		group: 'urun',
		stage: 'değerlendirme',
		screen: RETAKE_SCREEN,
		headline: us('Retake your missed ACT Qs'),
		subline: us('Quizzes build a new quiz from the ACT questions you missed.'),
		proof: {kind: 'retake', title: us('Your mistakes, as a quiz'), count: us('12 questions ready'), meta: us('From your last 2 weeks'), topics: [us('Algebra'), us('Punctuation'), us('Data representation')]},
	},
	{
		id: 'snap',
		exam: 'act',
		module: 'smartSummary',
		group: 'urun',
		stage: 'keşif',
		screen: SNAP_SCREEN,
		headline: us('Stuck? Snap the ACT question'),
		subline: us('Smart Summary solves it step by step and names the skill.'),
		proof: {kind: 'steps', title: us('Step-by-step solution'), topic: us('Percent change · ACT Math'), steps: [us('Change = 54 − 45 = 9'), us('Divide by the original: 9 ÷ 45 = 0.2'), us('0.2 = 20% increase')], answer: us('Answer: 20%')},
	},
	{
		id: 'sinoai',
		exam: 'act',
		module: 'sinoAi',
		group: 'urun',
		stage: 'yeniden pazarlama',
		screen: CHAT_SCREEN,
		headline: us('Ask SinoAI any ACT topic'),
		subline: us('SinoAI explains with your target score and weak skills in mind.'),
		proof: {kind: 'chat', question: us('How do I read a data table on ACT Science?'), answer: us('Read the labels and units first, then find the trend before the question.'), note: us('You missed 2 of these in your last practice test.')},
	},
	{
		id: 'section-breakdown',
		exam: 'act',
		module: 'exam',
		group: 'urun',
		backup: true,
		stage: 'keşif',
		screen: SCORE_SCREEN,
		headline: us('ACT Science, section by section'),
		shortHeadline: us('ACT Science by section'),
		subline: us('See your ACT Science score by skill after every test.'),
		proof: {kind: 'score', title: us('ACT Science · Practice Test 3'), net: us('27'), delta: us('+2'), rank: us('Data 80% · Experiments 70%'), rankOf: us(''), rankLabel: us('Accuracy by skill')},
	},
	{
		id: 'cards',
		exam: 'act',
		module: 'flashcards',
		group: 'urun',
		backup: true,
		stage: 'değerlendirme',
		screen: CARD_SCREEN,
		headline: us('ACT English rules that stick'),
		subline: us('Flashcards bring each rule back just before you forget it.'),
		proof: {kind: 'card', title: us('Due today'), meta: us('20 cards · 6 min'), front: us('Semicolon or comma?'), back: us('Semicolon joins two full sentences'), deck: us('ACT English · Punctuation')},
	},
];

/**
 * Text assets per exam and promotion, for the Google Ads text fields:
 * headlines 30 characters, long headlines and descriptions 90, the first
 * description 60 (it is the short one some placements need). App campaigns
 * take 5 headlines and 5 descriptions, Performance Max 15 headlines, 5 long
 * headlines and 5 descriptions (report §5.6). "Ücretsiz" / "free" only in
 * the store trial sentence (report §3.1); one apostrophe kind, the straight
 * one (report §3.3).
 */
type AdTextSet = {headlines: string[]; longHeadlines: string[]; descriptions: string[]};

/** One language per exam: the exam's market (EXAM_LANG). Built from searched terms; see the keyword report. */
export const AD_TEXT: Record<AdExam, Record<AdPlatform, AdTextSet>> = {
	yks: {
		mobile: {
			headlines: ['TYT netini nerede kaybettin?', 'YKS çalışma programın hazır', 'TYT konusunu adım adım öğren', 'TYT yanlışların tekrar testi', '3 gün ücretsiz dene'],
			longHeadlines: [],
			descriptions: ['TYT ve AYT denemesi, plan ve dersler tek uygulamada.', 'Her TYT ve AYT denemesinden sonra eksik konularını konu konu gör.', 'Ders Planı eksiklerinden günlük görevler kurar; bugün ne çalışacağını bil.', 'Dersler konuyu adım adım, etkileşimli anlatır; her adımda sen de cevaplarsın.', 'Testler yanlış yaptığın sorulardan yeni bir test kurar; eksiğini kapat.'],
		},
		web: {
			headlines: ['TYT netini nerede kaybettin?', 'Online TYT ve AYT denemesi', 'TYT net hesaplama', 'Türkiye geneli TYT denemesi', 'YKS çalışma programı', 'TYT konuları adım adım', 'TYT yanlışların tekrar testi', 'Çözemediğin soruyu çek', "Takıldığını SinoAI'ye sor", 'AYT formülleri kartlarla', 'TYT ve AYT tek yerde', 'Eksik konunu gör', 'Bugün ne çalışacağını bil', 'Web ve mobilde aynı hesap', "sinavika.com'da başla"],
			longHeadlines: ['Online TYT ve AYT denemesi çöz, netini nerede kaybettiğini gör, eksiğini kapat.', 'Ders Planı TYT ve AYT eksiklerinden günlük görevler kurar; bugün ne çalışacağını bil.', 'Dersler TYT konularını adım adım, etkileşimli anlatır.', 'Türkiye geneli TYT denemelerine katıl; netini ve sıralamanı öğren.', 'Testler yanlış yaptığın sorulardan yeni bir test kurar.'],
			descriptions: ['TYT ve AYT denemesi, plan ve dersler tek yerde.', 'Online TYT ve AYT denemesi çöz; netini hesapla, eksik konularını konu konu gör.', 'Türkiye geneli TYT denemelerine katıl; netini, puanını ve sıralamanı öğren.', 'Web ve mobilde aynı hesap: kaldığın yerden devam et.', "SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com'da başla."],
		},
	},
	kpss: {
		mobile: {
			headlines: ['KPSS puanını nerede kaybettin?', 'KPSS çalışma programın hazır', 'KPSS konusunu adım adım öğren', 'KPSS Önlisans denemesi çöz', '3 gün ücretsiz dene'],
			longHeadlines: [],
			descriptions: ['KPSS deneme, plan ve dersler tek uygulamada.', 'KPSS denemesini çöz; puanını hesapla, GY-GK eksiklerini tek ekranda gör.', 'Ders Planı eksiklerini işten sonra yetişecek kısa günlük görevlere çevirir.', 'Dersler tarih, coğrafya ve vatandaşlığı adım adım, etkileşimli anlatır.', 'Testler yanlış yaptığın sorulardan yeni bir test kurar; eksiğini kapat.'],
		},
		web: {
			headlines: ['KPSS puanını nerede kaybettin?', 'Online KPSS denemesi çöz', 'KPSS net ve puan hesaplama', 'KPSS Lisans denemesi', 'KPSS Önlisans denemesi', 'KPSS Ortaöğretim denemesi', 'KPSS çalışma programı', 'KPSS tarihi adım adım', 'KPSS yanlışların tekrar testi', 'KPSS tarihi kartlarla', "Takıldığını SinoAI'ye sor", 'GY-GK eksiğini gör', 'İşten sonra da hazırlan', 'Web ve mobilde aynı hesap', "sinavika.com'da başla"],
			longHeadlines: ['Online KPSS denemesi çöz, puanını ve GY-GK eksiklerini gör, eksiğini kapat.', 'Ders Planı eksiklerinden kısa günlük görevler kurar; işten sonra da hazırlan.', 'Dersler KPSS tarih, coğrafya ve vatandaşlığı adım adım anlatır.', 'Lisans, Önlisans ve Ortaöğretim için KPSS denemesi çöz.', 'Testler yanlış yaptığın sorulardan yeni bir test kurar.'],
			descriptions: ['KPSS deneme, plan ve dersler tek yerde.', 'Online KPSS denemesi çöz; netini, puanını ve eksik konularını hemen gör.', 'Ders Planı eksiklerinden kısa günlük görevler kurar; işten sonra da hazırlan.', 'Web ve mobilde aynı hesap: kaldığın yerden devam et.', "SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com'da başla."],
		},
	},
	sat: {
		mobile: {
			headlines: ['Where did your SAT score drop?', 'Take a full SAT practice test', 'Your SAT study plan, daily', 'Retake your missed SAT Qs', 'Try it free for 3 days'],
			longHeadlines: [],
			descriptions: ['SAT practice tests, a study plan and lessons in one app.', 'Take a full SAT practice test and see your score and weak skills by section.', 'Study Plan turns your weak SAT skills into short daily tasks.', 'Quizzes build a new quiz from the SAT questions you missed.', 'Smart Summary solves the SAT question you are stuck on step by step.'],
		},
		web: {
			headlines: ['Where did your SAT score drop?', 'SAT practice test online', 'Take a full SAT practice test', 'Digital SAT prep', 'SAT score by section', 'Your SAT study plan, daily', 'Retake your missed SAT Qs', 'Stuck? Snap the SAT question', 'Ask SinoAI any SAT topic', 'SAT Math, section by section', 'SAT vocab that sticks', 'Know what to study today', 'One account, web and mobile', 'Timed SAT sections', 'Start at sinavika.com'],
			longHeadlines: ['Take an SAT practice test online, see where your score drops, then fix it.', 'Study Plan turns your weak SAT skills into short daily tasks.', 'Timed SAT sections and your score by section right after.', 'Quizzes build a new quiz from the SAT questions you missed.', 'SinoAI explains any SAT topic with your target score in mind.'],
			descriptions: ['SAT practice tests, a study plan and lessons in one place.', 'Take an SAT practice test online and see your score by section right away.', 'Study Plan turns your weak SAT skills into short daily tasks.', 'One account on web and mobile: pick up where you left off.', 'SinoAI explains with your target score in mind. Start at sinavika.com.'],
		},
	},
	act: {
		mobile: {
			headlines: ['Where did your ACT score drop?', 'Take a full ACT practice test', 'Your ACT study plan, daily', 'Retake your missed ACT Qs', 'Try it free for 3 days'],
			longHeadlines: [],
			descriptions: ['ACT practice tests, a study plan and lessons in one app.', 'Take a full ACT practice test and see your composite and weak skills.', 'Study Plan turns your weak ACT skills into short daily tasks.', 'Quizzes build a new quiz from the ACT questions you missed.', 'Smart Summary solves the ACT question you are stuck on step by step.'],
		},
		web: {
			headlines: ['Where did your ACT score drop?', 'ACT practice test online', 'Take a full ACT practice test', 'ACT prep, section by section', 'ACT composite by section', 'Your ACT study plan, daily', 'Retake your missed ACT Qs', 'Stuck? Snap the ACT question', 'Ask SinoAI any ACT topic', 'ACT Science by section', 'ACT English rules that stick', 'Know what to study today', 'One account, web and mobile', 'Timed ACT sections', 'Start at sinavika.com'],
			longHeadlines: ['Take an ACT practice test online, see where your score drops, then fix it.', 'Study Plan turns your weak ACT skills into short daily tasks.', 'Timed ACT sections and your composite score right after.', 'Quizzes build a new quiz from the ACT questions you missed.', 'SinoAI explains any ACT topic with your target score in mind.'],
			descriptions: ['ACT practice tests, a study plan and lessons in one place.', 'Take an ACT practice test online and see your composite right away.', 'Study Plan turns your weak ACT skills into short daily tasks.', 'One account on web and mobile: pick up where you left off.', 'SinoAI explains with your target score in mind. Start at sinavika.com.'],
		},
	},
};

export const TEXT_LIMITS = {headline: 30, longHeadline: 90, description: 90, shortDescription: 60} as const;

/** Every concept of an exam: the product group, the Dersler showcase, the KPSS levels and the backups. */
export const conceptsFor = (exam: AdExam): AdConcept[] => AD_CONCEPTS.filter((concept) => concept.exam === exam);
/** The six main product concepts of an exam (report §4), in order. */
export const mainConceptsFor = (exam: AdExam): AdConcept[] => conceptsFor(exam).filter((concept) => concept.group === 'urun' && !concept.backup);
/** The concepts that carry an HTML5 banner (report §5.3: three per exam in the product group). */
export const html5ConceptsFor = (exam: AdExam): AdConcept[] => conceptsFor(exam).filter((concept) => concept.html5);
/** Web banners carry the exam's first three main concepts (report §5.4). */
export const displayConceptsFor = (exam: AdExam): AdConcept[] => mainConceptsFor(exam).slice(0, 3);
export const findConcept = (exam: AdExam, id: string): AdConcept => {
	const concept = AD_CONCEPTS.find((entry) => entry.exam === exam && entry.id === id);
	if (!concept) throw new Error(`Bilinmeyen reklam konsepti: ${exam}/${id}`);
	return concept;
};
