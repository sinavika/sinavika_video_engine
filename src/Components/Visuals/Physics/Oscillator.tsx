import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Oscillator = Extract<CourseVisual, {kind: 'oscillator'}>;

/** The stage: a lone pendulum gets a narrower one, so it is not lost in the middle of a wide box. */
export const oscillatorStage = (visual: Pick<Oscillator, 'mode' | 'energy'>) => ({width: visual.mode === 'pendulum' && !visual.energy ? 1100 : 1600, height: 900});

/**
 * Simple harmonic motion `seconds` after release from rest at +A: position as a share of the amplitude
 * (x = cos ωt), velocity as a share of Aω (v = −sin ωt), acceleration as a share of Aω² (a = −x), and the kinetic
 * and potential shares of the total energy (v² + x² = 1).
 */
export const harmonicState = (seconds: number, period: number) => {
	const phase = (2 * Math.PI * seconds) / period;
	const x = Math.cos(phase);
	const v = -Math.sin(phase);
	return {x, v, a: -x, kinetic: v * v, potential: x * x, phase};
};

/** A still body at x (share of the amplitude), heading back towards the middle: |v| = √(1 − x²). */
const stillState = (x: number) => {
	const v = -(Math.sign(x) || -1) * Math.sqrt(Math.max(0, 1 - x * x));
	return {x, v, a: -x, kinetic: v * v, potential: x * x, phase: Math.atan2(-v, x)};
};

/**
 * Simple harmonic motion as it is: a block on a spring (`spring`) or a pendulum bob (`pendulum`) released from +A,
 * with its velocity (largest in the middle) and its acceleration, the restoring force's direction (largest at the
 * ends, always towards the middle). `energy` adds kinetic and potential energy bars that trade with the total fixed;
 * `reference` (spring) shows the motion as the shadow of a point going round a circle; `trace` (spring) records x
 * on a strip running downwards, so a cosine grows under the block. `marks` label points along the path (K, L, O…).
 * With `motion` off the body stands at `at` for question figures. Beats point at `body`, `velocity`,
 * `acceleration`, `energy`, `reference`, `trace`, `marks` and `run` (starts the motion).
 */
export const OscillatorVisual: React.FC<VisualBoxProps & {visual: Oscillator}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const stage = oscillatorStage(visual);
	const k = Math.min(width / stage.width, height / stage.height);
	const ox = (width - stage.width * k) / 2;
	const oy = (height - stage.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const elapsed = Math.max(0, seconds - runStart);
	const state = visual.motion ? harmonicState(elapsed, visual.period) : stillState(visual.at);
	// Labels stay at least 20 px on screen, also in the small figure box of a question.
	const fontSize = Math.max(66, 20 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.85) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const arrow = (from: [number, number], direction: [number, number], length: number, colour: string, text: string) => {
		if (length < 16) return null;
		const angle = Math.atan2(direction[1], direction[0]);
		const to: [number, number] = [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length];
		return (
			<g>
				<line x1={from[0]} y1={from[1]} x2={to[0] - Math.cos(angle) * 20} y2={to[1] - Math.sin(angle) * 20} stroke={colour} strokeWidth={10} strokeLinecap="round" />
				<path d={arrowHead(to[0], to[1], angle, 30)} fill={colour} />
				{label(to[0] + Math.cos(angle) * 42, to[1] + Math.sin(angle) * 42 + fontSize * 0.28, text)}
			</g>
		);
	};

	// Energy bars on the right: kinetic and potential under a fixed total line.
	const barsLeft = 1300;
	const energyBars = visual.energy ? (
		<Part id="energy">
			{(look) => (
				<g opacity={look.opacity}>
					<line x1={barsLeft - 30} y1={240} x2={barsLeft + 260} y2={240} stroke={palette.ink} strokeWidth={4} strokeDasharray="14 10" />
					{label(barsLeft + 115, 210, 'E sabit', 'middle', fontSize * 0.8)}
					{[
						{name: 'Ek', share: state.kinetic, colour: palette.lesson},
						{name: 'Ep', share: state.potential, colour: palette.brand},
					].map((bar, index) => {
						const h = 520 * bar.share;
						const x = barsLeft + index * 130;
						return (
							<g key={bar.name}>
								<rect x={x} y={760 - h} width={100} height={h} rx={10} fill={bar.colour} />
								<line x1={x - 10} y1={760} x2={x + 110} y2={760} stroke={palette.ink} strokeWidth={4} />
								{label(x + 50, 820, bar.name, 'middle', fontSize * 0.75)}
							</g>
						);
					})}
				</g>
			)}
		</Part>
	) : null;
	const right = visual.energy ? 1220 : 1560;

	if (visual.mode === 'pendulum') {
		const pivot: [number, number] = [visual.energy ? 640 : stage.width / 2, 60];
		const length = 660;
		const swing = 0.5;
		const angleAt = (share: number) => share * swing;
		const bobAt = (share: number): [number, number] => [pivot[0] + Math.sin(angleAt(share)) * length, pivot[1] + Math.cos(angleAt(share)) * length];
		const [bx, by] = bobAt(state.x);
		const theta = angleAt(state.x);
		const tangent: [number, number] = [Math.cos(theta), -Math.sin(theta)];
		// Both arrows sit on the string above the bob, so they keep clear of the labels under the arc.
		const up = (distance: number): [number, number] => [bx - Math.sin(theta) * distance, by - Math.cos(theta) * distance];
		const arc = Array.from({length: 41}, (_, index) => bobAt(-1.15 + (2.3 * index) / 40).join(',')).join(' ');
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					<line x1={pivot[0] - 160} y1={pivot[1]} x2={pivot[0] + 160} y2={pivot[1]} stroke={palette.ink} strokeWidth={8} />
					<line x1={pivot[0]} y1={pivot[1]} x2={pivot[0]} y2={pivot[1] + length + 60} stroke={palette.axis} strokeWidth={3} strokeDasharray="10 10" />
					<polyline points={arc} fill="none" stroke={palette.axis} strokeWidth={4} strokeDasharray="12 10" />
					<Part id="marks">
						{(look) => (
							<g opacity={look.opacity}>
								{visual.marks.map((mark) => {
									const [mx, my] = bobAt(mark.at);
									const out: [number, number] = [Math.sin(angleAt(mark.at)), Math.cos(angleAt(mark.at))];
									return (
										<g key={mark.label}>
											<line x1={mx} y1={my} x2={mx + out[0] * 24} y2={my + out[1] * 24} stroke={palette.ink} strokeWidth={5} />
											{label(mx + out[0] * 80, my + out[1] * 80 + fontSize * 0.3, mark.label)}
										</g>
									);
								})}
							</g>
						)}
					</Part>
					<line x1={pivot[0]} y1={pivot[1]} x2={bx} y2={by} stroke={palette.ink} strokeWidth={5} />
					<circle cx={pivot[0]} cy={pivot[1]} r={10} fill={palette.ink} />
					<Part id="body">{(look) => <circle cx={bx} cy={by} r={40 * look.scale} fill={palette.lesson} stroke={palette.ink} strokeWidth={5} opacity={look.opacity} />}</Part>
					<Part id="velocity">{(look) => <g opacity={look.opacity}>{visual.velocity ? arrow(up(90), [tangent[0] * Math.sign(state.v), tangent[1] * Math.sign(state.v)], 200 * Math.abs(state.v), palette.ink, 'v') : null}</g>}</Part>
					<Part id="acceleration">
						{(look) => <g opacity={look.opacity}>{visual.acceleration ? arrow(up(190), [-tangent[0] * Math.sign(state.x), -tangent[1] * Math.sign(state.x)], 180 * Math.abs(state.x), palette.lesson, 'a') : null}</g>}
					</Part>
					{energyBars}
				</g>
			</svg>
		);
	}

	// Spring: the wall on the left, the block on the floor, the middle (x = 0) at cx.
	const amplitude = visual.reference ? 330 : visual.energy ? 340 : 400;
	const cx = visual.energy ? 680 : 840;
	const by = visual.trace ? 170 : visual.reference ? 470 : 440;
	const floor = by + 60;
	const wall = cx - amplitude - 200;
	const bx = cx + state.x * amplitude;
	const coils = 11;
	const springEnd = bx - 60;
	const spring = [
		[wall, by],
		[wall + 24, by],
		...Array.from({length: coils * 2}, (_, index) => [wall + 24 + ((springEnd - wall - 48) * (index + 0.5)) / (coils * 2), by + (index % 2 === 0 ? -28 : 28)]),
		[springEnd - 24, by],
		[springEnd, by],
	]
		.map((point) => point.join(','))
		.join(' ');
	// The trace: x over the last 1.5 periods on a strip running down from under the floor.
	const stripTop = floor + 150;
	const stripBottom = 870;
	const span = 1.5 * visual.period;
	const perSecond = (stripBottom - stripTop) / span;
	const trace =
		visual.trace && visual.motion
			? Array.from({length: 181}, (_, index) => {
					const back = (span * index) / 180;
					if (back > elapsed) return null;
					return `${cx + harmonicState(elapsed - back, visual.period).x * amplitude},${stripTop + back * perSecond}`;
				})
					.filter((point) => point !== null)
					.join(' ')
			: '';
	const circlePoint: [number, number] = [cx + Math.cos(state.phase) * amplitude, by - Math.sin(state.phase) * amplitude];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.reference ? (
					<Part id="reference">
						{(look) => (
							<g opacity={look.opacity}>
								<circle cx={cx} cy={by} r={amplitude} fill="none" stroke={palette.axis} strokeWidth={4} strokeDasharray="12 10" />
								<line x1={cx} y1={by} x2={circlePoint[0]} y2={circlePoint[1]} stroke={palette.axis} strokeWidth={4} />
								<line x1={circlePoint[0]} y1={circlePoint[1]} x2={bx} y2={by} stroke={palette.lesson} strokeWidth={4} strokeDasharray="10 8" />
								<circle cx={circlePoint[0]} cy={circlePoint[1]} r={20} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
							</g>
						)}
					</Part>
				) : null}
				{visual.trace ? (
					<Part id="trace">
						{(look) => (
							<g opacity={look.opacity}>
								<rect x={cx - amplitude - 30} y={stripTop} width={amplitude * 2 + 60} height={stripBottom - stripTop} rx={12} fill={palette.fill} />
								{[-1, 0, 1].map((share) => (
									<line key={share} x1={cx + share * amplitude} y1={stripTop} x2={cx + share * amplitude} y2={stripBottom} stroke={palette.axis} strokeWidth={3} strokeDasharray="10 10" />
								))}
								<polyline points={trace} fill="none" stroke={palette.lesson} strokeWidth={7} strokeLinejoin="round" />
								<line x1={cx - amplitude - 90} y1={stripTop + 10} x2={cx - amplitude - 90} y2={stripBottom - 40} stroke={palette.ink} strokeWidth={6} />
								<path d={arrowHead(cx - amplitude - 90, stripBottom - 10, Math.PI / 2, 28)} fill={palette.ink} />
								{label(cx - amplitude - 120, (stripTop + stripBottom) / 2, 't', 'end')}
								<line x1={bx} y1={floor} x2={bx} y2={stripTop} stroke={palette.lesson} strokeWidth={3} strokeDasharray="6 8" />
							</g>
						)}
					</Part>
				) : null}
				<line x1={wall - 40} y1={floor} x2={right} y2={floor} stroke={palette.ink} strokeWidth={6} />
				<rect x={wall - 40} y={by - 100} width={40} height={floor - by + 100} fill={palette.axis} />
				<line x1={cx} y1={floor} x2={cx} y2={floor + 26} stroke={palette.ink} strokeWidth={5} />
				<polyline points={spring} fill="none" stroke={palette.ink} strokeWidth={6} strokeLinejoin="round" />
				<Part id="marks">
					{(look) => (
						<g opacity={look.opacity}>
							{visual.marks.map((mark) => (
								<g key={mark.label}>
									<line x1={cx + mark.at * amplitude} y1={floor} x2={cx + mark.at * amplitude} y2={floor + 26} stroke={palette.ink} strokeWidth={5} />
									{label(cx + mark.at * amplitude, floor + 82, mark.label)}
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="body">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={bx - 60} y={by - 60 * look.scale} width={120} height={120 * look.scale} rx={12} fill={palette.lesson} stroke={palette.ink} strokeWidth={5} />
							<text x={bx} y={by + fontSize * 0.33} fill={palette.onLesson} fontSize={fontSize * 0.85} fontWeight={800} textAnchor="middle">
								m
							</text>
						</g>
					)}
				</Part>
				<Part id="velocity">{(look) => <g opacity={look.opacity}>{visual.velocity ? arrow([bx, by - 100], [Math.sign(state.v), 0], 230 * Math.abs(state.v), palette.ink, 'v') : null}</g>}</Part>
				<Part id="acceleration">{(look) => <g opacity={look.opacity}>{visual.acceleration ? arrow([bx, by - 165], [-Math.sign(state.x), 0], 210 * Math.abs(state.x), palette.lesson, 'a') : null}</g>}</Part>
				{energyBars}
			</g>
		</svg>
	);
};
