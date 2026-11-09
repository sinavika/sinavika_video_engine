import {describe, expect, it} from 'vitest';
import {shuffledSlots} from '../../../../src/Components/Visuals/Structure/BoardShuffle';
import {orderingLayout, orderingPositions} from '../../../../src/Components/Visuals/Structure/Ordering';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

const labels = (count: number) => Array.from({length: count}, (_, index) => `Adım ${index + 1}`);
const isPermutation = (slots: readonly number[]) => [...slots].sort((a, b) => a - b).join() === slots.map((_, index) => index).join();

describe('ordering board', () => {
	it('starts with no item in its own place', () => {
		for (let count = 3; count <= 6; count++) {
			const start = shuffledSlots(labels(count));
			expect(isPermutation(start)).toBe(true);
			start.forEach((slot, item) => expect(slot).not.toBe(item));
		}
	});

	it('puts placed items in their place and keeps the others in their shuffled order in the free places', () => {
		const start = [2, 0, 3, 1];
		expect(orderingLayout(start, new Set())).toEqual(start);
		const layout = orderingLayout(start, new Set([0]));
		expect(layout[0]).toBe(0);
		expect(isPermutation(layout)).toBe(true);
		// Items 1, 3, 2 stood in slots 0, 1, 3: they keep that order in the free slots 1, 2, 3.
		expect([layout[1], layout[3], layout[2]]).toEqual([1, 2, 3]);
		expect(orderingLayout(start, new Set([0, 1, 2, 3]))).toEqual([0, 1, 2, 3]);
	});

	it('moves items between layouts and ends in the right order, never two items in one place at rest', () => {
		const start = shuffledSlots(labels(5));
		const placedAt = [2, 4, 6, 8, 10];
		expect(orderingPositions(start, placedAt, 0)).toEqual(start);
		for (const seconds of [3, 5, 7, 9]) expect(isPermutation(orderingPositions(start, placedAt, seconds).map(Math.round))).toBe(true);
		expect(orderingPositions(start, placedAt, 12)).toEqual([0, 1, 2, 3, 4]);
		// Halfway through a move an item is between its two places.
		const moving = orderingPositions(start, placedAt, 2.4);
		expect(moving.some((slot) => !Number.isInteger(slot))).toBe(true);
	});

	it('needs three to six items with their own labels', () => {
		expect(CourseVisualSchema.safeParse({kind: 'ordering', items: [{label: 'A'}, {label: 'B'}, {label: 'C'}]}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'ordering', items: [{label: 'A'}, {label: 'B'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'ordering', items: [{label: 'A'}, {label: 'A'}, {label: 'C'}]}).success).toBe(false);
	});
});
