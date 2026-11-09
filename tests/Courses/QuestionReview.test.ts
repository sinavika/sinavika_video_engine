import {describe, expect, it} from 'vitest';
import {LessonScriptSchema, type LessonScript} from '../../src/Courses/LessonScript';
import {LESSON_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {figureWordIssues, MIN_QUESTION_SCALE, optionOrderIssues, optionValue, questionFitScale} from '../../src/Courses/QuestionReview';

const withQuestion = (question: Record<string, unknown>): LessonScript => {
	const sample = structuredClone(LESSON_SCRIPT_SAMPLE) as Record<string, any>;
	const base = sample.lesson.sections[2].cards.find((card: {kind: string}) => card.kind === 'question') ?? sample.lesson.sections.flatMap((section: {cards: unknown[]}) => section.cards).find((card: any) => card.kind === 'question');
	sample.lesson.sections[0].cards = [{kind: 'question', question: {...base.question, ...question}}];
	return LessonScriptSchema.parse(sample);
};

describe('numeric options stand in increasing order', () => {
	it('reads numbers, fractions and roots as values', () => {
		expect(optionValue('2,5')).toBe(2.5);
		expect(optionValue('$\\frac{3}{4}$')).toBe(0.75);
		expect(optionValue('$-3$')).toBe(-3);
		expect(optionValue('$\\sqrt{34}$')).toBeCloseTo(5.831, 3);
		expect(optionValue('Ankara')).toBeUndefined();
		expect(optionValue('$x + 1$')).toBeUndefined();
	});

	it('flags numbers out of order, not words', () => {
		expect(optionOrderIssues(withQuestion({options: ['1', '2', '3', '4', '5'], answer: 1}))).toEqual([]);
		expect(optionOrderIssues(withQuestion({options: ['$\\sqrt{26}$', '$\\sqrt{30}$', '$6$', '$\\sqrt{34}$', '$7$'], answer: 1}))).toHaveLength(1);
		expect(optionOrderIssues(withQuestion({options: ['Ankara', 'Bursa', 'Adana', 'İzmir', 'Konya'], answer: 1}))).toEqual([]);
	});
});

describe('a question points at its figure by name, never by place', () => {
	const figure = {kind: 'table', header: ['a', 'b'], rows: [['1', '2']]};

	it('flags "aşağıdaki tablo" in a question with a figure', () => {
		expect(figureWordIssues(withQuestion({figure, stem: 'Aşağıdaki tabloya göre a kaçtır?', options: ['1', '2'], answer: 0, steps: [{text: 'Bir.', narration: 'Bir.'}]}))).toHaveLength(1);
	});

	it('leaves "aşağıdakilerden hangisi" and a question without a figure alone', () => {
		expect(figureWordIssues(withQuestion({figure, stem: 'Tabloya göre aşağıdakilerden hangisi doğrudur?', options: ['1', '2'], answer: 0, steps: [{text: 'Bir.', narration: 'Bir.'}]}))).toEqual([]);
		expect(figureWordIssues(withQuestion({stem: 'Aşağıdaki tabloya göre hangisi doğrudur?'}))).toEqual([]);
	});
});

describe('a long question still fits its column in a readable size', () => {
	it('fits a short question at full size and shrinks a long one', () => {
		const short = withQuestion({stem: 'Kaç saatte yakalar?', options: ['1', '2', '3', '4', '5'], answer: 2});
		const card = short.lesson.sections[0].cards[0];
		if (card.kind !== 'question') throw new Error('not a question');
		expect(questionFitScale(card.question)).toBe(1);
		const longStem = Array.from({length: 9}, () => 'Bir sınıftaki öğrencilerin kardeş sayıları tabloda verilmiştir ve her öğrenci bir kez sayılmıştır.').join(' ');
		const long = withQuestion({context: longStem.slice(0, 880), stem: longStem.slice(0, 400), options: ['Uzun bir şık metni burada yer alıyor ve iki satıra taşıyor olabilir', 'İkinci uzun şık metni de burada yer alıyor ve taşıyor', 'Üçüncü şık', 'Dördüncü şık', 'Beşinci şık'], answer: 2});
		const longCard = long.lesson.sections[0].cards[0];
		if (longCard.kind !== 'question') throw new Error('not a question');
		expect(questionFitScale(longCard.question)).toBeLessThan(MIN_QUESTION_SCALE);
	});
});
