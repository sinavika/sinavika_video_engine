import React, {useMemo} from 'react';
import {smooth} from '../../../Animations/Motion';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {withAlpha} from '../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {H, W} from '../VisualWorld';

type Dynamics = Extract<CourseVisual, {kind: 'dynamics'}>;

const number = (value: number, digits = 1) => {
	const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
	return (Object.is(rounded, -0) ? 0 : rounded).toLocaleString('tr-TR', {maximumFractionDigits: digits});
};

// ---------------------------------------------------------------- dynamics

/** `static`: at rest, held by static friction (fs ≤ μs·N); `kinetic`: sliding, fk = μk·N against the motion. */
type DynamicsSample = {t: number; x: number; v: number; a: number; friction: number; state: 'static' | 'kinetic'};

/**
 * Newton's second law along the ground or the incline (positive: right / up
 * the slope). The weight's component along the incline and the applied
 * forces make the driving force. A body at rest stays at rest while the
 * driving force is not more than the largest static friction μs·N (the
 * friction is then just what holds it); once it slides, kinetic friction
 * μk·N acts against the motion and a = ΣF / m. A sliding body that comes to
 * a stop is held again by static friction if μs·N can hold it, otherwise it
 * slides back. Integrated in small steps.
 */
export const simulateDynamics = (visual: Pick<Dynamics, 'mass' | 'incline' | 'friction' | 'staticFriction' | 'forces' | 'initialVelocity' | 'time' | 'g'>, steps = 600) => {
	const angle = (visual.incline * Math.PI) / 180;
	const weight = visual.mass * visual.g;
	const normal = weight * Math.cos(angle);
	const applied = visual.forces.reduce((sum, force) => sum + (force.direction === 'right' || force.direction === 'upSlope' ? force.magnitude : -force.magnitude), 0);
	const driving = applied - weight * Math.sin(angle);
	const kineticFriction = visual.friction * normal;
	const staticLimit = (visual.staticFriction ?? visual.friction) * normal;
	const dt = visual.time / steps;
	const samples: DynamicsSample[] = [];
	let [x, v] = [0, visual.initialVelocity];
	for (let step = 0; step <= steps; step++) {
		const resting = Math.abs(v) < 1e-9;
		const held = resting && Math.abs(driving) <= staticLimit;
		// At rest and held: friction cancels the driving force. Starting to slide or sliding: kinetic friction.
		const friction = held ? -driving : resting ? -Math.sign(driving) * kineticFriction : -Math.sign(v) * kineticFriction;
		const a = (driving + friction) / visual.mass;
		samples.push({t: step * dt, x, v, a, friction, state: held ? 'static' : 'kinetic'});
		const next = v + a * dt;
		// Kinetic friction can stop a body but never push it back: where the velocity would change sign it stops.
		const stops = !resting && Math.sign(next) !== Math.sign(v);
		const vNext = stops || Math.abs(next) < 1e-9 ? 0 : next;
		x += ((v + vNext) / 2) * dt;
		v = vNext;
	}
	return {samples, normal, weight, driving, staticLimit, kineticFriction};
};

const DYNAMICS_STAGES = ['Kuvvetler', 'Net kuvvet ve ivme', 'Hareket'] as const;

/**
 * Force → acceleration → motion in one scene. First the forces on the body
 * (weight, normal force perpendicular to the surface, friction, the applied
 * forces), drawn to scale; then the net force and a = F/m written out; then
 * the motion: the body moves as computed, its velocity arrow grows with its
 * speed, and the graphs below are drawn in step with it.
 */
export const DynamicsVisual: React.FC<VisualBoxProps & {visual: Dynamics}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {stage, progress} = useStageClock(DYNAMICS_STAGES.length, {delaySeconds, secondsPerStage: 4});
	const {samples, normal, weight, driving, staticLimit, kineticFriction} = useMemo(() => simulateDynamics(visual), [visual]);
	const slides = samples.some((sample) => sample.state === 'kinetic');
	const tilt = (visual.incline * Math.PI) / 180;
	const playing = stage === 2 ? progress : stage > 2 ? 1 : 0;
	const index = Math.min(samples.length - 1, Math.round(playing * (samples.length - 1)));
	const now = samples[index];
	const graphs = visual.graphs;
	// Flat ground: the track across the middle, the graphs in a row under it. An incline: the slope on the
	// left, rising to the right, and the graphs stacked on the right.
	const inclined = visual.incline > 0;
	const trackStart = inclined ? ([60, H - 40] as const) : ([60, graphs.length ? 300 : 420] as const);
	const trackLength = inclined ? Math.min(560 / Math.cos(tilt), (H - 200) / Math.sin(tilt)) : 880;
	const graphBoxes = graphs.map((_, graphIndex) =>
		inclined
			? {x: 650, y: 150 + graphIndex * ((H - 160) / graphs.length), width: 340, height: (H - 160) / graphs.length - 14}
			: {x: 20 + graphIndex * ((W - 20) / graphs.length), y: 432, width: (W - 20) / graphs.length - 20, height: H - 442},
	);

	// The body's x maps onto the track.
	const xs = samples.map((sample) => sample.x);
	const [minX, maxX] = [Math.min(0, ...xs), Math.max(0, ...xs)];
	const span = Math.max(1e-6, maxX - minX);
	const along = [Math.cos(tilt), -Math.sin(tilt)] as const;
	const up = [-Math.sin(tilt), -Math.cos(tilt)] as const;
	// The body starts far enough in for the labels of the forces behind it, and stops short of the end it moves to:
	// its velocity arrow and label (160 px and a label) run ahead of it there and stayed off the frame.
	const forward = samples[samples.length - 1].v >= 0;
	const [lowPad, highPad] = forward ? [150, 330] : [330, 150];
	const position = (x: number) => lowPad + ((x - minX) / span) * (trackLength - lowPad - highPad);
	const body = 70;
	const at = (distance: number, lift: number) => [trackStart[0] + along[0] * distance + up[0] * lift, trackStart[1] + along[1] * distance + up[1] * lift] as const;
	const centre = at(position(now.x), body / 2);

	// Forces to scale: the largest force gets 90 px.
	const applied = visual.forces.map((force) => ({label: force.label, magnitude: force.magnitude, sign: force.direction === 'right' || force.direction === 'upSlope' ? 1 : -1}));
	const friction = stage >= 2 ? now.friction : samples[0].friction;
	const largest = Math.max(weight, normal, Math.abs(friction), ...applied.map((force) => force.magnitude), 1e-6);
	const scale = 90 / largest;
	const net = driving + friction;
	const acceleration = stage >= 2 ? now.a : net / visual.mass;
	const forcesShow = stage === 0 ? smooth(progress * 2) : 1;
	const netShow = stage >= 1 ? (stage === 1 ? smooth(progress * 2) : 1) : 0;
	const vMax = Math.max(1e-6, ...samples.map((sample) => Math.abs(sample.v)));

	const arrows: {label: string; dx: number; dy: number; color: string}[] = [
		{label: `G = ${number(weight)} N`, dx: 0, dy: weight * scale, color: palette.ink},
		{label: `N = ${number(normal)} N`, dx: up[0] * normal * scale, dy: up[1] * normal * scale, color: palette.brand},
		...applied.map((force) => ({label: `${force.label} = ${number(force.magnitude)} N`, dx: along[0] * force.sign * force.magnitude * scale, dy: along[1] * force.sign * force.magnitude * scale, color: palette.lesson})),
	];
	const frictionState = (stage >= 2 ? now : samples[0]).state;
	if (Math.abs(friction) > 1e-6) arrows.push({label: `${frictionState === 'static' ? 'fs' : 'fk'} = ${number(Math.abs(friction))} N`, dx: along[0] * friction * scale, dy: along[1] * friction * scale, color: '#E4572E'});

	return (
		<svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<StageChips names={DYNAMICS_STAGES} stage={stage} progress={progress} />
			{/* the surface */}
			<line x1={trackStart[0] - 40 * along[0]} y1={trackStart[1] - 40 * along[1]} x2={trackStart[0] + along[0] * trackLength} y2={trackStart[1] + along[1] * trackLength} stroke={palette.axis} strokeWidth={6} />
			{visual.incline > 0 ? <path d={`M${trackStart[0]} ${trackStart[1]} L${trackStart[0] + along[0] * trackLength} ${trackStart[1]} L${trackStart[0] + along[0] * trackLength} ${trackStart[1] + along[1] * trackLength} Z`} fill={withAlpha(palette.ink, 0.05)} /> : null}
			{visual.incline > 0 ? <text x={trackStart[0] + 90} y={trackStart[1] - 10} fontSize={24} fontWeight={800} fill={palette.muted}>{`${number(visual.incline, 0)}°`}</text> : null}
			<g transform={`rotate(${-visual.incline} ${centre[0]} ${centre[1]})`}>
				<rect x={centre[0] - body / 2} y={centre[1] - body / 2} width={body} height={body} rx={8} fill={withAlpha(palette.lesson, 0.18)} stroke={palette.ink} strokeWidth={4} />
				<text x={centre[0]} y={centre[1] + 9} textAnchor="middle" fontSize={24} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} fill={palette.ink}>{`${number(visual.mass)} kg`}</text>
			</g>
			<g opacity={forcesShow * (stage === 2 ? 0.45 : 1)}>
				{arrows.map((arrow) => (
					// While it moves, the forces stay as faint arrows without labels, so the motion's own arrows can be read.
					<VectorArrow key={arrow.label} from={centre} dx={arrow.dx * forcesShow} dy={arrow.dy * forcesShow} color={arrow.color} label={stage === 2 ? '' : arrow.label} />
				))}
			</g>
			{netShow > 0 && Math.abs(net) > 1e-6 ? <VectorArrow from={at(position(now.x), -48)} dx={along[0] * net * scale * netShow} dy={along[1] * net * scale * netShow} color={palette.lesson} label={`a = ${number(acceleration, 2)} m/s²`} thick /> : null}
			{stage === 2 && Math.abs(now.v) > 1e-3 ? <VectorArrow from={at(position(now.x), -96)} dx={along[0] * Math.sign(now.v) * 160 * (Math.abs(now.v) / vMax)} dy={along[1] * Math.sign(now.v) * 160 * (Math.abs(now.v) / vMax)} color={palette.brand} label={`v = ${number(now.v)} m/s`} /> : null}
			{netShow > 0 ? (
				<g opacity={netShow}>
					{/* First whether it moves at all (static friction), then the net force and the acceleration. */}
					{staticLimit > 0 || kineticFriction > 0 ? (
						<text x={W / 2} y={92} textAnchor="middle" fontSize={24} fontWeight={800} fill={palette.muted}>
							{slides
								? `fs,max = μs·N = ${number(staticLimit)} N < ${number(Math.abs(driving))} N → kayar;  fk = μk·N = ${number(kineticFriction)} N`
								: `${number(Math.abs(driving))} N ≤ fs,max = μs·N = ${number(staticLimit)} N → kıpırdamaz (fs = ${number(Math.abs(driving))} N)`}
						</text>
					) : null}
					<text x={W / 2} y={126} textAnchor="middle" fontSize={28} fontWeight={800}>
						<tspan fill={palette.ink}>{`ΣF = ${number(net)} N`}</tspan>
						<tspan fill={palette.lesson} dx={28}>{`a = ΣF / m = ${number(net)} / ${number(visual.mass)} = ${number(net / visual.mass, 2)} m/s²`}</tspan>
					</text>
				</g>
			) : null}
			{graphs.map((kind, graphIndex) => (
				<MotionGraph key={kind} kind={kind} samples={samples} upTo={index} {...graphBoxes[graphIndex]} show={stage >= 2 ? 1 : 0.35} />
			))}
		</svg>
	);
};

const VectorArrow: React.FC<{from: readonly [number, number]; dx: number; dy: number; color: string; label: string; thick?: boolean}> = ({from, dx, dy, color, label, thick = false}) => {
	const length = Math.hypot(dx, dy);
	if (length < 2) return null;
	const [ux, uy] = [dx / length, dy / length];
	const head = thick ? 22 : 18;
	const tip = [from[0] + dx, from[1] + dy];
	const left = [tip[0] - ux * head - uy * head * 0.6, tip[1] - uy * head + ux * head * 0.6];
	const right = [tip[0] - ux * head + uy * head * 0.6, tip[1] - uy * head - ux * head * 0.6];
	return (
		<g>
			<line x1={from[0]} y1={from[1]} x2={tip[0] - ux * head * 0.7} y2={tip[1] - uy * head * 0.7} stroke={color} strokeWidth={thick ? 9 : 6} strokeLinecap="round" />
			<path d={`M${tip[0]} ${tip[1]} L${left[0]} ${left[1]} L${right[0]} ${right[1]} Z`} fill={color} />
			<text x={tip[0] + ux * 16 + (Math.abs(uy) > 0.7 ? 12 : 0)} y={tip[1] + uy * 16 + (uy > 0.3 ? 18 : uy < -0.3 ? -6 : 8)} textAnchor={Math.abs(ux) < 0.3 ? 'start' : ux > 0 ? 'start' : 'end'} fontSize={22} fontWeight={800} fill={color} paintOrder="stroke" stroke="#FFFFFF" strokeWidth={5}>
				{label}
			</text>
		</g>
	);
};

const GRAPH_META = {
	v: {label: 'v (m/s)', value: (sample: DynamicsSample) => sample.v},
	x: {label: 'x (m)', value: (sample: DynamicsSample) => sample.x},
	a: {label: 'a (m/s²)', value: (sample: DynamicsSample) => sample.a},
} as const;

/** One graph against time, drawn up to the present moment of the motion, with a dot at now. */
const MotionGraph: React.FC<{kind: 'v' | 'x' | 'a'; samples: DynamicsSample[]; upTo: number; x: number; y: number; width: number; height: number; show: number}> = ({kind, samples, upTo, x, y, width, height, show}) => {
	const palette = useVisualPalette();
	const meta = GRAPH_META[kind];
	const values = samples.map(meta.value);
	const [low, high] = [Math.min(0, ...values), Math.max(0, ...values)];
	const range = Math.max(1e-6, high - low);
	const tMax = samples[samples.length - 1].t;
	const px = (t: number) => x + 40 + (t / tMax) * (width - 50);
	const py = (value: number) => y + height - 30 - ((value - low) / range) * (height - 50);
	const drawn = samples.slice(0, upTo + 1).map((sample, index) => `${index === 0 ? 'M' : 'L'}${px(sample.t).toFixed(1)} ${py(meta.value(sample)).toFixed(1)}`).join(' ');
	const now = samples[upTo];
	return (
		<g opacity={show}>
			<rect x={x} y={y} width={width} height={height} rx={16} fill={palette.surface} stroke={palette.border} strokeWidth={2} />
			<line x1={px(0)} x2={px(tMax)} y1={py(0)} y2={py(0)} stroke={palette.axis} strokeWidth={3} />
			<line x1={px(0)} x2={px(0)} y1={y + 16} y2={y + height - 26} stroke={palette.axis} strokeWidth={3} />
			<text x={px(0) + 8} y={y + 32} fontSize={22} fontWeight={800} fill={palette.ink}>{meta.label}</text>
			<text x={px(tMax)} y={py(0) + 26} textAnchor="end" fontSize={20} fill={palette.muted}>t (s)</text>
			<path d={drawn} fill="none" stroke={palette.lesson} strokeWidth={5} strokeLinejoin="round" />
			<circle cx={px(now.t)} cy={py(meta.value(now))} r={8} fill={palette.brand} />
		</g>
	);
};

const StageChips: React.FC<{names: readonly string[]; stage: number; progress: number}> = ({names, stage, progress}) => {
	const palette = useVisualPalette();
	const chip = (W - 12 * (names.length - 1)) / names.length;
	return (
		<g fontFamily={palette.fontDisplay}>
			{names.map((name, index) => (
				<g key={name}>
					<rect x={index * (chip + 12)} y={8} width={chip} height={44} rx={22} fill={index === stage ? palette.lesson : index < stage ? withAlpha(palette.lesson, 0.22) : withAlpha(palette.ink, 0.07)} />
					{index === stage ? <rect x={index * (chip + 12)} y={46} width={chip * progress} height={6} rx={3} fill={withAlpha(palette.onLesson, 0.7)} /> : null}
					<text x={index * (chip + 12) + chip / 2} y={37} textAnchor="middle" fontSize={22} fontWeight={800} fill={index === stage ? palette.onLesson : palette.ink}>{`${index + 1}. ${name}`}</text>
				</g>
			))}
		</g>
	);
};
