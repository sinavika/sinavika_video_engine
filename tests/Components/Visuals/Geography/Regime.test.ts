import {describe, expect, it} from 'vitest';
import {textWidth} from '../../../../src/Components/Visuals/FigureLabel';
import {SNOWMELT_MONTHS, legendRow, markLabelOffsets, regimeAxis, regimeSeries} from '../../../../src/Components/Visuals/Geography/Regime';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

// A snow-fed river of the east: its flow peaks in the spring melt and falls to its lowest at the end of summer.
const SNOW_FED = [30, 32, 45, 85, 100, 60, 30, 20, 17, 18, 22, 27];

describe('river regime', () => {
	it('draws a schematic river in percent of its own largest month', () => {
		const {values, high, low} = regimeSeries(SNOW_FED.map((value) => value * 7), 'relative');
		expect(Math.max(...values)).toBe(100);
		expect(values[0]).toBeCloseTo(30);
		expect(high).toBe(4); // Mayıs
		expect(low).toBe(8); // Eylül
	});

	it('keeps real figures as given and still finds the flood and the low water', () => {
		const flow = [120, 150, 400, 900, 1100, 600, 200, 90, 70, 80, 100, 110];
		const {values, high, low} = regimeSeries(flow, 'm3s');
		expect(values).toEqual(flow);
		expect(high).toBe(4);
		expect(low).toBe(8);
	});

	it('takes the first of equal months and survives a dry stream', () => {
		expect(regimeSeries([5, 9, 9, 1, 1, 3, 3, 3, 3, 3, 3, 3], 'relative').high).toBe(1);
		expect(regimeSeries([5, 9, 9, 1, 1, 3, 3, 3, 3, 3, 3, 3], 'relative').low).toBe(3);
		const dry = regimeSeries(Array(12).fill(0), 'relative');
		expect(dry.values.every((value) => value === 0)).toBe(true);
	});

	it('rounds the axis to at most five steps', () => {
		expect(regimeAxis(100)).toEqual({top: 100, step: 20});
		expect(regimeAxis(1100)).toEqual({top: 1250, step: 250});
		expect(regimeAxis(37)).toEqual({top: 40, step: 10});
		for (const largest of [7, 64, 333, 4200, 17000]) {
			const {top, step} = regimeAxis(largest);
			expect(top).toBeGreaterThanOrEqual(largest);
			expect(top / step).toBeLessThanOrEqual(5);
		}
	});

	it('lights the spring snowmelt in Mart, Nisan and Mayıs', () => {
		expect(SNOWMELT_MONTHS).toEqual([2, 3, 4]);
	});

	it('has twelve months per river, one to three rivers, and names its parts', () => {
		const visual = CourseVisualSchema.parse({kind: 'regime', rivers: [{name: 'Fırat', flow: SNOW_FED}, {name: 'Doğu Karadeniz deresi', flow: SNOW_FED}], snowmelt: true});
		expect(numberedPartNames(visual)).toEqual(['r1', 'r2', 'taskin', 'kurak', 'kar', 'kis', 'ilkbahar', 'yaz', 'sonbahar']);
		expect(CourseVisualSchema.safeParse({kind: 'regime', rivers: [{name: 'Fırat', flow: SNOW_FED.slice(1)}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'regime', rivers: []}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'regime', rivers: Array(4).fill({name: 'Fırat', flow: SNOW_FED})}).success).toBe(false);
	});

	it('moves a label up a line when an earlier river peaks in the same month at the same height', () => {
		expect(markLabelOffsets([{month: 4, y: 130}, {month: 4, y: 132}, {month: 10, y: 130}], 24)).toEqual([0, 24, 0]);
		expect(markLabelOffsets([{month: 4, y: 130}, {month: 4, y: 132}, {month: 4, y: 131}], 24)).toEqual([0, 24, 48]);
		// Same month but far apart: each label already has room.
		expect(markLabelOffsets([{month: 7, y: 200}, {month: 7, y: 480}], 24)).toEqual([0, 0]);
	});

	it('lays the legend out in one row, each name after the last, inside the chart’s width', () => {
		const names = ['Fırat (kar beslemeli)', 'Doğu Karadeniz deresi', 'Akdeniz kıyı akarsuyu'];
		const xs = legendRow(names, 120);
		expect(xs[0]).toBe(120);
		xs.slice(1).forEach((x, index) => expect(x).toBeGreaterThan(xs[index] + 38 + textWidth(names[index], 18, 700)));
		// The last name ends before the right edge of the 1000-wide world.
		expect(xs[2] + 38 + textWidth(names[2], 18, 700)).toBeLessThan(1000);
	});
});
