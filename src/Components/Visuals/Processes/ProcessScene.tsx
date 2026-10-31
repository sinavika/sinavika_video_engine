import React, {createContext, useContext, useId} from 'react';
import {clamp01, lerp, noise, smooth} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette} from '../VisualFrame';
import {useStageClock} from '../VisualTimeline';
import {pathOf, Tag, usePartLook, World} from '../VisualWorld';
import {StageStrip} from '../Geography/ProcessStage';
import {PROCESS_CATALOG, type ProcessName} from './ProcessCatalog';

/**
 * The frame every natural process is told in (VisualSchema: process): a wide scene like a film frame with the
 * stage strip above it and the stage's note under it. The camera closes in on what happens in each stage and moves
 * over 1.6 s when the stage changes; labels keep their size on screen at any zoom. Everything is a function of the
 * frame (no randomness): rain, flowing water and carried grains look the same on every render.
 */

export type Point = readonly [number, number];

const WORLD = {width: 1600, height: 700};
/** The scene's box in world units; process drawings use these coordinates. */
export const SCENE = {left: 40, right: 1560, top: 72, bottom: 640};
const NOTE_Y = 674;
const MAX_ZOOM = 2.2;
const CAMERA_MOVE_SECONDS = 1.6;

// ---------------------------------------------------------------- the clock

export type ProcessClock = {
	/** Scene seconds, for what keeps moving (rain, water, smoke). */
	time: number;
	/** The current stage's id and its place among the stages shown. */
	current: string;
	index: number;
	shown: readonly string[];
	/** Seconds into the current stage and its share done (a stage lasts as long as its beats are read). */
	seconds: number;
	progress: number;
	/** How far a stage has run: 1 once passed (or left out), its progress while current, 0 before it. */
	amount: (id: string) => number;
	/** 1 while a stage is the current one (fading in), fading out early in the next: for what only that stage shows. */
	now: (id: string) => number;
};

/** The stages advance with the beats' `stage`; without beats they follow one another. */
export const useProcessClock = (process: ProcessName, shown: readonly string[] | undefined, delaySeconds = 0): ProcessClock => {
	const all: string[] = PROCESS_CATALOG[process].stages.map((stage) => stage.id);
	const stages = shown && shown.length > 0 ? shown : all;
	const {stage, progress, seconds} = useStageClock(stages.length, {delaySeconds, secondsPerStage: 5});
	const time = useSceneSeconds();
	const current = stages[stage];
	const at = all.indexOf(current);
	return {
		time,
		current,
		index: stage,
		shown: stages,
		seconds,
		progress,
		amount: (id) => {
			const index = all.indexOf(id);
			return index < at ? 1 : index === at ? progress : 0;
		},
		now: (id) => (id === current ? smooth(clamp01(seconds / 0.6)) : stage > 0 && stages[stage - 1] === id ? 1 - clamp01(seconds / 0.8) : 0),
	};
};

// ---------------------------------------------------------------- the camera

/** A part of the scene to frame, [left, top, right, bottom] in scene units; undefined is the whole scene. */
export type CameraBox = readonly [number, number, number, number] | undefined;
type Camera = {x: number; y: number; zoom: number};
const WIDE: Camera = {x: (SCENE.left + SCENE.right) / 2, y: (SCENE.top + SCENE.bottom) / 2, zoom: 1};

const cameraOn = (box: CameraBox): Camera => {
	if (!box) return WIDE;
	const [x0, y0, x1, y1] = box;
	const zoom = Math.max(1, Math.min(MAX_ZOOM, (SCENE.right - SCENE.left) / (x1 - x0), (SCENE.bottom - SCENE.top) / (y1 - y0)));
	const halfW = (SCENE.right - SCENE.left) / 2 / zoom;
	const halfH = (SCENE.bottom - SCENE.top) / 2 / zoom;
	return {
		x: Math.min(SCENE.right - halfW, Math.max(SCENE.left + halfW, (x0 + x1) / 2)),
		y: Math.min(SCENE.bottom - halfH, Math.max(SCENE.top + halfH, (y0 + y1) / 2)),
		zoom,
	};
};

/** Where the camera looks: each stage frames its own box (which may move as the stage runs). */
export const processCamera = (clock: ProcessClock, framing: (stage: string, progress: number) => CameraBox): Camera => {
	const before = clock.index > 0 ? cameraOn(framing(clock.shown[clock.index - 1], 1)) : WIDE;
	const now = cameraOn(framing(clock.current, clock.progress));
	const move = smooth(clamp01(clock.seconds / CAMERA_MOVE_SECONDS));
	return {x: lerp(before.x, now.x, move), y: lerp(before.y, now.y, move), zoom: lerp(before.zoom, now.zoom, move)};
};

const cameraTransform = (camera: Camera) => {
	const cx = (SCENE.left + SCENE.right) / 2;
	const cy = (SCENE.top + SCENE.bottom) / 2;
	return `translate(${cx} ${cy}) scale(${camera.zoom}) translate(${-camera.x} ${-camera.y})`;
};

const CameraContext = createContext<Camera>(WIDE);

/** How much of a label at (x, y), `half` wide either side, is inside the frame: it fades out near an edge. */
const inView = (x: number, y: number, half: number, camera: Camera): number => {
	const cx = (SCENE.left + SCENE.right) / 2;
	const cy = (SCENE.top + SCENE.bottom) / 2;
	const [sx, sy] = [cx + camera.zoom * (x - camera.x), cy + camera.zoom * (y - camera.y)];
	const room = Math.min(sx - half - SCENE.left, SCENE.right - (sx + half), sy - 18 - SCENE.top, SCENE.bottom - (sy + 18));
	return clamp01(room / 24);
};

// ---------------------------------------------------------------- the frame

/** `overlay` is drawn over the scene in frame coordinates, untouched by the camera (a key to the whole process). */
export const ProcessFrame: React.FC<{
	process: ProcessName;
	clock: ProcessClock;
	camera: Camera;
	width: number;
	height: number;
	backdrop?: string;
	overlay?: React.ReactNode;
	children: React.ReactNode;
}> = ({process, clock, camera, width, height, backdrop = '#E4F0F8', overlay, children}) => {
	const palette = useVisualPalette();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const stages: readonly {id: string; title: string; note: string}[] = PROCESS_CATALOG[process].stages;
	const titles = clock.shown.map((stage) => stages.find((item) => item.id === stage)?.title ?? stage);
	const note = stages.find((item) => item.id === clock.current)?.note;
	// A beat that points at the stage itself lights its note.
	const noteLook = usePartLook(clock.current, 1);
	const frame = {x: SCENE.left, y: SCENE.top, width: SCENE.right - SCENE.left, height: SCENE.bottom - SCENE.top};
	return (
		<World width={width} height={height} viewWidth={WORLD.width} viewHeight={WORLD.height}>
			<StageStrip names={titles} stage={clock.index} progress={clock.progress} width={WORLD.width} />
			<defs>
				<clipPath id={`pf${id}`}>
					<rect {...frame} rx={18} />
				</clipPath>
			</defs>
			<g clipPath={`url(#pf${id})`}>
				<rect {...frame} fill={backdrop} />
				<CameraContext.Provider value={camera}>
					<g transform={cameraTransform(camera)}>{children}</g>
				</CameraContext.Provider>
				{overlay}
			</g>
			<rect {...frame} rx={18} fill="none" stroke={withAlpha(palette.ink, 0.15)} strokeWidth={2} />
			{note ? (
				<g opacity={clamp01(clock.seconds / 0.6)}>
					<rect x={SCENE.left} y={NOTE_Y - 24} width={SCENE.right - SCENE.left} height={48} rx={24} fill={withAlpha(palette.ink, 0.06 + 0.1 * noteLook.focused)} />
					<text x={(SCENE.left + SCENE.right) / 2} y={NOTE_Y + 9} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={26} fill={palette.ink}>
						{note}
					</text>
				</g>
			) : null}
		</World>
	);
};

/**
 * A named form with a short leader line from the point it names. It keeps its size on screen at any zoom and lights
 * in the lesson colour when a beat points at it. When the camera would cut it, the label moves inside the frame (the
 * leader still reaches the point); it fades out only when the point itself leaves the frame.
 */
export const ProcessLabel: React.FC<{id: string; at: Point; to: Point; text: string; show: number; anchor?: 'start' | 'middle' | 'end'; size?: number}> = ({
	id,
	at,
	to,
	text,
	show,
	anchor = 'middle',
	size = 25,
}) => {
	const palette = useVisualPalette();
	const camera = useContext(CameraContext);
	const look = usePartLook(id, clamp01(show));
	const k = 1 / camera.zoom;
	const opacity = look.opacity * inView(at[0], at[1], 0, camera);
	if (opacity < 0.01) return null;
	// The visible part of the scene, in scene units, and the label's box in it.
	const halfW = (SCENE.right - SCENE.left) / 2 / camera.zoom;
	const halfH = (SCENE.bottom - SCENE.top) / 2 / camera.zoom;
	const width = (text.length * size * 0.58 + 16) * k;
	const left = anchor === 'start' ? to[0] : anchor === 'end' ? to[0] - width : to[0] - width / 2;
	const shift = Math.max(camera.x - halfW + 14 * k - left, Math.min(0, camera.x + halfW - 14 * k - (left + width)));
	const x = to[0] + shift;
	const y = Math.min(camera.y + halfH - 24 * k, Math.max(camera.y - halfH + 24 * k, to[1]));
	const colour = look.focused > 0.5 ? palette.lesson : palette.ink;
	const vertical = Math.abs(y - at[1]) > 20 * k;
	const leaderEnd = vertical ? y + (y > at[1] ? -16 : 16) * k : y;
	const leaderX = vertical ? (anchor === 'start' ? x + 10 * k : anchor === 'end' ? x - 10 * k : x) : x + (x > at[0] ? -8 : 8) * k;
	return (
		<g opacity={opacity}>
			{Math.hypot(x - at[0], y - at[1]) > 24 * k ? <line x1={at[0]} y1={at[1]} x2={leaderX} y2={leaderEnd} stroke={colour} strokeWidth={2.6 * k} strokeLinecap="round" /> : null}
			<circle cx={at[0]} cy={at[1]} r={5.5 * k} fill={colour} stroke={palette.surface} strokeWidth={1.6 * k} />
			<Tag x={x} y={y} text={text} anchor={anchor} size={size * k} weight={800} focused={look.focused} />
		</g>
	);
};

/**
 * A plain name in the scene (a latitude, a place) without a leader line. Like a label it keeps its size on screen at
 * any zoom, and it fades out as it nears the frame's edge instead of being cut there.
 */
export const SceneTag: React.FC<{x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; size?: number; fill?: string; halo?: string}> = ({
	x,
	y,
	text,
	anchor = 'start',
	size = 20,
	fill,
	halo,
}) => {
	const camera = useContext(CameraContext);
	const k = 1 / camera.zoom;
	const width = text.length * size * 0.58;
	const middle = anchor === 'start' ? x + (width * k) / 2 : anchor === 'end' ? x - (width * k) / 2 : x;
	const opacity = inView(middle, y, width / 2, camera);
	if (opacity < 0.01) return null;
	return (
		<g opacity={opacity}>
			<Tag x={x} y={y} text={text} anchor={anchor} size={size * k} weight={800} fill={fill} halo={halo} />
		</g>
	);
};

// ---------------------------------------------------------------- drawing helpers

/** A smooth curve through the points (Catmull-Rom as Bézier segments). */
export const smoothPath = (points: readonly Point[], close = false): string => {
	if (points.length < 3) return pathOf(points, close);
	const p = close ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]];
	let d = `M${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)}`;
	for (let i = 1; i < p.length - 2; i++) {
		const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return close ? `${d} Z` : d;
};

/** Points of y = f(x) from x0 to x1. */
export const sampled = (f: (x: number) => number, x0: number, x1: number, step = 10): Point[] => {
	const count = Math.max(2, Math.ceil(Math.abs(x1 - x0) / step));
	return Array.from({length: count + 1}, (_, index) => {
		const x = x0 + ((x1 - x0) * index) / count;
		return [x, f(x)] as const;
	});
};

/** The point a share of the way along a polyline. */
const pointAlong = (points: readonly Point[], share: number): Point => {
	const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
	const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
	let left = clamp01(share) * total;
	for (let index = 0; index < lengths.length; index++) {
		if (left <= lengths[index] || index === lengths.length - 1) {
			const t = clamp01(left / (lengths[index] || 1));
			return [lerp(points[index][0], points[index + 1][0], t), lerp(points[index][1], points[index + 1][1], t)];
		}
		left -= lengths[index];
	}
	return points[points.length - 1];
};

/** Falling rain that stops at the ground with a small splash. `amount` 0–1 is how hard it rains. */
export const Rain: React.FC<{x0: number; x1: number; top: number; ground: (x: number) => number; time: number; amount: number; count?: number; slant?: number}> = ({
	x0,
	x1,
	top,
	ground,
	time,
	amount,
	count = 70,
	slant = 0.16,
}) => {
	if (amount <= 0.01) return null;
	const drops = Math.round(count * (0.3 + 0.7 * clamp01(amount)));
	return (
		<g opacity={clamp01(amount * 1.6)}>
			{Array.from({length: drops}, (_, index) => {
				const x = x0 + noise(index * 3.1 + 1) * (x1 - x0);
				const span = Math.max(40, ground(x) - top);
				const cycle = (time * 1.6 + noise(index * 7.7 + 2)) % 1;
				const y = top + cycle * span;
				const dx = slant * (y - top);
				const end = cycle > 0.92;
				return end ? (
					<ellipse
						key={index}
						cx={x + dx}
						cy={top + span}
						rx={4 + 30 * (cycle - 0.92)}
						ry={1.5 + 8 * (cycle - 0.92)}
						fill="none"
						stroke="#4E86BE"
						strokeWidth={1.6}
						opacity={1 - (cycle - 0.92) / 0.08}
					/>
				) : (
					<line key={index} x1={x + dx - slant * 22} y1={y - 22} x2={x + dx} y2={y} stroke="#4E86BE" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
				);
			})}
		</g>
	);
};

/** A grey rain cloud. */
export const Cloud: React.FC<{x: number; y: number; scale?: number; dark?: number; opacity?: number}> = ({x, y, scale = 1, dark = 0.5, opacity = 1}) => {
	const fill = `rgb(${Math.round(lerp(236, 140, dark))}, ${Math.round(lerp(240, 150, dark))}, ${Math.round(lerp(245, 165, dark))})`;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
			<ellipse cx={0} cy={0} rx={90} ry={34} fill={fill} />
			<circle cx={-40} cy={-18} r={36} fill={fill} />
			<circle cx={12} cy={-34} r={46} fill={fill} />
			<circle cx={58} cy={-12} r={32} fill={fill} />
		</g>
	);
};

/** Water flowing along a line: dashes that run with the current. */
export const FlowLine: React.FC<{d: string; time: number; width?: number; colour?: string; speed?: number; opacity?: number}> = ({d, time, width = 6, colour = '#3E7FC0', speed = 60, opacity = 1}) => (
	<g opacity={opacity}>
		<path d={d} fill="none" stroke={colour} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
		<path
			d={d}
			fill="none"
			stroke="#FFFFFF"
			strokeOpacity={0.55}
			strokeWidth={Math.max(1.5, width * 0.32)}
			strokeLinecap="round"
			strokeDasharray={`${width * 2.2} ${width * 3.4}`}
			strokeDashoffset={-time * speed}
		/>
	</g>
);

/** Grains carried along a path (sand in a river, silt in runoff), each at its own place and pace. */
export const Drift: React.FC<{points: readonly Point[]; time: number; count: number; amount?: number; colour?: string; size?: number; speed?: number; spread?: number; seed?: number}> = ({
	points,
	time,
	count,
	amount = 1,
	colour = '#8C6239',
	size = 4,
	speed = 0.12,
	spread = 8,
	seed = 0,
}) => {
	if (amount <= 0.01) return null;
	return (
		<g opacity={clamp01(amount * 1.5)}>
			{Array.from({length: count}, (_, index) => {
				const share = (noise(seed + index * 5.3) + time * speed * (0.7 + 0.6 * noise(seed + index * 2.1))) % 1;
				const [x, y] = pointAlong(points, share);
				const jitter = (noise(seed + index * 9.7) - 0.5) * 2 * spread;
				return <circle key={index} cx={x} cy={y + jitter} r={size * (0.6 + 0.7 * noise(seed + index * 1.3))} fill={colour} />;
			})}
		</g>
	);
};

/** A tree standing at its foot; `tilt` leans it (degrees) as the ground under it moves. */
export const Tree: React.FC<{x: number; y: number; size?: number; tilt?: number; kind?: 'broad' | 'pine'; roots?: number; seed?: number}> = ({
	x,
	y,
	size = 1,
	tilt = 0,
	kind = 'broad',
	roots = 0,
	seed = 0,
}) => {
	const shade = 0.85 + 0.15 * noise(seed + 3);
	const green = `rgb(${Math.round(78 * shade)}, ${Math.round(134 * shade)}, ${Math.round(66 * shade)})`;
	const dark = `rgb(${Math.round(52 * shade)}, ${Math.round(100 * shade)}, ${Math.round(48 * shade)})`;
	return (
		<g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${size})`}>
			{roots > 0 ? (
				<g opacity={roots} stroke="#E6CFA4" strokeWidth={3.2} fill="none" strokeLinecap="round" transform="scale(1.5)">
					<path d="M0 0 C-6 14 -18 22 -30 34" />
					<path d="M0 0 C4 16 14 26 26 38" />
					<path d="M0 0 C-1 18 -3 30 -2 46" />
					<path d="M-12 18 C-20 22 -26 22 -34 20" />
					<path d="M10 20 C18 24 24 30 30 30" />
				</g>
			) : null}
			<path d="M-4 0 L-3 -30 L3 -30 L4 0 Z" fill="#7A5230" />
			{kind === 'pine' ? (
				<>
					<path d="M0 -78 L-20 -40 L20 -40 Z" fill={green} />
					<path d="M0 -62 L-24 -24 L24 -24 Z" fill={dark} />
				</>
			) : (
				<>
					<circle cx={-12} cy={-40} r={16} fill={dark} />
					<circle cx={12} cy={-42} r={17} fill={dark} />
					<circle cx={0} cy={-56} r={19} fill={green} />
					<circle cx={-6} cy={-44} r={13} fill={green} />
				</>
			)}
		</g>
	);
};

/** A small house; `tilt` and `crack` show it giving way. */
export const House: React.FC<{x: number; y: number; size?: number; tilt?: number; crack?: number}> = ({x, y, size = 1, tilt = 0, crack = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${size})`}>
		<rect x={-26} y={-36} width={52} height={36} fill="#F4EDE1" stroke="#6B5A48" strokeWidth={1.8} />
		<path d="M-32 -34 L0 -60 L32 -34 Z" fill="#B5523B" stroke="#6E2F21" strokeWidth={1.8} strokeLinejoin="round" />
		<rect x={-18} y={-26} width={12} height={11} fill="#8DB6D9" stroke="#6B5A48" strokeWidth={1.2} />
		<rect x={6} y={-22} width={11} height={22} fill="#8C6239" />
		{crack > 0 ? <path d="M-4 -36 L2 -26 L-3 -18 L4 -8 L0 0" fill="none" stroke="#3D2B1A" strokeWidth={2} opacity={crack} /> : null}
	</g>
);

/** Grass tufts along the ground line, `count` of them between x0 and x1. */
export const Grass: React.FC<{ground: (x: number) => number; x0: number; x1: number; count: number; opacity?: number; seed?: number}> = ({ground, x0, x1, count, opacity = 1, seed = 0}) => (
	<g opacity={opacity} stroke="#5E8C3E" strokeWidth={2.2} strokeLinecap="round" fill="none">
		{Array.from({length: count}, (_, index) => {
			const x = x0 + (x1 - x0) * ((index + noise(seed + index)) / count);
			const y = ground(x);
			return <path key={index} d={`M${x - 5} ${y} l-3 -9 M${x} ${y} l0 -12 M${x + 5} ${y} l3 -9`} />;
		})}
	</g>
);

/** Soft sky from blue to pale, over the whole scene. */
export const Sky: React.FC<{colourTop?: string; colourBottom?: string}> = ({colourTop = '#BFDDF3', colourBottom = '#F1F7FB'}) => {
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	return (
		<>
			<defs>
				<linearGradient id={`ps${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={colourTop} />
					<stop offset="1" stopColor={colourBottom} />
				</linearGradient>
			</defs>
			<rect x={SCENE.left - 400} y={SCENE.top - 400} width={SCENE.right - SCENE.left + 800} height={SCENE.bottom - SCENE.top + 800} fill={`url(#ps${id})`} />
		</>
	);
};
