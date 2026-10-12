import {describe, expect, it} from 'vitest';
import {BRAND_COLORS} from '../src/Configurations/BrandColors';
import {SOCIAL_CONTENT, WEEKDAYS, WEEKLY_PLAN} from '../src/Configurations/SocialPlan';
import {planMonth, planRange, type AccountSchedule} from '../src/Services/SocialPlanner';
import {contrastRatio} from '../src/Themes/ColorPalette';
import {PALETTES} from '../src/Themes/Palettes';
import {THEMES} from '../src/Themes/ThemeRegistry';

/** The posting schedules read from the Sınavika Buffer account on 2026-10-12. */
const accounts: AccountSchedule[] = [
	{platform: 'instagram', postingSchedule: [{day: 'mon', times: ['20:53']}, {day: 'tue', times: ['19:09']}, {day: 'wed', times: ['18:50']}, {day: 'thu', times: ['10:25']}, {day: 'fri', times: ['07:17']}, {day: 'sat', times: []}, {day: 'sun', times: []}]},
	{platform: 'tiktok', postingSchedule: [{day: 'mon', times: ['09:47']}, {day: 'sat', times: ['17:39']}, {day: 'sun', times: ['09:27']}]},
	{platform: 'youtube', postingSchedule: [{day: 'tue', times: ['20:07']}]},
];

describe('weekly plan', () => {
	const entries = WEEKDAYS.flatMap((day) => WEEKLY_PLAN[day]);
	const count = (test: (entry: (typeof entries)[number]) => boolean) => entries.filter(test).length;

	it('has one feed post and one story every day, on Instagram and TikTok', () => {
		for (const day of WEEKDAYS) {
			const feed = WEEKLY_PLAN[day].filter((entry) => entry.channel === 'Feed');
			expect(feed).toHaveLength(1);
			expect(feed[0].platforms).toEqual(expect.arrayContaining(['instagram', 'tiktok']));
			expect(WEEKLY_PLAN[day].filter((entry) => entry.channel === 'Story').map((entry) => entry.platforms)).toEqual([['instagram']]);
		}
	});

	it('keeps the agreed weekly mix', () => {
		expect(count((entry) => entry.content === 'QuestionSolution' || entry.content === 'HardQuestion')).toBe(3);
		expect(count((entry) => entry.content === 'TopicExplanation' || entry.content === 'WeeklyRevision')).toBe(2);
		expect(count((entry) => entry.content === 'ExamHook')).toBe(1);
		expect(count((entry) => entry.content === 'Promotion')).toBe(1);
	});

	it('sends only the three short videos to YouTube, and never a carousel or image', () => {
		const youtube = WEEKDAYS.filter((day) => WEEKLY_PLAN[day].some((entry) => entry.platforms.includes('youtube')));
		expect(youtube).toEqual(['tue', 'fri', 'sun']);
		entries.filter((entry) => entry.platforms.includes('youtube')).forEach((entry) => expect(entry.format).toBe('Video'));
		entries.filter((entry) => entry.channel === 'Feed' && entry.format === 'Video').forEach((entry) => expect(entry.platforms).toContain('youtube'));
	});

	it('keeps LinkedIn separate: three promotional posts, no lessons or questions', () => {
		const linkedin = WEEKDAYS.filter((day) => WEEKLY_PLAN[day].some((entry) => entry.channel === 'LinkedIn'));
		expect(linkedin).toEqual(['mon', 'wed', 'fri']);
		entries.filter((entry) => entry.platforms.includes('linkedin')).forEach((entry) => {
			expect(entry.platforms).toEqual(['linkedin']);
			expect(entry.content).toMatch(/^LinkedIn/);
		});
	});
});

describe('planRange', () => {
	it('takes the hour from Buffer, by platform priority, and falls back only where Buffer has none', () => {
		const week = planRange('2026-11-02', '2026-11-09', accounts);
		const feed = Object.fromEntries(week.filter((slot) => slot.channel === 'Feed').map((slot) => [slot.weekday, slot]));

		expect(feed.mon).toMatchObject({date: '2026-11-02', scheduledAt: '2026-11-02T20:53:00+03:00', timeSource: 'buffer:instagram'});
		expect(feed.tue).toMatchObject({scheduledAt: '2026-11-03T19:09:00+03:00', timeSource: 'buffer:instagram'});
		expect(feed.sat).toMatchObject({scheduledAt: '2026-11-07T17:39:00+03:00', timeSource: 'buffer:tiktok'});
		expect(feed.sun).toMatchObject({scheduledAt: '2026-11-08T09:27:00+03:00', timeSource: 'buffer:tiktok'});
		expect(week.find((slot) => slot.channel === 'LinkedIn')).toMatchObject({scheduledAt: '2026-11-02T09:30:00+03:00', timeSource: 'fallback'});
	});

	it('gives every platform its real post type and its own Buffer hour', () => {
		const week = planRange('2026-11-02', '2026-11-09', accounts);
		const targetsOf = (weekday: string, channel: string) => week.find((slot) => slot.weekday === weekday && slot.channel === channel)!.targets;
		const brief = (weekday: string, channel = 'Feed') => targetsOf(weekday, channel).map((target) => `${target.platform}:${target.postType} ${target.scheduledAt.slice(11, 16)} ${target.timeSource}`);

		expect(brief('mon')).toEqual(['instagram:carousel 20:53 buffer:instagram', 'tiktok:photo 09:47 buffer:tiktok']);
		// TikTok has no Buffer hour on Tuesday here, so it follows the post's main hour; YouTube has its own.
		expect(brief('tue')).toEqual(['instagram:reel 19:09 buffer:instagram', 'tiktok:video 19:09 buffer:instagram', 'youtube:short 20:07 buffer:youtube']);
		expect(brief('wed')).toEqual(['instagram:image 18:50 buffer:instagram', 'tiktok:photo 18:50 buffer:instagram']);
		expect(brief('mon', 'Story')).toEqual(['instagram:story 17:53 buffer:instagram']);
		expect(brief('mon', 'LinkedIn')).toEqual(['linkedin:image 09:30 fallback']);
	});

	it('never plans a post type a platform does not have', () => {
		const allowed: Record<string, string[]> = {instagram: ['carousel', 'image', 'reel', 'story'], tiktok: ['photo', 'video'], youtube: ['short'], linkedin: ['image', 'images', 'video', 'text']};
		for (const slot of planMonth('2026-11', accounts)) {
			expect(slot.targets.map((target) => target.platform)).toEqual(slot.platforms);
			slot.targets.forEach((target) => expect(allowed[target.platform], `${slot.date} ${target.platform}`).toContain(target.postType));
		}
	});

	it('puts the story ahead of the feed post, never before 07:00', () => {
		const stories = Object.fromEntries(planRange('2026-11-02', '2026-11-09', accounts).filter((slot) => slot.channel === 'Story').map((slot) => [slot.weekday, slot.scheduledAt]));
		expect(stories.mon).toBe('2026-11-02T17:53:00+03:00');
		expect(stories.fri).toBe('2026-11-06T07:00:00+03:00');
	});

	it('uses the fallback hours when no schedule is known', () => {
		const monday = planRange('2026-11-02', '2026-11-03');
		expect(monday.map((slot) => [slot.channel, slot.scheduledAt.slice(11, 16), slot.timeSource])).toEqual([
			['LinkedIn', '09:30', 'fallback'],
			['Story', '12:30', 'fallback'],
			['Feed', '20:00', 'fallback'],
		]);
	});

	it('carries what is needed to produce each slot', () => {
		const [story, video] = [planRange('2026-11-03', '2026-11-04').find((slot) => slot.channel === 'Story')!, planRange('2026-11-03', '2026-11-04').find((slot) => slot.format === 'Video')!];
		expect(story).toMatchObject({imageSize: 'Story', videoFormat: null, theme: 'SinavikaLight'});
		expect(video).toMatchObject({imageSize: null, videoFormat: 'Vertical', sourceKind: 'Topic', label: 'Konu anlatımı'});
	});

	it('plans whole months, including days 29 to 31, and rejects bad input', () => {
		const november = planMonth('2026-11');
		expect(new Set(november.map((slot) => slot.date)).size).toBe(30);
		expect(november.filter((slot) => slot.channel === 'Feed')).toHaveLength(30);
		expect(november.filter((slot) => slot.channel === 'LinkedIn')).toHaveLength(13);
		expect(planMonth('2026-12').at(-1)?.date).toBe('2026-12-31');
		expect(planMonth('2028-02').filter((slot) => slot.channel === 'Feed')).toHaveLength(29);
		expect(() => planRange('02.11.2026', '2026-11-09')).toThrow(/YYYY-MM-DD/);
		expect(() => planRange('2026-11-09', '2026-11-02')).toThrow();
	});
});

describe('brand palette', () => {
	it('builds the two official palettes from the brand colours', () => {
		expect(PALETTES.SinavikaLightV1).toMatchObject({primary: '#EA580C', background: '#FAFAFA', surface: '#FFFFFF', text: '#0B1C30', border: '#E5E7EB'});
		expect(PALETTES.SinavikaDarkV1).toMatchObject({primary: '#FB923C', background: '#0F1115', surface: '#1E2026', text: '#F4F4F5'});
		expect(PALETTES.SinavikaLightV1.success).toBe(BRAND_COLORS.status.success.light);
		expect(PALETTES.SinavikaDarkV1.error).toBe(BRAND_COLORS.status.error.dark);
	});

	it('registers them as themes that every planned content kind uses, with readable text', () => {
		for (const {theme} of Object.values(SOCIAL_CONTENT)) {
			expect(['SinavikaLight', 'SinavikaDark']).toContain(theme);
			const {colors} = THEMES[theme];
			expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(colors.onSurface, colors.surface)).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(3);
		}
		// White on the brand orange, as on sinavika.com.
		expect(THEMES.SinavikaLight.colors.onPrimary).toBe('#FFFFFF');
		expect(THEMES.SinavikaLight.colors.primary).toBe('#EA580C');
		expect(THEMES.SinavikaBrand.colors.primary).toBe('#5B3DF5');
	});

	it('keeps purple out of the brand palettes: it is reserved for solution review', () => {
		const used = [...Object.values(PALETTES.SinavikaLightV1), ...Object.values(PALETTES.SinavikaDarkV1)].flat();
		Object.values(BRAND_COLORS.review).forEach((purple) => expect(used).not.toContain(purple));
	});
});
