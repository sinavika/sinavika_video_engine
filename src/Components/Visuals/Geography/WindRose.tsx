import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {Tag, usePartLook, World} from '../VisualWorld';
import {WIND_DIRECTIONS} from './GeographySchema';

// ---------------------------------------------------------------- wind rose

type WindRose = Extract<CourseVisual, {kind: 'windRose'}>;

/** Cold winds blue, warm ones red, the rest grey: what the wind brings is the lesson. */
const FEEL_COLOURS = {cold: '#3B7FC4', warm: '#D2603A', mild: '#7C8794'} as const;

const CENTRE = {x: 500, y: 290};
const RING = 140;
/** Where an arrow starts and where its name sits, from the centre. */
const ARROW_START = RING + 86;
const NAME_AT = RING + 110;

/** The screen angle (radians) of a direction: K (north) up, then clockwise, 45° apart. */
export const directionAngle = (direction: (typeof WIND_DIRECTIONS)[number]) => -Math.PI / 2 + (WIND_DIRECTIONS.indexOf(direction) * Math.PI) / 4;

/** A point at `radius` from the rose's centre in a direction. */
export const rosePoint = (direction: (typeof WIND_DIRECTIONS)[number], radius: number) => {
	const angle = directionAngle(direction);
	return {x: CENTRE.x + Math.cos(angle) * radius, y: CENTRE.y + Math.sin(angle) * radius};
};

/**
 * A wind rose (rüzgâr gülü) as Turkish textbooks draw the local winds: eight directions round a centre, each wind an
 * arrow blowing from its direction towards the centre, named at the rim, blue when it brings cold, red when it brings
 * warmth. Beats point at a wind by its name.
 */
export const WindRoseVisual: React.FC<VisualBoxProps & {visual: WindRose}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	return (
		<World width={width} height={height}>
			{/* The compass: a ring, eight spokes and the directions' initials. */}
			<circle cx={CENTRE.x} cy={CENTRE.y} r={RING} fill="none" stroke={palette.grid} strokeWidth={3} />
			<circle cx={CENTRE.x} cy={CENTRE.y} r={RING * 0.45} fill="none" stroke={palette.grid} strokeWidth={2} strokeDasharray="6 6" />
			{WIND_DIRECTIONS.map((direction) => {
				const inner = rosePoint(direction, 18);
				const outer = rosePoint(direction, RING);
				const mark = rosePoint(direction, RING - 28);
				return (
					<g key={direction}>
						<line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={palette.grid} strokeWidth={2} />
						<Tag x={mark.x} y={mark.y} text={direction} anchor="middle" size={direction.length > 1 ? 17 : 20} weight={800} fill={palette.muted} />
					</g>
				);
			})}
			<circle cx={CENTRE.x} cy={CENTRE.y} r={14} fill={palette.lesson} />
			{visual.center ? <Tag x={CENTRE.x} y={CENTRE.y + 34} text={visual.center} anchor="middle" size={18} weight={800} /> : null}
			{/* Each wind blows in from its rim towards the centre. */}
			{visual.winds.map((wind, index) => (
				<Wind key={wind.name} wind={wind} index={index} delaySeconds={delaySeconds} />
			))}
		</World>
	);
};

/** One wind: an arrow from its rim towards the centre, drawn in as it comes, with its name and what it brings. */
const Wind: React.FC<{wind: WindRose['winds'][number]; index: number; delaySeconds: number}> = ({wind, index, delaySeconds}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const look = usePartLook(wind.name, easeFrom(seconds, delaySeconds + 0.4 + index * 0.35, 0.8));
	const colour = FEEL_COLOURS[wind.feel];
	const start = rosePoint(wind.from, ARROW_START);
	const end = rosePoint(wind.from, RING * 0.5);
	const grow = Math.min(1, look.drawn);
	const tip = {x: start.x + (end.x - start.x) * grow, y: start.y + (end.y - start.y) * grow};
	const angle = Math.atan2(end.y - start.y, end.x - start.x);
	const head = 22;
	const wing = (side: number) => ({x: tip.x - Math.cos(angle) * head + Math.cos(angle + (side * Math.PI) / 2) * head * 0.55, y: tip.y - Math.sin(angle) * head + Math.sin(angle + (side * Math.PI) / 2) * head * 0.55});
	const [left, right] = [wing(1), wing(-1)];
	const label = rosePoint(wind.from, NAME_AT);
	// The northern name goes above its arrow, with its note under it; every other note goes under its name.
	const above = wind.from === 'K';
	const anchor = label.x < CENTRE.x - 20 ? 'end' : label.x > CENTRE.x + 20 ? 'start' : 'middle';
	return (
		<g opacity={look.opacity}>
			<line x1={start.x} y1={start.y} x2={tip.x} y2={tip.y} stroke={colour} strokeWidth={look.focused > 0.5 ? 12 : 8} strokeLinecap="round" />
			{grow > 0.05 ? <path d={`M${tip.x} ${tip.y} L${left.x} ${left.y} L${right.x} ${right.y} Z`} fill={colour} /> : null}
			<Tag x={label.x} y={label.y - (above ? 18 : 0)} text={wind.name} anchor={anchor} size={24} weight={800} fill={colour} focused={look.focused} />
			{wind.note ? <Tag x={label.x} y={label.y + (above ? 8 : 26)} text={wind.note} anchor={anchor} size={17} fill={palette.muted} /> : null}
		</g>
	);
};
