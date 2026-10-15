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
import type {PlannedSlot} from '../Services/SocialPlanner';
import {CAMPAIGN, CAMPAIGN_FEED, CAMPAIGN_STORIES, type CampaignFeed, type CampaignStory} from './Tanitim2026Ekim';

export const CAMPAIGNS = {[CAMPAIGN.id]: {campaign: CAMPAIGN, feed: CAMPAIGN_FEED, stories: CAMPAIGN_STORIES}} as const;
export type CampaignId = keyof typeof CAMPAIGNS;

/** A post on the server, as the calendar returns it (only what the scaffold needs). */
export type ExistingPost = {id: string; title: string; scheduledAt: string; status: number};
/** Post status codes on the server: 0 waiting, 1 approved, 2 rejected. */
const REJECTED = 2;

export type ScaffoldFile = {path: string; content: string};

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

const brief = (entry: CampaignFeed, slot: PlannedSlot, replaces?: ExistingPost): string => {
	const lines = [
		`# ${entry.title}`,
		'',
		`- **Tarih:** ${entry.date} · ${slot.targets.map((target) => `${target.platform} ${target.postType} ${target.scheduledAt.slice(11, 16)}`).join(' · ')}`,
		`- **Tür:** ${entry.kind} · **Modül:** ${entry.module} · **Tanıtılan:** ${entry.promotes}`,
		`- **Şablon:** ${entry.template} (yeni) · **Referans:** ${entry.reference}`,
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
		const post = {
			title: entry.title,
			caption: entry.caption,
			hashtags: entry.hashtags.join(' '),
			category: entry.kind === 'reel' ? 'PromoReel' : 'PromoPost',
			scheduledAt: slot.scheduledAt,
			...(replaces ? {replacesPostId: replaces.id} : {}),
			media: plannedMedia(entry, entry.kind),
			targets: slot.targets.map(({platform, postType, scheduledAt}) => ({platform, postType, scheduledAt})),
		};
		files.push({path: `${folder}/Brief.md`, content: brief(entry, slot, replaces)});
		files.push({path: `${folder}/Post.json`, content: `${JSON.stringify(post, null, 2)}\n`});
	}

	for (const story of stories) {
		const slot = slots.find((candidate) => candidate.channel === 'Story' && candidate.date === story.date);
		if (!slot) throw new Error(`${story.date} için planda hikâye yeri yok (${story.id}).`);
		const supported = feed.find((entry) => entry.id === story.supports);
		const folder = `Posts/${story.date}_Hikaye`;
		const post = {
			title: `Hikâye: ${story.hook}`.slice(0, 100),
			caption: story.hook,
			category: 'PromoStory',
			scheduledAt: slot.scheduledAt,
			media: plannedMedia(story, 'story'),
			targets: slot.targets.map(({platform, postType, scheduledAt}) => ({platform, postType, scheduledAt})),
		};
		files.push({path: `${folder}/Brief.md`, content: [`# Hikâye · ${story.date}`, '', `- **Saat:** ${slot.scheduledAt.slice(11, 16)} (Instagram; Buffer TikTok hikâyesi paylaşamaz)`, `- **Destekler:** ${supported?.title ?? story.supports}`, '', `## Hook`, '', `**${story.hook}**`, '', '## Görsel', '', story.visual, ''].join('\n')});
		files.push({path: `${folder}/Post.json`, content: `${JSON.stringify(post, null, 2)}\n`});
	}
	return files;
};
