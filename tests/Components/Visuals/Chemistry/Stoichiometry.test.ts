import {describe, expect, it} from 'vitest';
import {atomOffsets, atomTally, isBalanced, arrangement, reactionTurns} from '../../../../src/Components/Visuals/Chemistry/Stoichiometry';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const H2 = {formula: 'H₂', atoms: ['H', 'H']};
const O2 = {formula: 'O₂', atoms: ['O', 'O']};
const H2O = {formula: 'H₂O', atoms: ['H', 'O', 'H']};

describe('Stoichiometry visual', () => {
	it('lets the limiting reactant decide how many times the equation runs', () => {
		// 2H₂ + O₂ → 2H₂O with 8 H₂ and 3 O₂: O₂ runs out after 3 turns, 2 H₂ are left.
		expect(
			reactionTurns([
				{coefficient: 2, count: 8},
				{coefficient: 1, count: 3},
			]),
		).toBe(3);
		expect(
			reactionTurns([
				{coefficient: 2, count: 4},
				{coefficient: 1, count: 2},
			]),
		).toBe(2);
	});

	it('counts the atoms on each side and checks the balance', () => {
		expect(
			atomTally([
				{...H2, coefficient: 2},
				{...O2, coefficient: 1},
			]),
		).toEqual({H: 4, O: 2});
		expect(
			isBalanced(
				[
					{...H2, coefficient: 2},
					{...O2, coefficient: 1},
				],
				[{...H2O, coefficient: 2}],
			),
		).toBe(true);
		expect(
			isBalanced(
				[
					{...H2, coefficient: 1},
					{...O2, coefficient: 1},
				],
				[{...H2O, coefficient: 1}],
			),
		).toBe(false);
	});

	it('refuses an unbalanced equation and too few molecules', () => {
		const products = [{...H2O, coefficient: 2}];
		expect(
			CourseVisualSchema.safeParse({
				kind: 'stoichiometry',
				reactants: [
					{...H2, coefficient: 2, count: 8},
					{...O2, coefficient: 1, count: 3},
				],
				products,
			}).success,
		).toBe(true);
		expect(
			CourseVisualSchema.safeParse({
				kind: 'stoichiometry',
				reactants: [
					{...H2, coefficient: 1, count: 8},
					{...O2, coefficient: 1, count: 3},
				],
				products,
			}).success,
		).toBe(false);
		expect(
			CourseVisualSchema.safeParse({
				kind: 'stoichiometry',
				reactants: [
					{...H2, coefficient: 2, count: 1},
					{...O2, coefficient: 1, count: 3},
				],
				products,
			}).success,
		).toBe(false);
	});
});

describe('Stoichiometry molecule drawing', () => {
	it('puts the central atom in the middle and bends water', () => {
		const water = atomOffsets(['H', 'O', 'H']);
		expect(water[0].y).toBeCloseTo(water[2].y, 9);
		expect(water[1].y).toBeLessThan(water[0].y);
		const carbonDioxide = atomOffsets(['O', 'C', 'O']);
		expect(carbonDioxide.every((point) => Math.abs(point.y) < 1e-9)).toBe(true);
	});

	it('draws few molecules larger and in shorter rows than many', () => {
		const species = [{atoms: ['H', 'H']}, {atoms: ['O', 'O']}, {atoms: ['H', 'O', 'H']}];
		const few = arrangement(species, [2, 1], [2]);
		const many = arrangement(species, [12, 12], [12]);
		expect(few.size).toBeGreaterThan(many.size);
		expect(few.size).toBeLessThanOrEqual(1.8);
		expect(many.perRow).toBe(4);
		expect(few.perRow).toBeLessThan(4);
	});
});
