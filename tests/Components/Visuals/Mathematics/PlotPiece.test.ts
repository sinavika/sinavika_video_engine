import {describe, expect, it} from 'vitest';
import {curveTones, unitTicks} from '../../../../src/Components/Visuals/Mathematics/Plot';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('plot: piecewise functions, open points and whole-number ticks', () => {
	it('draws the pieces of one function in its colour', () => {
		expect(curveTones([{}, {}, {}])).toEqual([0, 1, 2]);
		// f(x) in two pieces and g(x): f's pieces share the first colour.
		expect(curveTones([{}, {piece: true}, {}])).toEqual([0, 0, 1]);
		expect(curveTones([{}, {piece: true}, {piece: true}])).toEqual([0, 0, 0]);
		// A first curve has nothing to continue.
		expect(curveTones([{piece: true}, {}])).toEqual([0, 1]);
	});

	it('marks a removable gap with an open point on an unbroken curve', () => {
		const plot = CourseVisualSchema.parse({kind: 'plot', x: [-1, 5], y: [-1, 6], curves: [{expression: 'x + 1'}], points: [{x: 2, y: 3, style: 'open'}, {x: 2, y: 1}]});
		if (plot.kind !== 'plot') throw new Error('plot');
		expect(plot.points.map((point) => point.style)).toEqual(['open', 'closed']);
		expect(plot.curves[0].piece).toBe(false);
	});

	it('numbers every whole x where each number has room, and leaves wide ranges to round steps', () => {
		const room = () => 40;
		// x from −1 to 8 on 700 pixels: 78 a unit, every number fits.
		expect(unitTicks([-1, 8], 78, room)).toEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
		// Too little room a unit, or too wide a range: d3's steps.
		expect(unitTicks([-1, 8], 30, room)).toBeUndefined();
		expect(unitTicks([0, 40], 100, room)).toBeUndefined();
		// No whole number inside.
		expect(unitTicks([0.2, 0.8], 500, room)).toBeUndefined();
	});
});
