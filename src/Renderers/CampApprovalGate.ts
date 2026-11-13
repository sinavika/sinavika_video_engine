import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CampApiError, createCampApiClient, type CampApiClient} from '../Courses/CampApiClient';
import {campScriptOfJob, contentHash, readContent} from '../Courses/CampSync';

/**
 * A camp video is rendered only from the version the owner approved in the admin panel: the script file on disk must
 * have the approved version's hash (`npm run camp`, API docs/camps/Claude-Kamp-API.md §5). After a whole YouTube
 * render the server is told which version the video shows, so the panel can say when a video needs a new render.
 *
 * The gate is on when `.env` says SINAVIKA_CAMP_RENDER_GATE=on; it stays off until the scripts are on the server and
 * approved, so renders do not stop before the owner has had a chance to review.
 */
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const GATE_VARIABLE = 'SINAVIKA_CAMP_RENDER_GATE';
/** The YouTube videos; a reel shows the same version as its lesson and is not reported on its own. */
const REPORTED_TEMPLATES = ['CampLesson', 'CampLessonIntro'];

type CampApproval = {scriptId: string; versionNo: number; campSlug: string; code: string; reported: boolean};

const gateOn = (): boolean => {
	if (process.env[GATE_VARIABLE] === undefined && existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
	return process.env[GATE_VARIABLE] === 'on';
};

/**
 * Why the job may not be rendered (empty when it may), and the approved version it shows. Jobs that are not a camp
 * script's pass, and so does everything while the gate is off, unless `force` asks for the check anyway.
 */
export const campApprovalGate = async (jobFile: string, options: {client?: CampApiClient; force?: boolean} = {}): Promise<{issues: string[]; approval?: CampApproval}> => {
	if (!options.force && !gateOn()) return {issues: []};
	const job = JSON.parse(readFileSync(jobFile, 'utf8').replace(/^﻿/, '')) as {template?: unknown; script?: unknown};
	const target = campScriptOfJob(jobFile, job, PROJECT_ROOT);
	if (!target) return {issues: []};
	const client = options.client ?? createCampApiClient();
	const where = `${target.campSlug}/${target.code}`;
	let detail;
	try {
		detail = await client.camp(target.campSlug);
	} catch (error) {
		if (error instanceof CampApiError && error.status === 404) return {issues: [`${where}: kamp sunucuda yok; önce npm run camp -- sync.`]};
		throw error;
	}
	const row = detail.scripts.find((script) => script.code === target.code);
	if (!row) return {issues: [`${where}: senaryo sunucuda yok; önce npm run camp -- sync.`]};
	if (!row.approvedVersionNo) return {issues: [`${where}: onaylı sürüm yok; admin panelde onaylanmadan render edilmez.`]};
	const approved = await client.approved(row.id);
	const local = contentHash(readContent(target.file));
	if (local !== approved.contentHash)
		return {
			issues: [
				`${where}: ${path.relative(PROJECT_ROOT, target.file)} onaylı sürüm ${approved.versionNo} ile aynı değil. ` +
					`Onaylı metni almak için npm run camp -- pull ${where} --approved; yereldeki değişiklik içinse yeni sürüm gönderip onay bekle.`,
			],
		};
	return {issues: [], approval: {scriptId: row.id, versionNo: approved.versionNo, campSlug: target.campSlug, code: target.code, reported: REPORTED_TEMPLATES.includes(String(job.template))}};
};

/** Tells the server the video of this approved version is rendered (YouTube videos only); a changed record is read again once. */
export const reportCampRender = async (approval: CampApproval, note?: string, client: CampApiClient = createCampApiClient()): Promise<void> => {
	if (!approval.reported) return;
	for (let attempt = 0; ; attempt++) {
		const row = (await client.camp(approval.campSlug)).scripts.find((script) => script.id === approval.scriptId);
		if (!row) throw new Error(`${approval.campSlug}/${approval.code}: senaryo sunucuda bulunamadı.`);
		try {
			await client.rendered(approval.scriptId, row.rowVersion, approval.versionNo, note);
			return;
		} catch (error) {
			if (attempt === 0 && error instanceof CampApiError && error.reasonCode === 'VersionConflict') continue;
			throw error;
		}
	}
};
