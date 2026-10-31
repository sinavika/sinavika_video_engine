import {describe, expect, it} from 'vitest';
import {CAMPAIGN, CAMPAIGN_FEED, CAMPAIGN_STORIES} from '../../src/Campaigns/Tanitim2026Ekim';
import * as November from '../../src/Campaigns/Tanitim2026Kasim';
import {CAMPAIGNS} from '../../src/Campaigns/CampaignScaffold';
import {checkProductCopy} from '../../src/Configurations/ProductMessaging';
import {REEL_STANDARD} from '../../src/Configurations/ReelStandard';
import {checkSpecialDayCopy, isSpecialDay, SPECIAL_DAY_YEARS, specialDaysOn} from '../../src/Configurations/SpecialDay';
import {planRange} from '../../src/Services/SocialPlanner';

const slots = planRange(CAMPAIGN.from, CAMPAIGN.to, [], CAMPAIGN.plan);
/** Published text only: `reference` is an internal note on which example a cut borrows from. */
const textOf = (value: unknown): string[] => (typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(textOf) : value && typeof value === 'object' ? Object.entries(value).flatMap(([key, item]) => (key === 'reference' ? [] : textOf(item))) : []);

describe('Ekim 2026 tanıtım kampanyası', () => {
	it('fills every slot of the promotion plan, one feed post and one story a day', () => {
		const feedSlots = slots.filter((slot) => slot.channel === 'Feed');
		const storySlots = slots.filter((slot) => slot.channel === 'Story');
		expect(feedSlots).toHaveLength(16);
		expect(storySlots).toHaveLength(16);
		expect(CAMPAIGN_FEED.map((entry) => entry.date)).toEqual(feedSlots.map((slot) => slot.date));
		expect(CAMPAIGN_STORIES.map((entry) => entry.date)).toEqual(storySlots.map((slot) => slot.date));
	});

	it('matches each day’s format: reels on video days, carousels and images on post days', () => {
		for (const entry of CAMPAIGN_FEED) {
			const slot = slots.find((candidate) => candidate.channel === 'Feed' && candidate.date === entry.date)!;
			const expected = slot.format === 'Video' ? 'reel' : slot.format === 'Carousel' ? 'carousel' : 'image';
			expect(entry.kind, entry.id).toBe(expected);
		}
	});

	it('runs 4 reels and 3 posts a week, and every reel is its own production', () => {
		const reels = CAMPAIGN_FEED.filter((entry) => entry.kind === 'reel');
		expect(reels).toHaveLength(9);
		expect(CAMPAIGN_FEED.filter((entry) => entry.kind !== 'reel')).toHaveLength(7);
		expect(new Set(reels.map((entry) => entry.kind === 'reel' && entry.template)).size).toBe(reels.length);
		expect(new Set(reels.map((entry) => entry.kind === 'reel' && entry.music)).size).toBe(reels.length);
	});

	it('gives SinoAI its own series', () => {
		expect(CAMPAIGN_FEED.filter((entry) => entry.module === 'sinoAi').length).toBeGreaterThanOrEqual(4);
	});

	it('keeps ids unique and stories tied to that day’s feed post', () => {
		expect(new Set(CAMPAIGN_FEED.map((entry) => entry.id)).size).toBe(CAMPAIGN_FEED.length);
		for (const story of CAMPAIGN_STORIES) {
			const feed = CAMPAIGN_FEED.find((entry) => entry.id === story.supports);
			expect(feed?.date, story.id).toBe(story.date);
		}
	});

	it('stays within platform limits: 5 hashtags (TikTok), Instagram caption length', () => {
		for (const entry of CAMPAIGN_FEED) {
			expect(entry.hashtags.length, entry.id).toBeLessThanOrEqual(5);
			expect(`${entry.caption}\n\n${entry.hashtags.join(' ')}`.length, entry.id).toBeLessThanOrEqual(2196);
		}
	});

	it('passes the product copy check and never teaches or names a competitor', () => {
		for (const text of [...textOf(CAMPAIGN_FEED), ...textOf(CAMPAIGN_STORIES)]) {
			expect(checkProductCopy(text).filter((issue) => issue.severity === 'error'), text).toEqual([]);
			expect(text, text).not.toMatch(/Netflix|ChatGPT|OpenAI|Gemini|Apple(?! ?TV)|\bkoç\b/i);
		}
	});
});

describe('Kasım 2026 tanıtım kampanyası', () => {
	const nov = planRange(November.CAMPAIGN.from, November.CAMPAIGN.to, [], November.CAMPAIGN.plan);
	const feed = November.CAMPAIGN_FEED;
	const reels = feed.filter((entry) => entry.kind === 'reel');

	it('fills every day of November with one feed post and one story', () => {
		expect(nov.filter((slot) => slot.channel === 'Feed').map((slot) => slot.date)).toEqual(feed.map((entry) => entry.date));
		expect(nov.filter((slot) => slot.channel === 'Story').map((slot) => slot.date)).toEqual(November.CAMPAIGN_STORIES.map((story) => story.date));
		expect(feed).toHaveLength(30);
	});

	it('follows the plan’s format, except the two special days that carry their own hour', () => {
		const special = feed.filter((entry) => entry.time);
		expect(special.map((entry) => `${entry.date} ${entry.time}`)).toEqual(['2026-11-10 09:05', '2026-11-24 08:00']);
		for (const entry of feed.filter((candidate) => !candidate.time)) {
			const slot = nov.find((candidate) => candidate.channel === 'Feed' && candidate.date === entry.date)!;
			expect(entry.kind, entry.id).toBe(slot.format === 'Video' ? 'reel' : slot.format === 'Carousel' ? 'carousel' : 'image');
		}
		for (const entry of special) {
			expect(entry.kind, entry.id).toBe('reel');
			expect(entry.pillar, entry.id).toBe('Anlar');
			expect(entry.promotes, entry.id).toBe('marka');
		}
	});

	it('makes every reel a new production: no template or music reused from October or within the month', () => {
		expect(reels).toHaveLength(20);
		const templates = [...CAMPAIGN_FEED, ...feed].filter((entry) => entry.kind === 'reel').map((entry) => entry.template);
		const music = [...CAMPAIGN_FEED, ...feed].flatMap((entry) => (entry.kind === 'reel' ? [entry.music] : []));
		expect(new Set(templates).size).toBe(templates.length);
		expect(new Set(music).size).toBe(music.length);
		for (const template of ['RepublicDay', 'AppPromotion', 'AppShowcase', 'ExamJourney']) expect(templates).not.toContain(template);
	});

	it('tags every post with its pillar, funnel stage, hook type and metric, and writes three hook candidates', () => {
		for (const entry of feed) {
			expect(['Ürün', 'Topluluk', 'Anlar'], entry.id).toContain(entry.pillar);
			expect(entry.funnel && entry.hookType && entry.metric, entry.id).toBeTruthy();
			expect(entry.altHooks.length, entry.id).toBeGreaterThanOrEqual(2);
		}
		expect(feed.filter((entry) => entry.module === 'sinoAi').length).toBeGreaterThanOrEqual(4);
	});

	it('keeps captions within limits: 3–5 hashtags, #sinavika first except on special days, Instagram length', () => {
		for (const entry of feed) {
			if (entry.pillar === 'Anlar') expect(entry.hashtags, entry.id).not.toContain('#sinavika');
			else expect(entry.hashtags[0], entry.id).toBe('#sinavika');
			expect(entry.hashtags.length, entry.id).toBeGreaterThanOrEqual(3);
			expect(entry.hashtags.length, entry.id).toBeLessThanOrEqual(5);
			expect(`${entry.caption}\n\n${entry.hashtags.join(' ')}`.length, entry.id).toBeLessThanOrEqual(2196);
		}
	});

	it('ties each story to that day’s post', () => {
		expect(new Set(feed.map((entry) => entry.id)).size).toBe(feed.length);
		for (const story of November.CAMPAIGN_STORIES) expect(feed.find((entry) => entry.id === story.supports)?.date, story.id).toBe(story.date);
	});

	it('passes the product copy check, names no competitor and promises no free plan', () => {
		for (const text of [...textOf(feed), ...textOf(November.CAMPAIGN_STORIES)]) {
			expect(checkProductCopy(text).filter((issue) => issue.severity === 'error'), text).toEqual([]);
			expect(text, text).not.toMatch(/Netflix|ChatGPT|OpenAI|Gemini|Tetris|WhatsApp|Apple(?! ?TV)|\bkoç\b/i);
			// No payment, no access (20 Oct 2026): only the download, the store trial, guest SinoAI and the YouTube camp are free.
			expect(text, text).not.toMatch(/ücretsiz\s+(başla|dene|kullan|plan|üyelik)/i);
		}
	});

	it('keeps the special days free of advertising: only the logo, no brand name, product or call', () => {
		const specials = feed.filter((candidate) => candidate.pillar === 'Anlar');
		expect(specials.map((entry) => entry.date)).toEqual(['2026-11-10', '2026-11-24']);
		const stories = November.CAMPAIGN_STORIES.filter((story) => specials.some((entry) => entry.id === story.supports));
		for (const story of stories) expect(story.time, story.id).toBeTruthy();
	});
});

/** What a holiday post shows or says: everything but internal notes (`reference`, a story's `visual` design note). */
const publishedTexts = (entry: (typeof November.CAMPAIGN_FEED)[number]): string[] => [entry.title, entry.hook, ...entry.altHooks, entry.caption, ...entry.hashtags, ...(entry.kind === 'reel' ? [entry.voiceover, ...entry.beats] : entry.slides)];

describe('Özel günler: milli ve dini bayramlar', () => {
	it('knows the holidays, both fixed and Diyanet’s moving ones', () => {
		expect(specialDaysOn('2026-11-10').map((day) => day.id)).toEqual(['10-kasim']);
		expect(specialDaysOn('2026-11-24').map((day) => day.id)).toEqual(['24-kasim']);
		expect(specialDaysOn('2027-03-10').map((day) => day.kind)).toEqual(['dini-bayram']);
		// 19 Mayıs 2027 is both a national holiday and the fourth day of Kurban Bayramı.
		expect(specialDaysOn('2027-05-19').map((day) => day.kind).sort()).toEqual(['dini-bayram', 'milli-bayram']);
		expect(isSpecialDay('2027-03-08'), 'arefe is not the holiday').toBe(false);
		expect(isSpecialDay('2026-11-11')).toBe(false);
	});

	it('catches an advert in any case or form', () => {
		expect(checkSpecialDayCopy(['SINAVİKA ile çalış', 'Hemen İndir', '#sinavika', 'Link profilde'])).toHaveLength(5);
		expect(checkSpecialDayCopy(['Saygıyla anıyoruz.', '#10Kasım #Atatürk'])).toEqual([]);
	});

	// October 2026 was planned before the rule (29 Ekim also carried a promotion reel); every campaign after it follows it.
	const ruled = Object.values(CAMPAIGNS).filter(({campaign}) => campaign.from >= '2026-11-01');

	it('has the moving holidays of every campaign year entered', () => {
		for (const {campaign} of ruled) expect(SPECIAL_DAY_YEARS, campaign.id).toContain(Number(campaign.from.slice(0, 4)));
	});

	it('posts nothing but the day itself on a holiday: no brand, product, call or #sinavika, only the logo', () => {
		for (const {campaign, feed, stories} of ruled) {
			for (const entry of feed.filter((candidate) => isSpecialDay(candidate.date))) {
				expect(entry.pillar, `${campaign.id} ${entry.id}`).toBe('Anlar');
				expect(entry.promotes, `${campaign.id} ${entry.id}`).toBe('marka');
				expect(checkSpecialDayCopy(publishedTexts(entry)), `${campaign.id} ${entry.id}`).toEqual([]);
				expect(entry.hashtags.every((tag) => specialDaysOn(entry.date).some((day) => day.hashtags.includes(tag))), `${entry.id}: only the day's own hashtags`).toBe(true);
			}
			for (const story of stories.filter((candidate) => isSpecialDay(candidate.date))) {
				expect(checkSpecialDayCopy([story.hook]), `${campaign.id} ${story.id}`).toEqual([]);
			}
			for (const entry of feed.filter((candidate) => candidate.pillar === 'Anlar')) expect(isSpecialDay(entry.date), `${entry.id}: Anlar only on a special day`).toBe(true);
		}
	});
});

describe('Tanıtım reels’lerinin temposu (ölçüm ve dış değerlendirme, 29 Ekim 2026)', () => {
	const promoReels = November.CAMPAIGN_FEED.flatMap((entry) => (entry.kind === 'reel' && entry.pillar !== 'Anlar' ? [entry] : []));
	/** The end of a beat's time range, in seconds ("15–18 sn: …" → 18). */
	const beatEnd = (beat: string) => Number(beat.match(/^\d+(?:,\d+)?–(\d+(?:,\d+)?) sn:/)?.[1].replace(',', '.'));

	it('opens on a hook of five words at most', () => {
		for (const entry of promoReels) expect(entry.hook.split(/\s+/).length, `${entry.id}: "${entry.hook}"`).toBeLessThanOrEqual(REEL_STANDARD.hookMaxWords);
	});

	it('says the hook as its first words and shows it in the first beat', () => {
		for (const entry of promoReels) {
			// Compared as words: punctuation may differ, and a "POV:" label is only written, not said.
			const words = (text: string) => text.replace(/^POV:\s*/, '').toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
			expect(words(entry.voiceover).startsWith(words(entry.hook)), entry.id).toBe(true);
			expect(entry.beats[0], entry.id).toMatch(/^0–1 sn: /);
		}
	});

	it('runs 18 s at most: 15 s of its own, then the 3 s app card', () => {
		for (const entry of promoReels) {
			expect(entry.beats.at(-1), entry.id).toBe(`${REEL_STANDARD.contentMaxSeconds}–${REEL_STANDARD.maxSeconds} sn: AppEndCard.`);
			for (const beat of entry.beats) expect(beatEnd(beat), `${entry.id}: ${beat}`).toBeLessThanOrEqual(REEL_STANDARD.maxSeconds);
		}
	});

	it('keeps the voice to about 13 s and leaves the download line to the card', () => {
		for (const entry of promoReels) {
			expect(entry.voiceover.length, entry.id).toBeLessThanOrEqual(REEL_STANDARD.voiceoverMaxCharacters);
			expect(entry.voiceover, entry.id).not.toMatch(/Sınavika’yı (ücretsiz )?indir\.?$/);
		}
	});
});
