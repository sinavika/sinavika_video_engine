import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf, Tag} from '../../VisualWorld';
import {Cloud, Drift, Grass, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, processCamera, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The nitrogen cycle on one field: nitrogen gas, most of the air, cannot be used by most living things. Lightning
 * and the bacteria in the root nodules of a legume bind it into the soil; soil bacteria turn ammonia into nitrite
 * and then nitrate (nitrification); plants take the nitrate up through their roots and animals eat the plants; the
 * dead and their waste decay back into ammonia; and other bacteria turn nitrate back into nitrogen gas
 * (denitrification), which returns to the air.
 */

const GROUND = 440;
const STORM: Point = [230, 150];
const LEGUME = 470;
const NODULES: Point[] = [
	[440, 500],
	[478, 528],
	[512, 494],
	[458, 548],
	[500, 556],
];
/** The soil lane where bacteria change ammonia to nitrite and nitrite to nitrate. */
const AMMONIA: Point = [650, 566];
const NITRITE: Point = [800, 566];
const NITRATE: Point = [950, 566];
const WHEAT = 1060;
const COW = 1220;
const DEAD: Point = [1420, GROUND];

const FRAMING: Record<string, CameraBox> = {
	tutulma: [40, 72, 780, 640],
	nitrifikasyon: [420, 380, 1120, 640],
	ozumleme: [820, 180, 1400, 640],
	ayristirma: [560, 300, 1560, 640],
	denitrifikasyon: [680, 72, 1320, 640],
};

/** Nitrogen gas: two nitrogen atoms bound together. */
const NitrogenGas: React.FC<{x: number; y: number; opacity?: number; turn?: number}> = ({x, y, opacity = 1, turn = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${turn})`} opacity={opacity}>
		<circle cx={-8} cy={0} r={8} fill="#3E6FB0" />
		<circle cx={8} cy={0} r={8} fill="#3E6FB0" />
	</g>
);

/** The colours of the soil's nitrogen: ammonia, nitrite, nitrate. */
const COLOURS = {ammonia: '#8E7CC3', nitrite: '#E0A82E', nitrate: '#3FA34D'};

export const NitrogenCycleProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('nitrogencycle', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const strength = (id: string) => (clock.current === id ? 1 : amount(id) >= 1 ? 0.25 : 0.12);
	const fix = strength('tutulma');
	const nitrify = strength('nitrifikasyon');
	const uptake = strength('ozumleme');
	const decay = strength('ayristirma');
	const denitrify = strength('denitrifikasyon');
	const grow = smooth(amount('ozumleme'));
	// Lightning flashes now and then while nitrogen is being bound.
	const flash = clock.current === 'tutulma' && (time * 0.9) % 1 < 0.12 ? 1 : 0;

	/** Something travelling from one place to another along an arc, each at its own phase. */
	const travel = (from: Point, to: Point, count: number, speed: number, seed: number, draw: (x: number, y: number, phase: number, index: number) => React.ReactNode, lift = 40) =>
		Array.from({length: count}, (_, index) => {
			const phase = (time * speed + noise(seed + index * 3.7)) % 1;
			const x = lerp(from[0], to[0], phase) + 10 * Math.sin(phase * 7 + index);
			const y = lerp(from[1], to[1], phase) - lift * Math.sin(Math.PI * phase);
			return <React.Fragment key={`${seed}-${index}`}>{draw(x, y, phase, index)}</React.Fragment>;
		});
	const dot =
		(colour: string, opacity: number, r = 7) =>
		(x: number, y: number, phase: number) => <circle cx={x} cy={y} r={r} fill={colour} opacity={opacity * Math.sin(Math.PI * phase)} />;
	const gas = (opacity: number) => (x: number, y: number, phase: number, index: number) => (
		<NitrogenGas x={x} y={y} opacity={opacity * Math.sin(Math.PI * phase)} turn={(index * 47 + time * 30) % 360} />
	);
	/** Along the lane the colour turns from ammonia to nitrite to nitrate. */
	const laneColour = (phase: number) => (phase < 0.5 ? COLOURS.ammonia : phase < 0.75 ? COLOURS.nitrite : COLOURS.nitrate);

	// The key to the air, in frame coordinates: it stays in view however the camera moves.
	const air = (
		<g transform="translate(800 110)">
			<rect x={-150} y={-30} width={300} height={60} rx={30} fill="#FFFFFF" stroke="#3E6FB0" strokeWidth={3} opacity={0.92} />
			<NitrogenGas x={-118} y={0} />
			<text x={16} y={10} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={28} fill="#2C4F80">
				Havada N₂: %78
			</text>
		</g>
	);

	return (
		<ProcessFrame process="nitrogencycle" clock={clock} camera={camera} width={width} height={height} overlay={air}>
			<Sky />
			{Array.from({length: 14}, (_, index) => (
				<NitrogenGas
					key={index}
					x={300 + noise(index * 2.2) * 1200 + 20 * Math.sin(time * 0.5 + index)}
					y={190 + noise(index * 5.5) * 120 + 10 * Math.cos(time * 0.4 + index)}
					opacity={0.45}
					turn={index * 40 + time * 20}
				/>
			))}
			{/* The soil, the grass and the storm. */}
			<rect x={SCENE.left - 100} y={GROUND} width={1800} height={320} fill="#9C7A55" />
			<rect x={SCENE.left - 100} y={GROUND} width={1800} height={14} fill="#7FAF5C" />
			<Grass ground={() => GROUND} x0={SCENE.left} x1={SCENE.right} count={40} seed={5} />
			<Cloud x={STORM[0]} y={STORM[1]} scale={1.1} dark={0.7} />
			<Rain x0={STORM[0] - 80} x1={STORM[0] + 70} top={STORM[1] + 30} ground={() => GROUND} time={time} amount={0.4 + 0.6 * fix} count={30} slant={0.04} />
			<path
				d={pathOf([
					[STORM[0] + 10, STORM[1] + 30],
					[STORM[0] - 14, STORM[1] + 110],
					[STORM[0] + 12, STORM[1] + 110],
					[STORM[0] - 10, GROUND - 40],
				])}
				fill="none"
				stroke="#FFE14D"
				strokeWidth={8}
				strokeLinejoin="round"
				opacity={flash}
			/>
			{/* The legume: a bean plant whose roots carry nodules full of nitrogen-binding bacteria. */}
			<g>
				<path d={`M${LEGUME} ${GROUND} C${LEGUME - 6} ${GROUND - 80} ${LEGUME + 8} ${GROUND - 140} ${LEGUME} ${GROUND - 190}`} stroke="#4E8B3A" strokeWidth={7} fill="none" />
				{[
					[-40, -90],
					[36, -120],
					[-34, -160],
					[30, -185],
				].map(([dx, dy], index) => (
					<ellipse key={index} cx={LEGUME + dx} cy={GROUND + dy} rx={30} ry={14} fill="#5FA046" transform={`rotate(${dx > 0 ? -20 : 20} ${LEGUME + dx} ${GROUND + dy})`} />
				))}
				{[
					[18, -70],
					[-16, -130],
				].map(([dx, dy], index) => (
					<path key={index} d={`M${LEGUME + dx} ${GROUND + dy} q${dx > 0 ? 18 : -18} 30 ${dx > 0 ? 6 : -6} 60`} stroke="#7FB04E" strokeWidth={10} strokeLinecap="round" fill="none" />
				))}
				<path
					d={`M${LEGUME} ${GROUND} L${LEGUME} ${GROUND + 120} M${LEGUME} ${GROUND + 30} L${LEGUME - 40} ${GROUND + 70} M${LEGUME} ${GROUND + 50} L${LEGUME + 44} ${GROUND + 60} M${LEGUME} ${GROUND + 80} L${LEGUME - 20} ${GROUND + 112} M${LEGUME} ${GROUND + 90} L${LEGUME + 34} ${GROUND + 118}`}
					stroke="#E8D9B5"
					strokeWidth={4}
					fill="none"
					strokeLinecap="round"
				/>
				{NODULES.map(([x, y], index) => (
					<circle key={index} cx={x} cy={y} r={9 + 2 * fix * Math.sin(time * 3 + index)} fill="#E58FA0" stroke="#B85C70" strokeWidth={2} />
				))}
			</g>
			{/* The wheat that takes the nitrate up, and the cow that eats the plants. */}
			<g>
				<path
					d={`M${WHEAT} ${GROUND} L${WHEAT} ${GROUND + 100} M${WHEAT} ${GROUND + 40} L${WHEAT - 46} ${GROUND + 110} M${WHEAT} ${GROUND + 40} L${WHEAT + 40} ${GROUND + 104}`}
					stroke="#E8D9B5"
					strokeWidth={4}
					fill="none"
					strokeLinecap="round"
				/>
				{[-22, -8, 6, 20].map((dx, index) => {
					const top = GROUND - 120 - 50 * grow - 8 * index;
					return (
						<g key={dx}>
							<path d={`M${WHEAT + dx * 0.4} ${GROUND} Q${WHEAT + dx} ${GROUND - 60} ${WHEAT + dx * 1.6} ${top}`} stroke="#6E9E3A" strokeWidth={5} fill="none" />
							<ellipse cx={WHEAT + dx * 1.6} cy={top - 16} rx={7} ry={20} fill={grow > 0.5 ? '#D9B44A' : '#8DB04A'} />
						</g>
					);
				})}
			</g>
			<g transform={`translate(${COW} ${GROUND})`}>
				<ellipse cx={0} cy={-70} rx={76} ry={38} fill="#F4F1EA" stroke="#5A4A3A" strokeWidth={3} />
				<ellipse cx={-20} cy={-80} rx={22} ry={14} fill="#3A2F27" />
				<ellipse cx={30} cy={-62} rx={18} ry={12} fill="#3A2F27" />
				<path d={`M-70 -82 q-34 6 -44 40 l22 6 q10 -20 30 -26 z`} fill="#F4F1EA" stroke="#5A4A3A" strokeWidth={3} />
				{[-50, -24, 26, 52].map((x) => (
					<rect key={x} x={x - 5} y={-40} width={10} height={40} fill="#5A4A3A" />
				))}
			</g>
			{/* The dead leaves and the dung that decay. */}
			<g transform={`translate(${DEAD[0]} ${DEAD[1]})`}>
				<rect x={-70} y={-20} width={140} height={20} rx={10} fill="#7A5232" />
				<ellipse cx={92} cy={-6} rx={26} ry={10} fill="#6B4E2E" />
				{Array.from({length: 7}, (_, index) => (
					<ellipse key={index} cx={-96 + index * 26} cy={2} rx={10} ry={4} fill="#C98A3C" />
				))}
			</g>
			{/* Binding: lightning and the nodules. */}
			{travel([STORM[0] + 10, STORM[1] + 40], [STORM[0] + 30, GROUND + 40], 5, 0.3, 1, dot(COLOURS.nitrate, fix, 6), 0)}
			{travel([560, 230], NODULES[2], 6, 0.22, 10, gas(fix), 30)}
			{travel(NODULES[4], AMMONIA, 5, 0.25, 20, dot(COLOURS.ammonia, 0.4 + 0.6 * fix), 10)}
			{/* Nitrification along the lane. */}
			{Array.from({length: 9}, (_, index) => {
				const phase = (time * 0.18 + index / 9) % 1;
				return <circle key={index} cx={lerp(AMMONIA[0], NITRATE[0], phase)} cy={AMMONIA[1] + 40 + 6 * Math.sin(time * 2 + index)} r={7} fill={laneColour(phase)} opacity={nitrify} />;
			})}
			{/* Uptake: nitrate up the roots and the stem; the cow eats the plant. */}
			{travel(NITRATE, [WHEAT, GROUND + 60], 5, 0.25, 30, dot(COLOURS.nitrate, uptake), 10)}
			{travel([WHEAT, GROUND + 50], [WHEAT, GROUND - 140], 5, 0.3, 35, dot(COLOURS.nitrate, uptake, 6), 0)}
			{travel([WHEAT + 30, GROUND - 120], [COW - 110, GROUND - 60], 3, 0.25, 38, dot('#6E9E3A', uptake, 6), 30)}
			{/* Decay: the dead and the dung return ammonia to the soil, which runs back to the lane. */}
			<Drift
				points={[[DEAD[0], GROUND + 10], [DEAD[0] - 60, 620], [1000, 624], [AMMONIA[0] + 30, 610], AMMONIA]}
				time={time}
				count={18}
				amount={decay}
				colour={COLOURS.ammonia}
				size={6}
				speed={0.1}
				spread={6}
				seed={4}
			/>
			{/* Denitrification: nitrogen gas back to the air. */}
			{travel([NITRATE[0] + 40, NITRATE[1] - 20], [1180, 180], 7, 0.2, 50, gas(denitrify), 60)}
			{/* The soil lane: ammonia, nitrite, nitrate (over the particles, so its names stay readable). */}
			{[
				[AMMONIA, 'Amonyak', COLOURS.ammonia],
				[NITRITE, 'Nitrit', COLOURS.nitrite],
				[NITRATE, 'Nitrat', COLOURS.nitrate],
			].map(([at, name, colour]) => {
				const [x, y] = at as Point;
				return (
					<g key={name as string}>
						<rect x={x - 62} y={y - 24} width={124} height={48} rx={24} fill={withAlpha(colour as string, 0.25)} stroke={colour as string} strokeWidth={3} />
						<Tag x={x} y={y} text={name as string} anchor="middle" size={22} weight={800} />
					</g>
				);
			})}
			<ProcessLabel id="simsek" at={[STORM[0] - 10, GROUND - 60]} to={[300, 330]} text="Şimşek azotu bağlar" show={clock.now('tutulma')} anchor="start" size={23} />
			<ProcessLabel id="nodul" at={NODULES[2]} to={[600, 480]} text="Kök nodülünde bakteriler" show={clock.now('tutulma')} anchor="start" size={23} />
			<ProcessLabel id="nitrifikasyon" at={NITRITE} to={[800, 470]} text="Bakteriler: amonyak → nitrit → nitrat" show={clock.now('nitrifikasyon')} size={23} />
			<ProcessLabel id="ozumleme" at={[WHEAT, GROUND + 40]} to={[1110, 270]} text="Kökler nitratı alır" show={clock.now('ozumleme')} anchor="start" size={23} />
			<ProcessLabel id="ayristirma" at={[DEAD[0], GROUND - 10]} to={[1380, 320]} text="Ayrışma: yeniden amonyak" show={clock.now('ayristirma')} size={23} />
			<ProcessLabel id="denitrifikasyon" at={[1080, 330]} to={[1110, 260]} text="Bakteriler: nitrat → N₂, havaya" show={clock.now('denitrifikasyon')} anchor="start" size={23} />
			<ProcessLabel id="n2" at={[800, 140]} to={[800, 200]} text="Çoğu canlı N₂'yi doğrudan kullanamaz" show={clock.now('tutulma') * clamp01(1 - clock.progress * 3)} size={22} />
			<ProcessLabel id="nitrat" at={NITRATE} to={[950, 500]} text="Bitkinin kullandığı biçim" show={clock.now('ozumleme')} size={22} />
		</ProcessFrame>
	);
};
