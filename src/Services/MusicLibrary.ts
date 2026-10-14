import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {AUDIO_LEVELS, levelAudio} from './AudioLeveling';
import {composeMusic} from './ElevenLabsSpeech';

/**
 * Music made for one video from a description of it (ElevenLabs Music).
 * Each ad describes its own music, so no two ads sound alike.
 *
 * A piece is generated once and kept in `public/Music/`, named by a hash of
 * its description and length; rendering the video again spends nothing. The
 * length is rounded up, so re-timing a video by a second reuses the piece.
 */
export const MUSIC_DIRECTORY = 'Music';
const LENGTH_STEP_SECONDS = 5;
export type MusicBackend = (description: string, seconds: number) => Promise<Buffer>;

const musicFile = async (description: string, videoSeconds: number, publicDirectory: string, compose: MusicBackend): Promise<string> => {
	const seconds = Math.ceil((videoSeconds + 1) / LENGTH_STEP_SECONDS) * LENGTH_STEP_SECONDS;
	const name = createHash('sha256').update(`${description}|${seconds}`).digest('hex').slice(0, 20);
	const file = path.join(publicDirectory, MUSIC_DIRECTORY, `${name}.mp3`);
	if (!existsSync(file)) {
		await mkdir(path.dirname(file), {recursive: true});
		await writeFile(file, await compose(description, seconds));
	}
	return file;
};

/**
 * Writes the music bed of a video: the described piece at the level music
 * has under narration. The video cuts it to its own length and fades its
 * ends when it plays it.
 */
export const writeMusicBed = async (
	{description, videoSeconds, publicDirectory, outputPath}: {description: string; videoSeconds: number; publicDirectory: string; outputPath: string},
	compose: MusicBackend = composeMusic,
): Promise<void> => {
	await levelAudio(await musicFile(description, videoSeconds, publicDirectory, compose), outputPath, AUDIO_LEVELS.musicBed);
};
