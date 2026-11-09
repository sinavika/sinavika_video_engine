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
 *
 * With --json every line on stdout is a JSON event (progress, done, error),
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
import {renderFrame, renderVideo, renderVideoToOutputs, type RenderProgress} from '../src/Renderers/VideoRenderer';

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

const reportProgress = () => {
	let last = '';
	return (progress: RenderProgress) => {
		const percent = Math.floor(progress.progress * 100);
		// One line per percent for machines, one per ten percent for people.
		const key = `${progress.stage}:${values.json ? percent : Math.floor(percent / 10)}`;
		if (key === last) return;
		last = key;
		if (values.json) {
			emit({type: 'progress', ...progress, percent});
			return;
		}
		const frames = progress.totalFrames ? ` (${progress.renderedFrames}/${progress.totalFrames} kare)` : '';
		console.log(`[${progress.stage}] %${percent}${frames}`);
	};
};

const main = async (): Promise<number> => {
	const frameRange = values.frames?.match(/^(\d+)-(\d+)$/);
	if (!values.job || ((values.frame !== undefined || values.frames !== undefined) && !values.out) || (values.frames !== undefined && !frameRange)) {
		console.error('Kullanım: npm run render -- --job <job.json> [--out <çıktı.mp4>] [--frame N --out <kare.png>] [--frames A-B --out <önizleme.mp4>] [--concurrency N] [--json]');
		return 2;
	}

	try {
		const job = readVideoJob(values.job);
		// A whole lesson is not rendered while its script has still screens (owner, 9 Nov 2026); previews are.
		const preview = values.frame !== undefined || frameRange !== null;
		const still = preview || values['allow-still-screens'] ? [] : stillScreenGate(job as {template?: unknown; content?: unknown});
		if (still.length > 0) throw new VideoJobValidationError(still);
		const options = {
			onProgress: reportProgress(),
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
