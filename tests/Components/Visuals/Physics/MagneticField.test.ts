import {describe, expect, it} from 'vitest';
import {magneticForce, wireCirculation} from '../../../../src/Components/Visuals/Physics/MagneticField';

describe('magnetic field visual', () => {
	it('follows F = q v × B: a positive charge moving right in a field into the page is pushed up', () => {
		expect(magneticForce([1, 0], 'in', 1)).toEqual([0, 1]);
		// Out of the page, or a negative charge: down.
		expect(magneticForce([1, 0], 'out', 1)).toEqual([0, -1]);
		expect(magneticForce([1, 0], 'in', -1)).toEqual([0, -1]);
		// A current upwards in a field into the page is pushed to the left.
		expect(magneticForce([0, 1], 'in', 1)).toEqual([-1, 0]);
	});

	it('circles anticlockwise around a current coming out of the page', () => {
		expect(wireCirculation('out')).toBe(1);
		expect(wireCirculation('in')).toBe(-1);
	});
});
