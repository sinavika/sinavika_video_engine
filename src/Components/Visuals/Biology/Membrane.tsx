import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {MEMBRANE_PARTS} from './BiologySchema';
import {type CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {ORGANELLE_COLORS} from './Cell';

// ---------------------------------------------------------------- the cell membrane in cross-section

type Membrane = Extract<CourseVisual, {kind: 'membrane'}>;
type Transport = Membrane['transport'][number];

/** The membrane figure's stage. */
export const MEMBRANE_STAGE = {width: 1000, height: 560} as const;

const M = {
	head: '#F2B45A',
	headEdge: '#B9841E',
	tail: '#C9A15B',
	protein: ORGANELLE_COLORS.er,
	proteinEdge: ORGANELLE_COLORS.erEdge,
	sugar: '#7CC36A',
	sugarEdge: '#3F7F31',
	cholesterol: '#E9806A',
	water: '#4FA3D9',
	oxygen: '#D0453A',
	glucose: '#3F9C4A',
	ion: '#7B5EA7',
	atp: '#F4D35E',
} as const;
const TOP = 205; // outer heads
const BOTTOM = 355; // inner heads
const MID = 280;

/** Where each structure stands across the membrane. */
const AT = {cholesterol: [175, 445], channel: 300, carrier: 545, glycoprotein: 700, peripheral: 790, glycolipid: 870} as const;
/** Each transport passes where its structure is: diffusion and osmosis straight through the bilayer. */
const TRANSPORT_AT: Record<Transport, number> = {difuzyon: 105, kolaylastirilmis: AT.channel, aktif: AT.carrier, osmoz: 945};
const TRANSPORT_TEXT: Record<Transport, [string, string]> = {
	difuzyon: ['Difüzyon', 'çoktan aza, ATP yok'],
	kolaylastirilmis: ['Kolaylaştırılmış', 'kanalla, ATP yok'],
	aktif: ['Aktif taşıma', 'azdan çoğa, ATP'],
	osmoz: ['Osmoz', 'su geçişi'],
};
const NAMES: Record<string, string> = {fosfolipit: 'Fosfolipit', kolesterol: 'Kolesterol', kanal: 'Kanal proteini', tasiyici: 'Taşıyıcı protein', periferik: 'Periferik protein', glikoprotein: 'Glikoprotein', glikolipit: 'Glikolipit'};
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
/** Where each part's leader line starts, and where its name stands (above the membrane or below it). */
const PART_LABEL: Record<string, {anchor: [number, number]; at: [number, number]}> = {
	fosfolipit: {anchor: [57, TOP], at: [57, 92]},
	kolesterol: {anchor: [AT.cholesterol[0], 248], at: [205, 140]},
	kanal: {anchor: [AT.channel, 190], at: [330, 92]},
	glikoprotein: {anchor: [AT.glycoprotein + 20, 120], at: [640, 64]},
	glikolipit: {anchor: [AT.glycolipid, 135], at: [880, 72]},
	tasiyici: {anchor: [AT.carrier, 372], at: [500, 470]},
	periferik: {anchor: [AT.peripheral, 392], at: [800, 470]},
};

/** Columns where phospholipids stand: every 26 units, except where a protein or the glycolipid is. */
const lipidColumns = (): number[] => {
	const taken: [number, number][] = [[AT.channel - 40, AT.channel + 40], [AT.carrier - 52, AT.carrier + 52], [AT.glycoprotein - 34, AT.glycoprotein + 34], [AT.glycolipid - 8, AT.glycolipid + 8]];
	const columns: number[] = [];
	for (let x = 31; x < 990; x += 26) if (!taken.some(([a, b]) => x > a && x < b)) columns.push(x);
	return columns;
};
const COLUMNS = lipidColumns();

const Phospholipid: React.FC<{x: number; top: boolean; focus: number}> = ({x, top, focus}) => {
	const y = top ? TOP : BOTTOM;
	const tailEnd = top ? MID - 6 : MID + 6;
	return (
		<g>
			{[-4.5, 4.5].map((dx) => <path key={dx} d={`M${x + dx} ${y} Q${x + dx * 1.6} ${(y + tailEnd) / 2} ${x + dx} ${tailEnd}`} fill="none" stroke={M.tail} strokeWidth={3 + focus} strokeLinecap="round" />)}
			<circle cx={x} cy={y} r={10 + 2 * focus} fill={M.head} stroke={M.headEdge} strokeWidth={2} />
		</g>
	);
};
const Sugars: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		{[[0, 0], [0, -18], [-12, -33], [12, -33], [-12, -50], [12, -50], [24, -64]].map(([dx, dy], i) => (
			<circle key={i} cx={x + dx} cy={y + dy} r={7} fill={M.sugar} stroke={M.sugarEdge} strokeWidth={1.8} />
		))}
		<polyline points={`${x},${y} ${x},${y - 18} ${x - 12},${y - 33} ${x - 12},${y - 50}`} fill="none" stroke={M.sugarEdge} strokeWidth={1.5} />
		<polyline points={`${x},${y - 18} ${x + 12},${y - 33} ${x + 12},${y - 50} ${x + 24},${y - 64}`} fill="none" stroke={M.sugarEdge} strokeWidth={1.5} />
	</g>
);
const Protein: React.FC<{x: number; w: number; y0?: number; y1?: number}> = ({x, w, y0 = TOP - 26, y1 = BOTTOM + 26}) => (
	<rect x={x - w / 2} y={y0} width={w} height={y1 - y0} rx={Math.min(w / 2, 32)} fill={M.protein} stroke={M.proteinEdge} strokeWidth={3} />
);

/** A part of the membrane that comes in, then stands out while a beat points at it. */
const Part: React.FC<{id: string; entrance: number; children: (focus: number) => React.ReactNode}> = ({id, entrance, children}) => {
	const look = usePartLook(id, entrance);
	return <g opacity={look.opacity}>{children(look.focused)}</g>;
};

/** Particles crossing at one place: a crowd on the side they come from, a few on the other, some on the way. */
const Crossing: React.FC<{kind: Transport; index: number; entrance: number; seconds: number}> = ({kind, index, entrance, seconds}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`t${index + 1}`, entrance);
	const x = TRANSPORT_AT[kind];
	const up = kind === 'aktif';
	const colour = kind === 'difuzyon' ? M.oxygen : kind === 'kolaylastirilmis' ? M.glucose : kind === 'aktif' ? M.ion : M.water;
	// Where there is more: above for diffusion, facilitated diffusion and osmosis (they go down), below for active transport (it goes up).
	const many: [number, number][] = [[-34, 0], [-12, -22], [14, -6], [36, -24], [-26, -44], [8, -46], [30, 10]];
	const few: [number, number][] = [[-20, 0], [22, 8]];
	const crowdY = up ? 430 : 140;
	const sparseY = up ? 140 : 430;
	const flow = Array.from({length: 4}, (_, k) => ((seconds * 0.32 + k / 4) % 1));
	const yOf = (p: number) => (up ? 440 - p * 320 : 120 + p * 320);
	const dot = (cx: number, cy: number, key: string, alpha = 1) =>
		kind === 'kolaylastirilmis' ? (
			<polygon key={key} points={Array.from({length: 6}, (_, k) => `${cx + 9 * Math.cos((k * Math.PI) / 3)},${cy + 9 * Math.sin((k * Math.PI) / 3)}`).join(' ')} fill={colour} opacity={alpha} />
		) : (
			<circle key={key} cx={cx} cy={cy} r={kind === 'osmoz' ? 7 : 6.5} fill={colour} opacity={alpha} />
		);
	const [title, detail] = TRANSPORT_TEXT[kind];
	const arrowY0 = up ? 410 : 150;
	const arrowY1 = up ? 150 : 410;
	const side = x > 900 ? -46 : 46;
	return (
		<g opacity={look.opacity}>
			{many.map(([dx, dy], i) => dot(x + dx, crowdY + (up ? -dy : dy), `m${i}`))}
			{few.map(([dx, dy], i) => dot(x + dx, sparseY + (up ? -dy : dy), `f${i}`))}
			{flow.map((p, k) => dot(x + 6 * Math.sin(k * 2.1), yOf(p), `p${k}`, Math.min(1, Math.sin(p * Math.PI) * 1.6)))}
			<line x1={x + side} x2={x + side} y1={arrowY0} y2={arrowY1} stroke={look.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={4} markerEnd="url(#membraneArrow)" opacity={0.85} />
			{kind === 'aktif' ? (
				<g>
					<circle cx={x + 70} cy={BOTTOM + 52} r={22} fill={M.atp} stroke={M.headEdge} strokeWidth={2} />
					<text x={x + 70} y={BOTTOM + 53} textAnchor="middle" dominantBaseline="middle" fontSize={15} fontWeight={800} fill={palette.ink} fontFamily={palette.fontBody}>ATP</text>
				</g>
			) : null}
			<text x={x} y={512} textAnchor="middle" fontSize={23 * (1 + 0.08 * look.focused)} fontWeight={800} fill={look.focused > 0.5 ? palette.lesson : palette.ink} stroke={palette.surface} strokeWidth={6} paintOrder="stroke" fontFamily={palette.fontBody}>{title}</text>
			<text x={x} y={540} textAnchor="middle" fontSize={18} fontWeight={600} fill={palette.muted} stroke={palette.surface} strokeWidth={5} paintOrder="stroke" fontFamily={palette.fontBody}>{detail}</text>
		</g>
	);
};

/**
 * The fluid mosaic in cross-section: phospholipids in two layers, heads out and tails in, cholesterol between the
 * tails, a channel protein with its pore, a carrier protein with a notch for what it carries, a peripheral protein
 * on the inner face, a glycoprotein and a glycolipid with sugar chains outside. Transports run as particles moving
 * through their place, from the crowded side to the sparse one (active transport the other way, with ATP).
 */
export const MembraneVisual: React.FC<VisualBoxProps & {visual: Membrane}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const enter = (k: number) => easeFrom(seconds, delaySeconds + k * 0.25, 0.6);
	const labels = visual.labels ?? (visual.transport.length ? [] : [...MEMBRANE_PARTS]);
	const label = (part: string, index: number, focus: number) => {
		const {anchor, at} = PART_LABEL[part];
		const colour = focus > 0.5 ? palette.lesson : palette.ink;
		const below = at[1] > MID;
		return (
			<g>
				<line x1={anchor[0]} y1={anchor[1]} x2={at[0]} y2={at[1] + (below ? -16 : 10)} stroke={colour} strokeWidth={2 + focus} opacity={0.7} />
				<circle cx={anchor[0]} cy={anchor[1]} r={4.5} fill={colour} />
				<text x={at[0]} y={at[1]} textAnchor="middle" dominantBaseline={below ? 'hanging' : 'auto'} fontSize={22 * (1 + 0.1 * focus)} fontWeight={focus > 0.5 ? 800 : 700} fill={colour} stroke={palette.surface} strokeWidth={6} paintOrder="stroke" fontFamily={palette.fontBody}>
					{visual.numbered ? ROMAN[index] : NAMES[part]}
				</text>
			</g>
		);
	};
	const labelled = (part: string) => labels.indexOf(part as never);
	return (
		<World width={width} height={height} viewWidth={MEMBRANE_STAGE.width} viewHeight={MEMBRANE_STAGE.height}>
			<defs>
				<marker id="membraneArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
					<path d="M0 0 L10 5 L0 10 Z" fill={palette.ink} />
				</marker>
			</defs>
			<rect x={0} y={0} width={1000} height={TOP - 14} fill={withAlpha('#4FA3D9', 0.06)} />
			<rect x={0} y={BOTTOM + 14} width={1000} height={560 - BOTTOM - 14} fill={withAlpha(palette.lesson, 0.06)} />
			<text x={14} y={30} fontSize={20} fontWeight={700} fill={palette.muted} fontFamily={palette.fontBody}>hücre dışı</text>
			<text x={14} y={BOTTOM + 44} fontSize={20} fontWeight={700} fill={palette.muted} fontFamily={palette.fontBody}>sitoplazma</text>
			<Part id="fosfolipit" entrance={enter(0)}>
				{(f) => (
					<g>
						{COLUMNS.map((x) => <Phospholipid key={`t${x}`} x={x} top focus={f} />)}
						{COLUMNS.map((x) => <Phospholipid key={`b${x}`} x={x} top={false} focus={f} />)}
					</g>
				)}
			</Part>
			<Part id="kolesterol" entrance={enter(1)}>
				{(f) => (
					<g>
						{AT.cholesterol.flatMap((x) => [
							<rect key={`a${x}`} x={x - 5 - f} y={TOP + 16} width={10 + 2 * f} height={44} rx={5} fill={M.cholesterol} stroke="#B4472F" strokeWidth={1.5} />,
							<rect key={`b${x}`} x={x - 5 - f} y={MID + 10} width={10 + 2 * f} height={44} rx={5} fill={M.cholesterol} stroke="#B4472F" strokeWidth={1.5} />,
						])}
					</g>
				)}
			</Part>
			<Part id="kanal" entrance={enter(2)}>
				{(f) => (
					<g transform={`translate(${AT.channel} ${MID}) scale(${1 + 0.06 * f}) translate(${-AT.channel} ${-MID})`}>
						<Protein x={AT.channel - 22} w={28} />
						<Protein x={AT.channel + 22} w={28} />
					</g>
				)}
			</Part>
			<Part id="tasiyici" entrance={enter(3)}>
				{(f) => (
					<g transform={`translate(${AT.carrier} ${MID}) scale(${1 + 0.06 * f}) translate(${-AT.carrier} ${-MID})`}>
						<Protein x={AT.carrier} w={86} />
						<path d={`M${AT.carrier - 14} ${TOP - 26} q14 22 28 0`} fill={palette.surface} stroke={M.proteinEdge} strokeWidth={3} />
					</g>
				)}
			</Part>
			<Part id="glikoprotein" entrance={enter(4)}>
				{(f) => (
					<g transform={`translate(${AT.glycoprotein} ${MID}) scale(${1 + 0.06 * f}) translate(${-AT.glycoprotein} ${-MID})`}>
						<Protein x={AT.glycoprotein} w={54} />
						<Sugars x={AT.glycoprotein + 4} y={TOP - 34} />
					</g>
				)}
			</Part>
			<Part id="periferik" entrance={enter(5)}>
				{(f) => <ellipse cx={AT.peripheral} cy={BOTTOM + 36} rx={44 + 4 * f} ry={22 + 2 * f} fill={M.protein} stroke={M.proteinEdge} strokeWidth={3} />}
			</Part>
			<Part id="glikolipit" entrance={enter(6)}>
				{(f) => (
					<g>
						<Phospholipid x={AT.glycolipid} top focus={f} />
						<Sugars x={AT.glycolipid} y={TOP - 14} />
					</g>
				)}
			</Part>
			{labels.map((part, index) => (
				<Part key={part} id={part} entrance={enter(7 + index * 0.4)}>
					{(f) => label(part, labelled(part), f)}
				</Part>
			))}
			{visual.transport.map((kind, index) => (
				<Crossing key={kind} kind={kind} index={index} entrance={enter(8 + index)} seconds={t} />
			))}
		</World>
	);
};
