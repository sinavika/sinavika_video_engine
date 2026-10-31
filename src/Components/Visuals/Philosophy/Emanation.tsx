import React, {useId} from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Emanation = Extract<CourseVisual, {kind: 'emanation'}>;

/** The stage (CourseVisual keeps this ratio). */
export const EMANATION_STAGE = {width: 1600, height: 700};

const CENTRE = {x: 340, y: 350};
const CORE = 72;
const OUTER = 320;
const LIST_X = 710;
const ROW_TOP = 60;
const ROW_BOTTOM = 650;

/** The ring of each level (1 nearest the source): inner and outer radius, the rings filling the space evenly. */
export const ringOf = (level: number, count: number): {inner: number; outer: number} => {
	const step = (OUTER - CORE) / count;
	return {inner: CORE + step * (level - 1), outer: CORE + step * level};
};

/** How much light a level keeps: the source is 1, the outermost level is the dimmest (matter, darkness). */
export const lightOf = (level: number, count: number): number => 1 - (0.8 * level) / count;

/** The y of each row in the list beside the rings: the source first, then the levels outward. */
const rowY = (index: number, rows: number) => ROW_TOP + ((ROW_BOTTOM - ROW_TOP) * (index + 0.5)) / rows;

const ease = (value: number) => smoothStep(clamp01(value));

/**
 * Philosophy: emanation (sudur, feyz). Everything overflows from one source, as light from the sun: the `source` at
 * the centre and the `levels` as rings around it, each dimmer than the one inside (Plotinus: the One, Intellect,
 * Soul, matter; Farabi: God, the ten intellects, the sublunar world). Light pulses and sparks keep flowing outward
 * every `period` seconds. Beside the rings each level is listed with its number and an optional detail. Parts:
 * source, l1….
 */
export const EmanationVisual: React.FC<VisualBoxProps & {visual: Emanation}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const id = useId().replace(/:/g, '');
	const k = Math.min(width / EMANATION_STAGE.width, height / EMANATION_STAGE.height);
	const ox = (width - EMANATION_STAGE.width * k) / 2;
	const oy = (height - EMANATION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const t = Math.max(0, seconds - delaySeconds);
	const count = visual.levels.length;
	const rows = count + 1;
	// Five rows read large; six (five levels) need a little less room each.
	const labelSize = rows > 5 ? 44 : 50;
	const detailSize = rows > 5 ? 32 : 36;
	const flow = (offset: number) => (visual.motion ? (t / visual.period + offset) % 1 : offset);

	const row = (index: number, label: string, detail: string | undefined, number: string) => {
		const y = rowY(index, rows);
		return (
			<g>
				<circle cx={LIST_X + 26} cy={y - (detail ? detailSize * 0.55 : 0)} r={24} fill={number ? palette.lessonDeep : palette.brand} />
				{number ? (
					<text x={LIST_X + 26} y={y - (detail ? detailSize * 0.55 : 0)} fill={palette.onLesson} fontSize={28} fontWeight={800} textAnchor="middle" dominantBaseline="central">
						{number}
					</text>
				) : null}
				<text x={LIST_X + 70} y={y - (detail ? detailSize * 0.55 : 0)} fill={palette.ink} fontSize={labelSize} fontWeight={800} dominantBaseline="central">
					{label}
				</text>
				{detail ? (
					<text x={LIST_X + 70} y={y + labelSize * 0.62} fill={palette.muted} fontSize={detailSize} fontWeight={600} dominantBaseline="central">
						{detail}
					</text>
				) : null}
			</g>
		);
	};
	// A leader from the ring to its row: it leaves the ring where the ring is nearest the row's height.
	const leader = (radius: number, index: number) => {
		const y = rowY(index, rows);
		const sin = Math.max(-0.92, Math.min(0.92, (y - CENTRE.y) / radius));
		const start = {x: CENTRE.x + radius * Math.sqrt(1 - sin * sin), y: CENTRE.y + radius * sin};
		return <path d={`M ${start.x} ${start.y} L ${LIST_X - 30} ${y} L ${LIST_X - 4} ${y}`} fill="none" stroke={palette.axis} strokeWidth={3} strokeDasharray="8 8" />;
	};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<defs>
				<radialGradient id={`${id}-core`}>
					<stop offset="0" stopColor={palette.surface} />
					<stop offset="0.35" stopColor={palette.brand} />
					<stop offset="1" stopColor={palette.brand} stopOpacity={0.6} />
				</radialGradient>
			</defs>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.levels
					.map((level, index) => ({level, index}))
					.reverse()
					.map(({level, index}) => {
						const ring = ringOf(index + 1, count);
						const light = lightOf(index + 1, count);
						return (
							<Part key={index} id={`l${index + 1}`}>
								{(look) => (
									<g opacity={look.opacity}>
										<circle
											cx={CENTRE.x}
											cy={CENTRE.y}
											r={ring.inner + (ring.outer - ring.inner) * ease(look.appear * 1.2)}
											fill={mixColors(palette.lessonDeep, palette.surface, light * 0.85)}
											stroke={palette.surface}
											strokeWidth={4}
										/>
										<text
											x={CENTRE.x}
											y={CENTRE.y - (ring.inner + ring.outer) / 2}
											fill={light > 0.45 ? palette.ink : palette.surface}
											fontSize={30}
											fontWeight={800}
											textAnchor="middle"
											dominantBaseline="central"
										>
											{index + 1}
										</text>
										{leader((ring.inner + ring.outer) / 2, index + 1)}
										{row(index + 1, level.label, level.detail, String(index + 1))}
									</g>
								)}
							</Part>
						);
					})}
				{/* The overflow: rings of light and sparks leaving the source, fading as they go out. */}
				{[0, 0.5].map((offset) => {
					const progress = flow(offset);
					const radius = CORE + (OUTER - CORE) * progress;
					return <circle key={offset} cx={CENTRE.x} cy={CENTRE.y} r={radius} fill="none" stroke={palette.brand} strokeWidth={6} opacity={0.55 * (1 - progress)} />;
				})}
				{Array.from({length: 12}, (_, index) => {
					const angle = (index / 12) * Math.PI * 2 + 0.26;
					const progress = flow((index % 3) / 3);
					const radius = CORE + (OUTER - CORE) * progress;
					return (
						<circle key={index} cx={CENTRE.x + radius * Math.cos(angle)} cy={CENTRE.y + radius * Math.sin(angle)} r={9 * (1 - progress * 0.6)} fill={palette.brand} opacity={0.85 * (1 - progress)} />
					);
				})}
				<Part id="source">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={CENTRE.x} cy={CENTRE.y} r={CORE} fill={`url(#${id}-core)`} stroke={palette.ink} strokeWidth={4} />
							<path d={`M ${CENTRE.x} ${CENTRE.y - CORE} L ${LIST_X - 30} ${rowY(0, rows)} L ${LIST_X - 4} ${rowY(0, rows)}`} fill="none" stroke={palette.axis} strokeWidth={3} strokeDasharray="8 8" />
							{row(0, visual.source.label, visual.source.detail, '')}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
