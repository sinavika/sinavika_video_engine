/**
 * Layout audit of every UI/UX drawing (src/UIUX/LayoutAudit.ts): each screen is
 * drawn in Chrome in Turkish and English, light and dark, and its DOM is
 * measured for cut text, text under the status bar / tab bar / bottom bar,
 * page content showing below the floating tab bar, text covered by other
 * parts, and low contrast (owner, 16 Nov 2026).
 *
 *   npm run uiux-audit                                  (all screens; report to Outputs/Checks/UIUX-Denetim.md)
 *   npm run uiux-audit -- --only m-plan --lang tr --mode light
 *
 * Exits with 1 when an error ("hata") is found; warnings ("uyarı") are read by eye.
 */
import {mkdir, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import type {AuditFinding} from '../src/UIUX/LayoutAudit';
import {UI_SCREENS} from '../src/UIUX/Registry';
import type {UILang, UIMode} from '../src/UIUX/Tokens';
import {UIUX_SCREEN_ID, type UIUXScreenProps} from '../src/UIUX/UIUXProps';

const {values} = parseArgs({options: {only: {type: 'string', multiple: true}, lang: {type: 'string'}, mode: {type: 'string'}, report: {type: 'string', default: path.join('Outputs', 'Checks', 'UIUX-Denetim.md')}}});
const langs = (values.lang ? [values.lang] : ['tr', 'en']) as UILang[];
const modes = (values.mode ? [values.mode] : ['light', 'dark']) as UIMode[];
// Share cards are pictures, not app screens with bars; watch faces are checked like the rest.
const screens = UI_SCREENS.filter((screen) => !values.only || values.only.some((prefix) => screen.id.startsWith(prefix)));

const scratch = path.join(os.tmpdir(), 'sinavika-uiux-audit');
await mkdir(scratch, {recursive: true});
const serveUrl = await bundleProject();
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
type Row = {id: string; lang: UILang; mode: UIMode} & AuditFinding;
const rows: Row[] = [];
let done = 0;
for (const screen of screens)
	for (const lang of langs)
		for (const mode of modes) {
			const inputProps: UIUXScreenProps = {id: screen.id, lang, mode, audit: true};
			const composition = await selectComposition({serveUrl, id: UIUX_SCREEN_ID, inputProps, puppeteerInstance: browser});
			let findings: AuditFinding[] | null = null;
			await renderStill({
				composition,
				serveUrl,
				output: path.join(scratch, 'still.png'),
				inputProps,
				scale: 0.1,
				puppeteerInstance: browser,
				chromiumOptions: {gl: 'angle'},
				onBrowserLog: (log) => {
					if (log.text.startsWith('UIUX_AUDIT ')) findings = JSON.parse(log.text.slice('UIUX_AUDIT '.length)) as AuditFinding[];
				},
			});
			if (findings === null) throw new Error(`${screen.id} ${lang} ${mode}: denetim sonucu gelmedi`);
			for (const finding of findings as AuditFinding[]) rows.push({id: screen.id, lang, mode, ...finding});
			done += 1;
			const errors = (findings as AuditFinding[]).filter((f) => f.level === 'hata').length;
			console.log(`${errors ? '✗' : '✓'} ${screen.id} ${lang} ${mode}${errors ? `  ${errors} hata` : ''}`);
		}
await browser.close({silent: true});
await rm(scratch, {recursive: true, force: true});

const errors = rows.filter((row) => row.level === 'hata');
const warnings = rows.filter((row) => row.level === 'uyarı');
const table = (list: Row[]) => ['| Ekran | Dil | Mod | Tür | Metin | Ayrıntı |', '|---|---|---|---|---|---|', ...list.map((r) => `| ${r.id} | ${r.lang} | ${r.mode === 'light' ? 'açık' : 'koyu'} | ${r.kind} | ${r.text.replace(/\|/g, '/')} | ${r.detail.replace(/\|/g, '/')} |`)].join('\n');
const report = ['# UI/UX düzen denetimi', '', `\`npm run uiux-audit\` ile üretilir (scripts/AuditUIUX.ts, src/UIUX/LayoutAudit.ts); elle düzenlenmez. ${new Date().toISOString().slice(0, 10)}.`, '', `${done} çizim (ekran × dil × mod) denetlendi: ${errors.length} hata, ${warnings.length} uyarı.`, '', '## Hatalar', '', errors.length ? table(errors) : 'Yok.', '', '## Uyarılar (gözle okunur; bazı üst üste binmeler bilinçlidir)', '', warnings.length ? table(warnings) : 'Yok.', ''].join('\n');
await mkdir(path.dirname(values.report), {recursive: true});
await writeFile(values.report, report, 'utf8');
console.log(`${done} çizim: ${errors.length} hata, ${warnings.length} uyarı → ${values.report}`);
process.exit(errors.length ? 1 : 0);
