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

/**
 * One spoken line and the time reserved for it. A scene plays its slots one after another; the voice starts `lead`
 * seconds into its slot (VOICE_LEAD_SECONDS unless the template set a line gap of its own).
 */
export type VoiceSlot = {id: string; text: string; seconds: number; lead?: number};

/** Silence before a line starts (covers the scene transition) and after it ends. Kept short: longer gaps between scenes sounded like the narrator hesitating (owner feedback, 20 Oct 2026). */
export const VOICE_LEAD_SECONDS = 0.3;
export const VOICE_TAIL_SECONDS = 0.15;

/**
 * The silence a template leaves around its lines: `lead` before each, `tail` after it, and with `trimTail` the
 * recording's own silence after its last word cut to TRIM_KEEP_SECONDS. Lessons and camps keep the defaults; story
 * reels set a tight gap (SINAVIKA_TR_TEMPO.lineGap): with the defaults 0.6–0.95 s of silence followed every line,
 * about a fifth of a reel (Sosyal Medya, 15 Nov 2026).
 */
type LineGap = {lead: number; tail: number; trimTail?: boolean};

/** Silence kept after a line's last word when its tail is trimmed. */
const TRIM_KEEP_SECONDS = 0.1;

/** Seconds a spoken word lasts at most per letter, and at least: for telling where a line's last word ends. */
const WORD_SECONDS_PER_LETTER = 0.075;
const WORD_MIN_SECONDS = 0.25;

/**
 * How long a clip speaks: up to the end of its last word plus a breath (TRIM_KEEP_SECONDS), never longer than the
 * clip. The last word's end is estimated from its letters, generously, so a word is never cut. Without word timings
 * the whole clip counts.
 */
export const spokenSeconds = (clip: VoiceClip): number => {
	const last = clip.words?.at(-1);
	if (!last) return clip.durationSeconds;
	const letters = last.text.replace(/[^\p{L}\p{N}]/gu, '').length;
	return Math.min(clip.durationSeconds, last.startSeconds + Math.max(WORD_MIN_SECONDS, letters * WORD_SECONDS_PER_LETTER) + TRIM_KEEP_SECONDS);
};

/** Where in its slot a line's voice starts. */
export const slotLead = (slot: Pick<VoiceSlot, 'lead'>): number => slot.lead ?? VOICE_LEAD_SECONDS;

/**
 * The brand voice's pace in letters of spoken text per second (numbers, abbreviations and formulas as they are
 * said), pauses inside a line included: the median of 1,770 cached lines was 11.1 (1 Nov 2026).
 */
const NARRATION_LETTERS_PER_SECOND = 11;

/**
 * How long the voice takes to say a line, before its audio exists. Reading-time estimates (3.3 words a second) are
 * for text on screen: eleven rendered TYT Türkçe lessons ran 1.52 to 1.57 times them (05 Paragraf: 1518 s
 * estimated, 2363 s rendered; render notes, 1 Nov 2026). Measured in letters, not words, since spelled-out letters
 * and numbers read as words are short.
 */
export const estimateNarrationSeconds = (text: string): number => pronounceAbbreviations(text).replace(/[^\p{L}\p{N}]/gu, '').length / NARRATION_LETTERS_PER_SECOND;

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
export const createNarrator = (clips: VoiceClips, script: Record<string, string> = {}, gap?: LineGap): Narrator =>
	(id, text, estimateSeconds, floorSeconds = 0) => {
		const clip = clips[id];
		const lead = gap?.lead ?? VOICE_LEAD_SECONDS;
		const tail = gap?.tail ?? VOICE_TAIL_SECONDS;
		const voice = clip ? (gap?.trimTail ? spokenSeconds(clip) : clip.durationSeconds) : 0;
		const spoken = clip ? voice + lead + tail : estimateSeconds;
		// A tight gap is timed to the frame, not to a tenth of a second: rounding up alone added up to 0.1 s a line.
		const step = gap ? 30 : 10;
		return {
			id,
			text: script[id] ?? text,
			seconds: Math.round(Math.max(spoken, clip ? floorSeconds : 0) * step) / step,
			...(gap ? {lead} : {}),
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
		const start = offset + slotLead(slot);
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
export const phraseCues = (clip: VoiceClip | undefined, lineText: string, phrases: readonly string[], fallback: readonly number[], estimateSeconds?: number, lead = VOICE_LEAD_SECONDS): number[] =>
	phraseTimes(clip, lineText, phrases, estimateSeconds, lead).map((at, index) => at ?? fallback[index] ?? 0);

/**
 * When each phrase is heard, searched in order as phraseCues does; undefined for a phrase the line never says, so a
 * scene can tell a named item from one it only shows (the bars ÖSYM data adds after the narrated ones).
 */
export const phraseTimes = (clip: VoiceClip | undefined, lineText: string, phrases: readonly string[], estimateSeconds?: number, lead = VOICE_LEAD_SECONDS): (number | undefined)[] => {
	const spoken = spokenWords(clip, lineText, estimateSeconds);
	let from = 0;
	return phrases.map((phrase) => {
		const at = spoken ? findTokens(spoken.tokens, spokenTokens(phrase), from) : -1;
		if (!spoken || at < 0) return undefined;
		from = at + spokenTokens(phrase).length;
		return Math.max(0, lead + spoken.seconds[at] - CUE_LEAD_SECONDS);
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
