/**
 * Validates video and image jobs without rendering them. A job with a
 * `category` is an image job; one with a `template` is a video job.
 *
 *   npm run validate -- samples/QuestionSolution.json [more.json ...]
 *   npm run validate -- samples/QuestionSolution.json --narration   (also prints the voice-over script)
 *   npm run validate -- samples/Images/HookContent-BoldQuestion.json
 *
 * Exit codes: 0 all valid, 2 at least one invalid.
 */
import {readFile} from 'node:fs/promises';
import {resolveImageJob} from '../src/Images/Renderers/ImageJob';
import {VideoJobValidationError, resolveVideoJob, voiceLines} from '../src/Renderers/VideoJob';

const showNarration = process.argv.includes('--narration');
const files = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
if (files.length === 0) {
	console.error('Kullanım: npm run validate -- <job.json> [job.json ...]');
	process.exit(2);
}

let invalid = 0;
for (const file of files) {
	try {
		const raw = JSON.parse(await readFile(file, 'utf8'));
		if (raw && typeof raw === 'object' && 'category' in raw) {
			const image = resolveImageJob(raw);
			const pages = image.pageCount > 1 ? `, ${image.pageCount} görsel` : '';
			console.log(`GEÇERLİ  ${file}: ${image.compositionId}, ${image.inputProps.theme}${image.paletteName ? ` + ${image.paletteName}` : ''}, ${image.width}x${image.height} ${image.format}${pages}`);
			continue;
		}
		const job = resolveVideoJob(raw);
		const seconds = (job.durationInFrames / job.fps).toFixed(1);
		console.log(`GEÇERLİ  ${file}: ${job.compositionId}, ${job.inputProps.theme}, ${job.width}x${job.height}, ${job.fps} fps, ${seconds} sn`);
		if (showNarration) voiceLines(job).forEach((line) => console.log(`  [${line.id}] ${line.text}`));
	} catch (error) {
		invalid++;
		console.error(`GEÇERSİZ ${file}`);
		const issues = error instanceof VideoJobValidationError ? error.issues : [String(error)];
		issues.forEach((issue) => console.error(`  - ${issue}`));
	}
}

process.exit(invalid === 0 ? 0 : 2);
