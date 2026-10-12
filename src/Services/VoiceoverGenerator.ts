import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseMedia} from '@remotion/media-parser';
import {nodeReader} from '@remotion/media-parser/node';
import {VOICEOVER_DIRECTORY, type VoiceoverProvider} from '../Configurations/Voiceover';
import type {VoiceClips} from '../Scenes/Voiceover';
import {SPEECH_SYNTHESIZERS, type SpeechSynthesizer} from './SpeechSynthesizer';

export type VoiceoverSettings = {
	provider: VoiceoverProvider;
	voice: string;
	language: string;
	rate: string;
	pitch: string;
};

export type VoiceLine = {id: string; text: string};

export type VoiceoverOptions = {
	/** The project's `public/` folder; clips are written to its Voiceovers subfolder. */
	publicDirectory: string;
	onProgress?: (done: number, total: number) => void;
	/** Replaces the provider lookup. Used by tests. */
	synthesizer?: SpeechSynthesizer;
};

/** Thrown when a line could not be synthesised after all retries. */
export class VoiceoverError extends Error {
	constructor(line: VoiceLine, cause: unknown) {
		const reason = cause instanceof Error ? cause.message : String(cause);
		super(`Voice-over failed for line "${line.id}": ${reason}`, {cause});
		this.name = 'VoiceoverError';
	}
}

const ATTEMPTS = 5;
const RETRY_DELAY_MILLISECONDS = 2_000;

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const clipFileName = (text: string, settings: VoiceoverSettings): string => {
	const key = [settings.provider, settings.voice, settings.rate, settings.pitch, text].join('|');
	return `${createHash('sha256').update(key).digest('hex').slice(0, 20)}.mp3`;
};

const durationOf = async (file: string): Promise<number> => {
	const {durationInSeconds} = await parseMedia({
		src: file,
		reader: nodeReader,
		fields: {durationInSeconds: true},
		acknowledgeRemotionLicense: true,
	});
	if (!durationInSeconds) throw new Error(`Could not read the duration of ${file}.`);
	return durationInSeconds;
};

/**
 * Produces one audio clip per voice line and reports how long each one is.
 * Clips are cached by a hash of text and voice settings, so re-rendering a
 * video (or another format of it) costs no further synthesis.
 */
export const generateVoiceClips = async (
	lines: readonly VoiceLine[],
	settings: VoiceoverSettings,
	{publicDirectory, onProgress, synthesizer = SPEECH_SYNTHESIZERS[settings.provider]}: VoiceoverOptions,
): Promise<VoiceClips> => {
	const directory = path.join(publicDirectory, VOICEOVER_DIRECTORY);
	await mkdir(directory, {recursive: true});
	const clips: VoiceClips = {};

	for (const [index, line] of lines.entries()) {
		const fileName = clipFileName(line.text, settings);
		const file = path.join(directory, fileName);

		for (let attempt = 1; !existsSync(file); attempt++) {
			try {
				await writeFile(file, await synthesizer({...settings, text: line.text}));
			} catch (error) {
				if (attempt >= ATTEMPTS) throw new VoiceoverError(line, error);
				await wait(RETRY_DELAY_MILLISECONDS * attempt);
			}
		}

		clips[line.id] = {src: `${VOICEOVER_DIRECTORY}/${fileName}`, durationSeconds: await durationOf(file)};
		onProgress?.(index + 1, lines.length);
	}
	return clips;
};
