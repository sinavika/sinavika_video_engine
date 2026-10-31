import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Drift, FlowLine, Grass, ProcessFrame, ProcessLabel, SCENE, Sky, Tree, processCamera, sampled, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * A glacier along its valley, from the peak to the plain: snow above the permanent snow line packs into ice; the ice
 * rotates in its hollow and plucks the rock, carving a cirque; it flows down, grinding the valley from V to U (shown
 * across the valley in a panel) and smoothing a rock into a roche moutonnée; when it melts back it leaves its load as
 * moraine ridges, a lake fills the cirque and meltwater runs out over the plain.
 */

const SNOW_LINE = 330;
const PEAK: Point = [180, 104];
const CIRQUE = {x: 405, half: 78};
const VALLEY_END = 1100;
const PLAIN_Y = 560;
const HORGUC_X = 860;
const FRONT = {start: 360, early: 720, full: 1050, melted: 240};

const bowl = (u: number) => (Math.abs(u) < 1 ? (1 - u * u) ** 2 : 0);

const COLOURS = {
	rock: '#9A8F86',
	rockDark: '#7C7168',
	snow: '#FFFFFF',
	ice: '#BFE0F2',
	iceDeep: '#8CC4E6',
	moraine: '#A48D73',
	water: '#5A97CF',
	grass: '#9CC57A',
};

const FRAMING: Record<string, CameraBox> = {
	karsiniri: [40, 72, 780, 520],
	sirk: [140, 90, 660, 440],
	buzulvadisi: undefined,
	moren: [300, 160, 1220, 600],
};

export const GlacierProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const clock = useProcessClock('glacier', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const snow = smooth(amount('karsiniri'));
	const cirque = smooth(amount('sirk'));
	const grind = smooth(amount('buzulvadisi'));
	const melt = smooth(amount('moren'));
	const front = lerp(lerp(lerp(FRONT.start, FRONT.early, snow), FRONT.full, grind), FRONT.melted, melt);
	const iceShown = Math.max(snow, cirque, grind) > 0.01 ? 1 : 0;

	const ground = (x: number): number => {
		if (x <= PEAK[0]) return lerp(300, PEAK[1], smoothStep(clamp01((x - SCENE.left) / (PEAK[0] - SCENE.left))));
		if (x <= 330) return lerp(PEAK[1], 300, smoothStep((x - PEAK[0]) / (330 - PEAK[0])));
		const hollow = (0.3 + 0.7 * cirque) * 46 * bowl((x - CIRQUE.x) / CIRQUE.half);
		const horguc = (0.4 + 0.6 * grind) * 18 * Math.exp(-(((x - HORGUC_X) / (x < HORGUC_X ? 46 : 18)) ** 2));
		if (x <= VALLEY_END) return lerp(300, 470, smoothStep((x - 330) / (VALLEY_END - 330))) + hollow - horguc;
		return lerp(470, PLAIN_Y, smoothStep(clamp01((x - VALLEY_END) / 220)));
	};
	/** The ice: thick in the cirque, thinning to its front. */
	const thickness = (x: number) => {
		if (x < 250 || x > front) return 0;
		const along = clamp01((x - 300) / Math.max(1, front - 300));
		return (x < 300 ? 22 * ((x - 250) / 50) : 26 + 52 * Math.sqrt(1 - along)) * clamp01((front - x) / 18 + 0.15);
	};
	const iceTop = (x: number) => ground(x) - thickness(x);
	const groundPath = pathOf([...sampled(ground, SCENE.left - 120, SCENE.right + 120, 5), [SCENE.right + 120, 760], [SCENE.left - 120, 760]], true);
	const icePath = pathOf([...sampled(iceTop, 250, front, 5), ...sampled(ground, 250, front, 5).reverse()], true);
	// Moraine ridges where the front stood: the biggest at its furthest reach, smaller ones as it melted back.
	const moraines = [
		{x: FRONT.full + 12, size: 30},
		{x: 860, size: 16},
		{x: 690, size: 13},
	].map((ridge) => ({...ridge, shown: clamp01((ridge.x - front) / 60) * (melt > 0 ? 1 : 0)}));
	const lakeLevel = ground(CIRQUE.x + CIRQUE.half + 4) - 2;
	const lake = smoothStep(clamp01((CIRQUE.x + CIRQUE.half - front) / 40)) * melt;

	return (
		<ProcessFrame
			process="glacier"
			clock={clock}
			camera={camera}
			width={width}
			height={height}
			overlay={<ValleyInset show={clock.now('buzulvadisi')} grind={grind} />}
		>
			<Sky colourTop="#C7DDEE" colourBottom="#F3F7FA" />
			{/* Snow falling above the snow line. */}
			<g opacity={clock.current === 'karsiniri' ? 0.9 : 0.25}>
				{Array.from({length: 60}, (_, index) => {
					const x = SCENE.left + noise(index * 2.9) * 760;
					const fall = (time * 0.12 + noise(index * 4.1)) % 1;
					const y = lerp(SCENE.top - 10, Math.min(SNOW_LINE, ground(x)), fall);
					return <circle key={index} cx={x + 8 * Math.sin(time + index)} cy={y} r={2.6 + 1.6 * noise(index)} fill="#FFFFFF" stroke="#C9D7E3" strokeWidth={0.6} />;
				})}
			</g>
			<defs>
				<clipPath id={`gg${id}`}>
					<path d={groundPath} />
				</clipPath>
				<linearGradient id={`gi${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#E8F5FC" />
					<stop offset="1" stopColor={COLOURS.iceDeep} />
				</linearGradient>
			</defs>
			<path d={groundPath} fill={COLOURS.rock} />
			<g clipPath={`url(#gg${id})`}>
				{Array.from({length: 8}, (_, index) => (
					<path key={index} d={pathOf(sampled((x) => ground(x) + 40 + index * 34 + 6 * Math.sin(x / 80 + index), SCENE.left - 100, SCENE.right + 100, 30))} fill="none" stroke={COLOURS.rockDark} strokeWidth={1.4} opacity={0.5} />
				))}
				{/* Green below the snow line, snow above it. */}
				<path d={pathOf([...sampled((x) => ground(x), VALLEY_END - 200, SCENE.right + 120, 8), ...sampled((x) => ground(x) + 10, VALLEY_END - 200, SCENE.right + 120, 8).reverse()], true)} fill={COLOURS.grass} />
			</g>
			<path d={pathOf([...sampled((x) => ground(x) - 7 * clamp01((SNOW_LINE - ground(x)) / 30), SCENE.left - 120, 760, 5), ...sampled(ground, SCENE.left - 120, 760, 5).reverse()], true)} fill={COLOURS.snow} />
			{/* The snow line. */}
			<path d={pathOf([[SCENE.left - 50, SNOW_LINE], [SCENE.right + 50, SNOW_LINE]])} stroke={palette.lesson} strokeWidth={3} strokeDasharray="16 10" opacity={0.35 + 0.65 * clock.now('karsiniri')} />
			{/* The cirque lake once the ice has gone. */}
			<path d={pathOf([...sampled((x) => Math.min(lakeLevel, ground(x)), CIRQUE.x - CIRQUE.half, CIRQUE.x + CIRQUE.half, 4), ...sampled(ground, CIRQUE.x - CIRQUE.half, CIRQUE.x + CIRQUE.half, 4).reverse()], true)} fill={COLOURS.water} opacity={lake} />
			{/* The glacier: layers of packed snow turning to blue ice, crevasses riding down with the flow. */}
			<g opacity={iceShown}>
				<path d={icePath} fill={`url(#gi${id})`} stroke="#7FB3D6" strokeWidth={2} />
				{[0.25, 0.5, 0.75].map((share) => (
					<path key={share} d={pathOf(sampled((x) => ground(x) - thickness(x) * share, 300, Math.max(301, front - 10), 10))} fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1.6} />
				))}
				{Array.from({length: 10}, (_, index) => {
					const span = Math.max(1, front - 340);
					const x = 340 + ((noise(index * 3.3) * span + time * 14) % span);
					const y = iceTop(x);
					return <path key={index} d={`M${x} ${y + 1} l-4 10 M${x + 6} ${y + 1} l-3 8`} stroke="#5E8DB0" strokeWidth={2} opacity={thickness(x) > 12 ? 0.8 : 0} />;
				})}
			</g>
			{/* Rock plucked from the cirque, carried in the ice to the front. */}
			<Drift points={sampled((x) => ground(x) - Math.max(6, thickness(x) * 0.25), 330, Math.max(331, front - 8), 30)} time={time} count={22} amount={Math.max(cirque, grind) * (1 - melt)} colour="#5E544B" size={4} speed={0.05} spread={3} />
			{/* Ice turning in its hollow. */}
			<g opacity={clock.now('sirk')}>
				<path d={`M${CIRQUE.x - 60} ${ground(CIRQUE.x) - 70} A 70 52 0 1 0 ${CIRQUE.x + 40} ${ground(CIRQUE.x) - 66}`} fill="none" stroke={palette.lesson} strokeWidth={4} strokeDasharray="10 7" strokeDashoffset={-time * 30} />
			</g>
			{moraines.map((ridge, index) => (
				<g key={index} opacity={ridge.shown}>
					<path d={`M${ridge.x - ridge.size * 1.8} ${ground(ridge.x) + 2} Q${ridge.x} ${ground(ridge.x) - ridge.size * 2} ${ridge.x + ridge.size * 1.8} ${ground(ridge.x) + 2} Z`} fill={COLOURS.moraine} />
					{Array.from({length: 6}, (_, stone) => (
						<circle key={stone} cx={ridge.x - ridge.size + noise(stone + index * 9) * ridge.size * 2} cy={ground(ridge.x) - ridge.size * 0.5 * noise(stone * 2 + index)} r={2 + 3 * noise(stone)} fill="#6E5E4E" />
					))}
				</g>
			))}
			{/* Meltwater running out from the front. */}
			<FlowLine d={smoothPath(sampled((x) => ground(x) - 3, front, SCENE.right + 40, 20))} time={time} width={5} opacity={melt} />
			<Grass ground={ground} x0={VALLEY_END + 40} x1={SCENE.right} count={14} seed={3} />
			{[1240, 1330, 1460].map((x, index) => (
				<Tree key={x} x={x} y={ground(x) + 2} size={0.9} kind="pine" seed={index} />
			))}
			<ProcessLabel id="karsiniri" at={[620, SNOW_LINE]} to={[640, 250]} text="Kalıcı kar sınırı" show={clock.now('karsiniri')} />
			<ProcessLabel id="buz" at={[420, iceTop(420) + 20]} to={[330, 165]} text="Kar sıkışır, buza döner" show={clock.now('karsiniri') * clamp01(snow * 3)} />
			<ProcessLabel id="sirk" at={[CIRQUE.x, ground(CIRQUE.x) - 6]} to={[CIRQUE.x + 150, 215]} text="Sirk: koltuk biçimli çukur" show={clock.now('sirk')} />
			<ProcessLabel id="buzulvadisi" at={[700, iceTop(700) + 10]} to={[720, 260]} text="Buzul vadiyi törpüler" show={clock.now('buzulvadisi')} />
			<ProcessLabel id="horguc" at={[HORGUC_X, ground(HORGUC_X) - 4]} to={[HORGUC_X + 40, 600]} text="Hörgüç kaya" show={clock.now('buzulvadisi') * grind} />
			<ProcessLabel id="moren" at={[FRONT.full + 12, ground(FRONT.full) - 20]} to={[FRONT.full - 20, 380]} text="Moren" show={clock.now('moren') * moraines[0].shown} />
			<ProcessLabel id="sirk" at={[CIRQUE.x, lakeLevel + 6]} to={[CIRQUE.x - 40, 230]} text="Sirk gölü" show={clock.now('moren') * lake} />
		</ProcessFrame>
	);
};

/** Across the valley: the river's V worn into the glacier's U, the ice filling it while it grinds. */
const ValleyInset: React.FC<{show: number; grind: number}> = ({show, grind}) => {
	const palette = useVisualPalette();
	if (show <= 0.01) return null;
	const box = {x: 1150, y: 92, w: 390, h: 250};
	const profile = (u: number) => {
		const v = 1 - Math.abs(u - 0.5) * 2;
		const vShape = v;
		const uShape = Math.min(1, (1 - Math.pow(Math.abs(u - 0.5) * 2, 4)) * 1.08);
		return lerp(vShape, uShape, grind);
	};
	const points: Point[] = sampled((u) => box.y + 70 + 140 * profile(u), 0, 1, 0.02).map(([u, y]) => [box.x + 30 + u * (box.w - 60), y] as Point);
	const ground = pathOf([...points, [box.x + box.w - 30, box.y + box.h - 16], [box.x + 30, box.y + box.h - 16]], true);
	const ice = pathOf([...points.filter(([, y]) => y >= box.y + 110)], true);
	return (
		<g opacity={show}>
			<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#F4F8FB" stroke={withAlpha(palette.ink, 0.3)} strokeWidth={2.5} />
			<path d={ground} fill={COLOURS.rock} />
			<path d={ice} fill={COLOURS.ice} opacity={0.85 * grind} />
			<path d={pathOf(points)} fill="none" stroke={palette.lesson} strokeWidth={4} />
			<text x={box.x + 18} y={box.y + 34} fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink}>
				Vadinin kesiti: V → U
			</text>
		</g>
	);
};
