import {describe, expect, it} from 'vitest';
import {narrationPacingWarnings} from '../../src/Services/NarrationPacing';
import type {VoiceClips} from '../../src/Scenes/Voiceover';

/** A clip of `count` short words, one every `step` seconds. */
const clip = (count: number, step: number, pauseAfter?: number): VoiceClips[string] => {
	let at = 0;
	const words = Array.from({length: count}, (_, index) => {
		const word = {text: index === count - 1 ? 'son.' : 'kelime', startSeconds: at};
		at += step + (index === pauseAfter ? 2.5 : 0);
		return word;
	});
	return {src: 'Voiceovers/x.wav', startSeconds: 0, durationSeconds: at, playbackRate: 1, words};
};

describe('narration pacing', () => {
	it('says nothing about an evenly read narration', () => {
		expect(narrationPacingWarnings({a: clip(10, 0.45), b: clip(12, 0.42), c: clip(8, 0.5)})).toEqual([]);
	});

	it('reports a line rushed through and a silence inside a sentence', () => {
		const warnings = narrationPacingWarnings({a: clip(10, 0.45), b: clip(12, 0.42), c: clip(8, 0.5), formula: clip(10, 0.2), slow: clip(10, 0.45, 4)});
		expect(warnings.some((line) => line.includes('"formula"') && line.includes('hızlı'))).toBe(true);
		expect(warnings.some((line) => line.includes('"slow"') && line.includes('sessizlik'))).toBe(true);
	});

	it('needs a few measured lines before it judges', () => {
		expect(narrationPacingWarnings({a: clip(10, 0.2), b: clip(3, 1)})).toEqual([]);
	});
});
