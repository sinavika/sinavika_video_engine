import {describe, expect, it} from 'vitest';
import {checkProductCopy} from '../../src/Configurations/ProductMessaging';
import {MODULE_ORDER} from '../../src/UIUX/ModuleIdentity';
import {findScreen} from '../../src/UIUX/Registry';
import {PRODUCT_CONTENT, type Bi, type Shot} from '../../src/UIUX/Screens/Site/SiteContent';

/** Product detail pages (site): copy rules, real drawings, the shape the owner asked for (20 Nov 2026). */
describe('site product pages', () => {
	const all = MODULE_ORDER.map((key) => PRODUCT_CONTENT[key]);

	it('has a page for every module, with 3–4 steps, 4–6 features, 3 links and 5–6 questions', () => {
		for (const page of all) {
			expect(page.steps.length, page.module).toBeGreaterThanOrEqual(3);
			expect(page.steps.length, page.module).toBeLessThanOrEqual(4);
			expect(page.features.length, page.module).toBeGreaterThanOrEqual(4);
			expect(page.features.length, page.module).toBeLessThanOrEqual(6);
			expect(page.links.length, page.module).toBe(3);
			expect(page.faq.length, page.module).toBeGreaterThanOrEqual(5);
			expect(page.faq.length, page.module).toBeLessThanOrEqual(6);
		}
	});

	it('shows only real drawings: each picture id is a registry screen drawn by the same component', () => {
		const shots: Shot[] = all.flatMap((page) => [page.hero.phone, page.hero.browser, page.example.shot, ...page.steps.map((step) => step.shot), ...page.features.map((feature) => feature.shot)]);
		for (const shot of shots) expect(findScreen(shot.id).Component, shot.id).toBe(shot.C);
	});

	it('passes the product copy rules in both languages', () => {
		const texts: Bi[] = all.flatMap((page) => [page.title, page.lead, page.example.title, page.example.text, ...page.steps.flatMap((step) => [step.title, step.text]), ...page.features.flatMap((feature) => [feature.title, feature.text, ...feature.points]), ...page.links.map((link) => link.text), ...page.faq.flatMap((item) => [item.q, item.a])]);
		for (const [tr, en] of texts) {
			expect(checkProductCopy(tr).filter((issue) => issue.severity === 'error'), tr).toEqual([]);
			expect(checkProductCopy(en).filter((issue) => issue.severity === 'error'), en).toEqual([]);
			expect(`${tr} ${en}`, tr).not.toMatch(/YDT|mikro ders|micro-lesson/i);
		}
	});
});
