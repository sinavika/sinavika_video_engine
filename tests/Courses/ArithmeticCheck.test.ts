import {describe, expect, it} from 'vitest';
import {CourseVisualSchema} from '../../src/Components/Visuals/VisualSchema';
import {arithmeticExpression, cardArithmeticIssues, equationIssues, falseEqualities} from '../../src/Courses/ArithmeticCheck';
import type {LessonCard} from '../../src/Courses/LessonScript';

const concept = (text: string) => ({kind: 'concept', title: 'Deneme', text, narration: 'Deneme.', beats: []}) as unknown as LessonCard;

describe('arithmetic a script writes', () => {
	it('reads formulas and Turkish numbers as arithmetic', () => {
		expect(arithmeticExpression('\\frac{2500}{400}')).toBe('((2500)/(400))');
		expect(arithmeticExpression('6{,}25')).toBe('6.25');
		expect(arithmeticExpression('2\\frac{1}{3}')).toBe('(2+(1)/(3))');
		expect(arithmeticExpression('900\\,000 \\div 100\\,000')).toBe('900000 / 100000');
		expect(arithmeticExpression('2³ · 3²')).toBe('2^3 * 3^2');
		// Letters, subscripts and other relations are not arithmetic of numbers.
		expect(arithmeticExpression('3x + 2')).toBeUndefined();
		expect(arithmeticExpression('a_n')).toBeUndefined();
		expect(arithmeticExpression('3x + 2', ['x'])).toBe('3x + 2');
	});

	it('finds equalities that do not hold, and only those', () => {
		expect(falseEqualities('5 \\cdot 4 \\cdot 3 = 60')).toEqual([]);
		expect(falseEqualities('\\frac{2500}{400} = 6{,}25')).toEqual([]);
		expect(falseEqualities('\\frac{11}{4} = 2\\frac{3}{4}')).toEqual([]);
		expect(falseEqualities('\\sqrt{18} = 3\\sqrt{2}')).toEqual([]);
		expect(falseEqualities('\\frac{1}{3} = 0{,}33')).toEqual([]);
		expect(falseEqualities('2 + 2 = 5').map((wrong) => [wrong.left, wrong.right])).toEqual([[4, 5]]);
		// Each statement on its own: "a = 2, b = 3" and "⇒" chains are not one long equality.
		expect(falseEqualities('x = 2, 4 + 1 = 5 \\Rightarrow 5 = 5')).toEqual([]);
	});

	it('leaves out what is false on purpose: a wrong belief, options, a denied claim, a quoted statement', () => {
		expect(cardArithmeticIssues({kind: 'mistake', title: 'Üs', wrong: '$3^4 = 12$', right: '$3^4 = 81$', narration: 'Hata.'} as LessonCard)).toEqual([]);
		expect(cardArithmeticIssues(concept('$-1 = 0$ çelişkidir.'))).toEqual([]);
		expect(cardArithmeticIssues(concept('"$2^3 = 6$" önermesi yanlıştır.'))).toEqual([]);
		expect(cardArithmeticIssues(concept('$20 \\div 3 = 6$ (kalan 2)'))).toEqual([]);
		expect(cardArithmeticIssues(concept('$5 + 5 = 11$ olur.'))).toEqual(['"5 + 5 = 11" does not hold (10 ≠ 11).']);
	});

	it('reads plain arithmetic in tables and notes, but not algebra or lists', () => {
		const table = {kind: 'visual', title: 'Tablo', narration: 'Tablo.', beats: [], visual: {kind: 'table', header: ['İşlem', 'Sonuç'], rows: [['2 · 4 = 9', 'x² − 8x − 12 = 0']]}} as unknown as LessonCard;
		expect(cardArithmeticIssues(table)).toEqual(['"2 · 4 = 9" does not hold (8 ≠ 9).']);
		expect(cardArithmeticIssues(concept('Notlar: −5 = −5/1 · 0,25 = 1/4'))).toEqual([]);
		expect(cardArithmeticIssues(concept('101² − 99² = 2 · 200 = 400'))).toEqual([]);
		expect(cardArithmeticIssues(concept('2x + 3 = 5 ise x = 1.'))).toEqual([]);
		expect(cardArithmeticIssues(concept('1 tam 3/4 = 7/4 eder.'))).toEqual([]);
		expect(cardArithmeticIssues(concept('pH = 2 − log 5 = 2 − 0,7 = 1,3'))).toEqual([]);
	});

	it('puts a worked equation\'s answer back into every step', () => {
		const right = CourseVisualSchema.parse({kind: 'equation', steps: [{left: '(90 - 60) \\cdot t', right: '90'}, {left: '30t', right: '90'}, {left: 't', right: '3', operation: '÷ 30'}]});
		const slip = CourseVisualSchema.parse({kind: 'equation', steps: [{left: '2x + 3', right: '11'}, {left: '2x', right: '8'}, {left: 'x', right: '5'}]});
		if (right.kind !== 'equation' || slip.kind !== 'equation') throw new Error('not an equation');
		expect(equationIssues(right)).toEqual([]);
		expect(equationIssues(slip)).toEqual(['equation step 1 (2x + 3 = 11) does not hold for x = 5 (13 ≠ 11).', 'equation step 2 (2x = 8) does not hold for x = 5 (10 ≠ 8).']);
	});
});
