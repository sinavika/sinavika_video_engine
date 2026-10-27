import {readFile, writeFile} from 'node:fs/promises';
import {PNG} from 'pngjs';
import {GRID_ICON_ROOM, PROFILE_GRID} from '../Templates/ProfileGrids/ProfileGridLayout';

/**
 * A check picture of how posts look on the Instagram profile: each image cut
 * to the grid's 3:4 tile, side by side in rows of three, with the corner where
 * Instagram lays its carousel or reel icon shaded. Text or a logo touching an
 * edge or that corner shows at once (Tuğçe's review, 26 Oct 2026: posts were
 * only checked full size, and words and logos looked cut on the profile).
 */

/** Width of one tile in the preview, in pixels. */
const TILE_WIDTH = 360;
const GAP = 4;

type Bitmap = {width: number; height: number; data: Buffer};

/** The 3:4 middle of an image, scaled to `TILE_WIDTH` by averaging the source pixels under each target pixel. */
const gridTile = (source: Bitmap): Bitmap => {
	const cropWidth = Math.min(source.width, source.height * PROFILE_GRID.tileRatio);
	const cropHeight = cropWidth / PROFILE_GRID.tileRatio;
	const left = (source.width - cropWidth) / 2;
	const top = (source.height - cropHeight) / 2;
	const width = TILE_WIDTH;
	const height = Math.round(TILE_WIDTH / PROFILE_GRID.tileRatio);
	const step = cropWidth / width;
	const data = Buffer.alloc(width * height * 4);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const sx0 = Math.floor(left + x * step);
			const sy0 = Math.floor(top + y * step);
			const sx1 = Math.min(source.width, Math.max(sx0 + 1, Math.floor(left + (x + 1) * step)));
			const sy1 = Math.min(source.height, Math.max(sy0 + 1, Math.floor(top + (y + 1) * step)));
			const sum = [0, 0, 0, 0];
			for (let sy = sy0; sy < sy1; sy++) {
				for (let sx = sx0; sx < sx1; sx++) {
					const at = (sy * source.width + sx) * 4;
					for (let channel = 0; channel < 4; channel++) sum[channel] += source.data[at + channel];
				}
			}
			const count = (sx1 - sx0) * (sy1 - sy0);
			const out = (y * width + x) * 4;
			for (let channel = 0; channel < 4; channel++) data[out + channel] = Math.round(sum[channel] / count);
		}
	}
	// Shade the corner Instagram covers with its icon (a square as wide as the room kept for it).
	const corner = Math.round((GRID_ICON_ROOM / 1080) * width);
	for (let y = 0; y < corner; y++) {
		for (let x = width - corner; x < width; x++) {
			const at = (y * width + x) * 4;
			for (let channel = 0; channel < 3; channel++) data[at + channel] = Math.round(data[at + channel] * 0.55 + 255 * 0.45);
		}
	}
	return {width, height, data};
};

/** Whether an image is shown on the profile grid: portrait and square posts are, wide pictures are not. */
export const isGridImage = (width: number, height: number): boolean => width <= height;

/** Writes the grid preview of `files` (PNG) to `outputPath`, three tiles a row, in the order given. */
export const writeGridPreview = async (files: readonly string[], outputPath: string): Promise<void> => {
	const tiles = await Promise.all(files.map(async (file) => gridTile(PNG.sync.read(await readFile(file)))));
	const columns = Math.min(3, tiles.length);
	const rows = Math.ceil(tiles.length / 3);
	const tileHeight = tiles[0].height;
	const sheet = new PNG({width: columns * TILE_WIDTH + (columns - 1) * GAP, height: rows * tileHeight + (rows - 1) * GAP});
	sheet.data.fill(255);
	tiles.forEach((tile, index) => {
		const x0 = (index % 3) * (TILE_WIDTH + GAP);
		const y0 = Math.floor(index / 3) * (tileHeight + GAP);
		for (let y = 0; y < tile.height; y++) tile.data.copy(sheet.data, ((y0 + y) * sheet.width + x0) * 4, y * tile.width * 4, (y + 1) * tile.width * 4);
	});
	await writeFile(outputPath, PNG.sync.write(sheet));
};
