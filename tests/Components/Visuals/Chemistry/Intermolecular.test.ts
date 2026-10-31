import {describe, expect, it} from 'vitest';
import {HYDROGEN_BONDS, cloudShift, hydrationShell, linkBetween, waterAtoms} from '../../../../src/Components/Visuals/Chemistry/Intermolecular';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const distance = (a: {x: number; y: number}, b: {x: number; y: number}) => Math.hypot(a.x - b.x, a.y - b.y);

describe('Intermolecular visual', () => {
	it('draws water with two equal O–H bonds 104.5° apart', () => {
		const water = waterAtoms(10, 20, 0.7);
		expect(distance(water.o, water.h[0])).toBeCloseTo(distance(water.o, water.h[1]), 9);
		const angle = Math.acos(((water.h[0].x - 10) * (water.h[1].x - 10) + (water.h[0].y - 20) * (water.h[1].y - 20)) / distance(water.o, water.h[0]) ** 2);
		expect((angle * 180) / Math.PI).toBeCloseTo(104.5, 6);
	});

	it('bonds an H only to another molecule, never both ways between one pair', () => {
		expect(HYDROGEN_BONDS.length).toBeGreaterThanOrEqual(10);
		for (const bond of HYDROGEN_BONDS) {
			expect(bond.acceptor).not.toBe(bond.donor);
			expect(HYDROGEN_BONDS.some((other) => other.donor === bond.acceptor && other.acceptor === bond.donor)).toBe(false);
		}
	});

	it('leaves a gap at both ends of a link', () => {
		const link = linkBetween({x: 0, y: 0}, 20, {x: 200, y: 0}, 34);
		expect(link.from.x).toBeGreaterThan(20);
		expect(link.to.x).toBeLessThan(200 - 34);
	});

	it('turns O towards a cation and an H towards an anion', () => {
		for (const item of hydrationShell(0, false)) {
			const o = distance(item.water.o, {x: 0, y: 0});
			expect(distance(item.water.h[0], {x: 0, y: 0})).toBeGreaterThan(o);
			expect(distance(item.water.h[1], {x: 0, y: 0})).toBeGreaterThan(o);
		}
		for (const item of hydrationShell(0, true)) {
			expect(distance(item.water.h[0], {x: 0, y: 0})).toBeLessThan(distance(item.water.o, {x: 0, y: 0}));
		}
	});

	it('shifts neighbouring clouds the same way most of the time (induced dipoles)', () => {
		let same = 0;
		for (let step = 0; step < 200; step++) if (cloudShift(step * 0.05, 0, 0, true) * cloudShift(step * 0.05, 0, 1, true) > 0) same++;
		expect(same).toBeGreaterThan(140);
	});

	it('needs an ion for an ion-dipole panel only', () => {
		expect(CourseVisualSchema.safeParse({kind: 'intermolecular', panels: [{mode: 'hydrogen', label: 'Su'}]}).success).toBe(true);
		expect(
			CourseVisualSchema.safeParse({
				kind: 'intermolecular',
				panels: [
					{mode: 'ionDipole', label: 'Na⁺ çevresi', ion: 'Na⁺'},
					{mode: 'ionDipole', label: 'Cl⁻ çevresi', ion: 'Cl⁻', anion: true},
				],
			}).success,
		).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'intermolecular', panels: [{mode: 'ionDipole', label: 'İyon'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'intermolecular', panels: [{mode: 'london', label: 'İyot', ion: 'I'}]}).success).toBe(false);
	});
});
