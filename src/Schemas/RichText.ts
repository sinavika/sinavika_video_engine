import katex from 'katex';
import {z} from 'zod';

/**
 * Rich text is a plain string with three inline conventions:
 *   $...$     inline LaTeX
 *   $$...$$   display LaTeX on its own line
 *   **...**   emphasis
 * A literal dollar sign is written as \$.
 */
type RichTextSegment = {
	kind: 'text' | 'strong' | 'math' | 'displayMath';
	value: string;
};

export const KATEX_OPTIONS = {output: 'html', strict: false, throwOnError: true} as const;

/**
 * A word with Turkish letters inside a formula (Ç for a perimeter, d_{sıvı}): KaTeX's math fonts have no Ç, ı or ş and
 * set them as a letter with a loose accent drawn over the next glyph. Such a word is set upright as text instead.
 */
const TURKISH_WORD = /[A-Za-zÇĞİÖŞÜçğıöşü]*[ÇĞİÖŞÜçğıöşü][A-Za-zÇĞİÖŞÜçğıöşü]*/g;

/**
 * A degree sign typed into a formula ("40° + 35°") is set by KaTeX as a loose, low glyph with a gap; written as
 * a superscript circle it sits where geometry books put it. The empty group keeps it from clashing with an
 * exponent already there ("a^2°").
 */
export const normalizeLatex = (latex: string): string =>
	// Inside \text{…} (a unit such as "cal/g°C") a superscript is not allowed; the glyph is left as typed there.
	latex
		.split(/(\\text\{[^{}]*\})/)
		.map((part) => (part.startsWith('\\text{') ? part : part.replace(/°/g, '{}^{\\circ}').replace(TURKISH_WORD, (word) => `\\text{${word}}`)))
		.join('');

const ESCAPED_DOLLAR = '';
const SEGMENT_PATTERN = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\*\*[^*\n]+?\*\*)/g;

export const parseRichText = (source: string): RichTextSegment[] => {
	const restore = (value: string, replacement: string) =>
		value.split(ESCAPED_DOLLAR).join(replacement);

	return source
		.replace(/\\\$/g, ESCAPED_DOLLAR)
		.split(SEGMENT_PATTERN)
		.filter((part) => part.length > 0)
		.flatMap((part): RichTextSegment[] => {
			// A formula inside emphasis ("**$p$ doğru**"): the formula stays a formula and the words around it stay
			// emphasised. Read as one emphasis it was drawn and voiced with its dollar signs.
			if (part.startsWith('**') && part.endsWith('**') && part.length > 4 && /\$[^$\n]+?\$/.test(part.slice(2, -2))) {
				return parseRichText(part.slice(2, -2)).map((segment) => (segment.kind === 'text' ? {...segment, kind: 'strong'} : segment));
			}
			return [segmentOf(part)];
		});

	function segmentOf(part: string): RichTextSegment {
		if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
			return {kind: 'displayMath', value: normalizeLatex(restore(part.slice(2, -2).trim(), '\\$'))};
		}
		if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
			return {kind: 'math', value: normalizeLatex(restore(part.slice(1, -1).trim(), '\\$'))};
		}
		if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
			return {kind: 'strong', value: restore(part.slice(2, -2), '$')};
		}
		return {kind: 'text', value: restore(part, '$')};
	}
};

export const findLatexError = (latex: string): string | null => {
	try {
		katex.renderToString(latex, KATEX_OPTIONS);
		return null;
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	}
};

export const findRichTextErrors = (source: string): string[] => {
	const errors: string[] = [];
	for (const segment of parseRichText(source)) {
		if (segment.kind === 'text' && segment.value.includes('$')) {
			errors.push('Unbalanced "$": close the formula or write a literal dollar as "\\$".');
		}
		if (segment.kind === 'math' || segment.kind === 'displayMath') {
			const error = findLatexError(segment.value);
			if (error) errors.push(`Invalid LaTeX "${segment.value}": ${error}`);
		}
	}
	return errors;
};

/** A length-limited string whose formulas are checked at validation time, not at render time. */
export const richText = (maxLength: number) =>
	z
		.string()
		.trim()
		.min(1)
		.max(maxLength)
		.superRefine((value, context) => {
			for (const message of findRichTextErrors(value)) {
				context.addIssue({code: 'custom', message});
			}
		});

/** A string that is LaTeX in its entirety (no surrounding dollars). */
export const latex = (maxLength = 300) =>
	z
		.string()
		.trim()
		.min(1)
		.max(maxLength)
		.superRefine((value, context) => {
			const error = findLatexError(value);
			if (error) context.addIssue({code: 'custom', message: `Invalid LaTeX: ${error}`});
		});

/** Plain single-line text such as titles and labels. */
export const plainText = (maxLength: number) => z.string().trim().min(1).max(maxLength);
