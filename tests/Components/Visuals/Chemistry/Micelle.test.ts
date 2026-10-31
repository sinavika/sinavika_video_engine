import {describe, expect, it} from 'vitest';
import {micellePlace} from '../../../../src/Components/Visuals/Chemistry/Micelle';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('Micelle visual', () => {
	it('puts every head on one ring around the oil with its tail pointing to the centre', () => {
		const centre = {x: 800, y: 300};
		const places = Array.from({length: 12}, (_, index) => micellePlace(index, 12, centre));
		const radii = places.map((place) => Math.hypot(place.head.x - centre.x, place.head.y - centre.y));
		for (const radius of radii) expect(radius).toBeCloseTo(radii[0], 9);
		for (const place of places) {
			// The tail direction points from the head towards the centre.
			const toCentre = Math.atan2(centre.y - place.head.y, centre.x - place.head.x);
			expect(Math.abs(Math.atan2(Math.sin(place.angle - toCentre), Math.cos(place.angle - toCentre)))).toBeLessThan(1e-9);
		}
	});

	it('takes 8 to 16 soap molecules', () => {
		expect(CourseVisualSchema.safeParse({kind: 'micelle'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'micelle', molecules: 4}).success).toBe(false);
	});
});
