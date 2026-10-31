import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useElementState} from '../VisualTimeline';
import {Tag, usePartLook, W, World} from '../VisualWorld';

type Quadrant = Extract<CourseVisual, {kind: 'quadrant'}>;

/** Quadrant order: q1 top left (low x, high y), q2 top right, q3 bottom left, q4 bottom right. */
const QUADRANTS = [
	{id: 'q1', x: 'low', y: 'high'},
	{id: 'q2', x: 'high', y: 'high'},
	{id: 'q3', x: 'low', y: 'low'},
	{id: 'q4', x: 'high', y: 'low'},
] as const;

/**
 * Two yes-or-no features on two axes, cutting the plane into four (Oluşum hızı: yavaş / hızlı × Etki alanı: dar /
 * geniş): each item sits as a chip in its quarter, up to six a quarter. An empty quarter is part of the lesson too
 * (no disaster is both slow and narrow). Parts: i1… (an item), q1…q4 (a quarter, its items lit).
 */
/**
 * A y-axis end label in at most two lines: the room left of the plane holds about ten characters a line
 * ("Tartışmaya açık" ran off the card, 31 Oct 2026).
 */
export const axisLines = (text: string): string[] => {
	if (text.length <= 10 || !text.includes(' ')) return [text];
	const spaces = [...text].map((char, index) => (char === ' ' ? index : -1)).filter((index) => index > 0);
	const cut = spaces.reduce((best, index) => (Math.abs(index - text.length / 2) < Math.abs(best - text.length / 2) ? index : best), spaces[0]);
	return [text.slice(0, cut), text.slice(cut + 1)];
};

export const QuadrantVisual: React.FC<VisualBoxProps & {visual: Quadrant}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const quarterStates = [useElementState('q1'), useElementState('q2'), useElementState('q3'), useElementState('q4')];
	const itemLooks = Array.from({length: 12}, (_, index) => usePartLook(`i${index + 1}`, easeFrom(seconds, delaySeconds + 0.6 + index * 0.18, 0.45)));
	const left = 150;
	const right = W - 20;
	const top = 20;
	const bottom = 500;
	const midX = (left + right) / 2;
	const midY = (top + bottom) / 2;
	const quarterWidth = (right - left) / 2;
	const quarterHeight = (bottom - top) / 2;
	const axes = easeFrom(seconds, delaySeconds, 0.5);

	return (
		<World width={width} height={height}>
			{/* Quarters, tinted when pointed at. */}
			{QUADRANTS.map((quarter, index) => {
				const x0 = quarter.x === 'low' ? left : midX;
				const y0 = quarter.y === 'high' ? top : midY;
				const lit = quarterStates[index].emphasis;
				return <rect key={quarter.id} x={x0 + 4} y={y0 + 4} width={quarterWidth - 8} height={quarterHeight - 8} rx={16} fill={withAlpha(palette.lesson, 0.06 + 0.16 * lit)} stroke={lit > 0.5 ? palette.lesson : 'none'} strokeWidth={3} opacity={axes} />;
			})}
			{/* Axes through the middle, named at both ends. */}
			<g opacity={axes}>
				<line x1={left} y1={midY} x2={right} y2={midY} stroke={palette.axis} strokeWidth={3} />
				<line x1={midX} y1={top} x2={midX} y2={bottom} stroke={palette.axis} strokeWidth={3} />
				<Tag x={left + 10} y={bottom + 26} text={`← ${visual.x.low}`} size={21} weight={700} fill={palette.muted} />
				<Tag x={right - 10} y={bottom + 26} text={`${visual.x.high} →`} anchor="end" size={21} weight={700} fill={palette.muted} />
				<Tag x={midX} y={bottom + 64} text={visual.x.label} anchor="middle" size={25} weight={800} />
				{axisLines(visual.y.high).map((line, index, lines) => (
					<Tag key={`h${index}`} x={left - 14} y={top + 20 + (index - (lines.length - 1) / 2) * 24} text={line} anchor="end" size={21} weight={700} fill={palette.muted} />
				))}
				{axisLines(visual.y.low).map((line, index, lines) => (
					<Tag key={`l${index}`} x={left - 14} y={bottom - 20 + (index - (lines.length - 1) / 2) * 24} text={line} anchor="end" size={21} weight={700} fill={palette.muted} />
				))}
				<g transform={`translate(${left - 70} ${midY}) rotate(-90)`}>
					<Tag x={0} y={0} text={visual.y.label} anchor="middle" size={25} weight={800} />
				</g>
			</g>
			{/* Items as chips, two columns in their quarter. */}
			{QUADRANTS.map((quarter, q) => {
				const items = visual.items.map((item, index) => ({item, index})).filter(({item}) => item.x === quarter.x && item.y === quarter.y);
				const x0 = quarter.x === 'low' ? left : midX;
				const y0 = quarter.y === 'high' ? top : midY;
				// Up to three items stand in one column of wide chips; more go two to a row.
				const columns = items.length <= 3 ? 1 : 2;
				const chipWidth = columns === 1 ? quarterWidth - 32 : quarterWidth / 2 - 22;
				const rows = Math.max(1, Math.ceil(items.length / columns));
				const pitch = Math.min(78, (quarterHeight - 30) / rows);
				const lit = quarterStates[q].emphasis;
				return items.map(({item, index}, slot) => {
					const look = itemLooks[index];
					const cx = x0 + 16 + (slot % columns) * (chipWidth + 12);
					const cy = y0 + 18 + Math.floor(slot / columns) * pitch;
					const solid = look.focused > 0.5 || lit > 0.5;
					const size = Math.min(27, (chipWidth - 16) / Math.max(1, item.label.length * 0.56));
					return (
						<g key={item.label} opacity={look.opacity}>
							<rect x={cx} y={cy} width={chipWidth} height={pitch - 14} rx={12} fill={solid ? palette.lesson : palette.surface} stroke={palette.lesson} strokeWidth={2.5} />
							<text x={cx + chipWidth / 2} y={cy + (pitch - 14) / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={solid ? palette.onLesson : palette.ink} fontFamily={palette.fontBody}>
								{item.label}
							</text>
						</g>
					);
				});
			})}
		</World>
	);
};
