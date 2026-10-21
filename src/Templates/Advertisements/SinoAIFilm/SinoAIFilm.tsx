import type {z} from 'zod';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {defineTemplate} from '../../TemplateDefinition';
import {AnswerScene, AskScene, HookScene, MakeScene, ThinkScene, WordsScene} from './SinoAIFilmScenes';
import {SinoAIFilmSchema, sinoAIFilmTimings, type SinoAIFilmContent} from './SinoAIFilmSchema';
import {PromoEndCard} from '../PromoKit/PromoEndCard';

/** The campaign's SinoAI film (18 Ekim 2026). Example data, the same as on the app screens. */
const SAMPLE: z.input<typeof SinoAIFilmSchema> = {
	hook: {lines: ['Yapay zekâ çok.', 'Seni tanıyan bir tane.'], narration: 'Yapay zekâ çok. Ama seni tanıyan bir tane var.'},
	ask: {question: 'Son denememe göre bu hafta ne çalışmalıyım?', narration: 'Bu hafta ne çalışacağını sor.'},
	think: {
		steps: [
			{label: 'Hedefine bakıyor', detail: 'YKS · Sayısal'},
			{label: 'Son denemeni okuyor', detail: 'TYT Deneme 4'},
			{label: 'Eksiklerini buluyor', detail: 'Problemler −3,25 net'},
		],
		narration: 'SinoAI hedefini, son denemeni ve eksiklerini bilerek cevap verir.',
	},
	answer: {
		text: 'Bu hafta en çok Problemler’e zaman ayır. Paragrafı kısa tutalım; fizikte tek konu yeter.',
		plan: [
			{day: 'Pzt', task: 'Problemler · 10 soru'},
			{day: 'Çar', task: 'Paragraf · mikro ders'},
			{day: 'Cum', task: 'Kuvvet ve hareket · test'},
		],
		narration: 'Sana özel planı çıkarır.',
	},
	make: {
		items: [
			{icon: 'quiz', title: '10 soruluk quiz', meta: 'Problemler · açıklamalı'},
			{icon: 'cards', title: 'Kart destesi', meta: '24 kart · Bilgi Kartları’nda'},
			{icon: 'calendar', title: 'Haftalık plan', meta: '3 gün · Ders Planı’nda'},
		],
		narration: 'Quizini ve kartlarını da hazırlar.',
	},
	words: {words: ['Sor.', 'Anla.', 'Üret.'], narration: 'Sor. Anla. Üret.'},
	closing: {line: 'Seni tanıyan yapay zekâ, Sınavika’da.', narration: 'SinoAI, Sınavika’da.'},
};

const buildScenes = (content: SinoAIFilmContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = sinoAIFilmTimings(content);
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, timings.hook, 2.4);
	const ask = say('ask', content.ask.narration, timings.ask, timings.ask);
	const think = say('think', content.think.narration, timings.think, timings.think);
	const answer = say('answer', content.answer.narration, timings.answer, timings.answer);
	const make = say('make', content.make.narration, timings.make, timings.make);
	const words = say('words', content.words.narration, timings.words, 2.2);
	const closing = say('closing', content.closing.narration, timings.closing, 2.6);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'ask', seconds: ask.seconds, label: 'Soru', voice: [ask], element: <AskScene content={content} />},
		{id: 'think', seconds: think.seconds, label: 'Adımlar', voice: [think], element: <ThinkScene content={content} />},
		{id: 'answer', seconds: answer.seconds, label: 'Cevap', voice: [answer], element: <AnswerScene content={content} />},
		{id: 'make', seconds: make.seconds, label: 'Üretim', voice: [make], element: <MakeScene content={content} />},
		{id: 'words', seconds: words.seconds, label: 'Kelimeler', voice: [words], element: <WordsScene content={content} spoken={words.text} voiceSeconds={voiceClips.words?.durationSeconds} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <PromoEndCard />}] : []),
	];
};

/**
 * SinoAI's own film: a question typed into the composer, SinoAI's steps lit
 * one by one, the answer streaming, the work it made sliding in, three words
 * and the name. White and neutral like SinoAI itself; the language of an AI
 * product film, not of the other app ads.
 */
export const SinoAIFilm = defineTemplate({
	id: 'SinoAIFilm',
	category: 'Advertisements',
	title: 'SinoAI ürün filmi',
	description: 'SinoAI tanıtımı: soru yazılır, SinoAI’nin adımları yanar, cevap akar, üretilen quiz, kart ve plan kayarak gelir. Beyaz, sade.',
	contentSchema: SinoAIFilmSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'fade', durationSeconds: 0.25},
	targetSeconds: {min: 18, max: 34},
	buildScenes,
});
