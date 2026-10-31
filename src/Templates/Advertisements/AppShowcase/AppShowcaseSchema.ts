import {z} from 'zod';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {MODULE_KEYS} from '../../../UIUX/ModuleIdentity';

const narration = z.string().trim().min(1).max(160);

/**
 * What a phone shows: a screen recording of the live app (cut and sped up
 * here, never re-encoded) or a still capture. 1080 × 2400 emulator captures;
 * paths are under public/.
 */
const ShowcaseClipSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('video'),
		src: z.string().min(1),
		/** Seconds into the recording where the beat starts and may end; after `until` the last frame holds. */
		from: z.number().min(0).default(0),
		until: z.number().positive(),
		rate: z.number().min(0.5).max(6).default(1),
	}),
	z.object({kind: z.literal('image'), src: z.string().min(1)}),
]);

/** A region of the capture lifted out of the phone toward the camera (fractions of the capture). */
const PopSchema = z.object({x: z.number().min(0).max(1), y: z.number().min(0).max(1), w: z.number().min(0.1).max(1), h: z.number().min(0.03).max(0.6)});

const BeatSchema = z.object({
	module: z.enum(MODULE_KEYS),
	kicker: plainText(28),
	/** Two lines; the second sits on a white band. */
	headline: z.tuple([plainText(26), plainText(26)]),
	clip: ShowcaseClipSchema,
	pop: PopSchema.optional(),
	narration,
});

export const AppShowcaseSchema = z.object({
	/** Under each phone: says the screen is the real app. */
	realLabel: plainText(40),
	lang: z.enum(['tr', 'en']).default('tr'),
	/** The phone model drawn: Android for Google Play, iOS for the App Store. */
	variant: z.enum(['android', 'ios']).default('android'),
	hook: z.object({lines: z.tuple([plainText(24), plainText(24)]), clip: ShowcaseClipSchema, narration}),
	fan: z.object({headline: plainText(36), chips: z.array(plainText(18)).min(3).max(7), screens: z.tuple([z.string(), z.string(), z.string()]), narration}),
	beats: z.array(BeatSchema).min(2).max(8),
	wall: z.object({lines: z.tuple([plainText(30), plainText(30)]), screens: z.array(z.string()).min(6).max(12), narration}),
	closing: z.object({
		line: plainText(48),
		cta: plainText(24),
		screens: z.tuple([z.string(), z.string(), z.string()]),
		narration,
	}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});

export type AppShowcaseContent = z.infer<typeof AppShowcaseSchema>;
export type ShowcaseBeat = AppShowcaseContent['beats'][number];
export type ShowcaseClip = z.infer<typeof ShowcaseClipSchema>;

const read = (text: string, min: number, max = 5.6) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: max});

export const appShowcaseTimings = (content: AppShowcaseContent) => ({
	hook: read(content.hook.narration, 3.4),
	fan: read(content.fan.narration, 3.6),
	beats: content.beats.map((beat) => read(beat.narration, 3.4)),
	wall: read(content.wall.narration, 3.2),
	closing: read(content.closing.narration, 3.8, 5),
});
