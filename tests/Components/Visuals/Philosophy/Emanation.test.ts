import {describe, expect, it} from 'vitest';
import {lightOf, ringOf} from '../../../../src/Components/Visuals/Philosophy/Emanation';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('emanation visual', () => {
	it('lays the rings edge to edge, each dimmer than the one inside', () => {
		for (const count of [2, 3, 4, 5]) {
			for (let level = 1; level < count; level++) {
				expect(ringOf(level, count).outer).toBeCloseTo(ringOf(level + 1, count).inner, 9);
				expect(lightOf(level + 1, count)).toBeLessThan(lightOf(level, count));
			}
			expect(lightOf(count, count)).toBeGreaterThan(0);
		}
	});

	it('takes a source and two to five levels', () => {
		const source = {label: 'Bir'};
		expect(CourseVisualSchema.safeParse({kind: 'emanation', source, levels: [{label: 'Akıl'}, {label: 'Ruh'}, {label: 'Madde'}]}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'emanation', source, levels: [{label: 'Akıl'}]}).success).toBe(false);
	});
});
