import {AcademicLight} from './AcademicLight';
import {ExamFocus} from './ExamFocus';
import {SinavikaBrand} from './SinavikaBrand';
import {TechDark} from './TechDark';
import type {Theme} from './Theme';
import {VibrantDynamic} from './VibrantDynamic';
import {WhiteboardMinimal} from './WhiteboardMinimal';

/** Adding a theme: create its file and add one line here. Nothing else changes. */
export const THEMES = {
	SinavikaBrand,
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
