import type {z} from 'zod';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {defineTemplate} from '../../TemplateDefinition';
import {BeatScene, ClosingScene, FanScene, HookScene, WallScene} from './AppShowcaseScenes';
import {AppShowcaseSchema, appShowcaseTimings, type AppShowcaseContent} from './AppShowcaseSchema';

/** The Turkish Google Play film (14 Nov 2026): UI/UX drawings only, study first, SinoAI last. */
const SAMPLE: z.input<typeof AppShowcaseSchema> = {
	hook: {
		lines: ['Bugün ne çalışacağın', 'hazır.'],
		screens: ['m-hub-moduller', 'm-plan-bugun'],
		narration: 'Bugün ne çalışacağın hazır.',
	},
	fan: {
		headline: 'Yedi modül, tek uygulama.',
		chips: ['Denemeler', 'Dersler', 'Testler', 'Ders Planı', 'Akıllı Özet', 'Bilgi Kartları', 'SinoAI'],
		screens: ['m-hub-moduller', 'm-deneme-vitrin', 'm-ders-vitrin'],
		narration: 'Yedi modül, tek uygulamada seninle.',
	},
	beats: [
		{
			module: 'studyPlan',
			kicker: 'Ders Planı',
			headline: ['Planın', 'her gün hazır.'],
			screens: ['m-plan-bugun', 'm-plan-ilerleme'],
			narration: 'Ders planın her gün hazır; ne çalışacağını düşünme.',
		},
		{
			module: 'lessons',
			kicker: 'Dersler',
			headline: ['Konuyu öğren,', 'adım adım.'],
			screens: ['m-ders-vitrin', 'm-ders-grupla', 'm-ders-eslestir'],
			narration: 'Konuyu kısa mikro derslerle, adım adım öğren.',
		},
		{
			module: 'exam',
			kicker: 'Denemeler',
			headline: ['Denemeni çöz,', 'netini gör.'],
			screens: ['m-deneme-coz', 'm-deneme-sonuclar'],
			narration: 'Denemeni çöz, netini ve eksik konunu gör.',
		},
		{
			module: 'tests',
			kicker: 'Testler',
			headline: ['Eksik konunu', 'testle kapat.'],
			screens: ['m-test-vitrin', 'm-test-coz'],
			narration: 'Eksik konunu Kolay, Orta ve Zor testlerle kapat.',
		},
		{
			module: 'flashcards',
			kicker: 'Bilgi Kartları',
			headline: ['Kartı çevir,', 'unutma.'],
			screens: ['m-kart-on', 'm-kart-arka'],
			narration: 'Kartı çevir; tekrarı doğru günde önüne gelir.',
		},
		{
			module: 'smartSummary',
			kicker: 'Akıllı Özet',
			headline: ['Fotoğrafını çek,', 'çözümü gör.'],
			screens: ['m-ozet-vitrin', 'm-ozet-sonuc'],
			narration: 'Takıldığın sorunun fotoğrafını çek, adım adım çözümünü gör.',
		},
		{
			module: 'sinoAi',
			kicker: 'SinoAI',
			headline: ['Takıldığında', "SinoAI'ye sor."],
			screens: ['m-sino-sohbet'],
			narration: "Takıldığında SinoAI'ye sor; konuyu sana göre anlatsın.",
		},
	],
	wall: {
		lines: ['Her şey', 'tek uygulamada.'],
		screens: ['m-hub-moduller', 'm-plan-bugun', 'm-ders-grupla', 'm-deneme-sonuclar', 'm-test-coz', 'm-kart-on', 'm-ozet-sonuc', 'm-sino-sohbet', 'm-istatistik', 'm-deneme-coz', 'm-ders-vitrin', 'm-plan-ilerleme'],
		narration: 'Planın, derslerin ve denemelerin tek uygulamada.',
	},
	closing: {
		line: 'Hedefine her gün bir adım yaklaş.',
		cta: 'Bugün başla',
		screens: ['m-plan-bugun', 'm-hub-moduller', 'm-deneme-sonuclar'],
		narration: 'Hedefine her gün bir adım yaklaş.',
	},
};

const buildScenes = (content: AppShowcaseContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = appShowcaseTimings(content);
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, timings.hook, 3.4);
	const fan = say('fan', content.fan.narration, timings.fan, 3.6);
	const beats = content.beats.map((beat, index) => {
		const id = `beat${index + 1}`;
		const line = say(id, beat.narration, timings.beats[index], 3.4);
		return {
			id,
			seconds: line.seconds,
			label: beat.kicker,
			voice: [line],
			element: <BeatScene content={content} index={index} />,
		};
	});
	const wall = say('wall', content.wall.narration, timings.wall, 3.2);
	const closing = say('closing', content.closing.narration, timings.closing, 3.8);
	return [
		{
			id: 'hook',
			seconds: hook.seconds,
			label: 'Açılış',
			voice: [hook],
			element: <HookScene content={content} />,
		},
		{
			id: 'fan',
			seconds: fan.seconds,
			label: 'Modüller',
			voice: [fan],
			element: <FanScene content={content} />,
		},
		...beats,
		{
			id: 'wall',
			seconds: wall.seconds,
			label: 'Ekran duvarı',
			voice: [wall],
			element: <WallScene content={content} />,
		},
		...(content.outro.enabled
			? [
					{
						id: OUTRO_SCENE_ID,
						seconds: closing.seconds,
						label: 'Kapanış',
						voice: [closing],
						element: <ClosingScene content={content} />,
					},
				]
			: []),
	];
};

/**
 * Launch-style app film for Google Play, the App Store and YouTube (16:9). On
 * the brand's orange, phones swing in 3D and walk through the app's screens
 * (the current UI/UX drawings); details lift off the screen; type lands word
 * by word; a navy wall of every screen; the stores at the end.
 */
export const AppShowcase = defineTemplate({
	id: 'AppShowcase',
	category: 'Advertisements',
	title: 'Uygulama vitrin filmi (3B)',
	description: 'Turuncu zeminde 3B dönen telefonlarda UI/UX ekranları, ekrandan kalkan detaylar, kelime kelime gelen iri yazı, ekran duvarı ve mağazalı kapanış.',
	contentSchema: AppShowcaseSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'fade', durationSeconds: 0.2},
	targetSeconds: {min: 20, max: 60},
	buildScenes,
});
