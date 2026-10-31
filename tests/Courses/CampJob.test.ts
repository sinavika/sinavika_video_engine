import {describe, expect, it} from 'vitest';
import {CampSchema} from '../../src/Courses/Camp';
import {CampJobSpecSchema, campJobFiles, campJobNumber} from '../../src/Courses/CampJob';
import {CAMP_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {LessonScriptSchema} from '../../src/Courses/LessonScript';

const script = LessonScriptSchema.parse(CAMP_SCRIPT_SAMPLE);
const SCRIPT_FILE = 'Curriculum/Scripts/YKS_TYT/TRK/SOZCUKTE_ANLAM.json';
const camp = CampSchema.parse({
	id: 'yks-tyt-turkce-kampi',
	name: 'TYT Türkçe kampı',
	category: 'YKS_TYT',
	lesson: 'TRK',
	lessonName: 'Türkçe',
	exams: ['YKS', 'TYT'],
	promise: 'Türkçe konularının hepsi, sırayla ve soru çözerek.',
	lessons: [
		{topic: 'SOZCUKTE_ANLAM', title: 'Sözcükte Anlam'},
		{topic: 'SOZ_YORUMU', title: 'Söz Yorumu'},
	],
});
const spec = CampJobSpecSchema.parse({
	number: 1,
	slug: 'sozcukte-anlam',
	code: 'SOZCUKTE_ANLAM',
	stem: 'Sozcukte_Anlam',
	titleA: 'YKS TYT Türkçe | Sözcükte Anlam Konu Anlatımı | Kamp Ders 1',
	titleB: 'YKS TYT Türkçe | Gerçek, Mecaz, Terim | Ders 1',
	titleC: 'YKS TYT Türkçe | Mecazı Nasıl Yakalarsın? | Ders 1',
	intro: 'TYT Türkçe kampının ilk dersi.',
	bullets: ['Gerçek ve mecaz anlam'],
	hashtags: '#TYT #YKS',
	tags: 'tyt türkçe, sözcükte anlam',
	schedule: 'sahibin kararı',
});
const files = (overrides: {spec?: Partial<typeof spec>; camp?: Partial<typeof camp>} = {}) =>
	Object.fromEntries(campJobFiles({...spec, ...overrides.spec}, script, SCRIPT_FILE, {...camp, ...overrides.camp}).map((file) => [file.name, file.text]));

describe('camp jobs (npm run curriculum -- jobs make)', () => {
	it('writes a YouTube job, a reels job and the YouTube note, the jobs naming the script instead of copying it', () => {
		const written = files();
		expect(Object.keys(written)).toEqual(['01-sozcukte-anlam-youtube.json', '01-sozcukte-anlam-reels.json', '01-sozcukte-anlam-youtube.md']);
		const youtube = JSON.parse(written['01-sozcukte-anlam-youtube.json']);
		expect(youtube).toEqual({template: 'CampLesson', format: 'Horizontal', theme: 'SinavikaLight', name: 'TYT Türkçe kampı 01 Sözcükte Anlam YouTube', voiceover: true, script: SCRIPT_FILE});
		expect(JSON.parse(written['01-sozcukte-anlam-reels.json'])).toMatchObject({template: 'CampShort', format: 'Vertical', script: SCRIPT_FILE});
		expect(youtube).not.toHaveProperty('content');
	});

	it('writes the note from the script: question count, camp task in plain text, next lesson, chapters', () => {
		const note = files()['01-sozcukte-anlam-youtube.md'];
		const questions = script.lesson.sections.flatMap((section) => section.cards).filter((card) => card.kind === 'question').length;
		expect(note).toContain(`✅ ${questions} TYT tarzı soru, adım adım çözümle`);
		expect(note).toContain("2. Sınavika'da Sözcükte Anlam testinden 10 soru çöz.");
		expect(note).not.toContain('**');
		expect(note).toContain('⏭️ Sıradaki ders: Söz Yorumu.');
		expect(note).toContain('`Outputs/Videos/YKS/TYT/Turkce/01_Sozcukte_Anlam/Sozcukte_Anlam_YouTube.mp4`');
		expect(note).toContain('TYT Türkçe Kampı | Sınavika · YKS Kampı | Sınavika');
		expect(note).toContain('Bölüm 0: https://youtu.be/');
	});

	it('names a KPSS lesson by its own exam: output folder, question style, playlist, no YKS episode 0', () => {
		const kpss = LessonScriptSchema.parse({...CAMP_SCRIPT_SAMPLE, topic: {...CAMP_SCRIPT_SAMPLE.topic, category: 'KPSS_LISANS', lesson: 'VAT', code: 'VAT_HUKUK_TEMEL'}, camp: {...CAMP_SCRIPT_SAMPLE.camp!, id: 'kpss-vatandaslik-kampi', name: 'KPSS Vatandaşlık kampı'}});
		const kpssCamp = {...camp, id: 'kpss-vatandaslik-kampi', name: 'KPSS Vatandaşlık kampı', category: 'KPSS', lesson: 'VAT', exams: ['KPSS']};
		const note = campJobFiles({...spec, code: 'VAT_HUKUK_TEMEL', slug: 'hukukun-temel-kavramlari', stem: 'Hukukun_Temel_Kavramlari'}, kpss, 'Curriculum/Scripts/KPSS/VAT/VAT_HUKUK_TEMEL.json', kpssCamp).find((file) => file.name.endsWith('.md'))!.text;
		expect(note).toContain('`Outputs/Videos/KPSS/Vatandaslik/01_Hukukun_Temel_Kavramlari/');
		expect(note).toContain('KPSS tarzı soru');
		expect(note).toContain('KPSS Vatandaşlık Kampı | Sınavika · KPSS Kampı | Sınavika');
		expect(note).toContain('Bölüm 0: (yayın linki)');
	});

	it('refuses a spec or a camp that does not match the script', () => {
		expect(() => files({spec: {number: 2}})).toThrow(/lesson 1 of its camp, the spec says 2/);
		expect(() => files({camp: {id: 'yks-ayt-edebiyat-kampi'}})).toThrow(/is in camp yks-tyt-turkce-kampi/);
		expect(() => CampJobSpecSchema.parse({...spec, slug: 'Sözcükte Anlam'})).toThrow();
	});

	it('tells a camp lesson job by its file name, and leaves episode 0 and notes out', () => {
		expect(campJobNumber('07-mayoz-ve-eseyli-ureme-youtube.json')).toBe(7);
		expect(campJobNumber('12-sinaps-reels.json')).toBe(12);
		expect(campJobNumber('00-kamp-tanitimi-youtube.json')).toBeUndefined();
		expect(campJobNumber('07-mayoz-ve-eseyli-ureme-youtube.md')).toBeUndefined();
	});
});
