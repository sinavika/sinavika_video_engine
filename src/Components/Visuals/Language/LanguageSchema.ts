import {z} from 'zod';
import {plainText, richText} from '../../../Schemas/RichText';

/** The language (Türkçe) visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const LANGUAGE_VISUALS = [
	/**
	 * Turkish and foreign languages: a sentence, word by word, with the role of
	 * each part. `links` draw arrows over the tiles from one part to another
	 * (the cause to its result over "için", a condition to what follows it),
	 * by part number (1 is the first part). A part with `swap` turns into
	 * another word while the lesson is told (its synonym, a word that changes
	 * the meaning): with the beat that lists it in `swap`, or after the sentence
	 * is built.
	 */
	z
		.object({
			kind: z.literal('sentence'),
			parts: z
				.array(
					z.object({
						text: z.string().trim().min(1).max(40),
						role: plainText(20).optional(),
						highlight: z.boolean().default(false),
						swap: z.object({text: z.string().trim().min(1).max(40), role: plainText(20).optional()}).optional(),
					}),
				)
				.min(1)
				.max(14),
			links: z
				.array(z.object({from: z.number().int().min(1).max(14), to: z.number().int().min(1).max(14), label: plainText(24).optional()}))
				.max(4)
				.default([]),
			translation: plainText(160).optional(),
		})
		.superRefine((visual, context) => {
			visual.links.forEach((link, index) => {
				if (link.from === link.to) context.addIssue({code: 'custom', path: ['links', index], message: 'A link joins two different parts.'});
				if (Math.max(link.from, link.to) > visual.parts.length) context.addIssue({code: 'custom', path: ['links', index], message: `The sentence has ${visual.parts.length} parts.`});
			});
		}),
	/**
	 * Turkish: a paragraph mapped. Its sentences one under another, numbered
	 * as in the exam (I, II, …), each with its role (giriş, yardımcı düşünce,
	 * örnek, sonuç); the `main` sentence (ana düşünce) in the lesson colour,
	 * with an arrow from each other sentence leading into it. An `off`
	 * sentence (akışı bozan) is left out of the arrows and struck through when
	 * a beat points at it, or after the paragraph is built.
	 */
	z
		.object({
			kind: z.literal('paragraph'),
			/** What the paragraph is about, over it: "Zeytin ağacı". */
			topic: plainText(48).optional(),
			sentences: z
				.array(z.object({text: richText(200), role: plainText(24).optional(), main: z.boolean().default(false), off: z.boolean().default(false)}))
				.min(2)
				.max(6),
		})
		.superRefine((visual, context) => {
			if (visual.sentences.filter((sentence) => sentence.main).length > 1) context.addIssue({code: 'custom', path: ['sentences'], message: 'A paragraph has one main sentence.'});
			visual.sentences.forEach((sentence, index) => {
				if (sentence.main && sentence.off) context.addIssue({code: 'custom', path: ['sentences', index], message: 'The main sentence cannot be the one that breaks the flow.'});
			});
		}),
] as const;
