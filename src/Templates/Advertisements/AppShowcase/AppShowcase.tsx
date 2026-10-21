import type {z} from 'zod';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {defineTemplate} from '../../TemplateDefinition';
import {BeatScene, ClosingScene, FanScene, HookScene, WallScene} from './AppShowcaseScenes';
import {AppShowcaseSchema, appShowcaseTimings, type AppShowcaseContent} from './AppShowcaseSchema';

const R = 'Store/Real/tr';

/** The Turkish Google Play film of 20 October 2026: emulator recordings and captures of the live app. */
const SAMPLE: z.input<typeof AppShowcaseSchema> = {
	realLabel: 'Uygulamadan gerçek kayıt',
	hook: {lines: ['Sınav hazırlığın', 'tek uygulamada.'], clip: {kind: 'video', src: 'Media/StoreDemo/tr/hub.mp4', from: 0.8, until: 8.6, rate: 1.2}, narration: 'Sınav hazırlığın tek uygulamada.'},
	fan: {headline: 'Yedi modül, tek uygulama.', chips: ['Denemeler', 'Dersler', 'Testler', 'Ders Planı', 'Akıllı Özet', 'Bilgi Kartları', 'SinoAI'], screens: [`${R}/home.png`, `${R}/exam.png`, `${R}/studyPlan.png`], narration: 'Yedi modül, tek uygulamada.'},
	beats: [
		{module: 'exam', kicker: 'Denemeler', headline: ['Denemeni çöz,', 'anında gör.'], clip: {kind: 'video', src: 'Media/StoreDemo/tr/exam.mp4', from: 1.5, until: 12, rate: 1.3}, pop: {x: 0.03, y: 0.45, w: 0.94, h: 0.1}, narration: 'Denemeni çöz; doğrunu, yanlışını anında gör.'},
		{module: 'studyPlan', kicker: 'Ders Planı', headline: ['Planın', 'her gün hazır.'], clip: {kind: 'image', src: `${R}/studyPlan.png`}, narration: 'Ders planın her gün hazır.'},
	],
	wall: {lines: ['Hepsi gerçek ekran,', 'hepsi tek uygulamada.'], screens: [`${R}/home.png`, `${R}/exam.png`, `${R}/studyPlan.png`, `${R}/lessons.png`, `${R}/tests.png`, `${R}/flashcards.png`], narration: 'Gördüğün her ekran uygulamanın kendisi.'},
	closing: {line: 'Hedefine her gün bir adım yaklaş.', cta: 'Ücretsiz indir', stores: ['App Store', 'Google Play'], screens: [`${R}/studyPlan.png`, `${R}/home.png`, `${R}/exam.png`], narration: 'Sınavika’yı ücretsiz indir.'},
};

const buildScenes = (content: AppShowcaseContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = appShowcaseTimings(content);
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, timings.hook, 3.4);
	const fan = say('fan', content.fan.narration, timings.fan, 3.6);
	const beats = content.beats.map((beat, index) => {
		const id = `beat${index + 1}`;
		const line = say(id, beat.narration, timings.beats[index], 3.4);
		return {id, seconds: line.seconds, label: beat.kicker, voice: [line], element: <BeatScene content={content} index={index} />};
	});
	const wall = say('wall', content.wall.narration, timings.wall, 3.2);
	const closing = say('closing', content.closing.narration, timings.closing, 3.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Açılış', voice: [hook], element: <HookScene content={content} />},
		{id: 'fan', seconds: fan.seconds, label: 'Modüller', voice: [fan], element: <FanScene content={content} />},
		...beats,
		{id: 'wall', seconds: wall.seconds, label: 'Ekran duvarı', voice: [wall], element: <WallScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <ClosingScene content={content} />}] : []),
	];
};

/**
 * Launch-style app film for Google Play, the App Store and YouTube (16:9). On
 * the brand's orange, real phones swing in 3D and play the live app's own
 * recordings; details lift off the screen; type lands word by word; a navy
 * wall of every screen; the stores at the end. Phones are the shared
 * DeviceCapture, so captures fit exactly as in the store pictures.
 */
export const AppShowcase = defineTemplate({
	id: 'AppShowcase',
	category: 'Advertisements',
	title: 'Uygulama vitrin filmi (gerçek ekran, 3B)',
	description: 'Turuncu zeminde 3B dönen gerçek telefonlar, uygulamanın kendi kayıtları, ekrandan kalkan detaylar, kelime kelime gelen iri yazı, ekran duvarı ve mağazalı kapanış.',
	contentSchema: AppShowcaseSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'fade', durationSeconds: 0.2},
	targetSeconds: {min: 20, max: 60},
	buildScenes,
});
