import {describe, expect, it} from 'vitest';
import {worldRatio} from '../../../../src/Components/Visuals/CourseVisual';
import {regionOutline} from '../../../../src/Components/Visuals/Mathematics/Plot';
import {divisionCheck} from '../../../../src/Components/Visuals/Mathematics/LongDivision';
import {ladderResults} from '../../../../src/Components/Visuals/Mathematics/PrimeLadder';
import {slotsResult, slotsStages} from '../../../../src/Components/Visuals/Mathematics/CountingBoard';
import {areaLabels} from '../../../../src/Components/Visuals/Mathematics/AreaModel';
import {probabilityLine} from '../../../../src/Components/Visuals/Mathematics/SampleSpace';
import {mappingVerdicts} from '../../../../src/Components/Visuals/Mathematics/Mapping';
import {CourseVisualSchema, numberedPartNames, visualStages, type CourseVisual} from '../../../../src/Components/Visuals/VisualSchema';
import {visualKitOf} from '../../../../src/Courses/CourseDesign';

const parse = <K extends CourseVisual['kind']>(visual: {kind: K} & Record<string, unknown>) => CourseVisualSchema.parse(visual) as Extract<CourseVisual, {kind: K}>;
const refused = (visual: Record<string, unknown>) => !CourseVisualSchema.safeParse(visual).success;

/** One of each new teaching visual, as a script would write it (TYT Matematik, 9 Nov 2026). */
const SAMPLES: Record<string, Record<string, unknown>> = {
	signTable: {kind: 'signTable', points: [-1, 2], factors: [{expression: 'x+1', label: 'x + 1'}, {expression: 'x-2', label: 'x − 2'}], relation: '<'},
	longDivision: {kind: 'longDivision', dividend: 1749, divisor: 6},
	primeLadder: {kind: 'primeLadder', numbers: [24, 36]},
	barModel: {kind: 'barModel', bars: [{label: 'Kız', pieces: [{units: 1, label: 'x'}]}, {label: 'Anne', pieces: [{units: 1}, {units: 1}, {units: 1}]}], braces: [{bar: 1, from: 0, to: 2, label: '3x'}]},
	slots: {kind: 'slots', slots: [{label: 'Yüzler', count: 4}, {label: 'Onlar', count: 3}, {label: 'Birler', count: 2}], order: [2, 0, 1]},
	areaModel: {kind: 'areaModel', rows: [{label: 'x', size: 3}, {label: '2', size: 1}], columns: [{label: 'x', size: 3}, {label: '3', size: 1.5}], total: 'x² + 5x + 6'},
	sampleSpace: {kind: 'sampleSpace', cell: 'sum', events: [{of: 'sum', is: 'eq', value: 7, label: 'Toplam 7'}]},
	mapping: {kind: 'mapping', domain: {items: ['1', '2', '3']}, codomain: {items: ['a', 'b', 'c', 'd']}, arrows: [[0, 0], [1, 2], [2, 3]], properties: true},
};

describe('mathematics teaching visuals', () => {
	it.each(Object.keys(SAMPLES))('%s parses, names its parts and is drawn in a world of its own shape', (kind) => {
		const visual = CourseVisualSchema.parse(SAMPLES[kind]);
		const names = numberedPartNames(visual);
		expect(names?.length).toBeGreaterThan(0);
		expect(new Set(names).size).toBe(names?.length);
		const ratio = worldRatio(visual);
		expect(ratio).toBeGreaterThan(0.6);
		expect(ratio).toBeLessThan(4.5);
	});

	it('are all in the mathematics kit, so script writing starts from them', () => {
		expect(visualKitOf('MAT')).toEqual(expect.arrayContaining(Object.keys(SAMPLES)));
	});

	it('refuses a sign table whose points leave a factor changing sign inside an interval', () => {
		expect(refused({...SAMPLES.signTable, points: [-1]})).toBe(true);
		expect(refused({...SAMPLES.signTable, points: [2, -1]})).toBe(true);
		const issues = CourseVisualSchema.safeParse({...SAMPLES.signTable, points: [-1]}).error?.issues.map((issue) => issue.message).join(' ');
		expect(issues).toContain('x = 2');
	});

	it('refuses boards that cannot be drawn right', () => {
		expect(refused({...SAMPLES.slots, order: [0, 0, 1]})).toBe(true);
		expect(refused({...SAMPLES.slots, divideBy: {value: 5, label: '5'}})).toBe(true);
		expect(refused({...SAMPLES.barModel, braces: [{bar: 1, from: 0, to: 3, label: '3x'}]})).toBe(true);
		expect(refused({...SAMPLES.areaModel, cells: [['x²']]})).toBe(true);
		expect(refused({...SAMPLES.mapping, arrows: [[0, 7]]})).toBe(true);
		expect(refused({kind: 'longDivision', dividend: 123456789, divisor: 2})).toBe(true);
	});

	it('works out what it writes: the check line, EBOB and EKOK, the product, the areas, the probability, the verdicts', () => {
		expect(divisionCheck(parse({...SAMPLES.longDivision, kind: 'longDivision'}))).toBe('1749 = 6 · 291 + 3');
		expect(ladderResults(parse({...SAMPLES.primeLadder, kind: 'primeLadder'})).map((result) => result.text)).toEqual(['EBOB = 2 · 2 · 3 = 12', 'EKOK = 2 · 2 · 2 · 3 · 3 = 72']);
		expect(ladderResults(parse({kind: 'primeLadder', numbers: [60], show: 'powers'}))[0].text).toContain('60 = 2² · 3 · 5');
		expect(slotsResult(parse({...SAMPLES.slots, kind: 'slots'})).line).toBe('= 24');
		expect(slotsResult(parse({kind: 'slots', slots: [{count: 5}, {count: 4}, {count: 3}], divideBy: {value: 6, label: '3!'}})).line).toBe('= 60 ÷ 3! = 10');
		expect(areaLabels(parse({...SAMPLES.areaModel, kind: 'areaModel'}))).toEqual([
			['x²', '3x'],
			['2x', '6'],
		]);
		expect(probabilityLine(parse({...SAMPLES.sampleSpace, kind: 'sampleSpace'}), 0)).toBe('Toplam 7: 6/36 = 1/6');
		expect(mappingVerdicts(parse({...SAMPLES.mapping, kind: 'mapping'})).map((verdict) => `${verdict.holds ? '✓' : '✗'} ${verdict.text}`)).toEqual(['✓ Fonksiyon', '✓ Bire bir', '✗ Örten değil']);
	});

	it('plays the staged boards stage by stage, the restricted box first', () => {
		expect(visualStages(parse({...SAMPLES.longDivision, kind: 'longDivision'}))).toEqual(['1. adım', '2. adım', '3. adım', 'Sağlama']);
		expect(visualStages(parse({...SAMPLES.primeLadder, kind: 'primeLadder'}))).toEqual(['÷ 2', '÷ 2', '÷ 2', '÷ 3', '÷ 3', 'Sonuç']);
		expect(slotsStages(parse({...SAMPLES.slots, kind: 'slots'}))).toEqual(['Birler', 'Yüzler', 'Onlar', 'Sonuç']);
	});
});

describe('pointing at a part of a figure', () => {
	const plot = {kind: 'plot', x: [-1, 5], y: [-2, 8], curves: [{expression: '-(x-1)*(x-4)+2'}, {expression: '2'}], regions: [{from: 1, to: 4, between: [0, 1], label: 'f > g'}]};

	it('names a plot region z1 and its curves, points and segments', () => {
		const visual = CourseVisualSchema.parse({...plot, points: [{x: 1, y: 2}], segments: [{from: [0, 0], to: [1, 1]}]});
		expect(numberedPartNames(visual)).toEqual(['c1', 'c2', 'p1', 's1', 'z1']);
	});

	it('refuses a region that runs backwards or names a curve the plot does not have', () => {
		expect(refused({...plot, regions: [{from: 4, to: 1}]})).toBe(true);
		expect(refused({...plot, regions: [{from: 1, to: 4, curve: 2}]})).toBe(true);
		expect(refused({...plot, regions: [{from: 1, to: 4, curve: 0, between: [0, 1]}]})).toBe(true);
	});

	it('outlines a region between two curves, under one, or over the whole height', () => {
		const valueOf = (curve: number, x: number) => (curve === 0 ? -(x - 1) * (x - 4) + 2 : 2);
		const between = regionOutline({from: 1, to: 4, between: [0, 1]}, valueOf, [-2, 8], 6);
		expect(between).toHaveLength(14);
		expect(between[3]).toEqual([2.5, 4.25]);
		expect(between.at(-1)).toEqual([1, 2]);
		const under = regionOutline({from: 0, to: 2, curve: 1}, valueOf, [-2, 8], 2);
		expect(under).toEqual([[0, 0], [0, 2], [1, 2], [2, 2], [2, 0]]);
		expect(regionOutline({from: 0, to: 1}, valueOf, [-2, 8])).toEqual([[0, -2], [0, 8], [1, 8], [1, -2]]);
	});

	it('names every cell of a table (r2c3) besides its rows and columns', () => {
		const names = numberedPartNames(CourseVisualSchema.parse({kind: 'table', header: ['a', 'b'], rows: [['1', '2'], ['3', '4']]}));
		expect(names).toEqual(['r1', 'r2', 'col1', 'col2', 'r1c1', 'r1c2', 'r2c1', 'r2c2']);
	});
});
