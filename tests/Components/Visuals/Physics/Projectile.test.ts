import {describe, expect, it} from 'vitest';
import {projectilePath} from '../../../../src/Components/Visuals/Physics/Projectile';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const throwOf = (input: object) => {
	const parsed = CourseVisualSchema.parse({kind: 'projectile', ...input});
	if (parsed.kind !== 'projectile') throw new Error('expected a projectile');
	return projectilePath(parsed);
};

describe('projectile visual', () => {
	it('throws at 53°: vx = 6, vy = 8, 1.6 s in the air, 3.2 m high, 9.6 m far', () => {
		const path = throwOf({v0: 10, angle: 53.13010235415598});
		expect(path.vx).toBeCloseTo(6, 6);
		expect(path.vy).toBeCloseTo(8, 6);
		expect(path.flight).toBeCloseTo(1.6, 6);
		expect(path.top).toBeCloseTo(3.2, 6);
		expect(path.range).toBeCloseTo(9.6, 6);
	});

	it('throws horizontally from a height: the fall time depends only on the height', () => {
		const slow = throwOf({v0: 2, height: 20});
		const fast = throwOf({v0: 8, height: 20});
		expect(slow.flight).toBeCloseTo(2, 6);
		expect(fast.flight).toBeCloseTo(2, 6);
		expect(fast.range).toBeCloseTo(16, 6);
		expect(slow.top).toBe(20);
	});

	it('refuses a throw from the ground that does not go up', () => {
		expect(() => throwOf({v0: 5, angle: 0})).toThrow();
		expect(throwOf({v0: 10, angle: 90}).range).toBeCloseTo(0, 6);
	});
});
