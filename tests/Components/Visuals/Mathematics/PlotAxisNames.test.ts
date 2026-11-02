import {describe, expect, it} from 'vitest';
import {areaLabelSpot, axisNamePlaces, firstClearBox, parameterStates, plotShapes, slopeLabelSpot} from '../../../../src/Components/Visuals/Mathematics/Plot';
import {parseExpression} from '../../../../src/Components/Visuals/Mathematics/PlotExpression';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const area = {left: 100, right: 1100, top: 50, bottom: 650};
const name = {width: 80, height: 30};
/** A straight line across the box, every 5 px, in screen pixels. */
const line = (from: [number, number], to: [number, number]) => {
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
	return Array.from({length: Math.floor(length / 5) + 1}, (_, index) => [from[0] + ((to[0] - from[0]) * index * 5) / length, from[1] + ((to[1] - from[1]) * index * 5) / length] as [number, number]);
};

describe('plot: the axes keep their names clear of the curves', () => {
	it('keeps the usual places when no line passes there', () => {
		const places = axisNamePlaces({area, axisX: area.left, axisY: area.bottom, yName: name, xName: name, lines: line([300, 600], [900, 300]), gap: 14, below: 52});
		expect(places.y).toEqual({box: [114, 50, 194, 80], outside: false});
		expect(places.x).toEqual({box: [1020, 606, 1100, 636], outside: false});
	});

	it('moves a name out of the box, to the end of its axis, when a curve runs through its place', () => {
		// A demand curve from the top left to the bottom right corner crossed "fiyat" and "miktar" (KPSS VAT 8).
		const places = axisNamePlaces({area, axisX: area.left, axisY: area.bottom, yName: name, xName: name, lines: line([100, 50], [1100, 650]), gap: 14, below: 52});
		expect(places.y?.outside).toBe(true);
		expect(places.x?.outside).toBe(true);
		// Above the y axis's top, and under the x axis's numbers at its right end: no curve is drawn there.
		expect(places.y!.box[3]).toBeLessThan(area.top);
		expect(places.x!.box[1]).toBeGreaterThan(area.bottom);
		expect(places.x!.box[2]).toBe(area.right);
	});

	it('tries the other side of an axis that runs through the middle before leaving the box', () => {
		// y = x² through the origin in the middle: the right of the y axis's top is taken, the left is free.
		const parabola = Array.from({length: 200}, (_, index) => {
			const t = -1 + (2 * index) / 199;
			return [600 + t * 120, 650 - 600 * t * t + 0] as [number, number];
		}).filter(([, py]) => py >= 50);
		const middle = axisNamePlaces({area, axisX: 600, axisY: 350, yName: name, xName: name, lines: [...parabola, ...line([614, 50], [700, 120])], gap: 14, below: 52});
		expect(middle.y?.outside).toBe(false);
		expect(middle.y!.box[2]).toBeLessThan(600);
		// The x name goes under the axis when a line runs above it at the right end.
		const under = axisNamePlaces({area, axisX: 600, axisY: 350, xName: name, lines: line([1000, 320], [1100, 325]), gap: 14, below: 52});
		expect(under.x?.outside).toBe(false);
		expect(under.x!.box[1]).toBeGreaterThan(350);
	});

	it('keeps a first look\'s choice once room is made for the name outside', () => {
		const places = axisNamePlaces({area, axisX: area.left, axisY: area.bottom, yName: name, lines: [], gap: 14, below: 52, forceOutside: {y: true}});
		expect(places.y?.outside).toBe(true);
		expect(axisNamePlaces({area, axisX: area.left, axisY: area.bottom, lines: [], gap: 14, below: 52})).toEqual({});
	});

	it('looks at every shape a moving curve takes, and the way between', () => {
		const states = parameterStates({a: {from: 0}}, [{params: {a: 2}}, {}, {params: {a: 4}}]);
		expect(states).toEqual([{a: 0}, {a: 2}, {a: 4}, {a: 1}, {a: 3}]);
		// A sweep without beats: its start, its end and the middle.
		expect(parameterStates({k: {from: 1, to: 3}}, [])).toEqual([{k: 1}, {k: 3}, {k: 2}]);
		// A beat may only move coefficients the graph has.
		expect(parameterStates({a: {from: 0}}, [{params: {b: 5}}])).toEqual([{a: 0}]);
		expect(parameterStates({}, [])).toEqual([{}]);
	});

	it('finds the drawn places of curves in all their shapes, bars, segments and points', () => {
		const visual = CourseVisualSchema.parse({kind: 'plot', x: [0, 10], y: [0, 12], curves: [{expression: '8 - 0.6*x + a', trace: true}], parameters: {a: {from: 0}}, points: [{x: 5, y: 5}], segments: [{from: [0, 1], to: [2, 1]}]});
		if (visual.kind !== 'plot') throw new Error('not a plot');
		const evaluate = parseExpression(visual.curves[0].expression, ['x', 'a']);
		const shapes = plotShapes(visual, [evaluate], [{a: 0}, {a: 1.2}]);
		expect(shapes).toContainEqual([0, 8]);
		expect(shapes.some(([px, py]) => px === 0 && Math.abs(py - 9.2) < 1e-9)).toBe(true);
		expect(shapes).toContainEqual([5, 5]);
		expect(shapes).toContainEqual([1, 1]);
		const bars = CourseVisualSchema.parse({kind: 'plot', x: [0, 4], y: [0, 10], series: {kind: 'bars', values: [{x: 1, y: 9}, {x: 3, y: 2}]}});
		if (bars.kind !== 'plot') throw new Error('not a plot');
		// A tall first bar reaches the top left corner where the y name would stand.
		expect(plotShapes(bars, [], [{}]).some(([px, py]) => px < 1 && py === 9)).toBe(true);
	});
});

describe('plot: the slope of a tangent is written inside the box, off the line', () => {
	const box = {left: 100, top: 50, right: 1100, bottom: 650};
	const text = {width: 160, size: 30};
	it('goes below right of a rising tangent, above left when that leaves the box', () => {
		expect(slopeLabelSpot([500, 300], 1, text, box, 1)).toEqual([520, 346]);
		// Near the x axis (Faraday, the flux at t = 0.5) the value went under the axis; now it goes above left.
		expect(slopeLabelSpot([500, 630], 0.25, text, box, 1)).toEqual([320, 604]);
	});

	it('goes above right of a falling tangent, below left at the top edge', () => {
		expect(slopeLabelSpot([500, 300], -2, text, box, 1)).toEqual([520, 274]);
		expect(slopeLabelSpot([500, 60], -2, text, box, 1)).toEqual([320, 106]);
	});

	it('passes over a side a curve runs through', () => {
		// At the top of x³ − 3x the tangent is level and the curve falls away to the right, under the point.
		const falling = Array.from({length: 40}, (_, index) => [500 + index * 5, 300 + index * index * 0.2] as [number, number]);
		expect(slopeLabelSpot([500, 300], 0, text, box, 1, falling)).toEqual([520, 274]);
		const rightBoth = [...falling, ...Array.from({length: 40}, (_, index) => [500 + index * 5, 300 - index * 1.2] as [number, number])];
		expect(slopeLabelSpot([500, 300], 0, text, box, 1, rightBoth)).toEqual([320, 346]);
	});

	it('goes farther above a gently rising tangent in the bottom left corner', () => {
		// Faraday: the point near the corner, the tangent rising slowly to the right through the near place above.
		const tangent = Array.from({length: 60}, (_, index) => [110 + index * 4, 620 - index * 0.8] as [number, number]);
		expect(slopeLabelSpot([130, 616], 0.25, text, box, 1, tangent)).toEqual([150, 546]);
	});

	it('is pulled inside when neither side fits', () => {
		const [lx, ly] = slopeLabelSpot([105, 645], 1, text, box, 1);
		expect(lx).toBeGreaterThanOrEqual(106);
		expect(ly).toBeLessThanOrEqual(650 - 6 - 30 * 0.25);
	});
});

describe('plot: the area value and the coefficients stand clear of the curves', () => {
	const box = {left: 100, top: 50, right: 1100, bottom: 650};
	const text = {width: 120, height: 30};
	it('writes the area just above the axis, or above the region when the curve crosses the axis there', () => {
		// A curve high above the middle: the place over the axis is free.
		expect(areaLabelSpot(600, 500, 200, 500, text, [[600, 200]], box, 18)).toEqual([600, 482]);
		// x(x − 2)(x − 4) crosses the axis right at the middle (AYT Matematik, İntegral): over the region's top instead.
		const crossing = Array.from({length: 41}, (_, index) => [580 + index, 400 + (index - 20) * 8] as [number, number]);
		expect(areaLabelSpot(600, 400, 160, 640, text, crossing, box, 18)).toEqual([600, 142]);
	});

	it('takes the first free corner for the coefficients, never one over a name or outside the box', () => {
		const corners: [number, number, number, number][] = [[110, 60, 250, 96], [950, 60, 1090, 96], [110, 600, 250, 636], [950, 600, 1090, 636]];
		const arm = Array.from({length: 30}, (_, index) => [120 + index * 4, 70 + index] as [number, number]);
		expect(firstClearBox(corners, arm, [], [100, 50, 1100, 650])).toEqual(corners[1]);
		expect(firstClearBox(corners, arm, [[1000, 70, 1100, 100]], [100, 50, 1100, 650])).toEqual(corners[2]);
		expect(firstClearBox([[90, 60, 200, 96]], [], [], [100, 50, 1100, 650])).toBeUndefined();
	});
});
