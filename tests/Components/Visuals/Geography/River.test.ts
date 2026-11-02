import {describe, expect, it} from 'vitest';
import {deltaCoastY, deltaShape} from '../../../../src/Components/Visuals/Geography/River';
import {H, W} from '../../../../src/Components/Visuals/VisualWorld';

const distance = (a: readonly [number, number], b: readonly [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('delta', () => {
	it('ends every distributary on the delta front, where it meets the sea', () => {
		for (const fan of [0.3, 0.6, 1]) {
			const {front, branches} = deltaShape(fan);
			for (const branch of branches) {
				const nearest = Math.min(...front.map((point) => distance(point, branch.end)));
				expect(nearest).toBeLessThan(12);
			}
		}
	});

	it('builds out into the sea, below the coast, and grows as the deposits do', () => {
		const young = deltaShape(0.2);
		const grown = deltaShape(1);
		const mouthY = deltaCoastY(W / 2);
		for (const [, y] of grown.front) expect(y).toBeGreaterThanOrEqual(mouthY - 20);
		const reach = (shape: ReturnType<typeof deltaShape>) => Math.max(...shape.front.map(([, y]) => y));
		expect(reach(grown)).toBeGreaterThan(reach(young) + 100);
		// The grown delta stays inside the frame, so the sea still shows around it on both sides and below.
		for (const [x, y] of grown.front) {
			expect(x).toBeGreaterThan(0);
			expect(x).toBeLessThan(W);
			expect(y).toBeLessThan(H - 20);
		}
	});

	it('bulges where the branches carry their load out (a lobed front, not a plain arc)', () => {
		const {front, branches, radius} = deltaShape(1);
		const mouth: [number, number] = [W / 2, deltaCoastY(W / 2)];
		const lobe = (angle: number) => {
			const point = front.reduce((best, candidate) => {
				const at = Math.atan2(candidate[1] - mouth[1], (candidate[0] - mouth[0]) / 1.35);
				const bestAt = Math.atan2(best[1] - mouth[1], (best[0] - mouth[0]) / 1.35);
				return Math.abs(at - angle) < Math.abs(bestAt - angle) ? candidate : best;
			});
			return Math.hypot((point[0] - mouth[0]) / 1.35, point[1] - mouth[1]);
		};
		const between = (branches[1].angle + branches[2].angle) / 2;
		expect(lobe(branches[1].angle)).toBeGreaterThan(lobe(between) + radius * 0.04);
	});

	it('keeps the coast close to level but never ruled straight', () => {
		const ys = Array.from({length: 50}, (_, index) => deltaCoastY((index / 49) * W));
		expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(6);
		expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(24);
	});
});
