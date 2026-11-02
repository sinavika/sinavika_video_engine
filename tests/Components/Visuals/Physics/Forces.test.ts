import {describe, expect, it} from 'vitest';
import {angleBetween, bodyEdge} from '../../../../src/Components/Visuals/Physics/Forces';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('forces: arrows leave the body, angles between them', () => {
	it('finds the body edge an arrow crosses', () => {
		expect(bodyEdge('box', 50, 0, 0)).toBeCloseTo(50, 9);
		// Towards a corner the edge is further.
		expect(bodyEdge('box', 50, 45, 0)).toBeCloseTo(50 * Math.SQRT2, 9);
		// On a 30° incline the normal force (120°) leaves through the top face.
		expect(bodyEdge('box', 50, 120, 30)).toBeCloseTo(50, 9);
		expect(bodyEdge('ball', 50, 37, 0)).toBe(50);
	});

	it('measures the angle between two forces the shorter way round', () => {
		expect(angleBetween(0, 90)).toEqual({degrees: 90, middle: 45});
		expect(angleBetween(350, 10)).toEqual({degrees: 20, middle: 360});
		expect(angleBetween(90, -90).degrees).toBe(180);
		expect(angleBetween(120, 30)).toEqual({degrees: 90, middle: 75});
	});

	it('names an angle by two of its forces', () => {
		const parse = (angles: object[]) => CourseVisualSchema.safeParse({kind: 'forces', forces: [{label: 'F₁', angle: 0}, {label: 'F₂', angle: 60}], angles});
		expect(parse([{between: [1, 2]}]).success).toBe(true);
		expect(parse([{between: [1, 2], label: 'θ'}]).success).toBe(true);
		expect(parse([{between: [1, 3]}]).success).toBe(false);
		expect(parse([{between: [2, 2]}]).success).toBe(false);
	});
});

describe('vectors: named points', () => {
	it('takes a point a torque is taken about, and none by default', () => {
		const base = {kind: 'vectors', view: [0, 0, 6, 4], vectors: [{from: [1, 1], to: [4, 1], label: 'F'}]};
		const plain = CourseVisualSchema.parse(base);
		expect(plain.kind === 'vectors' && plain.points).toEqual([]);
		const withPoint = CourseVisualSchema.parse({...base, points: [{at: [1, 1], label: 'O'}]});
		expect(withPoint.kind === 'vectors' && withPoint.points).toEqual([{at: [1, 1], label: 'O'}]);
	});
});
