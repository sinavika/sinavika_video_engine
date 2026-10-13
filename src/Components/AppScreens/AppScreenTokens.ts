/**
 * Design tokens of the Sınavika mobile app, copied from the app's own theme
 * (sinavika_mobile_reactnative: src/core/theme/tokens.ts and darkTokens.ts).
 * Every app screen drawn in this project takes its colours and measures from
 * here, so the drawings follow the product instead of drifting from it.
 *
 * Screens are drawn on a fixed canvas, the app's design size, and scaled as a
 * whole to wherever they are shown.
 */
export const APP_SCREEN = {width: 390, height: 844} as const;

export const APP_MODES = ['light', 'dark'] as const;
export type AppMode = (typeof APP_MODES)[number];

export type AppColors = {
	background: string;
	/** Cards and sheets. */
	card: string;
	surfaceLow: string;
	surface: string;
	surfaceHigh: string;
	outline: string;
	text: string;
	muted: string;
	primary: string;
	onPrimary: string;
	primaryContainer: string;
	/** The soft orange behind module icons and selected rows. */
	primarySoft: string;
	onPrimarySoft: string;
	success: string;
	successSoft: string;
	warning: string;
	error: string;
};

export const APP_PALETTES: Record<AppMode, AppColors> = {
	light: {
		background: '#FAFAFA',
		card: '#FFFFFF',
		surfaceLow: '#F5F5F5',
		surface: '#F0F0F0',
		surfaceHigh: '#EBEBEB',
		outline: '#E5E7EB',
		text: '#0B1C30',
		muted: '#6B7280',
		primary: '#EA580C',
		onPrimary: '#FFFFFF',
		primaryContainer: '#F97316',
		primarySoft: '#FFEDD5',
		onPrimarySoft: '#C2410C',
		success: '#059669',
		successSoft: '#D1FAE5',
		warning: '#D97706',
		error: '#BA1A1A',
	},
	dark: {
		background: '#0F1115',
		card: '#17191E',
		surfaceLow: '#17191E',
		surface: '#1E2026',
		surfaceHigh: '#2A2D36',
		outline: '#3A3D47',
		text: '#F4F4F5',
		muted: '#A1A1AA',
		primary: '#FB923C',
		onPrimary: '#0F1115',
		primaryContainer: '#F97316',
		primarySoft: '#431407',
		onPrimarySoft: '#FB923C',
		success: '#34D399',
		successSoft: '#064E3B',
		warning: '#FBBF24',
		error: '#F87171',
	},
};

/** The app's layout measures, in canvas pixels. */
export const APP_LAYOUT = {
	screenPadding: 20,
	stackGap: 12,
	cardRadius: 16,
	cardPadding: 16,
	statusBarHeight: 54,
	tabBarBottomInset: 26,
} as const;

/** The app's type sizes, in canvas pixels. */
export const APP_TYPE = {
	pageTitle: 28,
	title: 21,
	headline: 17,
	body: 14.5,
	label: 13,
	caption: 11.5,
	overline: 11.5,
} as const;
