import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {CAMPS_DIRECTORY} from '../Courses/Camp';
import {CURRICULUM_DIRECTORY} from '../Courses/Curriculum';
import {renderImage} from '../Images/Renderers/ImageRenderer';
import {contentList, contentText, type ResolvedVideoJob} from '../Renderers/VideoJob';

/**
 * Builds and renders the cover of a video: the one cover standard
 * (VideoCover, Configurations/SocialIdentity) in the video's own size, titled
 * from the video's content; the video's theme does not change it. A job can
 * replace any of the texts through its `cover` field.
 */
const TITLE_LIMIT = 48;
/** A camp title is never shortened on its cover (the longest is 57 letters). */
const CAMP_TITLE_LIMIT = 64;
const KICKER_LIMIT = 30;
const LESSON_LIMIT = 24;

/** Cover texts are plain: formula and emphasis marks of the content are dropped, long titles end at a word. */
const plain = (text: string, limit: number): string => {
	const clean = text.replace(/[$*_`]/g, '').replace(/\s+/g, ' ').trim();
	if (clean.length <= limit) return clean;
	const cut = clean.slice(0, limit - 1);
	return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 1)).trimEnd()}…`;
};

type CampContent = {camp?: {name: string; number: number; total: number}; topic?: {lesson: string}; title?: string; exams?: string[]};

/** Every lesson title of a camp, from its plan (Curriculum/Camps), by the camp's name: its covers share one title size. */
const campTitles = (name: string): string[] => {
	const directory = path.resolve(CURRICULUM_DIRECTORY, CAMPS_DIRECTORY);
	try {
		for (const file of readdirSync(directory).filter((entry) => entry.endsWith('.json'))) {
			const camp = JSON.parse(readFileSync(path.join(directory, file), 'utf8')) as {name?: string; lessons?: {title: string}[]};
			if (camp.name === name) return (camp.lessons ?? []).map((lesson) => plain(lesson.title, CAMP_TITLE_LIMIT));
		}
	} catch {
		// No plans on this machine: the cover sizes its own title.
	}
	return [];
};

/**
 * A camp video's cover is the camp cover (Thumbnails/CampCover): on the
 * lesson's colour, the lesson number, the topic and the camp's progress, the
 * same design for every lesson (owner, 29 Oct 2026), so the series is
 * recognised on the channel and a lesson by its colour.
 */
const campCoverJob = (job: ResolvedVideoJob) => {
	const content = job.inputProps.content as CampContent;
	if (!content.camp || !content.topic || !content.title) return null;
	return {
		category: 'Thumbnails',
		variant: 'CampCover',
		theme: job.inputProps.theme,
		size: {width: job.width, height: job.height},
		content: {
			lessonCode: content.topic.lesson,
			camp: content.camp.name,
			number: content.camp.number,
			total: content.camp.total,
			title: plain(content.title, CAMP_TITLE_LIMIT),
			series: campTitles(content.camp.name),
			exams: content.exams ?? [],
			kind: job.template.id === 'CampShort' ? 'Kısa tekrar' : 'Konu anlatımı',
		},
	};
};

type CampIntroContent = {series?: string; exam?: {short: string}; episode?: {title: string}; camp?: {lessons?: {code: string}[]}};

/**
 * A camp's intro (episode 0) gets the camp cover too, on brand navy: the
 * series as the label, the job's cover title ("TYT kampı başlıyor"), "BÖLÜM
 * 00" and a dot in each of the camp's lesson colours.
 */
const campIntroCoverJob = (job: ResolvedVideoJob) => {
	if (job.template.id !== 'CampIntro') return null;
	const content = job.inputProps.content as CampIntroContent;
	const requested = job.cover || {};
	const exam = content.exam?.short ?? 'YKS';
	const title = requested.title ?? `${exam} kampı başlıyor`;
	return {
		category: 'Thumbnails',
		variant: 'CampCover',
		theme: job.inputProps.theme,
		size: {width: job.width, height: job.height},
		content: {
			camp: plain(content.series ?? `YKS kampı · ${exam}`, KICKER_LIMIT + 10),
			number: 0,
			title: plain(title, TITLE_LIMIT),
			emphasis: requested.emphasis && title.includes(requested.emphasis) ? requested.emphasis : undefined,
			kind: plain(content.episode?.title ?? 'Tanıtım', LESSON_LIMIT),
			lessons: (content.camp?.lessons ?? []).map((lesson) => lesson.code).slice(0, 16),
		},
	};
};

/** The image job of a video's cover. */
export const videoCoverJob = (job: ResolvedVideoJob) => {
	const {content, theme, lesson} = job.inputProps;
	const requested = job.cover || {};
	const subject = contentText(content, 'subject') ?? contentText(content, 'lessonName');
	const headline = contentText(content, 'title') ?? contentText(content, 'concept') ?? job.template.title;

	const title = requested.title ?? plain(headline, TITLE_LIMIT);
	// The highlighter marks what the video sells, so the job chooses it (`cover.emphasis`). Only a lesson video
	// without a choice falls back to its last word, which carries the lesson colour; a promotion never does: an
	// automatic last word lit "söylüyor" in "Netin sana yalan söylüyor" (Tuğçe's review, 26 Oct 2026).
	const words = title.replace(/…$/, '').split(' ');
	const lastWord = lesson && words.length > 1 && words[words.length - 1].length <= 30 ? words[words.length - 1] : undefined;

	return {
		category: 'Thumbnails',
		variant: 'VideoCover',
		theme,
		lesson,
		size: {width: job.width, height: job.height},
		content: {
			title,
			emphasis: requested.emphasis ?? lastWord,
			// A lesson video is labelled with its kind ("Hızlı tekrar"); a promotion never with the template's working name.
			kicker: requested.kicker ?? (lesson ? plain(job.template.title, KICKER_LIMIT) : undefined),
			badge: requested.badge,
			lesson: requested.lesson ?? (subject && subject.length <= LESSON_LIMIT ? subject : undefined),
			exams: requested.exams ?? contentList(content, 'exams'),
			glyph: requested.glyph,
		},
	};
};

/** The image job of a video's cover: the camp cover for a camp lesson, the camp intro cover, otherwise the video cover. */
export const coverJobOf = (job: ResolvedVideoJob) => campCoverJob(job) ?? campIntroCoverJob(job) ?? videoCoverJob(job);

export const renderVideoCover = async (job: ResolvedVideoJob, outputPath: string): Promise<void> => {
	await renderImage(coverJobOf(job), {outputPath});
};
