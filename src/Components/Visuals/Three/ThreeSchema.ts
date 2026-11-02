import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';

/**
 * The stages an earthquake visual plays: the fault in section ends on the waves, the 3D block on what the rupture
 * leaves at the surface. A normal or reverse fault leaves a step (fay dikliği); a strike-slip fault moves the blocks
 * sideways and leaves a road or a stream shifted along the fault (yatay atım), not a step.
 */
export const EARTHQUAKE_STAGES = {
	section: ['Fay', 'Gerilme birikir', 'Kırılma', 'Dalgalar'],
	block3d: ['Fay', 'Gerilme birikir', 'Kırılma', 'Fay dikliği'],
	block3dStrikeSlip: ['Fay', 'Gerilme birikir', 'Kırılma', 'Yatay atım'],
} as const;

/** The stages an earthquake visual of this fault and view plays, in order. */
export const earthquakeStages = (fault: 'normal' | 'reverse' | 'strikeSlip', view: 'section' | 'block3d'): readonly string[] =>
	view === 'section' ? EARTHQUAKE_STAGES.section : fault === 'strikeSlip' ? EARTHQUAKE_STAGES.block3dStrikeSlip : EARTHQUAKE_STAGES.block3d;

/** The 3D visuals (any lesson where depth helps): one schema per kind, joined in ../VisualSchema.ts. */
export const THREE_VISUALS = [
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
	 * Mathematics: a solid in 3D, turning; then it settles in a three-quarter view and its measures are
	 * written on it (`dimensions`); with `unfold` its net (açınım) opens flat, and a cube with `split` comes apart into
	 * the three equal pyramids it is made of. Beats move it through these stages.
	 */
	z
		.object({
			kind: z.literal('solid'),
			shape: z.enum(['cube', 'cuboid', 'triangularPrism', 'triangularPyramid', 'squarePyramid', 'hexagonalPyramid', 'cylinder', 'cone', 'sphere', 'halfCylinder']),
			/**
			 * Labels of the measures, in the shape's order: cube a; cuboid a (width), b (depth), c (height);
			 * cylinder r, h; cone r, h, ℓ (slant height); a pyramid (regular base) a, h, and the side faces' height;
			 * sphere r; half cylinder r and its length. Radii, heights and slant heights are drawn as lines; edges are named where they are. An empty
			 * label leaves that measure out (a pyramid's side height without its height).
			 */
			dimensions: z.array(z.union([z.literal(''), plainText(10)])).max(3).default([]),
			/** Proportions in the same order (cuboid 2, 3, 5; cone 3, 4; pyramid a, h), so the solid looks like its numbers. */
			size: z.array(z.number().positive()).max(3).optional(),
			/** Cube or cuboid: the body diagonal drawn through it, with this label (e.g. "a√3"). */
			diagonal: plainText(10).optional(),
			/**
			 * Pyramid: a lateral edge (yanal ayrıt) drawn from the apex to a base corner with this label, and the base's
			 * centre joined to that corner, so the right triangle of h, that half diagonal and the edge shows.
			 */
			lateralEdge: plainText(10).optional(),
			unfold: z.boolean().default(false),
			/** Cube: after its measures it comes apart into three equal pyramids with the same apex (why a pyramid is a third of a prism). */
			split: z.boolean().default(false),
			/**
			 * Cylinder, cone or sphere as a solid of revolution (dönel cisim): first its profile turns once about the axis,
			 * a rectangle for the cylinder, a right triangle for the cone, a half disc for the sphere, and sweeps the solid.
			 */
			sweep: z.boolean().default(false),
		})
		.refine((solid) => !solid.sweep || ['cylinder', 'cone', 'sphere'].includes(solid.shape), {message: 'Only a cylinder, a cone or a sphere is swept by a turning profile.'})
		.refine((solid) => !solid.unfold || solid.shape !== 'halfCylinder', {message: 'A half cylinder has no net.'})
		.refine((solid) => !solid.split || (solid.shape === 'cube' && !solid.unfold), {message: 'Only a cube splits into three pyramids, and it does not also unfold.'})
		.refine((solid) => !solid.lateralEdge || solid.shape.endsWith('Pyramid'), {message: 'A lateral edge is drawn on a pyramid only.'})
		.refine((solid) => !solid.diagonal || solid.shape === 'cube' || solid.shape === 'cuboid', {message: 'A body diagonal is drawn through a cube or a cuboid only.'}),
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
		.refine((molecule) => molecule.ligands.length + molecule.lonePairs <= 6 && molecule.ligands.length + molecule.lonePairs >= 2, {
			message: 'Bonded atoms and lone pairs must be 2 to 6 electron domains.',
		}),
] as const;
