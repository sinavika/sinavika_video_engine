import {z} from 'zod';
import {plainText, richText} from '../../../Schemas/RichText';

const NodeSchema = z.object({label: richText(40), detail: plainText(64).optional()});

/** The structure visuals any lesson uses (tables, comparisons, flows, trees …): one schema per kind, joined in ../VisualSchema.ts. */
export const STRUCTURE_VISUALS = [
	/**
	 * Any lesson: levels of a hierarchy. `pyramid` stacks them as steps narrowing upward, the first level at the base
	 * (Maslow's needs, social strata); `iceberg` floats an iceberg with the first `above` levels over the water and the
	 * rest below it (Freud's levels of the mind, id, ego and superego). Each level has a `label` and an optional `detail`
	 * written beside it; `groups` bracket runs of levels (`from`, `to`: level numbers, 1 first) on the left. Parts l1…
	 * (levels, in list order) and g1… (groups).
	 */
	z
		.object({
			kind: z.literal('hierarchy'),
			shape: z.enum(['pyramid', 'iceberg']).default('pyramid'),
			levels: z
				.array(z.object({label: plainText(28), detail: plainText(76).optional()}))
				.min(2)
				.max(7),
			above: z.number().int().min(1).max(3).default(1),
			groups: z
				.array(z.object({label: plainText(26), from: z.number().int().min(1).max(7), to: z.number().int().min(1).max(7)}))
				.max(3)
				.default([]),
		})
		.superRefine((visual, context) => {
			if (visual.shape === 'iceberg' && visual.above >= visual.levels.length)
				context.addIssue({code: 'custom', path: ['above'], message: `An iceberg needs at least one level under the water (above ${visual.above}, levels ${visual.levels.length}).`});
			visual.groups.forEach((group, index) => {
				if (group.from > group.to || group.to > visual.levels.length)
					context.addIssue({code: 'custom', path: ['groups', index], message: `Group ${index + 1} must run from a level to a later one within the ${visual.levels.length} levels.`});
			});
		}),
	/** Any lesson: steps in order. */
	z.object({kind: z.literal('flow'), nodes: z.array(NodeSchema).min(2).max(6)}),
	/** Biology, geography: a process that returns to its start. */
	z.object({kind: z.literal('cycle'), nodes: z.array(NodeSchema).min(3).max(6), center: plainText(24).optional()}),
	/** Any lesson: two or three things side by side. */
	z.object({
		kind: z.literal('comparison'),
		columns: z
			.array(z.object({title: plainText(30), items: z.array(richText(80)).min(1).max(5)}))
			.min(2)
			.max(3),
	}),
	/**
	 * Any lesson: shares as 100% bars, one row per place or group, each cut into the same series (tarım, sanayi,
	 * hizmet). Values are shares or amounts; each row is shown as its own 100%. Parts: r1… (rows), s1… (series).
	 */
	z
		.object({
			kind: z.literal('stack'),
			series: z.array(plainText(20)).min(2).max(4),
			rows: z
				.array(z.object({label: plainText(24), note: plainText(30).optional(), values: z.array(z.number().min(0)).min(2).max(4)}))
				.min(1)
				.max(6),
		})
		.refine((stack) => stack.rows.every((row) => row.values.length === stack.series.length), {message: 'Her satırda seri sayısı kadar değer olmalı.'}),
	/**
	 * Any lesson: a classification tree. The root on top, 2–4 branches, under each up to 3 kinds with up to 6 short
	 * examples (Bölge → Şekilsel → Doğal: iklim, bitki…). Parts: root, b1…, b1-1….
	 */
	z.object({
		kind: z.literal('tree'),
		root: plainText(30),
		branches: z
			.array(
				z.object({
					label: plainText(28),
					nodes: z
						.array(z.object({label: plainText(26), items: z.array(plainText(28)).max(6).default([])}))
						.max(3)
						.default([]),
				}),
			)
			.min(2)
			.max(4),
	}),
	/**
	 * Any lesson: two two-sided features on two axes, the plane cut into four quarters (Oluşum hızı yavaş/hızlı ×
	 * Etki alanı dar/geniş); each item is a chip in its quarter, up to six a quarter. Parts: i1… (items), q1 top left,
	 * q2 top right, q3 bottom left, q4 bottom right.
	 */
	z
		.object({
			kind: z.literal('quadrant'),
			x: z.object({label: plainText(24), low: plainText(16), high: plainText(16)}),
			y: z.object({label: plainText(24), low: plainText(16), high: plainText(16)}),
			items: z
				.array(z.object({label: plainText(22), x: z.enum(['low', 'high']), y: z.enum(['low', 'high'])}))
				.min(2)
				.max(12),
		})
		.refine((quadrant) => ['low', 'high'].every((x) => ['low', 'high'].every((y) => quadrant.items.filter((item) => item.x === x && item.y === y).length <= 6)), {
			message: 'Bir çeyrekte en çok 6 öge olur.',
		}),
	/** Any lesson: a small table (truth tables are `truthTable`, which works the values out). */
	z.object({
		kind: z.literal('table'),
		header: z.array(richText(30)).min(1).max(6),
		rows: z
			.array(z.array(richText(40)).min(1).max(6))
			.min(1)
			.max(8),
		/** A column drawn in the lesson colour, e.g. the result column of a truth table. */
		highlightColumn: z.number().int().min(0).max(5).optional(),
	}),
	/**
	 * Any lesson: a matching exercise (owner, 29 Oct 2026: verbal lessons need more than tables). Terms on the left,
	 * their partners on the right in a shuffled order; a beat that points at a pair (p1…) draws its line, and drawn
	 * lines stay. `titles` names the two columns.
	 */
	z.object({
		kind: z.literal('matching'),
		titles: z.tuple([richText(30), richText(30)]).optional(),
		pairs: z
			.array(z.object({left: richText(40), right: richText(90)}))
			.min(2)
			.max(6),
	}),
	/**
	 * Statistics, geography: a pie chart (daire grafiği). Slices (parts p1…) open one after another or when a beat
	 * shows or focuses them; each names itself with its value, its share (`percent`) or its central angle (`angle`).
	 */
	z.object({
		kind: z.literal('pie'),
		slices: z
			.array(z.object({label: plainText(20), value: z.number().positive()}))
			.min(2)
			.max(8),
		show: z.enum(['value', 'percent', 'angle']).default('value'),
	}),
	/** Any lesson: cards that turn over, a term on the face and its example or explanation behind it (parts p1…). */
	z.object({
		kind: z.literal('flipcards'),
		cards: z
			.array(z.object({front: richText(40), back: richText(120)}))
			.min(2)
			.max(6),
	}),
	/** Mathematics, logic: two or three overlapping sets. */
	z.object({
		kind: z.literal('venn'),
		sets: z
			.array(z.object({label: plainText(20), items: z.array(plainText(12)).max(6).default([])}))
			.min(2)
			.max(3),
		/** Items that belong to every set. */
		shared: z.array(plainText(12)).max(4).default([]),
	}),
	/** Philosophy, sociology, biology: a concept with related concepts around it. */
	z.object({
		kind: z.literal('conceptMap'),
		center: plainText(30),
		related: z
			.array(z.object({name: plainText(30), relation: plainText(24).optional()}))
			.min(2)
			.max(6),
	}),
] as const;
