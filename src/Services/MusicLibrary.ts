import {createHash, randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {AUDIO_LEVELS, ffmpeg, levelAudio} from './AudioLeveling';
import {composeMusic} from './ElevenLabsSpeech';

/**
 * Music made for one video from a description of it (ElevenLabs Music).
 * Each ad describes its own music, so no two ads sound alike.
 *
 * A piece is generated once and kept in `public/Music/`, named by a hash of
 * its description and length; rendering the video again spends nothing. The
 * length is rounded up, so re-timing a video by a second reuses the piece.
 */
const MUSIC_DIRECTORY = 'Music';
const LENGTH_STEP_SECONDS = 5;
/** How many length steps longer an existing piece may be and still be reused. */
const REUSE_LONGER_STEPS = 3;
type MusicBackend = (description: string, seconds: number) => Promise<Buffer>;

/** The beats of a piece as the video hears them when the piece starts `fromSeconds` in. */
export const beatsFrom = (beats: readonly number[], fromSeconds: number): number[] => beats.map((beat) => Math.round((beat - fromSeconds) * 1000) / 1000).filter((beat) => beat >= 0);

/**
 * The piece a video of `videoSeconds` plays (made now if there is none): the beat grid is measured from it and the bed
 * is cut from it. A video that starts the piece `fromSeconds` in still finds the piece it had before (the owner liked
 * that music); a new piece is made long enough for the skipped start too.
 */
export const musicPieceFor = async (description: string, videoSeconds: number, publicDirectory: string, compose: MusicBackend = composeMusic, fromSeconds = 0): Promise<string> => {
	const step = (length: number) => Math.ceil((length + 1) / LENGTH_STEP_SECONDS) * LENGTH_STEP_SECONDS;
	const seconds = step(videoSeconds);
	const fileFor = (length: number) => path.join(publicDirectory, MUSIC_DIRECTORY, `${createHash('sha256').update(`${description}|${length}`).digest('hex').slice(0, 20)}.mp3`);
	// A piece already made from the same description, a little longer, is kept:
	// re-voicing a video shifts its length, and the music an owner approved
	// should not change because of that.
	for (let step = 0; step <= REUSE_LONGER_STEPS; step++) {
		const longer = fileFor(seconds + step * LENGTH_STEP_SECONDS);
		if (existsSync(longer)) return longer;
	}
	const length = step(videoSeconds + fromSeconds);
	const file = fileFor(length);
	if (!existsSync(file)) {
		await mkdir(path.dirname(file), {recursive: true});
		await writeFile(file, await compose(description, length));
	}
	return file;
};

/**
 * Writes the music bed of a video: the described piece at the level music
 * has under narration. The video cuts it to its own length and fades its
 * ends when it plays it.
 */
export const writeMusicBed = async (
	{description, videoSeconds, publicDirectory, outputPath, piece, fromSeconds = 0}: {description: string; videoSeconds: number; publicDirectory: string; outputPath: string; piece?: string; fromSeconds?: number},
	compose: MusicBackend = composeMusic,
): Promise<void> => {
	// The piece whose beats the cuts were placed on, when there is one: another piece would not keep the rhythm.
	const source = piece ?? (await musicPieceFor(description, videoSeconds, publicDirectory, compose, fromSeconds));
	if (fromSeconds <= 0) return levelAudio(source, outputPath, AUDIO_LEVELS.musicBed);
	// Cut first, then level: the quiet intro left out would otherwise count in the loudness.
	const cut = path.join(tmpdir(), `music-${randomUUID()}.wav`);
	try {
		await ffmpeg(['-y', '-ss', fromSeconds.toFixed(3), '-i', source, '-vn', '-ar', '48000', '-c:a', 'pcm_s16le', cut]);
		await levelAudio(cut, outputPath, AUDIO_LEVELS.musicBed);
	} finally {
		await rm(cut, {force: true});
	}
};
