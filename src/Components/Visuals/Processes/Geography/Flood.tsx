import React from 'react';
import {clamp01, lerp, smooth} from '../../../../Animations/Motion';
import type {VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, Drift, FlowLine, Grass, House, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * A flash flood across a valley: a downpour on bare slopes that cannot hold the water, sheets of it running down
 * into the stream, the stream rising in minutes and carrying logs and debris, then spilling out of its bed over the
 * flat land, where houses built in the stream bed go under while the house up on the terrace stays dry.
 */

const PLAIN = 520;
const CHANNEL = {x: 810, half: 58, depth: 42};
const LEVEL = {normal: 548, full: 518, flood: 462};
const BED_HOUSES = [690, 935];
const SAFE_HOUSE = 1235;

const ground = (x: number): number => {
	if (x < 540) return lerp(190, PLAIN, clamp01((x - SCENE.left) / (540 - SCENE.left)) ** 0.8);
	if (x > 1110) {
		if (x < 1320) return lerp(PLAIN, 420, clamp01((x - 1110) / 70));
		return lerp(420, 210, clamp01((x - 1320) / 240) ** 0.9);
	}
	const d = (x - CHANNEL.x) / CHANNEL.half;
	return PLAIN + (Math.abs(d) < 1 ? CHANNEL.depth * (1 - d * d) : 0);
};

const FRAMING: Record<string, CameraBox> = {
	saganak: undefined,
	sel: [500, 300, 1120, 600],
	taskin: [460, 260, 1340, 600],
};

export const FloodProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const clock = useProcessClock('flood', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const downpour = smooth(clamp01(amount('saganak') * 2));
	const rise = smooth(amount('sel'));
	const spill = smooth(amount('taskin'));
	const level = lerp(lerp(LEVEL.normal, LEVEL.full, rise), LEVEL.flood, spill);
	const rain = clock.current === 'saganak' ? 0.4 + 0.6 * downpour : clock.current === 'sel' ? 1 : 0.7;
	const muddy = clamp01(rise * 1.5);

	const groundPath = pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 5), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	const water = pathOf([...sampled((x) => Math.min(level + 2 * Math.sin(x / 18 - time * 4), ground(x)), 520, 1180, 4), ...sampled(ground, 1180, 520, 4)], true);

	return (
		<ProcessFrame process="flood" clock={clock} camera={camera} width={width} height={height}>
			<Sky colourTop="#9FB2C2" colourBottom="#E3EAF0" />
			<Cloud x={300} y={120} scale={1.2} dark={0.7} />
			<Cloud x={760} y={104} scale={1.4} dark={0.75} />
			<Cloud x={1240} y={118} scale={1.2} dark={0.7} />
			<Rain x0={SCENE.left} x1={SCENE.right} top={SCENE.top - 20} ground={ground} time={time} amount={rain} count={130} slant={0.22} />
			<path d={groundPath} fill="#B08F68" />
			<path d={pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 5), ...sampled((x) => ground(x) + 10, SCENE.right + 120, SCENE.left - 120, 5)], true)} fill="#8E7350" />
			{/* Runoff down the bare slopes into the stream. */}
			<g opacity={Math.max(downpour, rise) * (1 - spill * 0.6)}>
				{[0, 1, 2].map((index) => (
					<FlowLine key={`l${index}`} d={smoothPath(sampled((x) => ground(x) - 3 - index * 2, 80 + index * 70, 560, 20))} time={time} width={4} colour="#8E6B45" speed={90} />
				))}
				{[0, 1].map((index) => (
					<FlowLine key={`r${index}`} d={smoothPath(sampled((x) => ground(x) - 3, 1520 - index * 60, 1330, 20))} time={time} width={4} colour="#8E6B45" speed={90} />
				))}
			</g>
			{/* The houses: two in the stream bed, one on the terrace above it. */}
			{BED_HOUSES.map((x) => (
				<House key={x} x={x} y={PLAIN} size={1.1} />
			))}
			<House x={SAFE_HOUSE} y={ground(SAFE_HOUSE)} size={1.1} />
			<Tree x={1180} y={ground(1180)} size={0.9} />
			<Tree x={600} y={ground(600)} size={0.85} />
			{/* The stream: clear and low, then brown and rising, then over its banks. */}
			<path d={water} fill={muddy > 0.4 ? '#8C6A45' : '#5A97CF'} opacity={0.92} />
			<path d={pathOf(sampled((x) => level + 2 * Math.sin(x / 18 - time * 4), Math.max(520, CHANNEL.x - (level < PLAIN ? 300 : CHANNEL.half)), Math.min(1180, CHANNEL.x + (level < PLAIN ? 330 : CHANNEL.half)), 6))} fill="none" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} strokeDasharray="14 18" strokeDashoffset={-time * 60} />
			{/* Logs and debris carried along. */}
			<Drift points={[[CHANNEL.x - 280 * spill - 40, level + 4], [CHANNEL.x + 300 * spill + 40, level + 4]]} time={time} count={9} amount={rise} colour="#5B4630" size={6} speed={0.25} spread={2} />
			<Grass ground={ground} x0={SCENE.left} x1={500} count={6} seed={2} opacity={0.6} />
			<ProcessLabel id="saganak" at={[300, ground(300) - 6]} to={[300, 230]} text="Çıplak yamaç suyu tutamaz" show={clock.now('saganak')} />
			<ProcessLabel id="sel" at={[CHANNEL.x, level + 10]} to={[CHANNEL.x, 360]} text="Su dakikalar içinde yükselir" show={clock.now('sel')} />
			<ProcessLabel id="yatak" at={[BED_HOUSES[0], PLAIN - 40]} to={[620, 330]} text="Dere yatağına yapılan ev" show={clock.now('taskin')} />
			<ProcessLabel id="taskin" at={[SAFE_HOUSE, ground(SAFE_HOUSE) - 40]} to={[SAFE_HOUSE, 300]} text="Taşkın ovası dışındaki ev kuru" show={clock.now('taskin') * clamp01(spill * 2)} size={22} />
		</ProcessFrame>
	);
};
