import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {ProcessFrame, ProcessLabel, processCamera, useProcessClock} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Water heated at a steady rate from ice to steam, seen two ways at once: the particles in a beaker over a flame
 * (a lattice that trembles, breaks up into a sliding liquid, then flies apart as gas) and the heating curve drawn as
 * it happens, its flat steps where the temperature stays at 0 °C while the ice melts and at 100 °C while the water
 * boils. Boiling takes longer than melting, as it does: water needs far more heat to boil away than to melt.
 */

const BEAKER = {x0: 180, x1: 620, y0: 180, y1: 560};
const PLOT = {x0: 820, x1: 1420, y0: 160, y1: 540};
const T_MIN = -30;
const T_MAX = 140;
/** How long each stage lasts on the time axis (heat added at a steady rate). */
const SPANS = [1, 1.1, 2, 2.6, 1] as const;
const STAGES = ['kati', 'erime', 'sivi', 'kaynama', 'gaz'] as const;
const COLS = 7;
const ROWS = 6;
const COUNT = COLS * ROWS;

const temperatureAt = (stage: number, share: number) => [lerp(-20, 0, share), 0, lerp(0, 100, share), 100, lerp(100, 130, share)][stage];
const timeAt = (stage: number, share: number) => SPANS.slice(0, stage).reduce((sum, span) => sum + span, 0) + SPANS[stage] * share;
const TOTAL = SPANS.reduce((sum, span) => sum + span, 0);
const plotX = (time: number) => lerp(PLOT.x0, PLOT.x1, time / TOTAL);
const plotY = (celsius: number) => lerp(PLOT.y1, PLOT.y0, (celsius - T_MIN) / (T_MAX - T_MIN));

/** Bounces a coordinate between two walls. */
const bounce = (value: number, low: number, high: number) => {
	const span = high - low;
	const folded = ((value - low) % (2 * span) + 2 * span) % (2 * span);
	return low + (folded <= span ? folded : 2 * span - folded);
};

export const PhaseChangeProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('phasechange', visual.stages, delaySeconds);
	const camera = processCamera(clock, () => undefined);
	const {time, amount} = clock;

	const stageIndex = Math.max(0, STAGES.indexOf(clock.current as (typeof STAGES)[number]));
	const share = smooth(amount(STAGES[stageIndex]));
	const celsius = temperatureAt(stageIndex, share);
	const now = timeAt(stageIndex, share);
	const melt = amount('erime');
	const boil = amount('kaynama');
	const heat = clamp01((celsius - T_MIN) / (T_MAX - T_MIN));

	const particles = Array.from({length: COUNT}, (_, index) => {
		const col = index % COLS;
		const row = Math.floor(index / COLS);
		const lattice = [BEAKER.x0 + 70 + col * 50, BEAKER.y1 - 40 - row * 46] as const;
		const shake = 1.5 + 4 * heat;
		const solid = [lattice[0] + shake * Math.sin(time * 14 + index), lattice[1] + shake * Math.cos(time * 13 + index * 1.7)];
		// Liquid: close together but sliding past one another, in the lower part of the beaker.
		const wander = 16 + 14 * amount('sivi');
		const liquid = [lattice[0] + wander * Math.sin(time * (1.1 + noise(index)) + index * 2.3), lattice[1] + 22 + 10 * Math.cos(time * (0.9 + noise(index + 5)) + index)];
		// Gas: free, fast, filling the beaker.
		const speed = 90 + 160 * amount('gaz');
		const gas = [bounce(BEAKER.x0 + 30 + noise(index * 3.1) * 380 + time * speed * (noise(index * 7.3) - 0.5) * 2, BEAKER.x0 + 16, BEAKER.x1 - 16), bounce(BEAKER.y0 + 30 + noise(index * 5.7) * 320 + time * speed * (noise(index * 2.9) - 0.5) * 2, BEAKER.y0 + 16, BEAKER.y1 - 16)];
		// Each particle breaks free at its own moment: the top of the lattice melts first, the surface boils first.
		const freed = smooth(clamp01(melt * 1.6 - (1 - row / ROWS) * 0.6));
		const escaped = smooth(clamp01(boil * 1.5 - (1 - row / ROWS) * 0.5 - noise(index) * 0.2));
		const x = lerp(lerp(solid[0], liquid[0], freed), gas[0], escaped);
		const y = lerp(lerp(solid[1], liquid[1], freed), gas[1], escaped);
		return {x, y, escaped};
	});

	const curve = STAGES.flatMap((_, stage) => {
		if (stage > stageIndex) return [];
		const upto = stage < stageIndex ? 1 : share;
		return Array.from({length: 12}, (_, step) => {
			const s = (upto * step) / 11;
			return [plotX(timeAt(stage, s)), plotY(temperatureAt(stage, s))] as const;
		});
	});
	const plateau = clock.current === 'erime' || clock.current === 'kaynama';

	return (
		<ProcessFrame process="phasechange" clock={clock} camera={camera} width={width} height={height} backdrop="#F4F7FA">
			{/* The flame under the beaker. */}
			{Array.from({length: 7}, (_, index) => {
				const x = BEAKER.x0 + 80 + index * 48;
				const flicker = 0.75 + 0.25 * Math.sin(time * 9 + index * 1.7);
				return (
					<g key={index}>
						<path d={`M${x - 14} 620 Q${x - 10} ${620 - 34 * flicker} ${x} ${620 - 52 * flicker} Q${x + 10} ${620 - 34 * flicker} ${x + 14} 620 Z`} fill="#F28C28" />
						<path d={`M${x - 7} 620 Q${x - 4} ${620 - 18 * flicker} ${x} ${620 - 30 * flicker} Q${x + 4} ${620 - 18 * flicker} ${x + 7} 620 Z`} fill="#FFD25A" />
					</g>
				);
			})}
			<rect x={BEAKER.x0 - 40} y={620} width={BEAKER.x1 - BEAKER.x0 + 80} height={16} rx={6} fill="#5E5E5E" />
			{/* The beaker and what is in it. */}
			<rect x={BEAKER.x0} y={BEAKER.y0} width={BEAKER.x1 - BEAKER.x0} height={BEAKER.y1 - BEAKER.y0} rx={18} fill="#FFFFFF" stroke="#8CA3B7" strokeWidth={5} />
			{/* The liquid's surface while there is liquid. */}
			<rect x={BEAKER.x0 + 6} y={BEAKER.y1 - 300} width={BEAKER.x1 - BEAKER.x0 - 12} height={294} rx={12} fill="#9CCBEA" opacity={0.35 * smooth(melt) * (1 - smooth(boil))} />
			{/* Bubbles while it boils. */}
			<g opacity={clock.current === 'kaynama' ? 1 : 0}>
				{Array.from({length: 12}, (_, index) => {
					const rise = (time * 0.8 + noise(index * 4.1)) % 1;
					return <circle key={index} cx={BEAKER.x0 + 50 + noise(index * 2.3) * 340} cy={lerp(BEAKER.y1 - 12, BEAKER.y1 - 290, rise)} r={5 + 8 * rise} fill="none" stroke="#5A97CF" strokeWidth={2} />;
				})}
			</g>
			{particles.map((particle, index) => (
				<circle key={index} cx={particle.x} cy={particle.y} r={13} fill={`rgb(${Math.round(lerp(70, 220, heat))}, ${Math.round(lerp(140, 110, heat))}, ${Math.round(lerp(210, 90, heat))})`} stroke="#FFFFFF" strokeWidth={2} />
			))}
			{/* The thermometer. */}
			<rect x={672} y={BEAKER.y0} width={26} height={BEAKER.y1 - BEAKER.y0} rx={13} fill="#FFFFFF" stroke="#8CA3B7" strokeWidth={3} />
			<rect x={679} y={plotY(celsius)} width={12} height={BEAKER.y1 - plotY(celsius) - 6} rx={6} fill="#E4572E" />
			<circle cx={685} cy={BEAKER.y1 + 6} r={18} fill="#E4572E" />
			<text x={685} y={BEAKER.y0 - 18} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={30} fill={palette.ink}>
				{`${Math.round(celsius)} °C`}
			</text>
			{/* The heating curve, drawn as the water is heated. */}
			<g fontFamily={palette.fontBody} fontWeight={700} fill={palette.ink}>
				<line x1={PLOT.x0} y1={PLOT.y1} x2={PLOT.x1 + 20} y2={PLOT.y1} stroke={palette.ink} strokeWidth={3} />
				<line x1={PLOT.x0} y1={PLOT.y1} x2={PLOT.x0} y2={PLOT.y0 - 20} stroke={palette.ink} strokeWidth={3} />
				<text x={PLOT.x1 + 34} y={PLOT.y1 + 8} textAnchor="start" fontSize={24}>Zaman</text>
				<text x={PLOT.x0 - 14} y={PLOT.y0 - 30} textAnchor="start" fontSize={24}>Sıcaklık (°C)</text>
				{[0, 100].map((value) => (
					<g key={value}>
						<line x1={PLOT.x0} y1={plotY(value)} x2={PLOT.x1} y2={plotY(value)} stroke={withAlpha(palette.ink, 0.25)} strokeWidth={2} strokeDasharray="8 8" />
						<text x={PLOT.x0 - 14} y={plotY(value) + 8} textAnchor="end" fontSize={24}>
							{value}
						</text>
					</g>
				))}
			</g>
			<path d={pathOf(curve.map(([x, y]) => [x, y] as const))} fill="none" stroke={palette.lesson} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={plotX(now)} cy={plotY(celsius)} r={11} fill={palette.lesson} stroke="#FFFFFF" strokeWidth={3} />
			{/* Phase names under the curve. */}
			<g fontFamily={palette.fontBody} fontWeight={700} fontSize={20} fill={palette.muted} textAnchor="middle">
				{['Katı', 'Katı + sıvı', 'Sıvı', 'Sıvı + gaz', 'Gaz'].map((name, stage) => (
					<text key={name} x={plotX(timeAt(stage, 0.5))} y={PLOT.y1 + 30} opacity={stage <= stageIndex ? 1 : 0.35}>
						{name}
					</text>
				))}
			</g>
			<ProcessLabel id="sicaklik" at={[plotX(now), plotY(celsius)]} to={[plotX(now), plotY(celsius) - 70]} text="Sıcaklık sabit" show={plateau ? clock.now(clock.current) : 0} />
			<ProcessLabel id="tanecik" at={[particles[COUNT - 4].x, particles[COUNT - 4].y]} to={[400, 150]} text={['Tanecikler titreşir', 'Düzen bozulur', 'Tanecikler kayar', 'Tanecikler kopar', 'Tanecikler serbest'][stageIndex]} show={clock.now(clock.current)} />
		</ProcessFrame>
	);
};
