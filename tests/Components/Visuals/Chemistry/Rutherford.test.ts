import {describe, expect, it} from 'vitest';
import {backScattered, scatterAngle, screenHit} from '../../../../src/Components/Visuals/Chemistry/Rutherford';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('Rutherford visual', () => {
	it('deflects a particle more the closer it passes the nucleus, and turns a head-on one back', () => {
		expect(Math.abs(scatterAngle(100))).toBeLessThan(Math.abs(scatterAngle(20)));
		expect(Math.abs(scatterAngle(20))).toBeLessThan(Math.abs(scatterAngle(3)));
		expect(scatterAngle(0)).toBeCloseTo(Math.PI, 9);
		expect(Math.sign(scatterAngle(-40))).toBe(-1);
	});

	it('lands every particle on the screen circle, only a few coming back', () => {
		const hit = screenHit(0.3);
		expect(Math.hypot(hit.x - 700, hit.y - 350)).toBeCloseTo(300, 6);
		expect(backScattered()).toBeGreaterThan(0);
		expect(backScattered()).toBeLessThanOrEqual(2);
	});

	it('takes a beam period between 4 and 20 seconds', () => {
		expect(CourseVisualSchema.safeParse({kind: 'rutherford'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'rutherford', period: 2}).success).toBe(false);
	});
});
