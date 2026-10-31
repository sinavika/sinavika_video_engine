import {mkdtempSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {SocialHubError, SocialPostSchema, createSocialHubClient} from '../../src/Services/SocialHubClient';

const post = {
	title: 'Günün sorusu',
	caption: 'Üslü sayılarda en çok yapılan hata.',
	hashtags: '#tyt #matematik',
	category: 'QuestionSolution',
	lesson: 'Matematik',
	scheduledAt: '2026-11-02T20:00:00+03:00',
	media: ['soru.png', 'cozum.png'],
};

const recordingFetch = (status = 200, body: unknown = {id: 'post-1', status: 0}) => {
	const calls: {url: string; init: RequestInit}[] = [];
	const fake = (async (url: string | URL | Request, init?: RequestInit) => {
		calls.push({url: String(url), init: init ?? {}});
		return new Response(typeof body === 'string' ? body : JSON.stringify(body), {status});
	}) as typeof fetch;
	return {calls, fake};
};

describe('SocialPostSchema', () => {
	it('accepts a complete post and defaults targets and sources', () => {
		expect(SocialPostSchema.parse(post)).toMatchObject({targets: [], sources: []});
	});

	it('requires an explicit time zone, media and known platforms', () => {
		expect(SocialPostSchema.safeParse({...post, scheduledAt: '2026-11-02T20:00:00'}).success).toBe(false);
		expect(SocialPostSchema.safeParse({...post, media: Array(11).fill('a.png')}).success).toBe(false);
		expect(SocialPostSchema.safeParse({...post, targets: [{platform: 'instagram', postType: 'shorts'}]}).success).toBe(false);
		expect(SocialPostSchema.safeParse({...post, targets: [{platform: 'tiktok', scheduledAt: '2026-11-02T09:47:00'}]}).success).toBe(false);
		expect(SocialPostSchema.safeParse({...post, targets: [{platform: 'facebook'}]}).success).toBe(false);
		expect(SocialPostSchema.safeParse({...post, replacesPostId: 'not-an-id'}).success).toBe(false);
	});
});

describe('createSocialHubClient', () => {
	it('uploads media in order with the payload and the key header', async () => {
		const directory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-social-'));
		writeFileSync(path.join(directory, 'soru.png'), 'first');
		writeFileSync(path.join(directory, 'cozum.png'), 'second');
		const {calls, fake} = recordingFetch();
		const client = createSocialHubClient({apiUrl: 'https://api.test/', apiKey: 'secret', fetch: fake});

		const created = await client.submit({...post, sources: [{kind: 'Question', key: 'q-1'}]}, directory);

		expect(created.id).toBe('post-1');
		expect(calls[0].url).toBe('https://api.test/api/claude/social-hub/posts');
		expect(calls[0].init.method).toBe('POST');
		expect((calls[0].init.headers as Record<string, string>)['X-SocialHub-Key']).toBe('secret');
		const form = calls[0].init.body as FormData;
		const payload = JSON.parse(form.get('payload') as string);
		expect(payload).toMatchObject({title: 'Günün sorusu', scheduledAt: '2026-11-02T20:00:00+03:00', sources: [{kind: 'Question', key: 'q-1'}]});
		expect(payload.media).toBeUndefined();
		const files = form.getAll('files') as File[];
		expect(files.map((file) => [file.name, file.type])).toEqual([
			['soru.png', 'image/png'],
			['cozum.png', 'image/png'],
		]);
		expect(await files[1].text()).toBe('second');
	});

	it('sends each platform its post type and hour, and a text post without media', async () => {
		const {calls, fake} = recordingFetch();
		const client = createSocialHubClient({apiKey: 'secret', fetch: fake});
		const targets = [
			{platform: 'instagram', postType: 'story'},
			{platform: 'tiktok', postType: 'photo', scheduledAt: '2026-11-02T09:47:00+03:00'},
		];

		await client.submit({...post, media: [], targets: [{platform: 'linkedin', postType: 'text'}]});
		const text = calls[0].init.body as FormData;
		expect(text.getAll('files')).toHaveLength(0);
		expect(JSON.parse(text.get('payload') as string).targets).toEqual([{platform: 'linkedin', postType: 'text'}]);
		expect(SocialPostSchema.parse({...post, targets}).targets).toEqual(targets);
	});

	it('uploads the cover saved with a video apart from the media, with its cover frame', async () => {
		const directory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-social-'));
		writeFileSync(path.join(directory, '03_Konu.mp4'), 'video');
		writeFileSync(path.join(directory, '03_Konu_Kapak.png'), 'cover');
		writeFileSync(path.join(directory, 'ozel.png'), 'custom');
		writeFileSync(path.join(directory, 'tek.mp4'), 'alone');
		const {calls, fake} = recordingFetch();
		const client = createSocialHubClient({apiKey: 'secret', fetch: fake});

		await client.submit({...post, media: ['03_Konu.mp4']}, directory);
		await client.submit({...post, media: ['03_Konu.mp4'], cover: 'ozel.png', coverOffsetMs: 0}, directory);
		await client.submit({...post, media: ['tek.mp4']}, directory);

		const [linked, custom, none] = calls.map((call) => call.init.body as FormData);
		expect((linked.getAll('files') as File[]).map((file) => file.name)).toEqual(['03_Konu.mp4']);
		expect((linked.get('cover') as File).name).toBe('03_Konu_Kapak.png');
		expect(JSON.parse(linked.get('payload') as string)).toMatchObject({coverOffsetMs: 100});
		expect(JSON.parse(linked.get('payload') as string).cover).toBeUndefined();
		expect(await (custom.get('cover') as File).text()).toBe('custom');
		expect(JSON.parse(custom.get('payload') as string).coverOffsetMs).toBe(0);
		expect(none.get('cover')).toBeNull();
		expect(JSON.parse(none.get('payload') as string).coverOffsetMs).toBeUndefined();
	});

	it('refuses media it cannot deliver before calling the API', async () => {
		const {calls, fake} = recordingFetch();
		const client = createSocialHubClient({apiKey: 'secret', fetch: fake});
		await expect(client.submit({...post, media: ['clip.mov']})).rejects.toThrow(/Unsupported media/);
		expect(calls).toHaveLength(0);
	});

	it('builds query strings and reports the API error message', async () => {
		const ok = recordingFetch(200, {items: [], totalCount: 0});
		await createSocialHubClient({apiUrl: 'https://api.test', apiKey: 'secret', fetch: ok.fake}).sources({kind: 'Hook', used: false});
		expect(ok.calls[0].url).toBe('https://api.test/api/claude/social-hub/sources?kind=Hook&used=false');

		const failing = recordingFetch(400, {error: 'Kaynak daha önce kullanılmış: Hook/h-1.'});
		const error = await createSocialHubClient({apiKey: 'secret', fetch: failing.fake}).revisionRequests().catch((caught) => caught);
		expect(error).toBeInstanceOf(SocialHubError);
		expect(error.status).toBe(400);
		expect(error.message).toContain('Hook/h-1');
		expect(error.message).not.toContain('secret');
	});

	it('validates sources before importing them', async () => {
		const {calls, fake} = recordingFetch(200, {created: 1, updated: 0});
		const client = createSocialHubClient({apiKey: 'secret', fetch: fake});
		await expect(client.importSources([{kind: 'Hook', key: '', content: {text: 'x'}}])).rejects.toThrow();
		expect(await client.importSources([{kind: 'Hook', key: 'h-1', content: {text: 'x'}}])).toEqual({created: 1, updated: 0});
		expect(JSON.parse(calls[0].init.body as string)).toEqual({items: [{kind: 'Hook', key: 'h-1', content: {text: 'x'}}]});
	});
});
