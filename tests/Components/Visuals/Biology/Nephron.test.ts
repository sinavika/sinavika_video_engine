import {describe, expect, it} from 'vitest';
import {along, FILTRATE_PATH} from '../../../../src/Components/Visuals/Biology/Nephron';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('nephron visual', () => {
	it('runs the filtrate from the capsule to the end of the collecting duct, down the loop and up again', () => {
		expect(along(FILTRATE_PATH, 0)).toEqual(FILTRATE_PATH[0]);
		expect(along(FILTRATE_PATH, 1)).toEqual(FILTRATE_PATH[FILTRATE_PATH.length - 1]);
		// The loop of Henle is the deepest point the filtrate reaches before the collecting duct.
		const depths = Array.from({length: 101}, (_, index) => along(FILTRATE_PATH, index / 101).y);
		expect(Math.max(...depths.slice(0, 60))).toBeGreaterThan(700);
		// Moving along is smooth: no jump between neighbouring samples.
		for (let index = 1; index < 100; index++) {
			const [a, b] = [along(FILTRATE_PATH, (index - 1) / 100), along(FILTRATE_PATH, index / 100)];
			expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(60);
		}
	});

	it('takes numbers for a question figure', () => {
		const figure = CourseVisualSchema.parse({kind: 'nephron', numbered: true, labels: {glomerulus: '1', capsule: '2', proximal: '3', loop: '4', distal: '5', collecting: '6'}});
		expect(figure).toMatchObject({numbered: true, motion: true});
		expect(CourseVisualSchema.parse({kind: 'nephron'})).toMatchObject({labels: {loop: 'Henle kulpu'}});
	});
});
