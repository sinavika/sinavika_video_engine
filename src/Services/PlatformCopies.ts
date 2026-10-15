import {stat} from 'node:fs/promises';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import {SOCIAL_DELIVERY, VIDEO_ENCODING} from '../Configurations/VideoFormats';
import {ffmpeg} from './AudioLeveling';

const ffprobe = (args: string[]) => RenderInternals.callFf({bin: 'ffprobe', args, indent: false, logLevel: 'error', binariesDirectory: null, cancelSignal: undefined});

/** Width and height of a video's first video stream. */
export const videoSize = async (file: string): Promise<{width: number; height: number}> => {
	const {stdout} = await ffprobe(['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
	const [width, height] = String(stdout).trim().split(',').map(Number);
	if (!width || !height) throw new Error(`Cannot read the size of ${file}`);
	return {width, height};
};

/** Size of the social copy: the master scaled so its short edge is SOCIAL_DELIVERY.maxShortEdge, even dimensions. */
export const socialSize = ({width, height}: {width: number; height: number}): {width: number; height: number} => {
	const factor = Math.min(1, SOCIAL_DELIVERY.maxShortEdge / Math.min(width, height));
	const even = (value: number) => Math.round((value * factor) / 2) * 2;
	return {width: even(width), height: even(height)};
};

/**
 * The file to send to the social platforms for a rendered video. Masters are
 * 4K; the platforms (through Buffer) keep at most a 1080 px short edge and
 * would scale a larger file with their own, worse encoder. So a larger master
 * gets a copy next to it (`Name_1080p.mp4`), scaled with Lanczos and encoded
 * with the engine's own settings; the audio is copied untouched. Anything
 * already within the limit, and every non-video file, is sent as it is.
 */
export const socialCopy = async (file: string): Promise<string> => {
	if (path.extname(file).toLowerCase() !== '.mp4') return file;
	// A file whose size cannot be read is not a video the engine made; it is sent as it is and the platform decides.
	const size = await videoSize(file).catch(() => null);
	if (!size) return file;
	const target = socialSize(size);
	if (target.width === size.width && target.height === size.height) return file;
	const copy = file.replace(/\.mp4$/i, `_${SOCIAL_DELIVERY.maxShortEdge}p.mp4`);
	const [master, existing] = await Promise.all([stat(file), stat(copy).catch(() => null)]);
	if (existing && existing.mtimeMs >= master.mtimeMs) return copy;
	await ffmpeg([
		'-y', '-i', file,
		'-map', '0',
		'-vf', `scale=${target.width}:${target.height}:flags=lanczos`,
		'-c:v', 'libx264', '-crf', String(VIDEO_ENCODING.crf), '-preset', VIDEO_ENCODING.x264Preset, '-pix_fmt', 'yuv420p',
		'-maxrate', SOCIAL_DELIVERY.maxBitrate, '-bufsize', SOCIAL_DELIVERY.bufferSize,
		'-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
		'-c:a', 'copy',
		'-map_metadata', '-1', '-fflags', '+bitexact', '-movflags', '+faststart',
		copy,
	]);
	return copy;
};
