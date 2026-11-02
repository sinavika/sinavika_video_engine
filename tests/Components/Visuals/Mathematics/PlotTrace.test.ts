import {describe, expect, it} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Growing, startValues, traceOpacity} from '../../../../src/Components/Visuals/Mathematics/Plot';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const market = (extra: Record<string, unknown> = {}) => ({
	kind: 'plot',
	x: [0, 10],
	y: [0, 10],
	curves: [{expression: '10 - x + a', label: 'Talep', trace: true}, {expression: 'x', label: 'Arz'}],
	parameters: {a: {from: 0}},
	...extra,
});

describe('plot: a shifted curve leaves its first shape behind', () => {
	it('parses trace and showParameters with safe defaults', () => {
		const visual = CourseVisualSchema.parse(market({showParameters: false}));
		if (visual.kind !== 'plot') throw new Error('not a plot');
		expect(visual.curves.map((curve) => curve.trace)).toEqual([true, false]);
		expect(visual.showParameters).toBe(false);
		const plain = CourseVisualSchema.parse({kind: 'plot', x: [0, 4], y: [0, 4], curves: [{expression: 'a*x'}], parameters: {a: {from: 1, to: 2}}});
		if (plain.kind !== 'plot') throw new Error('not a plot');
		// Mathematics reads its coefficients: they stay on screen unless a script turns them off.
		expect(plain.showParameters).toBe(true);
		expect(plain.curves[0].trace).toBe(false);
	});

	it('refuses a traced curve with no coefficient that could move it', () => {
		expect(CourseVisualSchema.safeParse({kind: 'plot', x: [0, 4], y: [0, 4], curves: [{expression: 'x', trace: true}]}).success).toBe(false);
	});

	it('starts every coefficient at its from value', () => {
		expect(startValues({a: {from: 0}, k: {from: 2, to: 5}})).toEqual({a: 0, k: 2});
		expect(startValues({})).toEqual({});
	});

	it('shows the old curve only once a coefficient has moved, fully after a tenth of its size', () => {
		const parameters = {a: {from: 0}};
		expect(traceOpacity({a: 0}, parameters)).toBe(0);
		expect(traceOpacity({a: 0.05}, parameters)).toBeCloseTo(0.5);
		expect(traceOpacity({a: 2}, parameters)).toBe(1);
		// Moving back down shows it as well: a fall in demand is a shift too.
		expect(traceOpacity({a: -1}, parameters)).toBe(1);
		// A large coefficient needs a proportionally larger move, so rounding noise never shows a ghost.
		expect(traceOpacity({k: 100.5}, {k: {from: 100}})).toBeCloseTo(0.05);
		expect(traceOpacity({}, parameters)).toBe(0);
	});

	it('keeps a growing curve hidden or faded as its look says', () => {
		// The style used to say opacity 1 whatever the attribute said, so curves never hid or faded.
		const faded = renderToStaticMarkup(React.createElement(Growing, {progress: 1, d: 'M0 0L10 10', opacity: 0.25}));
		expect(faded).toContain('opacity:0.25');
		expect(faded).not.toMatch(/opacity:1[^0-9.]/);
		expect(renderToStaticMarkup(React.createElement(Growing, {progress: 1, d: 'M0 0L10 10'}))).toContain('opacity:1');
		expect(renderToStaticMarkup(React.createElement(Growing, {progress: 0, d: 'M0 0L10 10', opacity: 1}))).toContain('opacity:0');
		expect(renderToStaticMarkup(React.createElement(Growing, {progress: 0.5, d: 'M0 0L10 10'}))).toContain('data-layout-drawn="0.5"');
	});
});
