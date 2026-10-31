import {describe, expect, it} from 'vitest';
import {anticodon, dnaStrands} from '../../../../src/Components/Visuals/Biology/GeneExpression';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('gene expression visual', () => {
	it('derives the DNA behind an mRNA: the coding strand reads like it with T, the template pairs with it', () => {
		const {coding, template} = dnaStrands('AUGCCUUGA');
		expect(coding).toBe('ATGCCTTGA');
		expect(template).toBe('TACGGAACT');
	});

	it('pairs each codon with its tRNA anticodon', () => {
		expect(anticodon('AUG')).toBe('UAC');
		expect(anticodon('UCU')).toBe('AGA');
		expect(anticodon('GGC')).toBe('CCG');
	});

	it('takes codons with only the last one a stop', () => {
		const codons = [{codon: 'AUG', aminoAcid: 'Met'}, {codon: 'UCU', aminoAcid: 'Ser'}, {codon: 'UGA', aminoAcid: 'Dur', stop: true}];
		expect(CourseVisualSchema.safeParse({kind: 'geneExpression', codons}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'geneExpression', codons: [codons[2], ...codons.slice(0, 2)]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'geneExpression', codons: [{codon: 'ATG', aminoAcid: 'Met'}, ...codons.slice(1)]}).success).toBe(false);
	});
});
