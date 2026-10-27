import {z} from 'zod';
import {CourseVisualSchema, VisualBeatSchema, numberedPartNames} from '../Components/Visuals/VisualSchemas';
import {latex, plainText, richText} from '../Schemas/RichText';
import {RevisionCardSchema} from '../Templates/Education/QuickRevision/QuickRevisionSchema';
import {CampEpisodeSchema} from './Camp';
import {VOICE_LEAD_SECONDS, VOICE_TAIL_SECONDS} from '../Scenes/Voiceover';
import {CHALLENGE_SCORE_LINE, isSpoken, isWholeSentence, spokenPredictAsk, spokenQuestion, spokenRoundAsk, spokenRoundReveal, THINK_PROMPT} from './LessonSpeech';
import {COURSE_DESIGN} from './CourseDesign';

/**
 * The script of one topic: the full YouTube lesson and its short summary,
 * in one file, written before anything is drawn or spoken.
 *
 *   Curriculum/Scripts/<Category>/<Lesson>/<Topic>.json   (e.g. Curriculum/Scripts/YKS_TYT/TRK/SOZCUKTE_ANLAM.json)
 *
 * Every card carries the words that will be spoken over it (`narration`);
 * the screen shows less than is said, never more. Visuals are data
 * (Components/Visuals), so a figure and the text about it cannot disagree.
 */

const narration = z.string().trim().min(1).max(1400);

/** A question: the stem, the options, the correct one, and the solution step by step. */
export const QuestionSchema = z
	.object({
		/** Shown above the stem, e.g. "TYT tarzı" or "KPSS 2023 tarzı". */
		style: plainText(40).optional(),
		stem: richText(600),
		/** Text that belongs to the stem but is shown apart: a paragraph, a list of numbered sentences. */
		context: richText(900).optional(),
		options: z.array(richText(160)).min(2).max(5),
		/** Index of the correct option (0 is A). */
		answer: z.number().int().min(0).max(4),
		steps: z
			.array(
				z.object({
					text: richText(260),
					latex: latex(200).optional(),
					visual: CourseVisualSchema.optional(),
					/** Options this step rules out, by letter: they are struck through and fade as the step is said. */
					eliminate: z.array(z.enum(['A', 'B', 'C', 'D', 'E'])).max(4).default([]),
					/** Words of the passage or the stem this step points at: a marker stroke is drawn under them as the step is said. */
					mark: z.array(plainText(80)).max(4).default([]),
					/** Numbered sentences of the passage this step points at ((III) is 3; without numbers, the n-th sentence): lit as the step is said. */
					sentences: z.array(z.number().int().min(1).max(12)).max(3).default([]),
					narration,
				}),
			)
			.min(1)
			.max(8),
		/** Read while the stem is on screen. */
		narration,
		/** Where the question came from and what was changed, so it can be checked again (source file and line, changed names and numbers). */
		origin: z.object({source: z.string().max(200).optional(), changes: z.string().max(400).optional()}).optional(),
	})
	.refine((question) => question.answer < question.options.length, {path: ['answer'], message: 'answer must be the index of one of the options.'})
	.refine((question) => new Set(question.options).size === question.options.length, {path: ['options'], message: 'options must be different from each other.'})
	.superRefine((question, context) => {
		const letters = 'ABCDE';
		const shown = `${question.context ?? ''} ${question.stem}`.toLocaleLowerCase('tr').replace(/\*\*/g, '');
		question.steps.forEach((step, index) => {
			step.eliminate.forEach((letter) => {
				const option = letters.indexOf(letter);
				if (option >= question.options.length) context.addIssue({code: 'custom', path: ['steps', index, 'eliminate'], message: `There is no option ${letter}.`});
				if (option === question.answer) context.addIssue({code: 'custom', path: ['steps', index, 'eliminate'], message: `${letter} is the answer; it cannot be ruled out.`});
			});
			step.mark.forEach((phrase) => {
				if (!shown.includes(phrase.toLocaleLowerCase('tr'))) context.addIssue({code: 'custom', path: ['steps', index, 'mark'], message: `"${phrase}" is not in the passage or the stem as written.`});
			});
		});
	});

export type Question = z.infer<typeof QuestionSchema>;

/**
 * The visual told in beats: after the card's own narration, each beat's
 * sentence is spoken while the figure does what the beat says (shows, points
 * at, zooms, changes a coefficient, moves to a stage). See
 * Components/Visuals/VisualTimeline.
 */
const beats = z.array(VisualBeatSchema).max(10).default([]);

/** The cards of a lesson. Every kind can carry a visual; `visual` is a card that is mostly a visual. */
export const LessonCardSchema = z.discriminatedUnion('kind', [
	/** A definition or an explanation. */
	z.object({kind: z.literal('concept'), title: plainText(70), text: richText(420), visual: CourseVisualSchema.optional(), beats, narration}),
	/** Rules or properties as a short list. */
	z.object({kind: z.literal('rule'), title: plainText(70), items: z.array(richText(160)).min(1).max(6), visual: CourseVisualSchema.optional(), beats, narration}),
	/** An example and what it shows. */
	z.object({kind: z.literal('example'), title: plainText(70), example: richText(300), explanation: richText(300).optional(), visual: CourseVisualSchema.optional(), beats, narration}),
	/** A common mistake: what students do, what is right, and why. */
	z.object({kind: z.literal('mistake'), title: plainText(70), wrong: richText(220), right: richText(220), why: richText(260).optional(), narration}),
	/** A card that is mostly a figure: a map, a plot, a molecule, a timeline. */
	z.object({kind: z.literal('visual'), title: plainText(70), visual: CourseVisualSchema, caption: richText(200).optional(), beats, narration}),
	/**
	 * Predict, then see: a short question ("Eğim artarsa ne olur?") is asked and
	 * the viewer gets a few seconds to think, with a countdown; then the figure
	 * shows what happens, beat by beat, and the explanation closes it.
	 */
	z
		.object({
			kind: z.literal('predict'),
			/** For the script's reader; not shown (the badge already says "Önce tahmin et?"; a second heading broke the line of sight). */
			title: plainText(70),
			/**
			 * What the question is about when the choices do not carry it: the sentence, saying or data. Shown above the
			 * question from the start and read before the choices, so the viewer never answers about something not yet on
			 * screen (owner, 27 Oct 2026: "soru sorulmadan cevap bekleniyor").
			 */
			context: richText(300).optional(),
			prompt: richText(200),
			/** Short choices when the prediction is a choice. */
			choices: z.array(richText(60)).max(4).default([]),
			/** Index of the right choice, lit with the explanation. */
			answer: z.number().int().min(0).max(3).optional(),
			thinkSeconds: z.number().min(2).max(10).default(4),
			visual: CourseVisualSchema,
			beats: z.array(VisualBeatSchema).min(1).max(10),
			explanation: richText(300),
			/** Read while the question is on screen. */
			narration,
			/** Read with the explanation, after the figure. */
			explanationNarration: narration,
		})
		.refine((card) => card.answer === undefined || card.answer < card.choices.length, {path: ['answer'], message: 'answer must be the index of one of the choices.'}),
	/** A worked question. */
	z.object({kind: z.literal('question'), question: QuestionSchema}),
]);

export type LessonCard = z.infer<typeof LessonCardSchema>;

export const LessonSectionSchema = z.object({
	/** The subtopic (LessonMikro) the section covers, when it covers one. */
	subtopic: z.string().max(80).optional(),
	/** More subtopics taught in the same section, when sibling subtopics are best taught together (Cümlede Anlam: neden, amaç, koşul). */
	subtopics: z.array(z.string().max(80)).max(8).default([]),
	title: plainText(60),
	narration,
	cards: z
		.array(LessonCardSchema)
		.min(1)
		.max(14)
		.superRefine((cards, context) => {
			cards.forEach((card, index) => {
				if ('beats' in card && card.beats.length > 0 && !('visual' in card && card.visual)) context.addIssue({code: 'custom', path: [index, 'beats'], message: 'Beats move a visual; this card has none.'});
				if ('beats' in card && 'visual' in card && card.visual) {
					const names = numberedPartNames(card.visual);
					if (!names) return;
					const known = new Set(names.map((name) => name.toLocaleLowerCase('tr')));
					const visual = card.visual;
					card.beats.forEach((beat, beatIndex) => {
						const unknown = [...beat.show, ...beat.focus, ...beat.swap].filter((name) => !known.has(name.toLocaleLowerCase('tr')));
						if (unknown.length > 0) context.addIssue({code: 'custom', path: [index, 'beats', beatIndex], message: `No part ${unknown.join(', ')} on this ${visual.kind}; its parts are ${names.join(', ')}.`});
						const noSwap = beat.swap.filter((name) => visual.kind !== 'sentence' || !visual.parts[Number(name.replace(/^w/i, '')) - 1]?.swap);
						if (noSwap.length > 0) context.addIssue({code: 'custom', path: [index, 'beats', beatIndex, 'swap'], message: `${noSwap.join(', ')} has no swap word.`});
					});
				}
			});
		}),
});

/**
 * One round of a challenge reel. The sentence and the question are read as
 * they are written, then a countdown, then the answer and `why` (LessonSpeech).
 * Short on purpose: a round is about 9 s, so the sentence and the question
 * together are about eight words and the why three or four (docs/CourseNarration.md §10).
 */
export const ChallengeRoundSchema = z
	.object({
		/** The sentence, its word in focus in **bold**: "Domates henüz **olgun** değil." */
		sentence: richText(80),
		/** "Olgunun karşıtı ne?" */
		question: plainText(40),
		choices: z.array(plainText(28)).min(2).max(3),
		answer: z.number().int().min(0).max(2),
		/** The rule in a few words, said and shown with the answer: "Olumsuzluk **karşıtlık** değil." */
		why: richText(50),
	})
	.refine((round) => round.answer < round.choices.length, {path: ['answer'], message: 'answer must be the index of one of the choices.'});

export type ChallengeRound = z.infer<typeof ChallengeRoundSchema>;

/** A card of the short: the Reels cards (QuickRevision) plus a visual card. */
export const ShortCardSchema = z.union([RevisionCardSchema, z.object({kind: z.literal('visual'), title: plainText(50), visual: CourseVisualSchema, narration})]);

export type ShortCard = z.infer<typeof ShortCardSchema>;

export const LessonScriptSchema = z
	.object({
		/** The checklist entry the script belongs to (Curriculum/Production/Checklist.json). */
		topic: z.object({id: z.string().min(1).max(64), category: z.string().min(1).max(40), lesson: z.string().min(1).max(20), code: z.string().min(1).max(80)}),
		title: plainText(60),
		/** The lesson's name as shown: "Türkçe", "Matematik". */
		lessonName: plainText(40),
		/** The exams shown on the opening, e.g. ["YKS", "TYT"] or ["KPSS"]. */
		exams: z.array(plainText(12)).min(1).max(4),
		/** What the script was written from: data files (relative to Curriculum/Data), with pages where it helps. */
		sources: z.array(z.string().max(240)).default([]),

		/** The YouTube lesson. */
		lesson: z.object({
			hook: z.object({headline: plainText(80), narration}),
			/** What the viewer will be able to do; shown on the opening. */
			objectives: z.array(plainText(90)).min(2).max(6),
			sections: z.array(LessonSectionSchema).min(2).max(14),
			summary: z.object({points: z.array(richText(140)).min(2).max(8), warnings: z.array(richText(140)).max(4).default([]), narration}),
		}),

		/** The 1-2 minute summary for Reels, TikTok and Shorts. */
		short: z.object({
			/**
			 * The reel as a challenge: from the first frame a sentence with its
			 * word in focus, a question, two seconds to answer, then the answer
			 * and why; hardest-to-guess first. When given, the camp reel is made
			 * of these rounds instead of the summary cards (docs/CourseNarration.md §10).
			 */
			rounds: z.array(ChallengeRoundSchema).min(2).max(3).optional(),
			/**
			 * The opening line. A summary reel says it; a challenge reel shows it,
			 * silent, as a dare over its first question ("Üç soru, üçü de tuzak."),
			 * so the question itself is the first thing heard.
			 */
			hook: narration,
			cards: z.array(ShortCardSchema).min(3).max(12),
			/** One quick question the viewer can try; its solution is in the full lesson. */
			question: z.object({stem: richText(220), options: z.array(richText(60)).min(2).max(5), answer: z.number().int().min(0).max(4), narration}).optional(),
			summary: z.array(richText(90)).min(1).max(4),
		}),

		/** Voice-over text per line id, replacing the script's own. */
		script: z.record(z.string(), z.string().trim().min(1).max(1400)).default({}),
		/** The promotion at the end of both videos: shown, never spoken. It is the videos' outro and can be dropped like one. */
		outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
		/**
		 * The camp the topic is a lesson of (Courses/Camp). CampLesson and
		 * CampShort show it on the opening, in the chapter bar and at the end
		 * with the camp task and the next lesson; CourseLesson and CourseShort
		 * ignore it.
		 */
		camp: CampEpisodeSchema.optional(),
	})
	.refine((script) => script.lesson.sections.some((section) => section.cards.some((card) => card.kind === 'question')), {
		path: ['lesson', 'sections'],
		message: 'A lesson needs at least one worked question.',
	})
	.refine((script) => !script.short.question || script.short.question.answer < script.short.question.options.length, {path: ['short', 'question', 'answer'], message: 'answer must be the index of one of the options.'});

export type LessonScript = z.infer<typeof LessonScriptSchema>;

const WORDS_PER_SECOND = 2.3;
const words = (text: string): number => text.split(/\s+/).filter(Boolean).length;

/** Every spoken text of the lesson, in order. */
export const lessonNarrations = (script: LessonScript): string[] => [
	script.lesson.hook.narration,
	...script.lesson.sections.flatMap((section) => [
		section.narration,
		...section.cards.flatMap((card) => {
			// What the template reads besides the script: the question as written and the choices (LessonSpeech).
			if (card.kind === 'question') return [card.question.narration, `${spokenQuestion(card.question)} ${THINK_PROMPT}`, ...card.question.steps.map((step) => step.narration)];
			if (card.kind === 'predict') return [spokenPredictAsk(card), ...card.beats.map((beat) => beat.narration), card.explanationNarration];
			return [card.narration, ...('beats' in card ? card.beats.map((beat) => beat.narration) : [])];
		}),
	]),
	script.lesson.summary.narration,
	...(script.camp ? [script.camp.task.narration] : []),
];

export const shortNarrations = (script: LessonScript): string[] =>
	script.short.rounds?.length ? [...script.short.rounds.flatMap((round) => [spokenRoundAsk(round), spokenRoundReveal(round)]), CHALLENGE_SCORE_LINE] : summaryShortNarrations(script);

/** The spoken lines of a summary reel (CourseShort cards). */
const summaryShortNarrations = (script: LessonScript): string[] => [
	script.short.hook,
	...script.short.cards.map((card) => ('narration' in card && card.narration ? card.narration : 'text' in card ? card.text : 'term' in card ? `${card.term}. ${card.definition}` : card.title)),
	...(script.short.question ? [script.short.question.narration] : []),
	script.short.summary.join(' '),
];

/** Estimated spoken length in seconds, before any audio exists. */
export const estimatedSeconds = (texts: readonly string[]): number => texts.reduce((total, text) => total + words(text) / WORDS_PER_SECOND + 0.8, 0);

/** A dare shown over the first question: read in one glance. */
const CHALLENGE_HOOK_MAX_LENGTH = 40;

/**
 * A challenge reel's length before any audio: each line at the measured rate
 * plus the voice's lead and tail, each round's silent countdown.
 */
const estimatedChallengeSeconds = (rounds: readonly ChallengeRound[]): number =>
	[...rounds.flatMap((round) => [spokenRoundAsk(round), spokenRoundReveal(round)]), CHALLENGE_SCORE_LINE].reduce((total, text) => total + words(text) / COURSE_DESIGN.camp.challengeWordsPerSecond + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS, 0) +
	rounds.length * COURSE_DESIGN.camp.roundThinkSeconds;

/** Where a challenge reel would run long or open slowly. */
const challengeIssues = (script: LessonScript, rounds: readonly ChallengeRound[]): string[] => {
	const issues: string[] = [];
	if (script.short.hook.length > CHALLENGE_HOOK_MAX_LENGTH) issues.push(`The reel's hook is shown over the first question; keep it to ${CHALLENGE_HOOK_MAX_LENGTH} characters: "${script.short.hook}".`);
	rounds.forEach((round, index) => {
		const said = words(spokenRoundAsk(round)) + words(spokenRoundReveal(round));
		if (said > 14) issues.push(`Round ${index + 1} says ${said} words; about 12 keeps it near 9 s.`);
	});
	return issues;
};

/**
 * What a reviewer should look at before production: length against the
 * targets, and coverage of the topic's subtopics. Nothing here blocks a
 * render; it is the checklist's "Hazırlandı" check.
 */
export const reviewScript = (script: LessonScript, subtopicCodes: readonly string[] = []) => {
	const lessonSeconds = estimatedSeconds(lessonNarrations(script));
	const rounds = script.short.rounds ?? [];
	const shortSeconds = rounds.length > 0 ? estimatedChallengeSeconds(rounds) : estimatedSeconds(shortNarrations(script));
	const shortTarget = rounds.length > 0 ? COURSE_DESIGN.length.challenge : COURSE_DESIGN.length.short;
	const covered = new Set(script.lesson.sections.flatMap((section) => [section.subtopic, ...section.subtopics]).filter(Boolean));
	const issues: string[] = [];
	if (lessonSeconds < COURSE_DESIGN.length.lesson.min) issues.push(`The lesson reads in about ${Math.round(lessonSeconds / 60)} min; the target is at least ${COURSE_DESIGN.length.lesson.min / 60} min.`);
	if (shortSeconds < shortTarget.min || shortSeconds > shortTarget.max) issues.push(`The short reads in about ${Math.round(shortSeconds)} s; the target is ${shortTarget.min}-${shortTarget.max} s.`);
	if (rounds.length > 0) issues.push(...challengeIssues(script, rounds));
	const missing = subtopicCodes.filter((code) => !covered.has(code));
	if (missing.length > 0) issues.push(`Subtopics without a section: ${missing.join(', ')}.`);
	const questions = script.lesson.sections.flatMap((section) => section.cards).filter((card) => card.kind === 'question').length;
	if (questions < 3) issues.push(`Only ${questions} worked question(s); three or more cover the exam's approaches better.`);
	issues.push(...spokenTextIssues(script));
	return {lessonSeconds, shortSeconds, questions, issues};
};

/**
 * Where the voice and the screen disagree (docs/CourseNarration.md §4): an
 * example or a sentence on screen that is not read as it is written, and a
 * beat that is not a whole sentence (said on its own line, a fragment makes
 * the voice stop mid-thought). Questions and prediction choices need no
 * check: the template reads them from the screen text itself (LessonSpeech).
 */
/** A prediction that points at a sentence or saying ("bu cümlede", "bu sözüne"): its figure comes only after the countdown. */
const REFERS_TO_UNSEEN = /(?<!\p{L})(bu|şu)\s+(cümle|söz|özdeyiş|ifade|dize|paragraf|metin|örnek)\p{L}*/iu;

export const spokenTextIssues = (script: LessonScript): string[] => {
	const issues: string[] = [];
	script.lesson.sections.forEach((section, sectionIndex) => {
		section.cards.forEach((card, cardIndex) => {
			const where = `s${sectionIndex + 1}-c${cardIndex + 1}`;
			if (card.kind === 'question') return;
			const beats = 'beats' in card ? card.beats : [];
			const said = [card.narration, ...beats.map((beat) => beat.narration), card.kind === 'predict' ? card.explanationNarration : ''].join(' ');
			beats.forEach((beat, beatIndex) => {
				if (!isWholeSentence(beat.narration)) issues.push(`${where} beat ${beatIndex + 1} is not a whole sentence: "${beat.narration}".`);
			});
			if (card.kind === 'example' && !isSpoken(card.example, said)) issues.push(`${where}: the example "${card.example}" is not read as it is written.`);
			if (card.kind === 'predict' && !card.context && REFERS_TO_UNSEEN.test(`${card.prompt} ${card.narration}`)) {
				issues.push(`${where}: the prediction asks about "${REFERS_TO_UNSEEN.exec(`${card.prompt} ${card.narration}`)?.[0]}" but nothing on screen shows it while it is asked; put it in \`context\`.`);
			}
			const visual = 'visual' in card ? card.visual : undefined;
			if (visual?.kind === 'sentence') {
				const sentence = visual.parts.map((part) => part.text).join(' ');
				if (!isSpoken(sentence, said)) issues.push(`${where}: the sentence "${sentence}" on screen is not read as it is written.`);
			}
		});
	});
	return issues;
};