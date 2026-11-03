import React from 'react';
import {contrastRatio, mixColors} from '../../Themes/ColorPalette';
import {textWidth} from './FigureLabel';
import {DrawingScale, useFigureFont, useVisualPalette} from './VisualFrame';
import {elementLook, useElementState} from './VisualTimeline';

/**
 * Shared drawing parts of the course figures (geography, biology, literature and the general visuals). A figure is
 * drawn in a 1000 x 600 world (`World`) fitted into its box; parts are named in Turkish, as the lesson names them, so a beat points at "hidrosfer" or "ekvator", and
 * `usePartLook` turns a part's beat state into opacity, focus and drawing progress. Labels are `Tag` (text with a
 * halo) and `Chip` (a named pill).
 */

export const W = 1000;

export const H = 600;

export const pathOf = (points: readonly (readonly [number, number])[], close = false) => points.map(([px, py], index) => `${index === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ') + (close ? ' Z' : '');

/** How many layout units a unit of a viewBox takes once fitted ("meet") into a box. */
export const fittedScale = (width: number, height: number, viewWidth: number, viewHeight: number): number => Math.min(width / viewWidth, height / viewHeight);

export const World: React.FC<{width: number; height: number; viewWidth?: number; viewHeight?: number; children: React.ReactNode}> = ({width, height, viewWidth = W, viewHeight = H, children}) => (
	<svg width={width} height={height} viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="xMidYMid meet" style={{overflow: 'visible'}}>
		<DrawingScale scale={fittedScale(width, height, viewWidth, viewHeight)}>{children}</DrawingScale>
	</svg>
);

/**
 * A named part of a figure: its look from the beats (appears when a beat shows it, dims when another part is
 * pointed at) times its own entrance when the figure has no beats for it.
 */
export const usePartLook = (id: string, entrance: number) => {
	const state = useElementState(id);
	const look = elementLook(state);
	// `drawn` is how far a line has been drawn: it grows as the part comes in and never shrinks when another part
	// is pointed at (dimming only fades it).
	return {opacity: look.opacity * entrance, focused: state.emphasis, dimmed: state.dim, drawn: state.appear * entrance};
};

/** A name chip: white with a lesson-coloured edge, filled with the lesson colour while its part is pointed at. */
export const Chip: React.FC<{x: number; y: number; title: string; subtitle?: string; focused: number; opacity: number}> = ({x, y, title, subtitle, focused, opacity}) => {
	const palette = useVisualPalette();
	const font = useFigureFont();
	// An app still raises small text: the chip grows with its title.
	const [titleSize, subtitleSize] = [font(28), font(19)];
	const grow = titleSize / 28;
	const width = Math.max(textWidth(title, titleSize), textWidth(subtitle ?? '', subtitleSize, 600)) + 44 * grow;
	const height = (subtitle ? 66 : 44) * grow;
	const fill = focused > 0.5 ? palette.lesson : palette.surface;
	const text = focused > 0.5 ? palette.onLesson : palette.ink;
	return (
		<g opacity={opacity} transform={`translate(${x} ${y}) scale(${1 + 0.12 * focused})`}>
			<rect x={-width / 2} y={-height / 2} width={width} height={height} rx={20} fill={fill} stroke={palette.lesson} strokeWidth={4} />
			<text y={(subtitle ? -5 : 9) * grow} textAnchor="middle" fontSize={titleSize} fontWeight={800} fill={text} fontFamily={palette.fontDisplay}>
				{title}
			</text>
			{subtitle ? (
				<text y={22 * grow} textAnchor="middle" fontSize={subtitleSize} fontWeight={600} fill={focused > 0.5 ? palette.onLesson : palette.muted} fontFamily={palette.fontBody}>
					{subtitle}
				</text>
			) : null}
		</g>
	);
};

/** A text cut in two at the space nearest its middle; one piece when it has no space. */
export const splitInTwo = (text: string): string[] => {
	const spaces = [...text.matchAll(/ /g)].map((match) => match.index ?? 0);
	if (!spaces.length) return [text];
	const cut = spaces.reduce((best, at) => (Math.abs(at - text.length / 2) < Math.abs(best - text.length / 2) ? at : best));
	return [text.slice(0, cut), text.slice(cut + 1)];
};

/** The lines a note takes in a pill `room` wide: one, or two when its text at `size` is wider. */
export const noteLines = (text: string, size: number, room: number): string[] => (textWidth(text, size, 700) > room ? splitInTwo(text) : [text]);

/**
 * The note under a wide scene (a battle's stage, a process's step): a pill as wide as the scene with its top at
 * `y - 24`. In an app still its text is raised to the still's floor and the pill grows downwards, so it never covers
 * the scene; a note too long for one line at that size takes two (a 70-letter note ran past both ends).
 */
export const NotePill: React.FC<{left: number; right: number; y: number; text: string; fill: string; ink: string; opacity?: number}> = ({left, right, y, text, fill, ink, opacity = 1}) => {
	const palette = useVisualPalette();
	const size = useFigureFont()(26);
	const grow = size / 26;
	const lines = noteLines(text, size, right - left - 48);
	const lineHeight = size * 1.25;
	const top = y - 24;
	const height = 48 * grow + (lines.length - 1) * lineHeight;
	return (
		<g opacity={opacity}>
			<rect x={left} y={top} width={right - left} height={height} rx={24 * grow} fill={fill} />
			{lines.map((line, index) => (
				<text key={index} x={(left + right) / 2} y={top + height / 2 + (index - (lines.length - 1) / 2) * lineHeight + (9 / 26) * size} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={size} fill={ink}>
					{line}
				</text>
			))}
		</g>
	);
};

export const rad = (degrees: number) => (degrees * Math.PI) / 180;

export const deg = (radians: number) => (radians * 180) / Math.PI;

/** Dark ink for marks and labels on scenery that keeps its natural colours in both themes (terrain, sea, rock). */
export const LAND_INK = '#1F2937';

const LAND_HALO = '#FFFFFF';

/**
 * What a World's parts are drawn on: `light` scenery keeps its natural, light colours in the dark theme too, so a label
 * on it needs a light halo and dark ink there. With the theme's halo, the labels of a contour map turned into dark
 * blotches with dark brown numbers in the app's dark theme (Soru revizyonu, 1 Nov 2026).
 */
const GroundContext = React.createContext<'light' | 'theme'>('theme');

/** Wraps the parts of a World drawn on light natural scenery (see GroundContext). */
export const LightGround: React.FC<{children: React.ReactNode}> = ({children}) => <GroundContext.Provider value="light">{children}</GroundContext.Provider>;

/** The lesson colour a pointed-at label takes on light scenery: deepened when it is too pale to read on white. */
const landAccent = (lesson: string): string => (contrastRatio(lesson, LAND_HALO) >= 3 ? lesson : mixColors(lesson, LAND_INK, 0.5));

/**
 * An SVG text of a figure: as given in a video; in an app still its size, and its halo with it, never under the still's
 * smallest text, in the units of the drawing it stands in (the nearest DrawingScale: a World, a stage). Figures drew
 * plain <text> and left 200 stills' text to the still's last guard (TextFloor), which raises without the figure
 * knowing (2 Nov 2026); a figure's text is this instead.
 */
export const FigureText: React.FC<React.SVGProps<SVGTextElement>> = ({fontSize, strokeWidth, style, ...rest}) => {
	const font = useFigureFont();
	// The size may come as the attribute or in the style (a kinship chart sets it there).
	const given = typeof style?.fontSize === 'number' ? style.fontSize : typeof fontSize === 'number' ? fontSize : Number(fontSize);
	if (!Number.isFinite(given) || given <= 0) return <text fontSize={fontSize} strokeWidth={strokeWidth} style={style} {...rest} />;
	const shown = font(given);
	const grow = shown / given;
	const halo = typeof strokeWidth === 'number' ? strokeWidth * grow : strokeWidth;
	return typeof style?.fontSize === 'number' ? <text fontSize={fontSize} strokeWidth={halo} style={{...style, fontSize: shown}} {...rest} /> : <text fontSize={shown} strokeWidth={halo} style={style} {...rest} />;
};

/** Text with a halo so it reads over lines and the globe; lesson-coloured while its part is pointed at. */
export const Tag: React.FC<{x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; focused?: number; weight?: number; fill?: string; halo?: string}> = ({x, y, text, size = 21, anchor = 'start', focused = 0, weight = 700, fill, halo}) => {
	const palette = useVisualPalette();
	const onLand = React.useContext(GroundContext) === 'light';
	const ink = onLand ? LAND_INK : palette.ink;
	const accent = onLand ? landAccent(palette.lesson) : palette.lesson;
	const shown = useFigureFont()(size);
	return (
		<text x={x} y={y} textAnchor={anchor} fontSize={shown * (1 + 0.12 * focused)} fontWeight={focused > 0.5 ? 800 : weight} fill={focused > 0.5 ? accent : (fill ?? ink)} stroke={halo ?? (onLand ? LAND_HALO : palette.surface)} strokeWidth={shown * 0.32} strokeLinejoin="round" paintOrder="stroke" fontFamily={palette.fontBody} dominantBaseline="middle">
			{text}
		</text>
	);
};

