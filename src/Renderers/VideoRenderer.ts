import {randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';
import {copyFile, mkdir, rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {RenderInternals, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {VIDEO_COVER} from '../Configurations/VideoCover';
import {planTemplateScenes} from '../Scenes/SceneSeries';
import {VOICE_LEAD_SECONDS} from '../Scenes/Voiceover';
import type {SpeechBackend} from '../Services/ElevenLabsSpeech';
import {saveNumberedOutput} from '../Services/OutputFiles';
import type {VoiceCast} from '../Services/VoiceCasting';
import {writeSoundtrack, type SoundtrackCues} from '../Services/SoundtrackComposer';
import {renderVideoCover} from '../Services/VideoCoverGenerator';
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
	/**
	 * Where to save the video's cover image. Giving a path makes a cover even
	 * if the job does not ask for one; a job with `"cover": false` never gets one.
	 * Without a path, a job that asks for a cover gets it next to the video.
	 */
	coverPath?: string;
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
	/** The cover image made with the video, or null. */
	coverPath: string | null;
	/** The moment of the video that shows the cover; what a platform is told to use as the cover frame. */
	coverOffsetMilliseconds: number | null;
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

/** `out/video.mp4` gets `out/video_Kapak.png`. */
const coverPathBeside = (videoPath: string): string => {
	const {dir, name} = path.parse(videoPath);
	return path.join(dir, `${name}_${VIDEO_COVER.fileSuffix}.png`);
};

/**
 * Renders the cover, and puts a copy into the bundle so the video can show it
 * as its opening frame. Returns the job with the cover attached.
 */
const attachCover = async (job: ResolvedVideoJob, serveUrl: string, coverPath: string): Promise<ResolvedVideoJob> => {
	try {
		await mkdir(path.dirname(coverPath), {recursive: true});
		await renderVideoCover(job, coverPath);
		const coverSrc = `${VIDEO_COVER.publicDirectory}/${randomUUID()}.png`;
		const published = path.join(serveUrl, 'public', coverSrc);
		await mkdir(path.dirname(published), {recursive: true});
		await copyFile(coverPath, published);
		return {...job, inputProps: {...job.inputProps, coverSrc}};
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}
};

/** When the scenes and the spoken lines of a job begin, for the music to be arranged around. */
const soundtrackCues = (job: ResolvedVideoJob): SoundtrackCues => {
	const scenes = job.template.buildScenes(job.inputProps.content, job.inputProps.voiceClips);
	const plan = planTemplateScenes(scenes, job.template.transition, job.fps);
	const startOf = (index: number) => plan.scenes[index].from / job.fps;
	const lineStarts = scenes.flatMap((scene, index) => {
		let offset = 0;
		return (scene.voice ?? []).map((slot) => {
			const start = startOf(index) + offset + VOICE_LEAD_SECONDS;
			offset += slot.seconds;
			return start;
		});
	});
	return {
		durationSeconds: plan.durationInFrames / job.fps,
		sceneStarts: scenes.slice(1, -1).map((_, index) => startOf(index + 1)),
		lineStarts,
		closingStart: startOf(scenes.length - 1),
	};
};

/** Composes the soundtrack for the job's final timing and puts it into the bundle. */
const attachSoundtrack = async (job: ResolvedVideoJob, serveUrl: string): Promise<ResolvedVideoJob> => {
	try {
		const soundtrackSrc = `Soundtracks/${randomUUID()}.wav`;
		await writeSoundtrack(soundtrackCues(job), path.join(serveUrl, 'public', soundtrackSrc), job.soundtrackStyle);
		return {...job, inputProps: {...job.inputProps, soundtrackSrc}};
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}
};

const prepare = async (rawJob: unknown, options: RenderOptions) => {
	// Throws VideoJobValidationError before any expensive work begins.
	const resolved = resolveVideoJob(rawJob);
	const narrated = options.withoutVoiceover ? resolved : await narrateVideoJob(resolved, options.onProgress, options.speech);
	options.onProgress?.({stage: 'bundling', progress: 0});
	const serveUrl = await bundleProject((progress) => options.onProgress?.({stage: 'bundling', progress}));
	await publishVoiceClips(narrated, serveUrl);
	const outputPath = path.resolve(options.outputPath);
	await mkdir(path.dirname(outputPath), {recursive: true});
	const coverPath = narrated.cover === false ? null : options.coverPath ? path.resolve(options.coverPath) : narrated.cover ? coverPathBeside(outputPath) : null;
	const covered = coverPath ? await attachCover(narrated, serveUrl, coverPath) : narrated;
	const job = covered.soundtrack ? await attachSoundtrack(covered, serveUrl) : covered;
	const warnings: string[] = [];
	try {
		const composition = await selectComposition({
			serveUrl,
			id: job.compositionId,
			inputProps: job.inputProps,
			onBrowserLog: collectWarnings(warnings),
		});
		return {job, serveUrl, outputPath, coverPath, composition, warnings};
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}
};

const toResult = (
	job: ResolvedVideoJob,
	outputPath: string,
	warnings: string[],
	startedAt: number,
	coverPath: string | null = null,
): RenderResult => ({
	outputPath,
	coverPath,
	coverOffsetMilliseconds: coverPath ? VIDEO_COVER.frameOffsetMilliseconds : null,
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
	const {job, serveUrl, outputPath, coverPath, composition, warnings} = await prepare(rawJob, options);

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
		await finishFile(outputPath, Boolean(job.inputProps.soundtrackSrc));
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}

	return toResult(job, outputPath, warnings, startedAt, coverPath);
};

/**
 * Rewrites the container without its tags, so the published file carries no
 * note about the tools that produced it. The video stream is copied as it is.
 * A video with a soundtrack is also mastered here: its mix of voice, music
 * and effects is brought to -14 LUFS with a -1 dB true-peak ceiling, the
 * level the platforms play at. Other videos keep their audio untouched.
 */
const finishFile = async (file: string, master: boolean): Promise<void> => {
	const clean = `${file}.clean.mp4`;
	const audio = master ? ['-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k'] : ['-c', 'copy'];
	await RenderInternals.callFf({
		bin: 'ffmpeg',
		args: ['-y', '-i', file, '-map', '0', ...audio, '-map_metadata', '-1', '-fflags', '+bitexact', '-movflags', '+faststart', clean],
		indent: false,
		logLevel: 'error',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	await rename(clean, file);
};

export type NumberedRenderResult = RenderResult & {
	/** The production's number in Outputs/Videos. */
	number: number;
	createdAt: string;
};

/**
 * Renders a job into Outputs/Videos under the next free number, e.g.
 * `03_Matematik_Denklem_Cozumu.mp4`, together with its cover image
 * `03_Matematik_Denklem_Cozumu_Kapak.png` (unless the job says
 * `"cover": false`). Both are rendered to temporary files first, so a failed
 * render saves nothing and existing outputs are never overwritten. Use
 * `renderVideo` to write to a path of your choosing.
 */
export const renderVideoToOutputs = async (
	rawJob: unknown,
	options: Omit<RenderOptions, 'outputPath'> & {rootDirectory?: string} = {},
): Promise<NumberedRenderResult> => {
	const {rootDirectory, ...renderOptions} = options;
	// Throws VideoJobValidationError before a number is claimed.
	const job = resolveVideoJob(rawJob);
	const withCover = job.cover !== false;
	const saved = await saveNumberedOutput({
		kind: 'Videos',
		title: job.outputName,
		extension: 'mp4',
		parts: withCover ? ['', {suffix: VIDEO_COVER.fileSuffix, extension: 'png'}] : undefined,
		rootDirectory,
		metadata: {
			template: job.template.id,
			format: job.formatId,
			theme: job.inputProps.theme,
			width: job.width,
			height: job.height,
			fps: job.fps,
			voiceover: Boolean(job.voiceover) && !renderOptions.withoutVoiceover,
			lesson: job.inputProps.lesson ?? null,
			coverOffsetMilliseconds: withCover ? VIDEO_COVER.frameOffsetMilliseconds : null,
		},
		produce: ([videoPath, coverPath]) => renderVideo(rawJob, {...renderOptions, outputPath: videoPath, coverPath}),
	});
	return {...saved.result, outputPath: saved.files[0], coverPath: saved.files[1] ?? null, number: saved.number, createdAt: saved.createdAt};
};

export type StillResult = RenderResult & {frame: number};

/** Renders a single frame as PNG. Cheap way to check layout without encoding a video. */
export const renderFrame = async (
	rawJob: unknown,
	options: RenderOptions & {frame: number},
): Promise<StillResult> => {
	const startedAt = Date.now();
	const {job, serveUrl, outputPath, coverPath, composition, warnings} = await prepare(rawJob, options);
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

	return {...toResult(job, outputPath, warnings, startedAt, coverPath), frame};
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
