import {COURSE_DESIGN} from '../../src/Courses/CourseDesign';
import {mkdtempSync, readdirSync, readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {BRAND_VOICES, VOICES, VOICE_PROFILES, VOICE_PROFILE_KEYS, type VoiceKey} from '../../src/Configurations/Voices';
import {resolveVideoJob, voiceLines, withVoiceClips} from '../../src/Renderers/VideoJob';
import {VOICE_LEAD_SECONDS, VOICE_TAIL_SECONDS, createNarrator, type VoiceClips} from '../../src/Scenes/Voiceover';
import {lowerFirst, pronounceAbbreviations, sentences, toSpokenText, turkishNumber, turkishNumberOrdinal, verbalizeLatex} from '../../src/Schemas/SpokenText';
import {SpeechError, type SpeechBackend} from '../../src/Services/ElevenLabsSpeech';
import {groupLines, joinScript, segmentLines} from '../../src/Services/NarrationScript';
import {VoiceCastingError, castVoice, type VoiceCast} from '../../src/Services/VoiceCasting';
import {VoiceoverError, generateVoiceover} from '../../src/Services/VoiceoverGenerator';
import {TEMPLATES} from '../../src/Templates/TemplateRegistry';
import {fakeNarration} from '../Fixtures/FakeNarration';
import {ROOT} from '../Support/Paths';

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
		expect(spoken('17 \\equiv 2 \\pmod{5}')).toBe('17 denktir 2 mod 5');
		expect(spoken('f(2) + g(x - 1) = f^{-1}(7) + 2^{-1}')).toBe('f 2 artı g x eksi 1, eşittir f tersi 7 artı 2 üssü eksi 1');
		expect(spoken('P(x + 1) = Q(2)')).toBe('P x artı 1, eşittir Q 2');
		expect(spoken('\\Delta = b^2 - 4ac')).toBe('delta eşittir b kare eksi 4ac');
		expect(spoken('\\binom{8}{3} = 56')).toBe('C 8 3 eşittir 56');
		expect(spoken('(3 \\triangle 1) \\ast 2 = (f \\circ g)(2)')).toBe('parantez içinde 3 üçgen 1, yıldız 2 eşittir parantez içinde f bileşke g, 2');
		expect(spoken('\\overline{AB} + \\overline{BA}')).toBe('A B artı B A');
		expect(spoken('\\overline{ABC}')).toBe('A B C');
		expect(spoken('2,\\overline{3} - 0,1\\overline{6}')).toBe('2,3 devirli eksi 0,16 devirli');
		expect(spoken('5! = 120')).toBe('5 faktöriyel eşittir 120');
		expect(spoken("s(A \\cup B) = 11, A \\cap B' = \\varnothing")).toBe('s parantez içinde A birleşim B, eşittir 11, A kesişim B tümleyen eşittir boş küme');
		expect(spoken('2 \\in A, 5 \\notin A, A \\setminus B, A \\subset B')).toBe('2 elemanıdır A, 5 elemanı değildir A, A fark B, A alt kümesidir B');
		expect(spoken("(p \\wedge q') \\Rightarrow r \\equiv 0")).toBe('parantez içinde p ve q değil, ise r denktir 0');
		expect(spoken("(p \\vee q)' \\Leftrightarrow p' \\wedge q'")).toBe('parantez içinde p veya q, değili ancak ve ancak p değil ve q değil');
		expect(spoken('\\sqrt[3]{8} + \\sqrt[4]{16} + 2\\sqrt{3}')).toBe('küpkök 8 artı 4. dereceden kök 16 artı 2 karekök 3');
		expect(spoken('|x - 3| = 2')).toBe('mutlak değer x eksi 3, eşittir 2');
		expect(spoken('20\\%')).toBe('yüzde 20');
	});

	it('strips markup and expands units in rich text', () => {
		expect(toSpokenText('Sonuç **mutlaka** $x = 5$ olur.')).toBe('Sonuç mutlaka x eşittir 5 olur.');
		expect(toSpokenText('$5$ m uzunluk, 80 dk süre, $6$ cm kenar')).toBe('5 metre uzunluk, 80 dakika süre, 6 santimetre kenar');
		expect(toSpokenText('kitap → kitabı')).toBe('kitap, kitabı');
		expect(toSpokenText('Fiyat %20 arttı, sonra 15% azaldı.')).toBe('Fiyat yüzde 20 arttı, sonra yüzde 15 azaldı.');
		expect(toSpokenText('Eksi 3 mü? 5 mı? 2 dkü değil, 4 m.')).toBe('Eksi 3 mü? 5 mı? 2 dkü değil, 4 metre.');
		expect(toSpokenText('$0{,}25$ ile $1{,}5 \\cdot 2$')).toBe('0,25 ile 1,5 çarpı 2');
		expect(toSpokenText('6√2 ya da 3/7, 1/2/2026 değil')).toBe('6 karekök 2 ya da 3 bölü 7, 1/2/2026 değil');
		expect(toSpokenText('x + 2 ve C++')).toBe('x artı 2 ve C++');
		expect(toSpokenText('50 km/sa ya da 12 m/sn')).toBe('saatte 50 kilometre ya da saniyede 12 metre');
		expect(toSpokenText('$\\overline{AB}$ sayısı ve $3!$')).toBe('A B sayısı ve 3 faktöriyel');
		expect(toSpokenText('$3$–$4$–$5$ üçgeni')).toBe('3, 4, 5 üçgeni');
		expect(toSpokenText(undefined)).toBe('');
		// Genetics: genotypes spelled allele by allele, crosses, the Rh factor; Roman numerals and centuries untouched.
		expect(toSpokenText('AaBb × aaBb çaprazlaması')).toBe('büyük a küçük a büyük be küçük be çarpı küçük a küçük a büyük be küçük be çaprazlaması');
		expect(toSpokenText('X^RX^r anne, X^rY oğul, XX ve XY')).toBe('iks büyük re, iks küçük re anne, iks küçük re, ye oğul, iks iks ve iks ye');
		expect(toSpokenText('AO ve BO, Rh⁻ anne, Rh⁺ bebek')).toBe('a o ve be o, re ha negatif anne, re ha pozitif bebek');
		expect(pronounceAbbreviations(toSpokenText('II. ve III. öncül, XX. yüzyıl, 5 mm, AE kenarı'))).toBe('ikinci ve üçüncü öncül, yirminci yüzyıl, beş milimetre, AE kenarı');
	});

	it('never drops a relation or a negation from a formula', () => {
		expect(toSpokenText('$3 - 2x \\ge x - 9$ ve $x \\ne 1$, $0 \\le y$')).toBe('3 eksi 2x büyük eşit x eksi 9 ve x eşit değildir 1, 0 küçük eşit y');
		expect(toSpokenText('$A \\not\\subset B$, $2 \\not\\in A$')).toBe('A alt kümesi değildir B, 2 elemanı değildir A');
		expect(toSpokenText('$p \\veebar q$ ve $n \\cdot (n - 1) \\cdots$')).toBe('p ya da q ve n çarpı parantez içinde n eksi 1...');
		expect(toSpokenText('$d_1 \\parallel d_2$, $AE \\perp EB$, $\\mathbb{R}$')).toBe('d 1 paraleldir d 2, AE diktir EB, reel sayılar');
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

	// A template whose sound is all recorded (RepublicDay: archival speech and score) has no lines to fit.
	it.runIf(voiceLines(job).length > 0)('stretches the video to fit the audio once clips are attached', () => {
		const clips: VoiceClips = Object.fromEntries(
			voiceLines(job).map((line) => [line.id, {src: `Voiceovers/${line.id}.mp3`, startSeconds: 0, durationSeconds: 12.25, playbackRate: 1}]),
		);
		const narrated = withVoiceClips(job, clips);
		expect(narrated.durationInFrames).toBeGreaterThan(job.durationInFrames);
		template.buildScenes(narrated.inputProps.content, clips).filter((scene) => !scene.silent).forEach((scene) => {
			const lines = scene.voice?.length ?? 0;
			// A worked question also keeps its counted pause to think after it is read.
			const think = scene.voice?.some((slot) => slot.id.endsWith('-read')) ? COURSE_DESIGN.pacing.questionThinkSeconds : 0;
			expect(scene.seconds, scene.id).toBeCloseTo(lines * (12.25 + VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS) + think, 5);
		});
	});
});

describe('voice catalogue', () => {
	it('has a brand voice list made only of native Turkish women', () => {
		expect(BRAND_VOICES.length).toBeGreaterThan(0);
		expect(new Set(BRAND_VOICES).size).toBe(BRAND_VOICES.length);
		BRAND_VOICES.forEach((voice) => expect(VOICES[voice], voice).toMatchObject({origin: 'native'}));
		expect(BRAND_VOICES[0]).toBe('Doga');
	});

	it('keeps multilingual voices as stand-ins only', () => {
		for (const key of VOICE_PROFILE_KEYS) {
			VOICE_PROFILES[key].standIns.forEach((voice) => expect(VOICES[voice], `${key}/${voice}`).toMatchObject({origin: 'multilingual', gender: 'female'}));
		}
	});

	it('speaks every role at the natural pace, without style exaggeration (except Launch and Herald)', () => {
		// The owner asked for livelier promo reels (Launch, October 2026) and a more excited camp episode 0 (Herald, 26 Oct 2026);
		// only these may add style, and only a little.
		for (const key of VOICE_PROFILE_KEYS) {
			if (key === 'Launch' || key === 'Herald') continue;
			expect(VOICE_PROFILES[key], key).toMatchObject({pace: 1, style: 0});
		}
		expect(VOICE_PROFILES.Launch.pace).toBeLessThanOrEqual(1.1);
		expect(VOICE_PROFILES.Launch.style).toBeLessThanOrEqual(0.3);
		expect(VOICE_PROFILES.Herald.pace).toBe(1);
		expect(VOICE_PROFILES.Herald.style).toBeLessThanOrEqual(0.3);
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

	it('narrates in English when the job asks for it', () => {
		const cast = castVoice({profile: 'Launch', voice: 'Liam', model: 'v4', language: 'en'}, idsOf(...EVERY_VOICE));
		expect(cast).toMatchObject({voice: 'Liam', modelId: 'eleven_v4', languageCode: 'en'});
		expect(castVoice({profile: 'Launch', model: 'v4'}, idsOf(...EVERY_VOICE)).languageCode).toBe('tr');
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

	it('narrates the parts of a script too long for one request side by side, and a repeated part once', async () => {
		// v4 takes 5,000 characters a request: three long lines are three parts, the third the same script as the first.
		const long = (word: string) => `${word} ${'çalışıyoruz '.repeat(380)}`.trim();
		const parts = [{id: 'a', text: long('Bir')}, {id: 'b', text: long('İki')}, {id: 'c', text: long('Bir')}];
		let running = 0;
		let most = 0;
		const {speech, spoken} = fakeSpeech({
			remainingCharacters: async () => 100_000,
			narrate: async (script) => {
				running += 1;
				most = Math.max(most, running);
				await new Promise((resolve) => setTimeout(resolve, 30));
				running -= 1;
				spoken.push({text: script, cast: undefined as unknown as VoiceCast});
				return fakeNarration(script);
			},
		});
		const {clips} = await generateVoiceover(parts, {profile: 'Teacher', model: 'v4'}, {publicDirectory: publicDirectory(), speech});
		expect(most).toBe(2);
		expect(spoken).toHaveLength(2);
		expect(Object.keys(clips)).toEqual(['a', 'b', 'c']);
		expect(clips.c.src).toBe(clips.a.src);
	}, 30_000);

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

describe('exam abbreviations', () => {
	it('are said the Turkish way while the screen keeps the abbreviation', async () => {
		const {speech, spoken: requests} = fakeSpeech();
		const publicDirectory = mkdtempSync(path.join(os.tmpdir(), 'abbrev-'));

		await generateVoiceover(
			[{id: 'a', text: "YKS'ye ve KPSS'ye hazırlan."}],
			{profile: 'Teacher'},
			{publicDirectory, speech},
		);

		expect(requests[0].text).toContain('yekaseye ve kapeseseye');
		expect(requests[0].text).not.toMatch(/YKS|KPSS/);
	});

	it('leave words that only contain the letters alone', () => {
		expect(pronounceAbbreviations('KPSSLİ YKSX YKS.')).toBe('KPSSLİ YKSX yekase.');
	});

	it('say TYT, AYT, YDT and SinoAI as Turkish speakers do, suffixes included', () => {
		expect(pronounceAbbreviations("TYT'de ve AYT'de, YDT ile; ben SinoAI.")).toBe('teyetede ve ayetede, yedete ile; ben Sino Ey Ay.');
		expect(pronounceAbbreviations('MÖ 680, MS 375, MSB ve MÖMİN')).toBe('milattan önce altı yüz seksen, milattan sonra üç yüz yetmiş beş, MSB ve MÖMİN');
		expect(pronounceAbbreviations("Halife Hz. Ali ve Hz. Peygamber'in; 50 Hz. Dalga.")).toBe("Halife Hazreti Ali ve Hazreti Peygamber'in; elli Hz. Dalga.");
	});

	it('say the site, PDF and SinoAI with a suffix centrally, as the approved ads did (31 Oct 2026)', () => {
		expect(pronounceAbbreviations('sinavika.com’da SinoAI’ye hesap açmadan sor.')).toBe('Sınavika nokta kom’da Sino Ey Ay’ye hesap açmadan sor.');
		expect(pronounceAbbreviations('www.sinavika.com ya da uygulama')).toBe('Sınavika nokta kom ya da uygulama');
		expect(pronounceAbbreviations('PDF’in mi var? PDF dosyası, PDFLER')).toBe('Pidiyefin mi var? Pidiyef dosyası, PDFLER');
	});

	it('are never written into a template’s or a sample’s script: the central readings give them (owner, 31 Oct 2026)', () => {
		// The readings ABBREVIATIONS gives, and the hand-written "Sino Eyay" that bypassed it in some reels.
		const central = /yekase|kapesese|teyete|ayete|yedete|sino ?ey ?ay|pidiyef|nokta kom/iu;
		const scriptsOf = (content: unknown): string[] => {
			const script = (content as {script?: unknown} | undefined)?.script;
			return script && typeof script === 'object' ? Object.values(script as Record<string, unknown>).filter((value): value is string => typeof value === 'string') : [];
		};
		const samplesDirectory = path.resolve(ROOT, 'samples');
		const sampleFiles = readdirSync(samplesDirectory, {recursive: true, encoding: 'utf8'}).filter((file) => file.endsWith('.json'));
		const written = [
			...TEMPLATES.flatMap((template) => scriptsOf(template.sampleContent).map((line) => `${template.id}: ${line}`)),
			...sampleFiles.flatMap((file) => {
				const job = JSON.parse(readFileSync(path.join(samplesDirectory, file), 'utf8')) as {content?: unknown};
				return scriptsOf(job.content ?? job).map((line) => `samples/${file}: ${line}`);
			}),
		];
		expect(written.filter((line) => central.test(line))).toEqual([]);
	});

	it('say numbers as words, with their suffixes, decimals, groups and ordinals', () => {
		expect(turkishNumber(0)).toBe('sıfır');
		expect(turkishNumber(100)).toBe('yüz');
		expect(turkishNumber(1000)).toBe('bin');
		expect(turkishNumber(1100)).toBe('bin yüz');
		expect(turkishNumber(1912)).toBe('bin dokuz yüz on iki');
		expect(turkishNumber(2026)).toBe('iki bin yirmi altı');
		expect(turkishNumber(52718)).toBe('elli iki bin yedi yüz on sekiz');
		expect(turkishNumber(1000000)).toBe('bir milyon');
		expect(turkishNumber(2600000)).toBe('iki milyon altı yüz bin');
		expect(turkishNumberOrdinal(19)).toBe('on dokuzuncu');
		expect(turkishNumberOrdinal(100)).toBe('yüzüncü');
		expect(pronounceAbbreviations("Savaş 1912'de başladı.")).toBe('Savaş bin dokuz yüz on ikide başladı.');
		expect(pronounceAbbreviations("23'ü 5'e bölerse kalan 3'tür.")).toBe('yirmi üçü beşe bölerse kalan üçtür.');
		expect(pronounceAbbreviations("4'ün katı, 4'üncü sıra, 4'te biri, 40'ı")).toBe('dördün katı, dördüncü sıra, dörtte biri, kırkı');
		expect(pronounceAbbreviations("2'nci ve 6'ncı adım; 8'li hece; 1950'li yıllar")).toBe('ikinci ve altıncı adım; sekizli hece; bin dokuz yüz ellili yıllar');
		expect(pronounceAbbreviations('16. yüzyıl ve 3. bölüm. Yıl 1453. Fetih geldi.')).toBe('on altıncı yüzyıl ve üçüncü bölüm. Yıl bin dört yüz elli üç. Fetih geldi.');
		expect(pronounceAbbreviations('52 718 sayısı, 40.075 km, 1.000.000 kişi, 3 000\'den fazla')).toBe('elli iki bin yedi yüz on sekiz sayısı, kırk bin yetmiş beş kilometre, bir milyon kişi, üç binden fazla');
		expect(pronounceAbbreviations('%50,4 oy, %30\'u, nüfusun 2,6 milyonu, 0,05 olasılık')).toBe('yüzde elli virgül dört oy, yüzde otuzu, nüfusun iki virgül altı milyonu, sıfır virgül sıfır beş olasılık');
		expect(pronounceAbbreviations('0-14 yaş, 15–64 yaş, 1774-1914 arası')).toBe('sıfır ile on dört yaş, on beş ile altmış dört yaş, bin yedi yüz yetmiş dört ile bin dokuz yüz on dört arası');
		expect(pronounceAbbreviations('Olasılık 1/4, sıcaklık -5, (−3) sayısı')).toBe('Olasılık bir bölü dört, sıcaklık eksi beş, (eksi üç) sayısı');
		expect(pronounceAbbreviations('G1 evresi, COVID-19, 5N1K, 2n = 8')).toBe('G bir evresi, COVID on dokuz, beş N bir K, iki n eşittir sekiz');
		expect(pronounceAbbreviations("Saat 14.20'de, 09.00'da; 37 °C'de; 6378 km'dir; MÖ 3500")).toBe('Saat on dört yirmide, dokuzda; otuz yedi derecede; altı bin üç yüz yetmiş sekiz kilometredir; milattan önce üç bin beş yüz');
		expect(pronounceAbbreviations('x² ve 5 m² alan, 007 numara')).toBe('x kare ve beş metrekare alan, sıfır sıfır yedi numara');
	});

	it('say a Roman ordinal in a spoken title as a word (lesson and section titles reach the voice raw)', () => {
		expect(pronounceAbbreviations('Bugün: XX. Yüzyıl Başlarında Osmanlı. Bölüm: Fetret Devri ve II. Murat.')).toBe('Bugün: yirminci Yüzyıl Başlarında Osmanlı. Bölüm: Fetret Devri ve ikinci Murat.');
		expect(pronounceAbbreviations('XIX. ve XX. yüzyıl; I. Dünya Savaşı')).toBe('on dokuzuncu ve yirminci yüzyıl; birinci Dünya Savaşı');
		expect(pronounceAbbreviations('I think I can.')).toBe('I think I can.');
	});
});
