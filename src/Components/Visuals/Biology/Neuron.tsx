import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Neuron = Extract<CourseVisual, {kind: 'neuron'}>;

/** The stage (CourseVisual keeps this ratio). */
export const NEURON_STAGE = {width: 1600, height: 820};

const ease = (value: number) => smoothStep(clamp01(value));

/** Membrane potential (mV) of a patch of axon, `phase` action-potential lengths after the impulse reached it. */
export const actionPotential = (phase: number): number => {
	if (phase <= 0) return -70;
	if (phase < 0.15) return -70 + 100 * ease(phase / 0.15); // depolarisation: Na⁺ rushes in
	if (phase < 0.4) return 30 - 110 * ease((phase - 0.15) / 0.25); // repolarisation: K⁺ leaves, overshooting
	if (phase < 0.75) return -80 + 10 * ease((phase - 0.4) / 0.35); // hyperpolarisation, back to rest
	return -70;
};

/**
 * The nerve impulse. `impulse`: a stretch of axon with Na⁺ outside and K⁺ inside; the impulse runs along it, Na⁺
 * flows in at its front (the inside turns positive), K⁺ flows out behind it, and a probe's graph draws the membrane
 * potential: rest −70 mV, threshold, depolarisation to +30, repolarisation, hyperpolarisation (parts axon, ions,
 * charges, probe, graph, threshold, run). `myelin`: an unmyelinated and a myelinated axon race; the impulse creeps
 * along the first and jumps node to node along the second (parts plain, myelinated, run). `synapse`: the impulse
 * reaches the axon terminal, vesicles fuse with the membrane (exocytosis), the neurotransmitter crosses the cleft and
 * binds the receptors, the next neuron fires, and enzymes break the transmitter down (parts terminal, vesicles,
 * transmitters, receptors, post, enzyme, run; each step waits for the beat that focuses its part).
 */
export const NeuronVisual: React.FC<VisualBoxProps & {visual: Neuron}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / NEURON_STAGE.width, height / NEURON_STAGE.height);
	const ox = (width - NEURON_STAGE.width * k) / 2;
	const oy = (height - NEURON_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 0.8;
	const releaseBeat = useBeatStartFor('vesicles', 'focus');
	const bindBeat = useBeatStartFor('receptors', 'focus');
	const enzymeBeat = useBeatStartFor('enzyme', 'focus');
	const time = visual.motion ? Math.max(0, seconds - runStart) : 100;
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, size = fontSize * 0.8, anchor: 'start' | 'middle' | 'end' = 'middle', weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const svg = (children: React.ReactNode, shift = 0) => (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k}) translate(0 ${shift})`} opacity={appear}>
				{children}
			</g>
		</svg>
	);
	// Na⁺ in the lesson colour, K⁺ in the brand orange (a second series of points).
	const ion = (x: number, y: number, kind: 'na' | 'k', key: string | number) => <circle key={key} cx={x} cy={y} r={11} fill={kind === 'na' ? palette.lesson : palette.brand} />;

	if (visual.mode === 'myelin') {
		const [left, right] = [140, 1500];
		const spacing = 170;
		const nodes = Array.from({length: Math.floor((right - left) / spacing) + 1}, (_, index) => left + index * spacing);
		// The myelinated axon is three times faster; its impulse sits on one node, then jumps to the next.
		const plainX = Math.min(right, left + ((right - left) / visual.period) * time);
		const jumps = Math.min(nodes.length - 1, Math.floor((time / visual.period) * 3 * (nodes.length - 1)));
		const jumpPhase = ((time / visual.period) * 3 * (nodes.length - 1)) % 1;
		const axon = (y: number) => <rect x={left - 40} y={y - 34} width={right - left + 80} height={68} rx={34} fill={palette.fill} stroke={palette.ink} strokeWidth={4} />;
		return svg(
			<>
				<Part id="plain">
					{(look) => (
						<g opacity={look.opacity}>
							{text(left - 40, 175, visual.plainLabel, fontSize * 0.95, 'start')}
							{axon(270)}
							<rect x={left - 40} y={236} width={Math.max(0, plainX - left + 40)} height={68} rx={34} fill={palette.lesson} opacity={0.45} />
							<circle cx={plainX} cy={270} r={30} fill={palette.brand} opacity={0.9} />
						</g>
					)}
				</Part>
				<Part id="myelinated">
					{(look) => (
						<g opacity={look.opacity}>
							{text(left - 40, 525, visual.myelinLabel, fontSize * 0.95, 'start')}
							{axon(640)}
							{nodes.slice(0, -1).map((x, index) => (
								<rect key={index} x={x + 16} y={592} width={spacing - 32} height={96} rx={40} fill={palette.surface} stroke={palette.lessonDeep} strokeWidth={6} />
							))}
							{nodes.slice(0, jumps + 1).map((x, index) => (
								<circle key={index} cx={x} cy={640} r={14} fill={palette.lesson} />
							))}
							{jumps < nodes.length - 1 ? (
								<path d={`M ${nodes[jumps]} 590 Q ${(nodes[jumps] + nodes[jumps + 1]) / 2} ${520} ${nodes[jumps + 1]} 590`} fill="none" stroke={palette.brand} strokeWidth={6} strokeDasharray="14 10" opacity={jumpPhase} />
							) : null}
							<circle cx={nodes[jumps]} cy={640} r={30} fill={palette.brand} opacity={0.9} />
							{text(nodes[1], 760, visual.nodeLabel, fontSize * 0.75)}
						</g>
					)}
				</Part>
			</>,
			-40,
		);
	}

	if (visual.mode === 'synapse') {
		const period = visual.period;
		const arrive = ease(time / period);
		const release = Math.max(period, (releaseBeat ?? runStart + period) - runStart);
		const bind = Math.max(release + period * 0.8, (bindBeat ?? runStart + release + period) - runStart);
		const breakDown = Math.max(bind + period * 0.6, (enzymeBeat ?? runStart + bind + period) - runStart);
		const fuse = ease((time - release) / (period * 0.6));
		const cross = ease((time - release - period * 0.4) / (bind - release - period * 0.4));
		const bound = ease((time - bind) / (period * 0.4));
		const broken = ease((time - breakDown) / (period * 0.6));
		const receptors = [270, 370, 470, 570, 670];
		const vesicles = [
			{x: 620, y: 300},
			{x: 680, y: 450},
			{x: 620, y: 600},
			{x: 470, y: 380},
			{x: 480, y: 540},
		];
		// Each released vesicle (the three by the membrane) carries five transmitters, each bound for a receptor.
		const transmitters = vesicles.slice(0, 3).flatMap((vesicle, v) => Array.from({length: 5}, (_, index) => ({v, index, from: vesicle, to: receptors[(v * 5 + index) % receptors.length]})));
		return svg(
			<>
				<Part id="terminal">
					{(look) => (
						<g opacity={look.opacity}>
							<path d="M 40 390 L 300 390 C 400 390 420 180 600 180 L 790 180 L 790 720 L 600 720 C 420 720 400 510 300 510 L 40 510 Z" fill={palette.fill} stroke={palette.ink} strokeWidth={5} />
							{/* The impulse arriving down the axon. */}
							{time < release + period ? <circle cx={40 + 560 * arrive} cy={450} r={34} fill={palette.brand} opacity={0.8 * (1 - fuse)} /> : null}
							{text(180, 320, visual.terminalLabel, fontSize * 0.9)}
						</g>
					)}
				</Part>
				<Part id="vesicles">
					{(look) => (
						<g opacity={look.opacity}>
							{vesicles.map((vesicle, index) => {
								const released = index < 3;
								const x = released ? vesicle.x + (790 - 44 - vesicle.x) * fuse : vesicle.x;
								const r = released ? 44 * (1 - 0.7 * clamp01((time - release - period * 0.4) / (period * 0.3))) : 44;
								return (
									<g key={index}>
										<circle cx={x} cy={vesicle.y} r={r} fill={palette.surface} stroke={palette.lessonDeep} strokeWidth={5} />
										{!released || time < release + period * 0.4
											? [0, 1, 2, 3, 4].map((dot) => <circle key={dot} cx={x + 18 * Math.cos(dot * 1.26)} cy={vesicle.y + 18 * Math.sin(dot * 1.26)} r={8} fill={palette.lessonDeep} />)
											: null}
									</g>
								);
							})}
						</g>
					)}
				</Part>
				<Part id="post">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={870} y={150} width={680} height={600} rx={60} fill={palette.fill} stroke={palette.ink} strokeWidth={5} />
							{bound > 0 ? <rect x={870} y={150} width={680} height={600} rx={60} fill={palette.lesson} opacity={0.25 * bound * (1 - broken)} /> : null}
							{text(1210, 230, visual.postLabel, fontSize * 0.9)}
							{bound > 0.5 ? (
								<g opacity={(bound - 0.5) * 2}>
									<line x1={1060} y1={460} x2={1420} y2={460} stroke={palette.brand} strokeWidth={10} strokeLinecap="round" />
									<path d="M 1400 430 L 1450 460 L 1400 490 Z" fill={palette.brand} />
									{text(1240, 540, visual.impulseLabel, fontSize * 0.9)}
								</g>
							) : null}
						</g>
					)}
				</Part>
				<Part id="receptors">
					{(look) => (
						<g opacity={look.opacity}>
							{receptors.map((y) => (
								<path key={y} d={`M 852 ${y - 26} L 852 ${y - 10} L 870 ${y - 10} M 852 ${y + 26} L 852 ${y + 10} L 870 ${y + 10}`} fill="none" stroke={bound > 0.5 ? palette.lesson : palette.ink} strokeWidth={bound > 0.5 ? 9 : 6} strokeLinecap="round" />
							))}
							{text(830, 100, visual.cleftLabel, fontSize * 0.85)}
						</g>
					)}
				</Part>
				<Part id="transmitters">
					{(look) => (
						<g opacity={look.opacity}>
							{time > release + period * 0.4
								? transmitters.map(({v, index, from, to}) => {
										// Out of the vesicle at the membrane, across the cleft, into its receptor; a little scatter on the way.
										const startY = from.y + 14 * Math.sin(index * 1.26);
										const x = 790 + (860 - 790) * cross + 6 * Math.sin(time * 7 + index + v);
										const y = startY + (to - startY + (index - 2) * 4) * cross;
										const fade = 1 - broken;
										return (
											<g key={`${v}-${index}`} opacity={fade}>
												<circle cx={x} cy={y} r={9} fill={palette.lessonDeep} />
											</g>
										);
									})
								: null}
						</g>
					)}
				</Part>
				<Part id="enzyme">
					{(look) =>
						broken > 0 ? (
							<g opacity={look.opacity}>
								{receptors.map((y, index) => (
									<g key={y} opacity={1 - clamp01((broken - 0.7) / 0.3) * 0.6}>
										<circle cx={830 - 20 * broken} cy={y - 8 - 30 * broken} r={8} fill={palette.axis} />
										<circle cx={830 - 30 * broken} cy={y + 8 + 30 * broken} r={8} fill={palette.axis} />
										{index === 0 ? text(1000, 815, visual.enzymeLabel, fontSize * 0.85) : null}
									</g>
								))}
							</g>
						) : null
					}
				</Part>
			</>,
			-40,
		);
	}

	// Impulse along an axon, with the probe's graph below.
	const [left, right] = [100, 1500];
	const [top, bottom] = [150, 330];
	const speed = (right - left) / visual.period;
	// Seconds an action potential lasts at a point: in step with the run, so the flipped stretch is wide enough to see.
	const apLength = visual.period * 0.45;
	const phaseAt = (x: number) => (time - (x - left) / speed) / apLength;
	const probe = 760;
	const graph = {left: 260, right: 1500, top: 450, bottom: 790};
	const vy = (mv: number) => graph.bottom - ((mv + 90) / 130) * (graph.bottom - graph.top);
	const span = visual.period + apLength * 0.6;
	const gx = (seconds: number) => graph.left + ((graph.right - graph.left) * seconds) / span;
	const drawn = Math.min(time, span);
	const curve = Array.from({length: 161}, (_, index) => (drawn * index) / 160)
		.map((at) => `${gx(at)},${vy(actionPotential((at - (probe - left) / speed) / apLength))}`)
		.join(' ');
	const marks = Array.from({length: 12}, (_, index) => left + 210 + index * 100);
	const flowing = (phase: number, from: number, to: number) => clamp01((phase - from) / (to - from));
	return svg(
		<>
			<Part id="axon">
				{(look) => (
					<g opacity={look.opacity}>
						<rect x={left - 40} y={top} width={right - left + 80} height={bottom - top} rx={40} fill={palette.surface} />
						<line x1={left - 40} y1={top} x2={right + 40} y2={top} stroke={palette.ink} strokeWidth={6} />
						<line x1={left - 40} y1={bottom} x2={right + 40} y2={bottom} stroke={palette.ink} strokeWidth={6} />
						{text(left - 30, top - 62, visual.outsideLabel, fontSize * 0.7, 'start', 700)}
						{text(left - 30, (top + bottom) / 2, visual.insideLabel, fontSize * 0.7, 'start', 700)}
					</g>
				)}
			</Part>
			<Part id="charges">
				{(look) => (
					<g opacity={look.opacity}>
						{marks.map((x) => {
							const positiveInside = actionPotential(phaseAt(x)) > 0;
							const sign = (y: number, positive: boolean) => text(x, y, positive ? '+' : '−', fontSize * 0.9, 'middle', 900);
							return (
								<g key={x}>
									{sign(top - 26, !positiveInside)}
									{sign(top + 30, positiveInside)}
									{sign(bottom - 30, positiveInside)}
									{sign(bottom + 26, !positiveInside)}
								</g>
							);
						})}
					</g>
				)}
			</Part>
			<Part id="ions">
				{(look) => (
					<g opacity={look.opacity}>
						{marks.map((x, index) => {
							const phase = phaseAt(x + 50);
							// In through the opened channels, then back where they were: the Na⁺-K⁺ pump restoring the rest state.
							const pumped = flowing(phase, 0.8, 1.3);
							const sodium = flowing(phase, 0, 0.15) - pumped;
							const potassium = flowing(phase, 0.15, 0.4) - pumped;
							// Na⁺ waits outside (top), crosses in at depolarisation; K⁺ waits inside, crosses out at repolarisation.
							return (
								<g key={index}>
									{ion(x + 50, top - 70 + 160 * sodium, 'na', `na${index}`)}
									{ion(x + 50, bottom - 50 + 130 * potassium, 'k', `k${index}`)}
								</g>
							);
						})}
						{ion(1250, top - 115, 'na', 'legend-na')}
						{text(1274, top - 115, 'Na⁺', fontSize * 0.75, 'start')}
						{ion(1410, top - 115, 'k', 'legend-k')}
						{text(1434, top - 115, 'K⁺', fontSize * 0.75, 'start')}
					</g>
				)}
			</Part>
			<Part id="probe">
				{(look) => (
					<g opacity={look.opacity}>
						<line x1={probe} y1={bottom - 10} x2={probe} y2={graph.top - 20} stroke={palette.axis} strokeWidth={4} strokeDasharray="10 8" />
						<circle cx={probe} cy={bottom - 10} r={12} fill={palette.ink} />
					</g>
				)}
			</Part>
			<Part id="graph">
				{(look) => (
					<g opacity={look.opacity}>
						<line x1={graph.left} y1={graph.bottom} x2={graph.right} y2={graph.bottom} stroke={palette.ink} strokeWidth={4} />
						<line x1={graph.left} y1={graph.bottom} x2={graph.left} y2={graph.top - 10} stroke={palette.ink} strokeWidth={4} />
						{[30, -70].map((mv) => (
							<g key={mv}>
								<line x1={graph.left - 10} y1={vy(mv)} x2={graph.left} y2={vy(mv)} stroke={palette.ink} strokeWidth={4} />
								{text(graph.left - 18, vy(mv), `${mv > 0 ? '+' : '−'}${Math.abs(mv)}`, fontSize * 0.75, 'end', 700)}
							</g>
						))}
						{text(graph.left - 18, graph.top - 30, 'mV', fontSize * 0.75, 'end', 700)}
						<polyline points={curve} fill="none" stroke={palette.lesson} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
					</g>
				)}
			</Part>
			<Part id="threshold">
				{(look) => (
					<g opacity={look.opacity}>
						<line x1={graph.left} y1={vy(-55)} x2={graph.right} y2={vy(-55)} stroke={palette.brand} strokeWidth={4} strokeDasharray="14 10" />
						{text(graph.right, vy(-55) - 34, visual.thresholdLabel, fontSize * 0.75, 'end', 700)}
					</g>
				)}
			</Part>
		</>,
	);
};
