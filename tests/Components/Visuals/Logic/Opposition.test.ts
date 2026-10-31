import {describe, expect, it} from 'vitest';
import {OPPOSITION_RELATIONS, splitStatement} from '../../../../src/Components/Visuals/Logic/Opposition';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const square = {kind: 'opposition', a: 'Bütün öğrenciler çalışkandır.', e: 'Hiçbir öğrenci çalışkan değildir.', i: 'Bazı öğrenciler çalışkandır.', o: 'Bazı öğrenciler çalışkan değildir.'};

describe('opposition visual', () => {
	it('names its corners, relations and truth marks as parts', () => {
		const visual = CourseVisualSchema.parse(square);
		expect(numberedPartNames(visual)).toEqual(['a', 'e', 'i', 'o', 'karsitlik', 'altkarsitlik', 'altiklik', 'celisiklik', 'deger']);
	});

	it('takes truth marks D, Y and ? only', () => {
		expect(CourseVisualSchema.safeParse({...square, truth: {a: 'D', e: 'Y', i: 'D', o: 'Y'}}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({...square, truth: {a: '?'}}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({...square, truth: {a: 'doğru'}}).success).toBe(false);
	});

	it('draws contradiction across the square and subalternation down its sides', () => {
		const lines = Object.fromEntries(OPPOSITION_RELATIONS.map((relation) => [relation.id, relation.lines.map((line) => line.join(''))]));
		expect(lines.celisiklik).toEqual(['ao', 'ei']);
		expect(lines.altiklik).toEqual(['ai', 'eo']);
		expect(lines.karsitlik).toEqual(['ae']);
		expect(lines.altkarsitlik).toEqual(['io']);
	});

	it('writes a long proposition in two even lines', () => {
		expect(splitStatement('Bütün kuşlar uçar.')).toEqual(['Bütün kuşlar uçar.']);
		const lines = splitStatement('Hiçbir öğrenci çalışkan değildir.');
		expect(lines).toHaveLength(2);
		expect(Math.abs(lines[0].length - lines[1].length)).toBeLessThan(12);
	});
});
