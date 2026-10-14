import {mkdtempSync, readdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {BRAND_VOICES, VOICES, VOICE_PROFILES, VOICE_PROFILE_KEYS, type VoiceKey} from '../src/Configurations/Voices';
import {resolveVideoJob, voiceLines, withVoiceClips} from '../src/Renderers/VideoJob';
import {VOICE_LEAD_SECONDS, VOICE_TAIL_SECONDS, createNarrator, type VoiceClips} from '../src/Scenes/Voiceover';
import {lowerFirst, sentences, toSpokenText, verbalizeLatex} from '../src/Schemas/SpokenText';
import {SpeechError, type SpeechBackend} from '../src/Services/ElevenLabsSpeech';
import {groupLines, joinScript, segmentLines} from '../src/Services/NarrationScript';
import {VoiceCastingError, castVoice, type VoiceCast} from '../src/Services/VoiceCasting';
import {VoiceoverError, generateVoiceover} from '../src/Services/VoiceoverGenerator';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';
import {fakeNarration} from './Fixtures/FakeNarration';

const idsOf = (...voices: VoiceKey[]) => new Set(voices.map((voice) => VOICES[voice].elevenLabsId));
const DEFAULT_VOICES = (Object.keys(VOICES) as VoiceKey[]).filter((voice) => VOICES[voice].origin === 'multilingual');
const EVERY_VOICE = Object.keys(VOICES) as VoiceKey[];
const BRAND_VOICE = BRAND_VOICES[0];

/** Offline stand-in for ElevenLabs that records what it was asked to say. */
const fakeSpeech = (overrides: Partial<SpeechBackend> = {}) => {
	const spoken: {text: string; cast: VoiceCast}[] = [];
	const speech: SpeechBackend = {
		availableVoiceIds: async () => idsOf(...EVERY_VOICE),
		remainingCharacters: async () => 10_000,
		narrate: async (text, cast) => {
			spoken.push({text, cast});
			return fakeNarration(text);
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
	const clips: VoiceClips = {intro: {src: 'Voiceovers/a.mp3', startSeconds: 0, durationSeconds: 5, playbackRate: 1}};

	it('times a line to its audio when there is a clip, to the estimate otherwise', () => {
		const say = createNarrator(clips);
		expect(say('intro', 'Merhaba', 2).seconds).toBeCloseTo(5 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS, 1);
		expect(say('other', 'Merhaba', 2).seconds).toBe(2);
	});

	it('never goes below the floor a scene needs for its animations', () => {
		const say = createNarrator({short: {src: 'Voiceovers/b.mp3', startSeconds: 0, durationSeconds: 0.8, playbackRate: 1}});
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
		scenes.filter((scene) => !scene.silent).forEach((scene) => expect(scene.voice?.length, scene.id).toBeGreaterThan(0));
		scenes.filter((scene) => scene.silent).forEach((scene) => expect(scene.voice ?? [], scene.id).toEqual([]));
		const ids = voiceLines(job).map((line) => line.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('keeps a scene exactly as long as the lines spoken in it', () => {
		for (const scene of scenes.filter((item) => !item.silent)) {
			const spokenSeconds = (scene.voice ?? []).reduce((total, slot) => total + slot.seconds, 0);
			expect(scene.seconds, scene.id).toBeCloseTo(spokenSeconds, 5);
		}
	});

	it('stretches the video to fit the audio once clips are attached', () => {
		const clips: VoiceClips = Object.fromEntries(
			voiceLines(job).map((line) => [line.id, {src: `Voiceovers/${line.id}.mp3`, startSeconds: 0, durationSeconds: 12.25, playbackRate: 1}]),
		);
		const narrated = withVoiceClips(job, clips);
		expect(narrated.durationInFrames).toBeGreaterThan(job.durationInFrames);
		template.buildScenes(narrated.inputProps.content, clips).filter((scene) => !scene.silent).forEach((scene) => {
			const lines = scene.voice?.length ?? 0;
			expect(scene.seconds, scene.id).toBeCloseTo(lines * (12.25 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS), 5);
		});
	});
});

describe('voice catalogue', () => {
	it('has a brand voice list made only of native Turkish women', () => {
		expect(BRAND_VOICES.length).toBeGreaterThan(0);
		expect(new Set(BRAND_VOICES).size).toBe(BRAND_VOICES.length);
		BRAND_VOICES.forEach((voice) => expect(VOICES[voice], voice).toMatchObject({origin: 'native', gender: 'female'}));
	});

	it('keeps multilingual voices as stand-ins only', () => {
		for (const key of VOICE_PROFILE_KEYS) {
			VOICE_PROFILES[key].standIns.forEach((voice) => expect(VOICES[voice], `${key}/${voice}`).toMatchObject({origin: 'multilingual', gender: 'female'}));
		}
	});

	it('speaks every role at the natural pace, without style exaggeration', () => {
		for (const key of VOICE_PROFILE_KEYS) expect(VOICE_PROFILES[key], key).toMatchObject({pace: 1, style: 0});
	});

	it('has no two catalogue entries pointing at the same ElevenLabs voice', () => {
		const ids = EVERY_VOICE.map((voice) => VOICES[voice].elevenLabsId);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('castVoice', () => {
	it('casts the brand voice with the model native voices are tuned for', () => {
		const cast = castVoice({profile: 'Teacher'}, idsOf(...EVERY_VOICE));
		expect(cast).toMatchObject({voice: BRAND_VOICE, native: true, modelId: 'eleven_multilingual_v2', pace: 1, style: 0});
		expect(cast.languageCode).toBeUndefined();
		expect(cast.note).toBeUndefined();
	});

	it('narrates every kind of video with the same voice', () => {
		const available = idsOf(...EVERY_VOICE);
		VOICE_PROFILE_KEYS.forEach((profile) => expect(castVoice({profile}, available).voice, profile).toBe(BRAND_VOICE));
	});

	it('moves to the next native voice when the first is not in the account, and says so', () => {
		const cast = castVoice({profile: 'Teacher'}, idsOf(BRAND_VOICES[1], ...DEFAULT_VOICES));
		expect(cast).toMatchObject({voice: BRAND_VOICES[1], native: true});
		expect(cast.note).toMatch(/also a native Turkish voice/);
	});

	it('never falls back to a non-native voice on its own', () => {
		expect(() => castVoice({profile: 'Teacher'}, idsOf(...DEFAULT_VOICES))).toThrow(VoiceCastingError);
		expect(() => castVoice({profile: 'Teacher'}, idsOf(...DEFAULT_VOICES))).toThrow(/No native Turkish voice.*paid plan.*standIn/);
	});

	it('casts a stand-in only when the job accepts one, and says it is not native', () => {
		const cast = castVoice({profile: 'Teacher', standIn: true}, idsOf(...DEFAULT_VOICES));
		expect(cast).toMatchObject({voice: 'Sarah', native: false, modelId: 'eleven_v3', languageCode: 'tr'});
		expect(cast.note).toMatch(/multilingual stand-in/);
		expect(castVoice({profile: 'Teacher', standIn: true}, idsOf(...EVERY_VOICE)).voice).toBe(BRAND_VOICE);
		expect(() => castVoice({profile: 'Teacher', standIn: true}, new Set())).toThrow(VoiceCastingError);
	});

	it('honours an explicit voice, model and pace', () => {
		const cast = castVoice({profile: 'Teacher', voice: 'Daniel', model: 'stable', pace: 0.95}, idsOf(...EVERY_VOICE));
		expect(cast).toMatchObject({voice: 'Daniel', modelId: 'eleven_multilingual_v2', pace: 0.95});
	});

	it('refuses an explicit voice the account cannot use, instead of silently swapping it', () => {
		expect(() => castVoice({profile: 'Teacher', voice: 'Derya'}, idsOf(...DEFAULT_VOICES))).toThrow(/"Derya".*not available/);
	});
});

describe('narration script', () => {
	const lines = ['Merhaba.', 'Bugün üslü sayılar.', 'Hoşça kal.'];
	// Every character takes 0.1 s, so times can be read off character positions.
	const timing = (script: string) => ({
		characters: [...script],
		startSeconds: [...script].map((_, index) => index * 0.1),
		endSeconds: [...script].map((_, index) => (index + 1) * 0.1),
	});

	it('joins lines into one script with paragraph breaks', () => {
		expect(joinScript(lines)).toBe('Merhaba.\n\nBugün üslü sayılar.\n\nHoşça kal.');
	});

	it('finds each line in the audio, in order and without overlap', () => {
		const segments = segmentLines(lines, timing(joinScript(lines)));
		expect(segments).toHaveLength(3);
		expect(segments[0].startSeconds).toBe(0);
		// "Merhaba." ends at 0.8 s; the pause to the next line is 0.2 s, so each side takes half of it.
		expect(segments[0].endSeconds).toBeCloseTo(0.9, 5);
		expect(segments[1].startSeconds).toBeCloseTo(0.9, 5);
		segments.forEach((segment, index) => {
			expect(segment.endSeconds).toBeGreaterThan(segment.startSeconds);
			if (index > 0) expect(segment.startSeconds).toBeGreaterThanOrEqual(segments[index - 1].endSeconds);
		});
	});

	it('refuses timings that do not match the script', () => {
		expect(() => segmentLines(lines, timing('Merhaba.'))).toThrow(/lines cannot be located/);
	});

	it('splits only a script longer than the model accepts, and only between lines', () => {
		expect(groupLines(lines, 5_000)).toEqual([[0, 1, 2]]);
		expect(groupLines(lines, 30)).toEqual([[0, 1], [2]]);
		expect(groupLines([], 30)).toEqual([]);
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

	it('lets a job accept a stand-in voice', () => {
		expect(resolveVideoJob({...base, voiceover: {standIn: true}}).voiceover).toEqual({profile: 'Teacher', standIn: true});
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

	it('speaks the whole script in one request and gives every line its part of the audio', async () => {
		const {speech, spoken} = fakeSpeech();
		const {clips, cast} = await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech});

		expect(cast.voice).toBe(BRAND_VOICE);
		expect(spoken.map((entry) => entry.text)).toEqual(['Merhaba\n\nHoşça kal']);
		expect(Object.keys(clips)).toEqual(['intro', 'outro']);
		expect(clips.intro.src).toMatch(/^Voiceovers\/[0-9a-f]{20}\.wav$/);
		expect(clips.outro.src).toBe(clips.intro.src);
		expect(clips.intro.startSeconds).toBe(0);
		expect(clips.intro.durationSeconds).toBeGreaterThan(1);
		expect(clips.outro.startSeconds).toBeGreaterThanOrEqual(clips.intro.startSeconds + clips.intro.durationSeconds);
		expect(clips.intro.playbackRate).toBe(1);
	});

	it('spends nothing on a script it has already narrated, but regenerates for another voice', async () => {
		const directory = publicDirectory();
		const {speech, spoken} = fakeSpeech();
		await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: directory, speech});
		await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: directory, speech});
		expect(spoken).toHaveLength(1);
		await generateVoiceover(lines, {profile: 'Teacher', voice: 'Alice'}, {publicDirectory: directory, speech});
		expect(spoken).toHaveLength(2);
		expect(readdirSync(path.join(directory, 'Voiceovers')).filter((file) => file.endsWith('.wav'))).toHaveLength(2);
		expect(readdirSync(path.join(directory, 'Voiceovers')).filter((file) => file.endsWith('.mp3'))).toHaveLength(0);
	});

	it('applies tempo at playback: same audio file, shorter clip', async () => {
		const directory = publicDirectory();
		const {speech, spoken} = fakeSpeech();
		const natural = await generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: directory, speech});
		const brisk = await generateVoiceover(lines, {profile: 'Teacher', pace: 1.25}, {publicDirectory: directory, speech});
		expect(spoken).toHaveLength(1);
		expect(brisk.clips.outro.src).toBe(natural.clips.outro.src);
		expect(brisk.clips.outro.startSeconds).toBe(natural.clips.outro.startSeconds);
		expect(brisk.clips.outro.playbackRate).toBe(1.25);
		expect(brisk.clips.outro.durationSeconds).toBeCloseTo(natural.clips.outro.durationSeconds / 1.25, 5);
	});

	it('stops before generating anything when the account is short of characters', async () => {
		const {speech, spoken} = fakeSpeech({remainingCharacters: async () => 5});
		await expect(generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech})).rejects.toThrow(
			/needs 18 new characters but the ElevenLabs account has 5 left/,
		);
		expect(spoken).toHaveLength(0);
	});

	it('retries a temporary failure', async () => {
		let calls = 0;
		const {speech} = fakeSpeech({
			narrate: async (script) => {
				if (++calls === 1) throw new SpeechError('ElevenLabs 503', true);
				return fakeNarration(script);
			},
		});
		await generateVoiceover([lines[0]], {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech});
		expect(calls).toBe(2);
	}, 20_000);

	it('does not retry a failure that cannot succeed', async () => {
		let calls = 0;
		const {speech} = fakeSpeech({
			narrate: async () => {
				calls++;
				throw new SpeechError('ElevenLabs 402 paid_plan_required: Free users cannot use library voices via the API.', false);
			},
		});
		const attempt = generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech});
		await expect(attempt).rejects.toBeInstanceOf(VoiceoverError);
		await expect(attempt).rejects.toThrow(/Voice-over failed.*paid_plan_required/);
		expect(calls).toBe(1);
	});

	it('reports a missing voice as a voice-over error', async () => {
		const {speech} = fakeSpeech({availableVoiceIds: async () => new Set()});
		await expect(generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech})).rejects.toThrow(
			/No native Turkish voice/,
		);
	});

	it('does not narrate with a non-native voice unless the job accepts a stand-in', async () => {
		const {speech, spoken} = fakeSpeech({availableVoiceIds: async () => idsOf(...DEFAULT_VOICES)});
		await expect(generateVoiceover(lines, {profile: 'Teacher'}, {publicDirectory: publicDirectory(), speech})).rejects.toBeInstanceOf(VoiceoverError);
		expect(spoken).toHaveLength(0);
		const {cast} = await generateVoiceover(lines, {profile: 'Teacher', standIn: true}, {publicDirectory: publicDirectory(), speech});
		expect(cast).toMatchObject({voice: 'Sarah', native: false});
		expect(spoken).toHaveLength(1);
	});
});
