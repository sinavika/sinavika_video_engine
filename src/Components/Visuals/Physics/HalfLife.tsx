import React, {useMemo} from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type HalfLife = Extract<CourseVisual, {kind: 'halfLife'}>;

/** The stage (CourseVisual keeps this ratio). */
export const HALF_LIFE_STAGE = {width: 1600, height: 900};

/**
 * When each nucleus decays, in half-lives: a fixed shuffle (so every render agrees) puts half of them in the first
 * half-life, a quarter in the second and so on, each at a random moment inside its half-life. So the count left is
 * exactly N/2^k after k half-lives, while the order looks random, as decay is. Nuclei past `halfLives` stay.
 */
export const decayTimes = (count: number, halfLives: number) => {
	let seed = 20261030;
	const random = () => {
		seed = (seed * 1103515245 + 12345) % 2147483648;
		return seed / 2147483648;
	};
	const order = Array.from({length: count}, (_, index) => index);
	for (let index = count - 1; index > 0; index--) {
		const swap = Math.floor(random() * (index + 1));
		[order[index], order[swap]] = [order[swap], order[index]];
	}
	const times = new Array<number>(count).fill(Infinity);
	let next = 0;
	let left = count;
	for (let life = 0; life < halfLives && left > 1; life++) {
		const decaying = Math.floor(left / 2);
		for (let step = 0; step < decaying; step++) times[order[next++]] = life + random();
		left -= decaying;
	}
	return times;
};

/**
 * Half-life: a grid of nuclei that decay one by one at random moments, yet half of what is left goes in every
 * half-life; the count shows N, N/2, N/4… Beside it the decay curve N = N₀ / 2^(t/T) draws itself as time goes, with
 * the halves marked at T, 2T, 3T. One half-life takes `period` seconds. Beats point at `nuclei`, `count`, `graph`
 * and `run`.
 */
export const HalfLifeVisual: React.FC<VisualBoxProps & {visual: HalfLife}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / HALF_LIFE_STAGE.width, height / HALF_LIFE_STAGE.height);
	const ox = (width - HALF_LIFE_STAGE.width * k) / 2;
	const oy = (height - HALF_LIFE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(60, 26 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const times = useMemo(() => decayTimes(visual.count, visual.halfLives), [visual.count, visual.halfLives]);
	// Time in half-lives, stopping at the last one.
	const t = visual.motion ? Math.min(visual.halfLives, Math.max(0, seconds - runStart) / visual.period) : 0;
	const left = times.filter((time) => time > t).length;
	const side = Math.ceil(Math.sqrt(visual.count));
	const cell = Math.min(80, 640 / side);
	const [gx, gy] = [visual.graph ? 90 : 800 - (side * cell) / 2, 120];
	// Graph on the right.
	const [left0, right0, top0, bottom0] = [900, 1520, 140, 780];
	const tMax = visual.halfLives;
	const px = (time: number) => left0 + ((right0 - left0) * time) / tMax;
	const py = (share: number) => bottom0 - (bottom0 - top0) * share;
	const curve = Array.from({length: 121}, (_, index) => (t * index) / 120)
		.map((time) => `${px(time)},${py(Math.pow(0.5, time))}`)
		.join(' ');

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="nuclei">
					{(look) => (
						<g opacity={look.opacity}>
							{times.map((time, index) => {
								const [cx, cy] = [gx + (index % side) * cell + cell / 2, gy + Math.floor(index / side) * cell + cell / 2];
								const gone = time <= t;
								// A short flash as it decays.
								const flash = gone && t - time < 0.12 ? 1 - (t - time) / 0.12 : 0;
								return (
									<g key={index}>
										{flash > 0 ? <circle cx={cx} cy={cy} r={cell * 0.48} fill={palette.brand} opacity={flash * 0.6} /> : null}
										<circle cx={cx} cy={cy} r={cell * 0.32} fill={gone ? palette.grid : palette.lesson} stroke={gone ? palette.axis : palette.ink} strokeWidth={3} />
									</g>
								);
							})}
						</g>
					)}
				</Part>
				<Part id="count">
					{(look) => (
						<g opacity={look.opacity}>
							{label(gx, 860, `Kalan: ${left} / ${visual.count}`, 'start', fontSize * 0.85)}
							{label(gx + side * cell, 860, `t = ${t.toFixed(1).replace('.', ',')} T`, 'end', fontSize * 0.85)}
						</g>
					)}
				</Part>
				{visual.graph ? (
					<Part id="graph">
						{(look) => (
							<g opacity={look.opacity}>
								<line x1={left0} y1={bottom0} x2={right0 + 20} y2={bottom0} stroke={palette.ink} strokeWidth={5} />
								<line x1={left0} y1={bottom0} x2={left0} y2={top0 - 30} stroke={palette.ink} strokeWidth={5} />
								{label(left0 - 16, top0 + fontSize * 0.25, 'N₀', 'end', fontSize * 0.7)}
								{label(right0 + 40, bottom0 - 20, 't', 'end', fontSize * 0.75)}
								{Array.from({length: tMax}, (_, index) => index + 1).map((life) => (
									<g key={life}>
										<line x1={px(life)} y1={bottom0} x2={px(life)} y2={py(Math.pow(0.5, life))} stroke={palette.axis} strokeWidth={3} strokeDasharray="8 8" />
										<line x1={left0} y1={py(Math.pow(0.5, life))} x2={px(life)} y2={py(Math.pow(0.5, life))} stroke={palette.axis} strokeWidth={3} strokeDasharray="8 8" />
										{label(px(life), bottom0 + 60, `${life}T`, 'middle', fontSize * 0.65)}
										{label(left0 - 16, py(Math.pow(0.5, life)) + fontSize * 0.25, `N₀/${2 ** life}`, 'end', fontSize * 0.6)}
									</g>
								))}
								<polyline points={curve} fill="none" stroke={palette.lesson} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
