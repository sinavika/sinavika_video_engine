import {mkdtemp, readFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {ffmpeg} from './AudioLeveling';

/**
 * The beat grid of a piece of music, measured from the piece itself, so a
 * reel can cut on the beat (docs/Reels-Kurgu-Fikirleri.md: "her vuruşta bir
 * şey olur, kesmeler vuruşa denk gelir"). ElevenLabs Music is asked for a
 * tempo ("Around 118 BPM"); that tempo is only a hint, the grid is found in
 * the audio: an onset curve (rises in loudness), the period that repeats best
 * near the hint, and the phase that lands most beats on onsets.
 */

const RATE = 11025;
const HOP = 128;
const WINDOW = 512;
const FRAME_SECONDS = HOP / RATE;

/** The tempo a music description asks for ("Around 118 BPM"), if any. */
export const tempoHint = (description: string): number | undefined => {
	const match = description.match(/(\d{2,3})\s*BPM/i);
	const bpm = match ? Number(match[1]) : NaN;
	return bpm >= 60 && bpm <= 200 ? bpm : undefined;
};

/** Mono samples of a file at RATE. The engine's ffmpeg writes no raw float, so it decodes to 16-bit WAV and the data chunk is read. */
const decode = async (file: string): Promise<Float32Array> => {
	const directory = await mkdtemp(path.join(os.tmpdir(), 'beats-'));
	const wav = path.join(directory, 'samples.wav');
	try {
		await ffmpeg(['-y', '-i', path.resolve(file), '-vn', '-ac', '1', '-ar', String(RATE), '-c:a', 'pcm_s16le', wav]);
		const bytes = await readFile(wav);
		let offset = 12;
		while (offset + 8 <= bytes.length) {
			const size = bytes.readUInt32LE(offset + 4);
			if (bytes.toString('ascii', offset, offset + 4) === 'data') {
				const count = Math.floor(Math.min(size, bytes.length - offset - 8) / 2);
				const samples = new Float32Array(count);
				for (let index = 0; index < count; index++) samples[index] = bytes.readInt16LE(offset + 8 + index * 2) / 32768;
				return samples;
			}
			offset += 8 + size + (size % 2);
		}
		throw new Error(`No audio in ${file}.`);
	} finally {
		await rm(directory, {recursive: true, force: true});
	}
};

/** The low end of the samples (two one-pole low-passes near 180 Hz): kick and bass, where the beat lives; hi-hats only blur it. */
const lowBand = (samples: Float32Array): Float32Array => {
	const k = 1 - Math.exp((-2 * Math.PI * 180) / RATE);
	const out = new Float32Array(samples.length);
	let a = 0;
	let b = 0;
	for (let index = 0; index < samples.length; index++) {
		a += k * (samples[index] - a);
		b += k * (a - b);
		out[index] = b;
	}
	return out;
};

/** How much louder each frame is than the one before (log energy, rises only). */
const flux = (samples: Float32Array): Float64Array => {
	const frames = Math.max(0, Math.floor((samples.length - WINDOW) / HOP));
	const energy = new Float64Array(frames);
	for (let frame = 0; frame < frames; frame++) {
		let sum = 0;
		for (let index = frame * HOP; index < frame * HOP + WINDOW; index++) sum += samples[index] * samples[index];
		energy[frame] = Math.log(1e-9 + sum);
	}
	const onset = new Float64Array(frames);
	for (let frame = 1; frame < frames; frame++) onset[frame] = Math.max(0, energy[frame] - energy[frame - 1]);
	return onset;
};

/** The onset curve: the low band's rises counted twice, the full band's once, lightly smoothed. */
const onsetCurve = (samples: Float32Array): Float64Array => {
	const low = flux(lowBand(samples));
	const full = flux(samples);
	const frames = Math.min(low.length, full.length);
	const smooth = new Float64Array(frames);
	for (let frame = 1; frame < frames - 1; frame++) {
		const value = (index: number) => 2 * low[index] + full[index];
		smooth[frame] = (value(frame - 1) + 2 * value(frame) + value(frame + 1)) / 4;
	}
	return smooth;
};

/** The curve's value between two frames. */
const at = (curve: Float64Array, position: number): number => {
	const index = Math.floor(position);
	if (index < 0 || index + 1 >= curve.length) return 0;
	const t = position - index;
	return curve[index] * (1 - t) + curve[index + 1] * t;
};

/** Autocorrelation of the curve at a lag of `period` frames. */
const repeatScore = (curve: Float64Array, period: number): number => {
	let sum = 0;
	for (let frame = 0; frame + period < curve.length; frame++) sum += curve[frame] * at(curve, frame + period);
	return sum / Math.max(1, curve.length - period);
};

type BeatGrid = {bpm: number; beats: number[]};

/** The beat grid of the samples; `hint` narrows the tempo search to ±8% around it. */
export const beatGridOf = (samples: Float32Array, hint?: number): BeatGrid => {
	const curve = onsetCurve(samples);
	const [low, high] = hint ? [hint * 0.92, hint * 1.08] : [80, 160];
	let best = {bpm: hint ?? 120, score: -Infinity};
	for (let bpm = low; bpm <= high; bpm += 0.25) {
		const score = repeatScore(curve, 60 / bpm / FRAME_SECONDS);
		if (score > best.score) best = {bpm, score};
	}
	const period = 60 / best.bpm / FRAME_SECONDS;
	let phase = {offset: 0, score: -Infinity};
	for (let offset = 0; offset < period; offset += 0.5) {
		let score = 0;
		for (let position = offset; position < curve.length; position += period) score += Math.max(at(curve, position - 1), at(curve, position), at(curve, position + 1));
		if (score > phase.score) phase = {offset, score};
	}
	const beats: number[] = [];
	for (let position = phase.offset; position < curve.length; position += period) beats.push(Number((position * FRAME_SECONDS + WINDOW / 2 / RATE).toFixed(3)));
	return {bpm: Number(best.bpm.toFixed(2)), beats};
};

/** The beat grid of a music file. */
export const analyzeBeats = async (file: string, hint?: number): Promise<BeatGrid> => beatGridOf(await decode(file), hint);
