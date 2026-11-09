import {rm} from 'node:fs/promises';
import {RenderInternals} from '@remotion/renderer';
import {applyTone, limitPeaks, processWav, toneWav, type ToneFilter} from './AudioTone';

/**
 * Levels for everything that goes into a video's sound, in one place.
 *
 * Sounds are added together when a video is rendered, and a sum above full
 * scale is cut off: that is heard as crackle. Speech services deliver their
 * audio at full scale, so narration is turned down before it is mixed, and
 * music is set far enough below it to stay out of the way. The finished mix
 * is then brought up to the level the platforms play at.
 */
export const AUDIO_LEVELS = {
	/** Narration going into the mix: quiet enough that music on top cannot push the sum over full scale. */
	narration: {integrated: -20, truePeak: -4},
	/** Music under narration: at least 15 dB below the voice. */
	musicBed: {integrated: -36, truePeak: -12},
	/** The published file. The ceiling is below the -1 dBTP the platforms ask for, because AAC encoding overshoots a little. */
	master: {integrated: -14, truePeak: -1.5, range: 11},
	/**
	 * A voice-only video (lessons, episode 0): -16 LUFS, the level spoken-word platforms ask for. Narration enters the
	 * mix at -20 with its peaks at -4, so a video with no music bed came out near -26 LUFS: the viewer turned it up and
	 * heard the hiss (owner, 9 Nov 2026). It is now raised and its peaks limited here.
	 */
	speechMaster: {integrated: -16, truePeak: -1.5},
	/** A mix that measures above this before mastering has most likely been cut off. */
	clippingTruePeak: -0.3,
} as const;

/**
 * The tone narration is given before it is levelled: the low end is cut, so
 * the voice sounds clear and close on phone speakers rather than boomy. Its
 * id is part of a narration's cache key, so changing the tone regenerates.
 */
export const NARRATION_TONE: {id: string; filters: readonly ToneFilter[]} = {
	id: 'tone-lowcut-1',
	filters: [
		{type: 'highpass', frequency: 100},
		{type: 'lowshelf', frequency: 180, gainDb: -4},
	],
};

/** Decodes `input` to 48 kHz 16-bit WAV, shapes its tone, and levels it into `output`. */
export const toneAndLevel = async (input: string, output: string, level: AudioLevel, filters: readonly ToneFilter[]): Promise<void> => {
	const decoded = `${output}.decoded.wav`;
	try {
		await ffmpeg(['-y', '-i', input, '-vn', '-ar', '48000', '-c:a', 'pcm_s16le', '-map_metadata', '-1', '-fflags', '+bitexact', decoded]);
		if (filters.length) await toneWav(decoded, decoded, filters);
		await levelAudio(decoded, output, level);
	} finally {
		await rm(decoded, {force: true});
	}
};

type AudioLevel = {integrated: number; truePeak: number};

export const ffmpeg = (args: string[]) => RenderInternals.callFf({bin: 'ffmpeg', args, indent: false, logLevel: 'error', binariesDirectory: null, cancelSignal: undefined});

type Loudness = {integrated: number; truePeak: number; range: number; threshold: number; offset: number};

const MEASURE_TARGET = `I=${AUDIO_LEVELS.master.integrated}:TP=${AUDIO_LEVELS.master.truePeak}:LRA=${AUDIO_LEVELS.master.range}`;

/** Loudness of a file's audio, or null when it cannot be measured (silence, no audio). */
export const measureLoudness = async (file: string): Promise<Loudness | null> => {
	const scratch = `${file}.measure.wav`;
	const {stderr} = await ffmpeg(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', `loudnorm=${MEASURE_TARGET}:print_format=json`, '-f', 'wav', '-y', scratch]).catch((error: {stderr?: string}) => ({stderr: error.stderr ?? ''}));
	await rm(scratch, {force: true});
	const report = /\{[^{}]*"input_i"[^{}]*\}/.exec(stderr ?? '');
	if (!report) return null;
	const values = JSON.parse(report[0]) as Record<string, string>;
	const loudness = {
		integrated: Number(values.input_i),
		truePeak: Number(values.input_tp),
		range: Number(values.input_lra),
		threshold: Number(values.input_thresh),
		offset: Number(values.target_offset),
	};
	return Object.values(loudness).every(Number.isFinite) ? loudness : null;
};

/**
 * Writes `input` as a 48 kHz WAV at the given level. The change is one fixed
 * gain, so timing and dynamics are untouched; the gain is whichever is
 * smaller of what the loudness and the peak allow. `filters` run first
 * (trimming, fades).
 */
export const levelAudio = async (input: string, output: string, level: AudioLevel, filters: string[] = []): Promise<void> => {
	const measured = await measureLoudness(input);
	const gain = measured ? Math.min(level.integrated - measured.integrated, level.truePeak - measured.truePeak) : 0;
	await ffmpeg(['-y', '-i', input, '-vn', '-af', [...filters, `volume=${gain.toFixed(2)}dB`].join(','), '-ar', '48000', '-c:a', 'pcm_s16le', '-map_metadata', '-1', '-fflags', '+bitexact', output]);
};

/** The filter that masters a mix of voice, music and effects to the published level, set from a measurement of that mix. */
export const masterFilter = (measured: Loudness | null): string =>
	measured
		? `loudnorm=${MEASURE_TARGET}:measured_I=${measured.integrated}:measured_TP=${measured.truePeak}:measured_LRA=${measured.range}:measured_thresh=${measured.threshold}:offset=${measured.offset}:linear=true`
		: `loudnorm=${MEASURE_TARGET}`;

/**
 * The tone a voice-only video is given when it is mastered: an eighth-order Butterworth low-pass at 12.5 kHz, four
 * biquads with the Butterworth Q values. Flat through 10 kHz (under 0.2 dB), about 13 dB down at 15 kHz and 17 dB at
 * 16 kHz: the speech service's codec leaves a thin metallic hiss in that band, where speech carries nothing.
 */
export const SPEECH_MASTER_TONE: readonly ToneFilter[] = [0.5098, 0.6013, 0.9, 2.5629].map((q) => ({type: 'lowpass', frequency: 12500, q}));

/**
 * Masters a voice-only video's sound (a 16-bit WAV) in code, as the ffmpeg that ships with Remotion has no limiter:
 * the hiss band is cut, one fixed gain brings it to -16 LUFS, and a look-ahead limiter holds the few peaks that would
 * pass the ceiling (0.7 dB under the true-peak ceiling covers what lies between samples). One gain and no
 * compression, so the pauses stay as silent as they were.
 */
export const masterSpeechWav = async (input: string, output: string, measured: Loudness): Promise<void> => {
	const {integrated, truePeak} = AUDIO_LEVELS.speechMaster;
	const gain = 10 ** ((integrated - measured.integrated) / 20);
	const ceiling = 10 ** ((truePeak - 0.7) / 20);
	await processWav(input, output, (samples, channels, sampleRate) => {
		applyTone(samples, channels, sampleRate, SPEECH_MASTER_TONE);
		for (let index = 0; index < samples.length; index++) samples[index] *= gain;
		limitPeaks(samples, channels, sampleRate, ceiling);
	});
};

