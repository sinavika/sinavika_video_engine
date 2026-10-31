import {z} from 'zod';
import {APP_SCREEN_NAMES} from '../../../Components/AppScreens/AppScreenRegistry';
import {APP_MODES} from '../../../Components/AppScreens/AppScreenTokens';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';

export const APP_PROMOTION_MIN_SECONDS = 12;
export const APP_PROMOTION_MAX_SECONDS = 40;

const narration = z.string().trim().min(1).max(180);

export const AppPromotionSchema = z
	.object({
		/** The opening: a few words per line, set huge. */
		hook: z.object({
			lines: z.array(plainText(26)).min(1).max(3),
			/** The line drawn in the brand colour. Must be one of `lines`. */
			emphasis: plainText(26).optional(),
			narration,
		}),
		/** What the phone shows, one app screen per feature. */
		features: z
			.array(z.object({screen: z.enum(APP_SCREEN_NAMES), headline: plainText(32), narration}))
			.min(2)
			.max(6),
		/** The app theme shown on the phone. */
		appMode: z.enum(APP_MODES).default('light'),
		/** Voice-over text per line id (`hook`, `feature-1`, ..., `app-end-card`), replacing the content's own. */
		script: VoiceScriptSchema,
		/** The shared app card (Scenes/AppEndScene) closes the video; it can be dropped like any other outro. */
		outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	})
	.refine((content) => !content.hook.emphasis || content.hook.lines.includes(content.hook.emphasis), {
		path: ['hook', 'emphasis'],
		message: 'emphasis must be one of the hook lines.',
	});

export type AppPromotionContent = z.infer<typeof AppPromotionSchema>;

/** Scene durations in seconds when there is no voice-over to follow. */
export const appPromotionTimings = (content: AppPromotionContent) => ({
	hook: estimateReadingSeconds([content.hook.narration], {baseSeconds: 0.8, minSeconds: 2.4, maxSeconds: 6}),
	features: content.features.map((feature) => estimateReadingSeconds([feature.narration], {baseSeconds: 0.8, minSeconds: 2.6, maxSeconds: 7})),
});
