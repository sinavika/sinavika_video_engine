import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Circulation = Extract<CourseVisual, {kind: 'circulation'}>;

/** The stage (CourseVisual keeps this ratio). */
export const CIRCULATION_STAGE = {width: 1600, height: 820};

type Point = {x: number; y: number};

/** The heart seen from the front: the body's right side is on the viewer's left. */
const CHAMBERS = {
	rightAtrium: {x: 500, y: 230, w: 280, h: 170},
	leftAtrium: {x: 820, y: 230, w: 280, h: 170},
	rightVentricle: {x: 500, y: 420, w: 280, h: 190},
	leftVentricle: {x: 820, y: 420, w: 280, h: 190},
};
const LUNGS = {x: 500, y: 30, w: 600, h: 130};
const BODY = {x: 500, y: 680, w: 600, h: 120};

const centre = (box: {x: number; y: number; w: number; h: number}): Point => ({x: box.x + box.w / 2, y: box.y + box.h / 2});

/**
 * The marked red blood cell's round trip, from the body's capillaries: venae cavae, right atrium, right ventricle,
 * pulmonary artery, lungs (where it takes up oxygen), pulmonary veins, left atrium, left ventricle, aorta, body.
 * `oxygen` marks the points from which the blood is oxygen-rich.
 */
const CELL_ROUTE: {point: Point; oxygen: boolean}[] = [
	{point: centre(BODY), oxygen: false},
	{point: {x: 500, y: 740}, oxygen: false},
	{point: {x: 320, y: 740}, oxygen: false},
	{point: {x: 320, y: 315}, oxygen: false},
	{point: centre(CHAMBERS.rightAtrium), oxygen: false},
	{point: centre(CHAMBERS.rightVentricle), oxygen: false},
	{point: {x: 420, y: 540}, oxygen: false},
	{point: {x: 420, y: 95}, oxygen: false},
	{point: centre(LUNGS), oxygen: true},
	{point: {x: 1180, y: 95}, oxygen: true},
	{point: {x: 1180, y: 315}, oxygen: true},
	{point: centre(CHAMBERS.leftAtrium), oxygen: true},
	{point: centre(CHAMBERS.leftVentricle), oxygen: true},
	{point: {x: 1270, y: 510}, oxygen: true},
	{point: {x: 1270, y: 740}, oxygen: true},
	{point: centre(BODY), oxygen: false},
];

/** Where along the route (and whether oxygen-rich) the cell is at `progress` (0–1) of one round trip, by distance. */
export const cellAt = (progress: number): {point: Point; oxygen: boolean} => {
	const lengths = CELL_ROUTE.slice(1).map((stop, index) => Math.hypot(stop.point.x - CELL_ROUTE[index].point.x, stop.point.y - CELL_ROUTE[index].point.y));
	const total = lengths.reduce((sum, length) => sum + length, 0);
	let left = (((progress % 1) + 1) % 1) * total;
	for (const [index, length] of lengths.entries()) {
		if (left <= length) {
			const [a, b] = [CELL_ROUTE[index].point, CELL_ROUTE[index + 1].point];
			const t = length === 0 ? 0 : left / length;
			return {point: {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t}, oxygen: CELL_ROUTE[index].oxygen};
		}
		left -= length;
	}
	return CELL_ROUTE[CELL_ROUTE.length - 1];
};

/**
 * Blood circulation: the four-chambered heart, the lungs and the body. The pulmonary (small) circulation runs from the
 * right ventricle to the lungs and back to the left atrium; the systemic (big) circulation from the left ventricle to
 * the body and back to the right atrium. Oxygen-rich blood is drawn in the brand orange, oxygen-poor in the lesson's
 * deep tone; on the `run` beat a marked red blood cell makes the round trip in `period` seconds, turning oxygen-rich
 * in the lungs and oxygen-poor in the body. Parts: heart, lungs, body, small, big, cell, run.
 */
export const CirculationVisual: React.FC<VisualBoxProps & {visual: Circulation}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / CIRCULATION_STAGE.width, height / CIRCULATION_STAGE.height);
	const ox = (width - CIRCULATION_STAGE.width * k) / 2;
	const oy = (height - CIRCULATION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show');
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.6, weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const [rich, poor] = [palette.brand, palette.lessonDeep];
	const vessel = (points: Point[], colour: string) => <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={colour} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />;
	// A gentle heartbeat: the ventricles squeeze about once a second.
	const beat = visual.motion ? 1 - 0.04 * Math.max(0, Math.sin(seconds * Math.PI * 2.4)) : 1;
	const chamber = (box: {x: number; y: number; w: number; h: number}, colour: string, label: string, squeeze: number) => {
		const [cx, cy] = [box.x + box.w / 2, box.y + box.h / 2];
		return (
			<g transform={`translate(${cx} ${cy}) scale(${squeeze}) translate(${-cx} ${-cy})`}>
				<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={34} fill={colour} opacity={0.22} stroke={palette.ink} strokeWidth={5} />
				{text(cx, cy, label, 'middle', fontSize * 0.62)}
			</g>
		);
	};
	const cell = visual.motion && runStart !== undefined && seconds >= runStart ? cellAt((seconds - runStart) / visual.period) : undefined;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="small">
					{(look) => (
						<g opacity={look.opacity}>
							{vessel([{x: 500, y: 540}, {x: 420, y: 540}, {x: 420, y: 95}, {x: 500, y: 95}], poor)}
							{vessel([{x: 1100, y: 95}, {x: 1180, y: 95}, {x: 1180, y: 315}, {x: 1100, y: 315}], rich)}
							{text(10, 200, visual.pulmonaryArteryLabel, 'start')}
							{text(1590, 200, visual.pulmonaryVeinLabel, 'end')}
						</g>
					)}
				</Part>
				<Part id="big">
					{(look) => (
						<g opacity={look.opacity}>
							{vessel([{x: 500, y: 740}, {x: 320, y: 740}, {x: 320, y: 315}, {x: 500, y: 315}], poor)}
							{vessel([{x: 1100, y: 510}, {x: 1270, y: 510}, {x: 1270, y: 740}, {x: 1100, y: 740}], rich)}
							{text(10, 620, visual.venaCavaLabel, 'start')}
							{text(1590, 620, visual.aortaLabel, 'end')}
						</g>
					)}
				</Part>
				<Part id="lungs">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={LUNGS.x} y={LUNGS.y} width={LUNGS.w} height={LUNGS.h} rx={40} fill={palette.fill} stroke={palette.ink} strokeWidth={5} />
							{text(LUNGS.x + LUNGS.w / 2, LUNGS.y + LUNGS.h / 2, visual.lungsLabel, 'middle', fontSize * 0.75)}
						</g>
					)}
				</Part>
				<Part id="body">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={40} fill={palette.fill} stroke={palette.ink} strokeWidth={5} />
							{text(BODY.x + BODY.w / 2, BODY.y + BODY.h / 2, visual.bodyLabel, 'middle', fontSize * 0.75)}
						</g>
					)}
				</Part>
				<Part id="heart">
					{(look) => (
						<g opacity={look.opacity}>
							{chamber(CHAMBERS.rightAtrium, poor, visual.rightAtriumLabel, 1)}
							{chamber(CHAMBERS.leftAtrium, rich, visual.leftAtriumLabel, 1)}
							{chamber(CHAMBERS.rightVentricle, poor, visual.rightVentricleLabel, beat)}
							{chamber(CHAMBERS.leftVentricle, rich, visual.leftVentricleLabel, beat)}
							{/* The septum keeps the two sides apart. */}
							<line x1={800} y1={220} x2={800} y2={620} stroke={palette.ink} strokeWidth={10} strokeLinecap="round" />
						</g>
					)}
				</Part>
				<Part id="cell">
					{(look) =>
						cell ? (
							<g opacity={look.opacity}>
								<circle cx={cell.point.x} cy={cell.point.y} r={26} fill={cell.oxygen ? rich : poor} stroke={palette.surface} strokeWidth={6} />
								<circle cx={cell.point.x} cy={cell.point.y} r={10} fill={palette.surface} opacity={0.6} />
							</g>
						) : null
					}
				</Part>
				<g>
					<rect x={1310} y={700} width={34} height={34} rx={8} fill={rich} />
					{text(1356, 717, visual.richLabel, 'start', fontSize * 0.5, 700)}
					<rect x={1310} y={755} width={34} height={34} rx={8} fill={poor} />
					{text(1356, 772, visual.poorLabel, 'start', fontSize * 0.5, 700)}
				</g>
			</g>
		</svg>
	);
};
