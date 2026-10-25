import {campWelcomeNarration, sectionTitleNarration, type CampEpisode} from '../../../Courses/Camp';
import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {CAMP_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import {LessonScriptSchema, type LessonScript} from '../../../Courses/LessonScript';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {CourseLesson} from '../../Courses/CourseLesson/CourseLesson';
import {LessonChrome} from '../../Courses/CourseLesson/CourseLessonScenes';
import {defineTemplate} from '../../TemplateDefinition';
import {CAMP_SCENE_IDS, CampCardScene, CampTaskScene, ChapterBar} from '../CampScenes';

/** A camp lesson is a lesson script with its camp fields. */
export const CampScriptSchema = LessonScriptSchema.refine((script) => script.camp !== undefined, {path: ['camp'], message: 'A camp lesson needs its camp fields (Courses/Camp).'});

const SECTION_OPENING = /^s\d+$/;

/** The scenes that open a chapter, and the chapter's title. Ids are CourseLesson's own and the camp's. */
export const campChapterTitle = (script: LessonScript, sceneId: string): string | undefined => {
	if (sceneId === CAMP_SCENE_IDS.card) return 'Giriş';
	if (SECTION_OPENING.test(sceneId)) return script.lesson.sections[Number(sceneId.slice(1)) - 1]?.title;
	if (sceneId === 'summary') return 'Özet';
	if (sceneId === CAMP_SCENE_IDS.task) return 'Kamp görevi';
	return undefined;
};

/** Scenes that open a new part of the lesson come in with the section transition; the rest cross-fade. */
const opensAPart = (sceneId: string): boolean => sceneId === 'intro' || SECTION_OPENING.test(sceneId) || sceneId === 'summary' || sceneId === CAMP_SCENE_IDS.task;

const campOf = (script: LessonScript): CampEpisode => {
	if (!script.camp) throw new Error('A camp lesson needs its camp fields.');
	return script.camp;
};

/**
 * The lesson's scenes (CourseLesson) inside the camp's frame:
 *
 *   welcome   SinoAI greets the viewer on the camp card: camp, lesson number, what is coming (campWelcomeNarration)
 *   intro     the lesson's hook and "bu videoda"
 *   sections  each opens with its title spoken on its own (sectionTitleNarration), then the lesson's own words
 *   summary, camp task with the next lesson, promotion
 *
 * Every part of it comes from the camp fields and COURSE_DESIGN, so all camp
 * lessons open, move and close the same way.
 */
const buildScenes = (script: LessonScript, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const camp = campOf(script);
	const say = createNarrator(voiceClips, script.script);
	const lesson = CourseLesson.buildScenes(script, voiceClips);
	const estimate = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 0.8, minSeconds: min, maxSeconds: 60});

	const welcomeText = campWelcomeNarration(camp, {title: script.title, lessonName: script.lessonName});
	const welcomeLine = say(CAMP_SCENE_IDS.card, welcomeText, estimate(welcomeText, COURSE_DESIGN.camp.cardSeconds), COURSE_DESIGN.camp.cardSeconds);
	const welcome: TemplateScene = {id: CAMP_SCENE_IDS.card, seconds: welcomeLine.seconds, label: 'Hoş geldin', voice: [welcomeLine], element: <CampCardScene script={script} camp={camp} promise={camp.promise} welcome />};

	const taskLine = say(CAMP_SCENE_IDS.task, camp.task.narration, estimate(camp.task.narration, COURSE_DESIGN.camp.taskSeconds), COURSE_DESIGN.camp.taskSeconds);
	const task: TemplateScene = {
		id: CAMP_SCENE_IDS.task,
		seconds: taskLine.seconds,
		label: 'Kamp görevi',
		voice: [taskLine],
		element: (
			<>
				<LessonChrome script={script} />
				<CampTaskScene camp={camp} />
			</>
		),
	};

	// A section opening says its title first, as a line of its own, then the section's first sentence.
	const withSpokenTitle = (scene: TemplateScene): TemplateScene => {
		if (!SECTION_OPENING.test(scene.id)) return scene;
		const index = Number(scene.id.slice(1)) - 1;
		const text = sectionTitleNarration(index, script.lesson.sections[index].title);
		const title = say(`${scene.id}-title`, text, estimate(text, COURSE_DESIGN.camp.sectionTitleSeconds), COURSE_DESIGN.camp.sectionTitleSeconds);
		return {...scene, seconds: Math.round((scene.seconds + title.seconds) * 10) / 10, voice: [title, ...(scene.voice ?? [])]};
	};

	const outroAt = lesson.findIndex((scene) => scene.id === OUTRO_SCENE_ID);
	const body = outroAt === -1 ? lesson : lesson.slice(0, outroAt);
	const outro = outroAt === -1 ? [] : lesson.slice(outroAt);
	return [welcome, ...body.map(withSpokenTitle), task, ...outro].map((scene) => {
		const chapter = campChapterTitle(script, scene.id);
		return {...scene, ...(chapter ? {chapter} : {}), ...(opensAPart(scene.id) ? {transitionIn: COURSE_DESIGN.transition.section} : {})};
	});
};

/**
 * One lesson of a camp on YouTube: the CourseLesson of the topic (at least
 * ten minutes: sections, figures, worked questions, summary) inside the camp's
 * frame: SinoAI's welcome on the camp card, a chapter bar along the bottom, and the
 * camp task with the next lesson at the end. The same script makes the reel
 * (CampShort). Rendering also gives the YouTube chapter list.
 */
export const CampLesson = defineTemplate({
	id: 'CampLesson',
	category: 'Courses',
	title: 'Kamp Dersi (YouTube)',
	description: 'Kamp serisinin bir dersi: en az 10 dakikalık konu anlatımı, kamp kartı, bölüm çubuğu, kamp görevi ve sıradaki ders.',
	contentSchema: CampScriptSchema,
	sampleContent: CAMP_SCRIPT_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: COURSE_DESIGN.transition.card,
	voiceProfile: 'Lecturer',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: {min: COURSE_DESIGN.length.lesson.min, max: 40 * 60},
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
	renderOverlay: (script, plan) => <ChapterBar plan={plan} chapterIds={plan.scenes.map((scene) => scene.id).filter((id) => campChapterTitle(script, id) !== undefined)} />,
});
