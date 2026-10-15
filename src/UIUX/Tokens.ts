/**
 * Design tokens of the UI/UX drawings: one table for web and mobile, light and
 * dark. Values match docs/UIUX/UIUX-Rehberi.md §3; the apps copy them into
 * their own theme files (Tailwind theme, React Native theme object).
 */
export const UI_MODES = ['light', 'dark'] as const;
export type UIMode = (typeof UI_MODES)[number];

export const UI_LANGS = ['tr', 'en'] as const;
export type UILang = (typeof UI_LANGS)[number];

export type UIColors = {
	brand: string;
	brandDeep: string;
	brandSoft: string;
	brandWash: string;
	ink: string;
	ink2: string;
	muted: string;
	subtle: string;
	line: string;
	line2: string;
	bg: string;
	card: string;
	raised: string;
	success: string;
	successSoft: string;
	warning: string;
	warningSoft: string;
	error: string;
	errorSoft: string;
	/** Text on brand orange. */
	onBrand: string;
};

export const UI_COLORS: Record<UIMode, UIColors> = {
	light: {
		brand: '#EA580C',
		brandDeep: '#C2410C',
		brandSoft: '#FFEDD5',
		brandWash: '#FFF7ED',
		ink: '#0B1C30',
		ink2: '#334155',
		muted: '#64748B',
		subtle: '#94A3B8',
		line: '#E7EAEE',
		line2: '#F1F3F6',
		bg: '#F7F7F8',
		card: '#FFFFFF',
		raised: '#FFFFFF',
		success: '#059669',
		successSoft: '#DCFCE7',
		warning: '#D97706',
		warningSoft: '#FEF3C7',
		error: '#DC2626',
		errorSoft: '#FEE2E2',
		onBrand: '#FFFFFF',
	},
	dark: {
		brand: '#F97316',
		brandDeep: '#FB923C',
		brandSoft: '#3B1D0C',
		brandWash: '#22150C',
		ink: '#F4F4F5',
		ink2: '#CBD5E1',
		muted: '#A1A1AA',
		subtle: '#71717A',
		line: '#2A2E37',
		line2: '#1D2028',
		bg: '#0F1115',
		card: '#17191E',
		raised: '#1E2026',
		success: '#34D399',
		successSoft: '#0B3B2C',
		warning: '#FBBF24',
		warningSoft: '#3A2A08',
		error: '#F87171',
		errorSoft: '#3B1414',
		onBrand: '#FFFFFF',
	},
};

/** Type roles: size / line height / weight. */
export const UI_TYPE = {
	display: [30, 36, 800],
	hero: [26, 32, 800],
	title: [22, 28, 800],
	section: [17, 23, 800],
	headline: [15, 20, 700],
	body: [14.5, 21, 500],
	small: [13, 18, 500],
	meta: [12, 16, 600],
	over: [11, 14, 800],
	num: [28, 32, 800],
} as const;
export type UITypeRole = keyof typeof UI_TYPE;

export const UI_RADIUS = {xs: 8, sm: 12, md: 16, lg: 20, xl: 26, full: 999} as const;

export const UI_SHADOW = {
	card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 22px -14px rgba(15, 23, 42, 0.18)',
	float: '0 2px 6px rgba(15, 23, 42, 0.05), 0 18px 40px -18px rgba(15, 23, 42, 0.32)',
	brand: '0 14px 28px -14px rgba(234, 88, 12, 0.6)',
} as const;

/** Canvas sizes, in points. Pictures are rendered at 3x (mobile) and 2x (web). */
export const UI_CANVAS = {
	mobile: {width: 390, height: 844, scale: 3},
	web: {width: 1440, height: 900, scale: 2},
} as const;
