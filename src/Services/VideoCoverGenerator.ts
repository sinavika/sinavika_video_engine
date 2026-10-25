import {renderImage} from '../Images/Renderers/ImageRenderer';
import {contentList, contentText, type ResolvedVideoJob} from '../Renderers/VideoJob';

/**
 * Builds and renders the cover of a video: the VideoCover design, in the
 * video's own size, theme and lesson colour, titled from the video's content.
 * A job can replace any of the texts through its `cover` field.
 */
const TITLE_LIMIT = 48;
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

/**
 * A camp video's cover is the camp cover (Thumbnails/CampCover): the lesson's
 * colour, the lesson number and the topic, the same design for every lesson,
 * so the series is recognised on the channel and a lesson by its colour.
 */
export const campCoverJob = (job: ResolvedVideoJob) => {
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
			title: plain(content.title, TITLE_LIMIT),
			exams: content.exams ?? [],
			kind: job.template.id === 'CampShort' ? 'Kısa tekrar' : 'Konu anlatımı',
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
	// Without a word chosen by the job, the last word of the title carries the highlighter (and with it the lesson colour).
	const words = title.replace(/…$/, '').split(' ');
	const lastWord = words.length > 1 && words[words.length - 1].length <= 30 ? words[words.length - 1] : undefined;

	return {
		category: 'Thumbnails',
		variant: 'VideoCover',
		theme,
		lesson,
		size: {width: job.width, height: job.height},
		content: {
			title,
			emphasis: requested.emphasis ?? lastWord,
			kicker: requested.kicker ?? plain(job.template.title, KICKER_LIMIT),
			badge: requested.badge,
			lesson: requested.lesson ?? (subject && subject.length <= LESSON_LIMIT ? subject : undefined),
			exams: requested.exams ?? contentList(content, 'exams'),
			glyph: requested.glyph,
		},
	};
};

export const renderVideoCover = async (job: ResolvedVideoJob, outputPath: string): Promise<void> => {
	await renderImage(campCoverJob(job) ?? videoCoverJob(job), {outputPath});
};
