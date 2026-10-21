/**
 * The Google Ads plan for Sınavika: one source for the concepts, the proof on
 * each picture, the text assets and the formats. The pictures
 * (GoogleAdImage), the HTML5 banners and the content plan all read it
 * (docs/GoogleAds/Icerik-Plani.md).
 *
 * Audience: students only, no parents. Two markets, each in its own language
 * and folder: Turkey in Turkish (YKS, KPSS) and the United States in English
 * (SAT, ACT). Two promotions: the mobile app and the web site.
 *
 * Every hook names its exam and is built from searched terms (Google Keyword
 * Planner, Oct 2026; docs/GoogleAds/Anahtar-Kelime-ve-Kanca-Kurallari.md), and
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

/** Where a market's web ads land. */
export const EXAM_LANDING: Record<AdExam, string> = {
	kpss: 'https://sinavika.com/tr/kpss-deneme-sinavi',
	yks: 'https://sinavika.com/tr/yks-deneme-sinavi',
	sat: 'https://sinavika.com/en/sat-hazirlik',
	act: 'https://sinavika.com/en/act-hazirlik',
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
	| {kind: 'score'; title: Copy; net: Copy; delta: Copy; rank: Copy; rankOf: Copy; rankLabel: Copy}
	| {kind: 'card'; title: Copy; meta: Copy; front: Copy; back: Copy; deck: Copy}
	| {kind: 'chat'; question: Copy; answer: Copy; note: Copy};

export type AdConcept = {
	/** Folder-safe id, unique within the exam. */
	id: string;
	exam: AdExam;
	module: ModuleKey;
	/** Short hook, the main line on the picture (also an ad headline: 30 characters at most). */
	headline: Copy;
	/** One supporting sentence under the hook. */
	subline: Copy;
	proof: AdProof;
	/** Where it sits in the funnel. */
	stage: 'keşif' | 'değerlendirme' | 'yeniden pazarlama';
	/** This concept carries the HTML5 banner of its exam. */
	html5?: boolean;
};

/** The line under the copy that says where the student goes (no button shapes on pictures). */
export const PLATFORM_LINE: Record<AdPlatform, Copy> = {
	mobile: {tr: 'iOS ve Android’de ücretsiz indir', en: 'Free on iOS and Android'},
	web: {tr: 'sinavika.com’da ücretsiz başla', en: 'Start free at sinavika.com'},
};

/** The HTML5 call to action (the whole banner is the click; the button only says where it goes). */
export const PLATFORM_CTA: Record<AdPlatform, Copy> = {
	mobile: {tr: 'Ücretsiz indir', en: 'Get it free'},
	web: {tr: 'Ücretsiz başla', en: 'Start free'},
};

export const AD_CONCEPTS: readonly AdConcept[] = [
	// ---------------------------------------------------------------- YKS
	{
		id: 'net-kaybi',
		exam: 'yks',
		module: 'exam',
		stage: 'keşif',
		html5: true,
		headline: {tr: 'TYT netini nerede kaybettin?', en: 'Where did you lose points?'},
		subline: {tr: 'Her TYT ve AYT denemesinden sonra netini hesapla, eksik konunu gör.', en: 'See your gaps topic by topic after every mock exam.'},
		proof: {
			kind: 'loss',
			title: {tr: 'En çok net kaybettiğin konular', en: 'Where you lost the most'},
			rows: [
				{topic: {tr: 'Problemler', en: 'Problems'}, lesson: {tr: 'TYT Matematik', en: 'TYT Maths'}, loss: {tr: '−3,25 net', en: '−3.25'}},
				{topic: {tr: 'Paragraf', en: 'Reading'}, lesson: {tr: 'TYT Türkçe', en: 'TYT Turkish'}, loss: {tr: '−2,5 net', en: '−2.5'}},
				{topic: {tr: 'Kuvvet ve hareket', en: 'Force and motion'}, lesson: {tr: 'TYT Fizik', en: 'TYT Physics'}, loss: {tr: '−1,75 net', en: '−1.75'}},
			],
		},
	},
	{
		id: 'bugun-ne-calisayim',
		exam: 'yks',
		module: 'studyPlan',
		stage: 'keşif',
		headline: {tr: 'YKS çalışma programın hazır.', en: 'Know what to study today.'},
		subline: {tr: 'Ders Planı TYT ve AYT eksiklerinden günlük görevler kurar.', en: 'Study Plan turns your gaps into daily tasks.'},
		proof: {
			kind: 'tasks',
			title: {tr: 'Bugünün planı', en: 'Today’s plan'},
			meta: {tr: '3 görev · 45 dk', en: '3 tasks · 45 min'},
			tasks: [
				{text: {tr: 'Paragraf · ana fikir', en: 'Reading · main idea'}, sub: {tr: 'Mikro ders · 8 dk', en: 'Micro-lesson · 8 min'}, module: 'lessons', done: true},
				{text: {tr: 'Problemler · 10 soru', en: 'Problems · 10 questions'}, sub: {tr: 'Test · seviye 2', en: 'Quiz · level 2'}, module: 'tests'},
				{text: {tr: 'Kimya · mol kartları', en: 'Chemistry · mole cards'}, sub: {tr: '20 kart · 6 dk', en: '20 cards · 6 min'}, module: 'flashcards'},
			],
		},
	},
	{
		id: 'fotograf-cek-coz',
		exam: 'yks',
		module: 'smartSummary',
		stage: 'keşif',
		headline: {tr: 'Çözemediğin TYT sorusunu çek.', en: 'Stuck? Snap the question.'},
		subline: {tr: 'Akıllı Özet adım adım çözer, konusunu söyler.', en: 'Smart Summary solves it step by step and names the topic.'},
		proof: {
			kind: 'steps',
			title: {tr: 'Adım adım çözüm', en: 'Step-by-step solution'},
			topic: {tr: 'Oran ve orantı · TYT Matematik', en: 'Ratio · TYT Maths'},
			steps: [
				{tr: 'Kız ve erkek sayısı 3k ve 5k olsun.', en: 'Let girls and boys be 3k and 5k.'},
				{tr: '5k − 3k = 12 ise k = 6.', en: '5k − 3k = 12, so k = 6.'},
				{tr: 'Sınıf mevcudu 8k = 48.', en: 'Class size 8k = 48.'},
			],
			answer: {tr: 'Cevap: 48', en: 'Answer: 48'},
		},
	},
	{
		id: 'turkiye-geneli-deneme',
		exam: 'yks',
		module: 'exam',
		stage: 'değerlendirme',
		headline: {tr: 'Türkiye geneli TYT denemesi', en: 'See where you rank nationwide.'},
		subline: {tr: 'Canlı denemeye katıl; netini, puanını ve Türkiye sıralamanı öğren.', en: 'Join a live mock exam and get your score and rank.'},
		proof: {
			kind: 'score',
			title: {tr: 'TYT Deneme 4', en: 'TYT Mock 4'},
			net: {tr: '78,5', en: '78.5'},
			delta: {tr: '+6,5 net', en: '+6.5'},
			rank: {tr: '8.214', en: '8,214'},
			rankOf: {tr: '/ 12.480', en: '/ 12,480'},
			rankLabel: {tr: 'Türkiye sıralaman', en: 'Your national rank'},
		},
	},
	// ---------------------------------------------------------------- KPSS
	{
		id: 'puan-kaybi',
		exam: 'kpss',
		module: 'exam',
		stage: 'keşif',
		html5: true,
		headline: {tr: 'KPSS puanını nerede kaybettin?', en: 'Where did your score slip?'},
		subline: {tr: 'KPSS denemeni çöz; puanını hesapla, eksik konunu tek ekranda gör.', en: 'See your weak KPSS topics on one screen.'},
		proof: {
			kind: 'loss',
			title: {tr: 'En çok net kaybettiğin konular', en: 'Where you lost the most'},
			rows: [
				{topic: {tr: 'Osmanlı kültür ve medeniyeti', en: 'Ottoman culture'}, lesson: {tr: 'GK · Tarih', en: 'GC · History'}, loss: {tr: '−2,5 net', en: '−2.5'}},
				{topic: {tr: 'Sayısal mantık', en: 'Numerical reasoning'}, lesson: {tr: 'GY · Matematik', en: 'GA · Maths'}, loss: {tr: '−2 net', en: '−2'}},
				{topic: {tr: 'Temel haklar', en: 'Fundamental rights'}, lesson: {tr: 'GK · Vatandaşlık', en: 'GC · Civics'}, loss: {tr: '−1,25 net', en: '−1.25'}},
			],
		},
	},
	{
		id: 'isten-sonra-plan',
		exam: 'kpss',
		module: 'studyPlan',
		stage: 'keşif',
		headline: {tr: 'KPSS çalışma programın hazır.', en: 'Prepare after work, too.'},
		subline: {tr: 'Ders Planı günü kısa görevlere böler; işten sonra da yetişir.', en: 'Study Plan splits your day into short tasks.'},
		proof: {
			kind: 'tasks',
			title: {tr: 'Bugünün planı', en: 'Today’s plan'},
			meta: {tr: '3 görev · 40 dk', en: '3 tasks · 40 min'},
			tasks: [
				{text: {tr: 'Paragraf · 10 soru', en: 'Reading · 10 questions'}, sub: {tr: 'Test · seviye 3', en: 'Quiz · level 3'}, module: 'tests', done: true},
				{text: {tr: 'Tarih · Lale Devri', en: 'History · Tulip Era'}, sub: {tr: '24 kart · 8 dk', en: '24 cards · 8 min'}, module: 'flashcards'},
				{text: {tr: 'Coğrafya · iklim tipleri', en: 'Geography · climates'}, sub: {tr: 'Mikro ders · 12 dk', en: 'Micro-lesson · 12 min'}, module: 'lessons'},
			],
		},
	},
	{
		id: 'genel-kultur-kartlar',
		exam: 'kpss',
		module: 'flashcards',
		stage: 'değerlendirme',
		headline: {tr: 'KPSS tarihi aklında kalsın.', en: 'Make general culture stick.'},
		subline: {tr: 'Bilgi Kartları unutmak üzere olduğun kartı tam zamanında getirir.', en: 'Flashcards bring each card back just before you forget it.'},
		proof: {
			kind: 'card',
			title: {tr: 'Bugün tekrar', en: 'Due today'},
			meta: {tr: '32 kart · 8 dk', en: '32 cards · 8 min'},
			front: {tr: 'Lale Devri hangi yıllar arasındadır?', en: 'When was the Tulip Era?'},
			back: {tr: '1718 – 1730', en: '1718 – 1730'},
			deck: {tr: 'GK · Tarih', en: 'GC · History'},
		},
	},
	{
		id: 'sinoai-sor',
		exam: 'kpss',
		module: 'sinoAi',
		stage: 'yeniden pazarlama',
		headline: {tr: 'KPSS’de takıldığın konuyu sor', en: 'Stuck? Ask SinoAI.'},
		subline: {tr: 'SinoAI hedefini ve eksiklerini bilerek anlatır.', en: 'SinoAI explains with your goal and gaps in mind.'},
		proof: {
			kind: 'chat',
			question: {tr: 'Anayasa Mahkemesi kaç üyeden oluşur?', en: 'How many members does the Constitutional Court have?'},
			answer: {tr: '15 üyeden. Üyelerin 3’ünü TBMM, 12’sini Cumhurbaşkanı seçer.', en: '15. Parliament elects 3 of them and the President appoints 12.'},
			note: {tr: 'Son denemende bu konudan 1 net kaybettin.', en: 'You lost 1 point on this in your last mock.'},
		},
	},
	// ---------------------------------------------------------------- SAT (United States, English)
	{
		id: 'sat-score-gaps',
		exam: 'sat',
		module: 'exam',
		stage: 'keşif',
		html5: true,
		headline: us('Where did your SAT score drop?'),
		subline: us('Take an SAT practice test and see your weak skills by section.'),
		proof: {
			kind: 'loss',
			title: us('Where you lost the most'),
			rows: [
				{topic: us('Advanced math'), lesson: us('SAT Math'), loss: us('−40 pts')},
				{topic: us('Words in context'), lesson: us('SAT Reading and Writing'), loss: us('−30 pts')},
				{topic: us('Geometry and trigonometry'), lesson: us('SAT Math'), loss: us('−20 pts')},
			],
		},
	},
	{
		id: 'sat-study-plan',
		exam: 'sat',
		module: 'studyPlan',
		stage: 'keşif',
		headline: us('Your SAT study plan, daily.'),
		subline: us('Study Plan turns your weak SAT skills into short daily tasks.'),
		proof: {
			kind: 'tasks',
			title: us('Today’s plan'),
			meta: us('3 tasks · 40 min'),
			tasks: [
				{text: us('Linear equations · 10 questions'), sub: us('Quiz · level 2'), module: 'tests', done: true},
				{text: us('Words in context'), sub: us('Micro-lesson · 8 min'), module: 'lessons'},
				{text: us('SAT vocabulary'), sub: us('24 cards · 6 min'), module: 'flashcards'},
			],
		},
	},
	{
		id: 'sat-snap',
		exam: 'sat',
		module: 'smartSummary',
		stage: 'değerlendirme',
		headline: us('Stuck? Snap the SAT question.'),
		subline: us('Smart Summary solves it step by step and names the skill.'),
		proof: {
			kind: 'steps',
			title: us('Step-by-step solution'),
			topic: us('Linear equations · SAT Math'),
			steps: [us('3x + 7 = 2x + 12'), us('Subtract 2x from both sides.'), us('x + 7 = 12, so x = 5.')],
			answer: us('Answer: x = 5'),
		},
	},
	{
		id: 'sat-sinoai',
		exam: 'sat',
		module: 'sinoAi',
		stage: 'yeniden pazarlama',
		headline: us('Ask SinoAI any SAT topic.'),
		subline: us('SinoAI explains with your target score and weak skills in mind.'),
		proof: {
			kind: 'chat',
			question: us('When do I use a colon in SAT writing?'),
			answer: us('After a full sentence, to introduce a list, an example or an explanation.'),
			note: us('You missed 2 of these in your last practice test.'),
		},
	},
	// ---------------------------------------------------------------- ACT (United States, English)
	{
		id: 'act-score-gaps',
		exam: 'act',
		module: 'exam',
		stage: 'keşif',
		html5: true,
		headline: us('Where did your ACT score drop?'),
		subline: us('Take an ACT practice test and see your weak skills by section.'),
		proof: {
			kind: 'loss',
			title: us('Where you lost the most'),
			rows: [
				{topic: us('Algebra'), lesson: us('ACT Math'), loss: us('−3 pts')},
				{topic: us('Punctuation'), lesson: us('ACT English'), loss: us('−2 pts')},
				{topic: us('Data representation'), lesson: us('ACT Science'), loss: us('−2 pts')},
			],
		},
	},
	{
		id: 'act-study-plan',
		exam: 'act',
		module: 'studyPlan',
		stage: 'keşif',
		headline: us('Your ACT study plan, daily.'),
		subline: us('Study Plan turns your weak ACT skills into short daily tasks.'),
		proof: {
			kind: 'tasks',
			title: us('Today’s plan'),
			meta: us('3 tasks · 45 min'),
			tasks: [
				{text: us('Algebra · 10 questions'), sub: us('Quiz · level 2'), module: 'tests', done: true},
				{text: us('Punctuation rules'), sub: us('Micro-lesson · 8 min'), module: 'lessons'},
				{text: us('Science vocabulary'), sub: us('20 cards · 6 min'), module: 'flashcards'},
			],
		},
	},
	{
		id: 'act-snap',
		exam: 'act',
		module: 'smartSummary',
		stage: 'değerlendirme',
		headline: us('Stuck? Snap the ACT question.'),
		subline: us('Smart Summary solves it step by step and names the skill.'),
		proof: {
			kind: 'steps',
			title: us('Step-by-step solution'),
			topic: us('Percent change · ACT Math'),
			steps: [us('Change = 54 − 45 = 9'), us('Divide by the original: 9 ÷ 45 = 0.2'), us('0.2 = 20% increase')],
			answer: us('Answer: 20%'),
		},
	},
	{
		id: 'act-sinoai',
		exam: 'act',
		module: 'sinoAi',
		stage: 'yeniden pazarlama',
		headline: us('Ask SinoAI any ACT topic.'),
		subline: us('SinoAI explains with your target score and weak skills in mind.'),
		proof: {
			kind: 'chat',
			question: us('How do I read a data table on ACT Science?'),
			answer: us('Read the labels and units first, then find the trend before the question.'),
			note: us('You missed 2 of these in your last practice test.'),
		},
	},
];

/**
 * Text assets per exam and promotion, for the Google Ads text fields:
 * headlines 30 characters, long headlines and descriptions 90, the first
 * description 60 (it is the short one some placements need).
 */
export type AdTextSet = {headlines: string[]; longHeadlines: string[]; descriptions: string[]};

/** One language per exam: the exam's market (EXAM_LANG). Built from searched terms; see the keyword report. */
export const AD_TEXT: Record<AdExam, Record<AdPlatform, AdTextSet>> = {
	yks: {
		mobile: {
			headlines: ['TYT netini nerede kaybettin?', 'TYT ve AYT denemesi çöz', 'YKS çalışma programın hazır', 'Çözemediğin TYT sorusunu çek', 'Sınavika’yı ücretsiz indir'],
			longHeadlines: ['TYT ve AYT denemeni çöz, netini nerede kaybettiğini gör, bugün ne çalışacağını bil.'],
			descriptions: ['TYT ve AYT denemesi, plan ve SinoAI tek uygulamada.', 'Her TYT ve AYT denemesinden sonra netini hesapla, eksik konularını konu konu gör.', 'Ders Planı eksiklerinden günlük görevler kurar; bugün ne çalışacağını bil.', 'Akıllı Özet çözemediğin soruyu adım adım çözer ve konusunu söyler.', 'Türkiye geneli TYT denemelerine katıl; netini ve sıralamanı öğren.'],
		},
		web: {
			headlines: ['TYT netini nerede kaybettin?', 'Online TYT ve AYT denemesi', 'TYT net hesaplama', 'Türkiye geneli TYT denemesi', 'Ücretsiz başla'],
			longHeadlines: ['Online TYT ve AYT denemesi çöz, netini nerede kaybettiğini gör, eksiğini kapat.'],
			descriptions: ['TYT ve AYT denemesi, plan ve SinoAI tek yerde.', 'Online TYT ve AYT denemesi çöz; netini hesapla, eksik konularını konu konu gör.', 'Türkiye geneli TYT denemelerine katıl; netini, puanını ve sıralamanı öğren.', 'Web’de ve mobilde aynı hesap: kaldığın yerden devam et.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com’da ücretsiz başla.'],
		},
	},
	kpss: {
		mobile: {
			headlines: ['KPSS puanını nerede kaybettin?', 'KPSS denemeni çöz, puanını gör', 'KPSS çalışma programın hazır', 'Lisans, önlisans, ortaöğretim', 'Sınavika’yı ücretsiz indir'],
			longHeadlines: ['KPSS denemeni çöz, puanını ve eksik konularını gör; her gün kısa görevlerle hazırlan.'],
			descriptions: ['KPSS deneme, plan ve kartlar tek uygulamada.', 'KPSS denemesini çöz; puanını hesapla, eksik konularını tek ekranda gör.', 'Ders Planı eksiklerini işten sonra yetişecek kısa günlük görevlere çevirir.', 'Bilgi Kartları tarih, coğrafya ve vatandaşlığı unutmak üzereyken tekrar ettirir.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. Takıldığın konuyu sor!'],
		},
		web: {
			headlines: ['KPSS puanını nerede kaybettin?', 'Online KPSS denemesi çöz', 'KPSS net ve puan hesaplama', 'Lisans, önlisans, ortaöğretim', 'Ücretsiz başla'],
			longHeadlines: ['Online KPSS denemesi çöz, puanını ve eksik konularını gör: Sınavika ile KPSS’ye hazırlan.'],
			descriptions: ['KPSS deneme, plan ve kartlar tek yerde.', 'Online KPSS denemesi çöz; netini, puanını ve eksik konularını hemen gör.', 'Ders Planı eksiklerinden kısa günlük görevler kurar; işten sonra da hazırlan.', 'Web’de ve mobilde aynı hesap: kaldığın yerden devam et.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com’da ücretsiz başla.'],
		},
	},
	sat: {
		mobile: {
			headlines: ['Where did your SAT score drop?', 'Take an SAT practice test', 'Your SAT study plan, daily', 'Stuck? Snap the SAT question', 'Get Sınavika for free'],
			longHeadlines: ['Take an SAT practice test, see where your score drops and know what to study today.'],
			descriptions: ['SAT practice tests, a study plan and SinoAI in one app.', 'Take an SAT practice test and see your score and weak skills by section.', 'Study Plan turns your weak SAT skills into short daily tasks.', 'Smart Summary solves the SAT question you’re stuck on step by step.', 'SinoAI explains with your target score and weak skills in mind.'],
		},
		web: {
			headlines: ['Where did your SAT score drop?', 'SAT practice test online', 'Digital SAT prep', 'SAT score by section', 'Start for free'],
			longHeadlines: ['Take an SAT practice test online, see where your score drops, then fix it.'],
			descriptions: ['SAT practice tests, a study plan and SinoAI in one place.', 'Take an SAT practice test online and see your score by section right away.', 'Study Plan turns your weak SAT skills into short daily tasks.', 'One account on web and mobile: pick up where you left off.', 'SinoAI explains with your target score in mind. Start free at sinavika.com.'],
		},
	},
	act: {
		mobile: {
			headlines: ['Where did your ACT score drop?', 'Take an ACT practice test', 'Your ACT study plan, daily', 'Stuck? Snap the ACT question', 'Get Sınavika for free'],
			longHeadlines: ['Take an ACT practice test, see where your score drops and know what to study today.'],
			descriptions: ['ACT practice tests, a study plan and SinoAI in one app.', 'Take an ACT practice test and see your score and weak skills by section.', 'Study Plan turns your weak ACT skills into short daily tasks.', 'Smart Summary solves the ACT question you’re stuck on step by step.', 'SinoAI explains with your target score and weak skills in mind.'],
		},
		web: {
			headlines: ['Where did your ACT score drop?', 'ACT practice test online', 'ACT prep, section by section', 'ACT score by section', 'Start for free'],
			longHeadlines: ['Take an ACT practice test online, see where your score drops, then fix it.'],
			descriptions: ['ACT practice tests, a study plan and SinoAI in one place.', 'Take an ACT practice test online and see your score by section right away.', 'Study Plan turns your weak ACT skills into short daily tasks.', 'One account on web and mobile: pick up where you left off.', 'SinoAI explains with your target score in mind. Start free at sinavika.com.'],
		},
	},
};

export const TEXT_LIMITS = {headline: 30, longHeadline: 90, description: 90, shortDescription: 60} as const;

export const conceptsFor = (exam: AdExam): AdConcept[] => AD_CONCEPTS.filter((concept) => concept.exam === exam);
/** Banners carry the exam's two discovery concepts: small slots need the clearest hooks. */
export const displayConceptsFor = (exam: AdExam): AdConcept[] => conceptsFor(exam).slice(0, 2);
export const findConcept = (exam: AdExam, id: string): AdConcept => {
	const concept = AD_CONCEPTS.find((entry) => entry.exam === exam && entry.id === id);
	if (!concept) throw new Error(`Bilinmeyen reklam konsepti: ${exam}/${id}`);
	return concept;
};
