import {describe, expect, it} from 'vitest';
import {massColumns} from '../../../../src/Components/Visuals/Processes/Geography/Landslide';
import {COAST, LAND, RIVER, SEA_LEVEL, TABLE, cloudAt, heightAt} from '../../../../src/Components/Visuals/Processes/Geography/WaterCycle';
import {depthY, pressureAt, temperatureAt} from '../../../../src/Components/Visuals/Processes/Geography/Ocean';
import {TRACK, latitudeY, stormStrength} from '../../../../src/Components/Visuals/Processes/Geography/Cyclone';
import {surfaceTemperature} from '../../../../src/Components/Visuals/Processes/Geography/Greenhouse';
import {PROCESS_CATALOG, PROCESSES, processParts} from '../../../../src/Components/Visuals/Processes/ProcessCatalog';
import {SCENE, processCamera, type ProcessClock} from '../../../../src/Components/Visuals/Processes/ProcessScene';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const clockAt = (shown: string[], index: number, progress: number, seconds: number): ProcessClock => ({
	time: 10,
	current: shown[index],
	index,
	shown,
	seconds,
	progress,
	amount: () => 0,
	now: () => 0,
});

describe('process visual', () => {
	it('names its stages and labels as parts, so beats can point at them', () => {
		const visual = CourseVisualSchema.parse({kind: 'process', process: 'landslide'});
		expect(numberedPartNames(visual)).toEqual(['egim', 'tabaka', 'su', 'kayma', 'kutle', 'set', 'catlak', 'yol']);
	});

	it('shows some of the stages, in the process order only', () => {
		expect(() => CourseVisualSchema.parse({kind: 'process', process: 'volcano', stages: ['batolit', 'koni', 'lav']})).not.toThrow();
		expect(() => CourseVisualSchema.parse({kind: 'process', process: 'volcano', stages: ['koni', 'batolit']})).toThrow(/order/);
		expect(() => CourseVisualSchema.parse({kind: 'process', process: 'volcano', stages: ['heyelan']})).toThrow(/not a stage/);
		expect(() => CourseVisualSchema.parse({kind: 'process', process: 'tsunami'})).toThrow();
	});

	it('keeps every stage title short enough for the strip and every note for one line', () => {
		for (const process of PROCESSES) {
			const stages = PROCESS_CATALOG[process].stages;
			expect(stages.length).toBeGreaterThanOrEqual(2);
			expect(new Set(processParts(process)).size).toBe(processParts(process).length);
			stages.forEach((stage) => {
				expect(stage.title.length).toBeLessThanOrEqual(20);
				expect(stage.note.length).toBeLessThanOrEqual(84);
			});
		}
	});
});

describe('landslide mass', () => {
	const area = (columns: ReturnType<typeof massColumns>) =>
		columns.slice(1).reduce((sum, column, index) => sum + ((column.base - column.top + columns[index].base - columns[index].top) / 2) * Math.abs(column.x - columns[index].x), 0);

	it('starts as the soil between the ground and the slip surface', () => {
		const columns = massColumns(0);
		columns.forEach((column) => expect(column.base).toBeGreaterThanOrEqual(column.top - 1e-6));
		expect(columns[0].x).toBeCloseTo(600, 0);
		expect(columns[columns.length - 1].x).toBeCloseTo(1130, 0);
	});

	it('slides down the slope: every column moves downhill, the toe runs over the road at the foot', () => {
		const before = massColumns(0);
		const after = massColumns(1);
		after.forEach((column, index) => {
			expect(column.x).toBeLessThan(before[index].x);
			// Its soil stays on top of the ground it now rests on (the toe climbs out of the slip surface onto the valley floor).
			expect(column.top).toBeLessThanOrEqual(column.base + 1e-6);
		});
		expect(after[0].x).toBeLessThan(440);
	});

	it('keeps roughly the same amount of soil (it stretches and bulges, it does not grow or vanish)', () => {
		const ratio = area(massColumns(1)) / area(massColumns(0));
		expect(ratio).toBeGreaterThan(0.7);
		expect(ratio).toBeLessThan(1.4);
	});
});

describe('process camera', () => {
	it('frames each stage inside the scene and never zooms past its limit', () => {
		const shown = ['a', 'b'];
		const boxes: Record<string, readonly [number, number, number, number] | undefined> = {a: undefined, b: [1400, 500, 1560, 640]};
		const camera = processCamera(clockAt(shown, 1, 1, 5), (stage) => boxes[stage]);
		expect(camera.zoom).toBeLessThanOrEqual(2.2);
		const halfW = (SCENE.right - SCENE.left) / 2 / camera.zoom;
		const halfH = (SCENE.bottom - SCENE.top) / 2 / camera.zoom;
		expect(camera.x + halfW).toBeLessThanOrEqual(SCENE.right + 1e-6);
		expect(camera.y + halfH).toBeLessThanOrEqual(SCENE.bottom + 1e-6);
	});

	it('moves from the last stage view to the new one as the stage begins', () => {
		const shown = ['a', 'b'];
		const boxes: Record<string, readonly [number, number, number, number] | undefined> = {a: undefined, b: [200, 200, 600, 400]};
		const start = processCamera(clockAt(shown, 1, 0, 0), (stage) => boxes[stage]);
		const later = processCamera(clockAt(shown, 1, 0.5, 3), (stage) => boxes[stage]);
		expect(start.zoom).toBeCloseTo(1, 5);
		expect(later.zoom).toBeGreaterThan(1.5);
	});
});

describe('water cycle', () => {
	it('keeps the groundwater under the land and the land above the sea', () => {
		for (let x = COAST + 40; x <= 1560; x += 20) {
			expect(heightAt(TABLE, x)).toBeGreaterThan(heightAt(LAND, x));
			expect(heightAt(LAND, x)).toBeLessThanOrEqual(SEA_LEVEL);
		}
	});

	it('lets the river run only downhill, from under the summit into the sea', () => {
		RIVER.slice(1).forEach(([x, y], index) => {
			expect(x).toBeLessThan(RIVER[index][0]);
			expect(y).toBeGreaterThanOrEqual(RIVER[index][1]);
		});
		expect(RIVER[RIVER.length - 1][0]).toBeLessThan(COAST);
	});

	it('forms the cloud over the sea and the wind carries it inland over the slope', () => {
		expect(cloudAt(0)[0]).toBeLessThan(COAST);
		expect(cloudAt(0.4)[0]).toBe(cloudAt(0)[0]);
		expect(cloudAt(1)[0]).toBeGreaterThan(1000);
		expect(cloudAt(1)[1]).toBeLessThan(heightAt(LAND, cloudAt(1)[0]) - 100);
	});
});

describe('ocean', () => {
	it('reads the pressure as 1 atm of air plus 1 atm for every 10 m of water', () => {
		expect(pressureAt(0)).toBe(1);
		expect(pressureAt(50)).toBe(6);
		expect(pressureAt(4000)).toBe(401);
	});

	it('gets colder and lies lower the deeper it goes', () => {
		for (let metres = 100; metres <= 4000; metres += 100) {
			expect(temperatureAt(metres)).toBeLessThan(temperatureAt(metres - 100));
			expect(depthY(metres)).toBeGreaterThan(depthY(metres - 100));
		}
	});
});

describe('tropical cyclone', () => {
	it('is born away from the Equator, moves north-west to the coast and weakens over land', () => {
		const latitude = (y: number) => (610 - y) / 12;
		expect(latitude(TRACK[0][1])).toBeGreaterThanOrEqual(5);
		TRACK.slice(1).forEach(([x, y], index) => {
			expect(x).toBeLessThan(TRACK[index][0]);
			expect(y).toBeLessThan(TRACK[index][1]);
		});
		expect(latitudeY(0)).toBeGreaterThan(latitudeY(5));
		expect(stormStrength('buyume', 1)).toBeGreaterThan(stormStrength('olusum', 1));
		expect(stormStrength('zayiflama', 1)).toBeLessThan(stormStrength('kiyi', 0.5));
	});
});

describe('greenhouse effect', () => {
	it('reads about −18 °C without the gases, 15 °C with them and warmer as they grow', () => {
		expect(surfaceTemperature(0, 0)).toBe(-18);
		expect(surfaceTemperature(1, 0)).toBe(15);
		expect(surfaceTemperature(1, 1)).toBeGreaterThan(16);
		expect(surfaceTemperature(1, 1)).toBeLessThan(17);
	});
});
