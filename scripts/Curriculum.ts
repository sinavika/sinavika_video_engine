/**
 * The curriculum the education videos are made from.
 *
 *   npm run curriculum -- import [--lessons <lesson.csv>] [--data <EgitimVerileri>]
 *       Builds Curriculum/: catalogue and production checklist, every topic
 *       bound to its lesson explanation and questions in Desktop/EgitimVerileri.
 *       Defaults: Desktop/lesson.csv (copied to Curriculum/Sources/LessonList.csv)
 *       and Desktop/EgitimVerileri (LESSON_LIST and EGITIM_VERILERI override them).
 *       Running it again keeps the checklist's progress.
 *
 *   npm run curriculum -- status [--category YKS_TYT]
 *       Progress per category and lesson.
 *
 *   npm run curriculum -- next [--stage youtube|short|prepared|used] [--count 5]
 *       The next topics to work on, in production order.
 *
 *   npm run curriculum -- mark <topic id or CATEGORY/LESSON/TOPIC> --stage prepared [--file Curriculum/Scripts/...json] [--undo]
 *       Records a stage as done (today) or, with --undo, as not done.
 *
 *   npm run curriculum -- brief <topic id or CATEGORY/LESSON/TOPIC>
 *       What to write a script from: subtopics, the knowledge pack's units,
 *       learning outcomes and misconceptions, the question pools, the topic's
 *       ÖSYM past questions (years, subtopics, question patterns; official list
 *       in EgitimVerileri/<exam>/CikmisSorular) and the lesson's visuals.
 *       Ends with the path the script goes to.
 *
 *   npm run curriculum -- check <script.json> [--mark]
 *       Validates a lesson script, reviews it against the targets (length,
 *       subtopics, questions, picture credits, camp fields) and, with --mark,
 *       records it as prepared.
 *
 *   npm run curriculum -- camp create --category YKS_TYT --lesson TRK [--name "TYT Türkçe kampı"] [--promise "..."]
 *       Writes the camp plan (Curriculum/Camps/<id>.json): every topic of the
 *       lesson in production order, one camp lesson each.
 *
 *   npm run curriculum -- camp show <camp id>
 *       The camp's lessons and how far each one is.
 *
 *   npm run curriculum -- coverage <category prefix, e.g. KPSS> [--mark]
 *       Subtopic coverage over every script of the categories: which topics
 *       still have subtopics no section teaches, and subtopic codes no topic
 *       has. One KPSS video set serves Lisans, Önlisans and Ortaöğretim, so a
 *       topic may be taught across several episodes. With --mark, a topic whose
 *       every subtopic is taught by scripts already "Hazırlandı" is marked too.
 *
 *   npm run curriculum -- works [category prefix, e.g. KPSS]
 *       Writes the Works views (Curriculum/Works/<CATEGORY>/<LESSON>/<TOPIC>.json):
 *       one file per checklist topic whose subtopics are all taught, in that
 *       topic's own codes, built from the scripts that teach it. Works imports
 *       these, not the scripts: one KPSS episode serves three levels whose
 *       codes differ, and AYT Tarih-2 and Coğrafya-2 get their own files.
 *
 *   npm run curriculum -- jobs make <spec.json> [more specs] [--force]
 *       Writes a camp lesson's render jobs (YouTube + reels) and its YouTube
 *       note into Curriculum/Jobs/<camp id>/. The jobs name their script
 *       instead of copying it (src/Courses/CampJob.ts). An existing note is
 *       kept unless --force: once written it is the owner's to edit.
 *
 *   npm run curriculum -- jobs check [camp id]
 *       Every camp job: valid, pointing at its own lesson's script, and every
 *       camp lesson at least 10 minutes without its outro. Lists scripts of a
 *       camp that have no jobs yet.
 *
 *   npm run curriculum -- audit
 *       Across all scripts: sentences repeated between lessons, nearly identical
 *       questions, and each lesson's mix of cards and figures. Writes
 *       Curriculum/Production/DersDenetimi.md; blocks nothing.
 */
import path from 'node:path';
import {parseArgs} from 'node:util';
import {existsSync} from 'node:fs';
import {mkdir, readdir, readFile, unlink, writeFile} from 'node:fs/promises';
import {CAMPS_DIRECTORY, CampSchema, campFromChecklist, campMismatches} from '../src/Courses/Camp';
import {CampJobSpecSchema, campJobFiles, campJobNumber} from '../src/Courses/CampJob';
import {VideoJobValidationError, durationWarnings, resolveVideoJob} from '../src/Renderers/VideoJob';
import {readVideoJob} from '../src/Renderers/VideoJobFile';
import {visualKitOf} from '../src/Courses/CourseDesign';
import {CHECKLIST_STAGES, CURRICULUM_DIRECTORY, STAGE_LABELS, TWIN_LESSONS, entryRef, nextEntry, subtopicCoverage, taughtRefs, unknownSubtopics, type ChecklistEntry, type ChecklistStage, type TeachingScript} from '../src/Courses/Curriculum';
import {LessonScriptSchema, reviewScript, type LessonScript} from '../src/Courses/LessonScript';
import {WORKS_DIRECTORY, worksViewOf} from '../src/Courses/WorksView';
import {MEDIA_CREDITS_FILE, MEDIA_DIRECTORY, MediaCreditsSchema} from '../src/Courses/MediaLibrary';
import {dataFoldersIn, educationDataDirectory, importCurriculum, masterLessonList, readChecklist, topicSources, writeChecklist} from '../src/Courses/CurriculumImport';
import {pastExamFile, readPastExamQuestions, summarizePastExam} from '../src/Courses/PastExamQuestion';
import {lessonMix, repeatedSentences, similarQuestions, type AuditedScript} from '../src/Courses/ScriptAudit';

const ROOT = path.resolve(import.meta.dirname, '..');
const CURRICULUM = path.join(ROOT, CURRICULUM_DIRECTORY);
const DATA = educationDataDirectory();
/** How a data file is shown: from the data folder's name, so the reader sees where it lives. */
const dataPath = (relative: string) => `${path.basename(DATA)}/${relative.replaceAll('\\', '/')}`;

const {positionals, values} = parseArgs({
	allowPositionals: true,
	options: {
		lessons: {type: 'string'},
		data: {type: 'string'},
		lesson: {type: 'string'},
		name: {type: 'string'},
		promise: {type: 'string'},
		category: {type: 'string'},
		stage: {type: 'string', default: 'youtube'},
		count: {type: 'string', default: '5'},
		file: {type: 'string'},
		undo: {type: 'boolean', default: false},
		mark: {type: 'boolean', default: false},
		force: {type: 'boolean', default: false},
	},
});
const [command, target] = positionals;

const findEntry = (entries: readonly ChecklistEntry[], key: string | undefined): ChecklistEntry => {
	const entry = entries.find((item) => item.id === key || `${item.category}/${item.lesson}/${item.topic}` === key);
	if (!entry) {
		console.error(`Konu bulunamadı: ${key ?? '(boş)'}. Kimlik ya da KATEGORİ/DERS/KONU verin, ör. YKS_TYT/TRK/SOZCUKTE_ANLAM.`);
		process.exit(1);
	}
	return entry;
};

/** Every valid script in Curriculum/Scripts, with its path from the project root. */
const readScripts = async (): Promise<{file: string; script: LessonScript}[]> => {
	const scriptsRoot = path.join(CURRICULUM, 'Scripts');
	const found: {file: string; script: LessonScript}[] = [];
	for (const file of (await readdir(scriptsRoot, {recursive: true})).filter((name) => name.endsWith('.json'))) {
		const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(path.join(scriptsRoot, file), 'utf8')));
		if (parsed.success) found.push({file: [CURRICULUM_DIRECTORY, 'Scripts', ...file.split(path.sep)].join('/'), script: parsed.data});
	}
	return found;
};

const stageOf = (value: string | undefined): ChecklistStage => {
	if (!CHECKLIST_STAGES.includes(value as ChecklistStage)) {
		console.error(`Bilinmeyen aşama: ${value}. Seçenekler: ${CHECKLIST_STAGES.join(', ')}`);
		process.exit(2);
	}
	return value as ChecklistStage;
};

if (command === 'import') {
	const lessonList = path.resolve(values.lessons ?? masterLessonList());
	const data = path.resolve(values.data ?? DATA);
	if (!existsSync(lessonList) || !existsSync(data)) {
		console.error('Kullanım: npm run curriculum -- import [--lessons <lesson.csv>] [--data <EgitimVerileri>]');
		console.error(`  Ders listesi: ${lessonList}${existsSync(lessonList) ? '' : ' (yok)'}\n  Veri: ${data}${existsSync(data) ? '' : ' (yok; EGITIM_VERILERI ile başka bir yer verilebilir)'}`);
		process.exit(2);
	}
	const report = await importCurriculum({lessonList, data, curriculum: CURRICULUM});
	console.log(JSON.stringify(report, null, 2));
} else if (command === 'status') {
	const checklist = await readChecklist(CURRICULUM);
	const groups = new Map<string, {name: string; total: number; done: Record<ChecklistStage, number>}>();
	for (const entry of checklist.entries) {
		if (values.category && entry.category !== values.category) continue;
		const key = values.category ? `${entry.lessonName} (${entry.lesson})` : `${entry.exam} · ${entry.categoryName}`;
		const group = groups.get(key) ?? {name: key, total: 0, done: {prepared: 0, used: 0, youtube: 0, short: 0}};
		group.total += 1;
		for (const stage of CHECKLIST_STAGES) if (entry.status[stage]) group.done[stage] += 1;
		groups.set(key, group);
	}
	for (const group of groups.values()) {
		console.log(`${group.name.padEnd(46)} ${CHECKLIST_STAGES.map((stage) => `${STAGE_LABELS[stage]} ${group.done[stage]}/${group.total}`).join(' · ')}`);
	}
} else if (command === 'next') {
	const checklist = await readChecklist(CURRICULUM);
	const stage = stageOf(values.stage);
	const first = nextEntry(checklist, stage);
	const pending = first ? checklist.entries.filter((entry) => entry.status[stage] === null).slice(0, Number(values.count)) : [];
	if (pending.length === 0) console.log(`Bütün konular için "${STAGE_LABELS[stage]}" tamam.`);
	for (const entry of pending) {
		console.log(`${String(entry.order).padStart(5)}  ${entry.category}/${entry.lesson}/${entry.topic}  ${entry.lessonName}: ${entry.topicName}`);
		console.log(`       ${entry.subtopics.length} alt başlık · anlatım ${entry.sources.explanation ? 'var' : 'yok'} · soru ${entry.sources.questionCount} (cevaplı ${entry.sources.answeredCount}, ÖSYM ${entry.sources.pastExamCount}) · id ${entry.id}`);
	}
} else if (command === 'mark') {
	if (!target) {
		console.error('Kullanım: npm run curriculum -- mark <konu id | KATEGORİ/DERS/KONU> --stage prepared|used|youtube|short [--file yol] [--undo]');
		process.exit(2);
	}
	const stage = stageOf(values.stage);
	const checklist = await readChecklist(CURRICULUM);
	const entry = findEntry(checklist.entries, target);
	entry.status[stage] = values.undo ? null : new Date().toISOString();
	const fileKey = stage === 'prepared' ? 'script' : stage === 'youtube' ? 'youtube' : stage === 'short' ? 'short' : null;
	if (values.file && fileKey) entry.files[fileKey] = values.file;
	await writeChecklist(CURRICULUM, checklist);
	console.log(`${entry.lessonName}: ${entry.topicName} → ${STAGE_LABELS[stage]} ${values.undo ? 'geri alındı' : 'işaretlendi'}.`);
} else if (command === 'brief') {
	const listed = findEntry((await readChecklist(CURRICULUM)).entries, target);
	// The data keeps changing on the Desktop: its files and counts are read now, not taken from the last import.
	const folder = (await dataFoldersIn(DATA)).get(listed.category);
	const entry = {...listed, sources: await topicSources(DATA, folder, listed.lesson, listed.topic)};
	console.log(`${entry.order}. ${entry.exam} · ${entry.categoryName} · ${entry.lessonName} · ${entry.topicName} (${entry.category}/${entry.lesson}/${entry.topic}, id ${entry.id})\n`);
	console.log('Alt başlıklar (her biri bir bölüm):');
	entry.subtopics.forEach((subtopic, index) => console.log(`  ${String(index + 1).padStart(2)}. ${subtopic.name}  ${subtopic.code}`));
	if (entry.sources.explanation) {
		type Explanation = {lessonMikros?: {code: string; name: string}[]; explanations?: {source?: {publisher?: string; license?: string; file?: string; pages?: number[]}; sections?: {heading?: string; text?: string}[]}[]};
		const explanation = JSON.parse(await readFile(path.join(DATA, entry.sources.explanation), 'utf8')) as Explanation;
		console.log(`\nKonu anlatımı: ${dataPath(entry.sources.explanation)}`);
		for (const part of explanation.explanations ?? []) {
			const characters = (part.sections ?? []).reduce((sum, section) => sum + (section.text?.length ?? 0), 0);
			const pages = part.source?.pages ?? [];
			console.log(`  • ${part.source?.publisher ?? 'kaynak'} · ${part.source?.file ?? ''}${pages.length ? ` · sayfa ${pages[0]}–${pages[pages.length - 1]} (${pages.length})` : ''} · ${part.sections?.length ?? 0} bölüm, ${characters.toLocaleString('tr-TR')} karakter`);
		}
		const known = new Set(entry.subtopics.map((subtopic) => subtopic.code));
		const extra = (explanation.lessonMikros ?? []).filter((mikro) => !known.has(mikro.code));
		if (extra.length > 0) console.log(`  Anlatımda ders listesinde olmayan alt başlıklar: ${extra.map((mikro) => mikro.code).join(', ')}`);
		console.log('  Metin PDF\'ten ayrıştırıldı: kapak, künye ve sayfa başlıkları karışmış olabilir; senaryo bilgiyi kendi cümleleriyle yazar.');
	} else {
		console.log('\nKonu anlatımı yok: anlatım müfredattan ve soru havuzundan yazılır, ayrıca doğrulanır.');
	}
	console.log(`\nSoru havuzu: ${entry.sources.questionCount} soru (cevaplı ${entry.sources.answeredCount}, ÖSYM ${entry.sources.pastExamCount})${entry.sources.questions ? ` · ${dataPath(entry.sources.questions)}` : ''}`);
	console.log('  Sorular yapı ve yaklaşım için okunur; metinleri olduğu gibi kullanılmaz (telif). Değiştirilen soru yeniden çözülür.');
	const past = folder ? await readPastExamQuestions(DATA, folder, entry.category, entry.lesson, entry.topic) : [];
	if (folder && past.length > 0) {
		const summary = summarizePastExam(past);
		console.log(`\nÖSYM çıkmış soruları (resmî liste): ${summary.total} soru · ${dataPath(path.relative(DATA, pastExamFile(DATA, folder, entry.lesson)))}`);
		console.log(`  Yıllar: ${summary.byYear.map(([year, n]) => `${year} ${n}`).join(' · ')}${summary.undated ? ` · yılsız ${summary.undated}` : ''}`);
		console.log(`  Alt başlıklar: ${summary.byMikro.map(([name, n]) => `${name} ${n}`).join(' · ')}`);
		console.log('  Soru kalıpları (her biri derste en az bir kart ya da çözümlü soruyla temsil edilir):');
		summary.patterns.forEach(([pattern, n]) => console.log(`    ${n}× ${pattern}`));
		console.log(`  Şekilli ${summary.withFigure} · eşlemesi inceleme bekleyen ${summary.needsReview}. Sınavdaki yeri bu sayılarla söylenir (docs/Courses.md §0).`);
	} else {
		console.log(`\nÖSYM çıkmış soruları: bu konuya bağlı soru yok${folder ? '' : ' (veri klasörü bulunamadı)'}. Liste: python -m sourceparsing cikmis.`);
	}
	console.log(`\nDersin görselleri (öncelik sırasıyla): ${visualKitOf(entry.lesson).join(', ')}`);
	console.log(`\nSenaryo dosyası: Curriculum/Scripts/${entry.category}/${entry.lesson}/${entry.topic}.json`);
} else if (command === 'check') {
	if (!target) {
		console.error('Kullanım: npm run curriculum -- check <senaryo.json> [--mark]');
		process.exit(2);
	}
	// A script file, or a camp job that names its script.
	const job = JSON.parse(await readFile(path.resolve(target), 'utf8')) as {script?: unknown};
	const scriptFile = typeof job.script === 'string' ? path.join(ROOT, job.script) : path.resolve(target);
	const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(scriptFile, 'utf8')));
	if (!parsed.success) {
		console.error(`GEÇERSİZ  ${target}`);
		parsed.error.issues.forEach((issue) => console.error(`  ${issue.path.join('.')}: ${issue.message}`));
		process.exit(2);
	}
	const script = parsed.data;
	const checklist = await readChecklist(CURRICULUM);
	const entry = checklist.entries.find((item) => item.id === script.topic.id);
	// A subtopic may be taught in another script of the same lesson: KPSS's one video set for three levels, or a
	// subtopic the lesson list added to a topic that a neighbouring lesson already teaches (31 Oct 2026).
	const own = path.relative(ROOT, scriptFile).split(path.sep).join('/');
	const elsewhere = new Set(
		(await readScripts())
			.filter(({file, script: other}) => file !== own && other.topic.lesson === script.topic.lesson)
			.flatMap(({script: other}) => taughtRefs(other.topic.category, other.topic.lesson, other.lesson.sections)),
	);
	const review = reviewScript(script, entry?.subtopics.map((subtopic) => subtopic.code).filter((code) => !elsewhere.has(entryRef(entry, code))) ?? []);
	const issues = [...review.issues];
	if (!entry) issues.push(`Topic id ${script.topic.id} is not in the checklist.`);
	// Other levels' subtopics a section names (KPSS: one video set for three levels) must exist in their lists.
	unknownSubtopics(checklist.entries, [{file: target, refs: taughtRefs(script.topic.category, script.topic.lesson, script.lesson.sections)}]).forEach((item) => issues.push(`Subtopic ${item.ref} is in no topic of the checklist.`));
	if (script.camp) {
		const campFile = path.join(CURRICULUM, CAMPS_DIRECTORY, `${script.camp.id}.json`);
		if (!existsSync(campFile)) issues.push(`Camp ${script.camp.id} has no plan at Curriculum/${CAMPS_DIRECTORY}/${script.camp.id}.json.`);
		else issues.push(...campMismatches(CampSchema.parse(JSON.parse(await readFile(campFile, 'utf8'))), script.topic.code, script.camp));
	}
	const creditsFile = path.join(ROOT, 'public', MEDIA_DIRECTORY, MEDIA_CREDITS_FILE);
	const credited = new Set(existsSync(creditsFile) ? MediaCreditsSchema.parse(JSON.parse(await readFile(creditsFile, 'utf8'))).entries.map((item) => item.file) : []);
	const pictures = JSON.stringify(script).match(/"src":"(Media\/[^"]+)"/g)?.map((match) => match.slice(7, -1)) ?? [];
	pictures.filter((file) => !credited.has(file)).forEach((file) => issues.push(`Picture ${file} has no entry in public/Media/Credits.json.`));
	console.log(`${script.lessonName}: ${script.title} · ders ~${Math.round(review.lessonSeconds / 60)} dk · kısa ~${Math.round(review.shortSeconds)} sn · ${review.questions} çözümlü soru`);
	issues.forEach((issue) => console.log(`  ! ${issue}`));
	// Suggestions ("?") do not block "Hazırlandı"; they are the next improvements (docs/Courses.md).
	review.suggestions.forEach((suggestion) => console.log(`  ? ${suggestion}`));
	if (issues.length === 0) console.log('  Hedeflere uygun.');
	if (values.mark && entry) {
		if (issues.length > 0) {
			console.error('Eksikler giderilmeden "Hazırlandı" işaretlenmez.');
			process.exit(1);
		}
		entry.status.prepared = new Date().toISOString();
		entry.status.used = entry.status.used ?? new Date().toISOString();
		entry.files.script = path.relative(ROOT, path.resolve(target)).split(path.sep).join('/');
		await writeChecklist(CURRICULUM, checklist);
		console.log('  Kontrol listesinde "Hazırlandı" ve "Kullanıldı" işaretlendi.');
	}
} else if (command === 'camp') {
	const directory = path.join(CURRICULUM, CAMPS_DIRECTORY);
	if (target === 'create') {
		if (!values.category || !values.lesson) {
			console.error('Kullanım: npm run curriculum -- camp create --category YKS_TYT --lesson TRK [--name "TYT Türkçe kampı"] [--promise "..."]');
			process.exit(2);
		}
		const camp = campFromChecklist(await readChecklist(CURRICULUM), {category: values.category, lesson: values.lesson, name: values.name, promise: values.promise});
		const file = path.join(directory, `${camp.id}.json`);
		if (existsSync(file)) {
			console.error(`Kamp zaten var: Curriculum/${CAMPS_DIRECTORY}/${camp.id}.json. Sırayı değiştirmek için dosyayı düzenleyin.`);
			process.exit(1);
		}
		await mkdir(directory, {recursive: true});
		await writeFile(file, `${JSON.stringify(camp, null, 2)}\n`);
		console.log(`${camp.name}: ${camp.lessons.length} ders → Curriculum/${CAMPS_DIRECTORY}/${camp.id}.json`);
	} else if (target === 'show') {
		const id = positionals[2];
		const file = path.join(directory, `${id}.json`);
		if (!id || !existsSync(file)) {
			console.error(`Kullanım: npm run curriculum -- camp show <kamp id>. Kamplar: Curriculum/${CAMPS_DIRECTORY}/`);
			process.exit(2);
		}
		const camp = CampSchema.parse(JSON.parse(await readFile(file, 'utf8')));
		const entries = (await readChecklist(CURRICULUM)).entries.filter((entry) => entry.category === camp.category && entry.lesson === camp.lesson);
		console.log(`${camp.name} · ${camp.lessons.length} ders · ${camp.promise}`);
		camp.lessons.forEach((lesson, index) => {
			const entry = entries.find((item) => item.topic === lesson.topic);
			const marks = CHECKLIST_STAGES.map((stage) => (entry?.status[stage] ? '✓' : '·')).join(' ');
			console.log(`  ${String(index + 1).padStart(2)}. ${marks}  ${lesson.title}  ${lesson.topic}  · soru ${entry?.sources.questionCount ?? 0}${entry?.sources.explanation ? '' : ' · anlatım yok'}`);
		});
		console.log(`  (H K YT KV: ${CHECKLIST_STAGES.map((stage) => STAGE_LABELS[stage]).join(', ')})`);
	} else {
		console.error('Kullanım: npm run curriculum -- camp create|show ...');
		process.exit(2);
	}
} else if (command === 'coverage') {
	if (!target) {
		console.error('Kullanım: npm run curriculum -- coverage <KATEGORİ ÖNEKİ, ör. KPSS> [--mark]');
		process.exit(2);
	}
	const inScope = (category: string) => category === target || category.startsWith(`${target}_`);
	const checklist = await readChecklist(CURRICULUM);
	const entries = checklist.entries.filter((entry) => inScope(entry.category));
	const scripts: (TeachingScript & {topicId: string})[] = (await readScripts())
		.filter(({script}) => inScope(script.topic.category))
		.map(({file, script}) => ({file, topicId: script.topic.id, refs: taughtRefs(script.topic.category, script.topic.lesson, script.lesson.sections)}));
	const coverage = subtopicCoverage(entries, scripts);
	const groups = new Map<string, typeof coverage>();
	coverage.forEach((row) => groups.set(`${row.entry.category}/${row.entry.lesson}`, [...(groups.get(`${row.entry.category}/${row.entry.lesson}`) ?? []), row]));
	console.log(`${target}: ${scripts.length} senaryo · ${entries.length} konu · ${entries.reduce((total, entry) => total + entry.subtopics.length, 0)} alt konu`);
	groups.forEach((rows, key) => {
		const open = rows.filter((row) => row.missing.length > 0);
		console.log(`  ${key}: ${rows.length - open.length}/${rows.length} konu tam · eksik alt konu ${open.reduce((total, row) => total + row.missing.length, 0)}`);
	});
	coverage
		.filter((row) => row.missing.length > 0 && row.scripts.length > 0)
		.forEach((row) => console.log(`  ! ${row.entry.category}/${row.entry.lesson}/${row.entry.topic}: ${row.missing.length} alt konu hiçbir bölümde yok (${row.missing.slice(0, 6).join(', ')}${row.missing.length > 6 ? ', …' : ''})`));
	unknownSubtopics(entries, scripts).forEach((item) => console.log(`  ! ${item.file}: ${item.ref} hiçbir konunun alt konusu değil.`));
	if (values.mark) {
		const prepared = (file: string) => {
			const script = scripts.find((item) => item.file === file);
			return Boolean(script && checklist.entries.find((entry) => entry.id === script.topicId)?.status.prepared);
		};
		let marked = 0;
		coverage
			.filter((row) => row.missing.length === 0 && row.scripts.length > 0 && row.scripts.every(prepared))
			.forEach((row) => {
				const own = scripts.find((script) => script.topicId === row.entry.id)?.file;
				row.entry.files.script = own ?? row.scripts[0];
				row.entry.files.scripts = row.scripts.length > 1 ? row.scripts : undefined;
				if (!row.entry.status.prepared) {
					row.entry.status.prepared = new Date().toISOString();
					row.entry.status.used = row.entry.status.used ?? row.entry.status.prepared;
					marked += 1;
				}
			});
		await writeChecklist(CURRICULUM, checklist);
		console.log(`  Kapsamı tamamlanan ${marked} konu "Hazırlandı" işaretlendi.`);
	}
} else if (command === 'works') {
	const inScope = (category: string) => !target || category === target || category.startsWith(`${target}_`);
	const entries = (await readChecklist(CURRICULUM)).entries.filter((entry) => inScope(entry.category));
	const sources = await readScripts();
	const worksRoot = path.join(CURRICULUM, WORKS_DIRECTORY);
	const written = new Set<string>();
	const counts = new Map<string, {views: number; topics: number; open: string[]}>();
	for (const entry of entries) {
		const lesson = TWIN_LESSONS[entry.lesson] ?? entry.lesson;
		const result = worksViewOf(
			entry,
			sources.filter(({script}) => (TWIN_LESSONS[script.topic.lesson] ?? script.topic.lesson) === lesson),
		);
		const count = counts.get(entry.category) ?? {views: 0, topics: 0, open: []};
		count.topics += 1;
		if ('view' in result) {
			const file = path.join(worksRoot, entry.category, entry.lesson, `${entry.topic}.json`);
			await mkdir(path.dirname(file), {recursive: true});
			await writeFile(file, `${JSON.stringify(result.view, null, 1)}\n`);
			written.add(file);
			count.views += 1;
		} else if (result.missing.length < entry.subtopics.length) count.open.push(`${entry.lesson}/${entry.topic} (${result.missing.length} alt konu eksik)`);
		counts.set(entry.category, count);
	}
	// A view whose topic is no longer fully taught is removed, so Works never imports half a topic.
	for (const category of counts.keys()) {
		const folder = path.join(worksRoot, category);
		if (!existsSync(folder)) continue;
		for (const file of (await readdir(folder, {recursive: true})).filter((name) => name.endsWith('.json')).map((name) => path.join(folder, name)))
			if (!written.has(file)) await unlink(file);
	}
	counts.forEach((count, category) => {
		if (count.views === 0 && count.open.length === 0) return;
		console.log(`${category}: ${count.views}/${count.topics} konunun Works dosyası → Curriculum/${WORKS_DIRECTORY}/${category}/`);
		count.open.slice(0, 8).forEach((item) => console.log(`  · yarım: ${item}`));
		if (count.open.length > 8) console.log(`  · … ${count.open.length - 8} yarım konu daha`);
	});
} else if (command === 'jobs' && target === 'make') {
	const specs = positionals.slice(2);
	if (specs.length === 0) {
		console.error('Kullanım: npm run curriculum -- jobs make <spec.json> [spec.json ...] [--force]');
		process.exit(2);
	}
	const scripts = await readScripts();
	for (const specFile of specs) {
		const spec = CampJobSpecSchema.parse(JSON.parse(await readFile(path.resolve(specFile), 'utf8')));
		const matches = scripts.filter(({script}) => script.topic.code === spec.code && (!spec.category || script.topic.category === spec.category));
		if (matches.length !== 1) {
			console.error(`${specFile}: ${spec.code} için ${matches.length} senaryo var${matches.length > 1 ? '; spec dosyasına "category" ekleyin' : ''}.`);
			process.exit(1);
		}
		const [{file, script}] = matches;
		const campFile = path.join(CURRICULUM, CAMPS_DIRECTORY, `${script.camp?.id}.json`);
		if (!script.camp || !existsSync(campFile)) {
			console.error(`${file}: senaryonun kampı yok ya da kamp planı bulunamadı (${script.camp?.id ?? 'camp alanı yok'}).`);
			process.exit(1);
		}
		const camp = CampSchema.parse(JSON.parse(await readFile(campFile, 'utf8')));
		const directory = path.join(CURRICULUM, 'Jobs', camp.id);
		await mkdir(directory, {recursive: true});
		const written: string[] = [];
		for (const output of campJobFiles(spec, script, file, camp)) {
			const outputFile = path.join(directory, output.name);
			if (output.name.endsWith('.md') && existsSync(outputFile) && !values.force) continue;
			await writeFile(outputFile, output.text);
			written.push(output.name);
		}
		console.log(`${camp.id}: ${written.join(', ') || 'değişen yok'}`);
	}
} else if (command === 'jobs' && target === 'check') {
	const jobsRoot = path.join(CURRICULUM, 'Jobs');
	// Every camp plan, so a camp whose lessons have no jobs yet shows up too.
	const campIds = positionals[2] ? [positionals[2]] : (await readdir(path.join(CURRICULUM, CAMPS_DIRECTORY))).filter((name) => name.endsWith('.json')).map((name) => name.slice(0, -'.json'.length));
	const scripts = await readScripts();
	const problems: string[] = [];
	let checked = 0;
	for (const campId of campIds) {
		const directory = path.join(jobsRoot, campId);
		const files = existsSync(directory) ? (await readdir(directory)).filter((name) => campJobNumber(name) !== undefined) : [];
		const numbers = new Set<number>();
		for (const name of files) {
			const shown = `${campId}/${name}`;
			try {
				const job = resolveVideoJob(readVideoJob(path.join(directory, name)));
				const episode = (job.inputProps.content as LessonScript).camp;
				if (episode?.id !== campId || episode.number !== campJobNumber(name)) problems.push(`${shown}: senaryo ${episode?.id ?? '(kampsız)'} ${episode?.number ?? ''}. ders; dosya adı ${campJobNumber(name)}. ders diyor.`);
				else numbers.add(episode.number);
				if (name.endsWith('-youtube.json')) durationWarnings(job).forEach((warning) => problems.push(`${shown}: ${warning}`));
			} catch (error) {
				problems.push(`${shown}: ${error instanceof VideoJobValidationError ? error.issues.join(' · ') : String(error)}`);
			}
			checked++;
		}
		scripts
			.filter(({script}) => script.camp?.id === campId && !numbers.has(script.camp.number))
			.forEach(({file, script}) => problems.push(`${campId}: ${script.camp?.number}. dersin işi yok (${file}).`));
	}
	console.log(`${campIds.length} kamp · ${checked} iş · sorun ${problems.length}`);
	problems.forEach((problem) => console.log(`  ${problem}`));
	if (problems.length) process.exit(1);
} else if (command === 'audit') {
	const scriptsRoot = path.join(CURRICULUM, 'Scripts');
	const files = (await readdir(scriptsRoot, {recursive: true})).filter((file) => file.endsWith('.json')).map((file) => path.join(scriptsRoot, file));
	const audited: AuditedScript[] = [];
	for (const file of files) {
		const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(file, 'utf8')));
		if (parsed.success) audited.push({code: path.basename(file, '.json'), script: parsed.data});
		else console.error(`GEÇERSİZ  ${path.relative(ROOT, file)}`);
	}
	const repeated = repeatedSentences(audited);
	const similar = similarQuestions(audited);
	const mixes = audited.map(({code, script}) => ({code, lesson: script.lessonName, ...lessonMix(script), suggestions: reviewScript(script).suggestions.length})).sort((a, b) => a.lesson.localeCompare(b.lesson, 'tr') || a.code.localeCompare(b.code));
	const lines = [
		'# Ders denetimi',
		'',
		`\`npm run curriculum -- audit\` ile üretildi (${new Date().toISOString().slice(0, 10)}). ${audited.length} ders. Hiçbir şeyi engellemez; dersler arası tekrarı ve zayıf noktaları gösterir.`,
		'',
		`## Birden çok derste geçen cümleler (${repeated.length})`,
		'',
		'Soru çözümünün kalıp cümleleri sayılmaz. Her ders kendi anlatımını taşımalı; buradakiler gözden geçirilir.',
		'',
		...(repeated.length ? repeated.map((item) => `- "${item.sentence}" · ${item.lessons.join(', ')}`) : ['Yok.']),
		'',
		`## Neredeyse aynı sorular (${similar.length})`,
		'',
		'Kök ve öncülün kelime üçlülerinin en az %80\'i ortak.',
		'',
		...(similar.length ? similar.map((pair) => `- ${pair.a} ≈ ${pair.b} (${pair.similarity})`) : ['Yok.']),
		'',
		'## Derslerin kart ve görsel karışımı',
		'',
		'"Görselsiz kural" ve "tablo payı" yüksek, "tahmin" ve "örnek" düşük olan dersler kart ekleme ve genişletmenin ilk adaylarıdır. "Süreç önerisi": anlatımın andığı bir süreci gösteren görsel yok (`curriculum check` "?" satırları).',
		'',
		'| Ders | Kod | Kart | Soru | Tahmin | Örnek | Hata | Görselsiz kural | Görsel | Tablo payı | Süreç önerisi |',
		'|---|---|---|---|---|---|---|---|---|---|---|',
		...mixes.map((mix) => `| ${mix.lesson} | ${mix.code} | ${mix.cards} | ${mix.questions} | ${mix.predicts} | ${mix.examples} | ${mix.mistakes} | ${mix.rulesWithoutFigure} | ${mix.figures} | %${Math.round(mix.tableShare * 100)} | ${mix.suggestions} |`),
		'',
	];
	const report = path.join(CURRICULUM, 'Production', 'DersDenetimi.md');
	await writeFile(report, lines.join('\n'));
	console.log(`${audited.length} ders · ${repeated.length} tekrar eden cümle · ${similar.length} benzer soru · ${mixes.reduce((sum, mix) => sum + mix.suggestions, 0)} süreç önerisi`);
	console.log(`Rapor: ${path.relative(ROOT, report)}`);
} else {
	console.error('Komutlar: import, status, next, mark, brief, check, camp, coverage, works, jobs make|check, audit. Ayrıntı: scripts/Curriculum.ts');
	process.exit(2);
}
