/**
 * The curriculum the education videos are made from.
 *
 *   npm run curriculum -- import [--lessons <lesson.csv>] [--data <EgitimVerileri copy>]
 *       Builds Curriculum/: catalogue and production checklist, every topic
 *       bound to its lesson explanation and questions in Curriculum/Data.
 *       Defaults: Curriculum/Sources/LessonList.csv and Curriculum/Data.
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
 *       in Curriculum/Data/<exam>/CikmisSorular) and the lesson's visuals.
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
 */
import path from 'node:path';
import {parseArgs} from 'node:util';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {CAMPS_DIRECTORY, CampSchema, campFromChecklist, campMismatches} from '../src/Courses/Camp';
import {visualKitOf} from '../src/Courses/CourseDesign';
import {CHECKLIST_STAGES, CURRICULUM_DIRECTORY, DATA_DIRECTORY, STAGE_LABELS, nextEntry, type ChecklistEntry, type ChecklistStage} from '../src/Courses/Curriculum';
import {LessonScriptSchema, reviewScript} from '../src/Courses/LessonScript';
import {MEDIA_CREDITS_FILE, MEDIA_DIRECTORY, MediaCreditsSchema} from '../src/Courses/MediaLibrary';
import {dataFolders, importCurriculum, readChecklist, writeChecklist} from '../src/Courses/CurriculumImport';
import {pastExamFile, readPastExamQuestions, summarizePastExam} from '../src/Courses/PastExamQuestions';

const ROOT = path.resolve(import.meta.dirname, '..');
const CURRICULUM = path.join(ROOT, CURRICULUM_DIRECTORY);
const DATA = path.join(CURRICULUM, DATA_DIRECTORY);

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

const stageOf = (value: string | undefined): ChecklistStage => {
	if (!CHECKLIST_STAGES.includes(value as ChecklistStage)) {
		console.error(`Bilinmeyen aşama: ${value}. Seçenekler: ${CHECKLIST_STAGES.join(', ')}`);
		process.exit(2);
	}
	return value as ChecklistStage;
};

if (command === 'import') {
	const lessonList = path.resolve(values.lessons ?? path.join(CURRICULUM, 'Sources', 'LessonList.csv'));
	const data = path.resolve(values.data ?? DATA);
	if (!existsSync(lessonList) || !existsSync(data)) {
		console.error('Kullanım: npm run curriculum -- import [--lessons <lesson.csv>] [--data <EgitimVerileri kopyası>]');
		console.error(`  Ders listesi: ${lessonList}${existsSync(lessonList) ? '' : ' (yok)'}\n  Veri: ${data}${existsSync(data) ? '' : ' (yok; Desktop\\EgitimVerileri\'nden YKS ve KPSS kopyalanır)'}`);
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
	const entry = findEntry((await readChecklist(CURRICULUM)).entries, target);
	console.log(`${entry.order}. ${entry.exam} · ${entry.categoryName} · ${entry.lessonName} · ${entry.topicName} (${entry.category}/${entry.lesson}/${entry.topic}, id ${entry.id})\n`);
	console.log('Alt başlıklar (her biri bir bölüm):');
	entry.subtopics.forEach((subtopic, index) => console.log(`  ${String(index + 1).padStart(2)}. ${subtopic.name}  ${subtopic.code}`));
	if (entry.sources.explanation) {
		type Explanation = {lessonMikros?: {code: string; name: string}[]; explanations?: {source?: {publisher?: string; license?: string; file?: string; pages?: number[]}; sections?: {heading?: string; text?: string}[]}[]};
		const explanation = JSON.parse(await readFile(path.join(DATA, entry.sources.explanation), 'utf8')) as Explanation;
		console.log(`\nKonu anlatımı: Curriculum/Data/${entry.sources.explanation}`);
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
	console.log(`\nSoru havuzu: ${entry.sources.questionCount} soru (cevaplı ${entry.sources.answeredCount}, ÖSYM ${entry.sources.pastExamCount})${entry.sources.questions ? ` · Curriculum/Data/${entry.sources.questions}` : ''}`);
	console.log('  Sorular yapı ve yaklaşım için okunur; metinleri olduğu gibi kullanılmaz (telif). Değiştirilen soru yeniden çözülür.');
	const indexFile = path.join(DATA, 'Index.json');
	const folder = existsSync(indexFile) ? dataFolders(JSON.parse(await readFile(indexFile, 'utf8'))).get(entry.category) : undefined;
	const past = folder ? await readPastExamQuestions(DATA, folder, entry.category, entry.lesson, entry.topic) : [];
	if (folder && past.length > 0) {
		const summary = summarizePastExam(past);
		console.log(`\nÖSYM çıkmış soruları (resmî liste): ${summary.total} soru · Curriculum/Data/${path.relative(DATA, pastExamFile(DATA, folder, entry.lesson)).replaceAll('\\', '/')}`);
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
	// A script file, or a render job whose content is a script.
	const raw = JSON.parse(await readFile(path.resolve(target), 'utf8')) as {template?: string; content?: unknown};
	const parsed = LessonScriptSchema.safeParse(raw.template && raw.content ? raw.content : raw);
	if (!parsed.success) {
		console.error(`GEÇERSİZ  ${target}`);
		parsed.error.issues.forEach((issue) => console.error(`  ${issue.path.join('.')}: ${issue.message}`));
		process.exit(2);
	}
	const script = parsed.data;
	const checklist = await readChecklist(CURRICULUM);
	const entry = checklist.entries.find((item) => item.id === script.topic.id);
	const review = reviewScript(script, entry?.subtopics.map((subtopic) => subtopic.code) ?? []);
	const issues = [...review.issues];
	if (!entry) issues.push(`Topic id ${script.topic.id} is not in the checklist.`);
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
} else {
	console.error('Komutlar: import, status, next, mark, brief, check, camp. Ayrıntı: scripts/Curriculum.ts');
	process.exit(2);
}
