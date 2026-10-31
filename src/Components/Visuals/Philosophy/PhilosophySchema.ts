import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';

/** The philosophy visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const PHILOSOPHY_VISUALS = [
	/**
	 * Philosophy (ethics): the trolley problem. A tram rolls up to a switch and waits; on the beat that shows `switch`
	 * the lever is pulled and it turns onto the side track (one person), on the beat that shows `stay` it keeps on
	 * towards five people. It always brakes short of them. Parts: trolley, five, one, lever, switch, stay.
	 */
	z.object({
		kind: z.literal('trolley'),
		fiveLabel: plainText(16).default('Beş kişi'),
		oneLabel: plainText(16).default('Bir kişi'),
		leverLabel: plainText(16).default('Makas kolu'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Philosophy: the ship of Theseus (identity through change). On the beat that shows `replace` its 24 planks are
	 * swapped for new ones one at a time (`period` seconds each) with a counter, the old planks piling up at the dock;
	 * on the beat that shows `second` the pile becomes a second ship of old planks (Hobbes). Parts: ship, replace,
	 * pile, second.
	 */
	z.object({
		kind: z.literal('theseus'),
		period: z.number().min(0.2).max(3).default(0.5),
		firstLabel: plainText(28).default("Theseus'un gemisi"),
		secondLabel: plainText(28).default('Eski tahtalardan gemi'),
		pileLabel: plainText(24).default('Sökülen eski tahtalar'),
		counterLabel: plainText(14).default('Yeni tahta'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Philosophy: emanation (sudur, feyz). The `source` at the centre and the `levels` as rings around it, each dimmer
	 * than the one inside, with light flowing outward every `period` seconds (Plotinus: the One, Intellect, Soul,
	 * matter; Farabi: God, the intellects, the sublunar world). Each level is listed beside the rings with its number.
	 * Parts: source, l1….
	 */
	z.object({
		kind: z.literal('emanation'),
		source: z.object({label: plainText(22), detail: plainText(40).optional()}),
		levels: z
			.array(z.object({label: plainText(22), detail: plainText(40).optional()}))
			.min(2)
			.max(5),
		period: z.number().min(2).max(10).default(4),
		motion: z.boolean().default(true),
	}),
	/**
	 * Philosophy: Plato's cave. Chained prisoners face a wall; carriers lift the `objects` over a low wall in front of
	 * a fire one after another (`period` seconds each) and the fire casts their enlarged shadows on the wall. On the
	 * beat that shows `freed` one prisoner stands, is dazzled by the fire, climbs out and sees the pond's reflections,
	 * the tree and the sun (`freed` true draws him outside without a beat). Parts: wall, prisoners, objects, fire,
	 * exit, outside, sun, freed.
	 */
	z.object({
		kind: z.literal('cave'),
		objects: z
			.array(z.enum(['vase', 'horse', 'tree', 'bird']))
			.min(1)
			.max(4)
			.default(['horse', 'vase', 'bird']),
		period: z.number().min(2).max(8).default(3.5),
		wallLabel: plainText(14).default('Gölgeler'),
		prisonersLabel: plainText(14).default('Tutsaklar'),
		objectsLabel: plainText(14).default('Nesneler'),
		fireLabel: plainText(10).default('Ateş'),
		exitLabel: plainText(18).default('Mağaranın ağzı'),
		sunLabel: plainText(14).default('Güneş'),
		outsideLabel: plainText(16).optional(),
		/** The world outside (pond, tree, sun); false keeps the prisoners' view, with nothing beyond the cave mouth. */
		outside: z.boolean().default(true),
		freed: z.boolean().default(false),
		motion: z.boolean().default(true),
	}),
] as const;
