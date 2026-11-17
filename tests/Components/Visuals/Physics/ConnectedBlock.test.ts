import {describe, expect, it} from 'vitest';
import {blockChain} from '../../../../src/Components/Visuals/Physics/BlockChain';
import {connectedBlocksStage} from '../../../../src/Components/Visuals/Physics/ConnectedBlock';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const visual = (input: Record<string, unknown>) => CourseVisualSchema.safeParse({kind: 'connectedBlocks', ...input});

describe('connected blocks (AYT FIZ_NEWTON, Quiz 14 Nov 2026)', () => {
	it('moves the row as one body and gives each rope the pull the blocks behind it need', () => {
		// Frictionless, 2 kg and 3 kg pulled by 30 N to the right: a = 6 m/s², the rope pulls 2 kg: T = 12 N.
		expect(blockChain({masses: [2, 3], force: 30, pull: 'right', friction: 0, g: 10})).toMatchObject({total: 5, moves: true, acceleration: 6, tensions: [12]});
		// Pulled to the left, the rope pulls the 3 kg block behind: T = 18 N.
		expect(blockChain({masses: [2, 3], force: 30, pull: 'left', friction: 0, g: 10}).tensions).toEqual([18]);
		// With friction μ = 0.2: a = (36 − 12) / 6 = 4; T = m_behind · (a + μg) = F · m_behind / M.
		const rough = blockChain({masses: [1, 2, 3], force: 36, pull: 'right', friction: 0.2, g: 10});
		expect(rough.acceleration).toBeCloseTo(4);
		expect(rough.tensions).toEqual([6, 18]);
		// Newton's second law holds for every block: net force = m · a.
		const masses = [1, 2, 3];
		const net = [rough.tensions[0] - 0.2 * 10 * 1, rough.tensions[1] - rough.tensions[0] - 0.2 * 10 * 2, 36 - rough.tensions[1] - 0.2 * 10 * 3];
		net.forEach((force, index) => expect(force).toBeCloseTo(masses[index] * rough.acceleration));
	});

	it('refuses a row the force cannot move and a wrong number of rope labels', () => {
		expect(visual({blocks: [{label: 'A', mass: 4}, {label: 'B', mass: 2}], force: 5, friction: 0.5}).success).toBe(false);
		expect(visual({blocks: [{label: 'A', mass: 4}, {label: 'B', mass: 2}], force: 20, tensionLabels: ['T₁', 'T₂']}).success).toBe(false);
		const parsed = visual({blocks: [{label: 'm₁', mass: 2}, {label: 'm₂', mass: 3}, {label: 'm₃', mass: 1}], force: 30});
		expect(parsed.success).toBe(true);
		if (parsed.success) expect(numberedPartNames(parsed.data)).toEqual(['b1', 'b2', 'b3', 'f', 't1', 't2', 'a']);
	});

	it('makes room for its labels: wider blocks for long names, F on the pulled side', () => {
		const parse = (input: Record<string, unknown>) => CourseVisualSchema.parse({kind: 'connectedBlocks', ...input}) as Parameters<typeof connectedBlocksStage>[0];
		const short = connectedBlocksStage(parse({blocks: [{label: 'A', mass: 1}, {label: 'B', mass: 1}], force: 10}));
		const long = connectedBlocksStage(parse({blocks: [{label: 'm₁ = 12 kg', mass: 12}, {label: 'B', mass: 1}], force: 10}));
		expect(long.blockWidth).toBeGreaterThan(short.blockWidth);
		expect(long.width).toBeGreaterThan(short.width);
	});
});
