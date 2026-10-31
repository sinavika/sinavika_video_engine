import {describe, expect, it} from 'vitest';
import {beamVisible, settled} from '../../../../src/Components/Visuals/Chemistry/Tyndall';
import {CourseVisualSchema} from '../../../../src/Components/Visuals/VisualSchema';

describe('Tyndall visual', () => {
	it('shows the beam in a colloid and a suspension, not in a solution', () => {
		expect(beamVisible('solution')).toBe(false);
		expect(beamVisible('colloid')).toBe(true);
		expect(beamVisible('suspension')).toBe(true);
	});

	it('settles a suspension over time, never a colloid or a solution', () => {
		expect(settled('suspension', 0)).toBe(0);
		expect(settled('suspension', 3)).toBeGreaterThan(0);
		expect(settled('suspension', 60)).toBe(1);
		expect(settled('colloid', 60)).toBe(0);
		expect(settled('solution', 60)).toBe(0);
	});

	it('takes two or three beakers', () => {
		const beaker = {kind: 'solution', label: 'Şekerli su'};
		expect(CourseVisualSchema.safeParse({kind: 'tyndall', beakers: [beaker, {...beaker, kind: 'colloid', label: 'Süt'}]}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'tyndall', beakers: [beaker]}).success).toBe(false);
	});
});
