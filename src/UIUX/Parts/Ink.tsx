import React from 'react';
import {useUI} from '../Context';

/**
 * Pen ink for the tablet drawings: what a student writes with the pen on the
 * scratchpad or over a question. Handwriting is drawn with a small
 * single-stroke glyph set (digits, operators, Turkish lower case), not a font,
 * so the brand typeface rule (Manrope only) stays intact and the ink looks
 * like ink. Glyph boxes: x from 0, y 0 = cap top, 1 = baseline, x-height 0.5.
 */

type Glyph = {d: string; w: number};

const G: Record<string, Glyph> = {
	'0': {d: 'M0.3 0C0.62 0 0.62 1 0.3 1C-0.02 1 -0.02 0 0.3 0Z', w: 0.6},
	'1': {d: 'M0.08 0.22L0.3 0L0.3 1', w: 0.36},
	'2': {d: 'M0.05 0.25C0.1 -0.06 0.56 -0.06 0.55 0.3C0.54 0.56 0.06 0.8 0.04 1L0.6 1', w: 0.62},
	'3': {d: 'M0.05 0.12C0.28 -0.06 0.6 0.04 0.55 0.25C0.5 0.44 0.24 0.46 0.24 0.46C0.62 0.46 0.66 0.72 0.5 0.9C0.34 1.06 0.1 1 0.03 0.9', w: 0.62},
	'4': {d: 'M0.45 1L0.45 0L0.02 0.66L0.62 0.66', w: 0.64},
	'5': {d: 'M0.56 0L0.13 0L0.08 0.45C0.3 0.35 0.62 0.45 0.59 0.7C0.56 1 0.2 1.06 0.04 0.9', w: 0.62},
	'6': {d: 'M0.5 0.04C0.2 0 0.04 0.4 0.05 0.7C0.06 0.96 0.25 1 0.33 1C0.56 1 0.61 0.8 0.59 0.68C0.56 0.5 0.3 0.45 0.07 0.62', w: 0.63},
	'7': {d: 'M0.02 0L0.6 0L0.22 1', w: 0.6},
	'8': {d: 'M0.3 0.48C0.05 0.4 0.05 0 0.3 0C0.55 0 0.55 0.4 0.3 0.48C0 0.56 0.02 1 0.3 1C0.58 1 0.6 0.56 0.3 0.48Z', w: 0.6},
	'9': {d: 'M0.55 0.34C0.5 0.6 0.04 0.6 0.06 0.3C0.08 0 0.52 -0.02 0.55 0.3L0.5 1', w: 0.6},
	'+': {d: 'M0.05 0.6L0.55 0.6M0.3 0.36L0.3 0.84', w: 0.6},
	'-': {d: 'M0.05 0.62L0.5 0.6', w: 0.55},
	'×': {d: 'M0.1 0.4L0.48 0.8M0.48 0.4L0.1 0.8', w: 0.58},
	'÷': {d: 'M0.05 0.6L0.55 0.6M0.3 0.38L0.3 0.4M0.3 0.8L0.3 0.82', w: 0.6},
	'=': {d: 'M0.05 0.48L0.55 0.48M0.05 0.72L0.55 0.72', w: 0.6},
	',': {d: 'M0.12 0.92L0.06 1.14', w: 0.22},
	'.': {d: 'M0.1 0.97L0.1 1', w: 0.2},
	'/': {d: 'M0.5 0L0.08 1', w: 0.56},
	'(': {d: 'M0.3 0C0.04 0.3 0.04 0.7 0.3 1', w: 0.36},
	')': {d: 'M0.06 0C0.32 0.3 0.32 0.7 0.06 1', w: 0.36},
	'?': {d: 'M0.08 0.2C0.1 -0.05 0.55 -0.05 0.52 0.25C0.5 0.45 0.3 0.45 0.3 0.7M0.3 0.95L0.3 0.97', w: 0.58},
	'!': {d: 'M0.15 0L0.15 0.7M0.15 0.95L0.15 0.97', w: 0.3},
	'%': {d: 'M0.05 1L0.55 0M0.14 0.06C0.24 0.06 0.24 0.28 0.14 0.28C0.04 0.28 0.04 0.06 0.14 0.06ZM0.46 0.72C0.56 0.72 0.56 0.94 0.46 0.94C0.36 0.94 0.36 0.72 0.46 0.72Z', w: 0.62},
	':': {d: 'M0.1 0.6L0.1 0.62M0.1 0.95L0.1 0.97', w: 0.2},
	A: {d: 'M0.02 1L0.3 0L0.58 1M0.12 0.64L0.48 0.64', w: 0.6},
	B: {d: 'M0.06 1L0.06 0C0.5 -0.02 0.5 0.46 0.06 0.47C0.6 0.45 0.62 1 0.06 1', w: 0.54},
	C: {d: 'M0.55 0.12C0.4 -0.04 0.05 0 0.04 0.5C0.04 1 0.42 1.04 0.56 0.88', w: 0.58},
	D: {d: 'M0.06 1L0.06 0C0.7 0 0.7 1 0.06 1', w: 0.6},
	E: {d: 'M0.5 0L0.06 0L0.06 1L0.52 1M0.06 0.5L0.42 0.5', w: 0.54},
	'°': {d: 'M0.12 0C0.22 0 0.22 0.2 0.12 0.2C0.02 0.2 0.02 0 0.12 0Z', w: 0.26},
	a: {d: 'M0.45 0.6C0.35 0.45 0.05 0.5 0.05 0.78C0.05 1.02 0.4 1.02 0.45 0.78M0.45 0.52L0.46 1', w: 0.52},
	b: {d: 'M0.05 0L0.05 1M0.05 0.65C0.1 0.45 0.45 0.48 0.45 0.75C0.45 1 0.1 1.02 0.05 0.85', w: 0.5},
	c: {d: 'M0.45 0.6C0.35 0.45 0.05 0.5 0.05 0.75C0.05 1 0.35 1.05 0.45 0.9', w: 0.5},
	ç: {d: 'M0.45 0.6C0.35 0.45 0.05 0.5 0.05 0.75C0.05 1 0.35 1.05 0.45 0.9M0.24 1.01L0.2 1.14', w: 0.5},
	d: {d: 'M0.45 0L0.45 1M0.45 0.62C0.35 0.45 0.05 0.5 0.05 0.76C0.05 1.02 0.4 1.02 0.45 0.8', w: 0.52},
	e: {d: 'M0.05 0.76L0.45 0.74C0.45 0.5 0.05 0.45 0.05 0.75C0.05 1 0.35 1.05 0.45 0.92', w: 0.5},
	f: {d: 'M0.4 0.05C0.3 -0.02 0.15 0.02 0.15 0.2L0.15 1M0.02 0.5L0.32 0.5', w: 0.42},
	g: {d: 'M0.42 0.6C0.35 0.45 0.05 0.5 0.05 0.72C0.05 0.95 0.38 0.95 0.42 0.72M0.42 0.52L0.42 1.1C0.4 1.3 0.1 1.3 0.05 1.15', w: 0.5},
	ğ: {d: 'M0.42 0.6C0.35 0.45 0.05 0.5 0.05 0.72C0.05 0.95 0.38 0.95 0.42 0.72M0.42 0.52L0.42 1.1C0.4 1.3 0.1 1.3 0.05 1.15M0.1 0.3C0.18 0.42 0.32 0.42 0.38 0.3', w: 0.5},
	h: {d: 'M0.05 0L0.05 1M0.05 0.65C0.1 0.45 0.4 0.45 0.4 0.65L0.4 1', w: 0.48},
	ı: {d: 'M0.1 0.52L0.1 1', w: 0.22},
	i: {d: 'M0.1 0.52L0.1 1M0.1 0.34L0.1 0.36', w: 0.22},
	k: {d: 'M0.05 0L0.05 1M0.4 0.5L0.06 0.78L0.42 1', w: 0.46},
	l: {d: 'M0.1 0L0.1 1', w: 0.22},
	m: {d: 'M0.05 0.5L0.05 1M0.05 0.65C0.1 0.45 0.3 0.45 0.3 0.65L0.3 1M0.3 0.65C0.35 0.45 0.55 0.45 0.55 0.65L0.55 1', w: 0.62},
	n: {d: 'M0.05 0.5L0.05 1M0.05 0.65C0.1 0.45 0.4 0.45 0.4 0.65L0.4 1', w: 0.48},
	o: {d: 'M0.25 0.5C0.48 0.5 0.48 1 0.25 1C0.02 1 0.02 0.5 0.25 0.5Z', w: 0.5},
	ö: {d: 'M0.25 0.5C0.48 0.5 0.48 1 0.25 1C0.02 1 0.02 0.5 0.25 0.5ZM0.14 0.34L0.14 0.36M0.36 0.34L0.36 0.36', w: 0.5},
	p: {d: 'M0.05 0.5L0.05 1.3M0.05 0.65C0.1 0.45 0.45 0.48 0.45 0.75C0.45 1 0.1 1.02 0.05 0.85', w: 0.5},
	r: {d: 'M0.05 0.5L0.05 1M0.05 0.68C0.12 0.5 0.3 0.48 0.38 0.52', w: 0.42},
	s: {d: 'M0.42 0.56C0.3 0.46 0.05 0.5 0.08 0.65C0.1 0.78 0.42 0.74 0.42 0.88C0.42 1.02 0.12 1.02 0.03 0.93', w: 0.48},
	ş: {d: 'M0.42 0.56C0.3 0.46 0.05 0.5 0.08 0.65C0.1 0.78 0.42 0.74 0.42 0.88C0.42 1.02 0.12 1.02 0.03 0.93M0.22 1.01L0.18 1.14', w: 0.48},
	t: {d: 'M0.15 0.2L0.15 0.92C0.16 1 0.3 1 0.36 0.96M0.02 0.5L0.34 0.5', w: 0.4},
	u: {d: 'M0.05 0.5L0.05 0.82C0.05 1.02 0.4 1.02 0.4 0.8M0.4 0.5L0.4 1', w: 0.48},
	ü: {d: 'M0.05 0.5L0.05 0.82C0.05 1.02 0.4 1.02 0.4 0.8M0.4 0.5L0.4 1M0.12 0.34L0.12 0.36M0.33 0.34L0.33 0.36', w: 0.48},
	v: {d: 'M0.03 0.5L0.22 1L0.42 0.5', w: 0.46},
	x: {d: 'M0.05 0.5L0.45 1M0.45 0.5L0.05 1', w: 0.5},
	y: {d: 'M0.05 0.5L0.25 0.95M0.45 0.5L0.15 1.25', w: 0.5},
	z: {d: 'M0.05 0.52L0.42 0.52L0.05 1L0.44 1', w: 0.48},
};

/** Pen colours of the kit: ink, blue, red, green; the highlighter's yellow, green and pink. Dark theme lifts the ink. */
export const PEN = {
	ink: {light: '#1E293B', dark: '#E2E8F0'},
	blue: {light: '#2563EB', dark: '#60A5FA'},
	red: {light: '#DC2626', dark: '#F87171'},
	green: {light: '#059669', dark: '#34D399'},
	yellow: {light: 'rgba(250, 204, 21, 0.42)', dark: 'rgba(250, 204, 21, 0.34)'},
	mint: {light: 'rgba(74, 222, 128, 0.35)', dark: 'rgba(74, 222, 128, 0.3)'},
	pink: {light: 'rgba(244, 114, 182, 0.32)', dark: 'rgba(244, 114, 182, 0.3)'},
} as const;
export type PenColor = keyof typeof PEN;

export const usePen = (color: PenColor): string => PEN[color][useUI().mode];

/** A tiny deterministic wobble so every stroke looks drawn by hand. */
const wobble = (seed: number, index: number): number => {
	const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
	return value - Math.floor(value) - 0.5;
};

/** Handwritten text: `x`, `y` = top-left of the first glyph's cap box, `size` = cap height in points. */
export const HandText: React.FC<{text: string; x: number; y: number; size?: number; color?: PenColor; width?: number; slant?: number; seed?: number; opacity?: number}> = ({text, x, y, size = 24, color = 'ink', width = 2.4, slant = -8, seed = 3, opacity = 1}) => {
	const stroke = usePen(color);
	let cursor = 0;
	const glyphs: React.ReactNode[] = [];
	Array.from(text).forEach((char, index) => {
		const glyph = G[char] ?? G[char.toLocaleLowerCase('tr-TR')];
		if (!glyph) {
			cursor += char === ' ' ? 0.38 : 0.3;
			return;
		}
		const rotate = wobble(seed, index) * 7;
		const lift = wobble(seed + 7, index) * 0.05;
		glyphs.push(
			<g key={index} transform={`translate(${(x + cursor * size).toFixed(2)} ${(y + lift * size).toFixed(2)}) scale(${size}) skewX(${slant}) rotate(${rotate.toFixed(2)} 0.3 0.6)`}>
				<path d={glyph.d} strokeWidth={width / size} />
			</g>,
		);
		cursor += glyph.w + 0.1 + wobble(seed + 3, index) * 0.04;
	});
	return (
		<g fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
			{glyphs}
		</g>
	);
};

/** A smooth path through points (Catmull-Rom as cubic Béziers). */
const smooth = (points: [number, number][], closed = false): string => {
	const p = closed ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]];
	let d = `M${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)}`;
	for (let i = 1; i < p.length - 2; i++) {
		const [x0, y0] = p[i - 1];
		const [x1, y1] = p[i];
		const [x2, y2] = p[i + 1];
		const [x3, y3] = p[i + 2];
		d += `C${(x1 + (x2 - x0) / 6).toFixed(1)} ${(y1 + (y2 - y0) / 6).toFixed(1)} ${(x2 - (x3 - x1) / 6).toFixed(1)} ${(y2 - (y3 - y1) / 6).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
	}
	return d;
};

/** A freehand stroke through the given points. */
export const InkLine: React.FC<{points: [number, number][]; color?: PenColor; width?: number; opacity?: number}> = ({points, color = 'ink', width = 2.6, opacity = 1}) => (
	<path d={smooth(points)} fill="none" stroke={usePen(color)} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
);

/** A hand-drawn loop around a spot: a little more than one turn, never a perfect ellipse. */
export const InkLoop: React.FC<{cx: number; cy: number; rx: number; ry: number; color?: PenColor; width?: number; seed?: number}> = ({cx, cy, rx, ry, color = 'red', width = 2.6, seed = 5}) => {
	const points: [number, number][] = [];
	for (let step = 0; step <= 15; step++) {
		const angle = -2.4 + (step / 15) * (Math.PI * 2 + 0.55);
		const grow = 1 + wobble(seed, step) * 0.08 + step * 0.006;
		points.push([cx + Math.cos(angle) * rx * grow, cy + Math.sin(angle) * ry * grow]);
	}
	return <InkLine points={points} color={color} width={width} />;
};

/** Underline under a word, slightly rising. */
export const InkUnderline: React.FC<{x1: number; x2: number; y: number; color?: PenColor; width?: number}> = ({x1, x2, y, color = 'blue', width = 2.4}) => (
	<InkLine points={[[x1, y + 1], [(x1 * 2 + x2) / 3, y - 1], [(x1 + x2 * 2) / 3, y + 1.5], [x2, y - 2]]} color={color} width={width} />
);

/** A tick. */
export const InkCheck: React.FC<{x: number; y: number; size?: number; color?: PenColor; width?: number}> = ({x, y, size = 22, color = 'green', width = 2.8}) => (
	<InkLine points={[[x, y + size * 0.5], [x + size * 0.32, y + size * 0.86], [x + size, y]]} color={color} width={width} />
);

/** A curved arrow from one point to another, head at the end. */
export const InkArrow: React.FC<{from: [number, number]; to: [number, number]; bend?: number; color?: PenColor; width?: number}> = ({from, to, bend = 30, color = 'blue', width = 2.4}) => {
	const stroke = usePen(color);
	const mid: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - bend];
	const angle = Math.atan2(to[1] - mid[1], to[0] - mid[0]);
	const head = (offset: number): [number, number] => [to[0] - Math.cos(angle + offset) * 14, to[1] - Math.sin(angle + offset) * 14];
	return (
		<g fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
			<path d={`M${from[0]} ${from[1]}Q${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`} />
			<path d={`M${head(0.5).join(' ')}L${to.join(' ')}L${head(-0.5).join(' ')}`} />
		</g>
	);
};

/** Highlighter over text drawn by the page (an inline span): soft, uneven ends. */
export const Highlight: React.FC<{color?: PenColor; children: React.ReactNode}> = ({color = 'yellow', children}) => (
	<span style={{background: usePen(color), borderRadius: '3px 9px 4px 10px', padding: '1px 3px', margin: '0 -1px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{children}</span>
);

/** The ink layer: an SVG over a surface, in that surface's points. */
export const InkLayer: React.FC<{width: number; height: number; children: React.ReactNode; style?: React.CSSProperties}> = ({width, height, children, style}) => (
	<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style}}>
		{children}
	</svg>
);
