/**
 * Shows the renders running now and the ones that ended in the last day, from the status files every render writes
 * (Outputs/Checks/RenderStatus, RenderEstimate). For watching a long render from another window or session.
 *
 *   npm run render-status
 *   npm run render-status -- --json
 */
import {parseArgs} from 'node:util';
import {formatDuration, readRenderStatuses, statusLine, type RenderStatusFile} from '../src/Renderers/RenderEstimate';

const {values} = parseArgs({options: {json: {type: 'boolean', default: false}}});

/** A running render whose file has not been rewritten for this long has probably stopped (killed, machine asleep). */
const STALE_MILLISECONDS = 3 * 60_000;
const RECENT_MILLISECONDS = 24 * 3600_000;

const now = Date.now();
const age = (status: RenderStatusFile) => now - Date.parse(status.updatedAt);
const statuses = readRenderStatuses().filter((status) => status.state === 'running' || age(status) < RECENT_MILLISECONDS);
const running = statuses.filter((status) => status.state === 'running').sort((a, b) => a.startedAt.localeCompare(b.startedAt));
const ended = statuses.filter((status) => status.state !== 'running').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

if (values.json) {
	console.log(JSON.stringify({running, ended}, null, 2));
} else if (statuses.length === 0) {
	console.log('Çalışan ya da son 24 saatte biten render yok.');
} else {
	if (running.length > 0) console.log(`Çalışan render: ${running.length}`);
	for (const status of running) {
		// Time has passed since the file was written: what was left then is shorter now.
		const since = age(status) / 1000;
		const shown = {...status, elapsedSeconds: status.elapsedSeconds + since, remainingSeconds: status.remainingSeconds === undefined ? undefined : Math.max(0, status.remainingSeconds - since)};
		console.log(`\n  ${status.name}${status.output ? `\n  ${status.output}` : ''}\n  ${statusLine(shown)}`);
		if (age(status) > STALE_MILLISECONDS) console.log(`  ! ${formatDuration(age(status) / 1000)} önce güncellendi; süreç (pid ${status.pid}) durmuş olabilir.`);
	}
	if (ended.length > 0) console.log(`\nSon 24 saatte biten: ${ended.length}`);
	for (const status of ended) {
		const when = new Date(status.updatedAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
		console.log(`  ${status.state === 'done' ? '✓' : '✗'} ${status.name} · ${formatDuration(status.elapsedSeconds)} · ${when}${status.message ? ` · ${status.message.slice(0, 120)}` : ''}`);
	}
}
