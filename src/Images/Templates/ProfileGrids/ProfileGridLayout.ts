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

/**
 * The margin every feed image keeps inside the grid tile, in reference
 * pixels. Text and the logo that sat 80 px from the image edge ended up 46 px
 * from the tile edge and looked cut off on the profile ("SinoAI’ye sadece",
 * "Sınava hazırlanma…", the logo under the fan: Tuğçe's review, 26 Oct 2026).
 */
export const GRID_MARGIN = 64;

/**
 * Room kept free beside the top-right corner, where Instagram lays the
 * carousel, reel or pin icon over the tile, in reference pixels: a title in
 * the first rows ends this far before the right margin.
 */
export const GRID_ICON_ROOM = 110;

type Insets = {top: number; right: number; bottom: number; left: number};

/**
 * Insets, in actual pixels, that keep content inside the part of a feed image
 * the profile grid shows, plus `margin`. Portrait and square images are cut
 * to 3:4 on the grid (4:5 loses its sides, 9:16 its top and bottom); wide
 * images (YouTube thumbnails, web) are never on the grid and keep `margin`.
 */
export const gridInsets = (width: number, height: number, unit: number, margin = GRID_MARGIN): Insets => {
	const pad = margin * unit;
	if (width > height) return {top: pad, right: pad, bottom: pad, left: pad};
	const side = tileWindow(width, height).left;
	const visibleHeight = Math.min(height, width / PROFILE_GRID.tileRatio);
	const end = (height - visibleHeight) / 2;
	return {top: end + pad, right: side + pad, bottom: end + pad, left: side + pad};
};
