import {z} from 'zod';
import {latex, richText} from './RichText';

/**
 * `src` is either an absolute http(s)/data URL or a path inside `public/`.
 * Paths that try to leave `public/` are rejected.
 */
export const ImageSchema = z.object({
	src: z
		.string()
		.trim()
		.min(1)
		.max(4000)
		.refine((value) => /^(https?:|data:image\/)/.test(value) || !/(^[\\/])|(\.\.)|(^[a-z]+:)/i.test(value), {
			message: 'Image src must be an http(s)/data URL or a relative path inside public/.',
		}),
	alt: z.string().trim().max(200).optional(),
});

export type Image = z.infer<typeof ImageSchema>;

const VisualNodeSchema = z.object({
	label: richText(40),
	detail: z.string().trim().max(64).optional(),
});

export type VisualNode = z.infer<typeof VisualNodeSchema>;

/** Data-driven illustrations. A new kind is one schema entry plus one case in Visual.tsx. */
export const VisualSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('flow'), nodes: z.array(VisualNodeSchema).min(2).max(5)}),
	z.object({
		kind: z.literal('cycle'),
		nodes: z.array(VisualNodeSchema).min(3).max(6),
		center: z.string().trim().max(24).optional(),
	}),
	z.object({
		kind: z.literal('formula'),
		latex: latex(240),
		caption: z.string().trim().max(120).optional(),
	}),
	z.object({kind: z.literal('image'), image: ImageSchema}),
]);

export type Visual = z.infer<typeof VisualSchema>;

/** Number of nodes a step can point at with `focus`; 0 for visuals without nodes. */
export const visualNodeCount = (visual: Visual): number =>
	visual.kind === 'flow' || visual.kind === 'cycle' ? visual.nodes.length : 0;
