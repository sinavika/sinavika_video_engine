import {describe, expect, it} from 'vitest';
import {cellAt} from '../../../../src/Components/Visuals/Biology/Circulation';

describe('circulation visual', () => {
	it('sends the marked red cell round the body and the lungs and back to where it started', () => {
		const start = cellAt(0);
		const end = cellAt(0.9999);
		expect(Math.hypot(start.point.x - end.point.x, start.point.y - end.point.y)).toBeLessThan(5);
		expect(cellAt(1).point).toEqual(cellAt(0).point);
	});

	it('carries oxygen-poor blood to the lungs and oxygen-rich blood away from them', () => {
		// Sampled along the trip: poor first (body → right heart → lungs), then rich (lungs → left heart → body).
		const oxygen = Array.from({length: 40}, (_, index) => cellAt(index / 40).oxygen);
		const firstRich = oxygen.indexOf(true);
		expect(firstRich).toBeGreaterThan(5);
		expect(oxygen.slice(0, firstRich).every((rich) => !rich)).toBe(true);
		const lastRich = oxygen.lastIndexOf(true);
		expect(oxygen.slice(firstRich, lastRich + 1).every((rich) => rich)).toBe(true);
	});
});
