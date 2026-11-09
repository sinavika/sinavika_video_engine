import {describe, expect, it} from 'vitest';
import {applyTone, limitPeaks} from '../../src/Services/AudioTone';
import {NARRATION_TONE, SPEECH_MASTER_TONE} from '../../src/Services/AudioLeveling';

const RATE = 48000;
const sine = (frequency: number, seconds = 1) => Float64Array.from({length: RATE * seconds}, (_, index) => 0.5 * Math.sin((2 * Math.PI * frequency * index) / RATE));
const rms = (samples: Float64Array) => Math.sqrt(samples.slice(RATE / 2).reduce((sum, value) => sum + value * value, 0) / (samples.length - RATE / 2));
const gainDb = (frequency: number) => {
	const dry = sine(frequency);
	const wet = sine(frequency);
	applyTone(wet, 1, RATE, NARRATION_TONE.filters);
	return 20 * Math.log10(rms(wet) / rms(dry));
};

describe('narration tone', () => {
	it('cuts the low end (bass) and leaves speech untouched', () => {
		expect(gainDb(50)).toBeLessThan(-12);
		expect(gainDb(120)).toBeLessThan(-4);
		expect(Math.abs(gainDb(1000))).toBeLessThan(0.5);
		expect(Math.abs(gainDb(4000))).toBeLessThan(0.5);
	});
});

describe('low-pass (the hiss cut of a voice-only master)', () => {
	const through = (frequency: number) => {
		const dry = sine(frequency);
		const wet = sine(frequency);
		applyTone(wet, 1, RATE, SPEECH_MASTER_TONE);
		return 20 * Math.log10(rms(wet) / rms(dry));
	};

	it('leaves speech untouched and cuts the band above 14 kHz', () => {
		expect(Math.abs(through(1000))).toBeLessThan(0.2);
		expect(Math.abs(through(5000))).toBeLessThan(0.2);
		expect(Math.abs(through(10000))).toBeLessThan(0.5);
		expect(through(15000)).toBeLessThan(-10);
		expect(through(18000)).toBeLessThan(-20);
	});
});

describe('peak limiter', () => {
	const signal = () => Float64Array.from({length: RATE}, (_, index) => (index > RATE / 2 && index < RATE / 2 + 400 ? 1 : 0.2) * Math.sin((2 * Math.PI * 220 * index) / RATE));

	it('keeps every sample under the ceiling', () => {
		const samples = signal();
		limitPeaks(samples, 1, RATE, 0.5);
		expect(Math.max(...samples.map(Math.abs))).toBeLessThanOrEqual(0.5 + 1e-9);
	});

	it('leaves quiet passages alone and changes the gain only in small steps (no clicks)', () => {
		const dry = signal();
		const wet = signal();
		limitPeaks(wet, 1, RATE, 0.5);
		for (let index = 0; index < RATE / 4; index++) expect(wet[index]).toBeCloseTo(dry[index], 9);
		// The gain of each sample against the next, where the wave is far enough from zero to read it.
		const gain = (index: number) => (Math.abs(dry[index]) > 0.05 ? wet[index] / dry[index] : Number.NaN);
		const steps = Array.from({length: RATE - 1}, (_, index) => Math.abs(gain(index + 1) - gain(index))).filter((step) => !Number.isNaN(step));
		expect(Math.max(...steps)).toBeLessThan(0.005);
	});
});
