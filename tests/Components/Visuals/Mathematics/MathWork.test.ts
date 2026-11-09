import {describe, expect, it} from 'vitest';
import {areaCellLabel, eventCount, intervalSamples, longDivisionRounds, lowestTerms, mappingProperties, primeLadder, primePowers, signBreak, signTableRows, solutionCells, solutionText, written} from '../../../../src/Components/Visuals/Mathematics/MathWork';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

describe('sign table: every sign worked out from the factors', () => {
	it('gives each factor its sign in each interval and a zero at its own root', () => {
		const {factors, result} = signTableRows([{expression: 'x+1'}, {expression: 'x-2'}, {expression: 'x-4', denominator: true}], [-1, 2, 4]);
		// Cells: (−∞,−1) −1 (−1,2) 2 (2,4) 4 (4,∞)
		expect(factors[0]).toEqual(['−', '0', '+', '+', '+', '+', '+']);
		expect(factors[1]).toEqual(['−', '−', '−', '0', '+', '+', '+']);
		expect(factors[2]).toEqual(['−', '−', '−', '−', '−', '0', '+']);
		// The denominator's root makes the result undefined there, never zero.
		expect(result).toEqual(['−', '0', '+', '0', '−', 'undefined', '+']);
	});

	it('writes the solution set with open and closed ends from the result row', () => {
		const {result} = signTableRows([{expression: 'x+1'}, {expression: 'x-2'}, {expression: 'x-4', denominator: true}], [-1, 2, 4]);
		expect(solutionText([-1, 2, 4], solutionCells(result, '>='))).toBe('[−1, 2] ∪ (4, ∞)');
		expect(solutionText([-1, 2, 4], solutionCells(result, '>'))).toBe('(−1, 2) ∪ (4, ∞)');
		expect(solutionText([-1, 2, 4], solutionCells(result, '<'))).toBe('(−∞, −1) ∪ (2, 4)');
		expect(solutionText([-1, 2, 4], solutionCells(result, '<='))).toBe('(−∞, −1] ∪ [2, 4)');
	});

	it('keeps an even power from changing sign and writes a lone point as a set', () => {
		const {result} = signTableRows([{expression: '(x-3)^2'}], [3]);
		expect(result).toEqual(['+', '0', '+']);
		expect(solutionText([3], solutionCells(result, '<='))).toBe('{3}');
		expect(solutionText([3], solutionCells(result, '<'))).toBe('∅');
	});

	it('finds a sign change the critical points leave out, and none when they are complete', () => {
		expect(signBreak('x-2', -Infinity, 5)).toBeCloseTo(2, 1);
		expect(signBreak('x-2', 2, Infinity)).toBeUndefined();
		expect(signBreak('x-2', -Infinity, 2)).toBeUndefined();
		expect(signBreak('x^2-9', -3, 3)).toBeUndefined();
	});

	it('samples a point strictly inside every interval', () => {
		const points = [-1, 2, 4];
		const samples = intervalSamples(points);
		expect(samples).toHaveLength(4);
		expect(samples[0]).toBeLessThan(-1);
		expect(samples[1]).toBeGreaterThan(-1);
		expect(samples[1]).toBeLessThan(2);
		expect(samples[3]).toBeGreaterThan(4);
	});
});

describe('long division: the classroom rounds', () => {
	it('writes 1749 ÷ 6 as 17, 54, 09 with quotient 291 remainder 3', () => {
		const {rounds, quotient, remainder} = longDivisionRounds(1749, 6);
		expect(rounds.map((round) => [round.part, round.digit, round.product, round.rest, round.column])).toEqual([
			[17, 2, 12, 5, 1],
			[54, 9, 54, 0, 2],
			[9, 1, 6, 3, 3],
		]);
		expect([quotient, remainder]).toEqual([291, 3]);
	});

	it('writes a 0 in the quotient when a brought-down part is too small', () => {
		const {rounds} = longDivisionRounds(1030, 5);
		expect(rounds.map((round) => round.digit).join('')).toBe('206');
	});

	it('holds bölünen = bölen · bölüm + kalan, digit by digit, for many divisions', () => {
		for (let dividend = 1; dividend < 4000; dividend += 37) {
			for (const divisor of [2, 3, 7, 12, 25, 99]) {
				const {rounds, quotient, remainder} = longDivisionRounds(dividend, divisor);
				expect(divisor * quotient + remainder).toBe(dividend);
				expect(Number(rounds.map((round) => round.digit).join(''))).toBe(quotient);
				rounds.forEach((round) => {
					expect(round.product).toBe(round.digit * divisor);
					expect(round.rest).toBeGreaterThanOrEqual(0);
					expect(round.rest).toBeLessThan(divisor);
				});
				expect(rounds.at(-1)?.rest).toBe(remainder);
			}
		}
	});
});

describe('prime ladder: EBOB and EKOK from the rows', () => {
	it('circles the primes that divide every number of their row', () => {
		const {rows, ebob, ekok} = primeLadder([24, 36]);
		expect(rows.map((row) => [row.prime, row.all])).toEqual([
			[2, true],
			[2, true],
			[2, false],
			[3, true],
			[3, false],
		]);
		expect([ebob, ekok]).toEqual([12, 72]);
	});

	it('agrees with the greatest common divisor and the least common multiple', () => {
		for (let a = 2; a < 200; a += 7) {
			for (let b = 3; b < 200; b += 11) {
				const {ebob, ekok} = primeLadder([a, b]);
				expect(ebob).toBe(gcd(a, b));
				expect(ekok).toBe((a * b) / gcd(a, b));
			}
		}
	});

	it('writes a number as prime powers', () => {
		expect(primePowers(60)).toBe('2² · 3 · 5');
		expect(primePowers(72)).toBe('2³ · 3²');
		expect(primePowers(13)).toBe('13');
	});
});

describe('sample space, mapping, area model and numbers', () => {
	it('counts the outcomes of two dice', () => {
		const dice = [1, 2, 3, 4, 5, 6];
		expect(eventCount(dice, dice, {of: 'sum', is: 'eq', value: 7})).toEqual({count: 6, total: 36, probability: [1, 6]});
		expect(eventCount(dice, dice, {of: 'product', is: 'even'}).count).toBe(27);
		expect(eventCount(dice, dice, {of: 'max', is: 'le', value: 3}).count).toBe(9);
		expect(eventCount(dice, dice, {of: 'difference', is: 'eq', value: 0}).count).toBe(6);
		expect(eventCount(dice, dice, {of: 'sum', is: 'multipleOf', value: 5}).count).toBe(7);
	});

	it('says whether a mapping is a function, one-to-one and onto', () => {
		expect(mappingProperties(3, 4, [[0, 0], [1, 2], [2, 3]])).toEqual({isFunction: true, oneToOne: true, onto: false});
		expect(mappingProperties(3, 3, [[0, 1], [1, 0], [2, 2]])).toEqual({isFunction: true, oneToOne: true, onto: true});
		expect(mappingProperties(3, 2, [[0, 0], [1, 0], [2, 1]])).toEqual({isFunction: true, oneToOne: false, onto: true});
		// An element without an arrow, or with two, is no function.
		expect(mappingProperties(3, 3, [[0, 0], [1, 1]]).isFunction).toBe(false);
		expect(mappingProperties(2, 3, [[0, 0], [0, 1], [1, 2]]).isFunction).toBe(false);
	});

	it('labels an area model cell by its sides', () => {
		expect(areaCellLabel('x', 'x')).toBe('x²');
		expect(areaCellLabel('x', '3')).toBe('3x');
		expect(areaCellLabel('2', 'x')).toBe('2x');
		expect(areaCellLabel('20', '3')).toBe('60');
		expect(areaCellLabel('a', 'b')).toBe('ab');
		expect(areaCellLabel('b', 'a')).toBe('ab');
	});

	it('writes numbers and fractions as a Turkish textbook does', () => {
		expect(written(-3)).toBe('−3');
		expect(written(2.5)).toBe('2,5');
		expect(lowestTerms(6, 36)).toEqual([1, 6]);
		expect(lowestTerms(0, 36)).toEqual([0, 1]);
	});
});
