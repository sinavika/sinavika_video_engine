import {describe, expect, it} from 'vitest';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

describe('pie visual', () => {
	it('names its slices p1…, so beats can open and point at them', () => {
		const visual = CourseVisualSchema.parse({kind: 'pie', slices: [{label: 'Spor', value: 130}, {label: 'Müzik', value: 90}, {label: 'Resim', value: 140}]});
		expect(numberedPartNames(visual)).toEqual(['p1', 'p2', 'p3']);
		if (visual.kind !== 'pie') throw new Error('not a pie');
		expect(visual.show).toBe('value');
	});

	it('takes only positive values and two to eight slices', () => {
		expect(CourseVisualSchema.safeParse({kind: 'pie', slices: [{label: 'A', value: 0}, {label: 'B', value: 1}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'pie', slices: [{label: 'A', value: 1}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'pie', slices: [{label: 'A', value: 1}, {label: 'B', value: 2}], show: 'angle'}).success).toBe(true);
	});
});
