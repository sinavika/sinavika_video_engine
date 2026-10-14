import {scaleLinear} from 'd3-scale';
import {line as linePath} from 'd3-shape';
import React, {useId, useMemo} from 'react';
import {withAlpha} from '../../Themes/Theme';
import type {CourseVisual} from './VisualSchemas';
import {parseExpression} from './PlotExpression';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {Part, elementLook, useElementState, useParams} from './VisualTimeline';
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
	const names = Object.keys(visual.parameters);
	const drawnBy = delaySeconds + 0.4 + visual.curves.length * 1.2;
	const params = useParams(visual.parameters, {delaySeconds: drawnBy + 0.4, seconds: 3.5});
	const evaluators = useMemo(() => visual.curves.map((curve) => parseExpression(curve.expression, ['x', ...names])), [visual.curves, names.join()]);
	const valueOf = (curve: number, at: number) => evaluators[curve]({...params, x: at});

	const curves = evaluators.map((evaluate) => {
		const data = Array.from({length: SAMPLES + 1}, (_, index) => {
			const xValue = visual.x[0] + ((visual.x[1] - visual.x[0]) * index) / SAMPLES;
			const yValue = evaluate({...params, x: xValue});
			return [xValue, Number.isFinite(yValue) ? clampY(yValue) : NaN] as [number, number];
		});
		return linePath<[number, number]>()
			.defined((point) => Number.isFinite(point[1]))
			.x((point) => x(point[0]))
			.y((point) => y(point[1]))(data);
	});
	const curveLooks = [elementLook(useElementState('c1')), elementLook(useElementState('c2')), elementLook(useElementState('c3'))];
	const tangentLook = elementLook(useElementState(visual.tangent ? 'tangent' : undefined));
	const areaLook = elementLook(useElementState(visual.area ? 'area' : undefined));
	const extras = useReveal(drawnBy, 0.6);
	const parameterText = names.map((name) => `${name} = ${formatNumber(params[name])}`).join('   ');
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
				{visual.area ? <AreaUnder area={visual.area} valueOf={(at) => valueOf(visual.area!.curve, at)} params={params} x={x} y={y} zeroY={zeroY} progress={extras * areaLook.opacity} emphasis={areaLook.scale} /> : null}
				{curves.map((d, index) => (
					<Growing key={index} progress={curveProgress[index]} d={d ?? ''} stroke={colours[index]} strokeWidth={u(8) * curveLooks[index].scale} opacity={curveLooks[index].opacity} />
				))}
				{visual.tangent ? <Tangent tangent={visual.tangent} valueOf={(at) => valueOf(visual.tangent!.curve, at)} params={params} x={x} y={y} width={width} progress={extras * tangentLook.opacity} emphasis={tangentLook.scale} fontSize={fontSize} /> : null}
			</g>
			{visual.curves.map((curve, index) =>
				curve.label ? (
					<text key={`label${index}`} x={width - pad.right - u(10)} y={pad.top + u(36) + index * u(40)} fill={colours[index]} fontSize={fontSize * 1.15} fontWeight={palette.strongWeight} textAnchor="end" opacity={curveProgress[index] * curveLooks[index].opacity}>
						{curve.label}
					</text>
				) : null,
			)}
			{parameterText ? (
				<text x={pad.left + u(14)} y={pad.top + u(36)} fill={palette.lesson} fontSize={fontSize * 1.2} fontWeight={900} opacity={axes}>
					{parameterText}
				</text>
			) : null}
			{visual.points.map((point, index) => (
				<PlotPoint key={`p${index}`} id={`p${index + 1}`} label={point.label} at={[x(point.x), y(point.y)]} progress={pointsProgress} fontSize={fontSize} />
			))}
		</svg>
	);
};

const formatNumber = (value: number): string => {
	const rounded = Math.round(value * 100) / 100;
	return String(rounded).replace('.', ',').replace('-', '−');
};

const PlotPoint: React.FC<{id: string; label?: string; at: [number, number]; progress: number; fontSize: number}> = ({id, label, at, progress, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	return (
		<g opacity={progress * look.opacity}>
			<circle cx={at[0]} cy={at[1]} r={u(12) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
			{label ? <text x={at[0] + u(18)} y={at[1] - u(16)} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight}>{label}</text> : null}
		</g>
	);
};

type Scale = (value: number) => number;

/** The tangent at a point of a curve that may slide along it: the point, the line, and its slope (the derivative there). */
const Tangent: React.FC<{tangent: NonNullable<Plot['tangent']>; valueOf: (at: number) => number; params: Record<string, number>; x: Scale; y: Scale; width: number; progress: number; emphasis: number; fontSize: number}> = ({tangent, valueOf, params, x, y, width, progress, emphasis, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const at = typeof tangent.at === 'number' ? tangent.at : (params[tangent.at] ?? 0);
	const h = 1e-4;
	const slope = (valueOf(at + h) - valueOf(at - h)) / (2 * h);
	const fy = valueOf(at);
	if (!Number.isFinite(slope) || !Number.isFinite(fy)) return null;
	// A segment of fixed screen length, centred on the point.
	const dxScreen = x(at + 1) - x(at);
	const dyScreen = y(fy + slope) - y(fy);
	const length = Math.hypot(dxScreen, dyScreen) || 1;
	const half = width * 0.22;
	const [ux, uy] = [(dxScreen / length) * half, (dyScreen / length) * half];
	const [px, py] = [x(at), y(fy)];
	return (
		<g opacity={progress}>
			<line x1={px - ux} y1={py - uy} x2={px + ux} y2={py + uy} stroke={palette.brand} strokeWidth={u(6) * emphasis} strokeLinecap="round" />
			<circle cx={px} cy={py} r={u(13) * emphasis} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
			{tangent.slope ? (
				<text x={px + u(20)} y={py + (slope > 0 ? u(46) : -u(26))} fill={palette.brand} fontSize={fontSize * 1.15} fontWeight={900}>
					{`eğim = ${formatNumber(slope)}`}
				</text>
			) : null}
		</g>
	);
};

/** The area under a curve: a filled region, or strips (left Riemann sums) whose total approaches it as they get thinner. */
const AreaUnder: React.FC<{area: NonNullable<Plot['area']>; valueOf: (at: number) => number; params: Record<string, number>; x: Scale; y: Scale; zeroY: number; progress: number; emphasis: number}> = ({area, valueOf, params, x, y, zeroY, progress, emphasis}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const count = area.rectangles === undefined ? 0 : Math.max(1, Math.round(typeof area.rectangles === 'number' ? area.rectangles : (params[area.rectangles] ?? 1)));
	const width = area.to - area.from;
	let total = 0;
	const strips = Array.from({length: count}, (_, index) => {
		const left = area.from + (width * index) / count;
		const value = valueOf(left);
		total += (Number.isFinite(value) ? value : 0) * (width / count);
		const top = y(Number.isFinite(value) ? value : 0);
		return <rect key={index} x={x(left)} y={Math.min(top, zeroY)} width={Math.max(0, x(left + width / count) - x(left))} height={Math.abs(zeroY - top)} fill={withAlpha(palette.lesson, 0.28)} stroke={palette.lesson} strokeWidth={u(2)} />;
	});
	const samples = Array.from({length: 121}, (_, index) => area.from + (width * index) / 120);
	const outline = `M${x(area.from)} ${zeroY} ${samples.map((at) => `L${x(at)} ${y(valueOf(at))}`).join(' ')} L${x(area.to)} ${zeroY} Z`;
	return (
		<g opacity={progress}>
			{count === 0 ? <path d={outline} fill={withAlpha(palette.lesson, 0.22 * emphasis)} /> : strips}
			{area.label || count > 0 ? (
				<text x={x(area.from + width / 2)} y={zeroY - u(18)} fill={palette.ink} fontSize={u(28)} fontWeight={800} textAnchor="middle">
					{area.label ?? `${count} şerit ≈ ${formatNumber(total)}`}
				</text>
			) : null}
		</g>
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
				<Part key={`poly${index}`} id={polygon.points.join('')}>
					{(look) => <polygon points={polygon.points.map((id) => at(id).join(',')).join(' ')} fill={polygon.fill ? (look.scale > 1 ? withAlpha(palette.lesson, 0.32) : palette.fill) : 'none'} opacity={shapes * look.opacity} />}
				</Part>
			))}
			{visual.circles.map((circle, index) => {
				const [cx, cy] = at(circle.center);
				return (
					<Part key={`c${index}`} id={`circle-${circle.center}`}>
						{(look) => <Growing progress={shapes * look.opacity} d={`M${cx + circle.radius * scale} ${cy} a${circle.radius * scale} ${circle.radius * scale} 0 1 0 ${-2 * circle.radius * scale} 0 a${circle.radius * scale} ${circle.radius * scale} 0 1 0 ${2 * circle.radius * scale} 0`} stroke={palette.lesson} strokeWidth={u(6) * look.scale} />}
					</Part>
				);
			})}
			{visual.segments.map((segment, index) => (
				<SegmentLine key={`s${index}`} id={`${segment.from}${segment.to}`} from={at(segment.from)} to={at(segment.to)} label={segment.label} dashed={segment.dashed} delaySeconds={delaySeconds + 0.3 + index * 0.25} centre={centre} />
			))}
			{visual.angles.map((angle, index) => (
				<Part key={`a${index}`} id={`angle-${angle.at}`}>
					{(look) => <g opacity={look.opacity}>{angleMark(angle, index)}</g>}
				</Part>
			))}
			{visual.points.map((point) => {
				const [px, py] = at(point.id);
				const away = Math.atan2(py - centre[1], px - centre[0]);
				return (
					<Part key={point.id} id={point.id}>
						{(look) => (
							<g opacity={labels * look.opacity}>
								<circle cx={px} cy={py} r={u(9) * look.scale} fill={look.scale > 1 ? palette.lesson : palette.ink} />
								{point.label !== '' ? (
									<text x={px + Math.cos(away) * u(38)} y={py + Math.sin(away) * u(38) + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * (1 + (look.scale - 1) * 0.5)} fontWeight={800} textAnchor="middle">
										{point.label ?? point.id}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
		</svg>
	);

	function angleMark(angle: Geometry['angles'][number], index: number) {
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
	}
};

const SegmentLine: React.FC<{id: string; from: [number, number]; to: [number, number]; label?: string; dashed: boolean; delaySeconds: number; centre: [number, number]}> = ({id, from, to, label, dashed, delaySeconds, centre}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const progress = useReveal(delaySeconds, 0.5) * look.opacity;
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
				<Growing progress={progress} d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={palette.lesson} strokeWidth={u(7) * look.scale} />
			)}
			{label ? <text x={labelAt[0]} y={labelAt[1] + u(11)} fill={palette.ink} fontSize={u(32)} fontWeight={700} textAnchor="middle" opacity={progress}>{label}</text> : null}
		</g>
	);
};
