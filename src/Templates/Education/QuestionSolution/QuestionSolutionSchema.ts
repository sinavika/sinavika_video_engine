import {z} from 'zod';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {SceneTimingSchema} from '../../../Scenes/SceneDuration';
import {latex, plainText, richText} from '../../../Schemas/RichText';
import {OutroSchema} from '../../../Schemas/VideoProps';
import {ImageSchema} from '../../../Schemas/Visual';

const MAX_OPTIONS = 5;

const QuestionSchema = SceneTimingSchema.extend({
	text: richText(700),
	image: ImageSchema.optional(),
	/** Omit for open-ended questions. */
	options: z.array(richText(120)).min(2).max(MAX_OPTIONS).optional(),
});

const SolutionStepSchema = SceneTimingSchema.extend({
	title: plainText(90),
	content: richText(400),
	/** The line of working this step arrives at, as LaTeX. */
	formula: latex(200).optional(),
	hint: richText(200).optional(),
});

export const QuestionSolutionSchema = z
	.object({
		title: plainText(80),
		subject: plainText(40).optional(),
		source: plainText(60).optional(),
		question: QuestionSchema,
		steps: z.array(SolutionStepSchema).min(1).max(8),
		answer: z.object({
			text: richText(120),
			/** Zero-based index into `question.options`. Required when options are given. */
			correctOptionIndex: z.number().int().min(0).optional(),
			explanation: richText(300).optional(),
		}),
		tip: richText(220).optional(),
		/** Voice-over text per line id, replacing the automatic line. */
		script: VoiceScriptSchema,
		outro: OutroSchema,
	})
	.superRefine((content, context) => {
		const options = content.question.options;
		const index = content.answer.correctOptionIndex;
		if (options && index === undefined) {
			context.addIssue({
				code: 'custom',
				path: ['answer', 'correctOptionIndex'],
				message: 'correctOptionIndex is required when question.options is given.',
			});
		}
		if (index !== undefined && (!options || index >= options.length)) {
			context.addIssue({
				code: 'custom',
				path: ['answer', 'correctOptionIndex'],
				message: 'correctOptionIndex must point at an existing entry of question.options.',
			});
		}
	});

export type QuestionSolutionContent = z.infer<typeof QuestionSolutionSchema>;
