import {describe, expect, it} from 'vitest';
import {ASPECT, ASPECT_RISE, PONTIC_BELTS, RELIEF, SCATTERED_HOUSES, TAURUS_BELTS, aspectRays, aspectSlopeX, clusteredHouses, reliefProfile} from '../../../../src/Components/Visuals/Geography/Landform';
import {LANDFORM_PARTS} from '../../../../src/Components/Visuals/Geography/GeographySchema';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';
import {W} from '../../../../src/Components/Visuals/VisualWorld';

const heightAt = (profile: [number, number][], x: number) => {
	const index = profile.findIndex(([px]) => px >= x);
	if (index <= 0) return profile[Math.max(0, index)][1];
	const [x0, m0] = profile[index - 1];
	const [x1, m1] = profile[index];
	return m0 + ((x - x0) / (x1 - x0)) * (m1 - m0);
};

describe('relief scene', () => {
	const full = reliefProfile(1);

	it('runs from the open sea to the right edge, left to right', () => {
		expect(full[0][0]).toBe(0);
		expect(full[0][1]).toBeLessThan(0);
		expect(full.at(-1)?.[0]).toBe(W);
		full.slice(1).forEach(([x], index) => expect(x).toBeGreaterThan(full[index][0]));
	});

	it('keeps the delta plain at the coast, just above the sea', () => {
		expect(heightAt(full, 175)).toBe(RELIEF.delta);
		expect(heightAt(full, RELIEF.coast)).toBe(0);
		expect(heightAt(full, RELIEF.coast - 1)).toBeLessThan(0);
	});

	it('gives the sea room and depth, so it reads as an open sea and not a pond', () => {
		// At least a seventh of the width is sea, and it deepens away from the coast.
		expect(RELIEF.coast / W).toBeGreaterThanOrEqual(0.14);
		expect(heightAt(full, 0)).toBeLessThan(heightAt(full, RELIEF.coast / 2));
		expect(heightAt(full, RELIEF.coast / 2)).toBeLessThan(-300);
	});

	it('sinks the tectonic plain below the land on both sides of it, flat across', () => {
		expect(heightAt(full, 420)).toBe(RELIEF.plain);
		expect(heightAt(full, 520)).toBe(RELIEF.plain);
		// The mountain between the coast and the plain is the highest point; the ridge beyond the plain rises above it too.
		const [peakX, peakHeight] = full.reduce((best, point) => (point[1] > best[1] ? point : best));
		expect(peakHeight).toBe(RELIEF.peak);
		expect(peakX).toBeGreaterThan(RELIEF.coast);
		expect(peakX).toBeLessThan(420);
		expect(heightAt(full, 585)).toBeGreaterThan(RELIEF.plain);
	});

	it('puts the plateau above the plain and cuts it with valleys that deepen as they come in', () => {
		expect(RELIEF.plateau).toBeGreaterThan(RELIEF.plain);
		expect(heightAt(full, 660)).toBe(RELIEF.plateau);
		expect(heightAt(full, 800)).toBe(RELIEF.plateau);
		// Before the valleys come in, the plateau is flat; then they cut in, and never below the plain.
		expect(heightAt(reliefProfile(0), 720)).toBe(RELIEF.plateau);
		expect(heightAt(reliefProfile(0.5), 720)).toBeCloseTo(RELIEF.plateau - RELIEF.valley / 2);
		expect(heightAt(full, 720)).toBe(RELIEF.plateau - RELIEF.valley);
		expect(heightAt(full, 870)).toBe(RELIEF.plateau - RELIEF.valley);
		expect(RELIEF.plateau - RELIEF.valley).toBeGreaterThan(RELIEF.plain);
		// A V: the valley's sides slope down to its floor.
		expect(heightAt(full, 705)).toBeGreaterThan(heightAt(full, 720));
		expect(heightAt(full, 735)).toBeGreaterThan(heightAt(full, 720));
	});

	it('names its parts for beats and numbered question figures', () => {
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'landform', scene: 'relief'}))).toEqual([...LANDFORM_PARTS.relief]);
	});
});

describe('aspect scene', () => {
	const summitX = (ASPECT.feet[0] + ASPECT.feet[1]) / 2;
	const summitY = ASPECT.ground - ASPECT.summit * ASPECT.scale;

	it('meets the slopes at the summit and at the feet', () => {
		expect(aspectSlopeX('south', 0)).toBe(ASPECT.feet[0]);
		expect(aspectSlopeX('north', 0)).toBe(ASPECT.feet[1]);
		expect(aspectSlopeX('south', ASPECT.summit)).toBeCloseTo(summitX);
		expect(aspectSlopeX('north', ASPECT.summit)).toBeCloseTo(summitX);
	});

	it('lights the south slope only: every ray ends on it, the north slope lies in the summit’s shade', () => {
		for (const {from, to} of aspectRays()) {
			// The ray comes from the south (left) and falls.
			expect(to[0]).toBeGreaterThan(from[0]);
			expect(to[1]).toBeGreaterThan(from[1]);
			// It ends on the south slope, between the foot and the summit.
			expect(to[0]).toBeGreaterThan(ASPECT.feet[0]);
			expect(to[0]).toBeLessThan(summitX);
			const metres = (ASPECT.ground - to[1]) / ASPECT.scale;
			expect(aspectSlopeX('south', metres)).toBeCloseTo(to[0]);
		}
		// The north slope falls more steeply than the rays: the ray past the summit never reaches it.
		expect(ASPECT_RISE).toBeGreaterThan(ASPECT.rayFall);
		const shadowAt = (x: number) => summitY + ASPECT.rayFall * (x - summitX);
		const northY = (x: number) => ASPECT.ground - (ASPECT.feet[1] - x) * ASPECT_RISE;
		for (const x of [summitX + 50, summitX + 200, ASPECT.feet[1] - 1]) expect(northY(x)).toBeGreaterThan(shadowAt(x));
	});

	it('lets olives climb higher and snow melt sooner on the south slope, as ÖSYM asks (500–600 m against 200–250 m)', () => {
		expect(ASPECT.olive.south).toBeGreaterThanOrEqual(500);
		expect(ASPECT.olive.south).toBeLessThanOrEqual(600);
		expect(ASPECT.olive.north).toBeGreaterThanOrEqual(200);
		expect(ASPECT.olive.north).toBeLessThanOrEqual(250);
		expect(ASPECT.snow.south).toBeGreaterThan(ASPECT.snow.north);
		expect(ASPECT.snow.south).toBeLessThan(ASPECT.summit);
	});
});

describe('plant belts up a slope', () => {
	for (const [name, belts, scene] of [['Taurus', TAURUS_BELTS, 'vegetation'], ['Black Sea', PONTIC_BELTS, 'forestbelts']] as const) {
		it(`stacks the ${name} belts from the sea upwards, each starting where the one below ends, the tree line in the gap`, () => {
			expect(belts[0].from).toBe(0);
			belts.slice(1).forEach((belt, index) => {
				expect(belt.from).toBeGreaterThanOrEqual(belts[index].to);
				expect(belt.to).toBeGreaterThan(belt.from);
			});
			// Forest belts touch; only the alpine meadows start above a gap, where the tree line runs (~2.100 m).
			const forest = belts.filter((belt) => belt.id !== 'alpin');
			forest.slice(1).forEach((belt, index) => expect(belt.from).toBe(forest[index].to));
			const meadows = belts.find((belt) => belt.id === 'alpin');
			expect(meadows && meadows.from > forest.at(-1)!.to && 2100 > forest.at(-1)!.to && 2100 < meadows.from).toBe(true);
		});

		it(`names the ${name} belts as the scene's parts`, () => {
			const parts = numberedPartNames(CourseVisualSchema.parse({kind: 'landform', scene}));
			belts.forEach((belt) => expect(parts).toContain(belt.id));
			expect(parts).toContain('agacsiniri');
		});
	}

	it('puts broadleaf trees low and conifers high on the Black Sea slope, as the textbooks do', () => {
		expect(PONTIC_BELTS.map((belt) => belt.tree)).toEqual(['broad', 'mixed', 'fir', 'grass']);
		expect(TAURUS_BELTS[0].tree).toBe('bush');
	});
});

describe('settlement patterns', () => {
	const centre: [number, number] = [240, 320];
	const nearest = (houses: [number, number][]) => houses.map(([x, y], index) => Math.min(...houses.filter((_, other) => other !== index).map(([ox, oy]) => Math.hypot(ox - x, oy - y))));

	it('packs the clustered village round its spring, on the plain half, without houses on top of each other', () => {
		const houses = clusteredHouses(centre, 24);
		houses.forEach(([x, y]) => {
			expect(Math.hypot(x - centre[0], y - centre[1])).toBeLessThan(100);
			expect(x).toBeLessThan(490);
		});
		// A house is 18 wide: neighbours never overlap.
		nearest(houses).forEach((gap) => expect(gap).toBeGreaterThanOrEqual(18));
	});

	it('spreads the scattered houses over the slopes, far apart from one another', () => {
		SCATTERED_HOUSES.forEach(([x, y]) => {
			expect(x).toBeGreaterThan(520);
			expect(y).toBeGreaterThan(60);
			expect(y).toBeLessThan(560);
		});
		const scattered = nearest(SCATTERED_HOUSES);
		const clustered = nearest(clusteredHouses(centre, 24));
		const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
		// What the picture teaches: scattered houses stand several times farther apart than clustered ones.
		expect(mean(scattered)).toBeGreaterThan(3 * mean(clustered));
	});
});
