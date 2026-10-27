import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {phraseCues, VOICE_LEAD_SECONDS} from '../src/Scenes/Voiceover';
import {CampIntroSchema} from '../src/Templates/Camps/CampIntro/CampIntro';

const job = (file: string) => CampIntroSchema.parse(JSON.parse(readFileSync(path.resolve(__dirname, '..', 'Curriculum', 'Jobs', file), 'utf8')).content);
const JOBS = ['yks-tyt-turkce-kampi/00-tyt-kampi-tanitim-youtube.json', 'yks-ayt-edebiyat-kampi/00-ayt-kampi-tanitim-youtube.json'];

/** True when every phrase is found in the line, in order (a phrase that is not heard gets the -1 fallback). */
const allHeard = (text: string, phrases: readonly string[]) => phraseCues(undefined, text, phrases, phrases.map(() => -1), 30).every((seconds) => seconds >= 0);

describe('phrase cues', () => {
	it('places a phrase at its own word when the clip has word timings, and in order', () => {
		const clip = {src: 'a.wav', startSeconds: 0, durationSeconds: 4, playbackRate: 1, words: [{text: 'Dört', startSeconds: 0}, {text: 'yanlış,', startSeconds: 0.4}, {text: 'bir', startSeconds: 1}, {text: 'doğruyu', startSeconds: 1.3}, {text: 'götürür.', startSeconds: 2}]};
		const [wrong, taken] = phraseCues(clip, 'Dört yanlış, bir doğruyu götürür.', ['dört yanlış', 'götürür'], [9, 9]);
		expect(wrong).toBeCloseTo(VOICE_LEAD_SECONDS - 0.08);
		expect(taken).toBeCloseTo(VOICE_LEAD_SECONDS + 2 - 0.08);
	});

	it('hears abbreviations as they are said and suffixes after them', () => {
		const clip = {src: 'a.wav', startSeconds: 0, durationSeconds: 3, playbackRate: 1, words: [{text: 'yekasenin', startSeconds: 0.2}, {text: 'ilk', startSeconds: 0.9}]};
		expect(phraseCues(clip, "YKS'nin ilk", ['YKS'], [9])[0]).toBeCloseTo(VOICE_LEAD_SECONDS + 0.2 - 0.08);
	});
});

describe.each(JOBS)('CampIntro %s', (file) => {
	const content = job(file);

	it('lands every element on words its narration really says', () => {
		expect(allHeard(content.hook.narration, content.hook.cues ?? content.hook.beats)).toBe(true);
		expect(allHeard(content.anatomy.narration, content.anatomy.tests.map((test) => test.cue ?? test.name))).toBe(true);
		expect(allHeard(content.anatomy.narration, [content.anatomy.clockCue ?? 'dakika'])).toBe(true);
		const n = content.net.cues;
		expect(allHeard(content.net.narration, [n.wrong ?? 'dört yanlış', n.taken ?? 'götürür', n.blank ?? 'boş', n.example ?? 'mesela'])).toBe(true);
		expect(allHeard(content.score.narration, content.score.cards.map((card) => card.cue ?? card.title))).toBe(true);
		const firstName = content.camp.lessons.find((lesson) => lesson.code === content.camp.first)?.name ?? '';
		expect(allHeard(content.camp.narration, [content.camp.cues.total ?? 'konu', content.camp.cues.first ?? firstName, content.camp.cues.cadence ?? 'her gün'])).toBe(true);
		expect(allHeard(content.episodeParts.narration, content.episodeParts.parts.map((part) => part.cue ?? part.title))).toBe(true);
		expect(allHeard(content.method.narration, content.method.cues ?? ['bir', 'iki', 'üç', 'dört'].slice(0, content.method.steps.length))).toBe(true);
		expect(allHeard(content.app.narration, content.app.screens.map((item) => item.cue ?? item.caption))).toBe(true);
		expect(allHeard(content.closing.narration, [content.closing.cues.subscribe ?? 'abone', content.closing.cues.stores ?? 'App Store'])).toBe(true);
	});

	it('writes no division sign, which the brand font does not have', () => {
		expect(JSON.stringify(content)).not.toContain('÷');
	});
});
