import {outroScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds, resolveSceneSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {sentences, toSpokenText} from '../../../Schemas/SpokenText';
import {defineTemplate} from '../../TemplateDefinition';
import {TOPIC_EXPLANATION_SAMPLE} from './TopicExplanationSample';
import {CoverScene, SectionScene, SummaryScene, TopicChrome, sectionSceneId} from './TopicExplanationScenes';
import {
	TopicExplanationSchema,
	blockTexts,
	type TopicBlock,
	type TopicExplanationContent,
} from './TopicExplanationSchema';

/** How a block is read aloud. */
const blockSpeech = (block: TopicBlock): string => {
	switch (block.kind) {
		case 'paragraph':
			return toSpokenText(block.text);
		case 'definition':
			return `${block.term}: ${toSpokenText(block.text)}`;
		case 'example':
			return sentences(
				block.title ? `Örnek: ${block.title}` : 'Bir örneğe bakalım',
				toSpokenText(block.text),
				block.solution && `Çözüm: ${toSpokenText(block.solution)}`,
			);
		case 'formula':
			return sentences(toSpokenText(`$${block.latex}$`), block.caption);
		case 'bullets':
			return sentences(...block.items.map(toSpokenText));
		case 'visual':
			return sentences(
				block.caption,
				'nodes' in block.visual
					? block.visual.nodes.map((node) => `${toSpokenText(node.label)} ${node.detail ?? ''}`.trim()).join(', ')
					: undefined,
			);
	}
};

const buildScenes = (content: TopicExplanationContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const {sections, summary} = content;
	const say = createNarrator(voiceClips, content.script);

	const cover = say(
		'cover',
		sentences(
			`Bugünkü konumuz: ${content.title}`,
			`${sections.length} başlıkta, sınavda işine yarayacak her şeyi öğreneceksin`,
			'Hazırsan başlayalım!',
		),
		estimateReadingSeconds([content.title, content.subtitle, ...sections.map((section) => section.heading)], {
			baseSeconds: 2.6,
			minSeconds: 3.6,
			maxSeconds: 8,
		}),
		3.6,
	);
	const recap = say(
		'summary',
		sentences('Hadi, özetleyelim', ...summary.points.map(toSpokenText)),
		estimateReadingSeconds(summary.points, {baseSeconds: 3, minSeconds: 4.5, maxSeconds: 14}),
		4.5,
	);

	return [
		{id: 'cover', seconds: cover.seconds, label: 'Kapak', voice: [cover], element: <CoverScene content={content} />},
		...sections.map((section, index) => {
			const voice = say(
				sectionSceneId(index),
				section.narration ?? sentences(section.heading, ...section.blocks.map(blockSpeech)),
				resolveSceneSeconds(section, [section.heading, ...section.blocks.flatMap(blockTexts)], {
					baseSeconds: 3,
					minSeconds: 5,
					maxSeconds: 22,
				}),
				5,
			);
			return {
				id: voice.id,
				seconds: voice.seconds,
				label: section.heading,
				voice: [voice],
				element: <SectionScene section={section} index={index} total={sections.length} seconds={voice.seconds} />,
			};
		}),
		{
			id: 'summary',
			seconds: recap.seconds,
			label: 'Özet',
			voice: [recap],
			element: <SummaryScene content={content} seconds={recap.seconds} />,
		},
		...outroScenes(content.outro, say),
	];
};

/**
 * Topic lecture. A cover with the agenda, one slide per section built from
 * typed blocks (definition, example, formula, bullets, diagram), then a summary.
 * A chapter bar shows where in the lecture the viewer is.
 */
export const TopicExplanation = defineTemplate({
	id: 'TopicExplanation',
	category: 'Education',
	title: 'Konu Anlatımı',
	description: 'Kapak ve içindekiler, bölüm bölüm anlatım blokları, özet ekranı.',
	contentSchema: TopicExplanationSchema,
	sampleContent: TOPIC_EXPLANATION_SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'slide', direction: 'from-right', durationSeconds: 0.5},
	voiceProfile: 'Lecturer',
	buildScenes,
	renderOverlay: (content, plan) => <TopicChrome content={content} plan={plan} />,
});
