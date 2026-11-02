import React from 'react';
import {mixColors} from '../../Themes/ColorPalette';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {animationProgress, type EasingName} from '../../Animations/Motion';
import {withAlpha} from '../../Themes/Theme';
import {useInk, useTheme} from '../../Themes/ThemeContext';

/**
 * Set while a figure is drawn as a still for the app (the WorkFigure composition), to the smallest text the still may
 * carry (layout units). The video's own furniture, the stage strip of a battle or process and a 3D figure's stage
 * strip and name, stays out: a solid's name under it gave away the answer of a question and the contract wants no
 * progress bar (Soru revizyonu, 1 Nov 2026).
 */
const StillFigureContext = React.createContext<number | undefined>(undefined);

/** Wraps a visual drawn as an app still (see StillFigureContext); `textFloor` in layout units. */
export const StillFigure: React.FC<{textFloor: number; children: React.ReactNode}> = ({textFloor, children}) => <StillFigureContext.Provider value={textFloor}>{children}</StillFigureContext.Provider>;

/** Whether the visual is being drawn as an app still. */
export const useStillFigure = (): boolean => React.useContext(StillFigureContext) !== undefined;

/** The smallest text of the app still being drawn (layout units), or undefined in a video. */
export const useStillTextFloor = (): number | undefined => React.useContext(StillFigureContext);

/** How many layout units one unit of a drawing takes: a World's viewBox fitted into its box. 1 outside one. */
const DrawingScaleContext = React.createContext(1);

/** Wraps parts drawn in units of their own (an SVG viewBox), `scale` layout units each (see useFigureFont). */
export const DrawingScale: React.FC<{scale: number; children: React.ReactNode}> = ({scale, children}) => <DrawingScaleContext.Provider value={scale}>{children}</DrawingScaleContext.Provider>;

/** The smallest font size an app still allows, in units of a drawing `scale` layout units each (0 in a video). */
export const stillFontFloor = (textFloor: number | undefined, scale: number): number => (textFloor ? textFloor / Math.max(scale, 1e-6) : 0);

/**
 * Font sizes of a figure's text, in its own drawing units: as given in a video, never under the still's floor in an
 * app still (a still is shown about 360 pixels wide: a battle's unit names came out at 17 of 1280 pixels, 2 Nov 2026).
 * `scale` is how many layout units a drawing unit takes; without it the nearest DrawingScale (a World) gives it.
 * Text that sits in a box of its own size (a chip, a card) must size the box from the returned size.
 */
export const useFigureFont = (scale?: number): ((size: number) => number) => {
	const floor = React.useContext(StillFigureContext);
	const context = React.useContext(DrawingScaleContext);
	const least = stillFontFloor(floor, scale ?? context);
	return React.useCallback((size: number) => Math.max(size, least), [least]);
};

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
		/** The scene's own background, for a backdrop that should disappear into it. */
		background: colors.background,
		onSurface: colors.onSurface,
		border: colors.border,
		fontDisplay: typography.display,
		fontBody: typography.body,
		strongWeight: typography.strongWeight,
	};
};

/**
 * A line through text, drawn left to right as `struck` goes 0 → 1. A
 * background line, so it follows every line of wrapped text (an absolute bar
 * ran between the lines of a two-line option).
 */
export const strikeStyle = (struck: number, colour: string, thickness: number): React.CSSProperties => ({
	backgroundImage: `linear-gradient(${colour}, ${colour})`,
	backgroundRepeat: 'no-repeat',
	backgroundPosition: '0 58%',
	backgroundSize: `${(struck * 100).toFixed(2)}% ${thickness}px`,
	boxDecorationBreak: 'clone',
	WebkitBoxDecorationBreak: 'clone',
});
