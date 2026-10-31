import {describe, expect, it} from 'vitest';
import {apparentLongitude, planetsAt, skyTrack} from '../../../../src/Components/Visuals/Physics/Retrograde';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('retrograde visual', () => {
	it('keeps the planets on their orbits, Mars slower than the Earth', () => {
		const {earth, mars} = planetsAt(3, 16);
		const sun = planetsAt(0, 16);
		expect(Math.hypot(earth.x - 360, earth.y - 380)).toBeCloseTo(150, 6);
		expect(Math.hypot(mars.x - 360, mars.y - 380)).toBeCloseTo(228, 6);
		expect(sun.earth).not.toEqual(earth);
	});

	it('shows Mars moving forward, then back while the Earth overtakes it, then forward again', () => {
		const track = skyTrack(30, 16);
		const steps = track.slice(1).map((longitude, index) => longitude - track[index]);
		const firstBack = steps.findIndex((step) => step < 0);
		const lastBack = steps.length - 1 - [...steps].reverse().findIndex((step) => step < 0);
		expect(firstBack).toBeGreaterThan(0);
		expect(steps.slice(0, firstBack).every((step) => step > 0)).toBe(true);
		expect(steps.slice(lastBack + 1).every((step) => step > 0)).toBe(true);
		// The loop comes when the Earth passes between the Sun and Mars (opposition).
		const middle = Math.round((firstBack + lastBack) / 2) * 0.2;
		const {earth, mars} = planetsAt(middle, 16);
		const sunToEarth = Math.atan2(earth.y - 380, earth.x - 360);
		const sunToMars = Math.atan2(mars.y - 380, mars.x - 360);
		expect(Math.abs(Math.atan2(Math.sin(sunToEarth - sunToMars), Math.cos(sunToEarth - sunToMars)))).toBeLessThan(0.1);
		expect(apparentLongitude(0, 16)).toBeCloseTo(track[0], 9);
	});

	it('takes an Earth year between 8 and 30 seconds', () => {
		expect(CourseVisualSchema.safeParse({kind: 'retrograde'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'retrograde', year: 4}).success).toBe(false);
	});
});
