import {describe, expect, it} from 'vitest';
import {forceDirection} from '../../../../src/Components/Visuals/Physics/PlateForce';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('parallel plates visual', () => {
	it('pushes a positive charge along the field and a negative one against it', () => {
		// Upper plate positive: the field points down.
		expect(forceDirection('+', '+')).toBe(1);
		expect(forceDirection('+', '-')).toBe(-1);
		expect(forceDirection('-', '+')).toBe(-1);
	});

	it('holds an oil drop only when the electric force points up', () => {
		const plates = (particle: object) => CourseVisualSchema.parse({kind: 'parallelPlates', top: '+', particle});
		expect(() => plates({charge: '+', mode: 'balance'})).toThrow();
		expect(plates({charge: '-', mode: 'balance'}).kind).toBe('parallelPlates');
	});
});
