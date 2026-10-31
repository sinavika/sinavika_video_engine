/**
 * Makes the engine's sound effects (src/Configurations/SoundEffects.ts) that
 * do not exist yet, with ElevenLabs Sound Effects, and levels them.
 *
 *   npm run sound-effects               (only the missing ones; spends credits only for those)
 *   npm run sound-effects -- --relevel  (levels the kept ElevenLabs files again; spends nothing)
 *
 * ElevenLabs' file is kept next to the levelled one, in `Source/`, so a new
 * level never needs a new generation. To make an effect again, delete both.
 */
import {existsSync} from 'node:fs';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {SOUND_EFFECTS, type SoundEffect} from '../src/Configurations/SoundEffects';
import {ffmpeg} from '../src/Services/AudioLeveling';
import {composeSoundEffect, SPEECH_AUDIO} from '../src/Services/ElevenLabsSpeech';

const {values} = parseArgs({options: {relevel: {type: 'boolean', default: false}}});

const PUBLIC_DIRECTORY = path.resolve('public');
const RATE = 48_000;
/** Below this the start of the file counts as silence and is cut. */
const SILENCE_DB = -45;
/** A generation whose peak is below this is a failed one; raising it would raise its noise. */
const QUIETEST_PEAK_DB = -24;
/** Kept before the first sound, so its attack is not cut. */
const PRE_ROLL_SECONDS = 0.005;
/** The end fades out over this long, so a cut tail never clicks. */
const FADE_OUT_SECONDS = 0.04;

/** Where ElevenLabs' own file is kept: a WAV since the Pro plan (SPEECH_AUDIO); an effect made earlier keeps its MP3. */
const sourceOf = (effect: SoundEffect) => {
	const named = (extension: string) => path.join(PUBLIC_DIRECTORY, path.dirname(effect.file), 'Source', `${path.basename(effect.file, '.wav')}.elevenlabs.${extension}`);
	return existsSync(named('mp3')) ? named('mp3') : named(SPEECH_AUDIO.extension);
};

const decibels = (sample: number) => 20 * Math.log10(Math.max(Math.abs(sample), 1) / 32_768);

const wav = (samples: Int16Array): Buffer => {
	const header = Buffer.alloc(44);
	header.write('RIFF', 0);
	header.writeUInt32LE(36 + samples.byteLength, 4);
	header.write('WAVEfmt ', 8);
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(1, 20);
	header.writeUInt16LE(1, 22);
	header.writeUInt32LE(RATE, 24);
	header.writeUInt32LE(RATE * 2, 28);
	header.writeUInt16LE(2, 32);
	header.writeUInt16LE(16, 34);
	header.write('data', 36);
	header.writeUInt32LE(samples.byteLength, 40);
	return Buffer.concat([header, Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength)]);
};

/** The samples of a 16-bit WAV file (its `data` chunk). */
const pcmOf = (file: Buffer): Int16Array => {
	let offset = 12;
	while (offset + 8 <= file.length) {
		const size = file.readUInt32LE(offset + 4);
		if (file.toString('ascii', offset, offset + 4) === 'data') {
			const data = file.subarray(offset + 8, Math.min(file.length, offset + 8 + size));
			return new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + (data.byteLength & ~1)));
		}
		offset += 8 + size + (size % 2);
	}
	throw new Error('No data chunk in the decoded WAV.');
};

/** Mono 48 kHz WAV: leading silence cut, one gain to the effect's peak, the end faded. */
const level = async (source: string, effect: SoundEffect): Promise<string> => {
	const decoded = `${source}.decoded.wav`;
	await ffmpeg(['-y', '-i', source, '-vn', '-ac', '1', '-ar', String(RATE), '-c:a', 'pcm_s16le', decoded]);
	const bytes = await readFile(decoded);
	await rm(decoded, {force: true});
	const input = pcmOf(bytes);
	const first = input.findIndex((sample) => decibels(sample) > SILENCE_DB);
	const loudest = input.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
	if (first < 0 || decibels(loudest) < QUIETEST_PEAK_DB) {
		throw new Error(`${effect.file}: ElevenLabs returned near silence (peak ${decibels(loudest).toFixed(1)} dBFS). Delete ${source} and describe the sound more plainly.`);
	}
	const trimmed = input.slice(Math.max(0, first - Math.round(PRE_ROLL_SECONDS * RATE)));
	const peak = trimmed.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
	const gain = 10 ** ((effect.peakDb - decibels(peak)) / 20);
	const fade = Math.min(Math.round(FADE_OUT_SECONDS * RATE), trimmed.length);
	const output = trimmed.map((sample, index) => {
		const left = trimmed.length - index;
		return Math.max(-32_768, Math.min(32_767, Math.round(sample * gain * (left < fade ? left / fade : 1))));
	});
	await writeFile(path.join(PUBLIC_DIRECTORY, effect.file), wav(output));
	return `${(trimmed.length / RATE).toFixed(2)} s, ${decibels(peak).toFixed(1)} → ${effect.peakDb} dBFS`;
};

for (const [id, effect] of Object.entries(SOUND_EFFECTS) as Array<[string, SoundEffect]>) {
	const target = path.join(PUBLIC_DIRECTORY, effect.file);
	const source = sourceOf(effect);
	if (existsSync(target) && !values.relevel) {
		console.log(`${id}: var (${effect.file})`);
		continue;
	}
	if (!existsSync(source)) {
		console.log(`${id}: ElevenLabs'te üretiliyor…`);
		await mkdir(path.dirname(source), {recursive: true});
		await writeFile(source, await composeSoundEffect(effect.description, effect.seconds));
	}
	console.log(`${id}: ${effect.file} (${await level(source, effect)})`);
}
process.exit(0);
