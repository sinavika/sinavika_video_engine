import {outroScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds, resolveSceneSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, totalSeconds, type VoiceClips} from '../../../Scenes/Voiceover';
import {lowerFirst, sentences, toSpokenText} from '../../../Schemas/SpokenText';
import {defineTemplate} from '../../TemplateDefinition';
import {CONCEPT_EXPLANATION_SAMPLE} from './ConceptExplanationSample';
import {ConceptChrome, ExampleScene, ExploreScene, RelatedScene, TitleScene} from './ConceptExplanationScenes';
import {ConceptExplanationSchema, type ConceptExplanationContent} from './ConceptExplanationSchema';

/** "A, B ve C" */
const listOf = (items: string[]): string =>
	items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ve ${items.at(-1)}`;

const buildScenes = (content: ConceptExplanationContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const {steps, relatedConcepts, example, keyTakeaway} = content;
	const say = createNarrator(voiceClips, content.script);

	const title = say(
		'title',
		sentences(`Bu kavramı bir kez anla, bir daha unutma: ${content.concept}!`, toSpokenText(content.definition)),
		estimateReadingSeconds([content.concept, content.definition], {baseSeconds: 2.8, minSeconds: 3.8, maxSeconds: 9}),
		3.8,
	);
	const stepVoices = steps.map((step, index) =>
		say(
			`step-${index + 1}`,
			step.narration ?? sentences(step.title, toSpokenText(step.caption)),
			resolveSceneSeconds(step, [step.title, step.caption], {baseSeconds: 2.2, minSeconds: 3.6, maxSeconds: 12}),
			3.6,
		),
	);
	const scenes: TemplateScene[] = [
		{id: 'title', seconds: title.seconds, label: 'Kavram', voice: [title], element: <TitleScene content={content} />},
		{
			id: 'explore',
			seconds: totalSeconds(stepVoices),
			label: 'Görsel anlatım',
			voice: stepVoices,
			element: <ExploreScene content={content} stepSeconds={stepVoices.map((voice) => voice.seconds)} />,
		},
	];

	if (relatedConcepts) {
		const floor = Math.max(4, 2.6 + relatedConcepts.length * 0.7);
		const related = say(
			'related',
			`${content.concept} tek başına değil: ${listOf(relatedConcepts.map((item) => item.name))} ile yakından bağlantılı.`,
			floor,
			floor,
		);
		scenes.push({
			id: 'related',
			seconds: related.seconds,
			label: 'İlişkili kavramlar',
			voice: [related],
			element: <RelatedScene content={content} />,
		});
	}
	if (example || keyTakeaway) {
		const worked = say(
			'example',
			sentences(
				example && 'Bir örnekle pekiştirelim',
				toSpokenText(example?.text),
				toSpokenText(example?.result),
				keyTakeaway && `Aklında kalsın: ${lowerFirst(toSpokenText(keyTakeaway))}`,
			),
			estimateReadingSeconds([example?.title, example?.text, example?.result, keyTakeaway], {
				baseSeconds: 3,
				minSeconds: 4.5,
				maxSeconds: 15,
			}),
			4.5,
		);
		scenes.push({
			id: 'example',
			seconds: worked.seconds,
			label: 'Örnek',
			voice: [worked],
			element: <ExampleScene content={content} seconds={worked.seconds} />,
		});
	}
	return [...scenes, ...outroScenes(content.outro, say)];
};

/**
 * Visual explanation of one concept. A diagram, formula or image stays on
 * stage while short captions walk through it and highlight the part being
 * discussed; then a map of related concepts and a worked example.
 */
export const ConceptExplanation = defineTemplate({
	id: 'ConceptExplanation',
	category: 'Education',
	title: 'Kavram Açıklama',
	description: 'Kalıcı görsel üzerinde adım adım açıklama, ilişkili kavram haritası, örnek kullanım.',
	contentSchema: ConceptExplanationSchema,
	sampleContent: CONCEPT_EXPLANATION_SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'fade', durationSeconds: 0.45},
	buildScenes,
	renderOverlay: (content) => <ConceptChrome content={content} />,
});
