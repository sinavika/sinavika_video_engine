import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {WORKS_WRITTEN_DIRECTORY, WrittenLessonSchema, writtenIssues, type WrittenLesson} from '../../src/Courses/WorksWritten';
import type {WorksView} from '../../src/Courses/WorksView';

const ROOT = path.resolve(__dirname, '..', '..', 'Curriculum', WORKS_WRITTEN_DIRECTORY);
const filesUnder = (directory: string): string[] =>
	readdirSync(directory, {withFileTypes: true}).flatMap((item) => (item.isDirectory() ? filesUnder(path.join(directory, item.name)) : item.name.endsWith('.json') ? [path.join(directory, item.name)] : []));

const topic = {id: 'T1', category: 'YKS_TYT', lesson: 'MAT', code: 'MAT_X'};
const note = 'Tam tabloyu ve bir çözümlü örnek ekle.';

const view = {
	topic,
	title: 'Konu',
	lessonName: 'Matematik',
	exams: ['YKS', 'TYT'],
	sourceScripts: ['Curriculum/Scripts/YKS_TYT/MAT/MAT_X.json'],
	lesson: {
		hook: {headline: 'Giriş', narration: 'Giriş.'},
		objectives: ['Hedef'],
		sections: [
			{subtopic: 'MAT_X_01', subtopics: [], title: 'Bir', narration: '', cards: [{}]},
			{subtopic: 'MAT_X_02', subtopics: ['MAT_X_03'], title: 'İki', narration: '', cards: [{}]},
		],
		summary: {points: [], warnings: []},
	},
	works: {additions: [note]},
} as WorksView;

const question = (answer: number, hint = 'Denklemi kur ve çöz.') => ({
	kind: 'question',
	question: {style: 'TYT tarzı', stem: 'Kaçtır?', options: ['12', '24', '36', '48', '60'], answer, steps: [{text: 'Önce çözümle.'}, {text: hint}]},
});
const statement = (answer: number) => ({kind: 'predict', title: 'İfade', context: 'Bir ifade.', prompt: 'Bu ifade doğru mu?', choices: ['Doğru', 'Yanlış'], answer, explanation: 'Açıklama.'});
const mistake = {kind: 'mistake', title: 'Tuzak', wrong: 'Yanlış bir yargı.', right: 'Doğrusu.', why: 'Nedeni.'};

const lesson = (overrides: {sections?: unknown[]; additions?: {note: string; done: string}[]} = {}): WrittenLesson =>
	WrittenLessonSchema.parse({
		topic,
		title: 'Konu',
		lessonName: 'Matematik',
		exams: ['YKS', 'TYT'],
		sourceScripts: ['Curriculum/Scripts/YKS_TYT/MAT/MAT_X.json'],
		written: {sources: ['EgitimVerileri/…'], additions: overrides.additions ?? [{note, done: 'Bir: tablo ve örnek.'}]},
		lesson: {
			hook: {headline: 'Giriş', narration: 'Giriş.'},
			objectives: ['Hedef'],
			sections: overrides.sections ?? [
				{subtopic: 'MAT_X_01', title: 'Bir', cards: [{kind: 'rule', title: 'Kural', items: ['$10A + B$']}, question(0), mistake]},
				{subtopic: 'MAT_X_02', subtopics: ['MAT_X_03'], title: 'İki', cards: [{kind: 'concept', title: 'Tanım', text: 'Tanım.'}, question(2), statement(0)]},
			],
			summary: {points: [], warnings: []},
		},
	});

describe('Works written lessons', () => {
	it('accepts a lesson that teaches every subtopic, answers every note and leaves the last step to the student', () => {
		expect(writtenIssues(lesson(), view)).toEqual([]);
	});

	it('refuses a lost subtopic, a hint that answers, spoken formulas and video words', () => {
		const issues = writtenIssues(
			lesson({
				sections: [
					{subtopic: 'MAT_X_01', title: 'Bir', cards: [{kind: 'rule', title: 'Kural', items: ['A B sayısı 10 A artı B.'], narration: 'Birazdan göreceğiz.'}, question(0, 'Sonuç 12 bulunur. Cevap **A**.'), mistake]},
					{subtopic: 'MAT_X_02', title: 'İki', cards: [{kind: 'concept', title: 'Tanım', text: 'Bin dokuz yüz yirmi üçte.'}, question(2), statement(0)]},
				],
			}),
			view,
		);
		expect(issues.some((issue) => issue.includes('MAT_X_03'))).toBe(true);
		expect(issues.some((issue) => issue.includes("names the answer's letter"))).toBe(true);
		expect(issues.some((issue) => issue.includes('last hint states the answer'))).toBe(true);
		expect(issues.some((issue) => issue.includes('"artı"'))).toBe(true);
		expect(issues.some((issue) => issue.includes('read aloud; write it in digits'))).toBe(true);
		expect(issues.some((issue) => issue.includes('belongs to the video'))).toBe(true);
	});

	it('refuses true/false steps that are always false, and Works notes left unanswered', () => {
		const issues = writtenIssues(
			lesson({
				sections: [
					{subtopic: 'MAT_X_01', title: 'Bir', cards: [{kind: 'rule', title: 'Kural', items: ['Kural.']}, question(0), mistake]},
					{subtopic: 'MAT_X_02', subtopics: ['MAT_X_03'], title: 'İki', cards: [{kind: 'concept', title: 'Tanım', text: 'Tanım.'}, question(2), mistake]},
				],
				additions: [],
			}),
			view,
		);
		expect(issues).toContain('All 2 true/false steps are false; write true statements as "Doğru"/"Yanlış" predictions.');
		expect(issues).toContain(`Works note not answered: "${note}".`);
	});

	it('refuses a long run of reading, an asking card before teaching, and a wrong choice note that answers', () => {
		const rule = {kind: 'rule', title: 'Kural', items: ['Kural.']};
		const issues = writtenIssues(
			lesson({
				sections: [
					{subtopic: 'MAT_X_01', title: 'Bir', cards: [{kind: 'classify', prompt: 'Ayır.', groups: [{label: 'Tek', items: ['3']}, {label: 'Çift', items: ['4']}]}, rule, rule, rule, rule, question(0), mistake]},
					{
						subtopic: 'MAT_X_02',
						subtopics: ['MAT_X_03'],
						title: 'İki',
						cards: [rule, {...question(2), question: {...question(2).question, choiceFeedback: ['Doğrusu 36 olmalıydı.', null, null, null, null]}}, statement(0)],
					},
				],
			}),
			view,
		);
		expect(issues.some((issue) => issue.includes('4 reading cards in a row'))).toBe(true);
		expect(issues.some((issue) => issue.includes('a classify card before anything is taught'))).toBe(true);
		expect(issues.some((issue) => issue.includes("wrong choice's note gives the answer away"))).toBe(true);
	});

	it('reads the interactive cards of the API: blank, split, tap, match, multi, flip, guided, findError', () => {
		expect(() =>
			lesson({
				sections: [
					{
						subtopic: 'MAT_X_01',
						title: 'Bir',
						cards: [
							{kind: 'rule', title: 'Kural', items: ['Kural.']},
							{kind: 'blank', before: 'Kitap', after: 'sayfadır.', answers: ['370'], input: 'number', wrongAnswers: [{answer: '371', feedback: 'Son sayfayı fazla saydın.'}]},
							{kind: 'split', word: 'gözlükleri', cuts: [3, 6, 9], parts: ['kök', 'yapım eki', 'çekim eki', 'çekim eki']},
							{kind: 'tap', prompt: 'Dokun.', mode: 'word', segments: ['Gözlükçü', 'dün', 'kitap', 'getirdi.'], answers: [1, 2]},
							{kind: 'match', pairs: [{left: '-lık', right: 'isimden isim'}, {left: '-la', right: 'isimden fiil'}]},
							{kind: 'multi', stem: 'Hangileri tektir?', options: ['883', '885', '886'], answers: [0, 1], choiceFeedback: [null, null, 'Birler 6: çift.']},
							{kind: 'flip', cards: [{front: 'AB', back: '10A + B'}, {front: 'ABC', back: '100A + 10B + C'}]},
							{kind: 'guided', stem: 'AB + BA = 132 ise?', steps: [{prompt: 'A + B?', before: 'A + B =', answers: ['12'], input: 'number'}, {prompt: 'A?', choices: ['5', '7'], answer: 1}]},
							{kind: 'findError', problem: 'Çöz.', steps: ['a', 'b', 'c'], wrongStep: 1, explanation: 'b yanlış.'},
							question(0),
							mistake,
						],
					},
					{subtopic: 'MAT_X_02', subtopics: ['MAT_X_03'], title: 'İki', cards: [{kind: 'concept', title: 'Tanım', text: 'Tanım.'}, question(2), statement(0)]},
				],
			}),
		).not.toThrow();
		expect(() => lesson({sections: [{subtopic: 'MAT_X_01', title: 'Bir', cards: [{kind: 'rule', title: 'K', items: ['K.']}, {kind: 'split', word: 'göz', cuts: [3]}]}]})).toThrow();
	});

	it('refuses fields the API does not read, such as video beats', () => {
		expect(() =>
			lesson({sections: [{subtopic: 'MAT_X_01', title: 'Bir', cards: [{kind: 'rule', title: 'Kural', items: ['Kural.'], beats: []}, question(0)]}]}),
		).toThrow();
	});

	it('every written lesson in Curriculum/WorksWritten has the shape Works imports', () => {
		for (const file of filesUnder(ROOT)) {
			const parsed = WrittenLessonSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
			expect(parsed.success, `${path.relative(ROOT, file)}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 3))}`).toBe(true);
		}
	});
});
