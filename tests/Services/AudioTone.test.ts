import {describe, expect, it} from 'vitest';
import {applyTone} from '../../src/Services/AudioTone';
import {NARRATION_TONE} from '../../src/Services/AudioLeveling';

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
