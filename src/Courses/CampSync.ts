import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {courseLessonColor} from '../Configurations/LessonColors';
import {CAMPS_DIRECTORY, CampSchema, type Camp} from './Camp';
import {CURRICULUM_DIRECTORY} from './Curriculum';
import type {CampSyncEntry} from './CampApiClient';

/**
 * How the engine's camp files map onto the API's camps (`npm run camp`). A camp is a LessonMain on the server, a
 * script a LessonSub; episode 0 is the script coded `INTRO`. The engine keeps its own names: the camp slug is the camp
 * file's id (scripts carry it in `camp.id`, which the server checks) and a script's code is its topic code.
 *
 * The text of a version is the file exactly as it is on disk, and its hash is the SHA-256 of those bytes, so the
 * render gate can compare a local file with the approved version without parsing either.
 */

/** Episode 0's script code on the server. */
export const INTRO_CODE = 'INTRO';

/** The job templates whose words are a camp script: the lesson and its reel read a script file, episode 0 is its own job. */
const SCRIPT_TEMPLATES = ['CampLesson', 'CampShort'];
const INTRO_TEMPLATE = 'CampLessonIntro';

/** The server's CategorySub code for an engine camp category: KPSS camps are filed under Lisans and also serve the others. */
const CATEGORY_SUB: Record<string, {categorySub: string; also: string[]}> = {
	KPSS: {categorySub: 'KPSS_LISANS', also: ['KPSS_ONLISANS', 'KPSS_ORTAOGRETIM']},
};
/** Camps are listed TYT first, then AYT, then KPSS, as the channel publishes them. */
const CATEGORY_ORDER = ['YKS_TYT', 'YKS_AYT', 'KPSS'];

export const contentHash = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

/** A file's text for a version: read as UTF-8 without a byte order mark, which JSON never needs. */
export const readContent = (file: string): string => readFileSync(file, 'utf8').replace(/^﻿/, '');

/** One script of a camp as the engine has it: its server code and the file whose text is the version. */
export type LocalCampScript = {code: string; number: number; title: string; file: string; lessonSubId?: string};

export type LocalCamp = {camp: Camp; orderIndex: number; introTitle?: string; scripts: LocalCampScript[]};

const readJson = (file: string): Record<string, unknown> => JSON.parse(readContent(file)) as Record<string, unknown>;

/**
 * Every camp under Curriculum/Camps with its scripts, found through the camp's jobs (Curriculum/Jobs/<camp id>/): a
 * lesson's YouTube job names its script, episode 0's job (template CampLessonIntro) carries its own words. A topic
 * without a job is left out and reported in `missing`.
 */
export const readLocalCamps = (root: string): {camps: LocalCamp[]; missing: string[]} => {
	const curriculum = path.join(root, CURRICULUM_DIRECTORY);
	const missing: string[] = [];
	const camps = readdirSync(path.join(curriculum, CAMPS_DIRECTORY))
		.filter((name) => name.endsWith('.json'))
		.map((name) => CampSchema.parse(readJson(path.join(curriculum, CAMPS_DIRECTORY, name))))
		.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.id.localeCompare(b.id, 'tr'));
	return {
		camps: camps.map((camp, index) => {
			const jobsFolder = path.join(curriculum, 'Jobs', camp.id);
			const jobs = existsSync(jobsFolder)
				? readdirSync(jobsFolder)
						.filter((name) => name.endsWith('.json'))
						.map((name) => ({file: path.join(jobsFolder, name), job: readJson(path.join(jobsFolder, name))}))
				: [];
			const scriptFiles = new Map<string, {file: string; lessonSubId?: string}>();
			for (const {job} of jobs) {
				if (!SCRIPT_TEMPLATES.includes(String(job.template)) || typeof job.script !== 'string') continue;
				const file = path.join(root, job.script);
				if (!existsSync(file)) continue;
				const topic = readJson(file).topic as {code?: string; id?: string} | undefined;
				if (topic?.code && !scriptFiles.has(topic.code)) scriptFiles.set(topic.code, {file, lessonSubId: topic.id});
			}
			const intro = jobs.find(({job}) => job.template === INTRO_TEMPLATE);
			const introTitle = (intro?.job.content as {episode?: {title?: string}} | undefined)?.episode?.title;
			const scripts: LocalCampScript[] = intro ? [{code: INTRO_CODE, number: 0, title: introTitle ?? 'Tanıtım', file: intro.file}] : [];
			camp.lessons.forEach((lesson, lessonIndex) => {
				const found = scriptFiles.get(lesson.topic);
				if (found) scripts.push({code: lesson.topic, number: lessonIndex + 1, title: lesson.title, ...found});
				else missing.push(`${camp.id}/${lesson.topic}`);
			});
			return {camp, orderIndex: index + 1, introTitle: intro ? (introTitle ?? 'Tanıtım') : undefined, scripts};
		}),
		missing,
	};
};

/** The `camps/sync` entry of a camp. */
export const campSyncEntry = ({camp, orderIndex, introTitle, scripts}: LocalCamp): CampSyncEntry => {
	const category = CATEGORY_SUB[camp.category];
	return {
		slug: camp.id,
		name: camp.name,
		categorySub: category?.categorySub ?? camp.category,
		lesson: camp.lesson,
		exams: camp.exams,
		promise: camp.promise,
		description: null,
		lessonColor: courseLessonColor(camp.lesson),
		orderIndex,
		alsoCategorySubs: category?.also ?? [],
		introTitle,
		lessons: camp.lessons.map(({topic, title}) => ({topic, title, lessonSubId: scripts.find((script) => script.code === topic)?.lessonSubId})),
	};
};

/** The camp and script code a render job reads, and the file whose text must be the approved version; undefined for a job that is not a camp script's. */
export const campScriptOfJob = (jobFile: string, job: {template?: unknown; script?: unknown}, root: string): {campSlug: string; code: string; file: string} | undefined => {
	if (job.template === INTRO_TEMPLATE) return {campSlug: path.basename(path.dirname(path.resolve(jobFile))), code: INTRO_CODE, file: path.resolve(jobFile)};
	if (!SCRIPT_TEMPLATES.includes(String(job.template)) || typeof job.script !== 'string') return undefined;
	const file = path.join(root, job.script);
	const script = readJson(file) as {topic?: {code?: string}; camp?: {id?: string}};
	if (!script.camp?.id || !script.topic?.code) return undefined;
	return {campSlug: script.camp.id, code: script.topic.code, file};
};
