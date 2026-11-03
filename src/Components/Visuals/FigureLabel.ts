import {textWidth as measuredWidth} from '../Typography/TextMeasure';



/** [left, top, right, bottom] of a label, in pixels. */
export type LabelBox = [number, number, number, number];

/**
 * A figure's text as drawn. The prime of A′ (U+2032) has no glyph in Manrope; the fallback sat on the baseline and C′
 * read as "C/" (KPSS Geometri 4, 1 Nov 2026). The closing quote stands where a prime should, at the top of the letter.
 * Plane figures and solids (a pyramid's side height h′) use it alike.
 */
export const figureText = (text: string): string => text.replaceAll('″', '’’').replaceAll('′', '’');

/**
 * A figure text's width at `fontSize`, from Manrope's own letter widths at `weight` (labels are bold: 800). Every
 * figure measures with this; it was a letter count times 0.6 of the size here and the same guess at 0.52–0.62 in
 * twenty other places, so an "i" and an "m" took the same room (2 Nov 2026).
 */
export const textWidth = (text: string, fontSize: number, weight = 800) => measuredWidth(text, {size: fontSize, weight});

/** The size at which `text` at `weight` is `room` wide: the largest that fits it into a room on one line. */
export const fitSize = (text: string, room: number, weight = 800) => room / Math.max(1e-6, textWidth(text, 1, weight));

/**
 * Points every `step` pixels along a line, ends excluded: a line as obstacles for `placeLabel`, so a label that
 * would sit across a side (the x of a narrow angle pushed out onto the far side, KPSS Geometri 2, 1 Nov 2026) counts
 * every point it covers and takes a clear spot instead.
 */
export const lineSamples = (from: [number, number], to: [number, number], step: number): [number, number][] => {
	const count = Math.floor(Math.hypot(to[0] - from[0], to[1] - from[1]) / Math.max(1, step));
	return Array.from({length: Math.max(0, count - 1)}, (_, index) => {
		const share = (index + 1) / count;
		return [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share] as [number, number];
	});
};

export const ringAround = ([cx, cy]: [number, number], radius: number): [number, number][] => [[cx, cy], ...Array.from({length: 8}, (_, index) => [cx + radius * Math.cos((index * Math.PI) / 4), cy + radius * Math.sin((index * Math.PI) / 4)] as [number, number])];

const spotsAt = ([px, py]: [number, number], width: number, height: number, gap: number): LabelBox[] => [
	[px + gap, py - gap - height, px + gap + width, py - gap],
	[px - gap - width, py - gap - height, px - gap, py - gap],
	[px + gap, py + gap, px + gap + width, py + gap + height],
	[px - gap - width, py + gap, px - gap, py + gap + height],
	[px + gap * 1.4, py - height / 2, px + gap * 1.4 + width, py + height / 2],
	[px - gap * 1.4 - width, py - height / 2, px - gap * 1.4, py + height / 2],
	[px - width / 2, py - gap * 1.5 - height, px + width / 2, py - gap * 1.5],
	[px - width / 2, py + gap * 1.5, px + width / 2, py + gap * 1.5 + height],
];

/**
 * The places a point's label may take, best first: up-right as before, then the other corners and sides, then the
 * same ring further out. In a crowded small figure (P(2, −1), its foot H and the line d between them in a solution
 * panel) every near spot was taken and the label sat on another; the outer ring leaves it a clear place.
 */
export const pointSpots = (at: [number, number], width: number, height: number, gap: number): LabelBox[] => [...spotsAt(at, width, height, gap), ...spotsAt(at, width, height, gap * 2.6)];

/** The places a segment's label may take: beside its middle on either side, then nearer its ends. */
export const segmentSpots = (from: [number, number], to: [number, number], width: number, height: number, gap: number): LabelBox[] => {
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
	const [nx, ny] = [-(to[1] - from[1]) / length, (to[0] - from[0]) / length];
	const offset = gap + Math.abs(nx) * (width / 2) + Math.abs(ny) * (height / 2);
	return [0.5, 0.35, 0.65].flatMap((share) => {
		const [mx, my] = [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
		return [1, -1].map((side) => {
			const [cx, cy] = [mx + nx * offset * side, my + ny * offset * side];
			return [cx - width / 2, cy - height / 2, cx + width / 2, cy + height / 2] as LabelBox;
		});
	});
};

/**
 * The first of `spots` that covers the fewest obstacle points, overlaps no label already placed and stays
 * inside `bounds`; a later spot wins only by covering fewer.
 */
export const placeLabel = (spots: LabelBox[], obstacles: [number, number][], taken: LabelBox[], bounds: LabelBox): LabelBox => {
	const cost = ([left, top, right, bottom]: LabelBox, index: number) => {
		const margin = 4;
		const covered = obstacles.filter(([px, py]) => px > left - margin && px < right + margin && py > top - margin && py < bottom + margin).length;
		const overlaps = taken.filter((box) => box[0] < right && box[2] > left && box[1] < bottom && box[3] > top).length;
		const outside = left < bounds[0] || top < bounds[1] || right > bounds[2] || bottom > bounds[3] ? 1 : 0;
		return covered + overlaps * 50 + outside * 30 + index * 0.1;
	};
	return spots.reduce((best, spot, index) => (cost(spot, index) < cost(best.spot, best.index) ? {spot, index} : best), {spot: spots[0], index: 0}).spot;
};
