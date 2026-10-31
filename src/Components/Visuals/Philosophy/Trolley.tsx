import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Trolley = Extract<CourseVisual, {kind: 'trolley'}>;
type Point = {x: number; y: number};

/** The stage (CourseVisual keeps this ratio). */
export const TROLLEY_STAGE = {width: 1600, height: 600};

const MAIN_Y = 250;
const BRANCH_Y = 450;
const JUNCTION = 640;
const CAR = {length: 170, height: 96};
const FIVE_X = [1250, 1305, 1360, 1415, 1470];
const ONE_X = 1360;
const LEVER = {x: 560, y: 380};

/** The track as points: straight on, or through the switch down to the side track. */
const polyline = (choice: 'main' | 'branch'): Point[] => {
	if (choice === 'main')
		return [
			{x: 60, y: MAIN_Y},
			{x: 1560, y: MAIN_Y},
		];
	const curve = Array.from({length: 16}, (_, index) => {
		const t = (index + 1) / 16;
		// Quadratic from the junction, bending down to the side track.
		const [p0, p1, p2] = [
			{x: JUNCTION, y: MAIN_Y},
			{x: 800, y: MAIN_Y},
			{x: 920, y: BRANCH_Y},
		];
		return {x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y};
	});
	return [{x: 60, y: MAIN_Y}, {x: JUNCTION, y: MAIN_Y}, ...curve, {x: 1560, y: BRANCH_Y}];
};

/** The point `distance` along a track, with the direction of travel there (radians). */
export const trackPoint = (choice: 'main' | 'branch', distance: number): Point & {angle: number} => {
	const points = polyline(choice);
	let left = Math.max(0, distance);
	for (let index = 1; index < points.length; index++) {
		const [a, b] = [points[index - 1], points[index]];
		const length = Math.hypot(b.x - a.x, b.y - a.y);
		if (left <= length || index === points.length - 1) {
			const t = Math.min(1, left / length);
			return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: Math.atan2(b.y - a.y, b.x - a.x)};
		}
		left -= length;
	}
	const last = points[points.length - 1];
	return {...last, angle: 0};
};

/** How far along its track the car's front stops: well short of the people on that track. */
export const stopDistance = (choice: 'main' | 'branch'): number => {
	const stopX = choice === 'main' ? FIVE_X[0] - 110 : ONE_X - 110;
	let low = 0;
	let high = 3000;
	for (let step = 0; step < 40; step++) {
		const mid = (low + high) / 2;
		if (trackPoint(choice, mid).x < stopX) low = mid;
		else high = mid;
	}
	return low;
};

/** Where the car waits before the switch: its front a little short of the junction. */
export const WAIT_DISTANCE = JUNCTION - 60 - 40;
const ease = (value: number) => smoothStep(clamp01(value));

/**
 * Philosophy (ethics): the trolley problem. A runaway tram rolls towards five people; a lever beside the track can
 * send it onto a side track where one person stands. The tram rolls up to the switch and waits; on the beat that
 * shows `switch` the lever is pulled and it turns onto the side track, on the beat that shows `stay` it keeps
 * straight on. It always brakes and stops short of the people: the visual poses the choice, it does not show harm.
 * Parts: trolley, five, one, lever, switch, stay.
 */
export const TrolleyVisual: React.FC<VisualBoxProps & {visual: Trolley}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / TROLLEY_STAGE.width, height / TROLLEY_STAGE.height);
	const ox = (width - TROLLEY_STAGE.width * k) / 2;
	const oy = (height - TROLLEY_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const switchAt = useBeatStartFor('switch', 'show');
	const stayAt = useBeatStartFor('stay', 'show');
	const runAt = useBeatStartFor('trolley', 'show') ?? delaySeconds + 0.6;
	const fontSize = Math.max(44, 24 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
		<text x={x} y={y} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const decidedAt = switchAt ?? stayAt;
	const choice: 'main' | 'branch' = switchAt !== undefined ? 'branch' : 'main';
	const thrown = switchAt === undefined ? 0 : visual.motion ? ease((seconds - switchAt) / 0.6) : 1;
	// The car: rolls to the switch, waits, then (after the lever) rolls on and brakes.
	let distance = WAIT_DISTANCE;
	if (!visual.motion) distance = decidedAt === undefined ? WAIT_DISTANCE : stopDistance(choice);
	else if (decidedAt === undefined || seconds < decidedAt + 0.7) distance = WAIT_DISTANCE * ease((seconds - runAt) / 3.5);
	else distance = WAIT_DISTANCE + (stopDistance(choice) - WAIT_DISTANCE) * ease((seconds - decidedAt - 0.7) / 3.5);
	const front = trackPoint(choice, distance);
	const back = trackPoint(choice, Math.max(0, distance - CAR.length));
	const angle = (Math.atan2(front.y - back.y, front.x - back.x) * 180) / Math.PI;
	const stopped = decidedAt !== undefined && (!visual.motion || seconds > decidedAt + 4.2);

	const rails = (choice: 'main' | 'branch', from: number) => {
		const points = polyline(choice).filter((point, index) => index === 0 || point.x >= from);
		const d = points.map((point, index) => `${index ? 'L' : 'M'} ${Math.max(point.x, from)} ${point.y}`).join(' ');
		return (
			<g fill="none" strokeLinecap="round" strokeLinejoin="round">
				<path d={d} stroke={palette.axis} strokeWidth={34} strokeDasharray="6 30" />
				<path d={d} stroke={palette.ink} strokeWidth={6} transform="translate(0 -11)" />
				<path d={d} stroke={palette.ink} strokeWidth={6} transform="translate(0 11)" />
			</g>
		);
	};
	const person = (x: number, y: number, key: string) => (
		<g key={key} stroke={palette.lessonDeep} strokeWidth={12} strokeLinecap="round" fill="none">
			<circle cx={x} cy={y - 112} r={18} fill={palette.lessonDeep} stroke="none" />
			<path d={`M ${x} ${y - 92} L ${x} ${y - 48} M ${x - 14} ${y} L ${x} ${y - 48} L ${x + 14} ${y} M ${x - 18} ${y - 70} L ${x} ${y - 84} L ${x + 18} ${y - 70}`} />
		</g>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{rails('main', 60)}
				{rails('branch', JUNCTION)}
				<Part id="five">
					{(look) => (
						<g opacity={look.opacity}>
							{FIVE_X.map((x) => person(x, MAIN_Y - 16, `f${x}`))}
							{text((FIVE_X[0] + FIVE_X[4]) / 2, MAIN_Y - 175, visual.fiveLabel)}
						</g>
					)}
				</Part>
				<Part id="one">
					{(look) => (
						<g opacity={look.opacity}>
							{person(ONE_X, BRANCH_Y - 16, 'one')}
							{text(ONE_X, BRANCH_Y + 70, visual.oneLabel)}
						</g>
					)}
				</Part>
				<Part id="lever">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={LEVER.x - 40} y={LEVER.y} width={80} height={26} rx={8} fill={palette.ink} />
							<g transform={`rotate(${-35 + 70 * thrown} ${LEVER.x} ${LEVER.y + 6})`}>
								<line x1={LEVER.x} y1={LEVER.y + 6} x2={LEVER.x} y2={LEVER.y - 90} stroke={palette.ink} strokeWidth={10} strokeLinecap="round" />
								<circle cx={LEVER.x} cy={LEVER.y - 96} r={16} fill={palette.brand} />
							</g>
							{person(LEVER.x - 110, LEVER.y + 26, 'decider')}
							{text(LEVER.x - 60, LEVER.y + 80, visual.leverLabel)}
							{/* The switch blade at the junction points down the side track once the lever is pulled. */}
							<line x1={JUNCTION - 70} y1={MAIN_Y} x2={JUNCTION + 10} y2={MAIN_Y + 30 * thrown} stroke={palette.brand} strokeWidth={8} strokeLinecap="round" />
						</g>
					)}
				</Part>
				<Part id="trolley">
					{(look) => (
						<g opacity={look.opacity} transform={`translate(${back.x} ${back.y}) rotate(${angle})`}>
							{stopped ? (
								<path
									d={`M -60 ${-CAR.height / 2 + 20} L -20 ${-CAR.height / 2 + 20} M -70 ${-CAR.height / 2 + 45} L -24 ${-CAR.height / 2 + 45}`}
									stroke={palette.axis}
									strokeWidth={6}
									strokeLinecap="round"
								/>
							) : null}
							<rect x={0} y={-CAR.height - 14} width={CAR.length} height={CAR.height} rx={18} fill={mixColors(palette.surface, palette.lesson, 0.5)} stroke={palette.ink} strokeWidth={5} />
							{[0, 1, 2].map((index) => (
								<rect key={index} x={18 + index * 50} y={-CAR.height + 4} width={36} height={30} rx={6} fill={palette.surface} stroke={palette.ink} strokeWidth={3} />
							))}
							<circle cx={34} cy={-12} r={14} fill={palette.ink} />
							<circle cx={CAR.length - 34} cy={-12} r={14} fill={palette.ink} />
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
