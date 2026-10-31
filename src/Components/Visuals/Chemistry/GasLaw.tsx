import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useStageClock} from '../VisualTimeline';
import {arrowHead} from '../Physics/ArrowHead';

type Gas = Extract<CourseVisual, {kind: 'gas'}>;

/** The stage (CourseVisual keeps this ratio). */
export const GAS_STAGE = {width: 1600, height: 900};

/** Ideal gas: pressure relative to a reference state, P = nRT/V. */
export const relativePressure = (state: {volume: number; temperature: number; moles: number}, reference: {volume: number; temperature: number; moles: number}) =>
	(state.moles * state.temperature * reference.volume) / (state.volume * reference.moles * reference.temperature);

/**
 * Graham's law for two gases let into the two ends of a tube of `length`: each front moves at a speed ∝ 1/√M, so
 * they meet at the distance from the first gas's end where the distances are in the ratio of the speeds.
 */
export const meetingPoint = (length: number, firstMolarMass: number, secondMolarMass: number) => {
	const first = 1 / Math.sqrt(firstMolarMass);
	const second = 1 / Math.sqrt(secondMolarMass);
	return (length * first) / (first + second);
};

/** A bounded coordinate bouncing between 0 and size: a triangle wave. */
const bounce = (start: number, speed: number, seconds: number, size: number) => {
	const span = 2 * size;
	const raw = (((start + speed * seconds) % span) + span) % span;
	return raw <= size ? raw : span - raw;
};

const multiplier = (value: number) => {
	const rounded = Math.round(value * 100) / 100;
	const fractions: Record<string, string> = {'0.5': '½', '0.25': '¼', '0.33': '⅓', '0.67': '⅔', '0.75': '¾'};
	return `×${fractions[String(rounded)] ?? String(rounded).replace('.', ',')}`;
};

/**
 * Gases. `container`: particles flying about in a cylinder closed by a piston, faster when hotter, more of them for
 * more moles; beats move through `states` (volume, temperature, moles relative to the first) with `stage` 0, 1, …, and
 * bars beside it compare P, V, T and n with the first state (P = nRT/V), marking the ones that stay fixed. `diffusion`:
 * two gases let into the ends of a tube spread at speeds ∝ 1/√M and meet nearer the heavier one; the distances are
 * written. Beats point at `container`, `particles`, `gauges` (container) and `tube`, `fronts`, `meet`, `run`
 * (diffusion).
 */
export const GasVisual: React.FC<VisualBoxProps & {visual: Gas}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / GAS_STAGE.width, height / GAS_STAGE.height);
	const ox = (width - GAS_STAGE.width * k) / 2;
	const oy = (height - GAS_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(72, 30 / k);
	const {stage, seconds: intoStage} = useStageClock(visual.states.length, {delaySeconds, secondsPerStage: 3.5});
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);

	if (visual.mode === 'diffusion') {
		const [first, second] = visual.gases!;
		const meet = meetingPoint(visual.length, first.molarMass, second.molarMass);
		const [left, right, y] = [150, 1450, 430];
		const scale = (right - left) / visual.length;
		// Both fronts reach the meeting point together after 5 s, so each moves at a speed ∝ its distance ∝ 1/√M.
		const elapsed = visual.motion ? Math.max(0, seconds - runStart) : 0;
		const travelled = visual.motion ? Math.min(1, elapsed / 5) : 1;
		const firstFront = left + meet * scale * travelled;
		const secondFront = right - (visual.length - meet) * scale * travelled;
		const met = travelled >= 1;
		const dots = (from: number, to: number, colour: string, seed: number) =>
			Array.from({length: 40}, (_, index) => {
				const share = ((index * 37 + seed) % 40) / 40;
				const x = from + (to - from) * share;
				const dy = (((index * 53 + seed * 7) % 21) - 10) * 6;
				return <circle key={`${seed}-${index}`} cx={x} cy={y + dy} r={13} fill={colour} opacity={0.85} />;
			});
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					<Part id="tube">
						{(look) => (
							<g opacity={look.opacity}>
								<rect x={left} y={y - 85} width={right - left} height={170} rx={85} fill={palette.fill} stroke={palette.ink} strokeWidth={6} />
								{label(left - 20, y + fontSize * 0.28, first.label, 'end')}
								{label(right + 20, y + fontSize * 0.28, second.label, 'start')}
								{label(left + 10, y + 170, `M = ${first.molarMass}`, 'start', fontSize * 0.7)}
								{label(right - 10, y + 170, `M = ${second.molarMass}`, 'end', fontSize * 0.7)}
							</g>
						)}
					</Part>
					<Part id="fronts">
						{(look) => (
							<g opacity={look.opacity}>
								{dots(left + 40, Math.max(left + 40, firstFront), palette.lesson, 3)}
								{dots(Math.min(right - 40, secondFront), right - 40, palette.ink, 11)}
							</g>
						)}
					</Part>
					<Part id="meet">
						{(look) => (
							<g opacity={look.opacity * (met || !visual.motion ? 1 : 0)}>
								<rect x={left + meet * scale - 16} y={y - 92} width={32} height={184} fill={palette.surface} stroke={palette.ink} strokeWidth={5} />
								<line x1={left} y1={y - 150} x2={left + meet * scale} y2={y - 150} stroke={palette.ink} strokeWidth={5} />
								<line x1={left + meet * scale} y1={y - 150} x2={right} y2={y - 150} stroke={palette.ink} strokeWidth={5} strokeDasharray="12 8" />
								{label((left + left + meet * scale) / 2, y - 175, `${String(Math.round(meet * 10) / 10).replace('.', ',')} cm`)}
								{label((left + meet * scale + right) / 2, y - 175, `${String(Math.round((visual.length - meet) * 10) / 10).replace('.', ',')} cm`)}
								{label(800, y + 330, 'Hafif gaz daha hızlı yayılır: v ∝ 1/√M', 'middle', fontSize * 0.75)}
							</g>
						)}
					</Part>
				</g>
			</svg>
		);
	}

	// Container: the state eases from the previous one to the current one over a second.
	const previous = visual.states[Math.max(0, stage - 1)];
	const current = visual.states[stage];
	const blend = stage === 0 ? 1 : easeFrom(intoStage, 0, 1);
	const mix = (key: 'volume' | 'temperature' | 'moles') => previous[key] + (current[key] - previous[key]) * blend;
	const state = {volume: mix('volume'), temperature: mix('temperature'), moles: mix('moles')};
	const reference = visual.states[0];
	const [boxLeft, boxRight, boxBottom] = [120, 840, 850];
	const boxTop = boxBottom - 640 * state.volume;
	const maxCount = Math.round(14 * Math.max(...visual.states.map((item) => item.moles)));
	const count = 14 * state.moles;
	const speed = 230 * Math.sqrt(state.temperature);
	const particles = Array.from({length: maxCount}, (_, index) => {
		const angle = (index * 2.39996) % (2 * Math.PI);
		const start = [((index * 137) % 640) + 20, ((index * 89) % 600) + 20];
		const [vx, vy] = [Math.cos(angle) * speed, Math.sin(angle) * speed];
		// Each particle's own share of the speed varies a little, as in a real gas.
		const own = 0.7 + ((index * 31) % 7) / 10;
		const x = boxLeft + 22 + bounce(start[0], vx * own, seconds, boxRight - boxLeft - 44);
		const y = boxTop + 22 + bounce(start[1], vy * own, seconds, Math.max(10, boxBottom - boxTop - 44));
		const visible = Math.min(1, Math.max(0, count - index));
		return {x, y, visible, index};
	});
	const pressure = relativePressure(state, reference);
	const bars = [
		{name: 'P', value: pressure, fixed: Math.abs(relativePressure(current, reference) - 1) < 0.01},
		{name: 'V', value: state.volume / reference.volume, fixed: Math.abs(current.volume - reference.volume) < 0.01},
		{name: 'T', value: state.temperature / reference.temperature, fixed: Math.abs(current.temperature - reference.temperature) < 0.01},
		{name: 'n', value: state.moles / reference.moles, fixed: Math.abs(current.moles - reference.moles) < 0.01},
	];
	const heat = Math.min(1, Math.max(0, (state.temperature - 0.5) / 2));

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="container">
					{(look) => (
						<g opacity={look.opacity}>
							<path d={`M ${boxLeft} 80 L ${boxLeft} ${boxBottom} L ${boxRight} ${boxBottom} L ${boxRight} 80`} fill="none" stroke={palette.ink} strokeWidth={8} />
							<rect x={boxLeft + 6} y={boxTop} width={boxRight - boxLeft - 12} height={boxBottom - boxTop - 4} fill={palette.lesson} opacity={0.05 + 0.12 * heat} />
							<rect x={boxLeft + 6} y={boxTop - 34} width={boxRight - boxLeft - 12} height={34} fill={palette.axis} stroke={palette.ink} strokeWidth={4} />
							<rect x={(boxLeft + boxRight) / 2 - 14} y={60} width={28} height={Math.max(0, boxTop - 94)} fill={palette.axis} />
							{current.label ? label((boxLeft + boxRight) / 2, 50, current.label, 'middle', fontSize * 0.75) : null}
						</g>
					)}
				</Part>
				<Part id="particles">
					{(look) => (
						<g opacity={look.opacity}>
							{particles.map((particle) => (
								<circle key={particle.index} cx={particle.x} cy={particle.y} r={22} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} opacity={particle.visible} />
							))}
						</g>
					)}
				</Part>
				<Part id="gauges">
					{(look) => (
						<g opacity={look.opacity}>
							{bars.map((bar, index) => {
								const y = 160 + index * 185;
								const length = Math.min(430, 150 * bar.value);
								return (
									<g key={bar.name}>
										{label(960, y + fontSize * 0.33, bar.name, 'end', fontSize)}
										<rect x={990} y={y - 42} width={length} height={84} rx={14} fill={bar.name === 'P' ? palette.lesson : palette.grid} stroke={palette.ink} strokeWidth={4} />
										<line x1={990 + 150} y1={y - 58} x2={990 + 150} y2={y + 58} stroke={palette.ink} strokeWidth={4} strokeDasharray="8 6" />
										{label(1006 + length, y + fontSize * 0.3, `${multiplier(bar.value)}${bar.fixed && stage > 0 ? ' sabit' : ''}`, 'start', fontSize * 0.8)}
									</g>
								);
							})}
						</g>
					)}
				</Part>
				{/* An arrow on the piston shows which way it moves while a state changes. */}
				{stage > 0 && blend < 1 && current.volume !== previous.volume ? (
					<path d={arrowHead((boxLeft + boxRight) / 2 + 70, boxTop - (current.volume > previous.volume ? 80 : -10), current.volume > previous.volume ? -Math.PI / 2 : Math.PI / 2, 30)} fill={palette.ink} />
				) : null}
			</g>
		</svg>
	);
};
