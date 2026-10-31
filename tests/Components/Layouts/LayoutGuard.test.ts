import {describe, expect, it} from 'vitest';
import {inkBox, intersection, leaves, linesOverlap} from '../../../src/Components/Layouts/LayoutGuard';

const box = (left: number, top: number, right: number, bottom: number) => ({left, top, right, bottom});

describe('layout guard geometry', () => {
	it('finds the part two boxes share', () => {
		expect(intersection(box(0, 0, 100, 40), box(60, 20, 200, 80))).toEqual(box(60, 20, 100, 40));
	});

	it('calls two lines overlapping only when they really cover each other', () => {
		// An arrow label laid over a word tile (the two-arc case that had no warning).
		expect(linesOverlap(box(230, 230, 490, 300), box(300, 240, 380, 300))).toBe(true);
		// Lines of a paragraph touching edge to edge are not an overlap.
		expect(linesOverlap(box(0, 0, 400, 40), box(0, 40, 400, 80))).toBe(false);
		// A corner graze of a pixel or two is anti-aliasing, not an overlap.
		expect(linesOverlap(box(0, 0, 100, 40), box(99, 39, 200, 80))).toBe(false);
		// A small shared strip of a big label is not enough to matter.
		expect(linesOverlap(box(0, 0, 400, 40), box(390, 0, 800, 40))).toBe(false);
	});

	it('reports a box that leaves its frame by more than rounding', () => {
		const frame = box(0, 0, 1920, 1080);
		expect(leaves(box(10, 10, 300, 60), frame)).toBe(false);
		expect(leaves(box(-1, 10, 300, 60), frame)).toBe(false);
		expect(leaves(box(-40, 10, 300, 60), frame)).toBe(true);
		expect(leaves(box(1700, 1050, 1990, 1090), frame)).toBe(true);
	});

	it('measures the inked middle of a line, not the empty room above and below the letters', () => {
		const ink = inkBox(box(0, 0, 100, 50));
		expect(ink.left).toBe(0);
		expect(ink.right).toBe(100);
		expect(ink.bottom - ink.top).toBeCloseTo(34);
	});
});
