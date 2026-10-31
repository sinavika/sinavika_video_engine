import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {ProcessFrame, ProcessLabel, SCENE, SceneTag, processCamera, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The greenhouse effect: short-wave sunlight passes through the air and warms the ground; clouds, ice and snow
 * send part of it back to space (albedo); the warm ground gives the energy off as long-wave heat; water vapour,
 * carbon dioxide and methane take that heat up and send part of it back down (without them the Earth would be about
 * −18 °C instead of 15 °C); more gas from fossil fuels traps more heat, the ice shrinks and the Earth warms.
 */

const GROUND = 520;
const SPACE = 150;
const SUN: Point = [150, 112];
/** Where the sunlight lands (the rays are parallel, coming in from the upper left), and which end on the ice. */
const RAYS = [420, 560, 700, 840, 980, 1120, 1260];
const ICE: [number, number] = [380, 620];
const THERMOMETER: Point = [1480, 250];

const FRAMING: Record<string, CameraBox> = {
	gunes: [40, 72, 1100, 640],
	yansima: [200, 72, 1000, 640],
	yayma: [500, 160, 1400, 640],
	tutma: [460, 72, 1560, 640],
	artis: undefined,
};

/** The surface temperature the thermometer reads: −18 °C before the gases act, 15 °C with them, warmer as they grow. */
export const surfaceTemperature = (trapped: number, extra: number) => lerp(-18, 15, trapped) + 1.2 * extra;

/** A wavy arrow of heat from one point to another; `phase` 0–1 moves the waves along. */
const HeatRay: React.FC<{from: Point; to: Point; phase: number; opacity: number; colour?: string}> = ({from, to, phase, opacity, colour = '#E4572E'}) => {
	const [x0, y0] = from;
	const [x1, y1] = to;
	const length = Math.hypot(x1 - x0, y1 - y0);
	const [ux, uy] = [(x1 - x0) / length, (y1 - y0) / length];
	const points: Point[] = Array.from({length: 41}, (_, index) => {
		const t = index / 40;
		const wave = 10 * Math.sin(t * length * 0.09 - phase * 2 * Math.PI);
		return [x0 + ux * length * t - uy * wave, y0 + uy * length * t + ux * wave];
	});
	const [ax, ay] = points[points.length - 1];
	return (
		<g opacity={opacity}>
			<path d={pathOf(points)} fill="none" stroke={colour} strokeWidth={4} strokeLinecap="round" />
			<path d={`M${ax} ${ay} l${-ux * 16 - uy * 9} ${-uy * 16 + ux * 9} M${ax} ${ay} l${-ux * 16 + uy * 9} ${-uy * 16 - ux * 9}`} stroke={colour} strokeWidth={4} strokeLinecap="round" />
		</g>
	);
};

/** A straight ray of sunlight with dashes running along it. */
const LightRay: React.FC<{from: Point; to: Point; time: number; opacity: number}> = ({from, to, time, opacity}) => (
	<g opacity={opacity}>
		<line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="#F2B705" strokeWidth={5} strokeLinecap="round" />
		<line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="#FFF6C8" strokeWidth={2.5} strokeDasharray="14 22" strokeDashoffset={-time * 120} />
	</g>
);

/** A greenhouse gas molecule (CO₂). */
const Gas: React.FC<{x: number; y: number; glow: number}> = ({x, y, glow}) => (
	<g transform={`translate(${x} ${y})`}>
		{glow > 0.01 ? <circle r={20} fill="#E4572E" opacity={0.25 * glow} /> : null}
		<circle cx={-11} cy={0} r={7} fill="#E4572E" />
		<circle cx={11} cy={0} r={7} fill="#E4572E" />
		<circle cx={0} cy={0} r={8} fill="#3A3A3A" />
	</g>
);

export const GreenhouseProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('greenhouse', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const sunlight = clock.current === 'gunes' ? 1 : 0.55;
	const reflect = smooth(amount('yansima'));
	const emit = smooth(amount('yayma'));
	const trap = smooth(amount('tutma'));
	const extra = smooth(amount('artis'));
	// More gas as it grows; the ice shrinks as the Earth warms.
	const gasCount = Math.round(9 + 13 * extra);
	const iceShare = 1 - 0.55 * extra;
	const [iceLeft, iceRight] = [ICE[0], lerp(ICE[0], ICE[1], iceShare)];
	const temperature = surfaceTemperature(trap, extra);
	const level = clamp01((temperature + 20) / 42);

	return (
		<ProcessFrame process="greenhouse" clock={clock} camera={camera} width={width} height={height} backdrop="#D6E9F6">
			{/* Space, the air and the ground: ice, sea, fields and a town with factories. */}
			<rect x={SCENE.left - 100} y={SCENE.top - 100} width={1800} height={SPACE - SCENE.top + 100} fill="#13213A" />
			{Array.from({length: 30}, (_, index) => (
				<circle key={index} cx={SCENE.left + noise(index * 3.7) * 1520} cy={SCENE.top + 6 + noise(index * 9.1) * (SPACE - SCENE.top - 12)} r={1.6} fill="#FFFFFF" opacity={0.7} />
			))}
			<rect x={SCENE.left - 100} y={SPACE} width={1800} height={GROUND - SPACE} fill="#CFE6F7" />
			<rect x={SCENE.left - 100} y={GROUND} width={1800} height={300} fill="#7FAF5C" />
			<rect x={ICE[1]} y={GROUND} width={300} height={300} fill="#4F95DA" />
			<path
				d={pathOf(
					[
						[iceLeft, GROUND],
						[iceRight, GROUND],
						[iceRight - 20, GROUND - 26],
						[iceLeft + 20, GROUND - 30],
					],
					true,
				)}
				fill="#F4F9FD"
				stroke="#CFE0EE"
				strokeWidth={2}
			/>
			<g transform={`translate(1060 ${GROUND})`}>
				{[0, 50, 100].map((x, index) => (
					<rect key={x} x={x - 20} y={-50 - 20 * index} width={40} height={50 + 20 * index} fill="#8A8F96" />
				))}
				<rect x={150} y={-130} width={22} height={130} fill="#6E737A" />
				{Array.from({length: 5}, (_, index) => {
					const phase = (time * 0.35 + index / 5) % 1;
					return <circle key={index} cx={161 + 40 * phase} cy={-140 - 120 * phase} r={10 + 22 * phase} fill="#9AA0A6" opacity={(0.3 + 0.6 * extra) * (1 - phase)} />;
				})}
			</g>
			<circle cx={SUN[0]} cy={SUN[1]} r={46} fill="#FFD25A" />
			{/* Incoming sunlight; the rays that land on the ice are sent back to space. */}
			{RAYS.map((x, index) => {
				const onIce = x >= iceLeft && x <= iceRight;
				return (
					<g key={x}>
						<LightRay from={[x - 300, SCENE.top - 10]} to={[x, GROUND - 4]} time={time + index * 0.2} opacity={sunlight} />
						{onIce ? <LightRay from={[x, GROUND - 30]} to={[x + 160, SPACE - 40]} time={time + index * 0.2} opacity={reflect * (clock.current === 'yansima' ? 1 : 0.6)} /> : null}
					</g>
				);
			})}
			{/* The greenhouse gases in the air. */}
			{Array.from({length: gasCount}, (_, index) => (
				<Gas
					key={index}
					x={560 + noise(index * 2.9) * 900 + 14 * Math.sin(time * 0.5 + index)}
					y={SPACE + 70 + noise(index * 6.3) * 190 + 8 * Math.cos(time * 0.4 + index)}
					glow={trap * (0.5 + 0.5 * Math.sin(time * 3 + index))}
				/>
			))}
			{/* Heat going up from the warm ground: some escapes, some is taken by the gases and sent back down. */}
			{[640, 820, 1000, 1180].map((x, index) => {
				const caught = trap > 0.05 && index < 2 + Math.round(2 * extra);
				const top = caught ? SPACE + 150 + 30 * (index % 2) : SPACE - 30;
				return (
					<g key={x}>
						<HeatRay from={[x, GROUND - 10]} to={[x + 40, top]} phase={(time * 0.8 + index * 0.3) % 1} opacity={emit} />
						{caught ? <HeatRay from={[x + 60, top + 10]} to={[x + 100, GROUND - 20]} phase={(time * 0.8 + index * 0.3) % 1} opacity={trap} /> : null}
					</g>
				);
			})}
			{/* The thermometer: the ground's mean temperature. */}
			<g transform={`translate(${THERMOMETER[0]} ${THERMOMETER[1]})`} opacity={clamp01(trap * 2 + extra)}>
				<rect x={-16} y={-120} width={32} height={230} rx={16} fill="#FFFFFF" stroke={withAlpha(palette.ink, 0.35)} strokeWidth={3} />
				<rect x={-8} y={100 - 200 * level} width={16} height={200 * level} rx={8} fill="#E4572E" />
				<circle cx={0} cy={118} r={22} fill="#E4572E" />
			</g>
			<g opacity={clamp01(trap * 2 + extra)}>
				<SceneTag
					x={THERMOMETER[0] - 30}
					y={THERMOMETER[1] + 160}
					text={`${temperature >= 0 ? '' : '−'}${Math.abs(temperature)
						.toFixed(temperature > 14 ? 1 : 0)
						.replace('.', ',')} °C`}
					anchor="middle"
					size={24}
				/>
			</g>
			<ProcessLabel id="gunes" at={[700, 330]} to={[600, 240]} text="Kısa dalga Güneş ışığı" show={clock.now('gunes')} />
			<ProcessLabel id="albedo" at={[(iceLeft + iceRight) / 2, GROUND - 30]} to={[300, 400]} text="Buz ve kar ışığı yansıtır: albedo" show={clock.now('yansima')} anchor="start" size={23} />
			<ProcessLabel id="yayma" at={[820, GROUND - 60]} to={[900, 470]} text="Yeryüzü uzun dalga ısı yayar" show={clock.now('yayma')} anchor="start" size={23} />
			<ProcessLabel id="gazlar" at={[900, SPACE + 160]} to={[760, SPACE + 30]} text="Sera gazları ısıyı tutup geri yollar" show={clock.now('tutma')} size={23} />
			<ProcessLabel
				id="termometre"
				at={[THERMOMETER[0], THERMOMETER[1] - 60]}
				to={[1300, 200]}
				text="Sera etkisi olmasa −18 °C"
				show={clock.now('tutma') * clamp01(1 - trap * 1.5 + 0.4)}
				anchor="end"
				size={22}
			/>
			<ProcessLabel id="artis" at={[1221, GROUND - 160]} to={[1180, 300]} text="Fosil yakıt: daha çok sera gazı" show={clock.now('artis')} size={23} />
			<ProcessLabel id="buzul" at={[(iceLeft + iceRight) / 2, GROUND - 20]} to={[420, 420]} text="Buz erir, yansıma azalır" show={clock.now('artis') * extra} size={22} />
		</ProcessFrame>
	);
};
