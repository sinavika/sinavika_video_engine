import {toSpokenText} from '../Schemas/SpokenText';
import type {ChallengeRound, Question} from './LessonScript';

/**
 * What the narrator reads aloud of what is on screen, word for word.
 *
 * A question's stem, its paragraph and its options are read by the template
 * from the question itself, never retold in the script: a retold question
 * sounded like a different question from the one on screen (owner, 25 Oct
 * 2026). The script's `narration` is only the lead-in ("Hadi bunu bir soruda
 * deneyelim."); the reading and the pause to think follow it.
 */

const OPTION_LETTERS = 'ABCDE';

/** Said after a question or a prediction has been read, while the countdown runs. */
export const THINK_PROMPT = 'Birkaç saniye düşün.';

/** Roman numerals that mark parts of a paragraph: "(I)", "(IV)". */
const PART_MARK = /\(\s*(I{1,3}|IV|V)\s*\)/g;
const ROMAN_TO_WORD: Record<string, string> = {I: 'bir', II: 'iki', III: 'üç', IV: 'dört', V: 'beş'};

/**
 * Screen text as it is read: emphasis marks dropped, formulas verbalised,
 * "----" blanks said as "boşluk", "(II)" part marks said as "iki numara",
 * " - " between two answers said as a pause.
 */
export const spokenScreenText = (text: string): string =>
	toSpokenText(
		text
			.replace(/-{2,}/g, ' boşluk ')
			// "yalın - dolaşırken": a pair of answers, said with a short pause, never "eksi".
			.replace(/\s+[-–—]\s+/g, ', ')
			.replace(PART_MARK, (_, roman: string) => `, ${ROMAN_TO_WORD[roman]} numara,`),
	)
		.replace(/\s+,/g, ',')
		.replace(/,\s*,/g, ',')
		.replace(/\s+/g, ' ')
		.trim();

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
export const spokenRoundReveal = (round: ChallengeRound): string => `${round.choices[round.answer]}! ${sentence(spokenScreenText(round.why))}`;

/** The one ask at the end of a challenge reel: the score in the comments. */
export const CHALLENGE_SCORE_LINE = 'Kaçta kaç? Yoruma yaz.';
