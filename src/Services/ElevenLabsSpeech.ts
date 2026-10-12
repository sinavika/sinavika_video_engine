import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ElevenLabsClient, ElevenLabsError} from '@elevenlabs/elevenlabs-js';
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
	/** MP3 bytes for one line. */
	synthesize: (text: string, cast: VoiceCast) => Promise<Buffer>;
	/** Set by stand-ins so their audio is never mistaken for real clips in the cache. */
	cacheTag?: string;
};

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
const OUTPUT_FORMAT = 'mp3_44100_128';
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

	synthesize: async (text, cast) => {
		try {
			const stream = await elevenLabs().textToSpeech.convert(cast.elevenLabsVoiceId, {
				text,
				modelId: cast.modelId,
				languageCode: cast.languageCode,
				outputFormat: OUTPUT_FORMAT,
				seed: cast.seed,
				voiceSettings: {stability: cast.stability, similarityBoost: cast.similarity},
			});
			const audio = Buffer.from(await new Response(stream).arrayBuffer());
			if (audio.length === 0) throw new SpeechError('ElevenLabs returned no audio.', true);
			return audio;
		} catch (error) {
			throw toSpeechError(error);
		}
	},
};
