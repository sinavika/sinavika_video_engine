/**
 * Camp scripts on the Sınavika API (`api/claude/camp`). Every script lives there as one record per topic with
 * versions that never change; the owner reads, comments on and approves a version in the admin panel. This tool
 * cannot approve, archive or mark a video published. Writes go to the live server, so `sync` and `import` show what
 * they would do and write only with --apply.
 *
 *   npm run camp -- sync [--apply]
 *       Sends the camp plans (Curriculum/Camps) and their episode 0: camps and script records. Without --apply it is a
 *       dry run that prints the difference. Nothing is ever deleted; server scripts the engine lacks are listed.
 *
 *   npm run camp -- import [--camp <camp id>] [--apply]
 *       The first version of every script that has none on the server yet (origin Imported), with the engine check as
 *       its report. Without --apply each is only validated by the server.
 *
 *   npm run camp -- status [--camp <camp id>]
 *       Each script's state on the server and whether the local file is the latest or the approved version.
 *
 *   npm run camp -- todo
 *       What the owner asked for: changes requested, open comments, admin edits waiting for the engine check and videos
 *       whose approved version is newer than the render. Read when the owner says so; nothing polls.
 *
 *   npm run camp -- hold <camp id>/<CODE> --reason "..."
 *   npm run camp -- release <camp id>/<CODE> --reason "..."
 *       Take a script before revising it (the admin cannot approve meanwhile), or give it back without a version.
 *
 *   npm run camp -- push <camp id>/<CODE> --reason "..." [--summary "..."] [--resolves <comment id>,...] [--manual]
 *       [--model claude-opus-5-5 --cost 0.42]
 *       Sends the local file as a new version on top of the latest one. Refused while the engine check finds issues.
 *       --manual marks a version written by hand in a chat (origin ClaudeManual) instead of by an API run.
 *
 *   npm run camp -- pull <camp id>/<CODE> [--version N | --approved] [--force]
 *       Writes a version's text exactly as the server keeps it into the local file (default the latest). Refused when
 *       the local file has changes the server does not have, unless --force.
 *
 *   npm run camp -- check-admin-edits [--apply]
 *       Checks every version the owner edited in the panel (CheckRequired) with the engine and, with --apply, sends the
 *       report; a clean report lets the owner approve it.
 *
 *   npm run camp -- recheck [--camp <camp id>] [--code <CODE>] [--apply]
 *       Checks the latest version of each script again, from the text the server keeps, and with --apply sends the new
 *       report (after a fix to the engine check itself; the version stays the same).
 *
 *   npm run camp -- gate --job <job.json>
 *   npm run camp -- rendered --job <job.json> [--note "..."]
 *       Whether the job's script is the approved version (the render gate, CampApprovalGate), and the render notice
 *       when a render could not send it.
 *
 *   npm run camp -- links <camp id>
 *       The camp's YouTube links as the panel has them.
 *
 * Add --json to print the API's answer as JSON.
 */
import {execSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {CAMP_CHECK_STATE, CAMP_PUBLISH_STATE, CAMP_SCRIPT_STATUS, CAMP_VERSION_ORIGIN, CampApiError, createCampApiClient, type CampCheckReport, type CampScriptRow, type CampVersionBody} from '../src/Courses/CampApiClient';
import type {CampCheckContext, CampScriptCheck} from '../src/Courses/CampScriptCheck';
import {INTRO_CODE, campSyncEntry, contentHash, readContent, readLocalCamps, type LocalCamp, type LocalCampScript} from '../src/Courses/CampSync';
import {campApprovalGate, reportCampRender} from '../src/Renderers/CampApprovalGate';

const ROOT = process.cwd();

/** The engine check loads the video templates (and three.js); only the commands that check import it. */
const scriptCheck = () => import('../src/Courses/CampScriptCheck');
const loadContext = async () => (await scriptCheck()).loadCampCheckContext(ROOT);

const {values, positionals} = parseArgs({
	allowPositionals: true,
	options: {
		apply: {type: 'boolean', default: false},
		camp: {type: 'string'},
		code: {type: 'string'},
		reason: {type: 'string'},
		summary: {type: 'string'},
		resolves: {type: 'string'},
		manual: {type: 'boolean', default: false},
		model: {type: 'string'},
		cost: {type: 'string'},
		version: {type: 'string'},
		approved: {type: 'boolean', default: false},
		force: {type: 'boolean', default: false},
		job: {type: 'string'},
		note: {type: 'string'},
		json: {type: 'boolean', default: false},
	},
});

const [command, target] = positionals;
const print = (result: unknown, text: () => string) => console.log(values.json ? JSON.stringify(result, null, 2) : text());
const status = (row: CampScriptRow) => CAMP_SCRIPT_STATUS[row.status] ?? String(row.status);

const engineCommit = (): string | undefined => {
	try {
		return execSync('git rev-parse --short HEAD', {cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore']}).toString().trim() || undefined;
	} catch {
		return undefined;
	}
};

/** The engine check of a version's text: a lesson script, or episode 0's job. */
const checkText = async (text: string, code: string, context: CampCheckContext): Promise<CampScriptCheck> => {
	const {checkCampIntroJob, checkCampScript} = await scriptCheck();
	let raw: unknown;
	try {
		raw = JSON.parse(text);
	} catch (error) {
		return {issues: [`JSON okunamadı: ${error instanceof Error ? error.message : String(error)}`], suggestions: [], stillScreens: [], warnings: [], stats: {}};
	}
	return code === INTRO_CODE ? checkCampIntroJob(raw) : checkCampScript(raw, code, context);
};

const reportOf = (check: CampScriptCheck, commit: string | undefined): CampCheckReport => ({
	issues: check.issues,
	suggestions: check.suggestions,
	stillScreens: check.stillScreens,
	warnings: check.warnings,
	checkedAt: new Date().toISOString(),
	engineCommit: commit,
});

const checkLine = (check: CampScriptCheck) =>
	`${check.issues.length} sorun · ${check.suggestions.length} öneri · ${check.stillScreens.length} duran ekran${check.seconds ? ` · ~${(check.seconds / 60).toFixed(1)} dk` : ''}`;

/** Runs `work` over `items` a few at a time; the server takes one request per script. */
const eachLimited = async <Item>(items: Item[], limit: number, work: (item: Item) => Promise<void>) => {
	let next = 0;
	await Promise.all(Array.from({length: Math.min(limit, items.length)}, async () => {
		while (next < items.length) await work(items[next++]);
	}));
};

const localCamps = (): LocalCamp[] => {
	const {camps, missing} = readLocalCamps(ROOT);
	if (missing.length > 0) console.error(`Uyarı: işi olmayan konu (sunucuya gitmez): ${missing.join(', ')}`);
	return values.camp ? camps.filter(({camp}) => camp.id === values.camp) : camps;
};

/** `<camp id>/<CODE>` → the local script and its server record. */
const resolveTarget = async (client: ReturnType<typeof createCampApiClient>, value: string | undefined) => {
	const match = value?.match(/^([a-z0-9-]+)\/([A-Z0-9_]+)$/);
	if (!match) throw new Error('Senaryo <kamp id>/<KOD> biçiminde verilir, ör. yks-tyt-matematik-kampi/MAT_USLU.');
	const [, slug, code] = match;
	const local = readLocalCamps(ROOT).camps.find(({camp}) => camp.id === slug);
	if (!local) throw new Error(`${slug}: Curriculum/Camps içinde böyle bir kamp yok.`);
	const script = local.scripts.find((item) => item.code === code);
	if (!script) throw new Error(`${slug}/${code}: kampta bu kodla bir senaryo yok.`);
	const row = (await client.camp(slug)).scripts.find((item) => item.code === code);
	if (!row) throw new Error(`${slug}/${code}: senaryo sunucuda yok; önce npm run camp -- sync --apply.`);
	return {slug, code, script, row, where: `${slug}/${code}`};
};

const versionBody = (script: LocalCampScript, check: CampScriptCheck, extra: Pick<CampVersionBody, 'baseVersionNo' | 'origin' | 'changeSummary' | 'reason'> & Partial<CampVersionBody>, commit: string | undefined): CampVersionBody => {
	const content = readContent(script.file);
	return {
		content,
		contentHash: contentHash(content),
		schemaVersion: commit,
		estimatedSeconds: check.seconds,
		stats: check.stats,
		checkReport: reportOf(check, commit),
		...extra,
	};
};

const main = async () => {
	const client = createCampApiClient();
	const commit = engineCommit();

	if (command === 'sync') {
		const entries = localCamps().map(campSyncEntry);
		const result = await client.sync(entries, !values.apply);
		print(result, () =>
			[
				`${result.dryRun ? 'Deneme (yazılmadı; yazmak için --apply)' : result.applied ? 'Yazıldı' : 'Yazılmadı'} · ${entries.length} kamp`,
				`kamp: +${result.campsCreated} ~${result.campsUpdated} · senaryo: +${result.scriptsCreated} ~${result.scriptsUpdated}`,
				...result.changes.map((change) => `  ${change}`),
				...(result.notInEngine.length ? ['Sunucuda olup motorda olmayan:', ...result.notInEngine.map((item) => `  ${item}`)] : []),
				...(result.errors.length ? ['Hatalar:', ...result.errors.map((error) => `  ! ${error}`)] : []),
			].join('\n'),
		);
		if (result.errors.length) process.exitCode = 1;
	} else if (command === 'import') {
		const context = await loadContext();
		const lines: string[] = [];
		let sent = 0;
		let failed = 0;
		for (const local of localCamps()) {
			let rows: CampScriptRow[];
			try {
				rows = (await client.camp(local.camp.id)).scripts;
			} catch (error) {
				if (error instanceof CampApiError && error.status === 404) {
					lines.push(`! ${local.camp.id}: sunucuda yok; önce sync --apply.`);
					failed++;
					continue;
				}
				throw error;
			}
			await eachLimited(local.scripts, 4, async (script) => {
				const where = `${local.camp.id}/${script.code}`;
				const row = rows.find((item) => item.code === script.code);
				if (!row) {
					lines.push(`! ${where}: sunucuda kaydı yok (sync).`);
					failed++;
					return;
				}
				if (row.latestVersionNo > 0) return;
				const check = await checkText(readContent(script.file), script.code, context);
				const body = versionBody(script, check, {baseVersionNo: 0, origin: CAMP_VERSION_ORIGIN.imported, changeSummary: 'İlk aktarım: motordaki senaryo', reason: null}, commit);
				const validation = await client.validateVersion(row.id, body);
				const mikros = validation.mikros ? ` · mikro ${validation.mikros.covered} işlendi, ${validation.mikros.missing.length} eksik` : '';
				if (!validation.isValid) {
					lines.push(`! ${where}: ${validation.errors.join(' | ')}`);
					failed++;
					return;
				}
				if (values.apply) await client.createVersion(row.id, body);
				sent++;
				lines.push(`${values.apply ? '✓' : '·'} ${where}: ${checkLine(check)}${mikros}`);
			});
		}
		lines.sort((a, b) => a.slice(2).localeCompare(b.slice(2), 'tr'));
		console.log([...lines, `${values.apply ? 'Gönderildi' : 'Geçerli (gönderilmedi; göndermek için --apply)'}: ${sent} · sorunlu: ${failed}`].join('\n'));
		if (failed) process.exitCode = 1;
	} else if (command === 'status') {
		const out: string[] = [];
		for (const local of localCamps()) {
			const detail = await client.camp(local.camp.id).catch((error: unknown) => {
				if (error instanceof CampApiError && error.status === 404) return undefined;
				throw error;
			});
			if (!detail) {
				out.push(`${local.camp.id}: sunucuda yok`);
				continue;
			}
			out.push(`${local.camp.id}`);
			for (const row of [...detail.scripts].sort((a, b) => a.number - b.number)) {
				const flags = [row.needsRerender ? 'yeniden render' : '', row.publishState !== undefined ? (CAMP_PUBLISH_STATE[row.publishState] ?? '') : '', row.checkState !== undefined ? (CAMP_CHECK_STATE[row.checkState] ?? '') : ''].filter(Boolean);
				out.push(`  ${String(row.number).padStart(2)} ${row.code.padEnd(22)} ${status(row).padEnd(16)} son v${row.latestVersionNo} · onaylı ${row.approvedVersionNo ? `v${row.approvedVersionNo}` : '-'} · render ${row.renderedVersionNo ? `v${row.renderedVersionNo}` : '-'}${flags.length ? ` · ${flags.join(' · ')}` : ''}`);
			}
		}
		console.log(out.join('\n'));
	} else if (command === 'todo') {
		const todo = await client.todo();
		const row = (item: CampScriptRow & {campSlug?: string}) => `  ${item.campSlug ? `${item.campSlug}/` : ''}${item.code} (${status(item)}, son v${item.latestVersionNo})${item.reviewNote ? `\n      not: ${item.reviewNote}` : ''}`;
		print(todo, () =>
			[
				`Değişiklik istenen: ${todo.changesRequested.length}`,
				...todo.changesRequested.map(row),
				`Açık yorum: ${todo.openComments.length}`,
				...todo.openComments.map((item) => `  ${item.campSlug}/${item.code} [${item.comment.anchor ?? '-'}] ${item.comment.body}${item.comment.quote ? `\n      alıntı: "${item.comment.quote}"` : ''}\n      yorum id: ${item.comment.id}`),
				`Admin düzeltmesi denetim bekliyor: ${todo.checkRequired.length}`,
				...todo.checkRequired.map(row),
				`Yeniden render gerekir: ${todo.needsRerender.length}`,
				...todo.needsRerender.map(row),
			].join('\n'),
		);
	} else if (command === 'hold' || command === 'release') {
		if (!values.reason) throw new Error('--reason gerekli.');
		const {row, where} = await resolveTarget(client, target);
		const result = command === 'hold' ? await client.hold(row.id, row.rowVersion, values.reason) : await client.release(row.id, row.rowVersion, values.reason);
		print(result, () => `${where}: ${status(result)}`);
	} else if (command === 'push') {
		const {script, row, where} = await resolveTarget(client, target);
		if (!values.reason) throw new Error('--reason gerekli: bu sürüm neden yazıldı.');
		const check = await checkText(readContent(script.file), script.code, await loadContext());
		if (check.issues.length > 0) throw new Error(`${where}: motor denetimi sorun buldu, önce düzelt:\n${check.issues.map((issue) => `  ! ${issue}`).join('\n')}`);
		const body = versionBody(
			script,
			check,
			{
				baseVersionNo: row.latestVersionNo,
				origin: values.manual ? CAMP_VERSION_ORIGIN.claudeManual : CAMP_VERSION_ORIGIN.claudeApi,
				changeSummary: values.summary ?? values.reason,
				reason: values.reason,
				resolvesCommentIds: values.resolves ? values.resolves.split(',').map((id) => id.trim()).filter(Boolean) : [],
				model: values.model,
				costUsd: values.cost ? Number(values.cost) : undefined,
			},
			commit,
		);
		const validation = await client.validateVersion(row.id, body);
		if (validation.duplicateOfVersionNo) throw new Error(`${where}: yerel dosya zaten v${validation.duplicateOfVersionNo}.`);
		if (!validation.isValid) throw new Error(`${where}: sunucu kabul etmedi:\n${validation.errors.map((error) => `  ! ${error}`).join('\n')}`);
		const result = await client.createVersion(row.id, body);
		print(result, () => `✓ ${where}: v${result.latestVersionNo} (${status(result)}) · ${checkLine(check)}`);
	} else if (command === 'pull') {
		const {script, row, where} = await resolveTarget(client, target);
		const version = values.approved ? await client.approved(row.id) : await client.version(row.id, values.version ? Number(values.version) : row.latestVersionNo);
		const localText = readContent(script.file);
		const localHash = contentHash(localText);
		if (localHash === version.contentHash) {
			console.log(`${where}: yerel dosya zaten v${version.versionNo}.`);
			return;
		}
		if (!values.force && row.latestVersionNo > 0) {
			const latest = version.versionNo === row.latestVersionNo ? version : await client.version(row.id, row.latestVersionNo);
			const known = latest.contentHash === localHash || (row.approvedVersionNo ? (await client.approved(row.id)).contentHash === localHash : false);
			if (!known) throw new Error(`${where}: ${path.relative(ROOT, script.file)} sunucudaki son ya da onaylı sürümle aynı değil; gönderilmemiş değişiklik olabilir. Önce push, ya da bilerek --force.`);
		}
		writeFileSync(script.file, version.content, 'utf8');
		console.log(`✓ ${where}: v${version.versionNo} → ${path.relative(ROOT, script.file)}`);
	} else if (command === 'check-admin-edits') {
		const todo = await client.todo();
		if (todo.checkRequired.length === 0) {
			console.log('Denetim bekleyen admin düzeltmesi yok.');
			return;
		}
		const context = await loadContext();
		for (const row of todo.checkRequired as (CampScriptRow & {campSlug?: string})[]) {
			const version = await client.version(row.id, row.latestVersionNo);
			const check = await checkText(version.content, row.code, context);
			const where = `${row.campSlug ? `${row.campSlug}/` : ''}${row.code} v${version.versionNo}`;
			console.log(`${values.apply ? '✓' : '·'} ${where}: ${checkLine(check)}`);
			check.issues.forEach((issue) => console.log(`    ! ${issue}`));
			if (values.apply) await client.checkReport(row.id, version.versionNo, row.rowVersion, reportOf(check, commit));
		}
		if (!values.apply) console.log('Rapor gönderilmedi; göndermek için --apply.');
	} else if (command === 'recheck') {
		const context = await loadContext();
		const lines: string[] = [];
		for (const local of localCamps()) {
			const rows = (await client.camp(local.camp.id)).scripts.filter((row) => row.latestVersionNo > 0 && (!values.code || row.code === values.code));
			await eachLimited(rows, 4, async (row) => {
				const version = await client.version(row.id, row.latestVersionNo);
				const check = await checkText(version.content, row.code, context);
				if (values.apply) await client.checkReport(row.id, version.versionNo, row.rowVersion, reportOf(check, commit), 'Motor denetimi düzeltildi; rapor yenilendi');
				lines.push(`${values.apply ? '✓' : '·'} ${local.camp.id}/${row.code} v${version.versionNo}: ${checkLine(check)}`);
			});
		}
		lines.sort((a, b) => a.slice(2).localeCompare(b.slice(2), 'tr'));
		console.log([...lines, values.apply ? `Rapor yenilendi: ${lines.length}` : 'Rapor gönderilmedi; göndermek için --apply.'].join('\n'));
	} else if (command === 'gate' || command === 'rendered') {
		if (!values.job) throw new Error('--job <job.json> gerekli.');
		const gate = await campApprovalGate(values.job, {client, force: true});
		if (gate.issues.length > 0) throw new Error(gate.issues.join('\n'));
		if (!gate.approval) {
			console.log(`${values.job}: kamp senaryosu okuyan bir iş değil.`);
			return;
		}
		const where = `${gate.approval.campSlug}/${gate.approval.code}`;
		if (command === 'gate') {
			console.log(`✓ ${where}: yerel dosya onaylı v${gate.approval.versionNo}; render edilebilir.`);
			return;
		}
		if (!gate.approval.reported) throw new Error(`${where}: render bildirimi yalnız YouTube videosu için gönderilir.`);
		await reportCampRender(gate.approval, values.note, client);
		console.log(`✓ ${where}: v${gate.approval.versionNo} render edildi olarak bildirildi.`);
	} else if (command === 'links') {
		if (!target) throw new Error('Kamp id gerekli.');
		const links = await client.links(target);
		print(links, () =>
			[`${links.slug}${links.playlistUrl ? ` · ${links.playlistUrl}` : ''}`, ...links.lessons.map((lesson) => `  ${String(lesson.number).padStart(2)} ${lesson.title.padEnd(36)} ${CAMP_PUBLISH_STATE[lesson.publishState] ?? lesson.publishState} ${lesson.youTubeUrl ?? ''}`)].join('\n'),
		);
	} else {
		console.error('Komut: sync | import | status | todo | hold | release | push | pull | check-admin-edits | recheck | gate | rendered | links');
		process.exitCode = 2;
	}
};

try {
	await main();
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	// exitCode, not exit(): exiting while fetch's handles close trips a libuv assertion on Windows.
	process.exitCode = 1;
}
