import {describe, expect, it} from 'vitest';
import {collisionResult} from '../../../../src/Components/Visuals/Physics/Collision';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const collide = (input: object) => {
	const parsed = CourseVisualSchema.parse({kind: 'collision', ...input});
	if (parsed.kind !== 'collision') throw new Error('expected a collision');
	return {parsed, after: collisionResult(parsed)};
};

describe('collision visual', () => {
	it('swaps the velocities of equal carts in an elastic collision', () => {
		const {after} = collide({type: 'elastic', bodies: [{label: 'K', mass: 2, v: 3}, {label: 'L', mass: 2, v: -1}]});
		expect(after).toEqual([-1, 3]);
	});

	it('keeps momentum and kinetic energy when elastic, momentum only when they stick', () => {
		const bodies = [{label: 'K', mass: 1, v: 6}, {label: 'L', mass: 2, v: 0}];
		const elastic = collide({type: 'elastic', bodies}).after;
		expect(elastic[0]).toBeCloseTo(-2, 9);
		expect(elastic[1]).toBeCloseTo(4, 9);
		expect(1 * elastic[0] + 2 * elastic[1]).toBeCloseTo(6, 9);
		expect(0.5 * 1 * elastic[0] ** 2 + 0.5 * 2 * elastic[1] ** 2).toBeCloseTo(18, 9);
		expect(collide({type: 'inelastic', bodies}).after).toEqual([2, 2]);
	});

	it('refuses carts that never meet and an explosion that breaks momentum', () => {
		expect(() => collide({type: 'elastic', bodies: [{label: 'K', mass: 1, v: 1}, {label: 'L', mass: 1, v: 2}]})).toThrow();
		expect(() => collide({type: 'explosion', bodies: [{label: 'K', mass: 1, v: 0}, {label: 'L', mass: 2, v: 0}], after: [-2, 2]})).toThrow();
		expect(collide({type: 'explosion', bodies: [{label: 'K', mass: 1, v: 0}, {label: 'L', mass: 2, v: 0}], after: [-4, 2]}).after).toEqual([-4, 2]);
	});
});
