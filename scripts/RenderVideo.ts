/**
 * Renders one video job.
 *
 *   npm run render -- --job samples/QuestionSolution.json
 *       Saves to Outputs/Videos under the next free number, e.g. 03_Geometri_Dik_Ucgende_Hipotenus.mp4
 *       A job with an `output` (camp lessons: Outputs/Camps/YKS/TYT/Turkce/07_Tamlamalar/Tamlamalar_YouTube.mp4) is
 *       saved at that place instead, with its cover and chapters beside it.
 *   npm run render -- --job samples/QuestionSolution.json --out out/video.mp4
 *       Writes exactly there instead, the cover beside it (out/video_Kapak.png).
 *   npm run render -- --job job.json --out out/frame.png --frame 120
 *   npm run render -- --job job.json --out out/preview.mp4 --frames 9000-9900
 *       Only those frames: a short preview of one part of a long lesson (chapters are not written).
 *   npm run render -- --job job.json --out out/video.mp4 --json
 *
 * A whole camp or course lesson is refused while its script has still screens (StillScreenGate, owner 9 Nov 2026);
 * --allow-still-screens renders it anyway. Single frames and frame ranges are previews and are not checked.
 * With SINAVIKA_CAMP_RENDER_GATE=on in .env a whole camp video is rendered only from the script version approved in
 * the admin panel (CampApprovalGate), and the server is told when its YouTube video is rendered.
 *
 * Before a render starts it says how long it will take (from the renders saved before it, RenderEstimate), and while
 * it runs it shows a progress bar with the time gone, the time left and when it ends. The status is also written to
 * Outputs/Checks/RenderStatus/<name>.json, so `npm run render-status` shows it from another window or session.
 *
 * With --json every line on stdout is a JSON event (forecast, progress, done, error),
 * which is what a parent process such as the .NET backend should read.
 * Exit codes: 0 success, 2 invalid job, 1 render failure.
 */
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {VIDEO_COVER} from '../src/Configurations/VideoCover';
import {formatChapters} from '../src/Scenes/SceneChapter';
import {parseArgs} from 'node:util';
import {VideoJobValidationError} from '../src/Renderers/VideoJob';
import {readVideoJob} from '../src/Renderers/VideoJobFile';
import {stillScreenGate} from '../src/Renderers/StillScreenGate';
import {campApprovalGate, reportCampRender} from '../src/Renderers/CampApprovalGate';
import {renderFrame, renderVideo, renderVideoToOutputs, type RenderProgress} from '../src/Renderers/VideoRenderer';
import {resolveVideoJob} from '../src/Renderers/VideoJob';
import {forecastLine, forecastRender, readRenderTimes, RenderClock, saveRenderTiming, statusLine, writeRenderStatus, type RenderStatus, type RenderStatusFile} from '../src/Renderers/RenderEstimate';

const {values} = parseArgs({
	options: {
		job: {type: 'string'},
		out: {type: 'string'},
		frame: {type: 'string'},
		frames: {type: 'string'},
		concurrency: {type: 'string'},
		json: {type: 'boolean', default: false},
		'allow-still-screens': {type: 'boolean', default: false},
	},
});

const emit = (event: Record<string, unknown>) => console.log(JSON.stringify(event));

/** How often a person's progress line is repeated when nothing else changed, and how often the status file is written. */
const LINE_EVERY_MILLISECONDS = 60_000;
const STATUS_EVERY_MILLISECONDS = 5_000;

/**
 * Progress for people and machines. In a terminal one line redraws itself every second; written to a file or read by
 * another program (the Render session runs it in the background) a line comes at every 5 % and at least once a
 * minute. Machines get every percent as a JSON event with the time left. The status file follows the same clock.
 */
const reportProgress = (clock: RenderClock, onStatus: (status: RenderStatus) => void, retarget: (frames: number) => void) => {
	let lastKey = '';
	let lastLine = 0;
	let lastStatus = 0;
	let targeted = false;
	const live = process.stdout.isTTY && !values.json;
	return (progress: RenderProgress) => {
		if (!targeted && progress.totalFrames) {
			targeted = true;
			retarget(progress.totalFrames);
		}
		const status = clock.update(progress);
		const now = Date.now();
		if (now - lastStatus >= STATUS_EVERY_MILLISECONDS || progress.stage === 'finishing') {
			lastStatus = now;
			onStatus(status);
		}
		const percent = Math.floor(status.fraction * 100);
		if (values.json) {
			const key = `${progress.stage}:${Math.floor(progress.progress * 100)}`;
			if (key === lastKey) return;
			lastKey = key;
			emit({type: 'progress', ...progress, percent: Math.floor(progress.progress * 100), elapsedSeconds: Math.round(status.elapsedSeconds), remainingSeconds: status.remainingSeconds === undefined ? undefined : Math.round(status.remainingSeconds), finishAt: status.finishAt});
			return;
		}
		if (live) {
			if (now - lastLine < 1000 && progress.stage === status.stage && lastKey === progress.stage) return;
			lastLine = now;
			lastKey = progress.stage;
			process.stdout.write(`\r${statusLine(status).padEnd(110)}`);
			return;
		}
		const key = `${status.stage}:${Math.floor(percent / 5)}`;
		if (key === lastKey && now - lastLine < LINE_EVERY_MILLISECONDS) return;
		lastKey = key;
		lastLine = now;
		console.log(statusLine(status));
	};
};

/** Marks the status file failed; set once the render has a status file. */
let failed: (message: string) => void = () => undefined;

const main = async (): Promise<number> => {
	const frameRange = values.frames?.match(/^(\d+)-(\d+)$/);
	if (!values.job || ((values.frame !== undefined || values.frames !== undefined) && !values.out) || (values.frames !== undefined && !frameRange)) {
		console.error('Kullanım: npm run render -- --job <job.json> [--out <çıktı.mp4>] [--frame N --out <kare.png>] [--frames A-B --out <önizleme.mp4>] [--concurrency N] [--json]');
		return 2;
	}

	try {
		const job = readVideoJob(values.job);
		// A whole lesson is not rendered while its script has still screens (owner, 9 Nov 2026); previews are.
		// `frameRange` is undefined without --frames: compared with `!== null` every render counted as a preview, and the
		// still screen gate never ran (found 10 Nov 2026 while adding the render clock).
		const preview = values.frame !== undefined || Boolean(frameRange);
		const still = preview || values['allow-still-screens'] ? [] : stillScreenGate(job as {template?: unknown; content?: unknown});
		if (still.length > 0) throw new VideoJobValidationError(still);
		// A camp video shows the version the owner approved (on once the scripts are on the server, CampApprovalGate).
		const camp = preview ? {issues: []} : await campApprovalGate(values.job);
		if (camp.issues.length > 0) throw new VideoJobValidationError(camp.issues);
		// The forecast: frames from the job as resolved now (narration estimates or cached voice), the pace from saved renders.
		const fields = job as {name?: unknown; output?: unknown};
		const name = typeof fields.name === 'string' && fields.name ? fields.name : path.basename(values.job, path.extname(values.job));
		const whole = !preview;
		const planned = resolveVideoJob(job);
		const history = readRenderTimes();
		const forecastFor = (frames: number) => forecastRender(history, {template: planned.template.id, width: planned.width, height: planned.height, frames});
		const plannedFrames = frameRange ? Number(frameRange[2]) - Number(frameRange[1]) + 1 : planned.durationInFrames;
		const clock = new RenderClock(values.frame === undefined ? forecastFor(plannedFrames) : undefined);
		const startedAt = new Date().toISOString();
		const statusFile = (status: RenderStatus, state: RenderStatusFile['state'], message?: string) =>
			whole ? writeRenderStatus({...status, name, output: values.out ?? (typeof fields.output === 'string' ? fields.output : undefined), pid: process.pid, state, startedAt, updatedAt: new Date().toISOString(), message}) : undefined;
		if (values.frame === undefined) {
			const forecast = forecastFor(plannedFrames);
			if (values.json) emit({type: 'forecast', ...forecast, frames: plannedFrames});
			else console.log(forecastLine(forecast, {width: planned.width, height: planned.height, frames: plannedFrames, fps: planned.fps}));
		}
		failed = (message) => statusFile(clock.status(), 'failed', message);
		const options = {
			onProgress: reportProgress(clock, (status) => statusFile(status, 'running'), (frames) => clock.setForecast(forecastFor(frameRange ? plannedFrames : frames))),
			concurrency: values.concurrency ? Number(values.concurrency) : undefined,
			frameRange: frameRange ? ([Number(frameRange[1]), Number(frameRange[2])] as [number, number]) : undefined,
		};
		// Without --out the video is saved under the next number in Outputs/Videos.
		// A whole video written with --out gets its cover beside it too, as one saved under Outputs/Videos does (the
		// cover is also the video's opening frame; without it a camp lesson started differently, 1 Nov 2026). A job
		// with "cover": false still gets none.
		const coverBeside = (out: string) => `${out.slice(0, out.length - path.extname(out).length)}_${VIDEO_COVER.fileSuffix}.png`;
		const result = !values.out
			? await renderVideoToOutputs(job, options)
			: values.frame === undefined
				? await renderVideo(job, {...options, outputPath: values.out, coverPath: frameRange ? undefined : coverBeside(values.out)})
				: await renderFrame(job, {...options, outputPath: values.out, frame: Number(values.frame)});

		// YouTube chapters go next to the video, ready for the description.
		const chaptersPath = result.chapters.length > 0 && values.frame === undefined && !frameRange ? `${result.outputPath.slice(0, result.outputPath.length - path.extname(result.outputPath).length)}.chapters.txt` : null;
		if (chaptersPath) await writeFile(chaptersPath, `${formatChapters(result.chapters)}\n`);

		if (process.stdout.isTTY && !values.json) process.stdout.write('\n');
		const done = clock.status();
		statusFile({...done, fraction: 1, remainingSeconds: 0, finishAt: new Date().toISOString()}, 'done');
		if (camp.approval?.reported) {
			try {
				await reportCampRender(camp.approval);
			} catch (error) {
				// The video is there; only the notice failed, and it can be sent again on its own.
				console.error(`Uyarı: render bildirimi gönderilemedi (${error instanceof Error ? error.message : String(error)}). Yeniden: npm run camp -- rendered --job ${values.job}`);
			}
		}
		// Only whole renders teach the forecast: a preview's few frames pay the fixed costs of a whole video.
		if (whole && values.frame === undefined)
			saveRenderTiming({at: new Date().toISOString(), name, template: planned.template.id, width: result.width, height: result.height, frames: result.durationInFrames, stages: clock.stageSeconds(), totalSeconds: result.elapsedMilliseconds / 1000});
		if (values.json) {
			emit({type: 'done', ...result, chaptersPath});
		} else {
			console.log(
				`Tamamlandı: ${result.outputPath}\n  ${result.width}x${result.height}, ${result.fps} fps, ${result.durationSeconds.toFixed(1)} sn, ${(result.elapsedMilliseconds / 1000).toFixed(1)} sn içinde`,
			);
			if (result.voiceCast) {
				const {voiceName, modelId, profile, pace} = result.voiceCast;
				console.log(`  Seslendirme: ${voiceName} (${profile}, ${modelId}, tempo ${pace}), ${result.voiceLineCount} satır`);
				if (result.voiceCast.note) console.log(`  Not: ${result.voiceCast.note}`);
			}
			if (chaptersPath) console.log(`  YouTube bölümleri (${result.chapters.length}): ${chaptersPath}`);
			result.warnings.forEach((warning) => console.warn(`  Uyarı: ${warning}`));
		}
		return 0;
	} catch (error) {
		const invalid = error instanceof VideoJobValidationError || error instanceof SyntaxError;
		failed(error instanceof Error ? error.message : String(error));
		if (values.json) {
			emit({
				type: 'error',
				kind: invalid ? 'validation' : 'render',
				message: error instanceof Error ? error.message : String(error),
				issues: error instanceof VideoJobValidationError ? error.issues : undefined,
			});
		} else {
			console.error(error instanceof Error ? error.message : error);
		}
		return invalid ? 2 : 1;
	}
};

process.exit(await main());
