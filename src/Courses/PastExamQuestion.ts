import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {TWIN_LESSONS} from './Curriculum';

const PAST_EXAM_DIRECTORY = 'CikmisSorular';

export type PastExamQuestion = {
	id: string;
	/** The lesson-list category (KPSS Önlisans and Ortaöğretim share one folder). */
	category: string[];
	exam: string;
	session: string;
	year: number | null;
	lessonMainCode: string | null;
	lessonSubCode: string | null;
	lessonMikroCode: string | null;
	lessonMikroName: string | null;
	twinLessons: string[];
	sourceHeading: string | null;
	match: {method: string | null; confidence: number | null; needsReview: boolean};
	hasFigure: boolean;
	mebVideo: string | null;
	question: string | null;
};

export const pastExamFile = (data: string, folder: string, lesson: string): string =>
	path.join(data, folder, PAST_EXAM_DIRECTORY, `${TWIN_LESSONS[lesson] ?? lesson}.jsonl`);

/** The past questions of one topic of one category; empty when the list has not been written yet. */
export const readPastExamQuestions = async (data: string, folder: string, category: string, lesson: string, topic: string): Promise<PastExamQuestion[]> => {
	const file = pastExamFile(data, folder, lesson);
	if (!existsSync(file)) return [];
	return (await readFile(file, 'utf8'))
		.split('\n')
		.filter((line) => line.trim())
		.map((line) => JSON.parse(line) as PastExamQuestion)
		.filter((question) => question.lessonSubCode === topic && (question.category ?? []).includes(category));
};

/**
 * The asking sentence of a question with its specifics made generic (roman numerals, quoted words),
 * so questions of the same kind group together: "Bu parçada numaralanmış sözlerden hangisinin …".
 */
export const questionPattern = (text: string | null): string => {
	// Numerals first, so "II. cümle" is not read as the end of a sentence. A lone I or V only counts as a numeral
	// next to a dot or a bracket (English YDT stems use "I" as a word).
	const flat = (text ?? '')
		.replace(/\s+/g, ' ')
		.replace(/\b(?:II|III|IV|VI|VII)\b|\(\s*(?:I|V)\s*\)|\b(?:I|V)(?=[.)])/g, '#')
		.trim();
	const sentences = flat.split(/(?<!#\.)(?<=[.?!])\s+/);
	const asking = [...sentences].reverse().find((sentence) => sentence.includes('?')) ?? sentences[sentences.length - 1] ?? '';
	return asking
		.replace(/["“][^"”]*["”]|‘[^’]*’|'[^']*'/g, '"…"')
		.replace(/\s+/g, ' ')
		.trim();
};

type PastExamSummary = {
	total: number;
	undated: number;
	byYear: [number, number][];
	byMikro: [string, number][];
	patterns: [string, number][];
	needsReview: number;
	withFigure: number;
};

export const summarizePastExam = (questions: readonly PastExamQuestion[], maxPatterns = 8): PastExamSummary => {
	const count = <T>(items: T[]): Map<T, number> => items.reduce((map, item) => map.set(item, (map.get(item) ?? 0) + 1), new Map<T, number>());
	const byYear = [...count(questions.flatMap((q) => (q.year ? [q.year] : [])))].sort((a, b) => a[0] - b[0]);
	const byMikro = [...count(questions.map((q) => q.lessonMikroName ?? '(alt başlık yok)'))].sort((a, b) => b[1] - a[1]);
	const patterns = [...count(questions.map((q) => questionPattern(q.question)).filter(Boolean))].sort((a, b) => b[1] - a[1]).slice(0, maxPatterns);
	return {
		total: questions.length,
		undated: questions.filter((q) => !q.year).length,
		byYear,
		byMikro,
		patterns,
		needsReview: questions.filter((q) => q.match.needsReview).length,
		withFigure: questions.filter((q) => q.hasFigure).length,
	};
};
