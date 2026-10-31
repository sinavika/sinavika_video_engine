import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useElementState} from '../VisualTimeline';
import {Tag, usePartLook, W, World} from '../VisualWorld';

type Stack = Extract<CourseVisual, {kind: 'stack'}>;

/** Colours of the series: the lesson colour, the brand orange, a blue and a purple, as on the contrast maps. */
const seriesColours = (lesson: string, brand: string) => [lesson, brand, '#2F6A9F', '#8E44AD'];

const percentText = (value: number) => `%${String(Math.round(value * 10) / 10).replace('.', ',')}`;

const LEGEND = {size: 28, chip: 30, gap: 12, spacing: 32, line: 46, start: 300, edge: 30};

/** Places the legend chips by the width of their names, from the bars' left edge, then from the frame's edge, then on two lines. */
export const stackLegend = (series: readonly string[], frameWidth: number = W) => {
	const widths = series.map((name) => LEGEND.chip + LEGEND.gap + name.length * LEGEND.size * 0.52); // Manrope 800 averages about 0.47 em a letter
	const run = widths.reduce((sum, width) => sum + width, 0) + LEGEND.spacing * (series.length - 1);
	const right = frameWidth - LEGEND.edge;
	const start = run <= right - LEGEND.start ? LEGEND.start : LEGEND.edge;
	let x = start;
	let line = 0;
	const places = widths.map((width) => {
		if (x > start && x + width > right) {
			x = start;
			line += 1;
		}
		const place = {x, line};
		x += width + LEGEND.spacing;
		return place;
	});
	return {places, lines: line + 1};
};

/**
 * The drawn widths of a row's segments: true shares, except that a share too small to see (0,03% of the world's
 * water in lakes and rivers, KIM 5) keeps a thin sliver, taken from the others.
 */
export const stackWidths = (values: readonly number[], span: number, sliver = 6) => {
	const total = values.reduce((sum, value) => sum + value, 0) || 1;
	const raw = values.map((value) => (span * value) / total);
	const shown = raw.map((width, index) => (values[index] > 0 ? Math.max(sliver, width) : 0));
	const scale = span / (shown.reduce((sum, width) => sum + width, 0) || 1);
	return shown.map((width) => width * scale);
};

/** Room left of the bars for the row names (bold, 31 units, a little larger when lit): at least the legend's start,
 * at most 45% of the frame, so a long name ("1. senaryo (yüksek)") is not cut at the frame's left edge. */
export const stackLabelRoom = (rows: readonly {label: string; note?: string}[], viewWidth: number) =>
	Math.round(Math.min(viewWidth * 0.45, Math.max(LEGEND.start, ...rows.map((row) => Math.max(row.label.length * 31 * 0.56 * 1.12, (row.note?.length ?? 0) * 20 * 0.55) + 18 + 24))));

/** Height of the stack's drawing: a legend, then a band per row, so a few rows fill a wide card instead of a 1000 × 600 frame. */
export const stackHeight = (rows: number, legendLines = 1) => 50 + legendLines * LEGEND.line + rows * (rows > 4 ? 100 : 130) + 24;

/**
 * The drawing's frame for a box: 1000 wide, widened up to 1.8 times when the box is wider than the drawing is
 * tall, so the bars run across a wide card instead of standing small in its middle (KIM 5).
 */
export const stackFrame = (series: readonly string[], rows: number, boxAspect: number) => {
	let legend = stackLegend(series);
	let viewHeight = stackHeight(rows, legend.lines);
	const viewWidth = Math.min(W * 1.8, Math.max(W, viewHeight * boxAspect));
	legend = stackLegend(series, viewWidth);
	viewHeight = stackHeight(rows, legend.lines);
	return {legend, viewWidth, viewHeight};
};

/**
 * Shares as 100% bars, one row per place or group (Dünya, Türkiye, a country), each cut into its series (tarım,
 * sanayi, hizmet): the chart ÖSYM draws for the employed by sector. Rows fill from left to right one after another;
 * each segment carries its share when there is room. Parts: r1… (a row), s1… (a series across all rows).
 */
export const StackVisual: React.FC<VisualBoxProps & {visual: Stack}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const colours = seriesColours(palette.lesson, palette.brand);
	const rowLooks = [usePartLook('r1', 1), usePartLook('r2', 1), usePartLook('r3', 1), usePartLook('r4', 1), usePartLook('r5', 1), usePartLook('r6', 1)];
	const seriesStates = [useElementState('s1'), useElementState('s2'), useElementState('s3'), useElementState('s4')];
	const seriesFocus = Math.max(...seriesStates.map((state) => state.emphasis));

	const {legend, viewWidth, viewHeight} = stackFrame(visual.series, visual.rows.length, width / Math.max(1, height));
	const left = stackLabelRoom(visual.rows, viewWidth);
	const right = viewWidth - LEGEND.edge;
	const top = 50 + legend.lines * LEGEND.line;
	const bottom = viewHeight - 24;
	const pitch = (bottom - top) / visual.rows.length;
	const barHeight = Math.min(90, pitch * 0.6);

	return (
		<World width={width} height={height} viewWidth={viewWidth} viewHeight={viewHeight}>
			{/* Legend: one chip per series, lit when a beat points at the series. */}
			{visual.series.map((name, index) => {
				const {x, line} = legend.places[index];
				const y = 26 + line * LEGEND.line;
				const lit = seriesStates[index].emphasis;
				return (
					<g key={name} opacity={1 - 0.55 * seriesFocus * (1 - lit)}>
						<rect x={x} y={y} width={LEGEND.chip} height={LEGEND.chip} rx={7} fill={colours[index]} />
						<Tag x={x + LEGEND.chip + LEGEND.gap} y={y + 16} text={name} size={LEGEND.size} weight={800} focused={lit} />
					</g>
				);
			})}
			{visual.rows.map((row, r) => {
				const look = rowLooks[r];
				const total = row.values.reduce((sum, value) => sum + value, 0) || 1;
				const widths = stackWidths(row.values, right - left);
				const y = top + r * pitch + (pitch - barHeight) / 2;
				const grow = easeFrom(seconds, delaySeconds + 0.3 + r * 0.35, 0.8);
				let cursor = left;
				return (
					<g key={row.label} opacity={look.opacity}>
						<Tag x={left - 18} y={y + barHeight / 2 - (row.note ? 13 : 0)} text={row.label} anchor="end" size={31} weight={800} focused={look.focused} />
						{row.note ? <Tag x={left - 18} y={y + barHeight / 2 + 21} text={row.note} anchor="end" size={20} weight={600} fill={palette.muted} /> : null}
						<rect x={left} y={y} width={right - left} height={barHeight} rx={10} fill={palette.grid} opacity={0.5} />
						{row.values.map((value, s) => {
							const full = widths[s];
							const segment = full * grow;
							const x = cursor;
							cursor += segment;
							const lit = seriesStates[s].emphasis;
							const dim = 1 - 0.6 * seriesFocus * (1 - lit);
							return (
								<g key={s} opacity={dim}>
									<rect x={x} y={y} width={Math.max(0, segment - 2)} height={barHeight} fill={colours[s]} stroke={look.focused > 0.5 || lit > 0.5 ? palette.ink : 'none'} strokeWidth={2.5} />
									{full > 76 && grow > 0.9 ? <text x={x + segment / 2} y={y + barHeight / 2 + 9} textAnchor="middle" fontSize={27} fontWeight={800} fill="#FFFFFF" fontFamily={palette.fontBody}>{percentText((value / total) * 100)}</text> : null}
								</g>
							);
						})}
					</g>
				);
			})}
		</World>
	);
};
