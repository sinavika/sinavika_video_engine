import type React from 'react';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {spokenPredictAsk, spokenQuestion, THINK_PROMPT} from '../../../Courses/LessonSpeech';
import {LESSON_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import {LessonScriptSchema, type LessonScript} from '../../../Courses/LessonScript';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VOICE_LEAD_SECONDS, type VoiceClips} from '../../../Scenes/Voiceover';
import {cardCues, cuesInLine, markCues, marksAfter, readingCues, spreadCues, stepCues} from '../../../Courses/LessonCue';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {defineTemplate} from '../../TemplateDefinition';
import {promotionScene} from '../CoursePromotionScene';
import {LessonCardScene} from './Scenes/LessonCardScene';
import {LessonChrome} from './Scenes/LessonChrome';
import {LessonIntroScene} from './Scenes/LessonIntroScene';
import {LessonSummaryScene} from './Scenes/LessonSummaryScene';
import {PredictScene} from './Scenes/PredictScene';
import {QuestionScene} from './Scenes/QuestionScene';
import {SectionScene} from './Scenes/SectionScene';

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
		scenes.push({id: prefix, seconds: opening.seconds, label: section.title, voice: [opening], element: <SectionScene index={sectionIndex} title={section.title} total={sections.length} titles={sections.map((entry) => entry.title)} />});

		section.cards.forEach((card, cardIndex) => {
			const id = `${prefix}-c${cardIndex + 1}`;
			const number = `${sectionIndex + 1}.${cardIndex + 1}`;
			if (card.kind === 'question') {
				const {question} = card;
				// The lead-in, then the question read word for word as it stands on screen (LessonSpeech), then a
				// silent pause with a countdown, then each step in turn. The pause is its own time, not a floor.
				const lead = say(`${id}-q`, question.narration, estimate(question.narration));
				const readText = `${spokenQuestion(question)} ${THINK_PROMPT}`;
				const read = say(`${id}-read`, readText, estimate(readText));
				const reading = {...read, seconds: read.seconds + pacing.questionThinkSeconds};
				const steps = question.steps.map((step, stepIndex) => say(`${id}-step${stepIndex + 1}`, step.narration, estimate(step.narration, pacing.stepSeconds), pacing.stepSeconds));
				const head = [lead, reading];
				const starts = steps.map((_, stepIndex) => [...head, ...steps.slice(0, stepIndex)].reduce((sum, slot) => sum + slot.seconds, 0));
				const thinkAt = lead.seconds + read.seconds;
				scenes.push({
					id,
					seconds: [...head, ...steps].reduce((sum, slot) => sum + slot.seconds, 0),
					label: `Soru ${number}`,
					voice: [...head, ...steps],
					element: withChrome(
						script,
						<QuestionScene
							question={question}
							stepStarts={starts}
							think={{at: thinkAt, seconds: pacing.questionThinkSeconds}}
							section={section.title}
							number={number}
							reading={readingCues(question, {clip: voiceClips[read.id], text: read.text, startSeconds: lead.seconds, seconds: read.seconds})}
							stepCues={steps.map((slot, stepIndex) => stepCues(question.steps[stepIndex], {clip: voiceClips[slot.id], text: slot.text, startSeconds: starts[stepIndex], seconds: slot.seconds}))}
						/>,
					),
				});
				return;
			}
			if (card.kind === 'predict') {
				// Asked, a silent pause to think (the countdown), the figure beat by beat, then the explanation.
				// The question, its choices read as they are written, and the cue to think.
				const askText = spokenPredictAsk(card);
				const asked = say(`${id}-q`, askText, estimate(askText));
				const ask = {...asked, seconds: asked.seconds + card.thinkSeconds};
				const beatSlots = card.beats.map((beat, beatIndex) => say(`${id}-b${beatIndex + 1}`, beat.narration, estimate(beat.narration, pacing.beatSeconds), pacing.beatSeconds));
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
			const beatSlots = beats.map((beat, beatIndex) => say(`${id}-b${beatIndex + 1}`, beat.narration, estimate(beat.narration, pacing.beatSeconds), pacing.beatSeconds));
			const slots = [line, ...beatSlots];
			const startOf = (slotIndex: number) => slots.slice(0, slotIndex).reduce((sum, slot) => sum + slot.seconds, 0);
			const beatStarts = beatSlots.map((_, beatIndex) => startOf(beatIndex + 1));
			const beatEnds = beatSlots.map((_, beatIndex) => startOf(beatIndex + 2));
			scenes.push({id, seconds: startOf(slots.length), label: `${section.title} ${number}`, voice: slots, element: withChrome(script, <LessonCardScene card={card} section={section.title} number={number} beatStarts={beatStarts} beatEnds={beatEnds} sceneSeconds={startOf(slots.length)} cues={cardCues(card, {clip: voiceClips[line.id], text: line.text, startSeconds: 0, seconds: line.seconds})} />)});
		});
	});

	const summary = say('summary', script.lesson.summary.narration, estimate(script.lesson.summary.narration, 6), 6);
	// Each point arrives as it is said; warnings the narration does not read follow the last point.
	const {points, warnings} = script.lesson.summary;
	const summaryLine = {clip: voiceClips[summary.id], text: summary.text, startSeconds: 0, seconds: summary.seconds};
	const pointCues = spreadCues(cuesInLine(summaryLine, points), VOICE_LEAD_SECONDS, summary.seconds - 1);
	const warningStart = (pointCues.at(-1) ?? VOICE_LEAD_SECONDS) + 0.8;
	const summaryCues = {
		points: pointCues,
		warnings: spreadCues(cuesInLine(summaryLine, warnings, {anywhere: true}).map((cue) => (cue !== undefined && cue >= warningStart ? cue : undefined)), warningStart, Math.max(warningStart + 0.4 * warnings.length, summary.seconds - 0.6)),
	};
	const summaryMarks = {
		pointMarks: markCues(summaryLine, points).map((marks, index) => marksAfter(marks, summaryCues.points[index])),
		warningMarks: markCues(summaryLine, warnings).map((marks, index) => marksAfter(marks, summaryCues.warnings[index])),
	};
	scenes.push({id: 'summary', seconds: summary.seconds, label: 'Özet', voice: [summary], element: withChrome(script, <LessonSummaryScene script={script} cues={{...summaryCues, ...summaryMarks}} />)});
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
