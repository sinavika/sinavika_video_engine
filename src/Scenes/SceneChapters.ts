import type {TemplateScene} from './ScenePlan';
import {planTemplateScenes} from './SceneSeries';
import type {SceneTransition} from './SceneTransition';

/**
 * The chapters of a video, from the scenes that start one (`chapter`). They
 * go into the YouTube description and drive the chapter bar of long lessons.
 *
 * YouTube shows chapters only when the list starts at 0:00, has at least
 * three entries and every chapter lasts at least 10 seconds; a list that
 * breaks a rule is ignored without an error. So a chapter shorter than that
 * is merged into the one before it, and a video with fewer than three
 * chapters gets none.
 */
export const YOUTUBE_CHAPTER_RULES = {minimumCount: 3, minimumSeconds: 10} as const;

export type Chapter = {title: string; startSeconds: number};

export const sceneChapters = (scenes: readonly TemplateScene[], transition: SceneTransition | SceneTransition[], fps: number): Chapter[] => {
	const plan = planTemplateScenes(scenes, transition, fps);
	const starts: Chapter[] = [];
	scenes.forEach((scene, index) => {
		if (scene.chapter) starts.push({title: scene.chapter, startSeconds: index === 0 ? 0 : plan.scenes[index].from / fps});
	});
	if (starts.length === 0) return [];
	starts[0] = {...starts[0], startSeconds: 0};

	const totalSeconds = plan.durationInFrames / fps;
	// A chapter that would leave the one before it too short does not start: the one before runs on through it.
	const merged: Chapter[] = [starts[0]];
	for (const chapter of starts.slice(1)) {
		if (chapter.startSeconds - merged[merged.length - 1].startSeconds >= YOUTUBE_CHAPTER_RULES.minimumSeconds) merged.push(chapter);
	}
	// The last chapter may itself be too short: fold it into the one before.
	while (merged.length > 1 && totalSeconds - merged[merged.length - 1].startSeconds < YOUTUBE_CHAPTER_RULES.minimumSeconds) merged.pop();
	return merged.length >= YOUTUBE_CHAPTER_RULES.minimumCount ? merged : [];
};

/** 0:00, 4:05, 1:02:30: minutes and seconds, with hours only when the video has them. */
export const chapterTimestamp = (seconds: number, withHours: boolean): string => {
	const whole = Math.floor(seconds);
	const hours = Math.floor(whole / 3600);
	const minutes = Math.floor((whole % 3600) / 60);
	const rest = String(whole % 60).padStart(2, '0');
	return withHours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
};

/** The chapter list as YouTube reads it from a description: one "0:00 Title" line per chapter. */
export const formatChapters = (chapters: readonly Chapter[]): string => {
	const withHours = chapters.some((chapter) => chapter.startSeconds >= 3600);
	return chapters.map((chapter) => `${chapterTimestamp(chapter.startSeconds, withHours)} ${chapter.title}`).join('\n');
};
