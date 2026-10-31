/**
 * The voice of Sınavika, in one place.
 *
 *   Voice    who speaks       a concrete ElevenLabs voice and its character
 *   Brand    the one voice    a single native Turkish speaker narrates everything
 *   Profile  how they speak   a role (teacher, coach, promoter...): the delivery, not the person
 *   Casting  who gets a role  templates name a profile; a job may override it
 *
 * Sınavika speaks with one voice, and that voice is a native Turkish speaker.
 * A multilingual voice can pronounce Turkish, but it keeps its own accent and
 * rhythm and sounds artificial; such voices are stand-ins that are used only
 * when a job explicitly asks for one, never silently.
 *
 * Templates never mention a voice id. To change who speaks, reorder
 * BRAND_VOICES; to try a new voice, add it to the catalogue first.
 *
 * All narration is Turkish.
 */
export const VOICE_LANGUAGE = 'tr';

/** Generated audio is cached here, inside `public/`, keyed by a hash of text and delivery. */
export const VOICEOVER_DIRECTORY = 'Voiceovers';

/**
 * Model tiers. Both speak Turkish. `stable` (Multilingual v2) is what the
 * native voices are tuned for: they are professional voice clones, which
 * ElevenLabs has not optimised for v3. `expressive` (Eleven v3) is the more
 * emotional model and suits ElevenLabs' own default voices.
 */
export const VOICE_MODELS = {
	expressive: {id: 'eleven_v3', acceptsLanguageCode: true, maxCharacters: 5000},
	stable: {id: 'eleven_multilingual_v2', acceptsLanguageCode: false, maxCharacters: 10000},
	/** Eleven v4: the newest model; the brand owner chose it for the promotion reels (October 2026). */
	v4: {id: 'eleven_v4', acceptsLanguageCode: true, maxCharacters: 5000},
} as const;

export type VoiceModelKey = keyof typeof VOICE_MODELS;
export const VOICE_MODEL_KEYS = Object.keys(VOICE_MODELS) as [VoiceModelKey, ...VoiceModelKey[]];
/** The model a voice is narrated with unless a job says otherwise. */
export const VOICE_MODEL_BY_ORIGIN = {native: 'stable', multilingual: 'expressive'} as const satisfies Record<'native' | 'multilingual', VoiceModelKey>;

type Voice = {
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
	Lisa: {
		elevenLabsId: 'LYfSi2g3Frvxg50fRl91',
		name: 'Lisa',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'İstanbul Türkçesi; dinamik ve enerjik, gündelik konuşma tonu; reklam ve sosyal medya',
	},
	Derya: {
		elevenLabsId: 'NNn9dv8zq2kUo7d3JSGG',
		name: 'Derya',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Dinamik ve samimi anlatıcı; kütüphanedeki en çok kullanılan Türkçe kadın sesi',
	},
	// Chosen by the brand owner for the promotion reels (October 2026), narrated with Eleven v4.
	Ahu: {
		elevenLabsId: 'xyqF3vGMQlPk3e7yA4DI',
		name: 'Ahu',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'İstanbul Türkçesi; neşeli, cesaret veren ve davetkâr sohbet tonu',
	},
	Belma: {
		elevenLabsId: 'KbaseEXyT9EE0CQLEfbB',
		name: 'Belma',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Dinamik ve net anlatıcı; sosyal medya, tempolu',
	},
	Doga: {
		elevenLabsId: 'IuRRIAcbQK5AQk1XevPj',
		name: 'Doğa',
		gender: 'male',
		age: 'middleAged',
		origin: 'native',
		character: 'İstanbul Türkçesi; canlı ve dolgun erkek sesi, sosyal medya; kütüphanenin en çok kullanılan Türkçe sesi',
	},
	// ElevenLabs default voices: multilingual stand-ins. Not native Turkish speakers; used only when a job asks for a stand-in.
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

/**
 * The brand voice, best first: the first of these the account can use
 * narrates everything, so all content sounds like one person. All are native
 * Turkish speakers. Doğa is the brand voice, chosen by the owner on 20 October
 * 2026 (before that Lisa, from 13 October); Lisa and Derya are fallbacks. To
 * change the brand voice, put another one first.
 */
export const BRAND_VOICES = ['Doga', 'Lisa', 'Derya'] as const satisfies readonly VoiceKey[];

/**
 * The voice of the promotion reels and Google Ads videos, and the model they
 * are narrated with. On 20 October 2026 the brand owner chose Doğa as the
 * brand voice (it also leads BRAND_VOICES); reels are no longer rendered in
 * several voices for a pick.
 */
export const PROMO_VOICES = ['Doga'] as const satisfies readonly VoiceKey[];
export const PROMO_VOICE_MODEL: VoiceModelKey = 'v4';

/**
 * The model the camp lessons and reels are narrated with. Multilingual v2
 * read the first camp lesson evenly but flatly, "like reading a text"
 * (owner, 25 Oct 2026); Eleven v4, already chosen for the promotion reels,
 * carries questions and asides with more life.
 */
export const COURSE_VOICE_MODEL: VoiceModelKey = 'v4';

export type VoiceProfile = {
	description: string;
	/** Multilingual stand-ins, best first. Cast only when a job asks for a stand-in and no brand voice is usable. */
	standIns: readonly [VoiceKey, ...VoiceKey[]];
	/** Playback tempo: 1 is the voice's natural pace. Applied when the clip is played, so it works with every model. */
	pace: number;
	/** 0 to 1. Lower is more emotional and varied, higher is steadier. */
	stability: number;
	/** 0 to 1. How closely the output sticks to the original voice. */
	similarity: number;
	/** 0 to 1. How much the voice's style is exaggerated. 0 is plain, everyday speech. */
	style: number;
};

/**
 * Roles differ in delivery, not in who speaks. Every role is spoken at the
 * voice's natural pace and without style exaggeration: narration should sound
 * like someone talking, not like an advert being read. A job can still set a
 * tempo of its own.
 */
export const VOICE_PROFILES = {
	Teacher: {
		description: 'Sabırlı ve sıcak öğretmen: soru çözümü, kavram açıklama',
		standIns: ['Sarah', 'Alice'],
		pace: 1,
		stability: 0.55,
		similarity: 0.8,
		style: 0,
	},
	Lecturer: {
		description: 'Net ve sıcak eğitmen: uzun konu anlatımı, öğrenciyle konuşur gibi',
		standIns: ['Alice', 'Matilda'],
		pace: 1,
		// 0.6 sounded read out over fifteen minutes; a little lower lets questions and asides rise and fall (25 Oct 2026).
		stability: 0.48,
		similarity: 0.8,
		style: 0,
	},
	Energizer: {
		description: 'Canlı ve akıcı: 15-60 saniyelik tekrar videoları',
		standIns: ['Jessica', 'Laura'],
		pace: 1,
		stability: 0.45,
		similarity: 0.8,
		style: 0,
	},
	Coach: {
		description: 'Motive eden, kendinden emin koç: sınav hazırlığı',
		standIns: ['Sarah', 'Matilda'],
		pace: 1,
		stability: 0.5,
		similarity: 0.8,
		style: 0,
	},
	Promoter: {
		description: 'Samimi ve inandırıcı tanıtım: bir arkadaşın önerisi gibi, reklam okur gibi değil',
		standIns: ['Bella', 'Sarah'],
		pace: 1,
		stability: 0.5,
		similarity: 0.8,
		style: 0,
	},
	Launch: {
		description: 'Tanıtım reels’i: doğal tempo, abartısız (Ekim 2026 kampanyası; marka sahibinin dinleyip seçtiği ayar)',
		standIns: ['Jessica', 'Laura'],
		pace: 1,
		stability: 0.5,
		similarity: 0.8,
		style: 0,
	},
	Herald: {
		// The camp's episode 0 opens a series; the owner asked for more excitement than the lesson voice (26 Oct 2026).
		description: 'Heyecanlı duyuru: kamp tanıtımı (Bölüm 0), enerjik ama doğal',
		standIns: ['Jessica', 'Laura'],
		pace: 1,
		stability: 0.34,
		similarity: 0.8,
		style: 0.3,
	},
	Creator: {
		description: 'Genç ve samimi içerik üreticisi: sosyal medya',
		standIns: ['Jessica', 'Laura'],
		pace: 1,
		stability: 0.45,
		similarity: 0.8,
		style: 0,
	},
} as const satisfies Record<string, VoiceProfile>;

export type VoiceProfileKey = keyof typeof VOICE_PROFILES;
export const VOICE_PROFILE_KEYS = Object.keys(VOICE_PROFILES) as [VoiceProfileKey, ...VoiceProfileKey[]];

/** The profile a template gets when it does not name one. */
export const CATEGORY_VOICE_PROFILES = {
	Education: 'Teacher',
	Courses: 'Lecturer',
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
