import {z} from 'zod';
import {CourseVisualSchema} from '../Components/Visuals/VisualSchema';
import {plainText, richText} from '../Schemas/RichText';
import {answerLetterIssues} from '../Courses/LessonScript';
import type {WorksView} from './WorksView';

/**
 * The written lesson of a topic for Works: Curriculum/WorksWritten/<CATEGORY>/<LESSON>/<TOPIC>.json.
 *
 * The Works view built from the video scripts (WorksView.ts) reads like a video without its voice: on 2 Nov 2026
 * about 61% of the scripts' teaching text never reached Works (beats, solution narration), what did reach it was
 * written for the ear ("10 A artı B"), every true/false step was false, the last hint of most questions said the
 * answer, and the Works notes (`works.additions`) stayed notes. A written lesson replaces the view of its topic
 * when `npm run curriculum -- works` runs; the video scripts stay as they are.
 *
 * Its cards are the cards the API's import maps (WorkScriptMapper; card formats in the API's
 * docs/works/Works-Etkilesimli-Adimlar-Plani.md §5), with only the fields it reads:
 * concept, rule, example, visual (a `flow` becomes ordering, `matching` matching, `flipcards` flip cards),
 * predict → choice ("Doğru" / "Yanlış" choices make a statement that can be true), mistake → true/false (always false),
 * question → 5 options with hints opened after each wrong answer, and the interactive cards of 2 Nov 2026:
 * blank (text or number), findError, match, classify, tap, split, multi, flip, guided. `choiceFeedback` on predict,
 * question, multi, findError and choice blanks tells a student why a wrong choice is wrong.
 * `narration` on concept, rule, example and visual cards is the written explanation read under the card.
 */
export const WORKS_WRITTEN_DIRECTORY = 'WorksWritten';

const TRUE = 'Doğru';
const FALSE = 'Yanlış';

/** Per-choice notes for wrong answers ("Bu cevabı verdiysen: …"), in the choices' order; null on the correct ones. */
const choiceFeedback = z.array(richText(300).nullable()).optional();
const feedbackFits = (feedback: readonly (string | null)[] | undefined, count: number, correct: readonly number[]) =>
	!feedback || (feedback.length === count && correct.every((index) => feedback[index] === null));
const FEEDBACK_MESSAGE = 'choiceFeedback must have one entry per choice and null on the correct ones.';
const NUMBER = /^[−-]?\d+(?:[.,]\d+)?(?:\/\d+)?$/;

/** A blank the student fills in: text, a number (`input: "number"`, `0,18` = `0.18`) or one of a few choices. */
const blankFields = {
	prompt: richText(300).optional(),
	before: richText(300).optional(),
	after: richText(300).optional(),
	answers: z.array(z.string().trim().min(1).max(80)).min(1).max(6),
	input: z.enum(['text', 'number']).optional(),
	numeric: z.object({value: z.number(), tolerance: z.number().min(0).optional()}).strict().optional(),
	choices: z.array(richText(80)).min(2).max(5).optional(),
	choiceFeedback,
	wrongAnswers: z.array(z.object({answer: z.string().trim().min(1).max(80), feedback: richText(300)}).strict()).max(6).optional(),
	explanation: richText(700).optional(),
};
type Blank = {before?: string; after?: string; prompt?: string; answers: string[]; input?: string; choices?: string[]; choiceFeedback?: (string | null)[]; wrongAnswers?: {answer: string}[]};
const blankIsWhole = (blank: Blank) =>
	Boolean(blank.before || blank.after || blank.prompt) &&
	(blank.input !== 'number' || blank.answers.every((answer) => NUMBER.test(answer.trim()))) &&
	(!blank.choices || blank.choices.filter((choice) => blank.answers.includes(choice)).length === 1) &&
	feedbackFits(blank.choiceFeedback, blank.choices?.length ?? 0, blank.choices ? [blank.choices.findIndex((choice) => blank.answers.includes(choice))] : []) &&
	!(blank.wrongAnswers ?? []).some((wrong) => blank.answers.includes(wrong.answer));
const BLANK_MESSAGE = 'a blank needs before/after/prompt, numeric answers for input "number", exactly one correct choice (with choiceFeedback null on it), and no correct answer among wrongAnswers.';

const GuidedChoiceSchema = z
	.object({prompt: richText(300), choices: z.array(richText(120)).min(2).max(5), answer: z.number().int().min(0).max(4), choiceFeedback, explanation: richText(500).optional()})
	.strict()
	.refine((step) => step.answer < step.choices.length && feedbackFits(step.choiceFeedback, step.choices.length, [step.answer]), {message: FEEDBACK_MESSAGE});
const GuidedBlankSchema = z.object(blankFields).strict().refine(blankIsWhole, {message: BLANK_MESSAGE});

const WrittenQuestionSchema = z
	.object({
		style: plainText(40),
		context: richText(900).optional(),
		stem: richText(600),
		figure: CourseVisualSchema.optional(),
		options: z.array(richText(160)).length(5),
		answer: z.number().int().min(0).max(4),
		choiceFeedback,
		/** Hints, opened one by one after each wrong answer; all of them show once the step closes. */
		steps: z
			.array(z.object({text: richText(600), visual: CourseVisualSchema.optional()}).strict())
			.min(2)
			.max(4),
		origin: z.object({source: z.string().max(200).optional(), changes: z.string().max(400).optional()}).strict().optional(),
	})
	.strict()
	.refine((question) => new Set(question.options).size === question.options.length, {path: ['options'], message: 'options must be different from each other.'})
	.refine((question) => feedbackFits(question.choiceFeedback, 5, [question.answer]), {path: ['choiceFeedback'], message: FEEDBACK_MESSAGE});

const optionalTitle = plainText(70).optional();

const WrittenCardSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('concept'), title: plainText(70), text: richText(900), caption: richText(240).optional(), narration: richText(1200).optional(), visual: CourseVisualSchema.optional()}).strict(),
	z.object({kind: z.literal('rule'), title: plainText(70), items: z.array(richText(220)).min(1).max(8), narration: richText(1200).optional(), visual: CourseVisualSchema.optional()}).strict(),
	z.object({kind: z.literal('example'), title: plainText(70), example: richText(500), explanation: richText(1200), narration: richText(1200).optional(), visual: CourseVisualSchema.optional()}).strict(),
	z.object({kind: z.literal('visual'), title: plainText(70), visual: CourseVisualSchema, caption: richText(240).optional(), narration: richText(1200).optional()}).strict(),
	z
		.object({
			kind: z.literal('predict'),
			title: plainText(70),
			context: richText(400).optional(),
			prompt: richText(200),
			choices: z.array(richText(80)).min(2).max(4),
			answer: z.number().int().min(0).max(3),
			explanation: richText(700),
			choiceFeedback,
			/** Opened with the explanation, after the answer. */
			visual: CourseVisualSchema.optional(),
		})
		.strict()
		.refine((card) => card.answer < card.choices.length && feedbackFits(card.choiceFeedback, card.choices.length, [card.answer]), {path: ['answer'], message: `answer must be one of the choices; ${FEEDBACK_MESSAGE}`}),
	z.object({kind: z.literal('mistake'), title: plainText(70), wrong: richText(260), right: richText(260), why: richText(400)}).strict(),
	z.object({kind: z.literal('question'), question: WrittenQuestionSchema}).strict(),
	z.object({kind: z.literal('blank'), title: optionalTitle, visual: CourseVisualSchema.optional(), ...blankFields}).strict().refine(blankIsWhole, {message: BLANK_MESSAGE}),
	z
		.object({kind: z.literal('findError'), title: optionalTitle, problem: richText(600), prompt: richText(200).optional(), steps: z.array(richText(300)).min(2).max(6), wrongStep: z.number().int().min(0).max(5), choiceFeedback, explanation: richText(700), visual: CourseVisualSchema.optional()})
		.strict()
		.refine((card) => card.wrongStep < card.steps.length && feedbackFits(card.choiceFeedback, card.steps.length, [card.wrongStep]), {message: `wrongStep must be one of the steps; ${FEEDBACK_MESSAGE}`}),
	z
		.object({kind: z.literal('match'), title: optionalTitle, prompt: richText(200).optional(), titles: z.tuple([richText(30), richText(30)]).optional(), pairs: z.array(z.object({left: richText(160), right: richText(200)}).strict()).min(2).max(8), explanation: richText(700).optional(), visual: CourseVisualSchema.optional()})
		.strict()
		.refine((card) => new Set(card.pairs.map((pair) => pair.left)).size === card.pairs.length, {message: 'match: left items must be different from each other.'}),
	z
		.object({kind: z.literal('classify'), title: optionalTitle, prompt: richText(200), groups: z.array(z.object({label: richText(40), items: z.array(richText(80)).min(1)}).strict()).min(2).max(4), explanation: richText(700).optional(), visual: CourseVisualSchema.optional()})
		.strict()
		.refine((card) => {
			const items = card.groups.flatMap((group) => group.items);
			return items.length >= 2 && items.length <= 12 && new Set(items).size === items.length;
		}, {message: 'classify: 2–12 items in all, each different.'}),
	z
		.object({kind: z.literal('tap'), title: optionalTitle, prompt: richText(200), mode: z.enum(['word', 'sentence']), segments: z.array(z.string().min(1).max(400)).min(2).max(80), answers: z.array(z.number().int().min(0)).min(1), feedback: z.array(richText(300).nullable()).optional(), explanation: richText(700).optional(), visual: CourseVisualSchema.optional()})
		.strict()
		.refine((card) => card.answers.every((index) => index < card.segments.length) && new Set(card.answers).size === card.answers.length && (!card.feedback || card.feedback.length === card.segments.length), {message: 'tap: answers must be segment indexes, each once; feedback one entry per segment.'}),
	z
		.object({kind: z.literal('split'), title: optionalTitle, prompt: richText(200).optional(), word: z.string().regex(/^\S{2,40}$/u), cuts: z.array(z.number().int().min(1)).min(1), parts: z.array(plainText(40)).optional(), explanation: richText(700).optional()})
		.strict()
		.refine((card) => card.cuts.every((cut, index) => cut < [...card.word].length && (index === 0 || cut > card.cuts[index - 1])) && (!card.parts || card.parts.length === card.cuts.length + 1), {message: 'split: cuts inside the word and increasing; parts one more than cuts.'}),
	z
		.object({kind: z.literal('multi'), title: optionalTitle, context: richText(900).optional(), stem: richText(600), options: z.array(richText(200)).min(2).max(6), answers: z.array(z.number().int().min(0)).min(1), choiceFeedback, explanation: richText(700).optional(), visual: CourseVisualSchema.optional()})
		.strict()
		.refine((card) => card.answers.every((index) => index < card.options.length) && new Set(card.answers).size === card.answers.length && feedbackFits(card.choiceFeedback, card.options.length, card.answers), {message: `multi: answers must be option indexes, each once; ${FEEDBACK_MESSAGE}`}),
	z.object({kind: z.literal('flip'), title: optionalTitle, prompt: richText(200).optional(), cards: z.array(z.object({front: richText(80), back: richText(240)}).strict()).min(2).max(8), explanation: richText(700).optional()}).strict(),
	z.object({kind: z.literal('guided'), title: optionalTitle, stem: richText(600), figure: CourseVisualSchema.optional(), steps: z.array(z.union([GuidedChoiceSchema, GuidedBlankSchema])).min(2).max(5)}).strict(),
]);

type WrittenCard = z.infer<typeof WrittenCardSchema>;

export const WrittenLessonSchema = z
	.object({
		topic: z.object({id: z.string().min(1), category: z.string().min(1), lesson: z.string().min(1), code: z.string().min(1)}).strict(),
		title: plainText(120),
		lessonName: plainText(60),
		exams: z.array(z.string().min(1)).min(1),
		sourceScripts: z.array(z.string().min(1)).min(1),
		written: z
			.object({
				/** What the lesson was written and checked against: data files, books, ÖSYM questions. */
				sources: z.array(z.string().min(1)).min(1),
				/** Every Works note of the video lesson, word for word, and where the written lesson answers it. */
				additions: z.array(z.object({note: z.string().min(1), done: z.string().min(1)}).strict()),
				/** Errors found in the video lesson or the sources and fixed here, for the record. */
				fixes: z.array(z.string().min(1).max(400)).optional(),
			})
			.strict(),
		lesson: z
			.object({
				hook: z.object({headline: plainText(200), narration: z.string().min(1)}).strict(),
				objectives: z.array(plainText(160)).min(1).max(8),
				sections: z
					.array(
						z
							.object({
								subtopic: z.string().min(1).optional(),
								subtopics: z.array(z.string().min(1)).default([]),
								title: plainText(120),
								narration: z.string().default(''),
								cards: z.array(WrittenCardSchema).min(2),
							})
							.strict(),
					)
					.min(1),
				summary: z.object({points: z.array(richText(240)).max(8), warnings: z.array(richText(240)).max(4)}).strict(),
			})
			.strict(),
		camp: z.object({task: z.object({items: z.array(z.string())}).strict()}).strict().optional(),
	})
	.strict();

export type WrittenLesson = z.infer<typeof WrittenLessonSchema>;

/** Cards that only teach. A visual that the API turns into a step (flow → ordering, matching, flipcards) asks instead. */
const teaches = (card: WrittenCard) =>
	card.kind === 'concept' || card.kind === 'rule' || card.kind === 'example' || (card.kind === 'visual' && !['flow', 'matching', 'flipcards'].includes(card.visual.kind));

/** Asking cards that need the topic taught first ("önce öğret, sonra sor"); a prediction may come before on purpose. */
const NEEDS_TEACHING = new Set(['blank', 'findError', 'match', 'classify', 'tap', 'split', 'multi', 'flip', 'guided']);

/**
 * The most reading cards in a row before something asks the student to do something. Four since 5 Nov 2026: a section
 * now opens with its definition, the meaning and then the formula (owner's teaching order), which leaves room for one
 * figure before the first check.
 */
const MAX_READING_RUN = 4;

/** Plain words of rich text: emphasis marks and formula dollars dropped, for searching. */
const plain = (text: string) => text.replace(/\*\*/g, '').replace(/\$/g, '').toLocaleLowerCase('tr');

const notes = (items: readonly (string | null | undefined)[] | undefined) => (items ?? []).filter((item): item is string => Boolean(item));

const blankTexts = (blank: {prompt?: string; before?: string; after?: string; explanation?: string; choiceFeedback?: (string | null)[]; wrongAnswers?: {feedback: string}[]}) => [
	blank.prompt ?? '',
	blank.before ?? '',
	blank.after ?? '',
	blank.explanation ?? '',
	...notes(blank.choiceFeedback),
	...(blank.wrongAnswers ?? []).map((wrong) => wrong.feedback),
];

const cardTexts = (card: WrittenCard): string[] => {
	switch (card.kind) {
		case 'concept':
			return [card.title, card.text, card.caption ?? '', card.narration ?? ''];
		case 'rule':
			return [card.title, ...card.items, card.narration ?? ''];
		case 'example':
			return [card.title, card.example, card.explanation, card.narration ?? ''];
		case 'visual':
			return [card.title, card.caption ?? '', card.narration ?? ''];
		case 'predict':
			return [card.title, card.context ?? '', card.prompt, ...card.choices, card.explanation, ...notes(card.choiceFeedback)];
		case 'mistake':
			return [card.title, card.wrong, card.right, card.why];
		case 'question':
			return [card.question.context ?? '', card.question.stem, ...card.question.options, ...card.question.steps.map((step) => step.text), ...notes(card.question.choiceFeedback)];
		case 'blank':
			return blankTexts(card);
		case 'findError':
			return [card.problem, card.prompt ?? '', ...card.steps, card.explanation, ...notes(card.choiceFeedback)];
		case 'match':
			return [card.prompt ?? '', ...card.pairs.flatMap((pair) => [pair.left, pair.right]), card.explanation ?? ''];
		case 'classify':
			return [card.prompt, ...card.groups.flatMap((group) => [group.label, ...group.items]), card.explanation ?? ''];
		case 'tap':
			return [card.prompt, ...card.segments, card.explanation ?? '', ...notes(card.feedback)];
		case 'split':
			return [card.prompt ?? '', card.explanation ?? ''];
		case 'multi':
			return [card.context ?? '', card.stem, ...card.options, card.explanation ?? '', ...notes(card.choiceFeedback)];
		case 'flip':
			return [card.prompt ?? '', ...card.cards.flatMap((item) => [item.front, item.back]), card.explanation ?? ''];
		case 'guided':
			return [card.stem, ...card.steps.flatMap((step) => ('choices' in step && step.choices && 'answer' in step ? [step.prompt, ...step.choices, step.explanation ?? '', ...notes(step.choiceFeedback)] : blankTexts(step)))];
	}
};

/** Lessons whose formulas the video read aloud ("A B artı B A"); in writing they are formulas. */
const FORMULA_LESSONS = new Set(['MAT', 'GEO', 'FIZ', 'KIM']);
/** "10 A artı B" is a formula read aloud; "eksi işareti", "iki eksi birbirini götürür" are the names of a sign, not a formula. */
const SPOKEN_OPERATOR = /(?<!\p{L})(artı|eksi(?!\s+(?:işaret|birbirini|sayı))|bölü|çarpı)(?!\p{L})/iu;
const SPOKEN_YEAR = /(?<!\p{L})(bin\s+(?:dokuz|sekiz|yedi|altı|beş|dört|üç|iki)?\s*yüz|iki\s+bin)(?!\p{L})/iu;
const VIDEO_WORDS = /(?<!\p{L})(birazdan|az sonra|bir sonraki ders\p{L}*|videoda|ekranda|cevabımız|dinleyelim|izleyelim)(?!\p{L})/iu;
const NAMES_LETTER = /(?:cevap|yanıt|doğru (?:seçenek|şık))\s*(?:\*\*)?\s*[A-E](?:\*\*)?(?!\p{L})/iu;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The text states the correct option: a number as a number, a sentence word for word. In the last hint the student
 * then answers for free; in a wrong choice's note the answer is given away. A one-digit answer is not looked for: small
 * numbers stand in any hint ("a'ya 3'ten 9'a kadar değer ver").
 */
const givesAway = (text: string, option: string): boolean => {
	const value = plain(option).trim();
	if (/^[−-]?[\d.,\s]+$/.test(value)) return value.replace(/\D/g, '').length >= 2 && new RegExp(`(?<![\\d,.])${escape(value)}(?![\\d,]|\\.\\d|\\s*\\\\sqrt|\\s*√)`).test(plain(text));
	return value.length >= 12 && plain(text).includes(value);
};

/** Gives away only what the question does not already say: an area of 12 in the stem may be named when the answer is 12 too. */
const givesAwayBeyond = (text: string, option: string, given: string) => givesAway(text, option) && !givesAway(given, option);

/** Cards whose text is example language for the student to work on ("Toplantı birazdan başlıyor."), not the lesson's voice. */
const EXAMPLE_LANGUAGE = new Set(['question', 'tap', 'multi', 'classify', 'match', 'split', 'blank', 'guided', 'findError', 'flip']);

/** Cards that ask an exam-like question; worked examples come before the first of them in a section. */
const EXAM_STEPS = new Set(['question', 'blank', 'guided', 'findError', 'multi']);

/** Worked examples before the first question of a section: numeric lessons need a few, others at least one (owner, 5 Nov 2026). */
const MIN_WORKED_EXAMPLES = {formula: 2, other: 1};

/** A worked example shows the whole solution, not a one-line answer. */
const MIN_WORKED_SOLUTION = 120;

const FORMULA_TEXT = /\$[^$]*[=<>≤≥][^$]*\$/u;

/** A definition says in words what the formula means: at least this many characters outside the formulas. */
const MIN_MEANING_WORDS = 80;

const carriesFormula = (card: WrittenCard) =>
	(('visual' in card && card.visual?.kind === 'formula') ||
		[card.kind === 'rule' ? card.items.join(' ') : '', card.kind === 'concept' ? card.text : '', card.kind === 'example' ? card.example : ''].some((text) => FORMULA_TEXT.test(text)));

/**
 * The teaching order the owner asked for on 5 Nov 2026 ("konu tanımı olmadan direk içeriğe dalınmış", "direk formüle
 * girilmiş", "konu anlatımı sonrası direk soru; önce birkaç soru çözümlü anlatım olmalı"): the lesson and every section
 * open with a definition, a numeric section explains the idea before its formula, and worked examples come before the
 * first question. These are warnings, not refusals: a lesson that breaks them still replaces the video view (it is
 * better than the view), and the production line treats them as things to fix in its next pass.
 */
export const writtenWarnings = (written: WrittenLesson, view: WorksView): string[] => {
	const warnings: string[] = [];
	const formulas = FORMULA_LESSONS.has(view.topic.lesson);
	const sections = written.lesson.sections;
	if (sections[0]?.cards[0]?.kind !== 'concept') warnings.push(`s1: the lesson does not open with a definition of the topic; start with a concept card ("${written.title} nedir?").`);
	sections.forEach((section, sectionIndex) => {
		const where = `s${sectionIndex + 1} (${section.title})`;
		if (section.subtopic && section.cards[0]?.kind !== 'concept') warnings.push(`${where}: the section does not open with a definition; start with a concept card that says what the subtopic is.`);
		if (formulas) {
			// The meaning is a definition in words; a small worked case inside it ("$|AB| = 4$ cm olsun") is fine.
			const firstFormula = section.cards.findIndex((card) => card.kind !== 'concept' && carriesFormula(card));
			const firstConcept = section.cards.findIndex((card) => card.kind === 'concept');
			const opening = section.cards[firstConcept];
			const words = opening?.kind === 'concept' ? opening.text.replace(/\$[^$]*\$/g, '').replace(/\*\*/g, '').trim().length : 0;
			if (firstFormula >= 0 && (firstConcept < 0 || firstConcept > firstFormula)) warnings.push(`${where} c${firstFormula + 1}: a formula before its meaning; explain the idea in words and with a simple case first, then give the formula.`);
			else if (firstConcept >= 0 && words < MIN_MEANING_WORDS) warnings.push(`${where} c${firstConcept + 1}: the definition is mostly formula; say in words what it means before the symbols.`);
		}
		const firstExam = section.cards.findIndex((card) => EXAM_STEPS.has(card.kind));
		if (firstExam >= 0) {
			const worked = section.cards.slice(0, firstExam).filter((card) => card.kind === 'example' && card.explanation.length >= MIN_WORKED_SOLUTION).length;
			const needed = formulas ? MIN_WORKED_EXAMPLES.formula : MIN_WORKED_EXAMPLES.other;
			if (worked < needed) warnings.push(`${where} c${firstExam + 1}: ${worked} worked example(s) before the first question; give at least ${needed}, each with its full solution step by step.`);
		}
	});
	return warnings;
};

/**
 * What keeps a written lesson from replacing its topic's view: another topic, a subtopic lost or foreign, a section
 * that only tells or only asks, a long run of reading, an asking card before anything is taught, a hint or a wrong
 * choice's note that answers, spoken forms ("10 A artı B", "bin dokuz yüz"), video words, true/false steps that are
 * always false, correct options in an exam-unlike pattern, and Works notes not answered.
 */
export const writtenIssues = (written: WrittenLesson, view: WorksView): string[] => {
	const issues: string[] = [];
	const {topic} = view;
	if (written.topic.id !== topic.id || written.topic.category !== topic.category || written.topic.lesson !== topic.lesson || written.topic.code !== topic.code) {
		issues.push(`Topic ${JSON.stringify(written.topic)} is not the view's topic ${JSON.stringify(topic)}.`);
	}
	const codesOf = (sections: readonly {subtopic?: string; subtopics: readonly string[]}[]) => new Set(sections.flatMap((section) => [section.subtopic ?? '', ...section.subtopics]).filter(Boolean));
	const needed = codesOf(view.lesson.sections);
	const given = codesOf(written.lesson.sections);
	const lost = [...needed].filter((code) => !given.has(code));
	const foreign = [...given].filter((code) => !needed.has(code));
	if (lost.length > 0) issues.push(`Subtopics no section teaches: ${lost.join(', ')}.`);
	if (foreign.length > 0) issues.push(`Subtopics that are not this topic's: ${foreign.join(', ')}.`);
	// A subtopic taught in two sections of the video stays so (Works keys them by subtopic and title); a new repeat is refused.
	const tally = (codes: readonly (string | undefined)[]) => codes.reduce((map, code) => (code ? map.set(code, (map.get(code) ?? 0) + 1) : map), new Map<string, number>());
	const baseCounts = tally(view.lesson.sections.map((section) => section.subtopic));
	if ([...tally(written.lesson.sections.map((section) => section.subtopic))].some(([code, count]) => count > (baseCounts.get(code) ?? 1))) issues.push('Two sections share a subtopic; Works keys a section by its subtopic.');

	const statements: boolean[] = [];
	const answers: string[] = [];
	const formulas = FORMULA_LESSONS.has(topic.lesson);
	const texts = [written.lesson.hook.headline, ...written.lesson.objectives, ...written.lesson.summary.points, ...written.lesson.summary.warnings].map((text) => ({where: 'lesson', text, example: false}));
	written.lesson.sections.forEach((section, sectionIndex) => {
		const where = `s${sectionIndex + 1} (${section.title})`;
		if (!section.cards.some(teaches)) issues.push(`${where}: no card teaches; add a concept, rule, example or visual.`);
		if (section.cards.every(teaches)) issues.push(`${where}: nothing to answer; add a question or another asking card.`);
		let run = 0;
		let taught = false;
		section.cards.forEach((card, cardIndex) => {
			const at = `${where} c${cardIndex + 1}`;
			// Worked examples are guided practice before the questions (owner, 5 Nov 2026); they do not add to a run of reading.
			run = teaches(card) ? (card.kind === 'example' ? run : run + 1) : 0;
			if (run === MAX_READING_RUN + 1) issues.push(`${at}: ${run} reading cards in a row; let the student do something in between.`);
			if (NEEDS_TEACHING.has(card.kind) && !taught) issues.push(`${at}: a ${card.kind} card before anything is taught in the section; teach first, then ask.`);
			taught = taught || teaches(card);
			texts.push(...cardTexts(card).map((text) => ({where: at, text, example: EXAMPLE_LANGUAGE.has(card.kind)})));
			if (card.kind === 'mistake') statements.push(false);
			if (card.kind === 'predict' && card.choices.length === 2 && card.choices[0] === TRUE && card.choices[1] === FALSE) statements.push(card.answer === 0);
			if (card.kind === 'predict' && card.choiceFeedback?.some((note) => note && givesAwayBeyond(note, card.choices[card.answer], `${card.context ?? ''} ${card.prompt}`))) issues.push(`${at}: a wrong choice's note gives the answer away.`);
			if (card.kind !== 'question') return;
			const {question} = card;
			const correct = question.options[question.answer];
			const given = `${question.context ?? ''} ${question.stem}`;
			answers.push('ABCDE'[question.answer]);
			question.steps.forEach((step, stepIndex) => {
				if (NAMES_LETTER.test(step.text)) issues.push(`${at} hint ${stepIndex + 1} names the answer's letter; the app shows the correct option itself.`);
			});
			if (givesAwayBeyond(question.steps[question.steps.length - 1].text, correct, given)) issues.push(`${at}: the last hint states the answer (${correct}); leave the last step to the student.`);
			if (question.choiceFeedback?.some((note) => note && (givesAwayBeyond(note, correct, given) || NAMES_LETTER.test(note)))) issues.push(`${at}: a wrong choice's note gives the answer away; say why that choice is wrong, not which one is right.`);
		});
	});
	texts.forEach(({where, text, example}) => {
		if (formulas && SPOKEN_OPERATOR.test(text)) issues.push(`${where}: "${SPOKEN_OPERATOR.exec(text)?.[0]}" is a formula read aloud; write it as a formula.`);
		if (SPOKEN_YEAR.test(text)) issues.push(`${where}: "${SPOKEN_YEAR.exec(text)?.[0]}" is a number read aloud; write it in digits.`);
		if (!example && VIDEO_WORDS.test(text)) issues.push(`${where}: "${VIDEO_WORDS.exec(text)?.[0]}" belongs to the video.`);
	});

	const trueCount = statements.filter(Boolean).length;
	if (statements.length >= 2 && (trueCount === 0 || trueCount === statements.length)) {
		issues.push(`All ${statements.length} true/false steps are ${trueCount === 0 ? 'false' : 'true'}; write ${trueCount === 0 ? 'true statements as "Doğru"/"Yanlış" predictions' : 'false ones too'}.`);
	}
	issues.push(...answerLetterIssues(answers.join('')));

	const viewNotes = view.works?.additions ?? [];
	const answered = new Set(written.written.additions.map((addition) => addition.note));
	viewNotes.filter((note) => !answered.has(note)).forEach((note) => issues.push(`Works note not answered: "${note}".`));
	written.written.additions.filter((addition) => !viewNotes.includes(addition.note)).forEach((addition) => issues.push(`"${addition.note}" is not one of the topic's Works notes.`));
	return issues;
};
