import {describe, expect, it} from 'vitest';
import {feedbackStrength, hormoneLevel} from '../../../../src/Components/Visuals/Biology/Feedback';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('feedback visual', () => {
	it('settles a negative loop at the normal level after one overshoot', () => {
		const period = 8;
		expect(hormoneLevel('negative', 0, period)).toBeCloseTo(0.1, 9);
		const peak = hormoneLevel('negative', period / 2, period);
		expect(peak).toBeGreaterThan(0.6);
		expect(peak).toBeLessThan(0.8);
		expect(hormoneLevel('negative', period * 3, period)).toBeCloseTo(0.6, 2);
		// The brake bites only above the normal level.
		expect(feedbackStrength('negative', 0.3)).toBe(0);
		expect(feedbackStrength('negative', peak)).toBeGreaterThan(0.5);
	});

	it('runs a positive loop away until the event that ends it', () => {
		const levels = [0, 2, 4, 6].map((at) => hormoneLevel('positive', at, 8));
		expect(levels).toEqual([...levels].sort((a, b) => a - b));
		expect(hormoneLevel('positive', 100, 8)).toBe(0.95);
		expect(feedbackStrength('positive', 0.3)).toBeLessThan(feedbackStrength('positive', 0.5));
	});

	it('wants one hormone per arrow and feedback to an earlier gland', () => {
		const nodes = [{label: 'Hipotalamus'}, {label: 'Hipofiz'}, {label: 'Tiroit'}];
		expect(CourseVisualSchema.safeParse({kind: 'feedback', nodes, hormones: ['TRH', 'TSH'], back: [0, 1], levelLabel: 'Tiroksin'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'feedback', nodes, hormones: ['TRH'], levelLabel: 'Tiroksin'}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'feedback', nodes, hormones: ['TRH', 'TSH'], back: [2], levelLabel: 'Tiroksin'}).success).toBe(false);
	});
});
