import {CUE_LEAD_SECONDS, VOICE_LEAD_SECONDS, type VoiceClip} from '../../Scenes/Voiceover';

/**
 * Story reels cut on the voice: something new every 0.5–1.5 s (sinavika.tr, owner 15 Nov 2026: "akış çok yavaş"). A
 * sub-beat is a run of words short enough to get its own picture change; `at` is when it starts, in seconds of the
 * scene, a moment before the first word is heard (as phraseCues lands a word).
 */
type SubBeat = {at: number; text: string};

/** A sub-beat ends at punctuation once it is at least this long; shorter runs join the next. */
const MIN_BEAT_SECONDS = 0.45;
/** Word times are decimals: 2.35 − 1.15 is 1.2000000000000002, which must still fit a 1.2 s beat. */
const EPSILON = 1e-6;

/**
 * Splits a narrated line into sub-beats of at most `maxSeconds`, from the clip's own word timings (or, before the
 * audio exists, the words spread over `estimateSeconds`). A beat breaks after a comma or full stop when it can, else
 * at the last word that keeps it short enough. Empty when nothing is known about the line's timing. `lead` is where
 * the line's voice starts in its slot: the template's LineGap lead when it sets one.
 */
export const subBeats = (clip: VoiceClip | undefined, lineText: string, maxSeconds = 1.2, estimateSeconds?: number, lead = VOICE_LEAD_SECONDS): SubBeat[] => {
	const words = clip?.words?.length
		? clip.words.map((word) => ({text: word.text, start: word.startSeconds}))
		: estimateSeconds
			? lineText
					.split(/\s+/)
					.filter(Boolean)
					.map((text, index, texts) => ({text, start: (estimateSeconds * index) / texts.length}))
			: [];
	if (words.length === 0) return [];
	// A beat lasts until the next one starts; the last one until the line ends.
	const lineEnd = clip?.durationSeconds ?? estimateSeconds ?? words[words.length - 1].start + 0.4;
	const endOf = (index: number) => (index + 1 < words.length ? words[index + 1].start : lineEnd);
	const beats: SubBeat[] = [];
	let first = 0;
	while (first < words.length) {
		let last = first;
		let pause = -1;
		while (last + 1 < words.length && endOf(last + 1) - words[first].start <= maxSeconds + EPSILON) {
			if (/[,.;:!?…]$/.test(words[last].text) && endOf(last) - words[first].start >= MIN_BEAT_SECONDS) pause = last;
			last++;
		}
		// The whole rest fits: one beat. Otherwise break at the last pause inside the span, else where it ran out.
		const end = last === words.length - 1 && endOf(last) - words[first].start <= maxSeconds + EPSILON ? last : pause >= 0 ? pause : last;
		beats.push({at: Math.max(0, lead + words[first].start - CUE_LEAD_SECONDS), text: words.slice(first, end + 1).map((word) => word.text).join(' ')});
		first = end + 1;
	}
	return beats;
};
