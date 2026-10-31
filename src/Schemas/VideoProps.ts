import {z} from 'zod';
import {DEFAULT_FPS, SUPPORTED_FPS} from '../Configurations/VideoFormats';
import {VoiceClipsSchema, type VoiceClips} from '../Scenes/Voiceover';
import type {ThemeId} from '../Themes/ThemeRegistry';

const FpsSchema = z
	.number()
	.int()
	.refine((value) => (SUPPORTED_FPS as readonly number[]).includes(value), {
		message: `fps must be one of ${SUPPORTED_FPS.join(', ')}`,
	})
	.default(DEFAULT_FPS);

/** The closing app card (Scenes/AppEndScene), the same in every video; content can only turn it off. */
export const OutroSchema = z
	.object({
		enabled: z.boolean().default(true),
	})
	.default({enabled: true});

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
		/** The lesson whose colour tints the accent on the brand themes. See Configurations/LessonColors. */
		lesson: z.string().optional(),
		/** Path of the cover image inside `public/`; shown for the first moment of the video. Set by the renderer. */
		coverSrc: z.string().optional(),
		/** Path of the music and sound-design track inside `public/`. Set by the renderer. */
		soundtrackSrc: z.string().optional(),
		/** Report unreadable text (overflow, overlaps) as render warnings. Set by stills and sweeps (Components/Layouts/LayoutGuard). */
		layoutGuard: z.boolean().optional(),
		/** The music's beat grid, in seconds from the start; cuts land on these (Scenes/Rhythm). Set by the renderer. */
		beats: z.array(z.number().nonnegative()).max(2000).optional(),
	});

export type VideoProps<Content> = {theme: ThemeId; fps: number; content: Content; voiceClips: VoiceClips; lesson?: string; coverSrc?: string; soundtrackSrc?: string; layoutGuard?: boolean; beats?: number[]};
