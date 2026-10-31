import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import React from 'react';
import {describe, expect, it} from 'vitest';
import {CampSchema, campEpisode, campFromChecklist, campMismatches, campSlug, campWelcomeNarration, sectionTitleNarration, turkishOrdinal} from '../../src/Courses/Camp';
import {ChecklistSchema, type Checklist} from '../../src/Courses/Curriculum';
import {dataFolders} from '../../src/Courses/CurriculumImport';
import {CAMP_SCRIPT_SAMPLE, LESSON_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {LessonScriptSchema, lessonNarrations, spokenTextIssues} from '../../src/Courses/LessonScript';
import {CHALLENGE_SCORE_LINE, isSpoken, spokenOptions, spokenPredictAsk, spokenQuestion, spokenScreenText} from '../../src/Courses/LessonSpeech';
import {planTemplateScenes} from '../../src/Scenes/SceneSeries';
import {placeCuts} from '../../src/Services/NarrationCut';
import {numberedPartNames} from '../../src/Components/Visuals/VisualSchema';
import {OUTRO_SCENE_ID} from '../../src/Scenes/AppEndScene';
import {chapterTimestamp, formatChapters, sceneChapters} from '../../src/Scenes/SceneChapter';
import type {TemplateScene} from '../../src/Scenes/ScenePlan';
import {CAMP_SCENE_IDS} from '../../src/Templates/Camps/Scenes/CampChrome';
import {CampLesson, CampScriptSchema} from '../../src/Templates/Camps/CampLesson/CampLesson';
import {CampShort} from '../../src/Templates/Camps/CampShort/CampShort';
import {CourseLesson} from '../../src/Templates/Courses/CourseLesson/CourseLesson';
import {LessonLayoutProvider} from '../../src/Templates/Courses/CourseLesson/Scenes/LessonChrome';
import {ROOT} from '../Support/Paths';

const scene = (id: string, seconds: number, chapter?: string): TemplateScene => ({id, seconds, element: null, ...(chapter ? {chapter} : {})});
const cut = {preset: 'none', durationSeconds: 0} as const;

describe('YouTube chapters', () => {
	it('starts at 0:00 and lists the scenes that open a chapter', () => {
		const chapters = sceneChapters([scene('intro', 20, 'Giriş'), scene('a', 30), scene('s1', 40, 'Gerçek anlam'), scene('s2', 60, 'Mecaz anlam'), scene('summary', 25, 'Özet')], cut, 30);
		expect(chapters.map((chapter) => chapter.title)).toEqual(['Giriş', 'Gerçek anlam', 'Mecaz anlam', 'Özet']);
		expect(chapters[0].startSeconds).toBe(0);
		expect(formatChapters(chapters)).toBe('0:00 Giriş\n0:50 Gerçek anlam\n1:30 Mecaz anlam\n2:30 Özet');
	});

	it('folds a chapter shorter than 10 seconds into its neighbour and drops a list of fewer than three', () => {
		// Giriş lasts 6 s, so "Bir" does not start a chapter; "Özet" lasts 5 s and joins "Üç".
		const chapters = sceneChapters([scene('intro', 6, 'Giriş'), scene('s1', 40, 'Bir'), scene('s2', 40, 'İki'), scene('s3', 40, 'Üç'), scene('summary', 5, 'Özet')], cut, 30);
		expect(chapters.map((chapter) => chapter.title)).toEqual(['Giriş', 'İki', 'Üç']);
		expect(chapters.every((chapter, index) => (chapters[index + 1]?.startSeconds ?? 131) - chapter.startSeconds >= 10)).toBe(true);
		expect(sceneChapters([scene('intro', 30, 'Giriş'), scene('s1', 40, 'Bir')], cut, 30)).toEqual([]);
	});

	it('writes hours only for videos that have them', () => {
		expect(chapterTimestamp(65, false)).toBe('1:05');
		expect(chapterTimestamp(3750, true)).toBe('1:02:30');
	});
});

describe('camp plan', () => {
	const checklistFile = path.resolve(ROOT, 'Curriculum', 'Production', 'Checklist.json');
	const checklist: Checklist | null = existsSync(checklistFile) ? ChecklistSchema.parse(JSON.parse(readFileSync(checklistFile, 'utf8'))) : null;

	it('names a camp with ASCII lowercase ids', () => {
		expect(campSlug('YKS TYT Türkçe kampı')).toBe('yks-tyt-turkce-kampi');
		expect(campSlug('KPSS Önlisans Coğrafya kampı')).toBe('kpss-onlisans-cografya-kampi');
	});

	it.runIf(checklist)('builds the TYT Türkçe camp from the checklist, in production order', () => {
		const camp = campFromChecklist(checklist!, {category: 'YKS_TYT', lesson: 'TRK'});
		expect(camp.id).toBe('yks-tyt-turkce-kampi');
		expect(camp.name).toBe('TYT Türkçe kampı');
		expect(camp.exams).toEqual(['YKS', 'TYT']);
		expect(camp.lessons[0]).toEqual({topic: 'SOZCUKTE_ANLAM', title: 'Sözcükte Anlam'});
		expect(camp.lessons.length).toBeGreaterThanOrEqual(10);
	});

	it('numbers a lesson, names the next one and reports a script that disagrees', () => {
		const camp = CampSchema.parse({id: 'yks-tyt-turkce-kampi', name: 'TYT Türkçe kampı', category: 'YKS_TYT', lesson: 'TRK', lessonName: 'Türkçe', exams: ['YKS', 'TYT'], promise: 'Hepsi sırayla.', lessons: [{topic: 'A', title: 'Bir'}, {topic: 'B', title: 'İki'}, {topic: 'C', title: 'Üç'}]});
		const task = {items: ['On soru çöz.'], narration: 'On soru çöz.'};
		expect(campEpisode(camp, 'B', task)).toMatchObject({number: 2, total: 3, next: 'Üç'});
		expect(campEpisode(camp, 'C', task).next).toBeUndefined();
		expect(campMismatches(camp, 'B', {...campEpisode(camp, 'B', task), number: 3})).toEqual(['camp.number is 3; the topic is lesson 2.']);
		expect(() => campEpisode(camp, 'Z', task)).toThrow();
	});

	it('finds the data folder of every category, KPSS Ortaöğretim sharing Önlisans', () => {
		const folders = dataFolders({categories: [{code: 'YKS_TYT', folder: 'YKS/TYT'}, {code: 'KPSS_ONLISANS', folder: 'KPSS/OnlisansOrtaogretim'}]});
		expect(folders.get('KPSS_ORTAOGRETIM')).toBe('KPSS/OnlisansOrtaogretim');
	});
});

describe('camp templates', () => {
	const script = LessonScriptSchema.parse(CAMP_SCRIPT_SAMPLE);

	it('needs the camp fields; a plain lesson script is not a camp lesson', () => {
		expect(CampScriptSchema.safeParse(CAMP_SCRIPT_SAMPLE).success).toBe(true);
		expect(CampScriptSchema.safeParse(LESSON_SCRIPT_SAMPLE).success).toBe(false);
		expect(lessonNarrations(script).at(-1)).toBe(script.camp!.task.narration);
	});

	it('wraps the lesson: SinoAI welcome first, spoken section titles, camp task before the promotion, a chapter per part', () => {
		const lesson = CourseLesson.buildScenes(script);
		const camp = CampLesson.buildScenes(script);
		const ids = camp.map((item) => item.id);
		expect(ids.slice(0, 2)).toEqual([CAMP_SCENE_IDS.card, 'intro']);
		expect(ids.slice(-2)).toEqual([CAMP_SCENE_IDS.task, OUTRO_SCENE_ID]);
		expect(camp.length).toBe(lesson.length + 2);
		expect(camp[0].voice?.[0].text).toMatch(/^Merhaba, ben SinoAI\. Sınavika'nın TYT Türkçe kampına hoş geldin!/);
		expect(camp.find((item) => item.id === 's2')?.voice?.map((slot) => slot.id)).toEqual(['s2-title', 's2']);
		expect(camp.find((item) => item.id === 's2')?.voice?.[0].text).toBe('İkinci bölüm: Mecaz Anlam.');
		expect(camp.filter((item) => item.chapter).map((item) => item.chapter)).toEqual(['Giriş', ...script.lesson.sections.map((section) => section.title), 'Özet', 'Kamp görevi']);
		expect(camp.find((item) => item.id === 's1')?.transitionIn?.preset).toBe('slide');
		expect(camp.find((item) => item.id === 's1-c1')?.transitionIn).toBeUndefined();
		expect(camp.find((item) => item.id === CAMP_SCENE_IDS.task)?.voice?.[0].text).toBe(script.camp!.task.narration);
	});

	it('says ordinals, the welcome of a later lesson and section titles in Turkish', () => {
		expect([1, 2, 4, 10, 15, 40, 99].map(turkishOrdinal)).toEqual(['birinci', 'ikinci', 'dördüncü', 'onuncu', 'on beşinci', 'kırkıncı', 'doksan dokuzuncu']);
		const later = {...script.camp!, number: 4, previous: 'Deyim ve Atasözü', next: 'Paragraf'};
		expect(campWelcomeNarration(later, {title: 'Cümlede Anlam', lessonName: 'Türkçe'})).toContain('Bugün kampın dördüncü dersindeyiz: Cümlede Anlam. Geçen derste Deyim ve Atasözü konusunu işlemiştik.');
		expect(campWelcomeNarration({...later, welcome: 'Kendi sözlerim.'}, {title: 'x', lessonName: 'y'})).toBe('Kendi sözlerim.');
		expect(sectionTitleNarration(11, 'Sözcüğün bağlamdaki anlamı')).toBe('On ikinci bölüm: Sözcüğün bağlamdaki anlamı.');
	});

	it('draws every scene of a camp lesson in the studio layout (owner, 31 Oct 2026); CourseLesson alone keeps the classic one', () => {
		const isStudio = (element: React.ReactNode) => React.isValidElement<{layout?: string}>(element) && element.type === LessonLayoutProvider && element.props.layout === 'studio';
		expect(CampLesson.buildScenes(script).every((item) => isStudio(item.element))).toBe(true);
		expect(CourseLesson.buildScenes(script).some((item) => isStudio(item.element))).toBe(false);
	});

	it('gives the lesson a YouTube chapter list that starts at 0:00', () => {
		const chapters = sceneChapters(CampLesson.buildScenes(script), CampLesson.transition, 30);
		expect(chapters.length).toBeGreaterThanOrEqual(3);
		expect(chapters[0]).toEqual({title: 'Giriş', startSeconds: 0});
	});

	it('ends the reel on the camp lesson it comes from', () => {
		const scenes = CampShort.buildScenes(script);
		expect(scenes.filter((item) => item.id === OUTRO_SCENE_ID)).toHaveLength(1);
		expect(scenes.at(-1)?.id).toBe(OUTRO_SCENE_ID);
	});
});

describe('beats on language visuals', () => {
	it('names the parts of sentences, comparisons and tables', () => {
		expect(numberedPartNames({kind: 'sentence', parts: [{text: 'Bu', highlight: false}, {text: 'kırdı.', highlight: true}], links: [{from: 1, to: 2}]})).toEqual(['w1', 'w2', 'l1']);
		expect(numberedPartNames({kind: 'comparison', columns: [{title: 'A', items: ['x', 'y']}, {title: 'B', items: ['z']}]})).toEqual(['c1', 'c1-1', 'c1-2', 'c2', 'c2-1']);
		expect(numberedPartNames({kind: 'table', header: ['a', 'b'], rows: [['1', '2']]})).toEqual(['r1', 'col1', 'col2']);
		expect(numberedPartNames({kind: 'formula', latex: 'x'})).toBeNull();
	});

	it('rejects a beat that points at a part the visual does not have', () => {
		const card = {kind: 'concept', title: 'Örnek', text: 'Metin', visual: {kind: 'sentence', parts: [{text: 'Bu'}, {text: 'kırdı.'}]}, beats: [{narration: 'Bu kırdı.', focus: ['w3']}], narration: 'Anlatım.'};
		const script = {...LESSON_SCRIPT_SAMPLE, lesson: {...LESSON_SCRIPT_SAMPLE.lesson, sections: [{...LESSON_SCRIPT_SAMPLE.lesson.sections[0], cards: [card]}, ...LESSON_SCRIPT_SAMPLE.lesson.sections.slice(1)]}};
		const result = LessonScriptSchema.safeParse(script);
		expect(result.success).toBe(false);
		expect(result.error?.issues.map((issue) => issue.message).join(' ')).toMatch(/No part w3 on this sentence; its parts are w1, w2/);
		card.beats[0].focus = ['w2'];
		expect(LessonScriptSchema.safeParse(script).success).toBe(true);
	});
});

describe('what the narrator reads', () => {
	it('reads a question as it stands on screen: paragraph, stem, options; blanks, part marks and answer pairs said aloud', () => {
		expect(spokenQuestion({stem: 'Hangisinde **ağır** mecazdır?', options: ['Ağır bavul', 'Ağır söz'], context: undefined})).toBe('Hangisinde ağır mecazdır? A şıkkı: Ağır bavul. B şıkkı: Ağır söz.');
		expect(spokenScreenText('Yazar ---- bir dille anlatıyor.')).toBe('Yazar boşluk bir dille anlatıyor.');
		expect(spokenScreenText("En büyük örnek ----'dir; açısı $50°$'dir, $\\frac{1}{3}$'üne iner.")).toBe("En büyük örnek boşluk; açısı 50 derece'dir, 1 bölü 3'üne iner.");
		expect(spokenScreenText('Gözlerin bir deniz / Dalgalandıkça sen; $3/4$')).toBe('Gözlerin bir deniz, Dalgalandıkça sen; 3 bölü 4');
		expect(spokenScreenText('**el değmemiş (I)** (doğal)')).toBe('el değmemiş, bir numara, (doğal)');
		expect(spokenOptions(['yalın - dolaşırken', 'sade - kaybolmuş'])).toBe('A şıkkı: yalın, dolaşırken. B şıkkı: sade, kaybolmuş.');
		expect(spokenOptions(['I', 'II', 'III'])).toBe('');
	});

	it('says Roman numerals as a teacher does: premises, ordinals and numeral answers (the voice read them as letters)', () => {
		expect(spokenScreenText('Bu bilgilere göre;\nI. Selçuklu bağımsızlığını yitirdi.\nII. Nüfus hareketleri yaşandı.')).toBe('Bu bilgilere göre; bir numara, Selçuklu bağımsızlığını yitirdi. iki numara, Nüfus hareketleri yaşandı.');
		expect(spokenScreenText('I. Edirne fethedildi. II. Sinan, bu yapıyı tamamladı.')).toBe('bir numara, Edirne fethedildi. iki numara, Sinan, bu yapıyı tamamladı.');
		expect(spokenScreenText('olduğuna göre, I. $-1$, II. $0$ sayılarından')).toBe('olduğuna göre, bir numara, eksi 1, iki numara, 0 sayılarından');
		expect(spokenScreenText('Numaralanmış II. cümle')).toBe('Numaralanmış ikinci cümle');
		expect(spokenScreenText('XI. yüzyılda II. Murat')).toBe('on birinci yüzyılda ikinci Murat');
		expect(spokenOptions(['Yalnız I', 'I ve II', 'I, II ve III', 'II - IV - III - I'])).toBe('A şıkkı: Yalnız bir. B şıkkı: bir ve iki. C şıkkı: bir, iki ve üç. D şıkkı: iki, dört, üç, bir.');
		expect(spokenScreenText('I think I can.')).toBe('I think I can.');
		expect(spokenOptions(['I', 'II', 'III'])).toBe('');
	});

	it('says a minus inside a formula as "eksi", not as the pause between two answers', () => {
		expect(spokenScreenText('$|a - b| + |b| - |a|$ ifadesi')).toBe('mutlak değer a eksi b, artı mutlak değer b, eksi mutlak değer a, ifadesi');
		expect(spokenScreenText('$2x - y$ ifadesinin değeri - tam sayı')).toBe('2x eksi y ifadesinin değeri, tam sayı');
		expect(spokenScreenText('$|-7|$')).toBe('mutlak değer eksi 7');
		expect(spokenOptions(['$a < b < c$', '$c - a$'])).toBe('A şıkkı: a küçüktür b küçüktür c. B şıkkı: c eksi a.');
	});

	it('flags a fragment beat and an example that is not read as written', () => {
		const sample = LessonScriptSchema.parse(LESSON_SCRIPT_SAMPLE);
		const card = sample.lesson.sections[0].cards[0];
		const broken = {...sample, lesson: {...sample.lesson, sections: [{...sample.lesson.sections[0], cards: [{...card, kind: 'example' as const, title: 'Örnek', example: 'Kapı ardına kadar **açıldı**.', explanation: undefined, beats: [{narration: 'Müzikte nota,', show: [], focus: [], swap: []}]}]}]}} as typeof sample;
		const issues = spokenTextIssues(broken);
		expect(issues.some((issue) => /not a whole sentence/.test(issue))).toBe(true);
		expect(issues.some((issue) => /is not read as it is written/.test(issue))).toBe(true);
		expect(isSpoken('Kapıyı **açık** bıraktı.', 'Şuna bak: kapıyı açık bıraktı, dedik.')).toBe(true);
	});

	it('never asks a prediction about a sentence that is not on screen yet (owner, 27 Oct 2026)', () => {
		const sample = LessonScriptSchema.parse(LESSON_SCRIPT_SAMPLE);
		const predict = {
			kind: 'predict' as const, title: 'Önce sen tahmin et', prompt: 'Bu cümlede **yol** sözcüğüne hangi anlam yüklenmiş?', choices: ['Bir yere giden yol', 'Hayat boyu öğrenme'], answer: 1, thinkSeconds: 4,
			visual: {kind: 'sentence' as const, parts: [{text: 'Babam'}, {text: 'için'}, {text: 'yol,', highlight: true}, {text: 'her'}, {text: 'gün'}, {text: 'yeniden'}, {text: 'öğrenmekti.'}]},
			beats: [{narration: 'Babam için yol, her gün yeniden öğrenmekti.', show: ['w1'], focus: []}],
			explanation: 'Hayat boyu öğrenme.', narration: 'Şimdi sıra sende. Bu cümlede yol sözcüğüne hangi anlam yüklenmiş?', explanationNarration: 'Doğru cevap ikinci seçenek.',
		};
		const withCard = (card: object) => ({...sample, lesson: {...sample.lesson, sections: [{...sample.lesson.sections[0], cards: [card]}]}}) as typeof sample;
		expect(spokenTextIssues(withCard(predict)).some((issue) => /nothing on screen shows it/.test(issue))).toBe(true);
		const fixed = {...predict, context: 'Babam için **yol**, her gün yeniden öğrenmekti.', narration: 'Şimdi sıra sende. Şu cümleyi dikkatle oku.'};
		expect(spokenTextIssues(withCard(fixed)).some((issue) => /nothing on screen shows it/.test(issue))).toBe(false);
		// The sentence and the question are read as they stand, after the lead-in and before the choices.
		expect(spokenPredictAsk(fixed)).toBe('Şimdi sıra sende. Şu cümleyi dikkatle oku. Babam için yol, her gün yeniden öğrenmekti. Bu cümlede yol sözcüğüne hangi anlam yüklenmiş? A şıkkı: Bir yere giden yol. B şıkkı: Hayat boyu öğrenme. Birkaç saniye düşün.');
	});

	it('keeps a breath between the voices of two scenes, whatever the transition', () => {
		const voiced = (id: string): TemplateScene => ({id, seconds: 4, element: null, voice: [{id, text: 'x', seconds: 4}]});
		const plan = planTemplateScenes([voiced('a'), voiced('b')], {preset: 'fade', durationSeconds: 0.7}, 30);
		// b starts after a's full four seconds: the overlap is added to a.
		expect(plan.scenes[1].from).toBe(120);
	});
});

describe('narration cuts and the challenge reel', () => {
	it('moves a cut between two lines to the quiet moment between their words', () => {
		const rate = 8000;
		const samples = new Float32Array(rate * 3);
		// Speech from 0.2 to 1.40 s and from 1.55 to 2.8 s; the speech service put the boundary at 1.30 s, inside the first word.
		for (let index = 0; index < samples.length; index++) {
			const t = index / rate;
			if ((t > 0.2 && t < 1.4) || (t > 1.55 && t < 2.8)) samples[index] = 0.5 * Math.sin(2 * Math.PI * 220 * t);
		}
		const cuts = placeCuts([{startSeconds: 0.1, endSeconds: 1.3}, {startSeconds: 1.3, endSeconds: 2.9}], samples, rate);
		expect(cuts[0].endSeconds).toBeGreaterThan(1.4);
		expect(cuts[0].endSeconds).toBeLessThan(1.55);
		expect(cuts[1].startSeconds).toBe(cuts[0].endSeconds);
	});

	it('builds the reel from rounds: the first question from the first frame, each round asked, counted and answered, one score ask, no promotion', () => {
		const rounds = [
			{sentence: 'Bu haber cesaretini **kırdı**.', question: 'Kırdı: gerçek mi, mecaz mı?', choices: ['Gerçek', 'Mecaz'], answer: 1, why: 'Kırmak burada **azaltmak** demek.'},
			{sentence: 'Bize **tatlı** bir söz söyledi.', question: 'Tatlı: gerçek mi, mecaz mı?', choices: ['Gerçek', 'Mecaz'], answer: 1, why: 'Hoşa giden demek.'},
			{sentence: 'Sandalyenin **ayağı** kırık.', question: 'Ayağı: yan anlam mı, mecaz mı?', choices: ['Yan anlam', 'Mecaz'], answer: 0, why: 'Bağ korunuyor.'},
		];
		const script = LessonScriptSchema.parse({...CAMP_SCRIPT_SAMPLE, short: {...CAMP_SCRIPT_SAMPLE.short, rounds}});
		const scenes = CampShort.buildScenes(script);
		expect(scenes.map((scene) => scene.id)).toEqual(['round-1', 'round-2', 'round-3', 'score']);
		expect(scenes.some((scene) => scene.id === OUTRO_SCENE_ID)).toBe(false);
		const round = scenes.find((scene) => scene.id === 'round-1')!;
		// The hook is shown over the first question, never said: the question is the first thing heard.
		expect(round.voice?.map((line) => line.text)).toEqual(['Bu haber cesaretini kırdı. Kırdı: gerçek mi, mecaz mı?', 'Mecaz! Kırmak burada azaltmak demek.']);
		expect(scenes.at(-1)?.voice?.[0].text).toBe(CHALLENGE_SCORE_LINE);
		expect(LessonScriptSchema.safeParse({...CAMP_SCRIPT_SAMPLE, short: {...CAMP_SCRIPT_SAMPLE.short, rounds: [...rounds, rounds[0]]}}).success).toBe(false);
		expect(LessonScriptSchema.safeParse({...CAMP_SCRIPT_SAMPLE, short: {...CAMP_SCRIPT_SAMPLE.short, rounds: [{...rounds[0], answer: 4}, ...rounds.slice(1)]}}).success).toBe(false);
	});
});
