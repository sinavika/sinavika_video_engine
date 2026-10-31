import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';

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
	 * written on it (`dimensions`); with `unfold` its net (açınım) opens flat. Beats move it through these
	 * stages.
	 */
	z.object({
		kind: z.literal('solid'),
		shape: z.enum(['cube', 'cuboid', 'triangularPrism', 'squarePyramid', 'cylinder', 'cone', 'sphere']),
		/**
		 * Labels of the measures, in the shape's order: cube a; cuboid a (width), b (depth), c (height);
		 * cylinder r, h; cone r, h, ℓ (slant height); square pyramid a, h, and the side faces' height;
		 * sphere r. Radii, heights and slant heights are drawn as lines; edges are named where they are.
		 */
		dimensions: z.array(plainText(10)).max(3).default([]),
		/** Proportions in the same order (cuboid 2, 3, 5; cone 3, 4), so the solid looks like its numbers. */
		size: z.array(z.number().positive()).max(3).optional(),
		/** Cube or cuboid: the body diagonal drawn through it, with this label (e.g. "a√3"). */
		diagonal: plainText(10).optional(),
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
		.refine((molecule) => molecule.ligands.length + molecule.lonePairs <= 6 && molecule.ligands.length + molecule.lonePairs >= 2, {
			message: 'Bonded atoms and lone pairs must be 2 to 6 electron domains.',
		}),
] as const;
