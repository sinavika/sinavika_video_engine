import {parseExpression} from '../Components/Visuals/Mathematics/PlotExpression';
import type {CourseVisual} from '../Components/Visuals/VisualSchema';
import {parseRichText} from '../Schemas/RichText';
import type {LessonCard, LessonScript} from './LessonScript';

/**
 * The arithmetic a script writes, checked before anything is drawn or spoken: "$5 \cdot 4 \cdot 3 = 60$",
 * "2 · 4 = 8" in a table cell, "$\frac{2500}{400} = 6{,}25$" in a step. Only claims made of numbers are checked;
 * anything with a letter, a subscript or a relation other than = is left alone. A worked equation (the balance visual)
 * is checked by putting its answer back into every step. 361 questions were solved by hand in the TYT Matematik
 * rewrite (9 Nov 2026); this check keeps the next lessons as clean without a second hand pass.
 */

const SUPERSCRIPTS: Record<string, string> = {'²': '^2', '³': '^3'};

/**
 * A formula or a plain arithmetic text as an expression the plot parser reads, or undefined when it is not arithmetic
 * of numbers (and, with `variables`, of those letters). Turkish decimal commas ("6,25", "6{,}25") become points; a
 * mixed number ("2\frac{1}{3}", tam sayılı kesir) is the whole plus the fraction; "3/4" written in a line of text is
 * one number (1 ÷ 3/2 is 1 ÷ (3/2)).
 */
export const arithmeticExpression = (text: string, variables: readonly string[] = []): string | undefined => {
	let s = text
		.replace(/\\left|\\right|\\displaystyle/g, '')
		.replace(/\\[,;!:]|\\quad|\\qquad|~/g, ' ')
		.replace(/(\d)\s*\{,\}\s*(\d)/g, '$1.$2')
		.replace(/(\d),(\d)/g, '$1.$2')
		// Thousands written apart ("900 000", "900\,000") are one number.
		.replace(/(\d)\s+(?=\d{3}(?!\d))/g, '$1')
		// "3/4" written in a line of text is one number: 1 ÷ 3/2 is 1 ÷ (3/2).
		.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, '($1/$2)')
		.replace(/\\cdot|\\times|·|×|⋅/g, '*')
		.replace(/\\div|÷/g, '/')
		.replace(/−|–/g, '-')
		.replace(/[²³]/g, (mark) => SUPERSCRIPTS[mark])
		.replace(/(\d+)\s*\\[dt]?frac\s*\{(\d+)\}\s*\{(\d+)\}/g, '($1+($2)/($3))');
	// Fractions from the innermost out: \frac{a}{b} → ((a)/(b)).
	for (let guard = 0; guard < 12 && /\\[dt]?frac/.test(s); guard++) {
		const next = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))');
		if (next === s) return undefined;
		s = next;
	}
	s = s
		.replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)')
		.replace(/√\s*\(/g, 'sqrt(')
		.replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)')
		.replace(/\^\s*\{([^{}]*)\}/g, '^($1)')
		.replace(/\{/g, '(')
		.replace(/\}/g, ')')
		.trim();
	if (!s || /\\|_|%|[<>≤≥≈!≠]/.test(s)) return undefined;
	const words = s.match(/\p{L}+/gu) ?? [];
	if (words.some((word) => word !== 'sqrt' && !variables.includes(word) && !(word.length > 1 && [...word].every((letter) => variables.includes(letter))))) return undefined;
	if (!/\d/.test(s)) return undefined;
	return s;
};

const valueOf = (expression: string, scope: Record<string, number> = {}): number | undefined => {
	try {
		const value = parseExpression(expression, Object.keys(scope))(scope);
		return Number.isFinite(value) ? value : undefined;
	} catch {
		return undefined;
	}
};

/** Equal up to rounding: exactly, or to the decimals the written side shows ("6,25", "0,33"). */
const agrees = (a: number, b: number, written: string[], rounded = false): boolean => {
	if (Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))) return true;
	// A statement that works with a rounded value ("0,0667" for 1/15) holds to that value's precision.
	if (rounded && Math.abs(a - b) <= 5e-4 * Math.max(Math.abs(a), Math.abs(b))) return true;
	const decimals = Math.max(0, ...written.map((side) => /(?:[.,]|\{,\})(\d+)\s*$/.exec(side.trim())?.[1].length ?? 0));
	return decimals >= 2 && Math.abs(a - b) <= 0.5 * 10 ** -decimals + 1e-12;
};

/**
 * The equalities of a statement that do not hold: each "=" between two numeric sides is checked. Statements are
 * split at ⇒, →, semicolons and a comma with a space after it ("a = 2, b = 3").
 */
export const falseEqualities = (text: string): {claim: string; left: number; right: number}[] =>
	text
		.split(/\\Rightarrow|\\implies|\\to\b|⇒|→|;|,\s+|\\text\{[^}]*\}/)
		.flatMap((statement) => {
			const sides = statement.split(/(?<![<>!\\])=(?!=)/);
			if (sides.length < 2) return [];
			const values = sides.map((side) => {
				const expression = arithmeticExpression(side);
				return expression === undefined ? undefined : valueOf(expression);
			});
			return sides.slice(1).flatMap((side, index) => {
				const left = values[index];
				const right = values[index + 1];
				if (left === undefined || right === undefined || agrees(left, right, [sides[index], side], ROUNDED.test(statement))) return [];
				return [{claim: statement.trim(), left, right}];
			});
		});

/** A decimal with three or more places: the statement works with a rounded value. */
const ROUNDED = /\d[.,]\d{3,}|\d\{,\}\d{3,}/;

/** A claim that goes on: "0,1 · 20 = 0,1 · V" is cut off at the letter, "20 ÷ 3 = 6 (kalan 2)" is a division with remainder. */
const CONTINUES = /^\s*([+\-−·×÷*/^]|\(?\s*kalan)/iu;

/** Words a number may follow without starting a claim of its own: a function ("log 5 = …"), a mixed number ("1 tam 3/4"). */
const FUNCTION_WORD = /(?:^|\s)(tam|log|ln|sin|cos|tan|cot)$/iu;

/** Plain-text arithmetic with an "=": "2 · 4 = 8" in a table cell or a flow node. */
const PLAIN_CLAIM = /[−-]?[\d(√][\d\s+\-−·×÷*/(),.²³√]*=[\d\s+\-−·×÷*/(),.=²³√]*[\d)²³]/g;

/** Words after a claim that say it is false on purpose: "$-1 = 0$ çelişkidir", "… olamaz". */
const DENIED = /^[^.!?]*?(çeliş|olamaz|yanlış|değil|imkânsız|saçma|✗)/iu;

/**
 * The plain-text claims of a line of text. A claim is taken only where it stands on its own: not glued to a word
 * ("2x + 3 = 5" is algebra), not after an operator or a sign of the lesson's own ("2 ∗ 1 = 5"), not after "tam" (a
 * mixed number, "1 tam 3/4"), not trailing off ("2,0777…"), not denied. " · " between two equalities is a list
 * ("−5 = −5/1 · 0,25 = 1/4").
 */
const plainClaims = (text: string): string[] =>
	[...text.matchAll(PLAIN_CLAIM)].flatMap((match) => {
		// A full stop and a space end the claim: "100 − 10 = 90. 99 yalnız …".
		const claim = match[0].split(/\.\s/)[0];
		const start = match.index ?? 0;
		const before = text.slice(0, start).trimEnd();
		const after = text.slice(start + claim.length);
		const adjacent = start > 0 ? text[start - 1] : ' ';
		const previous = before.at(-1);
		if (!/[\s([{:;,]/.test(adjacent)) return [];
		if (previous !== undefined && !/[\p{L}\d([{:;,.]/u.test(previous)) return [];
		if (FUNCTION_WORD.test(before) || /^\s*(…|\.\.\.)/.test(after) || DENIED.test(after) || CONTINUES.test(after)) return [];
		if (!/[+\-−·×÷*/²³√]/.test(claim.replace(/^[−-]/, ''))) return [];
		// " · " between two equalities may be a list ("−5 = −5/1 · 0,25 = 1/4"): read so only when read whole it is false
		// and read as a list it is true ("101² − 99² = 2 · 200 = 400" is one claim).
		const listed = claim.split(/\s·\s/);
		const isList = listed.length > 1 && listed.every((part) => part.includes('=')) && falseEqualities(claim).length > 0 && listed.every((part) => falseEqualities(part).length === 0);
		return isList ? [] : [claim];
	});

/** The arithmetic a text claims: its formulas, and plain-text arithmetic outside them. Quoted statements are left out. */
const claimsIn = (text: string): string[] => {
	const segments = parseRichText(text.replace(/["“”][^"“”]*["“”]/g, ' '));
	return segments.flatMap((segment, index) => {
		if (segment.kind !== 'math' && segment.kind !== 'displayMath') return plainClaims(segment.value);
		const after = segments
			.slice(index + 1)
			.map((next) => next.value)
			.join(' ');
		return DENIED.test(after) || CONTINUES.test(after) ? [] : [segment.value];
	});
};

/**
 * Fields not read for claims: what is spoken (narration), bare formulas (read by latexOf), and what is false on
 * purpose: a mistake card's wrong belief, a question's or prediction's options, a passage of statements to judge.
 */
const SKIPPED_FIELDS = new Set(['expression', 'narration', 'explanationNarration', 'latex', 'math', 'left', 'right', 'wrong', 'options', 'choices', 'context']);

/** Every text of a card, formulas included (the same walk the section review uses). */
const textsOf = (value: unknown): string[] =>
	typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(textsOf) : value && typeof value === 'object' ? Object.entries(value).flatMap(([key, item]) => (SKIPPED_FIELDS.has(key) ? [] : textsOf(item))) : [];

/** Fields that hold a bare formula, not rich text: a step's latex, a worked example's math line, a formula visual. */
const latexOf = (value: unknown): string[] =>
	Array.isArray(value)
		? value.flatMap(latexOf)
		: value && typeof value === 'object'
			? Object.entries(value).flatMap(([key, item]) => ((key === 'latex' || key === 'math') && typeof item === 'string' ? [item] : SKIPPED_FIELDS.has(key) ? [] : latexOf(item)))
			: [];

const format = (value: number) => String(Number(value.toFixed(6))).replace('.', ',');

/** The equalities a card writes that do not hold. */
export const cardArithmeticIssues = (card: LessonCard): string[] => {
	const claims = [...textsOf(card).flatMap(claimsIn), ...latexOf(card)];
	return [...new Set(claims)].flatMap((claim) => falseEqualities(claim).map((wrong) => `"${wrong.claim}" does not hold (${format(wrong.left)} ≠ ${format(wrong.right)}).`));
};

type Equation = Extract<CourseVisual, {kind: 'equation'}>;

/**
 * A worked equation whose last step solves it ("t = 3"): that value put back into every step must make both sides
 * equal. A step that does not is a slip in the algebra the balance would show as true.
 */
export const equationIssues = (visual: Equation): string[] => {
	const last = visual.steps[visual.steps.length - 1];
	const variable = /^\s*([a-zA-Z])\s*$/.exec(last.left)?.[1];
	if (!variable) return [];
	const answer = arithmeticExpression(last.right);
	const value = answer === undefined ? undefined : valueOf(answer);
	if (value === undefined) return [];
	return visual.steps.flatMap((step, index) => {
		if (/^\s*(\\geq|\\ge|\\leq|\\le|\\neq|<|>|≥|≤|≠)/.test(step.right)) return [];
		const left = arithmeticExpression(step.left, [variable]);
		const right = arithmeticExpression(step.right, [variable]);
		const scope = {[variable]: value};
		const a = left === undefined ? undefined : valueOf(left, scope);
		const b = right === undefined ? undefined : valueOf(right, scope);
		if (a === undefined || b === undefined || agrees(a, b, [])) return [];
		return [`equation step ${index + 1} (${step.left} = ${step.right}) does not hold for ${variable} = ${format(value)} (${format(a)} ≠ ${format(b)}).`];
	});
};

/**
 * Arithmetic slips in a lesson, card by card (s3-c2: …). A logic lesson is left out: its statements ("2 + 3 = 6") are
 * propositions to judge true or false. A prediction's worked equation may be a trap on purpose (squaring √x = −5
 * gives x = 25, which does not solve it), so only other cards' equations are checked.
 */
export const arithmeticIssues = (script: LessonScript): string[] =>
	/MANTIK|LOGIC/.test(script.topic.code)
		? []
		: script.lesson.sections.flatMap((section, sectionIndex) =>
				section.cards.flatMap((card, cardIndex) => {
					const where = `s${sectionIndex + 1}-c${cardIndex + 1}`;
					const visuals = [...('visual' in card && card.visual ? [card.visual] : []), ...(card.kind === 'question' && card.question.figure ? [card.question.figure] : [])];
					return [...cardArithmeticIssues(card), ...visuals.flatMap((visual) => (visual.kind === 'equation' && card.kind !== 'predict' ? equationIssues(visual) : []))].map((issue) => `${where}: ${issue}`);
				}),
			);
