import {mkdtempSync, readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {resolveVideoJob} from '../src/Renderers/VideoJob';
import {composeSoundtrack, writeSoundtrack, type SoundtrackCues} from '../src/Services/SoundtrackComposer';

const cues: SoundtrackCues = {durationSeconds: 12, sceneStarts: [3], lineStarts: [0.45, 3.4, 6.2, 9.4], closingStart: 9};
const rms = (samples: Float32Array, from: number, to: number): number => {
	let sum = 0;
	for (let index = Math.round(from * 48_000); index < Math.round(to * 48_000); index++) sum += samples[index] ** 2;
	return Math.sqrt(sum / ((to - from) * 48_000));
};
const decibels = (value: number): number => 20 * Math.log10(value);

describe('soundtrack', () => {
	it('is the same audio every time for the same cues', () => {
		const [first, second] = [composeSoundtrack(cues), composeSoundtrack(cues)];
		expect(first.left.length).toBe(12 * 48_000);
		expect(Buffer.from(first.left.buffer).equals(Buffer.from(second.left.buffer))).toBe(true);
		expect(Buffer.from(first.left.buffer).equals(Buffer.from(first.right.buffer))).toBe(false);
	});

	it('stays a quiet bed under the voice and never clips', () => {
		const {left, right} = composeSoundtrack(cues);
		const peak = Math.max(...[left, right].map((channel) => channel.reduce((highest, value) => Math.max(highest, Math.abs(value)), 0)));
		expect(decibels(peak)).toBeLessThan(-10);
		// Measured with the narration, this bed sits about 16 LU under the voice (-30 LUFS against -14 LUFS).
		expect(decibels(rms(left, 4, 8))).toBeLessThan(-30);
		expect(decibels(rms(left, 4, 8))).toBeGreaterThan(-50);
	});

	it('starts the rhythm with the second scene, and lets the last chord ring out to silence', () => {
		const {left} = composeSoundtrack(cues);
		expect(rms(left, 3.5, 6)).toBeGreaterThan(rms(left, 0.8, 2.8) * 1.2);
		expect(rms(left, 9.2, 10)).toBeGreaterThan(rms(left, 11.5, 12) * 3);
		expect(Math.abs(left[left.length - 1])).toBeLessThan(0.001);
		expect(Math.abs(left[0])).toBeLessThan(0.001);
	});

	it('writes a 48 kHz stereo 16-bit WAV', async () => {
		const file = path.join(mkdtempSync(path.join(os.tmpdir(), 'sinavika-sound-')), 'track.wav');
		await writeSoundtrack(cues, file);
		const wav = readFileSync(file);
		expect(wav.subarray(0, 4).toString('latin1')).toBe('RIFF');
		expect([wav.readUInt16LE(22), wav.readUInt32LE(24), wav.readUInt16LE(34)]).toEqual([2, 48_000, 16]);
		expect(wav.length).toBe(44 + 12 * 48_000 * 4);
	});

	it('is opt-in per job', () => {
		const job = {template: 'QuickRevision', content: JSON.parse(readFileSync(path.resolve(__dirname, '..', 'samples', 'QuickRevision.json'), 'utf8')).content};
		expect(resolveVideoJob(job).soundtrack).toBe(false);
		expect(resolveVideoJob({...job, soundtrack: true}).soundtrack).toBe(true);
	});
});
