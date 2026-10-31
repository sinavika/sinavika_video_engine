import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Drift, FlowLine, ProcessFrame, ProcessLabel, SCENE, SceneTag, processCamera, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The sea from the shore to the deep floor, in cross-section: light reaches down to about 200 m, where the
 * phytoplankton photosynthesise; rivers bring nitrogen and phosphorus from the land, so the continental shelf is
 * full of life; deeper down the light fades, the water cools and the pressure grows by about 1 atm every 10 m; on
 * the dark floor food only falls from above and life is sparse.
 */

const SURFACE = 150;
/** Depth (m) to height in the scene: the top 200 m drawn large, the deep sea squeezed (marked on the scale). */
const DEPTHS: Point[] = [
	[0, SURFACE],
	[200, 270],
	[1000, 390],
	[4000, 600],
];
export const depthY = (metres: number): number => {
	for (let index = 1; index < DEPTHS.length; index++) {
		const [d0, y0] = DEPTHS[index - 1];
		const [d1, y1] = DEPTHS[index];
		if (metres <= d1) return lerp(y0, y1, (metres - d0) / (d1 - d0));
	}
	return DEPTHS[DEPTHS.length - 1][1];
};
/** Pressure at a depth: 1 atm of air plus about 1 atm for every 10 m of water. */
export const pressureAt = (metres: number) => 1 + metres / 10;
/** A mid-latitude sea's temperature by depth: warm at the top, a quick drop, then cold all the way down. */
const TEMPERATURES: Point[] = [
	[0, 20],
	[200, 15],
	[1000, 5],
	[4000, 2],
];
export const temperatureAt = (metres: number): number => {
	for (let index = 1; index < TEMPERATURES.length; index++) {
		const [d0, t0] = TEMPERATURES[index - 1];
		const [d1, t1] = TEMPERATURES[index];
		if (metres <= d1) return lerp(t0, t1, (metres - d0) / (d1 - d0));
	}
	return TEMPERATURES[TEMPERATURES.length - 1][1];
};

const SHORE = 210;
/** The sea floor: the shelf down to 200 m, the steep slope, the deep floor. */
const FLOOR: Point[] = [
	[SHORE, SURFACE],
	[560, depthY(200)],
	[700, depthY(1000)],
	[860, depthY(3800)],
	[SCENE.right + 100, depthY(4000)],
];
const PROBE_X = 1080;

const FRAMING: Record<string, CameraBox> = {
	isik: [40, 72, 940, 420],
	besin: [40, 72, 780, 400],
	derinlik: [620, 72, 1560, 640],
	dip: [760, 300, 1560, 640],
};

/** A small fish facing left or right. */
const Fish: React.FC<{x: number; y: number; size?: number; colour?: string; flip?: boolean; glow?: boolean}> = ({x, y, size = 1, colour = '#F2A541', flip = false, glow = false}) => (
	<g transform={`translate(${x} ${y}) scale(${flip ? -size : size} ${size})`}>
		{glow ? <circle cx={-14} cy={-6} r={6} fill="#FFF59D" opacity={0.9} /> : null}
		<ellipse cx={0} cy={0} rx={16} ry={7} fill={colour} />
		<path d="M14 0 l10 -7 l0 14 z" fill={colour} />
		<circle cx={-9} cy={-2} r={1.8} fill="#1B2430" />
	</g>
);

export const OceanProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const gradient = `ocean${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const clock = useProcessClock('ocean', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const light = clock.current === 'isik' ? 1 : 0.55;
	const feed = clock.current === 'besin' ? 1 : 0.3 + 0.3 * amount('besin');
	// The probe goes down while the depth stage runs and rests on the floor after it.
	const probeDepth = 4000 * smooth(amount('derinlik')) ** 2;
	const probeY = depthY(probeDepth);
	const fall = clock.current === 'dip' ? 1 : 0.2;

	return (
		<ProcessFrame process="ocean" clock={clock} camera={camera} width={width} height={height} backdrop="#DCEFFA">
			<defs>
				<linearGradient id={gradient} x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
					<stop offset={SURFACE / 700} stopColor="#5FB4E0" />
					<stop offset={depthY(200) / 700} stopColor="#2F7DB6" />
					<stop offset={depthY(1000) / 700} stopColor="#163F6E" />
					<stop offset={1} stopColor="#081A33" />
				</linearGradient>
			</defs>
			{/* The sea, the land and the river reaching it. */}
			<rect x={SCENE.left - 100} y={SURFACE} width={1800} height={600} fill={`url(#${gradient})`} />
			<path d={pathOf([[SCENE.left - 100, 130], [SHORE - 30, 132], ...FLOOR, [SCENE.right + 100, 760], [SCENE.left - 100, 760]], true)} fill="#8A6E50" />
			<path
				d={pathOf(
					[
						[SCENE.left - 100, 128],
						[SHORE - 30, 130],
						[SHORE, SURFACE],
						[SHORE - 30, 140],
						[SCENE.left - 100, 140],
					],
					true,
				)}
				fill="#86B95C"
			/>
			<FlowLine
				d={smoothPath([
					[SCENE.left + 20, 128],
					[120, 134],
					[SHORE - 10, SURFACE - 2],
				])}
				time={time}
				width={9}
			/>
			{/* Sunlight reaching down to about 200 m. */}
			<circle cx={1280} cy={100} r={34} fill="#FFD25A" />
			<g opacity={0.22 + 0.4 * light}>
				{Array.from({length: 9}, (_, index) => {
					const x = 300 + index * 130 + 20 * Math.sin(time * 0.8 + index);
					return (
						<path
							key={index}
							d={pathOf(
								[
									[x - 18, SURFACE],
									[x + 18, SURFACE],
									[x + 60, depthY(200)],
									[x + 20, depthY(200)],
								],
								true,
							)}
							fill="#FFF7C2"
							opacity={0.35 + 0.25 * Math.sin(time * 1.3 + index * 1.7)}
						/>
					);
				})}
			</g>
			<line x1={SCENE.left} y1={depthY(200)} x2={SCENE.right} y2={depthY(200)} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2.5} strokeDasharray="10 10" />
			{/* Phytoplankton in the lit layer: thicker over the shelf, where the rivers feed them. */}
			{Array.from({length: 90}, (_, index) => {
				const x = SHORE + 10 + noise(index * 2.7) * (SCENE.right - SHORE - 20);
				const nearShore = clamp01(1 - (x - SHORE) / 700);
				const y = SURFACE + 8 + noise(index * 5.3 + 1) * (depthY(200) - SURFACE - 16) + 4 * Math.sin(time + index);
				const shown = noise(index * 9.1) < 0.35 + 0.65 * nearShore * feed;
				return shown ? <circle key={index} cx={x} cy={y} r={3.2} fill="#7BD389" opacity={0.85} /> : null;
			})}
			{/* Nutrients from the river spreading over the shelf. */}
			<Drift
				points={[
					[SHORE - 10, SURFACE + 6],
					[320, 190],
					[460, 220],
					[600, 240],
				]}
				time={time}
				count={30}
				amount={feed}
				colour="#C9A26B"
				size={4}
				speed={0.12}
				spread={22}
				seed={3}
			/>
			{/* Life: fish schools over the shelf, corals on it, a few strange fish in the deep. */}
			{Array.from({length: 14}, (_, index) => {
				const lane = noise(index * 4.1);
				const x = 260 + ((noise(index * 1.7) * 600 + time * (18 + 10 * lane)) % 640);
				return <Fish key={index} x={x} y={SURFACE + 40 + lane * 70} size={0.8 + 0.4 * noise(index)} colour={index % 3 === 0 ? '#E8743B' : '#F2A541'} />;
			})}
			{[300, 360, 420, 480].map((x, index) => {
				const y = lerp(SURFACE, depthY(200), (x - SHORE) / (560 - SHORE));
				return <path key={x} d={`M${x} ${y} l-10 -18 m10 18 l0 -24 m0 24 l10 -16`} stroke={['#E85D75', '#F28C38', '#C850C0', '#E85D75'][index]} strokeWidth={5} strokeLinecap="round" />;
			})}
			{[0, 1, 2].map((index) => (
				<Fish key={index} x={980 + index * 170 + 30 * Math.sin(time * 0.3 + index)} y={depthY(1500 + index * 700)} size={0.9} colour="#4A5568" flip={index % 2 === 0} glow />
			))}
			{/* Marine snow: bits of the dead falling to the floor. */}
			<g opacity={clamp01(fall * 1.3)}>
				{Array.from({length: 30}, (_, index) => {
					const x = 880 + noise(index * 3.9) * 640;
					const phase = (time * 0.06 + noise(index * 7.3)) % 1;
					return <circle key={index} cx={x + 6 * Math.sin(time + index)} cy={lerp(depthY(200), depthY(4000) - 6, phase)} r={2.6} fill="#E6EEF5" opacity={0.8} />;
				})}
			</g>
			{/* The depth scale on the right. */}
			<g>
				{[0, 200, 1000, 4000].map((metres) => (
					<g key={metres}>
						<line x1={SCENE.right - 40} y1={depthY(metres)} x2={SCENE.right - 14} y2={depthY(metres)} stroke="#FFFFFF" strokeWidth={3} />
						<SceneTag
							x={SCENE.right - 48}
							y={depthY(metres)}
							text={`${metres.toLocaleString('tr-TR')} m`}
							anchor="end"
							size={20}
							fill={metres === 0 ? palette.ink : '#FFFFFF'}
							halo={metres === 0 ? undefined : '#0B2545'}
						/>
					</g>
				))}
			</g>
			{/* The probe going down, reading the temperature and the pressure. */}
			<g opacity={clock.now('derinlik') + (amount('derinlik') >= 1 ? 0.6 : 0)}>
				<line x1={PROBE_X} y1={SURFACE - 30} x2={PROBE_X} y2={probeY} stroke="#E6EEF5" strokeWidth={2} />
				<rect x={PROBE_X - 12} y={probeY - 10} width={24} height={30} rx={6} fill="#F2C94C" stroke="#8A6D1F" strokeWidth={2} />
				<g transform={`translate(${PROBE_X + 26} ${Math.min(probeY, depthY(4000) - 60)})`}>
					<rect x={0} y={-30} width={230} height={86} rx={14} fill={withAlpha('#FFFFFF', 0.92)} />
					<text x={14} y={-4} fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink}>
						{`${Math.round(probeDepth).toLocaleString('tr-TR')} m`}
					</text>
					<text x={14} y={24} fontFamily={palette.fontBody} fontWeight={700} fontSize={20} fill="#C0392B">
						{`${temperatureAt(probeDepth).toFixed(0)} °C`}
					</text>
					<text x={104} y={24} fontFamily={palette.fontBody} fontWeight={700} fontSize={20} fill="#1F4E79">
						{`${Math.round(pressureAt(probeDepth)).toLocaleString('tr-TR')} atm`}
					</text>
				</g>
			</g>
			<ProcessLabel id="isik" at={[700, depthY(150)]} to={[760, 330]} text="Işık yaklaşık 200 m'ye iner" show={clock.now('isik')} />
			<ProcessLabel id="plankton" at={[450, SURFACE + 30]} to={[540, 100]} text="Fitoplanktonlar fotosentez yapar" show={clock.now('isik')} size={23} />
			<ProcessLabel id="besin" at={[SHORE - 10, SURFACE]} to={[200, 260]} text="Akarsu azot ve fosfor getirir" show={clock.now('besin')} anchor="start" size={23} />
			<ProcessLabel id="sahanlik" at={[400, depthY(120)]} to={[470, 330]} text="Kıta sahanlığı: en zengin kesim" show={clock.now('besin')} size={23} />
			<ProcessLabel id="basinc" at={[PROBE_X, probeY]} to={[860, 160]} text="Soğuk, karanlık, yüksek basınç" show={clock.now('derinlik') * clamp01(amount('derinlik') * 2 - 0.4)} size={23} />
			<ProcessLabel id="dip" at={[1440, depthY(4000) - 10]} to={[1400, 440]} text="Besin yukarıdan düşer; canlı az" show={clock.now('dip')} size={23} />
		</ProcessFrame>
	);
};
