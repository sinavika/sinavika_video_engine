import {describe, expect, it} from 'vitest';
import {cubeFaces, drawOrder, isoPoint} from '../../../../src/Components/Visuals/Mathematics/UnitCube';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('unit cubes', () => {
	it('draws x to the lower right, y to the lower left and z straight up', () => {
		const [ox, oy] = isoPoint([0, 0, 0]);
		const [xx, xy] = isoPoint([1, 0, 0]);
		const [yx, yy] = isoPoint([0, 1, 0]);
		const [zx, zy] = isoPoint([0, 0, 1]);
		expect(xx).toBeGreaterThan(ox);
		expect(xy).toBeGreaterThan(oy);
		expect(yx).toBeLessThan(ox);
		expect(yy).toBeGreaterThan(oy);
		expect(zx).toBe(ox);
		expect(zy).toBe(oy - 1);
	});

	it('shows the three faces a viewer at the front right sees, and draws back to front', () => {
		const faces = cubeFaces([0, 0, 0]);
		expect(faces.top.every(([, , z]) => z === 1)).toBe(true);
		expect(faces.right.every(([x]) => x === 1)).toBe(true);
		expect(faces.left.every(([, y]) => y === 1)).toBe(true);
		// The cube on top and the one in front are drawn after the one at the back corner.
		const order = drawOrder([{at: [1, 1, 0]}, {at: [0, 0, 0]}, {at: [0, 0, 1]}]);
		expect(order[0]).toBe(1);
		expect(order.indexOf(0)).toBeGreaterThan(order.indexOf(1));
		expect(order.indexOf(2)).toBeGreaterThan(order.indexOf(1));
	});

	it('takes a block of cubes in groups and refuses two cubes in one place', () => {
		const layer = (z: number) => [0, 1, 2].flatMap((x) => [0, 1].map((y) => ({at: [x, y, z], group: `kat${z + 1}`})));
		const parsed = CourseVisualSchema.parse({kind: 'cubes', cubes: [...layer(0), ...layer(1)], dimensions: ['3', '2', '2']});
		if (parsed.kind !== 'cubes') throw new Error('expected cubes');
		expect(parsed.cubes).toHaveLength(12);
		expect(parsed.cubes[0].shade).toBe(1);
		expect(CourseVisualSchema.safeParse({kind: 'cubes', cubes: [{at: [0, 0, 0]}, {at: [0, 0, 0]}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'cubes', cubes: [{at: [0, 0, 10]}]}).success).toBe(false);
	});
});
