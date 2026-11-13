import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {INTRO_CODE, campScriptOfJob, campSyncEntry, contentHash, readLocalCamps} from '../../src/Courses/CampSync';

const ROOT = path.resolve(__dirname, '..', '..');

describe('camp sync (npm run camp)', () => {
	const {camps, missing} = readLocalCamps(ROOT);

	it('finds every camp lesson and episode 0 through the camp jobs', () => {
		expect(missing).toEqual([]);
		expect(camps.length).toBeGreaterThanOrEqual(29);
		for (const {camp, scripts, introTitle} of camps) {
			expect(introTitle, camp.id).toBeTruthy();
			expect(scripts.map((script) => script.code)).toEqual([INTRO_CODE, ...camp.lessons.map((lesson) => lesson.topic)]);
			expect(scripts.map((script) => script.number)).toEqual(scripts.map((_, index) => index));
		}
	});

	it('files KPSS camps under Lisans, serving Önlisans and Ortaöğretim, and lists TYT before AYT before KPSS', () => {
		const entries = camps.map(campSyncEntry);
		const kpss = entries.find((entry) => entry.slug === 'kpss-tarih-kampi')!;
		expect(kpss).toMatchObject({categorySub: 'KPSS_LISANS', lesson: 'TAR', alsoCategorySubs: ['KPSS_ONLISANS', 'KPSS_ORTAOGRETIM']});
		const tyt = entries.find((entry) => entry.slug === 'yks-tyt-matematik-kampi')!;
		expect(tyt).toMatchObject({categorySub: 'YKS_TYT', lesson: 'MAT', alsoCategorySubs: [], lessonColor: '#1E40AF'});
		expect(tyt.lessons[0]).toEqual({topic: 'MAT_TEMEL', title: 'Temel Kavramlar', lessonSubId: 'CCBC3826-453C-66B0-27E6-94C50FE3CFC3'});
		// The script's topic id says which LessonSub a lesson is (Lisans got these KPSS topics on 10 Nov 2026).
		expect(entries.find((entry) => entry.slug === 'kpss-geometri-kampi')!.lessons.find((lesson) => lesson.topic === 'GEO_DORTGEN')!.lessonSubId).toBe('8BB9C977-1F39-A668-54CB-E760AAC6F344');
		const order = entries.map((entry) => entry.categorySub);
		expect(order.indexOf('YKS_TYT')).toBeLessThan(order.indexOf('YKS_AYT'));
		expect(order.lastIndexOf('YKS_AYT')).toBeLessThan(order.indexOf('KPSS_LISANS'));
		expect(entries.map((entry) => entry.orderIndex)).toEqual(entries.map((_, index) => index + 1));
	});

	it('hashes the text as UTF-8 bytes, lower-case hex, as the API does', () => {
		expect(contentHash('ç')).toBe('8bfa829b8119a6f39b91fd8decec63830b556e4d88a9da29334d7b0558829f2d');
		expect(contentHash('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
	});

	it('knows which script a render job shows', () => {
		const jobs = path.join(ROOT, 'Curriculum', 'Jobs', 'yks-tyt-matematik-kampi');
		expect(campScriptOfJob(path.join(jobs, '01-temel-kavramlar-youtube.json'), {template: 'CampLesson', script: 'Curriculum/Scripts/YKS_TYT/MAT/MAT_TEMEL.json'}, ROOT)).toMatchObject({
			campSlug: 'yks-tyt-matematik-kampi',
			code: 'MAT_TEMEL',
		});
		expect(campScriptOfJob(path.join(jobs, '00-matematik-kampi-tanitim-youtube.json'), {template: 'CampLessonIntro'}, ROOT)).toMatchObject({campSlug: 'yks-tyt-matematik-kampi', code: INTRO_CODE});
		expect(campScriptOfJob('samples/QuestionSolution.json', {template: 'QuestionSolution'}, ROOT)).toBeUndefined();
	});

	it('checks episode 0 with its lessons read in, as the renderer reads them', async () => {
		const {checkCampIntroJob} = await import('../../src/Courses/CampScriptCheck');
		const job = JSON.parse(readFileSync(path.join(ROOT, 'Curriculum', 'Jobs', 'kpss-tarih-kampi', '00-tarih-kampi-tanitim-youtube.json'), 'utf8'));
		expect(checkCampIntroJob(job).issues).toEqual([]);
	}, 60_000);
});
