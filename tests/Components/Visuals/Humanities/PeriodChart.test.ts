import {describe, expect, it} from 'vitest';
import {periodMarkRows, periodRange, periodsLayout, periodTicks, periodYear} from '../../../../src/Components/Visuals/Humanities/PeriodChart';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const TURKS = {
	kind: 'periods',
	periods: [
		{from: -220, to: 216, label: 'Asya Hun'},
		{from: 552, to: 744, label: 'Göktürk'},
		{from: 744, to: 840, label: 'Uygur'},
		{from: 840, to: 1212, label: 'Karahanlı'},
	],
	marks: [{year: 751, label: 'Talas'}],
};

describe('period chart', () => {
	it('writes years as Turkish history books do, across the turn of the era', () => {
		expect(periodYear(-220)).toBe('MÖ 220');
		expect(periodRange(-220, 216)).toBe('MÖ 220 – MS 216');
		expect(periodRange(-209, -174)).toBe('MÖ 209 – 174');
		expect(periodRange(552, 744)).toBe('552 – 744');
	});

	it('puts round years on the axis, never the year 0, and no more than asked', () => {
		const ticks = periodTicks(-250, 1250, 7);
		expect(ticks.length).toBeLessThanOrEqual(7);
		expect(ticks).not.toContain(0);
		expect(ticks.every((year) => year % 250 === 0)).toBe(true);
		expect(periodTicks(1299, 1453, 7)).toEqual([1300, 1325, 1350, 1375, 1400, 1425, 1450]);
	});

	it('draws each period from its first year to its last, in order, its name inside when it fits', () => {
		const visual = CourseVisualSchema.parse(TURKS);
		if (visual.kind !== 'periods') throw new Error('expected periods');
		const layout = periodsLayout(visual, 1600, 700, (value) => value);
		layout.rows.forEach((row, index) => {
			expect(row.x0).toBeCloseTo(layout.x(visual.periods[index].from), 9);
			expect(row.x1).toBeGreaterThan(row.x0);
			if (index > 0) expect(row.y).toBeGreaterThan(layout.rows[index - 1].y);
		});
		// Göktürk ends where Uygur begins (744); Asya Hun is long enough for its name inside, Uygur's 96 years are not.
		expect(layout.rows[1].x1).toBeCloseTo(layout.rows[2].x0, 9);
		expect(layout.rows[0].place).toBe('inside');
		expect(layout.rows[2].place).not.toBe('inside');
		expect(layout.rows[0].second).toBe('MÖ 220 – MS 216');
		expect(numberedPartNames(visual)).toEqual(['p1', 'p2', 'p3', 'p4', 'm1']);
	});

	it('moves a few periods to the middle of a tall figure, their mark names still above them', () => {
		const economy = CourseVisualSchema.parse({kind: 'periods', periods: [{from: 1923, to: 1929, label: 'Özel girişim'}, {from: 1930, to: 1938, label: 'Devletçilik'}], marks: [{year: 1923, label: 'İzmir İktisat Kongresi'}, {year: 1934, label: 'I. Beş Yıllık Plan'}]});
		if (economy.kind !== 'periods') throw new Error('expected periods');
		const height = 900;
		const layout = periodsLayout(economy, 1600, height, (value) => value);
		const last = layout.rows[layout.rows.length - 1];
		const above = layout.rows[0].y - layout.top;
		const below = layout.axisY - (last.y + last.height);
		// Not crowded at the top with the lower half empty: the space under the bars is no more than the room above them.
		expect(layout.top).toBeGreaterThan(200);
		expect(below).toBeLessThan(layout.top + above);
		expect(layout.top).toBeLessThan(layout.rows[0].y);
		// A crowded chart still starts right under its mark names.
		const turks = CourseVisualSchema.parse(TURKS);
		if (turks.kind !== 'periods') throw new Error('expected periods');
		expect(periodsLayout(turks, 1600, 700, (value) => value).top).toBeLessThan(120);
	});

	it('refuses a period that ends before it begins and a mark outside the periods', () => {
		expect(CourseVisualSchema.safeParse({...TURKS, periods: [{from: 744, to: 552, label: 'Göktürk'}, {from: 744, to: 840, label: 'Uygur'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...TURKS, marks: [{year: 1453, label: 'İstanbul'}]}).success).toBe(false);
	});

	it('puts a mark label that would run into the one before it a row higher', () => {
		const x = (year: number) => year;
		const span = () => 60;
		// 1040 and 1071 are 31 apart; labels 60 wide overlap: the second goes up a row. 1200 is clear again.
		expect(periodMarkRows([{year: 1040, label: 'Dandanakan'}, {year: 1071, label: 'Malazgirt'}, {year: 1200, label: 'Son'}], x, span)).toEqual([0, 1, 0]);
		expect(periodMarkRows([{year: 375, label: 'A'}, {year: 744, label: 'B'}], x, span)).toEqual([0, 0]);
	});
});
