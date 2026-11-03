import {describe, expect, it} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MathExpression} from '../../../../src/Components/Typography/MathExpression';
import {anglePartId, axisTicks, blendSector, circleLabelAt, circlePath, letterDistance, placeAngleLabels, rideAlong, sectorPath, slidePosition, sectorOf, tickMarks, tickShares, wedgePath, widestGap} from '../../../../src/Components/Visuals/Mathematics/Geometry';
import {plotArea} from '../../../../src/Components/Visuals/Mathematics/Plot';
import {figureText, lineSamples, placeLabel, pointSpots, type LabelBox} from '../../../../src/Components/Visuals/FigureLabel';
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

	it('marks equal angles with arcs, names angles that share a corner, and copies only an equal angle', () => {
		// Triangle ABC with a parallel to BC through A (D left, E right): angle DAB is B's alternate angle.
		const points = [
			{id: 'A', at: [2, 3]},
			{id: 'B', at: [0, 0]},
			{id: 'C', at: [6, 0]},
			{id: 'D', at: [-1, 3]},
			{id: 'E', at: [7, 3]},
		];
		const triangle = {kind: 'geometry', view: [-1, -1, 7, 4], points, segments: [{from: 'A', to: 'B'}, {from: 'B', to: 'C'}, {from: 'C', to: 'A'}, {from: 'D', to: 'E', dashed: true}]};
		const parsed = CourseVisualSchema.parse({
			...triangle,
			angles: [
				{at: 'B', from: 'C', to: 'A', id: 'b', arcs: 2},
				{at: 'A', from: 'D', to: 'B', id: 'b-copy', copyOf: 'b', arcs: 2},
				{at: 'A', from: 'B', to: 'C'},
			],
		});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.angles.map((angle) => angle.arcs)).toEqual([2, 2, 1]);
		expect(parsed.angles.map(anglePartId)).toEqual(['b', 'b-copy', 'angle-A']);
		// A copy that does not measure the same (DAC is not B's alternate angle) would teach a wrong equality.
		const wrong = CourseVisualSchema.safeParse({...triangle, angles: [{at: 'B', from: 'C', to: 'A', id: 'b'}, {at: 'A', from: 'D', to: 'C', copyOf: 'b'}]});
		expect(wrong.success).toBe(false);
		expect(JSON.stringify(wrong.error?.issues)).toContain('copy measures');
		expect(CourseVisualSchema.safeParse({...triangle, angles: [{at: 'A', from: 'D', to: 'B', copyOf: 'b'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...triangle, angles: [{at: 'B', from: 'C', to: 'A', id: 'b'}, {at: 'C', from: 'A', to: 'B', id: 'b'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({...triangle, angles: [{at: 'B', from: 'C', to: 'A', arcs: 4}]}).success).toBe(false);
	});

	it('slides a point to its new place on a straight way, and lets a figure carry it', () => {
		const apex = {at: [1.5, 4], moveTo: [5.5, 4]};
		expect(slidePosition(apex, 0)).toEqual([1.5, 4]);
		expect(slidePosition(apex, 0.5)).toEqual([3.5, 4]);
		expect(slidePosition(apex, 1)).toEqual([5.5, 4]);
		// A point without a place to go stays.
		expect(slidePosition({at: [2, 2]}, 1)).toEqual([2, 2]);
		const parsed = CourseVisualSchema.parse({kind: 'geometry', view: [0, 0, 6, 5], points: [{id: 'A', at: [1.5, 4], moveTo: [5.5, 4]}]});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.points[0].moveTo).toEqual([5.5, 4]);
	});

	it('slides a point round a centre along its circle, and fills discs and sectors', () => {
		// From the right of the circle a quarter turn to the top, through 45° halfway: always on the circle.
		const onCircle = {at: [5, 0], moveTo: [0, 5]};
		const [x, y] = slidePosition(onCircle, 0.5, [0, 0]);
		expect(x).toBeCloseTo(5 * Math.SQRT1_2);
		expect(y).toBeCloseTo(5 * Math.SQRT1_2);
		expect(Math.hypot(...slidePosition(onCircle, 0.3, [0, 0]))).toBeCloseTo(5);
		// Straight, it would cut across the circle.
		expect(Math.hypot(...slidePosition(onCircle, 0.5))).toBeLessThan(4);
		const figure = {kind: 'geometry', view: [-6, -6, 6, 6], points: [{id: 'O', at: [0, 0]}, {id: 'P', at: [5, 0], moveTo: [0, 5], moveAbout: 'O'}]};
		expect(CourseVisualSchema.safeParse(figure).success).toBe(true);
		// A slide round O must end as far from O as it began.
		expect(CourseVisualSchema.safeParse({...figure, points: [{id: 'O', at: [0, 0]}, {id: 'P', at: [5, 0], moveTo: [0, 3], moveAbout: 'O'}]}).success).toBe(false);
		// A filled sector: from the centre out to the arc and back.
		expect(sectorPath([0, 0], 10, [0, 90]).startsWith('M0 0 L10 0 A10 10 0 0 0 ')).toBe(true);
		expect(sectorPath([0, 0], 10, [0, 90]).endsWith(' Z')).toBe(true);
		// A circle that leaves the figure's box would be drawn over the card and cut by the frame; an arc only needs its own part inside.
		expect(CourseVisualSchema.safeParse({kind: 'geometry', view: [-1, -1, 6, 6], points: [{id: 'O', at: [0, 0]}], circles: [{center: 'O', radius: 5}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'geometry', view: [-1, -1, 6, 6], points: [{id: 'O', at: [0, 0]}], circles: [{center: 'O', radius: 5, arc: [0, 90]}]}).success).toBe(true);
		const parsed = CourseVisualSchema.parse({kind: 'geometry', view: [-6, -6, 6, 6], points: [{id: 'O', at: [0, 0]}], circles: [{center: 'O', radius: 5, arc: [0, 120], fill: true, shade: 2}]});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.circles[0]).toMatchObject({fill: true, shade: 2});
	});

	it('draws coordinate axes under an analytic figure, marked every step without the origin', () => {
		expect(axisTicks(-2.5, 4, 1)).toEqual([-2, -1, 1, 2, 3, 4]);
		expect(axisTicks(-1, 6, 2)).toEqual([2, 4, 6]);
		expect(axisTicks(0.5, 0.9, 1)).toEqual([]);
		const parsed = CourseVisualSchema.parse({kind: 'geometry', view: [-1, -1, 5, 5], axes: {}, points: [{id: 'A', at: [2, 3]}]});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.axes).toEqual({step: 1, numbers: true, grid: false});
		// Without axes nothing changes for the figures drawn so far.
		const plain = CourseVisualSchema.parse({kind: 'geometry', view: [-1, -1, 5, 5], points: [{id: 'A', at: [2, 3]}]});
		if (plain.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(plain.axes).toBeUndefined();
	});

	it('writes a prime where Manrope can draw it, at the top of the letter', () => {
		expect(figureText('C′')).toBe('C’');
		expect(figureText('A″')).toBe('A’’');
		expect(figureText('d1')).toBe('d1');
	});

	it('names shapes with captions and leaves the corners of example shapes unlettered', () => {
		const parsed = CourseVisualSchema.parse({
			kind: 'geometry',
			view: [0, -1, 4, 3],
			points: [{id: 'P', at: [0, 0], label: ''}, {id: 'Q', at: [4, 0], label: ''}, {id: 'R', at: [2, 2], label: ''}, {id: 'N', at: [2, -0.8], label: 'çeşitkenar', caption: true}],
			segments: [{from: 'P', to: 'Q'}, {from: 'Q', to: 'R'}, {from: 'R', to: 'P'}],
		});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.points.map((point) => point.caption)).toEqual([false, false, false, true]);
		expect(parsed.points[0].label).toBe('');
		// A caption is a name, not a sentence.
		expect(CourseVisualSchema.safeParse({kind: 'geometry', view: [0, 0, 4, 4], points: [{id: 'N', at: [2, 2], label: 'geniş açılı üçgendir', caption: true}]}).success).toBe(false);
	});

	it('draws a compass arc from one direction to another, counter-clockwise as the figure sees it', () => {
		// A whole circle is unchanged: two half turns from its right end.
		expect(circlePath([100, 100], 50)).toBe('M150 100 a50 50 0 1 0 -100 0 a50 50 0 1 0 100 0');
		// 0° → 90°: from the right end up to the top (screen y is down), a quarter turn the short way.
		const quarter = circlePath([100, 100], 50, [0, 90]);
		expect(quarter.startsWith('M150 100 A50 50 0 0 0 ')).toBe(true);
		expect(quarter.split(' ').slice(-2).map(Number).map(Math.round)).toEqual([100, 50]);
		// 300° → 60° wraps through 0°: 120° of arc, not 240°.
		expect(circlePath([0, 0], 10, [300, 60])).toContain('A10 10 0 0 0');
		expect(circlePath([0, 0], 10, [60, 300])).toContain('A10 10 0 1 0');
		// The label stands outside the arc's middle: the 0°-90° arc's is up and to the right.
		const [lx, ly] = circleLabelAt([100, 100], 50, 20, [0, 90]);
		expect(lx).toBeCloseTo(100 + 70 * Math.SQRT1_2);
		expect(ly).toBeCloseTo(100 - 70 * Math.SQRT1_2);
		const parsed = CourseVisualSchema.parse({kind: 'geometry', view: [0, 0, 4, 4], points: [{id: 'B', at: [0, 0]}], circles: [{center: 'B', radius: 3, arc: [20, 80], dashed: true, id: 'pergel', label: '3'}]});
		if (parsed.kind !== 'geometry') throw new Error('expected a geometry visual');
		expect(parsed.circles[0]).toMatchObject({arc: [20, 80], dashed: true, id: 'pergel', label: '3'});
	});

	it('slides a copied angle across and turns it the short way round', () => {
		// Screen coordinates (y down): B's angle opens from BC (0) up towards BA; its alternate at A opens the other way.
		const source = sectorOf([0, 0], [100, 0], [40, -60]);
		expect(source.start).toBeCloseTo(Math.atan2(-60, 40));
		expect(source.size).toBeCloseTo(-Math.atan2(-60, 40));
		const target = sectorOf([40, -60], [-60, -60], [0, 0]);
		expect(target.size).toBeCloseTo(source.size);
		expect(blendSector(source, target, 0)).toEqual(source);
		const landed = blendSector(source, target, 1);
		expect(landed.corner).toEqual(target.corner);
		expect(Math.cos(landed.start - target.start)).toBeCloseTo(1);
		// Halfway: the corner is halfway across, the sector has turned half of 180°.
		const half = blendSector(source, target, 0.5);
		expect(half.corner).toEqual([20, -30]);
		expect(Math.abs(Math.cos(half.start - source.start))).toBeLessThan(1e-9);
		// Corresponding angles only slide: no turn at all.
		const slid = blendSector(source, sectorOf([0, -80], [100, -80], [40, -140]), 0.5);
		expect(slid.start).toBeCloseTo(source.start);
		// The label rides with the slice and lands on its own place.
		expect(rideAlong([30, -20], source, target, [10, -45], 0)[0]).toBeCloseTo(30);
		const end = rideAlong([30, -20], source, target, [10, -45], 1);
		expect(end[0]).toBeCloseTo(10);
		expect(end[1]).toBeCloseTo(-45);
		// A slice of a quarter turn from the right: corner, edge, arc, back.
		expect(wedgePath({corner: [0, 0], start: 0, size: Math.PI / 2}, 10)).toBe(`M0 0 L10 0 A10 10 0 0 1 ${10 * Math.cos(Math.PI / 2)} 10 Z`);
	});

	it('refuses a figure that names a point it does not have', () => {
		const figure = {kind: 'geometry', view: [-1, -1, 4, 4], points: [{id: 'A', at: [0, 0]}, {id: 'B', at: [4, 0]}]};
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
		// Every near spot taken by other labels: the label moves out to the outer ring instead of sitting on one.
		const near = spots.slice(0, 8);
		const far = placeLabel(spots, [], near, bounds);
		expect(near.some((box) => box[0] < far[2] && box[2] > far[0] && box[1] < far[3] && box[3] > far[1])).toBe(false);
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

	it('finds the widest free direction round a point', () => {
		// Sides to the right, up and left: the free half below is the widest gap.
		const best = widestGap([0, Math.PI / 2, Math.PI]);
		expect(best.gap).toBeCloseTo(Math.PI);
		expect(best.middle).toBeCloseTo(1.5 * Math.PI);
		// Directions outside 0..2π are folded in.
		expect(widestGap([-Math.PI / 2, Math.PI / 2]).gap).toBeCloseTo(Math.PI);
	});

	it('moves a later angle label off an earlier one, and keeps a clear label where it was', () => {
		const box = (cx: number, cy: number): LabelBox => [cx - 10, cy - 10, cx + 10, cy + 10];
		const bounds: LabelBox = [0, 0, 400, 400];
		// The 50° at the apex and the x below it want the same place (KPSS Geometri 1): x takes its next spot.
		const placed = placeAngleLabels([[box(100, 100)], [box(105, 104), box(140, 100)], undefined, [box(300, 300), box(320, 300)]], [], [], bounds);
		expect(placed[0]).toEqual(box(100, 100));
		expect(placed[1]).toEqual(box(140, 100));
		expect(placed[2]).toBeUndefined();
		expect(placed[3]).toEqual(box(300, 300));
		// A side's length label already standing there counts too, and so does a point under the label.
		expect(placeAngleLabels([[box(50, 50), box(80, 50)]], [], [box(52, 52)], bounds)[0]).toEqual(box(80, 50));
		expect(placeAngleLabels([[box(50, 50), box(80, 50)]], [[50, 50]], [], bounds)[0]).toEqual(box(80, 50));
	});

	it('keeps an angle label off the sides: a side counts as points along it', () => {
		const box = (cx: number, cy: number): LabelBox => [cx - 10, cy - 10, cx + 10, cy + 10];
		// Points every 10 px along a 40 px side, without its ends.
		expect(lineSamples([0, 0], [40, 0], 10)).toEqual([[10, 0], [20, 0], [30, 0]]);
		expect(lineSamples([0, 0], [5, 0], 10)).toEqual([]);
		// A label pushed out along a narrow angle's bisector would sit across the far side (x = 100): it takes a clear spot.
		const side = lineSamples([100, 0], [100, 200], 8);
		expect(placeAngleLabels([[box(100, 100), box(70, 100)]], side, [], [0, 0, 400, 400])[0]).toEqual(box(70, 100));
		// A spot clear of the side stays first.
		expect(placeAngleLabels([[box(60, 100), box(140, 100)]], side, [], [0, 0, 400, 400])[0]).toEqual(box(60, 100));
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

describe('geometry: names keep off circles', () => {
	it('stands a circle’s name clear of the circle, whatever its size', () => {
		// "r = 2" (5 letters at 30) beside a circle of radius 40: its nearest corner keeps the gap.
		const [lx, ly] = circleLabelAt([100, 100], 40, 10, undefined, {width: 90, height: 30});
		const corner = [lx - 45, ly + 15];
		expect(Math.hypot(corner[0] - 100, corner[1] - 100)).toBeGreaterThanOrEqual(40 + 10 - 1e-9);
	});

	it('moves a centre’s letter off the circle round it', () => {
		// The usual 1.12 em lands on a circle of 1.2 em: inside when there is room, else outside.
		expect(letterDistance(45, [48], 40)).toBeCloseTo(48 + 34, 9);
		expect(letterDistance(45, [100], 40)).toBe(45);
		expect(letterDistance(45, [70], 40)).toBeCloseTo(70 - 34, 9);
	});
});
