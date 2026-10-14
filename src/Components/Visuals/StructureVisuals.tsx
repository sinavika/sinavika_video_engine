import React from 'react';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {RichText} from '../Typography/RichText';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import type {CourseVisual} from './VisualSchemas';

type Sentence = Extract<CourseVisual, {kind: 'sentence'}>;
type Comparison = Extract<CourseVisual, {kind: 'comparison'}>;
type Table = Extract<CourseVisual, {kind: 'table'}>;
type Venn = Extract<CourseVisual, {kind: 'venn'}>;

/**
 * A sentence taken apart: each part on its own tile, the parts that matter
 * in the lesson colour, and the role of each part (Özne, Yüklem, Subject...)
 * under it. Parts appear left to right, as they are read.
 */
export const SentenceVisual: React.FC<VisualBoxProps & {visual: Sentence}> = ({visual, width, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const translation = useReveal(delaySeconds + 0.3 + visual.parts.length * 0.22, 0.4);
	return (
		<div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(30)}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: u(14)}}>
				{visual.parts.map((part, index) => (
					<SentencePart key={index} {...part} delaySeconds={delaySeconds + index * 0.22} />
				))}
			</div>
			{visual.translation ? (
				<div style={{fontFamily: palette.fontBody, fontStyle: 'italic', fontSize: u(32), color: palette.muted, opacity: translation, textAlign: 'center'}}>{visual.translation}</div>
			) : null}
		</div>
	);
};

const SentencePart: React.FC<Sentence['parts'][number] & {delaySeconds: number}> = ({text, role, highlight, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.35, 'overshoot');
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(10), opacity: Math.min(1, show), transform: `translateY(${(1 - show) * u(24)}px)`}}>
			<div style={{padding: `${u(14)}px ${u(22)}px`, borderRadius: u(16), backgroundColor: highlight ? palette.lesson : palette.surface, color: highlight ? palette.onLesson : palette.onSurface, border: `${u(3)}px solid ${highlight ? palette.lesson : palette.border}`, fontFamily: palette.fontDisplay, fontWeight: 800, fontSize: u(46), lineHeight: 1.1}}>{text}</div>
			{role ? (
				<div style={{borderTop: `${u(4)}px solid ${highlight ? palette.lesson : palette.axis}`, paddingTop: u(6), fontFamily: palette.fontBody, fontWeight: 700, fontSize: u(24), color: highlight ? palette.lesson : palette.muted, textTransform: 'uppercase', letterSpacing: '0.04em'}}>{role}</div>
			) : null}
		</div>
	);
};

/** Two or three columns side by side, filled in one after another: the usual shape of "what is the difference". */
export const ComparisonVisual: React.FC<VisualBoxProps & {visual: Comparison}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	return (
		<div style={{width, maxHeight: height, display: 'flex', gap: u(24), alignItems: 'stretch'}}>
			{visual.columns.map((column, index) => (
				<ComparisonColumn key={index} column={column} accent={index === 0 ? palette.lesson : index === 1 ? palette.brand : palette.ink} delaySeconds={delaySeconds + index * 0.5} />
			))}
		</div>
	);
};

const ComparisonColumn: React.FC<{column: Comparison['columns'][number]; accent: string; delaySeconds: number}> = ({column, accent, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.4);
	return (
		<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRadius: u(28), overflow: 'hidden', backgroundColor: palette.surface, border: `${u(3)}px solid ${palette.border}`, opacity: show, transform: `translateY(${(1 - show) * u(30)}px)`}}>
			<div style={{backgroundColor: accent, color: '#FFFFFF', padding: `${u(18)}px ${u(24)}px`, fontFamily: palette.fontDisplay, fontWeight: 800, fontSize: u(36)}}>{column.title}</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(16), padding: u(24)}}>
				{column.items.map((item, index) => (
					<ComparisonItem key={index} text={item} accent={accent} delaySeconds={delaySeconds + 0.25 + index * 0.18} />
				))}
			</div>
		</div>
	);
};

const ComparisonItem: React.FC<{text: string; accent: string; delaySeconds: number}> = ({text, accent, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.3);
	return (
		<div style={{display: 'flex', gap: u(14), alignItems: 'baseline', opacity: show, color: palette.onSurface}}>
			<div style={{width: u(12), height: u(12), borderRadius: '50%', backgroundColor: accent, flexShrink: 0, transform: `translateY(-${u(4)}px)`}} />
			<RichText text={text} size={34} />
		</div>
	);
};

/** A small table, row by row; one column can carry the lesson colour (the result of a truth table, the answer column). */
export const TableVisual: React.FC<VisualBoxProps & {visual: Table}> = ({visual, width, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const header = useReveal(delaySeconds, 0.35);
	const cell = (column: number, isHeader: boolean): React.CSSProperties => ({
		padding: `${u(14)}px ${u(20)}px`,
		textAlign: 'center',
		backgroundColor: column === visual.highlightColumn ? (isHeader ? palette.lesson : palette.fill) : isHeader ? palette.ink : 'transparent',
		color: isHeader ? palette.surface : palette.onSurface,
		borderBottom: `${u(2)}px solid ${palette.border}`,
	});
	return (
		<div style={{width, display: 'flex', justifyContent: 'center'}}>
			<table style={{borderCollapse: 'collapse', borderRadius: u(20), overflow: 'hidden', backgroundColor: palette.surface, fontFamily: palette.fontBody, minWidth: width * 0.6}}>
				<thead style={{opacity: header}}>
					<tr>
						{visual.header.map((text, index) => (
							<th key={index} style={cell(index, true)}>
								<RichText text={text} size={32} weight={800} align="center" color={palette.surface} />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{visual.rows.map((row, index) => (
						<TableRow key={index} row={row} cell={cell} delaySeconds={delaySeconds + 0.3 + index * 0.22} />
					))}
				</tbody>
			</table>
		</div>
	);
};

const TableRow: React.FC<{row: string[]; cell: (column: number, header: boolean) => React.CSSProperties; delaySeconds: number}> = ({row, cell, delaySeconds}) => {
	const show = useReveal(delaySeconds, 0.3);
	return (
		<tr style={{opacity: show}}>
			{row.map((text, index) => (
				<td key={index} style={cell(index, false)}>
					<RichText text={text} size={32} align="center" />
				</td>
			))}
		</tr>
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
	const colours = [palette.lesson, palette.brand, palette.ink];
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
			<text x={labelAt[0]} y={labelAt[1] + (away[1] > 0 ? u(36) : -u(6))} textAnchor="middle" fill={colour} style={{fontFamily: palette.fontDisplay, fontWeight: 900, fontSize: u(40)}}>{label}</text>
			{items.map((item, index) => (
				<text key={item} x={itemsAt[0]} y={itemsAt[1] + (index - (items.length - 1) / 2) * u(36)} textAnchor="middle" fill={palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 600, fontSize: u(28)}}>{item}</text>
			))}
		</g>
	);
};
