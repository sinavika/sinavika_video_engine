/**
 * Delivers finished posts to the Sınavika API and reads the plan back.
 * Posts wait for an admin's approval there; this tool cannot approve or publish.
 *
 *   npm run social -- accounts
 *       The active accounts and the hours Buffer suggests for each.
 *
 *   npm run social -- submit --post Posts/2026-11-02_Gunun_Sorusu.json [--post ...]
 *       Uploads the media of each post file and creates the post (see
 *       SocialPostSchema). Media paths are relative to the post file.
 *
 *   npm run social -- calendar --from 2026-11-01 --to 2026-12-01
 *       What is planned in a date range, with status per account.
 *
 *   npm run social -- revisions
 *       Posts an admin rejected, with the note, waiting to be prepared again.
 *       Submit the new one with "replacesPostId" set to the rejected post's id.
 *
 *   npm run social -- sources [--kind Question] [--unused]
 *   npm run social -- import-sources --file Sources/Questions.json
 *       The source data (questions, topics, hooks) and whether each was used.
 *       The file is a JSON array of {kind, key, content}.
 *
 *   npm run social -- plan --month 2026-11 [--out Plans/2026-11.json]
 *   npm run social -- plan --from 2026-11-02 --to 2026-11-09
 *       The slots to prepare, from the standard weekly plan (Configurations/
 *       SocialPlan.ts), with hours taken from each account's Buffer schedule.
 *
 * Add --json to print the API's answer as JSON.
 */
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {ZodError} from 'zod';
import {SocialHubError, createSocialHubClient} from '../src/Services/SocialHubClient';
import {planMonth, planRange, type AccountSchedule} from '../src/Services/SocialPlanner';

const {values, positionals} = parseArgs({
	allowPositionals: true,
	options: {
		post: {type: 'string', multiple: true},
		file: {type: 'string'},
		from: {type: 'string'},
		to: {type: 'string'},
		kind: {type: 'string'},
		month: {type: 'string'},
		out: {type: 'string'},
		unused: {type: 'boolean', default: false},
		json: {type: 'boolean', default: false},
	},
});

const POST_STATUS = ['onay bekliyor', 'onaylandı', 'reddedildi'];
const TARGET_STATUS = ['bekliyor', 'gönderiliyor', 'planlandı', 'yayınlandı', 'başarısız'];
type Target = {platform: string; postType?: string; scheduledAt?: string; coverFrameApplied?: boolean; status: number; error?: string | null; publishedUrl?: string | null};
type Post = {id: string; hasCover?: boolean; title: string; category: string; lesson?: string | null; scheduledAt: string; status: number; reviewNote?: string | null; targets: Target[]; sources?: {kind: string; key: string}[]};

const localTime = (iso: string) => new Date(iso).toLocaleString('tr-TR', {timeZone: 'Europe/Istanbul', dateStyle: 'medium', timeStyle: 'short'});
const describePost = (post: Post) =>
	`${localTime(post.scheduledAt).padEnd(22)} ${POST_STATUS[post.status].padEnd(14)} ${post.category.padEnd(18)} ${post.title}\n` +
	post.targets
		.map(
			(target) =>
				`    ${target.platform.padEnd(10)} ${(target.postType ?? '').padEnd(9)} ${target.scheduledAt ? localTime(target.scheduledAt).slice(-5) : '     '}  ${TARGET_STATUS[target.status]}` +
				`${target.coverFrameApplied ? '  kapak karesi' : post.hasCover ? '  kapak elle' : ''}${target.error ? `: ${target.error}` : ''}${target.publishedUrl ? `  ${target.publishedUrl}` : ''}`,
		)
		.join('\n');
const print = (result: unknown, text: () => string) => console.log(values.json ? JSON.stringify(result, null, 2) : text());
const readJson = async (file: string) => JSON.parse(await readFile(file, 'utf8')) as unknown;

const [command] = positionals;

try {
	const client = createSocialHubClient();

	if (command === 'accounts') {
		const accounts = (await client.accounts()) as {platform: string; name: string; postingSchedule?: {day: string; times: string[]}[]}[];
		print(accounts, () =>
			accounts.map((account) => `${account.platform.padEnd(10)} ${account.name}\n    ${(account.postingSchedule ?? []).filter((slot) => slot.times.length > 0).map((slot) => `${slot.day} ${slot.times.join(' ')}`).join(' · ')}`).join('\n'),
		);
	} else if (command === 'plan') {
		const accounts = (await client.accounts().catch(() => [])) as AccountSchedule[];
		if (accounts.length === 0) console.error('Uyarı: API hesap döndürmedi; saatler Buffer yerine plandaki yedek saatlerden alındı.');
		const slots = values.month ? planMonth(values.month, accounts) : planRange(values.from ?? '', values.to ?? '', accounts);
		if (values.out) {
			await mkdir(path.dirname(path.resolve(values.out)), {recursive: true});
			await writeFile(values.out, `${JSON.stringify(slots, null, 2)}\n`);
		}
		const describeSlot = (slot: (typeof slots)[number]) =>
			`${slot.date} ${slot.weekday}  ${slot.channel.padEnd(8)} ${slot.label.padEnd(26)} ${slot.targets.map((target) => `${target.platform}:${target.postType} ${target.scheduledAt.slice(11, 16)}${target.timeSource === 'fallback' ? '*' : ''}`).join('  ')}`;
		print(slots, () => [...slots.map(describeSlot), `${slots.length} içerik${values.out ? ` → ${values.out}` : ''}`].join('\n'));
	} else if (command === 'submit') {
		if (!values.post?.length) throw new Error('--post <dosya> gerekli.');
		for (const file of values.post) {
			const created = (await client.submit(await readJson(file), path.dirname(path.resolve(file)))) as Post;
			print(created, () => `✓ ${file} → ${created.id}\n${describePost(created)}`);
		}
	} else if (command === 'calendar') {
		const {items, totalCount} = (await client.posts({from: values.from, to: values.to, take: 200})) as {items: Post[]; totalCount: number};
		print({items, totalCount}, () => `${totalCount} gönderi\n${items.map(describePost).join('\n')}`);
	} else if (command === 'revisions') {
		const posts = (await client.revisionRequests()) as Post[];
		print(posts, () =>
			posts.length === 0
				? 'Yeniden hazırlanması istenen gönderi yok.'
				: posts.map((post) => `${describePost(post)}\n    id: ${post.id}\n    not: ${post.reviewNote}\n    kaynaklar: ${(post.sources ?? []).map((source) => `${source.kind}/${source.key}`).join(', ') || '-'}`).join('\n'),
		);
	} else if (command === 'sources') {
		const {items, totalCount} = (await client.sources({kind: values.kind, used: values.unused ? false : undefined, take: 200})) as {items: {kind: string; key: string; postId?: string | null}[]; totalCount: number};
		print({items, totalCount}, () => `${totalCount} kaynak\n${items.map((source) => `${source.postId ? '✓ kullanıldı' : '· kullanılmadı'}  ${source.kind}/${source.key}`).join('\n')}`);
	} else if (command === 'import-sources') {
		if (!values.file) throw new Error('--file <dosya> gerekli.');
		const summary = await client.importSources((await readJson(values.file)) as never);
		print(summary, () => `Yeni: ${summary.created}, güncellenen: ${summary.updated}`);
	} else {
		console.error('Komut: accounts | plan | submit | calendar | revisions | sources | import-sources');
		process.exit(2);
	}
} catch (error) {
	if (error instanceof ZodError) console.error(`Geçersiz veri:\n${error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n')}`);
	else console.error(error instanceof SocialHubError || error instanceof Error ? error.message : error);
	process.exit(1);
}
