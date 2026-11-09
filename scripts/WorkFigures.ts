/**
 * The app's lesson figures: every visual of the Works files (and of any list of visuals) drawn as a still in the app's
 * light and dark colours, for the app to show instead of drawing it (API docs/works/Motor-Hazir-Resimleri.md).
 * Vector figures become SVG with their text as outlines; solids, 3D blocks and pictures stay WebP.
 *
 *   npm run figures                                   (all of Curriculum/Works)
 *   npm run figures -- --works KPSS_LISANS/TAR        (one folder or file of Works)
 *   npm run figures -- --list figures.jsonl           ({id, visual, beats?} per line, or a JSON array: test and exam figures)
 *   npm run figures -- --concurrency 4 --force        (draw again even when nothing changed)
 *   npm run figures -- --kinds map,battle             (draw these kinds again: after their drawing changed)
 *   npm run figures -- --small                        (draw again the figures whose text was under 28 pixels)
 *   npm run figures -- --attach <url>                 (Works copies with `still` set, for the import)
 *
 * Files go to Outputs/WorkFigures/<CATEGORY>/<LESSON>/<TOPIC>/<name>-light.svg (a list to Outputs/WorkFigures/List/
 * <list>/<id>-light.svg); Outputs/WorkFigures/manifest.json records, per figure, its source and JSON pointer, kind,
 * size, files and their SHA-256 (the API names stored stills by it), and the hash of the visual it was drawn from, so
 * a figure that has not changed is not drawn again. `hash` is of the visual as the schema fills it in, `rawHash` of
 * the visual as the file has it: the import compares the file's own (a plot written before a field had a default
 * hashed apart from its drawing, 2 Nov 2026). Every run fills `rawHash` in on rows whose figure is unchanged. One run at a time writes the manifest (Outputs/WorkFigures/run.lock).
 * A figure whose font or picture did not load is drawn once more before it counts as failed. The run ends with the
 * figures (of this run) whose text is under 28 pixels or whose layout guard found text over text, by kind.
 *
 * `--attach` draws nothing: it writes a copy of every Works file to Outputs/WorksWithStills with each drawn figure's
 * `still` ({light, dark, width, height}) set, the addresses being `<url><sha256>.<svg|webp>` as the API names stored
 * stills (contract §4, §5). The Works files themselves never change.
 */
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {CourseVisualSchema} from '../src/Components/Visuals/VisualSchema';
import {VisualBeatSchema} from '../src/Components/Visuals/VisualSchema';
import {WORK_FIGURE_MIN_TEXT_PX, collectWorkFigures, type WorkFigureEntry} from '../src/Courses/WorkFigure';
import {openRenderBrowser} from '../src/Renderers/VideoRenderer';
import {attachStills, renderWorkFigure, type WorkFigureStill} from '../src/Renderers/WorkFigureRenderer';
import {outputRoot} from '../src/Services/OutputFile';

const {values} = parseArgs({
	options: {
		works: {type: 'string'},
		list: {type: 'string'},
		concurrency: {type: 'string', default: '3'},
		force: {type: 'boolean', default: false},
		kinds: {type: 'string'},
		small: {type: 'boolean', default: false},
		limit: {type: 'string'},
		attach: {type: 'string'},
	},
});

const WORKS = path.join(process.cwd(), 'Curriculum', 'Works');
const OUT = path.join(outputRoot(), 'WorkFigures');
const MANIFEST = path.join(OUT, 'manifest.json');

/** A figure to draw: its parsed entry, and the visual and beats as its file has them (for `rawHash`). */
type Job = {source: string; directory: string; entry: WorkFigureEntry; raw: {visual: unknown; beats: unknown}};
type ManifestRow = WorkFigureStill & {source: string; hash: string; rawHash?: string};

const jsonFiles = (target: string): string[] => (statSync(target).isDirectory() ? readdirSync(target).flatMap((name) => jsonFiles(path.join(target, name))) : target.endsWith('.json') ? [target] : []);

if (values.attach) {
	const rows = existsSync(MANIFEST) ? (Object.values(JSON.parse(readFileSync(MANIFEST, 'utf-8'))) as ManifestRow[]) : [];
	const written = attachStills(WORKS, path.join(outputRoot(), 'WorksWithStills'), rows, values.attach);
	console.log(`${written.files} dosya, ${written.stills} resim bağlandı; resmi olmayan görsel ${written.missing}. Klasör: ${path.relative(process.cwd(), path.join(outputRoot(), 'WorksWithStills'))}`);
	process.exit(0);
}

const jobs: Job[] = [];
if (values.list) {
	const text = readFileSync(values.list, 'utf-8').trim();
	const rows = (text.startsWith('[') ? JSON.parse(text) : text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))) as {id: string; visual: unknown; beats?: unknown}[];
	const listName = path.basename(values.list).replace(/\.[^.]+$/, '');
	for (const row of rows) {
		const parsed = CourseVisualSchema.safeParse(row.visual);
		if (!parsed.success) {
			console.error(`✗ ${row.id}: ${parsed.error.issues[0]?.message}`);
			continue;
		}
		const name = String(row.id).replace(/[^\w.-]+/g, '_');
		// A figure taken from a lesson card keeps the card's beats: they decide what the figure shows at its end.
		const beats = VisualBeatSchema.array().safeParse(row.beats);
		jobs.push({source: values.list, directory: path.join(OUT, 'List', listName), entry: {pointer: `#${row.id}`, name, visual: parsed.data, ...(beats.success && beats.data.length ? {beats: beats.data} : {})}, raw: {visual: row.visual, beats: row.beats}});
	}
} else {
	const root = values.works ? path.join(WORKS, values.works.endsWith('.json') ? values.works : values.works) : WORKS;
	const target = existsSync(root) ? root : `${root}.json`;
	for (const file of jsonFiles(target)) {
		const script = JSON.parse(readFileSync(file, 'utf-8'));
		const relative = path.relative(WORKS, file).replace(/\.json$/, '');
		for (const entry of collectWorkFigures(script)) {
			// Works files keep a visual as it was written, without the fields its schema fills in later (a map made
			// before `territories` existed had none, and 161 maps failed on it, 2 Nov 2026): it is drawn as parsed.
			const parsed = CourseVisualSchema.safeParse(entry.visual);
			const source = path.relative(process.cwd(), file).replaceAll('\\', '/');
			if (!parsed.success) {
				const issue = parsed.error.issues[0];
				console.error(`✗ ${source}${entry.pointer} (${String((entry.visual as {kind?: unknown}).kind)}): ${issue ? `${issue.path.join('.')}: ${issue.message}` : 'şemaya uymuyor'}`);
				continue;
			}
			jobs.push({source, directory: path.join(OUT, relative), entry: {...entry, visual: parsed.data, name: `${path.basename(relative)}-${entry.name}`}, raw: {visual: entry.visual, beats: entry.beats}});
		}
	}
}

const manifest: Record<string, ManifestRow> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf-8')) : {};
const keyOf = (job: Job) => `${job.source}${job.entry.pointer}`;
const hashOf = (job: Job) => createHash('sha256').update(JSON.stringify({visual: job.entry.visual, beats: job.entry.beats ?? null})).digest('hex').slice(0, 16);
const rawHashOf = (job: Job) => createHash('sha256').update(JSON.stringify({visual: job.raw.visual, beats: job.raw.beats ?? null})).digest('hex').slice(0, 16);
// Rows of figures that have not changed get their `rawHash` (rows written before it existed); drawn ones get it below.
for (const job of jobs) {
	const row = manifest[keyOf(job)];
	if (row && row.hash === hashOf(job)) row.rawHash = rawHashOf(job);
}
const redraw = new Set((values.kinds ?? '').split(',').map((kind) => kind.trim()).filter(Boolean));
// A figure that moved (a card added before it shifts its pointer) but draws the same as a figure already in the
// manifest takes that figure's still instead of being drawn again: same files, same sha256, nothing to upload (5 Nov
// 2026: new cards shifted 1,757 TYT and KPSS figures whose data had not changed).
const drawnByHash = new Map<string, ManifestRow>();
for (const row of Object.values(manifest)) if (existsSync(row.light) && existsSync(row.dark)) drawnByHash.set(row.hash, row);
let relinked = 0;
for (const job of jobs) {
	const row = manifest[keyOf(job)];
	if (values.force || redraw.has(job.entry.visual.kind) || (row && row.hash === hashOf(job) && existsSync(row.light))) continue;
	const same = drawnByHash.get(hashOf(job));
	if (!same) continue;
	manifest[keyOf(job)] = {...same, pointer: job.entry.pointer, name: job.entry.name, source: job.source, rawHash: rawHashOf(job)};
	relinked++;
}
if (relinked) console.log(`${relinked} görsel çizilmeden aynı resme bağlandı.`);
const tooSmall = (row: ManifestRow | undefined) => row?.textPx !== undefined && row.textPx < WORK_FIGURE_MIN_TEXT_PX;
const pending = jobs
	.filter((job) => values.force || redraw.has(job.entry.visual.kind) || (values.small && tooSmall(manifest[keyOf(job)])) || manifest[keyOf(job)]?.hash !== hashOf(job) || !existsSync(manifest[keyOf(job)].light))
	.slice(0, values.limit ? Number(values.limit) : undefined);
console.log(`${jobs.length} görsel; çizilecek ${pending.length}.`);

// Two runs writing the manifest at once lose each other's rows: a second run waits for the first to finish.
const LOCK = path.join(OUT, 'run.lock');
const running = (pid: number) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};
if (existsSync(LOCK) && running(Number(readFileSync(LOCK, 'utf-8')))) {
	console.error(`Başka bir çizim sürüyor (süreç ${readFileSync(LOCK, 'utf-8').trim()}); bitince yeniden çalıştırın.`);
	process.exit(1);
}
mkdirSync(OUT, {recursive: true});
writeFileSync(LOCK, String(process.pid));
process.once('exit', () => rmSync(LOCK, {force: true}));

const browser = await openRenderBrowser();
const save = () => {
	mkdirSync(OUT, {recursive: true});
	writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
};
let done = 0;
let failed = 0;
const started = Date.now();
const worker = async () => {
	for (let job = pending.shift(); job; job = pending.shift()) {
		try {
			const still = await renderWorkFigure(job.entry, job.directory, browser).catch(() => renderWorkFigure(job.entry, job.directory, browser));
			manifest[keyOf(job)] = {...still, light: path.relative(process.cwd(), still.light).replaceAll('\\', '/'), dark: path.relative(process.cwd(), still.dark).replaceAll('\\', '/'), source: job.source, hash: hashOf(job), rawHash: rawHashOf(job)};
			done++;
			if (done % 20 === 0) {
				save();
				const rate = (Date.now() - started) / 1000 / done;
				console.log(`  ${done} çizildi · ${rate.toFixed(1)} sn/görsel · kalan ~${Math.round((pending.length * rate) / 60)} dk`);
			}
		} catch (error) {
			failed++;
			console.error(`✗ ${keyOf(job)} (${job.entry.visual.kind}): ${(error as Error).message.split('\n')[0]}`);
		}
	}
};
await Promise.all(Array.from({length: Math.max(1, Number(values.concurrency))}, worker));
save();
// Text under 1/45 of the width cannot be read on a phone (contract §2), and text over text cannot be read anywhere: the
// kinds that still draw either, among this run's figures, for their visuals' own fix.
const byKind = (test: (row: ManifestRow) => boolean) => {
	const counts = new Map<string, number>();
	for (const job of jobs) {
		const row = manifest[keyOf(job)];
		if (row && test(row)) counts.set(row.kind, (counts.get(row.kind) ?? 0) + 1);
	}
	return [...counts].sort((a, b) => b[1] - a[1]).map(([kind, count]) => `${kind} ${count}`).join(', ');
};
const small = byKind((row) => tooSmall(row));
if (small) console.log(`${WORK_FIGURE_MIN_TEXT_PX} pikselden küçük yazı: ${small}`);
const crowded = byKind((row) => Boolean(row.layout?.length));
if (crowded) console.log(`Yerleşim bekçisinin bulduğu sorun: ${crowded}`);
// Text the figure itself drew too small and the still's last guard raised: readable, but not laid out for its size.
const raised = byKind((row) => Boolean(row.raised?.count));
if (raised) console.log(`Son adımda büyütülen yazı (türün kendi düzeltmesi bekliyor): ${raised}`);
await browser.close({silent: true});
console.log(`${done} görsel çizildi, ${failed} hata. Liste: ${path.relative(process.cwd(), MANIFEST)}`);
process.exit(failed ? 1 : 0);
