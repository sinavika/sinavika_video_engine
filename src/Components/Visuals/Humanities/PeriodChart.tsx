import React from 'react';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {mixColors} from '../../../Themes/ColorPalette';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {textWidth} from '../FigureLabel';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, useElementState} from '../VisualTimeline';

type Periods = Extract<CourseVisual, {kind: 'periods'}>;

/** A year as Turkish history books write it: "MÖ 220", "552". */
export const periodYear = (year: number): string => (year < 0 ? `MÖ ${-year}` : String(year));

/** A period's years under its name: "MÖ 220 – MS 216" across the turn of the era, "MÖ 209 – 174", "552 – 744". */
export const periodRange = (from: number, to: number): string => {
	if (to < 0) return `MÖ ${-from} – ${-to}`;
	if (from < 0) return `MÖ ${-from} – MS ${to}`;
	return `${from} – ${to}`;
};

/** Round years for the axis, at most `most` of them: the smallest of 1, 2, 5, 10, 20, 25, 50… steps that fits (no year 0, which the calendar does not have). */
export const periodTicks = (first: number, last: number, most = 7): number[] => {
	const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
	const step = steps.find((candidate) => Math.floor(last / candidate) - Math.ceil(first / candidate) + 1 <= most) ?? 10000;
	const ticks: number[] = [];
	for (let year = Math.ceil(first / step) * step; year <= last; year += step) if (year !== 0) ticks.push(year);
	return ticks;
};

/** Height of one row of mark labels, in layout units. */
const MARK_ROW = 40;

/** Where a mark's label is centred: on its year, or leaning in from an edge of a figure `width` wide. */
const markLabelCentre = (x: number, span: number, width: number): number => Math.min(width - span / 2, Math.max(span / 2, x));

/**
 * Which row each mark's label takes, 0 nearest the bars: the first row whose last label ends `gap` before this one
 * begins. Labels are centred where PeriodMark draws them: on their year, kept inside the figure. Reckoned on the year
 * alone, "1923 İzmir İktisat Kongresi", pushed in from the left edge, ran into "1930 Merkez Bankası" (KPSS Tarih 18,
 * 2 Nov 2026).
 */
export const periodMarkRows = (marks: readonly {year: number; label: string}[], x: (year: number) => number, span: (text: string) => number, width = Infinity, gap = 0): number[] => {
	const ends: number[] = [];
	const order = marks.map((mark, index) => ({index, at: x(mark.year)})).sort((a, b) => a.at - b.at);
	const rows: number[] = new Array(marks.length).fill(0);
	for (const {index, at} of order) {
		const wide = span(`${periodYear(marks[index].year)} ${marks[index].label}`);
		const centre = markLabelCentre(at, wide, width);
		let row = ends.findIndex((end) => end + gap <= centre - wide / 2);
		if (row < 0) row = ends.length;
		ends[row] = centre + wide / 2;
		rows[index] = row;
	}
	return rows;
};

/** How wide a period's name and the years under it are, the wider of the two. */
const nameSpan = (label: string, second: string, u: (value: number) => number): number => Math.max(textWidth(label, u(TYPE.name)), textWidth(second, u(TYPE.years), 700));

/** Type sizes of a period chart: the name in a bar, the years under it, the axis. */
// A chart of seven states filled a whole card with names at 30 units that read small (KPSS Tarih 1, 1 Nov 2026).
const TYPE = {name: 38, years: 27, axis: 27, mark: 29} as const;

/**
 * Where everything of a period chart goes: the year scale (`x`), and per period its bar and where its name sits:
 * inside the bar when name and years fit, else beside it on the side with room (right first). Marks need a row of
 * labels above the bars; the axis takes the bottom.
 */
export const periodsLayout = (visual: Pick<Periods, 'periods' | 'marks'>, width: number, height: number, u: (value: number) => number) => {
	const years = visual.periods.flatMap((period) => [period.from, period.to]);
	const [low, high] = [Math.min(...years), Math.max(...years)];
	const pad = (high - low) * 0.04;
	const [first, last] = [low - pad, high + pad];
	const side = u(24);
	const x = (year: number) => side + ((year - first) / (last - first)) * (width - 2 * side);
	// Mark labels in rows above the bars: a label that would run into the one before it (1040 Dandanakan and 1071
	// Malazgirt on a 840–1231 axis, KPSS Tarih 2) goes up a row.
	const markRows = periodMarkRows(visual.marks, x, (text) => textWidth(text, u(TYPE.mark)), width, u(24));
	const rowsOfMarks = visual.marks.length ? Math.max(...markRows) + 1 : 0;
	const ceiling = visual.marks.length ? u(72) + (rowsOfMarks - 1) * u(MARK_ROW) : u(8);
	const bottom = height - u(72);
	const rowHeight = Math.min(u(visual.periods.length <= 3 ? 150 : 124), (bottom - ceiling) / visual.periods.length);
	// A few periods do not fill a tall figure: the bars, and the mark names above them, move down to the middle instead
	// of leaving the lower half empty (two economic periods of 1923-1938, KPSS Tarih 18, 2 Nov 2026).
	const top = ceiling + Math.max(0, bottom - ceiling - rowHeight * visual.periods.length) / 2;
	const barHeight = rowHeight * 0.8;
	const gap = u(14);
	const rows = visual.periods.map((period, index) => {
		const [x0, x1] = [x(period.from), x(period.to)];
		const y = top + index * rowHeight + (rowHeight - barHeight) / 2;
		const second = periodRange(period.from, period.to) + (period.detail ? ` · ${period.detail}` : '');
		const textSpan = nameSpan(period.label, second, u);
		const place: 'inside' | 'right' | 'left' = textSpan + 2 * gap <= x1 - x0 ? 'inside' : x1 + gap + textSpan <= width ? 'right' : x0 - gap - textSpan >= 0 ? 'left' : 'inside';
		const labelX = place === 'inside' ? x0 + gap : place === 'right' ? x1 + gap : x0 - gap;
		return {x0, x1, y, height: barHeight, place, labelX, second};
	});
	return {x, rows, ticks: periodTicks(Math.ceil(first), Math.floor(last)), axisY: bottom + u(12), top, markRows, ceiling};
};

/** The least height of a period's row in an app still: its name and its years on their plate, clear of the next row's. */
const STILL_ROW = 88;

/**
 * How tall an app still's period chart must be for every row to hold its name and years: seven states in a 16:10 still
 * had rows of 50 units, and each name printed over the years of the one above (KPSS Tarih, 2 Nov 2026).
 */
export const periodsStillHeight = (visual: Pick<Periods, 'periods' | 'marks'>, width: number): number => periodsLayout(visual, width, 10_000, (value) => value).ceiling + visual.periods.length * STILL_ROW + 72;

/**
 * States, eras or reigns as bars on one year line (History: which states stood side by side, which followed which:
 * Asya Hun, Göktürk, Uygur, Karahanlı on one axis). Each bar grows from its first year to its last, in turn; its name
 * and years sit inside it or beside it. `marks` are single years drawn across all bars (Talas 751): a beat that
 * focuses a mark lights every period the year falls in. Parts: p1… the periods, m1… the marks.
 */
export const PeriodsVisual: React.FC<VisualBoxProps & {visual: Periods}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const layout = periodsLayout(visual, width, height, u);
	const axis = useReveal(delaySeconds, 0.7);
	// At most four marks: a fixed number of hooks, one per slot.
	const markStates = [useElementState(visual.marks[0] ? 'm1' : undefined), useElementState(visual.marks[1] ? 'm2' : undefined), useElementState(visual.marks[2] ? 'm3' : undefined), useElementState(visual.marks[3] ? 'm4' : undefined)];
	const lit = (from: number, to: number) => Math.max(0, ...visual.marks.map((mark, index) => (from <= mark.year && mark.year <= to ? markStates[index].emphasis : 0)));
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={axis}>
				<line x1={0} x2={width} y1={layout.axisY} y2={layout.axisY} stroke={palette.ink} strokeWidth={u(4)} strokeLinecap="round" />
				{layout.ticks.map((year) => (
					<g key={year}>
						<line x1={layout.x(year)} x2={layout.x(year)} y1={layout.axisY - u(10)} y2={layout.axisY + u(10)} stroke={palette.ink} strokeWidth={u(3)} />
						<text x={layout.x(year)} y={layout.axisY + u(44)} textAnchor="middle" fontSize={u(TYPE.axis)} fontWeight={700} fill={palette.muted}>
							{periodYear(year)}
						</text>
					</g>
				))}
			</g>
			{/* Marks first: their lines pass behind the bars and their names, never through a name ("I| Mustafa", KPSS Tarih 8). */}
			{/* Every mark's line before any mark's name: a name a row up drops its line past the row below, never over its letters (1926 Kabotaj over "İzmir İktisat Kongresi", KPSS Tarih 18). */}
			{(['line', 'name'] as const).map((layer) =>
				visual.marks.map((mark, index) => (
					<PeriodMark key={`${layer}${index}`} layer={layer} id={`m${index + 1}`} x={layout.x(mark.year)} top={layout.top - layout.markRows[index] * u(MARK_ROW)} bottom={layout.axisY} text={`${periodYear(mark.year)} ${mark.label}`} width={width} delaySeconds={delaySeconds + 0.6 + visual.periods.length * 0.35 + index * 0.3} />
				)),
			)}
			{visual.periods.map((period, index) => (
				<PeriodBar key={index} id={`p${index + 1}`} row={layout.rows[index]} label={period.label} lit={lit(period.from, period.to)} delaySeconds={delaySeconds + 0.4 + index * 0.35} />
			))}
		</svg>
	);
};

const PeriodBar: React.FC<{id: string; row: ReturnType<typeof periodsLayout>['rows'][number]; label: string; lit: number; delaySeconds: number}> = ({id, row, label, lit, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const grow = useReveal(delaySeconds, 0.6) * look.appear;
	// Focused, or lit by a mark it holds: the bar takes the lesson colour and its name turns to the colour on it.
	const strong = Math.min(1, Math.max(look.scale - 1, lit) * 2);
	// A light tint of the lesson colour over the figure's own ground: light bars on a light figure, dark ones on a dark figure.
	const fill = mixColors(mixColors(palette.lesson, palette.surface, 0.62), palette.lesson, strong);
	const inside = row.place === 'inside';
	const ink = inside && strong > 0.5 ? palette.onLesson : palette.ink;
	const anchor = row.place === 'left' ? 'end' : 'start';
	const centre = row.y + row.height / 2;
	return (
		<>
			{/* An opaque ground under the bar: a bar faded while another is in focus still hides the mark lines behind it. */}
			<rect x={row.x0} y={row.y} width={Math.max(0, (row.x1 - row.x0) * grow)} height={row.height} rx={u(12)} fill={palette.surface} />
		<g opacity={look.opacity}>
			<rect x={row.x0} y={row.y} width={Math.max(0, (row.x1 - row.x0) * grow)} height={row.height} rx={u(12)} fill={fill} stroke={palette.lesson} strokeWidth={u(3)} />
			<g opacity={Math.min(1, Math.max(0, grow * 1.6 - 0.6))}>
				{/* A name beside its bar sits on a plate of the figure's ground: a mark's line passing by shows neither through nor between its letters (1952 across "II. Dünya Savaşı", KPSS Tarih 21). */}
				{inside ? null : (() => {
					const span = nameSpan(label, row.second, u) + u(12);
					return <rect x={anchor === 'start' ? row.labelX - u(6) : row.labelX - span + u(6)} y={centre - u(TYPE.name) * 0.95} width={span} height={u(TYPE.name) * 0.95 + u(TYPE.years) + u(12)} rx={u(8)} fill={palette.surface} />;
				})()}
				{/* A name inside its bar is outlined in the bar's own colour, so a mark's line behind the bar never crosses its letters. */}
				<text x={row.labelX} y={centre - u(4)} textAnchor={anchor} fontFamily={palette.fontDisplay} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} fontSize={u(TYPE.name)} fill={ink} stroke={inside ? fill : palette.surface} strokeWidth={u(6)} paintOrder="stroke">
					{label}
				</text>
				<text x={row.labelX} y={centre + u(TYPE.years) + u(2)} textAnchor={anchor} fontWeight={700} fontSize={u(TYPE.years)} fill={inside && strong > 0.5 ? palette.onLesson : palette.muted} stroke={inside ? fill : palette.surface} strokeWidth={u(5)} paintOrder="stroke">
					{row.second}
				</text>
			</g>
		</g>
		</>
	);
};

const PeriodMark: React.FC<{layer: 'line' | 'name'; id: string; x: number; top: number; bottom: number; text: string; width: number; delaySeconds: number}> = ({layer, id, x, top, bottom, text, width, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const show = useReveal(delaySeconds, 0.5) * look.opacity;
	// The label stays inside the figure: centred on its year, or leaning in from an edge.
	const labelX = markLabelCentre(x, textWidth(text, u(TYPE.mark)), width);
	const colour = mixColors(palette.brand, palette.ink, 0.15);
	if (layer === 'line') return <line x1={x} x2={x} y1={top - u(14)} y2={bottom} stroke={colour} strokeWidth={u(4) * look.scale} strokeDasharray={`${u(12)} ${u(8)}`} opacity={show} />;
	return (
		<g opacity={show}>
			<text x={labelX} y={top - u(26)} textAnchor="middle" fontWeight={800} fontSize={u(TYPE.mark) * Math.min(1.2, look.scale)} fill={colour} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};
