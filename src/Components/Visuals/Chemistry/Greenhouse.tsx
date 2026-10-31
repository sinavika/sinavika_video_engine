import React from 'react';
import {clamp01, lerp} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Greenhouse = Extract<CourseVisual, {kind: 'greenhouse'}>;

/** The stage (CourseVisual keeps this ratio). */
export const GREENHOUSE_STAGE = {width: 1600, height: 760};

const GROUND = 640;
const BAND = {top: 210, bottom: 470};
const SUN = {x: 170, y: 110, r: 70};
const LIGHT_LANES = [430, 610, 790, 970, 1150];
const IR_LANES = [500, 680, 860, 1040, 1220, 1400];
const MOLECULE_Y = [300, 380, 330, 400, 290, 360];
const PERIOD = 3.2;
const SUNLIGHT = '#F2B632';
const INFRARED = '#E5484D';

/** How many of the six infrared lanes have a greenhouse molecule in them: the share of heat sent back down. */
export const trappedLanes = (gases: number): number => Math.max(0, Math.min(IR_LANES.length, Math.round(gases)));

/** The thermometer's fill (0–1): it rises with the share of infrared sent back to the ground. */
export const warmth = (gases: number): number => 0.3 + (0.6 * trappedLanes(gases)) / IR_LANES.length;

/** A short wavy packet of light from (x, y) along the angle, `length` long. */
const wave = (x: number, y: number, angle: number, length = 70) => {
	const points = Array.from({length: 25}, (_, index) => {
		const s = (index / 24) * length;
		const side = Math.sin((index / 24) * Math.PI * 6) * 9;
		return [x + Math.cos(angle) * s - Math.sin(angle) * side, y + Math.sin(angle) * s + Math.cos(angle) * side];
	});
	return points.map(([px, py], index) => `${index ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
};

/**
 * Chemistry, geography: the greenhouse effect. Sunlight (short waves) passes through the atmosphere and warms the
 * ground; the ground sends infrared up. Without greenhouse gases it escapes to space; with them (`gases`: 0–6 lanes,
 * from the beat that shows `trapped`) the molecules absorb it, shake and send it back down, and the thermometer
 * rises. Parts: sun, light, ground, infrared, gases, trapped (a cue, nothing drawn), thermometer.
 */
export const GreenhouseVisual: React.FC<VisualBoxProps & {visual: Greenhouse}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / GREENHOUSE_STAGE.width, height / GREENHOUSE_STAGE.height);
	const ox = (width - GREENHOUSE_STAGE.width * k) / 2;
	const oy = (height - GREENHOUSE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	// Without a beat that shows `trapped` the gases trap from the start; with one, from that beat on.
	const trappedAt = useBeatStartFor('trapped', 'show');
	const trapping = !visual.motion || trappedAt === undefined || seconds >= trappedAt;
	const warming = !visual.motion || trappedAt === undefined ? 1 : clamp01((seconds - trappedAt) / 2);
	const lanes = trappedLanes(visual.gases);
	const t = visual.motion ? seconds - delaySeconds : 1.2;
	const labelSize = Math.max(34, 22 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'start', size = labelSize, fill = palette.ink) => (
		<text x={x} y={y} fill={fill} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={6} paintOrder="stroke">
			{value}
		</text>
	);
	const phase = (index: number) => ((((t + index * 0.55) % PERIOD) + PERIOD) % PERIOD) / PERIOD;
	const molecule = (x: number, y: number, shake: number, key: number) => (
		<g key={key} transform={`translate(${x + Math.sin(t * 40 + key) * 5 * shake} ${y}) rotate(${Math.sin(t * 25 + key) * 12 * shake})`}>
			<line x1={-34} y1={0} x2={34} y2={0} stroke={palette.ink} strokeWidth={5} />
			<circle cx={-34} cy={0} r={17} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
			<circle cx={34} cy={0} r={17} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
			<circle cx={0} cy={0} r={15} fill={palette.ink} />
		</g>
	);
	const fill = lerp(warmth(0), warmth(visual.gases), trapping ? warming : 0);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<rect x={0} y={BAND.top} width={GREENHOUSE_STAGE.width - 140} height={BAND.bottom - BAND.top} rx={30} fill={mixColors(palette.lesson, palette.surface, 0.88)} />
				{text(30, BAND.top + 34, visual.atmosphereLabel, 'start', labelSize * 0.85, palette.muted)}
				<Part id="sun">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={SUNLIGHT} />
							{text(SUN.x + SUN.r + 20, SUN.y - 20, visual.sunLabel)}
						</g>
					)}
				</Part>
				<Part id="ground">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={0} y={GROUND} width={GREENHOUSE_STAGE.width - 140} height={GREENHOUSE_STAGE.height - GROUND} fill={mixColors(palette.lessonDeep, palette.surface, 0.55)} />
							{text(30, GROUND + 60, visual.groundLabel, 'start', labelSize * 0.9)}
						</g>
					)}
				</Part>
				<Part id="light">
					{(look) => (
						<g opacity={look.opacity}>
							{LIGHT_LANES.map((x, index) => {
								const angle = Math.atan2(GROUND - SUN.y, x - SUN.x);
								const total = Math.hypot(GROUND - SUN.y, x - SUN.x) - SUN.r - 70;
								const s = SUN.r + phase(index) * total;
								return <path key={index} d={wave(SUN.x + Math.cos(angle) * s, SUN.y + Math.sin(angle) * s, angle)} fill="none" stroke={SUNLIGHT} strokeWidth={6} strokeLinecap="round" />;
							})}
							{text(LIGHT_LANES[0] - 60, 175, visual.lightLabel, 'start', labelSize * 0.85)}
						</g>
					)}
				</Part>
				<Part id="gases">
					{(look) => (
						<g opacity={look.opacity}>
							{IR_LANES.slice(0, lanes).map((x, index) => {
								// A molecule shakes while it holds an infrared packet.
								const u = phase(index + 0.3);
								const shake = trapping && u > 0.4 && u < 0.6 ? 1 - Math.abs(u - 0.5) / 0.1 : 0;
								return molecule(x, MOLECULE_Y[index], clamp01(shake), index);
							})}
							{lanes > 0 ? text(IR_LANES[0] - 50, MOLECULE_Y[0] - 50, visual.gasLabel, 'start', labelSize * 0.85) : null}
						</g>
					)}
				</Part>
				<Part id="infrared">
					{(look) => (
						<g opacity={look.opacity}>
							{IR_LANES.map((x, index) => {
								const u = phase(index + 0.3);
								const caught = trapping && index < lanes;
								const my = MOLECULE_Y[index];
								if (!caught) return <path key={index} d={wave(x, lerp(GROUND - 10, -60, u), -Math.PI / 2)} fill="none" stroke={INFRARED} strokeWidth={6} strokeLinecap="round" />;
								// Up to the molecule, then sent back down at a slant.
								if (u < 0.45) return <path key={index} d={wave(x, lerp(GROUND - 10, my + 80, u / 0.45), -Math.PI / 2)} fill="none" stroke={INFRARED} strokeWidth={6} strokeLinecap="round" />;
								const back = (u - 0.45) / 0.55;
								const angle = Math.PI / 2 + (index % 2 ? 0.35 : -0.35);
								return (
									<path
										key={index}
										d={wave(x + Math.cos(angle) * back * (GROUND - my - 80), my + 20 + Math.sin(angle) * back * (GROUND - my - 80), angle)}
										fill="none"
										stroke={INFRARED}
										strokeWidth={6}
										strokeLinecap="round"
									/>
								);
							})}
							{text(IR_LANES[IR_LANES.length - 1] - 40, 160, visual.infraredLabel, 'end', labelSize * 0.85, INFRARED)}
						</g>
					)}
				</Part>
				<Part id="thermometer">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={1500} y={200} width={44} height={400} rx={22} fill={palette.surface} stroke={palette.ink} strokeWidth={4} />
							<rect x={1510} y={200 + 380 * (1 - fill)} width={24} height={380 * fill + 10} rx={12} fill={INFRARED} />
							<circle cx={1522} cy={630} r={40} fill={INFRARED} stroke={palette.ink} strokeWidth={4} />
							{visual.temperatureLabel ? text(1522, 160, visual.temperatureLabel, 'middle', labelSize * 0.85) : null}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
