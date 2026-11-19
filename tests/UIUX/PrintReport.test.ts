import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {contrastRatio} from '../../src/Themes/ColorPalette';
import {UIProvider} from '../../src/UIUX/Context';
import {MODULES} from '../../src/UIUX/ModuleIdentity';
import {UI_SCREENS} from '../../src/UIUX/Registry';
import {HEAT_STEPS, heatStep, PAPER, REPORT, REPORT_MODULES} from '../../src/UIUX/Screens/Print/StatsReport';
vi.mock('remotion', async (original) => ({...(await original<typeof import('remotion')>()), Img: () => null}));

/**
 * İstatistik raporu PDF'i (19 Nov 2026): the drawing is the template the API copies into QuestPDF, so it may only ask
 * for what the API's PDF has: Manrope 400/600/700/800 (SinavikaPdfBrand embeds these four), glyphs Manrope has, and
 * orange only as the brand. docs/UIUX/Kodlama/13-Istatistik-Raporu-PDF.md.
 */
const pages = UI_SCREENS.filter((screen) => screen.platform === 'print');
const html = (lang: 'tr' | 'en') => pages.map((screen) => renderToStaticMarkup(React.createElement(UIProvider, {lang, children: React.createElement(screen.Component)}))).join('\n');

describe('statistics report PDF', () => {
	it('draws the A4 pages under r- ids', () => {
		expect(pages.map((screen) => screen.id)).toEqual(['r-istatistik-1', 'r-istatistik-2', 'r-istatistik-hafta']);
		expect(REPORT.page).toMatchObject({width: 595, height: 842});
	});

	it('uses only the Manrope weights the API embeds and no smaller text than 7 pt', () => {
		for (const lang of ['tr', 'en'] as const) {
			const markup = html(lang);
			for (const [, weight] of markup.matchAll(/font-weight:\s*(\d+)/g)) expect(['400', '600', '700', '800']).toContain(weight);
			for (const [, size] of markup.matchAll(/font-size:\s*([\d.]+)px/g)) expect(Number(size)).toBeGreaterThanOrEqual(7);
		}
	});

	it('writes no glyph Manrope lacks: changes carry + and −, never arrows', () => {
		for (const lang of ['tr', 'en'] as const) expect(html(lang)).not.toMatch(/[↗↘▲▼★≤≥√]/);
	});

	it('keeps orange to the brand: the logo and sinavika.com, never a chart', () => {
		const markup = html('tr');
		const orange = markup.split(PAPER.orange).length - 1;
		// Per page: the logo and the footer address.
		expect(orange).toBe(pages.length * 2);
		for (const entry of REPORT_MODULES) expect(MODULES[entry.module].color.light.toUpperCase()).not.toBe(PAPER.orange);
	});

	it('follows the module order in bars and ring, with focus time in the study plan colour', () => {
		expect(REPORT_MODULES.map((entry) => entry.key)).toEqual(['focus', 'lesson', 'quiz', 'exam', 'flashcard']);
		expect(REPORT_MODULES[0].module).toBe('studyPlan');
	});

	it('reads every heat map step: the percent in the cell keeps 4.5:1', () => {
		for (const step of HEAT_STEPS) expect(contrastRatio(step.ink, step.fill), step.fill).toBeGreaterThanOrEqual(4.5);
		expect(heatStep(91).fill).toBe('#0F172A');
		expect(heatStep(38).fill).toBe('#CBD5E1');
	});
});
