import {z} from 'zod';
import {CourseVisualSchema} from '../Components/Visuals/VisualSchemas';
import {latex, plainText, richText} from '../Schemas/RichText';
import {RevisionCardSchema} from '../Templates/Education/QuickRevision/QuickRevisionSchema';
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
	.refine((question) => new Set(question.options).size === question.options.length, {path: ['options'], message: 'options must be different from each other.'});

export type Question = z.infer<typeof QuestionSchema>;

/** The cards of a lesson. Every kind can carry a visual; `visual` is a card that is mostly a visual. */
export const LessonCardSchema = z.discriminatedUnion('kind', [
	/** A definition or an explanation. */
	z.object({kind: z.literal('concept'), title: plainText(70), text: richText(420), visual: CourseVisualSchema.optional(), narration}),
	/** Rules or properties as a short list. */
	z.object({kind: z.literal('rule'), title: plainText(70), items: z.array(richText(160)).min(1).max(6), visual: CourseVisualSchema.optional(), narration}),
	/** An example and what it shows. */
	z.object({kind: z.literal('example'), title: plainText(70), example: richText(300), explanation: richText(300).optional(), visual: CourseVisualSchema.optional(), narration}),
	/** A common mistake: what students do, what is right, and why. */
	z.object({kind: z.literal('mistake'), title: plainText(70), wrong: richText(220), right: richText(220), why: richText(260).optional(), narration}),
	/** A card that is mostly a figure: a map, a plot, a molecule, a timeline. */
	z.object({kind: z.literal('visual'), title: plainText(70), visual: CourseVisualSchema, caption: richText(200).optional(), narration}),
	/** A worked question. */
	z.object({kind: z.literal('question'), question: QuestionSchema}),
]);

export type LessonCard = z.infer<typeof LessonCardSchema>;

export const LessonSectionSchema = z.object({
	/** The subtopic (LessonMikro) the section covers, when it covers one. */
	subtopic: z.string().max(80).optional(),
	title: plainText(60),
	narration,
	cards: z.array(LessonCardSchema).min(1).max(14),
});

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
		/** What the script was written from: corpus files (relative to Curriculum/ReferenceCorpus). */
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
		...section.cards.flatMap((card) => (card.kind === 'question' ? [card.question.narration, ...card.question.steps.map((step) => step.narration)] : [card.narration])),
	]),
	script.lesson.summary.narration,
];

export const shortNarrations = (script: LessonScript): string[] => [
	script.short.hook,
	...script.short.cards.map((card) => ('narration' in card && card.narration ? card.narration : 'text' in card ? card.text : 'term' in card ? `${card.term}. ${card.definition}` : card.title)),
	...(script.short.question ? [script.short.question.narration] : []),
	script.short.summary.join(' '),
];

/** Estimated spoken length in seconds, before any audio exists. */
export const estimatedSeconds = (texts: readonly string[]): number => texts.reduce((total, text) => total + words(text) / WORDS_PER_SECOND + 0.8, 0);

/**
 * What a reviewer should look at before production: length against the
 * targets, and coverage of the topic's subtopics. Nothing here blocks a
 * render; it is the checklist's "Hazırlandı" check.
 */
export const reviewScript = (script: LessonScript, subtopicCodes: readonly string[] = []) => {
	const lessonSeconds = estimatedSeconds(lessonNarrations(script));
	const shortSeconds = estimatedSeconds(shortNarrations(script));
	const covered = new Set(script.lesson.sections.map((section) => section.subtopic).filter(Boolean));
	const issues: string[] = [];
	if (lessonSeconds < COURSE_DESIGN.length.lesson.min) issues.push(`The lesson reads in about ${Math.round(lessonSeconds / 60)} min; the target is at least ${COURSE_DESIGN.length.lesson.min / 60} min.`);
	if (shortSeconds < COURSE_DESIGN.length.short.min || shortSeconds > COURSE_DESIGN.length.short.max) issues.push(`The short reads in about ${Math.round(shortSeconds)} s; the target is ${COURSE_DESIGN.length.short.min}-${COURSE_DESIGN.length.short.max} s.`);
	const missing = subtopicCodes.filter((code) => !covered.has(code));
	if (missing.length > 0) issues.push(`Subtopics without a section: ${missing.join(', ')}.`);
	const questions = script.lesson.sections.flatMap((section) => section.cards).filter((card) => card.kind === 'question').length;
	if (questions < 3) issues.push(`Only ${questions} worked question(s); three or more cover the exam's approaches better.`);
	return {lessonSeconds, shortSeconds, questions, issues};
};
