/**
 * Renders the example videos: every job in samples/ plus each template's
 * built-in sample, so each template is rendered in more than one format.
 *
 *   npm run render:samples
 *   npm run render:samples -- --quality 720p --only QuickRevision
 *   npm run render:samples -- --narrate-all    (also narrates the built-in samples; spends more credits)
 *
 * The jobs in samples/ are narrated as written. Built-in samples are silent by default.
 *
 * Output: Outputs/Samples/*.mp4 and Outputs/Samples/Report.json
 */
import {readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {VIDEO_FORMAT_IDS} from '../src/Configurations/VideoFormats';
import {renderVideo, type RenderResult} from '../src/Renderers/VideoRenderer';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

const {values} = parseArgs({
	options: {
		quality: {type: 'string'},
		only: {type: 'string'},
		'narrate-all': {type: 'boolean', default: false},
		out: {type: 'string', default: 'Outputs/Samples'},
	},
});

const SAMPLES_DIRECTORY = 'samples';

type NamedJob = {name: string; job: Record<string, unknown>};

const jobs: NamedJob[] = [];
for (const file of (await readdir(SAMPLES_DIRECTORY)).filter((entry) => entry.endsWith('.json')).sort()) {
	jobs.push({
		name: path.basename(file, '.json'),
		job: JSON.parse(await readFile(path.join(SAMPLES_DIRECTORY, file), 'utf8')),
	});
}
TEMPLATES.forEach((template, index) => {
	const format = VIDEO_FORMAT_IDS[index % VIDEO_FORMAT_IDS.length];
	jobs.push({
		name: `${template.id}-BuiltIn-${format}`,
		job: {template: template.id, format, voiceover: values['narrate-all'], content: template.sampleContent},
	});
});

const selected = jobs.filter(({name}) => !values.only || name.includes(values.only));
const report: (RenderResult & {name: string})[] = [];
let failures = 0;

for (const {name, job} of selected) {
	const outputPath = path.join(values.out, `${name}.mp4`);
	process.stdout.write(`${name} ... `);
	try {
		const result = await renderVideo(values.quality ? {...job, quality: values.quality} : job, {outputPath});
		report.push({name, ...result});
		console.log(
			`${result.width}x${result.height}, ${result.durationSeconds.toFixed(1)} sn, ${(result.elapsedMilliseconds / 1000).toFixed(0)} sn içinde` +
				(result.voiceCast ? `, ses: ${result.voiceCast.voiceName}` : ', sessiz') +
				(result.warnings.length ? `, ${result.warnings.length} uyarı` : ''),
		);
		result.warnings.forEach((warning) => console.warn(`  Uyarı: ${warning}`));
	} catch (error) {
		failures++;
		console.log('BAŞARISIZ');
		console.error(error instanceof Error ? error.message : error);
	}
}

await writeFile(path.join(values.out, 'Report.json'), JSON.stringify(report, null, 2));
const warningCount = report.reduce((total, result) => total + result.warnings.length, 0);
console.log(`${report.length}/${selected.length} video üretildi, ${warningCount} uyarı → ${values.out}`);
process.exit(failures === 0 && warningCount === 0 ? 0 : 1);
