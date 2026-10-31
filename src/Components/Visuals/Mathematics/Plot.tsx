import {scaleLinear} from 'd3-scale';
import {line as linePath} from 'd3-shape';
import React, {useId, useMemo} from 'react';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {parseExpression} from './PlotExpression';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {easeFrom} from '../../../Animations/Motion';
import {elementLook, Part, useBeatStartFor, useElementState, useParams} from '../VisualTimeline';
import {LabelBox, placeLabel, pointSpots, ringAround, segmentSpots, textWidth} from './FigureLabel';

type Plot = Extract<CourseVisual, {kind: 'plot'}>;

const SAMPLES = 240;

/** A drawn path that grows from its start as `progress` goes from 0 to 1. */
export const Growing: React.FC<React.SVGProps<SVGPathElement> & {progress: number}> = ({progress, style, ...props}) => (
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
	// Labelled bars carry the axis name under their labels, not over the last bar.
	const barAxisName = visual.series?.kind === 'bars' && Boolean(visual.xLabel);
	const area = plotArea(visual, width, height, {left: u(84), right: u(28), top: u(28), bottom: barAxisName ? u(112) : u(70)});
	const x = scaleLinear().domain(visual.x).range([area.left, area.right]);
	const y = scaleLinear().domain(visual.y).range([area.bottom, area.top]);
	const axes = useReveal(delaySeconds, 0.5);
	const colours = [palette.lesson, palette.brand, palette.ink];
	const fontSize = u(26);
	const clampY = (value: number) => Math.max(visual.y[0] - (visual.y[1] - visual.y[0]), Math.min(visual.y[1] + (visual.y[1] - visual.y[0]), value));
	const names = Object.keys(visual.parameters);
	const drawnBy = delaySeconds + 0.4 + visual.curves.length * 1.2;
	const params = useParams(visual.parameters, {delaySeconds: drawnBy + 0.4, seconds: 3.5});
	const evaluators = useMemo(() => visual.curves.map((curve) => parseExpression(curve.expression, ['x', ...names])), [visual.curves, names.join()]);
	const valueOf = (curve: number, at: number) => evaluators[curve]({...params, x: at});
	/** The value curve `curve` closes in on at x = `at` from one side (+1 from the right, −1 from the left): the value itself, or, where the formula is 0/0, the value just beside it. */
	const sideValue = (curve: number, at: number, side: 1 | -1) => {
		const exact = valueOf(curve, at);
		if (Number.isFinite(exact)) return exact;
		const step = (visual.x[1] - visual.x[0]) * 1e-6;
		return valueOf(curve, at + side * step);
	};

	// A piece of a piecewise function is sampled over its own domain, so it ends exactly at its end points.
	const spanOf = (curve: number): [number, number] => {
		const domain = visual.curves[curve].domain;
		return domain ? [Math.max(visual.x[0], domain[0]), Math.min(visual.x[1], domain[1])] : visual.x;
	};
	const curveData = evaluators.map((evaluate, curve) =>
		Array.from({length: SAMPLES + 1}, (_, index) => {
			const [from, to] = spanOf(curve);
			const xValue = from + ((to - from) * index) / SAMPLES;
			const yValue = evaluate({...params, x: xValue});
			return [xValue, Number.isFinite(yValue) ? clampY(yValue) : NaN] as [number, number];
		}),
	);
	const curves = curveData.map((data) =>
		linePath<[number, number]>()
			.defined((point) => Number.isFinite(point[1]))
			.x((point) => x(point[0]))
			.y((point) => y(point[1]))(data),
	);
	const curveLooks = [elementLook(useElementState('c1')), elementLook(useElementState('c2')), elementLook(useElementState('c3'))];
	const tangentLook = elementLook(useElementState(visual.tangent ? 'tangent' : undefined));
	const areaLook = elementLook(useElementState(visual.area ? 'area' : undefined));
	const extras = useReveal(drawnBy, 0.6);
	// The limit: two points close in on x = at from both sides once the part `approach` is named (or after the curves).
	const approachLook = elementLook(useElementState(visual.approach ? 'approach' : undefined));
	const approachShown = useBeatStartFor('approach', 'show');
	const approachFocused = useBeatStartFor('approach', 'focus');
	const approachStart = approachShown ?? approachFocused ?? drawnBy + 0.6;
	const approachProgress = easeFrom(useSceneSeconds(), approachStart, 3.2);
	const parameterText = names.map((name) => `${name} = ${formatNumber(params[name])}`).join('   ');
	// With equal scale both axes step by the same round number, at least a label's width apart.
	const unit = x(1) - x(0);
	const equalStep = visual.equalScale ? ([1, 2, 5, 10, 20, 50, 100].find((step) => step * unit >= u(48)) ?? 100) : 0;
	const ticks = (scale: typeof x, domain: [number, number]) => (equalStep ? steppedTicks(domain, equalStep) : scale.ticks(width > u(900) ? 8 : 5));
	// Bars are labelled one by one; a function's axis gets round numbers.
	const xTicks = visual.series?.kind === 'bars' ? visual.series.values.map((value) => value.x) : ticks(x, visual.x);
	const zeroX = Math.min(Math.max(x(0), area.left), area.right);
	const zeroY = Math.min(Math.max(y(0), area.top), area.bottom);
	// The drawn axes: through the origin, or along the edges for a measured graph (bars and areas still stand on y = 0).
	const axisX = visual.axes === 'edge' ? area.left : zeroX;
	const axisY = visual.axes === 'edge' ? area.bottom : zeroY;
	const series = visual.series;
	const seriesProgress = useReveal(delaySeconds + 0.4, 1.2);
	const curveProgress = [useReveal(delaySeconds + 0.4, 1.4), useReveal(delaySeconds + 1.6, 1.4), useReveal(delaySeconds + 2.8, 1.4)];
	const pointsProgress = useReveal(delaySeconds + 0.6 + visual.curves.length * 1.2, 0.4);
	const barWidth = series ? Math.max(u(8), ((area.right - area.left) / series.values.length) * 0.62) : 0;

	// Labels of points and segments go where they cover no curve, line, dot or other label.
	const labelFont = fontSize * 1.1;
	const obstacles: [number, number][] = [
		...curveData.flatMap((data) => data.filter((point, index) => index % 2 === 0 && Number.isFinite(point[1])).map(([px, py]) => [x(px), y(py)] as [number, number])),
		...(series?.kind === 'line' ? series.values.map((value) => [x(value.x), y(value.y)] as [number, number]) : []),
		...visual.segments.flatMap((segment) => sampleLine([x(segment.from[0]), y(segment.from[1])], [x(segment.to[0]), y(segment.to[1])], u(12))),
		...sampleLine([area.left, axisY], [area.right, axisY], u(16)),
		...sampleLine([axisX, area.top], [axisX, area.bottom], u(16)),
		...visual.points.flatMap((point) => ringAround([x(point.x), y(point.y)], u(14))),
	];
	// The curves' names stand together in the corner they cover least: top right unless a curve leaves there.
	const legendFont = fontSize * 1.15;
	// Each name is written in ink after a short line in its curve's colour: the second curve is brand orange, and
	// brand orange is never a text colour (FIZ 20, the black-body curves).
	const swatch = u(44);
	const legendWidth = Math.max(0, ...visual.curves.map((curve) => (curve.label ? textWidth(curve.label, legendFont) + swatch : 0)));
	const legendHeight = visual.curves.length * u(40);
	const inset = u(10);
	// The coefficients' values start after the y axis's name when the axis runs along the left edge, where the two
	// were written on top of each other (AYT MAT 26, y = a·sin(bx) from x = 0).
	const parameterFont = fontSize * 1.2;
	const parameterWidth = parameterText ? textWidth(parameterText, parameterFont) : 0;
	const yLabelSpan = visual.yLabel ? [axisX + u(14), axisX + u(14) + textWidth(visual.yLabel, labelFont)] : undefined;
	const parameterX = yLabelSpan && yLabelSpan[0] < area.left + u(26) + parameterWidth && yLabelSpan[1] > area.left ? yLabelSpan[1] + u(18) : area.left + u(14);
	const fixedText: LabelBox[] = [
		...(visual.yLabel ? [[axisX + u(14), area.top, axisX + u(14) + textWidth(visual.yLabel, labelFont), area.top + fontSize * 1.1] as LabelBox] : []),
		// The x axis's name at the right end of the axis: curve names in the bottom right corner sat on it (FIZ 4).
		...(visual.xLabel && !barAxisName ? [[area.right - textWidth(visual.xLabel, labelFont), axisY - u(14) - labelFont, area.right, axisY - u(4)] as LabelBox] : []),
		...(parameterText ? [[parameterX, area.top + u(36) - parameterFont, parameterX + parameterWidth, area.top + u(36)] as LabelBox] : []),
	];
	// The top left corner starts after the y axis's name, so the names do not sit on it (FIZ 2, m-V graph).
	const topLeft = visual.yLabel ? Math.max(area.left + inset, axisX + u(14) + textWidth(visual.yLabel, labelFont) + u(18)) : area.left + inset;
	const legend =
		legendWidth > 0
			? placeLabel(
					[
						[area.right - inset - legendWidth, area.top + inset, area.right - inset, area.top + inset + legendHeight],
						[topLeft, area.top + inset, topLeft + legendWidth, area.top + inset + legendHeight],
						[area.right - inset - legendWidth, area.bottom - inset - legendHeight, area.right - inset, area.bottom - inset],
						[area.left + inset, area.bottom - inset - legendHeight, area.left + inset + legendWidth, area.bottom - inset],
					],
					obstacles,
					fixedText,
					[area.left, area.top, area.right, area.bottom],
				)
			: undefined;
	const taken: LabelBox[] = [...fixedText, ...(legend ? [legend] : [])];
	const bounds: LabelBox = [area.left - u(60), area.top - u(24), area.right + u(24), area.bottom + u(30)];
	const pointLabels = visual.points.map((point) => {
		if (!point.label) return undefined;
		const place = placeLabel(pointSpots([x(point.x), y(point.y)], textWidth(point.label, labelFont), labelFont, u(16)), obstacles, taken, bounds);
		taken.push(place);
		return place;
	});
	const segmentLabels = visual.segments.map((segment) => {
		if (!segment.label) return undefined;
		const place = placeLabel(segmentSpots([x(segment.from[0]), y(segment.from[1])], [x(segment.to[0]), y(segment.to[1])], textWidth(segment.label, labelFont), labelFont, u(14)), obstacles, taken, bounds);
		taken.push(place);
		return place;
	});

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={axes}>
				{xTicks.map((tick) => (
					<g key={`x${tick}`}>
						<line x1={x(tick)} x2={x(tick)} y1={area.top} y2={area.bottom} stroke={palette.grid} strokeWidth={u(2)} />
						<text x={x(tick)} y={area.bottom + u(40)} fill={palette.muted} fontSize={fontSize} textAnchor="middle">{series?.values.find((value) => value.x === tick)?.label ?? formatNumber(tick)}</text>
					</g>
				))}
				{ticks(y, visual.y).map((tick) => (
					<g key={`y${tick}`}>
						<line x1={area.left} x2={area.right} y1={y(tick)} y2={y(tick)} stroke={palette.grid} strokeWidth={u(2)} />
						<text x={area.left - u(14)} y={y(tick) + fontSize * 0.35} fill={palette.muted} fontSize={fontSize} textAnchor="end">{formatNumber(tick)}</text>
					</g>
				))}
				<line x1={area.left} x2={area.right} y1={axisY} y2={axisY} stroke={palette.axis} strokeWidth={u(4)} />
				<line x1={axisX} x2={axisX} y1={area.top} y2={area.bottom} stroke={palette.axis} strokeWidth={u(4)} />
				{visual.xLabel && barAxisName ? <text x={(area.left + area.right) / 2} y={area.bottom + u(88)} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight} textAnchor="middle">{visual.xLabel}</text> : null}
				{visual.xLabel && !barAxisName ? <text x={area.right} y={axisY - u(14)} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight} textAnchor="end">{visual.xLabel}</text> : null}
				{visual.yLabel ? <text x={axisX + u(14)} y={area.top + fontSize} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight}>{visual.yLabel}</text> : null}
			</g>
			{series?.kind === 'bars'
				? series.values.map((value, index) => {
						const grow = Math.min(1, Math.max(0, seriesProgress * series.values.length - index));
						const top = y(value.y * grow);
						// Each bar is a part (b1, b2…) a beat can point at; with showValues its value stands on it.
						return (
							<Part key={index} id={`b${index + 1}`}>
								{(look) => (
									<g opacity={look.opacity}>
										<rect x={x(value.x) - barWidth / 2} y={Math.min(top, zeroY)} width={barWidth} height={Math.abs(zeroY - top)} rx={u(6)} fill={look.scale > 1 ? palette.brand : palette.lesson} />
										{series.showValues && grow >= 1 ? (
											<text x={x(value.x)} y={Math.min(top, zeroY) - u(10)} fill={look.scale > 1 ? palette.brand : palette.ink} fontSize={fontSize * (look.scale > 1 ? 1.05 : 0.85)} fontWeight={palette.strongWeight} textAnchor="middle">
												{value.y.toLocaleString('tr-TR')}
											</text>
										) : null}
									</g>
								)}
							</Part>
						);
					})
				: null}
			{series?.kind === 'line' ? (
				<Growing
					progress={seriesProgress}
					d={linePath<{x: number; y: number}>().x((value) => x(value.x)).y((value) => y(value.y))(series.values) ?? ''}
					stroke={visual.curves.length > 0 ? colours[visual.curves.length % colours.length] : palette.lesson}
					strokeWidth={u(8)}
				/>
			) : null}
			<clipPath id={clipId}>
				<rect x={area.left} y={area.top} width={area.right - area.left} height={area.bottom - area.top} />
			</clipPath>
			<g clipPath={`url(#${clipId})`}>
				{visual.area ? <AreaUnder area={visual.area} valueOf={(at) => valueOf(visual.area!.curve, at)} params={params} x={x} y={y} zeroY={zeroY} progress={extras * areaLook.opacity} emphasis={areaLook.scale} /> : null}
				{curves.map((d, index) => (
					<Growing key={index} progress={curveProgress[index]} d={d ?? ''} stroke={colours[index]} strokeWidth={u(8) * curveLooks[index].scale} opacity={curveLooks[index].opacity} />
				))}
				{visual.tangent ? <Tangent tangent={visual.tangent} valueOf={(at) => valueOf(visual.tangent!.curve, at)} params={params} x={x} y={y} width={width} progress={extras * tangentLook.opacity} emphasis={tangentLook.scale} fontSize={fontSize} /> : null}
			</g>
			{visual.approach && approachProgress > 0.001 ? (
				<Approach approach={visual.approach} sideValue={sideValue} span={visual.x[1] - visual.x[0]} progress={approachProgress} look={approachLook} x={x} y={y} axisX={axisX} axisY={axisY} top={area.top} bottom={area.bottom} colours={colours} fontSize={fontSize} />
			) : null}
			{/* The ends of the pieces go on top, where the running points of a limit end. */}
			{visual.curves.map((curve, index) =>
				curve.domain
					? curve.ends.map((end, side) => {
							if (end === 'none') return null;
							const at = curve.domain![side];
							const value = sideValue(index, at, side === 0 ? 1 : -1);
							if (!Number.isFinite(value) || at < visual.x[0] || at > visual.x[1]) return null;
							return <circle key={`end${index}${side}`} cx={x(at)} cy={y(value)} r={u(11)} fill={end === 'closed' ? colours[index] : palette.surface} stroke={colours[index]} strokeWidth={u(5)} opacity={curveProgress[index] >= 0.98 ? curveLooks[index].opacity : 0} />;
						})
					: null,
			)}
			{visual.segments.map((segment, index) => (
				<PlotSegment key={`s${index}`} id={`s${index + 1}`} from={[x(segment.from[0]), y(segment.from[1])]} to={[x(segment.to[0]), y(segment.to[1])]} dashed={segment.dashed} label={segment.label} labelAt={segmentLabels[index]} progress={pointsProgress} fontSize={labelFont} />
			))}
			{visual.curves.map((curve, index) =>
				curve.label ? (
					<g key={`label${index}`} opacity={curveProgress[index] * curveLooks[index].opacity}>
						<line
							x1={(legend ? legend[2] : area.right - inset) - textWidth(curve.label, legendFont) - swatch}
							x2={(legend ? legend[2] : area.right - inset) - textWidth(curve.label, legendFont) - u(10)}
							y1={(legend ? legend[1] : area.top + inset) + u(26) + index * u(40) - legendFont * 0.32}
							y2={(legend ? legend[1] : area.top + inset) + u(26) + index * u(40) - legendFont * 0.32}
							stroke={colours[index]}
							strokeWidth={u(6)}
							strokeLinecap="round"
						/>
						<text x={legend ? legend[2] : area.right - inset} y={(legend ? legend[1] : area.top + inset) + u(26) + index * u(40)} fill={palette.ink} fontSize={legendFont} fontWeight={palette.strongWeight} textAnchor="end">
							{curve.label}
						</text>
					</g>
				) : null,
			)}
			{parameterText ? (
				<text x={parameterX} y={area.top + u(36)} fill={palette.lesson} fontSize={parameterFont} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} opacity={axes}>
					{parameterText}
				</text>
			) : null}
			{visual.points.map((point, index) => (
				<PlotPoint key={`p${index}`} id={`p${index + 1}`} label={point.label} labelAt={pointLabels[index]} at={[x(point.x), y(point.y)]} progress={pointsProgress} fontSize={labelFont} />
			))}
		</svg>
	);
};

/** Where the axes' box sits: the whole box less the room for tick labels, or with equal scale the largest box of the ranges' shape, centred. */
export const plotArea = (visual: Pick<Plot, 'x' | 'y' | 'equalScale'>, width: number, height: number, pad: {left: number; right: number; top: number; bottom: number}) => {
	const area = {left: pad.left, right: width - pad.right, top: pad.top, bottom: height - pad.bottom};
	if (!visual.equalScale) return area;
	const [spanX, spanY] = [visual.x[1] - visual.x[0], visual.y[1] - visual.y[0]];
	const unit = Math.min((area.right - area.left) / spanX, (area.bottom - area.top) / spanY);
	const left = area.left + (area.right - area.left - unit * spanX) / 2;
	const top = area.top + (area.bottom - area.top - unit * spanY) / 2;
	return {left, right: left + unit * spanX, top, bottom: top + unit * spanY};
};

const steppedTicks = ([from, to]: [number, number], step: number): number[] => {
	const ticks: number[] = [];
	for (let value = Math.ceil(from / step) * step; value <= to + 1e-9; value += step) ticks.push(Math.round(value * 1e6) / 1e6);
	return ticks;
};

const formatNumber = (value: number): string => {
	const rounded = Math.round(value * 100) / 100;
	return String(rounded).replace('.', ',').replace('-', '−');
};

const sampleLine = (from: [number, number], to: [number, number], step: number): [number, number][] => {
	const count = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / step));
	return Array.from({length: count + 1}, (_, index) => [from[0] + ((to[0] - from[0]) * index) / count, from[1] + ((to[1] - from[1]) * index) / count]);
};

const PlotPoint: React.FC<{id: string; label?: string; labelAt?: LabelBox; at: [number, number]; progress: number; fontSize: number}> = ({id, label, labelAt, at, progress, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	return (
		<g opacity={progress * look.opacity}>
			<circle cx={at[0]} cy={at[1]} r={u(12) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
			{label && labelAt ? (
				<text x={labelAt[0]} y={labelAt[3] - fontSize * 0.2} fill={palette.ink} fontSize={fontSize} fontWeight={palette.strongWeight} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
					{label}
				</text>
			) : null}
		</g>
	);
};

/** A helper line of a plot (a leg Δx or Δy), dashed by default, with its label beside it. */
const PlotSegment: React.FC<{id: string; from: [number, number]; to: [number, number]; dashed: boolean; label?: string; labelAt?: LabelBox; progress: number; fontSize: number}> = ({id, from, to, dashed, label, labelAt, progress, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const colour = look.scale > 1 ? palette.brand : palette.ink;
	return (
		<g opacity={progress * look.opacity}>
			<line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={colour} strokeWidth={u(5) * look.scale} strokeDasharray={dashed ? `${u(14)} ${u(10)}` : undefined} strokeLinecap="round" />
			{label && labelAt ? (
				// The line turns brand orange when the beat points at it; its label stays ink (orange is never a text colour).
				<text x={labelAt[0]} y={labelAt[3] - fontSize * 0.2} fill={palette.ink} fontSize={fontSize} fontWeight={palette.strongWeight} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
					{label}
				</text>
			) : null}
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
				<text x={px + u(20)} y={py + (slope > 0 ? u(46) : -u(26))} fill={palette.brand} fontSize={fontSize * 1.15} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic}>
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

/**
 * The limit at x = `at`: from each side a point runs along its curve towards `at`, its height dropped onto both axes,
 * the gap shrinking to a hair. A hollow dot marks where each side ends when the point itself is missing (`hole`);
 * the value is named on the y axis at the end.
 */
const Approach: React.FC<{
	approach: NonNullable<Plot['approach']>;
	sideValue: (curve: number, at: number, side: 1 | -1) => number;
	span: number;
	progress: number;
	look: {opacity: number; scale: number};
	x: Scale;
	y: Scale;
	axisX: number;
	axisY: number;
	top: number;
	bottom: number;
	colours: string[];
	fontSize: number;
}> = ({approach, sideValue, span, progress, look, x, y, axisX, axisY, top, bottom, colours, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const gap = span * (0.3 * (1 - progress) + 0.012 * progress);
	const sides = [
		{curve: approach.left, side: -1 as const},
		{curve: approach.right, side: 1 as const},
	].filter((entry): entry is {curve: number; side: -1 | 1} => entry.curve !== undefined);
	const dashed = `${u(8)} ${u(7)}`;
	const limits = sides.map(({curve, side}) => sideValue(curve, approach.at, side));
	const meets = limits.length > 0 && limits.every((value) => Number.isFinite(value) && Math.abs(value - limits[0]) < 1e-3 * Math.max(1, Math.abs(value)));
	return (
		<g opacity={look.opacity}>
			<line x1={x(approach.at)} x2={x(approach.at)} y1={top} y2={bottom} stroke={withAlpha(palette.ink, 0.25)} strokeWidth={u(2)} strokeDasharray={dashed} />
			{sides.map(({curve, side}) => {
				const at = approach.at + side * gap;
				const value = sideValue(curve, at, side);
				if (!Number.isFinite(value)) return null;
				const [px, py] = [x(at), y(value)];
				return (
					<g key={`run${side}`}>
						<line x1={px} x2={px} y1={py} y2={axisY} stroke={withAlpha(colours[curve], 0.55)} strokeWidth={u(3)} strokeDasharray={dashed} />
						<line x1={px} x2={axisX} y1={py} y2={py} stroke={withAlpha(colours[curve], 0.55)} strokeWidth={u(3)} strokeDasharray={dashed} />
						<circle cx={px} cy={axisY} r={u(7)} fill={colours[curve]} />
						<circle cx={axisX} cy={py} r={u(7)} fill={colours[curve]} />
						<circle cx={px} cy={py} r={u(13) * look.scale} fill={colours[curve]} stroke={palette.surface} strokeWidth={u(4)} />
					</g>
				);
			})}
			{/* The hole goes over the points, so it stays visible however close they come. */}
			{approach.hole
				? sides.map(({curve, side}, index) =>
						Number.isFinite(limits[index]) ? <circle key={`hole${side}`} cx={x(approach.at)} cy={y(limits[index])} r={u(12)} fill={palette.surface} stroke={colours[curve]} strokeWidth={u(5)} /> : null,
					)
				: null}
			{approach.label && meets && progress > 0.85 ? (
				<text x={axisX + u(16)} y={y(limits[0]) - u(16)} fill={palette.ink} fontSize={fontSize * 1.15} fontWeight={palette.strongWeight} opacity={Math.min(1, (progress - 0.85) / 0.15)}>
					{approach.label}
				</text>
			) : null}
		</g>
	);
};
