import {mkdtempSync, readFileSync, readdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {VOICEOVER_DEFAULTS} from '../src/Configurations/Voiceover';
import {resolveVideoJob, voiceLines, withVoiceClips} from '../src/Renderers/VideoJob';
import {VOICE_LEAD_SECONDS, VOICE_TAIL_SECONDS, createNarrator, type VoiceClips} from '../src/Scenes/Voiceover';
import {lowerFirst, sentences, toSpokenText, verbalizeLatex} from '../src/Schemas/SpokenText';
import type {SpeechRequest} from '../src/Services/SpeechSynthesizer';
import {VoiceoverError, generateVoiceClips, type VoiceoverSettings} from '../src/Services/VoiceoverGenerator';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

const FIXTURE = readFileSync(path.resolve(__dirname, 'Fixtures', 'Voice.mp3'));
const SETTINGS: VoiceoverSettings = {...VOICEOVER_DEFAULTS};
const spoken = (latex: string) => verbalizeLatex(latex).replace(/\s+/g, ' ').trim();

describe('spoken text', () => {
	it('reads common formulas the way a teacher would say them', () => {
		expect(spoken('x = 9')).toBe('x eşittir 9');
		expect(spoken('a^2 + b^2 = c^2')).toBe('a kare artı b kare eşittir c kare');
		expect(spoken('\\dfrac{a^m}{a^n} = a^{m-n}')).toBe('a üssü m bölü a üssü n eşittir a üssü m eksi n');
		expect(spoken('|AC| = \\sqrt{100} = 10')).toBe('A C uzunluğu eşittir karekök 100 eşittir 10');
		expect(spoken('2 \\cdot 9 + 7')).toBe('2 çarpı 9 artı 7');
		expect(spoken('90^\\circ')).toBe('90 derece');
	});

	it('strips markup and expands units in rich text', () => {
		expect(toSpokenText('Sonuç **mutlaka** $x = 5$ olur.')).toBe('Sonuç mutlaka x eşittir 5 olur.');
		expect(toSpokenText('$5$ m uzunluk, 80 dk süre, $6$ cm kenar')).toBe('5 metre uzunluk, 80 dakika süre, 6 santimetre kenar');
		expect(toSpokenText('kitap → kitabı')).toBe('kitap, kitabı');
		expect(toSpokenText('$3$–$4$–$5$ üçgeni')).toBe('3, 4, 5 üçgeni');
		expect(toSpokenText(undefined)).toBe('');
	});

	it('never leaves LaTeX syntax for the synthesiser to stumble over', () => {
		for (const template of TEMPLATES) {
			const job = resolveVideoJob({template: template.id, content: template.sampleContent});
			for (const line of voiceLines(job)) {
				expect(line.text, `${template.id}/${line.id}`).not.toMatch(/[\\${}^_*]/);
				expect(line.text.trim().length).toBeGreaterThan(3);
			}
		}
	});

	it('joins sentences and lower-cases with Turkish rules', () => {
		expect(sentences('Bir', undefined, 'İki!', false, 'Üç:')).toBe('Bir. İki! Üç:');
		expect(lowerFirst('İlk adım')).toBe('ilk adım');
		expect(lowerFirst('Isı')).toBe('ısı');
	});
});

describe('narrator', () => {
	const clips: VoiceClips = {intro: {src: 'Voiceovers/a.mp3', durationSeconds: 5}};

	it('times a line to its audio when there is a clip, to the estimate otherwise', () => {
		const say = createNarrator(clips);
		expect(say('intro', 'Merhaba', 2).seconds).toBeCloseTo(5 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS, 1);
		expect(say('other', 'Merhaba', 2).seconds).toBe(2);
	});

	it('never goes below the floor a scene needs for its animations', () => {
		const say = createNarrator({short: {src: 'Voiceovers/b.mp3', durationSeconds: 0.8}});
		expect(say('short', 'Evet', 2, 4).seconds).toBe(4);
	});

	it('lets the content script override the automatic line', () => {
		const say = createNarrator({}, {intro: 'Özel metin'});
		expect(say('intro', 'Otomatik metin', 2).text).toBe('Özel metin');
		expect(say('outro', 'Otomatik metin', 2).text).toBe('Otomatik metin');
	});
});

describe.each(TEMPLATES.map((template) => [template.id, template] as const))('%s narration', (_id, template) => {
	const job = resolveVideoJob({template: template.id, voiceover: true, content: template.sampleContent});
	const scenes = template.buildScenes(job.inputProps.content);

	it('gives every scene something to say, with unique line ids', () => {
		scenes.forEach((scene) => expect(scene.voice?.length, scene.id).toBeGreaterThan(0));
		const ids = voiceLines(job).map((line) => line.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('keeps a scene exactly as long as the lines spoken in it', () => {
		for (const scene of scenes) {
			const spokenSeconds = (scene.voice ?? []).reduce((total, slot) => total + slot.seconds, 0);
			expect(scene.seconds, scene.id).toBeCloseTo(spokenSeconds, 5);
		}
	});

	it('stretches the video to fit the audio once clips are attached', () => {
		const clips: VoiceClips = Object.fromEntries(
			voiceLines(job).map((line) => [line.id, {src: `Voiceovers/${line.id}.mp3`, durationSeconds: 12.25}]),
		);
		const narrated = withVoiceClips(job, clips);
		expect(narrated.durationInFrames).toBeGreaterThan(job.durationInFrames);
		template.buildScenes(narrated.inputProps.content, clips).forEach((scene) => {
			const lines = scene.voice?.length ?? 0;
			expect(scene.seconds, scene.id).toBeCloseTo(lines * (12.25 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS), 5);
		});
	});
});

describe('voice-over settings', () => {
	const base = {template: 'QuestionSolution', content: TEMPLATES[0].sampleContent};

	it('is off unless the job asks for it', () => {
		expect(resolveVideoJob(base).voiceover).toBeNull();
	});

	it('defaults to the Turkish female voice', () => {
		expect(resolveVideoJob({...base, voiceover: true}).voiceover).toMatchObject({
			provider: 'edge',
			voice: 'tr-TR-EmelNeural',
			language: 'tr-TR',
		});
	});

	it('lets a template set its pace and a job override anything', () => {
		const quick = {template: 'QuickRevision', content: TEMPLATES.find((entry) => entry.id === 'QuickRevision')!.sampleContent};
		expect(resolveVideoJob({...quick, voiceover: true}).voiceover?.rate).toBe('+16%');
		expect(resolveVideoJob({...quick, voiceover: {rate: '-5%', voice: 'tr-TR-AhmetNeural'}}).voiceover).toMatchObject({
			rate: '-5%',
			voice: 'tr-TR-AhmetNeural',
		});
	});

	it('rejects malformed delivery values', () => {
		expect(() => resolveVideoJob({...base, voiceover: {rate: 'fast'}})).toThrow(/rate must look like/);
		expect(() => resolveVideoJob({...base, voiceover: {provider: 'robot'}})).toThrow();
	});
});

describe('generateVoiceClips', () => {
	const lines = [
		{id: 'intro', text: 'Merhaba'},
		{id: 'outro', text: 'Hoşça kal'},
	];

	it('writes one clip per line, measures it and caches by text and voice', async () => {
		const publicDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-voice-'));
		const requests: SpeechRequest[] = [];
		const synthesizer = async (request: SpeechRequest) => {
			requests.push(request);
			return FIXTURE;
		};

		const clips = await generateVoiceClips(lines, SETTINGS, {publicDirectory, synthesizer});
		expect(Object.keys(clips)).toEqual(['intro', 'outro']);
		expect(clips.intro.src).toMatch(/^Voiceovers\/[0-9a-f]{20}\.mp3$/);
		expect(clips.intro.src).not.toBe(clips.outro.src);
		expect(clips.intro.durationSeconds).toBeGreaterThan(1);
		expect(requests.map((request) => request.text)).toEqual(['Merhaba', 'Hoşça kal']);
		expect(requests[0]).toMatchObject({voice: 'tr-TR-EmelNeural', rate: '+6%'});

		// Same text and voice: served from the cache. A different voice: synthesised again.
		await generateVoiceClips(lines, SETTINGS, {publicDirectory, synthesizer});
		expect(requests).toHaveLength(2);
		await generateVoiceClips(lines, {...SETTINGS, voice: 'tr-TR-AhmetNeural'}, {publicDirectory, synthesizer});
		expect(requests).toHaveLength(4);
		expect(readdirSync(path.join(publicDirectory, 'Voiceovers'))).toHaveLength(4);
	});

	it('retries a failing line and reports which one gave up', async () => {
		const publicDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-voice-'));
		let calls = 0;
		const flaky = async () => {
			if (++calls === 1) throw new Error('403');
			return FIXTURE;
		};
		await expect(generateVoiceClips([lines[0]], SETTINGS, {publicDirectory, synthesizer: flaky})).resolves.toHaveProperty('intro');
		expect(calls).toBe(2);
	}, 20_000);

	it('names the line in the error when synthesis keeps failing', async () => {
		const error = new VoiceoverError(lines[1], new Error('Unexpected server response: 403'));
		expect(error.message).toBe('Voice-over failed for line "outro": Unexpected server response: 403');
	});
});
