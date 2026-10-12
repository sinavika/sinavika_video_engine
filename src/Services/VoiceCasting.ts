import {
	DEFAULT_VOICE_MODEL,
	VOICES,
	VOICE_LANGUAGE,
	VOICE_MODELS,
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
};

/** A fully decided voice: everything the speech service needs to produce a line. */
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
	pace: number;
	seed: number;
	/** Why this voice was chosen when it is not the profile's first choice. */
	note?: string;
};

/** Thrown when none of a profile's voices can be used with the account. */
export class VoiceCastingError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'VoiceCastingError';
	}
}

/**
 * Picks the voice for a request. An explicitly requested voice must be
 * usable; otherwise the profile's shortlist is walked in order and the first
 * voice the account has is cast. This is what lets the engine speak with
 * default voices today and switch to native Turkish voices the moment they
 * are added to the account, with no code change.
 */
export const castVoice = (request: VoiceoverRequest, availableVoiceIds: ReadonlySet<string>): VoiceCast => {
	const profile: VoiceProfile = VOICE_PROFILES[request.profile];
	const usable = (key: VoiceKey) => availableVoiceIds.has(VOICES[key].elevenLabsId);

	let chosen: VoiceKey | undefined;
	let note: string | undefined;
	if (request.voice) {
		if (!usable(request.voice)) {
			throw new VoiceCastingError(
				`Voice "${request.voice}" (${VOICES[request.voice].name}) is not available in this ElevenLabs account. ` +
					'Native Turkish voices must be added to "My Voices" and need a paid plan.',
			);
		}
		chosen = request.voice;
	} else {
		chosen = profile.voices.find(usable);
		if (!chosen) {
			throw new VoiceCastingError(
				`None of the voices of profile "${request.profile}" (${profile.voices.join(', ')}) is available in this ElevenLabs account.`,
			);
		}
		const first = profile.voices[0];
		if (chosen !== first) {
			note = `Preferred voice ${VOICES[first].name} is not in the account; using ${VOICES[chosen].name} instead.`;
		}
	}

	const voice = VOICES[chosen];
	const modelKey = request.model ?? profile.model ?? DEFAULT_VOICE_MODEL;
	const model = VOICE_MODELS[modelKey];
	return {
		profile: request.profile,
		voice: chosen,
		voiceName: voice.name,
		elevenLabsVoiceId: voice.elevenLabsId,
		native: voice.origin === 'native',
		model: modelKey,
		modelId: model.id,
		languageCode: model.acceptsLanguageCode ? VOICE_LANGUAGE : undefined,
		stability: profile.stability,
		similarity: profile.similarity,
		pace: request.pace ?? profile.pace,
		seed: VOICE_SEED,
		note,
	};
};
