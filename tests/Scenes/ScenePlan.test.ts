import {describe, expect, it} from 'vitest';
import {countWords, estimateReadingSeconds, resolveSceneSeconds} from '../../src/Scenes/SceneDuration';
import {activeSceneIndex, planScenes, sceneProgressAt} from '../../src/Scenes/ScenePlan';

const timings = [
	{id: 'a', seconds: 2},
	{id: 'b', seconds: 3},
	{id: 'c', seconds: 1.5},
];

describe('planScenes', () => {
	it('lays scenes back to back when there is no transition', () => {
		const plan = planScenes(timings, 30);
		expect(plan.scenes).toEqual([
			{id: 'a', from: 0, durationInFrames: 60},
			{id: 'b', from: 60, durationInFrames: 90},
			{id: 'c', from: 150, durationInFrames: 45},
		]);
		expect(plan.durationInFrames).toBe(195);
	});

	it('overlaps consecutive scenes by the transition length', () => {
		const plan = planScenes(timings, 30, 0.5);
		expect(plan.transitionFrames).toBe(15);
		expect(plan.scenes.map((scene) => scene.from)).toEqual([0, 45, 120]);
		expect(plan.durationInFrames).toBe(195 - 2 * 15);
	});

	it('scales with fps so the duration in seconds stays the same', () => {
		for (const fps of [24, 25, 30, 50, 60]) {
			const plan = planScenes(timings, fps, 0.5);
			expect(plan.durationInFrames / fps).toBeCloseTo(5.5, 1);
		}
	});

	it('never makes a scene shorter than its transitions', () => {
		const plan = planScenes([{id: 'a', seconds: 0.1}, {id: 'b', seconds: 0.1}], 30, 0.5);
		plan.scenes.forEach((scene) => expect(scene.durationInFrames).toBeGreaterThan(2 * plan.transitionFrames));
	});

	it('uses no transition for a single scene', () => {
		expect(planScenes([{id: 'only', seconds: 2}], 30, 0.5)).toMatchObject({transitionFrames: 0, durationInFrames: 60});
	});

	it('reports scene progress and the active scene', () => {
		const plan = planScenes(timings, 30);
		expect(sceneProgressAt(plan, 105)).toEqual([1, 0.5, 0]);
		expect(activeSceneIndex(plan, 0)).toBe(0);
		expect(activeSceneIndex(plan, 105)).toBe(1);
		expect(activeSceneIndex(plan, 9999)).toBe(2);
	});
});

describe('scene duration', () => {
	it('counts formulas and markup as words, not characters', () => {
		expect(countWords('Bir **iki** üç')).toBe(3);
		expect(countWords('$\\frac{a}{b}$ kaçtır?')).toBeGreaterThanOrEqual(3);
	});

	it('grows with text length and respects the bounds', () => {
		const short = estimateReadingSeconds(['kısa metin']);
		const long = estimateReadingSeconds(['uzun '.repeat(30)]);
		expect(long).toBeGreaterThan(short);
		expect(estimateReadingSeconds([''], {minSeconds: 4})).toBe(4);
		expect(estimateReadingSeconds(['kelime '.repeat(500)], {maxSeconds: 9})).toBe(9);
	});

	it('lets an explicit duration win over narration, and narration over text', () => {
		const texts = ['ekrandaki metin'];
		expect(resolveSceneSeconds({durationSeconds: 7.25, narration: 'a b c'}, texts)).toBe(7.25);
		const narrated = resolveSceneSeconds({narration: 'kelime '.repeat(46)}, texts);
		expect(narrated).toBeCloseTo(0.6 + 46 / 2.3, 1);
		expect(resolveSceneSeconds({}, texts)).toBe(estimateReadingSeconds(texts));
	});
});
