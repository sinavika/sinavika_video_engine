import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {PNG} from 'pngjs';
import {describe, expect, it} from 'vitest';
import {changedShare, clock, stillStretches, type MotionSample} from '../../src/Renderers/FrameMotion';

const samples = (sceneIds: string[], step = 2.5): MotionSample[] => sceneIds.map((sceneId, index) => ({seconds: index * step, sceneId, label: sceneId}));

describe('still stretches', () => {
	it('reports a card that stands still for eight seconds or more', () => {
		const run = samples(['s1-c1', 's1-c1', 's1-c1', 's1-c1', 's1-c1', 's1-c1']);
		// moves, then still for 4 steps (10 s)
		expect(stillStretches(run, [0.2, 0, 0.001, 0, 0.002])).toEqual([{sceneId: 's1-c1', label: 's1-c1', fromSeconds: 2.5, toSeconds: 12.5}]);
	});

	it('does not count a short pause, nor stillness across a cut to the next card', () => {
		expect(stillStretches(samples(['a', 'a', 'a', 'a']), [0, 0, 0.3])).toEqual([]);
		// a then b, both still: two stretches of 5 s, neither long enough
		expect(stillStretches(samples(['a', 'a', 'a', 'b', 'b', 'b']), [0, 0, 0, 0, 0])).toEqual([]);
	});

	it('keeps a stillness that runs to the end', () => {
		expect(stillStretches(samples(['a', 'a', 'a', 'a', 'a', 'a']), [0.4, 0, 0, 0, 0])).toEqual([{sceneId: 'a', label: 'a', fromSeconds: 2.5, toSeconds: 12.5}]);
	});

	it('writes times as minutes and seconds', () => {
		expect(clock(0)).toBe('0:00');
		expect(clock(125.4)).toBe('2:05');
	});
});

describe('changed share', () => {
	const png = (fill: (x: number, y: number) => number) => {
		const image = new PNG({width: 10, height: 10});
		for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
			const index = (y * 10 + x) * 4;
			image.data[index] = image.data[index + 1] = image.data[index + 2] = fill(x, y);
			image.data[index + 3] = 255;
		}
		return PNG.sync.write(image);
	};
	it('counts the pixels that changed beyond noise', () => {
		const folder = mkdtempSync(path.join(tmpdir(), 'motion-'));
		const [a, b, c] = ['a.png', 'b.png', 'c.png'].map((name) => path.join(folder, name));
		writeFileSync(a, png(() => 100));
		writeFileSync(b, png((x) => (x < 3 ? 200 : 105)));
		writeFileSync(c, png(() => 100));
		expect(changedShare(a, b)).toBeCloseTo(0.3);
		expect(changedShare(a, c)).toBe(0);
	});
});
