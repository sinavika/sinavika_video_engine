import {describe, expect, it} from 'vitest';
import {dopplerWavelengths} from '../../../../src/Components/Visuals/Physics/Doppler';
import {pathDifference, slitIntensity} from '../../../../src/Components/Visuals/Physics/Interference';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('interference and Doppler visuals', () => {
	it('finds antinodes at whole path differences and nodes at half-odd ones', () => {
		// On the central line the paths are equal: a crest meets a crest.
		expect(pathDifference(3, [0, 2])).toEqual({difference: 0, kind: 'antinode'});
		// Between the sources, x = 0.25 λ from the middle: Δ = 0.5 λ, a node.
		expect(pathDifference(3, [0.25, 0]).kind).toBe('node');
		expect(pathDifference(3, [0.25, 0]).difference).toBeCloseTo(0.5, 9);
		// Beyond the right source on the line: Δ = separation = 3 λ, an antinode.
		expect(pathDifference(3, [4, 0]).kind).toBe('antinode');
	});

	it('spaces double-slit fringes evenly and makes the single-slit centre twice as wide', () => {
		expect(slitIntensity('double', 0)).toBe(1);
		expect(slitIntensity('double', 1)).toBeCloseTo(1, 9);
		expect(slitIntensity('double', 0.5)).toBeCloseTo(0, 9);
		expect(slitIntensity('single', 0)).toBe(1);
		expect(slitIntensity('single', 1)).toBeCloseTo(0, 9);
		expect(slitIntensity('single', 2)).toBeCloseTo(0, 9);
		// The first side maximum is far dimmer than the centre.
		expect(slitIntensity('single', 1.43)).toBeLessThan(0.05);
	});

	it('shortens the wavelength ahead of a moving source and stretches it behind', () => {
		expect(dopplerWavelengths(0)).toEqual({ahead: 1, behind: 1});
		expect(dopplerWavelengths(0.5)).toEqual({ahead: 0.5, behind: 1.5});
	});

	it('keeps points on the ripple tank only', () => {
		expect(CourseVisualSchema.safeParse({kind: 'interference', mode: 'double', points: [{label: 'A', x: 0, y: 1}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'interference', mode: 'ripple', points: [{label: 'A', x: 0, y: 1}]}).success).toBe(true);
	});
});
