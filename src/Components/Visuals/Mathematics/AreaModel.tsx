import React, {useId} from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {textWidth} from '../FigureLabel';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {areaCellLabel} from './MathWork';

type AreaModel = Extract<CourseVisual, {kind: 'areaModel'}>;

const FONT = 46;
const SIDE = 76;
const PAD = 30;
const ROOM = 820;

/** The rectangle's size on screen: its rows' and columns' sides on one scale, with room for the side names and the total. */
export const areaModelFrame = (visual: AreaModel) => {
	const across = visual.columns.reduce((total, column) => total + column.size, 0);
	const down = visual.rows.reduce((total, row) => total + row.size, 0);
	const scale = Math.min(ROOM / across, (ROOM * 0.72) / down);
	const total = visual.total ? FONT * 1.8 : 0;
	const totalWidth = visual.total ? textWidth(visual.total, FONT, 800) + 2 * PAD : 0;
	const width = Math.max(SIDE + across * scale + 2 * PAD, totalWidth);
	return {scale, left: Math.max(SIDE + PAD, (width - across * scale) / 2), top: SIDE + PAD / 2, across: across * scale, down: down * scale, width, height: SIDE + down * scale + total + PAD * 1.5};
};

/** Each cell's label: as given, or its area worked out from its sides. */
export const areaLabels = (visual: AreaModel): string[][] => visual.rows.map((row, r) => visual.columns.map((column, c) => visual.cells?.[r]?.[c] ?? areaCellLabel(row.label, column.label)));

/**
 * The area model: a rectangle cut by the sides of its rows and columns, every cell its area. (a + b)² is seen as a²,
 * two ab and b²; (x + 2)(x + 3) as x², 3x, 2x and 6; 23 · 47 as four products. The sides come first, then the cells
 * one by one; `removed` cells are cut away (a² − b²). Parts: rows, columns, r1c1…, total.
 */
export const AreaModelVisual: React.FC<VisualBoxProps & {visual: AreaModel}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const frame = areaModelFrame(visual);
	const labels = areaLabels(visual);
	const columnsLook = usePartLook('columns', useReveal(delaySeconds, 0.6));
	const rowsLook = usePartLook('rows', useReveal(delaySeconds + 0.3, 0.6));
	const cellCount = visual.rows.length * visual.columns.length;
	const cellLooks = Array.from({length: 9}, (_, index) => usePartLook(`r${Math.floor(index / 3) + 1}c${(index % 3) + 1}`, useReveal(delaySeconds + 0.9 + (Math.floor(index / 3) * visual.columns.length + (index % 3)) * 0.45, 0.5)));
	const totalLook = usePartLook('total', useReveal(delaySeconds + 1.2 + cellCount * 0.45, 0.6));
	const xs = visual.columns.reduce<number[]>((edges, column) => [...edges, edges[edges.length - 1] + column.size * frame.scale], [frame.left]);
	const ys = visual.rows.reduce<number[]>((edges, row) => [...edges, edges[edges.length - 1] + row.size * frame.scale], [frame.top]);
	const removed = (r: number, c: number) => visual.removed.some(([row, column]) => row === r && column === c);
	const shades = [0.14, 0.26, 0.38];
	// One pattern per drawing: two area models on a page must not share it.
	const cutId = `area-cut-${useId().replace(/:/g, '')}`;

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<defs>
				<pattern id={cutId} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1={0} y1={0} x2={0} y2={18} stroke={palette.axis} strokeWidth={4} />
				</pattern>
			</defs>
			<g style={{fontFamily: palette.fontDisplay}}>
				{/* The sides: column names over the top edge, row names beside the left edge, each with its length mark. */}
				{visual.columns.map((column, index) => (
					<g key={`c${index}`} opacity={columnsLook.opacity}>
						<line x1={xs[index] + 6} x2={xs[index + 1] - 6} y1={frame.top - 22} y2={frame.top - 22} stroke={palette.lesson} strokeWidth={5} strokeLinecap="round" />
						<text x={(xs[index] + xs[index + 1]) / 2} y={frame.top - 38} textAnchor="middle" fill={palette.lesson} fontSize={FONT} fontWeight={800}>
							{column.label}
						</text>
					</g>
				))}
				{visual.rows.map((row, index) => (
					<g key={`r${index}`} opacity={rowsLook.opacity}>
						<line x1={frame.left - 22} x2={frame.left - 22} y1={ys[index] + 6} y2={ys[index + 1] - 6} stroke={palette.lesson} strokeWidth={5} strokeLinecap="round" />
						<text x={frame.left - 38} y={(ys[index] + ys[index + 1]) / 2} textAnchor="end" dominantBaseline="central" fill={palette.lesson} fontSize={FONT} fontWeight={800}>
							{row.label}
						</text>
					</g>
				))}
				{visual.rows.map((_, r) =>
					visual.columns.map((__, c) => {
						const look = cellLooks[r * 3 + c];
						const cellWidth = xs[c + 1] - xs[c];
						const cellHeight = ys[r + 1] - ys[r];
						const cut = removed(r, c);
						const label = labels[r][c];
						const size = Math.min(FONT * 1.1, (cellWidth - 16) / Math.max(1, textWidth(label, 1, 800)), cellHeight * 0.55);
						return (
							<g key={`${r}-${c}`} opacity={look.opacity}>
								<rect x={xs[c]} y={ys[r]} width={cellWidth} height={cellHeight} fill={cut ? `url(#${cutId})` : withAlpha(palette.lesson, shades[(r + c) % 3] + 0.2 * look.focused)} stroke={look.focused > 0.5 ? palette.brand : palette.ink} strokeWidth={look.focused > 0.5 ? 7 : 4} strokeDasharray={cut ? '14 10' : undefined} />
								<text x={xs[c] + cellWidth / 2} y={ys[r] + cellHeight / 2} textAnchor="middle" dominantBaseline="central" fill={cut ? palette.muted : palette.ink} fontSize={size} fontWeight={800} textDecoration={cut ? 'line-through' : undefined}>
									{label}
								</text>
							</g>
						);
					}),
				)}
				{visual.total ? (
					<text x={frame.width / 2} y={frame.top + frame.down + FONT * 1.45} textAnchor="middle" fill={totalLook.focused > 0.5 ? palette.brand : palette.lesson} fontSize={FONT} fontWeight={800} opacity={totalLook.opacity}>
						{visual.total}
					</text>
				) : null}
			</g>
		</World>
	);
};
