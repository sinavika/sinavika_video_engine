import {z} from 'zod';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {SceneTimingSchema} from '../../../Scenes/SceneDuration';
import {latex, plainText, richText} from '../../../Schemas/RichText';
import {OutroSchema} from '../../../Schemas/VideoProps';
import {VisualSchema} from '../../../Schemas/Visual';

/** The building blocks of a section. A new block kind is one entry here and one case in TopicBlock. */
const TopicBlockSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('paragraph'), text: richText(360)}),
	z.object({kind: z.literal('definition'), term: plainText(60), text: richText(300)}),
	z.object({
		kind: z.literal('example'),
		title: plainText(60).optional(),
		text: richText(360),
		solution: richText(300).optional(),
	}),
	z.object({kind: z.literal('formula'), latex: latex(240), caption: plainText(120).optional()}),
	z.object({kind: z.literal('bullets'), items: z.array(richText(140)).min(2).max(5)}),
	z.object({kind: z.literal('visual'), visual: VisualSchema, caption: plainText(120).optional()}),
]);

export type TopicBlock = z.infer<typeof TopicBlockSchema>;

const TopicSectionSchema = SceneTimingSchema.extend({
	heading: plainText(70),
	blocks: z.array(TopicBlockSchema).min(1).max(3),
});

export type TopicSection = z.infer<typeof TopicSectionSchema>;

export const TopicExplanationSchema = z.object({
	title: plainText(80),
	subject: plainText(40).optional(),
	subtitle: plainText(140).optional(),
	sections: z.array(TopicSectionSchema).min(1).max(8),
	summary: z.object({
		title: plainText(60).default('Özetle'),
		points: z.array(richText(140)).min(2).max(6),
	}),
	/** Voice-over text per line id, replacing the automatic line. */
	script: VoiceScriptSchema,
	outro: OutroSchema,
});

export type TopicExplanationContent = z.infer<typeof TopicExplanationSchema>;

/** Every piece of text in a block, used to estimate how long its section should stay on screen. */
export const blockTexts = (block: TopicBlock): (string | undefined)[] => {
	switch (block.kind) {
		case 'paragraph':
			return [block.text];
		case 'definition':
			return [block.term, block.text];
		case 'example':
			return [block.title, block.text, block.solution];
		case 'formula':
			return [block.latex, block.caption];
		case 'bullets':
			return block.items;
		case 'visual':
			return [
				block.caption,
				...('nodes' in block.visual ? block.visual.nodes.flatMap((node) => [node.label, node.detail]) : []),
			];
	}
};
