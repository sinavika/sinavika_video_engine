import {z} from 'zod';
import {entryRef, sectionRefs, type ChecklistEntry} from './Curriculum';
import type {LessonScript} from './LessonScript';

/** Where the Works views go: Curriculum/Works/<CATEGORY>/<LESSON>/<TOPIC>.json, one per checklist topic. */
export const WORKS_DIRECTORY = 'Works';

const WORKS_NOTES_MAX = 12;

/**
 * One checklist topic as Works imports it (the API's WorkScriptDto: topic, title, lesson, camp task, works notes),
 * built from the scripts that teach it. A video script is one episode; a level's topic may be taught across several
 * episodes, and one episode may serve three levels whose subtopic codes mean different things (KPSS, owner
 * 31 Oct 2026). The view names the topic in its own level's codes, so Works never has to untangle the video set:
 * every section carries only this topic's subtopic codes.
 */
const WorksViewSchema = z.object({
	topic: z.object({id: z.string().min(1), category: z.string().min(1), lesson: z.string().min(1), code: z.string().min(1)}),
	title: z.string().min(1),
	lessonName: z.string().min(1),
	exams: z.array(z.string().min(1)).min(1),
	/** The scripts the view was built from, the one teaching the most of the topic first. */
	sourceScripts: z.array(z.string().min(1)).min(1),
	lesson: z.object({
		hook: z.object({headline: z.string().min(1), narration: z.string().min(1)}),
		objectives: z.array(z.string().min(1)).min(1),
		/** A section without a subtopic (an overview, mixed practice) comes from the topic's own script, where it stood. */
		sections: z
			.array(z.object({subtopic: z.string().min(1).optional(), subtopics: z.array(z.string().min(1)), title: z.string().min(1), narration: z.string(), cards: z.array(z.unknown()).min(1)}))
			.min(1),
		summary: z.object({points: z.array(z.string()), warnings: z.array(z.string())}),
	}),
	camp: z.object({task: z.object({items: z.array(z.string())})}).optional(),
	works: z.object({additions: z.array(z.string()).min(1).max(WORKS_NOTES_MAX)}).optional(),
});

type WorksView = z.infer<typeof WorksViewSchema>;

type Source = {file: string; script: LessonScript};

/** Takes from each list in turn, skipping repeats, until `limit` items: every source gets its say. */
const interleave = (lists: readonly (readonly string[])[], limit: number) => {
	const out: string[] = [];
	for (let index = 0; out.length < limit && lists.some((list) => index < list.length); index += 1)
		lists.forEach((list) => {
			if (out.length < limit && index < list.length && !out.includes(list[index])) out.push(list[index]);
		});
	return out;
};

/**
 * The Works view of `entry` from the scripts given (any scripts; only the ones that teach its subtopics are used),
 * or the subtopics still taught nowhere. Subtopics the topic's own script leaves out on purpose (`outOfScope`, with
 * its reason) are not asked for. Sections follow the topic's subtopic order.
 */
export const worksViewOf = (entry: ChecklistEntry, sources: readonly Source[]): {view: WorksView} | {missing: string[]} => {
	const codes = entry.subtopics.map((subtopic) => subtopic.code);
	const own = sources.filter(({script}) => entryRef(script.topic, script.topic.code) === entryRef(entry, entry.topic));
	const skipped = new Set(own.flatMap(({script}) => script.outOfScope.flatMap((group) => group.codes)));
	type Found = {source: Source; sourceIndex: number; sectionIndex: number; at: number; section: WorksView['lesson']['sections'][number]};
	const found: Found[] = sources.flatMap((source, sourceIndex) =>
		source.script.lesson.sections.flatMap((section, sectionIndex): Found[] => {
			const refs = new Set(sectionRefs(source.script.topic.category, source.script.topic.lesson, section));
			const matched = codes.filter((code) => refs.has(entryRef(entry, code)));
			const content = {title: section.title, narration: section.narration, cards: section.cards};
			if (matched.length > 0) return [{source, sourceIndex, sectionIndex, at: codes.indexOf(matched[0]), section: {subtopic: matched[0], subtopics: matched.slice(1), ...content}}];
			// A section without a subtopic (overview, mixed practice) stays where it was in the topic's own script.
			return refs.size === 0 && own.includes(source) ? [{source, sourceIndex, sectionIndex, at: Infinity, section: {subtopics: [], ...content}}] : [];
		}),
	);
	const taught = new Set(found.flatMap((item) => [item.section.subtopic, ...item.section.subtopics]));
	const missing = codes.filter((code) => !taught.has(code) && !skipped.has(code));
	if (missing.length > 0 || found.length === 0) return {missing: missing.length > 0 ? missing : codes};
	const teaching = [...new Set(found.map((item) => item.source))]
		.map((source) => ({source, count: new Set(found.filter((item) => item.source === source).flatMap((item) => [item.section.subtopic, ...item.section.subtopics])).size}))
		.sort((a, b) => b.count - a.count || sources.indexOf(a.source) - sources.indexOf(b.source))
		.map((item) => item.source);
	const [primary] = teaching;
	const entersAt = (source: Source) => Math.min(...found.filter((item) => item.source === source).map((item) => item.at));
	const scripts = teaching.map((source) => source.script);
	const notes = interleave(
		scripts.map((script) => script.works?.additions ?? []),
		WORKS_NOTES_MAX,
	);
	const view: WorksView = {
		topic: {id: entry.id, category: entry.category, lesson: entry.lesson, code: entry.topic},
		title: entry.topicName,
		lessonName: entry.lessonName,
		exams: primary.script.exams,
		sourceScripts: teaching.map((source) => source.file),
		lesson: {
			hook: primary.script.lesson.hook,
			objectives: interleave(
				scripts.map((script) => script.lesson.objectives),
				8,
			),
			// Each script keeps its teaching order; scripts follow where they enter the topic's subtopic list.
			sections: found.sort((a, b) => entersAt(a.source) - entersAt(b.source) || a.sourceIndex - b.sourceIndex || a.sectionIndex - b.sectionIndex).map((item) => item.section),
			summary: {
				points: interleave(
					scripts.map((script) => script.lesson.summary.points),
					8,
				),
				warnings: interleave(
					scripts.map((script) => script.lesson.summary.warnings),
					4,
				),
			},
		},
		...(primary.script.camp ? {camp: {task: {items: primary.script.camp.task.items}}} : {}),
		...(notes.length > 0 ? {works: {additions: notes}} : {}),
	};
	return {view: WorksViewSchema.parse(view)};
};
