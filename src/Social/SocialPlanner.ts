import {
	PLAN_TIME_ZONE,
	PLAN_TIMING,
	POST_TYPES,
	SOCIAL_CONTENT,
	SOCIAL_FORMATS,
	WEEKDAYS,
	SOCIAL_PLANS,
	type SocialPlanName,
	type PlanEntry,
	type SocialPlatform,
	type Weekday,
} from '../Configurations/SocialPlan';

/**
 * Turns the weekly plan into dated slots: what to prepare for which day,
 * platform and hour. A slot is the brief for one post; the content itself is
 * produced later and submitted with the slot's `scheduledAt`.
 */
export type AccountSchedule = {platform: string; postingSchedule?: {day: string; times: string[]; paused?: boolean}[] | null};

/** One platform of a slot: the post type it is published as there, and its own hour. */
export type PlannedTarget = {
	platform: SocialPlatform;
	postType: string;
	scheduledAt: string;
	timeSource: `buffer:${SocialPlatform}` | 'fallback';
};

export type PlannedSlot = PlanEntry & {
	/** Calendar day in Istanbul, YYYY-MM-DD. */
	date: string;
	weekday: Weekday;
	label: string;
	/** The post's main hour, ISO 8601 with the Istanbul offset. Platforms may differ; see `targets`. */
	scheduledAt: string;
	/** Where the main hour came from: the Buffer schedule of a platform, or the plan's fallback. */
	timeSource: `buffer:${SocialPlatform}` | 'fallback';
	/** Per platform: the real post type and the hour it publishes at. This is what gets submitted. */
	targets: PlannedTarget[];
	theme: string;
	imageSize: string | null;
	videoFormat: string | null;
	sourceKind: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EARLIEST_STORY_MINUTE = 7 * 60;

const toDay = (date: string): number => {
	if (!DATE.test(date)) throw new Error(`Dates must be YYYY-MM-DD, got "${date}".`);
	return Date.parse(`${date}T00:00:00Z`);
};

const weekdayOf = (day: number): Weekday => WEEKDAYS[(new Date(day).getUTCDay() + 6) % 7];

const toMinutes = (time: string): number => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
};

const toTime = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const platformTime = (platform: SocialPlatform, weekday: Weekday, accounts: AccountSchedule[]): string | null => {
	const slot = accounts.find((account) => account.platform === platform)?.postingSchedule?.find((day) => day.day === weekday && !day.paused);
	return slot?.times.length ? slot.times[0] : null;
};

const bufferTime = (entry: PlanEntry, weekday: Weekday, accounts: AccountSchedule[]): {time: string; platform: SocialPlatform} | null => {
	for (const platform of PLAN_TIMING.platformPriority) {
		if (!entry.platforms.includes(platform)) continue;
		const time = platformTime(platform, weekday, accounts);
		if (time) return {time, platform};
	}
	return null;
};

/** Slots for every day from `from` up to but not including `to`, in publishing order. */
export const planRange = (from: string, to: string, accounts: AccountSchedule[] = [], plan: SocialPlanName = 'standart'): PlannedSlot[] => {
	const [start, end] = [toDay(from), toDay(to)];
	if (end <= start) throw new Error('"to" must be after "from".');

	const slots: PlannedSlot[] = [];
	for (let day = start; day < end; day += 86_400_000) {
		const date = new Date(day).toISOString().slice(0, 10);
		const weekday = weekdayOf(day);
		const entries = SOCIAL_PLANS[plan][weekday];
		const feed = entries.find((entry) => entry.channel === 'Feed');
		const feedTime = feed ? bufferTime(feed, weekday, accounts) : null;

		for (const entry of entries) {
			const own = entry.channel === 'Story' ? null : bufferTime(entry, weekday, accounts);
			// A story has no Buffer hour of its own: it leads the day's feed post.
			const time =
				entry.channel === 'Story' && feedTime
					? toTime(Math.max(toMinutes(feedTime.time) - PLAN_TIMING.storyLeadMinutes, EARLIEST_STORY_MINUTE))
					: (own?.time ?? PLAN_TIMING.fallbackTime[entry.channel]);
			const source = entry.channel === 'Story' ? feedTime : own;
			const content = SOCIAL_CONTENT[entry.content];
			const format = SOCIAL_FORMATS[entry.format];
			const stamp = (clock: string) => `${date}T${clock}:00${PLAN_TIME_ZONE.offset}`;
			const types: Partial<Record<SocialPlatform, string>> = POST_TYPES[entry.format];
			const targets = entry.platforms.map((platform): PlannedTarget => {
				const postType = types[platform];
				if (!postType) throw new Error(`${platform} cannot publish the format ${entry.format} (${weekday}, ${entry.content}).`);
				// A story keeps the hour worked out above; everything else uses the platform's own Buffer hour.
				const ownTime = entry.channel === 'Story' ? null : platformTime(platform, weekday, accounts);
				return {
					platform,
					postType,
					scheduledAt: stamp(ownTime ?? time),
					timeSource: ownTime ? `buffer:${platform}` : source ? `buffer:${source.platform}` : 'fallback',
				};
			});

			slots.push({
				...entry,
				date,
				weekday,
				label: content.label,
				scheduledAt: stamp(time),
				timeSource: source ? `buffer:${source.platform}` : 'fallback',
				targets,
				theme: content.theme,
				imageSize: format.imageSize,
				videoFormat: format.videoFormat,
				sourceKind: content.sourceKind,
			});
		}
	}
	return slots.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
};

/** The slots of one calendar month, e.g. planMonth('2026-11'). Days 29 to 31 follow the same weekly pattern. */
export const planMonth = (month: string, accounts: AccountSchedule[] = [], plan: SocialPlanName = 'standart'): PlannedSlot[] => {
	if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(`Months must be YYYY-MM, got "${month}".`);
	const [year, index] = month.split('-').map(Number);
	const next = index === 12 ? `${year + 1}-01` : `${year}-${String(index + 1).padStart(2, '0')}`;
	return planRange(`${month}-01`, `${next}-01`, accounts, plan);
};
