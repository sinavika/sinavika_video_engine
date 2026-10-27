import {z} from 'zod';
import {GEO_AREA_LAYERS, GEO_LAYER_NAMES} from '../../Configurations/GeoData';
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

/** Letters a plot may use as coefficients that change while the lesson is told: y = ax^2 + bx + c. */
export const PLOT_PARAMETERS = ['a', 'b', 'c', 'k', 'm', 'n'] as const;
const ParameterName = z.enum(PLOT_PARAMETERS);
const Fraction = z.number().min(0).max(1);

/**
 * One beat of a card's visual: a sentence of the narration and what the figure
 * does while it is said (see VisualTimeline). Parts are named per visual:
 * plot curves c1, c2, c3, points p1…, `tangent`, `area`; geometry point ids,
 * sides by their ends ("AB"), polygons by their points ("ABC"), angles
 * "angle-A"; forces by label; flow and cycle steps n1…; timeline events e1…;
 * map highlights and markers by name; sentence word tiles w1… and links l1…;
 * paragraph sentences s1… and `topic`; comparison columns c1… and their
 * items c1-1…; table rows r1… and columns col1….
 */
export const VisualBeatSchema = z.object({
	narration: z.string().trim().min(1).max(700),
	/** Parts that appear with this beat (and not before). */
	show: z.array(z.string().min(1).max(40)).max(10).default([]),
	/** Parts pointed at during this beat; everything else dims. Empty: nothing is singled out. */
	focus: z.array(z.string().min(1).max(40)).max(10).default([]),
	/** The camera: a part of the box as fractions [left, top, right, bottom]; null goes back to the whole figure. */
	zoom: z.tuple([Fraction, Fraction, Fraction, Fraction]).nullable().optional(),
	/** New values of the visual's coefficients, eased in while this beat is said. */
	params: z.partialRecord(ParameterName, z.number()).optional(),
	/** The stage of a process visual (river, earthquake, dynamics, equation, solid) this beat shows. */
	stage: z.number().int().min(0).max(12).optional(),
	/** A short line shown under the figure during the beat. */
	note: plainText(80).optional(),
	/** Sentence word tiles (w1…) that turn into their `swap` word while this beat is said. */
	swap: z.array(z.string().min(1).max(40)).max(6).default([]),
});

export type VisualBeat = z.infer<typeof VisualBeatSchema>;

const NodeSchema = z.object({label: richText(40), detail: plainText(64).optional()});

/** Directions a force can take relative to the surface the body is on, so the normal force is always perpendicular to it. */
export const FORCE_DIRECTIONS = ['weight', 'normal', 'upSlope', 'downSlope', 'right', 'left', 'up', 'down'] as const;

export const CourseVisualSchema = z.discriminatedUnion('kind', [
	/** Mathematics, physics, chemistry: a formula. */
	z.object({kind: z.literal('formula'), latex: latex(240), caption: plainText(120).optional()}),
	/** Chemistry: a reaction equation in mhchem notation, e.g. "2H2 + O2 -> 2H2O". */
	z.object({kind: z.literal('reaction'), equation: z.string().trim().min(1).max(200), caption: plainText(120).optional()}),
	/** Mathematics, physics, geography: graphs of functions of x, drawn as they are explained. */
	z
		.object({
			kind: z.literal('plot'),
			x: Point2,
			y: Point2,
			xLabel: label.optional(),
			yLabel: label.optional(),
			/** Functions of x; they may use the coefficients in `parameters` (y = ax^2 + c). */
			curves: z.array(z.object({expression: expression(['x', ...PLOT_PARAMETERS]), label: plainText(30).optional()})).max(3).default([]),
			/**
			 * Coefficients of the curves. Beats set new values and the curve reshapes while it is said; without
			 * beats a coefficient with `to` sweeps from `from` to `to` once the curve is drawn.
			 */
			parameters: z.partialRecord(ParameterName, z.object({from: z.number(), to: z.number().optional()})).default({}),
			/** Measured data drawn as bars or a line instead of a function, e.g. monthly rainfall. */
			series: z.object({kind: z.enum(['bars', 'line']), values: z.array(z.object({x: z.number(), y: z.number(), label: plainText(12).optional()})).min(2).max(24)}).optional(),
			points: z.array(z.object({x: z.number(), y: z.number(), label: plainText(20).optional()})).max(8).default([]),
			/** The tangent to curve `curve` (0 is the first) at x = `at`; `at` may be a coefficient's letter, so the tangent slides along. */
			tangent: z.object({curve: z.number().int().min(0).max(2).default(0), at: z.union([z.number(), ParameterName]), slope: z.boolean().default(true)}).optional(),
			/** The area under curve `curve` between `from` and `to`, whole or cut into `rectangles` strips (a number or a coefficient's letter). */
			area: z.object({curve: z.number().int().min(0).max(2).default(0), from: z.number(), to: z.number(), rectangles: z.union([z.number().int().min(1).max(200), ParameterName]).optional(), label: plainText(30).optional()}).optional(),
		})
		.superRefine((plot, context) => {
			const defined = Object.keys(plot.parameters);
			plot.curves.forEach((curve, index) => {
				if (!isExpression(curve.expression, ['x', ...defined])) context.addIssue({code: 'custom', path: ['curves', index, 'expression'], message: `Uses a coefficient that is not in parameters (${defined.join(', ') || 'none'}).`});
			});
			for (const [path, value] of [['tangent', plot.tangent?.at], ['area', plot.area?.rectangles]] as const) {
				if (typeof value === 'string' && !defined.includes(value)) context.addIssue({code: 'custom', path: [path], message: `"${value}" is not in parameters.`});
			}
			if (plot.tangent && plot.tangent.curve >= plot.curves.length) context.addIssue({code: 'custom', path: ['tangent', 'curve'], message: 'No such curve.'});
			if (plot.area && plot.area.curve >= plot.curves.length) context.addIssue({code: 'custom', path: ['area', 'curve'], message: 'No such curve.'});
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
	/**
	 * Physics: the forces on a body, as arrows from its centre. A force points by
	 * `direction` — relative to the surface where that matters (the normal force
	 * is perpendicular to it, friction along it) — or by `angle` in degrees
	 * (0 to the right, 90 up). Its length is `magnitude` against the largest one,
	 * or `size` (0-1) when no magnitudes are given.
	 */
	z
		.object({
			kind: z.literal('forces'),
			body: z.enum(['box', 'ball']).default('box'),
			/** An inclined surface under the body, in degrees; 0 is flat ground, null is no surface. */
			surface: z.number().min(0).max(60).nullable().default(0),
			forces: z
				.array(
					z
						.object({
							label: plainText(12),
							direction: z.enum(FORCE_DIRECTIONS).optional(),
							angle: z.number().optional(),
							/** In newtons; arrow lengths are drawn in proportion to it. */
							magnitude: z.number().positive().optional(),
							size: z.number().min(0.1).max(1).optional(),
						})
						.refine((force) => force.direction !== undefined || force.angle !== undefined, {message: 'A force needs a direction or an angle.'}),
				)
				.min(1)
				.max(6),
		})
		.superRefine((visual, context) => {
			const tilt = visual.surface ?? 0;
			visual.forces.forEach((force, index) => {
				// A normal force given by angle must stand perpendicular to the surface.
				if (force.angle !== undefined && force.direction === undefined && /^(N|F_?N|Fn)$/i.test(force.label.trim()) && Math.abs(((force.angle - (90 + tilt)) % 360 + 360) % 360) > 1) {
					context.addIssue({code: 'custom', path: ['forces', index], message: `The normal force must be perpendicular to the surface (${90 + tilt}°); use direction "normal".`});
				}
			});
		}),
	/**
	 * Physics: force → acceleration → motion in one scene. A body of `mass` on
	 * flat ground or an incline, pushed by the given forces, with friction:
	 * the net force and the acceleration are computed (a = F/m), the body moves
	 * accordingly, its velocity arrow grows with its speed, and the v-t / x-t /
	 * a-t graphs are drawn in step with the motion.
	 */
	z
		.object({
		kind: z.literal('dynamics'),
		mass: z.number().positive().max(1000),
		/** Incline angle in degrees; 0 is flat ground. */
		incline: z.number().min(0).max(60).default(0),
		/** Coefficient of kinetic friction μk: the friction on a sliding body, μk·N. */
		friction: z.number().min(0).max(1.5).default(0),
		/**
		 * Coefficient of static friction μs: a body at rest stays at rest while the other forces along the surface
		 * do not exceed μs·N. Not less than μk; when left out it is taken equal to μk (a simplification to avoid
		 * where the difference is taught).
		 */
		staticFriction: z.number().min(0).max(1.5).optional(),
		/** Applied forces in newtons, along the ground (right/left) or the incline (upSlope/downSlope). */
		forces: z.array(z.object({label: plainText(12), magnitude: z.number().min(0).max(10000), direction: z.enum(['right', 'left', 'upSlope', 'downSlope'])})).max(3).default([]),
		/** Initial velocity in m/s, positive to the right / up the slope. */
		initialVelocity: z.number().min(-100).max(100).default(0),
		/** Simulated time in seconds. */
		time: z.number().min(0.5).max(30).default(4),
		g: z.number().min(1).max(20).default(9.8),
		graphs: z.array(z.enum(['v', 'x', 'a'])).max(3).default(['v', 'x']),
	})
		.refine((visual) => visual.staticFriction === undefined || visual.staticFriction >= visual.friction, {path: ['staticFriction'], message: 'Static friction (μs) cannot be less than kinetic friction (μk).'}),
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
		/** Velocity arrow on the moving body; its length follows the speed. */
		velocity: z.boolean().default(false),
	}),
	/**
	 * Mathematics: an equation solved step by step on a balance. Each step is
	 * the equation after an operation done to both sides (`operation`, e.g.
	 * "−3", "÷2"); the pans stay level, which is the point.
	 */
	z.object({
		kind: z.literal('equation'),
		steps: z.array(z.object({left: latex(80), right: latex(80), operation: plainText(30).optional()})).min(2).max(8),
	}),
	/**
	 * Geography: how a river shapes the land, as a process in stages.
	 *   profile  side view from source to sea: flow, erosion upstream (the V valley deepens), transport, deposition at the mouth
	 *   meander  from above: the bends grow (outer bank eroded, inner bank built up) until a neck is cut off as an oxbow lake
	 *   delta    from above: the sediment the river carries builds a fan into the sea, split by distributaries
	 */
	z.object({kind: z.literal('river'), view: z.enum(['profile', 'meander', 'delta']), labels: z.boolean().default(true)}),
	/**
	 * Geography: an earthquake as a process: the fault between two blocks,
	 * stress building up (the rock bends), the rupture at the focus and the
	 * blocks slipping, then P, S and surface waves spreading. `block3d` shows
	 * the blocks in 3D.
	 */
	z.object({
		kind: z.literal('earthquake'),
		fault: z.enum(['normal', 'reverse', 'strikeSlip']).default('reverse'),
		view: z.enum(['section', 'block3d']).default('section'),
		labels: z.boolean().default(true),
	}),
	/**
	 * Mathematics: a solid in 3D, turning; its edges labelled with
	 * `dimensions`, and with `unfold` its net (açınım) opening flat.
	 */
	z.object({
		kind: z.literal('solid'),
		shape: z.enum(['cube', 'cuboid', 'triangularPrism', 'squarePyramid', 'cylinder', 'cone', 'sphere']),
		/** Edge labels in the order the shape takes them: cuboid a, b, c; cylinder r, h; etc. */
		dimensions: z.array(plainText(10)).max(3).default([]),
		unfold: z.boolean().default(false),
	}),
	/**
	 * Chemistry: a molecule's shape in 3D by VSEPR: the central atom, the atoms
	 * bonded to it and its lone pairs, turning slowly, with the bond angle.
	 */
	z
		.object({
			kind: z.literal('molecule3d'),
			formula: plainText(16),
			center: z.string().trim().min(1).max(2),
			ligands: z.array(z.string().trim().min(1).max(2)).min(1).max(6),
			lonePairs: z.number().int().min(0).max(3).default(0),
			/** The shape's name as taught, e.g. "Kırık doğru". */
			shapeName: plainText(30).optional(),
			bondAngle: plainText(12).optional(),
		})
		.refine((molecule) => molecule.ligands.length + molecule.lonePairs <= 6 && molecule.ligands.length + molecule.lonePairs >= 2, {message: 'Bonded atoms and lone pairs must be 2 to 6 electron domains.'}),
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
	 * Geography, history: a map from the project's map data (public/Geo, see
	 * Configurations/GeoData): the world's countries, or Turkey's country
	 * outline, regions, provinces or districts, with rivers and lakes on top.
	 * Names are Turkish: "Türkiye", "Konya", "Karadeniz Bölgesi", "Kızılırmak".
	 */
	z.object({
		kind: z.literal('map'),
		/** The areas the map is made of. A data file of your own: {"src": "Geo/...json", "object": "..."}. */
		base: z.union([z.enum(GEO_AREA_LAYERS), z.object({src: z.string().trim().regex(/^Geo\/[\w./-]+$/), object: z.string().max(60).optional()})]).default('countries'),
		/** Drawn on top of the base: rivers, lakes, region or province borders. `names` keeps only those; `labels` writes their names. */
		overlays: z.array(z.object({layer: z.enum(GEO_LAYER_NAMES), names: z.array(z.string().min(1).max(60)).max(20).default([]), labels: z.boolean().default(false)})).max(4).default([]),
		/** Areas drawn in the lesson colour, by name. */
		highlights: z.array(z.object({name: z.string().min(1).max(60), label: plainText(30).optional()})).max(12).default([]),
		/** The map is framed on these areas. Without them a world map frames its highlights, other maps show their whole base. */
		focus: z.array(z.string().min(1).max(60)).max(12).default([]),
		markers: z.array(z.object({at: Point2, label: plainText(30)})).max(10).default([]),
		/** Lines such as routes or campaigns, as [longitude, latitude] points. */
		routes: z.array(z.object({points: z.array(Point2).min(2).max(30), label: plainText(30).optional()})).max(4).default([]),
	}),
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
			links: z.array(z.object({from: z.number().int().min(1).max(14), to: z.number().int().min(1).max(14), label: plainText(24).optional()})).max(4).default([]),
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

/**
 * The part names a beat may use on a visual whose parts are numbered (see
 * VisualBeatSchema), or null for visuals whose parts are named by their
 * content (plots, geometry, forces, maps). Used to reject a beat that points
 * at a part the visual does not have.
 */
export const numberedPartNames = (visual: CourseVisual): string[] | null => {
	const count = (prefix: string, length: number) => Array.from({length}, (_, index) => `${prefix}${index + 1}`);
	switch (visual.kind) {
		case 'sentence':
			return [...count('w', visual.parts.length), ...count('l', visual.links.length)];
		case 'paragraph':
			return ['topic', ...count('s', visual.sentences.length)];
		case 'comparison':
			return visual.columns.flatMap((column, index) => [`c${index + 1}`, ...count(`c${index + 1}-`, column.items.length)]);
		case 'table':
			return [...count('r', visual.rows.length), ...count('col', Math.max(visual.header.length, ...visual.rows.map((row) => row.length)))];
		case 'flow':
		case 'cycle':
			return count('n', visual.nodes.length);
		case 'timeline':
			return count('e', visual.events.length);
		default:
			return null;
	}
};
