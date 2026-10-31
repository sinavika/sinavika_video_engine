import React from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {House, ProcessFrame, ProcessLabel, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * An avalanche on a steep mountain side: snow piles up in layers through the winter with a loose, weak layer between
 * them; new snow, warming or a jolt breaks the slab above it along a crack; the slab slides, breaks into blocks under
 * a cloud of snow dust, speeds up, flattens the trees on its way and buries the road and a house at the foot.
 */

const TOP: Point = [SCENE.left - 40, 120];
const FOOT: Point = [1260, 560];
const VALLEY_Y = 568;
const CRACK_X = 380;
const SLAB_END = 720;
const HOUSE_X = 1420;
const TREES = [880, 960, 1040, 1120, 1190];

const ground = (x: number): number => {
	if (x >= FOOT[0]) return VALLEY_Y + 3 * Math.sin(x / 40);
	const t = clamp01((x - TOP[0]) / (FOOT[0] - TOP[0]));
	return lerp(TOP[1], FOOT[1], t * (0.75 + 0.25 * t)) + 6 * Math.sin(x / 70);
};

const FRAMING: Record<string, CameraBox> = {
	birikme: [180, 100, 820, 520],
	kopma: [200, 120, 820, 500],
	cig: undefined,
};

export const AvalancheProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('avalanche', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const pile = smooth(amount('birikme'));
	const crack = smoothStep(clamp01(amount('kopma') * 1.5));
	const run = clock.current === 'cig' ? smoothStep(clamp01(clock.seconds / 5)) : amount('cig');
	const oldSnow = 14;
	const weak = 6;
	const slab = 10 + 24 * pile;

	const snowTop = (x: number) => ground(x) - oldSnow - weak - (x > 120 && x < 900 ? slab : slab * 0.5);
	// The slab between the crack and its end slides down the slope; it travels this share of the way to the valley.
	const travel = run * (FOOT[0] + 160 - SLAB_END);
	const pieces = Array.from({length: 14}, (_, index) => {
		const x0 = lerp(CRACK_X + 10, SLAB_END, index / 13);
		const x = Math.min(HOUSE_X + 60, x0 + travel * (0.8 + 0.4 * noise(index)));
		const lift = run > 0 && run < 1 ? 14 * Math.abs(Math.sin(time * 7 + index)) : 0;
		const pileUp = x > FOOT[0] - 40 ? 12 * Math.floor(index / 5) : 0;
		return {x, y: ground(x) - oldSnow - weak - 14 - lift - pileUp, angle: run * 220 * (noise(index * 3) - 0.5), size: 18 + 10 * noise(index)};
	});
	const front = Math.max(...pieces.map((piece) => piece.x));
	const depositHeight = 40 * smoothStep(clamp01((run - 0.6) / 0.4));

	return (
		<ProcessFrame process="avalanche" clock={clock} camera={camera} width={width} height={height}>
			<Sky colourTop="#B9CDE0" colourBottom="#EEF3F8" />
			{/* Snow falling while it piles up. */}
			<g opacity={clock.now('birikme')}>
				{Array.from({length: 70}, (_, index) => {
					const x = SCENE.left + noise(index * 2.7) * 1100;
					const fall = (time * 0.12 + noise(index * 4.3)) % 1;
					return <circle key={index} cx={x + 8 * Math.sin(time + index)} cy={lerp(SCENE.top - 10, snowTop(x), fall)} r={2.4 + 1.6 * noise(index)} fill="#FFFFFF" />;
				})}
			</g>
			<path d={pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 6), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true)} fill="#8F8579" />
			{/* The snowpack: old snow, the weak layer, the new slab. */}
			<path d={pathOf([...sampled((x) => ground(x) - oldSnow, SCENE.left - 120, SCENE.right + 120, 6), ...sampled(ground, SCENE.right + 120, SCENE.left - 120, 6)], true)} fill="#E6EEF6" />
			<path d={pathOf([...sampled((x) => ground(x) - oldSnow - weak, SCENE.left - 120, SCENE.right + 120, 6), ...sampled((x) => ground(x) - oldSnow, SCENE.right + 120, SCENE.left - 120, 6)], true)} fill="#C9D9E8" />
			<path d={pathOf(sampled((x) => ground(x) - oldSnow - weak / 2, SCENE.left - 120, SCENE.right + 120, 6))} fill="none" stroke={palette.lesson} strokeWidth={2.5} strokeDasharray="5 6" opacity={0.3 + 0.7 * Math.max(clock.now('birikme'), clock.now('kopma'))} />
			{/* The slab: whole above the crack and below the run; the part that broke away rides down as blocks. */}
			<path d={pathOf([...sampled(snowTop, SCENE.left - 120, CRACK_X - 2, 6), ...sampled((x) => ground(x) - oldSnow - weak, CRACK_X - 2, SCENE.left - 120, 6)], true)} fill="#FFFFFF" stroke="#D4E1EC" strokeWidth={1.5} />
			{/* Below the slab the snow is swept along as the avalanche passes; the valley floor keeps its own. */}
			<path d={pathOf([...sampled(snowTop, SLAB_END + 2, FOOT[0], 6), ...sampled((x) => ground(x) - oldSnow - weak, FOOT[0], SLAB_END + 2, 6)], true)} fill="#FFFFFF" stroke="#D4E1EC" strokeWidth={1.5} opacity={1 - smoothStep(clamp01(run * 1.6))} />
			<path d={pathOf([...sampled(snowTop, FOOT[0], SCENE.right + 120, 6), ...sampled((x) => ground(x) - oldSnow - weak, SCENE.right + 120, FOOT[0], 6)], true)} fill="#FFFFFF" stroke="#D4E1EC" strokeWidth={1.5} />
			{run <= 0.001 ? <path d={pathOf([...sampled(snowTop, CRACK_X + 2, SLAB_END, 6), ...sampled((x) => ground(x) - oldSnow - weak, SLAB_END, CRACK_X + 2, 6)], true)} fill="#FFFFFF" stroke="#D4E1EC" strokeWidth={1.5} /> : null}
			{/* The crack across the slab. */}
			<path d={pathOf([[CRACK_X, snowTop(CRACK_X) - 2], [CRACK_X + 6 * crack, ground(CRACK_X) - oldSnow - weak]])} stroke="#3B5A78" strokeWidth={2 + 5 * crack} opacity={crack} />
			{/* Trees and the house at the foot; the trees go down as the snow passes. */}
			{TREES.map((x, index) => {
				const hit = smoothStep(clamp01((front - x) / 60));
				return <Tree key={x} x={x} y={ground(x) - oldSnow + 4} size={1} kind="pine" tilt={hit * (70 + 15 * noise(index))} seed={index} />;
			})}
			<path d={pathOf([[FOOT[0] + 20, VALLEY_Y + 2], [SCENE.right + 120, VALLEY_Y + 2]])} stroke="#4A4A4A" strokeWidth={8} />
			<House x={HOUSE_X} y={VALLEY_Y - 8} size={1.1} crack={clamp01((front - HOUSE_X + 60) / 60)} />
			{/* The deposit burying the road. */}
			<path d={smoothPath([[FOOT[0] - 140, ground(FOOT[0] - 140) - oldSnow], [FOOT[0] - 40, ground(FOOT[0] - 40) - oldSnow - depositHeight * 0.7], [FOOT[0] + 70, VALLEY_Y - oldSnow - depositHeight], [HOUSE_X - 30, VALLEY_Y - oldSnow - depositHeight * 0.75], [HOUSE_X + 50, VALLEY_Y - 4], [HOUSE_X + 50, VALLEY_Y + 4], [FOOT[0] - 140, ground(FOOT[0] - 140) + 2]], true)} fill="#FFFFFF" stroke="#D4E1EC" strokeWidth={1.5} opacity={depositHeight > 1 ? 1 : 0} />
			{/* The sliding slab, broken into blocks, under a cloud of snow dust. */}
			{run > 0.001
				? pieces.map((piece, index) => <rect key={index} x={-piece.size / 2} y={-piece.size / 2} width={piece.size} height={piece.size * 0.7} rx={4} fill="#FFFFFF" stroke="#C9D7E3" strokeWidth={1.5} transform={`translate(${piece.x} ${piece.y}) rotate(${piece.angle})`} />)
				: null}
			<g opacity={Math.sin(Math.PI * clamp01(run)) * 0.9}>
				{Array.from({length: 16}, (_, index) => {
					const phase = (time * 0.9 + noise(index * 3.3)) % 1;
					const x = front - 160 * noise(index) - 40 * phase;
					return <circle key={index} cx={x} cy={ground(x) - 40 - 70 * phase} r={22 + 46 * phase} fill="#FFFFFF" opacity={0.75 * (1 - phase)} />;
				})}
			</g>
			<ProcessLabel id="birikme" at={[560, snowTop(560) + 4]} to={[600, 200]} text="Kat kat kar birikir" show={clock.now('birikme')} />
			<ProcessLabel id="zayif" at={[470, ground(470) - oldSnow - weak / 2]} to={[300, 420]} text="Zayıf tabaka" show={Math.max(clock.now('birikme') * pile, clock.now('kopma'))} />
			<ProcessLabel id="kopma" at={[CRACK_X + 2, snowTop(CRACK_X) + 6]} to={[CRACK_X + 90, 170]} text="Kar levhası kopar" show={clock.now('kopma') * crack} />
			<ProcessLabel id="cig" at={[front - 60, ground(front - 60) - 30]} to={[front - 200, 250]} text="Çığ" show={clock.now('cig') * clamp01(run * 3)} />
		</ProcessFrame>
	);
};
