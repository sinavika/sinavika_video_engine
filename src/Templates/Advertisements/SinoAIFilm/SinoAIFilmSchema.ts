import {z} from 'zod';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';

const narration = z.string().trim().min(1).max(160);

export const SinoAIFilmSchema = z.object({
	/** Two lines that land one after the other on white. */
	hook: z.object({lines: z.tuple([plainText(40), plainText(40)]), narration}),
	/** The question typed into the composer. */
	ask: z.object({question: plainText(80), narration}),
	/** SinoAI's steps, lit one by one: what it looks at before answering. */
	think: z.object({steps: z.array(z.object({label: plainText(34), detail: plainText(32)})).min(2).max(4), narration}),
	/** The answer streaming in, then a short plan. */
	answer: z.object({text: plainText(140), plan: z.array(z.object({day: plainText(10), task: plainText(34)})).min(2).max(4), narration}),
	/** What SinoAI produced, sliding in as cards. */
	make: z.object({items: z.array(z.object({icon: z.enum(['quiz', 'cards', 'calendar', 'exam', 'book']), title: plainText(26), meta: plainText(32)})).min(2).max(4), narration}),
	/** Three words, one per beat. */
	words: z.object({words: z.tuple([plainText(10), plainText(10), plainText(10)]), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});

export type SinoAIFilmContent = z.infer<typeof SinoAIFilmSchema>;

export const SINO_FILM_CPS = 24;

export const sinoAIFilmTimings = (content: SinoAIFilmContent) => {
	const beat = (text: string, minSeconds: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds, maxSeconds: 7});
	return {
		hook: beat(content.hook.narration, 2.6),
		ask: Math.max(beat(content.ask.narration, 2.4), 0.6 + content.ask.question.length / SINO_FILM_CPS + 0.9),
		think: Math.max(beat(content.think.narration, 3), 0.5 + content.think.steps.length * 0.9 + 0.6),
		answer: Math.max(beat(content.answer.narration, 3), 0.4 + content.answer.text.length / 60 + 1.6),
		make: Math.max(beat(content.make.narration, 3), 0.4 + content.make.items.length * 0.45 + 1.6),
		words: Math.max(beat(content.words.narration, 2.2), 2.2),
	};
};
