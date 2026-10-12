import {z} from 'zod';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {SceneTimingSchema} from '../../../Scenes/SceneDuration';
import {plainText, richText} from '../../../Schemas/RichText';
import {OutroSchema} from '../../../Schemas/VideoProps';
import {VisualSchema, visualNodeCount} from '../../../Schemas/Visual';

const ConceptStepSchema = SceneTimingSchema.extend({
	title: plainText(60).optional(),
	caption: richText(220),
	/** Zero-based indexes of the visual's nodes to highlight while this step is explained. */
	focus: z.array(z.number().int().min(0)).max(6).optional(),
});

export type ConceptStep = z.infer<typeof ConceptStepSchema>;

export const ConceptExplanationSchema = z
	.object({
		concept: plainText(50),
		subject: plainText(40).optional(),
		definition: richText(220),
		/** Stays on screen while the steps walk through it. */
		visual: VisualSchema,
		steps: z.array(ConceptStepSchema).min(1).max(6),
		relatedConcepts: z
			.array(z.object({name: plainText(32), relation: plainText(60).optional()}))
			.min(2)
			.max(6)
			.optional(),
		example: z
			.object({title: plainText(60).optional(), text: richText(320), result: richText(160).optional()})
			.optional(),
		keyTakeaway: richText(180).optional(),
		/** Voice-over text per line id, replacing the automatic line. */
		script: VoiceScriptSchema,
		outro: OutroSchema,
	})
	.superRefine((content, context) => {
		const nodeCount = visualNodeCount(content.visual);
		content.steps.forEach((step, stepIndex) => {
			step.focus?.forEach((nodeIndex, focusIndex) => {
				if (nodeIndex >= nodeCount) {
					context.addIssue({
						code: 'custom',
						path: ['steps', stepIndex, 'focus', focusIndex],
						message:
							nodeCount === 0
								? `A "${content.visual.kind}" visual has no nodes to focus on.`
								: `focus ${nodeIndex} is out of range: the visual has ${nodeCount} nodes (0-${nodeCount - 1}).`,
					});
				}
			});
		});
	});

export type ConceptExplanationContent = z.infer<typeof ConceptExplanationSchema>;
