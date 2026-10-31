import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Sarcomere = Extract<CourseVisual, {kind: 'sarcomere'}>;

/** The stage (CourseVisual keeps this ratio). */
export const SARCOMERE_STAGE = {width: 1600, height: 820};

/** Filament lengths in µm: each actin filament from its Z line, the myosin in the middle. */
const ACTIN = 1;
const MYOSIN = 1.6;
const PX = 500;
const CX = 800;

/** Band lengths (µm) of a sarcomere `length` µm long: the A band is the myosin and never changes; I and H shrink. */
export const sarcomereBands = (length: number): {a: number; i: number; h: number} => ({
	a: MYOSIN,
	i: Math.max(0, length - MYOSIN),
	h: Math.max(0, length - 2 * ACTIN),
});

const ease = (value: number) => smoothStep(clamp01(value));
const decimal = (value: number) => value.toFixed(1).replace('.', ',');

/**
 * The sliding filaments of a sarcomere. Actin filaments hang from the two Z lines, the myosin sits in the middle with
 * its heads; on the `run` beat the heads pull the actin inwards and the Z lines close in from `relaxed` to
 * `contracted` µm, and on the beat that shows `relax` they part again. No filament changes its own length: the A band
 * (the myosin) stays, the I band and the H zone shrink. Brackets show the bands with their lengths (`lengths`), or
 * only their labels for a question figure. Parts: z, actin, myosin, a, i, h, run.
 */
export const SarcomereVisual: React.FC<VisualBoxProps & {visual: Sarcomere}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / SARCOMERE_STAGE.width, height / SARCOMERE_STAGE.height);
	const ox = (width - SARCOMERE_STAGE.width * k) / 2;
	const oy = (height - SARCOMERE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show');
	const relaxStart = useBeatStartFor('relax', 'show');
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, size = fontSize * 0.7, anchor: 'start' | 'middle' | 'end' = 'middle', weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const contracting = visual.motion && runStart !== undefined ? ease((seconds - runStart) / 2) : visual.motion ? 0 : 1;
	const relaxing = visual.motion && relaxStart !== undefined ? ease((seconds - relaxStart) / 2) : 0;
	const squeeze = visual.contracted < visual.relaxed ? contracting * (1 - relaxing) : 0;
	const length = visual.relaxed - (visual.relaxed - visual.contracted) * squeeze;
	const bands = sarcomereBands(length);
	const half = (length / 2) * PX;
	const [zLeft, zRight] = [CX - half, CX + half];
	const myosinHalf = (MYOSIN / 2) * PX;
	const actinPx = ACTIN * PX;
	const [top, bottom] = [150, 470];
	const myosinRows = [240, 380];
	const actinRows = [180, 310, 450];
	// A question figure's labels (I, II, III) stand alone, so they are drawn larger than a label with its length.
	const bandSize = visual.lengths ? fontSize * 0.62 : fontSize * 1.1;
	const bracket = (x1: number, x2: number, y: number, label: string, key: string) =>
		x2 - x1 < 2 ? (
			<g key={key}>
				<line x1={x1} y1={y - 16} x2={x1} y2={y + 16} stroke={palette.ink} strokeWidth={5} />
				{text(x1, y + 52, label, bandSize)}
			</g>
		) : (
			<g key={key}>
				<path d={`M ${x1} ${y - 16} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y - 16}`} fill="none" stroke={palette.ink} strokeWidth={5} />
				{text((x1 + x2) / 2, y + 48, label, bandSize)}
			</g>
		);
	const withLength = (label: string, value: number) => (visual.lengths ? `${label}: ${decimal(value)} µm` : label);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="actin">
					{(look) => (
						<g opacity={look.opacity}>
							{actinRows.map((y) => (
								<g key={y}>
									<line x1={zLeft} y1={y} x2={zLeft + actinPx} y2={y} stroke={palette.lesson} strokeWidth={10} strokeLinecap="round" />
									<line x1={zRight - actinPx} y1={y} x2={zRight} y2={y} stroke={palette.lesson} strokeWidth={10} strokeLinecap="round" />
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="myosin">
					{(look) => (
						<g opacity={look.opacity}>
							{myosinRows.map((y) => (
								<g key={y}>
									<rect x={CX - myosinHalf} y={y - 16} width={myosinHalf * 2} height={32} rx={16} fill={palette.lessonDeep} />
									{/* Heads leaning towards the middle, as they pull the actin in; they rock while the muscle contracts. */}
									{Array.from({length: 12}, (_, index) => {
										const x = CX - myosinHalf + 40 + index * ((myosinHalf * 2 - 80) / 11);
										if (Math.abs(x - CX) < 50) return null;
										const side = x < CX ? 1 : -1;
										const rock = squeeze > 0 && squeeze < 1 ? 8 * Math.sin(seconds * 14 + index) : 0;
										return (
											<g key={index}>
												<line x1={x} y1={y - 16} x2={x + side * (22 + rock)} y2={y - 46} stroke={palette.lessonDeep} strokeWidth={7} strokeLinecap="round" />
												<line x1={x} y1={y + 16} x2={x + side * (22 + rock)} y2={y + 46} stroke={palette.lessonDeep} strokeWidth={7} strokeLinecap="round" />
											</g>
										);
									})}
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="z">
					{(look) => (
						<g opacity={look.opacity}>
							{[zLeft, zRight].map((x) => (
								<path key={x} d={`M ${x} ${top - 20} L ${x - 20} ${(top + bottom) / 2} L ${x} ${bottom + 20} L ${x + 20} ${(top + bottom) / 2} Z`} fill="none" stroke={palette.ink} strokeWidth={8} strokeLinejoin="round" />
							))}
							{text(zLeft, top - 60, visual.zLabel, fontSize * 0.62)}
							{text(zRight, top - 60, visual.zLabel, fontSize * 0.62)}
							{visual.lengths ? text(CX, top - 60, `${visual.sarcomereLabel}: ${decimal(length)} µm`, fontSize * 0.62) : null}
						</g>
					)}
				</Part>
				<Part id="a">{(look) => <g opacity={look.opacity}>{bracket(CX - myosinHalf, CX + myosinHalf, 560, withLength(visual.aLabel, bands.a), 'a')}</g>}</Part>
				<Part id="i">
					{(look) => (
						<g opacity={look.opacity}>
							{bracket(zLeft, CX - myosinHalf, 680, withLength(visual.iLabel, bands.i / 2), 'il')}
							{bracket(CX + myosinHalf, zRight, 680, withLength(visual.iLabel, bands.i / 2), 'ir')}
						</g>
					)}
				</Part>
				<Part id="h">{(look) => <g opacity={look.opacity}>{bracket(CX - (bands.h / 2) * PX, CX + (bands.h / 2) * PX, 680, withLength(visual.hLabel, bands.h), 'h')}</g>}</Part>
			</g>
		</svg>
	);
};
