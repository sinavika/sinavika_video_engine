import {describe, expect, it} from 'vitest';
import {AD_CONCEPTS, AD_EXAMS, AD_PLATFORMS, AD_TEXT, conceptsFor, DISPLAY_SIZES, displayConceptsFor, EXAM_LANG, EXAM_TAG, examsForLang, PLATFORM_LINE, TEXT_LIMITS, type AdExam} from '../src/Ads/Google/GoogleAdsPlan';
import {buildVideoAdJob, VIDEO_AD_LINES, videoAdSpecs} from '../src/Ads/Google/VideoAdPlan';
import {buildBannerHtml} from '../src/Ads/Google/Html5Banner';
import {checkProductCopy} from '../src/Configurations/ProductMessaging';
import {buildEditorCsv, EDITOR_COLUMNS} from '../src/Ads/Google/SearchExport';
import {CALLOUTS, headlinesFor, NEGATIVE_KEYWORDS, SEARCH_CAMPAIGNS, SEARCH_LIMITS, SITE, SITELINKS, SNIPPET} from '../src/Ads/Google/SearchPlan';

const copyOf = (value: unknown): string[] => (typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(copyOf) : value && typeof value === 'object' ? Object.values(value).flatMap(copyOf) : []);

const OTHER_EXAMS: Record<AdExam, RegExp> = {kpss: /\b(TYT|AYT|YKS|SAT|ACT)\b/, yks: /\bKPSS\b|GY-GK|\b(SAT|ACT)\b/, sat: /\b(ACT|KPSS|YKS|TYT|AYT)\b/, act: /\b(SAT|KPSS|YKS|TYT|AYT)\b/};
const OWN_EXAM: Record<AdExam, RegExp> = {kpss: /KPSS/, yks: /TYT|AYT|YKS/, sat: /\bSAT\b/, act: /\bACT\b/};

describe('Google Ads plan', () => {
	it('keeps every text asset within Google’s limits', () => {
		for (const exam of AD_EXAMS)
			for (const platform of AD_PLATFORMS) {
				const set = AD_TEXT[exam][platform];
				const where = `${exam}/${platform}`;
				expect(set.headlines.length, where).toBeGreaterThanOrEqual(3);
				for (const text of set.headlines) expect(text.length, `${where}: ${text}`).toBeLessThanOrEqual(TEXT_LIMITS.headline);
				for (const text of set.longHeadlines) expect(text.length, `${where}: ${text}`).toBeLessThanOrEqual(TEXT_LIMITS.longHeadline);
				for (const text of set.descriptions) expect(text.length, `${where}: ${text}`).toBeLessThanOrEqual(TEXT_LIMITS.description);
				expect(set.descriptions[0].length, `${where}: short description`).toBeLessThanOrEqual(TEXT_LIMITS.shortDescription);
			}
	});

	it('names the exam in every hook and every first headline, in the market’s language', () => {
		for (const concept of AD_CONCEPTS) {
			const hook = concept.headline[EXAM_LANG[concept.exam]];
			expect(hook.length, `${concept.exam}/${concept.id}`).toBeLessThanOrEqual(TEXT_LIMITS.headline);
			expect(hook, `${concept.exam}/${concept.id}`).toMatch(OWN_EXAM[concept.exam]);
		}
		for (const exam of AD_EXAMS) for (const platform of AD_PLATFORMS) expect(AD_TEXT[exam][platform].headlines[0]).toMatch(OWN_EXAM[exam]);
	});

	it('splits markets by language: Turkey is YKS and KPSS, the United States SAT and ACT', () => {
		expect(examsForLang('tr')).toEqual(['yks', 'kpss']);
		expect(examsForLang('en')).toEqual(['sat', 'act']);
		for (const exam of AD_EXAMS) expect(EXAM_TAG[exam]).toMatch(OWN_EXAM[exam]);
	});

	it('gives each exam four concepts and one HTML5 concept, with unique ids', () => {
		for (const exam of AD_EXAMS) {
			const concepts = conceptsFor(exam);
			expect(concepts).toHaveLength(4);
			expect(new Set(concepts.map((concept) => concept.id)).size).toBe(4);
			expect(concepts.filter((concept) => concept.html5)).toHaveLength(1);
		}
	});

	it('never shows another exam in a concept or its texts', () => {
		for (const concept of AD_CONCEPTS) {
			const lang = EXAM_LANG[concept.exam];
			const shown = copyOf(concept).filter((_, index) => lang === 'en' || index % 2 === 0);
			expect(shown.join(' '), concept.id).not.toMatch(OTHER_EXAMS[concept.exam]);
		}
		for (const exam of AD_EXAMS) for (const platform of AD_PLATFORMS) expect(copyOf(AD_TEXT[exam][platform]).join(' '), `${exam}/${platform}`).not.toMatch(OTHER_EXAMS[exam]);
	});

	it('passes the product copy check (names, no koç, no old module names)', () => {
		const texts = [...AD_CONCEPTS.flatMap((concept) => copyOf(concept)), ...copyOf(AD_TEXT), ...copyOf(PLATFORM_LINE)];
		for (const text of texts) {
			const errors = checkProductCopy(text).filter((issue) => issue.severity === 'error');
			expect(errors, text).toEqual([]);
		}
	});

	it('builds HTML5 banners the way Google Ads requires, with the exam tag', () => {
		for (const exam of AD_EXAMS) {
			const concept = conceptsFor(exam).find((entry) => entry.html5)!;
			for (const size of [{width: 320, height: 480}, {width: 480, height: 320}]) {
				const html = buildBannerHtml({concept, lang: EXAM_LANG[exam], platform: 'mobile', size, files: {device: 'cihaz.png', proof: 'kanit.png', wordmark: 'logo.svg', fonts: ['a.woff2', 'b.woff2']}});
				expect(html).toContain(`<meta name="ad.size" content="width=${size.width},height=${size.height}">`);
				expect(html).toContain('exitapi.js');
				expect(html).toContain('ExitApi.exit()');
				expect(html).toContain('id="tag"');
				expect(html.match(/https?:\/\//g)).toHaveLength(1);
			}
		}
	});
});

describe('Google Ads search plan', () => {
	const allGroups = SEARCH_CAMPAIGNS.flatMap((campaign) => campaign.groups.map((group) => ({campaign, group})));

	it('keeps headlines, descriptions, paths and assets within Google’s limits', () => {
		for (const {campaign, group} of allGroups) {
			const headlines = headlinesFor(campaign, group);
			expect(headlines, group.name).toHaveLength(15);
			expect(new Set(headlines).size, group.name).toBe(15);
			for (const text of headlines) expect(text.length, `${group.name}: ${text}`).toBeLessThanOrEqual(SEARCH_LIMITS.headline);
			for (const path of group.paths) expect(path.length, `${group.name}: ${path}`).toBeLessThanOrEqual(SEARCH_LIMITS.path);
		}
		for (const campaign of SEARCH_CAMPAIGNS) for (const text of campaign.descriptions) expect(text.length, text).toBeLessThanOrEqual(SEARCH_LIMITS.description);
		for (const link of SITELINKS) {
			expect(link.text.length, link.text).toBeLessThanOrEqual(SEARCH_LIMITS.sitelinkText);
			for (const line of [link.line1, link.line2]) expect(line.length, line).toBeLessThanOrEqual(SEARCH_LIMITS.sitelinkDescription);
		}
		for (const text of [...CALLOUTS, ...SNIPPET.values]) expect(text.length, text).toBeLessThanOrEqual(SEARCH_LIMITS.callout);
	});

	it('never blocks its own keywords with a negative', () => {
		const words = (text: string) => ` ${text.toLocaleLowerCase('tr-TR')} `;
		for (const {group} of allGroups)
			for (const keyword of group.keywords)
				for (const negative of NEGATIVE_KEYWORDS) expect(words(keyword).includes(words(negative.keyword)), `${keyword} ⟂ ${negative.keyword}`).toBe(false);
	});

	it('lands every group on a sinavika.com page and keeps each exam to itself', () => {
		for (const {campaign, group} of allGroups) {
			expect(group.landing.startsWith(SITE), group.name).toBe(true);
			const text = [...headlinesFor(campaign, group), ...group.keywords, ...campaign.descriptions].join(' ');
			if (campaign.name.includes('KPSS')) expect(text, group.name).not.toMatch(/\b(TYT|AYT|YKS)\b/i);
			if (campaign.name.includes('YKS')) expect(text, group.name).not.toMatch(/\bKPSS\b|GY-GK/i);
		}
	});

	it('passes the product copy check', () => {
		const texts = [...allGroups.flatMap(({campaign, group}) => headlinesFor(campaign, group)), ...SEARCH_CAMPAIGNS.flatMap((campaign) => campaign.descriptions), ...SITELINKS.flatMap((link) => [link.text, link.line1, link.line2]), ...CALLOUTS];
		for (const text of texts) expect(checkProductCopy(text).filter((issue) => issue.severity === 'error'), text).toEqual([]);
	});

	it('writes an enabled Google Ads Editor import with one ad per group and the chosen budgets', () => {
		const csv = buildEditorCsv();
		const header = csv.slice(1).split('\r\n')[0];
		expect(header.split(',')).toEqual([...EDITOR_COLUMNS]);
		expect(csv.match(/Responsive search ad/g)).toHaveLength(allGroups.length);
		expect(csv).not.toMatch(/Paused/);
		expect(SEARCH_CAMPAIGNS.map((campaign) => campaign.dailyBudget)).toEqual([75, 75, 15]);
	});
});

describe('Google Ads display banners and videos', () => {
	it('banners two concepts per exam in nine IAB sizes', () => {
		expect(DISPLAY_SIZES).toHaveLength(9);
		for (const exam of AD_EXAMS) expect(displayConceptsFor(exam)).toHaveLength(2);
	});

	it('plans 40 videos: 4 exams, 2 promotions, 15 s in three shapes and bumpers in two', () => {
		const specs = videoAdSpecs();
		expect(specs).toHaveLength(40);
		expect(specs.filter((spec) => spec.length === 'bumper').every((spec) => spec.format !== 'Square')).toBe(true);
		for (const spec of specs) expect(spec.lang).toBe(EXAM_LANG[spec.exam]);
	});

	it('voices only Turkish 15 s spots and keeps every spoken line short', () => {
		for (const spec of videoAdSpecs()) {
			const job = buildVideoAdJob(spec);
			expect('voiceover' in job, `${spec.exam}/${spec.length}`).toBe(spec.lang === 'tr' && spec.length === 'short');
			const content = job.content as {hook: {narration: string}; proof: {narration: string}; product: {narration: string}};
			for (const line of [content.hook.narration, content.proof.narration, content.product.narration]) expect(line.split(' ').length, line).toBeLessThanOrEqual(8);
		}
	});

	it('names the exam in the spoken hook and keeps the others out', () => {
		for (const exam of AD_EXAMS) {
			expect(VIDEO_AD_LINES[exam].hook).toMatch(OWN_EXAM[exam]);
			expect(Object.values(VIDEO_AD_LINES[exam]).join(' ')).not.toMatch(OTHER_EXAMS[exam]);
		}
	});
});
