import {z} from 'zod';
import {
	RENDER_QUALITY_IDS,
	VIDEO_FORMATS,
	VIDEO_FORMAT_IDS,
	qualityScale,
	type RenderQuality,
	type VideoFormatId,
} from '../Configurations/VideoFormats';
import {PACE_RANGE, VOICE_KEYS, VOICE_MODEL_KEYS, VOICE_PROFILE_KEYS} from '../Configurations/Voices';
import {OUTRO_SCENE_ID} from '../Scenes/BrandOutroScene';
import type {VoiceClips} from '../Scenes/Voiceover';
import {createVideoPropsSchema, type VideoProps} from '../Schemas/VideoProps';
import type {VoiceCast, VoiceoverRequest} from '../Services/VoiceCasting';
import type {VoiceLine} from '../Services/VoiceoverGenerator';
import {compositionId, templateDurationInFrames, type AnyTemplateDefinition} from '../Templates/TemplateDefinition';
import {TEMPLATE_IDS, findTemplate} from '../Templates/TemplateRegistry';

/**
 * A video job is the engine's whole public input: which template, how it
 * should look, and the content. It is plain JSON, so it can be written by
 * hand, produced by an LLM or sent by the .NET backend.
 */
export const VideoJobSchema = z.object({
	template: z.string().min(1),
	format: z.enum(VIDEO_FORMAT_IDS).default('Vertical'),
	/** Defaults to the template's own default theme. */
	theme: z.string().min(1).optional(),
	fps: z.number().optional(),
	quality: z.enum(RENDER_QUALITY_IDS).default('1080p'),
	/**
	 * `true` narrates the video in Turkish with the template's voice profile.
	 * An object casts differently: another profile, a specific voice from the
	 * catalogue, the steadier model, or a different tempo.
	 */
	voiceover: z
		.union([
			z.boolean(),
			z.object({
				profile: z.enum(VOICE_PROFILE_KEYS).optional(),
				voice: z.enum(VOICE_KEYS).optional(),
				model: z.enum(VOICE_MODEL_KEYS).optional(),
				pace: z.number().min(PACE_RANGE.min).max(PACE_RANGE.max).optional(),
			}),
		])
		.default(false),
	/** Validated against the chosen template's content schema. */
	content: z.unknown(),
});

export type VideoJob = z.input<typeof VideoJobSchema>;

export type ResolvedVideoJob = {
	template: AnyTemplateDefinition;
	compositionId: string;
	formatId: VideoFormatId;
	quality: RenderQuality;
	/** Output size after applying the quality scale. */
	width: number;
	height: number;
	scale: number;
	fps: number;
	durationInFrames: number;
	inputProps: VideoProps<unknown>;
	/** What the job asks of the narrator, or null for a silent video. */
	voiceover: VoiceoverRequest | null;
	/** Who ended up narrating. Set once the voice-over has been generated. */
	voiceCast: VoiceCast | null;
};

/** Thrown when a job is rejected. `issues` lists every problem with its JSON path. */
export class VideoJobValidationError extends Error {
	readonly issues: string[];

	constructor(issues: string[]) {
		super(`Invalid video job:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
		this.name = 'VideoJobValidationError';
		this.issues = issues;
	}
}

const describeIssues = (error: z.ZodError, prefix: string[] = []): string[] =>
	error.issues.map((issue) => {
		const path = [...prefix, ...issue.path.map(String)].join('.');
		return path ? `${path}: ${issue.message}` : issue.message;
	});

/**
 * Validates a job completely before any rendering starts: the envelope, the
 * template id, the theme and the content (including every formula in it).
 */
export const resolveVideoJob = (raw: unknown): ResolvedVideoJob => {
	const envelope = VideoJobSchema.safeParse(raw);
	if (!envelope.success) throw new VideoJobValidationError(describeIssues(envelope.error));
	const job = envelope.data;

	const template = findTemplate(job.template);
	if (!template) {
		throw new VideoJobValidationError([
			`template: unknown template "${job.template}". Available: ${TEMPLATE_IDS.join(', ')}`,
		]);
	}

	const props = createVideoPropsSchema(template.contentSchema, template.supportedThemes).safeParse({
		theme: job.theme ?? template.defaultTheme,
		fps: job.fps,
		content: job.content,
	});
	if (!props.success) throw new VideoJobValidationError(describeIssues(props.error));

	const format = VIDEO_FORMATS[job.format];
	const scale = qualityScale(job.quality);
	const inputProps = props.data as VideoProps<unknown>;

	return {
		template,
		compositionId: compositionId(template.id, job.format),
		formatId: job.format,
		quality: job.quality,
		width: Math.round(format.width * scale),
		height: Math.round(format.height * scale),
		scale,
		fps: inputProps.fps,
		durationInFrames: templateDurationInFrames(template, inputProps.content, inputProps.fps),
		inputProps,
		voiceover:
			job.voiceover === false
				? null
				: {profile: template.voiceProfile, ...(job.voiceover === true ? {} : job.voiceover)},
		voiceCast: null,
	};
};

/** Every line the video would speak, in order. */
export const voiceLines = (job: ResolvedVideoJob): VoiceLine[] =>
	job.template
		.buildScenes(job.inputProps.content)
		.flatMap((scene) => scene.voice ?? [])
		.map(({id, text}) => ({id, text}));

/** Complains when a video ends up outside the length its template is meant for. */
export const durationWarnings = (job: ResolvedVideoJob): string[] => {
	const target = job.template.targetSeconds;
	if (!target) return [];
	const outro = job.template
		.buildScenes(job.inputProps.content, job.inputProps.voiceClips)
		.find((scene) => scene.id === OUTRO_SCENE_ID);
	const seconds = job.durationInFrames / job.fps - (outro?.seconds ?? 0);
	return seconds < target.min || seconds > target.max
		? [`${job.template.id} runs ${seconds.toFixed(1)}s without its outro; it is meant to be ${target.min}-${target.max}s.`]
		: [];
};

/** The same job with generated audio attached; its duration now follows the clips. */
export const withVoiceClips = (
	job: ResolvedVideoJob,
	voiceClips: VoiceClips,
	voiceCast: VoiceCast | null = null,
): ResolvedVideoJob => ({
	...job,
	voiceCast,
	inputProps: {...job.inputProps, voiceClips},
	durationInFrames: templateDurationInFrames(job.template, job.inputProps.content, job.fps, voiceClips),
});
