import React from 'react';
import {clamp01} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Retrograde = Extract<CourseVisual, {kind: 'retrograde'}>;
type Point = {x: number; y: number};

/** The stage (CourseVisual keeps this ratio). */
export const RETROGRADE_STAGE = {width: 1600, height: 720};

const SUN: Point = {x: 360, y: 380};
const EARTH_R = 150;
const MARS_R = 228;
/** Mars's year in Earth years (1.88): its angular speed is the Earth's divided by this. */
const MARS_YEAR = 1.88;
const EARTH_START = -1.9;
const MARS_START = 0.3;
const SKY = {left: 800, right: 1560, top: 150, bottom: 470};
const STEP = 0.2;
/** The part of Mars's apparent path the sky strip shows (radians from its starting point): the loop sits in the middle. */
const SKY_FROM = 1.0;
const SKY_SPAN = 2.4;

/** Where the Earth and Mars are `t` seconds in, with an Earth year of `year` seconds (circular orbits). */
export const planetsAt = (t: number, year: number): {earth: Point; mars: Point} => {
	const earth = EARTH_START + (2 * Math.PI * t) / year;
	const mars = MARS_START + (2 * Math.PI * t) / (year * MARS_YEAR);
	return {earth: {x: SUN.x + EARTH_R * Math.cos(earth), y: SUN.y + EARTH_R * Math.sin(earth)}, mars: {x: SUN.x + MARS_R * Math.cos(mars), y: SUN.y + MARS_R * Math.sin(mars)}};
};

/** The direction from the Earth to Mars (radians, unwrapped against `previous`): where Mars appears among the stars. */
export const apparentLongitude = (t: number, year: number, previous?: number): number => {
	const {earth, mars} = planetsAt(t, year);
	let angle = Math.atan2(mars.y - earth.y, mars.x - earth.x);
	if (previous !== undefined) {
		while (angle - previous > Math.PI) angle -= 2 * Math.PI;
		while (angle - previous < -Math.PI) angle += 2 * Math.PI;
	}
	return angle;
};

/** The apparent longitudes every STEP seconds up to `t`, unwrapped into one continuous track. */
export const skyTrack = (t: number, year: number): number[] => {
	const track: number[] = [];
	for (let time = 0; time <= t + 1e-9; time += STEP) track.push(apparentLongitude(time, year, track[track.length - 1]));
	return track;
};

/**
 * Astronomy (and the scientific revolution): Mars's retrograde motion in the Sun-centred model. The Earth (inner
 * orbit) and Mars (outer orbit) circle the Sun at their real period ratio; the dashed sight line from the Earth through
 * Mars shows where Mars appears among the fixed stars. On the sky strip its track moves forward, loops back while the
 * faster Earth overtakes Mars, and moves forward again; the loop is labelled. A small up-down drift stands for Mars's
 * tilted orbit so the track draws the textbook loop. Parts: sun, earth, mars, sightline, sky, retro.
 */
export const RetrogradeVisual: React.FC<VisualBoxProps & {visual: Retrograde}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / RETROGRADE_STAGE.width, height / RETROGRADE_STAGE.height);
	const ox = (width - RETROGRADE_STAGE.width * k) / 2;
	const oy = (height - RETROGRADE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const t = visual.motion ? Math.max(0, seconds - delaySeconds) : visual.year * 1.25;
	const {earth, mars} = planetsAt(t, visual.year);
	const track = skyTrack(t, visual.year);
	const fontSize = Math.max(40, 24 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	// The sky strip: the stretch of sky Mars crosses around the loop runs left to right; a small drift up and down stands for the tilted orbit.
	const skyX = (longitude: number) => SKY.left + 40 + ((longitude - track[0] - SKY_FROM) / SKY_SPAN) * (SKY.right - SKY.left - 80);
	const skyY = (index: number) => (SKY.top + SKY.bottom) / 2 + 55 * Math.sin(MARS_START + (2 * Math.PI * index * STEP) / (visual.year * MARS_YEAR) + 0.9);
	const dots = track.map((longitude, index) => ({x: skyX(longitude), y: skyY(index), back: index > 0 && longitude < track[index - 1]}));
	const visible = dots.filter((dot) => dot.x >= SKY.left + 10 && dot.x <= SKY.right - 10);
	const backward = dots.filter((dot) => dot.back);
	const retroAt = backward.length > 0 ? backward[Math.floor(backward.length / 2)] : undefined;
	const now = dots[dots.length - 1];
	// A planet's name sits just outside it, away from the Sun, so it never covers the Sun's name or the other planet's.
	const outward = (planet: Point, distance: number): [number, number] => {
		const length = Math.hypot(planet.x - SUN.x, planet.y - SUN.y) || 1;
		return [planet.x + ((planet.x - SUN.x) / length) * distance, planet.y + ((planet.y - SUN.y) / length) * distance];
	};
	// The sight line: from the Earth through Mars, on to the edge of the drawing.
	const direction = Math.atan2(mars.y - earth.y, mars.x - earth.x);
	const far = {x: earth.x + 560 * Math.cos(direction), y: earth.y + 560 * Math.sin(direction)};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<defs>
				<clipPath id="retrograde-left">
					<rect x={20} y={40} width={700} height={660} />
				</clipPath>
			</defs>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="sun">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={SUN.x} cy={SUN.y} r={EARTH_R} fill="none" stroke={palette.axis} strokeWidth={3} strokeDasharray="10 10" />
							<circle cx={SUN.x} cy={SUN.y} r={MARS_R} fill="none" stroke={palette.axis} strokeWidth={3} strokeDasharray="10 10" />
							<circle cx={SUN.x} cy={SUN.y} r={40} fill={palette.brand} />
							{text(SUN.x, SUN.y + 70, visual.sunLabel)}
						</g>
					)}
				</Part>
				<Part id="sightline">
					{(look) => (
						<g opacity={look.opacity} clipPath="url(#retrograde-left)">
							<line x1={earth.x} y1={earth.y} x2={far.x} y2={far.y} stroke={palette.lessonDeep} strokeWidth={4} strokeDasharray="14 10" />
						</g>
					)}
				</Part>
				<Part id="earth">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={earth.x} cy={earth.y} r={22} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
							{text(...outward(earth, 50), visual.earthLabel, 'middle', fontSize * 0.85)}
						</g>
					)}
				</Part>
				<Part id="mars">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={mars.x} cy={mars.y} r={18} fill={palette.lessonDeep} stroke={palette.ink} strokeWidth={4} />
							{text(...outward(mars, 48), visual.marsLabel, 'middle', fontSize * 0.85)}
						</g>
					)}
				</Part>
				<Part id="sky">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={SKY.left} y={SKY.top} width={SKY.right - SKY.left} height={SKY.bottom - SKY.top} rx={24} fill={palette.ink} opacity={0.88} />
							{Array.from({length: 28}, (_, index) => (
								<circle
									key={index}
									cx={SKY.left + 30 + ((index * 271) % (SKY.right - SKY.left - 60))}
									cy={SKY.top + 20 + ((index * 97) % (SKY.bottom - SKY.top - 40))}
									r={index % 3 === 0 ? 3.5 : 2}
									fill={palette.surface}
									opacity={0.75}
								/>
							))}
							{visible.map((dot, index) => (
								<circle key={index} cx={dot.x} cy={dot.y} r={6} fill={dot.back ? palette.brand : palette.lesson} opacity={0.9} />
							))}
							{now && now.x >= SKY.left && now.x <= SKY.right ? <circle cx={now.x} cy={now.y} r={14} fill={palette.surface} stroke={palette.brand} strokeWidth={5} /> : null}
							{text((SKY.left + SKY.right) / 2, SKY.top - 50, visual.skyLabel)}
							{text(SKY.right - 20, SKY.bottom + 44, `${visual.forwardLabel} →`, 'end', fontSize * 0.8)}
						</g>
					)}
				</Part>
				<Part id="retro">
					{(look) =>
						retroAt && retroAt.x >= SKY.left && retroAt.x <= SKY.right ? (
							<g opacity={look.opacity * clamp01(backward.length / 4)}>
								<line x1={retroAt.x} y1={retroAt.y + 26} x2={retroAt.x} y2={SKY.bottom + 70} stroke={palette.brand} strokeWidth={4} />
								{text(retroAt.x, SKY.bottom + 100, visual.retroLabel, 'middle', fontSize * 0.85)}
							</g>
						) : null
					}
				</Part>
			</g>
		</svg>
	);
};
