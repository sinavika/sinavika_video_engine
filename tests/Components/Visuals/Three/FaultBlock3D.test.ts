import {describe, expect, it} from 'vitest';
import {FAULT_BLOCK, faultGeometry} from '../../../../src/Components/Visuals/Three/FaultBlock3D';
import {EARTHQUAKE_STAGES, earthquakeStages} from '../../../../src/Components/Visuals/Three/ThreeSchema';

// A cone points up (+y) before it is turned; this is where a turn [x, 0, z] (XYZ order) sends that tip.
const tipOf = ([x, , z]: [number, number, number]): [number, number, number] => {
	// Three.js applies the turns as R = Rx·Ry·Rz to the point: z first, then x (y is never used by the fault block).
	const afterZ: [number, number, number] = [-Math.sin(z), Math.cos(z), 0];
	return [afterZ[0], afterZ[1] * Math.cos(x) - afterZ[2] * Math.sin(x), afterZ[1] * Math.sin(x) + afterZ[2] * Math.cos(x)];
};
const near = (a: number[], b: number[]) => a.every((value, index) => Math.abs(value - b[index]) < 1e-9);

describe('3D fault block', () => {
	it('dips a normal or reverse fault at 60°, down to the right, across the rock', () => {
		for (const fault of ['reverse', 'normal'] as const) {
			const geometry = faultGeometry(fault, 1);
			expect(geometry.split).toBe('x');
			expect(geometry.plane.rotation[2]).toBeCloseTo(-Math.PI / 3);
			// The plane's width is the fault's length from the top to the bottom of the rock.
			expect(geometry.plane.size[0]).toBeCloseTo(FAULT_BLOCK.height / Math.sin(Math.PI / 3));
			// The fault goes down to the right, so the right block lies over it (the hanging wall); it meets the top
			// and the bottom inside the rock.
			expect(geometry.faultX(0)).toBeLessThan(geometry.faultX(-FAULT_BLOCK.height));
			expect(Math.abs(geometry.faultX(0))).toBeLessThan(FAULT_BLOCK.halfWidth);
			expect((geometry.faultX(-FAULT_BLOCK.height) - geometry.faultX(0)) / FAULT_BLOCK.height).toBeCloseTo(1 / Math.tan(Math.PI / 3));
		}
	});

	it('stands a strike-slip fault upright, across the picture, between a back and a front block', () => {
		const geometry = faultGeometry('strikeSlip', 1);
		expect(geometry.split).toBe('z');
		expect(geometry.plane.rotation).toEqual([0, 0, 0]);
		expect(geometry.plane.size[0]).toBeGreaterThanOrEqual(FAULT_BLOCK.halfWidth * 2);
		expect(geometry.plane.size[1]).toBeGreaterThanOrEqual(FAULT_BLOCK.height);
	});

	it('moves the hanging wall up a reverse fault, down a normal one and sideways along a strike-slip one', () => {
		const [rx, ry, rz] = faultGeometry('reverse', 1).shift;
		expect(ry).toBeGreaterThan(0);
		expect(rx).toBeLessThan(0); // up the dip is up and to the left
		expect(rz).toBe(0);
		// Along the fault plane: the shift's slope is the dip, and its length the slip.
		expect(Math.atan2(ry, -rx)).toBeCloseTo(Math.PI / 3);
		expect(Math.hypot(rx, ry)).toBeCloseTo(FAULT_BLOCK.slip);
		const [nx, ny] = faultGeometry('normal', 1).shift;
		expect(ny).toBeLessThan(0);
		expect(nx).toBeGreaterThan(0);
		// Strike-slip: along the fault (x), nothing up or down and nothing across it.
		expect(faultGeometry('strikeSlip', 1).shift).toEqual([FAULT_BLOCK.slip, 0, 0]);
		// Nothing has moved before the rupture.
		for (const fault of ['reverse', 'normal', 'strikeSlip'] as const) expect(faultGeometry(fault, 0).shift.every((value) => Math.abs(value) < 1e-12)).toBe(true);
	});

	it('turns every stress arrow the way it says it points', () => {
		for (const fault of ['reverse', 'normal', 'strikeSlip'] as const) {
			faultGeometry(fault, 0).arrows.forEach((arrow) => expect(near(tipOf(arrow.rotation), arrow.direction)).toBe(true));
		}
	});

	it('squeezes a reverse fault and pulls a normal one apart, with the arrows outside the rock', () => {
		for (const fault of ['reverse', 'normal'] as const) {
			const {arrows} = faultGeometry(fault, 0);
			arrows.forEach(({position, direction}) => {
				const tip = position[0] + direction[0] * FAULT_BLOCK.arrow.head;
				const tail = position[0] - direction[0] * FAULT_BLOCK.arrow.shaft;
				expect(Math.min(Math.abs(tip), Math.abs(tail))).toBeGreaterThan(FAULT_BLOCK.halfWidth);
				// Squeezing points at the rock (tip nearer it), pulling points away (tail nearer it).
				expect(Math.abs(tip) < Math.abs(tail)).toBe(fault === 'reverse');
				expect(Math.sign(direction[0]) === -Math.sign(position[0])).toBe(fault === 'reverse');
			});
		}
	});

	it('shears a strike-slip fault: one arrow on each block, along the fault, opposite ways, on top of the rock', () => {
		const [back, front] = faultGeometry('strikeSlip', 0).arrows;
		expect(back.position[2]).toBeLessThan(0);
		expect(front.position[2]).toBeGreaterThan(0);
		for (const arrow of [back, front]) {
			expect(arrow.direction[1]).toBe(0);
			expect(arrow.direction[2]).toBe(0);
			expect(arrow.position[1]).toBeGreaterThan(0);
			// The whole arrow lies over its block.
			for (const end of [arrow.position[0] + arrow.direction[0] * FAULT_BLOCK.arrow.head, arrow.position[0] - arrow.direction[0] * FAULT_BLOCK.arrow.shaft]) expect(Math.abs(end)).toBeLessThan(FAULT_BLOCK.halfWidth);
			expect(Math.abs(arrow.position[2])).toBeLessThan(FAULT_BLOCK.halfDepth);
		}
		expect(back.direction[0]).toBe(-front.direction[0]);
		// The front block is the one that moves, the way its arrow points.
		expect(Math.sign(front.direction[0])).toBe(Math.sign(faultGeometry('strikeSlip', 1).shift[0]));
	});

	it('names what the rupture leaves at the surface by fault type', () => {
		expect(earthquakeStages('reverse', 'block3d').at(-1)).toBe('Fay dikliği');
		expect(earthquakeStages('normal', 'block3d').at(-1)).toBe('Fay dikliği');
		expect(earthquakeStages('strikeSlip', 'block3d').at(-1)).toBe('Yatay atım');
		expect(earthquakeStages('strikeSlip', 'section')).toEqual(EARTHQUAKE_STAGES.section);
		// Same number of stages either way, so beats written for one fault fit the other.
		expect(EARTHQUAKE_STAGES.block3dStrikeSlip).toHaveLength(EARTHQUAKE_STAGES.block3d.length);
	});
});
