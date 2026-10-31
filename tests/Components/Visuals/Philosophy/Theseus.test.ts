import {describe, expect, it} from 'vitest';
import {PLANKS, replacementOrder} from '../../../../src/Components/Visuals/Philosophy/Theseus';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('ship of Theseus visual', () => {
	it('replaces every plank exactly once, in the same scattered order every time', () => {
		const order = replacementOrder();
		expect([...order].sort((a, b) => a - b)).toEqual(Array.from({length: PLANKS}, (_, index) => index));
		expect(replacementOrder()).toEqual(order);
		expect(order.slice(0, 4)).not.toEqual([0, 1, 2, 3]);
	});

	it('takes a plank period between 0.2 and 3 seconds', () => {
		expect(CourseVisualSchema.safeParse({kind: 'theseus'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'theseus', period: 5}).success).toBe(false);
	});
});
