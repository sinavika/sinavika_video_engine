/**
 * Exports the UI/UX drawings (src/UIUX): every screen as a PNG and one board
 * per group.
 *
 *   npm run uiux                                  (all screens and boards, Turkish, light and dark, to Desktop\Sinavika-UIUX3)
 *   npm run uiux -- --mode light | dark | both    (light under acik/, dark under koyu/: never mixed)
 *   npm run uiux -- --only m-hub --only w-panel   (ids starting with these)
 *   npm run uiux -- --lang en                     (English copies under en/)
 *   npm run uiux -- --no-boards | --boards-only
 *   npm run uiux -- --list                        (id, route and title of every drawing)
 *   npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md   (writes the screen inventory and exits)
 *
 * Mobile screens are written at 3x (1170 x 2532), web and site at 2x.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import {UI_SCREENS, type UIPlatform} from '../src/UIUX/Registry';
import {UI_CANVAS, type UILang, type UIMode} from '../src/UIUX/Tokens';
import {UIUX_BOARD_ID, UIUX_SCREEN_ID, type UIUXBoardProps, type UIUXScreenProps} from '../src/UIUX/UIUXProps';

const {values} = parseArgs({
	options: {
		out: {
			type: 'string',
			default: path.join(process.env.USERPROFILE ?? '', 'Desktop', 'Sinavika-UIUX3'),
		},
		only: {type: 'string', multiple: true},
		lang: {type: 'string', default: 'tr'},
		mode: {type: 'string', default: 'both'},
		'no-boards': {type: 'boolean', default: false},
		'boards-only': {type: 'boolean', default: false},
		list: {type: 'boolean', default: false},
		inventory: {type: 'string'},
	},
});

if (values.inventory) {
	const platforms: [UIPlatform, string][] = [
		['mobile', 'Mobil uygulama'],
		['web', 'Web paneli ve web giriş/onboarding'],
		['site', 'Web sitesi (giriş öncesi)'],
	];
	const lines = [
		'# Sınavika UI/UX ekran envanteri',
		'',
		'Bu dosya `npm run uiux -- --inventory docs/UIUX/Ekran-Envanteri.md` ile çizim kaydından (`src/UIUX/Registry.ts`) üretilir; elle düzenlenmez.',
		'Her satır bir çizimi, gerçek uygulamadaki karşılığını ("Rota") ve değişikliğin nedenini gösterir. "yeni" bugün olmayan ekrandır.',
		'',
		`Toplam ${UI_SCREENS.length} çizim: ${platforms.map(([platform, label]) => `${label.toLocaleLowerCase('tr-TR')} ${UI_SCREENS.filter((screen) => screen.platform === platform).length}`).join(', ')}.`,
		'',
	];
	for (const [platform, label] of platforms) {
		lines.push(`## ${label}`, '');
		let group = '';
		for (const screen of UI_SCREENS.filter((entry) => entry.platform === platform)) {
			if (screen.group !== group) {
				group = screen.group;
				lines.push('', `### ${group}`, '', '| Kimlik | Ekran | Rota | Not |', '|---|---|---|---|');
			}
			lines.push(`| \`${screen.id}\` | ${screen.title} | \`${screen.route}\` | ${screen.note || '—'} |`);
		}
		lines.push('');
	}
	await mkdir(path.dirname(path.resolve(values.inventory)), {
		recursive: true,
	});
	await writeFile(values.inventory, `${lines.join('\n')}\n`, 'utf8');
	console.log(`✓ ${values.inventory} · ${UI_SCREENS.length} ekran`);
	process.exit(0);
}

if (values.list) {
	for (const screen of UI_SCREENS) console.log(`${screen.id.padEnd(34)} ${screen.route.padEnd(42)} ${screen.title}`);
	process.exit(0);
}

const FOLDER: Record<UIPlatform, string> = {
	mobile: 'mobil',
	web: 'web-panel',
	site: 'web-site',
};
const BOARD_COLUMNS: Record<UIPlatform, number> = {
	mobile: 5,
	web: 3,
	site: 4,
};
const langs = (values.lang === 'both' ? ['tr', 'en'] : [values.lang]) as UILang[];
const modes = (values.mode === 'both' ? ['light', 'dark'] : [values.mode]) as UIMode[];
const MODE_FOLDER: Record<UIMode, string> = {light: 'acik', dark: 'koyu'};
const selected = UI_SCREENS.filter((screen) => !values.only || values.only.some((prefix) => screen.id.startsWith(prefix)));

const serveUrl = await bundleProject();
const browser = await openBrowser('chrome', {
	chromiumOptions: {gl: 'angle'},
});
let count = 0;

for (const lang of langs)
	for (const mode of modes) {
		const root = path.join(values.out, ...(lang === 'tr' ? [] : ['en']), MODE_FOLDER[mode]);
		if (!values['boards-only']) {
			for (const screen of selected) {
				const inputProps: UIUXScreenProps = {id: screen.id, lang, mode};
				const output = path.resolve(root, FOLDER[screen.platform], `${screen.id}.png`);
				await mkdir(path.dirname(output), {recursive: true});
				const composition = await selectComposition({
					serveUrl,
					id: UIUX_SCREEN_ID,
					inputProps,
					puppeteerInstance: browser,
				});
				const scale = screen.platform === 'mobile' ? UI_CANVAS.mobile.scale : UI_CANVAS.web.scale;
				await renderStill({
					composition,
					serveUrl,
					output,
					inputProps,
					imageFormat: 'png',
					scale,
					puppeteerInstance: browser,
					chromiumOptions: {gl: 'angle'},
				});
				count += 1;
				console.log(`✓ ${path.relative(values.out, output)}  ${composition.width * scale}x${composition.height * scale}`);
			}
		}
		if (!values['no-boards']) {
			const groups = new Map<string, typeof selected>();
			for (const screen of selected) groups.set(`${screen.platform}|${screen.group}`, [...(groups.get(`${screen.platform}|${screen.group}`) ?? []), screen]);
			let index = 0;
			for (const [key, screens] of groups) {
				index += 1;
				const [platform, group] = key.split('|') as [UIPlatform, string];
				const inputProps: UIUXBoardProps = {
					ids: screens.map((screen) => screen.id),
					title: group,
					lang,
					mode,
					columns: Math.min(BOARD_COLUMNS[platform], screens.length),
				};
				const slug = group
					.toLocaleLowerCase('tr-TR')
					.replace(/ı/g, 'i')
					.replace(/ğ/g, 'g')
					.replace(/ü/g, 'u')
					.replace(/ş/g, 's')
					.replace(/ö/g, 'o')
					.replace(/ç/g, 'c')
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, '');
				const output = path.resolve(root, 'panolar', `${String(index).padStart(2, '0')}-${FOLDER[platform]}-${slug}.png`);
				await mkdir(path.dirname(output), {recursive: true});
				const composition = await selectComposition({
					serveUrl,
					id: UIUX_BOARD_ID,
					inputProps,
					puppeteerInstance: browser,
				});
				await renderStill({
					composition,
					serveUrl,
					output,
					inputProps,
					imageFormat: 'png',
					scale: 1.5,
					puppeteerInstance: browser,
					chromiumOptions: {gl: 'angle'},
				});
				count += 1;
				console.log(`✓ ${path.relative(values.out, output)}  ${Math.round(composition.width * 1.5)}x${Math.round(composition.height * 1.5)}`);
			}
		}
	}

await browser.close({silent: true});
console.log(`${count} görsel → ${values.out}`);
process.exit(0);
