/**
 * Brand identity and logo usage rules. Colours live in the themes; this file
 * holds what must stay constant no matter which theme a video uses.
 */
export const BRAND = {
	name: 'Sınavika',
	monogram: 'S',
	tagline: 'Yapay zekâ destekli sınav hazırlığı',
	callToAction: 'Sınavika ile çalışmaya devam et',
	logo: {
		/** Smallest allowed logo height, in reference pixels. */
		minHeight: 36,
		/** Clear space around the logo as a fraction of its height. */
		clearSpaceRatio: 0.5,
	},
} as const;
