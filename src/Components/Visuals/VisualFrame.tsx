import {mixColors} from '../../Themes/ColorPalette';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {animationProgress, type EasingName} from '../../Animations/Motion';
import {withAlpha} from '../../Themes/Theme';
import {useInk, useTheme} from '../../Themes/ThemeContext';

/** What every course visual receives: the box it must fit in (actual pixels) and when it starts. */
export type VisualBoxProps = {width: number; height: number; delaySeconds?: number};

/** 0 to 1 over `durationSeconds`, starting `delaySeconds` into the scene. */
export const useReveal = (delaySeconds = 0, durationSeconds = 0.6, easing: EasingName = 'standard'): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return animationProgress({frame, fps, delaySeconds, durationSeconds, easing});
};

/** Seconds since the scene started. */
export const useSceneSeconds = (): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return frame / fps;
};

/**
 * The colours a visual draws with: the lesson colour for what matters, the
 * ink for everything else, and quiet tints for grids and fills. Taken from
 * the theme, so a visual follows the lesson and the light or dark theme.
 */
export const useVisualPalette = () => {
	const {colors, typography} = useTheme();
	const ink = useInk();
	const lesson = colors.lesson?.fill ?? colors.accent;
	return {
		lesson,
		onLesson: colors.lesson?.on ?? colors.onAccent,
		/** The lesson colour's deep tone: a second category of the same lesson (comparison columns, Venn sets). */
		lessonDeep: mixColors(lesson, ink.text, 0.45),
		/** The brand orange: only as a contrasting second series in figures (points, angles, a second curve), never for text or categories. */
		brand: colors.primary,
		ink: ink.text,
		muted: ink.muted,
		grid: withAlpha(ink.text, 0.12),
		axis: withAlpha(ink.text, 0.55),
		fill: withAlpha(lesson, 0.16),
		surface: colors.surface,
		onSurface: colors.onSurface,
		border: colors.border,
		fontDisplay: typography.display,
		fontBody: typography.body,
		strongWeight: typography.strongWeight,
	};
};
