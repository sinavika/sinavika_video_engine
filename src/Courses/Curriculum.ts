import {z} from 'zod';

/**
 * The curriculum the education videos are produced from, and the order they
 * are produced in.
 *
 *   Exam (YKS, KPSS)
 *     Category (YKS_TYT, KPSS_LISANS)        what the lesson list calls CategorySub
 *       Lesson (TRK, MAT)                    LessonMain
 *         Topic (SOZCUKTE_ANLAM)             LessonSub: one YouTube video and one short each
 *           Subtopic (SOZCUKTE_ANLAM_01)     LessonMikro: a section of that video
 *
 * The codes and ids are the platform's own (the lesson list and the data in
 * Curriculum/Data use the same ones), so a topic here, its lesson
 * explanation and a lesson in the app are always the same thing.
 */

export const CURRICULUM_DIRECTORY = 'Curriculum';

/** The copy of Desktop/EgitimVerileri (YKS and KPSS lesson explanations and questions), inside CURRICULUM_DIRECTORY. Not in git. */
export const DATA_DIRECTORY = 'Data';

const Code = z.string().trim().min(1).max(80);
const Name = z.string().trim().min(1).max(200);
const Id = z.string().trim().min(1).max(64);

export const SubtopicSchema = z.object({code: Code, id: Id, name: Name});

export const TopicSchema = z.object({code: Code, id: Id, name: Name, subtopics: z.array(SubtopicSchema).min(1)});

export const LessonSchema = z.object({code: Code, id: Id, name: Name, topics: z.array(TopicSchema).min(1)});

export const CategorySchema = z.object({
	exam: Code,
	examId: Id,
	examName: Name,
	code: Code,
	id: Id,
	name: Name,
	lessons: z.array(LessonSchema).min(1),
});

export type Subtopic = z.infer<typeof SubtopicSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Category = z.infer<typeof CategorySchema>;

/**
 * Production order of exam categories. Categories not listed follow in the
 * order of the lesson list.
 */
export const CATEGORY_PRIORITY = ['YKS_TYT', 'YKS_AYT', 'YKS_YDT', 'KPSS_LISANS', 'KPSS_ONLISANS', 'KPSS_ORTAOGRETIM'] as const;

/**
 * Production order of lessons inside a category: Türkçe, then Matematik,
 * then Tarih, then the rest in the order of the lesson list. AYT has no
 * "Türkçe"; its Türk Dili ve Edebiyatı takes that place, and its two history
 * lessons both count as Tarih.
 */
export const LESSON_PRIORITY: readonly (readonly string[])[] = [['TRK', 'TDE'], ['MAT'], ['TAR', 'TAR1', 'TAR2']];

const rankOf = (list: readonly string[], code: string): number => {
	const index = list.indexOf(code);
	return index === -1 ? list.length : index;
};

export const lessonRank = (code: string): number => {
	const index = LESSON_PRIORITY.findIndex((codes) => codes.includes(code));
	return index === -1 ? LESSON_PRIORITY.length : index;
};

/** Categories and their lessons in production order. Within a rank the lesson list's order is kept (sort is stable). */
export const inProductionOrder = (categories: readonly Category[]): Category[] =>
	[...categories]
		.sort((a, b) => rankOf(CATEGORY_PRIORITY, a.code) - rankOf(CATEGORY_PRIORITY, b.code))
		.map((category) => ({...category, lessons: [...category.lessons].sort((a, b) => lessonRank(a.code) - lessonRank(b.code))}));

/** A stage of production is either not done (null) or done on a date. */
const Stage = z.iso.datetime({offset: true}).nullable().default(null);

/**
 * One video to make: a topic of a lesson of an exam category. The checklist
 * holds one entry per topic, in production order; `order` is its place in
 * the queue.
 */
export const ChecklistEntrySchema = z.object({
	order: z.number().int().min(1),
	/** The topic's id in the lesson list (LessonSub id). */
	id: Id,
	exam: Code,
	category: Code,
	categoryName: Name,
	lesson: Code,
	lessonName: Name,
	topic: Code,
	topicName: Name,
	subtopics: z.array(SubtopicSchema),
	/** What the data holds for this topic. Paths are relative to Curriculum/Data (the copy of Desktop/EgitimVerileri). */
	sources: z.object({
		/** The lesson explanation: subtopics and the explanation text by source. */
		explanation: z.string().nullable(),
		/** The questions bound to the topic, one JSON object per line. */
		questions: z.string().nullable(),
		questionCount: z.number().int().min(0),
		/** Questions with a known answer. */
		answeredCount: z.number().int().min(0),
		/** Past ÖSYM questions: read for approach and structure, never shown as they are. */
		pastExamCount: z.number().int().min(0),
	}),
	status: z
		.object({
			/** Hazırlandı: the script and scene plan are written and checked. */
			prepared: Stage,
			/** Kullanıldı: the topic's sources have been used for a script. */
			used: Stage,
			/** YouTube videosu üretildi. */
			youtube: Stage,
			/** Kısa video üretildi. */
			short: Stage,
		})
		.default({prepared: null, used: null, youtube: null, short: null}),
	/** Files produced for the topic, relative to the project root. */
	files: z.object({script: z.string().optional(), youtube: z.string().optional(), short: z.string().optional()}).default({}),
	notes: z.string().max(2000).optional(),
});

export type ChecklistEntry = z.infer<typeof ChecklistEntrySchema>;
export type ChecklistStage = keyof ChecklistEntry['status'];

export const CHECKLIST_STAGES = ['prepared', 'used', 'youtube', 'short'] as const satisfies readonly ChecklistStage[];

export const STAGE_LABELS: Record<ChecklistStage, string> = {
	prepared: 'Hazırlandı',
	used: 'Kullanıldı',
	youtube: 'YouTube videosu üretildi',
	short: 'Kısa video üretildi',
};

export const ChecklistSchema = z.object({
	schemaVersion: z.literal(1),
	generatedFrom: z.string(),
	entries: z.array(ChecklistEntrySchema),
});

export type Checklist = z.infer<typeof ChecklistSchema>;

/** The first topic whose given stage is not done yet: what to work on next. */
export const nextEntry = (checklist: Checklist, stage: ChecklistStage = 'youtube'): ChecklistEntry | undefined =>
	checklist.entries.find((entry) => entry.status[stage] === null);
