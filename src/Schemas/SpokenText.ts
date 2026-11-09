import {readMath} from './MathSpeech';
import {parseRichText} from './RichText';

/**
 * Turns on-screen rich text into text a Turkish speech synthesiser can read.
 * Formulas are read by MathSpeech the way a teacher says them ("x^2" is
 * "x kare", "\lim_{x\to 2}" "x 2'ye giderken limit"); the words around them,
 * units and dashes are handled here.
 */
// The replacer has String.replace's own signature: groups, then the offset and the whole text.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpokenRule = [RegExp, string | ((match: string, ...groups: any[]) => string)];

const COMPASS: Record<string, string> = {K: 'kuzey', G: 'güney', D: 'doğu', B: 'batı'};
/** "14.20" is "on dört yirmi", "09.00" "dokuz", "08.05" "sekiz sıfır beş". */
const spokenClock = (hours: string, minutes: string): string => {
	const hour = Number(hours) === 0 ? 'sıfır' : turkishCardinal(Number(hours));
	if (minutes === '00') return hour;
	return Number(minutes) < 10 ? `${hour} sıfır ${turkishCardinal(Number(minutes))}` : `${hour} ${turkishCardinal(Number(minutes))}`;
};

/** Geography: "23°27' K" is "23 derece 27 dakika kuzey", "45° D" "45 derece doğu", "25°C" "25 derece". Also applied to narration (pronounceAbbreviations). */
const DEGREES: SpokenRule[] = [
	[/(\d+)\s*°\s*(\d+)\s*['’′](?:\s*([KGDB])(?!\p{L}))?/gu, (_, degrees, minutes, side) => `${degrees} derece ${minutes} dakika${side ? ` ${COMPASS[side]}` : ''}`],
	[/(\d+)\s*°\s*([KGDB])(?!\p{L})/gu, (_, degrees, side) => `${degrees} derece ${COMPASS[side]}`],
	[/(\d+)\s*°\s*C(?!\p{L})/gu, '$1 derece'],
	[/(\d+)\s*°/g, '$1 derece'],
];

/** Clock times "14.20", "09.00" (a dot between hours and minutes, as Turkish writes them). */
const CLOCK: SpokenRule = [/(?<!\d|\d[.,])([01]?\d|2[0-3])\.([0-5]\d)(?!\d|[.,]\d)/g, (_, hours, minutes) => spokenClock(hours, minutes)];

const SPEEDS: SpokenRule[] = [
	[/(\d+(?:[.,]\d+)?)\s*km\/sa\.?/g, 'saatte $1 kilometre'],
	[/(\d+(?:[.,]\d+)?)\s*m\/sn\.?/g, 'saniyede $1 metre'],
];

const PERCENT: SpokenRule[] = [
	[/‰\s*(\d+(?:[.,]\d+)?)/g, 'binde $1'],
	[/%\s*(\d+(?:[.,]\d+)?)/g, 'yüzde $1'],
	[/(\d+(?:[.,]\d+)?)\s*%/g, 'yüzde $1'],
];

/** A unit ends where no letter follows: \b treats Turkish letters as boundaries, so "3 mü" became "3 metreü". */
const UNITS: SpokenRule[] = [
	[/(\d+(?:[.,]\d+)?)\s*g\/m³/g, 'metreküpte $1 gram'],
	[/(\d)\s*mm(?!\p{L})/gu, '$1 milimetre'],
	[/(\d)\s*km²/gu, '$1 kilometrekare'],
	[/(\d)\s*cm²/gu, '$1 santimetrekare'],
	[/(\d)\s*m²/gu, '$1 metrekare'],
	[/(\d)\s*km(?![\p{L}/²])/gu, '$1 kilometre'],
	[/(\d)\s*dk(?!\p{L})/gu, '$1 dakika'],
	[/(\d)\s*sn(?!\p{L})/gu, '$1 saniye'],
	[/(\d)\s*cm(?!\p{L})/gu, '$1 santimetre'],
	[/(\d)\s*kg(?!\p{L})/gu, '$1 kilogram'],
	[/(\d)\s*m(?!\p{L})/gu, '$1 metre'],
];

const PLAIN_TEXT: SpokenRule[] = [
	...DEGREES,
	CLOCK,
	...SPEEDS,
	// Short answers written without LaTeX ("6√2", "3/7").
	[/(\d*)\s*√\s*(\d+)/g, '$1 karekök $2'],
	[/(?<![\d/])(\d+)\/(\d+)(?![\d/])/g, '$1 bölü $2'],
	[/([\p{L}\d)])\s+\+\s+(?=[\p{L}\d(])/gu, '$1 artı '],
	...PERCENT,
	...UNITS,
	[/\s*→\s*/g, ', '],
	[/\s*[·•]\s*/g, ', '],
	[/\s+[–—]\s+/g, ', '],
	[/(\d)\s*[–—-]\s*(?=\d)/g, '$1, '],
	// Genetics: crosses, the Rh factor, genotypes spelled allele by allele (spokenGenotype). Last, after the units.
	[/\s*×\s*/g, ' çarpı '],
	[/(?<!\p{L})Rh\s*(?:⁺|\+)(?![\p{L}\d])/gu, 're ha pozitif'],
	[/(?<!\p{L})Rh\s*(?:⁻|−|-)(?![\p{L}\d])/gu, 're ha negatif'],
	[/(?<!\p{L})Rh(?!\p{L})/gu, 're ha'],
	[/(?<![\p{L}\d^])((?:[A-Za-z](?:\^[A-Za-z0-9])?)+)(?![\p{L}\d^])/gu, (match, word: string, offset: number, whole: string) => spokenGenotype(word, whole[offset + word.length]) ?? match],
];

/** Turkish letter names, as a teacher spells alleles aloud: "be", "se", "re"; X is "iks". */
const LETTER_NAMES: Record<string, string> = {A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'fe', G: 'ge', H: 'he', I: 'ı', J: 'je', K: 'ke', L: 'le', M: 'me', N: 'ne', O: 'o', P: 'pe', Q: 'ku', R: 're', S: 'se', T: 'te', U: 'u', V: 've', W: 've', X: 'iks', Y: 'ye', Z: 'ze'};
const cased = (letter: string) => `${letter === letter.toUpperCase() ? 'büyük' : 'küçük'} ${LETTER_NAMES[letter.toUpperCase()]}`;

/**
 * Genetics: a genotype is spelled allele by allele, as a teacher reads it: "Aa" is "büyük a küçük a", "aaBb" "küçük a
 * küçük a büyük be küçük be", "X^RX^r" "iks büyük re, iks küçük re", "X^rY" "iks küçük re, ye", "XY" "iks ye";
 * blood-group and codominant pairs have no case to tell apart ("AO" is "a o", "MN" "me ne"). Only genotypes: alleles
 * paired gene by gene, a sex chromosome with its allele, or XX and XY. Anything else (Roman numerals, "XX." before a
 * century, abbreviations, a lone letter) is left as it is: undefined.
 */
const spokenGenotype = (word: string, next: string | undefined): string | undefined => {
	const alleles = [...word.matchAll(/([A-Za-z])(?:\^([A-Za-z0-9]))?/g)].map((match) => ({base: match[1], sup: match[2]}));
	const sex = (base: string) => base === 'X' || base === 'Y';
	if (word.includes('^') || (/^X[XY]$/.test(word) && next !== '.')) {
		if (!alleles.every((allele) => sex(allele.base))) return undefined;
		return alleles.map((allele) => `${LETTER_NAMES[allele.base]}${allele.sup ? ` ${cased(allele.sup)}` : ''}`).join(alleles.some((allele) => allele.sup) ? ', ' : ' ');
	}
	if (alleles.length < 2 || alleles.length % 2 || /^[IVXL]+$/.test(word)) return undefined;
	const genes: string[] = [];
	for (let i = 0; i < alleles.length; i += 2) {
		const [a, b] = [alleles[i].base, alleles[i + 1].base];
		if (a.toLowerCase() === b.toLowerCase()) genes.push(`${cased(a)} ${cased(b)}`);
		else if (/^(?:[ABO]{2}|MN|NM)$/.test(a + b)) genes.push(`${LETTER_NAMES[a]} ${LETTER_NAMES[b]}`);
		else return undefined;
	}
	return genes.join(' ');
};

/**
 * Exam abbreviations and brand names are said as Turkish speakers say them,
 * not spelled letter by letter or read as a word: "TYT" is "teyete" (owner,
 * 25 Oct 2026: the voice got it wrong). On screen the abbreviation stays.
 * A suffix joins the reading without its apostrophe, so it is said as one
 * word: "YKS'nin" is read "yekasenin", "TYT'de" "teyetede". With the
 * apostrophe the voice paused inside the word and "yekase" did not come
 * through (owner, 26 Oct 2026). Add a new abbreviation here, never in a script.
 */
const ABBREVIATIONS: SpokenRule[] = [
	[/\bYKS(?:['’](?=\p{L}))?\b/gu, 'yekase'],
	[/\bKPSS(?:['’](?=\p{L}))?\b/gu, 'kapesese'],
	[/\bTYT(?:['’](?=\p{L}))?\b/gu, 'teyete'],
	[/\bAYT(?:['’](?=\p{L}))?\b/gu, 'ayete'],
	[/\bYDT(?:['’](?=\p{L}))?\b/gu, 'yedete'],
	// "Sino Ey Ay", its suffix kept as written ("Sino Ey Ay’ye"). The owner listened on 31 Oct 2026 to this, the
	// reels' "Sino Eyay" and a joined "Sinoeyay" (Outputs/Checks/VoiceTests/okunus-ornegi) and chose this one.
	[/\bSinoAI\b/g, 'Sino Ey Ay'],
	// "PDF'in" is "Pidiyefin" (owner, Oct 2026: the voice spelled it out). Until 31 Oct this lived in single scripts.
	[/\bPDF(?:['’](?=\p{L}))?\b/gu, 'Pidiyef'],
	// The site is read as Turkish speakers say it; its suffix keeps the apostrophe, as approved in the ads
	// ("sinavika.com’da" → "Sınavika nokta kom’da"). Until 31 Oct each ad wrote this in its own script.
	[/\b(?:www\.)?sinavika\.com\b/giu, 'Sınavika nokta kom'],
	// Groups of states named by a letter and a number are said that way: "D-8" is "De Sekiz", "G20" "Ge Yirmi"
	// (KPSS Vatandaşlık 9, Güncel Bilgiler); the suffix joins the number: "G20'nin" → "Ge Yirminin".
	[/\bD-8(?:['’](?=\p{L})|(?![\p{L}\p{N}]))/gu, 'De Sekiz'],
	[/\bG-?20(?:['’](?=\p{L})|(?![\p{L}\p{N}]))/gu, 'Ge Yirmi'],
	[/\bG-?7(?:['’](?=\p{L})|(?![\p{L}\p{N}]))/gu, 'Ge Yedi'],
	// History dates: "MÖ 680" is "milattan önce 680".
	[/(?<![\p{L}])MÖ(?![\p{L}])/gu, 'milattan önce'],
	[/(?<![\p{L}])MS(?=\s*\d)/gu, 'milattan sonra'],
	// "Hz. Ali" is "Hazreti Ali"; a frequency ("50 Hz.") stays hertz.
	[/(?<!\d\s?)(?<![\p{L}])Hz\.(?=\s?\p{Lu})/gu, 'Hazreti'],
];

const replaceAll = (source: string, rules: readonly (SpokenRule | [RegExp, string])[]): string =>
	rules.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement as string), source);

const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
const ORDINAL_OF: Record<string, string> = {
	bir: 'birinci', iki: 'ikinci', üç: 'üçüncü', dört: 'dördüncü', beş: 'beşinci', altı: 'altıncı', yedi: 'yedinci', sekiz: 'sekizinci', dokuz: 'dokuzuncu',
	on: 'onuncu', yirmi: 'yirminci', otuz: 'otuzuncu', kırk: 'kırkıncı', elli: 'ellinci', altmış: 'altmışıncı', yetmiş: 'yetmişinci', seksen: 'sekseninci', doksan: 'doksanıncı',
};

/** 1 → "bir", 15 → "on beş", 40 → "kırk" (1 to 99), as the narrator says it. */
export const turkishCardinal = (value: number): string => {
	if (!Number.isInteger(value) || value < 1 || value > 99) throw new Error(`No Turkish number word for ${value}.`);
	return [TENS[Math.floor(value / 10)], ONES[value % 10]].filter(Boolean).join(' ');
};

/** 1 → "birinci", 15 → "on beşinci", 40 → "kırkıncı" (1 to 99), as the narrator says it. */
export const turkishOrdinal = (value: number): string => {
	if (!Number.isInteger(value) || value < 1 || value > 99) throw new Error(`No Turkish ordinal for ${value}.`);
	const tens = TENS[Math.floor(value / 10)];
	const ones = ONES[value % 10];
	return ones ? [tens, ORDINAL_OF[ones]].filter(Boolean).join(' ') : ORDINAL_OF[tens];
};

/** A Roman numeral up to XXXIX, never an empty match: "XIX". */
export const ROMAN_NUMERAL = String.raw`(?=[IVX])(?:X{0,3}(?:IX|IV|V?I{0,3}))`;

/** "XIX" → 19. */
export const romanValue = (roman: string): number => {
	const value: Record<string, number> = {I: 1, V: 5, X: 10};
	return [...roman].reduce((total, letter, index) => (value[letter] < (value[roman[index + 1]] ?? 0) ? total - value[letter] : total + value[letter]), 0);
};

/**
 * A Roman ordinal before a word is said as a word: "II. Murat" → "ikinci Murat", "XX. Yüzyıl" →
 * "yirminci Yüzyıl". Lesson titles and section titles reach the voice this way (28 Oct 2026).
 */
const ROMAN_ORDINAL = new RegExp(String.raw`(?<![\p{L}\p{N}])(${ROMAN_NUMERAL})\.(?=\s)`, 'gu');
export const spokenRomanOrdinals = (text: string): string => text.replace(ROMAN_ORDINAL, (match, roman: string) => (roman ? turkishOrdinal(romanValue(roman)) : match));

/**
 * Premise numbers are said as numbers, the way a teacher reads a test: "I ve III'tür" → "bir ve üçtür", "yalnız II" →
 * "yalnız iki", "IV de yanlıştır" → "dört de yanlıştır", "IV'üncü" → "dördüncü". Before 2 Nov 2026 they reached the
 * voice as letters, and the last one in "Doğru cevap I ve II. Cevap C." was read as "ikinci".
 * Left alone: a list whose first number has a dot ("I. ve II. Dünya Savaşı"), a numeral inside a name ("VIII"), a
 * lone V (a shape, a volume, volts: "V biçimli", "q V'dir", "12 V'luk"), a lone I with a back-vowel suffix (a point or
 * a current: "I'da kesişir", "I'nın büyüdüğü"; the number takes "birde", "birdir"), and letters among points or arrows
 * ("E I, I F", "A→I, I→I").
 */
const PREMISE = String.raw`(?:IV|V|I{1,3})`;
const PREMISE_WORDS: Record<string, string> = {I: 'bir', II: 'iki', III: 'üç', IV: 'dört', V: 'beş'};
/** Not inside a word, not after an arrow or a lone capital (a point's name: "E I"). */
const PREMISE_START = String.raw`(?<![\p{L}\p{N}'’→=_/\-$\\{}^])(?<!(?:^|[^\p{L}])\p{Lu}\s)`;
const PREMISE_SUFFIX = String.raw`(?:['’]\p{Ll}+)?`;
const PREMISE_END = String.raw`(?![\p{L}\p{N}→=_$}^])(?!\s\p{Lu}(?![\p{L}]))`;
const PREMISE_JOIN = String.raw`(?:\s*,\s*|\s+(?:ve|ile|veya|ya da|[-–])\s+)`;
const PREMISE_PATTERNS: readonly RegExp[] = [
	// A list: "I ve II", "I, II ve III'tür", "II ile IV", "II - IV - I - III".
	new RegExp(String.raw`${PREMISE_START}${PREMISE}${PREMISE_SUFFIX}(?![.\p{L}\p{N}→=])(?:${PREMISE_JOIN}${PREMISE}${PREMISE_SUFFIX}${PREMISE_END})+`, 'gu'),
	// One number with a suffix: "I'dir", "III'ü", "IV'üncü", "II.'de" (the second quadrant); a lone V only as an ordinal ("V'inci").
	new RegExp(String.raw`${PREMISE_START}(?:(?:IV|I{1,3})\.?['’]\p{Ll}+|V['’]inci)(?![\p{L}\p{N}])`, 'gu'),
	// One number after "yalnız" or "öncül": "yalnız I", "Yalnız V".
	new RegExp(String.raw`(?<=(?:[Yy]alnız|[Öö]ncül)\s)${PREMISE}(?![\p{L}\p{N}])`, 'gu'),
	// One number before "numaralı", or II, III, IV before "de"/"da" ("IV de"; a lone I or V there is a current or a volume).
	new RegExp(String.raw`${PREMISE_START}${PREMISE}(?=\snumaralı(?![\p{L}\p{N}]))`, 'gu'),
	new RegExp(String.raw`${PREMISE_START}(?:IV|I{2,3})(?=\s(?:de|da)(?![\p{L}\p{N}]))`, 'gu'),
	// A cell division stage: "mayoz I", "profaz I", "metafaz II" are said "mayoz bir", "metafaz iki".
	new RegExp(String.raw`(?<=(?:[Mm]ayoz|[Pp]rofaz|[Mm]etafaz|[Aa]nafaz|[Tt]elofaz)\s)I{1,2}${PREMISE_SUFFIX}(?![\p{L}\p{N}])`, 'gu'),
	// A number judged: "I doğru", "IV yanlış", "I değil", "III elenir" (not "I doğru orantılı", a current).
	new RegExp(String.raw`${PREMISE_START}(?:IV|I{1,3})(?=\s(?:doğru(?:dur)?(?!\sorantı)|yanlış(?:tır)?|değil(?:dir)?|elenir)(?![\p{L}]))`, 'gu'),
	// II, III and IV alone are numbers wherever they stand ("(III)", "II, ince liflerde"); with a dot they are ordinals.
	new RegExp(String.raw`${PREMISE_START}(?:IV|I{2,3})(?![.\p{L}\p{N}'’→=_/-])`, 'gu'),
	// II, III or IV alone in brackets: "(III)", "demir(III) oksit".
	new RegExp(String.raw`(?<=\()(?:IV|I{2,3})(?=\))`, 'gu'),
	// A number that ends the text, or follows a comparison, keeps its full stop: "üç > bir = II.", "Cevap II."
	new RegExp(String.raw`(?:(?<=[=<>]\s)${PREMISE}|${PREMISE_START}(?:IV|I{2,3}))(?=\.\s*$)`, 'gu'),
	new RegExp(String.raw`(?<=[=<>]\s)${PREMISE}(?=\.\s)`, 'gu'),
];
/** One number in a match, with its suffix; a dot is dropped only before a suffix ("II.'de"), never a sentence's full stop. */
const PREMISE_TOKEN = /(IV|V|I{1,3})(?:\.(?=['’]))?(?:['’](\p{Ll}+))?/gu;
/** The numbers bir, iki, üç, dört, beş take front-vowel suffixes; a back vowel means the letter was meant. */
const FRONT_SUFFIX = /^[^aıouâû]*[eiöüî]/u;
const premiseWord = (roman: string, suffix?: string): string | undefined => {
	if (!suffix) return PREMISE_WORDS[roman];
	if (!FRONT_SUFFIX.test(suffix)) return undefined;
	// "dört" softens before a vowel: dördüncü, dördü.
	const word = roman === 'IV' && /^[eiöüıuaoâîû]/u.test(suffix) ? 'dörd' : PREMISE_WORDS[roman];
	return `${word}${suffix}`;
};
/** II, III or IV standing alone in a sentence: the sentence talks about premises. */
const NAMES_PREMISES = new RegExp(String.raw`${PREMISE_START}(?:IV|I{2,3})(?![.\p{L}\p{N}→=_$}^])`, 'u');
/** I or V alone, not before a dot, an arrow or a lone capital (a point): "I Sibirya", "I:", "V **çalıştık**". */
const LONE_I_OR_V = new RegExp(String.raw`${PREMISE_START}[IV](?![.\p{L}\p{N}'’→=_$}^])(?!\s\p{Lu}(?![\p{L}]))`, 'gu');
/** In a sentence that names II, III or IV, a lone I or V is a premise too ("I Sibirya, III Amazon, V Avustralya"). */
const lonePremises = (text: string): string =>
	text
		// In a text that names II, III or IV, "(I)" and "(V)" are premises too; alone they may be a point or a unit ("(I)", "V (V)").
		.replace(/(?<=\()[IV](?=\))/gu, (roman) => (NAMES_PREMISES.test(text) ? PREMISE_WORDS[roman] : roman))
		.replace(/[^.!?]+[.!?]*/gu, (sentence) => (NAMES_PREMISES.test(sentence) ? sentence.replace(LONE_I_OR_V, (roman) => PREMISE_WORDS[roman]) : sentence));
export const spokenPremiseNumbers = (text: string): string =>
	PREMISE_PATTERNS.reduce(
		(said, pattern) =>
			said.replace(pattern, (match) => {
				const tokens = [...match.matchAll(PREMISE_TOKEN)];
				if (tokens.some((token) => premiseWord(token[1], token[2]) === undefined)) return match;
				return match.replace(PREMISE_TOKEN, (_, roman: string, suffix?: string) => premiseWord(roman, suffix) ?? roman);
			}),
		lonePremises(text),
	);

/** A formula alone, as it is read: no pause at its end. */
export const verbalizeLatex = (latex: string): string => readMath(latex).replace(/,$/, '');

/** Text about sets or events: a capital with a prime is a complement ("A tümleyen"), elsewhere a prime ("B üssü"). */
const SET_WORDS = /küme|tümleyen|eleman|olasılı/iu;

/**
 * Rich text with its formulas read aloud and the words around them left as they are. A suffix written after a
 * formula stays on it: "$50°$'dir" is "50 derece'dir", not "50 derece 'dir" (the voice paused before a lone
 * "'dir", 29 Oct 2026); the pause that closes a formula goes before it.
 */
const withFormulasRead = (richText: string): string => {
	const segments = parseRichText(richText);
	const sets = SET_WORDS.test(richText);
	return segments
		.map((segment, index) => {
			// A formula in bold, "**$P(a)$**", is read too (it reached the voice as LaTeX before 29 Oct 2026).
			if (segment.kind === 'strong') return segment.value.includes('$') ? withFormulasRead(segment.value) : segment.value;
			if (segment.kind !== 'math' && segment.kind !== 'displayMath') return segment.value;
			const suffixed = /^['’]\p{L}/u.test(segments[index + 1]?.value ?? '');
			const reading = readMath(segment.value, {sets, sayNumber: spokenNumbers});
			return suffixed ? ` ${reading.replace(/,$/, '')}` : ` ${reading} `;
		})
		.join('');
};

export const toSpokenText = (richText: string | undefined): string => {
	if (!richText) return '';
	const spoken = withFormulasRead(richText);
	// Units and dashes are handled after joining, because the number is often inside a formula
	// while its unit is plain text ("$5$ m").
	return replaceAll(spoken.replace(/\s+/g, ' '), PLAIN_TEXT)
		.replace(/\s+/g, ' ')
		.replace(/\s+([,.:;!?])/g, '$1')
		.replace(/,\s*([,.:;!?])/g, '$1')
		.trim()
		// A formula that ends the text leaves no pause mark behind: "$(f \circ g)(2)$" ends on "2", not "2,".
		.replace(/,$/, '');
};

const SCALES = ['', 'bin', 'milyon', 'milyar', 'trilyon'];

/** 0 → "sıfır", 1912 → "bin dokuz yüz on iki", 52718 → "elli iki bin yedi yüz on sekiz", 2000000 → "iki milyon". */
export const turkishNumber = (value: number): string => {
	if (!Number.isSafeInteger(value) || value < 0 || value >= 1e15) throw new Error(`No Turkish number word for ${value}.`);
	if (value === 0) return 'sıfır';
	const parts: string[] = [];
	for (let rest = value, scale = 0; rest > 0; rest = Math.floor(rest / 1000), scale++) {
		const chunk = rest % 1000;
		if (chunk === 0) continue;
		const hundreds = Math.floor(chunk / 100);
		const words = [hundreds ? `${hundreds > 1 ? `${ONES[hundreds]} ` : ''}yüz` : '', chunk % 100 ? turkishCardinal(chunk % 100) : ''].filter(Boolean).join(' ');
		// One thousand is "bin", never "bir bin"; one million is "bir milyon".
		parts.unshift(scale === 1 && chunk === 1 ? 'bin' : [words, SCALES[scale]].filter(Boolean).join(' '));
	}
	return parts.join(' ');
};

const LAST_ORDINAL: Record<string, string> = {...ORDINAL_OF, yüz: 'yüzüncü', bin: 'bininci', milyon: 'milyonuncu', milyar: 'milyarıncı', trilyon: 'trilyonuncu', sıfır: 'sıfırıncı'};

/** 19 → "on dokuzuncu", 100 → "yüzüncü", 1453 → "bin dört yüz elli üçüncü". */
export const turkishNumberOrdinal = (value: number): string => {
	const words = turkishNumber(value).split(' ');
	words[words.length - 1] = LAST_ORDINAL[words[words.length - 1]];
	return words.join(' ');
};

/** Digits as they are said: "007" digit by digit, anything else as a number. */
const digitWords = (digits: string): string =>
	(digits.length > 1 && digits.startsWith('0')) || digits.length > 15 ? [...digits].map((digit) => (digit === '0' ? 'sıfır' : ONES[Number(digit)])).join(' ') : turkishNumber(Number(digits));

/** Decimals after the comma: leading zeros one by one ("05" → "sıfır beş"), the rest as a number ("25" → "yirmi beş"). */
const fractionWords = (digits: string): string => {
	const zeros = digits.match(/^0*/)?.[0].length ?? 0;
	const rest = digits.slice(zeros);
	return [...Array(zeros).fill('sıfır'), rest ? turkishNumber(Number(rest)) : ''].filter(Boolean).join(' ');
};

const VOWEL = /^[aeıioöuüâîû]/;
/**
 * A suffix joins the number word as it is said: the writer chose it by the spoken word ("1912'de", "5'e", "23'ü"),
 * so the word and suffix are written together without the apostrophe. "Dört" softens before a vowel: "4'ün" is "dördün".
 */
const joinSuffix = (words: string, suffix: string | undefined): string =>
	!suffix ? words : words.endsWith('dört') && VOWEL.test(suffix) ? `${words.slice(0, -1)}d${suffix}` : `${words}${suffix}`;

/** A number with its decimals, an ordinal dot before a lower-case word ("19. yüzyıl") or a suffix ("1912'de"). */
const NUMBER = /(?<!\d)(\d+)(?:,(\d+)(?!\d))?(?:(\.)(?=\s+[a-zçğıöşüâîû])|['’](\p{L}+))?/gu;
const LETTER = /\p{L}/u;

/**
 * Numbers are said as words, as a teacher says them (29 Oct 2026: 475 narration lines of Matematik and Tarih
 * had digits, and the voice was left to guess "1912'de", "52 718", "23'ü 5'e"): "1912'de" is "bin dokuz yüz on
 * ikide", "52 718" and "40.075" are whole numbers, "2,05" is "iki virgül sıfır beş", "19. yüzyıl" "on dokuzuncu
 * yüzyıl", "%30'u" "yüzde otuzu", "0-14" "sıfır ile on dört", "1/4" "bir bölü dört", "G1" "G bir", "5N1K" "beş N
 * bir K". Units, speeds, percentages and clock times are read first.
 */
export const spokenNumbers = (text: string): string => {
	const prepared = replaceAll(text, [
		...SPEEDS,
		...UNITS,
		// A unit's suffix joins the word: "6378 km'dir" → "6378 kilometredir", "37 °C'de" → "37 derecede".
		[/(kilometre|metre|milimetre|santimetre|kilometrekare|metrekare|santimetrekare|kilogram|dakika|saniye|derece)['’](?=\p{L})/gu, '$1'],
		// A clock time with its suffix: "14.20'de" → "on dört yirmide".
		[/(?<!\d|\d[.,])([01]?\d|2[0-3])\.([0-5]\d)(?!\d|[.,]\d)(?:['’](\p{L}+))?/gu, (_, hours: string, minutes: string, suffix?: string) => joinSuffix(spokenClock(hours, minutes), suffix)],
		...PERCENT,
		// Thousands grouped with dots or spaces: "40.075", "52 718", "1.000.000".
		[/(?<![\d.,])(\d{1,3})((?:[. ]\d{3})+)(?![\d]|[.,]\d)/g, (_, head: string, groups: string) => head + groups.replace(/[. ]/g, '')],
		[/(?<![\d/])(\d+)\s?\/\s?(\d+)(?![\d/])/g, '$1 bölü $2'],
		// A range written tight, "0-14", "15–20": "0 ile 14".
		[/(?<![\p{L}\d,.])(\d+(?:,\d+)?)[-–](?=\d)/gu, '$1 ile '],
		// A sign: "-5", "(−3)".
		[/(^|[\s(=])[-−](?=\d)/g, '$1eksi '],
		// "COVID-19": the dash is not said.
		[/(\p{L})-(?=\d)/gu, '$1 '],
		[/([\p{L}\d)])²/gu, '$1 kare'],
		[/([\p{L}\d)])³/gu, '$1 küp'],
		[/\s*=\s*/g, ' eşittir '],
	]);
	return prepared.replace(NUMBER, (match, whole: string, decimals: string | undefined, ordinalDot: string | undefined, suffix: string | undefined, offset: number, source: string) => {
		const words = ordinalDot && !decimals ? turkishNumberOrdinal(Number(whole)) : `${digitWords(whole)}${decimals ? ` virgül ${fractionWords(decimals)}` : ''}${ordinalDot ?? ''}`;
		const said = joinSuffix(words, suffix);
		const before = offset > 0 && LETTER.test(source[offset - 1]) ? ' ' : '';
		const after = LETTER.test(source[offset + match.length] ?? '') ? ' ' : '';
		return `${before}${said}${after}`;
	});
};

/**
 * A formula written into a narration line ("Küpte dayanıklılık $\propto \frac{1}{a}$.") is read like one on screen.
 * Before 29 Oct 2026 such lines reached the voice as LaTeX. Lines without a formula are left exactly as they were.
 */
const narrationWithFormulasRead = (text: string): string =>
	!/\$[^$]+\$/.test(text)
		? text
		: withFormulasRead(text)
				.replace(/[ \t]+/g, ' ')
				.replace(/ +([,.:;!?])/g, '$1')
				.replace(/,\s*([.:;!?])/g, '$1')
				.trim()
				.replace(/,$/, '');

/** The text the speech service reads: on-screen text keeps "YKS" and "1912", the voice says "yekase" and "bin dokuz yüz on iki". */
export const pronounceAbbreviations = (text: string): string =>
	spokenNumbers(spokenRomanOrdinals(replaceAll(replaceAll(narrationWithFormulasRead(spokenPremiseNumbers(text)), DEGREES), ABBREVIATIONS)));

/** Joins sentences, adding a full stop where one is missing. */
export const sentences = (...parts: (string | undefined | false)[]): string =>
	parts
		.filter((part): part is string => Boolean(part && part.trim()))
		.map((part) => (/[.!?:]$/.test(part.trim()) ? part.trim() : `${part.trim()}.`))
		.join(' ');

/** Lower-cases the first letter with Turkish casing rules ("İlk" becomes "ilk"). */
export const lowerFirst = (text: string): string =>
	text.charAt(0).toLocaleLowerCase('tr') + text.slice(1);
