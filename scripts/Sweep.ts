/**
 * Renders the frames of camp lessons where the layout can go wrong and checks each with the layout guard
 * (Components/Layouts/LayoutGuard): text leaving the frame or its box, text over text, text over the progress bar.
 *
 *   npm run sweep -- <camp id | Curriculum/Scripts/...json | all> [--frames 0.2,0.95] [--scenes figures|all] [--out <folder>]
 *
 *   figures  (default) scenes whose card shows a figure, "önce tahmin et" cards and questions with a figure
 *   all      every scene of the lesson
 *
 * Writes <out>/ (default Outputs/Sweeps/<date>-<target>/): the frames, RAPOR.md (the warnings, lesson by lesson) and
 * index.html (every frame as a thumbnail with its name, for a look by eye). One browser serves the whole sweep.
 *
 *   npm run sweep -- <target> --motion [--step 2.5]
 *
 * Instead of layout: a frame every `step` seconds of the whole lesson (small, 720p), compared one to the next. Writes
 * HAREKET.md: the stretches of 8 s or more where the picture stands still while the lesson goes on (Renderers/
 * FrameMotion). Timing follows the narration estimate (no voice), so times are close to, not exactly, the video's.
 */
import {existsSync} from 'node:fs';
import {readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {CampSchema} from '../src/Courses/Camp';
import {LessonScriptSchema, type LessonCard, type LessonScript} from '../src/Courses/LessonScript';
import {resolveVideoJob} from '../src/Renderers/VideoJob';
import {changedShare, clock, stillStretches, type MotionSample} from '../src/Renderers/FrameMotion';
import {openRenderBrowser, renderFrames} from '../src/Renderers/VideoRenderer';
import {OUTRO_SCENE_ID} from '../src/Scenes/AppEndScene';
import {planTemplateScenes} from '../src/Scenes/SceneSeries';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPTS = path.join(ROOT, 'Curriculum', 'Scripts');

const {positionals, values} = parseArgs({
	allowPositionals: true,
	options: {frames: {type: 'string', default: '0.2,0.95'}, scenes: {type: 'string', default: 'figures'}, out: {type: 'string'}, motion: {type: 'boolean', default: false}, step: {type: 'string', default: '2.5'}},
});
const [target] = positionals;
if (!target) {
	console.error('Kullanım: npm run sweep -- <kamp kimliği | senaryo.json | all> [--frames 0.2,0.95] [--scenes figures|all] [--out <klasör>]');
	process.exit(2);
}
const fractions = values.frames.split(',').map(Number);
if (fractions.some((share) => !(share >= 0 && share <= 1))) {
	console.error('--frames 0 ile 1 arasında paylar alır, ör. 0.2,0.95');
	process.exit(2);
}

const allScripts = async (): Promise<string[]> => (await readdir(SCRIPTS, {recursive: true})).filter((file) => file.endsWith('.json')).map((file) => path.join(SCRIPTS, file)).sort();

/** The script files of a target: one file, every script, or a camp's lessons in camp order. */
const scriptFiles = async (): Promise<string[]> => {
	if (target === 'all') return allScripts();
	if (target.endsWith('.json')) return [path.resolve(target)];
	const campFile = path.join(ROOT, 'Curriculum', 'Camps', `${target}.json`);
	if (!existsSync(campFile)) {
		console.error(`Kamp bulunamadı: ${target}`);
		process.exit(2);
	}
	const camp = CampSchema.parse(JSON.parse(await readFile(campFile, 'utf8')));
	const files = await allScripts();
	const parsed = await Promise.all(files.map(async (file) => ({file, script: JSON.parse(await readFile(file, 'utf8')) as {camp?: {id?: string; lesson?: number}}})));
	return parsed
		.filter(({script}) => script.camp?.id === camp.id)
		.sort((a, b) => (a.script.camp?.lesson ?? 0) - (b.script.camp?.lesson ?? 0))
		.map(({file}) => file);
};

/** The scenes worth a look: what the card shows decides it. */
const chosenScenes = (script: LessonScript) => {
	const job = {template: 'CampLesson', format: 'Horizontal', theme: 'SinavikaLight', voiceover: false, quality: '1080p', content: script};
	const resolved = resolveVideoJob(job);
	const scenes = resolved.template.buildScenes(resolved.inputProps.content, {});
	const plan = planTemplateScenes(scenes, resolved.template.transition, resolved.fps);
	const cards = new Map<string, LessonCard>(script.lesson.sections.flatMap((section, si) => section.cards.map((card, ci) => [`s${si + 1}-c${ci + 1}`, card] as const)));
	return {
		job,
		scenes: plan.scenes
			.map((scene, index) => ({index, id: scene.id, label: scenes[index].label ?? scene.id, from: scene.from, frames: scene.durationInFrames, card: cards.get(scene.id)}))
			.filter(({card}) => values.scenes === 'all' || (card && (('visual' in card && card.visual) || card.kind === 'predict' || (card.kind === 'question' && card.question.figure)))),
	};
};

const date = new Date().toISOString().slice(0, 10);
const out = path.resolve(values.out ?? path.join(ROOT, 'Outputs', 'Sweeps', `${date}-${path.basename(target, '.json')}`));
const files = await scriptFiles();
const browser = await openRenderBrowser();

if (values.motion) {
	const step = Number(values.step);
	const lines = [`# Durgun sahneler: ${target}`, '', `${date} · ${files.length} ders · ${step} saniyede bir kare. Anlatım sürerken ekranın 8 saniye ya da daha uzun değişmediği yerler (süreler seslendirme tahminine göre).`, ''];
	let total = 0;
	try {
		for (const [lessonIndex, file] of files.entries()) {
			const code = path.basename(file, '.json');
			const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(file, 'utf8')));
			if (!parsed.success) continue;
			const job = {template: 'CampLesson', format: 'Horizontal', theme: 'SinavikaLight', voiceover: false, quality: '720p', content: parsed.data};
			const resolved = resolveVideoJob(job);
			const scenes = resolved.template.buildScenes(resolved.inputProps.content, {});
			const plan = planTemplateScenes(scenes, resolved.template.transition, resolved.fps);
			const samples: (MotionSample & {frame: number})[] = [];
			plan.scenes.forEach((scene, index) => {
				if (scene.id === OUTRO_SCENE_ID) return;
				for (let frame = scene.from; frame < scene.from + scene.durationInFrames; frame += Math.round(step * resolved.fps)) samples.push({frame, seconds: frame / resolved.fps, sceneId: scene.id, label: scenes[index].label ?? scene.id});
			});
			const folder = path.join(out, 'motion', code);
			const results = await renderFrames(job, samples.map((sample, index) => ({frame: sample.frame, outputPath: path.join(folder, `${String(index).padStart(4, '0')}.png`)})), {withoutVoiceover: true, browser});
			const changes = results.slice(1).map((result, index) => changedShare(results[index].outputPath, result.outputPath));
			const stretches = stillStretches(samples, changes);
			const stillSeconds = stretches.reduce((sum, stretch) => sum + stretch.toSeconds - stretch.fromSeconds, 0);
			total += stretches.length;
			lines.push(`## ${code} · ${parsed.data.title}`, '', stretches.length ? `${stretches.length} durgun bölüm, toplam ${Math.round(stillSeconds)} sn (ders ~${clock(samples.at(-1)?.seconds ?? 0)}).` : 'Durgun bölüm yok.', '', ...stretches.map((stretch) => `- ${clock(stretch.fromSeconds)}–${clock(stretch.toSeconds)} (${Math.round(stretch.toSeconds - stretch.fromSeconds)} sn) · ${stretch.sceneId} ${stretch.label}`), '');
			console.log(`[${lessonIndex + 1}/${files.length}] ${code}: ${samples.length} kare, ${stretches.length} durgun bölüm (${Math.round(stillSeconds)} sn)`);
		}
	} finally {
		await browser.close({silent: true});
	}
	await writeFile(path.join(out, 'HAREKET.md'), lines.join('\n'));
	console.log(`${total} durgun bölüm. Rapor: ${path.relative(ROOT, path.join(out, 'HAREKET.md'))}`);
	process.exit(0);
}

type Row = {code: string; title: string; frame: string; scene: string; warnings: string[]};
const rows: Row[] = [];
const startedAt = Date.now();
try {
	for (const [lessonIndex, file] of files.entries()) {
		const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(file, 'utf8')));
		const code = path.basename(file, '.json');
		if (!parsed.success) {
			rows.push({code, title: '', frame: '', scene: '', warnings: ['Senaryo şemaya uymuyor (npm run curriculum -- check).']});
			continue;
		}
		const {job, scenes} = chosenScenes(parsed.data);
		const frames = scenes.flatMap((scene) =>
			fractions.map((share) => ({
				frame: scene.from + Math.min(scene.frames - 1, Math.floor(scene.frames * share)),
				outputPath: path.join(out, code, `${code}-${scene.index}-${String(Math.round(share * 100)).padStart(3, '0')}.png`),
				scene,
			})),
		);
		// One lesson's failure (a dropped connection to the local server) is retried once, then reported, never the end of the sweep.
		const render = () => renderFrames(job, frames, {withoutVoiceover: true, layoutGuard: true, browser});
		const results = await render().catch(() => render()).catch((error: unknown) => {
			rows.push({code, title: parsed.data.title, frame: '', scene: '', warnings: [`Çizilemedi: ${error instanceof Error ? error.message : String(error)}`]});
			return [];
		});
		results.forEach((result, index) => rows.push({code, title: parsed.data.title, frame: path.relative(out, result.outputPath).replaceAll('\\', '/'), scene: `${frames[index].scene.id} ${frames[index].scene.label}`, warnings: result.warnings}));
		const flagged = results.filter((result) => result.warnings.length > 0).length;
		console.log(`[${lessonIndex + 1}/${files.length}] ${code}: ${results.length} kare${flagged ? `, ${flagged} uyarılı` : ''}`);
	}
} finally {
	await browser.close({silent: true});
}

const flagged = rows.filter((row) => row.warnings.length > 0);
const report = [
	`# Önizleme taraması: ${target}`,
	'',
	`${date} · ${files.length} ders · ${rows.length} kare · ${flagged.length} uyarılı kare · ${Math.round((Date.now() - startedAt) / 60000)} dk. Kareler: sahnenin ${fractions.map((share) => `%${Math.round(share * 100)}`).join(' ve ')} noktası; sahneler: ${values.scenes === 'all' ? 'hepsi' : 'şekilli kartlar, "önce tahmin et" ve şekilli sorular'}.`,
	'',
	'Uyarılar yerleşim bekçisinden (`LayoutGuard`) ve sığdırma kutularından gelir. Hepsi düzeltilir ya da gerekçesiyle yazılır. Karelerin hepsi `index.html` içinde.',
	'',
	...(flagged.length
		? flagged.flatMap((row) => [`## ${row.code} · ${row.scene}`, '', `![${row.frame}](${row.frame})`, '', ...row.warnings.map((warning) => `- ${warning.replace(/^\[LayoutGuard\] /, '')}`), ''])
		: ['Uyarı yok.', '']),
];
const html = [
	'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Önizleme taraması</title>',
	'<style>body{font:14px system-ui;margin:16px;background:#f6f6f6}div{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}figure{margin:0;background:#fff;padding:6px;border:2px solid #ddd}figure.warn{border-color:#d33}img{width:100%}figcaption{font-size:12px}</style></head><body>',
	`<h1>Önizleme taraması: ${target}</h1><p>${rows.length} kare, ${flagged.length} uyarılı (kırmızı çerçeve).</p><div>`,
	...rows.map((row) => `<figure class="${row.warnings.length ? 'warn' : ''}"><img loading="lazy" src="${row.frame}"><figcaption>${row.code} · ${row.scene}${row.warnings.map((warning) => `<br>⚠ ${warning.replace(/[<>&]/g, '')}`).join('')}</figcaption></figure>`),
	'</div></body></html>',
];
await writeFile(path.join(out, 'RAPOR.md'), report.join('\n'));
await writeFile(path.join(out, 'index.html'), html.join('\n'));
console.log(`${rows.length} kare, ${flagged.length} uyarılı. Rapor: ${path.relative(ROOT, path.join(out, 'RAPOR.md'))}`);
process.exit(0);
