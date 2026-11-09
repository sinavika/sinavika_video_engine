/**
 * Draws the question revision's figures with the engine's own figure renderer (src/Renderers/WorkFigureRenderer:
 * the visual's last frame in the app's light and dark colours, SVG with text as outlines, WebP for 3D), into a folder
 * of its own with its own manifest. It never touches Outputs/Works/Figures/manifest.json, which the Works runs write.
 *
 *   npx tsx Curriculum/Tools/RenderFigures.ts <list.jsonl> <out folder> [--concurrency 2] [--force]
 *
 * The list holds {id, visual} per line (check_revisions.py writes it). Writes <out>/<id>-light.svg and -dark.svg
 * (.webp for 3D) and <out>/manifest.json: {id: {format, light, dark, sha256: {light, dark}, width, height, input}}.
 * `input` is the SHA-256 of the visual as listed: a figure whose visual has not changed is not drawn again.
 * render_figures.py runs this and turns the manifest into the lesson's stills.json.
 */
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {CourseVisualSchema} from '../../src/Components/Visuals/VisualSchema';
import {openRenderBrowser} from '../../src/Renderers/VideoRenderer';
import {renderWorkFigure, type WorkFigureStill} from '../../src/Renderers/WorkFigureRenderer';

const {values, positionals} = parseArgs({allowPositionals: true, options: {concurrency: {type: 'string', default: '2'}, force: {type: 'boolean', default: false}}});
const [list, out] = positionals;
if (!list || !out) {
	console.error('Kullanım: npx tsx Curriculum/Tools/RenderFigures.ts <list.jsonl> <out folder> [--concurrency 2] [--force]');
	process.exit(2);
}

type Row = WorkFigureStill & {input: string};
const manifestPath = path.join(out, 'manifest.json');
mkdirSync(out, {recursive: true});
const manifest: Record<string, Row> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf-8')) : {};

const jobs: {id: string; input: string; visual: ReturnType<typeof CourseVisualSchema.parse>}[] = [];
let invalid = 0;
for (const line of readFileSync(list, 'utf-8').split(/\r?\n/).filter(Boolean)) {
	const row = JSON.parse(line) as {id: string; visual: unknown};
	const parsed = CourseVisualSchema.safeParse(row.visual);
	if (!parsed.success) {
		invalid++;
		console.error(`✗ ${row.id}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(' | ')}`);
		continue;
	}
	jobs.push({id: row.id, input: createHash('sha256').update(JSON.stringify(row.visual)).digest('hex'), visual: parsed.data});
}
const pending = jobs.filter((job) => values.force || manifest[job.id]?.input !== job.input || !existsSync(manifest[job.id].light) || !existsSync(manifest[job.id].dark));
console.log(`${jobs.length} görsel; çizilecek ${pending.length}, şeması tutmayan ${invalid}.`);

let done = 0;
let failed = 0;
if (pending.length) {
	const browser = await openRenderBrowser();
	const queue = [...pending];
	const worker = async () => {
		for (let job = queue.shift(); job; job = queue.shift()) {
			try {
				const still = await renderWorkFigure({pointer: `#${job.id}`, name: job.id.replace(/[^\w.-]+/g, '_'), visual: job.visual}, out, browser);
				manifest[job.id] = {...still, light: path.resolve(still.light), dark: path.resolve(still.dark), input: job.input};
				done++;
				if (done % 10 === 0) {
					writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
					console.log(`${done}/${pending.length}`);
				}
			} catch (error) {
				failed++;
				console.error(`✗ ${job.id} (${job.visual.kind}): ${(error as Error).message.split('\n')[0]}`);
			}
		}
	};
	await Promise.all(Array.from({length: Math.max(1, Number(values.concurrency))}, worker));
	await browser.close({silent: true});
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
console.log(`${done} görsel çizildi, ${failed} hata. Liste: ${manifestPath}`);
process.exit(failed || invalid ? 1 : 0);
