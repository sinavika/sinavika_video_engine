import {z} from 'zod';
import {BRAND} from '../Configurations/Brand';
import {DEFAULT_FPS, SUPPORTED_FPS} from '../Configurations/VideoFormats';
import {VoiceClipsSchema, type VoiceClips} from '../Scenes/Voiceover';
import type {ThemeId} from '../Themes/ThemeRegistry';

export const FpsSchema = z
	.number()
	.int()
	.refine((value) => (SUPPORTED_FPS as readonly number[]).includes(value), {
		message: `fps must be one of ${SUPPORTED_FPS.join(', ')}`,
	})
	.default(DEFAULT_FPS);

/** Closing brand card. Shared by every template. */
export const OutroSchema = z
	.object({
		enabled: z.boolean().default(true),
		callToAction: z.string().trim().min(1).max(80).default(BRAND.callToAction),
	})
	.default({enabled: true, callToAction: BRAND.callToAction});

export type Outro = z.infer<typeof OutroSchema>;

/**
 * Props of every composition: presentation settings next to the content,
 * never mixed into it. `content` is the template's own schema.
 */
export const createVideoPropsSchema = <Content extends z.ZodType>(
	contentSchema: Content,
	themes: readonly [ThemeId, ...ThemeId[]],
) =>
	z.object({
		theme: z.enum(themes),
		fps: FpsSchema,
		content: contentSchema,
		/** Filled in by the voice-over generator; scene durations follow the audio. */
		voiceClips: VoiceClipsSchema,
	});

export type VideoProps<Content> = {theme: ThemeId; fps: number; content: Content; voiceClips: VoiceClips};
