import {z} from 'zod';
import {pronounceAbbreviations} from '../Schemas/SpokenText';

/**
 * Voice-over model. A scene declares what should be said (`VoiceSlot`); a
 * generated audio file for a line is a `VoiceClip`. Everything here is pure:
 * producing the audio is the job of src/Services.
 */
const VoiceClipSchema = z.object({
	/** Path inside `public/`. A narration is one file; its lines are parts of it. */
	src: z.string().min(1),
	/** Where this line begins inside the file, at the voice's natural pace. */
	startSeconds: z.number().min(0).default(0),
	/** How long the clip lasts in the video, i.e. at its playback rate. */
	durationSeconds: z.number().positive(),
	/** Tempo the clip is played at; 1 is the voice's natural pace. */
	playbackRate: z.number().min(0.5).max(2).default(1),
	/** The spoken words and when each starts, in seconds of the clip as played. Narrations made before 26 Oct 2026 have none. */
	words: z.array(z.object({text: z.string(), startSeconds: z.number().min(0)})).optional(),
});

export type VoiceClip = z.infer<typeof VoiceClipSchema>;

/** Clips keyed by voice line id. Empty when a video has no voice-over. */
export const VoiceClipsSchema = z.record(z.string(), VoiceClipSchema).default({});
export type VoiceClips = z.infer<typeof VoiceClipsSchema>;

/**
 * Optional per-line script overrides in a template's content, keyed by voice
 * line id (`intro`, `step-2`, `summary`, ...). Use it when the automatic line
 * does not read well, e.g. for formulas.
 */
export const VoiceScriptSchema = z.record(z.string(), z.string().trim().min(1).max(700)).default({});

/** One spoken line and the time reserved for it. A scene plays its slots one after another. */
export type VoiceSlot = {id: string; text: string; seconds: number};

/** Silence before a line starts (covers the scene transition) and after it ends. Kept short: longer gaps between scenes sounded like the narrator hesitating (owner feedback, 20 Oct 2026). */
export const VOICE_LEAD_SECONDS = 0.3;
export const VOICE_TAIL_SECONDS = 0.15;

export type Narrator = (
	id: string,
	text: string,
	/** Duration when there is no audio for this line. */
	estimateSeconds: number,
	/** Shortest duration even if the audio is brief, so the scene's own animations can finish. */
	floorSeconds?: number,
) => VoiceSlot;

/**
 * Decides text and duration of every voice line. With a clip, the audio
 * length drives the duration; without one, the reading-time estimate does.
 */
export const createNarrator = (clips: VoiceClips, script: Record<string, string> = {}): Narrator =>
	(id, text, estimateSeconds, floorSeconds = 0) => {
		const clip = clips[id];
		const spoken = clip ? clip.durationSeconds + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS : estimateSeconds;
		return {
			id,
			text: script[id] ?? text,
			seconds: Math.round(Math.max(spoken, clip ? floorSeconds : 0) * 10) / 10,
		};
	};

export const totalSeconds = (slots: readonly VoiceSlot[]): number =>
	slots.reduce((total, slot) => total + slot.seconds, 0);

/**
 * Where each spoken line of a scene plays: its narration file, the second of
 * the file it starts at, and the second of the scene it starts at, exactly as
 * SceneSeries plays them (one after another, each after the voice's lead).
 * For visuals that follow the voice, such as SinoAI's orb.
 */
export const voiceTracksOf = (slots: readonly VoiceSlot[], clips: VoiceClips) => {
	let offset = 0;
	return slots.flatMap((slot) => {
		const clip = clips[slot.id];
		const start = offset + VOICE_LEAD_SECONDS;
		offset += slot.seconds;
		return clip ? [{src: clip.src, fileStartSeconds: clip.startSeconds, sceneStartSeconds: start, durationSeconds: clip.durationSeconds, playbackRate: clip.playbackRate}] : [];
	});
};

/** Lower-case words of a text as the voice says them: abbreviations read out ("YKS" → "yekase"), punctuation and apostrophes dropped. */
const spokenTokens = (text: string): string[] =>
	pronounceAbbreviations(text)
		.toLocaleLowerCase('tr')
		.replace(/['’]/g, '')
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean);

/** How far ahead of the word a picture lands, as an editor cuts on the beat. */
const CUE_LEAD_SECONDS = 0.08;

/**
 * When each phrase is heard in a spoken line, in seconds from the start of the
 * line's scene (the line is the scene's first voice slot), searching in order:
 * a phrase is looked for after the previous one. With the clip's word timings
 * (narrations made since 26 Oct 2026) the moment is the word's own; without
 * them it is placed by where the phrase sits in the text, over the line's
 * length. A phrase that is not in the line gets its `fallback`.
 *
 * Templates use it so that what is drawn arrives with the words that name it,
 * never before (owner, 26 Oct 2026: "söylemler olurken bir sonraki kart çıkıyor").
 */
export const phraseCues = (clip: VoiceClip | undefined, lineText: string, phrases: readonly string[], fallback: readonly number[], estimateSeconds?: number): number[] => {
	const spoken = spokenWords(clip, lineText, estimateSeconds);
	let from = 0;
	return phrases.map((phrase, index) => {
		const at = spoken ? findTokens(spoken.tokens, spokenTokens(phrase), from) : -1;
		if (!spoken || at < 0) return fallback[index] ?? 0;
		from = at + spokenTokens(phrase).length;
		return Math.max(0, VOICE_LEAD_SECONDS + spoken.seconds[at] - CUE_LEAD_SECONDS);
	});
};

/**
 * The words of a spoken line and when each starts, in seconds of the line: the clip's own word timings, or without
 * them the words spread evenly over the line's length. Null when neither is known.
 */
export const spokenWords = (clip: VoiceClip | undefined, lineText: string, estimateSeconds?: number): {tokens: string[]; seconds: number[]} | null => {
	const timed = clip?.words?.flatMap((word) => spokenTokens(word.text).map((token) => ({token, startSeconds: word.startSeconds})));
	if (timed?.length) return {tokens: timed.map((entry) => entry.token), seconds: timed.map((entry) => entry.startSeconds)};
	const lineSeconds = clip?.durationSeconds ?? estimateSeconds;
	if (lineSeconds === undefined) return null;
	const tokens = spokenTokens(lineText);
	return {tokens, seconds: tokens.map((_, index) => (lineSeconds * index) / Math.max(1, tokens.length))};
};

/** Where `wanted` starts in `tokens`, from `from` on; the last word may be cut short ("anlaşıl" in "anlaşılır"). -1 when it is not there. */
export const findTokens = (tokens: readonly string[], wanted: readonly string[], from = 0): number => {
	for (let start = from; wanted.length > 0 && start + wanted.length <= tokens.length; start++) {
		if (wanted.every((token, offset) => tokens[start + offset] === token || (offset === wanted.length - 1 && tokens[start + offset].startsWith(token)))) return start;
	}
	return -1;
};

export {spokenTokens, CUE_LEAD_SECONDS};
