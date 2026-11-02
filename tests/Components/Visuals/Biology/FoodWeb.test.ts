import {describe, expect, it} from 'vitest';
import {foodWebArrowPath} from '../../../../src/Components/Visuals/Biology/FoodWeb';

describe('food web arrows', () => {
	it('draws an arrow straight when nothing stands in its way', () => {
		expect(foodWebArrowPath(100, 400, 100, 100, [{left: 300, right: 400, top: 230, bottom: 270}])).toBe('M100 400 L100 100');
	});

	it('bows an arrow that skips a level out past the box it would run behind', () => {
		// Plant (bottom) to bird (top), the insect's box in between.
		const insect = {left: 60, right: 140, top: 230, bottom: 270};
		const d = foodWebArrowPath(100, 400, 100, 100, [insect]);
		expect(d.startsWith('M100 400 Q')).toBe(true);
		const [controlX] = d.split('Q')[1].trim().split(' ').map(Number);
		// The curve's middle, (100 + 2 control + 100) / 4, lies beside the box.
		const middle = (200 + 2 * controlX) / 4;
		expect(middle < insect.left || middle > insect.right).toBe(true);
	});
});
