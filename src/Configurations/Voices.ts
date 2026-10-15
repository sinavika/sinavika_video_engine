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
} as const;

export type VoiceModelKey = keyof typeof VOICE_MODELS;
export const VOICE_MODEL_KEYS = Object.keys(VOICE_MODELS) as [VoiceModelKey, ...VoiceModelKey[]];
/** The model a voice is narrated with unless a job says otherwise. */
export const VOICE_MODEL_BY_ORIGIN = {native: 'stable', multilingual: 'expressive'} as const satisfies Record<'native' | 'multilingual', VoiceModelKey>;

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
	Lisa: {
		elevenLabsId: 'LYfSi2g3Frvxg50fRl91',
		name: 'Lisa',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'İstanbul Türkçesi; dinamik ve enerjik, gündelik konuşma tonu; reklam ve sosyal medya',
	},
	Gokce: {
		elevenLabsId: 'oPC5I9GKjMReiaM29gjY',
		name: 'Gökçe Deniz',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Genç, İstanbul Türkçesi; canlı ve sevimli sohbet tonu; tanıtım reels’i ve sosyal medya',
	},
	Gozde: {
		elevenLabsId: 'aEJD8mYP0nuof1XHShVY',
		name: 'Gözde Arıkan',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Yumuşak, sıcak ve net; gündelik konuşma tonu, abartısız',
	},
	Eda: {
		elevenLabsId: 'mBUB5zYuPwfVE6DTcEjf',
		name: 'Eda Atlas',
		gender: 'female',
		age: 'young',
		origin: 'native',
		character: 'Pürüzsüz, net ve dengeli; kurumsal ve reklam',
	},
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
	Sevim: {
		elevenLabsId: 'H9xk2HncwpOKhhzbyWsd',
		name: 'Sevim',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'Cesaretlendirici, sıcak ve net; sosyal medya',
	},
	Irem: {
		elevenLabsId: 'uvU9jrgGLWNPeNA4NgNT',
		name: 'İrem',
		gender: 'female',
		age: 'middleAged',
		origin: 'native',
		character: 'Otoriter, derin ve kurumsal; güven veren reklam sesi',
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
 * Turkish speakers. Lisa was chosen by the brand owner (October 2026); the
 * others are fallbacks, ordered from their descriptions in the ElevenLabs
 * library. To change the brand voice, put another one first.
 */
export const BRAND_VOICES = ['Lisa', 'Gozde', 'Eda', 'Derya', 'Melis'] as const satisfies readonly VoiceKey[];

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
		description: 'Net ve düzenli eğitmen: uzun konu anlatımı',
		standIns: ['Alice', 'Matilda'],
		pace: 1,
		stability: 0.6,
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
		description: 'Hareketli tanıtım reels’i: canlı, tempolu, gülümseyen ses (Ekim 2026 kampanyası)',
		standIns: ['Jessica', 'Laura'],
		pace: 1.06,
		stability: 0.36,
		similarity: 0.8,
		style: 0.22,
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
