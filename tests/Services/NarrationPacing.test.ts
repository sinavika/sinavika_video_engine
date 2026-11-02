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

	it('judges pace by letters, so a line of short spoken words (letters spelled out, years in words) is not "rushed"', () => {
		// ÖSYM 2023 ve 2026'da üçünü bir arada sordu: spelled and counted out, many short words at the usual letter pace.
		const spelled = ['Ö', 'Se', 'Ye', 'Me', 'iki', 'bin', 'yirmi', 'üç', 've', 'iki', 'bin', 'yirmi', 'altıda', 'üçünü', 'bir', 'arada', 'sordu.'];
		const letterSeconds = 0.075;
		let at = 0;
		const words = spelled.map((text) => {
			const word = {text, startSeconds: at};
			at += text.replace(/[^\p{L}]/gu, '').length * letterSeconds + 0.05;
			return word;
		});
		const step = 6 * letterSeconds + 0.05;
		const usual = (count: number) => ({src: 'Voiceovers/x.wav', startSeconds: 0, durationSeconds: count * step, playbackRate: 1, words: Array.from({length: count}, (_, index) => ({text: 'kelime', startSeconds: index * step}))});
		const warnings = narrationPacingWarnings({a: usual(10), b: usual(12), c: usual(9), lead: {src: 'Voiceovers/x.wav', startSeconds: 0, durationSeconds: at, playbackRate: 1, words}});
		expect(warnings.filter((line) => line.includes('"lead"'))).toEqual([]);
	});

	it('needs a few measured lines before it judges', () => {
		expect(narrationPacingWarnings({a: clip(10, 0.2), b: clip(3, 1)})).toEqual([]);
	});
});
