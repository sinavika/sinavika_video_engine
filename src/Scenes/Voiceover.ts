import {z} from 'zod';

/**
 * Voice-over model. A scene declares what should be said (`VoiceSlot`); a
 * generated audio file for a line is a `VoiceClip`. Everything here is pure:
 * producing the audio is the job of src/Services.
 */
export const VoiceClipSchema = z.object({
	/** Path inside `public/`. A narration is one file; its lines are parts of it. */
	src: z.string().min(1),
	/** Where this line begins inside the file, at the voice's natural pace. */
	startSeconds: z.number().min(0).default(0),
	/** How long the clip lasts in the video, i.e. at its playback rate. */
	durationSeconds: z.number().positive(),
	/** Tempo the clip is played at; 1 is the voice's natural pace. */
	playbackRate: z.number().min(0.5).max(2).default(1),
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
