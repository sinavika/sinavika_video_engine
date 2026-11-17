import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {lookNameOf, repeatedLooks} from '../../src/Components/Story/StoryLook';
import {SINAVIKA_TR_TEMPO} from '../../src/Configurations/SocialTempo';
import {VOICE_PROFILES} from '../../src/Configurations/Voices';
import {StudyDeskStory} from '../../src/Templates/Advertisements/StudyDeskStory/StudyDeskStory';

/**
 * sinavika.tr's approved reel pace (owner, 15 Nov 2026: "Bu tempo iyi"), held
 * on the template and on every sinavika.tr job in Posts/Seri-SinavikaTr.
 */
const JOBS_DIR = path.join(__dirname, '../../Posts/Seri-SinavikaTr');
const JOBS = readdirSync(JOBS_DIR)
	.filter((name) => name.endsWith('.json'))
	.sort()
	.map((name) => ({name, job: JSON.parse(readFileSync(path.join(JOBS_DIR, name), 'utf8'))}));

const words = (text: string): number => text.trim().split(/\s+/).length;

describe('sinavika.tr tempo', () => {
	it('the standard is livelier than the natural pace and the voice profile exists', () => {
		const {voiceover} = SINAVIKA_TR_TEMPO;
		expect(voiceover.pace).toBeGreaterThan(1);
		expect(VOICE_PROFILES[voiceover.profile].stability).toBeLessThan(VOICE_PROFILES.Launch.stability);
	});

	it('the template cuts hard and keeps the content within the standard length', () => {
		expect(StudyDeskStory.transition).toEqual({preset: 'none'});
		expect(StudyDeskStory.targetSeconds).toEqual(SINAVIKA_TR_TEMPO.contentSeconds);
		expect(SINAVIKA_TR_TEMPO.cut.punchFrom).toBeGreaterThan(1);
		expect(SINAVIKA_TR_TEMPO.cut.punchSeconds).toBeLessThanOrEqual(0.3);
	});

	it('the template keeps lines nearly touching and has the render check the real recording', () => {
		expect(SINAVIKA_TR_TEMPO.lineGap.lead + SINAVIKA_TR_TEMPO.lineGap.tail).toBeLessThanOrEqual(SINAVIKA_TR_TEMPO.maxLineGapSeconds);
		expect(SINAVIKA_TR_TEMPO.lineGap.trimTail).toBe(true);
		expect(StudyDeskStory.tempo?.limits).toEqual({maxLineGapSeconds: SINAVIKA_TR_TEMPO.maxLineGapSeconds, maxSceneSeconds: SINAVIKA_TR_TEMPO.maxSceneSeconds, maxPictureGapSeconds: SINAVIKA_TR_TEMPO.maxPictureGapSeconds});
		expect(StudyDeskStory.tempo?.pictureChanges).toBeTypeOf('function');
	});

	it('there is at least one sinavika.tr job', () => {
		expect(JOBS.length).toBeGreaterThan(0);
	});

	it.each(JOBS)('$name uses the approved voice, the template and the music tempo', ({job}) => {
		expect(job.template).toBe(StudyDeskStory.id);
		expect(job.voiceover).toMatchObject(SINAVIKA_TR_TEMPO.voiceover);
		const bpm = Number(/(\d+)\s*BPM/.exec(job.soundtrack?.music ?? '')?.[1]);
		expect(bpm).toBeGreaterThanOrEqual(SINAVIKA_TR_TEMPO.musicBpm.min);
		expect(bpm).toBeLessThanOrEqual(SINAVIKA_TR_TEMPO.musicBpm.max);
	});

	it.each(JOBS)('$name keeps every line short and changes the picture often', ({job}) => {
		const content = StudyDeskStory.contentSchema.parse(job.content);
		const long = content.beats.filter((beat) => words(beat.narration) > SINAVIKA_TR_TEMPO.lineMaxWords).map((beat) => beat.id);
		expect(long).toEqual([]);
		// Without voice clips every scene is the estimate, capped at the standard's longest scene.
		const scenes = StudyDeskStory.buildScenes(content).filter((scene) => scene.id !== 'outro');
		expect(Math.max(...scenes.map((scene) => scene.seconds))).toBeLessThanOrEqual(SINAVIKA_TR_TEMPO.maxSceneSeconds);
		expect(scenes.length).toBeGreaterThanOrEqual(Math.ceil(SINAVIKA_TR_TEMPO.contentSeconds.min / SINAVIKA_TR_TEMPO.maxSceneSeconds));
	});

	it.each(JOBS)('$name paints only key words its phrase really says', ({job}) => {
		// KeyPhrase drops punctuation from the phrase's words, so "bırakma!" as a keyword would never light up.
		const plain = (word: string) => word.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]/gu, '');
		const missing = StudyDeskStory.contentSchema
			.parse(job.content)
			.beats.flatMap((beat) => beat.items)
			.flatMap((item) => {
				if (item.kind !== 'phrase') return [];
				const words = new Set(item.text.split(/\s+/).map(plain));
				return item.keywords.flatMap((keyword) => keyword.toLocaleLowerCase('tr').split(/\s+/)).filter((word) => !words.has(word)).map((word) => `${item.text}: ${word}`);
			});
		expect(missing).toEqual([]);
	});

	it('no two videos in a row share a look (owner, 17 Nov 2026), the pilots made before looks existed aside', () => {
		// Produced on the one navy ground before 17 Nov 2026; listed by name, never by date (rules are general).
		const BEFORE_LOOKS = new Set(['01-Cok-Calismak-Yetmiyor.json', '02-Deneme-Sonrasi.json', '03-Telefonunu-Birakma.json', '04-Neden-Unutuyoruz.json', '05-SinoAI-Sinavda.json', '06-Ayni-Yanlis.json', '07-Ogrenci-Laboratuvari.json']);
		const series = JOBS.filter(({name}) => !BEFORE_LOOKS.has(name)).map(({name, job}) => ({name, look: lookNameOf(job)}));
		expect(repeatedLooks(series)).toEqual([]);
	});
});
