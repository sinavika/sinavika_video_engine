/**
 * Renders one video job.
 *
 *   npm run render -- --job samples/QuestionSolution.json
 *       Saves to Outputs/Videos under the next free number, e.g. 03_Geometri_Dik_Ucgende_Hipotenus.mp4
 *   npm run render -- --job samples/QuestionSolution.json --out out/video.mp4
 *       Writes exactly there instead.
 *   npm run render -- --job job.json --out out/frame.png --frame 120
 *   npm run render -- --job job.json --out out/video.mp4 --json
 *
 * With --json every line on stdout is a JSON event (progress, done, error),
 * which is what a parent process such as the .NET backend should read.
 * Exit codes: 0 success, 2 invalid job, 1 render failure.
 */
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {formatChapters} from '../src/Scenes/SceneChapters';
import {parseArgs} from 'node:util';
import {VideoJobValidationError} from '../src/Renderers/VideoJob';
import {renderFrame, renderVideo, renderVideoToOutputs, type RenderProgress} from '../src/Renderers/VideoRenderer';

const {values} = parseArgs({
	options: {
		job: {type: 'string'},
		out: {type: 'string'},
		frame: {type: 'string'},
		concurrency: {type: 'string'},
		json: {type: 'boolean', default: false},
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
	if (!values.job || (values.frame !== undefined && !values.out)) {
		console.error('Kullanım: npm run render -- --job <job.json> [--out <çıktı.mp4>] [--frame N --out <kare.png>] [--concurrency N] [--json]');
		return 2;
	}

	try {
		const job: unknown = JSON.parse(await readFile(values.job, 'utf8'));
		const options = {
			onProgress: reportProgress(),
			concurrency: values.concurrency ? Number(values.concurrency) : undefined,
		};
		// Without --out the video is saved under the next number in Outputs/Videos.
		const result = !values.out
			? await renderVideoToOutputs(job, options)
			: values.frame === undefined
				? await renderVideo(job, {...options, outputPath: values.out})
				: await renderFrame(job, {...options, outputPath: values.out, frame: Number(values.frame)});

		// YouTube chapters go next to the video, ready for the description.
		const chaptersPath = result.chapters.length > 0 && values.frame === undefined ? `${result.outputPath.slice(0, result.outputPath.length - path.extname(result.outputPath).length)}.chapters.txt` : null;
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
