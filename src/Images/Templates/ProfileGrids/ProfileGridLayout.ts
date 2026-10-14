/**
 * What three posts pinned side by side on an Instagram profile have in
 * common. The profile grid shows each post as a 3:4 tile cut from its middle
 * and lays its own marks over two corners, so a design made for the grid:
 *
 * - keeps its content inside the part of the image the tile shows,
 * - leaves the top-right corner (pin) and the bottom-left corner (view
 *   count) empty,
 * - and lines up whatever runs from one tile into the next at the tile's
 *   edges, not at the image's.
 */
export const PROFILE_GRID = {
	tiles: 3,
	/** Width of the tile divided by its height. */
	tileRatio: 3 / 4,
	/** Space kept free in the pin and view-count corners, in reference pixels. */
	corner: {width: 300, height: 150},
} as const;

/** The part of an image the grid tile shows: its offset from the left edge and its width, in pixels. */
export const tileWindow = (width: number, height: number): {left: number; width: number} => {
	const visible = Math.min(width, height * PROFILE_GRID.tileRatio);
	return {left: (width - visible) / 2, width: visible};
};

/**
 * Horizontal position on the whole row of tiles (0 at the left edge of the
 * first tile, 3 at the right edge of the last) of a pixel of one image. It
 * runs on past a tile's edges, so a line drawn with it reaches the image's
 * own edges too.
 */
export const rowPosition = (page: number, x: number, width: number, height: number): number => {
	const tile = tileWindow(width, height);
	return page + (x - tile.left) / tile.width;
};
