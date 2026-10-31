import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, Part, useElementState} from '../VisualTimeline';
import {Growing} from './Plot';

type Geometry = Extract<CourseVisual, {kind: 'geometry'}>;

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
	// Letters stand about one letter outside their points; the figure keeps that much room on every side so a
	// point on the edge of the view does not lose its letter, and no more, so a small figure is not shrunk further.
	const margin = fontSize * 1.9;
	const scale = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const offsetX = (width - (maxX - minX) * scale) / 2;
	const offsetY = (height - (maxY - minY) * scale) / 2;
	const toScreen = ([px, py]: [number, number]): [number, number] => [offsetX + (px - minX) * scale, offsetY + (maxY - py) * scale];
	const byId = new Map(visual.points.map((point) => [point.id, toScreen(point.at)]));
	const at = (id: string): [number, number] => byId.get(id) ?? [0, 0];
	const shapes = useReveal(delaySeconds, 0.6);
	const labels = useReveal(delaySeconds + 0.4 + visual.segments.length * 0.25, 0.4);
	const centre: [number, number] = [width / 2, height / 2];
	const segmentLabels = visual.segments.map((segment) => (segment.label ? segmentLabelAt(segment) : undefined));
	const tickAt = tickShares(visual.segments.map((segment) => ({from: at(segment.from), to: at(segment.to), ticks: segment.ticks})), u(64));

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
						{(look) => <Growing progress={shapes} opacity={look.opacity} d={`M${cx + circle.radius * scale} ${cy} a${circle.radius * scale} ${circle.radius * scale} 0 1 0 ${-2 * circle.radius * scale} 0 a${circle.radius * scale} ${circle.radius * scale} 0 1 0 ${2 * circle.radius * scale} 0`} stroke={palette.lesson} strokeWidth={u(6) * look.scale} />}
					</Part>
				);
			})}
			{visual.segments.map((segment, index) => (
				<SegmentLine key={`s${index}`} id={`${segment.from}${segment.to}`} from={at(segment.from)} to={at(segment.to)} label={segment.label} labelAt={segmentLabels[index]} fontSize={fontSize * 0.94} dashed={segment.dashed} ticks={segment.ticks} tickShare={tickAt[index]} delaySeconds={delaySeconds + 0.3 + index * 0.25} />
			))}
			{visual.angles.map((angle, index) => (
				<Part key={`a${index}`} id={`angle-${angle.at}`}>
					{(look) => <g opacity={look.opacity}>{angleMark(angle, index)}</g>}
				</Part>
			))}
			{visual.points.map((point) => {
				if (point.hidden) return null;
				const [px, py] = at(point.id);
				const away = labelDirection(point.id, [px, py]);
				// A corner with marked angles keeps its letter outside the arcs.
				const rings = visual.angles.map((angle, index) => (angle.at === point.id && !angle.right ? ringOf(index) : -1)).filter((ring) => ring >= 0);
				const distance = rings.length > 0 ? arc + ringStep * Math.max(...rings) + fontSize * 0.9 : fontSize * 1.12;
				return (
					<Part key={point.id} id={point.id}>
						{(look) => (
							<g opacity={labels * look.opacity}>
								{point.dot ? <circle cx={px} cy={py} r={u(9) * look.scale} fill={look.scale > 1 ? palette.lesson : palette.ink} /> : null}
								{point.label !== '' ? (
									<text x={px + Math.cos(away) * distance} y={py + Math.sin(away) * distance + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * (1 + (look.scale - 1) * 0.5)} fontWeight={800} textAnchor="middle">
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

	/**
	 * Where a point's letter goes: into the widest gap between the sides that meet at the point (or pass through
	 * it) and the angles marked there, so the letter never sits on a line or an angle arc. A point with nothing
	 * around it keeps the letter on the side away from the figure's middle.
	 */
	function labelDirection(id: string, [px, py]: [number, number]): number {
		const blocked: number[] = [];
		const towards = ([tx, ty]: [number, number]) => Math.atan2(ty - py, tx - px);
		for (const segment of visual.segments) {
			const [ax, ay] = at(segment.from);
			const [bx, by] = at(segment.to);
			if (segment.from === id) blocked.push(towards([bx, by]));
			else if (segment.to === id) blocked.push(towards([ax, ay]));
			else {
				// A point in the middle of a side: both directions along it are taken.
				const length = Math.hypot(bx - ax, by - ay) || 1;
				const cross = Math.abs((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / length;
				const along = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (length * length);
				if (cross < u(3) && along > 0.02 && along < 0.98) blocked.push(towards([ax, ay]), towards([bx, by]));
			}
		}
		for (const angle of visual.angles) {
			if (angle.at !== id) continue;
			const a = towards(at(angle.from));
			let delta = towards(at(angle.to)) - a;
			while (delta <= -Math.PI) delta += 2 * Math.PI;
			while (delta > Math.PI) delta -= 2 * Math.PI;
			// The whole marked sector is taken, sampled every 15 degrees.
			for (let step = 0; step <= 1; step += 1 / Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 12)))) blocked.push(a + delta * step);
		}
		// What another corner puts nearby: its angle label (the 60° of an arrowhead's tip sits right above the
		// inner point) and the point itself. Each takes the directions its width covers.
		const reach = fontSize * 2.6;
		const near = (target: [number, number], halfWidth: number) => {
			const distance = Math.hypot(target[0] - px, target[1] - py);
			if (distance < 1 || distance > reach + halfWidth) return;
			const middle = towards(target);
			const spread = Math.atan(halfWidth / distance);
			blocked.push(middle - spread, middle, middle + spread);
		};
		visual.angles.forEach((angle, index) => {
			if (angle.at !== id && angle.label) near(angleLabelAt(angle, index), fontSize * 0.9 * angle.label.length * 0.3);
		});
		for (const other of visual.points) if (other.id !== id && !other.hidden) near(at(other.id), fontSize * 0.4);
		segmentLabels.forEach((labelAt, index) => {
			if (labelAt) near(labelAt, fontSize * 0.94 * (visual.segments[index].label ?? '').length * 0.3);
		});
		if (blocked.length === 0) return Math.atan2(py - centre[1], px - centre[0]);
		const sorted = blocked.map((angle) => ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)).sort((a, b) => a - b);
		let best = {gap: -1, middle: 0};
		sorted.forEach((angle, index) => {
			const next = index + 1 < sorted.length ? sorted[index + 1] : sorted[0] + 2 * Math.PI;
			if (next - angle > best.gap) best = {gap: next - angle, middle: angle + (next - angle) / 2};
		});
		return best.middle;
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
				<path d={angleArc(corner, at(angle.from), at(angle.to), radius, u(7))} fill="none" stroke={palette.brand} strokeWidth={u(5)} strokeLinecap="round" />
				{angle.label ? <text x={lx} y={ly + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle">{angle.label}</text> : null}
			</g>
		);
	}

	/** The centre of an angle's label: on the bisector, just outside its arc. Drawing and letter placement share it. */
	function angleLabelAt(angle: Geometry['angles'][number], index: number): [number, number] {
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
		const base = (arc + ringOf(index) * ringStep) * 1.9;
		const radius = Math.min(Math.max(base, clear), base * 1.8);
		return [corner[0] + Math.cos(middle) * radius, corner[1] + Math.sin(middle) * radius];
	}
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
			{label && labelAt ? <text x={labelAt[0]} y={labelAt[1] + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={700} textAnchor="middle" opacity={progress}>{label}</text> : null}
		</g>
	);
};
