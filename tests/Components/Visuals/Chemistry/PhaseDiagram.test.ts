import {describe, expect, it} from 'vitest';
import {pathCrossings, phaseAt} from '../../../../src/Components/Visuals/Chemistry/PhaseDiagram';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('Phase diagram visual', () => {
	it('places the four regions where they belong', () => {
		expect(phaseAt('water', 0.1, 0.8)).toBe('solid');
		expect(phaseAt('water', 0.6, 0.9)).toBe('liquid');
		expect(phaseAt('water', 0.6, 0.2)).toBe('vapour');
		expect(phaseAt('water', 0.9, 0.5)).toBe('gas');
	});

	it('melts and boils water along an isobar above the triple point, sublimes CO₂ below it', () => {
		const water = pathCrossings('water', 'isobar', 0.5);
		expect(water).toHaveLength(2);
		expect(phaseAt('water', (water[0] + water[1]) / 2, 0.5)).toBe('liquid');
		expect(pathCrossings('co2', 'isobar', 0.18)).toHaveLength(1);
	});

	it('melts ice under pressure, but not solid CO₂', () => {
		// Just below the triple-point temperature: vapour, then solid, then (water only) liquid as the pressure rises.
		expect(pathCrossings('water', 'isotherm', 0.3)).toHaveLength(2);
		expect(phaseAt('water', 0.3, 0.95)).toBe('liquid');
		expect(pathCrossings('co2', 'isotherm', 0.3)).toHaveLength(1);
		expect(phaseAt('co2', 0.3, 0.95)).toBe('solid');
	});

	it('takes a path inside the diagram only', () => {
		expect(CourseVisualSchema.safeParse({kind: 'phaseDiagram', path: {kind: 'isobar', at: 0.5, label: '1 atm'}}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'phaseDiagram', path: {kind: 'isobar', at: 1.2}}).success).toBe(false);
	});
});
