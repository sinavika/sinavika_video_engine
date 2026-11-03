import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useFigureFont, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';
import {textWidth} from '../FigureLabel';

type Assembly = Extract<CourseVisual, {kind: 'assembly'}>;
type Group = Assembly['groups'][number];

const SLOTS = 8;

/** The inner edge of a hemicycle, as a share of its outer radius: the floor the chair faces. */
const HEMICYCLE_INNER = 0.38;

/** A seat of a hemicycle on a half circle of radius 1: `x` across (−1…1), `y` up (0…1), `angle` from the left. */
type ArcSeat = {x: number; y: number; row: number; angle: number};

/**
 * Seats laid in arcs as parliaments are drawn: as few rows as hold them with the seats as far apart along a row as
 * the rows are from each other, each row given seats by its length, then all of them in order from left to right,
 * so a group that takes the next run of seats sits in one wedge. Also the seat's radius (unit 1 = outer radius).
 */
export const hemicycleSeats = (total: number): {seats: ArcSeat[]; seatRadius: number} => {
	if (total <= 20) {
		// One row: a small council (Anayasa Mahkemesi's 15) on one arc.
		const radius = 0.8;
		const step = total > 1 ? Math.PI / (total - 1) : 0;
		const seats = Array.from({length: total}, (_, index) => {
			const angle = total > 1 ? index * step : Math.PI / 2;
			return {x: -radius * Math.cos(angle), y: radius * Math.sin(angle), row: 0, angle};
		});
		return {seats, seatRadius: Math.min(0.08, total > 1 ? radius * step * 0.36 : 0.08)};
	}
	let rows = 2;
	const radii = (count: number) => Array.from({length: count}, (_, row) => HEMICYCLE_INNER + ((1 - HEMICYCLE_INNER) * row) / (count - 1));
	const capacity = (count: number) => radii(count).reduce((sum, radius) => sum + Math.floor((Math.PI * radius) / ((1 - HEMICYCLE_INNER) / (count - 1))) + 1, 0);
	while (capacity(rows) < total) rows++;
	const spacing = (1 - HEMICYCLE_INNER) / (rows - 1);
	const rowRadii = radii(rows);
	// Seats per row by length, largest remainders first, never more than a row holds.
	const length = rowRadii.reduce((sum, radius) => sum + radius, 0);
	const exact = rowRadii.map((radius) => (total * radius) / length);
	const counts = exact.map((value, row) => Math.min(Math.floor(value), Math.floor((Math.PI * rowRadii[row]) / spacing) + 1));
	const order = exact.map((value, row) => ({row, rest: value - Math.floor(value)})).sort((a, b) => b.rest - a.rest);
	for (let left = total - counts.reduce((sum, count) => sum + count, 0), index = 0; left > 0; index++) {
		const {row} = order[index % rows];
		if (counts[row] < Math.floor((Math.PI * rowRadii[row]) / spacing) + 1) {
			counts[row]++;
			left--;
		}
	}
	const seats = rowRadii.flatMap((radius, row) =>
		Array.from({length: counts[row]}, (_, index) => {
			const angle = counts[row] > 1 ? (index * Math.PI) / (counts[row] - 1) : Math.PI / 2;
			return {x: -radius * Math.cos(angle), y: radius * Math.sin(angle), row, angle};
		}),
	);
	// Left to right; on the same line the outer seat first, so a wedge runs from the back to the front.
	seats.sort((a, b) => a.angle - b.angle || b.row - a.row);
	return {seats, seatRadius: spacing * 0.4};
};

/** Which wall run a group sits on in a `room`: the middle of the back wall, or from there to the right or left. */
export const roomSides = (groups: readonly Pick<Group, 'side'>[]): ('center' | 'right' | 'left')[] => {
	let next: 'right' | 'left' = 'right';
	return groups.map((group, index) => {
		if (group.side) return group.side;
		if (index === 0) return 'center';
		const side = next;
		next = next === 'right' ? 'left' : 'right';
		return side;
	});
};

/** The room a `room` layout has: half the back wall's seat line, the side walls' seat line, the seat pitch, and how much a back-wall group's name and note take below it. */
type RoomSpace = {backHalf: number; sideLength: number; pitch: number; labelDepth: number; gap: number};

/**
 * The seats of a `room`, as distances along the wall from the middle of the back wall (negative to the left), one
 * array per group, and how far the farthest seat reaches. Each group takes as much wall as its seats or its name
 * needs (`labelWidths` on the back wall, where the name goes under the seats; the name's two lines on a side wall,
 * where it goes beside them): the middle groups centred, then each side's groups outwards. The first group on each
 * side shares the back wall with the middle; the next ones go down the side walls, below the back-wall names, as do
 * groups that no longer fit on the back wall (the Divan's defterdars and nişancı sit on the side benches).
 */
export const roomLayout = (groups: readonly Pick<Group, 'seats' | 'side'>[], labelWidths: readonly number[], space: RoomSpace): {distances: number[][]; reach: number} => {
	const sides = roomSides(groups);
	const {backHalf, pitch, labelDepth, gap} = space;
	const backFootprint = (index: number) => Math.max(groups[index].seats * pitch, labelWidths[index] + gap);
	const middleWidth = groups.reduce((sum, _, index) => sum + (sides[index] === 'center' ? backFootprint(index) : 0), 0);
	const distances: number[][] = groups.map(() => []);
	const seatsIn = (index: number, from: number, footprint: number) =>
		Array.from({length: groups[index].seats}, (_, seat) => from + footprint / 2 + (seat - (groups[index].seats - 1) / 2) * pitch);
	let cursor = -middleWidth / 2;
	groups.forEach((_, index) => {
		if (sides[index] !== 'center') return;
		distances[index] = seatsIn(index, cursor, backFootprint(index));
		cursor += backFootprint(index);
	});
	let reach = middleWidth / 2;
	for (const side of ['right', 'left'] as const) {
		let along = middleWidth > 0 ? middleWidth / 2 : gap / 2;
		let onSide = 0;
		// The side wall's first seat: below the names under the back wall.
		const sideStart = backHalf + Math.max(pitch * 0.7, labelDepth);
		groups.forEach((group, index) => {
			if (sides[index] !== side) return;
			let footprint = backFootprint(index);
			const first = onSide++ === 0;
			// Down the side wall, also when the back wall ended right at the corner: the defterdars sat at the corner,
			// their names on the kubbe vezirleri's (Divan-ı Hümayun, KPSS Tarih 6, 2 Nov 2026).
			if (along < sideStart && (!first || along + footprint > backHalf + pitch * 0.3)) along = sideStart;
			if (along > backHalf) footprint = Math.max(group.seats * pitch, labelDepth * 0.85 + gap);
			const places = seatsIn(index, along, footprint);
			distances[index] = side === 'right' ? places : places.map((distance) => -distance);
			along += footprint;
		});
		reach = Math.max(reach, along);
	}
	return {distances, reach};
};

/**
 * The number a legend writes for a group: its own seats, or with `cumulative` the seats up to and including it, for a
 * hemicycle that shows thresholds (200, 301, 360, 400 of TBMM's 600: "Salt çoğunluk · 301", not "· 101").
 */
export const legendCount = (groups: readonly Pick<Group, 'seats'>[], index: number, cumulative: boolean): number =>
	cumulative ? groups.slice(0, index + 1).reduce((sum, group) => sum + group.seats, 0) : groups[index].seats;

/** A seated person: a cushion, shoulders and a head, `size` across. */
const Sitter: React.FC<{x: number; y: number; size: number; colour: string; cushion: string; member: boolean; outline: string; strokeWidth: number}> = ({x, y, size, colour, cushion, member, outline, strokeWidth}) => (
	<g transform={`translate(${x} ${y})`}>
		<circle r={size * 0.5} fill={member ? cushion : 'none'} stroke={member ? 'none' : outline} strokeWidth={strokeWidth} strokeDasharray={member ? undefined : `${strokeWidth * 2.2} ${strokeWidth * 1.6}`} />
		<path d={`M${-size * 0.3} ${size * 0.3} Q${-size * 0.3} ${-size * 0.02} 0 ${-size * 0.02} Q${size * 0.3} ${-size * 0.02} ${size * 0.3} ${size * 0.3} Z`} fill={colour} />
		<circle cy={-size * 0.2} r={size * 0.15} fill={colour} />
	</g>
);

/**
 * Who sits in a council or an assembly. `hemicycle` lays the seats in arcs as parliament charts do, each group in
 * one wedge with a legend under it (TBMM's 600, Anayasa Mahkemesi's 15); `room` seats the groups along three walls
 * of a hall, the first group in the middle of the back wall and the others to its right and left (Divan-ı Hümayun),
 * with the `head` (the padişah behind the kafes) above the back wall, or at the chair's desk in a hemicycle. A group
 * (parts g1…) takes its seats one by one when a beat shows or points at it, or one after another without beats;
 * non-members (`member: false`, the reisülküttap) stand on a dashed outline.
 */
export const AssemblyVisual: React.FC<VisualBoxProps & {visual: Assembly}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const looks = Array.from({length: SLOTS}, (_, index) => useElementState(index < visual.groups.length ? `g${index + 1}` : undefined));
	const firstStart = (id: string) => {
		const shown = useBeatStartFor(id, 'show');
		const focused = useBeatStartFor(id, 'focus');
		return shown === undefined ? focused : focused === undefined ? shown : Math.min(shown, focused);
	};
	const starts = Array.from({length: SLOTS}, (_, index) => firstStart(`g${index + 1}`));
	const headLook = useElementState(visual.head ? 'head' : undefined);
	const headStart = firstStart('head');
	const kafes = `assembly-kafes-${React.useId().replace(/:/g, '')}`;

	// Neighbouring groups get far-apart tones of the lesson colour and ink (one lesson colour, no category rainbow).
	const colours = [palette.lesson, palette.ink, withAlpha(palette.lesson, 0.45), palette.lessonDeep, withAlpha(palette.ink, 0.4), withAlpha(palette.lesson, 0.75), withAlpha(palette.lessonDeep, 0.4), withAlpha(palette.ink, 0.7)];
	const begins = visual.groups.map((_, index) => starts[index] ?? delaySeconds + 0.5 + index * 0.8);
	const seatAppear = (group: number, seat: number, count: number) => easeFrom(seconds, begins[group] + (count > 1 ? (seat / (count - 1)) * Math.min(0.9, 0.06 * count) : 0), 0.3);
	const headAppear = headStart === undefined ? easeFrom(seconds, delaySeconds + 0.2, 0.5) : easeFrom(seconds, headStart, 0.5);
	const nameSize = u(30);
	const noteSize = u(24);
	// An app still's smallest text (0 in a lesson): a hall shrinks its names to fit, never under it.
	const least = useFigureFont()(0);
	const text = (weight: number, size: number, colour: string) => ({fontFamily: palette.fontBody, fontWeight: weight, fontSize: size, fill: colour});

	if (visual.layout === 'hemicycle') {
		const {seats, seatRadius} = hemicycleSeats(visual.groups.reduce((sum, group) => sum + group.seats, 0));
		const columns = visual.groups.length > 3 ? 2 : 1;
		const hasNotes = visual.groups.some((group) => group.note);
		const rowHeight = hasNotes ? u(70) : u(44);
		const legendHeight = Math.ceil(visual.groups.length / columns) * rowHeight;
		const totalHeight = visual.total ? u(52) : u(12);
		const base = height - legendHeight - totalHeight - u(16);
		const radius = Math.max(u(80), Math.min(width * 0.46, (base - u(10)) / (1 + seatRadius)));
		const cx = width / 2;
		const owner = visual.groups.flatMap((group, index) => Array.from({length: group.seats}, () => index));
		// The seat's place in its own group: groups take contiguous runs of seats.
		const within = owner.map((group, index) => index - owner.indexOf(group));
		const legendWidth = width / columns;
		return (
			<svg width={width} height={height} style={{overflow: 'visible'}}>
				{seats.map((seat, index) => {
					const group = owner[index];
					const look = looks[group];
					const grow = seatAppear(group, within[index], visual.groups[group].seats);
					if (grow <= 0.001) return null;
					const member = visual.groups[group].member;
					const r = radius * seatRadius * grow * (1 + 0.12 * look.emphasis);
					return (
						<circle
							key={index}
							cx={cx + seat.x * radius}
							cy={base - seat.y * radius}
							r={r}
							fill={member ? colours[group % colours.length] : 'none'}
							stroke={member ? palette.surface : palette.muted}
							strokeWidth={member ? u(1.5) : u(2.5)}
							strokeDasharray={member ? undefined : `${u(5)} ${u(4)}`}
							opacity={1 - UNFOCUSED_FADE * look.dim}
						/>
					);
				})}
				{visual.head ? (
					<g opacity={headAppear * (1 - UNFOCUSED_FADE * headLook.dim)}>
						<rect x={cx - u(70)} y={base - u(44)} width={u(140)} height={u(40)} rx={u(8)} fill={withAlpha(palette.ink, 0.12 + 0.2 * headLook.emphasis)} stroke={withAlpha(palette.ink, 0.45)} strokeWidth={u(2)} />
						<text x={cx} y={base - u(62)} textAnchor="middle" style={text(800, nameSize, palette.ink)}>
							{visual.head.label}
						</text>
						{visual.head.note ? (
							<text x={cx} y={base - u(62) - nameSize * 1.1} textAnchor="middle" style={text(600, noteSize, palette.muted)}>
								{visual.head.note}
							</text>
						) : null}
					</g>
				) : null}
				{visual.total ? (
					<text x={cx} y={base + u(42)} textAnchor="middle" style={text(800, u(32), palette.ink)} opacity={easeFrom(seconds, delaySeconds + 0.3, 0.5)}>
						{visual.total}
					</text>
				) : null}
				{visual.groups.map((group, index) => {
					const look = looks[index];
					const column = columns === 2 ? index % 2 : 0;
					const row = columns === 2 ? Math.floor(index / 2) : index;
					const x = column * legendWidth + (columns === 1 ? width / 2 - u(260) : u(30));
					const y = base + totalHeight + u(16) + row * rowHeight + u(30);
					return (
						<g key={index} opacity={easeFrom(seconds, begins[index] + 0.2, 0.4) * (1 - UNFOCUSED_FADE * look.dim)}>
							<circle cx={x + u(14)} cy={y - u(10)} r={u(13)} fill={group.member ? colours[index % colours.length] : 'none'} stroke={group.member ? 'none' : palette.muted} strokeWidth={u(2.5)} strokeDasharray={group.member ? undefined : `${u(5)} ${u(4)}`} />
							<text x={x + u(40)} y={y} style={text(700 + Math.round(100 * look.emphasis), nameSize, palette.ink)}>
								{`${group.name} · ${legendCount(visual.groups, index, visual.cumulative)}`}
							</text>
							{group.note ? (
								<text x={x + u(40)} y={y + u(32)} style={text(600, noteSize, palette.muted)}>
									{group.note}
								</text>
							) : null}
						</g>
					);
				})}
			</svg>
		);
	}

	// A hall: the back wall across the top, side walls down to the door at the front.
	const headRoom = visual.head ? u(120) : u(16);
	const top = headRoom;
	const bottom = height - u(16);
	const cx = width / 2;
	// A hall at most 1.9 times as wide as deep: in a wide video box every seat went to one long back wall over an empty floor.
	const hallHalf = Math.min((width - u(48)) / 2, (bottom - top) * 0.95);
	const left = cx - hallHalf;
	const right = cx + hallHalf;
	// Seats stay clear of the walls at the largest size they may grow to.
	const inset = u(58);
	const backY = top + inset;
	const backHalf = right - inset - cx;
	const sideLength = bottom - u(70) - backY;
	// Seats, names and notes grow together as far as the walls allow (up to 140 %), or shrink until the farthest group
	// fits (never below 60 %).
	const plan = (scale: number) => {
		const pitch = u(76) * scale;
		const names = Math.max(least, nameSize * scale);
		const notes = Math.max(least, noteSize * scale);
		const labelWidths = visual.groups.map((group) => Math.max(textWidth(group.name, names), textWidth(group.note ?? '', notes, 600)));
		const labelDepth = pitch * 0.45 + names * 1.1 + (visual.groups.some((group) => group.note) ? notes * 1.35 : 0);
		return {scale, pitch, names, notes, ...roomLayout(visual.groups, labelWidths, {backHalf, sideLength, pitch, labelDepth, gap: u(30) * scale})};
	};
	const fits = (candidate: ReturnType<typeof plan>) => candidate.reach <= backHalf + sideLength;
	let layout = [1.4, 1.3, 1.2, 1.1, 1].map(plan).find(fits) ?? plan(1);
	for (let pass = 0; pass < 3 && !fits(layout); pass++) layout = plan(Math.max(0.6, layout.scale * ((backHalf + sideLength) / layout.reach)));
	const {pitch, names: roomName, notes: roomNote, distances} = layout;
	const size = pitch * 0.82;
	const at = (distance: number): [number, number] => {
		const along = Math.abs(distance);
		const sign = distance < 0 ? -1 : 1;
		return along <= backHalf ? [cx + sign * along, backY] : [cx + sign * backHalf, backY + (along - backHalf)];
	};
	const sides = roomSides(visual.groups);
	const lattice = Array.from({length: 9}, (_, index) => index);
	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			<rect x={left} y={top} width={right - left} height={bottom - top} rx={u(18)} fill={withAlpha(palette.lesson, 0.06)} />
			<path d={`M${cx - u(70)} ${bottom} H${left} V${top} H${right} V${bottom} H${cx + u(70)}`} fill="none" stroke={withAlpha(palette.ink, 0.4)} strokeWidth={u(6)} strokeLinejoin="round" strokeLinecap="round" />
			{visual.head ? (
				<g opacity={headAppear * (1 - UNFOCUSED_FADE * headLook.dim)}>
					<clipPath id={kafes}>
						<rect x={cx - u(110)} y={top - u(92)} width={u(220)} height={u(70)} rx={u(10)} />
					</clipPath>
					<rect x={cx - u(110)} y={top - u(92)} width={u(220)} height={u(70)} rx={u(10)} fill={withAlpha(palette.ink, 0.1 + 0.18 * headLook.emphasis)} />
					<g clipPath={`url(#${kafes})`} stroke={withAlpha(palette.ink, 0.55)} strokeWidth={u(2.5)}>
						{lattice.map((index) => (
							<React.Fragment key={index}>
								<line x1={cx - u(110) + index * u(30)} y1={top - u(92)} x2={cx - u(180) + index * u(30)} y2={top - u(22)} />
								<line x1={cx - u(180) + index * u(30)} y1={top - u(92)} x2={cx - u(110) + index * u(30)} y2={top - u(22)} />
							</React.Fragment>
						))}
					</g>
					<rect x={cx - u(110)} y={top - u(92)} width={u(220)} height={u(70)} rx={u(10)} fill="none" stroke={withAlpha(palette.ink, 0.6)} strokeWidth={u(3)} />
					<text x={cx + u(130)} y={top - u(60)} style={text(800 + Math.round(100 * headLook.emphasis), nameSize, palette.ink)}>
						{visual.head.label}
					</text>
					{visual.head.note ? (
						<text x={cx + u(130)} y={top - u(28)} style={text(600, noteSize, palette.muted)}>
							{visual.head.note}
						</text>
					) : null}
				</g>
			) : null}
			{visual.groups.map((group, index) => {
				const look = looks[index];
				const places = distances[index].map(at);
				const appear = easeFrom(seconds, begins[index] + 0.25, 0.4);
				const mx = places.reduce((sum, place) => sum + place[0], 0) / places.length;
				const my = places.reduce((sum, place) => sum + place[1], 0) / places.length;
				const onBack = places.every((place) => place[1] === backY);
				const side = sides[index];
				// The name goes into the room: under a back-wall group, beside a side-wall group.
				const anchor = onBack || side === 'center' ? 'middle' : side === 'right' ? 'end' : 'start';
				const lx = onBack ? mx : side === 'right' ? Math.min(...places.map((place) => place[0])) - size * 0.75 : Math.max(...places.map((place) => place[0])) + size * 0.75;
				const ly = onBack ? backY + size * 0.6 + roomName * 1.05 : my + roomName * 0.35;
				return (
					<g key={index} opacity={1 - UNFOCUSED_FADE * look.dim}>
						{places.map(([x, y], seat) => {
							const grow = seatAppear(index, seat, places.length);
							if (grow <= 0.001) return null;
							return (
								<g key={seat} transform={`translate(${x} ${y}) scale(${grow * (1 + 0.14 * look.emphasis)}) translate(${-x} ${-y})`}>
									<Sitter x={x} y={y} size={size} colour={group.member ? colours[index % colours.length] : palette.muted} cushion={withAlpha(palette.ink, 0.1)} member={group.member} outline={palette.muted} strokeWidth={u(2.5)} />
								</g>
							);
						})}
						<g opacity={appear}>
							<text x={lx} y={ly} textAnchor={anchor} style={text(800 + Math.round(100 * look.emphasis), roomName, palette.ink)}>
								{group.name}
							</text>
							{group.note ? (
								<text x={lx} y={ly + roomNote * 1.25} textAnchor={anchor} style={text(600, roomNote, palette.muted)}>
									{group.note}
								</text>
							) : null}
						</g>
					</g>
				);
			})}
		</svg>
	);
};
