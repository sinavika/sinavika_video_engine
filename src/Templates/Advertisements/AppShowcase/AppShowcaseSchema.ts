import {z} from 'zod';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {MODULE_KEYS} from '../../../UIUX/ModuleIdentity';
import {UI_SCREENS} from '../../../UIUX/Registry';

const narration = z.string().trim().min(1).max(160);

const MOBILE_IDS = new Set(UI_SCREENS.filter((screen) => screen.platform === 'mobile').map((screen) => screen.id));

/**
 * A screen in a phone: a mobile UI/UX drawing by id (src/UIUX, the same
 * drawings as Desktop\Sinavika-UIUX3). Never a capture of the live app
 * (owner, 14 Nov 2026).
 */
const ScreenId = z.string().refine((id) => MOBILE_IDS.has(id), {message: 'Bilinmeyen mobil UI/UX ekranı (m-…)'});

/** A region of the screen lifted out of the phone toward the camera (fractions of the 390 × 844 drawing). */
const PopSchema = z.object({x: z.number().min(0).max(1), y: z.number().min(0).max(1), w: z.number().min(0.1).max(1), h: z.number().min(0.03).max(0.6)});

const BeatSchema = z.object({
	module: z.enum(MODULE_KEYS),
	kicker: plainText(28),
	/** Two lines; the second sits on a white band. */
	headline: z.tuple([plainText(26), plainText(26)]),
	/** Screens the phone walks through during the beat, one after another (a short flow). */
	screens: z.array(ScreenId).min(1).max(4),
	/** Lifted from the first screen. */
	pop: PopSchema.optional(),
	narration,
});

export const AppShowcaseSchema = z.object({
	lang: z.enum(['tr', 'en']).default('tr'),
	/** The phone model drawn: Android for Google Play, iOS for the App Store. */
	variant: z.enum(['android', 'ios']).default('android'),
	hook: z.object({lines: z.tuple([plainText(24), plainText(24)]), screens: z.array(ScreenId).min(1).max(4), narration}),
	fan: z.object({headline: plainText(36), chips: z.array(plainText(18)).min(3).max(7), screens: z.tuple([ScreenId, ScreenId, ScreenId]), narration}),
	beats: z.array(BeatSchema).min(2).max(8),
	wall: z.object({lines: z.tuple([plainText(30), plainText(30)]), screens: z.array(ScreenId).min(6).max(12), narration}),
	closing: z.object({
		line: plainText(48),
		cta: plainText(24),
		screens: z.tuple([ScreenId, ScreenId, ScreenId]),
		narration,
	}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});

export type AppShowcaseContent = z.infer<typeof AppShowcaseSchema>;
export type ShowcaseBeat = AppShowcaseContent['beats'][number];

const read = (text: string, min: number, max = 5.6) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: max});

export const appShowcaseTimings = (content: AppShowcaseContent) => ({
	hook: read(content.hook.narration, 3.4),
	fan: read(content.fan.narration, 3.6),
	beats: content.beats.map((beat) => read(beat.narration, 3.4)),
	wall: read(content.wall.narration, 3.2),
	closing: read(content.closing.narration, 3.8, 5),
});
