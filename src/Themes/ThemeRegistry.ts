import {AcademicLight} from './AcademicLight';
import {applyPalette} from './ColorPalette';
import {ExamFocus} from './ExamFocus';
import {PALETTES} from './Palettes';
import {SinavikaBrand} from './SinavikaBrand';
import {TechDark} from './TechDark';
import type {Theme} from './Theme';
import {VibrantDynamic} from './VibrantDynamic';
import {WhiteboardMinimal} from './WhiteboardMinimal';

/**
 * Adding a theme: create its file and add one line here. Nothing else changes.
 *
 * SinavikaLight and SinavikaDark carry the official brand palette
 * (Configurations/BrandColors.ts) and the brand typography
 * (Configurations/BrandTypography.ts, through SinavikaBrand) and are the
 * themes of all social media content. The older themes keep their own colours,
 * so anything already rendered with them looks the same.
 */
export const THEMES = {
	SinavikaBrand,
	SinavikaLight: applyPalette(SinavikaBrand, PALETTES.SinavikaLightV1, 'Sınavika Açık'),
	SinavikaDark: applyPalette(SinavikaBrand, PALETTES.SinavikaDarkV1, 'Sınavika Koyu'),
	WhiteboardMinimal,
	AcademicLight,
	TechDark,
	VibrantDynamic,
	ExamFocus,
} as const satisfies Record<string, Theme>;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as [ThemeId, ...ThemeId[]];
export const DEFAULT_THEME_ID: ThemeId = 'SinavikaBrand';

export const getTheme = (id: ThemeId): Theme => THEMES[id];
