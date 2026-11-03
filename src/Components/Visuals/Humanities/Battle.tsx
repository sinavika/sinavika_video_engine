import React, {useId} from 'react';
import {clamp01, lerp, noise, smooth} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {StageStrip} from '../Geography/ProcessStage';
import {useFigureFont, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {BATTLE_GRID} from './HumanitiesSchema';
import {type CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {fittedScale, NotePill, pathOf, Tag, usePartLook, World} from '../VisualWorld';
import {textWidth} from '../FigureLabel';

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
	/** Units hauled over land this stage (ships on greased planks). */
	overland: boolean[];
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
		const overland = positions.map(() => false);
		for (const move of stage.moves) {
			paths[move.unit - 1] = [positions[move.unit - 1], ...move.via, move.to];
			overland[move.unit - 1] = move.overland;
		}
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
		return {paths, overland, sides, sidesBefore, routed: [...routed], breaking, burning: [...burning], clashes, shots};
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

/**
 * Where a unit's name goes: under the unit, or over its standard when under it would leave the field. A unit near the
 * field's near edge lost its name (Sakarya's cavalry raid, KPSS Tarih 16, 2 Nov 2026), as did 23 earlier units at
 * y 53-56.
 */
export const unitLabelY = (x: number, y: number, depth: number, scale: number, label: string, camera: Camera, size = NAME_SIZE, flip = false): number => {
	// A bigger name (an app still) stands farther off, so its letters stay clear of the unit.
	const grow = (size - NAME_SIZE) / 2;
	const below = y + (depth + 12) * scale + grow;
	const above = y - 58 * scale - grow;
	const half = textWidth(label, size) / 2;
	const usual = inView(x, below, half, camera) >= 1 || inView(x, below, half, camera) >= inView(x, above, half, camera) ? below : above;
	return flip ? (usual === below ? above : below) : usual;
};

/** Whether two label boxes cover each other. */
const boxesOverlap = (a: LabelBox, b: LabelBox) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Where a unit's name stands against its unit: `flip` puts it on the other side (over, not under), `dx` and `dy` move it. */
type NameSpot = {dx: number; dy: number; flip: boolean};

/**
 * Where each unit's name goes, where the units end a stage: its usual place, or, when that covers an earlier unit's
 * name, the other side of its unit, then half a name to the left or right on either side, then a line farther out;
 * the first clear place on the field wins, else the one covering least of the names placed before. Names of units standing close printed over each other
 * ("Alman-Avusturya" on "Viyana garnizonu", "Sobieski" and "Yeniçeri", Kahlenberg 1683) once the still raised them.
 */
export const unitNameSpots = (places: readonly ({x: number; y: number; depth: number; scale: number; label: string} | undefined)[], camera: Camera, size = NAME_SIZE): NameSpot[] => {
	const placed: LabelBox[] = [];
	return places.map((place) => {
		if (!place) return {dx: 0, dy: 0, flip: false};
		const half = textWidth(place.label, size) / 2;
		const shift = half + 10;
		const line = size * 1.35;
		const boxFor = ({dx, dy, flip}: NameSpot) => fieldLabelBox(place.x + dx, unitLabelY(place.x, place.y, place.depth, place.scale, place.label, camera, size, flip) + dy, place.label, size);
		const candidates: NameSpot[] = [
			{dx: 0, dy: 0, flip: false},
			{dx: 0, dy: 0, flip: true},
			{dx: -shift, dy: 0, flip: false},
			{dx: shift, dy: 0, flip: false},
			{dx: -shift, dy: 0, flip: true},
			{dx: shift, dy: 0, flip: true},
			{dx: 0, dy: line, flip: false},
			{dx: 0, dy: -line, flip: true},
			{dx: -shift, dy: line, flip: false},
			{dx: shift, dy: line, flip: false},
		];
		const clear = (spot: NameSpot, index: number) => {
			const box = boxFor(spot);
			if (placed.some((other) => boxesOverlap(box, other))) return false;
			return index === 0 || inView((box.left + box.right) / 2, (box.top + box.bottom) / 2, half, camera) >= 1;
		};
		// None clear: the place covering least of the names already placed, on the field.
		const covered = (spot: NameSpot) => {
			const box = boxFor(spot);
			return placed.reduce((sum, other) => sum + Math.max(0, Math.min(box.right, other.right) - Math.max(box.left, other.left)) * Math.max(0, Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top)), 0);
		};
		const onField = candidates.filter((spot, index) => index === 0 || inView((boxFor(spot).left + boxFor(spot).right) / 2, (boxFor(spot).top + boxFor(spot).bottom) / 2, half, camera) >= 1);
		const spot = candidates.find(clear) ?? onField.reduce((best, candidate) => (covered(candidate) < covered(best) ? candidate : best));
		placed.push(boxFor(spot));
		return spot;
	});
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
	const below = ground.type === 'hill' || ground.type === 'mountain' || ground.type === 'fortress' || ground.type === 'city' || ground.type === 'camp';
	return [x, y + (below ? 30 : -30)];
};

type LabelBox = {left: number; right: number; top: number; bottom: number};

/** The size of names on the field in a lesson; an app still raises it (useFigureFont). */
const NAME_SIZE = 24;

/** The box a name takes on the field at (x, y): about 7.5 units a letter at 24-unit type, growing with `size`. */
export const fieldLabelBox = (x: number, y: number, text: string, size = NAME_SIZE): LabelBox => {
	const grow = size / NAME_SIZE;
	const half = textWidth(text, size) / 2 + 8 * grow;
	return {left: x - half, right: x + half, top: y - 22 * grow, bottom: y + 8 * grow};
};

/**
 * Where a ground feature's name goes this stage: at its anchor, or the nearest spot around it that keeps clear of
 * every unit's name where the units end the stage; undefined when none is free, and the name is left out. On
 * Çanakkale's 18 March the sunken Irresistible lay under "Mayınlar" (KPSS Tarih 11, 2 Nov 2026).
 */
export const groundNameSpot = (anchor: readonly [number, number], name: string, unitLabels: readonly LabelBox[], size = NAME_SIZE): [number, number] | undefined => {
	const grow = size / NAME_SIZE;
	const offsets: readonly (readonly [number, number])[] = [[0, 0], [0, -36], [0, 36], [-110, 0], [110, 0], [0, -72], [0, 72], [-110, -36], [110, -36]];
	for (const [dx, dy] of offsets) {
		const spot: [number, number] = [anchor[0] + dx * grow, anchor[1] + dy * grow];
		const box = fieldLabelBox(spot[0], spot[1], name, size);
		if (!unitLabels.some((other) => boxesOverlap(box, other))) return spot;
	}
	return undefined;
};

/**
 * A hill (tepe): a low, uneven rise lit from the upper left, the shade falling down its right side along a curve,
 * short hachures down its slopes and a few bushes; drawn round the middle of its foot, 150 units wide. Until 2 Nov
 * 2026 a smooth dome lit half and half along a straight line, with an outline round its foot: it read as a tent or a
 * loaf (owner: "dağ gibi değil ya da dağ olduğu belli değil").
 */
const HILL = {
	height: 48,
	body: 'M-74 8 C-62 -2 -50 -14 -34 -24 C-22 -32 -12 -44 2 -46 C16 -48 28 -38 40 -28 C52 -18 64 -4 76 8 C40 14 -40 14 -74 8 Z',
	skyline: 'M-74 8 C-62 -2 -50 -14 -34 -24 C-22 -32 -12 -44 2 -46 C16 -48 28 -38 40 -28 C52 -18 64 -4 76 8',
	shade: 'M2 -46 C16 -48 28 -38 40 -28 C52 -18 64 -4 76 8 C56 11 36 12 18 12 C22 -6 16 -28 2 -46 Z',
	light: 'M2 -46 C-12 -44 -22 -32 -34 -24 C-44 -18 -52 -10 -58 -4 C-44 -10 -30 -16 -18 -26 C-8 -34 -2 -40 2 -46 Z',
	hachures: 'M-56 -6 l-4 8 M-44 -15 l-5 9 M-30 -25 l-4 10 M-16 -36 l-3 10 M18 -38 l3 10 M32 -30 l4 10 M46 -20 l5 9 M60 -8 l5 8',
	bushes: [
		[-40, -1, 4.5],
		[-33, 1, 3.5],
		[30, 4, 4.5],
		[37, 5, 3.5],
		[-6, 6, 3.5],
	],
} as const;

/**
 * A mountain (dağ): three rocky peaks, the highest in the middle, each with its sunlit left face and its shaded right
 * face, crevices, pale bare tips and a darker foot; drawn round the middle of its foot, 175 units wide and about twice
 * a hill's height.
 */
const MOUNTAIN = {
	height: 98,
	body: 'M-86 8 L-70 -14 L-60 -22 L-50 -44 L-42 -52 L-34 -40 L-24 -50 L-12 -76 L-4 -88 L2 -96 L10 -86 L18 -70 L26 -60 L36 -68 L44 -74 L54 -58 L64 -36 L74 -16 L88 8 C50 14 -50 14 -86 8 Z',
	skyline: 'M-86 8 L-70 -14 L-60 -22 L-50 -44 L-42 -52 L-34 -40 L-24 -50 L-12 -76 L-4 -88 L2 -96 L10 -86 L18 -70 L26 -60 L36 -68 L44 -74 L54 -58 L64 -36 L74 -16 L88 8',
	shade: ['M2 -96 L10 -86 L18 -70 L26 -60 L22 -30 L28 12 L-2 12 L4 -36 L-2 -66 Z', 'M44 -74 L54 -58 L64 -36 L74 -16 L88 8 L52 12 L50 -28 Z', 'M-42 -52 L-34 -40 L-30 -18 L-30 12 L-48 12 L-44 -22 Z'],
	foot: 'M-86 8 L-74 -6 C-40 -12 40 -12 80 -4 L88 8 C50 14 -50 14 -86 8 Z',
	tips: 'M2 -96 L10 -86 L6 -83 L1 -87 L-3 -82 L-4 -88 Z M44 -74 L50 -66 L46 -64 L42 -68 L38 -65 L36 -68 Z M-42 -52 L-37 -45 L-41 -44 L-44 -47 L-47 -44 Z',
	crevices: 'M-8 -66 L-14 -44 M-2 -40 L-8 -18 M-26 -34 L-22 -14 M38 -50 L34 -30 M60 -30 L56 -12 M-58 -14 L-54 -2',
} as const;

/**
 * Where a hill or a mountain `height` units tall stands on the field at (x, y), grid row `gridY`: sized by its depth,
 * and lowered (to half its height at most) when its top would rise past the field's far edge. Kösedağ at the far edge
 * lost its peaks to the frame.
 */
export const riseTransform = (x: number, y: number, gridY: number, height: number): string => {
	const scale = SIZE * depthScale(gridY);
	const room = (y - (FIELD.top + 4)) / (height * scale);
	const tall = Math.min(1, Math.max(0.5, room));
	return tall < 1 ? `translate(${x} ${y}) scale(${scale} ${scale * tall})` : `translate(${x} ${y}) scale(${scale})`;
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
	plank: '#9C7A4E',
	plankDark: '#5E4528',
	grass: '#93A86E',
	water: '#78AEDB',
	waterDeep: '#3D78B0',
	seaDeep: '#4F8BC4',
	shallow: '#8DBEE6',
	sand: '#E4D3A6',
	foam: '#FFFFFF',
	hill: '#C7B083',
	hillLight: '#DECDA4',
	hillLine: '#8A7048',
	rock: '#A38C6C',
	rockLight: '#CDB892',
	rockShade: '#7E6750',
	rockLine: '#5E4B38',
	rockTip: '#EEE7D7',
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

/**
 * A sea seen from the hill: its outline on the screen, carried past the field's edges wherever the sea reaches them, so
 * open water runs on to the horizon and the frame's sides instead of stopping at the plain's slanted edge; and its
 * coasts, the stretches of outline over the land, as screen lines. A sea that stopped at the plain's edge, with the pale
 * ground of the frame around it, read as a lake (owner, 1 Nov 2026: "Ege Denizi göl gibi").
 */
export const seaOutline = (points: readonly Point[]): {fill: [number, number][]; coasts: [number, number][][]} => {
	const ring = smoothCoast(points);
	const left = (point: Point) => point[0] <= 0;
	const right = (point: Point) => point[0] >= BATTLE_GRID.width;
	const far = (point: Point) => point[1] <= 0;
	const near = (point: Point) => point[1] >= BATTLE_GRID.height;
	const onEdge = (point: Point) => left(point) || right(point) || far(point) || near(point);
	const fill = ring.map((point): [number, number] => {
		const [x, y] = project(point);
		return [left(point) ? FIELD.left - SEA_BLEED : right(point) ? FIELD.right + SEA_BLEED : x, far(point) ? FIELD.top - SEA_BLEED : near(point) ? FIELD.bottom + SEA_BLEED : y];
	});
	// Runs of the outline that do not lie along an edge of the field are coast.
	const coasts: [number, number][][] = [];
	let run: [number, number][] = [];
	const start = Math.max(0, ring.findIndex((point, index) => onEdge(point) && onEdge(ring[(index + 1) % ring.length])));
	for (let step = 0; step <= ring.length; step++) {
		const point = ring[(start + step) % ring.length];
		const next = ring[(start + step + 1) % ring.length];
		if (onEdge(point) && onEdge(next)) {
			if (run.length) run.push(project(point));
			if (run.length > 1) coasts.push(run);
			run = [];
			continue;
		}
		run.push(project(point));
	}
	if (run.length > 1) coasts.push(run);
	return {fill, coasts};
};

/** How far a sea runs past the field's edge, in world units: to the frame's own edge and beyond (the frame clips it). */
const SEA_BLEED = 40;

/** The colours of a night battle: the sky, the shadow laid over the ground, the moon. */
const NIGHT = {sky: '#16233A', shade: '#0E1A2E', moon: '#F4EFD8', star: '#DCE6F5', name: '#E8EDF5', enemy: '#C9D3E2'} as const;

/**
 * Stars of a night battle, in the sky the far edge of the plain leaves at the top corners (the plain narrows towards
 * the horizon), as world points with a size: never over the ground.
 */
export const nightStars = (count = 40): {x: number; y: number; size: number}[] => {
	const [farLeft] = project([0, 0]);
	const [farRight] = project([BATTLE_GRID.width, 0]);
	const [nearLeft, bottom] = project([0, BATTLE_GRID.height]);
	const stars: {x: number; y: number; size: number}[] = [];
	for (let index = 0; stars.length < count && index < count * 20; index++) {
		const x = FIELD.left + noise(index + 900) * (FIELD.right - FIELD.left);
		const y = FIELD.top - 4 + noise(index + 1900) * (bottom - FIELD.top) * 0.6;
		// The plain's side edges run from the far corners to the near ones; a star must be outside them.
		const share = (y - FIELD.top) / (bottom - FIELD.top);
		const left = farLeft + (nearLeft - farLeft) * share;
		const right = farRight + (FIELD.right - farRight) * share;
		if (x < left - 6 || x > right + 6) stars.push({x, y, size: 1.2 + noise(index + 2900) * 1.8});
	}
	return stars;
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
			const {fill, coasts} = seaOutline(ground.points);
			const d = pathOf(fill, true);
			const xs = fill.map(([x]) => x);
			const ys = fill.map(([, y]) => y);
			const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
			const clip = `sea${seed}`;
			const coastPaths = coasts.map((coast) => pathOf(coast, false));
			return (
				<g>
					<defs>
						<clipPath id={clip}>
							<path d={d} />
						</clipPath>
					</defs>
					{/* A strip of sand along the coast, then open water deep blue with a lighter band of shallows at the shore. */}
					{coastPaths.map((coast, index) => (
						<path key={`sand${index}`} d={coast} fill="none" stroke={COLOURS.sand} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
					))}
					<path d={d} fill={COLOURS.seaDeep} />
					<g clipPath={`url(#${clip})`}>
						{coastPaths.map((coast, index) => (
							<path key={`shallow${index}`} d={coast} fill="none" stroke={COLOURS.shallow} strokeWidth={58} strokeLinejoin="round" strokeLinecap="round" />
						))}
						{coastPaths.map((coast, index) => (
							<path key={`shallower${index}`} d={coast} fill="none" stroke={COLOURS.water} strokeWidth={26} strokeLinejoin="round" strokeLinecap="round" opacity={0.7} />
						))}
					</g>
					<g clipPath={`url(#${clip})`} stroke={COLOURS.foam} strokeWidth={2} fill="none" opacity={0.5}>
						{Array.from({length: 12}, (_, row) => {
							const y = top + ((row + 0.5) / 12) * (bottom - top);
							const drift = ((seconds * 18 + row * 37) % 60) - 30;
							return Array.from({length: 7}, (__, column) => {
								const x = left + ((column + (row % 2) * 0.5) / 7) * (right - left) + drift;
								return <path key={`${row}-${column}`} d={`M${x - 14} ${y} q7 -5 14 0 t14 0`} />;
							});
						})}
					</g>
					{/* Surf breaking on the shore. */}
					{coastPaths.map((coast, index) => (
						<path key={`foam${index}`} d={coast} fill="none" stroke={COLOURS.foam} strokeWidth={3} strokeDasharray="18 12" strokeDashoffset={-seconds * 10} strokeLinecap="round" opacity={0.85} />
					))}
				</g>
			);
		}
		case 'hill':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={riseTransform(x, y, ground.points[index][1], HILL.height)}>
							<ellipse cx={6} cy={9} rx={76} ry={12} fill={COLOURS.hillLine} opacity={0.16} />
							<path d={HILL.body} fill={COLOURS.hill} />
							<path d={HILL.shade} fill={COLOURS.hillLine} opacity={0.34} />
							<path d={HILL.light} fill={COLOURS.hillLight} opacity={0.85} />
							<path d={HILL.hachures} fill="none" stroke={COLOURS.hillLine} strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
							{HILL.bushes.map(([bx, by, r], bush) => (
								<circle key={bush} cx={bx} cy={by} r={r} fill={bush % 2 ? COLOURS.forest : COLOURS.forestDark} />
							))}
							{/* The skyline only: an outline round the foot made it an object standing on the field. */}
							<path d={HILL.skyline} fill="none" stroke={COLOURS.hillLine} strokeWidth={2} strokeLinejoin="round" />
						</g>
					))}
				</g>
			);
		case 'mountain':
			return (
				<g>
					{points.map(([x, y], index) => (
						<g key={index} transform={riseTransform(x, y, ground.points[index][1], MOUNTAIN.height)}>
							<ellipse cx={6} cy={10} rx={90} ry={13} fill={COLOURS.rockLine} opacity={0.18} />
							<path d={MOUNTAIN.body} fill={COLOURS.rockLight} />
							{MOUNTAIN.shade.map((face, at) => (
								<path key={at} d={face} fill={COLOURS.rockShade} />
							))}
							<path d={MOUNTAIN.foot} fill={COLOURS.rock} opacity={0.55} />
							<path d={MOUNTAIN.tips} fill={COLOURS.rockTip} />
							<path d={MOUNTAIN.crevices} fill="none" stroke={COLOURS.rockLine} strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />
							<path d={MOUNTAIN.skyline} fill="none" stroke={COLOURS.rockLine} strokeWidth={2.2} strokeLinejoin="round" />
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
/**
 * The wooden ties laid across the way of a ship hauled over land, every `spacing` grid units along its path: each a
 * world point and the angle of the way there (the ties lie across it).
 */
export const plankTies = (path: readonly Point[], spacing = 2.4): {at: [number, number]; angle: number}[] => {
	const length = pathLength(path);
	if (length < 0.5) return [];
	const count = Math.max(2, Math.floor(length / spacing));
	return Array.from({length: count + 1}, (_, index) => {
		const share = index / count;
		const [ax, ay] = project(along(path, Math.max(0, share - 0.01)));
		const [bx, by] = project(along(path, Math.min(1, share + 0.01)));
		return {at: project(along(path, share)), angle: Math.atan2(by - ay, bx - ax)};
	});
};

/**
 * A slipway of greased planks over land: laid in front of the ship as the stage begins, then the ship slides along it
 * (Fatih's ships taken over Galata into the Golden Horn, 1453).
 */
const Slipway: React.FC<{path: Point[]; laid: number}> = ({path, laid}) => {
	const ties = plankTies(path);
	const shown = Math.ceil(ties.length * clamp01(laid));
	return (
		<g>
			<path d={curveThrough(path.map(project))} fill="none" stroke={COLOURS.plank} strokeWidth={22} strokeLinecap="round" opacity={0.55 * clamp01(laid * 3)} />
			{ties.slice(0, shown).map((tie, index) => {
				const [x, y] = tie.at;
				const [dx, dy] = [Math.cos(tie.angle + Math.PI / 2) * 15, Math.sin(tie.angle + Math.PI / 2) * 15];
				return <line key={index} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} stroke={COLOURS.plankDark} strokeWidth={4} strokeLinecap="round" />;
			})}
		</g>
	);
};

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
	const night = visual.time === 'night';
	const {stage, progress} = useStageClock(visual.stages.length, {delaySeconds, secondsPerStage: 4.5});
	const states = battleStates(visual);
	const state = states[stage];
	const last = visual.stages.length - 1;
	// Units march in the first part of the stage and then hold, so the narration can be followed on a still field.
	const move = smooth((progress - 0.06) / 0.6);
	// At night the second side is drawn in moonlit silver: in ink it disappeared into the dark ground (KPSS Tarih 4).
	const colours: [string, string] = [palette.lesson, night ? NIGHT.enemy : palette.ink];
	// Names, the sides' key and the note: as in the lesson, or raised to an app still's smallest text.
	const font = useFigureFont(fittedScale(width, height, WORLD.width, WORLD.height));
	const nameSize = font(NAME_SIZE);
	const keyGrow = font(24) / 24;
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
	// Where the units' names stand when this stage ends: on the side of the unit that keeps them off each other, and
	// ground names keep clear of them.
	const depthOf = (unit: Battle['units'][number]) => (unit.type === 'ship' ? 18 : shape(unit)[1] * 7 + 6);
	const endPlaces = visual.units.map((unit, index) => {
		if (!unit.label) return undefined;
		const [x, y] = project(ends[index]);
		return {x, y, depth: depthOf(unit), scale: SIZE * depthScale(ends[index][1]), label: unit.label};
	});
	const nameSpots = unitNameSpots(endPlaces, camera, nameSize);
	const unitNameBoxes = endPlaces.flatMap((place, index) => (place ? [fieldLabelBox(place.x + nameSpots[index].dx, unitLabelY(place.x, place.y, place.depth, place.scale, place.label, camera, nameSize, nameSpots[index].flip) + nameSpots[index].dy, place.label, nameSize)] : []));
	// Ground names keep clear of the units' names and of each other ("Viyana" on "Osmanlı ordugâhı").
	const takenNames = [...unitNameBoxes];
	const groundSpots = visual.ground.map((ground) => {
		if (!ground.name) return undefined;
		const spot = groundNameSpot(nameAnchor(ground), ground.name, takenNames, nameSize);
		if (spot) takenNames.push(fieldLabelBox(spot[0], spot[1], ground.name, nameSize));
		return spot;
	});

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
					<g key={side} transform={`translate(${FIELD.left + 10 + index * 360 * keyGrow} 90) scale(${keyGrow})`}>
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
				<rect {...frame} fill={night ? NIGHT.sky : COLOURS.fieldFar} />
				{night ? (
					<g>
						{nightStars().map((star, index) => (
							<circle key={index} cx={star.x} cy={star.y} r={star.size} fill={NIGHT.star} opacity={0.55 + 0.45 * Math.abs(Math.sin(seconds * 1.3 + index))} />
						))}
						<circle cx={FIELD.right - 70} cy={FIELD.top + 46} r={26} fill={NIGHT.moon} />
						<circle cx={FIELD.right - 60} cy={FIELD.top + 40} r={24} fill={NIGHT.sky} />
					</g>
				) : null}
				<g transform={cameraTransform(camera)}>
					<Plain id={id} />
					{visual.ground.map((ground, index) => (
						<GroundShape key={index} ground={ground} seconds={seconds} seed={index} />
					))}
					{/* At night the ground lies in shadow; the armies, drawn after, stand out as if lit. */}
					{night ? <path d={pathOf([project([0, 0]), project([BATTLE_GRID.width, 0]), project([BATTLE_GRID.width, BATTLE_GRID.height]), project([0, BATTLE_GRID.height])], true)} fill={NIGHT.shade} opacity={0.62} /> : null}
					{visual.ground.map((ground, index) => {
						if (!ground.name) return null;
						const spot = groundSpots[index];
						if (!spot) return null;
						const [x, y] = spot;
						const shown = inView(x, y, textWidth(ground.name, nameSize, 700) / 2, camera);
						return shown > 0 ? (
							<g key={`name${index}`} opacity={shown}>
								<Tag x={x} y={y} text={ground.name} size={nameSize} anchor="middle" weight={700} fill={night ? NIGHT.name : palette.muted} halo={night ? NIGHT.shade : undefined} />
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
					{state.paths.map((path, index) => (state.overland[index] ? <Slipway key={`slip${index}`} path={path} laid={progress / 0.25} /> : null))}
					{state.paths.map((path, index) => (
						<Trail key={`trail${index}`} path={path} move={move} ship={visual.units[index].type === 'ship' && !state.overland[index]} />
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
								{(() => {
									if (!unit.label) return null;
									const labelY = unitLabelY(x, y, depth, scale, unit.label, camera, nameSize, nameSpots[index].flip) + nameSpots[index].dy;
									const labelX = x + nameSpots[index].dx;
									const shown = inView(labelX, labelY, textWidth(unit.label, nameSize) / 2, camera);
									return shown > 0 ? (
										<g opacity={shown}>
											<Tag x={labelX} y={labelY} text={unit.label} size={nameSize} anchor="middle" weight={800} focused={look.focused} />
										</g>
									) : null;
								})()}
							</g>
						);
					})}
				</g>

			</g>
			<rect {...frame} rx={18} fill="none" stroke={withAlpha(palette.ink, 0.15)} strokeWidth={2} />
			{current.note || (stage === last && visual.outcome) ? (
				<NotePill
					left={FIELD.left}
					right={FIELD.right}
					y={NOTE_Y}
					text={stage === last && visual.outcome ? visual.outcome.text : (current.note ?? '')}
					fill={stage === last && visual.outcome ? colours[visual.outcome.winner] : withAlpha(palette.ink, 0.06 + 0.1 * note.focused)}
					ink={stage === last && visual.outcome ? '#FFFFFF' : palette.ink}
					opacity={clamp01((progress - 0.05) / 0.2)}
				/>
			) : null}
		</World>
	);
};
