/**
 * The Sınavika corporate colour palette, exactly as used by the web and mobile
 * apps. This is the single source: palettes and themes are built from these
 * values (see Themes/Palettes.ts), nothing else hard-codes a brand colour.
 *
 * Usage principles:
 * - Orange: main call to action, active state, progress, key emphasis.
 * - Charcoal: headings, body text, dark surfaces.
 * - Neutral greys: cards, backgrounds, secondary text, dividers.
 * - Green, amber, red, blue: status only (correct, warning, wrong, info).
 * - Purple: reserved for the mobile solution-review experience; never a brand accent.
 */
export const BRAND_COLORS = {
	brand: {
		primary: '#EA580C',
		primaryContainer: '#F97316',
		primaryLight: '#FFEDD5',
		primaryDim: '#FDBA74',
		charcoal: '#0F172A',
		textPrimary: '#0B1C30',
	},
	light: {
		background: '#FAFAFA',
		card: '#FFFFFF',
		surfaceLow: '#F5F5F5',
		surfaceContainer: '#F0F0F0',
		surfaceHigh: '#EBEBEB',
		border: '#E5E7EB',
		textSecondary: '#6B7280',
	},
	dark: {
		background: '#0F1115',
		deepSurface: '#0B0C0F',
		surfaceLow: '#17191E',
		surface: '#1E2026',
		elevatedSurface: '#2A2D36',
		border: '#32363F',
		textPrimary: '#F4F4F5',
		textSecondary: '#A1A1AA',
		primaryAccent: '#FB923C',
	},
	/** First value on light surfaces, second on dark. */
	status: {
		success: {light: '#059669', dark: '#34D399'},
		warning: {light: '#D97706', dark: '#FBBF24'},
		error: {light: '#BA1A1A', dark: '#F87171'},
		info: {light: '#2563EB', dark: '#60A5FA'},
	},
	review: {
		primary: '#7C3AED',
		container: '#8B5CF6',
		fixed: '#EDE9FE',
	},
} as const;
