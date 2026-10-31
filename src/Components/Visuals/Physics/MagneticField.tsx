import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type MagneticField = Extract<CourseVisual, {kind: 'magneticField'}>;

/** The stage (CourseVisual keeps this ratio). */
export const MAGNETIC_STAGE = {width: 1600, height: 900};

type Vector = [number, number];
const DIRECTIONS: Record<'up' | 'down' | 'left' | 'right', Vector> = {up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0]};

/**
 * The magnetic force direction in the page (x right, y up), from F = q v × B or F = I L × B with B into (⊗, −z)
 * or out of (⊙, +z) the page: v × ẑ = (vᵧ, −vₓ). A negative charge is pushed the other way.
 */
export const magneticForce = (motion: Vector, field: 'in' | 'out', sign: 1 | -1 = 1): Vector => {
	const bz = field === 'out' ? 1 : -1;
	// Adding 0 turns −0 into 0.
	return [sign * motion[1] * bz + 0, -sign * motion[0] * bz + 0];
};

/**
 * Which way the field of a straight current circles, seen with the current coming out of the page: anticlockwise
 * (+1) by the right-hand rule; a current into the page circles clockwise (−1).
 */
export const wireCirculation = (current: 'in' | 'out') => (current === 'out' ? 1 : -1);

const toScreen = ([x, y]: Vector): Vector => [x, -y];

/**
 * Magnetism in four pictures. `particle`: a charge enters a field into or out of the page and turns on a circle, the
 * force always towards the centre. `wire`: a straight current through the page with its circular field lines and
 * their direction. `force`: a current in a field feels F = BIL across it. `parallel`: two currents attract when they
 * run the same way and repel when they run against each other. Beats point at `field`, `body`, `force`, `run`.
 */
export const MagneticFieldVisual: React.FC<VisualBoxProps & {visual: MagneticField}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / MAGNETIC_STAGE.width, height / MAGNETIC_STAGE.height);
	const ox = (width - MAGNETIC_STAGE.width * k) / 2;
	const oy = (height - MAGNETIC_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const fieldIn = easeFrom(seconds, useBeatStartFor('field', 'show') ?? delaySeconds + 0.3, 0.6);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1.2;
	const run = visual.motion ? Math.max(0, Math.min(1, (seconds - runStart) / visual.duration)) : 1;
	const forceIn = easeFrom(seconds, useBeatStartFor('force', 'show') ?? runStart, 0.5);
	const fontSize = 52;
	const [cx, cy] = [MAGNETIC_STAGE.width / 2, MAGNETIC_STAGE.height / 2];
	const symbol = (x: number, y: number, into: boolean, size: number, key: string, colour: string) =>
		into ? (
			<g key={key} stroke={colour} strokeWidth={5}>
				<circle cx={x} cy={y} r={size} fill="none" />
				<line x1={x - size * 0.6} y1={y - size * 0.6} x2={x + size * 0.6} y2={y + size * 0.6} />
				<line x1={x - size * 0.6} y1={y + size * 0.6} x2={x + size * 0.6} y2={y - size * 0.6} />
			</g>
		) : (
			<g key={key}>
				<circle cx={x} cy={y} r={size} fill="none" stroke={colour} strokeWidth={5} />
				<circle cx={x} cy={y} r={size * 0.28} fill={colour} />
			</g>
		);
	const arrow = (from: Vector, to: Vector, colour: string, width = 12, key?: string) => {
		const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
		return (
			<g key={key}>
				<line x1={from[0]} y1={from[1]} x2={to[0] - Math.cos(angle) * 22} y2={to[1] - Math.sin(angle) * 22} stroke={colour} strokeWidth={width} strokeLinecap="round" />
				<path d={arrowHead(to[0], to[1], angle, 34)} fill={colour} />
			</g>
		);
	};
	// The field region of the particle and force pictures: a grid of ⊗ or ⊙.
	const grid = (
		<Part id="field">
			{(look) => (
				<g opacity={fieldIn * look.opacity * 0.55}>
					{Array.from({length: 6}, (_, row) =>
						Array.from({length: 11}, (_, column) => symbol(240 + column * 112, 130 + row * 128, visual.field === 'in', 18, `${row}-${column}`, palette.lessonDeep)),
					)}
				</g>
			)}
		</Part>
	);

	if (visual.mode === 'particle') {
		const sign = visual.charge === '+' ? 1 : -1;
		const radius = 220;
		const velocity: Vector = [1, 0];
		const push = magneticForce(velocity, visual.field, sign);
		// The whole circle stays in the field: the charge comes in low when pushed up, high when pushed down.
		const entry: Vector = [cx - 100, cy + (push[1] > 0 ? 1 : -1) * radius + (push[1] > 0 ? 10 : -10)];
		// The centre lies one radius along the force (screen y down).
		const centre: Vector = [entry[0] + push[0] * radius, entry[1] - push[1] * radius];
		const start = Math.atan2(entry[1] - centre[1], entry[0] - centre[0]);
		// Turning sense on screen: towards the force from the velocity.
		const turn = Math.sign(velocity[0] * -push[1] - 0 * push[0]) || 1;
		const angle = start + turn * run * Math.PI * 1.5;
		const [px, py]: Vector = [centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius];
		const path = Array.from({length: 61}, (_, index) => {
			const a = start + turn * ((run * index) / 60) * Math.PI * 1.5;
			return `${centre[0] + Math.cos(a) * radius},${centre[1] + Math.sin(a) * radius}`;
		}).join(' ');
		const tangent: Vector = [-Math.sin(angle) * turn, Math.cos(angle) * turn];
		const inward: Vector = [(centre[0] - px) / radius, (centre[1] - py) / radius];
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					{grid}
					<line x1={180} y1={entry[1]} x2={entry[0]} y2={entry[1]} stroke={palette.ink} strokeWidth={5} strokeDasharray="6 12" strokeLinecap="round" />
					<polyline points={path} fill="none" stroke={palette.ink} strokeWidth={5} strokeDasharray="6 12" strokeLinecap="round" />
					<Part id="body">
						{(look) => (
							<g opacity={look.opacity}>
								{arrow([px, py], [px + tangent[0] * 150, py + tangent[1] * 150], palette.ink, 10)}
								<text x={px + tangent[0] * 150 + 16} y={py + tangent[1] * 150 - 16} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
									v
								</text>
								<circle cx={px} cy={py} r={30 * look.scale} fill={sign > 0 ? palette.brand : palette.lesson} stroke={palette.ink} strokeWidth={5} />
								<text x={px} y={py + fontSize * 0.36} fill={palette.surface} fontSize={fontSize} fontWeight={800} textAnchor="middle">
									{sign > 0 ? '+' : '−'}
								</text>
							</g>
						)}
					</Part>
					<Part id="force">
						{(look) => (
							<g opacity={forceIn * look.opacity}>
								{arrow([px, py], [px + inward[0] * 150, py + inward[1] * 150], palette.brand, 12)}
								<text x={px + inward[0] * 150 + 18} y={py + inward[1] * 150 + 18} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
									F
								</text>
								<line x1={centre[0]} y1={centre[1]} x2={centre[0] + radius} y2={centre[1]} stroke={palette.muted} strokeWidth={4} strokeDasharray="12 10" />
								<text x={centre[0] + radius / 2} y={centre[1] - 16} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle">
									r = mv / qB
								</text>
							</g>
						)}
					</Part>
				</g>
			</svg>
		);
	}

	if (visual.mode === 'wire') {
		const circulation = wireCirculation(visual.current === 'in' ? 'in' : 'out');
		const rings = [110, 210, 330];
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					<Part id="field">
						{(look) => (
							<g opacity={fieldIn * look.opacity}>
								{rings.map((r, index) => {
									// Arrows on each ring, moving round with the run so the circulation can be seen.
									const phase = run * Math.PI * 2 * circulation;
									return (
										<g key={r}>
											<circle cx={cx} cy={cy} r={r} fill="none" stroke={palette.lesson} strokeWidth={6 - index} />
											{[0, 1, 2, 3].map((quarter) => {
												// Math angle anticlockwise; on screen y is down, so the screen angle is its negative.
												const a = (quarter * Math.PI) / 2 + phase + index * 0.4;
												const [x, y] = [cx + Math.cos(a) * r, cy - Math.sin(a) * r];
												const heading = -(a + (circulation * Math.PI) / 2);
												return <path key={quarter} d={arrowHead(x, y, heading, 30)} fill={palette.lesson} />;
											})}
										</g>
									);
								})}
							</g>
						)}
					</Part>
					<Part id="body">
						{(look) => (
							<g opacity={look.opacity}>
								<circle cx={cx} cy={cy} r={44 * look.scale} fill={palette.surface} stroke={palette.ink} strokeWidth={6} />
								{symbol(cx, cy, visual.current === 'in', 30, 'i', palette.brand)}
								<text x={cx + 60} y={cy - 54} fill={palette.ink} fontSize={fontSize} fontWeight={800}>
									i
								</text>
								<text x={cx + rings[2] + 30} y={cy + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800}>
									B ∝ i / d
								</text>
							</g>
						)}
					</Part>
				</g>
			</svg>
		);
	}

	if (visual.mode === 'force') {
		const flow = DIRECTIONS[(visual.current === 'in' || visual.current === 'out' ? 'right' : visual.current) as keyof typeof DIRECTIONS];
		const push = magneticForce(flow, visual.field, 1);
		const [fx, fy] = toScreen(flow);
		const [qx, qy] = toScreen(push);
		const half = 300;
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					{grid}
					<Part id="body">
						{(look) => (
							<g opacity={look.opacity}>
								<line x1={cx - fx * half} y1={cy - fy * half} x2={cx + fx * half} y2={cy + fy * half} stroke={palette.ink} strokeWidth={16 * look.scale} strokeLinecap="round" />
								{arrow([cx - fx * 80, cy - fy * 80], [cx + fx * 80, cy + fy * 80], palette.brand, 10)}
								<text x={cx + fx * 120 + 20} y={cy + fy * 120 - 24} fill={palette.ink} fontSize={fontSize} fontWeight={800}>
									i
								</text>
							</g>
						)}
					</Part>
					<Part id="force">
						{(look) => (
							<g opacity={forceIn * look.opacity}>
								{arrow([cx, cy], [cx + qx * 230, cy + qy * 230], palette.lesson, 14)}
								<text x={cx + qx * 230} y={cy + qy * 230 - 44} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
									F = BiL
								</text>
							</g>
						)}
					</Part>
				</g>
			</svg>
		);
	}

	// Two parallel wires.
	const [first, second] = visual.currents;
	const same = first === second;
	const gap = 220 * (1 + (same ? -0.25 : 0.25) * run);
	const wires: [number, 'up' | 'down'][] = [
		[cx - gap, first],
		[cx + gap, second],
	];
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{wires.map(([x, direction], index) => (
					<Part key={index} id="body">
						{(look) => (
							<g opacity={look.opacity}>
								<line x1={x} y1={110} x2={x} y2={790} stroke={palette.ink} strokeWidth={14} strokeLinecap="round" />
								{arrow([x, direction === 'up' ? 520 : 380], [x, direction === 'up' ? 380 : 520], palette.brand, 10)}
								<text x={x + 30} y={direction === 'up' ? 380 : 540} fill={palette.ink} fontSize={fontSize} fontWeight={800}>
									{`i${index + 1}`}
								</text>
							</g>
						)}
					</Part>
				))}
				<Part id="force">
					{(look) => (
						<g opacity={forceIn * look.opacity}>
							{arrow([cx - gap, 650], [cx - gap + (same ? 160 : -160), 650], palette.lesson, 12)}
							{arrow([cx + gap, 650], [cx + gap + (same ? -160 : 160), 650], palette.lesson, 12)}
							<text x={cx} y={872} fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle">
								{same ? 'Aynı yön: çeker' : 'Zıt yön: iter'}
							</text>
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
