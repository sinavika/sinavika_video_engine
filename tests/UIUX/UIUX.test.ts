import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {contrastRatio} from '../../src/Themes/ColorPalette';
import {UIProvider} from '../../src/UIUX/Context';
import {UI_ICON_NAMES} from '../../src/UIUX/Icons';
import {ACTION_CONTRAST, MODULE_KEYS, MODULES, moduleAction, moduleTint, TINT} from '../../src/UIUX/ModuleIdentity';
import {UI_COLORS, UI_TYPE} from '../../src/UIUX/Tokens';
import {UI_SCREENS} from '../../src/UIUX/Registry';
import {screenSize} from '../../src/UIUX/UIUXProps';

// Remotion's <Img> needs a composition to wait in; static markup only needs the layout.
vi.mock('remotion', async (original) => ({...(await original<typeof import('remotion')>()), Img: () => null}));

describe('module identity', () => {
	it('defines every module with names, colours, code names and the tab slots', () => {
		expect(Object.keys(MODULES).sort()).toEqual([...MODULE_KEYS].sort());
		for (const key of MODULE_KEYS) {
			const module = MODULES[key];
			expect(module.name.tr.length, key).toBeGreaterThan(2);
			expect(module.name.en.length, key).toBeGreaterThan(2);
			expect(module.color.light, key).toMatch(/^#[0-9A-F]{6}$/);
			expect(module.color.dark, key).toMatch(/^#[0-9A-F]{6}$/);
			expect(UI_ICON_NAMES, key).toContain(module.icon);
			expect(module.code.api.length, key).toBeGreaterThan(2);
			expect(module.code.mobile.length, key).toBeGreaterThan(2);
			if (key === 'sinoAi') expect(module.tabs).toBeNull();
			else expect(module.tabs?.length, key).toBe(3);
		}
	});

	it('gives each module a distinct colour that white text can sit on', () => {
		const colors = MODULE_KEYS.map((key) => MODULES[key].color.light);
		expect(new Set(colors).size).toBe(colors.length);
		for (const key of MODULE_KEYS) expect(contrastRatio(MODULES[key].color.light, '#FFFFFF'), key).toBeGreaterThanOrEqual(3);
	});

	it('fills buttons so white text reads at 4.5:1, module and brand, in both themes', () => {
		for (const key of MODULE_KEYS) expect(contrastRatio(moduleAction(key), '#FFFFFF'), key).toBeGreaterThanOrEqual(ACTION_CONTRAST);
		for (const mode of ['light', 'dark'] as const) expect(contrastRatio(UI_COLORS[mode].action, '#FFFFFF'), mode).toBeGreaterThanOrEqual(ACTION_CONTRAST);
	});

	it('reads body text at 16 pt or more with a 1.5 line height, and nothing under 12 pt', () => {
		const [size, lineHeight] = UI_TYPE.body;
		expect(size).toBeGreaterThanOrEqual(16);
		expect(lineHeight / size).toBeGreaterThanOrEqual(1.5);
		for (const [role, [roleSize]] of Object.entries(UI_TYPE)) expect(roleSize, role).toBeGreaterThanOrEqual(12);
	});

	it('builds tints only from the fixed steps', () => {
		expect(moduleTint('lessons', 'soft')).toBe(`rgba(2, 132, 199, ${TINT.soft})`);
	});

	it('never names a module Lens, Compass or Kelime Kartları on screen', () => {
		for (const key of MODULE_KEYS) {
			for (const text of [MODULES[key].name.tr, MODULES[key].tagline.tr, ...(MODULES[key].tabs ?? []).map((tab) => tab.label.tr)]) {
				expect(text).not.toMatch(/Lens|Compass|Pusula|Kelime Kartları|Ders Çalış|Sınavika AI/);
			}
		}
	});
});

describe('UI/UX screens', () => {
	it('has unique ids that match their platform', () => {
		const ids = UI_SCREENS.map((screen) => screen.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const screen of UI_SCREENS) expect(screen.id[0], screen.id).toBe({mobile: 'm', web: 'w', site: 's', tablet: 't', fold: 'f', watch: 'k', share: 'p', print: 'r'}[screen.platform]);
	});

	it('covers every module on mobile and web', () => {
		for (const platform of ['mobile', 'web'] as const) {
			const covered = new Set(UI_SCREENS.filter((screen) => screen.platform === platform).map((screen) => screen.module));
			for (const key of MODULE_KEYS) expect(covered, `${platform} ${key}`).toContain(key);
		}
	});

	it('draws every mobile module beyond its full state: empty, first visit, done, limit or failure', () => {
		const state = /-(bos|ilk|yok|bitti|hak|okunamadi|dunden|baglanti)$/;
		for (const key of MODULE_KEYS) {
			const states = UI_SCREENS.filter((screen) => screen.platform === 'mobile' && screen.module === key && state.test(screen.id));
			expect(states.length, key).toBeGreaterThan(0);
		}
		for (const id of ['m-hub-plansiz', 'm-hub-gun-bitti', 'm-hub-abonelik-bitti'])
			expect(
				UI_SCREENS.some((screen) => screen.id === id),
				id,
			).toBe(true);
	});

	it('keeps mobile, web and tablet in step: every key feature and state has its drawing on each platform', () => {
		// feature: [mobile, web, tablet]: the three are drawn for every key feature and state
		const parity: Record<string, [string, string, string]> = {
			home: ['m-hub-moduller', 'w-panel-anasayfa', 't-hub-moduller'],
			homeNoPlan: ['m-hub-plansiz', 'w-panel-anasayfa-plansiz', 't-hub-plansiz'],
			homeDone: ['m-hub-gun-bitti', 'w-panel-anasayfa-gun-bitti', 't-hub-gun-bitti'],
			homeExpired: ['m-hub-abonelik-bitti', 'w-panel-anasayfa-abonelik-bitti', 't-hub-abonelik-bitti'],
			planDay: ['m-plan-bugun', 'w-plan-bugun', 't-plan-bugun'],
			results: ['m-deneme-sonuclar', 'w-deneme-sonuclar', 't-deneme-sonuclar'],
			resultsEmpty: ['m-deneme-sonuclar-bos', 'w-deneme-sonuclar-bos', 't-deneme-sonuclar-bos'],
			examDetail: ['m-deneme-detay', 'w-deneme-detay', 't-deneme-detay'],
			examSubmit: ['m-deneme-teslim', 'w-deneme-teslim', 't-deneme-teslim'],
			examDone: ['m-deneme-detay-bitti', 'w-deneme-detay-bitti', 't-deneme-detay-bitti'],
			examAdd: ['m-deneme-ekle', 'w-deneme-ekle', 't-deneme-ekle'],
			statistics: ['m-istatistik', 'w-istatistik', 't-istatistik-pano'],
			quizMistakes: ['m-test-yanlislar', 'w-test-yanlislar', 't-test-yanlislar'],
			stepGroup: ['m-ders-grupla', 'w-ders-grupla', 't-ders-grupla'],
			stepMatch: ['m-ders-eslestir', 'w-ders-eslestir', 't-ders-eslestir'],
			stepFormula: ['m-ders-formul', 'w-ders-formul', 't-ders-formul'],
		};
		const ids = new Set(UI_SCREENS.map((screen) => screen.id));
		for (const [feature, platforms] of Object.entries(parity)) {
			for (const id of platforms) expect(ids.has(id), `${feature}: ${id}`).toBe(true);
		}
	});

	it('draws a topic as one lesson: no topic intro, section start or part-done screen (owner, 17 Nov 2026)', () => {
		const ids = UI_SCREENS.map((screen) => screen.id);
		for (const removed of ['m-ders-konu-girisi', 'w-ders-konu-girisi', 'm-ders-bolum', 'w-ders-bolum', 't-ders-bolum', 'm-ders-mikro-bitti', 'w-ders-mikro-bitti']) expect(ids, removed).not.toContain(removed);
	});

	it('draws the edge states of Testler: last mistake, no mistake, flagged, offline (owner, 17 Nov 2026)', () => {
		const ids = UI_SCREENS.map((screen) => screen.id);
		for (const id of ['m-test-yanlislar-son', 'w-test-yanlislar-son', 't-test-yanlislar-son', 'm-test-yanlislar-dogru', 'm-test-cozumler-isaretli', 'w-test-cozumler-isaretli', 'm-test-baglanti', 'm-test-bitir-bekliyor', 'w-test-baglanti']) expect(ids, id).toContain(id);
	});

	it('draws the Denemeler states the app uses: open and closed detail, plan added, hatched result (owner, 17 Nov 2026)', () => {
		const ids = UI_SCREENS.map((screen) => screen.id);
		for (const id of ['m-deneme-detay-acik', 'm-deneme-detay-kapali', 'm-deneme-analiz-eklendi', 'm-deneme-sonuclar-disarida']) expect(ids, id).toContain(id);
	});

	it('sizes site pages by their height and the rest by the canvas', () => {
		for (const screen of UI_SCREENS) {
			const size = screenSize(screen.platform, screen.height, screen.portrait, screen.round, screen.pose, screen.narrow);
			if (screen.platform === 'site') expect(screen.height, screen.id).toBeGreaterThan(800);
			expect(size.width, screen.id).toBe(screen.platform === 'mobile' ? 390 : screen.platform === 'share' ? 1080 : screen.platform === 'print' ? 595 : screen.platform === 'watch' ? (screen.round ? 227 : 208) : screen.platform === 'tablet' ? (screen.portrait ? 834 : 1194) : screen.platform === 'fold' ? (screen.pose === 'outer' ? 466 : screen.pose === 'innerTall' ? 669 : 951) : screen.narrow ? 390 : 1440);
		}
	});

	it('draws every screen in Turkish and English without errors or leftover English', () => {
		for (const screen of UI_SCREENS) {
			for (const lang of ['tr', 'en'] as const) {
				const html = renderToStaticMarkup(React.createElement(UIProvider, {lang, children: React.createElement(screen.Component)}));
				expect(html.length, `${screen.id} ${lang}`).toBeGreaterThan(200);
				if (lang === 'tr') expect(html, screen.id).not.toMatch(/Lens AI|Kelime Kartları|Sınavika AI|undefined/);
				// Percent as the language writes it (VC deck, 16 Nov 2026): "%45" in Turkish, "45%" in English.
				const text = html.replace(/<[^>]*>/g, ' ');
				if (lang === 'en') expect(text, `${screen.id} en`).not.toMatch(/%\d/);
				else expect(text, `${screen.id} tr`).not.toMatch(/\d%(?![\w’'])/);
				// A topic is one lesson (owner, 1 and 17 Nov 2026): the student never reads "mikro ders".
				expect(text, `${screen.id} ${lang}`).not.toMatch(/mikro ?ders|micro-?lesson/i);
			}
		}
		// Drawing every screen twice takes ~6 s when the whole suite runs in parallel: past vitest's 5 s default.
	}, 60_000);

	it('paints no brand orange on module screens: their accent is the module colour (no module is orange since 17 Nov 2026)', () => {
		// Brand orange, and Denemeler's old orange (#E8590C, #FB8A3C, button #C54C0A), which became olive green.
		const brandOrange = /#EA580C|#C2410C|#F97316|rgba\(234, 88, 12|rgba\(194, 65, 12|#E8590C|#FB8A3C|#C54C0A|rgba\(232, 89, 12|rgba\(251, 138, 60/i;
		// The daily-quota sheet is a payment surface, which stays brand orange.
		const paymentSurfaces = ['m-ders-hak'];
		for (const screen of UI_SCREENS.filter((entry) => entry.module && !paymentSurfaces.includes(entry.id.replace(/^f-(dis|ic)-/, 'm-')))) {
			// The logo is always orange (the web panel's menu carries it on every page).
			const html = renderToStaticMarkup(React.createElement(UIProvider, {children: React.createElement(screen.Component)})).replaceAll('background-color:#EA580C;mask-image', '');
			expect(html, screen.id).not.toMatch(brandOrange);
		}
		// Drawing every module screen takes ~7 s when the whole suite runs in parallel: past vitest's 5 s default.
	}, 60_000);

	it('tells the student under every SinoAI composer that SinoAI is an AI and can be wrong', () => {
		for (const id of ['m-sino-ana', 'm-sino-sohbet', 'm-sino-calisma', 'w-sino-sohbet', 'w-sino-calisma']) {
			const screen = UI_SCREENS.find((entry) => entry.id === id);
			expect(screen, id).toBeDefined();
			const html = renderToStaticMarkup(React.createElement(UIProvider, {children: React.createElement(screen!.Component)}));
			expect(html, id).toContain('hata yapabilir');
		}
	});

	it('keeps light and dark apart: no drawing forces a theme, and every one draws in dark', () => {
		// The camera viewfinder is dark in both themes, like the system camera.
		const alwaysDark = ['m-ozet-kamera'];
		for (const screen of UI_SCREENS) {
			expect(screen.id, screen.id).not.toMatch(/koyu|dark/);
			// Watch faces are dark in both themes, as watchOS and Wear OS are; PDF pages are white paper in both.
			if (alwaysDark.includes(screen.id) || screen.platform === 'watch' || screen.platform === 'print') continue;
			const light = renderToStaticMarkup(React.createElement(UIProvider, {mode: 'light', children: React.createElement(screen.Component)}));
			const dark = renderToStaticMarkup(React.createElement(UIProvider, {mode: 'dark', children: React.createElement(screen.Component)}));
			expect(dark, screen.id).not.toBe(light);
		}
	}, 60_000);
});
