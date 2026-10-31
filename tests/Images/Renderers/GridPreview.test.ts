import {mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {PNG} from 'pngjs';
import {describe, expect, it} from 'vitest';
import {isGridImage, writeGridPreview} from '../../../src/Images/Renderers/GridPreview';
import {gridInsets} from '../../../src/Images/Templates/ProfileGrids/ProfileGridLayout';

describe('profile grid', () => {
	it('keeps a 4:5 post’s content inside the 3:4 tile with a margin, and a 9:16 cover’s inside its middle', () => {
		const post = gridInsets(1080, 1350, 1);
		expect(post.left).toBeCloseTo(33.75 + 64);
		expect(post.top).toBe(64);
		const cover = gridInsets(1080, 1920, 1);
		expect(cover.top).toBe(240 + 64);
		expect(cover.left).toBe(64);
		expect(gridInsets(1920, 1080, 1).left).toBe(64);
	});

	it('writes a preview of portrait posts as the profile shows them, three a row', async () => {
		expect(isGridImage(1080, 1350)).toBe(true);
		expect(isGridImage(1920, 1080)).toBe(false);
		const dir = await mkdtemp(path.join(tmpdir(), 'grid-'));
		const files = await Promise.all(
			[0, 1, 2, 3].map(async (index) => {
				const image = new PNG({width: 108, height: 135});
				image.data.fill(index * 60);
				const file = path.join(dir, `post_${index + 1}.png`);
				await writeFile(file, PNG.sync.write(image));
				return file;
			}),
		);
		const out = path.join(dir, 'post_izgara.png');
		await writeGridPreview(files, out);
		const sheet = PNG.sync.read(await readFile(out));
		expect(sheet.width).toBe(3 * 360 + 2 * 4);
		expect(sheet.height).toBe(2 * 480 + 4);
	});
});
