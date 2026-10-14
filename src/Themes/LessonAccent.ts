import {LESSON_GROUPS, courseLessonColor, lessonGroupOf} from '../Configurations/LessonColors';
import {mixColors, readableOn, relativeLuminance} from './ColorPalette';
import type {Theme} from './Theme';
import {THEMES, type ThemeId} from './ThemeRegistry';

/** Lesson colours belong to the brand themes; the older themes keep the look they were designed with. */
const LESSON_AWARE_THEMES: readonly ThemeId[] = ['SinavikaLight', 'SinavikaDark'];

/**
 * The theme with its accent swapped for the lesson's colour, or undefined
 * when nothing changes (another theme, or a lesson without a colour).
 * The lesson colour reaches the subject label, the accent and the highlighter;
 * the brand orange and everything else stay.
 */
export const lessonTheme = (themeId: ThemeId, lesson: string | undefined): Theme | undefined => {
	const group = lessonGroupOf(lesson);
	if (!group || !LESSON_AWARE_THEMES.includes(themeId)) return undefined;

	const theme: Theme = THEMES[themeId];
	const accent = relativeLuminance(theme.colors.background) < 0.2 ? LESSON_GROUPS[group].dark : LESSON_GROUPS[group].light;
	const on = readableOn(accent);
	return {...theme, colors: {...theme.colors, accent, onAccent: on, highlight: accent, lesson: {fill: accent, on}}};
};

/**
 * The theme of an education video for one lesson: the same swap as above,
 * with the lesson's own colour (COURSE_LESSON_COLORS). On a dark theme the
 * colour is lifted towards white so it stays readable there.
 */
export const courseLessonTheme = (themeId: ThemeId, lessonCode: string | undefined): Theme | undefined => {
	const color = courseLessonColor(lessonCode);
	if (!color || !LESSON_AWARE_THEMES.includes(themeId)) return undefined;
	const theme: Theme = THEMES[themeId];
	const accent = relativeLuminance(theme.colors.background) < 0.2 ? mixColors(color, '#FFFFFF', 0.55) : color;
	const on = readableOn(accent);
	return {...theme, colors: {...theme.colors, accent, onAccent: on, highlight: accent, lesson: {fill: accent, on}}};
};
