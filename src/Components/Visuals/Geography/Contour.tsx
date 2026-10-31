import React, {useId} from 'react';
import {easeFrom, smoothStep} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {H, pathOf, Tag, usePartLook, W, World} from '../VisualWorld';

// ---------------------------------------------------------------- contour map and profile

type Contour = Extract<CourseVisual, {kind: 'contour'}>;

/** The map's part of the world: 1000 x 360 on top; the profile sits under it. */
const MAP_H = 360;
/** Where the sea meets the land at height y: a wavy coast on the west. */
const coastAt = (y: number) => 80 + 28 * Math.sin(y / 46) + 14 * Math.sin(y / 17);
/**
 * A made-up landscape, in metres: a coastal plain rising inland, a low hill in the west, a high mountain in the east
 * with a steep western face and a long gentle eastern slope, a saddle between them and a valley cut by a river
 * running south. Every value is drawn from this one function, so the contours, the colours and the profile agree.
 */
export const terrainHeight = (x: number, y: number): number => {
	const coast = coastAt(y);
	const base = x >= coast ? 260 * (1 - Math.exp(-(x - coast) / 170)) : (x - coast) * 2.4;
	const east = x - 650;
	const high = 1000 * Math.exp(-((east * east) / (east < 0 ? 95 * 95 : 235 * 235) + ((y - 170) * (y - 170)) / (105 * 105)));
	const low = 620 * Math.exp(-(((x - 330) * (x - 330)) / (115 * 115) + ((y - 140) * (y - 140)) / (95 * 95)));
	// The valley: a trough along the river from the map's southern edge up towards the saddle, deepest downstream.
	const [px, py, qx, qy] = [470, 372, 520, 190];
	const along = Math.max(0, Math.min(1, ((x - px) * (qx - px) + (y - py) * (qy - py)) / ((qx - px) ** 2 + (qy - py) ** 2)));
	const distance = Math.hypot(x - (px + along * (qx - px)), y - (py + along * (qy - py)));
	// Narrow and deep, so the contours bend into sharp Vs pointing upstream.
	const valley = (150 * Math.exp(-((distance / 20) ** 2)) + 120 * Math.exp(-((distance / 55) ** 2))) * (1 - smoothStep(along) * 0.8);
	// Land stays above the sea: the valley floor never dips below 0 m inland.
	const height = base + high + low - valley;
	return x >= coast ? Math.max(height, 10) : height;
};

/** Contour segments of `levels` over the map by marching squares, as one path per level. */
const contourPaths = (levels: readonly number[], step = 5): Map<number, string> => {
	const columns = Math.floor(W / step) + 1;
	const rows = Math.floor(MAP_H / step) + 1;
	const grid = new Float64Array(columns * rows);
	for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) grid[row * columns + column] = terrainHeight(column * step, row * step);
	const paths = new Map<number, string>();
	for (const level of levels) {
		const parts: string[] = [];
		for (let row = 0; row < rows - 1; row++) {
			for (let column = 0; column < columns - 1; column++) {
				const a = grid[row * columns + column];
				const b = grid[row * columns + column + 1];
				const c = grid[(row + 1) * columns + column + 1];
				const d = grid[(row + 1) * columns + column];
				const x = column * step;
				const y = row * step;
				// Crossing points on the four edges, where the level lies between the corners.
				const edges: [number, number][] = [];
				const cross = (v1: number, v2: number, x1: number, y1: number, x2: number, y2: number) => {
					if (v1 < level !== v2 < level) {
						const t = (level - v1) / (v2 - v1);
						edges.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
					}
				};
				cross(a, b, x, y, x + step, y);
				cross(b, c, x + step, y, x + step, y + step);
				cross(c, d, x + step, y + step, x, y + step);
				cross(d, a, x, y + step, x, y);
				for (let index = 0; index + 1 < edges.length; index += 2) parts.push(`M${edges[index][0].toFixed(1)} ${edges[index][1].toFixed(1)}L${edges[index + 1][0].toFixed(1)} ${edges[index + 1][1].toFixed(1)}`);
			}
		}
		paths.set(level, parts.join(''));
	}
	return paths;
};

/** Height colours as atlases tint them (renklendirme): sea blue, lowland green, then yellow, orange and browns. */
const TINTS: [number, string][] = [
	[0, '#7FB069'],
	[200, '#B5D27A'],
	[400, '#E9D48A'],
	[600, '#E4B068'],
	[800, '#CB8A4E'],
	[1000, '#A86B3C'],
];
const tintOf = (height: number) => {
	if (height < 0) return '#9CC6EA';
	let colour = TINTS[0][1];
	for (const [from, value] of TINTS) if (height >= from) colour = value;
	return colour;
};
/** The tinted map as a picture, drawn once per page (the same for every frame). */
let tintedMap: string | null = null;
const tintImage = (): string | null => {
	if (tintedMap || typeof document === 'undefined') return tintedMap;
	const canvas = document.createElement('canvas');
	canvas.width = W / 2;
	canvas.height = MAP_H / 2;
	const context = canvas.getContext('2d');
	if (!context) return null;
	for (let y = 0; y < canvas.height; y++) {
		for (let x = 0; x < canvas.width; x++) {
			context.fillStyle = tintOf(terrainHeight(x * 2 + 1, y * 2 + 1));
			context.fillRect(x, y, 1, 1);
		}
	}
	tintedMap = canvas.toDataURL('image/png');
	return tintedMap;
};

const A_POINT: [number, number] = [105, 222];
const B_POINT: [number, number] = [935, 176];

/**
 * A contour (izohips) map of a made-up landscape with, under it, the profile along A–B drawn the way the lesson
 * teaches: drop a line from every contour the A–B line crosses to its height, then join the points. Parts:
 * izohips (the contours), renk (height colours), kiyi (the 0 m coast), zirve (the summit), dik (close contours,
 * steep slope), yatik (far apart, gentle), vadi (a valley: contours bend into a V pointing upstream), boyun (the
 * saddle), ab (the A–B line), izdusum (the dropped lines), profil (the profile).
 */
export const ContourVisual: React.FC<VisualBoxProps & {visual: Contour}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.4, 0.7);
	const lines = usePartLook('izohips', enter(0));
	const tint = usePartLook('renk', visual.tint ? enter(0.5) : 0);
	const coast = usePartLook('kiyi', enter(1));
	const summit = usePartLook('zirve', enter(1.5));
	const steep = usePartLook('dik', visual.notes ? enter(2) : 0);
	const gentle = usePartLook('yatik', visual.notes ? enter(2.3) : 0);
	const valley = usePartLook('vadi', visual.notes ? enter(2.6) : 0);
	const saddle = usePartLook('boyun', visual.notes ? enter(2.9) : 0);
	const line = usePartLook('ab', visual.profile ? enter(3.2) : 0);
	const drops = usePartLook('izdusum', visual.profile ? enter(3.6) : 0);
	const profile = usePartLook('profil', visual.profile ? enter(4) : 0);

	const levels = React.useMemo(() => Array.from({length: Math.floor(1400 / visual.interval)}, (_, index) => (index + 1) * visual.interval), [visual.interval]);
	const paths = React.useMemo(() => contourPaths([0, ...levels]), [levels]);
	const image = visual.tint ? tintImage() : null;
	// The summit: the highest point of the field.
	const top = React.useMemo(() => {
		let best = {x: 0, y: 0, h: -Infinity};
		for (let x = 0; x <= W; x += 4) for (let y = 0; y <= MAP_H; y += 4) {
			const h = terrainHeight(x, y);
			if (h > best.h) best = {x, y, h};
		}
		return best;
	}, []);
	const summitHeight = Math.floor(top.h / 10) * 10;
	// The saddle: the lowest point on the ridge between the two hills.
	const pass = React.useMemo(() => {
		let best = {x: 0, y: 150, h: Infinity};
		for (let x = 380; x <= 600; x += 2) {
			let ridge = {y: 0, h: -Infinity};
			for (let y = 100; y <= 220; y += 2) {
				const h = terrainHeight(x, y);
				if (h > ridge.h) ridge = {y, h};
			}
			if (ridge.h < best.h) best = {x, y: ridge.y, h: ridge.h};
		}
		return best;
	}, []);
	// Where each contour value is written: on the gentle eastern slope, where the lines are far apart.
	const valueSpots = React.useMemo(() => {
		// Along a row just south of the summit, from its highest point eastwards: each contour is written where
		// the ground first drops below it, so only contours the row really crosses are named.
		const row = top.y + 40;
		let start = top.x;
		for (let x = top.x - 60; x <= top.x + 120; x += 2) if (terrainHeight(x, row) > terrainHeight(start, row)) start = x;
		return levels.flatMap((level) => {
			if (terrainHeight(start, row) <= level) return [];
			for (let x = start; x < W - 30; x += 1) if (terrainHeight(x, row) < level) return [{level, x}];
			return [];
		});
	}, [levels, top]);

	// The profile, under the map: the same x, heights 0–1400 m between y 588 and 404.
	const profileTop = 404;
	const profileBottom = 588;
	const yOf = (h: number) => profileBottom - (Math.max(0, h) / 1400) * (profileBottom - profileTop);
	const samples = Array.from({length: 241}, (_, index) => {
		const t = index / 240;
		const x = A_POINT[0] + (B_POINT[0] - A_POINT[0]) * t;
		const y = A_POINT[1] + (B_POINT[1] - A_POINT[1]) * t;
		return {x, y, h: terrainHeight(x, y)};
	});
	const crossings: {x: number; y: number; level: number}[] = [];
	for (let index = 1; index < samples.length; index++) {
		const previous = samples[index - 1];
		const next = samples[index];
		for (const level of [0, ...levels]) {
			if (previous.h < level !== next.h < level) {
				const t = (level - previous.h) / (next.h - previous.h);
				crossings.push({x: previous.x + (next.x - previous.x) * t, y: previous.y + (next.y - previous.y) * t, level});
			}
		}
	}
	const profilePath = pathOf(samples.map((sample) => [sample.x, yOf(sample.h)] as const));
	const shift = 0;
	const strokeFor = (level: number) => (level % (visual.interval * 5) === 0 ? 2.8 : 1.6);

	return (
		<World width={width} height={height} viewHeight={visual.profile ? H : MAP_H}>
			<defs>
				<clipPath id={`contourMap${id}`}>
					<rect x={0} y={0} width={W} height={MAP_H} rx={18} />
				</clipPath>
			</defs>
			<g transform={`translate(0 ${shift})`}>
				<g clipPath={`url(#contourMap${id})`}>
					{/* Land and sea, plain or tinted by height. */}
					<rect x={0} y={0} width={W} height={MAP_H} fill="#F4F1E8" />
					<path d={pathOf([...Array.from({length: 73}, (_, index) => [coastAt(index * 5), index * 5] as const), [0, MAP_H], [0, 0]], true)} fill="#BFDDF3" />
					{image ? <image href={image} x={0} y={0} width={W} height={MAP_H} opacity={tint.opacity} preserveAspectRatio="none" /> : null}
					{/* The contours, the coast and the river. */}
					<g opacity={lines.opacity}>
						{levels.map((level) => (
							<path key={level} d={paths.get(level)} fill="none" stroke={lines.focused > 0.5 ? palette.lesson : '#7A4E2A'} strokeWidth={strokeFor(level) * (1 + 0.4 * lines.focused)} strokeLinecap="round" />
						))}
					</g>
					<path d={paths.get(0)} fill="none" stroke={coast.focused > 0.5 ? palette.lesson : C.waterDeep} strokeWidth={coast.focused > 0.5 ? 5 : 3} opacity={coast.opacity} />
					<path d="M470 372 C480 330 500 280 512 212" fill="none" stroke={C.water} strokeWidth={4} strokeLinecap="round" opacity={lines.opacity} />
				</g>
				<rect x={0} y={0} width={W} height={MAP_H} rx={18} fill="none" stroke={palette.border} strokeWidth={2} />
				<g opacity={lines.opacity}>
					{valueSpots.map((spot) => (
						<Tag key={spot.level} x={spot.x} y={top.y + 40} text={String(spot.level)} anchor="middle" size={15} weight={700} fill="#7A4E2A" />
					))}
				</g>
				<g opacity={coast.opacity}>
					<Tag x={36} y={28} text="Deniz" anchor="middle" size={18} fill={C.waterDeep} focused={coast.focused} />
					<Tag x={coastAt(330) + 8} y={330} text="0 m kıyı" size={17} focused={coast.focused} />
				</g>
				<g opacity={summit.opacity}>
					<path d={`M${top.x} ${top.y - 12} l10 17 l-20 0 z`} fill={palette.ink} />
					<Tag x={top.x} y={top.y - 26} text={`${summitHeight} m`} anchor="middle" size={19} focused={summit.focused} />
				</g>
				{/* What the lines tell, pointed at one by one. */}
				<g opacity={steep.opacity}>
					<line x1={top.x - 125} y1={66} x2={top.x - 70} y2={top.y - 22} stroke={palette.lesson} strokeWidth={2.5} />
					<Tag x={top.x - 128} y={54} text="Sık eğriler: dik yamaç" anchor="end" size={18} focused={steep.focused} />
				</g>
				<g opacity={gentle.opacity}>
					<line x1={top.x + 200} y1={66} x2={top.x + 150} y2={top.y - 12} stroke={palette.lesson} strokeWidth={2.5} />
					<Tag x={top.x + 60} y={54} text="Seyrek eğriler: az eğimli" size={18} focused={gentle.focused} />
				</g>
				<g opacity={valley.opacity}>
					<Tag x={560} y={322} text="Vadi: V'nin ucu yükseğe bakar" size={18} focused={valley.focused} />
				</g>
				<g opacity={saddle.opacity}>
					<circle cx={pass.x} cy={pass.y} r={7} fill={palette.lesson} />
					<Tag x={pass.x} y={pass.y - 22} text="Boyun" anchor="middle" size={18} focused={saddle.focused} />
				</g>
				{/* The A–B line. */}
				<g opacity={line.opacity}>
					<line x1={A_POINT[0]} y1={A_POINT[1]} x2={B_POINT[0]} y2={B_POINT[1]} stroke={palette.ink} strokeWidth={3} strokeDasharray="10 6" />
					<circle cx={A_POINT[0]} cy={A_POINT[1]} r={7} fill={palette.ink} />
					<circle cx={B_POINT[0]} cy={B_POINT[1]} r={7} fill={palette.ink} />
					<Tag x={A_POINT[0] - 14} y={A_POINT[1]} text="A" anchor="end" size={22} focused={line.focused} />
					<Tag x={B_POINT[0] + 14} y={B_POINT[1]} text="B" size={22} focused={line.focused} />
				</g>
			</g>
			{visual.profile ? (
				<g>
					{/* The profile's frame: heights on the left. */}
					<g opacity={Math.max(drops.opacity, profile.opacity)}>
						<rect x={60} y={profileTop - 8} width={W - 70} height={profileBottom - profileTop + 12} rx={12} fill={withAlpha(palette.lesson, 0.04)} stroke={palette.border} strokeWidth={1.5} />
						{[0, 400, 800, 1200].map((h) => (
							<g key={h}>
								<line x1={60} y1={yOf(h)} x2={W - 10} y2={yOf(h)} stroke={palette.grid} strokeWidth={1.2} />
								<Tag x={52} y={yOf(h)} text={`${h}`} anchor="end" size={15} weight={600} fill={palette.muted} />
							</g>
						))}
						<Tag x={20} y={profileTop - 18} text="m" size={15} fill={palette.muted} />
					</g>
					{/* Dropped lines from each crossing to its height. */}
					<g opacity={drops.opacity}>
						{crossings.map((crossing, index) => (
							<g key={index}>
								<line x1={crossing.x} y1={crossing.y} x2={crossing.x} y2={yOf(crossing.level)} stroke={palette.muted} strokeWidth={1.4} strokeDasharray="4 5" />
								<circle cx={crossing.x} cy={yOf(crossing.level)} r={4} fill={palette.lesson} />
							</g>
						))}
					</g>
					{/* The profile, drawn from A to B. */}
					<path d={`${profilePath} L${B_POINT[0]} ${profileBottom} L${A_POINT[0]} ${profileBottom} Z`} fill={withAlpha('#A86B3C', 0.18)} opacity={profile.opacity} />
					<path d={profilePath} fill="none" stroke={profile.focused > 0.5 ? palette.lesson : '#7A4E2A'} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - profile.drawn} opacity={profile.drawn > 0 ? Math.max(0.35, profile.opacity / Math.max(profile.drawn, 0.01)) : 0} />
					<g opacity={profile.opacity}>
						<Tag x={A_POINT[0]} y={profileBottom + 4} text="A" anchor="middle" size={20} />
						<Tag x={B_POINT[0]} y={profileBottom + 4} text="B" anchor="middle" size={20} />
					</g>
				</g>
			) : null}
		</World>
	);
};
