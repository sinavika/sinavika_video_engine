import {describe, expect, it} from 'vitest';
import {timelineDateText, timelineTime} from '../../../../src/Components/Visuals/Humanities/Timeline';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('timeline dates', () => {
	it('writes a bare year, a month or a full Turkish date', () => {
		expect(timelineDateText({year: 1071}, 'ce')).toBe('1071');
		expect(timelineDateText({year: -330}, 'ce')).toBe('MÖ 330');
		expect(timelineDateText({year: 622}, 'hijri')).toBe('622 H.');
		expect(timelineDateText({year: 1919, month: 9}, 'ce')).toBe('Eylül 1919');
		expect(timelineDateText({year: 1919, month: 5, day: 19}, 'ce')).toBe('19 Mayıs 1919');
	});

	it('places months inside their year, in order', () => {
		const samsun = timelineTime({year: 1919, month: 5, day: 19});
		const sivas = timelineTime({year: 1919, month: 9, day: 4});
		const pact = timelineTime({year: 1920, month: 1, day: 28});
		expect(samsun).toBeGreaterThan(1919.3);
		expect(samsun).toBeLessThan(1919.4);
		expect(samsun).toBeLessThan(sivas);
		expect(sivas).toBeLessThan(pact);
		expect(timelineTime({year: 1920})).toBeLessThan(pact);
	});

	it('accepts a month and day, and refuses a day without its month', () => {
		const dated = CourseVisualSchema.safeParse({kind: 'timeline', events: [{year: 1919, month: 5, day: 19, label: 'Samsun'}, {year: 1919, month: 9, label: 'Sivas'}]});
		expect(dated.success).toBe(true);
		const dayOnly = CourseVisualSchema.safeParse({kind: 'timeline', events: [{year: 1919, day: 19, label: 'Samsun'}, {year: 1920, label: 'Ankara'}]});
		expect(dayOnly.success).toBe(false);
		const badMonth = CourseVisualSchema.safeParse({kind: 'timeline', events: [{year: 1919, month: 13, label: 'Samsun'}, {year: 1920, label: 'Ankara'}]});
		expect(badMonth.success).toBe(false);
	});
});
