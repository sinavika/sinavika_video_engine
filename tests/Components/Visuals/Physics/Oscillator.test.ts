import {describe, expect, it} from 'vitest';
import {harmonicState} from '../../../../src/Components/Visuals/Physics/Oscillator';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('oscillator visual', () => {
	it('starts at rest at +A, passes the middle at full speed a quarter period later, and repeats', () => {
		const start = harmonicState(0, 4);
		expect(start.x).toBeCloseTo(1, 9);
		expect(start.v).toBeCloseTo(0, 9);
		const middle = harmonicState(1, 4);
		expect(middle.x).toBeCloseTo(0, 9);
		expect(Math.abs(middle.v)).toBeCloseTo(1, 9);
		expect(harmonicState(4, 4).x).toBeCloseTo(1, 9);
	});

	it('pulls back towards the middle (a = −x) and keeps the total energy', () => {
		for (const time of [0.3, 1.7, 2.9, 3.6]) {
			const state = harmonicState(time, 4);
			expect(state.a).toBeCloseTo(-state.x, 9);
			expect(state.kinetic + state.potential).toBeCloseTo(1, 9);
		}
	});

	it('refuses the reference circle and the trace together, and both on a pendulum', () => {
		expect(CourseVisualSchema.safeParse({kind: 'oscillator', reference: true, trace: true}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'oscillator', mode: 'pendulum', trace: true}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'oscillator', mode: 'pendulum', energy: true}).success).toBe(true);
	});
});
