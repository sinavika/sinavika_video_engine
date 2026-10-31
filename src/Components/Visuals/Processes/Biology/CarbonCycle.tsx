import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Grass, ProcessFrame, ProcessLabel, SCENE, Sky, Tree, processCamera, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The carbon cycle on one landscape: carbon dioxide drifts from the air into the leaves (photosynthesis); plants,
 * animals and people breathe it back out (respiration); fungi and other decomposers return the dead to the air, and
 * what is buried for millions of years turns into coal and oil; burning those fuels in factories and cars sends the
 * carbon back fast, and the meter of carbon dioxide in the air climbs.
 */

const GROUND = 470;
const TREES: Point[] = [[180, GROUND], [290, GROUND + 6], [400, GROUND]];
const ANIMAL: Point = [640, GROUND];
const DEAD: Point = [860, GROUND];
const FACTORY: Point = [1250, GROUND];
const CAR: Point = [1450, GROUND];

const FRAMING: Record<string, CameraBox> = {
	fotosentez: [60, 90, 620, 600],
	solunum: [100, 90, 900, 600],
	ayristirma: [640, 160, 1120, 640],
	yanma: [1020, 80, 1560, 600],
};

/** A CO₂ molecule: carbon in the middle, two oxygens. */
const Molecule: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) => (
	<g transform={`translate(${x} ${y})`} opacity={opacity}>
		<circle cx={-11} cy={0} r={7} fill="#E4572E" />
		<circle cx={11} cy={0} r={7} fill="#E4572E" />
		<circle cx={0} cy={0} r={8} fill="#3A3A3A" />
	</g>
);

export const CarbonCycleProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('carboncycle', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const take = clock.current === 'fotosentez' ? 1 : 0.25;
	const breathe = clock.current === 'solunum' ? 1 : 0.25;
	const rot = clock.current === 'ayristirma' ? 1 : 0.2;
	const burn = smooth(amount('yanma'));
	const fossil = smooth(amount('ayristirma'));
	const meter = clamp01(0.35 + 0.55 * burn - 0.1 * smooth(amount('fotosentez')));

	/** Molecules travelling from one place to another along a gentle arc, each at its own phase. */
	const stream = (from: Point, to: Point, count: number, speed: number, seed: number, opacity: number) =>
		Array.from({length: count}, (_, index) => {
			const phase = (time * speed + noise(seed + index * 3.1)) % 1;
			const x = lerp(from[0], to[0], phase) + 30 * Math.sin(phase * 6 + index);
			const y = lerp(from[1], to[1], phase) - 60 * Math.sin(Math.PI * phase);
			return <Molecule key={`${seed}-${index}`} x={x} y={y} opacity={opacity * Math.sin(Math.PI * phase)} />;
		});

	return (
		<ProcessFrame process="carboncycle" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			<circle cx={120} cy={150} r={40} fill="#FFD25A" />
			{/* Underground: the layer of coal and oil laid down over millions of years. */}
			<rect x={SCENE.left - 100} y={GROUND} width={1800} height={300} fill="#B28E66" />
			<rect x={SCENE.left - 100} y={GROUND} width={1800} height={14} fill="#8DB86A" />
			<path d={pathOf([[600, 600], [1600, 590], [1600, 600 - 34 * (0.35 + 0.65 * fossil)], [600, 604 - 30 * (0.35 + 0.65 * fossil)]], true)} fill="#2E2A26" />
			<text x={1100} y={590} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill="#F3E9DA">
				Kömür ve petrol
			</text>
			<Grass ground={() => GROUND} x0={SCENE.left} x1={1100} count={24} seed={3} />
			{TREES.map(([x, y], index) => (
				<Tree key={x} x={x} y={y} size={1.5 + 0.1 * index} seed={index} />
			))}
			{/* An animal and a person breathing. */}
			<g transform={`translate(${ANIMAL[0]} ${ANIMAL[1]})`}>
				<ellipse cx={0} cy={-46} rx={46} ry={24} fill="#9C6B43" />
				<circle cx={48} cy={-66} r={16} fill="#9C6B43" />
				{[-30, -12, 16, 32].map((x) => (
					<rect key={x} x={x} y={-30} width={7} height={30} fill="#7A5232" />
				))}
			</g>
			<g transform={`translate(${ANIMAL[0] + 130} ${ANIMAL[1]})`}>
				<circle cx={0} cy={-92} r={13} fill="#E0B48C" />
				<rect x={-11} y={-78} width={22} height={44} rx={8} fill="#3E6FA3" />
				<rect x={-10} y={-36} width={8} height={36} fill="#2E3A4A" />
				<rect x={2} y={-36} width={8} height={36} fill="#2E3A4A" />
			</g>
			{/* Dead leaves and a fallen log, with fungi working on them. */}
			<g transform={`translate(${DEAD[0]} ${DEAD[1]})`}>
				<rect x={-70} y={-22} width={140} height={22} rx={10} fill="#7A5232" />
				{[-50, -10, 34].map((x, index) => (
					<g key={x}>
						<rect x={x - 3} y={-38} width={6} height={18} fill="#F3E9DA" />
						<ellipse cx={x} cy={-40} rx={14 + 3 * index} ry={8} fill="#C2453A" />
					</g>
				))}
				{Array.from({length: 8}, (_, index) => (
					<ellipse key={index} cx={-90 + index * 26} cy={2} rx={10} ry={4} fill="#C98A3C" />
				))}
			</g>
			{/* The factory and the car. */}
			<g transform={`translate(${FACTORY[0]} ${FACTORY[1]})`}>
				<rect x={-90} y={-110} width={180} height={110} fill="#8A8F96" />
				<rect x={30} y={-210} width={34} height={110} fill="#6E737A" />
				{[-70, -30, 10].map((x) => (
					<rect key={x} x={x} y={-80} width={26} height={30} fill="#CFE6F7" />
				))}
			</g>
			<g transform={`translate(${CAR[0]} ${CAR[1]})`}>
				<path d="M-50 0 L-50 -22 L-30 -26 L-18 -44 L22 -44 L34 -26 L52 -22 L52 0 Z" fill="#B5523B" stroke="#6E2F21" strokeWidth={2} />
				<circle cx={-28} cy={0} r={10} fill="#222" />
				<circle cx={30} cy={0} r={10} fill="#222" />
			</g>
			{/* Smoke from burning fuel. */}
			<g opacity={0.25 + 0.75 * burn}>
				{Array.from({length: 10}, (_, index) => {
					const phase = (time * 0.4 + index / 10) % 1;
					return <circle key={index} cx={FACTORY[0] + 47 + 60 * phase} cy={FACTORY[1] - 220 - 150 * phase} r={18 + 30 * phase} fill="#9AA0A6" opacity={0.6 * (1 - phase)} />;
				})}
			</g>
			{/* Carbon dioxide on the move. */}
			{TREES.flatMap(([x], index) => stream([x + 160, 150], [x, GROUND - 110], 4, 0.18, index * 10, take))}
			{stream([ANIMAL[0] + 50, GROUND - 70], [ANIMAL[0] + 120, 140], 4, 0.2, 40, breathe)}
			{stream([ANIMAL[0] + 130, GROUND - 92], [ANIMAL[0] + 200, 140], 3, 0.2, 50, breathe)}
			{stream([TREES[1][0], GROUND - 120], [TREES[1][0] + 100, 140], 3, 0.2, 55, breathe * 0.8)}
			{stream([DEAD[0], GROUND - 30], [DEAD[0] + 60, 160], 5, 0.2, 60, rot)}
			{stream([FACTORY[0] + 47, FACTORY[1] - 210], [FACTORY[0] + 140, 110], 7, 0.25, 70, 0.3 + 0.7 * burn)}
			{stream([CAR[0] - 52, CAR[1] - 8], [CAR[0] - 120, 150], 4, 0.25, 80, 0.3 + 0.7 * burn)}
			{/* The CO₂ in the air. */}
			<g transform={`translate(${SCENE.right - 70} 110)`}>
				<rect x={0} y={0} width={30} height={260} rx={15} fill="#FFFFFF" stroke={withAlpha(palette.ink, 0.3)} strokeWidth={3} />
				<rect x={5} y={255 - 250 * meter} width={20} height={250 * meter} rx={10} fill="#E4572E" />
				<text x={15} y={290} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={20} fill={palette.ink}>
					CO₂
				</text>
			</g>
			<ProcessLabel id="fotosentez" at={[TREES[1][0], GROUND - 130]} to={[300, 140]} text="Yapraklar CO₂ alır" show={clock.now('fotosentez')} />
			<ProcessLabel id="solunum" at={[ANIMAL[0] + 50, GROUND - 70]} to={[640, 200]} text="Solunumla CO₂ verilir" show={clock.now('solunum')} />
			<ProcessLabel id="ayristirma" at={[DEAD[0] - 10, GROUND - 40]} to={[880, 260]} text="Ayrıştırıcılar çürütür" show={clock.now('ayristirma')} />
			<ProcessLabel id="fosil" at={[900, 590]} to={[760, 560]} text="Gömülen karbon: fosil yakıt" show={clock.now('ayristirma') * fossil} size={22} />
			<ProcessLabel id="yanma" at={[FACTORY[0] + 47, FACTORY[1] - 220]} to={[1180, 160]} text="Yanma: karbon hızla havaya döner" show={clock.now('yanma')} size={22} />
			<ProcessLabel id="co2" at={[SCENE.right - 55, 365 - 250 * meter]} to={[SCENE.right - 180, 420]} text="Havada CO₂ artar" show={clock.now('yanma') * burn} size={22} />
		</ProcessFrame>
	);
};
