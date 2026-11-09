import {writeFileSync} from 'node:fs';

/** Writes mono samples in [-1, 1] as a 16-bit PCM WAV, for audio tests. */
export const writeWav = (file: string, samples: Float64Array, sampleRate = 48000): void => {
	const data = Buffer.alloc(samples.length * 2);
	samples.forEach((value, index) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), index * 2));
	const header = Buffer.alloc(44);
	header.write('RIFF', 0, 'ascii');
	header.writeUInt32LE(36 + data.length, 4);
	header.write('WAVE', 8, 'ascii');
	header.write('fmt ', 12, 'ascii');
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(1, 20);
	header.writeUInt16LE(1, 22);
	header.writeUInt32LE(sampleRate, 24);
	header.writeUInt32LE(sampleRate * 2, 28);
	header.writeUInt16LE(2, 32);
	header.writeUInt16LE(16, 34);
	header.write('data', 36, 'ascii');
	header.writeUInt32LE(data.length, 40);
	writeFileSync(file, Buffer.concat([header, data]));
};

/**
 * Speech-like test sound: syllables of a few harmonics (150 Hz voice, formants near 700 and 2,500 Hz) with soft
 * edges, separated by pauses of digital silence, the way the speech service delivers narration.
 */
export const speechLike = (seconds: number, peak: number, sampleRate = 48000): Float64Array => {
	const samples = new Float64Array(Math.round(seconds * sampleRate));
	const syllable = Math.round(0.22 * sampleRate);
	const pause = Math.round(0.12 * sampleRate);
	const fade = Math.round(0.02 * sampleRate);
	let random = 1;
	const next = () => (random = (random * 16807) % 2147483647) / 2147483647;
	for (let start = 0; start + syllable < samples.length; start += syllable + pause * (1 + Math.floor(next() * 3))) {
		const loud = peak * (0.35 + 0.65 * next());
		for (let index = 0; index < syllable; index++) {
			const t = index / sampleRate;
			const edge = Math.min(1, index / fade, (syllable - index) / fade);
			const tone = 0.6 * Math.sin(2 * Math.PI * 150 * t) + 0.3 * Math.sin(2 * Math.PI * 700 * t) + 0.1 * Math.sin(2 * Math.PI * 2500 * t);
			samples[start + index] = loud * edge * tone;
		}
	}
	return samples;
};
