import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {fraction, genotypeText, phenotypeKey, ratio, zygote} from './Allele';
import {GenotypeText} from './GenotypeText';

// ---------------------------------------------------------------- the Punnett square

type Punnett = Extract<CourseVisual, {kind: 'punnett'}>;

const CELL = 128;
const HEAD = 104;
const TITLE = 56;
const CROSS = 66;
const LEGEND = 420;
const ITEM = 72;

/** Where everything sits: the gamete headers, the grid, the legend beside it; the figure's whole stage. */
export const punnettLayout = (visual: Punnett) => {
	const top = (visual.cross ? CROSS : 0) + TITLE;
	// A three- or four-gamete square keeps its headers slimmer: the cells, not the margins, take the height.
	const head = Math.max(visual.rows.length, visual.columns.length) >= 3 ? 84 : HEAD;
	const gx = TITLE + head + 8;
	const gy = top + head + 8;
	const legend = visual.phenotypes.length > 0;
	const legendHeight = visual.phenotypes.length * ITEM + (visual.ratio ? 90 : 0);
	const width = gx + visual.columns.length * CELL + 24 + (legend ? LEGEND : 0);
	const height = Math.max(gy + visual.rows.length * CELL, gy + legendHeight) + 24;
	return {top, head, gx, gy, width, height};
};

/** The cells' genotypes and phenotype classes (the index of the first phenotype whose keys hold the class, or -1). */
const punnettCells = (visual: Punnett) =>
	visual.rows.map((egg) =>
		visual.columns.map((sperm) => {
			const genes = zygote(egg, sperm);
			const key = phenotypeKey(genes);
			return {text: genotypeText(genes), key, phenotype: visual.phenotypes.findIndex((p) => p.keys.includes(key))};
		}),
	);

/**
 * Class fills in the lesson colour only, far apart in lightness so four classes read at a glance (9 : 3 : 3 : 1 is
 * strong, light, deep, white): no second hue. Text turns light on the two dark fills.
 */
const shade = (palette: ReturnType<typeof useVisualPalette>, index: number): {fill: string; text: string} =>
	[
		{fill: withAlpha(palette.lesson, 0.82), text: palette.onLesson},
		{fill: withAlpha(palette.lesson, 0.3), text: palette.ink},
		{fill: palette.lessonDeep, text: palette.onLesson},
		{fill: palette.surface, text: palette.ink},
		{fill: withAlpha(palette.lesson, 0.12), text: palette.ink},
		{fill: withAlpha(palette.ink, 0.1), text: palette.ink},
	][index] ?? {fill: palette.surface, text: palette.ink};

/**
 * A Punnett square as textbooks draw it: the first parent's gametes down the side, the second's along the top, each
 * cell the zygote of its row and column (alleles in textbook order: AA, Aa; X^RX^r, X^RY; AO). With `phenotypes`
 * the cells take a shade per phenotype and a legend gives each class's share (3/4, 9/16) and, with `ratio`, the
 * phenotype ratio. Cells fill one by one. Parts: r1… (rows), c1… (columns), p1… (phenotype classes).
 */
export const PunnettVisual: React.FC<VisualBoxProps & {visual: Punnett}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const layout = punnettLayout(visual);
	const cells = punnettCells(visual);
	const total = visual.rows.length * visual.columns.length;
	const counts = visual.phenotypes.map((_, index) => cells.flat().filter((cell) => cell.phenotype === index).length);
	const size = visual.columns.length >= 4 ? 40 : 44;
	const gridRight = layout.gx + visual.columns.length * CELL;
	const titles = easeFrom(seconds, delaySeconds, 0.5);
	return (
		<World width={width} height={height} viewWidth={layout.width} viewHeight={layout.height}>
			{visual.cross ? (
				<GenotypeText text={visual.cross} x={(layout.gx + gridRight) / 2} y={44} size={44} textAnchor="middle" fontWeight={800} fill={palette.ink} fontFamily={palette.fontBody} opacity={titles} />
			) : null}
			<text x={(layout.gx + gridRight) / 2} y={layout.top - 16} textAnchor="middle" fontSize={28} fontWeight={700} fill={palette.muted} fontFamily={palette.fontBody} opacity={titles}>
				{visual.columnTitle}
			</text>
			<text transform={`translate(${TITLE - 18} ${layout.gy + (visual.rows.length * CELL) / 2}) rotate(-90)`} textAnchor="middle" fontSize={28} fontWeight={700} fill={palette.muted} fontFamily={palette.fontBody} opacity={titles}>
				{visual.rowTitle}
			</text>
			{visual.columns.map((gamete, j) => (
				<Gamete key={`c${j}`} part={`c${j + 1}`} text={gamete} x={layout.gx + j * CELL + 4} y={layout.top} w={CELL - 8} h={layout.head} entrance={easeFrom(seconds, delaySeconds + 0.2 + j * 0.12, 0.4)} />
			))}
			{visual.rows.map((gamete, i) => (
				<Gamete key={`r${i}`} part={`r${i + 1}`} text={gamete} x={TITLE} y={layout.gy + i * CELL + 4} w={layout.head} h={CELL - 8} entrance={easeFrom(seconds, delaySeconds + 0.3 + i * 0.12, 0.4)} />
			))}
			{cells.map((row, i) =>
				row.map((cell, j) => (
					<Cell
						key={`${i}-${j}`}
						row={i}
						column={j}
						phenotype={cell.phenotype}
						text={cell.text}
						x={layout.gx + j * CELL}
						y={layout.gy + i * CELL}
						size={size}
						shade={cell.phenotype >= 0 ? shade(palette, cell.phenotype) : {fill: palette.surface, text: palette.ink}}
						entrance={easeFrom(seconds, delaySeconds + 0.9 + (i * row.length + j) * 0.07, 0.35)}
					/>
				)),
			)}
			{visual.phenotypes.map((phenotype, index) => (
				<LegendItem key={index} index={index} label={phenotype.label} share={fraction(counts[index], total)} fill={shade(palette, index).fill} x={gridRight + 48} y={layout.gy + index * ITEM} entrance={easeFrom(seconds, delaySeconds + 2 + index * 0.25, 0.4)} />
			))}
			{visual.ratio && visual.phenotypes.length > 1 ? (
				<g opacity={easeFrom(seconds, delaySeconds + 2.2 + visual.phenotypes.length * 0.25, 0.5)}>
					<text x={gridRight + 48} y={layout.gy + visual.phenotypes.length * ITEM + 34} fontSize={24} fontWeight={700} fill={palette.muted} fontFamily={palette.fontBody}>
						Fenotip oranı
					</text>
					<text x={gridRight + 48} y={layout.gy + visual.phenotypes.length * ITEM + 76} fontSize={38} fontWeight={800} fill={palette.lesson} fontFamily={palette.fontBody}>
						{ratio(counts)}
					</text>
				</g>
			) : null}
		</World>
	);
};

const Gamete: React.FC<{part: string; text: string; x: number; y: number; w: number; h: number; entrance: number}> = ({part, text, x, y, w, h, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(part, entrance);
	const lit = look.focused;
	return (
		<g opacity={look.opacity}>
			<rect x={x} y={y} width={w} height={h} rx={16} fill={lit > 0.5 ? palette.lesson : withAlpha(palette.lesson, 0.1)} stroke={palette.lesson} strokeWidth={2.5} />
			<GenotypeText text={text} x={x + w / 2} y={y + h / 2 + 15} size={42} textAnchor="middle" fontWeight={800} fill={lit > 0.5 ? palette.onLesson : palette.lesson} fontFamily={palette.fontBody} />
		</g>
	);
};

const Cell: React.FC<{row: number; column: number; phenotype: number; text: string; x: number; y: number; size: number; shade: {fill: string; text: string}; entrance: number}> = ({row, column, phenotype, text, x, y, size, shade: look, entrance}) => {
	const palette = useVisualPalette();
	// A cell has no part of its own: it is lit and dimmed with its row, its column and its phenotype class.
	const rowLook = usePartLook(`r${row + 1}`, 1);
	const columnLook = usePartLook(`c${column + 1}`, 1);
	const classLook = usePartLook(phenotype >= 0 ? `p${phenotype + 1}` : `r${row + 1}`, 1);
	const lit = Math.max(rowLook.focused, columnLook.focused, phenotype >= 0 ? classLook.focused : 0);
	const opacity = entrance * Math.max(rowLook.opacity, columnLook.opacity, classLook.opacity);
	const cx = x + CELL / 2;
	const cy = y + CELL / 2;
	return (
		<g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${(0.85 + 0.15 * entrance) * (1 + 0.06 * lit)}) translate(${-cx} ${-cy})`}>
			<rect x={x + 3} y={y + 3} width={CELL - 6} height={CELL - 6} rx={12} fill={look.fill} stroke={lit > 0.5 ? palette.lesson : withAlpha(palette.ink, 0.25)} strokeWidth={lit > 0.5 ? 5 : 2} />
			<GenotypeText text={text} x={cx} y={cy + size * 0.36} size={size} textAnchor="middle" fontWeight={800} fill={look.text} fontFamily={palette.fontBody} />
		</g>
	);
};

const LegendItem: React.FC<{index: number; label: string; share: string; fill: string; x: number; y: number; entrance: number}> = ({index, label, share, fill, x, y, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`p${index + 1}`, entrance);
	const lit = look.focused;
	return (
		<g opacity={look.opacity}>
			<rect x={x} y={y + 10} width={48} height={48} rx={10} fill={fill} stroke={lit > 0.5 ? palette.lesson : withAlpha(palette.ink, 0.3)} strokeWidth={lit > 0.5 ? 4 : 2} />
			<text x={x + 66} y={y + 45} fontSize={30} fontWeight={lit > 0.5 ? 800 : 700} fill={palette.ink} fontFamily={palette.fontBody}>
				{label}
			</text>
			<text x={x + LEGEND - 44} y={y + 47} textAnchor="end" fontSize={34} fontWeight={800} fill={palette.lesson} fontFamily={palette.fontBody}>
				{share}
			</text>
		</g>
	);
};
