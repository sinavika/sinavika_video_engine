import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {pastExamFile, questionPattern, readPastExamQuestions, summarizePastExam, type PastExamQuestion} from '../src/Courses/PastExamQuestions';

const question = (overrides: Partial<PastExamQuestion>): PastExamQuestion => ({
	id: 'q',
	category: ['YKS_TYT'],
	exam: 'YKS',
	session: 'TYT',
	year: 2024,
	lessonMainCode: 'TRK',
	lessonSubCode: 'SOZCUKTE_ANLAM',
	lessonMikroCode: 'SOZCUKTE_ANLAM_12',
	lessonMikroName: 'Sözcüğün Bağlamdaki Anlamı',
	twinLessons: [],
	sourceHeading: 'Türkçe - Sözcükte Anlam',
	match: {method: 'claude', confidence: 0.9, needsReview: false},
	hasFigure: false,
	mebVideo: null,
	question: 'Bir paragraf. Bu parçada boş bırakılan yerlere aşağıdakilerden hangisi sırasıyla getirilmelidir?',
	...overrides,
});

describe('questionPattern', () => {
	it('keeps the asking sentence and makes numerals and quoted words generic', () => {
		expect(questionPattern('(I) Bir cümle. (II) Bir cümle daha.\nBu parçada numaralanmış cümlelerden hangisi II. cümledir?')).toBe('Bu parçada numaralanmış cümlelerden hangisi #. cümledir?');
		expect(questionPattern('Aşağıdaki cümlelerin hangisinde "tutmak" sözcüğü kullanılmıştır?')).toBe('Aşağıdaki cümlelerin hangisinde "…" sözcüğü kullanılmıştır?');
		expect(questionPattern(null)).toBe('');
	});
});

describe('summarizePastExam', () => {
	it('counts years, undated questions, subtopics and patterns', () => {
		const summary = summarizePastExam([
			question({id: 'a', year: 2018}),
			question({id: 'b', year: 2024}),
			question({id: 'c', year: null, lessonMikroName: 'Mecaz Anlam', match: {method: 'claude', confidence: 0.5, needsReview: true}, hasFigure: true}),
		]);
		expect(summary.total).toBe(3);
		expect(summary.byYear).toEqual([[2018, 1], [2024, 1]]);
		expect(summary.undated).toBe(1);
		expect(summary.byMikro[0]).toEqual(['Sözcüğün Bağlamdaki Anlamı', 2]);
		expect(summary.patterns[0][1]).toBe(3);
		expect(summary.needsReview).toBe(1);
		expect(summary.withFigure).toBe(1);
	});
});

describe('readPastExamQuestions', () => {
	it('reads one topic of one category and finds AYT twin lessons under the first lesson', async () => {
		const data = mkdtempSync(path.join(tmpdir(), 'cikmis-'));
		const folder = 'KPSS/OnlisansOrtaogretim';
		mkdirSync(path.dirname(pastExamFile(data, folder, 'TRK')), {recursive: true});
		const rows = [
			question({id: 'o', category: ['KPSS_ONLISANS'], lessonSubCode: 'PARAGRAF'}),
			question({id: 't', category: ['KPSS_ORTAOGRETIM'], lessonSubCode: 'PARAGRAF'}),
			question({id: 'x', category: ['KPSS_ORTAOGRETIM'], lessonSubCode: 'SOZCUKTE_ANLAM'}),
		];
		writeFileSync(pastExamFile(data, folder, 'TRK'), rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
		const found = await readPastExamQuestions(data, folder, 'KPSS_ORTAOGRETIM', 'TRK', 'PARAGRAF');
		expect(found.map((row) => row.id)).toEqual(['t']);
		expect(pastExamFile(data, 'YKS/AYT', 'TAR2')).toBe(pastExamFile(data, 'YKS/AYT', 'TAR1'));
		expect(await readPastExamQuestions(data, 'YKS/TYT', 'YKS_TYT', 'TRK', 'PARAGRAF')).toEqual([]);
	});
});
