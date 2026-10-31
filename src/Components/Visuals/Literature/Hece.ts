// ---------------------------------------------------------------- Turkish syllables, for counting and stopping lines of verse

const VOWELS = 'aeıioöuüâîûAEIİOÖUÜÂÎÛ';
const isVowel = (letter: string) => VOWELS.includes(letter);
const isLetter = (letter: string) => /\p{L}/u.test(letter);

/** A line's syllable count: one syllable per vowel (Turkish has no diphthongs); punctuation and apostrophes do not count. */
export const syllableCount = (line: string): number => [...line].filter(isVowel).length;

/**
 * The syllables of one word, split as Turkish splits them: a single consonant between vowels starts the next syllable
 * (ka-pı), two are shared (er-ken), three leave one for the next (Türk-çe). Letters only; the word's own text is kept.
 */
export const syllablesOf = (word: string): string[] => {
	const letters = [...word];
	const vowels = letters.map((letter, index) => (isVowel(letter) ? index : -1)).filter((index) => index >= 0);
	if (vowels.length <= 1) return [word];
	const cuts: number[] = [];
	for (let k = 0; k < vowels.length - 1; k++) {
		const between = letters.slice(vowels[k] + 1, vowels[k + 1]).filter(isLetter).length;
		// Where the next syllable starts: right after the vowel, before the last consonant, or before the last of three.
		cuts.push(between === 0 ? vowels[k] + 1 : vowels[k + 1] - 1);
	}
	const parts: string[] = [];
	let start = 0;
	for (const cut of cuts) {
		parts.push(letters.slice(start, cut).join(''));
		start = cut;
	}
	parts.push(letters.slice(start).join(''));
	return parts;
};

/**
 * Where a line of syllabic verse stops (durak): after `after` syllables, counted word by word. A stop never splits a
 * word (kelimeler bölünmez): it falls after the word in which the count is reached. Returns character offsets into the
 * line, one per stop, or -1 for a stop the line cannot take.
 */
export const stopOffsets = (line: string, after: number[]): number[] => {
	const words = [...line.matchAll(/\S+/g)].map((match) => ({end: (match.index ?? 0) + match[0].length, count: syllableCount(match[0])}));
	return after.map((target) => {
		let total = 0;
		for (const word of words) {
			total += word.count;
			if (total === target) return word.end;
			if (total > target) return -1;
		}
		return -1;
	});
};

/**
 * Where the marked words of a line stand (the words an ÖSYM question underlines, the two sides of a simile): the first
 * occurrence of each mark after the previous one, as [start, end) offsets, or undefined when a mark is not in the text.
 */
export const markRanges = (text: string, marks: string[]): [number, number][] | undefined => {
	const ranges: [number, number][] = [];
	let from = 0;
	for (const mark of marks) {
		const start = text.indexOf(mark, from);
		if (start < 0) return undefined;
		ranges.push([start, start + mark.length]);
		from = start + mark.length;
	}
	return ranges;
};

/** The end of a line split into what comes before, the rhyme and the redif (each '' when absent), punctuation kept outside. */
export const splitLineEnd = (line: string, rhyme?: string, redif?: string): {before: string; rhyme: string; redif: string; after: string} | undefined => {
	const trailing = /[\s.,;:!?…"'’”)]*$/u.exec(line)?.[0] ?? '';
	let core = line.slice(0, line.length - trailing.length);
	const lower = (text: string) => text.toLocaleLowerCase('tr');
	let redifPart = '';
	if (redif) {
		if (!lower(core).endsWith(lower(redif))) return undefined;
		redifPart = core.slice(core.length - redif.length);
		core = core.slice(0, core.length - redif.length);
	}
	let rhymePart = '';
	if (rhyme) {
		if (!lower(core).endsWith(lower(rhyme))) return undefined;
		rhymePart = core.slice(core.length - rhyme.length);
		core = core.slice(0, core.length - rhyme.length);
	}
	return {before: core, rhyme: rhymePart, redif: redifPart, after: trailing};
};
