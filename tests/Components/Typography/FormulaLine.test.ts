import {describe, expect, it} from 'vitest';
import katex from 'katex';
import {formulaLines, latexWidth} from '../../../src/Components/Typography/FormulaLine';

const lines = (latex: string) => /^\\begin\{gathered\}(.*)\\end\{gathered\}$/.exec(latex)?.[1].split(' \\\\ ') ?? [latex];

describe('a long formula in an app still', () => {
	it('keeps a short formula on its line', () => {
		expect(formulaLines('ax + ay + bx + by = (a + b)(x + y)', 40)).toBe('ax + ay + bx + by = (a + b)(x + y)');
		expect(formulaLines('x^2 - 5x + 6 = 0', 24)).toBe('x^2 - 5x + 6 = 0');
	});

	it('breaks before its relations, each line no wider than asked', () => {
		const result = lines(formulaLines('x = 7k + 4 \\Rightarrow 3x = 21k + 12 = 7(3k + 1) + 5', 24));
		expect(result.length).toBeGreaterThan(1);
		expect(result[0]).toBe('x = 7k + 4');
		expect(result.slice(1).every((line) => /^(?:=|\\Rightarrow)/.test(line))).toBe(true);
		for (const line of result) expect(latexWidth(line)).toBeLessThanOrEqual(24);
		expect(lines(formulaLines('\\sqrt{8} + \\sqrt{18} - \\sqrt{50} = 2\\sqrt{2} + 3\\sqrt{2} - 5\\sqrt{2} = 0', 24))).toEqual(['\\sqrt{8} + \\sqrt{18} - \\sqrt{50}', '= 2\\sqrt{2} + 3\\sqrt{2} - 5\\sqrt{2} = 0']);
	});

	it('puts statements joined by ", \\quad" on lines of their own', () => {
		expect(lines(formulaLines('(-2)^4 = 16, \\quad -2^4 = -16, \\quad (-2)^3 = -8', 24))).toEqual(['(-2)^4 = 16,', '-2^4 = -16,', '(-2)^3 = -8']);
	});

	it('never breaks inside braces, a set or a \\left … \\right pair', () => {
		const set = lines(formulaLines('A = \\{x \\mid x = 2k,\\ k \\in \\{1, 2, 3\\}\\} = \\{2, 4, 6\\}', 20));
		expect(set).toEqual(['A = \\{x \\mid x = 2k,\\ k \\in \\{1, 2, 3\\}\\}', '= \\{2, 4, 6\\}']);
		const fraction = lines(formulaLines('\\frac{a = b}{c} + \\left( x = 1 \\right) + 1 + 2 + 3 + 4 + 5 + 6 = 9', 20));
		expect(fraction[0]).toContain('\\frac{a = b}{c}');
		expect(fraction[0]).toContain('\\left( x = 1 \\right)');
		// \leq, \rightarrow and \le are read whole: \rightarrow is not a \right.
		expect(lines(formulaLines('a + b + c + d + e + f \\leq g + h + i + j + k \\rightarrow 1', 14))[1]).toMatch(/^\\leq/);
	});

	it('leaves a long formula with nowhere to break as it is', () => {
		expect(formulaLines('(x + 1)(x + 2)(x + 3)(x + 4)(x + 5)(x + 6)', 20)).toBe('(x + 1)(x + 2)(x + 3)(x + 4)(x + 5)(x + 6)');
	});

	it('gives KaTeX something it can draw', () => {
		for (const latex of ['x = 7k + 4 \\Rightarrow 3x = 21k + 12 = 7(3k + 1) + 5', 'a \\ast b = 2a - b + ab \\;\\Rightarrow\\; 1 \\ast 2 = 2 - 2 + 2 = 2', '\\frac{1}{200\\,000}: \\; 1 \\text{ cm} \\to 200\\,000 \\text{ cm} = 2 \\text{ km}']) {
			expect(() => katex.renderToString(formulaLines(latex, 24), {displayMode: true, throwOnError: true})).not.toThrow();
		}
	});
});
