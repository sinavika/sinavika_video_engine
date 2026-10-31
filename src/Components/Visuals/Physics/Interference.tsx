import React, {useId} from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Interference = Extract<CourseVisual, {kind: 'interference'}>;

/** The stage (CourseVisual keeps this ratio). */
export const INTERFERENCE_STAGE = {width: 1600, height: 900};

/** Light colours and their wavelengths relative to green (red ≈ 700 nm, green ≈ 530 nm, blue ≈ 450 nm). */
const LIGHT = {red: {colour: '#D64545', ratio: 700 / 530}, green: {colour: '#2E9E5B', ratio: 1}, blue: {colour: '#2F6FD6', ratio: 450 / 530}} as const;

/**
 * Two in-phase sources a distance apart (in wavelengths): the path difference at a point decides it. A whole number
 * of wavelengths is a crest meeting a crest (katar, the water swings most); a half-odd number is a crest meeting a
 * trough (düğüm, the water stays still). Returns the path difference in wavelengths and which it is.
 */
export const pathDifference = (separation: number, [x, y]: [number, number]) => {
	const difference = Math.abs(Math.hypot(x + separation / 2, y) - Math.hypot(x - separation / 2, y));
	const nearest = Math.round(difference * 2) / 2;
	const kind = Math.abs(difference - nearest) > 0.05 ? 'between' : Number.isInteger(nearest) ? 'antinode' : 'node';
	return {difference, kind} as const;
};

/** Brightness on the screen at y (in units of the double slit's fringe width Δx): cos² for two slits, sinc² for one. */
export const slitIntensity = (mode: 'double' | 'single', y: number) => {
	if (mode === 'double') return Math.cos(Math.PI * y) ** 2;
	return y === 0 ? 1 : (Math.sin(Math.PI * y) / (Math.PI * y)) ** 2;
};

/**
 * Interference. `ripple`: a ripple tank from above, two in-phase sources sending out crests (circles) that cross;
 * the antinodal lines (katar, solid) and nodal lines (düğüm, dashed) are hyperbolas with the central line between
 * the sources; `points` mark spots by their place in wavelengths. `double` / `single`: light through two slits or
 * one onto a screen, the bright and dark fringes and the brightness curve beside it; `colours` compares two lights
 * (red fringes wider than green). Beats point at `sources`, `crests`, `antinodes`, `nodes`, p1… and `run` (ripple),
 * `slits`, `screen`, `graph`, `width` (slits).
 */
export const InterferenceVisual: React.FC<VisualBoxProps & {visual: Interference}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const clip = `ripple-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const k = Math.min(width / INTERFERENCE_STAGE.width, height / INTERFERENCE_STAGE.height);
	const ox = (width - INTERFERENCE_STAGE.width * k) / 2;
	const oy = (height - INTERFERENCE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	// Labels stay at least 24 px on screen, also in the small figure box of a question.
	const fontSize = Math.max(56, 24 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);

	if (visual.mode === 'ripple') {
		const wave = 92;
		const [cx, cy] = [INTERFERENCE_STAGE.width / 2, INTERFERENCE_STAGE.height / 2];
		const half = (visual.separation / 2) * wave;
		const sources: [number, number][] = [
			[cx - half, cy],
			[cx + half, cy],
		];
		// Crests move out one wavelength per period (2 s); before `run` they stand still.
		const phase = visual.motion ? (Math.max(0, seconds - runStart) / 2) % 1 : 0;
		const radii = Array.from({length: 13}, (_, index) => (index + phase) * wave).filter((radius) => radius > 2);
		// Hyperbola |r1 − r2| = Δ (in wavelengths) through the stage; Δ = 0 is the central line.
		const hyperbola = (delta: number, side: 1 | -1) => {
			if (delta === 0) return `${cx},0 ${cx},${INTERFERENCE_STAGE.height}`;
			const a = (delta / 2) * wave;
			const b = Math.sqrt(half * half - a * a);
			const reach = Math.asinh(560 / b);
			return Array.from({length: 61}, (_, index) => {
				const t = -reach + (2 * reach * index) / 60;
				return `${cx + side * a * Math.cosh(t)},${cy + b * Math.sinh(t)}`;
			}).join(' ');
		};
		const orders = (start: number) => Array.from({length: 8}, (_, index) => start + index).filter((delta) => delta < visual.separation - 0.01);
		const antinodes = orders(0);
		const nodes = orders(0.5);
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<defs>
					<clipPath id={clip}>
						<rect x={0} y={0} width={INTERFERENCE_STAGE.width} height={INTERFERENCE_STAGE.height} rx={24} />
					</clipPath>
				</defs>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					<rect x={0} y={0} width={INTERFERENCE_STAGE.width} height={INTERFERENCE_STAGE.height} rx={24} fill={palette.fill} />
					<g clipPath={`url(#${clip})`}>
						<Part id="crests">
							{(look) => (
								<g opacity={look.opacity}>
									{sources.map(([sx, sy], index) => radii.map((radius) => <circle key={`${index}-${radius}`} cx={sx} cy={sy} r={radius} fill="none" stroke={palette.axis} strokeWidth={3} />))}
								</g>
							)}
						</Part>
						{visual.lines ? (
							<>
								<Part id="nodes">
									{(look) => (
										<g opacity={look.opacity}>
											{nodes.flatMap((delta) => [1, -1].map((side) => <polyline key={`${delta}${side}`} points={hyperbola(delta, side as 1 | -1)} fill="none" stroke={palette.ink} strokeWidth={5} strokeDasharray="16 12" />))}
										</g>
									)}
								</Part>
								<Part id="antinodes">
									{(look) => (
										<g opacity={look.opacity}>
											{antinodes.flatMap((delta) => (delta === 0 ? [1] : [1, -1]).map((side) => <polyline key={`${delta}${side}`} points={hyperbola(delta, side as 1 | -1)} fill="none" stroke={palette.lesson} strokeWidth={7} />))}
										</g>
									)}
								</Part>
							</>
						) : null}
					</g>
					<Part id="sources">
						{(look) => (
							<g opacity={look.opacity}>
								{sources.map(([sx, sy], index) => (
									<g key={index}>
										<circle cx={sx} cy={sy} r={18 * look.scale} fill={palette.ink} />
										{label(sx, sy + 78, `K${index + 1}`, 'middle', fontSize)}
									</g>
								))}
							</g>
						)}
					</Part>
					{visual.points.map((point, index) => {
						const [px, py] = [cx + point.x * wave, cy - point.y * wave];
						return (
							<Part key={point.label} id={`p${index + 1}`}>
								{(look) => (
									<g opacity={look.opacity}>
										<circle cx={px} cy={py} r={16 * look.scale} fill={palette.brand} stroke={palette.ink} strokeWidth={4} />
										{label(px + 30, py - 22, point.label, 'start', fontSize)}
									</g>
								)}
							</Part>
						);
					})}
					{visual.lines ? (
						<g>
							<rect x={24} y={24} width={500} height={160} rx={16} fill={palette.surface} opacity={0.92} />
							<line x1={50} y1={70} x2={130} y2={70} stroke={palette.lesson} strokeWidth={7} />
							{label(150, 72 + fontSize * 0.28, 'katar (yapıcı)', 'start', fontSize * 0.75)}
							<line x1={50} y1={136} x2={130} y2={136} stroke={palette.ink} strokeWidth={5} strokeDasharray="16 12" />
							{label(150, 136 + fontSize * 0.28, 'düğüm (yıkıcı)', 'start', fontSize * 0.75)}
						</g>
					) : null}
				</g>
			</svg>
		);
	}

	// Slits: the light on the left, the barrier, the screen and the brightness curve on the right.
	const mode = visual.mode;
	// Barrier, screen, the Δx bracket and the brightness curve from left to right.
	const barrier = 400;
	const screen = 900;
	const bracketX = 1010;
	const graphLeft = 1150;
	const middle = INTERFERENCE_STAGE.height / 2;
	const fringe = mode === 'double' ? 120 : 95;
	const lights = visual.colours.map((name) => LIGHT[name]);
	const strips = Array.from({length: 181}, (_, index) => 70 + (index * 760) / 180);
	const curve = (ratio: number) => strips.map((y) => `${graphLeft + 380 * slitIntensity(mode, (y - middle) / (fringe * ratio))},${y}`).join(' ');
	const gaps = mode === 'double' ? [middle - 70, middle + 70] : [middle];
	const gapHalf = mode === 'double' ? 16 : 40;
	const first = lights[0];
	// Δx: between the central bright fringe and the next one (double), or the half-width of the central one (single).
	const width0 = fringe * first.ratio;
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{lights.map((light, index) => (
					<g key={index}>
						{[-60, -20, 20, 60].map((offset) => (
							<line key={offset} x1={120} y1={middle + offset + index * 8} x2={barrier - 14} y2={middle + offset + index * 8} stroke={light.colour} strokeWidth={5} opacity={0.6} />
						))}
					</g>
				))}
				<circle cx={100} cy={middle} r={42} fill={first.colour} stroke={palette.ink} strokeWidth={5} />
				<Part id="slits">
					{(look) => (
						<g opacity={look.opacity}>
							{[70, ...gaps.flatMap((gap) => [gap - gapHalf, gap + gapHalf]), 830]
								.reduce<number[][]>((pairs, y, index, all) => (index % 2 === 0 ? [...pairs, [y, all[index + 1]]] : pairs), [])
								.map(([top, bottom]) => (
									<rect key={top} x={barrier - 14} y={top} width={28} height={bottom - top} fill={palette.ink} />
								))}
							{gaps.map((gap) =>
								[-2, -1, 0, 1, 2].map((order) => <line key={`${gap}${order}`} x1={barrier + 14} y1={gap} x2={screen} y2={middle + order * width0 * (mode === 'single' && order !== 0 ? 1.5 : 1)} stroke={first.colour} strokeWidth={3} opacity={0.35} />),
							)}
							{label(barrier, 880, mode === 'double' ? 'çift yarık' : 'tek yarık', 'middle', fontSize * 0.7)}
						</g>
					)}
				</Part>
				<Part id="screen">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={screen} y={66} width={56} height={768} fill={palette.ink} />
							{lights.map((light, index) =>
								strips.map((y) => (
									<rect
										key={`${index}-${y}`}
										x={screen + (lights.length === 1 ? 0 : index * 28)}
										y={y - 2.4}
										width={lights.length === 1 ? 56 : 28}
										height={4.8}
										fill={light.colour}
										opacity={slitIntensity(mode, (y - middle) / (fringe * light.ratio))}
									/>
								)),
							)}
							{label(screen + 28, 880, 'perde', 'middle', fontSize * 0.7)}
							{label(screen - 24, middle + fontSize * 0.28, 'M', 'end')}
						</g>
					)}
				</Part>
				<Part id="graph">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={graphLeft} y1={66} x2={graphLeft} y2={834} stroke={palette.axis} strokeWidth={4} />
							{lights.map((light, index) => (
								<polyline key={index} points={curve(light.ratio)} fill="none" stroke={light.colour} strokeWidth={6} strokeLinejoin="round" />
							))}
						</g>
					)}
				</Part>
				<Part id="width">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={bracketX} y1={middle} x2={bracketX} y2={middle - width0} stroke={palette.ink} strokeWidth={5} />
							<line x1={bracketX - 14} y1={middle} x2={bracketX + 14} y2={middle} stroke={palette.ink} strokeWidth={5} />
							<line x1={bracketX - 14} y1={middle - width0} x2={bracketX + 14} y2={middle - width0} stroke={palette.ink} strokeWidth={5} />
							<line x1={screen + 60} y1={middle} x2={bracketX - 14} y2={middle} stroke={palette.axis} strokeWidth={3} strokeDasharray="8 8" />
							<line x1={screen + 60} y1={middle - width0} x2={bracketX - 14} y2={middle - width0} stroke={palette.axis} strokeWidth={3} strokeDasharray="8 8" />
							{label(bracketX + 26, middle - width0 / 2 + fontSize * 0.28, 'Δx', 'start')}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
