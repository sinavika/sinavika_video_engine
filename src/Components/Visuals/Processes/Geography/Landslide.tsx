import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, FlowLine, Grass, House, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * A landslide, as the lesson tells it: a steep slope whose layers lie parallel to it, rain and snowmelt soaking the
 * soil, the clay beneath turning into a slip surface, a crack opening at the top, and then the mass breaking away and
 * sliding: trees and a house ride on it and tilt (the head rotates back, the toe pushes forward and bulges), the road
 * cut at the foot is buried and the stream in the valley is blocked, so a lake gathers behind it (seen from above in
 * an inset). The mass moves column by column along the slip surface, each column keeping its soil.
 */

// ---------------------------------------------------------------- the ground

const VALLEY_Y = 558;
const TOP_Y = 212;
/** The foot of the slope (the road is cut into it) and its crest. */
const FOOT = 545;
const CREST = 1250;
const ROAD = [440, 545] as const;
const STREAM = {x: 205, half: 72, depth: 26};
/** The part that slides: from the toe to the crack, and how deep under the surface it breaks (inside the clay). */
const TOE = 600;
const HEAD = 1130;
const SLIP_DEPTH = 48;
const SOIL = 34;
const CLAY = 58;
/** How far the head of the mass slides along the slip surface. */
const TRAVEL = 330;
const COLUMNS = 72;

const channel = (x: number) => {
	const d = (x - STREAM.x) / STREAM.half;
	return Math.abs(d) < 1 ? STREAM.depth * (1 - d * d) : 0;
};

/** The ground line before anything moves. */
const surface = (x: number): number => {
	if (x <= FOOT) return VALLEY_Y + channel(x) - (x >= ROAD[0] ? 3 : 0);
	if (x >= CREST) return TOP_Y - 6 * Math.sin((x - CREST) / 90);
	return lerp(VALLEY_Y - 3, TOP_Y, smoothStep((x - FOOT) / (CREST - FOOT)));
};

/** The share of the slip depth at x: a steep head scarp, a gentler toe. */
const slipRamp = (x: number) => Math.min(smoothStep(clamp01((x - TOE) / 90)), smoothStep(clamp01((HEAD - x) / 45)));
/** The slip surface: the bed the mass slides on (the ground itself outside the mass). */
const bed = (x: number) => surface(x) + (x > TOE && x < HEAD ? SLIP_DEPTH * slipRamp(x) : 0);

/** Distance along the bed from its far left, tabled every 4 units, to move columns along it. */
const ARC_X0 = SCENE.left - 60;
const ARC_STEP = 4;
const ARC: number[] = (() => {
	const table = [0];
	for (let x = ARC_X0 + ARC_STEP; x <= HEAD + ARC_STEP; x += ARC_STEP) table.push(table[table.length - 1] + Math.hypot(ARC_STEP, bed(x) - bed(x - ARC_STEP)));
	return table;
})();
const arcAt = (x: number) => {
	const k = (x - ARC_X0) / ARC_STEP;
	const i = Math.max(0, Math.min(ARC.length - 2, Math.floor(k)));
	return lerp(ARC[i], ARC[i + 1], k - i);
};
const xAtArc = (arc: number) => {
	let i = 0;
	while (i < ARC.length - 2 && ARC[i + 1] < arc) i++;
	return ARC_X0 + (i + clamp01((arc - ARC[i]) / (ARC[i + 1] - ARC[i] || 1))) * ARC_STEP;
};

type Column = {x: number; top: number; base: number};

/** The mass after sliding `slide` (0–1): each column's place on the bed and its new top. The toe runs further than the head, so the mass stretches over the valley and bulges at its front. */
export const massColumns = (slide: number): Column[] =>
	Array.from({length: COLUMNS}, (_, index) => {
		const u = index / (COLUMNS - 1);
		const x0 = lerp(TOE, HEAD, u);
		const thickness = bed(x0) - surface(x0);
		const move = slide * TRAVEL * (1.05 - 0.3 * u);
		const x = xAtArc(arcAt(x0) - move);
		const spread = 1 + slide * 0.3 * (1 - u);
		const bulge = slide * 26 * Math.exp(-(((u - 0.12) / 0.1) ** 2));
		const hummock = slide * 5 * Math.sin(index * 1.3) * clamp01(thickness / 10);
		const base = bed(x);
		return {x, base, top: base - thickness / spread - bulge - hummock};
	});

/** Where a point of the original slope (at x) is after sliding, and how much it tilts. */
const ride = (columns: readonly Column[], x: number): {x: number; y: number; u: number} => {
	const u = clamp01((x - TOE) / (HEAD - TOE));
	const k = u * (COLUMNS - 1);
	const i = Math.min(COLUMNS - 2, Math.floor(k));
	const t = k - i;
	return {x: lerp(columns[i].x, columns[i + 1].x, t), y: lerp(columns[i].top, columns[i + 1].top, t), u};
};

const band = (top: (x: number) => number, bottom: (x: number) => number, x0 = SCENE.left - 100, x1 = SCENE.right + 100) => pathOf([...sampled(top, x0, x1, 8), ...sampled(bottom, x0, x1, 8).reverse()], true);

const COLOURS = {
	soil: '#A97C50',
	soilWet: '#6B4E33',
	topsoil: '#7A5A36',
	clay: '#8F928A',
	clayWet: '#66737E',
	rock: ['#CDB089', '#B99366', '#A07A52'] as const,
	water: '#5A97CF',
	waterDeep: '#3F7DB8',
	snow: '#FFFFFF',
	road: '#4A4A4A',
	foundation: '#9C9184',
};

const TREES: readonly {x: number; kind: 'broad' | 'pine'; size: number}[] = [
	{x: 640, kind: 'broad', size: 1},
	{x: 735, kind: 'broad', size: 1.1},
	{x: 960, kind: 'broad', size: 1},
	{x: 1040, kind: 'pine', size: 1.1},
	{x: 1095, kind: 'broad', size: 0.95},
	{x: 1330, kind: 'pine', size: 1.15},
	{x: 1420, kind: 'pine', size: 1},
	{x: 1500, kind: 'pine', size: 1.2},
	{x: 120, kind: 'broad', size: 0.9},
	{x: 330, kind: 'broad', size: 1},
];
const HOUSE_X = 850;

const FRAMING: Record<string, CameraBox> = {
	egim: [330, 150, 1360, 640],
	tabaka: [560, 250, 1240, 640],
	su: [380, 72, 1560, 640],
	kayma: [640, 200, 1260, 600],
	kutle: [110, 150, 1300, 640],
	set: undefined,
};

export const LandslideProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('landslide', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time} = clock;
	const amount = clock.amount;

	const wet = smooth(clamp01(amount('su') * 1.4));
	const clayWet = smooth(amount('kayma'));
	const crack = smoothStep(clamp01((amount('kayma') - 0.45) / 0.55));
	// The slide itself: a short wait, then it gathers speed and comes to rest (seconds, not the beat's length).
	const slide = clock.current === 'kutle' ? smoothStep(clamp01((clock.seconds - 0.9) / 3.6)) : amount('kutle');
	const lake = smooth(amount('set'));
	const rain = clock.current === 'su' ? 0.35 + 0.65 * smooth(clamp01(clock.progress * 3)) : clock.current === 'kayma' ? 0.55 : clock.current === 'kutle' ? 0.55 * (1 - clamp01(clock.seconds / 2)) : 0;
	const creep = amount('kayma') * (1 - slide);

	const columns = massColumns(slide);
	const toeFront = columns[0].x;
	const ground = (x: number) => (x > TOE && x < HEAD ? bed(x) : surface(x));
	const soilColour = (share: number) => {
		const a = [0xa9, 0x7c, 0x50];
		const b = [0x6b, 0x4e, 0x33];
		return `rgb(${a.map((value, index) => Math.round(lerp(value, b[index], share))).join(', ')})`;
	};
	const clayColour = clayWet > 0.5 ? COLOURS.clayWet : COLOURS.clay;

	// Static ground: everything under the bed (the mass is drawn on top of it).
	const groundPath = pathOf([...sampled(ground, SCENE.left - 100, SCENE.right + 100, 6), [SCENE.right + 100, 760], [SCENE.left - 100, 760]], true);
	const massTop: Point[] = columns.map((column) => [column.x, column.top]);
	const massBase: Point[] = columns.map((column) => [column.x, column.base]);
	const massPath = pathOf([...massTop, ...massBase.slice().reverse()], true);
	const clayStrip = pathOf([...columns.map((column) => [column.x, Math.max(column.top, column.base - (SLIP_DEPTH - SOIL) * clamp01((column.base - column.top) / SLIP_DEPTH))] as Point), ...massBase.slice().reverse()], true);

	const angle = (Math.atan2(VALLEY_Y - TOP_Y, CREST - FOOT) * 180) / Math.PI;
	const house = ride(columns, HOUSE_X);
	const houseBase = surface(HOUSE_X + 30);
	const waterLevel = lerp(VALLEY_Y - 6, VALLEY_Y - 44, lake);
	const lakeRight = Math.min(toeFront + 10, SCENE.right);

	return (
		<ProcessFrame process="landslide" clock={clock} camera={camera} width={width} height={height}>
			<Sky colourTop={rain > 0.2 ? '#A9BCCB' : '#BFDDF3'} colourBottom="#EEF3F6" />
			<g opacity={clamp01(rain * 1.3)}>
				<Cloud x={760} y={118} scale={1.1} dark={0.55} />
				<Cloud x={1040} y={104} scale={1.25} dark={0.6} />
				<Cloud x={1330} y={122} scale={1} dark={0.5} />
			</g>
			<Rain x0={420} x1={SCENE.right} top={SCENE.top - 10} ground={surface} time={time} amount={rain} count={90} />
			{/* Rock and clay layers, parallel to the slope, under the bed. */}
			<defs>
				<clipPath id={`lg${id}`}>
					<path d={groundPath} />
				</clipPath>
			</defs>
			<g clipPath={`url(#lg${id})`}>
				<path d={band((x) => surface(x) + CLAY, () => 760)} fill={COLOURS.rock[2]} />
				<path d={band((x) => surface(x) + CLAY, (x) => surface(x) + 130)} fill={COLOURS.rock[0]} stroke={withAlpha('#3D2B1A', 0.25)} strokeWidth={1.4} />
				<path d={band((x) => surface(x) + 130, (x) => surface(x) + 215)} fill={COLOURS.rock[1]} stroke={withAlpha('#3D2B1A', 0.25)} strokeWidth={1.4} />
				<path d={band((x) => surface(x) + SOIL, (x) => surface(x) + CLAY)} fill={clayColour} stroke={withAlpha('#3D2B1A', 0.3)} strokeWidth={1.4} />
				<path d={band(surface, (x) => surface(x) + SOIL)} fill={soilColour(wet * 0.9)} />
				<path d={band(surface, (x) => surface(x) + 7)} fill={COLOURS.topsoil} opacity={0.7} />
				{/* The wetting front going down through the soil. */}
				<path d={band(surface, (x) => surface(x) + SOIL * clamp01(amount('su') * 1.5))} fill={COLOURS.waterDeep} opacity={0.16 * (1 - slide)} />
				{/* Pebbles in the rock. */}
				{Array.from({length: 46}, (_, index) => {
					const x = SCENE.left + noise(index * 4.1) * (SCENE.right - SCENE.left);
					return <ellipse key={index} cx={x} cy={surface(x) + 70 + noise(index * 2.7) * 120} rx={4 + 4 * noise(index)} ry={2.5 + 2 * noise(index + 9)} fill={withAlpha('#5B4630', 0.25)} />;
				})}
				{/* The layers lit one by one. */}
				{[
					[(x: number) => surface(x), (x: number) => surface(x) + SOIL],
					[(x: number) => surface(x) + SOIL, (x: number) => surface(x) + CLAY],
					[(x: number) => surface(x) + CLAY, (x: number) => surface(x) + 130],
				].map(([top, bottom], index) => {
					const lit = clock.current === 'tabaka' ? clamp01(clock.progress * 3 - index) * (1 - clamp01(clock.progress * 3 - index - 1) * 0.6) : 0;
					return lit > 0 ? <path key={index} d={band(top, bottom, FOOT, CREST + 120)} fill="none" stroke={palette.lesson} strokeWidth={4} opacity={lit} /> : null;
				})}
			</g>
			{/* The valley: the stream in its bed (it backs up into a lake once the mass blocks it), the road cut into the foot. */}
			<path d={pathOf([...sampled((x) => Math.max(waterLevel, surface(x)), SCENE.left - 100, lakeRight, 5), ...sampled(surface, SCENE.left - 100, lakeRight, 5).reverse()], true)} fill={COLOURS.water} opacity={0.9} />
			<path d={pathOf([[SCENE.left - 100, waterLevel], [lakeRight, waterLevel]])} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} strokeDasharray="16 22" strokeDashoffset={-time * 20} />
			<path d={pathOf([[ROAD[0], surface(ROAD[0]) - 1], [ROAD[1], surface(ROAD[1]) - 1]])} stroke={COLOURS.road} strokeWidth={7} />
			<path d={pathOf([[ROAD[0] + 6, surface(ROAD[0]) - 1], [ROAD[1] - 6, surface(ROAD[1]) - 1]])} stroke="#F5F0E6" strokeWidth={1.5} strokeDasharray="10 9" />
			<g transform={`translate(488 ${surface(488) - 4})`}>
				<path d="M-22 0 L-22 -10 L-12 -12 L-6 -22 L12 -22 L18 -12 L24 -10 L24 0 Z" fill="#3E6FA3" stroke="#22405E" strokeWidth={1.5} />
				<circle cx={-12} cy={0} r={5} fill="#222" />
				<circle cx={14} cy={0} r={5} fill="#222" />
			</g>
			<Grass ground={surface} x0={SCENE.left} x1={TOE} count={22} seed={3} />
			<Grass ground={surface} x0={HEAD} x1={SCENE.right} count={20} seed={9} />
			{/* Snow on the high ground melting away. */}
			<path d={band((x) => surface(x) - 13 * (1 - smooth(amount('su'))) * smoothStep(clamp01((x - 1150) / 120)), surface, 1100, SCENE.right + 100)} fill={COLOURS.snow} stroke="#DCE7F0" strokeWidth={1} />
			<FlowLine d={smoothPath(sampled((x) => surface(x) - 3, 1230, 980, 20))} time={time} width={4} opacity={amount('su') * (1 - amount('kutle'))} />
			{/* Water soaking down through the soil. */}
			<g opacity={amount('su') * (1 - slide) * 0.9}>
				{Array.from({length: 44}, (_, index) => {
					const x = 600 + noise(index * 3.3) * 900;
					const fall = (time * 0.6 + noise(index * 1.9)) % 1;
					return <circle key={index} cx={x} cy={surface(x) + 3 + fall * (SOIL - 4)} r={2.6} fill={COLOURS.waterDeep} opacity={1 - fall * 0.6} />;
				})}
			</g>
			{/* The wet clay shines and water runs along it: the slip surface. */}
			<g opacity={clayWet * (1 - slide)}>
				<FlowLine d={smoothPath(sampled((x) => surface(x) + SOIL + 8, HEAD - 10, TOE + 20, 20))} time={time} width={5} colour={withAlpha('#B7C9D6', 0.9)} speed={40} />
			</g>
			{/* The crack at the top of the mass. */}
			{crack > 0 && slide < 0.05 ? <path d={pathOf([[HEAD - 9 * crack, surface(HEAD - 9 * crack)], [HEAD + 3 * crack, surface(HEAD + 3 * crack)], [HEAD, surface(HEAD) + 44 * crack]], true)} fill="#2E2318" /> : null}
			{/* The sliding mass, its clay sole and its grass. */}
			<path d={massPath} fill={soilColour(wet * 0.9)} stroke={withAlpha('#3D2B1A', 0.45)} strokeWidth={1.5} />
			<path d={clayStrip} fill={clayColour} opacity={0.95} />
			<path d={pathOf(massTop)} fill="none" stroke={COLOURS.topsoil} strokeWidth={6} strokeLinecap="round" />
			<Grass ground={(x) => {
				const k = clamp01((x - columns[0].x) / (columns[COLUMNS - 1].x - columns[0].x || 1)) * (COLUMNS - 1);
				const i = Math.min(COLUMNS - 2, Math.floor(k));
				return lerp(columns[i].top, columns[i + 1].top, k - i);
			}} x0={columns[2].x} x1={columns[COLUMNS - 3].x} count={20} seed={5} />
			{/* Trees on the slope ride with the mass and tilt: the head rotates back, the toe pitches forward. */}
			{TREES.map((tree, index) => {
				const onMass = tree.x > TOE && tree.x < HEAD;
				const where = onMass ? ride(columns, tree.x) : {x: tree.x, y: surface(tree.x), u: 0};
				const tilt = onMass ? slide * lerp(-26, 16, where.u) + creep * lerp(-5, -2, where.u) + slide * 4 * Math.sin(index * 2.1) : 0;
				return <Tree key={index} x={where.x} y={where.y + 2} size={tree.size} kind={tree.kind} tilt={tilt} seed={index} />;
			})}
			{/* The house on its foundation rides too. */}
			<g transform={`translate(${house.x - HOUSE_X} ${house.y - surface(HOUSE_X)}) rotate(${slide * -9 + creep * -1.5} ${HOUSE_X} ${houseBase})`}>
				<path d={pathOf([[HOUSE_X - 32, houseBase], [HOUSE_X + 32, houseBase], [HOUSE_X + 32, surface(HOUSE_X + 32) + 4], [HOUSE_X - 32, surface(HOUSE_X - 32) + 4]], true)} fill={COLOURS.foundation} stroke="#5E554B" strokeWidth={1.5} />
				<House x={HOUSE_X} y={houseBase} size={1.05} crack={clamp01(slide * 1.5 + crack * 0.4)} />
			</g>
			{/* Dust and tumbling rocks while it moves. */}
			<g opacity={Math.sin(Math.PI * clamp01(slide)) * 0.9}>
				{Array.from({length: 14}, (_, index) => {
					const phase = (time * 0.9 + noise(index * 3.7)) % 1;
					const column = columns[Math.floor(noise(index * 5.1) * 18)];
					return <circle key={index} cx={column.x - 20 + 40 * noise(index) - phase * 30} cy={column.top - 10 - phase * 40} r={12 + 36 * phase} fill="#C9B79C" opacity={(1 - phase) * 0.45} />;
				})}
				{Array.from({length: 6}, (_, index) => {
					const x = toeFront - 18 - 70 * noise(index * 2.3);
					return <rect key={index} x={-6} y={-6} width={12 + 6 * noise(index)} height={10} rx={3} fill="#7E6A55" transform={`translate(${x} ${surface(x) - 7}) rotate(${time * 240 * (0.5 + noise(index))})`} />;
				})}
			</g>
			{/* The slope angle at the foot. */}
			<g opacity={clock.current === 'egim' ? smooth(clamp01(clock.seconds / 1.2)) : clock.current === 'tabaka' ? 1 - clamp01(clock.seconds / 1.2) : 0}>
				<line x1={FOOT} y1={VALLEY_Y - 3} x2={FOOT + 260} y2={VALLEY_Y - 3} stroke={palette.ink} strokeWidth={2.5} strokeDasharray="10 8" />
				<line x1={FOOT} y1={VALLEY_Y - 3} x2={CREST} y2={TOP_Y} stroke={palette.ink} strokeWidth={2.5} strokeDasharray="10 8" />
				<path d={`M${FOOT + 200} ${VALLEY_Y - 3} A200 200 0 0 0 ${FOOT + 200 * Math.cos((angle * Math.PI) / 180)} ${VALLEY_Y - 3 - 200 * Math.sin((angle * Math.PI) / 180)}`} fill="none" stroke={palette.lesson} strokeWidth={5} />
				{/* Gravity pulls the soil down the slope. */}
				<path d={`M${880} ${surface(880) - 24} L${880 - 120 * Math.cos((angle * Math.PI) / 180)} ${surface(880) - 24 + 120 * Math.sin((angle * Math.PI) / 180)}`} stroke={palette.lesson} strokeWidth={7} strokeLinecap="round" />
				<path d={`M0 0 l-16 -9 l0 18 z`} fill={palette.lesson} transform={`translate(${880 - 128 * Math.cos((angle * Math.PI) / 180)} ${surface(880) - 24 + 128 * Math.sin((angle * Math.PI) / 180)}) rotate(${180 - angle})`} />
			</g>
			{/* The lake behind the blocked valley, seen from above. */}
			<LakeInset show={clock.current === 'set' ? smooth(clamp01((clock.seconds - 0.8) / 0.8)) : 0} lake={lake} time={time} />
			<ProcessLabel id="egim" at={[FOOT + 150, VALLEY_Y - 40]} to={[400, 430]} text="Eğim fazla: yamaç dengesiz" show={clock.now('egim')} />
			<ProcessLabel id="tabaka" at={[760, surface(760) + 20]} to={[620, 330]} text="Tabakalar yamaca paralel" show={clock.now('tabaka')} />
			<ProcessLabel id="su" at={[880, surface(880) + 14]} to={[760, 250]} text="Toprak suya doyar, ağırlaşır" show={clock.now('su')} />
			<ProcessLabel id="kayma" at={[960, surface(960) + SOIL + 8]} to={[790, 330]} text="Islanan kil: kayma yüzeyi" show={clock.now('kayma')} />
			<ProcessLabel id="catlak" at={[HEAD, surface(HEAD) + 6]} to={[HEAD + 40, surface(HEAD) - 70]} text="Çatlak açılır" anchor="start" show={Math.min(crack, clock.now('kayma'))} />
			<ProcessLabel id="yol" at={[500, surface(500) - 4]} to={[470, 440]} text="Etek yol için kazıldı" show={clock.current === 'kutle' ? 1 - clamp01(slide * 2.5) : 0} />
			<ProcessLabel id="kutle" at={[ride(columns, 900).x, ride(columns, 900).y + 10]} to={[ride(columns, 900).x + 40, 250]} text="Kütle kopar ve kayar" show={Math.min(clamp01(slide * 3), clock.now('kutle'))} />
			<ProcessLabel id="set" at={[Math.max(SCENE.left + 60, toeFront - 120), waterLevel + 4]} to={[Math.max(SCENE.left + 140, toeFront - 60), 430]} text="Heyelan set gölü" show={lake > 0.05 ? 1 : 0} />
		</ProcessFrame>
	);
};

/** The valley from above: the river, the tongue of the slide across it and the lake growing upstream. */
const LakeInset: React.FC<{show: number; lake: number; time: number}> = ({show, lake, time}) => {
	const palette = useVisualPalette();
	if (show <= 0.01) return null;
	const box = {x: 70, y: 96, w: 480, h: 250};
	const river = (x: number) => box.y + 150 + 14 * Math.sin((x - box.x) / 60);
	const tongueX = box.x + 300;
	const lakeLength = 30 + 230 * lake;
	const lakeWidth = 14 + 46 * lake;
	const lakeShape: Point[] = [
		...sampled((x) => river(x) - lakeWidth * Math.sin(Math.PI * clamp01((tongueX - x) / lakeLength)) - 7, tongueX - lakeLength, tongueX, 10),
		...sampled((x) => river(x) + lakeWidth * 0.8 * Math.sin(Math.PI * clamp01((tongueX - x) / lakeLength)) + 7, tongueX - lakeLength, tongueX, 10).reverse(),
	];
	return (
		<g opacity={show}>
			<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#E9F1DC" stroke={withAlpha(palette.ink, 0.35)} strokeWidth={2.5} />
			<path d={`M${box.x} ${box.y + 16} Q${box.x + box.w / 2} ${box.y + 70} ${box.x + box.w} ${box.y + 30} L${box.x + box.w} ${box.y + 16} Q${box.x + box.w} ${box.y} ${box.x + box.w - 16} ${box.y} L${box.x + 16} ${box.y} Q${box.x} ${box.y} ${box.x} ${box.y + 16} Z`} fill="#A9C58A" />
			<path d={`M${box.x} ${box.y + box.h - 30} Q${box.x + box.w / 2} ${box.y + box.h - 70} ${box.x + box.w} ${box.y + box.h - 40} L${box.x + box.w} ${box.y + box.h - 16} Q${box.x + box.w} ${box.y + box.h} ${box.x + box.w - 16} ${box.y + box.h} L${box.x + 16} ${box.y + box.h} Q${box.x} ${box.y + box.h} ${box.x} ${box.y + box.h - 16} Z`} fill="#A9C58A" />
			<FlowLine d={smoothPath(sampled(river, box.x + 4, tongueX, 12))} time={time} width={9} />
			<FlowLine d={smoothPath(sampled(river, tongueX, box.x + box.w - 4, 12))} time={time} width={9 - 6 * lake} opacity={1 - 0.5 * lake} />
			<path d={smoothPath(lakeShape, true)} fill="#5A97CF" opacity={0.95} />
			{/* The tongue of the slide, from the hillside across the valley. */}
			<path d={`M${tongueX - 50} ${box.y + 30} C${tongueX - 60} ${box.y + 110} ${tongueX - 40} ${box.y + 190} ${tongueX + 2} ${box.y + 196} C${tongueX + 44} ${box.y + 190} ${tongueX + 60} ${box.y + 110} ${tongueX + 46} ${box.y + 30} Z`} fill="#9C7046" stroke="#5E4128" strokeWidth={2} />
			{Array.from({length: 7}, (_, index) => (
				<circle key={index} cx={tongueX - 30 + 60 * noise(index * 3.1)} cy={box.y + 60 + 120 * noise(index * 7.3)} r={4} fill="#5E4128" opacity={0.6} />
			))}
			<text x={box.x + 18} y={box.y + 36} fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink}>
				Kuşbakışı
			</text>
			<text x={box.x + box.w - 14} y={box.y + box.h - 14} textAnchor="end" fontFamily={palette.fontBody} fontWeight={700} fontSize={20} fill={palette.muted}>
				Uzungöl · Tortum · Sera
			</text>
		</g>
	);
};
