import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {deflateSync} from 'node:zlib';
import {afterAll, describe, expect, it} from 'vitest';
import {DEFAULT_RENDER_QUALITY, SOCIAL_DELIVERY, VIDEO_ENCODING} from '../src/Configurations/VideoFormats';
import {ffmpeg} from '../src/Services/AudioLeveling';
import {socialCopy, socialSize, videoSize} from '../src/Services/PlatformCopies';

const directory = mkdtempSync(path.join(tmpdir(), 'platform-copies-'));
afterAll(() => rmSync(directory, {recursive: true, force: true}));

/** A uniform grey 8-bit greyscale PNG. */
const greyPng = (width: number, height: number): Buffer => {
	const crcTable = Array.from({length: 256}, (_, n) => {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		return c >>> 0;
	});
	const crc = (bytes: Buffer) => {
		let c = 0xffffffff;
		for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
		return (c ^ 0xffffffff) >>> 0;
	};
	const chunk = (type: string, data: Buffer) => {
		const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
		const out = Buffer.alloc(body.length + 8);
		out.writeUInt32BE(data.length, 0);
		body.copy(out, 4);
		out.writeUInt32BE(crc(body), body.length + 4);
		return out;
	};
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = 0;
	const row = Buffer.alloc(width + 1, 128);
	row[0] = 0;
	const pixels = deflateSync(Buffer.concat(Array.from({length: height}, () => row)));
	return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', pixels), chunk('IEND', Buffer.alloc(0))]);
};


describe('render quality', () => {
	it('renders at the highest quality by default: 4K with a very low CRF', () => {
		expect(DEFAULT_RENDER_QUALITY).toBe('2160p');
		expect(VIDEO_ENCODING.crf).toBeLessThanOrEqual(12);
	});

	it('sizes the social copy to a 1080 px short edge, keeping the shape', () => {
		expect(socialSize({width: 2160, height: 3840})).toEqual({width: 1080, height: 1920});
		expect(socialSize({width: 3840, height: 2160})).toEqual({width: 1920, height: 1080});
		expect(socialSize({width: 1080, height: 1920})).toEqual({width: 1080, height: 1920});
		expect(SOCIAL_DELIVERY.maxShortEdge).toBe(1080);
	});

	it('sends the platforms a 1080p copy of a 4K master and keeps the master', async () => {
		const master = path.join(directory, 'Master.mp4');
		// A short clip from a grey PNG (the bundled ffmpeg has no test sources).
		const frame = path.join(directory, 'frame.png');
		writeFileSync(frame, greyPng(1440, 2560));
		await ffmpeg(['-y', '-loop', '1', '-i', frame, '-t', '0.2', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', master]);
		const copy = await socialCopy(master);
		expect(path.basename(copy)).toBe('Master_1080p.mp4');
		expect(await videoSize(copy)).toEqual({width: 1080, height: 1920});
		expect(await videoSize(master)).toEqual({width: 1440, height: 2560});
		// Already within the limit: sent as it is.
		expect(await socialCopy(copy)).toBe(copy);
	}, 60_000);
});
