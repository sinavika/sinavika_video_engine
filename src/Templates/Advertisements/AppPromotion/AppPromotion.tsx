import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {defineTemplate} from '../../TemplateDefinition';
import {APP_PROMOTION_SAMPLE} from './AppPromotionSample';
import {ClosingScene, HookScene, ShowcaseScene} from './AppPromotionScenes';
import {APP_PROMOTION_MAX_SECONDS, APP_PROMOTION_MIN_SECONDS, AppPromotionSchema, appPromotionTimings, type AppPromotionContent} from './AppPromotionSchema';

const buildScenes = (content: AppPromotionContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = appPromotionTimings(content);
	const say = createNarrator(voiceClips, content.script);

	const hook = say('hook', content.hook.narration, timings.hook, 2.4);
	const features = content.features.map((feature, index) => say(`feature-${index + 1}`, feature.narration, timings.features[index], 2.2));
	const closing = say('closing', content.closing.narration, timings.closing, 3);

	return [
		{id: 'hook', seconds: hook.seconds, label: 'Giriş', voice: [hook], element: <HookScene content={content} />},
		{
			id: 'showcase',
			seconds: features.reduce((sum, feature) => sum + feature.seconds, 0),
			label: 'Uygulama',
			voice: features,
			element: <ShowcaseScene content={content} featureSeconds={features.map((feature) => feature.seconds)} />,
		},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <ClosingScene content={content} />}] : []),
	];
};

/**
 * A short ad for the Sınavika mobile app: a kinetic-type hook, one phone
 * walking through the app's real screens in time with the narration, and a
 * closing card with the logo and where to get the app. Made for the dark
 * brand theme; it ends on its own closing card instead of the shared outro.
 */
export const AppPromotion = defineTemplate({
	id: 'AppPromotion',
	category: 'Advertisements',
	title: 'Mobil Uygulama',
	description: 'Mobil uygulama tanıtımı: dev yazılı giriş, uygulama ekranlarını gezen telefon ve mağaza çağrılı kapanış.',
	contentSchema: AppPromotionSchema,
	sampleContent: APP_PROMOTION_SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'fade', durationSeconds: 0.25},
	targetSeconds: {min: APP_PROMOTION_MIN_SECONDS, max: APP_PROMOTION_MAX_SECONDS},
	buildScenes,
});
