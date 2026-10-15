import {describe, expect, it} from 'vitest';
import {AD_CONCEPTS, AD_EXAMS, AD_LANGS, AD_PLATFORMS, AD_TEXT, conceptsFor, PLATFORM_LINE, TEXT_LIMITS} from '../src/Ads/Google/GoogleAdsPlan';
import {buildBannerHtml} from '../src/Ads/Google/Html5Banner';
import {checkProductCopy} from '../src/Configurations/ProductMessaging';

const copyOf = (value: unknown): string[] => (typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(copyOf) : value && typeof value === 'object' ? Object.values(value).flatMap(copyOf) : []);

describe('Google Ads plan', () => {
	it('keeps every text asset within Google’s limits', () => {
		for (const exam of AD_EXAMS)
			for (const platform of AD_PLATFORMS)
				for (const lang of AD_LANGS) {
					const set = AD_TEXT[exam][platform][lang];
					const where = `${exam}/${platform}/${lang}`;
					expect(set.headlines.length, where).toBeGreaterThanOrEqual(3);
					for (const text of set.headlines) expect(text.length, `${where}: ${text}`).toBeLessThanOrEqual(TEXT_LIMITS.headline);
					for (const text of set.longHeadlines) expect(text.length, `${where}: ${text}`).toBeLessThanOrEqual(TEXT_LIMITS.longHeadline);
					for (const text of set.descriptions) expect(text.length, `${where}: ${text}`).toBeLessThanOrEqual(TEXT_LIMITS.description);
					expect(set.descriptions[0].length, `${where}: short description`).toBeLessThanOrEqual(TEXT_LIMITS.shortDescription);
				}
	});

	it('uses picture hooks that also fit as headlines', () => {
		for (const concept of AD_CONCEPTS) for (const lang of AD_LANGS) expect(concept.headline[lang].length, `${concept.exam}/${concept.id}`).toBeLessThanOrEqual(TEXT_LIMITS.headline);
	});

	it('gives each exam four concepts and one HTML5 concept, with unique ids', () => {
		for (const exam of AD_EXAMS) {
			const concepts = conceptsFor(exam);
			expect(concepts).toHaveLength(4);
			expect(new Set(concepts.map((concept) => concept.id)).size).toBe(4);
			expect(concepts.filter((concept) => concept.html5)).toHaveLength(1);
		}
	});

	it('never shows the other exam in a concept', () => {
		for (const concept of AD_CONCEPTS.filter((entry) => entry.exam === 'kpss')) expect(copyOf(concept).join(' '), concept.id).not.toMatch(/\b(TYT|AYT|YKS)\b/);
		for (const concept of AD_CONCEPTS.filter((entry) => entry.exam === 'yks')) expect(copyOf(concept).join(' '), concept.id).not.toMatch(/\bKPSS\b|GY-GK/);
	});

	it('passes the product copy check (names, no koç, no old module names)', () => {
		const texts = [...AD_CONCEPTS.flatMap((concept) => copyOf(concept)), ...copyOf(AD_TEXT), ...copyOf(PLATFORM_LINE)];
		for (const text of texts) {
			const errors = checkProductCopy(text).filter((issue) => issue.severity === 'error');
			expect(errors, text).toEqual([]);
		}
	});

	it('builds HTML5 banners the way Google Ads requires', () => {
		const concept = conceptsFor('yks').find((entry) => entry.html5)!;
		for (const size of [{width: 320, height: 480}, {width: 480, height: 320}]) {
			const html = buildBannerHtml({concept, lang: 'tr', platform: 'mobile', size, files: {device: 'cihaz.png', proof: 'kanit.png', wordmark: 'logo.svg', fonts: ['a.woff2', 'b.woff2']}});
			expect(html).toContain(`<meta name="ad.size" content="width=${size.width},height=${size.height}">`);
			expect(html).toContain('exitapi.js');
			expect(html).toContain('ExitApi.exit()');
			expect(html.match(/https?:\/\//g)).toHaveLength(1);
		}
	});
});
