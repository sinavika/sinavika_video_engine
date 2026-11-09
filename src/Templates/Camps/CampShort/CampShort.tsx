import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {CAMP_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import type {ChallengeRound, LessonScript} from '../../../Courses/LessonScript';
import {CHALLENGE_SCORE_LINE, spokenHook, spokenRoundAsk, spokenRoundReveal} from '../../../Courses/LessonSpeech';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {promotionScene} from '../../Courses/CoursePromotionScene';
import {CourseShort} from '../../Courses/CourseShort/CourseShort';
import {defineTemplate} from '../../TemplateDefinition';
import {CampScriptSchema} from '../CampLesson/CampLesson';
import {CampShortChrome} from '../Scenes/CampChrome';
import {ChallengeRoundScene} from './Scenes/ChallengeRoundScene';
import {ChallengeScoreScene} from './Scenes/ChallengeScoreScene';

/**
 * The challenge reel (docs/Courses/CourseNarration.md §10): the hook said over the
 * whole screen in big type from the first frame (about 1.5 s), then each
 * round asked, counted down and answered; one ask for the score. The
 * 27 Oct reels showed the hook small and silent over the first question and
 * held viewers 4–8 s (8 Nov 2026 analysis, docs/Analiz): the first second
 * now moves and speaks. No title card and no promotion: those were 5–7 s
 * and 12–13 s of standing still (outside review, 27 Oct 2026).
 */
const challengeScenes = (script: LessonScript, rounds: readonly ChallengeRound[], voiceClips: VoiceClips): TemplateScene[] => {
	const say = createNarrator(voiceClips, script.script);
	const estimate = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 0.6, minSeconds: min, maxSeconds: 30});
	const {roundThinkSeconds: think, roundRevealSeconds} = COURSE_DESIGN.camp;

	const hookText = spokenHook(script.short.hook);
	const hook = say('hook', hookText, estimate(hookText, 1.2), 1.2);

	const scenes: TemplateScene[] = rounds.map((round, index) => {
		const id = `round-${index + 1}`;
		const opening = index === 0 ? hook : undefined;
		const lead = opening?.seconds ?? 0;
		const askText = spokenRoundAsk(round);
		const asked = say(`${id}-q`, askText, estimate(askText, 2), 2);
		const ask = {...asked, seconds: asked.seconds + think};
		const revealText = spokenRoundReveal(round);
		const reveal = say(`${id}-a`, revealText, estimate(revealText, roundRevealSeconds), roundRevealSeconds);
		return {
			id,
			seconds: lead + ask.seconds + reveal.seconds,
			label: `Soru ${index + 1}`,
			voice: opening ? [opening, ask, reveal] : [ask, reveal],
			element: (
				<ChallengeRoundScene
					round={round}
					index={index}
					total={rounds.length}
					title={script.title}
					hook={opening ? {text: script.short.hook, seconds: lead} : undefined}
					timing={{thinkAt: lead + asked.seconds, thinkSeconds: think, revealAt: lead + ask.seconds}}
				/>
			),
		};
	});

	const scoreLine = say('score', CHALLENGE_SCORE_LINE, estimate(CHALLENGE_SCORE_LINE, 2), 2);
	const camp = script.camp;
	if (camp) scenes.push({id: 'score', seconds: scoreLine.seconds, label: 'Skor', voice: [scoreLine], element: <ChallengeScoreScene camp={camp} />});
	return scenes;
};

/**
 * The reel's scenes. With `short.rounds` it is a challenge that ends on its
 * score ask; without, the summary cards of CourseShort followed by the
 * promotion that names the camp lesson the reel comes from.
 */
const buildScenes = (script: LessonScript, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const rounds = script.short.rounds;
	if (rounds?.length) return challengeScenes(script, rounds, voiceClips);
	const lessonTitle = script.camp ? `Ders ${script.camp.number}: ${script.title}` : script.title;
	return [...CourseShort.buildScenes(script, voiceClips).filter((scene) => scene.id !== OUTRO_SCENE_ID), ...promotionScene(script.outro.enabled, lessonTitle)];
};

/**
 * The reel of a camp lesson (Instagram Reels, YouTube Shorts, TikTok): a
 * challenge in the lesson's colour (or the CourseShort cards), with the camp
 * pill in its top bar and the camp lesson named at the end. Same script, same colours and
 * the same camp pill as the lesson, so the two read as one series.
 */
export const CampShort = defineTemplate({
	id: 'CampShort',
	category: 'Courses',
	title: 'Kamp Reels (Kısa Video)',
	description: '30 saniyelik kamp reels: ilk karede tam ekran seslendirilen kanca, en fazla üç tuzaklı soru, geri sayım, tek satır cevap ve yoruma skor çağrısı. Turu olmayan senaryoda konu özeti kartları.',
	contentSchema: CampScriptSchema,
	sampleContent: CAMP_SCRIPT_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: CourseShort.transition,
	voiceProfile: 'Energizer',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: COURSE_DESIGN.length.challenge,
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
	renderOverlay: (script, plan) => (script.camp ? <CampShortChrome plan={plan} camp={script.camp} /> : null),
});
