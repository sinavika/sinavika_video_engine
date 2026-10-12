/**
 * The voice of Sınavika, in one place.
 *
 *   Voice    who speaks       a concrete ElevenLabs voice and its character
 *   Profile  how they speak   a role (teacher, coach, promoter...) with an ordered
 *                             shortlist of voices, a model and a delivery
 *   Casting  who gets a role  templates name a profile; a job may override it
 *
 * Templates never mention a voice id. To change who speaks in a kind of
 * video, edit a profile here; to try a new voice, add it to the catalogue and
 * put it at the front of a shortlist.
 *
 * All narration is Turkish.
 */
export const VOICE_LANGUAGE = 'tr';

/** Generated audio is cached here, inside `public/`, keyed by a hash of text and delivery. */
export const VOICEOVER_DIRECTORY = 'Voiceovers';

/**
 * Model tiers. `expressive` (Eleven v3) is the default: the most human and
 * emotional delivery. `stable` (Multilingual v2) is the fallback when a
 * narration needs even intonation over many lines.
 */
export const VOICE_MODELS = {
	expressive: {id: 'eleven_v3', acceptsLanguageCode: true, maxCharacters: 5000},
	stable: {id: 'eleven_multilingual_v2', acceptsLanguageCode: false, maxCharacters: 10000},
} as const;

export type VoiceModelKey = keyof typeof VOICE_MODELS;
export const VOICE_MODEL_KEYS = Object.keys(VOICE_MODELS) as [VoiceModelKey, ...VoiceModelKey[]];
export const DEFAULT_VOICE_MODEL: VoiceModelKey = 'expressive';

export type Voice = {
	elevenLabsId: string;
	name: string;
	gender: 'female' | 'male';
	age: 'young' | 'middleAged';
	/**
	 * `native`: a Turkish speaker from the ElevenLabs voice library. Must be
	 * added to the account ("My Voices") and needs a paid plan to use by API.
	 * `multilingual`: an ElevenLabs default voice. Works on every plan and
	 * speaks Turkish, but is not a native Turkish speaker.
	 */
	origin: 'native' | 'multilingual';
	character: string;
};

export const VOICES = {
	// Native Turkish voices (ElevenLabs voice library).
	Derya: {
		elevenLabsId: 'NNn9dv8zq2kUo7d3JSGG',
		name: 'Derya',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Dinamik ve samimi anlatıcı; kütüphanedeki en çok kullanılan Türkçe kadın sesi',
	},
	Melis: {
		elevenLabsId: 'uqq9c1CYgBRmZ0b4JJpV',
		name: 'Melis Akcan',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'Çevrim içi ders anlatımı için profesyonel, net eğitmen sesi',
	},
	Damla: {
		elevenLabsId: 'A2XgcJ6lQVEFeIaIUyrc',
		name: 'Damla',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Yüksek enerjili içerik üreticisi; hızlı tempolu kısa videolar',
	},
	Ayca: {
		elevenLabsId: 'eUUtjbi66JcWz3T4Gvvo',
		name: 'Ayça',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Genç, dinamik ve sıcak; motivasyon ve yönlendirme',
	},
	Sevim: {
		elevenLabsId: 'H9xk2HncwpOKhhzbyWsd',
		name: 'Sevim',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'Cesaretlendirici, sıcak ve net; sosyal medya',
	},
	Nisa: {
		elevenLabsId: 'bj1uMlYGikistcXNmFoh',
		name: 'Nisa',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Güler yüzlü tanıtım sesi; kampanya ve duyurular',
	},
	Irem: {
		elevenLabsId: 'uvU9jrgGLWNPeNA4NgNT',
		name: 'İrem',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'Otoriter, derin ve kurumsal; güven veren reklam sesi',
	},
	// ElevenLabs default voices: available on every plan, used until native voices are added.
	Sarah: {
		elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
		name: 'Sarah',
		gender: 'female',
		age: 'young',
		origin: 'multilingual',
		character: 'Güven veren, sıcak ve olgun',
	},
	Alice: {
		elevenLabsId: 'Xb7hH8MSUJpSbSDYk0k2',
		name: 'Alice',
		gender: 'female',
		age: 'middleAged',
		origin: 'multilingual',
		character: 'Net ve ilgi çekici eğitmen',
	},
	Matilda: {
		elevenLabsId: 'XrExE9yKIg1WjnnlVkGX',
		name: 'Matilda',
		gender: 'female',
		age: 'middleAged',
		origin: 'multilingual',
		character: 'Bilgili, profesyonel ve canlı',
	},
	Jessica: {
		elevenLabsId: 'cgSgspJ2msm6clMCkdW9',
		name: 'Jessica',
		gender: 'female',
		age: 'young',
		origin: 'multilingual',
		character: 'Oyuncu, parlak ve sıcak; trend içerikler',
	},
	Laura: {
		elevenLabsId: 'FGY2WhTYpPnrIDTdsKH5',
		name: 'Laura',
		gender: 'female',
		age: 'young',
		origin: 'multilingual',
		character: 'Coşkulu sosyal medya sesi',
	},
	Bella: {
		elevenLabsId: 'hpp4J3VqNfWAUOO0d1Us',
		name: 'Bella',
		gender: 'female',
		age: 'middleAged',
		origin: 'multilingual',
		character: 'Profesyonel, parlak ve sıcak',
	},
	// Male alternatives, for audiences that respond better to one. Never cast by default.
	Liam: {
		elevenLabsId: 'TX3LPaxmHKxFdv7VOQHJ',
		name: 'Liam',
		gender: 'male',
		age: 'young',
		origin: 'multilingual',
		character: 'Enerjik içerik üreticisi; Türkçe için doğrulanmış',
	},
	Daniel: {
		elevenLabsId: 'onwK4e9ZLuTAKqWW03F9',
		name: 'Daniel',
		gender: 'male',
		age: 'middleAged',
		origin: 'multilingual',
		character: 'Dengeli haber spikeri; Türkçe için doğrulanmış',
	},
} as const satisfies Record<string, Voice>;

export type VoiceKey = keyof typeof VOICES;
export const VOICE_KEYS = Object.keys(VOICES) as [VoiceKey, ...VoiceKey[]];

export type VoiceProfile = {
	description: string;
	/** Preferred voices, best first. The first one the account can use is cast. */
	voices: readonly [VoiceKey, ...VoiceKey[]];
	model: VoiceModelKey;
	/** Playback tempo: 1 is the voice's natural pace. Applied when the clip is played, so it works with every model. */
	pace: number;
	/** 0 to 1. Lower is more emotional and varied, higher is steadier. */
	stability: number;
	/** 0 to 1. How closely the output sticks to the original voice. */
	similarity: number;
};

export const VOICE_PROFILES = {
	Teacher: {
		description: 'Sabırlı ve sıcak öğretmen: soru çözümü, kavram açıklama',
		voices: ['Derya', 'Melis', 'Sarah', 'Alice'],
		model: 'expressive',
		pace: 1,
		stability: 0.5,
		similarity: 0.8,
	},
	Lecturer: {
		description: 'Net ve düzenli eğitmen: uzun konu anlatımı',
		voices: ['Melis', 'Derya', 'Alice', 'Matilda'],
		model: 'expressive',
		pace: 1,
		stability: 0.5,
		similarity: 0.8,
	},
	Energizer: {
		description: 'Hızlı ve enerjik: 15-60 saniyelik tekrar videoları',
		voices: ['Damla', 'Sevim', 'Jessica', 'Laura'],
		model: 'expressive',
		pace: 1.12,
		stability: 0.5,
		similarity: 0.75,
	},
	Coach: {
		description: 'Motive eden, kendinden emin koç: sınav hazırlığı',
		voices: ['Ayca', 'Derya', 'Sarah', 'Matilda'],
		model: 'expressive',
		pace: 1.03,
		stability: 0.5,
		similarity: 0.8,
	},
	Promoter: {
		description: 'Parlak ve ikna edici: reklam ve tanıtım',
		voices: ['Nisa', 'Irem', 'Bella', 'Sarah'],
		model: 'expressive',
		pace: 1.05,
		stability: 0.5,
		similarity: 0.8,
	},
	Creator: {
		description: 'Genç ve samimi içerik üreticisi: sosyal medya',
		voices: ['Damla', 'Ayca', 'Jessica', 'Laura'],
		model: 'expressive',
		pace: 1.08,
		stability: 0.5,
		similarity: 0.75,
	},
} as const satisfies Record<string, VoiceProfile>;

export type VoiceProfileKey = keyof typeof VOICE_PROFILES;
export const VOICE_PROFILE_KEYS = Object.keys(VOICE_PROFILES) as [VoiceProfileKey, ...VoiceProfileKey[]];

/** The profile a template gets when it does not name one. */
export const CATEGORY_VOICE_PROFILES = {
	Education: 'Teacher',
	Advertisements: 'Promoter',
	SocialMedia: 'Creator',
} as const satisfies Record<string, VoiceProfileKey>;

export const PACE_RANGE = {min: 0.8, max: 1.3} as const;

/**
 * Fixed seed for speech generation. ElevenLabs treats it as best effort, so
 * regenerating a line may still sound slightly different; the clip cache is
 * what keeps a rendered video reproducible.
 */
export const VOICE_SEED = 20261012;
