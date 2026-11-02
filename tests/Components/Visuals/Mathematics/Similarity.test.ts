import {describe, expect, it} from 'vitest';
import {areaCentre, blendShape, shapesSimilar} from '../../../../src/Components/Visuals/Mathematics/Similarity';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

type Point = [number, number];
const close = (a: Point[], b: Point[]) => a.forEach(([x, y], index) => {
	expect(x).toBeCloseTo(b[index][0], 6);
	expect(y).toBeCloseTo(b[index][1], 6);
});
const side = (shape: Point[], i: number, j: number) => Math.hypot(shape[j][0] - shape[i][0], shape[j][1] - shape[i][1]);

describe('similar shapes', () => {
	const abc: Point[] = [[0, 0], [4, 0], [1, 3]];
	// The same triangle turned 90° about the origin, doubled and moved.
	const turned: Point[] = abc.map(([x, y]) => [10 - 2 * y, 5 + 2 * x]);
	// Its mirror image (a flip over the y axis), same size.
	const mirror: Point[] = abc.map(([x, y]) => [-x, y]);

	it('knows similar shapes corner by corner', () => {
		expect(shapesSimilar(abc, turned)).toBe(true);
		expect(shapesSimilar(abc, mirror)).toBe(true);
		// The same corners in another order are a different correspondence.
		expect(shapesSimilar(abc, [turned[1], turned[0], turned[2]])).toBe(false);
		expect(shapesSimilar(abc, [[0, 0], [4, 0], [1, 4]])).toBe(false);
		expect(shapesSimilar(abc, [[0, 0], [4, 0]])).toBe(false);
	});

	it('lays one shape on the other: slides, turns the short way and grows, staying similar', () => {
		close(blendShape(abc, turned, 0), abc);
		close(blendShape(abc, turned, 1), turned);
		const half = blendShape(abc, turned, 0.5);
		expect(shapesSimilar(abc, half)).toBe(true);
		// Halfway: √2 times as large (the geometric middle of 1 and 2), turned 45°.
		expect(side(half, 0, 1) / side(abc, 0, 1)).toBeCloseTo(Math.SQRT2, 6);
		const direction = Math.atan2(half[1][1] - half[0][1], half[1][0] - half[0][0]);
		expect(direction).toBeCloseTo(Math.PI / 4, 6);
		// A congruent copy moved without turning only slides.
		const moved: Point[] = abc.map(([x, y]) => [x + 6, y - 2]);
		close(blendShape(abc, moved, 0.5), abc.map(([x, y]) => [x + 3, y - 1]));
	});

	it('turns a mirror image over like a card: each corner moves straight', () => {
		close(blendShape(abc, mirror, 0.5), abc.map(([, y]) => [0, y]));
		close(blendShape(abc, mirror, 1), mirror);
	});

	it('puts the name of a shape at the centre of its area', () => {
		// A triangle: the average of its corners.
		const [x, y] = areaCentre([[0, 0], [6, 0], [0, 3]]);
		expect(x).toBeCloseTo(2);
		expect(y).toBeCloseTo(1);
		// A trapezoid's area centre sits nearer its long side than the average of its corners does.
		const trapezoid: Point[] = [[0, 0], [10, 0], [6, 4], [4, 4]];
		expect(areaCentre(trapezoid)[1]).toBeLessThan(2);
		expect(areaCentre(trapezoid)[0]).toBeCloseTo(5);
		// Corners on one line have no area: the average of the corners.
		expect(areaCentre([[0, 0], [2, 0], [4, 0]])).toEqual([2, 0]);
	});

	it('names and shades regions of a geometry figure', () => {
		const regions = {kind: 'geometry', view: [0, 0, 4, 4], points: [{id: 'A', at: [0, 0]}, {id: 'B', at: [4, 0]}, {id: 'C', at: [0, 4]}]};
		const parsed = CourseVisualSchema.parse({...regions, polygons: [{points: ['A', 'B', 'C'], label: 'S', shade: 2}]});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.polygons[0]).toMatchObject({label: 'S', shade: 2});
		expect(CourseVisualSchema.safeParse({...regions, polygons: [{points: ['A', 'B', 'C'], shade: 4}]}).success).toBe(false);
	});

	it('lets a geometry figure copy only a similar shape', () => {
		const figure = {
			kind: 'geometry',
			view: [-1, -1, 12, 12],
			points: [
				{id: 'A', at: [0, 0]}, {id: 'B', at: [4, 0]}, {id: 'C', at: [1, 3]},
				{id: 'D', at: [10, 5]}, {id: 'E', at: [10, 13]}, {id: 'F', at: [4, 7]}, {id: 'G', at: [4, 8]},
			],
		};
		expect(CourseVisualSchema.safeParse({...figure, polygons: [{points: ['A', 'B', 'C'], id: 'abc'}, {points: ['D', 'E', 'F'], copyOf: 'abc'}]}).success).toBe(true);
		const wrong = CourseVisualSchema.safeParse({...figure, polygons: [{points: ['A', 'B', 'C'], id: 'abc'}, {points: ['D', 'E', 'G'], copyOf: 'abc'}]});
		expect(wrong.success).toBe(false);
		expect(JSON.stringify(wrong.error?.issues)).toContain('not similar');
		expect(CourseVisualSchema.safeParse({...figure, polygons: [{points: ['D', 'E', 'F'], copyOf: 'abc'}]}).success).toBe(false);
	});
});
