import {describe, expect, it} from 'vitest';
import {treeLayout} from '../../../../src/Components/Visuals/Structure/Tree';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

/** A tree of four branches whose kinds add up to `columns` leaf columns (8 = 3 + 3 + 1 + 1, 9 = 3 + 3 + 2 + 1). */
const tree = (columns: number) => {
	const counts = [3, 3, Math.max(1, columns - 7), 1];
	return {
		kind: 'tree',
		root: 'Kökler',
		branches: counts.map((count, branch) => ({label: `Dal ${branch + 1}`, nodes: Array.from({length: count}, (_, index) => ({label: `Tür ${index + 1}`, items: ['Örnek bir ad']}))})),
	};
};

describe('tree', () => {
	it('keeps to eight kinds: a wider tree draws its names too small to read', () => {
		expect(CourseVisualSchema.safeParse(tree(8)).success).toBe(true);
		const wide = CourseVisualSchema.safeParse(tree(9));
		expect(wide.success).toBe(false);
		expect(JSON.stringify(wide.error?.issues)).toContain('too wide to read');
	});

	it('gives the examples of an eight-kind tree a readable size in a landscape box', () => {
		const visual = CourseVisualSchema.parse(tree(8));
		if (visual.kind !== 'tree') throw new Error('tree');
		const layout = treeLayout(visual, 1500 / 640);
		// The world is drawn into the box: on a 1500-wide card its examples stay at about 16 pixels or more.
		expect((layout.itemSize * 1500) / layout.worldWidth).toBeGreaterThanOrEqual(15);
	});
});
