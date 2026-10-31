/**
 * The shape of a social media campaign (src/Campaigns): one feed post a day
 * and one Instagram story a day, each with its concept, hook, copy and, for
 * reels, scene flow, voice-over and music. The strategy behind the fields
 * (pillar, funnel stage, hook type, metric) is docs/SocialStrategy.md.
 */
import type {ModuleKey} from '../UIUX/ModuleIdentity';

/** What a post promotes; `marka` is a brand moment (national day, Teachers' Day) with no product call. */
export type CampaignPromotes = 'mobil' | 'web' | 'ikisi' | 'youtube' | 'marka';

/** Content pillars, docs/SocialStrategy.md §4. */
type CampaignPillar = 'Öğren' | 'Strateji' | 'Ürün' | 'Topluluk' | 'Anlar';

/** Funnel stages, docs/SocialStrategy.md §5. */
type CampaignFunnel = 'Keşif' | 'İlgi' | 'Dönüşüm' | 'Bağlılık';

/**
 * Fields every campaign written after 29 Oct 2026 fills in; the October
 * campaign predates them. `time` (HH:MM, Istanbul) publishes every platform at
 * that hour instead of the Buffer schedule, for days whose moment matters
 * (10 Kasım 09.05); it also lets a day carry a different format than the plan.
 */
type CampaignStrategy = {
	pillar?: CampaignPillar;
	funnel?: CampaignFunnel;
	/** The hook type from docs/SocialCreativePlaybook.md §2. */
	hookType?: string;
	/** The one metric that tells whether the post worked. */
	metric?: string;
	time?: string;
};

export type CampaignReel = CampaignStrategy & {
	kind: 'reel';
	date: string;
	id: string;
	module: ModuleKey | 'app';
	promotes: CampaignPromotes;
	/** Admin panelindeki başlık. */
	title: string;
	/** İlk saniyede ekranda ve seste. */
	hook: string;
	altHooks: string[];
	/** Yeni şablonun adı (her tanıtım reels'i yeni bir üretim). */
	template: string;
	/** Hangi örnekten hangi kurgu dili alındı. */
	reference: string;
	beats: string[];
	voiceover: string;
	music: string;
	caption: string;
	hashtags: string[];
};

export type CampaignPost = CampaignStrategy & {
	kind: 'carousel' | 'image';
	date: string;
	id: string;
	module: ModuleKey | 'app';
	promotes: CampaignPromotes;
	title: string;
	hook: string;
	altHooks: string[];
	template: string;
	reference: string;
	/** Kaydırmalı gönderide her sayfa; tek görselde tek madde. */
	slides: string[];
	caption: string;
	hashtags: string[];
};

export type CampaignStory = {
	date: string;
	id: string;
	/** Günün akış gönderisine bağlanır. */
	supports: string;
	hook: string;
	visual: string;
	/** HH:MM, Istanbul; replaces the plan's hour (e.g. 10 Kasım 09.05). */
	time?: string;
};

export type CampaignFeed = CampaignReel | CampaignPost;

export type CampaignInfo = {
	id: string;
	name: string;
	/** First day, YYYY-MM-DD. */
	from: string;
	/** Day after the last one, YYYY-MM-DD. */
	to: string;
	plan: 'tanitim' | 'standart';
};
