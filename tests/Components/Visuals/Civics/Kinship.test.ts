import {describe, expect, it} from 'vitest';
import {KINSHIP_ROLES} from '../../../../src/Components/Visuals/Civics/CivicsSchema';
import {kinshipCaption, kinshipDegree} from '../../../../src/Components/Visuals/Civics/Kinship';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

describe('kinship degree, as the Medeni Kanun counts it', () => {
	it('counts one degree for every birth, up to the common ancestor and down again', () => {
		const degree = (role: Parameters<typeof kinshipDegree>[0]) => {
			const result = kinshipDegree(role);
			return [result.degree, result.line, result.kind];
		};
		expect(degree('baba')).toEqual([1, 'üstsoy', 'kan']);
		expect(degree('dede')).toEqual([2, 'üstsoy', 'kan']);
		expect(degree('cocuk')).toEqual([1, 'altsoy', 'kan']);
		expect(degree('torun')).toEqual([2, 'altsoy', 'kan']);
		expect(degree('kardes')).toEqual([2, 'yansoy', 'kan']);
		expect(degree('yegen')).toEqual([3, 'yansoy', 'kan']);
		expect(degree('amca')).toEqual([3, 'yansoy', 'kan']);
		expect(degree('kuzen')).toEqual([4, 'yansoy', 'kan']);
	});

	it('makes the spouse no relative and her blood relatives relatives by marriage, in the same line and degree', () => {
		expect(kinshipDegree('es').kind).toBe('yok');
		expect(kinshipCaption(kinshipDegree('es'))).toBe('Eş: hısım değil');
		expect(kinshipDegree('kayinpeder')).toMatchObject({kind: 'kayın', degree: 1, line: 'üstsoy'});
		expect(kinshipDegree('esinKardesi')).toMatchObject({kind: 'kayın', degree: 2, line: 'yansoy'});
		// The marriage is a step on the path, but it is not counted.
		expect(kinshipDegree('esinKardesi').steps[0]).toEqual(['ego', 'es']);
		expect(kinshipDegree('esinKardesi').counted).toBe(2);
	});

	it('names a half sibling’s line half blood: the half sister’s son is a third-degree half-blood collateral (ÖSYM 2013)', () => {
		expect(kinshipCaption(kinshipDegree('yegen', true))).toBe('3. derece yansoy yarım kan hısmı');
		expect(kinshipCaption(kinshipDegree('kardes', true))).toBe('2. derece yansoy yarım kan hısmı');
		// Lines that do not pass through the sibling stay full blood.
		expect(kinshipDegree('kuzen', true).half).toBe(false);
		expect(kinshipCaption(kinshipDegree('kuzen'))).toBe('4. derece yansoy kan hısmı');
	});

	it('walks a path that joins up: each step starts where the last one ended, from ego to the person', () => {
		for (const role of KINSHIP_ROLES.filter((item) => item !== 'ego')) {
			const steps = kinshipDegree(role).steps;
			expect(steps[0][0]).toBe('ego');
			expect(steps[steps.length - 1][1]).toBe(role);
			steps.slice(1).forEach(([from], index) => expect(from).toBe(steps[index][1]));
		}
	});

	it('names its people as parts and refuses a tree that hides someone a shown person hangs on', () => {
		const visual = CourseVisualSchema.parse({kind: 'kinship', hide: ['kuzen', 'amca']});
		expect(numberedPartNames(visual)).not.toContain('kuzen');
		expect(numberedPartNames(visual)).toContain('yegen');
		expect(CourseVisualSchema.safeParse({kind: 'kinship', hide: ['kardes']}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'kinship', hide: ['es']}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'kinship', hide: ['es', 'kayinpeder', 'esinKardesi']}).success).toBe(true);
	});
});
