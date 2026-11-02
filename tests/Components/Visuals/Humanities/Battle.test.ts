import {describe, expect, it} from 'vitest';
import {battleStates, fieldLabelBox, groundNameSpot, nightStars, plankTies, project, riseTransform, seaOutline, stageCamera, unitLabelY, unitNameSpots, unitPlace} from '../../../../src/Components/Visuals/Humanities/Battle';
import {namesMountain} from '../../../../src/Components/Visuals/Humanities/HumanitiesSchema';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

/** A small Malazgirt-like battle: a centre that feigns retreat, two wings that close in, mercenaries changing sides. */
const battle = (extra: object = {}) =>
	CourseVisualSchema.parse({
		kind: 'battle',
		sides: ['Selçuklu', 'Bizans'],
		ground: [{type: 'hill', points: [[20, 10]], name: 'Tepeler'}],
		units: [
			{side: 0, type: 'cavalry', at: [50, 20], label: 'Merkez'},
			{side: 0, type: 'cavalry', at: [30, 18], label: 'Sol kanat'},
			{side: 1, type: 'infantry', at: [50, 45], label: 'Bizans ordusu'},
			{side: 1, type: 'cavalry', at: [70, 45], label: 'Uz ve Peçenekler'},
		],
		stages: [
			{title: 'Diziliş'},
			{
				title: 'Sahte ricat',
				moves: [
					{unit: 1, to: [50, 8]},
					{unit: 3, to: [50, 25]},
				],
				defect: [4],
			},
			{title: 'Hilal', moves: [{unit: 2, to: [42, 27], via: [[30, 26]]}]},
		],
		outcome: {winner: 0, text: 'Selçuklu zaferi'},
		...extra,
	});

describe('battle', () => {
	it('names its units and stages as parts', () => {
		const visual = battle();
		expect(numberedPartNames(visual)).toEqual(['u1', 'u2', 'u3', 'u4', 's1', 's2', 's3']);
	});

	it('rejects a stage that moves a unit the battle does not have', () => {
		expect(() => battle({stages: [{title: 'Diziliş', moves: [{unit: 9, to: [1, 1]}]}]})).toThrow(/unit 9/);
	});

	it('keeps every point on the field', () => {
		expect(() =>
			battle({
				units: [
					{side: 0, type: 'cavalry', at: [120, 5]},
					{side: 1, type: 'cavalry', at: [5, 5]},
				],
			}),
		).toThrow();
	});

	it('moves units from where the last stage left them, along their arrows', () => {
		const visual = battle();
		if (visual.kind !== 'battle') throw new Error('battle');
		// Unit 3 stays put in the opening order, advances in stage 2 and stands there in stage 3.
		expect(unitPlace(visual, 0, 3, 1)).toEqual([50, 45]);
		expect(unitPlace(visual, 1, 3, 1)).toEqual([50, 25]);
		expect(unitPlace(visual, 2, 3, 0.5)).toEqual([50, 25]);
		// Unit 2 bends through its via point: half way along it is on the first leg.
		const [x, y] = unitPlace(visual, 2, 2, 0.3);
		expect(x).toBeCloseTo(30, 0);
		expect(y).toBeGreaterThan(18);
	});

	it('changes a defecting unit to the other side and finds where the sides meet', () => {
		const visual = battle();
		if (visual.kind !== 'battle') throw new Error('battle');
		const states = battleStates(visual);
		expect(states[1].sidesBefore[3]).toBe(1);
		expect(states[1].sides[3]).toBe(0);
		// In stage 3 the left wing (42, 27) is next to the Byzantine army (50, 25).
		expect(states[2].clashes).toContainEqual([1, 2]);
	});
});

describe('battle field and camera', () => {
	it('draws the far side narrower and higher, as a plain seen from a hill', () => {
		const [farLeft, farTop] = project([0, 0]);
		const [farRight] = project([100, 0]);
		const [nearLeft, nearBottom] = project([0, 60]);
		const [nearRight] = project([100, 60]);
		expect(farRight - farLeft).toBeLessThan(nearRight - nearLeft);
		expect(farTop).toBeLessThan(nearBottom);
		// Depth is compressed far away: the first half of the grid takes less than half of the height.
		expect(project([50, 30])[1] - farTop).toBeLessThan((nearBottom - farTop) / 2);
	});

	it('frames the opening and the outcome wide and closes in on a stage where units move', () => {
		const visual = battle();
		if (visual.kind !== 'battle') throw new Error('battle');
		const states = battleStates(visual);
		expect(stageCamera(states[0], 0, 2).zoom).toBe(1);
		expect(stageCamera(states[2], 2, 2).zoom).toBe(1);
		const close = stageCamera(states[1], 1, 2);
		expect(close.zoom).toBeGreaterThanOrEqual(1);
		expect(close.zoom).toBeLessThanOrEqual(1.5);
	});

	it('aims a shooting unit at the nearest enemy', () => {
		const visual = battle({stages: [{title: 'Diziliş'}, {title: 'Ateş', fire: [1]}]});
		if (visual.kind !== 'battle') throw new Error('battle');
		// Unit 1 (50, 20): the Byzantine army (50, 45) is nearer than the mercenaries (70, 45).
		expect(battleStates(visual)[1].shots).toEqual([{from: 0, to: 2}]);
	});
});

describe('burning ships', () => {
	const raid = (burned: number[], type = 'ship') =>
		CourseVisualSchema.safeParse({
			kind: 'battle',
			sides: ['Osmanlı', 'Rusya'],
			ground: [
				{
					type: 'sea',
					points: [
						[0, 0],
						[100, 0],
						[100, 60],
						[0, 60],
					],
				},
			],
			units: [
				{side: 0, type, at: [70, 30], label: 'Osmanlı donanması'},
				{side: 1, type: 'ship', at: [40, 30], label: 'Rus donanması'},
			],
			stages: [{title: 'Liman'}, {title: 'Yangın', burned}],
		});

	it('breaks a burned ship as a routed one and keeps it burning', () => {
		const parsed = raid([1]);
		if (!parsed.success || parsed.data.kind !== 'battle') throw new Error('battle');
		const [harbour, fire] = battleStates(parsed.data);
		expect(harbour.burning).toEqual([false, false]);
		expect(fire.breaking).toEqual([true, false]);
		expect(fire.routed).toEqual([true, false]);
		expect(fire.burning).toEqual([true, false]);
	});

	it('burns only ships and only units the battle has', () => {
		expect(raid([1], 'infantry').success).toBe(false);
		expect(raid([3]).success).toBe(false);
	});

	it('puts the stars of a night battle in the sky the plain leaves at the top corners, never over the ground', () => {
		const stars = nightStars(40);
		expect(stars.length).toBeGreaterThan(20);
		const [farLeft, top] = project([0, 0]);
		const [farRight] = project([100, 0]);
		const [nearLeft, bottom] = project([0, 60]);
		const [nearRight] = project([100, 60]);
		for (const star of stars) {
			const share = (star.y - top) / (bottom - top);
			const left = farLeft + (nearLeft - farLeft) * share;
			const right = farRight + (nearRight - farRight) * share;
			expect(star.x < left || star.x > right).toBe(true);
		}
	});

	it('lays wooden ties along the way of a ship hauled over land, across its direction', () => {
		const ties = plankTies([[10, 30], [34, 30]], 2.4);
		expect(ties).toHaveLength(11);
		// A way along the grid's x axis runs across the screen: the ties' angle is that of the way, near 0.
		for (const tie of ties) expect(Math.abs(Math.sin(tie.angle))).toBeLessThan(0.05);
		expect(ties[0].at[0]).toBeLessThan(ties[10].at[0]);
		const parsed = CourseVisualSchema.parse({kind: 'battle', sides: ['Osmanlı', 'Bizans'], units: [{side: 0, type: 'ship', at: [90, 30]}, {side: 1, type: 'ship', at: [60, 15]}],
			stages: [{title: 'Karadan', moves: [{unit: 1, to: [55, 16], via: [[95, 6]], overland: true}]}, {title: 'Sonuç', moves: [{unit: 2, to: [50, 5]}]}]});
		if (parsed.kind !== 'battle') throw new Error('expected a battle');
		const states = battleStates(parsed);
		expect(states[0].overland).toEqual([true, false]);
		expect(states[1].overland).toEqual([false, false]);
	});

	it('runs a sea that reaches the field’s edge on past it, and draws coast only where it meets the land', () => {
		// The Aegean as a strip along the left edge, from the far edge to the near one.
		const strip = seaOutline([[0, 0], [16, 0], [20, 20], [14, 40], [18, 60], [0, 60]]);
		// Open water fills the frame beyond the plain's slanted edge, to the left and up to the horizon.
		expect(Math.min(...strip.fill.map(([x]) => x))).toBeLessThan(10);
		expect(Math.min(...strip.fill.map(([, y]) => y))).toBeLessThan(80);
		// One coast, from the far edge to the near one, none along the field's edges.
		expect(strip.coasts).toHaveLength(1);
		expect(strip.coasts[0].length).toBeGreaterThan(5);
		// A lake inside the field keeps its outline and is coast all round.
		const lake = seaOutline([[40, 20], [60, 20], [60, 40], [40, 40]]);
		expect(Math.min(...lake.fill.map(([x]) => x))).toBeGreaterThan(300);
		expect(lake.coasts).toHaveLength(1);
	});
});


describe('unit names', () => {
	// The field's box in Battle.tsx, and the whole of it in view, as the opening stage shows it.
	const FIELD = {left: 40, right: 1560, top: 106, bottom: 640};
	const whole = {x: (FIELD.left + FIELD.right) / 2, y: (FIELD.top + FIELD.bottom) / 2, zoom: 1};

	it('writes a name under its unit in the middle of the field', () => {
		const [x, y] = project([50, 30]);
		expect(unitLabelY(x, y, 20, 1, 'Türk ordusu', whole)).toBeGreaterThan(y);
	});

	it('moves the name over the standard when under the unit would leave the field', () => {
		for (const at of [[42, 57], [50, 56], [14, 56]] as [number, number][]) {
			const [x, y] = project(at);
			const labelY = unitLabelY(x, y, 20, 1, 'Türk süvarisi', whole);
			expect(labelY, `${at}`).toBeLessThan(y);
			expect(labelY).toBeGreaterThan(FIELD.top);
		}
	});
});

describe('ground names on the battlefield', () => {
	it('keep clear of the units’ names: moved to a free spot nearby, left out when none is free', () => {
		const sunk = fieldLabelBox(300, 400, 'Irresistible');
		// The mine field's name would sit on the sunken ship's name; it moves off it.
		const spot = groundNameSpot([300, 400], 'Mayınlar', [sunk]);
		expect(spot).toBeDefined();
		const box = fieldLabelBox(spot![0], spot![1], 'Mayınlar');
		expect(box.bottom <= sunk.top || box.top >= sunk.bottom || box.right <= sunk.left || box.left >= sunk.right).toBe(true);
		// Free ground keeps its anchor.
		expect(groundNameSpot([300, 400], 'Mayınlar', [])).toEqual([300, 400]);
		// Hemmed in on every side, the name is left out rather than written over a unit.
		const crowd = Array.from({length: 11}, (_, row) => (row - 5) * 28).flatMap((dy) => [-220, -110, 0, 110, 220].map((dx) => fieldLabelBox(300 + dx, 400 + dy, 'Kalabalık birlik')));
		expect(groundNameSpot([300, 400], 'Mayınlar', crowd)).toBeUndefined();
	});
});

describe('hills and mountains on the battlefield', () => {
	it('calls a dağ a mountain, a tepe a hill', () => {
		for (const name of ['Kösedağ', 'Çal Dağı', 'Mangal Dağı', 'Dağlar', 'Toros Dağları', 'Uludag']) expect(namesMountain(name)).toBe(true);
		for (const name of ['Kocatepe', 'Duatepe', 'Conkbayırı', 'Kahlenberg', 'Dağınık birlikler', 'Dağıstan', 'Dağlık geçit']) expect(namesMountain(name)).toBe(false);
	});

	it('refuses a mountain drawn as a hill: one round rise read as a tent (owner, 2 Nov 2026)', () => {
		const field = (type: string, name: string) =>
			CourseVisualSchema.safeParse({kind: 'battle', sides: ['Selçuklu', 'Moğol'], ground: [{type, points: [[20, 10]], name}], units: [{side: 0, type: 'cavalry', at: [30, 30]}, {side: 1, type: 'cavalry', at: [60, 30]}], stages: [{title: 'Diziliş'}]});
		expect(field('hill', 'Kösedağ').success).toBe(false);
		expect(field('mountain', 'Kösedağ').success).toBe(true);
		expect(field('hill', 'Kocatepe').success).toBe(true);
	});

	it('lowers a rise on the far edge so its top stays on the field, and leaves the others whole', () => {
		const [, nearY] = project([50, 40]);
		expect(riseTransform(500, nearY, 40, 98)).toMatch(/^translate\(500 [\d.]+\) scale\([\d.]+\)$/);
		const [, farY] = project([50, 1]);
		const squashed = /scale\(([\d.]+) ([\d.]+)\)/.exec(riseTransform(500, farY, 1, 98));
		expect(squashed).not.toBeNull();
		const [across, up] = [Number(squashed![1]), Number(squashed![2])];
		// Never flatter than half its height.
		expect(up / across).toBeGreaterThanOrEqual(0.5);
		expect(up / across).toBeLessThan(1);
	});
});

describe('unit names on the battlefield', () => {
	const field = battle();
	if (field.kind !== 'battle') throw new Error('battle');
	const wide = stageCamera(battleStates(field)[0], 0, 0);
	const place = (x: number, y: number, label: string) => ({x, y, depth: 27, scale: 1.25, label});
	const boxes = (places: ReturnType<typeof place>[], size: number) =>
		unitNameSpots(places, wide, size).map((spot, index) => fieldLabelBox(places[index].x + spot.dx, unitLabelY(places[index].x, places[index].y, 27, 1.25, places[index].label, wide, size, spot.flip) + spot.dy, places[index].label, size));
	const overlap = (a: ReturnType<typeof fieldLabelBox>, b: ReturnType<typeof fieldLabelBox>) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

	it('keep their usual place under the unit when it is free', () => {
		expect(unitNameSpots([place(400, 300, 'Sipahiler'), place(1100, 300, 'Yeniçeri')], wide, 37.2)).toEqual([
			{dx: 0, dy: 0, flip: false},
			{dx: 0, dy: 0, flip: false},
		]);
	});

	it('move off a neighbour’s name: Kahlenberg’s close-packed centre once the still raised them', () => {
		// Yeniçeri, Alman-Avusturya, Kırım Hanı and Sobieski as they end the battle.
		const crowd = [place(876, 346, 'Yeniçeri'), place(688, 211, 'Kırım Hanı'), place(524, 477, 'Sobieski'), place(674, 346, 'Alman-Avusturya')];
		const placed = boxes(crowd, 37.2);
		for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) expect(overlap(placed[i], placed[j])).toBe(false);
	});

	it('take the place covering least of the others when none is free, near their unit', () => {
		const ring = [-1, 0, 1].flatMap((row) => [-400, -200, 0, 200, 400].map((dx) => place(700 + dx, 350 + row * 60, 'Kalabalık birlik')));
		const crowd = [...ring, place(700, 350, 'Son birlik')];
		const spots = unitNameSpots(crowd, wide, 37.2);
		const last = spots.at(-1)!;
		const boxOf = (spot: typeof last) => fieldLabelBox(700 + spot.dx, unitLabelY(700, 350, 27, 1.25, 'Son birlik', wide, 37.2, spot.flip) + spot.dy, 'Son birlik', 37.2);
		const others = spots.slice(0, -1).map((spot, index) => fieldLabelBox(crowd[index].x + spot.dx, unitLabelY(crowd[index].x, crowd[index].y, 27, 1.25, crowd[index].label, wide, 37.2, spot.flip) + spot.dy, crowd[index].label, 37.2));
		const covered = (box: ReturnType<typeof fieldLabelBox>) => others.reduce((sum, other) => sum + Math.max(0, Math.min(box.right, other.right) - Math.max(box.left, other.left)) * Math.max(0, Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top)), 0);
		expect(covered(boxOf(last))).toBeLessThanOrEqual(covered(boxOf({dx: 0, dy: 0, flip: false})));
		// Never further than a name and a line from its unit.
		expect(Math.abs(last.dx)).toBeLessThan(260);
	});
});
