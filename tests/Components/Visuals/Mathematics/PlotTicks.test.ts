import {describe, expect, it} from 'vitest';
import {seriesSlot, seriesTickLayout} from '../../../../src/Components/Visuals/Mathematics/Plot';

/** A plain width: every character half the font size. */
const measure = (text: string, size: number) => text.length * size * 0.5;

describe('plot series labels', () => {
	it('gives each named value its share of the axis', () => {
		// Twelve months on 1…12 over 1100 pixels: a month every 100.
		expect(seriesSlot([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [0, 11], 1100)).toBeCloseTo(100, 6);
		expect(seriesSlot([3], [0, 10], 500)).toBe(500);
	});

	it('keeps names that fit on one line at their size', () => {
		expect(seriesTickLayout(['Oca', 'Şub', 'Mar'], 100, 26, measure)).toEqual({lines: [['Oca'], ['Şub'], ['Mar']], fontSize: 26});
	});

	it('breaks a name wider than its share into two lines at the space that balances them', () => {
		const layout = seriesTickLayout(['Çözelti S1', 'Çözelti S2'], 100, 26, measure);
		expect(layout.lines).toEqual([['Çözelti', 'S1'], ['Çözelti', 'S2']]);
		// "Çözelti" alone is 91 pixels: it fits the 92 that are free.
		expect(layout.fontSize).toBe(26);
	});

	it('makes all the names smaller when even two lines do not fit, but not below 60 %', () => {
		const layout = seriesTickLayout(['Fotosentez', 'Su'], 100, 26, measure);
		expect(layout.lines[0]).toEqual(['Fotosentez']);
		expect(measure('Fotosentez', layout.fontSize)).toBeLessThanOrEqual(92 + 1e-9);
		expect(seriesTickLayout(['Çokuzunbirkelimeburada'], 50, 26, measure).fontSize).toBeCloseTo(26 * 0.6, 6);
	});
});
