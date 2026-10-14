/**
 * The curriculum the education videos are made from.
 *
 *   npm run curriculum -- import --lessons <lesson.csv> --corpus <ReferenceCorpus>
 *       Builds Curriculum/: catalogue, production checklist and the regrouped
 *       reference corpus. Running it again keeps the checklist's progress.
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
 *       learning outcomes and misconceptions, the question pools and the
 *       lesson's visuals. Ends with the path the script goes to.
 *
 *   npm run curriculum -- check <script.json> [--mark]
 *       Validates a lesson script, reviews it against the targets (length,
 *       subtopics, questions, picture credits) and, with --mark, records it
 *       as prepared.
 */
import path from 'node:path';
import {parseArgs} from 'node:util';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {visualKitOf} from '../src/Courses/CourseDesign';
import {CHECKLIST_STAGES, CURRICULUM_DIRECTORY, STAGE_LABELS, nextEntry, type ChecklistEntry, type ChecklistStage} from '../src/Courses/Curriculum';
import {LessonScriptSchema, reviewScript} from '../src/Courses/LessonScript';
import {MEDIA_CREDITS_FILE, MEDIA_DIRECTORY, MediaCreditsSchema} from '../src/Courses/MediaLibrary';
import {importCurriculum, readChecklist, writeChecklist} from '../src/Courses/CurriculumImport';

const ROOT = path.resolve(import.meta.dirname, '..');
const CURRICULUM = path.join(ROOT, CURRICULUM_DIRECTORY);

const {positionals, values} = parseArgs({
	allowPositionals: true,
	options: {
		lessons: {type: 'string'},
		corpus: {type: 'string'},
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
	if (!values.lessons || !values.corpus) {
		console.error('Kullanım: npm run curriculum -- import --lessons <lesson.csv> --corpus <ReferenceCorpus klasörü>');
		process.exit(2);
	}
	const report = await importCurriculum({lessonList: path.resolve(values.lessons), corpus: path.resolve(values.corpus), curriculum: CURRICULUM});
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
		console.log(`       ${entry.subtopics.length} alt başlık · anlatım ${entry.sources.explanations.length} · konu sorusu ${entry.sources.questionCount} · ders sorusu ${entry.sources.lessonQuestionCount} · id ${entry.id}`);
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
	for (const relative of entry.sources.explanations) {
		const pack = JSON.parse(await readFile(path.join(CURRICULUM, 'ReferenceCorpus', relative), 'utf8')) as {kazanimStatements?: string[]; misconceptionHints?: string[]; units?: {title: string; kind: string; claims?: unknown[]}[]};
		console.log(`\nKonu anlatımı: ${relative}`);
		pack.units?.forEach((unit) => console.log(`  • ${unit.title} (${unit.kind}, ${unit.claims?.length ?? 0} bilgi)`));
		if (pack.kazanimStatements?.length) console.log(`  Kazanımlar: ${pack.kazanimStatements.slice(0, 4).join(' | ')}`);
		if (pack.misconceptionHints?.length) console.log(`  Sık hatalar: ${pack.misconceptionHints.slice(0, 4).join(' | ')}`);
	}
	if (entry.sources.explanations.length === 0) console.log('\nKonu anlatımı paketi yok: anlatım müfredattan ve soru havuzundan yazılır, ayrıca doğrulanır.');
	console.log(`\nSoru havuzu: konuya bağlı ${entry.sources.questionCount}${entry.sources.questions ? ` (${entry.sources.questions})` : ''} · dersin konusu belirsiz ${entry.sources.lessonQuestionCount}`);
	console.log('  Sorular yapı ve yaklaşım için okunur; metinleri olduğu gibi kullanılmaz (telif). Değiştirilen soru yeniden çözülür.');
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
} else {
	console.error('Komutlar: import, status, next, mark, brief, check. Ayrıntı: scripts/Curriculum.ts');
	process.exit(2);
}
