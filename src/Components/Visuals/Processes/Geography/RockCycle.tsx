import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Drift, FlowLine, ProcessFrame, ProcessLabel, SCENE, Sky, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The rock cycle in one cross-section, from a volcano to the sea: magma churns in its chamber; deep down it cools
 * slowly into granite whose crystals grow large, while lava poured out on the surface cools fast into fine-grained
 * basalt (each seen through a lens); the granite mountain weathers, a river carries its grains to the sea, where they
 * settle in layers (sand, clay, lime with shells) that are pressed into sedimentary rock; buried deeper, heat and
 * pressure fold and change them (limestone into marble), and deeper still they melt back into magma. A ring in the
 * corner keeps the whole cycle in view.
 */

const LAND = 430;
const SEA_LEVEL = 340;
const SEA_FLOOR = 486;
const COAST = [1000, 1170] as const;
const CHAMBER = {x: 300, y: 600, rx: 160, ry: 58};
const PEAK = {x: 300, height: 262};
const MOUNTAIN = {x: 740, half: 190, height: 220};

const volcano = (x: number) => {
	const d = Math.abs(x - PEAK.x) / 230;
	const cone = d < 1 ? PEAK.height * (1 - d) ** 1.2 : 0;
	const crater = Math.abs(x - PEAK.x) < 26 ? 20 * (1 - ((x - PEAK.x) / 26) ** 2) : 0;
	return cone - crater;
};
const mountain = (x: number) => {
	const d = (x - MOUNTAIN.x) / MOUNTAIN.half;
	return Math.abs(d) < 1 ? MOUNTAIN.height * (1 - d * d) ** 1.4 * (1 + 0.05 * Math.sin(x / 13)) : 0;
};
const ground = (x: number): number => {
	if (x < COAST[0]) return LAND - volcano(x) - mountain(x);
	if (x < COAST[1]) return lerp(LAND, SEA_FLOOR, smoothStep((x - COAST[0]) / (COAST[1] - COAST[0])));
	return SEA_FLOOR;
};

const COLOURS = {
	crust: '#9C8B76',
	crustDeep: '#857360',
	magma: '#F06A28',
	magmaHot: '#FFC247',
	granite: '#E7B9A6',
	basalt: '#4A4744',
	sea: '#6AA6D8',
	sand: '#E6CD8E',
	clay: '#A99886',
	lime: '#E9E3D3',
	marble: '#F2F0EC',
	schist: '#6F7A82',
};

const FRAMING: Record<string, CameraBox> = {
	magma: [80, 380, 620, 640],
	magmatik: [60, 110, 960, 640],
	tortul: [660, 110, 1560, 640],
	baskalasim: undefined,
};

const LAYERS = [
	{name: 'kum', colour: COLOURS.sand, thick: 22, meta: '#D6C9A8'},
	{name: 'kil', colour: COLOURS.clay, thick: 20, meta: COLOURS.schist},
	{name: 'kalker', colour: COLOURS.lime, thick: 24, meta: COLOURS.marble},
];

export const RockCycleProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('rockcycle', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const cool = smooth(amount('magmatik'));
	const erupt = clock.current === 'magmatik' ? smooth(clamp01(clock.progress * 2)) : amount('magmatik');
	const lavaCool = smoothStep(clamp01((amount('magmatik') - 0.4) / 0.6));
	const weather = smooth(clamp01(amount('tortul') * 1.6));
	const settle = amount('tortul');
	const press = smoothStep(clamp01((amount('tortul') - 0.75) / 0.25));
	const bury = smooth(clamp01(amount('baskalasim') * 1.6));
	const melt = smoothStep(clamp01((amount('baskalasim') - 0.55) / 0.45));

	const groundPath = pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 5), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	const sea = pathOf([...sampled((x) => Math.min(ground(x), SEA_LEVEL), COAST[0], SCENE.right + 120, 8), ...sampled(ground, COAST[0], SCENE.right + 120, 8).reverse()], true);
	// The sediment stack on the sea floor: each layer grows in turn, then the stack sinks and folds.
	const layerTop = (index: number, x: number) => {
		let y = SEA_FLOOR + bury * 120;
		for (let k = 0; k <= index; k++) y -= LAYERS[k].thick * clamp01(settle * 3 - k) * (1 - 0.18 * press);
		return y + bury * 10 * Math.sin((x - 1180) / 40 + index) * smoothStep(clamp01((x - 1170) / 60));
	};
	const layerBase = (index: number, x: number) => (index === 0 ? SEA_FLOOR + bury * 120 + bury * 10 * Math.sin((x - 1180) / 40 - 1) * smoothStep(clamp01((x - 1170) / 60)) : layerTop(index - 1, x));
	const lavaLength = erupt;
	const lavaPath: Point[] = sampled((x) => ground(x) - 4, PEAK.x + 26, PEAK.x + 26 + 190 * lavaLength, 8);
	const batholith = smoothPath([[560, 660], [600, 470], [660, 400], [740, 372], [820, 400], [880, 470], [920, 660]], true);

	return (
		<ProcessFrame process="rockcycle" clock={clock} camera={camera} width={width} height={height} overlay={<CycleRing clock={clock} />}>
			<Sky />
			<defs>
				<clipPath id={`rg${id}`}>
					<path d={groundPath} />
				</clipPath>
				<radialGradient id={`rm${id}`} cx="0.5" cy="0.5" r="0.6">
					<stop offset="0" stopColor={COLOURS.magmaHot} />
					<stop offset="1" stopColor={COLOURS.magma} />
				</radialGradient>
				<radialGradient id={`rh${id}`} cx="0.5" cy="1" r="0.75">
					<stop offset="0" stopColor="#FF6A1E" stopOpacity={0.85} />
					<stop offset="1" stopColor="#FF6A1E" stopOpacity={0} />
				</radialGradient>
			</defs>
			<path d={groundPath} fill={COLOURS.crust} />
			<g clipPath={`url(#rg${id})`}>
				<rect x={SCENE.left - 120} y={520} width={SCENE.right - SCENE.left + 240} height={240} fill={COLOURS.crustDeep} />
				{Array.from({length: 50}, (_, index) => {
					const x = SCENE.left + noise(index * 3.1) * (SCENE.right - SCENE.left);
					return <ellipse key={index} cx={x} cy={ground(x) + 30 + noise(index * 2.2) * 200} rx={4 + 3 * noise(index)} ry={2.5} fill={withAlpha('#3D2B1A', 0.22)} />;
				})}
				{/* The granite body under the mountain: molten at first, then cooled with big crystals. */}
				<path d={batholith} fill={cool > 0.5 ? COLOURS.granite : COLOURS.magma} opacity={clock.current === 'magma' ? 0.25 * amount('magma') : 0.35 + 0.65 * cool} />
				<g opacity={cool}>
					{Array.from({length: 40}, (_, index) => {
						const x = 600 + noise(index * 4.3) * 280;
						const y = 420 + noise(index * 1.9) * 220;
						const size = 5 + 7 * noise(index) * cool;
						const colour = ['#C98B78', '#F5EFE8', '#3A3A3A'][index % 3];
						return y > ground(x) + 6 ? <path key={index} d={`M${x} ${y - size} L${x + size} ${y - size * 0.3} L${x + size * 0.6} ${y + size} L${x - size * 0.7} ${y + size * 0.8} L${x - size} ${y - size * 0.2} Z`} fill={colour} opacity={0.85} /> : null;
					})}
				</g>
				{/* Heat under the buried layers, then melting. */}
				<rect x={1060} y={520} width={540} height={240} fill={`url(#rh${id})`} opacity={bury * 0.7 + melt * 0.3} />
				{/* The chamber and the vent. */}
				<path d={`M${PEAK.x - 10} ${CHAMBER.y - CHAMBER.ry + 6} C${PEAK.x - 16} ${450} ${PEAK.x + 8} ${300} ${PEAK.x - 6} ${LAND - PEAK.height + 18} L${PEAK.x + 8} ${LAND - PEAK.height + 18} C${PEAK.x + 22} ${300} ${PEAK.x + 2} ${450} ${PEAK.x + 12} ${CHAMBER.y - CHAMBER.ry + 6} Z`} fill={COLOURS.magma} opacity={0.4 + 0.6 * erupt} />
				<ellipse cx={CHAMBER.x} cy={CHAMBER.y} rx={CHAMBER.rx} ry={CHAMBER.ry} fill={`url(#rm${id})`} />
				{Array.from({length: 10}, (_, index) => {
					const angle = time * 0.8 + (index / 10) * Math.PI * 2;
					return <circle key={index} cx={CHAMBER.x + Math.cos(angle) * CHAMBER.rx * 0.62 * (0.6 + 0.4 * noise(index))} cy={CHAMBER.y + Math.sin(angle) * CHAMBER.ry * 0.5} r={8 + 6 * noise(index)} fill={COLOURS.magmaHot} opacity={0.65} />;
				})}
				{/* The melt rising back from the buried layers to the chamber. */}
				<FlowLine d={smoothPath([[1330, 600], [1100, 618], [800, 612], [CHAMBER.x + CHAMBER.rx - 14, CHAMBER.y + 4]])} time={time} width={12} colour={COLOURS.magma} speed={60} opacity={melt} />
			</g>
			{/* The sea and its sediment layers. */}
			<path d={sea} fill={COLOURS.sea} opacity={0.85} />
			{LAYERS.map((layer, index) => {
				const grown = clamp01(settle * 3 - index);
				if (grown <= 0.01 && bury <= 0) return null;
				const top = sampled((x) => layerTop(index, x), 1150, SCENE.right + 120, 8);
				const bottom = sampled((x) => layerBase(index, x), 1150, SCENE.right + 120, 8).reverse();
				return (
					<g key={layer.name}>
						<path d={pathOf([...top, ...bottom], true)} fill={bury > 0.5 ? layer.meta : layer.colour} stroke={withAlpha('#3D2B1A', 0.35)} strokeWidth={1.4} />
						{layer.name === 'kalker' && bury < 0.5
							? Array.from({length: 8}, (_, shell) => {
									const x = 1200 + shell * 45;
									return <path key={shell} d={`M${x - 6} ${layerTop(index, x) + 12} a6 6 0 0 1 12 0 z`} fill="#CFC5AE" opacity={grown} />;
								})
							: null}
					</g>
				);
			})}
			{/* Grains falling through the water onto the layers. */}
			<g opacity={weather * (1 - press)}>
				{Array.from({length: 24}, (_, index) => {
					const phase = (time * 0.35 + noise(index * 2.7)) % 1;
					const x = 1180 + noise(index * 5.3) * 360;
					return <circle key={index} cx={x + 10 * Math.sin(phase * 5 + index)} cy={lerp(SEA_LEVEL + 8, layerTop(2, x) - 4, phase)} r={2.4} fill="#8C6A43" />;
				})}
			</g>
			{/* Pressing: arrows on the stack. */}
			<g opacity={press * (1 - bury)} stroke={palette.lesson} strokeWidth={5} strokeLinecap="round">
				{[1240, 1360, 1480].map((x) => (
					<path key={x} d={`M${x} ${SEA_LEVEL + 30} l0 50 m-10 -14 l10 14 l10 -14`} fill="none" />
				))}
			</g>
			{/* The granite mountain weathering: cracks, grains rolling down, a river to the sea. */}
			<g opacity={weather}>
				{[640, 700, 760, 820].map((x, index) => (
					<path key={x} d={`M${x} ${ground(x) + 2} l${6 - index * 3} 18 l-4 14`} fill="none" stroke="#5B4636" strokeWidth={2} />
				))}
				<FlowLine d={smoothPath(sampled((x) => ground(x) - 3, 880, 1130, 20))} time={time} width={8} speed={70} />
				<Drift points={[...sampled((x) => ground(x) - 6, 780, 1130, 30), [1170, SEA_LEVEL + 20]]} time={time} count={30} colour="#7A5A3A" size={3.4} speed={0.18} spread={4} />
			</g>
			{/* Lava pouring down the cone, glowing then cooling dark. */}
			{lavaLength > 0.02 ? (
				<g>
					<path d={smoothPath(lavaPath)} fill="none" stroke={lavaCool > 0.6 ? COLOURS.basalt : COLOURS.magma} strokeWidth={14} strokeLinecap="round" />
					<path d={smoothPath(lavaPath)} fill="none" stroke={COLOURS.magmaHot} strokeWidth={5} strokeLinecap="round" opacity={1 - lavaCool} strokeDasharray="10 14" strokeDashoffset={-time * 40} />
				</g>
			) : null}
			{/* Ash and smoke over the vent while it erupts. */}
			<g opacity={erupt * (1 - lavaCool * 0.8)}>
				{Array.from({length: 12}, (_, index) => {
					const phase = (time * 0.5 + noise(index * 3.1)) % 1;
					return <circle key={index} cx={PEAK.x + 30 * Math.sin(index * 2 + phase * 3) + 50 * phase} cy={LAND - PEAK.height + 6 - 120 * phase} r={14 + 26 * phase} fill="#6E6A66" opacity={0.6 * (1 - phase)} />;
				})}
			</g>
			{/* Lenses: big crystals in granite, tiny ones in basalt. */}
			<Lens x={560} y={250} show={clock.now('magmatik') * cool} title="İri kristal">
				{Array.from({length: 7}, (_, index) => {
					const angle = (index / 7) * Math.PI * 2;
					const size = 14 + 6 * noise(index) * cool;
					const cx = (index === 0 ? 0 : Math.cos(angle) * 30);
					const cy = (index === 0 ? 0 : Math.sin(angle) * 30);
					return <path key={index} d={`M${cx} ${cy - size} L${cx + size} ${cy - size * 0.2} L${cx + size * 0.5} ${cy + size} L${cx - size * 0.7} ${cy + size * 0.7} L${cx - size} ${cy - size * 0.3} Z`} fill={['#C98B78', '#F5EFE8', '#3A3A3A'][index % 3]} stroke="#7A5A4A" strokeWidth={1} />;
				})}
			</Lens>
			<Lens x={150} y={250} show={clock.now('magmatik') * lavaCool} title="İnce kristal">
				<circle r={48} fill={COLOURS.basalt} />
				{Array.from({length: 60}, (_, index) => (
					<circle key={index} cx={(noise(index * 1.7) - 0.5) * 84} cy={(noise(index * 3.9) - 0.5) * 84} r={1.6} fill={index % 2 ? '#8A8580' : '#2A2826'} />
				))}
			</Lens>
			<ProcessLabel id="magma" at={[CHAMBER.x, CHAMBER.y - 10]} to={[CHAMBER.x + 220, 480]} text="Magma: erimiş kayaç" anchor="start" show={clock.now('magma')} />
			<ProcessLabel id="granit" at={[740, 470]} to={[740, 600]} text="Derinde yavaş soğuma: granit" show={clock.now('magmatik') * cool} />
			<ProcessLabel id="bazalt" at={lavaPath[Math.floor(lavaPath.length * 0.6)]} to={[300, 520]} text="Yüzeyde hızlı soğuma: bazalt" show={clock.now('magmatik') * lavaCool} />
			<ProcessLabel id="asinma" at={[860, ground(860) - 4]} to={[880, 230]} text="Aşınma ve taşınma" show={clock.now('tortul')} />
			<ProcessLabel id="birikme" at={[1380, layerTop(1, 1380)]} to={[1380, 560]} text="Birikir, sıkışır: tortul kayaç" show={clock.now('tortul') * clamp01(settle * 2)} />
			<ProcessLabel id="mermer" at={[1380, layerTop(2, 1380) + 8]} to={[1300, 300]} text="Isı ve basınç: kalker → mermer" show={clock.now('baskalasim') * bury} />
			<ProcessLabel id="baskalasim" at={[1000, 616]} to={[1000, 540]} text="Erir, magmaya döner" show={clock.now('baskalasim') * melt} />
		</ProcessFrame>
	);
};

/** A round lens showing a rock's grain up close. */
const Lens: React.FC<{x: number; y: number; show: number; title: string; children: React.ReactNode}> = ({x, y, show, title, children}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	if (show <= 0.01) return null;
	return (
		<g opacity={show} transform={`translate(${x} ${y})`}>
			<defs>
				<clipPath id={`lens${id}`}>
					<circle r={56} />
				</clipPath>
			</defs>
			<circle r={60} fill="#FFFFFF" stroke={palette.ink} strokeWidth={3} />
			<g clipPath={`url(#lens${id})`}>{children}</g>
			<text y={86} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink} stroke={palette.surface} strokeWidth={6} paintOrder="stroke">
				{title}
			</text>
		</g>
	);
};

/** The cycle as a ring in the corner: the current step lit, the arrows between them. */
const CycleRing: React.FC<{clock: {current: string; amount: (id: string) => number}}> = ({clock}) => {
	const palette = useVisualPalette();
	const nodes = [
		{id: 'magma', title: 'Magma'},
		{id: 'magmatik', title: 'Magmatik'},
		{id: 'tortul', title: 'Tortul'},
		{id: 'baskalasim', title: 'Başkalaşım'},
	];
	const cx = 1384;
	const cy = 178;
	const r = 56;
	return (
		<g>
			<rect x={cx - 170} y={cy - 96} width={340} height={192} rx={18} fill={withAlpha('#FFFFFF', 0.92)} stroke={withAlpha(palette.ink, 0.2)} strokeWidth={2} />
			<circle cx={cx} cy={cy} r={r} fill="none" stroke={withAlpha(palette.ink, 0.25)} strokeWidth={3} strokeDasharray="6 8" />
			{nodes.map((node, index) => {
				const angle = -Math.PI / 2 + (index / nodes.length) * Math.PI * 2;
				const x = cx + Math.cos(angle) * r;
				const y = cy + Math.sin(angle) * r;
				const lit = node.id === clock.current;
				const done = clock.amount(node.id) > 0;
				return (
					<g key={node.id}>
						<circle cx={x} cy={y} r={lit ? 13 : 9} fill={lit ? palette.lesson : done ? withAlpha(palette.lesson, 0.45) : palette.surface} stroke={palette.lesson} strokeWidth={3} />
						<text x={x + (index === 1 ? 20 : index === 3 ? -20 : 0)} y={y + (index === 0 ? -20 : index === 2 ? 32 : 6)} textAnchor={index === 1 ? 'start' : index === 3 ? 'end' : 'middle'} fontFamily={palette.fontBody} fontWeight={lit ? 800 : 700} fontSize={18} fill={lit ? palette.lesson : palette.ink}>
							{node.title}
						</text>
					</g>
				);
			})}
		</g>
	);
};
