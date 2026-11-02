import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, Part, useBeatStartFor, useElementState, useShownAt} from '../VisualTimeline';
import {figureText, lineSamples, placeLabel, pointSpots, textWidth, type LabelBox} from './FigureLabel';
import {Growing} from './Plot';
import {areaCentre, blendShape} from './Similarity';

type Geometry = Extract<CourseVisual, {kind: 'geometry'}>;
type Angle = Geometry['angles'][number];

/** The name beats use for an angle: its own id, or `angle-<corner>` shared by every angle at that corner. */
export const anglePartId = (angle: Pick<Angle, 'at' | 'id'>): string => angle.id ?? `angle-${angle.at}`;

/** The marks of an axis from `min` to `max` every `step`, without 0 (the origin is named once, by the axes). */
export const axisTicks = (min: number, max: number, step: number): number[] => {
	const ticks: number[] = [];
	for (let value = Math.ceil(min / step - 1e-9) * step; value <= max + 1e-9; value += step) {
		const rounded = Math.round(value * 1e6) / 1e6;
		if (Math.abs(rounded) > 1e-9) ticks.push(rounded);
	}
	return ticks;
};

/** How long a point takes to slide to its `moveTo`. */
const SLIDE_SECONDS = 1.8;

/**
 * Where a point stands when its slide is `progress` (0→1) done: on the straight way from `at` to `moveTo`, or, given
 * the `centre` it slides round, along the circle (the short way round), so a point on a circle stays on it.
 */
export const slidePosition = (
	point: {at: readonly [number, number] | number[]; moveTo?: readonly [number, number] | number[]},
	progress: number,
	centre?: readonly [number, number] | number[],
): [number, number] => {
	const [x, y] = point.at;
	if (!point.moveTo || progress <= 0) return [x, y];
	const [tx, ty] = point.moveTo;
	if (!centre) return [x + (tx - x) * progress, y + (ty - y) * progress];
	const [cx, cy] = centre;
	const from = Math.atan2(y - cy, x - cx);
	const angle = from + turnBetween(from, Math.atan2(ty - cy, tx - cx)) * progress;
	const radius = Math.hypot(x - cx, y - cy) + (Math.hypot(tx - cx, ty - cy) - Math.hypot(x - cx, y - cy)) * progress;
	return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
};

/**
 * How far each point's slide has gone: 0 until a beat shows `move-<id>`, then easing to 1 over SLIDE_SECONDS. A point
 * without `moveTo`, or a figure without beats (a question's figure), stays where it is. One hook per point, in the
 * figure's fixed order.
 */
const usePointSlides = (points: readonly {id: string; moveTo?: unknown}[]): number[] => {
	const seconds = useSceneSeconds();
	return points.map((point) => {
		// A hook in a loop: the points of a figure are the same on every frame, so the order never changes. The slide
		// waits for its beat even when the first beat opens with the card.
		const start = useBeatStartFor(`move-${point.id}`, 'show');
		return point.moveTo === undefined || start === undefined ? 0 : easeFrom(seconds, start, SLIDE_SECONDS);
	});
};

/** How long a copied angle takes to slide from its source to its place. */
const COPY_SECONDS = 1.6;

/**
 * A circle on screen (y down) as a path: the whole circle, or with `arc` the part from one direction to the other in
 * the figure's degrees (0 = right, counter-clockwise, y up), drawn counter-clockwise as the figure sees it.
 */
export const circlePath = ([cx, cy]: [number, number], radius: number, arc?: [number, number]): string => {
	if (!arc) return `M${cx + radius} ${cy} a${radius} ${radius} 0 1 0 ${-2 * radius} 0 a${radius} ${radius} 0 1 0 ${2 * radius} 0`;
	const sweep = ((((arc[1] - arc[0]) % 360) + 360) % 360) || 360;
	const point = (degrees: number) => [cx + radius * Math.cos((degrees * Math.PI) / 180), cy - radius * Math.sin((degrees * Math.PI) / 180)];
	const [x1, y1] = point(arc[0]);
	if (sweep >= 360) return circlePath([cx, cy], radius);
	const [x2, y2] = point(arc[0] + sweep);
	return `M${x1} ${y1} A${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 0 ${x2} ${y2}`;
};

/** The region a filled circle covers: the whole disc, or with `arc` the sector between the centre and the arc. */
export const sectorPath = ([cx, cy]: [number, number], radius: number, arc?: [number, number]): string =>
	arc ? `M${cx} ${cy} L${circlePath([cx, cy], radius, arc).slice(1)} Z` : `${circlePath([cx, cy], radius)} Z`;

/**
 * Where a circle's label goes: outside the middle of its arc, or at the upper right of a whole circle; with its text's
 * `size`, far enough that the text's nearest corner keeps `gap` from the circle ("r = 2" touched a small circle).
 */
export const circleLabelAt = ([cx, cy]: [number, number], radius: number, gap: number, arc?: [number, number], size?: {width: number; height: number}): [number, number] => {
	const middle = ((arc ? arc[0] + (((((arc[1] - arc[0]) % 360) + 360) % 360) || 360) / 2 : 45) * Math.PI) / 180;
	const reach = radius + gap + (size ? (Math.abs(Math.cos(middle)) * size.width) / 2 + (Math.abs(Math.sin(middle)) * size.height) / 2 : 0);
	return [cx + reach * Math.cos(middle), cy - reach * Math.sin(middle)];
};

/**
 * How far a point's letter stands from it when circles are drawn round the point: off its usual `distance` when a
 * circle's line would run through the letter, inside the circle when there is room, else outside it. The O₂ of a small
 * circle sat on the circle (Soru revizyonu, 2 Nov 2026).
 */
export const letterDistance = (distance: number, rings: readonly number[], fontSize: number): number => {
	let at = distance;
	for (const ring of [...rings].sort((a, b) => a - b)) {
		if (Math.abs(ring - at) >= fontSize * 0.8) continue;
		at = ring - fontSize * 0.85 >= fontSize * 0.7 ? ring - fontSize * 0.85 : ring + fontSize * 0.85;
	}
	return at;
};

/** An angle on screen: its corner, the direction its arc starts at and its size, always turning the positive way. */
type Sector = {corner: [number, number]; start: number; size: number};

const turnBetween = (from: number, to: number): number => {
	let delta = to - from;
	while (delta <= -Math.PI) delta += 2 * Math.PI;
	while (delta > Math.PI) delta -= 2 * Math.PI;
	return delta;
};

export const sectorOf = (corner: [number, number], from: [number, number], to: [number, number]): Sector => {
	const a = Math.atan2(from[1] - corner[1], from[0] - corner[0]);
	const delta = turnBetween(a, Math.atan2(to[1] - corner[1], to[0] - corner[0]));
	return delta >= 0 ? {corner, start: a, size: delta} : {corner, start: a + delta, size: -delta};
};

/**
 * Partway (`t` 0→1) from one sector to another: the corner slides straight across and the arc turns the short way
 * round, so an angle carried along a parallel (corresponding angles) only slides, and an alternate angle turns over.
 */
export const blendSector = (source: Sector, target: Sector, t: number): Sector => ({
	corner: [source.corner[0] + (target.corner[0] - source.corner[0]) * t, source.corner[1] + (target.corner[1] - source.corner[1]) * t],
	start: source.start + turnBetween(source.start, target.start) * t,
	size: source.size + (target.size - source.size) * t,
});

/** A sector as a filled slice of `radius`, and its arc alone. */
export const wedgePath = ({corner: [cx, cy], start, size}: Sector, radius: number, slice = true): string => {
	const x1 = cx + radius * Math.cos(start);
	const y1 = cy + radius * Math.sin(start);
	const x2 = cx + radius * Math.cos(start + size);
	const y2 = cy + radius * Math.sin(start + size);
	const arcPart = `A${radius} ${radius} 0 ${size > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
	return slice ? `M${cx} ${cy} L${x1} ${y1} ${arcPart} Z` : `M${x1} ${y1} ${arcPart}`;
};

/** Where a point that rides with a sector (an angle's label) stands when the sector has moved partway. */
export const rideAlong = (point: [number, number], from: Sector, to: Sector, landing: [number, number], t: number): [number, number] => {
	const now = blendSector(from, to, t);
	const polar = (spot: [number, number], sector: Sector) => ({distance: Math.hypot(spot[0] - sector.corner[0], spot[1] - sector.corner[1]), turn: turnBetween(sector.start, Math.atan2(spot[1] - sector.corner[1], spot[0] - sector.corner[0]))});
	const one = polar(point, from);
	const two = polar(landing, to);
	const distance = one.distance + (two.distance - one.distance) * t;
	const direction = now.start + one.turn + turnBetween(one.turn, two.turn) * t;
	return [now.corner[0] + Math.cos(direction) * distance, now.corner[1] + Math.sin(direction) * distance];
};

/**
 * The arc marking an angle, always the smaller one between the two rays. `gap` (pixels) is left free at both
 * ends, so the arcs of two angles that share a ray stay two arcs instead of joining into one.
 */
const angleArc = (center: [number, number], from: [number, number], to: [number, number], radius: number, gap = 0): string => {
	const a1 = Math.atan2(from[1] - center[1], from[0] - center[0]);
	const a2 = Math.atan2(to[1] - center[1], to[0] - center[0]);
	let delta = a2 - a1;
	while (delta <= -Math.PI) delta += 2 * Math.PI;
	while (delta > Math.PI) delta -= 2 * Math.PI;
	const trim = Math.min(gap / radius, Math.abs(delta) / 4) * Math.sign(delta);
	const start = [center[0] + radius * Math.cos(a1 + trim), center[1] + radius * Math.sin(a1 + trim)];
	const end = [center[0] + radius * Math.cos(a1 + delta - trim), center[1] + radius * Math.sin(a1 + delta - trim)];
	return `M${start[0]} ${start[1]} A${radius} ${radius} 0 0 ${delta > 0 ? 1 : 0} ${end[0]} ${end[1]}`;
};

/**
 * The equal-length marks across a side: `count` short strokes at `share` of its length (the middle by default),
 * perpendicular to it, `spacing` apart along it. Sides with the same number of marks are equal, as in a textbook figure.
 */
export const tickMarks = (from: [number, number], to: [number, number], count: number, size: number, spacing: number, share = 0.5): string => {
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
	const along = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
	const across = [-along[1] * size, along[0] * size];
	const middle = [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
	return Array.from({length: count}, (_, index) => {
		const shift = (index - (count - 1) / 2) * spacing;
		const x = middle[0] + along[0] * shift;
		const y = middle[1] + along[1] * shift;
		return `M${x - across[0]} ${y - across[1]} L${x + across[0]} ${y + across[1]}`;
	}).join(' ');
};

/**
 * Where along each marked side its ticks go. The middle, unless the marks of an earlier side are closer than
 * `clearance` there (two equal sides meeting at a narrow angle, |BD| = |BC| at a 20° corner): then the marks slide
 * along the side to the first clear place. Unmarked sides get 0.5.
 */
export const tickShares = (sides: {from: [number, number]; to: [number, number]; ticks: number}[], clearance: number): number[] => {
	const placed: [number, number][] = [];
	return sides.map(({from, to, ticks}) => {
		if (ticks === 0) return 0.5;
		const spot = (share: number): [number, number] => [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
		const share = [0.5, 0.64, 0.36, 0.76, 0.24].find((candidate) => placed.every((other) => Math.hypot(other[0] - spot(candidate)[0], other[1] - spot(candidate)[1]) >= clearance)) ?? 0.5;
		placed.push(spot(share));
		return share;
	});
};

/**
 * The middle of the widest free gap between `blocked` directions (radians, any range) and its width. A point's
 * letter goes there, away from the sides and arcs around the point.
 */
export const widestGap = (blocked: number[]): {gap: number; middle: number} => {
	const sorted = blocked.map((angle) => ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)).sort((a, b) => a - b);
	let best = {gap: -1, middle: 0};
	sorted.forEach((angle, index) => {
		const next = index + 1 < sorted.length ? sorted[index + 1] : sorted[0] + 2 * Math.PI;
		if (next - angle > best.gap) best = {gap: next - angle, middle: angle + (next - angle) / 2};
	});
	return best;
};

/**
 * One box for every angle label, in order: each takes the first of its spots that overlaps no label placed before it
 * (nor `taken`, e.g. side lengths) and covers no obstacle: the points, and the sides as points along them. The first spot is the label's usual place on the bisector, so
 * a figure whose labels were already clear keeps them where they were; only a crowded one (50° at a narrow apex right
 * over the x of the corner below it, KPSS Geometri 1, 1 Nov 2026) moves the later label out along its bisector.
 */
export const placeAngleLabels = (spots: (LabelBox[] | undefined)[], obstacles: [number, number][] | ((index: number) => [number, number][]), taken: LabelBox[], bounds: LabelBox): (LabelBox | undefined)[] => {
	const placed = [...taken];
	return spots.map((options, index) => {
		if (!options || options.length === 0) return undefined;
		const box = placeLabel(options, typeof obstacles === 'function' ? obstacles(index) : obstacles, placed, bounds);
		placed.push(box);
		return box;
	});
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
	// Arcs, rings and letters follow the figure's size: in a small figure (a question's figure in the solution
	// panel) full-size arcs and letters would crowd a narrow corner and run into each other.
	const small = Math.min(1, Math.min(width, height) / u(620));
	const fontSize = u(34) * Math.max(0.78, small);
	const arc = u(54) * Math.max(0.6, small);
	const ringStep = arc * 0.48;
	// The space between the arcs of an equal-angle mark (two or three arcs); three still fit inside one ring.
	const arcGap = ringStep * 0.36;
	// Letters stand about one letter outside their points; the figure keeps that much room on every side so a
	// point on the edge of the view does not lose its letter, and no more, so a small figure is not shrunk further.
	const margin = fontSize * 1.9;
	const scale = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const offsetX = (width - (maxX - minX) * scale) / 2;
	const offsetY = (height - (maxY - minY) * scale) / 2;
	const toScreen = ([px, py]: [number, number]): [number, number] => [offsetX + (px - minX) * scale, offsetY + (maxY - py) * scale];
	const slides = usePointSlides(visual.points);
	const centreOf = (id?: string) => visual.points.find((point) => point.id === id)?.at;
	const byId = new Map(visual.points.map((point, index) => [point.id, toScreen(slidePosition(point, slides[index], centreOf(point.moveAbout)))]));
	const at = (id: string): [number, number] => byId.get(id) ?? [0, 0];
	const shapes = useReveal(delaySeconds, 0.6);
	// Sides are drawn one after another, 0.25 s apart, but a large figure (a proof drawn twice, 18 sides) is all drawn
	// within about 2.4 s instead of taking five.
	const sideStep = Math.min(0.25, 2.4 / Math.max(1, visual.segments.length));
	const labels = useReveal(delaySeconds + 0.4 + visual.segments.length * sideStep, 0.4);
	const centre: [number, number] = [width / 2, height / 2];
	// Where the axes' numbers stand (FigureAxes draws them), so the points' names keep off them.
	const axisNumberSpots: {at: [number, number]; halfWidth: number}[] = [];
	if (visual.axes?.numbers) {
		const numberSize = fontSize * 0.7;
		const [vx0, vy0, vx1, vy1] = visual.view;
		const [ox, oy] = toScreen([Math.min(Math.max(0, vx0), vx1), Math.min(Math.max(0, vy0), vy1)]);
		if (vy0 <= 0 && vy1 >= 0) for (const value of axisTicks(vx0, vx1, visual.axes.step)) axisNumberSpots.push({at: [toScreen([value, 0])[0], oy + u(10) + numberSize * 0.65], halfWidth: textWidth(String(value), numberSize) / 2});
		if (vx0 <= 0 && vx1 >= 0) for (const value of axisTicks(vy0, vy1, visual.axes.step)) axisNumberSpots.push({at: [ox - u(16) - textWidth(String(value), numberSize) / 2, toScreen([0, value])[1]], halfWidth: textWidth(String(value), numberSize) / 2});
	}
	// Neighbouring regions in three strengths of the lesson colour; 1 is the usual light fill.
	const shadeFill = (shade: number) => (shade === 1 ? palette.fill : withAlpha(palette.lesson, shade === 2 ? 0.16 : 0.26));
	const segmentLabels = visual.segments.map((segment) => (segment.label ? segmentLabelAt(segment) : undefined));
	const tickAt = tickShares(visual.segments.map((segment) => ({from: at(segment.from), to: at(segment.to), ticks: segment.ticks})), u(64));
	const boxAround = ([cx, cy]: [number, number], boxWidth: number, boxHeight: number): LabelBox => [cx - boxWidth / 2, cy - boxHeight / 2, cx + boxWidth / 2, cy + boxHeight / 2];
	// What an angle's label keeps off: the points, and every side but the angle's own (a narrow angle's label sits
	// between its own sides, touching them is fine; crossing another side is not).
	const pointObstacles = visual.points.filter((point) => !point.hidden).map((point) => at(point.id));
	const sideSamples = visual.segments.map((segment) => lineSamples(at(segment.from), at(segment.to), fontSize * 0.35));
	const throughCorner = (segment: Geometry['segments'][number], corner: string): boolean => {
		if (segment.from === corner || segment.to === corner) return true;
		const [ax, ay] = at(segment.from);
		const [bx, by] = at(segment.to);
		const [px, py] = at(corner);
		const length = Math.hypot(bx - ax, by - ay) || 1;
		return Math.abs((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / length < u(3);
	};
	const angleLabelBoxes = placeAngleLabels(
		visual.angles.map((angle, index) => (angle.label && !angle.right ? angleLabelSpots(angle, index) : undefined)),
		(index) => [...pointObstacles, ...visual.segments.flatMap((segment, side) => (throughCorner(segment, visual.angles[index].at) ? [] : sideSamples[side]))],
		segmentLabels.flatMap((labelAt, index) => (labelAt ? [boxAround(labelAt, textWidth(visual.segments[index].label ?? '', fontSize * 0.94), fontSize * 0.94)] : [])),
		[0, 0, width, height],
	);
	// Long names (A(3, 2), "II. bölge" beside it) are placed as boxes, like a plot's: the first spot round the point
	// that covers no point, side or axis and overlaps no other text. A letter keeps the direction rule below.
	const longNameBoxes = new Map<string, LabelBox>();
	{
		const taken: LabelBox[] = [
			...angleLabelBoxes.filter((box): box is LabelBox => box !== undefined),
			...segmentLabels.flatMap((labelAt, index) => (labelAt ? [boxAround(labelAt, textWidth(visual.segments[index].label ?? '', fontSize * 0.94), fontSize * 0.94)] : [])),
			...axisNumberSpots.map(({at: [cx, cy], halfWidth}): LabelBox => [cx - halfWidth, cy - fontSize * 0.4, cx + halfWidth, cy + fontSize * 0.4]),
			...visual.points.filter((point) => point.caption && point.label).map((point) => boxAround(at(point.id), textWidth(figureText(point.label ?? ''), fontSize), fontSize)),
		];
		const [vx0, vy0, vx1, vy1] = visual.view;
		const axisLines = visual.axes
			? [...(vy0 <= 0 && vy1 >= 0 ? lineSamples(toScreen([vx0, 0]), toScreen([vx1, 0]), fontSize * 0.35) : []), ...(vx0 <= 0 && vx1 >= 0 ? lineSamples(toScreen([0, vy0]), toScreen([0, vy1]), fontSize * 0.35) : [])]
			: [];
		for (const point of visual.points) {
			const text = figureText(point.label ?? point.id);
			if (point.hidden || point.caption || point.label === '' || text.length < 3) continue;
			const obstacles = [...pointObstacles, ...sideSamples.flat(), ...axisLines];
			const box = placeLabel(pointSpots(at(point.id), textWidth(text, fontSize), fontSize, fontSize * 0.45), obstacles, taken, [0, 0, width, height]);
			longNameBoxes.set(point.id, box);
			taken.push(box);
		}
	}

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{visual.axes ? <FigureAxes view={visual.view} axes={visual.axes} toScreen={toScreen} fontSize={fontSize * 0.7} opacity={shapes} /> : null}
			{visual.polygons.map((polygon, index) => {
				const id = polygon.id ?? polygon.points.join('');
				const source = polygon.copyOf === undefined ? undefined : visual.polygons.find((other) => other !== polygon && other.id === polygon.copyOf);
				const fill = polygon.fill ? shadeFill(polygon.shade) : 'none';
				const label = polygon.label ? <PolygonLabel corners={polygon.points.map(at)} text={polygon.label} fontSize={fontSize * 0.9} /> : null;
				if (source)
					return <ShapeCopy key={`poly${index}`} id={id} from={source.points.map(at)} to={polygon.points.map(at)} fill={fill} label={polygon.label} fontSize={fontSize * 0.9} fallbackStart={delaySeconds + 1.2 + visual.segments.length * sideStep} />;
				return (
					<Part key={`poly${index}`} id={id}>
						{(look) => (
							<g opacity={shapes * look.opacity}>
								<polygon points={polygon.points.map((corner) => at(corner).join(',')).join(' ')} fill={polygon.fill && look.scale > 1 ? withAlpha(palette.lesson, 0.32) : fill} />
								{label}
							</g>
						)}
					</Part>
				);
			})}
			{visual.circles.map((circle, index) => (
				<CircleMark key={`c${index}`} id={circle.id ?? `circle-${circle.center}`} center={at(circle.center)} radius={circle.radius * scale} arc={circle.arc} dashed={circle.dashed} fill={circle.fill ? shadeFill(circle.shade) : undefined} label={circle.label} fontSize={fontSize * 0.9} drawn={shapes} />
			))}
			{visual.segments.map((segment, index) => (
				<SegmentLine key={`s${index}`} id={`${segment.from}${segment.to}`} from={at(segment.from)} to={at(segment.to)} label={segment.label} labelAt={segmentLabels[index]} fontSize={fontSize * 0.94} dashed={segment.dashed} ticks={segment.ticks} tickShare={tickAt[index]} delaySeconds={delaySeconds + 0.3 + index * sideStep} />
			))}
			{visual.angles.map((angle, index) => {
				const sourceIndex = angle.copyOf === undefined ? -1 : visual.angles.findIndex((other) => other.id === angle.copyOf);
				if (sourceIndex >= 0) {
					const source = visual.angles[sourceIndex];
					return (
						<AngleCopy
							key={`a${index}`}
							id={anglePartId(angle)}
							from={sectorOf(at(source.at), at(source.from), at(source.to))}
							to={sectorOf(at(angle.at), at(angle.from), at(angle.to))}
							radius={arc + ringOf(index) * ringStep}
							label={angle.label}
							labelFrom={angleLabelAt(source, sourceIndex)}
							labelTo={angleLabelAt(angle, index)}
							fontSize={fontSize * 0.9}
							fallbackStart={delaySeconds + 1.2 + visual.segments.length * sideStep}
						>
							{angleMark(angle, index)}
						</AngleCopy>
					);
				}
				return (
					<Part key={`a${index}`} id={anglePartId(angle)}>
						{(look) => <g opacity={look.opacity}>{angleMark(angle, index)}</g>}
					</Part>
				);
			})}
			{visual.points.map((point) => {
				if (point.hidden) return null;
				const [px, py] = at(point.id);
				const away = labelDirection(point.id, [px, py]);
				// A corner with marked angles keeps its letter outside the arcs.
				const rings = visual.angles.map((angle, index) => (angle.at === point.id && !angle.right ? ringOf(index) * ringStep + (angle.arcs - 1) * arcGap : -1)).filter((ring) => ring >= 0);
				// A caption stands on its point; a corner's letter is pushed off it (captions of one row pushed off the
				// figure's middle in different directions sat at different heights, KPSS Geometri 2, 1 Nov 2026).
				const usual = point.caption ? 0 : rings.length > 0 ? arc + Math.max(...rings) + fontSize * 0.9 : fontSize * 1.12;
				const centred = visual.circles.filter((circle) => circle.center === point.id).map((circle) => circle.radius * scale);
				const distance = point.caption ? 0 : letterDistance(usual, centred, fontSize);
				return (
					<Part key={point.id} id={point.id}>
						{(look) => (
							<g opacity={labels * look.opacity}>
								{point.dot && !point.caption ? <circle cx={px} cy={py} r={u(9) * look.scale} fill={look.scale > 1 ? palette.lesson : palette.ink} /> : null}
								{point.label !== '' ? (
									<text
										x={longNameBoxes.has(point.id) ? ((longNameBoxes.get(point.id) as LabelBox)[0] + (longNameBoxes.get(point.id) as LabelBox)[2]) / 2 : px + Math.cos(away) * distance}
										y={longNameBoxes.has(point.id) ? (longNameBoxes.get(point.id) as LabelBox)[3] - fontSize * 0.2 : py + Math.sin(away) * distance + fontSize * 0.35}
										fill={palette.ink}
										fontSize={fontSize * (1 + (look.scale - 1) * 0.5)}
										fontWeight={800}
										textAnchor="middle"
									>
										{figureText(point.label ?? point.id)}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
		</svg>
	);

	/**
	 * Where a point's letter goes: into the widest gap between the sides that meet at the point (or pass through
	 * it) and the angles marked there, so the letter never sits on a line or an angle arc. A point with nothing
	 * around it keeps the letter on the side away from the figure's middle.
	 */
	function labelDirection(id: string, [px, py]: [number, number]): number {
		// Hard: the sides at the point and what stands near it. Soft: the marked sectors at the point.
		const hard: number[] = [];
		const soft: number[] = [];
		const towards = ([tx, ty]: [number, number]) => Math.atan2(ty - py, tx - px);
		for (const segment of visual.segments) {
			const [ax, ay] = at(segment.from);
			const [bx, by] = at(segment.to);
			if (segment.from === id) hard.push(towards([bx, by]));
			else if (segment.to === id) hard.push(towards([ax, ay]));
			else {
				// A point in the middle of a side: both directions along it are taken.
				const length = Math.hypot(bx - ax, by - ay) || 1;
				const cross = Math.abs((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / length;
				const along = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (length * length);
				if (cross < u(3) && along > 0.02 && along < 0.98) hard.push(towards([ax, ay]), towards([bx, by]));
			}
		}
		for (const angle of visual.angles) {
			if (angle.at !== id) continue;
			const a = towards(at(angle.from));
			let delta = towards(at(angle.to)) - a;
			while (delta <= -Math.PI) delta += 2 * Math.PI;
			while (delta > Math.PI) delta -= 2 * Math.PI;
			// The whole marked sector is taken, sampled every 15 degrees.
			for (let step = 0; step <= 1; step += 1 / Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 12)))) soft.push(a + delta * step);
		}
		// What another corner puts nearby: its angle label (the 60° of an arrowhead's tip sits right above the
		// inner point) and the point itself. Each takes the directions its width covers.
		const reach = fontSize * 2.6;
		const near = (target: [number, number], halfWidth: number, into: number[]) => {
			const distance = Math.hypot(target[0] - px, target[1] - py);
			if (distance < 1 || distance > reach + halfWidth) return;
			const middle = towards(target);
			const spread = Math.atan(halfWidth / distance);
			into.push(middle - spread, middle, middle + spread);
		};
		visual.angles.forEach((angle, index) => {
			if (angle.at !== id && angle.label) near(angleLabelAt(angle, index), fontSize * 0.9 * angle.label.length * 0.3, hard);
		});
		// Another point blocks about a letter's width; a caption blocks its whole text ("II. bölge" beside B(−2, 3)).
		for (const other of visual.points)
			if (other.id !== id && !other.hidden) near(at(other.id), other.caption ? textWidth(figureText(other.label ?? ''), fontSize) / 2 + fontSize * 0.3 : fontSize * 0.4, hard);
		// On an analytic figure the axes and their numbers are taken too: a point on the x axis keeps its name off the
		// axis, and P(0, 4) does not sit on the y axis's numbers.
		if (visual.axes) {
			const [px0, py0] = visual.points.find((point) => point.id === id)?.at ?? [NaN, NaN];
			if (Math.abs(py0) < 1e-9) hard.push(0, Math.PI);
			if (Math.abs(px0) < 1e-9) hard.push(Math.PI / 2, -Math.PI / 2);
			for (const spot of axisNumberSpots) near(spot.at, spot.halfWidth, hard);
		}
		segmentLabels.forEach((labelAt, index) => {
			if (labelAt) near(labelAt, fontSize * 0.94 * (visual.segments[index].label ?? '').length * 0.3, hard);
		});
		// A circle through the point takes the directions along it there.
		for (const circle of visual.circles) {
			const centre = at(circle.center);
			if (Math.abs(Math.hypot(px - centre[0], py - centre[1]) - circle.radius * scale) > u(3)) continue;
			const outward = towards(centre) + Math.PI;
			hard.push(outward + Math.PI / 2, outward - Math.PI / 2);
		}
		if (hard.length + soft.length === 0) return Math.atan2(py - centre[1], px - centre[0]);
		const best = widestGap([...hard, ...soft]);
		if (soft.length === 0 || best.gap >= Math.PI / 6) return best.middle;
		// Marked angles all round the point (two crossing lines, every angle marked): no sector is free, and the letter
		// fell on a line (the O of KPSS Geometri 1, 1 Nov 2026). It keeps off the lines and its own angles' labels instead.
		const own: number[] = [];
		visual.angles.forEach((angle, index) => {
			if (angle.at === id && angle.label && !angle.right) near(angleLabelAt(angle, index), fontSize * 0.9 * angle.label.length * 0.3 + fontSize * 0.3, own);
		});
		return widestGap([...hard, ...own]).middle;
	}

	/**
	 * Where a side's length label goes: on the outer side of the side, at its middle, or slid along it when a point
	 * stands there (|BC| = 10 written over the foot H of a perpendicular). The letters then keep clear of the label.
	 */
	function segmentLabelAt(segment: Geometry['segments'][number]): [number, number] {
		const from = at(segment.from);
		const to = at(segment.to);
		const normal = [-(to[1] - from[1]), to[0] - from[0]];
		const length = Math.hypot(normal[0], normal[1]) || 1;
		// A long label ("hipotenüs") beside a slanted side needs more room than one letter: the text box's half width
		// and half height, measured along the side's normal, plus a gap.
		const halfWidth = (segment.label ?? '').length * fontSize * 0.27;
		const offset = Math.max(fontSize * 1.05, fontSize * 0.4 + halfWidth * Math.abs(normal[0] / length) + fontSize * 0.36 * Math.abs(normal[1] / length));
		const points = visual.points.filter((point) => !point.hidden).map((point) => at(point.id));
		let best: {at: [number, number]; clear: number} | undefined;
		for (const share of [0.5, 0.38, 0.62, 0.28, 0.72]) {
			const mid = [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
			const outward = (mid[0] - centre[0]) * normal[0] + (mid[1] - centre[1]) * normal[1] >= 0 ? 1 : -1;
			const place: [number, number] = [mid[0] + (normal[0] / length) * offset * outward, mid[1] + (normal[1] / length) * offset * outward];
			const clear = Math.min(Infinity, ...points.map((point) => Math.hypot(point[0] - place[0], point[1] - place[1])));
			if (clear >= fontSize * 1.4) return place;
			if (!best || clear > best.clear) best = {at: place, clear};
		}
		return best?.at ?? from;
	}

	/** Which ring an angle's arc is drawn on: one further out for every earlier angle at its corner that it overlaps. */
	function ringOf(index: number): number {
		const angle = visual.angles[index];
		return visual.angles.slice(0, index).filter((other) => other.at === angle.at && !other.right && sectorsOverlap(other, angle)).length;
	}

	/** Whether two angles at one corner cover a common part (not only a shared ray): one inside the other. */
	function sectorsOverlap(first: Geometry['angles'][number], second: Geometry['angles'][number]): boolean {
		const sector = (angle: Geometry['angles'][number]) => {
			const corner = at(angle.at);
			const a = Math.atan2(at(angle.from)[1] - corner[1], at(angle.from)[0] - corner[0]);
			let delta = Math.atan2(at(angle.to)[1] - corner[1], at(angle.to)[0] - corner[0]) - a;
			while (delta <= -Math.PI) delta += 2 * Math.PI;
			while (delta > Math.PI) delta -= 2 * Math.PI;
			const start = delta >= 0 ? a : a + delta;
			return {start: ((start % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), size: Math.abs(delta)};
		};
		const one = sector(first);
		const two = sector(second);
		const tolerance = Math.PI / 90;
		const inside = (angle: number, of: {start: number; size: number}) => {
			const offset = (((angle - of.start) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
			return offset > tolerance && offset < of.size - tolerance;
		};
		return inside(two.start + two.size / 2, one) || inside(one.start + one.size / 2, two) || inside(two.start + tolerance * 2, one) || inside(one.start + tolerance * 2, two);
	}

	function angleMark(angle: Geometry['angles'][number], index: number) {
		const corner = at(angle.at);
		// Several angles at one corner each get their own ring, so neighbouring arcs do not run together into one
		// long arc; the first is the usual size.
		const ring = ringOf(index);
		const radius = arc + ring * ringStep;
		if (angle.right) {
			const unit = (target: [number, number]) => {
				const dx = target[0] - corner[0];
				const dy = target[1] - corner[1];
				const length = Math.hypot(dx, dy) || 1;
				return [(dx / length) * arc * 0.67, (dy / length) * arc * 0.67];
			};
			const [ax, ay] = unit(at(angle.from));
			const [bx, by] = unit(at(angle.to));
			return <path key={`a${index}`} d={`M${corner[0] + ax} ${corner[1] + ay} L${corner[0] + ax + bx} ${corner[1] + ay + by} L${corner[0] + bx} ${corner[1] + by}`} fill="none" stroke={palette.brand} strokeWidth={u(5)} opacity={labels} />;
		}
		const [lx, ly] = angleLabelAt(angle, index);
		return (
			<g key={`a${index}`} opacity={labels}>
				{Array.from({length: angle.arcs}, (_, mark) => (
					<path key={mark} d={angleArc(corner, at(angle.from), at(angle.to), radius + mark * arcGap, u(7))} fill="none" stroke={palette.brand} strokeWidth={u(angle.arcs > 1 ? 4 : 5)} strokeLinecap="round" />
				))}
				{angle.label ? <text x={lx} y={ly + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle">{figureText(angle.label)}</text> : null}
			</g>
		);
	}

	/** The centre of an angle's label, as placed among the others. Drawing and letter placement share it. */
	function angleLabelAt(angle: Geometry['angles'][number], index: number): [number, number] {
		const box = angleLabelBoxes[index] ?? angleLabelSpots(angle, index)[0];
		return [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
	}

	/**
	 * Where an angle's label may go, best first: on the bisector just outside its arc (as always), then a little to
	 * either side inside the angle, then further out along the bisector, then a little nearer the corner.
	 */
	function angleLabelSpots(angle: Geometry['angles'][number], index: number): LabelBox[] {
		const corner = at(angle.at);
		const a = Math.atan2(at(angle.from)[1] - corner[1], at(angle.from)[0] - corner[0]);
		let delta = Math.atan2(at(angle.to)[1] - corner[1], at(angle.to)[0] - corner[0]) - a;
		while (delta <= -Math.PI) delta += 2 * Math.PI;
		while (delta > Math.PI) delta -= 2 * Math.PI;
		// A side drawn from the corner through the angle (AD inside BAC) would cut through a label on the bisector:
		// the label goes to the middle of the widest part the inner sides leave.
		const inner = visual.segments
			.flatMap((segment) => (segment.from === angle.at ? [segment.to] : segment.to === angle.at ? [segment.from] : []))
			.map((id) => {
				let offset = Math.atan2(at(id)[1] - corner[1], at(id)[0] - corner[0]) - a;
				while (offset <= -Math.PI) offset += 2 * Math.PI;
				while (offset > Math.PI) offset -= 2 * Math.PI;
				return offset / delta;
			})
			.filter((share) => share > 0.02 && share < 0.98);
		const cuts = [0, ...inner.sort((x, y) => x - y), 1];
		let part = {from: cuts[0], to: cuts[1]};
		for (let i = 2; i < cuts.length; i++) if (cuts[i] - cuts[i - 1] > part.to - part.from) part = {from: cuts[i - 1], to: cuts[i]};
		const middle = a + delta * ((part.from + part.to) / 2);
		const opening = Math.abs(delta) * (part.to - part.from);
		// A narrow angle (25° at an arrowhead's foot) pushes its label further out until it clears both sides.
		const clear = (fontSize * 0.62) / Math.max(0.05, Math.sin(opening / 2));
		const base = (arc + ringOf(index) * ringStep) * 1.9 + (angle.arcs - 1) * arcGap;
		const radius = Math.min(Math.max(base, clear), base * 1.8);
		const boxWidth = textWidth(angle.label ?? '', fontSize * 0.9);
		const boxHeight = fontSize * 0.9;
		const spots: LabelBox[] = [];
		for (const reach of [1, 1.35, 1.7, 0.82, 2.05])
			for (const turn of [0, -0.22, 0.22]) {
				const direction = middle + turn * opening * Math.sign(delta || 1);
				spots.push(boxAround([corner[0] + Math.cos(direction) * radius * reach, corner[1] + Math.sin(direction) * radius * reach], boxWidth, boxHeight));
			}
		return spots;
	}
};

/**
 * An angle that comes over from an equal angle elsewhere (`copyOf`): when its beat shows it (or once the figure is
 * drawn), a shaded slice with the arc and the label leaves the source corner, slides and turns into place, and
 * settles into the usual mark; the shade fades as it lands. The source stays where it was: the proof copies it.
 */
const AngleCopy: React.FC<{id: string; from: Sector; to: Sector; radius: number; label?: string; labelFrom: [number, number]; labelTo: [number, number]; fontSize: number; fallbackStart: number; children: React.ReactNode}> = ({
	id,
	from,
	to,
	radius,
	label,
	labelFrom,
	labelTo,
	fontSize,
	fallbackStart,
	children,
}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const look = elementLook(useElementState(id));
	const start = useShownAt(id) ?? fallbackStart;
	if (seconds < start) return null;
	const t = easeFrom(seconds, start, COPY_SECONDS);
	if (t >= 1) {
		const shade = 1 - easeFrom(seconds, start + COPY_SECONDS, 0.8);
		return (
			<g opacity={look.opacity}>
				{shade > 0 ? <path d={wedgePath(to, radius * 1.25)} fill={withAlpha(palette.lesson, 0.3 * shade)} /> : null}
				{children}
			</g>
		);
	}
	const now = blendSector(from, to, t);
	const [lx, ly] = rideAlong(labelFrom, from, to, labelTo, t);
	return (
		<g opacity={look.opacity}>
			<path d={wedgePath(now, radius * 1.25)} fill={withAlpha(palette.lesson, 0.3)} />
			<path d={wedgePath(now, radius, false)} fill="none" stroke={palette.brand} strokeWidth={u(5)} strokeLinecap="round" />
			{label ? (
				<text x={lx} y={ly + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
					{figureText(label)}
				</text>
			) : null}
		</g>
	);
};

/** A shape's name ("S", "2S") at the centre of its area. */
const PolygonLabel: React.FC<{corners: [number, number][]; text: string; fontSize: number}> = ({corners, text, fontSize}) => {
	const palette = useVisualPalette();
	const [x, y] = areaCentre(corners);
	return (
		<text x={x} y={y + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
			{figureText(text)}
		</text>
	);
};

/**
 * A shape that comes over from a congruent or similar one (`copyOf`): when its beat shows it (or once the figure is
 * drawn), a shaded copy of the source leaves it, slides, turns and grows onto its place (Similarity.blendShape) and
 * settles as the shape; the shade fades as it lands. The source stays: the copy shows that one fits on the other.
 */
const ShapeCopy: React.FC<{id: string; from: [number, number][]; to: [number, number][]; fill: string; label?: string; fontSize: number; fallbackStart: number}> = ({id, from, to, fill, label, fontSize, fallbackStart}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const look = elementLook(useElementState(id));
	const start = useShownAt(id) ?? fallbackStart;
	if (seconds < start) return null;
	const t = easeFrom(seconds, start, COPY_SECONDS);
	const corners = t >= 1 ? to : blendShape(from, to, t);
	const shade = t >= 1 ? 1 - easeFrom(seconds, start + COPY_SECONDS, 0.8) : 1;
	const points = corners.map((corner) => corner.join(',')).join(' ');
	return (
		<g opacity={look.opacity}>
			{fill !== 'none' ? <polygon points={points} fill={fill} /> : null}
			{shade > 0 ? <polygon points={points} fill={withAlpha(palette.lesson, 0.3 * shade)} stroke={palette.brand} strokeWidth={u(5)} strokeOpacity={shade} strokeLinejoin="round" /> : null}
			{label ? <PolygonLabel corners={corners} text={label} fontSize={fontSize} /> : null}
		</g>
	);
};

/**
 * The coordinate axes of an analytic figure: the x and y axes where they cross the view, a short mark and its number
 * every `step` (0 left out), the names x and y at the ends, and a light grid when asked for. Drawn first, under all.
 */
const FigureAxes: React.FC<{view: Geometry['view']; axes: NonNullable<Geometry['axes']>; toScreen: (point: [number, number]) => [number, number]; fontSize: number; opacity: number}> = ({view, axes, toScreen, fontSize, opacity}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const [minX, minY, maxX, maxY] = view;
	const xs = axisTicks(minX, maxX, axes.step);
	const ys = axisTicks(minY, maxY, axes.step);
	const showX = minY <= 0 && maxY >= 0;
	const showY = minX <= 0 && maxX >= 0;
	const mark = u(10);
	const [ox, oy] = toScreen([Math.min(Math.max(0, minX), maxX), Math.min(Math.max(0, minY), maxY)]);
	return (
		<g opacity={opacity}>
			{axes.grid
				? [...xs.map((value) => ({from: toScreen([value, minY]), to: toScreen([value, maxY])})), ...ys.map((value) => ({from: toScreen([minX, value]), to: toScreen([maxX, value])}))].map(({from, to}, index) => (
						<line key={`g${index}`} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={palette.grid} strokeWidth={u(2)} />
					))
				: null}
			{showX ? (
				<g>
					<line x1={toScreen([minX, 0])[0]} y1={oy} x2={toScreen([maxX, 0])[0]} y2={oy} stroke={palette.axis} strokeWidth={u(4)} />
					{xs.map((value) => {
						const [sx] = toScreen([value, 0]);
						return (
							<g key={`x${value}`}>
								<line x1={sx} y1={oy - mark} x2={sx} y2={oy + mark} stroke={palette.axis} strokeWidth={u(3)} />
								{axes.numbers ? <text x={sx} y={oy + mark + fontSize} fill={palette.muted} fontSize={fontSize} textAnchor="middle">{formatAxisNumber(value)}</text> : null}
							</g>
						);
					})}
					<text x={toScreen([maxX, 0])[0] + u(12)} y={oy + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * 1.2} fontWeight={700} fontStyle="italic">x</text>
				</g>
			) : null}
			{showY ? (
				<g>
					<line x1={ox} y1={toScreen([0, minY])[1]} x2={ox} y2={toScreen([0, maxY])[1]} stroke={palette.axis} strokeWidth={u(4)} />
					{ys.map((value) => {
						const [, sy] = toScreen([0, value]);
						return (
							<g key={`y${value}`}>
								<line x1={ox - mark} y1={sy} x2={ox + mark} y2={sy} stroke={palette.axis} strokeWidth={u(3)} />
								{axes.numbers ? <text x={ox - mark - u(6)} y={sy + fontSize * 0.35} fill={palette.muted} fontSize={fontSize} textAnchor="end">{formatAxisNumber(value)}</text> : null}
							</g>
						);
					})}
					<text x={ox} y={toScreen([0, maxY])[1] - u(14)} fill={palette.ink} fontSize={fontSize * 1.2} fontWeight={700} fontStyle="italic" textAnchor="middle">y</text>
				</g>
			) : null}
		</g>
	);
};

/** An axis number as Turkish writes it: a minus sign, a decimal comma. */
const formatAxisNumber = (value: number): string => String(Math.round(value * 100) / 100).replace('-', '−').replace('.', ',');

/**
 * A circle or a compass arc. Drawn with the figure, or, when a beat shows it, traced from that beat on (0.9 s), as a
 * compass is turned; a dashed one is a construction line. Its label stands outside the arc's middle.
 */
const CircleMark: React.FC<{id: string; center: [number, number]; radius: number; arc?: [number, number]; dashed: boolean; fill?: string; label?: string; fontSize: number; drawn: number}> = ({id, center, radius, arc, dashed, fill, label, fontSize, drawn}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const look = elementLook(useElementState(id));
	const shownAt = useShownAt(id);
	const progress = shownAt === undefined ? drawn : easeFrom(seconds, shownAt, 0.9);
	const d = circlePath(center, radius, arc);
	const [lx, ly] = circleLabelAt(center, radius, fontSize * 0.35, arc, label ? {width: textWidth(figureText(label), fontSize), height: fontSize} : undefined);
	return (
		<g opacity={look.opacity}>
			{fill ? <path d={sectorPath(center, radius, arc)} fill={fill} stroke="none" opacity={progress} /> : null}
			{dashed ? (
				<path d={d} fill="none" stroke={palette.muted} strokeWidth={u(4)} strokeDasharray={`${u(14)} ${u(12)}`} opacity={progress} />
			) : (
				<Growing progress={progress} d={d} stroke={palette.lesson} strokeWidth={u(6) * look.scale} />
			)}
			{label ? (
				<text x={lx} y={ly + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={700} textAnchor="middle" opacity={progress}>
					{figureText(label)}
				</text>
			) : null}
		</g>
	);
};

const SegmentLine: React.FC<{id: string; from: [number, number]; to: [number, number]; label?: string; labelAt?: [number, number]; fontSize: number; dashed: boolean; ticks: number; tickShare: number; delaySeconds: number}> = ({id, from, to, label, labelAt, fontSize, dashed, ticks, tickShare, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	// Drawing and dimming are separate: a side that steps back fades, it does not get shorter.
	const drawn = useReveal(delaySeconds, 0.5);
	const progress = drawn * look.opacity;
	return (
		<g>
			{dashed ? (
				<path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={palette.muted} strokeWidth={u(4)} strokeDasharray={`${u(14)} ${u(12)}`} opacity={progress} />
			) : (
				<g opacity={look.opacity}>
					<Growing progress={drawn} d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={palette.lesson} strokeWidth={u(7) * look.scale} />
				</g>
			)}
			{ticks > 0 ? <path d={tickMarks(from, to, ticks, u(15) * look.scale, u(13), tickShare)} stroke={palette.ink} strokeWidth={u(5)} strokeLinecap="round" opacity={progress} /> : null}
			{label && labelAt ? <text x={labelAt[0]} y={labelAt[1] + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={700} textAnchor="middle" opacity={progress}>{figureText(label)}</text> : null}
		</g>
	);
};
