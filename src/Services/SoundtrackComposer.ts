import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

/**
 * Original music and sound design, synthesised in code: no samples, no
 * licences. The music is arranged around the narration: it stays far below
 * the voice (the bed sits roughly 15 dB under spoken words), a whoosh leads
 * into every spoken line, a soft hit lands on every scene change, and the
 * last chord rings out under the closing card.
 *
 * Everything is deterministic: the same cues always give the same audio.
 */
export type SoundtrackCues = {
	durationSeconds: number;
	/** When each scene after the first begins. */
	sceneStarts: number[];
	/** When each spoken line begins. */
	lineStarts: number[];
	/** When the closing card begins; the rhythm stops and the last chord rings from here. */
	closingStart: number;
};

const RATE = 48_000;
const BEAT_SECONDS = 0.6;
const BAR_BEATS = 4;

/** F – C – Dm – B♭, one bar each: bright and forward without sounding like a jingle. */
const CHORDS: readonly {notes: number[]; bass: number}[] = [
	{notes: [53, 57, 60], bass: 41},
	{notes: [52, 55, 60], bass: 36},
	{notes: [53, 57, 62], bass: 38},
	{notes: [53, 58, 62], bass: 34},
];
const CLOSING_CHORD = [41, 53, 57, 60, 67];

const frequency = (note: number): number => 440 * 2 ** ((note - 69) / 12);

type Mix = {left: Float32Array; right: Float32Array};

/** Adds one sound to the mix. `sample(t)` is its waveform at t seconds after its start, already enveloped. */
const add = (mix: Mix, startSeconds: number, lengthSeconds: number, pan: number, sample: (t: number) => number): void => {
	const first = Math.max(0, Math.round(startSeconds * RATE));
	const last = Math.min(mix.left.length, first + Math.round(lengthSeconds * RATE));
	const [leftGain, rightGain] = [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];
	for (let index = first; index < last; index++) {
		const value = sample((index - first) / RATE);
		mix.left[index] += value * leftGain;
		mix.right[index] += value * rightGain;
	}
};

/** Reproducible noise, so two renders of the same video sound the same. */
const createNoise = (seed: number) => {
	let state = seed >>> 0;
	return (): number => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 2 ** 31 - 1;
	};
};

const TAU = Math.PI * 2;
const soft = (phase: number): number => Math.sin(phase) + 0.32 * Math.sin(2 * phase) + 0.12 * Math.sin(3 * phase);

const pad = (mix: Mix, start: number, length: number, notes: number[], gain: number, release = 0.7): void => {
	notes.forEach((note, voice) => {
		for (const detune of [-0.004, 0.004]) {
			const hz = frequency(note) * (1 + detune);
			add(mix, start, length + release, (voice - 1) * 0.35 + detune * 60, (t) => {
				const envelope = Math.min(1, t / 0.45) * (t < length ? 1 : Math.max(0, 1 - (t - length) / release));
				return soft(TAU * hz * t) * envelope * gain;
			});
		}
	});
};

const pluck = (mix: Mix, start: number, note: number, gain: number, pan: number): void => {
	const hz = frequency(note);
	add(mix, start, 0.5, pan, (t) => (Math.sin(TAU * hz * t) + 0.2 * Math.sin(TAU * hz * 3 * t)) * Math.exp(-t * 9) * Math.min(1, t / 0.004) * gain);
};

const bass = (mix: Mix, start: number, note: number, gain: number): void => {
	const hz = frequency(note);
	add(mix, start, 0.55, 0, (t) => (Math.sin(TAU * hz * t) + 0.25 * Math.sin(TAU * hz * 2 * t)) * Math.exp(-t * 5) * Math.min(1, t / 0.006) * gain);
};

const kick = (mix: Mix, start: number, gain: number): void => {
	// Phase of a sine whose pitch falls from 120 Hz towards 46 Hz.
	add(mix, start, 0.22, 0, (t) => Math.sin(TAU * (46 * t + (74 / 28) * (1 - Math.exp(-t * 28)))) * Math.exp(-t * 17) * gain);
};

const hat = (mix: Mix, start: number, gain: number, noise: () => number): void => {
	let previous = 0;
	add(mix, start, 0.05, 0.25, (t) => {
		const value = noise();
		const bright = value - previous;
		previous = value;
		return bright * Math.exp(-t * 70) * gain;
	});
};

/** Air moving across the stereo field, peaking exactly on the cue. */
const whoosh = (mix: Mix, cue: number, gain: number, noise: () => number): void => {
	const [lead, tail] = [0.32, 0.22];
	const length = lead + tail;
	let [low, band] = [0, 0];
	const first = Math.max(0, Math.round((cue - lead) * RATE));
	const last = Math.min(mix.left.length, first + Math.round(length * RATE));
	for (let index = first; index < last; index++) {
		const t = (index - first) / RATE;
		const progress = t / length;
		// A state-variable band-pass whose centre sweeps upwards.
		const coefficient = 2 * Math.sin((Math.PI * (350 + 3600 * progress ** 2)) / RATE);
		const high = noise() - low - 0.6 * band;
		band += coefficient * high;
		low += coefficient * band;
		const envelope = t < lead ? (t / lead) ** 2 : Math.max(0, 1 - (t - lead) / tail) ** 2;
		const pan = -0.7 + 1.4 * progress;
		mix.left[index] += band * envelope * gain * Math.cos(((pan + 1) * Math.PI) / 4);
		mix.right[index] += band * envelope * gain * Math.sin(((pan + 1) * Math.PI) / 4);
	}
};

const hit = (mix: Mix, cue: number, gain: number, noise: () => number): void => {
	add(mix, cue, 0.5, 0, (t) => Math.sin(TAU * 62 * t) * Math.exp(-t * 8) * gain + (t < 0.012 ? noise() * 0.35 * gain * (1 - t / 0.012) : 0));
};

/** The whole soundtrack as stereo samples. */
export const composeSoundtrack = ({durationSeconds, sceneStarts, lineStarts, closingStart}: SoundtrackCues): Mix => {
	const length = Math.ceil(durationSeconds * RATE);
	const mix: Mix = {left: new Float32Array(length), right: new Float32Array(length)};
	const noise = createNoise(20261013);
	const rhythmStart = sceneStarts[0] ?? 0;
	const barSeconds = BEAT_SECONDS * BAR_BEATS;

	for (let bar = 0; bar * barSeconds < closingStart; bar++) {
		const start = bar * barSeconds;
		const chord = CHORDS[bar % CHORDS.length];
		const barLength = Math.min(barSeconds, closingStart - start);
		pad(mix, start, barLength, chord.notes, 0.016);

		for (let eighth = 0; eighth < BAR_BEATS * 2; eighth++) {
			const time = start + eighth * (BEAT_SECONDS / 2);
			if (time >= closingStart) break;
			pluck(mix, time, chord.notes[eighth % chord.notes.length] + 12, 0.03, eighth % 2 === 0 ? -0.45 : 0.45);
			if (time < rhythmStart) continue;
			if (eighth % 2 === 0) kick(mix, time, 0.11);
			else hat(mix, time, 0.014, noise);
			if (eighth === 0 || eighth === 4 || eighth === 7) bass(mix, time, chord.bass, 0.075);
		}
	}

	// The closing: the rhythm stops, one wide chord rings out under the end card.
	pad(mix, closingStart, 0.6, CLOSING_CHORD, 0.02, Math.max(0.5, durationSeconds - closingStart - 0.6));
	CLOSING_CHORD.forEach((note, index) => pluck(mix, closingStart + index * 0.07, note + 12, 0.035, index % 2 === 0 ? -0.3 : 0.3));

	lineStarts.forEach((cue) => whoosh(mix, cue, 0.055, noise));
	[...sceneStarts, closingStart].forEach((cue) => hit(mix, cue, 0.12, noise));

	// A short fade at both ends, so the file never starts or stops with a click.
	const fade = Math.round(0.03 * RATE);
	const tail = Math.round(0.35 * RATE);
	for (const channel of [mix.left, mix.right]) {
		for (let index = 0; index < fade; index++) channel[index] *= index / fade;
		for (let index = 0; index < tail; index++) channel[length - 1 - index] *= index / tail;
	}
	return mix;
};

/** Writes the soundtrack as a 16-bit stereo WAV. */
export const writeSoundtrack = async (cues: SoundtrackCues, outputPath: string): Promise<void> => {
	const {left, right} = composeSoundtrack(cues);
	const dataBytes = left.length * 4;
	const wav = Buffer.alloc(44 + dataBytes);
	wav.write('RIFF', 0, 'latin1');
	wav.writeUInt32LE(36 + dataBytes, 4);
	wav.write('WAVEfmt ', 8, 'latin1');
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(2, 22);
	wav.writeUInt32LE(RATE, 24);
	wav.writeUInt32LE(RATE * 4, 28);
	wav.writeUInt16LE(4, 32);
	wav.writeUInt16LE(16, 34);
	wav.write('data', 36, 'latin1');
	wav.writeUInt32LE(dataBytes, 40);
	for (let index = 0; index < left.length; index++) {
		wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[index])) * 32767), 44 + index * 4);
		wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[index])) * 32767), 46 + index * 4);
	}
	await mkdir(path.dirname(outputPath), {recursive: true});
	await writeFile(outputPath, wav);
};
