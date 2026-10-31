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
	// reels' "Sino Eyay" and a joined "Sinoeyay" (Outputs/VoiceTests/okunus-ornegi) and chose this one.
	[/\bSinoAI\b/g, 'Sino Ey Ay'],
	// "PDF'in" is "Pidiyefin" (owner, Oct 2026: the voice spelled it out). Until 31 Oct this lived in single scripts.
	[/\bPDF(?:['’](?=\p{L}))?\b/gu, 'Pidiyef'],
	// The site is read as Turkish speakers say it; its suffix keeps the apostrophe, as approved in the ads
	// ("sinavika.com’da" → "Sınavika nokta kom’da"). Until 31 Oct each ad wrote this in its own script.
	[/\b(?:www\.)?sinavika\.com\b/giu, 'Sınavika nokta kom'],
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
	spokenNumbers(spokenRomanOrdinals(replaceAll(replaceAll(narrationWithFormulasRead(text), DEGREES), ABBREVIATIONS)));

/** Joins sentences, adding a full stop where one is missing. */
export const sentences = (...parts: (string | undefined | false)[]): string =>
	parts
		.filter((part): part is string => Boolean(part && part.trim()))
		.map((part) => (/[.!?:]$/.test(part.trim()) ? part.trim() : `${part.trim()}.`))
		.join(' ');

/** Lower-cases the first letter with Turkish casing rules ("İlk" becomes "ilk"). */
export const lowerFirst = (text: string): string =>
	text.charAt(0).toLocaleLowerCase('tr') + text.slice(1);
