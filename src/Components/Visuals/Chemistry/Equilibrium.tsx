import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from '../Physics/ArrowHead';

type Equilibrium = Extract<CourseVisual, {kind: 'equilibrium'}>;

/** The stage (CourseVisual keeps this ratio). */
export const EQUILIBRIUM_STAGE = {width: 1600, height: 900};

/** A concentration easing exponentially from `from` to `to`: most of the way after two time constants. */
export const approach = (from: number, to: number, time: number, constant = 0.9) => to + (from - to) * Math.exp(-time / constant);

/**
 * Equilibrium over time. `concentration`: each species eases from its start to its first equilibrium value; if an
 * `event` happens (a substance added or removed, the temperature changed) the curves jump by `jump` and ease to their
 * `second` values, the change marked on the time axis. `rates`: the forward rate falls and the backward rate rises
 * until they are equal: dynamic equilibrium. The curves draw themselves from `run`. Beats point at `axes`, s1…,
 * `event`, `rates` and `run`.
 */
export const EquilibriumVisual: React.FC<VisualBoxProps & {visual: Equilibrium}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / EQUILIBRIUM_STAGE.width, height / EQUILIBRIUM_STAGE.height);
	const ox = (width - EQUILIBRIUM_STAGE.width * k) / 2;
	const oy = (height - EQUILIBRIUM_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(68, 30 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.75) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const [left, right, top, bottom] = [200, 1300, 100, 760];
	const hasEvent = visual.mode === 'concentration' && visual.species.some((species) => species.second !== undefined);
	const span = hasEvent ? 10 : 6;
	const eventAt = 5;
	// The curves draw over 6 s of video once `run` starts; without motion they are all there.
	const drawn = visual.motion ? Math.min(span, (Math.max(0, seconds - runStart) / 6) * span) : span;
	const values = visual.mode === 'rates' ? [1] : visual.species.flatMap((species) => [species.start, species.first, ...(species.second !== undefined ? [species.second, species.first + (species.jump ?? 0)] : [])]);
	const highest = Math.max(...values) * 1.15 || 1;
	const px = (time: number) => left + ((right - left) * time) / span;
	const py = (value: number) => bottom - ((bottom - top) * value) / highest;
	const colours = [palette.lesson, palette.brand, palette.ink, palette.muted];
	const sample = (valueAt: (time: number) => number, from: number, to: number) =>
		Array.from({length: 61}, (_, index) => from + ((to - from) * index) / 60)
			.filter((time) => time <= drawn)
			.map((time) => `${px(time)},${py(valueAt(time))}`)
			.join(' ');
	const axes = (
		<Part id="axes">
			{(look) => (
				<g opacity={look.opacity}>
					<line x1={left} y1={bottom} x2={right + 40} y2={bottom} stroke={palette.ink} strokeWidth={5} />
					<path d={arrowHead(right + 60, bottom, 0, 24)} fill={palette.ink} />
					<line x1={left} y1={bottom} x2={left} y2={top - 30} stroke={palette.ink} strokeWidth={5} />
					<path d={arrowHead(left, top - 50, -Math.PI / 2, 24)} fill={palette.ink} />
					{label(left + 20, top - 40, visual.mode === 'rates' ? 'Tepkime hızı' : 'Derişim (mol/L)', 'start', fontSize * 0.6)}
					{label(right + 50, bottom + 70, 'Zaman', 'end', fontSize * 0.6)}
				</g>
			)}
		</Part>
	);

	if (visual.mode === 'rates') {
		const forward = (time: number) => approach(1, 0.42, time, 1.1);
		const backward = (time: number) => approach(0, 0.42, time, 1.1);
		const settled = drawn >= 4;
		return (
			<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
				<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
					{axes}
					<Part id="rates">
						{(look) => (
							<g opacity={look.opacity}>
								<polyline points={sample(forward, 0, span)} fill="none" stroke={palette.lesson} strokeWidth={8} strokeLinejoin="round" />
								<polyline points={sample(backward, 0, span)} fill="none" stroke={palette.brand} strokeWidth={8} strokeLinejoin="round" />
								{label(px(0.5) + 20, py(forward(0.5)) - 30, 'ileri', 'start')}
								{label(px(0.5) + 20, py(backward(0.5)) + 60, 'geri', 'start')}
								{settled ? label(px(4.5), py(0.42) - 40, 'ileri = geri: denge', 'middle', fontSize * 0.7) : null}
							</g>
						)}
					</Part>
				</g>
			</svg>
		);
	}

	// Names at the curves' ends, pushed apart when two end values lie close.
	const ends = visual.species.map((species) => py(species.second !== undefined ? approach(species.first + (species.jump ?? 0), species.second, span - eventAt) : approach(species.start, species.first, span)));
	const labelY = [...ends];
	const order = ends.map((_, index) => index).sort((a, b) => ends[a] - ends[b]);
	for (let step = 1; step < order.length; step++) {
		const [above, below] = [order[step - 1], order[step]];
		if (labelY[below] - labelY[above] < fontSize * 0.85) labelY[below] = labelY[above] + fontSize * 0.85;
	}
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{axes}
				{hasEvent ? (
					<Part id="event">
						{(look) => (
							<g opacity={look.opacity * (drawn >= eventAt ? 1 : 0.25)}>
								<line x1={px(eventAt)} y1={bottom} x2={px(eventAt)} y2={top} stroke={palette.axis} strokeWidth={4} strokeDasharray="12 10" />
								{visual.event ? label(px(eventAt), top - 10, visual.event, 'middle', fontSize * 0.6) : null}
							</g>
						)}
					</Part>
				) : null}
				{visual.marks.map((mark) => (
					<g key={mark.label}>
						<line x1={px(mark.at)} y1={bottom} x2={px(mark.at)} y2={bottom + 20} stroke={palette.ink} strokeWidth={4} />
						{label(px(mark.at), bottom + 60, mark.label, 'middle', fontSize * 0.6)}
					</g>
				))}
				{visual.species.map((species, index) => {
					const colour = colours[index % colours.length];
					const first = (time: number) => approach(species.start, species.first, time);
					const after = species.second !== undefined ? (time: number) => approach(species.first + (species.jump ?? 0), species.second!, time - eventAt) : null;
					return (
						<Part key={species.label} id={`s${index + 1}`}>
							{(look) => (
								<g opacity={look.opacity}>
									<polyline points={sample(first, 0, hasEvent ? eventAt : span)} fill="none" stroke={colour} strokeWidth={8} strokeLinejoin="round" />
									{after && drawn >= eventAt ? (
										<>
											<line x1={px(eventAt)} y1={py(species.first)} x2={px(eventAt)} y2={py(species.first + (species.jump ?? 0))} stroke={colour} strokeWidth={8} />
											<polyline points={sample(after, eventAt, span)} fill="none" stroke={colour} strokeWidth={8} strokeLinejoin="round" />
										</>
									) : null}
									{drawn >= span - 0.01 ? (
										<g>
											<line x1={right + 14} y1={labelY[index]} x2={right + 54} y2={labelY[index]} stroke={colour} strokeWidth={8} />
											{label(right + 66, labelY[index] + fontSize * 0.25, species.label, 'start', fontSize * 0.7)}
										</g>
									) : null}
								</g>
							)}
						</Part>
					);
				})}
			</g>
		</svg>
	);
};
