import {appEndScenes} from '../../../Scenes/AppEndScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {defineTemplate} from '../../TemplateDefinition';
import {EXAM_JOURNEY_SAMPLE} from './ExamJourneySample';
import {GapsScene, ProductScene, ResultScene, SolveScene, StartScene} from './ExamJourneyScenes';
import {EXAM_JOURNEY_MAX_SECONDS, EXAM_JOURNEY_MIN_SECONDS, ExamJourneySchema, examJourneyTimings, type ExamJourneyContent} from './ExamJourneySchema';

const buildScenes = (content: ExamJourneyContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = examJourneyTimings(content);
	const say = createNarrator(voiceClips, content.script);

	const start = say('start', content.start.narration, timings.start, 2.4);
	const solve = say('solve', content.solve.narration, timings.solve, 3.4);
	const result = say('result', content.result.narration, timings.result, 3.2);
	const gaps = say('gaps', content.gaps.narration, timings.gaps, 3.2);
	const product = say('product', content.product.narration, timings.product, 2.8);

	return [
		{id: 'start', seconds: start.seconds, label: 'Süre', voice: [start], element: <StartScene content={content} />},
		{id: 'solve', seconds: solve.seconds, label: 'Soru', voice: [solve], element: <SolveScene content={content} />},
		{id: 'result', seconds: result.seconds, label: 'Sonuç', voice: [result], element: <ResultScene content={content} />},
		{id: 'gaps', seconds: gaps.seconds, label: 'Eksikler', voice: [gaps], element: <GapsScene content={content} />},
		{id: 'product', seconds: product.seconds, label: 'Uygulama', voice: [product], element: <ProductScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

/**
 * An ad that plays out one mock exam instead of showing phones: the clock
 * starts, a question is answered, the result draws itself as a line, the
 * weakest lesson is pointed out, and only then the app appears. Flat blocks
 * of colour (brand orange, paper, charcoal) pushed across the frame, no glow
 * and no dark stage: on purpose the opposite of AppPromotion, so two app ads
 * in a row do not look alike.
 */
export const ExamJourney = defineTemplate({
	id: 'ExamJourney',
	category: 'Advertisements',
	title: 'Bir Deneme Hikâyesi',
	description: 'Mobil uygulama tanıtımı: süre başlar, soru çözülür, sonuç çizilir, eksik ders işaretlenir ve uygulama görünür. Düz renk blokları.',
	contentSchema: ExamJourneySchema,
	sampleContent: EXAM_JOURNEY_SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: [
		{preset: 'slide', direction: 'from-bottom', durationSeconds: 0.3},
		{preset: 'slide', direction: 'from-right', durationSeconds: 0.3},
		{preset: 'slide', direction: 'from-top', durationSeconds: 0.3},
		{preset: 'slide', direction: 'from-left', durationSeconds: 0.3},
	],
	targetSeconds: {min: EXAM_JOURNEY_MIN_SECONDS, max: EXAM_JOURNEY_MAX_SECONDS},
	buildScenes,
});
