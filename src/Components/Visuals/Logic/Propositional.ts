/**
 * Propositional logic for the truth table visual: formulas written as the MEB textbook writes them (~p, p ∧ q, p ∨ q,
 * p ⇒ q, p ⇔ q, with round or square brackets) are parsed and evaluated here, so a table's D and Y values are worked out
 * by the engine and never typed by hand. "~" binds tightest, then ∧, ∨, ⇒ (to the right) and ⇔.
 */

type Formula = {kind: 'var'; name: string} | {kind: 'not'; of: Formula} | {kind: 'and' | 'or' | 'implies' | 'iff'; left: Formula; right: Formula};

type Token = {type: 'var'; name: string} | {type: 'op'; op: 'not' | 'and' | 'or' | 'implies' | 'iff'} | {type: 'open'} | {type: 'close'};

const OPERATORS: [string, Token][] = [
	['<=>', {type: 'op', op: 'iff'}],
	['⇔', {type: 'op', op: 'iff'}],
	['↔', {type: 'op', op: 'iff'}],
	['=>', {type: 'op', op: 'implies'}],
	['⇒', {type: 'op', op: 'implies'}],
	['→', {type: 'op', op: 'implies'}],
	['∧', {type: 'op', op: 'and'}],
	['&', {type: 'op', op: 'and'}],
	['∨', {type: 'op', op: 'or'}],
	['|', {type: 'op', op: 'or'}],
	['~', {type: 'op', op: 'not'}],
	['¬', {type: 'op', op: 'not'}],
	['(', {type: 'open'}],
	['[', {type: 'open'}],
	[')', {type: 'close'}],
	[']', {type: 'close'}],
];

const tokenize = (text: string): Token[] => {
	const tokens: Token[] = [];
	let at = 0;
	while (at < text.length) {
		if (/\s/.test(text[at])) {
			at++;
			continue;
		}
		const operator = OPERATORS.find(([symbol]) => text.startsWith(symbol, at));
		if (operator) {
			tokens.push(operator[1]);
			at += operator[0].length;
			continue;
		}
		if (/[p-t]/.test(text[at])) {
			tokens.push({type: 'var', name: text[at]});
			at++;
			continue;
		}
		throw new Error(`"${text[at]}" is not a proposition letter (p to t) or a connective (~ ∧ ∨ ⇒ ⇔).`);
	}
	return tokens;
};

/** Parses a formula; throws with the reason when it is not one. */
export const parseFormula = (text: string): Formula => {
	const tokens = tokenize(text);
	let at = 0;
	const peekOp = () => {
		const token = tokens[at];
		return token?.type === 'op' ? token.op : undefined;
	};
	const iff = (): Formula => {
		let left = implies();
		while (peekOp() === 'iff') {
			at++;
			left = {kind: 'iff', left, right: implies()};
		}
		return left;
	};
	const implies = (): Formula => {
		const left = or();
		if (peekOp() !== 'implies') return left;
		at++;
		return {kind: 'implies', left, right: implies()};
	};
	const or = (): Formula => {
		let left = and();
		while (peekOp() === 'or') {
			at++;
			left = {kind: 'or', left, right: and()};
		}
		return left;
	};
	const and = (): Formula => {
		let left = unary();
		while (peekOp() === 'and') {
			at++;
			left = {kind: 'and', left, right: unary()};
		}
		return left;
	};
	const unary = (): Formula => {
		const token = tokens[at];
		if (!token) throw new Error('The formula ends too early.');
		if (token.type === 'op' && token.op === 'not') {
			at++;
			return {kind: 'not', of: unary()};
		}
		if (token.type === 'var') {
			at++;
			return {kind: 'var', name: token.name};
		}
		if (token.type === 'open') {
			at++;
			const inner = iff();
			if (tokens[at]?.type !== 'close') throw new Error('A bracket is not closed.');
			at++;
			return inner;
		}
		throw new Error('A connective has nothing on one side.');
	};
	const formula = iff();
	if (at < tokens.length) throw new Error('Something is left after the formula; is a connective missing?');
	return formula;
};

export const isFormula = (text: string) => {
	try {
		parseFormula(text);
		return true;
	} catch {
		return false;
	}
};

/** The proposition letters a formula uses, in the order they first appear. */
export const lettersOf = (formula: Formula): string[] => {
	if (formula.kind === 'var') return [formula.name];
	if (formula.kind === 'not') return lettersOf(formula.of);
	return [...new Set([...lettersOf(formula.left), ...lettersOf(formula.right)])];
};

export const evaluate = (formula: Formula, values: Record<string, boolean>): boolean => {
	switch (formula.kind) {
		case 'var':
			return values[formula.name];
		case 'not':
			return !evaluate(formula.of, values);
		case 'and':
			return evaluate(formula.left, values) && evaluate(formula.right, values);
		case 'or':
			return evaluate(formula.left, values) || evaluate(formula.right, values);
		case 'implies':
			return !evaluate(formula.left, values) || evaluate(formula.right, values);
		case 'iff':
			return evaluate(formula.left, values) === evaluate(formula.right, values);
	}
};

/** The rows of a truth table in textbook order: D before Y, the first letter changing slowest (DD, DY, YD, YY). */
export const truthRows = (letters: readonly string[]): Record<string, boolean>[] =>
	Array.from({length: 2 ** letters.length}, (_, row) => Object.fromEntries(letters.map((letter, index) => [letter, ((row >> (letters.length - 1 - index)) & 1) === 0])));

type TruthCheck = 'none' | 'consistency' | 'validity' | 'joint' | 'equivalence';

/**
 * What a table shows about its formulas: the rows that decide (doğrulayıcı, yanlışlayıcı, ortak doğrulayıcı or the
 * rows where two formulas differ) and the verdict, worked out from the values.
 */
export const truthVerdict = (values: boolean[][], check: TruthCheck): {rows: number[]; tag: string; verdict: string} => {
	const last = values.map((row) => row[row.length - 1]);
	const rowsWhere = (test: (row: boolean[], index: number) => boolean) => values.flatMap((row, index) => (test(row, index) ? [index] : []));
	switch (check) {
		case 'none':
			return {rows: [], tag: '', verdict: ''};
		case 'consistency': {
			const rows = rowsWhere((_, index) => last[index]);
			const verdict = rows.length === values.length ? 'Totoloji: her yorumda D' : rows.length > 0 ? 'Tutarlı: en az bir yorumda D' : 'Tutarsız: hiçbir yorumda D yok';
			return {rows, tag: 'doğrulayıcı', verdict};
		}
		case 'validity': {
			const rows = rowsWhere((_, index) => !last[index]);
			return {rows, tag: 'yanlışlayıcı', verdict: rows.length === 0 ? 'Geçerli: yanlışlayıcı yorum yok' : 'Geçersiz: yanlışlayıcı yorum var'};
		}
		case 'joint': {
			const rows = rowsWhere((row) => row.every(Boolean));
			return {rows, tag: 'ortak doğrulayıcı', verdict: rows.length > 0 ? 'Birlikte tutarlı: ortak doğrulayıcı var' : 'Birlikte tutarsız: ortak doğrulayıcı yok'};
		}
		case 'equivalence': {
			const rows = rowsWhere((row) => row[row.length - 1] !== row[row.length - 2]);
			return {rows, tag: 'farklı', verdict: rows.length === 0 ? 'Eşdeğer: her satırda aynı değer' : 'Eşdeğer değil: değerler ayrılıyor'};
		}
	}
};
