import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type Pie = Extract<CourseVisual, {kind: 'pie'}>;

const SLOTS = 8;
const SWEEP_SECONDS = 0.8;

/** "37,5": a value as a Turkish textbook writes it. */
const written = (value: number) => String(Number(value.toFixed(1))).replace('.', ',');

/**
 * A pie chart (daire grafiği) for statistics and geography: each slice (parts p1…) sweeps open from where the last one
 * ended when the narration reaches it, then names itself with its value, its share or its central angle. A focused
 * slice moves a little out of the circle. Without beats the slices open one after another.
 */
export const PieVisual: React.FC<VisualBoxProps & {visual: Pie}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const looks = Array.from({length: SLOTS}, (_, index) => useElementState(index < visual.slices.length ? `p${index + 1}` : undefined));
	const firstStart = (id: string) => {
		const shown = useBeatStartFor(id, 'show');
		const focused = useBeatStartFor(id, 'focus');
		return shown === undefined ? focused : focused === undefined ? shown : Math.min(shown, focused);
	};
	const starts = Array.from({length: SLOTS}, (_, index) => firstStart(`p${index + 1}`));

	const total = visual.slices.reduce((sum, slice) => sum + slice.value, 0);
	const cx = width / 2;
	const cy = height / 2;
	const colours = [palette.lesson, palette.lessonDeep, withAlpha(palette.lesson, 0.55), palette.ink, withAlpha(palette.lesson, 0.3), withAlpha(palette.ink, 0.55), withAlpha(palette.lessonDeep, 0.5), withAlpha(palette.ink, 0.3)];
	const point = (angle: number, r: number) => [cx + r * Math.sin(angle), cy - r * Math.cos(angle)] as const;
	const label = (slice: Pie['slices'][number]) => {
		const share = slice.value / total;
		if (visual.show === 'angle') return `${slice.label}: ${written(share * 360)}°`;
		if (visual.show === 'percent') return `${slice.label}: %${written(share * 100)}`;
		return `${slice.label}: ${written(slice.value)}`;
	};
	// The labels sit around the circle: it leaves room for the longest one on either side, and for one line of label
	// above and below, where a thin slice at the top puts its label (30 Oct 2026: "Karma: 39" was cut at the top).
	const labelSize = u(34);
	const longest = Math.max(...visual.slices.map((slice) => label(slice).length)) * labelSize * 0.56;
	const vertical = height / 2 - u(46) - labelSize - u(12);
	const radius = Math.max(height * 0.18, Math.min(height * 0.4, vertical, width / 2 - longest - u(70)));

	let startAngle = 0;
	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			<circle cx={cx} cy={cy} r={radius} fill="none" stroke={withAlpha(palette.ink, 0.12)} strokeWidth={u(3)} />
			{visual.slices.map((slice, index) => {
				const look = looks[index];
				const begin = starts[index] ?? delaySeconds + 0.4 + index * 0.9;
				const open = easeFrom(seconds, begin, SWEEP_SECONDS);
				const sweep = (slice.value / total) * Math.PI * 2;
				const from = startAngle;
				startAngle += sweep;
				if (open <= 0.001) return null;
				const to = from + sweep * open;
				const middle = from + sweep / 2;
				// A focused slice steps out along its middle line.
				const push = u(18) * look.emphasis;
				const [dx, dy] = [push * Math.sin(middle), -push * Math.cos(middle)];
				const [x0, y0] = point(from, radius);
				const [x1, y1] = point(to, radius);
				const large = to - from > Math.PI ? 1 : 0;
				const path = sweep * open >= Math.PI * 2 - 1e-6 ? `M${cx - radius} ${cy} a${radius} ${radius} 0 1 0 ${radius * 2} 0 a${radius} ${radius} 0 1 0 ${-radius * 2} 0` : `M${cx} ${cy} L${x0} ${y0} A${radius} ${radius} 0 ${large} 1 ${x1} ${y1} Z`;
				const [lx, ly] = point(middle, radius + u(46));
				const [ex, ey] = point(middle, radius + u(10));
				const right = Math.sin(middle) >= 0;
				return (
					<g key={index} transform={`translate(${dx} ${dy})`} opacity={1 - UNFOCUSED_FADE * look.dim}>
						<path d={path} fill={colours[index % colours.length]} stroke={palette.surface} strokeWidth={u(4)} />
						<g opacity={easeFrom(seconds, begin + SWEEP_SECONDS * 0.7, 0.4)}>
							<line x1={ex} y1={ey} x2={lx} y2={ly} stroke={withAlpha(palette.ink, 0.35)} strokeWidth={u(2)} />
							<text x={lx + (right ? u(8) : -u(8))} y={ly + u(12)} textAnchor={right ? 'start' : 'end'} fill={palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 700 + Math.round(100 * look.emphasis), fontSize: labelSize}}>
								{label(slice)}
							</text>
						</g>
					</g>
				);
			})}
		</svg>
	);
};
