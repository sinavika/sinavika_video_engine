import {describe, expect, it} from 'vitest';
import {bodyCentre, polygonCentre, systemCentres} from '../../../../src/Components/Visuals/Physics/BodyCentre';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const figure = (input: object) => CourseVisualSchema.parse({kind: 'centreOfMass', view: [0, 0, 6, 6], ...input});

describe('centre of mass', () => {
	it('weights point masses: m at (0,0), 3m at (4,0) and 4m at (2,5) meet at (2.5,2.5)', () => {
		const steps = systemCentres([
			{kind: 'point', at: [0, 0], mass: 1},
			{kind: 'point', at: [4, 0], mass: 3},
			{kind: 'point', at: [2, 5], mass: 4},
		]);
		// After two bodies the centre lies three quarters of the way towards the heavier one.
		expect(steps[1].at).toEqual([3, 0]);
		expect(steps[2].at).toEqual([2.5, 2.5]);
		expect(steps[2].mass).toBe(8);
	});

	it('finds a plate centroid in either corner order and a rod at its middle', () => {
		const triangle = polygonCentre([[0, 0], [6, 0], [0, 3]]);
		expect(triangle.area).toBe(9);
		expect(triangle.at).toEqual([2, 1]);
		expect(polygonCentre([[0, 3], [6, 0], [0, 0]]).at).toEqual([2, 1]);
		expect(bodyCentre({kind: 'rod', from: [1, 1], to: [5, 3], mass: 2})).toEqual({at: [3, 2], mass: 2});
	});

	it('moves away from a cut-out: a 4x4 plate without its top-right 2x2 square', () => {
		const steps = systemCentres([
			{kind: 'plate', corners: [[0, 0], [4, 0], [4, 4], [0, 4]]},
			{kind: 'plate', corners: [[2, 2], [4, 2], [4, 4], [2, 4]], removed: true},
		]);
		// (16·2 − 4·3) / 12 = 5/3 on both axes: towards the bottom-left, away from the hole.
		expect(steps[0].at).toEqual([2, 2]);
		expect(steps[1].at[0]).toBeCloseTo(5 / 3, 10);
		expect(steps[1].at[1]).toBeCloseTo(5 / 3, 10);
		expect(steps[1].mass).toBe(12);
	});

	it('refuses a cut-out before its plate, a body outside the view and a flat plate', () => {
		expect(() => figure({bodies: [{kind: 'plate', corners: [[0, 0], [2, 0], [2, 2]], removed: true}]})).toThrow();
		expect(() => figure({bodies: [{kind: 'point', at: [7, 1], mass: 1, label: 'm'}]})).toThrow();
		expect(() => figure({bodies: [{kind: 'plate', corners: [[0, 0], [2, 2], [4, 4]]}]})).toThrow();
		const parsed = figure({bodies: [{kind: 'point', at: [1, 1], mass: 2, label: '2m'}]});
		expect(parsed.kind === 'centreOfMass' && parsed.centre && parsed.coordinates && parsed.axes).toBe(true);
	});
});
