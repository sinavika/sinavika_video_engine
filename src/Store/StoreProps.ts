import {z} from 'zod';
import {STORE_LANGUAGES, STORE_SLIDES, STORE_STYLES} from './StoreListing';

/** Props of the store picture composition, shared by the composition and the render script (which must not load browser code). */
export const STORE_COMPOSITION_ID = 'StoreScreenshot';

export const StoreScreenshotPropsSchema = z.object({
	lang: z.enum(STORE_LANGUAGES).default('tr'),
	look: z.enum(STORE_STYLES).default('acik'),
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

