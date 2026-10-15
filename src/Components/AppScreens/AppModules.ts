import type {AppIconName} from './AppScreenParts';

/**
 * The app's modules and the tab bar each one shows, as in the app's
 * MainTabBar: five tabs per module, with "Modüller" always in the middle.
 * Labels are the app's own (tr-TR catalogue). The module hub itself is a
 * plain screen without a tab bar.
 */
/** `label` is the tr-TR catalogue's, `en` the en-US one's. */
export type AppTab = {label: string; en: string; icon: AppIconName};

const MODULES_TAB: AppTab = {label: 'Modüller', en: 'Modules', icon: 'apps'};
const PROFILE_TAB: AppTab = {label: 'Profil', en: 'Profile', icon: 'person'};

export const APP_MODULES = {
	Hub: {title: 'Modüller', en: 'Modules', tabs: null},
	Exam: {
		title: 'Denemeler',
		en: 'Practice exams',
		tabs: [{label: 'Ana sayfa', en: 'Home', icon: 'home'}, {label: 'Sınavlarım', en: 'My exams', icon: 'document'}, MODULES_TAB, {label: 'Daha fazla', en: 'More', icon: 'more'}, PROFILE_TAB],
	},
	SmartSummary: {
		title: 'Akıllı Özet',
		en: 'Smart Summary',
		tabs: [{label: 'Lens', en: 'Lens', icon: 'scan'}, {label: 'Soru yükle', en: 'Upload', icon: 'camera'}, MODULES_TAB, {label: 'Video', en: 'Video', icon: 'play'}, PROFILE_TAB],
	},
	Flashcards: {
		title: 'Bilgi Kartları',
		en: 'Flashcards',
		tabs: [{label: 'Kartlar', en: 'Cards', icon: 'albums'}, {label: 'Bugün', en: 'Today', icon: 'sun'}, MODULES_TAB, {label: 'Kaydedilenler', en: 'Saved', icon: 'bookmark'}, PROFILE_TAB],
	},
	Lessons: {
		title: 'Dersler',
		en: 'Lessons',
		tabs: [{label: 'Ana Sayfa', en: 'Home', icon: 'home'}, {label: 'Konu ağacı', en: 'Topic tree', icon: 'search'}, MODULES_TAB, {label: 'Geçmiş', en: 'History', icon: 'clock'}, PROFILE_TAB],
	},
	Tests: {
		title: 'Testler',
		en: 'Quizzes',
		tabs: [{label: 'Anasayfa', en: 'Home', icon: 'home'}, {label: 'Testler', en: 'Quizzes', icon: 'help'}, MODULES_TAB, {label: 'Çözümler', en: 'Solutions', icon: 'book'}, PROFILE_TAB],
	},
	StudyPlan: {
		title: 'Ders Planı',
		en: 'Study Plan',
		tabs: [{label: 'Bugün', en: 'Today', icon: 'home'}, {label: 'İlerleme', en: 'Progress', icon: 'compass'}, MODULES_TAB, {label: 'Takvim', en: 'Calendar', icon: 'calendar'}, PROFILE_TAB],
	},
	SinoAi: {title: 'SinoAI', en: 'SinoAI', tabs: null},
} as const satisfies Record<string, {title: string; en: string; tabs: readonly AppTab[] | null}>;

export type AppModuleName = keyof typeof APP_MODULES;
