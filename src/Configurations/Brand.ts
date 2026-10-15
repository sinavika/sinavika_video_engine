/**
 * Brand identity and logo usage rules. Colours live in the themes; this file
 * holds what must stay constant no matter which theme a video uses.
 */
export const BRAND = {
	name: 'Sınavika',
	tagline: 'Yapay zekâ destekli sınav hazırlığı',
	callToAction: 'Sınavika ile çalışmaya devam et',
	logo: {
		/**
		 * The Sınavika lock-up ("Rafine" icon + wordmark, October 2026) as a white
		 * PNG with transparency, inside `public/`. Only its alpha channel is used:
		 * BrandMark paints it in the brand rule's colour, orange #EA580C on light
		 * backdrops and white on dark or orange ones. Icon and wordmark always
		 * share one colour. Source vectors: the logo delivery (`kaynak/*.svg`).
		 */
		src: 'Brand/SinavikaLogo.png',
		/** Width divided by height of the file (2000 x 526, cropped tight). */
		aspectRatio: 2000 / 526,
		/** Logo heights in reference pixels: in a template's top bar, and on the closing card. */
		sizes: {chrome: 56, hero: 210},
		/** Smallest allowed logo height, in reference pixels. */
		minHeight: 40,
		/** Clear space around the logo as a fraction of its height. */
		clearSpaceRatio: 0.12,
	},
} as const;

export type BrandLogoSize = keyof typeof BRAND.logo.sizes;
