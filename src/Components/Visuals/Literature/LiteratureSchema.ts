import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';
import {markRanges, splitLineEnd, stopOffsets} from './Hece';

/** The literature visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const LITERATURE_VISUALS = [
	/**
	 * Literature: a poem (a stanza, a couplet, a few lines) with its verse marks. Each line may name its `rhyme` (kafiye)
	 * and `redif`, the end of the line as written (redif last), and its rhyme letter (`scheme`: a, b…). `stanzas` lists
	 * the line numbers after which a stanza ends; `syllables` writes each line's syllable count; `stops` draws the
	 * caesura (durak) after so many syllables (6 for 6+5), never inside a word. `marks` are words of a line drawn bold in
	 * the lesson colour, in order (an underlined word of a question, the two sides of a simile), before the rhyme. Parts
	 * l1… and kafiye, redif, durak, hece, sema (the letters), isaret (the marks).
	 */
	z
		.object({
			kind: z.literal('poem'),
			lines: z
				.array(
					z.object({
						text: plainText(64),
						rhyme: plainText(16).optional(),
						redif: plainText(28).optional(),
						scheme: z
							.string()
							.regex(/^[a-gx]$/)
							.optional(),
						marks: z.array(z.string().trim().min(1).max(32)).max(4).default([]),
					}),
				)
				.min(1)
				.max(8),
			stanzas: z.array(z.number().int().min(1).max(7)).max(3).default([]),
			syllables: z.boolean().default(false),
			stops: z.array(z.number().int().min(1).max(13)).max(2).default([]),
			poet: plainText(48).optional(),
		})
		.superRefine((visual, context) => {
			visual.lines.forEach((line, index) => {
				const end = splitLineEnd(line.text, line.rhyme, line.redif);
				if (!end)
					context.addIssue({code: 'custom', path: ['lines', index], message: `Line ${index + 1} does not end with its rhyme "${line.rhyme ?? ''}" and redif "${line.redif ?? ''}" (redif last).`});
				else if (line.marks.length && !markRanges(end.before, line.marks))
					context.addIssue({
						code: 'custom',
						path: ['lines', index, 'marks'],
						message: `Line ${index + 1} does not have the marks ${line.marks.map((mark) => `"${mark}"`).join(', ')} in this order before its rhyme.`,
					});
				stopOffsets(line.text, visual.stops).forEach((offset, k) => {
					if (offset < 0) context.addIssue({code: 'custom', path: ['stops', k], message: `Line ${index + 1} cannot stop after ${visual.stops[k]} syllables without splitting a word.`});
				});
			});
		}),
] as const;
