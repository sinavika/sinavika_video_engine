/**
 * Renders image jobs.
 *
 *   npm run image -- --job samples/Images/HookContent-BoldQuestion.json
 *       Saves to Outputs/Images under the next free number, e.g. 04_Gunluk_Soru_Hook.png
 *
 *   npm run image -- --job a.json --job b.json
 *       Several jobs in one go (one bundle, faster).
 *
 *   npm run image -- --job a.json --out out/Post.png
 *       Writes exactly there instead (a carousel writes Post_1.png, Post_2.png...).
 *
 *   npm run image -- --job a.json --size Story --format webp --palette MidnightGoldV1 --theme TechDark
 *       Overrides what the job file says.
 *
 *   npm run image -- --job a.json --json
 *       One JSON line per result on stdout, for a parent process.
 *
 * Exit codes: 0 success, 2 invalid job, 1 render failure.
 */
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {renderImage, renderImageToOutputs} from '../src/Images/Renderers/ImageRenderer';
import {VideoJobValidationError} from '../src/Renderers/VideoJob';

const {values} = parseArgs({
	options: {
		job: {type: 'string', multiple: true},
		out: {type: 'string'},
		'out-dir': {type: 'string'},
		size: {type: 'string'},
		format: {type: 'string'},
		theme: {type: 'string'},
		palette: {type: 'string'},
		json: {type: 'boolean', default: false},
	},
});

const jobs = values.job ?? [];
if (jobs.length === 0 || (values.out && jobs.length > 1)) {
	console.error('Kullanım: npm run image -- --job <job.json> [--job ...] [--out <dosya> | --out-dir <klasör>] [--size Square|Portrait|Story|Landscape] [--format png|jpeg|webp] [--theme <Tema>] [--palette <Palet>] [--json]');
	process.exit(2);
}

const overrides = Object.fromEntries(
	(['size', 'format', 'theme', 'palette'] as const).filter((key) => values[key]).map((key) => [key, values[key]]),
);
const EXTENSIONS: Record<string, string> = {png: 'png', jpeg: 'jpg', webp: 'webp'};
let exitCode = 0;

for (const file of jobs) {
	try {
		const job = {...JSON.parse(await readFile(file, 'utf8')), ...overrides};
		const explicit = values.out ?? (values['out-dir'] ? path.join(values['out-dir'], `${path.basename(file, '.json')}.${EXTENSIONS[job.format ?? 'png'] ?? 'png'}`) : undefined);
		const result = explicit ? await renderImage(job, {outputPath: explicit}) : await renderImageToOutputs(job);

		if (values.json) console.log(JSON.stringify({type: 'done', job: file, ...result}));
		else {
			result.files.forEach((output) => console.log(output));
			console.log(`  ${result.category}/${result.variant}, ${result.theme}${result.palette ? ` + ${result.palette}` : ''}, ${result.width}x${result.height} ${result.format}`);
			result.warnings.forEach((warning) => console.warn(`  Uyarı: ${warning}`));
		}
		if (result.warnings.length > 0) exitCode = Math.max(exitCode, 1);
	} catch (error) {
		const invalid = error instanceof VideoJobValidationError || error instanceof SyntaxError;
		exitCode = Math.max(exitCode, invalid ? 2 : 1);
		if (values.json) {
			console.log(JSON.stringify({type: 'error', job: file, kind: invalid ? 'validation' : 'render', message: error instanceof Error ? error.message : String(error)}));
		} else {
			console.error(`${file}: ${error instanceof Error ? error.message : error}`);
		}
	}
}

process.exit(exitCode);
