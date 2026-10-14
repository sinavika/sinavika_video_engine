import {z} from 'zod';
import {latex, plainText, richText} from '../../Schemas/RichText';
import {isExpression} from './PlotExpression';

/**
 * The visuals of the education videos: what a card can show next to its
 * text. Each kind is one schema here and one component in CourseVisual.tsx;
 * which lesson uses which kinds is in Courses/CourseDesign (LESSON_VISUAL_KITS).
 *
 * Everything is data, drawn by the engine: formulas with KaTeX, plots and
 * maps with d3, molecules with SmilesDrawer. Nothing is a screenshot, so a
 * number in a solution and the number in its figure can never disagree.
 */

const label = plainText(40);
const Point2 = z.tuple([z.number(), z.number()]);
const expression = (variables: readonly string[]) =>
	z.string().trim().min(1).max(120).refine((text) => isExpression(text, variables), {message: `Not an expression of ${variables.join(', ')}.`});

const NodeSchema = z.object({label: richText(40), detail: plainText(64).optional()});

export const CourseVisualSchema = z.discriminatedUnion('kind', [
	/** Mathematics, physics, chemistry: a formula. */
	z.object({kind: z.literal('formula'), latex: latex(240), caption: plainText(120).optional()}),
	/** Chemistry: a reaction equation in mhchem notation, e.g. "2H2 + O2 -> 2H2O". */
	z.object({kind: z.literal('reaction'), equation: z.string().trim().min(1).max(200), caption: plainText(120).optional()}),
	/** Mathematics, physics, geography: graphs of functions of x, drawn as they are explained. */
	z.object({
		kind: z.literal('plot'),
		x: Point2,
		y: Point2,
		xLabel: label.optional(),
		yLabel: label.optional(),
		curves: z.array(z.object({expression: expression(['x']), label: plainText(30).optional()})).max(3).default([]),
		/** Measured data drawn as bars or a line instead of a function, e.g. monthly rainfall. */
		series: z.object({kind: z.enum(['bars', 'line']), values: z.array(z.object({x: z.number(), y: z.number(), label: plainText(12).optional()})).min(2).max(24)}).optional(),
		points: z.array(z.object({x: z.number(), y: z.number(), label: plainText(20).optional()})).max(8).default([]),
	}),
	/** Geometry: points, segments, circles, angles and polygons in a coordinate box. */
	z.object({
		kind: z.literal('geometry'),
		/** The coordinates of the box: [minX, minY, maxX, maxY]. y grows upwards. */
		view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
		points: z.array(z.object({id: z.string().min(1).max(4), at: Point2, label: plainText(8).optional()})).min(1).max(16),
		segments: z.array(z.object({from: z.string(), to: z.string(), label: plainText(12).optional(), dashed: z.boolean().default(false)})).max(16).default([]),
		polygons: z.array(z.object({points: z.array(z.string()).min(3).max(8), fill: z.boolean().default(true)})).max(4).default([]),
		circles: z.array(z.object({center: z.string(), radius: z.number().positive(), label: plainText(12).optional()})).max(4).default([]),
		/** The angle at `at`, between the rays to `from` and `to`. */
		angles: z.array(z.object({at: z.string(), from: z.string(), to: z.string(), label: plainText(10).optional(), right: z.boolean().default(false)})).max(6).default([]),
	}),
	/** Physics: the forces on a body, as arrows from its centre. Angles in degrees, 0 to the right, 90 up. */
	z.object({
		kind: z.literal('forces'),
		body: z.enum(['box', 'ball']).default('box'),
		/** An inclined surface under the body, in degrees; 0 is flat ground, null is no surface. */
		surface: z.number().min(0).max(60).nullable().default(0),
		forces: z.array(z.object({label: plainText(12), angle: z.number(), size: z.number().min(0.1).max(1)})).min(1).max(6),
	}),
	/** Physics: a body moving along x(t), y(t), leaving a trail, over `duration` seconds of the video. */
	z.object({
		kind: z.literal('motion'),
		x: expression(['t']),
		y: expression(['t']),
		/** The range of t, in the units of the expressions. */
		t: Point2,
		view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
		duration: z.number().min(1).max(20).default(4),
		label: plainText(20).optional(),
		/** Velocity arrow on the moving body. */
		velocity: z.boolean().default(false),
	}),
	/** Chemistry: a molecule from its SMILES string, e.g. "CCO" for ethanol. */
	z.object({kind: z.literal('molecule'), smiles: z.string().trim().min(1).max(200), caption: plainText(80).optional()}),
	/** Chemistry, physics: an atom with its electron shells (Bohr model). */
	z.object({
		kind: z.literal('atom'),
		symbol: z.string().trim().min(1).max(3),
		protons: z.number().int().min(1).max(118),
		neutrons: z.number().int().min(0).max(180).optional(),
		shells: z.array(z.number().int().min(1).max(32)).min(1).max(7),
	}),
	/** Any lesson: steps in order. */
	z.object({kind: z.literal('flow'), nodes: z.array(NodeSchema).min(2).max(6)}),
	/** Biology, geography: a process that returns to its start. */
	z.object({kind: z.literal('cycle'), nodes: z.array(NodeSchema).min(3).max(6), center: plainText(24).optional()}),
	/** History, literature, civics: dated events on a line. */
	z.object({
		kind: z.literal('timeline'),
		events: z.array(z.object({year: z.number().int(), label: plainText(40), detail: plainText(70).optional()})).min(2).max(8),
		/** How the years are written; "ö." for years before Christ is added automatically. */
		era: z.enum(['ce', 'hijri']).default('ce'),
	}),
	/**
	 * Geography, history: a map. `world` uses the Natural Earth countries
	 * bundled with world-atlas; `file` a GeoJSON or TopoJSON inside public/
	 * (e.g. Turkey's provinces or a historical border).
	 */
	z.object({
		kind: z.literal('map'),
		source: z.discriminatedUnion('kind', [
			z.object({kind: z.literal('world'), detail: z.enum(['110m', '50m']).default('50m')}),
			z.object({kind: z.literal('file'), src: z.string().trim().min(1).max(200), object: z.string().max(60).optional()}),
		]),
		/** Areas drawn in the lesson colour, by their name in the data (e.g. "Turkey", "Konya"). */
		highlights: z.array(z.object({name: z.string().min(1).max(60), label: plainText(30).optional()})).max(12).default([]),
		/** The map is framed on these areas; empty frames on the highlights, or the whole map. */
		focus: z.array(z.string().min(1).max(60)).max(12).default([]),
		markers: z.array(z.object({at: Point2, label: plainText(30)})).max(10).default([]),
		/** Lines such as routes or campaigns, as [longitude, latitude] points. */
		routes: z.array(z.object({points: z.array(Point2).min(2).max(30), label: plainText(30).optional()})).max(4).default([]),
	}),
	/** Turkish and foreign languages: a sentence, word by word, with the role of each part. */
	z.object({
		kind: z.literal('sentence'),
		parts: z.array(z.object({text: z.string().trim().min(1).max(40), role: plainText(20).optional(), highlight: z.boolean().default(false)})).min(1).max(14),
		translation: plainText(160).optional(),
	}),
	/** Any lesson: two or three things side by side. */
	z.object({
		kind: z.literal('comparison'),
		columns: z.array(z.object({title: plainText(30), items: z.array(richText(80)).min(1).max(5)})).min(2).max(3),
	}),
	/** Any lesson: a small table; logic uses it for truth tables. */
	z.object({
		kind: z.literal('table'),
		header: z.array(richText(30)).min(1).max(6),
		rows: z.array(z.array(richText(40)).min(1).max(6)).min(1).max(8),
		/** A column drawn in the lesson colour, e.g. the result column of a truth table. */
		highlightColumn: z.number().int().min(0).max(5).optional(),
	}),
	/** Mathematics, logic: two or three overlapping sets. */
	z.object({
		kind: z.literal('venn'),
		sets: z.array(z.object({label: plainText(20), items: z.array(plainText(12)).max(6).default([])})).min(2).max(3),
		/** Items that belong to every set. */
		shared: z.array(plainText(12)).max(4).default([]),
	}),
	/** Philosophy, sociology, biology: a concept with related concepts around it. */
	z.object({
		kind: z.literal('conceptMap'),
		center: plainText(30),
		related: z.array(z.object({name: plainText(30), relation: plainText(24).optional()})).min(2).max(6),
	}),
	/**
	 * History, biology, literature: a picture from the media library. `src`
	 * is its file inside public/Media; the library (public/Media/Credits.json)
	 * records its source and licence, and `credit` is shown on the card.
	 */
	z.object({
		kind: z.literal('picture'),
		src: z.string().trim().regex(/^Media\/[\w./-]+$/, 'Pictures come from public/Media.'),
		credit: plainText(120),
		caption: plainText(120).optional(),
	}),
]);

export type CourseVisual = z.infer<typeof CourseVisualSchema>;
export type CourseVisualKind = CourseVisual['kind'];
export const COURSE_VISUAL_KINDS = CourseVisualSchema.options.map((option) => option.shape.kind.value) as CourseVisualKind[];
