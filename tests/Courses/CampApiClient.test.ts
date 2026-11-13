import {describe, expect, it} from 'vitest';
import {CampApiError, createCampApiClient} from '../../src/Courses/CampApiClient';

type Call = {url: string; init: RequestInit};

const fakeFetch = (status: number, body: unknown, calls: Call[]): typeof fetch =>
	(async (url: string, init: RequestInit) => {
		calls.push({url, init});
		return new Response(body === undefined ? '' : JSON.stringify(body), {status});
	}) as typeof fetch;

describe('camp API client', () => {
	it('sends the key, the JSON body and If-Match with the row version in quotes', async () => {
		const calls: Call[] = [];
		const client = createCampApiClient({apiUrl: 'https://api.test/', apiKey: 'k', fetch: fakeFetch(200, {id: 's', status: 3}, calls)});
		await client.hold('s', 'AAAAAAAAB9E=', 'Yorumlar düzeltiliyor');
		expect(calls[0].url).toBe('https://api.test/api/claude/camp/scripts/s/hold');
		expect(calls[0].init.method).toBe('POST');
		expect(calls[0].init.headers).toMatchObject({'X-SocialHub-Key': 'k', 'Content-Type': 'application/json', 'If-Match': '"AAAAAAAAB9E="'});
		expect(JSON.parse(String(calls[0].init.body))).toEqual({reason: 'Yorumlar düzeltiliyor'});
	});

	it('asks sync for a dry run in the query', async () => {
		const calls: Call[] = [];
		const client = createCampApiClient({apiUrl: 'https://api.test', apiKey: 'k', fetch: fakeFetch(200, {changes: []}, calls)});
		await client.sync([], true);
		expect(calls[0].url).toBe('https://api.test/api/claude/camp/camps/sync?dryRun=true');
	});

	it('turns a conflict into an error with the reason code and the latest version', async () => {
		const client = createCampApiClient({apiUrl: 'https://api.test', apiKey: 'k', fetch: fakeFetch(409, {error: 'Sürüm eski', reasonCode: 'BaseVersionConflict', latestVersionNo: 4}, [])});
		const error = await client.createVersion('s', {baseVersionNo: 2, content: '{}', contentHash: 'x', origin: 0, changeSummary: 'a'}).catch((caught: unknown) => caught);
		expect(error).toBeInstanceOf(CampApiError);
		expect(error).toMatchObject({status: 409, reasonCode: 'BaseVersionConflict', latestVersionNo: 4});
		expect((error as Error).message).toContain('[BaseVersionConflict]');
	});

	it('waits as long as a 429 asks and tries again', async () => {
		const calls: Call[] = [];
		const waits: number[] = [];
		const answers = [new Response(JSON.stringify({code: 'RATE_LIMITED', retryAfterSeconds: 7}), {status: 429}), new Response(JSON.stringify({id: 's'}), {status: 200})];
		const send = (async (url: string, init: RequestInit) => {
			calls.push({url, init});
			return answers.shift()!;
		}) as typeof fetch;
		const client = createCampApiClient({apiUrl: 'https://api.test', apiKey: 'k', fetch: send, wait: async (ms) => void waits.push(ms)});
		await expect(client.createVersion('s', {baseVersionNo: 0, content: '{}', contentHash: 'x', origin: 4, changeSummary: 'a'})).resolves.toEqual({id: 's'});
		expect(waits).toEqual([7000]);
		expect(calls).toHaveLength(2);
	});
});
