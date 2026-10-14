import type React from 'react';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {LESSON_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import {LessonScriptSchema, type LessonScript} from '../../../Courses/LessonScript';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {defineTemplate} from '../../TemplateDefinition';
import {promotionScene} from '../CoursePromotionScenes';
import {LessonCardScene, LessonChrome, LessonIntroScene, LessonSummaryScene, PredictScene, QuestionScene, SectionScene} from './CourseLessonScenes';

const {pacing} = COURSE_DESIGN;
const estimate = (text: string, minSeconds: number = pacing.minCardSeconds) => estimateReadingSeconds([text], {baseSeconds: 0.8, minSeconds, maxSeconds: 90});

/** Scenes of the lesson carry the lesson bar at the top; section openings, full of the lesson colour, do not. */
const withChrome = (script: LessonScript, element: React.ReactNode) => (
	<>
		<LessonChrome script={script} />
		{element}
	</>
);

const buildScenes = (script: LessonScript, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips, script.script);
	const sections = script.lesson.sections;

	const hook = say('hook', script.lesson.hook.narration, estimate(script.lesson.hook.narration, 5), 5);
	const scenes: TemplateScene[] = [{id: 'intro', seconds: hook.seconds, label: 'Giriş', voice: [hook], element: withChrome(script, <LessonIntroScene script={script} />)}];

	sections.forEach((section, sectionIndex) => {
		const prefix = `s${sectionIndex + 1}`;
		const opening = say(prefix, section.narration, estimate(section.narration, pacing.sectionSeconds), pacing.sectionSeconds);
		scenes.push({id: prefix, seconds: opening.seconds, label: section.title, voice: [opening], element: <SectionScene index={sectionIndex} title={section.title} total={sections.length} />});

		section.cards.forEach((card, cardIndex) => {
			const id = `${prefix}-c${cardIndex + 1}`;
			const number = `${sectionIndex + 1}.${cardIndex + 1}`;
			if (card.kind === 'question') {
				const {question} = card;
				// The stem is read first, then a pause to think, then each step in turn.
				const stem = say(`${id}-q`, question.narration, estimate(question.narration) + pacing.questionThinkSeconds, pacing.questionThinkSeconds);
				const steps = question.steps.map((step, stepIndex) => say(`${id}-step${stepIndex + 1}`, step.narration, estimate(step.narration, 2.5), 2.5));
				const starts = steps.map((_, stepIndex) => [stem, ...steps.slice(0, stepIndex)].reduce((sum, slot) => sum + slot.seconds, 0));
				scenes.push({
					id,
					seconds: [stem, ...steps].reduce((sum, slot) => sum + slot.seconds, 0),
					label: `Soru ${number}`,
					voice: [stem, ...steps],
					element: withChrome(script, <QuestionScene question={question} stepStarts={starts} section={section.title} number={number} />),
				});
				return;
			}
			if (card.kind === 'predict') {
				// Asked, a silent pause to think (the countdown), the figure beat by beat, then the explanation.
				const asked = say(`${id}-q`, card.narration, estimate(card.narration));
				const ask = {...asked, seconds: asked.seconds + card.thinkSeconds};
				const beatSlots = card.beats.map((beat, beatIndex) => say(`${id}-b${beatIndex + 1}`, beat.narration, estimate(beat.narration, 2.5), 2.5));
				const explain = say(`${id}-e`, card.explanationNarration, estimate(card.explanationNarration), 3);
				const slots = [ask, ...beatSlots, explain];
				const startOf = (slotIndex: number) => slots.slice(0, slotIndex).reduce((sum, slot) => sum + slot.seconds, 0);
				const timing = {
					thinkAt: asked.seconds,
					thinkSeconds: card.thinkSeconds,
					beatStarts: beatSlots.map((_, beatIndex) => startOf(beatIndex + 1)),
					beatEnds: beatSlots.map((_, beatIndex) => startOf(beatIndex + 2)),
					explainAt: startOf(slots.length - 1),
				};
				scenes.push({id, seconds: startOf(slots.length), label: `Tahmin ${number}`, voice: slots, element: withChrome(script, <PredictScene card={card} timing={timing} section={section.title} number={number} />)});
				return;
			}
			const line = say(id, card.narration, estimate(card.narration), pacing.minCardSeconds);
			// A visual told in beats: each beat's sentence follows the card's, and the figure follows the sentences.
			const beats = 'beats' in card && card.visual ? card.beats : [];
			const beatSlots = beats.map((beat, beatIndex) => say(`${id}-b${beatIndex + 1}`, beat.narration, estimate(beat.narration, 2.5), 2.5));
			const slots = [line, ...beatSlots];
			const startOf = (slotIndex: number) => slots.slice(0, slotIndex).reduce((sum, slot) => sum + slot.seconds, 0);
			const beatStarts = beatSlots.map((_, beatIndex) => startOf(beatIndex + 1));
			const beatEnds = beatSlots.map((_, beatIndex) => startOf(beatIndex + 2));
			scenes.push({id, seconds: startOf(slots.length), label: `${section.title} ${number}`, voice: slots, element: withChrome(script, <LessonCardScene card={card} section={section.title} number={number} beatStarts={beatStarts} beatEnds={beatEnds} sceneSeconds={startOf(slots.length)} />)});
		});
	});

	const summary = say('summary', script.lesson.summary.narration, estimate(script.lesson.summary.narration, 6), 6);
	scenes.push({id: 'summary', seconds: summary.seconds, label: 'Özet', voice: [summary], element: withChrome(script, <LessonSummaryScene script={script} />)});
	return [...scenes, ...promotionScene(script.outro.enabled)];
};

/**
 * The full lesson of one topic for YouTube: an opening with what the video
 * covers, the topic's sections card by card (concepts, rules, examples,
 * common mistakes, figures and worked questions), a summary, and a short
 * app promotion that is shown but not spoken. Its content is a lesson script
 * (Courses/LessonScript); the same script also makes the short (CourseShort).
 */
export const CourseLesson = defineTemplate({
	id: 'CourseLesson',
	category: 'Courses',
	title: 'Konu Anlatımı (YouTube)',
	description: 'Bir konunun 8-10 dakikalık YouTube dersi: bölümler, kartlar, derse özel görseller, adım adım çözülen sorular ve özet.',
	contentSchema: LessonScriptSchema,
	sampleContent: LESSON_SCRIPT_SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	transition: COURSE_DESIGN.transition.card,
	voiceProfile: 'Lecturer',
	buildScenes,
	themeFor: (themeId, script) => courseLessonTheme(themeId, script.topic.lesson),
});
