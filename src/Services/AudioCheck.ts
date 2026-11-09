import {readFile, rm} from 'node:fs/promises';
import {AUDIO_LEVELS, ffmpeg, measureLoudness} from './AudioLeveling';
import {applyTone} from './AudioTone';

/**
 * Checks a finished video's sound the way a listener hears it (owner, 9 Nov 2026: "ses biraz cızırtı, mini bir arka
 * plan cızırtısı var gibi"). Every render runs it on its file; a problem becomes a render warning.
 *
 *   loudness   the level the platforms play at; a quiet file makes the viewer turn up the volume and hear the hiss
 *   peak       the true-peak ceiling, so AAC playback never clips (heard as crackle)
 *   floor      the pauses: in a voice-only video they are silent; a hiss under the voice lifts them
 *   clicks     a sound that starts or stops on a hard edge instead of from or into silence
 *   sizzle     the band above 14 kHz, where the speech service's own codec leaves a thin metallic hiss
 */

export type AudioReport = {
	integrated: number;
	truePeak: number;
	/** The quietest 2 % of 50 ms windows, in dBFS: the pauses. */
	floorDb: number;
	/** Hard starts or stops, in seconds of the file. */
	clicks: number[];
	/** Energy above 14 kHz against the whole, in dB. */
	sizzleDb: number;
};

/** Limits a finished file is held to. `speech`: a voice-only video (no music bed under the pauses). */
export const AUDIO_LIMITS = {
	loudnessTolerance: 1.5,
	truePeak: -1,
	speechFloorDb: -65,
	clickJumpDb: -45,
	sizzleDb: -36,
} as const;

const RATE = 48000;
const WINDOW_SECONDS = 0.05;
/** Below this a sample counts as silence (a 16-bit file's last bits). */
const SILENCE_DB = -80;
const EDGE_SECONDS = 0.005;
const SIZZLE_HZ = 14000;

const dbOf = (value: number) => 20 * Math.log10(Math.max(value, 1e-12));

/** The file's sound as mono 48 kHz samples. */
const decode = async (file: string): Promise<Float64Array> => {
	const wav = `${file}.check.wav`;
	try {
		await ffmpeg(['-y', '-i', file, '-vn', '-ac', '1', '-ar', String(RATE), '-c:a', 'pcm_s16le', '-map_metadata', '-1', wav]);
		const buffer = await readFile(wav);
		let offset = 12;
		while (offset + 8 <= buffer.length) {
			const size = buffer.readUInt32LE(offset + 4);
			if (buffer.toString('ascii', offset, offset + 4) === 'data') {
				const body = offset + 8;
				const count = Math.floor(Math.min(size, buffer.length - body) / 2);
				return Float64Array.from({length: count}, (_, index) => buffer.readInt16LE(body + index * 2) / 32768);
			}
			offset += 8 + size + (size % 2);
		}
		return new Float64Array(0);
	} finally {
		await rm(wav, {force: true});
	}
};

/** RMS of each 50 ms window, in dBFS. */
const windowLevels = (samples: Float64Array): number[] => {
	const size = Math.round(WINDOW_SECONDS * RATE);
	const levels: number[] = [];
	for (let start = 0; start + size <= samples.length; start += size) {
		let sum = 0;
		for (let index = start; index < start + size; index++) sum += samples[index] * samples[index];
		levels.push(dbOf(Math.sqrt(sum / size)));
	}
	return levels;
};

/** Where a sound jumps out of silence, or into it, on a hard edge (louder than `clickJumpDb` within three samples). */
export const findClicks = (samples: Float64Array, sampleRate = RATE): number[] => {
	const silent = 10 ** (SILENCE_DB / 20);
	const jump = 10 ** (AUDIO_LIMITS.clickJumpDb / 20);
	const edge = Math.round(EDGE_SECONDS * sampleRate);
	const clicks: number[] = [];
	let quietRun = 0;
	for (let index = 0; index < samples.length; index++) {
		const level = Math.abs(samples[index]);
		if (level < silent) {
			// Into silence: the samples just before a long quiet run end loud.
			if (quietRun === 0 && index >= 3 && Math.max(Math.abs(samples[index - 1]), Math.abs(samples[index - 2]), Math.abs(samples[index - 3])) > jump) {
				let quietAfter = 0;
				while (quietAfter < edge && index + quietAfter < samples.length && Math.abs(samples[index + quietAfter]) < silent) quietAfter++;
				if (quietAfter >= edge) clicks.push(index / sampleRate);
			}
			quietRun++;
			continue;
		}
		// Out of silence: a long quiet run, then a loud sample at once.
		if (quietRun >= edge && Math.max(level, Math.abs(samples[index + 1] ?? 0), Math.abs(samples[index + 2] ?? 0)) > jump) clicks.push(index / sampleRate);
		quietRun = 0;
	}
	return clicks.filter((at, index) => index === 0 || at - clicks[index - 1] > 0.05);
};

/** Energy above 14 kHz against the whole, in dB (three cascaded high-pass filters, about 36 dB per octave). */
export const sizzleOf = (samples: Float64Array, sampleRate = RATE): number => {
	const high = Float64Array.from(samples);
	applyTone(high, 1, sampleRate, [1, 2, 3].map(() => ({type: 'highpass', frequency: SIZZLE_HZ}) as const));
	const energy = (values: Float64Array) => values.reduce((sum, value) => sum + value * value, 0);
	return 10 * Math.log10(Math.max(energy(high), 1e-20) / Math.max(energy(samples), 1e-20));
};

/** The quietest 2 % of the file's 50 ms windows, in dBFS. */
export const floorOf = (samples: Float64Array): number => {
	const levels = windowLevels(samples).sort((a, b) => a - b);
	return levels.length ? levels[Math.floor(levels.length * 0.02)] : -120;
};

/** Measures a file's sound. Null when it has none to measure (a silent track). */
export const inspectAudio = async (file: string): Promise<AudioReport | null> => {
	const loudness = await measureLoudness(file);
	if (!loudness) return null;
	const samples = await decode(file);
	return {integrated: loudness.integrated, truePeak: loudness.truePeak, floorDb: floorOf(samples), clicks: findClicks(samples), sizzleDb: sizzleOf(samples)};
};

/** What is wrong with a finished file's sound, in words for the render's warnings; empty when it is clean. */
export const audioProblems = (report: AudioReport, speech: boolean): string[] => {
	const target = speech ? AUDIO_LEVELS.speechMaster.integrated : AUDIO_LEVELS.master.integrated;
	const problems: string[] = [];
	if (Math.abs(report.integrated - target) > AUDIO_LIMITS.loudnessTolerance) problems.push(`Ses düzeyi ${report.integrated.toFixed(1)} LUFS; hedef ${target} LUFS (kısık ses açılınca hışırtı duyulur).`);
	if (report.truePeak > AUDIO_LIMITS.truePeak) problems.push(`Ses tepe noktası ${report.truePeak.toFixed(1)} dBTP; tavan ${AUDIO_LIMITS.truePeak} dBTP (oynatırken cızırtı yapar).`);
	if (speech && report.floorDb > AUDIO_LIMITS.speechFloorDb) problems.push(`Duraklamalarda arka plan sesi ${report.floorDb.toFixed(1)} dBFS; en çok ${AUDIO_LIMITS.speechFloorDb} dBFS (hışırtı).`);
	if (report.clicks.length) problems.push(`${report.clicks.length} yerde ses sert başlıyor ya da kesiliyor (tık): ${report.clicks.slice(0, 5).map((at) => `${at.toFixed(2)} sn`).join(', ')}.`);
	if (speech && report.sizzleDb > AUDIO_LIMITS.sizzleDb) problems.push(`14 kHz üstü enerji ${report.sizzleDb.toFixed(1)} dB; en çok ${AUDIO_LIMITS.sizzleDb} dB (ince cızırtı).`);
	return problems;
};
