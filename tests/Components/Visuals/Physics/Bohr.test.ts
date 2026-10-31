import {describe, expect, it} from 'vitest';
import {hydrogenLevel, photonEnergy} from '../../../../src/Components/Visuals/Physics/Bohr';
import {decayTimes} from '../../../../src/Components/Visuals/Physics/HalfLife';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('atom and nucleus visuals', () => {
	it('gives hydrogen its levels and photon energies (E = −13.6/n² eV)', () => {
		expect(hydrogenLevel(1)).toBeCloseTo(-13.6, 9);
		expect(hydrogenLevel(2)).toBeCloseTo(-3.4, 9);
		expect(photonEnergy(2, 1)).toBeCloseTo(10.2, 9);
		expect(photonEnergy(3, 2)).toBeCloseTo(1.889, 3);
		expect(photonEnergy(1, 2)).toBeCloseTo(photonEnergy(2, 1), 9);
	});

	it('halves what is left in every half-life, at random-looking moments', () => {
		const times = decayTimes(64, 3);
		const leftAt = (t: number) => times.filter((time) => time > t).length;
		expect([leftAt(0), leftAt(1), leftAt(2), leftAt(3)]).toEqual([64, 32, 16, 8]);
		// Not in order: the first nuclei of the grid do not all go first.
		expect(times.slice(0, 8).every((time) => time < 1)).toBe(false);
	});

	it('refuses a jump past the orbits drawn', () => {
		expect(CourseVisualSchema.safeParse({kind: 'bohr', levels: 3, transitions: [{from: 4, to: 2}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'bohr', levels: 4, transitions: [{from: 4, to: 2}]}).success).toBe(true);
	});
});

describe('photoelectric visual', () => {
	it('frees electrons only above the threshold, with Ek = hf − W', async () => {
		const {maxKinetic} = await import('../../../../src/Components/Visuals/Physics/Photoelectric');
		expect(maxKinetic(0.8, 1)).toBe(0);
		expect(maxKinetic(1.8, 1)).toBeCloseTo(0.8, 9);
		// Same light on a metal with a higher threshold: less kinetic energy (the line moves right, slope unchanged).
		expect(maxKinetic(1.8, 1.5)).toBeLessThan(maxKinetic(1.8, 1));
	});
});
