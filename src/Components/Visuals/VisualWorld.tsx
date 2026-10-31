import React from 'react';
import {useVisualPalette} from './VisualFrame';
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

export const World: React.FC<{width: number; height: number; viewWidth?: number; viewHeight?: number; children: React.ReactNode}> = ({width, height, viewWidth = W, viewHeight = H, children}) => (
	<svg width={width} height={height} viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="xMidYMid meet" style={{overflow: 'visible'}}>
		{children}
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
	const width = Math.max(title.length * 17, (subtitle?.length ?? 0) * 12) + 44;
	const height = subtitle ? 66 : 44;
	const fill = focused > 0.5 ? palette.lesson : palette.surface;
	const text = focused > 0.5 ? palette.onLesson : palette.ink;
	return (
		<g opacity={opacity} transform={`translate(${x} ${y}) scale(${1 + 0.12 * focused})`}>
			<rect x={-width / 2} y={-height / 2} width={width} height={height} rx={20} fill={fill} stroke={palette.lesson} strokeWidth={4} />
			<text y={subtitle ? -5 : 9} textAnchor="middle" fontSize={28} fontWeight={800} fill={text} fontFamily={palette.fontDisplay}>
				{title}
			</text>
			{subtitle ? (
				<text y={22} textAnchor="middle" fontSize={19} fontWeight={600} fill={focused > 0.5 ? palette.onLesson : palette.muted} fontFamily={palette.fontBody}>
					{subtitle}
				</text>
			) : null}
		</g>
	);
};

export const rad = (degrees: number) => (degrees * Math.PI) / 180;

export const deg = (radians: number) => (radians * 180) / Math.PI;

/** Text with a halo so it reads over lines and the globe; lesson-coloured while its part is pointed at. */
export const Tag: React.FC<{x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; focused?: number; weight?: number; fill?: string; halo?: string}> = ({x, y, text, size = 21, anchor = 'start', focused = 0, weight = 700, fill, halo}) => {
	const palette = useVisualPalette();
	return (
		<text x={x} y={y} textAnchor={anchor} fontSize={size * (1 + 0.12 * focused)} fontWeight={focused > 0.5 ? 800 : weight} fill={focused > 0.5 ? palette.lesson : (fill ?? palette.ink)} stroke={halo ?? palette.surface} strokeWidth={size * 0.32} strokeLinejoin="round" paintOrder="stroke" fontFamily={palette.fontBody} dominantBaseline="middle">
			{text}
		</text>
	);
};

