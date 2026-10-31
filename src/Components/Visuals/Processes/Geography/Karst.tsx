import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import type {VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, Drift, FlowLine, Grass, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, processCamera, sampled, smoothPath, useProcessClock, type CameraBox} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Karst, as the lesson tells it, on a limestone plateau in cross-section: rain made acid by carbon dioxide eats
 * grooves into the bare rock (lapya); where joints cross, funnels sink (dolin) and join (uvala); a wide flat-floored
 * basin forms with fields on its alluvium (polye); its stream vanishes down a swallow hole (düden) into a tunnel, and
 * over a hollow the roof breaks and falls in (obruk); in the cave below, drips build stalactites down and stalagmites
 * up until they meet as a column; and where the underground stream comes out on the hillside, lime is laid down in
 * white terraces of pools (traverten).
 */

const PLATEAU = 200;
const EDGE = 1150;
const VALLEY_Y = 600;
const SLOPE_END = 1560;
const CAVE = {x0: 400, x1: 880};
const TUNNEL_Y = 440;
const SPRING_Y = 440;
const DUDEN_X = 895;
const OBRUK = {x0: 985, x1: 1095, floor: 405};
const DOLINS = [
	{x: 420, half: 66, depth: 58},
	{x: 580, half: 58, depth: 46},
];
const POLJE = {x0: 650, x1: 935, depth: 74};

const plateau = (x: number) => PLATEAU + 4 * Math.sin(x / 63);
const base = (x: number): number => {
	if (x <= EDGE) return plateau(x);
	if (x >= SLOPE_END) return VALLEY_Y;
	return lerp(plateau(EDGE), VALLEY_Y, smoothStep((x - EDGE) / (SLOPE_END - EDGE)));
};
/** Where the spring comes out: the slope at the tunnel's height. */
const SPRING_X = (() => {
	let x = EDGE;
	while (base(x) < SPRING_Y && x < SLOPE_END) x += 1;
	return x;
})();

const bowl = (u: number) => (Math.abs(u) < 1 ? (1 - u * u) ** 2 : 0);
const ceiling = (x: number) => 334 + 10 * Math.sin(x / 37) + 8 * Math.cos(x / 71) - 24 * bowl((x - 640) / 240);
const caveFloor = (x: number) => 446 + 5 * Math.sin(x / 53);

const COLOURS = {
	limestone: '#DAD3C2',
	limestoneDark: '#C7BEA9',
	bedding: '#A99F8A',
	cave: '#3B332C',
	caveLight: '#6C5D4E',
	speleothem: '#EFE7D6',
	alluvium: '#8C6B47',
	field: '#A6C47E',
	water: '#5A97CF',
	travertine: '#FBFAF6',
	pool: '#7CC4E4',
};

const FRAMING: Record<string, CameraBox> = {
	lapya: [60, 100, 430, 330],
	dolin: [300, 100, 700, 340],
	polye: [600, 100, 1040, 380],
	obruk: [840, 100, 1220, 480],
	magara: [380, 280, 900, 480],
	traverten: [1240, 360, 1560, 630],
};

export const KarstProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('karst', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const grooves = smooth(amount('lapya'));
	const dolin = smooth(clamp01(amount('dolin') * 1.6));
	const uvala = smoothStep(clamp01((amount('dolin') - 0.5) / 0.5));
	const polje = smooth(amount('polye'));
	const obruk = amount('obruk');
	const hollow = smooth(clamp01(obruk / 0.5));
	const collapse = clock.current === 'obruk' ? smoothStep(clamp01((clock.progress - 0.55) / 0.22)) : obruk >= 1 ? 1 : 0;
	const cave = 0.3 + 0.7 * smooth(clamp01(amount('magara') * 3));
	const dripstone = smooth(clamp01((amount('magara') - 0.2) / 0.8));
	const terraces = amount('traverten');
	const rain = {lapya: 0.75, dolin: 0.45, polye: 0.35, obruk: 0.3}[clock.current] ?? 0;

	/** The ground today: grooves, funnels, the basin and the collapsed shaft cut into the plateau. */
	const surface = (x: number): number => {
		let y = base(x);
		if (x > 100 && x < 345) {
			const k = ((x - 100) % 26) - 13;
			y += grooves * 24 * Math.max(0, 1 - Math.abs(k) / 6) * (0.7 + 0.3 * noise(Math.floor((x - 100) / 26)));
		}
		y += dolin * DOLINS.reduce((sum, item) => sum + item.depth * bowl((x - item.x) / item.half), 0);
		y += uvala * 34 * bowl((x - 500) / 140);
		y += polje * POLJE.depth * smoothStep(clamp01((x - POLJE.x0) / 55)) * smoothStep(clamp01((POLJE.x1 - x) / 45));
		const shaft = smoothStep(clamp01((x - OBRUK.x0) / 8)) * smoothStep(clamp01((OBRUK.x1 - x) / 8));
		return lerp(y, OBRUK.floor, collapse * shaft);
	};
	const ground = sampled(surface, SCENE.left - 120, SCENE.right + 120, 3);
	const body = pathOf([...ground, [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	const caveCeiling = (x: number) => lerp(caveFloor(x) - 18, ceiling(x), cave * smoothStep(clamp01((x - CAVE.x0) / 40)) * smoothStep(clamp01((CAVE.x1 - x) / 40)));
	const cavePath = smoothPath([...sampled(caveCeiling, CAVE.x0, CAVE.x1, 20), ...sampled(caveFloor, CAVE.x0, CAVE.x1, 20).reverse()], true);
	const tunnel = pathOf([[CAVE.x1 - 30, TUNNEL_Y - 9], [SPRING_X, SPRING_Y - 9], [SPRING_X, SPRING_Y + 7], [CAVE.x1 - 30, TUNNEL_Y + 7]], true);
	const hollowPath = `M${OBRUK.x0 - 10} ${TUNNEL_Y} C${OBRUK.x0 - 30} ${TUNNEL_Y - 90 * hollow} ${OBRUK.x1 + 30} ${TUNNEL_Y - 100 * hollow} ${OBRUK.x1 + 10} ${TUNNEL_Y} Z`;

	const stalactites = [440, 488, 540, 600, 655, 715, 770, 830];
	const spring = smooth(clamp01(terraces * 4));

	return (
		<ProcessFrame process="karst" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			<g opacity={clamp01(rain * 1.4)}>
				<Cloud x={240} y={112} scale={1.05} dark={0.5} />
				<Cloud x={620} y={100} scale={1.2} dark={0.55} />
				<Cloud x={980} y={116} scale={1} dark={0.5} />
			</g>
			<Rain x0={SCENE.left} x1={1200} top={SCENE.top - 20} ground={surface} time={time} amount={rain} count={90} />
			{/* The limestone: beds and joints, the cave, the tunnel and the shaft dissolved in it. */}
			<defs>
				<clipPath id={`kb${id}`}>
					<path d={body} />
				</clipPath>
				<radialGradient id={`kc${id}`} cx="0.5" cy="0.55" r="0.6">
					<stop offset="0" stopColor={COLOURS.caveLight} />
					<stop offset="1" stopColor={COLOURS.cave} />
				</radialGradient>
			</defs>
			<path d={body} fill={COLOURS.limestone} />
			<g clipPath={`url(#kb${id})`}>
				{Array.from({length: 12}, (_, index) => {
					const y = PLATEAU + 34 + index * 38;
					return <path key={index} d={pathOf(sampled((x) => y + 3 * Math.sin(x / 90 + index), SCENE.left - 100, SCENE.right + 100, 40))} fill="none" stroke={COLOURS.bedding} strokeWidth={1.6} opacity={0.65} />;
				})}
				{Array.from({length: 6}, (_, index) => (
					<rect key={index} x={SCENE.left - 100} y={PLATEAU + 34 + index * 76} width={SCENE.right - SCENE.left + 200} height={38} fill={COLOURS.limestoneDark} opacity={0.4} />
				))}
				{[160, 260, 420, 580, 740, 840, 1040, 1120].map((x, index) => (
					<path key={x} d={`M${x} ${PLATEAU - 10} L${x + 8 * Math.sin(index)} ${PLATEAU + 120} L${x - 6 * Math.cos(index)} ${PLATEAU + 260}`} fill="none" stroke={COLOURS.bedding} strokeWidth={x === 420 || x === 580 ? 2 + 4 * dolin : 2} />
				))}
				{/* Water carrying dissolved lime down the joints. */}
				<Drift points={[[420, PLATEAU], [426, PLATEAU + 140], [420, PLATEAU + 250]]} time={time} count={12} amount={rain} colour={COLOURS.water} size={3} speed={0.3} spread={2} />
				<Drift points={[[260, PLATEAU], [266, PLATEAU + 140], [258, PLATEAU + 250]]} time={time} count={10} amount={rain} colour={COLOURS.water} size={3} speed={0.3} spread={2} seed={7} />
				{/* The cave and the tunnel to the spring. */}
				<path d={cavePath} fill={`url(#kc${id})`} />
				<path d={tunnel} fill={COLOURS.cave} />
				<path d={hollowPath} fill={COLOURS.cave} opacity={hollow > 0.02 ? 1 : 0} />
				{/* The underground stream: from the swallow hole down to the tunnel, along it to the spring. */}
				<g opacity={smooth(amount('polye'))}>
					<path d={`M${DUDEN_X - 9} ${surface(DUDEN_X)} C${DUDEN_X - 4} ${surface(DUDEN_X) + 60} ${DUDEN_X - 14} ${TUNNEL_Y - 80} ${DUDEN_X - 6} ${TUNNEL_Y} L${DUDEN_X + 10} ${TUNNEL_Y} C${DUDEN_X + 2} ${TUNNEL_Y - 80} ${DUDEN_X + 12} ${surface(DUDEN_X) + 60} ${DUDEN_X + 9} ${surface(DUDEN_X)} Z`} fill={COLOURS.cave} />
					<Drift points={[[DUDEN_X, surface(DUDEN_X) + 4], [DUDEN_X - 4, (surface(DUDEN_X) + TUNNEL_Y) / 2], [DUDEN_X + 2, TUNNEL_Y - 2]]} time={time} count={10} colour="#8EC3EC" size={3} speed={0.6} spread={2} />
				</g>
				<FlowLine d={smoothPath([[CAVE.x0 + 20, caveFloor(CAVE.x0 + 20) - 4], [CAVE.x1 - 40, caveFloor(CAVE.x1 - 40) - 4], [SPRING_X - 4, SPRING_Y]])} time={time} width={6} />
			</g>
			{/* Fields on the basin's alluvium, and its stream running to the swallow hole. */}
			<g opacity={polje}>
				<path d={pathOf([...sampled((x) => surface(x) - 1, POLJE.x0 + 50, POLJE.x1 - 40, 6), ...sampled((x) => surface(x) + 10, POLJE.x0 + 50, POLJE.x1 - 40, 6).reverse()], true)} fill={COLOURS.alluvium} />
				{[0, 1, 2, 3, 4].map((index) => {
					const x = POLJE.x0 + 70 + index * 46;
					return <rect key={index} x={x} y={surface(x) - 4} width={38} height={4} fill={index % 2 ? '#D9C26A' : COLOURS.field} />;
				})}
				<FlowLine d={smoothPath(sampled((x) => surface(x) - 3, POLJE.x0 + 70, DUDEN_X - 4, 20))} time={time} width={5} />
			</g>
			{/* The far wall of the shaft, seen through it, and the pool at its floor. */}
			<g opacity={collapse}>
				<path d={pathOf([...sampled(base, OBRUK.x0 + 2, OBRUK.x1 - 2, 6), [OBRUK.x1 - 2, OBRUK.floor], [OBRUK.x0 + 2, OBRUK.floor]], true)} fill="#B3A890" />
				{[0, 1, 2, 3].map((index) => (
					<line key={index} x1={OBRUK.x0 + 2} x2={OBRUK.x1 - 2} y1={PLATEAU + 34 + index * 45} y2={PLATEAU + 38 + index * 45} stroke={COLOURS.bedding} strokeWidth={1.5} />
				))}
				<path d={pathOf([[OBRUK.x0 + 2, OBRUK.floor - 14], [OBRUK.x1 - 2, OBRUK.floor - 14], [OBRUK.x1 - 2, OBRUK.floor], [OBRUK.x0 + 2, OBRUK.floor]], true)} fill={COLOURS.water} opacity={0.9} />
			</g>
			{/* The roof over the hollow breaking and falling in. */}
			{collapse > 0 && collapse < 1
				? Array.from({length: 6}, (_, index) => {
						const x = OBRUK.x0 + 10 + index * 17;
						const fall = collapse * collapse * (OBRUK.floor - base(x) - 20) * (0.8 + 0.3 * noise(index));
						return <path key={index} d="M-9 -6 L9 -7 L10 6 L-8 7 Z" fill={COLOURS.limestoneDark} stroke={COLOURS.bedding} strokeWidth={1.2} transform={`translate(${x} ${base(x) + 10 + fall}) rotate(${collapse * 160 * (noise(index) - 0.5)})`} />;
					})
				: null}
			<g opacity={collapse * 0.8}>
				{Array.from({length: 8}, (_, index) => {
					const phase = (time * 0.7 + noise(index)) % 1;
					return <circle key={index} cx={OBRUK.x0 + 20 + 70 * noise(index * 3)} cy={base(OBRUK.x0) - 10 - 60 * phase} r={10 + 26 * phase} fill="#E5DED0" opacity={(1 - phase) * (1 - collapse * 0.7)} />;
				})}
				{/* Rubble on the shaft's floor. */}
				{Array.from({length: 9}, (_, index) => (
					<path key={`r${index}`} d="M-8 0 L-4 -9 L7 -8 L9 0 Z" fill={COLOURS.limestoneDark} stroke={COLOURS.bedding} transform={`translate(${OBRUK.x0 + 10 + index * 11} ${OBRUK.floor + 2})`} />
				))}
			</g>
			{/* Dripstones grow from the drips: down from the roof, up from the floor, until one pair meets as a column. */}
			<g opacity={cave > 0.5 ? 1 : 0}>
				{stalactites.map((x, index) => {
					const gap = caveFloor(x) - caveCeiling(x);
					const column = index === 4;
					const down = dripstone * (column ? gap * 0.56 : 16 + 30 * noise(index));
					const up = dripstone * (column ? gap * 0.46 : 10 + 18 * noise(index + 6));
					const w = 3.5 + 3 * noise(index + 2) + (column ? 5 * dripstone : 0);
					const drip = (time * 0.8 + noise(index * 4)) % 1;
					const tip = caveCeiling(x) + down;
					return (
						<g key={x}>
							<path d={`M${x - w} ${caveCeiling(x) - 2} Q${x - w * 0.3} ${tip - down * 0.3} ${x} ${tip} Q${x + w * 0.3} ${tip - down * 0.3} ${x + w} ${caveCeiling(x) - 2} Z`} fill={COLOURS.speleothem} />
							<path d={`M${x - w * 1.2} ${caveFloor(x) + 2} Q${x - w * 0.4} ${caveFloor(x) - up * 0.6} ${x} ${caveFloor(x) - up} Q${x + w * 0.4} ${caveFloor(x) - up * 0.6} ${x + w * 1.2} ${caveFloor(x) + 2} Z`} fill={COLOURS.speleothem} />
							{dripstone > 0.05 && !(column && dripstone > 0.95) ? <circle cx={x} cy={lerp(tip + 3, caveFloor(x) - up - 2, drip)} r={2.6} fill="#9CD0F0" opacity={1 - drip * 0.4} /> : null}
						</g>
					);
				})}
			</g>
			{/* Travertine terraces build down the slope from the spring. */}
			<FlowLine d={smoothPath(sampled((x) => base(x) - 3, SPRING_X, SLOPE_END + 40, 12))} time={time} width={6} opacity={0.35 + 0.65 * spring} />
			{Array.from({length: 6}, (_, index) => {
				const grow = smooth(clamp01(terraces * 8 - index * 0.9));
				if (grow <= 0.01) return null;
				const x = SPRING_X + 6 + index * 28;
				const y = base(x) - 2;
				const reach = 52 * grow;
				const lip = 18 + 10 * grow;
				return (
					<g key={index}>
						<path d={`M${x - 6} ${y} L${x + reach} ${y} Q${x + reach + 8} ${y + 4} ${x + reach + 4} ${y + lip} L${x + reach + 4} ${base(x + reach + 4)} Z`} fill={COLOURS.travertine} stroke="#D9D3C4" strokeWidth={1.4} />
						<rect x={x - 2} y={y - 3} width={Math.max(0, reach - 2)} height={4} rx={2} fill={COLOURS.pool} />
						<FlowLine d={`M${x + reach + 2} ${y} Q${x + reach + 9} ${y + lip * 0.5} ${x + reach + 6} ${y + lip}`} time={time} width={3} colour={COLOURS.pool} opacity={grow} />
					</g>
				);
			})}
			<Grass ground={surface} x0={SCENE.left} x1={95} count={4} seed={2} />
			<Grass ground={surface} x0={350} x1={POLJE.x0} count={10} seed={4} opacity={0.8} />
			<Grass ground={surface} x0={OBRUK.x1 + 10} x1={EDGE} count={4} seed={6} />
			<Grass ground={surface} x0={SLOPE_END - 10} x1={SCENE.right} count={3} seed={8} />
			{/* The chemistry, while it rains on the bare rock. */}
			<ProcessLabel id="lapya" at={[226, surface(226) + 6]} to={[240, 150]} text="Lapya: erime olukları" show={clock.now('lapya')} />
			<ProcessLabel id="lapya" at={[120, 170]} to={[120, 120]} text="CO₂ + yağmur suyu kalkeri eritir" anchor="start" show={clock.now('lapya')} size={21} />
			<ProcessLabel id="dolin" at={[420, surface(420)]} to={[380, 140]} text="Dolin" show={clock.now('dolin')} />
			<ProcessLabel id="uvala" at={[500, surface(500) - 2]} to={[580, 140]} text="Uvala: dolinler birleşir" show={Math.min(clock.now('dolin'), uvala * 2)} />
			<ProcessLabel id="polye" at={[790, surface(790) - 6]} to={[790, 140]} text="Polye: düz tabanlı büyük çukur" show={clock.now('polye')} />
			<ProcessLabel id="duden" at={[DUDEN_X, surface(DUDEN_X) + 4]} to={[880, 150]} text="Düden" show={clock.now('obruk')} />
			<ProcessLabel id="obruk" at={[(OBRUK.x0 + OBRUK.x1) / 2, OBRUK.floor - 40]} to={[1120, 150]} text="Obruk" anchor="start" show={Math.min(clock.now('obruk'), collapse * 2)} />
			<ProcessLabel id="magara" at={[520, 400]} to={[520, 300]} text="Mağara" show={clock.now('magara')} size={23} />
			<ProcessLabel id="sarkit" at={[stalactites[1], caveCeiling(stalactites[1]) + 12]} to={[470, 470]} text="Sarkıt" show={clock.now('magara') * clamp01(dripstone * 3)} size={22} />
			<ProcessLabel id="dikit" at={[stalactites[6], caveFloor(stalactites[6]) - 8]} to={[800, 475]} text="Dikit" show={clock.now('magara') * clamp01(dripstone * 3)} size={22} />
			<ProcessLabel id="sutun" at={[stalactites[4], (caveFloor(stalactites[4]) + caveCeiling(stalactites[4])) / 2]} to={[700, 300]} text="Sütun" show={clock.now('magara') * clamp01((dripstone - 0.9) * 10)} size={23} />
			<ProcessLabel id="kaynak" at={[SPRING_X, SPRING_Y]} to={[SPRING_X - 70, 540]} text="Karstik kaynak" show={clock.now('traverten')} />
			<ProcessLabel id="traverten" at={[SPRING_X + 70, base(SPRING_X + 70) - 4]} to={[SPRING_X + 10, 400]} text="Traverten" show={clock.now('traverten') * clamp01(terraces * 3)} />
		</ProcessFrame>
	);
};
