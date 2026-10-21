import {readFile, writeFile} from 'node:fs/promises';

/**
 * Tone shaping for narration, done in code because the ffmpeg that ships with
 * Remotion has no equaliser filters. Works on 16-bit PCM WAV files.
 *
 * Filters are the standard second-order (biquad) designs from Robert
 * Bristow-Johnson's Audio EQ Cookbook.
 */

export type ToneFilter = {type: 'highpass'; frequency: number; q?: number} | {type: 'lowshelf'; frequency: number; gainDb: number; slope?: number};

type Coefficients = {b0: number; b1: number; b2: number; a1: number; a2: number};

export const biquad = (filter: ToneFilter, sampleRate: number): Coefficients => {
	const w0 = (2 * Math.PI * filter.frequency) / sampleRate;
	const cos = Math.cos(w0);
	const sin = Math.sin(w0);
	if (filter.type === 'highpass') {
		const alpha = sin / (2 * (filter.q ?? Math.SQRT1_2));
		const a0 = 1 + alpha;
		return {b0: (1 + cos) / 2 / a0, b1: -(1 + cos) / a0, b2: (1 + cos) / 2 / a0, a1: (-2 * cos) / a0, a2: (1 - alpha) / a0};
	}
	const A = 10 ** (filter.gainDb / 40);
	const slope = filter.slope ?? 1;
	const alpha = (sin / 2) * Math.sqrt((A + 1 / A) * (1 / slope - 1) + 2);
	const root = 2 * Math.sqrt(A) * alpha;
	const a0 = A + 1 + (A - 1) * cos + root;
	return {
		b0: (A * (A + 1 - (A - 1) * cos + root)) / a0,
		b1: (2 * A * (A - 1 - (A + 1) * cos)) / a0,
		b2: (A * (A + 1 - (A - 1) * cos - root)) / a0,
		a1: (-2 * (A - 1 + (A + 1) * cos)) / a0,
		a2: (A + 1 + (A - 1) * cos - root) / a0,
	};
};

/** Runs the filters over interleaved samples in place, one state per channel. */
export const applyTone = (samples: Float64Array, channels: number, sampleRate: number, filters: readonly ToneFilter[]): void => {
	for (const filter of filters) {
		const {b0, b1, b2, a1, a2} = biquad(filter, sampleRate);
		for (let channel = 0; channel < channels; channel++) {
			let x1 = 0;
			let x2 = 0;
			let y1 = 0;
			let y2 = 0;
			for (let index = channel; index < samples.length; index += channels) {
				const x = samples[index];
				const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
				x2 = x1;
				x1 = x;
				y2 = y1;
				y1 = y;
				samples[index] = y;
			}
		}
	}
};

/** Reads a 16-bit PCM WAV, shapes its tone and writes it back. */
export const toneWav = async (input: string, output: string, filters: readonly ToneFilter[]): Promise<void> => {
	const file = await readFile(input);
	if (file.toString('ascii', 0, 4) !== 'RIFF' || file.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`${input} is not a WAV file.`);
	let offset = 12;
	let channels = 0;
	let sampleRate = 0;
	let bits = 0;
	let data: {start: number; length: number} | null = null;
	while (offset + 8 <= file.length) {
		const id = file.toString('ascii', offset, offset + 4);
		const size = file.readUInt32LE(offset + 4);
		if (id === 'fmt ') {
			channels = file.readUInt16LE(offset + 10);
			sampleRate = file.readUInt32LE(offset + 12);
			bits = file.readUInt16LE(offset + 22);
		} else if (id === 'data') {
			data = {start: offset + 8, length: Math.min(size, file.length - offset - 8)};
			break;
		}
		offset += 8 + size + (size % 2);
	}
	if (!data || bits !== 16 || !channels) throw new Error(`${input}: only 16-bit PCM WAV is supported.`);
	const count = Math.floor(data.length / 2);
	const samples = new Float64Array(count);
	for (let index = 0; index < count; index++) samples[index] = file.readInt16LE(data.start + index * 2) / 32768;
	applyTone(samples, channels, sampleRate, filters);
	const out = Buffer.from(file);
	for (let index = 0; index < count; index++) {
		const value = Math.max(-1, Math.min(1, samples[index]));
		out.writeInt16LE(Math.round(value * 32767), data.start + index * 2);
	}
	await writeFile(output, out);
};
