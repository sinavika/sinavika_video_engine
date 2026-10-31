import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ElevenLabsClient, ElevenLabsError} from '@elevenlabs/elevenlabs-js';
import type {CharacterTiming} from './NarrationScript';
import type {VoiceCast} from './VoiceCasting';

/**
 * What the voice-over generator needs from a speech service. The real one is
 * ElevenLabs; tests pass a stand-in so they run offline and spend no credits.
 */
export type SpeechBackend = {
	/** Ids of the voices this account can generate with. */
	availableVoiceIds: () => Promise<ReadonlySet<string>>;
	/** Characters left in the current billing period, or null when unknown. */
	remainingCharacters: () => Promise<number | null>;
	/** The audio of a whole script, spoken in one go (SPEECH_AUDIO, WAV), and when each of its characters is spoken. */
	narrate: (script: string, cast: VoiceCast) => Promise<Narration>;
	/** Set by stand-ins so their audio is never mistaken for real clips in the cache. */
	cacheTag?: string;
};

export type Narration = {audio: Buffer; timing: CharacterTiming};

/** A speech request that failed. `retryable` tells the caller whether trying again can help. */
export class SpeechError extends Error {
	readonly retryable: boolean;

	constructor(message: string, retryable: boolean, cause?: unknown) {
		super(message, {cause});
		this.name = 'SpeechError';
		this.retryable = retryable;
	}
}

const API_KEY_VARIABLE = 'ELEVENLABS_API_KEY';
const ENV_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env');
/**
 * How speech and sound effects are delivered: lossless 44.1 kHz WAV, the
 * model's own rate. ElevenLabs gives PCM and WAV at 44.1 kHz only from the
 * Pro plan on, which the account has had since 30 Oct 2026; before, Creator's
 * best was MP3 at 192 kbps, so every mix was an encode of an encode. A clip
 * already cached from an MP3 stays as it is; only new clips come lossless.
 */
export const SPEECH_AUDIO = {outputFormat: 'wav_44100', extension: 'wav'} as const;
/** Music: the richest MP3 Eleven Music makes (48 kHz, 320 kbps); `auto` gave 192 kbps. Pieces already made keep their file. */
const MUSIC_OUTPUT_FORMAT = 'mp3_48000_320';
/**
 * Requests ElevenLabs runs at once for this plan (Pro: 10 for the multilingual,
 * v3 and v4 models; Creator had 5). A request over the limit is refused with
 * 429 and tried again (RETRYABLE_STATUSES).
 */
export const SPEECH_CONCURRENCY = 10;
const FREE_TIER = 'free';
const DEFAULT_VOICE_CATEGORY = 'premade';
const RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

const apiKey = (): string => {
	// A local `.env` file is the convenient place for the key during development.
	if (!process.env[API_KEY_VARIABLE] && existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
	const key = process.env[API_KEY_VARIABLE];
	if (!key) {
		throw new SpeechError(`Voice-over needs the ${API_KEY_VARIABLE} environment variable (or a .env file with it).`, false);
	}
	return key;
};

const toSpeechError = (error: unknown): SpeechError => {
	if (error instanceof SpeechError) return error;
	if (error instanceof ElevenLabsError) {
		const detail = (error.body as {detail?: {message?: string; code?: string; status?: string}} | undefined)?.detail;
		const reason = detail?.message ?? error.message;
		const code = detail?.code ?? detail?.status;
		const quota = code === 'quota_exceeded';
		return new SpeechError(
			`ElevenLabs ${error.statusCode ?? ''}${code ? ` ${code}` : ''}: ${reason}`.trim(),
			!quota && RETRYABLE_STATUSES.has(error.statusCode ?? 0),
			error,
		);
	}
	// Network failures and timeouts carry no status; they are worth another try.
	return new SpeechError(error instanceof Error ? error.message : String(error), true, error);
};

let client: ElevenLabsClient | null = null;
const elevenLabs = (): ElevenLabsClient => (client ??= new ElevenLabsClient({apiKey: apiKey()}));

let voiceIds: Promise<ReadonlySet<string>> | null = null;

/** The ElevenLabs text-to-speech service. All narration in the engine goes through here. */
export const ELEVENLABS_SPEECH: SpeechBackend = {
	availableVoiceIds: () => {
		voiceIds ??= (async () => {
			// On the free plan ElevenLabs lists library voices in the account but rejects them
			// over the API (402 paid_plan_required). Only its own default voices are usable there.
			const {tier} = await elevenLabs().user.subscription.get();
			const usable = (category: string | undefined) => tier !== FREE_TIER || category === DEFAULT_VOICE_CATEGORY;
			const ids = new Set<string>();
			let nextPageToken: string | undefined;
			do {
				const page = await elevenLabs().voices.search({pageSize: 100, nextPageToken});
				page.voices.filter((voice) => usable(voice.category)).forEach((voice) => ids.add(voice.voiceId));
				nextPageToken = page.hasMore ? (page.nextPageToken ?? undefined) : undefined;
			} while (nextPageToken);
			return ids;
		})().catch((error) => {
			voiceIds = null;
			throw toSpeechError(error);
		});
		return voiceIds;
	},

	remainingCharacters: async () => {
		try {
			const subscription = await elevenLabs().user.subscription.get();
			return Math.max(0, subscription.characterLimit - subscription.characterCount);
		} catch {
			return null;
		}
	},

	narrate: async (script, cast) => {
		try {
			const {audioBase64, alignment} = await elevenLabs().textToSpeech.convertWithTimestamps(cast.elevenLabsVoiceId, {
				text: script,
				modelId: cast.modelId,
				languageCode: cast.languageCode,
				outputFormat: SPEECH_AUDIO.outputFormat,
				seed: cast.seed,
				voiceSettings: {stability: cast.stability, similarityBoost: cast.similarity, style: cast.style, useSpeakerBoost: true},
			});
			const audio = Buffer.from(audioBase64, 'base64');
			if (audio.length === 0 || !alignment) throw new SpeechError('ElevenLabs returned no audio.', true);
			return {
				audio,
				timing: {
					characters: alignment.characters,
					startSeconds: alignment.characterStartTimesSeconds,
					endSeconds: alignment.characterEndTimesSeconds,
				},
			};
		} catch (error) {
			throw toSpeechError(error);
		}
	},
};

const SOUND_EFFECT_MODEL = 'eleven_text_to_sound_v2';
/** Above the 0.3 default: an effect that sits under a voice has to be the sound described, not a variation of it. */
const SOUND_EFFECT_PROMPT_INFLUENCE = 0.6;

/** A sound effect of the given length, made from a description of it (ElevenLabs Sound Effects), as SPEECH_AUDIO (WAV). */
export const composeSoundEffect = async (description: string, seconds: number): Promise<Buffer> => {
	try {
		const stream = await elevenLabs().textToSoundEffects.convert({
			text: description,
			durationSeconds: seconds,
			promptInfluence: SOUND_EFFECT_PROMPT_INFLUENCE,
			modelId: SOUND_EFFECT_MODEL,
			outputFormat: SPEECH_AUDIO.outputFormat,
		});
		const audio = Buffer.from(await new Response(stream).arrayBuffer());
		if (audio.length === 0) throw new SpeechError('ElevenLabs returned no sound effect.', true);
		return audio;
	} catch (error) {
		throw toSpeechError(error);
	}
};

const MUSIC_MODEL = 'music_v2_5';

/** An instrumental piece of the given length, made from a description of it. MP3 bytes (48 kHz, 320 kbps). */
export const composeMusic = async (description: string, seconds: number): Promise<Buffer> => {
	try {
		const stream = await elevenLabs().music.compose({prompt: description, musicLengthMs: Math.round(seconds * 1000), modelId: MUSIC_MODEL, forceInstrumental: true, outputFormat: MUSIC_OUTPUT_FORMAT});
		const audio = Buffer.from(await new Response(stream).arrayBuffer());
		if (audio.length === 0) throw new SpeechError('ElevenLabs returned no music.', true);
		return audio;
	} catch (error) {
		throw toSpeechError(error);
	}
};
