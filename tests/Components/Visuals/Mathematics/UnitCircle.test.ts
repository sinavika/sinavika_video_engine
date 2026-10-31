import {describe, expect, it} from 'vitest';
import {CourseVisualSchema, naturalAspect, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

describe('unit circle visual', () => {
	it('names its angles a1…, the quadrant signs, its lines and the wave, so beats can turn and point at them', () => {
		const visual = CourseVisualSchema.parse({kind: 'unitCircle', angles: [{degrees: 30, label: '30°'}, {degrees: 150}], signs: true, wave: 'sin'});
		expect(numberedPartNames(visual)).toEqual(['a1', 'a2', 'q1', 'q2', 'q3', 'q4', 'sin', 'cos', 'wave']);
		expect(naturalAspect(visual)).toBeGreaterThan(2);
	});

	it('draws sine and cosine by default and keeps a plain circle about square', () => {
		const visual = CourseVisualSchema.parse({kind: 'unitCircle', angles: [{degrees: -45}]});
		if (visual.kind !== 'unitCircle') throw new Error('not a unit circle');
		expect(visual.lines).toEqual(['sin', 'cos']);
		expect(numberedPartNames(visual)).toEqual(['a1', 'sin', 'cos']);
		expect(naturalAspect(visual)).toBeCloseTo(1.15);
	});

	it('takes one to four angles within two turns either way', () => {
		expect(CourseVisualSchema.safeParse({kind: 'unitCircle', angles: []}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'unitCircle', angles: [{degrees: 800}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'unitCircle', angles: [{degrees: 390}], lines: ['tan']}).success).toBe(true);
	});
});
