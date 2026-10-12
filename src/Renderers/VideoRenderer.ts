import {existsSync} from 'node:fs';
import {copyFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {planTemplateScenes} from '../Scenes/SceneSeries';
import type {SpeechBackend} from '../Services/ElevenLabsSpeech';
import type {VoiceCast} from '../Services/VoiceCasting';
import {generateVoiceover} from '../Services/VoiceoverGenerator';
import {durationWarnings, resolveVideoJob, voiceLines, withVoiceClips, type ResolvedVideoJob} from './VideoJob';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, 'public');

export type RenderStage = 'voiceover' | 'bundling' | 'rendering' | 'encoding';

export type RenderProgress = {
	stage: RenderStage;
	/** Overall progress of the current stage, 0 to 1. */
	progress: number;
	renderedFrames?: number;
	encodedFrames?: number;
	totalFrames?: number;
};

export type RenderOptions = {
	outputPath: string;
	onProgress?: (progress: RenderProgress) => void;
	/** Parallel browser tabs. Defaults to Remotion's choice (half the CPU threads). */
	concurrency?: number;
	/** Skip narration even if the job asks for it, e.g. for quick layout checks. */
	withoutVoiceover?: boolean;
	/** Replaces ElevenLabs. Used by tests to stay offline. */
	speech?: SpeechBackend;
};

export type RenderResult = {
	outputPath: string;
	compositionId: string;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	durationSeconds: number;
	elapsedMilliseconds: number;
	/** Number of narrated lines; 0 for a silent video. */
	voiceLineCount: number;
	/** Who narrated: voice, model and tempo. Null for a silent video. */
	voiceCast: VoiceCast | null;
	/** Problems the page reported while rendering, e.g. text that could not be fitted. */
	warnings: string[];
};

/** A failure after validation: bundling, the browser, or encoding. */
export class VideoRenderError extends Error {
	readonly stage: RenderStage;

	constructor(stage: RenderStage, cause: unknown) {
		const reason = cause instanceof Error ? cause.message : String(cause);
		super(`Video render failed while ${stage}: ${reason}`, {cause});
		this.name = 'VideoRenderError';
		this.stage = stage;
	}
}

let bundleLocation: Promise<string> | null = null;

/** Bundles the Remotion project once per process; later renders reuse the bundle. */
export const bundleProject = (onProgress?: (progress: number) => void): Promise<string> => {
	bundleLocation ??= bundle({
		entryPoint: path.join(PROJECT_ROOT, 'src', 'index.ts'),
		publicDir: PUBLIC_DIRECTORY,
		onProgress: (percent) => onProgress?.(percent / 100),
	}).catch((error) => {
		bundleLocation = null;
		throw new VideoRenderError('bundling', error);
	});
	return bundleLocation;
};

type PageLog = {type: string; text: string};

const collectWarnings = (warnings: string[]) => (log: PageLog) => {
	if (log.type === 'warning' || log.type === 'error') warnings.push(log.text);
};

/**
 * Generates the narration for a job (or reuses cached clips) and returns the
 * job timed to it. Jobs without voice-over are returned unchanged.
 */
export const narrateVideoJob = async (
	job: ResolvedVideoJob,
	onProgress?: (progress: RenderProgress) => void,
	speech?: SpeechBackend,
): Promise<ResolvedVideoJob> => {
	if (!job.voiceover) return job;
	onProgress?.({stage: 'voiceover', progress: 0});
	try {
		const {clips, cast} = await generateVoiceover(voiceLines(job), job.voiceover, {
			publicDirectory: PUBLIC_DIRECTORY,
			speech,
			onProgress: (done, total) => onProgress?.({stage: 'voiceover', progress: done / total}),
		});
		return withVoiceClips(job, clips, cast);
	} catch (error) {
		throw new VideoRenderError('voiceover', error);
	}
};

/** The bundle is a snapshot of `public/`; clips generated after it was made are added to it here. */
const publishVoiceClips = async (job: ResolvedVideoJob, serveUrl: string): Promise<void> => {
	for (const clip of Object.values(job.inputProps.voiceClips)) {
		const target = path.join(serveUrl, 'public', clip.src);
		if (existsSync(target)) continue;
		await mkdir(path.dirname(target), {recursive: true});
		await copyFile(path.join(PUBLIC_DIRECTORY, clip.src), target);
	}
};

const prepare = async (rawJob: unknown, options: RenderOptions) => {
	// Throws VideoJobValidationError before any expensive work begins.
	const resolved = resolveVideoJob(rawJob);
	const job = options.withoutVoiceover ? resolved : await narrateVideoJob(resolved, options.onProgress, options.speech);
	options.onProgress?.({stage: 'bundling', progress: 0});
	const serveUrl = await bundleProject((progress) => options.onProgress?.({stage: 'bundling', progress}));
	await publishVoiceClips(job, serveUrl);
	const outputPath = path.resolve(options.outputPath);
	await mkdir(path.dirname(outputPath), {recursive: true});
	const warnings: string[] = [];
	try {
		const composition = await selectComposition({
			serveUrl,
			id: job.compositionId,
			inputProps: job.inputProps,
			onBrowserLog: collectWarnings(warnings),
		});
		return {job, serveUrl, outputPath, composition, warnings};
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}
};

const toResult = (
	job: ResolvedVideoJob,
	outputPath: string,
	warnings: string[],
	startedAt: number,
): RenderResult => ({
	outputPath,
	compositionId: job.compositionId,
	width: job.width,
	height: job.height,
	fps: job.fps,
	durationInFrames: job.durationInFrames,
	durationSeconds: job.durationInFrames / job.fps,
	elapsedMilliseconds: Date.now() - startedAt,
	voiceLineCount: Object.keys(job.inputProps.voiceClips).length,
	voiceCast: job.voiceCast,
	warnings: [...new Set([...warnings, ...durationWarnings(job)])],
});

/**
 * Renders a job to an MP4 (H.264 + AAC). Each call is self-contained: it
 * validates its own input, opens its own browser and writes only to
 * `outputPath`, so jobs can run side by side without sharing state.
 */
export const renderVideo = async (rawJob: unknown, options: RenderOptions): Promise<RenderResult> => {
	const startedAt = Date.now();
	const {job, serveUrl, outputPath, composition, warnings} = await prepare(rawJob, options);

	try {
		await renderMedia({
			composition,
			serveUrl,
			codec: 'h264',
			// Standard-range BT.709 and a (silent) audio track: what players and social platforms expect.
			colorSpace: 'bt709',
			enforceAudioTrack: true,
			outputLocation: outputPath,
			inputProps: job.inputProps,
			scale: job.scale,
			concurrency: options.concurrency ?? null,
			onBrowserLog: collectWarnings(warnings),
			onProgress: ({progress, renderedFrames, encodedFrames, stitchStage}) =>
				options.onProgress?.({
					stage: stitchStage === 'muxing' ? 'encoding' : 'rendering',
					progress,
					renderedFrames,
					encodedFrames,
					totalFrames: composition.durationInFrames,
				}),
		});
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}

	return toResult(job, outputPath, warnings, startedAt);
};

export type StillResult = RenderResult & {frame: number};

/** Renders a single frame as PNG. Cheap way to check layout without encoding a video. */
export const renderFrame = async (
	rawJob: unknown,
	options: RenderOptions & {frame: number},
): Promise<StillResult> => {
	const startedAt = Date.now();
	const {job, serveUrl, outputPath, composition, warnings} = await prepare(rawJob, options);
	const frame = Math.min(Math.max(0, options.frame), composition.durationInFrames - 1);

	try {
		await renderStill({
			composition,
			serveUrl,
			output: outputPath,
			frame,
			inputProps: job.inputProps,
			scale: job.scale,
			imageFormat: 'png',
			onBrowserLog: collectWarnings(warnings),
		});
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}

	return {...toResult(job, outputPath, warnings, startedAt), frame};
};

export type SceneFrame = {
	sceneId: string;
	label: string;
	/** Late in the scene, once its entrance animations have settled. */
	frame: number;
	/** Early in the scene, while elements are still animating in. */
	enteringFrame: number;
};

/** Representative frames of every scene, for layout checks without encoding a video. */
export const sceneFrames = (rawJob: unknown): SceneFrame[] => {
	const job = resolveVideoJob(rawJob);
	const scenes = job.template.buildScenes(job.inputProps.content);
	const plan = planTemplateScenes(scenes, job.template.transition, job.fps);
	return plan.scenes.map((scene, index) => ({
		sceneId: scene.id,
		label: scenes[index].label ?? scene.id,
		frame: scene.from + Math.floor(scene.durationInFrames * 0.8),
		enteringFrame: scene.from + Math.min(plan.transitionFrames + Math.round(job.fps * 0.2), scene.durationInFrames - 1),
	}));
};
