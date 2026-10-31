import {describe, expect, it} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MathExpression} from '../../../../src/Components/Typography/MathExpression';
import {tickMarks, tickShares} from '../../../../src/Components/Visuals/Mathematics/Geometry';
import {plotArea} from '../../../../src/Components/Visuals/Mathematics/Plot';
import {placeLabel, pointSpots, type LabelBox} from '../../../../src/Components/Visuals/Mathematics/FigureLabel';
import {coneNetPoints, solidMarks, solidSize} from '../../../../src/Components/Visuals/Three/Solid';
import {CourseVisualSchema, circuitLayout, naturalAspect, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';
import {capillaryShares} from '../../../../src/Components/Visuals/Physics/Capillary';
import {chargeSigns} from '../../../../src/Components/Visuals/Physics/Charges';
import {vesselHalfWidth} from '../../../../src/Components/Visuals/Physics/Tank';
import {findLatexError, normalizeLatex, parseRichText} from '../../../../src/Schemas/RichText';
import {toSpokenText} from '../../../../src/Schemas/SpokenText';

describe('geometry figures', () => {
	it('sets a typed degree sign as a superscript circle, also after an exponent', () => {
		expect(normalizeLatex('x = 40° + 35°')).toBe('x = 40{}^{\\circ} + 35{}^{\\circ}');
		expect(findLatexError(normalizeLatex('a^2° + 180° - x'))).toBeNull();
		// A degree sign inside a unit written as text stays a glyph: a superscript there is a KaTeX error (FIZ 5).
		expect(normalizeLatex('c = 1 \\text{ cal/g°C}, 40°')).toBe('c = 1 \\text{ cal/g°C}, 40{}^{\\circ}');
		expect(findLatexError(normalizeLatex('c = 1 \\text{ cal/g°C}'))).toBeNull();
		const [segment] = parseRichText('$180° - a$');
		expect(segment).toEqual({kind: 'math', value: '180{}^{\\circ} - a'});
	});

	it('sets words with Turkish letters inside a formula upright as text, once', () => {
		expect(normalizeLatex('Ç(AEF) = |AE| + |EF|')).toBe('\\text{Ç}(AEF) = |AE| + |EF|');
		expect(normalizeLatex('F_k = V_{batan} \\cdot d_{sıvı} \\cdot g')).toBe('F_k = V_{batan} \\cdot d_{\\text{sıvı}} \\cdot g');
		expect(normalizeLatex(normalizeLatex('d_{yağ} = 800 \\text{ kg/m}^3'))).toBe('d_{\\text{yağ}} = 800 \\text{ kg/m}^3');
		expect(normalizeLatex('\\frac{Ç(ABC)}{Ç(DEF)} = \\frac{3}{2}')).toBe('\\frac{\\text{Ç}(ABC)}{\\text{Ç}(DEF)} = \\frac{3}{2}');
		expect(findLatexError(normalizeLatex('\\frac{D_{küçük}}{D_{büyük}} = 3'))).toBeNull();
	});

	it('reads angle names and degree fractions the way a teacher says them', () => {
		expect(toSpokenText('$m(\\widehat{BAC}) = 50°$')).toBe('B A C açısı eşittir 50 derece');
		expect(toSpokenText('$90° - \\frac{50°}{2}$')).toBe('90 derece eksi 50 derece bölü 2');
	});

	it('gives a root room after it, so an option like 3√2 fits its own box', () => {
		const root = renderToStaticMarkup(React.createElement(MathExpression, {latex: '3\\sqrt{2}'}));
		const plain = renderToStaticMarkup(React.createElement(MathExpression, {latex: 'x + 2'}));
		expect(root).toContain('padding-right:0.15em');
		expect(renderToStaticMarkup(React.createElement(MathExpression, {latex: 'd_K > d_L > d_M'}))).toContain('padding-right:0.15em');
		expect(plain).not.toContain('padding-right');
	});

	it('lets a helper point hide entirely or keep its name without a dot', () => {
		const visual = CourseVisualSchema.parse({
			kind: 'geometry',
			view: [0, 0, 4, 4],
			points: [
				{id: 'A', at: [0, 0]},
				{id: 'P', at: [4, 0], hidden: true},
				{id: 'Q', at: [4, 4], label: 'd1', dot: false},
			],
			segments: [{from: 'A', to: 'P'}],
		});
		if (visual.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(visual.points.map((point) => [point.id, point.hidden, point.dot])).toEqual([
			['A', false, true],
			['P', true, true],
			['Q', false, false],
		]);
	});

	it('marks equal sides with short strokes across their middle', () => {
		const visual = CourseVisualSchema.parse({kind: 'geometry', view: [0, 0, 4, 4], points: [{id: 'A', at: [0, 0]}, {id: 'B', at: [4, 0]}], segments: [{from: 'A', to: 'B', ticks: 2}]});
		if (visual.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(visual.segments[0].ticks).toBe(2);
		expect(() => CourseVisualSchema.parse({kind: 'geometry', view: [0, 0, 4, 4], points: [{id: 'A', at: [0, 0]}], segments: [{from: 'A', to: 'A', ticks: 4}]})).toThrow();
		// Two vertical strokes on a horizontal side, centred on its middle (x = 50), 10 apart.
		expect(tickMarks([0, 0], [100, 0], 2, 6, 10)).toBe('M45 -6 L45 6 M55 -6 L55 6');
		expect(tickMarks([0, 0], [0, 100], 1, 6, 10)).toBe('M6 50 L-6 50');
	});

	it('refuses a figure that names a point it does not have', () => {
		const figure = {kind: 'geometry', view: [0, 0, 4, 4], points: [{id: 'A', at: [0, 0]}, {id: 'B', at: [4, 0]}]};
		expect(CourseVisualSchema.safeParse({...figure, segments: [{from: 'A', to: 'B'}], circles: [{center: 'A', radius: 1}]}).success).toBe(true);
		// A circle round a centre that is not a point was drawn at the top left corner, over the question.
		expect(CourseVisualSchema.safeParse({...figure, circles: [{center: 'O', radius: 1}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...figure, segments: [{from: 'A', to: 'C'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...figure, angles: [{at: 'A', from: 'B', to: 'X'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...figure, polygons: [{points: ['A', 'B', 'Z']}]}).success).toBe(false);
	});

	it('slides the marks of two equal sides apart when they meet at a narrow corner', () => {
		// BC and BD leave B 20° apart; their middles are close, so BD's marks move further along BD.
		const bd: [number, number] = [100 * Math.cos(Math.PI / 9), 100 * Math.sin(Math.PI / 9)];
		const shares = tickShares([{from: [0, 0], to: [100, 0], ticks: 2}, {from: [0, 0], to: bd, ticks: 2}, {from: [0, 0], to: [0, 100], ticks: 0}], 30);
		expect(shares[0]).toBe(0.5);
		expect(shares[1]).not.toBe(0.5);
		expect(Math.hypot(bd[0] * shares[1] - 50, bd[1] * shares[1])).toBeGreaterThanOrEqual(30);
		expect(shares[2]).toBe(0.5);
		// Far apart sides keep their middles.
		expect(tickShares([{from: [0, 0], to: [100, 0], ticks: 1}, {from: [0, 0], to: [0, 100], ticks: 1}], 30)).toEqual([0.5, 0.5]);
	});

	it('draws an equal-scale plot with one unit equally long on both axes, centred in its box', () => {
		const area = plotArea({x: [-1, 8], y: [-1, 8], equalScale: true}, 1000, 700, {left: 80, right: 20, top: 20, bottom: 60});
		const unitX = (area.right - area.left) / 9;
		const unitY = (area.bottom - area.top) / 9;
		expect(unitX).toBeCloseTo(unitY, 6);
		expect((area.left - 80 + 1000 - 20 - area.right) / 2).toBeCloseTo(area.left - 80, 6);
		expect(plotArea({x: [-1, 8], y: [-1, 8], equalScale: false}, 1000, 700, {left: 80, right: 20, top: 20, bottom: 60})).toEqual({left: 80, right: 980, top: 20, bottom: 640});
	});

	it('knows which figures are tall, so a visual card puts them beside its text', () => {
		const square = CourseVisualSchema.parse({kind: 'plot', x: [-1, 8], y: [-1, 8], equalScale: true});
		const free = CourseVisualSchema.parse({kind: 'plot', x: [-1, 8], y: [-1, 8]});
		const triangle = CourseVisualSchema.parse({kind: 'geometry', view: [0, 0, 6, 4], points: [{id: 'A', at: [0, 0]}]});
		expect(naturalAspect(square)).toBe(1);
		expect(naturalAspect(free)).toBeUndefined();
		expect(naturalAspect(triangle)).toBe(1.5);
	});

	it('moves a point label off a line that runs through its usual corner', () => {
		// A line rising to the upper right through the point covers the up-right spot; the label goes elsewhere.
		const line: [number, number][] = Array.from({length: 60}, (_, index) => [index * 10, 300 - index * 10]);
		const spots = pointSpots([100, 200], 80, 28, 16);
		const bounds: LabelBox = [0, 0, 600, 400];
		expect(placeLabel(spots, [], [], bounds)).toEqual(spots[0]);
		expect(placeLabel(spots, line, [], bounds)).not.toEqual(spots[0]);
		const placed = placeLabel(spots, line, [], bounds);
		expect(line.some(([x, y]) => x > placed[0] && x < placed[2] && y > placed[1] && y < placed[3])).toBe(false);
	});

	it('unrolls a cone into a sector of radius ℓ and angle 360° · r / ℓ, the base disc touching its arc', () => {
		const closed = coneNetPoints(3, 4, 0);
		expect(closed.apex).toEqual([0, 4, 0]);
		for (const [x, y, z] of closed.base) {
			expect(Math.hypot(x, z)).toBeCloseTo(3, 9);
			expect(y).toBe(0);
		}
		const open = coneNetPoints(3, 4, 1);
		expect(open.slant).toBe(5);
		expect((open.sector * 180) / Math.PI).toBeCloseTo(216, 9);
		const away = (p: readonly number[]) => Math.hypot(p[0] - open.apex[0], p[1] - open.apex[1], p[2] - open.apex[2]);
		for (const point of open.base) expect(away(point)).toBeCloseTo(5, 9);
		const [first, last] = [open.base[0], open.base[open.base.length - 1]];
		const turn = Math.abs(Math.atan2(last[2] - open.apex[2], last[0] - open.apex[0]) - Math.atan2(first[2] - open.apex[2], first[0] - open.apex[0]));
		expect(Math.min(turn, 2 * Math.PI - turn)).toBeCloseTo(2 * Math.PI - open.sector, 9);
		expect(away(open.disc)).toBeCloseTo(5 + 3, 9);
		expect([open.apex[1], open.disc[1], ...open.base.map((point) => point[1])].every((y) => y === 0)).toBe(true);
	});

	it('draws a solid in the proportions of its numbers', () => {
		const box = solidSize({shape: 'cuboid', size: [5, 3, 2]}) as {a: number; b: number; c: number};
		expect(box.a / box.c).toBeCloseTo(2.5, 6);
		expect(box.b / box.c).toBeCloseTo(1.5, 6);
		const cone = solidSize({shape: 'cone', size: [3, 4]}) as {r: number; h: number};
		expect(cone.h / cone.r).toBeCloseTo(4 / 3, 6);
	});

	it('writes the measures on a solid: the cone and the pyramid show their right triangle', () => {
		const cone = solidMarks({shape: 'cone', size: [3, 4], dimensions: ['r', 'h', 'ℓ'], diagonal: undefined});
		expect(cone.map((mark) => mark.label)).toEqual(['r', 'h', 'ℓ']);
		// r and ℓ meet at the same point of the rim; h and ℓ start at the apex.
		expect(cone[0].to).toEqual(cone[2].to);
		expect(cone[1].from).toEqual(cone[2].from);
		const pyramid = solidMarks({shape: 'squarePyramid', size: [6, 4], dimensions: ['a', 'h', "h'"], diagonal: undefined});
		expect(pyramid.filter((mark) => mark.from)).toHaveLength(3);
		const cube = solidMarks({shape: 'cube', size: undefined, dimensions: ['a'], diagonal: 'a√3'});
		expect(cube.map((mark) => mark.label)).toEqual(['a', 'a', 'a', 'a√3']);
	});

	it('names the arrows of a vectors figure v1, v2… and keeps its grid square', () => {
		const visual = CourseVisualSchema.parse({kind: 'vectors', view: [0, 0, 11.5, 7], vectors: [{from: [1, 5], to: [4, 5], label: 'a'}, {from: [4, 3], to: [1, 3], label: 'e = −a'}]});
		expect(numberedPartNames(visual)).toEqual(['v1', 'v2']);
		expect(naturalAspect(visual)).toBeCloseTo(11.5 / 7, 6);
	});

	it('lays a circuit out from its structure and names its elements in reading order', () => {
		const visual = CourseVisualSchema.parse({kind: 'circuit', items: [{kind: 'lamp', label: 'X'}, {parallel: [[{kind: 'lamp', label: 'Y'}], [{kind: 'switch'}, {kind: 'lamp', label: 'Z'}]]}]});
		expect(numberedPartNames(visual)).toEqual(['e1', 'e2', 'e3', 'e4']);
		const layout = circuitLayout(visual.kind === 'circuit' ? visual.items : []);
		expect(layout.rows).toBe(2);
		expect(layout.widths).toEqual([1, 2.7]);
		expect(naturalAspect(visual)).toBeCloseTo(layout.span / layout.tall, 6);
	});

	it('draws the physics figures by their rules: capillary rise, vessel shapes, induced charges', () => {
		// The narrowest tube changes most, inversely as the diameter.
		expect(capillaryShares([1, 2, 4])).toEqual([1, 0.5, 0.25]);
		// A flared vessel widens upwards, a tapered one narrows.
		expect(vesselHalfWidth('flared', 1)).toBeGreaterThan(vesselHalfWidth('flared', 0));
		expect(vesselHalfWidth('tapered', 1)).toBeLessThan(vesselHalfWidth('tapered', 0));
		// Induction: the near side takes the given sign, the far side the other; a neutral body alone shows no signs.
		const induced = chargeSigns('sphere', 'neutral', {side: 'left', sign: 'negative'}, 100);
		expect(induced.filter((mark) => mark.x < 0).every((mark) => mark.sign === 'negative')).toBe(true);
		expect(induced.filter((mark) => mark.x > 0).every((mark) => mark.sign === 'positive')).toBe(true);
		expect(chargeSigns('sphere', 'neutral', undefined, 100)).toEqual([]);
	});
});

describe('plot axes', () => {
	it('draws axes through the origin unless a measured graph asks for the edges', () => {
		const base = {kind: 'plot', x: [0, 20], y: [-40, 140]} as const;
		const origin = CourseVisualSchema.parse(base);
		const edge = CourseVisualSchema.parse({...base, axes: 'edge'});
		expect(origin.kind === 'plot' && origin.axes).toBe('origin');
		expect(edge.kind === 'plot' && edge.axes).toBe('edge');
		expect(() => CourseVisualSchema.parse({...base, axes: 'middle'})).toThrow();
	});
});

describe('stack', () => {
	it('keeps a tiny share visible as a sliver and the row full', async () => {
		const {stackWidths} = await import('../../../../src/Components/Visuals/Structure/Stack');
		const widths = stackWidths([97, 2.07, 0.9, 0.03], 670);
		expect(Math.abs(widths.reduce((sum, width) => sum + width, 0) - 670)).toBeLessThan(1e-9);
		expect(widths[3]).toBeGreaterThan(5);
		expect(stackWidths([0, 69, 30, 1], 670)[0]).toBe(0);
	});
	it('lays the legend by name width and widens with a wide box', async () => {
		const {stackFrame, stackLegend} = await import('../../../../src/Components/Visuals/Structure/Stack');
		const names = ['tuzlu su', 'buzul ve buz', 'yer altı suyu', 'göl ve akarsu'];
		const legend = stackLegend(names);
		expect(legend.lines).toBe(1);
		for (let index = 1; index < names.length; index++) expect(legend.places[index].x).toBeGreaterThan(legend.places[index - 1].x);
		const narrow = stackFrame(names, 2, 1);
		const wide = stackFrame(names, 2, 4);
		expect(narrow.viewWidth).toBe(1000);
		expect(wide.viewWidth).toBeGreaterThan(1000);
		expect(wide.viewWidth).toBeLessThanOrEqual(1800);
	});
});

describe('render bundle clean-up', () => {
	it('only treats Remotion bundles in the temp folder as removable', async () => {
		const os = await import('node:os');
		const path = await import('node:path');
		const {isTempBundle} = await import('../../../../src/Renderers/VideoRenderer');
		expect(isTempBundle(path.join(os.tmpdir(), 'remotion-webpack-bundle-abc123'))).toBe(true);
		expect(isTempBundle(path.join(os.tmpdir(), 'other-folder'))).toBe(false);
		expect(isTempBundle(path.join(process.cwd(), 'remotion-webpack-bundle-abc123'))).toBe(false);
		expect(isTempBundle(process.cwd())).toBe(false);
	}, 60_000);
});

describe('biology figures', () => {
	it('names each cell type its own organelles and spreads labels without overlap', async () => {
		const {spreadLabels} = await import('../../../../src/Components/Visuals/Biology/Cell');
		const animal = CourseVisualSchema.parse({kind: 'cell', type: 'animal'});
		const plant = CourseVisualSchema.parse({kind: 'cell', type: 'plant'});
		const prokaryote = CourseVisualSchema.parse({kind: 'cell', type: 'prokaryote'});
		expect(numberedPartNames(animal)).toContain('sentrozom');
		expect(numberedPartNames(animal)).not.toContain('kloroplast');
		expect(numberedPartNames(plant)).toEqual(expect.arrayContaining(['cidar', 'kloroplast', 'koful']));
		expect(numberedPartNames(plant)).not.toContain('sentrozom');
		expect(numberedPartNames(prokaryote)).not.toContain('cekirdek');
		expect(numberedPartNames(prokaryote)).not.toContain('mitokondri');
		const ys = spreadLabels([200, 205, 210, 600, 610], 54, 66, 576);
		const sorted = [...ys].sort((a, b) => a - b);
		for (let i = 1; i < sorted.length; i++) expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(54 - 1e-9);
		expect(Math.max(...ys)).toBeLessThanOrEqual(576);
		expect(Math.min(...ys)).toBeGreaterThanOrEqual(66);
	}, 60_000);
	it('names the membrane parts and its transports t1…', () => {
		const membrane = CourseVisualSchema.parse({kind: 'membrane', transport: ['difuzyon', 'aktif']});
		expect(numberedPartNames(membrane)).toEqual(expect.arrayContaining(['fosfolipit', 'kanal', 'tasiyici', 't1', 't2']));
		expect(() => CourseVisualSchema.parse({kind: 'membrane', transport: ['pinositoz']})).toThrow();
	});
	it('names the tonicity beakers, taxonomy ranks and division panels', () => {
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'tonicity', cell: 'plant'}))).toEqual(['p1', 'p2', 'p3']);
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'taxonomy'}))).toEqual(['alem', 'sube', 'sinif', 'takim', 'aile', 'cins', 'tur', 'egilim']);
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'division', mode: 'mitosis'}))).toEqual(['s1', 's2', 's3', 's4', 's5']);
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'division', mode: 'meiosis', stages: ['metafaz2', 'anafaz2', 'telofaz2']}))).toEqual(['s1', 's2', 's3']);
	});
	it('widens the meiosis II panels and lays two columns by their widest panel', async () => {
		const {divisionLayout} = await import('../../../../src/Components/Visuals/Biology/Division');
		const row = divisionLayout(CourseVisualSchema.parse({kind: 'division', mode: 'meiosis', stages: ['telofaz1', 'metafaz2', 'anafaz2']}) as never);
		expect(row.slots.map((slot) => slot.width)).toEqual([230, 340, 340]);
		expect(row.width).toBe(20 + 230 + 340 + 340);
		const grid = divisionLayout(CourseVisualSchema.parse({kind: 'division', mode: 'meiosis', stages: ['anafaz1', 'telofaz1', 'metafaz2', 'telofaz2'], layout: 'grid'}) as never);
		expect(grid.slots.map((slot) => slot.width)).toEqual([340, 340, 340, 340]);
		expect(grid.slots[2].top).toBe(grid.slots[0].top + 340);
	}, 60_000);
	it('crosses gametes into genotypes in textbook order and sorts them into phenotype classes', async () => {
		const {zygote, genotypeText, phenotypeKey, fraction, ratio} = await import('../../../../src/Components/Visuals/Biology/Allele');
		const cross = (egg: string, sperm: string) => genotypeText(zygote(egg, sperm));
		expect(cross('a', 'A')).toBe('Aa');
		expect(cross('sd', 'SD')).toBe('SsDd');
		expect(cross('O', 'A')).toBe('AO');
		expect(cross('B', 'A')).toBe('AB');
		expect(cross('X^r', 'X^R')).toBe('X^RX^r');
		expect(cross('X^r', 'Y')).toBe('X^rY');
		expect(cross('Or', 'AR')).toBe('AORr');
		const key = (egg: string, sperm: string) => phenotypeKey(zygote(egg, sperm));
		expect([key('A', 'a'), key('a', 'a'), key('A', 'B'), key('O', 'O'), key('M', 'N'), key('Sd', 'sd')]).toEqual(['A', 'a', 'AB', 'O', 'MN', 'Sd']);
		expect(key('X^R', 'X^r')).toBe('X^RX^r');
		expect([fraction(3, 4), fraction(2, 4), fraction(9, 16), fraction(4, 4)]).toEqual(['3/4', '1/2', '9/16', '1']);
		expect([ratio([9, 3, 3, 1]), ratio([2, 2]), ratio([1, 2, 1])]).toEqual(['9 : 3 : 3 : 1', '1 : 1', '1 : 2 : 1']);
	}, 60_000);
	it('checks a Punnett square: equal gametes, phenotypes that cover the cells', () => {
		const square = {kind: 'punnett', rows: ['SD', 'Sd', 'sD', 'sd'], columns: ['SD', 'Sd', 'sD', 'sd'], phenotypes: [{keys: ['SD'], label: 'Sarı-düzgün'}, {keys: ['Sd'], label: 'Sarı-buruşuk'}, {keys: ['sD'], label: 'Yeşil-düzgün'}, {keys: ['sd'], label: 'Yeşil-buruşuk'}]};
		expect(numberedPartNames(CourseVisualSchema.parse(square))).toEqual(['r1', 'r2', 'r3', 'r4', 'c1', 'c2', 'c3', 'c4', 'p1', 'p2', 'p3', 'p4']);
		expect(() => CourseVisualSchema.parse({...square, columns: ['S', 's']})).toThrow(/allele/);
		expect(() => CourseVisualSchema.parse({...square, phenotypes: square.phenotypes.slice(0, 3)})).toThrow(/no phenotype/);
		expect(() => CourseVisualSchema.parse({...square, phenotypes: [...square.phenotypes, {keys: ['ss'], label: 'Yok'}]})).toThrow(/No cell/);
	});
	it('checks a food web: links to a higher row between its organisms; names the pyramid levels', () => {
		const web = {kind: 'foodweb', organisms: [{id: 'çimen', label: 'Çimen', level: 1}, {id: 'fare', label: 'Fare', level: 2}, {id: 'şahin', label: 'Şahin', level: 3}], links: [['çimen', 'fare'], ['fare', 'şahin']]};
		expect(numberedPartNames(CourseVisualSchema.parse(web))).toEqual(['çimen', 'fare', 'şahin', 't1', 't2', 't3']);
		expect(() => CourseVisualSchema.parse({...web, links: [['şahin', 'fare']]})).toThrow(/higher row/);
		expect(() => CourseVisualSchema.parse({...web, links: [['çimen', 'kurt']]})).toThrow(/does not have/);
		const pyramid = CourseVisualSchema.parse({kind: 'trophic', levels: [{label: 'Üreticiler', value: '10 000 J'}, {label: 'Otçullar', value: '1 000 J'}]});
		expect(numberedPartNames(pyramid)).toEqual(['l1', 'l2', 'egilim']);
	});
	it('counts and splits Turkish syllables and finds a line\'s caesura and rhyme', async () => {
		const {syllableCount, syllablesOf, stopOffsets, splitLineEnd} = await import('../../../../src/Components/Visuals/Literature/Hece');
		expect(syllableCount('Gençlik böyledir işte, gelir gider;')).toBe(11);
		expect(syllablesOf('kapı')).toEqual(['ka', 'pı']);
		expect(syllablesOf('erken')).toEqual(['er', 'ken']);
		expect(syllablesOf('Türkçe')).toEqual(['Türk', 'çe']);
		expect(syllablesOf('şiir')).toEqual(['şi', 'ir']);
		const line = 'Karşıdan gelen piyade';
		expect(stopOffsets(line, [5])).toEqual([line.indexOf(' piyade')]);
		expect(stopOffsets(line, [4])).toEqual([-1]);
		expect(splitLineEnd('Bizim iller yerinde mi', 'dağ', 'yerinde mi')).toBeUndefined();
		expect(splitLineEnd('Karlı dağlar yerinde mi', 'dağ', 'lar yerinde mi')).toEqual({before: 'Karlı ', rhyme: 'dağ', redif: 'lar yerinde mi', after: ''});
	});
	it('checks a poem: lines end with their rhyme and redif, caesuras fall between words', () => {
		const poem = {kind: 'poem', stops: [4], syllables: true, lines: [{text: 'Bizim iller yerinde mi?', redif: 'yerinde mi', scheme: 'a'}, {text: 'Karlı dağlar yerinde mi?', redif: 'yerinde mi', scheme: 'a'}]};
		expect(numberedPartNames(CourseVisualSchema.parse(poem))).toEqual(['l1', 'l2', 'kafiye', 'redif', 'durak', 'hece', 'sema', 'isaret']);
		expect(() => CourseVisualSchema.parse({...poem, lines: [{text: 'Bizim iller yerinde mi?', redif: 'yerinde mi', marks: ['iller', 'Bizim']}]})).toThrow(/does not have the marks/);
		expect(() => CourseVisualSchema.parse({...poem, lines: [{text: 'Bizim iller yerinde mi?', redif: 'yerinde mi', marks: ['yerinde']}]})).toThrow(/before its rhyme/);
		expect(CourseVisualSchema.parse({...poem, lines: [{text: 'Bizim iller yerinde mi?', redif: 'yerinde mi', marks: ['Bizim', 'iller']}]})).toBeTruthy();
		expect(() => CourseVisualSchema.parse({...poem, lines: [{text: 'Karşıdan gelen piyade', rhyme: 'yade', redif: 'gelen'}]})).toThrow(/does not end/);
		expect(() => CourseVisualSchema.parse({...poem, stops: [5]})).toThrow(/splitting a word/);
	});
	it('checks a pedigree: couples of one generation, children one below, one set of parents', () => {
		const people = [
			{id: '1', sex: 'm', generation: 1, x: 0},
			{id: '2', sex: 'f', generation: 1, x: 1.5, state: 'affected'},
			{id: '3', sex: 'f', generation: 2, x: 0.75, state: 'unknown'},
		];
		const chart = {kind: 'pedigree', people, couples: [{partners: ['1', '2'], children: ['3']}]};
		expect(numberedPartNames(CourseVisualSchema.parse(chart))).toEqual(['p1', 'p2', 'p3']);
		expect(() => CourseVisualSchema.parse({...chart, couples: [{partners: ['1', '3'], children: []}]})).toThrow(/one generation/);
		expect(() => CourseVisualSchema.parse({...chart, couples: [{partners: ['1', '2'], children: ['9']}]})).toThrow(/one generation below/);
		expect(() => CourseVisualSchema.parse({...chart, people: [...people, {id: '4', sex: 'm', generation: 2, x: 1}]})).toThrow(/0.9 columns/);
	});
});
