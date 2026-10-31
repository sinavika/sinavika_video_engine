import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichText} from '../../Typography/RichText';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useElementState} from '../VisualTimeline';

type Table = Extract<CourseVisual, {kind: 'table'}>;

/** How a table cell stands: its row and its column are parts of their own; a cell dims only when both do. */
const useCellLook = (row: string, column: string) => {
	const rowState = useElementState(row);
	const columnState = useElementState(column);
	return {
		opacity: Math.min(rowState.appear, columnState.appear) * (1 - UNFOCUSED_FADE * Math.min(rowState.dim, columnState.dim)),
		emphasis: Math.max(rowState.emphasis, columnState.emphasis),
	};
};

/** A small table, row by row; one column can carry the lesson colour (the result of a truth table, the answer column). */
export const TableVisual: React.FC<VisualBoxProps & {visual: Table}> = ({visual, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const header = useReveal(delaySeconds, 0.35);
	// A long table is limited by the box's height: tighter rows leave the room to its type, which then grows with the
	// box instead of shrinking under the padding. Seven or eight rows get the tightest rows (a table of eight poets
	// was drawn at two thirds of a six-row table's type).
	const rowPadding = visual.rows.length >= 7 ? 5 : visual.rows.length >= 5 ? 8 : 14;
	const cell = (column: number, isHeader: boolean, emphasis: number): React.CSSProperties => ({
		padding: `${u(rowPadding)}px ${u(20)}px`,
		textAlign: 'center',
		backgroundColor: isHeader
			? column === visual.highlightColumn || emphasis > 0.5
				? palette.lesson
				: palette.ink
			: emphasis > 0
				? withAlpha(palette.lesson, 0.12 + 0.2 * emphasis)
				: column === visual.highlightColumn
					? palette.fill
					: 'transparent',
		color: isHeader ? palette.surface : palette.onSurface,
		borderBottom: `${u(2)}px solid ${palette.border}`,
	});
	return (
		<div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
			<table style={{borderCollapse: 'collapse', borderRadius: u(20), overflow: 'hidden', backgroundColor: palette.surface, fontFamily: palette.fontBody, minWidth: '60%'}}>
				<thead style={{opacity: header}}>
					<tr>
						{visual.header.map((text, index) => (
							<TableHeaderCell key={index} text={text} column={index} cell={cell} />
						))}
					</tr>
				</thead>
				<tbody>
					{visual.rows.map((row, index) => (
						<TableRow key={index} id={`r${index + 1}`} row={row} cell={cell} delaySeconds={delaySeconds + 0.3 + index * 0.22} />
					))}
				</tbody>
			</table>
		</div>
	);
};

type CellStyle = (column: number, header: boolean, emphasis: number) => React.CSSProperties;

const TableHeaderCell: React.FC<{text: string; column: number; cell: CellStyle}> = ({text, column, cell}) => {
	const palette = useVisualPalette();
	// The header stays readable while a row is pointed at; it only comes in and lights up with its column.
	const state = useElementState(`col${column + 1}`);
	return (
		<th style={{...cell(column, true, state.emphasis), opacity: state.appear}}>
			<RichText text={text} size={32} weight={800} align="center" color={palette.surface} />
		</th>
	);
};

const TableRow: React.FC<{id: string; row: string[]; cell: CellStyle; delaySeconds: number}> = ({id, row, cell, delaySeconds}) => {
	const show = useReveal(delaySeconds, 0.3);
	return (
		<tr style={{opacity: show}}>
			{row.map((text, index) => (
				<TableCell key={index} row={id} column={index} text={text} cell={cell} />
			))}
		</tr>
	);
};

const TableCell: React.FC<{row: string; column: number; text: string; cell: CellStyle}> = ({row, column, text, cell}) => {
	const look = useCellLook(row, `col${column + 1}`);
	return (
		<td style={{...cell(column, false, look.emphasis), opacity: look.opacity}}>
			<RichText text={text} size={32} align="center" />
		</td>
	);
};
