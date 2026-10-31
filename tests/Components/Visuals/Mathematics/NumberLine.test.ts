import {describe, expect, it} from 'vitest';
import {CourseVisualSchema, naturalAspect, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const system = {
	kind: 'numberLine',
	range: [-1, 9],
	intervals: [
		{from: null, to: 6, label: 'x < 6', row: 2},
		{from: 2, to: null, label: 'x > 2', row: 1},
		{from: 2, to: 6, label: 'ortak çözüm'},
	],
	points: [{x: 3}],
};

describe('number line visual', () => {
	it('names its intervals i1… and its points p1…, so beats can point at them', () => {
		const visual = CourseVisualSchema.parse(system);
		expect(numberedPartNames(visual)).toEqual(['i1', 'i2', 'i3', 'p1']);
	});

	it('keeps open ends open unless an end is said to be closed', () => {
		const visual = CourseVisualSchema.parse(system);
		if (visual.kind !== 'numberLine') throw new Error('not a number line');
		expect(visual.intervals.map((interval) => [interval.closedFrom, interval.closedTo])).toEqual([
			[false, false],
			[false, false],
			[false, false],
		]);
	});

	it('rejects ends and points outside the drawn range, and intervals that run backwards', () => {
		expect(CourseVisualSchema.safeParse({...system, points: [{x: 12}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...system, intervals: [{from: -3, to: 2}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...system, intervals: [{from: 5, to: 2}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...system, range: [4, 4]}).success).toBe(false);
	});

	it('is a wide strip that grows taller with each floating row', () => {
		const flat = naturalAspect(CourseVisualSchema.parse({...system, intervals: [{from: 2, to: 6}]}));
		const stacked = naturalAspect(CourseVisualSchema.parse(system));
		expect(flat).toBeGreaterThan(stacked ?? Infinity);
		expect(stacked).toBeGreaterThan(1.5);
	});
});
