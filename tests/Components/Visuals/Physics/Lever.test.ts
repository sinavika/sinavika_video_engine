import {describe, expect, it} from 'vitest';
import {angleArc, forceLine, forceTone, leverBalance} from '../../../../src/Components/Visuals/Physics/Lever';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const lever = (input: object) => {
	const parsed = CourseVisualSchema.parse({kind: 'lever', ...input});
	if (parsed.kind !== 'lever') throw new Error('expected a lever');
	return parsed;
};

describe('lever visual', () => {
	it('stays level when the torques about the pivot cancel', () => {
		// 40 N two metres left of the pivot, 20 N four metres right: 80 each way.
		const result = leverBalance(lever({length: 8, pivot: 3, forces: [{at: 1, value: 40}, {at: 7, value: 20}]}));
		expect(result.torques).toEqual([80, -80]);
		expect(result.clockwise).toBe(80);
		expect(result.anticlockwise).toBe(80);
		expect(result.balanced).toBe(true);
		expect(result.tilt).toBe(0);
	});

	it('turns towards the side whose torque wins, a little more for a larger imbalance', () => {
		const small = leverBalance(lever({length: 8, pivot: 3, forces: [{at: 1, value: 40}, {at: 7, value: 25}]}));
		const large = leverBalance(lever({length: 8, pivot: 3, forces: [{at: 1, value: 40}, {at: 7, value: 60}]}));
		expect(small.net).toBe(-20);
		// Clockwise on screen is a positive angle.
		expect(small.tilt).toBeGreaterThan(0);
		expect(large.tilt).toBeGreaterThan(small.tilt);
		expect(large.tilt).toBeLessThanOrEqual(9);
		const anticlockwise = leverBalance(lever({length: 8, pivot: 3, forces: [{at: 0, value: 50}, {at: 6, value: 10}]}));
		expect(anticlockwise.tilt).toBeLessThan(0);
	});

	it('counts the rod weight at its middle and upward forces the other way', () => {
		// A 6 m rod on a pivot at 2 m: its 30 N weight 1 m right of the pivot (30 clockwise) is held by 15 N up at 4 m.
		const result = leverBalance(lever({length: 6, pivot: 2, weight: 30, forces: [{at: 4, value: 15, direction: 'up'}]}));
		expect(result.weightTorque).toBe(-30);
		expect(result.torques).toEqual([30]);
		expect(result.balanced).toBe(true);
	});

	it('sums and settles by default, and can show forces only as alternatives', () => {
		expect(lever({length: 4, pivot: 0, forces: [{at: 1, value: 20}]}).verdict).toBe(true);
		expect(lever({length: 4, pivot: 0, forces: [{at: 1, value: 20}], verdict: false}).verdict).toBe(false);
	});

	it('refuses a pivot or a force off the rod', () => {
		expect(() => lever({length: 4, pivot: 5, forces: [{at: 1, value: 10}]})).toThrow();
		expect(() => lever({length: 4, pivot: 2, forces: [{at: 6, value: 10}]})).toThrow();
	});
});

describe('lever: the arrows tell the turn only when the figure tells the torques', () => {
	it('draws every force in one colour without torques or a verdict, and by its turn with them', () => {
		expect(forceTone(30, false)).toBe('lesson');
		expect(forceTone(-30, false)).toBe('lesson');
		expect(forceTone(30, true)).toBe('brand');
		expect(forceTone(-30, true)).toBe('lesson');
	});
});

describe('lever: supports, angled forces and a rod that is not uniform', () => {
	it('counts only the part of a force across the rod', () => {
		// A rope at 30° to the rod 4 m from the pivot, pulling with 20 N: 20 · sin 30° · 4 = 40 anticlockwise.
		const result = leverBalance(lever({length: 4, pivot: 0, forces: [{at: 4, value: 20, direction: 'up', angle: 30, rope: true}]}));
		expect(result.torques[0]).toBeCloseTo(40, 9);
		// At 150° (leaning the other way) the same part crosses the rod.
		expect(leverBalance(lever({length: 4, pivot: 0, forces: [{at: 4, value: 20, direction: 'up', angle: 150}]})).torques[0]).toBeCloseTo(40, 9);
	});

	it('takes the rod weight where it acts', () => {
		const result = leverBalance(lever({length: 6, pivot: 0, weight: 30, weightAt: 1, forces: [{at: 6, value: 5, direction: 'up'}]}));
		expect(result.weightTorque).toBe(-30);
		expect(result.balanced).toBe(true);
	});

	it('draws an angled force along its line and marks the smaller angle with the rod', () => {
		// Up at 30°: up and to the right on screen (y grows downwards).
		const up = forceLine({angle: 30, direction: 'up'}, 0);
		expect(Math.cos(up)).toBeGreaterThan(0);
		expect(Math.sin(up)).toBeLessThan(0);
		// Without an angle a force is perpendicular, as before.
		expect(forceLine({direction: 'down'}, 0)).toBeCloseTo(Math.PI / 2, 9);
		// A rope at 150° leans to the rod's left end: the arc starts there and shows 30°.
		const arc = angleArc(150, forceLine({angle: 150, direction: 'up'}, 0), 0);
		expect(arc.degrees).toBe(30);
		expect(arc.from).toBeCloseTo(Math.PI, 9);
	});

	it('checks what holds the rod', () => {
		const parse = (input: object) => CourseVisualSchema.safeParse({kind: 'lever', length: 6, pivot: 0, forces: [{at: 6, value: 10}], ...input});
		expect(parse({}).success).toBe(true);
		expect(parse({support: 'two', supports: [1, 5]}).success).toBe(true);
		expect(parse({support: 'two'}).success).toBe(false);
		expect(parse({support: 'pivot', supports: [1, 5]}).success).toBe(false);
		expect(parse({support: 'two', supports: [1, 7]}).success).toBe(false);
		expect(parse({weightAt: 2}).success).toBe(false);
		expect(parse({weight: 10, weightAt: 7}).success).toBe(false);
		expect(parse({forces: [{at: 6, value: 10, load: true, rope: true}]}).success).toBe(false);
		expect(parse({support: 'none', pivotLabel: 'O'}).success).toBe(true);
	});
});
