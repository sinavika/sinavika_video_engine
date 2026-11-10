import {appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {RenderProgress, RenderStage} from './VideoRenderer';

/**
 * How long a render will take, and how long it has left (10 Nov 2026). A 31-minute 4K camp lesson renders for about
 * an hour and a half; the render printed "%10 … %20" and nobody could say when it would end. Before it starts the
 * estimate comes from the renders saved before it (RenderTimes.jsonl: seconds per frame at that size); while it runs
 * the measured pace of the frames already drawn takes over, and the remaining encoding and finishing follow.
 */

/** One finished render, as saved after it ends. */
export type RenderTiming = {
	at: string;
	name: string;
	template: string;
	width: number;
	height: number;
	frames: number;
	/** Seconds per stage: voiceover, bundling, rendering (frames drawn), encoding (muxing), finishing (mastering, checks). */
	stages: Partial<Record<RenderStage, number>>;
	totalSeconds: number;
};

/**
 * The measured pace before any render was saved: TYT Matematik 02, CampLesson 4K, 56,490 frames in 5,273 s
 * (10 Nov 2026), everything included; about 90 s of it was bundling and finishing the sound.
 */
const MEASURED_4K_SECONDS_PER_FRAME = (5273 - 90) / 56490;
const FOUR_K_PIXELS = 3840 * 2160;
/** Mastering the sound and checking it grows with the video's length: about 70 s for a 31-minute lesson. */
const DEFAULT_FINISH_SECONDS_PER_FRAME = 70 / 56490;
/** Bundling the project: about 20 s whatever the video. */
const DEFAULT_FIXED_SECONDS = 20;

const median = (values: readonly number[]): number => {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** The drawing and encoding per frame of a saved render. */
const framePace = (timing: RenderTiming): number => ((timing.stages.rendering ?? 0) + (timing.stages.encoding ?? 0)) / Math.max(1, timing.frames);

type RenderForecast = {
	/** Seconds per frame of drawing and encoding. */
	secondsPerFrame: number;
	/** Seconds per frame of mastering and checking the sound after the frames. */
	finishSecondsPerFrame: number;
	/** Seconds before the frames whatever the length: bundling. */
	fixedSeconds: number;
	frames: number;
	totalSeconds: number;
	/** What the forecast stands on: "son 3 render'a göre" or "ilk ölçüme göre". */
	basis: string;
};

/**
 * The forecast of a render of `frames` frames at width × height: the median pace of saved renders of the same size
 * (the same template first), or the first measurement scaled by the pixel count.
 */
export const forecastRender = (history: readonly RenderTiming[], job: {template: string; width: number; height: number; frames: number}): RenderForecast => {
	const sameSize = history.filter((timing) => timing.width === job.width && timing.height === job.height && timing.frames > 0 && framePace(timing) > 0);
	const sameTemplate = sameSize.filter((timing) => timing.template === job.template);
	const pool = (sameTemplate.length > 0 ? sameTemplate : sameSize).slice(-5);
	const secondsPerFrame = pool.length > 0 ? median(pool.map(framePace)) : MEASURED_4K_SECONDS_PER_FRAME * Math.max(0.15, (job.width * job.height) / FOUR_K_PIXELS);
	const finishSecondsPerFrame = pool.length > 0 ? median(pool.map((timing) => (timing.stages.finishing ?? 0) / timing.frames)) : DEFAULT_FINISH_SECONDS_PER_FRAME;
	const fixedSeconds = pool.length > 0 ? median(pool.map((timing) => timing.stages.bundling ?? 0)) : DEFAULT_FIXED_SECONDS;
	return {
		secondsPerFrame,
		finishSecondsPerFrame,
		fixedSeconds,
		frames: job.frames,
		totalSeconds: fixedSeconds + (secondsPerFrame + finishSecondsPerFrame) * job.frames,
		basis: pool.length > 0 ? `son ${pool.length} render'a göre` : 'ilk ölçüme göre',
	};
};

/** Where a running render stands: how far, how long so far, how long still, when it ends. */
export type RenderStatus = {
	stage: RenderStage;
	/** 0 to 1 over the whole render (frames weigh most). */
	fraction: number;
	renderedFrames?: number;
	totalFrames?: number;
	elapsedSeconds: number;
	remainingSeconds?: number;
	finishAt?: string;
};

/**
 * Follows a render's progress events and keeps its forecast honest: until a few percent of the frames are drawn the
 * forecast's pace is used, then the measured pace takes over little by little (a render often starts slower while
 * the browser tabs warm up).
 */
export class RenderClock {
	private readonly startedAt: number;
	private readonly stageStarts = new Map<string, number>();
	private framesStartedAt?: number;
	private stage: RenderStatus['stage'] = 'voiceover';
	private last: RenderProgress | undefined;

	constructor(
		private forecast: RenderForecast | undefined,
		private readonly now: () => number = Date.now,
	) {
		this.startedAt = now();
	}

	/** A new forecast once the real frame count is known (after the narration). */
	setForecast(forecast: RenderForecast): void {
		this.forecast = forecast;
	}

	/** Seconds each stage took so far, for the saved timing. */
	stageSeconds(): RenderTiming['stages'] {
		const stages: RenderTiming['stages'] = {};
		const entries = [...this.stageStarts.entries()];
		entries.forEach(([stage, start], index) => {
			const end = entries[index + 1]?.[1] ?? this.now();
			stages[stage as keyof RenderTiming['stages']] = (end - start) / 1000;
		});
		return stages;
	}

	update(progress: RenderProgress): RenderStatus {
		this.enter(progress.stage);
		this.last = progress;
		if (progress.stage === 'rendering' && this.framesStartedAt === undefined && (progress.renderedFrames ?? 0) > 0) this.framesStartedAt = this.now();
		return this.status();
	}

	private enter(stage: RenderStatus['stage']): void {
		if (!this.stageStarts.has(stage)) this.stageStarts.set(stage, this.now());
		this.stage = stage;
	}

	/** Seconds still to go: the frames left at the pace now trusted, then the sound's mastering. */
	private remaining(now: number): number | undefined {
		const forecast = this.forecast;
		if (!forecast) return undefined;
		const total = this.last?.totalFrames ?? forecast.frames;
		const finish = forecast.finishSecondsPerFrame * total;
		const since = (stage: string) => (now - (this.stageStarts.get(stage) ?? now)) / 1000;
		switch (this.stage) {
			case 'voiceover':
			case 'bundling':
				return Math.max(forecast.secondsPerFrame * total + finish, forecast.totalSeconds - (now - this.startedAt) / 1000);
			case 'rendering': {
				const rendered = this.last?.renderedFrames ?? 0;
				const measuredFor = this.framesStartedAt === undefined ? 0 : (now - this.framesStartedAt) / 1000;
				const measured = rendered > 0 && measuredFor > 0 ? measuredFor / rendered : undefined;
				// Trust in the measured pace grows to full once 5 % of the frames are drawn.
				const trust = measured === undefined ? 0 : Math.min(1, rendered / Math.max(1, total * 0.05));
				const pace = measured === undefined ? forecast.secondsPerFrame : trust * measured + (1 - trust) * forecast.secondsPerFrame;
				return (total - rendered) * pace + finish;
			}
			case 'encoding':
				return finish + (1 - (this.last?.progress ?? 0)) * 10;
			case 'finishing':
				return Math.max(3, finish - since('finishing'));
		}
	}

	status(): RenderStatus {
		const now = this.now();
		const total = this.last?.totalFrames;
		const rendered = this.last?.renderedFrames ?? 0;
		const remainingSeconds = this.remaining(now);
		const fraction = this.stage === 'rendering' && total ? Math.min(0.97, (0.97 * rendered) / total) : this.stage === 'encoding' ? 0.97 : this.stage === 'finishing' ? 0.98 : 0;
		return {
			stage: this.stage,
			fraction,
			renderedFrames: this.last?.renderedFrames,
			totalFrames: total,
			elapsedSeconds: (now - this.startedAt) / 1000,
			remainingSeconds,
			finishAt: remainingSeconds === undefined ? undefined : new Date(now + remainingSeconds * 1000).toISOString(),
		};
	}
}

/** "1 sa 12 dk", "4 dk 10 sn", "35 sn". */
export const formatDuration = (seconds: number): string => {
	const whole = Math.max(0, Math.round(seconds));
	const hours = Math.floor(whole / 3600);
	const minutes = Math.floor((whole % 3600) / 60);
	if (hours > 0) return `${hours} sa ${minutes} dk`;
	if (minutes > 0) return minutes >= 10 ? `${minutes} dk` : `${minutes} dk ${whole % 60} sn`;
	return `${whole} sn`;
};

/** "████████░░░░" for 0 to 1. */
export const progressBar = (fraction: number, width = 24): string => {
	const filled = Math.round(Math.max(0, Math.min(1, fraction)) * width);
	return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
};

const STAGE_NAMES: Record<RenderStatus['stage'], string> = {voiceover: 'seslendirme', bundling: 'hazırlık', rendering: 'kareler', encoding: 'kodlama', finishing: 'ses ve denetim'};

const clock = (iso: string): string => new Date(iso).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});

/** One line for a person: "[kareler] ██████░░ %42 · 23.700/56.490 kare · geçen 37 dk · kalan ~51 dk · bitiş ~12:40". */
export const statusLine = (status: RenderStatus): string => {
	const parts = [`[${STAGE_NAMES[status.stage]}] ${progressBar(status.fraction)} %${Math.floor(status.fraction * 100)}`];
	if (status.totalFrames && status.stage === 'rendering') parts.push(`${(status.renderedFrames ?? 0).toLocaleString('tr-TR')}/${status.totalFrames.toLocaleString('tr-TR')} kare`);
	parts.push(`geçen ${formatDuration(status.elapsedSeconds)}`);
	if (status.remainingSeconds !== undefined) parts.push(`kalan ~${formatDuration(status.remainingSeconds)}`);
	if (status.finishAt) parts.push(`bitiş ~${clock(status.finishAt)}`);
	return parts.join(' · ');
};

/** The line printed before a render starts. */
export const forecastLine = (forecast: RenderForecast, job: {width: number; height: number; frames: number; fps: number}): string =>
	`Tahmini süre: ~${formatDuration(forecast.totalSeconds)} (${job.width}x${job.height}, ${job.frames.toLocaleString('tr-TR')} kare = ${formatDuration(job.frames / job.fps)} video; ${forecast.basis}). Bitiş ~${clock(new Date(Date.now() + forecast.totalSeconds * 1000).toISOString())}.`;

// ---------------------------------------------------------------- saved timings and live status files

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Every finished whole render, one JSON line each: what the next forecast is made from. */
const RENDER_TIMES_FILE = path.join(ROOT, 'Outputs', 'Checks', 'RenderTimes.jsonl');

/** One file per running render, rewritten every few seconds: `npm run render-status` reads them. */
const RENDER_STATUS_DIRECTORY = path.join(ROOT, 'Outputs', 'Checks', 'RenderStatus');

export const readRenderTimes = (file = RENDER_TIMES_FILE): RenderTiming[] => {
	if (!existsSync(file)) return [];
	return readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => line.trim())
		.flatMap((line) => {
			try {
				return [JSON.parse(line) as RenderTiming];
			} catch {
				return [];
			}
		});
};

export const saveRenderTiming = (timing: RenderTiming, file = RENDER_TIMES_FILE): void => {
	mkdirSync(path.dirname(file), {recursive: true});
	appendFileSync(file, `${JSON.stringify(timing)}\n`);
};

/** What a status file holds: the render's status, its name and output, and whether it is still going. */
export type RenderStatusFile = RenderStatus & {name: string; output?: string; pid: number; state: 'running' | 'done' | 'failed'; startedAt: string; updatedAt: string; message?: string};

/** A file name a render's name can safely have. */
const statusFileName = (name: string): string => `${name.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 120)}.json`;

export const writeRenderStatus = (status: RenderStatusFile, directory = RENDER_STATUS_DIRECTORY): void => {
	mkdirSync(directory, {recursive: true});
	writeFileSync(path.join(directory, statusFileName(status.name)), `${JSON.stringify(status, null, 2)}\n`);
};

export const readRenderStatuses = (directory = RENDER_STATUS_DIRECTORY): RenderStatusFile[] =>
	existsSync(directory)
		? readdirSync(directory)
				.filter((file) => file.endsWith('.json'))
				.flatMap((file) => {
					try {
						return [JSON.parse(readFileSync(path.join(directory, file), 'utf8')) as RenderStatusFile];
					} catch {
						return [];
					}
				})
		: [];
