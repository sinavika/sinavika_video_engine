import type {ImageSizeName} from '../Images/Schemas/ImageSizes';
import type {ThemeId} from '../Themes/ThemeRegistry';
import type {VideoFormatId} from './VideoFormats';

/**
 * Sınavika's standard weekly publishing plan, as data. Every weekly and
 * monthly calendar is generated from this file (see Services/SocialPlanner.ts);
 * changing the plan means changing it here and nowhere else.
 */
export const SOCIAL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'linkedin'] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Hours are Istanbul time, which has had no daylight saving since 2016. */
export const PLAN_TIME_ZONE = {name: 'Europe/Istanbul', offset: '+03:00'} as const;

/**
 * The kinds of content in the plan. `theme` gives each kind its place in the
 * feed's light/dark rhythm; within a kind the design never changes.
 * `sourceKind` names the source data the content must be built from, so used
 * records can be tracked; kinds without one are written from the brief.
 */
export const SOCIAL_CONTENT = {
	QuestionSolution: {label: 'Soru çözümü', theme: 'SinavikaLight', sourceKind: 'Question'},
	TopicExplanation: {label: 'Konu anlatımı', theme: 'SinavikaLight', sourceKind: 'Topic'},
	ExamHook: {label: 'Hook / Sınav taktiği', theme: 'SinavikaDark', sourceKind: 'Hook'},
	Promotion: {label: 'Sınavika tanıtımı', theme: 'SinavikaDark', sourceKind: null},
	HardQuestion: {label: 'Zor soru / Mini test', theme: 'SinavikaDark', sourceKind: 'Question'},
	WeeklyRevision: {label: 'Haftalık tekrar', theme: 'SinavikaLight', sourceKind: 'Topic'},
	Story: {label: 'Story', theme: 'SinavikaLight', sourceKind: null},
	LinkedInHook: {label: 'Hook / Problem–Çözüm', theme: 'SinavikaLight', sourceKind: 'Hook'},
	LinkedInProduct: {label: 'Ürün tanıtımı', theme: 'SinavikaLight', sourceKind: null},
	LinkedInBrand: {label: 'Marka / Girişim tanıtımı', theme: 'SinavikaDark', sourceKind: null},
	PromoReel: {label: 'Tanıtım reels', theme: 'SinavikaDark', sourceKind: null},
	PromoPost: {label: 'Tanıtım gönderisi', theme: 'SinavikaLight', sourceKind: null},
	PromoStory: {label: 'Tanıtım hikâyesi', theme: 'SinavikaLight', sourceKind: null},
} as const satisfies Record<string, {label: string; theme: ThemeId; sourceKind: string | null}>;
export type SocialContentKind = keyof typeof SOCIAL_CONTENT;

/** How each format is produced. Carousels and single images share the portrait feed size. */
export const SOCIAL_FORMATS = {
	Carousel: {label: 'Kaydırmalı gönderi', imageSize: 'Portrait', videoFormat: null},
	Image: {label: 'Görsel', imageSize: 'Portrait', videoFormat: null},
	Video: {label: 'Kısa video', imageSize: null, videoFormat: 'Vertical'},
	StoryImage: {label: 'Story', imageSize: 'Story', videoFormat: null},
	LandscapeImage: {label: 'Yatay görsel', imageSize: 'Landscape', videoFormat: null},
} as const satisfies Record<string, {label: string; imageSize: ImageSizeName | null; videoFormat: VideoFormatId | null}>;
export type SocialFormat = keyof typeof SOCIAL_FORMATS;

/**
 * What a format is called on each platform: the real post type it is
 * published as. A platform missing from a format cannot publish it, so a
 * plan entry may only name platforms listed for its format.
 */
export const POST_TYPES = {
	Carousel: {instagram: 'carousel', tiktok: 'photo', linkedin: 'images'},
	Image: {instagram: 'image', tiktok: 'photo', linkedin: 'image'},
	Video: {instagram: 'reel', tiktok: 'video', youtube: 'short', linkedin: 'video'},
	StoryImage: {instagram: 'story'},
	LandscapeImage: {linkedin: 'image'},
} as const satisfies Record<SocialFormat, Partial<Record<SocialPlatform, string>>>;

export const POST_TYPE_NAMES = ['carousel', 'image', 'images', 'reel', 'story', 'photo', 'video', 'short', 'text'] as const;
export type PostType = (typeof POST_TYPE_NAMES)[number];

/** A line of the plan: one post, on one or more platforms. */
export type PlanEntry = {
	/** Feed posts, Instagram stories and LinkedIn run on separate calendars. */
	channel: 'Feed' | 'Story' | 'LinkedIn';
	content: SocialContentKind;
	format: SocialFormat;
	platforms: readonly SocialPlatform[];
	brief: string;
};

const FEED = ['instagram', 'tiktok'] as const;
/** Short videos also go out as YouTube Shorts; carousels and images never do. */
const FEED_VIDEO = ['instagram', 'tiktok', 'youtube'] as const;
const STORY = ['instagram'] as const;
const LINKEDIN = ['linkedin'] as const;

export const WEEKLY_PLAN: Record<Weekday, readonly PlanEntry[]> = {
	mon: [
		{channel: 'Feed', content: 'QuestionSolution', format: 'Carousel', platforms: FEED, brief: 'Matematik sorusu ve adım adım çözümü'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Günün sorusu / Anket'},
		{channel: 'LinkedIn', content: 'LinkedInHook', format: 'LandscapeImage', platforms: LINKEDIN, brief: 'Eğitim sektöründeki bir problem ve Sınavika’nın çözümü'},
	],
	tue: [
		{channel: 'Feed', content: 'TopicExplanation', format: 'Video', platforms: FEED_VIDEO, brief: 'Kısa, öğretici, sınava yönelik konu anlatımı'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Konu anlatımından kısa bilgi / Reels yönlendirmesi'},
	],
	wed: [
		{channel: 'Feed', content: 'ExamHook', format: 'Image', platforms: FEED, brief: 'Dikkat çekici giriş, sınav stratejisi veya pratik bilgi'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Sınav taktiği / Mini bilgi'},
		{channel: 'LinkedIn', content: 'LinkedInProduct', format: 'LandscapeImage', platforms: LINKEDIN, brief: 'Sınavika’nın modülleri, özellikleri ve kullanıcıya faydaları'},
	],
	thu: [
		{channel: 'Feed', content: 'QuestionSolution', format: 'Carousel', platforms: FEED, brief: 'Türkçe veya farklı bir dersin sorusu ve çözümü'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Çoktan seçmeli soru / Cevap etkileşimi'},
	],
	fri: [
		{channel: 'Feed', content: 'Promotion', format: 'Video', platforms: FEED_VIDEO, brief: 'Uygulama özellikleri, kullanım alanları ve öğrenciye faydaları'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Sınavika uygulama özelliği / Tanıtım'},
		{channel: 'LinkedIn', content: 'LinkedInBrand', format: 'LandscapeImage', platforms: LINKEDIN, brief: 'Sınavika’nın gelişimi, vizyonu, yenilikleri ve girişim hikâyesi'},
	],
	sat: [
		{channel: 'Feed', content: 'HardQuestion', format: 'Carousel', platforms: FEED, brief: 'Etkileşim sağlayan zor soru, mini test veya soru serisi'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Mini test / Doğru cevap açıklaması'},
	],
	sun: [
		{channel: 'Feed', content: 'WeeklyRevision', format: 'Video', platforms: FEED_VIDEO, brief: 'Haftanın önemli bilgileri, kısa tekrar veya motivasyon'},
		{channel: 'Story', content: 'Story', format: 'StoryImage', platforms: STORY, brief: 'Haftalık tekrar / Motivasyon / Gelecek haftanın duyurusu'},
	],
};

/**
 * The promotion plan (from October 2026, while no lessons are posted): only
 * the mobile app and the web site are promoted, with user-winning hooks, not
 * teaching. Four reels (Mon, Wed, Fri, Sun), three posts (Tue, Thu, Sat) and a
 * story every day. Buffer cannot publish TikTok stories, so stories go to
 * Instagram only. The day-by-day concepts live in src/Campaigns.
 */
export const PROMO_WEEKLY_PLAN: Record<Weekday, readonly PlanEntry[]> = {
	mon: [
		{channel: 'Feed', content: 'PromoReel', format: 'Video', platforms: FEED_VIDEO, brief: 'Tanıtım reels: tek modül ya da tek özellik, kullanıcı kazandıran hook'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün reels’ine çağrı'},
	],
	tue: [
		{channel: 'Feed', content: 'PromoPost', format: 'Carousel', platforms: FEED, brief: 'Tanıtım gönderisi: özellikleri sırayla gösteren kaydırmalı gönderi'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün gönderisine çağrı'},
	],
	wed: [
		{channel: 'Feed', content: 'PromoReel', format: 'Video', platforms: FEED_VIDEO, brief: 'Tanıtım reels'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün reels’ine çağrı'},
	],
	thu: [
		{channel: 'Feed', content: 'PromoPost', format: 'Image', platforms: FEED, brief: 'Tanıtım gönderisi: tek görsel, tek mesaj'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün gönderisine çağrı'},
	],
	fri: [
		{channel: 'Feed', content: 'PromoReel', format: 'Video', platforms: FEED_VIDEO, brief: 'Tanıtım reels'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün reels’ine çağrı'},
	],
	sat: [
		{channel: 'Feed', content: 'PromoPost', format: 'Carousel', platforms: FEED, brief: 'Tanıtım gönderisi: kaydırmalı'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün gönderisine çağrı'},
	],
	sun: [
		{channel: 'Feed', content: 'PromoReel', format: 'Video', platforms: FEED_VIDEO, brief: 'Tanıtım reels'},
		{channel: 'Story', content: 'PromoStory', format: 'StoryImage', platforms: STORY, brief: 'Günün reels’ine çağrı'},
	],
};

/** The plans the calendar can be generated from: `npm run social -- plan --plan tanitim`. */
export const SOCIAL_PLANS = {standart: WEEKLY_PLAN, tanitim: PROMO_WEEKLY_PLAN} as const;
export type SocialPlanName = keyof typeof SOCIAL_PLANS;

/**
 * Publishing hours come from the posting schedule defined in Buffer for each
 * account, and every platform publishes at its own hour: a video goes out at
 * Instagram's hour on Instagram and at YouTube's hour on YouTube. Buffer keeps
 * one schedule per account, not per post type, so a reel and a carousel on
 * the same account share its hours.
 *
 * A platform with no Buffer hour on a weekday publishes with the post's main
 * hour: that of the first platform below that does have one. The fallback
 * hours apply only when no platform of the post has a Buffer hour that day
 * (or the account is not connected yet).
 */
export const PLAN_TIMING = {
	platformPriority: ['instagram', 'tiktok', 'youtube', 'linkedin'],
	fallbackTime: {Feed: '20:00', Story: '12:30', LinkedIn: '09:30'},
	/** A story supports the day's feed post, so it goes out this many minutes before it. */
	storyLeadMinutes: 180,
} as const satisfies {platformPriority: readonly SocialPlatform[]; fallbackTime: Record<PlanEntry['channel'], string>; storyLeadMinutes: number};

export const BRAND_HASHTAG = '#sinavika';
