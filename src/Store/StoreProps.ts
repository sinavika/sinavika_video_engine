import {z} from 'zod';
import {STORE_LANGUAGES, STORE_SLIDES} from './StoreListing';

/** Props of the store picture composition (Store/StoreSet.tsx), shared by the composition and the render script (which must not load browser code). */
export const STORE_SET_ID = 'StoreSet';

/** Looks: Turuncu is the main set (owner, 14 Nov 2026); krem, lacivert and seritli (Turuncu with one ribbon running through all eight shots) are alternatives. */
export const STORE_LOOKS = ['turuncu', 'krem', 'lacivert', 'seritli'] as const;

export const StoreSetPropsSchema = z.object({
	look: z.enum(STORE_LOOKS).default('turuncu'),
	kind: z.enum(['shot', 'search', 'header', 'feature', 'watch', 'subicon']).default('shot'),
	/** Subscription icons: the Play product id (SUBSCRIPTION_ICONS). */
	product: z.string().optional(),
	/** Watch screenshots: the UI/UX drawing id (k-…). */
	screen: z.string().optional(),
	/** Shots only: the device drawn (iPad shows the tablet drawing, desktop the web page). */
	device: z.enum(['iphone', 'android', 'ipad', 'desktop', 'duoOuter', 'duoInner']).default('iphone'),
	/** Index in STORE_SLIDES. */
	slide: z.number().int().min(0).max(STORE_SLIDES.length - 1).default(0),
	/** App Store header and search: leave the phrase out. */
	textless: z.boolean().default(false),
	lang: z.enum(STORE_LANGUAGES).default('tr'),
	width: z.number().int().positive().max(6000).default(1206),
	height: z.number().int().positive().default(2622),
});
export type StoreSetProps = z.infer<typeof StoreSetPropsSchema>;
