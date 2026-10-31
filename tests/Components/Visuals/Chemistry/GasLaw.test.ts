import {describe, expect, it} from 'vitest';
import {meetingPoint, relativePressure} from '../../../../src/Components/Visuals/Chemistry/GasLaw';

describe('gas visual', () => {
	it('follows PV = nRT: halving the volume doubles the pressure, doubling T at fixed V doubles it too', () => {
		const start = {volume: 1, temperature: 1, moles: 1};
		expect(relativePressure({volume: 0.5, temperature: 1, moles: 1}, start)).toBeCloseTo(2, 9);
		expect(relativePressure({volume: 1, temperature: 2, moles: 1}, start)).toBeCloseTo(2, 9);
		// Charles at fixed pressure: V and T change together.
		expect(relativePressure({volume: 0.75, temperature: 0.75, moles: 1}, start)).toBeCloseTo(1, 9);
	});

	it('puts the meeting point where Graham says: H₂ and O₂ in a 40 cm tube meet 32 cm from the H₂ end', () => {
		expect(meetingPoint(40, 2, 32)).toBeCloseTo(32, 9);
		expect(meetingPoint(30, 16, 16)).toBeCloseTo(15, 9);
	});
});

describe('solution visual', () => {
	it('counts particles per unit and compares i·m: 0.5 m Al2(SO4)3 beats 1 m glucose by 2.5 times', async () => {
		const {colligative, particleFactor} = await import('../../../../src/Components/Visuals/Chemistry/Solution');
		const sulfate = [{count: 2}, {count: 3}];
		expect(particleFactor(sulfate)).toBe(5);
		expect(colligative(0.5, sulfate) / colligative(1, [{count: 1}])).toBeCloseTo(2.5, 9);
	});
});

describe('energy profile visual', () => {
	it('reads ΔH and both activation energies from the three levels', async () => {
		const {profileEnergies} = await import('../../../../src/Components/Visuals/Chemistry/EnergyProfile');
		expect(profileEnergies(40, 15, 75)).toEqual({deltaH: -25, forward: 35, backward: 60});
		const {CourseVisualSchema} = await import('../../../../src/Components/Visuals/VisualSchema');
		expect(CourseVisualSchema.safeParse({kind: 'energyProfile', reactants: 40, products: 15, peak: 30}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'energyProfile', reactants: 40, products: 15, peak: 75, catalyst: 55}).success).toBe(true);
	});
});

describe('equilibrium visual', () => {
	it('eases to the equilibrium value and is nearly there after a few time constants', async () => {
		const {approach} = await import('../../../../src/Components/Visuals/Chemistry/Equilibrium');
		expect(approach(1, 0.6, 0)).toBe(1);
		expect(approach(1, 0.6, 5)).toBeCloseTo(0.6, 2);
	});
});

describe('electrochemical cell visual', () => {
	it('gives E°cell = E°cathode − E°anode (Daniell 1,10 V; Ni/Zn 0,51 V)', async () => {
		const {cellPotential} = await import('../../../../src/Components/Visuals/Chemistry/ElectroCell');
		expect(cellPotential(0.34, -0.76)).toBeCloseTo(1.1, 9);
		expect(cellPotential(-0.25, -0.76)).toBeCloseTo(0.51, 9);
	});
});
