import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {z} from 'zod';
import {SOCIAL_PLATFORMS} from '../Configurations/SocialPlan';

/**
 * Delivers finished posts to the Sınavika API (SocialHub). The API stores the
 * media in Blob storage and keeps the post waiting for an admin's approval;
 * nothing here can approve or publish.
 */
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const API_URL_VARIABLE = 'SINAVIKA_API_URL';
const API_KEY_VARIABLE = 'SINAVIKA_SOCIALHUB_KEY';
const DEFAULT_API_URL = 'https://api.sinavika.com';
const KEY_HEADER = 'X-SocialHub-Key';

const MEDIA_TYPES: Record<string, string> = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4'};

const SourceKeySchema = z.object({kind: z.string().min(1).max(32), key: z.string().min(1).max(128)});

export const SocialPostSchema = z.object({
	title: z.string().min(1).max(100),
	caption: z.string().min(1).max(5000),
	hashtags: z.string().max(1000).optional(),
	category: z.string().min(1).max(64),
	lesson: z.string().max(100).optional(),
	/** With an explicit offset, e.g. 2026-11-02T20:00:00+03:00, so the hour is never ambiguous. */
	scheduledAt: z.iso.datetime({offset: true}),
	/** Paths of the rendered files, in the order they should appear. */
	media: z.array(z.string().min(1)).min(1).max(10),
	/** Empty means every active account the media fits. */
	targets: z.array(z.object({platform: z.enum(SOCIAL_PLATFORMS), caption: z.string().max(5000).optional()})).default([]),
	sources: z.array(SourceKeySchema).default([]),
	replacesPostId: z.uuid().optional(),
});
export type SocialPost = z.infer<typeof SocialPostSchema>;

export const SocialSourceSchema = SourceKeySchema.extend({content: z.json().refine((value) => value !== null, 'content is required')});
export type SocialSource = z.infer<typeof SocialSourceSchema>;

export class SocialHubError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

export type SocialHubClient = ReturnType<typeof createSocialHubClient>;

export const createSocialHubClient = (options: {apiUrl?: string; apiKey?: string; fetch?: typeof fetch} = {}) => {
	if (!options.apiKey && !process.env[API_KEY_VARIABLE] && existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
	const apiKey = options.apiKey ?? process.env[API_KEY_VARIABLE];
	if (!apiKey) throw new Error(`${API_KEY_VARIABLE} is not set. Put it in .env (see .env.example).`);
	const baseUrl = `${(options.apiUrl ?? process.env[API_URL_VARIABLE] ?? DEFAULT_API_URL).replace(/\/+$/, '')}/api/claude/social-hub`;
	const send = options.fetch ?? fetch;

	const request = async <Result>(method: 'GET' | 'POST', route: string, body?: FormData | object): Promise<Result> => {
		const isForm = body instanceof FormData;
		const response = await send(`${baseUrl}/${route}`, {
			method,
			headers: {[KEY_HEADER]: apiKey, ...(body && !isForm ? {'Content-Type': 'application/json'} : {})},
			body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
		});
		const text = await response.text();
		if (!response.ok) {
			let message = text;
			try {
				message = (JSON.parse(text) as {error?: string}).error ?? text;
			} catch {
				// Not JSON (e.g. a proxy error page); the raw text is the best message there is.
			}
			throw new SocialHubError(response.status, `SocialHub ${method} ${route} → ${response.status}: ${message || response.statusText}`);
		}
		return (text ? JSON.parse(text) : undefined) as Result;
	};

	const query = (parameters: Record<string, string | number | boolean | undefined>): string => {
		const search = new URLSearchParams();
		for (const [name, value] of Object.entries(parameters)) if (value !== undefined) search.set(name, String(value));
		const text = search.toString();
		return text ? `?${text}` : '';
	};

	return {
		accounts: () => request<unknown[]>('GET', 'accounts'),
		posts: (filter: {from?: string; to?: string; status?: number; skip?: number; take?: number} = {}) => request<{items: unknown[]; totalCount: number}>('GET', `posts${query(filter)}`),
		post: (id: string) => request<unknown>('GET', `posts/${id}`),
		/** Posts an admin rejected and that have no replacement yet, with the admin's note. */
		revisionRequests: () => request<unknown[]>('GET', 'posts/revision-requests'),
		sources: (filter: {kind?: string; used?: boolean; skip?: number; take?: number} = {}) => request<{items: unknown[]; totalCount: number}>('GET', `sources${query(filter)}`),
		importSources: async (items: SocialSource[]) => request<{created: number; updated: number}>('POST', 'sources/import', {items: z.array(SocialSourceSchema).min(1).parse(items)}),
		/** Uploads the media and creates the post, waiting for approval. Media paths resolve against `baseDirectory`. */
		submit: async (rawPost: unknown, baseDirectory = process.cwd()) => {
			const {media, ...payload} = SocialPostSchema.parse(rawPost);
			const form = new FormData();
			form.set('payload', JSON.stringify(payload));
			for (const file of media) {
				const fullPath = path.resolve(baseDirectory, file);
				const type = MEDIA_TYPES[path.extname(fullPath).toLowerCase()];
				if (!type) throw new Error(`Unsupported media file: ${file}. Use PNG, JPEG, WebP or MP4.`);
				form.append('files', new Blob([await readFile(fullPath)], {type}), path.basename(fullPath));
			}
			return request<{id: string; status: number}>('POST', 'posts', form);
		},
	};
};
