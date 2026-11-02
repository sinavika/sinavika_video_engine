import {describe, expect, it} from 'vitest';
import {tankBodyPlace, vesselHalfWidth} from '../../../../src/Components/Visuals/Physics/Tank';

describe('tank: bodies fit their vessel', () => {
	it('shares the vessel among its bodies, all inside its walls', () => {
		const slot = 900;
		const wall = 6;
		const half = vesselHalfWidth('straight', 0) * slot;
		const places = [0, 1, 2].map((order) => tankBodyPlace('straight', 0.8, slot, 0, order, 3, 1.6, wall, 400, 1));
		for (const {x, side} of places) {
			expect(x).toBeGreaterThanOrEqual(slot / 2 - half);
			expect(x + side).toBeLessThanOrEqual(slot / 2 + half);
		}
		// Side by side, never over each other.
		expect(places[0].x + places[0].side).toBeLessThan(places[1].x);
		expect(places[1].x + places[1].side).toBeLessThan(places[2].x);
	});

	it('draws a lone body larger than the old fixed size, and a sunk one no deeper than the liquid', () => {
		const lone = tankBodyPlace('straight', 0.8, 900, 0, 0, 1, 1, 6, 400, 1);
		expect(lone.side).toBeGreaterThan(900 * 0.15);
		expect(tankBodyPlace('straight', 0.8, 900, 0, 0, 1, 1.6, 6, 100, 1).side).toBeLessThanOrEqual(80);
		// A floating body may stand out of the liquid.
		expect(tankBodyPlace('straight', 0.8, 900, 0, 0, 1, 1, 6, 100, 0.5).side).toBeGreaterThan(80);
	});
});
