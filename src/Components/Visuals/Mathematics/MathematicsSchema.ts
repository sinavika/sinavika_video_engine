import {z} from 'zod';
import {latex, plainText} from '../../../Schemas/RichText';
import {expression, Point2} from '../VisualSchemaPart';
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
					}),
				)
				.max(3)
				.default([]),
			/**
			 * Coefficients of the curves. Beats set new values and the curve reshapes while it is said; without
			 * beats a coefficient with `to` sweeps from `from` to `to` once the curve is drawn.
			 */
			parameters: z.partialRecord(ParameterName, z.object({from: z.number(), to: z.number().optional()})).default({}),
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
			points: z
				.array(z.object({x: z.number(), y: z.number(), label: plainText(20).optional()}))
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
	/** Geometry: points, segments, circles, angles and polygons in a coordinate box. */
	z
		.object({
			kind: z.literal('geometry'),
			/** The coordinates of the box: [minX, minY, maxX, maxY]. y grows upwards. */
			view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
			/**
			 * `hidden`: a helper point only (a line's far end): no dot and no letter. `dot: false` keeps the
			 * letter without the dot, for naming a line at its end ("d1").
			 */
			points: z
				.array(z.object({id: z.string().min(1).max(4), at: Point2, label: plainText(8).optional(), hidden: z.boolean().default(false), dot: z.boolean().default(true)}))
				.min(1)
				.max(16),
			/** `ticks`: the equal-length marks across a side (1-3 short strokes); sides with the same count are equal. */
			segments: z
				.array(z.object({from: z.string(), to: z.string(), label: plainText(12).optional(), dashed: z.boolean().default(false), ticks: z.number().int().min(0).max(3).default(0)}))
				.max(16)
				.default([]),
			polygons: z
				.array(z.object({points: z.array(z.string()).min(3).max(8), fill: z.boolean().default(true)}))
				.max(4)
				.default([]),
			circles: z
				.array(z.object({center: z.string(), radius: z.number().positive(), label: plainText(12).optional()}))
				.max(4)
				.default([]),
			/** The angle at `at`, between the rays to `from` and `to`. */
			angles: z
				.array(z.object({at: z.string(), from: z.string(), to: z.string(), label: plainText(10).optional(), right: z.boolean().default(false)}))
				.max(6)
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
			figure.circles.forEach((circle, index) => check(circle.center, ['circles', index, 'center']));
			figure.angles.forEach((angle, index) => (['at', 'from', 'to'] as const).forEach((key) => check(angle[key], ['angles', index, key])));
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
