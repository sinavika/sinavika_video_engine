import {describe, expect, it} from 'vitest';
import {groupLayout} from '../../../../src/Components/Visuals/Biology/Digestion';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('digestion visual', () => {
	it('lays the units of a chain out centred, one per unit, groups apart', () => {
		const chain = groupLayout([8], 'circle');
		expect(chain).toHaveLength(8);
		expect(chain[0].x + chain[7].x).toBeCloseTo(0, 9);
		const pairs = groupLayout([2, 2, 2, 2], 'circle');
		expect(pairs.map((unit) => unit.group)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
		// Eight single units still fit a station's column (about 410 units wide).
		const singles = groupLayout([1, 1, 1, 1, 1, 1, 1, 1], 'square');
		expect(singles[7].x - singles[0].x).toBeLessThan(400);
	});

	it('keeps the fat: emulsified drops hold the big drop’s area between them', () => {
		const big = groupLayout([6], 'drop')[0].radius;
		const small = groupLayout([2, 2, 2], 'drop').map((drop) => drop.radius);
		expect(small.reduce((sum, radius) => sum + radius ** 2, 0)).toBeCloseTo(big ** 2, 6);
	});

	it('refuses a stage that loses or gains units', () => {
		const row = {label: 'Nişasta', intake: [8], stages: [[4, 2, 2], [4, 2, 1]], enzymes: ['amilaz', 'sindirilmez']};
		expect(CourseVisualSchema.safeParse({kind: 'digestion', stations: ['Ağız', 'Mide'], rows: [row]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'digestion', stations: ['Ağız', 'Mide'], rows: [{...row, stages: [[4, 2, 2], [4, 2, 2]]}]}).success).toBe(true);
	});
});
