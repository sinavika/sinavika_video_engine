import {ROMAN_NUMERAL, romanValue, toSpokenText, turkishCardinal, turkishOrdinal} from '../Schemas/SpokenText';
import {OPTION_LETTERS, type ChallengeRound, type Question} from './LessonScript';

/**
 * What the narrator reads aloud of what is on screen, word for word.
 *
 * A question's stem, its paragraph and its options are read by the template
 * from the question itself, never retold in the script: a retold question
 * sounded like a different question from the one on screen (owner, 25 Oct
 * 2026). The script's `narration` is only the lead-in ("Hadi bunu bir soruda
 * deneyelim."); the reading and the pause to think follow it.
 */

/** Said after a question or a prediction has been read, while the countdown runs. */
export const THINK_PROMPT = 'Birkaç saniye düşün.';

/** Roman numerals that mark parts of a paragraph: "(I)", "(IV)". */
const PART_MARK = /\(\s*(I{1,3}|IV|V)\s*\)/g;
const ROMAN_TO_WORD: Record<string, string> = {I: 'bir', II: 'iki', III: 'üç', IV: 'dört', V: 'beş'};
/** Inline and display formulas, kept whole (with their dollars) by `split`. */
const FORMULA = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/;

/**
 * Roman numerals outside parentheses, as a teacher says them (the voice read them as letters):
 * a premise list "I. 18, II. 24" is "bir numara, 18, iki numara, 24", an ordinal "II. cümle",
 * "XI. yüzyıl", "II. Murat" is "ikinci cümle", "on birinci yüzyıl", "ikinci Murat", and an answer
 * made only of numerals, "Yalnız I", "I ve II", "II - IV - I", is "yalnız bir", "bir ve iki".
 * A lone "I" in running text is left alone: in English it is a word.
 */
const ROMAN = ROMAN_NUMERAL;
const ROMAN_TOKEN = new RegExp(String.raw`(?<![\p{L}\p{N}])(${ROMAN})(?![\p{L}\p{N}])`, 'gu');
const ROMAN_ANSWER = new RegExp(String.raw`^(?:Yalnız\s+)?${ROMAN}(?:\s*(?:,|ve|[-–—])\s*${ROMAN})*$`, 'u');
const ROMAN_PREMISE = new RegExp(String.raw`(?<![\p{L}\p{N}])(${ROMAN})\.\s+(?![\p{Ll}])`, 'gu');
const ROMAN_ORDINAL = new RegExp(String.raw`(?<![\p{L}\p{N}])(${ROMAN})\.(?=\s)`, 'gu');
const HAS_PREMISES = /(?<![\p{L}\p{N}])I\.\s+(?![\p{Ll}])[\s\S]*(?<![\p{L}\p{N}])II\.\s+(?![\p{Ll}])/u;

const cardinalWords = (roman: string): string => turkishCardinal(romanValue(roman));
const ordinalWords = (roman: string): string => turkishOrdinal(romanValue(roman));

/** Formula spans, so a numeral-looking letter inside "$...$" is never touched. */
const insideFormula = (text: string): ((offset: number) => boolean) => {
	const spans = [...text.matchAll(new RegExp(FORMULA.source, 'g'))].map((match) => [match.index ?? 0, (match.index ?? 0) + match[0].length]);
	return (offset) => spans.some(([start, end]) => offset >= start && offset < end);
};

export const spokenRomanNumerals = (text: string): string => {
	if (ROMAN_ANSWER.test(text.trim())) return text.replace(ROMAN_TOKEN, (match, roman: string) => (roman ? cardinalWords(roman) : match));
	const inFormula = insideFormula(text);
	const premises = HAS_PREMISES.test(text)
		? text.replace(ROMAN_PREMISE, (match, roman: string, offset: number) => (roman && !inFormula(offset) ? `, ${cardinalWords(roman)} numara, ` : match))
		: text;
	const inPremisesFormula = insideFormula(premises);
	return premises.replace(ROMAN_ORDINAL, (match, roman: string, offset: number) => (roman && !inPremisesFormula(offset) ? ordinalWords(roman) : match));
};

/** A text written in the symbols of propositional logic (AYT Mantık): a connective, or "~" before a letter or bracket. */
const LOGIC = /[∧∨⇒⇔]|~\s*[p-t([]/u;

/**
 * Propositional logic as a teacher reads it: "~p" is "p değil", ∧ "ve", ∨ "veya", ⇒ "ise", ⇔ "ancak ve ancak".
 * Brackets become pauses, so the grouping is heard: "(p ∧ q) ⇒ r" is "p ve q, ise r", "p ∧ (q ⇒ r)" is "p ve, q ise
 * r" (the voice read the symbols as nothing and both options sounded the same, 30 Oct 2026).
 */
export const spokenLogic = (text: string): string =>
	LOGIC.test(text)
		? text
				.replace(/[([]/g, ', ')
				.replace(/[)\]]/g, ', ')
				.replace(/~\s*([p-t])/g, ' $1 değil ')
				.replace(/~\s*/g, ' değil ')
				.replace(/∧/g, ' ve ')
				.replace(/∨/g, ' veya ')
				.replace(/⇔/g, ' ancak ve ancak ')
				.replace(/⇒/g, ' ise ')
				.replace(/\s+,/g, ',')
				.replace(/,(\s*,)+/g, ',')
				.replace(/\s+/g, ' ')
				.replace(/^[\s,]+|[\s,]+$/g, '')
		: text;

/**
 * Screen text as it is read: emphasis marks dropped, formulas verbalised,
 * "----" blanks said as "boşluk", "(II)" part marks said as "iki numara",
 * " - " between two answers said as a pause.
 */
export const spokenScreenText = (text: string): string =>
	toSpokenText(
		// Only the words outside formulas: inside "$a - b$" the dash is a minus and is said "eksi".
		spokenRomanNumerals(text)
			.split(FORMULA)
			.map((part, index) =>
				index % 2 === 1
					? part
					: spokenLogic(part)
							// A blank's suffix is not said: "----'dir" is "boşluk".
							.replace(/-{2,}(?:['’]\p{L}+)?/gu, ' boşluk ')
							// "yalın - dolaşırken": a pair of answers, said with a short pause, never "eksi".
							.replace(/\s+[-–—]\s+/g, ', ')
							// "Gözlerin bir deniz / Dalgalandıkça sen": two lines of verse in one option, said with a pause.
							.replace(/\s+\/\s+/g, ', ')
							.replace(PART_MARK, (_, roman: string) => `, ${ROMAN_TO_WORD[roman]} numara,`),
			)
			.join(''),
	)
		.replace(/\s+,/g, ',')
		.replace(/,\s*,/g, ',')
		// A premise mark after a full stop or a colon: "göre;, bir numara" is "göre; bir numara".
		.replace(/([.;:!?])\s*,/g, '$1')
		.replace(/\s+/g, ' ')
		.trim()
		// A premise list that opens the text leaves a pause mark at the start.
		.replace(/^,\s*/, '')
		// A formula that ends in "|x|" leaves a pause mark at the end: "mutlak değer eksi 7,".
		.replace(/,$/, '');

/** Options are read when they carry words; bare labels (I, II, III) are not. */
const readableOptions = (options: readonly string[]): boolean => options.some((option) => spokenScreenText(option).split(' ').length > 1 || spokenScreenText(option).length > 4);

const sentence = (text: string): string => (/[.!?…:]$/.test(text) ? text : `${text}.`);

/** The options read one by one: "A şıkkı: Sıcak su. B şıkkı: …". */
export const spokenOptions = (options: readonly string[]): string =>
	readableOptions(options) ? options.map((option, index) => `${OPTION_LETTERS[index]} şıkkı: ${sentence(spokenScreenText(option))}`).join(' ') : '';

/** The question as it stands on screen: its paragraph, its stem, and its options when they are words. */
export const spokenQuestion = (question: Pick<Question, 'context' | 'stem' | 'options'>): string =>
	[question.context ? sentence(spokenScreenText(question.context)) : '', sentence(spokenScreenText(question.stem)), spokenOptions(question.options)].filter(Boolean).join(' ');

/** The choices of a prediction card, read after its question. */
export const spokenChoices = (choices: readonly string[]): string => (choices.length > 0 ? spokenOptions(choices) : '');

/**
 * A prediction as it is asked. With a `context` (the sentence it is about), the script's narration is only the
 * lead-in and the template reads the sentence and the question as written, like a worked question. Without one,
 * the narration carries the question. Then the choices and the cue to think.
 */
export const spokenPredictAsk = (card: {narration: string; context?: string; prompt: string; choices: readonly string[]}): string =>
	[card.narration, card.context ? `${sentence(spokenScreenText(card.context))} ${sentence(spokenScreenText(card.prompt))}` : '', spokenChoices(card.choices), THINK_PROMPT].filter(Boolean).join(' ');

const normalise = (text: string): string =>
	spokenScreenText(text)
		.toLocaleLowerCase('tr')
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();

/** Whether `shown` is said, word for word, somewhere in `spoken` (marks and punctuation aside). */
export const isSpoken = (shown: string, spoken: string): boolean => normalise(spoken).includes(normalise(shown));

/** A beat is said on its own line: it has to be a whole sentence, or the voice stops mid-thought. */
export const isWholeSentence = (text: string): boolean => /[.!?…]["”']?$/.test(text.trim());

/** A challenge round as it is asked: the sentence, then the question, both as written. */
export const spokenRoundAsk = (round: ChallengeRound): string => `${sentence(spokenScreenText(round.sentence))} ${sentence(spokenScreenText(round.question))}`;

/** The answer of a round and why: "Ham! Olumsuzluk karşıtlık değil.". */
export const spokenRoundReveal = (round: ChallengeRound): string => `${spokenScreenText(round.choices[round.answer])}! ${sentence(spokenScreenText(round.why))}`;

/** The one ask at the end of a challenge reel: the score in the comments. */
export const CHALLENGE_SCORE_LINE = 'Kaçta kaç? Yoruma yaz.';
