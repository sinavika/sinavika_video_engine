import {describe, expect, it} from 'vitest';
import {circularSpeeds} from '../../../../src/Components/Visuals/Physics/Circular';

describe('circular motion visual', () => {
	it('turns a disk at one angular speed: the outer point is faster along its path', () => {
		expect(circularSpeeds('disk', 0.5)).toEqual({omega: 1, v: 0.5});
		expect(circularSpeeds('disk', 1).v).toBeGreaterThan(circularSpeeds('disk', 0.5).v);
	});

	it('runs inner orbits faster on both counts (ω ∝ r^−3/2, v ∝ r^−1/2)', () => {
		const inner = circularSpeeds('orbit', 0.25);
		expect(inner.omega).toBeCloseTo(8, 9);
		expect(inner.v).toBeCloseTo(2, 9);
	});
});
