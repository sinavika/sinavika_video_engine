import {parseRichText} from './RichText';

/**
 * Turns on-screen rich text into text a Turkish speech synthesiser can read.
 * Common school-level formulas are verbalised ("x^2" becomes "x kare"). This
 * is a best effort: for anything intricate, give the line an explicit
 * `narration` instead of relying on it.
 */
const BRACED: [RegExp, string][] = [
	[/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, ' $1 bölü $2 '],
	[/\\sqrt\s*\{([^{}]*)\}/g, ' karekök $1 '],
	[/\\vec\s*\{([^{}]*)\}/g, ' $1 vektörü '],
	[/\\text\s*\{([^{}]*)\}/g, ' $1 '],
	[/\\underbrace\s*\{([^{}]*)\}\s*_\s*\{([^{}]*)\}/g, ' $1 , $2 '],
	[/\^\s*\{\s*\\circ\s*\}/g, ' derece '],
	[/\^\s*\{\s*2\s*\}/g, ' kare '],
	[/\^\s*\{\s*3\s*\}/g, ' küp '],
	[/\^\s*\{([^{}]*)\}/g, ' üssü $1 '],
	[/_\s*\{([^{}]*)\}/g, ' $1 '],
];

const SYMBOLS: [RegExp, string][] = [
	[/\|\s*([A-Z])\s*([A-Z])\s*\|/g, ' $1 $2 uzunluğu '],
	[/\^\s*\\circ/g, ' derece '],
	[/\^\s*2(?!\d)/g, ' kare '],
	[/\^\s*3(?!\d)/g, ' küp '],
	[/\^\s*(\S)/g, ' üssü $1 '],
	[/_\s*(\S)/g, ' $1 '],
	[/\\(cdot|times)/g, ' çarpı '],
	[/\\div/g, ' bölü '],
	[/\\neq/g, ' eşit değildir '],
	[/\\approx/g, ' yaklaşık '],
	[/\\leq/g, ' küçük eşit '],
	[/\\geq/g, ' büyük eşit '],
	[/\\pm/g, ' artı eksi '],
	[/\\pi/g, ' pi '],
	[/=/g, ' eşittir '],
	[/\+/g, ' artı '],
	[/-/g, ' eksi '],
	[/</g, ' küçüktür '],
	[/>/g, ' büyüktür '],
	[/\//g, ' bölü '],
	[/\(/g, ' parantez içinde '],
	[/\)/g, ' , '],
	[/\\[a-zA-Z]+/g, ' '],
	[/[{}\\;!]/g, ' '],
];

const PLAIN_TEXT: [RegExp, string][] = [
	[/(\d)\s*dk\b/g, '$1 dakika'],
	[/(\d)\s*sn\b/g, '$1 saniye'],
	[/(\d)\s*cm\b/g, '$1 santimetre'],
	[/(\d)\s*kg\b/g, '$1 kilogram'],
	[/(\d)\s*m\b/g, '$1 metre'],
	[/\s*→\s*/g, ', '],
	[/\s*[·•]\s*/g, ', '],
	[/\s+[–—]\s+/g, ', '],
	[/(\d)\s*[–—-]\s*(?=\d)/g, '$1, '],
];

const replaceAll = (source: string, rules: [RegExp, string][]): string =>
	rules.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), source);

export const verbalizeLatex = (latex: string): string => {
	let spoken = latex;
	// Innermost groups first, until nothing with braces is left to rewrite.
	for (let pass = 0; pass < 6; pass++) {
		const next = replaceAll(spoken, BRACED);
		if (next === spoken) break;
		spoken = next;
	}
	return replaceAll(spoken, SYMBOLS);
};

export const toSpokenText = (richText: string | undefined): string => {
	if (!richText) return '';
	const spoken = parseRichText(richText)
		.map((segment) =>
			segment.kind === 'math' || segment.kind === 'displayMath' ? ` ${verbalizeLatex(segment.value)} ` : segment.value,
		)
		.join('');
	// Units and dashes are handled after joining, because the number is often inside a formula
	// while its unit is plain text ("$5$ m").
	return replaceAll(spoken.replace(/\s+/g, ' '), PLAIN_TEXT)
		.replace(/\s+/g, ' ')
		.replace(/\s+([,.:;!?])/g, '$1')
		.replace(/,\s*([,.:;!?])/g, '$1')
		.trim();
};

/** Joins sentences, adding a full stop where one is missing. */
export const sentences = (...parts: (string | undefined | false)[]): string =>
	parts
		.filter((part): part is string => Boolean(part && part.trim()))
		.map((part) => (/[.!?:]$/.test(part.trim()) ? part.trim() : `${part.trim()}.`))
		.join(' ');

/** Lower-cases the first letter with Turkish casing rules ("İlk" becomes "ilk"). */
export const lowerFirst = (text: string): string =>
	text.charAt(0).toLocaleLowerCase('tr') + text.slice(1);
