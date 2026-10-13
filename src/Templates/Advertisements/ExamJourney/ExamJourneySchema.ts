import {z} from 'zod';
import {APP_SCREEN_NAMES} from '../../../Components/AppScreens/AppScreenRegistry';
import {APP_MODES} from '../../../Components/AppScreens/AppScreenTokens';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';

export const EXAM_JOURNEY_MIN_SECONDS = 12;
export const EXAM_JOURNEY_MAX_SECONDS = 32;

const narration = z.string().trim().min(1).max(140);
const headline = plainText(28);

export const ExamJourneySchema = z
	.object({
		/** The clock starts: the exam's name and its length in minutes. */
		start: z.object({exam: plainText(24), minutes: z.number().int().min(10).max(240), headline, narration}),
		/** One question being answered. `pick` is the index of the option that gets tapped. */
		solve: z.object({
			context: plainText(40),
			question: plainText(110),
			options: z.array(plainText(16)).min(3).max(5),
			pick: z.number().int().min(0),
			headline,
			narration,
		}),
		/** The result as a line that draws itself: one value per past exam, oldest first. */
		result: z.object({caption: plainText(24), trend: z.array(z.number().min(0)).min(3).max(10), headline, narration}),
		/** Progress per lesson, 0 to 1. The lowest one is pointed out with `tag`. */
		gaps: z.object({
			lessons: z.array(z.object({name: plainText(16), level: z.number().min(0.05).max(1)})).min(3).max(5),
			tag: plainText(22),
			headline,
			narration,
		}),
		/** The app itself, on a phone. */
		product: z.object({screen: z.enum(APP_SCREEN_NAMES), headline, narration}),
		closing: z.object({
			callToAction: plainText(26),
			website: plainText(30).default('sinavika.com'),
			/** Where to get the app, as plain names. Store logos are trademarks and are not drawn. */
			stores: z.array(plainText(20)).max(2).default(['App Store', 'Google Play']),
			narration,
		}),
		/** The app theme shown on the phone. */
		appMode: z.enum(APP_MODES).default('light'),
		/** Narration shown as subtitles, for viewers watching without sound. */
		subtitles: z.boolean().default(true),
		/** Voice-over text per line id (`start`, `solve`, `result`, `gaps`, `product`, `closing`), replacing the content's own. */
		script: VoiceScriptSchema,
		/** The closing card is this template's outro; it can be dropped like any other. */
		outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	})
	.refine((content) => content.solve.pick < content.solve.options.length, {path: ['solve', 'pick'], message: 'pick must be the index of one of the options.'});

export type ExamJourneyContent = z.infer<typeof ExamJourneySchema>;

/** Scene durations in seconds when there is no voice-over to follow. */
export const examJourneyTimings = (content: ExamJourneyContent) => {
	const beat = (text: string, minSeconds: number) => estimateReadingSeconds([text], {baseSeconds: 1.4, minSeconds, maxSeconds: 6});
	return {
		start: beat(content.start.narration, 2.6),
		solve: beat(content.solve.narration, 3.6),
		result: beat(content.result.narration, 3.2),
		gaps: beat(content.gaps.narration, 3.6),
		product: beat(content.product.narration, 3),
		closing: beat(content.closing.narration, 2.8),
	};
};
