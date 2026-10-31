import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {VOICEOVER_DIRECTORY, VOICE_MODELS} from '../Configurations/Voices';
import type {VoiceClips} from '../Scenes/Voiceover';
import {pronounceAbbreviations} from '../Schemas/SpokenText';
import {placeCutsInFile} from './NarrationCut';
import {AUDIO_LEVELS, NARRATION_TONE, toneAndLevel} from './AudioLeveling';
import {ELEVENLABS_SPEECH, SPEECH_AUDIO, SPEECH_CONCURRENCY, SpeechError, type Narration, type SpeechBackend} from './ElevenLabsSpeech';
import {groupLines, joinScript, lineWords, segmentLines, type LineSegment, type TimedWord} from './NarrationScript';
import {castVoice, type VoiceCast, type VoiceoverRequest} from './VoiceCasting';

export type VoiceLine = {id: string; text: string};

type VoiceoverOptions = {
	/** The project's `public/` folder; clips are written to its Voiceovers subfolder. */
	publicDirectory: string;
	onProgress?: (done: number, total: number) => void;
	/** Replaces ElevenLabs. Used by tests. */
	speech?: SpeechBackend;
};

type Voiceover = {clips: VoiceClips; cast: VoiceCast};

/** Thrown when narration could not be produced. The message says why. */
export class VoiceoverError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message, {cause});
		this.name = 'VoiceoverError';
	}
}

const ATTEMPTS = 4;
const RETRY_DELAY_MILLISECONDS = 2_000;

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Everything that changes how a script sounds is part of its cache key; tempo is not, it is applied at playback. */
const narrationName = (script: string, cast: VoiceCast, cacheTag = ''): string => {
	const key = [cacheTag, NARRATION_TONE.id, cast.elevenLabsVoiceId, cast.modelId, cast.languageCode, cast.stability, cast.similarity, cast.style, cast.seed, script];
	return createHash('sha256').update(key.join('|')).digest('hex').slice(0, 20);
};

const narrateWithRetry = async (script: string, cast: VoiceCast, speech: SpeechBackend): Promise<Narration> => {
	for (let attempt = 1; ; attempt++) {
		try {
			return await speech.narrate(script, cast);
		} catch (error) {
			const retryable = !(error instanceof SpeechError) || error.retryable;
			if (!retryable || attempt >= ATTEMPTS) {
				const reason = error instanceof Error ? error.message : String(error);
				throw new VoiceoverError(`Voice-over failed: ${reason}`, error);
			}
			await wait(RETRY_DELAY_MILLISECONDS * attempt);
		}
	}
};

/**
 * Casts a voice and narrates the lines as one script.
 *
 * The whole script is spoken in a single request, so intonation carries
 * across sentences; each line becomes a part of that one audio file, located
 * by the service's character timings. Only a script longer than the model's
 * limit is split, and then between lines.
 *
 * A narration is cached by a hash of script, voice and delivery, so
 * re-rendering a video, or rendering it in another format, spends no further
 * credits. Before anything is generated the script is checked against the
 * account's remaining characters, so a video is never left half narrated.
 */
/** Runs `work` on every item, at most `limit` at a time. */
const eachAtMost = async <T>(items: readonly T[], limit: number, work: (item: T) => Promise<void>): Promise<void> => {
	let next = 0;
	await Promise.all(Array.from({length: Math.min(limit, items.length)}, async () => {
		while (next < items.length) await work(items[next++]);
	}));
};

/** Version of how lines are cut out of a narration (NarrationCuts). A narration cut by an older version is cut again, from the same audio, without asking for new speech. */
const CUTS_VERSION = 2;

type StoredNarration = {cuts: number; segments: LineSegment[]; words?: TimedWord[][]};

/** The lines of a cached narration, with its cuts placed in the audio, and its word timings when it has them; older files are upgraded in place. */
const storedSegments = async (file: string, audio: string): Promise<{segments: LineSegment[]; words?: TimedWord[][]}> => {
	const stored = JSON.parse(await readFile(file, 'utf8')) as LineSegment[] | StoredNarration;
	if (!Array.isArray(stored) && stored.cuts === CUTS_VERSION) return {segments: stored.segments, words: stored.words};
	const segments = await placeCutsInFile(Array.isArray(stored) ? stored : stored.segments, audio);
	const words = Array.isArray(stored) ? undefined : stored.words;
	await writeFile(file, JSON.stringify({cuts: CUTS_VERSION, segments, words}));
	return {segments, words};
};

export const generateVoiceover = async (
	lines: readonly VoiceLine[],
	request: VoiceoverRequest,
	{publicDirectory, onProgress, speech = ELEVENLABS_SPEECH}: VoiceoverOptions,
): Promise<Voiceover> => {
	let cast: VoiceCast;
	try {
		cast = castVoice(request, await speech.availableVoiceIds());
	} catch (error) {
		throw new VoiceoverError(error instanceof Error ? error.message : String(error), error);
	}

	const limit = VOICE_MODELS[cast.model].maxCharacters;
	const tooLong = lines.find((line) => line.text.length > limit);
	if (tooLong) {
		throw new VoiceoverError(`Line "${tooLong.id}" has ${tooLong.text.length} characters; ${cast.modelId} accepts at most ${limit}.`);
	}

	const directory = path.join(publicDirectory, VOICEOVER_DIRECTORY);
	await mkdir(directory, {recursive: true});
	// Turkish readings of abbreviations ("KPSS" → "kapesese") only apply to Turkish narration.
	const english = cast.languageCode === 'en';
	const texts = lines.map((line) => (english ? line.text : pronounceAbbreviations(line.text)));
	const planned = groupLines(texts, limit).map((indexes) => {
		const groupTexts = indexes.map((index) => texts[index]);
		const script = joinScript(groupTexts);
		const name = narrationName(script, cast, speech.cacheTag);
		return {indexes, texts: groupTexts, script, name, audio: path.join(directory, `${name}.wav`), segments: path.join(directory, `${name}.json`)};
	});

	const cached = (group: (typeof planned)[number]) => existsSync(group.audio) && existsSync(group.segments);
	const needed = planned.filter((group) => !cached(group)).reduce((total, group) => total + group.script.length, 0);
	const remaining = needed > 0 ? await speech.remainingCharacters() : null;
	if (remaining !== null && needed > remaining) {
		throw new VoiceoverError(
			`This narration needs ${needed} new characters but the ElevenLabs account has ${remaining} left this period.`,
		);
	}

	// The parts not cached yet are narrated side by side, as many at once as the plan runs (SPEECH_CONCURRENCY): a lesson
	// too long for one request waits for one round trip, not one per part. Each part is still one whole request.
	// A part repeated in one job (same script, same cast) is narrated once.
	const missing = planned.filter((group, index) => !cached(group) && planned.findIndex((other) => other.name === group.name) === index);
	await eachAtMost(missing, SPEECH_CONCURRENCY, async (group) => {
		const {audio, timing} = await narrateWithRetry(group.script, cast, speech);
		let segments: LineSegment[];
		try {
			segments = segmentLines(group.texts, timing);
		} catch (error) {
			throw new VoiceoverError(error instanceof Error ? error.message : String(error), error);
		}
		// The service delivers speech at full scale and with a full low end; it is stored with the low end cut and at the level narration has in a mix (see AudioLeveling).
		const delivered = path.join(directory, `${group.name}.source.${SPEECH_AUDIO.extension}`);
		await writeFile(delivered, audio);
		await toneAndLevel(delivered, group.audio, AUDIO_LEVELS.narration, NARRATION_TONE.filters);
		await rm(delivered, {force: true});
		const stored: StoredNarration = {cuts: CUTS_VERSION, segments: await placeCutsInFile(segments, group.audio), words: lineWords(group.texts, timing)};
		await writeFile(group.segments, JSON.stringify(stored));
	});

	const clips: VoiceClips = {};
	let done = 0;
	for (const group of planned) {
		const {segments, words} = await storedSegments(group.segments, group.audio);
		group.indexes.forEach((lineIndex, position) => {
			const {startSeconds, endSeconds} = segments[position];
			const lineWordTimes = words?.[position];
			clips[lines[lineIndex].id] = {
				src: `${VOICEOVER_DIRECTORY}/${group.name}.wav`,
				startSeconds,
				// The line is played at the cast's pace, so that is how long it lasts in the video.
				durationSeconds: (endSeconds - startSeconds) / cast.pace,
				playbackRate: cast.pace,
				// Word starts in seconds of the clip as played (see VoiceClip.words).
				...(lineWordTimes ? {words: lineWordTimes.map((word) => ({text: word.text, startSeconds: Math.max(0, (word.startSeconds - startSeconds) / cast.pace)}))} : {}),
			};
		});
		done += group.indexes.length;
		onProgress?.(done, lines.length);
	}
	return {clips, cast};
};
