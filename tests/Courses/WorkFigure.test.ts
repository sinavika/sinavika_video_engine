import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {collectWorkFigures, finalBeats, isRasterFigure, workFigureBox, workFigureColours, workFigureTheme} from '../../src/Courses/WorkFigure';
import {attachStills, stillOf} from '../../src/Renderers/WorkFigureRenderer';
import {contrastRatio} from '../../src/Themes/ColorPalette';

const SCRIPT = {
	lesson: {
		sections: [
			{
				cards: [
					{kind: 'visual', visual: {kind: 'timeline', events: [{year: 1071, label: 'Malazgirt'}, {year: 1176, label: 'Miryokefalon'}]}, beats: [{narration: 'Bir.', focus: ['e1']}, {narration: 'İki.', focus: ['e2'], zoom: [0, 0, 0.5, 0.5], note: 'Not'}]},
					{kind: 'visual', visual: {kind: 'flow', nodes: [{label: 'A'}, {label: 'B'}]}},
				],
			},
			{
				cards: [
					{kind: 'question', question: {figure: {kind: 'geometry', view: [0, 0, 4, 3], points: [], segments: []}, steps: [{text: 'a'}, {text: 'b', visual: {kind: 'formula', latex: 'x'}}]}},
				],
			},
		],
	},
};

describe('Works figures', () => {
	it('collects the figures the app shows: card visuals with their beats, question figures and step visuals, never a flow', () => {
		const figures = collectWorkFigures(SCRIPT);
		expect(figures.map((figure) => figure.name)).toEqual(['s1c1-visual', 's2c1-figure', 's2c1-step2']);
		expect(figures.map((figure) => figure.pointer)).toEqual(['/lesson/sections/0/cards/0/visual', '/lesson/sections/1/cards/0/question/figure', '/lesson/sections/1/cards/0/question/steps/1/visual']);
		expect(figures[0].beats).toHaveLength(2);
		expect(figures[1].beats).toBeUndefined();
	});

	it('leaves a figure as its beats leave it, but with nothing pointed at, no zoom and no note', () => {
		const beats = finalBeats(collectWorkFigures(SCRIPT)[0].beats) ?? [];
		expect(beats[0].focus).toEqual(['e1']);
		expect(beats[1]).toMatchObject({focus: [], zoom: null});
		expect(beats[1].note).toBeUndefined();
		expect(finalBeats(undefined)).toBeUndefined();
	});

	it('draws in the app’s Dersler colours, readable on the figure card in both themes', () => {
		for (const mode of ['light', 'dark'] as const) {
			const theme = workFigureTheme(mode);
			const colours = workFigureColours(mode);
			expect(theme.colors.lesson?.fill).toBe(colours.accent);
			expect(theme.colors.text).toBe(colours.ink);
			expect(theme.colors.surface).toBe(colours.card);
			// Ink on the card and the lesson fill's own text stay readable.
			expect(contrastRatio(theme.colors.text, colours.card)).toBeGreaterThan(7);
			expect(contrastRatio(theme.colors.lesson?.on ?? '', colours.accent)).toBeGreaterThan(3);
			// The brand orange gives way to the deep tone of the module colour.
			expect(theme.colors.primary.toLowerCase()).not.toBe('#ea580c');
		}
		expect(workFigureColours('light').accent).toBe('#0284C7');
		expect(workFigureColours('dark').card).toBe('#0F1115');
	});

	it('draws solids, 3D blocks and pictures as pictures, everything else as vectors', () => {
		expect(isRasterFigure({kind: 'solid', shape: 'cube', dimensions: [], unfold: false, split: false, sweep: false} as never)).toBe(true);
		expect(isRasterFigure({kind: 'earthquake', fault: 'reverse', view: 'block3d', labels: true})).toBe(true);
		expect(isRasterFigure({kind: 'earthquake', fault: 'reverse', view: 'section', labels: true})).toBe(false);
		expect(isRasterFigure({kind: 'timeline', events: [], era: 'ce'} as never)).toBe(false);
	});

	it('gives a figure a box 860 wide, as tall as its own shape asks', () => {
		expect(workFigureBox({kind: 'geometry', view: [0, 0, 4, 2]} as never)).toEqual({width: 860, height: 430});
		// A very tall figure is held at 1.6 times the width.
		expect(workFigureBox({kind: 'geometry', view: [0, 0, 1, 4]} as never).height).toBe(1376);
	});

	it('writes Works copies with each drawn figure’s still, its data unchanged, the source untouched', () => {
		const root = mkdtempSync(path.join(os.tmpdir(), 'works-'));
		try {
			const works = path.join(root, 'Works');
			mkdirSync(path.join(works, 'YKS_TYT', 'TAR'), {recursive: true});
			const file = path.join(works, 'YKS_TYT', 'TAR', 'TAR_X.json');
			writeFileSync(file, JSON.stringify(SCRIPT));
			const source = path.relative(process.cwd(), file).replaceAll('\\', '/');
			const row = {source, pointer: '/lesson/sections/0/cards/0/visual', format: 'svg' as const, sha256: {light: 'aa', dark: 'bb'}, width: 1280, height: 600};
			const counts = attachStills(works, path.join(root, 'Out'), [row], 'https://x.test/work-figure-stills/');
			expect(counts).toEqual({files: 1, stills: 1, missing: 2});
			const copy = JSON.parse(readFileSync(path.join(root, 'Out', 'YKS_TYT', 'TAR', 'TAR_X.json'), 'utf-8'));
			const visual = copy.lesson.sections[0].cards[0].visual;
			expect(visual.still).toEqual({light: 'https://x.test/work-figure-stills/aa.svg', dark: 'https://x.test/work-figure-stills/bb.svg', width: 1280, height: 600});
			expect(visual.events).toEqual((SCRIPT.lesson.sections[0].cards[0] as {visual: {events: unknown}}).visual.events);
			expect(JSON.parse(readFileSync(file, 'utf-8')).lesson.sections[0].cards[0].visual.still).toBeUndefined();
			expect(stillOf(row, 'http://localhost:5000/work-figure-stills/').light).toBe('http://localhost:5000/work-figure-stills/aa.svg');
		} finally {
			rmSync(root, {recursive: true, force: true});
		}
	});
});

describe('Works figure colours: two series apart in both themes', () => {
	it('keeps the second series (the brand’s place) apart from the first', async () => {
		const {contrastRatio} = await import('../../src/Themes/ColorPalette');
		for (const mode of ['light', 'dark'] as const) {
			const {colors} = workFigureTheme(mode);
			// The light theme's deep blue stands 1.9 : 1 from its blue; the dark theme's paler blue stood 1.3 : 1 from its
			// own and two curves looked alike (Soru revizyonu, 2 Nov 2026).
			expect(contrastRatio(colors.primary, colors.accent)).toBeGreaterThan(1.9);
			expect(contrastRatio(colors.primary, colors.surface)).toBeGreaterThan(2.9);
		}
	});
});
