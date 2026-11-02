/**
 * A long one-line formula broken into lines at its relations, for an app still. A still is 1280 pixels wide and shown
 * about 360 wide: "x = 7k + 4 ⇒ 3x = 21k + 12 = 7(3k + 1) + 5" fitted on one line came out with its exponents at 20
 * pixels and its caption at 10 (2 Nov 2026). Lines break first where one statement leads to the next (⇒, ⇔, ", \quad"),
 * then, when a statement is still too wide, before its = < ≤ …; each new line begins with its relation, as a written
 * solution goes on. A lesson keeps its one line.
 */

/** Relations that lead from one statement to the next: the first places to break. */
const STEPS = ['\\Longrightarrow', '\\Leftrightarrow', '\\Rightarrow', '\\implies', '\\iff'];

/** Relations inside a statement, longest first so \leq is not read as \le. */
const RELATIONS = ['\\approx', '\\equiv', '\\neq', '\\leq', '\\geq', '\\to', '\\le', '\\ge', '=', '<', '>'];

/** Spacing commands, which carry no ink and are dropped at a line's ends. */
const SPACE = /^(?:\\[;,:! ]|\\q?quad(?![a-zA-Z])|~|\s)+|(?:\\[;,:! ]|\\q?quad(?![a-zA-Z])|~|\s)+$/g;

/** Whether `rest` begins with the command or sign `name` (a command not followed by more letters). */
const opens = (rest: string, name: string) => rest.startsWith(name) && !(name.startsWith('\\') && /[a-zA-Z]/.test(rest[name.length] ?? ''));

/**
 * About how many characters wide a piece of LaTeX prints: a letter or a command one, a script 0.7, and the room KaTeX
 * leaves round relations (about half a letter) and operators (less); the spaces of the source print nothing.
 */
export const latexWidth = (latex: string): number => {
	const text = latex
		.replace(/\\text\{([^}]*)\}/g, (_, words: string) => words.replace(/ /g, '·'))
		.replace(/\\(?:left|right)(?![a-zA-Z])/g, '')
		.replace(/\\qquad(?![a-zA-Z])/g, '··')
		.replace(/\\quad(?![a-zA-Z])/g, '·')
		.replace(/\\[;:]/g, '˙')
		.replace(/\\[,! ]/g, '')
		.replace(/\\(?:Longrightarrow|Leftrightarrow|Rightarrow|implies|iff|approx|equiv|neq|leq|geq|to|le|ge)(?![a-zA-Z])/g, '=')
		.replace(/\\(?:cdot|times|pm|mp|div|ast|mid|in)(?![a-zA-Z])/g, '+')
		.replace(/\\[a-zA-Z]+/g, 'x');
	let width = 0;
	let script = false;
	for (const char of text) {
		if (char === '^' || char === '_') {
			script = true;
			continue;
		}
		if (char === '{' || char === '}' || char === ' ') continue;
		width += script ? 0.7 : char === '=' || char === '<' || char === '>' ? 1.55 : char === '+' || char === '-' ? 1.45 : char === '˙' ? 0.3 : 1;
		script = false;
	}
	return width;
};

type BreakPoint = {at: number; skip: number; step: boolean};

/** The places a top-level formula may break: before a relation, or after a ", \quad" between statements. */
const breakPoints = (latex: string): BreakPoint[] => {
	const points: BreakPoint[] = [];
	let depth = 0;
	for (let index = 0; index < latex.length; index++) {
		const rest = latex.slice(index);
		// \left( … \right) and \{ … \} hold what is inside them like braces: a set's "x = 2k" is not a break.
		if (/^\\left(?![a-zA-Z])/.test(rest)) depth++;
		else if (/^\\right(?![a-zA-Z])/.test(rest)) depth--;
		const char = latex[index];
		if (char === '\\' && /^\\[{}]/.test(rest)) {
			depth += rest[1] === '{' ? 1 : -1;
			index++;
			continue;
		}
		if (char === '{') depth++;
		else if (char === '}') depth--;
		if (depth !== 0 || index === 0) continue;
		const statement = /^,\s*(?:\\q?quad(?![a-zA-Z])\s*|\\[;,:]\s*)+/.exec(rest);
		if (statement) {
			points.push({at: index + 1, skip: statement[0].length - 1, step: true});
			index += statement[0].length - 1;
			continue;
		}
		const step = STEPS.find((name) => opens(rest, name));
		const relation = step ?? RELATIONS.find((name) => opens(rest, name));
		if (relation) {
			points.push({at: index, skip: 0, step: Boolean(step)});
			index += relation.length - 1;
		} else if (char === '\\') {
			// The rest of a command's name is not read again: the "q" of \leq is not a break.
			const name = /^\\[a-zA-Z]+/.exec(rest);
			if (name) index += name[0].length - 1;
		}
	}
	return points;
};

/** A formula cut at some of its break points, its pieces without spacing at their ends. */
const cut = (latex: string, points: readonly BreakPoint[]): string[] => {
	const pieces: string[] = [];
	let from = 0;
	for (const point of points) {
		pieces.push(latex.slice(from, point.at));
		from = point.at + point.skip;
	}
	pieces.push(latex.slice(from));
	return pieces.map((piece) => piece.replace(SPACE, '')).filter(Boolean);
};

/** Pieces joined into lines while a line stays within `width`; a piece of a few letters ("A") never stands alone. */
const pack = (pieces: readonly string[], width: number): string[] => {
	const lines: string[] = [];
	for (const piece of pieces) {
		const last = lines.at(-1);
		if (last !== undefined && (latexWidth(`${last} ${piece}`) <= width || latexWidth(last) < 4)) lines[lines.length - 1] = `${last} ${piece}`;
		else lines.push(piece);
	}
	return lines;
};

/**
 * The formula in lines no wider than about `width` characters (a `gathered` block), or as it is when it fits on one
 * line or has no place to break.
 */
export const formulaLines = (latex: string, width: number): string => {
	if (latexWidth(latex) <= width) return latex;
	const points = breakPoints(latex);
	const steps = points.filter((point) => point.step);
	// Statement by statement; a statement still too wide is broken before its relations.
	const lines = cut(latex, steps).flatMap((statement) => {
		if (latexWidth(statement) <= width) return [statement];
		return pack(cut(statement, breakPoints(statement).filter((point) => !point.step)), width);
	});
	return lines.length > 1 ? `\\begin{gathered}${lines.join(' \\\\ ')}\\end{gathered}` : latex;
};
