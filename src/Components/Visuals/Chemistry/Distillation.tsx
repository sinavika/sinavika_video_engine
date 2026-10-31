import React, {useId} from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Distillation = Extract<CourseVisual, {kind: 'distillation'}>;

/** The stage (CourseVisual keeps this ratio). */
export const DISTILLATION_STAGE = {width: 1600, height: 900};

const COLUMN = {left: 400, right: 660, top: 60, bottom: 820};
const [FIRST_Y, LAST_Y] = [120, 760];
/** Where the fractions' pipes end and their labels begin. */
const BOX_LEFT = 770;
/** Seconds a bubble takes from the furnace to its tray and on through its pipe. */
const CYCLE = 3.2;
const BUBBLES = 4;

/** The height of each fraction's tray and pipe: the first (coolest) at the top, the last (hottest) at the bottom. */
export const fractionLevels = (count: number): number[] =>
	Array.from({length: count}, (_, index) => (count === 1 ? (FIRST_Y + LAST_Y) / 2 : FIRST_Y + ((LAST_Y - FIRST_Y) * index) / (count - 1)));

/**
 * Fractional distillation of crude oil: vapour from the furnace enters the foot of the column, which is hot at the
 * bottom and cool at the top. Each bubble rises until it reaches the tray of its own fraction, condenses there and runs
 * out through that tray's pipe; light, small molecules rise to the top, heavy ones leave near the bottom. `fractions`
 * run top to bottom (name and boiling range). Parts: `column`, `feed` (furnace and inlet), `gradient` (the
 * temperature arrow), f1… (a fraction: its pipe, label and the bubbles that reach it, so showing f1 alone sends
 * vapour to the top only).
 */
export const DistillationVisual: React.FC<VisualBoxProps & {visual: Distillation}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const gradientId = `distillation-${useId().replace(/:/g, '')}`;
	const k = Math.min(width / DISTILLATION_STAGE.width, height / DISTILLATION_STAGE.height);
	const ox = (width - DISTILLATION_STAGE.width * k) / 2;
	const oy = (height - DISTILLATION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const fontSize = Math.max(60, 26 / k);
	const levels = fractionLevels(visual.fractions.length);
	const spacing = levels.length > 1 ? levels[1] - levels[0] : 200;
	const boxHeight = Math.min(96, spacing - 14);
	const t = visual.motion ? Math.max(0, seconds - delaySeconds - 0.6) : 0;
	const centre = (COLUMN.left + COLUMN.right) / 2;
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end', size: number, weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central">
			{value}
		</text>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<defs>
				<linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
					<stop offset="0" stopColor={palette.brand} stopOpacity={0.32} />
					<stop offset="1" stopColor={palette.lesson} stopOpacity={0.12} />
				</linearGradient>
			</defs>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="column">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={COLUMN.left} y={COLUMN.top} width={COLUMN.right - COLUMN.left} height={COLUMN.bottom - COLUMN.top} rx={46} fill={`url(#${gradientId})`} stroke={palette.ink} strokeWidth={6} />
							{levels.map((y, index) => (
								// A tray under each draw-off, with a gap the vapour climbs through (left and right in turn).
								<line key={index} x1={index % 2 ? COLUMN.left + 70 : COLUMN.left} y1={y + 34} x2={index % 2 ? COLUMN.right : COLUMN.right - 70} y2={y + 34} stroke={palette.axis} strokeWidth={5} />
							))}
						</g>
					)}
				</Part>
				<Part id="gradient">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={350} y1={640} x2={350} y2={COLUMN.top + 60} stroke={palette.ink} strokeWidth={6} />
							<path d={`M 330 ${COLUMN.top + 80} L 350 ${COLUMN.top + 40} L 370 ${COLUMN.top + 80} Z`} fill={palette.ink} />
							{text(312, COLUMN.top + 60, visual.coolLabel, 'end', fontSize * 0.8)}
							{text(312, 620, visual.hotLabel, 'end', fontSize * 0.8)}
						</g>
					)}
				</Part>
				<Part id="feed">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={40} y={680} width={270} height={150} rx={24} fill={palette.surface} stroke={palette.ink} strokeWidth={5} />
							{[0, 1, 2].map((flame) => {
								const x = 105 + flame * 70;
								const flicker = 1 + 0.12 * Math.sin(t * 9 + flame * 2);
								return <path key={flame} d={`M ${x - 24} 820 Q ${x} ${820 - 80 * flicker} ${x + 24} 820 Z`} fill={palette.brand} opacity={0.85} />;
							})}
							{text(175, 718, visual.heatLabel, 'middle', fontSize * 0.7)}
							<rect x={310} y={770} width={COLUMN.left - 310} height={26} fill={palette.axis} />
							{text(40, 868, visual.feed, 'start', fontSize * 0.62, 700)}
						</g>
					)}
				</Part>
				{visual.fractions.map((fraction, index) => {
					const y = levels[index];
					return (
						<Part key={index} id={`f${index + 1}`}>
							{(look) => (
								<g opacity={look.opacity}>
									<rect x={COLUMN.right} y={y - 11} width={BOX_LEFT - COLUMN.right} height={22} fill={palette.axis} />
									<rect x={BOX_LEFT} y={y - boxHeight / 2} width={1590 - BOX_LEFT} height={boxHeight} rx={18} fill={palette.fill} stroke={look.scale > 1.25 ? palette.lesson : 'none'} strokeWidth={5} />
									{text(BOX_LEFT + 28, y, fraction.name, 'start', fontSize * 0.9)}
									{text(1565, y, fraction.range, 'end', fontSize * 0.85, 600)}
									{Array.from({length: BUBBLES}, (_, bubble) => {
										const phase = (((t / CYCLE + bubble / BUBBLES + index * 0.17) % 1) + 1) % 1;
										if (!visual.motion) return null;
										if (phase < 0.72) {
											// Rising vapour, swaying through the gaps of the trays.
											const rise = phase / 0.72;
											const by = COLUMN.bottom - 50 - (COLUMN.bottom - 50 - y) * rise;
											const bx = centre + 65 * Math.sin(rise * 7 + bubble * 1.7 + index);
											return <circle key={bubble} cx={bx} cy={by} r={17} fill={palette.lesson} opacity={0.35 + 0.4 * (1 - rise)} />;
										}
										// Condensed: a drop running out along the pipe.
										const run = (phase - 0.72) / 0.28;
										return <circle key={bubble} cx={COLUMN.right - 20 + (BOX_LEFT - COLUMN.right) * run} cy={y} r={11} fill={palette.lessonDeep} />;
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
