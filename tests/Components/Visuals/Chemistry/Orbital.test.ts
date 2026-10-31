import {describe, expect, it} from 'vitest';
import {electronConfiguration} from '../../../../src/Components/Visuals/Chemistry/Orbital';

const count = (z: number, charge: number, filter: {n?: number; l?: number; ml?: number}) =>
	electronConfiguration(z, charge).filter((e) => (filter.n === undefined || e.n === filter.n) && (filter.l === undefined || e.l === filter.l) && (filter.ml === undefined || e.ml === filter.ml)).length;

describe('orbital visual', () => {
	it('fills potassium as 1s2 2s2 2p6 3s2 3p6 4s1 and counts mℓ = 0 as ÖSYM does (11)', () => {
		expect(electronConfiguration(19).length).toBe(19);
		expect(count(19, 0, {ml: 0})).toBe(11);
	});

	it('follows Hund: three 2p electrons of nitrogen sit one per box, all spin up', () => {
		const p = electronConfiguration(7).filter((e) => e.n === 2 && e.l === 1);
		expect(p.map((e) => e.ml)).toEqual([-1, 0, 1]);
		expect(p.every((e) => e.spin === 1)).toBe(true);
	});

	it('takes the Cr and Cu exceptions and empties 4s first in transition-metal ions', () => {
		expect(count(24, 0, {n: 4})).toBe(1);
		expect(count(24, 0, {l: 2})).toBe(5);
		expect(count(29, 0, {l: 2})).toBe(10);
		expect(count(26, 2, {n: 4})).toBe(0);
		expect(count(26, 2, {l: 2})).toBe(6);
	});

	it('matches the ÖSYM counts: Ti has 8 s electrons, Cr has 12 with ℓ = 1 and 12 with mℓ = 0', () => {
		expect(count(22, 0, {l: 0})).toBe(8);
		expect(count(24, 0, {l: 1})).toBe(12);
		expect(count(24, 0, {ml: 0})).toBe(12);
		// A negative ion gains in Aufbau order: Cl⁻ has 12 electrons with ℓ = 1.
		expect(count(17, -1, {l: 1})).toBe(12);
	});
});
