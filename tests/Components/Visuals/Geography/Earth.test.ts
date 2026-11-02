import {describe, expect, it} from 'vitest';
import {separateLabels} from '../../../../src/Components/Visuals/Geography/Earth';

const overlap = (a: {x: number; y: number; width: number}, b: {x: number; y: number; width: number}, height: number) =>
	Math.abs(a.x - b.x) < (a.width + b.width) / 2 && Math.abs(a.y - b.y) < height;

describe('place labels on the turning Earth', () => {
	it('moves a label that would cover another one below it', () => {
		const labels = [
			{x: 300, y: 190, width: 220},
			{x: 320, y: 205, width: 220},
		];
		const ys = separateLabels(labels, 34);
		expect(ys[0]).toBe(190);
		expect(ys[1]).toBeGreaterThanOrEqual(190 + 34);
		expect(overlap({...labels[0], y: ys[0]}, {...labels[1], y: ys[1]}, 34)).toBe(false);
	});

	it('leaves labels that are already apart where they are', () => {
		const labels = [
			{x: 100, y: 100, width: 120},
			{x: 500, y: 110, width: 120},
			{x: 110, y: 300, width: 120},
		];
		expect(separateLabels(labels, 34)).toEqual([100, 110, 300]);
	});

	it('keeps a crowded stack clear of every label, not only its neighbour', () => {
		const labels = Array.from({length: 4}, (_, index) => ({x: 300 + index * 5, y: 200 + index * 3, width: 200}));
		const ys = separateLabels(labels, 30);
		for (let a = 0; a < labels.length; a++)
			for (let b = a + 1; b < labels.length; b++) expect(overlap({...labels[a], y: ys[a]}, {...labels[b], y: ys[b]}, 30)).toBe(false);
	});
});

describe('place labels and their dots', () => {
	it('keeps a label off the places’ dots as well', () => {
		const dots = [{x: 300, y: 200, width: 28}];
		const ys = separateLabels([{x: 310, y: 205, width: 200}], 34, dots);
		expect(Math.abs(ys[0] - 200)).toBeGreaterThanOrEqual(34);
	});
});
