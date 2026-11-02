import {describe, expect, it} from 'vitest';
import {MOLECULE_DRAWING} from '../../../../src/Components/Visuals/Chemistry/Molecule';

describe('molecule drawing sizes, in SmilesDrawer’s own units', () => {
	it('keeps the lines of a double bond apart and a letter well under a bond', () => {
		// Lines 5 thick 5.1 apart ran together; letters 30 tall on a 30-long bond hid the C–Cl bond.
		expect(MOLECULE_DRAWING.bondSpacing).toBeGreaterThan(MOLECULE_DRAWING.bondThickness * 3);
		expect(MOLECULE_DRAWING.fontSizeLarge).toBeLessThan(MOLECULE_DRAWING.bondLength / 2);
		expect(MOLECULE_DRAWING.compactDrawing).toBe(false);
	});
});
