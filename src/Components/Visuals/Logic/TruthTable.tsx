import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {evaluate, parseFormula, truthRows, truthVerdict} from './Propositional';

type TruthTable = Extract<CourseVisual, {kind: 'truthTable'}>;

/** The figure's stage: the table in the middle, the row tags to its right, the verdict under it. */
export const TRUTH_TABLE_STAGE = {width: 1500, height: 760} as const;

const TRUE = '#2E8B57';
const FALSE = '#C0392B';
/** Natural sizes; the whole table is then scaled to fill the stage (a two-row table drawn at these sizes was a stamp). */
const LETTER_WIDTH = 104;
const HEADER = 84;
const ROW = 72;
const TAG_ROOM = 250;
const VERDICT_ROOM = 100;

/** A formula column's width: wide enough for its header at 34 units, never narrower than a value. */
const formulaWidth = (text: string) => Math.max(140, Math.min(380, text.length * 21 + 56));

/** The whole table worked out: every row's letter values, each formula's value and what the check decides. */
export const solveTruthTable = (visual: Pick<TruthTable, 'variables' | 'columns' | 'check'>) => {
	const interpretations = truthRows(visual.variables);
	const formulas = visual.columns.map((column) => parseFormula(column.formula));
	const values = interpretations.map((row) => formulas.map((formula) => evaluate(formula, row)));
	const decided = truthVerdict(values, visual.check);
	return {interpretations, values, marked: decided.rows, tag: decided.tag, verdict: decided.verdict};
};

/**
 * A truth table worked out by the engine: the letter columns (part v) come in first, then each formula's column fills
 * row by row as the narration reaches it (c1…), so the student sees every value being found. `check` marks the rows
 * that decide (isaret) and writes the verdict under the table (sonuc): consistency (doğrulayıcı rows; totoloji,
 * tutarlı, tutarsız), validity (yanlışlayıcı rows), joint consistency (ortak doğrulayıcı rows) or equivalence of the
 * last two columns (rows where they differ). Rows are parts r1… too. The table grows to fill the stage, up to twice
 * its natural size.
 */
export const TruthTableVisual: React.FC<VisualBoxProps & {visual: TruthTable}> = ({visual, width, height, delaySeconds = 0}) => {
	const seconds = useSceneSeconds();
	const palette = useVisualPalette();
	const solved = solveTruthTable(visual);
	const count = solved.interpretations.length;
	const checked = visual.check !== 'none';
	const widths = [...visual.variables.map(() => LETTER_WIDTH), ...visual.columns.map((column) => formulaWidth(column.formula))];
	const naturalWidth = widths.reduce((sum, value) => sum + value, 0);
	const naturalHeight = HEADER + ROW * count;
	const k = Math.min(2, (TRUTH_TABLE_STAGE.width - 40) / (naturalWidth + (checked ? TAG_ROOM : 0)), (TRUTH_TABLE_STAGE.height - 20) / (naturalHeight + (checked ? VERDICT_ROOM : 0)));
	const header = HEADER * k;
	const rowHeight = ROW * k;
	const scaled = widths.map((value) => value * k);
	const tableWidth = naturalWidth * k;
	const tagRoom = checked ? TAG_ROOM * k : 0;
	const left = (TRUTH_TABLE_STAGE.width - tableWidth - tagRoom) / 2;
	const top = (TRUTH_TABLE_STAGE.height - header - rowHeight * count - (checked ? VERDICT_ROOM * k : 0)) / 2;
	const xs = scaled.map((_, index) => left + scaled.slice(0, index).reduce((sum, value) => sum + value, 0));
	const letters = usePartLook('v', easeFrom(seconds, delaySeconds + 0.2, 0.6));
	const columnStart = (index: number) => delaySeconds + 0.9 + index * 1.3;
	const marks = usePartLook('isaret', easeFrom(seconds, columnStart(visual.columns.length) + 0.2, 0.6));
	const verdict = usePartLook('sonuc', easeFrom(seconds, columnStart(visual.columns.length) + 0.9, 0.6));
	const fontSize = 36 * k;
	const rowY = (row: number) => top + header + row * rowHeight;
	const verdictSize = 32 * k;
	const verdictWidth = Math.min(TRUTH_TABLE_STAGE.width - 40, solved.verdict.length * verdictSize * 0.56 + 64 * k);
	const verdictY = top + header + rowHeight * count + 30 * k;
	return (
		<World width={width} height={height} viewWidth={TRUTH_TABLE_STAGE.width} viewHeight={TRUTH_TABLE_STAGE.height}>
			<rect x={left - 8 * k} y={top} width={tableWidth + 16 * k} height={header + rowHeight * count} rx={22 * k} fill={palette.surface} stroke={palette.border} strokeWidth={3 * k} />
			{solved.interpretations.map((_, row) => (
				<RowBand key={row} id={`r${row + 1}`} x={left - 8 * k} y={rowY(row)} width={tableWidth + 16 * k} height={rowHeight} striped={row % 2 === 1} marked={solved.marked.includes(row) ? marks.drawn : 0} k={k} />
			))}
			<line x1={left - 8 * k} x2={left + tableWidth + 8 * k} y1={top + header} y2={top + header} stroke={palette.axis} strokeWidth={3 * k} />
			<line x1={xs[visual.variables.length]} x2={xs[visual.variables.length]} y1={top + 10 * k} y2={top + header + rowHeight * count - 10 * k} stroke={palette.axis} strokeWidth={3 * k} />
			{visual.variables.map((letter, index) => (
				<g key={letter} opacity={letters.opacity}>
					<HeaderText x={xs[index] + scaled[index] / 2} y={top + header / 2} text={letter} size={40 * k} colour={palette.lesson} />
					{solved.interpretations.map((row, rowIndex) => (
						<Value key={rowIndex} x={xs[index] + scaled[index] / 2} y={rowY(rowIndex) + rowHeight / 2} value={row[letter]} size={fontSize} shown={Math.min(1, letters.drawn * count - rowIndex * 0.5)} />
					))}
				</g>
			))}
			{visual.columns.map((column, index) => (
				<FormulaColumn
					key={index}
					id={`c${index + 1}`}
					header={column.label ?? column.formula}
					x={xs[visual.variables.length + index]}
					width={scaled[visual.variables.length + index]}
					top={top}
					headerHeight={header}
					rowHeight={rowHeight}
					values={solved.values.map((row) => row[index])}
					fontSize={fontSize}
					headerSize={34 * k}
					k={k}
					entrance={easeFrom(seconds, columnStart(index), 1.1)}
				/>
			))}
			{checked ? (
				<>
					{solved.marked.map((row) => (
						<text key={row} x={left + tableWidth + 30 * k} y={rowY(row) + rowHeight / 2} dominantBaseline="middle" fontSize={28 * k} fontWeight={800} fill={palette.lesson} fontFamily={palette.fontBody} opacity={marks.opacity}>
							{`← ${solved.tag}`}
						</text>
					))}
					<g opacity={verdict.opacity}>
						<rect x={left + tableWidth / 2 - verdictWidth / 2} y={verdictY} width={verdictWidth} height={64 * k} rx={32 * k} fill={verdict.focused > 0.5 ? palette.lesson : withAlpha(palette.lesson, 0.14)} stroke={palette.lesson} strokeWidth={3 * k} />
						<text x={left + tableWidth / 2} y={verdictY + 33 * k} textAnchor="middle" dominantBaseline="middle" fontSize={verdictSize} fontWeight={800} fill={verdict.focused > 0.5 ? palette.onLesson : palette.lessonDeep} fontFamily={palette.fontBody}>
							{solved.verdict}
						</text>
					</g>
				</>
			) : null}
		</World>
	);
};

const RowBand: React.FC<{id: string; x: number; y: number; width: number; height: number; striped: boolean; marked: number; k: number}> = ({id, x, y, width, height, striped, marked, k}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, 1);
	const tint = Math.max(marked * 0.2, look.focused * 0.26);
	return (
		<g>
			{striped ? <rect x={x} y={y} width={width} height={height} fill={withAlpha(palette.ink, 0.035)} /> : null}
			{tint > 0 ? <rect x={x} y={y + 3 * k} width={width} height={height - 6 * k} rx={14 * k} fill={withAlpha(palette.lesson, tint)} stroke={look.focused > 0.5 ? palette.lesson : 'none'} strokeWidth={3 * k} /> : null}
		</g>
	);
};

const HeaderText: React.FC<{x: number; y: number; text: string; size: number; colour: string}> = ({x, y, text, size, colour}) => {
	const palette = useVisualPalette();
	return (
		<text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={800} fill={colour} fontFamily={palette.fontBody}>
			{text}
		</text>
	);
};

const Value: React.FC<{x: number; y: number; value: boolean; size: number; shown: number}> = ({x, y, value, size, shown}) => {
	const palette = useVisualPalette();
	const appear = Math.max(0, Math.min(1, shown));
	return (
		<text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size * (0.7 + 0.3 * appear)} fontWeight={800} fill={value ? TRUE : FALSE} fontFamily={palette.fontBody} opacity={appear}>
			{value ? 'D' : 'Y'}
		</text>
	);
};

const FormulaColumn: React.FC<{id: string; header: string; x: number; width: number; top: number; headerHeight: number; rowHeight: number; values: boolean[]; fontSize: number; headerSize: number; k: number; entrance: number}> = ({id, header, x, width, top, headerHeight, rowHeight, values, fontSize, headerSize, k, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const lit = look.focused > 0.5;
	return (
		<g opacity={look.opacity}>
			{lit ? <rect x={x + 4 * k} y={top + 6 * k} width={width - 8 * k} height={headerHeight + rowHeight * values.length - 12 * k} rx={16 * k} fill="none" stroke={palette.lesson} strokeWidth={4 * k} /> : null}
			<HeaderText x={x + width / 2} y={top + headerHeight / 2} text={header} size={headerSize} colour={lit ? palette.lesson : palette.ink} />
			{values.map((value, row) => (
				<Value key={row} x={x + width / 2} y={top + headerHeight + row * rowHeight + rowHeight / 2} value={value} size={fontSize} shown={look.drawn * (values.length + 1) - row - 0.5} />
			))}
		</g>
	);
};
