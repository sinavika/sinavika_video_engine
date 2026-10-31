import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Kinematics = Extract<CourseVisual, {kind: 'kinematics'}>;
type Body = Kinematics['bodies'][number];

/** The stage: the road on top, one or two graphs under it. */
const KINEMATICS_STAGE = {width: 1600, height: 1100};

/** The road's band on top of the stage, left out without a road. */
const TRACK_BAND = 380;

/** Width / height of the figure: without the road it is a strip of graphs (CourseVisual keeps this ratio). */
export const motionGraphRatio = (visual: Pick<Kinematics, 'track'>) => KINEMATICS_STAGE.width / (visual.track ? KINEMATICS_STAGE.height : KINEMATICS_STAGE.height - TRACK_BAND + 40);

/**
 * Where a body is, how fast it goes and its acceleration at time t: phases of constant acceleration one after
 * another, x = x₀ + v₀t + ½at² and v = v₀ + at within each. A phase with its own `v` starts at that velocity (an
 * idealised sudden change, as in a broken-line x-t graph). After the last phase the body keeps its last state.
 */
export const kinematicsState = (body: {x0: number; v0: number; phases: readonly {duration: number; a: number; v?: number}[]}, t: number) => {
	let x = body.x0;
	let v = body.v0;
	let start = 0;
	for (const phase of body.phases) {
		if (phase.v !== undefined) v = phase.v;
		const end = start + phase.duration;
		if (t <= end) {
			const dt = Math.max(0, t - start);
			return {x: x + v * dt + 0.5 * phase.a * dt * dt, v: v + phase.a * dt, a: phase.a};
		}
		x += v * phase.duration + 0.5 * phase.a * phase.duration * phase.duration;
		v += phase.a * phase.duration;
		start = end;
	}
	return {x, v, a: body.phases[body.phases.length - 1].a};
};

/** The moments the phases change, from 0 to the end. */
const boundaries = (body: Body) => body.phases.reduce<number[]>((times, phase) => [...times, times[times.length - 1] + phase.duration], [0]);

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',').replace(/^-/, '−');

/** Up to 7 tick values: the given ones, unique, rounded. */
const ticks = (values: number[]) => [...new Set(values.map((value) => Math.round(value * 100) / 100))].sort((a, b) => a - b).slice(0, 7);

/** Ticks whose labels would touch the one before them (closer than `gap` on the drawing) are left out. */
const spaced = (values: number[], at: (value: number) => number, gap: number) =>
	values.reduce<number[]>((kept, value) => (kept.length === 0 || Math.abs(at(value) - at(kept[kept.length - 1])) >= gap ? [...kept, value] : kept), []);

/**
 * One or two bodies on a road and their graphs. The bodies run phase by phase (constant velocity or constant
 * acceleration); under the road the v-t, x-t or a-t graphs draw themselves in step with the motion, a cursor marks
 * the moment, and the area under the first body's v-t graph fills as it goes: the displacement, written as it grows.
 * Without motion (a question's figure) the graphs stand complete and the road is left out. Beats point at bodies
 * b1, b2, `run` (starts the motion) and `area`.
 */
export const MotionGraphVisual: React.FC<VisualBoxProps & {visual: Kinematics}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const stageHeight = visual.track ? KINEMATICS_STAGE.height : KINEMATICS_STAGE.height - TRACK_BAND + 40;
	const k = Math.min(width / KINEMATICS_STAGE.width, height / stageHeight);
	const ox = (width - KINEMATICS_STAGE.width * k) / 2;
	const oy = (height - stageHeight * k) / 2;
	const total = Math.max(...visual.bodies.map((body) => body.phases.reduce((sum, phase) => sum + phase.duration, 0)));
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1.2;
	const run = visual.motion ? easeFrom(seconds, runStart, visual.duration) : 1;
	// The clock runs evenly: easing only at its very ends would hide constant velocity.
	const linear = visual.motion ? Math.max(0, Math.min(1, (seconds - runStart) / visual.duration)) : 1;
	const t = total * (run > 0 && run < 1 ? linear : run);
	const shownBodies = visual.bodies.map((_, index) => easeFrom(seconds, useShownAt(`b${index + 1}`) ?? delaySeconds + 0.3 + index * 0.3, 0.5));
	const areaAt = useBeatStartFor('area', 'show');
	const areaIn = visual.area ? (areaAt === undefined ? 1 : easeFrom(seconds, areaAt, 0.5)) : 0;
	const colours = [palette.lesson, palette.brand];
	const fontSize = 52;
	const samples = 80;
	// Even samples plus both sides of every phase change, so a sudden change of velocity draws as a sharp step.
	const sampled = visual.bodies.map((body) => {
		const times = [...Array.from({length: samples + 1}, (_, index) => (total * index) / samples), ...boundaries(body).flatMap((time) => [time - 1e-6, time + 1e-6])].filter((time) => time >= 0 && time <= total).sort((a, b) => a - b);
		return times.map((time) => ({t: time, ...kinematicsState(body, time)}));
	});
	const states = visual.bodies.map((body) => kinematicsState(body, t));
	const range = (key: 'x' | 'v' | 'a') => {
		const values = sampled.flatMap((list) => list.map((sample) => sample[key]));
		const low = Math.min(0, ...values);
		const high = Math.max(0, ...values);
		const pad = (high - low || 1) * 0.16;
		return [low === 0 ? 0 : low - pad, high === 0 ? 0 : high + pad] as const;
	};

	// The road: from the least to the farthest position reached, with the bodies on two lanes.
	const [xLow, xHigh] = (() => {
		const values = sampled.flatMap((list) => list.map((sample) => sample.x));
		const low = Math.min(...values);
		const high = Math.max(...values);
		const pad = (high - low || 1) * 0.06;
		return [low - pad, high + pad];
	})();
	// Room on the right for a fast body's velocity arrow at the far end of the road.
	const roadLeft = 160;
	const roadRight = KINEMATICS_STAGE.width - 300;
	const roadAt = (x: number) => roadLeft + ((x - xLow) / (xHigh - xLow)) * (roadRight - roadLeft);
	const roadY = 250;

	// The graphs: one wide or two side by side, below the road.
	const top = visual.track ? TRACK_BAND + 60 : 100;
	const panelHeight = stageHeight - top - 90;
	const panels = visual.graphs.map((kind, index) => {
		const count = visual.graphs.length;
		const gap = visual.bodies.length > 1 ? 190 : 140;
		const panelWidth = (KINEMATICS_STAGE.width - 220 - gap * (count - 1)) / count;
		const left = 170 + index * (panelWidth + gap);
		return {kind, left, width: panelWidth, top, height: panelHeight};
	});
	const unitOf = {x: 'x (m)', v: 'v (m/s)', a: 'a (m/s²)'};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.track ? (
					<g>
						<line x1={roadLeft - 30} y1={roadY + 46} x2={roadRight + 30} y2={roadY + 46} stroke={palette.ink} strokeWidth={8} />
						{spaced(ticks(visual.bodies.flatMap((body) => boundaries(body).map((time) => kinematicsState(body, time).x))), roadAt, fontSize * 3.2).map((value) => (
							<g key={value}>
								<line x1={roadAt(value)} y1={roadY + 38} x2={roadAt(value)} y2={roadY + 62} stroke={palette.axis} strokeWidth={5} />
								<text x={roadAt(value)} y={roadY + 62 + fontSize} fill={palette.muted} fontSize={fontSize * 0.8} textAnchor="middle">
									{`${format(value)} m`}
								</text>
							</g>
						))}
						<text x={roadLeft - 30} y={fontSize + 6} fill={palette.ink} fontSize={fontSize} fontWeight={800}>
							{`t = ${format(Math.round(t * 10) / 10)} s`}
						</text>
						{visual.bodies.map((body, index) => {
							const state = states[index];
							const x = roadAt(state.x);
							// Two bodies on two lanes, the first above; each car sits on its lane line.
							const lane = roadY + (visual.bodies.length > 1 && index === 0 ? -96 : 0) - 30;
							const arrow = Math.min(220, Math.abs(state.v) * (220 / Math.max(1e-9, ...sampled.flatMap((list) => list.map((sample) => Math.abs(sample.v))))));
							return (
								<Part key={index} id={`b${index + 1}`}>
									{(look) => (
										<g opacity={shownBodies[index] * look.opacity}>
											<rect x={x - 66} y={lane - 30} width={132} height={70} rx={18} fill={colours[index]} stroke={palette.ink} strokeWidth={look.scale > 1 ? 7 : 4} />
											<text x={x} y={lane + 22} fill={palette.surface} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle">
												{body.label}
											</text>
											{arrow > 8 ? (
												<g>
													<line x1={x} y1={lane - 54} x2={x + Math.sign(state.v) * arrow} y2={lane - 54} stroke={colours[index]} strokeWidth={11} strokeLinecap="round" />
													<path d={arrowHead(x + Math.sign(state.v) * (arrow + 18), lane - 54, state.v >= 0 ? 0 : Math.PI, 32)} fill={colours[index]} />
												</g>
											) : null}
										</g>
									)}
								</Part>
							);
						})}
					</g>
				) : null}
				{panels.map((panel) => {
					const [low, high] = range(panel.kind);
					const px = (time: number) => panel.left + (time / total) * panel.width;
					const py = (value: number) => panel.top + panel.height - ((value - low) / (high - low)) * panel.height;
					const zero = py(0);
					const timeTicks = spaced(ticks(visual.bodies.flatMap(boundaries)).filter((time) => time > 0), px, fontSize * 1.6);
					const valueTicks = spaced(ticks(visual.bodies.flatMap((body) => boundaries(body).flatMap((time) => [kinematicsState(body, time)[panel.kind], kinematicsState(body, Math.max(0, time - 1e-6))[panel.kind]]))).filter((value) => Math.abs(value) > 1e-9), py, fontSize * 0.95);
					return (
						<g key={panel.kind}>
							{/* The area under the first body's v-t line up to now: its displacement. */}
							{panel.kind === 'v' && areaIn > 0 ? (
								<Part id="area">
									{(look) => {
										const upTo = sampled[0].filter((sample) => sample.t <= t);
										const points = [...upTo.map((sample) => `${px(sample.t)},${py(sample.v)}`), `${px(t)},${py(states[0].v)}`, `${px(t)},${zero}`, `${px(0)},${zero}`].join(' ');
										const moved = states[0].x - visual.bodies[0].x0;
										return (
											<g opacity={areaIn * look.opacity}>
												<polygon points={points} fill={palette.lesson} fillOpacity={0.22} />
												<text x={panel.left + panel.width + 40} y={panel.top - 34} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="end">
													{`Δx = ${format(moved)} m`}
												</text>
											</g>
										);
									}}
								</Part>
							) : null}
							{timeTicks.map((time) => (
								<g key={`t${time}`}>
									<line x1={px(time)} y1={panel.top} x2={px(time)} y2={panel.top + panel.height} stroke={palette.grid} strokeWidth={3} strokeDasharray="10 8" />
									<text x={px(time)} y={panel.top + panel.height + fontSize * 1.1} fill={palette.muted} fontSize={fontSize * 0.8} textAnchor="middle">
										{format(time)}
									</text>
								</g>
							))}
							{valueTicks.map((value) => (
								<g key={`v${value}`}>
									<line x1={panel.left} y1={py(value)} x2={panel.left + panel.width} y2={py(value)} stroke={palette.grid} strokeWidth={3} strokeDasharray="10 8" />
									<text x={panel.left - 16} y={py(value) + fontSize * 0.3} fill={palette.muted} fontSize={fontSize * 0.8} textAnchor="end">
										{format(value)}
									</text>
								</g>
							))}
							<line x1={panel.left} y1={zero} x2={panel.left + panel.width + 30} y2={zero} stroke={palette.axis} strokeWidth={5} />
							<path d={arrowHead(panel.left + panel.width + 44, zero, 0, 24)} fill={palette.axis} />
							<line x1={panel.left} y1={panel.top + panel.height} x2={panel.left} y2={panel.top - 30} stroke={palette.axis} strokeWidth={5} />
							<path d={arrowHead(panel.left, panel.top - 44, -Math.PI / 2, 24)} fill={palette.axis} />
							<text x={panel.left + 30} y={panel.top - 34} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={700}>
								{unitOf[panel.kind]}
							</text>
							<text x={panel.left + panel.width + 40} y={zero + (zero > panel.top + panel.height - 10 ? -18 : fontSize + 6)} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={700} textAnchor="end">
								t (s)
							</text>
							{visual.bodies.map((body, index) => {
								const upTo = sampled[index].filter((sample) => sample.t <= t);
								// a-t jumps at phase changes: draw it as steps, not slopes.
								const line =
									panel.kind === 'a'
										? body.phases.flatMap((phase, step) => {
												const from = boundaries(body)[step];
												const to = Math.min(t, from + phase.duration);
												return to > from ? [`${px(from)},${py(phase.a)}`, `${px(to)},${py(phase.a)}`] : [];
											})
										: [...upTo.map((sample) => `${px(sample.t)},${py(sample[panel.kind])}`), `${px(t)},${py(states[index][panel.kind])}`];
								return (
									<g key={index} opacity={shownBodies[index]}>
										{line.length > 1 ? <polyline points={line.join(' ')} fill="none" stroke={colours[index]} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" /> : null}
										{visual.motion && run < 1 ? <circle cx={px(t)} cy={py(states[index][panel.kind])} r={13} fill={colours[index]} stroke={palette.surface} strokeWidth={4} /> : null}
										{visual.bodies.length > 1 ? (
											<text x={px(total) + 14} y={py(kinematicsState(body, total)[panel.kind]) + (index === 0 ? -14 : 40)} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
												{body.label}
											</text>
										) : null}
									</g>
								);
							})}
							{visual.motion && run > 0 && run < 1 ? <line x1={px(t)} y1={panel.top - 10} x2={px(t)} y2={panel.top + panel.height} stroke={palette.ink} strokeOpacity={0.35} strokeWidth={4} /> : null}
						</g>
					);
				})}
			</g>
		</svg>
	);
};
