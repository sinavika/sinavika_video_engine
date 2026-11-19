import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {STORE_SLIDES} from '../../src/Store/StoreListing';
import {UIProvider} from '../../src/UIUX/Context';
import {findScreen} from '../../src/UIUX/Registry';

vi.mock('remotion', async (original) => ({...(await original<typeof import('remotion')>()), Img: () => null}));

/**
 * The English store pictures go to SAT/ACT students (owner rule: English is
 * never Turkish). Every drawing a store slide shows, on every device (phone,
 * iPad, web, iPhone Duo), drawn in English, carries no Turkish letters, no
 * Turkish exam (YKS, TYT, AYT, KPSS) and no Turkish names or lessons
 * (Sosyal Medya Yönetimi, 18 Nov 2026: "Good morning, Ayşe", "Goal YKS"),
 * and no Turkish decimal comma (84,25): English writes 84.25.
 */
const TURKISH = /\d,\d{1,2}(?!\d)|[ğüşıöçĞÜŞİÖÇ]|\b(TYT|AYT|YKS|KPSS|LGS|Ayşe|Turkish|Türkçe|net|nets)\b/;

const storeIds = (): string[] => {
	const ids = new Set<string>();
	for (const slide of STORE_SLIDES) {
		ids.add(slide.screens.phone);
		ids.add(slide.screens.web);
		if (slide.screens.tablet) ids.add(slide.screens.tablet);
		ids.add(`f-dis-${slide.screens.phone.slice(2)}`);
		ids.add(slide.screens.web === 'w-test-coz' ? 'f-ic-test-taslak' : `f-ic-${slide.screens.web.slice(2)}`);
	}
	return [...ids];
};

const leftovers = (id: string): string[] => {
	const html = renderToStaticMarkup(React.createElement(UIProvider, {lang: 'en', mode: 'light', children: React.createElement(findScreen(id).Component)}));
	return [...new Set(html.split(/<[^>]+>/).map((text) => text.trim()).filter((text) => text && TURKISH.test(text.replaceAll('Sınavika', ''))))];
};

describe('English store drawings', () => {
	it('show a SAT/ACT student, never Turkish text or a Turkish exam', () => {
		const found = storeIds()
			.map((id) => [id, leftovers(id)] as const)
			.filter(([, texts]) => texts.length > 0)
			.map(([id, texts]) => `${id}: ${texts.join(' ¦ ')}`);
		expect(found).toEqual([]);
	}, 60_000);
});
