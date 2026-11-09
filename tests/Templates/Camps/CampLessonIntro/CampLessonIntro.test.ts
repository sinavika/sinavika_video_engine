import {readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {readVideoJob} from '../../../../src/Renderers/VideoJobFile';
import {phraseTimes} from '../../../../src/Scenes/Voiceover';
import {CampLessonIntro} from '../../../../src/Templates/Camps/CampLessonIntro/CampLessonIntro';
import {barTimes} from '../../../../src/Templates/Camps/CampLessonIntro/Scenes/DistributionScene';
import {ROOT} from '../../../Support/Paths';

const JOBS = path.join(ROOT, 'Curriculum', 'Jobs');
/** Every camp's episode 0, parsed as the renderer reads it (lesson scripts filled in). */
const intros = readdirSync(JOBS).flatMap((campId) =>
	readdirSync(path.join(JOBS, campId))
		.filter((name) => /^00-.*-tanitim-youtube\.json$/.test(name))
		.map((name) => ({campId, job: readVideoJob(path.join(JOBS, campId, name)) as {template: string; content: unknown}}))
		.filter(({job}) => job.template === 'CampLessonIntro')
		.map(({campId, job}) => ({campId, content: CampLessonIntro.contentSchema.parse(job.content)})),
);

const NUMBER_WORDS: Record<number, string> = {2: 'iki', 3: 'üç', 4: 'dört', 5: 'beş'};
const firstSentence = (text: string) => text.split(/(?<=[.?!:])\s/)[0];

describe('distribution bars (barTimes)', () => {
	it('grows a named bar when it is heard, keeping the order when a cue comes early', () => {
		expect(barTimes([3, 5, 4], 12)).toEqual([3, 5, 5]);
	});

	it('grows the bars the narration never names after the last named one, one by one, before the scene ends', () => {
		const times = barTimes([6, 7, undefined, undefined], 12);
		expect(times.slice(0, 2)).toEqual([6, 7]);
		expect(times[2]).toBeGreaterThan(7);
		expect(times[3]).toBeGreaterThan(times[2]);
		expect(times[3]).toBeLessThan(12);
	});

	it('keeps every bar inside a short scene', () => {
		for (const at of barTimes([9, undefined, undefined, undefined, undefined], 10)) expect(at).toBeLessThan(10);
	});
});

// Building the scenes of every camp's episode 0 takes a few seconds when the whole suite runs at once.
describe('camp episode 0: owner rules of 9 Nov 2026', {timeout: 60_000}, () => {
	it('exists for every camp', () => expect(intros.length).toBeGreaterThanOrEqual(29));

	it('names the distribution topics top down: the named bars first, in bar order; the unnamed ones only after them', () => {
		for (const {campId, content} of intros) {
			const d = content.distribution;
			const heard = phraseTimes(undefined, d.narration, d.topics.map((topic) => topic.cue ?? topic.title), 40);
			const named = heard.map((at) => at !== undefined);
			expect(named[0], `${campId}: the largest bar must be named`).toBe(true);
			expect(named.indexOf(false) === -1 || named.slice(named.indexOf(false)).every((value) => !value), `${campId}: a named topic after an unnamed one`).toBe(true);
		}
	});

	it('grows the bars on screen in order: no bar before the one above it, the unnamed after every named one', () => {
		for (const {campId, content} of intros) {
			const scene = CampLessonIntro.buildScenes(content, {}).find((entry) => entry.id === 'distribution');
			const rowAt = (scene?.element as {props: {rowAt: number[]}}).props.rowAt;
			for (let index = 1; index < rowAt.length; index++) expect(rowAt[index], `${campId} bar ${index + 1}`).toBeGreaterThanOrEqual(rowAt[index - 1]);
			expect(rowAt.at(-1), campId).toBeLessThan(scene!.seconds);
		}
	});

	it('wakes the viewer before the lesson moments: a question scene opens the chapter, then the moments', () => {
		for (const {campId, content} of intros) {
			const scenes = CampLessonIntro.buildScenes(content, {});
			const flow = scenes.findIndex((scene) => scene.id === 'lesson-flow');
			expect(flow, campId).toBeGreaterThan(0);
			expect(scenes[flow].chapter, campId).toBe('Dersler nasıl işlenecek?');
			expect(scenes[flow + 1].id, campId).toBe('moment-1');
			expect(scenes.filter((scene) => scene.chapter === 'Dersler nasıl işlenecek?'), campId).toHaveLength(1);
			expect(firstSentence(content.lessonFlow.narration), campId).toMatch(/\?$/);
			expect(content.lessonFlow.narration, campId).toContain(NUMBER_WORDS[content.moments.length]);
		}
	});

	it('opens the evidence on the pedagogy and the research, and says how many proofs follow', () => {
		for (const {campId, content} of intros) {
			const {narration, cards} = content.evidence;
			expect(firstSentence(narration), campId).toMatch(/pedagojik/);
			expect(firstSentence(narration), campId).toMatch(/araştırma/);
			expect(narration, campId).toContain(`${NUMBER_WORDS[cards.length]} kanıt`);
			expect(narration, campId).not.toMatch(/rastgele değil/i);
		}
	});
});
