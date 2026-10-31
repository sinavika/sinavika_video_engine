import {describe, expect, it} from 'vitest';
import {CAVE_WALL, shadowOf, walkerAt} from '../../../../src/Components/Visuals/Philosophy/Cave';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('cave visual', () => {
	it('casts an enlarged shadow that stays on the wall', () => {
		const top = shadowOf(CAVE_WALL.objectY - CAVE_WALL.halfHeight);
		const bottom = shadowOf(CAVE_WALL.objectY + CAVE_WALL.halfHeight);
		expect(top.scale).toBeGreaterThan(1);
		expect(bottom.y - top.y).toBeCloseTo(2 * CAVE_WALL.halfHeight * top.scale, 6);
		expect(top.y).toBeGreaterThanOrEqual(CAVE_WALL.top);
		expect(bottom.y).toBeLessThanOrEqual(CAVE_WALL.bottom);
		// Wide shapes (±45) stay inside the wall too.
		expect(45 * top.scale * 2).toBeLessThanOrEqual(CAVE_WALL.right - CAVE_WALL.left);
	});

	it('walks the freed prisoner from the seat up the slope and out', () => {
		const start = walkerAt(0);
		const end = walkerAt(1);
		expect(start.y).toBeGreaterThan(end.y);
		expect(end.y).toBe(200);
		const xs = [0, 0.2, 0.4, 0.6, 0.8, 1].map((progress) => walkerAt(progress).x);
		xs.slice(1).forEach((x, index) => expect(x).toBeGreaterThanOrEqual(xs[index]));
	});

	it('takes up to four carried objects', () => {
		expect(CourseVisualSchema.safeParse({kind: 'cave'}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'cave', objects: ['vase', 'horse', 'tree', 'bird', 'vase']}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'cave', objects: ['lamp']}).success).toBe(false);
	});
});
