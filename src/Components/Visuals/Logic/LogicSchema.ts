import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';
import {isFormula, lettersOf, parseFormula} from './Propositional';

/** A truth value written on a proposition: D (doğru), Y (yanlış) or ? (cannot be known from what is given). */
const TRUTH_MARK = z.enum(['D', 'Y', '?']);

/** The logic visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const LOGIC_VISUALS = [
	/**
	 * Logic: the square of opposition (karşıtlık karesi). The four propositions with the same subject and predicate,
	 * written out: `a` tümel olumlu, `e` tümel olumsuz, `i` tikel olumlu, `o` tikel olumsuz; `truth` may mark corners
	 * D (doğru), Y (yanlış) or ? (belirsiz) to work out the other values from one. Parts a, e, i, o, the relations
	 * karsitlik, altkarsitlik, altiklik, celisiklik, and deger (the truth marks).
	 */
	z.object({
		kind: z.literal('opposition'),
		a: plainText(48),
		e: plainText(48),
		i: plainText(48),
		o: plainText(48),
		truth: z.object({a: TRUTH_MARK.optional(), e: TRUTH_MARK.optional(), i: TRUTH_MARK.optional(), o: TRUTH_MARK.optional()}).default({}),
	}),
	/**
	 * Logic: a truth table the engine works out. `variables` are the proposition letters (p, q, r: 2, 4 or 8 rows);
	 * `columns` are formulas written as the textbook writes them (~p, p ∧ q, p ∨ q, p ⇒ q, p ⇔ q, brackets), each filled
	 * row by row; `label` replaces a long formula's header. `check` marks the deciding rows and writes the verdict:
	 * consistency and validity look at the last column, joint at all formula columns, equivalence at the last two.
	 * Parts v (letter columns), c1… (formula columns), r1… (rows), isaret (marked rows) and sonuc (verdict).
	 */
	z
		.object({
			kind: z.literal('truthTable'),
			variables: z
				.array(z.enum(['p', 'q', 'r', 's', 't']))
				.min(1)
				.max(3),
			columns: z
				.array(z.object({formula: z.string().trim().min(1).max(36).refine(isFormula, {message: 'Not a formula of p, q, r with ~ ∧ ∨ ⇒ ⇔ and brackets.'}), label: plainText(18).optional()}))
				.min(1)
				.max(5),
			check: z.enum(['none', 'consistency', 'validity', 'joint', 'equivalence']).default('none'),
		})
		.superRefine((visual, context) => {
			if (new Set(visual.variables).size !== visual.variables.length) context.addIssue({code: 'custom', path: ['variables'], message: 'Each letter once.'});
			visual.columns.forEach((column, index) => {
				if (!isFormula(column.formula)) return;
				const missing = lettersOf(parseFormula(column.formula)).filter((letter) => !visual.variables.includes(letter as 'p'));
				if (missing.length > 0) context.addIssue({code: 'custom', path: ['columns', index, 'formula'], message: `Add ${missing.join(', ')} to the variables.`});
			});
			if ((visual.check === 'joint' || visual.check === 'equivalence') && visual.columns.length < 2)
				context.addIssue({code: 'custom', path: ['check'], message: `A ${visual.check} check compares at least two formula columns.`});
		}),
	/**
	 * Logic: Euler circles. `pairs` relates two concepts' extensions, one panel each: `equal` (eşitlik), `apart`
	 * (ayrıklık), `inside` (tam girişimlik: `a` inside `b`), `overlap` (eksik girişimlik); the circles slide into the
	 * relation as the panel comes in. `nested` draws a syllogism's terms as circles one inside the other, outermost
	 * first, each with an optional role `note` (büyük terim); `point` drops an individual into the innermost circle and
	 * `conclusion` is written beside them. Use either `pairs` or `nested`. Parts p1… (panels), or n1…, nokta and sonuc.
	 */
	z
		.object({
			kind: z.literal('euler'),
			pairs: z
				.array(z.object({a: plainText(16), b: plainText(16), relation: z.enum(['equal', 'apart', 'inside', 'overlap']), caption: plainText(24).optional()}))
				.max(4)
				.default([]),
			nested: z
				.array(z.object({label: plainText(18), note: plainText(18).optional()}))
				.max(3)
				.default([]),
			point: z.object({label: plainText(16), note: plainText(18).optional()}).optional(),
			conclusion: plainText(44).optional(),
		})
		.superRefine((visual, context) => {
			const pairs = visual.pairs.length > 0;
			if (pairs === visual.nested.length > 0) context.addIssue({code: 'custom', path: ['pairs'], message: 'An Euler figure has either pairs or nested circles, not both or neither.'});
			if (!pairs && visual.nested.length < 2) context.addIssue({code: 'custom', path: ['nested'], message: 'Nested circles need at least two terms.'});
			if (pairs && (visual.point || visual.conclusion)) context.addIssue({code: 'custom', path: ['point'], message: 'A point and a conclusion go with nested circles only.'});
		}),
] as const;
