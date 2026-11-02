import type {VoiceClips} from '../Scenes/Voiceover';

/**
 * Checks the narration as it came back from ElevenLabs, from its word timings: a line read much faster or slower than
 * the voice's own pace (a formula rushed through, a sentence dragged), and a long silence inside a sentence (the
 * voice stopping mid-thought). It costs nothing: the timings come with the audio and are cached with it. The findings
 * are render warnings, listened to before a video goes out.
 */

/** A line counts when it has at least this many words; a two-word line's pace says little. */
const MIN_WORDS = 6;
/** A line this much faster or slower than the narration's median pace is reported. */
const PACE_RATIO = {fast: 1.45, slow: 0.6};
/** A gap this long between two word starts inside a line, beyond the time the words themselves take. */
const PAUSE_SECONDS = 1.6;
/** Seconds a word takes, roughly, for telling a pause from a long word. */
const SECONDS_PER_LETTER = 0.065;

const median = (values: readonly number[]) => {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** The letters of a spoken word, without its punctuation. */
const letters = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, '').length;

/**
 * Letters per second of each line long enough to measure. Words per second misjudged lines full of short spoken
 * words: "ÖSYM 2023 ve 2026'da" is read as a dozen syllable-long words (letters spelled out, years in words), and a
 * lead-in read at the usual pace was reported as rushed at 1.5 times (TYT Türkçe 12 render, 1 Nov 2026).
 */
const paces = (clips: VoiceClips) =>
	Object.entries(clips).flatMap(([id, clip]) => {
		if (!clip.words || clip.words.length < MIN_WORDS || clip.durationSeconds <= 0) return [];
		const spoken = clip.words.reduce((sum, word) => sum + letters(word.text), 0);
		return spoken > 0 ? [{id, clip, pace: spoken / clip.durationSeconds}] : [];
	});

export const narrationPacingWarnings = (clips: VoiceClips): string[] => {
	const measured = paces(clips);
	if (measured.length < 3) return [];
	const usual = median(measured.map((line) => line.pace));
	const warnings: string[] = [];
	for (const {id, clip, pace} of measured) {
		const ratio = pace / usual;
		if (ratio > PACE_RATIO.fast) warnings.push(`Seslendirme: "${id}" satırı olağan hızın ${ratio.toFixed(1)} katı hızlı okundu; dinleyip gerekirse cümleyi bölün.`);
		if (ratio < PACE_RATIO.slow) warnings.push(`Seslendirme: "${id}" satırı olağan hızın yarısı kadar yavaş okundu; uzun bir duraklama olabilir.`);
		const words = clip.words ?? [];
		for (let index = 1; index < words.length; index++) {
			const gap = words[index].startSeconds - words[index - 1].startSeconds - words[index - 1].text.length * SECONDS_PER_LETTER;
			if (gap > PAUSE_SECONDS && !/[.!?…:;]$/.test(words[index - 1].text)) {
				warnings.push(`Seslendirme: "${id}" satırında "${words[index - 1].text}" ile "${words[index].text}" arasında ${gap.toFixed(1)} sn sessizlik var.`);
			}
		}
	}
	return warnings;
};
