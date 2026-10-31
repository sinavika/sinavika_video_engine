import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {contrastRatio} from '../../src/Themes/ColorPalette';
import {UIProvider} from '../../src/UIUX/Context';
import {UI_ICON_NAMES} from '../../src/UIUX/Icons';
import {ACTION_CONTRAST, MODULE_KEYS, MODULES, moduleAction, moduleTint, TINT} from '../../src/UIUX/ModuleIdentity';
import {UI_COLORS} from '../../src/UIUX/Tokens';
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
		for (const screen of UI_SCREENS) expect(screen.id[0], screen.id).toBe({mobile: 'm', web: 'w', site: 's'}[screen.platform]);
	});

	it('covers every module on mobile and web', () => {
		for (const platform of ['mobile', 'web'] as const) {
			const covered = new Set(UI_SCREENS.filter((screen) => screen.platform === platform).map((screen) => screen.module));
			for (const key of MODULE_KEYS) expect(covered, `${platform} ${key}`).toContain(key);
		}
	});

	it('sizes site pages by their height and the rest by the canvas', () => {
		for (const screen of UI_SCREENS) {
			const size = screenSize(screen.platform, screen.height);
			if (screen.platform === 'site') expect(screen.height, screen.id).toBeGreaterThan(800);
			expect(size.width, screen.id).toBe(screen.platform === 'mobile' ? 390 : 1440);
		}
	});

	it('draws every screen in Turkish and English without errors or leftover English', () => {
		for (const screen of UI_SCREENS) {
			for (const lang of ['tr', 'en'] as const) {
				const html = renderToStaticMarkup(React.createElement(UIProvider, {lang, children: React.createElement(screen.Component)}));
				expect(html.length, `${screen.id} ${lang}`).toBeGreaterThan(200);
				if (lang === 'tr') expect(html, screen.id).not.toMatch(/Lens AI|Kelime Kartları|Sınavika AI|undefined/);
			}
		}
		// Drawing every screen twice takes ~6 s when the whole suite runs in parallel: past vitest's 5 s default.
	}, 60_000);

	it('paints no brand orange on module screens: their accent is the module colour (Denemeler is orange itself)', () => {
		const brandOrange = /#EA580C|#C2410C|#F97316|rgba\(234, 88, 12|rgba\(194, 65, 12/i;
		// The daily-quota sheet is a payment surface, which stays brand orange.
		const paymentSurfaces = ['m-ders-hak'];
		for (const screen of UI_SCREENS.filter((entry) => entry.module && entry.module !== 'exam' && !paymentSurfaces.includes(entry.id))) {
			// The logo is always orange (the web panel's menu carries it on every page).
			const html = renderToStaticMarkup(React.createElement(UIProvider, {children: React.createElement(screen.Component)})).replaceAll('background-color:#EA580C;mask-image', '');
			expect(html, screen.id).not.toMatch(brandOrange);
		}
	});

	it('keeps light and dark apart: no drawing forces a theme, and every one draws in dark', () => {
		// The camera viewfinder is dark in both themes, like the system camera.
		const alwaysDark = ['m-ozet-kamera'];
		for (const screen of UI_SCREENS) {
			expect(screen.id, screen.id).not.toMatch(/koyu|dark/);
			if (alwaysDark.includes(screen.id)) continue;
			const light = renderToStaticMarkup(React.createElement(UIProvider, {mode: 'light', children: React.createElement(screen.Component)}));
			const dark = renderToStaticMarkup(React.createElement(UIProvider, {mode: 'dark', children: React.createElement(screen.Component)}));
			expect(dark, screen.id).not.toBe(light);
		}
	}, 60_000);
});
