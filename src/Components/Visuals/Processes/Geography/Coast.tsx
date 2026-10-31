import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Drift, FlowLine, ProcessFrame, ProcessLabel, SCENE, Sky, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The sea at work on a coast, in two panels. Left, a cliff in cross-section: waves cut a notch at its foot, the
 * overhang falls, and the cliff steps back, leaving a wave-cut platform in front of it. Right, a coast from above: a
 * current carries sand along the shore and builds a spit out from a headland; the spit closes the bay and a lagoon is
 * left behind it; a sand bar grows out to an island and ties it to the land (tombolo); fine sand lines the beaches.
 */

const DIVIDE = 790;
const SEA_LEVEL = 380;
const CLIFF_START = 600;
const STEP = 62;
const STEPS = 3;
/** The plan view: where the shore runs, the bay, the headland, the island. */
const SHORE_Y = 300;
const BAY = {x0: 1030, x1: 1300, depth: 120};
const ISLAND: Point = [1452, 488];

const COLOURS = {
	land: '#B49A78',
	landTop: '#9CC57A',
	rock: '#A2917E',
	sea: '#5C9BD3',
	seaLight: '#8BC0E6',
	lagoon: '#7CC2C9',
	sand: '#EBD7A3',
	foam: '#FFFFFF',
};

const FRAMING: Record<string, CameraBox> = {
	falez: [40, 120, 770, 620],
	asinim: [40, 120, 770, 620],
	kiyioku: [800, 90, 1560, 640],
	lagun: [800, 90, 1560, 640],
	tombolo: [800, 90, 1560, 640],
};

export const CoastProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('coast', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	// The cliff steps back in collapses: a notch deepens, the overhang falls, again.
	const retreat = clamp01(0.62 * amount('falez') + 0.38 * amount('asinim')) * STEPS;
	const fallen = Math.min(STEPS, Math.floor(retreat));
	const notch = fallen >= STEPS ? 0 : (retreat - fallen) * 34;
	const cliffTop = CLIFF_START - fallen * STEP;
	const justFell = fallen > 0 && fallen < STEPS && retreat - fallen < 0.18 ? 1 - (retreat - fallen) / 0.18 : 0;
	const spit = smoothStep(clamp01(amount('kiyioku') * 0.62 + amount('lagun') * 0.38));
	const closed = smoothStep(clamp01((amount('lagun') - 0.3) / 0.7));
	const bar = smooth(amount('tombolo'));

	// Cross-section: land, cliff with its notch, the platform under shallow water.
	const landY = 210;
	const section: Point[] = [
		[SCENE.left - 120, landY + 6],
		[cliffTop - 30, landY],
		[cliffTop, landY + 2],
		[cliffTop + 2, SEA_LEVEL - 26],
		[cliffTop - notch, SEA_LEVEL - 12],
		[cliffTop - notch, SEA_LEVEL + 6],
		[cliffTop + 4, SEA_LEVEL + 14],
		[CLIFF_START + 30, SEA_LEVEL + 18],
		[CLIFF_START + 80, SEA_LEVEL + 60],
		[DIVIDE, SEA_LEVEL + 130],
		[DIVIDE, 760],
		[SCENE.left - 120, 760],
	];
	const waveY = (x: number) => SEA_LEVEL + 4 * Math.sin(x / 26 - time * 3);
	const water = pathOf([...sampled(waveY, cliffTop - notch, DIVIDE, 6), [DIVIDE, 760], [cliffTop - notch, 760]], true);
	const crash = (time * 0.9) % 1;

	// Plan view: the shore line with its bay; the spit across the bay's mouth.
	const shore = (x: number) => SHORE_Y + (x > BAY.x0 && x < BAY.x1 ? -BAY.depth * Math.sin(Math.PI * (x - BAY.x0) / (BAY.x1 - BAY.x0)) : 0);
	const landPath = pathOf([[DIVIDE + 10, SCENE.top - 20], [SCENE.right + 120, SCENE.top - 20], ...sampled(shore, SCENE.right + 120, DIVIDE + 10, 6)], true);
	const spitEnd = lerp(BAY.x0, BAY.x1 + 6, spit);
	const spitPath = smoothPath([[BAY.x0 - 20, SHORE_Y + 4], [lerp(BAY.x0, spitEnd, 0.5), SHORE_Y + 14], [spitEnd, SHORE_Y + 6 + 10 * (1 - spit)], [lerp(BAY.x0, spitEnd, 0.5), SHORE_Y + 32], [BAY.x0 - 20, SHORE_Y + 26]], true);
	const barTop = SHORE_Y + 4;
	const barEnd = lerp(barTop, ISLAND[1] - 30, bar);

	return (
		<ProcessFrame process="coast" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			{/* Left: the cliff in cross-section. */}
			<defs>
				<clipPath id={`cl${id}`}>
					<rect x={SCENE.left - 120} y={SCENE.top - 120} width={DIVIDE - SCENE.left + 120} height={900} />
				</clipPath>
				<clipPath id={`cr${id}`}>
					<rect x={DIVIDE + 10} y={SCENE.top - 120} width={SCENE.right - DIVIDE + 120} height={900} />
				</clipPath>
			</defs>
			<g clipPath={`url(#cl${id})`}>
				<path d={pathOf(section, true)} fill={COLOURS.rock} />
				<path d={pathOf([[SCENE.left - 120, landY + 6], [cliffTop - 30, landY], [cliffTop, landY + 2], [cliffTop, landY + 12], [SCENE.left - 120, landY + 18]], true)} fill={COLOURS.landTop} />
				{[0, 1, 2, 3].map((index) => (
					<line key={index} x1={SCENE.left - 120} x2={cliffTop} y1={landY + 40 + index * 38} y2={landY + 40 + index * 38} stroke="#87776A" strokeWidth={1.4} />
				))}
				{/* Where the cliff stood before: dashed outlines. */}
				{Array.from({length: fallen}, (_, index) => (
					<path key={index} d={pathOf([[CLIFF_START - index * STEP, landY + 2], [CLIFF_START - index * STEP, SEA_LEVEL - 20]])} stroke={withAlpha(palette.ink, 0.35)} strokeWidth={2} strokeDasharray="6 6" />
				))}
				<path d={water} fill={COLOURS.sea} opacity={0.88} />
				{/* The platform under shallow water, lighter. */}
				<path d={pathOf([[cliffTop - notch, SEA_LEVEL + 2], [CLIFF_START + 30, SEA_LEVEL + 2], [CLIFF_START + 30, SEA_LEVEL + 18], [cliffTop + 4, SEA_LEVEL + 14]], true)} fill={COLOURS.seaLight} opacity={0.7 * clamp01(fallen / 2)} />
				{/* Waves rolling in and breaking on the cliff. */}
				{[0, 1, 2].map((index) => {
					const phase = (time * 0.5 + index / 3) % 1;
					const x = lerp(DIVIDE - 20, cliffTop + 30, phase);
					return <path key={index} d={`M${x} ${SEA_LEVEL - 4} q-16 -18 -34 -6`} fill="none" stroke={COLOURS.foam} strokeWidth={4} opacity={0.9 * (1 - phase * 0.5)} />;
				})}
				{Array.from({length: 10}, (_, index) => {
					const p = (crash + noise(index) * 0.3) % 1;
					return <circle key={index} cx={cliffTop - notch + 8 + 40 * p * noise(index * 3)} cy={SEA_LEVEL - 6 - 60 * (p - p * p) * 4 * noise(index * 7)} r={3 + 3 * noise(index)} fill={COLOURS.foam} opacity={1 - p} />;
				})}
				{/* Rubble of earlier collapses on the platform, broken up by the waves. */}
				{Array.from({length: Math.min(fallen, STEPS) * 2}, (_, index) => (
					<rect key={index} x={-8} y={-6} width={16} height={11} rx={3} fill={COLOURS.rock} stroke="#7C6C5F" opacity={0.85} transform={`translate(${cliffTop + 18 + index * 16} ${SEA_LEVEL + 10}) rotate(${40 * (noise(index * 5) - 0.5)})`} />
				))}
				{/* The overhang that just fell. */}
				{justFell > 0
					? Array.from({length: 5}, (_, index) => (
							<rect key={index} x={-9} y={-7} width={18} height={14} rx={3} fill={COLOURS.rock} stroke="#7C6C5F" transform={`translate(${cliffTop + 10 + index * 12} ${lerp(landY + 30 + index * 25, SEA_LEVEL + 10, 1 - justFell)}) rotate(${(1 - justFell) * 90 * (noise(index) - 0.5)})`} />
						))
					: null}
				<text x={(SCENE.left + DIVIDE) / 2} y={SCENE.top + 36} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={24} fill={palette.ink}>
					Kesit
				</text>
			</g>
			<rect x={DIVIDE} y={SCENE.top - 120} width={10} height={900} fill="#FFFFFF" />
			{/* Right: the coast from above. */}
			<g clipPath={`url(#cr${id})`}>
				<rect x={DIVIDE + 10} y={SCENE.top - 120} width={SCENE.right - DIVIDE + 120} height={900} fill={COLOURS.sea} />
				{/* Waves coming in at an angle. */}
				{Array.from({length: 7}, (_, index) => {
					const phase = (time * 0.18 + index / 7) % 1;
					const y = lerp(SCENE.bottom + 20, SHORE_Y + 40, phase);
					return <path key={index} d={`M${DIVIDE + 20} ${y + 60} L${SCENE.right + 20} ${y - 40}`} stroke="#FFFFFF" strokeOpacity={0.35 * (1 - phase)} strokeWidth={3} />;
				})}
				{/* Water in the bay, turning to a lagoon once the spit closes it. */}
				<path d={pathOf([...sampled(shore, BAY.x0, BAY.x1, 6), [BAY.x1, SHORE_Y], [BAY.x0, SHORE_Y]], true)} fill={closed > 0.5 ? COLOURS.lagoon : COLOURS.sea} />
				<path d={landPath} fill={COLOURS.landTop} />
				{/* Beaches: fine sand along the shore. */}
				<path d={pathOf([...sampled((x) => shore(x) - 1, SCENE.right + 120, BAY.x1 + 20, 6), ...sampled((x) => shore(x) + 12, BAY.x1 + 20, SCENE.right + 120, 6)], true)} fill={COLOURS.sand} />
				<path d={pathOf([...sampled((x) => shore(x) - 1, BAY.x0 - 30, DIVIDE + 10, 6), ...sampled((x) => shore(x) + 10, DIVIDE + 10, BAY.x0 - 30, 6)], true)} fill={COLOURS.sand} />
				{/* The current along the shore, carrying sand to the spit. */}
				<FlowLine d={smoothPath([[DIVIDE + 20, SHORE_Y + 58], [BAY.x0 - 40, SHORE_Y + 50], [spitEnd, SHORE_Y + 40]])} time={time} width={6} colour="#3E7FC0" speed={70} opacity={0.4 + 0.6 * Math.max(clock.now('kiyioku'), clock.now('lagun'))} />
				<Drift points={[[DIVIDE + 20, SHORE_Y + 48], [BAY.x0 - 40, SHORE_Y + 40], [spitEnd, SHORE_Y + 22]]} time={time} count={22} colour="#D9BE7C" size={3.6} speed={0.25} spread={6} amount={1 - closed * 0.6} />
				<path d={spitPath} fill={COLOURS.sand} stroke="#C9AE70" strokeWidth={1.5} opacity={spit > 0.02 ? 1 : 0} />
				{/* The island and the sand bar growing out to it. */}
				<path d={`M${ISLAND[0] - 24} ${barTop} L${ISLAND[0] + 24} ${barTop} L${ISLAND[0] + 16} ${barEnd} L${ISLAND[0] - 16} ${barEnd} Z`} fill={COLOURS.sand} opacity={bar > 0.02 ? 1 : 0} />
				<ellipse cx={ISLAND[0]} cy={ISLAND[1]} rx={70} ry={52} fill={COLOURS.sand} />
				<ellipse cx={ISLAND[0]} cy={ISLAND[1]} rx={58} ry={42} fill={COLOURS.landTop} />
				<text x={(DIVIDE + SCENE.right) / 2} y={SCENE.top + 36} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={24} fill={palette.ink}>
					Kuşbakışı
				</text>
			</g>
			<ProcessLabel id="falez" at={[cliffTop, (landY + SEA_LEVEL) / 2]} to={[cliffTop - 170, 150]} text="Falez" show={clock.now('falez')} />
			<ProcessLabel id="falez" at={[cliffTop - notch + 6, SEA_LEVEL - 4]} to={[cliffTop + 130, 470]} text="Dalga çentiği" show={clock.now('falez') * clamp01(notch / 10)} size={22} />
			<ProcessLabel id="asinim" at={[(cliffTop + CLIFF_START) / 2 + 10, SEA_LEVEL + 10]} to={[480, 540]} text="Aşınım düzlüğü" show={clock.now('asinim') * clamp01(fallen / 2)} />
			<ProcessLabel id="kiyioku" at={[lerp(BAY.x0, spitEnd, 0.7), SHORE_Y + 16]} to={[1120, 420]} text="Kıyı oku" show={clock.now('kiyioku') * clamp01(spit * 3)} />
			<ProcessLabel id="lagun" at={[(BAY.x0 + BAY.x1) / 2, SHORE_Y - 60]} to={[(BAY.x0 + BAY.x1) / 2, 140]} text="Lagün (kıyı gölü)" show={clock.now('lagun') * closed} />
			<ProcessLabel id="tombolo" at={[ISLAND[0], (barTop + barEnd) / 2]} to={[ISLAND[0] - 130, 420]} text="Tombolo" show={clock.now('tombolo') * clamp01(bar * 2)} />
			<ProcessLabel id="kumsal" at={[1380, SHORE_Y + 4]} to={[1360, 200]} text="Kumsal" show={clock.now('tombolo')} />
		</ProcessFrame>
	);
};
