import {describe, expect, it} from 'vitest';
import {stopDistance, trackPoint, WAIT_DISTANCE} from '../../../../src/Components/Visuals/Philosophy/Trolley';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('trolley visual', () => {
	it('shares the track up to the switch, then the side track bends away', () => {
		expect(trackPoint('branch', WAIT_DISTANCE)).toEqual(trackPoint('main', WAIT_DISTANCE));
		expect(trackPoint('branch', 1400).y).toBeGreaterThan(trackPoint('main', 1400).y);
	});

	it('waits before the switch and brakes short of the people on either track', () => {
		expect(trackPoint('main', WAIT_DISTANCE).x).toBeLessThan(640);
		expect(trackPoint('main', stopDistance('main')).x).toBeLessThan(1250);
		expect(trackPoint('branch', stopDistance('branch')).x).toBeLessThan(1360);
		expect(stopDistance('main')).toBeGreaterThan(WAIT_DISTANCE);
		expect(stopDistance('branch')).toBeGreaterThan(WAIT_DISTANCE);
	});

	it('takes its three labels', () => {
		expect(CourseVisualSchema.safeParse({kind: 'trolley'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'trolley', fiveLabel: 'Beş kişi raylarda bekliyor'}).success).toBe(false);
	});
});
