import {describe, expect, it} from 'vitest';
import {matchingSlots} from '../../../../src/Components/Visuals/Structure/Matching';

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
});
