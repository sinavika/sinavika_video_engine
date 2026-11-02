import {describe, expect, it} from 'vitest';
import {coneNetPoints, cubePyramids, halfCylinderFaces, regularPyramid, revolvedFaces, solidColours, solidMarks, solidSize, sweepMarks, sweepProfile} from '../../../../src/Components/Visuals/Three/Solid';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('solids', () => {
	it('unrolls a cone into a sector of radius ℓ and angle 360° · r / ℓ, the base disc touching its arc', () => {
		const closed = coneNetPoints(3, 4, 0);
		expect(closed.apex).toEqual([0, 4, 0]);
		for (const [x, y, z] of closed.base) {
			expect(Math.hypot(x, z)).toBeCloseTo(3, 9);
			expect(y).toBe(0);
		}
		const open = coneNetPoints(3, 4, 1);
		expect(open.slant).toBe(5);
		expect((open.sector * 180) / Math.PI).toBeCloseTo(216, 9);
		const away = (p: readonly number[]) => Math.hypot(p[0] - open.apex[0], p[1] - open.apex[1], p[2] - open.apex[2]);
		for (const point of open.base) expect(away(point)).toBeCloseTo(5, 9);
		const [first, last] = [open.base[0], open.base[open.base.length - 1]];
		const turn = Math.abs(Math.atan2(last[2] - open.apex[2], last[0] - open.apex[0]) - Math.atan2(first[2] - open.apex[2], first[0] - open.apex[0]));
		expect(Math.min(turn, 2 * Math.PI - turn)).toBeCloseTo(2 * Math.PI - open.sector, 9);
		expect(away(open.disc)).toBeCloseTo(5 + 3, 9);
		expect([open.apex[1], open.disc[1], ...open.base.map((point) => point[1])].every((y) => y === 0)).toBe(true);
	});

	it('draws a solid in the proportions of its numbers', () => {
		const box = solidSize({shape: 'cuboid', size: [5, 3, 2]}) as {a: number; b: number; c: number};
		expect(box.a / box.c).toBeCloseTo(2.5, 6);
		expect(box.b / box.c).toBeCloseTo(1.5, 6);
		const cone = solidSize({shape: 'cone', size: [3, 4]}) as {r: number; h: number};
		expect(cone.h / cone.r).toBeCloseTo(4 / 3, 6);
	});

	it('colours a solid in the lesson colour only: light faces, stronger bases, dark edges', () => {
		const lesson = '#2563EB';
		const {face, alt, edge} = solidColours(lesson);
		const light = (hex: string) => parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);
		expect(light(face)).toBeGreaterThan(light(alt));
		expect(light(alt)).toBeGreaterThan(light(lesson));
		expect(light(edge)).toBeLessThan(light(lesson));
		// Every colour keeps the lesson colour's hue: blue stays the strongest channel, no orange base.
		for (const colour of [face, alt, edge]) expect(parseInt(colour.slice(5, 7), 16)).toBeGreaterThan(parseInt(colour.slice(1, 3), 16));
	});

	it('writes the measures on a solid: the cone and the pyramid show their right triangle', () => {
		const cone = solidMarks({shape: 'cone', size: [3, 4], dimensions: ['r', 'h', 'ℓ'], diagonal: undefined});
		expect(cone.map((mark) => mark.label)).toEqual(['r', 'h', 'ℓ']);
		// r and ℓ meet at the same point of the rim; h and ℓ start at the apex.
		expect(cone[0].to).toEqual(cone[2].to);
		expect(cone[1].from).toEqual(cone[2].from);
		const pyramid = solidMarks({shape: 'squarePyramid', size: [6, 4], dimensions: ['a', 'h', "h'"], diagonal: undefined});
		expect(pyramid.filter((mark) => mark.from)).toHaveLength(3);
		const cube = solidMarks({shape: 'cube', size: undefined, dimensions: ['a'], diagonal: 'a√3'});
		expect(cube.map((mark) => mark.label)).toEqual(['a', 'a', 'a', 'a√3']);
	});

	it('builds a pyramid on a regular base: its corners on the circumcircle, each edge a long, the apothem to each edge middle', () => {
		for (const sides of [3, 4, 6]) {
			const {apothem, radius, slant, edgeAngles, corners} = regularPyramid(sides, 2, 3);
			expect(corners).toHaveLength(sides);
			corners.forEach(([x, y, z], k) => {
				expect(Math.hypot(x, z)).toBeCloseTo(radius, 9);
				expect(y).toBe(0);
				const [nx, , nz] = corners[(k + 1) % sides];
				expect(Math.hypot(nx - x, nz - z)).toBeCloseTo(2, 9);
			});
			// Edge k runs between corners k and k + 1: its middle is at the apothem in the direction of edgeAngles[k].
			edgeAngles.forEach((angle, k) => {
				const [p, q] = [corners[k], corners[(k + 1) % sides]];
				expect((p[0] + q[0]) / 2).toBeCloseTo(apothem * Math.cos(angle), 9);
				expect((p[2] + q[2]) / 2).toBeCloseTo(apothem * Math.sin(angle), 9);
			});
			expect(slant).toBeCloseTo(Math.hypot(3, apothem), 9);
		}
		// The square keeps the front edge facing the viewer (+z), as before.
		const square = regularPyramid(4, 6, 4);
		expect(square.apothem).toBeCloseTo(3, 9);
		expect(square.edgeAngles[0]).toBeCloseTo(Math.PI / 2, 9);
		expect(square.radius).toBeCloseTo(3 * Math.SQRT2, 9);
	});

	it('writes the lateral edge of a pyramid: the apex to a corner, with the base centre joined to that corner', () => {
		const marks = solidMarks({shape: 'squarePyramid', size: [6, 4], dimensions: ['a', 'h'], diagonal: undefined, lateralEdge: 'k'});
		const edge = marks.find((mark) => mark.label === 'k');
		expect(edge?.from).toEqual([0, expect.any(Number), 0]);
		const inner = marks.find((mark) => mark.dashed && mark.to === edge?.to && mark.from?.[1] === 0);
		expect(inner).toBeDefined();
		const size = solidSize({shape: 'squarePyramid', size: [6, 4]}) as {a: number; h: number};
		// h, the half diagonal a√2 / 2 and the lateral edge make a right triangle.
		const [x, , z] = edge?.to ?? [0, 0, 0];
		expect(Math.hypot(x, z)).toBeCloseTo((size.a * Math.SQRT2) / 2, 9);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'cuboid', lateralEdge: 'k'}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'hexagonalPyramid', dimensions: ['a', 'h', "h'"], lateralEdge: 'k'}).success).toBe(true);
	});

	it('leaves out a measure with an empty label: the side height without the height', () => {
		const marks = solidMarks({shape: 'triangularPyramid', size: [6, 3.6], dimensions: ['6', '', "h'"], diagonal: undefined});
		expect(marks.map((mark) => mark.label).filter(Boolean)).toEqual(['6', "h'"]);
		// No line runs down the axis from the apex to the base's centre.
		expect(marks.some((mark) => mark.to && mark.to[0] === 0 && mark.to[2] === 0 && mark.from?.[1] !== 0)).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'triangularPyramid', dimensions: ['6', '', "h'"]}).success).toBe(true);
	});

	it('puts h′ on a face the viewer sees, for the triangular, square and hexagonal pyramid', () => {
		for (const shape of ['triangularPyramid', 'squarePyramid', 'hexagonalPyramid'] as const) {
			const marks = solidMarks({shape, size: [4, 5], dimensions: ['a', 'h', "h'"], diagonal: undefined});
			expect(marks.map((mark) => mark.label).filter(Boolean)).toEqual(['a', 'h', "h'"]);
			const slant = marks.find((mark) => mark.label === "h'");
			// Settled, the solid turns by 0.6 rad about y: the face's foot must then point towards the viewer (+z).
			const [x, , z] = slant?.to ?? [0, 0, 0];
			expect(-x * Math.sin(-0.6) + z * Math.cos(-0.6)).toBeGreaterThan(0);
		}
	});

	it('splits a cube into three equal pyramids with one apex that fill it', () => {
		const side = 1.6;
		const pieces = cubePyramids(side);
		expect(pieces).toHaveLength(3);
		const volume = ({apex, base, normal}: (typeof pieces)[number]) => {
			// A square base of side s, and the apex's distance from the base's plane along its normal.
			const height = Math.abs((apex[0] - base[0][0]) * normal[0] + (apex[1] - base[0][1]) * normal[1] + (apex[2] - base[0][2]) * normal[2]);
			const edge = Math.hypot(base[1][0] - base[0][0], base[1][1] - base[0][1], base[1][2] - base[0][2]);
			return (edge * edge * height) / 3;
		};
		for (const piece of pieces) {
			expect(volume(piece)).toBeCloseTo(side ** 3 / 3, 9);
			// The apex is not on the base: every base corner lies on the face the normal points out of.
			const along = (point: readonly number[]) => point[0] * piece.normal[0] + point[1] * piece.normal[1] + point[2] * piece.normal[2];
			for (const corner of piece.base) expect(along(corner)).toBeCloseTo(along(piece.base[0]), 9);
			expect(along(piece.apex)).toBeLessThan(along(piece.base[0]));
		}
		expect(pieces.reduce((sum, piece) => sum + volume(piece), 0)).toBeCloseTo(side ** 3, 9);
		expect(new Set(pieces.map((piece) => piece.normal.join()))).toHaveProperty('size', 3);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'cube', split: true}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'cuboid', split: true}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'cube', split: true, unfold: true}).success).toBe(false);
	});

	it('sweeps a cylinder, a cone and a sphere with a turning profile: the areas of the solids of revolution', () => {
		const area = (faces: number[][][]) =>
			faces.reduce((sum, face) => {
				// A flat polygon's area: half the length of the sum of its corners' cross products.
				const total = [0, 0, 0];
				face.forEach((p, k) => {
					const q = face[(k + 1) % face.length];
					total[0] += p[1] * q[2] - p[2] * q[1];
					total[1] += p[2] * q[0] - p[0] * q[2];
					total[2] += p[0] * q[1] - p[1] * q[0];
				});
				return sum + Math.hypot(...total) / 2;
			}, 0);
		const [r, h] = [3, 5];
		const side = revolvedFaces([[r, 0], [r, h]], 0, 2 * Math.PI, 200);
		expect(area(side) / (2 * Math.PI * r * h)).toBeCloseTo(1, 3);
		const disc = revolvedFaces([[0, 0], [r, 0]], 0, 2 * Math.PI, 200);
		expect(area(disc) / (Math.PI * r * r)).toBeCloseTo(1, 3);
		// Half a turn sweeps half the side; every point stays r from the axis.
		const half = revolvedFaces([[r, 0], [r, h]], 0, Math.PI, 200);
		expect(area(half) / (Math.PI * r * h)).toBeCloseTo(1, 3);
		for (const face of half) for (const [x, , z] of face) expect(Math.hypot(x, z)).toBeCloseTo(r, 9);
		// The cone's side is πrℓ.
		const cone = revolvedFaces([[r, 0], [0, 4]], 0, 2 * Math.PI, 400);
		expect(area(cone) / (Math.PI * r * 5)).toBeCloseTo(1, 3);
		// The profiles: the cylinder centred on its middle, the cone on its base, the sphere a half disc of radius 1.
		const [axisLow, rimLow, rimHigh] = sweepProfile({shape: 'cylinder', size: [3, 5]}) ?? [];
		expect(axisLow[0]).toBe(0);
		expect(rimLow[1]).toBeCloseTo(-rimHigh[1], 9);
		expect(rimLow[0] / (rimHigh[1] - rimLow[1])).toBeCloseTo(3 / 5, 9);
		const sphere = sweepProfile({shape: 'sphere', size: undefined}) ?? [];
		for (const [x, y] of sphere) expect(Math.hypot(x, y - 1)).toBeCloseTo(1, 9);
		expect(sweepProfile({shape: 'cube', size: undefined})).toBeNull();
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'cone', sweep: true}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'cuboid', sweep: true}).success).toBe(false);
	});

	it('writes the axis and the profile measures while the profile sweeps, riding on the profile', () => {
		const profile = sweepProfile({shape: 'cylinder', size: [3, 5]}) ?? [];
		const start = sweepMarks({shape: 'cylinder', dimensions: ['r', 'h']}, profile, 0);
		const later = sweepMarks({shape: 'cylinder', dimensions: ['r', 'h']}, profile, Math.PI / 2);
		expect(start.map((mark) => mark.label)).toEqual(['eksen', 'r', 'h']);
		// The axis stays; the r and h labels turn with the profile.
		expect(later[0].from).toEqual(start[0].from);
		expect(later[1].at[0]).toBeCloseTo(0, 9);
		expect(start[1].at[2]).toBeCloseTo(0, 9);
	});

	it('wraps a half cylinder: the cut rectangle, half the side and two half discs', () => {
		const [r, l] = [3, 20];
		const {curved, flat} = halfCylinderFaces(r, l, 400);
		const area = (faces: number[][][]) =>
			faces.reduce((sum, face) => {
				const total = [0, 0, 0];
				face.forEach((p, k) => {
					const q = face[(k + 1) % face.length];
					total[0] += p[1] * q[2] - p[2] * q[1];
					total[1] += p[2] * q[0] - p[0] * q[2];
					total[2] += p[0] * q[1] - p[1] * q[0];
				});
				return sum + Math.hypot(...total) / 2;
			}, 0);
		expect(area(curved) / (Math.PI * r * l)).toBeCloseTo(1, 3);
		expect(area(flat) / (2 * r * l + Math.PI * r * r)).toBeCloseTo(1, 3);
		for (const face of curved) for (const [, y, z] of face) expect(Math.hypot(y, z)).toBeCloseTo(r, 9);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'halfCylinder', dimensions: ['r', 'l'], size: [3, 20]}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'solid', shape: 'halfCylinder', unfold: true}).success).toBe(false);
	});
});
