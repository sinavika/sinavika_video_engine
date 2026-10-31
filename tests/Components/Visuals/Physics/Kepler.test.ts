import {describe, expect, it} from 'vitest';
import {orbitPosition, sweptArea} from '../../../../src/Components/Visuals/Physics/Kepler';

describe('kepler visual', () => {
	it('starts at the closest point and is farthest half a period later', () => {
		const [nx] = orbitPosition(0.5, 0);
		const [fx] = orbitPosition(0.5, 0.5);
		expect(nx).toBeCloseTo(0.5, 9); // a(1 − e) from the Sun
		expect(fx).toBeCloseTo(-1.5, 9); // a(1 + e)
	});

	it('sweeps equal areas in equal times (the second law)', () => {
		const nearSun = sweptArea(0.5, -0.04, 0.04);
		const farSun = sweptArea(0.5, 0.46, 0.54);
		expect(nearSun).toBeCloseTo(farSun, 3);
		// A whole orbit sweeps the ellipse: π a b.
		expect(sweptArea(0.5, 0, 1, 2000)).toBeCloseTo(Math.PI * Math.sqrt(1 - 0.25), 3);
	});
});
