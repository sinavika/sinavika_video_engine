import {describe, expect, it} from 'vitest';
import {beatInterval, snapScenesToBeats} from '../../src/Scenes/Rhythm';
import type {TemplateScene} from '../../src/Scenes/ScenePlan';
import {beatGridOf, tempoHint} from '../../src/Services/BeatGrid';

/** A click track: a short decaying low thump on every beat, with quiet noise between. */
const clicks = (bpm: number, offset: number, seconds: number, rate = 11025): Float32Array => {
	const samples = new Float32Array(Math.round(seconds * rate));
	let seed = 7;
	for (let index = 0; index < samples.length; index++) {
		seed = (seed * 16807) % 2147483647;
		samples[index] = ((seed / 2147483647) * 2 - 1) * 0.01;
	}
	for (let beat = offset; beat < seconds; beat += 60 / bpm) {
		const start = Math.round(beat * rate);
		for (let index = 0; index < rate * 0.08 && start + index < samples.length; index++) samples[start + index] += Math.sin((2 * Math.PI * 70 * index) / rate) * Math.exp(-index / (rate * 0.02)) * 0.8;
	}
	return samples;
};

const scene = (id: string, seconds: number): TemplateScene => ({id, seconds, label: id, element: null});

describe('beat grid', () => {
	it('reads the tempo a music description asks for', () => {
		expect(tempoHint('a confident groove. Around 118 BPM, witty and upbeat. No vocals.')).toBe(118);
		expect(tempoHint('calm and slow, no drums')).toBeUndefined();
	});

	it('finds the tempo and the phase of a click track', () => {
		const grid = beatGridOf(clicks(120, 0.25, 12), 118);
		expect(grid.bpm).toBeGreaterThan(118.5);
		expect(grid.bpm).toBeLessThan(121.5);
		expect(Math.abs(grid.beats[0] - 0.25)).toBeLessThan(0.04);
		expect(beatInterval(grid.beats)).toBeCloseTo(0.5, 1);
	});

	it('moves every cut onto the next beat, never more than one beat later, and leaves the last scene alone', () => {
		const beats = Array.from({length: 40}, (_, index) => 0.1 + index * 0.5);
		const snapped = snapScenesToBeats([scene('a', 1.8), scene('b', 2.05), scene('c', 3)], beats);
		const ends = snapped.slice(0, -1).reduce<number[]>((list, item) => [...list, (list.at(-1) ?? 0) + item.seconds], []);
		for (const end of ends) expect(beats.some((beat) => Math.abs(beat - end) < 1e-9)).toBe(true);
		expect(snapped[0].seconds - 1.8).toBeLessThanOrEqual(0.5);
		expect(snapped[2].seconds).toBe(3);
		expect(snapScenesToBeats([scene('a', 1)], undefined)[0].seconds).toBe(1);
	});
});
