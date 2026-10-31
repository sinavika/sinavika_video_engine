import {describe, expect, it} from 'vitest';
import {gearTrain} from '../../../../src/Components/Visuals/Physics/GearTrain';
import {pulleyForce, pulleyLayout} from '../../../../src/Components/Visuals/Physics/Pulley';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('pulley visual', () => {
	it('alternates upper and lower pulleys back from the free end and ties the rope where the count says', () => {
		const four = pulleyLayout(4);
		expect(four.pulleys.filter((pulley) => pulley.upper).map((pulley) => pulley.index)).toEqual([1, 3]);
		expect(four.anchor).toBe('ceiling');
		expect(four.lower).toBe(2);
		const three = pulleyLayout(3);
		expect(three.pulleys.filter((pulley) => pulley.upper).map((pulley) => pulley.index)).toEqual([0, 2]);
		expect(three.anchor).toBe('block');
		expect(pulleyLayout(1)).toMatchObject({anchor: 'load', lower: 0});
	});

	it('shares the load and the moving pulleys between the supporting ropes', () => {
		expect(pulleyForce({ropes: 1, load: 120})).toBe(120);
		expect(pulleyForce({ropes: 4, load: 120})).toBe(30);
		// A moving pulley of 20 N rides with a 100 N load on two ropes: (100 + 20) / 2.
		expect(pulleyForce({ropes: 2, load: 100, pulleyWeight: 20})).toBe(60);
		// One rope is a fixed pulley: its weight never adds to the pull.
		expect(pulleyForce({ropes: 1, load: 100, pulleyWeight: 20})).toBe(100);
	});
});

describe('gears visual', () => {
	it('turns meshing gears the other way at r₁/r₂, belts the same way, crossed belts the other way, an axle together', () => {
		const train = gearTrain([
			{radius: 2},
			{radius: 3, link: 'mesh'},
			{radius: 1, link: 'axle'},
			{radius: 3, link: 'mesh'},
			{radius: 2, link: 'crossed'},
		]);
		expect(train.map((wheel) => wheel.turns)).toEqual([1, -2 / 3, -2 / 3, 2 / 9, -1 / 3]);
		expect(train[1].x).toBe(5);
		expect(train[2].x).toBe(5);
		expect(train[3].x).toBe(9);
		expect(gearTrain([{radius: 1}, {radius: 2, link: 'belt'}])[1].turns).toBe(0.5);
	});

	it('refuses a driver with a link, a mesh without teeth and wheels that overlap', () => {
		const gears = (wheels: object[]) => CourseVisualSchema.parse({kind: 'gears', wheels});
		expect(() => gears([{label: 'K', radius: 1, link: 'mesh'}])).toThrow();
		expect(() => gears([{label: 'K', radius: 1, teeth: false}, {label: 'L', radius: 1, link: 'mesh'}])).toThrow();
		// L meshes with K to the right, M meshes with L back to the left: M lands on K.
		expect(() => gears([{label: 'K', radius: 2}, {label: 'L', radius: 1, link: 'mesh'}, {label: 'M', radius: 1, link: 'mesh', angle: 180}])).toThrow();
		expect(gears([{label: 'K', radius: 2}, {label: 'L', radius: 1, link: 'mesh'}]).kind).toBe('gears');
		// A compound train: N meshes with M riveted in front of L, so it may cross L.
		expect(gears([{label: 'K', radius: 2}, {label: 'L', radius: 3, link: 'mesh'}, {label: 'M', radius: 1, link: 'axle'}, {label: 'N', radius: 3, link: 'mesh'}]).kind).toBe('gears');
	});
});
