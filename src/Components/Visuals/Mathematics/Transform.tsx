import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type Transform = Extract<CourseVisual, {kind: 'transform'}>;
export type TransformStep = Transform['steps'][number];
type Point = [number, number];

const SLOTS = 4;
const STEP_SECONDS = 1.7;
const RADIANS = Math.PI / 180;

const rotateAbout = ([x, y]: Point, [cx, cy]: Point, degrees: number): Point => {
	const angle = degrees * RADIANS;
	const dx = x - cx;
	const dy = y - cy;
	// Rounded so 90° turns land on whole numbers instead of 2.0000000000000004.
	const round = (value: number) => Math.round(value * 1e9) / 1e9;
	return [round(cx + dx * Math.cos(angle) - dy * Math.sin(angle)), round(cy + dx * Math.sin(angle) + dy * Math.cos(angle))];
};

/** Where a step takes a point. */
export const imageOf = (step: TransformStep, [x, y]: Point): Point => {
	switch (step.kind) {
		case 'translate':
			return [x + step.by[0], y + step.by[1]];
		case 'rotate':
			return rotateAbout([x, y], step.center, step.degrees);
		case 'reflect':
			return step.over === 'x' ? [x, -y] : step.over === 'y' ? [-x, y] : step.over === 'origin' ? [-x, -y] : step.over === 'y=x' ? [y, x] : [-y, -x];
		case 'reflectLine':
			return step.axis === 'x' ? [2 * step.at - x, y] : [x, 2 * step.at - y];
		case 'reflectPoint':
			return [2 * step.center[0] - x, 2 * step.center[1] - y];
	}
};

/**
 * Where a point is while a step is played, `t` from 0 to 1: a translation slides, a rotation turns along its arc,
 * a reflection carries the point straight across the mirror (the shape folds flat on it and opens on the far side).
 */
export const pointDuring = (step: TransformStep, from: Point, t: number): Point => {
	if (step.kind === 'rotate') return rotateAbout(from, step.center, step.degrees * t);
	const to = imageOf(step, from);
	return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
};

/** The words a step is shown with when it has no label of its own. */
export const stepName = (step: TransformStep): string => {
	const n = (value: number) => `${value < 0 ? '−' : ''}${String(Math.abs(Number(value.toFixed(2)))).replace('.', ',')}`;
	switch (step.kind) {
		case 'translate':
			return `Öteleme (${n(step.by[0])}, ${n(step.by[1])})`;
		case 'rotate':
			return `${step.center[0] === 0 && step.center[1] === 0 ? 'O' : `(${n(step.center[0])}, ${n(step.center[1])})`} etrafında ${n(Math.abs(step.degrees))}° ${step.degrees < 0 ? 'saat yönünde' : 'saatin tersine'}`;
		case 'reflect':
			return {
				x: 'x eksenine göre yansıma',
				y: 'y eksenine göre yansıma',
				origin: 'Orijine göre yansıma',
				'y=x': 'y = x doğrusuna göre yansıma',
				'y=-x': 'y = −x doğrusuna göre yansıma',
			}[step.over];
		case 'reflectLine':
			return `${step.axis} = ${n(step.at)} doğrusuna göre yansıma`;
		case 'reflectPoint':
			return `(${n(step.center[0])}, ${n(step.center[1])}) noktasına göre yansıma`;
	}
};

/**
 * Geometric transformations on a coordinate grid (AYT Dönüşümler; owner, 30 Oct 2026: "iyi animasyon"). The shape
 * (a point, a segment or a polygon) is drawn first; each step (parts s1…) then plays when a beat shows or focuses it.
 * A translation slides the shape along a dashed vector, a rotation turns it about its centre while an arc follows the
 * first vertex, a reflection draws the mirror and carries every vertex straight across it. Earlier positions stay as
 * faint outlines, the vertices gain a prime per step (A, A', A'') and, with `coordinates`, the finished position
 * writes each vertex's coordinates.
 */
export const TransformVisual: React.FC<VisualBoxProps & {visual: Transform}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	// Every hook is called for every slot, in the same order on every frame; the first beat that names a step plays it.
	const firstStart = (id: string) => {
		const shown = useBeatStartFor(id, 'show');
		const focused = useBeatStartFor(id, 'focus');
		return shown === undefined ? focused : focused === undefined ? shown : Math.min(shown, focused);
	};
	const stepStarts = Array.from({length: SLOTS}, (_, index) => firstStart(`s${index + 1}`));
	const stepLooks = Array.from({length: SLOTS}, (_, index) => useElementState(index < visual.steps.length ? `s${index + 1}` : undefined));
	const grid = useReveal(delaySeconds, 0.6);
	const shapeIn = useReveal(delaySeconds + 0.4, 0.6);

	const [minX, minY, maxX, maxY] = visual.view;
	const font = u(30);
	const margin = font * 2.2;
	const scale = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const offsetX = (width - (maxX - minX) * scale) / 2;
	const offsetY = (height - (maxY - minY) * scale) / 2;
	const sx = (x: number) => offsetX + (x - minX) * scale;
	const sy = (y: number) => offsetY + (maxY - y) * scale;
	const screen = ([x, y]: Point): Point => [sx(x), sy(y)];
	const n = (value: number) => `${value < 0 ? '−' : ''}${String(Math.abs(Number(value.toFixed(2)))).replace('.', ',')}`;

	// Positions after 0, 1, 2 … steps.
	const positions: Point[][] = [visual.shape.map((vertex) => vertex.at)];
	visual.steps.forEach((step, index) => positions.push(positions[index].map((point) => imageOf(step, point))));
	const progress = visual.steps.map((_, index) => easeFrom(seconds, stepStarts[index] ?? delaySeconds + 1.2 + index * 2.6, STEP_SECONDS));
	const done = progress.filter((value) => value >= 0.999).length;
	const moving = done < visual.steps.length && progress[done] > 0.001 ? done : undefined;
	const current: Point[] = moving === undefined ? positions[done] : positions[moving].map((point) => pointDuring(visual.steps[moving], point, progress[moving]));
	// The typewriter apostrophe: Manrope draws the prime sign (′) as a slanted stroke that reads like a slash.
	const primes = (count: number) => "'".repeat(count);
	const shownPrimes = done + (moving !== undefined && progress[moving] > 0.5 ? 1 : 0);
	const activeStep = moving ?? (done > 0 ? done - 1 : undefined);

	const step = Math.max(maxX - minX, maxY - minY) > 14 ? 2 : 1;
	const ticks = (low: number, high: number) => {
		const out: number[] = [];
		for (let value = Math.ceil(low / step) * step; value <= high + 1e-9; value += step) out.push(value);
		return out;
	};
	const centroid = (points: Point[]): Point => [points.reduce((sum, point) => sum + point[0], 0) / points.length, points.reduce((sum, point) => sum + point[1], 0) / points.length];
	/** A vertex's name stands outside the shape, away from its centre (above and right for a lone point). */
	const labelAt = (points: Point[], index: number): Point => {
		const [x, y] = screen(points[index]);
		const [cx, cy] = screen(centroid(points));
		const dx = points.length === 1 ? 1 : x - cx;
		const dy = points.length === 1 ? -1 : y - cy;
		const length = Math.hypot(dx, dy) || 1;
		return [x + (dx / length) * font * 1.25, y + (dy / length) * font * 1.1];
	};
	const shapePath = (points: Point[]) => points.map((point) => screen(point).join(',')).join(' ');
	const drawShape = (
		points: Point[],
		options: {
			ghost: boolean;
			opacity: number;
			names: string;
			coordinates: boolean;
		},
	) => (
		<g opacity={options.opacity}>
			{points.length > 2 ? (
				<polygon
					points={shapePath(points)}
					fill={options.ghost ? withAlpha(palette.ink, 0.05) : withAlpha(palette.lesson, 0.22)}
					stroke={options.ghost ? withAlpha(palette.ink, 0.45) : palette.lesson}
					strokeWidth={u(options.ghost ? 3 : 5)}
					strokeDasharray={options.ghost ? `${u(10)} ${u(8)}` : undefined}
					strokeLinejoin="round"
				/>
			) : points.length === 2 ? (
				<line
					x1={sx(points[0][0])}
					y1={sy(points[0][1])}
					x2={sx(points[1][0])}
					y2={sy(points[1][1])}
					stroke={options.ghost ? withAlpha(palette.ink, 0.45) : palette.lesson}
					strokeWidth={u(options.ghost ? 3 : 6)}
					strokeDasharray={options.ghost ? `${u(10)} ${u(8)}` : undefined}
				/>
			) : null}
			{points.map((point, index) => {
				const [lx, ly] = labelAt(points, index);
				const name = `${visual.shape[index].name}${options.names}`;
				const label = options.coordinates ? `${name}(${n(point[0])}, ${n(point[1])})` : name;
				// A long name near the edge stays inside the grid instead of running onto the numbers beside it.
				const half = (label.length * font * (options.ghost ? 0.85 : 1) * 0.56) / 2;
				const x = Math.min(Math.max(lx, sx(minX) + half + u(6)), sx(maxX) - half - u(6));
				return (
					<g key={index}>
						<circle cx={sx(point[0])} cy={sy(point[1])} r={u(options.ghost ? 7 : 10)} fill={options.ghost ? withAlpha(palette.ink, 0.5) : palette.lesson} />
						<text
							x={x}
							y={ly}
							textAnchor="middle"
							dominantBaseline="middle"
							fill={options.ghost ? palette.muted : palette.ink}
							style={{
								fontFamily: palette.fontBody,
								fontWeight: 800,
								fontSize: font * (options.ghost ? 0.85 : 1),
							}}
						>
							{label}
						</text>
					</g>
				);
			})}
		</g>
	);

	/** The mirror, centre or vector of a step, drawn while it plays and kept faint afterwards. */
	const guide = (index: number) => {
		const move = visual.steps[index];
		const shown = Math.min(1, progress[index] * 3);
		if (shown <= 0.001) return null;
		const look = stepLooks[index];
		const opacity = shown * (index === activeStep ? 1 : 0.35) * (1 - UNFOCUSED_FADE * look.dim);
		const mirrorColour = palette.brand;
		const dashed = `${u(14)} ${u(10)}`;
		const lineThrough = (a: Point, b: Point, label: string) => {
			// The mirror runs across the whole view; its name sits near the top right end.
			const [ax, ay] = screen(a);
			const [bx, by] = screen(b);
			return (
				<g opacity={opacity}>
					<line x1={ax} y1={ay} x2={bx} y2={by} stroke={mirrorColour} strokeWidth={u(4)} strokeDasharray={dashed} />
					<text
						x={bx - u(10)}
						y={by + (by < ay ? u(30) : -u(18))}
						textAnchor="end"
						fill={mirrorColour}
						style={{
							fontFamily: palette.fontBody,
							fontWeight: 800,
							fontSize: font * 0.9,
						}}
					>
						{label}
					</text>
				</g>
			);
		};
		switch (move.kind) {
			case 'reflect':
				if (move.over === 'x') return lineThrough([minX, 0], [maxX, 0], 'ayna: x ekseni');
				if (move.over === 'y') return lineThrough([0, minY], [0, maxY], 'ayna: y ekseni');
				if (move.over === 'y=x') return lineThrough([Math.max(minX, minY), Math.max(minX, minY)], [Math.min(maxX, maxY), Math.min(maxX, maxY)], 'y = x');
				if (move.over === 'y=-x') return lineThrough([Math.max(minX, -maxY), -Math.max(minX, -maxY)], [Math.min(maxX, -minY), -Math.min(maxX, -minY)], 'y = −x');
				return <circle cx={sx(0)} cy={sy(0)} r={u(12)} fill={mirrorColour} opacity={opacity} />;
			case 'reflectLine':
				return move.axis === 'x' ? lineThrough([move.at, minY], [move.at, maxY], `x = ${n(move.at)}`) : lineThrough([minX, move.at], [maxX, move.at], `y = ${n(move.at)}`);
			case 'reflectPoint':
				return <circle cx={sx(move.center[0])} cy={sy(move.center[1])} r={u(12)} fill={mirrorColour} opacity={opacity} />;
			case 'rotate': {
				// An arc follows the first vertex around the centre.
				const from = positions[index][0];
				const radius = Math.hypot(from[0] - move.center[0], from[1] - move.center[1]);
				if (radius < 1e-6) return null;
				const turned = move.degrees * Math.min(1, progress[index]);
				const steps = Math.max(2, Math.ceil(Math.abs(turned) / 3));
				const arc = Array.from({length: steps + 1}, (_, k) => screen(rotateAbout(from, move.center, (turned * k) / steps)).join(' ')).join(' L');
				return (
					<g opacity={opacity}>
						<line x1={sx(move.center[0])} y1={sy(move.center[1])} x2={sx(from[0])} y2={sy(from[1])} stroke={withAlpha(mirrorColour, 0.6)} strokeWidth={u(3)} strokeDasharray={dashed} />
						<path d={`M${arc}`} fill="none" stroke={mirrorColour} strokeWidth={u(4)} strokeDasharray={dashed} />
						<circle cx={sx(move.center[0])} cy={sy(move.center[1])} r={u(11)} fill={mirrorColour} />
					</g>
				);
			}
			case 'translate': {
				const from = positions[index][0];
				const to = positions[index + 1][0];
				const [ax, ay] = screen(from);
				const [bx, by] = screen([from[0] + (to[0] - from[0]) * Math.min(1, progress[index]), from[1] + (to[1] - from[1]) * Math.min(1, progress[index])]);
				const angle = Math.atan2(by - ay, bx - ax);
				const size = u(14);
				return (
					<g opacity={opacity}>
						<line x1={ax} y1={ay} x2={bx} y2={by} stroke={mirrorColour} strokeWidth={u(4)} strokeDasharray={dashed} />
						{Math.hypot(bx - ax, by - ay) > size * 2 ? (
							<path
								d={`M${bx} ${by} L${bx - size * 1.6 * Math.cos(angle) + size * Math.sin(angle)} ${by - size * 1.6 * Math.sin(angle) - size * Math.cos(angle)} L${bx - size * 1.6 * Math.cos(angle) - size * Math.sin(angle)} ${by - size * 1.6 * Math.sin(angle) + size * Math.cos(angle)} Z`}
								fill={mirrorColour}
							/>
						) : null}
					</g>
				);
			}
		}
	};

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			{/* Grid, axes and the numbers on them. */}
			<g opacity={grid}>
				{ticks(minX, maxX).map((x) => (
					<line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={sy(minY)} y2={sy(maxY)} stroke={withAlpha(palette.ink, 0.08)} strokeWidth={u(2)} />
				))}
				{ticks(minY, maxY).map((y) => (
					<line key={`gy${y}`} x1={sx(minX)} x2={sx(maxX)} y1={sy(y)} y2={sy(y)} stroke={withAlpha(palette.ink, 0.08)} strokeWidth={u(2)} />
				))}
				{minY <= 0 && maxY >= 0 ? <line x1={sx(minX)} x2={sx(maxX)} y1={sy(0)} y2={sy(0)} stroke={palette.ink} strokeWidth={u(3)} /> : null}
				{minX <= 0 && maxX >= 0 ? <line x1={sx(0)} x2={sx(0)} y1={sy(minY)} y2={sy(maxY)} stroke={palette.ink} strokeWidth={u(3)} /> : null}
				{/* The numbers run along the bottom and left edges, where no vertex name can sit on them. */}
				{ticks(minX, maxX).map((x) => (
					<text
						key={`tx${x}`}
						x={sx(x)}
						y={sy(minY) + font * 0.95}
						textAnchor="middle"
						fill={palette.muted}
						style={{
							fontFamily: palette.fontBody,
							fontWeight: 600,
							fontSize: font * 0.72,
						}}
					>
						{n(x)}
					</text>
				))}
				{ticks(minY, maxY).map((y) => (
					<text
						key={`ty${y}`}
						x={sx(minX) - font * 0.45}
						y={sy(y)}
						textAnchor="end"
						dominantBaseline="middle"
						fill={palette.muted}
						style={{
							fontFamily: palette.fontBody,
							fontWeight: 600,
							fontSize: font * 0.72,
						}}
					>
						{n(y)}
					</text>
				))}
			</g>
			{visual.steps.map((_, index) => (
				<g key={`guide${index}`}>{guide(index)}</g>
			))}
			{/* Where the shape has been: the start and every finished step but the last, as faint outlines. */}
			{positions.slice(0, done + (moving !== undefined ? 1 : 0)).map((points, index) => (
				<g key={`ghost${index}`}>
					{drawShape(points, {
						ghost: true,
						opacity: shapeIn * 0.9,
						names: primes(index),
						coordinates: false,
					})}
				</g>
			))}
			{drawShape(current, {
				ghost: false,
				opacity: shapeIn,
				names: primes(shownPrimes),
				coordinates: visual.coordinates && moving === undefined,
			})}
			{/* The step being played, named in the corner. */}
			{activeStep !== undefined ? (
				<text
					x={u(16)}
					y={font * 1.1}
					fill={palette.lessonDeep}
					opacity={Math.min(1, progress[activeStep] * 4)}
					style={{
						fontFamily: palette.fontBody,
						fontWeight: 800,
						fontSize: font,
					}}
				>
					{visual.steps[activeStep].label ?? stepName(visual.steps[activeStep])}
				</text>
			) : null}
		</svg>
	);
};
