import {campWelcomeNarration, sectionTitleNarration, type CampEpisode} from '../../../Courses/Camp';
import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {LessonScriptSchema, type LessonScript} from '../../../Courses/LessonScript';
import {CAMP_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import {createNarrator, VOICE_LEAD_SECONDS, voiceTracksOf, type VoiceClips} from '../../../Scenes/Voiceover';
import {cuesInLine, spreadCues} from '../../../Courses/LessonCue';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {CourseLesson} from '../../Courses/CourseLesson/CourseLesson';
import {LessonChrome, LessonLayoutProvider} from '../../Courses/CourseLesson/Scenes/LessonChrome';
import {defineTemplate} from '../../TemplateDefinition';
import {CAMP_SCENE_IDS, SectionVoiceOrb, StudioBand} from '../Scenes/CampChrome';
import {CampCardScene} from '../Scenes/CampCardScene';
import {CampTaskScene} from '../Scenes/CampTaskScene';

/** A camp lesson is a lesson script with its camp fields. */
export const CampScriptSchema = LessonScriptSchema.refine((script) => script.camp !== undefined, {path: ['camp'], message: 'A camp lesson needs its camp fields (Courses/Camp).'});

const SECTION_OPENING = /^s\d+$/;

/** The scenes that open a chapter, and the chapter's title. Ids are CourseLesson's own and the camp's. */
const campChapterTitle = (script: LessonScript, sceneId: string): string | undefined => {
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
	const welcome: TemplateScene = {id: CAMP_SCENE_IDS.card, seconds: welcomeLine.seconds, label: 'Hoş geldin', voice: [welcomeLine], element: <CampCardScene script={script} camp={camp} promise={camp.promise} welcome voice={voiceTracksOf([welcomeLine], voiceClips)} />};

	const taskLine = say(CAMP_SCENE_IDS.task, camp.task.narration, estimate(camp.task.narration, COURSE_DESIGN.camp.taskSeconds), COURSE_DESIGN.camp.taskSeconds);
	// Each task comes as it is said, the next lesson when it is named ("Bir sonraki derste ses bilgisiyle…").
	const spokenTask = {clip: voiceClips[taskLine.id], text: taskLine.text, startSeconds: 0, seconds: taskLine.seconds};
	const taskItems = spreadCues(cuesInLine(spokenTask, camp.task.items), VOICE_LEAD_SECONDS, taskLine.seconds * 0.8);
	const [nextNamed] = cuesInLine(spokenTask, [camp.next ?? 'Kampta görüşmek'], {anywhere: true});
	const taskCues = {items: taskItems, next: Math.max((taskItems.at(-1) ?? 0) + 0.8, nextNamed ?? (taskItems.at(-1) ?? 0) + 1.2)};
	const task: TemplateScene = {
		id: CAMP_SCENE_IDS.task,
		seconds: taskLine.seconds,
		label: 'Kamp görevi',
		voice: [taskLine],
		element: (
			<>
				<LessonChrome script={script} />
				<CampTaskScene camp={camp} cues={taskCues} />
			</>
		),
	};

	// A section opening says its title first, as a line of its own, then the section's first sentence.
	const withSpokenTitle = (scene: TemplateScene): TemplateScene => {
		if (!SECTION_OPENING.test(scene.id)) return scene;
		const index = Number(scene.id.slice(1)) - 1;
		const text = sectionTitleNarration(index, script.lesson.sections[index].title);
		const title = say(`${scene.id}-title`, text, estimate(text, COURSE_DESIGN.camp.sectionTitleSeconds), COURSE_DESIGN.camp.sectionTitleSeconds);
		const voice = [title, ...(scene.voice ?? [])];
		// SinoAI's orb speaks the title and the lead-in beside the section's name.
		const element = (
			<>
				{scene.element}
				<SectionVoiceOrb tracks={voiceTracksOf(voice, voiceClips)} />
			</>
		);
		return {...scene, seconds: Math.round((scene.seconds + title.seconds) * 10) / 10, voice, element};
	};

	const outroAt = lesson.findIndex((scene) => scene.id === OUTRO_SCENE_ID);
	const body = outroAt === -1 ? lesson : lesson.slice(0, outroAt);
	const outro = outroAt === -1 ? [] : lesson.slice(outroAt);
	return [welcome, ...body.map(withSpokenTitle), task, ...outro].map((scene) => {
		const chapter = campChapterTitle(script, scene.id);
		// Camp lessons are drawn in the studio layout (owner's choice, 31 Oct 2026; LessonChrome's LessonLayout).
		const element = <LessonLayoutProvider layout="studio">{scene.element}</LessonLayoutProvider>;
		return {...scene, element, ...(chapter ? {chapter} : {}), ...(opensAPart(scene.id) ? {transitionIn: COURSE_DESIGN.transition.section} : {})};
	});
};

/**
 * One lesson of a camp on YouTube: the CourseLesson of the topic (at least
 * ten minutes: sections, figures, worked questions, summary) inside the camp's
 * frame: SinoAI's welcome on the camp card, and the camp task with the next
 * lesson at the end. The same script makes the reel (CampShort). Rendering also
 * gives the YouTube chapter list.
 *
 * It is drawn in the studio layout (owner's choice over the classic one, 31 Oct
 * 2026): each card's kind and title in the top row beside the logo, figures and
 * text in the room two header rows used to take, a question read alone before
 * its solution comes in, section openings with the lesson's contents, the camp
 * card set like the camp cover, and the lesson, camp number and chapter in one
 * band at the bottom (StudioBand).
 */
export const CampLesson = defineTemplate({
	id: 'CampLesson',
	category: 'Courses',
	title: 'Kamp Dersi (YouTube)',
	description: 'Kamp serisinin bir dersi, stüdyo düzeninde: en az 10 dakikalık konu anlatımı, kamp kartı, altta ders ve bölüm bandı, kamp görevi ve sıradaki ders.',
	contentSchema: CampScriptSchema,
	sampleContent: CAMP_SCRIPT_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: COURSE_DESIGN.transition.card,
	voiceProfile: 'Lecturer',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: {min: COURSE_DESIGN.length.lesson.min, max: 40 * 60},
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
	renderOverlay: (script, plan) => (
		<StudioBand
			plan={plan}
			chapters={plan.scenes.flatMap((scene) => {
				const title = campChapterTitle(script, scene.id);
				return title ? [{id: scene.id, title}] : [];
			})}
			lessonName={script.lessonName}
			camp={campOf(script)}
		/>
	),
});

