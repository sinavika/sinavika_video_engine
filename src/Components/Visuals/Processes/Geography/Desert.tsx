import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Drift, ProcessFrame, ProcessLabel, SCENE, Sky, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Wind at work in a desert, seen from the side: the wind carries sand in hops close to the ground and sandblasts the
 * rocks; a rock wears most at its foot until it stands as a mushroom rock; soft layers wear back from under a hard cap
 * until only a witness rock is left, its faces pitted with tafoni; and sand heaps into a barchan that creeps
 * downwind, grains climbing its gentle back and sliding down its steep face (its crescent shown from above), while
 * the finest dust is carried far away (loess).
 */

const GROUND = 520;
const MUSHROOM = {x: 420, half: 66, top: 300};
const MESA = {x: 930, cap: 26, top: 330};
const DUNE = {x: 1320, height: 110, back: 190, face: 70};

const COLOURS = {
	sand: '#E8C98A',
	sandDark: '#CFA866',
	rock: '#B9805A',
	rockDark: '#8E5B3C',
	cap: '#6F4A33',
	soft: ['#D9A877', '#C99566', '#E2B88A'] as const,
	dust: '#E9D3A0',
};

const FRAMING: Record<string, CameraBox> = {
	ruzgar: [60, 200, 720, 580],
	mantar: [240, 220, 620, 580],
	sahit: [640, 190, 1220, 590],
	barkan: [1060, 180, 1560, 610],
};

export const DesertProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const clock = useProcessClock('desert', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const blast = 0.15 * amount('ruzgar') + 0.85 * smooth(amount('mantar'));
	const wear = smooth(amount('sahit'));
	const drift = smooth(amount('barkan'));
	const ground = (x: number) => GROUND + 5 * Math.sin(x / 90) + 3 * Math.sin(x / 31);

	// The mushroom rock: worn most a little above its foot, where the sand flies.
	const halfWidth = (y: number) => {
		const above = GROUND - y;
		const bite = Math.exp(-(((above - 34) / 30) ** 2));
		return MUSHROOM.half * (1 - 0.68 * blast * bite) * (y < MUSHROOM.top + 30 ? 1.08 : 1);
	};
	const rockYs = sampled((y) => y, MUSHROOM.top, GROUND, 6).map(([y]) => y);
	const mushroom = smoothPath([...rockYs.map((y) => [MUSHROOM.x - halfWidth(y), y] as Point), ...rockYs.slice().reverse().map((y) => [MUSHROOM.x + halfWidth(y), y] as Point)], true);

	// The mesa wears back to a narrow witness rock under its hard cap.
	const mesaHalf = lerp(230, 58, wear);
	const layerTop = (index: number) => MESA.top + MESA.cap + index * 52;
	const mesaLayers = [0, 1, 2].map((index) => {
		const spread = mesaHalf + 18 * (index + 1) * (1 - wear * 0.3) + 10;
		return pathOf([[MESA.x - spread + 8, layerTop(index)], [MESA.x + spread - 8, layerTop(index)], [MESA.x + spread + 6, Math.min(GROUND, layerTop(index) + 52)], [MESA.x - spread - 6, Math.min(GROUND, layerTop(index) + 52)]], true);
	});
	const scree = (side: number) => pathOf([[MESA.x + side * (mesaHalf + 40), GROUND + 2], [MESA.x + side * (mesaHalf + 140 * wear + 60), GROUND + 2], [MESA.x + side * (mesaHalf + 46), GROUND - 34 * wear]], true);

	// The barchan: a gentle back towards the wind, a steep slip face away from it; it creeps downwind.
	const duneX = DUNE.x + 70 * drift + 6 * Math.sin(time * 0.3);
	const duneTop: Point = [duneX, GROUND - DUNE.height];
	const dunePath = pathOf([[duneX - DUNE.back, ground(duneX - DUNE.back) + 2], [duneX - DUNE.back * 0.5, GROUND - DUNE.height * 0.62], duneTop, [duneX + DUNE.face, ground(duneX + DUNE.face) + 2]], true);

	return (
		<ProcessFrame process="desert" clock={clock} camera={camera} width={width} height={height} backdrop="#F6E7C8" overlay={<BarchanInset show={clock.now('barkan')} />}>
			<Sky colourTop="#F3D19B" colourBottom="#FFF4DE" />
			<circle cx={1450} cy={140} r={46} fill="#FFE29A" opacity={0.85} />
			<path d={pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 8), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true)} fill={COLOURS.sand} />
			{Array.from({length: 40}, (_, index) => {
				const x = SCENE.left + noise(index * 3.7) * (SCENE.right - SCENE.left);
				return <path key={index} d={`M${x - 12} ${ground(x) + 14 + noise(index) * 60} q12 -5 24 0`} fill="none" stroke={COLOURS.sandDark} strokeWidth={1.6} opacity={0.6} />;
			})}
			{/* The mushroom rock. */}
			<path d={mushroom} fill={COLOURS.rock} stroke={COLOURS.rockDark} strokeWidth={2} />
			{[0, 1, 2, 3].map((index) => (
				<line key={index} x1={MUSHROOM.x - halfWidth(MUSHROOM.top + 40 + index * 45) + 4} x2={MUSHROOM.x + halfWidth(MUSHROOM.top + 40 + index * 45) - 4} y1={MUSHROOM.top + 40 + index * 45} y2={MUSHROOM.top + 40 + index * 45} stroke={COLOURS.rockDark} strokeWidth={1.4} opacity={0.6} />
			))}
			{/* The witness rock: soft layers under a hard cap, scree at its feet, tafoni pits in its faces. */}
			<path d={scree(-1)} fill={COLOURS.sandDark} />
			<path d={scree(1)} fill={COLOURS.sandDark} />
			{mesaLayers.map((layer, index) => (
				<path key={index} d={layer} fill={COLOURS.soft[index]} stroke={COLOURS.rockDark} strokeWidth={1.4} />
			))}
			<path d={pathOf([[MESA.x - mesaHalf - 20, MESA.top], [MESA.x + mesaHalf + 20, MESA.top], [MESA.x + mesaHalf + 24, MESA.top + MESA.cap], [MESA.x - mesaHalf - 24, MESA.top + MESA.cap]], true)} fill={COLOURS.cap} />
			<g opacity={clamp01(wear * 2 - 0.4)}>
				{Array.from({length: 9}, (_, index) => {
					const side = index % 2 ? 1 : -1;
					const y = layerTop(0) + 18 + Math.floor(index / 2) * 30;
					return <ellipse key={index} cx={MESA.x + side * (mesaHalf + 18 - 10 * noise(index))} cy={y} rx={6 + 4 * noise(index * 2)} ry={5 + 3 * noise(index * 3)} fill="#5A3A26" opacity={0.75} />;
				})}
			</g>
			{/* The barchan and the grains crossing it. */}
			<path d={dunePath} fill={COLOURS.sandDark} stroke="#B98F4E" strokeWidth={1.5} />
			<path d={pathOf([duneTop, [duneX + DUNE.face, ground(duneX + DUNE.face) + 2]])} stroke="#A57D40" strokeWidth={3} />
			<Drift points={[[duneX - DUNE.back + 10, GROUND - 6], [duneX - DUNE.back * 0.5, GROUND - DUNE.height * 0.62 - 4], [duneTop[0], duneTop[1] - 4], [duneX + DUNE.face * 0.8, GROUND - 14]]} time={time} count={24} colour="#A07640" size={2.8} speed={0.35} spread={3} amount={drift > 0 ? 1 : 0.3} />
			{/* Wind: streaks moving downwind, and sand hopping low over the ground. */}
			<g opacity={0.35 + 0.65 * Math.max(clock.now('ruzgar'), clock.now('mantar'), clock.now('barkan'))}>
				{Array.from({length: 12}, (_, index) => {
					const y = 240 + noise(index * 5.1) * 230;
					const x = SCENE.left + ((noise(index * 2.3) * 1600 + time * 260) % 1700) - 100;
					return <path key={index} d={`M${x} ${y} q40 -10 80 0 t80 0`} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.75} />;
				})}
				{Array.from({length: 46}, (_, index) => {
					const start = SCENE.left + noise(index * 3.1) * 1500;
					const hop = (time * 1.1 + noise(index * 1.7)) % 1;
					const x = start + hop * 90;
					const y = ground(x) - 4 - 48 * (hop - hop * hop) * 4 * (0.4 + 0.6 * noise(index * 9.1));
					return <circle key={index} cx={x} cy={y} r={2.2} fill="#9C7442" />;
				})}
			</g>
			{/* Loess: the finest dust carried far away. */}
			<g opacity={clock.now('barkan') * 0.8}>
				{Array.from({length: 8}, (_, index) => {
					const phase = (time * 0.2 + index / 8) % 1;
					return <ellipse key={index} cx={1250 + phase * 380} cy={300 - 40 * noise(index) - 60 * phase} rx={40 + 50 * phase} ry={16 + 12 * phase} fill={COLOURS.dust} opacity={0.7 * (1 - phase)} />;
				})}
			</g>
			<ProcessLabel id="ruzgar" at={[300, GROUND - 26]} to={[220, 300]} text="Kum yere yakın taşınır" show={clock.now('ruzgar')} />
			<ProcessLabel id="mantar" at={[MUSHROOM.x + halfWidth(GROUND - 34), GROUND - 34]} to={[MUSHROOM.x + 150, 290]} text="Mantar kaya" show={clock.now('mantar') * clamp01(blast * 2)} />
			<ProcessLabel id="sahit" at={[MESA.x, MESA.top + 10]} to={[MESA.x - 40, 250]} text="Şahit kaya" show={clock.now('sahit')} />
			<ProcessLabel id="tafoni" at={[MESA.x + mesaHalf + 14, layerTop(0) + 48]} to={[MESA.x + 210, 300]} text="Tafoni" show={clock.now('sahit') * clamp01(wear * 2 - 0.6)} />
			<ProcessLabel id="barkan" at={[duneX - 40, GROUND - DUNE.height * 0.7]} to={[duneX - 160, 330]} text="Barkan" show={clock.now('barkan')} />
			<ProcessLabel id="los" at={[1330, 300]} to={[1010, 250]} text="Lös: uzağa taşınan ince toz" show={clock.now('barkan') * drift} size={22} />
		</ProcessFrame>
	);
};

/** A barchan from above: a crescent whose horns point downwind. */
const BarchanInset: React.FC<{show: number}> = ({show}) => {
	const palette = useVisualPalette();
	if (show <= 0.01) return null;
	const box = {x: 1180, y: 92, w: 360, h: 190};
	const cx = box.x + 200;
	const cy = box.y + 110;
	return (
		<g opacity={show}>
			<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#FBF3E3" stroke={withAlpha(palette.ink, 0.3)} strokeWidth={2.5} />
			<path d={`M${cx - 70} ${cy - 50} Q${cx + 60} ${cy - 70} ${cx + 80} ${cy - 40} Q${cx + 20} ${cy - 30} ${cx + 10} ${cy} Q${cx + 20} ${cy + 30} ${cx + 80} ${cy + 40} Q${cx + 60} ${cy + 70} ${cx - 70} ${cy + 50} Q${cx - 110} ${cy} ${cx - 70} ${cy - 50} Z`} fill={COLOURS.sandDark} stroke="#A57D40" strokeWidth={2} />
			<path d={`M${box.x + 24} ${cy} l70 0 m-14 -10 l14 10 l-14 10`} stroke={palette.ink} strokeWidth={4} fill="none" />
			<text x={box.x + 18} y={box.y + 34} fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink}>
				Kuşbakışı barkan
			</text>
			<text x={box.x + 22} y={cy + 34} fontFamily={palette.fontBody} fontWeight={700} fontSize={18} fill={palette.muted}>
				rüzgâr
			</text>
		</g>
	);
};
