/**
 * Turns a campaign into post folders: for every feed post and story, a
 * `Posts/<date>_<Name>/` folder with the brief and a Post.json draft (title,
 * caption, hashtags, hour and targets from the plan, and where the rendered
 * media will be). A day whose old post an admin rejected gets that post's id
 * as `replacesPostId`, so the new content takes its place.
 *
 * The drafts are not submitted: production renders the media into
 * `Media/` and fills in what is missing, then `npm run social -- submit`.
 */
import {PLAN_TIME_ZONE, POST_TYPES} from '../Configurations/SocialPlan';
import {specialDaysOn} from '../Configurations/SpecialDay';
import type {PlannedSlot, PlannedTarget} from '../Services/SocialPlanner';

/** A platform, its real post type there and the hour it publishes at: what a Post.json target carries. */
type FeedTarget = Pick<PlannedTarget, 'platform' | 'postType' | 'scheduledAt'>;
import type {CampaignFeed, CampaignStory} from './CampaignTypes';
import * as October from './Tanitim2026Ekim';
import * as November from './Tanitim2026Kasim';

export const CAMPAIGNS = {
	[October.CAMPAIGN.id]: {campaign: October.CAMPAIGN, feed: October.CAMPAIGN_FEED, stories: October.CAMPAIGN_STORIES},
	[November.CAMPAIGN.id]: {campaign: November.CAMPAIGN, feed: November.CAMPAIGN_FEED, stories: November.CAMPAIGN_STORIES},
} as const;
export type CampaignId = keyof typeof CAMPAIGNS;

/** A post on the server, as the calendar returns it (only what the scaffold needs). */
export type ExistingPost = {id: string; title: string; scheduledAt: string; status: number};
/** Post status codes on the server: 0 waiting, 1 approved, 2 rejected. */
const REJECTED = 2;

type ScaffoldFile = {path: string; content: string};

const pascal = (id: string) =>
	id
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('')
		.replace(/[^A-Za-z0-9]/g, '');

const istanbulDate = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', {timeZone: 'Europe/Istanbul'});

const plannedMedia = (entry: CampaignFeed | CampaignStory, kind: 'reel' | 'carousel' | 'image' | 'story'): string[] => {
	const name = pascal(entry.id);
	if (kind === 'reel') return [`Media/${name}.mp4`];
	if (kind === 'carousel' && 'slides' in entry) return entry.slides.map((_, index) => `Media/${String(index + 1).padStart(2, '0')}_${name}.png`);
	return [`Media/${name}.png`];
};

/** On a holiday the brief says it first: no advert, only the logo (Configurations/SpecialDay). */
const specialDayLines = (date: string): string[] =>
	specialDaysOn(date).map((day) => `- **Özel gün:** ${day.name}. Reklam yok, yalnız köşede küçük logo: marka adı, ürün, "indir", bağlantı ve #sinavika yok; etiketler günün kendi etiketleri (${day.hashtags.join(' ')}).`);

const brief = (entry: CampaignFeed, targets: FeedTarget[], replaces?: ExistingPost): string => {
	const lines = [
		`# ${entry.title}`,
		'',
		`- **Tarih:** ${entry.date} · ${targets.map((target) => `${target.platform} ${target.postType} ${target.scheduledAt.slice(11, 16)}`).join(' · ')}${entry.time ? ' (günün kendi saati, Buffer programı değil)' : ''}`,
		`- **Tür:** ${entry.kind} · **Modül:** ${entry.module} · **Tanıtılan:** ${entry.promotes}`,
		...specialDayLines(entry.date),
		...(entry.pillar ? [`- **Sütun:** ${entry.pillar} · **Huni:** ${entry.funnel ?? '-'} · **Hook türü:** ${entry.hookType ?? '-'} · **İzlenecek metrik:** ${entry.metric ?? '-'}`] : []),
		`- **Şablon:** ${entry.template}${entry.kind === 'reel' ? ' (yeni)' : ''} · **Referans:** ${entry.reference}`,
		replaces ? `- **Sunucu:** reddedilen "${replaces.title}" gönderisinin yerine (\`replacesPostId: ${replaces.id}\`)` : '- **Sunucu:** yeni gönderi',
		'',
		`## Hook`,
		'',
		`**${entry.hook}**`,
		'',
		`Alternatifler: ${entry.altHooks.map((hook) => `"${hook}"`).join(' · ')}`,
		'',
	];
	if (entry.kind === 'reel') {
		lines.push('## Sahne akışı', '', ...entry.beats.map((beat) => `- ${beat}`), '', '## Seslendirme (taslak)', '', entry.voiceover, '', `Karakter: ${entry.voiceover.length}`, '', '## Müzik (ElevenLabs Music tarifi)', '', entry.music, '');
	} else {
		lines.push(entry.kind === 'carousel' ? '## Sayfalar' : '## Görsel', '', ...entry.slides.map((slide, index) => `${index + 1}. ${slide}`), '');
	}
	lines.push('## Açıklama', '', entry.caption, '', entry.hashtags.join(' '), '');
	return lines.join('\n');
};

const at = (date: string, time: string) => `${date}T${time}:00${PLAN_TIME_ZONE.offset}`;

/** The plan's format a campaign entry needs. */
const formatOf = (kind: CampaignFeed['kind']) => (kind === 'reel' ? 'Video' : kind === 'carousel' ? 'Carousel' : 'Image');

/**
 * Where and when an entry goes out. Normally the plan's targets (each platform
 * at its Buffer hour). An entry with its own `time` publishes every platform at
 * that hour; if its kind differs from the plan's format that day (10 Kasım: a
 * reel on a carousel day), the platforms follow the kind: Instagram and TikTok,
 * plus YouTube Shorts for a video.
 */
const feedTargets = (entry: CampaignFeed, slot: PlannedSlot): FeedTarget[] => {
	const format = formatOf(entry.kind);
	if (slot.format === format && !entry.time) return slot.targets;
	if (!entry.time) throw new Error(`${entry.date} planda ${slot.format}; ${entry.id} ${entry.kind} olacaksa kendi saatini (time) yazmalı.`);
	const postTypes: Partial<Record<FeedTarget['platform'], string>> = POST_TYPES[format];
	const platforms = format === 'Video' ? (['instagram', 'tiktok', 'youtube'] as const) : (['instagram', 'tiktok'] as const);
	return platforms.map((platform) => ({platform, postType: postTypes[platform]!, scheduledAt: at(entry.date, entry.time!)}));
};

/** The files to write for a campaign; `existing` is the server calendar for the campaign's dates. */
export const scaffoldCampaign = (id: CampaignId, slots: PlannedSlot[], existing: ExistingPost[]): ScaffoldFile[] => {
	const {feed, stories} = CAMPAIGNS[id];
	const rejected = existing.filter((post) => post.status === REJECTED);
	const files: ScaffoldFile[] = [];

	for (const entry of feed) {
		const slot = slots.find((candidate) => candidate.channel === 'Feed' && candidate.date === entry.date);
		if (!slot) throw new Error(`${entry.date} için planda akış yeri yok (${entry.id}).`);
		const replaces = rejected.find((post) => istanbulDate(post.scheduledAt) === entry.date);
		const folder = `Posts/${entry.date}_${pascal(entry.id)}`;
		const targets = feedTargets(entry, slot);
		const post = {
			title: entry.title,
			caption: entry.caption,
			hashtags: entry.hashtags.join(' '),
			category: entry.kind === 'reel' ? 'PromoReel' : 'PromoPost',
			scheduledAt: entry.time ? at(entry.date, entry.time) : slot.scheduledAt,
			...(replaces ? {replacesPostId: replaces.id} : {}),
			media: plannedMedia(entry, entry.kind),
			targets: targets.map(({platform, postType, scheduledAt}) => ({platform, postType, scheduledAt})),
		};
		files.push({path: `${folder}/Brief.md`, content: brief(entry, targets, replaces)});
		files.push({path: `${folder}/Post.json`, content: `${JSON.stringify(post, null, 2)}\n`});
	}

	for (const story of stories) {
		const slot = slots.find((candidate) => candidate.channel === 'Story' && candidate.date === story.date);
		if (!slot) throw new Error(`${story.date} için planda hikâye yeri yok (${story.id}).`);
		const supported = feed.find((entry) => entry.id === story.supports);
		const folder = `Posts/${story.date}_Hikaye`;
		const scheduledAt = story.time ? at(story.date, story.time) : slot.scheduledAt;
		const post = {
			title: `Hikâye: ${story.hook}`.slice(0, 100),
			caption: story.hook,
			category: 'PromoStory',
			scheduledAt,
			media: plannedMedia(story, 'story'),
			targets: slot.targets.map((target) => ({platform: target.platform, postType: target.postType, scheduledAt: story.time ? scheduledAt : target.scheduledAt})),
		};
		files.push({path: `${folder}/Brief.md`, content: [`# Hikâye · ${story.date}`, '', `- **Saat:** ${scheduledAt.slice(11, 16)} (Instagram; Buffer TikTok hikâyesi paylaşamaz)`, `- **Destekler:** ${supported?.title ?? story.supports}`, ...specialDayLines(story.date), '', `## Hook`, '', `**${story.hook}**`, '', '## Görsel', '', story.visual, ''].join('\n')});
		files.push({path: `${folder}/Post.json`, content: `${JSON.stringify(post, null, 2)}\n`});
	}
	return files;
};
