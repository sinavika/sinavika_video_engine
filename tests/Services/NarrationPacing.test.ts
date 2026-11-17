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

describe('formula lines and prose are paced apart', () => {
	const line = (texts: string[], step: number): VoiceClips[string] => ({
		src: 'Voiceovers/x.wav',
		startSeconds: 0,
		durationSeconds: texts.length * step,
		playbackRate: 1,
		words: texts.map((text, index) => ({text, startSeconds: index * step})),
	});
	const formula = ['a', 'çarpı', 'x', 'artı', 'b', 'çarpı', 'x', 'eşittir', 'x', 'parantez'];
	const prose = ['Neden', 'çalıştığını', 'görmek', 'için', 'dört', 'terimi', 'tabloya', 'yerleştirelim.'];

	it('does not call a plain sentence rushed because the formulas of a maths lesson are slow per letter (TYT Matematik 10, 14 Nov 2026)', () => {
		const clips = {f1: line(formula, 0.4), f2: line(formula, 0.42), f3: line(formula, 0.38), f4: line(formula, 0.41), p1: line(prose, 0.5), p2: line(prose, 0.52), p3: line(prose, 0.48)};
		expect(narrationPacingWarnings(clips)).toEqual([]);
	});

	it('still finds a rushed sentence among sentences', () => {
		const clips = {f1: line(formula, 0.4), f2: line(formula, 0.42), f3: line(formula, 0.38), p1: line(prose, 0.5), p2: line(prose, 0.52), p3: line(prose, 0.48), rushed: line(prose, 0.25)};
		expect(narrationPacingWarnings(clips)).toEqual([expect.stringContaining('"rushed" satırı olağan hızın 2.0 katı hızlı')]);
	});
});
