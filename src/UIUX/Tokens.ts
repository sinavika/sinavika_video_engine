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
	/** Status text on its soft fill (chips, badges): at least 4.5:1. */
	successInk: string;
	warningInk: string;
	errorInk: string;
	/** Text on brand orange. */
	onBrand: string;
	/** Fill of brand buttons: white text reads at 5.2:1 (#EA580C gave 3.6:1). The logo and icons keep `brand`. */
	action: string;
};

export const UI_COLORS: Record<UIMode, UIColors> = {
	light: {
		brand: '#EA580C',
		brandDeep: '#C2410C',
		brandSoft: '#FFEDD5',
		brandWash: '#FFF7ED',
		ink: '#0B1C30',
		ink2: '#334155',
		/** 4.9:1 on every light surface; #64748B was 4.4:1 on the page (UI/UX review, 25 Oct 2026). */
		muted: '#5F6B7D',
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
		successInk: '#047857',
		warningInk: '#B45309',
		errorInk: '#B91C1C',
		onBrand: '#FFFFFF',
		action: '#C2410C',
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
		successInk: '#34D399',
		warningInk: '#FBBF24',
		errorInk: '#F87171',
		onBrand: '#FFFFFF',
		action: '#C2410C',
	},
};

/** Type roles: size / line height / weight. */
export const UI_TYPE = {
	display: [30, 36, 800],
	hero: [26, 32, 800],
	title: [22, 28, 800],
	section: [17, 23, 800],
	headline: [15, 20, 700],
	/** Reading text: 16 pt with 1.5 line height (UX rule review, 3 Nov 2026; was 14.5). */
	body: [16, 24, 500],
	small: [13, 18, 500],
	meta: [12, 16, 600],
	/** The smallest text anywhere: 12 pt (UI/UX review, 25 Oct 2026; was 11). */
	over: [12, 16, 800],
	num: [28, 32, 800],
} as const;
export type UITypeRole = keyof typeof UI_TYPE;

export const UI_RADIUS = {xs: 8, sm: 12, md: 16, lg: 20, xl: 26, full: 999} as const;

export const UI_SHADOW = {
	card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 22px -14px rgba(15, 23, 42, 0.18)',
	float: '0 2px 6px rgba(15, 23, 42, 0.05), 0 18px 40px -18px rgba(15, 23, 42, 0.32)',
	brand: '0 14px 28px -14px rgba(234, 88, 12, 0.6)',
} as const;

/**
 * Motion of the apps (web and mobile): one table, as for colour and type
 * (docs/UIUX/Hareket-Standardi.md). The drawings are still pictures; these
 * values are what the apps copy into their own motion files (CSS variables,
 * Reanimated constants). Adapted 10 Nov 2026 from emilkowalski/skills (MIT).
 *
 * Rules the numbers carry:
 * - Every curve slows at the end (ease-out) or moves in and out (on-screen
 *   moves). No ease-in in the interface: it feels late.
 * - Product UI stays under 300 ms; only sheets and full-screen moves are longer.
 * - Exits are shorter than entrances and leave the way they came.
 * - Nothing grows from zero: entrances start at 0.96 scale with opacity 0.
 * - Only transform and opacity move.
 */
export const UI_MOTION = {
	/** cubic-bezier control points; web: `cubic-bezier(...)`, Reanimated: `Easing.bezier(...)`. */
	easing: {
		/** Entrances, exits, presses: fast start, soft landing. */
		out: [0.23, 1, 0.32, 1],
		/** Something already on screen moving to a new place (tab pill, reorder). */
		inOut: [0.77, 0, 0.175, 1],
		/** Bottom sheets and drawers (iOS sheet feel). */
		sheet: [0.32, 0.72, 0, 1],
	},
	/** Milliseconds. */
	duration: {
		press: 140,
		toggle: 180,
		popover: 180,
		menu: 200,
		/** A card, row or message appearing. */
		enter: 240,
		/** Screen push within a module. */
		screen: 280,
		modal: 280,
		sheet: 320,
		/** Exits: about two thirds of the entrance. */
		exit: 180,
		/** The longest product-UI move without a stated reason. */
		max: 300,
	},
	/** Gap between items appearing in turn; a whole group finishes within `groupMax`. */
	stagger: {step: 50, groupMax: 300},
	/** Distances in points (pt / dp / CSS px). */
	distance: {
		/** Rows, cards, messages rising in. */
		enter: 8,
		/** Toasts and small floating panels. */
		float: 12,
	},
	scale: {
		/** Pressed button or card. */
		press: 0.97,
		/** Where entrances start (never 0). */
		enter: 0.96,
	},
	/** Reanimated `withSpring` settings (duration in ms; no bounce in product UI). */
	spring: {
		settle: {duration: 400, dampingRatio: 1},
		/** Back to place after a cancelled drag: carries the finger's speed. */
		snapBack: {duration: 400, dampingRatio: 0.8},
		sheet: {duration: 300, dampingRatio: 0.8},
	},
	/** Drags: the finger is followed 1:1; on release a spring takes over with its speed. */
	gesture: {
		/** Share of the travel past which a sheet or card closes. */
		dismissDistance: 0.45,
		/** Or a flick faster than this (pt per second). */
		dismissVelocity: 500,
		/** Pull past the edge moves this fraction of the finger (rubber band). */
		rubberBand: 0.2,
		/** Smallest touch target (pt; Android 48 dp). */
		minTarget: 44,
	},
	/** "Reduce motion" on: keep fades, drop movement and scale, at most this long. */
	reduced: {duration: 150},
} as const;

/**
 * Ready-made moments of Sınavika (docs/UIUX/Hareket-Standardi.md §3). `haptic`
 * fires on the same frame as the change, once per action, and is never the only
 * feedback. `none` means the moment must not animate (frequent or keyboard-driven).
 */
export const UI_MOTION_MOMENTS = {
	tabSwitch: {animate: 'none', haptic: 'selection'},
	optionSelect: {animate: 'press', haptic: 'selection'},
	/** Testler and Dersler only: a deneme shows no right or wrong while it is solved (UIUX-Rehberi §5.4.1). */
	answerCorrect: {animate: 'tick + soft green fill, 240 ms', haptic: 'impactLight'},
	answerWrong: {animate: 'cross + red fill, no shake, 240 ms', haptic: 'notificationWarning'},
	nextQuestion: {animate: 'old out 180 ms, new in 240 ms from 8 pt right', haptic: 'none'},
	taskDone: {animate: 'tick draws in 240 ms, row fades to done', haptic: 'notificationSuccess'},
	progressGain: {animate: 'bar fills 600 ms out-easing once, number counts with it', haptic: 'none'},
	badgeEarned: {animate: 'badge in from 0.96 + fade 320 ms, one-time glow', haptic: 'notificationSuccess'},
	sinoMessage: {animate: 'message rises 8 pt, 240 ms; text streams, never typed letter by letter twice', haptic: 'none'},
	sinoThinking: {animate: 'three dots, the only looping motion besides loading', haptic: 'none'},
	sheet: {animate: 'sheet curve 320 ms; follows the finger; closes on 45 % or a flick', haptic: 'none'},
	/** Owner 11 Nov 2026: no skeletons. First load: the clock logo turning in the middle of the page or section. */
	loading: {animate: 'clock logo turning in the middle of the page or section, no skeleton', haptic: 'none'},
	/** Content already shown: it stays; a small indicator at the top. */
	refreshing: {animate: 'content stays, small indicator at the top', haptic: 'none'},
} as const;

/** Canvas sizes, in points. Pictures are rendered at 3x (mobile) and 2x (web). */
export const UI_CANVAS = {
	mobile: {width: 390, height: 844, scale: 3},
	web: {width: 1440, height: 900, scale: 2},
	/** iPad 11" in landscape (the pen's wide layout, ≥ 900 pt); portrait screens swap the sides (834 × 1194). */
	tablet: {width: 1194, height: 834, scale: 2},
} as const;
