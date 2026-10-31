import {z} from 'zod';
import {plainText, richText} from '../Schemas/RichText';
import {turkishCardinal, turkishOrdinal} from '../Schemas/SpokenText';
import type {Checklist, ChecklistEntry} from './Curriculum';

/**
 * A camp ("kamp"): the topics of one lesson of one exam, published as a
 * numbered series. Every lesson of the camp is a YouTube video of at least
 * ten minutes (CampLesson) and a reel made from the same script (CampShort),
 * so both look the same and point at each other.
 *
 *   Curriculum/Camps/<camp id>.json     e.g. Curriculum/Camps/yks-tyt-turkce-kampi.json
 *
 * The camp file is the plan: which topics, in which order. A script joins the
 * camp through its `camp` field (CampEpisodeSchema), which carries what the
 * video shows: the camp's name, the lesson's number, the next lesson and the
 * camp task.
 */

export const CAMPS_DIRECTORY = 'Camps';

const Slug = z
	.string()
	.max(60)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, digits and single hyphens');

const narration = z.string().trim().min(1).max(1400);

export const CampSchema = z
	.object({
		id: Slug,
		/** As shown, in sentence case: "TYT Türkçe kampı". */
		name: plainText(40),
		category: z.string().min(1).max(40),
		lesson: z.string().min(1).max(20),
		lessonName: plainText(40),
		exams: z.array(plainText(12)).min(1).max(4),
		/** What the camp gets the viewer, one sentence: shown on every lesson's camp card. */
		promise: plainText(90),
		/** The topics in publishing order; a topic's place is its lesson number. */
		lessons: z.array(z.object({topic: z.string().min(1).max(80), title: plainText(60)})).min(2).max(99),
	})
	.refine((camp) => new Set(camp.lessons.map((lesson) => lesson.topic)).size === camp.lessons.length, {path: ['lessons'], message: 'a topic appears once in a camp.'});

export type Camp = z.infer<typeof CampSchema>;

/**
 * What a lesson script carries of its camp. The welcome and the section titles
 * are spoken from these fields by the template (campWelcomeNarration,
 * sectionTitleNarration), the same way in every lesson; the task is the
 * script's own. `welcome` replaces the generated welcome when a lesson needs
 * its own words.
 */
export const CampEpisodeSchema = z
	.object({
		id: Slug,
		name: plainText(40),
		/** The lesson's number in the camp, from 1. */
		number: z.number().int().min(1).max(99),
		total: z.number().int().min(2).max(99),
		/** The previous lesson's title, recalled in the welcome. The first lesson has none. */
		previous: plainText(60).optional(),
		/** The next lesson's title, announced at the end. The last lesson has none. */
		next: plainText(60).optional(),
		/** The camp's promise, shown on the camp card. */
		promise: plainText(90).optional(),
		/** The camp task at the end: one to three things to do before the next lesson, and what is said over them. */
		task: z.object({items: z.array(richText(140)).min(1).max(3), narration}),
		welcome: narration.optional(),
	})
	.refine((episode) => episode.number <= episode.total, {path: ['number'], message: 'number must not exceed total.'});

export type CampEpisode = z.infer<typeof CampEpisodeSchema>;

const TURKISH_ASCII: Record<string, string> = {ç: 'c', ğ: 'g', ı: 'i', i̇: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u'};

/** "YKS TYT Türkçe kampı" → "yks-tyt-turkce-kampi". */
export const campSlug = (text: string): string =>
	text
		.toLocaleLowerCase('tr-TR')
		.replace(/[çğıöşüâîû]|i̇/g, (letter) => TURKISH_ASCII[letter] ?? letter)
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

/**
 * A camp with every topic of a lesson, in the checklist's (production) order.
 * Name and id come from the exam category and the lesson unless given.
 */
export const campFromChecklist = (checklist: Checklist, options: {category: string; lesson: string; name?: string; promise?: string}): Camp => {
	const entries: ChecklistEntry[] = checklist.entries.filter((entry) => entry.category === options.category && entry.lesson === options.lesson);
	if (entries.length < 2) throw new Error(`${options.category}/${options.lesson} has ${entries.length} topic(s); a camp needs at least two.`);
	const [first] = entries;
	const name = options.name ?? `${first.categoryName} ${first.lessonName} kampı`;
	return CampSchema.parse({
		id: campSlug(name.startsWith(first.exam) ? name : `${first.exam} ${name}`),
		name,
		category: first.category,
		lesson: first.lesson,
		lessonName: first.lessonName,
		exams: [...new Set([first.exam, first.categoryName.split(' ')[0]])],
		promise: options.promise ?? `${first.lessonName} konularının hepsi, sırayla ve soru çözerek.`,
		lessons: entries.map((entry) => ({topic: entry.topic, title: entry.topicName})),
	});
};

/** The camp fields of one topic's script: its number, the next lesson, and the given task. */
export const campEpisode = (camp: Camp, topic: string, task: CampEpisode['task']): CampEpisode => {
	const index = camp.lessons.findIndex((lesson) => lesson.topic === topic);
	if (index === -1) throw new Error(`${topic} is not a lesson of ${camp.id}.`);
	return CampEpisodeSchema.parse({
		id: camp.id,
		name: camp.name,
		number: index + 1,
		total: camp.lessons.length,
		previous: camp.lessons[index - 1]?.title,
		next: camp.lessons[index + 1]?.title,
		promise: camp.promise,
		task,
	});
};

/** Where a script's camp fields disagree with the camp file: wrong number, total, name or next lesson. */
export const campMismatches = (camp: Camp, topic: string, episode: CampEpisode): string[] => {
	const index = camp.lessons.findIndex((lesson) => lesson.topic === topic);
	if (index === -1) return [`${topic} is not a lesson of ${camp.id}.`];
	const issues: string[] = [];
	if (episode.id !== camp.id) issues.push(`camp.id is ${episode.id}; the camp is ${camp.id}.`);
	if (episode.name !== camp.name) issues.push(`camp.name is "${episode.name}"; the camp is "${camp.name}".`);
	if (episode.number !== index + 1) issues.push(`camp.number is ${episode.number}; the topic is lesson ${index + 1}.`);
	if (episode.total !== camp.lessons.length) issues.push(`camp.total is ${episode.total}; the camp has ${camp.lessons.length} lessons.`);
	const next = camp.lessons[index + 1]?.title;
	if (episode.next !== next) issues.push(`camp.next is "${episode.next ?? ''}"; the next lesson is "${next ?? ''}".`);
	const previous = camp.lessons[index - 1]?.title;
	if (episode.previous !== previous) issues.push(`camp.previous is "${episode.previous ?? ''}"; the previous lesson is "${previous ?? ''}".`);
	return issues;
};

// ---------------------------------------------------------------- spoken lines

// Number words live with the other speech rules; re-exported for the camp's callers.
export {turkishCardinal, turkishOrdinal};

const capitalise = (text: string): string => text.charAt(0).toLocaleUpperCase('tr') + text.slice(1);

/** "TYT Türkçe kampı" → "TYT Türkçe kampına": the camp names this engine makes all end in "kampı". */
const toCamp = (name: string): string => (/kampı$/.test(name) ? name.replace(/kampı$/, 'kampına') : `${name} serisine`);

/**
 * The welcome at the start of every camp lesson, in SinoAI's voice: who is
 * speaking, which camp and which lesson this is, what came before, and what
 * the viewer will get. YouTube viewers expect a host to greet them (owner,
 * 25 Oct 2026); the words are the same in every lesson so the series sounds
 * like one.
 */
export const campWelcomeNarration = (camp: CampEpisode, lesson: {title: string; lessonName: string}): string => {
	if (camp.welcome) return camp.welcome;
	const where =
		camp.number === 1
			? `Bu kampta ${lesson.lessonName} konularının hepsini sırayla ve soru çözerek işleyeceğiz. Bugün kampın ilk dersindeyiz: ${lesson.title}.`
			: camp.number === camp.total
				? `Bugün kampın son dersindeyiz: ${lesson.title}.${camp.previous ? ` Geçen derste ${camp.previous} konusunu işlemiştik.` : ''}`
				: `Bugün kampın ${turkishOrdinal(camp.number)} dersindeyiz: ${lesson.title}.${camp.previous ? ` Geçen derste ${camp.previous} konusunu işlemiştik.` : ''}`;
	return [
		`Merhaba, ben SinoAI. Sınavika'nın ${toCamp(camp.name)} hoş geldin!`,
		where,
		'Konuyu adım adım öğrenecek, sınav tarzı sorular çözeceğiz. Videonun sonunda da seni bir kamp görevi bekliyor.',
		'Hazırsan başlayalım!',
	].join(' ');
};

/**
 * What is said as a section opens: "İkinci bölüm: Mecaz anlam." spoken on its
 * own, before the section's first sentence, so a new part is heard as a
 * heading and not run into the explanation (owner, 25 Oct 2026).
 */
export const sectionTitleNarration = (index: number, title: string): string => `${capitalise(turkishOrdinal(index + 1))} bölüm: ${title}.`;
