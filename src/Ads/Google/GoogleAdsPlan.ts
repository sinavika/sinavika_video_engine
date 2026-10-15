/**
 * The Google Ads plan for Sınavika: one source for the concepts, the proof on
 * each picture, the text assets and the formats. The pictures
 * (GoogleAdImage), the HTML5 banners and the content plan all read it
 * (docs/GoogleAds/Icerik-Plani.md).
 *
 * Audience: students only (YKS and KPSS), no parents. Two promotions: the
 * mobile app and the web site. Turkish and English.
 */
import type {ModuleKey} from '../../UIUX/ModuleIdentity';

export type AdLang = 'tr' | 'en';
export type AdExam = 'yks' | 'kpss';
export type AdPlatform = 'mobile' | 'web';
export type AdFormat = 'yatay' | 'kare' | 'dikey';
type Copy = Record<AdLang, string>;

export const AD_LANGS: readonly AdLang[] = ['tr', 'en'];
export const AD_EXAMS: readonly AdExam[] = ['yks', 'kpss'];
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
		headline: {tr: 'Netini nerede kaybettin?', en: 'Where did you lose points?'},
		subline: {tr: 'Her denemeden sonra eksiklerini konu konu gör, planına ekle.', en: 'See your gaps topic by topic after every mock exam.'},
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
		headline: {tr: 'Bugün ne çalışacağını bil.', en: 'Know what to study today.'},
		subline: {tr: 'Ders Planı eksiklerinden günlük görevler kurar.', en: 'Study Plan turns your gaps into daily tasks.'},
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
		headline: {tr: 'Çözemediğin soruyu çek.', en: 'Stuck? Snap the question.'},
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
		headline: {tr: 'Türkiye genelinde yerini gör.', en: 'See where you rank nationwide.'},
		subline: {tr: 'Canlı denemeye katıl; netini, puanını ve sıralamanı öğren.', en: 'Join a live mock exam and get your score and rank.'},
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
		headline: {tr: 'Puanını nerede kaybettin?', en: 'Where did your score slip?'},
		subline: {tr: 'GY-GK denemelerinde eksik konunu tek ekranda gör.', en: 'See your weak KPSS topics on one screen.'},
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
		headline: {tr: 'İşten sonra da hazırlan.', en: 'Prepare after work, too.'},
		subline: {tr: 'Ders Planı günü kısa görevlere böler; ne çalışacağın hazır.', en: 'Study Plan splits your day into short tasks.'},
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
		headline: {tr: 'Genel kültür aklında kalsın.', en: 'Make general culture stick.'},
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
		headline: {tr: 'Takıldığın konuyu sor!', en: 'Stuck? Ask SinoAI.'},
		subline: {tr: 'SinoAI hedefini ve eksiklerini bilerek anlatır.', en: 'SinoAI explains with your goal and gaps in mind.'},
		proof: {
			kind: 'chat',
			question: {tr: 'Anayasa Mahkemesi kaç üyeden oluşur?', en: 'How many members does the Constitutional Court have?'},
			answer: {tr: '15 üyeden. Üyelerin 3’ünü TBMM, 12’sini Cumhurbaşkanı seçer.', en: '15. Parliament elects 3 of them and the President appoints 12.'},
			note: {tr: 'Son denemende bu konudan 1 net kaybettin.', en: 'You lost 1 point on this in your last mock.'},
		},
	},
];

/**
 * Text assets per exam and promotion, for the Google Ads text fields:
 * headlines 30 characters, long headlines and descriptions 90, the first
 * description 60 (it is the short one some placements need).
 */
export type AdTextSet = {headlines: string[]; longHeadlines: string[]; descriptions: string[]};

export const AD_TEXT: Record<AdExam, Record<AdPlatform, Record<AdLang, AdTextSet>>> = {
	yks: {
		mobile: {
			tr: {
				headlines: ['Netini nerede kaybettin?', 'Bugün ne çalışacağını bil.', 'Çözemediğin soruyu çek.', 'TYT ve AYT denemeleri', 'Sınavika’yı ücretsiz indir'],
				longHeadlines: ['Netini nerede kaybettiğini gör, bugün ne çalışacağını bil.'],
				descriptions: ['Deneme, plan ve SinoAI tek uygulamada.', 'Her denemeden sonra eksik konularını gör; Ders Planı onları günlük görevlere çevirir.', 'Akıllı Özet çözemediğin soruyu adım adım çözer ve konusunu söyler.', 'Türkiye geneli denemelere katıl; netini, puanını ve sıralamanı öğren.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. Takıldığın konuyu sor!'],
			},
			en: {
				headlines: ['Where did you lose points?', 'Know what to study today.', 'Stuck? Snap the question.', 'TYT and AYT mock exams', 'Get Sınavika for free'],
				longHeadlines: ['See where you lose points and know what to study today.'],
				descriptions: ['Mock exams, a plan and SinoAI in one app.', 'See your weak topics after every mock exam; Study Plan turns them into daily tasks.', 'Smart Summary solves the question you’re stuck on step by step and names the topic.', 'Join nationwide mock exams and get your score and rank.', 'SinoAI explains with your goal and gaps in mind. Ask about what you’re stuck on!'],
			},
		},
		web: {
			tr: {
				headlines: ['Netini nerede kaybettin?', 'Bugün ne çalışacağını bil.', 'TYT ve AYT denemeleri', 'Türkiye genelinde yerini gör', 'Ücretsiz başla'],
				longHeadlines: ['Netini nerede kaybettiğini gör, bugün ne çalışacağını bil: Sınavika ile YKS’ye hazırlan.'],
				descriptions: ['Deneme, plan ve SinoAI tek yerde.', 'Her denemeden sonra eksik konularını gör; Ders Planı onları günlük görevlere çevirir.', 'Türkiye geneli denemelere katıl; netini, puanını ve sıralamanı öğren.', 'Web’de ve mobilde aynı hesap: kaldığın yerden devam et.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com’da ücretsiz başla.'],
			},
			en: {
				headlines: ['Where did you lose points?', 'Know what to study today.', 'TYT and AYT mock exams', 'See your national rank', 'Start for free'],
				longHeadlines: ['See where you lose points and know what to study today: prepare for YKS with Sınavika.'],
				descriptions: ['Mock exams, a plan and SinoAI in one place.', 'See your weak topics after every mock exam; Study Plan turns them into daily tasks.', 'Join nationwide mock exams and get your score and rank.', 'One account on web and mobile: pick up where you left off.', 'SinoAI explains with your goal and gaps in mind. Start free at sinavika.com.'],
			},
		},
	},
	kpss: {
		mobile: {
			tr: {
				headlines: ['Puanını nerede kaybettin?', 'İşten sonra da hazırlan.', 'Genel kültür aklında kalsın.', 'KPSS GY-GK denemeleri', 'Sınavika’yı ücretsiz indir'],
				longHeadlines: ['GY-GK’da eksiğini gör, her gün kısa görevlerle KPSS’ye hazırlan.'],
				descriptions: ['Deneme, plan ve kartlar tek uygulamada.', 'GY-GK denemelerinden sonra eksik konularını gör; Ders Planı onları kısa görevlere çevirir.', 'Bilgi Kartları tarih, coğrafya ve vatandaşlığı unutmak üzereyken tekrar ettirir.', 'Çalışırken de hazırlan: günlük plan kısa parçalar halinde, telefonunda.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. Takıldığın konuyu sor!'],
			},
			en: {
				headlines: ['Where did your score slip?', 'Prepare after work, too.', 'Make general culture stick.', 'KPSS mock exams', 'Get Sınavika for free'],
				longHeadlines: ['See your weak KPSS topics and prepare every day in short tasks.'],
				descriptions: ['Mock exams, a plan and cards in one app.', 'See your weak topics after every KPSS mock; Study Plan turns them into short tasks.', 'Flashcards bring back history, geography and civics just before you forget them.', 'Prepare while you work: a daily plan in short pieces, on your phone.', 'SinoAI explains with your goal and gaps in mind. Ask about what you’re stuck on!'],
			},
		},
		web: {
			tr: {
				headlines: ['Puanını nerede kaybettin?', 'İşten sonra da hazırlan.', 'KPSS GY-GK denemeleri', 'Genel kültür aklında kalsın.', 'Ücretsiz başla'],
				longHeadlines: ['GY-GK’da eksiğini gör, her gün kısa görevlerle KPSS’ye hazırlan: Sınavika.'],
				descriptions: ['Deneme, plan ve kartlar tek yerde.', 'GY-GK denemelerinden sonra eksik konularını gör; Ders Planı onları kısa görevlere çevirir.', 'Bilgi Kartları tarih, coğrafya ve vatandaşlığı unutmak üzereyken tekrar ettirir.', 'Web’de ve mobilde aynı hesap: kaldığın yerden devam et.', 'SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com’da ücretsiz başla.'],
			},
			en: {
				headlines: ['Where did your score slip?', 'Prepare after work, too.', 'KPSS mock exams', 'Make general culture stick.', 'Start for free'],
				longHeadlines: ['See your weak KPSS topics and prepare every day in short tasks with Sınavika.'],
				descriptions: ['Mock exams, a plan and cards in one place.', 'See your weak topics after every KPSS mock; Study Plan turns them into short tasks.', 'Flashcards bring back history, geography and civics just before you forget them.', 'One account on web and mobile: pick up where you left off.', 'SinoAI explains with your goal and gaps in mind. Start free at sinavika.com.'],
			},
		},
	},
};

export const TEXT_LIMITS = {headline: 30, longHeadline: 90, description: 90, shortDescription: 60} as const;

export const conceptsFor = (exam: AdExam): AdConcept[] => AD_CONCEPTS.filter((concept) => concept.exam === exam);
export const findConcept = (exam: AdExam, id: string): AdConcept => {
	const concept = AD_CONCEPTS.find((entry) => entry.exam === exam && entry.id === id);
	if (!concept) throw new Error(`Bilinmeyen reklam konsepti: ${exam}/${id}`);
	return concept;
};
