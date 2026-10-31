import React from 'react';
import {clamp01, lerp} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type PhaseDiagram = Extract<CourseVisual, {kind: 'phaseDiagram'}>;
type Phase = 'solid' | 'liquid' | 'vapour' | 'gas';

/** The stage (CourseVisual keeps this ratio). */
export const PHASE_STAGE = {width: 1600, height: 760};

const AREA = {left: 230, right: 1500, top: 70, bottom: 640};
/** The schematic diagram on a 0–1 square: the triple and critical points and where the sublimation curve starts. */
const TRIPLE = {t: 0.32, p: 0.3};
const CRITICAL = {t: 0.8, p: 0.78};
const SUBLIMATION_START = 0.02;

/** The melting curve's lean: water's leans left (ice melts under pressure), most substances' (CO₂) right. */
const slopeOf = (substance: PhaseDiagram['substance']) => (substance === 'water' ? -0.06 : 0.1);

const sublimationP = (t: number) => TRIPLE.p * Math.pow(clamp01((t - SUBLIMATION_START) / (TRIPLE.t - SUBLIMATION_START)), 2.2);
const vaporisationP = (t: number) => TRIPLE.p + (CRITICAL.p - TRIPLE.p) * Math.pow(clamp01((t - TRIPLE.t) / (CRITICAL.t - TRIPLE.t)), 1.6);
const meltingT = (substance: PhaseDiagram['substance'], p: number) => TRIPLE.t + slopeOf(substance) * (p - TRIPLE.p);

/** The phase at a point of the schematic diagram; above the critical temperature a fluid is a gas, below it a vapour. */
export const phaseAt = (substance: PhaseDiagram['substance'], t: number, p: number): Phase => {
	const fluid: Phase = t >= CRITICAL.t ? 'gas' : 'vapour';
	if (p < TRIPLE.p) return t < TRIPLE.t && p > sublimationP(t) ? 'solid' : fluid;
	if (t < meltingT(substance, p)) return 'solid';
	if (t < CRITICAL.t && p >= vaporisationP(t)) return 'liquid';
	return fluid;
};

/** Where a straight path (an isobar at p or an isotherm at t, 0–1) crosses the phase lines, in order along the path. */
export const pathCrossings = (substance: PhaseDiagram['substance'], kind: 'isobar' | 'isotherm', at: number): number[] => {
	const steps = 2000;
	const found: number[] = [];
	let last = kind === 'isobar' ? phaseAt(substance, 0, at) : phaseAt(substance, at, 0);
	for (let index = 1; index <= steps; index++) {
		const s = index / steps;
		const phase = kind === 'isobar' ? phaseAt(substance, s, at) : phaseAt(substance, at, s);
		if (phase !== last && !(phase === 'gas' && last === 'vapour') && !(phase === 'vapour' && last === 'gas')) found.push(s - 0.5 / steps);
		last = phase;
	}
	return found;
};

/**
 * Chemistry: a phase diagram (schematic, not to scale) of `substance`: water, whose melting line leans left, or a
 * substance like CO₂ whose melting line leans right. Solid, liquid, vapour and gas regions, the triple and critical
 * points with their values on the axes, and an optional `path` (isobar or isotherm) along which a point moves on the beat
 * that shows `path`, naming the phase it is in. Parts: axes, regions, curves, triple, critical, path.
 */
export const PhaseDiagramVisual: React.FC<VisualBoxProps & {visual: PhaseDiagram}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / PHASE_STAGE.width, height / PHASE_STAGE.height);
	const ox = (width - PHASE_STAGE.width * k) / 2;
	const oy = (height - PHASE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const pathAt = useBeatStartFor('path', 'show') ?? delaySeconds + 1;
	const labelSize = Math.max(34, 22 / k);
	const x = (t: number) => lerp(AREA.left, AREA.right, t);
	const y = (p: number) => lerp(AREA.bottom, AREA.top, p);
	const names: Record<Phase, string> = {solid: visual.solidLabel, liquid: visual.liquidLabel, vapour: visual.vapourLabel, gas: visual.gasLabel};
	const text = (px: number, py: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = labelSize, weight = 800, key?: string | number) => (
		<text key={key} x={px} y={py} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={6} paintOrder="stroke">
			{value}
		</text>
	);

	const sample = (from: number, to: number, f: (s: number) => [number, number]) => Array.from({length: 81}, (_, index) => f(lerp(from, to, index / 80)));
	const sublimation = sample(SUBLIMATION_START, TRIPLE.t, (t) => [t, sublimationP(t)]);
	const vaporisation = sample(TRIPLE.t, CRITICAL.t, (t) => [t, vaporisationP(t)]);
	const melting = sample(TRIPLE.p, 1, (p) => [meltingT(visual.substance, p), p]);
	const line = (points: [number, number][]) => points.map(([t, p], index) => `${index ? 'L' : 'M'} ${x(t).toFixed(1)} ${y(p).toFixed(1)}`).join(' ');
	const polygon = (points: [number, number][]) => `${line(points)} Z`;
	const solidRegion = polygon([[0, 0], [SUBLIMATION_START, 0], ...sublimation, ...melting, [0, 1]]);
	const liquidRegion = polygon([...melting.slice().reverse(), ...vaporisation, [CRITICAL.t, 1]]);
	const vapourRegion = polygon([[SUBLIMATION_START, 0], ...sublimation, ...vaporisation, [CRITICAL.t, 0]]);
	const gasRegion = polygon([
		[CRITICAL.t, 0],
		[CRITICAL.t, 1],
		[1, 1],
		[1, 0],
	]);
	const meltTop = meltingT(visual.substance, 1);

	const path = visual.path;
	const progress = path ? (visual.motion ? clamp01((seconds - pathAt) / visual.duration) : 1) : 0;
	const reach = (path?.to ?? 1) * progress;
	const marker = path ? (path.kind === 'isobar' ? {t: reach, p: path.at} : {t: path.at, p: reach}) : undefined;
	const crossings = path ? pathCrossings(visual.substance, path.kind, path.at) : [];
	const pointOf = (s: number) => (path?.kind === 'isobar' ? {t: s, p: path.at} : {t: path?.at ?? 0, p: s});

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="regions">
					{(look) => (
						<g opacity={look.opacity}>
							<path d={solidRegion} fill={mixColors(palette.lessonDeep, palette.surface, 0.78)} />
							<path d={liquidRegion} fill={mixColors(palette.lesson, palette.surface, 0.7)} />
							<path d={vapourRegion} fill={mixColors(palette.lesson, palette.surface, 0.9)} />
							<path d={gasRegion} fill={mixColors(palette.lessonDeep, palette.surface, 0.93)} />
							{text(x(0.13), y(0.7), visual.solidLabel)}
							{text(x((meltTop + CRITICAL.t) / 2 + 0.02), y(0.88), visual.liquidLabel)}
							{text(x(0.6), y(0.08), visual.vapourLabel)}
							{text(x(0.9), y(0.45), visual.gasLabel)}
						</g>
					)}
				</Part>
				<Part id="curves">
					{(look) => (
						<g opacity={look.opacity}>
							{[sublimation, vaporisation, melting].map((points, index) => (
								<path key={index} d={line(points)} fill="none" stroke={palette.ink} strokeWidth={6} strokeLinecap="round" />
							))}
							<line x1={x(CRITICAL.t)} y1={y(CRITICAL.p)} x2={x(CRITICAL.t)} y2={y(1)} stroke={palette.axis} strokeWidth={3} strokeDasharray="10 8" />
							<line x1={x(CRITICAL.t)} y1={y(CRITICAL.p)} x2={x(CRITICAL.t)} y2={y(0)} stroke={palette.axis} strokeWidth={3} strokeDasharray="10 8" />
						</g>
					)}
				</Part>
				<Part id="axes">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={AREA.left} y1={AREA.bottom} x2={AREA.right + 20} y2={AREA.bottom} stroke={palette.ink} strokeWidth={5} />
							<line x1={AREA.left} y1={AREA.bottom} x2={AREA.left} y2={AREA.top - 20} stroke={palette.ink} strokeWidth={5} />
							{text((AREA.left + AREA.right) / 2, AREA.bottom + 90, visual.temperatureLabel, 'middle', labelSize * 0.9, 700)}
							{text(AREA.left - 20, AREA.top - 40, visual.pressureLabel, 'start', labelSize * 0.9, 700)}
						</g>
					)}
				</Part>
				{(
					[
						['triple', TRIPLE, visual.tripleLabel, visual.tripleT, visual.tripleP],
						['critical', CRITICAL, visual.criticalLabel, visual.criticalT, visual.criticalP],
					] as const
				).map(([id, point, label, tValue, pValue]) => (
					<Part key={id} id={id}>
						{(look) => (
							<g opacity={look.opacity}>
								{tValue ? <line x1={x(point.t)} y1={y(point.p)} x2={x(point.t)} y2={AREA.bottom} stroke={palette.brand} strokeWidth={3} strokeDasharray="8 7" /> : null}
								{pValue ? <line x1={AREA.left} y1={y(point.p)} x2={x(point.t)} y2={y(point.p)} stroke={palette.brand} strokeWidth={3} strokeDasharray="8 7" /> : null}
								<circle cx={x(point.t)} cy={y(point.p)} r={13} fill={palette.brand} stroke={palette.surface} strokeWidth={4} />
								{text(x(point.t) + 24, y(point.p) + (id === 'triple' ? 34 : -34), label, 'start', labelSize * 0.85)}
								{tValue ? text(x(point.t), AREA.bottom + 36, tValue, 'middle', labelSize * 0.75, 700) : null}
								{pValue ? text(AREA.left - 14, y(point.p), pValue, 'end', labelSize * 0.75, 700) : null}
							</g>
						)}
					</Part>
				))}
				{path && marker ? (
					<Part id="path">
						{(look) => (
							<g opacity={look.opacity}>
								{path.kind === 'isobar' ? (
									<line x1={AREA.left} y1={y(path.at)} x2={x(path.to)} y2={y(path.at)} stroke={palette.lessonDeep} strokeWidth={4} strokeDasharray="14 10" />
								) : (
									<line x1={x(path.at)} y1={AREA.bottom} x2={x(path.at)} y2={y(path.to)} stroke={palette.lessonDeep} strokeWidth={4} strokeDasharray="14 10" />
								)}
								{path.label
									? path.kind === 'isobar'
										? text(AREA.left - 14, y(path.at), path.label, 'end', labelSize * 0.75, 800)
										: text(x(path.at), AREA.bottom + 36, path.label, 'middle', labelSize * 0.75, 800)
									: null}
								{crossings
									.filter((s) => s <= reach)
									.map((s, index) => {
										const point = pointOf(s);
										return <circle key={index} cx={x(point.t)} cy={y(point.p)} r={10} fill={palette.surface} stroke={palette.lessonDeep} strokeWidth={5} />;
									})}
								<circle cx={x(marker.t)} cy={y(marker.p)} r={16} fill={palette.lessonDeep} stroke={palette.surface} strokeWidth={4} />
								{text(
									x(marker.t) + (path.kind === 'isotherm' ? 30 : 0),
									y(marker.p) - (path.kind === 'isobar' ? 44 : 0),
									names[phaseAt(visual.substance, Math.min(marker.t, 0.999), Math.min(marker.p, 0.999))],
									path.kind === 'isotherm' ? 'start' : 'middle',
									labelSize * 0.9,
								)}
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
