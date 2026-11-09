import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {Camp} from './Camp';

/**
 * The numbers a camp's episode 0 says about its lesson, counted from the data instead of typed into the script:
 *
 * - **konular and alt konular:** the camp's topics (its lessons, in order) and how many sub-topics each has in the
 *   master lesson list (`Desktop/lesson.csv`, the LessonMikro rows of that topic);
 * - **soru dağılımı:** how many ÖSYM questions each topic had in the last ten dated years of the exam
 *   (`Curriculum/Production/SoruDagilimi/osym-soru-dagilimi.json`; the topic of each question is Claude's mapping,
 *   so the episode calls it approximate).
 *
 * The episode-0 job carries these numbers; a test checks they still match the data.
 */

/** Which section of the distribution file a camp's category reads. KPSS camps teach Lisans, Önlisans and Ortaöğretim from one set; Lisans has the longest record. */
const DISTRIBUTION_KEY: Record<string, string> = {YKS_TYT: 'YKS/TYT', YKS_AYT: 'YKS/AYT', KPSS: 'KPSS/Lisans'};
/** The lesson list's category code for a camp's category (KPSS camps count Lisans). */
const LIST_CATEGORY: Record<string, string> = {YKS_TYT: 'YKS_TYT', YKS_AYT: 'YKS_AYT', KPSS: 'KPSS_LISANS'};
/** How many of the latest dated years the distribution counts. */
const DISTRIBUTION_YEARS = 10;

const DISTRIBUTION_FILE = path.join('Curriculum', 'Production', 'SoruDagilimi', 'osym-soru-dagilimi.json');

type DistributionTopic = {code: string; name: string; total: number; byYear: Record<string, number>};
type DistributionFile = Record<string, {years: number[]; lessons: Record<string, {name: string; total: number; topics: DistributionTopic[]}>}>;

type CampIntroData = {
	topics: {code: string; title: string; subtopics: number}[];
	/** Sub-topics per topic, rounded to a whole number as the narration says it. */
	averageSubtopics: number;
	distribution: {from: number; to: number; questions: number; topics: {code: string; title: string; questions: number}[]};
};

/** Sub-topic counts per topic code from the master lesson list (`;`-separated, one row per sub-topic). */
const subtopicCounts = (lessonList: string, category: string, lesson: string): Map<string, number> => {
	const counts = new Map<string, number>();
	const listCategory = LIST_CATEGORY[category] ?? category;
	for (const row of lessonList.replace(/^﻿/, '').split(/\r?\n/)) {
		const cells = row.split(';');
		if (cells.length < 13 || cells[3] !== listCategory || cells[6] !== lesson) continue;
		counts.set(cells[9], (counts.get(cells[9]) ?? 0) + 1);
	}
	return counts;
};

/** The camp's topics and their ÖSYM question counts in the last `DISTRIBUTION_YEARS` dated years. */
const campIntroData = (camp: Camp, lessonList: string, distribution: DistributionFile): CampIntroData => {
	const counts = subtopicCounts(lessonList, camp.category, camp.lesson);
	const topics = camp.lessons.map((lesson) => ({code: lesson.topic, title: lesson.title, subtopics: counts.get(lesson.topic) ?? 0}));
	const section = distribution[DISTRIBUTION_KEY[camp.category] ?? ''];
	if (!section) throw new Error(`No ÖSYM distribution for ${camp.category}.`);
	// AYT history and geography are taught as one camp; their questions are counted in the first test's section (TAR1, COG1).
	const lessonData = section.lessons[camp.lesson] ?? section.lessons[`${camp.lesson}1`];
	const years = [...section.years].sort((a, b) => a - b).slice(-DISTRIBUTION_YEARS);
	const asked = new Map((lessonData?.topics ?? []).map((topic) => [topic.code, years.reduce((sum, year) => sum + (topic.byYear[String(year)] ?? 0), 0)]));
	const counted = topics.map((topic) => ({code: topic.code, title: topic.title, questions: asked.get(topic.code) ?? 0}));
	return {
		topics,
		averageSubtopics: Math.round(topics.reduce((sum, topic) => sum + topic.subtopics, 0) / Math.max(1, topics.length)),
		distribution: {from: years[0], to: years[years.length - 1], questions: counted.reduce((sum, topic) => sum + topic.questions, 0), topics: counted},
	};
};

/** The facts of a camp from the files on disk: the master lesson list and the distribution file under `root`. */
export const readCampIntroData = (camp: Camp, root: string, lessonListFile: string): CampIntroData =>
	campIntroData(camp, readFileSync(lessonListFile, 'utf8'), JSON.parse(readFileSync(path.join(root, DISTRIBUTION_FILE), 'utf8')) as DistributionFile);
