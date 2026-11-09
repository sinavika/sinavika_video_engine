import {z} from 'zod';
import {APP_SCREEN_NAMES} from '../../../Components/AppScreens/AppScreenRegistry';
import {COURSE_VOICE_MODEL} from '../../../Configurations/Voices';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {LessonScriptSchema, type LessonScript} from '../../../Courses/LessonScript';
import {CAMP_SCRIPT_SAMPLE} from '../../../Courses/LessonScriptSample';
import {plainText} from '../../../Schemas/RichText';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, phraseCues, phraseTimes, voiceTracksOf, type VoiceClips, type VoiceSlot} from '../../../Scenes/Voiceover';
import {courseLessonTheme} from '../../../Themes/LessonAccent';
import {getTheme} from '../../../Themes/ThemeRegistry';
import {defineTemplate} from '../../TemplateDefinition';
import {CampLesson} from '../CampLesson/CampLesson';
import {AppScene} from '../CampIntro/Scenes/AppScene';
import {ClosingScene} from '../CampIntro/Scenes/ClosingScene';
import {HookScene} from '../CampIntro/Scenes/HookScene';
import {lessonColor} from '../CampIntro/Scenes/IntroKit';
import {WelcomeScene} from '../CampIntro/Scenes/WelcomeScene';
import {CardsScene} from './Scenes/CardsScene';
import {barTimes, DistributionScene} from './Scenes/DistributionScene';
import {LessonFlowScene} from './Scenes/LessonFlowScene';
import {MomentScene} from './Scenes/MomentScene';
import {TopicMapScene} from './Scenes/TopicMapScene';

/**
 * Episode 0 of one lesson's camp (TYT Matematik, AYT Kimya, KPSS Tarih…), published before its first lesson. Where
 * CampIntro introduces a whole exam, this one stays on the lesson (owner, 9 Nov 2026):
 *
 *   hook          a lesson-specific opening: a question or a common mistake, never a self-introduction
 *   welcome       "kampın bu bölümünde …": the lesson's place in the camp, the giant 0
 *   map           every konu of the camp with its count of alt konular (counted from the lesson list)
 *   distribution  the lesson's questions in the exam and the topics ÖSYM asked most in the last ten years
 *   lessonFlow    the bridge into the moments: a question ("Peki dersler nasıl ilerleyecek?") and the moments to come
 *   moments       2–5 real moments of this camp's lessons, playing in a window (a prediction, a question with its
 *                 think countdown, a "Sıra sende" board, a mistake card…), each with what the viewer does then
 *   evidence      why the lessons are built this way: opens on the pedagogy ("araştırmaların ışığında … dört kanıt"),
 *                 then learning research, each card with its source
 *   tactics       the lesson's own ÖSYM tactics
 *   app           after each lesson: tests and practice exams in the app
 *   closing       the first lesson, subscribe, stores
 *
 * Words are Turkish terms students know: konu and alt konu, never "mikro ders". Narrated in the camp voice, no music.
 * The numbers on screen come from the data (Courses/CampIntroData); a test keeps the job and the data in step.
 */

const narration = z.string().trim().min(20).max(900);
const cue = z.string().trim().min(1).max(60).optional();
const LessonCode = z.string().trim().min(2).max(6);

const MomentSchema = z.object({
	/** The lesson whose moment is shown, read from its script file (`{"$script": "Curriculum/Scripts/…json"}` in the job). */
	lesson: LessonScriptSchema,
	/** The lesson scene shown: a CourseLesson id ("s2-c3", "summary") or the camp's ("camp-task"). */
	scene: z.string().trim().min(1).max(30),
	/** Seconds into that scene the window starts (to open on the countdown, the board, the answer…). */
	from: z.number().min(0).max(120).default(0),
	badge: plainText(24),
	title: plainText(48),
	/** What the viewer does at this moment of a lesson, one sentence. */
	todo: plainText(110),
	/** The research behind it, in small letters ("Geri çağırma · Roediger ve Karpicke, 2006"). */
	evidence: plainText(90).optional(),
	todoCue: cue,
	narration,
});

const CardSchema = z.object({title: plainText(44), text: plainText(150), source: plainText(90).optional(), cue});

const CampLessonIntroSchema = z
	.object({
		exam: z.object({short: plainText(8), name: plainText(40)}),
		lesson: z.object({code: LessonCode, name: plainText(30)}),
		/** The label of every scene: "YKS kampı · TYT Matematik". */
		series: plainText(40),
		episode: z.object({title: plainText(40), label: plainText(60)}),
		hook: z.object({beats: z.array(plainText(30)).min(2).max(4), cues: z.array(z.string().trim().min(1).max(60)).max(4).optional(), narration}),
		welcome: z.object({narration}),
		map: z.object({
			topics: z.array(z.object({code: z.string().min(1), title: plainText(60), subtopics: z.number().int().min(0).max(80)})).min(1).max(40),
			averageSubtopics: z.number().int().min(0).max(80),
			/** Topics the narration singles out, by code; each lights up when its `cue` (default: its title) is heard. */
			focus: z.array(z.object({code: z.string().min(1), cue})).max(4).default([]),
			countCue: cue,
			narration,
		}),
		distribution: z.object({
			test: z.object({name: plainText(40), questions: plainText(12), note: plainText(120).optional(), cue}),
			from: z.number().int(),
			to: z.number().int(),
			/** Numbers on the bars only when the lesson's questions are well mapped; otherwise the order alone. */
			counts: z.boolean(),
			topics: z.array(z.object({code: z.string().min(1), title: plainText(60), questions: z.number().int().min(0), cue})).min(1).max(8),
			narration,
		}),
		/** The bridge into the moments: a question that wakes the viewer, then what is coming (owner, 9 Nov 2026). */
		lessonFlow: z.object({
			title: plainText(50),
			/** The box beside every moment, said and shown last. */
			promise: plainText(60).default('Her anda sağda: Sen ne yapmalısın?'),
			promiseCue: cue,
			narration,
		}),
		moments: z.array(MomentSchema).min(2).max(5),
		evidence: z.object({title: plainText(40), cards: z.array(CardSchema).min(2).max(4), narration}),
		tactics: z.object({title: plainText(40), cards: z.array(CardSchema).min(2).max(4), narration}),
		app: z.object({title: plainText(50), screens: z.array(z.object({screen: z.enum(APP_SCREEN_NAMES), caption: plainText(40), cue})).min(2).max(3), narration}),
		closing: z.object({next: z.object({lesson: plainText(30), title: plainText(40), code: LessonCode}), cues: z.object({subscribe: cue, stores: cue}).default({}), narration}),
		/** The closing card (first lesson, subscribe, stores); off only for cut-downs that end elsewhere. */
		outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	})
	.refine((content) => content.distribution.from <= content.distribution.to, {path: ['distribution', 'to'], message: 'The period ends after it starts.'})
	.refine((content) => content.map.focus.every((entry) => content.map.topics.some((topic) => topic.code === entry.code)), {path: ['map', 'focus'], message: 'A focused topic must be one of the camp’s topics.'})
	.refine((content) => content.moments.every((moment) => momentScene(moment.lesson, moment.scene) !== undefined), {path: ['moments'], message: 'Every moment must name a scene of its lesson.'});

type Content = z.infer<typeof CampLessonIntroSchema>;

/** The scene of a camp lesson a moment shows, as the lesson itself draws it (no voice: its own timing estimates). */
const momentScene = (script: LessonScript, sceneId: string): TemplateScene | undefined => CampLesson.buildScenes(script, {}).find((scene) => scene.id === sceneId);

const CHAPTERS = {hook: 'Giriş', map: 'Konular', distribution: 'Soru dağılımı', moments: 'Dersler nasıl işlenecek?', evidence: 'Neden işe yarar?', tactics: 'Sınav taktikleri', app: 'Deneme ve test', closing: 'İlk ders'} as const;

/** Moments' ids, for their narration lines and scenes. */
const momentId = (index: number) => `moment-${index + 1}`;

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips);
	const line = (id: string, text: string, floor: number) => say(id, text, estimateReadingSeconds([text], {baseSeconds: 0.8, minSeconds: floor, maxSeconds: 80}), floor);
	const heard = (slot: VoiceSlot, text: string, phrases: readonly string[], spread = 0.75): number[] => {
		const fallback = phrases.map((_, index) => 0.4 + (index * slot.seconds * spread) / Math.max(1, phrases.length));
		return phraseCues(voiceClips[slot.id], text, phrases, fallback, slot.seconds);
	};
	const kicker = `${content.series} · 0`;
	const color = lessonColor(content.lesson.code);
	const section = COURSE_DESIGN.transition.section;

	const hook = line('hook', content.hook.narration, 4);
	const welcome = line('welcome', content.welcome.narration, 5);
	const map = line('map', content.map.narration, 8);
	const distribution = line('distribution', content.distribution.narration, 8);
	const lessonFlow = line('lesson-flow', content.lessonFlow.narration, 6);
	const evidence = line('evidence', content.evidence.narration, 8);
	const tactics = line('tactics', content.tactics.narration, 8);
	const app = line('app', content.app.narration, 7);
	const closing = line(OUTRO_SCENE_ID, content.closing.narration, 7);

	const [countAt] = heard(map, content.map.narration, [content.map.countCue ?? 'konu']);
	const focusAt = heard(
		map,
		content.map.narration,
		content.map.focus.map((entry) => entry.cue ?? content.map.topics.find((topic) => topic.code === entry.code)?.title ?? ''),
	);
	const d = content.distribution;
	const [testAt] = heard(distribution, d.narration, [d.test.cue ?? 'soru']);
	const rowAt = barTimes(
		phraseTimes(voiceClips[distribution.id], d.narration, d.topics.map((topic) => topic.cue ?? topic.title), distribution.seconds),
		distribution.seconds,
	);
	const [promiseAt] = heard(lessonFlow, content.lessonFlow.narration, [content.lessonFlow.promiseCue ?? 'ne yapman'], 0.8);
	const stepAt = content.moments.map((_, index) => 1.2 + (index * Math.max(0.4, Math.min(promiseAt, lessonFlow.seconds) - 1.6)) / content.moments.length);
	const cl = content.closing.cues;
	const [subscribeAt, storesAt] = heard(closing, content.closing.narration, [cl.subscribe ?? 'abone', cl.stores ?? 'App Store']);

	const moments: TemplateScene[] = content.moments.map((moment, index) => {
		const slot = line(momentId(index), moment.narration, 7);
		const [todoAt] = heard(slot, moment.narration, [moment.todoCue ?? 'sen'], 0.5);
		const scene = momentScene(moment.lesson, moment.scene);
		return {
			id: momentId(index),
			seconds: slot.seconds,
			label: moment.badge,
			voice: [slot],
			element: (
				<MomentScene
					kicker={kicker}
					color={color}
					badge={moment.badge}
					title={moment.title}
					todo={moment.todo}
					evidence={moment.evidence}
					theme={courseLessonTheme(COURSE_DESIGN.theme, moment.lesson.topic.lesson) ?? getTheme(COURSE_DESIGN.theme)}
					lesson={scene?.element}
					from={moment.from}
					todoAt={todoAt}
				/>
			),
		};
	});

	const camps = content.map.topics.length;
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Kanca', chapter: CHAPTERS.hook, voice: [hook], element: <HookScene beats={content.hook.beats} at={heard(hook, content.hook.narration, content.hook.cues ?? content.hook.beats, 0.6)} voice={voiceTracksOf([hook], voiceClips)} />},
		{id: 'welcome', seconds: welcome.seconds, label: 'Bölüm 0', voice: [welcome], element: <WelcomeScene series={content.series} label={content.episode.label} title={content.episode.title} lessons={Array.from({length: Math.min(6, camps)}, () => content.lesson.code)} voice={voiceTracksOf([welcome], voiceClips)} />},
		{
			id: 'map',
			seconds: map.seconds,
			label: 'Konular',
			chapter: CHAPTERS.map,
			transitionIn: section,
			voice: [map],
			element: <TopicMapScene kicker={kicker} color={color} topics={content.map.topics} average={content.map.averageSubtopics} countAt={countAt} focus={content.map.focus.map((entry, index) => ({index: content.map.topics.findIndex((topic) => topic.code === entry.code), at: focusAt[index]}))} />,
		},
		{
			id: 'distribution',
			seconds: distribution.seconds,
			label: 'Soru dağılımı',
			chapter: CHAPTERS.distribution,
			transitionIn: section,
			voice: [distribution],
			element: (
				<DistributionScene
					kicker={kicker}
					color={color}
					test={d.test}
					period={d.from === d.to ? String(d.from) : `${d.from}–${d.to}`}
					rows={d.topics}
					counts={d.counts}
					source="Kaynak: ÖSYM’nin yayımladığı sorular. Soruların konulara eşlenmesi yaklaşıktır."
					testAt={testAt}
					rowAt={rowAt}
				/>
			),
		},
		{
			id: 'lesson-flow',
			seconds: lessonFlow.seconds,
			label: 'Dersler',
			chapter: CHAPTERS.moments,
			transitionIn: section,
			voice: [lessonFlow],
			element: <LessonFlowScene kicker={kicker} color={color} title={content.lessonFlow.title} steps={content.moments} stepAt={stepAt} promise={content.lessonFlow.promise} promiseAt={promiseAt} />,
		},
		...moments,
		{id: 'evidence', seconds: evidence.seconds, label: 'Neden', chapter: CHAPTERS.evidence, transitionIn: section, voice: [evidence], element: <CardsScene kicker={kicker} color={color} title={content.evidence.title} cards={content.evidence.cards} cardAt={heard(evidence, content.evidence.narration, content.evidence.cards.map((card) => card.cue ?? card.title))} dark />},
		{id: 'tactics', seconds: tactics.seconds, label: 'Taktikler', chapter: CHAPTERS.tactics, transitionIn: section, voice: [tactics], element: <CardsScene kicker={kicker} color={color} title={content.tactics.title} cards={content.tactics.cards} cardAt={heard(tactics, content.tactics.narration, content.tactics.cards.map((card) => card.cue ?? card.title))} />},
		{id: 'app', seconds: app.seconds, label: 'Deneme ve test', chapter: CHAPTERS.app, transitionIn: section, voice: [app], element: <AppScene kicker={kicker} title={content.app.title} screens={content.app.screens} screenAt={heard(app, content.app.narration, content.app.screens.map((item) => item.cue ?? item.caption))} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'İlk ders', chapter: CHAPTERS.closing, transitionIn: section, voice: [closing], element: <ClosingScene next={content.closing.next} subscribeAt={subscribeAt} storesAt={storesAt} voice={voiceTracksOf([closing], voiceClips)} />}] : []),
	];
};

const SAMPLE: z.input<typeof CampLessonIntroSchema> = {
	exam: {short: 'TYT', name: 'Temel Yeterlilik Testi'},
	lesson: {code: 'TRK', name: 'Türkçe'},
	series: 'YKS kampı · TYT Türkçe',
	episode: {title: 'Türkçe kampına başlarken', label: 'Bölüm 0 · Konular, sorular ve çalışma düzeni'},
	hook: {beats: ['40 soru.', 'Yarıdan fazlası paragraf.'], narration: 'Kırk soru. Yarısından fazlası paragraf. Türkçe testi tam olarak bu.'},
	welcome: {narration: 'Kampın bu bölümünde Türkçe ile başlıyoruz. Önce konuları ve soruları tanıyalım.'},
	map: {topics: [{code: 'SOZCUKTE_ANLAM', title: 'Sözcükte Anlam', subtopics: 15}, {code: 'PARAGRAF', title: 'Paragraf', subtopics: 15}], averageSubtopics: 15, focus: [{code: 'PARAGRAF'}], narration: 'Kampta iki konu var; en uzun durağımız Paragraf.'},
	distribution: {test: {name: 'TYT Türkçe', questions: '40'}, from: 2018, to: 2026, counts: true, topics: [{code: 'PARAGRAF', title: 'Paragraf', questions: 188}, {code: 'SOZCUKTE_ANLAM', title: 'Sözcükte Anlam', questions: 20}], narration: 'Türkçe testi kırk soru. Son yıllarda soruların çoğu Paragraf konusundan geldi, ardından Sözcükte Anlam.'},
	lessonFlow: {title: 'Dersler nasıl ilerleyecek?', narration: 'Peki dersler nasıl ilerleyecek? Şimdi gerçek derslerimizden iki an göstereceğiz; her anın yanında senin ne yapman gerektiği yazıyor.'},
	moments: [
		{lesson: CAMP_SCRIPT_SAMPLE, scene: 's3-c2', badge: 'Sıra sende', title: 'Eşleştirme tahtası', todo: 'Cevapları gelmeden kendin eşleştir.', evidence: 'Geri çağırma · Roediger ve Karpicke, 2006', narration: 'Sıra sende tahtası gelince cevaplar gelmeden sen eşleştir.'},
		{lesson: CAMP_SCRIPT_SAMPLE, scene: 's3-c3', badge: 'Soru', title: 'Düşünme süresi', todo: 'Sayaç bitmeden cevabını yaz.', narration: 'Soruda sayaç çalışırken sen de cevabını yaz.'},
	],
	evidence: {title: 'Neden böyle işliyoruz?', cards: [{title: 'Önce sen hatırla', text: 'Cevabı görmeden hatırlamaya çalışmak öğrendiğini kalıcı yapar.', source: 'Roediger ve Karpicke, 2006'}, {title: 'Aralıklı tekrar', text: 'Bir hafta sonra yapılan kısa tekrar unutmayı yavaşlatır.', source: 'Cepeda ve arkadaşları, 2006'}], narration: 'Bu dersleri öğrenme araştırmalarının ışığında, pedagojik olarak hazırlıyoruz. İşte dayandığımız iki kanıt: önce sen hatırla; sonra aralıklı tekrar et.'},
	tactics: {title: 'Türkçe taktikleri', cards: [{title: 'Soru kökünü iki kez oku', text: 'Olumsuz köklerin altını çiz.'}, {title: 'Paragrafa süre koy', text: 'Uzun paragrafta takılırsan işaretle, sonra dön.'}], narration: 'Soru kökünü iki kez oku; paragrafa süre koy.'},
	app: {title: 'Her dersten sonra', screens: [{screen: 'Tests', caption: 'Konu testi'}, {screen: 'Exam', caption: 'Deneme'}], narration: 'Her dersten sonra konu testini çöz, haftada bir deneme yap.'},
	closing: {next: {lesson: 'Türkçe · Ders 1', title: 'Sözcükte Anlam', code: 'TRK'}, narration: 'İlk dersimiz Sözcükte Anlam. Kanala abone ol, ilk derste görüşmek üzere.'},
};

export const CampLessonIntro = defineTemplate({
	id: 'CampLessonIntro',
	category: 'Courses',
	title: 'Ders kampı tanıtımı (Bölüm 0)',
	description: 'Bir dersin kampının ilk videosu: konular ve alt konular, ÖSYM soru dağılımı, derslerden gerçek anlar ve o anlarda öğrencinin ne yapacağı, öğrenme araştırmaları, derse özel taktikler, uygulamada deneme ve test, ilk ders.',
	contentSchema: CampLessonIntroSchema,
	sampleContent: SAMPLE,
	defaultTheme: COURSE_DESIGN.theme,
	buildScenes,
	transition: COURSE_DESIGN.transition.card,
	voiceProfile: 'Herald',
	voiceModel: COURSE_VOICE_MODEL,
	targetSeconds: {min: 180, max: 10 * 60},
});
