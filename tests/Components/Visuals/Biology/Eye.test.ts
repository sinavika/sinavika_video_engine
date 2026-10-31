import {describe, expect, it} from 'vitest';
import {focusX, retinaHit} from '../../../../src/Components/Visuals/Biology/Eye';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('eye visual', () => {
	it('sends every ray through a focus on the retina to one point, and a missed focus to a blurred patch', () => {
		const lens = 690;
		const heights = [-90, 0, 90];
		const spread = (focus: number) => {
			const ys = heights.map((h) => retinaHit(lens, 410 + h, focus, 410).y);
			return Math.max(...ys) - Math.min(...ys);
		};
		expect(spread(focusX('normal'))).toBeLessThan(1e-6);
		expect(spread(focusX('myopia'))).toBeGreaterThan(20);
		expect(spread(focusX('hyperopia'))).toBeGreaterThan(20);
		// Myopia focuses in front of the retina, hypermetropia behind it.
		expect(focusX('myopia')).toBeLessThan(focusX('normal'));
		expect(focusX('hyperopia')).toBeGreaterThan(focusX('normal'));
	});

	it('lands each ray on the eyeball itself', () => {
		const hit = retinaHit(690, 320, focusX('hyperopia'), 410);
		expect(Math.hypot(hit.x - 900, hit.y - 410)).toBeCloseTo(300, 6);
	});

	it('takes the three modes', () => {
		expect(CourseVisualSchema.parse({kind: 'eye'})).toMatchObject({mode: 'normal', near: false, foveaLabel: 'Sarı benek'});
		expect(CourseVisualSchema.safeParse({kind: 'eye', mode: 'astigmatism'}).success).toBe(false);
	});
});
