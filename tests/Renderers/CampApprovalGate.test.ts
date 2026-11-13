import path from 'node:path';
import {describe, expect, it} from 'vitest';
import type {CampApiClient} from '../../src/Courses/CampApiClient';
import {contentHash, readContent} from '../../src/Courses/CampSync';
import {campApprovalGate, reportCampRender} from '../../src/Renderers/CampApprovalGate';

const ROOT = path.resolve(__dirname, '..', '..');
const JOB = path.join(ROOT, 'Curriculum', 'Jobs', 'yks-tyt-matematik-kampi', '01-temel-kavramlar-youtube.json');
const SCRIPT = path.join(ROOT, 'Curriculum', 'Scripts', 'YKS_TYT', 'MAT', 'MAT_TEMEL.json');

const fakeClient = (approvedHash: string | undefined, rendered: unknown[] = []) =>
	({
		camp: async () => ({slug: 'yks-tyt-matematik-kampi', name: '', scripts: [{id: 'id-1', code: 'MAT_TEMEL', number: 1, status: 5, latestVersionNo: 3, approvedVersionNo: approvedHash ? 2 : null, rowVersion: 'rv'}]}),
		approved: async () => ({versionNo: 2, content: '', contentHash: approvedHash!}),
		rendered: async (...args: unknown[]) => {
			rendered.push(args);
			return {};
		},
	}) as unknown as CampApiClient;

describe('camp approval gate', () => {
	it('lets a lesson render only when the script file is the approved version', async () => {
		const pass = await campApprovalGate(JOB, {client: fakeClient(contentHash(readContent(SCRIPT))), force: true});
		expect(pass).toEqual({issues: [], approval: {scriptId: 'id-1', versionNo: 2, campSlug: 'yks-tyt-matematik-kampi', code: 'MAT_TEMEL', reported: true}});
		const changed = await campApprovalGate(JOB, {client: fakeClient('0'.repeat(64)), force: true});
		expect(changed.issues[0]).toContain('onaylı sürüm 2 ile aynı değil');
		const unapproved = await campApprovalGate(JOB, {client: fakeClient(undefined), force: true});
		expect(unapproved.issues[0]).toContain('onaylı sürüm yok');
	});

	it('reports the rendered version of a YouTube video with the record’s row version', async () => {
		const rendered: unknown[] = [];
		await reportCampRender({scriptId: 'id-1', versionNo: 2, campSlug: 'yks-tyt-matematik-kampi', code: 'MAT_TEMEL', reported: true}, 'not', fakeClient('x', rendered));
		expect(rendered).toEqual([['id-1', 'rv', 2, 'not']]);
	});
});
