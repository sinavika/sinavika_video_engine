import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseMedia} from '@remotion/media-parser';
import {nodeReader} from '@remotion/media-parser/node';
import {VOICEOVER_DIRECTORY, VOICE_MODELS} from '../Configurations/Voices';
import type {VoiceClips} from '../Scenes/Voiceover';
import {ELEVENLABS_SPEECH, SpeechError, type SpeechBackend} from './ElevenLabsSpeech';
import {castVoice, type VoiceCast, type VoiceoverRequest} from './VoiceCasting';

export type VoiceLine = {id: string; text: string};

export type VoiceoverOptions = {
	/** The project's `public/` folder; clips are written to its Voiceovers subfolder. */
	publicDirectory: string;
	onProgress?: (done: number, total: number) => void;
	/** Replaces ElevenLabs. Used by tests. */
	speech?: SpeechBackend;
};

export type Voiceover = {clips: VoiceClips; cast: VoiceCast};

/** Thrown when narration could not be produced. The message says which line and why. */
export class VoiceoverError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message, {cause});
		this.name = 'VoiceoverError';
	}
}

const ATTEMPTS = 4;
const RETRY_DELAY_MILLISECONDS = 2_000;

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Everything that changes how a line sounds is part of its cache key; tempo is not, it is applied at playback. */
const clipFileName = (text: string, cast: VoiceCast, cacheTag = ''): string => {
	const key = [cacheTag, cast.elevenLabsVoiceId, cast.modelId, cast.languageCode, cast.stability, cast.similarity, cast.seed, text];
	return `${createHash('sha256').update(key.join('|')).digest('hex').slice(0, 20)}.mp3`;
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

const synthesizeWithRetry = async (line: VoiceLine, cast: VoiceCast, speech: SpeechBackend): Promise<Buffer> => {
	for (let attempt = 1; ; attempt++) {
		try {
			return await speech.synthesize(line.text, cast);
		} catch (error) {
			const retryable = !(error instanceof SpeechError) || error.retryable;
			if (!retryable || attempt >= ATTEMPTS) {
				const reason = error instanceof Error ? error.message : String(error);
				throw new VoiceoverError(`Voice-over failed for line "${line.id}": ${reason}`, error);
			}
			await wait(RETRY_DELAY_MILLISECONDS * attempt);
		}
	}
};

/**
 * Casts a voice and produces one audio clip per line.
 *
 * Clips are cached by a hash of text, voice and delivery, so re-rendering a
 * video, or rendering it in another format, spends no further credits.
 * Before anything is generated the lines are checked against the model's
 * length limit and the account's remaining characters, so a video is never
 * left half narrated.
 */
export const generateVoiceover = async (
	lines: readonly VoiceLine[],
	request: VoiceoverRequest,
	{publicDirectory, onProgress, speech = ELEVENLABS_SPEECH}: VoiceoverOptions,
): Promise<Voiceover> => {
	let cast: VoiceCast;
	try {
		cast = castVoice(request, await speech.availableVoiceIds());
	} catch (error) {
		throw new VoiceoverError(error instanceof Error ? error.message : String(error), error);
	}

	const directory = path.join(publicDirectory, VOICEOVER_DIRECTORY);
	await mkdir(directory, {recursive: true});
	const planned = lines.map((line) => {
		const fileName = clipFileName(line.text, cast, speech.cacheTag);
		return {line, fileName, file: path.join(directory, fileName)};
	});

	const limit = VOICE_MODELS[cast.model].maxCharacters;
	const tooLong = planned.find(({line}) => line.text.length > limit);
	if (tooLong) {
		throw new VoiceoverError(`Line "${tooLong.line.id}" has ${tooLong.line.text.length} characters; ${cast.modelId} accepts at most ${limit}.`);
	}

	const missing = planned.filter(({file}) => !existsSync(file));
	const needed = missing.reduce((total, {line}) => total + line.text.length, 0);
	const remaining = needed > 0 ? await speech.remainingCharacters() : null;
	if (remaining !== null && needed > remaining) {
		throw new VoiceoverError(
			`This narration needs ${needed} new characters but the ElevenLabs account has ${remaining} left this period.`,
		);
	}

	const clips: VoiceClips = {};
	for (const [index, {line, fileName, file}] of planned.entries()) {
		if (!existsSync(file)) await writeFile(file, await synthesizeWithRetry(line, cast, speech));
		clips[line.id] = {
			src: `${VOICEOVER_DIRECTORY}/${fileName}`,
			// The clip is played at the cast's pace, so that is how long it lasts in the video.
			durationSeconds: (await durationOf(file)) / cast.pace,
			playbackRate: cast.pace,
		};
		onProgress?.(index + 1, lines.length);
	}
	return {clips, cast};
};
