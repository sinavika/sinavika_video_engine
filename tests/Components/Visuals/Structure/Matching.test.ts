import {describe, expect, it} from 'vitest';
import {matchingFontSize, matchingSlots} from '../../../../src/Components/Visuals/Structure/Matching';

const pairs = (count: number, prefix = 'Terim') => Array.from({length: count}, (_, index) => ({left: `${prefix} ${index + 1}`, right: `Anlamı ${index + 1}`}));

const isRotation = (slots: number[]) => slots.every((slot, pair) => slot === (pair + slots[0]) % slots.length);

describe('matching board order', () => {
	it('puts every partner on its own row and never level with its term', () => {
		for (let count = 2; count <= 6; count++) {
			const slots = matchingSlots(pairs(count));
			expect([...slots].sort((a, b) => a - b)).toEqual(Array.from({length: count}, (_, index) => index));
			slots.forEach((slot, pair) => expect(slot).not.toBe(pair));
		}
	});

	it('does not simply shift every partner one place from four pairs on', () => {
		for (let count = 4; count <= 6; count++) {
			for (const prefix of ['Terim', 'Akım', 'Antlaşma', 'Düşünür']) expect(isRotation(matchingSlots(pairs(count, prefix)))).toBe(false);
		}
	});

	it('shuffles the same board the same way every time, and different boards differently', () => {
		expect(matchingSlots(pairs(6))).toEqual(matchingSlots(pairs(6)));
		const orders = new Set(['Terim', 'Akım', 'Antlaşma', 'Düşünür', 'Yayın', 'İlke'].map((prefix) => matchingSlots(pairs(6, prefix)).join()));
		expect(orders.size).toBeGreaterThan(1);
	});

	it('shrinks the type until every item fits its chip, wrapped', () => {
		const u = (value: number) => value;
		const long = ['Hükümdarın eşi; yönetimde söz sahibi', 'Batı kanadını yöneten, hanedandan', 'Hükümdar'];
		// A narrow board beside a rule's list: the long items must fit in the chip's height.
		const size = matchingFontSize(long, 330, 80, u);
		const inner = 330 - 36;
		for (const text of long) expect(Math.ceil((text.length * size * 0.56) / (inner * 0.9)) * size * 1.2).toBeLessThanOrEqual(80 * 0.9);
		// A wide board with short items keeps the largest size.
		expect(matchingFontSize(['Kut', 'Töre'], 700, 160, u)).toBe(40);
	});
});
