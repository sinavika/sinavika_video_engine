import {createReadStream, existsSync} from 'node:fs';
import {copyFile, mkdir, readdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createInterface} from 'node:readline';
import {
	CHECKLIST_STAGES,
	ChecklistSchema,
	inProductionOrder,
	type Category,
	type Checklist,
	type ChecklistEntry,
	type Lesson,
	type Topic,
} from './Curriculum';

/**
 * Brings the lesson list and the reference corpus into the project.
 *
 * The lesson list (CSV) becomes the catalogue and the production checklist.
 * The corpus is regrouped by what it is for:
 *
 *   ReferenceCorpus/TopicExplanations/<Exam>/<Category>/<Lesson>/<Topic>.json
 *       curriculum knowledge packs (units, claims), one or more per topic
 *   ReferenceCorpus/QuestionPools/<Exam>/<Category>/<Lesson>/<Topic>.jsonl
 *       past exam questions the corpus placed in that topic
 *   ReferenceCorpus/QuestionPools/<Exam>/<Category>/<Lesson>/_Lesson.jsonl
 *       questions of the lesson without a confident topic
 *   ...<Topic>.phenotypes.jsonl / _Lesson.phenotypes.jsonl
 *       the structure of those questions (archetype, difficulty, distractors)
 *   ReferenceCorpus/Taxonomy/   the corpus's own code tables and parse notes
 *   ReferenceCorpus/_Unmatched/ whatever the lesson list has no place for
 *
 * Every question keeps where it came from (`source.file`, `source.line`).
 * Running the import again rebuilds the corpus copy and the catalogue but
 * keeps the checklist's progress.
 */

/** Below this the corpus's own topic match is not trusted; the question stays in the lesson's pool. */
export const TOPIC_MATCH_CONFIDENCE = 0.5;

const UNMATCHED = '_Unmatched';
const LESSON_POOL = '_Lesson';

type ImportPaths = {lessonList: string; corpus: string; curriculum: string};

export type ImportReport = {
	categories: number;
	lessons: number;
	topics: number;
	subtopics: number;
	explanations: {matched: number; unmatched: number};
	questions: {topic: number; lesson: number; unmatched: number};
	phenotypes: {topic: number; lesson: number; unmatched: number};
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

// ---------------------------------------------------------------- corpus

const walk = async (directory: string): Promise<string[]> => {
	if (!existsSync(directory)) return [];
	const entries = await readdir(directory, {withFileTypes: true});
	const files = await Promise.all(entries.map((entry) => (entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)])));
	return files.flat();
};

const slash = (file: string): string => file.split(path.sep).join('/');

type Place = {exam: string; category: string; lesson: string; topic: string | null};

/** Finds where a corpus item belongs. Returns null when the lesson list has no such category or lesson. */
const placeFinder = (categories: readonly Category[]) => {
	const byCategory = new Map(categories.map((category) => [category.code, category]));
	return (categoryCode: unknown, lessonCode: unknown, topicCode: unknown, topicConfidence: number): Place | null => {
		const category = typeof categoryCode === 'string' ? byCategory.get(categoryCode) : undefined;
		const lesson = category?.lessons.find((entry) => entry.code === lessonCode);
		if (!category || !lesson) return null;
		const topic = lesson.topics.find((entry) => entry.code === topicCode);
		return {exam: category.exam, category: category.code, lesson: lesson.code, topic: topic && topicConfidence >= TOPIC_MATCH_CONFIDENCE ? topic.code : null};
	};
};

/** Appends lines to many files without keeping them all open: lines are buffered per file and flushed in batches. */
const createLineSink = () => {
	const buffers = new Map<string, string[]>();
	const written = new Set<string>();
	const counts = new Map<string, number>();
	const flush = async (file: string) => {
		const lines = buffers.get(file);
		if (!lines?.length) return;
		await mkdir(path.dirname(file), {recursive: true});
		await writeFile(file, `${lines.join('\n')}\n`, {flag: written.has(file) ? 'a' : 'w'});
		written.add(file);
		buffers.set(file, []);
	};
	return {
		add: async (file: string, line: string) => {
			const lines = buffers.get(file) ?? [];
			lines.push(line);
			buffers.set(file, lines);
			counts.set(file, (counts.get(file) ?? 0) + 1);
			if (lines.length >= 500) await flush(file);
		},
		close: async () => {
			for (const file of buffers.keys()) await flush(file);
		},
		counts,
	};
};

const readJsonLines = async function* (file: string): AsyncGenerator<{line: number; record: Record<string, unknown>}> {
	const lines = createInterface({input: createReadStream(file, {encoding: 'utf8'}), crlfDelay: Infinity});
	let line = 0;
	for await (const text of lines) {
		line += 1;
		if (!text.trim()) continue;
		yield {line, record: JSON.parse(text) as Record<string, unknown>};
	}
};

const confidence = (value: unknown): number => (typeof value === 'number' ? value : Number(value ?? 0) || 0);

const poolDirectory = (root: string, place: Place) => path.join(root, place.exam, place.category, place.lesson);

// ---------------------------------------------------------------- import

export const importCurriculum = async ({lessonList, corpus, curriculum}: ImportPaths): Promise<ImportReport> => {
	const categories = inProductionOrder(parseLessonList(await readFile(lessonList, 'utf8')));
	const place = placeFinder(categories);
	const corpusOut = path.join(curriculum, 'ReferenceCorpus');
	const explanationsOut = path.join(corpusOut, 'TopicExplanations');
	const questionsOut = path.join(corpusOut, 'QuestionPools');
	const report: ImportReport = {
		categories: categories.length,
		lessons: categories.reduce((sum, category) => sum + category.lessons.length, 0),
		topics: categories.reduce((sum, category) => sum + category.lessons.reduce((total, lesson) => total + lesson.topics.length, 0), 0),
		subtopics: 0,
		explanations: {matched: 0, unmatched: 0},
		questions: {topic: 0, lesson: 0, unmatched: 0},
		phenotypes: {topic: 0, lesson: 0, unmatched: 0},
	};
	report.subtopics = categories.reduce((sum, category) => sum + category.lessons.reduce((total, lesson) => total + lesson.topics.reduce((count, topic) => count + topic.subtopics.length, 0), 0), 0);

	// The lesson list itself, untouched, and the catalogue built from it.
	await mkdir(path.join(curriculum, 'Sources'), {recursive: true});
	await copyFile(lessonList, path.join(curriculum, 'Sources', 'LessonList.csv'));
	await mkdir(path.join(curriculum, 'Catalog'), {recursive: true});
	for (const category of categories) {
		await writeFile(path.join(curriculum, 'Catalog', `${category.code}.json`), `${JSON.stringify(category, null, 2)}\n`);
	}

	// Topic explanations: knowledge packs, bound to a topic by the codes inside them.
	const explanationsByTopic = new Map<string, string[]>();
	for (const file of (await walk(path.join(corpus, 'GroundTruth'))).filter((entry) => entry.endsWith('.json'))) {
		const relative = slash(path.relative(path.join(corpus, 'GroundTruth'), file));
		const pack = JSON.parse(await readFile(file, 'utf8')) as {binding?: {categorySubCode?: string; lessonMainCode?: string; lessonSubCode?: string}};
		const binding = pack.binding;
		const where = binding ? place(binding.categorySubCode, binding.lessonMainCode, binding.lessonSubCode, 1) : null;
		if (!where?.topic) {
			// Parse notes and code tables are documentation, not packs.
			const target = binding ? path.join(corpusOut, UNMATCHED, 'TopicExplanations', relative) : path.join(corpusOut, 'Taxonomy', 'GroundTruth', relative);
			await mkdir(path.dirname(target), {recursive: true});
			await copyFile(file, target);
			if (binding) report.explanations.unmatched += 1;
			continue;
		}
		const key = `${where.category}|${where.lesson}|${where.topic}`;
		const existing = explanationsByTopic.get(key) ?? [];
		const name = existing.length === 0 ? `${where.topic}.json` : `${where.topic}__${path.basename(file, '.json')}.json`;
		const target = path.join(poolDirectory(explanationsOut, where), name);
		await mkdir(path.dirname(target), {recursive: true});
		await copyFile(file, target);
		explanationsByTopic.set(key, [...existing, slash(path.relative(corpusOut, target))]);
		report.explanations.matched += 1;
	}

	// Question pools and their phenotypes, split by topic.
	const sink = createLineSink();
	const sorted = async (root: string, kind: 'questions' | 'phenotypes', suffix: string) => {
		for (const file of (await walk(root)).filter((entry) => entry.endsWith('.jsonl'))) {
			const relative = slash(path.relative(corpus, file));
			for await (const {line, record} of readJsonLines(file)) {
				const where = place(record.categorySubCode, record.lessonMainCode, record.lessonSubCode, confidence(record.lessonSubMatchConfidence));
				const enriched = JSON.stringify({...record, source: {file: relative, line}});
				if (!where) {
					await sink.add(path.join(corpusOut, UNMATCHED, kind === 'questions' ? 'QuestionPools' : 'Phenotypes', relative), enriched);
					report[kind].unmatched += 1;
				} else {
					await sink.add(path.join(poolDirectory(questionsOut, where), `${where.topic ?? LESSON_POOL}${suffix}`), enriched);
					report[kind][where.topic ? 'topic' : 'lesson'] += 1;
				}
			}
		}
	};
	await sorted(path.join(corpus, 'Raw'), 'questions', '.jsonl');
	await sorted(path.join(corpus, 'Phenotypes'), 'phenotypes', '.phenotypes.jsonl');
	await sink.close();

	// Corpus documentation: its readme, parse notes and code tables.
	for (const file of await walk(corpus)) {
		const relative = slash(path.relative(corpus, file));
		if (/\.(md|csv)$/i.test(file) || /(^|\/)(PARSE_SUMMARY|ABD_PARSE_SUMMARY)\.json$/.test(relative) || relative.startsWith('Taxonomy/')) {
			const target = path.join(corpusOut, 'Taxonomy', relative.startsWith('Taxonomy/') ? relative.slice('Taxonomy/'.length) : relative);
			await mkdir(path.dirname(target), {recursive: true});
			await copyFile(file, target);
		}
	}

	// The checklist: new topics are added, progress on existing ones is kept.
	const checklistFile = path.join(curriculum, 'Production', 'Checklist.json');
	const previous: Checklist | null = existsSync(checklistFile) ? ChecklistSchema.parse(JSON.parse(await readFile(checklistFile, 'utf8'))) : null;
	const previousById = new Map(previous?.entries.map((entry) => [entry.id, entry]) ?? []);
	const relativePool = (where: Place, name: string): string | null => {
		const file = path.join(poolDirectory(questionsOut, where), name);
		return sink.counts.has(file) ? slash(path.relative(corpusOut, file)) : null;
	};
	const countOf = (relative: string | null) => (relative ? (sink.counts.get(path.join(corpusOut, relative)) ?? 0) : 0);

	const entries: ChecklistEntry[] = [];
	for (const category of categories) {
		for (const lesson of category.lessons) {
			for (const topic of lesson.topics) {
				const where: Place = {exam: category.exam, category: category.code, lesson: lesson.code, topic: topic.code};
				const questions = relativePool(where, `${topic.code}.jsonl`);
				const lessonQuestions = relativePool(where, `${LESSON_POOL}.jsonl`);
				const phenotypes = relativePool(where, `${topic.code}.phenotypes.jsonl`);
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
						explanations: explanationsByTopic.get(`${category.code}|${lesson.code}|${topic.code}`) ?? [],
						questions,
						questionCount: countOf(questions),
						lessonQuestions,
						lessonQuestionCount: countOf(lessonQuestions),
						phenotypes,
						phenotypeCount: countOf(phenotypes),
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
		'Sütunlar: **H** hazırlandı (metin ve sahne planı) · **K** kaynaklar kullanıldı · **YT** YouTube videosu üretildi · **KV** kısa video üretildi · **Anlatım** konu anlatımı paketi · **Soru** konuya bağlı soru sayısı.',
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
			`| ${entry.order} | ${entry.topicName} \`${entry.topic}\` | ${entry.subtopics.length} | ${CHECKLIST_STAGES.map((stage) => tick(status[stage])).join(' | ')} | ${sources.explanations.length > 0 ? '✓' : '—'} | ${sources.questionCount} |`,
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
