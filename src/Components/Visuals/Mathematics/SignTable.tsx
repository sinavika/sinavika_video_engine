import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {textWidth} from '../FigureLabel';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {signTableRows, solutionCells, solutionText, written, type Sign} from './MathWork';

type SignTable = Extract<CourseVisual, {kind: 'signTable'}>;

const FONT = 46;
const ROW = 92;
const INTERVAL = 150;
const POINT = 112;
const PAD = 28;

/** The line under a table with a relation: the solution set worked out from the result row. */
const solutionLine = (visual: SignTable): string => {
	const {result} = signTableRows(visual.factors, visual.points);
	return `Çözüm kümesi: ${solutionText(visual.points, solutionCells(result, visual.relation ?? '>'))}`;
};

/** The sign table's drawing in its own units: the label column, the cells (interval, point, interval …) and the solution line. */
export const signTableFrame = (visual: SignTable) => {
	const labels = ['x', visual.resultLabel, ...visual.factors.map((factor) => factor.label)];
	const labelWidth = Math.max(...labels.map((label) => textWidth(label, FONT, 700))) + 2 * PAD;
	const cells = 2 * visual.points.length + 1;
	const cellLeft = (index: number) => labelWidth + Math.floor((index + 1) / 2) * INTERVAL + Math.floor(index / 2) * POINT;
	const cellWidth = (index: number) => (index % 2 === 0 ? INTERVAL : POINT);
	const rows = visual.factors.length + 2;
	const solution = visual.relation ? solutionLine(visual) : undefined;
	// The solution set is written under the table; a long union widens the drawing instead of running off it.
	const width = Math.max(cellLeft(cells - 1) + INTERVAL + PAD, solution ? textWidth(solution, FONT, 800) + 2 * PAD : 0);
	return {labelWidth, cells, cellLeft, cellWidth, rows, solution, width, height: rows * ROW + (solution ? ROW : 0) + PAD};
};

/**
 * The sign table (işaret tablosu): the critical points on the top row, each factor's signs row by row as the lesson
 * comes to it (the signs sweep from left to right), then the result row, worked out by the engine from the factors.
 * With a relation, the intervals that solve the inequality are lit and the solution set is written under the table.
 */
export const SignTableVisual: React.FC<VisualBoxProps & {visual: SignTable}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {colors} = useTheme();
	const frame = signTableFrame(visual);
	const {factors: factorSigns, result} = signTableRows(visual.factors, visual.points);
	const chosen = visual.relation ? solutionCells(result, visual.relation) : result.map(() => false);
	const top = usePartLook('x', useReveal(delaySeconds, 0.5));
	const factorLooks = [0, 1, 2, 3].map((index) => usePartLook(`f${index + 1}`, useReveal(delaySeconds + 0.6 + index * 0.9, 0.7)));
	const resultLook = usePartLook('result', useReveal(delaySeconds + 0.6 + visual.factors.length * 0.9, 0.7));
	const solutionLook = usePartLook('solution', useReveal(delaySeconds + 1.4 + visual.factors.length * 0.9, 0.6));
	const columnLooks = [0, 1, 2, 3, 4, 5].map((index) => usePartLook(`i${index + 1}`, 1));
	const rowY = (row: number) => PAD / 2 + row * ROW;
	const tableBottom = rowY(frame.rows);
	const signColour = (sign: Sign) => (sign === '+' ? palette.lesson : sign === '−' ? palette.brand : palette.ink);

	/** One row of signs, sweeping in from the left as it is drawn. */
	const signRow = (signs: readonly Sign[], row: number, drawn: number, opacity: number) =>
		signs.map((sign, index) => {
			const shown = Math.max(0, Math.min(1, drawn * signs.length - index));
			const x = frame.cellLeft(index) + frame.cellWidth(index) / 2;
			const y = rowY(row) + ROW / 2;
			if (sign === 'undefined')
				return (
					<g key={index} opacity={opacity * shown}>
						{[-7, 7].map((offset) => (
							<line key={offset} x1={x + offset} x2={x + offset} y1={y - 26} y2={y + 26} stroke={colors.danger} strokeWidth={5} />
						))}
					</g>
				);
			// A point cell shows only a zero; elsewhere on the point the sign of the row is not written.
			if (index % 2 === 1 && sign !== '0') return null;
			return (
				<text key={index} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={signColour(sign)} fontSize={sign === '0' ? FONT : FONT * 1.25} fontWeight={800} opacity={opacity * shown} style={{fontFamily: palette.fontDisplay}}>
					{sign}
				</text>
			);
		});

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<g style={{fontFamily: palette.fontBody}}>
				{/* Columns of the intervals: a beat can point at one (i2); the intervals that solve the inequality are lit. */}
				{Array.from({length: frame.cells}, (_, index) => {
					if (index % 2 === 1) return null;
					const interval = index / 2;
					const look = columnLooks[interval] ?? {opacity: 1, focused: 0};
					const lit = chosen[index] ? solutionLook.opacity : 0;
					const glow = Math.max(look.focused, lit * 0.8);
					return glow > 0.01 ? <rect key={`col${index}`} x={frame.cellLeft(index) + 6} y={rowY(0) + 4} width={frame.cellWidth(index) - 12} height={tableBottom - rowY(0) - 8} rx={18} fill={withAlpha(palette.lesson, 0.16 * glow)} /> : null;
				})}
				{chosen.map((on, index) => (on && index % 2 === 1 ? <circle key={`pt${index}`} cx={frame.cellLeft(index) + POINT / 2} cy={rowY(frame.rows - 1) + ROW / 2} r={34} fill="none" stroke={palette.lesson} strokeWidth={5} opacity={solutionLook.opacity} /> : null))}
				{/* The grid: the label column's edge, the row lines, and a dashed line down through each critical point. */}
				<line x1={frame.labelWidth} x2={frame.labelWidth} y1={rowY(0)} y2={tableBottom} stroke={palette.axis} strokeWidth={4} opacity={top.opacity} />
				{Array.from({length: frame.rows - 1}, (_, row) => (
					<line key={`row${row}`} x1={PAD / 2} x2={frame.width - PAD / 2} y1={rowY(row + 1)} y2={rowY(row + 1)} stroke={row === frame.rows - 2 ? palette.axis : palette.grid} strokeWidth={row === 0 || row === frame.rows - 2 ? 4 : 2} opacity={top.opacity} />
				))}
				{visual.points.map((_, index) => {
					const x = frame.cellLeft(2 * index + 1) + POINT / 2;
					return <line key={`pt-line${index}`} x1={x} x2={x} y1={rowY(1)} y2={tableBottom} stroke={palette.axis} strokeWidth={2} strokeDasharray="10 10" opacity={top.opacity * 0.8} />;
				})}
				{/* Top row: x, −∞, the points, +∞. */}
				<g opacity={top.opacity}>
					<text x={frame.labelWidth / 2} y={rowY(0) + ROW / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT} fontStyle="italic" fontWeight={700}>
						x
					</text>
					<text x={frame.cellLeft(0) + 12} y={rowY(0) + ROW / 2} dominantBaseline="central" fill={palette.muted} fontSize={FONT * 0.85} fontWeight={700}>
						−∞
					</text>
					<text x={frame.width - PAD - 12} y={rowY(0) + ROW / 2} textAnchor="end" dominantBaseline="central" fill={palette.muted} fontSize={FONT * 0.85} fontWeight={700}>
						+∞
					</text>
					{visual.points.map((point, index) => (
						<text key={index} x={frame.cellLeft(2 * index + 1) + POINT / 2} y={rowY(0) + ROW / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT} fontWeight={800}>
							{written(point)}
						</text>
					))}
				</g>
				{visual.factors.map((factor, index) => {
					const look = factorLooks[index];
					return (
						<g key={`f${index}`}>
							<text x={frame.labelWidth / 2} y={rowY(index + 1) + ROW / 2} textAnchor="middle" dominantBaseline="central" fill={look.focused > 0.5 ? palette.lesson : palette.ink} fontSize={FONT} fontWeight={700} opacity={look.opacity}>
								{factor.label}
							</text>
							{signRow(factorSigns[index], index + 1, look.drawn, look.opacity)}
						</g>
					);
				})}
				<g>
					<rect x={PAD / 2} y={rowY(frame.rows - 1) + 4} width={frame.labelWidth - PAD / 2 - 4} height={ROW - 8} rx={16} fill={withAlpha(palette.lesson, 0.14)} opacity={resultLook.opacity} />
					<text x={frame.labelWidth / 2 + PAD / 4} y={rowY(frame.rows - 1) + ROW / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT} fontWeight={800} opacity={resultLook.opacity}>
						{visual.resultLabel}
					</text>
					{signRow(result, frame.rows - 1, resultLook.drawn, resultLook.opacity)}
				</g>
				{frame.solution ? (
					<text x={frame.width / 2} y={tableBottom + ROW * 0.6} textAnchor="middle" dominantBaseline="central" fill={palette.lesson} fontSize={FONT} fontWeight={800} opacity={solutionLook.opacity} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
						{frame.solution}
					</text>
				) : null}
			</g>
		</World>
	);
};
