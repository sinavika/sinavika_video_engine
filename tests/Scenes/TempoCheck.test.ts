import {describe, expect, it} from 'vitest';
import {snapScenesToBeats} from '../../src/Scenes/Rhythm';
import type {ScenePlan, TemplateScene} from '../../src/Scenes/ScenePlan';
import {tempoWarnings} from '../../src/Scenes/TempoCheck';
import type {VoiceClips} from '../../src/Scenes/Voiceover';

const FPS = 30;
const clip = (seconds: number) => ({src: 'Voiceovers/x.wav', startSeconds: 0, durationSeconds: seconds, playbackRate: 1, words: [{text: 'bir', startSeconds: 0}, {text: 'son', startSeconds: seconds - 0.4}]});
const scene = (id: string, seconds: number, lead: number): TemplateScene => ({id, seconds, element: null, voice: [{id, text: id, seconds, lead}]});
const plan = (scenes: readonly TemplateScene[]): ScenePlan => {
	let from = 0;
	return {scenes: scenes.map((entry) => ({id: entry.id, from: (from += entry.seconds * FPS) - entry.seconds * FPS, durationInFrames: entry.seconds * FPS})), durationInFrames: from, transitionFrames: 0};
};

describe('tempo checked on the recording (Sosyal Medya, 15 Nov 2026)', () => {
	const limits = {maxLineGapSeconds: 0.35, maxSceneSeconds: 4.5, maxPictureGapSeconds: 1.5};

	it('passes lines that nearly touch, short scenes and a picture that keeps changing', () => {
		const scenes = [scene('a', 2, 0.1), scene('b', 2, 0.1)];
		const clips: VoiceClips = {a: clip(1.8), b: clip(1.8)};
		expect(tempoWarnings(scenes, plan(scenes), clips, FPS, limits, [[1], [1]])).toEqual([]);
	});

	it('reports the silence between lines, a long scene and a picture that stands still', () => {
		// With the lesson lead (0.3) and a recording that ends early, almost a second of silence between lines.
		const scenes = [scene('a', 5, 0.3), scene('b', 2, 0.3)];
		const clips: VoiceClips = {a: clip(3.8), b: clip(1.5)};
		const warnings = tempoWarnings(scenes, plan(scenes), clips, FPS, limits);
		expect(warnings.some((warning) => warning.includes('"a" ile "b" arasında') && warning.includes('sessizlik'))).toBe(true);
		expect(warnings.some((warning) => warning.includes('"a" sahnesi 5,00 sn'))).toBe(true);
		expect(warnings.some((warning) => warning.includes('görüntü 5,00 sn değişmiyor'))).toBe(true);
		// The closing card is not measured.
		const withCard = [...scenes, {id: 'card', seconds: 9, element: null}];
		expect(tempoWarnings(withCard, plan(withCard), clips, FPS, limits, [[1.4, 2.8, 4.2], [1]]).filter((warning) => warning.includes('card'))).toEqual([]);
	});
});

describe('cuts wait for the beat only within the silence budget', () => {
	const scenes: TemplateScene[] = [
		{id: 'a', seconds: 1.8, element: null},
		{id: 'b', seconds: 1.8, element: null},
		{id: 'c', seconds: 2, element: null},
	];
	const beats = Array.from({length: 20}, (_, index) => index * 0.5);

	it('holds every cut to the next beat when nothing limits it', () => {
		expect(snapScenesToBeats(scenes, beats).map((scene) => scene.seconds)).toEqual([2, 2, 2]);
	});

	it('leaves a cut where it is when the beat is further than its room (Sosyal Medya, 15 Nov 2026)', () => {
		// The first cut may move 0.2 s (the next beat is 0.2 away); the second only 0.1 (its beat is 0.2 away): it stays.
		const room = [0.2, 0.1];
		expect(snapScenesToBeats(scenes, beats, (index) => room[index]).map((scene) => scene.seconds)).toEqual([2, 1.8, 2]);
	});
});
