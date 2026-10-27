import {z} from 'zod';
import {APP_SCREEN_NAMES} from '../../../Components/AppScreens/AppScreenRegistry';
import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {plainText} from '../../../Schemas/RichText';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, phraseCues, voiceTracksOf, type VoiceClips, type VoiceSlot} from '../../../Scenes/Voiceover';
import {UI_ICON_NAMES, type UIIconName} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {AnatomyScene, AppScene, CampMapScene, ClosingScene, EpisodeScene, HookScene, MethodScene, NetScene, ScoreScene, WelcomeScene} from './CampIntroScenes';

/**
 * Episode 0 of a camp: published before the camp's first lesson. It is an
 * advertising film, not a lesson (it does not use the lesson templates): it
 * says what the exam is (questions, minutes, tests, net, score), how big the
 * camp is (lessons per camp, one YouTube lesson and one short each), how a
 * camp lesson works, how to follow it, and what Sınavika adds; it ends on the
 * first lesson. Narrated by SinoAI in the camp voice, no music (camp rule).
 *
 * Content is the script itself, one narration per scene; the scenes draw what
 * the narration says (docs/CampIntro.md has the two scripts in plain text).
 * Every element lands when its words are heard: its `cue`, a phrase of the
 * narration, defaults to its own name or title (phraseCues).
 */

const narration = z.string().trim().min(20).max(900);
const LessonCode = z.string().trim().min(2).max(6);
/** A phrase of the scene's narration; the element lands when it is heard. */
const cue = z.string().trim().min(1).max(60).optional();
const cueList = z.array(z.string().trim().min(1).max(60)).max(4).optional();

const TestSchema = z.object({
	name: plainText(40),
	questions: z.number().int().min(1).max(80),
	/** Lesson code for the colour (Configurations/LessonColors); without it a brand fallback. */
	lesson: LessonCode.optional(),
	parts: z.array(z.object({name: plainText(24), questions: z.number().int().min(1).max(40)})).max(5).optional(),
	cue,
});

export const CampIntroSchema = z
	.object({
		/** The exam the camp prepares for, as the scenes name it. */
		exam: z.object({short: plainText(8), name: plainText(40)}),
		/** "YKS kampı · TYT" and "Bölüm 0 · Başlamadan önce": the label of every scene and the episode card. */
		series: plainText(30),
		episode: z.object({title: plainText(40), label: plainText(50)}),
		/** `cues`: one phrase per beat, as said ("yüz yirmi soru" for "120 soru."). */
		hook: z.object({beats: z.array(plainText(22)).min(2).max(4), cues: cueList, narration}),
		welcome: z.object({narration}),
		anatomy: z.object({questions: z.number().int().min(1).max(200), minutes: z.number().int().min(1).max(300), tests: z.array(TestSchema).min(1).max(5), clockCue: cue, narration}),
		net: z.object({example: z.object({right: z.number().int().min(0).max(200), wrong: z.number().int().min(0).max(200)}), cues: z.object({wrong: cue, taken: cue, blank: cue, example: cue}).default({}), narration}),
		score: z.object({focus: z.enum(['TYT', 'AYT']), cards: z.array(z.object({title: plainText(30), text: plainText(110), cue})).min(1).max(4), narration}),
		camp: z.object({lessons: z.array(z.object({code: LessonCode, name: plainText(24), topics: z.number().int().min(1).max(80)})).min(1).max(12), first: LessonCode, cadence: plainText(50), cues: z.object({total: cue, first: cue, cadence: cue}).default({}), narration}),
		episodeParts: z.object({title: plainText(40), parts: z.array(z.object({icon: z.enum(UI_ICON_NAMES as [UIIconName, ...UIIconName[]]), title: plainText(30), text: plainText(90), cue})).min(2).max(4), narration}),
		/** `cues`: one phrase per step; by default the spoken numbers "bir", "iki", "üç", "dört". */
		method: z.object({title: plainText(40), steps: z.array(plainText(40)).min(2).max(4), cues: cueList, narration}),
		app: z.object({title: plainText(50), screens: z.array(z.object({screen: z.enum(APP_SCREEN_NAMES), caption: plainText(40), cue})).min(2).max(3), narration}),
		closing: z.object({next: z.object({lesson: plainText(30), title: plainText(40), code: LessonCode}), cues: z.object({subscribe: cue, stores: cue}).default({}), narration}),
		/** The closing card (next lesson, subscribe, stores); off only for cut-downs that end elsewhere. */
		outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	})
	.refine((content) => content.anatomy.tests.reduce((sum, test) => sum + test.questions, 0) === content.anatomy.questions, {path: ['anatomy', 'tests'], message: 'The tests must add up to the exam’s questions.'})
	.refine((content) => content.camp.lessons.some((lesson) => lesson.code === content.camp.first), {path: ['camp', 'first'], message: 'The first camp must be one of the lessons.'});

export type CampIntroContent = z.infer<typeof CampIntroSchema>;

/** Each scene's YouTube chapter. */
export const CAMP_INTRO_CHAPTERS = {
	hook: 'Giriş',
	anatomy: 'Sınav nasıl?',
	net: 'Net nasıl hesaplanır?',
	score: 'Puan',
	camp: 'Kamp haritası',
	episode: 'Bir kamp dersi',
	method: 'Nasıl çalışmalı?',
	app: 'Sınavika',
	closing: 'İlk ders',
} as const;

const buildScenes = (content: CampIntroContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips);
	const line = (id: string, text: string, floor: number) => say(id, text, estimateReadingSeconds([text], {baseSeconds: 0.8, minSeconds: floor, maxSeconds: 70}), floor);
	const kicker = `${content.series} · 0`;

	const hook = line('hook', content.hook.narration, 4);
	const welcome = line('welcome', content.welcome.narration, 5);
	const anatomy = line('anatomy', content.anatomy.narration, 8);
	const net = line('net', content.net.narration, 7);
	const score = line('score', content.score.narration, 7);
	const camp = line('camp', content.camp.narration, 8);
	const episode = line('episode', content.episodeParts.narration, 8);
	const method = line('method', content.method.narration, 7);
	const app = line('app', content.app.narration, 9);
	const closing = line(OUTRO_SCENE_ID, content.closing.narration, 7);
	const section = COURSE_DESIGN.transition.section;

	/** When each phrase is heard in a scene's line; phrases that are not heard are spread over the line. */
	const heard = (slot: VoiceSlot, text: string, phrases: readonly string[], spread = 0.75): number[] => {
		const fallback = phrases.map((_, index) => 0.4 + (index * slot.seconds * spread) / Math.max(1, phrases.length));
		return phraseCues(voiceClips[slot.id], text, phrases, fallback, slot.seconds);
	};
	const n = content.net.cues;
	const [wrongAt, takenAt, blankAt, exampleAt] = heard(net, content.net.narration, [n.wrong ?? 'dört yanlış', n.taken ?? 'götürür', n.blank ?? 'boş', n.example ?? 'mesela']);
	const c = content.camp.cues;
	const firstName = content.camp.lessons.find((lesson) => lesson.code === content.camp.first)?.name ?? '';
	const [totalAt, firstAt, cadenceAt] = heard(camp, content.camp.narration, [c.total ?? 'konu', c.first ?? firstName, c.cadence ?? 'her gün']);
	const SPOKEN_NUMBERS = ['bir', 'iki', 'üç', 'dört'];
	const cl = content.closing.cues;
	const [subscribeAt, storesAt] = heard(closing, content.closing.narration, [cl.subscribe ?? 'abone', cl.stores ?? 'App Store']);

	const scenes: TemplateScene[] = [
		{id: 'hook', seconds: hook.seconds, label: 'Kanca', chapter: CAMP_INTRO_CHAPTERS.hook, voice: [hook], element: <HookScene beats={content.hook.beats} at={heard(hook, content.hook.narration, content.hook.cues ?? content.hook.beats, 0.6)} voice={voiceTracksOf([hook], voiceClips)} />},
		{id: 'welcome', seconds: welcome.seconds, label: 'Bölüm 0', voice: [welcome], element: <WelcomeScene series={content.series} label={content.episode.label} title={content.episode.title} lessons={content.camp.lessons.map((lesson) => lesson.code)} voice={voiceTracksOf([welcome], voiceClips)} />},
		{id: 'anatomy', seconds: anatomy.seconds, label: 'Sınav', chapter: CAMP_INTRO_CHAPTERS.anatomy, transitionIn: section, voice: [anatomy], element: <AnatomyScene kicker={kicker} exam={content.exam.short} name={content.exam.name} questions={content.anatomy.questions} minutes={content.anatomy.minutes} tests={content.anatomy.tests} testAt={heard(anatomy, content.anatomy.narration, content.anatomy.tests.map((test) => test.cue ?? test.name))} clockAt={heard(anatomy, content.anatomy.narration, [content.anatomy.clockCue ?? 'dakika'])[0]} />},
		{id: 'net', seconds: net.seconds, label: 'Net', chapter: CAMP_INTRO_CHAPTERS.net, transitionIn: section, voice: [net], element: <NetScene kicker={kicker} example={content.net.example} at={{wrong: wrongAt, taken: Math.max(takenAt, wrongAt + 0.9), blank: Math.max(blankAt, wrongAt + 1.2), example: exampleAt}} />},
		{id: 'score', seconds: score.seconds, label: 'Puan', chapter: CAMP_INTRO_CHAPTERS.score, transitionIn: section, voice: [score], element: <ScoreScene kicker={kicker} focus={content.score.focus} cards={content.score.cards} cardAt={heard(score, content.score.narration, content.score.cards.map((card) => card.cue ?? card.title))} />},
		{id: 'camp', seconds: camp.seconds, label: 'Kamp', chapter: CAMP_INTRO_CHAPTERS.camp, transitionIn: section, voice: [camp], element: <CampMapScene kicker={kicker} lessons={content.camp.lessons} first={content.camp.first} cadence={content.camp.cadence} totalAt={totalAt} firstAt={firstAt} cadenceAt={cadenceAt} />},
		{id: 'episode', seconds: episode.seconds, label: 'Bir ders', chapter: CAMP_INTRO_CHAPTERS.episode, transitionIn: section, voice: [episode], element: <EpisodeScene kicker={kicker} title={content.episodeParts.title} parts={content.episodeParts.parts} partAt={heard(episode, content.episodeParts.narration, content.episodeParts.parts.map((part) => part.cue ?? part.title))} />},
		{id: 'method', seconds: method.seconds, label: 'Yöntem', chapter: CAMP_INTRO_CHAPTERS.method, transitionIn: section, voice: [method], element: <MethodScene kicker={kicker} title={content.method.title} steps={content.method.steps} stepAt={heard(method, content.method.narration, content.method.cues ?? SPOKEN_NUMBERS.slice(0, content.method.steps.length))} />},
		{id: 'app', seconds: app.seconds, label: 'Sınavika', chapter: CAMP_INTRO_CHAPTERS.app, transitionIn: section, voice: [app], element: <AppScene kicker={kicker} title={content.app.title} screens={content.app.screens} screenAt={heard(app, content.app.narration, content.app.screens.map((item) => item.cue ?? item.caption))} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'İlk ders', chapter: CAMP_INTRO_CHAPTERS.closing, transitionIn: section, voice: [closing], element: <ClosingScene next={content.closing.next} subscribeAt={subscribeAt} storesAt={storesAt} voice={voiceTracksOf([closing], voiceClips)} />}] : []),
	];
	return scenes;
};

const SAMPLE: z.input<typeof CampIntroSchema> = {
	exam: {short: 'TYT', name: 'Temel Yeterlilik Testi'},
	series: 'YKS kampı · TYT',
	episode: {title: 'Başlamadan önce', label: 'Bölüm 0 · Sınavı ve kampı tanıyoruz'},
	hook: {beats: ['120 soru.', '165 dakika.', 'Tek bir sabah.'], narration: 'Yüz yirmi soru. Yüz altmış beş dakika. Ve tek bir sabah. Teyete tam olarak bu. Hazırsan başlıyoruz.'},
	welcome: {narration: 'Merhaba, ben Sino Ey Ay. Kampın sıfırıncı bölümüne hoş geldin. Bugün konu anlatmıyoruz, önce haritayı çiziyoruz.'},
	anatomy: {questions: 120, minutes: 165, tests: [{name: 'Türkçe', questions: 40, lesson: 'TRK'}, {name: 'Sosyal Bilimler', questions: 20, lesson: 'TAR'}, {name: 'Temel Matematik', questions: 40, lesson: 'MAT'}, {name: 'Fen Bilimleri', questions: 20, lesson: 'FIZ'}], narration: 'Teyete dört testten oluşur: Türkçe kırk, Sosyal Bilimler yirmi, Temel Matematik kırk ve Fen Bilimleri yirmi soru. Toplam yüz yirmi soru için yüz altmış beş dakikan var.'},
	net: {example: {right: 40, wrong: 8}, narration: 'Puanını netin belirler. Dört yanlış bir doğruyu götürür, boş bıraktığın soru ise hiçbir şey kaybettirmez.'},
	score: {focus: 'TYT', cards: [{title: 'Ön lisans', text: 'TYT puanı tek başına kullanılır.'}, {title: 'Lisans', text: 'YKS puanının yüzde kırkı TYT’den gelir.'}], narration: 'Teyete puanı ön lisans tercihlerinde tek başına kullanılır; lisans tercihlerinde ise yekase puanının yüzde kırkını oluşturur.'},
	camp: {lessons: [{code: 'TRK', name: 'Türkçe', topics: 15}, {code: 'MAT', name: 'Matematik', topics: 23}], first: 'TRK', cadence: 'Hemen her gün yeni bir ders', narration: 'Kampta her konu için bir YouTube dersi ve bir kısa video var. Türkçe ile başlıyoruz.'},
	episodeParts: {title: 'Her ders aynı düzende', parts: [{icon: 'playCircle', title: 'YouTube dersi', text: 'On, on beş dakikada konu ve ÖSYM tarzı sorular.'}, {icon: 'zap', title: 'Kısa video', text: 'Dört soruluk hızlı tekrar.'}], narration: 'Her ders aynı düzende ilerler: önce YouTube dersi, sonra kısa bir tekrar videosu.'},
	method: {title: 'Kampı böyle takip et', steps: ['Dersi izle', 'Aynı gün testini çöz', 'Haftaya tekrar et'], narration: 'Dersi izle, aynı gün testini çöz, bir hafta sonra tekrar et.'},
	app: {title: 'Kampı Sınavika’da sürdür', screens: [{screen: 'Home', caption: 'Bütün modüller tek yerde'}, {screen: 'Tests', caption: 'Konu testleri'}], narration: 'Kampı Sınavika ile birlikte kurduk; testler ve planın uygulamada seni bekliyor.'},
	closing: {next: {lesson: 'Türkçe · Ders 1', title: 'Sözcükte Anlam', code: 'TRK'}, narration: 'İlk dersimiz Sözcükte Anlam. Kanala abone ol, bir sonraki videoda görüşmek üzere.'},
};

export const CampIntro = defineTemplate({
	id: 'CampIntro',
	category: 'Courses',
	title: 'Kamp tanıtımı (Bölüm 0)',
	description: 'Kampın ilk videosu: sınavın yapısı, net ve puan, kampın haritası, bir kamp dersinin düzeni, çalışma yöntemi, Sınavika ve ilk ders. Reklam dilinde, ders şablonlarından bağımsız.',
	contentSchema: CampIntroSchema,
	sampleContent: SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	buildScenes,
	transition: COURSE_DESIGN.transition.card,
	voiceProfile: 'Herald',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: {min: 120, max: 8 * 60},
});
