import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {z} from 'zod';
import {assertProductCopy} from '../Configurations/ProductMessaging';
import {POST_TYPE_NAMES, SOCIAL_PLATFORMS} from '../Configurations/SocialPlan';
import {assertSpecialDayCopy} from '../Configurations/SpecialDay';
import {VIDEO_COVER} from '../Configurations/VideoCover';
import {socialCopy} from './PlatformCopies';


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
	/** Paths of the rendered files, in the order they should appear. Empty only for a LinkedIn text post. */
	media: z.array(z.string().min(1)).max(10).default([]),
	/**
	 * The cover image of a video post. Left out, the `_Kapak.png` saved next to
	 * the video is used. A cover is never one of the media files.
	 */
	cover: z.string().min(1).optional(),
	/** The moment of the video to use as its cover frame where the platform allows choosing one. */
	coverOffsetMs: z.number().int().min(0).max(600_000).optional(),
	/**
	 * Where the post goes: the platform, the real post type there (left out, it
	 * follows from the media), and the platform's own hour (left out, the
	 * post's). Empty means every active account the media fits.
	 */
	targets: z
		.array(
			z.object({
				platform: z.enum(SOCIAL_PLATFORMS),
				postType: z.enum(POST_TYPE_NAMES).optional(),
				scheduledAt: z.iso.datetime({offset: true}).optional(),
				caption: z.string().max(5000).optional(),
			}),
		)
		.default([]),
	sources: z.array(SourceKeySchema).default([]),
	replacesPostId: z.uuid().optional(),
});

const SocialSourceSchema = SourceKeySchema.extend({content: z.json().refine((value) => value !== null, 'content is required')});
type SocialSource = z.infer<typeof SocialSourceSchema>;

/** The cover saved with a video (`03_Name.mp4` → `03_Name_Kapak.png`), if the post is a single video that has one. */
const linkedCover = (media: string[], baseDirectory: string): string | undefined => {
	if (media.length !== 1 || path.extname(media[0]).toLowerCase() !== '.mp4') return undefined;
	const {dir, name} = path.parse(media[0]);
	const cover = path.join(dir, `${name}_${VIDEO_COVER.fileSuffix}.png`);
	return existsSync(path.resolve(baseDirectory, cover)) ? cover : undefined;
};

export class SocialHubError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

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
			const {media, cover, ...payload} = SocialPostSchema.parse(rawPost);
			// Product and module names follow the brand's advertising copy (Configurations/ProductMessaging); a wrong name never leaves.
			for (const warning of assertProductCopy([payload.title, payload.caption, ...payload.targets.map((target) => target.caption)])) console.warn(`  Metin uyarısı: "${warning.term}" · ${warning.message}`);
			// On a national or religious holiday nothing advertises: no brand name, product or call, only the logo (Configurations/SpecialDay).
			const texts = [payload.title, payload.caption, payload.hashtags, ...payload.targets.map((target) => target.caption)];
			for (const date of new Set([payload.scheduledAt, ...payload.targets.map((target) => target.scheduledAt ?? payload.scheduledAt)])) assertSpecialDayCopy(date, texts);
			const attach = async (field: string, file: string) => {
				// Videos are rendered as 4K masters; the platforms get their own-size copy, made by our encoder (see PlatformCopies).
				const fullPath = await socialCopy(path.resolve(baseDirectory, file));
				const type = MEDIA_TYPES[path.extname(fullPath).toLowerCase()];
				if (!type) throw new Error(`Unsupported media file: ${file}. Use PNG, JPEG, WebP or MP4.`);
				form.append(field, new Blob([await readFile(fullPath)], {type}), path.basename(fullPath));
			};
			const form = new FormData();
			const coverFile = cover ?? linkedCover(media, baseDirectory);
			if (coverFile) payload.coverOffsetMs ??= VIDEO_COVER.frameOffsetMilliseconds;
			form.set('payload', JSON.stringify(payload));
			for (const file of media) await attach('files', file);
			if (coverFile) await attach('cover', coverFile);
			return request<{id: string; status: number}>('POST', 'posts', form);
		},
	};
};
