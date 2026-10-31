import {describe, expect, it} from 'vitest';
import {imageOf, pointDuring, stepName, type TransformStep} from '../../../../src/Components/Visuals/Mathematics/Transform';
import {CourseVisualSchema, naturalAspect, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const step = (value: unknown): TransformStep => {
	const visual = CourseVisualSchema.parse({kind: 'transform', view: [-5, -5, 5, 5], shape: [{name: 'A', at: [1, 0]}], steps: [value]});
	if (visual.kind !== 'transform') throw new Error('not a transform');
	return visual.steps[0];
};

describe('transform visual', () => {
	it('takes every point where the textbook rule says', () => {
		expect(imageOf(step({kind: 'translate', by: [3, -2]}), [1, 4])).toEqual([4, 2]);
		expect(imageOf(step({kind: 'rotate', degrees: 90}), [3, 1])).toEqual([-1, 3]);
		expect(imageOf(step({kind: 'rotate', degrees: -90}), [3, 1])).toEqual([1, -3]);
		expect(imageOf(step({kind: 'rotate', degrees: 180, center: [1, 1]}), [3, 2])).toEqual([-1, 0]);
		expect(imageOf(step({kind: 'reflect', over: 'x'}), [2, 5])).toEqual([2, -5]);
		expect(imageOf(step({kind: 'reflect', over: 'y=x'}), [2, 5])).toEqual([5, 2]);
		expect(imageOf(step({kind: 'reflect', over: 'y=-x'}), [2, 5])).toEqual([-5, -2]);
		expect(imageOf(step({kind: 'reflectLine', axis: 'x', at: 2}), [5, 1])).toEqual([-1, 1]);
		expect(imageOf(step({kind: 'reflectPoint', center: [1, 1]}), [3, 2])).toEqual([-1, 0]);
	});

	it('turns a rotation along the circle and carries a reflection straight across the mirror', () => {
		const half = pointDuring(step({kind: 'rotate', degrees: 90}), [2, 0], 0.5);
		expect(Math.hypot(half[0], half[1])).toBeCloseTo(2);
		expect(pointDuring(step({kind: 'reflect', over: 'y'}), [3, 1], 0.5)).toEqual([0, 1]);
	});

	it('names its steps s1… and keeps the shape of its view', () => {
		const visual = CourseVisualSchema.parse({
			kind: 'transform',
			view: [-6, -3, 6, 3],
			shape: [
				{name: 'A', at: [1, 1]},
				{name: 'B', at: [3, 1]},
				{name: 'C', at: [1, 2]},
			],
			steps: [
				{kind: 'reflect', over: 'y'},
				{kind: 'translate', by: [0, -3]},
			],
		});
		expect(numberedPartNames(visual)).toEqual(['s1', 's2']);
		expect(naturalAspect(visual)).toBe(2);
		expect(stepName(step({kind: 'rotate', degrees: -90}))).toBe('O etrafında 90° saat yönünde');
	});
});
