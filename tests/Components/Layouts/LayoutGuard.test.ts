import {describe, expect, it} from 'vitest';
import {croppedByCamera, haloClears, inkBox, intersection, leaves, linesOverlap, strokeThrough} from '../../../src/Components/Layouts/LayoutGuard';

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
		// Two long lines on one row running into each other by a few letters are (a title into its summary).
		expect(linesOverlap(box(0, 0, 500, 40), box(440, 0, 1100, 40))).toBe(true);
		// The same run-in between two rows that only graze each other is not.
		expect(linesOverlap(box(0, 0, 500, 40), box(440, 30, 1100, 70))).toBe(false);
	});

	it('reports a box that leaves its frame by more than rounding', () => {
		const frame = box(0, 0, 1920, 1080);
		expect(leaves(box(10, 10, 300, 60), frame)).toBe(false);
		expect(leaves(box(-1, 10, 300, 60), frame)).toBe(false);
		expect(leaves(box(-40, 10, 300, 60), frame)).toBe(true);
		expect(leaves(box(1700, 1050, 1990, 1090), frame)).toBe(true);
	});

	it('lets a zoomed camera cut off the letters it leaves outside its window', () => {
		const window = box(100, 100, 900, 600);
		// The B of a triangle when the camera has moved in on A (KPSS Geometri 2): cut by the zoom, not a fault.
		expect(croppedByCamera(box(60, 580, 90, 620), window)).toBe(true);
		expect(croppedByCamera(box(880, 300, 940, 340), window)).toBe(true);
		// A letter inside the window is still checked, and without a zoom nothing is set aside.
		expect(croppedByCamera(box(400, 300, 440, 340), window)).toBe(false);
		expect(croppedByCamera(box(60, 580, 90, 620), undefined)).toBe(false);
	});

	it('measures the inked middle of a line, not the empty room above and below the letters', () => {
		const ink = inkBox(box(0, 0, 100, 50));
		expect(ink.left).toBe(0);
		expect(ink.right).toBe(100);
		expect(ink.bottom - ink.top).toBeCloseTo(34);
	});

	it('finds a drawn line running through a word, not one grazing its corner', () => {
		const word = box(100, 100, 220, 130);
		// A falling straight line, sampled every 4 px, from the top left of the plot across the axis name.
		const line = (from: [number, number], to: [number, number]) => {
			const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
			return Array.from({length: Math.floor(length / 4) + 1}, (_, index) => [from[0] + ((to[0] - from[0]) * index * 4) / length, from[1] + ((to[1] - from[1]) * index * 4) / length] as [number, number]);
		};
		// The demand curve across "fiyat" (KPSS VAT 8).
		expect(strokeThrough(line([60, 80], [300, 160]), word, 4)).toBe(true);
		// A level line through the middle of the word.
		expect(strokeThrough(line([0, 115], [400, 115]), word, 4)).toBe(true);
		// A steep line crossing the short side still strikes the word.
		expect(strokeThrough(line([160, 0], [160, 300]), word, 4)).toBe(true);
		// A line just above the word, or touching only its corner, does not.
		expect(strokeThrough(line([0, 95], [400, 95]), word, 4)).toBe(false);
		expect(strokeThrough(line([210, 90], [240, 140]), word, 4)).toBe(false);
		expect(strokeThrough([], word, 4)).toBe(false);
	});

	it('lets a text with a thick halo in the paper colour stand over a line', () => {
		// A point's name with a 6 px halo at 28 px is readable over a curve; a text with no halo or a hairline is not.
		expect(haloClears('stroke', 'rgb(250, 250, 250)', 6, 28)).toBe(true);
		expect(haloClears('stroke fill markers', 'rgb(250, 250, 250)', 6, 28)).toBe(true);
		expect(haloClears('normal', 'rgb(250, 250, 250)', 6, 28)).toBe(false);
		expect(haloClears('stroke', 'none', 6, 28)).toBe(false);
		expect(haloClears('stroke', 'rgb(250, 250, 250)', 2, 28)).toBe(false);
	});
});
