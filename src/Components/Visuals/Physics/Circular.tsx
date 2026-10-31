import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Circular = Extract<CourseVisual, {kind: 'circular'}>;

/** The stage (CourseVisual keeps this ratio). */
export const CIRCULAR_STAGE = {width: 1600, height: 900};

/**
 * Angular and linear speed of a body at radius r (0–1 of the largest), relative to the outermost body. On a turning
 * disk all points share one angular speed and v grows with r; in orbits round one centre ω ∝ r^(−3/2) and
 * v ∝ r^(−1/2), so the inner body is faster on both counts.
 */
export const circularSpeeds = (mode: 'disk' | 'orbit', r: number) => (mode === 'disk' ? {omega: 1, v: r} : {omega: Math.pow(r, -1.5), v: Math.pow(r, -0.5)});

/**
 * Bodies going round a centre. On a disk they turn together (equal angles, longer arcs outside); in orbits the inner
 * ones run ahead. Each body carries its velocity, tangent to the circle, and its centripetal acceleration towards the
 * centre, the sizes compared between the bodies. `vertical` swings a ball on a string round a vertical circle and
 * shows the tension and the weight at the top and the bottom. Beats point at b1…, `velocity`, `acceleration`, `run`.
 */
export const CircularVisual: React.FC<VisualBoxProps & {visual: Circular}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / CIRCULAR_STAGE.width, height / CIRCULAR_STAGE.height);
	const ox = (width - CIRCULAR_STAGE.width * k) / 2;
	const oy = (height - CIRCULAR_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const elapsed = visual.motion ? Math.max(0, seconds - runStart) : 0;
	const fontSize = 62;
	const [cx, cy] = [visual.mode === 'vertical' ? 620 : 800, 420];
	const big = 360;
	const arrow = (from: [number, number], to: [number, number], colour: string, label: string, key: string) => {
		const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
		const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
		if (length < 12) return null;
		return (
			<g key={key}>
				<line x1={from[0]} y1={from[1]} x2={to[0] - Math.cos(angle) * 20} y2={to[1] - Math.sin(angle) * 20} stroke={colour} strokeWidth={10} strokeLinecap="round" />
				<path d={arrowHead(to[0], to[1], angle, 30)} fill={colour} />
				<text x={to[0] + Math.cos(angle) * 30} y={to[1] + Math.sin(angle) * 30 + fontSize * 0.3} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
					{label}
				</text>
			</g>
		);
	};

	if (visual.mode === 'vertical') {
		// The ball goes round anticlockwise; the tension is drawn at the top and the bottom with the weight.
		const angle = -Math.PI / 2 + (elapsed * 2 * Math.PI) / 4;
		const [bx, by] = [cx + Math.cos(angle) * big * 0.9, cy + Math.sin(angle) * big * 0.9];
		const point = (top: boolean) => [cx, cy + (top ? -1 : 1) * big * 0.9] as [number, number];
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					<circle cx={cx} cy={cy} r={big * 0.9} fill="none" stroke={palette.grid} strokeWidth={5} strokeDasharray="14 12" />
					<line x1={cx} y1={cy} x2={bx} y2={by} stroke={palette.ink} strokeWidth={5} />
					<circle cx={cx} cy={cy} r={12} fill={palette.ink} />
					<Part id="b1">{(look) => <circle cx={bx} cy={by} r={34 * look.scale} fill={palette.brand} stroke={palette.ink} strokeWidth={5} opacity={look.opacity} />}</Part>
					<Part id="acceleration">
						{(look) => (
							<g opacity={look.opacity}>
								{/* At the top tension and weight both point down, to the centre: T + mg = mv²/r. */}
								{arrow([point(true)[0] - 30, point(true)[1]], [point(true)[0] - 30, point(true)[1] + 170], palette.lesson, 'T', 'tt')}
								{arrow([point(true)[0] + 30, point(true)[1]], [point(true)[0] + 30, point(true)[1] + 150], palette.ink, 'mg', 'gt')}
								{/* At the bottom tension up, weight down: T − mg = mv²/r. */}
								{arrow([point(false)[0] - 30, point(false)[1]], [point(false)[0] - 30, point(false)[1] - 230], palette.lesson, 'T', 'tb')}
								{arrow([point(false)[0] + 30, point(false)[1]], [point(false)[0] + 30, point(false)[1] + 150], palette.ink, 'mg', 'gb')}
								<text x={cx + big + 120} y={cy - big * 0.7} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
									Tepe: T + mg = mv²/r
								</text>
								<text x={cx + big + 120} y={cy + big * 0.8} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
									Dip: T − mg = mv²/r
								</text>
							</g>
						)}
					</Part>
				</g>
			</svg>
		);
	}

	// Disk or orbits: bodies at their radii, the outer one setting the scale.
	const speeds = visual.bodies.map((body) => circularSpeeds(visual.mode as 'disk' | 'orbit', body.radius));
	const fastest = Math.max(...speeds.map((speed) => speed.v));
	const slowestTurn = Math.min(...speeds.map((speed) => speed.omega));
	const accelerations = speeds.map((speed, index) => speed.v * speed.v / visual.bodies[index].radius);
	const strongest = Math.max(...accelerations);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.mode === 'disk' ? <circle cx={cx} cy={cy} r={big + 20} fill={palette.fill} stroke={palette.ink} strokeWidth={5} /> : <circle cx={cx} cy={cy} r={44} fill={palette.brand} stroke={palette.ink} strokeWidth={5} />}
				{visual.bodies.map((body, index) => (
					<circle key={`o${index}`} cx={cx} cy={cy} r={big * body.radius} fill="none" stroke={palette.axis} strokeWidth={3} strokeDasharray="10 10" />
				))}
				<circle cx={cx} cy={cy} r={10} fill={palette.ink} />
				{visual.bodies.map((body, index) => {
					// One turn of the slowest in 6 s; anticlockwise on screen.
					// Spread evenly round the centre so arrows and labels keep apart; on a disk they keep their angles.
					const angle = -((elapsed * 2 * Math.PI) / 6) * (speeds[index].omega / slowestTurn) + (index * 2 * Math.PI) / visual.bodies.length + Math.PI / 6;
					const r = big * body.radius;
					const [bx, by] = [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
					const tangent: [number, number] = [Math.sin(angle), -Math.cos(angle)];
					const vLength = 60 + 170 * (speeds[index].v / fastest);
					const aLength = 50 + 150 * (accelerations[index] / strongest);
					return (
						<g key={index}>
							{visual.mode === 'disk' ? <line x1={cx} y1={cy} x2={bx} y2={by} stroke={palette.axis} strokeWidth={4} /> : null}
							<Part id="velocity">{(look) => <g opacity={look.opacity}>{visual.velocity ? arrow([bx, by], [bx + tangent[0] * vLength, by + tangent[1] * vLength], palette.ink, `v${body.label}`, `v${index}`) : null}</g>}</Part>
							<Part id="acceleration">
								{(look) => <g opacity={look.opacity}>{visual.acceleration ? arrow([bx, by], [bx - Math.cos(angle) * aLength, by - Math.sin(angle) * aLength], palette.lesson, `a${body.label}`, `a${index}`) : null}</g>}
							</Part>
							<Part id={`b${index + 1}`}>
								{(look) => (
									<g opacity={look.opacity}>
										<circle cx={bx} cy={by} r={28 * look.scale} fill={palette.brand} stroke={palette.ink} strokeWidth={5} />
										<text x={bx} y={by + fontSize * 0.33} fill={palette.surface} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle">
											{body.label}
										</text>
									</g>
								)}
							</Part>
						</g>
					);
				})}
				<text x={cx} y={cy + big + 80} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle">
					{visual.mode === 'disk' ? 'ω aynı, v = ωr' : 'içteki daha hızlı'}
				</text>
			</g>
		</svg>
	);
};
