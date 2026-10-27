import type {AppIconName} from '../Components/AppScreens/AppScreenParts';
import type {AppScreenName} from '../Components/AppScreens/AppScreenRegistry';
import type {SinoAiChat} from '../Components/AppScreens/Screens/AssistantScreens';
import {MODULE_MESSAGING} from '../Configurations/ProductMessaging';
import type {ModuleKey} from '../UIUX/ModuleIdentity';

/**
 * The App Store and Google Play listing: the screenshots' copy, their app
 * screens, and every size the two stores ask for. One slide list serves
 * every size, so the phone, tablet and desktop sets tell the same story in
 * the same order.
 *
 * Copy is written for someone deciding in a few seconds whether to install:
 * the headline names the benefit (one word highlighted between *stars*), the
 * line under it speaks to the student, and the `tool` line, on its own soft
 * background, says what the module does with the module as its subject.
 * Tool and invite lines come from Configurations/ProductMessaging, so the
 * store, ads and posts describe a module the same way. Headlines that are a
 * series of commands end with a full stop. English is written for
 * English-speaking students, not translated word for word.
 */
export const STORE_LANGUAGES = ['tr', 'en'] as const;
export type StoreLanguage = (typeof STORE_LANGUAGES)[number];

export type StoreText = Record<StoreLanguage, string>;

/** A screen in a slide: one from the registry, or SinoAI with a given conversation. */
export type StoreScreen = AppScreenName | {sinoAi: Record<StoreLanguage, SinoAiChat>};

export type StoreSlide = {
	/** File name stem, per language. */
	file: StoreText;
	headline: StoreText;
	/** To the student: short, with closing punctuation. */
	subline: StoreText;
	/** What the module does, the module as subject; drawn on its own background. */
	tool?: {module: ModuleKey; text: StoreText};
	/** One screen, or two shown as a pair (the first in front). */
	screens: readonly [StoreScreen] | readonly [StoreScreen, StoreScreen];
	/** A small card floating by the device: the slide's proof point. */
	badge?: {icon: AppIconName; text: StoreText};
	/** Short labels under the headline (the opening slide's "what's inside"). */
	chips?: Record<StoreLanguage, readonly string[]>;
	/** Show the logo above the headline. */
	logo?: boolean;
};

export const STORE_SLIDES: readonly StoreSlide[] = [
	{
		file: {tr: 'hepsi-tek-yerde', en: 'all-in-one'},
		headline: {tr: 'Sınav hazırlığın *tek yerde*', en: 'Your exam prep, *all in one place*'},
		subline: {
			tr: 'Konu anlatımı, test, deneme, çalışma planı ve SinoAI tek uygulamada.',
			en: 'Lessons, quizzes, mock exams, a study plan and SinoAI in one app.',
		},
		screens: ['Home'],
		chips: {tr: ['Mikro ders', 'Test', 'Deneme', 'SinoAI'], en: ['Micro-lessons', 'Quizzes', 'Mock exams', 'SinoAI']},
		logo: true,
	},
	{
		file: {tr: 'sinoai', en: 'sinoai'},
		headline: {tr: 'Seni tanıyan yapay zekâ: *SinoAI*', en: 'Meet *SinoAI*, the AI that knows you'},
		subline: {
			tr: MODULE_MESSAGING.sinoAi.invite.tr,
			en: MODULE_MESSAGING.sinoAi.invite.en,
		},
		tool: {module: 'sinoAi', text: MODULE_MESSAGING.sinoAi.tool},
		screens: ['SinoAi'],
		badge: {icon: 'sparkles', text: {tr: 'Hedefini ve eksiklerini bilir', en: 'Knows your goal and gaps'}},
	},
	{
		file: {tr: 'fotograf-cek-coz', en: 'snap-and-solve'},
		headline: {tr: 'Fotoğrafını çek, *çözümünü öğren.*', en: 'Snap a question, *learn the solution.*'},
		subline: {
			tr: MODULE_MESSAGING.smartSummary.invite.tr,
			en: MODULE_MESSAGING.smartSummary.invite.en,
		},
		tool: {module: 'smartSummary', text: MODULE_MESSAGING.smartSummary.tool},
		screens: ['SmartSummary'],
		badge: {icon: 'play', text: {tr: 'Çözüm videosu · 0:48', en: 'Solution video · 0:48'}},
	},
	{
		file: {tr: 'kendi-kaynaklarin', en: 'your-own-notes'},
		headline: {tr: 'Kendi notlarından *sana özel içerik*', en: 'Turn your notes into *study material*'},
		subline: {
			tr: 'Notlarını ve kaynaklarını yükle.',
			en: 'Upload your notes and sources.',
		},
		tool: {module: 'sinoAi', text: {tr: 'SinoAI onlardan konu anlatımı, test, deneme ve kart hazırlar.', en: 'SinoAI turns them into lessons, quizzes, mock exams and flashcards.'}},
		screens: [
			{
				sinoAi: {
					tr: {
						attachment: 'Hucre-Biyolojisi-Notlarim.pdf',
						question: 'Bu notlardan 10 soruluk bir test hazırla',
						answer: ['Notlarından 10 soruluk test hazır: 6 kolay, 4 orta zorlukta soru.', 'Hücre zarı ve organellere ağırlık verdim. İstersen aynı notlardan tekrar kartları da oluşturayım.'],
					},
					en: {
						attachment: 'Cell-Biology-Notes.pdf',
						question: 'Make a 10-question quiz from these notes',
						answer: ['Your 10-question quiz is ready: 6 easy and 4 medium questions.', 'I focused on the cell membrane and organelles. Want review cards from the same notes too?'],
					},
				},
			},
		],
		badge: {icon: 'checklist', text: {tr: '10 soruluk test hazır', en: '10-question quiz ready'}},
	},
	{
		file: {tr: 'ogren-pekistir', en: 'learn-and-practise'},
		headline: {tr: 'Konuyu öğren, *sorularla pekiştir.*', en: 'Learn it, then *lock it in.*'},
		subline: {
			tr: MODULE_MESSAGING.lessons.invite.tr,
			en: MODULE_MESSAGING.lessons.invite.en,
		},
		tool: {module: 'lessons', text: MODULE_MESSAGING.lessons.tool},
		screens: ['Lessons', 'Tests'],
		badge: {icon: 'check', text: {tr: 'Kaldığın yerden devam', en: 'Pick up where you left off'}},
	},
	{
		file: {tr: 'deneme-gelisim', en: 'mock-exams'},
		headline: {tr: 'Denemeni çöz, *gelişimini gör.*', en: 'Take mock exams, *see your progress.*'},
		subline: {
			tr: MODULE_MESSAGING.exam.invite.tr,
			en: MODULE_MESSAGING.exam.invite.en,
		},
		tool: {module: 'exam', text: MODULE_MESSAGING.exam.tool},
		screens: ['Analysis', 'Exam'],
		badge: {icon: 'chart', text: {tr: 'Net +6,5', en: 'Score +6.5'}},
	},
	{
		file: {tr: 'plan-takip', en: 'plan-and-track'},
		headline: {tr: 'Eksiğini gör, *çalışmanı planla.*', en: 'See your gaps, *plan your study.*'},
		subline: {
			tr: MODULE_MESSAGING.studyPlan.invite.tr,
			en: MODULE_MESSAGING.studyPlan.invite.en,
		},
		tool: {module: 'studyPlan', text: MODULE_MESSAGING.studyPlan.tool},
		screens: ['StudyProgress', 'StudyPlan'],
		badge: {icon: 'clock', text: {tr: 'Bu hafta 12 sa 40 dk', en: '12 h 40 min this week'}},
	},
	{
		file: {tr: 'kartlarla-tekrar', en: 'flashcards'},
		headline: {tr: 'Tekrar et, *aklında tut.*', en: 'Review it, *remember it.*'},
		subline: {
			tr: MODULE_MESSAGING.flashcards.invite.tr,
			en: MODULE_MESSAGING.flashcards.invite.en,
		},
		tool: {module: 'flashcards', text: MODULE_MESSAGING.flashcards.tool},
		screens: ['Flashcards'],
		badge: {icon: 'bookmark', text: {tr: 'Kaydet, sonra tekrar et', en: 'Save it, review it later'}},
	},
];

/** The Google Play feature graphic. */
export const FEATURE_GRAPHIC = {
	headline: {tr: 'Sınav hazırlığın *tek yerde*', en: 'Your exam prep, *all in one place*'},
	subline: {tr: 'Ders, test, deneme, plan ve SinoAI', en: 'Lessons, quizzes, mock exams, planning and SinoAI'},
	screens: ['Home', 'SinoAi'] as const,
} satisfies {headline: StoreText; subline: StoreText; screens: readonly AppScreenName[]};

/**
 * App Store creative (iOS / iPadOS 27 and later): the product page header and
 * the search results picture. Landscape artwork with a three-phone cluster;
 * each size also comes without copy, for when Apple lays its own text over it.
 */
export type StoreCreativeKind = 'header' | 'search';

export const STORE_CREATIVE: Record<StoreCreativeKind, {file: string; headline: StoreText; subline: StoreText; screens: readonly [AppScreenName, AppScreenName, AppScreenName]}> = {
	header: {
		file: 'ust-gorsel',
		headline: {tr: 'Sınav hazırlığın *tek yerde*', en: 'Your exam prep, *all in one place*'},
		subline: {tr: 'Deneme, ders, test, çalışma planı ve SinoAI tek uygulamada.', en: 'Mock exams, lessons, quizzes, a study plan and SinoAI in one app.'},
		screens: ['Home', 'SinoAi', 'Analysis'],
	},
	search: {
		file: 'arama-sonucu',
		headline: {tr: 'Netini artır, *eksiğini kapat*', en: 'Raise your score, *close your gaps*'},
		subline: {tr: 'Deneme analizi, sana özel plan ve SinoAI ile her gün bir adım öne.', en: 'Exam analysis, a plan made for you and SinoAI, one step a day.'},
		screens: ['Analysis', 'StudyPlan', 'SinoAi'],
	},
};

/**
 * Background looks. `acik` (light) is the default; `koyu` and `turuncu`
 * are alternatives with the same layout.
 */
export const STORE_STYLES = ['acik', 'koyu', 'turuncu'] as const;
export type StoreStyle = (typeof STORE_STYLES)[number];

/** What a picture shows: a phone, a tablet, a landscape (Chromebook) shot, or the Play feature graphic. */
export type StoreDevice = 'phone' | 'tablet' | 'desktop' | 'feature' | StoreCreativeKind;

export type StoreFormat = {
	platform: 'ios' | 'android';
	/** Folder name. */
	folder: string;
	device: StoreDevice;
	sizes: readonly (readonly [number, number])[];
	/** Shape of the tablet drawn (width / height of the device), and how wide the app is laid out on it, in app points. */
	tablet?: {aspect: number; canvasWidth: number};
	/** The feature graphic and the App Store creative are single pictures; the rest are the slide set. */
	single?: boolean;
	/** App Store creative only: also render a copy without text. */
	textless?: boolean;
	note: string;
};

/** Every picture the stores ask for (App Store Connect and Google Play Console, October 2026). */
export const STORE_FORMATS: readonly StoreFormat[] = [
	{platform: 'android', folder: 'telefon', device: 'phone', sizes: [[1080, 1920]], note: 'Telefon ekran görüntüleri, 9:16 (2–8 adet)'},
	{platform: 'android', folder: 'tablet-7-inc', device: 'tablet', sizes: [[1440, 2560]], tablet: {aspect: 0.62, canvasWidth: 500}, note: '7 inç tablet, 9:16'},
	{platform: 'android', folder: 'tablet-10-inc', device: 'tablet', sizes: [[2160, 3840]], tablet: {aspect: 0.62, canvasWidth: 560}, note: '10 inç tablet, 9:16'},
	{platform: 'android', folder: 'masaustu', device: 'desktop', sizes: [[1920, 1080]], note: 'Masaüstü (Chromebook), 16:9 (4–8 adet)'},
	{platform: 'android', folder: 'ozellik-grafigi', device: 'feature', sizes: [[1024, 500]], single: true, note: 'Özellik grafiği 1024 × 500'},
	{platform: 'ios', folder: 'iphone-6.3', device: 'phone', sizes: [[1206, 2622]], note: 'iPhone 6.3" (6.1" de bunu kabul eder)'},
	{platform: 'ios', folder: 'iphone-6.1', device: 'phone', sizes: [[1179, 2556]], note: 'iPhone 6.1"'},
	{platform: 'ios', folder: 'ipad-ikinci-grup', device: 'tablet', sizes: [[2007, 2853], [1398, 2034]], tablet: {aspect: 0.72, canvasWidth: 560}, note: 'Listede adı yazmayan ikinci grup (2007 × 2853 / 1398 × 2034)'},
	{platform: 'ios', folder: 'ipad-13-inc', device: 'tablet', sizes: [[2064, 2752], [2048, 2732]], tablet: {aspect: 0.75, canvasWidth: 600}, note: 'iPad 12.9" / 13"'},
	{platform: 'ios', folder: 'ust-gorsel', device: 'header', sizes: [[5244, 2950], [3840, 1646]], single: true, textless: true, note: 'App Store Header (iOS 27+): 16:9 5244 × 2950 ya da 21:9 3840 × 1646; PNG, alfa yok'},
	{platform: 'ios', folder: 'arama-sonucu', device: 'search', sizes: [[5244, 2950], [3840, 2560], [1920, 1280]], single: true, textless: true, note: 'App Store Search Results (iOS 27+): 16:9 5244 × 2950 ya da 3:2 3840 × 2560 / 1920 × 1280; PNG, alfa yok'},
];
