import {readFile} from 'node:fs/promises';
import type {LineSegment} from './NarrationScript';

/**
 * Where a narration is cut into its lines, placed in the audio itself.
 *
 * A narration is spoken as one script and cut into lines afterwards. The
 * speech service's character timings say roughly where a line ends, but a
 * fluent voice often runs one line into the next with no pause at all, so a
 * cut at the timing lands inside a word: the tail of one line or the onset of
 * the next is clipped, heard as a small break in the voice (owner, 25 Oct
 * 2026, "seste kesilmeler"). Here each cut is moved to the quietest moment
 * near it (the gap between two words, a breath), measured on the waveform.
 */

/** Samples of a 16-bit PCM WAV file, mono, as numbers in [-1, 1], and the sample rate. */
export const readWav = async (file: string): Promise<{samples: Float32Array; sampleRate: number}> => {
	const buffer = await readFile(file);
	let offset = 12;
	let sampleRate = 48000;
	let channels = 1;
	let bits = 16;
	while (offset + 8 <= buffer.length) {
		const id = buffer.toString('ascii', offset, offset + 4);
		const size = buffer.readUInt32LE(offset + 4);
		const body = offset + 8;
		if (id === 'fmt ') {
			channels = buffer.readUInt16LE(body + 2);
			sampleRate = buffer.readUInt32LE(body + 4);
			bits = buffer.readUInt16LE(body + 14);
		} else if (id === 'data') {
			if (bits !== 16) throw new Error(`Narration ${file} is ${bits}-bit; 16-bit PCM expected.`);
			const frames = Math.floor(Math.min(size, buffer.length - body) / (2 * channels));
			const samples = new Float32Array(frames);
			for (let frame = 0; frame < frames; frame++) samples[frame] = buffer.readInt16LE(body + frame * 2 * channels) / 32768;
			return {samples, sampleRate};
		}
		offset = body + size + (size % 2);
	}
	throw new Error(`Narration ${file} has no audio data.`);
};

const HOP_SECONDS = 0.005;
const WINDOW_SECONDS = 0.02;
/** How far from the speech service's boundary a cut may move to find a quiet moment. */
const SEARCH_SECONDS = 0.35;
/** A line is never cut shorter than this at either end while looking for a quiet moment. */
const KEEP_SECONDS = 0.25;

/** Loudness (RMS) every 5 ms. */
const envelope = (samples: Float32Array, sampleRate: number): Float32Array => {
	const hop = Math.round(HOP_SECONDS * sampleRate);
	const half = Math.round((WINDOW_SECONDS * sampleRate) / 2);
	const out = new Float32Array(Math.ceil(samples.length / hop));
	for (let index = 0; index < out.length; index++) {
		const centre = index * hop;
		let sum = 0;
		let count = 0;
		for (let sample = Math.max(0, centre - half); sample < Math.min(samples.length, centre + half); sample += 2) {
			sum += samples[sample] * samples[sample];
			count++;
		}
		out[index] = count ? Math.sqrt(sum / count) : 0;
	}
	return out;
};

/** The quietest moment between two times, in seconds. */
const quietest = (loudness: Float32Array, from: number, to: number): {at: number; level: number} => {
	let best = {at: from, level: Infinity};
	for (let index = Math.max(0, Math.floor(from / HOP_SECONDS)); index <= Math.min(loudness.length - 1, Math.ceil(to / HOP_SECONDS)); index++) {
		// Ties go to the moment closest to the middle of the range, so a long silence is cut in its middle.
		const at = index * HOP_SECONDS;
		const level = loudness[index] + Math.abs(at - (from + to) / 2) * 1e-6;
		if (level < best.level) best = {at, level};
	}
	return best;
};

/**
 * Moves every cut between two lines to the quietest moment near it, and lets
 * the first and last lines run until the voice has really stopped. Lines that
 * already meet in a clear pause keep their cut in the middle of that pause.
 */
export const placeCuts = (segments: readonly LineSegment[], samples: Float32Array, sampleRate: number): LineSegment[] => {
	if (segments.length === 0) return [];
	const loudness = envelope(samples, sampleRate);
	const duration = samples.length / sampleRate;
	const placed = segments.map((segment) => ({...segment}));
	for (let index = 0; index < placed.length - 1; index++) {
		const current = placed[index];
		const next = placed[index + 1];
		const from = Math.max(current.startSeconds + KEEP_SECONDS, Math.min(current.endSeconds, next.startSeconds) - SEARCH_SECONDS);
		const to = Math.min(next.endSeconds - KEEP_SECONDS, Math.max(current.endSeconds, next.startSeconds) + SEARCH_SECONDS);
		if (to <= from) continue;
		const cut = quietest(loudness, from, to).at;
		current.endSeconds = cut;
		next.startSeconds = cut;
	}
	// The ends of the narration: back to a quiet moment before the first word, on to one after the last.
	const first = placed[0];
	first.startSeconds = quietest(loudness, Math.max(0, first.startSeconds - SEARCH_SECONDS), first.startSeconds).at;
	const last = placed[placed.length - 1];
	last.endSeconds = Math.min(duration, quietest(loudness, last.endSeconds, Math.min(duration, last.endSeconds + SEARCH_SECONDS)).at);
	return placed;
};

/** Reads the narration and places its cuts; see placeCuts. */
export const placeCutsInFile = async (segments: readonly LineSegment[], audioFile: string): Promise<LineSegment[]> => {
	const {samples, sampleRate} = await readWav(audioFile);
	return placeCuts(segments, samples, sampleRate);
};
