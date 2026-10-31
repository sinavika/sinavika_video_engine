import {describe, expect, it} from 'vitest';
import {nestedCircles, pairLayout, splitConclusion} from '../../../../src/Components/Visuals/Logic/Euler';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const relations = {
	kind: 'euler',
	pairs: [
		{a: 'İnsan', b: 'Düşünen', relation: 'equal', caption: 'Eşitlik'},
		{a: 'İnsan', b: 'Solungaçlı', relation: 'apart', caption: 'Ayrıklık'},
		{a: 'Şair', b: 'İnsan', relation: 'inside', caption: 'Tam girişimlik'},
		{a: 'İnsan', b: 'Uyuyan', relation: 'overlap', caption: 'Eksik girişimlik'},
	],
};
const syllogism = {kind: 'euler', nested: [{label: 'İletkenler', note: 'büyük terim'}, {label: 'Metaller', note: 'orta terim'}], point: {label: 'Bakır', note: 'küçük terim'}, conclusion: 'Bakır iletkendir.'};

describe('euler visual', () => {
	it('names panels, or circles with the point and the conclusion, as parts', () => {
		expect(numberedPartNames(CourseVisualSchema.parse(relations))).toEqual(['p1', 'p2', 'p3', 'p4']);
		expect(numberedPartNames(CourseVisualSchema.parse(syllogism))).toEqual(['n1', 'n2', 'nokta', 'sonuc']);
	});

	it('takes either pairs or nested circles', () => {
		expect(CourseVisualSchema.safeParse({kind: 'euler'}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...relations, nested: syllogism.nested}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'euler', nested: [{label: 'Metaller'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...relations, conclusion: 'Bakır iletkendir.'}).success).toBe(false);
	});

	it('draws each relation as its extensions stand', () => {
		const r = 100;
		const gap = (layout: ReturnType<typeof pairLayout>) => Math.hypot(layout.a.x - layout.b.x, layout.a.y - layout.b.y);
		const equal = pairLayout('equal', r);
		expect(gap(equal)).toBe(0);
		expect(equal.a.r).toBe(equal.b.r);
		const apart = pairLayout('apart', r);
		expect(gap(apart)).toBeGreaterThan(apart.a.r + apart.b.r);
		const inside = pairLayout('inside', r);
		expect(gap(inside) + inside.a.r).toBeLessThan(inside.b.r);
		const overlap = pairLayout('overlap', r);
		expect(gap(overlap)).toBeGreaterThan(Math.abs(overlap.a.r - overlap.b.r));
		expect(gap(overlap)).toBeLessThan(overlap.a.r + overlap.b.r);
	});

	it('keeps every nested circle inside the one around it', () => {
		const circles = nestedCircles(3);
		for (let index = 1; index < circles.length; index++) {
			const outer = circles[index - 1];
			const inner = circles[index];
			expect(Math.hypot(inner.x - outer.x, inner.y - outer.y) + inner.r).toBeLessThan(outer.r);
		}
	});

	it('writes the conclusion in short lines', () => {
		expect(splitConclusion('O hâlde bazı süs eşyaları bitkidir.').every((line) => line.length <= 20)).toBe(true);
	});
});
