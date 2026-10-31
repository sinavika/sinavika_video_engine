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
 * Desktop/EgitimVerileri use the same ones), so a topic here, its lesson
 * explanation and a lesson in the app are always the same thing.
 */

export const CURRICULUM_DIRECTORY = 'Curriculum';

const Code = z.string().trim().min(1).max(80);
const Name = z.string().trim().min(1).max(200);
const Id = z.string().trim().min(1).max(64);

const SubtopicSchema = z.object({code: Code, id: Id, name: Name});

const TopicSchema = z.object({code: Code, id: Id, name: Name, subtopics: z.array(SubtopicSchema).min(1)});

const LessonSchema = z.object({code: Code, id: Id, name: Name, topics: z.array(TopicSchema).min(1)});

const CategorySchema = z.object({
	exam: Code,
	examId: Id,
	examName: Name,
	code: Code,
	id: Id,
	name: Name,
	lessons: z.array(LessonSchema).min(1),
});

export type Topic = z.infer<typeof TopicSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Category = z.infer<typeof CategorySchema>;

/**
 * Production order of exam categories. Categories not listed follow in the
 * order of the lesson list.
 */
const CATEGORY_PRIORITY = ['YKS_TYT', 'YKS_AYT', 'YKS_YDT', 'KPSS_LISANS', 'KPSS_ONLISANS', 'KPSS_ORTAOGRETIM'] as const;

/**
 * Production order of lessons inside a category: Türkçe, then Matematik,
 * then Tarih, then the rest in the order of the lesson list. AYT has no
 * "Türkçe"; its Türk Dili ve Edebiyatı takes that place, and its two history
 * lessons both count as Tarih.
 */
const LESSON_PRIORITY: readonly (readonly string[])[] = [['TRK', 'TDE'], ['MAT'], ['TAR', 'TAR1', 'TAR2']];

const rankOf = (list: readonly string[], code: string): number => {
	const index = list.indexOf(code);
	return index === -1 ? list.length : index;
};

const lessonRank = (code: string): number => {
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
	/** What the data holds for this topic. Paths are relative to the education data folder (Desktop/EgitimVerileri, `educationDataDirectory`). */
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
	/**
	 * Files produced for the topic, relative to the project root. `scripts` lists every script that teaches the
	 * topic's subtopics when there is more than one (one KPSS video set serves three levels, see `subtopicCoverage`);
	 * `script` is then the one that teaches the most of them.
	 */
	files: z.object({script: z.string().optional(), scripts: z.array(z.string()).optional(), youtube: z.string().optional(), short: z.string().optional()}).default({}),
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

/**
 * Categories whose lists are copies of another's (same topics, same subtopic codes, same names, other ids): what
 * teaches a subtopic of one teaches it for both. KPSS Ortaöğretim repeats KPSS Önlisans (checked 31 Oct 2026).
 */
const TWIN_CATEGORIES: Readonly<Record<string, string>> = {KPSS_ORTAOGRETIM: 'KPSS_ONLISANS'};

/** Lessons listed twice in one category with the same topics and subtopics: AYT history and geography (Tarih-2, Coğrafya-2). */
export const TWIN_LESSONS: Readonly<Record<string, string>> = {TAR2: 'TAR1', COG2: 'COG1'};

/**
 * A subtopic named across categories and lessons: CATEGORY/LESSON:CODE, twins folded into the list they copy. A code
 * alone means a different subtopic in each level's list, and YDT's languages reuse each other's codes.
 */
const subtopicRef = (category: string, lesson: string, code: string) => `${TWIN_CATEGORIES[category] ?? category}/${TWIN_LESSONS[lesson] ?? lesson}:${code}`;

/** A script as coverage sees it: where it is and which subtopics (subtopicRef) its sections teach. */
export type TeachingScript = {file: string; refs: readonly string[]};

type TaughtSection = {subtopic?: string; subtopics: readonly string[]; alsoTeaches: readonly string[]};

/** The subtopics one section teaches: its own codes under the script's category, and the other levels' it names (same lesson). */
export const sectionRefs = (category: string, lesson: string, section: TaughtSection) => [
	...[section.subtopic, ...section.subtopics].filter((code): code is string => Boolean(code)).map((code) => subtopicRef(category, lesson, code)),
	...section.alsoTeaches.map((ref) => subtopicRef(ref.split(':')[0], lesson, ref.split(':')[1])),
];

/** The subtopics a script's sections teach. */
export const taughtRefs = (category: string, lesson: string, sections: readonly TaughtSection[]) => sections.flatMap((section) => sectionRefs(category, lesson, section));

/** The reference of one of a topic's subtopics, to compare with what sections teach. */
export const entryRef = (entry: Pick<ChecklistEntry, 'category' | 'lesson'>, code: string) => subtopicRef(entry.category, entry.lesson, code);

/**
 * Which scripts teach each topic's subtopics, and which subtopics no script teaches. One KPSS video set serves
 * Lisans, Önlisans and Ortaöğretim (owner, 31 Oct 2026): a topic of one level may be taught across several
 * episodes, so coverage is counted subtopic by subtopic over all the scripts, not script by script. A script counts
 * for a topic when it teaches at least one of its subtopics; scripts are ordered by how many they teach.
 */
export const subtopicCoverage = (entries: readonly ChecklistEntry[], scripts: readonly TeachingScript[]) => {
	const taught = new Set(scripts.flatMap((script) => script.refs));
	return entries.map((entry) => {
		const refs = entry.subtopics.map((subtopic) => ({code: subtopic.code, ref: entryRef(entry, subtopic.code)}));
		const teaching = scripts
			.map((script) => ({file: script.file, count: refs.filter(({ref}) => script.refs.includes(ref)).length}))
			.filter((script) => script.count > 0)
			.sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));
		return {entry, missing: refs.filter(({ref}) => !taught.has(ref)).map(({code}) => code), scripts: teaching.map((script) => script.file)};
	});
};

/** Subtopics a script names that no checklist topic has: a typo, or a code put under the wrong category. */
export const unknownSubtopics = (entries: readonly ChecklistEntry[], scripts: readonly TeachingScript[]) => {
	const known = new Set(entries.flatMap((entry) => entry.subtopics.map((subtopic) => entryRef(entry, subtopic.code))));
	return scripts.flatMap((script) => script.refs.filter((ref) => !known.has(ref)).map((ref) => ({file: script.file, ref})));
};

/** The first topic whose given stage is not done yet: what to work on next. */
export const nextEntry = (checklist: Checklist, stage: ChecklistStage = 'youtube'): ChecklistEntry | undefined =>
	checklist.entries.find((entry) => entry.status[stage] === null);
