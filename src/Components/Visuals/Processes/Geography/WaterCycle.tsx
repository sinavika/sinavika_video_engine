import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import type {VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, Drift, FlowLine, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, Tree, processCamera, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The water cycle on one coast: the Sun warms the sea, water vapour rises and the trees transpire; the vapour cools
 * and condenses into a cloud that the wind carries inland; air rising up the mountain cools and the cloud rains on
 * the slope and snows on the summit; the river carries the water back to the sea, and what soaks in feeds the
 * groundwater, which also flows to the sea.
 */

export const SEA_LEVEL = 470;
export const COAST = 560;
/** The land from the shore to the summit and down the far side. */
export const LAND: Point[] = [
	[COAST - 20, SEA_LEVEL + 10],
	[600, 462],
	[900, 445],
	[1050, 360],
	[1180, 240],
	[1250, 190],
	[1330, 230],
	[1450, 290],
	[SCENE.right + 100, 320],
];
/** The top of the groundwater, below the land, sloping down to the sea. */
export const TABLE: Point[] = [
	[COAST - 20, 494],
	[900, 506],
	[1200, 470],
	[SCENE.right + 100, 470],
];
const TREES = [700, 780, 860];
const SUMMIT: Point = [1250, 190];
/** Where the cloud forms over the sea, and where the wind leaves it over the slope. */
const CLOUD_SEA: Point = [400, 175];
const CLOUD_SLOPE: Point = [1110, 165];

/** The height of a polyline at x (linear between its points). */
export const heightAt = (points: readonly Point[], x: number): number => {
	if (x <= points[0][0]) return points[0][1];
	for (let index = 1; index < points.length; index++) {
		const [x0, y0] = points[index - 1];
		const [x1, y1] = points[index];
		if (x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0));
	}
	return points[points.length - 1][1];
};
const ground = (x: number) => heightAt(LAND, x);
const table = (x: number) => heightAt(TABLE, x);

/** The river from the snow under the summit down the slope, across the plain, into the sea. */
export const RIVER: Point[] = [
	[1232, 206],
	[1170, 250],
	[1090, 322],
	[1040, 368],
	[960, 420],
	[880, 446],
	[760, 455],
	[640, 460],
	[COAST - 30, SEA_LEVEL + 2],
];

const FRAMING: Record<string, CameraBox> = {
	buharlasma: [40, 80, 940, 560],
	yogusma: [120, 72, 1240, 520],
	yagis: [820, 72, 1560, 520],
	yuzeyakis: [480, 160, 1360, 600],
	yeralti: [520, 320, 1400, 640],
};

/** Where the cloud is: over the sea while it forms, then carried by the wind to the slope. */
export const cloudAt = (condensed: number): Point => {
	const carried = smooth(clamp01((condensed - 0.45) / 0.55));
	return [lerp(CLOUD_SEA[0], CLOUD_SLOPE[0], carried), lerp(CLOUD_SEA[1], CLOUD_SLOPE[1], carried)];
};

export const WaterCycleProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const clock = useProcessClock('watercycle', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const evaporate = clock.current === 'buharlasma' ? 1 : 0.35;
	const condensed = amount('yogusma');
	const grown = smooth(clamp01(condensed / 0.45));
	const [cloudX, cloudY] = cloudAt(condensed);
	const raining = clock.current === 'yagis' ? 1 : amount('yagis') >= 1 ? 0.3 : 0;
	const snow = smooth(amount('yagis'));
	const runoff = clock.current === 'yuzeyakis' ? 1 : 0.3 + 0.4 * amount('yagis');
	const soak = clock.current === 'yeralti' ? 1 : 0.25 * amount('yuzeyakis');
	const wind = clock.current === 'yogusma' ? smooth(clamp01((clock.progress - 0.35) / 0.3)) : 0;

	/** Vapour rising in thin wisps from a stretch of surface. */
	const vapour = (x0: number, x1: number, base: (x: number) => number, count: number, rise: number, seed: number, strength: number) =>
		Array.from({length: count}, (_, index) => {
			const x = x0 + noise(seed + index * 2.3) * (x1 - x0);
			const phase = (time * 0.22 + noise(seed + index * 5.1)) % 1;
			const y = base(x) - 8 - phase * rise;
			return (
				<path
					key={`${seed}-${index}`}
					d={`M${x} ${y} q8 -10 0 -20 q-8 -10 0 -20`}
					fill="none"
					stroke="#FFFFFF"
					strokeWidth={4}
					strokeLinecap="round"
					opacity={strength * 0.9 * Math.sin(Math.PI * phase)}
				/>
			);
		});

	// The snow cap: a layer on the ground round the summit that spreads down as it snows.
	const cap = 0.35 + 0.65 * snow;
	const capXs = Array.from({length: 13}, (_, index) => lerp(lerp(SUMMIT[0], 1180, cap), lerp(SUMMIT[0], 1330, cap), index / 12));
	const capPath = pathOf([...capXs.map((x): Point => [x, ground(x) - 3]), ...[...capXs].reverse().map((x): Point => [x, ground(x) + 10 + 6 * cap])], true);

	return (
		<ProcessFrame process="watercycle" clock={clock} camera={camera} width={width} height={height}>
			<Sky />
			{/* The Sun warms the sea. */}
			<circle cx={130} cy={140} r={44} fill="#FFD25A" />
			{Array.from({length: 8}, (_, index) => {
				const angle = (index / 8) * 2 * Math.PI + time * 0.2;
				return (
					<line
						key={index}
						x1={130 + 56 * Math.cos(angle)}
						y1={140 + 56 * Math.sin(angle)}
						x2={130 + 74 * Math.cos(angle)}
						y2={140 + 74 * Math.sin(angle)}
						stroke="#FFC233"
						strokeWidth={5}
						strokeLinecap="round"
						opacity={0.4 + 0.6 * evaporate}
					/>
				);
			})}
			{/* The sea. */}
			<rect x={SCENE.left - 100} y={SEA_LEVEL} width={COAST + 140} height={300} fill="#5C9BD1" />
			{/* The land, the rock under it and the groundwater in it. */}
			<path d={pathOf([...LAND, [SCENE.right + 100, 760], [COAST - 20, 760]], true)} fill="#B28E66" />
			<path d={pathOf([...TABLE, ...[...TABLE].reverse().map(([x, y]): Point => [x, y + 46])], true)} fill="#4F95DA" opacity={0.7 + 0.3 * soak} />
			<path
				d={pathOf(
					LAND.slice(0, 4).concat([
						[1050, 372],
						[900, 457],
						[600, 474],
						[COAST - 20, SEA_LEVEL + 22],
					]),
					true,
				)}
				fill="#8DB86A"
			/>
			{TREES.map((x, index) => (
				<Tree key={x} x={x} y={ground(x)} size={1.2 + 0.1 * index} seed={index + 4} />
			))}
			<path d={capPath} fill="#F7FAFC" stroke="#DCE6EE" strokeWidth={2} />
			{/* The river back to the sea. */}
			<FlowLine d={smoothPath(RIVER)} time={time} width={8 + 4 * runoff} speed={40 + 60 * runoff} opacity={0.45 + 0.55 * runoff} />
			{/* Evaporation from the sea and transpiration from the leaves. */}
			{vapour(SCENE.left + 40, COAST - 60, () => SEA_LEVEL, 16, 220, 1, evaporate)}
			{TREES.flatMap((x, index) => vapour(x - 30, x + 30, () => ground(x) - 120, 3, 140, 20 + index * 7, evaporate * 0.9))}
			{/* The cloud forms, the wind carries it inland, and it rains on the slope and snows on the summit. */}
			<g opacity={0.15 + 0.85 * grown}>
				<Cloud x={cloudX} y={cloudY} scale={0.55 + 0.55 * grown} dark={0.15 + 0.5 * raining} />
			</g>
			<g opacity={wind}>
				<path d={`M${CLOUD_SEA[0] + 120} 92 L${CLOUD_SLOPE[0] - 160} 92`} stroke="#7A8CA0" strokeWidth={6} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={-time * 60} />
				<path d={`M${CLOUD_SLOPE[0] - 160} 92 l-22 -14 m22 14 l-22 14`} stroke="#7A8CA0" strokeWidth={6} strokeLinecap="round" fill="none" />
			</g>
			<Rain x0={cloudX - 90} x1={Math.min(cloudX + 60, 1170)} top={cloudY + 30} ground={ground} time={time} amount={raining} count={46} slant={0.05} />
			<g opacity={clamp01(raining * 1.6)}>
				{Array.from({length: 18}, (_, index) => {
					const x = 1180 + noise(index * 4.7 + 3) * 140;
					const phase = (time * 0.45 + noise(index * 1.9)) % 1;
					const y = lerp(cloudY + 10, ground(x) - 4, phase);
					return <circle key={index} cx={x + 8 * Math.sin(time * 2 + index)} cy={y} r={4.5} fill="#FFFFFF" stroke="#C9D6E2" strokeWidth={1} />;
				})}
			</g>
			{/* Water soaking into the soil and the groundwater flowing to the sea. */}
			<g opacity={clamp01(soak * 1.4)}>
				{Array.from({length: 22}, (_, index) => {
					const x = 640 + noise(index * 3.3 + 7) * 520;
					const phase = (time * 0.35 + noise(index * 6.1)) % 1;
					return <circle key={index} cx={x} cy={lerp(ground(x) + 10, table(x) + 6, phase)} r={4} fill="#3E7FC0" opacity={Math.sin(Math.PI * phase)} />;
				})}
			</g>
			<Drift
				points={[
					[1400, 490],
					[1200, 492],
					[900, 527],
					[COAST - 10, 516],
					[COAST - 80, 520],
				]}
				time={time}
				count={26}
				amount={soak}
				colour="#2F6FAE"
				size={4.5}
				speed={0.08}
				spread={10}
				seed={9}
			/>
			<ProcessLabel id="buharlasma" at={[300, SEA_LEVEL - 40]} to={[330, 330]} text="Denizden buharlaşma" show={clock.now('buharlasma')} />
			<ProcessLabel id="terleme" at={[TREES[1], ground(TREES[1]) - 130]} to={[790, 250]} text="Bitkilerden terleme" show={clock.now('buharlasma')} />
			<ProcessLabel id="yogusma" at={[cloudX, cloudY + 20]} to={[cloudX, cloudY + 140]} text="Buhar soğur, yoğuşur: bulut" show={clock.now('yogusma') * clamp01(grown * 2)} />
			<ProcessLabel id="ruzgar" at={[760, 92]} to={[760, 140]} text="Rüzgâr bulutu karaya taşır" show={clock.now('yogusma') * wind} size={22} />
			<ProcessLabel id="yagis" at={[1080, 330]} to={[930, 300]} text="Yükselen hava soğur: yağış" show={clock.now('yagis')} />
			<ProcessLabel id="kar" at={[SUMMIT[0] + 20, SUMMIT[1] + 10]} to={[1420, 170]} text="Zirvede kar" show={clock.now('yagis') * snow} size={22} />
			<ProcessLabel id="yuzeyakis" at={[960, 420]} to={[980, 520]} text="Akarsu suyu denize taşır" show={clock.now('yuzeyakis')} />
			<ProcessLabel id="yeralti" at={[1000, table(1000) + 20]} to={[1050, 600]} text="Sızan su yer altı suyunu besler" show={clock.now('yeralti')} size={23} />
		</ProcessFrame>
	);
};
