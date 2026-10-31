import {describe, expect, it} from 'vitest';
import {leverBalance} from '../../../../src/Components/Visuals/Physics/Lever';
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
