import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {textWidth} from '../FigureLabel';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {eventCount, measureOf, passes, written} from './MathWork';

type SampleSpace = Extract<CourseVisual, {kind: 'sampleSpace'}>;

const CELL = 96;
const FONT = 40;
const PAD = 30;
const HEAD = 80;

/** "Toplam 7: 6/36 = 1/6", worked out from the grid. */
export const probabilityLine = (visual: SampleSpace, index: number): string => {
	const event = visual.events[index];
	const {count, total, probability} = eventCount(visual.rows, visual.columns, event);
	const fraction = `${count}/${total}`;
	const lowest = `${probability[0]}/${probability[1]}`;
	return `${event.label}: ${fraction}${lowest !== fraction ? ` = ${lowest}` : ''}`;
};

export const sampleSpaceFrame = (visual: SampleSpace) => {
	const grid = HEAD + visual.columns.length * CELL;
	const lines = visual.events.map((_, index) => textWidth(probabilityLine(visual, index), FONT, 800));
	const side = lines.length ? Math.max(...lines) + 2 * PAD + 36 : 0;
	const gridHeight = HEAD + visual.rows.length * CELL;
	return {left: PAD + FONT * 1.4, top: PAD + FONT * 1.3, grid, side, width: PAD + FONT * 1.4 + grid + side + PAD, height: PAD + FONT * 1.3 + gridHeight + PAD};
};

/**
 * The sample space of two draws as a grid (two dice by default): each outcome a cell with its pair, sum, product or
 * difference. An event colours its cells when it comes in (the second in the brand colour, cells of both in both),
 * and the engine counts them and writes the probability in lowest terms beside the grid.
 */
export const SampleSpaceVisual: React.FC<VisualBoxProps & {visual: SampleSpace}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const frame = sampleSpaceFrame(visual);
	// Without beats everything is in within about three seconds: a card's line may be that short.
	const gridLook = usePartLook('grid', useReveal(delaySeconds, 0.8));
	const eventLooks = [usePartLook('e1', useReveal(delaySeconds + 0.9, 0.6)), usePartLook('e2', useReveal(delaySeconds + 1.9, 0.6))];
	const probabilityLooks = [usePartLook('p1', useReveal(delaySeconds + 1.4, 0.5)), usePartLook('p2', useReveal(delaySeconds + 2.4, 0.5))];
	const cellX = (column: number) => frame.left + HEAD + column * CELL;
	const cellY = (row: number) => frame.top + HEAD + row * CELL;
	const tones = [palette.lesson, palette.brand];
	const cellText = (a: number, b: number) => (visual.cell === 'pair' ? `${written(a)},${written(b)}` : written(measureOf(visual.cell, a, b)));
	const textSize = visual.cell === 'pair' ? Math.min(FONT * 0.75, (CELL - 14) / Math.max(1, textWidth('6,6', 1, 700))) : FONT;
	const count = visual.rows.length * visual.columns.length;

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<g style={{fontFamily: palette.fontDisplay}}>
				<text x={frame.left + HEAD + (visual.columns.length * CELL) / 2} y={frame.top - FONT * 0.45} textAnchor="middle" fill={palette.muted} fontSize={FONT * 0.8} fontWeight={800} opacity={gridLook.opacity}>
					{visual.columnLabel}
				</text>
				<text x={PAD + FONT * 0.6} y={frame.top + HEAD + (visual.rows.length * CELL) / 2} textAnchor="middle" fill={palette.muted} fontSize={FONT * 0.8} fontWeight={800} opacity={gridLook.opacity} transform={`rotate(-90 ${PAD + FONT * 0.6} ${frame.top + HEAD + (visual.rows.length * CELL) / 2})`}>
					{visual.rowLabel}
				</text>
				{visual.columns.map((value, column) => (
					<text key={`h${column}`} x={cellX(column) + CELL / 2} y={frame.top + HEAD * 0.62} textAnchor="middle" fill={palette.ink} fontSize={FONT} fontWeight={800} opacity={gridLook.opacity}>
						{written(value)}
					</text>
				))}
				{visual.rows.map((value, row) => (
					<text key={`v${row}`} x={frame.left + HEAD / 2} y={cellY(row) + CELL / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT} fontWeight={800} opacity={gridLook.opacity}>
						{written(value)}
					</text>
				))}
				{visual.rows.map((a, row) =>
					visual.columns.map((b, column) => {
						// Cells come in in reading order as the grid is drawn.
						const shown = Math.max(0, Math.min(1, gridLook.drawn * count - (row * visual.columns.length + column) * 0.6));
						const inEvents = visual.events.map((event, index) => (passes(event, a, b) ? eventLooks[index].opacity : 0));
						return (
							<g key={`${row}-${column}`} opacity={shown * gridLook.opacity}>
								<rect x={cellX(column) + 3} y={cellY(row) + 3} width={CELL - 6} height={CELL - 6} rx={12} fill={inEvents[0] > 0 ? withAlpha(tones[0], 0.3 * inEvents[0] + 0.15 * eventLooks[0].focused) : withAlpha(palette.ink, 0.04)} stroke={inEvents[1] > 0 ? tones[1] : palette.grid} strokeWidth={inEvents[1] > 0 ? 3 + 4 * inEvents[1] : 2} />
								<text x={cellX(column) + CELL / 2} y={cellY(row) + CELL / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={textSize} fontWeight={700}>
									{cellText(a, b)}
								</text>
							</g>
						);
					}),
				)}
				{visual.events.map((_, index) => {
					const look = probabilityLooks[index];
					const x = frame.left + frame.grid + PAD + 30;
					const y = frame.top + HEAD + CELL * (0.8 + index * 1.4);
					return (
						<g key={`p${index}`} opacity={look.opacity * eventLooks[index].opacity}>
							<rect x={x - 30} y={y - 10} width={20} height={20} rx={4} fill={index === 0 ? withAlpha(tones[0], 0.45) : 'none'} stroke={tones[index]} strokeWidth={4} />
							<text x={x} y={y} dominantBaseline="central" fill={tones[index]} fontSize={FONT} fontWeight={800}>
								{probabilityLine(visual, index)}
							</text>
						</g>
					);
				})}
			</g>
		</World>
	);
};
