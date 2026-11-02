import {describe, expect, it} from 'vitest';
import {hemicycleSeats, legendCount, roomLayout, roomSides} from '../../../../src/Components/Visuals/Structure/Assembly';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

describe('assembly visual', () => {
	it('lays 600 seats in arcs, every one inside the half disc and none on top of another', () => {
		const {seats, seatRadius} = hemicycleSeats(600);
		expect(seats).toHaveLength(600);
		expect(new Set(seats.map((seat) => seat.row)).size).toBeGreaterThan(5);
		for (const seat of seats) {
			expect(Math.hypot(seat.x, seat.y)).toBeLessThanOrEqual(1 + 1e-9);
			expect(seat.y).toBeGreaterThanOrEqual(-1e-9);
		}
		// Seats keep apart: the closest two are at least two seat radii from centre to centre.
		let closest = Infinity;
		for (let a = 0; a < seats.length; a++) for (let b = a + 1; b < seats.length; b++) closest = Math.min(closest, Math.hypot(seats[a].x - seats[b].x, seats[a].y - seats[b].y));
		expect(closest).toBeGreaterThanOrEqual(2 * seatRadius - 1e-9);
		// Left to right, so a group that takes the next run of seats sits in one wedge.
		for (let index = 1; index < seats.length; index++) expect(seats[index].angle).toBeGreaterThanOrEqual(seats[index - 1].angle);
	});

	it('puts a small council on one arc', () => {
		const {seats} = hemicycleSeats(15);
		expect(seats).toHaveLength(15);
		expect(new Set(seats.map((seat) => seat.row))).toEqual(new Set([0]));
		expect(seats[0].x).toBeLessThan(0);
		expect(seats[14].x).toBeGreaterThan(0);
	});

	it('seats the first group in the middle of the back wall and the others to its right and left in turn', () => {
		expect(roomSides([{}, {}, {}, {}, {side: 'left'}])).toEqual(['center', 'right', 'left', 'right', 'left']);
	});

	it('gives each group in a room its own stretch of wall, wide enough for its name, and moves it down the side wall when the back wall is full', () => {
		const groups = [{seats: 1}, {seats: 4}, {seats: 2}, {seats: 2}, {seats: 1}, {seats: 1, side: 'left' as const}];
		const space = {backHalf: 430, sideLength: 500, pitch: 70, labelDepth: 90, gap: 30};
		const {distances, reach} = roomLayout(groups, [190, 200, 190, 200, 180, 170], space);
		expect(distances[0]).toEqual([0]);
		// The right side: the four vezirs on the back wall, the defterdars further on, past the corner.
		expect(Math.max(...distances[1])).toBeLessThanOrEqual(space.backHalf);
		expect(Math.min(...distances[3])).toBeGreaterThan(space.backHalf + space.labelDepth - 1);
		// The left side runs the other way.
		for (const index of [2, 4, 5]) expect(Math.max(...distances[index])).toBeLessThan(0);
		// Within a side no two seats are closer than a pitch.
		for (const side of [[1, 3], [2, 4, 5]]) {
			const all = side.flatMap((index) => distances[index]).map(Math.abs).sort((a, b) => a - b);
			for (let index = 1; index < all.length; index++) expect(all[index] - all[index - 1]).toBeGreaterThanOrEqual(space.pitch - 1e-9);
		}
		expect(reach).toBeLessThanOrEqual(space.backHalf + space.sideLength);
	});

	it('starts a side wall below the back wall’s names also when the back wall ends right at the corner', () => {
		// The vezirs' stretch reaches just past the corner: the defterdars used to sit there, their names on the vezirs'.
		const groups = [{seats: 1}, {seats: 4}, {seats: 2}, {seats: 2}];
		const space = {backHalf: 380, sideLength: 600, pitch: 70, labelDepth: 120, gap: 30};
		const {distances} = roomLayout(groups, [190, 200, 190, 200], space);
		// The vezirs stay on the back wall, their stretch ending just past the corner (110 + 280 = 390).
		expect(Math.max(...distances[1])).toBeLessThanOrEqual(space.backHalf);
		// The first defterdar sits a whole name block below the corner.
		expect(Math.min(...distances[3])).toBeGreaterThanOrEqual(space.backHalf + space.labelDepth);
	});

	it('counts a threshold hemicycle cumulatively: TBMM’s 200, 301, 360, 400 and all 600', () => {
		const groups = [{seats: 200}, {seats: 101}, {seats: 59}, {seats: 40}, {seats: 200}];
		expect(groups.map((_, index) => legendCount(groups, index, true))).toEqual([200, 301, 360, 400, 600]);
		expect(groups.map((_, index) => legendCount(groups, index, false))).toEqual([200, 101, 59, 40, 200]);
		expect(CourseVisualSchema.parse({kind: 'assembly', groups: [{name: 'A', seats: 3}]})).toMatchObject({cumulative: false});
	});

	it('names its parts g1… and head, and keeps a room to 30 seats', () => {
		const visual = CourseVisualSchema.parse({kind: 'assembly', layout: 'room', head: {label: 'Padişah'}, groups: [{name: 'Sadrazam', seats: 1}, {name: 'Vezirler', seats: 4}]});
		expect(numberedPartNames(visual)).toEqual(['g1', 'g2', 'head']);
		expect(CourseVisualSchema.safeParse({kind: 'assembly', layout: 'room', groups: [{name: 'Çok', seats: 31}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'assembly', groups: [{name: 'TBMM', seats: 600}]}).success).toBe(true);
	});
});
