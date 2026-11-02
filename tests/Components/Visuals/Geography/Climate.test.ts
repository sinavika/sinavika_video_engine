import {describe, expect, it} from 'vitest';
import {climateHeader} from '../../../../src/Components/Visuals/Geography/Climate';

describe('climate graph header', () => {
	it('puts the yearly summary under the title when both are there, never on the same line', () => {
		const both = climateHeader(true, true);
		expect(both.summaryY).toBeGreaterThan(both.titleY + 24);
		// The axis names sit 34 above the plot: they stay below the summary.
		expect(both.top - 34).toBeGreaterThan(both.summaryY + 12);
	});

	it('keeps one header line when only one of them is there, and none without them', () => {
		expect(climateHeader(true, false).top).toBe(96);
		expect(climateHeader(false, true)).toMatchObject({summaryY: 30, top: 96});
		expect(climateHeader(false, false).top).toBe(50);
	});
});
