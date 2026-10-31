/**
 * Google Ads videos (template GoogleVideoAd): per exam and promotion, a 15 s
 * spot (at most 15 s, so it also runs as a non-skippable in-stream ad) in
 * 16:9, 1:1 and 9:16, and a 6 s bumper (music only) in 16:9 and 9:16. The two
 * concepts are the exam's first two Google Ads concepts, so videos and
 * pictures tell the same story, and the hook names the exam.
 *
 * Language follows the market (EXAM_LANG), and every 15 s spot is voiced with
 * ElevenLabs (owner, 30 Oct 2026: "elevenlabs kullan"): Turkish spots (YKS,
 * KPSS) by the brand voice Doğa (Eleven v4, profile Launch; chosen by the owner
 * on 20 Oct 2026); English spots (SAT, ACT) by Liam, a native American voice
 * of ElevenLabs, because a Turkish voice reading English sounds unnatural.
 * Before 30 Oct the English spots had music and subtitles only. Music: one
 * prompt per exam and promotion, lively and wordless; the bumper reuses it.
 */
import {AD_EXAMS, conceptsFor, EXAM_LANG, type AdExam, type AdLang, type AdPlatform} from './GoogleAdsPlan';

const VIDEO_AD_VOICE: Record<AdLang, Record<string, unknown>> = {
	tr: {voice: 'Doga', model: 'v4', profile: 'Launch'},
	en: {voice: 'Liam', model: 'v4', profile: 'Launch', language: 'en', standIn: true},
};

export const VIDEO_AD_LENGTHS = {
	short: {formats: ['Horizontal', 'Square', 'Vertical'], label: '15sn'},
	bumper: {formats: ['Horizontal', 'Vertical'], label: '6sn-bumper'},
} as const;
type VideoAdLength = keyof typeof VIDEO_AD_LENGTHS;
export const FORMAT_FILE: Record<'Horizontal' | 'Square' | 'Vertical', string> = {Horizontal: 'yatay-16x9', Square: 'kare-1x1', Vertical: 'dikey-9x16'};

type Lines = {hook: string; proof: string; product: string};

export const VIDEO_AD_LINES: Record<AdExam, Lines> = {
	kpss: {hook: 'KPSS’de puanını nerede kaybettin?', proof: 'Sınavika eksik konularını tek tek gösterir.', product: 'Ders Planı onları günlük görevlere çevirir.'},
	yks: {hook: 'TYT netini nerede kaybettin?', proof: 'Sınavika hangi konuda net kaybettiğini gösterir.', product: 'Ders Planı bugün ne çalışacağını hazırlar.'},
	sat: {hook: 'Where did your SAT score drop?', proof: 'Sınavika shows your weak skills one by one.', product: 'Study Plan turns them into daily tasks.'},
	act: {hook: 'Where did your ACT score drop?', proof: 'Sınavika shows your weak skills one by one.', product: 'Study Plan turns them into daily tasks.'},
};

/** The site's reading ("Sınavika nokta kom") comes from the central pronunciation (SpokenText.ts), not from the ad. */
const VIDEO_AD_CLOSING: Record<AdPlatform, Record<AdLang, {text: string}>> = {
	mobile: {tr: {text: 'Sınavika’yı ücretsiz indir.'}, en: {text: 'Get Sınavika for free.'}},
	web: {tr: {text: 'sinavika.com’da ücretsiz başla.'}, en: {text: 'Start free at sinavika.com.'}},
};

const VIDEO_AD_MUSIC: Record<AdExam, Record<AdPlatform, string>> = {
	kpss: {
		mobile: 'Upbeat modern pop for a study app ad: punchy kick, bright plucked synth arpeggio, claps on two and four, a confident lift when the plan appears, tight button ending. Around 122 BPM, optimistic and focused. No vocals.',
		web: 'Driving indie-electronic groove: crisp hi-hats, warm bass line, shimmering guitar stabs, a rising build into a clean, satisfying final hit. Around 126 BPM, energetic but calm enough to read along. No vocals.',
	},
	yks: {
		mobile: 'Energetic youthful electro-pop: bouncy synth bass, snappy snare, playful marimba hook, a lift with a riser when the answer appears, crisp stinger at the end. Around 128 BPM, motivating and bright. No vocals.',
		web: 'Fresh lo-fi house with momentum: four-on-the-floor kick, chopped piano chords, airy pads, a small filter build and a clean ending chord. Around 120 BPM, focused and upbeat. No vocals.',
	},
	sat: {
		mobile: 'Bright American college-radio pop rock: jangly clean guitars, tight live drums, warm bass, a lifted chorus feel when the plan appears, a crisp final strum. Around 124 BPM, confident and optimistic. No vocals.',
		web: 'Modern minimal electronic for a study product: soft plucks, deep sub bass, crisp claps, a short riser into a clean resolving chord. Around 118 BPM, smart and focused. No vocals.',
	},
	act: {
		mobile: 'Upbeat funky indie-pop: slap bass groove, bright horn stabs, handclaps, a fun lift when the answer appears, a punchy final hit. Around 126 BPM, energetic and friendly. No vocals.',
		web: 'Driving synthwave-lite groove: steady pulse bass, glassy arpeggios, tight drums, a build into a clean ending hit. Around 120 BPM, motivating but easy to read along. No vocals.',
	},
};

type VideoAdSpec = {exam: AdExam; platform: AdPlatform; lang: AdLang; length: VideoAdLength; format: 'Horizontal' | 'Square' | 'Vertical'};

/** Every video of the set: each exam in its market's language. */
export const videoAdSpecs = (): VideoAdSpec[] => {
	const specs: VideoAdSpec[] = [];
	for (const exam of AD_EXAMS)
		for (const platform of ['mobile', 'web'] as const)
			for (const length of ['short', 'bumper'] as const) for (const format of VIDEO_AD_LENGTHS[length].formats) specs.push({exam, platform, lang: EXAM_LANG[exam], length, format});
	return specs;
};

/** The render job of one video (VideoJob JSON). */
export const buildVideoAdJob = (spec: VideoAdSpec): Record<string, unknown> => {
	const [first, second] = conceptsFor(spec.exam);
	const lines = VIDEO_AD_LINES[spec.exam];
	const closing = VIDEO_AD_CLOSING[spec.platform][spec.lang];
	const voiced = spec.length === 'short';
	return {
		template: 'GoogleVideoAd',
		format: spec.format,
		theme: 'SinavikaLight',
		fps: 30,
		name: `Google ${spec.exam.toUpperCase()} ${spec.platform} ${VIDEO_AD_LENGTHS[spec.length].label}`,
		cover: false,
		...(voiced ? {voiceover: {...VIDEO_AD_VOICE[spec.lang]}} : {}),
		soundtrack: {music: VIDEO_AD_MUSIC[spec.exam][spec.platform]},
		content: {
			exam: spec.exam,
			platform: spec.platform,
			lang: spec.lang,
			length: spec.length,
			hook: {concept: first.id, narration: lines.hook},
			proof: {narration: lines.proof},
			product: {concept: second.id, narration: lines.product},
			closing: {narration: closing.text},
		},
	};
};
