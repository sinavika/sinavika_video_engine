import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import {AUDIO_LIMITS, audioProblems, findClicks, floorOf, inspectAudio, sizzleOf, type AudioReport} from '../../src/Services/AudioCheck';
import {masterSpeechWav, measureLoudness} from '../../src/Services/AudioLeveling';
import {speechLike, writeWav} from '../Support/Wav';

const RATE = 48000;
const tone = (frequency: number, seconds: number, amplitude: number) => Float64Array.from({length: Math.round(seconds * RATE)}, (_, index) => amplitude * Math.sin((2 * Math.PI * frequency * index) / RATE));
const join = (...parts: Float64Array[]) => {
	const out = new Float64Array(parts.reduce((total, part) => total + part.length, 0));
	let offset = 0;
	for (const part of parts) {
		out.set(part, offset);
		offset += part.length;
	}
	return out;
};
const add = (a: Float64Array, b: Float64Array) => a.map((value, index) => value + (b[index] ?? 0));
let seed = 7;
const noise = (seconds: number, amplitude: number) => Float64Array.from({length: Math.round(seconds * RATE)}, () => amplitude * (((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1));

const CLEAN: AudioReport = {integrated: -16, truePeak: -1.6, floorDb: -120, clicks: [], sizzleDb: -45};

describe('clicks (owner, 9 Nov 2026: "cızırtı")', () => {
	it('finds a sound that jumps out of silence', () => {
		const square = Float64Array.from({length: RATE / 5}, (_, index) => (Math.floor(index / 50) % 2 ? 0.5 : -0.5));
		expect(findClicks(join(new Float64Array(RATE / 10), square))).toHaveLength(1);
	});

	it('finds a sound cut off into silence mid-wave', () => {
		const square = Float64Array.from({length: RATE / 5}, (_, index) => (Math.floor(index / 50) % 2 ? 0.5 : -0.5));
		expect(findClicks(join(square, new Float64Array(RATE / 10))).length).toBeGreaterThan(0);
	});

	it('lets a sound that fades in and out from silence pass', () => {
		expect(findClicks(join(new Float64Array(RATE / 10), speechLike(2, 0.5), new Float64Array(RATE / 10)))).toEqual([]);
	});
});

describe('sizzle and hiss', () => {
	it('measures the band above 14 kHz against the whole', () => {
		expect(sizzleOf(tone(1000, 1, 0.5))).toBeLessThan(-60);
		// A 15 kHz tone 20 dB under the voice reads a few decibels lower: the filters' slope reaches into it.
		expect(sizzleOf(add(tone(1000, 1, 0.5), tone(15000, 1, 0.05)))).toBeGreaterThan(-28);
	});

	it('hears the pauses: digital silence is clean, a hiss bed under the voice is not', () => {
		const voice = speechLike(4, 0.5);
		expect(floorOf(voice)).toBeLessThan(AUDIO_LIMITS.speechFloorDb);
		expect(floorOf(add(voice, noise(4, 10 ** (-50 / 20))))).toBeGreaterThan(AUDIO_LIMITS.speechFloorDb);
	});
});

describe('audio problems', () => {
	it('passes a clean voice-only file', () => expect(audioProblems(CLEAN, true)).toEqual([]));

	it('names every problem a listener hears', () => {
		expect(audioProblems({...CLEAN, integrated: -26}, true).join()).toMatch(/kısık/);
		expect(audioProblems({...CLEAN, truePeak: -0.2}, true).join()).toMatch(/tepe/);
		expect(audioProblems({...CLEAN, floorDb: -50}, true).join()).toMatch(/hışırtı/);
		expect(audioProblems({...CLEAN, clicks: [1.5]}, true).join()).toMatch(/tık/);
		expect(audioProblems({...CLEAN, sizzleDb: -30}, true).join()).toMatch(/cızırtı/);
	});

	it('holds a video with music to -14 LUFS and leaves its floor and sizzle to the music', () => {
		expect(audioProblems({...CLEAN, integrated: -14, floorDb: -40, sizzleDb: -20}, false)).toEqual([]);
		expect(audioProblems(CLEAN, false).join()).toMatch(/-14 LUFS/);
	});
});

describe('voice-only master (masterSpeechWav)', () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'audio-check-'));
	afterAll(() => rmSync(directory, {recursive: true, force: true}));

	it('brings a quiet narration with codec hiss to -16 LUFS under the ceiling, cuts the hiss, keeps the pauses silent and adds no clicks', async () => {
		const input = path.join(directory, 'quiet.wav');
		const output = path.join(directory, 'mastered.wav');
		// The codec's thin hiss rides on the voice and follows its loudness, as in the speech service's files.
		writeWav(input, speechLike(12, 0.25).map((value, index) => value + 0.25 * Math.abs(value) * Math.sin((2 * Math.PI * 15000 * index) / RATE)));
		const before = (await inspectAudio(input))!;
		expect(before.clicks).toEqual([]);
		expect(before.integrated).toBeLessThan(-20);
		expect(before.sizzleDb).toBeGreaterThan(AUDIO_LIMITS.sizzleDb);

		await masterSpeechWav(input, output, (await measureLoudness(input))!);
		const after = (await inspectAudio(output))!;
		expect(Math.abs(after.integrated - -16)).toBeLessThan(1);
		expect(after.truePeak).toBeLessThanOrEqual(AUDIO_LIMITS.truePeak);
		expect(after.sizzleDb).toBeLessThan(AUDIO_LIMITS.sizzleDb);
		expect(after.floorDb).toBeLessThan(AUDIO_LIMITS.speechFloorDb);
		expect(after.clicks).toEqual([]);
		expect(audioProblems(after, true)).toEqual([]);
	}, 60_000);
});
