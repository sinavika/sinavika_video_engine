/**
 * Renders one PNG per scene of a job, for checking layout without encoding video.
 *
 *   npm run stills -- --job samples/QuestionSolution.json
 *   npm run stills -- --job samples/QuestionSolution.json --formats all --theme TechDark
 *   npm run stills -- --template QuickRevision --formats Vertical,Square     (the template's built-in sample)
 *
 * Files are written to out/Stills/<Template>/<Format>-<Theme>-<n>-<scene>.png
 */
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {VIDEO_FORMAT_IDS} from '../src/Configurations/VideoFormats';
import {resolveVideoJob} from '../src/Renderers/VideoJob';
import {renderFrame, sceneFrames} from '../src/Renderers/VideoRenderer';
import {findTemplate} from '../src/Templates/TemplateRegistry';

const {values} = parseArgs({
	options: {
		job: {type: 'string'},
		template: {type: 'string'},
		out: {type: 'string', default: 'out/Stills'},
		formats: {type: 'string'},
		theme: {type: 'string'},
		quality: {type: 'string', default: '2160p'},
	},
});

if (!values.job && !values.template) {
	console.error('Kullanım: npm run stills -- (--job <job.json> | --template <Id>) [--formats all|Vertical,Horizontal,Square] [--theme <Tema>] [--out <klasör>]');
	process.exit(2);
}

const baseJob: Record<string, unknown> = values.job
	? JSON.parse(await readFile(values.job, 'utf8'))
	: {template: values.template, content: findTemplate(values.template ?? '')?.sampleContent};
const formats = values.formats === 'all' ? VIDEO_FORMAT_IDS : (values.formats?.split(',') ?? [baseJob.format ?? 'Vertical']);
let warningCount = 0;

for (const format of formats) {
	const job = {...baseJob, format, quality: values.quality, ...(values.theme ? {theme: values.theme} : {})};
	const resolved = resolveVideoJob(job);
	for (const [index, scene] of sceneFrames(job).entries()) {
		const fileName = `${format}-${resolved.inputProps.theme}-${index + 1}-${scene.sceneId}.png`;
		const result = await renderFrame(job, {
			outputPath: path.join(values.out, resolved.template.id, fileName),
			frame: scene.frame,
			withoutVoiceover: true,
		});
		console.log(`${result.outputPath} (kare ${result.frame})`);
		result.warnings.forEach((warning) => console.warn(`  Uyarı: ${warning}`));
		warningCount += result.warnings.length;
	}
}

console.log(warningCount === 0 ? 'Uyarı yok.' : `${warningCount} uyarı var.`);
process.exit(0);
