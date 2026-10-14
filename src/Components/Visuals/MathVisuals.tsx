import {scaleLinear} from 'd3-scale';
import {line as linePath} from 'd3-shape';
import React, {useId} from 'react';
import type {CourseVisual} from './VisualSchemas';
import {parseExpression} from './PlotExpression';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {useVideoLayout} from '../Layouts/VideoLayout';

type Plot = Extract<CourseVisual, {kind: 'plot'}>;
type Geometry = Extract<CourseVisual, {kind: 'geometry'}>;

const SAMPLES = 240;

/** A drawn path that grows from its start as `progress` goes from 0 to 1. */
const Growing: React.FC<React.SVGProps<SVGPathElement> & {progress: number}> = ({progress, style, ...props}) => (
	<path fill="none" strokeLinecap="round" strokeLinejoin="round" {...props} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} style={{...style, opacity: progress <= 0 ? 0 : 1}} />
);

/**
 * Graphs of functions of x, measured data as bars or a line, and marked
 * points, on axes with a light grid. Curves are drawn one after another, as
 * if traced while they are explained.
 */
export const PlotVisual: React.FC<VisualBoxProps & {visual: Plot}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const clipId = `plot${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const pad = {left: u(84), right: u(28), top: u(28), bottom: u(70)};
	const x = scaleLinear().domain(visual.x).range([pad.left, width - pad.right]);
	const y = scaleLinear().domain(visual.y).range([height - pad.bottom, pad.top]);
	const axes = useReveal(delaySeconds, 0.5);
	const colours = [palette.lesson, palette.brand, palette.ink];
	const fontSize = u(26);
	const clampY = (value: number) => Math.max(visual.y[0] - (visual.y[1] - visual.y[0]), Math.min(visual.y[1] + (visual.y[1] - visual.y[0]), value));

	const curves = visual.curves.map((curve) => {
		const evaluate = parseExpression(curve.expression, ['x']);
		const data = Array.from({length: SAMPLES + 1}, (_, index) => {
			const xValue = visual.x[0] + ((visual.x[1] - visual.x[0]) * index) / SAMPLES;
			const yValue = evaluate({x: xValue});
			return [xValue, Number.isFinite(yValue) ? clampY(yValue) : NaN] as [number, number];
		});
		return linePath<[number, number]>()
			.defined((point) => Number.isFinite(point[1]))
			.x((point) => x(point[0]))
			.y((point) => y(point[1]))(data);
	});
	const ticks = (scale: typeof x) => scale.ticks(width > u(900) ? 8 : 5);
	// Bars are labelled one by one; a function's axis gets round numbers.
	const xTicks = visual.series?.kind === 'bars' ? visual.series.values.map((value) => value.x) : ticks(x);
	const zeroX = Math.min(Math.max(x(0), pad.left), width - pad.right);
	const zeroY = Math.min(Math.max(y(0), pad.top), height - pad.bottom);
	const series = visual.series;
	const seriesProgress = useReveal(delaySeconds + 0.4, 1.2);
	const curveProgress = [useReveal(delaySeconds + 0.4, 1.4), useReveal(delaySeconds + 1.6, 1.4), useReveal(delaySeconds + 2.8, 1.4)];
	const pointsProgress = useReveal(delaySeconds + 0.6 + visual.curves.length * 1.2, 0.4);
	const barWidth = series ? Math.max(u(8), ((width - pad.left - pad.right) / series.values.length) * 0.62) : 0;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={axes}>
				{xTicks.map((tick) => (
					<g key={`x${tick}`}>
						<line x1={x(tick)} x2={x(tick)} y1={pad.top} y2={height - pad.bottom} stroke={palette.grid} strokeWidth={u(2)} />
						<text x={x(tick)} y={height - pad.bottom + u(40)} fill={palette.muted} fontSize={fontSize} textAnchor="middle">{series?.values.find((value) => value.x === tick)?.label ?? tick}</text>
					</g>
				))}
				{ticks(y).map((tick) => (
					<g key={`y${tick}`}>
						<line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke={palette.grid} strokeWidth={u(2)} />
						<text x={pad.left - u(14)} y={y(tick) + fontSize * 0.35} fill={palette.muted} fontSize={fontSize} textAnchor="end">{tick}</text>
					</g>
				))}
				<line x1={pad.left} x2={width - pad.right} y1={zeroY} y2={zeroY} stroke={palette.axis} strokeWidth={u(4)} />
				<line x1={zeroX} x2={zeroX} y1={pad.top} y2={height - pad.bottom} stroke={palette.axis} strokeWidth={u(4)} />
				{visual.xLabel ? <text x={width - pad.right} y={zeroY - u(14)} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight} textAnchor="end">{visual.xLabel}</text> : null}
				{visual.yLabel ? <text x={zeroX + u(14)} y={pad.top + fontSize} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight}>{visual.yLabel}</text> : null}
			</g>
			{series?.kind === 'bars'
				? series.values.map((value, index) => {
						const grow = Math.min(1, Math.max(0, seriesProgress * series.values.length - index));
						const top = y(value.y * grow);
						return <rect key={index} x={x(value.x) - barWidth / 2} y={Math.min(top, zeroY)} width={barWidth} height={Math.abs(zeroY - top)} rx={u(6)} fill={palette.lesson} />;
					})
				: null}
			{series?.kind === 'line' ? (
				<Growing
					progress={seriesProgress}
					d={linePath<{x: number; y: number}>().x((value) => x(value.x)).y((value) => y(value.y))(series.values) ?? ''}
					stroke={palette.lesson}
					strokeWidth={u(8)}
				/>
			) : null}
			<clipPath id={clipId}>
				<rect x={pad.left} y={pad.top} width={width - pad.left - pad.right} height={height - pad.top - pad.bottom} />
			</clipPath>
			<g clipPath={`url(#${clipId})`}>
				{curves.map((d, index) => (
					<Growing key={index} progress={curveProgress[index]} d={d ?? ''} stroke={colours[index]} strokeWidth={u(8)} />
				))}
			</g>
			{visual.curves.map((curve, index) =>
				curve.label ? (
					<text key={`label${index}`} x={width - pad.right - u(10)} y={pad.top + u(36) + index * u(40)} fill={colours[index]} fontSize={fontSize * 1.15} fontWeight={palette.strongWeight} textAnchor="end" opacity={curveProgress[index]}>
						{curve.label}
					</text>
				) : null,
			)}
			{visual.points.map((point, index) => (
				<g key={`p${index}`} opacity={pointsProgress}>
					<circle cx={x(point.x)} cy={y(point.y)} r={u(12)} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
					{point.label ? <text x={x(point.x) + u(18)} y={y(point.y) - u(16)} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight}>{point.label}</text> : null}
				</g>
			))}
		</svg>
	);
};

const angleArc = (center: [number, number], from: [number, number], to: [number, number], radius: number): string => {
	const a1 = Math.atan2(from[1] - center[1], from[0] - center[0]);
	const a2 = Math.atan2(to[1] - center[1], to[0] - center[0]);
	let delta = a2 - a1;
	while (delta <= -Math.PI) delta += 2 * Math.PI;
	while (delta > Math.PI) delta -= 2 * Math.PI;
	const start = [center[0] + radius * Math.cos(a1), center[1] + radius * Math.sin(a1)];
	const end = [center[0] + radius * Math.cos(a1 + delta), center[1] + radius * Math.sin(a1 + delta)];
	return `M${start[0]} ${start[1]} A${radius} ${radius} 0 0 ${delta > 0 ? 1 : 0} ${end[0]} ${end[1]}`;
};

/**
 * A geometric figure from coordinates: points with letters, sides with
 * lengths, circles, marked angles (a square corner for right angles) and
 * filled polygons. Drawn in construction order: shapes, then sides, then
 * angles and labels.
 */
export const GeometryVisual: React.FC<VisualBoxProps & {visual: Geometry}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const [minX, minY, maxX, maxY] = visual.view;
	const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
	const offsetX = (width - (maxX - minX) * scale) / 2;
	const offsetY = (height - (maxY - minY) * scale) / 2;
	const toScreen = ([px, py]: [number, number]): [number, number] => [offsetX + (px - minX) * scale, offsetY + (maxY - py) * scale];
	const byId = new Map(visual.points.map((point) => [point.id, toScreen(point.at)]));
	const at = (id: string): [number, number] => byId.get(id) ?? [0, 0];
	const shapes = useReveal(delaySeconds, 0.6);
	const labels = useReveal(delaySeconds + 0.4 + visual.segments.length * 0.25, 0.4);
	const fontSize = u(34);
	const centre: [number, number] = [width / 2, height / 2];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{visual.polygons.map((polygon, index) => (
				<polygon key={`poly${index}`} points={polygon.points.map((id) => at(id).join(',')).join(' ')} fill={polygon.fill ? palette.fill : 'none'} opacity={shapes} />
			))}
			{visual.circles.map((circle, index) => {
				const [cx, cy] = at(circle.center);
				return <Growing key={`c${index}`} progress={shapes} d={`M${cx + circle.radius * scale} ${cy} a${circle.radius * scale} ${circle.radius * scale} 0 1 0 ${-2 * circle.radius * scale} 0 a${circle.radius * scale} ${circle.radius * scale} 0 1 0 ${2 * circle.radius * scale} 0`} stroke={palette.lesson} strokeWidth={u(6)} />;
			})}
			{visual.segments.map((segment, index) => (
				<SegmentLine key={`s${index}`} from={at(segment.from)} to={at(segment.to)} label={segment.label} dashed={segment.dashed} delaySeconds={delaySeconds + 0.3 + index * 0.25} centre={centre} />
			))}
			{visual.angles.map((angle, index) => {
				const corner = at(angle.at);
				const radius = u(54);
				if (angle.right) {
					const unit = (target: [number, number]) => {
						const dx = target[0] - corner[0];
						const dy = target[1] - corner[1];
						const length = Math.hypot(dx, dy) || 1;
						return [(dx / length) * u(36), (dy / length) * u(36)];
					};
					const [ax, ay] = unit(at(angle.from));
					const [bx, by] = unit(at(angle.to));
					return <path key={`a${index}`} d={`M${corner[0] + ax} ${corner[1] + ay} L${corner[0] + ax + bx} ${corner[1] + ay + by} L${corner[0] + bx} ${corner[1] + by}`} fill="none" stroke={palette.brand} strokeWidth={u(5)} opacity={labels} />;
				}
				const mid = (() => {
					const a = Math.atan2(at(angle.from)[1] - corner[1], at(angle.from)[0] - corner[0]);
					const b = Math.atan2(at(angle.to)[1] - corner[1], at(angle.to)[0] - corner[0]);
					let delta = b - a;
					while (delta <= -Math.PI) delta += 2 * Math.PI;
					while (delta > Math.PI) delta -= 2 * Math.PI;
					return a + delta / 2;
				})();
				return (
					<g key={`a${index}`} opacity={labels}>
						<path d={angleArc(corner, at(angle.from), at(angle.to), radius)} fill="none" stroke={palette.brand} strokeWidth={u(5)} />
						{angle.label ? <text x={corner[0] + Math.cos(mid) * radius * 1.9} y={corner[1] + Math.sin(mid) * radius * 1.9 + fontSize * 0.35} fill={palette.brand} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle">{angle.label}</text> : null}
					</g>
				);
			})}
			{visual.points.map((point) => {
				const [px, py] = at(point.id);
				const away = Math.atan2(py - centre[1], px - centre[0]);
				return (
					<g key={point.id} opacity={labels}>
						<circle cx={px} cy={py} r={u(9)} fill={palette.ink} />
						{point.label !== '' ? (
							<text x={px + Math.cos(away) * u(38)} y={py + Math.sin(away) * u(38) + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								{point.label ?? point.id}
							</text>
						) : null}
					</g>
				);
			})}
		</svg>
	);
};

const SegmentLine: React.FC<{from: [number, number]; to: [number, number]; label?: string; dashed: boolean; delaySeconds: number; centre: [number, number]}> = ({from, to, label, dashed, delaySeconds, centre}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const progress = useReveal(delaySeconds, 0.5);
	const mid: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
	// The length label sits on the outer side of the segment.
	const normal = [-(to[1] - from[1]), to[0] - from[0]];
	const length = Math.hypot(normal[0], normal[1]) || 1;
	const outward = (mid[0] - centre[0]) * normal[0] + (mid[1] - centre[1]) * normal[1] >= 0 ? 1 : -1;
	const labelAt = [mid[0] + (normal[0] / length) * u(36) * outward, mid[1] + (normal[1] / length) * u(36) * outward];
	return (
		<g>
			{dashed ? (
				<path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={palette.muted} strokeWidth={u(4)} strokeDasharray={`${u(14)} ${u(12)}`} opacity={progress} />
			) : (
				<Growing progress={progress} d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={palette.lesson} strokeWidth={u(7)} />
			)}
			{label ? <text x={labelAt[0]} y={labelAt[1] + u(11)} fill={palette.ink} fontSize={u(32)} fontWeight={700} textAnchor="middle" opacity={progress}>{label}</text> : null}
		</g>
	);
};
