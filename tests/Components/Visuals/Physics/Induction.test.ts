import {describe, expect, it} from 'vitest';
import {inducedCurrent} from '../../../../src/Components/Visuals/Physics/Induction';

describe('induction visual', () => {
	it('opposes the change (Lenz): one way in, none at rest, the other way out', () => {
		expect([0, 1, 2].map((stage) => inducedCurrent('N', stage as 0 | 1 | 2))).toEqual([1, 0, -1]);
	});

	it('reverses everything for an S pole', () => {
		expect([0, 1, 2].map((stage) => inducedCurrent('S', stage as 0 | 1 | 2))).toEqual([-1, 0, 1]);
	});
});
