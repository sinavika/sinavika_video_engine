import {describe, expect, it} from 'vitest';
import {normalizeLatex} from '../../src/Schemas/RichText';

describe('words inside a formula are set upright', () => {
	it('sets a capitalised word as text, like a word with Turkish letters', () => {
		expect(normalizeLatex('Anne = 3x')).toBe('\\text{Anne} = 3x');
		expect(normalizeLatex('Kız = x')).toBe('\\text{Kız} = x');
		expect(normalizeLatex('Toplam = 48')).toBe('\\text{Toplam} = 48');
	});

	it('leaves point names, short symbols, commands and text as they are', () => {
		expect(normalizeLatex('|AB| + |BC| = |AC|')).toBe('|AB| + |BC| = |AC|');
		expect(normalizeLatex('\\Delta = b^2 - 4ac')).toBe('\\Delta = b^2 - 4ac');
		expect(normalizeLatex('\\Rightarrow x = 12')).toBe('\\Rightarrow x = 12');
		expect(normalizeLatex('\\text{Anne} = 3x')).toBe('\\text{Anne} = 3x');
		expect(normalizeLatex('V_1 + V_2')).toBe('V_1 + V_2');
	});
});
