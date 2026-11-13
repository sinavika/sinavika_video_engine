import {z} from 'zod';
import {STORE_LANGUAGES, STORE_SLIDES, STORE_STYLES} from './StoreListing';
import {STORE_SOURCES} from './StoreRealScreens';

/** Props of the store picture composition, shared by the composition and the render script (which must not load browser code). */
export const STORE_COMPOSITION_ID = 'StoreScreenshot';

export const StoreScreenshotPropsSchema = z.object({
	lang: z.enum(STORE_LANGUAGES).default('tr'),
	look: z.enum(STORE_STYLES).default('acik'),
	/** Drawn app screens, or emulator captures of the live app (public/Store/Real). */
	source: z.enum(STORE_SOURCES).default('drawn'),
	platform: z.enum(['ios', 'android']).default('ios'),
	device: z.enum(['phone', 'tablet', 'desktop', 'feature', 'header', 'search']).default('phone'),
	/** App Store creative: leave the copy out. */
	textless: z.boolean().default(false),
	/** Index in STORE_SLIDES (ignored for the feature graphic). */
	slide: z.number().int().min(0).max(STORE_SLIDES.length - 1).default(0),
	width: z.number().int().positive().max(6000).default(1206),
	height: z.number().int().positive().default(2622),
	tabletAspect: z.number().positive().default(0.75),
	canvasWidth: z.number().positive().default(680),
});
export type StoreScreenshotProps = z.infer<typeof StoreScreenshotPropsSchema>;

/** New store concepts (14 Nov 2026): look, kind and size; rendered for the owner's review board. */
export const STORE_CONCEPT_ID = 'StoreConcept';

export const StoreConceptPropsSchema = z.object({
	concept: z.enum(['defter', 'turuncu', 'lacivert']).default('defter'),
	kind: z.enum(['shot', 'search', 'header', 'feature']).default('shot'),
	/** First three iPhone shots: 0 Bugün, 1 adım adım, 2 net. */
	slide: z.number().int().min(0).max(2).default(0),
	lang: z.enum(STORE_LANGUAGES).default('tr'),
	width: z.number().int().positive().max(6000).default(1206),
	height: z.number().int().positive().default(2622),
});
export type StoreConceptProps = z.infer<typeof StoreConceptPropsSchema>;
