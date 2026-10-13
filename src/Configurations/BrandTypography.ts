import {FONT_FAMILIES, fontStack} from '../Themes/FontFamilies';
import type {ThemeTypography} from '../Themes/Theme';

/**
 * The typography of Sınavika content, the counterpart of BrandColors.ts.
 * This is the single source: the brand themes take their typefaces and
 * weights from here, and the ad templates take their type sizes from here.
 * Nothing else names a brand font, weight or ad type size.
 *
 * These are the faces and sizes of the designs approved in October 2026.
 * They are fixed on purpose: a change here changes every piece of content
 * from then on, so it is a brand decision, not a per-video one.
 */
export const BRAND_TYPOGRAPHY = {
	/** Keys of FONT_FAMILIES; the font files are loaded in Themes/FontFaces.ts. */
	families: {
		/** Headlines, hooks, big numbers. */
		display: 'plusJakartaSans',
		/** Running text, labels, app screens. */
		body: 'inter',
		/** Code and tabular figures. */
		mono: 'jetBrainsMono',
	},
	weights: {
		/** Headlines and titles. */
		display: 800,
		/** Hooks and kinetic type: the heaviest cut, for words that have to land. */
		kinetic: 900,
		body: 450,
		/** Emphasis inside running text, labels, buttons. */
		strong: 700,
	},
	displayLetterSpacing: '-0.02em',
	/** Small labels (subject, kicker) are set in capitals. */
	labelTransform: 'uppercase',
	/** Line height of stacked display lines. */
	displayLineHeight: 1.05,
	/**
	 * Type sizes of ad videos, in reference pixels (1080 px short edge).
	 * Few sizes, far apart: one job each, so every ad has the same hierarchy.
	 */
	adScale: {
		/** One number filling the frame: a timer, a score. */
		numeral: 230,
		/** The opening lines. */
		hook: 112,
		/** The headline above the product. */
		headline: 92,
		/** The line on the closing card. */
		closing: 84,
		/** Buttons and store names. */
		action: 36,
		/** Subtitles: the narration, for viewers without sound. */
		subtitle: 40,
	},
} as const satisfies {
	families: Record<'display' | 'body' | 'mono', keyof typeof FONT_FAMILIES>;
	weights: Record<'display' | 'kinetic' | 'body' | 'strong', number>;
	displayLetterSpacing: string;
	labelTransform: ThemeTypography['labelTransform'];
	displayLineHeight: number;
	adScale: Record<'numeral' | 'hook' | 'headline' | 'closing' | 'action' | 'subtitle', number>;
};

const {families, weights} = BRAND_TYPOGRAPHY;

/** The brand typography in the shape a theme carries. The brand themes use exactly this. */
export const BRAND_THEME_TYPOGRAPHY: ThemeTypography = {
	display: fontStack(FONT_FAMILIES[families.display]),
	body: fontStack(FONT_FAMILIES[families.body]),
	mono: fontStack(FONT_FAMILIES[families.mono], 'monospace'),
	displayWeight: weights.display,
	bodyWeight: weights.body,
	strongWeight: weights.strong,
	displayScale: 1,
	displayLetterSpacing: BRAND_TYPOGRAPHY.displayLetterSpacing,
	labelTransform: BRAND_TYPOGRAPHY.labelTransform,
};
