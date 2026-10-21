import {describe, expect, it} from 'vitest';
import {APPLE_CAMPAIGNS, APPLE_DAILY_BUDGET_USD, CUSTOM_PRODUCT_PAGES, PROMOTIONAL_TEXT_MAX} from '../src/Ads/Apple/AppleAdsPlan';
import {checkProductCopy} from '../src/Configurations/ProductMessaging';

const NOT_OFFERED = /\b(ales|dgs|lgs|yds|öabt|oabt|ags|dhbt)\b/i;
const OTHER_EXAMS = {kpss: /\b(tyt|ayt|yks|sat|act)\b/i, yks: /\b(kpss|sat|act)\b/i, sat: /\b(act|kpss|yks|tyt|ayt)\b/i, act: /\b(sat|kpss|yks|tyt|ayt)\b/i} as const;

describe('Apple Ads plan', () => {
	it('runs one $10 search campaign per market', () => {
		expect(APPLE_CAMPAIGNS.map((campaign) => campaign.market).sort()).toEqual(['en', 'tr']);
		for (const campaign of APPLE_CAMPAIGNS) expect(campaign.dailyBudget).toBe(APPLE_DAILY_BUDGET_USD);
	});

	it('keeps keywords unique, clear of negatives and of exams we do not offer', () => {
		for (const campaign of APPLE_CAMPAIGNS) {
			const all = campaign.adGroups.flatMap((group) => group.keywords);
			expect(new Set(all).size, campaign.name).toBe(all.length);
			for (const keyword of all) {
				expect(keyword, keyword).toBe(keyword.toLocaleLowerCase(campaign.market === 'tr' ? 'tr' : 'en'));
				expect(campaign.negatives, keyword).not.toContain(keyword);
				expect(keyword).not.toMatch(NOT_OFFERED);
			}
		}
	});

	it('keeps each exam group to its own exam', () => {
		for (const campaign of APPLE_CAMPAIGNS)
			for (const group of campaign.adGroups) {
				if (!group.exam) continue;
				expect(group.match, group.name).toBe('EXACT');
				expect(group.searchMatch, group.name).toBe(false);
				for (const keyword of group.keywords) expect(keyword, `${group.name}: ${keyword}`).not.toMatch(OTHER_EXAMS[group.exam]);
			}
	});

	it('writes custom product page copy within App Store limits and brand rules', () => {
		for (const page of CUSTOM_PRODUCT_PAGES) {
			expect(page.promotionalText.length, page.name).toBeLessThanOrEqual(PROMOTIONAL_TEXT_MAX);
			expect(page.promotionalText).not.toMatch(OTHER_EXAMS[page.exam]);
			expect(checkProductCopy(page.promotionalText), page.name).toEqual([]);
			expect(new Set(page.screenshots).size).toBe(8);
		}
	});
});
