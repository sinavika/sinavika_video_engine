import {describe, expect, it} from 'vitest';
import {sarcomereBands} from '../../../../src/Components/Visuals/Biology/Sarcomere';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('sarcomere visual', () => {
	it('keeps the A band and shortens the I band and the H zone as the sarcomere contracts', () => {
		const relaxed = sarcomereBands(2.4);
		const contracted = sarcomereBands(2);
		expect(relaxed.a).toBe(contracted.a);
		expect(relaxed.i).toBeCloseTo(0.8, 9);
		expect(contracted.i).toBeCloseTo(0.4, 9);
		expect(relaxed.h).toBeCloseTo(0.4, 9);
		expect(contracted.h).toBeCloseTo(0, 9);
		// The shortening of the sarcomere is the shortening of the I band; no filament changes its length.
		expect(relaxed.i - contracted.i).toBeCloseTo(2.4 - 2, 9);
	});

	it('refuses a contracted length longer than the relaxed one', () => {
		expect(CourseVisualSchema.safeParse({kind: 'sarcomere', relaxed: 2.2, contracted: 2.4}).success).toBe(false);
		expect(CourseVisualSchema.parse({kind: 'sarcomere'})).toMatchObject({relaxed: 2.4, contracted: 2, lengths: true});
	});
});
