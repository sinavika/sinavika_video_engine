import {describe, expect, it} from 'vitest';
import {mapLabelWidth, routeObstacles} from '../../../../src/Components/Visuals/Humanities/Map';

describe('map labels', () => {
	it('sizes a pill to its text: capitals wider than small letters, spaces thinnest', () => {
		expect(mapLabelWidth('KONYA')).toBeGreaterThan(mapLabelWidth('konya'));
		expect(mapLabelWidth('a b')).toBeLessThan(mapLabelWidth('abc'));
		// About 0.55 em per letter for ordinary Turkish names, not the old 0.7.
		expect(mapLabelWidth('Konya: Mevlana')).toBeLessThan(18 * 14 + 28);
	});

	it('reserves room along a route and round its arrowhead so no name covers them', () => {
		const point = (at: readonly [number, number]) => [at[0] * 10, at[1] * 10];
		const boxes = routeObstacles([{points: [[0, 0], [20, 0]], arrow: true}], point, 1);
		// Boxes every 24 px along the 200 px line, then one round the arrowhead.
		expect(boxes.length).toBeGreaterThanOrEqual(10);
		const head = boxes[boxes.length - 1];
		expect(head.left).toBeLessThan(200);
		expect(head.right).toBeGreaterThan(200);
		expect(head.right - head.left).toBeGreaterThan(40);
		expect(routeObstacles([{points: [[0, 0], [20, 0]], arrow: false}], point, 1).length).toBe(boxes.length - 1);
	});
});
