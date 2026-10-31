import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type NumberLine = Extract<CourseVisual, {kind: 'numberLine'}>;

const SLOTS = 8;
const SWEEP_SECONDS = 0.9;

/** The whole numbers between the ends, thinned to at most 13 marks. */
const defaultTicks = (from: number, to: number): number[] => {
	const span = to - from;
	const step = [1, 2, 5, 10, 20, 50].find((candidate) => span / candidate <= 12) ?? 100;
	const ticks: number[] = [];
	for (let value = Math.ceil(from / step) * step; value <= to + 1e-9; value += step) ticks.push(Number(value.toFixed(6)));
	return ticks;
};

/** "−3", "2,5": the minus sign and the decimal comma as a Turkish textbook writes them. */
const written = (value: number): string => `${value < 0 ? '−' : ''}${String(Math.abs(Number(value.toFixed(3)))).replace('.', ',')}`;

/**
 * A number line for inequalities and intervals (owner, 30 Oct 2026: "iyi animasyon"). The line and its marks come
 * first; each interval (parts i1…) then sweeps from its left end to its right end when the narration reaches it, with
 * a filled dot for a closed end, a hollow one for an open end and an arrow for an unbounded one. Intervals on rows 1
 * and 2 float above the line, so the two inequalities of a system can be read separately and their common part on
 * the line itself. Points (p1…) drop onto the line with their labels.
 */
export const NumberLineVisual: React.FC<VisualBoxProps & {visual: NumberLine}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const [from, to] = visual.range;
	const intervalLooks = Array.from({length: SLOTS}, (_, index) => useElementState(index < visual.intervals.length ? `i${index + 1}` : undefined));
	// Every hook is called for every slot, in the same order on every frame; the first beat that names a part starts it.
	const firstStart = (id: string) => {
		const shown = useBeatStartFor(id, 'show');
		const focused = useBeatStartFor(id, 'focus');
		return shown === undefined ? focused : focused === undefined ? shown : Math.min(shown, focused);
	};
	const intervalStarts = Array.from({length: SLOTS}, (_, index) => firstStart(`i${index + 1}`));
	const pointLooks = Array.from({length: SLOTS}, (_, index) => useElementState(index < visual.points.length ? `p${index + 1}` : undefined));
	const pointStarts = Array.from({length: SLOTS}, (_, index) => firstStart(`p${index + 1}`));
	const line = useReveal(delaySeconds, 0.6);

	const rows = Math.max(0, ...visual.intervals.map((interval) => interval.row));
	const pad = u(70);
	const x = (value: number) => pad + ((value - from) / (to - from)) * (width - 2 * pad);
	const tickSize = u(38);
	const rowGap = u(130);
	// The block (labels over the top row, the rows, the line, the numbers under it) sits in the middle of the box.
	const block = u(80) + rows * rowGap + tickSize * 2.4;
	const lineY = (height - block) / 2 + u(80) + rows * rowGap;
	const rowY = (row: number) => lineY - row * rowGap;
	const band = u(14);
	const dot = u(14);
	/** Whether a named interval on the line itself covers this number (its name sits where a point's name would). */
	const labelledOnLine = (value: number) => visual.intervals.some((interval) => interval.row === 0 && interval.label && (interval.from ?? -Infinity) <= value && value <= (interval.to ?? Infinity));
	/** An arrowhead at (tipX, y) pointing left (−1) or right (+1): an interval or the line running on without end. */
	const arrowHead = (tipX: number, y: number, direction: 1 | -1, colour: string, size: number) => (
		<path d={`M${tipX} ${y} L${tipX - direction * size * 1.4} ${y - size} L${tipX - direction * size * 1.4} ${y + size} Z`} fill={colour} />
	);
	const ticks = visual.ticks ?? defaultTicks(from, to);
	const colours = [palette.lesson, palette.ink, palette.lessonDeep];

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			<g opacity={line}>
				<line x1={pad * 0.3} x2={pad * 0.3 + (width - pad * 0.6) * line} y1={lineY} y2={lineY} stroke={palette.ink} strokeWidth={u(4)} />
				{arrowHead(pad * 0.3 - u(4), lineY, -1, palette.ink, u(10))}
				{line > 0.98 ? arrowHead(width - pad * 0.3 + u(4), lineY, 1, palette.ink, u(10)) : null}
				{ticks.map((value) => (
					<g key={value}>
						<line x1={x(value)} x2={x(value)} y1={lineY - u(12)} y2={lineY + u(12)} stroke={palette.ink} strokeWidth={u(3)} />
						<text x={x(value)} y={lineY + u(12) + tickSize * 1.05} textAnchor="middle" fill={palette.muted} style={{fontFamily: palette.fontBody, fontWeight: 600, fontSize: tickSize}}>
							{written(value)}
						</text>
					</g>
				))}
			</g>
			{visual.intervals.map((interval, index) => {
				const look = intervalLooks[index];
				const start = intervalStarts[index] ?? delaySeconds + 0.7 + index * 1.1;
				const sweep = easeFrom(seconds, start, SWEEP_SECONDS);
				if (sweep <= 0.001) return null;
				const left = interval.from === null ? pad * 0.6 : x(interval.from);
				const right = interval.to === null ? width - pad * 0.6 : x(interval.to);
				const head = left + (right - left) * sweep;
				const y = rowY(interval.row);
				const colour = colours[Math.min(interval.row, 2)];
				const opacity = 1 - UNFOCUSED_FADE * look.dim;
				const thick = band * (1 + 0.35 * look.emphasis);
				const end = (value: number | null, closed: boolean, at: number, shown: boolean) =>
					value === null || !shown ? null : <circle cx={at} cy={y} r={dot * (1 + 0.25 * look.emphasis)} fill={closed ? colour : palette.surface} stroke={colour} strokeWidth={u(5)} />;
				return (
					<g key={index} opacity={opacity}>
						{interval.row > 0 ? (
							// A floating interval drops thin guides to its ends on the line, so its numbers can be read below.
							<g opacity={0.5 * sweep}>
								{interval.from !== null ? <line x1={left} x2={left} y1={y} y2={lineY} stroke={colour} strokeWidth={u(2)} strokeDasharray={`${u(8)} ${u(8)}`} /> : null}
								{interval.to !== null && sweep > 0.98 ? <line x1={right} x2={right} y1={y} y2={lineY} stroke={colour} strokeWidth={u(2)} strokeDasharray={`${u(8)} ${u(8)}`} /> : null}
							</g>
						) : null}
						<line x1={left} x2={head} y1={y} y2={y} stroke={withAlpha(colour, interval.row === 0 ? 0.9 : 0.75)} strokeWidth={thick} strokeLinecap={interval.from === null ? 'butt' : 'round'} />
						{interval.from === null ? arrowHead(left - thick * 0.6, y, -1, withAlpha(colour, interval.row === 0 ? 0.9 : 0.75), thick * 1.1) : null}
						{interval.to === null && sweep > 0.98 ? arrowHead(right + thick * 0.6, y, 1, withAlpha(colour, interval.row === 0 ? 0.9 : 0.75), thick * 1.1) : null}
						{end(interval.from, interval.closedFrom, left, true)}
						{end(interval.to, interval.closedTo, right, sweep > 0.98)}
						{interval.label ? (
							// An interval without an end names itself beside its one end, where the numbers are, not out at the arrow.
							<text
								x={interval.to === null && interval.from !== null ? left + u(36) : interval.from === null && interval.to !== null ? right - u(36) : (left + right) / 2}
								y={y - u(30)}
								textAnchor={interval.to === null && interval.from !== null ? 'start' : interval.from === null && interval.to !== null ? 'end' : 'middle'}
								fill={colour}
								opacity={sweep}
								style={{fontFamily: palette.fontBody, fontWeight: 800, fontSize: u(38)}}
							>
								{interval.label}
							</text>
						) : null}
					</g>
				);
			})}
			{visual.points.map((point, index) => {
				const look = pointLooks[index];
				const start = pointStarts[index] ?? delaySeconds + 0.7 + (visual.intervals.length + index) * 0.6;
				const drop = easeFrom(seconds, start, 0.5);
				if (drop <= 0.001) return null;
				const px = x(point.x);
				const py = lineY - (1 - drop) * u(60);
				return (
					<g key={index} opacity={drop * (1 - UNFOCUSED_FADE * look.dim)}>
						<circle cx={px} cy={py} r={dot * (1.05 + 0.3 * look.emphasis)} fill={point.open ? palette.surface : palette.lesson} stroke={palette.lesson} strokeWidth={u(5)} />
						{point.label ? (
							// Over an interval on the line that has its own name, the point's name goes a line higher.
							<text x={px} y={py - (labelledOnLine(point.x) ? u(82) : u(32))} textAnchor="middle" fill={palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 800, fontSize: u(32)}}>
								{point.label}
							</text>
						) : null}
					</g>
				);
			})}
		</svg>
	);
};
