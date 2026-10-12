import {z} from 'zod';

/**
 * Optional timing every scene-like item accepts.
 * - `durationSeconds` pins the duration, e.g. to the length of a voice-over clip.
 * - `narration` is the script to be spoken; when present it drives the duration.
 * With neither, the duration is estimated from how long the text takes to read.
 */
export const SceneTimingSchema = z.object({
	durationSeconds: z.number().min(0.5).max(180).optional(),
	narration: z.string().trim().max(2000).optional(),
});

export type SceneTimingInput = z.infer<typeof SceneTimingSchema>;

const READING_WORDS_PER_SECOND = 3.3;
const NARRATION_WORDS_PER_SECOND = 2.3;

export type DurationBounds = {baseSeconds?: number; minSeconds?: number; maxSeconds?: number};

/** Counts words; a LaTeX command or formula token counts like a word. */
export const countWords = (text: string): number =>
	text
		.replace(/\$|\*\*/g, ' ')
		.replace(/\\[a-zA-Z]+/g, ' x ')
		.replace(/[{}^_]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;

const roundToTenth = (seconds: number): number => Math.round(seconds * 10) / 10;

export const estimateReadingSeconds = (
	texts: readonly (string | undefined)[],
	{baseSeconds = 1.5, minSeconds = 2.5, maxSeconds = 16}: DurationBounds = {},
): number => {
	const words = texts.reduce((total, text) => total + (text ? countWords(text) : 0), 0);
	const seconds = baseSeconds + words / READING_WORDS_PER_SECOND;
	return roundToTenth(Math.min(maxSeconds, Math.max(minSeconds, seconds)));
};

export const resolveSceneSeconds = (
	timing: SceneTimingInput,
	texts: readonly (string | undefined)[],
	bounds: DurationBounds = {},
): number => {
	if (timing.durationSeconds !== undefined) return timing.durationSeconds;
	if (timing.narration) {
		const spoken = 0.6 + countWords(timing.narration) / NARRATION_WORDS_PER_SECOND;
		return roundToTenth(Math.max(bounds.minSeconds ?? 2.5, spoken));
	}
	return estimateReadingSeconds(texts, bounds);
};
