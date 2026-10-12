/**
 * Theme-independent scales, in reference pixels (1080px short edge).
 * Themes decide colour, typeface and shape; these scales keep rhythm
 * consistent across every theme and template.
 */
export const SPACING = {
	xxs: 4,
	xs: 8,
	sm: 12,
	md: 20,
	lg: 32,
	xl: 48,
	xxl: 72,
	xxxl: 112,
} as const;

export const FONT_SIZES = {
	display: 116,
	headline: 84,
	title: 60,
	subtitle: 46,
	bodyLarge: 44,
	body: 37,
	caption: 29,
	label: 25,
} as const;

export type FontSizeName = keyof typeof FONT_SIZES;

export const LINE_HEIGHTS = {
	tight: 1.08,
	snug: 1.2,
	normal: 1.42,
} as const;

/** Height reserved at the top of the safe area for template chrome (progress, brand). */
export const CHROME_HEIGHT = 76;
