import {createReadStream, existsSync} from 'node:fs';
import {copyFile, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createInterface} from 'node:readline';
import {z} from 'zod';
import {
	CHECKLIST_STAGES,
	ChecklistEntrySchema,
	ChecklistSchema,
	inProductionOrder,
	type Category,
	type Checklist,
	type ChecklistEntry,
	type Lesson,
	type Topic,
} from './Curriculum';

/**
 * Brings the lesson list into the project and binds every topic to its data.
 *
 * The lesson list (CSV) becomes the catalogue and the production checklist.
 * The data is the copy of Desktop/EgitimVerileri in Curriculum/Data (not in
 * git; past exam questions are not republished). Its layout:
 *
 *   Data/Index.json                                            categories, lessons, topics and counts
 *   Data/<Exam>/<Category>/KonuAnlatimi/<Lesson>/<Topic>.json  lesson explanation: subtopics and the
 *                                                              explanation text by source (MEB OGM, pages)
 *   Data/<Exam>/<Category>/Sorular/<Lesson>/<Topic>.jsonl      questions bound to the topic, one per line
 *
 * Nothing is copied: the checklist points into Data. Running the import again
 * rebuilds the catalogue and the sources but keeps the checklist's progress.
 */

type ImportPaths = {lessonList: string; data: string; curriculum: string};

export type ImportReport = {
	categories: number;
	lessons: number;
	topics: number;
	subtopics: number;
	/** Topics with a lesson explanation, and without one. */
	explanations: {found: number; missing: number};
	questions: {topics: number; total: number; answered: number; pastExam: number};
};

// ---------------------------------------------------------------- lesson list

/** One line of semicolon-separated values; a value in double quotes may contain semicolons and doubled quotes. */
const splitCsvLine = (line: string): string[] => {
	const cells: string[] = [];
	let cell = '';
	let quoted = false;
	for (let index = 0; index < line.length; index++) {
		const char = line[index];
		if (quoted && char === '"' && line[index + 1] === '"') {
			cell += '"';
			index++;
		} else if (char === '"') {
			quoted = !quoted;
		} else if (char === ';' && !quoted) {
			cells.push(cell);
			cell = '';
		} else {
			cell += char;
		}
	}
	cells.push(cell);
	return cells;
};

/**
 * The lesson list has no header. Its 15 columns, separated by semicolons:
 * exam code, id, name; category code, id, name; lesson code, id, name;
 * topic code, id, name; subtopic code, id, name.
 */
export const parseLessonList = (text: string): Category[] => {
	const categories = new Map<string, Category>();
	const lessons = new Map<string, Lesson>();
	const topics = new Map<string, Topic>();
	for (const [index, line] of text.replace(/^﻿/, '').split(/\r?\n/).entries()) {
		if (!line.trim()) continue;
		const cells = splitCsvLine(line).map((cell) => cell.trim());
		if (cells.length !== 15) throw new Error(`Lesson list line ${index + 1} has ${cells.length} columns; 15 expected.`);
		const [exam, examId, examName, category, categoryId, categoryName, lesson, lessonId, lessonName, topic, topicId, topicName, subtopic, subtopicId, subtopicName] = cells;

		let categoryEntry = categories.get(category);
		if (!categoryEntry) {
			categoryEntry = {exam, examId, examName, code: category, id: categoryId, name: categoryName, lessons: []};
			categories.set(category, categoryEntry);
		}
		const lessonKey = `${category}|${lesson}`;
		let lessonEntry = lessons.get(lessonKey);
		if (!lessonEntry) {
			lessonEntry = {code: lesson, id: lessonId, name: lessonName, topics: []};
			lessons.set(lessonKey, lessonEntry);
			categoryEntry.lessons.push(lessonEntry);
		}
		const topicKey = `${lessonKey}|${topic}`;
		let topicEntry = topics.get(topicKey);
		if (!topicEntry) {
			topicEntry = {code: topic, id: topicId, name: topicName, subtopics: []};
			topics.set(topicKey, topicEntry);
			lessonEntry.topics.push(topicEntry);
		}
		topicEntry.subtopics.push({code: subtopic, id: subtopicId, name: subtopicName});
	}
	return [...categories.values()];
};

// ---------------------------------------------------------------- data

/** Folder of a category inside Data, from Data/Index.json. KPSS Ortaöğretim shares the Önlisans folder. */
export const dataFolders = (index: {categories?: {code: string; folder: string}[]}): Map<string, string> => {
	const folders = new Map((index.categories ?? []).map((category) => [category.code, category.folder]));
	const onlisans = folders.get('KPSS_ONLISANS');
	if (onlisans && !folders.has('KPSS_ORTAOGRETIM')) folders.set('KPSS_ORTAOGRETIM', onlisans);
	return folders;
};

/** Counts the questions of a pool: all, those with an answer, and past exam questions (ÖSYM). */
export const countQuestions = async (file: string): Promise<{total: number; answered: number; pastExam: number}> => {
	const counts = {total: 0, answered: 0, pastExam: 0};
	const lines = createInterface({input: createReadStream(file, {encoding: 'utf8'}), crlfDelay: Infinity});
	for await (const text of lines) {
		if (!text.trim()) continue;
		const record = JSON.parse(text) as {answer?: unknown; source?: {publisher?: string; license?: string}};
		counts.total += 1;
		if (record.answer !== null && record.answer !== undefined && record.answer !== '') counts.answered += 1;
		if (record.source?.publisher === 'ÖSYM' || record.source?.license?.startsWith('osym')) counts.pastExam += 1;
	}
	return counts;
};

// ---------------------------------------------------------------- import

export const importCurriculum = async ({lessonList, data, curriculum}: ImportPaths): Promise<ImportReport> => {
	const categories = inProductionOrder(parseLessonList(await readFile(lessonList, 'utf8')));
	const indexFile = path.join(data, 'Index.json');
	const folders = existsSync(indexFile) ? dataFolders(JSON.parse(await readFile(indexFile, 'utf8'))) : new Map<string, string>();
	const report: ImportReport = {
		categories: categories.length,
		lessons: categories.reduce((sum, category) => sum + category.lessons.length, 0),
		topics: categories.reduce((sum, category) => sum + category.lessons.reduce((total, lesson) => total + lesson.topics.length, 0), 0),
		subtopics: categories.reduce((sum, category) => sum + category.lessons.reduce((total, lesson) => total + lesson.topics.reduce((count, topic) => count + topic.subtopics.length, 0), 0), 0),
		explanations: {found: 0, missing: 0},
		questions: {topics: 0, total: 0, answered: 0, pastExam: 0},
	};

	// The lesson list itself, untouched, and the catalogue built from it.
	const listCopy = path.join(curriculum, 'Sources', 'LessonList.csv');
	await mkdir(path.dirname(listCopy), {recursive: true});
	if (path.resolve(lessonList) !== path.resolve(listCopy)) await copyFile(lessonList, listCopy);
	await mkdir(path.join(curriculum, 'Catalog'), {recursive: true});
	for (const category of categories) {
		await writeFile(path.join(curriculum, 'Catalog', `${category.code}.json`), `${JSON.stringify(category, null, 2)}\n`);
	}

	// The checklist: new topics are added, progress on existing ones is kept.
	const checklistFile = path.join(curriculum, 'Production', 'Checklist.json');
	// Only the progress is read back, so a checklist written by an older import still counts.
	const ProgressSchema = z.object({entries: z.array(ChecklistEntrySchema.pick({id: true, status: true, files: true, notes: true}))});
	const previous = existsSync(checklistFile) ? ProgressSchema.parse(JSON.parse(await readFile(checklistFile, 'utf8'))) : null;
	const previousById = new Map(previous?.entries.map((entry) => [entry.id, entry]) ?? []);

	const entries: ChecklistEntry[] = [];
	for (const category of categories) {
		const folder = folders.get(category.code);
		for (const lesson of category.lessons) {
			for (const topic of lesson.topics) {
				const explanation = folder ? `${folder}/KonuAnlatimi/${lesson.code}/${topic.code}.json` : null;
				const questions = folder ? `${folder}/Sorular/${lesson.code}/${topic.code}.jsonl` : null;
				const hasExplanation = explanation !== null && existsSync(path.join(data, explanation));
				const hasQuestions = questions !== null && existsSync(path.join(data, questions));
				const counts = hasQuestions && questions ? await countQuestions(path.join(data, questions)) : {total: 0, answered: 0, pastExam: 0};
				report.explanations[hasExplanation ? 'found' : 'missing'] += 1;
				if (counts.total > 0) report.questions.topics += 1;
				report.questions.total += counts.total;
				report.questions.answered += counts.answered;
				report.questions.pastExam += counts.pastExam;
				const kept = previousById.get(topic.id);
				entries.push({
					order: entries.length + 1,
					id: topic.id,
					exam: category.exam,
					category: category.code,
					categoryName: category.name,
					lesson: lesson.code,
					lessonName: lesson.name,
					topic: topic.code,
					topicName: topic.name,
					subtopics: topic.subtopics,
					sources: {
						explanation: hasExplanation ? explanation : null,
						questions: hasQuestions ? questions : null,
						questionCount: counts.total,
						answeredCount: counts.answered,
						pastExamCount: counts.pastExam,
					},
					status: kept?.status ?? {prepared: null, used: null, youtube: null, short: null},
					files: kept?.files ?? {},
					...(kept?.notes ? {notes: kept.notes} : {}),
				});
			}
		}
	}
	const checklist: Checklist = {schemaVersion: 1, generatedFrom: 'Sources/LessonList.csv', entries};
	await writeChecklist(curriculum, checklist);
	await writeFile(path.join(curriculum, 'Production', 'ImportReport.json'), `${JSON.stringify(report, null, 2)}\n`);
	return report;
};

// ---------------------------------------------------------------- checklist files

const tick = (value: string | null): string => (value ? '✓' : '·');

/** The checklist as Markdown: one table per category, in production order, with the corpus coverage of each topic. */
export const checklistMarkdown = (checklist: Checklist): string => {
	const out: string[] = [
		'# Eğitim videoları üretim kontrol listesi',
		'',
		'Bu dosya `npm run curriculum` ile `Checklist.json` dosyasından üretilir; elle düzenlemeyin.',
		'Her satır bir konu (LessonSub): bir YouTube eğitim videosu ve bir kısa özet videosu.',
		'',
		'Sütunlar: **H** hazırlandı (metin ve sahne planı) · **K** kaynaklar kullanıldı · **YT** YouTube videosu üretildi · **KV** kısa video üretildi · **Anlatım** konu anlatımı var mı · **Soru** konuya bağlı soru (cevaplı / ÖSYM).',
		'',
	];
	let category = '';
	let lesson = '';
	for (const entry of checklist.entries) {
		if (entry.category !== category) {
			category = entry.category;
			lesson = '';
			const inCategory = checklist.entries.filter((item) => item.category === category);
			const done = inCategory.filter((item) => item.status.youtube).length;
			out.push('', `## ${entry.exam} · ${entry.categoryName} (${done}/${inCategory.length} video)`);
		}
		if (entry.lesson !== lesson) {
			lesson = entry.lesson;
			out.push('', `### ${entry.lessonName} (${entry.lesson})`, '', '| Sıra | Konu | Alt başlık | H | K | YT | KV | Anlatım | Soru |', '| ---: | --- | ---: | :-: | :-: | :-: | :-: | :-: | ---: |');
		}
		const {status, sources} = entry;
		out.push(
			`| ${entry.order} | ${entry.topicName} \`${entry.topic}\` | ${entry.subtopics.length} | ${CHECKLIST_STAGES.map((stage) => tick(status[stage])).join(' | ')} | ${sources.explanation ? '✓' : '—'} | ${sources.questionCount} (${sources.answeredCount} / ${sources.pastExamCount}) |`,
		);
	}
	return `${out.join('\n')}\n`;
};

export const writeChecklist = async (curriculum: string, checklist: Checklist): Promise<void> => {
	const directory = path.join(curriculum, 'Production');
	await mkdir(directory, {recursive: true});
	await writeFile(path.join(directory, 'Checklist.json'), `${JSON.stringify(ChecklistSchema.parse(checklist), null, 2)}\n`);
	await writeFile(path.join(directory, 'Checklist.md'), checklistMarkdown(checklist));
};

export const readChecklist = async (curriculum: string): Promise<Checklist> =>
	ChecklistSchema.parse(JSON.parse(await readFile(path.join(curriculum, 'Production', 'Checklist.json'), 'utf8')));

export const fileExists = async (file: string): Promise<boolean> => stat(file).then(() => true, () => false);
