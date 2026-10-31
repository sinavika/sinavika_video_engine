import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';
import {expression, Point2} from '../VisualSchemaPart';
import {polygonCentre, systemCentres} from './BodyCentre';
import {gearTrain} from './GearTrain';
import {forceDirection} from './PlateForce';

/** An element of a circuit: a resistor, a lamp (glowing by `brightness`), an ammeter or a switch (`open` breaks it). */
const CircuitElementSchema = z.object({
	kind: z.enum(['resistor', 'lamp', 'ammeter', 'switch']),
	label: plainText(10).optional(),
	brightness: z.number().min(0).max(1).optional(),
	open: z.boolean().default(false),
});

/** Directions a force can take relative to the surface the body is on, so the normal force is always perpendicular to it. */
const FORCE_DIRECTIONS = ['weight', 'normal', 'upSlope', 'downSlope', 'right', 'left', 'up', 'down'] as const;

/** The physics visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const PHYSICS_VISUALS = [
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
				if (force.angle !== undefined && force.direction === undefined && /^(N|F_?N|Fn)$/i.test(force.label.trim()) && Math.abs((((force.angle - (90 + tilt)) % 360) + 360) % 360) > 1) {
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
			forces: z
				.array(z.object({label: plainText(12), magnitude: z.number().min(0).max(10000), direction: z.enum(['right', 'left', 'upSlope', 'downSlope'])}))
				.max(3)
				.default([]),
			/** Initial velocity in m/s, positive to the right / up the slope. */
			initialVelocity: z.number().min(-100).max(100).default(0),
			/** Simulated time in seconds. */
			time: z.number().min(0.5).max(30).default(4),
			g: z.number().min(1).max(20).default(9.8),
			graphs: z
				.array(z.enum(['v', 'x', 'a']))
				.max(3)
				.default(['v', 'x']),
		})
		.refine((visual) => visual.staticFriction === undefined || visual.staticFriction >= visual.friction, {
			path: ['staticFriction'],
			message: 'Static friction (μs) cannot be less than kinetic friction (μk).',
		}),
	/**
	 * Physics: vectors as arrows on a square grid (one square, one unit): equal and opposite vectors, a vector
	 * and its multiples, head-to-tail addition and the resultant. The arrows grow from their tails one after
	 * another; beats point at them as v1, v2…
	 */
	z.object({
		kind: z.literal('vectors'),
		/** The box in grid units: [minX, minY, maxX, maxY]; y grows upwards. */
		view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
		vectors: z
			.array(z.object({from: Point2, to: Point2, label: plainText(12), colour: z.enum(['lesson', 'brand', 'ink']).optional(), dashed: z.boolean().default(false)}))
			.min(1)
			.max(8),
		grid: z.boolean().default(true),
	}),
	/**
	 * Physics: a rod on a pivot with forces and hanging loads at positions along it (from its left end). Each force's
	 * arm and torque (F · d) are written; the rod then stays level when the torques cancel ("Denge") or turns towards
	 * the side that wins. `weight` is the rod's own weight at its middle. Beats point at forces f1…, arms a1…, `pivot`,
	 * `weight` and `sum` (the totals each way). `torques: false` hides the numbers (arms keep their length, the verdict
	 * stays); `verdict: false` is for forces shown as alternatives to compare: the rod stays still and nothing is summed.
	 */
	z
		.object({
			kind: z.literal('lever'),
			/** In the unit of `unit` (m, cm, or grid units): any scale, the rod is drawn to fit. */
			length: z.number().positive().max(1000),
			pivot: z.number().min(0),
			forces: z
				.array(
					z.object({
						at: z.number().min(0),
						value: z.number().positive(),
						direction: z.enum(['down', 'up']).default('down'),
						load: z.boolean().default(false),
						label: plainText(12).optional(),
						/** Written on the arm instead of its length and torque: the unknown of a question ("x"). */ arm: plainText(8).optional(),
					}),
				)
				.min(1)
				.max(6),
			weight: z.number().positive().optional(),
			torques: z.boolean().default(true),
			verdict: z.boolean().default(true),
			unit: z.string().trim().max(4).default('m'),
		})
		.superRefine((lever, context) => {
			if (lever.pivot > lever.length) context.addIssue({code: 'custom', path: ['pivot'], message: 'The pivot is off the rod.'});
			lever.forces.forEach((force, index) => {
				if (force.at > lever.length) context.addIssue({code: 'custom', path: ['forces', index, 'at'], message: 'The force is off the rod.'});
			});
		}),
	/**
	 * Physics: Kepler's laws. A planet on an ellipse (`eccentricity`) round the Sun at a focus, moving by Kepler's
	 * equation (fast near the Sun); two sectors swept in the same share of the period (`sector`), near and far, are
	 * equal in area. `period` is seconds of video per orbit. Beats point at `planet`, `sectors` and `run`.
	 */
	z.object({
		kind: z.literal('kepler'),
		eccentricity: z.number().min(0).max(0.8).default(0.5),
		sector: z.number().min(0.02).max(0.2).default(0.08),
		period: z.number().min(3).max(30).default(8),
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics: simple harmonic motion. A block on a spring (`spring`) or a pendulum (`pendulum`) released from +A,
	 * `period` seconds of video per swing, with its velocity and acceleration arrows; `energy` adds Ek/Ep bars,
	 * `reference` (spring) the circle whose shadow the motion is, `trace` (spring) an x–t strip growing downwards.
	 * `marks` label points by their share of the amplitude (−1…1). With `motion` off the body stands at `at` (question
	 * figures). Beats point at `body`, `velocity`, `acceleration`, `energy`, `reference`, `trace`, `marks`, `run`.
	 */
	z
		.object({
			kind: z.literal('oscillator'),
			mode: z.enum(['spring', 'pendulum']).default('spring'),
			period: z.number().min(1.5).max(12).default(4),
			marks: z
				.array(z.object({label: plainText(3), at: z.number().min(-1).max(1)}))
				.max(7)
				.default([]),
			velocity: z.boolean().default(true),
			acceleration: z.boolean().default(true),
			energy: z.boolean().default(false),
			reference: z.boolean().default(false),
			trace: z.boolean().default(false),
			motion: z.boolean().default(true),
			at: z.number().min(-1).max(1).default(1),
		})
		.superRefine((oscillator, context) => {
			if (oscillator.reference && oscillator.trace) context.addIssue({code: 'custom', path: ['trace'], message: 'Show the reference circle or the trace, not both.'});
			if (oscillator.mode === 'pendulum' && (oscillator.reference || oscillator.trace))
				context.addIssue({code: 'custom', path: ['mode'], message: 'The reference circle and the trace are for the spring.'});
		}),
	/**
	 * Physics: interference. `ripple`: a ripple tank from above, two in-phase sources `separation` wavelengths apart,
	 * moving crests, antinodal (solid) and nodal (dashed) lines when `lines`, and `points` placed in wavelengths from
	 * the sources' midpoint (y up). `double` / `single`: light through two slits or one onto a screen with the fringes
	 * and the brightness curve; `colours` (one or two of red, green, blue) compares fringe widths. Beats point at
	 * `sources`, `crests`, `antinodes`, `nodes`, p1…, `run` (ripple) and `slits`, `screen`, `graph`, `width` (slits).
	 */
	z
		.object({
			kind: z.literal('interference'),
			mode: z.enum(['ripple', 'double', 'single']).default('ripple'),
			separation: z.number().min(1).max(6).default(3),
			lines: z.boolean().default(true),
			points: z
				.array(z.object({label: plainText(4), x: z.number().min(-8).max(8), y: z.number().min(-4.5).max(4.5)}))
				.max(4)
				.default([]),
			colours: z
				.array(z.enum(['red', 'green', 'blue']))
				.min(1)
				.max(2)
				.default(['green']),
			motion: z.boolean().default(true),
		})
		.superRefine((interference, context) => {
			if (interference.mode !== 'ripple' && interference.points.length > 0) context.addIssue({code: 'custom', path: ['points'], message: 'Points are for the ripple tank.'});
		}),
	/**
	 * Physics: the Doppler effect. A source moving right at `speed` (share of the wave speed, 0 = still) sends out
	 * circular fronts that crowd ahead (short λ, high f) and spread behind (long λ, low f). Beats point at `source`,
	 * `fronts`, `ahead`, `behind` and `run`.
	 */
	z.object({
		kind: z.literal('doppler'),
		speed: z.number().min(0).max(0.8).default(0.5),
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics: Bohr's hydrogen atom. Orbits n = 1…`levels` (radius ∝ n²) and an electron that makes each of
	 * `transitions` in turn: down sends out a photon (hf = ΔE), up absorbs one first. With `diagram` the energy
	 * levels to scale (E = −13.6/n² eV) draw the same jumps. Beats point at `nucleus`, `orbits`, `levels`, `jump`,
	 * `photon` and `run`.
	 */
	z
		.object({
			kind: z.literal('bohr'),
			levels: z.number().int().min(2).max(6).default(4),
			transitions: z
				.array(z.object({from: z.number().int().min(1).max(6), to: z.number().int().min(1).max(6)}))
				.min(1)
				.max(4)
				.default([{from: 3, to: 2}]),
			diagram: z.boolean().default(true),
			motion: z.boolean().default(true),
		})
		.superRefine((bohr, context) => {
			bohr.transitions.forEach((step, index) => {
				if (step.from === step.to) context.addIssue({code: 'custom', path: ['transitions', index], message: 'A jump needs two different orbits.'});
				if (Math.max(step.from, step.to) > bohr.levels) context.addIssue({code: 'custom', path: ['transitions', index], message: 'The jump goes past the orbits drawn.'});
			});
		}),
	/**
	 * Physics: half-life. A grid of `count` nuclei decaying at random moments, half of what is left in every
	 * half-life (`halfLives` of them, `period` seconds each), with the count and, when `graph`, the curve
	 * N = N₀/2^(t/T). Beats point at `nuclei`, `count`, `graph` and `run`.
	 */
	/**
	 * Physics: the photoelectric effect. Photons of `frequency` (in units of the first metal's threshold f₀) fall on a
	 * metal; above the threshold each knocks out an electron, faster for a higher frequency, more of them for a higher
	 * `intensity`. With `graph` the Ek–f lines of the `metals` (thresholds in units of f₀; one slope h), `intercept`
	 * extending them to −W. Beats point at `plate`, `light`, `electrons`, `graph`, `slope` and `run`.
	 */
	z.object({
		kind: z.literal('photoelectric'),
		frequency: z.number().min(0.3).max(3).default(1.8),
		intensity: z.number().int().min(1).max(3).default(2),
		metals: z
			.array(z.object({threshold: z.number().min(0.5).max(2), label: plainText(10).optional()}))
			.min(1)
			.max(3)
			.default([{threshold: 1}]),
		graph: z.boolean().default(true),
		intercept: z.boolean().default(false),
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics and chemistry: nuclear reactions. `fission`: a neutron splits a heavy nucleus into two fragments, 2–3
	 * neutrons and energy; `chain`: three generations of fissions growing k-fold, or held at one by control rods
	 * (`controlled`); `fusion`: two light nuclei merge into a heavier one, a neutron and energy. Labels are written as
	 * isotopes (²³⁵U, ¹⁴¹Ba). Beats point at the mode's parts and `run`.
	 */
	z.object({
		kind: z.literal('nuclear'),
		mode: z.enum(['fission', 'chain', 'fusion']).default('fission'),
		target: plainText(10).default('²³⁵U'),
		products: z.tuple([plainText(10), plainText(10)]).default(['¹⁴¹Ba', '⁹²Kr']),
		neutrons: z.number().int().min(2).max(3).default(3),
		energy: plainText(16).default('Enerji'),
		controlled: z.boolean().default(false),
		rodLabel: plainText(18).default('Kontrol çubukları'),
		countLabel: plainText(20).default('Bölünen çekirdek'),
		fusion: z
			.object({
				left: z.object({label: plainText(8), nucleons: z.number().int().min(1).max(8)}),
				right: z.object({label: plainText(8), nucleons: z.number().int().min(1).max(8)}),
				product: z.object({label: plainText(8), nucleons: z.number().int().min(1).max(12)}),
			})
			.default({left: {label: '²H', nucleons: 2}, right: {label: '³H', nucleons: 3}, product: {label: '⁴He', nucleons: 4}}),
		period: z.number().min(1.5).max(6).default(2.5),
		motion: z.boolean().default(true),
	}),
	z.object({
		kind: z.literal('halfLife'),
		count: z.number().int().min(16).max(100).default(64),
		halfLives: z.number().int().min(1).max(5).default(3),
		period: z.number().min(1.5).max(8).default(3),
		graph: z.boolean().default(true),
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics: circular motion. `disk`: bodies on one turning disk (same ω, v = ωr); `orbit`: bodies orbiting one
	 * centre (the inner faster); each with its velocity (tangent) and centripetal acceleration (to the centre), sizes
	 * compared. `vertical`: a ball on a string round a vertical circle with T and mg at the top and the bottom.
	 * Beats point at b1…, `velocity`, `acceleration` and `run`.
	 */
	z.object({
		kind: z.literal('circular'),
		mode: z.enum(['disk', 'orbit', 'vertical']),
		bodies: z
			.array(z.object({label: plainText(3), radius: z.number().min(0.2).max(1)}))
			.min(1)
			.max(3)
			.default([{label: 'K', radius: 1}]),
		velocity: z.boolean().default(true),
		acceleration: z.boolean().default(true),
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics: induction. A bar magnet (its `pole` facing the ring) comes towards a metal ring, stops, and goes back;
	 * a galvanometer swings one way, rests, swings the other way, and arrows show the induced current (Lenz's law).
	 * Beats move the stages with `stage` 0 (approach), 1 (still), 2 (away) and point at `magnet`, `ring`, `meter`.
	 */
	z.object({
		kind: z.literal('induction'),
		pole: z.enum(['N', 'S']).default('N'),
	}),
	/**
	 * Physics: magnetism in four pictures (`mode`): `particle` (a charge turning on a circle in a field into or out of
	 * the page, the force towards the centre), `wire` (a current through the page and its circular field lines),
	 * `force` (a current in a field and F = BiL across it), `parallel` (two currents attracting or repelling).
	 * Directions follow the right-hand rule. Beats point at `field`, `body`, `force` and `run`.
	 */
	z
		.object({
			kind: z.literal('magneticField'),
			mode: z.enum(['particle', 'wire', 'force', 'parallel']),
			field: z.enum(['in', 'out']).default('in'),
			charge: z.enum(['+', '-']).default('+'),
			current: z.enum(['in', 'out', 'up', 'down', 'left', 'right']).default('out'),
			currents: z.tuple([z.enum(['up', 'down']), z.enum(['up', 'down'])]).default(['up', 'up']),
			motion: z.boolean().default(true),
			duration: z.number().min(2).max(20).default(5),
		})
		.superRefine((figure, context) => {
			const through = figure.current === 'in' || figure.current === 'out';
			if (figure.mode === 'wire' && !through) context.addIssue({code: 'custom', path: ['current'], message: 'A wire through the page carries its current in or out.'});
			if (figure.mode === 'force' && through) context.addIssue({code: 'custom', path: ['current'], message: 'A wire in the page carries its current up, down, left or right.'});
		}),
	/**
	 * Physics: two parallel plates (`top` is the upper plate's sign) with the uniform field between them, `charges`
	 * signs on each plate, the potential difference (`voltage`) and the gap (`gap`). A `particle` may cross the field
	 * sideways and bend (`deflect`), speed from one plate to the other (`accelerate`) or hang still where qE balances
	 * mg (`balance`, the oil drop). Beats point at `plates`, `field`, `particle`, `forces` and `run`.
	 */
	z
		.object({
			kind: z.literal('parallelPlates'),
			top: z.enum(['+', '-']).default('+'),
			voltage: plainText(10).optional(),
			gap: plainText(8).optional(),
			field: z.boolean().default(true),
			charges: z.number().int().min(2).max(12).default(6),
			particle: z.object({charge: z.enum(['+', '-']), mode: z.enum(['deflect', 'accelerate', 'balance']), label: plainText(6).optional()}).optional(),
			motion: z.boolean().default(true),
			duration: z.number().min(2).max(20).default(4),
		})
		.superRefine((figure, context) => {
			if (figure.particle?.mode === 'balance' && forceDirection(figure.top, figure.particle.charge) > 0)
				context.addIssue({
					code: 'custom',
					path: ['particle', 'charge'],
					message: 'A balanced drop needs the electric force upwards: a negative drop under a positive top plate, or the other way round.',
				});
		}),
	/**
	 * Physics: point charges in a plane and their field (k = 1, lengths in the units of `view`). Field lines leave the
	 * positive charges and end on the negative ones; `equipotentials` are dashed curves at those potentials (in units
	 * of kq/d); at each point the field is an arrow (`field`) and the potential may be written (`potential`). Beats
	 * point at charges c1…, `lines`, `equipotentials` and points p1….
	 */
	z
		.object({
			kind: z.literal('electricField'),
			view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
			charges: z
				.array(z.object({at: Point2, q: z.number().min(-5).max(5), label: plainText(6).optional()}))
				.min(1)
				.max(4),
			lines: z.boolean().default(true),
			equipotentials: z.array(z.number()).max(6).default([]),
			points: z
				.array(z.object({at: Point2, label: plainText(8), field: z.boolean().default(true), potential: z.boolean().default(false)}))
				.max(4)
				.default([]),
		})
		.superRefine((figure, context) => {
			const [minX, minY, maxX, maxY] = figure.view;
			const inside = ([x, y]: readonly [number, number]) => x >= minX && x <= maxX && y >= minY && y <= maxY;
			figure.charges.forEach((charge, index) => {
				if (charge.q === 0) context.addIssue({code: 'custom', path: ['charges', index, 'q'], message: 'A charge cannot be zero.'});
				if (!inside(charge.at)) context.addIssue({code: 'custom', path: ['charges', index, 'at'], message: 'The charge is outside the view.'});
			});
			figure.points.forEach((point, index) => {
				if (!inside(point.at)) context.addIssue({code: 'custom', path: ['points', index, 'at'], message: 'The point is outside the view.'});
			});
		}),
	/**
	 * Physics: a head-on collision of two carts on a line (velocities positive to the right). `elastic` keeps
	 * momentum and kinetic energy, `inelastic` sticks them together, `explosion` pushes apart two carts that start
	 * together, with the velocities in `after` (momentum must be kept). Under the track the momenta before and after
	 * are arrows with their totals; `energy` writes the kinetic energy before and after. Beats point at b1, b2,
	 * `before`, `after`, `energy` and `run`.
	 */
	z
		.object({
			kind: z.literal('collision'),
			bodies: z.tuple([
				z.object({label: plainText(4), mass: z.number().positive().max(1000), v: z.number().min(-100).max(100)}),
				z.object({label: plainText(4), mass: z.number().positive().max(1000), v: z.number().min(-100).max(100)}),
			]),
			type: z.enum(['elastic', 'inelastic', 'explosion']),
			after: z.tuple([z.number(), z.number()]).optional(),
			energy: z.boolean().default(false),
			motion: z.boolean().default(true),
			duration: z.number().min(2).max(20).default(6),
			unit: plainText(16).default('p (kg·m/s)'),
		})
		.superRefine((figure, context) => {
			const [a, b] = figure.bodies;
			if (figure.type === 'explosion') {
				if (!figure.after) context.addIssue({code: 'custom', path: ['after'], message: 'An explosion needs the velocities after it.'});
				else if (Math.abs(a.mass * figure.after[0] + b.mass * figure.after[1] - (a.mass * a.v + b.mass * b.v)) > 1e-6 * (a.mass + b.mass) * (Math.abs(a.v) + Math.abs(b.v) + 1))
					context.addIssue({code: 'custom', path: ['after'], message: 'Momentum must be kept in an explosion.'});
				if (Math.abs(a.v - b.v) > 1e-9) context.addIssue({code: 'custom', path: ['bodies'], message: 'Carts that explode apart start together, at one velocity.'});
			} else if (a.v <= b.v) context.addIssue({code: 'custom', path: ['bodies'], message: 'The left cart must be faster to the right than the right cart, or they never meet.'});
		}),
	/**
	 * Physics: a throw. Speed `v0` at `angle` degrees above the horizontal (negative below; 90 straight up) from
	 * `height` metres, under `g` (or any constant acceleration, as a charge between plates). The body flies with its
	 * velocity and its two components; `strobe` leaves ghost positions at equal times; the top and the range are
	 * measured. Without `ground` the flight lasts `time` seconds. `motion: false` (a question's figure) shows the whole
	 * path with the body at the start. Beats point at `body`, `path`, `components`, `strobe`, `apex`, `range`, `run`.
	 */
	z
		.object({
			kind: z.literal('projectile'),
			v0: z.number().min(0).max(200),
			angle: z.number().min(-90).max(90).default(0),
			height: z.number().min(0).max(1000).default(0),
			g: z.number().min(0.1).max(100).default(10),
			ground: z.boolean().default(true),
			time: z.number().positive().max(100).optional(),
			strobe: z.number().int().min(0).max(10).default(0),
			components: z.boolean().default(true),
			marks: z.boolean().default(true),
			motion: z.boolean().default(true),
			duration: z.number().min(2).max(20).default(5),
			rangeLabel: plainText(10).default('menzil'),
		})
		.superRefine((figure, context) => {
			if (figure.ground && figure.height === 0 && (figure.angle <= 0 || figure.v0 === 0)) context.addIssue({code: 'custom', path: ['angle'], message: 'A throw from the ground must go upwards.'});
		}),
	/**
	 * Physics: energy along a track. A body slides along a profile of heights (`profile`: [x, h] in metres, x
	 * increasing) from `start` with speed `v0`, at the speed its energy allows (½mv² = E − mgh), turning back where it
	 * runs out; `friction` is a constant force along the track that turns energy into heat. Bars beside it show the
	 * kinetic, potential and lost energy under a line at the starting total. Beats point at `body`, `bars`, `run`.
	 */
	z
		.object({
			kind: z.literal('energyTrack'),
			profile: z.array(Point2).min(2).max(12),
			start: z.number(),
			v0: z.number().min(0).max(100).default(0),
			mass: z.number().positive().max(1000).default(1),
			g: z.number().min(1).max(20).default(10),
			/** A constant friction force along the track, in newtons. */
			friction: z.number().min(0).max(1000).default(0),
			/** Simulated seconds, played over `duration` seconds of video. */
			time: z.number().min(0.5).max(60).default(6),
			duration: z.number().min(2).max(20).default(6),
		})
		.superRefine((figure, context) => {
			figure.profile.forEach((point, index) => {
				if (index > 0 && point[0] <= figure.profile[index - 1][0]) context.addIssue({code: 'custom', path: ['profile', index], message: 'The profile runs left to right: x must increase.'});
			});
			const [first, last] = [figure.profile[0][0], figure.profile[figure.profile.length - 1][0]];
			if (figure.start < first || figure.start > last) context.addIssue({code: 'custom', path: ['start'], message: 'The body starts on the track.'});
		}),
	/**
	 * Physics: motion in one dimension with its graphs. One or two bodies (`x0`, `v0`) run through phases of constant
	 * acceleration (`a: 0` is constant velocity) on a road; under it the v-t, x-t or a-t graphs draw in step, and the
	 * area under the first body's v-t graph fills: the displacement, written as it grows. `motion: false` (a question's
	 * figure) stands complete; `track: false` leaves the road out. Beats point at b1, b2, `run` and `area`.
	 */
	z
		.object({
			kind: z.literal('kinematics'),
			bodies: z
				.array(
					z.object({
						label: plainText(6),
						x0: z.number().default(0),
						v0: z.number().default(0),
						phases: z
							.array(
								z.object({
									duration: z.number().positive().max(100),
									a: z.number().min(-100).max(100),
									/** The velocity the phase starts at (a sudden change). */ v: z.number().min(-1000).max(1000).optional(),
								}),
							)
							.min(1)
							.max(5),
					}),
				)
				.min(1)
				.max(2),
			graphs: z
				.array(z.enum(['x', 'v', 'a']))
				.min(1)
				.max(2)
				.default(['v']),
			area: z.boolean().default(false),
			track: z.boolean().default(true),
			motion: z.boolean().default(true),
			/** Seconds of video the motion takes. */
			duration: z.number().min(2).max(20).default(6),
		})
		.superRefine((figure, context) => {
			const totals = figure.bodies.map((body) => body.phases.reduce((sum, phase) => sum + phase.duration, 0));
			if (totals.some((total) => Math.abs(total - totals[0]) > 1e-9)) context.addIssue({code: 'custom', path: ['bodies'], message: 'Both bodies run for the same time.'});
			if (!figure.track && figure.motion && figure.graphs.length === 0) context.addIssue({code: 'custom', path: ['graphs'], message: 'Nothing to draw.'});
		}),
	/**
	 * Physics: gears and belt wheels (kasnak) turning together. The first wheel (the driver) turns `turns` times; each
	 * other wheel is joined to the one before it: `mesh` (gears touching: the other way, r₁/r₂ the speed), `belt` (the
	 * same way), `crossed` (a crossed belt: the other way) or `axle` (riveted on one axle: together). `angle` places a
	 * wheel from the one before (degrees, 0 to the right, 90 down). A wheel may hang a load on a rope (`hang`), which
	 * moves 2πr per turn. Counters under the wheels run to their turns. Beats point at wheels w1…, `turn` and `counts`.
	 */
	z
		.object({
			kind: z.literal('gears'),
			wheels: z
				.array(
					z.object({
						label: plainText(4),
						/** In units: r = 1, 2r = 2… (teeth keep one size: 10 per unit). */
						radius: z.number().positive().max(6),
						teeth: z.boolean().default(true),
						link: z.enum(['mesh', 'belt', 'crossed', 'axle']).optional(),
						angle: z.number().min(-360).max(360).optional(),
						radiusLabel: plainText(6).optional(),
						hang: z.object({label: plainText(8), side: z.enum(['left', 'right']).default('right')}).optional(),
					}),
				)
				.min(1)
				.max(5),
			turns: z.number().positive().max(6).default(1),
			counters: z.boolean().default(true),
			motion: z.boolean().default(true),
		})
		.superRefine((figure, context) => {
			figure.wheels.forEach((wheel, index) => {
				if (index === 0 && wheel.link) context.addIssue({code: 'custom', path: ['wheels', 0, 'link'], message: 'The first wheel drives the others: it has no link.'});
				if (index > 0 && !wheel.link) context.addIssue({code: 'custom', path: ['wheels', index, 'link'], message: 'Every wheel after the first is linked to the one before it.'});
				if (wheel.link === 'mesh' && !(wheel.teeth && figure.wheels[index - 1]?.teeth)) context.addIssue({code: 'custom', path: ['wheels', index, 'link'], message: 'Only gears with teeth mesh.'});
			});
			const train = gearTrain(figure.wheels);
			figure.wheels.forEach((a, i) =>
				figure.wheels.forEach((b, j) => {
					if (j <= i) return;
					const distance = Math.hypot(train[i].x - train[j].x, train[i].y - train[j].y);
					const sameAxle = distance < 1e-6;
					const meshing = j === i + 1 && b.link === 'mesh';
					if (train[i].layer === train[j].layer && !sameAxle && !meshing && distance < a.radius + b.radius - 1e-6)
						context.addIssue({code: 'custom', path: ['wheels', j], message: `Wheels ${a.label} and ${b.label} overlap.`});
				}),
			);
		}),
	/**
	 * Physics: a block and tackle with `ropes` supporting segments (1 = one fixed pulley, 2 = a moving pulley with a
	 * fixed one to turn the pull downwards, 3–6 = a tackle). The load and the moving pulleys share the supporting ropes:
	 * F = (G + moving pulleys' weight) / n. The free end is pulled and the load rises n times less while the pulleys
	 * turn; h and x = n·h are marked. `motion: false` keeps a question's figure still. Beats point at `ropes` (numbers
	 * the supporting segments), `load`, `f`, `pull` (starts the pull) and `h` (the two lengths).
	 */
	z.object({
		kind: z.literal('pulley'),
		ropes: z.number().int().min(1).max(6),
		/** G, in newtons. */
		load: z.number().positive(),
		/** The weight of each moving pulley, in newtons. */
		pulleyWeight: z.number().positive().optional(),
		loadLabel: plainText(12).optional(),
		forceLabel: plainText(14).optional(),
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics: the centre of mass of point masses, uniform rods and plates on a square grid (one square a unit, y up).
	 * Each body comes in with its own centre; the system's centre (KM) then slides from body to body as each one is
	 * counted, pulled towards the heavier, and its coordinates are read off the axes. A `removed` plate is a piece cut
	 * out of the plate before it: it counts with negative mass, so the centre moves away from the hole. A plate without
	 * a mass weighs its area (all plates one density). Beats point at bodies b1…, `centre` and `coordinates`.
	 */
	z
		.object({
			kind: z.literal('centreOfMass'),
			/** The box in grid units: [minX, minY, maxX, maxY]. */
			view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
			axes: z.boolean().default(true),
			bodies: z
				.array(
					z.discriminatedUnion('kind', [
						z.object({kind: z.literal('point'), at: Point2, mass: z.number().positive(), label: plainText(8)}),
						z.object({kind: z.literal('rod'), from: Point2, to: Point2, mass: z.number().positive(), label: plainText(8).optional()}),
						z.object({kind: z.literal('plate'), corners: z.array(Point2).min(3).max(8), mass: z.number().positive().optional(), label: plainText(8).optional(), removed: z.boolean().default(false)}),
					]),
				)
				.min(1)
				.max(6),
			/** The system's centre; `coordinates` also reads it off the axes. */
			centre: z.boolean().default(true),
			coordinates: z.boolean().default(true),
		})
		.superRefine((figure, context) => {
			const [minX, minY, maxX, maxY] = figure.view;
			if (minX >= maxX || minY >= maxY) context.addIssue({code: 'custom', path: ['view'], message: 'The view is empty.'});
			const inside = ([x, y]: readonly [number, number]) => x >= minX && x <= maxX && y >= minY && y <= maxY;
			figure.bodies.forEach((body, index) => {
				const points = body.kind === 'point' ? [body.at] : body.kind === 'rod' ? [body.from, body.to] : body.corners;
				if (!points.every(inside)) context.addIssue({code: 'custom', path: ['bodies', index], message: 'The body is outside the view.'});
				if (body.kind === 'plate' && polygonCentre(body.corners).area === 0) context.addIssue({code: 'custom', path: ['bodies', index, 'corners'], message: 'The plate has no area.'});
			});
			systemCentres(figure.bodies).forEach((step, index) => {
				if (step.mass <= 0) context.addIssue({code: 'custom', path: ['bodies', index], message: 'A removed piece must follow the plate it is cut from, and some mass must remain.'});
			});
		}),
	/**
	 * Physics: capillarity. Glass tubes of different inner diameters stand in a basin; water (adhesion > cohesion)
	 * climbs them with a concave surface, mercury (cohesion > adhesion) sinks in them with a convex one, the
	 * narrower the tube the more. Beats point at the tubes as t1, t2, t3.
	 */
	z.object({
		kind: z.literal('capillary'),
		liquid: z.enum(['water', 'mercury']),
		tubes: z
			.array(z.object({diameter: z.number().positive(), label: plainText(8).optional()}))
			.min(1)
			.max(3),
	}),
	/**
	 * Physics: liquid pressure. One to three vessels side by side (straight, wider at the top or narrower at the
	 * top), filled to the same level, optionally joined at the bottom (connected vessels), with up to two liquid
	 * layers and marked points at given depths. Beats point at vessels k1… and points p1…
	 */
	z.object({
		kind: z.literal('tank'),
		vessels: z
			.array(z.object({shape: z.enum(['straight', 'flared', 'tapered']).default('straight'), label: plainText(8).optional()}))
			.min(1)
			.max(3),
		/** Height of the liquid surface, as a share of the vessels' height. */
		level: z.number().min(0.2).max(1).default(0.8),
		/** Liquids from the bottom up; each height is a share of the vessels' height. One layer fills to `level`. */
		layers: z
			.array(z.object({liquid: z.enum(['water', 'oil', 'mercury']), height: z.number().min(0.05).max(1).optional(), label: plainText(12).optional()}))
			.min(1)
			.max(2)
			.default([{liquid: 'water'}]),
		points: z
			.array(z.object({vessel: z.number().int().min(0).max(2).default(0), depth: z.number().min(0).max(1), label: plainText(8)}))
			.max(6)
			.default([]),
		connected: z.boolean().default(false),
		/**
		 * Bodies in the liquid (buoyancy): `submerged` is the share of the body under the surface; below 1 it floats,
		 * at 1 it hangs in the liquid (`at: 'middle'`) or lies on the bottom (`at: 'bottom'`). Beats point at them as b1…
		 */
		bodies: z
			.array(
				z.object({
					vessel: z.number().int().min(0).max(2).default(0),
					label: plainText(8),
					submerged: z.number().min(0.05).max(1).default(1),
					at: z.enum(['middle', 'bottom']).default('middle'),
					size: z.number().min(0.4).max(1.6).default(1),
				}),
			)
			.max(4)
			.default([]),
	}),
	/**
	 * Physics: electric charges. One to three objects side by side (a sphere, a rod or an electroscope) with their
	 * charges drawn as signs; a neutral conductor near a charged one shows induction (the near side takes the
	 * opposite sign); an electroscope's leaves open by `leaves`; arrows show attraction or repulsion. Beats point
	 * at objects o1… and forces f1…
	 */
	z.object({
		kind: z.literal('charges'),
		objects: z
			.array(
				z.object({
					shape: z.enum(['sphere', 'rod', 'electroscope']).default('sphere'),
					label: plainText(12).optional(),
					charge: z.enum(['positive', 'negative', 'neutral']).default('neutral'),
					/** Induction on a neutral conductor: the side whose charges gather and their sign; the far side takes the other sign. */
					induced: z.object({side: z.enum(['left', 'right', 'top']), sign: z.enum(['positive', 'negative'])}).optional(),
					/** Electroscope: how far the leaves open, 0 closed to 1 wide. */
					leaves: z.number().min(0).max(1).default(0),
				}),
			)
			.min(1)
			.max(3),
		forces: z
			.array(z.object({from: z.number().int().min(0).max(2), to: z.number().int().min(0).max(2), kind: z.enum(['attract', 'repel'])}))
			.max(3)
			.default([]),
	}),
	/**
	 * Physics: an electric circuit. A battery on the bottom wire and, along the top, a chain of elements and
	 * parallel groups (each branch a short chain). Lamps glow by `brightness`; an open switch breaks its branch.
	 * Beats point at the elements in reading order as e1, e2… (branches top to bottom).
	 */
	z.object({
		kind: z.literal('circuit'),
		battery: plainText(12).optional(),
		items: z
			.array(z.union([CircuitElementSchema, z.object({parallel: z.array(z.array(CircuitElementSchema).min(1).max(3)).min(2).max(3)})]))
			.min(1)
			.max(4),
	}),
	/**
	 * Physics: waves on a square grid (one square, one unit). One or two rows to compare (deep and shallow water,
	 * before and after): a transverse wave as a moving curve with its wavelength λ and amplitude A marked, or a
	 * longitudinal one as compressions and rarefactions. Points on a row show which way they are moving. Beats
	 * point at rows w1, w2 and points p1…
	 */
	z.object({
		kind: z.literal('wave'),
		/** Length of the medium shown, in grid units. */
		length: z.number().min(2).max(24).default(10),
		rows: z
			.array(
				z.object({
					wavelength: z.number().min(0.5).max(24),
					amplitude: z.number().min(0.2).max(4).default(1),
					type: z.enum(['transverse', 'longitudinal']).default('transverse'),
					label: plainText(16).optional(),
					/** Draw the λ and A marks on this row. */
					marks: z.boolean().default(true),
				}),
			)
			.min(1)
			.max(2),
		/** The wave travels to the right while it is shown; false freezes it (a snapshot, as in a question). */
		travel: z.boolean().default(true),
		points: z
			.array(z.object({row: z.number().int().min(0).max(1).default(0), x: z.number(), label: plainText(6)}))
			.max(4)
			.default([]),
		grid: z.boolean().default(true),
		/** Arrows on the points showing which way they move; off in a question that asks it. */
		motion: z.boolean().default(true),
	}),
	/**
	 * Physics: a ray diagram on equal axes. Mirrors and lenses stand on the principal axis (y = 0) at their x; a
	 * boundary is a horizontal surface between two media. Objects and images are arrows from the axis (images may
	 * be virtual: dashed). Rays are polylines drawn one after another with arrowheads; a dashed ray without arrows
	 * is a normal or an extension. Beats point at rays r1…, objects o1… and elements m1…
	 */
	z.object({
		kind: z.literal('optics'),
		view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
		axis: z.boolean().default(true),
		elements: z
			.array(
				z.object({
					kind: z.enum(['planeMirror', 'concaveMirror', 'convexMirror', 'convergingLens', 'divergingLens', 'boundary']),
					/** Where the element stands on the axis; for a boundary, its y. */
					at: z.number(),
					/** Height of a mirror or lens. */
					size: z.number().positive().default(4),
					label: plainText(12).optional(),
					/** Boundary: names of the media above and below. */
					media: z.tuple([plainText(12), plainText(12)]).optional(),
				}),
			)
			.max(3)
			.default([]),
		points: z
			.array(z.object({x: z.number(), y: z.number().default(0), label: plainText(6)}))
			.max(6)
			.default([]),
		objects: z
			.array(z.object({x: z.number(), height: z.number(), label: plainText(12).optional(), virtual: z.boolean().default(false)}))
			.max(3)
			.default([]),
		rays: z
			.array(z.object({points: z.array(Point2).min(2).max(5), dashed: z.boolean().default(false), arrows: z.boolean().default(true), colour: z.enum(['brand', 'lesson', 'ink']).default('brand')}))
			.max(8)
			.default([]),
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
		/** Velocity arrow on the moving body; its length follows the speed. */
		velocity: z.boolean().default(false),
	}),
	/**
	 * Astronomy, history of science: Mars's retrograde motion in the Sun-centred model. Earth and Mars circle the Sun
	 * at their real period ratio (`year`: seconds per Earth year); a sight line from the Earth through Mars and a sky
	 * strip show Mars moving forward among the stars, looping back while the Earth overtakes it, then forward again.
	 * Parts: sun, earth, mars, sightline, sky, retro.
	 */
	z.object({
		kind: z.literal('retrograde'),
		year: z.number().min(8).max(30).default(16),
		sunLabel: plainText(14).default('Güneş'),
		earthLabel: plainText(14).default('Dünya'),
		marsLabel: plainText(14).default('Mars'),
		skyLabel: plainText(30).default("Mars'ın gökteki yolu"),
		forwardLabel: plainText(16).default('İleri'),
		retroLabel: plainText(20).default('Geri hareket'),
		motion: z.boolean().default(true),
	}),
] as const;
