

/** [left, top, right, bottom] of a label, in pixels. */
export type LabelBox = [number, number, number, number];

export const textWidth = (text: string, fontSize: number) => text.length * fontSize * 0.6;

export const ringAround = ([cx, cy]: [number, number], radius: number): [number, number][] => [[cx, cy], ...Array.from({length: 8}, (_, index) => [cx + radius * Math.cos((index * Math.PI) / 4), cy + radius * Math.sin((index * Math.PI) / 4)] as [number, number])];

/** The places a point's label may take, best first: up-right as before, then the other corners and sides. */
export const pointSpots = ([px, py]: [number, number], width: number, height: number, gap: number): LabelBox[] => [
	[px + gap, py - gap - height, px + gap + width, py - gap],
	[px - gap - width, py - gap - height, px - gap, py - gap],
	[px + gap, py + gap, px + gap + width, py + gap + height],
	[px - gap - width, py + gap, px - gap, py + gap + height],
	[px + gap * 1.4, py - height / 2, px + gap * 1.4 + width, py + height / 2],
	[px - gap * 1.4 - width, py - height / 2, px - gap * 1.4, py + height / 2],
	[px - width / 2, py - gap * 1.5 - height, px + width / 2, py - gap * 1.5],
	[px - width / 2, py + gap * 1.5, px + width / 2, py + gap * 1.5 + height],
];

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
