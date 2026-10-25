import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {CAMP_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import type {LessonScript} from '../../../Courses/LessonScript';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import type {VoiceClips} from '../../../Scenes/Voiceover';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {promotionScene} from '../../Courses/CoursePromotionScenes';
import {CourseShort} from '../../Courses/CourseShort/CourseShort';
import {defineTemplate} from '../../TemplateDefinition';
import {CampScriptSchema} from '../CampLesson/CampLesson';
import {CampShortChrome} from '../CampScenes';

/**
 * The short's scenes (CourseShort, unchanged); the promotion at the end
 * names the camp lesson the reel comes from, so a viewer can find it on YouTube.
 */
const buildScenes = (script: LessonScript, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const scenes = CourseShort.buildScenes(script, voiceClips).filter((scene) => scene.id !== OUTRO_SCENE_ID);
	const lessonTitle = script.camp ? `Ders ${script.camp.number}: ${script.title}` : script.title;
	return [...scenes, ...promotionScene(script.outro.enabled, lessonTitle)];
};

/**
 * The reel of a camp lesson (Instagram Reels, YouTube Shorts, TikTok): the
 * CourseShort of the topic, with the camp pill in its top bar and an ending
 * that points to the camp lesson on YouTube. Same script, same colours and
 * the same camp pill as the lesson, so the two read as one series.
 */
export const CampShort = defineTemplate({
	id: 'CampShort',
	category: 'Courses',
	title: 'Kamp Reels (Kısa Video)',
	description: '1-2 dakikalık kamp reels: konu özeti kartları, şekiller, deneme sorusu, kamp rozeti ve YouTube dersine yönlendirme.',
	contentSchema: CampScriptSchema,
	sampleContent: CAMP_SCRIPT_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: CourseShort.transition,
	voiceProfile: 'Energizer',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: COURSE_DESIGN.length.short,
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
	renderOverlay: (script, plan) => (script.camp ? <CampShortChrome plan={plan} camp={script.camp} /> : null),
});
