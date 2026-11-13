import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * The Sınavika API's camp service for Claude (`api/claude/camp`, live since 10 Nov 2026; the API's
 * docs/camps/Claude-Kamp-API.md). Every camp script lives there as one record per topic with versions that never
 * change; the owner reviews and approves a version in the admin panel. Nothing here can approve, archive or mark a
 * video published.
 *
 * Writes that change a script record send `If-Match: "<rowVersion>"`; a new version sends the version it was written
 * on (`baseVersionNo`) instead. A conflict comes back as CampApiError with the server's reason code.
 */
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const API_URL_VARIABLE = 'SINAVIKA_API_URL';
/** The camp service takes the SocialHub key (owner's choice when the API went live). */
const API_KEY_VARIABLE = 'SINAVIKA_SOCIALHUB_KEY';
const DEFAULT_API_URL = 'https://api.sinavika.com';
const KEY_HEADER = 'X-SocialHub-Key';

export const CAMP_SCRIPT_STATUS = ['Draft', 'InReview', 'ChangesRequested', 'ClaudeRevising', 'CheckRequired', 'Approved', 'Archived'] as const;
export const CAMP_PUBLISH_STATE = ['NotRendered', 'Rendered', 'Scheduled', 'Published', 'Unpublished'] as const;
export const CAMP_CHECK_STATE = ['NotChecked', 'Clean', 'HasSuggestions', 'HasIssues'] as const;

/** How a version came to be (CampVersionOrigin); Claude sends only these three. */
export const CAMP_VERSION_ORIGIN = {claudeApi: 0, claudeManual: 1, imported: 4} as const;

export type CampScriptRow = {
	id: string;
	code: string;
	number: number;
	title?: string;
	status: number;
	latestVersionNo: number;
	approvedVersionNo?: number | null;
	renderedVersionNo?: number | null;
	needsRerender?: boolean;
	publishState?: number;
	checkState?: number;
	reviewNote?: string | null;
	rowVersion: string;
};

type CampDetail = {slug: string; name: string; scripts: CampScriptRow[]};

export type CampCheckReport = {issues: string[]; suggestions: string[]; stillScreens: string[]; warnings: string[]; checkedAt: string; engineCommit?: string};

export type CampVersionBody = {
	baseVersionNo: number;
	content: string;
	contentHash: string;
	schemaVersion?: string;
	origin: number;
	changeSummary: string;
	reason?: string | null;
	resolvesCommentIds?: string[];
	model?: string;
	costUsd?: number;
	estimatedSeconds?: number;
	stats?: Record<string, unknown>;
	checkReport?: CampCheckReport;
};

type CampVersion = {versionNo: number; content: string; contentHash: string; checkState?: number; origin?: number; changeSummary?: string; reason?: string | null};

export type CampSyncEntry = {
	slug: string;
	name: string;
	categorySub: string;
	lesson: string;
	exams: string[];
	promise: string;
	description: string | null;
	lessonColor?: string;
	orderIndex: number;
	alsoCategorySubs: string[];
	introTitle?: string;
	/** `lessonSubId` is the script's topic id: a KPSS camp teaches topics that only Önlisans and Ortaöğretim have. */
	lessons: {topic: string; title: string; lessonSubId?: string}[];
};

type CampSyncResult = {
	dryRun: boolean;
	applied: boolean;
	campsCreated: number;
	campsUpdated: number;
	scriptsCreated: number;
	scriptsUpdated: number;
	changes: string[];
	notInEngine: string[];
	errors: string[];
};

type CampTodo = {
	changesRequested: CampScriptRow[];
	openComments: {scriptId: string; campSlug: string; code: string; title: string; comment: {id: string; anchor?: string; quote?: string; body: string; kind?: number}}[];
	checkRequired: CampScriptRow[];
	needsRerender: CampScriptRow[];
};

export class CampApiError extends Error {
	constructor(
		readonly status: number,
		message: string,
		readonly reasonCode?: string,
		readonly latestVersionNo?: number,
		/** The parsed answer, when it was JSON (a refused sync still returns its whole report). */
		readonly body?: unknown,
	) {
		super(message);
	}
}

type Method = 'GET' | 'POST' | 'PUT';

const RATE_LIMIT_RETRIES = 5;

/** How long a 429 asks us to wait: the body's retryAfterSeconds, else the Retry-After header, else a minute. */
const retryAfterMs = (response: Response, text: string) => {
	let seconds = Number(response.headers.get('Retry-After'));
	try {
		const parsed = JSON.parse(text) as {retryAfterSeconds?: number};
		if (typeof parsed.retryAfterSeconds === 'number') seconds = parsed.retryAfterSeconds;
	} catch {
		// Not JSON; the header (or the default) decides.
	}
	return (Number.isFinite(seconds) && seconds > 0 ? seconds : 60) * 1000;
};

export const createCampApiClient = (options: {apiUrl?: string; apiKey?: string; fetch?: typeof fetch; wait?: (ms: number) => Promise<void>} = {}) => {
	if (!options.apiKey && !process.env[API_KEY_VARIABLE] && existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
	const apiKey = options.apiKey ?? process.env[API_KEY_VARIABLE];
	if (!apiKey) throw new Error(`${API_KEY_VARIABLE} is not set. Put it in .env (see .env.example).`);
	const baseUrl = `${(options.apiUrl ?? process.env[API_URL_VARIABLE] ?? DEFAULT_API_URL).replace(/\/+$/, '')}/api/claude/camp`;
	const send = options.fetch ?? fetch;
	const wait = options.wait ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

	const request = async <Result>(method: Method, route: string, body?: object, rowVersion?: string): Promise<Result> => {
		let response: Response;
		let text: string;
		// The API limits how fast a key may write (429 + retryAfterSeconds); wait as told and try again.
		for (let attempt = 1; ; attempt++) {
			response = await send(`${baseUrl}/${route}`, {
				method,
				headers: {[KEY_HEADER]: apiKey, ...(body ? {'Content-Type': 'application/json'} : {}), ...(rowVersion ? {'If-Match': `"${rowVersion}"`} : {})},
				body: body === undefined ? undefined : JSON.stringify(body),
			});
			text = await response.text();
			if (response.status !== 429 || attempt > RATE_LIMIT_RETRIES) break;
			await wait(retryAfterMs(response, text));
		}
		if (!response.ok) {
			let parsed: {error?: string; message?: string; reasonCode?: string; latestVersionNo?: number} | undefined;
			try {
				parsed = JSON.parse(text) as typeof parsed;
			} catch {
				// Not JSON (a proxy error page); the raw text is the message.
			}
			const reason = parsed?.reasonCode ? ` [${parsed.reasonCode}]` : '';
			throw new CampApiError(response.status, `Kamp ${method} ${route} → ${response.status}${reason}: ${parsed?.error ?? parsed?.message ?? (text || response.statusText)}`, parsed?.reasonCode, parsed?.latestVersionNo, parsed);
		}
		return (text ? JSON.parse(text) : undefined) as Result;
	};
	const query = (values: Record<string, string | number | boolean | undefined>) => {
		const entries = Object.entries(values).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined);
		return entries.length ? `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()}` : '';
	};

	return {
		camps: () => request<{slug: string; name: string; status: number}[]>('GET', 'camps'),
		camp: (slug: string) => request<CampDetail>('GET', `camps/${encodeURIComponent(slug)}`),
		/** A sync with errors is refused whole (400) but still answers with its report, which is what the caller shows. */
		sync: (camps: CampSyncEntry[], dryRun: boolean) =>
			request<CampSyncResult>('POST', `camps/sync${query({dryRun})}`, {camps}).catch((error: unknown) => {
				if (error instanceof CampApiError && error.status === 400 && error.body && typeof error.body === 'object' && 'changes' in error.body) return error.body as CampSyncResult;
				throw error;
			}),
		links: (slug: string) => request<{slug: string; playlistUrl?: string; lessons: {number: number; code: string; title: string; publishState: number; youTubeUrl?: string | null}[]}>('GET', `camps/${encodeURIComponent(slug)}/links`),
		version: (scriptId: string, versionNo: number) => request<CampVersion>('GET', `scripts/${scriptId}/versions/${versionNo}`),
		approved: (scriptId: string) => request<CampVersion>('GET', `scripts/${scriptId}/approved`),
		todo: () => request<CampTodo>('GET', 'todo'),
		validateVersion: (scriptId: string, body: CampVersionBody) =>
			request<{isValid: boolean; errors: string[]; contentHash: string; latestVersionNo: number; duplicateOfVersionNo?: number | null; mikros?: {covered: number; missing: string[]; otherTopic: string[]}}>(
				'POST',
				`scripts/${scriptId}/versions/validate`,
				body,
			),
		createVersion: (scriptId: string, body: CampVersionBody) => request<CampScriptRow>('POST', `scripts/${scriptId}/versions`, body),
		hold: (scriptId: string, rowVersion: string, reason: string) => request<CampScriptRow>('POST', `scripts/${scriptId}/hold`, {reason}, rowVersion),
		release: (scriptId: string, rowVersion: string, reason: string) => request<CampScriptRow>('POST', `scripts/${scriptId}/release`, {reason}, rowVersion),
		checkReport: (scriptId: string, versionNo: number, rowVersion: string, checkReport: CampCheckReport, reason?: string) =>
			request<CampScriptRow>('POST', `scripts/${scriptId}/versions/${versionNo}/check-report`, {checkReport, reason}, rowVersion),
		rendered: (scriptId: string, rowVersion: string, versionNo: number, note?: string) =>
			request<CampScriptRow>('PUT', `scripts/${scriptId}/render`, {versionNo, renderedAt: new Date().toISOString(), note}, rowVersion),
	};
};

export type CampApiClient = ReturnType<typeof createCampApiClient>;
