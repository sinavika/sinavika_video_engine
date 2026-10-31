import type {AppScreenName} from '../Components/AppScreens/AppScreenRegistry';
import type {StoreLanguage, StoreScreen} from './StoreListing';

/**
 * Real app screens for the store pictures: captures of the live app on an
 * Android emulator (1080 × 2400, status bar clock 09:41), logged in as the
 * test student. They sit in public/Store/Real/<lang>/<key>.png and replace the
 * drawn screen inside the same phone frame, so the design stays as it is.
 *
 * A slide screen with no capture keeps its drawn version. The English set
 * shows the English interface; exam content stays Turkish because the test
 * account studies for KPSS, so the English SinoAI chat stays drawn.
 */
export const STORE_SOURCES = ['drawn', 'real'] as const;
export type StoreSource = (typeof STORE_SOURCES)[number];

const STORE_REAL_KEYS = [
	'home',
	'sinoAi',
	'sinoAiStudy',
	'smartSummary',
	'lessons',
	'tests',
	'analysis',
	'exam',
	'studyProgress',
	'studyPlan',
	'flashcards',
] as const;
type StoreRealKey = (typeof STORE_REAL_KEYS)[number];

/** Which captures exist per language (a missing key falls back to the drawn screen). */
const STORE_REAL_SCREENS: Record<StoreLanguage, readonly StoreRealKey[]> = {
	tr: STORE_REAL_KEYS,
	en: STORE_REAL_KEYS.filter((key) => key !== 'sinoAi'),
};

const BY_APP_SCREEN: Partial<Record<AppScreenName, StoreRealKey>> = {
	Home: 'home',
	SinoAi: 'sinoAi',
	SmartSummary: 'smartSummary',
	SmartSummaryHome: 'smartSummary',
	Lessons: 'lessons',
	Tests: 'tests',
	Analysis: 'analysis',
	Exam: 'exam',
	StudyProgress: 'studyProgress',
	StudyPlan: 'studyPlan',
	Flashcards: 'flashcards',
};

/** The capture standing in for a slide screen; a scripted SinoAI conversation becomes the real SinoAI production card. */
const realKeyFor = (screen: StoreScreen): StoreRealKey | undefined =>
	typeof screen === 'string' ? BY_APP_SCREEN[screen] : 'sinoAiStudy';

/** Path under public/ of a capture, or undefined when that language has none. */
export const realScreenPath = (screen: StoreScreen, lang: StoreLanguage): string | undefined => {
	const key = realKeyFor(screen);
	return key && STORE_REAL_SCREENS[lang].includes(key) ? `Store/Real/${lang}/${key}.png` : undefined;
};
