import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Digestion = Extract<CourseVisual, {kind: 'digestion'}>;

/** The stage (CourseVisual keeps this ratio). */
export const DIGESTION_STAGE = {width: 1600, height: 660};

const BEAD = 15;
const LINK = 32;
const GAP = 22;

/** A fat drop's radius grows with the square root of the fat it holds, so emulsified drops add up to the big one's area. */
const dropRadius = (size: number) => 19 * Math.sqrt(size);

/** Where each unit of a nutrient sits in a cell, its groups (chains or drops) laid out in a centred row. */
export const groupLayout = (groups: readonly number[], shape: 'circle' | 'square' | 'drop'): {x: number; group: number; radius: number}[] => {
	const widths = groups.map((size) => (shape === 'drop' ? 2 * dropRadius(size) : size * LINK));
	const total = widths.reduce((sum, width) => sum + width, 0) + GAP * (groups.length - 1);
	let x = -total / 2;
	return groups.flatMap((size, group) => {
		const width = widths[group];
		const units = shape === 'drop' ? [{x: x + width / 2, group, radius: dropRadius(size)}] : Array.from({length: size}, (_, index) => ({x: x + LINK / 2 + index * LINK, group, radius: BEAD}));
		x += width + GAP;
		return units;
	});
};

const ease = (value: number) => smoothStep(clamp01(value));

/**
 * Chemical digestion along the canal. Columns are the stations (mouth, stomach, small intestine), rows the nutrients;
 * each cell shows what a nutrient is when it leaves that station: chains of units (starch, protein) or fat drops,
 * given as group sizes ([8] one chain, [2, 2, 2, 2] four pairs, eight 1s single units). On the `run` beat the food
 * reaches the stations one after another (`period` seconds apart): in each cell the incoming groups break into the
 * outgoing ones and the enzyme that did it appears below. Parts: s1… (stations), r1… (nutrients), run.
 */
export const DigestionVisual: React.FC<VisualBoxProps & {visual: Digestion}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / DIGESTION_STAGE.width, height / DIGESTION_STAGE.height);
	const ox = (width - DIGESTION_STAGE.width * k) / 2;
	const oy = (height - DIGESTION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 0.8;
	const time = visual.motion ? seconds - runStart : visual.period * (visual.stations.length + 1);
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, size = fontSize * 0.7, anchor: 'start' | 'middle' | 'end' = 'middle', weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const left = 250;
	const columnWidth = (1580 - left) / visual.stations.length;
	const columnX = (station: number) => left + columnWidth * (station + 0.5);
	const headerY = 56;
	const rowTop = 130;
	const rowHeight = (650 - rowTop) / visual.rows.length;
	const rowY = (row: number) => rowTop + rowHeight * (row + 0.4);
	const colours = [palette.lesson, palette.lessonDeep, palette.brand];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.stations.map((station, index) => (
					<Part key={station} id={`s${index + 1}`}>
						{(look) => (
							<g opacity={look.opacity}>
								<rect x={columnX(index) - columnWidth / 2 + 8} y={headerY - 44} width={columnWidth - 16} height={650 - headerY + 34} rx={26} fill={palette.fill} opacity={0.6 + 0.4 * ease((time - index * visual.period) / 0.6)} />
								{text(columnX(index), headerY, station, fontSize * 0.8)}
							</g>
						)}
					</Part>
				))}
				{visual.rows.map((row, rowIndex) => {
					const y = rowY(rowIndex);
					const colour = colours[rowIndex % colours.length];
					return (
						<Part key={row.label} id={`r${rowIndex + 1}`}>
							{(look) => (
								<g opacity={look.opacity}>
									{text(20, y, row.label, fontSize * 0.75, 'start')}
									{visual.stations.map((_, station) => {
										const arrived = time - station * visual.period;
										if (arrived < 0) return null;
										// The food comes in as it left the previous station and breaks into what leaves this one.
										const before = groupLayout(station === 0 ? row.intake : row.stages[station - 1], row.shape);
										const after = groupLayout(row.stages[station], row.shape);
										const split = ease((arrived - 0.4) / (visual.period * 0.5));
										const cx = columnX(station);
										const enzyme = row.enzymes[station];
										const units = row.shape === 'drop' ? after : after.map((unit, index) => ({...unit, from: before[Math.min(index, before.length - 1)]}));
										return (
											<g key={station} opacity={ease(arrived / 0.4)}>
												{row.shape === 'drop'
													? split < 1 && before.length !== after.length
														? [
																...before.map((drop, index) => <circle key={`b${index}`} cx={cx + drop.x} cy={y} r={drop.radius} fill={colour} opacity={0.85 * (1 - split)} />),
																...after.map((drop, index) => <circle key={`a${index}`} cx={cx + drop.x * split} cy={y} r={drop.radius} fill={colour} opacity={0.85 * split} />),
															]
														: after.map((drop, index) => <circle key={index} cx={cx + drop.x} cy={y} r={drop.radius} fill={colour} opacity={0.85} />)
													: (units as {x: number; group: number; radius: number; from: {x: number; group: number}}[]).map((unit, index, all) => {
															const x = cx + unit.from.x + (unit.x - unit.from.x) * split;
															const next = all[index + 1];
															const linked = next && next.group === unit.group;
															const nextX = next ? cx + next.from.x + (next.x - next.from.x) * split : 0;
															return (
																<g key={index}>
																	{linked ? <line x1={x} y1={y} x2={nextX} y2={y} stroke={palette.ink} strokeWidth={5} /> : null}
																	{row.shape === 'square' ? (
																		<rect x={x - BEAD} y={y - BEAD} width={BEAD * 2} height={BEAD * 2} rx={5} fill={colour} stroke={palette.ink} strokeWidth={3} />
																	) : (
																		<circle cx={x} cy={y} r={BEAD} fill={colour} stroke={palette.ink} strokeWidth={3} />
																	)}
																</g>
															);
														})}
												{enzyme ? <g opacity={ease((arrived - 0.3) / 0.5)}>{text(cx, y + (row.shape === 'drop' ? 74 : 62), enzyme, fontSize * 0.62, 'middle', 700)}</g> : null}
											</g>
										);
									})}
								</g>
							)}
						</Part>
					);
				})}
			</g>
		</svg>
	);
};
