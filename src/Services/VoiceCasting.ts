import {
	BRAND_VOICES,
	VOICES,
	VOICE_LANGUAGE,
	VOICE_MODELS,
	VOICE_MODEL_BY_ORIGIN,
	VOICE_PROFILES,
	VOICE_SEED,
	type VoiceKey,
	type VoiceModelKey,
	type VoiceProfile,
	type VoiceProfileKey,
} from '../Configurations/Voices';

/** What a job asks for: a role, optionally with a specific voice, model or tempo. */
export type VoiceoverRequest = {
	profile: VoiceProfileKey;
	voice?: VoiceKey;
	model?: VoiceModelKey;
	pace?: number;
	/** Accept a multilingual stand-in when no native Turkish voice can be used. Off unless the job says so. */
	standIn?: boolean;
	/** Narration language; Turkish unless the job says otherwise. */
	language?: 'tr' | 'en';
};

/** A fully decided voice: everything the speech service needs to produce a narration. */
export type VoiceCast = {
	profile: VoiceProfileKey;
	voice: VoiceKey;
	voiceName: string;
	elevenLabsVoiceId: string;
	/** False when the cast voice is a multilingual stand-in rather than a native Turkish speaker. */
	native: boolean;
	model: VoiceModelKey;
	modelId: string;
	/** Omitted for models that do not take a language hint. */
	languageCode?: string;
	stability: number;
	similarity: number;
	style: number;
	pace: number;
	seed: number;
	/** Why this voice was chosen when it is not the brand's first choice. */
	note?: string;
};

/** Thrown when no acceptable voice can be used with the account. */
export class VoiceCastingError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'VoiceCastingError';
	}
}

const NATIVE_VOICE_HELP =
	'Native Turkish voices are ElevenLabs library voices: the account needs a paid plan (or API credits) and the voice added to "My Voices". ' +
	'Run "npm run voices" to see what the account can use. To narrate with a non-native stand-in anyway, set "voiceover": {"standIn": true} in the job.';

/**
 * Picks the voice for a request.
 *
 * Everything is narrated by the brand voice: the first native Turkish voice
 * of BRAND_VOICES the account can use. If none is usable the request fails
 * rather than quietly falling back to a multilingual voice, because a
 * non-native voice is exactly what makes narration sound artificial. A job
 * can accept a stand-in explicitly, and can always name a voice itself.
 */
export const castVoice = (request: VoiceoverRequest, availableVoiceIds: ReadonlySet<string>): VoiceCast => {
	const profile: VoiceProfile = VOICE_PROFILES[request.profile];
	const usable = (key: VoiceKey) => availableVoiceIds.has(VOICES[key].elevenLabsId);

	let chosen: VoiceKey | undefined;
	let note: string | undefined;
	if (request.voice) {
		if (!usable(request.voice)) {
			throw new VoiceCastingError(`Voice "${request.voice}" (${VOICES[request.voice].name}) is not available in this ElevenLabs account. ${NATIVE_VOICE_HELP}`);
		}
		chosen = request.voice;
	} else {
		chosen = BRAND_VOICES.find(usable);
		if (chosen && chosen !== BRAND_VOICES[0]) {
			note = `Brand voice ${VOICES[BRAND_VOICES[0]].name} is not in the account; using ${VOICES[chosen].name}, also a native Turkish voice.`;
		}
		if (!chosen && request.standIn) {
			chosen = profile.standIns.find(usable);
			if (chosen) note = `No native Turkish voice is usable; ${VOICES[chosen].name} is a multilingual stand-in and will not sound native.`;
		}
		if (!chosen) {
			throw new VoiceCastingError(`No native Turkish voice (${BRAND_VOICES.map((key) => VOICES[key].name).join(', ')}) is usable in this ElevenLabs account. ${NATIVE_VOICE_HELP}`);
		}
	}

	const voice = VOICES[chosen];
	const modelKey = request.model ?? VOICE_MODEL_BY_ORIGIN[voice.origin];
	const model = VOICE_MODELS[modelKey];
	return {
		profile: request.profile,
		voice: chosen,
		voiceName: voice.name,
		elevenLabsVoiceId: voice.elevenLabsId,
		native: voice.origin === 'native',
		model: modelKey,
		modelId: model.id,
		languageCode: model.acceptsLanguageCode ? (request.language ?? VOICE_LANGUAGE) : undefined,
		stability: profile.stability,
		similarity: profile.similarity,
		style: profile.style,
		pace: request.pace ?? profile.pace,
		seed: VOICE_SEED,
		note,
	};
};
