import {describe, expect, it} from 'vitest';
import {detailLines, labelSize} from '../../../../src/Components/Visuals/Structure/Hierarchy';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

const maslow = {
	kind: 'hierarchy',
	levels: [{label: 'Fizyolojik'}, {label: 'Güvenlik'}, {label: 'Ait olma ve sevgi'}, {label: 'Saygınlık'}, {label: 'Kendini gerçekleştirme'}],
	groups: [
		{label: 'Tüm canlılarda', from: 1, to: 2},
		{label: 'Yalnız insanda', from: 3, to: 5},
	],
};

describe('hierarchy visual', () => {
	it('is a pyramid by default and names its levels l1… and groups g1…', () => {
		const visual = CourseVisualSchema.parse(maslow);
		if (visual.kind !== 'hierarchy') throw new Error('not a hierarchy');
		expect(visual.shape).toBe('pyramid');
		expect(numberedPartNames(visual)).toEqual(['l1', 'l2', 'l3', 'l4', 'l5', 'g1', 'g2']);
	});

	it('keeps at least one level of an iceberg under the water', () => {
		const levels = [{label: 'Bilinç'}, {label: 'Bilinç öncesi'}, {label: 'Bilinçaltı'}];
		expect(CourseVisualSchema.safeParse({kind: 'hierarchy', shape: 'iceberg', above: 1, levels}).success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'hierarchy', shape: 'iceberg', above: 3, levels}).success).toBe(false);
	});

	it('refuses a group that runs backwards or past the last level', () => {
		expect(CourseVisualSchema.safeParse({...maslow, groups: [{label: 'Ters', from: 3, to: 2}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...maslow, groups: [{label: 'Taşan', from: 4, to: 6}]}).success).toBe(false);
	});

	it('cuts a long detail into two even lines, after a pause mark when one is near', () => {
		expect(detailLines('Potansiyelini tam olarak ortaya koymak')).toEqual(['Potansiyelini tam olarak ortaya koymak']);
		expect(detailLines('Merak, araştırma; bilime ve felsefeye ilgi duymak, sorgulamak')).toEqual(['Merak, araştırma; bilime ve', 'felsefeye ilgi duymak, sorgulamak']);
		const lines = detailLines('Farkında olmadığın istekler, duygular, anılar ve çocukluk yaşantıları');
		expect(lines).toHaveLength(2);
		expect(lines.every((line) => line.split(' ').length > 1)).toBe(true);
	});

	it('shrinks a long label to its band but never below 19', () => {
		expect(labelSize('Estetik', 800)).toBe(30);
		expect(labelSize('Kendini gerçekleştirme', 300)).toBeLessThan(30);
		expect(labelSize('Kendini gerçekleştirme', 100)).toBe(19);
	});
});
