import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {CampSchema, campEpisode, campFromChecklist, campMismatches, campSlug, campWelcomeNarration, sectionTitleNarration, turkishOrdinal} from '../src/Courses/Camp';
import {ChecklistSchema, type Checklist} from '../src/Courses/Curriculum';
import {dataFolders} from '../src/Courses/CurriculumImport';
import {CAMP_SCRIPT_SAMPLE, LESSON_SCRIPT_SAMPLE} from '../src/Courses/LessonScriptSample';
import {LessonScriptSchema, lessonNarrations} from '../src/Courses/LessonScript';
import {numberedPartNames} from '../src/Components/Visuals/VisualSchemas';
import {OUTRO_SCENE_ID} from '../src/Scenes/BrandOutroScene';
import {chapterTimestamp, formatChapters, sceneChapters} from '../src/Scenes/SceneChapters';
import type {TemplateScene} from '../src/Scenes/ScenePlan';
import {CAMP_SCENE_IDS} from '../src/Templates/Camps/CampScenes';
import {CampLesson, CampScriptSchema} from '../src/Templates/Camps/CampLesson/CampLesson';
import {CampShort} from '../src/Templates/Camps/CampShort/CampShort';
import {CourseLesson} from '../src/Templates/Courses/CourseLesson/CourseLesson';

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
	const checklistFile = path.resolve(__dirname, '..', 'Curriculum', 'Production', 'Checklist.json');
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
		expect(numberedPartNames({kind: 'sentence', parts: [{text: 'Bu', highlight: false}, {text: 'kırdı.', highlight: true}]})).toEqual(['w1', 'w2']);
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
