import React from 'react';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {RichText} from '../Typography/RichText';
import {withAlpha} from '../../Themes/Theme';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {useElementState, UNFOCUSED_FADE} from './VisualTimeline';
import type {CourseVisual} from './VisualSchemas';
import {BRAND_TYPOGRAPHY} from '../../Configurations/BrandTypography';

type Comparison = Extract<CourseVisual, {kind: 'comparison'}>;
type Table = Extract<CourseVisual, {kind: 'table'}>;
type Venn = Extract<CourseVisual, {kind: 'venn'}>;

/**
 * Beats on the language visuals (sentence, comparison, table). A part a beat
 * `show`s comes in with that beat; a part a beat `focus`es turns to the
 * lesson colour and grows a little while the rest dims. Part names:
 *
 *   sentence     w1, w2, ... one per word tile, left to right (LanguageVisuals)
 *   comparison   c1, c2, c3 the columns; c1-1, c1-2, ... the items of a column
 *   table        r1, r2, ... the rows; col1, col2, ... the columns (with their header)
 *
 * Without beats nothing changes: the parts build themselves in their first seconds.
 * These visuals take the width of their box; CourseVisual lets them grow to fill it.
 */
export const partLook = (state: {appear: number; emphasis: number; dim: number}) => ({opacity: state.appear * (1 - UNFOCUSED_FADE * state.dim), emphasis: state.emphasis});

/** Colours of the columns of a comparison and the sets of a Venn diagram: the lesson, the ink, the lesson's deep tone. No brand orange (docs/CourseColors.md). */
const COMPARISON_ACCENTS = (palette: ReturnType<typeof useVisualPalette>): [string, string, string] => [palette.lesson, palette.ink, palette.lessonDeep];

/** Two or three columns side by side, filled in one after another: the usual shape of "what is the difference". */
export const ComparisonVisual: React.FC<VisualBoxProps & {visual: Comparison}> = ({visual, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	return (
		<div style={{width: '100%', display: 'flex', gap: u(24), alignItems: 'stretch'}}>
			{visual.columns.map((column, index) => (
				<ComparisonColumn key={index} id={`c${index + 1}`} column={column} accent={COMPARISON_ACCENTS(palette)[index]} delaySeconds={delaySeconds + index * 0.5} />
			))}
		</div>
	);
};

const ComparisonColumn: React.FC<{id: string; column: Comparison['columns'][number]; accent: string; delaySeconds: number}> = ({id, column, accent, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.4);
	const state = useElementState(id);
	const look = partLook(state);
	return (
		<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRadius: u(28), overflow: 'hidden', backgroundColor: palette.surface, border: `${u(3)}px solid ${palette.border}`, boxShadow: look.emphasis > 0.02 ? `inset 0 0 0 ${u(5 * look.emphasis)}px ${accent}` : 'none', opacity: show * look.opacity, transform: `translateY(${(1 - show) * u(30)}px)`}}>
			<div style={{backgroundColor: accent, color: '#FFFFFF', padding: `${u(18)}px ${u(24)}px`, fontFamily: palette.fontDisplay, fontWeight: 800, fontSize: u(36)}}>{column.title}</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(16), padding: u(24)}}>
				{column.items.map((item, index) => (
					<ComparisonItem key={index} id={`${id}-${index + 1}`} text={item} accent={accent} columnDim={state.dim} columnFocus={state.emphasis} delaySeconds={delaySeconds + 0.25 + index * 0.18} />
				))}
			</div>
		</div>
	);
};

/**
 * An item of a column. It fades only by what its column does not already (two fades multiplied left the text at a
 * tenth of its strength), and never while its own column is in focus (focusing a column used to fade its items).
 */
const ComparisonItem: React.FC<{id: string; text: string; accent: string; columnDim: number; columnFocus: number; delaySeconds: number}> = ({id, text, accent, columnDim, columnFocus, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.3);
	const state = useElementState(id);
	const look = partLook({...state, dim: Math.max(0, state.dim - columnDim - columnFocus)});
	return (
		<div style={{display: 'flex', gap: u(14), alignItems: 'baseline', opacity: show * look.opacity, color: palette.onSurface, margin: `-${u(8)}px -${u(12)}px`, padding: `${u(8)}px ${u(12)}px`, borderRadius: u(14), backgroundColor: withAlpha(accent, 0.14 * look.emphasis)}}>
			<div style={{width: u(12), height: u(12), borderRadius: '50%', backgroundColor: accent, flexShrink: 0, transform: `translateY(-${u(4)}px) scale(${1 + 0.6 * look.emphasis})`}} />
			<RichText text={text} size={34} />
		</div>
	);
};

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
	const cell = (column: number, isHeader: boolean, emphasis: number): React.CSSProperties => ({
		padding: `${u(14)}px ${u(20)}px`,
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

/** Two or three overlapping sets with their own items and the shared ones in the middle. */
export const VennVisual: React.FC<VisualBoxProps & {visual: Venn}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const three = visual.sets.length === 3;
	const radius = Math.min(width, height) * (three ? 0.28 : 0.32);
	const cx = width / 2;
	const cy = height / 2 + (three ? radius * 0.18 : 0);
	const centres: [number, number][] = three
		? [[cx - radius * 0.6, cy - radius * 0.35], [cx + radius * 0.6, cy - radius * 0.35], [cx, cy + radius * 0.65]]
		: [[cx - radius * 0.62, cy], [cx + radius * 0.62, cy]];
	const colours = COMPARISON_ACCENTS(palette);
	const shared = useReveal(delaySeconds + visual.sets.length * 0.4 + 0.2, 0.4);
	const textStyle = {fontFamily: palette.fontBody, fontWeight: 700, fontSize: u(30)};

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			{visual.sets.map((set, index) => (
				<VennSet key={index} centre={centres[index]} radius={radius} colour={colours[index]} label={set.label} items={set.items} away={[centres[index][0] - cx, centres[index][1] - cy]} delaySeconds={delaySeconds + index * 0.4} />
			))}
			<g opacity={shared}>
				{visual.shared.map((item, index) => (
					<text key={item} x={cx} y={(three ? cy - radius * 0.05 : cy) + (index - (visual.shared.length - 1) / 2) * u(38)} textAnchor="middle" fill={palette.ink} style={textStyle}>{item}</text>
				))}
			</g>
		</svg>
	);
};

const VennSet: React.FC<{centre: [number, number]; radius: number; colour: string; label: string; items: string[]; away: [number, number]; delaySeconds: number}> = ({centre, radius, colour, label, items, away, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.45, 'overshoot');
	const length = Math.hypot(away[0], away[1]) || 1;
	const itemsAt = [centre[0] + (away[0] / length) * radius * 0.45, centre[1] + (away[1] / length) * radius * 0.45];
	const labelAt = [centre[0] + (away[0] / length) * radius * 1.12, centre[1] + (away[1] / length) * radius * 1.12];
	return (
		<g opacity={Math.min(1, show)}>
			<circle cx={centre[0]} cy={centre[1]} r={radius * show} fill={colour} fillOpacity={0.16} stroke={colour} strokeWidth={u(5)} />
			<text x={labelAt[0]} y={labelAt[1] + (away[1] > 0 ? u(36) : -u(6))} textAnchor="middle" fill={colour} style={{fontFamily: palette.fontDisplay, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(40)}}>{label}</text>
			{items.map((item, index) => (
				<text key={item} x={itemsAt[0]} y={itemsAt[1] + (index - (items.length - 1) / 2) * u(36)} textAnchor="middle" fill={palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 600, fontSize: u(28)}}>{item}</text>
			))}
		</g>
	);
};
