import type {AppIconName} from './AppScreenParts';

/**
 * The app's modules and the tab bar each one shows, as in the app's
 * MainTabBar: five tabs per module, with "Modüller" always in the middle.
 * Labels are the app's own (tr-TR catalogue). The module hub itself is a
 * plain screen without a tab bar.
 */
export type AppTab = {label: string; icon: AppIconName};

const MODULES_TAB: AppTab = {label: 'Modüller', icon: 'apps'};
const PROFILE_TAB: AppTab = {label: 'Profil', icon: 'person'};

export const APP_MODULES = {
	Hub: {title: 'Modüller', tabs: null},
	Exam: {
		title: 'Denemeler',
		tabs: [{label: 'Ana sayfa', icon: 'home'}, {label: 'Sınavlarım', icon: 'document'}, MODULES_TAB, {label: 'Daha fazla', icon: 'more'}, PROFILE_TAB],
	},
	SmartSummary: {
		title: 'Akıllı Özet',
		tabs: [{label: 'Lens', icon: 'scan'}, {label: 'Soru yükle', icon: 'camera'}, MODULES_TAB, {label: 'Video', icon: 'play'}, PROFILE_TAB],
	},
	Flashcards: {
		title: 'Bilgi Kartları',
		tabs: [{label: 'Kartlar', icon: 'albums'}, {label: 'Bugün', icon: 'sun'}, MODULES_TAB, {label: 'Kaydedilenler', icon: 'bookmark'}, PROFILE_TAB],
	},
	Lessons: {
		title: 'Dersler',
		tabs: [{label: 'Ana Sayfa', icon: 'home'}, {label: 'Konu ağacı', icon: 'search'}, MODULES_TAB, {label: 'Geçmiş', icon: 'clock'}, PROFILE_TAB],
	},
	Tests: {
		title: 'Testler',
		tabs: [{label: 'Anasayfa', icon: 'home'}, {label: 'Testler', icon: 'help'}, MODULES_TAB, {label: 'Çözümler', icon: 'book'}, PROFILE_TAB],
	},
	StudyPlan: {
		title: 'Ders Planı',
		tabs: [{label: 'Bugün', icon: 'home'}, {label: 'İlerleme', icon: 'compass'}, MODULES_TAB, {label: 'Takvim', icon: 'calendar'}, PROFILE_TAB],
	},
	SinoAi: {title: 'SinoAI', tabs: null},
} as const satisfies Record<string, {title: string; tabs: readonly AppTab[] | null}>;

export type AppModuleName = keyof typeof APP_MODULES;
