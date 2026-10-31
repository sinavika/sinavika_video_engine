import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Nephron = Extract<CourseVisual, {kind: 'nephron'}>;

/** The stage (CourseVisual keeps this ratio). */
export const NEPHRON_STAGE = {width: 1600, height: 820};

type Point = {x: number; y: number};
const CAPSULE = {x: 250, y: 250, r: 95};
const PROXIMAL: Point[] = [{x: 345, y: 250}, {x: 395, y: 205}, {x: 445, y: 275}, {x: 495, y: 205}, {x: 545, y: 275}, {x: 600, y: 215}, {x: 650, y: 250}];
const LOOP: Point[] = [{x: 650, y: 250}, {x: 650, y: 690}, {x: 705, y: 735}, {x: 760, y: 690}, {x: 760, y: 320}];
const DISTAL: Point[] = [{x: 760, y: 320}, {x: 805, y: 270}, {x: 855, y: 340}, {x: 905, y: 270}, {x: 955, y: 340}, {x: 1005, y: 280}, {x: 1060, y: 300}, {x: 1150, y: 300}];
const COLLECTING: Point[] = [{x: 1150, y: 140}, {x: 1150, y: 780}];

/** The filtrate's whole path, capsule to the end of the collecting duct. */
export const FILTRATE_PATH: Point[] = [{x: CAPSULE.x + 40, y: CAPSULE.y}, ...PROXIMAL, ...LOOP.slice(1), ...DISTAL.slice(1), {x: 1150, y: 780}];

/** A point `progress` (0–1) of the way along a path, by length. */
export const along = (path: readonly Point[], progress: number): Point => {
	const lengths = path.slice(1).map((point, index) => Math.hypot(point.x - path[index].x, point.y - path[index].y));
	let left = clamp01(progress) * lengths.reduce((sum, length) => sum + length, 0);
	for (const [index, length] of lengths.entries()) {
		if (left <= length) {
			const t = length === 0 ? 0 : left / length;
			return {x: path[index].x + (path[index + 1].x - path[index].x) * t, y: path[index].y + (path[index + 1].y - path[index].y) * t};
		}
		left -= length;
	}
	return path[path.length - 1];
};

const ease = (value: number) => smoothStep(clamp01(value));
const line = (points: readonly Point[]) => points.map((point) => `${point.x},${point.y}`).join(' ');

/**
 * The nephron and how urine forms. Blood enters the glomerulus and is filtered into Bowman's capsule (no blood cells,
 * no proteins); the filtrate runs through the proximal tubule, the loop of Henle, the distal tubule and the
 * collecting duct. Each process appears on the beat that shows it: `filtration` (the filtrate starts flowing),
 * `reabsorption` (glucose, amino acids, salt and water back into the blood from the proximal tubule), `secretion`
 * (H⁺, K⁺, creatinine into the distal tubule), `adh` (water leaving the collecting duct). Part labels can be replaced
 * by numbers for a question figure (`labels`; with `motion: false` nothing flows). Parts: capsule, glomerulus,
 * proximal, loop, distal, collecting, filtration, reabsorption, secretion, adh.
 */
export const NephronVisual: React.FC<VisualBoxProps & {visual: Nephron}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / NEPHRON_STAGE.width, height / NEPHRON_STAGE.height);
	const ox = (width - NEPHRON_STAGE.width * k) / 2;
	const oy = (height - NEPHRON_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.62, weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const at = {filtration: useBeatStartFor('filtration', 'show'), reabsorption: useBeatStartFor('reabsorption', 'show'), secretion: useBeatStartFor('secretion', 'show'), adh: useBeatStartFor('adh', 'show')};
	// A note in several short lines, so it fits between the tubes.
	const note = (x: number, y: number, lines: readonly string[], anchor: 'start' | 'middle') => lines.map((value, index) => <g key={index}>{text(x, y + index * 44, value, anchor, fontSize * 0.56, index === 0 ? 800 : 700)}</g>);
	const since = (start: number | undefined) => (visual.motion && start !== undefined ? seconds - start : -1);
	const labels = visual.labels;
	const numbered = visual.numbered;
	const labelSize = numbered ? fontSize * 1.05 : fontSize * 0.62;
	const tube = (points: readonly Point[]) => (
		<>
			<polyline points={line(points)} fill="none" stroke={palette.ink} strokeWidth={46} strokeLinejoin="round" strokeLinecap="round" />
			<polyline points={line(points)} fill="none" stroke={palette.surface} strokeWidth={36} strokeLinejoin="round" strokeLinecap="round" />
			<polyline points={line(points)} fill="none" stroke={palette.fill} strokeWidth={36} strokeLinejoin="round" strokeLinecap="round" />
		</>
	);
	const arrow = (from: Point, to: Point, progress: number, key: string) => {
		const t = ((progress % 1) + 1) % 1;
		const head = {x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t};
		return (
			<g key={key}>
				<line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={palette.brand} strokeWidth={5} strokeDasharray="10 8" opacity={0.7} />
				<circle cx={head.x} cy={head.y} r={9} fill={palette.brand} />
			</g>
		);
	};
	const flow = since(at.filtration);
	const reabsorb = since(at.reabsorption);
	const secrete = since(at.secretion);
	const adh = since(at.adh);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{/* Peritubular capillaries: the blood that takes back what is reabsorbed and gives what is secreted. */}
				<polyline points={line([{x: 345, y: 360}, {x: 650, y: 360}])} fill="none" stroke={palette.brand} strokeWidth={10} opacity={0.35} strokeLinecap="round" />
				<polyline points={line([{x: 800, y: 430}, {x: 1060, y: 430}])} fill="none" stroke={palette.brand} strokeWidth={10} opacity={0.35} strokeLinecap="round" />
				<Part id="capsule">
					{(look) => (
						<g opacity={look.opacity}>
							<path d={`M ${CAPSULE.x + 70} ${CAPSULE.y - 64} A ${CAPSULE.r} ${CAPSULE.r} 0 1 0 ${CAPSULE.x + 70} ${CAPSULE.y + 64}`} fill={palette.fill} stroke={palette.ink} strokeWidth={8} />
							{text(CAPSULE.x, CAPSULE.y - CAPSULE.r - 44, labels.capsule, 'middle', labelSize)}
						</g>
					)}
				</Part>
				<Part id="glomerulus">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={60} y1={150} x2={CAPSULE.x - 30} y2={CAPSULE.y - 20} stroke={palette.brand} strokeWidth={16} strokeLinecap="round" />
							<line x1={60} y1={350} x2={CAPSULE.x - 30} y2={CAPSULE.y + 20} stroke={palette.brand} strokeWidth={12} strokeLinecap="round" opacity={0.7} />
							{[0, 1, 2, 3, 4, 5].map((loop) => (
								<circle key={loop} cx={CAPSULE.x - 10 + 26 * Math.cos(loop * 1.05)} cy={CAPSULE.y + 26 * Math.sin(loop * 1.05)} r={22} fill="none" stroke={palette.brand} strokeWidth={9} />
							))}
							{text(CAPSULE.x, CAPSULE.y + CAPSULE.r + 50, labels.glomerulus, 'middle', labelSize)}
						</g>
					)}
				</Part>
				<Part id="proximal">
					{(look) => (
						<g opacity={look.opacity}>
							{tube(PROXIMAL)}
							{text(540, 140, labels.proximal, 'middle', labelSize)}
						</g>
					)}
				</Part>
				<Part id="loop">
					{(look) => (
						<g opacity={look.opacity}>
							{tube(LOOP)}
							{text(705, 795, labels.loop, 'middle', labelSize)}
						</g>
					)}
				</Part>
				<Part id="distal">
					{(look) => (
						<g opacity={look.opacity}>
							{tube(DISTAL)}
							{text(920, 205, labels.distal, 'middle', labelSize)}
						</g>
					)}
				</Part>
				<Part id="collecting">
					{(look) => (
						<g opacity={look.opacity}>
							{tube(COLLECTING)}
							{text(1200, 160, labels.collecting, 'start', labelSize)}
						</g>
					)}
				</Part>
				<Part id="filtration">
					{(look) =>
						flow >= 0 ? (
							<g opacity={look.opacity}>
								{Array.from({length: 14}, (_, index) => {
									const progress = (flow / visual.period + index / 14) % 1;
									const point = along(FILTRATE_PATH, progress);
									return <circle key={index} cx={point.x} cy={point.y} r={9} fill={palette.lessonDeep} opacity={ease(flow / 0.6)} />;
								})}
								{text(1200, 780, visual.urineLabel, 'start', fontSize * 0.62)}
							</g>
						) : null
					}
				</Part>
				<Part id="reabsorption">
					{(look) =>
						reabsorb >= 0 ? (
							<g opacity={look.opacity * ease(reabsorb / 0.6)}>
								{[400, 470, 540, 610].map((x, index) => arrow({x, y: 270}, {x, y: 355}, reabsorb / 1.6 + index * 0.25, `r${x}`))}
								{note(40, 470, visual.reabsorptionLabel, 'start')}
							</g>
						) : null
					}
				</Part>
				<Part id="secretion">
					{(look) =>
						secrete >= 0 ? (
							<g opacity={look.opacity * ease(secrete / 0.6)}>
								{[850, 930, 1010].map((x, index) => arrow({x, y: 425}, {x, y: 335}, secrete / 1.6 + index * 0.33, `s${x}`))}
								{note(790, 490, visual.secretionLabel, 'start')}
							</g>
						) : null
					}
				</Part>
				<Part id="adh">
					{(look) =>
						adh >= 0 ? (
							<g opacity={look.opacity * ease(adh / 0.6)}>
								{[440, 540, 640].map((y, index) => arrow({x: 1172, y}, {x: 1270, y}, adh / 1.6 + index * 0.33, `a${y}`))}
								{note(1290, 520, visual.adhLabel, 'start')}
							</g>
						) : null
					}
				</Part>
			</g>
		</svg>
	);
};
