import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {CELL_DEFAULT_LABELS, CELL_STAGE, CELL_TYPE_PARTS} from './BiologySchema';
import {type CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

// ---------------------------------------------------------------- a cell and its organelles

type Cell = Extract<CourseVisual, {kind: 'cell'}>;
type CellType = Cell['type'];
type Point = [number, number];

/** Textbook colours of the organelles: each its own hue, so they read apart at a glance. */
export const ORGANELLE_COLORS = {
	cytoplasm: '#F4F8EE',
	nucleus: '#DCCFEE',
	nucleusEdge: '#6E55A0',
	nucleolus: '#6E55A0',
	chromatin: '#9682C4',
	er: '#8DB3DE',
	erEdge: '#4F7DB5',
	ribosome: '#2E3A55',
	golgi: '#EDB650',
	golgiEdge: '#B9841E',
	lysosome: '#EC8B76',
	lysosomeEdge: '#B4472F',
	mitochondrion: '#F3A867',
	mitochondrionEdge: '#B9632A',
	chloroplast: '#7CC36A',
	chloroplastEdge: '#3F7F31',
	grana: '#2F6A24',
	vacuole: '#D3ECF7',
	vacuoleEdge: '#6FA9CC',
	centriole: '#4F7D2E',
	wall: '#A8C05F',
	wallEdge: '#6B8A2C',
	capsule: '#F1E7C4',
	capsuleEdge: '#BCA867',
	dna: '#6E55A0',
	flagellum: '#5B6475',
	skeleton: '#3C465A',
} as const;
const C = ORGANELLE_COLORS;

const NAMES: Record<string, string> = {
	zar: 'Hücre zarı',
	cidar: 'Hücre duvarı',
	kapsul: 'Kapsül',
	sitoplazma: 'Sitoplazma',
	cekirdek: 'Çekirdek',
	cekirdekcik: 'Çekirdekçik',
	ribozom: 'Ribozom',
	ger: 'Granüllü ER',
	der: 'Granülsüz ER',
	golgi: 'Golgi aygıtı',
	lizozom: 'Lizozom',
	mitokondri: 'Mitokondri',
	kloroplast: 'Kloroplast',
	koful: 'Koful',
	sentrozom: 'Sentrozom',
	iskelet: 'Hücre iskeleti',
	dna: 'DNA',
	plazmit: 'Plazmit',
	kamci: 'Kamçı',
};
const nameOf = (part: string, type: CellType) => (part === 'koful' && type === 'plant' ? 'Merkezi koful' : (NAMES[part] ?? part));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];

/** A deterministic scatter: the same ribosomes in the same places on every frame and every render. */
const scatter = (count: number, inside: (x: number, y: number) => boolean, avoid: [number, number, number][], seed: number): Point[] => {
	let state = seed;
	const next = () => (state = (state * 16807) % 2147483647) / 2147483647;
	const points: Point[] = [];
	for (let tries = 0; points.length < count && tries < count * 60; tries++) {
		const x = 120 + next() * 760;
		const y = 60 + next() * 520;
		if (!inside(x, y)) continue;
		if (avoid.some(([ax, ay, r]) => Math.hypot(x - ax, y - ay) < r)) continue;
		if (points.some(([px, py]) => Math.hypot(x - px, y - py) < 26)) continue;
		points.push([x, y]);
	}
	return points;
};

/** Where things sit in each cell type, in stage units (1000 × 640). */
const ANIMAL = {
	body: {cx: 500, cy: 320, rx: 255, ry: 228},
	nucleus: {x: 470, y: 300, r: 82},
	er: {radii: [100, 118, 136], from: 5, to: 95},
	ser: {x: 305, y: 395},
	golgi: {x: 668, y: 420, scale: 1},
	mitochondria: [
		[330, 205, -25],
		[655, 205, 20],
		[360, 465, 15],
	] as [number, number, number][],
	lysosomes: [
		[590, 500, 18],
		[285, 330, 16],
	] as [number, number, number][],
	vacuoles: [[470, 505, 18]] as [number, number, number][],
	centrosome: {x: 590, y: 232},
	skeleton: [
		[
			[280, 175],
			[420, 135],
		],
		[
			[560, 128],
			[700, 205],
		],
		[
			[268, 430],
			[380, 525],
		],
		[
			[620, 525],
			[722, 405],
		],
		[
			[600, 300],
			[735, 330],
		],
	] as Point[][],
	anchors: {
		zar: [262, 245],
		sitoplazma: [420, 168],
		cekirdek: [412, 242],
		cekirdekcik: [490, 290],
		ribozom: [545, 165],
		ger: [553, 383],
		der: [305, 395],
		golgi: [668, 410],
		lizozom: [590, 500],
		mitokondri: [655, 205],
		koful: [470, 505],
		sentrozom: [590, 232],
		iskelet: [705, 323],
	} as Record<string, Point>,
	labelX: {left: 205, right: 795},
};
const PLANT = {
	wall: {x: 215, y: 70, w: 570, h: 500},
	nucleus: {x: 335, y: 200, r: 60},
	er: {radii: [72, 86, 100], from: -30, to: 60},
	ser: {x: 300, y: 418},
	golgi: {x: 440, y: 120, scale: 0.75},
	vacuole: {cx: 548, cy: 345, rx: 168, ry: 158},
	mitochondria: [
		[530, 116, 0],
		[742, 470, 90],
	] as [number, number, number][],
	chloroplasts: [
		[290, 320, 90],
		[290, 485, 75],
		[455, 532, 0],
		[640, 532, 0],
		[740, 320, 90],
		[705, 140, 15],
	] as [number, number, number][],
	skeleton: [
		[
			[246, 250],
			[256, 300],
		],
		[
			[248, 380],
			[256, 440],
		],
		[
			[760, 190],
			[764, 250],
		],
		[
			[600, 98],
			[680, 100],
		],
	] as Point[][],
	anchors: {
		cidar: [785, 230],
		zar: [233, 250],
		sitoplazma: [258, 360],
		cekirdek: [300, 158],
		cekirdekcik: [345, 196],
		ribozom: [255, 210],
		ger: [416, 229],
		der: [300, 418],
		golgi: [440, 112],
		mitokondri: [530, 116],
		kloroplast: [740, 320],
		koful: [610, 300],
		iskelet: [252, 420],
	} as Record<string, Point>,
	labelX: {left: 190, right: 810},
};
const PROKARYOTE = {
	body: {x: 250, y: 225, w: 480, h: 190},
	plasmids: [
		[612, 282, 14],
		[632, 365, 11],
	] as [number, number, number][],
	anchors: {
		kapsul: [420, 207],
		cidar: [600, 226],
		zar: [380, 401],
		sitoplazma: [320, 330],
		ribozom: [560, 300],
		dna: [470, 300],
		plazmit: [612, 282],
		kamci: [830, 505],
	} as Record<string, Point>,
	labelX: {left: 205, right: 795},
};

const insideEllipse = (x: number, y: number, e: {cx: number; cy: number; rx: number; ry: number}, margin = 0) => ((x - e.cx) / (e.rx - margin)) ** 2 + ((y - e.cy) / (e.ry - margin)) ** 2 < 1;
const ANIMAL_RIBOSOMES: Point[] = [
	[545, 165],
	...scatter(
		30,
		(x, y) => insideEllipse(x, y, ANIMAL.body, 30),
		[
			[ANIMAL.nucleus.x, ANIMAL.nucleus.y, 150],
			[668, 420, 70],
			[330, 205, 50],
			[655, 205, 50],
			[360, 465, 50],
			[590, 500, 30],
			[285, 330, 30],
			[470, 505, 30],
			[590, 240, 36],
			[305, 395, 52],
			[545, 165, 20],
		],
		11,
	),
];
const PLANT_RIBOSOMES: Point[] = [
	[255, 210],
	...scatter(
		18,
		(x, y) => x > 250 && x < 750 && y > 104 && y < 536 && !insideEllipse(x, y, PLANT.vacuole, -18),
		[[PLANT.nucleus.x, PLANT.nucleus.y, 115], [440, 120, 50], [530, 116, 50], [742, 470, 50], [300, 418, 46], ...PLANT.chloroplasts.map(([x, y]) => [x, y, 44] as [number, number, number]), [255, 210, 20]],
		29,
	),
];
const PROKARYOTE_RIBOSOMES: Point[] = [
	[560, 300],
	...scatter(
		16,
		(x, y) => x > 290 && x < 690 && y > 255 && y < 385,
		[
			[470, 320, 75],
			[612, 282, 24],
			[632, 365, 20],
			[560, 300, 20],
		],
		7,
	),
];

/** A smooth closed path through points (Catmull-Rom as cubic Béziers). */
const closedPath = (points: Point[]) => {
	const n = points.length;
	let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
	for (let i = 0; i < n; i++) {
		const [p0, p1, p2, p3] = [points[(i - 1 + n) % n], points[i], points[(i + 1) % n], points[(i + 2) % n]];
		const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return `${d} Z`;
};
/** The animal cell's outline: an ellipse with a soft wobble, as a living cell has no fixed shape. */
const animalOutline = (inset = 0) => {
	const {cx, cy, rx, ry} = ANIMAL.body;
	return closedPath(
		Array.from({length: 24}, (_, k) => {
			const a = (k / 24) * Math.PI * 2;
			const wobble = 1 + 0.025 * Math.sin(3 * a) + 0.015 * Math.cos(5 * a);
			return [cx + (rx - inset) * wobble * Math.cos(a), cy + (ry - inset) * wobble * Math.sin(a)] as Point;
		}),
	);
};
const pill = (x: number, y: number, w: number, h: number) => {
	const r = h / 2;
	return `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

/** Spreads one column of labels so none overlaps, keeping each as near its organelle as it can. */
export const spreadLabels = (ys: number[], gap: number, top: number, bottom: number): number[] => {
	const order = ys.map((y, index) => ({y, index})).sort((a, b) => a.y - b.y);
	const placed = order.map((item) => item.y);
	for (let i = 0; i < placed.length; i++) placed[i] = Math.max(placed[i], i === 0 ? top : placed[i - 1] + gap);
	const overflow = placed.length ? placed[placed.length - 1] - bottom : 0;
	if (overflow > 0) for (let i = placed.length - 1; i >= 0; i--) placed[i] = Math.min(placed[i] - (i === placed.length - 1 ? overflow : 0), i === placed.length - 1 ? bottom : placed[i + 1] - gap);
	const result: number[] = new Array(ys.length);
	order.forEach((item, i) => (result[item.index] = Math.max(top, placed[i])));
	return result;
};

/** One organelle: it comes in after the cell, stands out (grows a little, with a soft glow) while a beat points at it. */
const Organelle: React.FC<{
	id: string;
	order: number;
	delay: number;
	center: Point;
	glow?: [number, number];
	grow?: boolean;
	children: (focus: number) => React.ReactNode;
}> = ({id, order, delay, center, glow, grow = true, children}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const look = usePartLook(id, easeFrom(seconds, delay + order * 0.14, 0.5));
	const scale = grow ? 1 + 0.12 * look.focused : 1;
	const [cx, cy] = center;
	return (
		<g opacity={look.opacity} transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
			{glow && look.focused > 0.02 ? <ellipse cx={cx} cy={cy} rx={glow[0]} ry={glow[1]} fill={withAlpha(palette.lesson, 0.28 * look.focused)} /> : null}
			{children(look.focused)}
		</g>
	);
};

const Mitochondrion: React.FC<{x: number; y: number; angle: number}> = ({x, y, angle}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle})`}>
		<rect x={-42} y={-20} width={84} height={40} rx={20} fill={C.mitochondrion} stroke={C.mitochondrionEdge} strokeWidth={3} />
		<polyline points="-31,0 -25,-12 -17,11 -9,-12 -1,11 7,-12 15,11 23,-12 31,0" fill="none" stroke={C.mitochondrionEdge} strokeWidth={3} strokeLinejoin="round" />
	</g>
);
const Chloroplast: React.FC<{x: number; y: number; angle: number}> = ({x, y, angle}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle})`}>
		<ellipse rx={36} ry={18} fill={C.chloroplast} stroke={C.chloroplastEdge} strokeWidth={3} />
		{[-17, 0, 17].map((dx) => [-5, 0, 5].map((dy) => <rect key={`${dx}${dy}`} x={dx - 6} y={dy - 1.6} width={12} height={3.4} rx={1.5} fill={C.grana} />))}
	</g>
);
const Golgi: React.FC<{x: number; y: number; scale: number}> = ({x, y, scale}) => (
	<g transform={`translate(${x} ${y}) scale(${scale})`}>
		{[0, 1, 2, 3].map((i) => {
			const w = 112 - 16 * i;
			return <path key={i} d={`M${-w / 2} ${i * 14} Q0 ${i * 14 - 24} ${w / 2} ${i * 14}`} fill="none" stroke={C.golgi} strokeWidth={10} strokeLinecap="round" />;
		})}
		{[0, 1, 2, 3].map((i) => {
			const w = 112 - 16 * i;
			return <path key={`e${i}`} d={`M${-w / 2} ${i * 14} Q0 ${i * 14 - 24} ${w / 2} ${i * 14}`} fill="none" stroke={C.golgiEdge} strokeWidth={2} strokeLinecap="round" opacity={0.6} />;
		})}
		{[
			[62, -12, 7],
			[72, 12, 6],
			[-64, 30, 6],
			[54, 40, 5],
		].map(([vx, vy, r], i) => (
			<circle key={`v${i}`} cx={vx} cy={vy} r={r} fill={C.golgi} stroke={C.golgiEdge} strokeWidth={1.6} />
		))}
	</g>
);
const Nucleus: React.FC<{
	x: number;
	y: number;
	r: number;
	part: 'cekirdek' | 'cekirdekcik';
}> = ({x, y, r, part}) =>
	part === 'cekirdek' ? (
		<g>
			<circle cx={x} cy={y} r={r} fill={C.nucleus} stroke={C.nucleusEdge} strokeWidth={4} strokeDasharray="42 7" />
			<circle cx={x} cy={y} r={r - 8} fill="none" stroke={C.nucleusEdge} strokeWidth={2.4} strokeDasharray="38 9" opacity={0.8} />
			{[
				[-40, -20, 30],
				[10, 32, -20],
				[-18, 40, 50],
				[28, -40, 10],
			].map(([dx, dy, a], i) => (
				<path key={i} d={`M${x + dx} ${y + dy} q12 -10 22 0 t22 0`} fill="none" stroke={C.chromatin} strokeWidth={3} strokeLinecap="round" transform={`rotate(${a} ${x + dx} ${y + dy})`} />
			))}
		</g>
	) : (
		<circle cx={x + r * 0.24} cy={y - r * 0.12} r={r * 0.3} fill={C.nucleolus} />
	);
const RoughER: React.FC<{
	x: number;
	y: number;
	radii: readonly number[];
	from: number;
	to: number;
}> = ({x, y, radii, from, to}) => {
	const arc = (r: number) => {
		const a0 = (from * Math.PI) / 180;
		const a1 = (to * Math.PI) / 180;
		return `M${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)}`;
	};
	return (
		<g>
			{radii.map((r) => (
				<g key={r}>
					<path d={arc(r)} fill="none" stroke={C.erEdge} strokeWidth={11} strokeLinecap="round" />
					<path d={arc(r)} fill="none" stroke={C.er} strokeWidth={7} strokeLinecap="round" />
					{Array.from({length: 9}, (_, k) => {
						const a = ((from + ((to - from) * (k + 0.5)) / 9) * Math.PI) / 180;
						return <circle key={k} cx={x + (r + 8) * Math.cos(a)} cy={y + (r + 8) * Math.sin(a)} r={3} fill={C.ribosome} />;
					})}
				</g>
			))}
		</g>
	);
};
const SmoothER: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		{[-15, 0, 15].map((dy) => (
			<g key={dy}>
				<path d={`M${x - 40} ${y + dy} q10 -9 20 0 t20 0 t20 0 t20 0`} fill="none" stroke={C.erEdge} strokeWidth={9} strokeLinecap="round" />
				<path d={`M${x - 40} ${y + dy} q10 -9 20 0 t20 0 t20 0 t20 0`} fill="none" stroke={C.er} strokeWidth={5} strokeLinecap="round" />
			</g>
		))}
	</g>
);
const Centrosome: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<g transform={`translate(${x - 16} ${y})`}>
			<rect x={-16} y={-6} width={32} height={12} rx={3} fill={C.centriole} />
			{[-9, 0, 9].map((dx) => (
				<line key={dx} x1={dx} x2={dx} y1={-6} y2={6} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.7} />
			))}
		</g>
		<g transform={`translate(${x + 10} ${y + 14}) rotate(90)`}>
			<rect x={-16} y={-6} width={32} height={12} rx={3} fill={C.centriole} />
			{[-9, 0, 9].map((dx) => (
				<line key={dx} x1={dx} x2={dx} y1={-6} y2={6} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.7} />
			))}
		</g>
	</g>
);
const Lysosome: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
	<g>
		<circle cx={x} cy={y} r={r} fill={C.lysosome} stroke={C.lysosomeEdge} strokeWidth={2.5} />
		{[
			[-5, -4],
			[5, -2],
			[-1, 6],
			[4, 5],
		].map(([dx, dy], i) => (
			<circle key={i} cx={x + dx} cy={y + dy} r={1.8} fill={C.lysosomeEdge} />
		))}
	</g>
);
const Ribosomes: React.FC<{points: Point[]; focus: number}> = ({points, focus}) => (
	<g>
		{points.map(([x, y], i) => (
			<circle key={i} cx={x} cy={y} r={3.6 + 1.6 * focus} fill={C.ribosome} />
		))}
	</g>
);
const Skeleton: React.FC<{lines: Point[][]; focus: number}> = ({lines, focus}) => (
	<g>
		{lines.map((line, i) => (
			<polyline key={i} points={line.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.skeleton} strokeWidth={2 + 2 * focus} strokeDasharray="10 6" opacity={0.25 + 0.6 * focus} />
		))}
	</g>
);

/** The labels: names (or I, II…) in two columns, each joined to its organelle by a leader line. */
const Labels: React.FC<{
	type: CellType;
	parts: string[];
	anchors: Record<string, Point>;
	labelX: {left: number; right: number};
	numbered: boolean;
	delay: number;
}> = ({type, parts, anchors, labelX, numbered, delay}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const sides = {left: [] as number[], right: [] as number[]};
	parts.forEach((part, index) => sides[anchors[part][0] < CELL_STAGE.width / 2 ? 'left' : 'right'].push(index));
	const ys: number[] = new Array(parts.length);
	for (const side of ['left', 'right'] as const) {
		const placed = spreadLabels(
			sides[side].map((index) => anchors[parts[index]][1]),
			54,
			CELL_STAGE.top + 16,
			CELL_STAGE.top + CELL_STAGE.height - 14,
		);
		sides[side].forEach((index, k) => (ys[index] = placed[k]));
	}
	return (
		<g>
			{parts.map((part, index) => (
				<LabelLine
					key={part}
					id={part}
					text={numbered ? ROMAN[index] : nameOf(part, type)}
					anchor={anchors[part]}
					y={ys[index]}
					x={anchors[part][0] < CELL_STAGE.width / 2 ? labelX.left : Math.max(labelX.right, anchors[part][0] + 26)}
					left={anchors[part][0] < CELL_STAGE.width / 2}
					entrance={easeFrom(seconds, delay + 1.2 + index * 0.12, 0.4)}
					palette={palette}
				/>
			))}
		</g>
	);
};
const LabelLine: React.FC<{
	id: string;
	text: string;
	anchor: Point;
	x: number;
	y: number;
	left: boolean;
	entrance: number;
	palette: ReturnType<typeof useVisualPalette>;
}> = ({id, text, anchor, x, y, left, entrance, palette}) => {
	const look = usePartLook(id, entrance);
	const lit = look.focused;
	const colour = lit > 0.5 ? palette.lesson : palette.ink;
	const end = left ? x + 10 : x - 10;
	return (
		<g opacity={look.opacity}>
			<polyline points={`${anchor[0]},${anchor[1]} ${(anchor[0] + end) / 2},${y} ${end},${y}`} fill="none" stroke={colour} strokeWidth={2 + 1.5 * lit} opacity={0.75} />
			<circle cx={anchor[0]} cy={anchor[1]} r={4.5 + 2 * lit} fill={colour} stroke={palette.surface} strokeWidth={1.5} />
			<text
				x={x}
				y={y}
				textAnchor={left ? 'end' : 'start'}
				dominantBaseline="middle"
				fontSize={28 * (1 + 0.1 * lit)}
				fontWeight={lit > 0.5 ? 800 : 700}
				fill={colour}
				stroke={palette.surface}
				strokeWidth={6}
				strokeLinejoin="round"
				paintOrder="stroke"
				fontFamily={palette.fontBody}
			>
				{text}
			</text>
		</g>
	);
};

/**
 * A cell drawn as the textbooks draw it. Animal: an outline that wobbles a little, the nucleus with its double
 * membrane, pores and nucleolus, rough ER beside it with ribosomes on it, smooth ER, the Golgi stack with vesicles,
 * mitochondria with their cristae, lysosomes, a small vacuole, the centrosome's two centrioles at right angles,
 * free ribosomes and the cytoskeleton. Plant: the wall around the membrane, a central vacuole pushing the nucleus
 * aside, chloroplasts with grana, no centrosome or lysosome. Prokaryote: a capsule, wall and membrane, DNA lying
 * free with plasmids, ribosomes and a flagellum, nothing membrane-bound. Organelles come in one after another;
 * beats point at them by name (CELL_TYPE_PARTS).
 */
export const CellVisual: React.FC<VisualBoxProps & {visual: Cell}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const type = visual.type;
	const shown = (part: string) => !visual.hide.includes(part as never);
	const parts = CELL_TYPE_PARTS[type] as readonly string[];
	const order = (part: string) => Math.max(0, parts.indexOf(part));
	const labels = (visual.labels ?? CELL_DEFAULT_LABELS[type]).filter((part) => parts.includes(part) && shown(part));
	const d = delaySeconds;
	const membrane = (focus: number) => ({
		stroke: palette.lesson,
		strokeWidth: 5 + 3 * focus,
	});

	if (type === 'animal') {
		const A = ANIMAL;
		return (
			<World width={width} height={height} viewWidth={CELL_STAGE.width} viewHeight={CELL_STAGE.height}>
				<g transform={`translate(0 ${-CELL_STAGE.top})`}>
					<path d={animalOutline()} fill={C.cytoplasm} />
					{shown('sitoplazma') ? (
						<Organelle id="sitoplazma" order={0} delay={d} center={[500, 320]} grow={false}>
							{(f) => <path d={animalOutline()} fill={withAlpha(palette.lesson, 0.06 + 0.16 * f)} />}
						</Organelle>
					) : null}
					{shown('iskelet') ? (
						<Organelle id="iskelet" order={order('iskelet')} delay={d} center={[500, 320]} grow={false}>
							{(f) => <Skeleton lines={A.skeleton} focus={f} />}
						</Organelle>
					) : null}
					{shown('ger') ? (
						<Organelle id="ger" order={order('ger')} delay={d} center={[A.nucleus.x + 90, A.nucleus.y + 70]} glow={[95, 80]}>
							{() => <RoughER x={A.nucleus.x} y={A.nucleus.y} {...A.er} />}
						</Organelle>
					) : null}
					{shown('cekirdek') ? (
						<Organelle id="cekirdek" order={order('cekirdek')} delay={d} center={[A.nucleus.x, A.nucleus.y]} glow={[A.nucleus.r + 16, A.nucleus.r + 16]}>
							{() => <Nucleus {...A.nucleus} part="cekirdek" />}
						</Organelle>
					) : null}
					{shown('cekirdek') && shown('cekirdekcik') ? (
						<Organelle id="cekirdekcik" order={order('cekirdekcik')} delay={d} center={[A.nucleus.x + 20, A.nucleus.y - 10]} glow={[34, 34]}>
							{() => <Nucleus {...A.nucleus} part="cekirdekcik" />}
						</Organelle>
					) : null}
					{shown('der') ? (
						<Organelle id="der" order={order('der')} delay={d} center={[A.ser.x, A.ser.y]} glow={[58, 36]}>
							{() => <SmoothER {...A.ser} />}
						</Organelle>
					) : null}
					{shown('golgi') ? (
						<Organelle id="golgi" order={order('golgi')} delay={d} center={[A.golgi.x, A.golgi.y + 15]} glow={[80, 48]}>
							{() => <Golgi {...A.golgi} />}
						</Organelle>
					) : null}
					{shown('mitokondri')
						? A.mitochondria.map(([x, y, a], i) => (
								<Organelle key={i} id="mitokondri" order={order('mitokondri') + i * 0.3} delay={d} center={[x, y]} glow={[56, 38]}>
									{() => <Mitochondrion x={x} y={y} angle={a} />}
								</Organelle>
							))
						: null}
					{shown('lizozom')
						? A.lysosomes.map(([x, y, r], i) => (
								<Organelle key={i} id="lizozom" order={order('lizozom')} delay={d} center={[x, y]} glow={[r + 12, r + 12]}>
									{() => <Lysosome x={x} y={y} r={r} />}
								</Organelle>
							))
						: null}
					{shown('koful')
						? A.vacuoles.map(([x, y, r], i) => (
								<Organelle key={i} id="koful" order={order('koful')} delay={d} center={[x, y]} glow={[r + 12, r + 12]}>
									{() => <circle cx={x} cy={y} r={r} fill={C.vacuole} stroke={C.vacuoleEdge} strokeWidth={2.5} />}
								</Organelle>
							))
						: null}
					{shown('sentrozom') ? (
						<Organelle id="sentrozom" order={order('sentrozom')} delay={d} center={[A.centrosome.x, A.centrosome.y + 6]} glow={[40, 34]}>
							{() => <Centrosome {...A.centrosome} />}
						</Organelle>
					) : null}
					{shown('ribozom') ? (
						<Organelle id="ribozom" order={order('ribozom')} delay={d} center={[500, 320]} grow={false}>
							{(f) => <Ribosomes points={ANIMAL_RIBOSOMES} focus={f} />}
						</Organelle>
					) : null}
					{shown('zar') ? (
						<Organelle id="zar" order={0} delay={d} center={[500, 320]} grow={false}>
							{(f) => <path d={animalOutline()} fill="none" {...membrane(f)} />}
						</Organelle>
					) : null}
					<Labels type={type} parts={labels} anchors={A.anchors} labelX={A.labelX} numbered={visual.numbered} delay={d} />
				</g>
			</World>
		);
	}

	if (type === 'plant') {
		const P = PLANT;
		const {x, y, w, h} = P.wall;
		return (
			<World width={width} height={height} viewWidth={CELL_STAGE.width} viewHeight={CELL_STAGE.height}>
				<g transform={`translate(0 ${-CELL_STAGE.top})`}>
					{shown('cidar') ? (
						<Organelle id="cidar" order={0} delay={d} center={[500, 320]} grow={false}>
							{(f) => <rect x={x} y={y} width={w} height={h} rx={28} fill={C.wall} stroke={f > 0.5 ? palette.lesson : C.wallEdge} strokeWidth={4 + 3 * f} />}
						</Organelle>
					) : null}
					<rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={18} fill={C.cytoplasm} />
					{shown('sitoplazma') ? (
						<Organelle id="sitoplazma" order={0} delay={d} center={[500, 320]} grow={false}>
							{(f) => <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={18} fill={withAlpha(palette.lesson, 0.06 + 0.16 * f)} />}
						</Organelle>
					) : null}
					{shown('iskelet') ? (
						<Organelle id="iskelet" order={order('iskelet')} delay={d} center={[500, 320]} grow={false}>
							{(f) => <Skeleton lines={P.skeleton} focus={f} />}
						</Organelle>
					) : null}
					{shown('koful') ? (
						<Organelle id="koful" order={order('koful')} delay={d} center={[P.vacuole.cx, P.vacuole.cy]} glow={[P.vacuole.rx + 10, P.vacuole.ry + 10]}>
							{() => <ellipse {...P.vacuole} fill={C.vacuole} stroke={C.vacuoleEdge} strokeWidth={3} />}
						</Organelle>
					) : null}
					{shown('ger') ? (
						<Organelle id="ger" order={order('ger')} delay={d} center={[P.nucleus.x + 75, P.nucleus.y + 20]} glow={[60, 70]}>
							{() => <RoughER x={P.nucleus.x} y={P.nucleus.y} {...P.er} />}
						</Organelle>
					) : null}
					{shown('cekirdek') ? (
						<Organelle id="cekirdek" order={order('cekirdek')} delay={d} center={[P.nucleus.x, P.nucleus.y]} glow={[P.nucleus.r + 14, P.nucleus.r + 14]}>
							{() => <Nucleus {...P.nucleus} part="cekirdek" />}
						</Organelle>
					) : null}
					{shown('cekirdek') && shown('cekirdekcik') ? (
						<Organelle id="cekirdekcik" order={order('cekirdekcik')} delay={d} center={[P.nucleus.x + 14, P.nucleus.y - 7]} glow={[26, 26]}>
							{() => <Nucleus {...P.nucleus} part="cekirdekcik" />}
						</Organelle>
					) : null}
					{shown('der') ? (
						<Organelle id="der" order={order('der')} delay={d} center={[P.ser.x, P.ser.y]} glow={[56, 34]}>
							{() => <SmoothER {...P.ser} />}
						</Organelle>
					) : null}
					{shown('golgi') ? (
						<Organelle id="golgi" order={order('golgi')} delay={d} center={[P.golgi.x, P.golgi.y + 12]} glow={[62, 38]}>
							{() => <Golgi {...P.golgi} />}
						</Organelle>
					) : null}
					{shown('mitokondri')
						? P.mitochondria.map(([mx, my, a], i) => (
								<Organelle key={i} id="mitokondri" order={order('mitokondri') + i * 0.3} delay={d} center={[mx, my]} glow={[56, 38]}>
									{() => <Mitochondrion x={mx} y={my} angle={a} />}
								</Organelle>
							))
						: null}
					{shown('kloroplast')
						? P.chloroplasts.map(([cx, cy, a], i) => (
								<Organelle key={i} id="kloroplast" order={order('kloroplast') + i * 0.2} delay={d} center={[cx, cy]} glow={[50, 34]}>
									{() => <Chloroplast x={cx} y={cy} angle={a} />}
								</Organelle>
							))
						: null}
					{shown('ribozom') ? (
						<Organelle id="ribozom" order={order('ribozom')} delay={d} center={[500, 320]} grow={false}>
							{(f) => <Ribosomes points={PLANT_RIBOSOMES} focus={f} />}
						</Organelle>
					) : null}
					{shown('zar') ? (
						<Organelle id="zar" order={0} delay={d} center={[500, 320]} grow={false}>
							{(f) => <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={18} fill="none" {...membrane(f)} />}
						</Organelle>
					) : null}
					<Labels type={type} parts={labels} anchors={P.anchors} labelX={P.labelX} numbered={visual.numbered} delay={d} />
				</g>
			</World>
		);
	}

	const K = PROKARYOTE;
	const {x, y, w, h} = K.body;
	const t = seconds - d;
	// The flagellum leaves the cell's lower right end and beats downward, clear of the labels on the right.
	const wave = Array.from({length: 40}, (_, k) => {
		const s = k / 39;
		const along: Point = [700 + 200 * s, 395 + 170 * s];
		const swing = 15 * Math.sin(s * 12 - t * 6) * s;
		return `${(along[0] + swing * 0.65).toFixed(1)},${(along[1] - swing * 0.76).toFixed(1)}`;
	}).join(' ');
	return (
		<World width={width} height={height} viewWidth={CELL_STAGE.width} viewHeight={CELL_STAGE.height}>
			<g transform={`translate(0 ${-CELL_STAGE.top})`}>
				{shown('kamci') ? (
					<Organelle id="kamci" order={order('kamci')} delay={d} center={[800, 480]} grow={false}>
						{(f) => <polyline points={wave} fill="none" stroke={f > 0.5 ? palette.lesson : C.flagellum} strokeWidth={5 + 2 * f} strokeLinecap="round" />}
					</Organelle>
				) : null}
				{shown('kapsul') ? (
					<Organelle id="kapsul" order={0} delay={d} center={[490, 320]} grow={false}>
						{(f) => <path d={pill(x - 20, y - 20, w + 40, h + 40)} fill={C.capsule} stroke={f > 0.5 ? palette.lesson : C.capsuleEdge} strokeWidth={3 + 3 * f} strokeDasharray="12 8" />}
					</Organelle>
				) : null}
				{shown('cidar') ? (
					<Organelle id="cidar" order={0} delay={d} center={[490, 320]} grow={false}>
						{(f) => <path d={pill(x, y, w, h)} fill={C.wall} stroke={f > 0.5 ? palette.lesson : C.wallEdge} strokeWidth={3 + 3 * f} />}
					</Organelle>
				) : null}
				{shown('sitoplazma') ? (
					<Organelle id="sitoplazma" order={0} delay={d} center={[490, 320]} grow={false}>
						{(f) => <path d={pill(x + 13, y + 13, w - 26, h - 26)} fill={f > 0.5 ? withAlpha(palette.lesson, 0.18) : C.cytoplasm} />}
					</Organelle>
				) : (
					<path d={pill(x + 13, y + 13, w - 26, h - 26)} fill={C.cytoplasm} />
				)}
				{shown('dna') ? (
					<Organelle id="dna" order={order('dna')} delay={d} center={[470, 320]} glow={[90, 60]}>
						{() => <path d="M400 310 C420 260 470 300 455 330 S500 380 520 330 S480 270 440 300 S430 370 470 360 S540 300 510 290 S410 350 400 310 Z" fill="none" stroke={C.dna} strokeWidth={4} strokeLinejoin="round" />}
					</Organelle>
				) : null}
				{shown('plazmit')
					? K.plasmids.map(([px, py, r], i) => (
							<Organelle key={i} id="plazmit" order={order('plazmit')} delay={d} center={[px, py]} glow={[r + 12, r + 12]}>
								{() => <circle cx={px} cy={py} r={r} fill="none" stroke={C.dna} strokeWidth={3.5} />}
							</Organelle>
						))
					: null}
				{shown('ribozom') ? (
					<Organelle id="ribozom" order={order('ribozom')} delay={d} center={[490, 320]} grow={false}>
						{(f) => <Ribosomes points={PROKARYOTE_RIBOSOMES} focus={f} />}
					</Organelle>
				) : null}
				{shown('zar') ? (
					<Organelle id="zar" order={0} delay={d} center={[490, 320]} grow={false}>
						{(f) => <path d={pill(x + 13, y + 13, w - 26, h - 26)} fill="none" {...membrane(f)} />}
					</Organelle>
				) : null}
				<Labels type={type} parts={labels} anchors={K.anchors} labelX={K.labelX} numbered={visual.numbered} delay={d} />
			</g>
		</World>
	);
};
