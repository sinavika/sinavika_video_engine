import {describe, expect, it} from 'vitest';
import {CAMPAIGN, CAMPAIGN_FEED, CAMPAIGN_STORIES} from '../src/Campaigns/Tanitim2026Ekim';
import {checkProductCopy} from '../src/Configurations/ProductMessaging';
import {planRange} from '../src/Services/SocialPlanner';

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
