import {mkdtempSync, readFileSync, readdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {VOICES, VOICE_PROFILES, VOICE_PROFILE_KEYS, type VoiceKey} from '../src/Configurations/Voices';
import {resolveVideoJob, voiceLines, withVoiceClips} from '../src/Renderers/VideoJob';
import {VOICE_LEAD_SECONDS, VOICE_TAIL_SECONDS, createNarrator, type VoiceClips} from '../src/Scenes/Voiceover';
import {lowerFirst, sentences, toSpokenText, verbalizeLatex} from '../src/Schemas/SpokenText';
import {SpeechError, type SpeechBackend} from '../src/Services/ElevenLabsSpeech';
import {VoiceCastingError, castVoice, type VoiceCast} from '../src/Services/VoiceCasting';
import {VoiceoverError, generateVoiceover} from '../src/Services/VoiceoverGenerator';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

const FIXTURE = readFileSync(path.resolve(__dirname, 'Fixtures', 'Voice.mp3'));

const idsOf = (...voices: VoiceKey[]) => new Set(voices.map((voice) => VOICES[voice].elevenLabsId));
const DEFAULT_VOICES = (Object.keys(VOICES) as VoiceKey[]).filter((voice) => VOICES[voice].origin === 'multilingual');
const EVERY_VOICE = Object.keys(VOICES) as VoiceKey[];

/** Offline stand-in for ElevenLabs that records what it was asked to say. */
const fakeSpeech = (overrides: Partial<SpeechBackend> = {}) => {
	const spoken: {text: string; cast: VoiceCast}[] = [];
	const speech: SpeechBackend = {
		availableVoiceIds: async () => idsOf(...DEFAULT_VOICES),
		remainingCharacters: async () => 10_000,
		synthesize: async (text, cast) => {
			spoken.push({text, cast});
			return FIXTURE;
		},
		...overrides,
	};
	return {speech, spoken};
};
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
	const clips: VoiceClips = {intro: {src: 'Voiceovers/a.mp3', durationSeconds: 5, playbackRate: 1}};

	it('times a line to its audio when there is a clip, to the estimate otherwise', () => {
		const say = createNarrator(clips);
		expect(say('intro', 'Merhaba', 2).seconds).toBeCloseTo(5 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS, 1);
		expect(say('other', 'Merhaba', 2).seconds).toBe(2);
	});

	it('never goes below the floor a scene needs for its animations', () => {
		const say = createNarrator({short: {src: 'Voiceovers/b.mp3', durationSeconds: 0.8, playbackRate: 1}});
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
			voiceLines(job).map((line) => [line.id, {src: `Voiceovers/${line.id}.mp3`, durationSeconds: 12.25, playbackRate: 1}]),
		);
		const narrated = withVoiceClips(job, clips);
		expect(narrated.durationInFrames).toBeGreaterThan(job.durationInFrames);
		template.buildScenes(narrated.inputProps.content, clips).forEach((scene) => {
			const lines = scene.voice?.length ?? 0;
			expect(scene.seconds, scene.id).toBeCloseTo(lines * (12.25 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS), 5);
		});
	});
});

describe('voice catalogue', () => {
	it('gives every profile a native Turkish first choice and a default-voice fallback', () => {
		for (const key of VOICE_PROFILE_KEYS) {
			const voices = VOICE_PROFILES[key].voices.map((voice) => VOICES[voice]);
			expect(voices[0].origin, key).toBe('native');
			expect(voices.some((voice) => voice.origin === 'multilingual'), key).toBe(true);
		}
	});

	it('casts only female voices by default', () => {
		for (const key of VOICE_PROFILE_KEYS) {
			VOICE_PROFILES[key].voices.forEach((voice) => expect(VOICES[voice].gender, `${key}/${voice}`).toBe('female'));
		}
	});

	it('has no two catalogue entries pointing at the same ElevenLabs voice', () => {
		const ids = EVERY_VOICE.map((voice) => VOICES[voice].elevenLabsId);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('castVoice', () => {
	it('casts the native Turkish voice when the account has it', () => {
		const cast = castVoice({profile: 'Teacher'}, idsOf(...EVERY_VOICE));
		expect(cast).toMatchObject({voice: 'Derya', native: true, modelId: 'eleven_v3', languageCode: 'tr'});
		expect(cast.note).toBeUndefined();
	});

	it('falls back along the shortlist and says so', () => {
		const cast = castVoice({profile: 'Teacher'}, idsOf(...DEFAULT_VOICES));
		expect(cast).toMatchObject({voice: 'Sarah', native: false});
		expect(cast.note).toMatch(/Derya is not in the account; using Sarah/);
	});

	it('gives each kind of video its own narrator and tempo', () => {
		const available = idsOf(...EVERY_VOICE);
		expect(castVoice({profile: 'Energizer'}, available)).toMatchObject({voice: 'Damla', pace: 1.12});
		expect(castVoice({profile: 'Lecturer'}, available).voice).toBe('Melis');
		expect(castVoice({profile: 'Coach'}, available).voice).toBe('Ayca');
		expect(castVoice({profile: 'Promoter'}, available).voice).toBe('Nisa');
	});

	it('honours an explicit voice, model and pace', () => {
		const cast = castVoice({profile: 'Teacher', voice: 'Daniel', model: 'stable', pace: 0.95}, idsOf(...EVERY_VOICE));
		expect(cast).toMatchObject({voice: 'Daniel', modelId: 'eleven_multilingual_v2', pace: 0.95});
		// Multilingual v2 does not take a language hint.
		expect(cast.languageCode).toBeUndefined();
	});

	it('refuses an explicit voice the account cannot use, instead of silently swapping it', () => {
		expect(() => castVoice({profile: 'Teacher', voice: 'Derya'}, idsOf(...DEFAULT_VOICES))).toThrow(VoiceCastingError);
		expect(() => castVoice({profile: 'Teacher'}, new Set())).toThrow(/None of the voices of profile "Teacher"/);
	});
});

describe('voice-over in a job', () => {
	const base = {template: 'QuestionSolution', content: TEMPLATES[0].sampleContent};
	const sampleOf = (id: string) => ({template: id, content: TEMPLATES.find((entry) => entry.id === id)!.sampleContent});

	it('is off unless the job asks for it', () => {
		expect(resolveVideoJob(base).voiceover).toBeNull();
	});

	it('uses the profile of the template', () => {
		expect(resolveVideoJob({...base, voiceover: true}).voiceover).toEqual({profile: 'Teacher'});
		expect(resolveVideoJob({...sampleOf('TopicExplanation'), voiceover: true}).voiceover?.profile).toBe('Lecturer');
		expect(resolveVideoJob({...sampleOf('QuickRevision'), voiceover: true}).voiceover?.profile).toBe('Energizer');
		expect(resolveVideoJob({...sampleOf('ConceptExplanation'), voiceover: true}).voiceover?.profile).toBe('Teacher');
		expect(resolveVideoJob({...sampleOf('ExamPreparation'), voiceover: true}).voiceover?.profile).toBe('Coach');
	});

	it('lets a job recast: another profile, voice, model or pace', () => {
		const job = resolveVideoJob({...base, voiceover: {profile: 'Creator', voice: 'Liam', model: 'stable', pace: 1.1}});
		expect(job.voiceover).toEqual({profile: 'Creator', voice: 'Liam', model: 'stable', pace: 1.1});
	});

	it('rejects unknown voices, profiles and extreme tempos', () => {
		expect(() => resolveVideoJob({...base, voiceover: {voice: 'Morgan'}})).toThrow();
		expect(() => resolveVideoJob({...base, voiceover: {profile: 'Robot'}})).toThrow();
		expect(() => resolveVideoJob({...base, voiceover: {pace: 3}})).toThrow();
	});
});

describe('generateVoiceover', () => {
	const lines = [
		{id: 'intro', text: 'Merhaba'},
		{id: 'outro', text: 'Hoşça kal'},
	];
	const publicDirectory = () => mkdtempSync(path.join(os.tmpdir(), 'sinavika-voice-'));

	it('casts a voice, writes one clip per line and measures it', async () => {
		const {speech, spoken} = fakeSpeech();
		const {clips, cast} = await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech});

		expect(cast.voice).toBe('Sarah');
		expect(Object.keys(clips)).toEqual(['intro', 'outro']);
		expect(clips.intro.src).toMatch(/^Voiceovers\/[0-9a-f]{20}\.mp3$/);
		expect(clips.intro.src).not.toBe(clips.outro.src);
		expect(clips.intro.durationSeconds).toBeGreaterThan(1);
		expect(spoken.map((entry) => entry.text)).toEqual(['Merhaba', 'Hoşça kal']);
		expect(spoken[0].cast).toMatchObject({modelId: 'eleven_v3', languageCode: 'tr'});
	});

	it('spends nothing on lines it has already generated, but regenerates for another voice', async () => {
		const directory = publicDirectory();
		const {speech, spoken} = fakeSpeech();
		await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: directory, speech});
		await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: directory, speech});
		expect(spoken).toHaveLength(2);
		await generateVoiceover(lines, {profile: 'Teacher', voice: 'Alice'}, {publicDirectory: directory, speech});
		expect(spoken).toHaveLength(4);
		expect(readdirSync(path.join(directory, 'Voiceovers'))).toHaveLength(4);
	});

	it('applies tempo at playback: same audio file, shorter clip', async () => {
		const directory = publicDirectory();
		const {speech, spoken} = fakeSpeech();
		const natural = await generateVoiceover(lines, {profile: 'Teacher', pace: 1}, {publicDirectory: directory, speech});
		const brisk = await generateVoiceover(lines, {profile: 'Teacher', pace: 1.25}, {publicDirectory: directory, speech});
		expect(spoken).toHaveLength(2);
		expect(brisk.clips.intro.src).toBe(natural.clips.intro.src);
		expect(brisk.clips.intro.playbackRate).toBe(1.25);
		expect(brisk.clips.intro.durationSeconds).toBeCloseTo(natural.clips.intro.durationSeconds / 1.25, 5);
	});

	it('stops before generating anything when the account is short of characters', async () => {
		const {speech, spoken} = fakeSpeech({remainingCharacters: async () => 5});
		await expect(generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech})).rejects.toThrow(
			/needs 16 new characters but the ElevenLabs account has 5 left/,
		);
		expect(spoken).toHaveLength(0);
	});

	it('retries a temporary failure', async () => {
		let calls = 0;
		const {speech} = fakeSpeech({
			synthesize: async () => {
				if (++calls === 1) throw new SpeechError('ElevenLabs 503', true);
				return FIXTURE;
			},
		});
		await generateVoiceover([lines[0]], {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech});
		expect(calls).toBe(2);
	}, 20_000);

	it('does not retry a failure that cannot succeed, and names the line', async () => {
		let calls = 0;
		const {speech} = fakeSpeech({
			synthesize: async () => {
				calls++;
				throw new SpeechError('ElevenLabs 402 paid_plan_required: Free users cannot use library voices via the API.', false);
			},
		});
		const attempt = generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech});
		await expect(attempt).rejects.toBeInstanceOf(VoiceoverError);
		await expect(attempt).rejects.toThrow(/line "intro".*paid_plan_required/);
		expect(calls).toBe(1);
	});

	it('reports a missing voice as a voice-over error', async () => {
		const {speech} = fakeSpeech({availableVoiceIds: async () => new Set()});
		await expect(generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech})).rejects.toThrow(
			/None of the voices of profile "Teacher"/,
		);
	});
});
