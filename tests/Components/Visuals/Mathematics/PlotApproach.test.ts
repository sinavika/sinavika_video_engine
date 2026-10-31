import {describe, expect, it} from 'vitest';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const plot = (extra: Record<string, unknown>) => ({kind: 'plot', x: [-1, 5], y: [-1, 7], ...extra});

describe('plot pieces and limits', () => {
	it('draws a piece of a piecewise function over its own domain, with hollow or filled ends', () => {
		const visual = CourseVisualSchema.parse(plot({curves: [{expression: 'x + 1', domain: [-1, 2], ends: ['none', 'open']}, {expression: '5 - x', domain: [2, 5], ends: ['closed', 'none']}]}));
		if (visual.kind !== 'plot') throw new Error('not a plot');
		expect(visual.curves[0].ends).toEqual(['none', 'open']);
		expect(visual.curves[1].domain).toEqual([2, 5]);
		expect(CourseVisualSchema.safeParse(plot({curves: [{expression: 'x', domain: [3, 1]}]})).success).toBe(false);
	});

	it('approaches from one side or both, on curves that exist', () => {
		expect(CourseVisualSchema.safeParse(plot({curves: [{expression: '(x^2 - 4)/(x - 2)'}], approach: {at: 2, left: 0, right: 0, hole: true, label: 'L = 4'}})).success).toBe(true);
		expect(CourseVisualSchema.safeParse(plot({curves: [{expression: 'x'}], approach: {at: 2}})).success).toBe(false);
		expect(CourseVisualSchema.safeParse(plot({curves: [{expression: 'x'}], approach: {at: 2, right: 1}})).success).toBe(false);
	});
});
