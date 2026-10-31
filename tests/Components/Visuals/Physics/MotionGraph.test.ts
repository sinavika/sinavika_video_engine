import {describe, expect, it} from 'vitest';
import {kinematicsState} from '../../../../src/Components/Visuals/Physics/MotionGraph';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('kinematics visual', () => {
	// From rest: 2 m/s² for 5 s, then 10 m/s for 5 s, then −2 m/s² until it stops.
	const car = {x0: 0, v0: 0, phases: [{duration: 5, a: 2}, {duration: 5, a: 0}, {duration: 5, a: -2}]};

	it('runs phase after phase: x = x₀ + v₀t + ½at², v = v₀ + at', () => {
		expect(kinematicsState(car, 5)).toEqual({x: 25, v: 10, a: 2});
		expect(kinematicsState(car, 10)).toEqual({x: 75, v: 10, a: 0});
		expect(kinematicsState(car, 15)).toEqual({x: 100, v: 0, a: -2});
		// The area under v-t is the displacement: a trapezoid of 10 m/s over 15 s with 5 s ramps.
		expect(kinematicsState(car, 15).x).toBe(((15 + 5) / 2) * 10);
	});

	it('keeps the last state after the phases end and starts from x₀, v₀', () => {
		expect(kinematicsState(car, 20)).toEqual({x: 100, v: 0, a: -2});
		expect(kinematicsState({x0: 10, v0: -4, phases: [{duration: 2, a: 2}]}, 2)).toEqual({x: 6, v: 0, a: 2});
	});

	it('starts a phase at its own velocity: a broken-line x-t graph', () => {
		const walker = {x0: 0, v0: 5, phases: [{duration: 4, a: 0}, {duration: 2, a: 0, v: 0}, {duration: 4, a: 0, v: -5}]};
		expect(kinematicsState(walker, 4).x).toBe(20);
		expect(kinematicsState(walker, 6)).toEqual({x: 20, v: 0, a: 0});
		expect(kinematicsState(walker, 10)).toEqual({x: 0, v: -5, a: 0});
	});

	it('refuses two bodies that run for different times', () => {
		const figure = (bodies: object[]) => CourseVisualSchema.parse({kind: 'kinematics', bodies});
		expect(() => figure([{label: 'K', phases: [{duration: 4, a: 1}]}, {label: 'L', phases: [{duration: 5, a: 1}]}])).toThrow();
		expect(figure([{label: 'K', phases: [{duration: 4, a: 1}]}, {label: 'L', phases: [{duration: 2, a: 1}, {duration: 2, a: 0}]}]).kind).toBe('kinematics');
	});
});
