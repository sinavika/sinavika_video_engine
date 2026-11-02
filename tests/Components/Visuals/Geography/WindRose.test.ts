import {describe, expect, it} from 'vitest';
import {directionAngle, rosePoint} from '../../../../src/Components/Visuals/Geography/WindRose';
import {WIND_DIRECTIONS} from '../../../../src/Components/Visuals/Geography/GeographySchema';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

describe('wind rose', () => {
	it('puts north up, east right, south down and west left (y grows downwards on screen)', () => {
		const north = rosePoint('K', 100);
		const centre = rosePoint('K', 0);
		expect(north.y).toBeLessThan(centre.y);
		expect(north.x).toBeCloseTo(centre.x);
		expect(rosePoint('D', 100).x).toBeGreaterThan(centre.x);
		expect(rosePoint('G', 100).y).toBeGreaterThan(centre.y);
		expect(rosePoint('B', 100).x).toBeLessThan(centre.x);
	});

	it('goes clockwise 45° at a time, so the in-between directions sit between their neighbours', () => {
		WIND_DIRECTIONS.forEach((direction, index) => expect(directionAngle(direction)).toBeCloseTo(-Math.PI / 2 + (index * Math.PI) / 4));
		// Poyraz's north-east is up and to the right; lodos's south-west down and to the left.
		const centre = rosePoint('K', 0);
		const ne = rosePoint('KD', 100);
		const sw = rosePoint('GB', 100);
		expect(ne.x > centre.x && ne.y < centre.y).toBe(true);
		expect(sw.x < centre.x && sw.y > centre.y).toBe(true);
	});

	it('names its parts by the winds and allows one wind per direction', () => {
		const rose = CourseVisualSchema.parse({kind: 'windRose', center: 'Marmara', winds: [{from: 'KD', name: 'Poyraz', feel: 'cold'}, {from: 'GB', name: 'Lodos', feel: 'warm'}]});
		expect(numberedPartNames(rose)).toEqual(['Poyraz', 'Lodos']);
		expect(CourseVisualSchema.safeParse({kind: 'windRose', winds: [{from: 'KD', name: 'Poyraz'}, {from: 'KD', name: 'Karayel'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'windRose', winds: [{from: 'KKD', name: 'Poyraz'}]}).success).toBe(false);
	});
});
