import React from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import type {VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, Drift, Grass, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Rocks breaking where they stand and coming down the slope, side by side: water in a crack freezes at night and
 * wedges it open until a block splits off (frost); a desert boulder heats by day and cools by night until its skin
 * peels in shells (temperature); in a warm, wet place rock rots into red clay under the rain (chemical); loose blocks
 * fall from a rock face and pile up as scree; and soaked fine debris flows down the slope as mud.
 */

const BASE = 540;
const PLATEAU = 230;
const FOOT = 1000;
const TOP = 1300;
const FROST = {x: 190, half: 120, top: 330};
const BOULDER = {x: 490, rx: 120, ry: 92};
const ROTTING = {x: 760, half: 90, top: 400};

const COLOURS = {
	rock: '#9E968C',
	rockDark: '#7B746B',
	desert: '#C79766',
	clay: '#B5583A',
	ground: '#C8B08A',
	grassy: '#8DB86A',
	mud: '#7E5A38',
	ice: '#DFF3FF',
	water: '#5A97CF',
};

const FRAMING: Record<string, CameraBox> = {
	don: [40, 250, 360, 570],
	sicaklik: [330, 250, 660, 570],
	kimyasal: [600, 250, 920, 570],
	kaya: [930, 170, 1400, 590],
	camur: [820, 170, 1380, 600],
};

const ground = (x: number): number => {
	if (x <= FOOT) return BASE + 3 * Math.sin(x / 60);
	if (x >= TOP) return PLATEAU + 4 * Math.sin(x / 50);
	const t = (x - FOOT) / (TOP - FOOT);
	return lerp(BASE, PLATEAU, smoothStep(t) * 0.7 + 0.3 * smoothStep(clamp01((t - 0.55) / 0.3)));
};

export const WeatheringProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const clock = useProcessClock('weathering', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	// Day and night come and go while frost and heat work.
	const cycle = (time * 0.35) % 1;
	const night = clock.current === 'don' || clock.current === 'sicaklik' ? smoothStep(clamp01((cycle - 0.4) / 0.12)) * (1 - smoothStep(clamp01((cycle - 0.88) / 0.12))) : 0;
	const frost = smooth(amount('don'));
	const crackWidth = 2 + 16 * frost;
	const split = smoothStep(clamp01((amount('don') - 0.8) / 0.2));
	const peel = smooth(amount('sicaklik'));
	const rot = smooth(amount('kimyasal'));
	const fall = amount('kaya');
	const mud = clock.current === 'camur' ? smooth(clamp01(clock.progress * 1.3)) : amount('camur');
	const rain = {kimyasal: 0.6, camur: 1}[clock.current] ?? 0;

	const groundPath = pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 5), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	// Blocks falling from the rock face, bouncing down to the foot, piling as scree.
	const slopePath: Point[] = sampled((x) => ground(x) - 10, 1215, FOOT - 30, 15);
	const blocks = Array.from({length: 6}, (_, index) => {
		const start = index * 0.13;
		const progress = clamp01((fall - start) / 0.3);
		const [x, y] = progress > 0 ? pointOnPath(slopePath, progress) : [1215 + 10 * noise(index), ground(1215) - 40 - 14 * index];
		const bounce = progress > 0 && progress < 1 ? 26 * Math.abs(Math.sin(progress * Math.PI * 3)) : 0;
		const rest: Point = [FOOT - 44 + 22 * noise(index * 3) + (index % 3) * 10, BASE - 8 - 12 * Math.floor(index / 3)];
		return {x: progress >= 1 ? rest[0] : x, y: progress >= 1 ? rest[1] : y - bounce, angle: progress * 540 * (noise(index) + 0.3), shown: index * 0.13 <= fall || fall >= 1};
	});
	const scree = clamp01(fall * 1.2);
	// The mud tongue: down the slope and out over the flat.
	const mudFront = lerp(1240, 860, mud);
	const mudPath = mud > 0.01 ? smoothPath([...sampled((x) => ground(x) - 22 - 16 * Math.exp(-(((x - mudFront - 30) / 46) ** 2)) - 4 * Math.sin(x / 20 - time * 3), 1240, mudFront, 8), [mudFront - 14, ground(mudFront) - 6], ...sampled((x) => ground(x) + 1, mudFront, 1240, 8)], true) : '';

	return (
		<ProcessFrame process="weathering" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			<rect x={SCENE.left - 200} y={SCENE.top - 200} width={2000} height={1000} fill="#1C2A44" opacity={night * 0.55} />
			{/* Sun by day, moon by night. */}
			<g opacity={clock.current === 'don' || clock.current === 'sicaklik' ? 1 : 0}>
				<circle cx={clock.current === 'don' ? 300 : 600} cy={290} r={20} fill="#FFD25A" opacity={1 - night} />
				<path d={`M${clock.current === 'don' ? 300 : 600} 270 a20 20 0 1 0 14 34 a16 16 0 1 1 -14 -34 z`} fill="#F2F4F8" opacity={night} />
			</g>
			<g opacity={clamp01(rain * 1.4)}>
				<Cloud x={780} y={300} scale={0.8} dark={0.5} />
				<Cloud x={1150} y={140} scale={1.1} dark={0.6} />
			</g>
			<Rain x0={640} x1={SCENE.right} top={SCENE.top} ground={ground} time={time} amount={rain} count={80} />
			<path d={groundPath} fill={COLOURS.ground} />
			<path d={pathOf([...sampled(ground, 560, SCENE.right + 120, 6), ...sampled((x) => ground(x) + 8, SCENE.right + 120, 560, 6)], true)} fill={COLOURS.grassy} />
			{/* Frost: a crack with water that freezes at night and wedges it open. */}
			<g>
				<path d={pathOf([[FROST.x - FROST.half, BASE + 4], [FROST.x - FROST.half + 10, FROST.top + 20], [FROST.x - 30, FROST.top], [FROST.x - crackWidth / 2, FROST.top + 2], [FROST.x - crackWidth / 2 - 4, FROST.top + 150], [FROST.x - 2, BASE + 4]], true)} fill={COLOURS.rock} stroke={COLOURS.rockDark} strokeWidth={2} />
				<g transform={`rotate(${split * 14} ${FROST.x + FROST.half} ${BASE})`}>
					<path d={pathOf([[FROST.x + crackWidth / 2, FROST.top + 2], [FROST.x + 40, FROST.top - 4], [FROST.x + FROST.half - 10, FROST.top + 26], [FROST.x + FROST.half, BASE + 4], [FROST.x + 2, BASE + 4], [FROST.x + crackWidth / 2 + 4, FROST.top + 150]], true)} fill={COLOURS.rock} stroke={COLOURS.rockDark} strokeWidth={2} />
				</g>
				<path d={pathOf([[FROST.x - crackWidth / 2, FROST.top + 6], [FROST.x + crackWidth / 2, FROST.top + 6], [FROST.x + crackWidth / 2 + 2, FROST.top + 140], [FROST.x - crackWidth / 2 - 2, FROST.top + 140]], true)} fill={night > 0.5 ? COLOURS.ice : COLOURS.water} opacity={frost > 0.02 ? 0.95 : 0} />
				{/* Ice pushes the walls apart. */}
				<g opacity={night * clock.now('don')} stroke="#2F6A9F" strokeWidth={3} fill="none">
					<path d={`M${FROST.x - 14} ${FROST.top + 70} l-22 0 m8 -8 l-8 8 l8 8`} />
					<path d={`M${FROST.x + 14} ${FROST.top + 70} l22 0 m-8 -8 l8 8 l-8 8`} />
				</g>
			</g>
			{/* Heat and cold: the boulder swells and shrinks; its skin peels off in shells. */}
			<g>
				<ellipse cx={BOULDER.x} cy={BASE - BOULDER.ry + 6} rx={BOULDER.rx * (1 + 0.015 * (1 - night))} ry={BOULDER.ry * (1 + 0.015 * (1 - night))} fill={COLOURS.desert} stroke="#94683E" strokeWidth={2} />
				{[0.82, 0.64].map((share, index) => (
					<ellipse key={share} cx={BOULDER.x} cy={BASE - BOULDER.ry + 6} rx={BOULDER.rx * share} ry={BOULDER.ry * share} fill="none" stroke="#A9784B" strokeWidth={2} opacity={0.5 + 0.5 * peel} strokeDasharray={index ? '12 6' : '18 8'} />
				))}
				<ellipse cx={BOULDER.x} cy={BASE - BOULDER.ry + 6} rx={BOULDER.rx} ry={BOULDER.ry} fill={night > 0.5 ? '#5B8FD0' : '#F08A3C'} opacity={0.22 * clock.now('sicaklik')} />
				{Array.from({length: 7}, (_, index) => {
					const angle = Math.PI * (0.15 + 0.7 * noise(index * 2.3)) + Math.PI;
					const drop = clamp01(peel * 1.4 - index * 0.12);
					const x0 = BOULDER.x + Math.cos(angle) * BOULDER.rx;
					const y0 = BASE - BOULDER.ry + 6 + Math.sin(angle) * BOULDER.ry;
					const x = lerp(x0, x0 + (x0 > BOULDER.x ? 30 : -30), drop);
					const y = lerp(y0, BASE - 4, drop * drop);
					return drop > 0 ? <path key={index} d={`M${x - 12} ${y} q12 -10 24 0`} stroke="#94683E" strokeWidth={5} fill="none" strokeLinecap="round" transform={`rotate(${drop * 60 * (noise(index) - 0.5)} ${x} ${y})`} /> : null;
				})}
			</g>
			{/* Chemical: under warm rain the rock rots to red clay. */}
			<g>
				<path d={smoothPath([[ROTTING.x - ROTTING.half, BASE + 2], [ROTTING.x - ROTTING.half + 20, ROTTING.top + 30], [ROTTING.x, ROTTING.top], [ROTTING.x + ROTTING.half - 20, ROTTING.top + 26], [ROTTING.x + ROTTING.half, BASE + 2]], true)} fill={rot > 0.5 ? '#A86B4E' : COLOURS.rock} stroke={COLOURS.rockDark} strokeWidth={2} />
				<path d={pathOf([...sampled((x) => ground(x) + 2, ROTTING.x - 160, ROTTING.x + 160, 8), ...sampled((x) => ground(x) + 10 + 60 * rot * Math.exp(-(((x - ROTTING.x) / 130) ** 2)), ROTTING.x + 160, ROTTING.x - 160, 8)], true)} fill={COLOURS.clay} opacity={0.85} />
				{Array.from({length: 16}, (_, index) => {
					const x = ROTTING.x - 60 + noise(index * 2.1) * 120;
					const y = ROTTING.top + 30 + noise(index * 3.7) * 90;
					return <circle key={index} cx={x} cy={y + rot * 20 * noise(index)} r={2.5 + 2 * noise(index)} fill={COLOURS.clay} opacity={rot} />;
				})}
				<Tree x={ROTTING.x - 130} y={ground(ROTTING.x - 130) + 2} size={1} />
				<Tree x={ROTTING.x + 140} y={ground(ROTTING.x + 140) + 2} size={0.9} />
			</g>
			{/* The rock face, the falling blocks, the scree cone at the foot. */}
			<path d={pathOf([[1170, ground(1170) + 2], [1190, 300], [1235, 262], [1262, ground(1262) + 2]], true)} fill={COLOURS.rockDark} />
			<path d={`M${FOOT - 90} ${BASE + 2} Q${FOOT - 20} ${BASE - 46 * scree} ${FOOT + 60} ${ground(FOOT + 60) + 2} Z`} fill={COLOURS.rock} opacity={scree} />
			{blocks.map((block, index) =>
				block.shown ? <rect key={index} x={-12} y={-10} width={24 + 6 * noise(index)} height={20} rx={4} fill={COLOURS.rock} stroke={COLOURS.rockDark} strokeWidth={1.5} transform={`translate(${block.x} ${block.y}) rotate(${block.angle})`} /> : null,
			)}
			{/* Mud flowing down and out, carrying stones. */}
			{mudPath ? <path d={mudPath} fill={COLOURS.mud} stroke="#5C3F25" strokeWidth={2} /> : null}
			<Drift points={sampled((x) => ground(x) - 10, 1230, Math.min(1229, mudFront + 10), 20)} time={time} count={10} colour="#4E3A28" size={5} speed={0.12} spread={3} amount={mud} />
			<Grass ground={ground} x0={560} x1={FOOT - 100} count={10} seed={4} />
			<ProcessLabel id="don" at={[FROST.x, FROST.top + 60]} to={[FROST.x - 20, 280]} text="Donan su çatlağı açar" show={clock.now('don')} />
			<ProcessLabel id="catlak" at={[FROST.x + 30, FROST.top + 40]} to={[FROST.x + 90, 300]} text="Kaya yarılır" show={clock.now('don') * split} size={22} />
			<ProcessLabel id="sicaklik" at={[BOULDER.x - BOULDER.rx * 0.7, BASE - BOULDER.ry * 1.6]} to={[BOULDER.x - 40, 300]} text="Kabuk kabuk dökülür" show={clock.now('sicaklik')} />
			<ProcessLabel id="kimyasal" at={[ROTTING.x, ROTTING.top + 40]} to={[ROTTING.x, 320]} text="Kaya ufalanıp kile döner" show={clock.now('kimyasal')} />
			<ProcessLabel id="kaya" at={[1200, 300]} to={[1100, 230]} text="Kaya düşmesi" show={clock.now('kaya')} />
			<ProcessLabel id="moloz" at={[FOOT - 20, BASE - 30 * scree]} to={[FOOT - 140, 430]} text="Köşeli moloz" show={clock.now('kaya') * scree} />
			<ProcessLabel id="camur" at={[Math.max(mudFront + 40, 900), ground(Math.max(mudFront + 40, 900)) - 12]} to={[960, 420]} text="Çamur akıntısı" show={clock.now('camur') * clamp01(mud * 3)} />
		</ProcessFrame>
	);
};

const pointOnPath = (points: readonly Point[], share: number): Point => {
	const index = Math.min(points.length - 2, Math.floor(share * (points.length - 1)));
	const t = share * (points.length - 1) - index;
	return [lerp(points[index][0], points[index + 1][0], t), lerp(points[index][1], points[index + 1][1], t)];
};
