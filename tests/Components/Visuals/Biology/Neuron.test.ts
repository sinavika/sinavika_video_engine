import {describe, expect, it} from 'vitest';
import {actionPotential} from '../../../../src/Components/Visuals/Biology/Neuron';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('neuron visual', () => {
	it('draws an action potential: rest −70 mV, peak +30, an undershoot below rest, then rest again', () => {
		expect(actionPotential(-1)).toBe(-70);
		expect(actionPotential(0)).toBe(-70);
		expect(actionPotential(0.15)).toBeCloseTo(30, 6);
		expect(actionPotential(0.4)).toBeCloseTo(-80, 6);
		expect(actionPotential(2)).toBe(-70);
		// Depolarisation rises without a dip, repolarisation falls without a bump.
		const rise = [0.02, 0.05, 0.1, 0.14].map(actionPotential);
		expect(rise).toEqual([...rise].sort((a, b) => a - b));
		const fall = [0.16, 0.25, 0.35, 0.39].map(actionPotential);
		expect(fall).toEqual([...fall].sort((a, b) => b - a));
		// Hyperpolarisation: below rest on the way back.
		expect(actionPotential(0.5)).toBeLessThan(-70);
	});

	it('takes the three modes with their default labels', () => {
		expect(CourseVisualSchema.parse({kind: 'neuron'})).toMatchObject({mode: 'impulse', period: 5});
		expect(CourseVisualSchema.parse({kind: 'neuron', mode: 'synapse'})).toMatchObject({cleftLabel: 'Sinaptik boşluk'});
		expect(CourseVisualSchema.safeParse({kind: 'neuron', mode: 'reflex'}).success).toBe(false);
	});
});
