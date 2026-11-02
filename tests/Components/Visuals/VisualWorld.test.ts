import {describe, expect, it} from 'vitest';
import {fittedScale, noteLines, splitInTwo} from '../../../src/Components/Visuals/VisualWorld';

describe('the note under a wide scene', () => {
	it('is cut in two at the space nearest its middle', () => {
		expect(splitInTwo('Isı ve basınç kayacı başkalaştırır; daha da ısınan kayaç erir')).toEqual(['Isı ve basınç kayacı başkalaştırır;', 'daha da ısınan kayaç erir']);
		expect(splitInTwo('Başkalaşım')).toEqual(['Başkalaşım']);
	});

	it('takes two lines only when one line at its size is wider than the pill', () => {
		const note = 'Osmanlı kazandı: Azak geri alındı.';
		expect(noteLines(note, 26, 1472)).toEqual([note]);
		expect(noteLines(note, 37.2, 1472)).toEqual([note]);
		const long = 'İtilaf donanması boğazı geçemedi; kara harekâtı Arıburnu ve Seddülbahir’de başladı.';
		expect(noteLines(long, 26, 1472)).toEqual([long]);
		expect(noteLines(long, 37.2, 1472)).toHaveLength(2);
	});

	it('fits a world into its box whole', () => {
		expect(fittedScale(860, 376.25, 1600, 700)).toBeCloseTo(0.5375, 6);
		expect(fittedScale(860, 300, 1000, 600)).toBeCloseTo(0.5, 6);
	});
});
