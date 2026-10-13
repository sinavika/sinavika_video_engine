import {z} from 'zod';
import {APP_SCREEN_NAMES} from '../../../Components/AppScreens/AppScreenRegistry';
import {APP_MODES} from '../../../Components/AppScreens/AppScreenTokens';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';

export const MOBILE_PROMOTION_MIN_SECONDS = 12;
export const MOBILE_PROMOTION_MAX_SECONDS = 30;

const narration = z.string().trim().min(1).max(140);
const screen = z.enum(APP_SCREEN_NAMES);

export const MobilePromotionSchema = z
	.object({
		/** The opening question, set huge, one word at a time. */
		question: z.object({
			text: plainText(44),
			/** Words of the question drawn in the brand colour. Must occur in `text`. */
			emphasis: plainText(24).optional(),
			narration,
		}),
		/** The story in steps: one app screen and one short command each. */
		steps: z
			.array(
				z.object({
					screen,
					headline: plainText(26),
					narration,
					/**
					 * The part of the screen an outline points at, as fractions of the
					 * screen height. The outline is drawn outside the app: it never
					 * changes what the screen shows.
					 */
					focus: z.object({top: z.number().min(0).max(0.95), height: z.number().min(0.05).max(1)}).optional(),
				}),
			)
			.min(2)
			.max(3),
		/** The step screens side by side: one product. */
		together: z.object({headline: plainText(30), narration}),
		/** The product on its own, with the call to action. */
		action: z.object({screen, headline: plainText(26), button: plainText(26), narration}),
		closing: z.object({
			website: plainText(30).default('sinavika.com'),
			/** Where to get the app, as plain names. Store logos are trademarks and are not drawn. */
			stores: z.array(plainText(20)).max(2).default(['App Store', 'Google Play']),
			narration,
		}),
		/** The app theme shown on the phones. */
		appMode: z.enum(APP_MODES).default('light'),
		/** Narration shown as subtitles, for viewers watching without sound. */
		subtitles: z.boolean().default(true),
		/** Voice-over text per line id (`question`, `step-1`, ..., `together`, `action`, `closing`), replacing the content's own. */
		script: VoiceScriptSchema,
		/** The brand card is this template's outro; it can be dropped like any other. */
		outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	})
	.refine((content) => !content.question.emphasis || content.question.text.includes(content.question.emphasis), {
		path: ['question', 'emphasis'],
		message: 'emphasis must occur in the question text.',
	})
	.refine((content) => content.steps.every((step) => !step.focus || step.focus.top + step.focus.height <= 1), {
		path: ['steps'],
		message: 'focus must stay inside the screen (top + height at most 1).',
	});

export type MobilePromotionContent = z.infer<typeof MobilePromotionSchema>;

/** Scene durations in seconds when there is no voice-over to follow. */
export const mobilePromotionTimings = (content: MobilePromotionContent) => {
	const beat = (text: string, minSeconds: number) => estimateReadingSeconds([text], {baseSeconds: 1.4, minSeconds, maxSeconds: 6});
	return {
		question: beat(content.question.narration, 3),
		steps: content.steps.map((step, index) => beat(step.narration, index === 0 ? 3 : 4)),
		together: beat(content.together.narration, 4),
		action: beat(content.action.narration, 3.6),
		closing: beat(content.closing.narration, 2.6),
	};
};
