import {z} from 'zod';
import {latex, plainText} from '../../../Schemas/RichText';
import {expression, Point2} from '../VisualSchemaPart';
import {isExpression} from './PlotExpression';
import {shapesSimilar} from './Similarity';

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

/** Letters a plot may use as coefficients that change while the lesson is told: y = ax^2 + bx + c. */
const PLOT_PARAMETERS = ['a', 'b', 'c', 'k', 'm', 'n'] as const;

export const ParameterName = z.enum(PLOT_PARAMETERS);

/** The mathematics visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const MATHEMATICS_VISUALS = [
	/** Mathematics, physics, chemistry: a formula. */
	z.object({kind: z.literal('formula'), latex: latex(240), caption: plainText(120).optional()}),
	/** Mathematics, physics, geography: graphs of functions of x, drawn as they are explained. */
	z
		.object({
			kind: z.literal('plot'),
			x: Point2,
			y: Point2,
			xLabel: label.optional(),
			yLabel: label.optional(),
			/** Functions of x; they may use the coefficients in `parameters` (y = ax^2 + c). */
			curves: z
				.array(
					z.object({
						expression: expression(['x', ...PLOT_PARAMETERS]),
						label: plainText(30).optional(),
						/** Drawn only for x in [from, to]: one piece of a piecewise function (AYT limit, continuity). */
						domain: z.tuple([z.number(), z.number()]).optional(),
						/** The piece's ends: a filled dot where the end belongs to it, a hollow one where it does not. */
						ends: z.tuple([z.enum(['none', 'open', 'closed']), z.enum(['none', 'open', 'closed'])]).default(['none', 'none']),
						/**
						 * When its coefficients change, the curve as first drawn stays behind as a faint dashed line, so the
						 * shift itself is seen: demand rising, f(x) → f(x − 2). Without it the old curve vanished and the
						 * student saw only where the curve ended up (KPSS VAT 8, arz-talep).
						 */
						trace: z.boolean().default(false),
						/**
						 * The next piece of the curve before it (a piecewise function): drawn in its colour. Each piece
						 * took a colour of its own and read as another function (AYT Matematik, limit; Soru revizyonu).
						 */
						piece: z.boolean().default(false),
					}),
				)
				.max(3)
				.default([]),
			/**
			 * Coefficients of the curves. Beats set new values and the curve reshapes while it is said; without
			 * beats a coefficient with `to` sweeps from `from` to `to` once the curve is drawn.
			 */
			parameters: z.partialRecord(ParameterName, z.object({from: z.number(), to: z.number().optional()})).default({}),
			/**
			 * The coefficients' values written in the top left corner (a = 2). Off where the letters are only the
			 * engine's way to move a curve and the lesson never reads them, such as a demand curve shifted right.
			 */
			showParameters: z.boolean().default(true),
			/** Measured data drawn as bars or a line instead of a function, e.g. monthly rainfall. */
			series: z
				.object({
					kind: z.enum(['bars', 'line']),
					values: z
						.array(z.object({x: z.number(), y: z.number(), label: plainText(12).optional()}))
						.min(2)
						.max(24),
					/** Bars: each value written on its bar. Beats point at bars as b1, b2… */ showValues: z.boolean().default(false),
				})
				.optional(),
			/**
			 * Marked points. `open` draws a hollow dot: the value a function does not take, such as a removable gap of a
			 * limit question, on an unbroken curve (it used to be split into two curves with hollow ends).
			 */
			points: z
				.array(z.object({x: z.number(), y: z.number(), label: plainText(20).optional(), style: z.enum(['closed', 'open']).default('closed')}))
				.max(8)
				.default([]),
			/** Helper lines between two places of the plane, e.g. the legs Δx and Δy of a distance or a slope. Beats point at them as s1, s2… */
			segments: z
				.array(z.object({from: Point2, to: Point2, label: plainText(16).optional(), dashed: z.boolean().default(true)}))
				.max(6)
				.default([]),
			/**
			 * One unit is equally long on both axes, so perpendicular lines look perpendicular and a slope looks as
			 * steep as it is (analytic geometry). The plot keeps the shape of its ranges and is centred in its box.
			 */
			equalScale: z.boolean().default(false),
			/**
			 * Where the axes are drawn: through the origin (functions), or along the bottom and left edges for measured
			 * graphs whose ranges cross zero, such as a heating curve from −20 °C, where a line at T = 0 would hide the
			 * melting plateau (KIM 4).
			 */
			axes: z.enum(['origin', 'edge']).default('origin'),
			/** The tangent to curve `curve` (0 is the first) at x = `at`; `at` may be a coefficient's letter, so the tangent slides along. */
			tangent: z.object({curve: z.number().int().min(0).max(2).default(0), at: z.union([z.number(), ParameterName]), slope: z.boolean().default(true)}).optional(),
			/** The area under curve `curve` between `from` and `to`, whole or cut into `rectangles` strips (a number or a coefficient's letter). */
			area: z
				.object({
					curve: z.number().int().min(0).max(2).default(0),
					from: z.number(),
					to: z.number(),
					rectangles: z.union([z.number().int().min(1).max(200), ParameterName]).optional(),
					label: plainText(30).optional(),
				})
				.optional(),
			/**
			 * The limit at x = `at` (part `approach`): a point runs along curve `left` towards `at` from the left and one along
			 * curve `right` from the right, their heights dropped onto the axes, until both close in on the value. `hole`
			 * leaves a hollow dot where each side ends; `label` names the value on the y axis ("L = 4").
			 */
			approach: z
				.object({at: z.number(), left: z.number().int().min(0).max(2).optional(), right: z.number().int().min(0).max(2).optional(), hole: z.boolean().default(false), label: plainText(20).optional()})
				.optional(),
		})
		.superRefine((plot, context) => {
			const defined = Object.keys(plot.parameters);
			plot.curves.forEach((curve, index) => {
				if (!isExpression(curve.expression, ['x', ...defined]))
					context.addIssue({code: 'custom', path: ['curves', index, 'expression'], message: `Uses a coefficient that is not in parameters (${defined.join(', ') || 'none'}).`});
			});
			for (const [path, value] of [
				['tangent', plot.tangent?.at],
				['area', plot.area?.rectangles],
			] as const) {
				if (typeof value === 'string' && !defined.includes(value)) context.addIssue({code: 'custom', path: [path], message: `"${value}" is not in parameters.`});
			}
			if (plot.curves.some((curve) => curve.trace) && Object.keys(plot.parameters).length === 0)
				context.addIssue({code: 'custom', path: ['curves'], message: 'A traced curve needs a coefficient that changes; there are no parameters.'});
			if (plot.tangent && plot.tangent.curve >= plot.curves.length) context.addIssue({code: 'custom', path: ['tangent', 'curve'], message: 'No such curve.'});
			if (plot.area && plot.area.curve >= plot.curves.length) context.addIssue({code: 'custom', path: ['area', 'curve'], message: 'No such curve.'});
			if (plot.approach) {
				const {left, right} = plot.approach;
				if (left === undefined && right === undefined) context.addIssue({code: 'custom', path: ['approach'], message: 'Approach from the left, the right or both.'});
				for (const [side, index] of [
					['left', left],
					['right', right],
				] as const)
					if (index !== undefined && index >= plot.curves.length) context.addIssue({code: 'custom', path: ['approach', side], message: 'No such curve.'});
			}
			plot.curves.forEach((curve, index) => {
				if (curve.domain && !(curve.domain[0] < curve.domain[1]))
					context.addIssue({code: 'custom', path: ['curves', index, 'domain'], message: 'A domain runs from its smaller end to its larger end.'});
			});
		}),
	/**
	 * Geometry: unit cubes in an isometric view (x to the lower right, y to the lower left, z up), for volume by counting.
	 * `group` names cubes a beat shows together (they drop into place: a base layer, then the layers above it); `shade`
	 * 1-3 marks cubes apart; `dimensions` name the block's edges along x, y and z.
	 */
	z
		.object({
			kind: z.literal('cubes'),
			cubes: z
				.array(
					z.object({
						at: z.tuple([z.number().int().min(0).max(9), z.number().int().min(0).max(9), z.number().int().min(0).max(9)]),
						group: z.string().min(1).max(12).optional(),
						shade: z.number().int().min(1).max(3).default(1),
					}),
				)
				.min(1)
				.max(80),
			dimensions: z.array(plainText(10)).max(3).default([]),
		})
		.superRefine((block, context) => {
			const seen = new Set<string>();
			block.cubes.forEach((cube, index) => {
				const key = cube.at.join(',');
				if (seen.has(key)) context.addIssue({code: 'custom', path: ['cubes', index, 'at'], message: `Two cubes stand at ${key}.`});
				seen.add(key);
			});
		}),
	/** Geometry: points, segments, circles, angles and polygons in a coordinate box. */
	z
		.object({
			kind: z.literal('geometry'),
			/** The coordinates of the box: [minX, minY, maxX, maxY]. y grows upwards. */
			view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
			/**
			 * The coordinate axes through the origin, for analytic geometry: a mark every `step` with its number, the names
			 * x and y at the ends, and with `grid` light lines across. The figure keeps its shapes, angles and copies.
			 */
			axes: z.object({step: z.number().positive().default(1), numbers: z.boolean().default(true), grid: z.boolean().default(false)}).optional(),
			/**
			 * `hidden`: a helper point only (a line's far end): no dot and no letter. `dot: false` keeps the
			 * letter without the dot, for naming a line at its end ("d1"), or for a caption under a shape ("çeşitkenar").
			 * An empty label keeps the dot without a letter: the unnamed corners of shapes shown side by side. `caption`: the
			 * text stands on the point itself instead of beside it (a name under a shape, "dar açılı"); no dot. `moveTo`: where the
			 * point slides when a beat shows `move-<id>`; its sides, angles and shapes follow (a triangle's apex sliding
			 * along a parallel keeps its area).
			 */
			points: z
				.array(
					z.object({
						id: z.string().min(1).max(4),
						at: Point2,
						label: z.union([z.literal(''), plainText(12)]).optional(),
						hidden: z.boolean().default(false),
						dot: z.boolean().default(true),
						caption: z.boolean().default(false),
						moveTo: Point2.optional(),
						/** The point (a circle's centre) to slide round instead of straight: the angle turns, the distance stays. */
						moveAbout: z.string().min(1).max(4).optional(),
					}),
				)
				.min(1)
				// 24: a proof drawn twice side by side (Pythagoras' two squares of a + b, KPSS Geometri 6) needs 17.
				.max(24),
			/** `ticks`: the equal-length marks across a side (1-3 short strokes); sides with the same count are equal. */
			segments: z
				.array(z.object({from: z.string(), to: z.string(), label: plainText(12).optional(), dashed: z.boolean().default(false), ticks: z.number().int().min(0).max(3).default(0)}))
				.max(24)
				.default([]),
			/**
			 * Filled shapes. `id` names one for beats (default: its points' names joined, "ABC"). `copyOf`: the id of a
			 * congruent or similar shape, corner by corner in order; this one comes over from it when a beat shows it,
			 * sliding, turning and growing (a flip turns it over), the way one triangle is laid on another. The schema
			 * checks that the two shapes really are similar. `label` stands at the shape's centre (an area's name, "S");
			 * `shade` 1-3 tells neighbouring regions apart.
			 */
			polygons: z
				.array(
					z.object({
						points: z.array(z.string()).min(3).max(8),
						fill: z.boolean().default(true),
						id: z.string().min(1).max(12).optional(),
						copyOf: z.string().min(1).max(12).optional(),
						label: plainText(10).optional(),
						shade: z.number().int().min(1).max(3).default(1),
					}),
				)
				.max(12)
				.default([]),
			/**
			 * A circle round the point `center`, or with `arc` only the part from one direction to another (degrees,
			 * 0 = right, counter-clockwise): a compass mark. `label` stands outside it, at the arc's middle (a full
			 * circle's at its upper right). `id` names it for beats (default `circle-<center>`); a beat that shows it
			 * draws it then, the way a compass is turned.
			 */
			circles: z
				.array(
					z.object({
						center: z.string(),
						radius: z.number().positive(),
						label: plainText(12).optional(),
						arc: z.tuple([z.number(), z.number()]).optional(),
						dashed: z.boolean().default(false),
						id: z.string().min(1).max(12).optional(),
						/** A filled disc, or with `arc` a filled sector (daire dilimi); `shade` 1-3 as for shapes. */
						fill: z.boolean().default(false),
						shade: z.number().int().min(1).max(3).default(1),
					}),
				)
				.max(6)
				.default([]),
			/**
			 * The angle at `at`, between the rays to `from` and `to`. `arcs`: the equal-angle marks (1-3 arcs); angles with
			 * the same count are equal, like the ticks of sides. `id`: the part's name for beats, when several angles share a
			 * corner (the default is `angle-<at>`, one name for all of them). `copyOf`: the id of an equal angle elsewhere;
			 * this angle slides over from there when a beat shows it, the way a proof carries an angle along a parallel.
			 */
			angles: z
				.array(
					z.object({
						at: z.string(),
						from: z.string(),
						to: z.string(),
						label: plainText(10).optional(),
						right: z.boolean().default(false),
						arcs: z.number().int().min(1).max(3).default(1),
						id: z.string().min(1).max(12).optional(),
						copyOf: z.string().min(1).max(12).optional(),
					}),
				)
				// 12: a polygon's five exterior angles and their five copies gathered round one point (KPSS Geometri 8).
				.max(12)
				.default([]),
		})
		.superRefine((figure, context) => {
			// A name that is not a point would be drawn at the figure's corner (a circle round the top left).
			const ids = new Set(figure.points.map((point) => point.id));
			const check = (id: string, path: (string | number)[]) => {
				if (!ids.has(id)) context.addIssue({code: 'custom', path, message: `"${id}" is not a point of the figure.`});
			};
			figure.segments.forEach((segment, index) => {
				check(segment.from, ['segments', index, 'from']);
				check(segment.to, ['segments', index, 'to']);
			});
			figure.polygons.forEach((polygon, index) => polygon.points.forEach((id, at) => check(id, ['polygons', index, 'points', at])));
			// A copied shape is similar to its source corner by corner: every distance between two corners keeps one ratio.
			figure.polygons.forEach((polygon, index) => {
				if (polygon.copyOf === undefined) return;
				const source = figure.polygons.find((other) => other !== polygon && other.id === polygon.copyOf);
				if (!source) {
					context.addIssue({code: 'custom', path: ['polygons', index, 'copyOf'], message: `"${polygon.copyOf}" is not another shape of the figure.`});
					return;
				}
				const corners = (shape: typeof polygon) => shape.points.map((id): [number, number] => {
					const [x, y] = figure.points.find((point) => point.id === id)?.at ?? [0, 0];
					return [x, y];
				});
				if (!shapesSimilar(corners(source), corners(polygon)))
					context.addIssue({code: 'custom', path: ['polygons', index, 'copyOf'], message: `The shape is not similar to "${polygon.copyOf}" corner by corner.`});
			});
			figure.circles.forEach((circle, index) => check(circle.center, ['circles', index, 'center']));
			// A circle or arc stays in the figure's box: one larger than the view is drawn over the card around it and cut by
			// the frame (a dashed full circle round a sector, KPSS Geometri 10).
			const [minX, minY, maxX, maxY] = figure.view;
			const slackX = (maxX - minX) * 0.02;
			const slackY = (maxY - minY) * 0.02;
			figure.circles.forEach((circle, index) => {
				const [cx, cy] = figure.points.find((point) => point.id === circle.center)?.at ?? [0, 0];
				const [from, to] = circle.arc ?? [0, 360];
				const sweep = circle.arc ? ((((to - from) % 360) + 360) % 360) || 360 : 360;
				for (let step = 0; step <= 36; step++) {
					const angle = ((from + (sweep * step) / 36) * Math.PI) / 180;
					const [x, y] = [cx + circle.radius * Math.cos(angle), cy + circle.radius * Math.sin(angle)];
					if (x < minX - slackX || x > maxX + slackX || y < minY - slackY || y > maxY + slackY) {
						context.addIssue({code: 'custom', path: ['circles', index], message: `The circle leaves the view [${figure.view.join(', ')}].`});
						return;
					}
				}
			});
			// A point that slides round a centre keeps its distance from it: it moves on a circle.
			figure.points.forEach((point, index) => {
				if (point.moveAbout === undefined) return;
				check(point.moveAbout, ['points', index, 'moveAbout']);
				const centre = figure.points.find((other) => other.id === point.moveAbout)?.at ?? [0, 0];
				const from = Math.hypot(point.at[0] - centre[0], point.at[1] - centre[1]);
				const to = point.moveTo ? Math.hypot(point.moveTo[0] - centre[0], point.moveTo[1] - centre[1]) : from;
				if (!point.moveTo || Math.abs(from - to) > 0.01 * Math.max(from, to))
					context.addIssue({code: 'custom', path: ['points', index, 'moveAbout'], message: 'A point that slides round a centre needs a moveTo just as far from it.'});
			});
			figure.angles.forEach((angle, index) => (['at', 'from', 'to'] as const).forEach((key) => check(angle[key], ['angles', index, key])));
			// Angle names are unique; a copy names an angle of the figure that measures the same, or the proof would lie.
			const angleIds = figure.angles.map((angle) => angle.id).filter((id): id is string => id !== undefined);
			angleIds.forEach((id, index) => {
				if (angleIds.indexOf(id) !== index) context.addIssue({code: 'custom', path: ['angles'], message: `Two angles are named "${id}".`});
			});
			const where = new Map(figure.points.map((point) => [point.id, point.at]));
			const size = (angle: (typeof figure.angles)[number]) => {
				const [cx, cy] = where.get(angle.at) ?? [0, 0];
				const [ax, ay] = where.get(angle.from) ?? [0, 0];
				const [bx, by] = where.get(angle.to) ?? [0, 0];
				const cos = ((ax - cx) * (bx - cx) + (ay - cy) * (by - cy)) / ((Math.hypot(ax - cx, ay - cy) || 1) * (Math.hypot(bx - cx, by - cy) || 1));
				return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
			};
			figure.angles.forEach((angle, index) => {
				if (angle.copyOf === undefined) return;
				const source = figure.angles.find((other) => other.id === angle.copyOf);
				if (!source || source === angle) {
					context.addIssue({code: 'custom', path: ['angles', index, 'copyOf'], message: `"${angle.copyOf}" is not another angle of the figure.`});
					return;
				}
				if (Math.abs(size(source) - size(angle)) > 1)
					context.addIssue({code: 'custom', path: ['angles', index, 'copyOf'], message: `The copy measures ${size(angle).toFixed(1)}°, its source "${angle.copyOf}" ${size(source).toFixed(1)}°.`});
			});
		}),
	/**
	 * Mathematics: an equation solved step by step on a balance. Each step is
	 * the equation after an operation done to both sides (`operation`, e.g.
	 * "−3", "÷2"); the pans stay level, which is the point. An inequality begins
	 * each right side with its relation ("\\geq 7"), which then stands at the pivot.
	 */
	z.object({
		kind: z.literal('equation'),
		steps: z
			.array(z.object({left: latex(80), right: latex(80), operation: plainText(30).optional()}))
			.min(2)
			.max(8),
	}),
	/**
	 * Mathematics: a number line for inequalities, intervals and absolute value. `range` is the stretch drawn; `ticks`
	 * lists the numbers written under it (whole numbers by default). An interval's `from`/`to` is null where it runs
	 * on without end; `closedFrom`/`closedTo` fill its end dots. Row 0 lies on the line; rows 1 and 2 float above it,
	 * for the inequalities of a system whose common part is drawn on the line. Parts: i1… the intervals (each sweeps
	 * in when a beat shows or focuses it), p1… the points.
	 */
	z
		.object({
			kind: z.literal('numberLine'),
			range: z.tuple([z.number(), z.number()]),
			ticks: z.array(z.number()).max(16).optional(),
			intervals: z
				.array(
					z.object({
						from: z.number().nullable(),
						to: z.number().nullable(),
						closedFrom: z.boolean().default(false),
						closedTo: z.boolean().default(false),
						label: plainText(24).optional(),
						row: z.number().int().min(0).max(2).default(0),
					}),
				)
				.max(6)
				.default([]),
			points: z
				.array(z.object({x: z.number(), label: plainText(16).optional(), open: z.boolean().default(false)}))
				.max(8)
				.default([]),
		})
		.superRefine((line, context) => {
			const [low, high] = line.range;
			if (!(low < high)) context.addIssue({code: 'custom', path: ['range'], message: 'The range runs from a smaller to a larger number.'});
			const inside = (value: number | null) => value === null || (value >= low && value <= high);
			line.intervals.forEach((interval, index) => {
				if (!inside(interval.from) || !inside(interval.to)) context.addIssue({code: 'custom', path: ['intervals', index], message: 'An interval end lies outside the range.'});
				if (interval.from !== null && interval.to !== null && interval.from >= interval.to)
					context.addIssue({code: 'custom', path: ['intervals', index], message: 'An interval runs from its smaller end to its larger end.'});
			});
			line.points.forEach((point, index) => {
				if (!inside(point.x)) context.addIssue({code: 'custom', path: ['points', index, 'x'], message: 'A point lies outside the range.'});
			});
			(line.ticks ?? []).forEach((tick, index) => {
				if (!inside(tick)) context.addIssue({code: 'custom', path: ['ticks', index], message: 'A tick lies outside the range.'});
			});
		}),
	/**
	 * Mathematics (trigonometry): the unit circle. Each angle (parts a1…; degrees, a negative one turns clockwise) turns
	 * in from 0° when a beat shows or focuses it; `label` names it at its arc and `point` the point it ends at on the
	 * circle. `lines` draws, for the angle that turned last, the cosine along the x axis, the sine up to the point and the
	 * tangent on the line x = 1 (parts cos, sin, tan). `signs` writes the positive functions of each quadrant (q1…q4);
	 * `wave` traces the sine or cosine graph beside the circle while the angle turns (part wave).
	 */
	z.object({
		kind: z.literal('unitCircle'),
		angles: z
			.array(z.object({degrees: z.number().min(-720).max(720), label: plainText(12).optional(), point: plainText(24).optional()}))
			.min(1)
			.max(4),
		lines: z
			.array(z.enum(['sin', 'cos', 'tan']))
			.max(3)
			.default(['sin', 'cos']),
		signs: z.boolean().default(false),
		wave: z.enum(['sin', 'cos']).optional(),
	}),
	/**
	 * Mathematics (Dönüşümler): a point, a segment or a polygon (`shape`, named vertices) moved step by step on a
	 * coordinate grid. Each step (parts s1…) plays when a beat shows or focuses it: `translate` slides it by a vector,
	 * `rotate` turns it about `center` (degrees, negative clockwise), `reflect` mirrors it in an axis, the origin or
	 * y = ±x, `reflectLine` in the line x = at or y = at, `reflectPoint` in a point. Earlier positions stay as outlines,
	 * names gain a prime per step; `coordinates` writes the vertices' coordinates once a step has finished.
	 */
	z.object({
		kind: z.literal('transform'),
		view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
		shape: z
			.array(z.object({name: plainText(3), at: Point2}))
			.min(1)
			.max(6),
		steps: z
			.array(
				z.discriminatedUnion('kind', [
					z.object({kind: z.literal('translate'), by: Point2, label: plainText(40).optional()}),
					z.object({kind: z.literal('rotate'), degrees: z.number().min(-360).max(360), center: Point2.default([0, 0]), label: plainText(40).optional()}),
					z.object({kind: z.literal('reflect'), over: z.enum(['x', 'y', 'origin', 'y=x', 'y=-x']), label: plainText(40).optional()}),
					z.object({kind: z.literal('reflectLine'), axis: z.enum(['x', 'y']), at: z.number(), label: plainText(40).optional()}),
					z.object({kind: z.literal('reflectPoint'), center: Point2, label: plainText(40).optional()}),
				]),
			)
			.min(1)
			.max(4),
		coordinates: z.boolean().default(false),
	}),
] as const;
