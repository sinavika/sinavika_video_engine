import {scaleLinear} from 'd3-scale';
import {line as linePath} from 'd3-shape';
import React, {useId, useMemo} from 'react';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {parseExpression} from './PlotExpression';
import {useFigureFont, useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {easeFrom} from '../../../Animations/Motion';
import {elementLook, Part, useBeatStartFor, useElementState, useParams, useTimeline} from '../VisualTimeline';
import {LabelBox, placeLabel, pointSpots, ringAround, segmentSpots, textWidth} from '../FigureLabel';

type Plot = Extract<CourseVisual, {kind: 'plot'}>;

const SAMPLES = 240;

/**
 * A drawn path that grows from its start as `progress` goes from 0 to 1 (the layout guard reads how far:
 * `data-layout-drawn`). Its `opacity` goes into the style with the hiding of an undrawn path: an inline style beats
 * the attribute, and a graph's curves stayed fully drawn before their beat and never faded out of focus (KPSS VAT 8,
 * the supply curve showed while only demand was named).
 */
export const Growing: React.FC<React.SVGProps<SVGPathElement> & {progress: number}> = ({progress, style, opacity, ...props}) => (
	<path fill="none" strokeLinecap="round" strokeLinejoin="round" {...props} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} data-layout-drawn={progress} style={{...style, opacity: progress <= 0 ? 0 : Number(opacity ?? 1)}} />
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
	const fontSize = u(26);
	// A series whose values have names (months, solutions) is labelled point by point, not with round numbers: a line
	// series of twelve months showed 0, Şub, Nis … and lost every other month (Soru revizyonu, 1 Nov 2026).
	const labelled = visual.series ? visual.series.kind === 'bars' || visual.series.values.some((value) => value.label) : false;
	const seriesLabels = labelled && visual.series ? visual.series.values.map((value) => value.label ?? formatNumber(value.x)) : [];
	const tickSlot = labelled && visual.series ? seriesSlot(visual.series.values.map((value) => value.x), visual.x, width - u(112)) : Infinity;
	const tickLayout = seriesTickLayout(seriesLabels, tickSlot, fontSize, textWidth);
	// An app still's smallest text (0 in a lesson). Names too wide for their slot shrink in a lesson; in a still they
	// would go under it, so they stand upright instead: 21 census years under their bars shrank to 16 units and were
	// raised into one another (2 Nov 2026).
	const floor = useFigureFont()(0);
	const upright = floor > 0 && labelled && tickLayout.fontSize < floor;
	const uprightFont = Math.max(floor, fontSize * 0.85);
	const uprightLength = upright ? Math.max(0, ...seriesLabels.map((label) => textWidth(label, uprightFont))) : 0;
	const tickLines = Math.max(1, ...tickLayout.lines.map((lines) => lines.length));
	const tickExtra = upright ? Math.max(0, uprightLength - u(26)) : (tickLines - 1) * tickLayout.fontSize * 1.1;
	const clampY = (value: number) => Math.max(visual.y[0] - (visual.y[1] - visual.y[0]), Math.min(visual.y[1] + (visual.y[1] - visual.y[0]), value));
	const names = Object.keys(visual.parameters);
	const evaluators = useMemo(() => visual.curves.map((curve) => parseExpression(curve.expression, ['x', ...names])), [visual.curves, names.join()]);
	// The axes' names go where no curve ever passes: every shape the curves take in the card (each beat's coefficients
	// and the way between) is looked at once, so a name never jumps while a curve moves. Without a free place inside
	// the box a name stands outside it, at the end of its axis: "fiyat", "pH", "yaş" and "x" were crossed by their
	// own curves in 51 frames of the curriculum (KPSS VAT 8, 2 Nov 2026), and nothing warned.
	const timeline = useTimeline();
	const shapes = useMemo(() => plotShapes(visual, evaluators, parameterStates(visual.parameters, timeline?.beats ?? [])), [visual, evaluators, timeline]);
	const labelFont = fontSize * 1.1;
	const nameSize = (text: string | undefined) => (text ? {width: textWidth(text, labelFont), height: fontSize * 1.1} : undefined);
	const basePad = {left: u(84), right: u(28), top: u(28), bottom: (barAxisName ? u(112) : u(70)) + tickExtra};
	const nameBelow = u(52) + tickExtra;
	const pixelsIn = (box: ReturnType<typeof plotArea>) => {
		const sx = scaleLinear().domain(visual.x).range([box.left, box.right]);
		const sy = scaleLinear().domain(visual.y).range([box.bottom, box.top]);
		return {sx, sy, lines: shapes.map(([px, py]) => [sx(px), sy(py)] as [number, number])};
	};
	const planNames = (box: ReturnType<typeof plotArea>, forceOutside?: {x?: boolean; y?: boolean}) => {
		const {sx, sy, lines} = pixelsIn(box);
		const originX = visual.axes === 'edge' ? box.left : Math.min(Math.max(sx(0), box.left), box.right);
		const originY = visual.axes === 'edge' ? box.bottom : Math.min(Math.max(sy(0), box.top), box.bottom);
		return axisNamePlaces({area: box, axisX: originX, axisY: originY, yName: nameSize(visual.yLabel), xName: barAxisName ? undefined : nameSize(visual.xLabel), lines, gap: u(14), below: nameBelow, forceOutside});
	};
	// The coefficients' values (a = 1) stand in a corner no shape of the curves ever crosses: top left (after the y
	// axis's name), top right, bottom left, bottom right; when the curves sweep all four, as the arms of y = ax² do for
	// a = 3, 0.5 and −1 (AYT Matematik, Parabol), they go above the box. Sized for the widest values of the card.
	const parameterFont = fontSize * 1.2;
	const showsParameters = visual.showParameters && names.length > 0;
	const parameterWidth = showsParameters ? Math.max(...parameterStates(visual.parameters, timeline?.beats ?? []).map((state) => textWidth(names.map((name) => `${name} = ${formatNumber(state[name])}`).join('   '), parameterFont))) : 0;
	const planParameters = (box: ReturnType<typeof plotArea>, plan: ReturnType<typeof planNames>, mode: 'auto' | 'inside' | 'outside'): {at: LabelBox; outside: boolean} => {
		const at = (left: number, baseline: number): LabelBox => [left, baseline - parameterFont, left + parameterWidth, baseline + parameterFont * 0.25];
		const yInside = plan.y && !plan.y.outside ? plan.y.box : undefined;
		const topLeft = yInside && yInside[0] < box.left + u(26) + parameterWidth && yInside[2] > box.left ? yInside[2] + u(18) : box.left + u(14);
		const corners = [at(topLeft, box.top + u(36)), at(box.right - u(14) - parameterWidth, box.top + u(36)), at(box.left + u(14), box.bottom - u(22)), at(box.right - u(14) - parameterWidth, box.bottom - u(22))];
		const free = mode === 'outside' ? undefined : firstClearBox(corners, pixelsIn(box).lines, [...(plan.y ? [plan.y.box] : []), ...(plan.x ? [plan.x.box] : [])], [box.left, box.top, box.right, box.bottom]);
		if (free || mode === 'inside') return {at: free ?? corners[0], outside: false};
		// Above the box at its left, after the y axis's name when that stands up there too.
		const yAbove = plan.y?.outside ? plan.y.box : undefined;
		const left = yAbove && yAbove[0] < box.left + u(14) + parameterWidth + u(24) ? yAbove[2] + u(24) : box.left + u(14);
		return {at: at(left, box.top - u(12)), outside: true};
	};
	const firstBox = plotArea(visual, width, height, basePad);
	const firstPlan = planNames(firstBox);
	const outside = {y: firstPlan.y?.outside ?? false, x: firstPlan.x?.outside ?? false};
	const parametersAbove = showsParameters && planParameters(firstBox, firstPlan, 'auto').outside;
	const band = Math.max(outside.y ? fontSize * 1.1 + u(10) : 0, parametersAbove ? parameterFont * 1.25 + u(12) : 0);
	const area = plotArea(visual, width, height, {...basePad, top: basePad.top + band, bottom: basePad.bottom + (outside.x ? fontSize * 1.1 + u(14) : 0)});
	const namePlan = planNames(area, outside);
	const parameterPlan = showsParameters ? planParameters(area, namePlan, parametersAbove ? 'outside' : 'inside') : undefined;
	const x = scaleLinear().domain(visual.x).range([area.left, area.right]);
	const y = scaleLinear().domain(visual.y).range([area.bottom, area.top]);
	const axes = useReveal(delaySeconds, 0.5);
	const colours = [palette.lesson, palette.brand, palette.ink];
	// The pieces of one function share its colour.
	const tones = curveTones(visual.curves);
	const curveColours = tones.map((tone) => colours[tone % colours.length]);
	const drawnBy = delaySeconds + 0.4 + visual.curves.length * 1.2;
	const params = useParams(visual.parameters, {delaySeconds: drawnBy + 0.4, seconds: 3.5});
	const valueOf = (curve: number, at: number) => evaluators[curve]({...params, x: at});
	const startParams = startValues(visual.parameters);
	const traceShown = traceOpacity(params, visual.parameters);
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
	const toPath = (data: [number, number][]) =>
		linePath<[number, number]>()
			.defined((point) => Number.isFinite(point[1]))
			.x((point) => x(point[0]))
			.y((point) => y(point[1]))(data);
	const curves = curveData.map(toPath);
	// A traced curve as first drawn, with its coefficients' starting values.
	const traceData = visual.curves.map((curve, index) => {
		if (!curve.trace) return undefined;
		const [from, to] = spanOf(index);
		return Array.from({length: SAMPLES + 1}, (_, step) => {
			const xValue = from + ((to - from) * step) / SAMPLES;
			const yValue = evaluators[index]({...startParams, x: xValue});
			return [xValue, Number.isFinite(yValue) ? clampY(yValue) : NaN] as [number, number];
		});
	});
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
	const parameterText = visual.showParameters ? names.map((name) => `${name} = ${formatNumber(params[name])}`).join('   ') : '';
	// With equal scale both axes step by the same round number, at least a label's width apart.
	const unit = x(1) - x(0);
	const equalStep = visual.equalScale ? ([1, 2, 5, 10, 20, 50, 100].find((step) => step * unit >= u(48)) ?? 100) : 0;
	// The x axis numbers its whole numbers one by one where each has room: d3's round steps skipped every other one past
	// about seven units (x from −1 to 8 read 0, 2, 4, 6, 8; Soru revizyonu, AYT limit). The y axis keeps round steps.
	const ticks = (scale: typeof x, domain: [number, number]) =>
		equalStep ? steppedTicks(domain, equalStep) : ((scale === x ? unitTicks(domain, Math.abs(scale(1) - scale(0)), (tick) => textWidth(formatNumber(tick), fontSize) + u(18)) : undefined) ?? scale.ticks(width > u(900) ? 8 : 5));
	// Bars and named values are labelled one by one; a function's axis gets round numbers.
	const xTicks = labelled && visual.series ? visual.series.values.map((value) => value.x) : ticks(x, visual.x);
	const tickText = (tick: number): string[] => {
		const index = labelled && visual.series ? visual.series.values.findIndex((value) => value.x === tick) : -1;
		return index >= 0 ? tickLayout.lines[index] : [formatNumber(tick)];
	};
	const tickFont = upright ? uprightFont : labelled ? tickLayout.fontSize : fontSize;
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
	const valueFont = Math.max(floor, fontSize * 0.85);
	const valuesUpright = floor > 0 && series?.kind === 'bars' && series.showValues && series.values.some((value) => textWidth(value.y.toLocaleString('tr-TR'), valueFont) > ((area.right - area.left) / series.values.length) * 0.95);

	// Labels of points and segments go where they cover no curve, line, dot or other label.
	const curvePixels = [...curveData, ...traceData.filter((data) => data !== undefined)].flatMap((data) => data.filter((point, index) => index % 2 === 0 && Number.isFinite(point[1])).map(([px, py]) => [x(px), y(py)] as [number, number]));
	const obstacles: [number, number][] = [
		...curvePixels,
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
	const yBox = namePlan.y && !namePlan.y.outside ? namePlan.y.box : undefined;
	const parameterAt = parameterText ? parameterPlan?.at : undefined;
	// The area's value: just above the x axis in the middle, or where no curve runs through it (AYT Matematik, İntegral:
	// x(x − 2)(x − 4) crosses the axis at the middle of [0, 4], right through "alan 8").
	const areaLabel = (() => {
		if (!visual.area) return undefined;
		const shaded = visual.area;
		const value = (at: number) => valueOf(shaded.curve, at);
		const {count, total} = stripsOf(shaded, value, params);
		if (!shaded.label && count === 0) return undefined;
		const text = shaded.label ?? `${count} şerit ≈ ${formatNumber(total)}`;
		const size = u(28);
		const heights = Array.from({length: 61}, (_, index) => value(shaded.from + ((shaded.to - shaded.from) * index) / 60)).filter(Number.isFinite).map((height) => y(clampY(height)));
		const centre = x((shaded.from + shaded.to) / 2);
		const [, baseline] = areaLabelSpot(centre, zeroY, Math.min(zeroY, ...heights), Math.max(zeroY, ...heights), {width: textWidth(text, size), height: size}, curvePixels, area, u(18));
		const width = textWidth(text, size);
		return {text, size, x: centre, y: baseline, box: [centre - width / 2, baseline - size, centre + width / 2, baseline + size * 0.25] as LabelBox};
	})();
	const fixedText: LabelBox[] = [
		...(namePlan.y ? [namePlan.y.box] : []),
		// The x axis's name at the right end of the axis: curve names in the bottom right corner sat on it (FIZ 4).
		...(namePlan.x ? [namePlan.x.box] : []),
		...(parameterAt ? [parameterAt] : []),
		// The legend keeps off the area's value too: "alan 8" stood right under the curve's name (AYT Matematik, İntegral).
		...(areaLabel ? [areaLabel.box] : []),
	];
	// The top left corner starts after the y axis's name, so the names do not sit on it (FIZ 2, m-V graph).
	const topLeft = yBox ? Math.max(area.left + inset, yBox[2] + u(18)) : area.left + inset;
	const inside =
		legendWidth > 0
			? placeLabel(
					[
						[area.right - inset - legendWidth, area.top + inset, area.right - inset, area.top + inset + legendHeight],
						[topLeft, area.top + inset, topLeft + legendWidth, area.top + inset + legendHeight],
						[area.right - inset - legendWidth, area.bottom - inset - legendHeight, area.right - inset, area.bottom - inset],
						[area.left + inset, area.bottom - inset - legendHeight, area.left + inset + legendWidth, area.bottom - inset],
						[(area.left + area.right - legendWidth) / 2, area.top + inset, (area.left + area.right + legendWidth) / 2, area.top + inset + legendHeight],
					],
					obstacles,
					fixedText,
					[area.left, area.top, area.right, area.bottom],
				)
			: undefined;
	// In an app still a legend with no free place inside goes under the graph, below its numbers and the x axis's name:
	// "düzenleyen" sat on "deniz suyunun tuzu (mM)" in the bottom right corner (2 Nov 2026).
	const crowded = (box: LabelBox) => fixedText.some((other) => other[0] < box[2] && other[2] > box[0] && other[1] < box[3] && other[3] > box[1]) || obstacles.some(([px, py]) => px > box[0] && px < box[2] && py > box[1] && py < box[3]);
	const under = Math.max(area.bottom + u(52) + tickExtra, namePlan.x ? namePlan.x.box[3] + u(4) : 0, visual.xLabel && barAxisName ? area.bottom + u(100) + tickExtra : 0) + u(16);
	const legend: LabelBox | undefined = inside && floor > 0 && crowded(inside) ? [area.right - inset - legendWidth, under, area.right - inset, under + legendHeight] : inside;
	// The numbers on the axes count as taken too: a point's name may stand just outside the box, and A(4, −2) at the
	// bottom edge was written over the 2 and the 4 under the axis (AYT Geometri, Çemberin Analitiği).
	const tickTexts: LabelBox[] = [
		...xTicks.map((tick): LabelBox => {
			const lines = tickText(tick);
			const half = Math.max(...lines.map((line) => textWidth(line, tickFont))) / 2;
			return [x(tick) - half, area.bottom + u(40) - tickFont, x(tick) + half, area.bottom + u(40) + tickFont * (0.2 + 1.1 * (lines.length - 1))];
		}),
		...ticks(y, visual.y).map((tick): LabelBox => [area.left - u(14) - textWidth(formatNumber(tick), fontSize), y(tick) - fontSize * 0.65, area.left - u(14), y(tick) + fontSize * 0.35]),
	];
	const taken: LabelBox[] = [...fixedText, ...tickTexts, ...(legend ? [legend] : [])];
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
						{upright ? (
							<text x={x(tick)} y={area.bottom + u(14)} transform={`rotate(-90 ${x(tick)} ${area.bottom + u(14)})`} fill={palette.muted} fontSize={tickFont} textAnchor="end" dominantBaseline="middle">
								{tickText(tick).join(' ')}
							</text>
						) : (
							<text x={x(tick)} y={area.bottom + u(40)} fill={palette.muted} fontSize={tickFont} textAnchor="middle">
								{tickText(tick).map((line, row) => (
									<tspan key={row} x={x(tick)} dy={row === 0 ? 0 : tickFont * 1.1}>
										{line}
									</tspan>
								))}
							</text>
						)}
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
				{visual.xLabel && barAxisName ? <text x={(area.left + area.right) / 2} y={area.bottom + u(88) + tickExtra} fill={palette.ink} fontSize={fontSize * 1.1} fontWeight={palette.strongWeight} textAnchor="middle">{visual.xLabel}</text> : null}
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
											// In an app still a value wider than its bar's room stands upright on the bar: "13,6" and "16,2"
											// over 21 narrow bars ran into each other once the still raised them.
											valuesUpright ? (
												<text x={x(value.x)} y={Math.min(top, zeroY) - u(8)} transform={`rotate(-90 ${x(value.x)} ${Math.min(top, zeroY) - u(8)})`} fill={look.scale > 1 ? palette.brand : palette.ink} fontSize={valueFont} fontWeight={palette.strongWeight} textAnchor="start" dominantBaseline="middle">
													{value.y.toLocaleString('tr-TR')}
												</text>
											) : (
												<text x={x(value.x)} y={Math.min(top, zeroY) - u(10)} fill={look.scale > 1 ? palette.brand : palette.ink} fontSize={fontSize * (look.scale > 1 ? 1.05 : 0.85)} fontWeight={palette.strongWeight} textAnchor="middle">
													{value.y.toLocaleString('tr-TR')}
												</text>
											)
										) : null}
									</g>
								)}
							</Part>
						);
					})
				: null}
			{series?.kind === 'line' ? (
				<Growing
					data-layout-stroke
					progress={seriesProgress}
					d={linePath<{x: number; y: number}>().x((value) => x(value.x)).y((value) => y(value.y))(series.values) ?? ''}
					stroke={visual.curves.length > 0 ? colours[(Math.max(...tones) + 1) % colours.length] : palette.lesson}
					strokeWidth={u(8)}
				/>
			) : null}
			<clipPath id={clipId}>
				<rect x={area.left} y={area.top} width={area.right - area.left} height={area.bottom - area.top} />
			</clipPath>
			<g clipPath={`url(#${clipId})`}>
				{visual.regions.map((region, index) => (
					<PlotRegion key={`z${index}`} id={`z${index + 1}`} region={region} valueOf={valueOf} x={x} y={y} yRange={visual.y} top={area.top} bottom={area.bottom} progress={axes} fontSize={labelFont} />
				))}
				{visual.area ? <AreaUnder area={visual.area} valueOf={(at) => valueOf(visual.area!.curve, at)} params={params} x={x} y={y} zeroY={zeroY} progress={extras * areaLook.opacity} emphasis={areaLook.scale} /> : null}
				{traceData.map((data, index) =>
					data && traceShown > 0 ? (
						<path key={`trace${index}`} data-layout-stroke d={toPath(data) ?? ''} fill="none" stroke={curveColours[index]} strokeWidth={u(5)} strokeDasharray={`${u(14)} ${u(12)}`} strokeLinecap="round" opacity={0.5 * traceShown * curveLooks[index].opacity} />
					) : null,
				)}
				{curves.map((d, index) => (
					<Growing key={index} data-layout-stroke progress={curveProgress[index]} d={d ?? ''} stroke={curveColours[index]} strokeWidth={u(8) * curveLooks[index].scale} opacity={curveLooks[index].opacity} />
				))}
				{visual.tangent ? <Tangent tangent={visual.tangent} valueOf={(at) => valueOf(visual.tangent!.curve, at)} params={params} x={x} y={y} width={width} area={area} lines={curvePixels} progress={extras * tangentLook.opacity} emphasis={tangentLook.scale} fontSize={fontSize} /> : null}
			</g>
			{visual.approach && approachProgress > 0.001 ? (
				<Approach approach={visual.approach} sideValue={sideValue} span={visual.x[1] - visual.x[0]} progress={approachProgress} look={approachLook} x={x} y={y} axisX={axisX} axisY={axisY} top={area.top} bottom={area.bottom} colours={curveColours} fontSize={fontSize} />
			) : null}
			{/* The ends of the pieces go on top, where the running points of a limit end. */}
			{visual.curves.map((curve, index) =>
				curve.domain
					? curve.ends.map((end, side) => {
							if (end === 'none') return null;
							const at = curve.domain![side];
							const value = sideValue(index, at, side === 0 ? 1 : -1);
							if (!Number.isFinite(value) || at < visual.x[0] || at > visual.x[1]) return null;
							return <circle key={`end${index}${side}`} cx={x(at)} cy={y(value)} r={u(11)} fill={end === 'closed' ? curveColours[index] : palette.surface} stroke={curveColours[index]} strokeWidth={u(5)} opacity={curveProgress[index] >= 0.98 ? curveLooks[index].opacity : 0} />;
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
							stroke={curveColours[index]}
							strokeWidth={u(6)}
							strokeLinecap="round"
						/>
						<text x={legend ? legend[2] : area.right - inset} y={(legend ? legend[1] : area.top + inset) + u(26) + index * u(40)} fill={palette.ink} fontSize={legendFont} fontWeight={palette.strongWeight} textAnchor="end" stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
							{curve.label}
						</text>
					</g>
				) : null,
			)}
			{namePlan.y && visual.yLabel ? (
				<text x={namePlan.y.box[0]} y={namePlan.y.box[1] + fontSize} fill={palette.ink} fontSize={labelFont} fontWeight={palette.strongWeight} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke" opacity={axes}>
					{visual.yLabel}
				</text>
			) : null}
			{namePlan.x && visual.xLabel ? (
				<text x={namePlan.x.box[2]} y={namePlan.x.box[1] + fontSize} fill={palette.ink} fontSize={labelFont} fontWeight={palette.strongWeight} textAnchor="end" stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke" opacity={axes}>
					{visual.xLabel}
				</text>
			) : null}
			{parameterText && parameterAt ? (
				<text x={parameterAt[0]} y={parameterAt[3] - parameterFont * 0.25} fill={palette.lesson} fontSize={parameterFont} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke" opacity={axes}>
					{parameterText}
				</text>
			) : null}
			{/* The area's value over the curves, with a halo. */}
			{areaLabel ? (
				<text x={areaLabel.x} y={areaLabel.y} fill={palette.ink} fontSize={areaLabel.size} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke" opacity={extras * areaLook.opacity}>
					{areaLabel.text}
				</text>
			) : null}
			{visual.points.map((point, index) => (
				<PlotPoint key={`p${index}`} id={`p${index + 1}`} label={point.label} labelAt={pointLabels[index]} at={[x(point.x), y(point.y)]} open={point.style === 'open'} progress={pointsProgress} fontSize={labelFont} />
			))}
		</svg>
	);
};

/**
 * Every set of coefficient values a card shows: the start, the end of a sweep, each beat's values in turn, and half
 * way between each two (a curve sweeps across the places between its shapes).
 */
export const parameterStates = (parameters: Plot['parameters'], beats: readonly {params?: Partial<Record<string, number>>}[]): Record<string, number>[] => {
	const start = startValues(parameters);
	const steps: Record<string, number>[] = [start];
	const ends = Object.fromEntries(Object.entries(parameters).flatMap(([name, range]) => (range?.to === undefined ? [] : [[name, range.to]])));
	if (Object.keys(ends).length > 0) steps.push({...start, ...ends});
	let current = start;
	for (const beat of beats) {
		const moved = Object.entries(beat.params ?? {}).filter((entry): entry is [string, number] => entry[0] in start && entry[1] !== undefined);
		if (moved.length === 0) continue;
		current = {...current, ...Object.fromEntries(moved)};
		steps.push(current);
	}
	const between = steps.slice(1).map((step, index) => Object.fromEntries(Object.keys(step).map((name) => [name, (step[name] + steps[index][name]) / 2])));
	return [...steps, ...between];
};

/**
 * The places, in the graph's own units, where something is drawn: each curve in each of its shapes, a measured
 * line, the bars' edges, helper segments and points. The axes' names keep clear of them.
 */
export const plotShapes = (visual: Plot, evaluators: readonly ((scope: Record<string, number>) => number)[], states: readonly Record<string, number>[]): [number, number][] => {
	const points: [number, number][] = [];
	const span = visual.y[1] - visual.y[0];
	const along = (from: readonly [number, number], to: readonly [number, number], steps: number) => {
		for (let step = 0; step <= steps; step++) points.push([from[0] + ((to[0] - from[0]) * step) / steps, from[1] + ((to[1] - from[1]) * step) / steps]);
	};
	for (const state of states) {
		evaluators.forEach((evaluate, curve) => {
			const domain = visual.curves[curve].domain;
			const [from, to] = domain ? [Math.max(visual.x[0], domain[0]), Math.min(visual.x[1], domain[1])] : visual.x;
			for (let index = 0; index <= SAMPLES; index++) {
				const at = from + ((to - from) * index) / SAMPLES;
				const value = evaluate({...state, x: at});
				if (Number.isFinite(value)) points.push([at, Math.max(visual.y[0] - span, Math.min(visual.y[1] + span, value))]);
			}
		});
	}
	const values = visual.series?.values ?? [];
	if (visual.series?.kind === 'line') values.slice(1).forEach((value, index) => along([values[index].x, values[index].y], [value.x, value.y], 16));
	if (visual.series?.kind === 'bars') {
		const half = ((visual.x[1] - visual.x[0]) / values.length) * 0.31;
		for (const value of values) {
			along([value.x - half, 0], [value.x - half, value.y], 12);
			along([value.x - half, value.y], [value.x + half, value.y], 12);
			along([value.x + half, value.y], [value.x + half, 0], 12);
		}
	}
	for (const segment of visual.segments) along(segment.from, segment.to, 24);
	for (const point of visual.points) points.push([point.x, point.y]);
	return points;
};

type NameSize = {width: number; height: number};
/** Where an axis's name stands: its box, and whether that is outside the axes' box, at the end of the axis. */
type AxisNamePlace = {box: LabelBox; outside: boolean};

/**
 * Where the axes' names go. Inside the box first: the y axis's name right of the axis at its top (or left of it,
 * when the axis runs through the middle), the x axis's name above the axis at its right end (or below it). The first
 * place no drawn line passes through wins; without one the name goes outside: the y name above the axis's top, the
 * x name under the axis's numbers at the right. `forceOutside` keeps a first look's choice once room is made for it.
 */
export const axisNamePlaces = ({area, axisX, axisY, yName, xName, lines, gap, below, forceOutside}: {
	area: {left: number; right: number; top: number; bottom: number};
	axisX: number;
	axisY: number;
	yName?: NameSize;
	xName?: NameSize;
	lines: readonly (readonly [number, number])[];
	gap: number;
	/** How far under the box the x axis's numbers end. */
	below: number;
	forceOutside?: {x?: boolean; y?: boolean};
}): {y?: AxisNamePlace; x?: AxisNamePlace} => {
	const margin = 4;
	const struck = (box: LabelBox) => lines.some(([px, py]) => px > box[0] - margin && px < box[2] + margin && py > box[1] - margin && py < box[3] + margin);
	const pick = (inside: LabelBox[], outside: LabelBox, forced: boolean | undefined): AxisNamePlace => {
		const free = forced ? undefined : inside.find((box) => !struck(box));
		return free ? {box: free, outside: false} : {box: outside, outside: true};
	};
	const places: {y?: AxisNamePlace; x?: AxisNamePlace} = {};
	if (yName) {
		const inside: LabelBox[] = [[axisX + gap, area.top, axisX + gap + yName.width, area.top + yName.height]];
		if (axisX - gap - yName.width >= area.left) inside.push([axisX - gap - yName.width, area.top, axisX - gap, area.top + yName.height]);
		places.y = pick(inside, [axisX + gap * 0.5, area.top - gap * 0.7 - yName.height, axisX + gap * 0.5 + yName.width, area.top - gap * 0.7], forceOutside?.y);
	}
	if (xName) {
		const inside: LabelBox[] = [[area.right - xName.width, axisY - gap - xName.height, area.right, axisY - gap]];
		if (axisY + gap + xName.height <= area.bottom) inside.push([area.right - xName.width, axisY + gap * 0.6, area.right, axisY + gap * 0.6 + xName.height]);
		places.x = pick(inside, [area.right - xName.width, area.bottom + below, area.right, area.bottom + below + xName.height], forceOutside?.x);
	}
	return places;
};

/** The coefficients' values before any beat moves them. */
export const startValues = (parameters: Plot['parameters']): Record<string, number> =>
	Object.fromEntries(Object.entries(parameters).flatMap(([name, range]) => (range ? [[name, range.from]] : [])));

/**
 * How strongly a traced curve's first shape shows (0 to 1): nothing while the coefficients are where they started,
 * fully once any of them has moved a tenth of its own size (at least 0.1), so the old curve fades in as the new one
 * slides away.
 */
export const traceOpacity = (params: Record<string, number>, parameters: Plot['parameters']): number => {
	let shown = 0;
	for (const [name, range] of Object.entries(parameters)) {
		if (!range || params[name] === undefined) continue;
		const scale = Math.max(0.1, Math.abs(range.from) * 0.1, range.to === undefined ? 0 : Math.abs(range.to - range.from) * 0.1);
		shown = Math.max(shown, Math.min(1, Math.abs(params[name] - range.from) / scale));
	}
	return shown;
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

/**
 * How much of the axis each named value has, in pixels: the closest two values' distance (all of it for one value).
 * `drawn`: the axis's length.
 */
export const seriesSlot = (xs: readonly number[], domain: readonly [number, number], drawn: number): number => {
	const sorted = [...xs].sort((a, b) => a - b);
	const gap = sorted.slice(1).reduce((least, value, index) => Math.min(least, value - sorted[index]), Infinity);
	return Number.isFinite(gap) ? (gap / (domain[1] - domain[0])) * drawn : drawn;
};

/**
 * The names under a labelled series: one line each, or two, split at a space, when a name is wider than its share of
 * the axis; all at one size, made smaller (to 60 %) when even then the widest does not fit. Five "Çözelti S1" … ran
 * into each other (Soru revizyonu, 1 Nov 2026).
 */
export const seriesTickLayout = (labels: readonly string[], slot: number, fontSize: number, measure: (text: string, size: number) => number): {lines: string[][]; fontSize: number} => {
	const room = slot * 0.92;
	const lines = labels.map((label) => {
		const words = label.split(' ');
		if (measure(label, fontSize) <= room || words.length < 2) return [label];
		let best = [label];
		let widest = Infinity;
		for (let cut = 1; cut < words.length; cut++) {
			const halves = [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
			const width = Math.max(...halves.map((half) => measure(half, fontSize)));
			if (width < widest) [best, widest] = [halves, width];
		}
		return best;
	});
	const widest = Math.max(0, ...lines.flat().map((line) => measure(line, fontSize)));
	return {lines, fontSize: widest > room ? Math.max(fontSize * 0.6, (fontSize * room) / widest) : fontSize};
};

/** Each curve's colour number: a piece continues the function before it, every other curve takes the next colour. */
export const curveTones = (curves: readonly {piece?: boolean}[]): number[] => {
	let tone = -1;
	return curves.map((curve, index) => (curve.piece && index > 0 ? tone : ++tone));
};

/**
 * Ticks at every whole number of a short range, when a unit is `pixelsPerUnit` long and that leaves room for each
 * number (`room` of it); undefined when it does not (the round steps of d3 are used then).
 */
export const unitTicks = ([from, to]: [number, number], pixelsPerUnit: number, room: (tick: number) => number): number[] | undefined => {
	if (to - from > 16 || Math.ceil(from) > Math.floor(to)) return undefined;
	const ticks = steppedTicks([from, to], 1);
	return ticks.every((tick) => room(tick) <= pixelsPerUnit) ? ticks : undefined;
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

const PlotPoint: React.FC<{id: string; label?: string; labelAt?: LabelBox; at: [number, number]; open?: boolean; progress: number; fontSize: number}> = ({id, label, labelAt, at, open = false, progress, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	return (
		<g opacity={progress * look.opacity}>
			{open ? (
				<circle cx={at[0]} cy={at[1]} r={u(12) * look.scale} fill={palette.surface} stroke={palette.brand} strokeWidth={u(5)} />
			) : (
				<circle cx={at[0]} cy={at[1]} r={u(12) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
			)}
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

type Box = {left: number; top: number; right: number; bottom: number};

/**
 * Where the slope's value is written (its text's start and baseline): off the tangent, below right of a rising one or
 * above left of it, above right of a falling one or below left, whichever lies inside the axes' box; else the first,
 * pulled inside. At a point near the x axis the value was written under the axis, cut off by the box and over its
 * numbers (AYT Fizik, Faraday yasası).
 */
export const slopeLabelSpot = (point: readonly [number, number], slope: number, text: {width: number; size: number}, area: Box, unit: number, lines: readonly (readonly [number, number])[] = []): [number, number] => {
	const [px, py] = point;
	const margin = 6 * unit;
	const [minX, maxX, minY, maxY] = [area.left + margin, area.right - margin - text.width, area.top + margin + text.size * 0.8, area.bottom - margin - text.size * 0.25];
	const [right, left, centred] = [px + 20 * unit, px - 20 * unit - text.width, px - text.width / 2];
	const above = (step: number) => py - (26 + 44 * step) * unit;
	const below = (step: number) => py + (46 + 44 * step) * unit;
	// Off the line first, then the other two sides, then farther out and straight above or below: in a corner, beside
	// a gently rising tangent, the near place above lies on the line itself (AYT Fizik, Faraday: "eğim = 0,25" at
	// t = 0.5); at the top of x³ − 3x the curve falls away through the place below right (AYT Matematik, Türev).
	const sides = (step: number): [number, number][] =>
		slope > 0 ? [[right, below(step)], [left, above(step)], [right, above(step)], [left, below(step)]] : [[right, above(step)], [left, below(step)], [right, below(step)], [left, above(step)]];
	const spots: [number, number][] = [...sides(0), ...sides(1), [centred, above(1)], [centred, below(1)], ...sides(2), [centred, above(2)], [centred, below(2)]];
	const inside = ([lx, ly]: [number, number]) => lx >= minX && lx <= maxX && ly >= minY && ly <= maxY;
	const fit = ([lx, ly]: [number, number]): [number, number] => [Math.min(Math.max(lx, minX), maxX), Math.min(Math.max(ly, minY), maxY)];
	const crossings = ([lx, ly]: [number, number]) => lines.filter(([qx, qy]) => qx > lx - 4 && qx < lx + text.width + 4 && qy > ly - text.size * 0.8 - 4 && qy < ly + text.size * 0.25 + 4).length;
	// A place as it is, then one pulled inside the box; with none free, the one fewest lines cross.
	const fitted = spots.map(fit);
	return spots.find((spot) => inside(spot) && crossings(spot) === 0) ?? fitted.find((spot) => crossings(spot) === 0) ?? fitted.reduce((best, spot) => (crossings(spot) < crossings(best) ? spot : best));
};

/** The tangent at a point of a curve that may slide along it: the point, the line, and its slope (the derivative there). */
const Tangent: React.FC<{tangent: NonNullable<Plot['tangent']>; valueOf: (at: number) => number; params: Record<string, number>; x: Scale; y: Scale; width: number; area: Box; lines: readonly (readonly [number, number])[]; progress: number; emphasis: number; fontSize: number}> = ({tangent, valueOf, params, x, y, width, area, lines, progress, emphasis, fontSize}) => {
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
	const label = `eğim = ${formatNumber(slope)}`;
	const labelSize = fontSize * 1.15;
	const [lx, ly] = slopeLabelSpot([px, py], slope, {width: textWidth(label, labelSize), size: labelSize}, area, u(1), [...lines, ...sampleLine([px - ux, py - uy], [px + ux, py + uy], u(8)), ...ringAround([px, py], u(16))]);
	return (
		<g opacity={progress}>
			<line x1={px - ux} y1={py - uy} x2={px + ux} y2={py + uy} stroke={palette.brand} strokeWidth={u(6) * emphasis} strokeLinecap="round" />
			<circle cx={px} cy={py} r={u(13) * emphasis} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
			{/* Ink with a halo: brand orange is never a text colour (FIZ 20). */}
			{tangent.slope ? (
				<text x={lx} y={ly} fill={palette.ink} fontSize={labelSize} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
					{label}
				</text>
			) : null}
		</g>
	);
};

/** How many strips an area is cut into now, and their total (a left Riemann sum). */
const stripsOf = (area: NonNullable<Plot['area']>, valueOf: (at: number) => number, params: Record<string, number>): {count: number; total: number} => {
	const count = area.rectangles === undefined ? 0 : Math.max(1, Math.round(typeof area.rectangles === 'number' ? area.rectangles : (params[area.rectangles] ?? 1)));
	const width = area.to - area.from;
	let total = 0;
	for (let index = 0; index < count; index++) {
		const value = valueOf(area.from + (width * index) / count);
		total += (Number.isFinite(value) ? value : 0) * (width / count);
	}
	return {count, total};
};

/**
 * Where the area's value is written (its centre and baseline): just above the x axis, just under it, above the
 * region's highest point or under its lowest, whichever stays in the box with no curve through it; else the first.
 */
export const areaLabelSpot = (centre: number, zeroY: number, highest: number, lowest: number, text: {width: number; height: number}, lines: readonly (readonly [number, number])[], box: Box, gap: number): [number, number] => {
	const baselines = [zeroY - gap, zeroY + gap + text.height, highest - gap, lowest + gap + text.height];
	const clear = (baseline: number) => {
		const [left, top, right, bottom] = [centre - text.width / 2, baseline - text.height, centre + text.width / 2, baseline + text.height * 0.25];
		if (left < box.left || right > box.right || top < box.top || bottom > box.bottom) return false;
		return !lines.some(([px, py]) => px > left - 4 && px < right + 4 && py > top - 4 && py < bottom + 4);
	};
	return [centre, baselines.find(clear) ?? baselines[0]];
};

/** The first box no drawn line crosses, that covers no taken box and stays inside `bounds`; undefined when none does. */
export const firstClearBox = (boxes: readonly LabelBox[], lines: readonly (readonly [number, number])[], taken: readonly LabelBox[], bounds: LabelBox): LabelBox | undefined =>
	boxes.find(
		([left, top, right, bottom]) =>
			left >= bounds[0] &&
			top >= bounds[1] &&
			right <= bounds[2] &&
			bottom <= bounds[3] &&
			!taken.some((other) => other[0] < right && other[2] > left && other[1] < bottom && other[3] > top) &&
			!lines.some(([px, py]) => px > left - 4 && px < right + 4 && py > top - 4 && py < bottom + 4),
	);

/** The area under a curve: a filled region, or strips (left Riemann sums) whose total approaches it as they get thinner. */
const AreaUnder: React.FC<{area: NonNullable<Plot['area']>; valueOf: (at: number) => number; params: Record<string, number>; x: Scale; y: Scale; zeroY: number; progress: number; emphasis: number}> = ({area, valueOf, params, x, y, zeroY, progress, emphasis}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const {count} = stripsOf(area, valueOf, params);
	const width = area.to - area.from;
	const strips = Array.from({length: count}, (_, index) => {
		const left = area.from + (width * index) / count;
		const value = valueOf(left);
		const top = y(Number.isFinite(value) ? value : 0);
		return <rect key={index} x={x(left)} y={Math.min(top, zeroY)} width={Math.max(0, x(left + width / count) - x(left))} height={Math.abs(zeroY - top)} fill={withAlpha(palette.lesson, 0.28)} stroke={palette.lesson} strokeWidth={u(2)} />;
	});
	const samples = Array.from({length: 121}, (_, index) => area.from + (width * index) / 120);
	const outline = `M${x(area.from)} ${zeroY} ${samples.map((at) => `L${x(at)} ${y(valueOf(at))}`).join(' ')} L${x(area.to)} ${zeroY} Z`;
	return (
		<g opacity={progress}>
			{count === 0 ? <path d={outline} fill={withAlpha(palette.lesson, 0.22 * emphasis)} /> : strips}
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

/**
 * The outline of a shaded region in the plot's own units: the strip between two curves, between a curve and the
 * x axis, or (neither) the whole height of the y range. Points are [x, y]; a curve's undefined values are left out.
 */
export const regionOutline = (region: NonNullable<Plot['regions']>[number], valueOf: (curve: number, at: number) => number, yRange: readonly [number, number], samples = 60): [number, number][] => {
	const xs = Array.from({length: samples + 1}, (_, index) => region.from + ((region.to - region.from) * index) / samples);
	const along = (curve: number) => xs.map((at): [number, number] => [at, valueOf(curve, at)]).filter(([, value]) => Number.isFinite(value));
	if (region.between) return [...along(region.between[0]), ...along(region.between[1]).reverse()];
	if (region.curve !== undefined) return [[region.from, 0], ...along(region.curve), [region.to, 0]];
	return [
		[region.from, yRange[0]],
		[region.from, yRange[1]],
		[region.to, yRange[1]],
		[region.to, yRange[0]],
	];
};

/** A shaded region (z1, z2…): it fills in as it comes, its edges dashed, its name over it; lit while pointed at. */
const PlotRegion: React.FC<{id: string; region: NonNullable<Plot['regions']>[number]; valueOf: (curve: number, at: number) => number; x: Scale; y: Scale; yRange: readonly [number, number]; top: number; bottom: number; progress: number; fontSize: number}> = ({id, region, valueOf, x, y, yRange, top, bottom, progress, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const shown = progress * look.appear;
	if (shown <= 0.001) return null;
	const [domainBottom, domainTop] = yRange;
	const outline = regionOutline(region, valueOf, [domainBottom, domainTop]);
	const d = outline.length ? `M${outline.map(([px, py]) => `${x(px)} ${y(Math.max(domainBottom, Math.min(domainTop, py)))}`).join(' L')} Z` : '';
	const strong = look.scale > 1.01;
	return (
		<g opacity={look.opacity / Math.max(0.001, look.appear) * shown} data-plot-region={id}>
			<path d={d} fill={withAlpha(palette.brand, strong ? 0.3 : 0.18)} stroke="none" />
			{[region.from, region.to].map((at, index) => (
				<line key={index} x1={x(at)} x2={x(at)} y1={top} y2={bottom} stroke={palette.brand} strokeWidth={u(3)} strokeDasharray={`${u(10)} ${u(10)}`} opacity={0.7} />
			))}
			{region.label ? (
				<text x={(x(region.from) + x(region.to)) / 2} y={top + fontSize * 1.3} fill={palette.brand} fontSize={fontSize} fontWeight={palette.strongWeight} textAnchor="middle" stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
					{region.label}
				</text>
			) : null}
		</g>
	);
};
