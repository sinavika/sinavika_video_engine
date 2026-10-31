import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {arrowHead} from '../Physics/ArrowHead';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Periodic = Extract<CourseVisual, {kind: 'periodic'}>;

/** The first twenty elements: symbol, atomic number, period (row) and A group (column, 1–8), and class. */
const FIRST_TWENTY: {symbol: string; z: number; period: number; group: number; kind: 'metal' | 'semimetal' | 'nonmetal' | 'noble'}[] = [
	{symbol: 'H', z: 1, period: 1, group: 1, kind: 'nonmetal'},
	{symbol: 'He', z: 2, period: 1, group: 8, kind: 'noble'},
	{symbol: 'Li', z: 3, period: 2, group: 1, kind: 'metal'},
	{symbol: 'Be', z: 4, period: 2, group: 2, kind: 'metal'},
	{symbol: 'B', z: 5, period: 2, group: 3, kind: 'semimetal'},
	{symbol: 'C', z: 6, period: 2, group: 4, kind: 'nonmetal'},
	{symbol: 'N', z: 7, period: 2, group: 5, kind: 'nonmetal'},
	{symbol: 'O', z: 8, period: 2, group: 6, kind: 'nonmetal'},
	{symbol: 'F', z: 9, period: 2, group: 7, kind: 'nonmetal'},
	{symbol: 'Ne', z: 10, period: 2, group: 8, kind: 'noble'},
	{symbol: 'Na', z: 11, period: 3, group: 1, kind: 'metal'},
	{symbol: 'Mg', z: 12, period: 3, group: 2, kind: 'metal'},
	{symbol: 'Al', z: 13, period: 3, group: 3, kind: 'metal'},
	{symbol: 'Si', z: 14, period: 3, group: 4, kind: 'semimetal'},
	{symbol: 'P', z: 15, period: 3, group: 5, kind: 'nonmetal'},
	{symbol: 'S', z: 16, period: 3, group: 6, kind: 'nonmetal'},
	{symbol: 'Cl', z: 17, period: 3, group: 7, kind: 'nonmetal'},
	{symbol: 'Ar', z: 18, period: 3, group: 8, kind: 'noble'},
	{symbol: 'K', z: 19, period: 4, group: 1, kind: 'metal'},
	{symbol: 'Ca', z: 20, period: 4, group: 2, kind: 'metal'},
];

const KIND_COLOURS = {metal: '#7FB3E6', semimetal: '#C9B6E4', nonmetal: '#F4C27A', noble: '#9ED9B3'} as const;

const KIND_NAMES = {metal: 'metal', semimetal: 'yarı metal', nonmetal: 'ametal', noble: 'soy gaz'} as const;

const TREND_TEXT = {
	radius: {period: 'yarıçap artar', group: 'yarıçap artar', towardsLeft: true, down: true},
	metallic: {period: 'metalik özellik artar', group: 'metalik özellik artar', towardsLeft: true, down: true},
	ionization: {period: 'iyonlaşma enerjisi artar', group: 'iyonlaşma enerjisi artar', towardsLeft: false, down: false},
	electronegativity: {period: 'elektronegatiflik artar', group: 'elektronegatiflik artar', towardsLeft: false, down: false},
} as const;

/**
 * The first twenty elements in their A groups: each cell a symbol over its atomic number, coloured by class
 * when asked; highlighted elements stand out, and a trend is drawn as one arrow along the periods and one down
 * the groups.
 */
export const PeriodicVisual: React.FC<VisualBoxProps & {visual: Periodic}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const appear = useReveal(delaySeconds, 0.6);
	const trendIn = useReveal(delaySeconds + 0.9, 0.6);
	const fontSize = u(30);
	// Room around the 8 × 4 grid: group names above, period numbers left, the legend or trend arrows below and right.
	const roomLeft = u(56);
	const roomTop = u(56);
	const roomRight = visual.trend ? u(90) : u(10);
	const roomBottom = visual.trend || visual.categories ? u(90) : u(10);
	const cell = Math.min((width - roomLeft - roomRight) / 8, (height - roomTop - roomBottom) / 4);
	const left = (width - roomLeft - roomRight - cell * 8) / 2 + roomLeft;
	const top = (height - roomTop - roomBottom - cell * 4) / 2 + roomTop;
	const highlighted = new Set(visual.highlight);
	const trend = visual.trend ? TREND_TEXT[visual.trend] : undefined;
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={appear}>
				{Array.from({length: 8}, (_, index) => (
					<text key={`g${index}`} x={left + cell * (index + 0.5)} y={top - u(16)} textAnchor="middle" fill={palette.muted} fontSize={fontSize * 0.8} fontWeight={800}>
						{`${index + 1}A`}
					</text>
				))}
				{Array.from({length: 4}, (_, index) => (
					<text key={`p${index}`} x={left - u(18)} y={top + cell * (index + 0.5) + fontSize * 0.3} textAnchor="end" fill={palette.muted} fontSize={fontSize * 0.8} fontWeight={800}>
						{index + 1}
					</text>
				))}
			</g>
			{FIRST_TWENTY.map((element) => {
				const x = left + cell * (element.group - 1);
				const y = top + cell * (element.period - 1);
				const lit = highlighted.has(element.symbol);
				return (
					<Part key={element.symbol} id={element.symbol}>
						{(look) => (
							<g opacity={appear * (highlighted.size && !lit ? 0.45 : 1) * look.opacity}>
								<rect x={x + u(3)} y={y + u(3)} width={cell - u(6)} height={cell - u(6)} rx={u(8)} fill={visual.categories ? KIND_COLOURS[element.kind] : palette.surface} stroke={lit || look.scale > 1 ? palette.brand : palette.ink} strokeWidth={(lit ? u(5) : u(2.5)) * look.scale} />
								<text x={x + cell / 2} y={y + cell * 0.56} textAnchor="middle" fill={palette.ink} fontSize={Math.min(fontSize * 1.3, cell * 0.38)} fontWeight={800}>
									{element.symbol}
								</text>
								<text x={x + cell / 2} y={y + cell * 0.84} textAnchor="middle" fill={palette.muted} fontSize={Math.min(fontSize * 0.75, cell * 0.22)} fontWeight={700}>
									{element.z}
								</text>
							</g>
						)}
					</Part>
				);
			})}
			{visual.categories && !trend ? (
				<g opacity={appear}>
					{(['metal', 'semimetal', 'nonmetal', 'noble'] as const).map((kind, index) => (
						<g key={kind} transform={`translate(${left + index * cell * 2}, ${top + cell * 4 + u(30)})`}>
							<rect width={u(30)} height={u(30)} rx={u(6)} fill={KIND_COLOURS[kind]} stroke={palette.ink} strokeWidth={u(2)} />
							<text x={u(40)} y={u(24)} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={700}>
								{KIND_NAMES[kind]}
							</text>
						</g>
					))}
				</g>
			) : null}
			{trend ? (
				<g opacity={trendIn}>
					{/* Along the period: under the table. */}
					<line x1={left + u(20)} x2={left + cell * 8 - u(20)} y1={top + cell * 4 + u(36)} y2={top + cell * 4 + u(36)} stroke={palette.brand} strokeWidth={u(7)} />
					<path d={arrowHead(trend.towardsLeft ? left : left + cell * 8, top + cell * 4 + u(36), trend.towardsLeft ? Math.PI : 0, u(26))} fill={palette.brand} />
					<text x={left + cell * 4} y={top + cell * 4 + u(80)} textAnchor="middle" fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800}>
						{trend.period}
					</text>
					{/* Down the group: right of the table. */}
					<line x1={left + cell * 8 + u(36)} x2={left + cell * 8 + u(36)} y1={top + u(20)} y2={top + cell * 4 - u(20)} stroke={palette.brand} strokeWidth={u(7)} />
					<path d={arrowHead(left + cell * 8 + u(36), trend.down ? top + cell * 4 : top, trend.down ? Math.PI / 2 : -Math.PI / 2, u(26))} fill={palette.brand} />
				</g>
			) : null}
		</svg>
	);
};
