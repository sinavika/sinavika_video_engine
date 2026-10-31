/**
 * Measures social text without a browser, so a post's type can keep one size
 * and its text, pictures and numbers fixed places, and no line is ever cut or
 * pushed into a picture (owner, 29-30 Oct 2026: "punto sabitliği"; covers
 * first, then every social post).
 *
 * The tables hold the advance width of each letter of Manrope, the brand
 * face, at the three weights social text uses (body 500, strong 700,
 * display 800), in thousandths of the font size, read from the font files
 * (@fontsource-variable/manrope, latin and latin-ext) on 30 Oct 2026. They
 * ignore kerning, so a small margin is kept (FIT_MARGIN).
 */
const ADVANCE: Readonly<Record<500 | 700 | 800, Readonly<Record<string, number>>>> = {
	500: {"a": 563, "b": 600, "c": 561, "d": 601, "e": 591, "f": 362, "g": 600, "h": 604, "i": 249, "j": 263, "k": 510, "l": 249, "m": 865, "n": 604, "o": 601, "p": 600, "q": 601, "r": 374, "s": 531, "t": 412, "u": 605, "v": 523, "w": 779, "x": 536, "y": 538, "z": 531, "A": 646, "B": 620, "C": 724, "D": 681, "E": 575, "F": 510, "G": 715, "H": 697, "I": 249, "J": 476, "K": 612, "L": 518, "M": 846, "N": 696, "O": 732, "P": 616, "Q": 732, "R": 641, "S": 630, "T": 600, "U": 708, "V": 616, "W": 949, "X": 623, "Y": 574, "Z": 631, "ç": 561, "ö": 601, "ü": 605, "Ç": 724, "Ö": 732, "Ü": 708, "â": 563, "î": 249, "û": 605, "Â": 646, "Î": 249, "Û": 708, "ğ": 600, "ı": 249, "ş": 531, "Ğ": 714, "İ": 249, "Ş": 630, "0": 626, "1": 406, "2": 579, "3": 562, "4": 596, "5": 581, "6": 621, "7": 513, "8": 591, "9": 621, " ": 200, ".": 270, ",": 278, ":": 314, ";": 318, "!": 329, "?": 533, "'": 229, "’": 243, "\"": 417, "“": 399, "”": 399, "(": 435, ")": 435, "-": 420, "–": 540, "—": 780, "/": 403, "&": 657, "%": 901, "+": 575, "·": 240, "…": 658, "²": 404},
	700: {"a": 576, "b": 616, "c": 576, "d": 617, "e": 602, "f": 378, "g": 616, "h": 626, "i": 281, "j": 289, "k": 538, "l": 281, "m": 899, "n": 626, "o": 618, "p": 616, "q": 617, "r": 399, "s": 541, "t": 433, "u": 626, "v": 553, "w": 803, "x": 554, "y": 560, "z": 534, "A": 670, "B": 631, "C": 739, "D": 701, "E": 585, "F": 524, "G": 732, "H": 722, "I": 281, "J": 501, "K": 648, "L": 534, "M": 855, "N": 718, "O": 750, "P": 639, "Q": 750, "R": 661, "S": 658, "T": 607, "U": 720, "V": 641, "W": 976, "X": 656, "Y": 612, "Z": 664, "ç": 576, "ö": 618, "ü": 626, "Ç": 739, "Ö": 750, "Ü": 720, "â": 576, "î": 281, "û": 626, "Â": 670, "Î": 281, "Û": 720, "ğ": 616, "ı": 281, "ş": 542, "Ğ": 732, "İ": 281, "Ş": 658, "0": 658, "1": 438, "2": 596, "3": 582, "4": 609, "5": 586, "6": 622, "7": 534, "8": 613, "9": 621, " ": 200, ".": 304, ",": 304, ":": 343, ";": 344, "!": 361, "?": 553, "'": 261, "’": 285, "\"": 467, "“": 451, "”": 451, "(": 453, ")": 453, "-": 420, "–": 540, "—": 780, "/": 433, "&": 668, "%": 901, "+": 572, "·": 267, "…": 710, "²": 412},
	800: {"a": 583, "b": 624, "c": 583, "d": 625, "e": 608, "f": 386, "g": 624, "h": 636, "i": 296, "j": 301, "k": 552, "l": 296, "m": 916, "n": 636, "o": 627, "p": 624, "q": 625, "r": 412, "s": 547, "t": 444, "u": 636, "v": 568, "w": 814, "x": 563, "y": 570, "z": 535, "A": 683, "B": 637, "C": 746, "D": 710, "E": 590, "F": 530, "G": 741, "H": 734, "I": 296, "J": 513, "K": 665, "L": 541, "M": 860, "N": 729, "O": 758, "P": 650, "Q": 758, "R": 670, "S": 671, "T": 610, "U": 726, "V": 653, "W": 989, "X": 672, "Y": 630, "Z": 680, "ç": 583, "ö": 627, "ü": 636, "Ç": 746, "Ö": 758, "Ü": 726, "â": 583, "î": 296, "û": 636, "Â": 683, "Î": 296, "Û": 726, "ğ": 624, "ı": 296, "ş": 547, "Ğ": 741, "İ": 296, "Ş": 671, "0": 674, "1": 454, "2": 604, "3": 591, "4": 615, "5": 589, "6": 622, "7": 544, "8": 623, "9": 622, " ": 200, ".": 320, ",": 316, ":": 357, ";": 356, "!": 376, "?": 563, "'": 276, "’": 305, "\"": 492, "“": 477, "”": 477, "(": 462, ")": 462, "-": 420, "–": 540, "—": 780, "/": 448, "&": 674, "%": 900, "+": 570, "·": 280, "…": 736, "²": 416},
};

/** An unknown letter counts as a wide one. */
const FALLBACK_ADVANCE = 680;
/** Part of the box a line may fill: room for kerning and rounding. */
const FIT_MARGIN = 0.97;

/** How a text is set: size in pixels, weight (rounded up to a measured one, so a guess errs wide) and letter spacing in em. */
type TextSetting = {size: number; weight?: number; letterSpacingEm?: number};

const tableOf = (weight = 800) => ADVANCE[weight > 700 ? 800 : weight > 500 ? 700 : 500];

/** Width of `text` as set, in pixels. */
export const textWidth = (text: string, {size, weight, letterSpacingEm = 0}: TextSetting): number => {
	const table = tableOf(weight);
	const letters = [...text];
	return (letters.reduce((sum, letter) => sum + (table[letter] ?? FALLBACK_ADVANCE), 0) / 1000) * size + letterSpacingEm * size * letters.length;
};

/** How many lines a text takes in a box `box` pixels wide, wrapped at spaces and line breaks as the browser does; Infinity when one word alone is wider than the box. */
export const lineCount = (text: string, box: number, setting: TextSetting): number => {
	const room = box * FIT_MARGIN;
	let lines = 0;
	for (const paragraph of text.split('\n')) {
		lines += 1;
		let line = '';
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			if (textWidth(word, setting) > room) return Infinity;
			const trial = line ? `${line} ${word}` : word;
			if (textWidth(trial, setting) <= room) line = trial;
			else {
				lines += 1;
				line = word;
			}
		}
	}
	return lines;
};

/**
 * The largest of `steps` (largest first) at which every text fits the lines
 * that size may take (`linesAllowed`), with the lines the longest one takes:
 * one size for a whole series (a camp's covers, a carousel's pages). The
 * smallest step is used if none fits; the layout checks report that.
 */
export const seriesSize = (texts: readonly string[], steps: readonly number[], box: number, linesAllowed: (size: number) => number, setting: Omit<TextSetting, 'size'>): {size: number; lines: number} => {
	const linesAt = (size: number) => Math.max(1, ...texts.map((text) => lineCount(text, box, {...setting, size})));
	const size = steps.find((step) => linesAt(step) <= linesAllowed(step)) ?? steps[steps.length - 1];
	return {size, lines: Math.min(linesAt(size), linesAllowed(size))};
};

/** Why a text does not fit, for a checkLayout issue: "4 satır tutuyor (en çok 3)". */
export const overflowNote = (lines: number, allowed: number): string => (Number.isFinite(lines) ? `${lines} satır tutuyor (en çok ${allowed})` : 'satıra sığmayan bir kelime içeriyor');
