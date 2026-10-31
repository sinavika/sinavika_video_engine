import {describe, expect, it} from 'vitest';
import {spokenScreenText} from '../../../../src/Courses/LessonSpeech';
import {evaluate, isFormula, parseFormula, truthRows, truthVerdict} from '../../../../src/Components/Visuals/Logic/Propositional';
import {solveTruthTable} from '../../../../src/Components/Visuals/Logic/TruthTable';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const column = (formula: string) => solveTruthTable({variables: ['p', 'q'], columns: [{formula}], check: 'none'}).values.map((row) => (row[0] ? 'D' : 'Y')).join('');

describe('propositional logic', () => {
	it('gives each connective its textbook table (rows DD, DY, YD, YY)', () => {
		expect(column('~p')).toBe('YYDD');
		expect(column('p ∧ q')).toBe('DYYY');
		expect(column('p ∨ q')).toBe('DDDY');
		expect(column('p ⇒ q')).toBe('DYDD');
		expect(column('p ⇔ q')).toBe('DYYD');
	});

	it('binds ~ tightest, then ∧, ∨, ⇒ (to the right) and ⇔', () => {
		const values = (text: string) => truthRows(['p', 'q', 'r']).map((row) => evaluate(parseFormula(text), row));
		expect(values('~p ∧ q')).toEqual(values('(~p) ∧ q'));
		expect(values('p ∨ q ∧ r')).toEqual(values('p ∨ (q ∧ r)'));
		expect(values('p ⇒ q ⇒ r')).toEqual(values('p ⇒ (q ⇒ r)'));
		expect(values('p ∧ q ⇒ r')).toEqual(values('[p ∧ q] ⇒ r'));
		expect(values('~~p')).toEqual(values('p'));
	});

	it('lists rows in textbook order, the first letter changing slowest', () => {
		expect(truthRows(['p', 'q']).map((row) => `${row.p ? 'D' : 'Y'}${row.q ? 'D' : 'Y'}`)).toEqual(['DD', 'DY', 'YD', 'YY']);
		expect(truthRows(['p', 'q', 'r'])).toHaveLength(8);
	});

	it('refuses what is not a formula', () => {
		expect(isFormula('p ∧')).toBe(false);
		expect(isFormula('(p ∨ q')).toBe(false);
		expect(isFormula('p q')).toBe(false);
		expect(isFormula('x ∧ p')).toBe(false);
		expect(isFormula('[(p ∧ ~p) ∨ q]')).toBe(true);
	});

	it('decides consistency, validity, joint consistency and equivalence from the values', () => {
		const solve = (formulas: string[], check: 'consistency' | 'validity' | 'joint' | 'equivalence') => solveTruthTable({variables: ['p', 'q'], columns: formulas.map((formula) => ({formula})), check});
		expect(solve(['p ∨ ~p'], 'consistency').verdict).toMatch(/^Totoloji/);
		expect(solve(['p ∧ ~p'], 'consistency').verdict).toMatch(/^Tutarsız/);
		expect(solve(['(~p ⇒ q) ∧ ~q'], 'consistency').marked).toEqual([1]);
		expect(solve(['p ⇒ q'], 'validity').marked).toEqual([1]);
		// ÖSYM 2019: "Ali evde veya iş yerinde", "evde değil", "iş yerinde değil" have no common row.
		expect(solve(['p ∨ q', '~p', '~q'], 'joint').verdict).toMatch(/^Birlikte tutarsız/);
		expect(solve(['p ∨ q', 'p', '~q'], 'joint').marked).toEqual([1]);
		expect(solve(['p ⇒ q', '~p ∨ q'], 'equivalence').verdict).toMatch(/^Eşdeğer:/);
		expect(solve(['p ⇒ q', 'q ⇒ p'], 'equivalence').marked).toEqual([1, 2]);
		expect(truthVerdict([[true], [false]], 'none').verdict).toBe('');
	});
});

describe('truth table visual', () => {
	const table = {kind: 'truthTable', variables: ['p', 'q'], columns: [{formula: '~p'}, {formula: '~p ∨ q'}], check: 'consistency'};

	it('names letters, columns, rows, marks and verdict as parts', () => {
		expect(numberedPartNames(CourseVisualSchema.parse(table))).toEqual(['v', 'c1', 'c2', 'r1', 'r2', 'r3', 'r4', 'isaret', 'sonuc']);
	});

	it('wants every letter declared and comparisons over two columns', () => {
		expect(CourseVisualSchema.safeParse({...table, columns: [{formula: 'p ∧ r'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...table, columns: [{formula: 'p ∧ q'}], check: 'equivalence'}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...table, columns: [{formula: 'p ∧∧ q'}]}).success).toBe(false);
	});
});

describe('logic speech', () => {
	it('reads connectives as words and brackets as pauses, so groupings sound different', () => {
		expect(spokenScreenText('(p ∧ q) ⇒ r')).toBe('p ve q, ise r');
		expect(spokenScreenText('p ∧ (q ⇒ r)')).toBe('p ve, q ise r');
		expect(spokenScreenText('~p ∨ q')).toBe('p değil veya q');
		expect(spokenScreenText('p ⇔ ~q')).toBe('p ancak ve ancak q değil');
		expect(spokenScreenText('~(p ∨ q)')).toBe('değil, p veya q');
	});

	it('leaves text without logic alone', () => {
		expect(spokenScreenText('Hava (bugün) güzel.')).toBe('Hava (bugün) güzel.');
	});
});
