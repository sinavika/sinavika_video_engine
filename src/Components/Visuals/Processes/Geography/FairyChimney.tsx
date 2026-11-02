import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import type {VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {Cloud, ProcessFrame, ProcessLabel, Rain, SCENE, Sky, processCamera, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * How Cappadocia's fairy chimneys form, seen from the side: the volcanoes (Erciyes, Hasandağı) erupt and ash settles
 * into layers of soft tuff; lava covers the tuff and cools into a hard basalt cap; rain and floods find the cracks
 * and cut gullies down through the soft tuff; where the hard cap shields it the tuff stands as a column, a chimney
 * with a hat, and a chimney whose hat falls wears down quickly to a point; last, people carve homes, churches and
 * dovecotes into the soft rock (Göreme). The columns are a function of the stage, so the tests can check the form.
 */

export const CHIMNEY = {
	ground: 560,
	/** The top of the tuff, under the cap. */
	top: 326,
	cap: 26,
	/** The plateau's ends and the columns' middles: the plateau is cut into these columns. */
	left: 630,
	right: 1470,
	columns: [700, 840, 980, 1120, 1260, 1400],
	/** The column that loses its hat and wears down to a point. */
	hatless: 4,
} as const;

const HALF = (CHIMNEY.columns[1] - CHIMNEY.columns[0]) / 2;
/** How much lower each capped column ends: differential wear, never the same twice. */
const SETTLE = [0, 34, 12, 46, 0, 22];

type ChimneyColumn = {
	x: number;
	/** The column's top (under its hat) and its half-widths at the top and at the ground. */
	top: number;
	topHalf: number;
	baseHalf: number;
	/** How deep the gullies beside it reach, from its top: the ground once they cut through. */
	gully: number;
	/** The hat's half-width, or 0 once it has fallen. */
	hat: number;
};

/**
 * The columns at a point of the story: `erode` 0–1 is the gullies cutting down (stage asinma), `chimney` 0–1 the
 * columns narrowing under their hats (stage baca). At 0 and 0 the plateau is whole: neighbouring columns touch.
 */
export const chimneyColumns = (erode: number, chimney: number): ChimneyColumn[] =>
	CHIMNEY.columns.map((x, index) => {
		const hatless = index === CHIMNEY.hatless;
		const depth = CHIMNEY.ground - CHIMNEY.top;
		const topHalf = lerp(lerp(HALF, 40, erode), hatless ? 3 : 14, chimney);
		const baseHalf = lerp(HALF, hatless ? 46 : 54, chimney);
		const top = CHIMNEY.top + chimney * (hatless ? 150 : SETTLE[index]);
		return {
			x,
			top,
			topHalf,
			baseHalf,
			gully: Math.min(CHIMNEY.ground - top, erode * depth),
			hat: hatless ? (chimney < 0.35 ? topHalf + 2 : 0) : topHalf + lerp(2, 20, chimney),
		};
	});

/** The outline of one column: its top, the gully walls down to the gully floor, then straight down to the ground. */
export const columnOutline = (column: ChimneyColumn): Point[] => {
	const floor = column.top + column.gully;
	// Where the gully floor meets the column's wall: the wall leans out from the top half-width to the base half-width.
	const share = clamp01(column.gully / Math.max(1, CHIMNEY.ground - column.top));
	const wall = lerp(column.topHalf, column.baseHalf, share);
	const shoulder = column.gully < CHIMNEY.ground - column.top - 0.5 ? HALF : wall;
	return [
		[column.x - column.topHalf, column.top],
		[column.x + column.topHalf, column.top],
		[column.x + wall, floor],
		[column.x + shoulder, floor],
		[column.x + shoulder, CHIMNEY.ground],
		[column.x - shoulder, CHIMNEY.ground],
		[column.x - shoulder, floor],
		[column.x - wall, floor],
	];
};

const COLOURS = {
	tuff: '#E9D2AE',
	tuffDark: '#CDAF84',
	layer: '#D7B98F',
	basalt: '#4A403A',
	basaltEdge: '#2F2824',
	cone: '#8C7B6E',
	coneDark: '#6E5F55',
	lava: '#E4572E',
	ash: '#8F8A86',
	ground: '#C9AE87',
	opening: '#5B4634',
};

const FRAMING: Record<string, CameraBox> = {
	puskurme: [60, 90, 1500, 600],
	sapka: [300, 150, 1500, 600],
	asinma: [600, 150, 1500, 600],
	baca: [600, 180, 1500, 600],
	oyma: [760, 250, 1320, 590],
};

const VOLCANO = {left: 90, right: 590, peak: [330, 196] as Point, crater: 34};

/** Where the volcano's right flank stands at height y: the tuff blanket and the lava start from it. */
export const flankX = (y: number): number => {
	const top = VOLCANO.peak[0] + VOLCANO.crater;
	return lerp(top, VOLCANO.right, clamp01((y - VOLCANO.peak[1]) / (CHIMNEY.ground - VOLCANO.peak[1])));
};

/**
 * The lava's path: down the volcano's flank to the top of the tuff, then along it to the plateau. Never uphill: every
 * point lies at or below the one before it (KPSS Coğrafya 5, 2 Nov 2026: the first draft climbed to the plateau).
 */
export const LAVA_PATH: readonly Point[] = [
	[VOLCANO.peak[0] + 12, VOLCANO.peak[1] + 8],
	[flankX(CHIMNEY.top - CHIMNEY.cap / 2), CHIMNEY.top - CHIMNEY.cap / 2],
	[CHIMNEY.left, CHIMNEY.top - CHIMNEY.cap / 2],
];

export const FairyChimneyProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const clock = useProcessClock('fairychimney', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const {time, amount, now} = clock;

	const deposit = smooth(amount('puskurme'));
	const lava = smooth(amount('sapka'));
	const erode = smooth(amount('asinma'));
	const chimney = smooth(amount('baca'));
	const carve = smooth(amount('oyma'));
	const columns = chimneyColumns(erode, chimney);
	// While the ash settles the plateau grows from the ground up.
	const surface = lerp(CHIMNEY.ground, CHIMNEY.top, deposit);
	const lavaFront = lerp(CHIMNEY.left, CHIMNEY.right, lava);
	// The blanket's top: it settles with the plateau and wears down with it.
	const apron = lerp(surface, CHIMNEY.ground - 40, erode);
	const hatless = columns[CHIMNEY.hatless];
	const fall = clamp01((chimney - 0.3) / 0.45);
	const topAt = (x: number) => {
		const column = columns.find((item) => Math.abs(item.x - x) <= Math.max(item.topHalf, 1));
		return column ? column.top - (column.hat > 0 && erode + chimney > 0 ? CHIMNEY.cap : 0) : CHIMNEY.ground;
	};

	return (
		<ProcessFrame process="fairychimney" clock={clock} camera={camera} width={width} height={height} backdrop="#F3E6D3">
			<Sky colourTop="#CFE3F2" colourBottom="#FBF2E4" />
			<defs>
				<clipPath id={`fc${id}`}>
					{columns.map((column, index) => (
						<path key={index} d={pathOf(erode + chimney > 0 ? columnOutline(column) : [[CHIMNEY.left, surface], [CHIMNEY.right, surface], [CHIMNEY.right, CHIMNEY.ground], [CHIMNEY.left, CHIMNEY.ground]], true)} />
					))}
				</clipPath>
			</defs>
			{/* The volcano, its ash cloud while it erupts and its lava flow down to the tuff. */}
			<path d={pathOf([[VOLCANO.left, CHIMNEY.ground], [VOLCANO.peak[0] - VOLCANO.crater, VOLCANO.peak[1]], [VOLCANO.peak[0] + VOLCANO.crater, VOLCANO.peak[1]], [VOLCANO.right, CHIMNEY.ground]], true)} fill={COLOURS.cone} stroke={COLOURS.coneDark} strokeWidth={2} />
			<path d={pathOf([[VOLCANO.peak[0] - VOLCANO.crater, VOLCANO.peak[1]], [VOLCANO.peak[0], VOLCANO.peak[1] + 18], [VOLCANO.peak[0] + VOLCANO.crater, VOLCANO.peak[1]]])} fill="none" stroke={COLOURS.coneDark} strokeWidth={3} />
			<g opacity={now('puskurme')}>
				{Array.from({length: 9}, (_, index) => {
					const phase = (time * 0.18 + index / 9) % 1;
					return <ellipse key={index} cx={VOLCANO.peak[0] + 40 + phase * 620} cy={VOLCANO.peak[1] - 40 - 70 * Math.sin(phase * Math.PI) + 30 * noise(index)} rx={50 + 60 * phase} ry={26 + 18 * phase} fill={COLOURS.ash} opacity={0.75 * (1 - phase * 0.6)} />;
				})}
				{Array.from({length: 60}, (_, index) => {
					const x = CHIMNEY.left + noise(index * 2.3) * (CHIMNEY.right - CHIMNEY.left);
					const fallShare = (time * 0.7 + noise(index * 5.1)) % 1;
					return <circle key={index} cx={x + 20 * fallShare} cy={lerp(170, surface - 4, fallShare)} r={2.4} fill={COLOURS.ash} opacity={0.8} />;
				})}
			</g>
			<g opacity={clamp01(now('sapka') * 1.2 + (lava > 0 && lava < 1 ? 0.4 : 0))}>
				<path d={pathOf(LAVA_PATH)} fill="none" stroke={COLOURS.lava} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
			</g>
			<path d={pathOf([[SCENE.left - 100, CHIMNEY.ground], [SCENE.right + 100, CHIMNEY.ground], [SCENE.right + 100, 760], [SCENE.left - 100, 760]], true)} fill={COLOURS.ground} />
			{/* The tuff blanket between the volcano and the plateau; the rain wears it down with the plateau. */}
			{deposit > 0 ? (
				<path
					d={pathOf([[flankX(apron), apron], [CHIMNEY.left, apron], [CHIMNEY.left, CHIMNEY.ground], [VOLCANO.right, CHIMNEY.ground]], true)}
					fill={COLOURS.tuff}
					stroke={COLOURS.tuffDark}
					strokeWidth={2}
				/>
			) : null}
			{lava > 0 && erode <= 0 ? <path d={pathOf([[flankX(apron - CHIMNEY.cap), apron - CHIMNEY.cap], [CHIMNEY.left + 2, apron - CHIMNEY.cap], [CHIMNEY.left + 2, apron], [flankX(apron), apron]], true)} fill={lava < 1 ? COLOURS.lava : COLOURS.basalt} /> : null}
			{/* The tuff: columns cut from the plateau, its ash layers running straight through them. */}
			<g clipPath={`url(#fc${id})`}>
				<rect x={CHIMNEY.left - HALF} y={SCENE.top} width={CHIMNEY.right - CHIMNEY.left + 2 * HALF} height={CHIMNEY.ground - SCENE.top} fill={COLOURS.tuff} />
				{Array.from({length: 9}, (_, index) => {
					const y = CHIMNEY.ground - 14 - index * 26;
					return <path key={index} d={`M${CHIMNEY.left - HALF} ${y} q200 ${-4 + 8 * noise(index)} 420 0 t420 0 t420 0`} fill="none" stroke={COLOURS.layer} strokeWidth={index % 3 === 0 ? 5 : 2.5} opacity={y > surface ? 0.9 : 0} />;
				})}
			</g>
			{columns.map((column, index) =>
				erode + chimney > 0 ? <path key={index} d={pathOf(columnOutline(column), true)} fill="none" stroke={COLOURS.tuffDark} strokeWidth={2} /> : null,
			)}
			{/* The hard cap: one sheet of basalt while the lava spreads, then a hat on each column. */}
			{erode + chimney <= 0 && lava > 0 ? (
				<path d={pathOf([[CHIMNEY.left, CHIMNEY.top - CHIMNEY.cap], [lavaFront, CHIMNEY.top - CHIMNEY.cap], [lavaFront + 8, CHIMNEY.top - CHIMNEY.cap / 2], [lavaFront, CHIMNEY.top], [CHIMNEY.left, CHIMNEY.top]], true)} fill={lava < 1 ? COLOURS.lava : COLOURS.basalt} opacity={1} />
			) : null}
			{erode + chimney <= 0 && lava > 0 && lava < 1 ? (
				<path d={pathOf([[CHIMNEY.left, CHIMNEY.top - CHIMNEY.cap], [Math.max(CHIMNEY.left, lavaFront - 220), CHIMNEY.top - CHIMNEY.cap], [Math.max(CHIMNEY.left, lavaFront - 220), CHIMNEY.top], [CHIMNEY.left, CHIMNEY.top]], true)} fill={COLOURS.basalt} />
			) : null}
			{erode + chimney > 0
				? columns.map((column, index) =>
						column.hat > 0 ? (
							<path
								key={index}
								d={`M${column.x - column.hat} ${column.top} Q${column.x - column.hat - 4} ${column.top - CHIMNEY.cap * 0.9} ${column.x} ${column.top - CHIMNEY.cap * 1.05} Q${column.x + column.hat + 4} ${column.top - CHIMNEY.cap * 0.9} ${column.x + column.hat} ${column.top} Z`}
								fill={COLOURS.basalt}
								stroke={COLOURS.basaltEdge}
								strokeWidth={2}
							/>
						) : null,
					)
				: null}
			{/* The hat that fell: it tips off and lies at the chimney's foot. */}
			{chimney > 0.35 ? (
				<g transform={`translate(${lerp(hatless.x, hatless.x + 70, fall)} ${lerp(CHIMNEY.top - 4, CHIMNEY.ground - 10, fall)}) rotate(${lerp(0, 38, fall)})`}>
					<ellipse cx={0} cy={0} rx={30} ry={13} fill={COLOURS.basalt} stroke={COLOURS.basaltEdge} strokeWidth={2} />
				</g>
			) : null}
			{/* Rain and floods at work while the gullies cut down. */}
			<g>
				{[0.3, 0.6].map((share, index) => (
					<Cloud key={index} x={lerp(CHIMNEY.left + 120, CHIMNEY.right - 120, share)} y={150 + 14 * index} scale={0.9} dark={0.55} opacity={Math.max(now('asinma'), now('baca') * 0.7)} />
				))}
				<Rain x0={CHIMNEY.left - 40} x1={CHIMNEY.right + 40} top={170} ground={topAt} time={time} amount={Math.max(now('asinma'), now('baca') * 0.6)} count={80} />
				{columns.slice(0, -1).map((column, index) => {
					const gap = (column.x + columns[index + 1].x) / 2;
					const flow = (time * 0.9 + index * 0.3) % 1;
					return erode > 0.6 ? <ellipse key={index} cx={gap} cy={CHIMNEY.ground - 3} rx={14 + 10 * flow} ry={3} fill="#5E93C4" opacity={0.7 * Math.max(now('asinma'), now('baca') * 0.6) * (1 - flow * 0.5)} /> : null;
				})}
			</g>
			{/* Homes, a church and dovecotes carved into the soft tuff. */}
			<g opacity={carve}>
				{[1, 2, 3].map((index) => {
					const column = columns[index];
					const y = column.top + 60;
					return (
						<g key={index}>
							<path d={`M${column.x - 9} ${y + 26} v-16 a9 9 0 0 1 18 0 v16 Z`} fill={COLOURS.opening} />
							<rect x={column.x - 5} y={y + 64} width={10} height={14} rx={3} fill={COLOURS.opening} />
							{[-1, 1].map((side) => (
								<circle key={side} cx={column.x + side * 14} cy={y + 104} r={4} fill={COLOURS.opening} />
							))}
						</g>
					);
				})}
				<path d={`M${columns[0].x - 16} ${CHIMNEY.ground} v-40 a16 16 0 0 1 32 0 v40 Z`} fill={COLOURS.opening} />
			</g>
			<ProcessLabel id="volkan" at={[VOLCANO.peak[0], VOLCANO.peak[1] + 6]} to={[VOLCANO.peak[0] - 60, 130]} text="Erciyes, Hasandağı" show={Math.max(now('puskurme'), now('sapka'))} />
			<ProcessLabel id="tuf" at={[CHIMNEY.left + 120, lerp(CHIMNEY.ground - 20, CHIMNEY.top + 80, deposit)]} to={[CHIMNEY.left + 180, lerp(CHIMNEY.ground - 60, 262, deposit)]} text="Yumuşak tüf katmanları" show={Math.max(now('puskurme'), now('sapka')) * clamp01(deposit * 3)} />
			<ProcessLabel id="bazalt" at={[Math.max(CHIMNEY.left + 40, lavaFront - 300), CHIMNEY.top - CHIMNEY.cap / 2]} to={[Math.max(CHIMNEY.left + 380, lavaFront - 120), 200]} text="Sert bazalt" show={now('sapka') * clamp01(lava * 4)} />
			<ProcessLabel id="asinma" at={[(columns[2].x + columns[3].x) / 2, CHIMNEY.top + erode * 160]} to={[1050, 236]} text="Sel tüfü oyar" show={now('asinma')} />
			<ProcessLabel id="baca" at={[columns[1].x, columns[1].top - CHIMNEY.cap]} to={[columns[1].x - 40, 220]} text="Şapkalı peri bacası" show={now('baca')} />
			<ProcessLabel id="sapkasiz" at={[hatless.x, hatless.top + 6]} to={[hatless.x + 60, 250]} text="Şapkasız baca aşınır" show={now('baca') * clamp01(fall * 2)} size={22} />
			<ProcessLabel id="oyma" at={[columns[2].x, columns[2].top + 78]} to={[columns[2].x + 90, 300]} text="Oyma ev ve kilise" show={now('oyma')} />
		</ProcessFrame>
	);
};
