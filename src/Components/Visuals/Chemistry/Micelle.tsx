import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Micelle = Extract<CourseVisual, {kind: 'micelle'}>;

/** The stage (CourseVisual keeps this ratio). */
export const MICELLE_STAGE = {width: 1600, height: 720};

const FABRIC = 620;
const OIL = {x: 800, y: 520, r: 95};
const LIFTED_Y = 300;
const TAIL = 120;
const HEAD_R = 17;

/** Where soap molecule `index` of `count` ends up: its head on a ring around the oil, its tail pointing into the oil. */
export const micellePlace = (index: number, count: number, centre: {x: number; y: number} = OIL) => {
	const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
	const head = {x: centre.x + Math.cos(angle) * (OIL.r + TAIL - 30), y: centre.y + Math.sin(angle) * (OIL.r + TAIL - 30)};
	return {head, angle: angle + Math.PI};
};

/** A scattered start for soap molecule `index`: somewhere in the water above the fabric, at a random tilt. */
const scattered = (index: number) => ({head: {x: 180 + noise(index * 4.1) * 820, y: 160 + noise(index * 7.3) * 280}, angle: noise(index * 2.3) * Math.PI * 2});

/**
 * Chemistry: how soap cleans. Soap molecules (a polar head and a non-polar tail) float in water above an oily stain on a
 * fabric; on the beat that shows `wrap` they gather round the oil, tails in and heads out, forming a micelle; on the beat
 * that shows `lift` the micelle comes off the fabric into the water. Parts: fabric, oil, soap, wrap, lift.
 */
export const MicelleVisual: React.FC<VisualBoxProps & {visual: Micelle}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / MICELLE_STAGE.width, height / MICELLE_STAGE.height);
	const ox = (width - MICELLE_STAGE.width * k) / 2;
	const oy = (height - MICELLE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const wrapAt = useBeatStartFor('wrap', 'show');
	const liftAt = useBeatStartFor('lift', 'show');
	const since = (at: number | undefined) => (!visual.motion ? 1 : at === undefined ? 0 : clamp01((seconds - at) / 2.5));
	const wrap = smooth(since(wrapAt));
	const lift = smooth(since(liftAt));
	const centre = {x: OIL.x, y: lerp(OIL.y, LIFTED_Y, lift)};
	const labelSize = Math.max(34, 22 / k);
	const oilColour = '#D9A441';
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'start') => (
		<text x={x} y={y} fill={palette.ink} fontSize={labelSize} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={6} paintOrder="stroke">
			{value}
		</text>
	);
	// A soap molecule: a zigzag non-polar tail ending in a charged polar head.
	const soap = (head: {x: number; y: number}, angle: number, key: number) => {
		const points = Array.from({length: 9}, (_, index) => {
			const s = HEAD_R + (index / 8) * TAIL;
			const side = index % 2 ? 9 : -9;
			return [head.x + Math.cos(angle) * s - Math.sin(angle) * side, head.y + Math.sin(angle) * s + Math.cos(angle) * side];
		});
		return (
			<g key={key}>
				<path d={points.map(([x, y], index) => `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} fill="none" stroke={palette.ink} strokeWidth={5} strokeLinejoin="round" />
				<circle cx={head.x} cy={head.y} r={HEAD_R} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
			</g>
		);
	};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<rect x={0} y={60} width={MICELLE_STAGE.width} height={FABRIC - 60} rx={24} fill={mixColors(palette.lesson, palette.surface, 0.9)} />
				{text(30, 95, visual.waterLabel)}
				<Part id="fabric">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={0} y={FABRIC} width={MICELLE_STAGE.width} height={70} fill={mixColors(palette.lessonDeep, palette.surface, 0.6)} />
							{Array.from({length: 40}, (_, index) => (
								<line key={index} x1={index * 40} y1={FABRIC} x2={index * 40 + 30} y2={FABRIC + 70} stroke={palette.surface} strokeWidth={3} opacity={0.5} />
							))}
							{text(30, FABRIC + 35, visual.fabricLabel)}
						</g>
					)}
				</Part>
				<Part id="oil">
					{(look) => (
						<g opacity={look.opacity}>
							<ellipse cx={centre.x} cy={centre.y + (1 - lift) * 15} rx={OIL.r + (1 - lift) * 40} ry={OIL.r - (1 - lift) * 25} fill={oilColour} stroke={palette.ink} strokeWidth={3} />
							{text(centre.x - OIL.r - 60 - wrap * 110, centre.y, visual.oilLabel, 'end')}
						</g>
					)}
				</Part>
				<Part id="soap">
					{(look) => (
						<g opacity={look.opacity}>
							{Array.from({length: visual.molecules}, (_, index) => {
								const from = scattered(index);
								const to = micellePlace(index, visual.molecules, centre);
								const drift = visual.motion ? Math.sin(seconds * 0.8 + index) * 12 * (1 - wrap) : 0;
								const head = {x: lerp(from.head.x, to.head.x, wrap), y: lerp(from.head.y + drift, to.head.y, wrap)};
								return soap(head, lerp(from.angle, to.angle, wrap), index);
							})}
							{text(1180, 140, visual.headLabel)}
							{text(1180, 190, visual.tailLabel)}
						</g>
					)}
				</Part>
				<Part id="wrap">{() => null}</Part>
				<Part id="lift">{() => null}</Part>
			</g>
		</svg>
	);
};
