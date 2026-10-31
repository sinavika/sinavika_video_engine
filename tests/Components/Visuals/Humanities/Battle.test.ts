import {describe, expect, it} from 'vitest';
import {battleStates, project, stageCamera, unitPlace} from '../../../../src/Components/Visuals/Humanities/Battle';
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
});
