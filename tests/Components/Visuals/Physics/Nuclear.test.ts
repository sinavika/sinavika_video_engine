import {describe, expect, it} from 'vitest';
import {fractionLevels} from '../../../../src/Components/Visuals/Chemistry/Distillation';
import {chainFissions, nucleonLayout} from '../../../../src/Components/Visuals/Physics/Nuclear';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('nuclear visual', () => {
	it('grows the chain reaction k-fold, and holds it at one per generation with control rods', () => {
		expect(chainFissions(3, 3, false)).toEqual([1, 3, 9]);
		expect(chainFissions(3, 2, false)).toEqual([1, 2, 4]);
		expect(chainFissions(3, 3, true)).toEqual([1, 1, 1]);
		// 1 + 3 + 9 = 13 split nuclei after three generations, as the lesson counts them.
		expect(chainFissions(3, 3, false).reduce((sum, count) => sum + count, 0)).toBe(13);
	});

	it('packs nucleons in a round disc that grows as the square root of their count, without overlaps', () => {
		const ball = 20;
		for (const count of [4, 16, 36]) {
			const layout = nucleonLayout(count, ball);
			expect(layout).toHaveLength(count);
			const reach = Math.max(...layout.map((nucleon) => Math.hypot(nucleon.x, nucleon.y)));
			expect(reach).toBeLessThan(ball * 1.1 * Math.sqrt(count));
			for (const [index, a] of layout.entries()) {
				for (const b of layout.slice(index + 1)) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(ball * 1.2);
			}
		}
		// Heavy nuclei have more neutrons than protons: one in three is a proton.
		expect(nucleonLayout(36, ball, 3).filter((nucleon) => nucleon.proton)).toHaveLength(12);
	});

	it('takes fission, chain and fusion with their defaults', () => {
		const fission = CourseVisualSchema.parse({kind: 'nuclear'});
		expect(fission).toMatchObject({mode: 'fission', target: '²³⁵U', products: ['¹⁴¹Ba', '⁹²Kr'], neutrons: 3});
		const fusion = CourseVisualSchema.parse({kind: 'nuclear', mode: 'fusion'});
		// ²H + ³H → ⁴He + n: nucleons are conserved.
		if (fusion.kind !== 'nuclear') throw new Error('kind');
		expect(fusion.fusion.left.nucleons + fusion.fusion.right.nucleons).toBe(fusion.fusion.product.nucleons + 1);
		expect(CourseVisualSchema.safeParse({kind: 'nuclear', mode: 'chain', neutrons: 4}).success).toBe(false);
	});
});

describe('distillation visual', () => {
	it('stacks the fractions from the top tray (lightest) to the bottom, evenly spaced', () => {
		const levels = fractionLevels(6);
		expect(levels[0]).toBeLessThan(levels[5]);
		const gaps = levels.slice(1).map((level, index) => level - levels[index]);
		for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0], 9);
		expect(CourseVisualSchema.safeParse({kind: 'distillation', fractions: [{name: 'Benzin', range: '40–200 °C'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'distillation', fractions: [{name: 'Gazlar', range: '< 40 °C'}, {name: 'Asfalt', range: '> 400 °C'}]}).success).toBe(true);
	});
});
