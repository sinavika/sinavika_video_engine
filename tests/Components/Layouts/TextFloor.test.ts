import {describe, expect, it} from 'vitest';
import {floorFactor, floorForSpan, raisedPartSize, screenFontSize} from '../../../src/Components/Layouts/TextFloor';

describe("an app still's last guard of its smallest text", () => {
	it('measures a text as the frame shows it, through the transforms above it', () => {
		expect(screenFontSize(24, {a: 1, b: 0, c: 0, d: 1})).toBe(24);
		// A battle's world, 1600 units fitted into a still's 860: its 24-unit names came out at 12.9.
		expect(screenFontSize(24, {a: 0.5375, b: 0, c: 0, d: 0.5375})).toBeCloseTo(12.9, 6);
		// Turned a quarter (a vertical axis name) or squashed one way, a text keeps the size of its area.
		expect(screenFontSize(20, {a: 0, b: 1, c: -1, d: 0})).toBe(20);
		expect(screenFontSize(20, {a: 2, b: 0, c: 0, d: 0.5})).toBe(20);
	});

	it('raises only what is under the floor, and leaves a text drawn at no size alone', () => {
		expect(floorFactor(12.9, 20)).toBeCloseTo(20 / 12.9, 6);
		expect(floorFactor(20, 20)).toBe(1);
		// Rounding a hair under the floor is not a raise; a hundredth under it is.
		expect(floorFactor(19.995, 20)).toBe(1);
		expect(floorFactor(19.9, 20)).toBe(1);
		expect(floorFactor(19.7, 20)).toBeCloseTo(20 / 19.7, 6);
		expect(floorFactor(31, 20)).toBe(1);
		expect(floorFactor(0, 20)).toBe(1);
	});

	it('asks for bigger text when text past the box makes the still wider', () => {
		const cut = {minPx: 28, width: 1280, room: 20};
		// The box alone: 900 units to 1280 pixels, 28 pixels are 19.7 units.
		expect(floorForSpan(860, cut)).toBeCloseTo(19.69, 2);
		// A climate chart's axis names 60 units past either side.
		expect(floorForSpan(980, cut)).toBeCloseTo(22.31, 2);
	});

	it('keeps a small part of a text (an index, a charge) over the floor too', () => {
		// The text grows by 1.5: its index grows with it while that is enough …
		expect(raisedPartSize(20, 1.5, 20)).toBe(30);
		// … and goes to the floor when its share would stay under it (Xᴿ at 0.62 of a 25-unit text).
		expect(raisedPartSize(15.5, 1, 20)).toBe(20);
		expect(raisedPartSize(24, 1, 20)).toBe(24);
	});
});
