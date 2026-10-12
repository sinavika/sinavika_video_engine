/**
 * Validates video jobs without rendering them.
 *
 *   npm run validate -- samples/QuestionSolution.json [more.json ...]
 *   npm run validate -- samples/QuestionSolution.json --narration   (also prints the voice-over script)
 *
 * Exit codes: 0 all valid, 2 at least one invalid.
 */
import {readFile} from 'node:fs/promises';
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
		const job = resolveVideoJob(JSON.parse(await readFile(file, 'utf8')));
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
