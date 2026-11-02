import {describe, expect, it} from 'vitest';
import {conceptColumns} from '../../../src/Components/Illustrations/ConceptMap';

describe('concept map columns', () => {
	it('sets an even number of nodes in two columns against the edges, clockwise, clear of the hub in the middle', () => {
		const positions = conceptColumns(4, 1000, 600, 300);
		expect(positions).toEqual([
			[850, 150],
			[850, 450],
			[150, 450],
			[150, 150],
		]);
		// The hub's half of the width between the columns stays free.
		for (const [x] of positions) expect(Math.abs(x - 500) - 150).toBeGreaterThanOrEqual(200);
		expect(conceptColumns(2, 1000, 600, 300)).toEqual([
			[850, 300],
			[150, 300],
		]);
	});
});
