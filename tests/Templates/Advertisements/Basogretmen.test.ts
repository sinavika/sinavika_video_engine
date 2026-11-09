import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {findTemplate} from '../../../src/Templates/TemplateRegistry';
import {ROOT} from '../../Support/Paths';

const template = findTemplate('Basogretmen')!;
const job = JSON.parse(readFileSync(path.join(ROOT, 'Posts/2026-11-24_Basogretmen24Kasim/Job.json'), 'utf8'));
const clip = (durationSeconds: number) => ({src: 'Narration/x.mp3', startSeconds: 0, durationSeconds, playbackRate: 1});
// The narration as voiced: the date line about 2.3 s, the call line about 6.5 s.
const voiceClips = {date: clip(2.3), call: clip(6.5), time: clip(6), thanks: clip(7)};

describe('Başöğretmen: his voice after the narration (24 Kasım 2026 revision)', () => {
	const content = template.contentSchema.parse(job.content) as {archive: {shots: {seconds: number}[]; speech?: {from: number; to: number; words: {text: string; at: number}[]}}};
	const archive = template.buildScenes(content, voiceClips)[0];
	const speech = content.archive.speech!;

	it('is the verified sentence from the Onuncu Yıl Nutku, word by word inside the cut', () => {
		expect(speech.words.map((word) => word.text).join(' ')).toBe('Türk milletinin yürümekte olduğu terakki ve medeniyet yolunda, elinde ve kafasında tuttuğu meşale, müspet ilimdir.');
		const times = speech.words.map((word) => word.at);
		expect(times).toEqual([...times].sort((a, b) => a - b));
		expect(times[0]).toBeGreaterThanOrEqual(0);
		expect(times[times.length - 1]).toBeLessThan(speech.to - speech.from);
	});

	it('fills the quiet pictures: the archive lasts until his last word, never shorter than the pictures', () => {
		const narrated = 2.3 + 6.5 + 2 * (0.3 + 0.15);
		const shots = content.archive.shots.reduce((sum, shot) => sum + shot.seconds, 0);
		expect(archive.seconds).toBeGreaterThanOrEqual(shots);
		expect(archive.seconds).toBeCloseTo(Math.max(shots, narrated + 0.6 + (speech.to - speech.from) + 0.8), 0);
		// No silent stretch longer than a breath between the narration and his voice.
		expect(archive.seconds - narrated - (speech.to - speech.from)).toBeLessThan(2);
	});

	it('keeps the narration its own length when there is no speech', () => {
		const {speech: _speech, ...rest} = job.content.archive;
		const plain = template.contentSchema.parse({...job.content, archive: rest}) as typeof content;
		const shots = plain.archive.shots.reduce((sum, shot) => sum + shot.seconds, 0);
		expect(template.buildScenes(plain, voiceClips)[0].seconds).toBeCloseTo(shots, 0);
	});
});
