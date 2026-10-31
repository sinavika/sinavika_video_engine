import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from '../Physics/ArrowHead';

type EnergyProfile = Extract<CourseVisual, {kind: 'energyProfile'}>;

/** The stage (CourseVisual keeps this ratio). */
export const ENERGY_PROFILE_STAGE = {width: 1600, height: 900};

/** ΔH, the forward activation energy and the backward one, from the three levels (kJ). */
export const profileEnergies = (reactants: number, products: number, peak: number) => ({deltaH: products - reactants, forward: peak - reactants, backward: peak - products});

/**
 * A reaction's potential energy against its progress: reactants on a plateau, a hump at the activated complex, products
 * on another plateau. Arrows mark the activation energy (Ea), ΔH and, if asked, the backward activation energy; a
 * dashed lower hump shows the catalysed path. A ball rolls over the hump once `run` starts. The levels are written on
 * the energy axis so a question figure can be read without the arrows. Beats point at `curve`, `ea`, `dh`, `reverse`,
 * `catalyst`, `ball` and `run`.
 */
export const EnergyProfileVisual: React.FC<VisualBoxProps & {visual: EnergyProfile}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / ENERGY_PROFILE_STAGE.width, height / ENERGY_PROFILE_STAGE.height);
	const ox = (width - ENERGY_PROFILE_STAGE.width * k) / 2;
	const oy = (height - ENERGY_PROFILE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(74, 30 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const {reactants, products, peak} = visual;
	const twoStep = visual.intermediate !== undefined && visual.peak2 !== undefined;
	const levels = [reactants, products, peak, ...(visual.catalyst !== undefined ? [visual.catalyst] : []), ...(twoStep ? [visual.intermediate!, visual.peak2!] : [])];
	const top = Math.max(...levels);
	const bottom = Math.min(0, ...levels);
	// The products' plateau ends at x3; the ΔH arrow and its label stand just right of it, clear of the curve.
	const [axisX, x0, x3] = [200, 240, 1300];
	const [yTop, yBottom] = [100, 780];
	const y = (energy: number) => yBottom - ((energy - bottom) / (top - bottom || 1)) * (yBottom - yTop);
	// The path runs through knots (x, energy): plateaus, humps and, for a two-step mechanism, the intermediate's
	// valley; between knots a cubic with flat tangents, so every hump and valley is smooth and level at its top.
	const knotsFor = (hump: number): [number, number][] =>
		twoStep
			? [
					[x0, reactants],
					[380, reactants],
					[560, hump],
					[760, visual.intermediate!],
					[950, visual.peak2!],
					[1110, products],
					[x3, products],
				]
			: [
					[x0, reactants],
					[520, reactants],
					[780, hump],
					[1040, products],
					[x3, products],
				];
	const knots = knotsFor(peak);
	const curve = (hump: number) =>
		knotsFor(hump)
			.map(([x, energy], index, all) => {
				if (index === 0) return `M ${x} ${y(energy)}`;
				const [px, pe] = all[index - 1];
				const half = (x - px) / 2;
				return `C ${px + half} ${y(pe)}, ${x - half} ${y(energy)}, ${x} ${y(energy)}`;
			})
			.join(' ');
	const [x1, xp] = [knots[1][0], knots[2][0]];
	const x2 = knots[knots.length - 2][0];
	const energies = profileEnergies(reactants, products, Math.max(peak, twoStep ? visual.peak2! : peak));
	const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${String(Math.abs(Math.round(value * 10) / 10)).replace('.', ',')}`;
	// The ball follows the same knots: a cubic with flat ends is the smoothstep in x.
	const share = visual.motion ? easeFrom(seconds, runStart, 3) : 0;
	const along = (t: number): [number, number] => {
		const x = x0 + (x3 - x0) * t;
		for (let index = 1; index < knots.length; index++) {
			const [ax, ae] = knots[index - 1];
			const [bx2, be] = knots[index];
			if (x <= bx2) {
				const u = (x - ax) / (bx2 - ax);
				return [x, y(ae) + (y(be) - y(ae)) * u * u * (3 - 2 * u)];
			}
		}
		return [x3, y(products)];
	};
	const [bx, by] = along(share);
	const doubleArrow = (x: number, from: number, to: number, colour: string) => (
		<g>
			<line x1={x} y1={y(from) + (to > from ? -16 : 16)} x2={x} y2={y(to) + (to > from ? 16 : -16)} stroke={colour} strokeWidth={6} />
			<path d={arrowHead(x, y(to), to > from ? -Math.PI / 2 : Math.PI / 2, 24)} fill={colour} />
		</g>
	);
	const ticks = [...new Set(levels)];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<line x1={axisX} y1={yBottom + 40} x2={axisX} y2={yTop - 50} stroke={palette.ink} strokeWidth={5} />
				<path d={arrowHead(axisX, yTop - 70, -Math.PI / 2, 24)} fill={palette.ink} />
				<line x1={axisX} y1={yBottom + 40} x2={x3 + 60} y2={yBottom + 40} stroke={palette.ink} strokeWidth={5} />
				<path d={arrowHead(x3 + 80, yBottom + 40, 0, 24)} fill={palette.ink} />
				{label(axisX + 20, yTop - 70, 'Potansiyel enerji (kJ)', 'start', fontSize * 0.6)}
				{label(x3 + 70, yBottom + 100, 'Tepkime ilerleyişi', 'end', fontSize * 0.6)}
				{visual.values
					? ticks.map((value) => (
							<g key={value}>
								<line x1={axisX - 14} y1={y(value)} x2={axisX + 14} y2={y(value)} stroke={palette.ink} strokeWidth={4} />
								<line x1={axisX} y1={y(value)} x2={x3} y2={y(value)} stroke={palette.grid} strokeWidth={2} strokeDasharray="8 10" />
								{label(axisX - 24, y(value) + fontSize * 0.25, signed(value).replace('+', ''), 'end', fontSize * 0.65)}
							</g>
						))
					: null}
				{visual.catalyst !== undefined ? (
					<Part id="catalyst">
						{(look) => (
							<g opacity={look.opacity}>
								<path d={curve(visual.catalyst!)} fill="none" stroke={palette.lesson} strokeWidth={6} strokeDasharray="16 12" />
								{label(xp, y(visual.catalyst!) + fontSize * 0.95, 'katalizörlü', 'middle', fontSize * 0.6)}
							</g>
						)}
					</Part>
				) : null}
				<Part id="curve">
					{(look) => (
						<g opacity={look.opacity}>
							<path d={curve(peak)} fill="none" stroke={palette.ink} strokeWidth={8} strokeLinecap="round" />
							{label((x0 + x1) / 2, y(reactants) - 24, visual.reactantLabel, 'middle', fontSize * 0.7)}
							{label((x2 + x3) / 2, y(products) - 24, visual.productLabel, 'middle', fontSize * 0.7)}
						</g>
					)}
				</Part>
				{visual.ea ? (
					<Part id="ea">
						{(look) => (
							<g opacity={look.opacity}>
								{doubleArrow(x1 + 90, reactants, peak, palette.lesson)}
								{label(x1 + 70, (y(reactants) + y(peak)) / 2, `${twoStep ? 'Ea₁' : 'Ea'} = ${signed(peak - reactants).replace('+', '')}`, 'end', fontSize * 0.7)}
								{twoStep ? doubleArrow(knots[3][0] + 70, visual.intermediate!, visual.peak2!, palette.lesson) : null}
								{twoStep ? label(knots[3][0] + 90, (y(visual.intermediate!) + y(visual.peak2!)) / 2, `Ea₂ = ${signed(visual.peak2! - visual.intermediate!).replace('+', '')}`, 'start', fontSize * 0.7) : null}
							</g>
						)}
					</Part>
				) : null}
				{visual.reverse ? (
					<Part id="reverse">
						{(look) => (
							<g opacity={look.opacity}>
								{doubleArrow(x2 - 90, products, peak, palette.muted)}
								{label(x2 - 70, (y(products) + y(peak)) / 2, `Ea(geri) = ${signed(energies.backward).replace('+', '')}`, 'start', fontSize * 0.62)}
							</g>
						)}
					</Part>
				) : null}
				{visual.dh ? (
					<Part id="dh">
						{(look) => (
							<g opacity={look.opacity}>
								<line x1={x2 + 60} y1={y(reactants)} x2={x3 + 60} y2={y(reactants)} stroke={palette.ink} strokeWidth={3} strokeDasharray="10 8" />
								<line x1={x3} y1={y(products)} x2={x3 + 60} y2={y(products)} stroke={palette.ink} strokeWidth={3} strokeDasharray="10 8" />
								{doubleArrow(x3 + 40, reactants, products, palette.ink)}
								{/* The ΔH label sits right of its arrow, clear of the products' name on the plateau. */}
								{label(x3 + 66, (y(reactants) + y(products)) / 2 + fontSize * 0.25, `ΔH = ${signed(energies.deltaH)}`, 'start', fontSize * 0.62)}
							</g>
						)}
					</Part>
				) : null}
				{visual.motion ? (
					<Part id="ball">{(look) => <circle cx={bx} cy={by - 26} r={24} fill={palette.brand} stroke={palette.ink} strokeWidth={4} opacity={look.opacity} />}</Part>
				) : null}
			</g>
		</svg>
	);
};
