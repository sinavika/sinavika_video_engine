import type {ColorPalette} from './ColorPalette';

/**
 * Named colour palettes. Names carry a version so that a palette, once used
 * in published content, never changes meaning: a revised palette is added as
 * V2, it does not replace V1.
 *
 * To add the official Sınavika palette: add an entry here. Image jobs can
 * then select it with `"palette": "<Name>"`. Existing video themes are not
 * affected; to offer the palette to videos as well, register a theme built
 * with `applyPalette` in ThemeRegistry.
 *
 * The two entries below are starter palettes to exercise the mechanism, not
 * brand decisions.
 */
export const PALETTES = {
	MidnightGoldV1: {
		primary: '#F5B83D',
		accent: '#7C9CFF',
		secondary: '#34D3A6',
		background: '#0B1226',
		surface: '#141D38',
		text: '#F2F5FF',
		muted: '#9AA6CC',
		border: '#2A3760',
		gradient: ['#0B1226', '#1B2A63', '#3D2A7A'],
	},
	FreshMintV1: {
		primary: '#0E9F7B',
		accent: '#FF7A45',
		secondary: '#2563EB',
		background: '#F2FBF7',
		surface: '#FFFFFF',
		text: '#0F2A24',
		muted: '#557068',
		border: '#CFE9DF',
		gradient: ['#0E9F7B', '#0B7FA6'],
	},
} as const satisfies Record<string, ColorPalette>;

export type PaletteName = keyof typeof PALETTES;
export const PALETTE_NAMES = Object.keys(PALETTES) as [PaletteName, ...PaletteName[]];
