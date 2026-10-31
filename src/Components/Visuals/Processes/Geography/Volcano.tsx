import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import type {VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Grass, ProcessFrame, ProcessLabel, SCENE, Sky, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Where magma cools, in a cross-section of layered crust over a magma chamber: a great body rises and cools slowly
 * at depth into a coarse-crystalled dome (batolit); magma spreads between layers (sill), swells them into a dome
 * (lakolit) and cuts up through them (dayk); where it reaches the surface it erupts and builds a cone of ash and
 * lava layers with a crater; lava runs down and cools fast, glowing then dark; the emptied chamber lets the summit
 * fall in, leaving a caldera that fills with a lake (Nemrut); and a gas blast elsewhere opens a round crater that
 * becomes a maar lake (Meke).
 */

const SURFACE = 430;
const LAYER_DEPTHS = [0, 38, 82, 128, 176, 240];
const LAYER_COLOURS = ['#D9C79F', '#C8A979', '#B6926A', '#CDBB98', '#A98A66'];
const CHAMBER_Y = 640;
const BATHOLITH = {x: 450, half: 230, top: 478};
const LACCOLITH = {x: 830, half: 120, depth: 82};
const SILL_Y = SURFACE + 128;
const DIKE_X = 1010;
const CONE = {x: 1260, half: 270, height: 250};
const MAAR_X = 600;

const COLOURS = {
	magma: '#EF6424',
	magmaHot: '#FFC03D',
	granite: '#E5B5A0',
	ash: '#9C958D',
	lava: '#55504B',
	water: '#5A97CF',
};

const FRAMING: Record<string, CameraBox> = {
	batolit: [170, 380, 730, 640],
	lakolit: [700, 330, 1120, 640],
	koni: [960, 100, 1540, 640],
	lav: [980, 110, 1560, 640],
	kaldera: [980, 100, 1540, 640],
	maar: [400, 250, 800, 560],
};

const bowl = (u: number) => (Math.abs(u) < 1 ? (1 - u * u) ** 2 : 0);

export const VolcanoProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('volcano', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const batholith = smooth(amount('batolit'));
	const crystals = smoothStep(clamp01((amount('batolit') - 0.35) / 0.65));
	const sill = smooth(clamp01(amount('lakolit') * 3));
	const laccolith = smooth(clamp01(amount('lakolit') * 3 - 1));
	const dike = smooth(clamp01(amount('lakolit') * 3 - 2));
	const cone = smooth(amount('koni'));
	const eruptingCone = clock.current === 'koni' ? 1 : 0;
	const lava = clock.current === 'lav' ? smooth(clamp01(clock.progress * 1.3)) : amount('lav');
	const lavaCool = smoothStep(clamp01((amount('lav') - 0.45) / 0.55));
	const collapse = clock.current === 'kaldera' ? smoothStep(clamp01((clock.progress - 0.15) / 0.35)) : amount('kaldera');
	const calderaLake = smooth(clamp01((amount('kaldera') - 0.55) / 0.45));
	const gas = clock.current === 'maar' ? clamp01(clock.progress / 0.35) : amount('maar');
	const blast = clock.current === 'maar' ? clamp01((clock.progress - 0.35) / 0.2) : amount('maar') > 0 ? 1 : 0;
	const maarLake = smooth(clamp01((amount('maar') - 0.6) / 0.4));
	const chamberFull = 1 - 0.6 * collapse;

	/** The cone: nested layers of ash and lava; the caldera takes its top. */
	const coneHeight = (x: number, scale = 1) => {
		const d = Math.abs(x - CONE.x) / (CONE.half * scale);
		if (d >= 1) return 0;
		let y = CONE.height * scale * cone * (1 - d) ** 1.15;
		const crater = d < 0.09 ? 26 * cone * (1 - (d / 0.09) ** 2) : 0;
		y -= crater;
		if (collapse > 0 && d < 0.42) {
			const rim = CONE.height * scale * cone * (1 - 0.42) ** 1.15;
			y = lerp(y, rim - 120 * (1 - (d / 0.42) ** 4), collapse);
		}
		return y;
	};
	const dome = (x: number) => laccolith * 30 * bowl((x - LACCOLITH.x) / (LACCOLITH.half * 1.4));
	const maar = (x: number) => blast * (48 * Math.sqrt(bowl((x - MAAR_X) / 115)) - 12 * Math.exp(-(((Math.abs(x - MAAR_X) - 128) / 20) ** 2)));
	const surface = (x: number) => SURFACE + 3 * Math.sin(x / 70) - coneHeight(x) - dome(x) + maar(x);
	const boundary = (depth: number) => (x: number) => SURFACE + depth - (depth < LACCOLITH.depth + 1 ? dome(x) : 0) + (depth === 0 ? maar(x) : 0);

	const groundPath = pathOf([...sampled(surface, SCENE.left - 120, SCENE.right + 120, 4), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	const bandPath = (top: (x: number) => number, bottom: (x: number) => number) => pathOf([...sampled(top, SCENE.left - 120, SCENE.right + 120, 8), ...sampled(bottom, SCENE.left - 120, SCENE.right + 120, 8).reverse()], true);
	const batholithTop = lerp(CHAMBER_Y - 10, BATHOLITH.top, batholith);
	const batholithPath = smoothPath([[BATHOLITH.x - BATHOLITH.half, 700], [BATHOLITH.x - BATHOLITH.half * 0.7, (batholithTop + CHAMBER_Y) / 2 + 20], [BATHOLITH.x - BATHOLITH.half * 0.3, batholithTop + 8], [BATHOLITH.x + BATHOLITH.half * 0.2, batholithTop], [BATHOLITH.x + BATHOLITH.half * 0.7, (batholithTop + CHAMBER_Y) / 2 + 10], [BATHOLITH.x + BATHOLITH.half, 700]], true);
	const laccolithPath = `M${LACCOLITH.x - LACCOLITH.half} ${SURFACE + LACCOLITH.depth + 4} Q${LACCOLITH.x} ${SURFACE + LACCOLITH.depth + 4 - 64 * laccolith} ${LACCOLITH.x + LACCOLITH.half} ${SURFACE + LACCOLITH.depth + 4} Q${LACCOLITH.x} ${SURFACE + LACCOLITH.depth + 18} ${LACCOLITH.x - LACCOLITH.half} ${SURFACE + LACCOLITH.depth + 4} Z`;
	const sillReach = 190 * sill;
	const dikeTop = lerp(CHAMBER_Y, SURFACE + 20, dike);
	const lavaPath: Point[] = sampled((x) => surface(x) - 4, CONE.x + 30, CONE.x + 30 + 300 * lava, 8);
	const calderaRim = CONE.height * cone * (1 - 0.42) ** 1.15;
	const lakeLevel = SURFACE - calderaRim + 36;

	return (
		<ProcessFrame process="volcano" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			<defs>
				<clipPath id={`vg${id}`}>
					<path d={groundPath} />
				</clipPath>
				<linearGradient id={`vm${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={COLOURS.magmaHot} />
					<stop offset="1" stopColor={COLOURS.magma} />
				</linearGradient>
			</defs>
			<path d={groundPath} fill={LAYER_COLOURS[4]} />
			<g clipPath={`url(#vg${id})`}>
				{LAYER_DEPTHS.slice(0, -1).map((depth, index) => (
					<path key={depth} d={bandPath(boundary(depth), boundary(LAYER_DEPTHS[index + 1]))} fill={LAYER_COLOURS[index]} stroke={withAlpha('#3D2B1A', 0.3)} strokeWidth={1.4} />
				))}
				{/* Nested layers of the cone: ash and lava in turn. */}
				{Array.from({length: 6}, (_, index) => {
					const scale = 1 - index * 0.13;
					if (cone <= 0.01) return null;
					return <path key={index} d={pathOf([...sampled((x) => SURFACE + 3 * Math.sin(x / 70) - Math.max(0, Math.min(coneHeight(x, scale), coneHeight(x))), CONE.x - CONE.half, CONE.x + CONE.half, 5)], true)} fill={index % 2 ? COLOURS.lava : COLOURS.ash} />;
				})}
				{/* The chamber, the batholith, the sill, the laccolith, the dike and the vent. */}
				<rect x={SCENE.left - 120} y={CHAMBER_Y - 6} width={SCENE.right - SCENE.left + 240} height={140} fill={`url(#vm${id})`} opacity={0.55 + 0.45 * chamberFull} />
				{Array.from({length: 14}, (_, index) => {
					const x = SCENE.left + ((index * 120 + time * 30) % (SCENE.right - SCENE.left));
					return <circle key={index} cx={x} cy={CHAMBER_Y + 12 + 6 * Math.sin(time + index)} r={9 + 5 * noise(index)} fill={COLOURS.magmaHot} opacity={0.5 * chamberFull} />;
				})}
				<path d={batholithPath} fill={crystals > 0.5 ? COLOURS.granite : COLOURS.magma} opacity={batholith > 0.01 ? 1 : 0} />
				<g opacity={crystals}>
					{Array.from({length: 46}, (_, index) => {
						const x = BATHOLITH.x - BATHOLITH.half * 0.75 + noise(index * 4.3) * BATHOLITH.half * 1.5;
						const y = batholithTop + 24 + noise(index * 1.9) * (CHAMBER_Y - batholithTop - 30);
						const size = 4 + 7 * noise(index) * crystals;
						return <path key={index} d={`M${x} ${y - size} L${x + size} ${y - size * 0.3} L${x + size * 0.6} ${y + size} L${x - size * 0.7} ${y + size * 0.8} L${x - size} ${y - size * 0.2} Z`} fill={['#C98B78', '#F5EFE8', '#3A3A3A'][index % 3]} opacity={0.85} />;
					})}
				</g>
				<path d={`M${DIKE_X - 6} ${CHAMBER_Y} L${DIKE_X - 6} ${SILL_Y} L${DIKE_X - 6 - sillReach} ${SILL_Y - 2} L${DIKE_X - 6 - sillReach} ${SILL_Y + 9} L${DIKE_X + 6} ${SILL_Y + 9} L${DIKE_X + 6} ${CHAMBER_Y} Z`} fill={COLOURS.magma} opacity={sill > 0.01 ? 1 : 0} />
				<path d={laccolithPath} fill={COLOURS.magma} opacity={laccolith > 0.01 ? 1 : 0} />
				<path d={`M${LACCOLITH.x - 5} ${SILL_Y} L${LACCOLITH.x - 5} ${SURFACE + LACCOLITH.depth + 10} L${LACCOLITH.x + 5} ${SURFACE + LACCOLITH.depth + 10} L${LACCOLITH.x + 5} ${SILL_Y} Z`} fill={COLOURS.magma} opacity={laccolith > 0.01 ? 1 : 0} />
				<rect x={DIKE_X + 74} y={dikeTop} width={14} height={Math.max(0, CHAMBER_Y - dikeTop)} fill={COLOURS.magma} opacity={dike > 0.01 ? 1 : 0} />
				<path d={`M${CONE.x - 9} ${CHAMBER_Y} C${CONE.x - 14} ${520} ${CONE.x + 4} ${400} ${CONE.x - 7} ${SURFACE - CONE.height * cone + 20} L${CONE.x + 7} ${SURFACE - CONE.height * cone + 20} C${CONE.x + 18} ${400} ${CONE.x + 2} ${520} ${CONE.x + 11} ${CHAMBER_Y} Z`} fill={COLOURS.magma} opacity={cone > 0.01 ? 1 - collapse : 0} />
				{/* The maar: the gas rising from below. */}
				<g opacity={gas > 0 && blast < 1 ? 1 : 0}>
					<circle cx={MAAR_X} cy={lerp(CHAMBER_Y, SURFACE + 20, gas)} r={10 + 8 * gas} fill="#F4E1B8" stroke="#C99A52" strokeWidth={2} />
				</g>
			</g>
			{/* Water in the caldera and the maar. */}
			<path d={pathOf([...sampled((x) => Math.min(lakeLevel, surface(x)), CONE.x - 110, CONE.x + 110, 4), ...sampled(surface, CONE.x - 110, CONE.x + 110, 4).reverse()], true)} fill={COLOURS.water} opacity={calderaLake} />
			<path d={pathOf([...sampled((x) => Math.min(SURFACE + 18, surface(x)), MAAR_X - 120, MAAR_X + 120, 4), ...sampled(surface, MAAR_X - 120, MAAR_X + 120, 4).reverse()], true)} fill={COLOURS.water} opacity={maarLake} />
			<Grass ground={surface} x0={SCENE.left} x1={MAAR_X - 110} count={14} seed={2} />
			<Grass ground={surface} x0={MAAR_X + 110} x1={CONE.x - CONE.half} count={12} seed={6} />
			{/* Lava running down and cooling. */}
			{lava > 0.02 ? (
				<g>
					<path d={smoothPath(lavaPath)} fill="none" stroke={lavaCool > 0.6 ? COLOURS.lava : COLOURS.magma} strokeWidth={15} strokeLinecap="round" />
					<path d={smoothPath(lavaPath)} fill="none" stroke={COLOURS.magmaHot} strokeWidth={5} strokeLinecap="round" opacity={1 - lavaCool} strokeDasharray="10 14" strokeDashoffset={-time * 40} />
				</g>
			) : null}
			{/* Eruptions: ash and bombs over the cone; the blast of the maar. */}
			<g opacity={eruptingCone * clamp01(clock.seconds / 0.8) + (clock.current === 'kaldera' ? Math.sin(Math.PI * clamp01(clock.progress / 0.5)) : 0)}>
				{Array.from({length: 18}, (_, index) => {
					const phase = (time * 0.45 + noise(index * 3.1)) % 1;
					return <circle key={index} cx={CONE.x + 40 * Math.sin(index * 2 + phase * 3) + 60 * phase} cy={SURFACE - CONE.height * cone - 120 * phase} r={18 + 34 * phase} fill="#6A6560" opacity={0.6 * (1 - phase)} />;
				})}
				{Array.from({length: 8}, (_, index) => {
					const phase = (time * 0.7 + noise(index * 5.7)) % 1;
					const dir = noise(index * 2.2) - 0.5;
					return <circle key={`b${index}`} cx={CONE.x + dir * 300 * phase} cy={SURFACE - CONE.height * cone - 160 * (4 * phase * (1 - phase)) + 40 * phase} r={5} fill="#3A3633" />;
				})}
			</g>
			<g opacity={clock.current === 'maar' ? Math.sin(Math.PI * blast) : 0}>
				{Array.from({length: 16}, (_, index) => {
					const dir = (index / 16 - 0.5) * 2.2;
					const r = 40 + 120 * blast;
					return <circle key={index} cx={MAAR_X + Math.sin(dir) * r} cy={SURFACE - Math.cos(dir) * r * 0.8} r={6 + 10 * noise(index)} fill={index % 3 ? '#7E7468' : '#B9AFA2'} />;
				})}
			</g>
			<ProcessLabel id="batolit" at={[BATHOLITH.x, batholithTop + 40]} to={[BATHOLITH.x + 40, 400]} text="Batolit: iri kristalli" show={clock.now('batolit')} />
			<ProcessLabel id="sill" at={[DIKE_X - 6 - sillReach * 0.6, SILL_Y + 4]} to={[DIKE_X - 120, 610]} text="Sill" show={clock.now('lakolit') * sill} />
			<ProcessLabel id="lakolit" at={[LACCOLITH.x, SURFACE + LACCOLITH.depth - 20 * laccolith]} to={[LACCOLITH.x - 60, 370]} text="Lakolit" show={clock.now('lakolit') * laccolith} />
			<ProcessLabel id="dayk" at={[DIKE_X + 81, (dikeTop + CHAMBER_Y) / 2]} to={[DIKE_X + 60, 380]} text="Dayk" show={clock.now('lakolit') * dike} />
			<ProcessLabel id="koni" at={[CONE.x - 110, SURFACE - coneHeight(CONE.x - 110) + 6]} to={[CONE.x - 250, 250]} text="Koni: kül ve lav katmanları" show={clock.now('koni') * cone} />
			<ProcessLabel id="krater" at={[CONE.x, SURFACE - CONE.height * cone + 18]} to={[CONE.x - 90, 150]} text="Krater" show={clock.now('koni') * cone} />
			<ProcessLabel id="lav" at={lavaPath[Math.floor(lavaPath.length * 0.7)]} to={[CONE.x, 560]} text="Lav hızla soğur: bazalt" show={clock.now('lav') * lava} />
			<ProcessLabel id="magma" at={[1100, CHAMBER_Y + 10]} to={[1100, 560]} text="Magma odası boşalır" show={clock.now('kaldera') * (1 - calderaLake)} />
			<ProcessLabel id="kaldera" at={[CONE.x, lakeLevel + 10]} to={[CONE.x - 160, 170]} text="Kaldera gölü (Nemrut)" show={clock.now('kaldera') * calderaLake} />
			<ProcessLabel id="maar" at={[MAAR_X, SURFACE + 24]} to={[MAAR_X, 340]} text="Maar gölü (Meke)" show={clock.now('maar') * maarLake} />
		</ProcessFrame>
	);
};
