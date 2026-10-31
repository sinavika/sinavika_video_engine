import {FONT_FAMILIES} from '../Themes/FontFamilies';
import type {ThemeTypography} from '../Themes/Theme';

/**
 * The typography of Sınavika content, the counterpart of BrandColors.ts.
 * This is the single source: every theme takes its typefaces and weights
 * from here, and the ad templates take their type sizes from here. Nothing
 * else names a font, a weight above the brand's or an ad type size.
 *
 * The brand typeface is Manrope, the same face as the web and mobile apps
 * (sinavika_frontend_student: src/core/theme/fonts.ts, sinavika_mobile_reactnative:
 * src/core/theme/typography.ts), so a video, an ad, the site and the app read
 * as one brand. Manrope covers every Latin-script European language (Turkish,
 * English, German, Dutch, French, Spanish, Polish, Czech, Romanian…) plus
 * Greek and Cyrillic. It has no italic and no weight above 800.
 *
 * Manrope has no math operators (≤ ≥ ≈ √ ∞ ∫); they come from KaTeX's own
 * face, already loaded for formulas, so they look the same on every machine
 * instead of falling back to whatever the renderer's system has.
 *
 * Changes here change every piece of content from then on: a brand decision,
 * not a per-video one. A test locks the values (tests/BrandTypography.test.ts).
 */
export const BRAND_TYPOGRAPHY = {
	/** Keys of FONT_FAMILIES; the font files are loaded in Themes/FontFaces.ts. */
	families: {
		/** Headlines, hooks, big numbers. */
		display: 'manrope',
		/** Running text, questions, labels, app screens, subtitles. */
		body: 'manrope',
		/** Only technical identifiers and code; never questions, prose or numbers in a sentence. */
		mono: 'jetBrainsMono',
	},
	/** Fills the characters the brand face lacks (math operators). */
	mathFallback: 'KaTeX_Main',
	weights: {
		/** Headlines and titles. */
		display: 800,
		/** Hooks, kinetic type and big numerals: Manrope's heaviest cut (it has none above 800). */
		kinetic: 800,
		/** Running text. 500 rather than the apps' 400: video is read at a distance and once. */
		body: 500,
		/** Emphasis inside running text, labels, buttons. */
		strong: 700,
	},
	displayLetterSpacing: '-0.02em',
	/** Small labels (subject, kicker) are set in capitals, cased by the video's language (see VideoFrame). */
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
	mathFallback: string;
	weights: Record<'display' | 'kinetic' | 'body' | 'strong', number>;
	displayLetterSpacing: string;
	labelTransform: ThemeTypography['labelTransform'];
	displayLineHeight: number;
	adScale: Record<'numeral' | 'hook' | 'headline' | 'closing' | 'action' | 'subtitle', number>;
};

const {families, weights, mathFallback} = BRAND_TYPOGRAPHY;

const textStack = (family: keyof typeof FONT_FAMILIES) => `'${FONT_FAMILIES[family]}', '${mathFallback}', sans-serif`;

/** The brand typography in the shape a theme carries. Every theme uses exactly this (a theme may only turn off the capitals). */
export const BRAND_THEME_TYPOGRAPHY: ThemeTypography = {
	display: textStack(families.display),
	body: textStack(families.body),
	mono: `'${FONT_FAMILIES[families.mono]}', monospace`,
	displayWeight: weights.display,
	bodyWeight: weights.body,
	strongWeight: weights.strong,
	displayScale: 1,
	displayLetterSpacing: BRAND_TYPOGRAPHY.displayLetterSpacing,
	labelTransform: BRAND_TYPOGRAPHY.labelTransform,
};

/**
 * Languages content is made in. The video's `lang` decides casing
 * (Turkish i → İ, German ß), hyphenation and quotation marks, so it must be
 * the language of the text, never a fixed one.
 */
const BRAND_LANGUAGES = ['tr', 'en', 'de', 'nl', 'fr', 'es', 'it', 'pl'] as const;
export type BrandLanguage = (typeof BRAND_LANGUAGES)[number];
export const DEFAULT_BRAND_LANGUAGE: BrandLanguage = 'tr';

/** Capitals in the text's language: "bilgi" → "BİLGİ" in Turkish, "BILGI" in English. Use instead of toUpperCase(). */
export const brandUpperCase = (text: string, language: BrandLanguage = DEFAULT_BRAND_LANGUAGE): string => text.toLocaleUpperCase(language);
