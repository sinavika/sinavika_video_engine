import {describe, expect, it} from 'vitest';
import {ChecklistEntrySchema} from '../../src/Courses/Curriculum';
import {LessonScriptSchema} from '../../src/Courses/LessonScript';
import {LESSON_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {worksViewOf} from '../../src/Courses/WorksView';

const entry = (id: string, category: string, topic: string, codes: string[], lesson = 'TRK') =>
	ChecklistEntrySchema.parse({
		order: 1,
		id,
		exam: 'KPSS',
		category,
		categoryName: category,
		lesson,
		lessonName: 'Türkçe',
		topic,
		topicName: `${category} ${topic}`,
		subtopics: codes.map((code) => ({code, id: `${id}-${code}`, name: code})),
		sources: {explanation: null, questions: null, questionCount: 0, answeredCount: 0, pastExamCount: 0},
	});

// The sample's three sections, renamed onto a KPSS Lisans topic, with the Önlisans subtopics each one also teaches.
const script = (topic: {id: string; category: string; code: string; lesson?: string}, sections: {subtopic?: string; alsoTeaches?: string[]; works?: string[]}[], works?: string[]) =>
	LessonScriptSchema.parse({
		...LESSON_SCRIPT_SAMPLE,
		topic: {id: topic.id, category: topic.category, lesson: topic.lesson ?? 'TRK', code: topic.code},
		lesson: {
			...LESSON_SCRIPT_SAMPLE.lesson,
			sections: LESSON_SCRIPT_SAMPLE.lesson.sections.map((section, index) => ({...section, subtopic: sections[index].subtopic, alsoTeaches: sections[index].alsoTeaches ?? []})),
		},
		...(works ? {works: {additions: works}} : {}),
	});

describe('Works views: one file per topic, in its own level’s codes', () => {
	// SES_BILGISI_01 is "Sesler" in Lisans but "Büyük Ünlü Uyumu" in Önlisans: the episode's second section teaches it.
	const lisans = entry('L', 'KPSS_LISANS', 'SES_BILGISI', ['SES_BILGISI_01', 'SES_BILGISI_02', 'SES_BILGISI_03']);
	const onlisans = entry('O', 'KPSS_ONLISANS', 'SES_BILGISI', ['SES_BILGISI_01', 'SES_BILGISI_02']);
	const ortaogretim = entry('M', 'KPSS_ORTAOGRETIM', 'SES_BILGISI', ['SES_BILGISI_01', 'SES_BILGISI_02']);
	const episode = {
		file: 'Scripts/KPSS/TRK/SES_BILGISI.json',
		script: script(
			{id: 'L', category: 'KPSS_LISANS', code: 'SES_BILGISI'},
			[{subtopic: 'SES_BILGISI_01'}, {subtopic: 'SES_BILGISI_02', alsoTeaches: ['KPSS_ONLISANS:SES_BILGISI_01']}, {subtopic: 'SES_BILGISI_03', alsoTeaches: ['KPSS_ONLISANS:SES_BILGISI_02']}],
			['Ünlü uyumlarına istisnaları tablo hâlinde ekle.', 'Ses olaylarını örnek sözcüklerle listele.'],
		),
	};

	it('gives the script’s own topic its sections and notes as they are', () => {
		const result = worksViewOf(lisans, [episode]);
		if (!('view' in result)) throw new Error(`missing ${result.missing}`);
		expect(result.view.topic).toEqual({id: 'L', category: 'KPSS_LISANS', lesson: 'TRK', code: 'SES_BILGISI'});
		expect(result.view.lesson.sections.map((section) => section.subtopic)).toEqual(['SES_BILGISI_01', 'SES_BILGISI_02', 'SES_BILGISI_03']);
		expect(result.view.works?.additions).toHaveLength(2);
	});

	it('names another level’s topic with that level’s codes, and its twin level with the same sections', () => {
		for (const level of [onlisans, ortaogretim]) {
			const result = worksViewOf(level, [episode]);
			if (!('view' in result)) throw new Error(`missing ${result.missing}`);
			expect(result.view.topic.category).toBe(level.category);
			expect(result.view.lesson.sections.map((section) => [section.subtopic, section.title])).toEqual([
				['SES_BILGISI_01', 'Mecaz Anlam'],
				['SES_BILGISI_02', 'Terim Anlam'],
			]);
		}
	});

	it('gives no view while a subtopic is taught nowhere', () => {
		const partial = {...episode, script: script({id: 'L', category: 'KPSS_LISANS', code: 'SES_BILGISI'}, [{subtopic: 'SES_BILGISI_01'}, {subtopic: 'SES_BILGISI_02'}, {subtopic: 'SES_BILGISI_03'}])};
		expect(worksViewOf(onlisans, [partial])).toEqual({missing: ['SES_BILGISI_01', 'SES_BILGISI_02']});
	});

	it('builds a broad topic from several episodes, each in its own teaching order, notes from every one', () => {
		const broad = entry('B', 'KPSS_ONLISANS', 'PARAGRAF', ['PARAGRAF_01', 'PARAGRAF_02', 'PARAGRAF_03']);
		const first = {
			file: 'b.json',
			script: script(
				{id: 'X', category: 'KPSS_LISANS', code: 'PARAGRAFTA_ANLAM'},
				[{subtopic: 'PARAGRAFTA_ANLAM_01', alsoTeaches: ['KPSS_ONLISANS:PARAGRAF_03']}, {subtopic: 'PARAGRAFTA_ANLAM_02'}, {subtopic: 'PARAGRAFTA_ANLAM_03'}],
				['Birinci senaryonun notu.'],
			),
		};
		const second = {
			file: 'a.json',
			script: script({id: 'B', category: 'KPSS_ONLISANS', code: 'PARAGRAF'}, [{subtopic: 'PARAGRAF_02'}, {subtopic: 'PARAGRAF_01'}, {subtopic: undefined}], ['İkinci senaryonun notu.']),
		};
		const result = worksViewOf(broad, [first, second]);
		if (!('view' in result)) throw new Error(`missing ${result.missing}`);
		expect(result.view.sourceScripts).toEqual(['a.json', 'b.json']);
		// The own script keeps its order (02, 01, then its section without a subtopic); the other episode follows.
		expect(result.view.lesson.sections.map((section) => section.subtopic ?? section.title)).toEqual(['PARAGRAF_02', 'PARAGRAF_01', 'Terim Anlam', 'PARAGRAF_03']);
		expect(result.view.works?.additions).toEqual(['İkinci senaryonun notu.', 'Birinci senaryonun notu.']);
	});

	it('does not ask for the subtopics the topic’s own script leaves out with a reason', () => {
		const copied = entry('L', 'KPSS_LISANS', 'SES_BILGISI', ['SES_BILGISI_01', 'SES_BILGISI_02', 'SES_BILGISI_03', 'SES_BILGISI_04']);
		expect(worksViewOf(copied, [episode])).toEqual({missing: ['SES_BILGISI_04']});
		const own = {...episode, script: LessonScriptSchema.parse({...episode.script, outOfScope: [{codes: ['SES_BILGISI_04'], reason: 'Başka konunun alt konusu kopyalanmış (VeriDuzeltmeleri).'}]})};
		expect('view' in worksViewOf(copied, [own])).toBe(true);
	});
});
