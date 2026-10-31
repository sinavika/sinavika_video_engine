import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, Drift, FlowLine, Grass, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Erosion, as the lesson tells it, on two hills side by side seen as a block (the cut face shows the soil, the top
 * shows the ground): a forested hill on the left and a bare field ploughed down the slope on the right. A raindrop
 * throws soil grains out of its crater (more of them downhill); water that cannot soak in runs off as a muddy sheet;
 * it cuts rills that deepen into gullies; the fertile A horizon thins on the field, the river turns brown and the dam
 * lake fills with silt (seen from above); under the trees water soaks in and roots hold the soil; terraces and
 * ploughing across the slope finally hold the water.
 */

/** The top of the block runs back and up this much: the ground is seen a little from above. */
const BACK: Point = [44, -38];
const A = 26;
const B = 34;
const C = 52;
const FOREST_CREST = [60, 170] as const;
const BARE_CREST = [760, 810] as const;
const VALLEY = 622;
const FOOT = 1290;
const RIVER = {x: 1440, half: 62, depth: 32};

const ground = (x: number): number => {
	if (x <= VALLEY) {
		if (x <= FOREST_CREST[1]) return 250;
		return lerp(250, 520, smoothStep((x - FOREST_CREST[1]) / (VALLEY - FOREST_CREST[1])));
	}
	if (x <= BARE_CREST[0]) return lerp(520, 228, smoothStep((x - VALLEY) / (BARE_CREST[0] - VALLEY)));
	if (x <= BARE_CREST[1]) return 228;
	if (x <= FOOT) return lerp(228, 522, smoothStep((x - BARE_CREST[1]) / (FOOT - BARE_CREST[1])));
	const d = (x - RIVER.x) / RIVER.half;
	return 526 + (Math.abs(d) < 1 ? RIVER.depth * (1 - d * d) : 0);
};

/** Where the field is: soil goes from here. */
const onField = (x: number) => smoothStep(clamp01((x - BARE_CREST[0] + 20) / 60)) * (1 - smoothStep(clamp01((x - FOOT + 60) / 90)));
/** Terraces: flat steps with stone walls. */
const STEP = 82;
const terraced = (x: number) => {
	const from = BARE_CREST[1];
	if (x <= from || x >= FOOT) return ground(x);
	const k = Math.floor((x - from) / STEP);
	const riser = (x - from - k * STEP) / STEP;
	const flat = ground(from + (k + 1) * STEP - 6);
	const next = ground(from + (k + 2) * STEP - 6);
	return riser < 0.82 ? flat : lerp(flat, Math.min(next, ground(FOOT)), (riser - 0.82) / 0.18);
};

const COLOURS = {
	a: '#5C4128',
	b: '#A8743F',
	c: '#C9AE84',
	rock: '#9C8C78',
	field: '#C79A63',
	furrow: '#8F6639',
	forest: '#8DB86A',
	water: '#5A97CF',
	mud: '#9A774C',
};

const FRAMING: Record<string, CameraBox> = {
	damla: [890, 300, 1150, 470],
	akis: [700, 150, 1360, 600],
	oluk: [700, 140, 1340, 590],
	tasinma: [640, 72, 1560, 640],
	ortu: undefined,
	onlem: [700, 140, 1360, 600],
};

export const ErosionProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('erosion', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const rain = {damla: 0.35, akis: 1, oluk: 1, tasinma: 0.6, ortu: 0.9, onlem: 0.6}[clock.current] ?? 0;
	const runoff = smooth(clamp01(amount('akis') * 1.5)) * (1 - 0.8 * smooth(amount('onlem')));
	const rills = smooth(amount('oluk'));
	const loss = clamp01(0.18 * amount('akis') + 0.47 * amount('oluk') + 0.35 * amount('tasinma'));
	const terrace = smoothStep(clamp01(amount('onlem') * 1.6));
	const muddy = clamp01(0.5 * amount('akis') + 0.5 * amount('oluk')) * (1 - 0.6 * terrace);
	const silt = smooth(amount('tasinma'));

	/** The ground today: the field loses its top (more up the slope), the foot gains what came down, terraces replace the slope. */
	const top = (x: number) => {
		const field = onField(x);
		const lost = A * 0.85 * loss * field * (0.55 + 0.45 * clamp01((FOOT - x) / 300));
		const footDeposit = 18 * loss * Math.exp(-(((x - (FOOT - 40)) / 70) ** 2));
		const riverSilt = 14 * silt * Math.max(0, 1 - Math.abs((x - RIVER.x) / RIVER.half));
		const now = ground(x) + lost - footDeposit - riverSilt;
		return lerp(now, terraced(x) + lost * 0.6, terrace * field);
	};
	const front = sampled(top, SCENE.left - 120, SCENE.right + 120, 6);
	const strip = (x0: number, x1: number) => pathOf([...sampled(top, x0, x1, 6), ...sampled((x) => top(x - BACK[0]) + BACK[1], x0 + BACK[0], x1 + BACK[0], 6).reverse()], true);
	const onStrip = (x: number, v: number): Point => [x + BACK[0] * v, top(x) + BACK[1] * v];
	const bandPath = (upper: (x: number) => number, lower: (x: number) => number) => pathOf([...sampled((x) => Math.max(top(x), upper(x)), SCENE.left - 120, SCENE.right + 120, 6), ...sampled((x) => Math.max(top(x), lower(x)), SCENE.left - 120, SCENE.right + 120, 6).reverse()], true);

	// Runoff down the field, and the rills it cuts (on the top of the block).
	const slopePath = (v: number, wiggle: number, seed: number): Point[] => sampled((x) => top(x) + BACK[1] * v + wiggle * Math.sin(x / 37 + seed), BARE_CREST[1] + 30, FOOT - 30, 14).map(([x, y]) => [x + BACK[0] * v + wiggle * 0.6 * Math.sin(x / 23 + seed * 2), y] as Point);
	const rillLines = [0.22, 0.5, 0.78].map((v, index) => slopePath(v, 3 + 3 * rills, index * 1.7));

	// The splash of one raindrop: the drop falls, a crater opens, grains fly (more downhill).
	const splashSites = [950, 1000, 1050, 1100];
	return (
		<ProcessFrame process="erosion" clock={clock} camera={camera} width={width} height={height}>
			<Sky colourTop={rain > 0.5 ? '#AFC1CF' : '#C6E0F2'} />
			<g opacity={clamp01(rain * 1.3)}>
				<Cloud x={340} y={120} scale={1.1} dark={0.5} />
				<Cloud x={900} y={108} scale={1.3} dark={0.6} />
				<Cloud x={1240} y={124} scale={1.05} dark={0.55} />
			</g>
			<Rain x0={SCENE.left} x1={SCENE.right} top={SCENE.top - 20} ground={(x) => top(x) + BACK[1] * 0.5} time={time} amount={rain} count={110} />
			{/* The top of the block: forest floor on the left, a field ploughed down the slope on the right. */}
			<path d={strip(SCENE.left - 120, VALLEY)} fill={COLOURS.forest} />
			<path d={strip(VALLEY, FOOT + 10)} fill={COLOURS.field} />
			<path d={strip(FOOT + 10, SCENE.right + 120)} fill="#A9C58A" />
			<g opacity={1 - terrace} stroke={COLOURS.furrow} strokeWidth={2} fill="none" strokeOpacity={0.55}>
				{[0.12, 0.34, 0.6, 0.86].map((v) => (
					<path key={v} d={smoothPath(slopePath(v, 0, 0))} />
				))}
			</g>
			{/* Ploughing across the slope, once the field is terraced. */}
			<g opacity={terrace} stroke={COLOURS.furrow} strokeWidth={2.4} strokeOpacity={0.7}>
				{Array.from({length: 22}, (_, index) => {
					const x = BARE_CREST[1] + 20 + index * 21;
					const [x0, y0] = onStrip(x, 0.05);
					const [x1, y1] = onStrip(x, 0.95);
					return <line key={index} x1={x0} y1={y0} x2={x1} y2={y1} />;
				})}
			</g>
			{/* Rills cut by the runoff, deepening into gullies. */}
			<g opacity={rills * (1 - terrace)}>
				{rillLines.map((line, index) => (
					<g key={index}>
						<path d={smoothPath(line)} fill="none" stroke="#3E2A17" strokeWidth={2 + 9 * rills} strokeLinecap="round" />
						<path d={smoothPath(line)} fill="none" stroke="#6B4A2B" strokeWidth={1 + 4 * rills} strokeLinecap="round" />
						<FlowLine d={smoothPath(line)} time={time} width={1.5 + 2.5 * rills} colour={COLOURS.mud} speed={70} opacity={runoff} />
					</g>
				))}
				{/* Side rills joining the gullies. */}
				{rillLines.map((line, index) => {
					const [x, y] = line[Math.floor(line.length * 0.55)];
					return <path key={index} d={`M${x - 46} ${y - 30} Q${x - 20} ${y - 18} ${x} ${y}`} fill="none" stroke="#3E2A17" strokeWidth={1.5 + 3 * rills} opacity={clamp01(rills * 2 - 0.6)} strokeLinecap="round" />;
				})}
			</g>
			{/* The cut face: A (humus), B, C horizons and rock. */}
			<path d={pathOf([...front, [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true)} fill={COLOURS.rock} />
			<path d={bandPath((x) => ground(x) + A + B, (x) => ground(x) + A + B + C)} fill={COLOURS.c} />
			<path d={bandPath((x) => ground(x) + A, (x) => ground(x) + A + B)} fill={COLOURS.b} />
			<path d={bandPath((x) => ground(x) - 40, (x) => ground(x) + A)} fill={COLOURS.a} />
			{Array.from({length: 40}, (_, index) => {
				const x = SCENE.left + noise(index * 3.9) * (SCENE.right - SCENE.left);
				return <ellipse key={index} cx={x} cy={ground(x) + A + B + 10 + noise(index * 1.7) * 60} rx={5 + 4 * noise(index)} ry={3 + 2 * noise(index + 4)} fill={withAlpha('#5B4630', 0.3)} />;
			})}
			<path d={pathOf(front)} fill="none" stroke={withAlpha('#2E2014', 0.5)} strokeWidth={2} />
			{/* The A horizon of the field, thinning. */}
			<path d={pathOf([...sampled(top, BARE_CREST[0], FOOT - 40, 6), ...sampled((x) => ground(x) + A, BARE_CREST[0], FOOT - 40, 6).reverse()], true)} fill="none" stroke={palette.lesson} strokeWidth={4} opacity={clock.now('tasinma')} />
			{/* Terrace walls. */}
			<g opacity={terrace}>
				{Array.from({length: Math.floor((FOOT - BARE_CREST[1]) / STEP)}, (_, index) => {
					const x = BARE_CREST[1] + (index + 1) * STEP - STEP * 0.18;
					return <path key={index} d={pathOf([[x, top(x) + 2], [x + STEP * 0.18, top(x + STEP * 0.18 - 1) + 2]])} stroke="#7D7468" strokeWidth={7} strokeLinecap="round" />;
				})}
			</g>
			{/* The river in the valley: it turns brown and silts up. */}
			<path d={pathOf([...sampled((x) => Math.min(top(x), 520), RIVER.x - RIVER.half, RIVER.x + RIVER.half, 4), ...sampled(top, RIVER.x - RIVER.half, RIVER.x + RIVER.half, 4).reverse()], true)} fill={muddy > 0.3 ? COLOURS.mud : COLOURS.water} opacity={0.95} />
			<Grass ground={top} x0={SCENE.left} x1={VALLEY} count={26} seed={4} />
			<Grass ground={top} x0={FOOT} x1={SCENE.right} count={10} seed={8} />
			{/* Trees on the left hill, the front row with its roots in the cut face. */}
			{[90, 210, 300, 390, 470, 545].map((x, index) => {
				const [tx, ty] = onStrip(x, 0.62);
				return <Tree key={`b${index}`} x={tx} y={ty} size={0.95} kind={index % 2 ? 'pine' : 'broad'} seed={index} />;
			})}
			{[140, 260, 360, 450, 530].map((x, index) => (
				<Tree key={`f${index}`} x={x} y={top(x) + 2} size={1.05} roots={0.35 + 0.65 * smooth(amount('ortu'))} seed={index + 9} />
			))}
			{/* Saplings on the terraces. */}
			<g opacity={terrace}>
				{Array.from({length: 5}, (_, index) => {
					const x = BARE_CREST[1] + (index + 0.45) * STEP;
					return <Tree key={index} x={x + 12} y={top(x) + BACK[1] * 0.5 + 2} size={0.45 + 0.25 * terrace} seed={index + 30} />;
				})}
			</g>
			{/* Sheet flow: muddy water running down the field, carrying grains. */}
			<g opacity={runoff * (1 - rills * 0.6)}>
				<FlowLine d={smoothPath(slopePath(0.08, 0, 0))} time={time} width={7} colour={withAlpha(COLOURS.mud, 0.85)} speed={80} />
			</g>
			<Drift points={slopePath(0.1, 0, 0)} time={time} count={36} amount={runoff} colour="#5E4128" size={3.6} speed={0.22} spread={5} seed={3} />
			{/* Under the trees water soaks in; on the field it runs off. */}
			<g opacity={smooth(amount('ortu')) * (clock.current === 'ortu' ? 1 : 0.4)}>
				{[200, 300, 400, 500].map((x, index) => {
					const y = top(x) - 4;
					const fall = (time * 0.7 + index * 0.25) % 1;
					return (
						<g key={index} opacity={1 - fall}>
							<path d={`M${x} ${y - 10 + fall * 40} l0 22 m-7 -8 l7 8 l7 -8`} stroke={COLOURS.water} strokeWidth={4} fill="none" strokeLinecap="round" />
						</g>
					);
				})}
			</g>
			{/* Raindrop splashes. */}
			<g opacity={clock.current === 'damla' ? smooth(clamp01(clock.seconds / 0.6)) : 0}>
				{splashSites.map((x, site) => {
					const phase = (time / 1.3 + site * 0.33) % 1;
					const y = top(x) + BACK[1] * 0.4;
					const [sx] = onStrip(x, 0.4);
					const fall = clamp01(phase / 0.3);
					const after = clamp01((phase - 0.3) / 0.7);
					return (
						<g key={site}>
							{phase < 0.3 ? <path d={`M${sx} ${y - 120 + 110 * fall} q-9 15 0 21 q9 -6 0 -21 z`} fill="#3F7DB8" /> : null}
							{phase >= 0.3 ? <ellipse cx={sx} cy={y} rx={6 + 22 * after} ry={2 + 7 * after} fill="none" stroke="#4A3220" strokeWidth={3} opacity={1 - after} /> : null}
							{phase >= 0.3
								? Array.from({length: 9}, (_, grain) => {
										// Downhill is to the right: grains thrown that way fly further and land lower.
										const dir = grain < 6 ? 1 : -1;
										const speed = 26 + 30 * noise(grain + site * 11);
										const gx = sx + dir * speed * after * (dir > 0 ? 1.6 : 0.8);
										const gy = y - 90 * (0.4 + 0.6 * noise(grain * 3 + site)) * (after - after * after) * 4 + (dir > 0 ? 14 : 4) * after;
										return <circle key={grain} cx={gx} cy={gy} r={3.4 + 1.8 * noise(grain)} fill="#4A3220" opacity={1 - after * 0.5} />;
									})
								: null}
						</g>
					);
				})}
			</g>
			<DamInset show={clock.current === 'tasinma' ? smooth(clamp01((clock.seconds - 0.6) / 0.8)) : 0} silt={silt} time={time} />
			<ProcessLabel id="damla" at={onStrip(1030, 0.4)} to={[1010, 340]} text="Damla toprağı sıçratır" show={clock.now('damla')} size={22} />
			<ProcessLabel id="akis" at={onStrip(1060, 0.08)} to={[1180, 300]} text="Su toprağı sürükler" show={clock.now('akis')} />
			<ProcessLabel id="oluk" at={pointOn(rillLines[1], 0.55)} to={[1190, 290]} text="Oluklar yarıntıya döner" show={clock.now('oluk')} />
			<ProcessLabel id="ahorizon" at={[900, top(900) + 8]} to={[820, 560]} text="A horizonu incelir" show={clock.now('tasinma')} />
			<ProcessLabel id="tasinma" at={[RIVER.x, 524]} to={[RIVER.x - 20, 600]} text="Akarsu bulanır" show={clock.now('tasinma')} />
			<ProcessLabel id="kok" at={[262, top(262) + 40]} to={[200, 560]} text="Kökler toprağı tutar" show={clock.now('ortu')} />
			<ProcessLabel id="ortu" at={[400, top(400) - 4]} to={[360, 170]} text="Ormanda su toprağa sızar" show={clock.now('ortu')} />
			<ProcessLabel id="akis" at={onStrip(1050, 0.1)} to={[1130, 200]} text="Çıplak tarlada toprak gider" show={clock.now('ortu')} />
			<ProcessLabel id="taraca" at={[BARE_CREST[1] + STEP * 2.4, top(BARE_CREST[1] + STEP * 2.4)]} to={[1140, 250]} text="Taraçalar suyu tutar" show={clock.now('onlem')} />
			<ProcessLabel id="onlem" at={onStrip(BARE_CREST[1] + 60, 0.5)} to={[860, 160]} text="Eğime dik sürülür" show={clock.now('onlem')} />
			{/* Which hill is which. */}
			<g opacity={clock.current === 'ortu' ? smooth(clamp01(clock.seconds / 0.8)) : 0} fontFamily={palette.fontDisplay} fontWeight={800} fontSize={30}>
				<text x={330} y={120} textAnchor="middle" fill={palette.ink}>
					Ormanlık yamaç
				</text>
				<text x={1030} y={120} textAnchor="middle" fill={palette.ink}>
					Çıplak tarla
				</text>
			</g>
		</ProcessFrame>
	);
};

const pointOn = (line: readonly Point[], share: number): Point => line[Math.min(line.length - 1, Math.max(0, Math.round(share * (line.length - 1))))];

/** A dam lake from above: muddy water comes in and its silt spreads from the inflow, filling the lake. */
const DamInset: React.FC<{show: number; silt: number; time: number}> = ({show, silt, time}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	if (show <= 0.01) return null;
	const box = {x: 1080, y: 92, w: 460, h: 230};
	const lake = `M${box.x + 120} ${box.y + 120} C${box.x + 170} ${box.y + 50} ${box.x + 330} ${box.y + 40} ${box.x + 400} ${box.y + 70} L${box.x + 400} ${box.y + 190} C${box.x + 320} ${box.y + 210} ${box.x + 170} ${box.y + 200} ${box.x + 120} ${box.y + 140} Z`;
	const reach = 40 + 220 * silt;
	return (
		<g opacity={show}>
			<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#E9F1DC" stroke={withAlpha(palette.ink, 0.35)} strokeWidth={2.5} />
			<FlowLine d={`M${box.x + 6} ${box.y + 135} C${box.x + 60} ${box.y + 120} ${box.x + 90} ${box.y + 140} ${box.x + 124} ${box.y + 130}`} time={time} width={10} colour={COLOURS.mud} />
			<path d={lake} fill={COLOURS.water} />
			<clipPath id={`dl${id}`}>
				<path d={lake} />
			</clipPath>
			<g clipPath={`url(#dl${id})`}>
				{/* The muddy plume and the silt laid down from the inflow. */}
				<ellipse cx={box.x + 120} cy={box.y + 130} rx={reach + 40} ry={40 + 50 * silt} fill={COLOURS.mud} opacity={0.35} />
				<ellipse cx={box.x + 120} cy={box.y + 130} rx={reach} ry={26 + 44 * silt} fill="#B89A6B" />
			</g>
			<rect x={box.x + 398} y={box.y + 60} width={14} height={140} rx={4} fill="#8A8F96" stroke="#5E636A" strokeWidth={2} />
			<text x={box.x + 18} y={box.y + 34} fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink}>
				Kuşbakışı: baraj gölü
			</text>
			<text x={box.x + 260} y={box.y + box.h - 14} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={20} fill={palette.ink}>
				Gelen mil gölü doldurur
			</text>
		</g>
	);
};
