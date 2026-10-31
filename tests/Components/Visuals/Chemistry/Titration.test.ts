import {describe, expect, it} from 'vitest';
import {equivalenceVolume, titrationPH} from '../../../../src/Components/Visuals/Chemistry/Titration';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const hcl = {flask: {kind: 'acid' as const, label: 'HCl', molarity: 0.1, volume: 25, valence: 1}, burette: {label: 'NaOH', molarity: 0.1, valence: 1}};

describe('Titration visual', () => {
	it('starts at the acid pH, passes 7 at equivalence and ends basic', () => {
		expect(titrationPH(hcl, 0)).toBeCloseTo(1, 9);
		expect(equivalenceVolume(hcl)).toBeCloseTo(25, 9);
		expect(titrationPH(hcl, 25)).toBe(7);
		// 2.5 mmol OH⁻ left over in 75 mL: pOH = −log(1/30).
		expect(titrationPH(hcl, 50)).toBeCloseTo(14 + Math.log10(2.5 / 75), 9);
	});

	it('needs twice the base for a diprotic acid and works with a base in the flask', () => {
		const sulfuric = {...hcl, flask: {...hcl.flask, label: 'H₂SO₄', valence: 2}};
		expect(equivalenceVolume(sulfuric)).toBeCloseTo(50, 9);
		const base = {flask: {kind: 'base' as const, label: 'NaOH', molarity: 0.2, volume: 20, valence: 1}, burette: {label: 'HCl', molarity: 0.1, valence: 1}};
		expect(titrationPH(base, 0)).toBeCloseTo(14 + Math.log10(0.2), 9);
		expect(equivalenceVolume(base)).toBeCloseTo(40, 9);
		expect(titrationPH(base, 60)).toBeLessThan(7);
	});

	it('refuses an equivalence point the burette cannot reach', () => {
		expect(CourseVisualSchema.safeParse({kind: 'titration', ...hcl}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'titration', ...hcl, maxVolume: 20}).success).toBe(false);
	});
});
