import {BRAND_COLORS} from '../Configurations/BrandColors';
import type {ColorPalette} from './ColorPalette';

const {brand, light, dark, status} = BRAND_COLORS;

/**
 * Named colour palettes. Names carry a version so that a palette, once used
 * in published content, never changes meaning: a revised palette is added as
 * V2, it does not replace V1.
 *
 * SinavikaLightV1 and SinavikaDarkV1 are the official brand palettes, built
 * from Configurations/BrandColors.ts. They are also registered as the themes
 * SinavikaLight and SinavikaDark, which is how videos use them.
 *
 * MidnightGoldV1 and FreshMintV1 are starter palettes that exercise the
 * mechanism; they are not brand colours and are not used for published content.
 */
export const PALETTES = {
	SinavikaLightV1: {
		primary: brand.primary,
		// White on the brand orange, as on sinavika.com. The accent is the same orange so that it carries white text too.
		onPrimary: '#FFFFFF',
		accent: brand.primary,
		onAccent: '#FFFFFF',
		secondary: brand.charcoal,
		background: light.background,
		surface: light.card,
		text: brand.textPrimary,
		muted: light.textSecondary,
		border: light.border,
		success: status.success.light,
		warning: status.warning.light,
		error: status.error.light,
		gradient: [brand.primary, brand.primaryContainer],
	},
	SinavikaDarkV1: {
		primary: dark.primaryAccent,
		accent: brand.primaryContainer,
		secondary: brand.primaryDim,
		background: dark.background,
		surface: dark.surface,
		text: dark.textPrimary,
		muted: dark.textSecondary,
		border: dark.border,
		success: status.success.dark,
		warning: status.warning.dark,
		error: status.error.dark,
		gradient: [dark.background, dark.surfaceLow, dark.elevatedSurface],
	},
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
