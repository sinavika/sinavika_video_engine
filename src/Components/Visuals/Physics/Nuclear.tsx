import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Nuclear = Extract<CourseVisual, {kind: 'nuclear'}>;

/** The stage (CourseVisual keeps this ratio). */
export const NUCLEAR_STAGE = {width: 1600, height: 900};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Nucleons packed in a disc (a sunflower spiral, so any count looks like a round nucleus); every `protonEvery`-th
 * one is a proton, the rest neutrons, as heavy nuclei have more neutrons than protons.
 */
export const nucleonLayout = (count: number, ball: number, protonEvery = 2): {x: number; y: number; proton: boolean}[] =>
	Array.from({length: count}, (_, index) => {
		const radius = ball * 1.05 * Math.sqrt(index + 0.5);
		const angle = index * GOLDEN_ANGLE;
		return {x: radius * Math.cos(angle), y: radius * Math.sin(angle), proton: index % protonEvery === 0};
	});

/** How many nuclei split in each generation of a chain reaction: k-fold growth, or one per generation when control rods take the extra neutrons. */
export const chainFissions = (generations: number, neutrons: number, controlled: boolean): number[] =>
	Array.from({length: generations}, (_, generation) => (controlled ? 1 : neutrons ** generation));

const ease = (value: number) => smoothStep(clamp01(value));

/**
 * Nuclear reactions. `fission`: a slow neutron flies into a heavy nucleus, which trembles, stretches and splits into
 * two fragments, throwing out 2–3 neutrons and energy (parts neutron, nucleus, fragments, neutrons, energy); the split
 * waits for the beat that focuses `fragments`, so it happens when the narration says so. `chain`: those neutrons split
 * further nuclei, generation by generation, and the count grows k-fold; `controlled` puts control rods between the
 * generations that absorb all but one neutron, as in a reactor (parts g1–g3, rods, count). `fusion`: two light nuclei
 * close in and merge (on the beat that focuses `product`) into a heavier one, a neutron and energy (parts reactants,
 * product, neutron, energy). `period` sets the pace; a `run` beat starts it.
 */
export const NuclearVisual: React.FC<VisualBoxProps & {visual: Nuclear}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / NUCLEAR_STAGE.width, height / NUCLEAR_STAGE.height);
	const ox = (width - NUCLEAR_STAGE.width * k) / 2;
	const oy = (height - NUCLEAR_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 0.8;
	const splitBeat = useBeatStartFor('fragments', 'focus');
	const mergeBeat = useBeatStartFor('product', 'focus');
	const time = visual.motion ? Math.max(0, seconds - runStart) : visual.period * 4;
	const fontSize = Math.max(64, 28 / k);
	const label = (x: number, y: number, value: string, size = fontSize, anchor: 'start' | 'middle' | 'end' = 'middle') => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={10} paintOrder="stroke">
			{value}
		</text>
	);
	const nucleus = (count: number, ball: number, protonEvery: number, cx: number, cy: number, scaleX = 1, scaleY = 1) => (
		<g transform={`translate(${cx} ${cy}) scale(${scaleX} ${scaleY})`}>
			{nucleonLayout(count, ball, protonEvery).map((nucleon, index) => (
				<circle key={index} cx={nucleon.x} cy={nucleon.y} r={ball} fill={nucleon.proton ? palette.lesson : palette.surface} stroke={palette.ink} strokeWidth={4} />
			))}
		</g>
	);
	const neutron = (x: number, y: number, r = 22, key?: string | number) => (
		<g key={key}>
			<circle cx={x} cy={y} r={r} fill={palette.surface} stroke={palette.ink} strokeWidth={5} />
			{label(x, y - r - 34, 'n', fontSize * 0.75)}
		</g>
	);
	const flash = (x: number, y: number, strength: number, inner = 90) =>
		strength > 0 ? (
			<g opacity={strength}>
				{Array.from({length: 12}, (_, ray) => {
					const angle = (ray / 12) * Math.PI * 2;
					const outer = inner + 140 * (1 - strength * 0.4);
					return <line key={ray} x1={x + inner * Math.cos(angle)} y1={y + inner * Math.sin(angle)} x2={x + outer * Math.cos(angle)} y2={y + outer * Math.sin(angle)} stroke={palette.brand} strokeWidth={10} strokeLinecap="round" />;
				})}
			</g>
		) : null;
	const svg = (children: React.ReactNode) => (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{children}
			</g>
		</svg>
	);

	if (visual.mode === 'fusion') {
		const merge = Math.max(visual.period * 0.6, (mergeBeat ?? runStart + visual.period * 0.6) - runStart);
		const close = ease(time / merge);
		const cy = 470;
		const [lx, rx] = [260 + (690 - 260) * close, 1340 - (1340 - 910) * close];
		const merged = time >= merge;
		const out = ease((time - merge) / (visual.period * 0.6));
		const ball = 40;
		return svg(
			<>
				<Part id="reactants">
					{(look) =>
						merged ? null : (
							<g opacity={look.opacity}>
								{nucleus(visual.fusion.left.nucleons, ball, 2, lx, cy)}
								{nucleus(visual.fusion.right.nucleons, ball, 3, rx, cy)}
								{label(lx, cy + 150, visual.fusion.left.label)}
								{label(rx, cy + 150, visual.fusion.right.label)}
							</g>
						)
					}
				</Part>
				<Part id="energy">{(look) => <g opacity={look.opacity}>{merged ? flash(800, cy, 1 - out * 0.7, 130) : null}{merged ? label(800, cy - 300, visual.energy) : null}</g>}</Part>
				<Part id="product">
					{(look) =>
						merged ? (
							<g opacity={look.opacity}>
								{nucleus(visual.fusion.product.nucleons, ball, 2, 800 - 300 * out, cy)}
								{label(800 - 300 * out, cy + 160, visual.fusion.product.label)}
							</g>
						) : null
					}
				</Part>
				<Part id="neutron">{(look) => <g opacity={look.opacity}>{merged ? neutron(800 + 560 * out, cy - 200 * out, 34) : null}</g>}</Part>
			</>,
		);
	}

	if (visual.mode === 'chain') {
		const counts = chainFissions(3, visual.neutrons, visual.controlled);
		const columns = [240, 760, 1280];
		const radius = [72, 54, 36];
		const rows = counts.map((count) => Array.from({length: count}, (_, index) => 430 + (index - (count - 1) / 2) * Math.min(260, 760 / Math.max(1, count))));
		const generationAt = (generation: number) => clamp01(time / visual.period - generation);
		const split = counts.map((_, generation) => generationAt(generation) > 0.35);
		const done = counts.reduce((sum, count, generation) => sum + (split[generation] ? count : 0), 0);
		return svg(
			<>
				{visual.controlled ? (
					<Part id="rods">
						{(look) => (
							<g opacity={look.opacity}>
								{[500, 1020].map((x) => (
									<rect key={x} x={x - 16} y={90} width={32} height={700} rx={12} fill={palette.axis} />
								))}
								{label(760, 40, visual.rodLabel, fontSize * 0.8)}
							</g>
						)}
					</Part>
				) : null}
				{counts.map((_, generation) => (
					<Part key={generation} id={`g${generation + 1}`}>
						{(look) => (
							<g opacity={look.opacity}>
								{rows[generation].map((y, index) => {
									const x = columns[generation];
									const r = radius[generation];
									const progress = generationAt(generation);
									const apart = ease((progress - 0.35) / 0.5) * r * 0.9;
									// The neutrons this nucleus sends on: one to each nucleus of the next generation it feeds, or one on
									// and the rest into the rods.
									const next = generation + 1 < counts.length ? rows[generation + 1] : [];
									const targets = visual.controlled ? next.slice(0, 1) : next.slice(index * visual.neutrons, (index + 1) * visual.neutrons);
									const travel = ease((progress - 0.35) / 0.6);
									const absorbed = visual.controlled && next.length ? visual.neutrons - 1 : 0;
									const reach = (ty: number) => [x + (columns[generation + 1] - radius[generation + 1] - x) * travel, y + (ty - y) * travel];
									return (
										<g key={index}>
											{split[generation] ? (
												<>
													<circle cx={x - apart} cy={y - apart * 0.4} r={r * 0.68} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
													<circle cx={x + apart} cy={y + apart * 0.4} r={r * 0.68} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
													{generation === 0 ? flash(x, y, Math.max(0, 1 - travel * 1.4), r + 20) : null}
													{targets.map((ty, target) => {
														const [nx, ny] = reach(ty);
														return (
															<g key={target}>
																<line x1={x} y1={y} x2={nx} y2={ny} stroke={palette.ink} strokeWidth={5} />
																<circle cx={nx} cy={ny} r={12} fill={palette.surface} stroke={palette.ink} strokeWidth={4} />
															</g>
														);
													})}
													{Array.from({length: absorbed}, (_, extra) => {
														const rod = generation === 0 ? 500 : 1020;
														const [ex, ey] = [x + (rod - x) * travel, y + (extra === 0 ? -1 : 1) * 170 * travel];
														return (
															<g key={`a${extra}`}>
																<line x1={x} y1={y} x2={ex} y2={ey} stroke={palette.axis} strokeWidth={5} strokeDasharray="12 10" />
																<circle cx={ex} cy={ey} r={12} fill={palette.surface} stroke={palette.axis} strokeWidth={4} />
															</g>
														);
													})}
												</>
											) : (
												<circle cx={x} cy={y} r={r} fill={palette.lesson} stroke={palette.ink} strokeWidth={5} />
											)}
										</g>
									);
								})}
								{generation === 0 && !split[0] ? neutron(columns[0] - 190 + 100 * ease(generationAt(0) / 0.35), 430, 16) : null}
							</g>
						)}
					</Part>
				))}
				<Part id="count">{(look) => <g opacity={look.opacity}>{label(760, 862, `${visual.countLabel}: ${done}`, fontSize * 0.9)}</g>}</Part>
			</>,
		);
	}

	// Fission: the neutron arrives, the nucleus trembles until the split beat, then stretches and splits.
	const arrival = visual.period * 0.5;
	const splitAt = Math.max(arrival + 0.6, (splitBeat ?? runStart + arrival + 0.6) - runStart);
	const arrive = ease(time / arrival);
	const stretch = ease((time - (splitAt - 0.6)) / 0.6);
	const tremble = time > arrival && time < splitAt ? 0.05 * Math.sin(time * 40) : 0;
	const out = ease((time - splitAt) / (visual.period * 0.6));
	const split = time >= splitAt;
	const [cx, cy] = [620, 450];
	const ball = 22;
	const neutronAngles = Array.from({length: visual.neutrons}, (_, index) => (visual.neutrons === 1 ? 0 : -0.3 + (0.6 * index) / (visual.neutrons - 1)));
	return svg(
		<>
			<Part id="neutron">{(look) => <g opacity={look.opacity}>{time < arrival ? neutron(80 + (cx - 200 - 80) * arrive, cy) : null}</g>}</Part>
			<Part id="nucleus">
				{(look) =>
					split ? null : (
						<g opacity={look.opacity}>
							{nucleus(36, ball, 3, cx, cy, 1 + tremble + 0.4 * stretch, 1 - tremble - 0.18 * stretch)}
							{label(cx, cy + 200, visual.target)}
						</g>
					)
				}
			</Part>
			<Part id="energy">{(look) => <g opacity={look.opacity}>{split ? flash(cx, cy, 1 - out * 0.7) : null}{split ? label(cx, cy - 290, visual.energy) : null}</g>}</Part>
			<Part id="fragments">
				{(look) =>
					split ? (
						<g opacity={look.opacity}>
							{nucleus(20, ball, 3, cx + 380 * out, cy - 250 * out)}
							{nucleus(16, ball, 3, cx + 380 * out, cy + 250 * out)}
							{label(cx + 380 * out + 140, cy - 250 * out, visual.products[0], fontSize, 'start')}
							{label(cx + 380 * out + 125, cy + 250 * out, visual.products[1], fontSize, 'start')}
						</g>
					) : null
				}
			</Part>
			<Part id="neutrons">
				{(look) => <g opacity={look.opacity}>{split ? neutronAngles.map((angle, index) => neutron(cx + 860 * out * Math.cos(angle), cy + 860 * out * Math.sin(angle) * 0.8, 22, index)) : null}</g>}
			</Part>
		</>,
	);
};
