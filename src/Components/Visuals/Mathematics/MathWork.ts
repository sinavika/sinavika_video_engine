import {parseExpression} from './PlotExpression';

/**
 * The arithmetic the mathematics teaching visuals draw (sign table, long division, prime ladder, sample space,
 * mapping, area model, counting slots). The engine works it out from the script's numbers, so a figure can never
 * show a sign, a digit or a count the mathematics does not give (TYT Matematik, 9 Nov 2026). Schemas use these
 * functions to refuse what cannot be drawn correctly; components use them to draw.
 */

/** "−3", "2,5": the minus sign and the decimal comma as a Turkish textbook writes them. */
export const written = (value: number): string => `${value < 0 ? '−' : ''}${String(Math.abs(Number(value.toFixed(3)))).replace('.', ',')}`;

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** A fraction in lowest terms, "6/36" → [1, 6]. */
export const lowestTerms = (numerator: number, denominator: number): [number, number] => {
	const divisor = gcd(numerator, denominator) || 1;
	return [numerator / divisor, denominator / divisor];
};

// ---------------------------------------------------------------- sign table

export type Sign = '+' | '−' | '0' | 'undefined';

type SignFactor = {expression: string; denominator?: boolean};

/** The sign of a number, with a tolerance for values that are zero up to rounding. */
const signOf = (value: number): Sign => (!Number.isFinite(value) ? 'undefined' : Math.abs(value) < 1e-9 ? '0' : value > 0 ? '+' : '−');

/** A point strictly inside each interval the critical points cut the line into: (−∞, p1), (p1, p2) … (pn, ∞). */
export const intervalSamples = (points: readonly number[]): number[] => {
	if (points.length === 0) return [0];
	const gap = Math.max(1, points.length > 1 ? Math.min(...points.slice(1).map((point, index) => point - points[index])) : 1);
	return [points[0] - gap, ...points.slice(1).map((point, index) => (point + points[index]) / 2), points[points.length - 1] + gap];
};

/**
 * Where a factor changes sign or is zero inside an interval the critical points leave whole: a sign table drawn from
 * those points would be wrong there. Each interval is sampled finely; the first x where the sign is not that of the
 * interval's middle is returned, or undefined when the factor keeps one sign throughout.
 */
export const signBreak = (expression: string, from: number, to: number): number | undefined => {
	const evaluate = parseExpression(expression, ['x']);
	const left = Number.isFinite(from) ? from : to - 1000;
	const right = Number.isFinite(to) ? to : from + 1000;
	const steps = 400;
	const width = (right - left) / steps;
	let before = signOf(evaluate({x: left + width}));
	for (let index = 2; index < steps; index++) {
		const at = left + width * index;
		const sign = signOf(evaluate({x: at}));
		if (sign === before) continue;
		// Narrow it down to where the sign changes, so the message names the missing point.
		let inside = at - width;
		let outside = at;
		for (let round = 0; round < 40; round++) {
			const half = (inside + outside) / 2;
			if (signOf(evaluate({x: half})) === before) inside = half;
			else outside = half;
		}
		return outside;
	}
	return undefined;
};

/**
 * The rows of a sign table: for each factor, its sign in each interval and at each critical point; then the
 * result (the product of the numerator factors over the denominator factors). Cells alternate interval, point,
 * interval … (2n + 1 cells for n points). A denominator factor that is zero makes the result undefined there.
 */
export const signTableRows = (factors: readonly SignFactor[], points: readonly number[]): {factors: Sign[][]; result: Sign[]} => {
	const samples = intervalSamples(points);
	const at = (index: number) => (index % 2 === 0 ? samples[index / 2] : points[(index - 1) / 2]);
	const cells = 2 * points.length + 1;
	const rows = factors.map((factor) => {
		const evaluate = parseExpression(factor.expression, ['x']);
		return Array.from({length: cells}, (_, index) => signOf(evaluate({x: at(index)})));
	});
	const result = Array.from({length: cells}, (_, index): Sign => {
		const column = rows.map((row) => row[index]);
		if (factors.some((factor, row) => factor.denominator && (column[row] === '0' || column[row] === 'undefined'))) return 'undefined';
		if (column.some((sign) => sign === 'undefined')) return 'undefined';
		if (column.some((sign) => sign === '0')) return '0';
		return column.filter((sign) => sign === '−').length % 2 === 0 ? '+' : '−';
	});
	return {factors: rows, result};
};

/** Which result cells satisfy the inequality: > 0, < 0, ≥ 0 or ≤ 0. */
export const solutionCells = (result: readonly Sign[], relation: '>' | '<' | '>=' | '<='): boolean[] =>
	result.map((sign) => (relation === '>' ? sign === '+' : relation === '<' ? sign === '−' : relation === '>=' ? sign === '+' || sign === '0' : sign === '−' || sign === '0'));

/** The solution set as an interval union, "(−∞, −1) ∪ [2, 3)", from the cells that satisfy the inequality. */
export const solutionText = (points: readonly number[], chosen: readonly boolean[]): string => {
	const pieces: string[] = [];
	let index = 0;
	while (index < chosen.length) {
		if (!chosen[index]) {
			index++;
			continue;
		}
		const start = index;
		while (index + 1 < chosen.length && chosen[index + 1]) index++;
		const end = index;
		// A piece that starts or ends on a point: closed when the point itself is in the set, open otherwise.
		const left = start === 0 ? '(−∞' : start % 2 === 1 ? `[${written(points[(start - 1) / 2])}` : `(${written(points[start / 2 - 1])}`;
		const right = end === chosen.length - 1 ? '∞)' : end % 2 === 1 ? `${written(points[(end - 1) / 2])}]` : `${written(points[end / 2])})`;
		// A single point on its own: {2}.
		pieces.push(start === end && start % 2 === 1 ? `{${written(points[(start - 1) / 2])}}` : `${left}, ${right}`);
		index++;
	}
	return pieces.length ? pieces.join(' ∪ ') : '∅';
};

// ---------------------------------------------------------------- long division

/** One round of a long division as written in a Turkish classroom: the part taken, the quotient digit, what is subtracted, what is left. */
type DivisionRound = {part: number; digit: number; product: number; rest: number; column: number};

/**
 * The rounds of dividend ÷ divisor, school method: take digits from the left until the part is at least the
 * divisor, write the quotient digit, subtract, bring the next digit down. `column` is the dividend digit the round's
 * part ends on (0 is the first digit). A part smaller than the divisor after a digit is brought down gives a 0 in the
 * quotient.
 */
export const longDivisionRounds = (dividend: number, divisor: number): {rounds: DivisionRound[]; quotient: number; remainder: number} => {
	const digits = String(dividend).split('').map(Number);
	const rounds: DivisionRound[] = [];
	let part = 0;
	let column = 0;
	// The first part: enough leading digits to reach the divisor (or the whole dividend when it is smaller).
	while (column < digits.length) {
		part = part * 10 + digits[column];
		if (part >= divisor || column === digits.length - 1) break;
		column++;
	}
	for (;;) {
		const digit = Math.floor(part / divisor);
		const product = digit * divisor;
		const rest = part - product;
		rounds.push({part, digit, product, rest, column});
		column++;
		if (column >= digits.length) break;
		part = rest * 10 + digits[column];
	}
	return {rounds, quotient: Math.floor(dividend / divisor), remainder: dividend % divisor};
};

// ---------------------------------------------------------------- prime ladder

type LadderRow = {prime: number; values: number[]; all: boolean};

const smallestPrimeFactor = (value: number): number => {
	for (let candidate = 2; candidate * candidate <= value; candidate++) if (value % candidate === 0) return candidate;
	return value;
};

/**
 * The prime ladder (ortak bölen merdiveni): each row divides by the smallest prime that divides one of the numbers;
 * numbers it divides go down divided, the others go down as they are, until every number is 1. `all` marks the rows
 * whose prime divides every number: their product is the EBOB, the product of all primes the EKOK.
 */
export const primeLadder = (numbers: readonly number[]): {rows: LadderRow[]; ebob: number; ekok: number} => {
	const rows: LadderRow[] = [];
	let values = [...numbers];
	while (values.some((value) => value > 1)) {
		const prime = Math.min(...values.filter((value) => value > 1).map(smallestPrimeFactor));
		rows.push({prime, values, all: values.every((value) => value % prime === 0)});
		values = values.map((value) => (value % prime === 0 ? value / prime : value));
	}
	return {rows, ebob: rows.filter((row) => row.all).reduce((product, row) => product * row.prime, 1), ekok: rows.reduce((product, row) => product * row.prime, 1)};
};

/** A number as a product of prime powers, "2³ · 3 · 5". */
export const primePowers = (value: number): string => {
	const powers = new Map<number, number>();
	for (let rest = value; rest > 1; ) {
		const prime = smallestPrimeFactor(rest);
		powers.set(prime, (powers.get(prime) ?? 0) + 1);
		rest /= prime;
	}
	const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
	return [...powers.entries()].map(([prime, power]) => (power === 1 ? `${prime}` : `${prime}${String(power).split('').map((digit) => SUPERSCRIPT[Number(digit)]).join('')}`)).join(' · ') || '1';
};

// ---------------------------------------------------------------- sample space

type SpaceMeasure = 'sum' | 'product' | 'difference' | 'max' | 'min' | 'first' | 'second';
type SpaceTest = 'eq' | 'lt' | 'gt' | 'le' | 'ge' | 'even' | 'odd' | 'multipleOf';
type SpaceEvent = {of: SpaceMeasure; is: SpaceTest; value?: number};

export const measureOf = (of: SpaceMeasure, a: number, b: number): number =>
	of === 'sum' ? a + b : of === 'product' ? a * b : of === 'difference' ? Math.abs(a - b) : of === 'max' ? Math.max(a, b) : of === 'min' ? Math.min(a, b) : of === 'first' ? a : b;

export const passes = (event: SpaceEvent, a: number, b: number): boolean => {
	const measure = measureOf(event.of, a, b);
	const value = event.value ?? 0;
	switch (event.is) {
		case 'eq':
			return measure === value;
		case 'lt':
			return measure < value;
		case 'gt':
			return measure > value;
		case 'le':
			return measure <= value;
		case 'ge':
			return measure >= value;
		case 'even':
			return measure % 2 === 0;
		case 'odd':
			return Math.abs(measure % 2) === 1;
		case 'multipleOf':
			return value !== 0 && measure % value === 0;
	}
};

/** How many outcomes of the grid an event takes, and its probability in lowest terms. */
export const eventCount = (rows: readonly number[], columns: readonly number[], event: SpaceEvent): {count: number; total: number; probability: [number, number]} => {
	const count = rows.reduce((total, a) => total + columns.filter((b) => passes(event, a, b)).length, 0);
	const total = rows.length * columns.length;
	return {count, total, probability: lowestTerms(count, total)};
};

// ---------------------------------------------------------------- mapping

/**
 * What a mapping between two sets is: a function when every element of the first set has exactly one arrow; then
 * one-to-one (bire bir) when no two arrows meet at the same element, onto (örten) when every element of the second
 * set is reached.
 */
export const mappingProperties = (domainSize: number, codomainSize: number, arrows: readonly (readonly [number, number])[]): {isFunction: boolean; oneToOne: boolean; onto: boolean} => {
	const outgoing = Array.from({length: domainSize}, (_, index) => arrows.filter(([from]) => from === index).length);
	const isFunction = outgoing.every((count) => count === 1);
	const targets = arrows.map(([, to]) => to);
	return {isFunction, oneToOne: isFunction && new Set(targets).size === targets.length, onto: isFunction && Array.from({length: codomainSize}, (_, index) => index).every((index) => targets.includes(index))};
};

// ---------------------------------------------------------------- area model

const NUMBER = /^-?\d+(?:[.,]\d+)?$/;

/**
 * The label of a cell of an area model from its row's and column's sides: two numbers multiply ("20 · 3" → 60),
 * a number and a letter join ("3" and "x" → 3x), a letter by itself squares (x · x → x²), others join (ab).
 */
export const areaCellLabel = (row: string, column: string): string => {
	const r = row.trim();
	const c = column.trim();
	if (NUMBER.test(r) && NUMBER.test(c)) return written(Number(r.replace(',', '.')) * Number(c.replace(',', '.')));
	if (NUMBER.test(r)) return `${r}${c}`;
	if (NUMBER.test(c)) return `${c}${r}`;
	if (r === c) return `${r}²`;
	return [r, c].sort().join('');
};
