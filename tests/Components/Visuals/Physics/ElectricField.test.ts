import {describe, expect, it} from 'vitest';
import {fieldAt} from '../../../../src/Components/Visuals/Physics/ElectricField';

describe('electric field visual', () => {
	it('adds the fields and potentials of point charges (k = 1)', () => {
		// +q at x = 0, −q at x = 4: at the middle the fields add towards −q and the potentials cancel.
		const dipole = [{at: [0, 0] as [number, number], q: 1}, {at: [4, 0] as [number, number], q: -1}];
		const middle = fieldAt(dipole, [2, 0]);
		expect(middle.ex).toBeCloseTo(0.5, 9);
		expect(middle.ey).toBeCloseTo(0, 9);
		expect(middle.v).toBeCloseTo(0, 9);
	});

	it('gives V = kq/r and E = kq/r² for one charge', () => {
		const single = [{at: [0, 0] as [number, number], q: 2}];
		const point = fieldAt(single, [0, 2]);
		expect(point.v).toBeCloseTo(1, 9);
		expect(point.ey).toBeCloseTo(0.5, 9);
	});
});
