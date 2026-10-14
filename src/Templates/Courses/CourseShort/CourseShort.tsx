import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {LESSON_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import {LessonScriptSchema, type LessonScript} from '../../../Courses/LessonScript';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, totalSeconds, type VoiceClips} from '../../../Scenes/Voiceover';
import {sentences, toSpokenText} from '../../../Schemas/SpokenText';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {CardScene, IntroScene, RecapScene, RevisionChrome} from '../../Education/QuickRevision/QuickRevisionScenes';
import type {QuickRevisionContent, RevisionCard} from '../../Education/QuickRevision/QuickRevisionSchema';
import {defineTemplate} from '../../TemplateDefinition';
import {promotionScene} from '../CoursePromotionScenes';
import {ShortQuestionScene, VisualCardScene} from './CourseShortScenes';

const estimate = (text: string, minSeconds = 2.6) => estimateReadingSeconds([text], {baseSeconds: 0.8, minSeconds, maxSeconds: 20});

/** Cards are read as on the Reels: short and direct; a warning announces itself. */
const cardLine = (card: RevisionCard): string => {
	switch (card.kind) {
		case 'fact':
			return toSpokenText(card.text);
		case 'warning':
			return sentences('Dikkat!', toSpokenText(card.text));
		case 'term':
			return sentences(card.term, toSpokenText(card.definition));
		case 'formula':
			return sentences(card.title, toSpokenText(`$${card.latex}$`), toSpokenText(card.note));
	}
};

/** The script's short, in the shape the Reels scenes (QuickRevision) draw. */
const asRevision = (script: LessonScript): QuickRevisionContent =>
	({
		title: script.title,
		subject: script.lessonName,
		exams: script.exams,
		cards: script.short.cards.filter((card): card is RevisionCard => card.kind !== 'visual'),
		summary: script.short.summary,
		script: {},
		outro: {enabled: false, callToAction: ''},
	}) as QuickRevisionContent;

const buildScenes = (script: LessonScript, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips, script.script);
	const revision = asRevision(script);
	const {cards, question} = script.short;

	const intro = say('intro', script.short.hook, estimate(script.short.hook, 2.4), 2.4);
	const cardLines = cards.map((card, index) => say(`card-${index + 1}`, card.narration ?? (card.kind === 'visual' ? card.title : cardLine(card)), estimate(card.narration ?? (card.kind === 'visual' ? card.title : cardLine(card))), 2.6));
	const questionLine = question ? say('question', question.narration, estimate(question.narration, 4), 4) : null;
	const recap = say('recap', sentences('Kısaca', ...script.short.summary.map(toSpokenText)), estimate(script.short.summary.join(' '), 3), 3);
	const spoken = [intro, ...cardLines, ...(questionLine ? [questionLine] : []), recap];

	return [
		{id: 'intro', seconds: intro.seconds, label: 'Giriş', voice: [intro], element: <IntroScene content={revision} totalSeconds={totalSeconds(spoken)} />},
		...cards.map((card, index) => ({
			id: cardLines[index].id,
			seconds: cardLines[index].seconds,
			label: `Kart ${index + 1}`,
			voice: [cardLines[index]],
			element: card.kind === 'visual' ? <VisualCardScene title={card.title} visual={card.visual} index={index} total={cards.length} /> : <CardScene card={card} index={index} total={cards.length} />,
		})),
		...(question && questionLine ? [{id: 'question', seconds: questionLine.seconds, label: 'Soru', voice: [questionLine], element: <ShortQuestionScene question={question} />}] : []),
		{id: 'recap', seconds: recap.seconds, label: 'Özet', voice: [recap], element: <RecapScene content={revision} seconds={recap.seconds} />},
		...promotionScene(script.outro.enabled, script.title),
	];
};

/**
 * The 1-2 minute summary of a topic for Reels, TikTok and Shorts, made from
 * the same lesson script as the YouTube lesson. It uses the Reels cards
 * (QuickRevision: the "Ses Olayları" look), adds figure cards and one
 * question to try, and ends by pointing to the full lesson and the app.
 */
export const CourseShort = defineTemplate({
	id: 'CourseShort',
	category: 'Courses',
	title: 'Konu Özeti (Kısa Video)',
	description: '1-2 dakikalık konu özeti: Reels kartları, derse özel şekiller, bir deneme sorusu ve YouTube dersine yönlendirme.',
	contentSchema: LessonScriptSchema,
	sampleContent: LESSON_SCRIPT_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: [
		{preset: 'slide', direction: 'from-right', durationSeconds: 0.3},
		{preset: 'slide', direction: 'from-bottom', durationSeconds: 0.3},
	],
	voiceProfile: 'Energizer',
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
	renderOverlay: (_script, plan) => <RevisionChrome plan={plan} />,
});
