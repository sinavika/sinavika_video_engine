import {z} from 'zod';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {plainText, richText} from '../../../Schemas/RichText';
import {OutroSchema} from '../../../Schemas/VideoProps';

const TimePlanSchema = z
	.object({
		totalMinutes: z.number().positive().max(600),
		segments: z
			.array(z.object({label: plainText(28), minutes: z.number().positive()}))
			.min(2)
			.max(6),
		note: richText(140).optional(),
	})
	.superRefine((plan, context) => {
		const allocated = plan.segments.reduce((total, segment) => total + segment.minutes, 0);
		if (Math.abs(allocated - plan.totalMinutes) > 0.01) {
			context.addIssue({
				code: 'custom',
				path: ['segments'],
				message: `Segments add up to ${allocated} minutes but totalMinutes is ${plan.totalMinutes}.`,
			});
		}
	});

export type TimePlan = z.infer<typeof TimePlanSchema>;

/** Exam facts and strategies are required; every other section is shown only when provided. */
export const ExamPreparationSchema = z.object({
	title: plainText(70),
	exam: z.object({
		name: plainText(40),
		description: plainText(120).optional(),
		stats: z
			.array(z.object({value: plainText(14), label: plainText(26)}))
			.min(2)
			.max(4),
	}),
	strategies: z
		.array(z.object({title: plainText(50), detail: richText(160)}))
		.min(2)
		.max(4),
	timePlan: TimePlanSchema.optional(),
	mistakes: z
		.array(z.object({wrong: plainText(90), right: plainText(90)}))
		.min(1)
		.max(4)
		.optional(),
	tips: z.array(richText(100)).min(2).max(6).optional(),
	motivation: z.object({quote: plainText(160), author: plainText(40).optional()}).optional(),
	/** Voice-over text per line id, replacing the automatic line. */
	script: VoiceScriptSchema,
	outro: OutroSchema,
});

export type ExamPreparationContent = z.infer<typeof ExamPreparationSchema>;
