import {applyPalette} from './ColorPalette';
import {PALETTES} from './Palettes';
import {SinavikaBrand} from './SinavikaBrand';
import type {Theme} from './Theme';

/**
 * Adding a theme: create its file and add one line here. Nothing else changes.
 *
 * SinavikaLight and SinavikaDark carry the official brand palette
 * (Configurations/BrandColors.ts) and the brand typography
 * (Configurations/BrandTypography.ts, through SinavikaBrand) and are the
 * themes of everything the engine makes; SinavikaBrand is their base. The
 * older themes were removed on 31 Oct 2026 (owner): only the Sınavika look.
 */
export const THEMES = {
	SinavikaBrand,
	SinavikaLight: applyPalette(SinavikaBrand, PALETTES.SinavikaLightV1, 'Sınavika Açık'),
	SinavikaDark: applyPalette(SinavikaBrand, PALETTES.SinavikaDarkV1, 'Sınavika Koyu'),
} as const satisfies Record<string, Theme>;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as [ThemeId, ...ThemeId[]];

export const getTheme = (id: ThemeId): Theme => THEMES[id];
