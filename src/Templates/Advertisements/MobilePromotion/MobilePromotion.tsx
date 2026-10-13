import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {defineTemplate} from '../../TemplateDefinition';
import {MOBILE_PROMOTION_SAMPLE} from './MobilePromotionSample';
import {ActionScene, BrandCloseScene, QuestionScene, StepScene, TogetherScene} from './MobilePromotionScenes';
import {MOBILE_PROMOTION_MAX_SECONDS, MOBILE_PROMOTION_MIN_SECONDS, MobilePromotionSchema, mobilePromotionTimings, type MobilePromotionContent} from './MobilePromotionSchema';

const buildScenes = (content: MobilePromotionContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = mobilePromotionTimings(content);
	const say = createNarrator(voiceClips, content.script);

	const question = say('question', content.question.narration, timings.question, 2.6);
	const steps = content.steps.map((step, index) => say(`step-${index + 1}`, step.narration, timings.steps[index], 2.8));
	const together = say('together', content.together.narration, timings.together, 3);
	const action = say('action', content.action.narration, timings.action, 3);
	const closing = say('closing', content.closing.narration, timings.closing, 2.4);

	return [
		{id: 'question', seconds: question.seconds, label: 'Soru', voice: [question], element: <QuestionScene content={content} />},
		...content.steps.map((step, index) => ({
			id: `step-${index + 1}`,
			seconds: steps[index].seconds,
			label: step.headline,
			voice: [steps[index]],
			element: <StepScene content={content} step={step} index={index} />,
		})),
		{id: 'together', seconds: together.seconds, label: 'Tek uygulama', voice: [together], element: <TogetherScene content={content} />},
		{id: 'action', seconds: action.seconds, label: 'Çağrı', voice: [action], element: <ActionScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <BrandCloseScene content={content} />}] : []),
	];
};

/**
 * A short ad that tells exam preparation as a few clear moves: an opening
 * question, one app screen per step, the screens lined up as one product, a
 * call to action and a brand card. Where AppPromotion keeps one phone on
 * stage and walks through many features, this one gives each step its own
 * beat. Made for the dark brand theme.
 */
export const MobilePromotion = defineTemplate({
	id: 'MobilePromotion',
	category: 'Advertisements',
	title: 'Mobil Uygulama: Adım Adım',
	description: 'Mobil uygulama tanıtımı: açılış sorusu, her adım için bir uygulama ekranı, yan yana ekranlar, çağrı ve marka kartı.',
	contentSchema: MobilePromotionSchema,
	sampleContent: MOBILE_PROMOTION_SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'fade', durationSeconds: 0.2},
	targetSeconds: {min: MOBILE_PROMOTION_MIN_SECONDS, max: MOBILE_PROMOTION_MAX_SECONDS},
	buildScenes,
});
