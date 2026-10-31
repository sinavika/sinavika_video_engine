import React, {useMemo} from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type EnergyTrack = Extract<CourseVisual, {kind: 'energyTrack'}>;

/** The stage: the track on the left, the energy bars on the right (CourseVisual keeps this ratio). */
export const ENERGY_TRACK_STAGE = {width: 1600, height: 900};

/** Simulation steps per second. */
const RATE = 200;

/**
 * The run of a body sliding along a track profile (heights over x), from energy alone: at every point
 * ½mv² = E − mgh, where E starts as ½mv₀² + mgh₀ and loses friction × distance. Where the speed would go below
 * zero the body turns back; at the end of the profile it stops. Returns samples at RATE per second: the distance
 * along the track, the speed, and the kinetic, potential and lost (heat) energy.
 */
export const energyRun = (visual: Pick<EnergyTrack, 'profile' | 'start' | 'v0' | 'mass' | 'g' | 'friction' | 'time'>) => {
	const points = visual.profile;
	const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
	const total = lengths.reduce((sum, length) => sum + length, 0);
	const heightAt = (s: number) => {
		let left = Math.max(0, Math.min(total, s));
		for (let index = 0; index < lengths.length; index++) {
			if (left <= lengths[index] || index === lengths.length - 1) {
				const share = lengths[index] === 0 ? 0 : Math.min(1, left / lengths[index]);
				return points[index][1] + (points[index + 1][1] - points[index][1]) * share;
			}
			left -= lengths[index];
		}
		return points[points.length - 1][1];
	};
	// Where along the track the start x lies.
	let s = 0;
	for (let index = 0; index < lengths.length; index++) {
		const [x0, x1] = [points[index][0], points[index + 1][0]];
		if (visual.start <= x1 || index === lengths.length - 1) {
			s += lengths[index] * Math.max(0, Math.min(1, (visual.start - x0) / (x1 - x0 || 1)));
			break;
		}
		s += lengths[index];
	}
	const m = visual.mass;
	let energy = 0.5 * m * visual.v0 * visual.v0 + m * visual.g * heightAt(s);
	let heat = 0;
	let direction = 1;
	const samples: {s: number; v: number; kinetic: number; potential: number; heat: number}[] = [];
	const steps = Math.round(visual.time * RATE);
	for (let step = 0; step <= steps; step++) {
		const potential = m * visual.g * heightAt(s);
		const kinetic = Math.max(0, energy - potential);
		const v = Math.sqrt((2 * kinetic) / m);
		samples.push({s, v, kinetic, potential, heat});
		const ds = (Math.max(v, 0.05) * direction) / RATE;
		const next = s + ds;
		const nextKinetic = energy - visual.friction * Math.abs(ds) - m * visual.g * heightAt(next);
		if (nextKinetic < 0) {
			// Not enough energy to climb on: it stops for an instant and turns back (or stays, if it cannot move).
			direction = -direction;
			continue;
		}
		if (next <= 0 || next >= total) {
			s = Math.max(0, Math.min(total, next));
			energy -= visual.friction * Math.abs(ds);
			heat += visual.friction * Math.abs(ds);
			// It leaves the track's end and is held there.
			const held = {s, v: 0, kinetic: 0, potential: m * visual.g * heightAt(s), heat: heat + Math.max(0, energy - m * visual.g * heightAt(s))};
			while (samples.length <= steps) samples.push(held);
			break;
		}
		energy -= visual.friction * Math.abs(ds);
		heat += visual.friction * Math.abs(ds);
		s = next;
	}
	return {samples, total, heightAt, start: samples[0].kinetic + samples[0].potential};
};

const format = (value: number) => (Math.round(value * 10) / 10).toString().replace('.', ',');

/**
 * A body sliding along a track (a skateboard ramp, a roller coaster, a valley), at the speed its energy allows,
 * turning back where it runs out. Beside it three bars change as it goes: kinetic energy, potential energy and the
 * heat lost to friction, under a dashed line at the energy it started with. Without friction the first two always
 * fill up to that line. Beats point at `body`, `bars` and `run` (starts the motion).
 */
export const EnergyTrackVisual: React.FC<VisualBoxProps & {visual: EnergyTrack}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / ENERGY_TRACK_STAGE.width, height / ENERGY_TRACK_STAGE.height);
	const ox = (width - ENERGY_TRACK_STAGE.width * k) / 2;
	const oy = (height - ENERGY_TRACK_STAGE.height * k) / 2;
	const run = useMemo(() => energyRun(visual), [visual]);
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1.2;
	const elapsed = Math.max(0, seconds - runStart) * (visual.time / visual.duration);
	const sample = run.samples[Math.min(run.samples.length - 1, Math.round(elapsed * RATE))];
	const barsIn = easeFrom(seconds, delaySeconds + 0.5, 0.5);
	const fontSize = 52;

	// The track, scaled into the left part of the stage; equal scale on both axes keeps slopes true.
	const xs = visual.profile.map((point) => point[0]);
	const hs = visual.profile.map((point) => point[1]);
	const [xMin, xMax, hMin, hMax] = [Math.min(...xs), Math.max(...xs), Math.min(0, ...hs), Math.max(...hs)];
	const area = {left: 110, top: 140, width: 1000, height: 660};
	const scale = Math.min(area.width / (xMax - xMin || 1), area.height / (hMax - hMin || 1));
	const px = (x: number) => area.left + (x - xMin) * scale + (area.width - (xMax - xMin) * scale) / 2;
	const py = (h: number) => area.top + area.height - (h - hMin) * scale;
	const along = (s: number) => {
		let left = s;
		for (let index = 0; index < visual.profile.length - 1; index++) {
			const [a, b] = [visual.profile[index], visual.profile[index + 1]];
			const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
			if (left <= length || index === visual.profile.length - 2) {
				const share = length === 0 ? 0 : Math.max(0, Math.min(1, left / length));
				return {x: a[0] + (b[0] - a[0]) * share, h: a[1] + (b[1] - a[1]) * share, angle: Math.atan2(-(b[1] - a[1]), b[0] - a[0])};
			}
			left -= length;
		}
		const last = visual.profile[visual.profile.length - 1];
		return {x: last[0], h: last[1], angle: 0};
	};
	const place = along(sample.s);
	const radius = 30;
	// `angle` is the track's direction on screen (y down); the body sits on the track, one radius along its normal.
	const [bx, by] = [px(place.x) + Math.sin(place.angle) * radius, py(place.h) - Math.cos(place.angle) * radius];
	const moving = sample.v > 0.05;
	const next = run.samples[Math.min(run.samples.length - 1, Math.round(elapsed * RATE) + 1)];
	const heading = next.s >= sample.s ? 1 : -1;
	const arrow = Math.min(200, 26 * sample.v);

	// Bars: one scale for all three, the starting energy reaching 520 units.
	const barTop = 210;
	const barBottom = 760;
	const barScale = (barBottom - barTop - 40) / Math.max(1e-9, run.start);
	const bars = [
		{label: 'Eₖ', value: sample.kinetic, colour: palette.lesson},
		{label: 'Eₚ', value: sample.potential, colour: palette.brand},
		...(visual.friction > 0 ? [{label: 'Isı', value: sample.heat, colour: palette.muted}] : []),
	];
	const barWidth = 100;
	const barsLeft = 1210;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				<g opacity={appear}>
					{/* Ground level h = 0 and the track filled down to it. */}
					<path
						d={`M${px(visual.profile[0][0])} ${py(hMin)} ${visual.profile.map((point) => `L${px(point[0])} ${py(point[1])}`).join(' ')} L${px(visual.profile[visual.profile.length - 1][0])} ${py(hMin)} Z`}
						fill={palette.fill}
					/>
					<polyline points={visual.profile.map((point) => `${px(point[0])},${py(point[1])}`).join(' ')} fill="none" stroke={palette.ink} strokeWidth={8} strokeLinejoin="round" />
					<line x1={area.left - 20} y1={py(0)} x2={area.left + area.width + 20} y2={py(0)} stroke={palette.axis} strokeWidth={4} strokeDasharray="14 10" />
					<text x={area.left - 20} y={py(0) - 14} fill={palette.muted} fontSize={fontSize * 0.7} fontWeight={700}>
						h = 0
					</text>
					{visual.profile
						.filter((point, index) => point[1] > 0 && (index === 0 || index === visual.profile.length - 1 || (point[1] >= visual.profile[index - 1][1] && point[1] >= visual.profile[index + 1][1])))
						.map((point) => (
							<text key={`h${point[0]}`} x={px(point[0])} y={py(point[1]) - 54} fill={palette.muted} fontSize={fontSize * 0.7} fontWeight={700} textAnchor="middle">
								{`${format(point[1])} m`}
							</text>
						))}
				</g>
				<Part id="body">
					{(look) => (
						<g opacity={appear * look.opacity}>
							<circle cx={bx} cy={by} r={radius * look.scale} fill={palette.lesson} stroke={palette.ink} strokeWidth={5} />
							{moving ? (
								<g>
									<line x1={bx} y1={by} x2={bx + Math.cos(place.angle) * heading * arrow} y2={by + Math.sin(place.angle) * heading * arrow} stroke={palette.brand} strokeWidth={10} strokeLinecap="round" />
									<path d={arrowHead(bx + Math.cos(place.angle) * heading * (arrow + 16), by + Math.sin(place.angle) * heading * (arrow + 16), heading > 0 ? place.angle : place.angle + Math.PI, 30)} fill={palette.brand} />
								</g>
							) : null}
							<text x={bx} y={by - radius - 24} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor="middle">
								{`${format(sample.v)} m/s`}
							</text>
						</g>
					)}
				</Part>
				<Part id="bars">
					{(look) => (
						<g opacity={barsIn * look.opacity}>
							<line x1={barsLeft - 30} y1={barBottom - run.start * barScale} x2={barsLeft + bars.length * (barWidth + 30)} y2={barBottom - run.start * barScale} stroke={palette.ink} strokeWidth={4} strokeDasharray="14 10" />
							<text x={barsLeft + (bars.length * (barWidth + 30)) / 2 - 15} y={barBottom - run.start * barScale - 20} fill={palette.ink} fontSize={fontSize * 0.7} fontWeight={800} textAnchor="middle">
								{`toplam ${format(run.start)} J`}
							</text>
							{bars.map((bar, index) => {
								const x = barsLeft + index * (barWidth + 30);
								const h = bar.value * barScale;
								return (
									<g key={bar.label}>
										<rect x={x} y={barBottom - h} width={barWidth} height={h} rx={10} fill={bar.colour} />
										<text x={x + barWidth / 2} y={barBottom + fontSize * 1.05} fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle">
											{bar.label}
										</text>
										<text x={x + barWidth / 2} y={barBottom - h - 14} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor="middle">
											{format(bar.value)}
										</text>
									</g>
								);
							})}
							<line x1={barsLeft - 30} y1={barBottom} x2={barsLeft + bars.length * (barWidth + 30)} y2={barBottom} stroke={palette.axis} strokeWidth={5} />
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
