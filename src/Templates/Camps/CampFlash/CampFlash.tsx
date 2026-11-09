import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {CAMP_FLASH_SAMPLE} from '../../../Courses/LessonScriptSample';
import type {LessonScript} from '../../../Courses/LessonScript';
import {spokenHook, spokenRoundAsk, spokenRoundReveal} from '../../../Courses/LessonSpeech';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {CourseShort} from '../../Courses/CourseShort/CourseShort';
import {defineTemplate} from '../../TemplateDefinition';
import {CampScriptSchema} from '../CampLesson/CampLesson';
import {CampShortChrome} from '../Scenes/CampChrome';
import {ChallengeRoundScene} from '../CampShort/Scenes/ChallengeRoundScene';
import {FlashEndScene} from './Scenes/FlashEndScene';

/**
 * The flash reel's scenes: the reel's dare said over the whole screen (the student's problem, 0–2 s), the
 * strongest round asked, one second to think and answered with its why (the solution, by about 7 s), then a
 * silent card for the free camp lesson on YouTube (the last 2 s). The camp accounts never advertise the app
 * (owner, 5 Nov 2026), so the link on is the YouTube camp. Without rounds there is nothing to flash: no scenes.
 */
const buildScenes = (script: LessonScript, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const round = script.short.rounds?.[0];
	const camp = script.camp;
	if (!round || !camp) return [];
	const say = createNarrator(voiceClips, script.script);
	const estimate = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 0.6, minSeconds: min, maxSeconds: 20});
	const {flashThinkSeconds: think, flashEndSeconds, roundRevealSeconds} = COURSE_DESIGN.camp;
	const hookText = spokenHook(script.short.hook);
	const hook = say('hook', hookText, estimate(hookText, 1.2), 1.2);
	const askText = spokenRoundAsk(round);
	const asked = say('round-1-q', askText, estimate(askText, 2), 2);
	const ask = {...asked, seconds: asked.seconds + think};
	const revealText = spokenRoundReveal(round);
	const reveal = say('round-1-a', revealText, estimate(revealText, roundRevealSeconds), roundRevealSeconds);
	return [
		{
			id: 'round-1',
			seconds: hook.seconds + ask.seconds + reveal.seconds,
			label: 'Soru',
			voice: [hook, ask, reveal],
			element: <ChallengeRoundScene round={round} index={0} total={1} title={script.title} hook={{text: script.short.hook, seconds: hook.seconds}} timing={{thinkAt: hook.seconds + asked.seconds, thinkSeconds: think, revealAt: hook.seconds + ask.seconds}} />,
		},
		{id: 'camp-link', seconds: flashEndSeconds, label: 'YouTube', silent: true, element: <FlashEndScene camp={camp} />},
	];
};

/**
 * The 8–12 s camp reel (owner, 8 Nov 2026): problem, solution, link on. Same script, colours and safe area as
 * CampShort, one round instead of three, for testing whether the shortest reels hold viewers to the end.
 */
export const CampFlash = defineTemplate({
	id: 'CampFlash',
	category: 'Courses',
	title: 'Kamp Flash Reels (8–12 sn)',
	description: '8–12 saniyelik kamp reels: ilk 2 saniyede problem (kanca), ardından tek tuzaklı soru ve çözümü, son 2 saniyede YouTube kampı kartı.',
	contentSchema: CampScriptSchema,
	sampleContent: CAMP_FLASH_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: CourseShort.transition,
	voiceProfile: 'Energizer',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: COURSE_DESIGN.length.flash,
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
	renderOverlay: (script, plan) => (script.camp ? <CampShortChrome plan={plan} camp={script.camp} /> : null),
});
