import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {DIVISION_DEFAULT_STAGES} from './BiologySchema';
import {type CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {ORGANELLE_COLORS as C} from './Cell';

// ---------------------------------------------------------------- mitosis and meiosis, stage by stage

type Division = Extract<CourseVisual, {kind: 'division'}>;
type Stage = NonNullable<Division['stages']>[number];

const PANEL = 230;
/** Meiosis II happens in two cells and ends in four, so its panels are wider: the cells stay as large as the rest. */
const WIDE_PANEL = 340;
const WIDE_STAGES: readonly Stage[] = ['metafaz2', 'anafaz2', 'telofaz2'];
const HEIGHT = 340;
/** Columns of the figure: all panels in a row, or two columns (a question's figure in a narrow panel). */
const columnsOf = (visual: Division, panels: number) => (visual.layout === 'grid' ? Math.min(2, panels) : panels);
/** A numbered panel carries only its numeral under the drawing, so it is shorter. */
const panelHeight = (numbered: boolean) => (numbered ? 292 : HEIGHT);
const panelWidth = (stage: Stage) => (WIDE_STAGES.includes(stage) ? WIDE_PANEL : PANEL);
export const divisionStages = (visual: Division): readonly Stage[] => visual.stages ?? DIVISION_DEFAULT_STAGES[visual.mode];
/**
 * Where each stage's panel sits: panels in a row or in two columns, a column as wide as its widest panel (230, or 340
 * for the two- and four-cell stages of meiosis II), 340 tall (292 numbered). Also the figure's whole stage.
 */
export const divisionLayout = (visual: Division) => {
	const stages = divisionStages(visual);
	const columns = columnsOf(visual, stages.length);
	const height = panelHeight(visual.numbered);
	const widths = Array.from({length: columns}, (_, c) => Math.max(...stages.filter((_, i) => i % columns === c).map(panelWidth)));
	const offsets = widths.map((_, c) => 10 + widths.slice(0, c).reduce((sum, w) => sum + w, 0));
	const slots = stages.map((_, i) => ({cx: offsets[i % columns] + widths[i % columns] / 2, top: Math.floor(i / columns) * height, width: widths[i % columns]}));
	return {slots, width: 20 + widths.reduce((sum, w) => sum + w, 0), height: height * Math.ceil(stages.length / columns)};
};
export const divisionFrame = (visual: Division) => {
	const {width, height} = divisionLayout(visual);
	return {width, height};
};

/** From the mother red, from the father blue: the two sets of a diploid cell. */
const MATERNAL = '#D9534F';
const PATERNAL = '#3E7CC0';
const LENGTHS = [58, 38, 26];

const TEXT: Record<Stage, [string, string]> = {
	interfaz: ['İnterfaz', 'DNA eşlenir'],
	profaz: ['Profaz', 'kromozomlar belirir'],
	metafaz: ['Metafaz', 'ekvatorda dizilir'],
	anafaz: ['Anafaz', 'kromatitler ayrılır'],
	telofaz: ['Telofaz', 'iki çekirdek, sitokinez'],
	profaz1: ['Profaz I', 'tetrat, krossing over'],
	metafaz1: ['Metafaz I', 'homologlar karşılıklı'],
	anafaz1: ['Anafaz I', 'homologlar ayrılır'],
	telofaz1: ['Telofaz I', 'iki hücre'],
	metafaz2: ['Metafaz II', 'ekvatorda dizilir'],
	anafaz2: ['Anafaz II', 'kromatitler ayrılır'],
	telofaz2: ['Telofaz II', 'dört hücre'],
};
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
/** Chromosome number per cell at each stage: diploid until the first meiotic division separates the homologs. */
const ploidy = (stage: Stage, n: number) => (['telofaz1', 'metafaz2', 'anafaz2', 'telofaz2'].includes(stage) ? `n = ${n}` : `2n = ${2 * n}`);

type Piece = {x: number; y: number; len: number; angle: number; color: string; double: boolean; tip?: string; scale?: number};

/** One chromosome: a single chromatid, or two sister chromatids joined at the centromere; `tip` colours a crossed-over end. */
const Chromosome: React.FC<Piece> = ({x, y, len, angle, color, double, tip, scale = 1}) => {
	const L = len * scale;
	const w = 8 * scale;
	const arm = (dx: number, key: string, crossed: boolean) => (
		<g key={key}>
			<rect x={dx - w / 2} y={-L / 2} width={w} height={L} rx={w / 2} fill={color} stroke={withAlpha('#000000', 0.25)} strokeWidth={1} />
			{crossed && tip ? <rect x={dx - w / 2} y={L / 2 - L * 0.32} width={w} height={L * 0.32} rx={w / 2} fill={tip} /> : null}
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) rotate(${angle})`}>
			{double ? [arm(-w * 0.62, 'a', false), arm(w * 0.62, 'b', true)] : arm(0, 'a', Boolean(tip))}
			{double ? <circle cx={0} cy={-L * 0.08} r={w * 0.55} fill={withAlpha('#000000', 0.45)} /> : null}
		</g>
	);
};

/** The chromosomes of a diploid cell: for each of the n pairs a maternal and a paternal one, longest pair first. */
const pairs = (n: number) => Array.from({length: n}, (_, k) => ({len: LENGTHS[k], k}));

const Spindle: React.FC<{cx: number; cy: number; reach: number; targets: [number, number][]; color: string; poles?: boolean; plant: boolean}> = ({cx, cy, reach, targets, color, poles = true, plant}) => (
	<g>
		{targets.map(([tx, ty], i) => (
			<g key={i}>
				<line x1={cx - reach} y1={cy} x2={tx} y2={ty} stroke={color} strokeWidth={1.4} opacity={0.55} />
				<line x1={cx + reach} y1={cy} x2={tx} y2={ty} stroke={color} strokeWidth={1.4} opacity={0.55} />
			</g>
		))}
		{poles && !plant
			? [-1, 1].map((side) => (
					<g key={side} transform={`translate(${cx + side * reach} ${cy})`}>
						<rect x={-6} y={-3} width={12} height={6} rx={2} fill={C.centriole} />
						<rect x={-3} y={-6} width={6} height={12} rx={2} fill={C.centriole} />
					</g>
				))
			: null}
	</g>
);

/** One cell outline: a circle for an animal cell, a rounded square (with a wall) for a plant cell. */
const Outline: React.FC<{cx: number; cy: number; r: number; plant: boolean; lesson: string}> = ({cx, cy, r, plant, lesson}) =>
	plant ? (
		<rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} rx={r * 0.18} fill={C.cytoplasm} stroke={C.wallEdge} strokeWidth={5} />
	) : (
		<circle cx={cx} cy={cy} r={r} fill={C.cytoplasm} stroke={lesson} strokeWidth={3.5} />
	);

const Chromatin: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => (
	<g>
		<circle cx={cx} cy={cy} r={r} fill={C.nucleus} stroke={C.nucleusEdge} strokeWidth={2.5} />
		{[[-0.45, -0.2, 20], [0.1, 0.35, -30], [-0.15, 0.1, 70], [0.3, -0.35, 10]].map(([fx, fy, a], i) => (
			<path key={i} d={`M${cx + r * fx} ${cy + r * fy} q${r * 0.15} ${-r * 0.12} ${r * 0.3} 0 t${r * 0.3} 0`} fill="none" stroke={C.chromatin} strokeWidth={2} transform={`rotate(${a} ${cx + r * fx} ${cy + r * fy})`} />
		))}
	</g>
);

/** Everything inside one stage's panel, drawn around (cx, cy). `move` runs 0 → 1 for the anaphases' pull to the poles. */
const StageDrawing: React.FC<{stage: Stage; n: number; plant: boolean; cx: number; cy: number; move: number; lesson: string; ink: string}> = ({stage, n, plant, cx, cy, move, lesson, ink}) => {
	const R = 92;
	const set = pairs(n);
	const spacing = (count: number, span: number) => Array.from({length: count}, (_, i) => (count === 1 ? 0 : -span / 2 + (span * i) / (count - 1)));
	const fibre = withAlpha(ink, 0.6);
	switch (stage) {
		case 'interfaz':
			return (
				<g>
					<Outline cx={cx} cy={cy} r={R} plant={plant} lesson={lesson} />
					<Chromatin cx={cx} cy={cy} r={44} />
					<circle cx={cx + 10} cy={cy - 6} r={11} fill={C.nucleolus} />
					{plant ? null : <Spindle cx={cx + 58} cy={cy - 58} reach={0} targets={[]} color={fibre} plant={plant} />}
				</g>
			);
		case 'profaz': {
			const spots: [number, number, number][] = [[-24, -16, 25], [20, -22, -35], [-16, 22, 70], [22, 18, -60], [-2, -2, 10], [4, 30, 40]];
			const items = set.flatMap(({len}, k) => [{len, color: MATERNAL, k: 2 * k}, {len, color: PATERNAL, k: 2 * k + 1}]);
			return (
				<g>
					<Outline cx={cx} cy={cy} r={R} plant={plant} lesson={lesson} />
					<circle cx={cx} cy={cy} r={56} fill="none" stroke={C.nucleusEdge} strokeWidth={2} strokeDasharray="7 7" />
					{items.map((item, i) => <Chromosome key={i} x={cx + spots[i][0]} y={cy + spots[i][1]} len={item.len} angle={spots[i][2]} color={item.color} double />)}
					{plant ? null : <Spindle cx={cx} cy={cy - 66} reach={40} targets={[]} color={fibre} plant={plant} />}
				</g>
			);
		}
		case 'metafaz':
		case 'metafaz2': {
			const small = stage === 'metafaz2';
			const cells = small ? [cx - 82, cx + 82] : [cx];
			const r = small ? 74 : R;
			return (
				<g>
					{cells.map((x, c) => {
						const chromosomes = small ? set.map(({len}, k) => ({len, color: (k + c) % 2 ? PATERNAL : MATERNAL, tip: (k + c) % 2 ? MATERNAL : PATERNAL})) : set.flatMap(({len}) => [{len, color: MATERNAL, tip: undefined}, {len, color: PATERNAL, tip: undefined}]);
						const ys = spacing(chromosomes.length, small ? 76 : 150);
						const scale = small ? 0.78 : 0.66;
						return (
							<g key={c}>
								<Outline cx={x} cy={cy} r={r} plant={plant} lesson={lesson} />
								<line x1={x} x2={x} y1={cy - r + 8} y2={cy + r - 8} stroke={withAlpha(ink, 0.25)} strokeWidth={1.5} strokeDasharray="4 5" />
								<Spindle cx={x} cy={cy} reach={r - 10} targets={ys.map((dy) => [x, cy + dy])} color={fibre} plant={plant} />
								{chromosomes.map((item, i) => <Chromosome key={i} x={x} y={cy + ys[i]} len={item.len} angle={0} color={item.color} double tip={item.tip} scale={scale} />)}
							</g>
						);
					})}
				</g>
			);
		}
		case 'anafaz':
		case 'anafaz2': {
			const small = stage === 'anafaz2';
			const cells = small ? [cx - 82, cx + 82] : [cx];
			const r = small ? 74 : R;
			const pull = small ? 10 + 34 * move : 8 + 46 * move;
			return (
				<g>
					{cells.map((x, c) => {
						const chromosomes = small ? set.map(({len}, k) => ({len, color: (k + c) % 2 ? PATERNAL : MATERNAL, tip: (k + c) % 2 ? MATERNAL : PATERNAL})) : set.flatMap(({len}) => [{len, color: MATERNAL, tip: undefined as string | undefined}, {len, color: PATERNAL, tip: undefined as string | undefined}]);
						const ys = spacing(chromosomes.length, small ? 64 : 120);
						const scale = small ? 0.78 : 0.72;
						return (
							<g key={c}>
								<Outline cx={x} cy={cy} r={r} plant={plant} lesson={lesson} />
								<Spindle cx={x} cy={cy} reach={r - 10} targets={ys.flatMap((dy) => [[x - pull, cy + dy * 0.8], [x + pull, cy + dy * 0.8]] as [number, number][])} color={fibre} plant={plant} />
								{chromosomes.flatMap((item, i) => [-1, 1].map((side) => <Chromosome key={`${i}${side}`} x={x + side * pull} y={cy + ys[i] * 0.8} len={item.len} angle={side * (90 - 20 * move)} color={item.color} double={false} tip={side > 0 ? item.tip : undefined} scale={scale} />))}
							</g>
						);
					})}
				</g>
			);
		}
		case 'telofaz':
		case 'telofaz1': {
			const meiosis = stage === 'telofaz1';
			const lobes = [-1, 1];
			return (
				<g>
					{plant ? (
						<g>
							<Outline cx={cx} cy={cy} r={R} plant lesson={lesson} />
							<line x1={cx} x2={cx} y1={cy - R + 6} y2={cy + R - 6} stroke={C.wallEdge} strokeWidth={5} strokeDasharray="10 6" />
						</g>
					) : (
						<path d={`M${cx} ${cy - 28} C${cx - 18} ${cy - 84} ${cx - 104} ${cy - 84} ${cx - 104} ${cy} C${cx - 104} ${cy + 84} ${cx - 18} ${cy + 84} ${cx} ${cy + 28} C${cx + 18} ${cy + 84} ${cx + 104} ${cy + 84} ${cx + 104} ${cy} C${cx + 104} ${cy - 84} ${cx + 18} ${cy - 84} ${cx} ${cy - 28} Z`} fill={C.cytoplasm} stroke={lesson} strokeWidth={3.5} />
					)}
					{lobes.map((side) =>
						meiosis ? (
							<g key={side}>
								{set.map(({len}, k) => {
									const maternal = (k + (side > 0 ? 1 : 0)) % 2 === 0;
									return <Chromosome key={k} x={cx + side * 50 + (k - (n - 1) / 2) * 20} y={cy} len={len} angle={side * 10} color={maternal ? MATERNAL : PATERNAL} tip={maternal ? PATERNAL : MATERNAL} double scale={0.75} />;
								})}
							</g>
						) : (
							<Chromatin key={side} cx={cx + side * 52} cy={cy} r={28} />
						),
					)}
				</g>
			);
		}
		case 'profaz1': {
			return (
				<g>
					<Outline cx={cx} cy={cy} r={R} plant={plant} lesson={lesson} />
					<circle cx={cx} cy={cy} r={58} fill="none" stroke={C.nucleusEdge} strokeWidth={2} strokeDasharray="7 7" />
					{set.map(({len}, k) => {
						const x = cx + (k - (n - 1) / 2) * 44;
						const y = cy + (k % 2 ? 8 : -6);
						return (
							<g key={k}>
								<Chromosome x={x - 9} y={y} len={len} angle={12} color={MATERNAL} tip={PATERNAL} double />
								<Chromosome x={x + 9} y={y} len={len} angle={12} color={PATERNAL} tip={MATERNAL} double />
								{k === 0 ? <circle cx={x} cy={y + len * 0.2} r={9} fill="none" stroke={ink} strokeWidth={1.5} strokeDasharray="3 3" /> : null}
							</g>
						);
					})}
				</g>
			);
		}
		case 'metafaz1': {
			const ys = spacing(n, 96);
			return (
				<g>
					<Outline cx={cx} cy={cy} r={R} plant={plant} lesson={lesson} />
					<line x1={cx} x2={cx} y1={cy - R + 8} y2={cy + R - 8} stroke={withAlpha(ink, 0.25)} strokeWidth={1.5} strokeDasharray="4 5" />
					<Spindle cx={cx} cy={cy} reach={R - 10} targets={ys.flatMap((dy) => [[cx - 12, cy + dy], [cx + 12, cy + dy]] as [number, number][])} color={fibre} plant={plant} />
					{set.map(({len}, k) => (
						<g key={k}>
							<Chromosome x={cx - 12} y={cy + ys[k]} len={len} angle={0} color={k % 2 ? PATERNAL : MATERNAL} tip={k % 2 ? MATERNAL : PATERNAL} double />
							<Chromosome x={cx + 12} y={cy + ys[k]} len={len} angle={0} color={k % 2 ? MATERNAL : PATERNAL} tip={k % 2 ? PATERNAL : MATERNAL} double />
						</g>
					))}
				</g>
			);
		}
		case 'anafaz1': {
			const ys = spacing(n, 80);
			const pull = 14 + 40 * move;
			return (
				<g>
					<Outline cx={cx} cy={cy} r={R} plant={plant} lesson={lesson} />
					<Spindle cx={cx} cy={cy} reach={R - 10} targets={ys.flatMap((dy) => [[cx - pull, cy + dy], [cx + pull, cy + dy]] as [number, number][])} color={fibre} plant={plant} />
					{set.flatMap(({len}, k) =>
						[-1, 1].map((side) => {
							const maternal = (k % 2 === 0) === side < 0;
							return <Chromosome key={`${k}${side}`} x={cx + side * pull} y={cy + ys[k]} len={len} angle={side * 18} color={maternal ? MATERNAL : PATERNAL} tip={maternal ? PATERNAL : MATERNAL} double />;
						}),
					)}
				</g>
			);
		}
		case 'telofaz2': {
			const spots: [number, number][] = [[-80, -50], [80, -50], [-80, 50], [80, 50]];
			return (
				<g>
					{spots.map(([dx, dy], c) => (
						<g key={c}>
							<Outline cx={cx + dx} cy={cy + dy} r={46} plant={plant} lesson={lesson} />
							{set.map(({len}, k) => {
								const maternal = (k + c) % 2 === 0;
								return <Chromosome key={k} x={cx + dx + (k - (n - 1) / 2) * 20} y={cy + dy} len={len} angle={0} color={maternal ? MATERNAL : PATERNAL} tip={c % 2 ? (maternal ? PATERNAL : MATERNAL) : undefined} double={false} scale={0.72} />;
							})}
						</g>
					))}
				</g>
			);
		}
	}
};

const Panel: React.FC<{visual: Division; stage: Stage; index: number; slot: {cx: number; top: number; width: number}; delay: number}> = ({visual, stage, index, slot, delay}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const look = usePartLook(`s${index + 1}`, easeFrom(seconds, delay + index * 0.4, 0.6));
	const move = easeFrom(seconds, delay + 0.8 + index * 0.4, 1.8);
	const {cx, top, width} = slot;
	const cy = top + 140;
	const lit = look.focused;
	const [title, note] = TEXT[stage];
	const plant = visual.cell === 'plant';
	return (
		<g opacity={look.opacity}>
			{lit > 0.02 ? <rect x={cx - width / 2 + 6} y={top + 14} width={width - 12} height={panelHeight(visual.numbered) - 20} rx={18} fill={withAlpha(palette.lesson, 0.12 * lit)} stroke={withAlpha(palette.lesson, 0.6 * lit)} strokeWidth={2} /> : null}
			<g transform={`translate(${cx} ${cy}) scale(${1 + 0.05 * lit}) translate(${-cx} ${-cy})`}>
				<StageDrawing stage={stage} n={visual.n} plant={plant} cx={cx} cy={cy} move={move} lesson={palette.lesson} ink={palette.ink} />
			</g>
			<text x={cx} y={top + (visual.numbered ? 272 : 270)} textAnchor="middle" fontSize={(visual.numbered ? 36 : 27) * (1 + 0.06 * lit)} fontWeight={800} fill={lit > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody}>
				{visual.numbered ? ROMAN[index] : title}
			</text>
			{visual.numbered ? null : (
				<g>
					<text x={cx} y={top + 298} textAnchor="middle" fontSize={18} fontWeight={600} fill={palette.muted} fontFamily={palette.fontBody}>{note}</text>
					<text x={cx} y={top + 324} textAnchor="middle" fontSize={20} fontWeight={800} fill={palette.lesson} fontFamily={palette.fontBody}>{ploidy(stage, visual.n)}</text>
				</g>
			)}
		</g>
	);
};

/**
 * Cell division drawn stage by stage, as textbooks do: maternal chromosomes red, paternal blue (2n = 4 by default).
 * Mitosis: interphase with chromatin and the centrosome, prophase with condensed double chromosomes as the nuclear
 * envelope breaks up, metaphase on the equator with the spindle, anaphase pulling sister chromatids to the poles,
 * telophase with two nuclei and cytokinesis (a furrow in an animal cell, a cell plate in a plant cell). Meiosis:
 * tetrads crossing over in prophase I, homologs facing each other in metaphase I and parting in anaphase I, two
 * haploid cells, then sister chromatids parting in two cells and four haploid cells at the end. Anaphases move.
 * Parts s1… (the panels). `numbered` writes I, II… under the panels and hides names and counts: a question's figure.
 */
export const DivisionVisual: React.FC<VisualBoxProps & {visual: Division}> = ({visual, width, height, delaySeconds = 0}) => {
	const stages = divisionStages(visual);
	const layout = divisionLayout(visual);
	return (
		<World width={width} height={height} viewWidth={layout.width} viewHeight={layout.height}>
			{stages.map((name, index) => (
				<Panel key={`${name}${index}`} visual={visual} stage={name} index={index} slot={layout.slots[index]} delay={delaySeconds} />
			))}
		</World>
	);
};
