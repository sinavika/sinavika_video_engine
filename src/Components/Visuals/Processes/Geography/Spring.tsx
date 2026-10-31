import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, Drift, FlowLine, Grass, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Groundwater and the springs the lesson names, in one cross-section the camera walks along: rain soaks through a
 * permeable layer and gathers on clay that lets no water through (the water table); where the clay meets the hillside
 * the water comes out (slope spring); in limestone it runs in channels and gushes out at the foot (karst spring);
 * in a basin, water trapped between two impermeable layers is under the pressure of the high ground it came from, so
 * a drilled well spouts by itself (artesian); and along a fault, water heated deep down rises as a hot spring.
 */

/** The ground line: a hill, a limestone massif, an upland around a basin, a faulted plain. */
const PROFILE: readonly Point[] = [
	[SCENE.left - 120, 250], [200, 252], [300, 300], [420, 400], [520, 468], [575, 472], [640, 330], [700, 246], [810, 240], [852, 470], [905, 472],
	[940, 246], [1010, 236], [1062, 400], [1092, 520], [1170, 520], [1205, 400], [1252, 238], [1318, 232], [1372, 420], [1405, 470], [SCENE.right + 120, 470],
];
const surfaceAt = (x: number) => {
	for (let index = 1; index < PROFILE.length; index++) {
		if (x <= PROFILE[index][0]) {
			const [x0, y0] = PROFILE[index - 1];
			const [x1, y1] = PROFILE[index];
			return lerp(y0, y1, smoothStep((x - x0) / (x1 - x0)));
		}
	}
	return PROFILE[PROFILE.length - 1][1];
};

/** The hill: sand and gravel over clay; the clay's top dips gently and meets the slope at the spring. */
const clayTop = (x: number) => 318 + 0.12 * (x - SCENE.left);
const SLOPE_SPRING = (() => {
	let x = 250;
	while (surfaceAt(x) < clayTop(x) && x < 560) x += 1;
	return x;
})();
/** The artesian aquifer bends down under the basin between the two uplands. */
const BASIN = {x0: 905, x1: 1345};
const aquifer = (x: number) => 252 + 330 * Math.sin(Math.PI * clamp01((x - BASIN.x0) / (BASIN.x1 - BASIN.x0)));
const WELL_X = 1131;
const KARST_SPRING: Point = [846, 462];
const HOT_SPRING_X = 1450;
const FAULT: readonly Point[] = [[1418, 470], [1360, 640]];

const COLOURS = {
	sand: '#E4CB91',
	sandDot: '#C3A365',
	clay: '#9A9C94',
	limestone: '#DCD5C4',
	aquifer: '#E8D39D',
	rock: '#B9A285',
	water: '#4F8FC9',
	hot: '#E2733A',
};

const FRAMING: Record<string, CameraBox> = {
	sizma: [40, 190, 540, 490],
	yamac: [200, 230, 580, 520],
	karstik: [540, 170, 920, 560],
	artezyen: [870, 160, 1380, 640],
	fay: [1250, 170, 1560, 640],
};

export const SpringProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('spring', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const soak = smooth(clamp01(amount('sizma') * 1.4));
	const slopeFlow = smooth(clamp01(amount('yamac') * 2));
	const karst = smooth(clamp01(amount('karstik') * 2));
	const drill = clock.current === 'artezyen' ? smoothStep(clamp01(clock.progress / 0.35)) : amount('artezyen');
	const spout = clock.current === 'artezyen' ? smooth(clamp01((clock.progress - 0.35) / 0.2)) : amount('artezyen');
	const heat = smooth(clamp01(amount('fay') * 1.6));
	const rain = {sizma: 1, yamac: 0.35, karstik: 0.45, artezyen: 0.4, fay: 0.25}[clock.current] ?? 0;

	const ground = sampled(surfaceAt, SCENE.left - 120, SCENE.right + 120, 4);
	const body = pathOf([...ground, [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	const tableY = (x: number) => clayTop(x) - 46 * soak;
	const hill = (x0: number, x1: number, top: (x: number) => number, bottom: (x: number) => number) =>
		pathOf([...sampled((x) => Math.max(surfaceAt(x), top(x)), x0, x1, 5), ...sampled((x) => Math.max(surfaceAt(x), bottom(x)), x0, x1, 5).reverse()], true);
	const conduit: Point[] = [[742, 240], [760, 300], [790, 330], [800, 390], [825, 430], KARST_SPRING];
	const wellTop = surfaceAt(WELL_X);
	const wellBottom = lerp(wellTop, aquifer(WELL_X), drill);
	const pressure = aquifer(BASIN.x0 + 8) + 8;

	return (
		<ProcessFrame process="spring" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			<g opacity={clamp01(rain * 1.4)}>
				<Cloud x={250} y={118} scale={1.05} dark={0.55} />
				<Cloud x={760} y={108} scale={1.1} dark={0.5} />
				<Cloud x={1120} y={116} scale={1.15} dark={0.5} />
			</g>
			<Rain x0={SCENE.left} x1={SCENE.right} top={SCENE.top - 20} ground={surfaceAt} time={time} amount={rain} count={110} />
			<defs>
				<clipPath id={`sb${id}`}>
					<path d={body} />
				</clipPath>
				<radialGradient id={`sm${id}`} cx="0.5" cy="1" r="0.8">
					<stop offset="0" stopColor="#FF7A2E" />
					<stop offset="0.5" stopColor="#C2401C" stopOpacity={0.7} />
					<stop offset="1" stopColor="#C2401C" stopOpacity={0} />
				</radialGradient>
			</defs>
			<path d={body} fill={COLOURS.rock} />
			<g clipPath={`url(#sb${id})`}>
				{/* The hill: permeable sand and gravel over impermeable clay, and the water gathering on the clay. */}
				<path d={hill(SCENE.left - 120, 600, () => 0, clayTop)} fill={COLOURS.sand} />
				{Array.from({length: 70}, (_, index) => {
					const x = SCENE.left + noise(index * 2.3) * 540;
					const y = surfaceAt(x) + 8 + noise(index * 5.1) * Math.max(0, clayTop(x) - surfaceAt(x) - 12);
					return y < clayTop(x) - 4 ? <circle key={index} cx={x} cy={y} r={2.4 + 2 * noise(index)} fill={COLOURS.sandDot} /> : null;
				})}
				<path d={hill(SCENE.left - 120, 600, tableY, clayTop)} fill={COLOURS.water} opacity={0.42} />
				<path d={hill(SCENE.left - 120, 600, clayTop, (x) => clayTop(x) + 56)} fill={COLOURS.clay} />
				<path d={pathOf(sampled((x) => Math.max(surfaceAt(x), tableY(x)), SCENE.left, SLOPE_SPRING, 10))} fill="none" stroke={COLOURS.water} strokeWidth={3} strokeDasharray="12 8" opacity={soak} />
				<Drift points={[[150, 262], [154, 300], [150, clayTop(150) - 8]]} time={time} count={10} amount={rain * (1 - soak * 0.3)} colour={COLOURS.water} size={3} speed={0.5} spread={2} />
				<Drift points={[[260, 280], [262, 320], [258, clayTop(260) - 8]]} time={time} count={10} amount={rain * (1 - soak * 0.3)} colour={COLOURS.water} size={3} speed={0.5} spread={2} seed={5} />
				{/* Groundwater running along the clay to the hillside. */}
				<FlowLine d={smoothPath(sampled((x) => clayTop(x) - 10, 120, SLOPE_SPRING - 4, 30))} time={time} width={4} opacity={slopeFlow} speed={50} />
				{/* The limestone massif and its channel. */}
				<path d={hill(575, 905, () => 0, () => 760)} fill={COLOURS.limestone} />
				{[610, 660, 720, 780, 830].map((x) => (
					<line key={x} x1={x} y1={200} x2={x + 6} y2={640} stroke="#B3A994" strokeWidth={1.6} />
				))}
				{[300, 350, 400, 450, 500].map((y) => (
					<line key={y} x1={575} y1={y} x2={905} y2={y + 4} stroke="#B3A994" strokeWidth={1.4} />
				))}
				<path d={smoothPath(conduit)} fill="none" stroke="#3B332C" strokeWidth={18} strokeLinecap="round" />
				<FlowLine d={smoothPath(conduit)} time={time} width={8} opacity={0.3 + 0.7 * karst} speed={90} />
				{/* The basin: an aquifer between two impermeable layers, bent down under it. */}
				<path d={hill(BASIN.x0 - 20, BASIN.x1 + 20, (x) => aquifer(x) - 78, (x) => aquifer(x) - 17)} fill={COLOURS.clay} />
				<path d={hill(BASIN.x0 - 20, BASIN.x1 + 20, (x) => aquifer(x) - 17, (x) => aquifer(x) + 17)} fill={COLOURS.aquifer} />
				<path d={hill(BASIN.x0 - 20, BASIN.x1 + 20, (x) => aquifer(x) - 17, (x) => aquifer(x) + 17)} fill={COLOURS.water} opacity={0.18 + 0.3 * soak} />
				<path d={hill(BASIN.x0 - 20, BASIN.x1 + 20, (x) => aquifer(x) + 17, (x) => aquifer(x) + 90)} fill={COLOURS.clay} />
				<FlowLine d={smoothPath(sampled(aquifer, BASIN.x0 + 4, WELL_X - 6, 20))} time={time} width={5} opacity={0.25 + 0.75 * spout} speed={70} />
				<FlowLine d={smoothPath(sampled(aquifer, BASIN.x1 - 4, WELL_X + 6, 20))} time={time} width={5} opacity={0.25 + 0.75 * spout} speed={70} />
				{/* The fault: layers offset across it, magma heat below, water rising along it. */}
				<path d={hill(1345, SCENE.right + 120, () => 520, () => 760)} fill="#A88F72" />
				<rect x={1250} y={540} width={420} height={160} fill={`url(#sm${id})`} opacity={0.35 + 0.65 * heat} />
				<path d={pathOf(FAULT)} stroke="#5B3A22" strokeWidth={5} strokeDasharray="14 7" />
				<FlowLine d={smoothPath([[1318, 236], [1300, 420], [1340, 600], [1380, 560], [FAULT[0][0] - 2, FAULT[0][1] + 6]])} time={time} width={5} colour={COLOURS.water} opacity={0.25 + 0.4 * heat} speed={60} />
				<FlowLine d={smoothPath([[1366, 626], [1392, 548], FAULT[0], [HOT_SPRING_X, 468]])} time={time} width={6} colour={COLOURS.hot} opacity={heat} speed={70} />
			</g>
			<path d={pathOf(ground)} fill="none" stroke={withAlpha('#3D2B1A', 0.35)} strokeWidth={2} />
			<Grass ground={surfaceAt} x0={SCENE.left} x1={560} count={18} seed={2} />
			<Grass ground={surfaceAt} x0={905} x1={1360} count={16} seed={5} />
			<Tree x={140} y={surfaceAt(140)} size={0.9} />
			<Tree x={980} y={surfaceAt(980)} size={0.85} kind="pine" />
			<Tree x={1290} y={surfaceAt(1290)} size={0.85} kind="pine" />
			{/* The slope spring and its stream. */}
			<FlowLine d={smoothPath(sampled((x) => surfaceAt(x) - 3, SLOPE_SPRING, SLOPE_SPRING + (570 - SLOPE_SPRING) * slopeFlow, 12))} time={time} width={6} opacity={slopeFlow > 0.02 ? 1 : 0} />
			{/* The karst spring gushing at the cliff foot, into the river below. */}
			<g opacity={karst}>
				<FlowLine d={`M${KARST_SPRING[0]} ${KARST_SPRING[1]} Q${KARST_SPRING[0] + 22} ${KARST_SPRING[1] - 4} ${KARST_SPRING[0] + 38} ${KARST_SPRING[1] + 8}`} time={time} width={12} speed={110} />
				<FlowLine d={pathOf([[KARST_SPRING[0] + 30, 470], [905, 471]])} time={time} width={8} />
				{Array.from({length: 7}, (_, index) => {
					const phase = (time * 1.4 + noise(index)) % 1;
					return <circle key={index} cx={KARST_SPRING[0] + 36 + 10 * noise(index * 3)} cy={466 - 10 * phase} r={3 + 5 * phase} fill="#FFFFFF" opacity={0.8 * (1 - phase)} />;
				})}
			</g>
			{/* The artesian well: a rig drills to the aquifer, then the water rises and spouts by itself. */}
			<g opacity={amount('artezyen') > 0 ? 1 : 0}>
				<path d={pathOf([[WELL_X - 24, wellTop - 2], [WELL_X, wellTop - 92], [WELL_X + 24, wellTop - 2]])} fill="none" stroke="#6E6E6E" strokeWidth={4} opacity={1 - spout} />
				<rect x={WELL_X - 5} y={wellTop} width={10} height={Math.max(0, wellBottom - wellTop)} fill="#5E5E5E" />
				<rect x={WELL_X - 2.5} y={wellTop} width={5} height={Math.max(0, wellBottom - wellTop)} fill={COLOURS.water} opacity={spout} />
				{Array.from({length: 26}, (_, index) => {
					const phase = (time * 1.1 + noise(index * 3.3)) % 1;
					const dir = noise(index * 7.1) - 0.5;
					const rise = 120 * spout;
					const x = WELL_X + dir * 110 * phase;
					const y = wellTop - 4 - rise * (4 * phase * (1 - phase)) * (0.7 + 0.5 * noise(index));
					return <circle key={index} cx={x} cy={y} r={3 + 1.5 * noise(index)} fill={COLOURS.water} opacity={spout * (0.9 - phase * 0.4)} />;
				})}
				<path d={pathOf([[BASIN.x0 + 10, pressure], [BASIN.x1 - 10, pressure]])} stroke={palette.lesson} strokeWidth={3} strokeDasharray="12 9" opacity={spout * clock.now('artezyen')} />
			</g>
			{/* Steam over the hot spring and the geothermal plant. */}
			<g opacity={heat}>
				<rect x={1500} y={430} width={40} height={40} fill="#E9E4DA" stroke="#7A7268" strokeWidth={2} />
				<path d="M1480 470 L1486 418 L1500 418 L1506 470 Z" fill="#CFC8BC" stroke="#7A7268" strokeWidth={2} />
				{Array.from({length: 12}, (_, index) => {
					const phase = (time * 0.6 + noise(index * 2.9)) % 1;
					const fromPlant = index % 3 === 0;
					const x = (fromPlant ? 1493 : HOT_SPRING_X) + 12 * Math.sin(phase * 6 + index) + 20 * phase;
					const y = (fromPlant ? 414 : 462) - 90 * phase;
					return <circle key={index} cx={x} cy={y} r={10 + 22 * phase} fill="#FFFFFF" opacity={0.7 * (1 - phase)} />;
				})}
				<ellipse cx={HOT_SPRING_X} cy={470} rx={26} ry={6} fill="#7FC6D9" stroke="#E2733A" strokeWidth={2} />
			</g>
			<ProcessLabel id="gecirimli" at={[220, 290]} to={[230, 222]} text="Geçirimli: kum, çakıl" show={clock.now('sizma')} />
			<ProcessLabel id="gecirimsiz" at={[300, clayTop(300) + 28]} to={[330, 440]} text="Geçirimsiz: kil" show={clock.now('sizma')} />
			<ProcessLabel id="tabansuyu" at={[120, tableY(120) + 18]} to={[80, 400]} text="Taban suyu" anchor="start" show={clock.now('sizma') * soak} />
			<ProcessLabel id="yamac" at={[SLOPE_SPRING, surfaceAt(SLOPE_SPRING)]} to={[SLOPE_SPRING + 60, 300]} text="Yamaç kaynağı" anchor="start" show={clock.now('yamac')} />
			<ProcessLabel id="karstik" at={KARST_SPRING} to={[690, 530]} text="Karstik kaynak" show={clock.now('karstik')} />
			<ProcessLabel id="kuyu" at={[WELL_X, wellTop - 60]} to={[WELL_X - 20, 300]} text="Su kendiliğinden fışkırır" show={clock.now('artezyen') * spout} size={23} />
			<ProcessLabel id="artezyen" at={[1000, aquifer(1000)]} to={[960, 600]} text="İki geçirimsiz tabaka arasında basınçlı su" anchor="start" show={clock.now('artezyen')} size={22} />
			<ProcessLabel id="fay" at={[1395, 540]} to={[1300, 600]} text="Fay" show={clock.now('fay')} />
			<ProcessLabel id="kaplica" at={[HOT_SPRING_X, 466]} to={[1330, 330]} text="Sıcak su, kaplıca" show={clock.now('fay')} size={23} />
		</ProcessFrame>
	);
};
