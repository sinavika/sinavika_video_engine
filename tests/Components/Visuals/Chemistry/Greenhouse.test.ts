import {describe, expect, it} from 'vitest';
import {trappedLanes, warmth} from '../../../../src/Components/Visuals/Chemistry/Greenhouse';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('Greenhouse visual', () => {
	it('sends more infrared back and warms more with more greenhouse gas', () => {
		expect(trappedLanes(0)).toBe(0);
		expect(trappedLanes(3)).toBe(3);
		expect(trappedLanes(9)).toBe(6);
		expect(warmth(0)).toBeLessThan(warmth(2));
		expect(warmth(2)).toBeLessThan(warmth(6));
		expect(warmth(6)).toBeLessThanOrEqual(1);
	});

	it('takes zero to six gas lanes', () => {
		expect(CourseVisualSchema.safeParse({kind: 'greenhouse', gases: 4}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'greenhouse', gases: 7}).success).toBe(false);
	});
});
