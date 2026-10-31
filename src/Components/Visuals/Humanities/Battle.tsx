import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {StageStrip} from '../Geography/ProcessStage';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {BATTLE_GRID} from './HumanitiesSchema';
import {type CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {pathOf, Tag, usePartLook, World} from '../VisualWorld';

type Battle = Extract<CourseVisual, {kind: 'battle'}>;
type Unit = Battle['units'][number];
type Ground = Battle['ground'][number];
type Point = readonly [number, number];

/**
 * A battle as a documentary tells it (VisualSchema: battle; owner, 29 Oct 2026: "savaşları savaş düzeninde, güçlü bir
 * animasyonla anlat"). The field is seen from above at an angle: far ground is narrower and hazier, so the armies stand
 * on land rather than on a chart. Each unit is a body of soldiers (foot soldiers with spears and shields, horsemen whose
 * horses gallop, archers, guns with their crews, galleys under sail) under a waving standard. Units march along their
 * arrows and each rank follows the one before; horsemen raise dust and ships leave a wake; where the sides meet there
 * is smoke and sparks; guns flash and their balls arc to the enemy, archers loose volleys; a broken unit scatters and
 * flees, its standard falls, a ship heels over and sinks, and a mine throws up a column of water. The camera closes in
 * on each stage's action and pulls back for the opening and the outcome. Everything is a function of the frame: no
 * randomness, the same picture on every render.
 */

// ---------------------------------------------------------------- the field and its projection

/** A wide scene, as a film frame: the stage strip, the sides, the field and the note. */
const WORLD = {width: 1600, height: 700};
const FIELD = {left: 40, right: 1560, top: 106, bottom: 640};
const NOTE_Y = 674;
/** Soldiers, ground marks and standards are drawn this much larger than their base size on the wide scene. */
const SIZE = 1.5;
/** How much narrower the far edge is than the near one, as seen from a raised viewpoint. */
const FAR_WIDTH = 0.66;

/** How large things are at a depth: far (grid y 0) smaller, near (grid y 60) full size. */
const depthScale = (gridY: number) => FAR_WIDTH + (1 - FAR_WIDTH) * clamp01(gridY / BATTLE_GRID.height);

/** Grid to world: far rows compressed and narrower, as a plain looks from a hill. */
export const project = ([x, y]: Point): [number, number] => {
	const depth = clamp01(y / BATTLE_GRID.height);
	const halfWidth = (FIELD.right - FIELD.left) / 2;
	const screenX = (FIELD.left + FIELD.right) / 2 + ((x - BATTLE_GRID.width / 2) / (BATTLE_GRID.width / 2)) * halfWidth * depthScale(y);
	const screenY = FIELD.top + (FIELD.bottom - FIELD.top) * depth * (0.8 + 0.2 * depth);
	return [screenX, screenY];
};

// ---------------------------------------------------------------- what happens, stage by stage

const along = (points: readonly Point[], share: number): [number, number] => {
	if (points.length === 1) return [points[0][0], points[0][1]];
	const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
	const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
	let rest = clamp01(share) * total;
	for (let index = 0; index < lengths.length; index++) {
		if (rest <= lengths[index] || index === lengths.length - 1) {
			const t = lengths[index] ? rest / lengths[index] : 1;
			return [lerp(points[index][0], points[index + 1][0], t), lerp(points[index][1], points[index + 1][1], t)];
		}
		rest -= lengths[index];
	}
	return [points.at(-1)![0], points.at(-1)![1]];
};

const pathLength = (points: readonly Point[]) => points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point[0] - points[index][0], point[1] - points[index][1]), 0);

type BattleState = {
	/** Where each unit starts the stage and the way it goes (just its place when it does not move). */
	paths: Point[][];
	/** Each unit's side at the end of the stage (a unit that changes sides changes colour during it). */
	sides: (0 | 1)[];
	sidesBefore: (0 | 1)[];
	routed: boolean[];
	/** Units that break in this very stage: they scatter now; units broken earlier stay scattered. */
	breaking: boolean[];
	/** Ships set on fire (in this stage or before): they burn as they break. */
	burning: boolean[];
	/** Pairs of opposing units that meet at the end of the stage. */
	clashes: [number, number][];
	/** Shooters and the unit each aims at. */
	shots: {from: number; to: number}[];
};

/** Opposing units closer than this (grid units) at the end of a stage are in battle. */
const CLASH_DISTANCE = 15;

/** Every stage's movements, sides, clashes and shots, worked out from the opening order. */
export const battleStates = (battle: Battle): BattleState[] => {
	let positions: Point[] = battle.units.map((unit) => unit.at);
	let sides: (0 | 1)[] = battle.units.map((unit) => unit.side);
	let routed = battle.units.map(() => false);
	let burning = battle.units.map(() => false);
	return battle.stages.map((stage) => {
		// A burned ship breaks like a routed unit.
		const broken = [...stage.routed, ...stage.burned];
		burning = burning.map((value, index) => value || stage.burned.includes(index + 1));
		const paths: Point[][] = positions.map((position) => [position]);
		for (const move of stage.moves) paths[move.unit - 1] = [positions[move.unit - 1], ...move.via, move.to];
		const sidesBefore = sides;
		sides = sides.map((side, index) => (stage.defect.includes(index + 1) ? ((1 - side) as 0 | 1) : side));
		const breaking = routed.map((value, index) => !value && broken.includes(index + 1));
		const routedBefore = routed;
		routed = routed.map((value, index) => value || broken.includes(index + 1));
		positions = paths.map((path) => path.at(-1)!);
		const clashes: [number, number][] = [];
		positions.forEach((a, i) =>
			positions.forEach((b, j) => {
				if (j > i && sides[i] !== sides[j] && !routed[i] && !routed[j] && Math.hypot(a[0] - b[0], a[1] - b[1]) < CLASH_DISTANCE) clashes.push([i, j]);
			}),
		);
		const shots = stage.fire.flatMap((unit) => {
			const from = unit - 1;
			const targets = positions
				.map((position, index) => ({index, distance: Math.hypot(position[0] - positions[from][0], position[1] - positions[from][1])}))
				.filter(({index}) => sides[index] !== sides[from] && !routedBefore[index]);
			const nearest = targets.sort((a, b) => a.distance - b.distance)[0];
			return nearest ? [{from, to: nearest.index}] : [];
		});
		return {paths, sides, sidesBefore, routed: [...routed], breaking, burning: [...burning], clashes, shots};
	});
};

/** For tests: a unit's place a share of the way through a stage. */
export const unitPlace = (battle: Battle, stage: number, unit: number, share: number): [number, number] => along(battleStates(battle)[stage].paths[unit - 1], share);

// ---------------------------------------------------------------- the camera

type Camera = {x: number; y: number; zoom: number};
const WIDE: Camera = {x: (FIELD.left + FIELD.right) / 2, y: (FIELD.top + FIELD.bottom) / 2, zoom: 1};
const MAX_ZOOM = 1.5;

/** Where the camera looks in a stage: the units that move, meet, shoot or break, with room around them. */
export const stageCamera = (state: BattleState, index: number, last: number): Camera => {
	if (index === 0 || index === last) return WIDE;
	const points: Point[] = [];
	state.paths.forEach((path) => {
		if (path.length > 1) points.push(...path);
	});
	state.clashes.forEach(([a, b]) => points.push(state.paths[a].at(-1)!, state.paths[b].at(-1)!));
	state.shots.forEach(({from, to}) => points.push(state.paths[from].at(-1)!, state.paths[to].at(-1)!));
	state.paths.forEach((path, unit) => {
		if (state.breaking[unit]) points.push(path.at(-1)!);
	});
	if (points.length === 0) return WIDE;
	const screen = points.map(project);
	const xs = screen.map(([x]) => x);
	const ys = screen.map(([, y]) => y);
	// Room for the standards above and the names below each unit.
	const box = {left: Math.min(...xs) - 200, right: Math.max(...xs) + 200, top: Math.min(...ys) - 140, bottom: Math.max(...ys) + 150};
	const zoom = Math.max(1, Math.min(MAX_ZOOM, (FIELD.right - FIELD.left) / (box.right - box.left), (FIELD.bottom - FIELD.top) / (box.bottom - box.top)));
	const halfW = (FIELD.right - FIELD.left) / 2 / zoom;
	const halfH = (FIELD.bottom - FIELD.top) / 2 / zoom;
	const x = Math.min(FIELD.right - halfW, Math.max(FIELD.left + halfW, (box.left + box.right) / 2));
	const y = Math.min(FIELD.bottom - halfH, Math.max(FIELD.top + halfH, (box.top + box.bottom) / 2));
	return {x, y, zoom};
};

/**
 * How much of a name at world (x, y), `half` wide on either side, the camera shows: 1 well inside the field, fading
 * to 0 as it nears an edge. A name is never cut in half by the frame; it goes out of view instead.
 */
const inView = (x: number, y: number, half: number, camera: Camera): number => {
	const cx = (FIELD.left + FIELD.right) / 2;
	const cy = (FIELD.top + FIELD.bottom) / 2;
	const [sx, sy] = [cx + camera.zoom * (x - camera.x), cy + camera.zoom * (y - camera.y)];
	const room = Math.min(sx - half * camera.zoom - FIELD.left, FIELD.right - (sx + half * camera.zoom), sy - 20 * camera.zoom - FIELD.top, FIELD.bottom - (sy + 16 * camera.zoom));
	return clamp01(room / 24);
};

/** Where a ground feature's name goes: inside its water for a sea, half way along a river, by its first mark otherwise. */
const nameAnchor = (ground: Ground): [number, number] => {
	if (ground.nameAt) return project(ground.nameAt);
	if (ground.type === 'sea') {
		const [x, y] = ground.points.reduce(([sx, sy], [px, py]) => [sx + px, sy + py], [0, 0]).map((sum) => sum / ground.points.length);
		return project([x, y]);
	}
	if (ground.type === 'river' || ground.type === 'road') {
		const [x, y] = project(along(ground.points, 0.5));
		return [x, y - 20];
	}
	const [x, y] = project(ground.points[0]);
	const below = ground.type === 'hill' || ground.type === 'fortress' || ground.type === 'city' || ground.type === 'camp';
	return [x, y + (below ? 30 : -30)];
};

const cameraTransform = (camera: Camera) => {
	const cx = (FIELD.left + FIELD.right) / 2;
	const cy = (FIELD.top + FIELD.bottom) / 2;
	return `translate(${cx} ${cy}) scale(${camera.zoom}) translate(${-camera.x} ${-camera.y})`;
};

// ---------------------------------------------------------------- the ground

const COLOURS = {
	fieldNear: '#D6E0BE',
	fieldFar: '#EDF0E3',
	grass: '#93A86E',
	water: '#78AEDB',
	waterDeep: '#3D78B0',
	foam: '#FFFFFF',
	hill: '#C7B083',
	hillLight: '#DECDA4',
	hillLine: '#8A7048',
	forest: '#4F7F3E',
	forestDark: '#3B6330',
	stone: '#D6CCBA',
	stoneDark: '#7A6C58',
	roof: '#A65E3B',
	road: '#A88B5E',
	dust: '#C9B48E',
	smoke: '#8F8A86',
	spark: '#F2C14E',
	flash: '#FFD66B',
	metal: '#3B3F45',
	skin: '#E8C39E',
	horse: '#7A5536',
};

/** Smooth path through points (Catmull-Rom as cubic Béziers): rivers, coasts and arrows curve instead of breaking. */
const curveThrough = (points: readonly [number, number][], closed = false): string => {
	if (points.length < 3) return pathOf(points, closed);
	const ring = closed ? [points.at(-1)!, ...points, points[0], points[1]] : [points[0], ...points, points.at(-1)!];
	let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
	const segments = closed ? points.length : points.length - 1;
	for (let index = 0; index < segments; index++) {
		const [p0, p1, p2, p3] = [ring[index], ring[index + 1], ring[index + 2], ring[index + 3]];
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return closed ? `${d} Z` : d;
};

/**
 * A coast drawn round where it runs over the land and straight along the field's edges: corners are cut (Chaikin,
 * three passes) only at points inside the field, so a sea that reaches the edge fills it to the corner. A closed
 * curve through every point had rounded a bay off the corners into a lake.
 */
const smoothCoast = (points: readonly Point[]): Point[] => {
	const onEdge = ([x, y]: Point) => x <= 0 || y <= 0 || x >= BATTLE_GRID.width || y >= BATTLE_GRID.height;
	let ring: Point[] = [...points];
	for (let pass = 0; pass < 3; pass++) {
		ring = ring.flatMap((point, index) => {
			if (onEdge(point)) return [point];
			const before = ring[(index - 1 + ring.length) % ring.length];
			const after = ring[(index + 1) % ring.length];
			return [
				[lerp(point[0], before[0], 0.25), lerp(point[1], before[1], 0.25)] as Point,
				[lerp(point[0], after[0], 0.25), lerp(point[1], after[1], 0.25)] as Point,
			];
		});
	}
	return ring;
};

/** The plain: a trapezoid, hazier towards the horizon, with tufts of grass scattered over it. */
const Plain: React.FC<{id: string}> = ({id}) => {
	const corners = [project([0, 0]), project([BATTLE_GRID.width, 0]), project([BATTLE_GRID.width, BATTLE_GRID.height]), project([0, BATTLE_GRID.height])];
	return (
		<g>
			<defs>
				<linearGradient id={`plain${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={COLOURS.fieldFar} />
					<stop offset="1" stopColor={COLOURS.fieldNear} />
				</linearGradient>
			</defs>
			<path d={pathOf(corners, true)} fill={`url(#plain${id})`} />
			{Array.from({length: 160}, (_, index) => {
				const gy = noise(index + 500) * BATTLE_GRID.height;
				const [x, y] = project([noise(index) * BATTLE_GRID.width, gy]);
				const size = 5 * SIZE * depthScale(gy);
				return <path key={index} d={`M${x - size} ${y} l${size * 0.5} ${-size} M${x} ${y} v${-size * 1.3} M${x + size} ${y} l${-size * 0.5} ${-size}`} stroke={COLOURS.grass} strokeWidth={1.4} opacity={0.5} />;
			})}
		</g>
	);
};

const GroundShape: React.FC<{ground: Ground; seconds: number; seed: number}> = ({ground, seconds, seed}) => {
	const points = ground.points.map(project);
	switch (ground.type) {
		case 'river': {
			const d = curveThrough(points);
			return (
				<g>
					<path d={d} fill="none" stroke={COLOURS.waterDeep} strokeWidth={20} strokeLinecap="round" />
					<path d={d} fill="none" stroke={COLOURS.water} strokeWidth={13} strokeLinecap="round" />
					{/* The current: light dashes running downstream. */}
					<path d={d} fill="none" stroke={COLOURS.foam} strokeWidth={2} strokeDasharray="10 26" strokeDashoffset={-seconds * 28} opacity={0.75} strokeLinecap="round" />
				</g>
			);
		}
		case 'sea': {
			const d = pathOf(smoothCoast(ground.points).map(project), true);
			const xs = points.map(([x]) => x);
			const ys = points.map(([, y]) => y);
			const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
			const clip = `sea${seed}`;
			return (
				<g>
					<defs>
						<clipPath id={clip}>
							<path d={d} />
						</clipPath>
					</defs>
					<path d={d} fill={COLOURS.water} />
					<g clipPath={`url(#${clip})`} stroke={COLOURS.foam} strokeWidth={2} fill="none" opacity={0.55}>
						{Array.from({length: 12}, (_, row) => {
							const y = top + ((row + 0.5) / 12) * (bottom - top);
							const drift = ((seconds * 18 + row * 37) % 60) - 30;
							return Array.from({length: 6}, (__, column) => {
								const x = left + ((column + (row % 2) * 0.5) / 6) * (right - left) + drift;
								return <path key={`${row}-${column}`} d={`M${x - 14} ${y} q7 -5 14 0 t14 0`} />;
							});
						})}
					</g>
				</g>
			);
		}
		case 'hill':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={`translate(${x} ${y}) scale(${SIZE * depthScale(ground.points[index][1])})`}>
							<ellipse cx={4} cy={6} rx={62} ry={14} fill={COLOURS.hillLine} opacity={0.18} />
							<path d="M-62 4 C-44 -30 -16 -40 0 -40 C18 -40 44 -28 62 4 Z" fill={COLOURS.hill} stroke={COLOURS.hillLine} strokeWidth={2} />
							<path d="M-62 4 C-44 -30 -16 -40 0 -40 L0 4 Z" fill={COLOURS.hillLight} opacity={0.6} />
							<path d="M-40 -6 C-26 -26 -8 -30 4 -30 C16 -30 30 -22 40 -6" fill="none" stroke={COLOURS.hillLine} strokeWidth={1.4} opacity={0.6} />
							<path d="M-18 -22 C-8 -32 8 -32 18 -22" fill="none" stroke={COLOURS.hillLine} strokeWidth={1.2} opacity={0.5} />
						</g>
					))}
				</g>
			);
		case 'forest':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={`translate(${x} ${y}) scale(${SIZE * depthScale(ground.points[index][1])})`}>
							{[
								[-22, 4],
								[-6, -6],
								[10, 2],
								[24, -4],
								[2, 10],
							].map(([dx, dy], tree) => (
								<g key={tree} transform={`translate(${dx} ${dy})`}>
									<rect x={-2} y={-2} width={4} height={10} fill={COLOURS.hillLine} />
									<path d="M0 -26 L13 0 L-13 0 Z" fill={tree % 2 ? COLOURS.forest : COLOURS.forestDark} />
								</g>
							))}
						</g>
					))}
				</g>
			);
		case 'marsh':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index}>
							<ellipse cx={x} cy={y} rx={46} ry={16} fill={COLOURS.water} opacity={0.35} />
							{[-30, -12, 6, 24].map((dx, tuft) => (
								<path key={tuft} d={`M${x + dx} ${y + (tuft % 2) * 6} l-4 -12 M${x + dx} ${y + (tuft % 2) * 6} v-15 M${x + dx} ${y + (tuft % 2) * 6} l4 -12`} stroke={COLOURS.forest} strokeWidth={2.2} strokeLinecap="round" />
							))}
						</g>
					))}
				</g>
			);
		case 'fortress':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={`translate(${x} ${y}) scale(${SIZE * depthScale(ground.points[index][1])})`} stroke={COLOURS.stoneDark} strokeWidth={2}>
							<path d="M-34 0 v-26 h68 v26 Z" fill={COLOURS.stone} />
							<path d="M-34 -26 l10 -10 h68 l-10 10 Z" fill="#E6DECF" />
							{[-34, 34].map((dx) => (
								<g key={dx}>
									<rect x={dx - 9} y={-40} width={18} height={40} fill={COLOURS.stone} />
									<path d={`M${dx - 11} -40 l11 -12 l11 12 Z`} fill={COLOURS.roof} />
								</g>
							))}
							{[-20, -8, 4, 16].map((dx) => (
								<rect key={dx} x={dx} y={-31} width={6} height={5} fill={COLOURS.stone} />
							))}
							<path d="M-6 0 v-12 a6 6 0 0 1 12 0 v12" fill={COLOURS.stoneDark} />
						</g>
					))}
				</g>
			);
		case 'city':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={`translate(${x} ${y}) scale(${SIZE * depthScale(ground.points[index][1])})`} stroke={COLOURS.stoneDark} strokeWidth={1.6}>
							<rect x={-13} y={-40} width={6} height={28} fill={COLOURS.stone} />
							{[
								[-28, 4, 1],
								[-10, -6, 1.2],
								[10, 2, 1],
								[26, -4, 0.9],
								[0, 10, 0.9],
							].map(([dx, dy, size], house) => (
								<g key={house} transform={`translate(${dx} ${dy}) scale(${size})`}>
									<rect x={-9} y={-12} width={18} height={14} fill={COLOURS.stone} />
									<path d="M-11 -12 L0 -22 L11 -12 Z" fill={COLOURS.roof} />
								</g>
							))}
						</g>
					))}
				</g>
			);
		case 'camp':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={`translate(${x} ${y}) scale(${SIZE * depthScale(ground.points[index][1])})`} fill="#F3EBDD" stroke={COLOURS.stoneDark} strokeWidth={1.6}>
							{[-22, 0, 22].map((dx) => (
								<path key={dx} d={`M${dx - 12} 6 L${dx} -16 L${dx + 12} 6 Z`} />
							))}
						</g>
					))}
				</g>
			);
		case 'wall': {
			const d = pathOf(points);
			return (
				<g>
					<path d={d} fill="none" stroke={COLOURS.stoneDark} strokeWidth={14} strokeLinecap="square" />
					<path d={d} fill="none" stroke={COLOURS.stone} strokeWidth={8} strokeLinecap="square" />
					<path d={d} fill="none" stroke={COLOURS.stoneDark} strokeWidth={3} strokeDasharray="6 6" />
					{points.map(([x, y], index) => (
						<rect key={index} x={x - 8} y={y - 10} width={16} height={20} fill={COLOURS.stone} stroke={COLOURS.stoneDark} strokeWidth={2} />
					))}
				</g>
			);
		}
		case 'road':
			return <path d={curveThrough(points)} fill="none" stroke={COLOURS.road} strokeWidth={6} strokeDasharray="16 10" strokeLinecap="round" opacity={0.85} />;
		case 'mines':
			// A sea mine as atlases draw it: a dark ball with horns, rocking on the swell.
			return (
				<g fill={COLOURS.metal} stroke={COLOURS.metal} strokeWidth={2.5} strokeLinecap="round">
					{points.map(([x, y], index) => (
						<g key={index} transform={`translate(${x} ${y + Math.sin(seconds * 2 + index) * 1.5})`}>
							<circle r={8} />
							{[0, 1, 2, 3, 4, 5].map((horn) => {
								const angle = (horn * Math.PI) / 3;
								return <line key={horn} x1={8 * Math.cos(angle)} y1={8 * Math.sin(angle)} x2={13 * Math.cos(angle)} y2={13 * Math.sin(angle)} />;
							})}
						</g>
					))}
				</g>
			);
	}
};

// ---------------------------------------------------------------- the soldiers

/** Files and ranks of a unit's body by its strength. */
const FORMATION: Record<1 | 2 | 3, [number, number]> = {1: [3, 2], 2: [4, 3], 3: [6, 3]};
/** Grid units between soldiers, across the front and from front to back. */
const SPACING = {across: 1.7, back: 1.6};

/** A soldier, a horseman, an archer, a gun with its gunner or a galley, at the origin facing right, about 15 px tall. */
const Figure: React.FC<{type: Unit['type']; colour: string; seconds: number; seed: number; moving: boolean; facing: number}> = ({type, colour, seconds, seed, moving, facing}) => {
	const stride = moving ? Math.sin(seconds * 11 + seed * 2.3) : 0;
	const bob = moving ? Math.abs(Math.sin(seconds * 9 + seed)) * 1.6 : 0;
	const flip = facing < 0 ? -1 : 1;
	switch (type) {
		case 'cavalry':
		case 'command':
			return (
				<g transform={`translate(0 ${-bob}) scale(${flip} 1)`}>
					{/* The legs gallop while the unit moves. */}
					<path d={`M-6 3 l${-2 - 3 * stride} 6 M-3 3 l${-1 + 3 * stride} 6 M4 3 l${1 + 3 * stride} 6 M7 3 l${2 - 3 * stride} 6`} stroke={COLOURS.horse} strokeWidth={1.8} strokeLinecap="round" />
					<ellipse cx={0} cy={0} rx={9} ry={4.6} fill={COLOURS.horse} />
					<path d="M7 -1 l5 -6 l3 1 l-3 7 Z" fill={COLOURS.horse} />
					<rect x={-3} y={-11} width={6} height={9} rx={2} fill={colour} />
					<circle cx={0} cy={-13.5} r={2.6} fill={COLOURS.skin} />
					<path d={type === 'command' ? 'M-1 -16 v-14' : 'M2 -10 l12 -9'} stroke={COLOURS.metal} strokeWidth={1.4} strokeLinecap="round" />
				</g>
			);
		case 'archer':
			return (
				<g transform={`translate(0 ${-bob}) scale(${flip} 1)`}>
					<path d={`M-2 2 l${-2 - 2 * stride} 8 M2 2 l${2 + 2 * stride} 8`} stroke={COLOURS.metal} strokeWidth={1.8} strokeLinecap="round" />
					<rect x={-3.5} y={-8} width={7} height={11} rx={2} fill={colour} />
					<circle cx={0} cy={-10.5} r={2.8} fill={COLOURS.skin} />
					<path d="M6 -14 q5 7 0 14" fill="none" stroke={COLOURS.horse} strokeWidth={1.6} />
				</g>
			);
		case 'artillery':
			return (
				<g transform={`scale(${flip} 1)`}>
					<rect x={-4} y={-6} width={22} height={6} rx={3} fill={COLOURS.metal} transform="rotate(-10)" />
					<circle cx={-2} cy={2} r={5.5} fill="none" stroke={COLOURS.horse} strokeWidth={2.2} />
					<rect x={-12} y={-8} width={5} height={9} rx={1.5} fill={colour} />
					<circle cx={-9.5} cy={-10} r={2.4} fill={COLOURS.skin} />
				</g>
			);
		case 'ship':
			return (
				<g transform={`scale(${flip} 1)`}>
					<path d="M-26 0 h52 l-8 10 h-36 Z" fill={COLOURS.horse} stroke={COLOURS.metal} strokeWidth={1.2} />
					{[-16, -8, 0, 8, 16].map((dx) => (
						<line key={dx} x1={dx} y1={8} x2={dx - 4 + 3 * Math.sin(seconds * 4 + dx)} y2={15} stroke={COLOURS.metal} strokeWidth={1.2} />
					))}
					<line x1={0} y1={0} x2={0} y2={-34} stroke={COLOURS.metal} strokeWidth={2} />
					<path d={`M0 -32 q${14 + 2 * Math.sin(seconds * 2 + seed)} 12 0 26 Z`} fill={colour} stroke={COLOURS.metal} strokeWidth={1} />
					<path d={`M-1 -28 q${-10 + Math.sin(seconds * 2 + seed)} 9 0 18 Z`} fill={withAlpha(colour, 0.8)} stroke={COLOURS.metal} strokeWidth={1} />
				</g>
			);
		case 'infantry':
		default:
			return (
				<g transform={`translate(0 ${-bob}) scale(${flip} 1)`}>
					<path d={`M-2 2 l${-2 - 2 * stride} 8 M2 2 l${2 + 2 * stride} 8`} stroke={COLOURS.metal} strokeWidth={1.8} strokeLinecap="round" />
					<rect x={-3.5} y={-8} width={7} height={11} rx={2} fill={colour} />
					<circle cx={0} cy={-10.5} r={2.8} fill={COLOURS.skin} />
					<line x1={5} y1={6} x2={5} y2={-20} stroke={COLOURS.metal} strokeWidth={1.4} />
					<path d="M5 -20 l-2 4 h4 Z" fill={COLOURS.metal} />
					<ellipse cx={-4} cy={-2} rx={2.6} ry={4.5} fill={withAlpha(colour, 0.85)} stroke={COLOURS.metal} strokeWidth={0.8} />
				</g>
			);
	}
};

type Placed = {x: number; y: number; scale: number; key: string; index: number; node: React.ReactNode};

const shape = (unit: Unit): [number, number] => (unit.type === 'ship' ? [unit.strength, 1] : unit.type === 'artillery' ? [unit.strength + 1, 1] : unit.type === 'command' ? [1, 1] : FORMATION[unit.strength as 1 | 2 | 3]);

/** A unit's soldiers placed on the field for this frame, each with its depth so the far ones are drawn first. */
const unitBody = (battle: Battle, state: BattleState, index: number, move: number, seconds: number, colour: string, enemyAt: Point | undefined): Placed[] => {
	const unit = battle.units[index];
	const path = state.paths[index];
	const length = pathLength(path);
	const moving = length > 0.5 && move > 0.02 && move < 0.98;
	const [files, ranks] = shape(unit);
	const end = path.at(-1)!;
	const ahead = along(path, Math.min(1, move + 0.02));
	const here = along(path, move);
	let heading = moving ? Math.atan2(ahead[1] - here[1], ahead[0] - here[0]) : enemyAt ? Math.atan2(enemyAt[1] - end[1], enemyAt[0] - end[0]) : unit.side === 0 ? -Math.PI / 2 : Math.PI / 2;
	if (!Number.isFinite(heading)) heading = 0;
	const [hx, hy] = [Math.cos(heading), Math.sin(heading)];
	const breakShare = state.breaking[index] ? clamp01((move - 0.35) / 0.65) : state.routed[index] ? 1 : 0;
	// A burning ship stays at anchor: it does not scatter, it heels a little and burns on.
	const burning = state.burning[index];
	const spacing = unit.type === 'ship' ? 6 : unit.type === 'artillery' ? 2.6 : SPACING.across;
	const placed: Placed[] = [];
	for (let rank = 0; rank < ranks; rank++) {
		for (let file = 0; file < files; file++) {
			const seed = index * 31 + rank * 7 + file;
			// Each rank follows the one before along the same road.
			const lag = length > 0.5 ? (rank * SPACING.back) / length : 0;
			const [bx, by] = along(path, clamp01(move - lag * 0.6));
			const across = (file - (files - 1) / 2) * spacing;
			const back = rank * SPACING.back;
			let gx = bx - hy * across - hx * back;
			let gy = by + hx * across - hy * back;
			// A broken unit scatters away from the enemy, each soldier on his own line.
			if (breakShare > 0 && !burning) {
				const away = enemyAt ? Math.atan2(gy - enemyAt[1], gx - enemyAt[0]) : heading + Math.PI;
				const spread = away + (noise(seed) - 0.5) * 1.6;
				const run = breakShare * (5 + 9 * noise(seed + 9));
				gx += Math.cos(spread) * run;
				gy += Math.sin(spread) * run;
			}
			gx = Math.min(BATTLE_GRID.width, Math.max(0, gx));
			gy = Math.min(BATTLE_GRID.height, Math.max(0, gy));
			const [x, y] = project([gx, gy]);
			const fallen = unit.type !== 'ship' && breakShare > 0.6 && noise(seed + 3) < 0.25;
			const sink = unit.type === 'ship' ? breakShare : 0;
			placed.push({
				x,
				y,
				scale: SIZE * depthScale(gy) * (unit.type === 'command' ? 1.35 : 1),
				key: `${index}-${rank}-${file}`,
				index,
				node: (
					<g opacity={burning ? 1 - 0.3 * breakShare : 1 - 0.45 * breakShare - 0.45 * sink}>
						<g transform={burning ? `translate(0 ${sink * 5}) rotate(${sink * 9 * (noise(seed + 2) - 0.5)})` : `translate(0 ${sink * 14}) rotate(${fallen ? 80 : sink * 24})`}>
							<Figure type={unit.type} colour={colour} seconds={seconds} seed={seed} moving={moving || (breakShare > 0 && breakShare < 1)} facing={breakShare > 0.2 ? -Math.sign(hx || 1) : Math.sign(hx || 1)} />
							{state.burning[index] ? <ShipFire share={breakShare} seconds={seconds} seed={seed} /> : null}
						</g>
					</g>
				),
			});
		}
	}
	return placed;
};

/** The unit's standard: a pole and a flag in the side's colour, waving; it falls when the unit breaks. */
const Standard: React.FC<{x: number; y: number; scale: number; colour: string; seconds: number; seed: number; fallen: number}> = ({x, y, scale, colour, seconds, seed, fallen}) => {
	const wave = Math.sin(seconds * 5 + seed);
	return (
		<g transform={`translate(${x} ${y}) scale(${scale}) rotate(${fallen * 70})`} opacity={1 - 0.6 * fallen}>
			<line x1={0} y1={0} x2={0} y2={-46} stroke={COLOURS.metal} strokeWidth={2.2} />
			<path d={`M0 -46 C10 ${-50 + 3 * wave} 18 ${-42 - 3 * wave} 28 ${-46 + 2 * wave} L28 ${-30 + 2 * wave} C18 ${-26 - 3 * wave} 10 ${-34 + 3 * wave} 0 -30 Z`} fill={colour} stroke="#FFFFFF" strokeWidth={1.5} />
		</g>
	);
};

// ---------------------------------------------------------------- the effects

/**
 * A burning ship (a stage's `burned`): flames on the deck that catch, climb the mast and flicker, and smoke that
 * rises and spreads, while the ship heels and settles. Drawn in the ship's own coordinates (deck at 0, mast to -34).
 */
const ShipFire: React.FC<{share: number; seconds: number; seed: number}> = ({share, seconds, seed}) => {
	if (share <= 0) return null;
	const caught = clamp01(share * 3);
	const tongues = [-14, -6, 2, 10];
	return (
		<g>
			{[0, 1, 2, 3].map((k) => {
				// Each puff rises from the deck over two seconds, grows and thins out.
				const age = (seconds * 0.5 + k / 4 + noise(seed + k)) % 1;
				return <circle key={`smoke${k}`} cx={-4 + 8 * noise(seed + k * 5) + age * 10} cy={-18 - age * 60} r={5 + age * 13} fill={COLOURS.smoke} opacity={caught * 0.5 * (1 - age)} />;
			})}
			{tongues.map((dx, k) => {
				const height = (10 + 16 * caught * (k % 2 === 0 ? 1 : 0.7)) * (0.8 + 0.2 * Math.sin(seconds * 14 + seed + k * 1.9));
				const sway = 2.5 * Math.sin(seconds * 9 + k * 2.3 + seed);
				return (
					<g key={`flame${k}`} opacity={clamp01(caught * 4 - k * 0.6)}>
						<path d={`M${dx - 5} 1 Q${dx - 5} ${-height * 0.5} ${dx + sway} ${-height} Q${dx + 5} ${-height * 0.5} ${dx + 5} 1 Z`} fill="#E8590C" />
						<path d={`M${dx - 2.5} 1 Q${dx - 2.5} ${-height * 0.3} ${dx + sway * 0.6} ${-height * 0.6} Q${dx + 2.5} ${-height * 0.3} ${dx + 2.5} 1 Z`} fill={COLOURS.flash} />
					</g>
				);
			})}
		</g>
	);
};

/** Dust behind moving soldiers and horsemen, a wake behind ships. */
const Trail: React.FC<{path: Point[]; move: number; ship: boolean}> = ({path, move, ship}) => {
	if (pathLength(path) < 0.5 || move <= 0.02 || move >= 0.99) return null;
	return (
		<g>
			{Array.from({length: 7}, (_, step) => {
				const share = move - 0.03 * (step + 1);
				if (share <= 0) return null;
				const [x, y] = project(along(path, share));
				const size = SIZE * ((ship ? 6 : 10) + step * 3.5);
				return ship ? (
					<path key={step} d={`M${x - size} ${y + 6} q${size} 6 ${size * 2} 0`} fill="none" stroke={COLOURS.foam} strokeWidth={2} opacity={0.7 - step * 0.09} />
				) : (
					<circle key={step} cx={x + Math.sin(step * 2.1) * 6} cy={y + 4 - step * 1.5} r={size} fill={COLOURS.dust} opacity={0.42 - step * 0.055} />
				);
			})}
		</g>
	);
};

/** Where two sides meet: drifting smoke and flashing sparks for as long as the stage lasts. */
const Melee: React.FC<{x: number; y: number; show: number; seconds: number; seed: number}> = ({x, y, show, seconds, seed}) => {
	if (show <= 0) return null;
	return (
		<g opacity={show}>
			{Array.from({length: 7}, (_, puff) => {
				const angle = noise(seed + puff) * Math.PI * 2;
				const drift = (seconds * 0.6 + noise(seed + puff + 20)) % 1;
				return <circle key={puff} cx={x + Math.cos(angle) * 18 + drift * 10} cy={y + Math.sin(angle) * 8 - drift * 26} r={14 + 16 * drift} fill={COLOURS.smoke} opacity={0.32 * (1 - drift)} />;
			})}
			{Array.from({length: 6}, (_, spark) => {
				if (Math.sin(seconds * 13 + spark * 1.7 + seed) <= 0.55) return null;
				const angle = noise(seed + spark + 40) * Math.PI * 2;
				const [sx, sy] = [x + Math.cos(angle) * 14, y + Math.sin(angle) * 9];
				return <path key={spark} d={`M${sx - 5} ${sy} L${sx + 5} ${sy} M${sx} ${sy - 5} L${sx} ${sy + 5}`} stroke={COLOURS.spark} strokeWidth={2.2} strokeLinecap="round" />;
			})}
		</g>
	);
};

/** A gun's shot (the muzzle flash, a ball on an arc, its smoke and the dust where it lands) or an archers' volley, over and over. */
const Volley: React.FC<{from: [number, number]; to: [number, number]; kind: Unit['type']; seconds: number; active: number; seed: number}> = ({from, to, kind, seconds, active, seed}) => {
	if (active <= 0) return null;
	const period = kind === 'archer' ? 1.3 : 1.1;
	const phase = ((seconds + noise(seed) * period) % period) / period;
	const lift = Math.min(120, 30 + Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.35);
	const point = (t: number): [number, number] => [lerp(from[0], to[0], t), lerp(from[1], to[1], t) - Math.sin(Math.PI * t) * lift];
	if (kind === 'archer') {
		return (
			<g opacity={active}>
				{Array.from({length: 6}, (_, arrow) => {
					const t = clamp01(phase * 1.25 - arrow * 0.04);
					if (t <= 0 || t >= 1) return null;
					const [x, y] = point(t);
					const [nx, ny] = point(Math.min(1, t + 0.03));
					const angle = Math.atan2(ny - y, nx - x);
					const offset = (arrow - 2.5) * 6;
					return <line key={arrow} x1={x + offset - Math.cos(angle) * 9} y1={y - Math.sin(angle) * 9} x2={x + offset} y2={y} stroke={COLOURS.metal} strokeWidth={1.6} strokeLinecap="round" />;
				})}
			</g>
		);
	}
	const flight = clamp01((phase - 0.08) / 0.6);
	const [bx, by] = point(flight);
	const impact = clamp01((phase - 0.68) / 0.3);
	return (
		<g opacity={active}>
			{phase < 0.12 ? <circle cx={from[0]} cy={from[1] - 4} r={9 * (1 - phase / 0.12) + 4} fill={COLOURS.flash} /> : null}
			<circle cx={from[0] + 6 + phase * 14} cy={from[1] - 8 - phase * 18} r={8 + phase * 16} fill={COLOURS.smoke} opacity={0.4 * (1 - phase)} />
			{flight > 0 && flight < 1 ? <circle cx={bx} cy={by} r={3.6} fill={COLOURS.metal} /> : null}
			{impact > 0 ? <circle cx={to[0] + (noise(seed + 7) - 0.5) * 30} cy={to[1] + 4} r={6 + impact * 20} fill={COLOURS.dust} opacity={0.5 * (1 - impact)} /> : null}
		</g>
	);
};

/** A mine going off under a ship: a white column of water rising and falling back, and a ring on the sea. */
const Splash: React.FC<{x: number; y: number; share: number}> = ({x, y, share}) => {
	if (share <= 0 || share >= 1) return null;
	const rise = Math.sin(Math.PI * share);
	return (
		<g opacity={rise}>
			<ellipse cx={x} cy={y - 34 * rise} rx={12 + 6 * rise} ry={36 * rise} fill={COLOURS.foam} opacity={0.9} />
			<ellipse cx={x} cy={y + 2} rx={30 * share + 10} ry={7} fill="none" stroke={COLOURS.foam} strokeWidth={3} />
		</g>
	);
};

// ---------------------------------------------------------------- the visual

export const BattleVisual: React.FC<VisualBoxProps & {visual: Battle}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const {stage, progress} = useStageClock(visual.stages.length, {delaySeconds, secondsPerStage: 4.5});
	const states = battleStates(visual);
	const state = states[stage];
	const last = visual.stages.length - 1;
	// Units march in the first part of the stage and then hold, so the narration can be followed on a still field.
	const move = smooth((progress - 0.06) / 0.6);
	const colours: [string, string] = [palette.lesson, palette.ink];
	const note = usePartLook(`s${stage + 1}`, 1);
	// One look per unit; the number of units never changes for a visual, so the hooks are called in the same order.
	const looks = visual.units.map((_, index) => usePartLook(`u${index + 1}`, 1));
	const current = visual.stages[stage];
	const ends = state.paths.map((path) => path.at(-1)!);

	// The camera eases from the last stage's view to this one's.
	const previous = stage > 0 ? stageCamera(states[stage - 1], stage - 1, last) : WIDE;
	const target = stageCamera(state, stage, last);
	const ease = smooth(progress / 0.22);
	const camera = {x: lerp(previous.x, target.x, ease), y: lerp(previous.y, target.y, ease), zoom: lerp(previous.zoom, target.zoom, ease)};

	/** A unit's nearest enemy at the end of the stage: whom it faces, aims at and runs from. */
	const enemyOf = (index: number): Point | undefined =>
		ends
			.map((point, other) => ({point, other}))
			.filter(({other}) => state.sides[other] !== state.sides[index] && !(state.routed[other] && !state.breaking[other]))
			.sort((a, b) => Math.hypot(a.point[0] - ends[index][0], a.point[1] - ends[index][1]) - Math.hypot(b.point[0] - ends[index][0], b.point[1] - ends[index][1]))[0]?.point;
	const colourOf = (index: number) => colours[state.sides[index] !== state.sidesBefore[index] && move > 0.5 ? state.sides[index] : state.sidesBefore[index]];

	const bodies = visual.units.flatMap((_, index) => unitBody(visual, state, index, move, seconds, colourOf(index), enemyOf(index)));
	bodies.sort((a, b) => a.y - b.y);
	const mines = visual.ground.filter((ground) => ground.type === 'mines').flatMap((ground) => ground.points);
	const fieldClip = `bf${id}`;
	const frame = {x: FIELD.left, y: FIELD.top - 6, width: FIELD.right - FIELD.left, height: FIELD.bottom - FIELD.top + 12};

	return (
		<World width={width} height={height} viewWidth={WORLD.width} viewHeight={WORLD.height}>
			<StageStrip names={visual.stages.map((item) => item.title)} stage={stage} progress={progress} width={WORLD.width} />
			<g fontFamily={palette.fontBody} fontWeight={800} fontSize={24}>
				{visual.sides.map((side, index) => (
					<g key={side} transform={`translate(${FIELD.left + 10 + index * 360} 90)`}>
						<path d="M0 0 v-18 h20 l-4 6 l4 6 h-20" fill={colours[index]} stroke={colours[index]} strokeWidth={1} />
						<text x={28} y={-3} fill={palette.ink}>
							{side}
						</text>
					</g>
				))}
			</g>
			<defs>
				<clipPath id={fieldClip}>
					<rect {...frame} rx={18} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${fieldClip})`}>
				<rect {...frame} fill={COLOURS.fieldFar} />
				<g transform={cameraTransform(camera)}>
					<Plain id={id} />
					{visual.ground.map((ground, index) => (
						<GroundShape key={index} ground={ground} seconds={seconds} seed={index} />
					))}
					{visual.ground.map((ground, index) => {
						if (!ground.name) return null;
						const [x, y] = nameAnchor(ground);
						const shown = inView(x, y, ground.name.length * 7, camera);
						return shown > 0 ? (
							<g key={`name${index}`} opacity={shown}>
								<Tag x={x} y={y} text={ground.name} size={24} anchor="middle" weight={700} fill={palette.muted} />
							</g>
						) : null;
					})}
					{/* This stage's arrows: wide and half-transparent, growing as the units go. */}
					{state.paths.map((path, index) => {
						if (path.length < 2) return null;
						const points = path.map(project);
						const drawn = clamp01(move * 1.1);
						const end = points.at(-1)!;
						const before = points.at(-2)!;
						const angle = Math.atan2(end[1] - before[1], end[0] - before[0]);
						const colour = colours[state.sidesBefore[index]];
						return (
							<g key={`arrow${index}`} opacity={0.5 * (1 - 0.7 * clamp01((progress - 0.8) / 0.2))}>
								<path d={curveThrough(points)} fill="none" stroke={colour} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawn} />
								{drawn > 0.97 ? <path d={`M${end[0] + Math.cos(angle) * 24} ${end[1] + Math.sin(angle) * 24} L${end[0] + Math.cos(angle + 2.4) * 32} ${end[1] + Math.sin(angle + 2.4) * 32} L${end[0] + Math.cos(angle - 2.4) * 32} ${end[1] + Math.sin(angle - 2.4) * 32} Z`} fill={colour} /> : null}
							</g>
						);
					})}
					{state.paths.map((path, index) => (
						<Trail key={`trail${index}`} path={path} move={move} ship={visual.units[index].type === 'ship'} />
					))}
					{bodies.map((body) => (
						<ellipse key={`shadow${body.key}`} cx={body.x} cy={body.y + 8 * body.scale} rx={7 * body.scale} ry={2.2 * body.scale} fill={COLOURS.metal} opacity={0.16} />
					))}
					{bodies.map((body) => (
						<g key={body.key} transform={`translate(${body.x} ${body.y}) scale(${body.scale * (1 + 0.12 * looks[body.index].focused)})`} opacity={Math.max(0.35, looks[body.index].opacity)}>
							{body.node}
						</g>
					))}
					{state.clashes.map(([a, b]) => {
						const [ax, ay] = project(ends[a]);
						const [bx, by] = project(ends[b]);
						return <Melee key={`melee${a}-${b}`} x={(ax + bx) / 2} y={(ay + by) / 2} show={clamp01((move - 0.7) / 0.3)} seconds={seconds} seed={a * 17 + b} />;
					})}
					{state.shots.map(({from, to}) => (
						<Volley key={`volley${from}`} from={project(ends[from])} to={project(ends[to])} kind={visual.units[from].type} seconds={seconds} active={clamp01((progress - 0.12) / 0.1) * (1 - clamp01((progress - 0.92) / 0.08))} seed={from * 13} />
					))}
					{visual.units.map((unit, index) => {
						if (unit.type !== 'ship' || !state.breaking[index] || !mines.some((mine) => Math.hypot(mine[0] - ends[index][0], mine[1] - ends[index][1]) < 12)) return null;
						const [x, y] = project(ends[index]);
						return <Splash key={`splash${index}`} x={x} y={y} share={clamp01((move - 0.25) / 0.5)} />;
					})}
					{/* Standards and names last, above everything on the field. */}
					{visual.units.map((unit, index) => {
						const look = looks[index];
						const place = along(state.paths[index], move);
						const [x, y] = project(place);
						const scale = SIZE * depthScale(place[1]);
						const fallen = state.breaking[index] ? clamp01((move - 0.4) / 0.4) : state.routed[index] ? 1 : 0;
						const depth = unit.type === 'ship' ? 18 : shape(unit)[1] * 7 + 6;
						return (
							<g key={`standard${index}`} opacity={Math.max(0.35, look.opacity)}>
								<Standard x={x + 14 * scale} y={y - 4 * scale} scale={scale * (1 + 0.15 * look.focused)} colour={colourOf(index)} seconds={seconds} seed={index * 3} fallen={fallen} />
								{unit.label && inView(x, y + (depth + 12) * scale, unit.label.length * 7.5, camera) > 0 ? (
									<g opacity={inView(x, y + (depth + 12) * scale, unit.label.length * 7.5, camera)}>
										<Tag x={x} y={y + (depth + 12) * scale} text={unit.label} size={24} anchor="middle" weight={800} focused={look.focused} />
									</g>
								) : null}
							</g>
						);
					})}
				</g>

			</g>
			<rect {...frame} rx={18} fill="none" stroke={withAlpha(palette.ink, 0.15)} strokeWidth={2} />
			{current.note || (stage === last && visual.outcome) ? (
				<g opacity={clamp01((progress - 0.05) / 0.2)}>
					<rect x={FIELD.left} y={NOTE_Y - 24} width={FIELD.right - FIELD.left} height={48} rx={24} fill={stage === last && visual.outcome ? colours[visual.outcome.winner] : withAlpha(palette.ink, 0.06 + 0.1 * note.focused)} />
					<text x={(FIELD.left + FIELD.right) / 2} y={NOTE_Y + 9} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={26} fill={stage === last && visual.outcome ? '#FFFFFF' : palette.ink}>
						{stage === last && visual.outcome ? visual.outcome.text : current.note}
					</text>
				</g>
			) : null}
		</World>
	);
};
