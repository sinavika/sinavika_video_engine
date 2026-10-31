import {describe, expect, it} from 'vitest';
import {energyRun} from '../../../../src/Components/Visuals/Physics/EnergyTrack';

// A valley: 5 m high on the left, down to 0, up to 5 m on the right.
const valley = {profile: [[0, 5], [5, 0], [10, 5]] as [number, number][], start: 0, v0: 0, mass: 2, g: 10, friction: 0, time: 6};

describe('energy track visual', () => {
	it('keeps kinetic + potential at the starting total without friction', () => {
		const {samples, start} = energyRun(valley);
		expect(start).toBe(100);
		for (const sample of samples) expect(sample.kinetic + sample.potential).toBeCloseTo(100, 6);
		// At the bottom the speed is √(2gh) = 10 m/s.
		expect(Math.max(...samples.map((sample) => sample.v))).toBeCloseTo(10, 1);
	});

	it('turns back where its energy runs out, no higher than it started', () => {
		const {samples, heightAt} = energyRun({...valley, profile: [[0, 3], [5, 0], [10, 6]]});
		const highest = Math.max(...samples.slice(1).map((sample) => heightAt(sample.s)).filter((_, index, all) => index > all.length / 4));
		expect(highest).toBeLessThanOrEqual(3 + 1e-6);
		expect(highest).toBeGreaterThan(2.9);
	});

	it('turns energy into heat with friction: the three still add up to the start', () => {
		const {samples, start} = energyRun({...valley, friction: 2});
		const last = samples[samples.length - 1];
		expect(last.heat).toBeGreaterThan(0);
		for (const sample of samples) expect(sample.kinetic + sample.potential + sample.heat).toBeCloseTo(start, 1);
	});
});
