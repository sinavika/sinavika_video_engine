import {LessonScriptSchema, MAX_STILL_SCREEN_SECONDS, stillScreenSuggestions} from '../Courses/LessonScript';

/** The lesson templates whose scripts are checked for still screens before a full render. */
const STILL_SCREEN_TEMPLATES: readonly string[] = ['CampLesson', 'CourseLesson'];

/**
 * Why a lesson job may not be rendered yet: its script has stretches where nothing new comes on screen for longer
 * than MAX_STILL_SCREEN_SECONDS (stillScreenSuggestions). Owner, 9 Nov 2026: no camp is rendered before its scripts
 * are fixed this way (the TYT Matematik pass is the model: docs/Courses/CourseNarration.md §12). Empty when the job
 * may be rendered, or is not a lesson job. Previews of single frames or frame ranges are not checked.
 */
export const stillScreenGate = (job: {template?: unknown; content?: unknown}): string[] => {
	if (typeof job.template !== 'string' || !STILL_SCREEN_TEMPLATES.includes(job.template)) return [];
	const script = LessonScriptSchema.safeParse(job.content);
	if (!script.success) return [];
	const still = stillScreenSuggestions(script.data);
	if (still.length === 0) return [];
	return [
		`The script has ${still.length} place(s) where nothing new comes on screen for more than ${MAX_STILL_SCREEN_SECONDS} s. Fix them before rendering (docs/Courses/CourseNarration.md §12), or pass --allow-still-screens:`,
		...still,
	];
};
