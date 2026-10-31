import React from 'react';
import {clamp01} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Rutherford = Extract<CourseVisual, {kind: 'rutherford'}>;

/** The stage (CourseVisual keeps this ratio). */
export const RUTHERFORD_STAGE = {width: 1600, height: 760};

const FOIL = {x: 700, y: 350};
const SCREEN_R = 300;
const SOURCE_X = 140;
const INSET = {x: 1330, y: 320, r: 220};
/** Each alpha particle's miss distance from the nearest nucleus (atomic scale, signed): most pass far away. */
const MISSES = [80, -60, 45, -110, 25, -35, 140, -8, 60, -90, 12, -20, 100, -70, 3, -50, 30, -130];
const K = 6;

/** The scattering angle for a miss distance b (Rutherford: tan(θ/2) = K/b); a head-on particle turns back. */
export const scatterAngle = (b: number): number => (b === 0 ? Math.PI : Math.sign(b) * 2 * Math.atan(K / Math.abs(b)));

/** Where a particle that leaves the foil at angle θ meets the circular screen. */
export const screenHit = (theta: number): {x: number; y: number} => ({x: FOIL.x + SCREEN_R * Math.cos(theta), y: FOIL.y - SCREEN_R * Math.sin(theta)});

/** How many of the particles turn by more than 90° (they come back towards the source). */
export const backScattered = (): number => MISSES.filter((b) => Math.abs(scatterAngle(b)) > Math.PI / 2).length;

const FLIGHT = 0.9;

/**
 * Chemistry, physics: Rutherford's gold-foil experiment (1911). Alpha particles leave a radioactive source, cross a thin
 * gold foil and light up a circular fluorescent screen. Most pass straight through, some are deflected and a very few
 * bounce back (angles from the Rutherford formula for each particle's miss distance). An inset shows why: the atom is
 * mostly empty space with a tiny, dense, positive nucleus. Particles start flying on the beat that shows `beam`.
 * Parts: source, foil, screen, beam, atom.
 */
export const RutherfordVisual: React.FC<VisualBoxProps & {visual: Rutherford}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / RUTHERFORD_STAGE.width, height / RUTHERFORD_STAGE.height);
	const ox = (width - RUTHERFORD_STAGE.width * k) / 2;
	const oy = (height - RUTHERFORD_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const beamAt = useBeatStartFor('beam', 'show') ?? delaySeconds + 0.8;
	const fontSize = Math.max(40, 24 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	// The source label sits left of the screen's opening; two words go on two lines so they never reach the arc.
	const [firstWord, ...otherWords] = visual.sourceLabel.split(' ');
	const sourceLines = otherWords.length > 0 ? [firstWord, otherWords.join(' ')] : [firstWord];
	const gap = visual.period / MISSES.length;
	const t = visual.motion ? seconds - beamAt : 1e6;
	// Each particle: flies to the foil, then on at its scattering angle to the screen; a flash stays where it landed.
	const particles = MISSES.map((b, index) => {
		const theta = scatterAngle(b);
		const y0 = FOIL.y + b * 0.25;
		// The beam keeps running: each particle flies again every period, its first landing leaves the flash.
		const since = t - index * gap;
		const progress = since >= 0 ? (since % visual.period) / FLIGHT : -1;
		const hit = screenHit(theta);
		let position: {x: number; y: number} | undefined;
		if (progress >= 0 && progress < 1) position = {x: SOURCE_X + 60 + (FOIL.x - SOURCE_X - 60) * progress, y: y0 + (FOIL.y - y0) * progress};
		else if (progress >= 1 && progress < 2) position = {x: FOIL.x + (hit.x - FOIL.x) * (progress - 1), y: FOIL.y + (hit.y - FOIL.y) * (progress - 1)};
		return {theta, position, landed: since >= 2 * FLIGHT, hit, y0};
	});
	const atomPaths = [
		{b: 120, label: false},
		{b: -80, label: false},
		{b: 40, label: false},
		{b: -14, label: false},
		{b: 3, label: true},
	];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="screen">
					{(look) => (
						<g opacity={look.opacity}>
							<path
								d={`M ${screenHit(Math.PI - 0.28).x} ${screenHit(Math.PI - 0.28).y} A ${SCREEN_R} ${SCREEN_R} 0 1 1 ${screenHit(-Math.PI + 0.28).x} ${screenHit(-Math.PI + 0.28).y}`}
								fill="none"
								stroke={mixColors(palette.lesson, palette.surface, 0.3)}
								strokeWidth={22}
								strokeLinecap="round"
							/>
							{particles
								.filter((particle) => particle.landed)
								.map((particle, index) => (
									<circle key={index} cx={particle.hit.x} cy={particle.hit.y} r={10} fill={palette.brand} />
								))}
							{text(FOIL.x, FOIL.y + SCREEN_R + 60, visual.screenLabel)}
						</g>
					)}
				</Part>
				<Part id="source">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={SOURCE_X - 70} y={FOIL.y - 50} width={130} height={100} rx={12} fill={palette.lessonDeep} />
							<rect x={SOURCE_X + 30} y={FOIL.y - 12} width={40} height={24} fill={palette.surface} />
							{sourceLines.map((line, index) => (
								<React.Fragment key={index}>{text(SOURCE_X - 70, FOIL.y - 90 - (sourceLines.length - 1 - index) * fontSize * 1.15, line, 'start')}</React.Fragment>
							))}
						</g>
					)}
				</Part>
				<Part id="foil">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={FOIL.x - 6} y={FOIL.y - 110} width={12} height={220} fill={palette.brand} opacity={0.85} />
							{text(FOIL.x, FOIL.y - 150, visual.foilLabel)}
						</g>
					)}
				</Part>
				<Part id="beam">
					{(look) => (
						<g opacity={look.opacity}>
							{particles.map((particle, index) =>
								particle.position ? <circle key={index} cx={particle.position.x} cy={particle.position.y} r={9} fill={palette.lesson} stroke={palette.ink} strokeWidth={2} /> : null,
							)}
						</g>
					)}
				</Part>
				<Part id="atom">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={INSET.x} cy={INSET.y} r={INSET.r} fill={palette.surface} stroke={palette.ink} strokeWidth={4} strokeDasharray="12 10" />
							{atomPaths.map((path, index) => {
								const theta = scatterAngle(path.b);
								const y = INSET.y + path.b;
								const startX = INSET.x - INSET.r + 10;
								const end = {x: INSET.x + (INSET.r - 20) * Math.cos(theta), y: INSET.y + path.b * 0.15 - (INSET.r - 20) * Math.sin(theta)};
								const reveal = visual.motion ? clamp01((seconds - beamAt - index * 0.4) / 1.2) : 1;
								return (
									<path
										key={index}
										d={`M ${startX} ${y} Q ${INSET.x - 10} ${y} ${INSET.x + Math.sign(path.b) * 2} ${INSET.y + path.b * 0.6} T ${end.x} ${end.y}`}
										fill="none"
										stroke={Math.abs(theta) > Math.PI / 2 ? palette.brand : palette.lesson}
										strokeWidth={5}
										pathLength={1}
										strokeDasharray={`${reveal} 1`}
									/>
								);
							})}
							<circle cx={INSET.x} cy={INSET.y} r={9} fill={palette.ink} />
							{text(INSET.x, INSET.y + INSET.r + 45, visual.nucleusLabel, 'middle', fontSize * 0.85)}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
